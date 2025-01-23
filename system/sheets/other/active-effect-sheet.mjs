const { api, sheets } = foundry.applications;

export default class UtopiaActiveEffectSheet extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "talent-sheet"],
    position: {
      width: 500,
      height: "auto",
    },
    actions: {
      add: this._addEffectChange,
      delete: this._onEffectControl,
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
      template: "systems/utopia/templates/effect/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    details: {
      template: "systems/utopia/templates/effect/details.hbs",
    },
    effects: {
      template: "systems/utopia/templates/effect/effects.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "details", "effects"];
  }

  async _prepareContext(options) {
    let context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      data: this.document,
      config: CONFIG.UTOPIA,
      transfer: this.document.transfer,
      description: this.document.description,
      tabs: this._getTabs(options.parts),
      effect: this.document,
      isActorEffect: this.document.parent.documentName === 'Actor',
      isItemEffect: this.document.parent.documentName === 'Item',
      submitText: "UTOPIA.Effect.submit",
      modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
        obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`);
        return obj;
      }, {})
    };

    context.statuses = CONFIG.statusEffects.map(s => {
      return {
        id: s.id,
        label: game.i18n.localize(s.name ?? /** @deprecated since v12 */ s.label),
        selected: context.data.statuses.has(s.id) ? "selected" : ""
      };
    });

    context.types = {
      temporary: {
        id: 'temporary',
        label: game.i18n.localize("EFFECT.Temporary"),
      },
      passive: {
        id: 'passive',
        label: game.i18n.localize("EFFECT.Passive"),
      },
      inactive: {
        id: 'inactive',
        label: game.i18n.localize("EFFECT.Inactive"),
      },
      specialist: {
        id: 'specialist',
        label: game.i18n.localize("EFFECT.Specialist"),
        selected: context.data.type === 'specialist' ? "selected" : ""
      },
      talent: {
        id: 'talent',
        label: game.i18n.localize("EFFECT.Talent"),
        selected: context.data.type === 'talent' ? "selected" : ""
      },
      gear: {
        id: 'gear',
        label: game.i18n.localize("EFFECT.Gear"),
        selected: context.data.type === 'gear' ? "selected" : ""
      }
    }

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
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.document.description,
          {
            secrets: this.document.isOwner,
            //rollData: this.document.parent.documentName === 'Actor' ?? this.document.target.getRollData() | {},
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
        case 'header':
        case 'tabs':
          return tabs;
        case 'details':
          tab.id = 'details';
          tab.label += 'details';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.label += 'effects';
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
    if (options.typeLocked) {
      this.element.querySelector("select[name='type']").disabled = true;
    }
  }

  /**
   * Handle adding a new change to the changes array.
   * @private
   */
  static async _addEffectChange() {
    const idx = this.document.changes.length;
    return this.submit({preventClose: true, updateData: {
      [`changes.${idx}`]: {key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: ""}
    }});
  }

  /**
   * Provide centralized handling of mouse clicks on control buttons.
   * Delegate responsibility out to action-specific handlers depending on the button action.
   * @param {MouseEvent} event      The originating click event
   * @private
   */
  static async _onEffectControl(event) {
    event.preventDefault();
    const button = event.currentTarget;
    switch ( button.dataset.action ) {
      case "add":
        return this._addEffectChange();
      case "delete":
        button.closest(".effect-change").remove();
        return this.submit({preventClose: true}).then(() => this.render());
    }
  }
}