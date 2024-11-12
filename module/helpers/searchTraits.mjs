export default async function searchTraits(traits, subtrait) {
  for (let trait of Object.keys(traits)) {
    if (traits[trait].subtraits[subtrait] !== undefined) {
      return trait; // Returns from the searchTraits function
    }
  }
  return undefined; // Optional: explicitly return undefined if not found
}
