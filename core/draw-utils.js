/**
 * Drawing Utilities
 * Common drawing functions used across all chart types
 *
 * Key learnings applied:
 * - Bold fonts for GIF clarity
 * - Rounded rectangles look more modern
 * - Text baseline/alignment matters for positioning
 * - Consistent styling helpers
 */

var DrawUtils = {

  /**
   * Draw rounded rectangle
   */
  roundRect: function(ctx, x, y, width, height, radius) {
    if (width <= 0 || height <= 0) return;
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  /**
   * Draw filled rounded rectangle
   */
  fillRoundRect: function(ctx, x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    this.roundRect(ctx, x, y, width, height, radius);
    ctx.fill();
  },

  /**
   * Draw vertical bar with rounded top
   */
  drawVerticalBar: function(ctx, x, y, width, height, radius, color) {
    if (height <= 0) return;
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  /**
   * Draw horizontal bar with rounded right end
   */
  drawHorizontalBar: function(ctx, x, y, width, height, radius, color) {
    if (width <= 0) return;
    var r = Math.min(radius, height / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  /**
   * Draw pie/arc segment
   */
  drawPieSegment: function(ctx, cx, cy, radius, startAngle, endAngle, color, borderColor, borderWidth) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (borderColor && borderWidth) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
    }
  },

  /**
   * Draw donut/arc segment (hollow)
   */
  drawDonutSegment: function(ctx, cx, cy, outerRadius, innerRadius, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
    ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  /**
   * Draw a line with rounded caps
   */
  drawLine: function(ctx, x1, y1, x2, y2, color, width) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  },

  /**
   * Draw a circle/point
   */
  drawPoint: function(ctx, x, y, radius, fillColor, strokeColor, strokeWidth) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
  },

  /**
   * Draw a glow effect around a point
   */
  drawGlow: function(ctx, x, y, radius, color, opacity) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.colorWithOpacity(color, opacity || 0.3);
    ctx.fill();
  },

  /**
   * Draw text with common settings
   */
  drawText: function(ctx, text, x, y, options) {
    options = options || {};
    var fontSize = options.fontSize || 16;
    var fontWeight = options.bold ? 'bold ' : '';
    var fontFamily = options.fontFamily || 'Arial, sans-serif';

    ctx.font = fontWeight + fontSize + 'px ' + fontFamily;
    ctx.fillStyle = options.color || '#000000';
    ctx.textAlign = options.align || 'left';
    ctx.textBaseline = options.baseline || 'top';

    if (options.maxWidth) {
      ctx.fillText(text, x, y, options.maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }
  },

  /**
   * Draw centered title
   */
  drawTitle: function(ctx, text, x, y, style, fontSize) {
    this.drawText(ctx, text, x, y, {
      fontSize: fontSize,
      bold: true,
      color: style.text,
      align: 'center',
      baseline: 'middle',
      fontFamily: style.fontFamily
    });
  },

  /**
   * Draw subtitle
   */
  drawSubtitle: function(ctx, text, x, y, style, fontSize) {
    this.drawText(ctx, text, x, y, {
      fontSize: fontSize,
      color: style.textMuted,
      align: 'center',
      baseline: 'middle',
      fontFamily: style.fontFamily
    });
  },

  /**
   * Draw horizontal grid lines
   */
  drawHorizontalGrid: function(ctx, x, y, width, height, steps, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (var i = 0; i <= steps; i++) {
      var lineY = y + (height / steps) * i;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + width, lineY);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  },

  /**
   * Draw bezier curve flow (for Sankey)
   */
  drawFlow: function(ctx, x1, y1Top, y1Bottom, x2, y2Top, y2Bottom, color, progress, opacity) {
    var controlOffset = Math.abs(x2 - x1) * 0.5;

    ctx.globalAlpha = opacity * progress;
    ctx.fillStyle = color;
    ctx.beginPath();

    // Starting edge
    ctx.moveTo(x1, y1Top);

    // Calculate intermediate point based on progress
    var midX = x1 + (x2 - x1) * progress;
    var midY1Top = y1Top + (y2Top - y1Top) * progress;
    var midY1Bottom = y1Bottom + (y2Bottom - y1Bottom) * progress;

    // Top curve
    ctx.bezierCurveTo(
      x1 + controlOffset * progress, y1Top,
      midX - controlOffset * progress, midY1Top,
      midX, midY1Top
    );

    // Right edge
    ctx.lineTo(midX, midY1Bottom);

    // Bottom curve
    ctx.bezierCurveTo(
      midX - controlOffset * progress, midY1Bottom,
      x1 + controlOffset * progress, y1Bottom,
      x1, y1Bottom
    );

    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  /**
   * Convert hex color to rgba with opacity
   */
  colorWithOpacity: function(hex, opacity) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  },

  /**
   * Lighten a hex color
   */
  lightenColor: function(hex, factor) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);

    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);

    return '#' + r.toString(16).padStart(2, '0') +
                 g.toString(16).padStart(2, '0') +
                 b.toString(16).padStart(2, '0');
  },

  /**
   * Format number with thousands separator
   */
  formatNumber: function(num, decimals, prefix, suffix) {
    decimals = decimals || 0;
    prefix = prefix || '';
    suffix = suffix || '';

    var fixed = num.toFixed(decimals);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var formatted = parts.join('.');

    return prefix + formatted + suffix;
  },

  /**
   * Wrap text to fit width (returns array of lines)
   */
  wrapText: function(ctx, text, maxWidth) {
    var words = text.split(' ');
    var lines = [];
    var currentLine = '';

    for (var i = 0; i < words.length; i++) {
      var testLine = currentLine + (currentLine ? ' ' : '') + words[i];
      var metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DrawUtils;
}
