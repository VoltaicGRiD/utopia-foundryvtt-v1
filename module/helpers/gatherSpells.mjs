export async function gatherSpells() {
  let allSpells = [];

  // Filter all packs to get only those that are Item compendiums
  let itemPacks = game.packs.filter(pack => pack.metadata.type === 'Item');

  for (let pack of itemPacks) {
    // Load the full documents for spells of type 'spellFeature'
    let spells = await pack.getDocuments({ type: 'spellFeature' });

    // Deep clone each spell's data to preserve all attributes
    let clonedSpells = spells.map(spell => {
      const folderData = spell.folder ? { folder: spell.folder } : {};

      // Convert the spell document to a plain object
      let spellData = spell.toObject(false);

      // Deep clone the spell data to ensure no references are kept
      let clonedData = { ...spellData };

      // Apply the folder data to the cloned spell
      clonedData.folder = folderData.folder;

      // Create a new Item document with the cloned data
      //return new CONFIG.Item.documentClass(clonedData, { parent: spell.parent });
      return { ...clonedData };
    });

    // Add the cloned spells to the allSpells array
    allSpells.push(...clonedSpells);
  }

  return allSpells;
}