import UtopiaItemBase from "../base-item.mjs";
import { UtopiaSchemaField } from "../fields/schema-field.mjs";
import { SchemaArrayField } from "../fields/schema-set-field.mjs";

export class Body extends UtopiaItemBase {

  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "UTOPIA.Items.Body"]

  /** @override */
  static defineSchema() {
    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.baseDR = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.shp = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.dhp = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.stamina = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    
    const returns = {};
    const allOptions = {
      ...Object.entries(CONFIG.UTOPIA.TRAITS).reduce((acc, [key, value]) => {
        acc[key] = { ...value, group: "UTOPIA.TRAITS.GroupName" };
        return acc;
      }, {}),
      ...Object.entries(CONFIG.UTOPIA.SUBTRAITS).reduce((acc, [key, value]) => {
        acc[key] = { ...value, group: "UTOPIA.SUBTRAITS.GroupName" };
        return acc;
      }, {}),
    } 

    schema.traits = new SchemaArrayField(new fields.SchemaField({
      trait: new fields.StringField({ required: true, nullable: false, choices: allOptions }),
      value: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
    }));
    schema.traitDefault = new fields.NumberField({ required: true, nullable: false, initial: 1 });

    schema.defenses = new UtopiaSchemaField({
      energy: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      heat: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      chill: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      physical: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      psyche: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    })

    schema.dodge = new fields.SchemaField({
      quantity: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
      size: new fields.NumberField({ required: true, nullable: false, initial: 12 })
    });
    schema.block = new fields.SchemaField({
      quantity: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
      size: new fields.NumberField({ required: true, nullable: false, initial: 4 })
    });


    const rarities = {
      ...Object.entries(CONFIG.UTOPIA.RARITIES).reduce((acc, [key, value]) => {
        acc[key] = { ...value, group: "UTOPIA.RARITIES.GroupName" };
        return acc;
      }, {}),
    }

    schema.harvest = new UtopiaSchemaField({
      testTrait: new fields.StringField({ required: true, nullable: false, initial: "agi", choices: allOptions }),
      // TD is calculated by a formula, typically 1/5 or 1/10 of the body's DR
      testDifficulty: new fields.StringField({ required: true, nullable: false, initial: "ceil(@baseDR/5)"}),
      componentFormula: new fields.StringField({ required: true, nullable: false, initial: "1d4" }),
      componentRarity: new fields.StringField({ required: true, nullable: false, initial: "common", choices: rarities }),
      componentType: new fields.StringField({ required: true, nullable: false, initial: "material", choices: {
        material: "UTOPIA.Resource.Type.Material",
        refinement: "UTOPIA.Resource.Type.Refinement",
        power: "UTOPIA.Resource.Type.Power",
      } }),

    });
    
    return schema;
  }

  get headerFields() {
    return [
      ...super.headerFields,
      {
        field: this.schema.fields.baseDR,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.shp,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.dhp,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.stamina,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.traitDefault,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.block.fields.quantity,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.dodge.fields.quantity,
        stacked: false,
        editable: true,
      },
    ]
  };

  get attributeFields() {
    return [
      {
        field: this.schema.fields.defenses,
        stacked: true,
        editable: true,
        columns: 5,
        classes: ["flex-lg"] 
      },
      {
        field: this.schema.fields.traits,
        stacked: true,
        editable: true,
      },
      {
        field: this.schema.fields.harvest,
        stacked: true,
        editable: true,
        columns: 3,
        classes: ["flex-lg"]
      }
    ]
  }
}