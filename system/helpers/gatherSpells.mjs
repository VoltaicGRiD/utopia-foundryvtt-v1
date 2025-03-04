export async function gatherSpellFeatures() {
  const allSpells = [];

  // Filter all packs to get only those that are Item compendiums
  const itemPacks = game.packs.filter(pack => pack.metadata.type === 'Item');

  for (const pack of itemPacks) {
    // Load the full documents for spells of type 'spellFeature'
    const spells = await pack.getDocuments({ type: 'spellFeature' });

    // Deep clone each spell's data to preserve all attributes
    const clonedSpells = spells.map(spell => {
      const folderData = spell.folder ? { folder: spell.folder } : {};

      // Convert the spell document to a plain object
      const spellData = spell.toObject(false);

      // Deep clone the spell data to ensure no references are kept
      const clonedData = { ...spellData };

      clonedData.rollData = spell.getRollData();

      // Apply the folder data to the cloned spell
      clonedData.folder = folderData.folder;

      // Create a new Item document with the cloned data
      //return new CONFIG.Item.documentClass(clonedData, { parent: spell.parent });
      return { ...clonedData };
    });

    // Add the cloned spells to the allSpells array
    allSpells.push(...clonedSpells);
  }

  // Get all items of type spell
  const worldSpells = game.items.filter(i => i.type === "spellFeature"); 

  // Clone the spells that are owned or editable
  const clonedSpells = worldSpells.map(spell => {

    // Check if the spell is owned or editable
    if (spell.isOwner || spell.editable || game.user.isGM) {
      const folderData = spell.folder ? { folder: spell.folder } :  {name: "Uncategorized", color: {rgb: "rgb(0, 0, 0)", css: "#000000"}};

      // Convert the spell document to a plain object
      const spellData = spell.toObject(false);

      // Deep clone the spell data to ensure no references are kept
      const clonedData = { ...spellData };

      clonedData.rollData = spell.getRollData();

      // Apply the folder data to the cloned spell
      clonedData.folder = folderData.folder;

      // Create a new Item document with the cloned data
      return { ...clonedData };
    }
  });

  allSpells.push(...clonedSpells);

  return allSpells;
}

export async function gatherSpells() {
  const allSpells = [];

  // Filter all packs to get only those that are Item compendiums
  const itemPacks = game.packs.filter(pack => pack.metadata.type === 'Item');

  for (const pack of itemPacks) {
    // Load the full documents for spells of type 'spellFeature'
    const spells = await pack.getDocuments({ type: 'spell' });

    // We don't need to clone these spells, since we can't modify them from spellcrafting
    allSpells.push(...spells);
  }
   
  // Get all world items of type spell
  const worldSpells = [].concat(...Array.from(game.items.filter(i => i.type === "spell")));
  allSpells.push(...worldSpells);

  // Get all actor owned spells
  const actorSpells = [].concat(...Array.from(game.actors.map(a => a.items.filter(i => i.type === "spell"))))
  allSpells.push(...actorSpells);

  return allSpells;
}