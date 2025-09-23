import { buildTraitData } from "../../helpers/actorTraits.mjs";

const { api, sheets } = foundry.applications;

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaSubtraitSheetV2 extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {
  actor = {}; // The actor associated with this sheet
  keepOpen = false; // Determines if the sheet should remain open after actions

  constructor(options = {}) {
    super(options);
    this.dockedTo = undefined;
    this.dockedSide = undefined;
    this.isDocked = true;
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "subtrait-sheet"],
    position: {
      width: 300,
    },
    actions: {
      addPoint: this._addPoint,
      addGift: this._addGift,
      swapDock: this._swapDock,
      dock: this._dock,
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
      template: `systems/utopia/templates/actor/subtraits.hbs`
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["sheet"];
  }

  async _prepareContext(options) {
    var context = {
      actor: this.document,
      traits: this.document.system.traits,
      subtraits: buildTraitData(this.document),

      canDock: game.settings.get('utopia', 'dockedWindowPosition') !== 2 && this.dockedTo,
      docked: this.isDocked,
    };

    console.log(context);

    return context;
  }

  static async _dock() {
    this.isDocked = !this.isDocked;

    if (this.isDocked) {
      switch (this.dockedSide) {
        case 0: // left
          this.setPosition({
            left: this.dockedTo.position.left - this.position.width,
            top: this.dockedTo.position.top
          });
          break;
        case 1: // right
          this.setPosition({
            left: this.dockedTo.position.left + this.dockedTo.position.width,
            top: this.dockedTo.position.top
          });
          break;
        default: 
          break;
      }
    }

    this.render();
  }

  static async _swapDock() {
    if (this.dockedSide == 0) 
    {
      this.dockedTo.dockedLeft.pop(this);
      this.dockedTo.dockedRight.push(this);
      this.dockedSide = 1;
    }
    else 
    {
      this.dockedTo.dockedRight.pop(this);
      this.dockedTo.dockedLeft.push(this);
      this.dockedSide = 0;
    }s
    
    if (this.isDocked) {
      switch (this.dockedSide) {
        case 0: // left
          this.setPosition({
            left: this.dockedTo.position.left - this.position.width,
            top: this.dockedTo.position.top
          });
          break;
        case 1: // right
          this.setPosition({
            left: this.dockedTo.position.left + this.dockedTo.position.width,
            top: this.dockedTo.position.top
          });
          break;
        default: 
          break;
      }
    }

    this.render();
  }

  _onRender(context, options) {
    super._onRender(context, options);
  }

  static async _addPoint(event, target) {
    let subtrait = target.dataset.trait;
    let subtraits = await buildTraitData(this.document);

    console.log(subtrait, subtraits);

    if (this.document.system.points.subtrait.total <= 0) {
      return ui.notifications.error("You do not have enough points to spend on subtraits.");
    }

    if (subtraits[subtrait].value < subtraits[subtrait].max) {
      const trait = subtraits[subtrait].trait;
      await this.document.update({
        [`system.traits.${trait.short}.subtraits.${subtrait}.value`]: subtraits[subtrait].value + 1,
      })

      this.render();
    }
    else {
      return ui.notifications.error("You have already maxed out this subtrait.");
    }
  }

  static async _addGift(event, target) {
    let subtrait = target.dataset.trait;
    let subtraits = await buildTraitData(this.document);

    console.log(subtrait, subtraits);

    if (this.document.system.points.gifted.value < 1) {
      return ui.notifications.error("You do not have enough points to spend on subtrait gifts.");
    }

    if (subtraits[subtrait].gifted) {
      return ui.notifications.error("You have already gifted this subtrait.");
    }

    let trait = subtraits[subtrait].trait;
    await this.document.update({
      [`system.traits.${trait}.subtraits.${subtrait}.gifted`]: true,
      [`system.points.gifted.value`]: this.document.system.points.gifted.value - 1
    })

    this.render();
  }
}