const fields = foundry.data.fields;
const requiredInteger = { required: true, nullable: false, initial: 0 }
import { BiographyField as TextareaField } from "./fields/biography-field.mjs";

export default class UtopiaActorBase extends foundry.abstract.TypeDataModel {

  prepareBaseData() {
    this.actions = {
      turn: {
        value: 6,
        max: 6
      },
      interrupt: {
        value: 2,
        max: 2
      }
    }
  }

  static defineSchema() {
    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const schema = {};

    const formulaType = { required: true, nullable: true, validate: (v) => Roll.validate(v) };
    const TraitField = (parent = null) => {
      const returns = {
        mod: new fields.NumberField({ ...requiredInteger }),
        value: new fields.NumberField({ ...requiredInteger }),
        bonus: new fields.NumberField({ ...requiredInteger }),
        total: new fields.NumberField({ ...requiredInteger }),
        gifted: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      }
      if (parent) returns.parent = new fields.StringField({ required: true, nullable: false, initial: parent });
      return new fields.SchemaField(returns);
    }
    const ResourceField = () => new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    schema.traits = new fields.SchemaField({});
    schema.subtraits = new fields.SchemaField({});
    for (const [key, value] of Object.entries(CONFIG.UTOPIA.TRAITS)) {
      schema.traits.fields[key] = TraitField();
      for (const subtrait of value.subtraits) {
        schema.subtraits.fields[subtrait] = TraitField(key);
      }
    }

    schema.fullbody = new fields.FilePathField({categories: ["IMAGE", "VIDEO"], required: true}),

    schema.hitpoints = new fields.SchemaField({
      surface: ResourceField(),
      deep: ResourceField(),
    });
    schema.stamina = ResourceField();

    schema.block = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 4 }),
    });
    schema.dodge = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 12 }),
    });

    schema.innateDefenses = new fields.SchemaField({
      energy: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      heat: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      chill: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      physical: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      psyche: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    })
    schema.armorDefenses = new fields.SchemaField({
      energy: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      heat: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      chill: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      physical: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      psyche: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    })

    schema.weaponlessAttacks = new fields.SchemaField({
      formula: new fields.StringField({ ...requiredInteger, initial: "1d6" }),
      type: new fields.StringField({ ...requiredInteger, initial: "physical", choices: {
        ...CONFIG.UTOPIA.DAMAGE_TYPES
      } }),
      range: new fields.StringField({ ...requiredInteger, initial: "0/0" }),
      traits: new fields.SetField(new fields.StringField({ required: true, nullable: false }), { initial: [] }),
      stamina: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    const artistries = () => {
      // Create a new StringField for each SPECIALTY_CHECKS
      const returns = {};
      for (const [key, value] of Object.entries(CONFIG.UTOPIA.ARTISTRIES)) {
        returns[key] = new fields.SchemaField({
          multiplier: new fields.NumberField({ ...requiredInteger, initial: 1 }),
          unlocked: new fields.BooleanField({ required: true, nullable: false, initial: false }),
        });
      }      
      return returns;
    }

    schema.spellcasting = new fields.SchemaField({
      artistries: new fields.SchemaField({
        ...artistries(),
      }),
      discount: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      spellcap: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      bonuses: new fields.SchemaField({
        deepBreath: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        consumeComponent: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        consumable: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      })
    });

    schema.initiative = new fields.SchemaField({
      formula: new fields.StringField({ ...requiredInteger, initial: "3d6" }),
      trait: new fields.StringField({ ...requiredInteger, initial: "spd" }),
      decimals: new fields.NumberField({ ...requiredInteger, initial: 2 }),
    });

    const languages = () => {
      // Create a new StringField for each SPECIALTY_CHECKS
      const returns = {};
      for (const [key, value] of Object.entries(CONFIG.UTOPIA.LANGUAGES)) {
        returns[key] = new fields.BooleanField({ required: true, nullable: false, initial: false });
      }      
      return returns;
    }

    schema.communication = new fields.SchemaField({
      languages: new fields.SchemaField({
        ...languages()
      }),
      speaking: new fields.SchemaField({
        ...languages()
      }),
      telepathy: new fields.BooleanField({ required: true, nullable: false, initial: false }),
    });

    schema.travel = new fields.SchemaField({
      land: ResourceField(),
      water: ResourceField(),
      air: ResourceField(),
    });

    schema.size = new fields.StringField({ required: true, nullable: false, initial: "medium", choices: {
      tiny: "UTOPIA.Size.tiny",
      small: "UTOPIA.Size.small",
      medium: "UTOPIA.Size.medium",
      large: "UTOPIA.Size.large",
      huge: "UTOPIA.Size.huge",
      gargantuan: "UTOPIA.Size.gargantuan",
    }});

    schema.transformations = new fields.SetField(new fields.SchemaField({
      name: new fields.StringField({ required: true, nullable: false }),
      description: new fields.StringField({ required: true, nullable: false }),
      duration: new fields.StringField({ required: true, nullable: false }),
      stamina: new fields.NumberField({ required: true, nullable: false }),
      formula: new fields.StringField({ required: true, nullable: false }),
      traits: new fields.SetField(new fields.StringField({ required: true, nullable: false }), { initial: [] }),
    }), { initial: [] });

    schema.fatigue = ResourceField();
    schema.turnActions = ResourceField();
    schema.interruptActions = ResourceField();

    schema.equipmentSlots = new fields.SchemaField({
      head: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      neck: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      chest: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      back: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      hands: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      ring: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      waist: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      feet: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
    });
    schema.augmentSlots = new fields.SchemaField({
      head: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      neck: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      chest: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      back: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      hands: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      ring: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      waist: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
      feet: new fields.SetField(new fields.DocumentIdField({ required: false, nullable: true }), { initial: [] }),
    });      

    const returns = {};
    const traitOptions = {
      ...Object.entries(CONFIG.UTOPIA.TRAITS).reduce((acc, [key, value]) => {
        acc[key] = { ...value, group: "UTOPIA.TRAITS.GroupName" };
        return acc;
      }, {}),
      ...Object.entries(CONFIG.UTOPIA.SUBTRAITS).reduce((acc, [key, value]) => {
        acc[key] = { ...value, group: "UTOPIA.SUBTRAITS.GroupName" };
        return acc;
      }, {}),
    } 

    const specialtyChecks = () => {
      // Create a new StringField for each SPECIALTY_CHECKS
      const returns = {};
      for (const [key, value] of Object.entries(CONFIG.UTOPIA.SPECIALTY_CHECKS)) {
        returns[key] = new fields.StringField({ required: true, nullable: false, initial: value.defaultAttribute, choices: traitOptions });
      }      
      return returns;
    }

    schema.checks = new fields.SchemaField({
      // Create a new StringField for each SPECIALTY_CHECKS
      ...specialtyChecks(),
    });

    UtopiaActorBase.getBiography(schema);
    
    return schema;
  }

  get headerFields() {
    return [
      {
        field: this.schema.fields.hitpoints.fields.surface.fields.value,
        stacked: false,
        editable: true,
      }
    ]
  }

  async prepareDerivedData() {
    try { this._prepareTraits() } catch (e) { console.error(e) }
    try { await this._prepareSpecies(); } catch (e) { 
      console.error(e); 
      this._prepareSpeciesDefault();
    }
    try { this._prepareDefenses() } catch (e) { console.error(e) }
  }

  _prepareDefenses() {
    this.defenses = {
    energy:      this.innateDefenses.energy    + this.armorDefenses.energy,
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

    if (this.languagePoints) this.languagePoints.available += this._speciesData.communication.languages - this.languagePoints.spent;
    if (this.communication) this.communication.telepathy = this._speciesData.communication.telepathy;
    this.size = this._speciesData.size;
    for (const [key, value] of Object.entries(this._speciesData.travel)) {
      this.travel[key].max = await new Roll(String(value.speed), this.parent.getRollData()).evaluate().total;
    }

    this.speciesData = Object.freeze(this._speciesData);
  }

  async _prepareSpeciesDefault() {
    const talentTree = await game.packs.get('utopia.talentTrees').getDocuments().filter(i => i.system.species.includes("human"))[0];

    this._speciesData = {
      name: "Human",
      system: {
        talentTree: talentTree,
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
    for (const [key, value] of Object.entries(this._speciesData.system.travel)) {
      this.travel[key] = new Roll(String(value), this.parent.getRollData()).evaluateSync();
    }
  }

  static getPaperDoll() {
    const context = {}

    context.head = {}
    context.head.augments = this.augments.head.map(i => this.parent.items.get(i));
    context.head.evolution = this.evolution.head;
    context.head.unaugmentable = this.armors.unaugmentable.head;
    context.head.unequippable = this.armors.unequippable.head;
    context.head.specialty = this.armors.specialty.head;
    context.head.items = this.equipmentSlots.head.map(i => this.parent.items.get(i));
    context.head.augments = this.augments.head.map(i => this.parent.items.get(i));

    context.neck = {}
    context.neck.augments = this.augments.neck.map(i => this.parent.items.get(i));
    context.neck.evolution = this.evolution.neck;
    context.neck.unaugmentable = this.armors.unaugmentable.neck;
    context.neck.unequippable = this.armors.unequippable.neck
    context.neck.specialty = this.armors.specialty.neck;
    context.neck.items = this.equipmentSlots.neck.map(i => this.parent.items.get(i));
    context.neck.augments = this.augments.neck.map(i => this.parent.items.get(i));

    context.chest = {}
    context.chest.augments = this.augments.chest.map(i => this.parent.items.get(i));
    context.chest.evolution = this.evolution.chest;
    context.chest.unaugmentable = this.armors.unaugmentable.chest;
    context.chest.unequippable = this.armors.unequippable.chest
    context.chest.specialty = this.armors.specialty.chest;
    context.chest.items = this.equipmentSlots.chest.map(i => this.parent.items.get(i));
    context.chest.augments = this.augments.chest.map(i => this.parent.items.get(i));

    context.back = {}
    context.back.augments = this.augments.back.map(i => this.parent.items.get(i));
    context.back.evolution = this.evolution.back;
    context.back.unaugmentable = this.armors.unaugmentable.back;
    context.back.unequippable = this.armors.unequippable.back
    context.back.specialty = this.armors.specialty.back;
    context.back.items = this.equipmentSlots.back.map(i => this.parent.items.get(i));
    context.back.augments = this.augments.back.map(i => this.parent.items.get(i));

    context.hands = {}
    context.hands.augments = this.augments.hands.map(i => this.parent.items.get(i));
    context.hands.evolution = this.evolution.hands;
    context.hands.unaugmentable = this.armors.unaugmentable.hands;
    context.hands.unequippable = this.armors.unequippable.hands
    context.hands.specialty = this.armors.specialty.hands;
    context.hands.items = this.equipmentSlots.hands.map(i => this.parent.items.get(i));
    context.hands.augments = this.augments.hands.map(i => this.parent.items.get(i));

    context.ring = {}
    context.ring.augments = this.augments.ring.map(i => this.parent.items.get(i));
    context.ring.evolution = this.evolution.ring;
    context.ring.unaugmentable = this.armors.unaugmentable.ring;
    context.ring.unequippable = this.armors.unequippable.ring
    context.ring.specialty = this.armors.specialty.ring;
    context.ring.items = this.equipmentSlots.ring.map(i => this.parent.items.get(i));
    context.ring.augments = this.augments.ring.map(i => this.parent.items.get(i));

    context.waist = {}
    context.waist.augments = this.augments.waist.map(i => this.parent.items.get(i));
    context.waist.evolution = this.evolution.waist;
    context.waist.unaugmentable = this.armors.unaugmentable.waist;
    context.waist.unequippable = this.armors.unequippable.waist
    context.waist.specialty = this.armors.specialty.waist;
    context.waist.items = this.equipmentSlots.waist.map(i => this.parent.items.get(i));
    context.waist.augments = this.augments.waist.map(i => this.parent.items.get(i));

    context.feet = {}
    context.feet.augments = this.augments.feet.map(i => this.parent.items.get(i));
    context.feet.evolution = this.evolution.feet;
    context.feet.unaugmentable = this.armors.unaugmentable.feet;
    context.feet.unequippable = this.armors.unequippable.feet
    context.feet.specialty = this.armors.specialty.feet;
    context.feet.items = this.equipmentSlots.feet.map(i => this.parent.items.get(i));
    context.feet.augments = this.augments.feet.map(i => this.parent.items.get(i));

    console.log(context);

    return context;
  }

  static getBiography(schema) {
    schema.biographyFieldOptions = new fields.StringField({
      required: true,
      nullable: false,
      choices: {
        "generalKnowledgeDivider": "UTOPIA.Biography.generalKnowledgeDivider",
        "age": "UTOPIA.Biography.age",
        "birthday": "UTOPIA.Biography.birthday",
        "deathday": "UTOPIA.Biography.deathday",
        "height": "UTOPIA.Biography.height",
        "weight": "UTOPIA.Biography.weight",
        "pronouns": "UTOPIA.Biography.pronouns",
        "hairEyesSkin": "UTOPIA.Biography.hairEyesSkin",
        "markings": "UTOPIA.Biography.markings",
        "voice": "UTOPIA.Biography.voice",
        "bodyType": "UTOPIA.Biography.bodyType",
        "ethnicity": "UTOPIA.Biography.ethnicity",
        "nationality": "UTOPIA.Biography.nationality",
        "quirks": "UTOPIA.Biography.quirks",

        "relationshipDivider": "UTOPIA.Biography.relationshipsDivider",
        "enemies": "UTOPIA.Biography.enemies",
        "allies": "UTOPIA.Biography.allies",
        "rivals": "UTOPIA.Biography.rivals",
        "family": "UTOPIA.Biography.family",
        "friends": "UTOPIA.Biography.friends",
        "partners": "UTOPIA.Biography.partners",
        
        "personalInfoDivider": "UTOPIA.Biography.personalInformationDivider",
        "strength": "UTOPIA.Biography.strength",
        "education": "UTOPIA.Biography.education",
        "upbringing": "UTOPIA.Biography.upbringing",
        "achievements": "UTOPIA.Biography.achievements",
        "coreMemories": "UTOPIA.Biography.coreMemories",
        "phobias": "UTOPIA.Biography.phobias",
        "dreams": "UTOPIA.Biography.dreams",
        "nightmares": "UTOPIA.Biography.nightmares",
        "anathema": "UTOPIA.Biography.anathema",
        "edicts": "UTOPIA.Biography.edicts",
        "ambitions": "UTOPIA.Biography.ambitions",
        "motivations": "UTOPIA.Biography.motivations",
        "personalSecrets": "UTOPIA.Biography.personalSecrets",
        
        "alignmentDivider": "UTOPIA.Biography.alignmentsDivider",
        "moralAlignment": "UTOPIA.Biography.moralAlignment",
        "philosophicalAlignment": "UTOPIA.Biography.philosophicalAlignment",
        "politicalAlignment": "UTOPIA.Biography.politicalAlignment",

        "publicInfoDivider": "UTOPIA.Biography.publicInformationDivider",
        "occupation": "UTOPIA.Biography.occupation",
        "reputation": "UTOPIA.Biography.reputation",
        "hobbies": "UTOPIA.Biography.hobbies",
        "interests": "UTOPIA.Biography.interests",
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
      birthday: new TextareaField({ required: false, nullable: true }),
      deathday: new TextareaField({ required: false, nullable: true }),
      height: new TextareaField({ required: false, nullable: true }),
      weight: new fields.NumberField({ required: false, nullable: true }),
      pronouns: new TextareaField({ required: false, nullable: true }),
      hairEyesSkin: new TextareaField({ required: false, nullable: true }),
      bodyType: new TextareaField({ required: false, nullable: true }),
      ethnicity: new TextareaField({ required: false, nullable: true }),
      nationality: new TextareaField({ required: false, nullable: true }),
      markings: new TextareaField({ required: false, nullable: true }),
      voice: new TextareaField({ required: false, nullable: true }),
      quirks: new TextareaField({ required: false, nullable: true }),

      // Relationships
      allies: new TextareaField({ required: false, nullable: true }),
      enemies: new TextareaField({ required: false, nullable: true }),
      rivals: new TextareaField({ required: false, nullable: true }),
      family: new TextareaField({ required: false, nullable: true }),
      friends: new TextareaField({ required: false, nullable: true }),
      partners: new TextareaField({ required: false, nullable: true }),

      // Personal Information
      education: new TextareaField({ required: false, nullable: true }),
      upbringing: new TextareaField({ required: false, nullable: true }),
      achievements: new TextareaField({ required: false, nullable: true }),
      coreMemories: new TextareaField({ required: false, nullable: true }),
      phobias: new TextareaField({ required: false, nullable: true }),
      dreams: new TextareaField({ required: false, nullable: true }),
      nightmares: new TextareaField({ required: false, nullable: true }),
      anathema: new TextareaField({ required: false, nullable: true }),
      edicts: new TextareaField({ required: false, nullable: true }),
      ambitions: new TextareaField({ required: false, nullable: true }),
      motivations: new TextareaField({ required: false, nullable: true }),
      personalSecrets: new TextareaField({ required: false, nullable: true }),

      // Alignments
      moralAlignment: new TextareaField({ required: false, nullable: true }),
      philosophicalAlignment: new TextareaField({ required: false, nullable: true }),
      politicalAlignment: new TextareaField({ required: false, nullable: true }),

      // Public Information
      occupation: new TextareaField({ required: false, nullable: true }),
      reputation: new TextareaField({ required: false, nullable: true }),
      hobbies: new TextareaField({ required: false, nullable: true }),
      interests: new TextareaField({ required: false, nullable: true }),
    });    

    return schema;
  }
}