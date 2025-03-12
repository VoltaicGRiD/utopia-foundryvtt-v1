const { game } = globalThis;

import { UtopiaActor } from "../documents/actor.mjs";
import { UtopiaChatMessage } from "../documents/chat-message.mjs";
import { UtopiaItem } from "../documents/item.mjs";
import { registerConfig } from "./config.mjs";
import * as init from "./init/_init.mjs";

Hooks.once("init", function () {
  game.utopia = {
    documents: {

    },
    applications: {

    },
    utilities: {

    }
  }

  CONFIG.UTOPIA = {};
  registerConfig();
  init.registerHooks();
  init.registerGameSettings();
  init.registerHandlebarsSettings();
  init.registerMeasuredTemplates();
  init.registerItemDataModels();
  init.registerActorDataModels();
  init.registerItemSheets();
  init.registerActorSheets();

  CONFIG.Combat.initiative = {
    formula: `3d6 + @turnOrder`,
    decimals: 2,
  };

  CONFIG.Actor.documentClass = UtopiaActor;
  CONFIG.Item.documentClass = UtopiaItem;
  CONFIG.ChatMessage.documentClass = UtopiaChatMessage;

  return init.preloadHandlebarsTemplates();
});

init.createDocMacro;
init.rollItemMacro;