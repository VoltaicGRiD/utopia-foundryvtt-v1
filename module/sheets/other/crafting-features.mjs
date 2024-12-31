import { gatherFeatures } from "../../helpers/gatherFeatures.mjs";

const { api, sheets } = foundry.applications;

export class UtopiaCraftingFeaturesSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.dockedTo = undefined;
    this.isDocked = true;
    this.features = [];
    this.chosenFeatures = [];
    this.requiredFeatures = [];
    this.category = "fastWeapon";
    this.requirements = {};
  }

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'crafting-features-sheet'],
    position: {
      width: 350,
      height: 500,
    },
    actions: {
      submit: this._submit,
      cancel: this._cancel,
      target: this._target,
      remove: this._remove,
      clear: this._clear,
      add: this._add,
      dock: this._dock,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: 'UTOPIA.SheetLabels.craftingFeatures',
      controls: [
        {
          icon: 'fas fa-anchor',
          label: 'UTOPIA.SheetLabels.dock',
          action: 'dock',
          visible: true,
        }
      ]
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  static PARTS = {
    features: {
      template: 'systems/utopia/templates/other/crafting-features-sheet.hbs',
      scrollable: [""]
    },
  }

  addChosenFeature(feature) {
    this.chosenFeatures.push(feature);
    this.render();
  }

  removeChosenFeature(feature) {
    this.chosenFeatures = this.chosenFeatures.filter((f) => f !== feature);
    this.render();
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    console.log(options);

    options.parts = ['features'];
  }

  async _prepareContext(options) {
    if (options.isFirstRender) {
      let features = await gatherFeatures("artificeFeature");

      if (this.category) {
        features = features.filter((f) => f.system.category === this.category);
      }

      const requirements = this.requirements;

      const requiredOr = requirements.or.map((r) => r.uuid);
      const requiredAnd = requirements.and.map((r) => r.uuid);

      features.forEach((f) => {
        switch (f.system.costModifier) {
          case "multiply": f.cost = f.system.cost + "X"; break;
          case "divide": f.cost = f.system.cost + "/X"; break;
          case "add": f.cost = f.system.cost + "+X"; break;
          case "subtract": f.cost = f.system.cost + "-X"; break;
          default: f.cost = f.system.cost;
        }

        f.category = game.i18n.localize('UTOPIA.Item.Artifice.Features.Categories.' + f.system.category);
        f.components = {}

        if (f.system.components.material) 
          f.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.material')] = f.system.components.material;
        if (f.system.components.refinement)
          f.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.refinement')] = f.system.components.refinement;
        if (f.system.components.power)
          f.components[game.i18n.localize('UTOPIA.Item.Artifice.Components.Types.power')] = f.system.components.power;

        f.stackable = game.i18n.localize('UTOPIA.Item.Artifice.Features.Stackable.' + f.system.stackable);
        if (f.stackable) {
          f.maxStacks = f.system.maxStacks;
          f.componentsPerStack = game.i18n.localize('UTOPIA.Item.Artifice.Features.ComponentsPerStack.' + f.system.componentsPerStack);
        } else {
          f.componentsPerStack = "N/A";
        }

        if (requiredOr.includes(f.system.uuid)) {
          f.requiredOr = true;
          this.requiredFeatures.push(f);
        }

        else if (requiredAnd.includes(f.system.uuid)) {
          f.requiredAnd = true;

          this.requiredFeatures.push(f);
        }
        
        else this.features.push(f);
      });
    } 
    else {
      this.features.forEach((f) => {
        f.chosen = false;
        f.incompatible = false;
        f.required = false;

        this.chosenFeatures.forEach((cf) => {
          if (cf === f.system.uuid) {
            f.chosen = true;
          }

          if (f.system.incompatible.has(cf)) {
            f.incompatible = true;
          }

          if (f.system.requires.has(cf)) {
            f.required = true;
            this.requiredFeatures.push(f);
          }
        });
      });

      this.features = this.features.filter((f) => !f.required);

      this.requiredFeatures.forEach((f) => {
        f.chosen = false;
        f.incompatible = false;

        this.chosenFeatures.forEach((cf) => {
          if (cf === f.system.uuid) {
            f.chosen = true;
          }

          if (f.system.incompatible.has(cf)) {
            f.incompatible = true;
          }
        });
      });
    }

    console.log(this.chosenFeatures);

    const context = {
      features: this.features,
      requiredFeatures: this.requiredFeatures
    };  

    console.log(context);

    return context;
  }

  static async _dock() {
    console.log("Docking");
    this.isDocked = !this.isDocked;

    if (this.isDocked) {
      this.setPosition({
        left: this.dockedTo.position.left - this.position.width,
        top: this.dockedTo.position.top
      })
    }
  }

  async _onRender() {
    this.element.querySelectorAll('.feature').forEach((f) => {
      f.addEventListener('mouseover', async (event) => {
        let feature = this.features.find((feature) => feature.system.uuid === event.target.dataset.uuid);
        if (!feature)
          feature = this.requiredFeatures.find((feature) => feature.system.uuid === event.target.dataset.uuid);
        let content = await renderTemplate('systems/utopia/templates/other/crafting-features-tooltip.hbs', { 
          feature: feature
        });
        let element = document.createElement('div');
        element.innerHTML = content;
        game.tooltip.activate(event.target, { direction: 'DOWN', cssClass: "utopia crafting-features-sheet", content: element });
      });

      f.addEventListener('mouseout', (event) => {
        game.tooltip.deactivate();
      });

      f.draggable = true;
      
      f.addEventListener('dragstart', (event) => { 
        let feature = this.features.find((feature) => feature.system.uuid === event.target.dataset.uuid);
        if (!feature) 
          feature = this.requiredFeatures.find((feature) => feature.system.uuid === event.target.dataset.uuid);
        
        if (feature.incompatible || feature.chosen) return;

        const clone = feature.clone();
        const raw = clone.toObject();
        raw.ref = feature.system.uuid;

        const output = [];
        output.push(raw);
        
        if (feature.system.requires.size > 0) {
          for (let req of feature.system.requires) {
            let reqFeature = this.features.find((f) => f.system.uuid === req);
            if (!reqFeature) reqFeature = this.requiredFeatures.find((f) => f.system.uuid === req);
            const reqClone = reqFeature.clone();
            const reqRaw = reqClone.toObject();
            reqRaw.ref = reqFeature.system.uuid;
            output.push(reqRaw);
          }
        }

        console.log(output);

        event.dataTransfer.setData('text/plain', JSON.stringify(output));
      });
    });
  }

  static async _clear(event, target) {

  }

  static async _add(event, target) {

  }

  static async _remove(event, target) {

  }

  static async _target(event, target) {
    
  }

  static async _cancel(event, target) {
  
  }

  static async _submit(event, target) {
  
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
    console.log(event);

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