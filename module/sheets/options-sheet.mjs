import { UtopiaItemSheet } from "./item-sheet.mjs";

export class UtopiaOptionsSheet extends Application {
  displayOptions = {};
  actor = {};
  modifying = '';
  keepOpen = false;

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['utopia', 'sheet'],
      width: 400,
      height: 600
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
  }q

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on('click', '.select', this._select.bind(this));
    html.on('click', '.source', this._source.bind(this));
    html.on('click', '.keep-open', (ev) => {
      let checked = ev.currentTarget.checked;
      if (checked) this.keepOpen = true;
      else this.keepOpen = false;
    })
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
      case 'talent': {
        if (this.actor.system.points.talent > 0) {
          let data = [item];
          let created = await Item.createDocuments(data, {parent: this.actor})

          let points = this.actor.system.points.talent - 1;
          this.actor.update({
            'system.points.talent': points
          })
        }
        else {
          ui.notifications.error("This actor does not have enough talent points to add a talent. Duh...");
        }
      }
    }

    if (!this.keepOpen)
      this.close();
  }
}