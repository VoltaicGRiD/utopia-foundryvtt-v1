const { api, sheets } = foundry.applications;

import Quirks from "../../other/quirks.mjs";
import CompendiumCategories from "../../other/compendiumCategories.mjs";
import { isNumeric } from "../../helpers/numeric.mjs";

export class UtopiaCompendiumBrowser extends api.HandlebarsApplicationMixin(api.ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes: ['utopia', 'compendium-browser'],
    position: {
      width: 800,
      height: 600,
    },
    actions: {
      filterChange: this._onFilterChange,
      saveFilter: this._saveFilter,
      clearFilter: this._clearFilter,
    },
    form: {
      submitOnChange: true,
    },
    window: {
      title: 'UTOPIA.SheetLabels.roll',
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/utopia/templates/compendium-browser/header.hbs',
    },
    tabs: {
      template: 'templates/generic/tab-navigation.hbs',
    },
    content: {
      template: 'systems/utopia/templates/compendium-browser/content.hbs',
      scrollable: ['.compendium-browsesr-items']
    }
  };

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = ['header', 'tabs', 'content'];
  }

  async _prepareContext(options) {
    super._prepareContext(options);
    
    const  context = {};
    context.filters = options.filter ?? {};
    context.category = options.category ?? CompendiumCategories().species;
    const categories = CompendiumCategories();
    context.categories = categories;
    const filter = context.filters;
    filter.category = context.category;
    context.items = await this._filter(filter);

    console.log(context);

    return context;
  }

  async _onRender(context, options) {
    super._onRender(context, options);
    
    const items = this.element.querySelectorAll('.compendium-browser-item').forEach(i => {
      i.draggable = true;
      i.addEventListener("dragstart", async (event) => {
        const categoryFilter = this.element.querySelector('.filter[name="category-filter"]')
        const category = categoryFilter.selectedOptions[0].value ?? 'species';
        const categories = CompendiumCategories();
        console.warn(categoryFilter.selectedOptions[0].value);
        if (categoryFilter.selectedOptions[0].value === 'quirk') {
          event.dataTransfer.setData("text", JSON.stringify({
            name: i.dataset.name,
            type: "Quirk",
          }));
          return;
        }
        event.dataTransfer.setData("text", JSON.stringify({
           uuid: i.dataset.uuid,
           type: 'Item',
        }));
      });
    });
  }

  static async _onFilterChange(event) {
    const categoryFilter = this.element.querySelector('.filter[name="category-filter"]') ?? undefined;
    const option = categoryFilter.selectedOptions[0].value ?? 'species';
    const categories = CompendiumCategories();
    const selectedCategory = categories[option] ?? 'species';
    const filter = this.element.querySelector('.search').value;
    
    this.render({ filter: {search: filter}, category: selectedCategory });
  }

  async _filter(filter){
    if (!filter || !filter.category) return [];

    const type = filter.category.type;
    switch (type) {
      case "Item":
        return this._filterItems(filter);
      case "Quirk":
        return this._filterQuirks(filter);
      default:
        return this._filterActors(filter);
    }
  }

  async _filterQuirks(filter) {
    const quirks = await Promise.all(Quirks.map(async q => {
      const description = await TextEditor.enrichHTML(
        q.description, {}
      )

      return {
        type: "Quirk",
        name: q.name,
        value: q.qp,
        enrichedDescription: description
      }
    }));

    return quirks;
  }

  async _filterItems(filter) {
    const items = (
      await Promise.all(
        game.packs
          .filter(pack => pack.metadata.type === "Item")
          .map(pack => pack.getDocuments())
      )
    ).flat()
    .filter(item => item.type === filter.category.key ?? game.utopia.UtopiaItem.TYPES.filter(t => t !== 'base')[0])
    .sort(filter.category.order ?? ((a, b) => { return a.name > b.name ? 1 : -1 }));

    const details = filter.category.details ?? [];
    const mappedItems = await Promise.all(items.map(async i => {
      const itemDetails = details.map(d => {
        return {
          ...d,
          value: foundry.utils.getProperty(i, d.key) === "" ? "N/A" : foundry.utils.getProperty(i, d.key),
        }
      });

      const description = await TextEditor.enrichHTML(
        i.system.description,
        {
          secrets: i.isOwner,
          rollData: i.getRollData(),
          relativeTo: i.actor ?? i,
        }
      )

      return {
        ...i,
        enrichedDescription: description,
        details: itemDetails,
        uuid: i.uuid,
        id: i.id,
      }
    }));

    if (!filter.search) return mappedItems;

    const evaluateComparison = (value1, operator, value2) => {
      if (String(isNumeric(value1)) && String(isNumeric(value2))) {
        value1 = parseFloat(value1);
        value2 = parseFloat(value2);
      }
      else {
        value1 = String(value1).toLowerCase();
        value2 = String(value2).toLowerCase();
      }
      
      switch (operator) {
        case '<': return value1 < value2;
        case '<=': return value1 <= value2;
        case '>': return value1 > value2;
        case '>=': return value1 >= value2;
        case '=': return value1 == value2;
        case '==': return value1 == value2;
        case '===': return value1 === value2;
        case '!=': return value1 != value2;
        case '!==': return value1 !== value2;
        default: return false;
      }
    };

    const filteredItems = mappedItems.filter(i => {
      const details = i.details ?? [];
      let matches = true;
      
      const searchTerms = filter.search.split(' ') ?? [];
      const keyRegex = /(.+)([<>=]+)(.+)/;
    
      searchTerms.forEach(term => {
        const match = keyRegex.exec(term);
        let termMatches = false;
    
        if (match) {
          const [_, key, operator, value] = match;
          const detail = details.find(d => d.key === key || d.label === key);
          const comparisonResult = evaluateComparison(detail?.value, operator, value);
          termMatches = comparisonResult !== undefined && comparisonResult;
        } else {
          termMatches =
            i.name.toLowerCase().includes(term.toLowerCase()) ||
            i.system.description.toLowerCase().includes(term.toLowerCase());
        }
    
        // Use logical AND to combine all filters
        matches = matches && termMatches;
      });
    
      return matches;
    });

    return filteredItems;
  }

  async _filterActors(filter) {
    const items = (
      await Promise.all(
        game.packs
          .filter(pack => pack.metadata.type === "Actor")
          .map(pack => pack.getDocuments())
      )
    ).flat()
    .filter(item => item.type === filter.category ?? game.utopia.UtopiaActor.TYPES.filter(t => t !== 'base')[0]);

    return items;
  }
}