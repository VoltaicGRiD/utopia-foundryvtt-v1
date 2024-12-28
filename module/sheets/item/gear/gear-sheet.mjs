const { api, sheets } = foundry.applications;
import { UtopiaCraftingFeaturesSheet } from "../../other/crafting-features.mjs";

export class UtopiaGearSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    UtopiaGearSheet.#descriptions = {};
    this.dockedLeft = [];
    this.dockedRight = [];
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "gear-sheet"],
    position: {
      width: 400,
      height: 500,
    },
    actions: {
      image: this._image,
      toggleCrafting: this._toggleCrafting,
      categoryDescription: this._categoryDescription,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.action",
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
  };

  static PARTS = {
    primary: {
      template: "systems/utopia/templates/item/gear/primary.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    
    options.parts = ["primary"];
  }

  async _prepareContext(options) {
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
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      // Add features to context
      features: this.item.features
    };

    console.log(context);

    return context;
  }

  async _addFeature(uuid) {
    const newFeatures = [...this.item.system.features, uuid];
    
    await this.item.update({
      ["system.features"]: newFeatures
    });
  }

  async _removeFeature(uuid) {
    const newFeatures = this.item.system.features.filter(f => f !== uuid);

    await this.item.update({
      ["system.features"]: newFeatures
    });
  }

  static #descriptions = {
    "fastWeapon": `
<p>Fast weapons are the least damaging weapon per attack, though attacks from these weapons can be made in quick succession. Unlike other weapons, over half of the attacks from these weapons are often unresponded due to the high rate at which they come.</p>
<p>Due to their shear size and weight limitations, it’s often more expensive to make these types of weapons include specialized features. Regardless, these remain as powerful sidearms, especially due to their ability to make the most use out of a single second of time.</p>
<ol class="category-stats">
	<li>Innately requires 1 turn action to attack with.</li>
	<li>Innately requires 1 hand to attack with.</li>
	<li>1 stack of Slam or at least 1 stack of Harsh is required.</li>	
	<li>Innately has 0 meters of close range and 0 meters of far range. It is considered melee.</li>
	<li>Innately does not use any modifiers when calculating damage.</li>
	<li>Innately takes up 3 slots.</li>
</ol>
<ol class="category-materials">
	<li>2 Refinement Components</li>
	<li>1 Material Component</li>
</ol>`,
    "moderateWeapon": `
<p>Moderate weapons are the most common form of weaponry, generally dealing a generic amount of damage and hitting fast enough to bring some unresponded attacks to the battlefield.</p>
<p> These types of weapons are the most congruent for basic infantry; the hypothetical perfect middle-ground between damage and speed. Tinkerers may use this weapon type as a basis to find out whether they want something faster or something heavier.</p>
<ol class="category-stats">
	<li>Innately requires 2 turn actions to attack with.</li>
	<li>Innately requires 1 hand to attack with.</li>
	<li>1 stack of Slam or at least 1 stack of Harsh is required.</li>	
	<li>Innately has 0 meters of close range and 0 meters of far range. It is considered melee.</li>
	<li>Innately does not use any modifiers when calculating damage.</li>
	<li>Innately takes up 3 slots.</li>
</ol>
<ol class="category-materials">
	<li>1 Refinement Components</li>
	<li>2 Material Component</li>
</ol>`,
  }

  static async _categoryDescription() {
    const category = this.item.system.category;
    const description = this.#descriptions[category];

    const descriptionSheet = new UtopiaCraftingFeaturesSheet();
    descriptionSheet.render(true, { 
      position: { 
        left: this.element.offsetLeft - 300, 
        top: this.element.offsetTop 
      },
      template: "systems/utopia/templates/item/gear/category-description.hbs",
      data: {
        description: description,
      }
    });
    this.dockedLeft.push(descriptionSheet);
    descriptionSheet.dockedTo = this;
  }

  static async _toggleCrafting(event, target) {
    const featureSheet = new UtopiaCraftingFeaturesSheet();
    featureSheet.category = this.item.system.category;
    featureSheet.render(true, { 
      position: { 
        left: this.element.offsetLeft - 300, 
        top: this.element.offsetTop 
      }
    });
    this.dockedLeft.push(featureSheet);
    featureSheet.dockedTo = this;
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

  _onRender(context, options) {
    super._onRender(context, options);

    const featuresList = this.element.querySelector('.features');
    featuresList.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._onDrop(event);
    });

    const features = this.element.querySelectorAll('.feature');
    features.forEach(f => {
      f.draggable = true;

      f.addEventListener("dragstart", (event) => {
        console.log(event);
        event.dataTransfer.setData('text/plain', JSON.stringify({ uuid: event.target.dataset.uuid }));
      });
  
      f.addEventListener("dragend", (event) => {
        if (!this.element.contains(event.relatedTarget)) {
          const uuid = event.target.dataset.uuid;
          
          this._removeFeature(uuid);
        }
      });
    });
  }

  async _image(event) {
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
    const uuid = data.uuid;
    
    this._addFeature(uuid);
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
}
