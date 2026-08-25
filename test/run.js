'use strict';

var assert = require('assert');
var convert = require('..');
var tests = [];

function test(name, run) {
  tests.push({ name: name, run: run });
}

function sourceMap() {
  return {
    version: 3,
    file: 'bundle.js',
    sources: ['input.js'],
    names: [],
    mappings: 'AAAA',
    sourcesContent: ["const greeting = 'Ola, 世界';"]
  };
}

test('retains the complete CommonJS API and fresh regex getters', function () {
  [
    'fromObject', 'fromJSON', 'fromURI', 'fromBase64', 'fromComment',
    'fromMapFileComment', 'fromSource', 'fromMapFileSource',
    'removeComments', 'removeMapFileComments', 'generateMapFileComment'
  ].forEach(function (name) {
    assert.strictEqual(typeof convert[name], 'function', name);
  });
  assert.notStrictEqual(convert.commentRegex, convert.commentRegex);
  assert.notStrictEqual(convert.mapFileCommentRegex, convert.mapFileCommentRegex);
  assert.strictEqual(Object.keys(convert).indexOf('commentRegex'), -1);
});

test('round trips object, JSON, URI, base64, and comments with Unicode', function () {
  var object = sourceMap();
  var converter = convert.fromObject(object);
  var json = JSON.stringify(object);
  var base64 = Buffer.from(json, 'utf8').toString('base64');
  var uri = encodeURIComponent(json);

  assert.deepStrictEqual(converter.toObject(), object);
  assert.deepStrictEqual(convert.fromJSON(json).toObject(), object);
  assert.deepStrictEqual(convert.fromURI(uri).toObject(), object);
  assert.deepStrictEqual(convert.fromBase64(base64).toObject(), object);
  assert.deepStrictEqual(convert.fromComment(converter.toComment()).toObject(), object);
  assert.deepStrictEqual(convert.fromComment(converter.toComment({ encoding: 'uri' })).toObject(), object);
  assert.deepStrictEqual(convert.fromComment(converter.toComment({ multiline: true })).toObject(), object);
  assert.strictEqual(convert.fromJSON(json).toJSON(2), JSON.stringify(object, null, 2));
});

test('parses URI data containing literal commas using the first delimiter', function () {
  var json = JSON.stringify(sourceMap());
  var commaURI = encodeURI(json);
  var comment = '/*# sourceMappingURL=data:application/json,' + commaURI + ' */';
  assert.deepStrictEqual(convert.fromComment(comment).toObject(), sourceMap());
});

test('accepts data URLs without a media type', function () {
  var json = JSON.stringify(sourceMap());
  var base64 = Buffer.from(json, 'utf8').toString('base64');
  assert.deepStrictEqual(convert.fromComment('//# sourceMappingURL=data:;base64,' + base64).toObject(), sourceMap());
  assert.deepStrictEqual(convert.fromComment('//# sourceMappingURL=data:,' + encodeURIComponent(json)).toObject(), sourceMap());
});

test('finds the last inline map and supports same-line CSS block comments', function () {
  var first = convert.fromObject({ version: 3, sources: ['first.js'], names: [], mappings: '' }).toComment();
  var second = convert.fromObject(sourceMap()).toComment({ multiline: true });
  var source = first + '\nbody { color: red; }' + second;
  assert.deepStrictEqual(convert.fromSource(source).toObject(), sourceMap());
  assert.strictEqual(convert.fromSource('var answer = 42;'), null);
});

test('does not treat sourceMappingURL text inside strings as comments', function () {
  var comment = convert.fromObject(sourceMap()).toComment();
  assert.strictEqual(convert.fromSource('var value = ' + JSON.stringify(comment) + ';'), null);
  assert.strictEqual(convert.fromSource('var value = `' + comment + '`;'), null);
  assert.strictEqual(convert.fromMapFileSource('var value = "//# sourceMappingURL=file.js.map";', function () {}), null);
});

