import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaItemBase extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.items = new fields.SetField(new fields.ForeignDocumentField({ entityClass: "Item" }), {required: false, nullable: true, initial: [] });
    schema.capacity = new fields.NumberField({ required: false, nullable: true, initial: 0 });
    schema.value = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.slots = new fields.NumberField({ required: true, nullable: false, initial: 1 });

    return schema;
  }
}