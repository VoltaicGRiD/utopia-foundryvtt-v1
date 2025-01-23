import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpecies extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.block = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    });
    schema.dodge = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    }); 

    schema.constitution = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.endurance = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.effervescence = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });

    schema.subtraits = new fields.ArrayField(new fields.StringField());
    schema.languages = new fields.SetField(new fields.StringField());

    return schema;
  }
} 