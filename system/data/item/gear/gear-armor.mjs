import UtopiaGearBase from "./base-gear.mjs";

export default class UtopiaArmor extends UtopiaGearBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    schema.equippable = new fields.BooleanField({ required: true, initial: true, validate: (value) => {
      if (this.equippable && this.handheld) return false;
    }});

    schema.defenses = new fields.SchemaField({
      chill: new fields.NumberField({...requiredInteger}),
      heat: new fields.NumberField({...requiredInteger}),
      physical: new fields.NumberField({...requiredInteger}),
      energy: new fields.NumberField({...requiredInteger}),
      psyche: new fields.NumberField({...requiredInteger}),
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}