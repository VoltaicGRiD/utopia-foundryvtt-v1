import { isNumeric, shortToLong, calculateTraitFavor, buildTraitData } from "../helpers/_module.mjs";
import { UtopiaRollDialog } from "../sheets/utility/roll-dialog.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

/**
 * Extend the base A[c]tor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class UtopiaActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };
  
    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.traits) {
      for (let [k, v] of Object.entries(data.traits)) {
        data[k] = foundry.utils.deepClone(v);
        data[shortToLong(k)] = foundry.utils.deepClone(v);
        for (let [k2, v2] of Object.entries(data.traits[k].subtraits)) {
          data[k2] = foundry.utils.deepClone(v2);
          data[shortToLong(k2)] = foundry.utils.deepClone(v2);
        }
      }
    }

    if (data.block) {
      data.block = data.block.quantity + 'd' + data.block.size;
    }

    if (data.dodge) {
      data.dodge = data.dodge.quantity + 'd' + data.dodge.size;
    }

    data.talents = {}
    this.items.filter(f => f.type === 'talent').forEach(t => {
      data.talents[t.name] = parseInt(t.system.points.body) + parseInt(t.system.points.mind) + parseInt(t.system.points.soul);
    });

    data.specialists = {}
    this.items.filter(f => f.type === 'specialistTalent').forEach(t => {
      data.specialists[t.name] = 1;
    });
    
    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    console.log(data);
    
    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  async rest() {
    const resources = this.system.actorResources.filter(r => r.recoverInterval === "rest");
    
    resources.forEach(async r => {
      const recoverAmount = r.recoverAmount;
      const max = r.max.total;
      r.amount = Math.min(r.amount + recoverAmount, max);
    });

    await this.update({
      'system.shp.value': this.system.shp.max,
      'system.stamina.value': this.system.stamina.max,
      'system.actions.turn.value': this.system.actions.turn.max,
      'system.actions.interrupt.value': this.system.actions.interrupt.max,
      'system.actorResources': resources,
    });

    const items = this.items.filter(i => i.system.resources && i.system.resources.length > 0);
    
    for (const item of items) {
      const resources = item.system.resources.filter(r => r.recoverInterval === "rest");
      resources.forEach(async r => {
        const recoverAmount = r.recoverAmount;
        const max = r.max.total;
        r.amount = Math.min(r.amount + recoverAmount, max);
      });

      await item.update({
        'system.resources': resources
      });
    }
  }

  async clearSpecies() {
    const species = this.system.species;
    const speciesItem = this.items.filter(i => i.type === "species");

    if (speciesItem.length > 0) {
      for (const item of speciesItem) {
        await this.deleteEmbeddedDocuments("Item", [item._id]);
      }
    }

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

  async finalizeRoll(roll, rollData = {}) {
    let template = '';
    let templateData = {};

    if (rollData.type === "trait") {
      const trait = rollData.trait;
      const fullTrait = shortToLong(trait) ?? trait;
      const gifted = rollData.rollData?.[trait]?.gifted
        ?? this.getRollData()?.[trait]?.gifted
        ?? false;

      console.log(roll);

      template = 'systems/utopia/templates/chat/check-card.hbs';
      templateData = {
        actor: this,
        data: this.getRollData(),
        formula: roll.formula,
        icon: buildTraitData(this)[trait].icon,
        trait: fullTrait.capitalize(),
        total: roll.total,
        result: roll.result,
        flavor: this.name + " performs a " + fullTrait.capitalize() + " check!",
        tooltip: await roll.getTooltip(),
        gifted: gifted,
        toBeat: rollData.toBeat ?? null,
        success: roll.total >= rollData.toBeat ?? null,
      }
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
    const favors = calculateTraitFavor(trait, this.system.disfavors, this.system.favors);
    const favor = {
      net: favors[0] ?? 0,
      disfavor: favors[1] ?? 0,
      favor: favors[2] ?? 0,
    }

    const roll = await new Roll(`${3 + favor.net}d6 + @${trait}.mod`, this.getRollData()).evaluate();

    if (data?.noDialog === true) {
      this.finalizeRoll(roll, { type: "trait", trait: trait, toBeat: data.toBeat ?? null, success: data.success ?? null });
      return;
    }

    new UtopiaRollDialog({}).render({
      force: true,
      parts: ['content'],
      actor: this,
      trait: trait,
      type: 'trait',
      roll: roll,
      rollData: this.getRollData(),
      favor: favor,
    });
  }

  async spendStamina(cost) {
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

    if (rollData.castDiscount) {
      cost = Math.max(spell.system.cost - rollData.castDiscount, 1);
    }

    if (this.system.spellcap >= cost) {
      if (this.system.stamina.value - cost >= 0) {
        await this.update({
          ['system.stamina.value']: this.system.stamina.value - cost
        });
      }
      else {
        await this.update({
          ['system.stamina.value']: 0
        });
        const remaining = cost - this.system.stamina.value;
        console.log("Remaining cost: ", remaining);
        await this.applyDamage({
          damage: remaining,
          type: "dhp"
        }, true);
      }
    } else {
      ui.notifications.error("Your spellcap is too low to cast this spell!");
    }

    spell.roll();
  }

  async performAction(action, data = {}, chatMessage = {}) {
    console.log(action, data, chatMessage);

    if (this.inCombat) {
      const canPerform = await this.handleCombatActions(action, data, chatMessage);
      if (!canPerform) return;
    }

    const system = action.system;
    let formula = system.formula;

    if (formula.length > 0) {
      const customTerms = /#([a-z]+)/gi;
      const matches = formula.matchAll(customTerms);
      for (const match of matches) {
        const term = match[1];
        if (isNumeric(data[term]) || typeof data[term] === 'number') {
          formula = formula.replace(`#${term}`, data[term]);
        }
      }

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
        const template = "systems/utopia/templates/chat/trigger-card.hbs";
        const data = {
          actor: this,
          formula: formula,
          tooltip: tooltip,
          total: roll.total,
        }
        await chatMessage.update({
          content: await renderTemplate(template, data),
          rollMode: game.settings.get('core', 'rollMode'),
          sound: CONFIG.sounds.dice,
        });
      } else {
        await roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: `${this.name} performs ${action.name}!`,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      }
    }

    else if (system.macro.length > 0) {
      const macro = await fromUuid(system.macro);
      
      if (macro) {
        await macro.execute({restActor: this});
      }

      const template = "systems/utopia/templates/chat/action-card.hbs";
      const data = {
        actor: this,
        action: action,
        flavor: `${this.name} performs ${action.name}!`,
      }
      const html = await renderTemplate(template, data);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: html,
        rollMode: game.settings.get('core', 'rollMode'),
        sound: CONFIG.sounds.notification
      })
    }

    else {
      const template = "systems/utopia/templates/chat/action-card.hbs";
      const data = {
        actor: this,
        action: action,
        flavor: `${this.name} performs ${action.name}!`,
      }
      const html = await renderTemplate(template, data);
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: html,
        rollMode: game.settings.get('core', 'rollMode'),
        sound: CONFIG.sounds.notification
      })
    }
  }

  async handleCombatActions(cost, isReaction = false) {
    const turns = game.combat?.turns ?? [];
    if (turns.length === 0) {
      if (isReaction) {
        if (this.system.actions.interrupt.value >= cost) {
          this.update({
            ['system.actions.interrupt.value']: this.system.actions.interrupt.value - cost
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
        else {
          ui.notifications.error(`${this.name} does not have enough Turn Actions to perform this action!`);
          return false;
        }
      }
    }

    const turn = game.combat.turn;
    const combatant = turns[turn].actor;

    console.log(combatant, this, action);

    // It is NOT my turn, and the action is an Interrupt Action
    if (combatant !== this && isReaction) {
      // If the actor has 1 IA, they can perform an interrupt
      if (this.system.actions.interrupt.value >= cost) {
        this.update({
          ['system.actions.interrupt.value']: this.system.actions.interrupt.value - cost
        });
        return true;
      } 
      // If the actor doesn't have enough IA to perform the interrupt
      // we need to check if they have enough TA to perform the interrupt
      // It costs 1 Turn Actions to perform an interrupt
      else if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      // If neither of these conditions are met, they cannot perform the action
      else {
        ui.notifications.error(`${this.name} does not have 1 Interrupt Action or 1 Turn Action to perform this action!`);
        return false;
      }
    }

    // It is NOT my turn, and the action is a Turn Action
    else if (combatant !== this && !isReaction) {
      // If the actor has 2 IA, they can perform the action
      if (this.system.actions.interrupt.value >= (cost * 2)) {
        this.update({
          ['system.actions.interrupt.value']: this.system.actions.turn.value - (cost * 2)
        });
        return true;
      }
      // If the actor doesn't have enough IA to perform the action,
      // they cannot perform the action
      else {
        ui.notifications.error(`${this.name} does not have 2 Interrupt Actions to perform this action!`);
        return false;
      }
    }

    // It is my turn, and the action is a Turn Action
    else if (combatant === this && !isReaction) {
      // If the actor has enough TA, they can perform the action
      if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      // If the actor doesn't have enough TA to perform the action,
      // they cannot perform the action
      else {
        ui.notifications.error(`${this.name} does not have enough Turn Actions to perform this action!`);
        return false;
      }
    }

    // It is my turn, and the action is an Interrupt Action
    else if (combatant === this && isReaction) {
      // If the actor has 1 TA, they can perform the action
      if (this.system.actions.turn.value >= cost) {
        this.update({
          ['system.actions.turn.value']: this.system.actions.turn.value - cost
        });
        return true;
      }
      // If the actor doesn't have enough TA to perform the action,
      // they cannot perform the action
      else {
        ui.notifications.error(`${this.name} does not have 1 Turn Action to perform this action!`);
        return false;
      }
    }
  }


  // We need to split the applyDamage function into multiple functions
  // One of them should calculate the SHP and DHP damage being dealt
  // Another should run the applicable triggers, and NOT apply the damage
  // The last one should actually apply the damage to the actor, this should be the one that is called by trigger responses

  async calculateDamage(data) {
    console.log(data);
    if (typeof data.damage === 'number') {
      data.damage = data.damage.toString();
    }
    let roll = new Roll(data.damage, this.getRollData())
    let result = await roll.roll();
    let damage = result.total;
    let type = data.type.toLowerCase();

    type = type.toLowerCase().trim();
    let total = 0;
    if (type === "kinetic" || type === "dhp" || type === "shp") {
      total = damage;
    } else {
      let defense = this.system.defenses[type].total || 1;
      total = damage - defense;
    }

    // if (total < 0) {
    //   total = 0;
    // }

    let shp = this.system.shp.value;
    let dhp = this.system.dhp.value;

    let newShp = shp;
    let newDhp = dhp;

    let shpDamageTaken = 0;
    let dhpDamageTaken = 0;

    if (type === "dhp") {
      newShp = shp;
      newDhp = dhp - total;

      dhpDamageTaken = total;
    } else {
      // 24 SHP - 30 Damage = 0 SHP, 6 DHP    
      newShp = shp - total;
      newDhp = dhp;

      shpDamageTaken = total;
      dhpDamageTaken = 0;
  
      if (newShp < 0) {
        shpDamageTaken = shp;
        let remaining = Math.abs(newShp);
        dhpDamageTaken = remaining;
        newShp = 0;
        
        newDhp = dhp - remaining;
      }
    }  
  
    return { damage: damage, shpDamageTaken, dhpDamageTaken, newShp, newDhp };
  }

  async runDamageTriggers(data) {
    let source = data.source ?? undefined;
    let shpDamageTaken = data.shpDamageTaken;
    let dhpDamageTaken = data.dhpDamageTaken;

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
    console.log(calculatedDamage);
    if (!noActionResponse) {
      this.runDamageTriggers(foundry.utils.mergeObject(data, calculatedDamage));
    } else {
      this.finalizeDamage(foundry.utils.mergeObject(data, calculatedDamage));
    }
  }

  async handleConditionChecks(damageTaken, chatMessage) {
    const statuses = Array.from(this.statuses);
    if (!statuses.some(s => s.includes('concentration') || s.includes('focus'))) {
      await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
    }

    const automate = game.settings.get('utopia', 'autoRollContests');
    if (automate === 1) { // Prompt to perform condition checks
      if (statuses.includes('concentration')) {
        let templateData = chatMessage.system.templateData;
        templateData.concentration = true;
        templateData.automate = true;

        chatMessage.update({
          content: await renderTemplate(template, templateData),
          system: { templateData: templateData }
        });

        await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
      }
      else {
        const focusStatuses = statuses.filter(s => s.includes('focus'));
        const max = Math.max(...focusStatuses.map(s => parseInt(s.split('focus')[1])));

        templateData = chatMessage.system.templateData;
        templateData.focus = true;
        templateData.focusAmount = max;
        templateData.automate = true;

        chatMessage.update({
          content: await renderTemplate(template, templateData),
          system: { templateData: templateData }
        });

        await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
      }
    } else if (automate === 2) { // Automatically perform condition checks
      await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 

      let rollSuccess = await this.performCheck("for", {
        flavor: "Roll to maintain focus and concentration!",
        toBeat: damageTaken
      });

      console.log(rollSuccess);

      if (!rollSuccess) {
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

    this.update({
      ['system.shp.value']: data.newShp,
      ['system.dhp.value']: data.newDhp
    });

    const template = 'systems/utopia/templates/chat/damage-taken-card.hbs';
    const templateData = {
      actor: this,
      data: await this.getRollData(),
      content: `${this.name} ${total < 0 ? 'heals' : 'takes'} ${Math.abs(total)} [${data.type.capitalize()}] damage!`,
      shp: data.shpDamageTaken,
      dhp: data.dhpDamageTaken,
    }

    let chatMessage = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { actor: this._id } },
      system: { templateData: templateData }
    });

    //await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });

    if (game.settings.get('utopia', 'autoRollContests') >= 1) {
      this.handleConditionChecks(total, chatMessage);    
    } else {
      await UtopiaChatMessage.create(chatMessage, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
    }
  }

  async performResponse(response, data) {
    switch (response) {
      case "block": 
        this.performBlock(data);
        break;
      case "dodge": 
        this.performDodge(data);
        break;
    }
  }

  async performBlock(data) {
    console.log(data);
    
    if (!this.handleCombatActions(1, true)) return;

    const formula = this.system.block.quantity.total + 'd' + this.system.block.size;
    const roll = new Roll(formula, this.getRollData());
    const result = await roll.roll();
    const tooltip = await roll.getTooltip();

    const originalData = data.system.templateData;

    const template = "systems/utopia/templates/chat/damage-card.hbs";
    const templateData = {
      actor: this,
      item: originalData.item,
      data: this.getRollData(),
      formula: originalData.formula,
      total: originalData.total,
      result: originalData.result,
      tooltip: originalData.tooltip,
      blocked: true,
      blockedDamage: result.total,
      newTotal: originalData.total - result.total
    }

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: originalData.item._id } },
      system: {
        total: originalData.total - result.total,
      },
      sound: CONFIG.sounds.dice,
    });

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async performDodge(data) {
    console.log(data);
    
    if (!this.handleCombatActions(1, true)) return;

    const formula = this.system.dodged.quantity.total + 'd' + this.system.dodged.size;
    const roll = new Roll(formula, this.getRollData());
    const result = await roll.roll();
    const tooltip = await roll.getTooltip();

    const originalData = data.system.templateData;

    const template = "systems/utopia/templates/chat/damage-card.hbs";
    const templateData = {
      actor: this,
      item: originalData.item,
      data: this.getRollData(),
      formula: originalData.formula,
      total: originalData.total,
      result: originalData.result,
      tooltip: originalData.tooltip,
      dodgeded: result.total >= originalData.total,
      dodgededRoll: result.total,
    }

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: originalData.item._id } },
      system: {
        total: originalData.total - result.total,
      },
      sound: CONFIG.sounds.dice,
    });

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }
}
