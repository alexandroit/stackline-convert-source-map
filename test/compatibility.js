'use strict';

var assert = require('assert');
var inlineSourceMap = require('inline-source-map');
var upstream = require('convert-source-map');
var candidate = require('..');

var generated = inlineSourceMap({ file: 'bundle.js' })
  .addGeneratedMappings('input.js', 'one\ntwo')
  .addSourceContent('input.js', 'one\ntwo');
var object = generated.toJSON();
var json = JSON.stringify(object);
var base64 = Buffer.from(json, 'utf8').toString('base64');
var uri = encodeURIComponent(json);

[
  ['object', function (convert) { return convert.fromObject(object); }],
  ['JSON', function (convert) { return convert.fromJSON(json); }],
  ['base64', function (convert) { return convert.fromBase64(base64); }],
  ['URI', function (convert) { return convert.fromURI(uri); }],
  ['base64 comment', function (convert) { return convert.fromComment('//# sourceMappingURL=data:application/json;base64,' + base64); }],
  ['URI comment', function (convert) { return convert.fromComment('//# sourceMappingURL=data:application/json,' + uri); }]
].forEach(function (scenario) {
  var expected = scenario[1](upstream);
  var actual = scenario[1](candidate);
  assert.deepStrictEqual(actual.toObject(), expected.toObject(), scenario[0] + ' object');
  assert.strictEqual(actual.toJSON(), expected.toJSON(), scenario[0] + ' JSON');
  assert.strictEqual(actual.toBase64(), expected.toBase64(), scenario[0] + ' base64');
  assert.strictEqual(actual.toURI(), expected.toURI(), scenario[0] + ' URI');
  assert.strictEqual(actual.toComment(), expected.toComment(), scenario[0] + ' comment');
  assert.strictEqual(actual.toComment({ multiline: true }), expected.toComment({ multiline: true }), scenario[0] + ' block');
});

var source = 'function x() {}\n' + upstream.fromObject(object).toComment();
assert.deepStrictEqual(candidate.fromSource(source).toObject(), upstream.fromSource(source).toObject());
assert.strictEqual(candidate.removeComments(source), upstream.removeComments(source));

var external = 'function x() {}\n//# sourceMappingURL=bundle.js.map';
function readMap(filename) {
  assert.strictEqual(filename, 'bundle.js.map');
  return json;
}
assert.deepStrictEqual(candidate.fromMapFileSource(external, readMap).toObject(), upstream.fromMapFileSource(external, readMap).toObject());
assert.strictEqual(candidate.removeMapFileComments(external), upstream.removeMapFileComments(external));

var expectedObject = { version: 3 };
var actualObject = { version: 3 };
upstream.fromObject(expectedObject).addProperty('file', 'x.js').setProperty('mappings', 'AAAA');
candidate.fromObject(actualObject).addProperty('file', 'x.js').setProperty('mappings', 'AAAA');
assert.deepStrictEqual(actualObject, expectedObject);

var expectedMatch = upstream.commentRegex.exec('//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64);
var actualMatch = candidate.commentRegex.exec('//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64);
assert.deepStrictEqual(actualMatch && actualMatch.slice(1), expectedMatch && expectedMatch.slice(1));

console.log('Compatibility scenarios passed: 10');
