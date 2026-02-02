/**
 * Chart Configuration
 * Default settings for animation timing, styles, and rendering
 *
 * Key learnings applied:
 * - Longer hold time at end (3+ seconds) for readability
 * - Higher resolution (800+) for crisp text
 * - Bold fonts render better in GIFs
 * - 45-60 animation frames is smooth enough
 */

var ChartConfig = {

  // Animation timing defaults
  animation: {
    fps: 20,
    frameDelay: 50,           // ms per frame during animation
    holdDelay: 60,            // ms per frame during hold
    totalFrames: 50,          // frames for main animation
    holdFrames: 50,           // frames to hold at end (~3 seconds)
    staggerDelay: 0.10,       // delay between items (as fraction of total)
    easing: 'easeOutCubic'
  },

  // Canvas size presets
  sizes: {
    square: { width: 800, height: 800 },
    squareLarge: { width: 1080, height: 1080 },
    landscape: { width: 900, height: 600 },
    landscapeWide: { width: 1000, height: 700 },
    twitter: { width: 1200, height: 628 },
    story: { width: 1080, height: 1920 }
  },

  // Style presets
  styles: {
    dark: {
      name: 'Dark Mode',
      background: '#0D1117',
      text: '#E6EDF3',
      textMuted: '#8B949E',
      gridLine: '#30363D',
      colors: ['#58A6FF', '#3FB950', '#A371F7', '#F78166', '#D29922', '#79C0FF', '#7EE787', '#FF7B72'],
      fontFamily: 'Arial, sans-serif'
    },
    light: {
      name: 'Light Mode',
      background: '#FFFFFF',
      text: '#24292F',
      textMuted: '#57606A',
      gridLine: '#D0D7DE',
      colors: ['#0969DA', '#1A7F37', '#8250DF', '#CF222E', '#BF8700', '#0550AE', '#116329', '#A40E26'],
      fontFamily: 'Arial, sans-serif'
    },
    vibrant: {
      name: 'Vibrant',
      background: '#FFFFFF',
      text: '#1A1A2E',
      textMuted: '#6B7280',
      gridLine: '#E5E7EB',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9FF3', '#54A0FF'],
      fontFamily: 'Arial, sans-serif'
    },
    corporate: {
      name: 'Corporate',
      background: '#FFFFFF',
      text: '#2C3E50',
      textMuted: '#7F8C8D',
      gridLine: '#ECF0F1',
      colors: ['#3498DB', '#2ECC71', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C', '#34495E', '#E67E22'],
      fontFamily: 'Arial, sans-serif'
    },
    minimal: {
      name: 'Minimal',
      background: '#FAFAFA',
      text: '#333333',
      textMuted: '#888888',
      gridLine: '#EEEEEE',
      colors: ['#333333', '#666666', '#999999', '#BBBBBB', '#555555', '#777777', '#444444', '#AAAAAA'],
      fontFamily: 'Arial, sans-serif'
    }
  },

  // Chart type specific defaults
  charts: {
    pie: {
      showLegend: true,
      showPercentages: true,
      innerRadius: 0,  // 0 for pie, 0.5+ for donut
      animationType: 'sequential'
    },
    bar: {
      orientation: 'vertical',
      showValues: true,
      showGrid: true,
      barRadius: 6
    },
    line: {
      showPoints: true,
      showArea: true,
      showValues: true,
      showGrid: true,
      lineWidth: 4,
      pointRadius: 6
    },
    progress: {
      showBackground: true,
      barRadius: 20,
      circular: false
    },
    counter: {
      decimals: 0,
      prefix: '',
      suffix: ''
    },
    timeline: {
      orientation: 'vertical',
      alternating: true
    },
    sankey: {
      nodeWidth: 24,
      flowOpacity: 0.5
    }
  },

  // Get merged config for a chart type
  getConfig: function(chartType, userOptions) {
    var defaults = this.charts[chartType] || {};
    var config = {};

    // Merge defaults
    for (var key in defaults) {
      config[key] = defaults[key];
    }

    // Merge user options
    if (userOptions) {
      for (var key in userOptions) {
        config[key] = userOptions[key];
      }
    }

    return config;
  },

  // Get style by name
  getStyle: function(styleName) {
    return this.styles[styleName] || this.styles.dark;
  },

  // Get size by name
  getSize: function(sizeName) {
    return this.sizes[sizeName] || this.sizes.square;
  }
};

// Easing functions
var Easing = {
  linear: function(t) { return t; },
  easeOutCubic: function(t) { return 1 - Math.pow(1 - t, 3); },
  easeInCubic: function(t) { return t * t * t; },
  easeInOutCubic: function(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  easeOutQuad: function(t) { return 1 - (1 - t) * (1 - t); },
  easeOutBack: function(t) {
    var c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: function(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChartConfig: ChartConfig, Easing: Easing };
}
