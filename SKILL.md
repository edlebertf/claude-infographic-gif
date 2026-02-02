---
name: infographic-gif
description: Create animated GIF infographics from data. Supports 23 chart types including pie, bar, line, scatter, sankey, gauge, radar, funnel, treemap, heatmap, and more. Just describe your data and chart type.
argument-hint: [chart description with data, e.g. "pie chart of browser market share - Chrome 65%, Safari 20%"]
allowed-tools: Read, Write, Bash, Glob, Grep, Edit
---

# infographic-gif

Create beautiful, animated GIF infographics from your data. Just provide your data and preferences - I handle everything else.

## Implementation Notes (for Claude)

### CRITICAL: Text Overlap Prevention (MANDATORY)

**EVERY chart MUST use the TextLayoutManager from `core/text-layout.js` to prevent text overlaps.**

This is NON-NEGOTIABLE. Text overlapping is the #1 quality issue. Follow this pattern:

```javascript
// At start of renderFrame function:
var textMgr = TextLayoutManager.create(ctx, { x: 0, y: 0, width: WIDTH, height: HEIGHT });

// For EVERY text element, use placeText instead of fillText:
textMgr.placeText('Label', x, y, {
  font: 'bold 14px Arial',
  color: '#FFFFFF',
  align: 'right',       // 'left', 'center', 'right'
  baseline: 'middle',   // 'top', 'middle', 'bottom'
  alpha: 1.0
});

// For non-text elements (bars, dots, lines), reserve their space:
textMgr.reserveRegion(barX, barY, barWidth, barHeight);
```

**The TextLayoutManager will automatically:**
1. Track all placed text regions
2. Detect potential overlaps before drawing
3. Shift text to a non-overlapping position if needed
4. Ensure text stays within chart bounds

**Order of operations in renderFrame:**
1. Clear canvas and draw background
2. Create TextLayoutManager instance
3. Place title and subtitle FIRST (highest priority)
4. Reserve regions for data elements (bars, dots, lines, etc.)
5. Place axis labels
6. Place data value labels LAST (will auto-adjust around reserved regions)
7. Place footer/source text

### Other Requirements

When generating a chart, use the HTML template from `core/html-template.js` which includes:
- Progress indicator with spinner and percentage
- Dual download options (GIF + Video)
- Proper animation timing (all elements complete before hold frames)
- Self-contained code (works offline)

Key features to always include:
1. **Animation timing**: Calculate stagger delays based on item count so ALL elements reach 100% opacity before progress=1
2. **Layout zones**: Use `LayoutCalculator.calculate()` from `core/text-layout.js` to get safe zones for each element type
3. **Video recording**: Use WebCodecs API + mp4-muxer for MP4 export (with WebM fallback for older browsers)

Reference templates in `templates/` folder for each chart type's render function.

### Embed TextLayoutManager in Generated HTML

When generating HTML files, include the TextLayoutManager code directly in the `<script>` section (after the GIF encoder). Copy the full implementation from `core/text-layout.js`.

## How It Works

1. **You provide data** - paste numbers, CSV, JSON, or just describe your data
2. **You pick a chart type** - 23 chart types available (see below)
3. **You choose a style** - dark, light, vibrant, corporate, minimal
4. **I generate an HTML file** - completely self-contained, works offline
5. **You open it in a browser** - GIF generates automatically, then download

No coding. No dependencies. No server needed.

---

## Supported Chart Types (23 Total)

### Category: Proportions & Composition

#### Pie Chart
Best for: Market share, simple proportions, budget breakdown
```
Browser market share: Chrome 65%, Safari 20%, Firefox 8%, Edge 5%, Other 2%
```

#### Donut Chart
Best for: Proportions with a center stat, budget with total displayed
```
Budget breakdown with $100B total in center: Defense 30%, Health 25%, Education 20%, Other 25%
```

#### Treemap Chart
Best for: Hierarchical data, file sizes, market cap by sector
```
Portfolio by sector: Tech $40K, Healthcare $25K, Finance $20K, Energy $15K
```

#### Stacked Bar Chart
Best for: Composition comparison across categories
```
Revenue by quarter and region: Q1 (North $10M, South $8M), Q2 (North $12M, South $9M)
```

