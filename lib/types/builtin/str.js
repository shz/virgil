var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.StringLiteral('');

exports.attributes = { 
  length: canned['int']
};

exports.methods = [
  ['upper', canned['str']],
  ['lower', canned['str']],
  ['at', canned['int'], canned['str']],
  ['asInt', canned['int']],
  ['asFloat', canned['float']]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['str']].concat(m.slice(1)))];
});
