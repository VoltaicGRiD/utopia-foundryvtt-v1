const { api, sheets } = foundry.applications;
import { gatherTalents } from '../../helpers/gatherTalents.mjs';
import Tagify from '../../../lib/tagify/tagify.esm.js';

export class UtopiaSpeciesSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "species-sheet"],
    position: {
      width: 700,
      height: "auto",
    },
    actions: {
      image: this._image,
      //update: this._update,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    tag: "form",
    window: {
      title: "UTOPIA.SheetLabels.species",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/species/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/species/attributes.hbs",
    },
    description: {
      template: "systems/utopia/templates/item/species/description.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "description"];
  };

  async _prepareContext(options) {
    var context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
    };

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
      case 'description':
        context.tab = context.tabs[partId];
        break;
      default:
    }
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
  
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'attributes';
  
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Actions.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          break;
        case 'description':
          tab.id = 'description';
          tab.label += 'description';
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
    
    this._fixSubtraits(context);
  }

  async _fixSubtraits(context) {
    const options = [
      "Speed",
      "Dexterity",
      "Power",
      "Fortitude",
      "Engineering",
      "Memory",
      "Resolve",
      "Awareness",
      "Portrayal",
      "Stunt",
      "Appeal",
      "Language",
      "[Any 2 Subtraits]",
    ]

    const currentSubtraits = context.system.subtraits;  
    const subtraitsInput = this.element.querySelector('input[name="system.subtraits"]');
    subtraitsInput.value = currentSubtraits;

    const tagify = new Tagify(subtraitsInput, {
      whitelist: options,
      enforceWhitelist: true,
      dropdown: {
        enabled: 0,
        maxItems: Infinity,
      },
      originalInputValueFormat: valuesArr => valuesArr.map(item => item.value)
    }).on('add', (e) => {
      console.log(e);

      if (currentSubtraits.length == 1) {
        if (currentSubtraits[0].length == 0) {
          currentSubtraits.pop();
        }
      }

      console.log(currentSubtraits);

      currentSubtraits.push(e.detail.data.value);

      console.log(currentSubtraits);
      // Event listener for when a new talent is added.
      this.document.update({
        ['system.subtraits']: currentSubtraits,
      });

      subtraitsInput.focus();
    }).on('remove', (e) => {
      currentSubtraits.splice(currentSubtraits.indexOf(e.detail.data.value), 1);
      this.document.update({
        ['system.subtraits']: currentSubtraits,
      });

      subtraitsInput.focus();
    });
  }  
}