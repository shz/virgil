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

  var stack = [this];
  var enter = function(n) {
    var cur = stack[stack.length - 1];

    var check = function(node) {
      var defScope = cur.search(node.name);

      if (defScope) {
        if (defScope == cur)
          doThrow('Name "' + node.name + '" is already defined in this scope', node);
        if (node.override)
          return;
        if (node instanceof ast.VariableDeclaration ||
            node instanceof ast.MutableVariableDeclaration ||
            node instanceof ast.OutVariableDeclaration) {
          doThrow('Name "' + node.name + '" is already defined in a parent scope. ' +
            'Try using ! if you want to override (e.g. let! foo = 1)', node);
        }

        doThrow('Name "' + node.name + '" is already defined in a parent scope', node);
      }
    };

    switch (n.constructor) {
      case ast.AssignmentBlock:
        var s = new Scope(n); // Don't give it a parent!  It's indepedent
        stack.push(s);
        cur.scopes.push(s);
        break;

      case ast.BlockStatement:
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
        // console.log('var', n.name);
        check(n);
        cur.variables[n.name] = n;
        break;
    }

    if (attach)
      n.scope = stack[stack.length - 1];
  };

  var exit = function(n) {
    switch (n.constructor) {
      case ast.BlockStatement:
      case ast.AssignmentBlock:
        stack.pop();
        break;
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
