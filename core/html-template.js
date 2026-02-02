/**
 * HTML Template Generator
 * Base template with all standard features:
 * - Progress indicator with spinner and percentage
 * - GIF and Video download options
 * - Proper animation timing (all elements complete before hold)
 * - Self-contained (works offline)
 */

var HTMLTemplate = {

  /**
   * Generate the complete HTML wrapper
   * @param {Object} config - Chart configuration
   * @returns {string} Complete HTML document
   */
  generate: function(config) {
    var title = config.title || 'Infographic';
    var filename = config.filename || 'infographic';
    var width = config.width || 900;
    var height = config.height || 700;
    var style = config.style || 'dark';
    var animation = config.animation || { totalFrames: 55, holdFrames: 55, frameDelay: 45, holdDelay: 65 };

    var styleColors = this.getStyleColors(style);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${styleColors.pageBackground};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: ${styleColors.containerBackground};
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 1000px;
      width: 100%;
      border: 1px solid ${styleColors.border};
    }
    h1 { color: ${styleColors.heading}; margin-bottom: 8px; font-size: 24px; }
    .subtitle { color: ${styleColors.subtext}; margin-bottom: 24px; }
    #status { padding: 16px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 12px; }
    .generating { background: ${styleColors.statusBg}; color: ${styleColors.statusText}; }
    .success { background: ${styleColors.successBg}; color: ${styleColors.successText}; }
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid ${styleColors.spinnerTrack};
      border-top-color: ${styleColors.spinnerHead};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .success .spinner { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    #percentage { font-size: 24px; font-weight: 700; color: ${styleColors.heading}; min-width: 60px; }
    #statusText { flex: 1; text-align: left; }
    #preview { max-width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.4); margin-bottom: 20px; border: 1px solid ${styleColors.border}; }
    .btn { display: inline-block; background: ${styleColors.btnGradient}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; cursor: pointer; border: none; font-size: 16px; }
    .btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary { background: ${styleColors.btnSecondary}; }
    .btn-container { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    #canvas { display: none; }
    #videoStatus { margin-top: 12px; color: ${styleColors.statusText}; font-size: 14px; min-height: 20px; }
    .progress-bar { width: 100%; height: 8px; background: ${styleColors.progressBg}; border-radius: 4px; overflow: hidden; margin-bottom: 20px; }
    .progress-fill { height: 100%; background: ${styleColors.progressFill}; width: 0%; transition: width 0.2s; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p class="subtitle" id="subtitleText">Generating infographic...</p>
    <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
    <div id="status" class="generating">
      <div class="spinner"></div>
      <span id="percentage">0%</span>
      <span id="statusText">Initializing...</span>
    </div>
    <canvas id="canvas" width="${width}" height="${height}"></canvas>
    <img id="preview" style="display:none;" alt="Generated infographic">
    <div class="btn-container">
      <a id="downloadGif" class="btn" style="display:none;" download="${filename}.gif">Download GIF</a>
      <button id="downloadVideo" class="btn btn-secondary" style="display:none;">Download MP4</button>
    </div>
    <div id="videoStatus"></div>
  </div>

<script>
${this.getGifEncoder()}

// =============================================
// CONFIGURATION
// =============================================
var WIDTH = ${width};
var HEIGHT = ${height};
var ANIMATION = ${JSON.stringify(animation)};

var STYLE = {
  background: '${styleColors.chartBackground}',
  text: '${styleColors.text}',
  textMuted: '${styleColors.textMuted}',
  gridLine: '${styleColors.gridLine}',
  fontFamily: 'Arial, sans-serif',
  colors: ${JSON.stringify(styleColors.chartColors)}
};

// Chart-specific config will be inserted here
%CHART_CONFIG%

// =============================================
// LAYOUT SYSTEM
// =============================================
%LAYOUT_CODE%

// =============================================
// RENDER FUNCTION
// =============================================
%RENDER_CODE%

// =============================================
// GENERATE GIF
// =============================================
function generate() {
  var status = document.getElementById('status');
  var statusText = document.getElementById('statusText');
  var percentage = document.getElementById('percentage');
  var progressBar = document.getElementById('progress');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  var encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.start();

  var total = ANIMATION.totalFrames + ANIMATION.holdFrames + 1;
  var current = 0;

  function updateProgress(pct, text) {
    percentage.textContent = pct + '%';
    statusText.textContent = text;
    progressBar.style.width = pct + '%';
  }

  function renderAnimationFrames(i) {
    if (i <= ANIMATION.totalFrames) {
      renderFrame(ctx, i / ANIMATION.totalFrames);
      encoder.addFrame(ctx, ANIMATION.frameDelay);
      current++;
      var pct = Math.round((current / total) * 100);
      updateProgress(pct, 'Rendering frame ' + (i + 1) + ' of ' + (ANIMATION.totalFrames + 1) + '...');
      setTimeout(function() { renderAnimationFrames(i + 1); }, 0);
    } else {
      renderHoldFrames(0);
    }
  }

  function renderHoldFrames(i) {
    if (i < ANIMATION.holdFrames) {
      renderFrame(ctx, 1);
      encoder.addFrame(ctx, ANIMATION.holdDelay);
      current++;
      var pct = Math.round((current / total) * 100);
      updateProgress(pct, 'Adding hold frame ' + (i + 1) + ' of ' + ANIMATION.holdFrames + '...');
      setTimeout(function() { renderHoldFrames(i + 1); }, 0);
    } else {
      finishEncoding();
    }
  }

  function finishEncoding() {
    updateProgress(99, 'Encoding GIF...');
    setTimeout(function() {
      var blob = encoder.finish();
      var url = URL.createObjectURL(blob);

      document.getElementById('preview').src = url;
      document.getElementById('preview').style.display = 'block';
      document.getElementById('downloadGif').href = url;
      document.getElementById('downloadGif').style.display = 'inline-block';
      document.getElementById('downloadVideo').style.display = 'inline-block';

      status.className = 'success';
      percentage.textContent = '100%';
      statusText.textContent = 'Done! GIF size: ' + (blob.size / 1024).toFixed(0) + ' KB';
      progressBar.style.width = '100%';
      document.getElementById('subtitleText').textContent = 'Your infographic is ready!';

      document.getElementById('downloadVideo').onclick = recordVideo;
    }, 50);
  }

  updateProgress(0, 'Starting render...');
  setTimeout(function() { renderAnimationFrames(0); }, 100);
}

// =============================================
// VIDEO RECORDING (with ffmpeg.wasm for MP4)
// =============================================
var ffmpegLoaded = false;
var ffmpeg = null;

async function loadFFmpeg() {
  if (ffmpegLoaded) return true;

  try {
    // Load FFmpeg from CDN
    const { FFmpeg } = await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
    const { fetchFile } = await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');

    ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      document.getElementById('videoStatus').textContent =
        'Converting to MP4... ' + Math.round(progress * 100) + '%';
    });

    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
    });

    ffmpegLoaded = true;
    window.fetchFile = fetchFile;
    return true;
  } catch (err) {
    console.error('FFmpeg load error:', err);
    return false;
  }
}

