import UtopiaDataModel from "../../base-model.mjs";

export default class UtopiaGearBase extends UtopiaDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    console.log(this);

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    schema.equippable = new fields.BooleanField({ required: true, initial: false, validate: (value) => {
      if (this.equippable && this.handheld) return false;
    }});
    schema.handheld = new fields.BooleanField({ required: true, initial: false, validate: (value) => {
      if (this.equippable && this.handheld) return false;
    }});
    schema.hands = new fields.NumberField({...requiredInteger, min: 0, initial: 1, validate: (value) => {
      if (this.handheld && value == 0) return false;
    }});

    schema.slot = new fields.StringField({ required: true, nullable: false, initial: "head", choices: {
      "head": "UTOPIA.Item.Gear.Slot.head",
      "neck": "UTOPIA.Item.Gear.Slot.neck",
      "back": "UTOPIA.Item.Gear.Slot.back",
      "chest": "UTOPIA.Item.Gear.Slot.chest",
      "waist": "UTOPIA.Item.Gear.Slot.waist",
      "hands": "UTOPIA.Item.Gear.Slot.hands",
      "ring": "UTOPIA.Item.Gear.Slot.ring",
      "feet": "UTOPIA.Item.Gear.Slot.feet",
    }})

    schema.slots = new fields.NumberField({...requiredInteger});
    schema.value = new fields.NumberField({...requiredInteger, min: 0, max: 10000});
    schema.rarityPoints = new fields.NumberField({...requiredInteger, min: 0, max: 10000});
    schema.price = new fields.SchemaField({
      silver: new fields.NumberField({...requiredInteger, min: 0, max: 10000}),
      utian: new fields.NumberField({...requiredInteger, min: 0, max: 10000}),
    })
    schema.actionCost = new fields.NumberField({...requiredInteger, min: 0, max: 6});
    schema.augmentable = new fields.BooleanField({ required: true, nullable: false, initial: true });

    schema.resource = new fields.SchemaField({
      resourceId: new fields.StringField({...requiredString, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString}),
      max: new fields.NumberField({...requiredInteger, initial: 0}),
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
        "trait": "UTOPIA.Item.Action.Category.trait",
        "damage": "UTOPIA.Item.Action.Category.damage",
        "macro": "UTOPIA.Item.Action.Category.macro",
      }}),
      type: new fields.StringField({required: true, nullable: false, initial: "turn", choices: {
        "turn": "UTOPIA.Item.Action.Type.turn",
        "interrupt": "UTOPIA.Item.Action.Type.interrupt",
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
        "none": "UTOPIA.Item.Action.Template.none",
        "sbt": "UTOPIA.Item.Action.Template.sbt",
        "mbt": "UTOPIA.Item.Action.Template.mbt",
        "lbt": "UTOPIA.Item.Action.Template.lbt",
        "xbt": "UTOPIA.Item.Action.Template.xbt",
        "cone": "UTOPIA.Item.Action.Template.cone",
        "line": "UTOPIA.Item.Action.Template.line",
      }}),
      resource: new fields.StringField({required: true, nullable: false}),
      consumed: new fields.NumberField({...requiredInteger, initial: 0}),
      macro: new fields.DocumentUUIDField({required: false, nullable: true}),
      actor: new fields.StringField({required: true, nullable: false, initial: "default", choices: {
        "default": "UTOPIA.Item.Action.Actor.default",
        "self": "UTOPIA.Item.Action.Actor.self",
        "target": "UTOPIA.Item.Action.Actor.target", 
      }}),
    })
    schema.actions = new fields.ArrayField(schema.action, {required: true, nullable: false, initial: this.name !== "UtopiaWeapon" ? [schema.action.getInitialValue()] : []});
        
    schema.material = new fields.SchemaField({
      amount: new fields.NumberField({...requiredInteger}),
      // TODO: Add material quality 
    })
    schema.refinement = new fields.SchemaField({
      amount: new fields.NumberField({...requiredInteger}),
      // TODO: Add refinement quality
    })
    schema.power = new fields.SchemaField({
      amount: new fields.NumberField({...requiredInteger}),
      // TODO: Add power quality
    })

    schema.container = new fields.SchemaField({
      capacity: new fields.NumberField({...requiredInteger}),
      items: new fields.ArrayField(new fields.DocumentUUIDField({ entityClass: "Item" })),
    });

    schema.range = new fields.StringField({
      required: true,
      nullable: false,
      initial: "0/0", // Melee
      validate: (value) => {
        const [close, far] = value.split("/");
        if (isNaN(close) || isNaN(far)) return false;
        if (parseInt(close) < 0 || parseInt(far) < 0) return false;
        if (parseInt(close) > parseInt(far)) return false;
      },
    });

    schema.features = new fields.ArrayField(new fields.DocumentUUIDField(), {
      required: true,
      nullable: false,
      initial: []
    });
    schema.controlledByFeatures = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });
    schema.featureActions = new fields.ArrayField(new fields.SchemaField({
      actionId: new fields.StringField({required: true, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({...requiredString}),
      category: new fields.StringField({required: true, nullable: false, initial: "trait", choices: {
        "trait": "UTOPIA.Item.Action.Category.trait",
        "damage": "UTOPIA.Item.Action.Category.damage",
        "macro": "UTOPIA.Item.Action.Category.macro",
      }}),
      type: new fields.StringField({required: true, nullable: false, initial: "turn", choices: {
        "turn": "UTOPIA.Item.Action.Type.turn",
        "interrupt": "UTOPIA.Item.Action.Type.interrupt",
      }}),
    }));

    schema.formula = new fields.StringField({...requiredString});
    schema.flavor = new fields.StringField({...requiredString});
    schema.description = new fields.StringField({...requiredString});

    return schema;
  }

  get isContainer() {
    return this.container.capacity > 0;
  }

  get hasGmNotes() { 
    if (this.gmSecrets) return true 
  }

  prepareDerivedData() {
    this.price.silver = this.value;
    this.price.utian = this.value * 100;

    for (const action of this.actions) {
      if (action.type === "interrupt") {
        this.schema.fields.action.fields.cost.max = 2;
      }
    }

    if (this.rarityPoints <= 20) {
      this.rarity = 0;
    } else if (this.rarityPoints > 20 && this.rarityPoints <= 40) {
      this.rarity = 1;
    } else if (this.rarityPoints > 40 && this.rarityPoints <= 70) {
      this.rarity = 2;
    } else if (this.rarityPoints > 70 && this.rarityPoints <= 110) {
      this.rarity = 3;
    } else if (this.rarityPoints > 110 && this.rarityPoints <= 160) {
      this.rarity = 4;
    } else if (this.rarityPoints > 160) {
      this.rarity = 5;
    } else {
      this.rarity = 0;
    }
  }
}