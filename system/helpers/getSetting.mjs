export default function getSetting(settingName) {
  const settingValue = game.settings.get("utopia", `advancedSettings.${settingName}`);
  const parsedValue = JSON.parse(settingValue);
  return {
    keys: Object.keys(parsedValue),
    values: Object.values(parsedValue),
    entries: Object.entries(parsedValue),
  }
} 