/**
 * Animated Bar Chart Template
 * Bars grow from 0 to final value with smooth animation
 */

class BarChartTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate horizontal bar chart animation
   * @param {Array} data - Array of {label, value}
   * @param {Object} options - Chart and animation options
   */
  async generateHorizontal(data, options = {}) {
    const {
      title = '',
      duration = 1500,
      staggerDelay = 150,
      startDelay = 400,
      endPause = 1200,
      easing = 'easeOutCubic',
      showValues = true,
      showGrid = false,
      barRadius = 8
    } = options;

    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      gridColor,
      titleFont,
      labelFont,
      valueFont
    } = this.style;

    const width = this.generator.width;
    const height = this.generator.height;
    const padding = { top: 120, right: 80, bottom: 60, left: 200 };

    // Calculate max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));

    // Generate staggered animation sequence
    const sequence = this.animation.generateStaggeredSequence(data.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barHeight = Math.min(60, (chartHeight / data.length) * 0.7);
    const barGap = (chartHeight - barHeight * data.length) / (data.length + 1);

    // Render each frame
    for (const frameData of sequence) {
      // Clear canvas
      this.generator.clear(backgroundColor);

      // Draw title
      if (title) {
        this.ctx.font = titleFont || `bold ${Math.round(width * 0.045)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(title, width / 2, 40);
      }

      // Draw grid lines if enabled
      if (showGrid) {
        this.drawGrid(padding, chartWidth, chartHeight, maxValue, gridColor || '#E0E0E0');
      }

      // Draw each bar
      data.forEach((item, index) => {
        const progress = frameData.items[index];
        const y = padding.top + barGap + index * (barHeight + barGap);
        const barWidth = (item.value / maxValue) * chartWidth * progress;
        const color = colors ? colors[index % colors.length] : accentColor;

        // Draw label
        this.ctx.font = labelFont || `${Math.round(width * 0.028)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.label, padding.left - 20, y + barHeight / 2);

        // Draw bar
        this.drawRoundedBar(
          padding.left,
          y,
          barWidth,
          barHeight,
          barRadius,
          color
        );

        // Draw value
        if (showValues && progress > 0.1) {
          const currentValue = Math.round(item.value * progress);
          const valueText = this.formatValue(currentValue, item);

          this.ctx.font = valueFont || `bold ${Math.round(width * 0.025)}px Arial`;
          this.ctx.fillStyle = barWidth > 80 ? '#FFFFFF' : textColor;
          this.ctx.textAlign = barWidth > 80 ? 'right' : 'left';
          this.ctx.textBaseline = 'middle';

          const valueX = barWidth > 80
            ? padding.left + barWidth - 15
            : padding.left + barWidth + 15;
          this.ctx.fillText(valueText, valueX, y + barHeight / 2);
        }
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Generate vertical bar chart animation
   * @param {Array} data - Array of {label, value}
   * @param {Object} options - Chart and animation options
   */
  async generateVertical(data, options = {}) {
    const {
      title = '',
      duration = 1500,
      staggerDelay = 150,
      startDelay = 400,
      endPause = 1200,
      easing = 'easeOutCubic',
      showValues = true,
      showGrid = true,
      barRadius = 8
    } = options;

    const {
      backgroundColor,
      textColor,
      accentColor,
      colors,
      gridColor,
      titleFont,
      labelFont,
      valueFont
    } = this.style;

    const width = this.generator.width;
    const height = this.generator.height;
    const padding = { top: 120, right: 60, bottom: 120, left: 80 };

    const maxValue = Math.max(...data.map(d => d.value));

    const sequence = this.animation.generateStaggeredSequence(data.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = Math.min(80, (chartWidth / data.length) * 0.7);
    const barGap = (chartWidth - barWidth * data.length) / (data.length + 1);

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

      // Draw grid
      if (showGrid) {
        this.drawVerticalGrid(padding, chartWidth, chartHeight, maxValue, gridColor || '#E0E0E0');
      }

      // Draw baseline
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, height - padding.bottom);
      this.ctx.lineTo(width - padding.right, height - padding.bottom);
      this.ctx.strokeStyle = gridColor || '#E0E0E0';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw each bar
      data.forEach((item, index) => {
        const progress = frameData.items[index];
        const x = padding.left + barGap + index * (barWidth + barGap);
        const barHeight = (item.value / maxValue) * chartHeight * progress;
        const y = height - padding.bottom - barHeight;
        const color = colors ? colors[index % colors.length] : accentColor;

        // Draw bar (growing from bottom)
        this.drawRoundedBarVertical(x, y, barWidth, barHeight, barRadius, color);

        // Draw label
        this.ctx.font = labelFont || `${Math.round(width * 0.025)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // Handle long labels
        const maxLabelWidth = barWidth + barGap * 0.8;
        this.wrapText(item.label, x + barWidth / 2, height - padding.bottom + 15, maxLabelWidth, 20);

        // Draw value
        if (showValues && progress > 0.1) {
          const currentValue = Math.round(item.value * progress);
          const valueText = this.formatValue(currentValue, item);

          this.ctx.font = valueFont || `bold ${Math.round(width * 0.022)}px Arial`;
          this.ctx.fillStyle = textColor;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'bottom';
          this.ctx.fillText(valueText, x + barWidth / 2, y - 8);
        }
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Draw rounded horizontal bar
   */
  drawRoundedBar(x, y, width, height, radius, color) {
    if (width <= 0) return;

    const r = Math.min(radius, height / 2, width / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x, y);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * Draw rounded vertical bar (rounded top corners only)
   */
  drawRoundedBarVertical(x, y, width, height, radius, color) {
    if (height <= 0) return;

    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  /**
   * Draw horizontal grid lines
   */
  drawGrid(padding, chartWidth, chartHeight, maxValue, color) {
    const gridLines = 5;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);

    for (let i = 0; i <= gridLines; i++) {
      const x = padding.left + (chartWidth / gridLines) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, padding.top);
      this.ctx.lineTo(x, padding.top + chartHeight);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  /**
   * Draw vertical grid lines
   */
  drawVerticalGrid(padding, chartWidth, chartHeight, maxValue, color) {
    const gridLines = 5;
    const width = this.generator.width;
    const height = this.generator.height;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);

    for (let i = 0; i <= gridLines; i++) {
      const y = height - padding.bottom - (chartHeight / gridLines) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  /**
   * Wrap text to fit width
   */
  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && n > 0) {
        this.ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line.trim(), x, y);
  }

  /**
   * Format value for display
   */
  formatValue(value, item) {
    const prefix = item.prefix || '';
    const suffix = item.suffix || item.unit || '';
    const formatted = value.toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BarChartTemplate;
}
