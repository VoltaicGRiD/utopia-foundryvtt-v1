import { UtopiaSpellcraftSheet } from "../other/spellcraft-sheet.mjs";

const { api, sheets } = foundry.applications;

export class UtopiaSpellSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spell-sheet"],
    position: {
      width: 600,
      height: "auto",
    },
    actions: {
      image: this._image,
      cast: this._cast,
      edit: this._edit,
      save: this._save,
    },
    form: {
      submitOnChange: true,
    },
    tag: "form",
    window: {
      title: "UTOPIA.SheetLabels.spell",
    },
  };

  static PARTS = {
    details: {
      template: "systems/utopia/templates/item/spell/details.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["details"];
  }

  async _prepareContext(options) {
    var context = {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      system: this.item.system,
      config: CONFIG.UTOPIA,
      tabs: this._getTabs(options.parts),
      name: this.item.name,
    };

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
        context.tab = context.tabs[partId];
        break;
      default:
    }
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
  
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'details';
  
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Item.Actions.Tabs.',
      };
  
      switch (partId) {
        case 'details':
          tab.id = 'details';
          tab.label += 'details';
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  async _onRender(context, options) {
    super._onRender(context, options);

    const numVariables = this.element.querySelectorAll("input[type='number']");
    numVariables.forEach(v => {
      v.addEventListener("change", (event) => {
        const featureId = event.target.dataset.feature;
        const variableId = event.target.dataset.variable;
        const value = event.target.value;

        this.item.update({
          [`system.features.${featureId}.system.variables.${variableId}.value`]: value
        });
      });
    });

    const optVariables = this.element.querySelectorAll(".feature-variable-options");
    // optVariables.forEach(v => {
    //   v.addEventListener("click", async (event) => {
    //     const featureId = event.target.dataset.feature;
    //     const variableId = event.target.dataset.variable;
    //     const selected = this.item.system.features;
    //     let options = selected[featureId].system.variables[variableId].options;
    //     if (typeof options === "string") {
    //       options = options.split(",");
    //     };

    //     let content = await renderTemplate('systems/utopia/templates/other/spellcraft/tooltip.hbs', { 
    //       name: selected[featureId].system.variables[variableId].name,
    //       description: selected[featureId].system.variables[variableId].description,
    //       options: options,
    //       selected: selected[featureId].value
    //     });
    //     console.log("tooltip render:", options, content);
    //     let element = document.createElement('div');
    //     element.innerHTML = content;
    //     element.classList.add("spellcraft-options-sheet");
    //     game.tooltip.activate(event.target, { direction: 'UP', cssClass: "utopia spellcraft-options-sheet", content: element });
    //     tooltip.style.bottom = tooltip.style.bottom - 10 + "px";
    //     tooltip.style.lineHeight = "0.5em";
    //     tooltip.querySelectorAll("button").forEach(o => {
    //       o.addEventListener("click", async (tooltipEvent) => {
    //         if (!tooltipEvent.target.classList.contains("active")) {
    //           tooltipEvent.target.classList.add("active");
    //           tooltipEvent.target.closest("div").querySelectorAll("button").forEach(b => {
    //             if (b !== tooltipEvent.target) {
    //               b.classList.remove("active");
    //             }
    //           });
    //           // Get closest list
    //           const feature = selected[featureId];
    //           const variable = feature.system.variables[variableId];
    //           variable.value = tooltipEvent.target.innerHTML;
    //           console.log(feature);
    //           this.render();
    //         }
    //       });
    //     });
    //   });
    // });
  }

  static async _edit(event, target) {
    let spellcraft = await new UtopiaSpellcraftSheet().render(true);
    spellcraft.addSpell(this.item);
  }
}
