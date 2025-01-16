import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaArchetype extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    
    schema.discovered = new fields.BooleanField({ required: true, nullable: false, initial: true });
    schema.depiction = new fields.SystemField({ required: true, nullable: false, initial: "UTOPIA.Item.Archetype.unknownDepiction" });
    schema.color = new fields.SetField(new fields.StringField({ required: false, nullable: true, initial: "red", choices: {
      red: "UTOPIA.Item.Archetype.Color.red",
      yellow: "UTOPIA.Item.Archetype.Color.yellow",
      green: "UTOPIA.Item.Archetype.Color.green",
      blue: "UTOPIA.Item.Archetype.Color.blue",
      orange: "UTOPIA.Item.Archetype.Color.orange",
      purple: "UTOPIA.Item.Archetype.Color.purple",
    } }), { required: false, nullable: true, initial: [] });
    schema.proverb = new fields.StringField({ required: true, nullable: false, initial: "UTOPIA.Item.Archetype.unknownProverb" });

    schema.exo = new fields.StringField({ required: true, nullable: false, initial: "logical", choices: {
      logical: "UTOPIA.Item.Archetype.Exo.logical",
      empathetic: "UTOPIA.Item.Archetype.Exo.empathetic",
      
    } });
    schema.endo = new fields.SchemaField({
      tempest: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      trickster: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      scholar: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
    })

    return schema;
  }

  prepareDerivedData() {
    // Average the endo values, if total is greater than 100, to their respective percentage
    const endo = this.endo;
    const total = endo.tempest + endo.trickster + endo.scholar;
    if (total > 100) {
      this.endo.tempest = Math.round(endo.tempest / total * 100);
      this.endo.trickster = Math.round(endo.trickster / total * 100);
      this.endo.scholar = Math.round(endo.scholar / total * 100);
    } else if (total < 100) {
      // If total is less than 100, add the difference to the highest value
      const max = Math.max(endo.tempest, endo.trickster, endo.scholar);
      if (max === endo.tempest) this.endo.tempest += 100 - total;
      else if (max === endo.trickster) this.endo.trickster += 100 - total;
      else if (max === endo.scholar) this.endo.scholar += 100 - total;
      else this.endo.tempest += 100 - total;
    } 


  }
}