import { UtopiaChatMessage } from "../../documents/chat-message.mjs";
import UtopiaItemBase from "../base-item.mjs";
  
export default class UtopiaGeneralItem extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.quantity = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.slots = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.value = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.consumeOnUse = new fields.BooleanField({ required: true, initial: true });
    schema.deleteWhenEmpty = new fields.BooleanField({ required: true, initial: false });

    schema.category = new fields.StringField({ required: true, nullable: false, initial: "misc", choices: {
      "misc": "UTOPIA.Item.General.Categories.misc",
      "consumable": "UTOPIA.Item.General.Categories.consumable",
      "tool": "UTOPIA.Item.General.Categories.tool",
      "trinket": "UTOPIA.Item.General.Categories.trinket",
      "junk": "UTOPIA.Item.General.Categories.junk",
      "ammunition": "UTOPIA.Item.General.Categories.ammunition",
      "valuable": "UTOPIA.Item.General.Categories.valuable",
    }});

    schema.rarity = new fields.StringField({ required: true, nullable: false, initial: "common", choices: {
      "crude": "UTOPIA.Item.General.Rarity.crude",
      "common": "UTOPIA.Item.General.Rarity.common",
      "extraordinary": "UTOPIA.Item.General.Rarity.extraordinary",
      "rare": "UTOPIA.Item.General.Rarity.rare",
      "legendary": "UTOPIA.Item.General.Rarity.legendary",
      "mythical": "UTOPIA.Item.General.Rarity.mythical",
    }});
    
    return schema;
  }

  async use() {
    console.warn("Using item: ", this);
    
    if (this.consumeOnUse) {
      this.parent.update({ "system.quantity": this.quantity - 1 });
    }

    if (this.quantity <= 0 && this.deleteWhenEmpty) {
      this.delete();
    }

    UtopiaChatMessage.create({
      content: this.name,
      speaker: ChatMessage.getSpeaker({ actor: this.parent.actor }),
      flags: {
        utopia: {
          itemId: this.id,
          itemName: this.name,
          itemType: this.type,
          itemAction: "use",
        }
      }
    });
  }
}