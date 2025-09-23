/**
 * Shrinks (or grows) the font size of an input so it never overflows its box.
 * @param {HTMLInputElement} input   The input element to resize
 * @param {number} minSize          Minimum font size in px
 * @param {number} maxSize          Maximum font size in px
 */
export function fitTextToWidth(input, minSize, maxSize) {
  // Get the current style-based font size (default).
  let fontSize = parseInt(window.getComputedStyle(input).fontSize, 10) || 14;

  // Try shrinking until it fits or we hit our minimum
  while (input.scrollWidth > input.clientWidth && fontSize > minSize) {
    fontSize--;
    input.style.fontSize = fontSize + 'px';
  }

  // If there's room left, try growing until we either overflow or hit max
  while (input.scrollWidth <= input.clientWidth && fontSize < maxSize) {
    fontSize++;
    input.style.fontSize = fontSize + 'px';
  }

  // If we overshoot in the last step, back off by 1
  if (input.scrollWidth > input.clientWidth) {
    fontSize--;
    input.style.fontSize = fontSize + 'px';
  }
}