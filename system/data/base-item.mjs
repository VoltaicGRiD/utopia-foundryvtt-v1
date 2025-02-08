import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaItemBase extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, nullable: false });
    schema.formula = new fields.StringField({ required: true, nullable: true, validate: (v) => Roll.validate(v) });
    schema.flavor = new fields.StringField({ required: true, nullable: false });

    return schema;
  }

  get hasGmNotes() { 
    if (this.gmSecrets) return true 
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    Hooks.callAll("prepareItemData", this);
  }
}