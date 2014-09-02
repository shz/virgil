var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.ListExpression([]);

exports.attributes = { length: canned['int']
                     };

exports.methods = [
  // ['empty', 'void'],
  // Temp
  // ['push', 'int', new TypeRef('list', ['int'])]
].map(function(m) {
  return [m[0], new TypeRef('method', [new TypeRef('list')].concat(m[1]))];
});
