import Tagify from "../../lib/tagify/tagify.esm.js";
import { addTalentToActor } from "../helpers/addTalent.mjs";

let animationId = null; // ID for the animation frame request
let databaseTalents = {}; // Holds all available talents from the database
let selected = null; // Currently selected talent name
let talents = {}; // List of talents the actor currently has
let actor = {}; // Reference to the actor object

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaTalentTreeSheet extends Application {
  availableTalents = {}; // Stores the talents available for selection
  classActor = {}; // The actor associated with this sheet
  modifying = ""; // Placeholder for any modifying state
  keepOpen = false; // Determines if the sheet should remain open after actions

  /**
   * Returns default options for the application.
   * @override
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["utopia", "talent-sheet"],
      width: 800,
      height: 900,
      title: "Talents",
      tabs: [
        {
          navSelector: '.talent-tabs',
          contentSelector: '.content',
          initial: 'warfare',
        }
      ],
    });
  }

  /**
   * Specifies the HTML template file to use for rendering the sheet.
   * @override
   */
  get template() {
    return `systems/utopia/templates/talent-tree-v1/talent-tree-sheet.hbs`;
  }

  /**
   * Prepares data to be sent to the template for rendering.
   * @override
   */
  async getData() {
    const context = super.getData();

    // Load all available talents from the compendium
    this.availableTalents = await game.packs.get('utopia.talents').getDocuments();
    databaseTalents = this.availableTalents;

    let talentList = []; // List of talent names the actor possesses
    let actorTalents = this.classActor.items.filter(i => i.type == 'talent'); // Actor's talent items

    console.log(actorTalents);

    // Populate the talent list with normalized names
    if (actorTalents.length > 0) {
      actorTalents.forEach(t => {
        let name = t.name.toLowerCase().replace(' ', '_').trim();
        if (!talentList.includes(name)) {
          talentList.push(name);
        }
      });
    }

    talents = talentList; // Update the global talents variable
    actor = this.classActor; // Set the global actor reference

    console.log(actor);

    if (!actor.system.species || jQuery.isEmptyObject(actor.system.species)) {
      ui.notifications.error("You must have a species before opening the talent tree.");
      super.close();
    }

    let species = actor.system.species.name.toLowerCase().replace(' ', '-').trim();
    context.species = { [species]: true };

    console.log(context.species);

    return context;
  }

  /**
   * Sets up event listeners and initializes the UI elements after rendering.
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Get all polygon elements representing talents
    let polys = html.find('.cls-1');
    console.log(polys);

    // Mark talents that the actor already has
    for (let item of polys) {
      let name = item.getAttribute("data-name");
      if (talents.includes(name)) {
        item.classList.add('taken');
      }
    }

    // Add event listeners for interaction with talent polygons
    html.on("mousedown", "polygon", this._animate.bind(this));
    html.on("mouseup", "polygon", this._stopAnimate.bind(this));
    html.on("mouseleave", "polygon", this._stopAnimate.bind(this));
  }

  /**
   * Initiates the animation when a talent polygon is clicked.
   * @param {Event} event - The mousedown event.
   */
  _animate(event) {
    let target = event.currentTarget;
    selected = target.dataset.name;
    if (!target.classList.contains('taken')) {
      target.classList.add('taking');

      // Start the animation if not already running
      if (!animationId) {
        startTime = null;
        animationId = window.requestAnimationFrame(animate);
      }
    }
  }

  /**
   * Stops the animation when the mouse is released or leaves the polygon.
   * @param {Event} event - The mouseup or mouseleave event.
   */
  _stopAnimate(event) {
    let target = event.currentTarget;
    target.classList.remove('taking');
    stopAnimation();
  }

  /**
   * Shows the talent sheet for the selected talent when right-clicked.
   * @param {Event} event 
   */
  _source(event) {
    let dataset = event.currentTarget.dataset;
    let name = dataset.name;
    let item = this.availableTalents.find((f) => f.name.toLowerCase().replace(' ', '_').trim() == name);
    console.log(item);
    item.sheet.render(true);
  }
}

/**
 * Updates the talent selection UI after a talent is added.
 * @param {string} talent - The name of the talent to update.
 */
async function updateTalents(talent) {
  // Add the new talent to the list if it's not already included
  if (!talents.includes(talent)) {
    talents.push(talent);
  }

  // Get all polygon elements representing talents
  let polys = document.getElementsByClassName('cls-1');
    
  // Iterate through each polygon element
  for (let item of polys) {
    // Get the name attribute of the polygon
    let name = item.getAttribute("data-name");
    // If the talent is in the list of talents, mark it as taken
    if (talents.includes(name)) {
      if (!item.classList.contains('taken')) {
        item.classList.add('taken');
      }
    }
  }
}

let startTime = null; // Timestamp when the animation started
let timestamp = null; // Current timestamp in the animation
let duration = 2000; // Total duration of the animation in milliseconds

/**
 * Stops the ongoing animation.
 */
function stopAnimation() {
  if (animationId) {
    // Cancel the ongoing animation frame request
    window.cancelAnimationFrame(animationId);
    // Reset the start time and timestamp for the animation
    startTime = null;
    timestamp = null;
    // Clear the animation ID
    animationId = null;
    // Reset the gradient stop offset to 0%
    let stop = document.getElementById('gradient-stop');
    stop.setAttribute('offset', '0%');
  }
}

/**
 * Animates the gradient or other visual effects for talent selection.
 * @param {DOMHighResTimeStamp} timestamp - The current time.
 */
function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const progress = (timestamp - startTime) / duration;

  // Check if the animation progress is near completion
  if (progress >= 0.96) {
    stopAnimation(); // Stop the animation
    select(); // Proceed with talent selection
    return; // Exit the animation loop
  }

  // Eased progress for smooth animation
  const easedProgress = easeInOutQuad(progress % 1);

  // Calculate the offset based on eased progress
  const offset = easedProgress * 100; // From 0% to 100%

  // Update the offset attribute for the gradient stop
  let stop = document.getElementById('gradient-stop');
  stop.setAttribute('offset', offset + '%');

  // Continue the animation
  animationId = window.requestAnimationFrame(animate);
}

/**
 * Easing function for animation (easeInOutQuad).
 * @param {number} t - The current time factor between 0 and 1.
 * @returns {number} - The eased value.
 */
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

/**
 * Handles the selection of a talent by the user.
 * Checks prerequisites and updates the actor's talents accordingly.
 */
async function select() {
  addTalentToActor(actor, selected);
  updateTalents(selected);
}