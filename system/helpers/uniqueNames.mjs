/**
 * Generates a unique name by appending an incrementing number to the base name if necessary.
 *
 * @param {string} baseName - The base name to start with.
 * @param {Set<string>} collection - A collection of existing names to check against.
 * @returns {string} - A unique name that does not exist in the collection.
 */
export function getUniqueName(baseName, collection) {
  let name = baseName;
  let i = 1; // Start at 1; we get 'baseName', 'baseName_1', 'baseName_2', etc.

  if (Array.isArray(collection)) {
    collection = new Set(collection);
  }

  switch (typeof collection) {
    case 'object':
      if (collection instanceof Set) {
        while (collection.has(name)) {
          i++;
          name = `${baseName}_${i}`;
        }
      } else {
        while (collection.hasOwnProperty(name)) {
          i++;
          name = `${baseName}_${i}`;
        }
      }
      break;
    case 'undefined':
      collection = new Set();
      break;
    default:
      throw new Error('Collection must be an Object, Array, or Set.');
  }

  return name;
}