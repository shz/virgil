var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.FloatLiteral('0');

exports.attributes = {
                     };

exports.methods = [

].map(function(m) {
  return [m[0], new TypeRef('method', [canned['list']].concat(m[1]))];
});
