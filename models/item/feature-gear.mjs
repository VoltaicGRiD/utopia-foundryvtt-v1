import UtopiaItemBase from "../base-item.mjs";


export class GearFeature extends UtopiaItemBase {

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.appliesTo = new fields.StringField({ required: true, nullable: false, initial: "weapon", choices: {
      weapon: "UTOPIA.Gear.Type.Weapon",
      shield: "UTOPIA.Gear.Type.Shield",
      armor: "UTOPIA.Gear.Type.Armor",
      consumable: "UTOPIA.Gear.Type.Consumable",
      artifact: "UTOPIA.Gear.Type.Artifact",
    }});
    schema.classification = new fields.SchemaField({
      weapon: new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
        none: "UTOPIA.Gear.WeaponType.None",
        fast: "UTOPIA.Gear.WeaponType.Fast",
        moderate: "UTOPIA.Gear.WeaponType.Moderate",
        slow: "UTOPIA.Gear.WeaponType.Slow",
        all: "UTOPIA.Gear.WeaponType.All",
      }}),
      shield: new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
        none: "UTOPIA.Gear.ShieldType.None",
        all: "UTOPIA.Gear.ShieldType.All",
      }}),
      armor: new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
        none: "UTOPIA.Gear.ArmorType.None",
        light: "UTOPIA.Gear.ArmorType.Light",
        medium: "UTOPIA.Gear.ArmorType.Medium",
        heavy: "UTOPIA.Gear.ArmorType.Heavy",
        all: "UTOPIA.Gear.ArmorType.All",
      }}),
    })
    schema.weaponType = new fields.StringField({ required: false, nullable: true, initial: "fast", choices: {
      fast: "UTOPIA.Gear.WeaponType.Fast",
      moderate: "UTOPIA.Gear.WeaponType.Moderate",
      slow: "UTOPIA.Gear.WeaponType.Slow",
    }});
    schema.armorSlot = new fields.StringField({ required: false, nullable: true, initial: "head", choices: {
      head: "UTOPIA.Gear.ArmorSlot.Head",
      chest: "UTOPIA.Gear.ArmorSlot.Chest",
      hands: "UTOPIA.Gear.ArmorSlot.Hands",
      waist: "UTOPIA.Gear.ArmorSlot.Waist",
      feet: "UTOPIA.Gear.ArmorSlot.Feet",
    }});
    schema.consumableType = new fields.StringField({ required: false, nullable: true, initial: "food", choices: {
      food: "UTOPIA.Gear.ConsumableType.Food",
      scroll: "UTOPIA.Gear.ConsumableType.Scroll",
      ammunition: "UTOPIA.Gear.ConsumableType.Ammunition",
      potion: "UTOPIA.Gear.ConsumableType.Potion",
      bomb: "UTOPIA.Gear.ConsumableType.Bomb",
    }});

    schema.classifications = new fields.ObjectField();

    return schema;
  }
}