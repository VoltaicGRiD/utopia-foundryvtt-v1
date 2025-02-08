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

}