import UtopiaItemBase from "./base-item.mjs";

export default class UtopiaAction extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.rules = new fields.JSONField({ initial: JSON.stringify({}) });
    schema.type = new fields.StringField({ required: false, nullable: false, initial: "Standard", choices: {
      "Standard": "UTOPIA.Actions.Type.standard",
      "Interrupt": "UTOPIA.Actions.Type.interrupt",
      "Special": "UTOPIA.Actions.Type.special",
      "Free": "UTOPIA.Actions.Type.free",
    }});
    const trigger = new fields.StringField({ required: false, nullable: false, initial: "Manual", choices: {
      "Manual": "UTOPIA.Actions.Trigger.manual",
      "SHPDamageTaken": "UTOPIA.Actions.Trigger.shpDamage",
      "SHPDamageDealt": "UTOPIA.Actions.Trigger.shpDamageDealt",
      "DHPDamageTaken": "UTOPIA.Actions.Trigger.dhpDamage",
      "DHPDamageDealt": "UTOPIA.Actions.Trigger.dhpDamageDealt",
      "Heal": "UTOPIA.Actions.Trigger.heal",
      "Condition": "UTOPIA.Actions.Trigger.condition",
      "ConditionLost": "UTOPIA.Actions.Trigger.conditionLost",
      "MyTurn": "UTOPIA.Actions.Trigger.myTurn",
      "EnemyTurn": "UTOPIA.Actions.Trigger.enemyTurn",
      "AllyTurn": "UTOPIA.Actions.Trigger.allyTurn",
      "StartRound": "UTOPIA.Actions.Trigger.startRound",
      "EndRound": "UTOPIA.Actions.Trigger.endRound",
      "StaminaLost": "UTOPIA.Actions.Trigger.staminaLost",
      "Contest": "UTOPIA.Actions.Trigger.contest",
      "Test": "UTOPIA.Actions.Trigger.test",
      "FocusLost": "UTOPIA.Actions.Trigger.focusLost",
      "ConcentrationLost": "UTOPIA.Actions.Trigger.concentrationLost",
      "Block": "UTOPIA.Actions.Trigger.block",
      "Dodge": "UTOPIA.Actions.Trigger.dodge",
      "SpellCast": "UTOPIA.Actions.Trigger.spellCast",
      "CraftStarted": "UTOPIA.Actions.Trigger.craftStarted",
      "CraftFinished": "UTOPIA.Actions.Trigger.craftFinished",
      "ForageStarted": "UTOPIA.Actions.Trigger.forageStarted",
      "ForageFinished": "UTOPIA.Actions.Trigger.forageFinished",
      "RestStarted": "UTOPIA.Actions.Trigger.restStarted",
      "RestFinished": "UTOPIA.Actions.Trigger.restFinished",
      "BlindAwareness": "UTOPIA.Actions.Trigger.awareness",
    }});
    schema.triggers = new fields.SetField(trigger);
    schema.recharge = new fields.StringField({ required: false, nullable: false, initial: "Immediate", choices: {
      "Immediate": "UTOPIA.Actions.Recharge.immediate",
      "MyTurn": "UTOPIA.Actions.Recharge.myTurn",
      "Turn": "UTOPIA.Actions.Recharge.turn",
      "Round": "UTOPIA.Actions.Recharge.round",
      "Minute": "UTOPIA.Actions.Recharge.minute",
      "Hour": "UTOPIA.Actions.Recharge.hour",
      "Day": "UTOPIA.Actions.Recharge.day",
      "Week": "UTOPIA.Actions.Recharge.week",
    }});
    schema.target = new fields.StringField({ required: false, nullable: false, initial: "None", choices: {
      "None": "UTOPIA.Actions.Target.none",
      "Self": "UTOPIA.Actions.Target.self",
      "Ally": "UTOPIA.Actions.Target.ally",
      "Enemy": "UTOPIA.Actions.Target.enemy",
      "Any": "UTOPIA.Actions.Target.any",
    }});
    schema.cost = new fields.NumberField({ required: false, nullable: false, initial: 1 });
    schema.source = new fields.DocumentUUIDField({ required: false, nullable: true });

    return schema;
  }
}