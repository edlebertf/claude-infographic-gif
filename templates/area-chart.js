/**
 * Area Chart Template
 * Single series line chart with filled area beneath
 * Best for: Trends over time, volume data, stock prices
 */

var AreaChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Jan', value: 100}, ...]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.10,
      y: height * 0.18,
      width: width * 0.82,
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

    var maxValue = Math.max.apply(null, data.map(function(d) { return d.value; }));
    var minValue = options.startFromZero ? 0 : Math.min.apply(null, data.map(function(d) { return d.value; }));
    var valueRange = maxValue - minValue;
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

    // Calculate points
    var points = [];
    var stepX = plotArea.width / (data.length - 1);

    data.forEach(function(item, i) {
      var x = plotArea.x + i * stepX;
      var normalizedValue = (item.value - minValue) / valueRange;
      var y = plotArea.y + plotArea.height - (normalizedValue * plotArea.height * eased);
      points.push({ x: x, y: y, label: item.label, value: item.value });
    });

    // Draw filled area
    var color = options.color || style.colors[0];

    ctx.beginPath();
    ctx.moveTo(points[0].x, plotArea.y + plotArea.height);

    points.forEach(function(pt) {
      ctx.lineTo(pt.x, pt.y);
    });

    ctx.lineTo(points[points.length - 1].x, plotArea.y + plotArea.height);
    ctx.closePath();

    // Gradient fill
    var gradient = ctx.createLinearGradient(0, plotArea.y, 0, plotArea.y + plotArea.height);
    gradient.addColorStop(0, hexToRgba(color, 0.6));
    gradient.addColorStop(1, hexToRgba(color, 0.1));
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line on top
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(function(pt) {
      ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw points
    points.forEach(function(pt, i) {
      var pointProgress = Math.min(1, Math.max(0, (eased - i * 0.03) * 2));
      if (pointProgress <= 0) return;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5 * pointProgress, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = style.background;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X-axis labels
    ctx.font = '11px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    var labelInterval = Math.ceil(data.length / 10);
    points.forEach(function(pt, i) {
      if (i % labelInterval === 0 || i === points.length - 1) {
        ctx.fillText(pt.label, pt.x, plotArea.y + plotArea.height + 8);
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

    // Axis labels
    if (options.xLabel) {
      ctx.font = 'bold 13px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.fillText(options.xLabel, plotArea.x + plotArea.width / 2, height * 0.92);
    }

    if (options.yLabel) {
      ctx.save();
      ctx.translate(width * 0.03, plotArea.y + plotArea.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 13px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.fillText(options.yLabel, 0, 0);
      ctx.restore();
    }
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
  module.exports = AreaChartTemplate;
}
