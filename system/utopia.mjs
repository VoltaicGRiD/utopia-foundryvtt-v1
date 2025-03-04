const { api } = foundry.applications;

// Import document classes.
import { UtopiaActor } from "./documents/actor.mjs";
import { UtopiaItem } from "./documents/item.mjs";
import { UtopiaChatMessage } from "./documents/chat-message.mjs";

// Import sheet classes.
import { UtopiaActorSheetV2 } from "./sheets/actor/actor-sheet-appv2.mjs";
import {
  UtopiaGeneralItemSheet,
  UtopiaSpeciesSheet,
  
  UtopiaSpellSheet,
  UtopiaSpellFeatureSheet,
  
  UtopiaActionSheet,

  UtopiaTalentSheet,
  UtopiaSpecialistTalentSheet,
    
  UtopiaArmorSheet,
  UtopiaArtifactSheet,
  UtopiaConsumableSheet,
  UtopiaTrinketSheet,
  UtopiaWeaponSheet,

  UtopiaGearFeatureSheet
} from "./sheets/item/_module.mjs";
import { UtopiaTalentTreeSheet } from "./sheets/utility/talent-tree-sheet.mjs";
import { UtopiaTalentTreeFullscreenSheet } from "./sheets/utility/talent-tree-fullscreen.mjs";
import { UtopiaSpellcraftSheet } from "./sheets/utility/spellcraft-sheet.mjs";
import { UtopiaCompendiumBrowser } from "./sheets/utility/compendium-browser.mjs";
import { UtopiaFeatureBuilder } from "./sheets/utility/feature-builder.mjs";

// Import utility classes.
import {
  isNumeric,
  searchTraits,
  shortToLong,
  longToShort,
  utopiaTraits,
  traitShortNames,
  traitLongNames,
  calculateTraitFavor,
  addTalentToActor,
  gatherTalents,
  rangeTest,
  preloadHandlebarsTemplates,
} from "./helpers/_module.mjs";

// Import models.
import * as models from "./data/_module.mjs";
import UtopiaTokenHUD from "./hud/token-hud.mjs";
import UtopiaDie from "./other/die.mjs";
import UtopiaToken from "./hud/token.mjs";
import UtopiaTokenDocument from "./hud/token-document.mjs";
import UtopiaTwitchIntegrationSheet from "./sheets/extensions/twitch-integration.mjs";
import Twitch from "./extensions/twitch.mjs";
import { UtopiaCharacterCreator } from "./sheets/utility/character-creator.mjs";

//#region Init Hook (Definitions and Initial Function Callouts)
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downline developers
globalThis.utopia = {
  documents: {
    UtopiaActor,
    UtopiaItem,
    UtopiaChatMessage,
  },
  applications: {
    UtopiaWeaponSheet,
    UtopiaActorSheetV2,
    UtopiaSpeciesSheet,
    UtopiaTalentSheet,
    UtopiaSpecialistTalentSheet,
    UtopiaSpellFeatureSheet,
    UtopiaSpellcraftSheet,
    UtopiaTalentTreeSheet,
    UtopiaTalentTreeFullscreenSheet,
  },
  utils: {
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateTraitFavor,
    traitShortNames,
    traitLongNames,
  },
  models,
};

Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.utopia = {
    UtopiaSpellcraftSheet,
    UtopiaTalentTreeSheet,
    UtopiaTalentTreeFullscreenSheet,
    UtopiaGeneralItemSheet,
    UtopiaChatMessage,
    UtopiaActor,
    UtopiaItem,
    UtopiaFeatureBuilder,
    UtopiaCharacterCreator,
    utopiaTraits,
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateTraitFavor,
    traitShortNames,
    traitLongNames,
  };

  // This is how we configure initiative in the system, it has to be done in the init hook.
  CONFIG.Combat.initiative = {
    formula: `3d6 + @turnOrder`,
    decimals: 2,
  };

  CONFIG.sounds.notification = "systems/utopia/assets/sounds/notification.wav";
  
  CONFIG.Dice.functions = {
    specialist: (a) => {
      return a > 0;
    },
    talent: (a) => {
      return a > 0;
    },
    gt: (a, b) => { 
      return a > b;
    },
    lt: (a, b) => {
      return a < b;
    },
    gte: (a, b) => {
      return a >= b;
    },
    lte: (a, b) => {
      return a <= b;
    },
    eq: (a, b) => {
      return a == b;
    }
  }

  const TEMPLATE_PRESETS = {
    CONE: 'cone',
    LINE: 'line',
    SBT: 'sbt',
    MBT: 'mbt',
    LBT: 'lbt',
  };

  CONFIG.UTOPIA = {};

  CONFIG.UTOPIA.measuredTemplatePresets = [
    {
      data: { t: CONST.MEASURED_TEMPLATE_TYPES.CONE, distance: 9 },
      button: {
        name: TEMPLATE_PRESETS.CONE,
        title: 'UTOPIA.Templates.Cone.Long',
        icon: 'fa-solid fa-location-pin fa-rotate-90',
        visible: true,
        button: true,
        onClick: () => {
          UTOPIAMeasuredTemplate.fromPreset(TEMPLATE_PRESETS.CONE);
        },
      },
    },
    {
      data: {
        t: foundry.CONST.MEASURED_TEMPLATE_TYPES.RAY,
        distance: 12,
        width: 1,
      },
      button: {
        name: TEMPLATE_PRESETS.LINE,
        title: 'UTOPIA.Templates.LINE.Long',
        icon: 'fa-solid fa-rectangle-wide',
        visible: true,
        button: true,
        onClick: () => {
          UTOPIAMeasuredTemplate.fromPreset(TEMPLATE_PRESETS.LINE);
        },
      },
    },
    {
      data: { t: CONST.MEASURED_TEMPLATE_TYPES.CIRCLE, distance: 1 },
      button: {
        name: TEMPLATE_PRESETS.SBT,
        title: 'UTOPIA.Templates.Small.Long',
        icon: 'fa-solid fa-circle-1 fa-2xs',
        visible: true,
        button: true,
        onClick: () => {
          UTOPIAMeasuredTemplate.fromPreset(TEMPLATE_PRESETS.SBT);
        },
      },
    },
    {
      data: { t: CONST.MEASURED_TEMPLATE_TYPES.CIRCLE, distance: 2 },
      button: {
        name: TEMPLATE_PRESETS.MBT,
        title: 'UTOPIA.Templates.Medium.Long',
        icon: 'fa-solid fa-circle-2 fa-sm',
        visible: true,
        button: true,
        onClick: () => {
          UTOPIAMeasuredTemplate.fromPreset(TEMPLATE_PRESETS.MBT);
        },
      },
    },
    {
      data: { t: CONST.MEASURED_TEMPLATE_TYPES.CIRCLE, distance: 3 },
      button: {
        name: TEMPLATE_PRESETS.LBT,
        title: 'UTOPIA.Templates.Large.Long',
        icon: 'fa-solid fa-circle-3 fa-lg',
        visible: true,
        button: true,
        onClick: () => {
          UTOPIAMeasuredTemplate.fromPreset(TEMPLATE_PRESETS.LBT);
        },
      },
    },
  ],

  CONFIG.UTOPIA.activeMeasuredTemplatePreview = null,


    // Setting up schema handling for the system.
  // This is supposed to replace the default 'Template.json' file.
  // It's a bit more flexible and allows for more complex data structures and validation.
  CONFIG.Item.dataModels = {
    action: models.UtopiaAction,

    talent: models.UtopiaTalent,
    specialistTalent: models.UtopiaSpecialistTalent,

    species: models.UtopiaSpecies,

    spell: models.UtopiaSpell,
    spellFeature: models.UtopiaSpellFeature,
    
    general: models.UtopiaGeneralItem,

    gear: models.UtopiaGear,
    armor: models.UtopiaArmor,
    artifact: models.UtopiaArtifact,
    consumable: models.UtopiaConsumable,
    trinket: models.UtopiaTrinket,
    weapon: models.UtopiaWeapon,

    weaponFeature: models.WeaponFeatureOptions,
    armorFeature: models.ArmorFeatureOptions,
    consumableFeature: models.ConsumableFeatureOptions,
    artifactFeature: models.ArtifactFeatureOptions,
    shieldFeature: models.ShieldFeatureOptions,

    gearFeature: models.UtopiaGearFeature,
  };

  // Allow modules to build onto the Item data models.
  Hooks.callAll("utopiaItemDataModels", CONFIG.Item.dataModels);

  CONFIG.Actor.dataModels = {
    character: models.UtopiaCharacter,
    npc: models.UtopiaNPC,
  }

  // Allow modules to build onto the Actor data models.
  Hooks.callAll("utopiaActorDataModels", CONFIG.Actor.dataModels);

  // Store our custom document classes for Actors and Items.
  // We can register our custom [UtopiaChatMessage] class here too, since they are qualified as "Documents".
  CONFIG.Actor.documentClass = UtopiaActor;
  CONFIG.Item.documentClass = UtopiaItem;
  CONFIG.ChatMessage.documentClass = UtopiaChatMessage;
  CONFIG.Token.objectClass = UtopiaToken;
  CONFIG.Token.documentClass = UtopiaTokenDocument;
  CONFIG.Token.hudClass = UtopiaTokenHUD;
  CONFIG.Dice.terms.d = UtopiaDie;
  CONFIG.Dice.termTypes.DiceTerm = UtopiaDie;
  CONFIG.Dice.types.filter(d => d instanceof Die).forEach(d => d = UtopiaDie);

  // Active Effects are never copied to the Actor,  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register all of our status effects, sheets, and game settings
  registerActorSheets();
  registerItemSheets();
  registerStatusEffects();
  registerGameSettings();
  registerGameKeybindings();
  registerSocketHandling();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});
