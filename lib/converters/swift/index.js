var fs = require('fs');
var ast = require('../../ast')
  , Converter = require('../common/converter')
  , propertyMapping = require('../common/property_mapping')
  ;

var SwiftConverter = module.exports = function SwiftConverter(options) {
  options = options || {};

  this.options = options;
  this.currentModule = null;
};
var proto = SwiftConverter.prototype = new Converter('swift');
proto.constructor = SwiftConverter;

proto.convert = propertyMapping.use(require('./swift_map'), function(node) {
  if (node instanceof ast.Literal) {
    return this.literal(node);
  } else if (node instanceof ast.Expression) {
    return this.expression(node);
  } else if (node instanceof ast.Statement) {
    return this.statement(node);
  } else if (node instanceof ast.Node) {
    node.throw('Don\'t know how to convert a ' + node.constructor.name);
  } else {
    throw new Error('Don\'t know how to convert a ' + node.constructor.name);
  }
});
proto.compile = function(mod) {
  var program = null;
  if (m instanceof ast.Module) {
    program = m.body;
  } else if (m instanceof Array) {
    program = m;
  } else {
    program = [m];
  }

  return program.map(this.convert, this).join('\n');
};

proto.mixin(require('./literals'));
proto.mixin(require('./expressions'));
proto.mixin(require('./statements'));
proto.mixin(require('./types'));
