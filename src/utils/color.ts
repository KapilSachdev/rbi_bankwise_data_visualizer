/**
 * Converts an OKLCH color string (e.g. "oklch(71% 0.202 349.761)") to a hex color string.
 * Only supports OKLCH in percent and degrees, no alpha.
 * @param oklchStr - The OKLCH color string.
 * @returns Hex color string (e.g. "#ff99cc")
 */
export function oklchToHex(oklchStr: string): string {
  const match = oklchStr.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (!match) return "#ff9900"; // fallback

  let [_, lStr, cStr, hStr] = match;
  let l = parseFloat(lStr) / 100;
  let c = parseFloat(cStr);
  let h = parseFloat(hStr) * Math.PI / 180;

  // Convert OKLCH to OKLab
  let a = Math.cos(h) * c;
  let b = Math.sin(h) * c;

  // OKLab to linear sRGB
  let L = l;
  let m1 = L + 0.3963377774 * a + 0.2158037573 * b;
  let m2 = L - 0.1055613458 * a - 0.0638541728 * b;
  let m3 = L - 0.0894841775 * a - 1.2914855480 * b;

  let r = Math.pow(m1, 3);
  let g = Math.pow(m2, 3);
  let b_ = Math.pow(m3, 3);

  // Linear sRGB to sRGB
  r = r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
  b_ = b_ <= 0.0031308 ? 12.92 * b_ : 1.055 * Math.pow(b_, 1 / 2.4) - 0.055;

  // Clamp and convert to hex
  const toHex = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b_)}`;
}
