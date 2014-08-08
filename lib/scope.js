var ast = require('./ast')
  ;

var doThrow = function(message, node) {
  var err = new Error(message);
  err.start = node.loc.start;
  err.end = node.loc.end;
  throw err;
};

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

Scope.prototype.scan = function(attach) {
  if (this._scanned)
    return;
  this._scanned = true;

  var check = function(node) {
    var name = node.name;
    if (this.functions[name] || this.variables[name] || this.structs[name])
      doThrow('Name "' + name + '" is already in use', node);
  }.bind(this);

  var stack = [this];
  var enter = function(n) {
    var cur = stack[stack.length - 1];

    switch (n.constructor) {
      case ast.BlockStatement:
      case ast.AssignmentBlock:
        var s = new Scope(n, cur);
        stack.push(s);
        cur.scopes.push(s);
        break;

      case ast.FunctionStatement:
        check(n);
        cur.functions[n.name] = n;
        break;

      case ast.MethodStatement:
        check(n);
        cur.methods[n.name] = n;
        break;

      case ast.StructStatement:
        check(n);
        cur.structs[n.name] = n;
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        check(n);
        cur.variables[n.name] = n;
        break;
    }

    if (attach)
      n.scope = stack[stack.length - 1];
  };

  var exit = function(n) {
    if (n.constructor == ast.BlockStatement) {
      stack.pop();
    }
  };

  ast.traverse(this.node, enter, exit);
};

Scope.prototype.search = function(kind, name) {
  if (name === undefined) {
    name = kind;
    kind = undefined;
  }

  var find = function(kind) {
    if (this[kind + 's'].hasOwnProperty(name))
      return this;
    if (this.parent)
      return this.parent.search(kind, name);
    return null;
  }.bind(this);

  if (kind)
    return find(kind);

  return find('method') || find('function') || find('variable') || find('struct');
};

exports.build = function(root, attach) {
  var s = new Scope(root);
  s.scan(!!attach);
  return s;
};
