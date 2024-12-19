import UtopiaActorBase from "../base-actor.mjs";

export default class UtopiaCharacter extends UtopiaActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.experience= new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger }),
      next: new fields.NumberField({ ...requiredInteger }),
      previous: new fields.NumberField({ ...requiredInteger }),
    })

    schema.attributes = new fields.SchemaField({
      constitution: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
      endurance: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
      effervescence: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over trait names and create a new SchemaField for each.
    schema.traits = new fields.SchemaField(Object.keys(CONFIG.UTOPIA.traits).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    // Iterate over subtrait names and create a new SchemaField for each.
    schema.subtraits = new fields.SchemaField(Object.keys(CONFIG.UTOPIA.subtraits).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
      
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.traits) {
      for (let [k,v] of Object.entries(this.traits)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    if (this.subtraits) {
      for (let [k,v] of Object.entries(this.subtraits)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;
    data.shp = this.attributes.shp.value;
    data.dhp = this.attributes.dhp.value;
    data.blr = this.attributes.blr.value;
    data.dor = this.attributes.dor.value;

    return data
  }
}