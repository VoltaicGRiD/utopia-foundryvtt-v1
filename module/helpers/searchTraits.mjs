import { longToShort, shortToLong } from "./traitNames.mjs";

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

  return undefined; // Optional: explicitly return undefined if not found
}
