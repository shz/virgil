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
  ['ceil', canned['int']],
  ['round', canned['int']],
  ['abs', canned['float']],
  ['cos', canned['float']],
  ['sin', canned['float']],
  ['tan', canned['float']],
  ['acos', canned['float']],
  ['asin', canned['float']],
  ['atan', canned['float']]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['float']].concat(m.slice(1)))];
});
