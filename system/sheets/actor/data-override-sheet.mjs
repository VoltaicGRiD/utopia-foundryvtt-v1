const { api, sheets } = foundry.applications;

export class UtopiaDataOverrideSheet extends api.HandlebarsApplicationMixin(api.DocumentSheetV2) {

  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.dockedTo = undefined;
    this.dockedSide = undefined;
    this.isDocked = true;

    this.fields = [];
    this.selectedField = undefined;
    this.selectedIndex = 0;
  }

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'data-override-sheet'],
    position: {
      width: 500,
      height: 'auto',
    },
    actions: {
      changeField: this._changeField,
      swapDock: this._swapDock,
      dock: this._dock,
    },
    form: {
      submitOnChange: false,
    },
    window: {
      title: 'UTOPIA.SheetLabels.dataOverride',
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  static PARTS = {
    content: {
      template: 'systems/utopia/templates/other/data-override.hbs',
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ['content'];
  }

  async _prepareContext(options) {
    const context = {
      canDock: game.settings.get('utopia', 'dockedWindowPosition') !== 2 && this.dockedTo,
      docked: this.isDocked,
    };

    const fields = [];

    const systemFields = this.document.system.schema.fields;
    for (const key of Object.keys(systemFields)) {
      const field = systemFields[key];

      const subFields = this.getSubFields(field);

      fields.push(...subFields);
    }

    this.fields = fields;
    this.selectedField = fields[this.selectedIndex];
    this.selectedField.value = foundry.utils.getProperty(this.document, this.selectedField.fieldPath);

    context.fields = this.fields;
    context.selectedField = this.selectedField ?? fields[0];
    context.selectedIndex = this.selectedIndex;

    // Group fields by parent path
    const fieldsByParent = this.fields.reduce((acc, field, index) => {
      const parent = field.fieldPath.split('.').slice(0, -1).join('.');
      acc[parent] = acc[parent] || [];
      acc[parent].push({ ...field, index });
      return acc;
    }, {});

    context.fieldsByParent = fields;

    console.log(context);

    return context;
  }

  async _onRender(context, options) {
    super._onRender(context, options);

    const selector = this.element.querySelector('.override-select');
    console.log(selector);
    selector.addEventListener('change', this.constructor._changeField.bind(this));
  }

  static async _changeField(event) {
    const fieldIndex = event.target.selectedIndex;
    this.selectedIndex = fieldIndex;

    this.render();
  }

  getSubFields(field) {
    const fields = [];

    var subfields = [];

    if (field.fields)
      subfields = Object.keys(field.fields);

    if (subfields.length > 0) {
      for (const subfield of subfields) {
        const subField = field.fields[subfield];
        const subFields = this.getSubFields(subField);
        fields.push(...subFields);
      }
    }
    else {
      fields.push(field);
    }

    return fields;
  }

  static async _dock() {
    this.isDocked = !this.isDocked;

    if (this.isDocked) {
      switch (this.dockedSide) {
        case 0: // left
          this.setPosition({
            left: this.dockedTo.position.left - this.position.width,
            top: this.dockedTo.position.top
          });
          break;
        case 1: // right
          this.setPosition({
            left: this.dockedTo.position.left + this.dockedTo.position.width,
            top: this.dockedTo.position.top
          });
          break;
        default: 
          break;
      }
    }

    this.render();
  }

  static async _swapDock() {
    if (this.dockedSide == 0) 
    {
      this.dockedTo.dockedLeft.pop(this);
      this.dockedTo.dockedRight.push(this);
      this.dockedSide = 1;
    }
    else 
    {
      this.dockedTo.dockedRight.pop(this);
      this.dockedTo.dockedLeft.push(this);
      this.dockedSide = 0;
    }
    
    if (this.isDocked) {
      switch (this.dockedSide) {
        case 0: // left
          this.setPosition({
            left: this.dockedTo.position.left - this.position.width,
            top: this.dockedTo.position.top
          });
          break;
        case 1: // right
          this.setPosition({
            left: this.dockedTo.position.left + this.dockedTo.position.width,
            top: this.dockedTo.position.top
          });
          break;
        default: 
          break;
      }
    }

    this.render();
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
    const flattenedData = foundry.utils.flattenObject(submitData);
    console.log(flattenedData);
    const path = Object.keys(flattenedData)[0];
    const documentOverrides = this.document.getFlag('utopia', 'overrides') || {};
    documentOverrides[path] = Object.values(flattenedData)[0];
    await this.document.setFlag('utopia', 'overrides', documentOverrides);
    console.log(this.document);
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
