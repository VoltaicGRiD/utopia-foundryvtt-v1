
const { api, sheets } = foundry.applications;
import Tagify from '../../../lib/tagify/tagify.esm.js';
import { UtopiaSpellVariable } from '../../data/_module.mjs';
import { UtopiaItem } from '../../documents/item.mjs';
import { gatherSpells } from '../../helpers/gatherSpells.mjs';
import { getTextContrast } from '../../helpers/textContrast.mjs';

export class UtopiaSpellcraftSheet extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  selected = {};
  allFeatures = {};
  features = {};
  secretFeatures = {};
  filter = "";
  actor = {};

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
    },
    window: {
      title: "UTOPIA.SheetLabels.spellcraft",
    },
  };

  static PARTS = {
    content: {
      template: "systems/utopia/templates/other/spellcraft/spellcraft.hbs",
    },
    column: {
      template: "systems/utopia/templates/other/spellcraft/features.hbs",
    },
    spell: {
      template: "systems/utopia/templates/other/spellcraft/spell.hbs",
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ["content"];
  }

  async _prepareContext(options) {
    if (options.isFirstRender) {
      const features = {};

      const retreivedFeatures = await gatherSpells();
      retreivedFeatures.sort((a, b) => a.folder.name.localeCompare(b.folder.name) || a.name.localeCompare(b.name) || b.cost - a.cost); 
      
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

        if (this.actor && Object.keys(this.actor).length === 0) {
          const actorArtistries = this.actor.system.items.filter(i => i.type === "talent");
          
        }

        if (game.user._favorites["spellFeatures"].includes(f._id)) {
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
    } else {
      await this.updateSpell();
    }

    await this.applyFilter();
    await this.parseSpell();
          
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
    }

    console.log(context);

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
        event.dataTransfer.setData("text", f.dataset.id);
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
        if (feature.favorite) {
          feature.favorite = false;
          game.user.removeFavorite("spellFeatures", name);
        } else {
          feature.favorite = true;
          game.user.addFavorite("spellFeatures", name);
        }
        await game.user.updateFavorites(game.user._favorites);
        this.render();
      });
    });

    const spell = this.element.querySelector(".spell-panel");
    spell.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    spell.addEventListener("drop", async (event) => {
      event.preventDefault();
      const id = event.dataTransfer.getData("text");
      const feature = this.features[id];
      if (!feature) return;
      const length = Object.keys(this.selected).length;
      const newId = `selected-${length}`;
      
      this.selected[newId] = JSON.parse(JSON.stringify(feature));
      this.selected[newId].variables = JSON.parse(JSON.stringify(feature.system.variables));      
      this.render();
    });

    const name = this.element.querySelector("input[name='name']");
    name.addEventListener("change", (event) => {
      this.name = event.target.value;
    });

    const numVariables = this.element.querySelectorAll("input[type='number']");
    numVariables.forEach(v => {
      v.addEventListener("change", (event) => {
        const featureId = event.target.dataset.feature;
        const variableId = event.target.dataset.variable;
        const value = event.target.value;

        const parentList = event.target.closest("ol");
        const selected = parentList.classList.contains("selected-feature-list") ? this.selected : this.features;
        const feature = selected[featureId];

        const variable = feature.system.variables[variableId];        
        variable.value = parseInt(value);
        selected[featureId].variables[variableId] = variable;

        if (variable.name === "cost") {
          const cost = feature.system.cost * value;
          selected[featureId].cost = `${cost} PP`;
          let parent = event.target.closest('li');
          console.log("cost parent", parent);
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
        console.log(featureId, variableId);
        const parent = event.target.closest("ol");
        const selected = parent.classList.contains("selected-feature-list") ? this.selected : this.features;
        console.log(selected[featureId].system.variables[variableId]);
        let options = selected[featureId].system.variables[variableId].options;
        if (typeof options === "string") {
          options = options.split(",");
        };

        let content = await renderTemplate('systems/utopia/templates/other/spellcraft/tooltip.hbs', { 
          name: selected[featureId].system.variables[variableId].name,
          description: selected[featureId].system.variables[variableId].description,
          options: options,
          selected: selected[featureId].value
        });
        console.log("tooltip render:", options, content);
        let element = document.createElement('div');
        element.innerHTML = content;
        element.classList.add("spellcraft-options-sheet");
        game.tooltip.activate(event.target, { direction: 'UP', cssClass: "utopia spellcraft-options-sheet", content: element });
        tooltip.style.bottom = tooltip.style.bottom - 10 + "px";
        tooltip.style.lineHeight = "0.5em";
        tooltip.querySelectorAll("button").forEach(o => {
          o.addEventListener("click", async (tooltipEvent) => {
            if (!tooltipEvent.target.classList.contains("active")) {
              tooltipEvent.target.classList.add("active");
              tooltipEvent.target.closest("div").querySelectorAll("button").forEach(b => {
                if (b !== tooltipEvent.target) {
                  b.classList.remove("active");
                }
              });
              // Get closest list
              const feature = selected[featureId];
              feature.value = tooltipEvent.target.innerHTML;
              console.log(feature);
              this.render();
            }
          });
        });
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
  }

  async applyFilter() {
    let terms = [];
    if (this.filter.includes(" ")) 
      terms = this.filter.split(" ");
    else 
      terms.push(this.filter);
    console.log(terms);
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
    console.log(this);

    if (this.duration === 0) {
      this.durationOut = "Instant";
    } else {
      console.log(this.duration);
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
}