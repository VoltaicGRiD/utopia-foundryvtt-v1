import { BaseActorModel } from "./base-actor.mjs";

export class CharacterModel extends BaseActorModel {
  /**
   * Pre-creation hook that configures default token settings for newly created characters.
   */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    this.parent.updateSource({
      prototypeToken: {
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        sight: {
          enabled: true,
          range: 15,
        }
      }
    });
  }

  static defineSchema() {
    const schema = super.defineSchema();

    return schema;
  }
}