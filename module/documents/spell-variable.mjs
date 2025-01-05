import UtopiaSpellFeature from "../data/item-spell-feature.mjs";
import UtopiaSpell from "../data/item-spell.mjs";
import { UtopiaItem } from "./item.mjs";

export class UtopiaSpellVariable extends foundry.abstract.Document {
  static defaultName() {
    return "Variable";
  }

/**
 * Construct a Item document using provided data and context.
 * @param {Partial<ItemData>} data                Initial data from which to construct the Item
 * @param {DocumentConstructionContext} context   Construction context options
 */
  constructor(data, context) {
    super(data, context);
  }

  /** @inheritdoc */
  static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
    name: "Variable",
    collection: "variables",
    hasTypeData: true,
    label: "DOCUMENT.Variable",
    labelPlural: "DOCUMENT.Variables",
    schemaVersion: "12.324"
  }, {inplace: false}));

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      parent: new fields.ForeignDocumentField(UtopiaItem, { required: true }),
      character: new fields.StringField({ required: true, nullable: false, initial: "x" }),
      type: new fields.StringField({ required: true, nullable: false, initial: "number", choices: {
        "number": "UTOPIA.SpellFeatures.Variables.number",
        "options": "UTOPIA.SpellFeatures.Variables.options",
        "text": "UTOPIA.SpellFeatures.Variables.text",
        "dice": "UTOPIA.SpellFeatures.Variables.dice",
      }}),
    }
  }

  /* -------------------------------------------- */
  /*  Model Methods                               */
  /* -------------------------------------------- */

  /** @inheritdoc */
  canUserModify(user, action, data={}) {
    if ( this.isEmbedded ) return this.parent.canUserModify(user, "update");
    return super.canUserModify(user, action, data);
  }

  /* ---------------------------------------- */

  /** @inheritdoc */
  testUserPermission(user, permission, {exact=false}={}) {
    if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
    return super.testUserPermission(user, permission, {exact});
  }

  /* -------------------------------------------- */
  /*  Database Event Handlers                     */
  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if ( allowed === false ) return false;
    if ( this.parent instanceof UtopiaItem ) {
      this.updateSource({transfer: false});
    }
  }

  /* -------------------------------------------- */
  /*  Deprecations and Compatibility              */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData(data) {
    /**
     * label -> name
     * @deprecated since v11
     */
    this._addDataFieldMigration(data, "label", "name", d => d.label || "Unnamed Effect");
    /**
     * icon -> img
     * @deprecated since v12
     */
    this._addDataFieldMigration(data, "icon", "img");
    return super.migrateData(data);
  }

  /* ---------------------------------------- */

  /** @inheritdoc */
  static shimData(data, options) {
    this._addDataFieldShim(data, "label", "name", {since: 11, until: 13});
    this._addDataFieldShim(data, "icon", "img", {since: 12, until: 14});
    return super.shimData(data, options);
  }

  /* -------------------------------------------- */

  /**
   * @deprecated since v11
   * @ignore
   */
  get label() {
    this.constructor._logDataFieldMigration("label", "name", {since: 11, until: 13, once: true});
    return this.name;
  }

  /**
   * @deprecated since v11
   * @ignore
   */
  set label(value) {
    this.constructor._logDataFieldMigration("label", "name", {since: 11, until: 13, once: true});
    this.name = value;
  }

  /* -------------------------------------------- */

  /**
   * @deprecated since v12
   * @ignore
   */
  get icon() {
    this.constructor._logDataFieldMigration("icon", "img", {since: 12, until: 14, once: true});
    return this.img;
  }

  /**
   * @deprecated since v12
   * @ignore
   */
  set icon(value) {
    this.constructor._logDataFieldMigration("icon", "img", {since: 12, until: 14, once: true});
    this.img = value;
  }
}