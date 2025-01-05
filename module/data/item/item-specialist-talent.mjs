import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpecialistTalent extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.requirements = new fields.SetField(new fields.StringField(), { required: true, nullable: true, initial: [] });
    schema.grants = new fields.SetField(new fields.DocumentUUIDField({ type: "Item" }), { required: true, nullable: true, initial: [] });

    return schema;
  }
}