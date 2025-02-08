const quirks = [
  {
    name: "Talker",

    qp: 1,
    description:  "This species instead knows 2 simple languages of the player\u2019s choice.",
    attributes: [
      {
        "communication.languages.choice": 2,
      },
    ],
  },
  {
    name: "Quiet",

    qp: -1,
    description:  "This species instead knows any 1 language of the player\u2019s choice.",
    attributes: [
      {
        "communication.languages.choice": 1,
      },
    ],
  },
  {
    name: "Mute",

    qp: -2,
    description:  "This species cannot verbally speak.",
    attributes: [
      {
        "communication.types": ["mute"],
      },
    ],
  },
  {
    name: "Telepathy",

    qp: 2,
    description:  "This species can communicate telepathically with creatures that share a language with it, a maximum range of 10 meters.",
    attributes: [
      {
        "communication.types": ["speech", "telepathy"],
      },
    ],
  },
  {
    name: "Odd Shape 1",

    qp: -1,
    description: 
      "Armor and/or artifacts worn in 2 specific slot types that it can utilize must be made custom in order for this species to equip. Armor may be customized over 1 hour using a tool set. Only creatures able to craft items of a similar rarity may customize items this way.",
    attributes: [],
  },
  {
    name: "Odd Shape 2",

    qp: -2,
    description: 
      "Armor and/or artifacts worn in 4 specific slot types that it can utilize must be made custom in order for this species to equip. Armor may be customized over 1 hour using a tool set. Only creatures able to craft items of a similar rarity may customize items this way.",
    attributes: [],
  },
  {
    name: "Odd Shape 3",

    qp: -3,
    description: 
      "Armor and/or artifacts worn in 8 specific slot types that it can utilize must be made custom in order for this species to equip. Armor may be customized over 1 hour using a tool set. Only creatures able to craft items of a similar rarity may customize items this way.",
    attributes: [],
  },
  {
    name: "Basic Flight 1",

    qp: 2,
    description:  "This species has 2 meters of Air travel. If it\r\nflies for any amount of time during a turn, it\r\nloses 3stamina.",
    attributes: [
      {
        "travel.air.value": 2,
        "travel.air.stamina": 3,
      },
    ],
  },
  {
    name: "Basic Flight 2",

    qp: 2,
    description:  "This species has 3 meters of Air travel. If it flies for any amount of time during a turn, it loses 5 stamina.",
    attributes: [
      {
        "travel.air.value": 3,
        "travel.air.stamina": 5,
      },
    ],
  },
  {
    name: "Basic Flight 3",

    qp: 2,
    description:  "This species has 5 meters of Air travel. If it flies for any amount of time during a turn, it loses 8 stamina.",
    attributes: [
      {
        "travel.air.value": 5,
        "travel.air.stamina": 8,
      },
    ],
  },
  {
    name: "Advanced Flight 1",

    qp: 3,
    description:  "This species has an Air travel equal to half its Speed score. If it flies for any amount of time during a turn, it loses 4 stamina.",
    attributes: [
      {
        "travel.air.value": "@spd.total / 2",
        "travel.air.stamina": 4,
      },
    ],
  },
  {
    name: "Advanced Flight 2",

    qp: 5,
    description:  "This species has an Air travel equal to its Speed score. If it flies for any amount of time during a turn, it loses 4 stamina.",
    attributes: [
      {
        "travel.air.value": "@spd.total",
        "travel.air.stamina": 4,
      },
    ],
  },
  {
    name: "Advanced Flight 3",

    qp: 7,
    description:  "This species has an Air travel equal to double its Speed score. If it flies for any amount of time during a turn, it loses 4 stamina.",
    attributes: [
      {
        "travel.air.value": "@spd.total * 2",
        "travel.air.stamina": 4,
      },
    ],
  },
  {
    name: "Multiheaded 1",

    qp: 2,
    description:  "This species has 2 functional heads. You have 2 head slots and 2 neck slots.",
    attributes: [
      {
        "evolution.head": 2,
      },
    ],
  },
  {
    name: "Multiheaded 2",

    qp: 4,
    description:  "This species has 3 functional heads. You have 3 head slots and 3 neck slots.",
    attributes: [
      {
        "evolution.head": 3,
      },
    ],
  },
  {
    name: "Multiheaded 3",

    qp: 6,
    description:  "This species has 4 functional heads. You have 4 head slots and 4 neck slots.",
    attributes: [
      {
        "evolution.head": 4,
      },
    ],
  },
  {
    name: "Anomalous 1",

    qp: -1,
    description:  "One specific armor slot types cannot be augmented on this species.",
    attributes: [
      {
        "armors.augmentable.locked.count": 1,
      },
    ],
  },
  {
    name: "Anomalous 2",

    qp: -2,
    description:  "Two specific armor slot types cannot be augmented on this species.",
    attributes: [
      {
        "armors.unaugmentable.count": 2,
      },
    ],
  },
  {
    name: "Anomalous 3",

    qp: -3,
    description:  "Three specific armor slot types cannot be augmented on this species.",
    attributes: [
      {
        "armors.unaugmentable.count": 3,
      },
    ],
  },
  {
    name: "Anomalous 4",

    qp: -4,
    description:  "All specific armor slot types cannot be augmented on this species.",
    attributes: [
      {
        "armors.unaugmentable.head": true,
        "armors.unaugmentable.neck": true,
        "armors.unaugmentable.back": true,
        "armors.unaugmentable.chest": true,
        "armors.unaugmentable.waist": true,
        "armors.unaugmentable.hands": true,
        "armors.unaugmentable.ring": true,
        "armors.unaugmentable.feet": true,
      },
    ],
  },
  {
    name: "Exo Body 1",

    qp: -2,
    description:  "Armor cannot be worn in one specific armor slot types on this species. This does not affect augmentable spaces.",
    attributes: [
      {
        "armors.unequippable.count": 1,
      },
    ],
  },
  {
    name: "Exo Body 2",

    qp: -3,
    description:  "Armor cannot be worn in two specific armor slot types on this species. This does not affect augmentable spaces.",
    attributes: [
      {
        "armors.unequippable.count": 2,
      },
    ],
  },
  {
    name: "Exo Body 3",

    qp: -4,
    description:  "Armor cannot be worn in three specific armor slot types on this species. This does not affect augmentable spaces.",
    attributes: [
      {
        "armors.unequippable.count": 3,
      },
    ],
  },
  {
    name: "Exo Body 4",

    qp: -5,
    description:  "Armor cannot be worn in any specific armor slot types on this species. This does not affect augmentable spaces.",
    attributes: [
      {
        "armors.unequippable.all": true,
      },
    ],
  },
  {
    name: "Handsy 1",

    qp: -6,
    description:  "This species has 0 functional hands. You have 0 hand slots and 0 ring slots.",
    attributes: [
      {
        "evolution.hands": 0,
      },
    ],
  },
  {
    name: "Handsy 2",

    qp: -3,
    description:  "This species has 1 functional hands. You have 0 hand slots and 0 ring slots.",
    attributes: [
      {
        "evolution.hands": 1,
      },
    ],
  },
  {
    name: "Handsy 3",

    qp: 4,
    description:  "This species has 4 functional hands. You have 2 hand slots and 2 ring slots.",
    attributes: [
      {
        "evolution.hands": 4,
      },
    ],
  },
  {
    name: "Handsy 4",

    qp: 8,
    description:  "This species has 6 functional hands. You have 3 hand slots and 3 ring slots.",
    attributes: [
      {
        "evolution.hands": 6,
      },
    ],
  },
  {
    name: "Bioluminescent",

    qp: 0,
    description:  "This species naturally glows in the dark.",
    attributes: [],
  },
  {
    name: "Artificial 1",

    qp: 5,
    description: 
      "This species isn\u2019t considered a Construct and does not need to breathe, eat, drink water, or sleep. It cannot be inflicted with points of Fatigue or Unconsciousness. When resting, it remains conscious but Paralyzed.",
    attributes: [],
  },
  {
    name: "Artificial 2",

    qp: 6,
    description: 
      "This species is considered a Construct and does not need to breathe, eat, drink water, or sleep. It cannot be inflicted with points of Fatigue or Unconsciousness. When resting, it remains conscious but Paralyzed.",
    attributes: [],
  },
  {
    name: "Breathless",

    qp: -5,
    description:  "This species cannot take the Deep Breath action.",
    attributes: [],
  },
  {
    name: "Bio Core 1",

    qp: 1,
    description:  "This species may spend 6 turn actions to convert 1 kilogram of organic material into a Crude Material Component.",
    attributes: [],
  },
  {
    name: "Bio Core 2",

    qp: 1,
    description:  "This species may spend 6 turn actions to convert 1 kilogram of organic material into a Crude Refinement Component.",
    attributes: [],
  },
  {
    name: "Bio Core 3",

    qp: 1,
    description:  "This species may spend 6 turn actions to convert 1 kilogram of organic material into a Crude Power Component.",
    attributes: [],
  },
  {
    name: "Alternate Power",

    qp: 0,
    description:  "This species may spend 2 turn actions and consume a Power component of any rarity to regain 1 stamina.",
    attributes: [],
  },
  {
    name: "Swimmer 1",

    qp: 1,
    description:  "This species has a Water travel equal to its Speed score.",
    attributes: [
      {
        "travel.water.value": "@spd.total",
      },
    ],
  },
  {
    name: "Swimmer  2",

    qp: 3,
    description:  "This species has a Water travel equal to double its Speed score.",
    attributes: [
      {
        "travel.water.value": "@spd.total * 2",
      },
    ],
  },
  {
    name: "Mover 1",

    qp: -2,
    description:  "This species has a Land travel equal to half its Speed score.",
    attributes: [
      {
        "travel.land.value": "@spd.total / 2",
      },
    ],
  },
  {
    name: "Mover 2",

    qp: 5,
    description:  "This species has a Land travel equal to double its Speed score.",
    attributes: [
      {
        "travel.land.value": "@spd.total * 2",
      },
    ],
  },
  {
    name: "Sizeable 1",

    qp: -2,
    description:  "The number of slots this species can carry is equal to double times its Strength score.\nOptional: You are considered Small",
    attributes: [
      {
        carryCapacity: "@str.total * 2",
      },
    ],
  },
  {
    name: "Sizeable 2",

    qp: 3,
    description:  "The number of slots this species can carry is equal to fifteen times its Strength score.\nOptional: You are considered Large.",
    attributes: [
      {
        carryCapacity: "@str.total * 15",
      },
    ],
  },
  {
    name: "Impressionable",

    qp: 1,
    description:  "This species may have talents that copy the talents of another species, costing the same number of talent points plus 1.",
    attributes: [
      {
        "talents.copy": "species",
      },
    ],
  },
  {
    name: "Transform 1",

    qp: 3,
    description: 
      "This species may spend 6 turn actions to transform to or from its second form for as long as it remains focused. While in its second form it gains the following effects( It loses effects from all equipped items,  Its weaponless attacks deal double damage, each defense is increased by 2, its Block Rating is increased by 2d4, its Dodge Rating is increased by 2d12.)",
    attributes: [
      {
        "transform.cost": 6,
        "transform.type": "wild",
      },
    ],
  },
  {
    name: "Transform 2",

    qp: 3,
    description: 
      "This species may spend 6 turn actions to transform to or from its second form for as long as it remains focused. While in its second form, it gains one of these specific effects: It gains up to 3 quirks, minimum 1 negative, worth a total of 4 QP.",
    attributes: [
      {
        "transform.cost": 6,
        "transform.type": "enhanced",
      },
    ],
  },
  {
    name: "Amphibious",

    qp: 1,
    description:  "This creature can breathe in both air and water.",
    attributes: [],
  },
  {
    name: "Substantial 1",

    qp: 2,
    description:  "This species\u2019 Constitution, Endurance, and Effervescence each have a maximum of 12.",
    attributes: [
      {
        "stats.constitution.max": 12,
        "stats.endurance.max": 12,
        "stats.effervescence.max": 12,
      },
    ],
  },
  {
    name: "Substantial 2",

    qp: 3,
    description:  "This species\u2019 Constitution, Endurance, and Effervescence each have a maximum of 15.",
    attributes: [
      {
        "stats.constitution.max": 15,
        "stats.endurance.max": 15,
        "stats.effervescence.max": 15,
      },
    ],
  },
  {
    name: "Substantial 3",

    qp: 4,
    description:  "This species\u2019 Constitution, Endurance, and Effervescence each have a maximum of 18.",
    attributes: [
      {
        "stats.constitution.max": 18,
        "stats.endurance.max": 18,
        "stats.effervescence.max": 18,
      },
    ],
  },
];

export default quirks;
