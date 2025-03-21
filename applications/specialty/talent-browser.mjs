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
      template: "systems/utopia/templates/specialty/talent-browser-header.hbs",
    },
    content: {
      template: "systems/utopia/templates/specialty/talent-browser-content.hbs",
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

    for (const tree of allTrees) {
      if (tree.type === "talentTree" || (actorSpecies && tree.type === 'species' && tree.name === actorSpecies) ) {
        for (const branch of tree.system.branches) {
          branch.talents = await Promise.all(branch.talents.map(async (talent) => {
            return {
              ...talent,
              item: await fromUuid(talent.uuid) || {},
              unlocked: true,
              availble: true,
            };
          }));
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

    const context = {
      trees: filteredTrees,
    }

    console.log(this, context);

    return context;
  }

  #searchFilter = new SearchFilter({
    inputSelector: 'input[name="filter"]',
    contentSelector: '.skill-grid',
    callback: this._filter.bind(this),
  });

  async _onRender(context, options) {
    try {
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
      });
    } catch (error) {
      console.error(error);
    }
  }

  static async _onTalentClick(event) {
    const id = event.target.dataset.talent;
    await this.options.actor.addTalent(id);
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