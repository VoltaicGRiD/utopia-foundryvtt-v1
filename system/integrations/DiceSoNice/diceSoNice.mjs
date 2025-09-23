export function registerDiceSoNice(dice3d) {    
  if (!dice3d) return;
  dice3d.addTexture("utopia", {
    name: "Utopia",
    composite: "source-over",
    source: "systems/utopia/assets/Utopia-Logo.webp",
    bump: ""
  })

  const utopiaDark = "systems/utopia/assets/dice/Utopia-Logo-Black.png";
  const utopiaDarkSmall = "systems/utopia/assets/dice/Utopia-Logo-Black-Small.png";
  const utopiaLight = "systems/utopia/assets/dice/Utopia-Logo.png";
  const utopiaLightSmall = "systems/utopia/assets/dice/Utopia-Logo-Small.png";

  const utopiaDarkSystem = {
    id: "utopia_dark",
    name: "Utopia Dark",
    group: "Utopia",
    mode: "preferred",
  };
  dice3d.addSystem(utopiaDarkSystem);

  const utopiaLightSystem = {
    id: "utopia_light",
    name: "Utopia Light",
    group: "Utopia",
    mode: "preferred",
  };
  dice3d.addSystem(utopiaLightSystem);

  // D4
  dice3d.addDicePreset({
    type: "d4",
    labels: ["1", "2", "3", utopiaDark],
    bumpMaps: [,,,utopiaLight],
    system: "utopia_dark",
  }, "d4")

  // D6
  dice3d.addDicePreset({
    type: "d6",
    labels: ["1", "2", "3", "4", "5", utopiaDark],
    bumpMaps: [,,,,,utopiaLight],
    system: "utopia_dark",
  }, "d6")

  // D8
  dice3d.addDicePreset({
    type: "d8",
    labels: ["1", "2", "3", "4", "5", "6", "7", utopiaDarkSmall],
    bumpMaps: [,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d8")

  // D10
  dice3d.addDicePreset({
    type: "d10",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d10")

  // D12
  dice3d.addDicePreset({
    type: "d12",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d12")

  // D20
  dice3d.addDicePreset({
    type: "d20",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", utopiaDarkSmall],
    bumpMaps: [,,,,,,,,,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_dark",
  }, "d20")

  // --------------------

  // D4
  dice3d.addDicePreset({
    type: "d4",
    labels: ["1", "2", "3", utopiaLight],
    bumpMaps: [,,,utopiaLight],
    system: "utopia_light",
  }, "d4")

  // D6
  dice3d.addDicePreset({
    type: "d6",
    labels: ["1", "2", "3", "4", "5", utopiaLight],
    bumpMaps: [,,,,,utopiaLight],
    system: "utopia_light",
  }, "d6")

  // D8
  dice3d.addDicePreset({
    type: "d8",
    labels: ["1", "2", "3", "4", "5", "6", "7", utopiaLightSmall],
    bumpMaps: [,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d8")

  // D10
  dice3d.addDicePreset({
    type: "d10",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d10")

  // D12
  dice3d.addDicePreset({
    type: "d12",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d12")

  // D20
  dice3d.addDicePreset({
    type: "d20",
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", utopiaLightSmall],
    bumpMaps: [,,,,,,,,,,,,,,,,,,,utopiaLightSmall],
    system: "utopia_light",
  }, "d20");
}
