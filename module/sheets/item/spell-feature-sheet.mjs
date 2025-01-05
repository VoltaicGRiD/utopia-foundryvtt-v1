
const { api, sheets } = foundry.applications;
import Tagify from '../../../lib/tagify/tagify.esm.js';

export class UtopiaSpellFeatureSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spell-feature-sheet"],
    position: {
      width: 600,
      height: "auto",
    },
    actions: {
      image: this._image,
      newVariable: this._newVariable,
      removeVariable: this._removeVariable,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.spellFeature",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/spell-feature/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/spell-feature/attributes.hbs",
    },
    variables: {
      template: "systems/utopia/templates/item/spell-feature/variables.hbs",
      scrollable: ['']
    },
    description: {
      template: "systems/utopia/templates/item/spell-feature/description.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "variables", "description"];
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

    const keys = Object.keys(this.document.system.variables);
    if (keys.length > 0) {
      context.variables = this.document.system.variables;
    }

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
        context.tab = context.tabs[partId];
        break;
      case 'variables':
        context.tab = context.tabs[partId];
        break;
      case 'description':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item
          }
        );
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
        label: 'UTOPIA.Item.SpellFeatures.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          break;
        case 'variables':
          tab.id = 'variables';
          tab.label += 'variables';
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

  _onRender(context, options) {
    console.log(this);
    if (this.lastFocus) {
      this.lastFocus.DOM.input.setAttribute("autofocus", "true");
      this.lastFocus.DOM.input.focus();
    }

    const art = this.element.querySelector("select[name='system.art']");
    art.addEventListener("change", (event) => {
      // Update 'system.img' based on the selected art
      let img = event.target.value;
      let prefix = "systems/utopia/assets/icons/artistries/";
      let suffix = ".svg";
      let newImg = prefix + img + suffix;
      this.document.update({
        img: newImg,
        ['system.art']: img,
      });
      this.render();
    });

    const doesTarget = this.element.querySelector("select[name='system.doesTarget']");
    doesTarget.addEventListener("change", (event) => {
      console.log(event);
      let doesTarget = event.target.value;
      this.document.update({
        ['system.doesTarget']: doesTarget,
      });
      this.render();
    });

    const optionsInput = this.element.querySelectorAll(".variable-options");
    if (optionsInput) {
      const length = optionsInput.length;
      optionsInput.forEach(async (option) => {
        this._fixOptions(option, context);
      });
    }

    const inputs = this.element.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", (event) => {
        event.target.select();
      });
    });
  }

  async _fixOptions(option, context) {
    const variableKey = option.dataset.key; 
    console.log(this.document.system.variables[variableKey].options);
    const options = this.document.system.variables[variableKey].options;
    option.value = options;
    
    const tagify = new Tagify(option, {
      originalInputValueFormat: valuesArr => valuesArr.map(item => item.value)
    }).on("add", (e) => {
      let current = this.document.system.variables[variableKey].options;
      if (typeof current === "string") {
        current = current.split(",");
      } else if (typeof current === "undefined") {
        current = [];
      }
      if (current.some(c => c === '' || c.length === 0)) {
        current.splice(current.indexOf(''), 1);
      }
      current.push(e.detail.data.value);
      this.document.update({
        [`system.variables.${variableKey}.options`]: current,
      });
    }).on("remove", (e) => {
      const option = e.detail.data.value;
      const index = options.indexOf(option);
      options.splice(index, 1);
      this.document.update({
        [`system.variables.${variableKey}.options`]: options,
      });
    });
  }

  static async _newVariable(event) {
    const variables = this.document.system.variables;
    const length = Object.keys(variables).length;
    const newKey = `variable${length}`;
    const data = {
      character: "A",
      kind: "none",
      description: "",
      dice: "",
      options: [],
      minimum: 0,
      maximum: 0,
    };
    
    await this.document.update({
      [`system.variables.${newKey}`]: data,
    })    

    console.log(this, data, newKey);
    this.render();
  }

  static async _removeVariable(event) {
    let id = event.target.dataset.variable;
    let data = this.document.system.variables;

    console.log(this, id, data);
    
    await this.document.update({
      [`system.variables.-=${id}`]: null,
    });
    this.render();
  }
}