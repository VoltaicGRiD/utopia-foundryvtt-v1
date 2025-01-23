import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaAction extends UtopiaItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.formula = new fields.StringField({ blank: true });
    schema.description = new fields.StringField({ blank: true });
    schema.flavor = new fields.StringField({ blank: true });

    schema.rules = new fields.JSONField({ initial: JSON.stringify({}) });
    schema.type = new fields.StringField({ required: false, nullable: false, initial: "Standard", choices: {
      "Standard": "UTOPIA.Item.Actions.Type.standard",
      "Interrupt": "UTOPIA.Item.Actions.Type.interrupt",
      "Special": "UTOPIA.Item.Actions.Type.special",
      "Free": "UTOPIA.Item.Actions.Type.free",
    }});
    const trigger = new fields.StringField({ required: false, nullable: false, initial: "Manual", choices: {
      "Manual": "UTOPIA.Item.Actions.Trigger.manual",
      "SHPDamageTaken": "UTOPIA.Item.Actions.Trigger.shpDamage",
      "SHPDamageDealt": "UTOPIA.Item.Actions.Trigger.shpDamageDealt",
      "DHPDamageTaken": "UTOPIA.Item.Actions.Trigger.dhpDamage",
      "DHPDamageDealt": "UTOPIA.Item.Actions.Trigger.dhpDamageDealt",
      "Heal": "UTOPIA.Item.Actions.Trigger.heal",
      "Condition": "UTOPIA.Item.Actions.Trigger.condition",
      "ConditionLost": "UTOPIA.Item.Actions.Trigger.conditionLost",
      "MyTurn": "UTOPIA.Item.Actions.Trigger.myTurn",
      "EnemyTurn": "UTOPIA.Item.Actions.Trigger.enemyTurn",
      "AllyTurn": "UTOPIA.Item.Actions.Trigger.allyTurn",
      "TokenMovement": "UTOPIA.Item.Actions.Trigger.tokenMovement",
      "StartRound": "UTOPIA.Item.Actions.Trigger.startRound",
      "EndRound": "UTOPIA.Item.Actions.Trigger.endRound",
      "StaminaLost": "UTOPIA.Item.Actions.Trigger.staminaLost",
      "Contest": "UTOPIA.Item.Actions.Trigger.contest",
      "Test": "UTOPIA.Item.Actions.Trigger.test",
      "FocusLost": "UTOPIA.Item.Actions.Trigger.focusLost",
      "ConcentrationLost": "UTOPIA.Item.Actions.Trigger.concentrationLost",
      "Block": "UTOPIA.Item.Actions.Trigger.block",
      "Dodge": "UTOPIA.Item.Actions.Trigger.dodge",
      "SpellCast": "UTOPIA.Item.Actions.Trigger.spellCast",
      "CraftStarted": "UTOPIA.Item.Actions.Trigger.craftStarted",
      "CraftFinished": "UTOPIA.Item.Actions.Trigger.craftFinished",
      "ForageStarted": "UTOPIA.Item.Actions.Trigger.forageStarted",
      "ForageFinished": "UTOPIA.Item.Actions.Trigger.forageFinished",
      "RestStarted": "UTOPIA.Item.Actions.Trigger.restStarted",
      "RestFinished": "UTOPIA.Item.Actions.Trigger.restFinished",
      "BlindAwareness": "UTOPIA.Item.Actions.Trigger.awareness",
    }});
    schema.triggers = new fields.SetField(trigger);
    schema.triggerArguments = new fields.StringField({ required: false, nullable: true });
    schema.triggerPrompt = new fields.BooleanField({ required: false, nullable: false, initial: true });
    schema.recharge = new fields.StringField({ required: false, nullable: false, initial: "Immediate", choices: {
      "Immediate": "UTOPIA.Item.Actions.Recharge.immediate",
      "MyTurn": "UTOPIA.Item.Actions.Recharge.myTurn",
      "Turn": "UTOPIA.Item.Actions.Recharge.turn",
      "Round": "UTOPIA.Item.Actions.Recharge.round",
      "Minute": "UTOPIA.Item.Actions.Recharge.minute",
      "Hour": "UTOPIA.Item.Actions.Recharge.hour",
      "Day": "UTOPIA.Item.Actions.Recharge.day",
      "Week": "UTOPIA.Item.Actions.Recharge.week",
    }});
    schema.target = new fields.StringField({ required: false, nullable: false, initial: "None", choices: {
      "None": "UTOPIA.Item.Actions.Target.none",
      "Self": "UTOPIA.Item.Actions.Target.self",
      "Ally": "UTOPIA.Item.Actions.Target.ally",
      "Enemy": "UTOPIA.Item.Actions.Target.enemy",
      "Any": "UTOPIA.Item.Actions.Target.any",
    }});
    //schema.cost = new fields.NumberField({ required: true, nullable: false, initial: 1 });
    schema.cost = new fields.StringField({ required: false, nullable: true, initial: "1", choices: {
      "0": "0",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "inherit": "UTOPIA.Item.Actions.Cost.inherit",
      "double": "UTOPIA.Item.Actions.Cost.double",
    }});
    schema.stamina = new fields.NumberField({ required: false, nullable: false, initial: 0 });

    schema.source = new fields.DocumentUUIDField({ required: false, nullable: true });
    schema.rules = new fields.ObjectField({ required: false, nullable: false, initial: {} });

    return schema;
  }

  prepareDerivedData() {

  }
}