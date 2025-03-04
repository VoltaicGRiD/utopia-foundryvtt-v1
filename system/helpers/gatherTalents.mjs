export async function gatherTalents() {
  const allTalents = [];

  // Filter all packs to get only those that are Item compendiums
  const itemPacks = game.packs.filter(pack => pack.metadata.type === 'Item');

  for (const pack of itemPacks) {
    // Load the full documents for talents of type 'talent'
    const talents = await pack.getDocuments({ type: 'talent' });

    // Deep clone each talent's data to preserve all attributes
    const clonedTalents = talents.map(talent => {
      const folderData = talent.folder ? { folder: talent.folder } : {};

      // Convert the talent document to a plain object
      const talentData = talent.toObject(false);

      // Deep clone the talent data to ensure no references are kept
      const clonedData = { ...talentData };

      clonedData.rollData = talent.getRollData();

      // Apply the folder data to the cloned talent
      clonedData.folder = folderData.folder;

      // Create a new Item document with the cloned data
      //return new CONFIG.Item.documentClass(clonedData, { parent: talent.parent });
      return { ...clonedData };
    });

    // Add the cloned talents to the allTalents array
    allTalents.push(...clonedTalents);
  }

  // Get all items of type talent
  const worldTalents = game.items.filter(i => i.type === "talent"); 

  // Clone the talents that are owned or editable
  const clonedTalents = worldTalents.map(talent => {

    // Check if the talent is owned or editable
    if (talent.isOwner || talent.editable || game.user.isGM) {
      const folderData = talent.folder ? { folder: talent.folder } :  {name: "Uncategorized", color: {rgb: "rgb(0, 0, 0)", css: "#000000"}};

      // Convert the talent document to a plain object
      const talentData = talent.toObject(false);

      // Deep clone the talent data to ensure no references are kept
      const clonedData = { ...talentData };

      clonedData.rollData = talent.getRollData();

      // Apply the folder data to the cloned talent
      clonedData.folder = folderData.folder;

      // Create a new Item document with the cloned data
      return { ...clonedData };
    }
  });

  allTalents.push(...clonedTalents);

  return allTalents;
}