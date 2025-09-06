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
  // Parse values and normalize
  const L = parseFloat(lStr) / 100; // lightness (0..1)
  const chroma = parseFloat(cStr);
  // hue degrees -> radians (normalize to [0,360))
  const hueDeg = ((parseFloat(hStr) % 360) + 360) % 360;
  const hRad = (hueDeg * Math.PI) / 180;

  // OKLCH -> OKLab
  const a_ = Math.cos(hRad) * chroma;
  const b_ = Math.sin(hRad) * chroma;

  // OKLab -> LMS (intermediate)
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.2914855480 * b_;

  // Cube to get linear LMS
  const L_l = Math.pow(l_, 3);
  const L_m = Math.pow(m_, 3);
  const L_s = Math.pow(s_, 3);

  // LMS -> linear sRGB (matrix from OKLab spec)
  let rLin = 4.0767416621 * L_l - 3.3077115913 * L_m + 0.2309699292 * L_s;
  let gLin = -1.2684380046 * L_l + 2.6097574011 * L_m - 0.3413193965 * L_s;
  let bLin = -0.0041960863 * L_l - 0.7034186147 * L_m + 1.7076147010 * L_s;

  // Clamp negatives (they cannot be represented in sRGB)
  rLin = Math.max(0, rLin);
  gLin = Math.max(0, gLin);
  bLin = Math.max(0, bLin);

  // linear sRGB -> sRGB (gamma)
  const toSrgb = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

  const r = toSrgb(rLin);
  const g = toSrgb(gLin);
  const bb = toSrgb(bLin);

  // Clamp and convert to hex
  const toHex = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(bb)}`;
}
