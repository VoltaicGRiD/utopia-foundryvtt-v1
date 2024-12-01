// Import document classes.
import { UtopiaActor } from './documents/actor.mjs';
import { UtopiaItem } from './documents/item.mjs';
// Import sheet classes.
import { UtopiaItemSheet } from './sheets/item-sheet.mjs';
import { UtopiaWeaponSheet } from './sheets/weapon-sheet.mjs';
import { UtopiaActionSheet } from './sheets/action-sheet.mjs';
import { UtopiaChatMessage } from './sheets/chat-message.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { UTOPIA } from './helpers/config.mjs';
import isNumeric from './helpers/numeric.mjs';
import searchTraits from './helpers/searchTraits.mjs';
import Tagify from '../lib/tagify/tagify.esm.js';
import { UtopiaActorSheetV2 } from './sheets/actor-sheet-appv2.mjs';
import { UtopiaSpellSheet } from './sheets/spell-sheet.mjs';
import { UtopiaSpeciesSheet } from './sheets/species-sheet.mjs';
import { UtopiaTalentTreeSheet } from './sheets/talent-tree-sheet.mjs';
import { UtopiaTalentSheet } from './sheets/talent-sheet.mjs';
import { UtopiaOptionsSheet } from './sheets/options-sheet.mjs';
import { UtopiaSubtraitSheetV2 } from './sheets/subtrait-sheet.mjs';
import * as models from './data/_module.mjs';
import { addTalentToActor } from './helpers/addTalent.mjs';
import gatherTalents from './helpers/gatherTalents.mjs';
import { longToShort, shortToLong, traitLongNames, traitShortNames } from './helpers/traitNames.mjs';
import rangeTest from './helpers/rangeTest.mjs';
import { calculateFavor } from './helpers/favorHandler.mjs';

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
    UtopiaItemSheet,
    UtopiaWeaponSheet,
    UtopiaActionSheet,
    UtopiaSpellSheet,
    UtopiaActorSheetV2,
    UtopiaTalentTreeSheet,
    UtopiaOptionsSheet,
    UtopiaSubtraitSheetV2,
    UtopiaSpeciesSheet,
    UtopiaTalentSheet,
  },
  utils: {
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateFavor,
    traitShortNames,
    traitLongNames,
  },
  models
};

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.utopia = {
    UtopiaChatMessage,
    UtopiaActor,
    UtopiaItem,
    rollItemMacro,
    addTalentToActor,
    gatherTalents,
    shortToLong,
    longToShort,
    rangeTest,
    calculateFavor,
    traitShortNames,
    traitLongNames,
  };

  // Add custom constants for configuration.
  CONFIG.UTOPIA = UTOPIA;

  // This is how we configure initiative in the system, it has to be done in the init hook.
  CONFIG.Combat.initiative = {
    formula: '3d6 + @spd.mod',
    decimals: 2,
  };

  // Store our custom document classes for Actors and Items.
  // We can register our custom [UtopiaChatMessage] class here too, since they are qualified as "Documents".
  CONFIG.Actor.documentClass = UtopiaActor;
  CONFIG.Item.documentClass = UtopiaItem;
  CONFIG.ChatMessage.documentClass = UtopiaChatMessage;

  // Setting up schema handling for the system.
  // This is supposed to replace the default 'Template.json' file.
  // It's a bit more flexible and allows for more complex data structures and validation.
  CONFIG.Item.dataModels = {
    item: models.UtopiaItem,
    spell: models.UtopiaSpell,
    species: models.UtopiaSpecies,
    talent: models.UtopiaTalent,
  }

  // Active Effects are never copied to the Actor,  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register all of our status effects, sheets, and game settings
  registerActorSheets();
  registerItemSheets();
  registerStatusEffects();
  registerGameSettings();

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
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('utopia', UtopiaActorSheetV2, {
    makeDefault: true,
    types: ['character'],
    label: 'UTOPIA.SheetLabels.actorV2',
  })
}

/* -------------------------------------------- */
/*  Item Sheets                                 */
/* -------------------------------------------- */

function registerItemSheets() {
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('utopia', UtopiaItemSheet, {
    makeDefault: true,
    types: ['item', 'talent', 'species'],
    label: 'UTOPIA.SheetLabels.item',
  });
  Items.registerSheet('utopia', UtopiaActionSheet, {
    makeDefault: true,
    types: ['action'],
    label: 'UTOPIA.SheetLabels.action',
  });
  Items.registerSheet('utopia', UtopiaWeaponSheet, {
    makeDefault: true,
    types: ['weapon'],
    label: 'UTOPIA.SheetLabels.weapon',
  });
  Items.registerSheet('utopia', UtopiaSpellSheet, {
    makeDefault: true,
    types: ['spell'],
    label: 'UTOPIA.SheetLabels.weapon',
  });
  Items.registerSheet('utopia', UtopiaSpeciesSheet, {
    makeDefault: true,
    types: ['species'],
    label: 'UTOPIA.SheetLabels.species',
  });
  Items.registerSheet('utopia', UtopiaTalentSheet, {
    makeDefault: true,
    types: ['talent'],
    label: 'UTOPIA.SheetLabels.talent',
  });
}
//#endregion

