const { api, sheets } = foundry.applications;

export class UtopiaGearFeatureSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.attributesEditor = [];
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "gear-feature-sheet"],
    position: {
      width: 900,
      height: 'auto',
    },
    actions: {
      image: this._image,
      addAttribute: this._addAttribute,
      reset: this._reset,
      save: this._save,
      edit: this._edit,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.action",
      resizeable: true,
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
      template: "systems/utopia/templates/item/gear/feature.hbs",
      scrollable: [""]
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes"];
  }

  // _prepareSubmitData(event, form, formData) {
  //   const submitData = super._prepareSubmitData(event, form, formData);
  //   const editor = this.attributesEditor[0];
  //   if (submitData.system) {
  //     submitData.system.attributes = editor.getValue();
  //   }
  //   return submitData;
  // }

  async _prepareContext(options) {
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
    };

    console.log(context);

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item.actor ?? this.item,
          }
        );
        break;
      default:
        break;
    }

    return context;
  }

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

  async _onRender(options, context) {
    this.attributesEditor = [];

    this.element.querySelectorAll('#editor').forEach((editor) => {
      const aceEditor = ace.edit(editor, {
        theme: "ace/theme/dracula",
        mode: "ace/mode/json",
        maxLines: 30,
        minLines: 30,
        wrap: true,
        tabSize: 2,
      });
      aceEditor.renderer.setScrollMargin(10, 10, 10, 10);

      // TODO: Add _onPosition(position) update to size of editor
      //aceEditor.resize();

      this.attributesEditor.push(aceEditor);
    });
  }

  static async _reset(event, target) {
    const availability = Array.from(this.document.system.availability);
    const keys = Array.from(this.document.system.keys);
    const attributes = {};

    for (const a of availability) {
      attributes[a] = {
        modifications: {
          ...keys.reduce((acc, k) => {
            acc[k] = "";
            return acc;
          }, {}),
        },
        cost: 0,
        stackable: false,
        material: 0,
        refinement: 0,
        power: 0
      }
    }

    await this.document.update({
      "system.attributes": JSON.stringify(attributes, null, 2),
    });
  }

  static async _save (event, target) {
    event.preventDefault();
    const editor = this.attributesEditor[0];
    const attributes = JSON.parse(editor.getValue());

    await this.document.update({
      "system.attributes": JSON.stringify(attributes, null, 2),
    });
  }

  static async _edit(event, target) {
    const sheet = new game.utopia.UtopiaFeatureBuilder();
    const shared = this.document.system.shared || {};
    const attributes = this.document.system.classifications || {};

    sheet.attributes = attributes;
    sheet.shared = shared;
    sheet.document = this.document;
    sheet.render(true);
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
    const data = TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call("dropItemSheetData", item, this, data);
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
