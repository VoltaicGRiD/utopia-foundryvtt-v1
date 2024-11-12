// Import document classes.
import { UtopiaActor } from './documents/actor.mjs';
import { UtopiaItem } from './documents/item.mjs';
// Import sheet classes.
import { UtopiaActorSheet } from './sheets/actor-sheet.mjs';
import { UtopiaItemSheet } from './sheets/item-sheet.mjs';
import { UtopiaOptionsSheet } from './sheets/options-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { UTOPIA } from './helpers/config.mjs';
import isNumeric from './helpers/numeric.mjs';
import searchTraits from './helpers/searchTraits.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.utopia = {
    UtopiaActor,
    UtopiaItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.UTOPIA = UTOPIA;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '3d6 + @traits.agi.subtraits.spd.mod',
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = UtopiaActor;
  CONFIG.Item.documentClass = UtopiaItem;

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('utopia', UtopiaActorSheet, {
    makeDefault: true,
    label: 'UTOPIA.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('utopia', UtopiaItemSheet, {
    makeDefault: true,
    label: 'UTOPIA.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
  
  // Add a hook that triggers when data is dropped onto an actor sheet
  Hooks.on('dropActorSheetData', function(actor, sheet, data) {
    // Retrieve the item being dropped, using its UUID from the data
    let item = game.items.get(data.uuid.split('.')[1]);

    // Log the 'item' variable for debugging purposes
    console.log(item);

    // Check if the item is of type 'species'
    if (item.type == "species") {
      // Check if the actor already has an item of type 'species'
      if (actor.items.contents.some(i => i.type == "species")) {
        // Display an error notification to the user
        ui.notifications.error("This actor already has a species. Remove it first to apply this one.");
        // Prevent the drop action
        return false;
      } else {
        // Handle the species drop action (custom function)
        _handleSpeciesDrop(actor, item);
        // Allow the drop action to proceed
        return true;
      }
    }
    // Check if the item is of type 'talent'
    else if (item.type == "talent") {
      // If the talent's position is -1, allow the drop without prerequisites
      if (item.system.position == -1) {
          return true;
      } 
      else {
        // Get the talent tree the item belongs to
        let tree = item.system.tree;
        // Get the actor's existing talent trees
        let actorTrees = actor.system.trees;

        console.log(actorTrees);

        // Check if the actor has the talent tree
        if (actorTrees[tree] !== undefined) {
          // Get the current position in the talent tree
          let position = actorTrees[tree];
          // Get this talent's position
          let talentPosition = item.system.position
          // Check if the item's position is one more than the actor's position (prerequisite check)
          if (talentPosition - 1 === position) {
            // Create a new trees object by copying existing trees and adding the new tree with this talent's position
            let newTrees = { ...actorTrees, [tree]: talentPosition };

            // Update the actor's talent trees
            actor.update({
              "system.trees": newTrees
            });            
           
            // Allow the drop action to proceed
            return true;
          } 
          else {
            // Display an error notification about missing prerequisite
            ui.notifications.error(`This actor does not have the prerequisite talent at position [${talentPosition -1}] in tree '${tree}'. Set talent position to [-1] to override.`);
            // Prevent the drop action
            return false;
          }
        } 
        else {
          // The actor does not have this talent tree, so initialize it
          // Create a new trees object by copying existing trees and adding the new tree with position 1
          let newTrees = { ...actorTrees, [tree]: 1 };

          // Update the actor's talent trees
          actor.update({
              "system.trees": newTrees
          });

          // Allow the drop action to proceed after initializing the tree
          return true;
        }
      }
    }
  });
});


/* -------------------------------------------- */
/*  Actor - Item interaction                    */
/* -------------------------------------------- */

/**
 * Update actor data with necessary information from the item that
 * was dropped on the actor sheet.
 * @param {Object} actor 
 * @param {Object} item 
 */
async function _handleSpeciesDrop(actor, item) {
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
          system: {
            traits: {
              [trait]: {
                subtraits: {
                  [parsed]: {
                    gifted: true
                  }
                }
              }    
            }
          }
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
async function createItemMacro(data, slot) {
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
  return false;
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