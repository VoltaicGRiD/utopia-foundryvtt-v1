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
    schema.costBonus = new fields.StringField({ required: false, nullable: true });
    
    schema.incompatible = new fields.SetField(new fields.DocumentUUIDField({ entityClass: "Item" }), {required: false, nullable: true, initial: [] });
    schema.requires = new fields.SetField(new fields.DocumentUUIDField({ entityClass: "Item" }), {required: false, nullable: true, initial: [] });

    schema.stackable = new fields.StringField({ required: false, nullable: false, initial: "unstackable", choices: {
      "unstackable": "UTOPIA.Item.Artifice.Features.Stackable.unstackable",
      "stackable": "UTOPIA.Item.Artifice.Features.Stackable.stackable",
    } });
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
    schema.grantsAction = new fields.DocumentUUIDField({ entityClass: "Item", required: false, nullable: true });
    
    return schema;
  }

  async prepareDerivedData() {
    const ammoTypes = {};

    const packs = game.packs.filter(p => p.metadata.entity === "Item");
    for (let pack of packs) {
      let items = await pack.getDocuments({type: 'general'}).filter(i => i.system.category === "ammunition");
      items.forEach(i => ammoTypes[i.id] = i.name);
    }

    const worldItems = game.items.filter(i => i.system.category === "ammunition");
    worldItems.forEach(i => ammoTypes[i.id] = i.name);

    this.schema.fields.ammo.fields.item.choices = ammoTypes;

    if (this.parent.system.costModifier !== "flat") {
      this.parent.system.variables = {};
      this.parent.system.variables.cost = {
        name: "Cost",
        value: 1,
        kind: "number",
      }
    }

    if (this.parent.system.variables && Object.keys(this.parent.system.variables).length > 0) {
      for (let variable of this.parent.system.variables) {
        if (variable.name === "Cost") {
          const mod = this.parent.system.costModifier;
          const cost = this.parent.system.cost;

          switch (mod) {
            case "add":
              this.parent.system.cost += variable.value;
              break;
            case "subtract":
              this.parent.system.cost -= variable.value;
              break;
            case "multiply":
              this.parent.system.cost *= variable.value;
              break;
            case "divide":
              this.parent.system.cost /= Math.floor(variable.value);
              break;
          }
        }
      }
    }
  }
}