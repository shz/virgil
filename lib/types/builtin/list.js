var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

var T = new TypeRef('\'T');

exports.default = new ast.ListExpression([]);

exports.attributes = { length: canned['int']
                     };

exports.methods = [
  ['empty', canned['void']],
  ['remove', canned['int'], T],
  ['removeRange', canned['int'], canned['int'], new TypeRef('list', [T]) ],
  ['push', T, canned['void']],
  ['pop', T]
].map(function(m) {
  return [
    // Method name
    m[0],
    // Signature
    new TypeRef('method',
      [new TypeRef('list', [T])].concat(m.slice(1))
    )
  ];
});
