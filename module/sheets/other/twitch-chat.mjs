const {api} = foundry.applications;
import Twitch from "../../extensions/twitch.mjs";

export default class UtopiaTwitchChatSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "twitch-chat-sheet"],
    position: {
      width: 400,
      height: 1000,
    },
    window: {
      title: "UTOPIA.SheetLabels.twitch-chat",
    },
  };

  static PARTS = {
    chat: {
      template: "systems/utopia/templates/other/twitch-integration/chat.hbs",
      scrollable: ['']
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
  } 
  
  async _prepareContext(options) {
    const context = {
      channel: game.settings.get("utopia", "twitch.channel"),
      parent: game.data.addresses.remote,
      height: this.position.height,
      width: this.position.width
    }

    return context;
  }

  async _onRender(context, options) {
    super._onRender(context, options);
  }
}