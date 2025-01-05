/**
 * Manage Active Effect instances through an Actor or Item Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest('li');
  const effect = li.dataset.effectId
    ? owner.effects.get(li.dataset.effectId)
    : null;
  switch (a.dataset.action) {
    case 'create':
      return owner.createEmbeddedDocuments('ActiveEffect', [
        {
          name: game.i18n.format('DOCUMENT.New', {
            type: game.i18n.localize('DOCUMENT.ActiveEffect'),
          }),
          icon: 'icons/svg/aura.svg',
          origin: owner.uuid,
          'duration.rounds':
            li.dataset.effectType === 'temporary' ? 1 : undefined,
          disabled: li.dataset.effectType === 'inactive',
        },
      ]);
    case 'edit':
      return effect.sheet.render(true);
    case 'delete':
      return effect.delete();
    case 'toggle':
      return effect.update({ disabled: !effect.disabled });
  }
}

/**
 * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
 * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects, options = {}) {
  const effectOptions = {
    temporary: options.temporary ?? true,
    passive: options.passive ?? true,
    inactive: options.inactive ?? true,
    specialist: options.specialist ?? false,
    talent: options.talent ?? false,
    gear: options.gear ?? false,
  };

  const categories = {};
  if (effectOptions.temporary)
    categories.temporary = {
      type: 'temporary',
      label: game.i18n.localize('TYPES.ActiveEffect.temporary'),
      effects: [],
    };
  if (effectOptions.passive)
    categories.passive = {
      type: 'passive',
      label: game.i18n.localize('TYPES.ActiveEffect.passive'),
      effects: [],
    };
  if (effectOptions.inactive)
    categories.inactive = {
      type: 'inactive',
      label: game.i18n.localize('TYPES.ActiveEffect.inactive'),
      effects: [],
    };
  if (effectOptions.specialist)
    categories.specialist = {
      type: 'specialist',
      label: game.i18n.localize('TYPES.ActiveEffect.specialist'),
      effects: [],
    };
  if (effectOptions.talent)
    categories.talent = {
      type: 'talent',
      label: game.i18n.localize('TYPES.ActiveEffect.talent'),
      effects: [],
    };
  if (effectOptions.gear)
    categories.gear = {
      type: 'gear',
      label: game.i18n.localize('TYPES.ActiveEffect.gear'),
      effects: [],
    };

  // Iterate over active effects, classifying them into categories
  for (let e of effects) {
    console.log(e);
    if (e.type === 'specialist') categories.specialist.effects.push(e);
    else if (e.type === 'talent') categories.talent.effects.push(e);
    else if (e.type === 'gear') categories.gear.effects.push(e);
    else if (e.disabled) categories.inactive.effects.push(e);
    else if (e.isTemporary) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }

  return categories;
}
