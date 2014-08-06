var ast = require('./ast')
  ;

// TODO - Handle overloads

/* istanbul ignore next */
var Scope = function(node, parent) {
  this._scanned = false;
  this.node = node;
  this.parent = parent || null;
  this.methods = {};
  this.functions = {};
  this.variables = {};
  this.structs = {};
  this.scopes = [];
};

Scope.prototype.scan = function() {
  if (this._scanned)
    return;
  this._scanned = true;

  var check = function(name) {
    if (this.functions[name] || this.variables[name] || this.structs[name])
      throw new Error('Name "' + name + '" is already in use');
  }.bind(this);

  var stack = [this];
  var enter = function(n) {
    var cur = stack[stack.length - 1];

    switch (n.constructor) {
      case ast.BlockStatement:
        var s = new Scope(n, cur);
        stack.push(s);
        cur.scopes.push(s);
        break;

      case ast.FunctionStatement:
        check(n.name);
        cur.functions[n.name] = n;
        break;

      case ast.MethodStatement:
        check(n.name);
        cur.methods[n.name] = n;
        break;

      case ast.StructStatement:
        check(n.name);
        cur.structs[n.name] = n;
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        check(n.name);
        cur.variables[n.name] = n;
        break;
    }
  };

  var exit = function(n) {
    if (n.constructor == ast.BlockStatement) {
      stack.pop();
    }
  };

  ast.traverse(this.node, enter, exit);
};

exports.build = function(root) {
  var s = new Scope(root);
  s.scan();
  return s;
};
