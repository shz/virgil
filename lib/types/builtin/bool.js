var canned = require('../canned')
  , TypeRef = require('../typeref')
  ;

exports.attributes = {
                     };

exports.methods = [

].map(function(m) {
  return [m[0], new TypeRef('method', [canned['list']].concat(m[1]))];
});
