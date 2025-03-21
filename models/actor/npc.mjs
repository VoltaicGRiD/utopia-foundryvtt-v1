import UtopiaActorBase from "../base-actor.mjs";

export class NPC extends UtopiaActorBase {

  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
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

    schema.level = new fields.NumberField({ ...required, initial: 10 });
    schema.experience = new fields.NumberField({ ...required });

    



    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this._prepareSpecies();
  }

  _prepareSpecies() {
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

  async _prepareSpeciesDefault() {
    this._speciesData = {
      name: "Human",
      system: {
        travel: {
          land: "@spd.total",
          water: 0,
          air: 0
        },
        size: "medium",
        communication: {
          languages: 2,
          telepathy: false
        }
      }
    }

    if (this.languagePoints) this.languagePoints.available = this._speciesData.system.communication.languages;
    if (this.communication) this.communication.telepathy = this._speciesData.system.communication.telepathy;
    this.size = this._speciesData.system.size;
    
    this.travel = {
      land: { speed: 0, stamina: 0 },
      water: { speed: 0, stamina: 0 },
      air: { speed: 0, stamina: 0 }
    }

    for (const [key, value] of Object.entries(this._speciesData.system.travel)) {
      this.travel[key].speed = await new Roll(String(this.innateTravel[key].speed), this.parent.getRollData()).evaluate().total;
      this.travel[key].speed += await new Roll(String(value.speed), this.parent.getRollData()).evaluate().total;
    }
  }
}