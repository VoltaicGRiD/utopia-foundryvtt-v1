import UtopiaItemBase from "../base-item.mjs";
import { SchemaArrayField } from "../fields/schema-set-field.mjs";


export class Quirk extends UtopiaItemBase {

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.points = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.attributes = new SchemaArrayField(
      new fields.SchemaField({
        key: new fields.StringField({ required: true, nullable: false }),
        value: new fields.StringField({ required: true, nullable: false }),
      }), { initial: [] }
    );

    return schema;
  }

  get attributeFields() {
    return [
      {
        field: this.schema.fields.points,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.attributes,
        stacked: false,
        editable: true,
      }
    ]
  }
}