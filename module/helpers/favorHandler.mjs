import { shortToLong, longToShort } from "./traitNames.mjs"

export const calculateTraitFavor = (trait, disfavors, favors) => {
  let short = trait;
  let long = trait;

  if (trait.length > 3) {
    short = longToShort(trait);
  } else {
    long = shortToLong(trait);
  }
  
  let favorKeys = Object.keys(favors);
  let disfavorKeys = Object.keys(disfavors);

  let netFavor = 0;
  let disfavor = 0;
  let favor = 0;

  if (favorKeys.includes(long)) {
    netFavor += favors[long];
    favor++;
  }
  if (favorKeys.includes(short)) {
    netFavor += favors[short];
    favor++;
  }

  if (disfavorKeys.includes(long)) {
    netFavor -= disfavors[long];
    disfavor++;
  }
  if (disfavorKeys.includes(short)) {
    netFavor -= disfavors[short];
    disfavor++;
  }

  return [netFavor, disfavor, favor];
}