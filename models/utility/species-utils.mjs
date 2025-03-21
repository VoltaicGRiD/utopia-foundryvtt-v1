export async function prepareSpeciesData(character) {
  if (character.parent.items.filter(i => i.type === "species").length === 0) {
    return prepareSpeciesDefault(character);
  }

  const species = character.parent.items.find(i => i.type === "species");
  character._speciesData = species;

  if (character.languagePoints) character.languagePoints.available += character._speciesData.system.communication.languages - character.languagePoints.spent;
  if (character.communication) character.communication.telepathy = character._speciesData.system.communication.telepathy;
  character.size = character._speciesData.system.size;

  character.travel = {
    land: { speed: 0, stamina: 0 },
    water: { speed: 0, stamina: 0 },
    air: { speed: 0, stamina: 0 }
  }

  character.block = {
    size: character._speciesData.system.block.size,
    quantity: character._speciesData.system.block.quantity
  }

  character.dodge = {
    size: character._speciesData.system.dodge.size,
    quantity: character._speciesData.system.dodge.quantity
  }

  for (const [key, value] of Object.entries(character._speciesData.system.travel)) {
    const rolldata = await character.parent.getRollData();
    const innateRoll = new Roll(String(character.innateTravel[key].speed), rolldata);
    await innateRoll.evaluate();  
    character.travel[key].speed = innateRoll.total;

    const speciesRoll = new Roll(String(value.speed), rolldata);
    await speciesRoll.evaluate();
    character.travel[key].speed += speciesRoll.total;
  }

  character.constitution += character._speciesData.system.constitution;
  character.endurance += character._speciesData.system.endurance;
  character.effervescence += character._speciesData.system.effervescence;

  character.evolution.head = Math.max(species.evolution.head, 1);
  character.evolution.feet = species.evolution.feet;
  character.evolution.hands = species.evolution.hands;

  character.equipmentSlots.capacity = {};
  character.equipmentSlots.capacity.head = character.evolution.head;
  character.equipmentSlots.capacity.neck = character.evolution.head;
  character.equipmentSlots.capacity.back = 1;
  character.equipmentSlots.capacity.chest = 1;
  character.equipmentSlots.capacity.waist = 1;
  character.equipmentSlots.capacity.feet = character.evolution.feet / 2;
  character.equipmentSlots.capacity.hands = character.evolution.hands / 2;
  character.equipmentSlots.capacity.ring = character.evolution.hands / 2;

  character.augments.capacity = {};
  character.augments.capacity.head = character.augments.capacity.all ?? 0 + character.evolution.head;
  character.augments.capacity.neck = character.augments.capacity.all ?? 0 + character.evolution.head;
  character.augments.capacity.back = character.augments.capacity.all ?? 0 + 1;
  character.augments.capacity.chest = character.augments.capacity.all ?? 0 + 1;
  character.augments.capacity.waist = character.augments.capacity.all ?? 0 + 1;
  character.augments.capacity.feet = character.augments.capacity.all ?? 0 + character.evolution.feet / 2;
  character.augments.capacity.hands = character.augments.capacity.all ?? 0 + character.evolution.hands / 2;
  character.augments.capacity.ring = character.augments.capacity.all ?? 0 + character.evolution.hands / 2;
}

export async function prepareSpeciesDefault(character) {
  character._speciesData = {
    name: "Human",
    system: {
      travel: {
        land: "@spd.total",
        water: 0,
        air: 0
      },
      size: "medium",
      communication: {
        languages: 2,
        telepathy: false
      }
    }
  }

  if (character.languagePoints) character.languagePoints.available = character._speciesData.system.communication.languages;
  if (character.communication) character.communication.telepathy = character._speciesData.system.communication.telepathy;
  character.size = character._speciesData.system.size;
  
  character.travel = {
    land: { speed: 0, stamina: 0 },
    water: { speed: 0, stamina: 0 },
    air: { speed: 0, stamina: 0 }
  }

  for (const [key, value] of Object.entries(character._speciesData.system.travel)) {
    character.travel[key].speed = await new Roll(String(character.innateTravel[key].speed), character.parent.getRollData()).evaluate().total;
    character.travel[key].speed += await new Roll(String(value.speed), character.parent.getRollData()).evaluate().total;
  }
}