export class UtopiaUser extends User {
  constructor (data, context) {
    super(data, context);

    // Add the user's favorite crafting features
    this._favorites = data.favorites || {spellFeatures: []};
    console.log(this);
  }

  prepareData() {
    // Ensure the base data is prepared by calling the parent method.
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    const itemData = this;
    const systemData = itemData.system;

    if (itemData.type === "spellFeature") {
      if (itemData.img === "icons/svg/item-bag.svg") {
        this.updateDefaultSpellFeatureIcon();
      }
    }
  }

  get favorites () {
    return this._favorites;
  }

  async updateFavorites (favorites) {
    this._favorites = favorites;
    return this.update({ favorites: this._favorites });
  }
  
  async addFavorite (type, id) {
    this._favorites[type].push(id);
    return this.updateFavorites(this._favorites);
  }

  async removeFavorite (type, id) {
    this._favorites[type] = this._favorites[type].filter(f => f !== id);
    return this.updateFavorites(this._favorites);
  }
}