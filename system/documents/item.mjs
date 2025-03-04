import { isPointInPolygon } from "../helpers/_module.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

/**
 * Extend the basic Item with custom modifications specific to the Utopia system.
 * @extends {Item}
 */
export class UtopiaItem extends Item {
  /**
   * Prepare the data structure for the item.
   * Called when the item is created or updated.
   */
  prepareData() {
    // Call the parent method to ensure base data is set up.
    super.prepareData();
  }

  /**
   * Augment the item data with additional dynamic data.
   * Typically used for calculating derived data that should be available
   * for character sheets or other parts of the system.
   */
  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;

    // If this is a spell feature with the default icon, update it.
    if (itemData.type === "spellFeature") {
      if (itemData.img === "icons/svg/item-bag.svg") {
        this.updateDefaultSpellFeatureIcon();
      }
    }

    // Prepare any system effects that modify the item's data.
    this._prepareSystemEffects(itemData);
    // Other preparations (dice options, spell data, etc.) are commented out
    // and can be enabled as needed.
    //this._prepareDiceOptions(itemData);
    //this._prepareSpellFeatureData(itemData);
    //this._prepareArtificeFeatureData(itemData);
    //this._prepareSpellData(itemData);
  }

  _prepareSystemEffects(itemData) {
    // Only process effects if they exist.
    if (!itemData.effects || itemData.effects.length === 0) return;
      
    for (const effect of itemData.effects) {
      // For gear items, apply each change defined in the effect.
      if (effect.type === "gear" && itemData.type === "gear") {
        for (const change of effect.changes) {
          effect.apply(itemData, change);
          console.log("Applied change: ", change, "to item: ", itemData);
        }
      }
    }
  }

  updateDefaultSpellFeatureIcon() {
    // Set a custom default icon for spell features.
    let img = "systems/utopia/assets/icons/artistries/array.svg";

    this.update({
      img: img
    });
  }

  addToContainer(item) {
    if (this.system.isContainer()) {
      const totalCapacity = this.system.container.capacity;
      const containerItems = this.system.container.items;
      // The following line is intended to generate unique identifiers for each contained item.
      const itemSlots = containerItems.map(i => foundry.utils.parseUuid);

      // TODO: Finish implementation for adding an item to a container.
    }
  }

  /**
   * Get the roll data for the item.
   *
   * This method creates a shallow copy of the item's system data and includes any defined variables.
   * If the item is associated with an actor, the actor's roll data is merged into the item's roll data.
   * The final roll data is logged to the console for debugging purposes.
   *
   * @returns {Object} The roll data for the item, including any actor-specific values if applicable.
   */
  getRollData() {
    // Start with a shallow copy of the item's system data.
    const rollData = { ...this.system };

    // If the item has defined variables, copy each variable's value.
    const variables = this.system.variables || {};
    for (let [key, variable] of Object.entries(variables)) {
      rollData[key] = variable.value || 0;
    }

    // If no actor is associated, return the item data alone.
    if (!this.actor) return rollData;

    // Merge the actor's roll data to include character-specific values.
    rollData.actor = this.actor.getRollData();

    // Debug logging for troubleshooting roll data.
    console.log(rollData);

    return rollData;
  }

  // Returns the flavor text (if any) defined on the item.
  getFlavor() {
    if (this.system.flavor) return this.system.flavor;
    else return null;
  }

  async rollFeature(feature) {
    // If no formula is defined for the feature, return 0.
    if (!feature.system.formula) return 0;
    else {
      const roll = await new Roll(feature.system.formula, this.getRollData()).evaluate();
      return roll.total;
    }
  }

  /**
   * Roll the item and generate a chat message based on the item type.
   *
   * @param {Array} [terms=undefined] - Optional terms for the roll.
   * @returns {Promise<ChatMessage>} - The created chat message.
   *
   * @throws {Error} - Throws an error if the item type is not supported.
   *
   * @example
   * // Roll a weapon item
   * const item = game.items.get(itemId);
   * item.roll();
   *
   * @example
   * // Roll a talent item
   * const talent = game.items.get(talentId);
   * talent.roll();
   *
   * @example
   * // Roll an armor item
   * const armor = game.items.get(armorId);
   * armor.roll();
   */
  async roll(terms = undefined) {
    const targets = game.user.targets.map(t => t.actor) ?? [];
    const template = 'systems/utopia/templates/chat/item-card.hbs';
  
    const enrichDescription = async (description) => {
      return await TextEditor.enrichHTML(description, {
        secrets: this.isOwner,
        rollData: this.getRollData(),
        relativeTo: this.actor ?? this,
      });
    };
  
    const createChatMessage = async (templateData) => {
      const html = await renderTemplate(template, templateData);
      const chatData = await UtopiaChatMessage.applyRollMode({
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        speaker: UtopiaChatMessage.getSpeaker({ actor: this.actor, item: this }),
        content: html,
        flags: { utopia: { item: this._id } },
        system: {
          item: this,
          actor: this.actor,
          templateData: templateData,
        }
      });
      return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
    };
  
    const processRolls = async (rolls, formula, estimate = false) => {
      if (estimate) {
        const roll = await Roll.simulate(formula, 100);
        return Math.round(roll.reduce((partial, value) => partial + value, 0) / roll.length);
      } else {
        const roll = await new Roll(formula, this.getRollData()).evaluate();
        return roll.total;
      }
    };
  
    if (this.type === "weapon") {
      const { strikes, actions, resources, rarityPoints, rarity } = this.system;
  
      for (const strike of strikes) {
        const displayDamage = game.settings.get('utopia', 'displayDamage');
        if (displayDamage == 1) strike.estimate = await processRolls(strike, strike.damage, true);
        if (displayDamage == 2) strike.exact = await processRolls(strike, strike.damage);
      }
  
      for (const action of actions) {
        if (action.type === "damage") {
          const displayDamage = game.settings.get('utopia', 'displayDamage');
          if (displayDamage == 1) action.estimate = await processRolls(action, action.formula, true);
          if (displayDamage == 2) action.exact = await processRolls(action, action.formula);
        }
      }
  
      const templateData = {
        item: this,
        flavor: this.getFlavor(),
        system: this.system,
        resources: resources,
        rarityPoints: rarityPoints,
        rarity: rarity,
        hasGMNotes: this.system.gmSecrets !== "",
        targets: targets,
        enrichedGMNotes: await enrichDescription(this.system.gmSecrets)
      };
  
      return createChatMessage(templateData);
    }
  
    if (["specialistTalent", "talent"].includes(this.type)) {
      const description = await enrichDescription(this.system.description);
      const templateData = {
        item: this,
        targets: targets,
        system: this.system,
        flavor: description,
        actor: this.actor || {}
      };
  
      return createChatMessage(templateData);
    }
  
    if (["armor", "artifact", "trinket"].includes(this.type)) {
      const description = await enrichDescription(this.system.description);
      const { rarityPoints, rarity } = this.system;
      const templateData = {
        item: this,
        targets: targets,
        system: this.system,
        flavor: this.system.flavor.length > 0 ? this.system.flavor : this.system.description,
        rarity: rarity,
        rarityPoints: rarityPoints,
        actor: this.actor || {}
      };
  
      return createChatMessage(templateData);
    }

    if (['consumable'].includes(this.type)) {
      const { strikes, actions, rarityPoints, rarity } = this.system;

      for (const strike of strikes) {
        const displayDamage = game.settings.get('utopia', 'displayDamage');
        if (displayDamage == 1) strike.estimate = await processRolls(strike, strike.damage, true);
        if (displayDamage == 2) strike.exact = await processRolls(strike, strike.damage);
      }
  
      for (const action of actions) {
        if (action.type === "damage") {
          const displayDamage = game.settings.get('utopia', 'displayDamage');
          if (displayDamage == 1) action.estimate = await processRolls(action, action.formula, true);
          if (displayDamage == 2) action.exact = await processRolls(action, action.formula);
        }
      }

      const description = await enrichDescription(this.system.description);
      const templateData = {
        item: this,
        targets: targets,
        system: this.system,
        flavor: this.system.flavor.length > 0 ? this.system.flavor : this.system.description,
        rarity: rarity,
        rarityPoints: rarityPoints,
        consumable: true,
        actor: this.actor || {}
      };

      return createChatMessage(templateData);
    }
  }

  async use() {
    if (this.system.actions.length > 1 || this.system.actions.length <= 0) {
      this.roll();
    } else if (this.system.actions.length === 1) {
      this?.performAction(this.system.actions[0]);
    } else if (this.system.strikes.length > 1 || this.system.strikes.length <= 0) {
      this.roll();
    } else {
      this?.roll();
    } 

    this.update({
      [`system.quantity`]: this.system.quantity - 1
    })
    
    if (this.deleteOnEmpty && this.quantity <= 0) {
      this?.actor?.deleteEmbeddedDocuments('Item', [this._id]);
    }
  }

  getActiveTemplates() {
    return game.canvas?.scene?.templates?.filter(
      t => t.getFlag('utopia', 'origin') === this.uuid
    ) ?? [];
  }
    
  /**
   * Perform a strike action, rolling for damage and updating the chat message with the results.
   *
   * @param {Object} strike - The strike object containing damage formula and other properties.
   * @param {Object} message - The chat message object to be updated with the strike results.
   * @param {Object} user - The user performing the strike, containing target information.
   * @returns {Promise<void>} - A promise that resolves when the chat message has been updated.
   */
  async performStrike(strike, message, user) {
    const requireTarget = game.settings.get('utopia', 'targetRequired');
    const targets = [];
    const templates = [];
    targets.push(... game.user.targets.map(t => t.actor));

    if (strike.template === "none" && requireTarget && targets.length === 0) {
      return ui.notifications.error("You must target a token to perform this action.");
    }
    if (requireTarget && strike.template !== "none") {
      const value = await this.processTemplate();
      targets.push( ...value.targets );
      templates.push( ...value.templates );
      if (targets.length === 0) {
        return ui.notifications.error("No tokens are in range of the template, or you did not place the template.");
      }
    }
    else if (!requireTarget && strike.template !== "none") {
      const value = await this.processTemplate();
      targets.push( ...value.targets );
      templates.push( ...value.templates );
    }

    if (strike.damage === 0 || !strike.damage || strike.damage.length === 0) {
      return ui.notifications.error("The strike has no damage formula defined.");
    }

    // Roll the strike's damage.
    const roll = await new Roll(strike.damage, this.getRollData()).evaluate();
    // Map each roll term to include additional properties.
    const terms = roll.terms.map(t => { return {total: t.total, flavor: t.flavor, ...t}});
    const rarity = this.rarity;
    const total = roll.total;
    const result = roll.result;
    const flavor = strike.flavor;
    const tooltip = await roll.getTooltip();

    const template = 'systems/utopia/templates/chat/damage-card.hbs';

    // Determine if damage should be displayed as finalized (exact) or estimated.
    const finalized = game.settings.get('utopia', 'displayDamage') == 2 ? true : false;
    if (game.settings.get('utopia', 'displayDamage') == 1 && (strike.estimate === 0 || !strike.estimate)) {
      // If no estimate exists, simulate multiple rolls to generate one.
      const simulation = await Roll.simulate(strike.damage, 100);
      strike.estimate = simulation.reduce((partial, value) => partial + value, 0) / simulation.length;
    }

    const templateData = {
      item: this,
      flavor: flavor,
      rarity: rarity,
      formula: strike.damage,
      total: total,
      result: result,
      tooltip: tooltip,
      estimate: strike.estimate,
      finalized: finalized,
      strike: strike,
      targets: targets,
      hasTemplate: templates.length > 0,
      itemTemplates: templates
    };
    
    const html = await renderTemplate(template, templateData);

    // Update the original chat message with the strike results.
    await message.update({
      content: html,
      target: targets,
      system: {
        item: this,
        actor: this.actor,
        damage: total,
        terms: terms,
        strike: strike,
        dice: roll.dice,
        targets: targets,
        itemTemplates: templates,
        templateData: templateData,
      }
    });

    // Note: This function updates an existing message rather than creating a new one.
  }

  async performAction(action, message) {
    console.log("Performing action: ", action, "for message: ", message);

    // If the action consumes a resource, find and deduct the resource.
    if (action.resource.length > 0) {
      var resource = this.system.resources.find(r => r.name === action.resource);
      if (!resource) {
        resource = this.actor.resources.find(r => r.name === action.resource);
      }
      if (!resource) {
        ui.notifications.error(`Could not find resource ${action.resource} for action ${action.name}`);
        return;
      }
      const cost = action.consumed;
      const current = resource.amount;
      const max = resource.max.total;

      if (current < cost) {
        ui.notifications.error(`You do not have enough ${resource.name} to perform this action.`);
        return;
      }
      if (cost < 0 && current - cost > max) {
        ui.notifications.error(`You cannot exceed the maximum ${resource.name} of ${max}.`);
        return;
      }
      
      resource.amount = current - cost;
      // Update the resource in the item's system data.
      const resources = this.system.resources.map(r => r.name === resource.name ? resource : r);
      
      await this.update({
        'system.resources': resources
      });
    }

    // Execute action based on its category.
    switch (action.category) {
      case 'damage': 
        this.performDamageMacro(action);
      case "macro": 
        this.performActionMacro(action);
    }
  }

  async processTemplate() {
    const targets = [];
    var templates = game.canvas?.scene?.templates?.filter(
      t => t.getFlag('utopia', 'origin') === this.uuid
    ) ?? [];
    for (const template of templates) {
      const poly = game.canvas.scene.grid.getCircle({ x: template.x, y: template.y }, template.distance);
      const tokens = game.canvas.scene.tokens;
      const actors = tokens.filter(t => isPointInPolygon(t.object.getCenterPoint(), poly));
      targets.push(...actors);
      await template.update({
        hidden: true
      })
    }
    return { targets: targets, templates: templates };
  }

  async performDamageMacro(action) {
    const requireTarget = game.settings.get('utopia', 'targetRequired');
    const targets = game.user.targets.map(t => t.actor) ?? [];

    if (action.template === "none" && requireTarget && targets.length === 0) {
      return ui.notifications.error("You must target a token to perform this action.");
    }
    if (requireTarget && action.template !== "none") {
      targets.push(...this.processTemplate(action, targets));
      if (targets.length === 0) {
        return ui.notifications.error("No tokens are in range of the template, or you did not place the template");
      }
    }

    const roll = await new Roll(action.formula, this.getRollData()).evaluate();
    const terms = roll.terms.map(t => { return {total: t.total, flavor: t.flavor, ...t}});
    const rarity = this.rarity ?? "common";
    const total = roll.total;
    const result = roll.result;
    const flavor = action.flavor;
    const tooltip = await roll.getTooltip();

    const template = 'systems/utopia/templates/chat/damage-card.hbs';
    const templateData = {
      item: this,
      flavor: flavor,
      rarity: rarity,
      formula: action.formula,
      total: total,
      result: result,
      tooltip: tooltip,
      action: action,
      finalized: true
    };

    const html = await renderTemplate(template, templateData);

    const chatData = await UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this.actor, item: this }),
      content: html,
      flags: { utopia: { item: this._id } },
      system: {
        item: this,
        actor: this.actor,
        damage: total,
        action: action,
        dice: roll.dice,
        terms: terms,
        total: total,
        templateData: templateData,
      }
    });

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false }); 
  }

  async performActionMacro(action) {
    // Prepare a scope for the macro execution based on the actor context.
    const scope = {};

    switch (action.actor) {
      case "default": 
        break;
      case "self": 
        scope.target = this.actor ?? {};
        break;
      case "target":
        scope.target = [...game.user.targets];
    }
    const macro = await fromUuid(action.macro);
    await macro.execute(scope);

    const template = 'systems/utopia/templates/chat/item-card.hbs';
    const token = this.actor.token;
    const flavor = action.flavor.length > 0 ? action.flavor : this.system.flavor;
    const templateData = {
      actor: this.actor,
      item: this,
      flavor: flavor,
      macro: macro.name
    };

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      // Note: The speaker context here omits item details.
      speaker: UtopiaChatMessage.getSpeaker({ actor: this.actor, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
      system: { dice: roll.dice }
    });

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async toMessage(event, options) {
    // Ensure the item is owned by an actor before creating a chat message.
    if (!this.actor) {
      ui.notifications.error(`Cannot create message for unowned item ${this.name}`);
    };

    // Roll using the item's formula.
    let roll = await new Roll(this.system.formula, this.getRollData()).roll();
    let total = roll.total;
    let result = roll.result;
    let formula = roll.formula;
    let flavor = this.getFlavor();
    let tooltip = await roll.getTooltip();

    console.log(roll);
    
    const template = 'systems/utopia/templates/chat/item-card.hbs';
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      item: this,
      data: await this.getRollData(),
      formula: formula,
      total: total,
      result: result,
      flavor: flavor,
      tooltip: tooltip,
    };

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this.actor, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
      system: { dice: roll.dice }
    });

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }
}
