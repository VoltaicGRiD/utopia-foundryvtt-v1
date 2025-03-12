export class UtopiaItem extends Item {
  async use() {
    switch (this.type) {
      case "gear": 
        return this._useGear();
      case "featureSpell":
      case "featureGear":
      case "quirk":
      case "kit":
      case "species":
        return this._toMessage();
      case "spell": 
        return this._castSpell();
      case "action": 
        return this.parent?._performAction({ item: this }) ?? this._performAction();
    }
  }
  
  async roll() {
    this.use();
  }

  _toMessage() {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: this.system.description
    });
  }

  get effectCategories() {
    const categories = {};
  
    categories.temporary = {
      type: 'temporary',
      label: game.i18n.localize('TYPES.ActiveEffect.temporary'),
      effects: [],
    };
    categories.passive = {
      type: 'passive',
      label: game.i18n.localize('TYPES.ActiveEffect.passive'),
      effects: [],
    }; 
    categories.inactive = {
      type: 'inactive',
      label: game.i18n.localize('TYPES.ActiveEffect.inactive'),
      effects: [],
    };

    // Iterate over active effects, classifying them into categories
    for (let e of this.effects) {
      console.log(e);
      if (e.disabled) categories.inactive.effects.push(e);
      else if (e.isTemporary) categories.temporary.effects.push(e);
      else categories.passive.effects.push(e);
    }

    return categories; 
  }
}