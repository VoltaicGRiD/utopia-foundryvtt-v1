export async function gatherTalents() {
  let allTalents = [];

  let itemPacks = game.packs.filter(pack => pack.metadata.type === 'Item');
  for (let pack of itemPacks) {
    let content = await pack.getDocuments();
    let talents = content.filter(item => item.type === 'talent');
    allTalents.push(...talents);
  };

  return allTalents;
}