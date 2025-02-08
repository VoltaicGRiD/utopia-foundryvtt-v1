export function getTextContrast(rgb) {
  rgb[0] = Math.round(rgb[0] * 255);
  rgb[1] = Math.round(rgb[1] * 255);
  rgb[2] = Math.round(rgb[2] * 255);

  // (R * 299 + G * 587 + B * 114) / 1000
  const brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000);

  return (brightness > 125) ? 'black' : 'white';
}

export function getTextContrastHex(hex) {
  hex = hex.replace('#', '');
  const rgb = [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255
  ];

  rgb[0] = Math.round(rgb[0] * 255);
  rgb[1] = Math.round(rgb[1] * 255);
  rgb[2] = Math.round(rgb[2] * 255);

  // (R * 299 + G * 587 + B * 114) / 1000
  const brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000);

  return (brightness > 125) ? 'black' : 'white';
}