const { api, sheets } = foundry.applications;

export class UtopiaSpellFeatureSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spell-feature-sheet"],
    position: {
      width: 500,
      height: "auto",
    },
    actions: {
      image: this._image,
      newVariable: this._newVariable,
      createDoc: this._createDoc,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: "UTOPIA.SheetLabels.spellFeature",
    },
  };

  static PARTS = {
    header: {
      template: "systems/utopia/templates/spells/spell-feature/header.hbs",
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs",
    },
    attributes: {
      template: "systems/utopia/templates/spells/spell-feature/attributes.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["header", "tabs", "attributes"];
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
      variables: this.item.system.variables,
      // Adding a pointer to CONFIG.UTOPIA
      config: CONFIG.UTOPIA,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields,
      // Add the system variables
    };

    context = foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
    });

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributes':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.item.getRollData(),
            relativeTo: this.item
          }
        );
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
        label: 'UTOPIA.Actions.Tabs.',
      };
  
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'attributes':
          tab.id = 'attributes';
          tab.label += 'attributes';
          break;
        default:
      }
  
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
  
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _onRender(context, options) {
    const art = this.element.querySelector("select[name='system.art']");
    art.addEventListener("change", (event) => {
      // Update 'system.img' based on the selected art
      let img = event.target.value;
      let prefix = "systems/utopia/assets/icons/artistries/";
      let suffix = ".svg";
      let newImg = prefix + img + suffix;
      this.document.update({
        img: newImg,
        ['system.art']: img,
      });
      this.render();
    });

    const doesTarget = this.element.querySelector("select[name='system.doesTarget']");
    doesTarget.addEventListener("change", (event) => {
      console.log(event);
      let doesTarget = event.target.value;
      this.document.update({
        ['system.doesTarget']: doesTarget,
      });
      this.render();
    });

    const newVariable = this.element.querySelector("button[data-action='newVariable']");
    newVariable.addEventListener("click", (event) => {
      this._createDoc(event, event.target);
    });

    //const deleteVariable = this.element.querySelector("button[data-action='deleteVariable']");
    //deleteVariable.addEventListener("click", this._deleteVariable.bind(this));
  }

  async _createDoc(event, target) {
    this.document.createEmbeddedDocuments("UtopiaSpellVariable", [{
      character: "x",
      type: "number",
    }]);

    // // Retrieve the configured document class for Item or ActiveEffect
    // const docCls = utopia.documents.UtopiaSpellVariable;
    // // Prepare the document creation data by initializing it a default name.
    // const docData = {
    //   name: docCls.defaultName(),
    //   parent: this.document,
    //   type: "number",
    //   character: "x",
    // };

    // // Finally, create the embedded document!
    // console.log(docCls);
    // console.log(docData);

    // const result = await docCls.create(docData, { parent: this.document });

    // console.log(this, result);
  }

  async _newVariable() {
    const data = {
      character: "x",
      type: "number",
    }
    const existing = Array.from([...this.document.system.variables]);
    console.log(existing);
    existing.push(data);
    console.log(existing);

    this.render();
  }

  async _deleteVariable(event) {
    let index = event.target.dataset.index;
    let variables = this.document.system.variables;
    variables.splice(index, 1);
    this.document.update({
      ['system.variables']: variables,
    });
  }

  async _update(event) {
    event.preventDefault();
    let value = event.target.value;
    let target = event.target.name;
    
    console.log(target, value);

    this.document.update({
      [target]: event.target.value,
    })
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
}