export class CharacterSheetTour extends Tour {
  constructor() {
    const steps = [
      {
        id: "sheet-navigation",
        title: "Character Sheet Navigation",

      }
    ];

    for(let step of steps) {
        step.selector = DiceTourMain.getSelectorForStep(step);
    }

    super({
        title: "How to use Dice So Nice!",
        description: "Learn how to customize your 3D dice in this short tour of the module",
        canBeResumed: false,
        display: true,
        steps: steps
    });
  }

  async _preStep() {
      switch (this.currentStep.id) {
          case "goto-settings":
              //start on the chat tab
              document.querySelector('a[data-tab="chat"],button[data-tab="chat"]').click();
              break;
          case "goto-dicesonice":
              //There is no native selector available for this step so we add something to identify the element with jQuery
              $("[data-tab=\"modules\"] h2:contains('Dice So Nice!')").addClass("dice-tour");
              break;
      }

      await super._preStep();
  }

  async _postStep() {
      if(!this.currentStep)
          return;
      switch (this.currentStep.id) {
          case "end-tour":
              //end the tour with a bang
              document.querySelector('.dice-so-nice button[data-test]').click();
          break;
      }
      await super._postStep();
  }

  static getSelectorForStep(step) {
      switch (step.id) {
          case "goto-settings":
              return "[data-tab=\"settings\"]";
          case "goto-configure":
              return "[data-action=\"configure\"]";
          case "goto-modulessettings":
              if(foundry.utils.isNewerVersion(game.version, "12.0"))
                  return ".category-tab[data-tab=\"dice-so-nice\"]";
              else
                  return ".category-filter [data-category=\"dice-so-nice\"]";
          case "goto-dicesonice":
              return "#client-settings form.categories div.scrollable";
          case "goto-dicesonice-settings":
              return "#client-settings [data-key=\"dice-so-nice.dice-so-nice\"]";
          case "show-3d-dice":
              return "#dice-configuration-canvas";
          case "show-appearance":
              return "#dsn-appearance-content";
          case "show-preferences":
              return ".dice-so-nice div.tab.active[data-tab=\"preferences\"]";
          case "show-sfx":
              return ".dice-so-nice div.tab.active[data-tab=\"sfx\"]";
          case "show-performance":
              return ".dice-so-nice div.tab.active[data-tab=\"performance\"]";
          case "show-backup":
              return ".dice-so-nice div.tab.active[data-tab=\"backup\"]";
          case "end-tour":
              return ".dice-so-nice div.tab.active[data-tab=\"backup\"]";
      }
      return null;
  }
}
