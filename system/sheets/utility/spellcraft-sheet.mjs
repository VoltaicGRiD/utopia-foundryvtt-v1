
const { api, sheets } = foundry.applications;

import { gatherSpellFeatures, gatherSpells } from '../../helpers/gatherSpells.mjs';
import { getTextContrast } from '../../helpers/textContrast.mjs';

export class UtopiaSpellcraftSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  selected = {};
  allFeatures = {};
  features = {};
  secretFeatures = {};
  filter = "";
  actor = {};
  spells = [];

  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ["utopia", "spellcraft-sheet"],
    position: {
      width: 1300,
      height: 800,
    },
    actions: {
      image: this._image,
      saveAndCast: this._saveAndCast,
      save: this._save,
      cast: this._cast,
    },
    window: {
      title: "UTOPIA.SheetLabels.spellcraft",
    },
  };

  static PARTS = {
    content: {
      template: "systems/utopia/templates/other/spellcraft/spellcraft.hbs",
      scrollable: [".feature-list"],
    },
    column: {
      template: "systems/utopia/templates/other/spellcraft/features.hbs",
      scrollable: [''],
    },
    spell: {
      template: "systems/utopia/templates/other/spellcraft/spell.hbs",
      scrollable: [''],
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["content"];
  }

  async _prepareContext(options) {
    if (options.isFirstRender) {
      const features = {};

      const retreivedFeatures = await gatherSpellFeatures();
      retreivedFeatures.sort((a, b) => {
        a.folder = a.folder || {name: "Uncategorized", color: {rgb: "#000000", css: "#000000"}};
        b.folder = b.folder || {name: "Uncategorized", color: {rgb: "#000000", css: "#000000"}};
        return a.folder.name.localeCompare(b.folder.name) || a.name.localeCompare(b.name) || b.cost - a.cost
      }); 
      
      const artistries = {};

      let index = 0;
      retreivedFeatures.forEach(async f => {
        const background = f.folder.color.rgb;
        const cssBackground = f.folder.color.css;
        const color = getTextContrast(background);
        f.background = cssBackground;
        f.color = color;
        f.value = "";
        f.stacks = 1;

        const userFavorites = game.user.getFlag('utopia', 'favorites');

        if (userFavorites && userFavorites["spellFeature"] && userFavorites["spellFeature"].includes(f._id)) {
          f.favorite = true;
        } else {
          f.favorite = false;
        }
        
        if (f.system.costMultiplier === "multiply") {
          f.cost = `${f.system.cost}X PP`;
          // if any variables character is 'X' set it to 1, otherwise, create a new variable
          f.system.variables["cost"] = { name: "cost", character: "X", kind: "number", minimum: 1, value: 1};
        } else {
          f.cost = `${f.system.cost} PP`;
        }
        
        f.system.variables["stacks"] = { name: "stacks", character: "@", kind: "number", minimum: 1, value: 1};

        for (let variable of Object.values(f.system.variables)) {
          if (variable.name != "cost" && variable.name != "stacks" && variable.name && variable.name.length > 0) {
            variable.character = variable.name[0].toUpperCase();
          }
        }

        if (f.system.formula && f.system.formula.length > 0) {
          f.hasFormula = true;
          f.customFormula = false;
        } else {
          f.hasFormula = false;
          f.customFormula = false;
        }

        let artistryKeys = Object.keys(artistries);
        if (!artistryKeys.includes(f.folder.name)) {
          let artistryData = {
            name: f.folder.name,
            color: f.folder.color.css,
            img: f.img,
            show: true,
            features: {},
          };

          artistries[f.folder.name] = artistryData;
        }

        artistries[f.folder.name].features[`feature-${index}`] = f;

        features[`feature-${index}`] = f;
        index++;
      });

      this.worldSpells = {};

      if (Object.keys(this.actor).length > 0) {
        if (this.actor.items) {
          this.actor.items.forEach(i => {
            if (i.type === "spell") {
              this.worldSpells[i.uuid] = i;
            }
          });
        }
      } 
      else if (game.user.character !== null) {
        if (game.user.character.items && game.user.character.items.length > 0) {
          game.user.character.items.forEach(i => {
            if (i.type === "spell") {
              this.worldSpells[i.uuid] = i;
            }
          });
        }
      }
      else if (game.canvas.tokens.controlled.length > 0) {
        const actor = game.canvas.tokens.controlled[0].actor;
        if (actor.system.items && actor.system.items.length > 0) {
          actor.system.items.forEach(i => {
            if (i.type === "spell") {
              this.worldSpells[i.uuid] = i;
            }
          });
        }
      } 
      else if (game.user.isGM) {
        game.actors.forEach(a => {
          if (a.system.items && a.system.items.length > 0) {
            a.system.items.forEach(i => {
              if (i.type === "spell") {
                this.worldSpells[i.uuid] = i;
              }
            });
          }
        });
      }

      const existingSpells = await gatherSpells();
      existingSpells.forEach(s => {
        if (s.uuid !== undefined) this.worldSpells[s.uuid] = s;
      });

      this.artistries = artistries;      
      this.features = features;
      this.selected = {};
      this.cost = 0;
      this.duration = 0;
      this.durationOut = "";
      this.range = 0;
      this.rangeOut = "";
      this.aoe = "None";
      this.name = "Unnamed Spell";
      this.flavor = "";
      this.worldSpells = {};
      this.allowRedistribution = game.settings.get("utopia", "diceRedistribution");
    } else {
      if (options["item"]) {
        this.selected = options["item"].system.features;
      }

      await this.updateSpell();
    }

    const existingSpells = await gatherSpells();
    existingSpells.sort((a, b) => {
      let features = Object.keys(a.system.features).length - Object.keys(b.system.features).length;
      let name = a.name.localeCompare(b.name);
      let cost = a.system.cost - b.system.cost;
      return features || name || cost;
    })
    existingSpells.forEach(s => {
      if (s.uuid !== undefined)
        this.worldSpells[s.uuid] = s;
      else
        this.worldSpells[s.id] = s;
    });

    await this.getFavorites();
    await this.applyFilter();
    await this.parseSpell();
    
    const entries = Object.entries(this.remainingFeatures);
    entries.sort((a, b) => b[1].favorite - a[1].favorite);  
    this.remainingFeatures = Object.fromEntries(entries);

    const context = {
      filter: this.filter,
      artistries: this.artistries,
      features: this.remainingFeatures,
      selected: this.selected,
      duration: this.durationOut,
      range: this.rangeOut,
      aoe: this.aoe,
      name: this.name,
      cost: this.cost,
      flavor: this.flavor,
      worldSpells: this.worldSpells,
      allowRedistribution: this.allowRedistribution,
    }

    console.log(context);
    console.log(this);

    return context;
  }

  async _preparePartContext(partId, context) {
    if (partId === "column") {
    }

    return context;
  }

  async _onRender(context, options) {
    const available = this.element.querySelectorAll(".available-feature");
    available.forEach(f => {
      f.draggable = true;
      f.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text", JSON.stringify({id: f.dataset.id, type: "feature"}));
      });
    });

    const spells = this.element.querySelectorAll(".spell");
    spells.forEach(s => {
      s.draggable = true;
      s.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text", JSON.stringify({id: s.dataset.id, type: "spell"}));
      });
    });

    const features = this.element.querySelectorAll(".feature");    
    features.forEach(f => {
      f.addEventListener("mouseover", (event) => {
        const list = f.closest("ol");
        if (list.classList.contains("selected-feature-list")) {
          f.querySelector(".remove-feature").classList.remove("hidden");
        }
        if (list.classList.contains("feature-list")) {
          f.querySelector(".favorite-feature").classList.remove("hidden");
        }
      });
      f.addEventListener("mouseout", (event) => {
        const list = f.closest("ol");
        if (list.classList.contains("selected-feature-list")) {
          f.querySelector(".remove-feature").classList.add("hidden");
        }
        if (list.classList.contains("feature-list")) {
          f.querySelector(".favorite-feature").classList.add("hidden");
        }
      });
    });

    const removeButtons = this.element.querySelectorAll(".remove-feature");
    removeButtons.forEach(b => {
      b.addEventListener("click", (event) => {
        const id = event.target.closest("li").dataset.id;
        delete this.selected[id];
        this.render();
      });
    });

    const favoriteButtons = this.element.querySelectorAll(".favorite-feature");
    favoriteButtons.forEach(b => {
      b.addEventListener("click", async (event) => {
        const name = event.target.closest("li").dataset.name;
        const id = event.target.closest("li").dataset.id;
        const feature = this.features[id];
        if (feature.favorite === true) {
          await this.removeFavorite(feature);
          this.render();
        } else {
          await this.addFavorite(feature);
          this.render();
        }
      });
    });

    this.element.addEventListener("dragover", (event) => {
      this.element.querySelector('.spell-panel').classList.add("dragging");
    });
    this.element.addEventListener("dragleave", (event) => {
      this.element.querySelector('.spell-panel').classList.remove("dragging");
    });
    this.element.addEventListener("drop", (event) => {
      this.element.querySelector('.spell-panel').classList.remove("dragging");
    });

    const spellFeaturesList = document.querySelector('.feature-list');
    const itemHeight = 25; // Height of each item
    const itemGap = 5; // Gap between items
    const scrollAmount = itemHeight + itemGap; // Total scroll amount per item

    spellFeaturesList.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = Math.sign(event.deltaY);
      spellFeaturesList.scrollBy({
        top: delta * scrollAmount,
        behavior: 'auto'
      });
    });

    const spell = this.element.querySelector(".spell-panel");
    spell.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    spell.addEventListener("drop", async (event) => {
      event.preventDefault();
      const data = JSON.parse(event.dataTransfer.getData("text"));
      if (data.type === "feature") {
        const id = data.id;
        const feature = this.features[id];
        if (!feature) return;
        const length = Object.keys(this.selected).length;
        const newId = `selected-${length}`;
        
        this.selected[newId] = JSON.parse(JSON.stringify(feature));

        this.render();
      }
      else if (data.type === "spell") {
        const id = data.id;
        const spell = this.worldSpells[id];
        if (!spell) return;
        await this.addSpell(spell);
        this.render();
      }
    });

    const name = this.element.querySelector("input[name='name']");
    name.addEventListener("change", (event) => {
      this.name = event.target.value;
    });

    const textVariables = this.element.querySelectorAll("input[class='feature-variable-text']");
    textVariables.forEach(v => {
      v.addEventListener("change", (event) => {
        const featureId = event.target.dataset.feature;
        const variableId = event.target.dataset.variable;
        const value = event.target.value;

        const parentList = event.target.closest("ol");
        const selected = parentList.classList.contains("selected-feature-list") ? this.selected : this.features;
        const feature = selected[featureId];

        const variable = feature.system.variables[variableId];
        variable.value = value;
        selected[featureId].system.variables[variableId] = variable;
        
        this.render();
      });
    });

    const numVariables = this.element.querySelectorAll("input[type='number']");
    numVariables.forEach(v => {
      v.addEventListener("change", async (event) => {
        const featureId = event.target.dataset.feature;
        const variableId = event.target.dataset.variable;
        const value = event.target.value;

        const parentList = event.target.closest("ol");
        const selected = parentList.classList.contains("selected-feature-list") ? this.selected : this.features;
        const feature = selected[featureId];

        const variable = feature.system.variables[variableId];        
        variable.value = parseInt(value);
        selected[featureId].system.variables[variableId] = variable;

        if (variable.name === "cost") {
          const cost = feature.system.cost * value;
          selected[featureId].cost = `${cost} PP`;
          let parent = event.target.closest('li');
          parent.querySelector("span[class='cost']").innerHTML = `${cost} PP`;
        }
        
        if (variable.name === "stacks") {
          selected[featureId].stacks = parseInt(value);
        }

        this.render();
      });
    });

    const optVariables = this.element.querySelectorAll(".feature-variable-options");
    optVariables.forEach(v => {
      v.addEventListener("click", async (event) => {
        const featureId = event.target.dataset.feature;
        const variableId = event.target.dataset.variable;
        const parentList = event.target.closest("ol");
        const selected = parentList.classList.contains("selected-feature-list") ? this.selected : this.features;
        const name = selected[featureId].system.variables[variableId].name;
        const options = selected[featureId].system.variables[variableId].options.split(',');   
        const value = selected[featureId].system.variables[variableId].value || options[0];
        const description = selected[featureId].system.variables[variableId].description || "No description provided.";
        const template = await renderTemplate(
          'systems/utopia/templates/dialogs/variable-options.hbs', 
          {name: name, description: description, options: options, selected: value}
        );

        new api.DialogV2({
          window: {title: `Options for ${name}`},
          content: template,
          buttons: [{
            action: "save",
            label: "Save",
            default: true,
            callback: (event, button, dialog) => button.form.elements["variable-option"].value
          }],
          submit: result => {
            const feature = selected[featureId];
            const variable = feature.system.variables[variableId];
            event.target.style.backgroundColor = "#90c96b";
            event.target.style.color = "#000";
            event.target.innerHTML = `&#x2713`;
            variable.value = result;
          }
        }).render(true);
      });
    });

    const formulaDown = this.element.querySelectorAll(".formula-down");
    formulaDown.forEach(f => {
      f.addEventListener("click", async (event) => {
        const featureId = event.target.dataset.feature;
        const feature = this.selected[featureId];
        let currentFormula = feature.currentFormula;
        const options = Object.values(feature.formulaOptions)[0];

        if (currentFormula === 0) return;
        else currentFormula--;

        this.selected[featureId].currentFormula = currentFormula;
        this.selected[featureId].customFormula = true;
        
        this.render();
      });
    });

    const formulaUp = this.element.querySelectorAll(".formula-up");
    formulaUp.forEach(f => {
      f.addEventListener("click", async (event) => {
        const featureId = event.target.dataset.feature;
        const feature = this.selected[featureId];
        let currentFormula = feature.currentFormula;
        const options = Object.values(feature.formulaOptions)[0];

        if (currentFormula === options.length - 1) return;
        else currentFormula++;

        this.selected[featureId].currentFormula = currentFormula;
        this.selected[featureId].customFormula = true;

        this.render();
      });
    });

    const artistries = this.element.querySelectorAll(".artistry");
    artistries.forEach(a => {
      a.addEventListener("click", (event) => {
        const artistry = event.target.dataset.name;
        const features = this.artistries[artistry].features;
        const active = event.target.classList.contains("active");
        if (active) {
          event.target.classList.remove("active");
          if (!this.filter.includes("!"+artistry))
            this.filter += "!"+artistry;
          Object.keys(features).forEach(f => {
            });
        } else {
          event.target.classList.add("active");
          if (this.filter.includes("!"+artistry))
            this.filter = this.filter.replace("!"+artistry, "");
          Object.keys(features).forEach(f => {
            
          });
        }

        this.render();
      });
    });

    const filter = this.element.querySelector("input[name='filter']");
    filter.addEventListener("change", (event) => {
      this.filter = event.target.value;
      this.render();
    });

    const flavor = this.element.querySelector("textarea[name='flavor']");
    flavor.addEventListener("change", (event) => {
      this.flavor = event.target.value;
      this.render();
    });
  };

  async updateSpell() {
    this.duration = 0;
    this.range = 0;
    this.aoe = "None";
    this.cost = 0;

    if (Object.keys(this.selected).length === 0) return;
    const features = Object.entries(this.selected);
    let ppCost = 0;
    let staminaCost = 0;
    for (let feature of features) {
      feature = feature[1];

      // Manage spell costs
      if (feature.system.variables["cost"]) {
        ppCost += (feature.system.cost * feature.system.variables["cost"].value) * feature.stacks;
      } else {
        ppCost += feature.system.cost * feature.stacks;
      }
      
      // Manage spell range 
      if (feature.system.modifies === "range") {
        let range = feature.system.modifiedRange.value;

        // If range is 0, we assume the feature is indicating that the variable is the parsing data
        if (range === 0) {
          range = 1;
        }

        // If the range is variable, multiply it by the variable value
        if (
          feature.system.modifiedRange.variable && 
          feature.system.modifiedRange.variable !== "X" &&
          feature.system.variables[feature.system.modifiedRange.variable]
        ) {
          range *= feature.system.variables[feature.system.modifiedRange.variable].value;
        } 

        // If the range is variable and the variable is "X", multiply it by the cost variable
        else if (
          feature.system.modifiedRange.variable && 
          feature.system.modifiedRange.variable === "X"
        ) {
          range *= feature.system.variables["cost"].value;
        }

        // If the range is in kilometers, convert it to meters
        if (feature.system.modifiedRange.unit === "kilometers") {
          range *= 1000;
        }

        range = range * feature.stacks;

        this.range += range;
      }

      // Manage spell duration
      if (feature.system.modifies === "duration") {
        let duration = feature.system.modifiedDuration.value;

        // If duration is 0, we assume the feature is indicating that the variable is the parsing data
        if (duration === 0) {
          duration = 1;
        }

        // If the duration is variable, multiply it by the variable value
        if (
          feature.system.modifiedDuration.variable && 
          feature.system.modifiedDuration.variable !== "X" &&
          feature.system.variables[feature.system.modifiedDuration.variable]
        ) {
          duration *= feature.system.variables[feature.system.modifiedDuration.variable].value;
        } 
        
        // If the duration is variable and the variable is "X", multiply it by the cost variable
        else if (
          feature.system.modifiedDuration.variable && 
          feature.system.modifiedDuration.variable === "X"
        ) {
          duration *= feature.system.variables["cost"].value;
        }

        let unit = feature.system.modifiedDuration.unit;
        switch (unit) {
          case "turns": duration *= 6; break;
          case "minutes": duration *= 60; break;
          case "hours": duration *= 3600; break;
          case "days": duration *= 86400; break;
          case "months": duration *= 2592000; break;
          case "years": duration *= 31536000; break;
        }

        duration = duration * feature.stacks;

        this.duration += duration;
      }

      // Manage spell area of effect
      if (feature.system.modifies === "aoe") {
        let aoe = feature.system.modifiedAoE.value;

        // If aoe is 0, we assume the feature is indicating that the variable is the parsing data
        if (aoe === 0) {
          aoe = 1;
        }

        // If the aoe is variable, multiply it by the variable value
        if (
          feature.system.modifiedAoE.variable && 
          feature.system.modifiedAoE.variable !== "X" &&
          feature.system.variables[feature.system.modifiedAoE.variable]
        ) {
          aoe *= feature.system.variables[feature.system.modifiedAoE.variable].value;
        } 
        
        // If the aoe is variable and the variable is "X", multiply it by the cost variable
        else if (
          feature.system.modifiedAoE.variable && 
          feature.system.modifiedAoE.variable === "X"
        ) {
          aoe *= feature.system.variables["cost"].value;
        }

        let type = feature.system.modifiedAoE.type;
        let output = "";
        if (type === "template") {
          let shape = feature.system.modifiedAoE.shape;

          switch (shape) {
            case "circle": output = "radius"; break;
            case "cone": output = "angle"; break;
            case "rectangle": output = "width x height"; break;
            case "ray": output = "length"; break;
          }  
        }
        else if (type === "point") {
          output = "Target Point";
        }
        else if (type === "attach") {
          output = "Attached";
        }

        this.aoe += `${aoe}m ${output}`;
      }
    }

    staminaCost = Math.ceil(ppCost / 10);
    this.cost = staminaCost;

    this.prepareFormulaOptions();
  }

  static async _save() {
    if (Object.keys(this.selected).length === 0) return;

    let selected = this.selected;
    let name = this.name;
    let duration = this.duration;
    let range = this.range;
    let aoe = this.aoe;
    let flavor = this.flavor;
    let cost = this.cost;

    let spell = {
      name: name,
      type: "spell",
      system: {
        features: selected,
        duration: duration,
        range: range,
        aoe: aoe,
        flavor: flavor,
        cost: cost,
      }
    }

    console.log(this);

    if (this.actor && Object.keys(this.actor).length > 0) {
      await this.actor.createEmbeddedDocuments("Item", [spell]);
    }
    else if (this.spells.length === 1) { // We need to update the current spell instead
      await this.spells[0].update({
        name: name,
        system: {
          features: selected,
          duration: duration,
          range: range,
          aoe: aoe,
          flavor: flavor,
          cost: cost,
        }
      });
    }
    else {
      const doc = await game.utopia.UtopiaItem.create(spell);
      await game.packs.get('utopia.spells').importDocument(doc);
      await doc.delete();
    }

    this.render();
  }

  async applyFilter() {
    let terms = [];
    if (this.filter.includes(" ")) 
      terms = this.filter.split(" ");
    else 
      terms.push(this.filter);

    const availableFeatures = this.features;
    const remainingFeatures = {};
    let index = 0;
    const keys = Object.keys(availableFeatures);
    keys.forEach(k => {
      const feature = availableFeatures[k];
    
      if (terms.length === 0 || terms[0] === "") {
        remainingFeatures[`feature-${index}`] = feature;
        index++;
      } else {
        // const artistryMatches = terms.map(t => {
        //   const artistries = Object.keys(this.artistries);
        //   // Check to see if the terms include ANY references to an artistry by name
        //   if (artistries.some(a => a.toLowerCase().includes(t.toLowerCase()))) {
        //     // Then, we check to see if the term is inverted
        //     let isInverse = false;
        //     if (t.startsWith("!")) {
        //       isInverse = true;
        //       t = t.substring(1);
        //     }

        //     // Then, we need to set the artistries 'show' property to the inverse of the term
        //     this.artistries[t].show = !isInverse;
        //   }
        // });

        // for (let artistry of Object.values(this.artistries)) {
        //   if (!artistry.show) {
        //     continue;
        //   }
        // }

        // Now we need to check to see if the feature matches the terms
        const matches = terms.map(t => {
          let isInverse = false;
          if (t.startsWith("!")) {
            isInverse = true;
            t = t.substring(1);
          }
      
          const name = feature.name.toLowerCase().includes(t.toLowerCase());
          const description = feature.system.description.toLowerCase().includes(t.toLowerCase());
          const variables = feature.system.variables.length > 0 ? Object.values(feature.system.variables).some(v => v.name.toLowerCase().includes(t.toLowerCase())) : false;
          const variableOptions = Object.values(feature.system.variables).some(v => {
            if (!v.options) return false;
            let options = v.options;
            if (typeof v.options === "string") {
              options = v.options.split(',');
            }
            return options.some(o => o.toLowerCase().includes(t.toLowerCase()));
          });
          const cost = feature.cost.toString().toLowerCase().includes(t.toLowerCase());
          const duration = feature.system.modifies == "duration" ? feature.system.modifiedDuration.value.toString().toLowerCase().includes(t.toLowerCase()) : false;
          const range = feature.system.modifies == "range" ? feature.system.modifiedRange.value.toString().toLowerCase().includes(t.toLowerCase()) : false;
          const aoe = feature.system.modifies == "aoe" ? feature.system.modifiedAoE.value.toString().toLowerCase().includes(t.toLowerCase()) : false;
      
          const criteria = [name, description, variables, variableOptions, cost, duration, range, aoe];
      
          if (isInverse) {
            return !criteria.some(Boolean);
          } else {
            return criteria.includes(true);
          }
        });
      
        if (matches.some(Boolean)) {
          remainingFeatures[`feature-${index}`] = feature;
          index++;
        }
      }
    });

    this.remainingFeatures = remainingFeatures;
  }

  async parseSpell() {
    if (this.duration === 0) {
      this.durationOut = "Instant";
    } else {
      let unit = "seconds";
      if (this.duration >= 6 && this.duration % 6 === 0 && this.duration < 60) {
        this.duration /= 6;
        unit = "turns";
      }
      else if (this.duration >= 60 && this.duration < 3600) {
        this.duration /= 60;
        unit = "minutes";
      }
      else if (this.duration >= 3600 && this.duration < 86400) {
        this.duration /= 3600;
        unit = "hours";
      }
      else if (this.duration >= 86400 && this.duration < 2592000) {
        this.duration /= 86400;
        unit = "days";
      }
      else if (this.duration >= 2592000 && this.duration < 31536000) {
        this.duration /= 2592000;
        unit = "months";
      }
      else if (this.duration >= 31536000) {
        this.duration /= 31536000;
        unit = "years";
      }
     
      this.durationOut = `${this.duration} ${unit}`;
    }
    if (this.range === 0) {
      this.rangeOut = "Touch";
    } else {
      this.rangeOut = `${this.range}m`;
    }
  }

  async addSpell(spell) {
    this.spells.push(spell);
    if (this.spells.length === 1) {
      this.selected = spell.system.features;
      this.name = spell.name;
      this.flavor = spell.system.flavor;
      if (!this.actor) this.actor = spell.actor;
      if (!this.actor) this.actor = game.user.character;
      if (!this.actor) this.actor = game.canvas.tokens.controlled[0].actor;
      this.render();
    }
    else {
      let spellFeatures = spell.system.features;
      let selectedFeatures = this.selected;
      let newFeatures = {};
      let index = 0;
      for (let feature of Object.values(spellFeatures)) {
        let newId = `selected-${index}`;
        newFeatures[newId] = feature;
        index++;
      }
      for (let feature of Object.values(selectedFeatures)) {
        let newId = `selected-${index}`;
        newFeatures[newId] = feature;
        index++;
      }
      this.selected = newFeatures;
      this.render();
    }
  }

  async getFavorites() {
    const favorites = game.user.getFlag('utopia', 'favorites') || {};
    const spellFeatures = favorites["spellFeature"] || [];
    const features = this.features;
    for (let feature of Object.values(features)) {
      feature.favorite = spellFeatures.includes(feature._id);
    }
  }
  
  async removeFavorite(feature) {
    let favorites = game.user.getFlag('utopia', 'favorites') || {};
    if (!favorites["spellFeature"]) {
      favorites["spellFeature"] = [];
    }
    favorites["spellFeature"] = favorites["spellFeature"].filter(f => f !== feature._id);
    await game.user.setFlag('utopia', 'favorites', favorites);
  }
  
  async addFavorite(feature) {
    let favorites = game.user.getFlag('utopia', 'favorites') || {};
    if (!favorites["spellFeature"]) {
      favorites["spellFeature"] = [];
    }
    if (!favorites["spellFeature"].includes(feature._id)) {
      favorites["spellFeature"].push(feature._id);
    }
    await game.user.setFlag('utopia', 'favorites', favorites);
  }

  async prepareFormulaOptions() {
    const selected = this.selected;
    const entries = Object.entries(selected);
    entries.forEach(entry => {
      const itemData = entry[1];
      const formula = itemData.system.formula;
      let newFormula = formula;
      const stacks = itemData.stacks || 1;
      const variables = Object.entries(itemData.system.variables).map(v => {
        return {[v[1].name]: v[1].value};
      });
      const data = foundry.utils.mergeObject(itemData.rollData, variables);
      const roll = new Roll(formula, data);
      const dice = roll.terms.filter(term => term instanceof Die);
      const diceOptions = {};
      dice.forEach((die, index) => {
        const max = die.faces * (die.number * stacks);
        newFormula = roll.formula.replace(die.formula, `${die.number * stacks}d${die.faces}`);
        
        // We only allow dice in the standard array:
        // 4, 6, 8, 10, 12, 20, 100
        // We need to calculate the various other options
        const options = [4, 6, 8, 10, 12, 20, 100].filter(f => max % f === 0);
        diceOptions[index] = [];

        options.forEach(option => {
          let count = max / option;
          diceOptions[index].push(`${count}d${option}`);
        });
      });

      entry[1].formulaOptions = diceOptions;

      if (itemData.customFormula === false) {
        if (game.settings.get("utopia", "diceRedistribution")) {
          let size = game.settings.get("utopia", "diceRedistributionSize");
          if (size === 1) {
            entry[1].currentFormula = 0;
          }
          else if (size === 2) {
            entry[1].currentFormula = diceOptions[0].length - 1;
          } 
          else {
            let min = 0;
            let max = diceOptions[0] ? diceOptions[0].length - 1 : 0;
            // Get the middle option
            entry[1].currentFormula = Math.floor((min + max) / 2);
          }
        }
      }

      if (itemData.currentFormula && itemData.currentFormula > diceOptions[0].length - 1) {
        entry[1].currentFormula = diceOptions[0].length - 1;
      }
    });

    this.selected = Object.fromEntries(entries);
  }
}