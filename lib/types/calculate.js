var TypeRef = require('./typeref')
  , canned = require('./canned')
  , util = require('./util')
  , builtin = require('./builtin')
  , ast = require('../ast')
  ;

var make = util.make
  , equal = util.equal
  ;

var doThrow = function(message, node) {
  var err = new Error(message);
  err.start = node.loc.start;
  err.end = node.loc.end;
  throw err;
};


var calculate = exports.calculate = function(exp) {
  if (!exp)
    throw new Error('Null expression');
  if (!(exp instanceof ast.Expression))
    doThrow(exp.constructor.name + ' is not an expression; its type cannot be calculated', exp);
  if (exp.type)
    return exp.type;
  var c = exp.constructor;

  switch (c) {

    // Literals
    case ast.TrueLiteral:
    case ast.FalseLiteral:
      return canned['bool'];
    case ast.StringLiteral:
      return canned['str'];
    case ast.IntegerLiteral:
      return canned['int'];
    case ast.FloatLiteral:
      return canned['float'];
    case ast.NullLiteral:
      return canned['null'];

    // Logic always gives bools
    case ast.EqualsExpression:
    case ast.GreaterThanExpression:
    case ast.LessThanExpression:
      return canned['bool'];

    // List access sends back the list's type
    case ast.ListAccessExpression:
      var indexer = calculate(exp.right);
      if (indexer != canned['int'])
        doThrow('List indexer must be an int; instead it\'s ' + indexer.toString(), exp.right);
      return calculate(exp.left).generics[0];

    // Arithmetic
    case ast.AdditionExpression:
      if (calculate(exp.left) == canned['str'] && calculate(exp.right) == canned['str'])
        return canned['str'];
      // FALL THROUGH
    case ast.MultiplicationExpression:
    case ast.SubtractionExpression:
    case ast.DivisionExpression:
    case ast.PowerExpression:
    case ast.ModExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if ((left != canned['float'] && left != canned['int']) ||
      (right != canned['float'] && right != canned['int']))
        doThrow('Arithmetic may only be performed on numeric types', exp);

      if (left == canned['float'] || right == canned['float'])
        return canned['float'];
      if (left == right)
        return left;

      break;

    // Ternary expression just delegates
    case ast.TernaryExpression:
      var cond = calculate(exp.condition);
      if (cond != canned['bool'])
        doThrow('Ternary conditions must evaluate to a bool', exp.condition);

      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if (left != right) {
        doThrow('Both possible results from a terminal expression must ' +
          'resolve to the same type', exp);
      }
      return left;

    // List expression
    case ast.ListExpression:
      if (exp.body.length == 0)
        return canned['inferred'];

      var type = null;
      for (var i=0; i<exp.body.length; i++) {
        var t2 = calculate(exp.body[i]);
        if (!type)
          type = t2;
        else if (!equal(type, t2))
          doThrow('Inconsistent types in a list expression; contains both ' +
            type.toString() + ' and ' + t2.toString(), exp);
      }

      return new TypeRef('list', [type]);

    // Identifiers search scope, if possible
    case ast.Identifier:
      if (exp.type)
        return exp.type;
      if (!exp.scope)
        return canned['inferred'];

      var defScope = exp.scope.search(exp.name);
      if (!defScope)
        doThrow('Name "' + exp.name + '" is not defined in this scope', exp);

      var n;
      if ((n = defScope.variables[exp.name])) {
        if (!n.type || n.type == canned['inferred'])
          doThrow('Type is not yet defined for variable "' + n.name + '"', exp);
        exp.type = n.type;
        return exp.type;

      } else if ((n = defScope.functions[exp.name])) {
        exp.type = make('func', n.args.map(function(a) { return a[1] }).concat([n.type]));
        return exp.type;

      } else if ((n = defScope.structs[exp.name])) {
        exp.type = make(exp.name);
        return exp.type;

      } else {
        doThrow('Egad, parser bug in the type calculation engine!  Guru meditation: 0xDEADBEEF', exp);
      }

    // Functions are easy, they just return declared type
    case ast.FunctionCallExpression:
      if (exp.type)
        return exp.type;
      if (!exp.scope)
        return canned['inferred'];

      var t = calculate(exp.left);
      if (t.name == 'func' || t.name == 'method')
        exp.type = t.generics[t.generics.length - 1];
      else if (!t.builtin)
        exp.type = t;
      if (exp.type)
        return exp.type;

      doThrow('Parser bug: unable to determine type for callable expression ' + exp.left.constructor.name, exp);

    // Property access is a bitch
    case ast.PropertyAccessExpression:
      if (exp.type)
        return exp.type;

      // Find out what we are on the left
      var left = calculate(exp.left);

      // Hunt for a method with the appropriate name
      var method = exp.scope.findMethod(left, exp.right.name)
      if (method) {
        exp.type = make('method', method.args.map(function(a) { return a[1] }).concat([method.type]));
        return exp.type;
      }

      // Handle access on built-in types
      if (left.builtin) {
        // Attributes
        var attr = builtin[left.name].attributes[exp.right.name];
        if (attr) {
          exp.type = attr;
          return exp.type;
        }

        // Methods
        for (var i=0; i<builtin[left.name].methods.length; i++) {
          var m = builtin[left.name].methods[i];
          if (m[0] == exp.right.name) {
            exp.type = m[1];
            return exp.type;
          }
        }

      // Handle user types
      } else {
        var defScope = exp.scope.search('struct', left.name);
        if (!defScope)
          doThrow('This should never happen, but there is no struct named "' + left.name + '".  How do we know it\'s a struct?', exp.left);
        var structNode = defScope.structs[left.name];

        // Hunt for the property
        for (var i=0; i<structNode.body.declarations.length; i++) {
          var decl = structNode.body.declarations[i];

          if (decl.name == exp.right.name) {
            exp.type = decl.type;
            return exp.type;
          }
        }
      }

      doThrow('Struct "' + left.name + '" has no attribute or method named "' + exp.right.name + '"', exp.right);
  }

  // throw new Error('Can\'t infer type from ' + exp.constructor.name);
  return canned['inferred'];
};

var realize = exports.realize = function(root) {
  ast.traverse(root, function(n) {
    switch (n.constructor) {

      // Resolve variable types
      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        var t = calculate(n.expression);

        // Cannot assign void to a variable
        if (t == canned['void'])
          doThrow('Cannot initialize variable to void', n);

        // If the declared type and the calculated type don't match, we
        // need to raise an error.  However, we'll also special-case
        // numerics to be interchangable.
        if (n.type && n.type != canned['inferred'] && t != canned['null'] && t != canned['inferred']) {
          if (n.type.numeric && t.numeric) {
            // Do nothing.
          } else if (!equal(n.type, t)) {
            doThrow('Type mismatch: ' + n.type.toString() + ' != ' + (t || 'ERR').toString(), n);
          }
        }
        if (!n.type && t == canned['inferred'])
          doThrow('Cannot infer type for ' + n.name, n);

        if (!n.type || n.type == canned['inferred'])
          n.type = t;

        if (n.type == canned['null'])
          doThrow('Null is not a valid type', n);

        // console.log('Calculated type of', n.name, n.type ? n.type.name : n.type);

        break;

      // If property access propagates, the right portion gets flagged
      // as an identifier and will fail, so we skip it.
      case ast.PropertyAccessExpression:
        calculate(n);
        realize(n.left);
        return false;

      // Resolve other types
      case ast.FunctionCallExpression:
      case ast.Identifier:
        calculate(n);
        break;
    }
  });
};
