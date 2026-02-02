/**
 * Funnel Chart Template
 * Shows progressive reduction through stages
 * Best for: Sales funnels, conversion rates, process stages, recruitment pipeline
 */

var FunnelChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{stage: 'Visitors', value: 10000}, {stage: 'Leads', value: 3000}...]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var funnelTop = height * 0.20;
    var funnelBottom = height * 0.82;
    var funnelHeight = funnelBottom - funnelTop;
    var maxWidth = width * 0.70;
    var minWidth = width * 0.20;
    var centerX = width / 2;

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

    var eased = easeOutCubic(progress);
    var maxValue = data[0].value;
    var segmentHeight = funnelHeight / data.length;

    data.forEach(function(item, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.08) * 1.5));
      if (itemProgress <= 0) return;

      var ratio = item.value / maxValue;
      var nextRatio = (i < data.length - 1) ? data[i + 1].value / maxValue : ratio * 0.6;

      var topY = funnelTop + i * segmentHeight;
      var bottomY = topY + segmentHeight;
      var topWidth = (maxWidth - minWidth) * ratio + minWidth;
      var bottomWidth = (maxWidth - minWidth) * nextRatio + minWidth;

      // Apply animation
      topWidth *= itemProgress;
      bottomWidth *= itemProgress;

      var color = style.colors[i % style.colors.length];

      // Draw trapezoid
      ctx.beginPath();
      ctx.moveTo(centerX - topWidth / 2, topY);
      ctx.lineTo(centerX + topWidth / 2, topY);
      ctx.lineTo(centerX + bottomWidth / 2, bottomY);
      ctx.lineTo(centerX - bottomWidth / 2, bottomY);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Separator line
      if (i < data.length - 1) {
        ctx.beginPath();
        ctx.moveTo(centerX - bottomWidth / 2 - 5, bottomY);
        ctx.lineTo(centerX + bottomWidth / 2 + 5, bottomY);
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Labels
      if (itemProgress > 0.5) {
        var labelAlpha = (itemProgress - 0.5) * 2;
        ctx.globalAlpha = labelAlpha;

        var midY = (topY + bottomY) / 2;

        // Stage name (left)
        ctx.font = 'bold 14px ' + style.fontFamily;
        ctx.fillStyle = style.text;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.stage, centerX - topWidth / 2 - 20, midY);

        // Value (right)
        ctx.textAlign = 'left';
        ctx.fillText(formatValue(item.value), centerX + topWidth / 2 + 20, midY - 8);

        // Conversion rate
        if (i > 0) {
          var conversionRate = ((item.value / data[i - 1].value) * 100).toFixed(1) + '%';
          ctx.font = '12px ' + style.fontFamily;
          ctx.fillStyle = style.textMuted;
          ctx.fillText(conversionRate, centerX + topWidth / 2 + 20, midY + 10);
        }

        ctx.globalAlpha = 1;
      }
    });

    // Overall conversion
    if (eased > 0.8) {
      var overallAlpha = (eased - 0.8) * 5;
      ctx.globalAlpha = overallAlpha;
      var overallRate = ((data[data.length - 1].value / data[0].value) * 100).toFixed(1);
      ctx.font = 'bold 14px ' + style.fontFamily;
      ctx.fillStyle = style.colors[0];
      ctx.textAlign = 'center';
      ctx.fillText('Overall: ' + overallRate + '% conversion', centerX, height * 0.92);
      ctx.globalAlpha = 1;
    }
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function formatValue(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FunnelChartTemplate;
}
