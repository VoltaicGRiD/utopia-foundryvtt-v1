const { api } = foundry.applications;
import { addTalentToActor } from "../../helpers/addTalent.mjs";
import { traitLongNames, traitShortNames } from "../../helpers/actorTraits.mjs";

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaTalentTreeSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  actor = {}; // The actor associated with this sheet
  unlockAll = false; // Determines if all talents should be unlocked
  filter = ""; // Filters the talents by name, tree, species, or points

  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'talent-tree-sheet'],
    window: {
      resizeable: true,
      title: `Talent Tree`,
    },
    position: {
      width: 800,
      height: 900,
    },
    actions: {
      unlockAll: this._unlockAll,
      tabClick: this._onTabClick,
      talentClick: this._onTalentClick,
    },
    id: "talent-tree-{id}",
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/other/talent-tree/header.hbs",
    },
    content: {
      template: "systems/utopia/templates/other/talent-tree/content.hbs",
      scrollable: [''],
    },
  }

  async _prepareContext(options) {
    var context = {
      talents: [],
      talentTrees: [],
      actor: this.actor,
      species: this.actor.system.species,
      gm: game.user.isGM,
      filter: this.filter,
    };
    
    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    if (partId === 'content') {
      var allGameTalents = await game.packs.get('utopia.talents').getDocuments();
      var talentFolders = game.packs.get('utopia.talents').folders;
  
      var allGenericTalents = allGameTalents.filter(t => !t.system.isSpecies).map(t => {
        const longNames = Object.keys(traitLongNames);
        longNames.forEach((long, short) => {
          const re = new RegExp(long.capitalize(), 'g');
          const newDescription = t.system.description.replace(re, "<span class='trait'>[$&]</span>");
          return t.system.description = newDescription;
        });
  
        return {
          body: t.system.points.body,
          mind: t.system.points.mind,
          soul: t.system.points.soul,
          img: t.img,
          safeName: t.name.toLowerCase().replace(' ', '_').trim(),
          name: t.name, 
          id: t.id,
          tree: t.system.tree,
          position: t.system.position,
          available: "locked",
          description: t.system.description,
        }
      });
  
      var allSpeciesTalents = allGameTalents.filter(t => t.system.isSpecies).map(t => {
        const longNames = Object.keys(traitLongNames);
        longNames.forEach((long, short) => {
          const re = new RegExp(long.capitalize(), 'g');
          const newDescription = t.system.description.replace(re, "<span class='trait'>[$&]</span>");
          return t.system.description = newDescription;
        });
  
        return {
          body: t.system.points.body,
          mind: t.system.points.mind,
          soul: t.system.points.soul,
          img: t.img,
          safeName: t.name.toLowerCase().replace(' ', '_').trim(),
          name: t.name,
          id: t.id,
          tree: t.system.tree,
          position: t.system.position,
          available: "locked",
          description: t.system.description,
        }
      });
  
      let allTalents;
  
      if (this.unlockAll) {
        allGenericTalents = allGenericTalents.map(t => {
          return {
            ...t,
            available: "available",
          }
        });
        allSpeciesTalents = allSpeciesTalents.map(t => {
          return {
            ...t,
            available: "available",
          }
        });
        allTalents = allGenericTalents.concat(allSpeciesTalents);
      }
      else {
        if (!this.actor) {
          allTalents = allGenericTalents.concat(allSpeciesTalents);
          allTalents = allTalents.map(t => {
            return {
              ...t,
              available: "available",
            }
          });
        } 
        else {
          let actorSpeciesTalents = allSpeciesTalents.filter(t => {
            let match = false;
            let parentSpecies = this.actor.system.species.name.toLowerCase().split(' ')[1];
            let species = this.actor.system.species.name.toLowerCase().replace(' ', '_');
            let parentTree = t.tree.split('-')[0];
            if (parentSpecies === parentTree.toLowerCase())
              match = true;
            if (species === t.tree.toLowerCase().replace(' ', '_'))
              match = true;
            return match;
          });
          allTalents = allGenericTalents.concat(actorSpeciesTalents);
  
          let actorTalents = this.actor.items.filter(i => i.type === 'talent');
          let actorTalentIds = actorTalents.map(t => t.id);
          let actorTrees = this.actor.system.trees;
          let actorTreeKeys = Object.keys(actorTrees);
          allTalents = allTalents.map(t => {
  
            let available = "locked";
            if (actorTalentIds.includes(t.id)) { available = "taken" }
            if (actorTreeKeys.includes(t.tree) && actorTrees[t.tree] == t.position - 1) { available = "available" }
            if (!actorTreeKeys.includes(t.tree) && t.position === 1) { available = "available" }
            if (actorTreeKeys.includes(t.tree) && actorTrees[t.tree] > t.position - 1) { available = "taken" }
  
            return {
              ...t,
              available: available,
            }
          });
        }
      }
  
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
  
      allTalents = allTalents.filter(t => {
        let match = false;
        if (this.filter.length > 0) {
          if (t.tree.toLowerCase().includes(this.filter)) { match = true; }
          if (t.name.toLowerCase().includes(this.filter)) { match = true; }
          if (['available', 'unlocked', 'ready', 'next'].some(s => this.filter.includes(s)) && t.available === 'available') { match = true; }
          if (['locked'].some(s => this.filter.includes(s)) && t.available === 'locked') { match = true; }
          if (['taken'].some(s => this.filter.includes(s)) && t.available === 'taken') { match = true; }
          if (t.description.toLowerCase().includes(this.filter)) { match = true; }
          
          // Matches groups with (point name) (operator) (point value)
          let pointsRe = new RegExp(/([a-zA-Z]{4,})\s?([=><]+)\s?(\d+)/gi);

          if (this.filter.match(pointsRe)) {

            let matches = [...this.filter.matchAll(pointsRe)];
            matches.forEach(m => {
              let alternativeNames = ["cost", "points", "point"];
              let pointName = m[1]; // 'body', 'mind', or 'soul'
              let operator = m[2];  // '=', '>', or '<'
              let pointValue = parseInt(m[3]); // The value to compare against
              let actualValue;
  
              // Check if the point name is an alternative name
              if (alternativeNames.includes(pointName)) {
                actualValue = t[body] + t[mind] + t[soul]; // Sum of all points
              }
              else {
                actualValue = t[pointName]; // Dynamic property access
              }
          
              // Map operators to their corresponding comparison functions
              const operators = {
                '=': (a, b) => a === b,
                '==': (a, b) => a === b,
                '===': (a, b) => a === b,
                '>': (a, b) => a > b,
                '<': (a, b) => a < b,
                '>=': (a, b) => a >= b,
                '<=': (a, b) => a <= b
              };
          
              // Perform the comparison using the operator
              if (operators[operator](actualValue, pointValue)) {
                match = true;
              }
            });
          }
        }
        else {
          match = true;
        }
        return match;
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
        var color = talentFolders.find(f => f.name.toLowerCase() === parentTree.toLowerCase()).color.css;
        if (!allTalentTrees[parentTree]) {
          allTalentTrees[parentTree] = {};
          allTalentTrees[parentTree].color = color;
        }
        color = talentFolders.find(f => f.name.toLowerCase() === treeName.toLowerCase()).color.css;
        if (!allTalentTrees[parentTree][treeColumn]) {
          allTalentTrees[parentTree][treeColumn] = {};
          allTalentTrees[parentTree][treeColumn].color = color;
        }
        allTalentTrees[parentTree][treeColumn][t.position] = t;
      });
  
      this.availableTalents = allTalents;
  
      context.talents = allTalents;
      context.talentTrees = allTalentTrees;
    }
    
    return context;
  }

  #searchFilter = new SearchFilter({
    inputSelector: 'input[name="filter"]',
    contentSelector: '.skill-grid',
    callback: this._filter.bind(this),
  });

  async _onRender(context, options) {
    if (options.parts.includes('header')) {
      this.element.querySelector('[data-action="unlockAll"]').addEventListener('click', this._unlockAll.bind(this)); 
      this.#searchFilter.bind(this.element);
    };

    this.element.querySelectorAll('.skill').forEach(skill => {
      skill.addEventListener('mouseover', async (event) => {
        let content = await renderTemplate('systems/utopia/templates/other/talent-tree/tooltip.hbs', { 
          talent: this.availableTalents.find(t => t.id === event.target.dataset.talent),
        });
        let element = document.createElement('div');
        element.innerHTML = content;
        game.tooltip.activate(event.target, { direction: 'RIGHT', cssClass: "utopia", content: element });
      });
      skill.addEventListener('mouseout', (event) => {
        game.tooltip.deactivate();
      });
      skill.addEventListener('click', this._onTalentClick.bind(this));
    });
  }

  async _onTalentClick(event) {
    const id = event.target.dataset.talent;
    await addTalentToActor(this.actor, id);
    this.render();
  }

  async _unlockAll(event) {
    this.unlockAll = !this.unlockAll;
    this.render();
  }

  /**
   * @param {KeyboardEvent} event   The key-up event from keypboard input
   * @param {string} query          The raw string input to the search field
   * @param {RegExp} rgx            The regular expression to test against
   * @param {HTMLElement} html      The HTML element which should be filtered
   */
  async _filter(event, query, rgx, html) {
    if (!this.rendered) return;
    this.filter = query;
    this.render({ parts: ['content'] });
  }
}