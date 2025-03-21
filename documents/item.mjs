import { DamageInstance } from "../system/damage.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

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

  async _useGear() {
    const parsedFeatures = [];

    for (const feature of this.system.features) {
      parsedFeatures.push( await fromUuid(feature) );
    }

    
  }

  async _castSpell() {
    const featureSettings = this.system.featureSettings;
    const owner = this.actor ?? this.parent ?? game.user.character ?? game.user;
    const stamina = owner.isGM ? 9999 : owner.system.stamina.value;
    const spellcasting = owner.isGM ? this.constructor.GM_SPELLCASTING() : owner.system.spellcasting;
    const features = [];
    var cost = 0;
    
    for (const featureUuid of this.system.features) {
      const feature = await fromUuid(featureUuid);
      const art = feature.system.art;
      const settings = featureSettings[featureUuid] ?? {};
      const stacks = settings.stacks.value ?? 1;
      
      if (spellcasting.artistries[art]) {
        if (spellcasting.artistries[art].unlocked === false) 
          return ui.notifications.error(game.i18n.localize('UTOPIA.Errors.ArtistryNotUnlocked'));
        if (spellcasting.artistries[art].multiplier === 0) 
          return ui.notifications.error(game.i18n.localize('UTOPIA.Errors.ArtistryMultiplierZero'));

        if (featureSettings) {
          const costVariable = settings.cost?.value ?? 1;
          cost += feature.system.cost * 
            stacks * 
            spellcasting.artistries[art].multiplier * 
            costVariable;
        }
      }

      feature.variables = settings;
      features.push(feature);
    }

    cost = Math.floor(cost / 10);

    if (stamina <= cost) {
      const proceed = await foundry.applications.api.DialogV2.confirm({
        content: game.i18n.localize('UTOPIA.Errors.NotEnoughStamina, '),
        rejectClose: false,
        modal: true
      });
      if (proceed === false) {
        return;
      }
    }
    
    if (!owner.isGM) {
      const damage = DamageInstance.create({
        type: CONFIG.UTOPIA.DAMAGE_TYPES.stamina,
        value: owner.system.stamina.value,
        target: owner
      });
      
      owner.applyDamage(damage);
    }

    const template = await this.system.getTemplate(this);

    const content = await renderTemplate("systems/utopia/templates/chat/spell-card.hbs", {
      item: this,
      owner: owner,
      cost: cost,
      features: features,
      template: template
    });

    UtopiaChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: content,
      system: {
        item: this,
        template: template
      }
    });

    // features.forEach(async (feature) => {
    //   if (feature.system.formula.length > 0) {
    //     const roll = await new Roll(feature.system.formula).evaluate();
    //     const keys = ["type", "damage", "damagetype", "damage type"];
    //     for (const [key, value] of Object.entries(feature.variables)) {
    //       if (keys.includes(key.toLowerCase())) {
    //         const type = CONFIG.UTOPIA.DAMAGE_TYPES[value] ?? CONFIG.UTOPIA.DAMAGE_TYPES.energy;
    //         const damage = DamageInstance.create({
    //           type: type,
    //           value: roll.total,
    //           target: this.actor
    //         });

    //         owner.applyDamage(damage);
    //       }
    //     }
    //   }      
    // })
  }

  static GM_SPELLCASTING = () => {
    const artistries = {}
    Object.entries(CONFIG.UTOPIA.ARTISTRIES).map(([key, value]) => {
      artistries[key] = {
        unlocked: true,
        multiplier: 1
      }
    });
    
    return {
      artistries: {
        ...artistries
      }
    }
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