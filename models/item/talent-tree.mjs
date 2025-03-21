import UtopiaItemBase from "../base-item.mjs";

export class TalentTree extends UtopiaItemBase {
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "UTOPIA.Items.TalentTree"];

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.style = new fields.SchemaField({
      foregroundColor: new fields.ColorField({ required: true, nullable: false, initial: "#FFFFFF" }),
      backgroundColor: new fields.ColorField({ required: true, nullable: false, initial: "#000000" }),
      headerColor: new fields.ColorField({ required: true, nullable: false, initial: "#555555" }),
    });
    schema.allowLooping = new fields.BooleanField({ required: true, nullable: false, initial: false });

    schema.branchCount = new fields.NumberField({ required: true, nullable: false, initial: 3 });

    const talent = new fields.SchemaField({
      uuid: new fields.DocumentUUIDField({ type: "Item", validate: async (value) => { 
        return (await fromUuid(value))?.type === "talent";
      }}),
      overridden: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      body: new fields.NumberField({ required: true, nullable: false, initial: 0, sign: true }),
      mind: new fields.NumberField({ required: true, nullable: false, initial: 0, sign: true }),
      soul: new fields.NumberField({ required: true, nullable: false, initial: 1, sign: true }),
    })
    schema.branches = new fields.ArrayField(new fields.SchemaField({
      talents: new fields.ArrayField(talent, { initial: [] }),
    }), { initial: [{ name: "", talents: [] }, { name: "", talents: [] }, { name: "", talents: [] }] });

    return schema;
  }

  get headerFields() {
    return [
      ...super.headerFields,
      {
        field: this.schema.fields.allowLooping,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.style.fields.foregroundColor,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.style.fields.backgroundColor,
        stacked: false,
        editable: true,
      },
      {
        field: this.schema.fields.style.fields.headerColor,
        stacked: false,
        editable: true,
      }, 
    ]
  }

  static migrateData(source) {
    for (let i = 0; i < source.branches.length; i++) {
      const branch = source.branches[i];
      for (let j = 0; j < branch.talents.length; j++) {
        const talent = branch.talents[j];
        if (typeof talent === "string") {
          branch.talents[j] = { uuid: talent };
        }
      }
    }

    return source;
  }

  async prepareDerivedData() {
    super.prepareDerivedData();

    if (this.branches.length < this.branchCount) {
      const diff = this.branchCount - this.branches.length;
      for (let i = 0; i < diff; i++) {
        this.branches.push({ name: "", talents: [] });
      }
    }
  }
}