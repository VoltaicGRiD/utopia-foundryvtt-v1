/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates({
    'actor-trait':
      'systems/utopia/templates/actor/traits.hbs',

    'paper-doll': 
      'systems/utopia/templates/item/species/paperdoll-attributes.hbs',
  });
};

