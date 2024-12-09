import UtopiaItemBase from "./base-item.mjs";

export default class UtopiaSpell extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    const spellArt = new fields.StringField({
      label: "Spell Art",
      choices: {
        "Array": "UTOPIA.Spells.Arts.array",
        "Alteration": "UTOPIA.Spells.Arts.alteration",
        "Divination": "UTOPIA.Spells.Arts.divination",
        "Enchantment": "UTOPIA.Spells.Arts.enchantment",
        "Evocation": "UTOPIA.Spells.Arts.evocation", 
        "Illusion": "UTOPIA.Spells.Arts.illusion",
        "Necromancy": "UTOPIA.Spells.Arts.necromancy",
        "Wake": "UTOPIA.Spells.Arts.wake",
      }
    });
    //schema.arts = new fields.ArrayField(new fields.StringField());
    schema.arts = new fields.SetField(spellArt);

    schema.duration = new fields.StringField({
      label: "Duration",
      choices: {
        "Immediate": "UTOPIA.Spells.Duration.instant",
        "Concentration": "UTOPIA.Spells.Duration.concentration",
        "1 Minute": "UTOPIA.Spells.Duration.1Minute",
        "1 Minute of Focus": "UTOPIA.Spells.Duration.1MinuteFocus",
        "1 Hour": "UTOPIA.Spells.Duration.1Hour",
        "1 Hour of Focus": "UTOPIA.Spells.Duration.1HourFocus",
      }
    });

    schema.aoe = new fields.StringField();

    schema.range = new fields.StringField({
      label: "Range",
      choices: {
        "Touch": "UTOPIA.Spells.Range.touch",
        "5M": "UTOPIA.Spells.Range.5M",
        "10M": "UTOPIA.Spells.Range.10M",
        "15M": "UTOPIA.Spells.Range.25M",
        "20M": "UTOPIA.Spells.Range.50M",
      }
    });

    schema.stamina = new fields.StringField({ blank: true });
    schema.type = new fields.StringField({ 
      label: "Spell Type",
      choices: {
        "Attack": "UTOPIA.Spells.Type.attack",
        "Utility": "UTOPIA.Spells.Type.utility",
        "Defense": "UTOPIA.Spells.Type.defense",
        "Healing": "UTOPIA.Spells.Type.healing",
      }
    });

    schema.choices = new fields.SchemaField({
      first: new fields.StringField({ blank: true }),
      second: new fields.StringField({ blank: true }),
      third: new fields.StringField({ blank: true }),
    });

    return schema;
  }
}