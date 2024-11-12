import { UtopiaItemSheet } from "./item-sheet.mjs";

export class UtopiaOptionsSheet extends Application {
  displayOptions = {};
  actor = {};
  modifying = '';

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['utopia', 'sheet'],
      width: 300,
      height: 400
    });
  }

  /** @override */
  get template() {
    return `systems/utopia/templates/options-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();

    context.options = this.displayOptions;

    console.log(context);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('click', '.select', this._select.bind(this));
    html.on('click', '.source', this._source.bind(this));
  }

  async _source(event) {
    let dataset = event.currentTarget.dataset;
    let option = dataset.option;
    let item = this.displayOptions.find(f => f._id == option);
    item.sheet.render(true);
  }

  async _select(event) {
    let dataset = event.currentTarget.dataset;
    let option = dataset.option;
    let type = dataset.type;
    let item = this.displayOptions.find(f => f._id == option);

    switch (type) {
      case 'species': {
        await this.actor.setSpecies(item);
        break;
      }
    }

    this.close();
  }
}