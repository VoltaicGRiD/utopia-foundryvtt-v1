const { api, sheets } = foundry.applications;

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaSubtraitSheetV2 extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  actor = {}; // The actor associated with this sheet
  keepOpen = false; // Determines if the sheet should remain open after actions

  constructor(options = {}) {
    super(options);
    this.dockedTo = undefined;
    this.isDocked = true;
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "subtrait-sheet"],
    position: {
      width: 800,
      height: "auto",
    },
    actions: {
      addPoint: this._addPoint,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.subtrait",
    },
  };

  static PARTS = {
    sheet: {
      template: `systems/utopia/templates/other/subtrait-sheet.hbs`
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["sheet"];
  }

  async _prepareContext(options) {
    var context = {
      actor: this.actor,
      traits: this.actor.system.traits,
      subtraits: await this._handleSubtraits()
    };

    return context;
  }

  async _handleSubtraits() {
    const traits = this.actor.system.traits;
    let subtraits = {};
    
    let traitKeys = Object.keys(traits);
    for (let trait of traitKeys) {
      let subtraitKeys = Object.keys(traits[trait].subtraits);
      for (let subtrait of subtraitKeys) {
        subtraits = foundry.utils.mergeObject(subtraits, {
          [subtrait]: {
            trait: trait,
            mod: traits[trait].subtraits[subtrait].mod,
            value: traits[trait].subtraits[subtrait].value
          }
        });
      }
    }

    return subtraits;
  }

  _onRender(context, options) {
    super._onRender(context, options);
  }

  static async _addPoint(event, target) {
    let subtrait = target.dataset.trait;
    let subtraits = await this._handleSubtraits();

    console.log(subtrait, subtraits);

    if (this.actor.system.points.subtrait < 1) {
      return ui.notifications.error("You do not have enough points to spend on subtraits.");
    }

    let trait = subtraits[subtrait].trait;
    await this.actor.update({
      [`system.traits.${trait}.subtraits.${subtrait}.value`]: subtraits[subtrait].value + 1,
      [`system.points.subtrait`]: this.actor.system.points.subtrait - 1
    })

    this.render();
  }
}