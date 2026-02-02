/**
 * Stacked Bar Chart Template
 * Shows composition across categories with stacked segments
 * Best for: Budget breakdown by department, survey responses, demographic splits
 */

var StackedBarChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{category: 'Q1', values: {Product: 40, Service: 35, Support: 25}}]
    var segments = config.segments; // ['Product', 'Service', 'Support']
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;
    var isHorizontal = options.orientation === 'horizontal';

    var plotArea = {
      x: width * (isHorizontal ? 0.18 : 0.10),
      y: height * 0.20,
      width: width * (isHorizontal ? 0.77 : 0.85),
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

    var eased = easeOutCubic(progress);
    var maxTotal = Math.max.apply(null, data.map(function(d) {
      return segments.reduce(function(sum, seg) { return sum + (d.values[seg] || 0); }, 0);
    }));

    if (isHorizontal) {
      var barHeight = Math.min(45, (plotArea.height / data.length) * 0.7);
      var gap = (plotArea.height - barHeight * data.length) / (data.length + 1);

      data.forEach(function(item, i) {
        var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.05) * 1.5));
        if (itemProgress <= 0) return;

        var y = plotArea.y + gap + i * (barHeight + gap);
        var total = segments.reduce(function(sum, seg) { return sum + (item.values[seg] || 0); }, 0);
        var x = plotArea.x;

        // Category label
        ctx.font = 'bold 12px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.category, plotArea.x - 10, y + barHeight / 2);

        segments.forEach(function(seg, j) {
          var value = item.values[seg] || 0;
          var segWidth = (value / maxTotal) * plotArea.width * itemProgress;
          if (segWidth > 0) {
            ctx.fillStyle = style.colors[j % style.colors.length];
            roundRect(ctx, x, y, segWidth, barHeight, j === 0 ? 4 : 0, j === segments.length - 1 ? 4 : 0);
            ctx.fill();
            x += segWidth;
          }
        });
      });
    } else {
      var barWidth = Math.min(60, (plotArea.width / data.length) * 0.7);
      var gap = (plotArea.width - barWidth * data.length) / (data.length + 1);

      data.forEach(function(item, i) {
        var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.05) * 1.5));
        if (itemProgress <= 0) return;

        var x = plotArea.x + gap + i * (barWidth + gap);
        var total = segments.reduce(function(sum, seg) { return sum + (item.values[seg] || 0); }, 0);
        var y = plotArea.y + plotArea.height;

        segments.forEach(function(seg, j) {
          var value = item.values[seg] || 0;
          var segHeight = (value / maxTotal) * plotArea.height * itemProgress;
          if (segHeight > 0) {
            y -= segHeight;
            ctx.fillStyle = style.colors[j % style.colors.length];
            roundRect(ctx, x, y, barWidth, segHeight, j === segments.length - 1 ? 4 : 0, j === 0 ? 4 : 0);
            ctx.fill();
          }
        });

        // Category label
        ctx.font = 'bold 11px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(item.category, x + barWidth / 2, plotArea.y + plotArea.height + 8);
      });
    }

    // Legend
    var legendY = height * 0.88;
    var legendStartX = width / 2 - (segments.length * 80) / 2;
    ctx.font = 'bold 11px ' + style.fontFamily;

    segments.forEach(function(seg, i) {
      var x = legendStartX + i * 80;
      ctx.fillStyle = style.colors[i % style.colors.length];
      ctx.fillRect(x, legendY - 6, 14, 14);
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(seg, x + 18, legendY + 1);
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function roundRect(ctx, x, y, w, h, rTop, rBottom) {
  rTop = rTop || 0; rBottom = rBottom || 0;
  ctx.beginPath();
  ctx.moveTo(x + rTop, y);
  ctx.lineTo(x + w - rTop, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rTop);
  ctx.lineTo(x + w, y + h - rBottom);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rBottom, y + h);
  ctx.lineTo(x + rBottom, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rBottom);
  ctx.lineTo(x, y + rTop);
  ctx.quadraticCurveTo(x, y, x + rTop, y);
  ctx.closePath();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StackedBarChartTemplate;
}
