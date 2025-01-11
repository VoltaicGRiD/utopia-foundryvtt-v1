const {api} = foundry.applications;
import Twitch from "../../extensions/twitch.mjs";

export default class UtopiaTwitchIntegrationSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "twitch-integration-sheet"],
    position: {
      width: 600,
      height: 800,
    },
    actions: {
      image: this._image,
      saveAndCast: this._saveAndCast,
      save: this._save,
      cast: this._cast,
    },
    window: {
      title: "UTOPIA.SheetLabels.twitchIntegration",
    },
  };

  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    settings: {
      template: "systems/utopia/templates/other/twitch-integration/settings.hbs",
    },
    // chat: {
    //   template: "systems/utopia/templates/other/twitch-integration/chat.hbs",
    // },
    commands: {
      template: "systems/utopia/templates/other/twitch-integration/commands.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["tabs", "settings", "commands"];
  } 
  
  async _prepareContext(options) {
    const context = {}
    context.tabs = this._getTabs(options.parts);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    switch (partId) {
      case "settings":
        context.tab = context.tabs[partId];
        const settings = Twitch.SETTINGS.map((setting) => {
          const type = setting.secret ? "secret" : setting.type === Boolean ? "checkbox" : "text";

          return {
            key: setting.name,
            name: game.i18n.localize(`UTOPIA.Settings.Twitch.${setting.name}`),
            hint: game.i18n.localize(`UTOPIA.Settings.Twitch.${setting.hint}`),
            value: game.settings.get("utopia", `twitch.${setting.name}`),
            type: type,
          };
        });
        context.settings = settings;
        break;
      case "commands":
        context.tab = context.tabs[partId];
        context.commands = {
          enableSpellcrafting: game.settings.get("utopia", "twitch.enableSpellcrafting"),
          enableArtifice: game.settings.get("utopia", "twitch.enableArtifice"),
          enableTargeting: game.settings.get("utopia", "twitch.enableTargeting"),
        };
        break;
    }

    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
  
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'settings';
  
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
        case 'tabs':
          return tabs;
        case 'settings':
          tab.id = 'settings';
          tab.label += 'settings';
          break;
        case 'commands':
          tab.id = 'commands';
          tab.label += 'commands';
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

    const element = this.element;
    const inputs = element.querySelectorAll("input");
    for (const input of inputs) {
      input.addEventListener("change", this._onInputChange.bind(this));
    }
  }

  async _onInputChange(event) {
    console.log(event);

    const input = event.target;
    const setting = input.dataset.setting;
    const value = input.type === "checkbox" ? input.checked : input.value;
    game.settings.set("utopia", `twitch.${setting}`, value);
  }
}