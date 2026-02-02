/**
 * Dumbbell Chart Template
 * Shows change between two points (before/after, start/end)
 * Best for: Comparing changes, before/after analysis, gap visualization
 */

var DumbbellChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Category', start: 20, end: 80, startLabel: '2020', endLabel: '2024'}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.22,
      y: height * 0.22,
      width: width * 0.68,
      height: height * 0.58
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

    // Find range
    var allValues = [];
    data.forEach(function(d) {
      allValues.push(d.start, d.end);
    });
    var minValue = options.startFromZero ? 0 : Math.min.apply(null, allValues);
    var maxValue = Math.max.apply(null, allValues);
    var padding = (maxValue - minValue) * 0.1;
    minValue -= padding;
    maxValue += padding;
    var valueRange = maxValue - minValue;

    var eased = easeOutCubic(progress);
    var itemHeight = plotArea.height / data.length;
    var dotRadius = Math.min(10, itemHeight * 0.2);

    var startColor = options.startColor || style.colors[0];
    var endColor = options.endColor || style.colors[1];

    // Grid lines
    ctx.strokeStyle = style.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (var i = 0; i <= 5; i++) {
      var gx = plotArea.x + (plotArea.width / 5) * i;
      ctx.beginPath();
      ctx.moveTo(gx, plotArea.y - 10);
      ctx.lineTo(gx, plotArea.y + plotArea.height);
      ctx.stroke();

      // X-axis values
      var xVal = minValue + (valueRange / 5) * i;
      ctx.font = '10px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(formatValue(xVal), gx, plotArea.y + plotArea.height + 8);
    }
    ctx.setLineDash([]);

    // Draw dumbbells
    data.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.06) * 1.6));
      if (itemProgress <= 0) return;

      var y = plotArea.y + i * itemHeight + itemHeight / 2;

      // Calculate x positions
      var startX = plotArea.x + ((item.start - minValue) / valueRange) * plotArea.width;
      var endX = plotArea.x + ((item.end - minValue) / valueRange) * plotArea.width;

      // Animate positions
      var animStartX = plotArea.x + (startX - plotArea.x) * itemProgress;
      var animEndX = plotArea.x + (endX - plotArea.x) * itemProgress;

      // Label
      ctx.font = 'bold 12px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = itemProgress;
      ctx.fillText(item.label, plotArea.x - 15, y);
      ctx.globalAlpha = 1;

      // Connecting line
      ctx.beginPath();
      ctx.moveTo(animStartX, y);
      ctx.lineTo(animEndX, y);
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Direction indicator (subtle gradient on line)
      if (item.end > item.start) {
        var gradient = ctx.createLinearGradient(animStartX, 0, animEndX, 0);
        gradient.addColorStop(0, hexToRgba(startColor, 0.3));
        gradient.addColorStop(1, hexToRgba(endColor, 0.3));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // Start dot
      ctx.beginPath();
      ctx.arc(animStartX, y, dotRadius * itemProgress, 0, Math.PI * 2);
      ctx.fillStyle = startColor;
      ctx.fill();
      ctx.strokeStyle = style.background;
      ctx.lineWidth = 2;
      ctx.stroke();

      // End dot
      ctx.beginPath();
      ctx.arc(animEndX, y, dotRadius * itemProgress, 0, Math.PI * 2);
      ctx.fillStyle = endColor;
      ctx.fill();
      ctx.strokeStyle = style.background;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Values
      if (itemProgress > 0.7) {
        ctx.globalAlpha = (itemProgress - 0.7) * 3.3;
        ctx.font = 'bold 9px ' + style.fontFamily;
        ctx.textBaseline = 'bottom';

        // Start value
        ctx.fillStyle = startColor;
        ctx.textAlign = item.start < item.end ? 'right' : 'left';
        var startOffset = item.start < item.end ? -dotRadius - 5 : dotRadius + 5;
        ctx.fillText(formatValue(item.start), animStartX + startOffset, y - 3);

        // End value
        ctx.fillStyle = endColor;
        ctx.textAlign = item.end > item.start ? 'left' : 'right';
        var endOffset = item.end > item.start ? dotRadius + 5 : -dotRadius - 5;
        ctx.fillText(formatValue(item.end), animEndX + endOffset, y - 3);

        ctx.globalAlpha = 1;
      }
    });

    // Legend
    var legendY = height * 0.16;
    var startLabel = options.startLabel || data[0].startLabel || 'Start';
    var endLabel = options.endLabel || data[0].endLabel || 'End';

    // Start legend
    ctx.beginPath();
    ctx.arc(width * 0.65, legendY, 6, 0, Math.PI * 2);
    ctx.fillStyle = startColor;
    ctx.fill();
    ctx.font = '12px ' + style.fontFamily;
    ctx.fillStyle = style.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(startLabel, width * 0.65 + 12, legendY);

    // End legend
    ctx.beginPath();
    ctx.arc(width * 0.82, legendY, 6, 0, Math.PI * 2);
    ctx.fillStyle = endColor;
    ctx.fill();
    ctx.fillText(endLabel, width * 0.82 + 12, legendY);
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.round(num).toString();
}
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DumbbellChartTemplate;
}
