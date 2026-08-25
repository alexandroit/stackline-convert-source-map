'use strict';

var assert = require('assert');
var convert = require('..');
var malformed = new Array(500002).join('\n');

assert.strictEqual(convert.fromSource(malformed), null);
assert.strictEqual(convert.fromMapFileSource(malformed, function () {}), null);
assert.strictEqual(convert.removeComments(malformed), malformed);
assert.strictEqual(convert.removeMapFileComments(malformed), malformed);
