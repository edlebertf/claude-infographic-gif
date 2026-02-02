/**
 * Counter Animation Template
 * Animated number counting up to a final value
 */

class CounterTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate counter animation
   * @param {Object} data - Counter data {value, label, prefix, suffix}
   * @param {Object} options - Animation options
   */
  async generate(data, options = {}) {
    const {
      duration = 2000,
      startDelay = 300,
      endPause = 1000,
      easing = 'easeOutCubic',
      decimals = 0
    } = options;

    const {
      value,
      label = '',
      prefix = '',
      suffix = ''
    } = data;

    // Get style settings
    const {
      backgroundColor,
      textColor,
      accentColor,
      titleFont,
      valueFont,
      labelFont
    } = this.style;

    // Generate animation frames
    const frames = this.animation.generateCounterFrames(value, {
      startValue: 0,
      duration,
      startDelay,
      endPause,
      easing,
      decimals
    });

    const frameDelay = this.generator.getFrameDelay();

    // Render each frame
    for (const frame of frames) {
      this.renderFrame(frame, {
        label,
        prefix,
        suffix,
        decimals,
        backgroundColor,
        textColor,
        accentColor,
        titleFont,
        valueFont,
        labelFont
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Render a single frame
   */
  renderFrame(frame, config) {
    const {
      label,
      prefix,
      suffix,
      decimals,
      backgroundColor,
      textColor,
      accentColor,
      titleFont,
      valueFont,
      labelFont
    } = config;

    const width = this.generator.width;
    const height = this.generator.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    this.generator.clear(backgroundColor);

    // Format the current value
    const displayValue = this.formatNumber(frame.value, decimals, prefix, suffix);

    // Draw the counter value (centered)
    this.ctx.font = valueFont || `bold ${Math.round(width * 0.15)}px Arial`;
    this.ctx.fillStyle = accentColor || textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(displayValue, centerX, centerY);

    // Draw label below if provided
    if (label) {
      this.ctx.font = labelFont || `${Math.round(width * 0.04)}px Arial`;
      this.ctx.fillStyle = textColor;
      this.ctx.fillText(label, centerX, centerY + height * 0.12);
    }
  }

  /**
   * Format number with thousands separator
   */
  formatNumber(num, decimals, prefix, suffix) {
    const fixed = num.toFixed(decimals);
    const [integer, decimal] = fixed.split('.');
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const result = decimal ? `${formatted}.${decimal}` : formatted;
    return `${prefix}${result}${suffix}`;
  }
}

/**
 * Multi-Counter Template
 * Multiple counters animating simultaneously
 */
class MultiCounterTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate multi-counter animation
   * @param {Array} items - Array of {value, label, prefix, suffix}
   * @param {Object} options - Animation options
   */
  async generate(items, options = {}) {
    const {
      duration = 2000,
      startDelay = 300,
      endPause = 1000,
      staggerDelay = 200,
      easing = 'easeOutCubic'
    } = options;

    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      titleFont,
      valueFont,
      labelFont
    } = this.style;

    // Generate staggered sequence
    const sequence = this.animation.generateStaggeredSequence(items.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();

    // Render each frame
    for (const frameData of sequence) {
      this.renderFrame(frameData, items, {
        backgroundColor,
        textColor,
        accentColor,
        colors,
        valueFont,
        labelFont
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Render a single frame with multiple counters
   */
  renderFrame(frameData, items, config) {
    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      valueFont,
      labelFont
    } = config;

    const width = this.generator.width;
    const height = this.generator.height;
    const padding = width * 0.08;
    const itemCount = items.length;

    // Clear canvas
    this.generator.clear(backgroundColor);

    // Calculate layout
    const columns = itemCount <= 2 ? itemCount : itemCount <= 4 ? 2 : 3;
    const rows = Math.ceil(itemCount / columns);
    const cellWidth = (width - padding * 2) / columns;
    const cellHeight = (height - padding * 2) / rows;

    // Draw each counter
    items.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = padding + col * cellWidth + cellWidth / 2;
      const y = padding + row * cellHeight + cellHeight / 2;

      const progress = frameData.items[index];
      const currentValue = item.value * progress;
      const color = colors ? colors[index % colors.length] : accentColor;

      // Draw value
      const displayValue = this.formatNumber(
        currentValue,
        item.decimals || 0,
        item.prefix || '',
        item.suffix || ''
      );

      this.ctx.font = valueFont || `bold ${Math.round(cellHeight * 0.25)}px Arial`;
      this.ctx.fillStyle = color || textColor;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(displayValue, x, y - cellHeight * 0.05);

      // Draw label
      if (item.label) {
        this.ctx.font = labelFont || `${Math.round(cellHeight * 0.1)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.fillText(item.label, x, y + cellHeight * 0.15);
      }
    });
  }

  formatNumber(num, decimals, prefix, suffix) {
    const fixed = num.toFixed(decimals);
    const [integer, decimal] = fixed.split('.');
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const result = decimal ? `${formatted}.${decimal}` : formatted;
    return `${prefix}${result}${suffix}`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CounterTemplate, MultiCounterTemplate };
}
