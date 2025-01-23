const { dice } = foundry.applications;

/**
 * Represents the talent selection sheet for Utopia.
 * Extends the base Application class provided by Foundry VTT.
 */
export class UtopiaRollResolverSheet extends dice.RollResolver {
  constructor(options = {}) {
    super(options);
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'roll-resolver-sheet'],
    window: {
      resizeable: true,
      title: `Resolve Rolls`,
    },
    position: {
      width: 800,
      height: 900,
    },
    actions: {
      
    },
  };

  static PARTS = {
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

  /** @override */
  async _onRender() {
    await super._onRender();

    console.log("Rendered roll resolver", this);
  }
}