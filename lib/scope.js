var ast = require('./ast')
  ;

/* istanbul ignore next */
var Scope = function(node) {
  this.node = node;
  this.functions = {};
  this.variables = {};
  this.structs = {};
  this.scopes = [];

  var check = function(name) {
    if (this.functions[name] || this.variables[name] || this.structs[name])
      throw new Error('Name "' + name + '" is already in use');
  }.bind(this);

  var walk = function(n) {
    console.log(n.repr());

    switch (n.constructor) {
      case ast.BlockStatement:
        this.scopes.push(ast.traverse(n, walk));
        return true;

      case ast.FunctionStatement:
        check(n.name);
        this.functions[n.name] = n;
        break;

      case ast.StructStatement:
        check(n.name);
        this.structs[n.name] = n;
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        check(n.name);
        this.variables[n.name] = n;
        break;
    }
  }.bind(this);

  ast.traverse(node, walk);
};

exports.build = function(root) {
  return new Scope(root);
};
