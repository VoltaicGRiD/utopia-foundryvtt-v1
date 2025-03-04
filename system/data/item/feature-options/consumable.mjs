import UtopiaItemBase from "../../base-item.mjs";

export default class ConsumableFeatureOptions extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };
    
    schema.doses = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.areaOfEffect = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.actions = new fields.NumberField({ ...requiredInteger, initial: 2 });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 3 });
    schema.splash = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.damage = new fields.StringField({ ...requiredString, validate: (value) => {
      return Roll.validate(value);
    }})
    schema.damageSave = new fields.StringField({ ...requiredString, initial: "none" });
    schema.restoration = new fields.StringField({ ...requiredString, validate: (value) => {
      return Roll.validate(value);
    }});
    schema.restorationResource = new fields.StringField({ ...requiredString, initial: "SHP" });
    schema.spellBomb = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.chargeTimeMinutes = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.selfDamage = new fields.StringField({ ...requiredString, validate: (value) => {
      return Roll.validate(value);
    }});
    schema.staminaCost = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.prolongedTurns = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.prolongedMinutes = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.prolongedHours = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.resistanceBuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.necroticDebuff = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.exhausting = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}