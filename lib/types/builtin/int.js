var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.IntegerLiteral('0');

exports.attributes = {
                     };

exports.methods = [
  ['asFloat', canned['float']],
  ['asStr', canned['str']]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['int']].concat(m.slice(1)))];
});

