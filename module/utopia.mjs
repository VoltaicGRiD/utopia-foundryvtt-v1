const { api } = foundry.applications;

// Import document classes.
import { UtopiaActor } from "./documents/actor.mjs";
import { UtopiaItem } from "./documents/item.mjs";
import { UtopiaChatMessage } from "./documents/chat-message.mjs";

// Import sheet classes.
import { UtopiaActorSheetV2 } from "./sheets/actor/actor-sheet-appv2.mjs";
import {
  UtopiaWeaponSheet,
  UtopiaActionSheet,
  UtopiaSpeciesSheet,
  UtopiaTalentSheet,
  UtopiaSpellFeatureSheet,
  UtopiaSpecialistTalentSheet
} from "./sheets/item/_module.mjs";
import { UtopiaTalentTreeSheet } from "./sheets/other/talent-tree-sheet.mjs";
import { UtopiaOptionsSheet } from "./sheets/other/options-sheet.mjs";
import { UtopiaSubtraitSheetV2 } from "./sheets/other/subtrait-sheet.mjs";
import { UtopiaSpellcraftSheet } from "./sheets/other/spellcraft-sheet.mjs";


// Import utility classes.
import {
  isNumeric,
  searchTraits,
  shortToLong,
  longToShort,
  traitShortNames,
  traitLongNames,
  calculateTraitFavor,
  addTalentToActor,
  USER_VISIBILITIES,
  UtopiaUserVisibility,
  gatherTalents,
  runTrigger,
  UtopiaTrigger,
  triggers,
  rangeTest,
  preloadHandlebarsTemplates,
} from "./helpers/_module.mjs";
import { UTOPIA } from "./helpers/config.mjs";

// Import models.
import * as models from "./data/_module.mjs";
import { UtopiaUser } from "./documents/user.mjs";
import { UtopiaActiveEffect } from "./documents/active-effect.mjs";
import UtopiaActiveEffectSheet from "./sheets/other/active-effect-sheet.mjs";

//#region Init Hook (Definitions and Initial Function Callouts)
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

// Add key classes to the global scope so they can be more easily used
// by downstream developers
globalThis.utopia = {
  documents: {
    UtopiaActor,
    UtopiaItem,
    UtopiaChatMessage,
  },
  applications: {
    UtopiaWeaponSheet,
    UtopiaActionSheet,
    UtopiaActorSheetV2,
    UtopiaOptionsSheet,
    UtopiaSubtraitSheetV2,
    UtopiaSpeciesSheet,
    UtopiaTalentSheet,
    UtopiaSpellFeatureSheet,
    UtopiaSpellcraftSheet,
    UtopiaTalentTreeSheet,
    UtopiaTrigger,
  },
  utils: {
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateTraitFavor,
    runTrigger,
    triggers,
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
    UtopiaChatMessage,
    UtopiaUser,
    UtopiaActor,
    UtopiaItem,
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateTraitFavor,
    triggers,
    traitShortNames,
    traitLongNames,
  };

  // Add custom constants for configuration.
  CONFIG.UTOPIA = UTOPIA;

  // This is how we configure initiative in the system, it has to be done in the init hook.
  CONFIG.Combat.initiative = {
    formula: "3d6 + @spd.mod",
    decimals: 2,
  };
  
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
    },
  }

  // Store our custom document classes for Actors and Items.
  // We can register our custom [UtopiaChatMessage] class here too, since they are qualified as "Documents".
  CONFIG.Actor.documentClass = UtopiaActor;
  CONFIG.Item.documentClass = UtopiaItem;
  CONFIG.User.documentClass = UtopiaUser;
  CONFIG.ChatMessage.documentClass = UtopiaChatMessage;
  CONFIG.ActiveEffect.documentClass = UtopiaActiveEffect; 

  DocumentSheetConfig.registerSheet(UtopiaActiveEffect, "utopia", UtopiaActiveEffectSheet, 
    {
      types: ["base", "specialist", "talent"],
      makeDefault: true,
      label: "UTOPIA.SheetLabels.activeEffect",
    }
  );

  console.log(DocumentSheetConfig);

  // CONFIG.User.dataModels = {
  //   user: models.UtopiaUser,
  // }

  // Setting up schema handling for the system.
  // This is supposed to replace the default 'Template.json' file.
  // It's a bit more flexible and allows for more complex data structures and validation.
  CONFIG.Item.dataModels = {
    species: models.UtopiaSpecies,
    talent: models.UtopiaTalent,
    action: models.UtopiaAction,
    spellFeature: models.UtopiaSpellFeature,
    variable: models.UtopiaSpellVariable,
    specialistTalent: models.UtopiaSpecialistTalent,
  };

  // Active Effects are never copied to the Actor,  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register all of our status effects, sheets, and game settings
  registerActorSheets();
  registerItemSheets();
  registerStatusEffects();
  registerGameSettings();
  registerGameKeybindings();

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
    types: ["character"],
    label: "UTOPIA.SheetLabels.actorV2",
  });
}

