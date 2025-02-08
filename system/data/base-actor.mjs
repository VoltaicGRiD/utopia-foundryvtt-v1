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

}