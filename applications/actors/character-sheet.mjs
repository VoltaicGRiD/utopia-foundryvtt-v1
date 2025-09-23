import { SplitText, gsap, MorphSVGPlugin, PixiPlugin } from "../../gsap/all.js";
import { gasCloudAnimation, starsAnimation } from "../../system/helpers/sheetAnimations.mjs";

const { api, sheets } = foundry.applications;

export class CharacterSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2
) {
  constructor(options = {}) {
    super(options);
  }

  static MODES = {
    PLAY: 0,
    EDIT: 1,
  };

  _mode = this.constructor.MODES.PLAY;

  static PARTS = {
    header: {
      template: "systems/utopia/templates/actor/header.hbs",
    },
    tabs: {
      // Foundry-provided generic template
      template: "templates/generic/tab-navigation.hbs",
    },
    characterDetails: {
      template: "systems/utopia/templates/actor/details-character.hbs",
    },
    npcDetails: {
      template: "systems/utopia/templates/actor/details-npc.hbs",
    },
    actions: {
      template: "systems/utopia/templates/actor/actions.hbs",
    },
    biography: {
      template: "systems/utopia/templates/actor/biography.hbs",
      scrollable: [".biography-data"],
    },
    gear: {
      template: "systems/utopia/templates/actor/gear.hbs",
    },
    spells: {
      template: "systems/utopia/templates/actor/spells.hbs",
    },
    effects: {
      template: "systems/utopia/templates/actor/effects.hbs",
    },
    talents: {
      template: "systems/utopia/templates/actor/talents.hbs",
    },
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [
      "header",
      "tabs",
      "characterDetails",
      "talents",
      "gear",
      "spells",
      "actions",
      "effects",
    ];
  }

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(
    sheets.ActorSheetV2.DEFAULT_OPTIONS,
    {
      classes: ["utopia", "character-sheet"],
      actions: {
        image: this._image,
        createDocument: this._createDocument,
        toggleMode: this._toggleMode,
        roll: this._roll
      },
      form: {
        submitOnChange: true,
        closeOnSubmit: false,
      },
      position: {
        width: 1050,
        height: 750,
      },
      window: {
        resizable: false,
      },
      tag: "form",
      dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
    }
  );

  async _prepareContext(contextOptions) {
    const context = await super._prepareContext(contextOptions);

    context.actor = this.actor;
    context.isEditable =
      this.isEditable && this._mode === this.constructor.MODES.EDIT;
    context.system = this.actor.system;
    context.systemSource = this.actor.system._source;
    context.systemFields = this.actor.system.schema.fields;
    context.tabs = this._getTabs(contextOptions.parts);
    context.fields = this.actor.system.fields;
    context.isPlay = this._mode === this.constructor.MODES.PLAY;
    context.traits = await this.buildTraits();
    const speciesDoc = await fromUuid(this.actor.system._species);
    context.species = speciesDoc ? speciesDoc.name : "";

    if (context.system._species === null) {
      context.noLevel = true;
    }

    console.log(context);

    return context;
  }

  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);

    switch (partId) {
      case "actions":
      case "characterDetails":
      case "npcDetails":
      case "talents":
      case "gear":
        context.tab = context.tabs[partId];
        break;
      case "spells":
        context.tab = context.tabs[partId];
        break;
      case "biography":
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
            relativeTo: this.actor,
          }
        );

        break;
      case "effects":
        context.tab = context.tabs[partId];
        // Prepare active effects
        // context.effects = prepareActiveEffectCategories(
        //   // A generator that returns all effects stored on the actor
        //   // as well as any items
        //   this.actor.allApplicableEffects(),
        //   {
        //     specialist: true,
        //     talent: true,
        //     gear: true,
        //   }
        // );
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
    if (!this.tabGroups["primary"]) this.tabGroups["primary"] = "details";

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: "primary",
        // Matches tab property to
        id: "",
        // FontAwesome Icon, if you so choose
        icon: "",
        // Run through localization
        label: "UTOPIA.Actors.Tabs.",
      };
      switch (partId) {
        case "header":
        case "tabs":
          return tabs;
        case "characterDetails":
        case "npcDetails":
          tab.id = "details";
          tab.label += "Details";
          if (this.actor.type == "character") {
            if (
              this.actor.system.points.subtrait > 0 ||
              this.actor.system.points.gifted > 0
            )
              tab.icon = "fas fa-bell";
          }

          break;
        case "actions":
          tab.id = "actions";
          tab.label += "Actions";
          break;
        case "biography":
          tab.id = "biography";
          tab.label += "Biography";
          break;
        case "talents":
          tab.id = "talents";
          tab.label += "Talents";
          if (this.actor.type == "character") {
            if (
              this.actor.system.points.talent > 0 ||
              this.actor.system.points.specialist > 0
            )
              tab.icon = "fas fa-bell";
          }

          break;
        case "gear":
          tab.id = "gear";
          tab.label += "Gear";
          break;
        case "spells":
          tab.id = "spells";
          tab.label += "Spells";
          break;
        case "effects":
          tab.id = "effects";
          tab.label += "Effects";
          break;
        default:
      }

      if (this.tabGroups["primary"] === tab.id) tab.cssClass = "active";

      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _onRender(context, options) {
    const sheet = this.element;

    if (context.noLevel) {
      const warning = document.createElement('div');
      warning.style.position = 'absolute';
      warning.style.left = 0;
      warning.style.right = 0;
      warning.style.top = 0;
      warning.style.bottom = 0;
      warning.style.backgroundColor = 'rgba(0, 0, 0, 0.)';
      warning.style.color = 'white';
      warning.style.display = 'flex';
      warning.style.justifyContent = 'center';
      warning.style.alignItems = 'center';
      warning.style.fontSize = '24px';
      warning.style.zIndex = 10000;
      warning.style.flexDirection = 'column';
      warning.style.backdropFilter = 'blur(5px)';
      warning.style.webkitBackdropFilter = 'blur(5px)';
      warning.innerHTML = `
        <h1>Welcome to Utopia!</h1>
        <p>Before you can play, you need to create your character.</p>
        <p>Click the button below to open the Character Builder.</p>
        <button class="builder-button" style="padding: 10px 20px; background-color: purple; color: white; border: none; border-radius: 5px; cursor: pointer;">Open Character Builder</button>
      `;
      warning.querySelector('.builder-button').addEventListener('click', async (event) => {
        // Open the character builder
        const characterBuilder = new globalThis.utopia.applications.characterBuilder({
          classes: ["utopia", "character-builder"],
          document: this.actor,
        });
        await characterBuilder.render({
          force: true,
          position: {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        });
        // Close the sheet
        setTimeout(() => {
          this.close();
        }, 1000);
      });
      
      setTimeout(() => {
        sheet.appendChild(warning);
      }, 1000);
    }

    if (
      game.settings.get("core", "performanceMode") <= 1 ||
      game.settings.get("core", "photosensitiveMode") === true ||
      game.settings.get("utopia", "disable3DBackground") === true
    )
    return;

    starsAnimation(options, sheet, this.element);
    gasCloudAnimation(options, sheet);

    // Handle data-block clicks
    this.element.querySelectorAll([".trait-container", ".subtrait-container-left", ".subtrait-container-right"]).forEach((block) => {
      // filepath: c:\Users\Dustin\AppData\Local\FoundryVTT\Data\systems\utopia\applications\actors\character.mjs
      block.addEventListener("click", (event) => {
        const dice = event.currentTarget.querySelector(".dice");
        if (!dice) return;

        // Get bounding rects
        const blockRect = event.currentTarget.getBoundingClientRect();

        // Cursor position relative to block
        const cursorX = event.clientX - blockRect.left - 7;
        const cursorY = event.clientY - blockRect.top - 7;

        // Block position (0,0), so above block is just negative y
        const blockLeft = -50;
        const blockTop = -50;

        // Set initial state: invisible, at cursor, small
        gsap.set(dice, {
          left: `${cursorX}px`,
          top: `${cursorY}px`,
          opacity: 0,
          scale: 0.7,
          zIndex: 10000,
          position: "absolute"
        });

        // Animate: fade in at cursor, move above block, pause, then zoom off right and fade out
        gsap.to(dice, {
          keyframes: [
            {
              opacity: 1,
              scale: 2,
              duration: 0.2,
              ease: "power1.out"
            },
            {
              left: `${cursorX}px`,
              top: `${blockTop}px`,
              duration: 0.4,
              ease: "power1.inOut"
            },
            {
              duration: 1 // pause
            },
            {
              left: `${blockLeft + 200}px`,
              top: `${blockTop - 60}px`,
              opacity: 0,
              scale: 1.3,
              duration: 0.7,
              ease: "power2.in"
            }
          ]
        });
      });
    });

  }

  
  static async _image(event, target) {
    event.preventDefault();
    const type = target.dataset.image;
    let file = await new FilePicker({
      type: "image",
      current:
        type === "icon" ? this.document.img : this.document.system.fullbody,
      callback: (path) => {
        type === "icon"
          ? this.document.update({ img: path })
          : this.document.update({ "system.fullbody": path });
      },
    }).browse();
  }

  async buildTraits() {
    const system = this.actor.system;
    const allTraits = {};
    const settingTraits = JSON.parse(game.settings.get("utopia", "advancedSettings.traits"));
    const traits = Object.entries(system.traits).map(([key, value]) => {
      foundry.utils.mergeObject(value, settingTraits[key])      
      allTraits[key] = value;
    });
    const settingSubtraits = JSON.parse(game.settings.get("utopia", "advancedSettings.subtraits"));
    const subtraits = Object.entries(system.subtraits).map(([key, value]) => {
      foundry.utils.mergeObject(value, settingSubtraits[key])      
      allTraits[key] = value;
    });
    return allTraits;
  }

  static async _roll(event, target) {
    const rollType = target.dataset.rollType;

    if (rollType === "trait") {
      const trait = target.dataset.trait;

      const roll = await this.actor.check(trait);

      var label = Object.keys(JSON.parse(game.settings.get("utopia", "advancedSettings.traits"))).includes(trait)
        ? game.i18n.localize(JSON.parse(game.settings.get("utopia", "advancedSettings.traits"))[trait].label)
        : game.i18n.localize(JSON.parse(game.settings.get("utopia", "advancedSettings.subtraits"))[trait].label);

      return await roll.toMessage({ flavor: `[${this.actor.name}] ${label}`, speaker: ChatMessage.getSpeaker({ actor: this }) });
    }
  }
}