test('removes inline maps without disturbing surrounding source', function () {
  var line = convert.fromObject(sourceMap()).toComment();
  var block = convert.fromObject(sourceMap()).toComment({ multiline: true });
  var source = 'alpha\n  ' + line + '\nbeta {' + block + '}\ngamma';
  assert.strictEqual(convert.removeComments(source), 'alpha\n\nbeta {}\ngamma');
  assert.strictEqual(convert.removeComments('plain'), 'plain');
});

test('extracts and removes external map comments', function () {
  var comments = 'code\n//# sourceMappingURL=first.js.map\n/*# sourceMappingURL=last.css.map */';
  var seen;
  var converter = convert.fromMapFileSource(comments, function (filename) {
    seen = filename;
    return JSON.stringify(sourceMap());
  });
  assert.strictEqual(seen, 'last.css.map');
  assert.deepStrictEqual(converter.toObject(), sourceMap());
  assert.strictEqual(convert.removeMapFileComments(comments), 'code\n\n');
  assert.strictEqual(convert.generateMapFileComment('x.js.map'), '//# sourceMappingURL=x.js.map');
  assert.strictEqual(convert.generateMapFileComment('x.css.map', { multiline: true }), '/*# sourceMappingURL=x.css.map */');
});

test('supports asynchronous map readers and wraps rejected reads', async function () {
  var converter = await convert.fromMapFileComment('//# sourceMappingURL=async.js.map', function (filename) {
    assert.strictEqual(filename, 'async.js.map');
    return Promise.resolve(JSON.stringify(sourceMap()));
  });
  assert.deepStrictEqual(converter.toObject(), sourceMap());

  await assert.rejects(function () {
    return convert.fromMapFileComment('//# sourceMappingURL=missing.js.map', function () {
      return Promise.reject(new Error('missing'));
    });
  }, /trying to read the map file at missing\.js\.map/);
});

test('wraps synchronous map reader errors', function () {
  assert.throws(function () {
    convert.fromMapFileComment('//# sourceMappingURL=missing.js.map', function () {
      throw new Error('missing');
    });
  }, /trying to read the map file at missing\.js\.map/);
});

test('retains the v2 reader migration error', function () {
  assert.throws(function () {
    convert.fromMapFileComment('//# sourceMappingURL=x.map', '.');
  }, /String directory paths are no longer supported/);
  assert.throws(function () {
    convert.fromMapFileSource('//# sourceMappingURL=x.map', '.');
  }, /String directory paths are no longer supported/);
});

test('stores meta-property names as own data without changing prototypes', function () {
  var object = sourceMap();
  var originalPrototype = Object.getPrototypeOf(object);
  var converter = convert.fromObject(object);

  converter
    .setProperty('__proto__', { controlled: true })
    .setProperty('prototype', 'plain data')
    .setProperty('constructor', 'plain data');

  assert.strictEqual(Object.getPrototypeOf(object), originalPrototype);
  assert.strictEqual(hasOwn(object, '__proto__'), true);
  assert.deepStrictEqual(converter.getProperty('__proto__'), { controlled: true });
  assert.strictEqual(converter.getProperty('prototype'), 'plain data');
  assert.strictEqual(converter.getProperty('constructor'), 'plain data');
  assert.strictEqual(Object.prototype.controlled, undefined);
});

test('accepts null-prototype and ownership-shadowing source maps', function () {
  var nullMap = Object.create(null);
  nullMap.version = 3;
  convert.fromObject(nullMap).addProperty('file', 'x.js');
  assert.strictEqual(nullMap.file, 'x.js');

  var shadowed = { version: 3, hasOwnProperty: null };
  convert.fromObject(shadowed).addProperty('file', 'x.js');
  assert.strictEqual(shadowed.file, 'x.js');
  assert.throws(function () {
    convert.fromObject(shadowed).addProperty('file', 'again.js');
  }, /already exists/);
});

