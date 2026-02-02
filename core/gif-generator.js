/**
 * GIF Generator
 * Core engine for creating animated GIF infographics using Canvas API
 *
 * This module handles:
 * - Canvas setup and management
 * - Frame capture and encoding
 * - GIF output optimization
 *
 * Dependencies: gif.js (https://github.com/jnordberg/gif.js)
 */

class GIFGenerator {
  constructor(options = {}) {
    this.width = options.width || 1080;
    this.height = options.height || 1080;
    this.fps = options.fps || 20;
    this.quality = options.quality || 10; // 1-30, lower = better
    this.workers = options.workers || 2;
    this.background = options.background || '#FFFFFF';
    this.loop = options.loop !== undefined ? options.loop : 0; // 0 = infinite

    // Create canvas
    this.canvas = null;
    this.ctx = null;

    // GIF encoder reference
    this.gif = null;
    this.frames = [];
  }

  /**
   * Initialize the generator (call this in browser environment)
   */
  init() {
    // Create canvas element
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
    } else {
      // Node.js environment - would need node-canvas
      throw new Error('GIFGenerator requires a browser environment with Canvas support');
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');

    // Initialize GIF encoder
    if (typeof GIF !== 'undefined') {
      this.gif = new GIF({
        workers: this.workers,
        quality: this.quality,
        width: this.width,
        height: this.height,
        workerScript: 'gif.worker.js',
        repeat: this.loop
      });
    }

    return this;
  }

  /**
   * Clear the canvas with background color
   */
  clear(color = this.background) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Add current canvas state as a frame
   * @param {number} delay - Frame delay in milliseconds
   */
  addFrame(delay = 50) {
    if (this.gif) {
      this.gif.addFrame(this.ctx, {
        copy: true,
        delay: delay
      });
    }

    // Also store frame data for preview
    this.frames.push({
      imageData: this.ctx.getImageData(0, 0, this.width, this.height),
      delay: delay
    });
  }

  /**
   * Render the GIF
   * @returns {Promise<Blob>} The rendered GIF as a Blob
   */
  async render() {
    if (!this.gif) {
      throw new Error('GIF encoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.gif.on('finished', (blob) => {
        resolve(blob);
      });

      this.gif.on('error', (error) => {
        reject(error);
      });

      this.gif.render();
    });
  }

  /**
   * Get canvas context for drawing
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Calculate frame delay from FPS
   */
  getFrameDelay() {
    return Math.round(1000 / this.fps);
  }

  /**
   * Reset the generator for a new GIF
   */
  reset() {
    this.frames = [];
    if (this.gif) {
      this.gif.abort();
      this.gif = new GIF({
        workers: this.workers,
        quality: this.quality,
        width: this.width,
        height: this.height,
        workerScript: 'gif.worker.js',
        repeat: this.loop
      });
    }
  }

  // ============================================
  // DRAWING HELPERS
  // ============================================

  /**
   * Draw text with styling
   */
  drawText(text, x, y, options = {}) {
    const {
      font = '32px Arial',
      color = '#000000',
      align = 'left',
      baseline = 'top',
      maxWidth = null
    } = options;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    if (maxWidth) {
      this.ctx.fillText(text, x, y, maxWidth);
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  /**
   * Draw a rectangle
   */
  drawRect(x, y, width, height, options = {}) {
    const {
      fill = '#000000',
      stroke = null,
      strokeWidth = 1,
      radius = 0
    } = options;

    this.ctx.beginPath();

    if (radius > 0) {
      this.roundRect(x, y, width, height, radius);
    } else {
      this.ctx.rect(x, y, width, height);
    }

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Draw rounded rectangle path
   */
  roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  /**
   * Draw a circle
   */
  drawCircle(x, y, radius, options = {}) {
    const {
      fill = '#000000',
      stroke = null,
      strokeWidth = 1
    } = options;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Draw an arc (for pie charts)
   */
  drawArc(x, y, radius, startAngle, endAngle, options = {}) {
    const {
      fill = '#000000',
      stroke = null,
      strokeWidth = 1
    } = options;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, radius, startAngle, endAngle);
    this.ctx.closePath();

    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }

    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Draw a line
   */
  drawLine(x1, y1, x2, y2, options = {}) {
    const {
      color = '#000000',
      width = 1,
      dash = null
    } = options;

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;

    if (dash) {
      this.ctx.setLineDash(dash);
    }

    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Draw gradient background
   */
  drawGradientBackground(color1, color2, direction = 'vertical') {
    let gradient;

    if (direction === 'vertical') {
      gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    } else if (direction === 'horizontal') {
      gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    } else if (direction === 'diagonal') {
      gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    } else {
      gradient = this.ctx.createRadialGradient(
        this.width / 2, this.height / 2, 0,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) / 2
      );
    }

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Measure text width
   */
  measureText(text, font) {
    this.ctx.font = font;
    return this.ctx.measureText(text);
  }

  /**
   * Save canvas state
   */
  save() {
    this.ctx.save();
  }

  /**
   * Restore canvas state
   */
  restore() {
    this.ctx.restore();
  }

  // ============================================
  // STATIC UTILITIES
  // ============================================

  /**
   * Create standard canvas sizes
   */
  static getSizes() {
    return {
      'instagram-square': { width: 1080, height: 1080 },
      'instagram-portrait': { width: 1080, height: 1350 },
      'instagram-story': { width: 1080, height: 1920 },
      'twitter': { width: 1200, height: 628 },
      'linkedin': { width: 1200, height: 628 },
      'facebook': { width: 1200, height: 630 },
      'youtube-thumbnail': { width: 1280, height: 720 }
    };
  }

  /**
   * Get size by name
   */
  static getSize(name) {
    const sizes = GIFGenerator.getSizes();
    return sizes[name] || sizes['instagram-square'];
  }

  /**
   * Estimate GIF file size (rough approximation)
   */
  static estimateFileSize(width, height, frameCount, quality) {
    // Very rough estimation
    const pixelsPerFrame = width * height;
    const bitsPerPixel = quality < 10 ? 8 : quality < 20 ? 6 : 4;
    const bytesPerFrame = (pixelsPerFrame * bitsPerPixel) / 8;
    const totalBytes = bytesPerFrame * frameCount;

    // GIF compression typically reduces by 50-70%
    const compressedBytes = totalBytes * 0.4;

    return {
      bytes: Math.round(compressedBytes),
      kb: Math.round(compressedBytes / 1024),
      mb: (compressedBytes / (1024 * 1024)).toFixed(2)
    };
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GIFGenerator;
}
