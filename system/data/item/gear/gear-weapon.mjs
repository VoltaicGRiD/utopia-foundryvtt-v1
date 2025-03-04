import UtopiaGearBase from "./base-gear.mjs";

export default class UtopiaWeapon extends UtopiaGearBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    schema.handheld = new fields.BooleanField({ required: true, initial: true, validate: (value) => {
      if (this.equippable && this.handheld) return false;
    }});

    schema.strike = new fields.SchemaField({
      strikeId: new fields.StringField({...requiredString, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString, initial: "Strike"}),
      damage: new fields.StringField({...requiredString}),
      estimate: new fields.NumberField({...requiredInteger, initial: 0}),
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

    schema.damage = new fields.StringField({ ...requiredString, validate: (value) => {
      return Roll.validate(value);
    }})
    schema.meleeDamageModifierTraitChoice = new fields.BooleanField({ required: true, nullable: false, initial: true });
    schema.meleeDamageModifierTrait = new fields.StringField({ ...requiredString, initial: "none" })
    schema.rangedDamageModifierTraitChoice = new fields.BooleanField({ required: true, nullable: false, initial: true });
    schema.rangedDamageModifierTrait = new fields.StringField({ ...requiredString, initial: "none" })
    schema.damageTemplate = new fields.StringField({ ...requiredString, initial: "none" });
    schema.reach = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.closeRange = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.farRange = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.accuracyFavor = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.accuracyTrait = new fields.StringField({ ...requiredString, initial: "default" });
    schema.ignoreSHP = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.ignoreDefense = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.shpPercentage = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.dhpPercentage = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.objectPercentage = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.blindingActions = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.blindingTrait = new fields.StringField({ ...requiredString, initial: "none" });
    schema.blindingDuration = new fields.NumberField({ ...requiredInteger, initial: 1 }); // Rounds (until beginning of user's next turn)
    schema.confusingActions = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.confusingTrait = new fields.StringField({ ...requiredString, initial: "none" });
    schema.confusingDuration = new fields.NumberField({ ...requiredInteger, initial: 1 }); // Rounds (until beginning of user's next turn)
    schema.blastingLineWidth = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.blastingAccuracyRequired = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.boomingConeDegrees = new fields.NumberField({ ...requiredInteger, initial: 90 });
    schema.boomingAccuracyRequired = new fields.BooleanField({ ...requiredString, initial: false });
    schema.armed = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.rechargeAfter = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.rechargeTrait = new fields.StringField({ ...requiredString, initial: "none" });
    schema.rechargeActions = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.returnDamage = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.returnDamageType = new fields.StringField({ ...requiredString, initial: "physical" });
    schema.nonLethal = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}