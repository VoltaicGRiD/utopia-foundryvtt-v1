import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpell extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });
    schema.arts = new fields.ArrayField(new fields.StringField());

    schema.duration = new fields.StringField();
    schema.aoe = new fields.StringField();
    schema.range = new fields.StringField();
    schema.cost = new fields.NumberField();

    schema.features = new fields.ObjectField();
    
    return schema;
  }
}