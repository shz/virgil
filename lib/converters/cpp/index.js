var ast = require('../../ast')
  , Converter = require('../common/converter')
  , convert = require('./converter')
  ;

//
// Available options:
//
//  * baseDir - Required, base dir for source code
//  * namespace - Optional, if specified used as namespace
//
var CPPConverter = module.exports = function CPPConverter(options) {
  options = options || {};

  this.options = options;
  this.baseDir = options.baseDir || '.';
  this.currentModule = null;
};
var proto = CPPConverter.prototype = new Converter('cpp');
proto.constructor = CPPConverter;

proto.compile = function(m) {
  return convert(m, this.options);
};
