/**
 * Animated Pie Chart Template
 * Segments draw in sequentially with smooth animation
 */

class PieChartTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate pie chart animation
   * @param {Array} data - Array of {label, value}
   * @param {Object} options - Chart and animation options
   */
  async generate(data, options = {}) {
    const {
      title = '',
      duration = 2000,
      startDelay = 400,
      endPause = 1200,
      easing = 'easeOutCubic',
      showLabels = true,
      showPercentages = true,
      showLegend = true,
      innerRadius = 0, // 0 for pie, > 0 for donut
      animationType = 'sequential' // 'sequential' or 'simultaneous'
    } = options;

    const {
      backgroundColor,
      textColor,
      colors,
      titleFont,
      labelFont
    } = this.style;

    const width = this.generator.width;
    const height = this.generator.height;

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Calculate angles for each segment
    let currentAngle = -Math.PI / 2; // Start from top
    const segments = data.map((item, index) => {
      const angle = (item.value / total) * Math.PI * 2;
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        percentage: ((item.value / total) * 100).toFixed(1),
        color: colors[index % colors.length]
      };
      currentAngle += angle;
      return segment;
    });

    // Chart dimensions
    const chartCenterX = showLegend ? width * 0.4 : width / 2;
    const chartCenterY = title ? height * 0.52 : height / 2;
    const outerRadius = Math.min(width, height) * 0.32;
    const innerRad = outerRadius * innerRadius;

    // Generate animation frames
    const frameDelay = this.generator.getFrameDelay();
    let frames;

    if (animationType === 'sequential') {
      frames = this.animation.generateStaggeredSequence(segments.length, {
        itemDuration: duration / segments.length,
        staggerDelay: duration / segments.length * 0.8,
        startDelay,
        endPause,
        easing
      });
    } else {
      frames = this.animation.generateFrameTimestamps(duration, {
        startDelay,
        endPause,
        easing
      }).map(f => ({ ...f, items: segments.map(() => f.progress) }));
    }

    // Render each frame
    for (const frameData of frames) {
      this.generator.clear(backgroundColor);

      // Draw title
      if (title) {
        this.ctx.font = titleFont || `bold ${Math.round(width * 0.045)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(title, width / 2, 40);
      }

      // Draw pie segments
      segments.forEach((segment, index) => {
        const progress = animationType === 'sequential'
          ? frameData.items[index]
          : frameData.progress;

        if (progress > 0) {
          this.drawSegment(
            chartCenterX,
            chartCenterY,
            innerRad,
            outerRadius,
            segment.startAngle,
            segment.startAngle + (segment.endAngle - segment.startAngle) * progress,
            segment.color
          );
        }
      });

      // Draw center circle for donut chart
      if (innerRadius > 0) {
        this.ctx.beginPath();
        this.ctx.arc(chartCenterX, chartCenterY, innerRad - 2, 0, Math.PI * 2);
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fill();
      }

      // Draw labels on segments
      if (showLabels || showPercentages) {
        segments.forEach((segment, index) => {
          const progress = animationType === 'sequential'
            ? frameData.items[index]
            : frameData.progress;

          if (progress >= 0.8) {
            const midAngle = segment.startAngle + (segment.endAngle - segment.startAngle) / 2;
            const labelRadius = innerRadius > 0
              ? (innerRad + outerRadius) / 2
              : outerRadius * 0.65;

            const labelX = chartCenterX + Math.cos(midAngle) * labelRadius;
            const labelY = chartCenterY + Math.sin(midAngle) * labelRadius;

            // Only show percentage for larger segments
            const segmentAngle = segment.endAngle - segment.startAngle;
            if (showPercentages && segmentAngle > 0.3) {
              this.ctx.font = `bold ${Math.round(width * 0.028)}px Arial`;
              this.ctx.fillStyle = this.getContrastColor(segment.color);
              this.ctx.textAlign = 'center';
              this.ctx.textBaseline = 'middle';
              this.ctx.fillText(`${segment.percentage}%`, labelX, labelY);
            }
          }
        });
      }

      // Draw legend
      if (showLegend) {
        this.drawLegend(segments, frameData, width, height, animationType, textColor, labelFont);
      }

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Draw a pie segment
   */
  drawSegment(cx, cy, innerRadius, outerRadius, startAngle, endAngle, color) {
    this.ctx.beginPath();

    if (innerRadius > 0) {
      // Donut segment
      this.ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
      this.ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
    } else {
      // Pie segment
      this.ctx.moveTo(cx, cy);
      this.ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
    }

    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();

    // Add subtle border
    this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Draw legend
   */
  drawLegend(segments, frameData, width, height, animationType, textColor, labelFont) {
    const legendX = width * 0.68;
    const legendStartY = height * 0.3;
    const itemHeight = Math.min(50, (height * 0.5) / segments.length);
    const boxSize = itemHeight * 0.4;

    segments.forEach((segment, index) => {
      const progress = animationType === 'sequential'
        ? frameData.items[index]
        : frameData.progress;

      const y = legendStartY + index * itemHeight;
      const opacity = Math.min(1, progress * 2);

      if (opacity > 0) {
        this.ctx.globalAlpha = opacity;

        // Color box
        this.ctx.fillStyle = segment.color;
        this.ctx.fillRect(legendX, y, boxSize, boxSize);

        // Label
        this.ctx.font = labelFont || `${Math.round(width * 0.025)}px Arial`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(segment.label, legendX + boxSize + 15, y + boxSize / 2);

        // Value
        this.ctx.font = `bold ${Math.round(width * 0.022)}px Arial`;
        this.ctx.fillText(
          `${segment.percentage}%`,
          legendX + boxSize + 15,
          y + boxSize / 2 + 22
        );

        this.ctx.globalAlpha = 1;
      }
    });
  }

  /**
   * Get contrasting text color for a background
   */
  getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}

/**
 * Donut Chart Template (convenience wrapper)
 */
class DonutChartTemplate extends PieChartTemplate {
  async generate(data, options = {}) {
    return super.generate(data, {
      ...options,
      innerRadius: options.innerRadius || 0.5
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PieChartTemplate, DonutChartTemplate };
}
