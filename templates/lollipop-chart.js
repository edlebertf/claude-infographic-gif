/**
 * Lollipop Chart Template
 * Minimalist alternative to bar chart with dots on stems
 * Best for: Rankings, comparisons, cleaner look than bars
 */

var LollipopChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Item', value: 80}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;
    var isHorizontal = options.orientation !== 'vertical';

    var plotArea = {
      x: width * (isHorizontal ? 0.20 : 0.10),
      y: height * 0.20,
      width: width * (isHorizontal ? 0.72 : 0.80),
      height: height * 0.60
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
    var eased = easeOutCubic(progress);

    if (isHorizontal) {
      var itemHeight = plotArea.height / data.length;
      var dotRadius = Math.min(10, itemHeight * 0.25);

      data.forEach(function(item, i) {
        var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.06) * 1.6));
        if (itemProgress <= 0) return;

        var y = plotArea.y + i * itemHeight + itemHeight / 2;
        var lineLength = (item.value / maxValue) * plotArea.width * itemProgress;
        var color = item.color || style.colors[i % style.colors.length];

        // Label
        ctx.font = 'bold 12px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, plotArea.x - 15, y);

        // Stem
        ctx.beginPath();
        ctx.moveTo(plotArea.x, y);
        ctx.lineTo(plotArea.x + lineLength, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Dot
        ctx.beginPath();
        ctx.arc(plotArea.x + lineLength, y, dotRadius * itemProgress, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Value
        if (itemProgress > 0.6) {
          ctx.globalAlpha = (itemProgress - 0.6) * 2.5;
          ctx.font = 'bold 11px ' + style.fontFamily;
          ctx.fillStyle = style.text;
          ctx.textAlign = 'left';
          ctx.fillText(formatValue(item.value), plotArea.x + lineLength + dotRadius + 8, y);
          ctx.globalAlpha = 1;
        }
      });
    } else {
      var itemWidth = plotArea.width / data.length;
      var dotRadius = Math.min(10, itemWidth * 0.20);

      data.forEach(function(item, i) {
        var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.06) * 1.6));
        if (itemProgress <= 0) return;

        var x = plotArea.x + i * itemWidth + itemWidth / 2;
        var barHeight = (item.value / maxValue) * plotArea.height * itemProgress;
        var dotY = plotArea.y + plotArea.height - barHeight;
        var color = item.color || style.colors[i % style.colors.length];

        // Stem
        ctx.beginPath();
        ctx.moveTo(x, plotArea.y + plotArea.height);
        ctx.lineTo(x, dotY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Dot
        ctx.beginPath();
        ctx.arc(x, dotY, dotRadius * itemProgress, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = 'bold 10px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, x, plotArea.y + plotArea.height + 8);

        // Value
        if (itemProgress > 0.6) {
          ctx.globalAlpha = (itemProgress - 0.6) * 2.5;
          ctx.font = 'bold 11px ' + style.fontFamily;
          ctx.textBaseline = 'bottom';
          ctx.fillText(formatValue(item.value), x, dotY - dotRadius - 5);
          ctx.globalAlpha = 1;
        }
      });
    }

    // Baseline
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(plotArea.x, plotArea.y);
      ctx.lineTo(plotArea.x, plotArea.y + plotArea.height);
    } else {
      ctx.moveTo(plotArea.x, plotArea.y + plotArea.height);
      ctx.lineTo(plotArea.x + plotArea.width, plotArea.y + plotArea.height);
    }
    ctx.strokeStyle = style.gridLine;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LollipopChartTemplate;
}