async function recordVideo() {
  var videoStatus = document.getElementById('videoStatus');
  var videoBtn = document.getElementById('downloadVideo');
  videoBtn.disabled = true;
  videoBtn.textContent = 'Recording...';
  videoStatus.textContent = 'Loading MP4 encoder (first time may take a moment)...';

  // Load FFmpeg first
  var ffmpegReady = await loadFFmpeg();
  if (!ffmpegReady) {
    videoStatus.textContent = 'Error: Could not load MP4 encoder. Try refreshing the page.';
    videoBtn.disabled = false;
    videoBtn.textContent = 'Download MP4';
    return;
  }

  videoStatus.textContent = 'Preparing video recording...';

  var canvas = document.getElementById('canvas');
  canvas.style.display = 'block';
  canvas.style.position = 'absolute';
  canvas.style.left = '-9999px';
  var ctx = canvas.getContext('2d');

  var stream = canvas.captureStream(30);
  var chunks = [];
  var mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
  var recorder = new MediaRecorder(stream, { mimeType: mimeType, videoBitsPerSecond: 8000000 });

  recorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = async function() {
    videoStatus.textContent = 'Converting to MP4...';

    try {
      var webmBlob = new Blob(chunks, { type: mimeType });
      var webmData = await webmBlob.arrayBuffer();

      await ffmpeg.writeFile('input.webm', new Uint8Array(webmData));
      await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-pix_fmt', 'yuv420p', 'output.mp4']);
      var mp4Data = await ffmpeg.readFile('output.mp4');

      var mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });
      var url = URL.createObjectURL(mp4Blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '${filename}.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      videoStatus.textContent = 'MP4 downloaded! Size: ' + (mp4Blob.size / 1024).toFixed(0) + ' KB';

      // Cleanup
      await ffmpeg.deleteFile('input.webm');
      await ffmpeg.deleteFile('output.mp4');
    } catch (err) {
      console.error('MP4 conversion error:', err);
      videoStatus.textContent = 'Error converting to MP4. Downloading WebM instead...';
      var webmBlob = new Blob(chunks, { type: mimeType });
      var url = URL.createObjectURL(webmBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '${filename}.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    videoBtn.disabled = false;
    videoBtn.textContent = 'Download MP4';
    canvas.style.display = 'none';
  };

  recorder.start();
  videoStatus.textContent = 'Recording animation...';

  var totalFrames = ANIMATION.totalFrames + ANIMATION.holdFrames;
  var frameIndex = 0;

  function renderNextFrame() {
    if (frameIndex <= ANIMATION.totalFrames) {
      renderFrame(ctx, frameIndex / ANIMATION.totalFrames);
    } else {
      renderFrame(ctx, 1);
    }
    frameIndex++;
    videoStatus.textContent = 'Recording frame ' + frameIndex + ' of ' + totalFrames + '...';
    if (frameIndex < totalFrames) {
      setTimeout(renderNextFrame, 1000 / 30);
    } else {
      setTimeout(function() { recorder.stop(); }, 200);
    }
  }
  renderNextFrame();
}

window.onload = function() { setTimeout(generate, 100); };
</script>
</body>
</html>`;
  },

  /**
   * Get style colors for a theme
   */
  getStyleColors: function(style) {
    var styles = {
      dark: {
        pageBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        containerBackground: '#0D1117',
        border: '#30363D',
        heading: '#E6EDF3',
        subtext: '#8B949E',
        statusBg: '#2D333B',
        statusText: '#D29922',
        successBg: '#1C3D2E',
        successText: '#3FB950',
        spinnerTrack: 'rgba(210, 153, 34, 0.3)',
        spinnerHead: '#D29922',
        btnGradient: 'linear-gradient(135deg, #58A6FF 0%, #A371F7 100%)',
        btnSecondary: 'linear-gradient(135deg, #3FB950 0%, #58A6FF 100%)',
        progressBg: '#21262D',
        progressFill: 'linear-gradient(90deg, #58A6FF, #A371F7)',
        chartBackground: '#0D1117',
        text: '#E6EDF3',
        textMuted: '#8B949E',
        gridLine: '#21262D',
        chartColors: ['#58A6FF', '#3FB950', '#A371F7', '#F78166', '#D29922', '#79C0FF', '#7EE787', '#D2A8FF']
      },
      light: {
        pageBackground: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        containerBackground: '#FFFFFF',
        border: '#E0E0E0',
        heading: '#1A1A1A',
        subtext: '#666666',
        statusBg: '#F5F5F5',
        statusText: '#B8860B',
        successBg: '#E8F5E9',
        successText: '#2E7D32',
        spinnerTrack: 'rgba(184, 134, 11, 0.3)',
        spinnerHead: '#B8860B',
        btnGradient: 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)',
        btnSecondary: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
        progressBg: '#E0E0E0',
        progressFill: 'linear-gradient(90deg, #2196F3, #9C27B0)',
        chartBackground: '#FFFFFF',
        text: '#1A1A1A',
        textMuted: '#666666',
        gridLine: '#E0E0E0',
        chartColors: ['#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#FF9800', '#00BCD4', '#8BC34A', '#E91E63']
      },
      vibrant: {
        pageBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        containerBackground: '#0D1117',
        border: '#30363D',
        heading: '#FFFFFF',
        subtext: '#B0B0B0',
        statusBg: '#2D333B',
        statusText: '#FFD700',
        successBg: '#1C3D2E',
        successText: '#00FF7F',
        spinnerTrack: 'rgba(255, 215, 0, 0.3)',
        spinnerHead: '#FFD700',
        btnGradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
        btnSecondary: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        progressBg: '#21262D',
        progressFill: 'linear-gradient(90deg, #FF6B6B, #FFE66D)',
        chartBackground: '#0D1117',
        text: '#FFFFFF',
        textMuted: '#B0B0B0',
        gridLine: '#21262D',
        chartColors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA']
      },
      corporate: {
        pageBackground: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
        containerBackground: '#FFFFFF',
        border: '#CBD5E0',
        heading: '#1A365D',
        subtext: '#4A5568',
        statusBg: '#EBF4FF',
        statusText: '#2B6CB0',
        successBg: '#C6F6D5',
        successText: '#276749',
        spinnerTrack: 'rgba(43, 108, 176, 0.3)',
        spinnerHead: '#2B6CB0',
        btnGradient: 'linear-gradient(135deg, #2B6CB0 0%, #4C51BF 100%)',
        btnSecondary: 'linear-gradient(135deg, #38A169 0%, #2B6CB0 100%)',
        progressBg: '#E2E8F0',
        progressFill: 'linear-gradient(90deg, #2B6CB0, #4C51BF)',
        chartBackground: '#FFFFFF',
        text: '#1A365D',
        textMuted: '#4A5568',
        gridLine: '#E2E8F0',
        chartColors: ['#2B6CB0', '#38A169', '#4C51BF', '#DD6B20', '#D53F8C', '#319795', '#805AD5', '#3182CE']
      },
      minimal: {
        pageBackground: '#F7F7F7',
        containerBackground: '#FFFFFF',
        border: '#E5E5E5',
        heading: '#1A1A1A',
        subtext: '#737373',
        statusBg: '#F5F5F5',
        statusText: '#525252',
        successBg: '#F0FDF4',
        successText: '#166534',
        spinnerTrack: 'rgba(82, 82, 82, 0.3)',
        spinnerHead: '#525252',
        btnGradient: 'linear-gradient(135deg, #404040 0%, #525252 100%)',
        btnSecondary: 'linear-gradient(135deg, #525252 0%, #737373 100%)',
        progressBg: '#E5E5E5',
        progressFill: 'linear-gradient(90deg, #404040, #737373)',
        chartBackground: '#FFFFFF',
        text: '#1A1A1A',
        textMuted: '#737373',
        gridLine: '#E5E5E5',
        chartColors: ['#404040', '#737373', '#525252', '#A3A3A3', '#262626', '#D4D4D4', '#171717', '#8C8C8C']
      }
    };

    return styles[style] || styles.dark;
  },

  /**
   * Get the GIF encoder code
   */
  getGifEncoder: function() {
    return `// GIF ENCODER (self-contained, works offline)
function GIFEncoder(width, height) {
  this.width = width;
  this.height = height;
  this.data = [];
  this.writeByte = function(b) { this.data.push(b & 0xFF); };
  this.writeShort = function(s) { this.writeByte(s & 0xFF); this.writeByte((s >> 8) & 0xFF); };
  this.writeString = function(s) { for (var i = 0; i < s.length; i++) this.writeByte(s.charCodeAt(i)); };
  this.start = function() {
    this.data = [];
    this.writeString('GIF89a');
    this.writeShort(width); this.writeShort(height);
    this.writeByte(0x70); this.writeByte(0); this.writeByte(0);
    this.writeByte(0x21); this.writeByte(0xFF); this.writeByte(0x0B);
    this.writeString('NETSCAPE2.0');
    this.writeByte(0x03); this.writeByte(0x01); this.writeShort(0); this.writeByte(0x00);
  };
  this.addFrame = function(ctx, delay) {
    var imgData = ctx.getImageData(0, 0, width, height);
    var pixels = imgData.data;
    var colorCounts = {};
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i] & 0xF8, g = pixels[i+1] & 0xF8, b = pixels[i+2] & 0xF8;
      var key = (r << 16) | (g << 8) | b;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }
    var sortedColors = Object.keys(colorCounts).map(function(k) {
      return { color: parseInt(k), count: colorCounts[k] };
    }).sort(function(a, b) { return b.count - a.count; }).slice(0, 256);
    var palette = [], colorMap = {};
    for (var i = 0; i < sortedColors.length; i++) {
      var c = sortedColors[i].color;
      palette.push((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
      colorMap[c] = i;
    }
    while (palette.length < 256 * 3) palette.push(0);
    var indexed = new Uint8Array(width * height);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i] & 0xF8, g = pixels[i+1] & 0xF8, b = pixels[i+2] & 0xF8;
      var key = (r << 16) | (g << 8) | b;
      if (colorMap[key] !== undefined) indexed[i/4] = colorMap[key];
      else {
        var bestDist = Infinity, bestIdx = 0;
        for (var j = 0; j < sortedColors.length; j++) {
          var c = sortedColors[j].color;
          var cr = (c >> 16) & 0xFF, cg = (c >> 8) & 0xFF, cb = c & 0xFF;
          var dist = (r-cr)*(r-cr) + (g-cg)*(g-cg) + (b-cb)*(b-cb);
          if (dist < bestDist) { bestDist = dist; bestIdx = j; }
        }
        indexed[i/4] = bestIdx;
      }
    }
    this.writeByte(0x21); this.writeByte(0xF9); this.writeByte(0x04);
    this.writeByte(0x00); this.writeShort(Math.round(delay / 10));
    this.writeByte(0x00); this.writeByte(0x00);
    this.writeByte(0x2C); this.writeShort(0); this.writeShort(0);
    this.writeShort(width); this.writeShort(height); this.writeByte(0x87);
    for (var i = 0; i < palette.length; i++) this.writeByte(palette[i]);
    this.writeByte(8); this.lzwEncode(indexed); this.writeByte(0x00);
  };
  this.lzwEncode = function(pixels) {
    var clearCode = 256, eoiCode = 257, codeSize = 9, nextCode = 258;
    var dict = {}, buffer = 0, bufferLen = 0, output = [];
    var emit = function(code) {
      buffer |= code << bufferLen; bufferLen += codeSize;
      while (bufferLen >= 8) { output.push(buffer & 0xFF); buffer >>= 8; bufferLen -= 8; }
    };
    emit(clearCode); var prev = pixels[0];
    for (var i = 1; i < pixels.length; i++) {
      var curr = pixels[i], key = prev + ',' + curr;
      if (dict[key] !== undefined) prev = dict[key];
      else {
        emit(prev);
        if (nextCode < 4096) { dict[key] = nextCode++; if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++; }
        else { emit(clearCode); dict = {}; codeSize = 9; nextCode = 258; }
        prev = curr;
      }
    }
    emit(prev); emit(eoiCode);
    if (bufferLen > 0) output.push(buffer & 0xFF);
    for (var i = 0; i < output.length; i += 255) {
      var chunk = output.slice(i, Math.min(i + 255, output.length));
      this.writeByte(chunk.length);
      for (var j = 0; j < chunk.length; j++) this.writeByte(chunk[j]);
    }
  };
  this.finish = function() {
    this.writeByte(0x3B);
    return new Blob([new Uint8Array(this.data)], {type: 'image/gif'});
  };
}`;
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HTMLTemplate;
}
