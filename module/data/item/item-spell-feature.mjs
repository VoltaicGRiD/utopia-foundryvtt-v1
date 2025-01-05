import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpellFeature extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.formula = new fields.StringField({ required: false, nullable: true });

    schema.art = new fields.StringField({
      label: "Artistry",
      choices: {
        "array": "UTOPIA.Spells.Arts.array",
        "alteration": "UTOPIA.Spells.Arts.alteration",
        "divination": "UTOPIA.Spells.Arts.divination",
        "enchantment": "UTOPIA.Spells.Arts.enchantment",
        "evocation": "UTOPIA.Spells.Arts.evocation", 
        "illusion": "UTOPIA.Spells.Arts.illusion",
        "necromancy": "UTOPIA.Spells.Arts.necromancy",
        "wake": "UTOPIA.Spells.Arts.wake",
      }
    });

    // The PP Cost of the spell feature
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 0 })

    schema.costMultiplier = new fields.StringField({ required: false, nullable: true, initial: "flat", choices: {
      "flat": "UTOPIA.SpellFeatures.CostMultiplier.flat",
      "multiply": "UTOPIA.SpellFeatures.CostMultiplier.multiply",
      //"divide": "UTOPIA.SpellFeatures.CostMultiplier.divide",
      //"square": "UTOPIA.SpellFeatures.CostMultiplier.power",
    } });

    // Should any dice rolls be allowed to be redistributed? (e.g. 6d4 > 4d6 > 3d8 > 2d12) or (e.g. 50d4 > 25d8 > 20d10 > 10d20 > 2d100)
    schema.allowRedistribution = new fields.StringField({ required: false, nullable: true, initial: "false", choices: {
      "false": "No",
      "true": "Yes"
    }});
    
    // Should only be used if the spell artistry is "Wake", since none of the other features will ever modify the AOE / Direction
    schema.doesTarget = new fields.StringField({ required: false, nullable: true, initial: "false", choices: {
      "false": "No",
      "true": "Yes"
    }});

    // Don't even need to bother if the "doesTarget" is false
    schema.targetType = new fields.StringField({ required: false, nullable: false, initial: "point", choices: {
      "point": "UTOPIA.SpellFeatures.TargetType.point",
      "template": "UTOPIA.SpellFeatures.TargetType.template",
      "attach": "UTOPIA.SpellFeatures.TargetType.attach",
    } });

    // Only shown if the targetType is "template"
    schema.templateType = new fields.StringField({ required: false, nullable: false, initial: "circle", choices: {
      "circle": "CONTROLS.MeasureCircle",
      "cone": "CONTROLS.MeasureCone",
      "rectangle": "CONTROLS.MeasureRect",
      "ray": "CONTROLS.MeasureRay",
    } });

    // Only used for Cone templates
    schema.templateAngle = new fields.AngleField({ required: false, nullable: true, initial: 53.13 });

    schema.variables = new fields.ObjectField();

    schema.modifies = new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
      "none": "UTOPIA.SpellFeatures.Modifies.none",
      "range": "UTOPIA.SpellFeatures.Modifies.range",
      "duration": "UTOPIA.SpellFeatures.Modifies.duration",
      "aoe": "UTOPIA.SpellFeatures.Modifies.aoe",
      //"formula": "UTOPIA.SpellFeatures.Modifies.formula",
    }});

    schema.modifiedAoE = new fields.SchemaField({
      value: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      variable: new fields.StringField({ required: false, nullable: true, initial: "X" }),
      unit: new fields.StringField({ required: false, nullable: true, initial: "meters", choices: {
        "meters": "UTOPIA.SpellFeatures.AoE.meters",
      }}),
      measured: new fields.StringField({ required: false, nullable: true, initial: "radius", choices: {
        "radius": "UTOPIA.SpellFeatures.AoE.radius",
        "diameter": "UTOPIA.SpellFeatures.AoE.diameter",
        "area": "UTOPIA.SpellFeatures.AoE.area",
        "volume": "UTOPIA.SpellFeatures.AoE.volume",
      }}),
      type: new fields.StringField({ required: false, nullable: true, initial: "point", choices: {
        "point": "UTOPIA.SpellFeatures.AoE.point",
        "template": "UTOPIA.SpellFeatures.AoE.template",
        "attach": "UTOPIA.SpellFeatures.AoE.attach",
      }}),
      shape: new fields.StringField({ required: false, nullable: true, initial: "circle", choices: {
        "circle": "CONTROLS.MeasureCircle",
        "cone": "CONTROLS.MeasureCone",
        "rectangle": "CONTROLS.MeasureRect",
        "ray": "CONTROLS.MeasureRay",
      }}),
    });
    schema.modifiedRange = new fields.SchemaField({
      value: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      variable: new fields.StringField({ required: false, nullable: true, initial: "X" }),
      unit: new fields.StringField({ required: false, nullable: true, initial: "meters", choices: {
        "meters": "UTOPIA.SpellFeatures.Range.meters",
        "kilometers": "UTOPIA.SpellFeatures.Range.kilometers",
      }})
    });
    schema.modifiedDuration = new fields.SchemaField({
      value: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      variable: new fields.StringField({ required: false, nullable: true, initial: "X" }),
      unit: new fields.StringField({ required: false, nullable: true, initial: "turns", choices: {
        "turns": "UTOPIA.SpellFeatures.Duration.turns",
        "minutes": "UTOPIA.SpellFeatures.Duration.minutes",
        "hours": "UTOPIA.SpellFeatures.Duration.hours",
        "days": "UTOPIA.SpellFeatures.Duration.days",
        "months": "UTOPIA.SpellFeatures.Duration.months",
        "years": "UTOPIA.SpellFeatures.Duration.years",
      }}),
      requirements: new fields.StringField({ required: false, nullable: true, initial: "focus", choices: {
        "none": "UTOPIA.SpellFeatures.DurationRequirements.none",
        "focus": "UTOPIA.SpellFeatures.DurationRequirements.focus",
        "concentration": "UTOPIA.SpellFeatures.DurationRequirements.concentration",
      }}),
      dispelInterruptCost: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      dispelActionCost: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
    });
    schema.modifiedFormula = new fields.SchemaField({
      how: new fields.StringField({ required: false, nullable: true, initial: "add", choices: {
        "add": "UTOPIA.SpellFeatures.Formula.how.add",
        "subtract": "UTOPIA.SpellFeatures.Formula.how.subtract",
        //"replace": "UTOPIA.SpellFeatures.Formula.how.replace",
      }}),
      value: new fields.StringField({ required: false, nullable: true, initial: "" }),
      replace: new fields.StringField({ required: false, nullable: true, initial: "" }),
    });

    schema.variableName = new fields.StringField({ required: true, nullable: false, initial: "Variable" });
    schema.variableDescription = new fields.StringField({ required: false, nullable: true, initial: "" });
    schema.character = new fields.StringField({ required: true, nullable: false, initial: "A" });
    schema.kind = new fields.StringField({ required: true, nullable: false, initial: "none", choices: {
      "none": "UTOPIA.SpellFeatures.Variables.none",
      "number": "UTOPIA.SpellFeatures.Variables.number",
      "text": "UTOPIA.SpellFeatures.Variables.text",
      "options": "UTOPIA.SpellFeatures.Variables.options",
      "dice": "UTOPIA.SpellFeatures.Variables.dice",
    }});
    schema.dice = new fields.StringField({ required: false, nullable: true, initial: "", validate: ((value, options) => {
      console.log("Validating dice", value);
      return Roll.validate(value);
    })});
    schema.minimum = new fields.NumberField({ required: false, nullable: true, initial: 0 });
    schema.maximum = new fields.NumberField({ required: false, nullable: true, initial: 0 });

    return schema;
  }

  prepareDerivedData() {
    if (this.costMultiplier === "flat") {
      this.costResult = `${this.cost} PP`;
    } else if (this.costMultiplier === "multiply") {
      this.costResult = `${this.cost}X PP`;  
    } 
  }
}