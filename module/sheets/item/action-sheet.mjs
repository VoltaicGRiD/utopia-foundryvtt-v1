const { api, sheets } = foundry.applications;

export class UtopiaActionSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "action-sheet"],
    position: {
      width: 700,
      height: "auto",
    },
    actions: {
      image: this._image,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.action",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/action/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/action/attributes.hbs",
    },
    description: {
      template: "systems/utopia/templates/item/action/description.hbs",
    },
    rules: {
      template: "systems/utopia/templates/item/action/rules.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "description", "rules"];
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
      case 'rules':
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
        case 'rules':
          tab.id = 'rules';
          tab.label += 'rules';
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
    super._onRender(context, options);

    this.element.querySelector('.profile-img').addEventListener('click', this._image.bind(this));

    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/json");
    this.editor = editor;

    this.element.querySelector('.add-rule').addEventListener('click', this._addRule.bind(this));  
  }

  async _addRule(event) {
    event.preventDefault();
    let name = this.element.querySelector('input[name="rule-name"]').value;
    let content = this.editor.getValue();
    let rule = {
      name: name,
      content: content
    };

    let rules = this.document.system.rules;
    rules[name] = rule;

    this.document.update({
      ['system.rules']: rules,
    });

    this.editor.setValue('');
    this.render();
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
