import UtopiaDiceTerm from "./dice.mjs";

export default class UtopiaDie extends Die {
  // In Utopia, every dice term can be redistributed based on the maximum possible value of the dice
  // We'll store this in a 'variations' array which contains an array of possible results for each dice
  get redistributions() {
    const max = this._number * this._faces;
    const options = [4, 6, 8, 10, 12, 20, 100].filter(f => max % f === 0);
    const redistributions = [];

    options.forEach(option => {
      const number = max / option;
      const newOption = new Die({
        number: number,
        faces: option,
        method: this.method,
        modifiers: this.modifiers,
        results: this.results,
        options: this.options
      });
      
      redistributions.push(newOption);
    });

    return redistributions;
  }

  set useRedistribution(index) {
    this._number = this.redistributions[index]._number;
    this._faces = this.redistributions[index]._faces;
  }

  async roll(isRedistribution = false) {
    console.log(this);

    if (!isRedistribution) return super.roll();

    const setting = game.settings.get('utopia', 'diceRedistribution') ? game.settings.get('utopia', 'diceRedistributionSize') : 0;
    switch (setting) {
      // 0 - No redistribution
      case 0:
        return super.roll();
      // 1 - Always use the smallest dice
      case 1:
        return this.redistributions[0].roll(isRedistribution = true);
      // 2 - Always use the largest dice
      case 2:
        return this.redistributions[this.redistributions.length - 1].roll(isRedistribution = true);
    }
  }
}