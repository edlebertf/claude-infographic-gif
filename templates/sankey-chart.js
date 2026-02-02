/**
 * Sankey Chart Template
 * Animated flow diagram showing connections between nodes
 *
 * Uses the Layout system for proper spacing:
 * - Title and subtitle in reserved title area
 * - Column headers at top of content area
 * - Chart elements in chartStartY/chartHeight area (below headers)
 */

var SankeyChartTemplate = {

  /**
   * Render a frame of the sankey chart
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} config - Chart configuration
   * @param {number} progress - Animation progress (0-1)
   */
  render: function(ctx, config, progress) {
    var leftNodes = config.leftNodes;   // Revenue/sources
    var rightNodes = config.rightNodes; // Expenditure/destinations
    var style = config.style;
    var layout = config.layout;
    var options = config.options || {};
    var width = layout.width;
    var height = layout.height;

    // Get sankey layout from Layout system
    var sankey = layout.getSankey(leftNodes.length, rightNodes.length);

    // Calculate totals
    var totalLeft = leftNodes.reduce(function(s, d) { return s + d.value; }, 0);
    var totalRight = rightNodes.reduce(function(s, d) { return s + d.value; }, 0);

    // Calculate node positions using chart area (not content area)
    var leftGap = 10;
    var rightGap = 6;

    var leftTotalHeight = sankey.chartHeight - leftGap * (leftNodes.length - 1);
    var leftPositions = [];
    var yOffset = sankey.chartStartY;

    leftNodes.forEach(function(node) {
      var h = (node.value / totalLeft) * leftTotalHeight;
      leftPositions.push({
        label: node.label,
        value: node.value,
        color: node.color,
        x: sankey.leftNodeX,
        y: yOffset,
        height: h
      });
      yOffset += h + leftGap;
    });

    var rightTotalHeight = sankey.chartHeight - rightGap * (rightNodes.length - 1);
    var rightPositions = [];
    yOffset = sankey.chartStartY;

    rightNodes.forEach(function(node) {
      var h = (node.value / totalRight) * rightTotalHeight;
      rightPositions.push({
        label: node.label,
        value: node.value,
        color: node.color,
        x: sankey.rightNodeX,
        y: yOffset,
        height: h
      });
      yOffset += h + rightGap;
    });

    // Center node position
    var centerX = sankey.centerNodeX;
    var centerY = sankey.chartStartY;
    var centerHeight = sankey.chartHeight;

    // Clear background
    ctx.fillStyle = style.background;
    ctx.fillRect(0, 0, width, height);

    // Title (in reserved title area, NOT in content)
    if (config.title) {
      var titleLayout = layout.getTitle();
      ctx.font = 'bold ' + titleLayout.fontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.title, titleLayout.x, titleLayout.y);
    }

    // Subtitle (below title, still in title area)
    if (config.subtitle) {
      var subLayout = layout.getSubtitle();
      ctx.font = subLayout.fontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.subtitle, subLayout.x, subLayout.y);
    }

    // Column headers (at top of content area, above chart)
    ctx.font = 'bold 12px ' + style.fontFamily;
    ctx.fillStyle = style.textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(options.leftLabel || 'SOURCES', sankey.leftNodeX + sankey.nodeWidth / 2, sankey.columnHeaderY);
    ctx.fillText(options.centerLabel || 'TOTAL', width / 2, sankey.columnHeaderY);
    ctx.fillText(options.rightLabel || 'USES', sankey.rightNodeX + sankey.nodeWidth / 2, sankey.columnHeaderY);

    // Animation phases
    var phase1 = Math.min(1, progress * 2.5);        // Left flows
    var phase2 = Math.min(1, Math.max(0, (progress - 0.35) * 2.5)); // Right flows
    var phase3 = Math.min(1, Math.max(0, (progress - 0.55) * 2.5));  // Labels

    // Flow height ratios
    var leftTotalH = leftPositions.reduce(function(s, n) { return s + n.height; }, 0);
    var rightTotalH = rightPositions.reduce(function(s, n) { return s + n.height; }, 0);

    // Draw left flows
    var leftFlowY = centerY;
    leftPositions.forEach(function(node, i) {
      var flowProgress = easeOutCubic(Math.min(1, Math.max(0, phase1 - i * 0.07) / 0.65));
      if (flowProgress > 0) {
        var targetH = node.height * (centerHeight / leftTotalH);
        drawFlow(ctx,
          node.x + sankey.nodeWidth, node.y, node.y + node.height,
          centerX, leftFlowY, leftFlowY + targetH,
          node.color, flowProgress, options.flowOpacity || 0.55
        );
      }
      leftFlowY += node.height * (centerHeight / leftTotalH);
    });

    // Draw right flows
    var rightFlowY = centerY;
    rightPositions.forEach(function(node, i) {
      var flowProgress = easeOutCubic(Math.min(1, Math.max(0, phase2 - i * 0.05) / 0.55));
      if (flowProgress > 0) {
        var targetH = node.height * (centerHeight / rightTotalH);
        drawFlow(ctx,
          centerX + sankey.nodeWidth, rightFlowY, rightFlowY + targetH,
          node.x, node.y, node.y + node.height,
          node.color, flowProgress, options.flowOpacity || 0.55
        );
      }
      rightFlowY += node.height * (centerHeight / rightTotalH);
    });

    // Draw left nodes
    leftPositions.forEach(function(node, i) {
      var nodeProgress = easeOutCubic(Math.min(1, phase1 * 1.4 - i * 0.08));
      if (nodeProgress > 0) {
        ctx.globalAlpha = nodeProgress;
        ctx.fillStyle = node.color;
        roundRect(ctx, node.x, node.y, sankey.nodeWidth, node.height, 5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // Draw center node
    var centerProgress = easeOutCubic(Math.min(1, phase1 * 1.2));
    if (centerProgress > 0) {
      ctx.globalAlpha = centerProgress;
      var gradient = ctx.createLinearGradient(centerX, centerY, centerX, centerY + centerHeight);
      gradient.addColorStop(0, style.colors ? style.colors[0] : '#58A6FF');
      gradient.addColorStop(0.5, style.colors ? (style.colors[2] || style.colors[0]) : '#A371F7');
      gradient.addColorStop(1, style.colors ? (style.colors[1] || style.colors[0]) : '#3FB950');
      ctx.fillStyle = gradient;
      roundRect(ctx, centerX, centerY, sankey.nodeWidth, centerHeight, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw right nodes
    rightPositions.forEach(function(node, i) {
      var nodeProgress = easeOutCubic(Math.min(1, phase2 * 1.4 - i * 0.06));
      if (nodeProgress > 0) {
        ctx.globalAlpha = nodeProgress;
        ctx.fillStyle = node.color;
        roundRect(ctx, node.x, node.y, sankey.nodeWidth, node.height, 5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // Draw labels
    var labelAlpha = easeOutCubic(phase3);
    ctx.globalAlpha = labelAlpha;

    // Left labels
    ctx.textAlign = 'right';
    leftPositions.forEach(function(node) {
      var midY = node.y + node.height / 2;
      ctx.font = 'bold ' + sankey.labelFontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textBaseline = 'bottom';
      ctx.fillText(node.label, sankey.leftLabelX, midY - 2);
      ctx.font = sankey.valueFontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = node.color;
      ctx.textBaseline = 'top';
      ctx.fillText(formatValue(node.value, options), sankey.leftLabelX, midY + 2);
    });

    // Center label (rotated)
    ctx.save();
    ctx.translate(width / 2, centerY + centerHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 17px ' + style.fontFamily;
    ctx.fillStyle = style.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var totalLabel = options.totalLabel || formatValue(totalLeft, options);
    ctx.fillText(totalLabel, 0, -sankey.nodeWidth - 12);
    ctx.restore();

    // Right labels
    ctx.textAlign = 'left';
    rightPositions.forEach(function(node) {
      var midY = node.y + node.height / 2;
      ctx.font = 'bold ' + sankey.labelFontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = style.text;
      ctx.textBaseline = 'bottom';
      ctx.fillText(node.label, sankey.rightLabelX, midY - 2);
      ctx.font = sankey.valueFontSize + 'px ' + style.fontFamily;
      ctx.fillStyle = node.color;
      ctx.textBaseline = 'top';
      ctx.fillText(formatValue(node.value, options), sankey.rightLabelX, midY + 2);
    });

    ctx.globalAlpha = 1;
  }
};

// Helper functions
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFlow(ctx, x1, y1Top, y1Bottom, x2, y2Top, y2Bottom, color, progress, opacity) {
  var controlOffset = Math.abs(x2 - x1) * 0.5;

  ctx.globalAlpha = opacity * progress;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1Top);

  var midX = x1 + (x2 - x1) * progress;
  var midYTop = y1Top + (y2Top - y1Top) * progress;
  var midYBottom = y1Bottom + (y2Bottom - y1Bottom) * progress;

  ctx.bezierCurveTo(
    x1 + controlOffset * progress, y1Top,
    midX - controlOffset * progress, midYTop,
    midX, midYTop
  );
  ctx.lineTo(midX, midYBottom);
  ctx.bezierCurveTo(
    midX - controlOffset * progress, midYBottom,
    x1 + controlOffset * progress, y1Bottom,
    x1, y1Bottom
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function formatValue(num, options) {
  var prefix = options.valuePrefix || '';
  var suffix = options.valueSuffix || '';

  if (num >= 1000000000) {
    return prefix + (num / 1000000000).toFixed(1) + 'B' + suffix;
  } else if (num >= 1000000) {
    return prefix + (num / 1000000).toFixed(1) + 'M' + suffix;
  } else if (num >= 1000) {
    return prefix + (num / 1000).toFixed(1) + 'K' + suffix;
  } else {
    return prefix + num.toFixed(options.decimals || 1) + suffix;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SankeyChartTemplate;
}
