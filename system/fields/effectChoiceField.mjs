export class EffectChoiceField extends foundry.data.fields.DataField {
  constructor(data = {name: "", effectAttribute: "", effectMode: "add", effectValue: 0}, context = {}) {
    super(data, {initial: []});
    this.name = data.name;
    this.effectAttribute = data.effectAttribute;
    this.effectMode = data.effectMode;
    this.effectValue = data.effectValue;
  }

  /** @override */
  getInitialValue(data) {
    const initial = super.getInitialValue(data);
    if ( initial ) return initial;          // Explicit initial value defined by subclass
    if ( !this.required ) return undefined; // The ObjectField may be undefined
    if ( this.nullable ) return null;       // The ObjectField may be null
    return {};                              // Otherwise an empty object
  }

  /** @override */
  _cast(value) {
    return getType(value) === "Object" ? value : {};
  }

  /** @override */
  initialize(value, model, options={}) {
    if ( !value ) return value;
    return deepClone(value);
  }

  /** @override */
  toObject(value) {
    return deepClone(value);
  }

  /**
   * Get a record of eligible choices for the field.
   * @param {object} [options]
   * @param {Record<any, any>|Array<any>} options.choices
   * @param {string} [options.labelAttr="label"]   The property in the choice object values to use as the option label.
   * @param {string} [options.valueAttr]
   * @param {boolean} [options.localize=false]     Pass each label through string localization?
   * @returns {FormSelectOption[]}
   * @internal
   */
  static _getChoices({choices, labelAttr="label", valueAttr, localize=false}={}) {
    if ( choices instanceof Function ) choices = choices();
    if ( typeof choices === "object" ) {
      choices = Object.entries(choices).reduce((arr, [value, label]) => {
        if ( typeof label !== "string" ) {
          if ( valueAttr && (valueAttr in label) ) value = label[valueAttr];
          label = label[labelAttr] ?? "undefined";
        }
        if ( localize ) label = game.i18n.localize(label);
        arr.push({value, label});
        return arr;
      }, [])
    }
    return choices;
  }

  /* -------------------------------------------- */

  /** @override */
  _toInput(config) {
    if ( config.value === undefined ) config.value = this.getInitialValue({});
    config.choices ??= this.choices;
    if ( config.choices && !config.options ) {
      config.options = StringField._getChoices(config);
      delete config.choices;
      delete config.valueAttr;
      delete config.labelAttr;
      if ( this.blank || !this.required ) config.blank ??= "";
    }
    if ( config.options ) return foundry.applications.fields.createSelectInput(config);
    return this.createTextInput(config);
  }

  /**
   * Create an `<input type="text">` element for a StringField.
   * @param {FormInputConfig<string>} config
   * @returns {HTMLInputElement}
   */
  createEffectInput(config) {
    const container = document.createElement("div");
    const effectAttribute = document.createElement("input");
    effectAttribute.type = "text";
    effectAttribute.name = config.name + ".effectAttribute";
    effectAttribute.setAttribute("value", config.value.effectAttribute ?? "");
    setInputAttributes(effectAttribute, config);
    container.appendChild(effectAttribute);

    const effectMode = document.createElement("select");
    const options = foundry.data.fields.StringField._getChoices()
    effectMode.name = config.name + ".effectMode";
    effectMode.setAttribute("value", config.value.effectMode ?? "add");
    setInputAttributes(effectMode, config);
    container.appendChild(effectMode);

    const effectValue = document.createElement("input");
    effectValue.type = "number";
    effectValue.name = config.name + ".effectValue";
    effectValue.setAttribute("value", config.value.effectValue ?? 0);
    setInputAttributes(effectValue, config);
    container.appendChild(effectValue);

    return container;
  }

  /**
   * Apply standard attributes to all input elements.
   * @param {HTMLElement} input           The element being configured
   * @param {FormInputConfig<*>} config   Configuration for the element
   */
   setInputAttributes(input, config) {
    input.toggleAttribute("required", config.required === true);
    input.toggleAttribute("disabled", config.disabled === true);
    input.toggleAttribute("readonly", config.readonly === true);
    input.toggleAttribute("autofocus", config.autofocus === true);
    if ( config.placeholder ) input.setAttribute("placeholder", config.placeholder);
    if ( "dataset" in config ) {
      for ( const [k, v] of Object.entries(config.dataset) ) {
        input.dataset[k] = v;
      }
    }
  }
}