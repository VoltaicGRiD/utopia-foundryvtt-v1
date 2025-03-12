import UtopiaItemBase from "../base-item.mjs";

export class TalentTree extends UtopiaItemBase {
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "UTOPIA.Items.TalentTree"];

  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
      
    schema.species = new fields.SetField(new fields.StringField(), { initial: [] });
    schema.style = new fields.SchemaField({
      foregroundColor: new fields.ColorField({ required: true, nullable: false, initial: "#FFFFFF" }),
      backgroundColor: new fields.ColorField({ required: true, nullable: false, initial: "#000000" }),
      headerColor: new fields.ColorField({ required: true, nullable: false, initial: "#555555" }),
    });
    schema.allowLooping = new fields.BooleanField({ required: true, nullable: false, initial: false });

    const talent = new fields.SchemaField({
      uuid: new fields.DocumentUUIDField({ type: "Item", validate: async (value) => { 
        return (await fromUuid(value))?.type === "talent";
      }}),
      overridden: new fields.BooleanField({ required: true, nullable: false, initial: false }),
      body: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      mind: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      soul: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
    })
    schema.branches = new fields.ArrayField(new fields.SchemaField({
      name: new fields.StringField({ required: true, nullable: false }),
      talents: new fields.ArrayField(talent, { initial: [] }),
    }), { initial: [{ name: "", talents: [] }] });

    return schema;
  }

  get headerFields() {
    return [
      ...super.headerFields,
      {
        field: this.schema.fields.species,
        stacked: true,
        editable: true,
      },
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
    
    for (let i = 0; i < this.branches.length; i++) {
      if (this.branches.length === 1) break;
      const current = this.branches[i];
      const previous = this.branches[i - 1];
      if (current.talents.length === 0 && previous.talents.length === 0) {
        this.branches.splice(i, 1);
        i--;
      }
    }

    if (this.branches.length === 0) {
      this.branches.push({ name: "", talents: [] });
    }

    // for (const branch of this.branches) {
    //   for (const talent of branch.talents) {
    //     const item = await fromUuid(talent.uuid);
    //     if (talent.body === -1) 
    //       talent.body = item.system.body;
    //     if (talent.mind === -1)
    //       talent.mind = item.system.mind;
    //     if (talent.soul === -1)
    //       talent.soul = item.system.soul;
    //   }
    // }
  }
}