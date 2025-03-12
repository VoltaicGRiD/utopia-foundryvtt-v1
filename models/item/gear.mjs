import UtopiaItemBase from "../base-item.mjs";

const fields = foundry.data.fields;

export class Gear extends UtopiaItemBase {
  /** @override */
  static defineSchema() {
    const schema = super.defineSchema();
      
    schema.type = new fields.StringField({ required: true, nullable: false, initial: "weapon", choices: {
      weapon: "UTOPIA.Gear.Type.Weapon",
      shield: "UTOPIA.Gear.Type.Shield",
      armor: "UTOPIA.Gear.Type.Armor",
      consumable: "UTOPIA.Gear.Type.Consumable",
      artifact: "UTOPIA.Gear.Type.Artifact",
    }});

    schema.weaponType = new fields.StringField({ required: false, nullable: true, initial: "fast", choices: {
      fast: "UTOPIA.Gear.WeaponType.Fast",
      moderate: "UTOPIA.Gear.WeaponType.Moderate",
      slow: "UTOPIA.Gear.WeaponType.Slow",
    }});

    schema.value = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.attributes = new fields.SetField(
      new fields.SchemaField({
        key: new fields.StringField({ required: true, nullable: false }),
        value: new fields.StringField({ required: true, nullable: false }),
      }), { label: "UTOPIA.Quirk.Attributes.label", hint: "UTOPIA.Quirk.Attributes.hint" }
    );

    schema.features = new fields.ArrayField(
      new fields.DocumentUUIDField({ type: "Item" }), 
      { label: "UTOPIA.Gear.Features.label", hint: "UTOPIA.Gear.Features.hint" }
    );
  }

