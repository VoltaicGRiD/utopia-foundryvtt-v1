const { api, sheets } = foundry.applications;
import { prepareActiveEffectCategories } from "../../../helpers/_module.mjs";

export class UtopiaTrinketSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.openDetails = [];
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "gear-sheet"],
    position: {
      width: 800,
      height: 700,
    },
    actions: {
      image: this._image,
      addItem: this._addItem,
      deleteStrike: this._deleteStrike,
      deleteResource: this._deleteResource,
      deleteAction: this._deleteAction,
      viewEffect: this._viewEffect,
      createEffect: this._createEffect,
      deleteEffect: this._deleteEffect,
      toggleEffect: this._toggleEffect,
    },
    form: {
      submitOnChange: false,
    },
    window: {
      title: "UTOPIA.SheetLabels.trinket",
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/item/gear/header.hbs",
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    attributes: {
      template: "systems/utopia/templates/item/gear/trinket.hbs",
      scrollable: ['.gear-attributes']
    },
    description: {
      template: "systems/utopia/templates/item/generic/description.hbs",
      scrollable: ['']
    },
    effects: {
      template: "systems/utopia/templates/item/generic/effects.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    
    options.parts = ["header", "tabs", "attributes", "description", "effects"];
  }
  
  _preClose(_options) {
    super.submit();
  }

  async _prepareContext(options) {
    const roll = new Roll(this.item.system.formula);
    const terms = roll.terms;
    console.log(terms);

    var context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      gm: game.user.isGM,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      // Add tabs
      tabs: this._getTabs(options.parts),
      // Add features to context
      features: this.item.system.features,
    };

    console.log(context);

    return context;
  }

/** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
        context.tab = context.tabs[partId];
        context.enrichedfFlavor = await TextEditor.enrichHTML(
          this.item.system.flavor,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );
        break;
      case 'description': 
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );

        context.enrichedGMNotes = await TextEditor.enrichHTML(
          this.item.system.gmSecrets,
          {
            secrets: game.user.isGM,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );
      case 'effects': 
        context.tab = context.tabs[partId];
        context.effects = prepareActiveEffectCategories(this.item.effects, {
          temporary: true,
          passive: true,
          inactive: true,
          specialist: true,
          talent: true,
        });        
        break;
      default:
        break;
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
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'attributes';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: 'primary',
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
        case 'description':
        case 'effects':
          tab.id = partId;
          tab.label += partId;
          break;
        default:
      }
      
      if (this.tabGroups['primary'] === tab.id) tab.cssClass = 'active';

      tabs[partId] = tab;
      return tabs;
    }, {});
  }    

  _onRender(context, options) {
    this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
      details.querySelectorAll('select').forEach((select) => {
        select.addEventListener('change', async (event) => {
          this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
            if (details.attributes.open) {
              this.openDetails.push(index);
            }
          });

          await super.submit();

          this.render();
        });
      });
    });

    this.element.querySelectorAll('input[type="checkbox"]').forEach((select) => {
      select.addEventListener('change', async (event) => {
        this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
          if (details.attributes.open) {
            this.openDetails.push(index);
          }
        });

        await super.submit();

        this.render();
      });
    });


    this.element.querySelectorAll(['.strike', '.resource', '.action']).forEach((details, index) => {
      if (this.openDetails.includes(index)) {
        details.setAttribute('open', '');
      }
    });
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
  
  static async _addItem(event) {
    const type = this.element.querySelector('#addOptions').selectedOptions[0].value;
    console.log("Creating ", type);
    switch (type) {
      case 'strike':
        this._addStrike();
        break;
      case 'resource':
        this._addResource();
        break;
      case 'action':
        this._addAction();
        break;
    }
  }
  
  async _addStrike() {
    const strikes = this.item.system.strikes;
    const strike = {
      name: `${this.item.name} Strike ${strikes.length + 1}`,
    }
    strikes.push(strike);

    await this.item.update({
      [`system.strikes`]: strikes,
    });
  }

  static async _deleteStrike(event) {
    const index = event.target.dataset.index;

    const strikes = this.item.system.strikes;

    strikes.splice(index, 1);

    await this.item.update({
      [`system.strikes`]: strikes,
    });
  }

  async _addResource() {
    const resources = this.item.system.resources;
    const resource = {
      name: `New Resource ${resources.length + 1}`,
    }
    resources.push(resource);

    await this.item.update({
      [`system.resources`]: resources,
    });
  }

  static async _deleteResource(event) {
    const index = event.target.dataset.index;

    const resources = this.item.system.resources;

    resources.splice(index, 1);

    await this.item.update({
      [`system.resources`]: resources,
    });
  }

  async _addAction() {
    const actions = this.item.system.actions;
    const action = {
      name: `New Action ${actions.length + 1}`,
    }
    actions.push(action);

    await this.item.update({
      [`system.actions`]: actions,
    });
  }

  static async _deleteAction(event) {
    const index = event.target.dataset.index;

    const actions = this.item.system.actions;

    actions.splice(index, 1);

    await this.item.update({
      [`system.actions`]: actions,
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

    effectData.name = this.item.name;
    effectData.type = "gear";
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
    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call("dropItemSheetData", item, this, data);
    console.log(data, item, allowed);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
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