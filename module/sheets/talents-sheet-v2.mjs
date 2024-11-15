import Tagify from "../../lib/tagify/tagify.esm.js";

let animationId = null;
let databaseTalents = {};
let selected = null;
let talents = {};
let actor = {};

export class UtopiaTalentSheetV2 extends Application {
  availableTalents = {};
  classActor = {};
  modifying = "";
  keepOpen = false;

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["utopia", "sheet"],
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

  /** @override */
  get template() {
    return `systems/utopia/templates/talents-sheet-v2.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    this.availableTalents = await game.packs.get('utopia.talents').getDocuments();
    databaseTalents = this.availableTalents;

    let talentList = [];

    let actorTalents = this.classActor.items.filter(i => i.type == 'talent');
    actorTalents.forEach(t => {
      let name = t.name.toLowerCase().replace(' ', '_').trim();
      if (!talentList.includes(name)) {
        talentList.push(name);
      }
    });

    talents = talentList;
    actor = this.classActor;
    
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let polys = document.getElementsByClassName('cls-1');
    
    console.log(polys);

    for (let item of polys) {
      let name = item.getAttribute("data-name");
      if (talents.includes(name)) {
        item.classList.add('taken');
      }
    }

    html.on("mousedown", "polygon", this._animate.bind(this));
    html.on("mouseup", "polygon", this._stopAnimate.bind(this));
    html.on("mouseleave", "polygon", this._stopAnimate.bind(this));

    html.on("contextmenu", "polygon", this._source.bind(this));
  }

  async _animate(event) {
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

  async _stopAnimate(event) {
    let target = event.currentTarget;
    target.classList.remove('taking');
    stopAnimation();
  }

  async _source(event) {
    let dataset = event.currentTarget.dataset;
    let name = dataset.name;
    let item = this.availableTalents.find((f) => f.name.toLowerCase().replace(' ', '_').trim() == name);
    console.log(item);
    item.sheet.render(true);
  }
}

async function updateTalents(talent) {
  
  if (!talents.includes(talent)) {
    talents.push(talent);
  }

  let polys = document.getElementsByClassName('cls-1');
    
  for (let item of polys) {
    let name = item.getAttribute("data-name");
    if (talents.includes(name)) {
      if (!item.classList.contains('taken')) {
        item.classList.add('taken');
      }
    }
  }
}

let startTime = null;
let timestamp = null;
let duration = 2000;

function stopAnimation() {
  window.cancelAnimationFrame(animationId);
  startTime = null;
  timestamp = null;
  animationId = null;
  let stop = document.getElementById('gradient-stop');
  stop.setAttribute('offset', '0%');
}

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let progress = elapsed / duration;

    // Loop the animation indefinitely
    if (progress >= 0.96) {
      progress = 1;
      startTime = null; // Reset startTime for continuous loop

      stopAnimation();
      select();
      return;
    }

    // Apply the easing function
    const easedProgress = easeInOutQuad(progress % 1);

    // Calculate the offset based on eased progress
    const offset = easedProgress * 100; // From 0% to 100%

    // Update the offset attribute
    let stop = document.getElementById('gradient-stop');
    stop.setAttribute('offset', offset + '%');

    console.log(stop, offset);

    // Continue the animation
    animationId = window.requestAnimationFrame(animate);
}

// Easing function (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

async function select() {
  let option = selected;
  console.log(databaseTalents);
  let item = databaseTalents.find((f) => { 
    let name = f.name.toLowerCase().replace(' ', '_').trim();
    return name == option
  });
  console.log(item);
  let points = item.system.points;
  let cost = points.body + points.mind + points.soul;

  console.log("Cost: ", cost);

  if (actor.system.points.talent >= cost) {
    let talentPosition = item.system.position;
    let tree = item.system.tree;
    let data = [item];

    if (talentPosition == -1) {
      let created = await Item.createDocuments(data, {
        parent: actor,
      });

      let newPoints = actor.system.points.talent - cost;
      actor.update({
        "system.points.talent": newPoints,
      });

      updateTalents(selected);
    } 
    else {
      let treePosition = actor.system.trees[tree];

      if (treePosition !== undefined) {
        if (talentPosition - 1 === treePosition) {
          let newTree = { [tree]: talentPosition };
          let newTrees = { ...actor.system.trees, ...newTree };

          actor.update({
            "system.trees": newTrees,
          });

          let created = await Item.createDocuments(data, {
            parent: actor,
          });

          let newPoints = actor.system.points.talent - cost;
          actor.update({
            "system.points.talent": newPoints,
          });

          updateTalents(selected);
        } 
        else if (talentPosition <= treePosition) {
          ui.notifications.error("You already have that talent.");
          return;
        } 
        else {
          ui.notifications.error(
            `You do not have the prerequisite talent to take this talent from the '${tree}' talent tree.`
          );
          return;
        }
      } 
      else {
        // The actor does not have this talent tree, so initialize it
        // Create a new trees object by copying existing trees and adding the new tree with position 1
        let newTree = { [tree]: 1 };
        let newTrees = { ...actor.system.trees, ...newTree };

        console.log(newTrees);

        // Update the actor's talent trees
        actor.update({
          "system.trees": newTrees,
        });

        let created = await Item.createDocuments(data, {
          parent: actor,
        });

        let points = actor.system.points.talent - cost;
        actor.update({
          "system.points.talent": points,
        });

        updateTalents(selected);
      }
    }
  } 
  else {
    ui.notifications.error(
      "This actor does not have enough talent points to add a talent. Duh..."
    );
  }
}