test('keeps parsed dangerous keys local to the source map', function () {
  var converter = convert.fromJSON('{"version":3,"__proto__":{"polluted":true},"constructor":"value"}');
  var object = converter.toObject();
  assert.strictEqual(hasOwn(object, '__proto__'), true);
  assert.strictEqual(object.__proto__.polluted, true);
  assert.strictEqual(Object.prototype.polluted, undefined);
});

test('rejects malformed comments and invalid readers predictably', function () {
  assert.throws(function () { convert.fromComment('//# sourceMappingURL=not-data'); }, /Invalid inline/);
  assert.throws(function () { convert.fromComment('//# sourceMappingURL=data:text/plain,abc'); }, /Invalid inline/);
  assert.throws(function () { convert.fromMapFileComment('not a comment', function () {}); }, /Invalid external/);
  assert.throws(function () { convert.fromMapFileComment('//# sourceMappingURL=x.map'); }, /readMap must be a function/);
});

test('handles large malformed newline input without regex amplification', function () {
  var malformed = new Array(300002).join('\n');
  assert.strictEqual(convert.fromSource(malformed), null);
  assert.strictEqual(convert.fromMapFileSource(malformed, function () {}), null);
  assert.strictEqual(convert.removeComments(malformed), malformed);
});

test('uses browser base64 APIs without Buffer', function () {
  var savedBuffer = global.Buffer;
  var savedAtob = global.atob;
  var savedBtoa = global.btoa;
  try {
    global.atob = function (value) { return savedBuffer.from(value, 'base64').toString('binary'); };
    global.btoa = function (value) { return savedBuffer.from(value, 'binary').toString('base64'); };
    global.Buffer = undefined;
    var comment = convert.fromObject(sourceMap()).toComment();
    assert.deepStrictEqual(convert.fromComment(comment).toObject(), sourceMap());
  } finally {
    global.Buffer = savedBuffer;
    global.atob = savedAtob;
    global.btoa = savedBtoa;
  }
});

test('uses browser UTF-8 fallbacks when text codecs are absent', function () {
  var savedBuffer = global.Buffer;
  var savedAtob = global.atob;
  var savedBtoa = global.btoa;
  var savedDecoder = global.TextDecoder;
  var savedEncoder = global.TextEncoder;
  try {
    global.atob = function (value) { return savedBuffer.from(value, 'base64').toString('binary'); };
    global.btoa = function (value) { return savedBuffer.from(value, 'binary').toString('base64'); };
    global.Buffer = undefined;
    global.TextDecoder = undefined;
    global.TextEncoder = undefined;
    var comment = convert.fromObject(sourceMap()).toComment();
    assert.deepStrictEqual(convert.fromComment(comment).toObject(), sourceMap());
  } finally {
    global.Buffer = savedBuffer;
    global.atob = savedAtob;
    global.btoa = savedBtoa;
    global.TextDecoder = savedDecoder;
    global.TextEncoder = savedEncoder;
  }
});

test('reports unavailable browser codecs and rejects numeric base64', function () {
  var savedBuffer = global.Buffer;
  var savedAtob = global.atob;
  var savedBtoa = global.btoa;
  try {
    global.Buffer = undefined;
    global.atob = undefined;
    global.btoa = undefined;
    assert.throws(function () { convert.fromObject(sourceMap()).toBase64(); }, /No base64 encoder/);
    assert.throws(function () { convert.fromBase64('e30='); }, /No base64 decoder/);
  } finally {
    global.Buffer = savedBuffer;
    global.atob = savedAtob;
    global.btoa = savedBtoa;
  }
  assert.throws(function () { convert.fromBase64(12); }, /must not be of type number/);
});

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

async function main() {
  for (var index = 0; index < tests.length; index++) {
    var current = tests[index];
    try {
      await current.run();
      console.log('ok - ' + current.name);
    } catch (error) {
      console.error('not ok - ' + current.name);
      throw error;
    }
  }
  console.log('1..' + tests.length);
}

main().catch(function (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
});
