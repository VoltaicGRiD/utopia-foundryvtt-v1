import { isNumeric, shortToLong, calculateTraitFavor, utopiaTraits, searchTraits } from "../helpers/_module.mjs";
import { UtopiaRollDialog } from "../sheets/utility/roll-dialog.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure
 * which is ideal for the Simple system.
 * @extends {Actor}
 */
export class UtopiaActor extends Actor {
  /** @override */
  prepareData() {
    // Call the base implementation to reset data, process active effects,
    // and set up derived data.
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this phase occur before embedded documents are processed.
    // Currently no additional modifications are done here.
  }

  /**
   * Augment the actor source data with additional dynamic data.
   * This is where calculated values (like ability modifiers) are added.
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Override getRollData() to supply all necessary data for dice formulas.
   */
  getRollData() {
    // Start with a shallow copy of the actor's system data.
    const data = { ...this.system };
  
    // Copy traits to the top level so that roll formulas (e.g., "@str.mod + 4") work.
    if (data.traits) {
      for (let [k, v] of Object.entries(data.traits)) {
        // Store both the original key and its longer name version.
        data[k] = foundry.utils.deepClone(v);
        data[shortToLong(k)] = foundry.utils.deepClone(v);
        // Also copy subtraits for direct access.
        for (let [k2, v2] of Object.entries(data.traits[k].subtraits)) {
          data[k2] = foundry.utils.deepClone(v2);
          data[shortToLong(k2)] = foundry.utils.deepClone(v2);
        }
      }
    }

    // Convert block and dodge resources into dice string format.
    if (data.block) {
      data.block = data.block.quantity.total + 'd' + data.block.size.total;
    }
    if (data.dodge) {
      data.dodge = data.dodge.quantity.total + 'd' + data.dodge.size.total;
    }

    // Sum up points for talents.
    data.talents = {};
    this.items.filter(f => f.type === 'talent').forEach(t => {
      data.talents[t.name] = parseInt(t.system.points.body) + parseInt(t.system.points.mind) + parseInt(t.system.points.soul);
    });

    // Mark specialist talents.
    data.specialists = {};
    this.items.filter(f => f.type === 'specialistTalent').forEach(t => {
      data.specialists[t.name] = 1;
    });
    
    // Additional roll data based on actor type.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    console.log(data);
    
    return data;
  }

