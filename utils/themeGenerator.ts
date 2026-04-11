import { ThemeColors } from '../constants/types';

/**
 * Generates a full StudyNest theme palette from a single primary brand color.
 */
export function generateThemeFromColor(primary: string, isDark: boolean): ThemeColors {
  const hex = primary.startsWith('#') ? primary.slice(1) : primary;
  
  // Convert HEX to HSL roughly
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const h_deg = h * 360;
  const s_pct = s * 100;
  
  const hsl = (l_override: number, s_override?: number) => 
    `hsl(${h_deg}, ${s_override ?? s_pct}%, ${l_override}%)`;

  if (!isDark) {
    return {
      bg:      hsl(97, 20), // Soft off-white with hint of brand
      bg2:     hsl(93, 25),
      bg3:     hsl(88, 30),
      card:    hsl(100),    // Pure white
      card2:   hsl(98),
      text:    hsl(10, 30), // Very dark gray with hint of brand
      text2:   hsl(25, 20),
      text3:   hsl(45, 15),
      accent:  primary,
      accent2: hsl(Math.min(l * 100 + 15, 70)), // Lighter variant
      accent3: `hsl(${(h_deg + 140) % 360}, 50%, 45%)`, // Harmony color (greenish/blueish)
      border:  hsl(90, 15),
      border2: hsl(85, 20),
      red:     '#C0392B',
      blue:    '#2C5F8A',
    };
  } else {
    return {
      bg:      hsl(5, 15),  // Deep dark gray
      bg2:     hsl(8, 20),
      bg3:     hsl(12, 25),
      card:    hsl(10, 18), 
      card2:   hsl(14, 20),
      text:    hsl(95, 10), // Off-white text
      text2:   hsl(85, 15),
      text3:   hsl(60, 10),
      accent:  hsl(Math.max(l * 100, 50), Math.min(s_pct + 10, 90)), // Boosted accent
      accent2: hsl(Math.max(l * 100 + 20, 70)),
      accent3: `hsl(${(h_deg + 140) % 360}, 60%, 65%)`,
      border:  hsl(20, 15),
      border2: hsl(25, 20),
      red:     '#FF4F4F',
      blue:    '#5A90FF',
    };
  }
}
