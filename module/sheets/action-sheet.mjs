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
      width: 500,
      height: "auto",
    },
    actions: {
      image: this._image,
      update: this._update,
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
      template: "systems/utopia/templates/action/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/action/attributes.hbs",
    },
    description: {
      template: "systems/utopia/templates/action/description.hbs",
    },
    rules: {
      template: "systems/utopia/templates/action/rules.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "description", "rules"];
  }

  async _prepareContext(options) {
    var context = {
      item: this.document,
      system: this.document.system,
    };

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

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

  _onRender(context, options) {
    let elements = this.element.querySelectorAll('[data-action="update"]')
    elements.forEach(e => {e.addEventListener('change', this._update.bind(this))});
    this.element.querySelector('[data-action="image"]').addEventListener('click', this._image.bind(this));
  }

  async _update(event) {
    event.preventDefault();
    let value = event.target.value;
    let target = event.target.name;
    
    console.log(target, value);

    this.document.update({
      [target]: event.target.value,
    })
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
