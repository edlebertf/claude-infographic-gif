/**
 * Waterfall Chart Template
 * Shows how a value changes through additions and subtractions
 * Best for: Financial analysis, profit breakdown, budget changes, inventory flow
 */

var WaterfallChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Start', value: 100, type: 'total'}, {label: 'Sales', value: 50, type: 'increase'}...]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.12,
      y: height * 0.20,
      width: width * 0.83,
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

    // Calculate running total and find min/max
    var runningTotal = 0;
    var processedData = [];
    var minValue = 0;
    var maxValue = 0;

    data.forEach(function(item) {
      var start, end;
      if (item.type === 'total') {
        start = 0;
        end = item.value;
        runningTotal = item.value;
      } else {
        start = runningTotal;
        end = runningTotal + item.value;
        runningTotal = end;
      }
      processedData.push({
        label: item.label,
        value: item.value,
        type: item.type,
        start: start,
        end: end
      });
      minValue = Math.min(minValue, start, end);
      maxValue = Math.max(maxValue, start, end);
    });

    // Add padding
    var range = maxValue - minValue;
    minValue -= range * 0.1;
    maxValue += range * 0.1;

    var eased = easeOutCubic(progress);
    var barWidth = Math.min(50, (plotArea.width / data.length) * 0.7);
    var gap = (plotArea.width - barWidth * data.length) / (data.length + 1);

    function scaleY(val) {
      return plotArea.y + plotArea.height - ((val - minValue) / (maxValue - minValue)) * plotArea.height;
    }

    // Zero line
    if (minValue < 0 && maxValue > 0) {
      var zeroY = scaleY(0);
      ctx.beginPath();
      ctx.moveTo(plotArea.x, zeroY);
      ctx.lineTo(plotArea.x + plotArea.width, zeroY);
      ctx.strokeStyle = style.textMuted;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw bars and connectors
    processedData.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.06) * 1.5));
      if (itemProgress <= 0) return;

      var x = plotArea.x + gap + i * (barWidth + gap);
      var startY = scaleY(item.start);
      var endY = scaleY(item.end);

      // Animate the bar
      var animatedEnd = item.start + (item.end - item.start) * itemProgress;
      var animatedEndY = scaleY(animatedEnd);

      // Connector line from previous bar
      if (i > 0 && itemProgress > 0.3) {
        var prevX = plotArea.x + gap + (i - 1) * (barWidth + gap) + barWidth;
        ctx.beginPath();
        ctx.moveTo(prevX, startY);
        ctx.lineTo(x, startY);
        ctx.strokeStyle = style.gridLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Bar color
      var color;
      if (item.type === 'total') {
        color = style.colors[0];
      } else if (item.value >= 0) {
        color = style.colors[1] || '#4CAF50';
      } else {
        color = style.colors[3] || '#F44336';
      }

      // Draw bar
      var barTop = Math.min(startY, animatedEndY);
      var barHeight = Math.abs(animatedEndY - startY);

      ctx.fillStyle = color;
      roundRect(ctx, x, barTop, barWidth, barHeight, 4);
      ctx.fill();

      // Value label
      if (itemProgress > 0.5) {
        var labelAlpha = (itemProgress - 0.5) * 2;
        ctx.globalAlpha = labelAlpha;

        ctx.font = 'bold 11px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = item.value >= 0 ? 'bottom' : 'top';

        var prefix = item.type !== 'total' && item.value > 0 ? '+' : '';
        ctx.fillText(prefix + formatValue(item.value), x + barWidth / 2, item.value >= 0 ? barTop - 5 : barTop + barHeight + 5);

        ctx.globalAlpha = 1;
      }

      // X-axis label
      ctx.font = 'bold 10px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, x + barWidth / 2, plotArea.y + plotArea.height + 8);
    });

    // Legend
    var legendY = height * 0.90;
    var legendItems = [
      { label: 'Total', color: style.colors[0] },
      { label: 'Increase', color: style.colors[1] || '#4CAF50' },
      { label: 'Decrease', color: style.colors[3] || '#F44336' }
    ];
    var legendStartX = width / 2 - 120;

    legendItems.forEach(function(item, i) {
      var x = legendStartX + i * 85;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, legendY - 6, 12, 12);
      ctx.font = '11px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, x + 16, legendY);
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
function roundRect(ctx, x, y, w, h, r) {
  if (h < 0) { y += h; h = -h; }
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
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
  module.exports = WaterfallChartTemplate;
}
