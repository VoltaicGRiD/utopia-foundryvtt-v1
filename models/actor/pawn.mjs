import UtopiaActorBase from "../base-actor.mjs";

export class Pawn extends UtopiaActorBase {

  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: false,
        disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
        sight: {
          enabled: true
        }
      }
    });
  }

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const required = { required: true, nullable: false, initial: 0 }
    const FormulaField = () => new fields.StringField({ required: true, nullable: true, validate: (v) => Roll.validate(v) });
    const ResourceField = () => new fields.SchemaField({
      value: new fields.NumberField({ ...required }),
      max: new fields.NumberField({ ...required })
    });

    schema.difficulty = new fields.NumberField({ ...required, initial: 1 });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this._prepareKit();
  }

  _prepareKit() {
    if (this.parent.items.filter(i => i.type === "species").length === 0) {
      return this._prepareSpeciesDefault();
    } 

    const species = this.parent.items.find(i => i.type === "species");
    if (!species) {
      return this._prepareSpeciesDefault();
    }

    this._species = species;
    this._speciesData = species.system;
  }
}