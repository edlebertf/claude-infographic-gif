/**
 * Animated Progress Bar Template
 * Progress bars fill from left to right with percentages
 */

class ProgressBarTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate progress bar animation
   * @param {Array} items - Array of {label, value, unit}
   * @param {Object} options - Animation options
   */
  async generate(items, options = {}) {
    const {
      title = '',
      duration = 1500,
      staggerDelay = 200,
      startDelay = 400,
      endPause = 1200,
      easing = 'easeOutCubic',
      showPercentages = true,
      barHeight = 40,
      barRadius = 20, // Fully rounded by default
      showBackground = true
    } = options;

    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      secondaryColor,
      titleFont,
      labelFont,
      valueFont
    } = this.style;

    const width = this.generator.width;
    const height = this.generator.height;
    const padding = { top: title ? 120 : 80, right: 80, bottom: 80, left: 80 };

    // Generate staggered animation sequence
    const sequence = this.animation.generateStaggeredSequence(items.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();
    const chartWidth = width - padding.left - padding.right;
    const totalHeight = height - padding.top - padding.bottom;
    const itemSpacing = Math.min(100, totalHeight / items.length);
    const actualBarHeight = Math.min(barHeight, itemSpacing * 0.5);

    // Calculate vertical centering
    const totalItemsHeight = items.length * itemSpacing;
    const startY = padding.top + (totalHeight - totalItemsHeight) / 2;

    // Render each frame
    for (const frameData of sequence) {
      this.generator.clear(backgroundColor);

      // Draw title
      if (title) {
        this.ctx.font = titleFont || `bold ${Math.round(width * 0.045)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(title, width / 2, 40);
      }

      // Draw each progress bar
      items.forEach((item, index) => {
        const progress = frameData.items[index];
        const y = startY + index * itemSpacing;
        const color = colors ? colors[index % colors.length] : accentColor;
        const bgColor = secondaryColor || this.lightenColor(color, 0.8);

        // Draw label
        this.ctx.font = labelFont || `${Math.round(width * 0.03)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(item.label, padding.left, y - 8);

        // Draw percentage on the right
        if (showPercentages) {
          const currentValue = Math.round(item.value * progress);
          const valueText = `${currentValue}${item.unit || '%'}`;

          this.ctx.font = valueFont || `bold ${Math.round(width * 0.03)}px Arial`;
          this.ctx.textAlign = 'right';
          this.ctx.fillText(valueText, width - padding.right, y - 8);
        }

        // Draw background bar
        if (showBackground) {
          this.drawRoundedBar(
            padding.left,
            y,
            chartWidth,
            actualBarHeight,
            barRadius,
            bgColor
          );
        }

        // Draw progress bar
        const progressWidth = (item.value / 100) * chartWidth * progress;
        if (progressWidth > 0) {
          this.drawRoundedBar(
            padding.left,
            y,
            progressWidth,
            actualBarHeight,
            barRadius,
            color
          );
        }
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Generate circular progress animation
   * @param {Array} items - Array of {label, value, unit}
   * @param {Object} options - Animation options
   */
  async generateCircular(items, options = {}) {
    const {
      title = '',
      duration = 2000,
      staggerDelay = 300,
      startDelay = 400,
      endPause = 1200,
      easing = 'easeOutCubic',
      strokeWidth = 20,
      showCenter = true
    } = options;

    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      secondaryColor,
      titleFont,
      labelFont,
      valueFont
    } = this.style;

    const width = this.generator.width;
    const height = this.generator.height;

    // Generate animation
    const sequence = this.animation.generateStaggeredSequence(items.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();

    // Layout calculation
    const cols = items.length <= 2 ? items.length : items.length <= 4 ? 2 : 3;
    const rows = Math.ceil(items.length / cols);
    const cellWidth = width / cols;
    const cellHeight = (height - (title ? 100 : 0)) / rows;
    const radius = Math.min(cellWidth, cellHeight) * 0.3;

    for (const frameData of sequence) {
      this.generator.clear(backgroundColor);

      // Draw title
      if (title) {
        this.ctx.font = titleFont || `bold ${Math.round(width * 0.045)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(title, width / 2, 40);
      }

      // Draw each circular progress
      items.forEach((item, index) => {
        const progress = frameData.items[index];
        const col = index % cols;
        const row = Math.floor(index / cols);
        const centerX = cellWidth * (col + 0.5);
        const centerY = (title ? 100 : 0) + cellHeight * (row + 0.5);
        const color = colors ? colors[index % colors.length] : accentColor;
        const bgColor = secondaryColor || this.lightenColor(color, 0.85);

        // Draw background circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = bgColor;
        this.ctx.lineWidth = strokeWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        // Draw progress arc
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (Math.PI * 2 * (item.value / 100) * progress);

        if (progress > 0) {
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = strokeWidth;
          this.ctx.lineCap = 'round';
          this.ctx.stroke();
        }

        // Draw center value
        if (showCenter) {
          const currentValue = Math.round(item.value * progress);
          this.ctx.font = valueFont || `bold ${Math.round(radius * 0.5)}px Arial`;
          this.ctx.fillStyle = textColor;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(`${currentValue}${item.unit || '%'}`, centerX, centerY);
        }

        // Draw label below
        this.ctx.font = labelFont || `${Math.round(width * 0.025)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(item.label, centerX, centerY + radius + strokeWidth + 15);
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Draw rounded bar
   */
  drawRoundedBar(x, y, width, height, radius, color) {
    if (width <= 0) return;

    const r = Math.min(radius, height / 2, width / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * Lighten a hex color
   */
  lightenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressBarTemplate;
}
