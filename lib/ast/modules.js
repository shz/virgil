var core = require('./core');


function Module(body, filename, src) {
  this.body = body; // List of AST nodes that make up the module's logic
  this.filename = filename; // Absolute filename to the module's underlying file
  this.src = src || ''; // Module's source code
}

function ImportStatement(module) {
  this.module = module; // Array of module path e.g. ['foo', 'bar']
  this.ast = null;
}

function ExternStatement(namespace, structs, functions, methods, declarations) {
  this.namespace = namespace;
  this.structs = structs;
  this.functions = functions;
  this.methods = methods;
  this.declarations = declarations;
  this.ex = false;
}

core.inherits(Module, core.Node);
core.inherits(ImportStatement, core.Statement);
core.inherits(ExternStatement, core.Statement);
