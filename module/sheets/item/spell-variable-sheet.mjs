const { api, sheets } = foundry.applications;

export class UtopiaSpellVariableSheet extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {
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
      width: "auto",
      height: "auto",
    },
    actions: {
      submit: this._submit,
    }
  };

  static PARTS = {
    content: {
      template: "systems/utopia/templates/dialogs/spell-variables.hbs",
      scrollable: [''],
    },
  }

  async _prepareContext(options) {

    if (options.isFirstRender) {
      var context = {
        variable: '[X]',
        name: this.document.name,
        max: this.document.actor.system.spellcap,
        actorStamina: this.document.actor.system.stamina.value,
        stamina: this.document.system.stamina,
        formula: this.document.system.formula,
      };
    }
    
    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    if (partId === 'content') {
      return context;
    }
  }

  async _onRender(context, options) {
    this.element.querySelector('input').focus();
    this.element.querySelector('input').addEventListener('keyup', async (event) => {
      var regex = /\d+X/gi;
      var inputFormula;
      var outputFormula;
      if (regex.test(context.stamina)) {
        inputFormula = context.stamina.replace('X', `*${event.target.value}`);
      } else {
        inputFormula = context.stamina.replace('X', `${event.target.value}`);
      }
      if (regex.test(context.formula)) {
        outputFormula = context.formula.replace('X', `*${event.target.value}`);
      } else {
        outputFormula = context.formula.replace('X', `${event.target.value}`);
      }
      var calculated = "N/A";
      try {
        let roll = await new Roll(inputFormula).evaluate();
        calculated = roll.total;
      } catch (e) {
        console.error(e);
      }
      var difference = context.actorStamina - calculated;
      calculated = calculated + " stamina";
      var cost = ""
      console.log(difference);
      if (difference > 0) {
        cost = ` leaving you with ${difference} stamina`;
      } else if (difference < 0) {
        cost = ` which is more stamina than you have, dealing ${Math.abs(difference)} DHP damage to you`;
      } else if (difference === 0) {
        cost = ` leaving you with <span style="color: #ef625c">no stamina</span>`;
      }
      this.element.querySelector('code[name="input-formula"]').innerHTML = inputFormula;
      this.element.querySelector('code[name="output-formula"]').innerHTML = outputFormula;
      this.element.querySelector('code[name="calculated"]').innerHTML = calculated;
      this.element.querySelector('span[name="cost"]').innerHTML = cost;
    });
  }

  async _onChange(event) {
    context.value = event.target.value;
    
  }
}