export class UtopiaUser extends User {
  constructor(data, context) {
    super(data, context);

    // Initialize favorites from data or set default
    this.flags.favorites = data.favorites || {
      spellFeature: [],
      spell: [],
      gear: [],
    };

    console.log(this);
  }

  prepareData() {
    // Ensure the base data is prepared by calling the parent method.
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }

  async updateFavorites(favorites) {
    this.setFlag('utopia', 'favorites', favorites);
  }

  async addFavorite(type, id) {
    // Ensure the type exists in favorites
    if (!this.flags.favorites[type]) {
      this.flags.favorites[type] = [];
    }
    const favorites = this.flags.favorites;
    favorites[type].push(id);
    return this.updateFavorites(favorites);
  }

  async removeFavorite(type, id) {
    // Ensure the type exists in favorites
    if (!this.favorites[type]) {
      return; // Or handle the case where the type does not exist
    }
    const favorites = this.flags.favorites[type].filter(f => f !== id);
    return this.updateFavorites(favorites);
  }
}