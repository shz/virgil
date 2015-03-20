var engine = require('./engine')
  , ast = require('../ast')
  , World = require('../world')
  ;

module.exports = function(src, filename) {
  return new ast.Module(engine(src), filename, src);
};

module.exports.statement = function(src) {
  return engine(src, true)[0];
};

module.exports.snippet = function(src) {
  return engine(src, true);
};

