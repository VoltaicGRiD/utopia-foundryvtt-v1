import { UtopiaAttackSheet } from "../sheets/attack-sheet.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class UtopiaItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
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
    const itemData = this;
    const systemData = itemData.system;

    // if (systemData['parent'] !== undefined && systemData['parent'] !== "") {
    //   if (systemData['parent'] === this.uuid) {
    //     ui.notifications.error("You cannot assign an item as a parent to itself. You maniac.");
    //   } 
    //   else {
    //     let id = systemData.parent.split('.').slice(-1)[0];
    //     let parent = foundry.utils.parseUuid(systemData.parent).collection.find(f => f._id == id);

    //     if (parent === null || parent === undefined) {
    //       return;
    //     }
    //     else {
    //       this.update({
    //         system: {
    //           parentItem: parent
    //         }
    //       })
    //     }
    //   }
    // }
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    console.log(rollData);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    if (this.type == "weapon") {
      console.log("Rolling weapon...", item);
      const sheet = new UtopiaAttackSheet({ document: this });
      sheet.render(true);
      return null;
    }

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
