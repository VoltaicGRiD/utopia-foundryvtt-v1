import { DragDropActorV2 } from "../base/drag-drop-enabled-actorv2.mjs";

export class Character extends DragDropActorV2 {
  static PARTS = {
    header: {
      template: "systems/utopia/templates/actor/header.hbs",
      scrollable: ['.actor-header']
    },
    tabs: {
      template: "systems/utopia/templates/tabs.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/actor/attributes.hbs",
    },
    spellbook: {
      template: "systems/utopia/templates/actor/spellbook.hbs",
    },
    background: {
      template: "systems/utopia/templates/actor/background.hbs",
    },
    effects: {
      template: "systems/utopia/templates/effects.hbs",
    }
  }

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(DragDropActorV2.DEFAULT_OPTIONS, {
    classes: ["utopia", "actor-sheet", "character"],
    actions: {

    },
    position: {
      height: 800,
      width: 1000
    },
  });

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "spellbook", "background", "effects"];
  }

  _prepareSubmitData(event, form, formData) {
    const data = super._prepareSubmitData(event, form, formData);
    return data;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.tabs = super._getTabs(options.parts);
    context.position = options.position;
      
    console.log(context);

    return context;
  }  
}