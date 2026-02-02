/**
 * Heatmap Chart Template
 * Shows values in a matrix using color intensity
 * Best for: Correlation matrices, activity by time, geographic density
 */

var HeatmapChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // {rows: ['Mon','Tue'...], cols: ['9am','10am'...], values: [[1,2],[3,4]]}
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    var plotArea = {
      x: width * 0.15,
      y: height * 0.22,
      width: width * 0.75,
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

    var rows = data.rows;
    var cols = data.cols;
    var values = data.values;

    // Find min/max
    var minVal = Infinity, maxVal = -Infinity;
    values.forEach(function(row) {
      row.forEach(function(val) {
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      });
    });

    var cellWidth = plotArea.width / cols.length;
    var cellHeight = plotArea.height / rows.length;
    var eased = easeOutCubic(progress);

    // Color scale (blue to red)
    function getColor(val) {
      var t = (val - minVal) / (maxVal - minVal);
      // Low (blue) to High (red) through white
      var r, g, b;
      if (t < 0.5) {
        r = Math.round(255 * t * 2);
        g = Math.round(255 * t * 2);
        b = 255;
      } else {
        r = 255;
        g = Math.round(255 * (1 - (t - 0.5) * 2));
        b = Math.round(255 * (1 - (t - 0.5) * 2));
      }
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    // Draw cells
    rows.forEach(function(row, rowIndex) {
      cols.forEach(function(col, colIndex) {
        var cellProgress = Math.min(1, Math.max(0, (eased - (rowIndex * cols.length + colIndex) * 0.005) * 1.5));
        if (cellProgress <= 0) return;

        var x = plotArea.x + colIndex * cellWidth;
        var y = plotArea.y + rowIndex * cellHeight;
        var val = values[rowIndex][colIndex];
        var color = getColor(val);

        // Animate from center
        var animWidth = cellWidth * cellProgress - 2;
        var animHeight = cellHeight * cellProgress - 2;
        var animX = x + (cellWidth - animWidth) / 2;
        var animY = y + (cellHeight - animHeight) / 2;

        ctx.fillStyle = color;
        ctx.fillRect(animX, animY, animWidth, animHeight);

        // Value text (only for larger cells)
        if (cellProgress > 0.7 && cellWidth > 35 && cellHeight > 25) {
          ctx.globalAlpha = (cellProgress - 0.7) * 3.3;
          var brightness = getBrightness(color);
          ctx.font = 'bold 10px ' + style.fontFamily;
          ctx.fillStyle = brightness > 180 ? '#000000' : '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString(), x + cellWidth / 2, y + cellHeight / 2);
          ctx.globalAlpha = 1;
        }
      });
    });

    // Row labels
    ctx.font = 'bold 11px ' + style.fontFamily;
    ctx.fillStyle = style.text;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    rows.forEach(function(row, i) {
      ctx.fillText(row, plotArea.x - 8, plotArea.y + i * cellHeight + cellHeight / 2);
    });

    // Column labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    cols.forEach(function(col, i) {
      ctx.save();
      ctx.translate(plotArea.x + i * cellWidth + cellWidth / 2, plotArea.y - 8);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
      ctx.fillText(col, 0, 0);
      ctx.restore();
    });

    // Color legend
    var legendX = plotArea.x + plotArea.width + 15;
    var legendY = plotArea.y;
    var legendWidth = 15;
    var legendHeight = plotArea.height;

    var gradient = ctx.createLinearGradient(legendX, legendY + legendHeight, legendX, legendY);
    gradient.addColorStop(0, getColor(minVal));
    gradient.addColorStop(0.5, getColor((minVal + maxVal) / 2));
    gradient.addColorStop(1, getColor(maxVal));

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

    ctx.font = '10px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(maxVal.toString(), legendX + legendWidth + 5, legendY);
    ctx.textBaseline = 'bottom';
    ctx.fillText(minVal.toString(), legendX + legendWidth + 5, legendY + legendHeight);
  }
};

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function getBrightness(color) {
  var match = color.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (match) {
    return (parseInt(match[1]) * 299 + parseInt(match[2]) * 587 + parseInt(match[3]) * 114) / 1000;
  }
  return 128;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeatmapChartTemplate;
}
