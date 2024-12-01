/**
 * Handles the selection of a talent by the user.
 * Checks prerequisites and updates the actor's talents accordingly.
 *
 * @param {Object} actor - The actor object.
 * @param {string} selected - The selected talent name.
 */
export async function addTalentToActor(actor, selected) {
  // Retrieve all talents from the 'utopia.talents' compendium
  let databaseTalents = await game.packs.get('utopia.talents').getDocuments();

  // Find the corresponding talent item from the database
  let item;

  // Find the talent in the database
  try {
    item = databaseTalents.find((f) => f.name.toLowerCase().replace(' ', '_').trim() == selected);
  } catch (e) {
    ui.notifications.error("Talent not found in the database.");
    return
  }

  console.log(actor, selected, item, databaseTalents);

  // We need to check all of the following:
  // 1. Actor has enough talent points
  // 2. Talent is the first in the tree [or] Actor has the prerequisite talent
  // 3. Talent is not already acquired

  // Does the actor already have this talent?
  if (checkAlreadyAcquired(actor, selected)) {
    // Talent already acquired
    ui.notifications.error("You already have that talent.");
    return;
  }

  // Does the actor have enough talent points?
  // Calculate the cost of the talent based on its point values
  let points = item.system.points;
  let cost = points.body + points.mind + points.soul;  
  let actorPoints = actor.system.points.talent;
  if (actorPoints < cost) {
    // Not enough talent points to add the talent
    ui.notifications.error("This actor does not have enough talent points to add a talent.");
    return;
  }

  // Is the talent the first in it's tree?
  let talentPosition = item.system.position;
  if (talentPosition == 1)
  {
    // First talent in the tree
    await checkForChoices(actor, item);
    return;
  } else {
    // Talent is not the first in the tree
    let tree = item.system.tree;
    let treePosition = actor.system.trees[tree];
    if (treePosition == talentPosition - 1) {
      // Actor has the prerequisite talent
      await checkForChoices(actor, item);
      return;
    } else {
      // Actor does not have the prerequisite talent
      ui.notifications.error("You do not have the prerequisite talent for this talent.");
      return;
    }
  }
}

export function checkForChoices(actor, item) {
  let choices = item.system.choices;
  if (choices.length > 0) {
    // Talent has choices
    let data = {
      actor: actor,
      item: item
    }
    renderChoices(data);
  } else {
    // Talent has no choices
    createTalent(actor, item, true);
  }
}

export function renderChoices(data) {
  let template = "systems/utopia/templates/talent/choices.hbs";
  let html = renderTemplate(template, data);
  let dialog = new Dialog({
    title: "Talent Choices",
    content: html,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Submit",
        callback: (html) => {
          submitChoices(html, data);
        }
      }
    }
  });
  dialog.render(true);
}

export function submitChoices(html, data) {
  let choice;
  html.find('.choice').each((i, c) => {
    if (c.checked) {
      choice = c.value;
    }
  });

  let item = data.item;
  item.update({ ['system.choices']: choices });
  item.update({ ['name']: `${item.name} (${choices})` });
  createTalent(data.actor, item, true);
}

/**
 * Applies the talent to the actor and updates their points.
 * @param {Actor} actor 
 * @param {Item} item 
 * @param {boolean} createTree
 */
export function createTalent(actor, item, createTree) {
  // Create the talent item
  let data = [item];
  Item.createDocuments(data, { parent: actor });

  // Deduct the cost of the talent from the actor's talent points
  let cost = item.system.points.body + item.system.points.mind + item.system.points.soul;
  let newPoints = actor.system.points.talent - cost;
  actor.update({ ["system.points.talent"]: newPoints });

  // Update the actor's body, mind, and soul points
  let body = item.system.points.body;
  let mind = item.system.points.mind;
  let soul = item.system.points.soul;
  actor.update({ 
    ['system.points.body']: actor.system.points.body + body,
    ['system.points.mind']: actor.system.points.mind + mind,
    ['system.points.soul']: actor.system.points.soul + soul
  });

  // Update the actor's talent tree if necessary
  if (createTree) {
    let tree = item.system.tree;
    let newTree = { [tree]: 1 };
    let newTrees = { ...actor.system.trees, ...newTree };
    actor.update({ "system.trees": newTrees });
  }

  // Update the actor's talent tree positions
  updateActorTrees(actor, item);
}

/**
 * Updates the actor's talent tree positions.
 * @param {Actor} actor 
 * @param {Item} item 
 */
function updateActorTrees(actor, item) {
  let tree = item.system.tree;
  let talentPosition = item.system.position;
  let treePosition = actor.system.trees[tree];

  if (talentPosition > treePosition) {
    let newTree = { [tree]: talentPosition };
    let newTrees = { ...actor.system.trees, ...newTree };
    actor.update({ "system.trees": newTrees });
  }
}

/**
 * Applies the talent to the actor and updates thier points without spending any talent points.
 * @param {Actor} actor 
 * @param {Talent} item 
 */
export function createTalentNoCost(actor, item) {
  // Create the talent item
  let data = [item];
  Item.createDocuments(data, { parent: actor });

  // Update the actor's body, mind, and soul points
  let body = item.system.points.body;
  let mind = item.system.points.mind;
  let soul = item.system.points.soul;
  actor.update({ 
    ['system.points.body']: actor.system.points.body + body,
    ['system.points.mind']: actor.system.points.mind + mind,
    ['system.points.soul']: actor.system.points.soul + soul
  });
}

function checkAlreadyAcquired(actor, selected) {
  let talentList = [];
  let actorTalents = actor.items.filter((i) => i.type == 'talent');
  actorTalents.forEach((t) => {
    let name = t.name.toLowerCase().replace(' ', '_').trim();
    if (!talentList.includes(name)) {
      talentList.push(name);
    }
  });

  return talentList.includes(selected);
}