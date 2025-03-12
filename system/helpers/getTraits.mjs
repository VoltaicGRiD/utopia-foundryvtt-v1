export function getTrait(trait, data = {}) {
  const lower = trait.toLowerCase();

  const allTraits = {
    ...CONFIG.UTOPIA.TRAITS,
    ...CONFIG.UTOPIA.SUBTRAITS
  }

  const correctTrait = {};

  for (const [key, value] of Object.entries(allTraits)) {
    if ([value.name, value.short, value.long].includes(lower)) {
      correctTrait = value;
    }
  }

  return allTraits[trait] || data;
}