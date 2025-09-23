import { buildTraitData } from '../../helpers/actorTraits.mjs';
import { prepareActiveEffectCategories } from '../../helpers/effects.mjs';
import { UtopiaActorComponentsSheet } from './components-sheet.mjs';
import { UtopiaDataOverrideSheet } from './data-override-sheet.mjs';
import { UtopiaTalentTreeSheet } from '../utility/talent-tree-sheet.mjs';
import { UtopiaCompendiumBrowser } from '../utility/compendium-browser.mjs';
import { UtopiaSpellcraftSheet } from '../utility/spellcraft-sheet.mjs';
import { UtopiaSubtraitSheetV2 } from './subtrait-sheet.mjs';
const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class UtopiaActorSheetV2 extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.children = [];
    this.dockedLeft = [];
    this.dockedRight = [];
  }

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'actor-sheet'],
    window: {
      resizeable: true,
      controls: [
        ...super.DEFAULT_OPTIONS.window.controls,
        {
          icon: 'fas fa-pen-to-square',
          label: 'UTOPIA.SheetLabels.openDataOverride',
          action: 'openDataOverride',
          visible: true,
        }
      ]
    },
    position: {
      width: 800,
    },
    actions: {
      onEditImage: this._onEditImage,
      useItem: this._useItem,
      viewDoc: this._viewDoc,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      toggleEffect: this._toggleEffect,
      openTalent: this._openTalent,
      roll: this._onRoll,
      rest: this._onRest,
      selectTalents: this._selectTalent,
      selectSubtraits: this._selectSubtraits,
      selectSpecies: this._selectSpecies,
      deleteAction: this._deleteAction,
      editSpell: this._editSpell,
      castSpell: this._castSpell,
      deleteSpell: this._deleteSpell,
      openSpellcraft: this._openSpellcraft,
      submitComponents: this._submitComponents,
      addToStat: this._addToStat,
      subtractFromStat: this._subtractFromStat,
      maxStat: this._maxStat,
      minStat: this._minStat,
      toggleArtifice: this._toggleArtifice,
      toggleComponents: this._toggleComponents,
      addResource: this._addResource,
      deleteResource: this._deleteResource,
      equipItem: this._equipItem,
      openDataOverride: this._openDataOverride,
      openCompendium: this._openCompendium,
    },
    form: {
      submitOnChange: true,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/utopia/templates/actor/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    characterDetails: {
      template: 'systems/utopia/templates/actor/details-character.hbs',
    },
    npcDetails: {
      template: 'systems/utopia/templates/actor/details-npc.hbs',
    },
    actions: {
      template: 'systems/utopia/templates/actor/actions.hbs',
    },
    biography: {
      template: 'systems/utopia/templates/actor/biography.hbs',
      scrollable: ['.biography-data']
    },
    gear: {
      template: 'systems/utopia/templates/actor/gear.hbs',
    },
    spells: {
      template: 'systems/utopia/templates/actor/spells.hbs',
    },
    effects: {
      template: 'systems/utopia/templates/actor/effects.hbs',
    },
    talents: {
      template: 'systems/utopia/templates/actor/talents.hbs',
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'tabs'];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'character':
        options.parts.push('biography', 'characterDetails', 'talents', 'gear',  'spells', 'actions', 'effects');
        break;
      case 'npc':
        options.parts.push('biography', 'npcDetails', 'gear', 'spells', 'actions', 'effects');
        break;
    }
  }

  _preClose(options) {
    for (const child of this.children) {
      child.close();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Output initialization
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      gm: game.user.isGM,
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      items: this.actor.items,
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      traits: buildTraitData(this.actor),
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      tabs: this._getTabs(options.parts),
      // Check for the "overrideDerivedData" flag
      overrideDerivedData: this.actor.getFlag('utopia', 'overrideDerivedData') ?? false,
    };

    // Offloading context prep to a helper function
    this._prepareItems(context);

    console.log(context);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'actions': 
      case 'characterDetails':
      case 'npcDetails':
      case 'talents':
      case 'gear':
        context.tab = context.tabs[partId];
        break;
      case 'spells':  
        context.tab = context.tabs[partId];
        break;
      case 'biography':
        context.tab = context.tabs[partId];
        context.biographyFields = this._getBiographyFields();
        // Enrich biography info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedBiography = await TextEditor.enrichHTML(
          this.actor.system.biography.description,
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );

        context.enrichedGMNotes = await TextEditor.enrichHTML(
          this.actor.system.biography.gmSecrets,
          {
            secrets: game.user.isGM,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor
          }
        );

        break;
      case 'effects':
        context.tab = context.tabs[partId];
        // Prepare active effects
        context.effects = prepareActiveEffectCategories(
          // A generator that returns all effects stored on the actor
          // as well as any items
          this.actor.allApplicableEffects(),
          {
            specialist: true,
            talent: true,
            gear: true,
          }
        );
        break;
      default:
    }

    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // Default tab for first time it's rendered this session
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'details';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: 'primary',
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Actor.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'characterDetails':
        case 'npcDetails':
          tab.id = 'details';
          tab.label += 'details';
          if (this.actor.type == "character") {
            if (this.actor.system.points.subtrait > 0 || this.actor.system.points.gifted > 0) 
              tab.icon = 'fas fa-bell';
          }
          
          break;
        case 'actions':
          tab.id = 'actions';
          tab.label += 'actions';
          break;
        case 'biography':
          tab.id = 'biography';
          tab.label += 'biography';
          break;
        case 'talents': 
          tab.id = 'talents';
          tab.label += 'talents';
          if (this.actor.type == "character") {
            if (this.actor.system.points.talent > 0 || this.actor.system.points.specialist > 0) 
              tab.icon = 'fas fa-bell';
          }
          
          break;
        case 'gear':
          tab.id = 'gear';
          tab.label += 'gear';
          break;
        case 'spells':
          tab.id = 'spells';
          tab.label += 'spells';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.label += 'effects';
          break;
        default:
      }
      
      if (this.tabGroups['primary'] === tab.id) tab.cssClass = 'active';

      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const weapons = [];
    const talents = [];
    const specialist = [];
    const turnActions = [];
    const interruptActions = [];
    const spells = [];
    const misc = [];

    // Iterate through items, allocating to containers
    for (let i of this.document.items) {
      console.log("Item: ", i);

      i.img = i.img || Item.DEFAULT_ICON;
      
      if (i.type === 'gear') {
        const roll = new Roll(i.system.formula);
        const terms = roll.terms;
        // We need to set the term's index to the index of the redistribution we have in the formula
        terms.forEach((term, index) => {
          if (!term.redistributions || term.redistributions.length === 0) return;
          const redistributions = term.redistributions;
          const formula = term.formula;
          console.log(term, formula, redistributions);
          redistributions.forEach((redistribution, index) => {
            if (redistribution.formula === formula) {
              term.index = index;
            }
          });
        });
        i.terms = terms;
        i.category = game.i18n.localize(`UTOPIA.Item.Artifice.Features.Categories.${i.system.category}`);
        if (i.system.category.toLowerCase().includes('weapon')) {
          weapons.push(i);
        }
        else {
          gear.push(i);
        }
      }
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      else if (i.type === 'talent') {
        talents.push(i);
      }
      else if (i.type === 'specialistTalent') {
        specialist.push(i);
      }
      else if (i.type === 'action') {
        if (i.system.type === 'turn')
          turnActions.push(i);
        else 
          interruptActions.push(i);
      }
      else if (i.type === 'spell') {
        spells.push(i);
      }
      else if (i.type === 'species') {
        continue;
      }

      // Else, append to misc.
      else {
        misc.push(i);
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.talents = talents;
    context.spells = spells;
    context.turnActions = turnActions;
    context.interruptActions = interruptActions;
    context.misc = misc;

    // Sort then assign
    context.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.specialist = specialist.sort((a, b) => (a.name) - (b.name));

    return context;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @override
   */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this.#disableOverrides();

    this.element.querySelectorAll('.spell').forEach((spell) => {
      spell.addEventListener('click', (event) => {
        console.log(event);
        let controls = spell.querySelector('.spell-controls');
        console.log(controls, controls.style.display);
        controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
      });
    });

    this.element.querySelectorAll('.redistribution').forEach((redistribution) => {
      redistribution.addEventListener('update', async (event) => {
        console.log(event);
        const itemId = event.target.closest('li[data-document-class]').dataset.itemId;
        const item = this.actor.items.get(itemId);
        const term = event.target.dataset.termIndex;
        const options = event.target.options;
        const redistribution = options.selectedIndex;

        const roll = new Roll(item.system.formula);
        roll.terms[term] = item.terms[term].redistributions[redistribution];
        const formula = roll.formula;

        console.log(formula);

        await item.update({
          ['system.formula']: formula,
        });      
      });
    });

    this.element.querySelectorAll('.action').forEach((action) => {
      action.addEventListener('contextmenu', async (event) => {
        console.log(event);
        const target = action.dataset.target;
        await this.actor.deleteEmbeddedDocuments('Item', [target]);
      });
    });

    this.element.querySelectorAll("input:not(disabled)").forEach((input) => {
      input.addEventListener('focus', () => {
        input.select();
      });
    });

    this.element.querySelector("#overrideDerivedData").addEventListener('change', async (event) => {
      await this.actor.setFlag('utopia', 'overrideDerivedData', event.target.checked);
    });
  }

  /**
   * Constructs a record of valid characteristics and their associated field
   * @returns {Record<string, {field: NumberField, value: number}>}
   */
  _getBiographyFields() {
    const fields = Object.keys(this.actor.system.schema.getField('biography').fields);
    const selected = this.actor.system.biographyFields;
    const biographyFields = {};

    selected.forEach(s => {
      if (fields.includes(s)) {
        biographyFields[s] = {
          label: this.actor.system.schema.getField('biographyFieldOptions').options.choices[s],
          name: `system.biography.${s}`,
          field: this.actor.system.schema.getField(['biography', s]),
          value: foundry.utils.getProperty(this.actor, `system.biography.${s}`)
        }
      }
    })

    return biographyFields
  }

  static async _useItem(event, target) {
    const doc = this._getEmbeddedDocument(target);
    console.log(doc);

    doc.system.use();
  }

  static async _addToStat(event, target) {
    const stat = target.dataset.stat;
    const path = stat.split('.');
    const newValue = target.dataset.value;
    var oldValue = this.actor;
    for (const p of path) {
      oldValue = oldValue[p];
    }
    const total = oldValue + newValue;
    this.actor.update({
      [stat]: total
    });
  }
  static async _subtractFromStat(event, target) {
    const stat = target.dataset.stat;
    const path = stat.split('.');
    const newValue = target.dataset.value;
    var oldValue = this.actor;
    for (const p of path) {
      oldValue = oldValue[p];
    }
    const total = oldValue - newValue;
    this.actor.update({
      [stat]: total
    });
  }
  static async _maxStat(event, target) {
    const stat = target.dataset.stat;
    const newValue = target.dataset.value;
    const maxPath = newValue.split('.');
    var maxValue = this.actor;
    for (const p of maxPath) {
      maxValue = maxValue[p];
    }
    this.actor.update({
      [stat]: maxValue
    });
  }
  static async _minStat(event, target) {
    const stat = target.dataset.stat;
    this.actor.update({
      [stat]: 0
    });
  }

  static async _deleteResource(event, target) {
    const index = event.target.dataset.index;

    const resources = this.actor.system.resources;

    resources.splice(index, 1);

    await this.actor.update({
      [`system.resources`]: resources,
    });
  }

  static async _addResource(event, target) {
    const resources = this.actor.system.resources;
    const resource = {
      name: `New Resource ${resources.length + 1}`,
      source: true
    }
    resources.push(resource);

    await this.actor.update({
      [`system.resources`]: resources,
    });

    console.log(this.actor);
  }

  static async _equipItem(event, target) {
    const doc = this._getEmbeddedDocument(target);

    if (this.actor.equipmentSlots.head === doc.id) { // This item is equipped
      this.actor.update({
        ['system.equipmentSlots.head']: "empty"
      });
    }
    else { // Nothing or something else is equipped
      this.actor.update({
        ['system.equipmentSlots.head']: doc.id
      });
    }

    this.render();
  }

  static async _deleteAction(event, target) {
    await this.actor.deleteEmbeddedDocuments('Item', [target.dataset.target]);
    this.render();
  }

  static async _selectSpecies(event, target) {
    // Get the actor's species data
    let species = this.actor.system.species;

    // If the actor already has a species, do nothing
    if (species && Object.keys(species).length !== 0)
      return;

    // Create a new options sheet for species selection
    //let newSheet = new UtopiaOptionsSheet();
    //newSheet.actor = this.actor;
    let newSheet = new UtopiaCompendiumBrowser();
    newSheet.render(true);

    // Retrieve the species options from the 'utopia.species' compendium
    let pack = game.packs.get('utopia.species');
    let options = await pack.getDocuments();
    newSheet.displayOptions = options;
    
    // Render the options sheet to the user
    newSheet.render(true);
  }
  
  static async _openTalent(event, target) {
    console.log(event);
    const talent = this.actor.items.get(target.dataset.target);
    talent.sheet.render(true);
  }

  static async _selectTalent(event, target) {
    const sheet = new UtopiaTalentTreeSheet();
    sheet.actor = this.actor;
    sheet.render(true);
  }

  async _dockNewWindow(window, options = {}) {
    const docking = game.settings.get('utopia', 'dockedWindowPosition');
    switch (docking) {
      case 0: 
        var sheet = await new window(foundry.utils.mergeObject(options, {
          position: {
            left: this.position.left + this.position.width,
            top: this.position.top
          }
        }));
        sheet.isDocked = true;
        sheet.dockedTo = this;
        sheet.dockedSide = 1;

        this.children.push(sheet);
        this.dockedRight.push(sheet);
    
        sheet.render(true);
        break;
      case 1:
        var sheet = await new window(foundry.utils.mergeObject(options, {
          position: {
            left: this.position.left - 450,
            top: this.position.top
          }
        }));
        sheet.isDocked = true;
        sheet.dockedTo = this;
        sheet.dockedSide = 0;

        this.children.push(sheet);
        this.dockedLeft.push(sheet);
    
        sheet.render(true);
        break;
      case 2:
        var sheet = await new window(foundry.utils.mergeObject(options, {
        }));
        sheet.isDocked = false;
        
        this.children.push(sheet);
        sheet.render(true);
        break;
      default: 
        break;
    }  
  }

  static async _selectSubtraits(event, target) {
    this._dockNewWindow(UtopiaSubtraitSheetV2, {document: this.actor})
  }

  static async _editSpell(event, target) {
    const spellId = target.closest('.spell').dataset.id;
    const spell = this.actor.items.get(spellId);
    spell.sheet.render(true);
  }

  static async _deleteSpell(event, target) {
    const spellId = target.closest('.spell').dataset.id;
    await this.actor.deleteEmbeddedDocuments('Item', [spellId]);
    this.render();
  }

  static async _openDataOverride(event, target) {
    this._dockNewWindow(UtopiaDataOverrideSheet, {document: this.actor});
  }

  static async _openCompendium(event, target) {
    const category = target.dataset.category;
    const sheet = new UtopiaCompendiumBrowser();
    sheet.render({
      filter: {}, 
      category: category,
      force: true,
    })
  }

  static async _toggleComponents(event, target) {
    this._dockNewWindow(UtopiaActorComponentsSheet, {document: this.actor});
  }

  static async _togglePaperdoll(event, target) {
    this._dockNewWindow(UtopiaPaperdollSheet, {document: this.actor});
  }

  _onPosition(position) {
    this.dockedLeft.forEach(sheet => {
      if (sheet.isDocked) {
        sheet.setPosition({
          left: position.left - sheet.position.width,
          top: position.top,
        });
      }
    });

    this.dockedRight.forEach(sheet => {
      if (sheet.isDocked) {
        sheet.setPosition({
          left: position.left + this.position.width,
          top: position.top,
        });
      }
    });
  }

  static async _submitComponents(event, target) {
    const itemId = target.closest('li[data-document-class]').dataset.itemId;
    const item = this.actor.items.get(itemId);
    const rarity = item.system.rarity;
    const requirements = item.system.craftRequirements;
    const components = item.system.components;
    const actorComponents = this.actor.system.components;

    const types = ["material", "refinement", "power"];
    const typeDifference = {
      material: 0,
      refinement: 0,
      power: 0,
    }
    types.forEach(type => {
      const required = requirements[type];
      const available = components[rarity][type];
      if (required > available) {
        // We need to submit components
        const difference = required - available;
        if (actorComponents[rarity][type] < difference) {
          // We don't have enough components, post a whisper to chat, and return
          typeDifference[type] = difference;
          return;
        }
        else {
          // We have at least the required amount of components to submit
          // We'll subtract the difference from the actor's components
          actorComponents[rarity][type] -= difference;
          // We'll update the item's components
          components[rarity][type] = 0;
          // And update the item
          item.update({
            ['system.components']: components,
          });
        }
        return;
      }
    });

    const template = 'systems/utopia/templates/chat/components-required.hbs';
    templateData = {
      actor: this.actor,
      item: item,
      required: typeDifference,
    }

    UtopiaChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      whisper: [game.user.id],
      content: await renderTemplate(template, templateData),
    })
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Handle changing a Document's image.
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @returns {Promise}
   * @protected
   */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewDoc(event, target) {
    console.log(event, target);

    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /**
   * Handles item deletion
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteDoc(event, target) {
    console.log(event, target);
    const doc = this._getEmbeddedDocument(target);
    await doc.delete();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Finally, create the embedded document!
    await docCls.create(docData, { parent: this.actor });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    await effect.update({ disabled: !effect.disabled });
  }

  /**
   * Handle clickable rolls.
   *
   * @this UtopiaActorSheetV2
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = target.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        const terms = item.terms || undefined;
        if (item) return item.roll(terms);
      }
      else if (dataset.rollType == 'talent') {
        const talent = dataset.talent;
        const item = this.actor.items.get(talent);
        return item.roll();
      }
      else if (dataset.rollType == 'trait') {
        return await this.actor.performCheck(dataset.trait);
      }
      else if (dataset.rollType == 'spell') {
        let spell = this.actor.items.get(dataset.spell);
        return await this.actor.castSpell(spell);
      }
      else if (dataset.rollType == 'action') {
        let action = this.actor.items.get(dataset.target);
        console.log(action);
        return await this.actor.performAction(action); 
      }
    }   

    // Handle actor rolls.
    // Create the label for the chat message
    let label = `${dataset.label}`;

    // Create and perform the roll
    let roll = new Roll(finalRoll, this.actor.getRollData());
    console.log(roll);

    // Send the roll result to chat
    let message = await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    console.log(message);

    return roll;
  }

  static async _onRest(event, target) {
    this.actor.rest();
  }

  static async _openSpellcraft(event, target) {
    const sheet = new UtopiaSpellcraftSheet();
    sheet.actor = this.actor;
    sheet.render(true);
  }

  /** Helper Functions */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target    The element subject to search
   * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    if (target.dataset.document) {
      return this.actor.items.get()
    }

    const docRow = target.closest('li[data-document-class]') || target.closest('tr');
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  /***************
   *
   * Drag and Drop
   *
   ***************/

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;

    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    console.log(event, data);

    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest('[data-item-id]');
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id)
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  /********************
   *
   * Actor Override Handling
   *
   ********************/

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @override
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (let k of Object.keys(overrides)) delete submitData[k];
    await this.document.update(submitData);
  }

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }
}