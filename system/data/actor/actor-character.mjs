import { findTrait, longToShort } from "../../helpers/actorTraits.mjs";
import UtopiaActorBase from "../base-actor.mjs";

export default class UtopiaCharacter extends UtopiaActorBase {
  /** @override */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: {
          enabled: true
        }
      }
    });
  }

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredPositiveInteger = { required: true, nullable: false, integer: true, min: 0 };
    const schema = super.defineSchema();

    const subtrait = () => new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      gifted: new fields.BooleanField({ initial: false }),
    });

    schema.actions = new fields.SchemaField({
      turn: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 6, min: 0 }),
        max: new fields.NumberField({...requiredInteger, initial: 6 }),
      }),
      interrupt: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 }),
        max: new fields.NumberField({...requiredInteger, initial: 2 }),
      }),
    });

    // SHP, DHP, and Stamina
    schema.shp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });
    schema.dhp = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });
    schema.stamina = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      max: new fields.NumberField({...requiredInteger, initial: 0 }),
    });

    // Experience
    schema.experience = new fields.SchemaField({
      level: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      previous: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      next: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    // Block and Dodge
    schema.block = new fields.SchemaField({
      quantity: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
      size: new fields.NumberField({ ...requiredInteger, initial: 4 }),
    });
    schema.dodge = new fields.SchemaField({
      quantity: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
      size: new fields.NumberField({ ...requiredInteger, initial: 12 }),
    });

    // Defenses
    schema.defenses = new fields.SchemaField({  
      chill: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      energy: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      heat: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      physical: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      psyche: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    // TODO: Add validation that the strings are one of the traits or subtraits
    // Favors and Disfavors
    schema.favors = new fields.ArrayField(new fields.StringField());
    schema.disfavors = new fields.ArrayField(new fields.StringField());

    // Talent Trees
    schema.trees = new fields.ArrayField(new fields.StringField());
    
    // TODO: Add validation that the strings are one of the valid damage types
    // Resistance, Immunity, and Vulnerability
    schema.resistances = new fields.ArrayField(new fields.StringField());
    schema.immunities = new fields.ArrayField(new fields.StringField());
    schema.vulnerabilities = new fields.ArrayField(new fields.StringField());

    // Spellcap
    schema.spellcap = new fields.SchemaField({
      trait: new fields.StringField({ required: true, nullable: false, initial: "res" }),
      bonus: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    
    // Attributes
    schema.attributes = new fields.SchemaField({
      constitution: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      endurance: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      effervescence: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    // Points
    schema.points = new fields.SchemaField({
      body: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      mind: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      soul: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      talent: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      specialist: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      subtrait: new fields.SchemaField({
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      gifted: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    schema.species = new fields.ObjectField({ required: true, nullable: false, initial: {}});
    schema.size = new fields.StringField({ required: true, nullable: false, initial: "med", choices: {
      "sm": "UTOPIA.Actor.Size.sm",
      "med": "UTOPIA.Actor.Size.med",
      "lg": "UTOPIA.Actor.Size.lg",
    }});

    // Traits
    schema.traits = new fields.SchemaField({
      agi: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          spd: subtrait(),
          dex: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      str: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          pow: subtrait(),
          for: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      int: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          eng: subtrait(),
          mem: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      wil: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          res: subtrait(),
          awa: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      dis: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          por: subtrait(),
          stu: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
      cha: new fields.SchemaField({
        subtraits: new fields.SchemaField({
          app: subtrait(),
          lan: subtrait(),
        }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    })

    schema.enableArtifice = new fields.BooleanField({ initial: false });
    schema.artificeLevel = new fields.NumberField({ ...requiredInteger, initial: -1 }); // -1 means not enabled

    schema.enableSpellcraft = new fields.BooleanField({ initial: false });
    schema.spellcraftArtistries = new fields.SetField(new fields.StringField());

    schema.components = new fields.SchemaField({
      crude: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      common: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      extraordinary: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      rare: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      legendary: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
      mythical: new fields.SchemaField({
        material: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        refinement: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
        power: new fields.NumberField({ ...requiredPositiveInteger, initial: 0 }),
      }),
    })

    schema.resource = new fields.SchemaField({
      resourceId: new fields.StringField({required: true, nullable: false, initial: foundry.utils.randomID(16)}),
      name: new fields.StringField({required: true, nullable: false}),
      description: new fields.StringField({required: true, nullable: false, initial: ""}),
      max: new fields.NumberField({...requiredInteger, initial: 0}),
      amount: new fields.NumberField({...requiredInteger, initial: 0}),
      secret: new fields.BooleanField({required: true, initial: false, gmOnly: true}),
      source: new fields.BooleanField({required: true, initial: false}),
      propagateToActor: new fields.BooleanField({required: true, initial: true}),
      recoverAmount: new fields.NumberField({...requiredInteger, initial: 0}),
      recoverInterval: new fields.StringField({required: true, nullable: false, initial: "none", choices: {
        "none": "UTOPIA.Item.Gear.Resource.RecoverInterval.none",
        "turn": "UTOPIA.Item.Gear.Resource.RecoverInterval.turn",
        "round": "UTOPIA.Item.Gear.Resource.RecoverInterval.round",
        "rest": "UTOPIA.Item.Gear.Resource.RecoverInterval.rest",
        "day": "UTOPIA.Item.Gear.Resource.RecoverInterval.day",
        "session": "UTOPIA.Item.Gear.Resource.RecoverInterval.session",
      }}),
    });
    schema.resources = new fields.ArrayField(schema.resource);

    schema.equipmentSlots = new fields.SchemaField({
      head: new fields.DocumentIdField({ required: false, nullable: true, }),
      neck: new fields.DocumentIdField({ required: false, nullable: true, }),
      back: new fields.DocumentIdField({ required: false, nullable: true, }),
      chest: new fields.DocumentIdField({ required: false, nullable: true, }),
      waist: new fields.DocumentIdField({ required: false, nullable: true, }),
      hands: new fields.DocumentIdField({ required: false, nullable: true, }),
      ring: new fields.DocumentIdField({ required: false, nullable: true, }),
      feet: new fields.DocumentIdField({ required: false, nullable: true, }),
    });
    schema.slotCapacity = new fields.SchemaField({
      bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      total: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.slots = new fields.NumberField({ ...requiredInteger, initial: 0 });

    schema.travel = new fields.SchemaField({
      land: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      air: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      water: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    return schema;
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
    const overrideFlags = foundry.utils.flattenObject(this.parent.getFlag('utopia', 'overrides') || {});

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData, overrideFlags);
    this._handleOverrides(overrideFlags);
  }

  *allApplicableEffects() {
    for (const effect of this.effects) {
      if (effect.type !== "gear") {
        yield effect;
      }
    } if (CONFIG.ActiveEffect.legacyTransferral) return;
    for (const item of this.items) {
      for (const effect of item.effects) {
        if (effect.type !== "gear") {
          if (effect.transfer) yield effect;
        }
      }
    }
  }

  async _handleOverrides(overrideFlags) {
    const entries = Object.entries(overrideFlags);
    
    for (let [key, value] of entries) {
      console.log(key, value);
      const path = key.split("system.")[1];
      const pathParts = path.split(".");
      
      let obj = this;
      for (let i = 0; i < pathParts.length - 1; i++) {
        obj = obj[pathParts[i]];
      }

      obj[pathParts[pathParts.length - 1]] = value;
    }
  }

  /**
   * Prepare Character type specific data
   */
  async _prepareCharacterData(actorData, overrideFlags) {    
    // Make modifications to data here. For example:
    //sum = sum + systemData.traits[key].subtraits[sub].value;    console.log(systemData);

    this.species = this.parent.items.filter(i => i.type === "species")[0] ?? null;

    const species = {
      con: 0,
      end: 0,
      eff: 0,
      block: {
        size: 0,
        quantity: 0,
      },
      dodge: {
        size: 0,
        quantity: 0,
      },
      subtraits: undefined
    }

    this.points.talent.total = this.points.talent.bonus + this.experience.level;
    this.points.specialist.total = this.points.specialist.bonus + Math.floor(this.experience.level / 10);

    let bodyScore = this.points.body.bonus;
    let mindScore = this.points.mind.bonus;
    let soulScore = this.points.soul.bonus;

    let armor = {
      chill: 1,
      energy: 1,
      heat: 1,
      physical: 1,
      psyche: 1,
    }

    let artistries = [];

    for (let i of this.parent.items) {
      if (i.type === 'talent') {
        bodyScore += parseInt(i.system.points.body);
        mindScore += parseInt(i.system.points.mind);
        soulScore += parseInt(i.system.points.soul);

        this.trees[i.system.tree] = i.system.position;
        
        if (i.system.category && i.system.category.toLowerCase().includes("artistry")) {
          artistries.push(Array.from(i.system.choices)[0]);
        }
      }

      if (i.type === "specialist") {
        this.points.specialist.total -= 1;
      }

      if (i.type === "species") {
        species.con += i.system.constitution;
        species.end += i.system.endurance;
        species.eff += i.system.effervescence;
        species.block.quantity += i.system.block.quantity;
        species.block.size += i.system.block.size;
        species.dodge.quantity += i.system.dodge.quantity;
        species.dodge.size += i.system.dodge.size;
        species.subtraits = i.system.subtraits.map(s => s.length === 3 ? s.toLowerCase() : longToShort(s.toLowerCase()));
      }

      if (i.type === "armor") {
        armor.chill += i.system.chill;
        armor.energy += i.system.energy;
        armor.heat += i.system.heat;
        armor.physical += i.system.physical;
        armor.psyche += i.system.psyche;
      }

      if (i.system.slots && i.system.slots > 0) {
        this.slots += i.system.slots;
      }
    }

    this.points.body.total = bodyScore;
    this.points.mind.total = mindScore;
    this.points.soul.total = soulScore;

    this.points.talent.total -= bodyScore;
    this.points.talent.total -= mindScore;
    this.points.talent.total -= soulScore;

    this.points.gifted.value = species.subtraits ?? "" === "[Any 2 Subtraits]" ? 2 : 0;

    this.artistries = artistries;

    // Get our experience values
    // Calculate experience thresholds for the current and next levels
    this.experience.previous = getTotalExpForLevel(this.experience.level);
    this.experience.next = getTotalExpForLevel(this.experience.level + 1);
    this.experience.percentage = Math.floor((this.experience.value - this.experience.previous) / (this.experience.next - this.experience.previous) * 100);

    // Calculate the current level based on total experience
    const currentLevel = this.experience.level;
    const calulcatedLevel = calculateLevelFromExperience(this.experience.value);

    // Check if the level has increased
    if (calulcatedLevel > currentLevel) {
      this.levelUp();
    }

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

    this.attributes.constitution.total = this.attributes.constitution.bonus + species.con;
    this.attributes.endurance.total = this.attributes.endurance.bonus + species.end;
    this.attributes.effervescence.total = this.attributes.effervescence.bonus + species.eff;

    const body = this.points.body.total;
    const mind = this.points.mind.total;
    const soul = this.points.soul.total;
    const con = this.attributes.constitution.total;
    const end = this.attributes.endurance.total;
    const eff = this.attributes.effervescence.total;
    const lvl = this.experience.level;

    // Surface HP (SHP) is calculated from Body points
    this.shp.max = overrideFlags["system.shp.max"] ?? body * con + lvl;
    if (this.shp.value > this.shp.max) {
      this.shp.value = this.shp.max;
    }
    
    // Deep HP (DHP) is calculated from Soul points
    this.dhp.max = overrideFlags["system.dhp.max"] ?? soul * eff + lvl;
    if (this.dhp.value > this.dhp.max) {
      this.dhp.value = this.dhp.max;
    }

    // Maximum stamina is calculated from mind
    this.stamina.max = overrideFlags["system.stamina.max"] ?? mind * end + lvl;
    if (this.stamina.value > this.stamina.max) {
      this.stamina.value = this.stamina.max;
    }

    // Maximum Turn and Interrupt actions
    this.actions.turn.value >= overrideFlags["system.actions.turn.max"] ?? this.actions.turn.max ? this.actions.turn.value = this.actions.turn.max : 6;
    this.actions.interrupt.value >= overrideFlags["system.actions.interrupt.max"] ?? this.actions.interrupt.max ? this.actions.interrupt.value = this.actions.interrupt.max : 2;

    this.points.subtrait.total = this.points.subtrait.bonus + 15 + this.experience.level - 10;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.traits) {
      const trait = this.traits[key];
      const parent = trait.parent;
      const subtraits = trait.subtraits;

      Object.keys(subtraits).forEach((k) => {
        const subtrait = subtraits[k];
        const gifted = subtrait.gifted;
        if (species.subtraits && Array.isArray(species.subtraits) && species.subtraits.includes(k)) {
          subtrait.gifted = true;
        } 
        else if (species.subtraits && species.subtraits === "[Any 2 Subtraits]") {
          if (subtrait.gifted)
            this.points.gifted.value -= 1;
        }
        subtrait.total = subtrait.value + subtrait.bonus;
        subtrait.mod = subtraits[k].total - 4;
        this.points.subtrait.total -= (subtrait.total - 1);

        switch(parent) {
          case "body":
            subtrait.max = gifted ? body * 2 : body;
            break;
          case "mind":
            subtrait.max = gifted ? mind * 2 : mind;
            break;
          case "soul": 
            subtrait.max = gifted ? soul * 2 : soul;
            break;
          default:
            subtrait.max = 99;
            break;
        }

        if (subtrait.mod < 0 && gifted) {
          subtrait.mod = 0;
        }
      });
      
      let sum = 0;
      Object.keys(subtraits).forEach((k) => {
        sum += subtraits[k].value;
      });

      trait.total = trait.bonus + sum;

      let mod = trait.total - 4;
      trait.mod = mod;
    }

    // Calculate block and dodge
    this.block.size = species.block.size;
    this.dodge.size = species.dodge.size;
    this.block.quantity.total = this.block.quantity.bonus + species.block.quantity;
    this.dodge.quantity.total = this.dodge.quantity.bonus + species.dodge.quantity;

    // Calculate defenses
    this.defenses.chill.total = armor.chill + this.defenses.chill.bonus;
    this.defenses.energy.total = armor.energy + this.defenses.energy.bonus;
    this.defenses.heat.total = armor.heat + this.defenses.heat.bonus;
    this.defenses.physical.total = armor.physical + this.defenses.physical.bonus;
    this.defenses.psyche.total = armor.psyche + this.defenses.psyche.bonus;

    // Spellcap is calculated from resolve
    let spellcap = this.spellcap.bonus;
    spellcap += findTrait(this.parent, this.spellcap.trait).total;
    this.spellcap.total = spellcap;

    // Slot capacity is calculated from size and strength
    const str = this.traits.str.total;
    switch (this.size) {
      case "sm": 
        this.slotCapacity.total = this.slotCapacity.bonus + (2 * str);
        break;
      case "med":
        this.slotCapacity.total = this.slotCapacity.bonus + (5 * str);
        break;
      case "lg":
        this.slotCapacity.total = this.slotCapacity.bonus + (15* str);
        break;
    }

    this._processFlags();
    this._processTalentTrees();

    Hooks.callAll("prepareActorData", this.parent, actorData);
  }

  get slotsRemaining() {
    return this.slotCapacity.total - this.slots;
  }

  canTake(slots) {
    return this.slotsRemaining >= slots;
  }

  async _processTalentTrees() {
    const talents = this.parent.items.filter(f => f.type === "talent");

    for (let talent of talents) {
      const height = talent.system.position;
      const tree = talent.system.tree;

      if (!this.trees[tree]) 
        this.trees[tree] = height;
      else if (this.trees[tree] < height)
        this.trees[tree] = height
    }
  }

  async _processFlags() {
    const flags = this.parent.flags;
    const utopia = flags.utopia ?? {};

    Object.keys(utopia).forEach((key) => { 
      const value = utopia[key] ?? true;

      switch (key) {
        case "dualWielder":
          break;
        case "sageSlayer": 
          break;
        case "mageFighter": 
          break;
        case "intenseConcentration": 
          break;
        case "ironGripped": 
          break;

        case "enableArtifice": 
          this.enableArtifice = true;
        case "enableSpellcraft": 
          this.enableSpellcraft = true;          
        case "artificeLevel": 
          this.artificeLevel = value;
      }
    });
    
    Hooks.callAll("processActorFlags", this.parent, flags);
  }
}