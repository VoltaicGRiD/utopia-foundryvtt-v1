import { DragDropItemV2 } from "../base/drag-drop-enabled-itemv2.mjs"

export class Species extends DragDropItemV2 {
  static MODES = {
    PLAY: 0,
    EDIT: 1,
  }

  _mode = this.constructor.MODES.PLAY;

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/header.hbs",
      scrollable: ['.item-header']
    },
    tabs: {
      template: "systems/utopia/templates/tabs.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/attributes.hbs",
    },
    paperdoll: {
      template: "systems/utopia/templates/item/special/paperdoll.hbs",
    },
    talenttree: {
      template: "systems/utopia/templates/item/special/talent-tree.hbs",
    },
    description: {
      template: "systems/utopia/templates/item/description.hbs",
    },
    effects: {
      template: "systems/utopia/templates/effects.hbs",
    }
  }

  static DEFAULT_OPTIONS = mergeObject(DragDropItemV2.DEFAULT_OPTIONS, {
    actions: {
      toggleMode: this._toggleMode,

    },
    position: {
      width: 1200,
      height: 700,
    }
  });

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "paperdoll", "talenttree", "description", "effects"];
  }

  async _prepareContext(options) {
    const context = super._prepareContext(options);

    context.tabs = this._getTabs(options.parts);
    context.position = options.position;
    context.isPlay = this._mode === this.constructor.MODES.PLAY,
      
    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
      case 'talenttree':
        context.tab = context.tabs[partId];
        break;
      case 'paperdoll':
        context.tab = context.tabs[partId];
        context.paperdoll = this.item.system.getPaperDoll();
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
      case 'effects': 
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
        label: 'UTOPIA.Item.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          tab.icon = 'fas fa-fw fa-book';
          break;
        case 'paperdoll': 
          tab.id = 'paperdoll';
          tab.label += 'paperdoll';
          tab.icon = 'fas fa-fw fa-person';
          break
        case 'description': 
          tab.id = 'description';
          tab.label += 'description';
          tab.icon = 'fas fa-fw fa-align-left';
          break;
        case 'talenttree':
          tab.id = 'talenttree';
          tab.label += 'talenttree';
          tab.icon = 'fas fa-fw fa-tree';
          break
        case 'effects':
          tab.id = 'effects';
          tab.label += 'effects';
          tab.icon = 'fas fa-fw fa-bolt';
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  
      tabs[partId] = tab;
      return tabs;
    }, {});
  }
}