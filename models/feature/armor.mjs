export const feature = {
  equippable:     { type: Boolean, tags: ['equipment'], initial: false },
  augmentable:    { type: Boolean, tags: ['equipment'], initial: false },
  slots:          { type: Number, tags: ['storage', 'equipment'], initial: 0 },
  defense:        { type: String, tags: ['defense', 'equipment', 'armor', 'shield'], initial: "physical", choices: CONFIG.UTOPIA.damageTypes },
  block:          { type: String, tags: ['defense', 'equipment', 'shield'], initial: "0" },      
  dodge:          { type: String, tags: ['defense', 'equipment', 'armor'], initial: "0" },
  breathless:     { type: Boolean, tags: ['defense', 'equipment', 'armor'], initial: false },
  weaponless: {
    damage:       { type: Number, tags: ['damage', 'equipment', 'armor'], initial: 0 },
    type:         { type: String, tags: ['damage', 'equipment', 'armor'], initial: "physical", choices: CONFIG.UTOPIA.damageTypes },
    trait:        { type: String, tags: ['damage', 'equipment', 'armor'], initial: "none" }
  },
  traitBonus: {
    amount:       { type: Number, tags: ['trait', 'equipment', 'armor'], initial: 0 },
    trait:        { type: String, tags: ['trait', 'equipment', 'armor'], initial: "none" }
  },
  spellcasting: {
    discount:     { type: Number, tags: ['spellcasting', 'equipment', 'armor'], initial: 0 },
    artistry:     { type: String, tags: ['spellcasting', 'equipment', 'armor'], initial: "none" }
  },
  buffs: {
    shrouded:     { type: Boolean, tags: ['buff', 'equipment', 'armor'], initial: false },
  },
  locks: {
    slot:         { type: Boolean, tags: ['lock', 'equipment', 'armor'], initial: false },
    actions:      { type: Number, tags: ['lock', 'equipment', 'armor'], initial: 6 },
    damage:       { type: Boolean, tags: ['lock', 'equipment', 'armor'], initial: true }
  }
}