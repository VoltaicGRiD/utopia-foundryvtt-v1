import { UtopiaTrigger } from "../helpers/runTrigger.mjs";
import { UtopiaUserVisibility } from "../helpers/userVisibility.mjs";
import { UtopiaItem } from "./item.mjs";

export class UtopiaChatMessage extends ChatMessage {
  async getHTML() {
    const actor = this.getActor() ?? this.system.actor ?? null;
    
    const $html = await super.getHTML();
    const html = $html[0];

    let actionButtons = html.querySelectorAll('button[data-action="action"]');
    for (let button of actionButtons) {
      const actionId = button.dataset.actionId;
      let actor = this.getActor();
      if (!actor) actor = this.system.actor;
      const action = actor.items.get(actionId);

      button.addEventListener('click', async (event) => {
        const data = await actor.performAction(action, this.system.actionData, this);
        console.log(this, data);
        data.damage = data.damage;
        UtopiaTrigger.return(data);
      });
    };

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

    const visibilityHtml = UtopiaUserVisibility.process(html, { document: actor ?? this, message: this });

    return $(visibilityHtml);
  }

  async create(message, data = {}) {
    const chatData = await super.create(message, data);
    return this;
  }

  /** Get the actor associated with this chat message */
  getActor() {
    return UtopiaChatMessage.getSpeakerActor(this.speaker);
  }

  /** Get the owned item associated with this chat message */
  getItem() {
    console.log("get item");

    const item = (() => {
      return item instanceof UtopiaItem ? item : null;
    })();
    if (!item) return null;

    if (item?.type === "spell") {
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
}