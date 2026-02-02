# Claude Infographic GIF

A Claude Code skill that creates beautiful, animated GIF infographics from your data. Just describe what you want - Claude handles everything else.

![Example Chart](https://img.shields.io/badge/Charts-23%20Types-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-purple)

## Features

- **23 chart types** - pie, bar, line, sankey, gauge, radar, funnel, treemap, heatmap, and more
- **5 visual styles** - dark, light, vibrant, corporate, minimal
- **Fully offline** - generates self-contained HTML files that work without internet
- **Dual export** - download as GIF or MP4 video
- **No dependencies** - pure JavaScript, works in any modern browser
- **Natural language** - just describe your data and chart type

## Installation

### As a Claude Code Skill

1. Clone this repository to your Claude Code skills directory:
   ```bash
   git clone https://github.com/edlebertf/claude-infographic-gif.git ~/.claude/skills/infographic-gif
   ```

2. The skill will be automatically available in Claude Code. Use it by typing:
   ```
   /infographic-gif pie chart of browser market share - Chrome 65%, Safari 20%, Firefox 10%, Other 5%
   ```

### Manual Use

You can also use the templates directly by copying the HTML output and opening in a browser.

## Supported Chart Types

### Proportions & Composition
- **Pie Chart** - Market share, simple proportions
- **Donut Chart** - Proportions with center stat
- **Treemap** - Hierarchical data, file sizes
- **Stacked Bar** - Composition across categories
- **Stacked Area** - Composition over time

### Comparisons & Rankings
- **Bar Chart** - Simple comparisons, rankings
- **Grouped Bar** - Multi-series comparisons
- **Lollipop Chart** - Clean, minimalist rankings
- **Dumbbell Chart** - Before/after comparisons

### Trends & Time Series
- **Line Chart** - Single metric over time
- **Multi-Line Chart** - Compare multiple trends
- **Area Chart** - Volume over time

### Relationships & Distributions
- **Scatter Chart** - Correlation analysis
- **Bubble Chart** - Three-variable analysis
- **Heatmap** - Correlation matrices, patterns

### Flows & Processes
- **Sankey Diagram** - Budget flows, resource allocation
- **Funnel Chart** - Conversion stages, pipelines
- **Waterfall Chart** - Cumulative effects, breakdowns

### Performance & KPIs
- **Gauge Chart** - Single KPI, speedometer-style
- **Radar Chart** - Multi-axis comparison
- **Progress Bars** - Goal completion tracking

### Highlights & Storytelling
- **Counter Animation** - Emphasize impressive numbers
- **Timeline** - History, milestones, phases

## Usage Examples

### Simple Pie Chart
```
/infographic-gif pie chart of browser market share - Chrome 65%, Safari 20%, Firefox 8%, Edge 5%, Other 2%
```

### Multi-Line Comparison
```
/infographic-gif multi-line chart comparing Netflix DVD vs Streaming subscribers from 2007-2024
```

### Sankey Flow Diagram
```
/infographic-gif sankey diagram showing budget flow: Revenue ($100M from Sales, $20M from Services) -> Expenses (Operations $50M, Marketing $30M, R&D $25M, Profit $15M)
```

### Funnel Chart
```
/infographic-gif funnel chart of sales pipeline: Leads 10000, Qualified 3000, Proposals 1000, Negotiations 500, Won 300
```

## Visual Styles

| Style | Description | Best For |
|-------|-------------|----------|
| **dark** | Dark background, bright accents | Tech, social media |
| **light** | White background, clean colors | Professional reports |
| **vibrant** | Bold, energetic colors | Marketing content |
| **corporate** | Blues and greens | Business presentations |
| **minimal** | Grayscale, simple | Elegant, understated |

## How It Works

1. You describe your data naturally
2. Claude generates a self-contained HTML file
3. Open the HTML in any browser
4. The chart animates automatically
5. Download as GIF or MP4

The generated HTML includes everything needed - no external dependencies, no server required.

## Output Specifications

- **Resolution**: 800x800 (square) or 900x600 (landscape)
- **Animation**: ~2.5 seconds
- **Hold time**: ~3 seconds at the end
- **Frame rate**: 20 FPS
- **GIF size**: 200-800 KB typical
- **MP4 size**: 500KB-2MB typical

## Project Structure

```
infographic-gif/
├── SKILL.md           # Claude Code skill definition
├── README.md          # This file
├── LICENSE            # MIT License
├── core/              # Core utilities
│   ├── html-template.js    # HTML generator with GIF encoder
│   ├── text-layout.js      # Text overlap prevention system
│   ├── gif-encoder.js      # Pure JS GIF encoder
│   ├── color-utils.js      # Color manipulation
│   ├── data-parser.js      # Data format parsing
│   └── ...
└── templates/         # Chart type templates
    ├── pie-chart.js
    ├── bar-chart.js
    ├── line-chart.js
    ├── sankey-chart.js
    └── ... (23 chart types)
```

## Data Input Formats

The skill accepts data in multiple formats:

**Plain text:**
```
Chrome: 65%
Safari: 20%
Firefox: 8%
```

**CSV:**
```csv
Month,Revenue
Jan,45000
Feb,52000
```

**JSON:**
```json
[
  {"label": "Chrome", "value": 65},
  {"label": "Safari", "value": 20}
]
```

**Natural language:**
> "Sales were 45K in Jan, 52K in Feb, 61K in March..."

## Contributing

Contributions are welcome! Feel free to:
- Add new chart types
- Improve animations
- Add new visual styles
- Fix bugs
- Improve documentation

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Created as a [Claude Code](https://claude.ai/claude-code) skill for generating animated data visualizations.
