import { UtopiaItem } from "../documents/item.mjs";

export class UtopiaChatMessage extends ChatMessage {
  async getHTML() {
    console.log("Html");

    // const actor = this.actor;

    // // Enrich flavor, which is skipped by upstream
    // if (this.isContentVisible) {
    //     const rollData = this.getRollData();
    //     this.flavor = await TextEditorPF2e.enrichHTML(this.flavor, {
    //         async: true,
    //         rollData,
    //         processVisibility: false,
    //     });
    // }

    const $html = await super.getHTML();
    const html = $html[0];

    console.log(this);

    let damageButtons = html.querySelectorAll('button[data-action="damage"]');
    for (let button of damageButtons) {
      button.addEventListener('click', async (event) => {
        let targets = game.user.targets;

        for (let target of targets) {
          console.log(target);

          let actor = target.actor;

          for (let dice of this.system.dice) {
            console.log(dice);

            let damage = dice.results.reduce((sum, current) => sum + current.result, 0); 
            let source = this.flags.utopia.item;
            let type = dice.options.flavor;

            await actor.applyDamage(damage, source, type);
          }
        }
      });
    }

    return html;    
  }

  /** Get the actor associated with this chat message */
  getActor() {
    return ChatMessagePF2e.getSpeakerActor(this.speaker);
  }

  /** Get the owned item associated with this chat message */
  getItem() {
    console.log("get item");

    const actor = this.actor;
    if (this.flags.pf2e.context?.type === "self-effect") {
        const item = actor?.items.get(this.flags.pf2e.context.item);
        return item ?? null;
    }

    // If this is a strike, return the strike's weapon or unarmed attack
    const strike = this._strike;
    if (strike?.item) return strike.item;

    const item = (() => {
      return item instanceof UtopiaItem ? item : null;
    })();
    if (!item) return null;

    if (item?.isOfType("spell")) {
      const entryId = this.flags.pf2e?.casting?.id ?? null;
      const overlayIds = this.flags.pf2e.origin?.variant?.overlays;
      const castRank = this.flags.pf2e.origin?.castRank ?? item.rank;
      const modifiedSpell = item.loadVariant({ overlayIds, castRank, entryId });
      return modifiedSpell ?? item;
    }

    return item;
  }

  /** Get the token of the speaker if possible */
  getToken() {
    if (!game.scenes) return null; // In case we're in the middle of game setup
    const sceneId = this.speaker.scene ?? "";
    const tokenId = this.speaker.token ?? "";
    return game.scenes.get(sceneId)?.tokens.get(tokenId) ?? null;
  }

  /** @override */
  getRollData() {
    const { actor, item } = this;
    return { ...actor?.getRollData(), ...item?.getRollData() };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */


}