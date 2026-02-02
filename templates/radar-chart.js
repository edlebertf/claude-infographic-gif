/**
 * Radar/Spider Chart Template
 * Shows multiple variables on axes from a central point
 * Best for: Skill assessments, product comparisons, performance profiles
 */

var RadarChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{name: 'Product A', values: {Speed: 80, Quality: 90, Price: 70}}]
    var axes = config.axes; // ['Speed', 'Quality', 'Price', 'Support', 'Features']
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var centerX = width / 2;
    var centerY = height * 0.52;
    var radius = Math.min(width, height) * 0.30;
    var levels = 5;

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
    var angleStep = (Math.PI * 2) / axes.length;

    // Draw grid levels
    for (var level = 1; level <= levels; level++) {
      var levelRadius = (radius / levels) * level;
      ctx.beginPath();
      for (var i = 0; i <= axes.length; i++) {
        var angle = -Math.PI / 2 + i * angleStep;
        var x = centerX + Math.cos(angle) * levelRadius;
        var y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    axes.forEach(function(axis, i) {
      var angle = -Math.PI / 2 + i * angleStep;
      var x = centerX + Math.cos(angle) * radius;
      var y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = style.gridLine;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis labels
      var labelRadius = radius + 25;
      var labelX = centerX + Math.cos(angle) * labelRadius;
      var labelY = centerY + Math.sin(angle) * labelRadius;

      ctx.font = 'bold 12px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Adjust alignment based on position
      if (Math.abs(angle + Math.PI / 2) < 0.1) ctx.textBaseline = 'bottom';
      else if (Math.abs(angle - Math.PI / 2) < 0.1) ctx.textBaseline = 'top';
      if (angle > -Math.PI / 2 && angle < Math.PI / 2) ctx.textAlign = 'left';
      else if (angle > Math.PI / 2 || angle < -Math.PI / 2) ctx.textAlign = 'right';

      ctx.fillText(axis, labelX, labelY);
    });

    // Draw data polygons
    data.forEach(function(series, seriesIndex) {
      var color = style.colors[seriesIndex % style.colors.length];
      var seriesProgress = Math.min(1, Math.max(0, (eased - seriesIndex * 0.15) * 1.8));

      if (seriesProgress <= 0) return;

      // Fill
      ctx.beginPath();
      axes.forEach(function(axis, i) {
        var value = (series.values[axis] || 0) / 100;
        var angle = -Math.PI / 2 + i * angleStep;
        var r = radius * value * seriesProgress;
        var x = centerX + Math.cos(angle) * r;
        var y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, 0.25);
      ctx.fill();

      // Stroke
      ctx.beginPath();
      axes.forEach(function(axis, i) {
        var value = (series.values[axis] || 0) / 100;
        var angle = -Math.PI / 2 + i * angleStep;
        var r = radius * value * seriesProgress;
        var x = centerX + Math.cos(angle) * r;
        var y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Points
      axes.forEach(function(axis, i) {
        var value = (series.values[axis] || 0) / 100;
        var angle = -Math.PI / 2 + i * angleStep;
        var r = radius * value * seriesProgress;
        var x = centerX + Math.cos(angle) * r;
        var y = centerY + Math.sin(angle) * r;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = style.background;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Legend
    var legendY = height * 0.90;
    var legendStartX = width / 2 - (data.length * 100) / 2;

    data.forEach(function(series, i) {
      var x = legendStartX + i * 100;
      ctx.fillStyle = style.colors[i % style.colors.length];
      ctx.fillRect(x, legendY - 6, 14, 14);
      ctx.font = 'bold 12px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(series.name, x + 20, legendY + 1);
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RadarChartTemplate;
}
