export class TalentField extends foundry.data.fields.SchemaField {
  constructor({ tree, branch, tier, id, ...fields }, options, context) {
    fields = {
      //tree: new foundry.data.fields.StringField({ required: true, nullable: false, label: "UTOPIA.Talents.Tree.label", hint: "UTOPIA.Talents.Tree.hint" }),
      branch: new foundry.data.fields.StringField({ required: true, nullable: true, label: "UTOPIA.Talents.Branch.label", hint: "UTOPIA.Talents.Branch.hint" }),
      tier: new foundry.data.fields.NumberField({ required: true, nullable: true, label: "UTOPIA.Talents.Tier.label", hint: "UTOPIA.Talents.Tier.hint" }),
      uuid: new foundry.data.fields.DocumentUUIDField({ required: true, nullable: true, label: "UTOPIA.Talents.UUID.label", hint: "UTOPIA.Talents.UUID.hint" }),
    }
    super(fields, options, context);
  }
}