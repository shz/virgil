var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.FloatLiteral('0.0');

exports.attributes = {
                     };

exports.methods = [
  ['format', canned['int'], canned['str']],
  ['floor', canned['int']],
  ['ceil', canned['int']]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['float']].concat(m.slice(1)))];
});