//#region Game Settings and Status Effects
/* -------------------------------------------- */
/*  System Settings                             */
/* -------------------------------------------- */

function registerGameSettings() {
  // Register System settings in the game settings menu
  game.settings.register('utopia', 'targetRequired', {
    name: "UTOPIA.Settings.targetRequired",
    hint: "UTOPIA.Settings.targetRequiredHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('utopia', 'autoRollAttacks', {
    name: "UTOPIA.Settings.autoRollAttacks",
    hint: "UTOPIA.Settings.autoRollAttacksHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register('utopia', 'saveSheetTab', {
    name: "UTOPIA.Settings.saveSheetTab",
    hint: "UTOPIA.Settings.saveSheetTabHint",
    scope: "client",
    config: true,
    type: Boolean,
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
      id: 'deafened',
      img: 'icons/svg/sound-off.svg',
      label: 'UTOPIA.StatusEffects.deafened',
    },
    {
      id: 'blinded',
      img: 'icons/svg/blind.svg',
      label: 'UTOPIA.StatusEffects.blinded',
    },
    {
      id: 'unconcious',
      img: 'icons/svg/unconscious.svg',
      label: 'UTOPIA.StatusEffects.unconscious',
    },
    {
      id: 'paralysis',
      img: 'icons/svg/paralysis.svg',
      label: 'UTOPIA.StatusEffects.paralysis',
    },
    {
      id: 'dazed',
      img: 'icons/svg/stoned.svg',
      label: 'UTOPIA.StatusEffects.dazed',
    },
    {
      id: 'concentration',
      img: 'icons/svg/padlock.svg',
      label: 'UTOPIA.StatusEffects.concentration',
    },
    {
      id: 'focus',
      img: 'icons/svg/daze.svg',
      label: 'UTOPIA.StatusEffects.focus',
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
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('select', function( value, options ){
  var $el = $('<select />').html( options.fn(this) );
  $el.find('[value="' + value + '"]').attr({'selected':'selected'});
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
    if (grants.subtraits.indexOf(',') > -1) {
      let subtraits = grants.subtraits.split(',')
  
      subtraits.forEach(subtrait => {
        let parsed = String(subtrait.trim());
        let trait = searchTraits(actor.system.traits, parsed);

        console.log(parsed);
        console.log(trait);
  
        actor.update({
          [`system.traits.${trait}.subtraits.${parsed}.gifted`]: true
        })  
      })    
    }
  } catch {
    let points = actor.system.points.gifted;
    
    if (isNumeric(grants.subtraits)) {
      points += parseInt(grants.subtraits);
    }
    else {
      points += grants.subtraits;
    }

    actor.update({
      system: {
        points: {
          gifted: points
        }
      }
    })
  }

  actor.update({
    system: {
      species: item,
      block: grants['block'],
      dodge: grants['dodge'],
      attributes: {
        constitution: grants['constitution'],
        endurance: grants['endurance'],
        effervescence: grants['effervescence']
      }
    }
  })
}
//#endregion

//#region Hooks
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => { 
    createDocMacro(data, slot); 
    return false;
  });

  Hooks.on('targetToken', (user, token, targeted) => {
    if (ui.activeWindow.constructor.name === 'UtopiaAttackSheet') {
      let window = ui.activeWindow;
      window.render();
    }
  });

  Hooks.on('refreshToken', (token, misc) => {
    let shp = token.actor.system.shp.value;
    let tokenId = token.id;

    if (!CONFIG.UTOPIA.trackedTokens) {
      CONFIG.UTOPIA.trackedTokens = [];
    }

    if (CONFIG.UTOPIA.trackedTokens.includes(tokenId)) {
      CONFIG.UTOPIA.trackedTokens.append(tokenId);
      
      Hooks.once('modifyTokenAttribute', (update, actorData) => {
        let newShp = update.value;

        console.log(shp, newShp);
  
        let index = CONFIG.UTOPIA.trackedTokens.indexOf(tokenId)
        CONFIG.UTOPIA.trackedTokens.splice(index, 1);
      });
    }
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

  Hooks.on('createActiveEffect', (effect, options, userId) => { 
    console.log(effect);

    if (effect.statuses.has('blinded')) {
      let change = {
        key: "system.disfavors",
        mode: 2,
        priority: null,
        value: '{"attribute": "awa", "amount": 2}'
      }
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
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
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
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'utopia.itemMacro': true },
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
    type: 'Item',
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