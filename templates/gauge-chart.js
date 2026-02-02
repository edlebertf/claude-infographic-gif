/**
 * Gauge/Speedometer Chart Template
 * Shows a single value within a range with a dial indicator
 * Best for: KPIs, scores, performance metrics, satisfaction ratings
 */

var GaugeChartTemplate = {
  render: function(ctx, config, progress) {
    var value = config.value;
    var min = config.min || 0;
    var max = config.max || 100;
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var centerX = width / 2;
    var centerY = height * 0.58;
    var radius = Math.min(width, height) * 0.32;

    // Clear
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // Title
    if (config.title) {
      ctx.font = 'bold 28px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.fillText(config.title, width / 2, height * 0.08);
    }

    if (config.subtitle) {
      ctx.font = '14px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(config.subtitle, width / 2, height * 0.14);
    }

    var eased = easeOutCubic(progress);
    var normalizedValue = (value - min) / (max - min);
    var currentValue = normalizedValue * eased;

    // Gauge angles (from 220° to -40°, going clockwise)
    var startAngle = (220 * Math.PI) / 180;
    var endAngle = (-40 * Math.PI) / 180;
    var totalAngle = startAngle - endAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, endAngle, startAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = style.gridLine;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Colored zones (optional)
    if (options.zones) {
      options.zones.forEach(function(zone) {
        var zoneStart = startAngle - ((zone.from - min) / (max - min)) * totalAngle;
        var zoneEnd = startAngle - ((zone.to - min) / (max - min)) * totalAngle;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, zoneEnd, zoneStart);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 25;
        ctx.lineCap = 'butt';
        ctx.stroke();
      });
    } else {
      // Default gradient from red to yellow to green
      var gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      gradient.addColorStop(0, style.colors[3] || '#F44336');
      gradient.addColorStop(0.5, style.colors[4] || '#FFC107');
      gradient.addColorStop(1, style.colors[1] || '#4CAF50');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, endAngle, startAngle);
      ctx.lineWidth = 25;
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Value arc (shows progress)
    var valueAngle = startAngle - currentValue * totalAngle;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 35, valueAngle, startAngle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = style.colors[0];
    ctx.lineCap = 'round';
    ctx.stroke();

    // Tick marks
    for (var i = 0; i <= 10; i++) {
      var tickAngle = startAngle - (i / 10) * totalAngle;
      var tickInner = radius + 18;
      var tickOuter = radius + (i % 5 === 0 ? 30 : 25);

      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(tickAngle) * tickInner,
        centerY - Math.sin(tickAngle) * tickInner
      );
      ctx.lineTo(
        centerX + Math.cos(tickAngle) * tickOuter,
        centerY - Math.sin(tickAngle) * tickOuter
      );
      ctx.strokeStyle = style.textMuted;
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.stroke();

      // Labels at major ticks
      if (i % 5 === 0) {
        var labelRadius = radius + 45;
        var tickValue = min + (i / 10) * (max - min);
        ctx.font = 'bold 12px ' + style.fontFamily;
        ctx.fillStyle = style.textMuted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          Math.round(tickValue).toString(),
          centerX + Math.cos(tickAngle) * labelRadius,
          centerY - Math.sin(tickAngle) * labelRadius
        );
      }
    }

    // Needle
    var needleAngle = startAngle - currentValue * totalAngle;
    var needleLength = radius - 15;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-needleAngle + Math.PI / 2);

    // Needle shadow
    ctx.beginPath();
    ctx.moveTo(-4, 10);
    ctx.lineTo(0, -needleLength);
    ctx.lineTo(4, 10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Needle
    ctx.beginPath();
    ctx.moveTo(-3, 8);
    ctx.lineTo(0, -needleLength + 5);
    ctx.lineTo(3, 8);
    ctx.closePath();
    ctx.fillStyle = style.colors[0];
    ctx.fill();

    ctx.restore();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = style.colors[0];
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = style.background;
    ctx.fill();

    // Value display
    var displayValue = min + currentValue * (max - min);
    ctx.font = 'bold 48px ' + style.fontFamily;
    ctx.fillStyle = style.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(Math.round(displayValue).toString() + (options.suffix || ''), centerX, centerY + 40);

    if (options.label) {
      ctx.font = '16px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.fillText(options.label, centerX, centerY + 95);
    }
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GaugeChartTemplate;
}
