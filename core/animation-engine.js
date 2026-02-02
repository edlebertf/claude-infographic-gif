/**
 * Animation Engine
 * Provides easing functions, timing control, and frame interpolation
 * for smooth GIF animations.
 */

class AnimationEngine {
  constructor(options = {}) {
    this.fps = options.fps || 20;
    this.frameDuration = 1000 / this.fps;
  }

  // ============================================
  // EASING FUNCTIONS
  // ============================================

  /**
   * Linear interpolation (no easing)
   */
  static linear(t) {
    return t;
  }

  /**
   * Ease out cubic - decelerating to zero velocity
   * Most natural for "growing" animations
   */
  static easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Ease in cubic - accelerating from zero velocity
   */
  static easeInCubic(t) {
    return t * t * t;
  }

  /**
   * Ease in-out cubic - acceleration then deceleration
   */
  static easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Ease out quad - gentle deceleration
   */
  static easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Ease in-out quad - smooth acceleration/deceleration
   */
  static easeInOutQuad(t) {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Ease out elastic - bouncy overshoot effect
   */
  static easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }

  /**
   * Ease out back - slight overshoot then settle
   */
  static easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * Ease out bounce - bouncing effect
   */
  static easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  /**
   * Get easing function by name
   */
  static getEasing(name) {
    const easings = {
      'linear': AnimationEngine.linear,
      'easeOutCubic': AnimationEngine.easeOutCubic,
      'easeInCubic': AnimationEngine.easeInCubic,
      'easeInOutCubic': AnimationEngine.easeInOutCubic,
      'easeOutQuad': AnimationEngine.easeOutQuad,
      'easeInOutQuad': AnimationEngine.easeInOutQuad,
      'easeOutElastic': AnimationEngine.easeOutElastic,
      'easeOutBack': AnimationEngine.easeOutBack,
      'easeOutBounce': AnimationEngine.easeOutBounce
    };
    return easings[name] || AnimationEngine.easeOutCubic;
  }

  // ============================================
  // INTERPOLATION HELPERS
  // ============================================

  /**
   * Interpolate between two values
   */
  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /**
   * Interpolate between two colors (hex format)
   */
  static lerpColor(color1, color2, t) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(AnimationEngine.lerp(r1, r2, t));
    const g = Math.round(AnimationEngine.lerp(g1, g2, t));
    const b = Math.round(AnimationEngine.lerp(b1, b2, t));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // ============================================
  // TIMING AND SEQUENCING
  // ============================================

  /**
   * Calculate frame count for a given duration
   */
  getFrameCount(durationMs) {
    return Math.ceil(durationMs / this.frameDuration);
  }

  /**
   * Generate frame timestamps for an animation
   */
  generateFrameTimestamps(durationMs, options = {}) {
    const {
      startDelay = 0,
      endPause = 500,
      easing = 'easeOutCubic'
    } = options;

    const frames = [];
    const easingFn = AnimationEngine.getEasing(easing);

    // Start delay frames (hold at 0)
    const delayFrames = this.getFrameCount(startDelay);
    for (let i = 0; i < delayFrames; i++) {
      frames.push({ time: i * this.frameDuration, progress: 0, phase: 'delay' });
    }

    // Animation frames
    const animFrames = this.getFrameCount(durationMs);
    for (let i = 0; i <= animFrames; i++) {
      const linearProgress = i / animFrames;
      const easedProgress = easingFn(linearProgress);
      frames.push({
        time: startDelay + i * this.frameDuration,
        progress: easedProgress,
        phase: 'animate'
      });
    }

    // End pause frames (hold at 1)
    const pauseFrames = this.getFrameCount(endPause);
    for (let i = 0; i < pauseFrames; i++) {
      frames.push({
        time: startDelay + durationMs + i * this.frameDuration,
        progress: 1,
        phase: 'pause'
      });
    }

    return frames;
  }

  /**
   * Create staggered animation sequence for multiple items
   */
  generateStaggeredSequence(itemCount, options = {}) {
    const {
      itemDuration = 800,
      staggerDelay = 200,
      startDelay = 300,
      endPause = 800,
      easing = 'easeOutCubic'
    } = options;

    const totalDuration = startDelay + itemDuration + (itemCount - 1) * staggerDelay + endPause;
    const totalFrames = this.getFrameCount(totalDuration);
    const easingFn = AnimationEngine.getEasing(easing);

    const sequence = [];

    for (let frame = 0; frame <= totalFrames; frame++) {
      const currentTime = frame * this.frameDuration;
      const frameData = { time: currentTime, items: [] };

      for (let item = 0; item < itemCount; item++) {
        const itemStart = startDelay + item * staggerDelay;
        const itemEnd = itemStart + itemDuration;

        let progress;
        if (currentTime < itemStart) {
          progress = 0;
        } else if (currentTime >= itemEnd) {
          progress = 1;
        } else {
          const linearProgress = (currentTime - itemStart) / itemDuration;
          progress = easingFn(linearProgress);
        }

        frameData.items.push(progress);
      }

      sequence.push(frameData);
    }

    return sequence;
  }

  /**
   * Generate number counting animation frames
   */
  generateCounterFrames(endValue, options = {}) {
    const {
      startValue = 0,
      duration = 2000,
      startDelay = 300,
      endPause = 800,
      easing = 'easeOutCubic',
      decimals = 0
    } = options;

    const frames = this.generateFrameTimestamps(duration, {
      startDelay,
      endPause,
      easing
    });

    return frames.map(frame => ({
      ...frame,
      value: AnimationEngine.lerp(startValue, endValue, frame.progress),
      displayValue: AnimationEngine.lerp(startValue, endValue, frame.progress).toFixed(decimals)
    }));
  }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationEngine;
}
