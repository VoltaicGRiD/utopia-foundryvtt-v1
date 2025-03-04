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

    'actor-paper-doll': 
      'systems/utopia/templates/actor/paperdoll-attributes.hbs',
    
    'tree-talent': 
      'systems/utopia/templates/other/talent-tree-fullscreen/talent.hbs',

    'classification':
      'systems/utopia/templates/other/feature-builder/classification.hbs',
    
    'standard-attributes': 
      'systems/utopia/templates/other/feature-builder/standard-attributes.hbs',

    'creator-trait': 
      'systems/utopia/templates/other/character-creator/subtrait.hbs',
    
    'attribute': 
      'systems/utopia/templates/other/feature-builder/attribute.hbs',
  });
};

