import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaItemBase extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    Hooks.callAll("prepareItemData", this);
  }
}