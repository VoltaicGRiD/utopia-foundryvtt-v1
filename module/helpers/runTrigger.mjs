import { UtopiaChatMessage } from "../documents/chat-message.mjs";
import { calculateTraitFavor } from "./favorHandler.mjs";

export async function runTrigger(name, data, caller) {
  let trigger = new UtopiaTrigger();
  console.log(caller);
  if (!caller || Object.keys(caller).length === 0) {
    trigger.caller = null;
    trigger.callerData = null;
  }
  else {
    trigger.caller = caller['func'];
    trigger.callerData = caller['funcData'];
  }
  console.log(trigger);
  return await trigger.run(name, data);
}

export class UtopiaTrigger {
  constructor() {
    this.data = {};
  }

  static _triggers = {
    "Manual": "UTOPIA.Item.Actions.Trigger.manual",
    "SHPDamageTaken": "UTOPIA.Item.Actions.Trigger.shpDamage",
    "SHPDamageDealt": "UTOPIA.Item.Actions.Trigger.shpDamageDealt",
    "DHPDamageTaken": "UTOPIA.Item.Actions.Trigger.dhpDamage",
    "DHPDamageDealt": "UTOPIA.Item.Actions.Trigger.dhpDamageDealt",
    "Heal": "UTOPIA.Item.Actions.Trigger.heal",
    // "Condition": "UTOPIA.Item.Actions.Trigger.condition",
    // "ConditionLost": "UTOPIA.Item.Actions.Trigger.conditionLost",
    // "MyTurn": "UTOPIA.Item.Actions.Trigger.myTurn",
    // "EnemyTurn": "UTOPIA.Item.Actions.Trigger.enemyTurn",
    // "AllyTurn": "UTOPIA.Item.Actions.Trigger.allyTurn",
    // "StartRound": "UTOPIA.Item.Actions.Trigger.startRound",
    // "EndRound": "UTOPIA.Item.Actions.Trigger.endRound",
    // "StaminaLost": "UTOPIA.Item.Actions.Trigger.staminaLost",
    // "Contest": "UTOPIA.Item.Actions.Trigger.contest",
    // "Test": "UTOPIA.Item.Actions.Trigger.test",
    // "FocusLost": "UTOPIA.Item.Actions.Trigger.focusLost",
    // "ConcentrationLost": "UTOPIA.Item.Actions.Trigger.concentrationLost",
    // "Block": "UTOPIA.Item.Actions.Trigger.block",
    // "Dodge": "UTOPIA.Item.Actions.Trigger.dodge",
    // "SpellCast": "UTOPIA.Item.Actions.Trigger.spellCast",
    // "CraftStarted": "UTOPIA.Item.Actions.Trigger.craftStarted",
    // "CraftFinished": "UTOPIA.Item.Actions.Trigger.craftFinished",
    // "ForageStarted": "UTOPIA.Item.Actions.Trigger.forageStarted",
    // "ForageFinished": "UTOPIA.Item.Actions.Trigger.forageFinished",
    // "RestStarted": "UTOPIA.Item.Actions.Trigger.restStarted",
    // "RestFinished": "UTOPIA.Item.Actions.Trigger.restFinished",
    // "BlindAwareness": "UTOPIA.Item.Actions.Trigger.awareness",
  };

  static return(data) {
    let trigger = data.instance;
    if (trigger.damage) {
      trigger.instance.callerData.damage = trigger.data.damage;
    }
    console.log(trigger);
    console.log(trigger.callerData);
    trigger.caller(trigger.callerData, true);    
  }

  async run(name, data) {
    const triggers = Object.keys(this._triggers);
    return await triggers.includes(name) ? this[name](data) : null;
  }

  async getCombat(actor) {
    if (!game.combat) return false;
    const combat = game.combat;
    if (!combat.combatants) return false;
    const combatants = combat.combatants;
    if (combatants.find((c) => c.actorId === actor.id) !== undefined) return true;
    else return false;
  }

