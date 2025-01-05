import UtopiaItemBase from "./base-item.mjs";

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

    schema.costMultiplier = new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
      "none": "UTOPIA.SpellFeatures.Variables.none",
      "X": 'UTOPIA.SpellFeatures.Variables.nameX',
      "Y": 'UTOPIA.SpellFeatures.Variables.nameY',
      "Z": 'UTOPIA.SpellFeatures.Variables.nameZ',
    } });

    // Should any dice rolls be allowed to be redistributed? (e.g. 6d4 > 4d6 > 3d8 > 2d12) or (e.g. 50d4 > 25d8 > 20d10 > 10d20 > 2d100)
    schema.allowRedistribution = new fields.StringField({ required: false, nullable: true, initial: false, choices: {
      false: "No",
      true: "Yes"
    }});
    
    // Should only be used if the spell artistry is "Wake", since none of the other features will ever modify the AOE / Direction
    schema.doesTarget = new fields.StringField({ required: false, nullable: true, initial: false, choices: {
      false: "No",
      true: "Yes"
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

    return schema;
  }

  prepareDerivedData() {
    if (this.costMultiplier === "none") {
      this.costResult = `${this.cost} PP`;
    } else {
      this.costResult = `${this.cost}${this.costMultiplier} PP`;  
    }
  }
}