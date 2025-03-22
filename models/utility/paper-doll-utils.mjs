export function getPaperDollContext(actor) {
  const context = {};

  context.head = {};
  context.head.augments = actor.augments.head.map(i => actor.parent.items.get(i));
  context.head.evolution = actor.evolution.head;
  context.head.unaugmentable = actor.armors.unaugmentable.head;
  context.head.unequippable = actor.armors.unequippable.head;
  context.head.specialty = actor.armors.specialty.head;
  context.head.items = actor.equipmentSlots.head.map(i => actor.parent.items.get(i));
  context.head.augments = actor.augments.head.map(i => actor.parent.items.get(i));

  context.neck = {};
  context.neck.augments = actor.augments.neck.map(i => actor.parent.items.get(i));
  context.neck.evolution = actor.evolution.neck;
  context.neck.unaugmentable = actor.armors.unaugmentable.neck;
  context.neck.unequippable = actor.armors.unequippable.neck;
  context.neck.specialty = actor.armors.specialty.neck;
  context.neck.items = actor.equipmentSlots.neck.map(i => actor.parent.items.get(i));
  context.neck.augments = actor.augments.neck.map(i => actor.parent.items.get(i));

  context.chest = {};
  context.chest.augments = actor.augments.chest.map(i => actor.parent.items.get(i));
  context.chest.evolution = actor.evolution.chest;
  context.chest.unaugmentable = actor.armors.unaugmentable.chest;
  context.chest.unequippable = actor.armors.unequippable.chest;
  context.chest.specialty = actor.armors.specialty.chest;
  context.chest.items = actor.equipmentSlots.chest.map(i => actor.parent.items.get(i));
  context.chest.augments = actor.augments.chest.map(i => actor.parent.items.get(i));

  context.back = {};
  context.back.augments = actor.augments.back.map(i => actor.parent.items.get(i));
  context.back.evolution = actor.evolution.back;
  context.back.unaugmentable = actor.armors.unaugmentable.back;
  context.back.unequippable = actor.armors.unequippable.back;
  context.back.specialty = actor.armors.specialty.back;
  context.back.items = actor.equipmentSlots.back.map(i => actor.parent.items.get(i));
  context.back.augments = actor.augments.back.map(i => actor.parent.items.get(i));

  context.hands = {};
  context.hands.augments = actor.augments.hands.map(i => actor.parent.items.get(i));
  context.hands.evolution = actor.evolution.hands;
  context.hands.unaugmentable = actor.armors.unaugmentable.hands;
  context.hands.unequippable = actor.armors.unequippable.hands;
  context.hands.specialty = actor.armors.specialty.hands;
  context.hands.items = actor.equipmentSlots.hands.map(i => actor.parent.items.get(i));
  context.hands.augments = actor.augments.hands.map(i => actor.parent.items.get(i));

  context.ring = {};
  context.ring.augments = actor.augments.ring.map(i => actor.parent.items.get(i));
  context.ring.evolution = actor.evolution.ring;
  context.ring.unaugmentable = actor.armors.unaugmentable.ring;
  context.ring.unequippable = actor.armors.unequippable.ring;
  context.ring.specialty = actor.armors.specialty.ring;
  context.ring.items = actor.equipmentSlots.ring.map(i => actor.parent.items.get(i));
  context.ring.augments = actor.augments.ring.map(i => actor.parent.items.get(i));

  context.waist = {};
  context.waist.augments = actor.augments.waist.map(i => actor.parent.items.get(i));
  context.waist.evolution = actor.evolution.waist;
  context.waist.unaugmentable = actor.armors.unaugmentable.waist;
  context.waist.unequippable = actor.armors.unequippable.waist;
  context.waist.specialty = actor.armors.specialty.waist;
  context.waist.items = actor.equipmentSlots.waist.map(i => actor.parent.items.get(i));
  context.waist.augments = actor.augments.waist.map(i => actor.parent.items.get(i));

  context.feet = {};
  context.feet.augments = actor.augments.feet.map(i => actor.parent.items.get(i));
  context.feet.evolution = actor.evolution.feet;
  context.feet.unaugmentable = actor.armors.unaugmentable.feet;
  context.feet.unequippable = actor.armors.unequippable.feet;
  context.feet.specialty = actor.armors.specialty.feet;
  context.feet.items = actor.equipmentSlots.feet.map(i => actor.parent.items.get(i));
  context.feet.augments = actor.augments.feet.map(i => actor.parent.items.get(i));

  console.log(context);

  return context;
}