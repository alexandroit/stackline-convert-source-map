'use strict';

var convert = require('..');
var sourceMap = {
  version: 3,
  file: 'bundle.js',
  sources: ['input.js'],
  names: [],
  mappings: 'AAAA'
};
var comment = convert.fromObject(sourceMap).toComment();
var restored = convert.fromComment(comment).toObject();

if (restored.sources[0] !== 'input.js') throw new Error('Round trip failed');
console.log(comment);
