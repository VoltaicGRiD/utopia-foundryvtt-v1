export const traits = [
  'agility',
  'strength',
  'intelligence',
  'will',
  'display',
  'charm',

  'agi',
  'str',
  'int',
  'wil',
  'dis',
  'cha',
]

export const subtraits = [
  'speed',
  'dexterity',
  'power',
  'fortitude',
  'engineering',
  'memory',
  'resolve',
  'awareness',
  'portrayal',
  'stunt',
  'appeal',
  'language',

  'spd',
  'dex',
  'pow',
  'for',
  'eng',
  'mem',
  'res',
  'awa',
  'por',
  'stu',
  'app',
  'lan',
]

export const traitShortNames = {
  'agi': 'agility',
  'spd': 'speed',
  'dex': 'dexterity',
  'str': 'strength',
  'pow': 'power',
  'for': 'fortitude',
  'int': 'intelligence',
  'eng': 'engineering',
  'mem': 'memory',
  'wil': 'will',
  'res': 'resolve',
  'awa': 'awareness',
  'dis': 'display',
  'por': 'portrayal',
  'stu': 'stunt',
  'cha': 'charm',
  'app': 'appeal',
  'lan': 'language',
  'blk': 'block',
  'dod': 'dodge',
  'con': 'constitution',
  'end': 'endurance',
  'eff': 'effervescence',
}

export const traitLongNames = {
  'agility': 'agi',
  'speed': 'spd',
  'dexterity': 'dex',
  'strength': 'str',
  'power': 'pow',
  'fortitude': 'for',
  'intelligence': 'int',
  'engineering': 'eng',
  'memory': 'mem',
  'will': 'wil',
  'resolve': 'res',
  'awareness': 'awa',
  'display': 'dis',
  'portrayal': 'por',
  'stunt': 'stu',
  'charm': 'cha',
  'appeal': 'app',
  'language': 'lan',
  'block': 'blk',
  'dodge': 'dod',
  'constitution': 'con',
  'endurance': 'end',
  'effervescence': 'eff',
}

export const shortToLong = (shortName) => {
  return traitShortNames[shortName] || shortName
}

export const longToShort = (longName) => {
  return traitLongNames[longName] || longName
}

export const findTrait = (actor, traitName) => {
  // Get the list of trait names from the actor's system traits
  const traits = Object.keys(actor.system.traits);

  // Check if the traitName exists in the list of traits
  if (traits.includes(traitName))
    // If it exists, return the corresponding trait from the actor's system traits
    return actor.system.traits[traitName];

  else {

    // If the traitName is not found in the main traits, search in the subtraits
    for (let trait of traits) {
      const subtraits = Object.keys(actor.system.traits[trait].subtraits);

      // Check if the traitName exists in the list of subtraits
      if (subtraits.includes(traitName))
        return actor.system.traits[trait].subtraits[traitName];
    }
  }
}

export async function searchTraits(traits, subtrait) {
  // Get both length versions of the trait
  let long = shortToLong(subtrait.toLowerCase());
  let short = longToShort(subtrait.toLowerCase());

  console.log(long, short);

  // Search for the trait in the traits object
  for (let trait of Object.keys(traits)) {
    if (traits[trait].subtraits[long] !== undefined) {
      return trait; // Returns from the searchTraits function
    }
    if (traits[trait].subtraits[short] !== undefined) {
      return trait; // Returns from the searchTraits function
    }
  }

  return undefined; 
}


