const { api, sheets } = foundry.applications;
import { UtopiaCraftingFeaturesSheet } from "../other/crafting-features.mjs";

export class UtopiaGearSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.children = [];
    this.dockedLeft = [];
    this.dockedRight = [];
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "gear-sheet"],
    position: {
      width: 400,
      height: 700,
    },
    actions: {
      image: this._image,
      toggleCrafting: this._toggleCrafting,
      categoryDescription: this._categoryDescription,
      increaseStacks: this._increaseStacks,
      decreaseStacks: this._decreaseStacks,
      removeFeature: this._removeFeature,
      choosePrompt: this._choosePrompt,
      updateVariable: this._updateVariable,
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
    header: {
      template: "systems/utopia/templates/item/gear/header.hbs",
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    primary: {
      template: "systems/utopia/templates/item/gear/primary.hbs",
    },
    description: {
      template: "systems/utopia/templates/item/generic/description.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    
    options.parts = ["header", "tabs", "primary", "description"];
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
      hasFeatures: Object.keys(this.item.system.features).length > 0,
      terms: terms
    };

    console.log(context);

    console.log(this.item.getRollData());

    return context;
  }

/** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'primary':
        context.tab = context.tabs[partId];
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
    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'primary';

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: 'primary',
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'UTOPIA.Item.Artifice.Gear.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'primary':
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

  async _addFeature(feature) {    
    // We need to validate this is actually a feature, and not just some random data.
    if (!feature) return;
    if (Object.keys(feature).length === 0) return;
    if (!feature.name) return;
    if (!feature.system) return;
    if (!feature.system.category) return;
    if (feature.type !== "artificeFeature") return;
    
    if (this.item.system.features[feature.id]) {
      console.error("You already have that feature!");
      return;
    }

    console.log(feature);

    const features = this.item.system.features;
    const id = foundry.utils.randomID();
    feature.id = id;

    const effects = feature.effects || null;
    if (effects) {
      for (const effect of effects) {
        effect.flags = {
          utopia: {
            sourceId: id,
          }
        }
        const newEffect = await ActiveEffect.create(effect, { parent: this.item });
        this.item.createEmbeddedDocuments("ActiveEffect", [newEffect]);
      }
    }

    feature.effects = null;
    features[id] = feature;
    
    await this.item.update({
      ["system.features"]: features,
      ['system.resetFormula']: true
    });

    this.children.forEach(sheet => {
      if (sheet instanceof UtopiaCraftingFeaturesSheet) {
        sheet.addChosenFeature(feature.ref);
      }
    });
  }

  static async _choosePrompt(event, target) {
    console.log(event, target);

    const value = target.dataset.choice;
    const id = target.dataset.id;
    await this.item.update({
      [`system.features.${id}.system.choice`]: value,
    });
  }

  static async _removeFeature(event, target) {
    const id = target.dataset.id;

    const effects = this.item.getEmbeddedCollection("ActiveEffect");  
    effects.forEach(async (effect) => {
      const sourceId = await effect.getFlag("utopia", "sourceId");
      if (sourceId === id) {
        await effect.delete(); 
      }

      const origin = effect.system.origin;
      if (origin === id) {
        await effect.delete();
      }
    });

    const feature = this.item.system.features[id];
    console.log(feature);
    this.children.forEach(sheet => {
      if (sheet instanceof UtopiaCraftingFeaturesSheet) {
        sheet.removeChosenFeature(feature.ref);
        sheet.render();
      }
    });
    
    await this.item.update({
      [`system.features.-=${id}`]: null,
      ['system.resetFormula']: true
    });
  }

  static async _toggleCrafting(event, target) {
    const featureSheet = new UtopiaCraftingFeaturesSheet();
    featureSheet.category = this.item.system.category;
    featureSheet.requirements = this.item.system.craftRequirements;
    featureSheet.chosenFeatures = Object.values(this.item.system.features).map(f => f.ref);
    featureSheet.render(true, { 
      position: { 
        left: this.element.offsetLeft - featureSheet.position.width, 
        top: this.element.offsetTop 
      }
    });
    this.dockedLeft.push(featureSheet);
    this.children.push(featureSheet);
    featureSheet.dockedTo = this;
  }

  _preClose(options) {
    super._preClose(options);

    this.dockedLeft.forEach(sheet => {
      sheet.close();
    });
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
    
    this.element.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._onDrop(event);
    });

    const features = this.element.querySelectorAll('.feature');
    features.forEach(f => {
      f.addEventListener('mouseover', async (event) => {
        let feature = this.item.system.features[f.dataset.id];
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
    });
  }

  static async _increaseStacks(event, target) {
    console.log(event, target);
    const id = target.dataset.id;
    const features = this.item.system.features;
    const feature = features[id];

    if (!feature.system.stacks) feature.system.stacks = 1;
    if (!feature.system.maxStacks || feature.system.stacks < feature.system.maxStacks) {
      feature.system.stacks += 1;
    }

    await this.item.update({
      [`system.features.${id}`]: feature,
    });
  }

  static async _decreaseStacks(event, target) {
    console.log(event, target);
    const id = target.dataset.id;
    const features = this.item.system.features;
    const feature = features[id];

    if (!feature.system.stacks) return;
    if (feature.system.stacks > 1) {
      feature.system.stacks -= 1;
    }

    await this.item.update({
      [`system.features.${id}`]: feature,
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
    console.log(data);

    if (!Array.isArray(data)) return;
    data.forEach((d) => {
      console.log(d);
      const keys = Object.keys(this.item.system.features);
      if (keys.includes(d.id)) return;

      this._addFeature(d);
    })
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
