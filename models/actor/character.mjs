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
    try { this._prepareTraits() } catch (e) { console.error(e) }
    try { this._prepareSpecies() } catch (e) { console.error(e) }
    try { this._prepareDefenses() } catch (e) { console.error(e) }
    try { this._prepareTalents() } catch (e) { console.error(e) }
    try { this._preparePoints(); } catch (e) { console.error(e); }
    try { this._prepareAttributes(); } catch (e) { console.error(e); }
  }
  
  _prepareAttributes() {
    this.hitpoints.surface.max += (this.body * this.constitution) + this.level;
    this.hitpoints.deep.max += (this.soul * this.effervescence) + this.level;
    this.stamina.max += (this.mind * this.endurance) + this.level;

    this.hitpoints.surface.value = Math.min(this.hitpoints.surface.value, this.hitpoints.surface.max);
    this.hitpoints.deep.value = Math.min(this.hitpoints.deep.value, this.hitpoints.deep.max);
    this.stamina.value = Math.min(this.stamina.value, this.stamina.max);

    this.canLevel = this.experience >= this.level * 100;
  }

  _preparePoints() {
    this.points = {
      body: 0,
      mind: 0,
      soul: 0
    };

    for (const item of this.parent.items.filter(i => i.type === "talent")) {
      this.points.body += item.system.body;
      this.points.mind += item.system.mind;
      this.points.soul += item.system.soul;
    };
    
    this.talentPoints.spent = this.points.body + this.points.mind + this.points.soul;
    this.talentPoints.available = this.level - this.talentPoints.spent + this.talentPoints.bonus;
    
    this.specialistPoints.spent = this.parent.items.filter(i => i.type === "specialist").length;
    this.specialistPoints.available = Math.floor(this.level / 10) - this.specialistPoints.spent + this.specialistPoints.bonus;
  }

  _prepareTalents() {
    this.body = 0;
    this.mind = 0;
    this.soul = 0;

    const talents = this.parent.items.filter(i => i.type === "talent");
    for (const talent of talents) {
      this.body += talent.system.body;
      this.mind += talent.system.mind;
      this.soul += talent.system.soul;
    }
  }

  _prepareDefenses() {
    this.defenses = {
      energy:    this.innateDefenses.energy    + this.armorDefenses.energy,
      heat:      this.innateDefenses.heat      + this.armorDefenses.heat,
      chill:     this.innateDefenses.chill     + this.armorDefenses.chill,
      physical:  this.innateDefenses.physical  + this.armorDefenses.physical,
      psyche:    this.innateDefenses.psyche    + this.armorDefenses.psyche,
    }
  }

  _prepareTraits() {
    console.log(this);

    for (const [key, trait] of Object.entries(this.traits)) {
      trait.total = trait.value + trait.bonus;
    }

    for (const [key, subtrait] of Object.entries(this.subtraits)) {
      subtrait.total = subtrait.value + subtrait.bonus;
      if (subtrait.total === 0) subtrait.value = 1;
      subtrait.total = subtrait.value + subtrait.bonus;
      if (subtrait.gifted) subtrait.mod = Math.max(subtrait.total - 4, 0);
      else subtrait.mod = subtrait.total - 4;
      this.traits[subtrait.parent].total += subtrait.total;
      //this.traits[subtrait.parent].mod = this.traits[subtrait.parent].total - 4;
    }

    for (const [key, trait] of Object.entries(this.traits)) {
      trait.mod += trait.total;
      trait.mod = trait.mod - 4;
    }

    this.spellcasting.spellcap = this.subtraits.res.total;
  }
  
  async _prepareSpecies() {
    if (this.parent.items.filter(i => i.type === "species").length === 0) {
      return this._prepareSpeciesDefault();
    } 

    const species = this.parent.items.find(i => i.type === "species");
    this._speciesData = species;

    if (this.languagePoints) this.languagePoints.available += this._speciesData.system.communication.languages - this.languagePoints.spent;
    if (this.communication) this.communication.telepathy = this._speciesData.system.communication.telepathy;
    this.size = this._speciesData.system.size;

    this.travel = {
      land: { speed: 0, stamina: 0 },
      water: { speed: 0, stamina: 0 },
      air: { speed: 0, stamina: 0 }
    }

    this.block = {
      size: this._speciesData.system.block.size,
      quantity: this._speciesData.system.block.quantity
    }

    this.dodge = {
      size: this._speciesData.system.dodge.size,
      quantity: this._speciesData.system.dodge.quantity
    }

    for (const [key, value] of Object.entries(this._speciesData.system.travel)) {
      const rolldata = await this.parent.getRollData();
      const innateRoll = new Roll(String(this.innateTravel[key].speed), rolldata);
      await innateRoll.evaluate();  
      this.travel[key].speed = innateRoll.total;

      const speciesRoll = new Roll(String(value.speed), rolldata);
      await speciesRoll.evaluate();
      this.travel[key].speed += speciesRoll.total;
    }

    this.constitution += this._speciesData.system.constitution;
    this.endurance += this._speciesData.system.endurance;
    this.effervescence += this._speciesData.system.effervescence;
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