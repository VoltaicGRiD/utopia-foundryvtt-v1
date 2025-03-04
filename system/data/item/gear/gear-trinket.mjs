import UtopiaGearBase from "./base-gear.mjs";

export default class UtopiaTrinket extends UtopiaGearBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    schema.defenses = new fields.SchemaField({
      chill: new fields.NumberField({...requiredInteger}),
      heat: new fields.NumberField({...requiredInteger}),
      physical: new fields.NumberField({...requiredInteger}),
      energy: new fields.NumberField({...requiredInteger}),
      psyche: new fields.NumberField({...requiredInteger}),
    });

    schema.strike = new fields.SchemaField({
      strikeId: new fields.StringField({...requiredString, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString, initial: "Strike"}),
      damage: new fields.StringField({...requiredString}),
      accuracy: new fields.BooleanField({required: true, initial: false}),
      flavor: new fields.StringField({...requiredString}),
      template: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.Gear.Strike.Template.none",
        "sbt": "UTOPIA.Item.Gear.Strike.Template.sbt",
        "mbt": "UTOPIA.Item.Gear.Strike.Template.mbt",
        "lbt": "UTOPIA.Item.Gear.Strike.Template.lbt",
        "xbt": "UTOPIA.Item.Gear.Strike.Template.xbt",
        "cone": "UTOPIA.Item.Gear.Strike.Template.cone",
        "line": "UTOPIA.Item.Gear.Strike.Template.line",
      }}),
      range: new fields.SchemaField({
        close: new fields.NumberField({...requiredInteger}),
        far: new fields.NumberField({...requiredInteger}),
      }),
      resource: new fields.StringField({required: true, nullable: false}),
      consumed: new fields.NumberField({...requiredInteger, initial: 0}),
      contest: new fields.SchemaField({
        trait: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
          "none": "UTOPIA.Item.Gear.Strike.Contest.Trait.none",
          "agi": "UTOPIA.Item.Gear.Strike.Contest.Trait.agi",
          "str": "UTOPIA.Item.Gear.Strike.Contest.Trait.str",
          "int": "UTOPIA.Item.Gear.Strike.Contest.Trait.int",
          "wil": "UTOPIA.Item.Gear.Strike.Contest.Trait.wil",
          "dis": "UTOPIA.Item.Gear.Strike.Contest.Trait.dis",
          "cha": "UTOPIA.Item.Gear.Strike.Contest.Trait.cha",  
        }}),
        against: new fields.StringField({...requiredString}),
      })
    })
    schema.strikes = new fields.ArrayField(schema.strike, { required: true, nullable: false, initial: [schema.strike.getInitialValue()] });  

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}