  static FEATURE_OPTIONS = {
    ARMOR: {
      equippable: { type: Boolean, tags: [], initial: false },
      augmentable: { type: Boolean, tags: [], initial: false },
      slots: { type: Number, tags: [], initial: 0 },      
      increaseDefense: {
        type: { type: String, tags: [], initial: "physical", choices: {
          ...CONFIG.UTOPIA.DAMAGE_TYPES
        }},
        amount: { type: Number, tags: [], initial: 0 }
      },
      block: { type: Number, tags: [], initial: 0 },      
      dodge: { type: Number, tags: [], initial: 0 },      
      breathless: { type: Boolean, tags: [], initial: false },
      weaponlessAttacks: {
        damage: { type: Number, tags: [], initial: 0 },
        type: { type: String, tags: [], initial: "physical", choices: {
          ...CONFIG.UTOPIA.DAMAGE_TYPES
        }},
        trait: { type: String, tags: [], initial: "none" }
      },
      traitBonus: {
        amount: { type: Number, tags: [], initial: 0 },
        trait: { type: String, tags: [], initial: "none" }
      },
      spellDiscount: { type: Number, tags: [], initial: 0 },
      shrouded: { type: Boolean, tags: [], initial: false },
      locked: {
        notUnequippable: { type: Boolean, tags: [], initial: false },
        removalActions: { type: Number, tags: [], initial: 6 },
        dealRemovalDamage: { type: Boolean, tags: [], initial: true }
      }
    },
    WEAPON: {
      handheld: { type: Boolean, tags: [], initial: false },
      hands: { type: Number, tags: [], initial: 0 },      
      equippable: { type: Boolean, tags: [], initial: false },
      slots: { type: Number, tags: [], initial: 0 },      
      increaseDamage: { type: String, tags: [], initial: "none", validate: (value) => {
        return Roll.validate(value);
      }},
      meleeDamageModifierTrait: { type: String, tags: [], initial: "none" },
      rangedDamageModifierTrait: { type: String, tags: [], initial: "none" },
      damageTemplate: { type: String, tags: [], initial: "none" },
      range: {
        far: { type: Number, tags: [], initial: 0 },
        close: { type: Number, tags: [], initial: 0 }
      },
      reach: { type: Number, tags: [], initial: 0 },      closeRange: { type: Number, tags: [], initial: 0 },
      accuracy: {
        favor: { type: Number, tags: [], initial: 0 },
        trait: { type: String, tags: [], initial: "none" } 
      },
      ignorances: {
        SHP: { type: Boolean, tags: [], initial: false },
        DHP: { type: Boolean, tags: [], initial: false },
        Stamina: { type: Boolean, tags: [], initial: false },
        Armor: { type: Boolean, tags: [], initial: false },
        Defense: { type: Boolean, tags: [], initial: false },
      },
      reduceTargetStaminaPercentage: { type: Number, tags: [], initial: 0 },
      increaseStaminaCost: { type: Number, tags: [], initial: 0 },
      reduceStaminaCost: { type: Number, tags: [], initial: 0 },      
      halfDamageConditions: { type: String, tags: [], initial: "none" },
      doubleDamageConditions: { type: String, tags: [], initial: "none" },
      shpPercentage: { type: Number, tags: [], initial: 0 },
      dhpPercentage: { type: Number, tags: [], initial: 0 },
      objectPercentage: { type: Number, tags: [], initial: 0 },
      blindingActions: { type: Number, tags: [], initial: 0 },
      blindingTrait: { type: String, tags: [], initial: "none" },
      blindingDuration: { type: Number, tags: [], initial: 0 },
      confusingActions: { type: Number, tags: [], initial: 0 },
      confusingTrait: { type: String, tags: [], initial: "none" },
      confusingDuration: { type: Number, tags: [], initial: 0 },
      blastingLineWidth: { type: Number, tags: [], initial: 0 },
      blastingAccuracyRequired: { type: Boolean, tags: [], initial: false },
      boomingConeDegrees: { type: Number, tags: [], initial: 0 },
      boomingAccuracyRequired: { type: Boolean, tags: [], initial: false },
      armed: { type: Boolean, tags: [], initial: false },
      rechargeAfter: { type: Number, tags: [], initial: 0 },
      rechargeTrait: { type: String, tags: [], initial: "none" },
      rechargeActions: { type: Number, tags: [], initial: 0 },
      returnDamage: { type: Number, tags: [], initial: 0 },
      returnDamageType: { type: String, tags: [], initial: "none", choices: {
        ...CONFIG.UTOPIA.DAMAGE_TYPES
      }},
      nonLethal: { type: Boolean, tags: [], initial: false },
    },
    CONSUMABLE: {
      doses: { type: Number, tags: [], initial: 0 },      areaOfEffect: { type: Number, tags: [], initial: 0 },
      actions: { type: Number, tags: [], initial: 0 },
      slots: { type: Number, tags: [], initial: 0 },      splash: { type: Boolean, tags: [], initial: false },
      damage: { type: String, tags: [], initial: "none", validate: (value) => {
        return Roll.validate(value);
      }},
      damageSave: { type: String, tags: [], initial: "none" },
      restoration: { type: String, tags: [], initial: "none", validate: (value) => {
        return Roll.validate(value);
      }},
      restorationResource: { type: String, tags: [], initial: "none" },
      spellBomb: { type: Number, tags: [], initial: 0 },
      chargeTimeMinutes: { type: Number, tags: [], initial: 0 },
      selfDamage: { type: String, tags: [], initial: "none", validate: (value) => {
        return Roll.validate(value);
      }},
      staminaCost: { type: Number, tags: [], initial: 0 },
      prolongedTurns: { type: Number, tags: [], initial: 0 },
      prolongedMinutes: { type: Number, tags: [], initial: 0 },
      prolongedHours: { type: Number, tags: [], initial: 0 },
      resistanceBuff: { type: Boolean, tags: [], initial: false },
      necroticDebuff: { type: Boolean, tags: [], initial: false },
      exhausting: { type: Boolean, tags: [], initial: false },
    },
    SHIELD: {
      increaseDefense: { type: String, tags: [], initial: "none", choices: {
        ...CONFIG.UTOPIA.DAMAGE_TYPES
      }},
      increaseBlock: { type: Boolean, tags: [], initial: false },
      increaseDodge: { type: Boolean, tags: [], initial: false },
      spellDiscount: { type: Number, tags: [], initial: 0 },
      slots: { type: Number, tags: [], initial: 0 },      
      hands: { type: Number, tags: [], initial: 0 },  
    }
  }

  prepareDerivedData() {
    this.cost = {
      silver: this.value,
      utian: this.value * 1000
    }
  }
}