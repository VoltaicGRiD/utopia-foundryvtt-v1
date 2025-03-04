import { calculateTraitFavor } from "../../helpers/favorHandler.mjs";

const { api, sheets } = foundry.applications;

export class UtopiaRollDialog extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'roll-dialog'],
    position: {
      width: 500,
      height: 'auto',
    },
    actions: {
      addFavor: this._addFavor,
      addDisfavor: this._addDisfavor,
      disableTerm: this._disableTerm,
      addTerm: this._addTerm,
      parseCustomTerm: this._parseCustomTerm,
      removeCustomTerm: this._removeCustomTerm,
      roll: this._roll,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: 'UTOPIA.SheetLabels.roll',
    },
  };

  static PARTS = {
    content: {
      template: 'systems/utopia/templates/other/roll-dialog.hbs',
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options
  }

  async _prepareContext(options) {
    super._prepareContext(options);
    console.log(options);

    let target = {}
    if (game.user.targets.size > 1) {
      target.name = "[Multiple Targets]";
    }
    else {
      target = game.user.targets.values().next().value;
    }
    let targets = game.user.targets;

    const roll = options.roll ?? new Roll(options.formula ?? "3d6");
    roll.terms.forEach(term => term.disabled = false);

    if (options.type !== "trait")
      roll.terms.forEach(term => term.redistributions?.length > 0 ? term.hasRedistributions = true : term.hasRedistributions = false);

    if (options.type === "trait") {
      roll.terms.forEach(term => {
        if (term.expression.includes("d6")) {
          term.favorable = true;
        }
      });
    }

    roll.terms.forEach(term => {
      if (term.constructor.name === 'NumericTerm') {
        term.removable = true;
      }
    })

    options.disabledTerms?.forEach(index => {
      roll.terms[index].disabled = true;
    });

    const specialFavorTypes = ['accuracy', 'devices', 'inconspicuous', 'multitasking', 
      'difficultTerrain', 'traversal', 
      'maintainFocus', 'maintainConcentration', 
      'resistInfluence', 'resistSpellEffects'
    ]

    var specialFavors = {}
    if (options.specialFavors && Object.keys(options.specialFavors).length > 0)
      specialFavors = options.specialFavors;
    else {
      var specials = options.actor.system.favors.filter(f => specialFavorTypes.includes(f));
      for (const favor of specials) {
        specialFavors[favor] = {
          amount: specialFavors[favor] ? specialFavors[favor].amount + 1 : 1,
          value: favor,
          selected: false,
          name: game.i18n.localize(`UTOPIA.Actor.SpecialFavors.${favor}`)
        }
      }    
    }

    var specialDisfavors = {}
    if (options.specialDisfavors && Object.keys(options.specialDisfavors).length > 0)
      specialDisfavors = options.specialDisfavors;
    else {
      specials = options.actor.system.disfavors.filter(f => specialFavorTypes.includes(f));
      for (const favor of specials) {
        specialDisfavors[favor] = {
          amount: specialFavors[favor] ? specialFavors[favor].amount + 1 : 1,
          value: favor,
          selected: false,
          name: game.i18n.localize(`UTOPIA.Actor.SpecialFavors.${favor}`)
        }
      }    
    }

    const hasSpecialFavors = Object.keys(specialFavors).length > 0 || Object.keys(specialDisfavors).length > 0;

    const context = {
      actor: options.actor ?? undefined,
      item: options.item ?? undefined,
      rollData: options.rollData ?? {},
      strike: options.strike ?? undefined,
      type: options.type ?? "trait",
      favor: options.favor ?? {net: 0},
      formula: roll.formula,
      terms: roll.terms,
      customTerms: options.customTerms ?? [],
      target: target,
      targets: targets ?? [],
      description: options.description ?? "",
      hasSpecialFavors: hasSpecialFavors,
      specialFavors: specialFavors,
      specialDisfavors: specialDisfavors
      //config: CONFIG.UTOPIA,
      //modifiers: this.modifiers,
    };

    this.renderOptions = options;
    this.renderOptions.roll = new Roll(this.renderOptions.roll.formula);
    this.renderOptions.specialDisfavors = specialDisfavors;
    this.renderOptions.specialFavors = specialFavors;
    this.context = context;

    console.log(options, context);

    return context;
  }

  _onRender(options, context) {
    const optionals = this.element.querySelectorAll('input[type="checkbox"]');
    optionals.forEach(optional => {
      optional.addEventListener('change', event => {
        const enabled = event.target.checked;
        const favor = event.target.dataset.favor;
        const type = event.target.dataset.type;
        const amount = parseInt(event.target.dataset.amount);
        const term = this.renderOptions.roll.terms[0];
        const quantity = term.number;

        if (type === "favor" && enabled === false) { // This means we need to remove the favor that was added
          this.renderOptions.specialFavors[favor].selected = false;
          term.alter(0, quantity - amount);
        } else if (type === "favor" && enabled === true) {
          this.renderOptions.specialFavors[favor].selected = true;
          term.alter(0, quantity + amount);
        } else if (type === "disfavor" && enabled === false) {
          this.renderOptions.specialDisfavors[favor].selected = false;
          term.alter(0, quantity + amount);
        } else if (type === "disfavor" && enabled === true) {
          this.renderOptions.specialDisfavors[favor].selected = false;
          term.alter(0, quantity - amount);
        }

        this.renderOptions.roll = new Roll(this.renderOptions.roll.formula);
        this.render(this.renderOptions);
      })
    });
  }

  static async _addFavor(event, target) {
    if (target.dataset.term) {
      const index = target.dataset.term;
      const term = this.renderOptions.roll.terms[index];
      const quantity = term.number;
      term.alter(0, quantity + 1);
      this.renderOptions.roll = new Roll(this.renderOptions.roll.formula);
      this.render(this.renderOptions);
    }
  }
  
  static async _addDisfavor(event, target) {
    if (target.dataset.term) {
      const index = target.dataset.term;
      const term = this.renderOptions.roll.terms[index];
      const quantity = term.number;
      if (quantity > 0) {
        term.alter(0, quantity - 1);
        this.renderOptions.roll = new Roll(this.renderOptions.roll.formula);
        this.render(this.renderOptions);
      }
      else {
        ui.notifications.error("You cannot have a negative quantity of dice.");
        this.render(this.renderOptions);
      }
    }
  }

  static async _disableTerm(event, target) {
    if (target.dataset.term) {
      const index = parseInt(target.dataset.term);
      
      if (!this.renderOptions.disabledTerms) 
        this.renderOptions.disabledTerms = [];

      const alreadyDisabled = this.renderOptions.disabledTerms.includes(index);
      
      // If its already disabled, enable it by removing from the list
      if (alreadyDisabled) {
        this.renderOptions.disabledTerms = this.renderOptions.disabledTerms.filter(item => item !== index);
        
        // Do the same for the operator term before it
        if (this.renderOptions.roll.terms[index - 1].constructor.name === 'OperatorTerm') {
          this.renderOptions.disabledTerms = this.renderOptions.disabledTerms.filter(item => item !== index - 1);
        }
      } 

      // If its not already disabled, add it to the list
      else {
        this.renderOptions.disabledTerms.push(index);

        // If the term is a NumericTerm term, disable the operator term before it
        if (this.renderOptions.roll.terms[index - 1].constructor.name === 'OperatorTerm') {
          this.renderOptions.disabledTerms.push(index - 1);
        }
      }
      
      this.render(this.renderOptions);
    }
  }

  static async _addTerm(event, target) {
    this.renderOptions.customTerms = this.renderOptions.customTerms ?? [];
    this.renderOptions.customTerms.push({value: "0", operator: "+"});
    this.render(this.renderOptions);
  }

  static async _removeCustomTerm(event, target) {
    const index = parseInt(target.dataset.term);
    this.renderOptions.customTerms = this.renderOptions.customTerms ?? [];
    this.renderOptions.customTerms.slice(index, 1);
    this.render(this.renderOptions);
  }
  
  static async _parseCustomTerm(event, target) {
    const index = parseInt(target.dataset.term);
    const value = this.element.querySelector(`input[data-term="${index}"]`).value;
    const operator = this.element.querySelector(`select[data-term="${index}"]`).selectedOptions[0].value;
    const customRoll = await new Roll(value, this.renderOptions.rollData).evaluate();
    const terms = this.renderOptions.roll.terms;
    let formula = terms.map(term => !term.disabled ? term.expression : "").join(" ") + " " + operator + " " + customRoll.formula;
    const roll = await new Roll(formula, {}).evaluate();
    this.renderOptions.roll = roll;
    this.render(this.renderOptions);
  }

  static async _roll(event, target) {
    const terms = this.renderOptions.roll.terms;
    let formula = terms.map(term => !term.disabled ? term.expression : "").join(" ");
    if (this.renderOptions.customTerms)
      formula = formula + this.renderOptions.customTerms.map(term => term.operator + " " + term.value).join(" ");
    const roll = await new Roll(formula, {}).evaluate();
    this.renderOptions.actor?.finalizeRoll(roll, this.renderOptions, this.renderOptions.templateOptions ?? this.renderOptions.templateData ?? {});
    this.close();
  }
}