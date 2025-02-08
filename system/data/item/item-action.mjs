import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaAction extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.type = new fields.StringField({ required: false, nullable: false, initial: "turn", choices: {
      "turn": "UTOPIA.Item.Actions.Type.turn",
      "interrupt": "UTOPIA.Item.Actions.Type.interrupt",
      "special": "UTOPIA.Item.Actions.Type.special",
      "free": "UTOPIA.Item.Actions.Type.free",
    }});

    schema.category = new fields.StringField({ required: false, nullable: false, initial: "attack", choices: {
      "attack": "UTOPIA.Item.Actions.Category.attack",
      "utility": "UTOPIA.Item.Actions.Category.utility",
      "defense": "UTOPIA.Item.Actions.Category.defense",
      "healing": "UTOPIA.Item.Actions.Category.healing",
      "movement": "UTOPIA.Item.Actions.Category.movement",
      "special": "UTOPIA.Item.Actions.Category.special",
      "macro": "UTOPIA.Item.Actions.Category.macro",
    }});

    schema.resource = new fields.StringField({ required: false, nullable: false });
    schema.consumed = new fields.NumberField({ required: false, nullable: false, initial: 0 });
    schema.macro = new fields.DocumentUUIDField({ required: false, nullable: true });
    schema.actor = new fields.StringField({ required: false, nullable: false, initial: "default", choices: {
      "default": "UTOPIA.Item.Actions.Actor.default",
      "self": "UTOPIA.Item.Actions.Actor.self",
      "target": "UTOPIA.Item.Actions.Actor.target",
    }});
    schema.template = new fields.StringField({ required: false, nullable: false, initial: "none", choices: {
      "none": "UTOPIA.Item.Actions.Template.none",
      "sbt": "UTOPIA.Item.Actions.Template.sbt",
      "mbt": "UTOPIA.Item.Actions.Template.mbt",
      "lbt": "UTOPIA.Item.Actions.Template.lbt",
      "xbt": "UTOPIA.Item.Actions.Template.xbt",
      "cone": "UTOPIA.Item.Actions.Template.cone",
      "line": "UTOPIA.Item.Actions.Template.line",
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
    schema.secret = new fields.BooleanField({ required: true, initial: false });
    
    return schema;
  }

  prepareDerivedData() {

  }
}