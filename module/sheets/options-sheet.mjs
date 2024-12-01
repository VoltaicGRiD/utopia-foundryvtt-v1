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
      height: 600,
      title: 'Options'
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
          let talentPosition = item.system.position;
          let tree = item.system.tree;
          let data = [item];

          if (talentPosition == -1) {
            let created = await Item.createDocuments(data, {parent: this.actor})

            let points = this.actor.system.points.talent - 1;
            this.actor.update({
              'system.points.talent': points
            })
          }
          else {
            let treePosition = this.actor.system.trees[tree];

            if (treePosition !== undefined) {
              if (talentPosition - 1 === treePosition) {
                let newTree = { [tree]: talentPosition };
                let newTrees = { ...this.actor.system.trees, ...newTree };

                this.actor.update({
                  "system.trees": newTrees
                })

                let created = await Item.createDocuments(data, {parent: this.actor})

                let points = this.actor.system.points.talent - 1;
                this.actor.update({
                  'system.points.talent': points
                })
              }
              else if (talentPosition <= treePosition) {
                ui.notifications.error("You already have that talent.");
                return;
              }
              else {
                ui.notifications.error(`You do not have the prerequisite talent to take this talent from the '${tree}' talent tree.`);
                return;
              }
            }
            else {
              // The actor does not have this talent tree, so initialize it
              // Create a new trees object by copying existing trees and adding the new tree with position 1
              let newTree = { [tree]: 1 };
              let newTrees = { ...this.actor.system.trees, ...newTree };

              console.log(newTrees);

              // Update the actor's talent trees
              this.actor.update({
                  "system.trees": newTrees
              });

              let created = await Item.createDocuments(data, {parent: this.actor})

              let points = this.actor.system.points.talent - 1;
              this.actor.update({
                'system.points.talent': points
              })
            }         
          }
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