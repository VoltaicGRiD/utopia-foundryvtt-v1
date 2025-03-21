const { game } = globalThis;

import { FeatureBuilder } from "../applications/specialty/feature-builder.mjs";
import { SpellcraftSheet } from "../applications/specialty/spellcraft.mjs";
import { TalentBrowser } from "../applications/specialty/talent-browser.mjs";
import { UtopiaActor } from "../documents/actor.mjs";
import { UtopiaChatMessage } from "../documents/chat-message.mjs";
import { UtopiaItem } from "../documents/item.mjs";
import { registerConfig } from "./config.mjs";
import * as init from "./init/_init.mjs";

globalThis.utopia = {
  documents: {

  },
  applications: {
    talentBrowser: TalentBrowser,
    featureBuilder: FeatureBuilder,
    spellcraft: SpellcraftSheet
  },
  utilities: {

  }
}

Hooks.once("init", function () {
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