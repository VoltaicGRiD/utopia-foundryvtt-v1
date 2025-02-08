import { shortToLong, longToShort } from "./actorTraits.mjs"

export const calculateTraitFavor = (trait, disfavors, favors) => {
  let short = trait;
  let long = trait;

  if (trait.length > 3) {
    short = longToShort(trait);
  } else {
    long = shortToLong(trait);
  }

  let netFavor = 0;
  let disfavor = 0;
  let favor = 0;

  for (let key of favors) {
    console.log(key, short, long, key == short, key == long);
    if (key == short || key == long) {
      netFavor += 1;
      favor += 1;
    }
  }

  for (let key of disfavors) {
    console.log(key, short, long, key == short, key == long);
    if (key == short || key == long) {
      netFavor -= 1;
      disfavor += 1;
    }
  }

  return [netFavor, disfavor, favor];
}