#### Stacked Area Chart
Best for: Composition over time, market share evolution
```
Energy sources 2010-2024: Coal declining, Solar/Wind growing, Gas stable
```

### Category: Comparisons & Rankings

#### Bar Chart (Vertical or Horizontal)
Best for: Simple comparisons, rankings, single-series data
```
Q1 Sales: North $450K, South $320K, East $280K, West $510K
```

#### Grouped Bar Chart
Best for: Multi-series comparisons, year-over-year by category
```
2023 vs 2024 by quarter: Q1 ($10M/$12M), Q2 ($11M/$14M), Q3 ($12M/$15M)
```

#### Lollipop Chart
Best for: Clean rankings, minimalist alternative to bar chart
```
Top countries by score: Finland 95, Denmark 92, Switzerland 90, Iceland 88
```

#### Dumbbell Chart
Best for: Before/after comparisons, change visualization
```
Salary change 2020-2024: Engineers ($80K-$120K), Designers ($70K-$95K), PMs ($85K-$130K)
```

### Category: Trends & Time Series

#### Line Chart
Best for: Single metric over time, trend analysis
```
Monthly revenue: Jan 45K, Feb 52K, Mar 61K, Apr 58K, May 72K, Jun 89K
```

#### Multi-Line Chart
Best for: Comparing trends, multiple metrics over same period
```
Stock prices 2024: Apple vs Google vs Microsoft monthly closing prices
```

#### Area Chart
Best for: Volume over time, filled trend visualization
```
Daily active users: Jan 100K, Feb 120K, Mar 150K, Apr 180K
```

### Category: Relationships & Distributions

#### Scatter Chart
Best for: Correlation, two-variable relationships, outlier detection
```
Companies: (Employees, Revenue) - Google (150K, $280B), Apple (150K, $380B)
```

#### Bubble Chart
Best for: Three-variable analysis, market positioning
```
Startups: (Age, Revenue, Funding) - Company A (3yr, $5M, $20M raised)
```

#### Heatmap Chart
Best for: Correlation matrices, activity patterns, density
```
Website traffic by day/hour: Monday 9am: 500, Monday 10am: 800, Tuesday 9am: 450...
```

### Category: Flows & Processes

#### Sankey Diagram
Best for: Budget flows, resource allocation, conversion paths
```
Budget: Revenue (Tax $50B, Fees $20B) -> Spending (Defense $30B, Health $25B, Education $15B)
```

#### Funnel Chart
Best for: Conversion stages, sales pipeline, process drop-off
```
Sales funnel: Leads 10000, Qualified 3000, Proposals 1000, Won 300
```

#### Waterfall Chart
Best for: Cumulative effect, profit breakdown, variance analysis
```
Profit breakdown: Revenue +$100M, COGS -$40M, Operating -$25M, Tax -$10M = Net $25M
```

### Category: Performance & KPIs

#### Gauge Chart
Best for: Single KPI, performance indicator, speedometer-style
```
Customer satisfaction: 87% (target: 90%)
```

#### Radar Chart
Best for: Multi-axis comparison, skills assessment, product comparison
```
Phone comparison: iPhone (Camera 9, Battery 7, Display 9), Samsung (Camera 8, Battery 9, Display 9)
```

#### Progress Bars
Best for: Goal completion, multiple KPIs at a glance
```
Q1 Goals: Revenue 87%, Satisfaction 92%, Growth 75%
```

### Category: Highlights & Storytelling

#### Counter Animation
Best for: Emphasizing impressive single numbers
```
Total Users: 2,500,000
```

#### Timeline
Best for: History, milestones, project phases
```
Company: 2019 Founded, 2020 Seed, 2021 Series A, 2022 100K Users, 2023 Global Launch
```

---

## Chart Selection Guide

| Use Case | Recommended Charts |
|----------|-------------------|
| Show proportions | Pie, Donut, Treemap |
| Compare categories | Bar, Grouped Bar, Lollipop |
| Show trends over time | Line, Multi-Line, Area |
| Show composition over time | Stacked Area, Stacked Bar |
| Analyze relationships | Scatter, Bubble, Heatmap |
| Visualize flows | Sankey, Funnel, Waterfall |
| Display KPIs | Gauge, Progress Bars, Counter |
| Before/after comparison | Dumbbell |
| Multi-dimension comparison | Radar |
| Tell a story | Timeline |

