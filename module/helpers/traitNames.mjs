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
}

export const shortToLong = (shortName) => {
  return traitShortNames[shortName] || shortName
}

export const longToShort = (longName) => {
  return traitLongNames[longName] || longName
}

