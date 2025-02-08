const { api, sheets } = foundry.applications;

import { buildTraitData } from "../../helpers/actorTraits.mjs";
import Quirks from "../../other/quirks.mjs";

export class UtopiaSpeciesSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "species-sheet"],
    position: {
      width: 700,
      height: 600,
    },
    actions: {
      image: this._image,
      addQuirk: this._addQuirk,
      removeQuirk: this._removeQuirk,
      togglePaperdoll: this._togglePaperdoll,
      tradeSubtraits: this._tradeSubtraits,
      //update: this._update,
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
    },
    tag: "form",
    window: {
      title: "UTOPIA.SheetLabels.species",
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/generic/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/item/species/attributes.hbs",
      scrollable: [".standard-attributes"]
    },
    paperdoll: {
      template: "systems/utopia/templates/item/species/paperdoll.hbs",
    },
    quirks: {
      template: "systems/utopia/templates/item/species/quirks.hbs",
      scrollable: [".standard-attributes"]
    },
    description: {
      template: "systems/utopia/templates/item/generic/description.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes", "quirks", "paperdoll", "description"];
  };

  async _prepareContext(options) {
    const subtraits = buildTraitData();

    var context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      quirks: Quirks,
      subtraits: subtraits
    };

    context.speeds = [
      "@spd.total",
      "@spd.total / 2",
      "@spd.total / 4",
      "@spd.total * 2",
      "@spd.total * 4"
    
    ];
    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
      case 'quirks':
      case 'description':
        context.tab = context.tabs[partId];
        break;
      case 'paperdoll': 
        context.paperdoll = this.item.system.getPaperDoll()
        context.tab = context.tabs[partId];
        break;
      default:
    }
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
  
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'attributes';
  
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Item.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
        case 'paperdoll':
        case 'quirks':
        case 'description':
          tab.id = partId;
          tab.label += partId;
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  
      tabs[partId] = tab;
      return tabs;
    }, {});
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
    super._onRender(context, options);
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  static async _image(event) {
    event.preventDefault();
    let file = await new FilePicker({
      type: "image",
      current: this.document.img,
      callback: (path) => {
        this.document.update({
          img: path,
        });
      },
    }).browse();
  }

  static async _addQuirk(event, target) {
    const value = this.element.querySelector('#add-quirk').selectedOptions[0].value;

    const quirk = Quirks.filter(q => q.name === value);
    const quirks = this.item.system.quirks;
    if (quirks.length > 4) {
      ui.notifications.warn("You can only have up to 5 quirks.");
      return;
    }
    quirks.push(quirk[0]);

    console.log(quirk, quirks);

    await this.item.update({
      system: {
        quirks: quirks
      }
    });
  }

  static async _removeQuirk(event, target) {
    const index = target.dataset.quirk;
    
    const quirks = this.item.system.quirks;
    quirks.splice(index, 1);
    
    await this.item.update({
      system: {
        quirks: quirks
      }
    });
  }

  static async _togglePaperdoll(event, target) {
    const type = target.dataset.type;
    const slot = target.dataset.slot;

    switch (type) {
      case "augmentable":
        await this.item.update({
          [`system.armors.unaugmentable.${slot}`]: !this.item.system.armors.unaugmentable[slot]
        });
        break;
      case "equippable": 
        await this.item.update({
          [`system.armors.unequippable.${slot}`]: !this.item.system.armors.unequippable[slot]
        });
        break;
      case "specialty": 
        await this.item.update({
          [`system.armors.specialty.${slot}`]: !this.item.system.armors.specialty[slot]
        });
        break;
      default:
    }
  }

  static async _tradeSubtraits(event, target) {
    const points = this.item.system.gifts.points;

    // Points == 2 - Subtract 2 points
    if (points === 2) {
      await this.item.update({
        [`system.gifts.points`]: 0,
      });
    }
    else {
      await this.item.update({
        [`system.gifts.points`]: 2,
      });
    }
  }

  async _onDropQuirk(event, data) {
    console.log(event, data);

    const quirk = Quirks.find(q => q.name === data.name);
    const quirks = this.item.system.quirks;
    quirks.push(quirk);

    await this.item.update({
      system: {
        quirks: quirks
      }
    });
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this BoilerplateItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _viewEffect(event, target) {
    const effect = this._getEffect(target);
    effect.sheet.render(true, {typeLocked: true});
  }

  /**
   * Handles item deletion
   *
   * @this BoilerplateItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteEffect(event, target) {
    const effect = this._getEffect(target);
    await effect.delete();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this BoilerplateItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createEffect(event, target) {
    // Retrieve the configured document class for ActiveEffect
    const aeCls = getDocumentClass("ActiveEffect");
    // Prepare the document creation data by initializing it a default name.
    // As of v12, you can define custom Active Effect subtypes just like Item subtypes if you want
    const effectData = {
      name: aeCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: "base",
        parent: this.item,
      }),
    };
    // Loop through the dataset and add it to our effectData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (["action", "documentClass"].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(effectData, dataKey, value);
    }

    // Get the type from the nearest li dataset 'effectType'
    effectData.type = target.closest("li").dataset.effectType;

    effectData.name = this.item.name;
    effectData.origin = this.item.uuid;

    console.log(effectData);

    // Finally, create the embedded document!
    await aeCls.create(effectData, { parent: this.item });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this BoilerplateItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEffect(target);
    await effect.update({ disabled: !effect.disabled });
  }

  /** Helper Functions */

  /**
   * Fetches the row with the data for the rendered embedded document
   *
   * @param {HTMLElement} target  The element with the action
   * @returns {HTMLLIElement} The document's row
   */
  _getEffect(target) {
    const li = target.closest(".effect");
    return this.item.effects.get(li?.dataset?.effectId);
  }

  /**
   *
   * DragDrop
   *
   */

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
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
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
    console.warn(event);

    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call("dropItemSheetData", item, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "Quirk": 
        return this._onDropQuirk(event, data);
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effect = await aeCls.fromDropData(data);
    if (!this.item.isOwner || !effect) return false;

    if (this.item.uuid === effect.parent?.uuid)
      return this._onEffectSort(event, effect);
    return aeCls.create(effect, { parent: this.item });
  }

  /**
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest("[data-effect-id]");
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && siblingId !== effect.id)
        siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.item.updateEmbeddedDocuments("ActiveEffect", updateData);
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
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
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
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
}