//#endregion

//#region Sheet Registration
/* -------------------------------------------- */
/*  Sheet Registration                          */
/* -------------------------------------------- */
/* -------------------------------------------- */
/*  Actor Sheets                                */
/* -------------------------------------------- */

function registerActorSheets() {
  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("utopia", UtopiaActorSheetV2, {
    makeDefault: true,
    types: ["character", "npc"],
    label: "UTOPIA.SheetLabels.actorV2",
  });
  Actors.registerSheet("utopia", UtopiaCharacterCreator, {
    makeDefault: false,
    types: ["character"],
    label: "UTOPIA.SheetLabels.characterCreator",
  })

  // Allow modules to build onto the Actor sheets.
  Hooks.callAll("utopiaActorSheets", Actors);
}

/* -------------------------------------------- */
/*  Item Sheets                                 */
/* -------------------------------------------- */

function registerItemSheets() {
  Items.unregisterSheet("core", ItemSheet);

  Items.registerSheet("utopia", UtopiaGeneralItemSheet, {
    makeDefault: true,
    types: ["general"],
    label: "UTOPIA.SheetLabels.generalItem",
  });
  Items.registerSheet("utopia", UtopiaSpeciesSheet, {
    makeDefault: true,
    types: ["species"],
    label: "UTOPIA.SheetLabels.species",
  });
  
  Items.registerSheet("utopia", UtopiaActionSheet, {
    makeDefault: true,
    types: ["action"],
    label: "UTOPIA.SheetLabels.action",
  });

  Items.registerSheet("utopia", UtopiaTalentSheet, {
    makeDefault: true,
    types: ["talent"],
    label: "UTOPIA.SheetLabels.talent",
  });
  Items.registerSheet("utopia", UtopiaSpecialistTalentSheet, {
    makeDefault: true,
    types: ["specialistTalent"],
    label: "UTOPIA.SheetLabels.specialistTalent",
  });

  Items.registerSheet("utopia", UtopiaSpellSheet, {
    makeDefault: true,
    types: ["spell"],
    label: "UTOPIA.SheetLabels.spell",
  });
  Items.registerSheet("utopia", UtopiaSpellFeatureSheet, {
    makeDefault: true,
    types: ["spellFeature"],
    label: "UTOPIA.SheetLabels.spellComponent",
  });

  Items.registerSheet("utopia", UtopiaArmorSheet, {
    makeDefault: true,
    types: ["armor"],
    label: "UTOPIA.SheetLabels.armor",
  });
  Items.registerSheet("utopia", UtopiaArtifactSheet, {
    makeDefault: true,
    types: ["artifact"],
    label: "UTOPIA.SheetLabels.artifact",
  });
  Items.registerSheet("utopia", UtopiaConsumableSheet, {
    makeDefault: true,
    types: ["consumable"],
    label: "UTOPIA.SheetLabels.consumable",
  });
  Items.registerSheet("utopia", UtopiaTrinketSheet, {
    makeDefault: true,
    types: ["trinket"],
    label: "UTOPIA.SheetLabels.trinket",
  });
  Items.registerSheet("utopia", UtopiaWeaponSheet, {
    makeDefault: true,
    types: ["weapon"],
    label: "UTOPIA.SheetLabels.weapon",
  });
  Items.registerSheet("utopia", UtopiaGearFeatureSheet, {
    makeDefault: true,
    types: ["gearFeature"],
    label: "UTOPIA.SheetLabels.gearFeature",
  })


  // Allow modules to build onto the Actor sheets.
  Hooks.callAll("utopiaItemSheets", Items);
}

/* -------------------------------------------- */
/*  ActiveEffect Sheet                          */
/* -------------------------------------------- */
function registerActiveEffectSheet() {
}

//#endregion

//#region Sockets
/* -------------------------------------------- */
/*  Socket Settings                             */
/* -------------------------------------------- */

function registerSocketHandling() {
  // Client handling
  game.socket.on("system.utopia", (data) => {    
    if (data.type === "ACTION") {
      if (data.payload === "AD_BREAK_PAUSE_SERVER") {
        ui.notifications.warn("Pausing the game for 30 seconds while an ad break runs on a Twitch integration line.");
      }
    }
  });

  // Server handling
  game.socket.on("system.utopia", (data, ack) => {
    if (data.type === "ACTION") {
      if (data.payload === "AD_BREAK_PAUSE") {
        const response = game.paused ? "ALREADY_PAUSED" : "PAUSING";
        ack(response);
    
        if (game.paused) return;
        
        console.log("Received ad break pause request from Twitch integration.");
        game.togglePause(true, true);
        setTimeout(() => {
          game.togglePause(false, true);
        }, 30000);
        
        console.log("Broadcasting ad break pause to clients.");
        game.socket.broadcast.emit("system.utopia", {
          type: "ACTION",
          payload: "AD_BREAK_PAUSE_SERVER"
        });
      }
    }    
  });
}
//#endregion

//#region Game Keybindings
/* -------------------------------------------- */
/*  System Settings                             */
/* -------------------------------------------- */

