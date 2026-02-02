/**
 * Self-contained GIF Encoder
 * No external dependencies, no web workers - works offline from file://
 *
 * Based on learnings: External libraries (gif.js) fail due to CORS when
 * opening HTML files directly. This encoder is fully inline.
 */

function GIFEncoder(width, height) {
  this.width = width;
  this.height = height;
  this.data = [];

  this.writeByte = function(b) { this.data.push(b & 0xFF); };
  this.writeShort = function(s) {
    this.writeByte(s & 0xFF);
    this.writeByte((s >> 8) & 0xFF);
  };
  this.writeString = function(s) {
    for (var i = 0; i < s.length; i++) this.writeByte(s.charCodeAt(i));
  };

  this.start = function() {
    this.data = [];
    // Header
    this.writeString('GIF89a');
    this.writeShort(width);
    this.writeShort(height);
    this.writeByte(0x70); // No global color table
    this.writeByte(0);
    this.writeByte(0);

    // Netscape extension for looping
    this.writeByte(0x21);
    this.writeByte(0xFF);
    this.writeByte(0x0B);
    this.writeString('NETSCAPE2.0');
    this.writeByte(0x03);
    this.writeByte(0x01);
    this.writeShort(0); // Infinite loop
    this.writeByte(0x00);
  };

  this.addFrame = function(ctx, delay) {
    var imgData = ctx.getImageData(0, 0, width, height);
    var pixels = imgData.data;
    var colorCounts = {};

    // Count colors (quantized to 5 bits per channel)
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i] & 0xF8;
      var g = pixels[i+1] & 0xF8;
      var b = pixels[i+2] & 0xF8;
      var key = (r << 16) | (g << 8) | b;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    // Get top 256 colors sorted by frequency
    var sortedColors = Object.keys(colorCounts).map(function(k) {
      return { color: parseInt(k), count: colorCounts[k] };
    }).sort(function(a, b) { return b.count - a.count; }).slice(0, 256);

    // Build palette and color map
    var palette = [];
    var colorMap = {};
    for (var i = 0; i < sortedColors.length; i++) {
      var c = sortedColors[i].color;
      palette.push((c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF);
      colorMap[c] = i;
    }
    while (palette.length < 256 * 3) palette.push(0);

    // Map pixels to palette indices
    var indexed = new Uint8Array(width * height);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i] & 0xF8;
      var g = pixels[i+1] & 0xF8;
      var b = pixels[i+2] & 0xF8;
      var key = (r << 16) | (g << 8) | b;

      if (colorMap[key] !== undefined) {
        indexed[i/4] = colorMap[key];
      } else {
        // Find closest color
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

    // Graphics control extension
    this.writeByte(0x21);
    this.writeByte(0xF9);
    this.writeByte(0x04);
    this.writeByte(0x00);
    this.writeShort(Math.round(delay / 10)); // Delay in centiseconds
    this.writeByte(0x00);
    this.writeByte(0x00);

    // Image descriptor with local color table
    this.writeByte(0x2C);
    this.writeShort(0);
    this.writeShort(0);
    this.writeShort(width);
    this.writeShort(height);
    this.writeByte(0x87); // Local color table, 256 colors

    // Write local color table
    for (var i = 0; i < palette.length; i++) this.writeByte(palette[i]);

    // LZW encode
    this.writeByte(8); // Min code size
    this.lzwEncode(indexed);
    this.writeByte(0x00);
  };

  this.lzwEncode = function(pixels) {
    var clearCode = 256;
    var eoiCode = 257;
    var codeSize = 9;
    var nextCode = 258;
    var dict = {};
    var buffer = 0;
    var bufferLen = 0;
    var output = [];

    var emit = function(code) {
      buffer |= code << bufferLen;
      bufferLen += codeSize;
      while (bufferLen >= 8) {
        output.push(buffer & 0xFF);
        buffer >>= 8;
        bufferLen -= 8;
      }
    };

    emit(clearCode);
    var prev = pixels[0];

    for (var i = 1; i < pixels.length; i++) {
      var curr = pixels[i];
      var key = prev + ',' + curr;

      if (dict[key] !== undefined) {
        prev = dict[key];
      } else {
        emit(prev);
        if (nextCode < 4096) {
          dict[key] = nextCode++;
          if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
        } else {
          emit(clearCode);
          dict = {};
          codeSize = 9;
          nextCode = 258;
        }
        prev = curr;
      }
    }

    emit(prev);
    emit(eoiCode);
    if (bufferLen > 0) output.push(buffer & 0xFF);

    // Write sub-blocks (max 255 bytes each)
    for (var i = 0; i < output.length; i += 255) {
      var chunk = output.slice(i, Math.min(i + 255, output.length));
      this.writeByte(chunk.length);
      for (var j = 0; j < chunk.length; j++) this.writeByte(chunk[j]);
    }
  };

  this.finish = function() {
    this.writeByte(0x3B); // Trailer
    return new Blob([new Uint8Array(this.data)], {type: 'image/gif'});
  };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GIFEncoder;
}
