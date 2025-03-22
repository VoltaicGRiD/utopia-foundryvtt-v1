import { gatherItems } from "../../system/helpers/gatherItems.mjs";

const { api } = foundry.applications;

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class TalentBrowser extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  actor = {}; // The actor associated with this sheet
  unlockAll = false; // Determines if all talents should be unlocked
  filter = ""; // Filters the talents by name, tree, species, or points

  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'talent-browser'],
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
      template: "systems/utopia/templates/specialty/talent-browser/header.hbs",
    },
    content: {
      template: "systems/utopia/templates/specialty/talent-browser/content.hbs",
      scrollable: [''],
    },
  }

  async _prepareContext(options) {
    const trees = await gatherItems({ type: 'talentTree', gatherFromActor: false });
    const species = await gatherItems({ type: 'species', gatherFromActor: false });
    const allTrees = trees.concat(species);
    let actorSpecies = undefined;

    if (this.options.actor) {
      actorSpecies = this.options.actor.system._speciesData.name;
    }

    const actorTrees = this.options.actor.system.trees;
    const flexibilities = [];

    for (const tree of allTrees) {
      if (tree.type === "talentTree" || (actorSpecies && tree.type === 'species' && tree.name === actorSpecies) ) {
        for (var b = 0; b < tree.system.branches.length; b++) {
          const branch = tree.system.branches[b];

          for (var t = 0; t < branch.talents.length; t++) {
            const talent = branch.talents[t];
            const item = await fromUuid(talent.uuid);

            if (item) {
              branch.talents[t] = {
                ...talent,
                item: item,
              }
            }

            // Identify if this talent has flexibility enabled
            // Flexibililty allows for talents from other trees to be taken
            if (item.system.flexibility.enabled) 
              flexibilities.push(item.system.flexibility)

            if (this.unlockAll) continue;

            // Available has 3 states:
            // - unlocked: The talent is able to be taken
            // - locked: The talent is locked and cannot be taken
            // - taken: The talent is already taken
            if (actorTrees[tree.name]) {
              if (actorTrees[tree.name][b] === t - 1) 
                branch.talents[t].available = "available";
              else if (actorTrees[tree.name][b] >= t) 
                branch.talents[t].available = "taken";
              else 
                branch.talents[t].available = "unavailable";
            }
          };
        }
      }
      else {
        allTrees.splice(allTrees.indexOf(tree), 1);
      }
    }

    // Remove all empty branches
    for (const tree of allTrees) {
      tree.system.branches = tree.system.branches.filter(branch => branch.talents.length > 0);
    }

    // Remove all empty trees
    const filteredTrees = allTrees.filter(tree => tree.system.branches.length > 0);

    // Add all trees that meet flexibilities
    for (const flex of flexibilities) {
      switch (flex.category) {
        case "species": 
          break;
        case "subspecies":
          break;
      }
    }

    const context = {
      trees: filteredTrees,
    }

    console.log(this, context);

    this.availableTalents = filteredTrees.reduce((acc, tree) => {
      for (const branch of tree.system.branches) {
        acc.push(...branch.talents);
      }
      return acc;
    }
    , []);

    return context;
  }

  #searchFilter = new SearchFilter({
    inputSelector: 'input[name="filter"]',
    contentSelector: '.skill-grid',
    callback: this._filter.bind(this),
  });

  _onRender(context, options) {
    try {
      // if (options.parts.includes('header')) {
      //   this.element.querySelector('[data-action="unlockAll"]').addEventListener('click', this._unlockAll.bind(this)); 
      //   this.#searchFilter.bind(this.element);
      // };

      this.element.querySelectorAll('.skill').forEach(skill => {
        skill.addEventListener('mouseover', async (event) => {
          let content = await renderTemplate('systems/utopia/templates/specialty/talent-browser/tooltip.hbs', { 
            talent: this.availableTalents.find(t => t.id === event.target.dataset.talent),
          });
          let element = document.createElement('div');
          element.innerHTML = content;
          game.tooltip.activate(event.target, { direction: 'RIGHT', cssClass: "utopia", content: element });
        });
        skill.addEventListener('mouseout', (event) => {
          game.tooltip.deactivate();
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  static async _onTalentClick(event, target) {
    const id = target.dataset.talent;
    const tree = target.dataset.tree;
    const available = target.dataset.available;
    
    if (available === "available")
      await this.options.actor.addTalent(id, tree);

    this.render();
  }

  static async _unlockAll(event) {
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