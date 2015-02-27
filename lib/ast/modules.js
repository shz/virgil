var core = require('./core');


function Module(body, path) {
  this.body = body;
  this.path = path;
}

function ImportStatement(module) {
  this.module = module;
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
