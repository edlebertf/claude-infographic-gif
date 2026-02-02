/**
 * Animated Timeline Template
 * Events appear sequentially along a timeline
 */

class TimelineTemplate {
  constructor(generator, style, animationEngine) {
    this.generator = generator;
    this.style = style;
    this.animation = animationEngine;
    this.ctx = generator.getContext();
  }

  /**
   * Generate vertical timeline animation
   * @param {Array} events - Array of {date, title, description}
   * @param {Object} options - Animation options
   */
  async generateVertical(events, options = {}) {
    const {
      title = '',
      duration = 800,
      staggerDelay = 400,
      startDelay = 500,
      endPause = 1500,
      easing = 'easeOutCubic',
      lineWidth = 4,
      dotRadius = 12,
      showConnector = true,
      alternating = true
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
    const padding = { top: title ? 120 : 80, bottom: 80 };

    // Generate staggered animation
    const sequence = this.animation.generateStaggeredSequence(events.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();
    const timelineHeight = height - padding.top - padding.bottom;
    const eventSpacing = timelineHeight / (events.length + 1);
    const centerX = width / 2;

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

      // Calculate how much of the line to draw
      let maxProgress = 0;
      let lastEventY = padding.top;
      events.forEach((event, index) => {
        const progress = frameData.items[index];
        if (progress > 0) {
          maxProgress = index + progress;
          lastEventY = padding.top + eventSpacing * (index + 1);
        }
      });

      // Draw timeline line (grows with animation)
      if (showConnector && maxProgress > 0) {
        const lineEndY = padding.top + eventSpacing * (maxProgress + 0.5);

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, padding.top + eventSpacing * 0.5);
        this.ctx.lineTo(centerX, Math.min(lineEndY, height - padding.bottom));
        this.ctx.strokeStyle = secondaryColor || this.lightenColor(accentColor, 0.6);
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
      }

      // Draw each event
      events.forEach((event, index) => {
        const progress = frameData.items[index];
        if (progress <= 0) return;

        const y = padding.top + eventSpacing * (index + 1);
        const isLeft = alternating ? index % 2 === 0 : true;
        const color = colors ? colors[index % colors.length] : accentColor;

        // Draw connecting dot
        const dotScale = Math.min(1, progress * 2);
        this.ctx.beginPath();
        this.ctx.arc(centerX, y, dotRadius * dotScale, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Inner dot
        this.ctx.beginPath();
        this.ctx.arc(centerX, y, (dotRadius - 4) * dotScale, 0, Math.PI * 2);
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fill();

        // Calculate content position
        const contentX = isLeft ? centerX - 50 : centerX + 50;
        const textAlign = isLeft ? 'right' : 'left';
        const opacity = Math.min(1, (progress - 0.3) / 0.7);

        if (opacity > 0) {
          this.ctx.globalAlpha = opacity;

          // Draw date/time badge
          this.ctx.font = valueFont || `bold ${Math.round(width * 0.025)}px Arial`;
          this.ctx.fillStyle = color;
          this.ctx.textAlign = textAlign;
          this.ctx.textBaseline = 'bottom';
          this.ctx.fillText(event.date, contentX, y - 5);

          // Draw title
          this.ctx.font = titleFont || `bold ${Math.round(width * 0.032)}px Arial`;
          this.ctx.fillStyle = textColor;
          this.ctx.textBaseline = 'top';
          this.ctx.fillText(event.title, contentX, y + 5);

          // Draw description
          if (event.description) {
            this.ctx.font = labelFont || `${Math.round(width * 0.022)}px Arial`;
            this.ctx.fillStyle = this.lightenColor(textColor, 0.3);

            const maxWidth = width * 0.35;
            this.wrapText(event.description, contentX, y + 40, maxWidth, 24, textAlign);
          }

          this.ctx.globalAlpha = 1;
        }
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Generate horizontal timeline animation
   * @param {Array} events - Array of {date, title, description}
   * @param {Object} options - Animation options
   */
  async generateHorizontal(events, options = {}) {
    const {
      title = '',
      duration = 800,
      staggerDelay = 300,
      startDelay = 500,
      endPause = 1500,
      easing = 'easeOutCubic',
      lineWidth = 4,
      dotRadius = 12,
      alternating = true
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
    const padding = { left: 80, right: 80 };
    const centerY = height / 2;

    const sequence = this.animation.generateStaggeredSequence(events.length, {
      itemDuration: duration,
      staggerDelay,
      startDelay,
      endPause,
      easing
    });

    const frameDelay = this.generator.getFrameDelay();
    const timelineWidth = width - padding.left - padding.right;
    const eventSpacing = timelineWidth / (events.length + 1);

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

      // Calculate line progress
      let maxProgress = 0;
      events.forEach((event, index) => {
        const progress = frameData.items[index];
        if (progress > 0) {
          maxProgress = index + progress;
        }
      });

      // Draw timeline line
      if (maxProgress > 0) {
        const lineEndX = padding.left + eventSpacing * (maxProgress + 0.5);

        this.ctx.beginPath();
        this.ctx.moveTo(padding.left + eventSpacing * 0.5, centerY);
        this.ctx.lineTo(Math.min(lineEndX, width - padding.right), centerY);
        this.ctx.strokeStyle = secondaryColor || this.lightenColor(accentColor, 0.6);
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
      }

      // Draw each event
      events.forEach((event, index) => {
        const progress = frameData.items[index];
        if (progress <= 0) return;

        const x = padding.left + eventSpacing * (index + 1);
        const isTop = alternating ? index % 2 === 0 : true;
        const color = colors ? colors[index % colors.length] : accentColor;

        // Draw dot
        const dotScale = Math.min(1, progress * 2);
        this.ctx.beginPath();
        this.ctx.arc(x, centerY, dotRadius * dotScale, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Inner dot
        this.ctx.beginPath();
        this.ctx.arc(x, centerY, (dotRadius - 4) * dotScale, 0, Math.PI * 2);
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fill();

        // Content position
        const contentY = isTop ? centerY - 40 : centerY + 40;
        const textBaseline = isTop ? 'bottom' : 'top';
        const opacity = Math.min(1, (progress - 0.3) / 0.7);

        if (opacity > 0) {
          this.ctx.globalAlpha = opacity;

          // Draw date
          this.ctx.font = valueFont || `bold ${Math.round(width * 0.02)}px Arial`;
          this.ctx.fillStyle = color;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = textBaseline;

          const dateY = isTop ? contentY : contentY;
          this.ctx.fillText(event.date, x, dateY);

          // Draw title
          this.ctx.font = labelFont || `bold ${Math.round(width * 0.025)}px Arial`;
          this.ctx.fillStyle = textColor;

          const titleY = isTop ? contentY - 25 : contentY + 25;
          this.ctx.fillText(event.title, x, titleY);

          this.ctx.globalAlpha = 1;
        }
      });

      this.generator.addFrame(frameDelay);
    }
  }

  /**
   * Wrap text to max width
   */
  wrapText(text, x, y, maxWidth, lineHeight, align = 'left') {
    const words = text.split(' ');
    let line = '';

    this.ctx.textAlign = align;

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
  module.exports = TimelineTemplate;
}
