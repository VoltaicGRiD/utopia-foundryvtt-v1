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

    //this._prepareSystemEffects(this);
  }

  _prepareSystemEffects(itemData) {
    //console.log("Preparing system effects for: ", itemData);
    if (!itemData.effects || itemData.effects.length === 0) return;
      
    for (const effect of itemData.effects) {
      if (effect.type === "gear" && itemData.type === "gear") {
        for (const change of effect.changes) {
          effect.apply(itemData, change);
          console.log("Applied change: ", change, "to item: ", itemData);
        }
      }
    }
  }
}