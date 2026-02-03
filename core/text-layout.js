/**
 * Text Layout Manager
 * Centralized system to prevent ALL text overlaps in any chart type.
 *
 * USAGE: Every chart template MUST use this system for placing text.
 *
 * 1. Create instance at start of render: var textMgr = new TextLayoutManager(ctx);
 * 2. For every text element, call: textMgr.placeText(text, x, y, options)
 * 3. The manager will automatically adjust position if overlap detected
 */

var TextLayoutManager = {

  /**
   * Create a new text layout manager instance
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} bounds - Chart bounds {x, y, width, height}
   * @returns {Object} Manager instance
   */
  create: function(ctx, bounds) {
    return {
      ctx: ctx,
      bounds: bounds || { x: 0, y: 0, width: ctx.canvas.width, height: ctx.canvas.height },
      placedRegions: [],  // Array of {x, y, width, height, priority}

      /**
       * Measure text dimensions
       */
      measureText: function(text, font) {
        var oldFont = this.ctx.font;
        if (font) this.ctx.font = font;
        var metrics = this.ctx.measureText(text);
        var width = metrics.width;
        var height = parseInt(this.ctx.font) || 14;  // Extract font size
        if (font) this.ctx.font = oldFont;
        return { width: width, height: height };
      },

      /**
       * Get bounding box for text at position with alignment
       */
      getTextBounds: function(text, x, y, align, baseline, font, padding) {
        var size = this.measureText(text, font);
        padding = padding || 4;
        var width = size.width + padding * 2;
        var height = size.height + padding * 2;

        var bx = x - padding;
        var by = y - padding;

        // Adjust for text alignment
        if (align === 'center') bx = x - width / 2;
        else if (align === 'right') bx = x - width + padding;

        // Adjust for baseline
        if (baseline === 'middle') by = y - height / 2;
        else if (baseline === 'bottom') by = y - height + padding;
        else if (baseline === 'top') by = y - padding;

        return { x: bx, y: by, width: width, height: height };
      },

      /**
       * Check if two rectangles overlap
       */
      rectsOverlap: function(a, b, margin) {
        margin = margin || 2;
        return !(a.x + a.width + margin < b.x ||
                 b.x + b.width + margin < a.x ||
                 a.y + a.height + margin < b.y ||
                 b.y + b.height + margin < a.y);
      },

      /**
       * Check if a region overlaps with any placed regions
       */
      hasOverlap: function(rect, margin) {
        for (var i = 0; i < this.placedRegions.length; i++) {
          if (this.rectsOverlap(rect, this.placedRegions[i], margin)) {
            return true;
          }
        }
        return false;
      },

      /**
       * Check if region is within bounds
       */
      isInBounds: function(rect, padding) {
        padding = padding || 5;
        return rect.x >= this.bounds.x + padding &&
               rect.y >= this.bounds.y + padding &&
               rect.x + rect.width <= this.bounds.x + this.bounds.width - padding &&
               rect.y + rect.height <= this.bounds.y + this.bounds.height - padding;
      },

      /**
       * Reserve a region (for non-text elements like bars, dots, etc.)
       */
      reserveRegion: function(x, y, width, height, priority) {
        this.placedRegions.push({
          x: x, y: y, width: width, height: height,
          priority: priority || 0
        });
      },

      /**
       * Find best position for text that doesn't overlap
       * Returns adjusted {x, y, align, baseline} or null if no valid position
       */
      findNonOverlappingPosition: function(text, preferredX, preferredY, options) {
        options = options || {};
        var font = options.font;
        var preferredAlign = options.align || 'left';
        var preferredBaseline = options.baseline || 'middle';
        var offsetDistance = options.offsetDistance || 15;

        // Try positions in order of preference
        var positions = [
          // Original position
          { x: preferredX, y: preferredY, align: preferredAlign, baseline: preferredBaseline },
          // Offset variations
          { x: preferredX + offsetDistance, y: preferredY, align: 'left', baseline: preferredBaseline },
          { x: preferredX - offsetDistance, y: preferredY, align: 'right', baseline: preferredBaseline },
          { x: preferredX, y: preferredY - offsetDistance, align: preferredAlign, baseline: 'bottom' },
          { x: preferredX, y: preferredY + offsetDistance, align: preferredAlign, baseline: 'top' },
          // Diagonal offsets
          { x: preferredX + offsetDistance, y: preferredY - offsetDistance * 0.7, align: 'left', baseline: 'bottom' },
          { x: preferredX - offsetDistance, y: preferredY - offsetDistance * 0.7, align: 'right', baseline: 'bottom' },
          { x: preferredX + offsetDistance, y: preferredY + offsetDistance * 0.7, align: 'left', baseline: 'top' },
          { x: preferredX - offsetDistance, y: preferredY + offsetDistance * 0.7, align: 'right', baseline: 'top' },
          // Larger offsets
          { x: preferredX + offsetDistance * 2, y: preferredY, align: 'left', baseline: preferredBaseline },
          { x: preferredX - offsetDistance * 2, y: preferredY, align: 'right', baseline: preferredBaseline }
        ];

        for (var i = 0; i < positions.length; i++) {
          var pos = positions[i];
          var bounds = this.getTextBounds(text, pos.x, pos.y, pos.align, pos.baseline, font);

          if (!this.hasOverlap(bounds, 3) && this.isInBounds(bounds)) {
            return pos;
          }
        }

        // If no valid position found, return the first one that's in bounds
        for (var i = 0; i < positions.length; i++) {
          var pos = positions[i];
          var bounds = this.getTextBounds(text, pos.x, pos.y, pos.align, pos.baseline, font);
          if (this.isInBounds(bounds)) {
            return pos;
          }
        }

        return positions[0];  // Fallback to original
      },

      /**
       * Place text with automatic overlap avoidance
       * Returns the actual position used
       */
      placeText: function(text, x, y, options) {
        options = options || {};
        var font = options.font;
        var align = options.align || 'left';
        var baseline = options.baseline || 'middle';
        var color = options.color || '#FFFFFF';
        var alpha = options.alpha !== undefined ? options.alpha : 1;
        var skipDraw = options.skipDraw || false;
        var forcePosition = options.forcePosition || false;

        var finalPos;

        if (forcePosition) {
          finalPos = { x: x, y: y, align: align, baseline: baseline };
        } else {
          finalPos = this.findNonOverlappingPosition(text, x, y, {
            font: font,
            align: align,
            baseline: baseline,
            offsetDistance: options.offsetDistance || 15
          });
        }

        // Register the region
        var bounds = this.getTextBounds(text, finalPos.x, finalPos.y, finalPos.align, finalPos.baseline, font);
        this.placedRegions.push({
          x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
          priority: options.priority || 0
        });

        // Draw if not skipped
        if (!skipDraw) {
          var oldAlpha = this.ctx.globalAlpha;
          var oldFont = this.ctx.font;

          this.ctx.globalAlpha = alpha;
          if (font) this.ctx.font = font;
          this.ctx.fillStyle = color;
          this.ctx.textAlign = finalPos.align;
          this.ctx.textBaseline = finalPos.baseline;
          this.ctx.fillText(text, finalPos.x, finalPos.y);

          this.ctx.globalAlpha = oldAlpha;
          if (font) this.ctx.font = oldFont;
        }

        return finalPos;
      },

      /**
       * Clear all placed regions (call at start of each frame)
       */
      clear: function() {
        this.placedRegions = [];
      },

      /**
       * Debug: draw all placed regions
       */
      debugDraw: function(color) {
        this.ctx.strokeStyle = color || 'rgba(255,0,0,0.5)';
        this.ctx.lineWidth = 1;
        for (var i = 0; i < this.placedRegions.length; i++) {
          var r = this.placedRegions[i];
          this.ctx.strokeRect(r.x, r.y, r.width, r.height);
        }
      }
    };
  }
};

