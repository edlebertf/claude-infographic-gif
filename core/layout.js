/**
 * Layout System v2
 * Robust positioning with guaranteed non-overlapping elements
 *
 * Key principles:
 * - Title area is reserved at top, content never overlaps
 * - Margins are generous (minimum 8% on all sides)
 * - Content area is calculated AFTER title space is reserved
 * - All measurements relative to canvas size for scalability
 */

var Layout = {

  // Canvas size presets
  sizes: {
    'square': { width: 800, height: 800 },
    'squareLarge': { width: 1080, height: 1080 },
    'landscape': { width: 900, height: 600 },
    'wide': { width: 1000, height: 700 },
    'twitter': { width: 1200, height: 628 },
    'story': { width: 1080, height: 1920 }
  },

  /**
   * Create a layout calculator for given dimensions
   */
  create: function(width, height, options) {
    options = options || {};
    var hasTitle = options.title !== false;
    var hasSubtitle = options.subtitle || false;

    return {
      width: width,
      height: height,
      hasTitle: hasTitle,
      hasSubtitle: hasSubtitle,

      // =========================================
      // SPACING CONSTANTS (as ratios of canvas)
      // =========================================

      // Minimum margins around entire canvas
      minMargin: {
        top: 0.04,
        right: 0.05,
        bottom: 0.05,
        left: 0.05
      },

      // Title area heights (generous to prevent overlap)
      titleHeight: 0.07,        // Space for title text
      subtitleHeight: 0.05,     // Space for subtitle text
      titleGap: 0.04,           // Gap between title area and content

      // =========================================
      // CORE LAYOUT CALCULATIONS
      // =========================================

      /**
       * Get the Y position where content can start (below title area)
       */
      getContentStartY: function() {
        var y = this.height * this.minMargin.top;

        if (this.hasTitle) {
          y += this.height * this.titleHeight;
        }
        if (this.hasSubtitle) {
          y += this.height * this.subtitleHeight;
        }
        if (this.hasTitle || this.hasSubtitle) {
          y += this.height * this.titleGap;
        }

        return y;
      },

      /**
       * Get the full content area (where charts are drawn)
       */
      getContentArea: function() {
        var startY = this.getContentStartY();
        var endY = this.height * (1 - this.minMargin.bottom);

        return {
          x: this.width * this.minMargin.left,
          y: startY,
          width: this.width * (1 - this.minMargin.left - this.minMargin.right),
          height: endY - startY
        };
      },

      /**
       * Get title positioning
       */
      getTitle: function() {
        return {
          x: this.width / 2,
          y: this.height * (this.minMargin.top + this.titleHeight * 0.5),
          fontSize: Math.round(Math.min(this.width, this.height) * 0.045),
          maxWidth: this.width * 0.9
        };
      },

      /**
       * Get subtitle positioning
       */
      getSubtitle: function() {
        var titleBottom = this.height * (this.minMargin.top + this.titleHeight);
        return {
          x: this.width / 2,
          y: titleBottom + this.height * this.subtitleHeight * 0.5,
          fontSize: Math.round(Math.min(this.width, this.height) * 0.022),
          maxWidth: this.width * 0.85
        };
      },

      // =========================================
      // CHART-SPECIFIC LAYOUTS
      // =========================================

      /**
       * Pie chart with legend on the right
       */
      getPieWithLegend: function(itemCount) {
        var content = this.getContentArea();

        // Pie takes left 50%, legend takes right 45%, 5% gap
        var pieAreaWidth = content.width * 0.50;
        var legendAreaWidth = content.width * 0.42;
        var gap = content.width * 0.08;

        var pieRadius = Math.min(pieAreaWidth * 0.85, content.height * 0.42);

        // Legend item sizing based on count
        var maxItemHeight = 85;
        var minItemHeight = 40;
        var availableHeight = content.height * 0.9;
        var itemHeight = Math.min(maxItemHeight, Math.max(minItemHeight, availableHeight / itemCount));
        var totalLegendHeight = itemHeight * itemCount;
        var legendStartY = content.y + (content.height - totalLegendHeight) / 2;

        return {
          pie: {
            centerX: content.x + pieAreaWidth * 0.5,
            centerY: content.y + content.height * 0.5,
            radius: pieRadius
          },
          legend: {
            x: content.x + pieAreaWidth + gap,
            y: legendStartY,
            width: legendAreaWidth,
            itemHeight: itemHeight,
            boxSize: Math.min(22, itemHeight * 0.28),
            labelFontSize: Math.min(22, Math.max(13, itemHeight * 0.24)),
            valueFontSize: Math.min(26, Math.max(16, itemHeight * 0.30))
          }
        };
      },

      /**
       * Centered pie (no legend)
       */
      getPieCentered: function() {
        var content = this.getContentArea();
        var pieRadius = Math.min(content.width, content.height) * 0.40;

        return {
          centerX: content.x + content.width / 2,
          centerY: content.y + content.height / 2,
          radius: pieRadius
        };
      },

      /**
       * Bar chart layout
       */
      getBarChart: function(itemCount, orientation) {
        var content = this.getContentArea();
        var isVertical = orientation !== 'horizontal';

        // Reserve space for axis labels
        var axisLabelSpace = isVertical ? content.height * 0.12 : content.width * 0.22;

        if (isVertical) {
          var chartHeight = content.height - axisLabelSpace;
          var barWidth = Math.min(70, (content.width / itemCount) * 0.65);
          var totalBarsWidth = barWidth * itemCount;
          var gap = (content.width - totalBarsWidth) / (itemCount + 1);

          return {
            area: {
              x: content.x,
              y: content.y,
              width: content.width,
              height: chartHeight
            },
            barWidth: barWidth,
            gap: gap,
            labelY: content.y + chartHeight + 15,
            labelFontSize: Math.min(16, Math.max(11, gap * 0.4)),
            valueFontSize: Math.min(18, Math.max(12, barWidth * 0.28))
          };
        } else {
          var chartWidth = content.width - axisLabelSpace;
          var barHeight = Math.min(55, (content.height / itemCount) * 0.65);
          var totalBarsHeight = barHeight * itemCount;
          var gap = (content.height - totalBarsHeight) / (itemCount + 1);

          return {
            area: {
              x: content.x + axisLabelSpace,
              y: content.y,
              width: chartWidth,
              height: content.height
            },
            labelX: content.x + axisLabelSpace - 12,
            barHeight: barHeight,
            gap: gap,
            labelFontSize: Math.min(16, Math.max(12, barHeight * 0.35)),
            valueFontSize: Math.min(16, Math.max(11, barHeight * 0.30))
          };
        }
      },

      /**
       * Line chart layout
       */
      getLineChart: function() {
        var content = this.getContentArea();

        // Reserve space for axis labels
        var yAxisWidth = content.width * 0.10;
        var xAxisHeight = content.height * 0.12;

        return {
          area: {
            x: content.x + yAxisWidth,
            y: content.y,
            width: content.width - yAxisWidth,
            height: content.height - xAxisHeight
          },
          yAxisX: content.x + yAxisWidth - 10,
          xAxisY: content.y + content.height - xAxisHeight + 12,
          pointRadius: 6,
          lineWidth: 4,
          labelFontSize: Math.round(Math.min(this.width, this.height) * 0.018),
          valueFontSize: Math.round(Math.min(this.width, this.height) * 0.020)
        };
      },

      /**
       * Sankey chart layout
       * Includes separate areas for column headers and actual chart
       */
      getSankey: function(leftCount, rightCount) {
        var content = this.getContentArea();

        // Node and label spacing
        var labelWidth = content.width * 0.20;  // Space for labels on each side
        var nodeWidth = 24;
        var columnHeaderSpace = 30;  // Space for column headers at top of content

        // Chart area starts below column headers
        var chartStartY = content.y + columnHeaderSpace;
        var chartHeight = content.height - columnHeaderSpace;

        return {
          content: content,
          chartStartY: chartStartY,
          chartHeight: chartHeight,
          nodeWidth: nodeWidth,
          leftNodeX: content.x + labelWidth,
          rightNodeX: content.x + content.width - labelWidth - nodeWidth,
          centerNodeX: content.x + content.width / 2 - nodeWidth / 2,
          leftLabelX: content.x + labelWidth - 16,
          rightLabelX: content.x + content.width - labelWidth + nodeWidth + 16,
          columnHeaderY: content.y + 12,  // Inside content area
          labelFontSize: Math.min(14, Math.max(11, chartHeight / Math.max(leftCount, rightCount) * 0.11)),
          valueFontSize: Math.min(13, Math.max(10, chartHeight / Math.max(leftCount, rightCount) * 0.10))
        };
      },

      /**
       * Progress bars layout
       */
      getProgressBars: function(itemCount) {
        var content = this.getContentArea();
        var spacing = content.height / itemCount;
        var barHeight = Math.min(36, spacing * 0.40);

        return {
          area: content,
          spacing: spacing,
          barHeight: barHeight,
          barRadius: barHeight / 2,
          barY: function(index) {
            return content.y + spacing * index + (spacing - barHeight) / 2 + spacing * 0.15;
          },
          labelY: function(index) {
            return content.y + spacing * index + spacing * 0.25;
          },
          labelFontSize: Math.min(20, Math.max(13, spacing * 0.20)),
          valueFontSize: Math.min(22, Math.max(14, spacing * 0.22))
        };
      },

      /**
       * Counter layout
       */
      getCounter: function() {
        var content = this.getContentArea();
        return {
          valueX: this.width / 2,
          valueY: content.y + content.height * 0.45,
          labelY: content.y + content.height * 0.68,
          valueFontSize: Math.round(Math.min(content.width, content.height) * 0.22),
          labelFontSize: Math.round(Math.min(content.width, content.height) * 0.055)
        };
      },

      /**
       * Multi-counter grid layout
       */
      getMultiCounter: function(itemCount) {
        var content = this.getContentArea();
        var cols = itemCount <= 2 ? itemCount : itemCount <= 4 ? 2 : 3;
        var rows = Math.ceil(itemCount / cols);
        var cellWidth = content.width / cols;
        var cellHeight = content.height / rows;

        return {
          cols: cols,
          rows: rows,
          cellWidth: cellWidth,
          cellHeight: cellHeight,
          getCellCenter: function(index) {
            var col = index % cols;
            var row = Math.floor(index / cols);
            return {
              x: content.x + cellWidth * (col + 0.5),
              y: content.y + cellHeight * (row + 0.5)
            };
          },
          valueFontSize: Math.min(44, Math.max(24, cellHeight * 0.22)),
          labelFontSize: Math.min(18, Math.max(11, cellHeight * 0.09))
        };
      },

      /**
       * Timeline layout
       */
      getTimeline: function(itemCount, orientation) {
        var content = this.getContentArea();
        var isVertical = orientation !== 'horizontal';

        if (isVertical) {
          var spacing = content.height / (itemCount + 1);
          return {
            lineX: this.width / 2,
            startY: content.y + spacing,
            spacing: spacing,
            dotRadius: 11,
            lineWidth: 4,
            contentOffset: this.width * 0.06,
            getEventY: function(index) { return content.y + spacing * (index + 1); },
            dateFontSize: Math.min(18, Math.max(13, spacing * 0.16)),
            titleFontSize: Math.min(20, Math.max(15, spacing * 0.18)),
            descFontSize: Math.min(14, Math.max(11, spacing * 0.12))
          };
        } else {
          var spacing = content.width / (itemCount + 1);
          return {
            lineY: content.y + content.height / 2,
            startX: content.x + spacing,
            spacing: spacing,
            dotRadius: 11,
            lineWidth: 4,
            contentOffset: content.height * 0.08,
            getEventX: function(index) { return content.x + spacing * (index + 1); },
            dateFontSize: Math.min(14, Math.max(11, spacing * 0.10)),
            titleFontSize: Math.min(16, Math.max(13, spacing * 0.12))
          };
        }
      }
    };
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Layout;
}
