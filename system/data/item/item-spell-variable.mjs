import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpellVariable extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.name = new fields.StringField({ required: true, nullable: false, initial: "Variable" });
    schema.description = new fields.StringField({ required: false, nullable: true, initial: "" });
    schema.character = new fields.StringField({ required: true, nullable: false, initial: "A" });
    schema.kind = new fields.StringField({ required: true, nullable: false, initial: "none", choices: {
      "none": "UTOPIA.Item.SpellFeatures.Variables.none",
      "number": "UTOPIA.Item.SpellFeatures.Variables.number",
      "options": "UTOPIA.Item.SpellFeatures.Variables.options",
      "dice": "UTOPIA.Item.SpellFeatures.Variables.dice",
    }});
    schema.options = new fields.ArrayField(new fields.StringField());
    schema.description = new fields.StringField({ required: false, nullable: true, initial: "" });
    schema.dice = new fields.StringField({ required: false, nullable: true, initial: "", validate: ((value, options) => {
      console.log("Validating dice", value);
      return Roll.validate(value);
    })});
    schema.minimum = new fields.NumberField({ required: false, nullable: true, initial: 0 });
    schema.maximum = new fields.NumberField({ required: false, nullable: true, initial: 0 });

    return schema;
  }
}