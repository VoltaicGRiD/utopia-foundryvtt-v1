const { api, sheets } = foundry.applications;
import gatherTalents from '../helpers/gatherTalents.mjs';
import Tagify from '../../lib/tagify/tagify.esm.js';

export class UtopiaSpellSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spell-sheet"],
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
      title: "UTOPIA.SheetLabels.spell",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/spells/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/spells/attributes.hbs",
    },
    description: {
      template: "systems/utopia/templates/spells/description.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "description"];
  }

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
    
    this.element.querySelector('.profile-img').addEventListener('click', this._image.bind(this));
    // this._fixTalentSelect(context);
    // this._fixArtSelect(context);
  }

  async _fixArtSelect(context) {
    let options = [
      "Array",
      "Alteration",
      "Divination",
      "Enchantment",
      "Evocation",
      "Illusion",
      "Necromancy",
      "Wake",
    ]

    const artSelect = document.querySelector('[name="system.arts"]');
    const currentArts = context.system.arts;
    artSelect.value = currentArts;
    console.log("Current arts: ", currentArts);
    const tagify = new Tagify(artSelect, {
      whitelist: options, 
      enforceWhitelist: true, 
      dropdown: {
          enabled: 0, 
          maxItems: Infinity, 
      },
    }).on('add', (e) => {
      if (currentArts.length == 1) {
        if (currentArts[0].length == 0) {
          currentArts.pop();
        }
      }

      currentArts.push(e.detail.data.value);
      // Event listener for when a new talent is added.
      this.document.update({
        ['system.arts']: currentArts,
      });
    }).on('remove', (e) => {
      currentArts.splice(currentArts.indexOf(e.detail.data.value), 1);
      this.document.update({
        ['system.arts']: currentArts,
      });
    });
  }

  async _fixTalentSelect(context) { 
    let talents = await gatherTalents();
    let talentChoices = talents.map((talent) => {
        return {
            value: talent.name,
            id: talent.id
        }
    });

    // Sort the talent choices, prioritizing those that include "Artistry" in their name.
    talentChoices.sort((a, b) => {
        const aIncludesArtistry = a.value.includes("Artistry");
        const bIncludesArtistry = b.value.includes("Artistry");

        if (aIncludesArtistry && !bIncludesArtistry) {
            return -1; // a comes before b
        } else if (!aIncludesArtistry && bIncludesArtistry) {
            return 1; // b comes before a
        } else {
            return 0; // no change in order
        }
    });

    // Select the HTML element for talents.
    const talentSelect = document.querySelector('[name="system.talents"]');
    const currentTalents = context.system.talents;
    const talentValue = talentChoices.filter((talent) => {
        return currentTalents.includes(talent.id);
    });

    // Set the value of the talent select element to the filtered talent choices.
    talentSelect.value = JSON.stringify(talentValue);

    // Initialize Tagify on the talent select element with specific options.
    const tagify = new Tagify(talentSelect, {
        whitelist: talentChoices, // Only allow talents from the talentChoices array.
        enforceWhitelist: true, // Enforce that only items from the whitelist can be added.
        dropdown: {
            enabled: 0, // Show the dropdown as soon as the input is focused.
            maxItems: Infinity, // Do not limit the dropdown to a specific number of items.
        },
    }).on('add', (e) => {
      if (currentTalents.length == 1) {
        if (currentTalents[0].length == 0) {
          currentTalents.pop();
        }
      }

      currentTalents.push(e.detail.data.id);
      // Event listener for when a new talent is added.
      this.document.update({
        ['system.talents']: currentTalents,
      });
    });  
  }

  async _image(event) {
    event.preventDefault();
    let file = await new FilePicker({
      type: "image",
      current: this.document.img,
      callback: (path) => {
        this.document.update({
          img: path,
        });
      },
    }).browse();
  }
}
