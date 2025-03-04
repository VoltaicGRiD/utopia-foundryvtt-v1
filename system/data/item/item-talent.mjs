import { isNumeric } from "../../helpers/numeric.mjs";
import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaTalent extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.points = new fields.SchemaField({
      body: new fields.StringField({ required: true, nullable: false, initial: "0" }),
      mind: new fields.StringField({ required: true, nullable: false, initial: "0" }),
      soul: new fields.StringField({ required: true, nullable: false, initial: "0" }),
    });
    
    schema.tree = new fields.StringField({ required: true, nullable: false });
    schema.speciesTree = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.branch = new fields.StringField({ required: true, nullable: false, initial: '1' });
    schema.tier = new fields.NumberField({ ...requiredInteger, initial: 1 });

    schema.automated = new fields.BooleanField({ required: false, initial: false });

    // Primarily used by the Magecraft tree for allowing the player to choose the artistry
    // Not sure the best way to handle this, should it change this item's name and description, or should it grant a separate item?
    schema.choices = new fields.SetField(new fields.StringField({ required: false, nullable: false }));
    schema.category = new fields.StringField({ required: false, nullable: false });

    schema.copy = new fields.SchemaField({
      enabled: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      options: new fields.SetField(new fields.DocumentUUIDField()),
    })

    schema.grants = new fields.SetField(new fields.DocumentUUIDField({ type: "Item" }), { required: true, nullable: true, initial: [] });
            
    schema.customSpecies = new fields.SchemaField({
      onlyCustom: new fields.BooleanField({ required: true, initial: false }),
      species: new fields.SetField(new fields.StringField({ required: true, nullable: false })),
      quirkPoints: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      talentPoints: new fields.NumberField({ ...requiredInteger, initial: 1 })
    })

    return schema;
  }

  static migrateData(source) {
    if (source.tree.includes('-')) {
      const parts = source.tree.split('-')
      source.tree = parts[0];
      if (isNumeric(parts[1]) === true)
        source.branch = parseFloat(parts[1]);
      else {
        source.branch = parts[1];
        source.speciesBranch = true;
      }
    }

    const species = source.tree.split(' ')[1] ?? undefined;
    const subspecies = source.tree.split(' ')[0] ?? undefined;

    // if (species && subspecies) {
    //   source.tree = `${species}-${subspecies}`
    // }

    //source.speciesTree = source.speciesBranch ?? false;

    if (source.isSpecies === true) {
      source.speciesTree = true;
    }

    if (source.position) 
      source.tier = source.position;

    return super.migrateData(source);
  }
}