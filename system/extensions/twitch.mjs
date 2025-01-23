import { UtopiaChatMessage } from "../documents/chat-message.mjs";

export default class UtopiaTwitchIntegration {
  EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws';

  constructor() {
    this.websocketSessionID = "";
    this.customBadges = {};
    this.globalBadges = {};
  }

  static SETTINGS = [
    {
      name: "channel",
      hint: "channelHint",
      scope: "client",
      config: false,
      type: String,
      default: "",
    },
    {
      name: "channelId",
      hint: "channelIdHint",
      scope: "client",
      config: false,
      type: String,
      default: "",
      secret: true
    },
    {
      name: "clientId",
      hint: "clientIdHint",
      scope: "client",
      config: false,
      type: String,
      default: "",
      secret: true,
    },
    {
      name: "userId",
      hint: "userIdHint",
      scope: "client",
      config: false,
      type: String,
      default: "",
      secret: true,
    },
    {
      name: "oauthToken",
      hint: "oauthTokenHint",
      scope: "client",
      config: false,
      type: String,
      default: "",
      secret: true,
    },
    {
      name: "viewerNames",
      hint: "viewerNamesHint",
      scope: "client",
      config: false,
      type: Boolean,
      default: true,
    },
    {
      name: "viewerBadges",
      hint: "viewerBadgesHint",
      scope: "client",
      config: false,
      type: Boolean,
      default: true,
    },
    {
      name: "chatName",
      hint: "chatNameHint",
      scope: "client",
      config: false,
      type: String,
      default: "Viewer",
    },
    {
      name: "enableSpellcrafting",
      hint: "enableSpellcraftingHint",
      scope: "client",
      config: false,
      type: Boolean,
      default: true,
    },
    {
      name: "enableArtifice",
      hint: "enableArtificeHint",
      scope: "client",
      config: false,
      type: Boolean,
      default: true,
    },
    {
      name: "enableTargeting",
      hint: "enableTargetingHint",
      scope: "client",
      config: false,
      type: Boolean,
      default: true,
    },
  ];

  static registerSettings() {
    const prefix = "UTOPIA.Settings.Twitch.";
    for (const setting of this.SETTINGS) {
      game.settings.register("utopia", `twitch.${setting.name}`, {
        name: `${prefix}${setting.name}`,
        hint: `${prefix}${setting.hint}`,
        scope: setting.scope,
        config: setting.config,
        type: setting.type,
        default: setting.default,
      });
    }
  }

  static clientOptions = {
    options: {
      debug: true
    }, 
    connection: {
      reconnect: true,
      secure: true
    }
  }

  async initialize() {
    // First we check to see if our OAuth token exists, and if its valid
    const oauthToken = game.settings.get("utopia", "twitch.oauthToken");
    const username = game.settings.get("utopia", "twitch.channel") ?? undefined;
    const clientId = game.settings.get("utopia", "twitch.clientId") ?? undefined;
    const userId = game.settings.get("utopia", "twitch.userId") ?? undefined;
    if (!clientId || !userId || !oauthToken) {
      // If we don't have a token, we need to authorize the user
      console.log("Foundry: No Twitch OAuth token found. Authorizing user...");
      await this.authorize();
    } else {
      // If we do have a token, we can start up our chat client
      console.log("Foundry: Twitch OAuth token found. Starting chat client...");
      await this.handleChatClient();
    }    
  }

