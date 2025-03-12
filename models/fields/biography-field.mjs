export class BiographyField extends foundry.data.fields.StringField {
  constructor(options={}, context={}) {
    super(options, context);
  }

  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      type: "textarea",
      rows: 3,
      cols: 30
    });
  }

  /** @override */
  _toInput(config) {
    if ( config.value === undefined ) config.value = this.getInitialValue({});
    return foundry.applications.fields.createTextareaInput(config);
  }
}