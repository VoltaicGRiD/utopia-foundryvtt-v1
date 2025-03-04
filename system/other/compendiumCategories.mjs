import { getTextContrast, getTextContrastHex } from '../helpers/textContrast.mjs';

const categories = () =>{
  return {
    species: {
      name: game.i18n.localize("TYPES.Item.species"),
      icon: "fa-paw",
      key: "species",
      type: "Item",
      details: [
        {
          label: "constitution",
          key: "system.stats.constitution.total",
          backgroundColor: "#056a93",
          color: getTextContrastHex("#056a93")
        },
        {
          label: "endurance",
          key: "system.stats.endurance.total",
          backgroundColor: "#056a93",
          color: getTextContrastHex("#056a93")
        },
        {
          label: "effervescence",
          key: "system.stats.effervescence.total",
          backgroundColor: "#056a93",
          color: getTextContrastHex("#056a93")
        },
        {
          label: "land",
          key: "system.travel.land.value",
          backgroundColor: "#1a823e",
          color: getTextContrastHex("#1a823e")
        },
        {
          label: "water",
          key: "system.travel.water.value",
          backgroundColor: "#1a823e",
          color: getTextContrastHex("#1a823e")
        },
        {
          label: "air",
          key: "system.travel.air.value",
          backgroundColor: "#1a823e",
          color: getTextContrastHex("#1a823e")
        }
      ],
      order: (a, b) => {
        const aNameParts = a.name.split(' ');
        const bNameParts = b.name.split(' ');
        const aLastName = aNameParts.length > 1 ? aNameParts[aNameParts.length - 1] : aNameParts[0];
        const bLastName = bNameParts.length > 1 ? bNameParts[bNameParts.length - 1] : bNameParts[0];
        return aLastName.localeCompare(bLastName);
      }
    },
    talent: {
      name: game.i18n.localize("TYPES.Item.talent"),
      icon: "fa-star",
      key: "talent",
      type: "Item",
      details: [
        'system.points.body',
        'system.points.mind',
        'system.points.soul',
      ]
    },
    specialistTalent: {
      name: game.i18n.localize("TYPES.Item.specialistTalent"),
      icon: "fa-medal",
      key: "specialistTalent",
      type: "Item",
    },
    quirk: {
      name: game.i18n.localize("TYPES.Item.quirk"),
      icon: "fa-question",
      key: "quirk",
      type: "Quirk",
    },
    action: {
      name: game.i18n.localize("TYPES.Item.action"),
      icon: "fa-bolt",
      key: "action",
      type: "Item",
      details: [
        {
          label: "type",
          key: "system.type",
          backgroundColor: "#00FFB8",
          color: getTextContrastHex("#00FFB8")
        },
        {
          label: "cost",
          key: "system.cost",
          backgroundColor: "#FFBD00",
          color: getTextContrastHex("#FFBD00")
        },
        {
          label: "stamina",
          key: "system.stamina",
          backgroundColor: "#00BAFF",
          color: getTextContrastHex("#00BAFF")
        },
        {
          label: "category",
          key: "system.category",
          backgroundColor: "#FF8400",
          color: getTextContrastHex("#FF8400")
        }
      ]
    }
  }
}


export default categories;