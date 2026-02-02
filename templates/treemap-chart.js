/**
 * Treemap Chart Template
 * Shows hierarchical data as nested rectangles
 * Best for: File sizes, budget allocation, market cap by sector, portfolio composition
 */

var TreemapChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{label: 'Tech', value: 40, children: [{label: 'Apple', value: 20}]}]
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var treemapArea = {
      x: width * 0.05,
      y: height * 0.18,
      width: width * 0.90,
      height: height * 0.72
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

    var eased = easeOutCubic(progress);

    // Calculate total
    var total = data.reduce(function(sum, d) { return sum + d.value; }, 0);

    // Simple squarified treemap algorithm
    var rects = [];
    var x = treemapArea.x;
    var y = treemapArea.y;
    var w = treemapArea.width;
    var h = treemapArea.height;

    // Sort by value descending
    var sortedData = data.slice().sort(function(a, b) { return b.value - a.value; });

    // Lay out rectangles using slice-and-dice
    var isVertical = w < h;
    var remaining = total;

    sortedData.forEach(function(item, i) {
      var ratio = item.value / remaining;
      var rect;

      if (isVertical) {
        var rectHeight = h * ratio;
        rect = { x: x, y: y, width: w, height: rectHeight, item: item, colorIndex: i };
        y += rectHeight;
        h -= rectHeight;
      } else {
        var rectWidth = w * ratio;
        rect = { x: x, y: y, width: rectWidth, height: h, item: item, colorIndex: i };
        x += rectWidth;
        w -= rectWidth;
      }

      remaining -= item.value;
      isVertical = !isVertical;
      rects.push(rect);
    });

    // Draw rectangles
    rects.forEach(function(rect, i) {
      var itemProgress = Math.min(1, Math.max(0, (eased - i * 0.05) * 1.5));
      if (itemProgress <= 0) return;

      var color = style.colors[rect.colorIndex % style.colors.length];

      // Animate from center
      var cx = rect.x + rect.width / 2;
      var cy = rect.y + rect.height / 2;
      var animW = rect.width * itemProgress;
      var animH = rect.height * itemProgress;
      var animX = cx - animW / 2;
      var animY = cy - animH / 2;

      // Fill
      ctx.fillStyle = color;
      ctx.fillRect(animX, animY, animW, animH);

      // Border
      ctx.strokeStyle = style.background;
      ctx.lineWidth = 2;
      ctx.strokeRect(animX, animY, animW, animH);

      // Label (only if rectangle is large enough)
      if (itemProgress > 0.6 && animW > 50 && animH > 30) {
        var labelAlpha = (itemProgress - 0.6) * 2.5;
        ctx.globalAlpha = labelAlpha;

        var fontSize = Math.min(16, Math.max(10, Math.min(animW / 6, animH / 3)));
        ctx.font = 'bold ' + fontSize + 'px ' + style.fontFamily;
        ctx.fillStyle = getBrightness(color) > 128 ? '#000000' : '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Truncate label if needed
        var label = rect.item.label;
        var maxWidth = animW - 10;
        while (ctx.measureText(label).width > maxWidth && label.length > 3) {
          label = label.slice(0, -1);
        }
        if (label !== rect.item.label) label += '…';

        ctx.fillText(label, cx, cy - 8);

        // Value
        var percentage = ((rect.item.value / total) * 100).toFixed(1) + '%';
        ctx.font = (fontSize - 2) + 'px ' + style.fontFamily;
        ctx.fillText(percentage, cx, cy + 10);

        ctx.globalAlpha = 1;
      }
    });
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function getBrightness(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TreemapChartTemplate;
}
