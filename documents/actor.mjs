import { DamageInstance } from "../system/damage.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

export class UtopiaActor extends Actor {
  getRollData() {
    const data = {...this.system};

    for (const [key, trait] of Object.entries(data.traits)) {
      data[key] = trait;
    }

    for (const [key, trait] of Object.entries(data.subtraits)) {
      data[key] = trait;
    }

    const owner = game.users.find(u => u.character?.name === this.name);
    if (owner && owner.targets.size > 0) {
        data.target = owner.targets.values().next().value.actor.getRollData();
    } else if (game.user.targets.size > 0) {
        data.target = game.user.targets.values().next().value.actor.getRollData();
    }

    return data;
  }

  async addTalent(talent) {
    let points = -1;
    if (this.type === "character")
      points = this.system.talentPoints.available;

    const item = await fromUuid(talent);
    const cost = item.system.total ?? item.system.body + item.system.mind + item.system.soul ?? 0;

    if (points >= cost) 
      await this.createEmbeddedDocuments("Item", [item]);
    else 
      ui.notifications.error(game.i18n.localize("UTOPIA.Errors.NotEnoughTalentPoints"));

    if (item.system.macro && item.system.macro.length > 0) {
      const macro = await fromUuid(item.system.macro);
      await macro.execute({
        actor: this,
        item: item,
      });
    }

    if (item.system.grants && item.system.grants.size > 0) {
      for (const grant of item.system.grants) {
        const item = await fromUuid(grant);
        await this.createEmbeddedDocuments("Item", [item]);
      }
    }
  }

  async takeDamage(damageInstance) {
    await this.update({
      "system.shp.value": damageInstance.final.shp,
      "system.dhp.value": damageInstance.final.dhp,
      "system.stamina.value": damageInstance.final.stamina
    });

    return console.log(`Actor {${this.name}} dealt damage:`, damageInstance.final);
  }

  async check(trait) {
    const specialChecks = CONFIG.UTOPIA.SPECIALTY_CHECKS[trait] ?? {};
    if (Object.keys(specialChecks).length > 0) 
      return this._checkSpecialty(trait, specialChecks);
    else 
      return this._checkTrait(trait);  
  }

  async _checkSpecialty(trait, specialChecks) {
    const formula = specialChecks.formula;
    const attribute = this.system.checks[trait];
    const netFavor = await this.checkForFavor(trait) || 0;
    const newFormula = formula.replace(`@${specialChecks.defaultAttribute}`, `@${attribute}`);
    return await new Roll(newFormula, this.getRollData()).alter(1, netFavor).toMessage();
  }

  async _checkTrait(trait) {
    const netFavor = await this.checkForFavor(trait) || 0;
    const newFormula = `3d6 + @${trait}.mod`;
    return await new Roll(newFormula, this.getRollData()).alter(1, netFavor).toMessage();
  }

  async rest() {
    await this.resetResources('rest');

    await this.update({
      "system.shp.value": this.system.shp.max,
      "system.stamina.value": this.system.stamina.max
    })
  }

  async resetResources(type) {
    // TODO: Implement
  }
 
  async createDamageInstance(type, value, target) {
    return await new DamageInstance({
      type: type,
      value: value,
      source: this,
      target: target,
    });
  }

  weaponlessStrike() {
    const formula = this.weaponless.formula;
    const type = this.weaponless.type;
    const traits = this.weaponless.traits ?? [];
    const bonus = this.weaponless.bonus ?? 0;
    const targets = Array.from(game.user.targets) ?? [];
    if (!targets || targets.length === 0) 
      targets = [game.user.character ?? game.canvas.tokens.controlled[0].actor];
    const value = new Roll(formula).evaluateSync().total + bonus;
    const instances = [];

    for (const target of targets) {
      instances.push(this.createDamageInstance(type, value, target));
      
      // TODO: Deal damage to target
    }

    return instances;
  }

  _performAction({ item }) {
    if (item.type === "action") {
      const formula = item.system.formula;
      const category = item.system.category;

      switch (category) {
        case "damage": 
          return this._damageAction(item);
        case "utility": 
          return this._utility(formula);
        case "macro":
          return this._macro(item.system.macro, { item: item });
      }
    }
  }

  async _damageAction(item) {
    const instances = [];

    const targets = [];

    if (["self", "none"].includes(item.system.template)) {
      targets.push(this);
    } else if (item.system.template === "target") {
      targets.push([...game.user.targets]);
    }
    
    for (const damages of item.system.damages) {
      const type = CONFIG.UTOPIA.DAMAGE_TYPES[damages.type] ?? CONFIG.UTOPIA.DAMAGE_TYPES.kinetic;
      type.key = damages.type;
      const roll = await new Roll(damages.formula).evaluate();
      const total = roll.total;
      
      if (targets.length === 0) {
        const instance = await this.createDamageInstance(type, total);
        instances.push(instance);
      }
      for (const target of targets) {
        const instance = await this.createDamageInstance(type, total, target);
        instances.push(instance);
      }
    }
    
    const data = { item: item, instances: instances };
    if (!["self", "none", "target"].includes(item.system.template))
      data.template = item.system.template;
    // const content = await renderTemplate("systems/utopia/templates/chat/damage-card.hbs", data);

    // return UtopiaChatMessage.create({
    //   user: game.user._id,
    //   speaker: ChatMessage.getSpeaker(),
    //   content: content,
    // })
  }

  async _dealDamage(formula) {
    let targets = Array.from(game.user.targets) ?? [];
    if (!targets || targets.length === 0) 
      targets = [game.user.character ?? game.canvas.tokens.controlled[0]?.actor ?? undefined];
    const value = await new Roll(formula).evaluate().total;
    const instances = [];

    if (!targets || targets.length === 0 || (targets.length === 1 && !targets[0]))
      return ui.notifications.error(game.i18n.localize("UTOPIA.Errors.NoTargets"));

    for (const target of targets) {
      instances.push(this.createDamageInstance("kinetic", value, target));
    }

    return instances;
  }

  _macro(macro, { item = null }) {
    return fromUuid(macro).then((macro) => {
      macro.execute(item?.system.macroData ?? {});
    })
  }

  async applyDamage(damage) {
    await this.update({
      "system.hitpoints.surface.value": this.system.hitpoints.surface.value - damage.final.shp,
      "system.hitpoints.deep.value": this.system.hitpoints.deep.value - damage.final.dhp,
      "system.stamina.value": this.system.stamina.value - damage.final.stamina,
    })

    const content = await renderTemplate("systems/utopia/templates/chat/damage-card.hbs", { instances: [damage] });
    
    console.log(`Actor {${this.name}} took damage:`, damage.final);

    return UtopiaChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: content,
    })
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

  async checkForFavor(trait, condition = "always") {
    const favors = this.items.filter(i => i.type === 'favor').filter(f => f.system.checks.has(trait));

    var netFavor = 0;

    for (const favor of favors) {
      if (favor.system.conditions.has(condition) && favor.target === "self") {
        netFavor += favor.value;
      }
    }

    return netFavor;
  }
}