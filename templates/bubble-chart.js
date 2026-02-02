/**
 * Bubble Chart Template
 * Scatter plot with a third dimension shown as bubble size
 * Best for: Three-variable comparisons, market analysis, risk vs return
 */

var BubbleChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Company A', x: 50, y: 80, size: 100}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.12,
      y: height * 0.18,
      width: width * 0.80,
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
      ctx.fillText(config.title, width / 2, height * 0.05);
    }

    if (config.subtitle) {
      ctx.font = '14px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(config.subtitle, width / 2, height * 0.10);
    }

    // Find ranges
    var xMin = Math.min.apply(null, data.map(function(d) { return d.x; }));
    var xMax = Math.max.apply(null, data.map(function(d) { return d.x; }));
    var yMin = Math.min.apply(null, data.map(function(d) { return d.y; }));
    var yMax = Math.max.apply(null, data.map(function(d) { return d.y; }));
    var sizeMax = Math.max.apply(null, data.map(function(d) { return d.size; }));

    // Add padding
    var xPad = (xMax - xMin) * 0.1 || 10;
    var yPad = (yMax - yMin) * 0.1 || 10;
    xMin -= xPad; xMax += xPad;
    yMin -= yPad; yMax += yPad;

    function scaleX(val) {
      return plotArea.x + ((val - xMin) / (xMax - xMin)) * plotArea.width;
    }
    function scaleY(val) {
      return plotArea.y + plotArea.height - ((val - yMin) / (yMax - yMin)) * plotArea.height;
    }
    function scaleSize(val) {
      return 15 + (val / sizeMax) * 40;
    }

    var eased = easeOutCubic(progress);

    // Grid
    ctx.strokeStyle = style.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (var i = 0; i <= 4; i++) {
      var gy = plotArea.y + (plotArea.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(plotArea.x, gy);
      ctx.lineTo(plotArea.x + plotArea.width, gy);
      ctx.stroke();

      var gx = plotArea.x + (plotArea.width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(gx, plotArea.y);
      ctx.lineTo(gx, plotArea.y + plotArea.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = style.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plotArea.x, plotArea.y + plotArea.height);
    ctx.lineTo(plotArea.x + plotArea.width, plotArea.y + plotArea.height);
    ctx.moveTo(plotArea.x, plotArea.y);
    ctx.lineTo(plotArea.x, plotArea.y + plotArea.height);
    ctx.stroke();

    // Axis labels
    ctx.font = 'bold 13px ' + style.fontFamily;
    ctx.fillStyle = style.text;
    ctx.textAlign = 'center';
    ctx.fillText(options.xLabel || 'X Axis', plotArea.x + plotArea.width / 2, height * 0.82);

    ctx.save();
    ctx.translate(width * 0.04, plotArea.y + plotArea.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(options.yLabel || 'Y Axis', 0, 0);
    ctx.restore();

    // Draw bubbles
    data.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.06) * 1.8));
      if (itemProgress <= 0) return;

      var x = scaleX(item.x);
      var y = scaleY(item.y);
      var radius = scaleSize(item.size) * easeOutBack(itemProgress);
      var color = style.colors[i % style.colors.length];

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.fill();

      // Bubble
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.7);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      if (itemProgress > 0.5) {
        ctx.globalAlpha = (itemProgress - 0.5) * 2;
        ctx.font = 'bold 11px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(item.label, x, y - radius - 5);
        ctx.globalAlpha = 1;
      }
    });

    // Size legend
    ctx.font = '11px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('Bubble size = ' + (options.sizeLabel || 'Value'), width * 0.75, height * 0.92);
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutBack(t) {
  var c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BubbleChartTemplate;
}
