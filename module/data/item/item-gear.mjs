import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaGear extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });
    schema.formula = new fields.StringField({ required: false, nullable: true });

    schema.features = new fields.ArrayField(new fields.DocumentUUIDField({ type: "Item", embedded: false }));

    schema.category = new fields.StringField({ required: true, nullable: false, initial: "fastWeapon", choices: {
      "fastWeapon": "UTOPIA.Item.Artifice.Features.Categories.fastWeapon",
      "moderateWeapon": "UTOPIA.Item.Artifice.Features.Categories.moderateWeapon",
      "slowWeapon": "UTOPIA.Item.Artifice.Features.Categories.slowWeapon",
      "shield": "UTOPIA.Item.Artifice.Features.Categories.shield",
      "chestArmor": "UTOPIA.Item.Artifice.Features.Categories.chestArmor",
      "headArmor": "UTOPIA.Item.Artifice.Features.Categories.headArmor",
      "handArmor": "UTOPIA.Item.Artifice.Features.Categories.handArmor",
      "footArmor": "UTOPIA.Item.Artifice.Features.Categories.footArmor",
      "consumable": "UTOPIA.Item.Artifice.Features.Categories.consumable",
      "artifact": "UTOPIA.Item.Artifice.Features.Categories.artifact",
    }}); 
    schema.artifact = new fields.SchemaField({
      type: new fields.StringField({ required: true, nullable: false, initial: "equippable", choices: {
        "equippable": "UTOPIA.Item.Artifice.Gear.Artifact.equippable",
        "handheld": "UTOPIA.Item.Artifice.Gear.Artifact.handheld",
        "ammunition": "UTOPIA.Item.Artifice.Gear.Artifact.ammunition",
      }}),
      slot: new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
        "none": "UTOPIA.Item.Artifice.Gear.Artifact.Slot.none",
        "neck": "UTOPIA.Item.Artifice.Gear.Artifact.Slot.neck",
        "back": "UTOPIA.Item.Artifice.Gear.Artifact.Slot.back",
        "ring": "UTOPIA.Item.Artifice.Gear.Artifact.Slot.ring",
        "waist": "UTOPIA.Item.Artifice.Gear.Artifact.Slot.waist",
      }}),
      activation: new fields.StringField({ required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.Artifice.Gear.Artifact.Activation.none",
        "oneHand": "UTOPIA.Item.Artifice.Gear.Artifact.Activation.oneHand",
        "twoHand": "UTOPIA.Item.Artifice.Gear.Artifact.Activation.twoHand",
      }}),
      slots: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
    })

    schema.slot = new fields.StringField({ required: false, nullable: true, initial: "none", choices: {
      "none": "UTOPIA.Item.Artifice.Gear.Slot.none",
      "chest": "UTOPIA.Item.Artifice.Gear.Slot.chest",
      "head": "UTOPIA.Item.Artifice.Gear.Slot.head",
      "hands": "UTOPIA.Item.Artifice.Gear.Slot.hands",
      "feet": "UTOPIA.Item.Artifice.Gear.Slot.feet",
    }});
    schema.slots = new fields.NumberField({ required: true, nullable: false, initial: 3 });
    schema.actions = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.quantity = new fields.NumberField({ required: true, nullable: false, initial: 1 });

    schema.handling = new fields.StringField({ required: true, nullable: false, initial: "none", choices: {
      "none": "UTOPIA.Item.Artifice.Gear.Handling.none",
      "oneHanded": "UTOPIA.Item.Artifice.Gear.Handling.oneHanded",
      "twoHanded": "UTOPIA.Item.Artifice.Gear.Handling.twoHanded",
      "worn": "UTOPIA.Item.Artifice.Gear.Handling.worn",
    }});
    schema.range = new fields.SchemaField({
      close: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
      far: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    });

    schema.systemVariables = new fields.SchemaField({
      cost: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      stacks: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
    });
    
    schema.variable = new fields.SchemaField({
      name: new fields.StringField({ required: true, nullable: false, initial: "Variable" }),
      description: new fields.StringField({ required: false, nullable: true, initial: "" }),
      kind: new fields.StringField({ required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.SpellFeatures.Variables.none",
        "number": "UTOPIA.Item.SpellFeatures.Variables.number",
        "options": "UTOPIA.Item.SpellFeatures.Variables.options",
        "dice": "UTOPIA.Item.SpellFeatures.Variables.dice",
      }}),
      options: new fields.ArrayField(new fields.StringField()),
      dice: new fields.StringField({ required: false, nullable: true, initial: "", validate: ((value, options) => {
        console.log("Validating dice", value);
        return Roll.validate(value);
      })}),
    })
    schema.variables = new fields.SetField(schema.variable, { required: false, nullable: true });

    schema.loading = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.loaded = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.thorned = new fields.NumberField({ required: true, nullable: false, initial: 0 });

    schema.usage = new fields.SchemaField({
      uses: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
      reload: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
      recharge: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
    });

    schema.requiredAttributes = new fields.SchemaField({
      constitution: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      endurance: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      effervescence: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    });

    schema.ignoreSHP = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.ignoreDefenses = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.ignoreAccuracy = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.exhaust = new fields.BooleanField({ required: true, nullable: false, initial: false });
    schema.nonlethal = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }
  
  async _getFeatures() {
    const features = [];
    for (const f of this.features) {

      const parsedUuid = foundry.utils.parseUuid(f);
      if (parsedUuid.collection.size === 0) {
        await parsedUuid.collection.getDocuments();
      }

      let feature = parsedUuid.collection.get(parsedUuid.id);

      if (!feature) continue;

      features.push(feature);
    }

    return features;
  }

  prepareDerivedData() {
    const features = this._getFeatures();
    for (const feature of features) {
  
      const effects = feature.effects;
      for (let effect of effects) {
        const changes = effect.changes;
        for (let change of changes) {
          console.log("Applying change", change, this.slots);
          effect.apply(this.parent, change);
          console.log("Applied change", change, this.slots);
        }
      }
      
      switch (feature.system.costModifier) {
        case "multiply": feature.cost = feature.system.cost + "X"; break;
        case "divide": feature.cost = feature.system.cost + "/X"; break;
        case "add": feature.cost = feature.system.cost + "+X"; break;
        case "subtract": feature.cost = feature.system.cost + "-X"; break;
        default: feature.cost = feature.system.cost;
      }

      feature.category = game.i18n.localize('UTOPIA.Item.Artifice.Features.Categories.' + feature.system.category);
      feature.components = {}

      if (feature.system.components.material) 
        feature.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.material')] = feature.system.components.material;
      if (feature.system.components.refinement)
        feature.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.refinement')] = feature.system.components.refinement;
      if (feature.system.components.power)
        feature.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.power')] = feature.system.components.power;

      feature.stackable = game.i18n.localize('UTOPIA.Item.Artifice.Features.Stackable.' + feature.system.stackable);
      if (feature.stackable) {
        feature.maxStacks = feature.system.maxStacks;
        feature.componentsPerStack = game.i18n.localize('UTOPIA.Item.Artifice.Features.ComponentsPerStack.' + feature.system.componentsPerStack);
      } else {
        feature.componentsPerStack = "N/A";
      }
      feature.system.uuid = f;

      this.parent.features.push(feature);
    };

    this.parent.system.selfDamage = Math.pow(this.parent.system.thorned, 2);

    console.log(this.parent);
    // We can extend the functionality of this and other classes with Active Effects
    // We just have to call the AE's method for preparing / updating source data so
    // that this data gets updated based on the AE's changes list
    // this.prepareActiveEffects(); or something like that

    switch (this.parent.system.category) {
      case "fastWeapon":
        this.parent.system.actions = 1;
        this.parent.system.range = { close: 0, far: 0 };
        this.parent.system.handling = "oneHanded";
        this.parent.system.slots = 3;
        break;
      case "moderateWeapon":
        this.parent.system.actions = 2;
        this.parent.system.range = { close: 0, far: 0 };
        this.parent.system.handling = "oneHanded";
        this.parent.system.slots = 3;
        break;
      case "slowWeapon":
        this.parent.system.actions = 3;
        this.parent.system.range = { close: 0, far: 0 };
        this.parent.system.handling = "oneHanded";
        this.parent.system.slots = 3;
        break;
      case "shield":
        this.parent.system.actions = 1;
        this.parent.system.handling = "oneHanded";
        this.parent.system.slots = 3;
        break;
      case "chestArmor":
        this.parent.system.slot = "chest";
        this.parent.system.slots = 3;
        break;
      case "headArmor":
        this.parent.system.slot = "head";
        this.parent.system.slots = 3;
        break;
      case "handArmor":
        this.parent.system.slot = "hands";
        this.parent.system.slots = 3;
        break;
      case "footArmor":
        this.parent.system.slot = "feet";
        this.parent.system.slots = 3;
        break;
      case "consumable":
        this.parent.system.actions = 2;
        this.parent.system.handling = "oneHanded";
        this.parent.system.range = { close: 0, far: 0 };
        this.parent.system.slots = 3;
        break;
      case "artifact":
        this.parent.system.actions = 1;      
        break;
    }

    const requirements = {};
    this.schema.category.choices.forEach((label, key) => {
      const or = [];
      const and = [];
      const material = 0;
      const refinement = 0;
      const power = 0;
      const materialPer = 0;
      const refinementPer = 0;
      const powerPer = 0;

      switch (key) {
        case "fastWeapon":
          or.push("Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1");
          or.push("Compendium.utopia.artificeFeatures.Item.Vf4QvuijJO2EjT0O");
          material = 1;
          refinement = 2;
          break;
        case "moderateWeapon":
          or.push("Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1");
          or.push("Compendium.utopia.artificeFeatures.Item.Vf4QvuijJO2EjT0O");
          material = 2;
          refinement = 1;
          break;
        case "slowWeapon":
          or.push("Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1");
          or.push("Compendium.utopia.artificeFeatures.Item.Vf4QvuijJO2EjT0O");
          material = 3;
          break;
        case "shield":
          material = 3;
          break;
        case "chestArmor":
          material = 5;
          break;
        case "headArmor":
          material = 3;
          refinement = 1;
          break;
        case "handArmor":
          material = 1;
          refinement = 2;
          break;
        case "footArmor":
          material = 1;
          refinement = 2;
          break;
        case "consumable":
          // TODO: Add consumable feature requirement "DOSED"
          refinement = 1;
          power = 1;
          refinementPer = 40;
          powerPer = 50;
          break;
        case "artifact":
          material = 1;  
          refinement = 1;
          power = 1;
          materialPer = 25;
          refinementPer = 40;
          powerPer = 50;
      }

      requirements[key] = {
        or: or,
        and: and,
        material: material,
        refinement: refinement,
        power: power,
        materialPer: materialPer,
        refinementPer: refinementPer,
        powerPer: powerPer,
      };
    });
    this.parent.system.requirements = requirements;

    const rpCost = this.parent.system.rpCost;
    const system = this.parent.system;
    if (rpCost >= 0 && rpCost <= 20) {
      system.rarity = 0;
      system.value = rpCost;
    } else if (rpCost >= 21 && rpCost <= 40) {
      system.rarity = 1;
      system.value = rpCost * 2;
    } else if (rpCost >= 41 && rpCost <= 70) {
      system.rarity = 2;
      system.value = rpCost * 4;
    } else if (rpCost >= 71 && rpCost <= 110) {
      system.rarity = 3;
      system.value = rpCost * 8;
    } else if (rpCost >= 111 && rpCost <= 160) {
      system.rarity = 4;
      system.value = rpCost * 16;
    } else if (rpCost >= 161 && rpCost <= 220) {
      system.rarity = 5;
      system.value = rpCost * 32;
    }

    const craftRequirements = {};
    const req = requirements[system.category];
    const material = req.material;
    const refinement = req.refinement;
    const power = req.power;
    const materialPer = req.materialPer;
    const refinementPer = req.refinementPer;
    const powerPer = req.powerPer;
    craftRequirements["material"] = material + (materialPer > 0) ? Math.floor(materialPer * rpCost) : 0;
    craftRequirements["refinement"] = refinement + (refinementPer > 0) ? Math.floor(refinementPer * rpCost) : 0;
    craftRequirements["power"] = power + (powerPer > 0) ? Math.floor(powerPer * rpCost) : 0;
    this.parent.system.craftRequirements = craftRequirements;
  }
}