function registerGameKeybindings() {
  // Deal damage to selected Token
  game.keybindings.register("utopia", "dealDamage", {
    name: "UTOPIA.Keybindings.dealDamage",
    hint: "UTOPIA.Keybindings.dealDamageHint",
    editable: [{ key: "KeyD", modifiers: ["Control"] }, { key: "F3" }],
    onDown: () => {
      if (game.canvas.tokens.controlled.length > 0) {
        game.canvas.tokens.controlled.forEach(async (token) => {
          let actor = token.actor;
          let data = {
            defenses: actor.system.defenses,
            block: `${actor.system.block.quantity}d${actor.system.block.size}`,
            dodge: `${actor.system.dodge.quantity}d${actor.system.dodge.size}`,
          };
          let template = "systems/utopia/templates/dialogs/deal-damage.hbs";

          let html = await renderTemplate(template, data);

          let dialog = new api.DialogV2({
            window: {
              title: `${game.i18n.localize("UTOPIA.CommonTerms.dealDamage")} - ${
                actor.name
              }`,
            },
            classes: ["utopia", "utopia.commonterms"],
            content: html,
            buttons: [
              {
                default: true,
                action: "submit",
                icon: "fas fa-check",
                id: "submit-button",
                label: "UTOPIA.CommonTerms.submit",
                // Callback to retrieve the selected choice value from the form
                callback: (event, button, dialog) => {
                  return {
                    damage: button.form.elements.damage.value,
                    type: button.form.elements.type.value,
                  };
                },
              },
              {
                default: true,
                action: "submit",
                icon: "fas fa-check",
                id: "submit-button",
                label: "UTOPIA.CommonTerms.submit",
                // Callback to retrieve the selected choice value from the form
                callback: (event, button, dialog) => {
                  return {
                    damage: button.form.elements.damage.value,
                    type: button.form.elements.type.value,
                  };
                },
              },
            ],
            // Handle the submission of the dialog
            submit: (result) => {
              actor.applyDamage(
                { damage: result.damage, type: result.type, source: "GM" },
                true
              );
            },
          });
          await dialog.render(true);
        });
      } else {
        ui.notifications.warn("No token selected.");
      }
    },
    onUp: () => {},
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  });
}
//#endregion

//#region Game Settings and Status Effects
/* -------------------------------------------- */
/*  System Settings                             */
/* -------------------------------------------- */

