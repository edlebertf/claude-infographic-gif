/**
 * Multi-Line Chart Template
 * Multiple data series plotted as lines for comparison
 * Best for: Comparing trends, performance metrics, stock comparisons
 */

var MultiLineChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // {labels: ['Jan','Feb'...], series: [{name: 'A', values: [1,2,3], color: '#FF0000'}]}
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.10,
      y: height * 0.18,
      width: width * 0.70,
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

    var labels = data.labels;
    var series = data.series;

    // Find global min/max
    var allValues = [];
    series.forEach(function(s) {
      allValues = allValues.concat(s.values);
    });
    var maxValue = Math.max.apply(null, allValues);
    var minValue = options.startFromZero ? 0 : Math.min.apply(null, allValues);
    var valueRange = maxValue - minValue || 1;

    var eased = easeOutCubic(progress);

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

      // Y-axis labels
      var yVal = maxValue - (valueRange / 4) * i;
      ctx.font = '11px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatValue(yVal), plotArea.x - 8, gy);
    }
    ctx.setLineDash([]);

    var stepX = plotArea.width / (labels.length - 1);

    // Draw each series
    series.forEach(function(s, seriesIndex) {
      var seriesProgress = Math.min(1, Math.max(0, (eased - seriesIndex * 0.08) * 1.5));
      if (seriesProgress <= 0) return;

      var color = s.color || style.colors[seriesIndex % style.colors.length];
      var points = [];

      // Calculate points
      s.values.forEach(function(val, i) {
        var x = plotArea.x + i * stepX;
        var normalizedValue = (val - minValue) / valueRange;
        var y = plotArea.y + plotArea.height - (normalizedValue * plotArea.height);
        points.push({ x: x, y: y });
      });

      // Animate line drawing
      var numPointsToDraw = Math.ceil(points.length * seriesProgress);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < numPointsToDraw; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw points
      for (var i = 0; i < numPointsToDraw; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // X-axis labels
    ctx.font = '11px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    var labelInterval = Math.ceil(labels.length / 8);
    labels.forEach(function(label, i) {
      if (i % labelInterval === 0 || i === labels.length - 1) {
        var x = plotArea.x + i * stepX;
        ctx.fillText(label, x, plotArea.y + plotArea.height + 8);
      }
    });

    // Axes
    ctx.strokeStyle = style.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotArea.x, plotArea.y);
    ctx.lineTo(plotArea.x, plotArea.y + plotArea.height);
    ctx.lineTo(plotArea.x + plotArea.width, plotArea.y + plotArea.height);
    ctx.stroke();

    // Legend
    var legendX = width * 0.82;
    var legendStartY = plotArea.y;
    var legendItemHeight = 28;

    series.forEach(function(s, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - 0.3 - i * 0.05) * 2));
      if (itemProgress <= 0) return;

      ctx.globalAlpha = itemProgress;
      var y = legendStartY + i * legendItemHeight;
      var color = s.color || style.colors[i % style.colors.length];

      // Line sample
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, y + 8);
      ctx.lineTo(legendX + 25, y + 8);
      ctx.stroke();

      // Dot
      ctx.beginPath();
      ctx.arc(legendX + 12.5, y + 8, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.font = 'bold 12px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.name, legendX + 32, y + 8);

      ctx.globalAlpha = 1;
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiLineChartTemplate;
}
