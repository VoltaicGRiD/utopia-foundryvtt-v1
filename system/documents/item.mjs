import { UtopiaAttackSheet } from "../sheets/other/attack-sheet.mjs";
import { rangeTest } from '../helpers/rangeTest.mjs';
import { UtopiaChatMessage } from "./chat-message.mjs";
import { UtopiaSpellVariableSheet } from "../sheets/item/spell-variable-sheet.mjs";

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
    // Ensure the base data is prepared by calling the parent method.
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

    if (itemData.type === "spellFeature") {
      if (itemData.img === "icons/svg/item-bag.svg") {
        this.updateDefaultSpellFeatureIcon();
      }
    }

    this._prepareSystemEffects(itemData);
    //this._prepareDiceOptions(itemData);
    //this._prepareSpellFeatureData(itemData);
    //this._prepareArtificeFeatureData(itemData);
    //this._prepareSpellData(itemData);
  }

  _prepareSystemEffects(itemData) {
    //console.log("Preparing system effects for: ", itemData);
    if (!itemData.effects || itemData.effects.length === 0) return;
      
    for (const effect of itemData.effects) {
      if (effect.type === "gear" && itemData.type === "gear") {
        for (const change of effect.changes) {
          effect.apply(itemData, change);
          console.log("Applied change: ", change, "to item: ", itemData);
        }
      }
    }
  }

  _prepareDiceOptions(itemData) {
    if (itemData.system.formula === undefined || itemData.system.formula === "") return;
    const formula = itemData.system.formula;
    let newFormula = formula;
    const stacks = itemData.stacks || 1;
    const variables = Object.entries(itemData.system.variables).map(v => {
      return {[v[1].name]: v[1].value};
    });
    const data = foundry.utils.mergeObject(this.getRollData(), variables);
    const roll = new Roll(formula, data);
    const dice = roll.terms.filter(term => term instanceof Die);
    const diceOptions = {};
    dice.forEach((die, index) => {
      const max = die.faces * (die.number * stacks);
      newFormula = roll.formula.replace(die.formula, `${die.number * stacks}d${die.faces}`);
      
      // We only allow dice in the standard array:
      // 4, 6, 8, 10, 12, 20, 100
      // We need to calculate the various other options
      const options = [4, 6, 8, 10, 12, 20, 100].filter(f => max % f === 0);
      diceOptions[index] = [];

      options.forEach(option => {
        let count = max / option;
        diceOptions[index].push(`${count}d${option}`);
      });
    });

    itemData.formulaOptions = diceOptions;

    if (itemData.customFormula === false) {
      if (game.settings.get("utopia", "diceRedistribution")) {
        let size = game.settings.get("utopia", "diceRedistributionSize");
        if (size === 1) {
          itemData.currentFormula = 0;
        }
        else if (size === 2) {
          itemData.currentFormula = diceOptions[0].length - 1;
        } 
        else {
          let min = 0;
          let max = diceOptions[0] ? diceOptions[0].length - 1 : 0;
          // Get the middle option
          itemData.currentFormula = Math.floor((min + max) / 2);
        }
      }
    }
  }

  _prepareSpellFeatureData(itemData) {
    if (itemData.type !== "spellFeature") return;

    if (itemData.system.variables["stacks"]) {
      itemData.stacks = itemData.system.variables["stacks"].value;
      itemData.variables.stacks.value = itemData.stacks;
    }

    if (itemData.system.formula !== undefined && itemData.system.formula !== "") {
      let formula = itemData.system.formula;
      let roll = new Roll(formula, this.getRollData());
      itemData.currentFormula = roll.formula;
      let dice = roll.terms.filter(term => term instanceof Die);
    }
  }

  _prepareSpellData(itemData) {
    
  }

  updateDefaultSpellFeatureIcon() {
    let img = "systems/utopia/assets/icons/artistries/array.svg";

    this.update({
      img: img
    })
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this item.
   * @returns {Object} The data object used for rolling.
   */
  getRollData() {
    // Create a shallow copy of the item's system data.
    const rollData = { ...this.system };

    // Include the item's variables if they exist.
    const variables = this.system.variables || {};
    for (let [key, variable] of Object.entries(variables)) {
      rollData[key] = variable.value || 0;
    }

    // If there's no associated actor, return the roll data as is.
    if (!this.actor) return rollData;

    // Include the actor's roll data.
    rollData.actor = this.actor.getRollData();

    // Log the roll data for debugging purposes.
    console.log(rollData);

    return rollData;
  }

  getFlavor() {
    if (this.system.flavor) return this.system.flavor;
    else return null;
  }

  async rollFeature(feature) {
    if (!feature.system.formula) return 0;
    else {
      const roll = await new Roll(feature.system.formula, this.getRollData()).evaluate();
      return roll.total;
    }
  }

  /**
   * Handle the item being rolled.
   * @returns {Promise<Roll|null>} The result of the roll or null if not applicable.
   */
  async roll(terms = undefined) {
    if (this.type === "weapon") {
      const strikes = this.system.strikes; 
      const actions = this.system.actions;
      const resources = this.system.resources;
      const rarityPoints = this.system.rarityPoints;
      const rarity = this.system.rarity;

      for (const strike of strikes) {
        console.log(strike);

        // 0 = Hide, 1 = Estimate, 2 = Exact
        if (game.settings.get('utopia', 'displayDamage') == 1)
        {
          const type = new Roll(strike.damage, this.getRollData()).options.flavor;
          const roll = await Roll.simulate(strike.damage, 100);
          const rollEstimate = Math.round(roll.reduce((partial, value) => partial + value, 0) / roll.length);
          strike.estimate = rollEstimate;
        }

        if (game.settings.get('utopia', 'displayDamage') == 2)
        {
          const roll = await new Roll(strike.damage, this.getRollData()).evaluate();
          strike.exact = roll.total;
        }
      }

      this.strikes = strikes;
      
      for (const action of actions) {
        if (action.type === "damage") {
          // 0 = Hide, 1 = Estimate, 2 = Exact
          if (game.settings.get('utopia', 'displayDamage') == 1)
          {
            const roll = await Roll.simulate(action.formula, 100);
            const rollEstimate = Math.round(roll.map(r => r).reduce((a, b) => a + b, 0) / 100);
            const estimate = await new Roll(`${rollEstimate} + ${action.formula}`, this.getRollData()).evaluate();
            action.estimate = estimate.total;
          }

          if (game.settings.get('utopia', 'displayDamage') == 2)
          {
            const roll = await new Roll(action.formula, this.getRollData()).evaluate();
            action.exact = roll.total;
          }
        }
      }

      this.actions = actions;

      const template = 'systems/utopia/templates/chat/weapon-card.hbs';

      const templateData = {
        item: this,
        flavor: this.getFlavor(),
        strikes: strikes,
        actions: actions,
        resources: resources,
        rarityPoints: rarityPoints,
        rarity: rarity,
        hasGMNotes: this.system.gmSecrets !== "",
        enrichedGMNotes: await TextEditor.enrichHTML(
          this.system.gmSecrets,
          {
            secrets: game.user.isGM,
            rollData: this.getRollData(),
            relativeTo: this.actor ?? this.item,
          }
        )
      }
      
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

      console.log(this);

      return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
    }
  }
    
  async performStrike(strike, message) {
    console.log("Performing strike: ", strike, "for message: ", message);

    // TODO: Implement 'requireTarget' game rule

    const roll = await new Roll(strike.damage, this.getRollData()).evaluate();
    const rarity = this.rarity;
    const total = roll.total;
    const result = roll.result;
    const flavor = strike.flavor;
    const tooltip = await roll.getTooltip();

    const template = 'systems/utopia/templates/chat/damage-card.hbs';

    const finalized = game.settings.get('utopia', 'displayDamage') == 2 ? true : false;
    if (game.settings.get('utopia', 'displayDamage') == 1 && strike.estimate === 0) {
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
    }
    
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
        strike: strike,
        dice: roll.dice,
        templateData: templateData,
      }
    });

    console.log(this);

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async toMessage(event, options) {
    if (!this.actor) {
      ui.notifications.error(`Cannot create message for unowned item ${this.name}`)
    };

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
    }

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this.actor, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
      system: { dice: roll.dice }
    })

    return UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async createVariable() {
    if (this.type === "spellFeature") {
      const variables = await UtopiaItem.createDocuments([{name: "Variable", type: "variable"}]);
      variables.forEach(async variable => {
        console.log(variable);
        const existing = Object.keys(this.system.variables);
        if (existing.includes(variable._id)) {
          return false;
        }
        await this.update({
          [`system.variables.${variable._id}`]: variable,
        });
      });

      console.log(this);
      return true;
    }
    return false;
  }

  async deleteVariable(variableId) {
    await UtopiaItem.deleteDocuments([variableId]);
    await this.update({
      [`system.variables.-=${variableId}`]: null,
    });
  } 
}

