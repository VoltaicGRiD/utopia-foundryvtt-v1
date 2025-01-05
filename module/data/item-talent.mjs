import UtopiaItemBase from "./base-item.mjs";

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
    schema.position = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.formula = new fields.StringField({ required: true, nullable: true, validate: (v) => Roll.validate(v) });

    // Primarily used by the Magecraft tree for allowing the player to choose the artistry
    // Not sure the best way to handle this, should it change this item's name and description, or should it grant a separate item?
    schema.choices = new fields.SetField(new fields.StringField({ required: false, nullable: false }));
    schema.category = new fields.StringField({ required: false, nullable: false });
        
    schema.isSpecies = new fields.BooleanField({ required: false, nullable: false, default: true });

    return schema;
  }
}