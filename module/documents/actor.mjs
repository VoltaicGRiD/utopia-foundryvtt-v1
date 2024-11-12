import isNumeric from "../helpers/numeric.mjs";
import searchTraits from "../helpers/searchTraits.mjs";

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
    
    // Deep HP (DHP) is calculated from Soul points
    actorData.system.dhp.max = soul * eff + lvl;

    // Maximum stamina is calculated from mind
    actorData.system.stamina.max = mind * end + lvl;

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
    }

    console.log(actorData.system.species);

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {
      console.log(i.type);
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
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
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
    let grants = item.system.grants;
    console.log(item);

    try {
      if (grants.subtraits.indexOf(',') > -1) {
        let subtraits = grants.subtraits.split(',')
    
        subtraits.forEach(async subtrait => {
          let parsed = String(subtrait.trim());
          let trait = await searchTraits(this.system.traits, parsed);

          console.log(parsed);
          console.log(trait);
    
          this.update({
            system: {
              traits: {
                [trait]: {
                  subtraits: {
                    [parsed]: {
                      gifted: true
                    }
                  }
                }    
              }
            }
          })  
        })    
      }
    } catch {
      let points = this.system.points.gifted;
      
      if (isNumeric(grants.subtraits)) {
        points += parseInt(grants.subtraits);
      }
      else {
        points += grants.subtraits;
      }

      this.update({
        system: {
          points: {
            gifted: points
          }
        }
      })
    }

    this.update({
      system: {
        species: item,
        block: grants['block'],
        dodge: grants['dodge'],
        attributes: {
          constitution: grants['constitution'],
          endurance: grants['endurance'],
          effervescence: grants['effervescence']
        }
      }
    })
  }
}
