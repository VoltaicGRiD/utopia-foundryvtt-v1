import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaGear extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });
    schema.formula = new fields.StringField({
      required: false,
      nullable: true,
    });

    schema.features = new fields.ObjectField();

    schema.cost = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
    });

    schema.category = new fields.StringField({
      required: true,
      nullable: false,
      initial: "fastWeapon",
      choices: {
        fastWeapon: "UTOPIA.Item.Artifice.Features.Categories.fastWeapon",
        moderateWeapon:
          "UTOPIA.Item.Artifice.Features.Categories.moderateWeapon",
        slowWeapon: "UTOPIA.Item.Artifice.Features.Categories.slowWeapon",
        shield: "UTOPIA.Item.Artifice.Features.Categories.shield",
        chestArmor: "UTOPIA.Item.Artifice.Features.Categories.chestArmor",
        headArmor: "UTOPIA.Item.Artifice.Features.Categories.headArmor",
        handArmor: "UTOPIA.Item.Artifice.Features.Categories.handArmor",
        footArmor: "UTOPIA.Item.Artifice.Features.Categories.footArmor",
        consumable: "UTOPIA.Item.Artifice.Features.Categories.consumable",
        artifact: "UTOPIA.Item.Artifice.Features.Categories.artifact",
      },
    });
    schema.artifact = new fields.SchemaField({
      type: new fields.StringField({
        required: true,
        nullable: false,
        initial: "equippable",
        choices: {
          equippable: "UTOPIA.Item.Artifice.Gear.Artifact.equippable",
          handheld: "UTOPIA.Item.Artifice.Gear.Artifact.handheld",
          ammunition: "UTOPIA.Item.Artifice.Gear.Artifact.ammunition",
        },
      }),
      slot: new fields.StringField({
        required: false,
        nullable: true,
        initial: "none",
        choices: {
          none: "UTOPIA.Item.Artifice.Gear.Artifact.Slot.none",
          neck: "UTOPIA.Item.Artifice.Gear.Artifact.Slot.neck",
          back: "UTOPIA.Item.Artifice.Gear.Artifact.Slot.back",
          ring: "UTOPIA.Item.Artifice.Gear.Artifact.Slot.ring",
          waist: "UTOPIA.Item.Artifice.Gear.Artifact.Slot.waist",
        },
      }),
      activation: new fields.StringField({
        required: true,
        nullable: false,
        initial: "none",
        choices: {
          none: "UTOPIA.Item.Artifice.Gear.Artifact.Activation.none",
          oneHand: "UTOPIA.Item.Artifice.Gear.Artifact.Activation.oneHand",
          twoHand: "UTOPIA.Item.Artifice.Gear.Artifact.Activation.twoHand",
        },
      }),
      slots: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
    });

    schema.slot = new fields.StringField({
      required: false,
      nullable: true,
      initial: "none",
      choices: {
        none: "UTOPIA.Item.Artifice.Gear.Slot.none",
        chest: "UTOPIA.Item.Artifice.Gear.Slot.chest",
        head: "UTOPIA.Item.Artifice.Gear.Slot.head",
        hands: "UTOPIA.Item.Artifice.Gear.Slot.hands",
        feet: "UTOPIA.Item.Artifice.Gear.Slot.feet",
      },
    });
    schema.slots = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 3,
    });
    schema.actions = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 1,
    });
    schema.quantity = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 1,
    });

    schema.components = new fields.SchemaField({
      material: new fields.SchemaField({
        crude: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        common: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        extraordinary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        rare: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        legendary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        mythical: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
      }),
      refinement: new fields.SchemaField({
        crude: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        common: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        extraordinary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        rare: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        legendary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        mythical: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
      }),
      power: new fields.SchemaField({
        crude: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        common: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        extraordinary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        rare: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        legendary: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
        mythical: new fields.NumberField({
          required: true,
          nullable: false,
          initial: 0,
        }),
      }),
    });

    schema.formulaOptions = new fields.StringField({
      required: false,
      nullable: true,
      initial: "",
    });
    schema.customFormula = new fields.BooleanField({ required: false, nullable: true, initial: false });

    schema.handling = new fields.StringField({
      required: true,
      nullable: false,
      initial: "none",
      choices: {
        none: "UTOPIA.Item.Artifice.Gear.Handling.none",
        oneHanded: "UTOPIA.Item.Artifice.Gear.Handling.oneHanded",
        twoHanded: "UTOPIA.Item.Artifice.Gear.Handling.twoHanded",
        worn: "UTOPIA.Item.Artifice.Gear.Handling.worn",
      },
    });
    schema.range = new fields.SchemaField({
      close: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
      far: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
    });

    schema.systemVariables = new fields.SchemaField({
      cost: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
      stacks: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
    });

    schema.variable = new fields.SchemaField({
      name: new fields.StringField({
        required: true,
        nullable: false,
        initial: "Variable",
      }),
      description: new fields.StringField({
        required: false,
        nullable: true,
        initial: "",
      }),
      kind: new fields.StringField({
        required: true,
        nullable: false,
        initial: "none",
        choices: {
          none: "UTOPIA.Item.SpellFeatures.Variables.none",
          number: "UTOPIA.Item.SpellFeatures.Variables.number",
          options: "UTOPIA.Item.SpellFeatures.Variables.options",
          dice: "UTOPIA.Item.SpellFeatures.Variables.dice",
        },
      }),
      options: new fields.ArrayField(new fields.StringField()),
      dice: new fields.StringField({
        required: false,
        nullable: true,
        initial: "",
        validate: (value, options) => {
          console.log("Validating dice", value);
          return Roll.validate(value);
        },
      }),
    });
    schema.variables = new fields.SetField(schema.variable, {
      required: false,
      nullable: true,
    });

    schema.valid = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });

    schema.loading = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
    });
    schema.loaded = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
    });
    schema.thorned = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
    });

    schema.usage = new fields.SchemaField({
      uses: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
      reload: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
      recharge: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 1,
      }),
    });

    schema.requiredAttributes = new fields.SchemaField({
      constitution: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
      endurance: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
      effervescence: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
    });

    schema.ignoreSHP = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });
    schema.ignoreDefenses = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });
    schema.ignoreAccuracy = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });
    schema.exhaust = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });
    schema.nonlethal = new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false,
    });

    return schema;
  }

  prepareDerivedData() {
    const featureComponents = {
      material: 0,
      refinement: 0,
      power: 0,
    };

    const keys = Object.keys(this.features);
    keys.forEach((k) => {
      const feature = this.features[k];

      if (feature.system.costModifier !== "flat")
        createCostVariable();

      function createCostVariable() {
        if (!feature.system.variables) {
          feature.system.variables = {};
          
          feature.system.variables.cost = {
            name: "Cost",
            value: 1,
            kind: "number",
          };
        } else if (Object.keys(feature.system.variables).length > 0) {
          if (!feature.system.variables.cost) {
            feature.system.variables.cost = {
              name: "Cost",
              value: 1,
              kind: "number",
            };
          }
        }
       

        console.log("Created cost variable", feature);
      }

      if (feature.system.costLimit) {
        if (feature.system.variables.cost.value > feature.system.costLimit) {
          feature.system.variables.cost.value = feature.system.costLimit;
        }
      }

      switch (feature.system.costModifier) {
        case "multiply":
          createCostVariable();
          feature.costOut = feature.system.cost + "X";
          feature.cost =
            feature.system.cost *
            feature.system.variables.cost.value *
            feature.system.stacks;
          break;
        case "divide":
          createCostVariable();
          feature.costOut = feature.system.cost + "/X";
          feature.cost =
            (feature.system.cost / feature.system.variables.cost.value) *
            feature.system.stacks;
          break;
        case "add":
          createCostVariable();
          feature.costOut = feature.system.cost + "+X";
          feature.cost =
            (feature.system.cost + feature.system.variables.cost.value) *
            feature.system.stacks;
          break;
        case "subtract":
          createCostVariable();
          feature.costOut = feature.system.cost + "-X";
          feature.cost =
            (feature.system.cost - feature.system.variables.cost.value) *
            feature.system.stacks;
          break;
        default:
          feature.costOut = feature.system.cost;
          feature.cost = feature.system.cost * feature.system.stacks;
          break;
      }

      feature.category = game.i18n.localize(
        "UTOPIA.Item.Artifice.Features.Categories." + feature.system.category
      );
      feature.components = {};

      feature.stacks = "x" + feature.system.stacks;

      if (feature.system.components.material) {
        feature.components[
          game.i18n.localize("UTOPIA.Item.Artifice.Components.Types.material")
        ] = feature.system.components.material;
        featureComponents.material += feature.system.components.material;
      }
      if (feature.system.components.refinement) {
        feature.components[
          game.i18n.localize("UTOPIA.Item.Artifice.Components.Types.refinement")
        ] = feature.system.components.refinement;
        featureComponents.refinement += feature.system.components.refinement;
      }
      if (feature.system.components.power) {
        feature.components[
          game.i18n.localize("UTOPIA.Item.Artifice.Components.Types.power")
        ] = feature.system.components.power;
        featureComponents.power += feature.system.components.power;
      }

      feature.stackable = game.i18n.localize(
        "UTOPIA.Item.Artifice.Features.Stackable." + feature.system.stackable
      );
      if (feature.stackable) {
        feature.maxStacks = feature.system.maxStacks;
        feature.componentsPerStack = game.i18n.localize(
          "UTOPIA.Item.Artifice.Features.ComponentsPerStack." +
            feature.system.componentsPerStack
        );
      } else {
        feature.componentsPerStack = "N/A";
      }

      if (feature.system.craftingPrompt.length > 0) {
        let values = [];
        try {
          values = JSON.parse(feature.system.craftingPrompt);
        } catch (e) {
          values = [{value: feature.system.craftingPrompt}]
        }
        // Choices is a SetField, so we need to set the values as an array
        feature.choices = values.map(v => v.value);
  
        console.log(feature.choices);
      }

      feature.choice = feature.system.choice;

      // We need to compile both the Melee and Ranged formulas,
      // Though one or both may be empty

      console.log("Feature Formulas", feature.system.formulas);

      // Melee
      if (feature.system.formulas.melee.length > 0) {
        const melee = new Roll(feature.system.formulas.melee, feature);
        melee.alter(feature.system.stacks, 0);
        feature.melee = melee.formula;
      }

      // Ranged
      if (feature.system.formulas.ranged.length > 0) {
        const ranged = new Roll(feature.system.formulas.ranged, feature);
        ranged.alter(feature.system.stacks, 0);
        feature.ranged = ranged.formula;      
      }

      console.log("Melee, Ranged", feature.melee, feature.ranged);

      this.cost += feature.cost;
    });

    this.formula = Object.values(this.features).filter((v) => v.melee).map((f) => f.melee).join(" + ");
    if (this.formula.length > 0 && Object.values(this.features).filter((v) => v.ranged).length > 0)
      this.formula += " + " + Object.values(this.features).filter((v) => v.ranged).map((f) => f.ranged).join(" + ");
    else if (this.formula.length === 0 && Object.values(this.features).filter((v) => v.ranged).length > 0)
      this.formula = Object.values(this.features).filter((v) => v.ranged).map((f) => f.ranged).join(" + ");
    this.parent.system.selfDamage = Math.pow(this.parent.system.thorned, 2);

    console.log(this );
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
    console.log("Schema", this.schema);
    const choices = this.schema.fields.category.choices;
    Object.keys(choices).forEach((key) => {
      const or = [];
      const and = [];
      var material = 0;
      var refinement = 0;
      var power = 0;
      var materialPer = 0;
      var refinementPer = 0;
      var powerPer = 0;

      switch (key) {
        case "fastWeapon":
          or.push({uuid: "Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1", name: "Harsh"});
          or.push({uuid: "Compendium.utopia.artificeFeatures.Item.Dl9fItoU9UvX1Y3A", name: "Slam"});
          material = 1;
          refinement = 2;
          break;
        case "moderateWeapon":
          or.push("Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1");
          or.push("Compendium.utopia.artificeFeatures.Item.Dl9fItoU9UvX1Y3A");
          material = 2;
          refinement = 1;
          break;
        case "slowWeapon":
          or.push("Compendium.utopia.artificeFeatures.Item.rnU11obiSVQK7um1");
          or.push("Compendium.utopia.artificeFeatures.Item.Dl9fItoU9UvX1Y3A");
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
    this.requirements = requirements;

    const rpCost = this.cost;
    if (rpCost >= 0 && rpCost <= 20) {
      this.rarity = 0;
      this.value = rpCost;
    } else if (rpCost >= 21 && rpCost <= 40) {
      this.rarity = 1;
      this.value = rpCost * 2;
    } else if (rpCost >= 41 && rpCost <= 70) {
      this.rarity = 2;
      this.value = rpCost * 4;
    } else if (rpCost >= 71 && rpCost <= 110) {
      this.rarity = 3;
      this.value = rpCost * 8;
    } else if (rpCost >= 111 && rpCost <= 160) {
      this.rarity = 4;
      this.value = rpCost * 16;
    } else if (rpCost >= 161 && rpCost <= 220) {
      this.rarity = 5;
      this.value = rpCost * 32;
    }

    this.rarityOut = [
      "crude",
      "common",
      "extraordinary",
      "rare",
      "legendary",
      "mythical",
    ][this.rarity];
    this.rarityColor = [
      "#a0a0a0",
      "#c8c8c8",
      "#34d178",
      "#40a0ff",
      "#ffa63f",
      "#ea3fff",
    ][this.rarity];

    const craftRequirements = {};
    const req = requirements[this.category];
    const material = req.material;
    const refinement = req.refinement;
    const power = req.power;
    const materialPer = req.materialPer;
    const refinementPer = req.refinementPer;
    const powerPer = req.powerPer;
    craftRequirements["material"] =
      material +
      (materialPer > 0 ? Math.floor(materialPer * rpCost) : 0) +
      featureComponents.material;
    craftRequirements["refinement"] =
      refinement +
      (refinementPer > 0 ? Math.floor(refinementPer * rpCost) : 0) +
      featureComponents.refinement;
    craftRequirements["power"] =
      power +
      (powerPer > 0 ? Math.floor(powerPer * rpCost) : 0) +
      featureComponents.power;
    craftRequirements["or"] = req.or;
    craftRequirements["and"] = req.and;
    this.craftRequirements = craftRequirements;

    [this.valid, this.validMessages] = this.validateRequirements(craftRequirements);
  }

  /**
   * Validates required features without returning early.
   * Lets the rest of the method run so overrides can apply.
   *
   * @param {Object} requirements - An object with "or" and "and" arrays of uuids.
   * @returns {boolean} Whether or not the requirements are met.
   */
  validateRequirements(requirements) {
    let valid = true;
    const validMessages = [];

    // 1. "OR" requirement: at least one must match a feature
    if (requirements.or && requirements.or.length > 0) {
      let foundOr = false;
      outerLoop: for (const item of requirements.or) {
        const uuid = item.uuid || item;
        for (const [id, feature] of Object.entries(this.features)) {
          if (feature.ref === uuid) {
            foundOr = true;
            break outerLoop; // we only need one match to satisfy the OR
          }
        }
      }
      if (!foundOr) {
        valid = false;
        validMessages.push(
          "Failed requirement: " + requirements.or.map(item => item.name || item).join(" or ")
        );
      }
    }

    // 2. "AND" requirement: all must match a feature
    if (requirements.and && requirements.and.length > 0) {
      for (const uuid of requirements.and) {
        let foundAnd = false;
        for (const [id, feature] of Object.entries(this.features)) {
          if (feature.ref === uuid) {
            foundAnd = true;
            break; // found this one, can check next
          }
        }
        if (!foundAnd) {
          valid = false;
          validMessages.push("Failed requirement: " + uuid);
          // don't break here so we can continue checking or do overrides
        }
      }
    }

    // // 3. Check stored components against required components
    // // When we check, if we notice that the RP cost of this item
    // // is higher than __any__ of the components stored within it,
    // // we return all of the components stored to the player and display a message.
    // const rarity = this.rarity;
    // const components = this.components;
    // const actor = this.parent.parent && this.parent.parent instanceof Actor ? this.parent.parent : undefined;

    // for (const [index, quality] in ["crude", "common", "extraordinary", "rare", "legendary", "mythical"].entries()) {
    //   // Rarity is a number, starting at 0, so we can use it as an index
    //   const material = components.material[quality];
    //   const refinement = components.refinement[quality];
    //   const power = components.power[quality];

    //   if (rarity !== index) {
    //     // Return all components to the player
    //     if (actor) {
    //       actor.system.components.material[quality] += material;
    //       actor.system.components.refinement[quality] += refinement;
    //       actor.system.components.power[quality] += power;
    //       this.material = 0;
    //       this.refinement = 0;
    //       this.power = 0;
    //     }
    //   }
    //   else {
    //     if (requirements.material === 0 && material !== 0) {
    //       // We have more material than required, return it to the player
    //       if (actor) {
    //         actor.system.components.material[quality] += material;
    //       }
    //     }
    //     else if (requirements.material > 0) {
    //       if (material < requirements.material) {
    //         valid = false;
    //         validMessages.push(`Missing: ${quality} material (${requirements.material} required)`);
    //       }
    //       else if (material > requirements.material) {
    //         // We have more material than required, return the excess to the player
    //         if (actor) {
    //           actor.system.components.material[quality] += material - requirements.material;
    //           this.material = requirements.material;
    //         }
    //       }
    //     }

    //     if (requirements.refinement === 0 && refinement !== 0) {
    //       // We have more refinement than required, return it to the player
    //       if (actor) {
    //         actor.system.components.refinement[quality] += refinement;
    //       }
    //     }
    //     else if (requirements.refinement > 0) {
    //       if (refinement < requirements.refinement) {
    //         valid = false;
    //         validMessages.push(`Missing: ${quality} refinement (${requirements.refinement} required)`);
    //       }
    //       else if (refinement > requirements.refinement) {
    //         // We have more refinement than required, return the excess to the player
    //         if (actor) {
    //           actor.system.components.refinement[quality] += refinement - requirements.refinement;
    //           this.refinement = requirements.refinement;
    //         }
    //       }
    //     }

    //     if (requirements.power === 0 && power !== 0) {
    //       // We have more power than required, return it to the player
    //       if (actor) {
    //         actor.system.components.power[quality] += power;
    //       }
    //     }
    //     else if (requirements.power > 0) {
    //       if (power < requirements.power) {
    //         valid = false;
    //         validMessages.push(`Missing: ${quality} power (${requirements.power} required)`);
    //       }
    //       else if (power > requirements.power) {
    //         // We have more power than required, return the excess to the player
    //         if (actor) {
    //           actor.system.components.power[quality] += power - requirements.power;
    //           this.power = requirements.power;
    //         }
    //       }
    //     }
    //   }
    // }

    // 3. Possible override or custom final logic
    // if (someOverrideCondition) { valid = true; }

    return [valid, validMessages];
  }
}
