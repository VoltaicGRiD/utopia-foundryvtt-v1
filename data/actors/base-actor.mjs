import getSetting from "../../system/helpers/getSetting.mjs";

const fields = foundry.data.fields;

const number = (initial = 0) => {
  return new fields.NumberField({
    required: true,
    nullable: false,
    initial: initial,
  });
}

const slot = (augmentable = true) => {
  return new fields.SchemaField({
    equipped: new fields.DocumentIdField({
      required: true,
      nullable: true,
      initial: null,
    }),
    augment: new fields.DocumentIdField({
      required: true,
      nullable: true,
      initial: null,
    }),
  });
}

export class BaseActorModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const s = {}; // Schema definition
    
    // ------ Resources ------
    s.shp = new fields.SchemaField({
      value: number(),
    });

    s.dhp = new fields.SchemaField({
      value: number(),
    });

    s.stamina = new fields.SchemaField({
      value: number(),   
    });

    s.silver = new fields.SchemaField({
      value: number(0),
    });

    // ------ Traits and Subtraits ------
    s.traits = new fields.SchemaField({}); // Initialize traits as an object
    s.subtraits = new fields.SchemaField({}); // Initialize subtraits as an object

    for (const trait of getSetting("traits").keys) {
      s.traits.fields[trait] = new fields.SchemaField({
        value: number(),
      });
    }

    for (const subtrait of getSetting("subtraits").keys) {
      s.subtraits.fields[subtrait] = new fields.SchemaField({
        value: number(),
      });
    }

    // ------ Artistries ------
    s.artistries = new fields.SchemaField({});

    for (const artistry of getSetting("artistries").keys) {
      s.artistries.fields[artistry] = new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      });
    }

    // ------ Defenses ------
    s.defenses = new fields.SchemaField({});

    for (const defense of getSetting("damageTypes").entries.filter(([key, value]) => value.initialDefense > 0).map(([key, value]) => key)) {
      s.defenses.fields[defense] = new fields.SchemaField({
        value: number(1),
      });
    }

    // ------ Travel ------
    s.travel = new fields.SchemaField({
      land: new fields.SchemaField({
        value: number(1),
      }),
      water: new fields.SchemaField({
        value: number(0),
      }),
      air: new fields.SchemaField({
        value: number(0),
      }),
    });

    // ------ Experience ------
    s.experience = number(1000);
    s.level = number(10);

    // ------ Ratings ------
    s.block = number(1);
    s.dodge = number(1);

    // ------ Slots ------
    s.handheld = new fields.ArrayField(slot(false), {
      required: true,
      nullable: false,
      initial: [],
    }); // Handheld items, like weapons or shields
    s.head = slot();
    s.neck = slot();
    s.chest = slot();
    s.back = slot();
    s.hands = slot(); // Hands slot, used for gloves, gauntlets, etc.
    s.ring = slot();
    s.waist = slot();
    s.feet = slot();

    // ------ Spellcasting ------
    s.spellcasting = new fields.SchemaField({
      discount: number(0), // Discount on spellcasting costs
    });

    // ------ Actions ------
    s.turnActions = new fields.SchemaField({
      value: number(6),
      bonus: number(0),
      max: number(6)
    });
    
    s.interruptActions = new fields.SchemaField({
      value: number(2),
      bonus: number(0),
      max: number(2)
    });

    s.specialActions = new fields.SchemaField({
      value: number(0),
      bonus: number(0),
      max: number(0)
    });

    // ------ Crafting ------
    s.crafting = new fields.ObjectField({
      required: true,
      nullable: false,
      initial: {},
    })

    for (const component of getSetting("components").keys) {
      for (const rarity of getSetting("rarities").keys) {
        s.crafting[component] = new fields.SchemaField({
          [rarity]: number(0),
        }); 
      }
    }

    // ------ Metadata ------
    s._decendantItemTracker = new fields.ArrayField(new fields.SchemaField({
      lookup: new fields.StringField({ required: true, nullable: false }),
      lookupName: new fields.StringField({ required: true, nullable: false }),
      granted: new fields.StringField({ required: true, nullable: false }),
      grantedName: new fields.StringField({ required: true, nullable: false }), 
    }));

    s._talentTracking = new fields.ArrayField(new fields.SchemaField({
      tree: new fields.DocumentUUIDField({ required: true, nullable: false }),
      branch: new fields.NumberField({ required: true, nullable: false }),
      tier: new fields.NumberField({ required: true, nullable: false }),
      originalUuid: new fields.StringField({ required: true, nullable: false }),
      talent: new fields.DocumentUUIDField({ required: true, nullable: false }),
    }))

    s._talentOptions = new fields.ObjectField({
      required: true,
      nullable: false,
      initial: {},
    });

    s._species = new fields.DocumentUUIDField({
      required: false, 
      nullable: true,
      initial: null,
    }); // UUID of the species item, used for tracking the species of the actor

    s._enteredStasis = number(0); // Timestamp when the actor entered stasis, used for calculating stasis duration

    return s;
  }

  // Executes before processing Active Effects
  prepareBaseData() {
    console.log("Preparing base data for actor", this.parent.name, this);

    // ------ Traits and Subtraits ------
    for (const subtrait of getSetting("subtraits").keys) {    
      this.subtraits[subtrait].bonus = 0;
    }

    for (const [key, trait] of getSetting("traits").entries) {
      this.traits[key].value = 0;
      this.traits[key].bonus = 0;
    }

    // ------ Defenses ------
    for (const defense of getSetting("damageTypes").entries.filter(([key, value]) => value.initialDefense > 0).map(([key, value]) => key)) {
      this.defenses[defense].bonus = 0;
    }

    // ------ Travel ------
    const { water, land, air } = this.travel;
    land.bonus = 1;
    water.bonus = 0;
    air.bonus = 0;
    
    // ------ Experience ------
    this.experience = 1000;
    this.level = 10;
    this.levelBonus = 0;

    // ------ Points ------
    this.points = {
      standardTalents: { total: 0 },
      specialistTalents: { total: 0 },
      subtraits: { total: 0 },
      languages: { total: 0 }
    }

    // ------ Slots ------
    this.slotCapacity = 0;

    // ------ Base Actions ------
    this.actions = {
      deepBreath: {
        bonus: 0,
      },
      weaponless: {
        damage: "1d4[physical]",
      }
    }

    // ------ Action Points ------
    // this.ta = {
    //   value: this.turnActions,
    //   bonus: 0,
    // }; // Turn actions
    // this.ia = {
    //   value: this.interruptActions,
    //   bonus: 0,
    // }; // Interrupt actions
    // this.sa = {
    //   value: 0,
    // }; // Special actions, used for special encounters or special situations, defined by the GM

    // ------ Immunities and Weaknesses ------
    this.immunities = [];
    this.resistances = [];
    this.weaknesses = [];
    this.vulnerabilities = [];

    // ------ Base Traits ------
    this.accuracyTrait = "dex";
    this.grappleTrait = "str";
    this.resistSpellTrait = "wil";
    this.turnOrderTrait = "spd";
    this.spellcapTrait = "res";

    // ------ Spellcasting ------
    this.spellcasting = {
      spellcapMultiplier: 1,
    };

    // ------ Crafting ------
    this.crafting.craftAnywhere = false; // Can craft anywhere, not just in a workshop
    this.crafting.timeModifier = 1; // Time modifier for crafting, default is 1 (normal speed), (0.5 is half speed, 2 is double speed, etc.)
    this.crafting.maxRarity = 0; // Maximum rarity for crafting, default is "crude" (0), (1 is "common", 2 is "uncommon", etc.)
    this.crafting.canSpecialize = false; // Can specialize gear for creatures that require specialized gear, like Oxtii
    this.crafting.augmentTime = -1; // Turn actions required to augment an item, default is -1 (1 hour required by default, cannot be done in combat without a talent)
    this.crafting.augmentDamage = true; // Whether removing an augment causes damage, default is true

    // ------ Conditions ------
    this.permanentConditions = {
      deaf: false,
      blind: false,
      dazed: false,
    }
    this.fatigue = 0; // Fatigue level, default is 0 (not fatigued)
    this.noSleepFatigue = true; // Whether the creature gains fatigue from not sleeping, default is true

    // ------ Miscellaneous ------
    this.size = 2; // Default size is Medium
  }

  // Executes after processing Active Effects
  prepareDerivedData() {
    // ------ Traits and Subtraits ------
    for (const subtrait of getSetting("subtraits").keys) {
      this.subtraits[subtrait].total = this.subtraits[subtrait].value + this.subtraits[subtrait].bonus;
      this.subtraits[subtrait].mod = this.subtraits[subtrait].total - 4; // Mods can be negative
    }

    for (const [key, trait] of getSetting("traits").entries) {
      this.traits[key].total = trait.subtraits.reduce((total, subtrait) => {
        return total + (this.subtraits[subtrait]?.total || 0);
      }, this.traits[key].value) + this.traits[key].bonus;
      this.traits[key].mod = this.traits[key].total - 4; // Mods can be negative
    }

    // ------ Travel ------
    const { water, land, air } = this.travel;
    land.total = new Roll(`${land.value} + ${land.bonus}`).total;
    water.total = new Roll(`${water.value} + ${water.bonus}`).total;
    air.total = new Roll(`${air.value} + ${air.bonus}`).total;

    // ------ Experience ------
    this.levelAvailable = this.experience >= ((this.level + 1) * 100);

    // ------ Points ------
    const { standardTalents, specialistTalents, subtraits, languages } = this.points;
    standardTalents.total = this.level;
    standardTalents.available = standardTalents.total - this.parent.items.filter(i => i.type === "talent").reduce((total, item) => {
      return total + (item.system.body + item.system.mind + item.system.soul);
    }, 0);

    specialistTalents.total = Math.floor(this.level / 10); // 1 at level 10, 2 at level 20, etc.
    specialistTalents.available = specialistTalents.total - this.parent.items.filter(i => i.type === "specialistTalent").length;

    subtraits.total = this.level + 5; // 5 subtraits at level 1, 6 at level 2, etc.
    subtraits.available = this.level - Object.values(this.subtraits).map(subtrait => subtrait.value || 0).reduce((total, value) => total + value, 0);

    // ------ Attributes ------
    this.body = this.parent.items.filter(i => i.type === "talent" && i.system.body > 0).reduce((total, item) => {
      return total + item.system.body;
    }, 0);
    this.mind = this.parent.items.filter(i => i.type === "talent" && i.system.mind > 0).reduce((total, item) => {
      return total + item.system.mind;
    }, 0);
    this.soul = this.parent.items.filter(i => i.type === "talent" && i.system.soul > 0).reduce((total, item) => {
      return total + item.system.soul;
    }, 0);

    const species = this.parent.items.find(i => i.type === "species") ?? {};
    if (species.system) {
      this.constitution = species.system.constitution || 0;
      this.endurance = species.system.endurance || 0;
      this.effervescence = species.system.effervescence || 0;
    }

    // ------ Ratings ------
    this.blockRating = `${this.block}d4`;
    this.dodgeRating = `${this.dodge}d12`;

    // ------ Talent Options ------
    for (const [key, value] of Object.entries(this._talentOptions)) {
      if (value === undefined || value === null) {
        this[key] = value;
      }
    }

    // ------ Subtrait Maximums ------
    for (const [key, trait] of getSetting("traits").entries) {
      trait.subtraits.forEach(subtrait => {
        if (this.subtraits[subtrait]) {
          this.subtraits[subtrait].max = this[trait.maximum];
        }
      }); // Set the subtrait maximum based on the 'body', 'mind', or 'soul' value, set in its parent trait's definition
    }

    // ------ Defenses ------
    for (const [key, value] of getSetting("damageTypes").entries) {
      if (this.defenses[key]) {
        this.defenses[key].total = this.defenses[key].value + this.defenses[key].bonus;
      }
    }

    // ------ Spellcasting ------
    this.spellcasting.spellcap = Math.floor(this.subtraits[this.spellcapTrait].total) * this.spellcasting.spellcapMultiplier;

    // ------ Attributes ------
    this.constitution = this.constitution || 0;
    this.endurance = this.endurance || 0;
    this.effervescence = this.effervescence || 0;

    // ------ Resources ------
    this.shp.max = (this.body * this.constitution) + this.level;
    this.dhp.max = (this.soul * this.effervescence) + this.level;
    this.stamina.max = (this.mind * this.endurance) + this.level;

    // ------ Actions ------
    this.maxTurnActions = this.turnActions;

    // ------ Item-based Data ------
    this.handleTalentEffects();
  }

  handleTalentEffects() {
    // Handle talents that grant effects, like Artistry talents and Prowess talents
    for (const item of this.parent.items.filter(i => i.type === "talent")) {
      const options = item.system.options;
      if (Object.keys(options).length > 0) {
        for (const [key, value] of Object.entries(options)) {
          const selectedOption = this._talentOptions[key] || {};
          if (value && selectedOption) {

          }            
        } 
      }
    }
  }

  get talentOptions() {
    return this._talentOptions;
  }

  get takenTalents() {
    return this._talentTracking.map(t => t.originalUuid);
  }

  static getSystemPaths() {
    const paths = {};

    for (const [key, value] of Object.entries(this.schema.fields)) {
      if (value.fields && Object.keys(value.fields).length > 0) {
        for (const [subKey, subValue] of Object.entries(value.fields)) {
          paths[`${key}.${subKey}`] = subValue.constructor.name;
        }
      }
      else {
        paths[key] = value.constructor.name;
      }
    }

    return paths;
  }

  get fields() {
    const localizedOutput = {};

    localizedOutput.shp = game.i18n.localize("UTOPIA.ActorFields.shp");
    localizedOutput.dhp = game.i18n.localize("UTOPIA.ActorFields.dhp");
    localizedOutput.stamina = game.i18n.localize("UTOPIA.ActorFields.stamina");
    for (const [key, trait] of getSetting("traits").entries) {
      localizedOutput[`traits.${key}.bonus`] = `${game.i18n.localize(trait.label)} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;
    }
    for (const [key, subtrait] of getSetting("subtraits").entries) {
      localizedOutput[`subtraits.${key}.bonus`] = `${game.i18n.localize(subtrait.label)} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;
    }
    for (const [key, value] of getSetting("damageTypes").entries) {
      localizedOutput[`defenses.${key}.bonus`] = `${game.i18n.localize(value.label)} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;
    }
    localizedOutput['travel.land.bonus'] = `${game.i18n.localize("UTOPIA.GenericField.Land")} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;
    localizedOutput['travel.water.bonus'] = `${game.i18n.localize("UTOPIA.GenericField.Water")} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;
    localizedOutput['travel.air.bonus'] = `${game.i18n.localize("UTOPIA.GenericField.Air")} ${game.i18n.localize(`UTOPIA.GenericField.Bonus`)}`;

    return localizedOutput;
  }
}