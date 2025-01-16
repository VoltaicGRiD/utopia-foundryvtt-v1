import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaArtificeFeature extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.formulas = new fields.SchemaField({
      ranged: new fields.StringField({ required: false, nullable: true }),
      melee: new fields.StringField({ required: false, nullable: true }),
    });
    
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
    schema.categories = new fields.SetField(schema.category, { required: true, nullable: false, initial: [] });   
    
    schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.costModifier = new fields.StringField({ required: true, nullable: false, initial: "flat", choices: {
      "flat": "UTOPIA.Item.Artifice.Features.CostModifier.flat",
      "add": "UTOPIA.Item.Artifice.Features.CostModifier.add",
      "subtract": "UTOPIA.Item.Artifice.Features.CostModifier.subtract",
      "multiply": "UTOPIA.Item.Artifice.Features.CostModifier.multiply",
      "divide": "UTOPIA.Item.Artifice.Features.CostModifier.divide",
    } });
    schema.costLimit = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.costBonus = new fields.StringField({ required: false, nullable: true });
    
    schema.tagline = new fields.StringField({ required: false, nullable: true, initial: "" });

    schema.incompatible = new fields.SetField(new fields.DocumentUUIDField({ entityClass: "Item" }), {required: false, nullable: true, initial: [] });
    schema.requires = new fields.SetField(new fields.DocumentUUIDField({ entityClass: "Item" }), {required: false, nullable: true, initial: [] });

    schema.stackable = new fields.StringField({ required: false, nullable: false, initial: "unstackable", choices: {
      "unstackable": "UTOPIA.Item.Artifice.Features.Stackable.unstackable",
      "stackable": "UTOPIA.Item.Artifice.Features.Stackable.stackable",
    } });
    schema.stacks = new fields.NumberField({ required: false, nullable: true, initial: 1 });
    schema.maxStacks = new fields.NumberField({ required: false, nullable: true, initial: 0 });

    schema.range = new fields.SchemaField({
      close: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
      far: new fields.NumberField({ required: false, nullable: true, initial: 0 }),
    });
    
    schema.components = new fields.SchemaField({
      material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    })
    schema.componentsPerStack = new fields.StringField({ required: false, nullable: false, initial: "all", choices: {
      "one": "UTOPIA.Item.Artifice.Features.ComponentsPerStack.one",
      "all": "UTOPIA.Item.Artifice.Features.ComponentsPerStack.all",
    } });

    schema.ammo = new fields.SchemaField({
      quantity: new fields.NumberField({ required: false, nullable: false, initial: 0 }),
      item: new fields.StringField({ required: false, nullable: true, initial: "" }),
    })
    
    schema.affectsOthers = new fields.StringField({ required: false, nullable: false, initial: "this", choices: {
      "this": "UTOPIA.Item.Artifice.Features.AffectsOthers.this",
      "all": "UTOPIA.Item.Artifice.Features.AffectsOthers.all",
    } });

    schema.craftingPrompt = new fields.StringField({ required: false, nullable: true, initial: "" });
    schema.choices = new fields.SetField(new fields.StringField({ required: false, nullable: true, initial: [] }));
    schema.choice = new fields.StringField({ required: false, nullable: true, initial: "none" });
    schema.grantsAction = new fields.DocumentUUIDField({ entityClass: "Item", required: false, nullable: true });
    
    return schema;
  }

  async prepareDerivedData() {
    // const ammoTypes = {};

    // const packs = game.packs.filter(p => p.metadata.entity === "Item");
    // for (let pack of packs) {
    //   let items = await pack.getDocuments({type: 'general'}).filter(i => i.system.category === "ammunition");
    //   items.forEach(i => ammoTypes[i.id] = i.name);
    // }

    // const worldItems = game.items.filter(i => i.system.category === "ammunition");
    // worldItems.forEach(i => ammoTypes[i.id] = i.name);

    // this.schema.fields.ammo.fields.item.choices = ammoTypes;

    if (this.formula && this.formula.length > 0) {
      if (this.formulas.melee.length === 0)
        this.formulas.melee = this.formula;
    }

    if (this.costModifier !== "flat") {
      this.variables = {};
      this.variables.cost = {
        name: "Cost",
        value: 1,
        kind: "number",
      }
    }

    if (this.variables && Object.keys(this.variables).length > 0) {
      for (let [key, variable] of Object.entries(this.variables)) {
        if (variable.name === "Cost") {
          const mod = this.costModifier;
          const cost = this.cost;

          switch (mod) {
            case "add":
              this.cost += variable.value;
              break;
            case "subtract":
              this.cost -= variable.value;
              break;
            case "multiply":
              this.cost *= variable.value;
              break;
            case "divide":
              this.cost /= Math.floor(variable.value);
              break;
          }
        }
      }
    }

    if (this.choices.length === 0 && this.craftingPrompt.length > 0) {
      let values = [];
      try {
        values = JSON.parse(this.craftingPrompt);
      } catch (e) {
        values = [{value: this.craftingPrompt}]
      }
      // Choices is a SetField, so we need to set the values as an array
      this.choices = values.map(v => v.value);

      console.log(this.choices);
    }

    if (!this.choice) {
      let values = [];
      try {
        values = JSON.parse(this.craftingPrompt);
      } catch (e) {
        values = [{value: this.craftingPrompt}]
      }
      if (values.length > 0) {
        this.choice = values[0].value;
      }
      else {
        this.choice = "none";
      }
    }
  }
}