import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaUser extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.favorites = new fields.SchemaField({
      spellFeatures: new fields.ArrayField(new fields.StringField())
    })

    return schema;
  }

}