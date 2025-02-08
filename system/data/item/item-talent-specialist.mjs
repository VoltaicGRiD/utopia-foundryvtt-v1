import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpecialistTalent extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    const schema = super.defineSchema();

    schema.resource = new fields.SchemaField({
      resourceId: new fields.StringField({...requiredString, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString}),
      max: new fields.SchemaField({
        formula: new fields.StringField({...requiredString, initial: "0"})
      }),
      amount: new fields.NumberField({...requiredInteger, initial: 0}),
      secret: new fields.BooleanField({required: true, initial: false, gmOnly: true}),
      propagateToActor: new fields.BooleanField({required: true, initial: true}),
      recoverAmount: new fields.NumberField({...requiredInteger}),
      recoverInterval: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.Gear.Resource.RecoverInterval.none",
        "turn": "UTOPIA.Item.Gear.Resource.RecoverInterval.turn",
        "round": "UTOPIA.Item.Gear.Resource.RecoverInterval.round",
        "rest": "UTOPIA.Item.Gear.Resource.RecoverInterval.rest",
        "day": "UTOPIA.Item.Gear.Resource.RecoverInterval.day",
        "session": "UTOPIA.Item.Gear.Resource.RecoverInterval.session",
      }}),
    });
    schema.resources = new fields.ArrayField(schema.resource);

    schema.action = new fields.SchemaField({
      actionId: new fields.StringField({...requiredString, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString, initial: "New Action"}),
      category: new fields.StringField({required: true, nullable: false, initial: "trait", choices: {
        "generic": "UTOPIA.Item.Gear.Action.Category.generic",
        "trait": "UTOPIA.Item.Gear.Action.Category.trait",
        "damage": "UTOPIA.Item.Gear.Action.Category.damage",
        "macro": "UTOPIA.Item.Gear.Action.Category.macro",
      }}),
      type: new fields.StringField({required: true, nullable: false, initial: "turn", choices: {
        "turn": "UTOPIA.Item.Gear.Action.Type.turn",
        "interrupt": "UTOPIA.Item.Gear.Action.Type.interrupt",
      }}),
      trait: new fields.StringField({required: true, nullable: false, initial: "agi", choices: {
        "agi": "UTOPIA.Actor.Traits.agi.long",
        "str": "UTOPIA.Actor.Traits.str.long",
        "int": "UTOPIA.Actor.Traits.int.long",
        "wil": "UTOPIA.Actor.Traits.wil.long",
        "dis": "UTOPIA.Actor.Traits.dis.long",
        "cha": "UTOPIA.Actor.Traits.cha.long",  
        "spd": "UTOPIA.Actor.Subtraits.spd.long",
        "dex": "UTOPIA.Actor.Subtraits.dex.long",
        "pow": "UTOPIA.Actor.Subtraits.pow.long",
        "for": "UTOPIA.Actor.Subtraits.for.long",
        "eng": "UTOPIA.Actor.Subtraits.eng.long",
        "mem": "UTOPIA.Actor.Subtraits.mem.long",
        "res": "UTOPIA.Actor.Subtraits.res.long",
        "awa": "UTOPIA.Actor.Subtraits.awa.long",
        "por": "UTOPIA.Actor.Subtraits.por.long",
        "stu": "UTOPIA.Actor.Subtraits.stu.long",
        "app": "UTOPIA.Actor.Subtraits.app.long",
        "lan": "UTOPIA.Actor.Subtraits.lan.long",
      }}),
      modifier: new fields.StringField({required: true, nullable: false}),
      cost: new fields.NumberField({...requiredInteger, min: 0, max: 6}),
      stamina: new fields.NumberField({...requiredInteger, initial: 0}),
      formula: new fields.StringField({...requiredString, initial: ""}),
      flavor: new fields.StringField({...requiredString, initial: ""}),
      template: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.Gear.Action.Template.none",
        "sbt": "UTOPIA.Item.Gear.Action.Template.sbt",
        "mbt": "UTOPIA.Item.Gear.Action.Template.mbt",
        "lbt": "UTOPIA.Item.Gear.Action.Template.lbt",
        "xbt": "UTOPIA.Item.Gear.Action.Template.xbt",
        "cone": "UTOPIA.Item.Gear.Action.Template.cone",
        "line": "UTOPIA.Item.Gear.Action.Template.line",
      }}),
      resource: new fields.StringField({required: true, nullable: false}),
      consumed: new fields.NumberField({...requiredInteger, initial: 0}),
      macro: new fields.DocumentUUIDField({required: false, nullable: true}),
      actor: new fields.StringField({required: true, nullable: false, initial: "default", choices: {
        "default": "UTOPIA.Item.Gear.Action.Actor.default",
        "self": "UTOPIA.Item.Gear.Action.Actor.self",
        "target": "UTOPIA.Item.Gear.Action.Actor.target", 
      }}),
    })
    schema.actions = new fields.ArrayField(schema.action, {required: true, nullable: false, initial: []});

    schema.attributeRequirements = new fields.SetField(new fields.StringField(), { required: true, nullable: true, initial: [] });
    schema.speciesRequirements = new fields.StringField({ required: true, nullable: false, initial: "none" });
    schema.talentRequirements = new fields.StringField({ required: true, nullable: false, initial: "none" });
    schema.talentTreeRequirements = new fields.StringField({ required: true, nullable: false, initial: "none" });
    schema.grants = new fields.SetField(new fields.DocumentUUIDField({ type: "Item" }), { required: true, nullable: true, initial: [] });

    return schema;
  }

  migrateData(source) {
    if (source.requirements) {
      source.attributeRequirements = source.requirements;
    }
  }

  prepareDerivedData() {
    const resources = this.resources;
    resources.forEach(async r => {
      if (!r.propagateToActor) {
        // Max could be a formula
        const roll = await new Roll(r.max.formula, this.parent.getRollData()).evaluate();
        r.max.total  = roll.total;
        r.amount = Math.min(r.amount, r.max.total);
      }
    });
  }
}