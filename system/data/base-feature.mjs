import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaFeatureBase extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    
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