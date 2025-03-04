const { api } = foundry.applications;

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
  let originalItem = undefined;

  // Find the talent in the database
  try {
    // If no match, try to match id
    originalItem = originalItem ? originalItem : databaseTalents.find((f) => f.id == selected);
  } catch (e) {
    ui.notifications.error("Talent not found in the database.");
    return
  }

  // Clone the original item to avoid modifying the database
  let item = originalItem.toObject();

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
  let cost = parseInt(points.body) + parseInt(points.mind) + parseInt(points.soul);  
  let actorPoints = actor.system.points.talent.total;
  console.log("Cost: ", cost, "Actor Points: ", actorPoints);
  if (actorPoints < cost) {
    // Not enough talent points to add the talent
    ui.notifications.error("This actor does not have enough talent points to add a talent.");
    return;
  }

  // Is the talent the first in it's tree?
  let talentTier = item.system.tier;
  if (talentTier == 1)
  {
    // First talent in the tree
    await checkForChoices(actor, item);
    return;
  } else {
    // Talent is not the first in the tree
    let tree = item.system.tree;
    let branch = item.system.branch;
    let treePosition = actor.system.trees[tree][branch];
    if (treePosition == talentTier - 1) {
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

/**
 * Checks if a talent has choices to be made and handles the selection process.
 * If choices are required, presents them to the user; otherwise, directly creates the talent.
 *
 * @param {Actor} actor - The actor to which the talent may be added.
 * @param {Item} item - The talent item being considered.
 */
export async function checkForChoices(actor, item) {
  let itemChoices = item.system.choices;
  
  if (itemChoices.length > 0) {
    // Talent requires the user to make choices
    let category = item.system.category;

    // Retrieve choices already made by the actor in this category
    let alreadyChosenSet = await getActorChoices(actor, category);
    let alreadyChosen = [...alreadyChosenSet];

    // Prepare data for rendering the choices dialog
    const data = {
      // Exclude choices the actor has already taken
      choices: itemChoices.filter((c) => !alreadyChosen.includes(c)),
      alreadyTaken: alreadyChosen,
      item: item,
      actor: actor,
    };
    
    console.log("Data: ", data);

    // Render the choices dialog for the user
    await renderChoices(data);
  } else {
    // Talent does not require choices, create it directly
    await createTalent(actor, item, true);
  }
}

/**
 * Retrieves the choices the actor has already made for a specific talent category.
 *
 * @param {Actor} actor - The actor whose choices are being retrieved.
 * @param {string} category - The talent category to check.
 * @returns {Array} An array of choices the actor has already taken.
 */
export async function getActorChoices(actor, category) {
  // Get all talent items the actor possesses
  let actorItems = actor.items.filter((i) => i.type == 'talent');
  // Filter talents by the specified category
  let actorChoices = actorItems.filter((i) => i.system.category == category);
  let choices = [];
  // Extract the choices from each talent item
  actorChoices.forEach((c) => {
    choices.push([...c.system.choices][0]);
  });
  console.log("Actor already owned choices: ", choices);
  return choices;
}

/**
 * Renders the dialog allowing the user to select from available choices.
 *
 * @param {Object} data - Contains available choices and choices already taken.
 */
export async function renderChoices(data) {
  let template = "systems/utopia/templates/dialogs/talent-choices.hbs";
  // Render the HTML content using the specified template and data
  let html = await renderTemplate(template, data);
  // Create a new dialog for choice selection
  let dialog = await new api.DialogV2({
    window: {
      title: "Talent Choices",
    },
    content: html,
    buttons: [{
      default: true,
      action: "choice",
      icon: 'fas fa-check',
      label: "Make choice (permanent)",
      // Callback to retrieve the selected choice value from the form
      callback: async (event, button, dialog) => await button.form.elements.choices.value
    }],
    // Handle the submission of the dialog
    submit: async result => {
      console.log(result)
      await submitChoices(result, data);
    }
  });

  await dialog.render(true);
}

/**
 * Processes the user's selected choice and creates the talent item accordingly.
 *
 * @param {string} choice - The choice selected by the user.
 * @param {Object} data - Contains the talent item and actor information.
 */
export async function submitChoices(choice, data) {
  let item = data.item;
  console.log("Choice: ", choice); 
  console.log("Data: ", data);

  // Set the selected choice on the item's system data
  item.system.choices = choice;
  // Append the chosen option to the item's name
  item.name = `${item.name} (${choice})`;

  console.log(item);
  // Create the talent item for the actor
  await createTalent(data.actor, item, true);
}

/**
 * Applies the talent to the actor and updates their points.
 * @param {Actor} actor 
 * @param {Item} item 
 * @param {boolean} createTree
 */
export async function createTalent(actor, item, createTree) {
  // Create the talent item
  let data = [item];
  await actor.createEmbeddedDocuments('Item', data);

  // Update the talent tree window
  // App insances is a Map(), we need to put it into an array to access the keys
  let appInstances = Array.from(foundry.applications.instances);
  appInstances.forEach((a) => {
    if (a[1].constructor.name == "UtopiaTalentTreeSheet") {
      a[1].render();
    }
  });
}

/**
 * Applies the talent to the actor and updates thier points without spending any talent points.
 * @param {Actor} actor 
 * @param {Talent} item 
 */
export async function createTalentNoCost(actor, item) {
  // Create the talent item
  let data = [item];
  
  // TODO: Implement choice handling for no-cost talents
  await Actor.createEmbeddedDocuments('Item', data);
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