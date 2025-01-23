export async function gatherFeatures(type) {
  const allFeatures = [];
 
  const packs = game.packs.filter(p => p.metadata.type === "Item");
  for (const pack of packs) {
    const content = await pack.getDocuments();
    const features = content.filter(i => i.type === type);
    const clonedFeatures = features.map(i => {
      const data = i.clone();
      data.system.uuid = i.uuid;
      
      return data;
    });
    allFeatures.push(...clonedFeatures);
  };

  const items = game.items.filter(i => i.type === type);
  const clonedItems = items.map(i => {
    const data = i.clone();
    data.system.uuid = i.uuid;

    return data;
  });
  allFeatures.push(...clonedItems);

  return allFeatures;  
}