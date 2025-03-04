import { utopiaTraits } from "../../helpers/actorTraits.mjs";

const { api, sheets } = foundry.applications;

export class UtopiaCharacterCreator extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this.currentSpecies = undefined;
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "character-creator"],
    position: {
      width: "100vw",
      height: "100vh",
    },
    actions: {
      selectSpecies: this._selectSpecies,
      add: this._add,
      subtract: this._subtract,
    },
    window: {
      title: "UTOPIA.SheetLabels.characterCreator",
    },
  };

  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    step1: {
      template: "systems/utopia/templates/other/character-creator/step1.hbs",
    },
    step2: {
      template: "systems/utopia/templates/other/character-creator/step2.hbs",
    },
    step3: {
      template: "systems/utopia/templates/other/character-creator/step3.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["tabs", "step1", "step2", "step3"];
  }

  async _prepareContext(options) {
    if (options.isFirstRender) {
      const species = [];
      await Promise.all(game.packs
        .filter(p => p.metadata.type === "Item")
        .map(async pack => {
          const items = await pack.getDocuments();
          species.push(...items.filter(i => i.type === "species"));
        })
      );
      species.sort((a, b) => {
        const parent = a.name.split(' ')[1];
        const sub = a.name.split(' ')[0];
        const parentB = b.name.split(' ')[1];
        const subB = b.name.split(' ')[0];
        if (parent < parentB) return -1;
        if (parent > parentB) return 1;
        if (parent === parentB) {
          if (sub < subB) return -1;
          if (sub > subB) return 1;
        }
        return 0;
      });

      const talents = [];
      await Promise.all(game.packs
        .filter(p => p.metadata.type === "Item")
        .map(async pack => {
          const items = await pack.getDocuments();
          talents.push(...items.filter(i => i.type === "talent"));
        })
      );

      const specialistTalents = [];
      await Promise.all(game.packs
        .filter(p => p.metadata.type === "Item")
        .map(async pack => {
          const items = await pack.getDocuments();
          specialistTalents.push(...items.filter(i => i.type === "specialistTalent"));
        })
      );

      this.species = species;
      this.talents = talents;
      this.specialistTalents = specialistTalents;
    }
    
    var foundSpecies = {};
    if (this.currentSpecies) {
      foundSpecies = this.species.find(s => s.name === this.currentSpecies);
    } else {
      foundSpecies = this.species[0];
    }
    
    foundSpecies.enrichedDescription = await TextEditor.enrichHTML(
      foundSpecies.system.description,
      {
        secrets: this.document.isOwner,
        rollData: foundSpecies.getRollData(),
        relativeTo: foundSpecies.actor ?? this.actor,
      }
    );
    
    //const archetypes = [];
    //Promise.all(game.packs.filter(p => p.metadata.type === "Item").forEach(async pack => {
    //  const items = await pack.getDocuments();
    //  archetypes.push(...items.filter(i => i.type === "archetype"));
    //}));

    const context = {
      GM: game.user.isGM,
      trusted: game.user.isTrusted,
      actor: this.actor,
      options: this.options,

      utopiaTraits: utopiaTraits(this.actor),

      system: this.actor.system,
      tabs: this._getTabs(options.parts),

      currentSpecies: foundSpecies,

      species: this.species,
      talents: this.talents,
      // archetypes: archetypes,
      specialistTalents: this.specialistTalents
    }

    context.paperdoll = foundSpecies.system.getPaperDoll();

    context.speeds = {
      land: this.actor.system.travel.land.total ?? this.actor.system.traits.agi.subtraits.spd.total ?? 0,
      water: this.actor.system.traits.agi.subtraits.spd.total / 2 ?? 0,
      air: this.actor.system.travel.air.total ?? 0,
    }

    console.log(context);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'step1':
      case 'step2':
      case 'step3':
        context.tab = context.tabs[partId];
        break;
      default:
    }

    return context;
  }


  _getTabs(parts) {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'step1';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: 'primary',
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.CharacterCreator.',
      };
      switch (partId) {
        case 'tabs':
          return tabs;
        case 'step1':
          tab.id = 'step1';
          tab.label += 'step1';
          tab.icon = 'fas fa-fw fa-dna';
          break;
        case 'step2':
          tab.id = 'step2';
          tab.label += 'step2';
          tab.icon = 'fas fa-fw fa-user-graduate';
          break;
        case 'step3':
          tab.id = 'step3';
          tab.label += 'step3';
          tab.icon = 'fas fa-fw fa-star';
          break;
        default:
      }
      
      if (this.tabGroups['primary'] === tab.id) tab.cssClass = 'active';

      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _onRender(context, options) {
    const details = this.element.querySelectorAll('details')
    details.forEach(detailsContainer => {
      detailsContainer.addEventListener('click', event => {
        event.preventDefault();
        details.forEach(d => d.removeAttribute('open'));
        detailsContainer.setAttribute('open', true);
      });
    })
  }

  static _selectSpecies(event, target) {
    const species = target.dataset.species;
    this.currentSpecies = species;

    this.render(true);
  }

  static async _add(event, target) {
    const trait = target.dataset.subtrait;
    const actorTrait = utopiaTraits(this.document)[trait];
    const parent = actorTrait.trait.short;
    const value = actorTrait.value + 1;
    await this.document.update({
      [`system.traits.${parent}.subtraits.${trait}.value`]: value,
    });

    this.render(true);
  }

  static async _subtract(event, target) {
    const trait = target.dataset.subtrait;
    const actorTrait = utopiaTraits(this.document)[trait];
    const parent = actorTrait.trait.short;
    const value = actorTrait.value - 1;
    await this.document.update({
      [`system.traits.${parent}.subtraits.${trait}.value`]: value,
    });

    this.render(true);
  }
}