/**
 * Layout Calculator
 * Computes safe zones and explicit positions for common chart elements
 */
var LayoutCalculator = {

  /**
   * Calculate standard chart layout with guaranteed non-overlapping zones
   */
  calculate: function(width, height, options) {
    options = options || {};
    var hasTitle = options.title !== false;
    var hasSubtitle = options.subtitle !== false;
    var hasXLabel = options.xLabel !== false;
    var hasYLabel = options.yLabel !== false;
    var hasLegend = options.legend || false;
    var hasFooter = options.footer || false;
    var hasInsights = options.insights || false;
    var insightCount = options.insightCount || 0;

    // Fixed vertical zones (top to bottom)
    var zones = {
      // Top padding
      topPadding: height * 0.02,

      // Title zone
      titleY: height * 0.06,
      titleHeight: hasTitle ? height * 0.05 : 0,

      // Subtitle zone
      subtitleY: height * 0.11,
      subtitleHeight: hasSubtitle ? height * 0.04 : 0,

      // Gap before plot
      plotTopGap: height * 0.03,

      // Plot area (calculated)
      plotTop: 0,
      plotBottom: 0,
      plotLeft: 0,
      plotRight: 0,

      // X-axis labels zone
      xLabelsY: 0,
      xLabelsHeight: height * 0.04,

      // X-axis title zone
      xTitleY: 0,
      xTitleHeight: hasXLabel ? height * 0.04 : 0,

      // Insights zone (ALWAYS below chart, never overlapping)
      insightsY: 0,
      insightsHeight: 0,
      insightsHeaderY: 0,
      insightsGridStartY: 0,
      insightsRowSpacing: 35,

      // Footer/source zone
      footerY: 0,
      footerHeight: hasFooter ? height * 0.04 : 0,

      // Bottom padding
      bottomPadding: height * 0.03
    };

    // Calculate insights height based on count (2 items per row)
    if (hasInsights && insightCount > 0) {
      var rows = Math.ceil(insightCount / 2);
      // Header (20px) + gap (15px) + rows * spacing + bottom gap
      zones.insightsHeight = 20 + 15 + (rows * zones.insightsRowSpacing) + 10;
    }

    // Calculate plot area boundaries (accounting for insights below)
    var plotStartY = zones.titleY + zones.titleHeight + zones.subtitleHeight + zones.plotTopGap;
    var plotEndY = height - zones.bottomPadding - zones.footerHeight - zones.insightsHeight - zones.xTitleHeight - zones.xLabelsHeight;

    zones.plotTop = plotStartY;
    zones.plotBottom = plotEndY;
    zones.plotLeft = width * (hasYLabel ? 0.12 : 0.08);
    zones.plotRight = width * (hasLegend ? 0.75 : 0.92);

    zones.xLabelsY = plotEndY + 8;
    zones.xTitleY = zones.xLabelsY + zones.xLabelsHeight;

    // Insights zone positioning (BELOW x-axis labels, with separator line)
    zones.insightsY = zones.xTitleY + zones.xTitleHeight + 10;
    zones.insightsHeaderY = zones.insightsY + 10;
    zones.insightsGridStartY = zones.insightsHeaderY + 25;

    // Footer at very bottom
    zones.footerY = height - zones.bottomPadding - zones.footerHeight / 2;

    // Computed dimensions
    zones.plotWidth = zones.plotRight - zones.plotLeft;
    zones.plotHeight = zones.plotBottom - zones.plotTop;

    // Legend zone (right side)
    if (hasLegend) {
      zones.legendX = width * 0.78;
      zones.legendY = zones.plotTop;
      zones.legendWidth = width * 0.20;
      zones.legendHeight = zones.plotHeight;
    }

    return zones;
  },

  /**
   * Calculate insights grid positions
   * Returns array of {x, y} positions for each insight item
   * Items are arranged in 2-column grid, centered horizontally
   *
   * @param {number} width - Canvas width
   * @param {number} insightCount - Number of insight items
   * @param {number} startY - Y position where insights grid starts
   * @param {number} rowSpacing - Vertical spacing between rows (default 35)
   * @returns {Array} Array of {x, y} positions
   */
  getInsightPositions: function(width, insightCount, startY, rowSpacing) {
    rowSpacing = rowSpacing || 35;
    var positions = [];

    // 2-column layout: left at 25% width, right at 75% width
    var leftX = width * 0.25;
    var rightX = width * 0.75;

    for (var i = 0; i < insightCount; i++) {
      var row = Math.floor(i / 2);
      var col = i % 2;
      positions.push({
        x: col === 0 ? leftX : rightX,
        y: startY + (row * rowSpacing)
      });
    }

    return positions;
  }
};

// Export for use in templates
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextLayoutManager: TextLayoutManager, LayoutCalculator: LayoutCalculator };
}
