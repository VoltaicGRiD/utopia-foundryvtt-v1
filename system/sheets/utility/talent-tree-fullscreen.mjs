const { api } = foundry.applications;
import { addTalentToActor } from "../../helpers/addTalent.mjs";
import { gatherTalents } from "../../helpers/gatherTalents.mjs";

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaTalentTreeFullscreenSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  actor = {}; // The actor associated with this sheet
  unlockAll = false; // Determines if all talents should be unlocked
  filter = ""; // Filters the talents by name, tree, species, or points

  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'talent-tree-fullscreen-sheet'],
    window: {
      resizeable: false,
      title: `Talent Tree`,
    },
    position: {
      width: "100vw",
      height: "100vh",
    },
    actions: {
      unlockAll: this._unlockAll,
      tabClick: this._onTabClick,
      talentClick: this._onTalentClick,
    },
    id: "talent-tree-{id}",
  };

  static PARTS = {
    // header: {
    //   template: "systems/utopia/templates/other/talent-tree-fullscreen/header.hbs",
    // },
    content: {
      template: "systems/utopia/templates/other/talent-tree-fullscreen/content.hbs",
      scrollable: [''],
    },
  }

  async _prepareContext(options) {
    var context = {
      actor: options.actor ?? {},
      species: options.actor?.system.species ?? "",
      gm: game.user.isGM,
      filter: options.filter ?? {},
    };

    const allTalents = await gatherTalents();
    context.talents = allTalents.map(t => {
      return {
        name: t.name,
        folder: t.folder,
        tree: t.system.tree,
        branch: t.system.branch,
        tier: t.system.tier,
        body: t.system.points.body,
        mind: t.system.points.mind,
        soul: t.system.points.soul,
        automated: t.effects.size > 0 || t.system.automated,
        description: t.system.description
      }
    })

    const trees = {};
    const branches = {};
    context.talents.forEach(t => {
      const treeKeys = Object.keys(trees);
      if (treeKeys.includes(t.tree)) {
        const branchKeys = Object.keys(trees[t.tree].branches);
        if (branchKeys.includes(t.branch)) {
          trees[t.tree].branches[t.branch].talents.push(t);
        }
        else { 
          trees[t.tree].branches[t.branch] = {
            name: t.branch,
            color: t.folder.color.css,
            talents: [t]
          }
        }
      }
      else {
        trees[t.tree] = {
          name: t.tree,
          branches: {
            [t.branch]: {
              name: t.branch,
              color: t.folder.color.css,
              talents: [t]
            }
          }
        }
      }
    })

    context.trees = trees;

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    if (partId === 'content') {
      
    }
    
    return context;
  }

  _onRender(options, context) {
    super._onRender(options, context);

    function scrollLeft(el, value) {
      var win;
      if (el.window === el) {
        win = el;
      } else if (el.nodeType === 9) {
        win = el.defaultView;
      }
    
      if (value === undefined) {
        return win ? win.pageXOffset : el.scrollLeft;
      }
    
      if (win) {
        win.scrollTo(value, win.pageYOffset);
      } else {
        el.scrollLeft = value;
      }
    }

    const content = this.element.querySelector('.content');
    content.addEventListener("wheel", (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      content.scrollLeft -= (-delta);
      //scrollLeft(content, delta);
    })
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