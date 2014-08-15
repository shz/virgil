var engine = require('./engine')
  , ast = require('../ast')
  , World = require('../world')
  ;

exports.statement = function(src) {
  return engine(src)[0];
};

exports.snippet = function(src) {
  return engine(src);
};

exports.module = function(src, filename) {
  return new ast.Module(engine(src, world));
};
