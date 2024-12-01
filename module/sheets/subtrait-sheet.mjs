const { api, sheets } = foundry.applications;

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaSubtraitSheetV2 extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  classActor = {}; // The actor associated with this sheet
  keepOpen = false; // Determines if the sheet should remain open after actions

  constructor(options = {}) {
    super(options);
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
      template: `systems/utopia/templates/subtraits/subtrait-sheet.hbs`
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["sheet"];
  }

  async _prepareContext(options) {
    var context = {
      actor: this.classActor,
      traits: this.classActor.system.traits,
      subtraits: await this._handleSubtraits()
    };

    return context;
  }

  async _handleSubtraits() {
    const traits = this.classActor.system.traits;
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

    let trait = subtraits[subtrait].trait;
    await this.classActor.update({
      [`system.traits.${trait}.subtraits.${subtrait}.value`]: subtraits[subtrait].value + 1,
      [`system.points.subtrait`]: this.classActor.system.points.subtrait - 1
    })

    this.render();
  }
}

/**
 * Updates the talent selection UI after a talent is added.
 * @param {string} talent - The name of the talent to update.
 */
async function updateTalents(talent) {
  // Add the new talent to the list if it's not already included
  if (!talents.includes(talent)) {
    talents.push(talent);
  }

  // Get all polygon elements representing talents
  let polys = document.getElementsByClassName('cls-1');
    
  // Iterate through each polygon element
  for (let item of polys) {
    // Get the name attribute of the polygon
    let name = item.getAttribute("data-name");
    // If the talent is in the list of talents, mark it as taken
    if (talents.includes(name)) {
      if (!item.classList.contains('taken')) {
        item.classList.add('taken');
      }
    }
  }
}

/**
 * Handles the selection of a talent by the user.
 * Checks prerequisites and updates the actor's talents accordingly.
 */
async function select() {
  addTalentToActor(actor, selected);
  updateTalents(selected);
}