---

## Styles

| Style | Description | Best For |
|-------|-------------|----------|
| **dark** | Dark background, bright accents | Tech, modern, social media |
| **light** | White background, clean colors | Professional, reports |
| **vibrant** | Bold, energetic colors | Marketing, social media |
| **corporate** | Blues and greens, conservative | Business presentations |
| **minimal** | Grayscale, simple | Elegant, understated |

---

## How to Request

Just describe what you want naturally:

> "Make a pie chart of browser market share - Chrome 65%, Safari 20%, Firefox 8%, Edge 5%, Other 2%. Use dark style."

> "Create a funnel chart showing our sales pipeline conversion"

> "Radar chart comparing iPhone vs Samsung on camera, battery, display, price, performance"

> "Dumbbell chart showing salary changes from 2020 to 2024 by role"

> "Heatmap of website traffic by day of week and hour"

I'll:
1. Confirm the data and chart type
2. Generate a self-contained HTML file
3. You open it - GIF auto-generates - download

---

## Customization Options

When requesting, you can specify:

- **Title**: What appears at the top
- **Subtitle**: Secondary text below title
- **Style**: dark, light, vibrant, corporate, minimal
- **Size**: square (default), landscape, wide, twitter, story
- **Hold time**: How long to pause at the end (default: 3 seconds)
- **Animation speed**: faster or slower
- **Colors**: Specific color scheme if desired

Example:
> "Gauge chart showing 87% customer satisfaction, target 90%, corporate style, landscape"

---

## Output Details

**File format**: Self-contained HTML (generates GIF and MP4 when opened)

**Download options**:
- **GIF**: Smaller file, loops automatically, 256 colors (some quality loss)
- **MP4 Video**: Larger file, full color quality, better for presentations (WebM fallback for older browsers)

**Default settings**:
- Resolution: 800x800 (square) or 900x600 (landscape)
- Animation: ~2.5 seconds
- End pause: ~3 seconds
- Frame rate: 20 FPS
- Typical GIF size: 200-800 KB
- Typical video size: 500KB-2MB

**Why HTML instead of direct file?**
- Works offline (no server needed)
- No external dependencies
- Opens in any browser
- Generates both GIF and video on your machine
- You can inspect/modify if needed

---

## Data Input Formats

**Plain text** (I'll parse it):
```
Chrome: 65%
Safari: 20%
Firefox: 8%
```

**CSV**:
```csv
Month,Revenue
Jan,45000
Feb,52000
Mar,61000
```

**JSON**:
```json
[
  {"label": "Chrome", "value": 65},
  {"label": "Safari", "value": 20}
]
```

**Just describe it**:
> "Sales were 45K in Jan, 52K in Feb, 61K in March..."

---

## Quick Reference

| Chart | Best For | Data Format |
|-------|----------|-------------|
| Pie/Donut | Proportions | [{label, value}] |
| Bar | Comparisons | [{label, value}] |
| Grouped Bar | Multi-series | {categories, series: [{name, values}]} |
| Stacked Bar | Composition | {categories, series: [{name, values}]} |
| Line | Trends | [{label, value}] |
| Multi-Line | Compare trends | {labels, series: [{name, values}]} |
| Area | Volume | [{label, value}] |
| Stacked Area | Composition time | {labels, series: [{name, values}]} |
| Scatter | Correlation | [{label, x, y}] |
| Bubble | 3 variables | [{label, x, y, size}] |
| Heatmap | Matrix | {rows, cols, values: 2D array} |
| Sankey | Flows | {nodes, links: [{source, target, value}]} |
| Funnel | Conversion | [{label, value}] |
| Waterfall | Cumulative | [{label, value, type}] |
| Gauge | Single KPI | {value, max, target} |
| Radar | Multi-axis | {axes, series: [{name, values}]} |
| Progress | Goals | [{label, value, max}] |
| Lollipop | Rankings | [{label, value}] |
| Dumbbell | Before/after | [{label, start, end}] |
| Treemap | Hierarchical | [{label, value}] |
| Counter | Big number | {value, label} |
| Timeline | Milestones | [{year, label, description}] |

---

Ready? Just tell me what data you want to visualize!
