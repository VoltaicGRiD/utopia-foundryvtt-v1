import UtopiaActorBase from "../base-actor.mjs";

export default class UtopiaCharacter extends UtopiaActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredPositiveInteger = { required: true, nullable: false, integer: true, min: 0 };
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

    // Experience
    schema.experience = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      previous: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      next: new fields.NumberField({ ...requiredInteger, initial: 0 }),
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
    schema.archetype = new fields.ObjectField({ required: true, nullable: false, initial: {}});
    schema.age = new fields.NumberField({ ...requiredInteger, initial: 0 });

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

    schema.components = new fields.SchemaField({
      crude: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      common: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      extraordinary: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      rare: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      legendary: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      mythical: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
    })

    schema.biographyFieldOptions = new fields.StringField({
      required: true,
      nullable: false,
      choices: {
        "generalKnowledgeDivider": "UTOPIA.Actor.Biography.generalKnowledgeDivider",
        "age": "UTOPIA.Actor.Biography.age",
        "birthday": "UTOPIA.Actor.Biography.birthday",
        "deathday": "UTOPIA.Actor.Biography.deathday",
        "height": "UTOPIA.Actor.Biography.height",
        "weight": "UTOPIA.Actor.Biography.weight",
        "pronouns": "UTOPIA.Actor.Biography.pronouns",
        "hairEyesSkin": "UTOPIA.Actor.Biography.hairEyesSkin",
        "markings": "UTOPIA.Actor.Biography.markings",
        "voice": "UTOPIA.Actor.Biography.voice",
        "bodyType": "UTOPIA.Actor.Biography.bodyType",
        "ethnicity": "UTOPIA.Actor.Biography.ethnicity",
        "nationality": "UTOPIA.Actor.Biography.nationality",
        "quirks": "UTOPIA.Actor.Biography.quirks",

        "relationshipDivider": "UTOPIA.Actor.Biography.relationshipsDivider",
        "enemies": "UTOPIA.Actor.Biography.enemies",
        "allies": "UTOPIA.Actor.Biography.allies",
        "rivals": "UTOPIA.Actor.Biography.rivals",
        "family": "UTOPIA.Actor.Biography.family",
        "friends": "UTOPIA.Actor.Biography.friends",
        "partners": "UTOPIA.Actor.Biography.partners",
        
        "personalInfoDivider": "UTOPIA.Actor.Biography.personalInformationDivider",
        "strength": "UTOPIA.Actor.Biography.strength",
        "education": "UTOPIA.Actor.Biography.education",
        "upbringing": "UTOPIA.Actor.Biography.upbringing",
        "achievements": "UTOPIA.Actor.Biography.achievements",
        "coreMemories": "UTOPIA.Actor.Biography.coreMemories",
        "phobias": "UTOPIA.Actor.Biography.phobias",
        "dreams": "UTOPIA.Actor.Biography.dreams",
        "nightmares": "UTOPIA.Actor.Biography.nightmares",
        "anathema": "UTOPIA.Actor.Biography.anathema",
        "edicts": "UTOPIA.Actor.Biography.edicts",
        "ambitions": "UTOPIA.Actor.Biography.ambitions",
        "motivations": "UTOPIA.Actor.Biography.motivations",
        "personalSecrets": "UTOPIA.Actor.Biography.personalSecrets",
        
        "alignmentDivider": "UTOPIA.Actor.Biography.alignmentsDivider",
        "moralAlignment": "UTOPIA.Actor.Biography.moralAlignment",
        "philosophicalAlignment": "UTOPIA.Actor.Biography.philosophicalAlignment",
        "politicalAlignment": "UTOPIA.Actor.Biography.politicalAlignment",

        "publicInfoDivider": "UTOPIA.Actor.Biography.publicInformationDivider",
        "occupation": "UTOPIA.Actor.Biography.occupation",
        "reputation": "UTOPIA.Actor.Biography.reputation",
        "hobbies": "UTOPIA.Actor.Biography.hobbies",
        "interests": "UTOPIA.Actor.Biography.interests",
      },
      initial: "age"
    });
    schema.biographyFields = new fields.SetField(schema.biographyFieldOptions, {
      required: true,
      nullable: false,
      initial: []
    });
    schema.biography = new fields.SchemaField({
      // General knowledge
      age: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      birthday: new fields.StringField({ required: false, nullable: true }),
      deathday: new fields.StringField({ required: false, nullable: true }),
      height: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      weight: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      pronouns: new fields.StringField({ required: false, nullable: true }),
      hairEyesSkin: new fields.StringField({ required: false, nullable: true }),
      bodyType: new fields.StringField({ required: false, nullable: true }),
      ethnicity: new fields.StringField({ required: false, nullable: true }),
      nationality: new fields.StringField({ required: false, nullable: true }),
      markings: new fields.StringField({ required: false, nullable: true }),
      voice: new fields.StringField({ required: false, nullable: true }),
      quirks: new fields.StringField({ required: false, nullable: true }),

      // Relationships
      allies: new fields.StringField({ required: false, nullable: true }),
      enemies: new fields.StringField({ required: false, nullable: true }),
      rivals: new fields.StringField({ required: false, nullable: true }),
      family: new fields.StringField({ required: false, nullable: true }),
      friends: new fields.StringField({ required: false, nullable: true }),
      partners: new fields.StringField({ required: false, nullable: true }),

      // Personal Information
      education: new fields.StringField({ required: false, nullable: true }),
      upbringing: new fields.StringField({ required: false, nullable: true }),
      achievements: new fields.StringField({ required: false, nullable: true }),
      coreMemories: new fields.StringField({ required: false, nullable: true }),
      phobias: new fields.StringField({ required: false, nullable: true }),
      dreams: new fields.StringField({ required: false, nullable: true }),
      nightmares: new fields.StringField({ required: false, nullable: true }),
      anathema: new fields.StringField({ required: false, nullable: true }),
      edicts: new fields.StringField({ required: false, nullable: true }),
      ambitions: new fields.StringField({ required: false, nullable: true }),
      motivations: new fields.StringField({ required: false, nullable: true }),
      personalSecrets: new fields.StringField({ required: false, nullable: true }),

      // Alignments
      moralAlignment: new fields.StringField({ required: false, nullable: true }),
      philosophicalAlignment: new fields.StringField({ required: false, nullable: true }),
      politicalAlignment: new fields.StringField({ required: false, nullable: true }),

      // Public Information
      occupation: new fields.StringField({ required: false, nullable: true }),
      reputation: new fields.StringField({ required: false, nullable: true }),
      hobbies: new fields.StringField({ required: false, nullable: true }),
      interests: new fields.StringField({ required: false, nullable: true }),

      // Description
      description: new fields.StringField({ required: false, nullable: true }),
      gmSecrets: new fields.StringField({ required: false, nullable: true, gmOnly: true }),
    })

    schema.resource = new fields.SchemaField({
      name: new fields.StringField({ required: true, nullable: false, initial: "" }),
      description: new fields.StringField({ required: true, nullable: false, initial: "" }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    })
    schema.resources = new fields.ObjectField();

    schema.equipmentSlots = new fields.SchemaField({
      head: new fields.DocumentIdField({ required: false, nullable: true, }),
      neck: new fields.DocumentIdField({ required: false, nullable: true, }),
      back: new fields.DocumentIdField({ required: false, nullable: true, }),
      chest: new fields.DocumentIdField({ required: false, nullable: true, }),
      waist: new fields.DocumentIdField({ required: false, nullable: true, }),
      hands: new fields.DocumentIdField({ required: false, nullable: true, }),
      ring: new fields.DocumentIdField({ required: false, nullable: true, }),
      feet: new fields.DocumentIdField({ required: false, nullable: true, }),
    });

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
    this.experience.percentage = Math.floor((this.experience.value - this.experience.previous) / (this.experience.next - this.experience.previous) * 100);

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
    for (let i of this.parent.items) {
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