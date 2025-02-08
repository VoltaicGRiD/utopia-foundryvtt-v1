const { api, sheets } = foundry.applications;
import { prepareActiveEffectCategories } from "../../../helpers/_module.mjs";

export class UtopiaTrinketSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.openDetails = [];
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "gear-sheet"],
    position: {
      width: 800,
      height: 700,
    },
    actions: {
      image: this._image,
      addItem: this._addItem,
      deleteStrike: this._deleteStrike,
      deleteResource: this._deleteResource,
      deleteAction: this._deleteAction,
    },
    form: {
      submitOnChange: false,

    },
    window: {
      title: "UTOPIA.SheetLabels.trinket",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/gear/header.hbs",
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    attributes: {
      template: "systems/utopia/templates/item/gear/trinket.hbs",
      scrollable: ['.gear-attributes']
    },
    description: {
      template: "systems/utopia/templates/item/generic/description.hbs",
      scrollable: ['']
    },
    effects: {
      template: "systems/utopia/templates/item/generic/effects.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    
    options.parts = ["header", "tabs", "attributes", "description", "effects"];
  }

  async _prepareContext(options) {
    const roll = new Roll(this.item.system.formula);
    const terms = roll.terms;
    console.log(terms);

    var context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      gm: game.user.isGM,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      // Add tabs
      tabs: this._getTabs(options.parts),
      // Add features to context
      features: this.item.system.features,
    };

    console.log(context);

    return context;
  }

/** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
        context.tab = context.tabs[partId];
        context.enrichedfFlavor = await TextEditor.enrichHTML(
          this.item.system.flavor,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );
        break;
      case 'description': 
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );

        context.enrichedGMNotes = await TextEditor.enrichHTML(
          this.item.system.gmSecrets,
          {
            secrets: game.user.isGM,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );
      case 'effects': 
        context.tab = context.tabs[partId];
        context.effects = prepareActiveEffectCategories(this.item.effects, {
          temporary: true,
          passive: true,
          inactive: true,
          specialist: true,
          talent: true,
        });        
        break;
      default:
        break;
    }

    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'attributes';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: 'primary',
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Item.Gear.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
        case 'description':
        case 'effects':
          tab.id = partId;
          tab.label += partId;
          break;
        default:
      }
      
      if (this.tabGroups['primary'] === tab.id) tab.cssClass = 'active';

      tabs[partId] = tab;
      return tabs;
    }, {});
  }    

  _onRender(context, options) {
    this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
      details.querySelectorAll('select').forEach((select) => {
        select.addEventListener('change', async (event) => {
          this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
            if (details.attributes.open) {
              this.openDetails.push(index);
            }
          });

          await super.submit();

          this.render();
        });
      });
    });

    this.element.querySelectorAll('input[type="checkbox"]').forEach((select) => {
      select.addEventListener('change', async (event) => {
        this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
          if (details.attributes.open) {
            this.openDetails.push(index);
          }
        });

        await super.submit();

        this.render();
      });
    });


    this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
      if (this.openDetails.includes(index)) {
        details.setAttribute('open', '');
      }
    });
  }

  static async _image(event) {
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
  
  static async _addItem(event) {
    const type = this.element.querySelector('#addOptions').selectedOptions[0].value;
    console.log("Creating ", type);
    switch (type) {
      case 'strike':
        this._addStrike();
        break;
      case 'resource':
        this._addResource();
        break;
      case 'action':
        this._addAction();
        break;
    }
  }
  
  async _addStrike() {
    const strikes = this.item.system.strikes;
    const strike = {
      name: `${this.item.name} Strike ${strikes.length + 1}`,
    }
    strikes.push(strike);

    await this.item.update({
      [`system.strikes`]: strikes,
    });
  }

  static async _deleteStrike(event) {
    const index = event.target.dataset.index;

    const strikes = this.item.system.strikes;

    strikes.splice(index, 1);

    await this.item.update({
      [`system.strikes`]: strikes,
    });
  }

  async _addResource() {
    const resources = this.item.system.resources;
    const resource = {
      name: `New Resource ${resources.length + 1}`,
    }
    resources.push(resource);

    await this.item.update({
      [`system.resources`]: resources,
    });
  }

  static async _deleteResource(event) {
    const index = event.target.dataset.index;

    const resources = this.item.system.resources;

    resources.splice(index, 1);

    await this.item.update({
      [`system.resources`]: resources,
    });
  }

  async _addAction() {
    const actions = this.item.system.actions;
    const action = {
      name: `New Action ${actions.length + 1}`,
    }
    actions.push(action);

    await this.item.update({
      [`system.actions`]: actions,
    });
  }

  static async _deleteAction(event) {
    const index = event.target.dataset.index;

    const actions = this.item.system.actions;

    actions.splice(index, 1);

    await this.item.update({
      [`system.actions`]: actions,
    });
  }
}