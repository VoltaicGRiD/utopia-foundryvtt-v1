/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates({
    'trait': 
      'systems/utopia/templates/actor/partials/trait.hbs',

    'subtrait': 
      'systems/utopia/templates/actor/partials/subtrait.hbs',

    'damage-instance': 
      'systems/utopia/templates/chat/damage-instance.hbs',

    'paper-doll':
      'systems/utopia/templates/specialty/paperdoll-attributes.hbs',
  });
};