export const buildTraitData = (actor = {}) => {
  const data = {}

  // AGILITY GROUP (Teal/Aqua)
data.agi = {
  name: 'Agility',
  short: 'agi',
  icon: 'fas fa-rabbit-running',   // FA Pro
  color: '#005F5F',                // Dark teal
  mod: actor.system?.traits.agi.mod ?? 0,
  total: actor.system?.traits.agi.total ?? 0
}; 

data.dex = {
  name: 'Dexterity',
  short: 'dex',
  // "fa-hand-paper" is free; "fa-hand-sparkles" is in Pro, which might fit "quick, deft hands"
  icon: 'fas fa-hand-sparkles',    // FA Pro (alternative to fa-hand-paper)
  color: '#007A7A',
  mod: actor.system?.traits.agi.subtraits.dex.mod ?? 0,
  total: actor.system?.traits.agi.subtraits.dex.total ?? 0,
  gifted: actor.system?.traits.agi.subtraits.dex.gifted ?? false,
  trait: data.agi
};

data.spd = {
  name: 'Speed',
  short: 'spd',
  // "fa-tachometer-alt" is free; FA6 might rename to "fa-gauge" / "fa-gauge-high"
  icon: 'fas fa-tachometer-alt',
  color: '#009999',
  mod: actor.system?.traits.agi.subtraits.spd.mod ?? 0,
  total: actor.system?.traits.agi.subtraits.spd.total ?? 0,
  gifted: actor.system?.traits.agi.subtraits.spd.gifted ?? false,
  trait: data.agi
};

// STRENGTH GROUP (Deep Reds)
data.str = {
  name: 'Strength',
  short: 'str',
  icon: 'fas fa-dumbbell',
  color: '#7F0D0D',
  mod: actor.system?.traits.str.mod ?? 0,
  total: actor.system?.traits.str.total ?? 0
}; 

data.pow = {
  name: 'Power',
  short: 'pow',
  // Could use "fa-bolt-lightning" (Pro) or "fa-bolt" (Free). "fa-bolt" is simpler.
  icon: 'fas fa-bolt-lightning',
  color: '#AF1C1C',
  mod: actor.system?.traits.str.subtraits.pow.mod ?? 0,
  total: actor.system?.traits.str.subtraits.pow.total ?? 0,
  gifted: actor.system?.traits.str.subtraits.pow.gifted ?? false,
  trait: data.str
};

data.for = {
  name: 'Fortitude',
  short: 'for',
  // "fa-shield-halved" is the new FA6 version of "fa-shield-alt" 
  icon: 'fas fa-shield-halved',
  color: '#BF3232',
  mod: actor.system?.traits.str.subtraits.for.mod ?? 0,
  total: actor.system?.traits.str.subtraits.for.total ?? 0,
  gifted: actor.system?.traits.str.subtraits.for.gifted ?? false,
  trait: data.str
};

// INTELLIGENCE GROUP (Purples)
data.int = {
  name: 'Intelligence',
  short: 'int',
  // "fa-lightbulb" is fine, but Pro offers "fa-brain-circuit" as a futuristic intelligence symbol
  icon: 'fas fa-brain-circuit',  // FA Pro
  color: '#3D0F4C',
  mod: actor.system?.traits.int.mod ?? 0,
  total: actor.system?.traits.int.total ?? 0
}; 

data.eng = {
  name: 'Engineering',
  short: 'eng',
  // "fa-gears" is free; Pro has "fa-screwdriver-wrench" which can be more direct for engineering
  icon: 'fas fa-screwdriver-wrench',  // FA Pro
  color: '#58196E',
  mod: actor.system?.traits.int.subtraits.eng.mod ?? 0,
  total: actor.system?.traits.int.subtraits.eng.total ?? 0,
  gifted: actor.system?.traits.int.subtraits.eng.gifted ?? false,
  trait: data.int
};

data.mem = {
  name: 'Memory',
  short: 'mem',
  icon: 'fas fa-brain',  // Distinct from "fa-brain-circuit"
  color: '#722286',
  mod: actor.system?.traits.int.subtraits.mem.mod ?? 0,
  total: actor.system?.traits.int.subtraits.mem.total ?? 0,
  gifted: actor.system?.traits.int.subtraits.mem.gifted ?? false,
  trait: data.int
};

// WILL GROUP (Forest Green)
data.wil = {
  name: 'Will',
  short: 'wil',
  icon: 'fas fa-anchor',
  color: '#1A4D16',
  mod: actor.system?.traits.wil.mod ?? 0,
  total: actor.system?.traits.wil.total ?? 0
}; 

data.res = {
  name: 'Resolve',
  short: 'res',
  icon: 'fas fa-bullseye',
  color: '#22661D',
  mod: actor.system?.traits.wil.subtraits.res.mod ?? 0,
  total: actor.system?.traits.wil.subtraits.res.total ?? 0,
  gifted: actor.system?.traits.wil.subtraits.res.gifted ?? false,
  trait: data.wil
};

data.awa = {
  name: 'Awareness',
  short: 'awa',
  icon: 'fas fa-eye',
  color: '#2F8A28',
  mod: actor.system?.traits.wil.subtraits.awa.mod ?? 0,
  total: actor.system?.traits.wil.subtraits.awa.total ?? 0,
  gifted: actor.system?.traits.wil.subtraits.awa.gifted ?? false,
  trait: data.wil
};

// DISPLAY GROUP (Navy/Blue)
data.dis = {
  name: 'Display',
  short: 'dis',
  icon: 'fas fa-tv',
  color: '#1B3853',
  mod: actor.system?.traits.dis.mod ?? 0,
  total: actor.system?.traits.dis.total ?? 0
}; 

data.por = {
  name: 'Portrayal',
  short: 'por',
  icon: 'fas fa-theater-masks',
  color: '#224A70',
  mod: actor.system?.traits.dis.subtraits.por.mod ?? 0,
  total: actor.system?.traits.dis.subtraits.por.total ?? 0,
  gifted: actor.system?.traits.dis.subtraits.por.gifted ?? false,
  trait: data.dis
};

data.stu = {
  name: 'Stunt',
  short: 'stu',
  icon: 'fas fa-user-ninja',
  color: '#2A5C8D',
  mod: actor.system?.traits.dis.subtraits.stu.mod ?? 0,
  total: actor.system?.traits.dis.subtraits.stu.total ?? 0,
  gifted: actor.system?.traits.dis.subtraits.stu.gifted ?? false,
  trait: data.dis
};

// CHARM GROUP (Magenta/Pinks)
data.cha = {
  name: 'Charm',
  short: 'cha',
  // "fa-face-smile" is free; Pro has more expressive options like "fa-face-grin-stars"
  icon: 'fas fa-face-grin-stars',    // FA Pro
  color: '#782355',
  mod: actor.system?.traits.cha.mod ?? 0,
  total: actor.system?.traits.cha.total ?? 0
}; 

data.app = {
  name: 'Appeal',
  short: 'app',
  icon: 'fas fa-thumbs-up',
  color: '#9B2E6E',
  mod: actor.system?.traits.cha.subtraits.app.mod ?? 0,
  total: actor.system?.traits.cha.subtraits.app.total ?? 0,
  gifted: actor.system?.traits.cha.subtraits.app.gifted ?? false,
  trait: data.cha
};

data.lan = {
  name: 'Language',
  short: 'lan',
  icon: 'fas fa-language',
  color: '#BD3987',
  mod: actor.system?.traits.cha.subtraits.lan.mod ?? 0,
  total: actor.system?.traits.cha.subtraits.lan.total ?? 0,
  gifted: actor.system?.traits.cha.subtraits.lan.gifted ?? false,
  trait: data.cha
};


  return data;
}