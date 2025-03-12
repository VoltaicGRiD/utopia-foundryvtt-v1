import UtopiaItemBase from "../base-item.mjs";


export class Quirk extends UtopiaItemBase {

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.points = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.attributes = new fields.SetField(
      new fields.SchemaField({
        key: new fields.StringField({ required: true, nullable: false }),
        value: new fields.StringField({ required: true, nullable: false }),
      }), { label: "UTOPIA.Quirk.Attributes.label", hint: "UTOPIA.Quirk.Attributes.hint" }
    );

    return schema;
  }
}