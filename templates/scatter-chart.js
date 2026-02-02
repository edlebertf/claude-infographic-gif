/**
 * Scatter Chart Template
 * Shows relationship between two variables as points
 * Best for: Correlation analysis, distribution, outlier detection
 */

var ScatterChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Point A', x: 50, y: 80}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.12,
      y: height * 0.18,
      width: width * 0.78,
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

      // Y-axis labels
      var yVal = yMax - ((yMax - yMin) / 4) * i;
      ctx.font = '10px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatValue(yVal), plotArea.x - 8, gy);

      // X-axis labels
      var xVal = xMin + ((xMax - xMin) / 4) * i;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(formatValue(xVal), gx, plotArea.y + plotArea.height + 8);
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
    ctx.fillText(options.xLabel || 'X Axis', plotArea.x + plotArea.width / 2, height * 0.88);

    ctx.save();
    ctx.translate(width * 0.04, plotArea.y + plotArea.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(options.yLabel || 'Y Axis', 0, 0);
    ctx.restore();

    // Compute label positions to avoid overlaps
    var pointRadius = 7;
    var labelPositions = computeLabelPositions(data, plotArea, scaleX, scaleY, pointRadius, ctx, style);

    // Draw points
    data.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.04) * 2));
      if (itemProgress <= 0) return;

      var x = scaleX(item.x);
      var y = scaleY(item.y);
      var color = item.color || style.colors[i % style.colors.length];

      // Glow effect
      ctx.beginPath();
      ctx.arc(x, y, (pointRadius + 4) * itemProgress, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(color, 0.2);
      ctx.fill();

      // Point
      ctx.beginPath();
      ctx.arc(x, y, pointRadius * itemProgress, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = style.background;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      if (itemProgress > 0.5 && labelPositions[i]) {
        var lp = labelPositions[i];
        ctx.globalAlpha = (itemProgress - 0.5) * 2;
        ctx.font = 'bold 11px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = lp.align;
        ctx.textBaseline = lp.baseline;
        ctx.fillText(item.label, lp.x, lp.y);
        ctx.globalAlpha = 1;
      }
    });
  }
};

// Label placement algorithm to avoid overlaps
function computeLabelPositions(data, plotArea, scaleX, scaleY, pointRadius, ctx, style) {
  var positions = [];
  var placedLabels = [];

  var labelOffsets = [
    { dx: 0, dy: -1, align: 'center', baseline: 'bottom' },  // top
    { dx: 1, dy: -1, align: 'left', baseline: 'bottom' },    // top-right
    { dx: 1, dy: 0, align: 'left', baseline: 'middle' },     // right
    { dx: 1, dy: 1, align: 'left', baseline: 'top' },        // bottom-right
    { dx: 0, dy: 1, align: 'center', baseline: 'top' },      // bottom
    { dx: -1, dy: 1, align: 'right', baseline: 'top' },      // bottom-left
    { dx: -1, dy: 0, align: 'right', baseline: 'middle' },   // left
    { dx: -1, dy: -1, align: 'right', baseline: 'bottom' }   // top-left
  ];

  ctx.font = 'bold 11px ' + style.fontFamily;

  data.forEach(function(item, i) {
    var px = scaleX(item.x);
    var py = scaleY(item.y);
    var labelWidth = ctx.measureText(item.label).width;
    var labelHeight = 14;
    var offset = pointRadius + 8;

    var bestPosition = null;
    var bestScore = -Infinity;

    labelOffsets.forEach(function(lo) {
      var lx = px + lo.dx * offset;
      var ly = py + lo.dy * offset;

      // Adjust for text alignment
      var rectX = lx;
      var rectY = ly;
      if (lo.align === 'center') rectX -= labelWidth / 2;
      else if (lo.align === 'right') rectX -= labelWidth;
      if (lo.baseline === 'middle') rectY -= labelHeight / 2;
      else if (lo.baseline === 'bottom') rectY -= labelHeight;

      var rect = { x: rectX, y: rectY, width: labelWidth, height: labelHeight };

      // Check bounds
      var inBounds = rect.x >= plotArea.x - 5 &&
                     rect.x + rect.width <= plotArea.x + plotArea.width + 5 &&
                     rect.y >= plotArea.y - 5 &&
                     rect.y + rect.height <= plotArea.y + plotArea.height + 30;

      if (!inBounds) return;

      // Check overlaps with other labels
      var overlaps = false;
      placedLabels.forEach(function(placed) {
        if (rectsOverlap(rect, placed)) overlaps = true;
      });

      // Score: prefer top, avoid overlaps, stay in bounds
      var score = 100;
      if (overlaps) score -= 200;
      if (lo.dy < 0) score += 20; // prefer above
      if (lo.dx === 0) score += 10; // prefer centered

      // Penalize edge proximity
      var edgePenalty = 0;
      if (rect.x < plotArea.x + 20) edgePenalty += 15;
      if (rect.x + rect.width > plotArea.x + plotArea.width - 20) edgePenalty += 15;
      if (rect.y < plotArea.y + 10) edgePenalty += 15;
      if (rect.y + rect.height > plotArea.y + plotArea.height - 10) edgePenalty += 15;
      score -= edgePenalty;

      if (score > bestScore) {
        bestScore = score;
        bestPosition = { x: lx, y: ly, align: lo.align, baseline: lo.baseline, rect: rect };
      }
    });

    if (bestPosition) {
      positions[i] = bestPosition;
      placedLabels.push(bestPosition.rect);
    } else {
      positions[i] = null;
    }
  });

  return positions;
}

function rectsOverlap(a, b) {
  return !(a.x + a.width < b.x || b.x + b.width < a.x ||
           a.y + a.height < b.y || b.y + b.height < a.y);
}

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
  module.exports = ScatterChartTemplate;
}
