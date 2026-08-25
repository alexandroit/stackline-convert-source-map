'use strict';

var hasOwn = Object.prototype.hasOwnProperty;

Object.defineProperty(exports, 'commentRegex', {
  configurable: false,
  enumerable: false,
  get: function getCommentRegex() {
    // Groups: 1 media type, 2 MIME type, 3 charset, 4 encoding, 5 data.
    return /^[ \t\f\v]*\/[\/\*][@#][ \t\f\v]+sourceMappingURL=data:(((?:application|text)\/json)(?:;charset=([^;,\r\n]*))?)?(?:;(base64))?,([^\r\n]*)$/mg;
  }
});

Object.defineProperty(exports, 'mapFileCommentRegex', {
  configurable: false,
  enumerable: false,
  get: function getMapFileCommentRegex() {
    return /(?:\/\/[@#][ \t\f\v]+sourceMappingURL=([^\s'"`]+)[ \t\f\v]*$)|(?:\/\*[@#][ \t\f\v]+sourceMappingURL=([^\s*]+)[ \t\f\v]*\*\/[ \t\f\v]*$)/mg;
  }
});

function isHorizontalWhitespace(code) {
  return code === 9 || code === 11 || code === 12 || code === 32;
}

function trimHorizontalEnd(value, end) {
  while (end > 0 && isHorizontalWhitespace(value.charCodeAt(end - 1))) end--;
  return end;
}

function parseComment(comment) {
  if (typeof comment !== 'string') return null;

  var start = 0;
  while (start < comment.length && isHorizontalWhitespace(comment.charCodeAt(start))) start++;

  var block = comment.substr(start, 2) === '/*';
  if (!block && comment.substr(start, 2) !== '//') return null;

  var end = trimHorizontalEnd(comment, comment.length);
  if (block) {
    if (end < start + 4 || comment.substr(end - 2, 2) !== '*/') return null;
    end = trimHorizontalEnd(comment, end - 2);
  }

  var cursor = start + 2;
  var marker = comment.charAt(cursor++);
  if (marker !== '#' && marker !== '@') return null;
  if (cursor >= end || !isHorizontalWhitespace(comment.charCodeAt(cursor))) return null;
  while (cursor < end && isHorizontalWhitespace(comment.charCodeAt(cursor))) cursor++;

  var prefix = 'sourceMappingURL=';
  if (comment.substr(cursor, prefix.length) !== prefix) return null;
  cursor += prefix.length;

  var url = comment.slice(cursor, end);
  if (!url || url.indexOf('\n') !== -1 || url.indexOf('\r') !== -1) return null;
  return { block: block, url: url };
}

function parseDataURL(url) {
  if (url.substr(0, 5) !== 'data:') return null;
  var comma = url.indexOf(',', 5);
  if (comma === -1) return null;

  var metadata = url.slice(5, comma);
  var parts = metadata.split(';');
  var mime = parts.shift();
  if (mime && mime !== 'application/json' && mime !== 'text/json') return null;

  var encoding = 'uri';
  var charsetSeen = false;
  for (var index = 0; index < parts.length; index++) {
    var part = parts[index];
    if (part.substr(0, 8) === 'charset=' && !charsetSeen && encoding !== 'base64') {
      if (part.indexOf(',') !== -1) return null;
      charsetSeen = true;
    } else if (part === 'base64' && encoding !== 'base64' && index === parts.length - 1) {
      encoding = 'base64';
    } else {
      return null;
    }
  }

  return { data: url.slice(comma + 1), encoding: encoding };
}

function scanComments(source, visit) {
  if (typeof source !== 'string') throw new TypeError('source must be a string');

  var quote = 0;
  var lineStart = 0;
  for (var index = 0; index < source.length; index++) {
    var code = source.charCodeAt(index);

    if (quote) {
      if (code === 92 && index + 1 < source.length) {
        if (source.charCodeAt(index + 1) === 10) lineStart = index + 2;
        index++;
      } else if (code === quote) {
        quote = 0;
      } else if (code === 10) {
        lineStart = index + 1;
        if (quote !== 96) quote = 0;
      }
      continue;
    }

    if (code === 10) {
      lineStart = index + 1;
      continue;
    }
    if (code === 34 || code === 39 || code === 96) {
      quote = code;
      continue;
    }
    if (code !== 47 || index + 1 >= source.length) continue;

    var next = source.charCodeAt(index + 1);
    if (next === 47) {
      var lineEnd = source.indexOf('\n', index + 2);
      if (lineEnd === -1) lineEnd = source.length;
      var lineComment = source.slice(index, lineEnd);
      var parsedLine = parseComment(lineComment);
      if (parsedLine) visit(parsedLine, lineComment, index, lineEnd, lineStart);
      index = lineEnd - 1;
    } else if (next === 42) {
      var close = source.indexOf('*/', index + 2);
      if (close === -1) break;
      var blockEnd = close + 2;
      var blockComment = source.slice(index, blockEnd);
      var parsedBlock = parseComment(blockComment);
      if (parsedBlock) visit(parsedBlock, blockComment, index, blockEnd, lineStart);
      var lastNewline = source.lastIndexOf('\n', blockEnd - 1);
      if (lastNewline >= lineStart) lineStart = lastNewline + 1;
      index = blockEnd - 1;
    }
  }
}

function findLastComment(source, inline) {
  var last = null;
  scanComments(source, function (parsed, comment) {
    var dataURL = parseDataURL(parsed.url);
    if ((inline && dataURL) || (!inline && !dataURL)) last = comment;
  });
  return last;
}

function onlyHorizontalWhitespace(source, start, end) {
  for (var index = start; index < end; index++) {
    if (!isHorizontalWhitespace(source.charCodeAt(index))) return false;
  }
  return true;
}

function removeSourceMapComments(source, inline) {
  var ranges = [];
  scanComments(source, function (parsed, _comment, start, end, lineStart) {
    var dataURL = parseDataURL(parsed.url);
    if ((inline && dataURL) || (!inline && !dataURL)) {
      if (inline && onlyHorizontalWhitespace(source, lineStart, start)) start = lineStart;
      ranges.push([start, end]);
    }
  });

  if (!ranges.length) return source;
  var chunks = [];
  var cursor = 0;
  for (var index = 0; index < ranges.length; index++) {
    chunks.push(source.slice(cursor, ranges[index][0]));
    cursor = ranges[index][1];
  }
  chunks.push(source.slice(cursor));
  return chunks.join('');
}

function decodeBase64(base64) {
  if (typeof base64 === 'number') throw new TypeError('The value to decode must not be of type number.');
  if (typeof Buffer !== 'undefined') return Buffer.from(base64, 'base64').toString('utf8');
  if (typeof atob !== 'function') throw new Error('No base64 decoder is available in this environment');

  var binary = atob(base64);
  if (typeof TextDecoder !== 'undefined') {
    var bytes = new Uint8Array(binary.length);
    for (var index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  }

  var encoded = '';
  for (var byteIndex = 0; byteIndex < binary.length; byteIndex++) {
    encoded += '%' + ('0' + binary.charCodeAt(byteIndex).toString(16)).slice(-2);
  }
  return decodeURIComponent(encoded);
}

function encodeBase64(value) {
  if (typeof Buffer !== 'undefined') return Buffer.from(value, 'utf8').toString('base64');
  if (typeof btoa !== 'function') throw new Error('No base64 encoder is available in this environment');

  if (typeof TextEncoder !== 'undefined') {
    var bytes = new TextEncoder().encode(value);
    var binary = '';
    for (var index = 0; index < bytes.length; index++) binary += String.fromCharCode(bytes[index]);
    return btoa(binary);
  }

  return btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, function (_match, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  }));
}

function Converter(sourceMap, options) {
  options = options || {};
  if (options.encoding === 'base64') sourceMap = decodeBase64(sourceMap);
  else if (options.encoding === 'uri') sourceMap = decodeURIComponent(sourceMap);
  if (options.isJSON || options.encoding) sourceMap = JSON.parse(sourceMap);
  this.sourcemap = sourceMap;
}

Converter.prototype.toJSON = function (space) {
  return JSON.stringify(this.sourcemap, null, space);
};

Converter.prototype.toBase64 = function () {
  return encodeBase64(this.toJSON());
};

Converter.prototype.toURI = function () {
  return encodeURIComponent(this.toJSON());
};

Converter.prototype.toComment = function (options) {
  var uri = options && options.encoding === 'uri';
  var data = 'sourceMappingURL=data:application/json;charset=utf-8' +
    (uri ? ',' + this.toURI() : ';base64,' + this.toBase64());
  return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
};

Converter.prototype.toObject = function () {
  return JSON.parse(this.toJSON());
};

Converter.prototype.addProperty = function (key, value) {
  if (hasOwn.call(this.sourcemap, key)) {
    throw new Error('property "' + String(key) + '" already exists on the sourcemap, use set property instead');
  }
  return this.setProperty(key, value);
};

Converter.prototype.setProperty = function (key, value) {
  Object.defineProperty(this.sourcemap, key, {
    configurable: true,
    enumerable: true,
    value: value,
    writable: true
  });
  return this;
};

Converter.prototype.getProperty = function (key) {
  return this.sourcemap[key];
};

function invalidComment(kind) {
  throw new Error('Invalid ' + kind + ' source map comment');
}

function wrapReadError(error, filename) {
  var detail = error && error.stack ? error.stack : String(error);
  throw new Error('An error occurred while trying to read the map file at ' + filename + '\n' + detail);
}

function readFromFileMap(comment, read) {
  var parsed = parseComment(comment);
  if (!parsed || parseDataURL(parsed.url)) return invalidComment('external');
  var filename = parsed.url;

  try {
    var sourceMap = read(filename);
    if (sourceMap && typeof sourceMap.then === 'function') {
      return sourceMap.then(undefined, function (error) {
        return wrapReadError(error, filename);
      });
    }
    return sourceMap;
  } catch (error) {
    return wrapReadError(error, filename);
  }
}

exports.fromObject = function (object) {
  return new Converter(object);
};

exports.fromJSON = function (json) {
  return new Converter(json, { isJSON: true });
};

exports.fromURI = function (uri) {
  return new Converter(uri, { encoding: 'uri' });
};

exports.fromBase64 = function (base64) {
  return new Converter(base64, { encoding: 'base64' });
};

exports.fromComment = function (comment) {
  var parsed = parseComment(comment);
  var dataURL = parsed && parseDataURL(parsed.url);
  if (!dataURL) return invalidComment('inline');
  return new Converter(dataURL.data, { encoding: dataURL.encoding });
};

function makeConverter(sourceMap) {
  return new Converter(sourceMap, { isJSON: true });
}

exports.fromMapFileComment = function (comment, read) {
  if (typeof read === 'string') {
    throw new Error('String directory paths are no longer supported with `fromMapFileComment`\n' +
      'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading');
  }
  if (typeof read !== 'function') throw new TypeError('readMap must be a function');
  var sourceMap = readFromFileMap(comment, read);
  return sourceMap && typeof sourceMap.then === 'function' ? sourceMap.then(makeConverter) : makeConverter(sourceMap);
};

exports.fromSource = function (content) {
  var comment = findLastComment(content, true);
  return comment ? exports.fromComment(comment) : null;
};

exports.fromMapFileSource = function (content, read) {
  if (typeof read === 'string') {
    throw new Error('String directory paths are no longer supported with `fromMapFileSource`\n' +
      'Please review the Upgrading documentation at https://github.com/thlorenz/convert-source-map#upgrading');
  }
  var comment = findLastComment(content, false);
  return comment ? exports.fromMapFileComment(comment, read) : null;
};

exports.removeComments = function (source) {
  return removeSourceMapComments(source, true);
};

exports.removeMapFileComments = function (source) {
  return removeSourceMapComments(source, false);
};

exports.generateMapFileComment = function (file, options) {
  var data = 'sourceMappingURL=' + file;
  return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
};
