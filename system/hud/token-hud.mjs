/**
 * Extend the basic Token HUD with additional controls for Utopia.
 * {@link CONFIG.Token.hudClass}
 * @extends {TokenHUD}
 */
export default class UtopiaTokenHUD extends TokenHUD {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "token-hud",
      template: "systems/utopia/templates/hud/token-hud.hbs",
      classes: ["utopia", "placeable-hud"]
    });
  }

  get document() {
    return this.object?.document;
  }

  /** @inheritDoc */
  getData(options={}) {
    let data = super.getData(options);

    data = foundry.utils.mergeObject(data, {
      shpBarData: this.document.shpBar,
      dhpBarData: this.document.dhpBar,
      staminaBarData: this.document.staminaBar,
    });

    data.statusEffects = this._getStatusEffectChoices();
    return data;
  }

  /** @override */
  activateListeners(html) {
    console.log(this);
    console.log(this.object);
    console.log(this.document);

    super.activateListeners(html);

    html[0].addEventListener("blur", element => {
      html.find(".attribute input").each((i, el) => {
        this._updateAttribute(el.name, el.value.trim());
      });
    });
  }
} 