function registerGameSettings() {
  // Register System settings in the game settings menu
  game.settings.register("utopia", "targetRequired", {
    name: "UTOPIA.Settings.targetRequired",
    hint: "UTOPIA.Settings.targetRequiredHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('utopia', 'highlightTemplate', {
    name: 'UTOPIA.Settings.highlightTemplate',
    hint: 'UTOPIA.Settings.highlightTemplateHint',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register("utopia", "autoRollAttacks", {
    name: "UTOPIA.Settings.autoRollAttacks",
    hint: "UTOPIA.Settings.autoRollAttacksHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("utopia", "autoRollContests", {
    name: "UTOPIA.Settings.autoRollContests",
    hint: "UTOPIA.Settings.autoRollContestsHint",
    scope: "world",
    config: true,
    type: Number,
    choices: {
      0: "UTOPIA.Settings.autoRollContestsNone",
      1: "UTOPIA.Settings.autoRollContestsPrompt",
      2: "UTOPIA.Settings.autoRollContestsAuto",
    },
    default: 1,
  });

  game.settings.register("utopia", "displayDamage", {
    name: "UTOPIA.Settings.displayDamage",
    hint: "UTOPIA.Settings.displayDamageHint",
    scope: "world",
    config: true,
    type: Number,
    requiresReload: true,
    choices: {
      0: "UTOPIA.Settings.displayDamageNone",
      1: "UTOPIA.Settings.displayDamageEstimate",
      2: "UTOPIA.Settings.displayDamageExact",
    },
    default: 1,
  });

  game.settings.register("utopia", "diceRedistribution", {
    name: "UTOPIA.Settings.diceRedistribution",
    hint: "UTOPIA.Settings.diceRedistributionHint",
    scope: "world",
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("utopia", "diceRedistributionSize", {
    name: "UTOPIA.Settings.autoMaxDice",
    hint: "UTOPIA.Settings.autoMaxDiceHint",
    scope: "user",
    config: game.settings.get("utopia", "diceRedistribution"),
    type: Number,
    choices: {
      0: "UTOPIA.Settings.diceRedistributionNone",
      1: "UTOPIA.Settings.diceRedistributionSmallest",
      2: "UTOPIA.Settings.diceRedistributionHighest",
    },
    default: true,
  });

  game.settings.register('utopia', 'displayActionsOnToken', {
    name: "UTOPIA.Settings.displayActionsOnToken",
    hint: "UTOPIA.Settings.displayActionsOnTokenHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('utopia', 'displayActionsOption', {
    name: "UTOPIA.Settings.displayActionsOption",
    hint: "UTOPIA.Settings.displayActionsOptionHint",
    scope: "world",
    config: game.settings.get("utopia", "displayActionsOnToken"),
    type: Number,
    choices: {
      0: "UTOPIA.Settings.displayActionsOptionCircle",
      1: "UTOPIA.Settings.displayActionsOptionVertical",
      2: "UTOPIA.Settings.displayActionsOptionHorizontal",
    },
    default: 0,
  });

  game.settings.register('utopia', 'enableTwitchIntegration', {
    name: "UTOPIA.Settings.enableTwitchIntegration",
    hint: "UTOPIA.Settings.enableTwitchIntegrationHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // game.settings.register('utopia', 'allowPlayerArchetypeEdit', {
  //   name: "UTOPIA.Settings.allowPlayerArchetypeEdit",
  //   hint: "UTOPIA.Settings.allowPlayerArchetypeEditHint",
  //   scope: "world",
  //   config: true,
  //   type: Boolean,
  //   default: false,
  // })
  
  game.settings.register('utopia', 'dockedWindowPosition', {
    name: "UTOPIA.Settings.dockedWindowPosition",
    hint: "UTOPIA.Settings.dockedWindowPositionHint",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    choices: {
      0: "UTOPIA.Settings.DockedWindowPosition.right",
      1: "UTOPIA.Settings.DockedWindowPosition.left",
      2: "UTOPIA.Settings.DockedWindowPosition.disabled",
    }
  })

  game.settings.register('utopia', 'restOnLevelUp', {
    name: "UTOPIA.Settings.restOnLevelUp",
    hint: "UTOPIA.Settings.restOnLevelUpHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  })

  game.settings.register('utopia', 'speciesCustomQuirks', {
    name: "UTOPIA.Settings.speciesCustomQuirks",
    hint: "UTOPIA.Settings.speciesCustomQuirksHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  })
}

/* -------------------------------------------- */
/*  Status Effects                              */
/* -------------------------------------------- */

async function registerStatusEffects() {
  // Define the status effects
  const statusEffects = [
    {
      id: "deafened",
      img: "icons/svg/sound-off.svg",
      label: "UTOPIA.StatusEffects.deafened",
    },
    {
      id: "blinded",
      img: "icons/svg/blind.svg",
      label: "UTOPIA.StatusEffects.blinded",
    },
    {
      id: "unconcious",
      img: "icons/svg/unconscious.svg",
      label: "UTOPIA.StatusEffects.unconscious",
    },
    {
      id: "paralysis",
      img: "icons/svg/paralysis.svg",
      label: "UTOPIA.StatusEffects.paralysis",
    },
    {
      id: "dazed",
      img: "icons/svg/stoned.svg",
      label: "UTOPIA.StatusEffects.dazed",
    },
    {
      id: "concentration",
      img: "icons/svg/padlock.svg",
      label: "UTOPIA.StatusEffects.concentration",
    },
    {
      id: "focus",
      img: "icons/svg/daze.svg",
      label: "UTOPIA.StatusEffects.focus",
    },
    {
      id: "fatigue",
      img: "icons/svg/degen.svg",
      label: "UTOPIA.StatusEffects.fatigue",
    }
  ];

  // Allow modules to build onto the status effects.
  Hooks.callAll("utopiaStatusEffects", statusEffects);

  CONFIG.statusEffects = statusEffects;  
}
//#endregion

//#region Handlebars Helpers
/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('contains', function(needle, haystack, options) {
  needle = Handlebars.escapeExpression(needle);
  haystack = Handlebars.escapeExpression(haystack);
  return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("for", function(n, block) {
  var accum = '';
  for(var i = 0; i < n; ++i)
      accum += block.fn(i);
  return accum;
});

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("select", function (value, options) {
  var $el = $("<select />").html(options.fn(this));
  $el.find('[value="' + value + '"]').attr({ selected: "selected" });
  return $el.html();
});

Handlebars.registerHelper("capitalize", function (value) {
  return value.capitalize();
})
//#endregion

//#region Special Item Handling
/* -------------------------------------------- */
/*  Actor - Item interaction                    */
/* -------------------------------------------- */

/**
 * Update actor data with necessary information from the item that
 * was dropped on the actor sheet.
 * @param {Object} actor
 * @param {Object} item
 */
export async function _handleSpeciesDrop(actor, item) {
  let grants = item.system.grants;

  try {
    if (grants.subtraits.indexOf(",") > -1) {
      let subtraits = grants.subtraits.split(",");

      subtraits.forEach((subtrait) => {
        let parsed = String(subtrait.trim());
        let trait = searchTraits(actor.system.traits, parsed);

        actor.update({
          [`system.traits.${trait}.subtraits.${parsed}.gifted`]: true,
        });
      });
    }
  } catch {
    let points = actor.system.points.gifted;

    if (isNumeric(grants.subtraits)) {
      points += parseInt(grants.subtraits);
    } else {
      points += grants.subtraits;
    }

    actor.update({
      system: {
        points: {
          gifted: points,
        },
      },
    });
  }

  actor.update({
    system: {
      species: item,
      block: grants["block"],
      dodge: grants["dodge"],
      attributes: {
        constitution: grants["constitution"],
        endurance: grants["endurance"],
        effervescence: grants["effervescence"],
      },
    },
  });
}
//#endregion

//#region Hooks
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    createDocMacro(data, slot);
    return false;
  });

  Hooks.on("targetToken", (user, token, targeted) => {
    if (ui.activeWindow.constructor.name === "UtopiaAttackSheet") {
      let window = ui.activeWindow;
      window.render();
    }
  });

  Hooks.on("combatTurnChange", (combat, from, to) => {
    if (game.user.isGM) {
      let token = game.canvas.tokens.placeables.find(t => t.id === to.tokenId);
      token.control();
    }

    combat.combatants.forEach(async (combatant) => {
      let actor = game.actors.get(combatant.actorId);
      // If the combatant is the current combatant, we have to restore
      // their Turn Actions
      if (to.combatantId === combatant._id) {
        await actor.update({
          ["system.actions.turn.value"]: actor.system.actions.turn.max,
          ["system.actions.interrupt.value"]: 0,
        });
      }
      // If the combatant is not the current combatant, we have to restore 
      // their Interrupt Actions
      else {
        await actor.update({
          ["system.actions.interrupt.value"]: actor.system.actions.interrupt.max,
          ["system.actions.turn.value"]: 0,
        });
      }

      if ([...actor.effects].length > 0) {
        await Promise.all([...actor.effects].forEach(async e => {
          if (e.isTemporary && e.duration.remaining === 0) {
            await e.update({
              disabled: true
            });
          }
        }));
      }
    }); 
  });

  Hooks.on("deleteCombat", (combat) => {
    combat.combatants.forEach((combatant) => {
      let actor = game.actors.get(combatant.actorId);
      actor.update({
        ["system.actions.turn.value"]: actor.system.actions.turn.max,
        ["system.actions.interrupt.value"]: actor.system.actions.interrupt.max,
      });
    });
  });

  Hooks.on("preUpdateActor", (actor, data, meta, userId) => {

  });

  Hooks.on("renderMacroConfig", async (app, html, data) => {

  });

  Hooks.on("preCreateActiveEffect", (effect, options, userId) => {
    const actor = effect.target;
    const condition = effect.statuses[0];

    // runTrigger("Condition", 
    //   { actor: actor, condition: condition }
    // );

    return true;
  });

  Hooks.on("preDeleteActiveEffect", (effect, options, userId) => {
    const actor = effect.target;
    const condition = effect.statuses[0];

    // if (condition === "focus") {
    //   runTrigger("FocusLost", actor, condition);
    // } else if (condition === "concentration") {
    //   runTrigger("ConcentrationLost", actor, condition);
    // } else {
    //   runTrigger("ConditionLost", actor, condition);
    // }

    return true;
  });

  //#endregion

  Hooks.on("createActiveEffect", (effect, options, userId) => {
    if (effect.statuses.has("blinded")) {
      let change = {
        key: "system.disfavors",
        mode: 2,
        priority: null,
        value: 'awa',
      };

      changes = effect.changes;
      changes.push([change, change]);
      effect.update({
        changes: changes
      })
    }

    return effect;
  });

  Hooks.on("updateActiveEffect", (effect, modified, options, userId) => {
    if (effect.isTemporary && modified.disabled !== undefined && game.combat) {
      effect.update({
        duration: {
          startRound: game.combat.current.round,
          startTurn: game.combat.current.turn,
        }
      });
    }
  })

  // Handle optional module integrations
  Hooks.on("diceSoNiceReady", (dice3d) => {
    registerDiceSoNice(dice3d);
  });
});

Hooks.on('renderSettings', (settings) =>  {
  /**
   * Creates a DOM element with optional attributes and child nodes.
   * @param {string} tagName - The HTML tag (e.g., "div", "button", "span").
   * @param {Object} [options] - Element configuration.
   * @param {Object} [options.attributes] - A set of attributes (e.g., { class: "my-class" }).
   * @param {(string|Node)[]} [options.children] - Array of text or DOM nodes to append.
   * @returns {HTMLElement} The newly created element.
   */
  function createHTMLElement(tagName, { attributes = {}, children = [] } = {}) {
    const el = document.createElement(tagName);

    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
      el.setAttribute(key, value);
    }

    // Append children (strings or DOM nodes)
    for (const child of children) {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child);
      }
    }

    return el;
  }

  const header = createHTMLElement("h2", { children: [game.system.title] });
  const utopiaSettings = createHTMLElement("div");
  settings.element[0].querySelector("#settings-game")?.after(header, utopiaSettings);

  const twitchSettings = document.createElement("button");
  const twitchIcon = document.createElement("i");
  twitchIcon.classList.add("fab", "fa-twitch");
  twitchSettings.type = "button";
  twitchSettings.append(twitchIcon, game.i18n.localize("UTOPIA.Settings.Buttons.twitch"));
  twitchSettings.addEventListener("click", async () => {
    await Twitch.registerSettings();

    // Render the Twitch Integration Settings app
    const sheet = new UtopiaTwitchIntegrationSheet();
    sheet.render(true);
  });

  const discordButton = document.createElement("button");
  const discordIcon = document.createElement("i");
  discordIcon.classList.add("fa-brands", "fa-discord");
  discordButton.type = "button";
  discordButton.append(discordIcon, game.i18n.localize("UTOPIA.Settings.Buttons.discord"));
  discordButton.addEventListener("click", () => {
    // Open the hyperlink to the Utopia Discord
    window.open("https://discord.gg/7kxJHtdGfZ", "_blank");
  });

  const vaultButton = document.createElement("button");
  const vaultIcon = document.createElement("i");
  vaultIcon.classList.add("fas", "fa-vault");
  vaultButton.type = "button";
  vaultButton.append(vaultIcon, "Ä̴̭̜̟͚̣̦̀͠c̷̡̪̺̖͙̯̣̗͒͌̚ͅe̴͚̺͙̾̔̈s̵̛̯͎̫̲̞̝̝̀͊̏͛̋̎̈́͠s̶͖̖̤͌͗ ̸̟̯͆̀͗̑̐͊͘͝͝t̷̙̰̘͝h̷̡̥͇͕͙͓̭̱͎͛̋̃̈́̈́̊̈́̚͠ë̷̡̨̪̦̟͔̦́̓͋̄ ̸̯͊̊́̍̎͘͜V̸̢̛̬̲͍͕̲͔̰͐̎̑͂͋̋̄͘̚ͅa̶̩͌̌̂̎̇ȕ̷̜̦͕̱̺̃̆͑̅̐̕͘l̷̨͚̥͔͉̰̻͇͗ͅt̸̙̺̙̅̅́̇̽̈́͌̚");
  vaultButton.addEventListener("click", () => {
    // Open the hyperlink to the Utopia Discord
    ui.notifications.error("A̸̜̱̳͛̇̿̔͒̾̈́́̄̽͝c̴̡̹̯̦̥̒̓͗̍̿̑̔̔̏̓̊̄̓̚c̴͕̘͕̝̣̲̥͛̔͂͒̊́͊͐͌̈̀̈́̔̚ę̸̧̼̺̤̫̠̤̹̩͊̈́͜͜s̸̟̦͉̤̱̖̻̓͛̾́s̶̘̰͘ ̶̛̝͕̌̽͊̆͋̃͋̿̑D̷̻͍̙̹̜̤͖̖͕̬̫͉͈̦̎́͛̇̀̃̋̌̈́̍͆̍̐͋͌͘ẽ̶̬͓̽̈͠͝n̶̢̢͙̲͉̙͇̞̜̓̓̎́͂̆͛̽̊i̷̙̲̥̭͇͖̬̿̊͛̀̉̏̒̃͒̐̉̈́̊͝ẻ̵̻̺̱͇͍̬̯̬̽̏̕͜͜ͅd̵̪̜͈̖͐̅̈͛̂̌̎̋͂̄̍͜͝ ̸̡̧̭̝̤͈̣̦̗̥͙̆͘͜-̴̧͈͚̯̠͇̰̲̙͉̜̤͔͇͇̂̄̎ͅͅ ̷̧͓̬̞̖̈̇̾͌̈̎͠͝͝͝ͅT̷̡̛͇̫̟͖̣͙̯̬͊͋̽͑͒̄̀̆̋̉̃̑̚͠h̷͓̦̦̪͙͇̲̦̜̘͙͇͇̜̙͆̅̏͛̈́̌́̾͘ͅḯ̴̧̥̟͖̼͚̗̪̫̣̲̫̗͙̜̎̀̒͂̌͜͝͝͝s̷̢̤̍̀́́ ̵̗̣̗̦̫̂͆̇͊͒̆͝t̵̠̘̱̰̲̗̟̜̯̤̳̣̠̬̍̂̇̀ḯ̸̪̻̹̫̞̘̚͠͝ḿ̶̡̛̛̥̖̞͚̮̩͙̰̘̥͉̯̪̑̇́̓͌͊͆͛̀̐͌̎͊͝ḛ̷̡̟̔̃̃̏͌͒͆̅̀͠͠l̷̢͚̅͌͒̀͑̍͐̾̾͆͋̆͝͝i̵̡̖̫͇͚̱̺̔̆͑̌͒͆ͅn̴̨̹̬̲͔̩͊̓̏̏̋́̈́̚e̷̢̢̡̞̼̦̯̤͈̣͙̯̹̩̖̭͆̓̑̐̈ ̸̛̻͚̒̂̉̃̊͐̈́͒̚̚͝͝i̷̛̤̥̬̰͎͉̹̪̗̲̜͇̦̱̩̞͈̎̈́̾̌̅͘s̵̡̛̳̞͚͆̑͋̔̋͒̈́̊͌̾̍̈̕͘̚͜͠ ̵̧̧̜̳͓̫͇̋́̇̕i̶̡͕̟̙̣̥̖̤̼̞̣͉͙̳̥̞͛͂́̎̓̒̒͗n̵̰̣̤̟̳̗̤͓̠͉̄͗͛͌̍̄̎̕v̶̺͓̤̻̺̬͇͒͜͝a̶̩̮̬̖̖̣͊̓͝͠l̸̨͇͋̌i̵̙̬͓̙̺͚̭̝̮̰̘̘̣̟̭̍͌̀̔͂̋͛̓̉͌͊̑d̵̡̫̣̤̜̮͇͖͉͉͛̂͑̆̉̕͝!̸̨̨̨̻̣̟̬̐̋́̏͊̌͛");
    setTimeout(() => {
      ui.notifications.error("A̸̜̱̳͛̇̿̔͒̾̈́́̄̽͝c̴̡̹̯̦̥̒̓͗̍̿̑̔̔̏̓̊̄̓̚c̴͕̘͕̝̣̲̥͛̔͂͒̊́͊͐͌̈̀̈́̔̚ę̸̧̼̺̤̫̠̤̹̩͊̈́͜͜s̸̟̦͉̤̱̖̻̓͛̾́s̶̘̰͘ ̶̛̝͕̌̽͊̆͋̃͋̿̑D̷̻͍̙̹̜̤͖̖͕̬̫͉͈̦̎́͛̇̀̃̋̌̈́̍͆̍̐͋͌͘ẽ̶̬͓̽̈͠͝n̶̢̢͙̲͉̙͇̞̜̓̓̎́͂̆͛̽̊i̷̙̲̥̭͇͖̬̿̊͛̀̉̏̒̃͒̐̉̈́̊͝ẻ̵̻̺̱͇͍̬̯̬̽̏̕͜͜ͅd̵̪̜͈̖͐̅̈͛̂̌̎̋͂̄̍͜͝ ̸̡̧̭̝̤͈̣̦̗̥͙̆͘͜-̴̧͈͚̯̠͇̰̲̙͉̜̤͔͇͇̂̄̎ͅͅ ̷̧͓̬̞̖̈̇̾͌̈̎͠͝͝͝ͅT̷̡̛͇̫̟͖̣͙̯̬͊͋̽͑͒̄̀̆̋̉̃̑̚͠h̷͓̦̦̪͙͇̲̦̜̘͙͇͇̜̙͆̅̏͛̈́̌́̾͘ͅḯ̴̧̥̟͖̼͚̗̪̫̣̲̫̗͙̜̎̀̒͂̌͜͝͝͝s̷̢̤̍̀́́ ̵̗̣̗̦̫̂͆̇͊͒̆͝t̵̠̘̱̰̲̗̟̜̯̤̳̣̠̬̍̂̇̀ḯ̸̪̻̹̫̞̘̚͠͝ḿ̶̡̛̛̥̖̞͚̮̩͙̰̘̥͉̯̪̑̇́̓͌͊͆͛̀̐͌̎͊͝ḛ̷̡̟̔̃̃̏͌͒͆̅̀͠͠l̷̢͚̅͌͒̀͑̍͐̾̾͆͋̆͝͝i̵̡̖̫͇͚̱̺̔̆͑̌͒͆ͅn̴̨̹̬̲͔̩͊̓̏̏̋́̈́̚e̷̢̢̡̞̼̦̯̤͈̣͙̯̹̩̖̭͆̓̑̐̈ ̸̛̻͚̒̂̉̃̊͐̈́͒̚̚͝͝i̷̛̤̥̬̰͎͉̹̪̗̲̜͇̦̱̩̞͈̎̈́̾̌̅͘s̵̡̛̳̞͚͆̑͋̔̋͒̈́̊͌̾̍̈̕͘̚͜͠ ̵̧̧̜̳͓̫͇̋́̇̕i̶̡͕̟̙̣̥̖̤̼̞̣͉͙̳̥̞͛͂́̎̓̒̒͗n̵̰̣̤̟̳̗̤͓̠͉̄͗͛͌̍̄̎̕v̶̺͓̤̻̺̬͇͒͜͝a̶̩̮̬̖̖̣͊̓͝͠l̸̨͇͋̌i̵̙̬͓̙̺͚̭̝̮̰̘̘̣̟̭̍͌̀̔͂̋͛̓̉͌͊̑d̵̡̫̣̤̜̮͇͖͉͉͛̂͑̆̉̕͝!̸̨̨̨̻̣̟̬̐̋́̏͊̌͛");
    }, 3500);
    setTimeout(() => {
      ui.notifications.warn("Ą̸̺̱̮̦̦̱̉̆̂͝r̷̨̥̜͓̠̫̮̗̹̦͈̪̳̙̻͑̅͑̐̽̄͌͘͝ͅe̵̡͈̜͖̪̖͚̩̬̗̫̭̊̈́͆͊̂̀̿̚ ̵͎̊̌͌͌̏̊͊̋̒̓̚y̶̻̍̈́̀̆͝͝ơ̴̧̛̟̺̳̬͚̑̌̀̌̇̂̈́̕͝ų̵̭̗̺̍̏̓̓̐̍͛̽̅̐̓̈́̐̊̕͝.̵̤̗̞͖̟̱̼̉̈́͗̒̕.̴̥͖̹͚̿̀̑̅̎͒̋̔̒́̂͑̈̔͑.̷̧̓ͅ.̶̞̱̝͕́̇̀̊ͅ ̶̞̰̥̟͓̫̪̰̺̼̪̰̹͇́͑͗̑̾̌͗̓̀̔̄̾́͒̒̊̈́ͅh̷̯̻͎̘̬͂̿̑͑̀̚ě̶̻̼̮̹͑̎̇́̋̓̂̆̎̈́͝͠r̷̡̤͕̙̠͕̯̫̮̼̖̫̞̙̟̯̗̆̀̃̏̈͒͘͝͠é̸̘̲͍̗̾́̐͒̉͌̽̚ ̵̡̢͎͚̟̝͍̻͎̳̰̬̥̮̼͍͊̈͊̕͜f̸̨̭̹̙̲̳͕͎̝̠̰̪̱̎̆͂̄̓͐́̂͘̚o̸̢̨̝̝̥̼̬̠͓̲̱̹̓̃̋͜͝ṟ̸̡̻̙̩̤͙̠͉͓̣̭͕͍̫͐̀̓̚ͅ ̸̧̲̝͓̣̠̟̝̄̀̔̽̈͜ͅm̴͖͕̆̌̿̊̅̀̊̔͋́̑͜ḙ̸̬̜̹̄̄͗̄ͅ?̵̧̧̛̗͇̼̪̘̫̥͎͇̑̓̄̿̓̎͐̂̄́͊͌͛̍̐͠");
    }, 3600);
    setTimeout(() => {
      ui.notifications.error("A̸̜̱̳͛̇̿̔͒̾̈́́̄̽͝c̴̡̹̯̦̥̒̓͗̍̿̑̔̔̏̓̊̄̓̚c̴͕̘͕̝̣̲̥͛̔͂͒̊́͊͐͌̈̀̈́̔̚ę̸̧̼̺̤̫̠̤̹̩͊̈́͜͜s̸̟̦͉̤̱̖̻̓͛̾́s̶̘̰͘ ̶̛̝͕̌̽͊̆͋̃͋̿̑D̷̻͍̙̹̜̤͖̖͕̬̫͉͈̦̎́͛̇̀̃̋̌̈́̍͆̍̐͋͌͘ẽ̶̬͓̽̈͠͝n̶̢̢͙̲͉̙͇̞̜̓̓̎́͂̆͛̽̊i̷̙̲̥̭͇͖̬̿̊͛̀̉̏̒̃͒̐̉̈́̊͝ẻ̵̻̺̱͇͍̬̯̬̽̏̕͜͜ͅd̵̪̜͈̖͐̅̈͛̂̌̎̋͂̄̍͜͝ ̸̡̧̭̝̤͈̣̦̗̥͙̆͘͜-̴̧͈͚̯̠͇̰̲̙͉̜̤͔͇͇̂̄̎ͅͅ ̷̧͓̬̞̖̈̇̾͌̈̎͠͝͝͝ͅT̷̡̛͇̫̟͖̣͙̯̬͊͋̽͑͒̄̀̆̋̉̃̑̚͠h̷͓̦̦̪͙͇̲̦̜̘͙͇͇̜̙͆̅̏͛̈́̌́̾͘ͅḯ̴̧̥̟͖̼͚̗̪̫̣̲̫̗͙̜̎̀̒͂̌͜͝͝͝s̷̢̤̍̀́́ ̵̗̣̗̦̫̂͆̇͊͒̆͝t̵̠̘̱̰̲̗̟̜̯̤̳̣̠̬̍̂̇̀ḯ̸̪̻̹̫̞̘̚͠͝ḿ̶̡̛̛̥̖̞͚̮̩͙̰̘̥͉̯̪̑̇́̓͌͊͆͛̀̐͌̎͊͝ḛ̷̡̟̔̃̃̏͌͒͆̅̀͠͠l̷̢͚̅͌͒̀͑̍͐̾̾͆͋̆͝͝i̵̡̖̫͇͚̱̺̔̆͑̌͒͆ͅn̴̨̹̬̲͔̩͊̓̏̏̋́̈́̚e̷̢̢̡̞̼̦̯̤͈̣͙̯̹̩̖̭͆̓̑̐̈ ̸̛̻͚̒̂̉̃̊͐̈́͒̚̚͝͝i̷̛̤̥̬̰͎͉̹̪̗̲̜͇̦̱̩̞͈̎̈́̾̌̅͘s̵̡̛̳̞͚͆̑͋̔̋͒̈́̊͌̾̍̈̕͘̚͜͠ ̵̧̧̜̳͓̫͇̋́̇̕i̶̡͕̟̙̣̥̖̤̼̞̣͉͙̳̥̞͛͂́̎̓̒̒͗n̵̰̣̤̟̳̗̤͓̠͉̄͗͛͌̍̄̎̕v̶̺͓̤̻̺̬͇͒͜͝a̶̩̮̬̖̖̣͊̓͝͠l̸̨͇͋̌i̵̙̬͓̙̺͚̭̝̮̰̘̘̣̟̭̍͌̀̔͂̋͛̓̉͌͊̑d̵̡̫̣̤̜̮͇͖͉͉͛̂͑̆̉̕͝!̸̨̨̨̻̣̟̬̐̋́̏͊̌͛");
    }, 3500);
    setTimeout(() => {
      ui.notifications.error("A̸̜̱̳͛̇̿̔͒̾̈́́̄̽͝c̴̡̹̯̦̥̒̓͗̍̿̑̔̔̏̓̊̄̓̚c̴͕̘͕̝̣̲̥͛̔͂͒̊́͊͐͌̈̀̈́̔̚ę̸̧̼̺̤̫̠̤̹̩͊̈́͜͜s̸̟̦͉̤̱̖̻̓͛̾́s̶̘̰͘ ̶̛̝͕̌̽͊̆͋̃͋̿̑D̷̻͍̙̹̜̤͖̖͕̬̫͉͈̦̎́͛̇̀̃̋̌̈́̍͆̍̐͋͌͘ẽ̶̬͓̽̈͠͝n̶̢̢͙̲͉̙͇̞̜̓̓̎́͂̆͛̽̊i̷̙̲̥̭͇͖̬̿̊͛̀̉̏̒̃͒̐̉̈́̊͝ẻ̵̻̺̱͇͍̬̯̬̽̏̕͜͜ͅd̵̪̜͈̖͐̅̈͛̂̌̎̋͂̄̍͜͝ ̸̡̧̭̝̤͈̣̦̗̥͙̆͘͜-̴̧͈͚̯̠͇̰̲̙͉̜̤͔͇͇̂̄̎ͅͅ ̷̧͓̬̞̖̈̇̾͌̈̎͠͝͝͝ͅT̷̡̛͇̫̟͖̣͙̯̬͊͋̽͑͒̄̀̆̋̉̃̑̚͠h̷͓̦̦̪͙͇̲̦̜̘͙͇͇̜̙͆̅̏͛̈́̌́̾͘ͅḯ̴̧̥̟͖̼͚̗̪̫̣̲̫̗͙̜̎̀̒͂̌͜͝͝͝s̷̢̤̍̀́́ ̵̗̣̗̦̫̂͆̇͊͒̆͝t̵̠̘̱̰̲̗̟̜̯̤̳̣̠̬̍̂̇̀ḯ̸̪̻̹̫̞̘̚͠͝ḿ̶̡̛̛̥̖̞͚̮̩͙̰̘̥͉̯̪̑̇́̓͌͊͆͛̀̐͌̎͊͝ḛ̷̡̟̔̃̃̏͌͒͆̅̀͠͠l̷̢͚̅͌͒̀͑̍͐̾̾͆͋̆͝͝i̵̡̖̫͇͚̱̺̔̆͑̌͒͆ͅn̴̨̹̬̲͔̩͊̓̏̏̋́̈́̚e̷̢̢̡̞̼̦̯̤͈̣͙̯̹̩̖̭͆̓̑̐̈ ̸̛̻͚̒̂̉̃̊͐̈́͒̚̚͝͝i̷̛̤̥̬̰͎͉̹̪̗̲̜͇̦̱̩̞͈̎̈́̾̌̅͘s̵̡̛̳̞͚͆̑͋̔̋͒̈́̊͌̾̍̈̕͘̚͜͠ ̵̧̧̜̳͓̫͇̋́̇̕i̶̡͕̟̙̣̥̖̤̼̞̣͉͙̳̥̞͛͂́̎̓̒̒͗n̵̰̣̤̟̳̗̤͓̠͉̄͗͛͌̍̄̎̕v̶̺͓̤̻̺̬͇͒͜͝a̶̩̮̬̖̖̣͊̓͝͠l̸̨͇͋̌i̵̙̬͓̙̺͚̭̝̮̰̘̘̣̟̭̍͌̀̔͂̋͛̓̉͌͊̑d̵̡̫̣̤̜̮͇͖͉͉͛̂͑̆̉̕͝!̸̨̨̨̻̣̟̬̐̋́̏͊̌͛");
    }, 5200);
    setTimeout(() => {
      ui.notifications.info("P̶̧̪͎̪̲̺̭̳̫̤̩̋̄̋̉̓̀̍͌̐̃́̉̽̍̕͜͜ẻ̵̛̺̈̀͋̒̔̈́͂͆͊̍͠ṟ̵͈̟̝̯̽́̇̇̑̐̀́̂̃̇͋͘ͅh̸̨̧̛͙̩̦̥̼̳̱̟͚̫̖̙̘̯͐̑̅̾̈̂̍̔̿͋͘͜͠â̷͖̼͑̆͐p̸̝̙̙̤̭͓̩͕̼̈́̂͂̃̇͛̋̉̎́̆̓̊͝͝͝s̴̢̡̱̺͓͊̾͆̈́̈͊̈́̌͗̀͘͠.̷̝̕͝.̷̢̲͉̞͉̞̇̏̾̽̍͌̾͂̆͘͘͜.̶̳̹̓̽̍͠.̶̧̡̼̤̣̯̰͖̪̈́̇͜ͅ ̶̞̯̥͆͋͒̈́̀̓̂̿͊͌t̴̡̢̺̝̗̲̪̾̀͌h̷͔͚̹̞̪̭̄ͅe̶̡̧̧̢̲̠̰̗̳̦̯̺̳̰̜͈̊̕͝ͅ ̵̨̡̘̲͉̠̫̊̃̾̊͛̊́͛̇͝g̵̨͎̯̹͙̹͈͖̩̠̅̒̄̄̾̒̌̓͗ͅò̶̦̘͚̼̲͎͇͕̿̌̋͜ͅl̷̯̹̱͉̿̀̓̋̽ḑ̵̡̼̜͎͙̝̖͍̩͙̙̣̺̮͔͋̓̈́̾ͅḙ̸̗̣͖̻̩̪̅ǹ̶̩̥͆̈͑̾͠ ̵͔͍̙͕̱̀̂͗̓̆́̃̽̀͒̽̄̾́̚ͅȯ̷̢͉͇̺͙͙̟̰̅͂̊̄̍̀̒̇͌̽̚͝͝͠ǹ̸̡̰͇̰̼̝̫͈̻̆ę̴͚̦̩̹̗͍̀̑̐̇̒̑͝ ̸̨̡͕̘̼͈̮̙͎͇̬͕͚̟̱̓h̴̢̥̘̫͕̥͕̹͚͇̦̱̑̀ǻ̴̢̢͈̝̜̝̤̗͔͇͙̹̠̍̀̈̀̌̏͆̈́̀̚͝s̷̬̝̀̌͐̎̔̆̀̄͗̈̈́͝͝͠͝ ̸̥͗͛͂͑͛͆͑͐̑̐͛́̎̐̑̕͝t̴̽̓̀̇͊́͌̊͝ͅh̴̛̬̘͇̯̩̫̯̟̤͓͓̬̬̼̞͐́̓̏̍͐͋̀͛͛̀̕ȩ̶̣̻̹͖̱̭͕̯͖̱̄̇̓̉̄̊̉̀̉̒͛̓ͅ ̴̨͈̙͍̙͓̞̙̏̎̃̒̅̓͗̂̚͝ͅa̷̘͚̻̭̦͔͙̟̙̽̔̀̕͜n̸̩̠̙͈̐̂͐͌͋̒͑͊̇̓͝͝s̵̨͇̠̺̼̜̘̳͒̀͛w̸̢̦̌̑́͐͐͝͠ḝ̸̛͙̥͚̣͇̜̝̯̭̘̟̟̪̎̋̄͋̄̀̚͝͠ͅṛ̶̖͙̜͒̽ŝ̷̢̖̱̞̭̼̭͎̙̠.̴̨̖͈̟͇͇̲͇̰̰̫̪̳͙͗̊͌̈́̇̈́̓̓̿̍̕̚");
    }, 5300);
    setTimeout(() => {
      ui.notifications.error("A̸̜̱̳͛̇̿̔͒̾̈́́̄̽͝c̴̡̹̯̦̥̒̓͗̍̿̑̔̔̏̓̊̄̓̚c̴͕̘͕̝̣̲̥͛̔͂͒̊́͊͐͌̈̀̈́̔̚ę̸̧̼̺̤̫̠̤̹̩͊̈́͜͜s̸̟̦͉̤̱̖̻̓͛̾́s̶̘̰͘ ̶̛̝͕̌̽͊̆͋̃͋̿̑D̷̻͍̙̹̜̤͖̖͕̬̫͉͈̦̎́͛̇̀̃̋̌̈́̍͆̍̐͋͌͘ẽ̶̬͓̽̈͠͝n̶̢̢͙̲͉̙͇̞̜̓̓̎́͂̆͛̽̊i̷̙̲̥̭͇͖̬̿̊͛̀̉̏̒̃͒̐̉̈́̊͝ẻ̵̻̺̱͇͍̬̯̬̽̏̕͜͜ͅd̵̪̜͈̖͐̅̈͛̂̌̎̋͂̄̍͜͝ ̸̡̧̭̝̤͈̣̦̗̥͙̆͘͜-̴̧͈͚̯̠͇̰̲̙͉̜̤͔͇͇̂̄̎ͅͅ ̷̧͓̬̞̖̈̇̾͌̈̎͠͝͝͝ͅT̷̡̛͇̫̟͖̣͙̯̬͊͋̽͑͒̄̀̆̋̉̃̑̚͠h̷͓̦̦̪͙͇̲̦̜̘͙͇͇̜̙͆̅̏͛̈́̌́̾͘ͅḯ̴̧̥̟͖̼͚̗̪̫̣̲̫̗͙̜̎̀̒͂̌͜͝͝͝s̷̢̤̍̀́́ ̵̗̣̗̦̫̂͆̇͊͒̆͝t̵̠̘̱̰̲̗̟̜̯̤̳̣̠̬̍̂̇̀ḯ̸̪̻̹̫̞̘̚͠͝ḿ̶̡̛̛̥̖̞͚̮̩͙̰̘̥͉̯̪̑̇́̓͌͊͆͛̀̐͌̎͊͝ḛ̷̡̟̔̃̃̏͌͒͆̅̀͠͠l̷̢͚̅͌͒̀͑̍͐̾̾͆͋̆͝͝i̵̡̖̫͇͚̱̺̔̆͑̌͒͆ͅn̴̨̹̬̲͔̩͊̓̏̏̋́̈́̚e̷̢̢̡̞̼̦̯̤͈̣͙̯̹̩̖̭͆̓̑̐̈ ̸̛̻͚̒̂̉̃̊͐̈́͒̚̚͝͝i̷̛̤̥̬̰͎͉̹̪̗̲̜͇̦̱̩̞͈̎̈́̾̌̅͘s̵̡̛̳̞͚͆̑͋̔̋͒̈́̊͌̾̍̈̕͘̚͜͠ ̵̧̧̜̳͓̫͇̋́̇̕i̶̡͕̟̙̣̥̖̤̼̞̣͉͙̳̥̞͛͂́̎̓̒̒͗n̵̰̣̤̟̳̗̤͓̠͉̄͗͛͌̍̄̎̕v̶̺͓̤̻̺̬͇͒͜͝a̶̩̮̬̖̖̣͊̓͝͠l̸̨͇͋̌i̵̙̬͓̙̺͚̭̝̮̰̘̘̣̟̭̍͌̀̔͂̋͛̓̉͌͊̑d̵̡̫̣̤̜̮͇͖͉͉͛̂͑̆̉̕͝!̸̨̨̨̻̣̟̬̐̋́̏͊̌͛");
    }, 5400);
  });

  utopiaSettings.append(twitchSettings, discordButton, vaultButton);

  const ws = new WebSocket("ws://localhost:8765");
});

Hooks.on("renderSidebarTab", (tab) => {
  if (tab.tabName !== "compendium") return;

  const browserButton = document.createElement("button");
  const browserIcon = document.createElement("i");
  browserIcon.classList.add("fas", "fa-globe");
  browserButton.type = "button";
  browserButton.style.height = "28px";
  browserButton.style.lineHeight = "26px";
  browserButton.style.margin = "4px";
  browserButton.append(browserIcon, game.i18n.localize("UTOPIA.Settings.Buttons.compendiumBrowser"));
  browserButton.addEventListener("click", () => {
    // Open the hyperlink to the Utopia Discord
    const browser = new UtopiaCompendiumBrowser();
    browser.render(true);
  });  

  tab.element[0].querySelector(".directory-footer.action-buttons")?.append(browserButton);
});
//#endregion

//#region
/* -------------------------------------------- */
/*  Optional Module Integrations                */
/* -------------------------------------------- */

function registerDiceSoNice(dice3d) {
  if (!dice3d) return;

  dice3d.addTexture("utopia", {
    name: "Utopia",
    composite: "source-over",
    source: "systems/utopia/assets/Utopia-Logo.webp",
    bump: ""
  })

  const utopiaDark = "systems/utopia/assets/dice/Utopia-Logo-Black.png";
  const utopiaDarkSmall = "systems/utopia/assets/dice/Utopia-Logo-Black-Small.png";
  const utopiaLight = "systems/utopia/assets/dice/Utopia-Logo.png";
  const utopiaLightSmall = "systems/utopia/assets/dice/Utopia-Logo-Small.png";

  const utopiaDarkSystem = {
    id: "utopia_dark",
    name: "Utopia Dark",
    group: "Utopia",
    mode: "preferred",
  };
  dice3d.addSystem(utopiaDarkSystem);

  const utopiaLightSystem = {
    id: "utopia_light",
    name: "Utopia Light",
    group: "Utopia",
    mode: "preferred",
  };
  dice3d.addSystem(utopiaLightSystem);

  // D4
  dice3d.addDicePreset({
    type: "d4",
    labels: ["1", "2", "3", utopiaDark],
    bumpMaps: [,,,utopiaLight],
    system: "utopia_dark",
  }, "d4")

  // D6
  dice3d.addDicePreset({
    type: "d6",
    labels: ["1", "2", "3", "4", "5", utopiaDark],
    bumpMaps: [,,,,,utopiaLight],
    system: "utopia_dark",
  }, "d6")

  // D8
  dice3d.addDicePreset({
    type: "d8",
    labels: ["1", "2", "3", "4", "5", "6", "7", utopiaDarkSmall],
    bumpMaps: [,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d8")

  // D10
  dice3d.addDicePreset({
    type: "d10",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d10")

  // D12
  dice3d.addDicePreset({
    type: "d12",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d12")

  // D20
  dice3d.addDicePreset({
    type: "d20",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d20")

  // --------------------

  // D4
  dice3d.addDicePreset({
    type: "d4",
    labels: ["1", "2", "3", utopiaLight],
    bumpMaps: [,,,utopiaLight],
    system: "utopia_light",
  }, "d4")

  // D6
  dice3d.addDicePreset({
    type: "d6",
    labels: ["1", "2", "3", "4", "5", utopiaLight],
    bumpMaps: [,,,,,utopiaLight],
    system: "utopia_light",
  }, "d6")

  // D8
  dice3d.addDicePreset({
    type: "d8",
    labels: ["1", "2", "3", "4", "5", "6", "7", utopiaLightSmall],
    bumpMaps: [,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d8")

  // D10
  dice3d.addDicePreset({
    type: "d10",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d10")

  // D12
  dice3d.addDicePreset({
    type: "d12",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d12")

  // D20
  dice3d.addDicePreset({
    type: "d20",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d20");
}

//#endregion

//#region Macro Handling
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item" && data.type !== "Macro") return;
  if (data.uuid.includes("Actor.") || data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  if (data.type === "Macro") {
    const macro = await Macro.fromDropData(data); 
    if (macro) {
      return game.user.assignHotbarMacro(macro, slot);
    }
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.utopia.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "utopia.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
//#endregion
