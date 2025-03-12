import { EffectChoiceField } from "../../system/fields/effectChoiceField.mjs";
import UtopiaItemBase from "../base-item.mjs";


export class Talent extends UtopiaItemBase {
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "UTOPIA.Items.Talent"];

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.body = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.mind = new fields.NumberField({ required: true, nullable: false, initial: 0 });
    schema.soul = new fields.NumberField({ required: true, nullable: false, initial: 0 });

    schema.options = new fields.SchemaField({
      // TODO: choices: new fields.SetField(new EffectChoiceField(), { initial: [] }),
      choices: new fields.SetField(new fields.StringField({ required: true, nullable: false, initial: "" }), { initial: [] }),
      category: new fields.StringField({ required: true, nullable: false, initial: "" }),
    });

    schema.macro = new fields.DocumentUUIDField({ type: "Macro" });
    schema.grants = new fields.SetField(new fields.DocumentUUIDField({ type: "Item" }), { initial: [] });

    return schema;
  }

  get headerFields() {
    return [
      ...super.headerFields,
      {
        field: this.schema.fields.body,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.mind,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.soul,
        stacked: false,
        editable: true,
      },
    ]
  }

  get attributeFields() {
    return [
      {
        field: this.schema.fields.options.fields.choices,
        stacked: true,
        editable: true,
      },
      {
        field: this.schema.fields.options.fields.category,
        stacked: true,
        editable: true,
      },
      {
        field: this.schema.fields.macro,
        stacked: true,
        editable: true,
      },
      {
        field: this.schema.fields.grants,
        stacked: true,
        editable: true,
      },
    ]
  }

  get total() {
    return this.body + this.mind + this.soul;
  }
}