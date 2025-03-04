import UtopiaGearBase from "./base-gear.mjs";

const fields = foundry.data.fields;

class BaseArtifact extends UtopiaGearBase {
  static get TYPES() {
    return BaseArtifact.#TYPES ??= Object.freeze({
      [EquippableArtifact.TYPE]: EquippableArtifact,
      [HandheldArtifact.TYPE]: HandheldArtifact,
      [AmmunitionArtifact.TYPE]: AmmunitionArtifact,
    })
  }

  static #TYPES;

  static TYPE = "";

  static defineSchema() {
    return {
      type: new fields.StringField({required: true, blank: false, initial: this.TYPE,
        validate: value => value === this.TYPE, validationError: `must be equal to "${this.TYPE}"`}),
      damage: new fields.StringField({ required: true, nullable: false, initial: "none", validate: (value) => {
        return Roll.validate(value);
      }}),
      damageSave: new fields.StringField({ required: true, nullable: false, initial: "none" }),
      damageTemplate: new fields.StringField({ required: true, nullable: false, initial: "none" }),
    }
  }
}

class EquippableArtifact extends BaseArtifact {
  static {
    Object.defineProperty(this, "TYPE", {value: "equippable"});
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      slot: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "neck": "UTOPIA.Item.Gear.Artifact.Slot.neck",
        "ring": "UTOPIA.Item.Gear.Artifact.Slot.ring",
        "back": "UTOPIA.Item.Gear.Artifact.Slot.back",
        "waist": "UTOPIA.Item.Gear.Artifact.Slot.waist"
      }}),
    })
  }
}

class HandheldArtifact extends BaseArtifact {
  static {
    Object.defineProperty(this, "TYPE", {value: "handheld"});
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      hands: new fields.NumberField({required: true, nullable: false, initial: 1}),
    })
  }
}


class AmmunitionArtifact extends BaseArtifact {
  static {
    Object.defineProperty(this, "TYPE", {value: "ammunition"});
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      slot: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "neck": "UTOPIA.Item.Gear.Artifact.Slot.neck",
        "ring": "UTOPIA.Item.Gear.Artifact.Slot.ring",
        "back": "UTOPIA.Item.Gear.Artifact.Slot.back",
        "waist": "UTOPIA.Item.Gear.Artifact.Slot.waist"
      }}),
    })
  }
}


export default class UtopiaArtifact extends UtopiaGearBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    schema.type = new fields.StringField({required: true, blank: false, choices: Object.values(this.TYPES), initial: "e"});
    schema.damage = new fields.SchemaField({
      formula: new fields.StringField({ required: true, nullable: false, initial: "none", validate: (value) => {
        return Roll.validate(value);
      }}),
      save: new fields.StringField({ required: true, nullable: false, initial: "none" }),
      template: new fields.StringField({ required: true, nullable: false, initial: "none" }),
    });
    schema.activation = new fields.SchemaField({
      cost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      duration: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      feature: new fields.StringField({ ...requiredString, initial: "none" }),
    });
    schema.spellBomb = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.travelDistance = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.verticalTravel = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.waterTravel = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.airTravel = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.versatileBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.minorCastingBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.modestCastingBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.majorCastingBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.shroudedBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.areaOfEffect = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.remoteActivation = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.capacity = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.increaseSubtrait = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.resistLastDamage = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.resistDamageType = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.resistAllDamage = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.consumableCraftingStation = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.itemCraftingStation = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.landSpeedBoost = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.waterSpeedBoost = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.airSpeedBoost = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.grantsFlight = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.spellDiscount = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.preventSpellcasting = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }

  static TYPES = {
    EQUIPPABLE: "e",
    HANDHELD: "h",
    AMMUNITION: "a",
  }

  craft() {
    // TODO: Implement type handling on craft
    // Equippable can only go in "neck", "ring", "back", "waist"
    // Handheld can only be activated when held
    // Ammunition multiplies the RP cost by 6, crafts 4x the regular amount
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}