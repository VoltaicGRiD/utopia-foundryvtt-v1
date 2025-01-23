import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaTokenCharacter extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    return schema;
  }
}