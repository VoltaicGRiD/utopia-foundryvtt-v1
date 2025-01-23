import UtopiaItemBase from "../base-item.mjs";

/**
 * UtopiaSpell Class
 * -------------------------------------------------------
 * Extends UtopiaItemBase to represent spells within the system. 
 * Handles specialized data parsing for features, cost, duration, 
 * area of effect, and range. 
 */
export default class UtopiaSpell extends UtopiaItemBase {
  /**
   * Static method that defines the schema for UtopiaSpell.
   * @returns {Object} The defined schema for this item.
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Additional string fields
    schema.formula = new fields.StringField({ blank: true }); // e.g., formula or dice string
    schema.flavor = new fields.StringField({ blank: true });  // e.g., flavor text or short description
    schema.arts = new fields.ArrayField(new fields.StringField()); // array of "arts" used in this spell

    // Primary numeric fields for the spell
    schema.duration = new fields.StringField(); // raw duration info
    schema.aoe = new fields.ArrayField(new fields.StringField()); // area-of-effect representation
    schema.range = new fields.StringField(); // range info
    schema.cost = new fields.NumberField();  // stamina or resource cost

    // Features object captures advanced details for a spell
    schema.features = new fields.ObjectField();

    return schema;
  }

  /**
   * prepareDerivedData
   * -------------------------------------------------------
   * Called by Foundry VTT to finalize and transform data.
   * This method resets core fields and calls private 
   * methods that interpret the state's "features" data 
   * into final form (cost, duration, range, etc.).
   */
  prepareDerivedData() {
    // "this.parent" is the item data context from the Foundry Document.
    

    // Initialize or reset key system fields
    this.cost = 0;      // Stamina or resource cost
    this.aoe = [];  // Return string or final AoE representation
    this.duration = 0;  // Duration in seconds
    this.range = 0;     // Range in meters

    // Private data preparation methods
    this._prepareSpellFeatures();  
    this._prepareSpellDuration();
    this._prepareSpellRange();
    this._prepareSpellAoE();
  }

  /**
   * _prepareSpellFeatures
   * -------------------------------------------------------
   * Interprets this.features and updates 
   * aggregated cost, range, duration, or area-of-effect.
   * Each feature can modify these stats in different ways.
   * @private
   */
  _prepareSpellFeatures() {
    

    // If no features, simply return.
    if (Object.keys(this.features).length === 0) return;

    // Convert features into an array for iteration
    const features = Object.entries(this.features);

    let ppCost = 0;      // Tracks "power point" cost, which converts to stamina
    let staminaCost = 0; // Final stamina cost

    for (let feature of features) {
      // feature is [key, value], so we reassign "feature = feature[1]"
      feature = feature[1];

      // Gather cost or stack info from the feature
      ppCost = this._handleFeatureCostAndStacks(feature, ppCost);

      // Potential modifications
      if (feature.system.modifies === "range") {
        this._handleFeatureRange(feature);
      }
      if (feature.system.modifies === "duration") {
        this._handleFeatureDuration(feature);
      }
      if (feature.system.modifies === "aoe") {
        this._handleFeatureAoE(feature);
      }
    }

    // Convert "power point" cost to stamina cost
    staminaCost = Math.ceil(ppCost / 10);
    this.cost = staminaCost;
  }

  /**
   * _handleFeatureCostAndStacks
   * -------------------------------------------------------
   * Extracts stacks from a feature, calculates partial cost, 
   * and updates a running total "ppCost".
   * @param {Object} feature - The feature object.
   * @param {number} ppCost  - Accumulated power point cost so far.
   * @returns {number} Updated ppCost after this feature.
   * @private
   */
  _handleFeatureCostAndStacks(feature, ppCost) {
    // Check for feature stack variables
    if (feature.system.variables["stacks"]) {
      feature.stacks = feature.system.variables["stacks"].value;
    }

    // If the feature has a "cost" variable, apply it
    if (feature.system.variables["cost"]) {
      ppCost += (feature.system.cost * feature.system.variables["cost"].value) * feature.stacks;
    } else {
      ppCost += feature.system.cost * feature.stacks;
    }

    return ppCost;
  }

  /**
   * _handleFeatureRange
   * -------------------------------------------------------
   * Modifies the this.range based on the feature's 
   * stacking or variable references.
   * @param {Object} feature - The feature object with range data.
   * @private
   */
  _handleFeatureRange(feature) {
    
    let range = feature.system.modifiedRange.value;

    // 0 indicates a fallback minimum
    if (range === 0) {
      range = 1;
    }

    // If there's a variable for range, multiply it
    if (
      feature.system.modifiedRange.variable && 
      feature.system.modifiedRange.variable !== "X" &&
      feature.system.variables[feature.system.modifiedRange.variable]
    ) {
      range *= feature.system.variables[feature.system.modifiedRange.variable].value;
    } 
    // If the variable is "X", multiply by the "cost" variable
    else if (
      feature.system.modifiedRange.variable && 
      feature.system.modifiedRange.variable === "X"
    ) {
      range *= feature.system.variables["cost"].value;
    }

    // Convert kilometers to meters, if specified
    if (feature.system.modifiedRange.unit === "kilometers") {
      range *= 1000;
    }

    // Apply stacking
    range = range * feature.stacks;

    // Accumulate into the base range
    this.range += range;
  }

