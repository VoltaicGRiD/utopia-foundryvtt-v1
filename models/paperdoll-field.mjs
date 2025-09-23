export class PaperDollField extends foundry.data.fields.SchemaField {
  constructor({ slot, augmentable, equippable, specialty, equipped, augment, ...fields }, options, context) {
    fields = {
      augmentable: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: augmentable, label: "UTOPIA.PaperDoll.Augmentable.label", hint: "UTOPIA.PaperDoll.Augmentable.hint" }),
      equippable: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: equippable, label: "UTOPIA.PaperDoll.Equippable.label", hint: "UTOPIA.PaperDoll.Equippable.hint" }),
      specialty: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: specialty, label: "UTOPIA.PaperDoll.Specialty.label", hint: "UTOPIA.PaperDoll.Specialty.hint" }),
      equipped: new foundry.data.fields.DocumentUUIDField({ required: false, nullable: true, label: "UTOPIA.PaperDoll.Equipped.label", hint: "UTOPIA.PaperDoll.Equipped.hint" }),
      augment: new foundry.data.fields.DocumentUUIDField({ required: false, nullable: true, label: "UTOPIA.PaperDoll.Augment.label", hint: "UTOPIA.PaperDoll.Augment.hint" }),
    };

    super(fields, options, context);
  }
}