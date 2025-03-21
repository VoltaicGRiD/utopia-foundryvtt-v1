import UtopiaItemBase from "../base-item.mjs";

const fields = foundry.data.fields;

export class Gear extends UtopiaItemBase {
  /** @override */
  static defineSchema() {
    const schema = super.defineSchema();
      
    schema.type = new fields.StringField({ required: true, nullable: false, initial: "weapon", choices: {
      weapon: "UTOPIA.Gear.Type.Weapon",
      shield: "UTOPIA.Gear.Type.Shield",
      armor: "UTOPIA.Gear.Type.Armor",
      consumable: "UTOPIA.Gear.Type.Consumable",
      artifact: "UTOPIA.Gear.Type.Artifact",
    }});

    schema.weaponType = new fields.StringField({ required: false, nullable: true, initial: "fast", choices: {
      fast: "UTOPIA.Gear.WeaponType.Fast",
      moderate: "UTOPIA.Gear.WeaponType.Moderate",
      slow: "UTOPIA.Gear.WeaponType.Slow",
    }});

    schema.armorType = new fields.StringField({ required: false, nullable: true, initial: "head", choices: {
      "head": "UTOPIA.Gear.ArmorType.Head",
      "neck": "UTOPIA.Gear.ArmorType.Neck",
      "chest": "UTOPIA.Gear.ArmorType.Chest",
      "back": "UTOPIA.Gear.ArmorType.Back",
      "waist": "UTOPIA.Gear.ArmorType.Waist",
      "ring": "UTOPIA.Gear.ArmorType.Ring",
      "hands": "UTOPIA.Gear.ArmorType.Hands",
      "feet": "UTOPIA.Gear.ArmorType.Feet",
    }});

    schema.value = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.attributes = new fields.SetField(
      new fields.SchemaField({
        key: new fields.StringField({ required: true, nullable: false }),
        value: new fields.StringField({ required: true, nullable: false }),
      }), { label: "UTOPIA.Quirk.Attributes.label", hint: "UTOPIA.Quirk.Attributes.hint" }
    ); 

    schema.features = new fields.ArrayField(
      new fields.DocumentUUIDField({ type: "Item" }), 
      { label: "UTOPIA.Gear.Features.label", hint: "UTOPIA.Gear.Features.hint" }
    );

    return schema;
  }

  

  prepareDerivedData() {
    this.cost = {
      silver: this.value,
      utian: this.value * 1000
    }
  }
}