/* -------------------------------------------- */
/*  Item Sheets                                 */
/* -------------------------------------------- */

function registerItemSheets() {
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("utopia", UtopiaActionSheet, {
    makeDefault: true,
    types: ["action"],
    label: "UTOPIA.SheetLabels.action",
  });
  // Items.registerSheet("utopia", UtopiaSpellcraftSheet, {
  //   makeDefault: true,
  //   types: ["spell"],
  //   label: "UTOPIA.SheetLabels.spellcraft",
  // });
  Items.registerSheet("utopia", UtopiaWeaponSheet, {
    makeDefault: true,
    types: ["weapon"],
    label: "UTOPIA.SheetLabels.weapon",
  });
  Items.registerSheet("utopia", UtopiaSpeciesSheet, {
    makeDefault: true,
    types: ["species"],
    label: "UTOPIA.SheetLabels.species",
  });
  Items.registerSheet("utopia", UtopiaTalentSheet, {
    makeDefault: true,
    types: ["talent"],
    label: "UTOPIA.SheetLabels.talent",
  });
  Items.registerSheet("utopia", UtopiaSpellFeatureSheet, {
    makeDefault: true,
    types: ["spellFeature"],
    label: "UTOPIA.SheetLabels.spellComponent",
  });
  Items.registerSheet("utopia", UtopiaSpecialistTalentSheet, {
    makeDefault: true,
    types: ["specialistTalent"],
    label: "UTOPIA.SheetLabels.specialistTalent",
  })
}

/* -------------------------------------------- */
/*  ActiveEffect Sheet                          */
/* -------------------------------------------- */
function registerActiveEffectSheet() {
}

//#endregion

//#region Game Keybindings
/* -------------------------------------------- */
/*  System Settings                             */
/* -------------------------------------------- */

function registerGameKeybindings() {
  // Open Talent Tree for selected Token
  game.keybindings.register("utopia", "openTalentTree", {
    name: "UTOPIA.Keybindings.openTalentTree",
    hint: "UTOPIA.Keybindings.openTalentTreeHint",
    editable: [{ key: "KeyT", modifiers: ["Control"] }, { key: "F1" }],
    onDown: () => {
      if (game.canvas.tokens.controlled.length > 0) {
        game.canvas.tokens.controlled.forEach((token) => {
          token.actor.openTalentTree();
        });
      } else {
        ui.notifications.warn("No token selected.");
      }
    },
    onUp: () => {},
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  });

  // Open Talent Tree for selected Token
  game.keybindings.register("utopia", "openSubtraitSheet", {
    name: "UTOPIA.Keybindings.openSubtraitSheet",
    hint: "UTOPIA.Keybindings.openSubtraitSheetHint",
    editable: [{ key: "KeyS", modifiers: ["Control"] }, { key: "F2" }],
    onDown: () => {
      if (game.canvas.tokens.controlled.length > 0) {
        game.canvas.tokens.controlled.forEach((token) => {
          token.actor.openSubtraitSheet();
        });
      } else {
        ui.notifications.warn("No token selected.");
      }
    },
    onUp: () => {},
    restricted: false,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
  });

  // Open Talent Tree for selected Token
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
              title: `${game.i18n.localize("UTOPIA.Dialog.dealDamage")} - ${
                actor.name
              }`,
            },
            classes: ["utopia", "utopia-dialog"],
            content: html,
            buttons: [
              {
                default: true,
                action: "submit",
                icon: "fas fa-check",
                id: "submit-button",
                label: "UTOPIA.Dialog.submit",
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
                label: "UTOPIA.Dialog.submit",
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
              console.log(result);
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
    scope: "world",
    config: game.settings.get("utopia", "diceRedistribution"),
    type: Number,
    choices: {
      0: "UTOPIA.Settings.diceRedistributionNone",
      1: "UTOPIA.Settings.diceRedistributionSmallest",
      2: "UTOPIA.Settings.diceRedistributionHighest",
    },
    default: true,
  });
}

/* -------------------------------------------- */
/*  Status Effects                              */
/* -------------------------------------------- */

