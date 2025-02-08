import UtopiaItemBase from "../base-item.mjs";

export default class UtopiaSpecies extends UtopiaItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;

    const requiredInteger = { required: true, nullable: false, initial: 0 };
    const requiredString = { required: true, nullable: false, initial: "" };

    const schema = super.defineSchema();

    const evolution = () => new fields.SchemaField({
      head: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      neck: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      back: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      chest: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      waist: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      hands: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      ring: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      feet: new fields.NumberField({ ...requiredInteger, initial: 1 }),
    });
    const armors = () => new fields.SchemaField({
      count: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      all: new fields.BooleanField({ required: true, initial: false }),
      head: new fields.BooleanField({ required: true, initial: false }),
      neck: new fields.BooleanField({ required: true, initial: false }),
      back: new fields.BooleanField({ required: true, initial: false }),
      chest: new fields.BooleanField({ required: true, initial: false }),
      waist: new fields.BooleanField({ required: true, initial: false }),
      hands: new fields.BooleanField({ required: true, initial: false }),
      ring: new fields.BooleanField({ required: true, initial: false }),
      feet: new fields.BooleanField({ required: true, initial: false }),
    });

    schema.evolution = evolution();

    schema.block = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 6 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 4, min: 1 }),
    });
    schema.dodge = new fields.SchemaField({
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 6 }),
      size: new fields.NumberField({ ...requiredInteger, initial: 12, min: 1 }),
    }); 

    schema.stats = new fields.SchemaField({
      constitution: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }, {
        hint: "UTOPIA.Item.Species.constitution"
      }),
      endurance: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }, {
        hint: "UTOPIA.Item.Species.endurance"
      }),
      effervescence: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }, {
        hint: "UTOPIA.Item.Species.effervescence"
      }),
    }, {
      label: "UTOPIA.Item.Species.stats",
    });

    schema.languages = new fields.SetField(new fields.StringField());  

    schema.travel = new fields.SchemaField({
      land: new fields.SchemaField({
        stamina: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value: new fields.StringField({ ...requiredString, initial: "@spd.total" }),
      }),
      water: new fields.SchemaField({
        stamina: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value: new fields.StringField({ ...requiredString }),
      }),
      air: new fields.SchemaField({
        stamina: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        value: new fields.StringField({ ...requiredString }),
      })
    });

    schema.carryCapacity = new fields.NumberField({ ...requiredInteger, initial: 0 });

    schema.armors = new fields.SchemaField({
      unaugmentable: armors(),
      unequippable: armors(),
      specialty: armors(),
    })

    schema.talents = new fields.SchemaField({
      copy: new fields.StringField({
        required: true,
        nullable: false,
        choices: {
          "none": "UTOPIA.Item.Species.Talent.Copy.none",
          "species": "UTOPIA.Item.Species.Talent.Copy.species",
        },
        initial: "none"
      }),
      first: new fields.SchemaField({
        first: new fields.DocumentUUIDField(),
        second: new fields.DocumentUUIDField(),
        third: new fields.DocumentUUIDField(),
        fourth: new fields.DocumentUUIDField(),
      }),
      second: new fields.SchemaField({
        first: new fields.DocumentUUIDField(),
        second: new fields.DocumentUUIDField(),
        third: new fields.DocumentUUIDField(),
        fourth: new fields.DocumentUUIDField(),
      }),
      third: new fields.SchemaField({
        first: new fields.DocumentUUIDField(),
        second: new fields.DocumentUUIDField(),
        third: new fields.DocumentUUIDField(),
        fourth: new fields.DocumentUUIDField(),
      }),
    });

    schema.transform = new fields.SchemaField({
      cost: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      type: new fields.StringField({
        required: true,
        nullable: false,
        choices: {
          "none": "UTOPIA.Item.Species.Transformation.Type.none",
          "wild": "UTOPIA.Item.Species.Transformation.Type.wild",
          "enhance": "UTOPIA.Item.Species.Transformation.Type.enhance",
        },
        initial: "none",
      }),
    })

    schema.communication = new fields.SchemaField({
      language: new fields.SchemaField({
        choices: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        languages: new fields.SetField(new fields.StringField(), { initial: [] }),
      }),
      types: new fields.SetField(new fields.StringField({
        required: true,
        nullable: false,
        choices: {
          "mute": "UTOPIA.Item.Species.Communication.mute",
          "speech": "UTOPIA.Item.Species.Communication.speech",
          "telepathy": "UTOPIA.Item.Species.Communication.telepathy",
        }
      }, {
        required: true,
        nullable: false,
        initial: new Set(["speech"]),
      })),
    })

    schema.controlledByQuirks = new fields.BooleanField({ required: true, initial: false });
    schema.quirkPoints = new fields.NumberField({ ...requiredInteger, initial: 0 });

    schema.gifts = new fields.SchemaField({
      subtraits: new fields.SetField(new fields.StringField(), { required: false, nullable: false, initial: []} ),
      points: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    })

    // TODO: Handle glow in the dark / bioluminescence
    // TODO: Handle Construct & specialty conditions
    // TODO: Handle Bio Core & species action grants
    // TODO: Handle breath and senses types

    schema.quirks = new fields.ArrayField(new fields.ObjectField());

    return schema;
  }

  static migrateData(source) {
    console.warn(source);

    if (!source.stats) {
      source.stats = {
        constitution: {
          value: 0,
          bonus: 0,
          max: 0,
        },
        endurance: {
          value: 0,
          bonus: 0,
          max: 0,
        },
        effervescence: {
          value: 0,
          bonus: 0,
          max: 0,
        },
      };
    }

    if (source.constitution) 
      source.stats.constitution.value = source.constitution;
    
    if (source.endurance)
      source.stats.endurance.value = source.endurance
    
    if (source.effervescence)
      source.stats.effervescence.value = source.effervescence;
  
    if (!source.gifts) {
      source.gifts = {
        subtraits: new Set(),
        points: 0,
      }
    }

    if (source.subtraits && source.subtraits.length > 0) {
      if (source.subtraits[0] === "[Any 2 Subtraits]") {
        source.gifts.points = 2;
        source.subtraits = source.subtraits.slice(1);
      }
      else {
        source.gifts.subtraits = new Set(source.subtraits);
      }
    }

    return super.migrateData(source);
  }

  getPaperDoll() {
    const context = {}

    context.head = {}
    context.head.evolution = this.evolution.head;
    context.head.unaugmentable = this.armors.unaugmentable.head;
    context.head.unequippable = this.armors.unequippable.head;
    context.head.specialty = this.armors.specialty.head;

    context.neck = {}
    context.neck.evolution = this.evolution.neck;
    context.neck.unaugmentable = this.armors.unaugmentable.neck;
    context.neck.unequippable = this.armors.unequippable.neck
    context.neck.specialty = this.armors.specialty.neck;

    context.chest = {}
    context.chest.evolution = this.evolution.chest;
    context.chest.unaugmentable = this.armors.unaugmentable.chest;
    context.chest.unequippable = this.armors.unequippable.chest
    context.chest.specialty = this.armors.specialty.chest;

    context.back = {}
    context.back.evolution = this.evolution.back;
    context.back.unaugmentable = this.armors.unaugmentable.back;
    context.back.unequippable = this.armors.unequippable.back
    context.back.specialty = this.armors.specialty.back;

    context.hands = {}
    context.hands.evolution = this.evolution.hands;
    context.hands.unaugmentable = this.armors.unaugmentable.hands;
    context.hands.unequippable = this.armors.unequippable.hands
    context.hands.specialty = this.armors.specialty.hands;

    context.ring = {}
    context.ring.evolution = this.evolution.ring;
    context.ring.unaugmentable = this.armors.unaugmentable.ring;
    context.ring.unequippable = this.armors.unequippable.ring
    context.ring.specialty = this.armors.specialty.ring;

    context.waist = {}
    context.waist.evolution = this.evolution.waist;
    context.waist.unaugmentable = this.armors.unaugmentable.waist;
    context.waist.unequippable = this.armors.unequippable.waist
    context.waist.specialty = this.armors.specialty.waist;

    context.feet = {}
    context.feet.evolution = this.evolution.feet;
    context.feet.unaugmentable = this.armors.unaugmentable.feet;
    context.feet.unequippable = this.armors.unequippable.feet
    context.feet.specialty = this.armors.specialty.feet;

    console.log(context);

    return context;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    // Quirks have the following:
    // Name
    // Quirk Points (QP)
    // Description
    // Attributes
    
    // Attributes are an array of objects that contain an "ActiveEffect" like transferral of values
    // Some attributes need to be specially parsed, due to the complexity
    // These are, so far,

    console.log(this);

    this.stats.constitution.total = this.stats.constitution.value + this.stats.constitution.bonus;
    this.stats.endurance.total = this.stats.endurance.value + this.stats.endurance.bonus;
    this.stats.effervescence.total = this.stats.effervescence.value + this.stats.effervescence.bonus;

    if (this.controlledByQuirks) {
    const quirks = this.quirks;

      // Since we're storing quirks in a Set, we need to convert it to an array before we can iterate over it
      Array.from(quirks).forEach(quirk => {
        console.warn(quirk);

        // Get our points
        this.quirkPoints += quirk.qp;

        // Now we need to parse the attributes
        const attributes = quirk.attributes;
        attributes.forEach(attribute => {
          // The key for the attribute is the path to the value to update
          // The value is the new value to set
          const entries = Object.entries(foundry.utils.flattenObject(attribute));
          entries.forEach(entry => {
            const [key, value] = entry;
            const path = key.split(".");
            const last = path.pop();
            const target = path.reduce((acc, part) => acc[part], this);
            target[last] = value;
          });
        }); 
      });
    }

    // if (this.stats.constitution.value < 2 || this.stats.constitution.value > this.stats.constitution.max) 
    //   this.invalid.constitution = `Invalid constitution value: ${this.stats.constitution.value}`;
    // if (this.stats.endurance.value < 2 || this.stats.endurance.value > this.stats.endurance.max) 
    //   this.invalid.endurance = `Invalid endurance value: ${this.stats.endurance.value}`;
    // if (this.stats.effervescence.value < 2 || this.stats.effervescence.value > this.stats.effervescence.max)
    //   this.invalid.effervescence = `Invalid effervescence value: ${this.stats.effervescence.value}`;

    this.quirkPoints += this.stats.constitution.total;
    this.quirkPoints += this.stats.endurance.total;
    this.quirkPoints += this.stats.effervescence.total;

    this.quirkPoints += this.block.quantity;
    this.quirkPoints += this.dodge.quantity;

    this.gifts.subtraitsLeft = 4 - this.gifts.subtraits.size - (this.gifts.points === 2 ? 3 : 0);

    this.quirkPoints += this.gifts.subtraits.size;

    if (this.gifts.points === 2) {
      this.quirkPoints += 3;
    }

    // if (this.quirkPoints < 18 || this.quirkPoints > 23) {
    //   this.invalid = {}
    //   this.invalid.message = `Too ${this.quirkPoints < 18 ? "few" : "many"} quirk points spent.`
    // }
  }
} 