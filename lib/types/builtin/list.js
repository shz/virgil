var canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.attributes = { length: canned['int']
                     };

exports.methods = [
  ['empty', 'void'],
  // Temp
  ['push', 'int', new TypeRef('list', ['int'])]
].map(function(m) {
  return [m[0], new TypeRef('method', [canned['list']].concat(m[1]))];
});
