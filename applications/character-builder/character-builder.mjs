import { gatherItems } from "../../system/helpers/gatherItems.mjs";
import { gsap } from "../../gsap/index.js";
import * as THREE from "../../three/build/three.module.js";
import { characterBuilderAnimation } from "../../system/helpers/sheetAnimations.mjs";

const { api, sheets } = foundry.applications;

export class CharacterBuilder extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  constructor(options = {}) {
    super(options);
    this.selectedSpecies = {}
    this.allSpecies = {}
    this.viewedTalent = {};
  }

  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    species: {
      template: "systems/utopia/templates/character-builder/species.hbs"
    },
    talents: {
      template: "systems/utopia/templates/character-builder/talents.hbs"
    },
    specialist: {
      template: "systems/utopia/templates/character-builder/specialist.hbs"
    },
    footer: {
      template: "systems/utopia/templates/character-builder/footer.hbs"
    }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [
      "tabs",
      "species",
      "talents",
      "specialist",
      "footer"
    ];
  }

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    sheets.ActorSheetV2.DEFAULT_OPTIONS,
    {
      actions: {
        toggleTheme: this._toggleTheme,
        selectSpecies: this._selectSpecies,
        takeTalent: this._takeTalent,
        closeBuilder: this._closeBuilder,
        viewTalent: this._viewTalent,
        back: this._onBack,
        next: this._onNext,
        confirmSpecies: this._confirmSpecies
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
      },
      window: {
        resizable: false,
      },
      tag: "form",
      dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    }
  );  
  
  async _prepareContext(contextOptions) {
    if (!this.selectedSpecies || Object.keys(this.selectedSpecies).length === 0) {
      this.selectedSpecies = {
        name: "No Species Selected",
        slug: "no-species-selected",
        attributes: {
          constitution: 0,
          endurance: 0,
          effervescence: 0,
          block: '2d4',
          dodge: '2d12'
        },
        specialTraits: [

        ]
      }
    }

    const allSpecies = await gatherItems({
      type: "species",
      gatherFolders: false,
      gatherFromWorld: true,
    });
    const sortedSpecies = allSpecies
      .sort((a, b) => a.name.localeCompare(b.name));
    const sortedSpeciesWithAttributes = await Promise.all(sortedSpecies.map(async species => ({
      species,
      name: species.name,
      uuid: species.uuid,
      slug: species.slug || species.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      branches: await Promise.all(species.system.branches.map(async branch => {
        const talents = await Promise.all(branch.talents.map(async t => {
          const talent = await fromUuid(t.uuid);
          return {
            name: talent.name,
            description: talent.system.description,
          };
        }));
        return talents;
      })),
      attributes: {
        constitution: species.system.constitution || 0,
        endurance: species.system.endurance || 0,
        effervescence: species.system.effervescence || 0,
        block: `${species.system.block.quantity}d${species.system.block.size}` || '2d4',
        dodge: `${species.system.dodge.quantity}d${species.system.dodge.size}` || '2d12'
      }
    })));

    this.allSpecies = sortedSpeciesWithAttributes.reduce((acc, species) => {
      acc[species.uuid] = species;
      return acc;
    }, {});

    if (!this.viewedTalent || Object.keys(this.viewedTalent).length === 0) {
      this.viewedTalent = {
        name: "No Talent Selected",
        description: "Select a talent to view its details.",
        body: 0,
        mind: 0,
        soul: 0
      };
    }

    const allTalents = await gatherItems({
      type: "talentTree",
      gatherFolders: false,
      gatherFromWorld: true,
    });
    const fixedTalents = await Promise.all(allTalents.map(async tree => {
      const branches = await Promise.all(tree.system.branches.map(async branch => {
        const talents = await Promise.all(branch.talents.map(async (t, index) => {
          const talent = await fromUuid(t.uuid);
          const body = t.overridden ? t.body : talent.system.body;
          const mind = t.overridden ? t.mind : talent.system.mind;
          const soul = t.overridden ? t.soul : talent.system.soul;
          return {
            talent,
            name: talent.name,
            slug: talent.name.toLowerCase().replace(/\s+/g, '_'),
            description: talent.system.description,
            body,
            mind,
            soul
          };
        }));
        return talents;
      }));
      return {
        tree,
        name: tree.name,
        fg: tree.system.style.foregroundColor.css,
        bg: tree.system.style.backgroundColor.css,
        header: tree.system.style.headerColor.css,
        branches
      };
    }));

    for (const tree of fixedTalents) {
      for (const branch of tree.branches) {
        for (let i = 1; i < branch.length; i++) {
          const talent = branch[i];
          const requirement = branch[i - 1];
          talent.requirement = requirement;
        }
      }
    }

    this.allTalents = fixedTalents.reduce((acc, tree) => {
      tree.branches.forEach(branch => {
        branch.forEach(talent => {
          acc[talent.talent.uuid] = talent;
          if (this.actor.system.takenTalents.includes(talent.talent.uuid)) {
            talent.owned = true;
          }
        });
      });
      return acc;
    }, {});

    const selectedTalent = this.allTalents[this.viewedTalent.talent];
    var selectedSpecies = this.selectedSpecies;

    if (this.actor.system._species !== "" && this.actor.system._species != undefined) {
      selectedSpecies = await fromUuid(this.actor.system._species);
    }

    const context = {
      tabs: this._getTabs(contextOptions.parts),
      species: this.allSpecies,
      selectedSpecies: selectedSpecies,
      trees: fixedTalents,
      selectedTalent: selectedTalent,
    }

    if (this.selectedSpecies.slug) {
      context.trees.push({
        isSpecies: true,
        name: this.selectedSpecies.name,
        slug: this.selectedSpecies.slug,
        attributes: this.selectedSpecies.attributes,
        branches: this.selectedSpecies.branches || []
      })
    }

    console.log("Character Builder Context:", context);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);

    switch (partId) {
      case "species":
      case "talents":
      case "specialist":
        context.tab = context.tabs[partId];
        break;
    }

    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups["primary"]) this.tabGroups["primary"] = "species";

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: "primary",
        // Matches tab property to
        id: "",
        // FontAwesome Icon, if you so choose
        icon: "",
        // Run through localization
        label: "",
      };
      switch (partId) {
        case "footer":
        case "tabs":
          return tabs;
        case "species":
          tab.id = "species";
          tab.label += "Step 1 - Species";
          tab.icon = "fa-solid fa-dna";
          break;
        case "talents":
          tab.id = "talents";
          tab.label += "Step 2 - Talents";
          tab.icon = "fa-solid fa-star";
          break;
        case "specialist":
          tab.id = "specialist";
          tab.label += "Step 3 - Specialist Talents";
          tab.icon = "fa-solid fa-gift";
          break;
        default:
      }

      if (this.tabGroups["primary"] === tab.id) tab.cssClass = "active";

      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const background = this.element[0] || this.element;
    const parallaxStrength = 0.5;
    background.addEventListener("mousemove", (event) => {
      const rect = background.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xPercent = (x / rect.width - 0.5) * 2; // -1 to 1
      const yPercent = (y / rect.height - 0.5) * 2; // -1 to 1
      background.style.backgroundPosition = `calc(50% + ${xPercent * 20 * parallaxStrength}px) calc(50% + ${yPercent * 20 * parallaxStrength}px)`;
    });

    const values = this.element.querySelectorAll(".value");
    values.forEach(value => {
      const glimmerStrength = 0.5;
      const rect = value.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const xPercent = (x / window.innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (y / window.innerHeight - 0.5) *
      2; // -1 to 1
      value.style.transform = `translate(${xPercent * 10 * glimmerStrength}px, ${yPercent * 10 * glimmerStrength}px)`;
      value.style.transition = "transform 0.3s ease, filter 0.3s ease";
      value.addEventListener("mouseover", () => {
        value.style.filter = "brightness(1.2)";
        value.style.transform = `translate(${xPercent * 20 * glimmerStrength}px, ${yPercent * 20 * glimmerStrength}px)`;
      }); 
    });
    
    // Apply initial species theme
    this._applySpeciesTheme(this.selectedSpecies.slug || 'human');
    
    //characterBuilderAnimation(this.element);
  }

  /**
   * Apply species theme to the character builder content
   * @param {string} speciesSlug - The species slug (e.g., 'human', 'angelic-cambion', 'copper-dwarf')
   * @private
   */
  _applySpeciesTheme(speciesSlug) {
    const contentSelectors = ['.builder-species .content', '.species-tree'];
    const contents = contentSelectors
      .map(selector => this.element.querySelector(selector))
      .filter(Boolean);

    if (!contents.length) return;

    // Remove all existing species classes from each content element
    const speciesClasses = ['species-human', 'species-cambion', 'species-dwarf', 
                'species-elf', 'species-automaton', 'species-cyborg', 'species-oxtus'];
    contents.forEach(content => {
      content.classList.remove(...speciesClasses);
    });

    // Determine the base species type from the species slug
    let baseSpecies = 'human'; // default
    if (speciesSlug.includes('cambion')) baseSpecies = 'cambion';
    else if (speciesSlug.includes('dwarf')) baseSpecies = 'dwarf';
    else if (speciesSlug.includes('elf')) baseSpecies = 'elf';
    else if (speciesSlug.includes('automaton')) baseSpecies = 'automaton';
    else if (speciesSlug.includes('cyborg')) baseSpecies = 'cyborg';
    else if (speciesSlug.includes('oxtus')) baseSpecies = 'oxtus';

    // Add the new species class to each content element
    contents.forEach(content => {
      content.classList.add(`species-${baseSpecies}`);
    });
  }

  static async _selectSpecies(event, target) {
    const uuid = target.dataset.uuid;
    this.selectedSpecies = this.allSpecies[uuid];
  
    // Apply species theme immediately
    this._applySpeciesTheme(this.selectedSpecies.slug);

    await this.render(true);
  }

  static async _confirmSpecies(event, target) {
    const confirmDialog = await Dialog.confirm({
      title: "Confirm Species Selection",
      content: `Are you sure you want to select the ${this.selectedSpecies.name} species?`,
      yes: async () => {
        // Proceed with the selection
        await this.actor.update({
          "system._species": this.selectedSpecies.uuid
        })
        await this.actor.addItem(this.selectedSpecies);
        await this.render(true);
      },
      no: () => {
        // User canceled the selection
      }
    });
  }

  static async _viewTalent(event, target) {
    const {talentUuid, treeUuid, branchIndex, talentIndex} = target.dataset;
    this.viewedTalent = {
      talent: talentUuid,
      tree: treeUuid,
      branch: branchIndex,
      index: talentIndex
    }
    await this.render(true);
  }

  static async _takeTalent(event, target) {
    const talent = await fromUuid(this.viewedTalent.talent);
    const tree = await fromUuid(this.viewedTalent.tree);
    const branchIndex = this.viewedTalent.branch;
    const talentIndex = this.viewedTalent.index;

    const canTake = await this.actor.canTakeTalent(talent, tree, branchIndex, talentIndex);

    if (!canTake) {
      ui.notifications.error("You cannot take this talent.");
      return;
    }
-
    await this.actor.addTalent(talent, tree, branchIndex, talentIndex);

    await this.render(true);
  }

  /**
   * Tab / button navigation helpers
   * @param {Event} event The triggering event
   * @returns {Promise<void>}
   */
  static async _onBack(event) {
    event.preventDefault();
    const tabs = event.currentTarget.querySelector('nav.sheet-tabs.tabs');
    if (tabs) {
      const currentTab = tabs.querySelector('.active');
      const previousTab = currentTab ? currentTab.previousElementSibling : null;
      if (previousTab) {
        previousTab.click();
      }
    }
  }

  static async _onNext(event) {
    event.preventDefault();
    const tabs = event.currentTarget.querySelector('nav.sheet-tabs.tabs');
    if (tabs) {
      const currentTab = tabs.querySelector('.active');
      const nextTab = currentTab ? currentTab.nextElementSibling : null;
      if (nextTab) {
        nextTab.click();
      }
    }
  }

  static async _closeBuilder(event) {
    await this.close();
  }
}