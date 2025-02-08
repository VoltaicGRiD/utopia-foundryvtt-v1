import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaAction extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.type = new fields.StringField({ required: false, nullable: false, initial: "standard", choices: {
      "standard": "UTOPIA.Item.Actions.Type.standard",
      "interrupt": "UTOPIA.Item.Actions.Type.interrupt",
      "special": "UTOPIA.Item.Actions.Type.special",
      "free": "UTOPIA.Item.Actions.Type.free",
    }});

    schema.cost = new fields.StringField({ required: false, nullable: true, initial: "1", choices: {
      "0": "0",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "inherit": "UTOPIA.Item.Actions.Cost.inherit",
      "double": "UTOPIA.Item.Actions.Cost.double",
    }});
    schema.stamina = new fields.NumberField({ required: false, nullable: false, initial: 0 });

    schema.source = new fields.DocumentUUIDField({ required: false, nullable: true });

    return schema;
  }

  prepareDerivedData() {

  }
}