import UtopiaActorBase from "../base-actor.mjs";

export default class UtopiaCharacter extends UtopiaActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      constitution: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
      endurance: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
      effervescence: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over trait names and create a new SchemaField for each.
    schema.traits = new fields.SchemaField(Object.keys(CONFIG.UTOPIA.traits).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    // Iterate over subtrait names and create a new SchemaField for each.
    schema.subtraits = new fields.SchemaField(Object.keys(CONFIG.UTOPIA.subtraits).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
      });
      return obj;
    }, {}));

    schema.points = new fields.SchemaField({
      subtrait: new fields.NumberField({ ...requiredInteger, initial: 15 }),
      talent: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      specialist: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      body: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mind: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      soul: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    schema.rangedTDModifier = new fields.NumberField({ ...requiredInteger, initial: 0 });

    schema.components = new fields.SchemaField({
      crude: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
      common: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
      extraordinary: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
      rare: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
      legendary: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
      mythical: new fields.SchemaField({
        material: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        refinement: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        power: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
      }),
    });

    //#region Example Crafting Material Table
  // <table class="crafting-components-table">
  //   <tr>
  //     <th></th>
  //     <th>Material</th>
  //     <th>Refinement</th>
  //     <th>Power</th>
  //   </tr>
  //   <tr>
  //     <th>Crude</th>
  //     <td>{{formInput systemFields.components.fields.crude.fields.material value=system.components.crude.material name='system.components.crude.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.crude.fields.refinement value=system.components.crude.refinement name='system.components.crude.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.crude.fields.power value=system.components.crude.power name='system.components.crude.power' localize=true}}</td>
  //   </tr>
  //   <tr>
  //     <th>Common</th>
  //     <td>{{formInput systemFields.components.fields.common.fields.material value=system.components.common.material name='system.components.common.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.common.fields.refinement value=system.components.common.refinement name='system.components.common.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.common.fields.power value=system.components.common.power name='system.components.common.power' localize=true}}</td>
  //   </tr>
  //   <tr>
  //     <th>Extraordinary</th>
  //     <td>{{formInput systemFields.components.fields.extraordinary.fields.material value=system.components.extraordinary.material name='system.components.extraordinary.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.extraordinary.fields.refinement value=system.components.extraordinary.refinement name='system.components.extraordinary.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.extraordinary.fields.power value=system.components.extraordinary.power name='system.components.extraordinary.power' localize=true}}</td>
  //   </tr>
  //   <tr>
  //     <th>Rare</th>
  //     <td>{{formInput systemFields.components.fields.rare.fields.material value=system.components.rare.material name='system.components.rare.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.rare.fields.refinement value=system.components.rare.refinement name='system.components.rare.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.rare.fields.power value=system.components.rare.power name='system.components.rare.power' localize=true}}</td>
  //   </tr>
  //   <tr>
  //     <th>Legendary</th>
  //     <td>{{formInput systemFields.components.fields.legendary.fields.material value=system.components.legendary.material name='system.components.legendary.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.legendary.fields.refinement value=system.components.legendary.refinement name='system.components.legendary.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.legendary.fields.power value=system.components.legendary.power name='system.components.legendary.power' localize=true}}</td>
  //   </tr>
  //   <tr>
  //     <th>Mythical</th>
  //     <td>{{formInput systemFields.components.fields.mythical.fields.material value=system.components.mythical.material name='system.components.mythical.material' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.mythical.fields.refinement value=system.components.mythical.refinement name='system.components.mythical.refinement' localize=true}}</td>
  //     <td>{{formInput systemFields.components.fields.mythical.fields.power value=system.components.mythical.power name='system.components.mythical.power' localize=true}}</td>
  //   </tr>
  // </table>
    //#endregion

    return schema;
  }

  prepareDerivedData() {
    const actorData = this.parent;

    let bodyScore = 0;
    let mindScore = 0;
    let soulScore = 0;

    let artistries = [];

    for (let i of actorData.items) {
      if (i.type === 'talent') {
        bodyScore += parseInt(i.system.points.body);
        mindScore += parseInt(i.system.points.mind);
        soulScore += parseInt(i.system.points.soul);

        if (i.system.category && i.system.category.toLowerCase().includes("artistry")) {
          artistries.push(Array.from(i.system.choices)[0]);
        }
      }
    }

    actorData.system.artistries = artistries;

    actorData.system.points.body = parseInt(bodyScore);
    actorData.system.points.mind = parseInt(mindScore);
    actorData.system.points.soul = parseInt(soulScore);

    // Do we calculate the level from the experience,
    // or do we calculate the experience from the level?

    // Characters start at level 10, with 0 XP total,
    // Each level increases the XP requirement by 100
    // I think we have a global EXP value for the character
    // which is used to calculate both the level and the
    // experience required for the next level.

    // The SRD states that the level is equivalent to the
    // sum of all unspent, and spent, Talent Points.

    // The SRD also states that the EXP required for the next
    // level is equal to the current level * 100.

    // Ensure experience and level are initialized
    if (!actorData.system.experience) {
      actorData.system.experience = { value: 0 };
    }

    if (typeof actorData.system.level !== 'number') {
      actorData.system.level = 10;
    }

    // Ensure experience.value is a number
    actorData.system.experience.value = Number(actorData.system.experience.value) || 0;

    // Calculate the current level based on total experience
    actorData.system.level = calculateLevelFromExperience(actorData.system.experience.value);

    // Calculate experience thresholds for the current and next levels
    actorData.system.experience.previous = getTotalExpForLevel(actorData.system.level);
    actorData.system.experience.next = getTotalExpForLevel(actorData.system.level + 1);

    // Functions for experience calculations
    function getTotalExpForLevel(N) {
      // Characters start at level 10 with 0 XP
      if (N <= 10) return 0;
      return 100 * (((N - 1) * N) / 2 - 45);
    }

    function calculateLevelFromExperience(expValue) {
      // Solve the quadratic equation: N^2 - N - 2S = 0
      let S = expValue / 100 + 45;
      let discriminant = 1 + 8 * S;
      let sqrtDiscriminant = Math.sqrt(discriminant);
      let N = (1 + sqrtDiscriminant) / 2;
      return Math.floor(N);
    }

    actorData.system.points.talent = actorData.system.level - (actorData.system.points.body + actorData.system.points.mind + actorData.system.points.soul);

    const body = actorData.system.points.body;
    const mind = actorData.system.points.mind;
    const soul = actorData.system.points.soul;
    const con = actorData.system.attributes.constitution;
    const end = actorData.system.attributes.endurance;
    const eff = actorData.system.attributes.effervescence;
    const lvl = actorData.system.level;

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

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.traits) {
      for (let [k,v] of Object.entries(this.traits)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    if (this.subtraits) {
      for (let [k,v] of Object.entries(this.subtraits)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;
    data.shp = this.attributes.shp.value;
    data.dhp = this.attributes.dhp.value;
    data.blr = this.attributes.blr.value;
    data.dor = this.attributes.dor.value;

    return data
  }
}