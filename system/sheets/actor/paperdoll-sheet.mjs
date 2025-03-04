const { api, sheets } = foundry.applications;

export class UtopiaPaperdollSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.dockedTo = undefined;
    this.dockedSide = undefined;
    this.isDocked = true;
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "actor-sheet"],
    position: {
      width: 550,
      height: "auto",
    },
    actions: {
      viewItem: this._viewItem,
      swapDock: this._swapDock,
      dock: this._dock,
    },
    form: {
      submitOnChange: true,
    },
    tag: "form",
    window: {
      title: "UTOPIA.SheetLabels.paperDoll",
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: ['.item-slot', '.augment-slot'] }],
  };

  static PARTS = {
    paperdoll: {
      template: "systems/utopia/templates/actor/paperdoll.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["paperdoll"];
  };

  async _prepareContext(options) {
    var context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      actor: this.actor,
      // Adding system and flags for easier access
      system: this.actor.system,
      flags: this.actor.flags,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      
      canDock: game.settings.get('utopia', 'dockedWindowPosition') !== 2 && this.dockedTo,
      docked: this.isDocked,
    };

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {      
      case 'paperdoll': 
        context.paperdoll = this.actor.system.getPaperDoll()
        break;
      default:
    }
    return context;
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

    this.element.querySelectorAll('.filled').forEach((item) => {
      item.addEventListener('contextmenu', async (event) => {
        const id = event.target.dataset.id;
        const slot = event.target.dataset.slot;
        const type = event.target.className.includes('item-slot') ? 'equipmentSlots' : 'augments';
        const equipment = foundry.utils.getProperty(this.actor, `system.${type}.${slot}`);
        const updated = equipment.filter(i => i !== id);

        await this.actor.update({
          [`system.${type}.${slot}`]: updated
        })
      });
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

  static async _viewItem(event, target) {
    const id = target.dataset.id;
    const item = this.actor.items.get(id);
    item.sheet.render(true);
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
      case "Item":
        return this._onDropItem(event, data);
    }
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    const dropClass = event.target.className;
    if (dropClass === "item-slot") {
      const dropTarget = event.target.dataset.slot;
      if (!item.system.equippable || item.system.slot !== dropTarget)
        return ui.notifications.error("This item can't be equipped in this slot");

      const equipment = [item.id];
      await this.actor.update({
        [`system.equipmentSlots.${dropTarget}`]: equipment
      })
    }
    else if (dropClass === "augment-slot") {
      const dropTarget = event.target.dataset.slot;
      if (!item.system.equippable || item.system.slot !== dropTarget)
        return ui.notifications.error("This slot cannot be augmented by this item");

      const equipment = [item.id];
      await this.actor.update({
        [`system.augments.${dropTarget}`]: equipment
      })
    }
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