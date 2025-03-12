import UtopiaActorBase from "../base-actor.mjs";

export class Character extends UtopiaActorBase {

  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
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
    const PointField = (initial) => new fields.SchemaField({
      available: new fields.NumberField({ ...required, initial: initial }),
      bonus: new fields.NumberField({ ...required, initial: 0 }),
      spent: new fields.NumberField({ ...required, initial: 0 })
    })

    schema.level = new fields.NumberField({ ...required, initial: 10 });
    schema.experience = new fields.NumberField({ ...required });
    schema.tags = new fields.SetField(new fields.StringField({ required: true, nullable: false }));
    schema.giftPoints = PointField(0);
    schema.subtraitPoints = PointField(0);
    schema.talentPoints = PointField(0);
    schema.specialistPoints = PointField(0);
    schema.languagePoints = PointField(0);
    schema.components = new fields.SchemaField({});
    for (const [component, componentValue] of Object.entries(CONFIG.UTOPIA.COMPONENTS)) {
      schema.components[component] = new fields.SchemaField({});
      for (const [rarity, rarityValue] of Object.entries(CONFIG.UTOPIA.RARITIES)) {
        schema.components[component][rarity] = new fields.SchemaField({});
        schema.components[component][rarity].available = new fields.NumberField({ ...required, initial: 0 });
        schema.components[component][rarity].craftable = new fields.BooleanField({ required: true, nullable: false, initial: rarity === "crude" ? true : false });        
        schema.components[component][rarity].trait = new fields.StringField({ required: true, nullable: false, initial: "eng" });
      }
    }   

    return schema;
  }

  get headerFields() {
    return [
      ...super.headerFields,
      {
        field: this.schema.fields.level,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.experience,
        stacked: false,
        editable: true,
      },
    ]
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    try { this._preparePoints(); } catch (e) { console.error(e); }
    //try { this._prepareTraits(); } catch (e) { console.error(e); }
  }

  _preparePoints() {
    this.points = {};
    for (const item of this.parent.items.filter(i => i.type === "talent")) {
      this.points.body += item.system.body;
      this.points.mind += item.system.mind;
      this.points.soul += item.system.soul;
    }
    
    this.talentPoints.spent = this.points.body + this.points.mind + this.points.soul;
    this.talentPoints.available = this.level - this.talentPoints.spent + this.talentPoints.bonus;
    
    this.specialistPoints.spent = this.parent.items.filter(i => i.type === "specialist").length;
    this.specialistPoints.available = Math.floor(this.level / 10) - this.specialistPoints.spent + this.specialistPoints.bonus;
  }
}