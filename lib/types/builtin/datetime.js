var ast = require('../../ast')
  , canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.default = new ast.NewExpression(canned['datetime'], new ast.AssignmentBlock());

exports.attributes = {
  ts: canned['int'],
  offset: canned['int']
};

exports.methods = [
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['datetime']].concat(m.slice(1)))];
});