  /**
   * _handleFeatureDuration
   * -------------------------------------------------------
   * Modifies the this.duration based on the feature's 
   * stacking or variable references, converting to a unified 
   * second-based system.
   * @param {Object} feature - The feature object with duration data.
   * @private
   */
  _handleFeatureDuration(feature) {
    
    let duration = feature.system.modifiedDuration.value;

    // 0 indicates a fallback minimum
    if (duration === 0) {
      duration = 1;
    }

    // If there's a variable for duration, multiply it
    if (
      feature.system.modifiedDuration.variable && 
      feature.system.modifiedDuration.variable !== "X" &&
      feature.system.variables[feature.system.modifiedDuration.variable]
    ) {
      duration *= feature.system.variables[feature.system.modifiedDuration.variable].value;
    } 
    // If the variable is "X", multiply by the "cost" variable
    else if (
      feature.system.modifiedDuration.variable && 
      feature.system.modifiedDuration.variable === "X"
    ) {
      duration *= feature.system.variables["cost"].value;
    }

    // Convert to seconds depending on unit
    let unit = feature.system.modifiedDuration.unit;
    switch (unit) {
      case "turns":    duration *= 6;        break;
      case "minutes":  duration *= 60;       break;
      case "hours":    duration *= 3600;     break;
      case "days":     duration *= 86400;    break;
      case "months":   duration *= 2592000;  break;
      case "years":    duration *= 31536000; break;
    }

    // Apply stacking
    duration = duration * feature.stacks;

    // Accumulate into base duration
    this.duration += duration;
  }

  /**
   * _handleFeatureAoE
   * -------------------------------------------------------
   * Interprets the feature's area-of-effect attributes
   * and appends an AoE description to this.aoe.
   * @param {Object} feature - The feature object with AoE data.
   * @private
   */
  _handleFeatureAoE(feature) {
    
    let aoe = feature.system.modifiedAoE.value;

    // 0 indicates a fallback minimum
    if (aoe === 0) {
      aoe = 1;
    }

    // If there's a variable for aoe, multiply it
    if (
      feature.system.modifiedAoE.variable && 
      feature.system.modifiedAoE.variable !== "X" &&
      feature.system.variables[feature.system.modifiedAoE.variable]
    ) {
      aoe *= feature.system.variables[feature.system.modifiedAoE.variable].value;
    } 
    // If the variable is "X", multiply by the cost variable
    else if (
      feature.system.modifiedAoE.variable && 
      feature.system.modifiedAoE.variable === "X"
    ) {
      aoe *= feature.system.variables["cost"].value;
    }

    let type = feature.system.modifiedAoE.type;
    let output = "";

    if (type === "template") {
      // e.g. circle, cone, rectangle, ray
      let shape = feature.system.modifiedAoE.shape;
      switch (shape) {
        case "circle":     output = "radius";             break;
        case "cone":       output = "angle";              break;
        case "rectangle":  output = "width x height";     break;
        case "ray":        output = "length";             break;
      }
    } else if (type === "point") {
      output = "Target Point";
    } else if (type === "attach") {
      output = "Attached";
    }

    // e.g. "10m radius"
    this.aoe.push(`${aoe}m ${output}`);
  }

  /**
   * _prepareSpellDuration
   * -------------------------------------------------------
   * Takes the this.duration (in seconds) and converts 
   * it to a more human-readable string (turns, minutes, hours, etc.).
   * @private
   */
  _prepareSpellDuration() {
    

    // If 0, treat as "Instant"
    if (this.duration === 0) {
      this.durationOut = "Instant";
    } else {
      let unit = "seconds";

      // Convert based on thresholds
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

      // Output the final duration string
      this.durationOut = `${this.duration} ${unit}`;
    }
  }

  /**
   * _prepareSpellRange
   * -------------------------------------------------------
   * Converts this.range (in meters) into a 
   * rangeOut string. If range is 0, treat it as "Touch".
   * @private
   */
  _prepareSpellRange() {
    
    if (this.range === 0) {
      this.rangeOut = "Touch";
    } else {
      this.rangeOut = `${this.range}m`;
    }
  }

  /**
   * _prepareSpellAoE
   * -------------------------------------------------------
   * Joins all AoE entries into a single comma-separated 
   * string (or "None" if none exist).
   * @private
   */
  _prepareSpellAoE() {
    if (this.aoe.length === 0) {
      this.aoeOut = "None";
    }
    else {
      this.aoeOut = this.aoe.join(", ");
    }
  }

  /**
   * style (Getter)
   * -------------------------------------------------------
   * Creates an inline background style string for an 
   * element, either a solid color or a linear gradient 
   * spanning multiple colors (one for each feature).
   * @returns {string} style attribute string.
   */
  get style() {
    

    // Collect background colors from features (sorted by 'art')
    let colors = Object.entries(this.features)
      .sort((a, b) => a[1].system.art.localeCompare(b[1].system.art))
      .map((f) => f[1].background);

    // If multiple colors, build a linear gradient
    if (colors.length > 1) {
      return `style="background: linear-gradient(120deg, ${
        colors.map((color, index) => {
          const colorStopPercentage = 100 / colors.length;
          const start = colorStopPercentage * index;
          const end = start + colorStopPercentage;
          return `${color} ${start}%, ${color} ${end}%`;
        }).join(', ')
      })"`;
    } 
    // Otherwise, single color
    else {
      return `style="background: ${colors[0]};"`;
    }
  }
}