var escodegen = require('escodegen')
  , Converter = require('../common/converter')
  ;

var JavascriptConverter = module.exports = function JavascriptConverter(options) {
  this.options = options;
};
var proto = JavascriptConverter.prototype = new Converter('javascript');
proto.constructor = JavascriptConverter;


proto.compile = function(program) {
  // Convert JS ast into a string
  var js = escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};

proto.convert = function(node) {

};
