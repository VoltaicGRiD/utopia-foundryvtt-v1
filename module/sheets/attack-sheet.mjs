const { api, sheets } = foundry.applications;

export class UtopiaAttackSheet extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'attack-sheet'],
    position: {
      width: 500,
      height: 'auto',
    },
    actions: {
      submit: this._submit,
      cancel: this._cancel,
      target: this._target,
      remove: this._remove,
      clear: this._clear,
      add: this._add,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: 'UTOPIA.SheetLabels.attack',
    }
  };

  static PARTS = {
    attack: {
      template: 'systems/utopia/templates/attack-sheet.hbs',
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ['attack'];
  }

  async _prepareContext(options) {
    let target = {}
    if (game.user.targets.size > 1) {
      target.name = "[Multiple Targets]";
    }
    else {
      target = game.user.targets.values().next().value;
    }
    let targets = game.user.targets;

    const context = {
      actor: this.document.parent,
      item: this.document,
      target: target,
      targets: targets,
      config: CONFIG.UTOPIA,
      modifiers: this.modifiers,
    };

    this.context = context;

    return this.context;
  }

  static async _clear(event, target) {
    event.preventDefault();
    this.modifiers = [];
    this.render();
  }

  static async _add(event, target) {
    event.preventDefault();

    new foundry.applications.api.DialogV2({
      window: { title: "Create a Modifier" },
      content: `
        <label>Modifier Name <input type="text" name="name" placeholder="Name" value=""> </label>
        <label>Modifier Source <input type="text" name="source" placeholder="Source" value=""> </label>
        <label>Modifier Amount <input type="text" name="amount" value="0"> </label>
      `,
      buttons: [{
        action: "submit",
        label: "Submit",
        default: true,
        callback: (event, button, dialog) => {
          console.log(event, button, dialog);

          let name = dialog.querySelector('[name="name"]').value;
          let source = dialog.querySelector('[name="source"]').value;
          let amount = dialog.querySelector('[name="amount"]').value;

          let validateRoll = Roll.validate(amount);

          let calculated = true;
          let testCalculated = Roll.replaceFormulaData(amount, this.document.getRollData());
          if (testCalculated == amount) {
            calculated = false;
          }

          if (!validateRoll) {
            ui.notifications.error("Invalid roll formula.");
            event.preventDefault();
          }
          else {
            let newModifier = {
              value: name,
              source: source,
              amount: testCalculated,
            };
          
            if (calculated) {
              newModifier.calculated = true;
            }

            if (!this.modifiers) {
              this.modifiers = [];
            }

            this.modifiers.push(newModifier);
            this.render();

            dialog.close();
          }
        }
      }],
    }).render({ force: true });
  }

  static async _update(result) {
    console.log(result);
  }

  static async _remove(event, target) {
    event.preventDefault();
    const mod = target.dataset.modifier;
    const modifiers = this.context.modifiers;
    const index = modifiers.indexOf(mod);
    let newModifiers = modifiers.splice(index, 1);
    this.modifiers = newModifiers;
    console.log(context);
    this.render();
  }

  static async _target(event, target) {
    event.preventDefault();
    target = game.user.targets.values().next().value;
    this.context.target = target;
    this.render();
  }

  static async _cancel(event, target) {
    event.preventDefault();
    this.close();
  }

  static async _submit(event, target) {
    event.preventDefault();

    if (game.settings.get('utopia', 'targetRequired') == true)
    {
      if (game.user.targets.size == 0) {
        ui.notifications.error("You must select a target to attack.");
        this.render();
        return null;
      }
    }

    const item = this.document;

    // Retrieve roll data.
    const rollData = item.getRollData();

    // Get the full formula for the roll
    let fullFormula = rollData.formula;
    
    // Append each modifier to the formula as a string
    if (this.modifiers && this.modifiers.length > 0) {
      this.modifiers.forEach(mod => {
        fullFormula += ` + (${mod.amount})`;
      });
    }

    // Get Speaker
    const speaker = ChatMessage.getSpeaker({ actor: item.parent });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // Invoke the roll and submit it to chat.
    const roll = new Roll(fullFormula, rollData);
    // If you need to store the value first, uncomment the next line.
    // const result = await roll.evaluate();
    const chat = await roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
    });

    console.log(fullFormula);
    console.log(roll);

    return chat;
  }
}