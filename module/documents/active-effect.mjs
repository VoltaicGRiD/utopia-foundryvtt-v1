import { isNumeric, searchTraits, shortToLong, longToShort, calculateTraitFavor, runTrigger } from "../helpers/_module.mjs";
import { UtopiaSubtraitSheetV2 } from "../sheets/other/subtrait-sheet.mjs";
import { UtopiaTalentTreeSheet } from "../sheets/other/talent-tree-sheet.mjs";
import { UtopiaChatMessage } from "./chat-message.mjs";

/**
 * Extend the base A[c]tor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {ActiveEffect}
 */
export class UtopiaActiveEffect extends ActiveEffect {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.

    super.prepareBaseData();
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,q
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    // Data modifications in this step occur after processing embedded
    // documents and before finalizing the data object.

    super.prepareDerivedData();
  }
}
