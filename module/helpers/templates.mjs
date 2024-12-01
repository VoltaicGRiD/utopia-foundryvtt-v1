/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/utopia/templates/actor/parts/actor-biography.hbs',
    'systems/utopia/templates/actor/parts/actor-actions.hbs',
    'systems/utopia/templates/actor/parts/actor-features.hbs',
    'systems/utopia/templates/actor/parts/actor-items.hbs',
    'systems/utopia/templates/actor/parts/actor-spells.hbs',
    'systems/utopia/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/utopia/templates/item/parts/item-effects.hbs',
    'systems/utopia/templates/item/parts/item-grants.hbs',
    // Talent partials
    'systems/utopia/templates/talent-tree-v1/parts/talent-warfare.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-tactics.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-prowess.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-innovation.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-magecraft.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-influence.hbs',
    // Talent species partials
    'systems/utopia/templates/talent-tree-v1/parts/talent-human.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-automaton.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-cyborg.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-dwarf.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-elf.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-oxtus.hbs',
    'systems/utopia/templates/talent-tree-v1/parts/talent-cambion.hbs',
  ]);
};

