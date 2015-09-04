var fs = require('fs');
var path = require('path')
  , ast = require('../../ast')
  , Converter = require('../common/converter')
  , propertyMapping = require('../common/property_mapping')
  ;

// TODO - Proper renaming of generic params on unnatural methods on a
//        generic user-defined type

//
// Available options:
//
//  * baseDir - Optional, base dir for source code
//
var SwiftConverter = module.exports = function SwiftConverter(options) {
  options = options || {};

  this.options = options;
  this.baseDir = options.baseDir;
  this.renamedIdentifiers = {};
};
var proto = SwiftConverter.prototype = new Converter('swift', require('./swift_stdlib'), {
  sweepNaturalMethods: true,
  sweepUnnaturalMethods: true
});
proto.constructor = SwiftConverter;

proto._convert = function(node) {
  if (node instanceof ast.Literal) {
    return this.literal(node);
  } else if (node instanceof ast.Expression) {
    return this.expression(node);
  } else if (node instanceof ast.Statement) {
    return this.statement(node);
  } else if (node instanceof ast.Module) { // For unnatural methods
    return this.statement(node);
  } else if (node instanceof ast.Node) {
    node.throw('Don\'t know how to convert a ' + node.constructor.name);
  } else if (!node) {
    throw new Error('Cannot convert, node is ' + node);
  } else {
    var it = node.constructor ? node.constructor.name : node;
    node.throw('Don\'t know how to convert a ' + it);
  }
};
proto._compile = function(m) {
  var program = null;
  if (m instanceof ast.Module) {
    program = m.body;
    // Push the module itself, as we have a special for it that will
    // turn unnatural methods into extensions.
    program.unshift(m);
  } else if (m instanceof Array) {
    program = m;
  } else {
    program = [m];
  }

  var filemap = {};
  var filename = (this.baseDir ? path.relative(this.baseDir, m.filename) : m.filename)
                 .replace(/\.vgl$/, '') + '.swift'
                 ;
  filemap[filename] = program.map(this.convert, this).join('\n');
  return filemap;
};

proto.renameIdentifier = function(orig, renamed) {
  if (!renamed) {
    delete this.renamedIdentifiers[orig];
  } else {
    this.renamedIdentifiers[orig] = renamed;
  }
};

proto.mixin(require('./literals'));
proto.mixin(require('./expressions'));
proto.mixin(require('./statements'));
proto.mixin(require('./types'));
proto.mixin(require('./indent'));
proto.mixin(require('./unnatural'));
proto.mixin(require('./functions'));
