/**
 * Determine if the target is within range for the item’s attack.
 * @param {Item} item - The item being used for the attack.
 * @returns {Promise<boolean>} Whether the attack can proceed based on range.
 */
export default async function rangeTest(item, target) {
  // Get the user's selected token.
  let userToken = canvas.tokens.controlled[0];
  if (!userToken) {
    // If no token is controlled, get the first owned token.
    userToken = canvas.tokens.owned[0];
  }
  if (!userToken) {
    // If no token is selected or owned, show an error and exit.
    ui.notifications.error("You must select a token to attack.");
    return false;
  }

  // Calculate the user's position.
  let userPosition = userToken.x + userToken.y;

  // Get the target token.
  let targetToken = target;
  if (!targetToken) {
    ui.notifications.error("No target selected.");
    return false;
  }

  // Calculate the target's position.
  let targetPosition = targetToken.x + targetToken.y;

  // Determine the distance between the user and the target.
  let distance = Math.abs(userPosition - targetPosition) / 100;

  let dexterityCheck;
  let range = item.system.range;

  if (item.system.ranged) {
    // If the weapon is ranged.

    if (range.includes('/')) {
      // The range is specified as close/far (e.g., "30/60").

      // Split the range into close and far values.
      let [closeRange, farRange] = range.split('/').map(r => parseInt(r));

      // Get the roll data for the item.
      let rollData = item.getRollData();

      console.log(distance, range, closeRange, farRange);

      // Determine the appropriate dexterity check based on distance.
      if (distance <= closeRange) {
        // Within close range, use a favorable roll.
        dexterityCheck = "4d6 + @actor.traits.agi.subtraits.dex.mod";
      } else if (distance <= farRange) {
        // Within far range, use a standard roll.
        dexterityCheck = "2d6 + @actor.traits.agi.subtraits.dex.mod";
      } else {
        // Beyond far range, the attack cannot proceed.
        ui.notifications.error("Target is out of range.");
        return false;
      }

      // Prepare the roll.
      const speaker = ChatMessage.getSpeaker({ actor: item.parent });
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `[${item.type}] Ranged > Dex Check`;

      // Perform the dexterity check roll.
      const roll = new Roll(dexterityCheck, rollData);
      const chat = await roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });

      // Calculate the total of the roll.
      let sum = chat.rolls.reduce((acc, current) => acc + current.total, 0);

      if (sum >= distance) {
        // The attack hits.
        let chatData = {
          user: game.user._id,
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
          content: "Success! Ranged attack hits.",
        };
        ChatMessage.create(chatData, {});

        return true;
      } else {
        // The attack misses.
        let chatData = {
          user: game.user._id,
          speaker: speaker,
          rollMode: rollMode,
          flavor: label,
          content: "Failure! Ranged attack misses.",
        };
        ChatMessage.create(chatData, {});

        return false;
      }
    } else {
      // If the range is a single value.
      if (distance <= parseInt(range)) {
        // The target is within range.
        return true;
      } else {
        // The target is out of range.
        ui.notifications.error("Target is out of range.");
        return false;
      }
    }
  } else {
    // If the weapon is melee.

    if (distance <= parseInt(range)) {
      // The target is within melee range.
      return true;
    } else {
      // The target is out of melee range.
      ui.notifications.error("Target is out of range.");
      return false;
    }
  }
}