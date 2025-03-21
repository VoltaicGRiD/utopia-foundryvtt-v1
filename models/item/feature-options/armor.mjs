import UtopiaItemBase from "../../base-item.mjs";

export class ArmorFeatureOptions extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };
    
    schema.equippable = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.augmentable = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.increaseDefense = new fields.StringField({ ...requiredString, initial: "physical", choices: {
      physical: "UTOPIA.DamageTypes.physical",
      energy: "UTOPIA.DamageTypes.energy",
      psyche: "UTOPIA.DamageTypes.psyche",
      chill: "UTOPIA.DamageTypes.chill",
      heat: "UTOPIA.DamageTypes.heat",
    }});
    schema.block = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.dodge = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.breathless = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.weaponless = new fields.SchemaField({
      damageIncrease: new fields.StringField({ ...requiredString, validate: (value) => {
        return Roll.validate(value);
      }}),
      damageType: new fields.StringField({ ...requiredString, initial: "physical", choices: {
        physical: "UTOPIA.DamageTypes.physical",
        energy: "UTOPIA.DamageTypes.energy",
        psyche: "UTOPIA.DamageTypes.psyche",
        chill: "UTOPIA.DamageTypes.chill",
        heat: "UTOPIA.DamageTypes.heat",
      }}),
      traitModifier: new fields.StringField({ ...requiredString, initial: "none" }),
      actionDiscount: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.shroudedBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.travel = new fields.SchemaField({
      vertical: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      landSpeedBoost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      waterSpeedBoost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      airSpeedBoost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      grantsFlight: new fields.BooleanField({ required: true, nullable: false, initial: false }),
    });
    schema.traitBonusAmount = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.traitBonusTrait = new fields.StringField({ ...requiredString, initial: "none" });
    schema.spellDiscount = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.locked = new fields.SchemaField({
      slot: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      actions: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.preventSpellcasting = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.destroyOnDoubleProtectedDamage = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}