  async handleChatClient() {
    // Get the userId for the channel in settings
    const channel = game.settings.get("utopia", "twitch.channel");
    const clientId = game.settings.get("utopia", "twitch.clientId");
    
    const response = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + game.settings.get("utopia", "twitch.oauthToken"),
        'Client-Id': game.settings.get("utopia", "twitch.clientId"),
        'Content-Type': 'application/json'
      },
    });

    if (response.status == 401) {
      console.error("Failed to get user ID for channel. OAuth token is invalid.");
      // Reauthorize the user
      await this.authorize();
      return;
    } else if (response.status != 200) {
      const data = await response.json();
      console.error("Failed to get user ID for channel. API call returned status code " + response.status);
      console.error(data);
      return;
    } else {
      const data = await response.json();
      console.log(data);
      game.settings.set("utopia", "twitch.channelId", data.data[0].id);
    }

    // Now we setup our chat bot
    const chat_client = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    chat_client.addEventListener('open', () => {
      console.log("Foundry: Connected to Twitch Chat WebSocket");
    });

    chat_client.addEventListener('message', (event) => {
      console.log(event);
      const data = JSON.parse(event.data);

      switch (data.metadata.message_type) {
        case "session_welcome": 
          this.websocketSessionID = data.payload.session.id;
          this.registerEventSubListeners(game.settings.get("utopia", "twitch.userId"), game.settings.get("utopia", "twitch.channelId"));
          break;
        case "notification":
          switch (data.metadata.subscription_type) {
            case 'channel.chat.message':
              this.processChatMessage(data);
              break;
            case 'channel.channel_points_custom_reward_redemption.add':
              this.processChannelPointsRedemption(data);
              break;
            case 'channel.ad_break.begin':
              this.processAdBreak(data);
              break;              
          }
          break;
      }
    });
  }

  async processBadges(badges) {
    const processedBadges = [];

    console.log(badges, this.customBadges, this.globalBadges);
  
    for (const badge of badges) {
      const id = badge.set_id;
      var version = [];
      if (!this.customBadges[id] && !this.globalBadges[id]) {
        version = this.customBadges[id].versions.filter(v => v.id === badge.id || v.id === badge.id[0]);
      }
      if (version.length === 0 && this.globalBadges[id]) {
        version = this.globalBadges[id].versions.filter(v => v.id === badge.id || v.id === badge.id[0]);
      }
      if (version.length > 0)
        processedBadges.push(...version);
    }

    return processedBadges;
  }

  async processChatMessage(data) {
    const template = 'systems/utopia/templates/chat/twitch-chat-message.hbs';
    var cheer = 0;
    var messageText = data.payload.event.message.text;
    if (data.payload.event.cheer)
      cheer = data.payload.event.cheer.bits ?? 0;
    if (cheer > 0) {
      messageText = messageText.replace(/cheer[0-9]+/i, '');
      const chatter = data.payload.event.chatter_user_name;
      messageText = `${chatter} cheered ${cheer} Bits!<br/>${messageText}`;
    }
    const badges = await this.processBadges(data.payload.event.badges);
    console.log(badges);
    const templateData = {
      actor: game.user.character ?? undefined,
      channelName: data.payload.event.broadcaster_user_login,
      showBadges: game.settings.get("utopia", "twitch.viewerBadges"),
      chatBadges: badges,
      chatter: data.payload.event.chatter_user_name,
      message: messageText,
      color: data.payload.event.color,
      cheer: cheer,
      chatName: game.settings.get("utopia", "twitch.chatName"),
      viewerNames: game.settings.get("utopia", "twitch.viewerNames"),
    }
    const html = await renderTemplate(template, templateData);

    const message = await UtopiaChatMessage.create({
      content: html,
    });
  }

  async registerEventSubListeners(user_id, channel_id) {
    console.log("Foundry: Registering EventSub listeners");
    console.log(this.websocketSessionID,  user_id);

    const standardData = {
      headers: {
        'Authorization': 'Bearer ' + game.settings.get("utopia", "twitch.oauthToken"),
        'Client-Id': game.settings.get("utopia", "twitch.clientId"),
        'Content-Type': 'application/json'
      },
    }
    const standardBody = {
      version: '1',
      condition: {
        broadcaster_user_id: channel_id,
        user_id: user_id
      },
      transport: {
        method: 'websocket',
        session_id: this.websocketSessionID
      }
    }

    // Register channel.chat.message
    var response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      ...standardData,
      body: JSON.stringify({
        type: 'channel.chat.message',
        ...standardBody
      })
    });

    if (response.status != 202) {
      const data = await response.json();
      console.error("Failed to subscribe to channel.chat.message. API call returned status code " + response.status);
      console.error(data);
    } else {
      const data = await response.json();
      console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
    }

    // Register channel.channel_points_custom_reward_redemption.add
    response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      ...standardData,
      body: JSON.stringify({
        type: 'channel.channel_points_custom_reward_redemption.add',
        ...standardBody
      })
    });

    if (response.status != 202) {
      const data = await response.json();
      console.error("Failed to subscribe to channel.channel_points_custom_reward_redemption.add. API call returned status code " + response.status);
      console.error(data);
    } else {
      const data = await response.json();
      console.log(`Subscribed to channel.channel_points_custom_reward_redemption.add [${data.data[0].id}]`);
    }

    // Register channel.ad_break.begin
    response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      ...standardData,
      body: JSON.stringify({
        type: 'channel.ad_break.begin',
        ...standardBody
      })
    });

    if (response.status != 202) {
      const data = await response.json();
      console.error("Failed to subscribe to channel.ad_break.begin. API call returned status code " + response.status);
      console.error(data);
    } else {
      const data = await response.json();
      console.log(`Subscribed to channel.ad_break.begin [${data.data[0].id}]`);
    }

    // Get channel badges
    response = await fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channel_id}`, {
      method: 'GET',
      ...standardData,
    })

    if (response.status != 200) {
      const data = await response.json();
      console.error("Failed to get channel badges. API call returned status code " + response.status);
      console.error(data);
    } else {
      const data = await response.json();
      console.log("Foundry: Got channel badges", data);
      for (const badge of data.data) {
        this.globalBadges[badge.set_id] = badge;
      }
    }

    // Get global chat badges
    response = await fetch(`https://api.twitch.tv/helix/chat/badges/global`, {
      method: 'GET',
      ...standardData,
    })

    if (response.status != 200) {
      const data = await response.json();
      console.error("Failed to get global badges. API call returned status code " + response.status);
      console.error(data);
    } else {
      const data = await response.json();
      console.log("Foundry: Got global badges", data);
      for (const badge of data.data) {
        this.globalBadges[badge.set_id] = badge;
      }
    }
  }

  async authorize() {
    // Replace localhost with the address/port of your Python WS server
    const ws = new WebSocket("ws://localhost:8765");
    
    ws.addEventListener('open', () => {
      console.log("Foundry: WebSocket connected to Python server.");
      // If you want, send a hello message
      ws.send(JSON.stringify({ msg: "Hello from Foundry client" }));
    });
    
    ws.addEventListener('message', (event) => {
      // This is triggered when Python broadcasts OAuth tokens or other data
      const data = JSON.parse(event.data);
      console.log("Foundry: Received data from Python:", data);

      if (data.access_token) {
        // e.g., store it in memory or Foundry settings
        console.log("Foundry: We have a Twitch access token!");
        // Do something with the token (e.g., call Helix API from the browser, or store for later).
        game.settings.set("utopia", "twitch.oauthToken", data.access_token);
        game.settings.set("utopia", "twitch.userId", data.user_data[0].id);
        // Close the WebSocket connection
        ws.close();
        // Start the chat client
        this.handleChatClient();
      }
    });

    // Open a popup window to the Twitch OAuth URL
    const clientId = game.settings.get("utopia", "twitch.clientId");
    const redirectUri = "http://localhost:5000/callback";
    const claims = JSON.stringify({
      "id_token": {
        "email": null,
        "email_verified": null,
        "preferred_username": null,
      },
    })
    // https://id.twitch.tv/oauth2/authorize
    // client_id=your_client_id
    // 
    const url = `
https://id.twitch.tv/oauth2/authorize?response_type=code
&claims=${claims}
&client_id=${clientId}
&redirect_uri=${redirectUri}
&scope=
openid%20
bits:read%20
channel:read:ads%20
channel:read:goals%20
channel:manage:polls%20
channel:manage:predictions%20
channel:manage:redemptions%20
channel:read:subscriptions%20
channel:read:vips%20
moderator:read:chatters%20
user:read:chat%20
user:read:email%20
chat:read
`;

    console.log(url);

    window.open(url, "Twitch OAuth", "width=600,height=600");
  }

  // constructor() {
  //   this.client = null;
  //   console.log(TmiClient);
  // }

  // async connect() {
  //   console.log(TmiClient);
  //   const channel = game.settings.get("utopia", "twitch.channel");
  //   if (!this.client) {
  //     this.client = new TmiClient({...this.clientOptions, channels: [channel]});
  //   }
  //   this.client.connect();
  //   this.client.on('message', (channel, tags, message, self) => {
  //     if (self) return;
  //     console.log(`${tags['display-name']}: ${message}`);
  //   });
  // }
}