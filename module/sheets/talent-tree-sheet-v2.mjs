const { api } = foundry.applications;
import { addTalentToActor } from "../helpers/addTalent.mjs";

let animationId = null; // ID for the animation frame request
let selected = null; // Currently selected talent name
let talents = {}; // List of talents the actor currently has

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaTalentTreeSheetV2 extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  availableTalents = {}; // Stores the talents available for selection
  actor = {}; // The actor associated with this sheet
  modifying = ""; // Placeholder for any modifying state
  keepOpen = false; // Determines if the sheet should remain open after actions
  shownTrees = ["Warfare-1", "Warfare-2", "Warfare-3"];

  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'talent-tree-sheet'],
    window: {
      resizeable: true,
      title: "Talents",
    },
    position: {
      width: 800,
      height: 900,
    },
    actions: {
      tabClick: this._onTabClick,
    },
    tabs: [
      'warfare',
      'tactics',
      'prowess',
      'magecraft',
      'innovation',
      'influence',
      'species',
    ]
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/talent-tree-v2/header.hbs",
    },
    content: {
      template: "systems/utopia/templates/talent-tree-v2/content.hbs",
      scrollable: [''],
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "content"];
  }

  async _prepareContext(options) {
    var allGameTalents = await game.packs.get('utopia.talents').getDocuments();
    var allTalents = allGameTalents.map(t => {
      return {
        img: t.img,
        safeName: t.name.toLowerCase().replace(' ', '_').trim(),
        name: t.name,
        id: t.id,
        tree: t.system.tree,
        position: t.system.position,
      }
    });

    allTalents.sort((a, b) => {
      if (a.tree < b.tree) {
        return -1;
      } else if (a.tree > b.tree) {
        return 1;
      } else {
        return a.position - b.position;
      }
    });

    allTalents.sort((a, b) => {
      return a.position - b.position;
    });

    // Each talent above has a tree name that is formatted as "Tree-TreeColumn"
    // We need to add those talents to a parent tree-treeColumn object
    // And then, we need to add those objects to a parent object that is just the Tree
    // Tree { Tree-1: { Tree-1 Talents }, Tree-2: { Tree-2 Talents }, Tree-3: { Tree-3 Talents } }

    var allTalentTrees = {};
    allTalents.forEach(t => { 
      var treeName = t.tree; // Get the name of the tree
      var treeColumn = treeName.split('-')[1]; // Get the column of the tree
      var parentTree = treeName.split('-')[0]; // Get the parent tree name
      if (treeColumn === undefined) { // Subspecies trees don't have a column, but we can get their parent species by splitting the name of the tree by a space, and getting the second value
        treeColumn = treeName.split(' ')[0];
        parentTree = treeName.split(' ')[1];
      }
      if (!allTalentTrees[parentTree]) {
        allTalentTrees[parentTree] = {};
      }
      if (!allTalentTrees[parentTree][treeColumn]) {
        allTalentTrees[parentTree][treeColumn] = [];
      }
      allTalentTrees[parentTree][treeColumn].push(t);
    });

    var context = {
      talents: allTalents,
      talentTrees: allTalentTrees,
      actor: this.actor,
      species: this.actor.system.species,
      trees: this.shownTrees,
    };
    
    console.log(context);

    return context;
  }

  async _onTabClick(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let tab = tab.dataset.tab;
    
    this.shownTrees = [];

    switch(tab) {
      case 'warfare':
        this.shownTrees.push('Warfare-1');
        this.shownTrees.push('Warfare-2');
        this.shownTrees.push('Warfare-3');
        break;
    }
  }
}