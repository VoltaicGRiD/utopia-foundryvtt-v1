import isNumeric from "../helpers/numeric.mjs";
import searchTraits from "../helpers/searchTraits.mjs";
import { UtopiaChatMessage } from "../sheets/chat-message.mjs";
import { shortToLong, longToShort } from "../helpers/traitNames.mjs";
import { calculateFavor } from "../helpers/favorHandler.mjs";

/**
 * Extend the base A[c]tor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class UtopiaActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.utopia || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    //this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    //sum = sum + systemData.traits[key].subtraits[sub].value;    console.log(systemData);

    let bodyScore = 0;
    let mindScore = 0;
    let soulScore = 0;

    for (let i of actorData.items) {
      if (i.type === 'talent') {
        bodyScore += i.system.points.body;
        mindScore += i.system.points.mind;
        soulScore += i.system.points.soul;
      }
    }

    actorData.system.points.body = bodyScore;
    actorData.system.points.mind = mindScore;
    actorData.system.points.soul = soulScore;

    const lvl = actorData.system.attributes.level.value;
    const body = actorData.system.points.body;
    const mind = actorData.system.points.mind;
    const soul = actorData.system.points.soul;
    const con = actorData.system.attributes.constitution;
    const end = actorData.system.attributes.endurance;
    const eff = actorData.system.attributes.effervescence;

    // Surface HP (SHP) is calculated from Body points
    actorData.system.shp.max = body * con + lvl;
    if (actorData.system.shp.value > actorData.system.shp.max) {
      actorData.system.shp.value = actorData.system.shp.max;
    }
    
    // Deep HP (DHP) is calculated from Soul points
    actorData.system.dhp.max = soul * eff + lvl;
    if (actorData.system.dhp.value > actorData.system.dhp.max) {
      actorData.system.dhp.value = actorData.system.dhp.max;
    }

    // Maximum stamina is calculated from mind
    actorData.system.stamina.max = mind * end + lvl;
    if (actorData.system.stamina.value > actorData.system.stamina.max) {
      actorData.system.stamina.value = actorData.system.stamina.max;
    }

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in actorData.system.traits) {
      const parent = actorData.system.traits[key].parent;

      let subtraits = actorData.system.traits[key].subtraits;
      Object.keys(subtraits).forEach((k) => {
        actorData.system.traits[key].subtraits[k].mod = subtraits[k].value - 4;

        if (actorData.system.traits[key].subtraits[k].gifted === true) {
          switch(parent) {
            case "body":
              actorData.system.traits[key].subtraits[k].max = body * 2;
              break;
            case "mind":
              actorData.system.traits[key].subtraits[k].max = mind * 2;
              break;
            case "soul": 
              actorData.system.traits[key].subtraits[k].max = soul * 2;
              break;
            default:
              actorData.system.traits[key].subtraits[k].max = 99;
              break;
          }

          if (actorData.system.traits[key].subtraits[k].mod < 0) {
            actorData.system.traits[key].subtraits[k].mod = 0;
          }
        }
        else {
          switch(parent) {
            case "body":
              actorData.system.traits[key].subtraits[k].max = body;
              break;
            case "mind":
              actorData.system.traits[key].subtraits[k].max = mind;
              break;
            case "soul": 
              actorData.system.traits[key].subtraits[k].max = soul;
              break;
            default:
              actorData.system.traits[key].subtraits[k].max = 99;
              break;
          }
        }
      });
      
      let sum = 0;
      Object.keys(subtraits).forEach((k) => {
        sum += subtraits[k].value;
      });
      actorData.system.traits[key].value = sum;

      let mod = actorData.system.traits[key].value - 4;
      actorData.system.traits[key].mod = mod;

      // Spellcap is calculated from resolve
      actorData.system.spellcap = actorData.system.traits['wil'].subtraits['res'].value;
    }

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      if (i.type === 'species') {
        actorData.system.species = i;
      }
    }
  }
  
  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    actorData.system.xp = actorData.system.cr * actorData.system.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };
  
    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);
    
    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.traits) {
      for (let [k, v] of Object.entries(data.traits)) {
        data[k] = foundry.utils.deepClone(v);
        data[shortToLong(k)] = foundry.utils.deepClone(v);
        for (let [k2, v2] of Object.entries(data.traits[k].subtraits)) {
          data[k2] = foundry.utils.deepClone(v2);
          data[shortToLong(k2)] = foundry.utils.deepClone(v2);
        }
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  async setSpecies(item) {
    let grants = item.system;
    console.log(grants);

    // Reset all gifted subtraits
    for (let key in this.system.traits) {
      for (let subkey in this.system.traits[key].subtraits) {
        this.update({
          [`system.traits.${key}.subtraits.${subkey}.gifted`]: false
        });
      }
    }
    
    if (grants.subtraits == '[Any 2 Subtraits]') {
      let points = this.system.points.gifted;
      points += 2;
      this.update({
        ['system.points.gifted']: points
      });
    } else {
      let subtraits = grants.subtraits;
        
      subtraits.forEach(async subtrait => {
        // Subtraits look like: [{"value": "TRAIT"}]
        
        let trait = await searchTraits(this.system.traits, subtrait);
        let formattedTrait = longToShort(subtrait.toLowerCase());
  
        this.update({
          [`system.traits.${trait}.subtraits.${formattedTrait}.gifted`]: true
        });
      }); 
    }

    this.update({
      system: {
        species: item,
        block: {
          quantity: grants['block'].quantity,
          size: grants['block'].size
        },
        dodge: {
          quantity: grants['dodge'].quantity,
          size: grants['dodge'].size
        },
        attributes: {
          constitution: grants['constitution'],
          endurance: grants['endurance'],
          effervescence: grants['effervescence']
        }
      }
    })
  }

  async performCheck(trait, flavor = "") {
    let formulaTrait = trait;

    if (trait.length === 3) {
      formulaTrait = shortToLong(trait);
    }

    let defaultCheck = 3;
    let [netFavor, disfavor, favor] = calculateFavor(trait, this.system.disfavors, this.system.favors);    
    let totalCheck = defaultCheck + netFavor;

    let formula = `${totalCheck}d6 + @${formulaTrait}.mod`;

    console.log(formula);
    let rollData = this.getRollData();
    let roll = await new Roll(formula, rollData).roll();
    let tooltip = await roll.getTooltip();
    
    let description = `${formulaTrait.capitalize()} check!`;
    let gifted = rollData[trait].gifted || false;

    const template = 'systems/utopia/templates/chat/check-card.hbs';
    const templateData = {
      actor: this,
      data: rollData,
      formula: roll.formula,
      total: roll.total,
      result: roll.result,
      flavor: flavor,
      tooltip: tooltip,
      gifted: gifted,
      description: description
    }

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
      sound: CONFIG.sounds.dice,
    });

    await UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
  }

  async applyDamage(damage, source, type) {
    console.log(damage, source, type);

    type = type.toLowerCase().trim();
    let defense = this.system.defenses[type] || 0;
    let total = damage - defense;

    if (total < 0) {
      total = 0;
    }

    let shp = this.system.shp.value;
    let dhp = this.system.dhp.value;

    // 24 SHP - 30 Damage = 0 SHP, 6 DHP    
    let newShp = shp - total;
    let newDhp;
    
    let shpDamageTaken = total;
    let dhpDamageTaken = 0;

    if (newShp < 0) {
      shpDamageTaken = shp;
      let remaining = Math.abs(newShp);
      dhpDamageTaken = remaining;
      newShp = 0;
      
      newDhp = dhp - remaining;
    }

    this.update({
      ['system.shp.value']: newShp,
      ['system.dhp.value']: newDhp
    })

    const template = 'systems/utopia/templates/chat/damage-card.hbs';
    const templateData = {
      actor: this,
      data: await this.getRollData(),
      content: `${this.name} takes ${total} [${type.capitalize()}] damage!`,
      shp: shpDamageTaken,
      dhp: dhpDamageTaken
    }

    const chatData = UtopiaChatMessage.applyRollMode({
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      content: await renderTemplate(template, templateData),
      flags: { utopia: { item: this._id } },
    });

    await UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });

    if (this.statuses.has('concentration')) {
      console.log("Creature in concentration was injured!"); 

      let formula = "3d6 + @traits.str.subtraits.for.mod";
      this.performCheck(formula, `${this.name} rolls to maintain concentration!`);
        
      // let rollData = this.getRollData();
      // let roll = await new Roll(formula, rollData).roll();
      // let tooltip = await roll.getTooltip();
      // let rollSuccess = false;      

      // if (roll.total >= total) {
      //   rollSuccess = true;
      // }

      // const template = 'systems/utopia/templates/chat/check-card.hbs';
      // const templateData = {
      //   actor: this,
      //   data: await this.getRollData(),
      //   formula: roll.formula,
      //   total: roll.total,
      //   result: roll.result,
      //   flavor: `${this.name} rolls to maintain concentration!`,
      //   tooltip: tooltip,
      //   success: rollSuccess,
      //   toBeat: total
      // }

      // const chatData = UtopiaChatMessage.applyRollMode({
      //   style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      //   speaker: UtopiaChatMessage.getSpeaker({ actor: this, undefined }),
      //   content: await renderTemplate(template, templateData),
      //   flags: { utopia: { item: this._id } },
      //   system: { dice: roll.dice }
      // });

      // await UtopiaChatMessage.create(chatData, { rollMode: CONST.DICE_ROLL_MODES.PUBLIC, renderSheet: false });
    }
  }
}
