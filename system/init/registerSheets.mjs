import { TalentTree } from "../../applications/item/talent-tree.mjs";
import { ItemSheet } from "../../applications/item/standard-sheet.mjs";
import { CharacterSheet } from "../../applications/actors/character-sheet.mjs";
import { SpellSheet } from "../../applications/item/spell.mjs";
import { SpellFeatureSheet } from "../../applications/item/spell-feature.mjs";
import { NPC } from "../../applications/actor/npc.mjs";
import { Species } from "../../applications/item/species.mjs";
import { GearSheet } from "../../applications/item/gear.mjs";
import { Creature } from "../../applications/actor/creature.mjs";
import { GearFeatureSheet } from "../../applications/item/gear-feature.mjs";
import { Harvest } from "../../applications/item/harvest.mjs";
import { ActivitySheet } from "../../applications/activity/activity-sheet.mjs";
import { SpecialistTalent } from "../../applications/item/specialist-talent.mjs";

export function registerItemSheets() {
  Items.registerSheet("utopia", Species, {
    makeDefault: true,
    types: ["species"],
    label: "UTOPIA.SheetLabels.species",
  });
  Items.registerSheet("utopia", TalentTree, {
    makeDefault: true,
    types: ["talentTree"],
    label: "UTOPIA.SheetLabels.talentTree",
  });
  Items.registerSheet("utopia", ItemSheet, {
    makeDefault: true,
    types: ["talent"],
    label: "UTOPIA.SheetLabels.item",
  });
}

export function registerActorSheets() {
  Actors.registerSheet("utopia", CharacterSheet, {
    makeDefault: true,
    types: ["character"],
    label: "UTOPIA.SheetLabels.character",
  });
}