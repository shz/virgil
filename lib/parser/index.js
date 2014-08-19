var engine = require('./engine')
  , ast = require('../ast')
  , World = require('../world')
  ;

exports.statement = function(src) {
  return engine(src, true)[0];
};

exports.snippet = function(src) {
  return engine(src, true);
};

exports.module = function(src, filename) {
  return new ast.Module(engine(src));
};
