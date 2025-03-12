
import Tagify from '../../lib/tagify/tagify.esm.js';
import { DragDropItemV2 } from '../base/drag-drop-enabled-itemv2.mjs';

export class SpellFeatureSheet extends DragDropItemV2 {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(DragDropItemV2.DEFAULT_OPTIONS, {
    actions: {
      newVariable: this._newVariable,
      removeVariable: this._removeVariable,
    },
  });

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/header.hbs",
    },
    tabs: {
      template: "systems/utopia/templates/tabs.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/attributes.hbs",
    },
    variables: {
      template: "systems/utopia/templates/item/special/variables.hbs",
      scrollable: ['']
    },
    description: {
      template: "systems/utopia/templates/item/description.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "variables", "description"];
  }

  async _prepareContext(options) {
    const context = super._prepareContext(options);

    context.tabs = this._getTabs(options.parts);
    context.position = options.position;
      
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
        label: 'UTOPIA.Item.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          tab.icon = 'fas fa-atom';
          break;
        case 'variables':
          tab.id = 'variables';
          tab.label += 'variables';
          tab.icon = 'fas fa-flask-vial';
          break;
        case 'description':
          tab.id = 'description';
          tab.label += 'description';
          tab.icon = "fas fa-align-left";
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _onRender(options, context) {
    super._onRender(options, context);

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