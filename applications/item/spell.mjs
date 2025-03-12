import { SpellcraftSheet } from "../specialty/spellcraft.mjs";

const { api, sheets } = foundry.applications;

export class SpellSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spell-sheet"],
    position: {
      width: 500,
      height: 600,
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
      template: "systems/utopia/templates/item/special/spell.hbs",
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
        label: 'UTOPIA.Item.Tabs.',
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
  }

  static async _edit(event, target) {
    let spellcraft = await new SpellcraftSheet().render(true);
    spellcraft.addSpell(this.item);
  }
  
  static async _save(event, target) {
    super.submit();
  }
}
