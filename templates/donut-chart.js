/**
 * Donut Chart Template
 * Pie chart with a hollow center for displaying totals or key metrics
 * Best for: Budget breakdowns with total, market share with center stat
 */

var DonutChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Category', value: 30, color: '#FF0000'}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var centerX = width * 0.38;
    var centerY = height * 0.52;
    var outerRadius = Math.min(width, height) * 0.30;
    var innerRadius = outerRadius * 0.60;

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

    var total = data.reduce(function(sum, d) { return sum + d.value; }, 0);
    var eased = easeOutCubic(progress);

    // Draw segments
    var startAngle = -Math.PI / 2;
    data.forEach(function(item, i) {
      var segmentAngle = (item.value / total) * Math.PI * 2;
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.05) * 1.5));
      var currentAngle = segmentAngle * itemProgress;

      if (currentAngle > 0) {
        var color = item.color || style.colors[i % style.colors.length];

        // Segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + currentAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + currentAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Separator
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      startAngle += segmentAngle;
    });

    // Center content
    if (eased > 0.3) {
      var centerAlpha = (eased - 0.3) * 1.4;
      ctx.globalAlpha = Math.min(1, centerAlpha);

      // Center circle background
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius - 5, 0, Math.PI * 2);
      ctx.fillStyle = style.background;
      ctx.fill();

      // Center value
      var centerValue = options.centerValue || total;
      var centerLabel = options.centerLabel || 'Total';

      ctx.font = 'bold 36px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatValue(centerValue), centerX, centerY - 10);

      ctx.font = '14px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.fillText(centerLabel, centerX, centerY + 20);

      ctx.globalAlpha = 1;
    }

    // Legend (right side)
    var legendX = width * 0.62;
    var legendStartY = height * 0.25;
    var legendItemHeight = Math.min(50, (height * 0.55) / data.length);

    data.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - 0.3 - i * 0.05) * 2));
      if (itemProgress <= 0) return;

      ctx.globalAlpha = itemProgress;
      var y = legendStartY + i * legendItemHeight;
      var color = item.color || style.colors[i % style.colors.length];
      var percentage = ((item.value / total) * 100).toFixed(1);

      // Color box
      ctx.fillStyle = color;
      ctx.fillRect(legendX, y, 16, 16);

      // Label
      ctx.font = 'bold 13px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(item.label, legendX + 24, y);

      // Value and percentage
      ctx.font = '12px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.fillText(formatValue(item.value) + ' (' + percentage + '%)', legendX + 24, y + 18);

      ctx.globalAlpha = 1;
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DonutChartTemplate;
}