function registerStatusEffects() {
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
  ];

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

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("select", function (value, options) {
  var $el = $("<select />").html(options.fn(this));
  $el.find('[value="' + value + '"]').attr({ selected: "selected" });
  return $el.html();
});
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

  console.log(grants);

  try {
    if (grants.subtraits.indexOf(",") > -1) {
      let subtraits = grants.subtraits.split(",");

      subtraits.forEach((subtrait) => {
        let parsed = String(subtrait.trim());
        let trait = searchTraits(actor.system.traits, parsed);

        console.log(parsed);
        console.log(trait);

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
      console.log(token);
      token.control();
    }
  
    combat.combatants.forEach((combatant) => {
      let actor = game.actors.get(combatant.actorId);
      // If the combatant is the current combatant, we have to restore
      // their Turn Actions
      if (to.combatantId === combatant._id) {
        actor.update({
          ["system.actions.turn.value"]: actor.system.actions.turn.max,
          ["system.actions.interrupt.value"]: 0,
        });
      }
      // If the combatant is not the current combatant, we have to restore 
      // their Interrupt Actions
      else {
        actor.update({
          ["system.actions.interrupt.value"]: actor.system.actions.interrupt.max,
          ["system.actions.turn.value"]: 0,
        });
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

  // Hooks.on("refreshToken", (token, misc) => {
  //   let shp = token.actor.system.shp.value;
  //   let tokenId = token.id;

  //   if (!CONFIG.UTOPIA.trackedTokens) {
  //     CONFIG.UTOPIA.trackedTokens = [];
  //   }

  //   if (CONFIG.UTOPIA.trackedTokens.includes(tokenId)) {
  //     CONFIG.UTOPIA.trackedTokens.append(tokenId);

  //     Hooks.once("modifyTokenAttribute", (update, actorData) => {
  //       let newShp = update.value;

  //       console.log(shp, newShp);

  //       let index = CONFIG.UTOPIA.trackedTokens.indexOf(tokenId);
  //       CONFIG.UTOPIA.trackedTokens.splice(index, 1);
  //     });
  //   }
  // });

  Hooks.on("preUpdateActor", (actor, data, meta, userId) => {
    // Actor is the actor being updated
    // Data is the data that is being updated
    // Meta is the metadata for the update
    // UserId is the user that initiated the update
    // console.log(actor, data, meta, userId);
    // if (!data.system) return;
    // const a = actor.toObject().system;
    // const u = data.system;
    // if (a.shp.value != u.shp.value || a.dhp.value != u.dhp.value) {
    //   if (a.shp.value > u.shp.value) {
    //     let damage = a.shp.value - u.shp.value;
    //     let type = "Unlisted";
    //     actor.applyDamage({ damage: damage, type: type });
    //     return false;
    //   } else if (a.shp.value < u.shp.value) {
    //     return true;
    //     let healing = u.shp.value - a.shp.value;
    //     let type = "Unlisted";
    //     actor.applyHealing(healing, type);
    //     return false;
    //   } else if (a.dhp.value > u.dhp.value) {
    //     let damage = a.dhp.value - u.dhp.value;
    //     let type = "Unlisted";
    //     actor.applyDamage({ damage: damage, type: type });
    //     return false;
    //   } else if (a.dhp.value < u.dhp.value) {
    //     return true;
    //     let healing = u.dhp.value - a.dhp.value;
    //     let type = "Unlisted";
    //     actor.applyHealing(healing, type);
    //     return false;
    //   }
    // } else {
    //   try {
    //     assumeTrigger(data, actor.toObject(), actor);
    //     return true;
    //   } catch (error) {
    //     return true;
    //   }
    // };
  });

  Hooks.on("renderMacroConfig", async (app, html, data) => {
    console.log(app, html, data);
    
  });

  Hooks.on("preCreateActiveEffect", (effect, options, userId) => {
    const actor = effect.target;
    const condition = effect.statuses[0];

    runTrigger("Condition", 
      { actor: actor, condition: condition }
    );

    return true;
  });

  Hooks.on("preDeleteActiveEffect", (effect, options, userId) => {
    const actor = effect.target;
    const condition = effect.statuses[0];

    if (condition === "focus") {
      runTrigger("FocusLost", actor, condition);
    } else if (condition === "concentration") {
      runTrigger("ConcentrationLost", actor, condition);
    } else {
      runTrigger("ConditionLost", actor, condition);
    }

    return true;
  });

  // ------------------
  // This hook is a fallback for handling damage and healing
  // I've disabled it since I believe I found a better way to handle it
  // ------------------
  //#region Disabled [onTokenModified] Hook (Damage & Healing)
  // Hooks.on('modifyTokenAttribute', (update, actorData) => {
  //   console.log(update, actorData);

  //   if (update.attribute === 'shp' || update.attribute === 'dhp') {
  //     let actorId = actorData._id;
  //     let actor = game.actors.get(actorId);
  //     console.log(actor);
  //     if (actor.statuses) {
  //       if (actor.statuses.has('concentration')) {
  //         let formula = "3d6 + @traits.str.subtraits.for.mod";
  //         let rollData = actor.getRollData();
  //         let fortitudeTest = new Roll(formula, rollData).roll();
  //         fortitudeTest.toMessage();
  //       }
  //     }
  //   }
  // });
  //#endregion

  Hooks.on("createActiveEffect", (effect, options, userId) => {
    console.log(effect);

    if (effect.statuses.has("blinded")) {
      let change = {
        key: "system.disfavors",
        mode: 2,
        priority: null,
        value: '{"attribute": "awa", "amount": 2}',
      };
      effect.changes.push(change);
    }

    console.log(effect);
    return effect;
  });
});
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
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
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
