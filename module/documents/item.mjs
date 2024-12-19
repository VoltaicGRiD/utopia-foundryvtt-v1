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
    const item = this;

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

    if (this.type === "spell") {
      // The formula may contain variables 'X', 'Y', and 'Z' which should be replaced by other values.
      // Check if the formula contains any of these variables.
      if (this.system.formula.includes('X') || this.system.formula.includes('Y') || this.system.formula.includes('Z')) {
        var variableX = 0;
        var variableY = 0;
        var variableZ = 0;

        // Now, check to see if the Stamina formula contains any of these variables.
        if (this.system.stamina.includes('X') || this.system.stamina.includes('Y') || this.system.stamina.includes('Z')) {
          const template = "systems/utopia/templates/dialogs/spell-variables.hbs";
          const context = {
            name: this.name,
            max: this.actor.system.spellcap,
            stamina: this.system.stamina,
            formula: this.system.formula,
            value: 0,
          }
          const html = await renderTemplate(template, context);

          // Great, that means that when the spell is cast, we need to prompt the user to input values for the variable.
          // We can do this by creating a new DialogV2 instance.
          const variable = new UtopiaSpellVariableSheet({ document: this, parts: ['content'] });
          variable.render(true);
        }
      }
    } 

    // Prepare chat message data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll formula, send the item's description to chat.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    } else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Create and evaluate the roll.
      const roll = new Roll(rollData.formula, rollData);

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

