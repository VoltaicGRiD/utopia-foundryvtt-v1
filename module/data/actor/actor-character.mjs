import UtopiaActorBase from "../base-actor.mjs";

export default class UtopiaCharacter extends UtopiaActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Turn and Interrupt Actions
    schema.ta = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 6 }),
      max: new fields.NumberField({...requiredInteger, initial: 6 }),
    });
    schema.ia = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 3 }),
      max: new fields.NumberField({...requiredInteger, initial: 3 }),
    });

    // SHP, DHP, and Stamina
    schema.shp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });
    schema.dhp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });
    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });

    // Block and Dodge
    schema.block = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 4 }),
    });
    schema.dodge = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 12 }),
    });

    // Defenses
    schema.defenses = new fields.SchemaField({  
      chill: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      energy: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      heat: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      physical: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      psyche: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    });

    // TODO: Add validation that the strings are one of the traits or subtraits
    // Favors and Disfavors
    schema.favors = new fields.ArrayField(new fields.StringField());
    schema.disfavors = new fields.ArrayField(new fields.StringField());

    // Talent Trees
    schema.trees = new fields.ArrayField(new fields.StringField());
    
    // TODO: Add validation that the strings are one of the valid damage types
    // Resistance, Immunity, and Vulnerability
    schema.resistances = new fields.ArrayField(new fields.StringField());
    schema.immunities = new fields.ArrayField(new fields.StringField());
    schema.vulnerabilities = new fields.ArrayField(new fields.StringField());

    // Spellcap
    schema.spellcap = new fields.NumberField({ ...requiredInteger, initial: 0 });
    
    // Biography
    schema.biography = new fields.StringField();

    // Attributes
    schema.attributes = new fields.SchemaField({
      constitution: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      endurance: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      effervescence: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    });

    // Points
    schema.points = new fields.SchemaField({
      body: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mind: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      soul: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      talent: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      specialist: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      gifted: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      subtrait: new fields.NumberField({ ...requiredInteger, initial: 15 }),
    });

    schema.species = new fields.ObjectField({ required: true, nullable: false, initial: {}});

    // Traits
    schema.traits = new fields.SchemaField({
      agi: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          spd: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          dex: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
      str: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          pow: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          for: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
      int: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          eng: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          mem: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
      wil: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          res: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          awa: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
      dis: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          por: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          stu: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
      cha: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          app: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
          lan: new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
            mod: new fields.NumberField({ ...requiredInteger, initial: -3 }),
            gifted: new fields.BooleanField({ initial: false }),
          }),
        }),
        value: new fields.NumberField({ ...requiredInteger, initial: 2 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: -2 }),
      }),
    })

    schema.enableArtifice = new fields.BooleanField({ initial: false });
    schema.artificeLevel = new fields.NumberField({ ...requiredInteger, initial: -1 }); // -1 means not enabled

    schema.enableSpellcraft = new fields.BooleanField({ initial: false });
    schema.spellcraftArtistries = new fields.SetField(new fields.StringField());

    return schema;
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    //this._prepareNpcData(actorData);
  }

  *allApplicableEffects() {
    for (const effect of this.effects) {
      if (effect.type !== "gear") {
        yield effect;
      }
    } if (CONFIG.ActiveEffect.legacyTransferral) return;
    for (const item of this.items) {
      for (const effect of item.effects) {
        if (effect.type !== "gear") {
          if (effect.transfer) yield effect;
        }
      }
    }
  }

  /**
   * Prepare Character type specific data
   */
  async _prepareCharacterData(actorData) {    
    // Make modifications to data here. For example:
    //sum = sum + systemData.traits[key].subtraits[sub].value;    console.log(systemData);

    let bodyScore = 0;
    let mindScore = 0;
    let soulScore = 0;

    let artistries = [];

    for (let i of this.parent.items) {
      if (i.type === 'talent') {
        bodyScore += parseInt(i.system.points.body);
        mindScore += parseInt(i.system.points.mind);
        soulScore += parseInt(i.system.points.soul);

        if (i.system.category && i.system.category.toLowerCase().includes("artistry")) {
          artistries.push(Array.from(i.system.choices)[0]);
        }
      }
    }

    this.artistries = artistries;

    this.points.body = parseInt(bodyScore);
    this.points.mind = parseInt(mindScore);
    this.points.soul = parseInt(soulScore);

    // Do we calculate the level from the experience,
    // or do we calculate the experience from the level?

    // Characters start at level 10, with 0 XP total,
    // Each level increases the XP requirement by 100
    // I think we have a global EXP value for the character
    // which is used to calculate both the level and the
    // experience required for the next level.

    // The SRD states that the level is equivalent to the
    // sum of all unspent, and spent, Talent Points.

    // The SRD also states that the EXP required for the next
    // level is equal to the current level * 100.

    // Ensure experience and level are initialized
    if (!this.experience) {
      this.experience = { value: 0 };
    }

    if (typeof this.level !== 'number') {
      this.level = 10;
    }

    // Ensure experience.value is a number
    this.experience.value = Number(this.experience.value) || 0;

    // Calculate the current level based on total experience
    this.level = calculateLevelFromExperience(this.experience.value);

    // Calculate experience thresholds for the current and next levels
    this.experience.previous = getTotalExpForLevel(this.level);
    this.experience.next = getTotalExpForLevel(this.level + 1);

    // Functions for experience calculations
    function getTotalExpForLevel(N) {
      // Characters start at level 10 with 0 XP
      if (N <= 10) return 0;
      return 100 * (((N - 1) * N) / 2 - 45);
    }

    function calculateLevelFromExperience(expValue) {
      // Solve the quadratic equation: N^2 - N - 2S = 0
      let S = expValue / 100 + 45;
      let discriminant = 1 + 8 * S;
      let sqrtDiscriminant = Math.sqrt(discriminant);
      let N = (1 + sqrtDiscriminant) / 2;
      return Math.floor(N);
    }

    this.points.talent = this.level - (this.points.body + this.points.mind + this.points.soul);
    this.points.specialist = this.level % 10 + 1;

    for (let i of this.parent.items) {
      if (i.type === 'specialist') {
        this.points.specialist -= 1;
      }
    }

    const body = this.points.body;
    const mind = this.points.mind;
    const soul = this.points.soul;
    const con = this.attributes.constitution;
    const end = this.attributes.endurance;
    const eff = this.attributes.effervescence;
    const lvl = this.level;

    // Surface HP (SHP) is calculated from Body points
    this.shp.max = body * con + lvl;
    if (this.shp.value > this.shp.max) {
      this.shp.value = this.shp.max;
    }
    
    // Deep HP (DHP) is calculated from Soul points
    this.dhp.max = soul * eff + lvl;
    if (this.dhp.value > this.dhp.max) {
      this.dhp.value = this.dhp.max;
    }

    // Maximum stamina is calculated from mind
    this.stamina.max = mind * end + lvl;
    if (this.stamina.value > this.stamina.max) {
      this.stamina.value = this.stamina.max;
    }

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.traits) {
      const parent = this.traits[key].parent;

      let subtraits = this.traits[key].subtraits;
      Object.keys(subtraits).forEach((k) => {
        this.traits[key].subtraits[k].mod = subtraits[k].value - 4;

        if (this.traits[key].subtraits[k].gifted === true) {
          switch(parent) {
            case "body":
              this.traits[key].subtraits[k].max = body * 2;
              break;
            case "mind":
              this.traits[key].subtraits[k].max = mind * 2;
              break;
            case "soul": 
              this.traits[key].subtraits[k].max = soul * 2;
              break;
            initial:
              this.traits[key].subtraits[k].max = 99;
              break;
          }

          if (this.traits[key].subtraits[k].mod < 0) {
            this.traits[key].subtraits[k].mod = 0;
          }
        }
        else {
          switch(parent) {
            case "body":
              this.traits[key].subtraits[k].max = body;
              break;
            case "mind":
              this.traits[key].subtraits[k].max = mind;
              break;
            case "soul": 
              this.traits[key].subtraits[k].max = soul;
              break;
            initial:
              this.traits[key].subtraits[k].max = 99;
              break;
          }
        }
      });
      
      let sum = 0;
      Object.keys(subtraits).forEach((k) => {
        sum += subtraits[k].value;
      });
      this.traits[key].value = sum;

      let mod = this.traits[key].value - 4;
      this.traits[key].mod = mod;

      // Spellcap is calculated from resolve
      this.spellcap = this.traits['wil'].subtraits['res'].value;
    }

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      if (i.type === 'species') {
        this.species = i;
      }
    }

    this._processFlags();

    Hooks.callAll("prepareActorData", this.parent, actorData);
  }

  async _processFlags() {
    const flags = this.parent.flags;
    const utopia = flags.utopia ?? {};

    Object.keys(utopia).forEach((key) => { 
      const value = utopia[key] ?? true;

      switch (key) {
        case "dualWielder":
          break;
        case "sageSlayer": 
          break;
        case "mageFighter": 
          break;
        case "intenseConcentration": 
          break;
        case "ironGripped": 
          break;

        case "enableArtifice": 
          this.enableArtifice = true;
        case "enableSpellcraft": 
          this.enableSpellcraft = true;          
        case "artificeLevel": 
          this.artificeLevel = value;
      }
    });
    
    Hooks.callAll("processActorFlags", this.parent, flags);
  }
}