import UtopiaItemBase from "../base-item.mjs";

export class Class extends UtopiaItemBase {

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.points = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.type = new fields.StringField({ required: true, nullable: false, initial: "martial", choices: {
      martial: "UTOPIA.Class.Type.Martial",
      arcane: "UTOPIA.Class.Type.Arcane",
      support: "UTOPIA.Class.Type.Support",
      innate: "UTOPIA.Class.Type.Innate",
    }});

    schema.actions = new fields.ArrayField(new fields.DocumentUUIDField({ required: true, nullable: false }), { required: true, nullable: false, initial: [] });
    schema.items = new fields.ArrayField(new fields.DocumentUUIDField({ required: true, nullable: false }), { required: true, nullable: false, initial: [] });
    schema.passives = new fields.StringField({ required: true, nullable: false, initial: "" });

    return schema;
  }
}