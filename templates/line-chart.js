/**
 * Line Chart Template
 * Animated line that draws from left to right with points appearing
 */

var LineChartTemplate = {

  /**
   * Render a frame of the line chart
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} config - Chart configuration
   * @param {number} progress - Animation progress (0-1)
   */
  render: function(ctx, config, progress) {
    var data = config.data;
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    // Get chart area
    var chart = layout.getLineChart();
    var area = chart.area;

    // Calculate data ranges
    var values = data.map(function(d) { return d.value; });
    var minValue = 0;
    var maxValue = Math.ceil(Math.max.apply(null, values) * 1.15);

    // Scale functions
    function scaleX(index) {
      return area.x + (index / (data.length - 1)) * area.width;
    }
    function scaleY(value) {
      return area.y + area.height - ((value - minValue) / (maxValue - minValue)) * area.height;
    }

    // Clear background
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // Title
    if (config.title) {
      var titleLayout = layout.getTitle();
      ctx.font = 'bold ' + titleLayout.fontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.title, titleLayout.x, titleLayout.y);
    }

    // Subtitle
    if (config.subtitle) {
      var subLayout = layout.getSubtitle();
      ctx.font = subLayout.fontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(config.subtitle, subLayout.x, subLayout.y);
    }

    // Grid lines
    if (options.showGrid !== false) {
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      var gridSteps = 5;
      for (var i = 0; i <= gridSteps; i++) {
        var gridY = area.y + (area.height / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(area.x, gridY);
        ctx.lineTo(area.x + area.width, gridY);
        ctx.stroke();

        // Y-axis labels
        var gridValue = maxValue - (maxValue / gridSteps) * i;
        ctx.font = 'bold ' + chart.labelFontSize + 'px ' + style.fontFamily;
        ctx.fillStyle = style.textMuted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.setLineDash([]);
        ctx.fillText(formatValue(gridValue, options), area.x - 12, gridY);
        ctx.setLineDash([5, 5]);
      }
      ctx.setLineDash([]);
    }

    // X-axis labels
    ctx.font = 'bold ' + chart.labelFontSize + 'px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    data.forEach(function(d, i) {
      ctx.fillText(d.label, scaleX(i), area.y + area.height + 12);
    });

    // Axes
    ctx.strokeStyle = style.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(area.x, area.y);
    ctx.lineTo(area.x, area.y + area.height);
    ctx.lineTo(area.x + area.width, area.y + area.height);
    ctx.stroke();

    // Animation: how many points to show
    var eased = easeOutCubic(progress);
    var pointsProgress = eased * (data.length - 1);

    // Draw filled area under line
    if (options.showArea !== false) {
      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(0));

      for (var i = 0; i < data.length; i++) {
        var pointProg = Math.min(1, Math.max(0, pointsProgress - i + 1));
        if (pointProg <= 0) break;

        var x = scaleX(i);
        var y = scaleY(data[i].value);

        if (pointProg < 1 && i > 0) {
          var prevX = scaleX(i - 1);
          var prevY = scaleY(data[i - 1].value);
          x = prevX + (x - prevX) * pointProg;
          y = prevY + (y - prevY) * pointProg;
        }

        ctx.lineTo(x, y);
      }

      // Close to baseline
      var lastIdx = Math.min(Math.ceil(pointsProgress), data.length - 1);
      var lastX = scaleX(lastIdx);
      var partial = pointsProgress - Math.floor(pointsProgress);
      if (partial > 0 && lastIdx < data.length - 1) {
        lastX = scaleX(Math.floor(pointsProgress)) +
                (scaleX(lastIdx) - scaleX(Math.floor(pointsProgress))) * partial;
      }
      ctx.lineTo(lastX, scaleY(0));
      ctx.closePath();
      ctx.fillStyle = colorWithOpacity(style.colors[0], 0.15);
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    ctx.lineWidth = chart.lineWidth;
    ctx.strokeStyle = style.colors[0];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (var i = 0; i < data.length; i++) {
      var pointProg = Math.min(1, Math.max(0, pointsProgress - i + 1));
      if (pointProg <= 0) break;

      var x = scaleX(i);
      var y = scaleY(data[i].value);

      if (pointProg < 1 && i > 0) {
        var prevX = scaleX(i - 1);
        var prevY = scaleY(data[i - 1].value);
        x = prevX + (x - prevX) * pointProg;
        y = prevY + (y - prevY) * pointProg;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw points and labels
    if (options.showPoints !== false) {
      for (var i = 0; i < data.length; i++) {
        var pointProg = Math.min(1, Math.max(0, pointsProgress - i + 1));
        if (pointProg < 0.5) continue;

        var opacity = Math.min(1, (pointProg - 0.5) * 2);
        var x = scaleX(i);
        var y = scaleY(data[i].value);

        ctx.globalAlpha = opacity;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, chart.pointRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = colorWithOpacity(style.colors[0], 0.3);
        ctx.fill();

        // Point
        ctx.beginPath();
        ctx.arc(x, y, chart.pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = style.colors[0];
        ctx.fill();
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Value label
        if (options.showValues !== false) {
          ctx.font = 'bold ' + chart.valueFontSize + 'px ' + style.fontFamily;
          ctx.fillStyle = style.text;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(formatValue(data[i].value, options), x, y - 14);
        }

        ctx.globalAlpha = 1;
      }
    }
  }
};

// Helper functions
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function colorWithOpacity(hex, opacity) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
}

function formatValue(num, options) {
  var prefix = options.prefix || '';
  var suffix = options.suffix || '';
  var decimals = options.decimals || 0;

  if (num >= 1000000) {
    return prefix + (num / 1000000).toFixed(1) + 'M' + suffix;
  } else if (num >= 1000) {
    return prefix + (num / 1000).toFixed(1) + 'K' + suffix;
  } else {
    return prefix + num.toFixed(decimals) + suffix;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LineChartTemplate;
}
