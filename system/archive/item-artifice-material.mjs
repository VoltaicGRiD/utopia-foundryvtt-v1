import UtopiaItemBase from "../data/base-item.mjs";

export default class UtopiaArtificeMaterial extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.description = new fields.StringField({ blank: true });
    
    schema.quality = new fields.StringField({ required: true, nullable: false, initial: "crude", choices: {
      "crude": "UTOPIA.Item.Artifice.Components.Quality.crude",
      "common": "UTOPIA.Item.Artifice.Components.Quality.common",
      "extraordinary": "UTOPIA.Item.Artifice.Components.Quality.extraordinary",
      "rare": "UTOPIA.Item.Artifice.Components.Quality.rare",
      "legendary": "UTOPIA.Item.Artifice.Components.Quality.legendary",
      "mythical": "UTOPIA.Item.Artifice.Components.Quality.mythical",
    }});

    schema.type = new fields.StringField({ required: true, nullable: false, initial: "material", choices: {
      "material": "UTOPIA.Item.Artifice.Components.Types.material",
      "refinement": "UTOPIA.Item.Artifice.Components.Types.refinement",
      "power": "UTOPIA.Item.Artifice.Components.Types.power",
    }});

    schema.quantity = new fields.NumberField({ required: true, nullable: false, initial: 0 });

    return schema;
  }

  prepareDerivedData() {

  }
}