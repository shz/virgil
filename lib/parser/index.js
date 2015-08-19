var engine = require('./engine')
  , ast = require('../ast')
  ;

//
// Two signatures:
//
//   parser(src, filename)
//   parser(module)
//
module.exports = function(src, filename, allowBare) {
  if (typeof filename != 'string') {
    allowBare = filename;
    filename = undefined;
  }

  if (src instanceof ast.Module) {
    var m = src;
    m.body = engine(m.src, allowBare);
    return m;
  } else {
    return new ast.Module(engine(src, allowBare), filename, src);
  }
};

module.exports.statement = function(src) {
  return engine(src, true)[0];
};

module.exports.snippet = function(src) {
  return engine(src, true);
};

