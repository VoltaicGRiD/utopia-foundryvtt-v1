import { createItemMacro, _handleSpeciesDrop } from "../utopia.mjs";

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

  // Add a hook that triggers when data is dropped onto an actor sheet
  Hooks.on('dropActorSheetData', function (actor, sheet, data) {
    // Retrieve the item being dropped, using its UUID from the data
    let item = game.items.get(data.uuid.split('.')[1]);

    // Check if the item is of type 'species'
    if (item.type == "species") {
      speciesDrop(actor, sheet, item);
    }

    // Check if the item is of type 'talent'
    else if (item.type == "talent") {
      talentDrop(actor, sheet, item);
    }
  });
});

function speciesDrop(actor, item) {
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

function talentDrop(actor, item) {
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
      let talentPosition = item.system.position;
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
        ui.notifications.error(`This actor does not have the prerequisite talent at position [${talentPosition - 1}] in tree '${tree}'. Set talent position to [-1] to override.`);
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