  async getActions(actor, trigger) {
    let actions = [];
    let otherActions = [];

    const inCombat = await this.getCombat(actor);
    let isTurn = false;
    if (inCombat === true) {
      const combatId = inCombat ? game.combat.combatants.find((c) => c.actorId === actor.id)._id : null;   
      isTurn = inCombat ? game.combat.current.combatantId === combatId : false;
    }

    // If the actor is in combat, we need to see if it's their turn, and display all 'standard' type actions.
    // Otherwise, we need to display all 'interrupt' type actions.

    if (isTurn) {
      actions = actor.items.filter((item) => item.type === "action").filter((item) => Array.from(Array.from(item.system.triggers)).includes(trigger) && item.system.type === "Standard");
      otherActions = actor.items.filter((item) => item.type === "action").filter((item) => Array.from(item.system.triggers).includes(trigger) && item.system.type !== "Standard");
    } 
    else if (inCombat && !isTurn) {
      actions = actor.items.filter((item) => item.type === "action").filter((item) => Array.from(item.system.triggers).includes(trigger) && item.system.type === "Interrupt");
      otherActions = actor.items.filter((item) => item.type === "action").filter((item) => Array.from(item.system.triggers).includes(trigger) && item.system.type !== "Interrupt");
    } 
    else {
      actions = actor.items.filter((item) => item.type === "action").filter((item) => Array.from(item.system.triggers).includes(trigger));
    }

    return { actions: actions, others: otherActions };
  }

  async showCard(actor, trigger) {
    const actorActions = await this.getActions(actor, trigger);
    console.log(this);
    const actions = actorActions.actions;
    const others = actorActions.others;

    if (actions.length === 0 && others.length === 0) return false;

    const template = "systems/utopia/templates/chat/trigger-card.hbs";
    const data = {
      triggerName: UtopiaTrigger._triggers[trigger],
      trigger: trigger,
      isGM: game.user.isGM,
      actor: actor,
      actions: actions,
      others: others,
      ...this.data,
    }
    const content = await renderTemplate(template, data);
    let whisper = [];
    if (actor.hasPlayerOwner) {
      ChatMessage.getWhisperRecipients(actor.name).forEach((user) => whisper.push(user.id));
    }
    ChatMessage.getWhisperRecipients("GM").forEach((user) => whisper.push(user.id));
    console.log(data);

    let message = UtopiaChatMessage.applyRollMode({
      system: { actionData: data, caller: this.caller, callerData: this.callerData },
      whisper: whisper,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      flags: { utopia: { actions: actions } },
      speaker: { actor: actor },
      content: content,
      sound: CONFIG.sounds.notification,
    });

    await UtopiaChatMessage.create(message, { rollMode: CONST.DICE_ROLL_MODES.PRIVATE, renderSheet: false });
    return true;
  }

  async Manual() {
    console.log("Manual trigger activated.");
  }

  // Data expected: (actor, damage)
  async SHPDamageTaken(data) {
    const actor = data["actor"];
    const damage = data["damage"];
    this.data.damage = damage;
    return await this.showCard(actor, "SHPDamageTaken");    
  }

  async SHPDamageDealt(dealer, reciever) {
    this.data.reciever = reciever;
    this.data.roll = roll;
    return await this.showCard(dealer, "SHPDamageDealt");
  }
  
  // Data expected: (actor, damage)
  async DHPDamageTaken(data) {
    const actor = data["actor"];
    const damage = data["damage"];
    this.data.damage = damage;
    return await this.showCard(actor, "DHPDamageTaken");
  }

  async DHPDamageDealt(dealer, reciever) {
    this.data.reciever = reciever;
    this.data.roll = roll;
    return await this.showCard(dealer, "DHPDamageDealt");
  }

  async Heal(actor, start, end) {
    const heal = end - start;
    return await this.showCard(actor, "Heal", { heal: heal });
  }

  async RestFinished(actor) {
    return await this.showCard(actor, "RestFinished");
  }
}

export const triggers = UtopiaTrigger._triggers;