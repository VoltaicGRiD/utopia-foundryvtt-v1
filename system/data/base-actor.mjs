import UtopiaDataModel from "./base-model.mjs";

export default class UtopiaActorBase extends UtopiaDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

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
      birthday: new fields.StringField({ required: false, nullable: true }),
      deathday: new fields.StringField({ required: false, nullable: true }),
      height: new fields.StringField({ required: false, nullable: true }),
      weight: new fields.NumberField({ required: false, nullable: true }),
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
    });    
    
    return schema;
  }

  getPaperDoll() {
    const context = {}

    context.head = {}
    context.head.augments = this.augments.head.map(i => this.parent.items.get(i));
    context.head.evolution = this.evolution.head;
    context.head.unaugmentable = this.armors.unaugmentable.head;
    context.head.unequippable = this.armors.unequippable.head;
    context.head.specialty = this.armors.specialty.head;
    context.head.items = this.equipmentSlots.head.map(i => this.parent.items.get(i));

    context.neck = {}
    context.neck.augments = this.augments.neck.map(i => this.parent.items.get(i));
    context.neck.evolution = this.evolution.neck;
    context.neck.unaugmentable = this.armors.unaugmentable.neck;
    context.neck.unequippable = this.armors.unequippable.neck
    context.neck.specialty = this.armors.specialty.neck;
    context.neck.items = this.equipmentSlots.neck.map(i => this.parent.items.get(i));

    context.chest = {}
    context.chest.augments = this.augments.chest.map(i => this.parent.items.get(i));
    context.chest.evolution = this.evolution.chest;
    context.chest.unaugmentable = this.armors.unaugmentable.chest;
    context.chest.unequippable = this.armors.unequippable.chest
    context.chest.specialty = this.armors.specialty.chest;
    context.chest.items = this.equipmentSlots.chest.map(i => this.parent.items.get(i));

    context.back = {}
    context.back.augments = this.augments.back.map(i => this.parent.items.get(i));
    context.back.evolution = this.evolution.back;
    context.back.unaugmentable = this.armors.unaugmentable.back;
    context.back.unequippable = this.armors.unequippable.back
    context.back.specialty = this.armors.specialty.back;
    context.back.items = this.equipmentSlots.back.map(i => this.parent.items.get(i));

    context.hands = {}
    context.hands.augments = this.augments.hands.map(i => this.parent.items.get(i));
    context.hands.evolution = this.evolution.hands;
    context.hands.unaugmentable = this.armors.unaugmentable.hands;
    context.hands.unequippable = this.armors.unequippable.hands
    context.hands.specialty = this.armors.specialty.hands;
    context.hands.items = this.equipmentSlots.hands.map(i => this.parent.items.get(i));

    context.ring = {}
    context.ring.augments = this.augments.ring.map(i => this.parent.items.get(i));
    context.ring.evolution = this.evolution.ring;
    context.ring.unaugmentable = this.armors.unaugmentable.ring;
    context.ring.unequippable = this.armors.unequippable.ring
    context.ring.specialty = this.armors.specialty.ring;
    context.ring.items = this.equipmentSlots.ring.map(i => this.parent.items.get(i));

    context.waist = {}
    context.waist.augments = this.augments.waist.map(i => this.parent.items.get(i));
    context.waist.evolution = this.evolution.waist;
    context.waist.unaugmentable = this.armors.unaugmentable.waist;
    context.waist.unequippable = this.armors.unequippable.waist
    context.waist.specialty = this.armors.specialty.waist;
    context.waist.items = this.equipmentSlots.waist.map(i => this.parent.items.get(i));

    context.feet = {}
    context.feet.augments = this.augments.feet.map(i => this.parent.items.get(i));
    context.feet.evolution = this.evolution.feet;
    context.feet.unaugmentable = this.armors.unaugmentable.feet;
    context.feet.unequippable = this.armors.unequippable.feet
    context.feet.specialty = this.armors.specialty.feet;
    context.feet.items = this.equipmentSlots.feet.map(i => this.parent.items.get(i));

    console.log(context);

    return context;
  }
}