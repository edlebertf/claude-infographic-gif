/**
 * Color Utilities
 * Color manipulation, palette generation, and accessibility helpers
 */

class ColorUtils {
  /**
   * Convert hex to RGB object
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Convert hex to HSL object
   */
  static hexToHsl(hex) {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Convert HSL to hex
   */
  static hslToHex(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return ColorUtils.rgbToHex(r * 255, g * 255, b * 255);
  }

  /**
   * Lighten a color by percentage
   */
  static lighten(hex, percent) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return hex;
    hsl.l = Math.min(100, hsl.l + percent);
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Darken a color by percentage
   */
  static darken(hex, percent) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return hex;
    hsl.l = Math.max(0, hsl.l - percent);
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Adjust saturation
   */
  static saturate(hex, percent) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return hex;
    hsl.s = Math.min(100, hsl.s + percent);
    return ColorUtils.hslToHex(hsl.h, hsl.s, hsl.l);
  }

  /**
   * Calculate relative luminance for contrast calculations
   */
  static getLuminance(hex) {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(hex1, hex2) {
    const l1 = ColorUtils.getLuminance(hex1);
    const l2 = ColorUtils.getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
   */
  static meetsContrastAA(hex1, hex2) {
    return ColorUtils.getContrastRatio(hex1, hex2) >= 4.5;
  }

  /**
   * Get optimal text color (black or white) for a background
   */
  static getTextColor(bgHex) {
    const luminance = ColorUtils.getLuminance(bgHex);
    return luminance > 0.179 ? '#000000' : '#FFFFFF';
  }

  /**
   * Generate a color palette from a base color
   */
  static generatePalette(baseHex, count = 5) {
    const hsl = ColorUtils.hexToHsl(baseHex);
    if (!hsl) return [baseHex];

    const palette = [];
    const hueStep = 360 / count;

    for (let i = 0; i < count; i++) {
      const newHue = (hsl.h + i * hueStep) % 360;
      palette.push(ColorUtils.hslToHex(newHue, hsl.s, hsl.l));
    }

    return palette;
  }

  /**
   * Generate complementary color
   */
  static getComplementary(hex) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return hex;
    const newHue = (hsl.h + 180) % 360;
    return ColorUtils.hslToHex(newHue, hsl.s, hsl.l);
  }

  /**
   * Generate analogous colors (adjacent on color wheel)
   */
  static getAnalogous(hex, angle = 30) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return [hex];

    return [
      ColorUtils.hslToHex((hsl.h - angle + 360) % 360, hsl.s, hsl.l),
      hex,
      ColorUtils.hslToHex((hsl.h + angle) % 360, hsl.s, hsl.l)
    ];
  }

  /**
   * Generate triadic colors
   */
  static getTriadic(hex) {
    const hsl = ColorUtils.hexToHsl(hex);
    if (!hsl) return [hex];

    return [
      hex,
      ColorUtils.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      ColorUtils.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ];
  }

  /**
   * Create gradient color stops
   */
  static createGradientStops(color1, color2, steps = 5) {
    const stops = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const rgb1 = ColorUtils.hexToRgb(color1);
      const rgb2 = ColorUtils.hexToRgb(color2);

      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

      stops.push(ColorUtils.rgbToHex(r, g, b));
    }
    return stops;
  }

  /**
   * Apply opacity to a hex color and return rgba string
   */
  static withOpacity(hex, opacity) {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  /**
   * Predefined chart color palettes
   */
  static palettes = {
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
    corporate: ['#2C3E50', '#3498DB', '#1ABC9C', '#9B59B6', '#E74C3C', '#F39C12', '#27AE60', '#7F8C8D'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD9BA', '#E0BBE4', '#957DAD', '#D4A5A5'],
    neon: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#00FFFF', '#FFFF00', '#FF00FF', '#80FF00'],
    earth: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#BC8F8F', '#A0522D', '#DAA520'],
    ocean: ['#006994', '#40E0D0', '#00CED1', '#20B2AA', '#48D1CC', '#5F9EA0', '#4682B4', '#6495ED'],
    sunset: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E', '#FF9F1C', '#E63946', '#F4A261'],
    minimal: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9', '#74B9FF', '#0984E3', '#00B894', '#55EFC4']
  };

  /**
   * Get a palette by name
   */
  static getPalette(name) {
    return ColorUtils.palettes[name] || ColorUtils.palettes.vibrant;
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorUtils;
}
