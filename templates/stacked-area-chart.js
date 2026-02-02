/**
 * Stacked Area Chart Template
 * Shows composition changes over time with areas stacked to 100%
 * Best for: Energy mix over time, market share trends, budget allocation history
 */

var StackedAreaChartTemplate = {
  render: function(ctx, config, progress) {
    var data = config.data; // [{period: '2020', values: {Solar: 10, Wind: 15, Coal: 50, Nuclear: 25}}]
    var categories = config.categories; // ['Solar', 'Wind', 'Coal', 'Nuclear']
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    // Layout calculations
    var plotArea = {
      x: width * 0.12,
      y: height * 0.18,
      width: width * 0.83,
      height: height * 0.58
    };

    // Normalize data to 100%
    var normalizedData = data.map(function(d) {
      var total = categories.reduce(function(sum, cat) { return sum + (d.values[cat] || 0); }, 0);
      var normalized = {};
      categories.forEach(function(cat) {
        normalized[cat] = total > 0 ? (d.values[cat] || 0) / total * 100 : 0;
      });
      return { period: d.period, values: normalized };
    });

    // Clear background
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // Title
    if (config.title) {
      ctx.font = 'bold 28px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.title, width / 2, height * 0.05);
    }

    // Subtitle
    if (config.subtitle) {
      ctx.font = '14px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(config.subtitle, width / 2, height * 0.10);
    }

    // Animation
    var eased = easeOutCubic(progress);
    var pointsToShow = Math.floor(eased * (data.length - 1)) + 1;
    var partialProgress = (eased * (data.length - 1)) % 1;

    // Draw grid
    ctx.strokeStyle = style.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (var i = 0; i <= 4; i++) {
      var y = plotArea.y + (plotArea.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(plotArea.x, y);
      ctx.lineTo(plotArea.x + plotArea.width, y);
      ctx.stroke();

      // Y-axis labels
      ctx.setLineDash([]);
      ctx.font = 'bold 11px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText((100 - i * 25) + '%', plotArea.x - 8, y);
      ctx.setLineDash([4, 4]);
    }
    ctx.setLineDash([]);

    // Scale functions
    function scaleX(index) {
      return plotArea.x + (index / (data.length - 1)) * plotArea.width;
    }
    function scaleY(percent) {
      return plotArea.y + plotArea.height - (percent / 100) * plotArea.height;
    }

    // Draw stacked areas (bottom to top)
    categories.slice().reverse().forEach(function(cat, catIndex) {
      var colorIndex = categories.length - 1 - catIndex;
      var color = style.colors[colorIndex % style.colors.length];

      ctx.beginPath();
      ctx.moveTo(scaleX(0), scaleY(0));

      // Calculate cumulative values
      var cumulativeBottom = [];
      var cumulativeTop = [];

      for (var i = 0; i < data.length; i++) {
        var bottom = 0;
        var top = 0;
        for (var j = categories.length - 1; j >= colorIndex; j--) {
          top += normalizedData[i].values[categories[j]] || 0;
        }
        for (var j = categories.length - 1; j > colorIndex; j--) {
          bottom += normalizedData[i].values[categories[j]] || 0;
        }
        cumulativeBottom.push(bottom);
        cumulativeTop.push(top);
      }

      // Draw top edge
      for (var i = 0; i < pointsToShow; i++) {
        var x = scaleX(i);
        var y = scaleY(cumulativeTop[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Partial segment
      if (pointsToShow < data.length && partialProgress > 0) {
        var prevTop = cumulativeTop[pointsToShow - 1];
        var nextTop = cumulativeTop[pointsToShow];
        var interpTop = prevTop + (nextTop - prevTop) * partialProgress;
        ctx.lineTo(scaleX(pointsToShow - 1 + partialProgress), scaleY(interpTop));
      }

      // Draw bottom edge (reverse)
      var lastIndex = pointsToShow - 1 + (partialProgress > 0 ? partialProgress : 0);
      if (partialProgress > 0 && pointsToShow < data.length) {
        var prevBottom = cumulativeBottom[pointsToShow - 1];
        var nextBottom = cumulativeBottom[pointsToShow];
        var interpBottom = prevBottom + (nextBottom - prevBottom) * partialProgress;
        ctx.lineTo(scaleX(pointsToShow - 1 + partialProgress), scaleY(interpBottom));
      }

      for (var i = pointsToShow - 1; i >= 0; i--) {
        ctx.lineTo(scaleX(i), scaleY(cumulativeBottom[i]));
      }

      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, 0.8);
      ctx.fill();
    });

    // X-axis labels
    ctx.font = 'bold 11px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var labelInterval = Math.ceil(data.length / 8);
    data.forEach(function(d, i) {
      if (i % labelInterval === 0 || i === data.length - 1) {
        ctx.fillText(d.period, scaleX(i), plotArea.y + plotArea.height + 8);
      }
    });

    // Legend
    var legendY = height * 0.88;
    var legendStartX = width / 2 - (categories.length * 80) / 2;
    ctx.font = 'bold 11px ' + style.fontFamily;

    categories.forEach(function(cat, i) {
      var x = legendStartX + i * 80;
      ctx.fillStyle = style.colors[i % style.colors.length];
      ctx.fillRect(x, legendY - 6, 14, 14);
      ctx.fillStyle = style.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(cat, x + 18, legendY + 1);
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
  module.exports = StackedAreaChartTemplate;
}
