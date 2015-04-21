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
  ['toLocal', canned['datetime']],
  ['toGMT', canned['datetime']],
  ['toOffset', canned['int'], canned['datetime']],
  ['format', canned['str'], canned['str'], canned['str']]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['datetime']].concat(m.slice(1)))];
});
