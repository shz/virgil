var core = require('./core');


function Module(body, filename, src) {
  this.body = body; // List of AST nodes that make up the module's logic
  this.filename = filename; // Absolute filename to the module's underlying .vgl file
  this.src = src || ''; // Module's source code
  this.lib = null; // Null if this module didn't come from a lib, otherwise:
  //
  // this.lib = {name: 'some-lib', importPath: ['some-lib', 'foo', 'bar']}
}

function ImportStatement(module) {
  this.module = module; // Array of module path e.g. ['foo', 'bar']
  this.ast = null; // Pointer to this import's Module.  TODO - Terrible name

  // The below is never used, I think -- but in case its usage does
  // crop up causing an exception somewhere, here's what it's supposed
  // to be.  This doesn't seem to be implemented anywhere...

  // this.filename = null; // Filename of resolved import, relative to owner module
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
