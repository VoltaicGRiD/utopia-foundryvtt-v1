const talents = [
  {
      "name": "Inventive",
      "description": "When crafting an item other than a component, you require 1 less material component, minimum of 1.",
      "talentPoints": 1,
      "attributes": [
        {
          "system.crafting.material.discount": 1
        }
      ]
  },
  {
      "name": "Ore Scent",
      "description": "You gain a point of favor on tests made to forage and to find natural resources",
      "talentPoints": 1,
      "attributes": [
        {
          "system.favors": "foraging"
        }
      ]
  },
  {
      "name": "Stubborn",
      "description": "You gain a point of favor on tests made to resist being influenced or forced to commit to an action.",
      "talentPoints": 1,
      "attributes": [
        {
          "system.favors": "resistInfluence"
        }
      ]
  },
  {
      "name": "Quickened Augment",
      "description": "You may spend 2 turn actions to augment or de-augment an item from yourself.",
      "talentPoints": 1,
      "attributes": [
        {
          "system.augment": 1
        }
      ]
  },
  {
      "name": "Tireless",
      "description": "You do not gain points of Fatigue from lack of sleep.",
      "talentPoints": 1
  },
  {
      "name": "Telepathy",
      "description": "You may communicate telepathically with creatures that are able to communicate using a language you understand. Your telepathy has a maximum range of 10 meters. (If the species has the Telepathy quirk, this talent instead increases its range to 30 meters.)\n",
      "talentPoints": 1
  },
  {
      "name": "mischievous",
      "description": "You gain a point of favor on Appeal tests made against creatures that are hostile towards you",
      "talentPoints": 1
  },
  {
      "name": "Impressionable",
      "description": "You gain a similar-tier talent from another species. The cost of this talent is equal to the cost of the chosen talent plus 1.\r\n ● A species may have multiple instances of this talent. If there are multiple instances in the same branch, the talent chosen upon acquiring must be from the same branch as the previous instance",
      "quirkPoints": 1
  },
  {
      "name": " Adaptable Defense",
      "description": "Each of your defenses increase by 1.",
      "talentPoints": 2
  },
  {
      "name": "Quick Footing",
      "description": "Your Dodge Rating increases by 1d12.",
      "talentPoints": 2
  },
  {
      "name": "Strong Defense",
      "description": " Your Block Rating increases by 1d4.",
      "talentPoints": 2
  },
  {
      "name": "Exceptional Combat",
      "description": "When you make an attack, you may spend anadditional turn action up to 3 times to deal an additional 2d8 Physical/Energy/Heat/Chill/Psyche damage",
      "talentPoints": 2
  },
  {
      "name": "Exceptional Clash",
      "description": "When you make an attack, you may spend anadditional turn action and 4 stamina to deal an additional 2d10 Physical/Energy/Heat/Chill/Psyche damage. You may use this feature up to 5 times per attack.",
      "talentPoints": 2
  },
  {
      "name": " Buffer",
      "description": "Your Physical/Energy/Heat/Chill/Psyche Defense increases by 4",
      "talentPoints": 2
  },
  {
      "name": "Barrier",
      "description": "Your Physical/Energy/Heat/Chill/Psyche (choose 2) Defense each increase by 2.",
      "talentPoints": 2
  },
  {
      "name": "Creative",
      "description": "Spells you cast cost 1 less to cast, minimum cost of 1.",
      "talentPoints": 2
  },
  {
      "name": "Mage Mentality",
      "description": "You gain a point of favor on tests made to remain Focused and to keep Concentration",
      "talentPoints": 2
  },
  {
      "name": "Runic Buffer",
      "description": "You gain a point of favor on tests made to resist spell effects.",
      "talentPoints": 2
  },
  {
      "name": "Prodigy",
      "description": "Choose a subtrait. You become gifted in it",
      "talentPoints": 2
  },
  {
      "name": "Absorption",
      "description": "When ever you take any amount of Energy/Heat/Chill/Psyche damage, you regain that much stamina",
      "talentPoints": 2
  },
  {
      "name": "Proud",
      "description": "When you spend 5 or more stamina on something other than casting a spell, you may make a Portrayal test. If the test succeeds the amount of stamina spent, you regain 2 stamina. You may only make 1 Portrayal test per stamina costing event.",
      "talentPoints": 2
  },
  {
      "name": "Youthful",
      "description": "When you spend 5 or more stamina on something other than casting a spell, you may make a Portrayal test. If the test succeeds the amount of stamina spent, you regain 3 SHP. You may only make 1 Portrayal test per stamina costing event.",
      "talentPoints": 2
  },
  {
      "name": "Ingenious",
      "description": "When crafting an item other than a component, you require 1 less refinement component, minimum cost of 1",
      "talentPoints": 2
  },
  {
      "name": "Internal Slots",
      "description": "De-augmenting an item does not deal damage to you.",
      "talentPoints": 2
  },
  {
      "name": "Augment Prep",
      "description": "Requires the Quickened Augment talent\nYou may use the Quickened Augment talent with 1 turn action rather than 2.",
      "talentPoints": 2
  },
  {
      "name": "Augment Strikes",
      "description": "Weaponless attacks you make deal an amount of additional Physical/Energy/Heat/Chill/Psyche damage equal to four times the number of items you have augmented.",
      "talentPoints": 2
  },
  {
      "name": "Hypersynthesis",
      "description": "When you successfully dodge any amount of Energy/Heat/Chill/Psyche damage, you regain 1d4 stamina",
      "talentPoints": 2
  },
  {
      "name": "Remineralize",
      "description": "You may spend 1 minute to remineralize water. Any creature may spend 3 turn actions to drink it, regaining 1d4 stamina and 1d4 SHP. Water remineralized this way becomes impure after 1 hour.",
      "talentPoints": 2
  },
  {
      "name": "Persuasive",
      "description": "You gain a point of favor on tests made to influence and force creatures to commit to an action",
      "talentPoints": 2
  },
  {
      "name": "Quicken",
      "description": "Your Land/Water travel increases by 2/3.",
      "talentPoints": 2
  },
  {
      "name": "Fortunate",
      "description": " When you make a test,you may spend 3 stamina to reroll a single 1. You may only reroll any number of dice once per test.",
      "talentPoints": 2
  },
  {
      "name": "Spontaneous",
      "description": "You may make an Agility test rather than a Speed test when calculating turn order.",
      "talentPoints": 2
  },
  {
      "name": "Camouflage",
      "description": "You gain a point of favor on tests made to remain inconspicuous.",
      "talentPoints": 2
  },
  {
      "name": "Prideful Warrior",
      "description": "When you make a melee attack against a creature that can see you, you may spend 8 stamina to deal an additional 1d8 Physical damage. You may use this effect a number of times equal to your Stunt modifier per attack, minimum of 1.",
      "talentPoints": 2
  },
  {
      "name": "Champion Brawler",
      "description": "When making tests or calculating based on scores or modifiers, you may use your Appeal score in place of your Power score and use your Charm score in place of your Strength score",
      "talentPoints": 2
  },
  {
      "name": "Champion Hunter",
      "description": "When making tests or calculating based on scores or modifiers, you may use your Stunt l score in place of your Dexterity score and use your Display score in place of your Agility score",
      "talentPoints": 2
  },
  {
      "name": "Rapid Blows (1+Qp)",
      "description": "Your weaponless attacks require 1 turn action rather than 2.",
      "talentPoints": 2
  },
  {
      "name": "Hypercognant",
      "description": "You cannot be inflicted with Unconsciousness unless you choose to, given you have more than 0 stamina and more than 0 DHP.",
      "talentPoints": 2
  },
  {
      "name": "Halo",
      "description": "When ever you take the Deep Breath action, you may spend 1 DHP. If you do, choose any number of other creatures within 1 meter of you. They each regain 1 SHP.",
      "talentPoints": 2
  },
  {
      "name": "Teeth and Claws",
      "description": "Your weaponless attacks deal 2d8 Physical damage.",
      "talentPoints": 2
  },
  {
      "name": "Special Weapon",
      "description": "When you make a weaponless attack, you may choose for it to deal 2d6 Energy/Heat/Chill/Psyche damage and have 5 meters of close range, 10 meters of far range, instead. Attacks made this way use your Speed/Dexterity/Fortitude/Engineering/Memory/Resolve/Awareness/Portr ayal/Stunt/Appeal/Language modifier instead of Power",
      "talentPoints": 2,
      "quirkPoints": 1
  },
  {
      "name": "Expertise",
      "description": "When ever you make a test using a subtrait that you are gifted in, you may spend 5 stamina to gain a point of favor. You may only gain a point of favor this way once per test",
      "talentPoints": 3
  },
  {
      "name": "Self Repair",
      "description": "You may spend 6 turn actions to make an Engineering test. If the test succeeds the amount of DHP you’re missing, you regain 2d4 DHP, otherwise you are dealt 3 damage. Damage dealt this way ignores defenses.",
      "talentPoints": 3,
      "quirkPoints": 1
  },
  {
      "name": "Mechanical Medic",
      "description": "Requires the Self Repair talent.\nWhen you use theSelf Repair talent, you may consume a Common or rarer material/refinement/power component to gain a point of favor on the Engineering test",
      "talentPoints": 3
  },
  {
      "name": "Thorough",
      "description": "Requires the Self Repair talent\nWhen youuse the Self Repair talent, you regain 2d8 DHP instead",
      "talentPoints": 3
  },
  {
      "name": "Mechanized",
      "description": "When you are the target of an attack, you may spend an interrupt action and up to 7 stamina to increase one of your defenses by the amount of stamina spent for the rest of the action.",
      "talentPoints": 3
  },
  {
      "name": "Brilliant",
      "description": "When crafting an item other than a component, you require 1 less power component, minimum cost of 1.",
      "talentPoints": 3
  },
  {
      "name": "Restorative Cycle",
      "description": "You may spend 1 turn action and up to 4 SHP to regain an amount of stamina equal to double the amount of SHP spent",
      "talentPoints": 3
  },
  {
      "name": "Practical Usage",
      "description": "When youre gain stamina, SHP, or DHP from an item, you regain twice as much instead.",
      "talentPoints": 3
  },
  {
      "name": "Deep Heal",
      "description": "If your current DHP is lower than half of your maximum DHP rounded down, you may spend 1 turn action and 1 SHP to regain 1 DHP",
      "talentPoints": 3,
      "quirkPoints": 1
  },
  {
      "name": "Regenerative",
      "description": "When you take the Deep Breath action, you regain 1 SHP.",
      "talentPoints": 3,
      "quirkPoints": 1
  },
  {
      "name": "Natural Support",
      "description": "You may spend 1 turn action and up to 10 SHP to force a touching creature to regain an amount of SHP equal to the amount spent.",
      "talentPoints": 3
  },
  {
      "name": "Proficiency",
      "description": "You cannot gain points of disfavor on Speed/Dexterity/Power/Fortitude/Engineering/Memory/Resolve/Awareness /Portrayal/Stunt/Appeal/Language tests.",
      "talentPoints": 3
  },
  {
      "name": "Berserk",
      "description": "When you take the Attack action, you may spend 2 additional turn actions and 12 stamina to attack a random target within range. If you do, the attack’s damage is doubled",
      "talentPoints": 3,
      "quirkPoints": 1
  },
  {
      "name": "Natural Survivalist",
      "description": "When you harvest components from a creature or from foraging, you may make an Awareness test. If the test succeeds 11, you gain a random additional similar component. You may only make 1 Awareness test per harvest.",
      "talentPoints": 3
  },
  {
      "name": "Champion Caster",
      "description": "When making tests or calculating based on scores or modifiers, you may use your Language score in place of your Resolve score and use your Charm score in place of your Will score.",
      "talentPoints": 3
  },
  {
      "name": "Otherworldly Gift",
      "description": "When a creature within 5 meters of you makes a test, you may spend 1 interrupt action and 4 stamina up to once per test to give the creature a point of favor.",
      "talentPoints": 3
  },
  {
      "name": "Otherworldly Curse",
      "description": "When a creature within 5 meters of you makes a test, you may spend 1 interrupt action and 4 stamina up to once per test to give the creature a point of disfavor",
      "talentPoints": 3
  },
  {
      "name": "Sticky Feet",
      "description": "You may use Landtravel to climb on vertical surfaces and upside down.",
      "talentPoints": 3
  }
]