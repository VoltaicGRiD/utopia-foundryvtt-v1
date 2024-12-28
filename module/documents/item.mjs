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

    this._prepareDiceOptions(itemData);
    
    this._prepareSpellFeatureData(itemData);
    //this._prepareSpellData(itemData);
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

  /**
   * Handle the item being rolled.
   * @returns {Promise<Roll|null>} The result of the roll or null if not applicable.
   */
  async roll() {
    // Lets find out if the item contains features. If it does, the formula is a 
    // sum of all the features' formulas.
    const total = 0;

    // If there are no features, and there isn't a formula, output the item's description.
    if (!this.system.formula && (Object.keys(this.system.features).length === 0 || !this.system.features)) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
      return null;
    }

    // If there are features, we need to roll each feature and get the formula.
    if (this.system.features && Object.keys(this.system.features).length > 0) {
      const features = Object.entries(item.system.features) || [];
      const featureRolls = [];
      for (let feature of features) {
        featureRolls.push(feature[1].roll().formula);
      }
            
      const formula = featureRolls.map(roll => roll.formula).join(" + ");
      const roll = new Roll(formula, this.getRollData());

      // Prepare chat message data.
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `[${item.type}] ${item.name}`;

      // Send the roll result to chat.
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });

      return roll; 
    }     
    else {
      const item = this;
      const stacks = item.stacks || 1; 

      let roll = new Roll(item.system.formula, this.getRollData());
      roll.terms.forEach(term => {
        if (term instanceof Die) {
          term.number = term.number * stacks;
        }
      });

      // If the item is a weapon, handle weapon-specific rolling.
      if (this.type === "weapon") {
        // Get the user's targets.
        const targets = game.user.targets;

        for (let target of targets) {         
        }

        // Check if the target is within range.
        let inRange = await rangeTest(item);

        if (inRange) {
          // Open the attack sheet for the weapon.
          const sheet = new UtopiaAttackSheet({ document: this });
          sheet.render(true);
          return null;
        }   
      } 

      // Prepare chat message data.
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `[${item.type}] ${item.name}`;

      // Send the roll result to chat.
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });

      return roll; 
    }   
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