  /**
   * Prepare roll data specific to character actors.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
    // Additional character-specific calculations can be added here.
  }

  /**
   * Prepare roll data specific to NPC actors.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
    // Process any NPC-specific data here.
  }

  async rest() {
    // Recover actor resources that are set to recover on rest.
    const resources = this.system.actorResources.filter(r => r.recoverInterval === "rest");
    
    resources.forEach(async r => {
      let recoverAmount = r.recoverAmount;
      // A recover amount of 0 means full recovery.
      if (recoverAmount === 0) recoverAmount = 999;
      const max = r.max.total;
      if (isNaN(parseInt(r.amount))) r.amount = 0;
      r.amount = Math.min(parseInt(r.amount) + recoverAmount, max);
    });

    // Update various actor resources to their maximum values.
    await this.update({
      'system.shp.value': this.system.shp.max,
      'system.stamina.value': this.system.stamina.max,
      'system.actions.turn.value': this.system.actions.turn.max,
      'system.actions.interrupt.value': this.system.actions.interrupt.max,
      'system.actorResources': resources,
    });

    // Also process recovery for resources on items.
    const items = this.items.filter(i => i.system.resources && i.system.resources.length > 0);
    for (const item of items) {
      const resources = item.system.resources.filter(r => r.recoverInterval === "rest");
      resources.forEach(async r => {
        let recoverAmount = r.recoverAmount;
        if (recoverAmount === 0) recoverAmount = 999;
        const max = r.max.total;
        if (isNaN(parseInt(r.amount))) r.amount = 0;
        r.amount = Math.min(parseInt(r.amount) + recoverAmount, max);
      });

      await item.update({
        'system.resources': resources
      });
    }
  }

  async clearSpecies() {
    // Remove any species items and reset gifted trait flags.
    const species = this.system.species;
    const speciesItem = this.items.filter(i => i.type === "species");

    if (speciesItem.length > 0) {
      for (const item of speciesItem) {
        await this.deleteEmbeddedDocuments("Item", [item._id]);
      }
    }

    // Reset gifted flags for all trait subcategories.
    await this.update({
      'system.traits.agi.subtraits.spd.gifted': false,
      'system.traits.agi.subtraits.dex.gifted': false,
      'system.traits.str.subtraits.pow.gifted': false,
      'system.traits.str.subtraits.for.gifted': false,
      'system.traits.int.subtraits.eng.gifted': false,
      'system.traits.int.subtraits.mem.gifted': false,
      'system.traits.wil.subtraits.res.gifted': false,
      'system.traits.wil.subtraits.awa.gifted': false,
      'system.traits.dis.subtraits.por.gifted': false,
      'system.traits.dis.subtraits.stu.gifted': false,
      'system.traits.cha.subtraits.app.gifted': false,
      'system.traits.cha.subtraits.lan.gifted': false,
    });
  }

  async finalizeRoll(roll, rollData = {}, templateOptions = {}) {
    let template = '';
    let templateData = {};

    // If rolling for a trait check, set up the appropriate template.
    if (rollData.type === "trait") {
      const trait = searchTraits(this, rollData.trait);
      const gifted = rollData.rollData?.[trait]?.gifted
        ?? this.getRollData()?.[trait]?.gifted
        ?? false;

      console.log(roll);

      // Ensure automated options are only used once.
      if (templateOptions.automate || templateOptions.request) {
        templateOptions.automate = false;
        templateOptions.request = false;
      }

      template = 'systems/utopia/templates/chat/check-card.hbs';
      templateData = foundry.utils.mergeObject(templateOptions, {
        actor: this,
        data: this.getRollData(),
        formula: roll.formula,
        icon: trait.icon,
        trait: trait.name, 
        total: roll.total,
        result: roll.result,
        flavor: this.name + " performs a " + trait.name + " check!",
        tooltip: await roll.getTooltip(),
        gifted: gifted,
        toBeat: rollData.toBeat ?? templateOptions.toBeat ?? null,
        success: roll.total >= (rollData.toBeat ?? templateOptions.toBeat ?? null),
      });
    }
        
    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
      sound: CONFIG.sounds.dice,
    });

    await UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async performCheck(trait, data = {}) {
    // Calculate favor values which may adjust the dice pool.
    const favors = calculateTraitFavor(trait, this.system.disfavors, this.system.favors);
    const favor = {
      net: favors[0] ?? 0,
      disfavor: favors[1] ?? 0,
      favor: favors[2] ?? 0,
    };

    // Roll a dice pool: 3 base dice plus any net favor, then add the trait modifier.
    const roll = await new Roll(`${3 + favor.net}d6 + @${trait}.mod`, this.getRollData()).evaluate();

    // If no dialog is requested, finalize the roll immediately.
    if (data?.noDialog === true) {
      this.finalizeRoll(roll, { 
        type: "trait", 
        trait: trait, 
        toBeat: data.toBeat ?? null, 
        success: (data.toBeat ? roll.total >= data.toBeat : true) ?? null 
      }, data.system.templateOptions ?? data.system.templateData ?? {});
      if (data.toBeat) 
        return roll.total >= data.toBeat;
      return;
    }

    const traitData = searchTraits(this, trait);

    // Otherwise, open a roll dialog for the check.
    new UtopiaRollDialog({}).render({
      force: true,
      parts: ['content'],
      actor: this,
      trait: trait,
      type: 'trait',
      roll: roll,
      rollData: this.getRollData(),
      description: "Roll to perform a " + traitData.name + " check!",
      favor: favor,
      flavor: data.flavor,
      templateOptions: data?.system?.templateOptions ?? data?.system?.templateData ?? {}
    });
  }

  async spendStamina(cost) {
    // If spending stamina would drop below zero, apply remaining damage as DHP.
    if (this.system.stamina.value - cost < 0) {
      const remaining = cost - this.system.stamina.value;
      this.applyDamage({
        damage: remaining,
        type: "dhp"
      }, noActionResponse = true);
    }
  }

  async castSpell(spell) {
    let cost = spell.system.cost;
    let rollData = this.getRollData();
    console.log("Casting spell!", spell, cost, rollData);

    // Apply any discount to the spell cost.
    if (rollData.castDiscount) {
      cost = Math.max(spell.system.cost - rollData.castDiscount, 1);
    }

    if (this.system.spellcap.total >= cost) {
      if (this.system.stamina.value - cost >= 0) {
        await this.update({
          ['system.stamina.value']: this.system.stamina.value - cost
        });
      }
      else {
        // Prompt the user if casting without enough stamina will cause damage.
        const remaining = cost - this.system.stamina.value;
        const proceed = await foundry.applications.api.DialogV2.confirm({
          content: `You don't have enough stamina! Casting this spell anyway will deal ${remaining} DHP damage to you. Select 'Yes' to cast anyways.`,
          rejectClose: false,
          modal: true
        });
        if ( proceed ) {
          await this.update({
            ['system.stamina.value']: 0
          });
          await this.applyDamage({
            damage: remaining,
            type: "dhp"
          }, true);
        }
        else {
          return ui.notifications.log("You chose not to cast this spell.");
        }
      }
    } else {
      ui.notifications.error("Your spellcap is too low to cast this spell!");
    }

    // After paying the cost, roll the spell.
    spell.roll();
  }

  async performAction(action, data = {}, chatMessage = {}) {
    console.log(action, data, chatMessage);

    // If in combat, handle combat-specific action costs.
    if (this.inCombat) {
      // Sometimes an action has its cost defined as a system property, and
      // sometimes it's defined as a top-level property.

      let canPerform = false;

      if (action.system.cost) {
        if (typeof action.system.cost === "number") {
          canPerform = await this.handleCombatActions(action.system.cost, data, chatMessage);
        }
        else if (isNumeric(action.system.cost)) {
          canPerform = await this.handleCombatActions(parseInt(action.system.cost), data, chatMessage);
        }
      }

      else if (action.cost) {
        if (typeof action.cost === "number") {
          canPerform = await this.handleCombatActions(action.cost, data, chatMessage);
        }
        else if (isNumeric(action.cost)) {
          canPerform = await this.handleCombatActions(parseInt(action.cost), data, chatMessage);
        }
      }

      else {
        // If no cost is defined, allow the action.
        canPerform = true;
      }
      if (!canPerform) return;
    }

    const system = action.system;
    let formula = system.formula;

    // If a formula is provided, process any custom terms (placeholders starting with #).
    if (formula.length > 0) {
      const customTerms = /#([a-z]+)/gi;
      const matches = formula.matchAll(customTerms);
      for (const match of matches) {
        const term = match[1];
        if (isNumeric(data[term]) || typeof data[term] === 'number') {
          formula = formula.replace(`#${term}`, data[term]);
        }
      }

      // Remove any remaining unmatched custom term segments.
      if (formula.includes('#')) {
        const re = /(#[a-z]+[-+*/])/gi;
        const matches = formula.matchAll(re);
        for (const match of matches) {
          const term = match[1];
          formula = formula.replace(term, '');
        }
      }

      let rollData = this.getRollData();
      let roll = await new Roll(formula, rollData).roll();
      let tooltip = await roll.getTooltip();
      roll.tooltip = tooltip;

      if (Object.keys(chatMessage).length !== 0) {
        // If a chat message was provided, update it with the roll results.
        const template = "systems/utopia/templates/chat/trigger-card.hbs";
        const data = {
          actor: this,
          formula: formula,
          tooltip: tooltip,
          total: roll.total,
        };
        await chatMessage.update({
          content: await renderTemplate(template, data),
          rollMode: game.settings.get('core', 'rollMode'),
          sound: CONFIG.sounds.dice,
        });
      } else {
        // Otherwise, send a new chat message with the roll.
        await roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: `${this.name} performs ${action.name}!`,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      }
    }

    else if (system.macro.length > 0) {
      // Execute the macro if defined.
      const macro = await fromUuid(system.macro);
      if (macro) {
        await macro.execute({restActor: this});
      }

      const template = "systems/utopia/templates/chat/action-card.hbs";
      const data = {
        actor: this,
        action: action,
        flavor: `${this.name} performs ${action.name}!`,
      };
      const html = await renderTemplate(template, data);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: html,
        rollMode: game.settings.get('core', 'rollMode'),
        sound: CONFIG.sounds.notification
      });
    }

    else {
      // If neither a formula nor macro is defined, simply display an action card.
      const template = "systems/utopia/templates/chat/action-card.hbs";
      const data = {
        actor: this,
        action: action,
        flavor: `${this.name} performs ${action.name}!`,
      };
      const html = await renderTemplate(template, data);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: html,
        rollMode: game.settings.get('core', 'rollMode'),
        sound: CONFIG.sounds.notification
      });
    }
  }

  async handleCombatActions(cost, isReaction = false) {
    const turns = game.combat?.turns ?? [];
    if (turns.length === 0) {
      // Not in combat: allow actions based on available turn or interrupt actions.
      if (isReaction) {
        if (this.system.actions.interrupt.value >= cost) {
          this.update({
            ['system.actions.interrupt.value']: this.system.actions.interrupt.value - cost
          });
          return true;
        }
        else if (this.system.actions.turn.value >= cost) {
          this.update({
            ['system.actions.turn.value']: this.system.actions.turn.value - cost
          });
          return true;
        }
        else {
          ui.notifications.error(`${this.name} does not have enough Interrupt Actions to perform this action!`);
          return false;
        }
      }
      else {
        if (this.system.actions.turn.value >= cost) {
          this.update({
            ['system.actions.turn.value']: this.system.actions.turn.value - cost
          });
          return true;
        }
        else if (this.system.actions.interrupt.value >= (cost * 2)) {
          this.update({
            ['system.actions.interrupt.value']: this.system.actions.interrupt.value - (cost * 2)
          });
          return true;
        }
        else {
          ui.notifications.error(`${this.name} does not have enough Turn Actions to perform this action!`);
          return false;
        }
      }
    }

    const turn = game.combat.turn;
    const combatant = turns[turn].actor;

    // If it's not the actor's turn and the action is an interrupt.
    if (combatant !== this && isReaction) {
      if (this.system.actions.interrupt.value >= cost) {
        this.update({
          ['system.actions.interrupt.value']: this.system.actions.interrupt.value - cost
        });
        return true;
      } 
      else if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      else {
        ui.notifications.error(`${this.name} does not have 1 Interrupt Action or 1 Turn Action to perform this action!`);
        return false;
      }
    }
    // Not the actor's turn and the action is a turn action.
    else if (combatant !== this && !isReaction) {
      if (this.system.actions.interrupt.value >= (cost * 2)) {
        this.update({
          ['system.actions.interrupt.value']: this.system.actions.turn.value - (cost * 2)
        });
        return true;
      }
      else {
        ui.notifications.error(`${this.name} does not have 2 Interrupt Actions to perform this action!`);
        return false;
      }
    }
    // It is the actor's turn.
    else if (combatant === this && !isReaction) {
      if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      else {
        ui.notifications.error(`${this.name} does not have enough Turn Actions to perform this action!`);
        return false;
      }
    }
    else if (combatant === this && isReaction) {
      if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      else {
        ui.notifications.error(`${this.name} does not have 1 Turn Action to perform this action!`);
        return false;
      }
    }
  }

  async calculateDamage(data) {
    /* There are flags we need to look for, which indicate whether an attack can penetrate armor, deal half DHP damage, etc
    * These flags are set in the item that is being used to deal damage.
    * We need to check if the item has these flags set, and if so, apply them to the damage calculation.
    */

    const ignoreArmor = false;
    const nonLethal = false;
    const shpBypass = false;
    const exhausting = false;
    const shpPercent = 1;
    const dhpPercent = 1;

    for (const flag in data.item.flags.utopia) {
      const value = data.item.flags.utopia[flag].toLowerCase();
      switch (value) {
        case "penetrative":
        case "ignoreArmor":
          ignoreArmor = true;
          break;
        case "wounding": 
        case "shpBypass":
        case "ignoreSHP":
          shpBypass = true;
          break;
        case "nonlethal":
        case "non-lethal":
          nonLethal = true;
          break;
        case "exhausting": 
        case "exhaust":
          exhausting = true;
          break;
        default: break;
      }
    }

    console.log(data);
    // Ensure damage is processed as a string for the Roll constructor.
    if (typeof data.damage === 'number') {
      data.damage = data.damage.toString();
    }
    let roll = new Roll(data.damage, this.getRollData());
    let result = await roll.roll();
    let damage = result.total;
    let type = data.type.toLowerCase().trim();

    if (type.length === 0 || type === "none") {
      type = "shp";
    }

    let total = 0;
    // For kinetic, dhp, or shp damage, use the raw damage value.
    if (type === "kinetic" || type === "dhp" || type === "shp" || ignoreArmor) {
      total = damage;
    } else {
      if (type === "shp" && shpBypass) 
        total = 0;

      // For other damage types, subtract the target's defense.
      let defense = this.system.defenses[type].total || 1;
      total = damage - defense;
    }

    let shp = this.system.shp.value;
    let dhp = this.system.dhp.value;

    let newShp = shp;
    let newDhp = dhp;

    let shpDamageTaken = 0;
    let dhpDamageTaken = 0;

    if (type === "dhp" || shpBypass) {
      // DHP damage applies directly.
      newShp = shp;
      newDhp = dhp - (total * dhpPercent);
      dhpDamageTaken = (total * dhpPercent);
    } else {
      // Apply damage to SHP first, then overflow to DHP if necessary.
      newShp = shp - (total * shpPercent);
      newDhp = dhp;
      shpDamageTaken = (total * shpPercent);
      dhpDamageTaken = 0;
  
      if (newShp < 0) {
        shpDamageTaken = shp;
        let remaining = Math.abs(newShp);
        newShp = 0;
        newDhp = dhp - (remaining * dhpPercent);
        dhpDamageTaken = (remaining * dhpPercent);
      }
    }  

    const stamina = this.system.stamina.value;
    const staminaDamage = shpDamageTaken + dhpDamageTaken;
    let newStamina = stamina;

    if (exhausting) {
      newStamina -= staminaDamage;

      if (newStamina < 0) {
        // If stamina is negative, apply the remaining damage to DHP.
        const remaining = Math.abs(newStamina);
        newDhp = dhp - remaining;
        dhpDamageTaken += remaining;
        newStamina = 0;
      }    
    }
  
    return { damage: damage, shpDamageTaken, dhpDamageTaken, newShp, newDhp, newStamina };
  }

  async runDamageTriggers(data) {
    // Placeholder: triggers for SHP or DHP damage can be executed here.
    let source = data.source ?? undefined;
    let shpDamageTaken = data.shpDamageTaken;
    let dhpDamageTaken = data.dhpDamageTaken;

    // Uncomment and implement trigger logic as needed.
    // if (source && source !== this && shpDamageTaken > 0) {
    //   triggerRun = await runTrigger('SHPDamageDealt', source, this, shpDamageTaken);
    // }
    // if (source && source !== this && dhpDamageTaken > 0) {
    //   triggerRun = await runTrigger('DHPDamageDealt', source, this, dhpDamageTaken);
    // }
    // if (shpDamageTaken > 0) {
    //   triggerRun = await runTrigger('SHPDamageTaken', this, shpDamageTaken);
    // }
    // if (dhpDamageTaken > 0) {
    //   triggerRun = await runTrigger('DHPDamageTaken', this, dhpDamageTaken);
    // }
  }

  async applyDamage(data, noActionResponse = false) {
    let calculatedDamage = await this.calculateDamage(data);
    
    // if (!noActionResponse) {
    //   this.runDamageTriggers(foundry.utils.mergeObject(data, calculatedDamage));
    // } else {
    //   // Directly finalize damage without running triggers.
      
    // }

    this.finalizeDamage(foundry.utils.mergeObject(data, calculatedDamage));
  }

  async handleConditionChecks(damageTaken, chatMessage) {
    // Only perform condition checks if the actor has a concentration or focus status.
    const statuses = Array.from(this.statuses);
    if (!statuses.some(s => s.includes('concentration') || s.includes('focus'))) {
      return;
    }

    const template = "systems/utopia/templates/chat/check-card.hbs";
    const automate = game.settings.get('utopia', 'autoRollContests');
    if (automate === 1) { // Prompt for condition checks.
      if (statuses.includes('concentration')) {
        const templateData = {
          concentration: true,
          request: true,
          trait: this.system.focusTrait.length === 3 ? shortToLong(this.system.focusTrait).capitalize() : this.system.focusTrait.capitalize(),
          actor: this,
          toBeat: damageTaken,
        };

        let chatMessage = UtopiaChatMessage.applyRollMode({
          style: CONST.CHAT_MESSAGE_STYLES.OTHER,
          speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
          content: await renderTemplate(template, templateData),
          flags: { utopia: { actor: this._id } },
          system: { templateData: templateData }
        });

        await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
      }
      else {
        // If multiple focus statuses exist, use the maximum focus value.
        const focusStatuses = statuses.filter(s => s.includes('focus'));
        let max = 1;
        if (focusStatuses.length > 1)
          max = Math.max(...focusStatuses.map(s => parseInt(s.split('focus')[1]) ?? 0), 1);

        const templateData = {
          focus: true,
          focusAmount: max,
          request: true,
          trait: this.system.focusTrait.length === 3 ? shortToLong(this.system.focusTrait).capitalize() : this.system.focusTrait.capitalize(),
          actor: this,
          toBeat: damageTaken,
        };

        let chatMessage = UtopiaChatMessage.applyRollMode({
          style: CONST.CHAT_MESSAGE_STYLES.OTHER,
          speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
          content: await renderTemplate(template, templateData),
          flags: { utopia: { actor: this._id } },
          system: { templateData: templateData }
        });

        await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
      }
    } else if (automate === 2) { // Automatically perform condition checks.
      const type = this.statuses.includes('concentration') ? 'concentration' : 'focus';
      let max = 1;
      if (type === 'focus') {
        const focusStatuses = statuses.filter(s => s.includes('focus'));
        if (focusStatuses.length > 1)
          max = Math.max(...focusStatuses.map(s => parseInt(s.split('focus')[1]) ?? 0), 1);
      }
      const options = {
        [`${type}`]: true,
        focusAmount: max,
        request: true,
        trait: this.system.focusTrait.length === 3 ? shortToLong(this.system.focusTrait).capitalize() : this.system.focusTrait.capitalize(),
        actor: this,
        toBeat: damageTaken,
      };
      let rollSuccess = await this.performCheck(this.system.focusTrait ?? "for", {
        flavor: "Roll to maintain focus and concentration!",
        toBeat: damageTaken,
        noDialog: true
      }, options);

      console.log(rollSuccess);

      if (!rollSuccess) {
        // If the condition check fails, remove focus/concentration statuses.
        let statuses = Array.from(this.statuses);
        statuses.forEach(async status => {
          if (status.includes('concentration')) {
            await this.toggleStatusEffect(status);
          }
          if (status.includes('focus')) {
            await this.toggleStatusEffect(status);
          }
        });
      }
    }
  }

  async finalizeDamage(data) {
    const total = data.shpDamageTaken + data.dhpDamageTaken;
    console.log(data);
    
    // Update the actor's SHP and DHP based on damage taken.
    this.update({
      ['system.shp.value']: data.newShp,
      ['system.dhp.value']: data.newDhp,
      ['system.stamina.value']: data.newStamina,
    });

    if (data.type.length === 0 || data.type === "none") {
      data.type = "SHP";
    }

    const template = 'systems/utopia/templates/chat/damage-taken-card.hbs';
    const templateData = {
      actor: this,
      data: await this.getRollData(),
      content: `${this.name} ${total < 0 ? 'heals' : 'takes'} ${Math.abs(total)} [${data.type.capitalize()}] damage!`,
      shp: data.shpDamageTaken,
      dhp: data.dhpDamageTaken,
    };

    let chatMessage = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { actor: this._id } },
      system: { templateData: templateData }
    });

    await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });

    // Automatically trigger condition checks if enabled.
    if (game.settings.get('utopia', 'autoRollContests') >= 1) {
      this.handleConditionChecks(total, chatMessage);    
    } 
  }

  async performResponse(response, data) {
    // Call the corresponding response method based on the response string.
    switch (response) {
      case "block": 
        this.performBlock(data);
        break;
      case "dodge": 
        this.performDodge(data);
        break;
      case "check": 
        this.performCheck(data.system.templateData.trait.toLowerCase(), data);
        break;
      case "fail": 
        this.performCheck(data.system.templateData.trait.toLowerCase(), data);
        break;
    }
  }

  async performBlock(data) {
    console.log(data);
        
    // Check if the actor can perform a block (cost of 1 action).
    const canPerform = await this.handleCombatActions(1, true);
    if (!canPerform) return;

    // Roll the block dice.
    const formula = this.system.block.quantity.total + 'd' + this.system.block.size;
    const roll = new Roll(formula, this.getRollData());
    const result = await roll.roll();
    const tooltip = await roll.getTooltip();

    const originalTemplate = data.system.templateData;

    const template = "systems/utopia/templates/chat/damage-card.hbs";
    const templateData = {
      actor: this,
      item: originalTemplate.item,
      data: this.getRollData(),
      formula: originalTemplate.formula,
      total: originalTemplate.total,
      result: originalTemplate.result,
      tooltip: originalTemplate.tooltip,
      targets: originalTemplate.targets,
      finalized: true,
      blocked: true,
      blockedDamage: result.total,
      noResponse: true,
      newTotal: originalTemplate.total - result.total
    };

    const html = await renderTemplate(template, templateData);

    const updateData = {
      content: await renderTemplate(template, templateData),
      system: {
        total: originalTemplate.total - result.total,
        terms: data.system.terms,
      }
    };

    const chatMessage = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: html,
      flags: { utopia: { actor: this._id } },
      system: { ...updateData.system }
    });

    await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
  }

  async performDodge(data) {
    console.log(data);
    
    // Check if the actor can perform a dodge (cost of 1 action).
    const canPerform = await this.handleCombatActions(1, true);
    if (!canPerform) return;

    // Roll the dodge dice.
    const formula = this.system.dodge.quantity.total + 'd' + this.system.dodge.size;
    const roll = new Roll(formula, this.getRollData());
    const result = await roll.roll();
    const tooltip = await roll.getTooltip();

    const originalTemplate = data.system.templateData;
    // Determine if the dodge was successful by comparing the dodge roll to the incoming damage.
    const success = result.total >= originalTemplate.total;

    const template = "systems/utopia/templates/chat/damage-card.hbs";
    const templateData = {
      actor: this,
      item: originalTemplate.item,
      data: this.getRollData(),
      formula: originalTemplate.formula,
      total: originalTemplate.total,
      result: originalTemplate.result,
      tooltip: originalTemplate.tooltip,
      targets: originalTemplate.targets,
      finalized: true,
      dodged: true,
      dodgedSuccess: success ? game.i18n.localize("UTOPIA.CommonTerms.success") : game.i18n.localize("UTOPIA.CommonTerms.failure"),
      dodgedRoll: result.total,
      noResponse: true,
      newTotal: success ? 0 : originalTemplate.total,
    };

    const html = await renderTemplate(template, templateData);

    const updateData = {
      content: html,
      system: {
        total: success ? 0 : originalTemplate.total,
        terms: data.system.terms,
      }
    };

    const chatMessage = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: html,
      flags: { utopia: { actor: this._id } },
      system: { ...updateData.system }
    });

    await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
  }
}
