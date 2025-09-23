import UtopiaItemBase from "../base-item.mjs";


export class Talent extends UtopiaItemBase {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    //TODO: Convert to a "TypedSchemaField" in the "talent" type
      
    schema.talentPoints = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.quirkPoints = new fields.NumberField({ required: true, nullable: false, initial: 0 });

    schema.options = new fields.SchemaField({
      choices: new fields.SetField(new fields.StringField(), { initial: [] }),
      category: new fields.StringField({ required: true, nullable: false, initial: "" }),
    });

    schema.grants = new fields.SetField(new fields.DocumentUUIDField({ type: "Item" }), { initial: [] });

    return schema;
  }
}