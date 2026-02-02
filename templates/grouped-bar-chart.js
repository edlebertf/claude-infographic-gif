/**
 * Grouped Bar Chart Template
 * Multiple bars side-by-side for each category
 * Best for: Comparing multiple metrics across categories, year-over-year comparisons
 */

var GroupedBarChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // {categories: ['Q1','Q2'], series: [{name: '2024', values: [10,20], color: '#FF0000'}]}
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;
    var isHorizontal = options.orientation === 'horizontal';

    var plotArea = {
      x: width * (isHorizontal ? 0.18 : 0.10),
      y: height * 0.20,
      width: width * (isHorizontal ? 0.72 : 0.80),
      height: height * 0.55
    };

    // Clear
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // Title
    if (config.title) {
      ctx.font = 'bold 28px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.fillText(config.title, width / 2, height * 0.06);
    }

    if (config.subtitle) {
      ctx.font = '14px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(config.subtitle, width / 2, height * 0.12);
    }

    var categories = data.categories;
    var series = data.series;
    var numCategories = categories.length;
    var numSeries = series.length;

    // Find max value
    var maxValue = 0;
    series.forEach(function(s) {
      s.values.forEach(function(v) {
        if (v > maxValue) maxValue = v;
      });
    });

    var eased = easeOutCubic(progress);

    if (isHorizontal) {
      var categoryHeight = plotArea.height / numCategories;
      var barHeight = (categoryHeight * 0.7) / numSeries;
      var categoryPadding = categoryHeight * 0.15;

      // Grid lines
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (var i = 0; i <= 4; i++) {
        var gx = plotArea.x + (plotArea.width / 4) * i;
        ctx.beginPath();
        ctx.moveTo(gx, plotArea.y);
        ctx.lineTo(gx, plotArea.y + plotArea.height);
        ctx.stroke();

        // X-axis values
        ctx.font = '11px ' + style.fontFamily;
        ctx.fillStyle = style.textMuted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(formatValue((maxValue / 4) * i), gx, plotArea.y + plotArea.height + 8);
      }
      ctx.setLineDash([]);

      // Draw bars
      categories.forEach(function(cat, catIndex) {
        var catY = plotArea.y + catIndex * categoryHeight + categoryPadding;

        // Category label
        ctx.font = 'bold 12px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(cat, plotArea.x - 10, catY + (categoryHeight - categoryPadding * 2) / 2);

        series.forEach(function(s, seriesIndex) {
          var itemProgress = Math.min(1, Math.max(0, (eased - (catIndex * numSeries + seriesIndex) * 0.03) * 1.8));
          if (itemProgress <= 0) return;

          var y = catY + seriesIndex * barHeight;
          var barWidth = (s.values[catIndex] / maxValue) * plotArea.width * itemProgress;
          var color = s.color || style.colors[seriesIndex % style.colors.length];

          // Bar
          ctx.fillStyle = color;
          roundRect(ctx, plotArea.x, y, barWidth, barHeight - 2, 3);
          ctx.fill();

          // Value
          if (itemProgress > 0.7 && barWidth > 30) {
            ctx.globalAlpha = (itemProgress - 0.7) * 3.3;
            ctx.font = 'bold 10px ' + style.fontFamily;
            ctx.fillStyle = getBrightness(color) > 128 ? '#000000' : '#FFFFFF';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatValue(s.values[catIndex]), plotArea.x + barWidth - 5, y + (barHeight - 2) / 2);
            ctx.globalAlpha = 1;
          }
        });
      });
    } else {
      // Vertical bars
      var categoryWidth = plotArea.width / numCategories;
      var barWidth = (categoryWidth * 0.7) / numSeries;
      var categoryPadding = categoryWidth * 0.15;

      // Grid lines
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (var i = 0; i <= 4; i++) {
        var gy = plotArea.y + (plotArea.height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(plotArea.x, gy);
        ctx.lineTo(plotArea.x + plotArea.width, gy);
        ctx.stroke();

        // Y-axis values
        ctx.font = '11px ' + style.fontFamily;
        ctx.fillStyle = style.textMuted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatValue(maxValue - (maxValue / 4) * i), plotArea.x - 8, gy);
      }
      ctx.setLineDash([]);

      // Draw bars
      categories.forEach(function(cat, catIndex) {
        var catX = plotArea.x + catIndex * categoryWidth + categoryPadding;

        // Category label
        ctx.font = 'bold 11px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(cat, catX + (categoryWidth - categoryPadding * 2) / 2, plotArea.y + plotArea.height + 8);

        series.forEach(function(s, seriesIndex) {
          var itemProgress = Math.min(1, Math.max(0, (eased - (catIndex * numSeries + seriesIndex) * 0.03) * 1.8));
          if (itemProgress <= 0) return;

          var x = catX + seriesIndex * barWidth;
          var barHeight = (s.values[catIndex] / maxValue) * plotArea.height * itemProgress;
          var y = plotArea.y + plotArea.height - barHeight;
          var color = s.color || style.colors[seriesIndex % style.colors.length];

          // Bar
          ctx.fillStyle = color;
          roundRect(ctx, x, y, barWidth - 2, barHeight, 3);
          ctx.fill();

          // Value on top
          if (itemProgress > 0.7) {
            ctx.globalAlpha = (itemProgress - 0.7) * 3.3;
            ctx.font = 'bold 9px ' + style.fontFamily;
            ctx.fillStyle = style.text;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(formatValue(s.values[catIndex]), x + (barWidth - 2) / 2, y - 3);
            ctx.globalAlpha = 1;
          }
        });
      });
    }

    // Baseline
    ctx.strokeStyle = style.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(plotArea.x, plotArea.y);
      ctx.lineTo(plotArea.x, plotArea.y + plotArea.height);
    } else {
      ctx.moveTo(plotArea.x, plotArea.y + plotArea.height);
      ctx.lineTo(plotArea.x + plotArea.width, plotArea.y + plotArea.height);
    }
    ctx.stroke();

    // Legend
    var legendY = height * 0.90;
    var totalLegendWidth = series.reduce(function(sum, s) {
      return sum + ctx.measureText(s.name).width + 40;
    }, 0);
    var legendX = (width - totalLegendWidth) / 2;

    series.forEach(function(s, i) {
      var color = s.color || style.colors[i % style.colors.length];

      // Color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, legendY - 6, 14, 14);

      // Label
      ctx.font = '12px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.name, legendX + 20, legendY + 1);

      legendX += ctx.measureText(s.name).width + 45;
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
}
function getBrightness(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GroupedBarChartTemplate;
}
