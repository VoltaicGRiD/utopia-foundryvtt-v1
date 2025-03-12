export class DamageInstance {
  constructor({ type, value, source, target }) {
    this.type = type;
    this.value = value ?? 0;
    this.source = source ?? null;
    this.target = target;
    if (target === null || target === undefined) 
      if (game.actors.getName("Unknown")) 
        this.target = game.actors.getName("Unknown");
      else {
        this.target = { };
        foundry.utils.setProperty(this.target, "system.hitpoints.surface.value", 0);
        foundry.utils.setProperty(this.target, "system.hitpoints.deep.value", 0);
        foundry.utils.setProperty(this.target, "system.defenses.energy", 1);
        foundry.utils.setProperty(this.target, "system.defenses.heat", 1);
        foundry.utils.setProperty(this.target, "system.defenses.chill", 1);
        foundry.utils.setProperty(this.target, "system.defenses.physical", 1);
        foundry.utils.setProperty(this.target, "system.defenses.psyche", 1);
      }
    this.shpPercent = source.getFlag("utopia", "shpPercent") ?? 1;
    this.dhpPercent = source.getFlag("utopia", "dhpPercent") ?? 1;
    this.penetrate = source.getFlag("utopia", "penetrative") ?? false;
    this.finalized = false;
  }

  get chatData() {
    if (!this.finalized)
    {
      renderTemplate("systems/utopia/templates/chat/damage-instance.hbs", this.final).then((content) => {
        return content;
      });
    }
  }

  get defenses() {
    const typeKey = this.type.key;
    if (["kinetic", "dhp", "shp"].includes(typeKey) || this.penetrate === true)
      return 0;
    else 
      return this.target.system.defenses[typeKey];
  }

  get damage() {
    return this.value - this.defenses;
  }

  get shp() {
    return (this.target.system.hitpoints.surface.value - this.damage) * this.shpPercent;
  }

  get shpDamageDealt() {
    return this.target.system.hitpoints.surface.value - this.shp;
  }

  get dhp() {
    return this.shp < 0 ? Math.abs(this.shp) * this.dhpPercent : 0;
  }

  get dhpDamageDealt() {
    return this.shp < 0 ? Math.abs(this.shp) - this.dhp : 0
  }
  
  get stamina() {
    if (this.source.getFlag("utopia", "exhausting") === true) // Weapon / damage source is exhausting
      return this.shp + this.dhp; // Stamina is lost
    return 0; // Else no stamina is lost
  }

  get staminaDamageDealt() {
    return this.stamina;
  }
  
  get totalDamageDealt() {
    return this.shpDamageDealt + this.dhpDamageDealt + this.staminaDamageDealt;
  }

  get final() {
    return {
      shp: this.shp < 0 ? 0 : this.shp,
      dhp: this.dhp < 0 ? 0 : this.dhp,
      stamina: this.stamina < 0 ? 0 : this.stamina,
      total: this.damage,
      type: CONFIG.UTOPIA.DAMAGE_TYPES[this.type]
    }
  }
}