import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaGearFeature extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    schema.classifications = new fields.ObjectField({ required: false, nullable: true, initial: {} });

    return schema;
  }

  /** @override */
  async prepareDerivedData() {
    this.shared = this.classifications.shared;
    delete this.classifications.shared;

    Object.keys(this.classifications).forEach((classification) => {
      Object.keys(this.classifications[classification]).forEach((attribute) => {
        if (sharedAttributes.includes(attribute)) delete this.classifications[classification][attribute];

        const value = this.classifications[classification][attribute];
        if (attribute === "damage" && value === "0") {
          delete this.classifications[classification][attribute];
        }
        if (Array.isArray(value) && value.length === 0) {
          delete this.classifications[classification][attribute];
        }
        if (['material', 'refinement', 'power'].includes(attribute) && value === 0) {
          delete this.classifications[classification][attribute];
        }
        if (attribute === "maxStacks" && value <= 0) {
          this.classifications[classification][attribute] = "infinite";
        }
      });
    });

    console.warn(this);
  }
}