const { api, sheets } = foundry.applications;

export class UtopiaAttackSheet extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {

  constructor(options = {}) {
    super(options);

    if (game.settings.get('utopia', 'targetRequired') == false)
    {

    }
  }

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'attack-sheet'],
    position: {
      width: 600,
      height: 600,
    },
    position: {
      width: 400,
      height: 'auto',
    },
    actions: {
      submit: this._submit,
      cancel: this._cancel,
      target: this._target,
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
      config: CONFIG.UTOPIA
    };

    this.context = context;

    return this.context;
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

    // const form = target.closest('form');
    // const formData = new FormDataExtended(form);
    // const data = formData.toObject();
    // await this.document.update(data);

    const item = this.document;

    // Retrieve roll data.
    const rollData = item.getRollData();    

    // Get Speaker
    const speaker = ChatMessage.getSpeaker({ actor: item.parent });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // Invoke the roll and submit it to chat.
    const roll = new Roll(rollData.formula, rollData);
    // If you need to store the value first, uncomment the next line.
    // const result = await roll.evaluate();
    const chat = await roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
    });

    console.log(chat);

    return chat;
  }
}