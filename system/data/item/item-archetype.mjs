import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaArchetype extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    
    schema.discovered = new fields.BooleanField({ required: true, nullable: false, initial: true });
    schema.depiction = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.proverb = new fields.StringField({ required: true, nullable: false, initial: "" });
    schema.color = new fields.SetField(new fields.StringField({ required: false, nullable: true, initial: "red", choices: {
      red: "UTOPIA.Item.Archetype.Color.red",
      yellow: "UTOPIA.Item.Archetype.Color.yellow",
      green: "UTOPIA.Item.Archetype.Color.green",
      blue: "UTOPIA.Item.Archetype.Color.blue",
      orange: "UTOPIA.Item.Archetype.Color.orange",
      purple: "UTOPIA.Item.Archetype.Color.purple",
    } }), { required: false, nullable: true, initial: [] });

    schema.exo = new fields.SchemaField({
      aristocrat: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      practitioner: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      construct: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    })
    schema.endo = new fields.SchemaField({
      tempest: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      trickster: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      scholar: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    })

    schema.maturity = new fields.StringField({ required: true, nullable: false, initial: "" })
    schema.immaturity = new fields.StringField({ required: true, nullable: false, initial: "" })

    return schema;
  }
 
  prepareDerivedData() {
    // Average the endo values, if total is greater than 100, to their respective percentage
    // const endo = this.endo;
    // const endoTotal = endo.tempest + endo.trickster + endo.scholar;
    // if (endoTotal > 100) {
    //   this.endo.tempest = Math.round(endo.tempest / endoTotal * 100);
    //   this.endo.trickster = Math.round(endo.trickster / endoTotal * 100);
    //   this.endo.scholar = Math.round(endo.scholar / endoTotal * 100);
    // } else if (endoTotal < 100) {
    //   // If total is less than 100, add the difference to the highest value
    //   const max = Math.max(endo.tempest, endo.trickster, endo.scholar);
    //   if (max === endo.tempest) this.endo.tempest += 100 - endoTotal;
    //   else if (max === endo.trickster) this.endo.trickster += 100 - endoTotal;
    //   else if (max === endo.scholar) this.endo.scholar += 100 - endoTotal;
    // } 

    // // Average the endo values, if total is greater than 100, to their respective percentage
    // const exo = this.exo;
    // const exoTotal = exo.tempest + exo.trickster + exo.scholar;
    // if (exoTotal > 100) {
    //   this.exo.tempest = Math.round(exo.tempest / exoTotal * 100);
    //   this.exo.trickster = Math.round(exo.trickster / exoTotal * 100);
    //   this.exo.scholar = Math.round(exo.scholar / exoTotal * 100);
    // } else if (exoTotal < 100) {
    //   // If total is less than 100, add the difference to the highest value
    //   const max = Math.max(exo.tempest, exo.trickster, exo.scholar);
    //   if (max === exo.tempest) this.exo.tempest += 100 - exoTotal;
    //   else if (max === exo.trickster) this.exo.trickster += 100 - exoTotal;
    //   else if (max === exo.scholar) this.exo.scholar += 100 - exoTotal;
    // } 
  }
}