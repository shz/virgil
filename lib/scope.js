var ast = require('./ast')
  , types = require('./types')
  ;

var handlers = {
  struct: function(s, n) {
    s.structs[n.name] = n;
  },
  variable: function(s, n) {
    s.variables[n.name] = n;
  },
  extern: function(s, n) {
    for (var i=0; i<n.structs.length; i++)
      handlers.struct(n.structs[i]);
    for (var i=0; i<n.functions.length; i++)
      handlers.func(n.functions[i]);
    for (var i=0; i<n.methods.length; i++)
      handlers.method(n.methods[i]);
    for (var i=0; i<n.declarations.length; i++)
      handlers.variable(n.declarations[i]);
  },
  method: function(s, n) {
    s.methods.push([
      n.args[0][1],
      n.name,
      n
    ]);
  },
  func: function(s, n) {
    s.functions[n.name] = n;
  }
}

var doThrow = function(message, node) {
  var err = new Error(message);
  err.start = node.loc.start;
  err.end = node.loc.end;
  throw err;
};

var grabExports = function(ownerScope, importNode) {
   // If we're not compiling in module mode, imports don't happen
  if (!importNode.ast)
    return;

  importNode.ast.body.forEach(function(n) {
    if (!n.ex)
      return;

    n.originModule = importNode.module;

    switch (n.constructor) {
      case ast.StructStatement:
        handlers.struct(ownerScope, n);
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        handlers.variable(ownerScope, n);
        break;

      case ast.ExternStatement:
        handlers.extern(ownerScope, n);
        break;

      case ast.MethodStatement:
        handlers.method(ownerScope, n);
        break;

      case ast.FunctionStatement:
        handlers.func(ownerScope, n);
        break;
    }
  });
};



var Scope = function(node, parent) {
  this._scanned = false;
  this.node = node;
  this.parent = parent || null;
  this.methods = []; // List of [type, name, node]
  this.functions = {};
  this.variables = {};
  this.structs = {};
  this.scopes = [];
};

/* istanbul ignore next */
Scope.prototype.scan = function(attach) {
  if (this._scanned)
    return;
  this._scanned = true;

  // Args waiting to be added to the scope of the next block statement
  var waitingArgs = null;

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
      case ast.ImportStatement:
        grabExports(cur, n);
        break;

      case ast.AssignmentBlock:
      case ast.BlockStatement:
        var s = new Scope(n, cur);
        stack.push(s);
        cur.scopes.push(s);

        if (waitingArgs) {
          waitingArgs.forEach(function(a) {
            if (a instanceof Array)
              s.variables[a[0]] = new ast.VariableDeclaration(a[0], a[1], new ast.NullLiteral());
            else
              s.variables[a.name] = a;
          });
          waitingArgs = null;
        }
        break;

      case ast.LambdaExpression:
        waitingArgs = n.args;
        break;

      case ast.FunctionStatement:
        check(n);
        handlers.func(cur, n);
        waitingArgs = n.args;
        break;

      case ast.MethodStatement:
        check(n);
        handlers.method(cur, n);
        waitingArgs = n.args;
        break;

      case ast.ForStatement:
        waitingArgs = [n.declaration];
        break;

      case ast.StructStatement:
        check(n);
        handlers.struct(cur, n);
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        if (cur.node.constructor != ast.AssignmentBlock)
          check(n);
        handlers.variable(cur, n);
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

Scope.prototype.findMethod = function(type, name) {
  for (var i=0; i<this.methods.length; i++) {
    var m = this.methods[i];

    if (types.equal(m[0], type) && m[1] == name)
      return m[2];
  }

  if (this.parent)
    return this.parent.findMethod(type, name);
  return null;
};

Scope.prototype.search = function(kind, name) {
  // Methods are special cased with their own function
  if (kind == 'method') {
    throw new Error('Cannot find methods using .search().  Use .findMethod() instead.');
  }

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

  return find('function') || find('variable') || find('struct');
};

exports.build = function(root, attach) {
  var s = new Scope(root);
  s.scan(!!attach);
  return s;
};
