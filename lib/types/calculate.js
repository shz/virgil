var TypeRef = require('./typeref')
  , canned = require('./canned')
  , util = require('./util')
  , builtin = require('./builtin')
  , generics = require('./generics')
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
      exp.type = canned['bool'];
      return exp.type;
    case ast.StringLiteral:
      exp.type = canned['str'];
      return exp.type;
    case ast.IntegerLiteral:
      exp.type = canned['int'];
      return exp.type;
    case ast.FloatLiteral:
      exp.type = canned['float'];
      return exp.type;
    case ast.NullLiteral:
      exp.type = canned['null'];
      return exp.type;


    // Logic always gives bools
    case ast.EqualsExpression:
    case ast.GreaterThanExpression:
    case ast.LessThanExpression:
    case ast.GreaterThanEqualExpression:
    case ast.LessThanEqualExpression:
    case ast.NotExpression:
      return canned['bool'];

    // Negation expression gives the original expression's type, but
    // only works on numerics.
    case ast.NegationExpression:
      var t = calculate(exp.expression);
      if (!t.numeric)
        doThrow('Negation is only allowed on numeric types', exp);
      exp.type = t;
      return t;

    // List access sends back the list's type
    case ast.ListAccessExpression:
      var indexer = calculate(exp.right);
      if (indexer != canned['int'])
        doThrow('List indexer must be an int; instead it\'s ' + indexer.toString(), exp.right);
      exp.type = calculate(exp.left).generics[0];
      return exp.type;

    // Arithmetic
    case ast.AdditionExpression:
      if (calculate(exp.left) == canned['str'] && calculate(exp.right) == canned['str'])
        return canned['str'];
      // FALL THROUGH
    case ast.MultiplicationExpression:
    case ast.SubtractionExpression:
    case ast.DivisionExpression:
    case ast.PowerExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      // console.log(exp.constructor.name, left.toString(), right.toString());

      if (!left.numeric || !right.numeric) {
        var offender = null;
        if (!left.numeric)
          offender = exp.left;
        else if (!right.numeric)
          offender = exp.right;

        var message = 'Arithmetic may only be performed on numeric types';
        if (offender.constructor == ast.Identifier)
          message += '; ' + offender.name + ' is type ' + offender.type.toString();
        else if (offender.constructor == ast.PropertyAccessExpression)
          message += '; ' + offender.right.name + ' is type ' + offender.type.toString();
        doThrow(message, exp);
      }

      if (!equal(left, right))
        doThrow('Arithmetic must be performed on numbers of the same type;' +
          ' the types used here are ' + left.toString() + ' and ' + right.toString(), exp);

      exp.type = left;
      return exp.type;


    case ast.ModExpression:
      if (calculate(exp.left) != canned['int'] || calculate(exp.right) != canned['int'])
        doThrow('Mod operator (%) may only be used on integer types', exp);
      exp.type = canned['int'];
      return exp.type;

    // Ternary expressions require the conditions to be boolean
    case ast.TernaryExpression:
      var cond = calculate(exp.condition);
      if (cond != canned['bool'])
        doThrow('Ternary conditions must evaluate to a bool', exp.condition);
      // FALL THROUGH
    case ast.LogicalOrExpression:
    case ast.LogicalAndExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if (left != right) {
        doThrow('Both possible results from a binary expression must ' +
          'resolve to the same type', exp);
      }
      exp.type = left;
      return exp.type;

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

      exp.type = new TypeRef('list', [type]);
      return exp.type;

    // Identifiers search scope, if possible
    case ast.Identifier:
      if (!exp.scope)
        return canned['inferred'];

      var defScope = exp.scope.search(exp.name);
      if (!defScope) {
        doThrow('Name "' + exp.name + '" is not defined in this scope', exp);
      }

      var n;
      if ((n = defScope.variables[exp.name])) {
        if (!n.type || n.type == canned['inferred'])
          doThrow('Type is not yet defined for variable "' + n.name + '"', exp);
        exp.type = n.type;
        exp.def = n;
        return exp.type;

      } else if ((n = defScope.functions[exp.name])) {
        exp.type = make('func', n.args.map(function(a) { return a[1] }).concat([n.type]));
        exp.def = n;
        return exp.type;

      } else if ((n = defScope.structs[exp.name])) {
        doThrow('Referring to a type in this context is illegal', exp);

      } else {
        doThrow('Egad, parser bug in the type calculation engine!  Guru meditation: 0xDEADBEEF', exp);
      }

    // Functions are easy, they just return declared type.  However, we
    // also need to make sure that the argument types match up.
    case ast.FunctionCallExpression:
      if (!exp.scope)
        return canned['inferred'];

      var t = calculate(exp.left);

      // Sanity check to make sure it's callable
      if (t.name != 'func' && t.name != 'method')
        doThrow('Expression is not callable', exp.left);

      // Match up arguments
      var argTypes = exp.args.map(calculate);
      var funcTypes = t.generics.slice(0, t.generics.length - 1);
      if (t.name == 'method')
        funcTypes.shift();

      // Throw an error if a different number of arguments are passed
      if (argTypes.length != funcTypes.length) {
        var message = 'takes ' + funcTypes.length + ' arguments, not ' + argTypes.length;
        if (t.name == 'func') {
          if (exp.left.constructor == ast.Identifier)
            message = exp.left.name + ' ' + message;
          message = 'Function ' + message;
        } else {
          if (exp.left.constructor == ast.PropertyAccessExpression)
            message = exp.left.right.name + ' ' + message;
          message = 'Method ' + message;
        }
        doThrow(message, exp);
      }

      // Figure out return type.  It may be generic at this point.
      exp.type = t.generics[t.generics.length - 1];

      // Resolve generic names, and then update return type if needed
      if (t.hasGenericReference()) {
        try {
          var resolution = {};
          if (t.name == 'method') {
            resolution = generics.resolve( new TypeRef('method', [t.generics[0]].concat(funcTypes))
                                         , new TypeRef('method', [exp.left.left.type].concat(argTypes))
                                         );
          } else if (t.name == 'func') {
            resolution = generics.resolve( new TypeRef('func', funcTypes)
                                         , new TypeRef('func', argTypes)
                                         );
          }
          exp.type = exp.type.resolveGenerics(resolution);

        } catch (err) {
          console.error(err.stack);
          doThrow(err.message, exp);
        }

      // Otherwise, manually check argument types to generate a better
      // error message.
      } else {
        for (var i=0; i<argTypes.length; i++)
          if (!equal(funcTypes[i], argTypes[i]))
            doThrow('Invalid function call argument types, expected [' +
              funcTypes.map(function(t) { return t.toString() }).join(', ') + '], got [' +
              argTypes.map(function(t) { return t.toString() }).join(', ') + '].', exp);
      }

      // Fin
      return exp.type;

    case ast.NewExpression:
      // This never actually happens.  The syntax tree always has a
      // .type attribute on NewExpression nodes.  Easy!
      break;

    case ast.LambdaExpression:
      var args = exp.args.map(function(a) { return a[1] });
      args.push(exp.rtype);
      for (var i=0; i<args.length; i++) {
        if (args[i] == canned['inferred'])
          args[i] = new TypeRef('\'L' + i);
      }
      exp.type = new TypeRef('func', args);
      return exp.type;

    // Property access is a bitch
    case ast.PropertyAccessExpression:

      // Find out what we are on the left
      var left = calculate(exp.left);
      // Placeholder for type on the right
      var type = null;
      // If we're looking at a user struct, this will
      // get filled in.
      var structNode = null;


      // Hunt for a method with the appropriate name
      var method = exp.scope.findMethod(left, exp.right.name)
      if (method) {
        type = make('method', method.args.map(function(a) { return a[1] }).concat([method.type]));
        exp.right.def = method;

      // Handle access on built-in types
      } else if (left.builtin) {
        // Attributes
        var attr = builtin[left.name].attributes[exp.right.name];
        if (attr) {
          type = attr;
        }

        // Methods
        for (var i=0; i<builtin[left.name].methods.length; i++) {
          var m = builtin[left.name].methods[i];
          if (m[0] == exp.right.name) {
            type = m[1];
            break;
          }
        }

      // Error out every time if the things we're trying to access
      // properties on is generic.
      } else if (left.isGeneric) {
        var name = '';
        if (exp.left.constructor == ast.Identifier)
          name = exp.left.name;
        doThrow('Left side of ' + name + '.' + exp.right.name +
          ' is of generic type ' + left.name + '; property access' +
          ' is not allowed.', exp);

      // Handle user types
      } else {
        var defScope = exp.scope.search('struct', left.name);
        if (!defScope) {
          // console.log(exp.constructor.name, exp.scope);
          doThrow('This should never happen, but there is no struct named "' + left.name + '".  How do we know it\'s a struct?', exp.left);
        }
        structNode = defScope.structs[left.name];

        // Hunt for the property
        for (var i=0; i<structNode.body.declarations.length; i++) {
          var decl = structNode.body.declarations[i];

          if (decl.name == exp.right.name) {
            type = decl.type;
            break;
          }
        }
      }

      // Bail out if we didn't have success
      if (!type)
        doThrow('Type ' + left.toString() + ' has no attribute or method named "' + exp.right.name + '"', exp.right);

      // If the type of the property is generic, resolve them against
      // the struct's resolved generics.
      if (type.hasGenericReference()) {
        var resolution = {};
        // If the left hand is a user struct, we can scan its generics
        // normally.
        if (structNode) {
          for (var i=0; i<structNode.generics.length; i++)
            resolution[structNode.generics[i]] = left.generics[i];
        // For builtin types, we use a hack where we assume the type
        // takes a single generic param and that its name is 'T.
        } else if (left.generics.length) {
          resolution['\'T'] = left.generics[0];
        }
        type = type.resolveGenerics(resolution)
      }

      exp.type = type;
      return type;
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

        // Generics can *only* be initialized to default
        if (n.type && n.type.isGeneric && n.expression.constructor != ast.DefaultLiteral)
          doThrow('Variables with a generic type may only be initialized to default', n);

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

        // If we don't understand how to infer type, bail
        if (!n.type && t == canned['inferred'])
          doThrow('Cannot infer type for ' + n.name, n);

        // Infer type
        if (!n.type || n.type == canned['inferred'])
          n.type = t;

        // Null isn't valid
        if (n.type == canned['null'])
          doThrow('Null is not a valid type', n);

        // If the right hand is inferred, update it
        if (t == canned['inferred'])
          n.expression.type = n.type;

        // console.log('Calculated type of', n.name, n.type ? n.type.name : n.type);

        break;

      // If property access propagates, the right portion gets flagged
      // as an identifier and will fail, so we skip it.
      case ast.PropertyAccessExpression:
        calculate(n);
        realize(n.left);
        return false;

      // Assigments are statements and have no type, but we need to
      // evaluate the types.
      case ast.AssignmentStatement:
        var l = calculate(n.left);
        var r = calculate(n.right);

        if (r == canned['void']) {
          doThrow('Attempting to assign void', n);
        }
        if (!equal(l, r) && !(l.numeric && r.numeric)) {
          doThrow('Type mismatch; attempting to assign type ' +
            r.toString() + ' to ' + (n.left.name || n.left.right.name) + ', which is type ' +
            l.toString(), n);
        }
        break;

      // Functions, methods, and lambdas need their args types to be
      // in scope.
      case ast.FunctionStatement:
      case ast.MethodStatement:
      case ast.LambdaExpression:
        for (var i=0; i<n.args.length; i++) {
          var t = n.args[i][1];
          if (!t.builtin && !t.isGeneric && !n.scope.search('struct', t.name)) {
            doThrow('Struct ' + t.name + ' is not defined in this scope', n);
          }
        }
        break;

      // Return statements need to be checked
      case ast.ReturnStatement:
        if (n.expression)
          calculate(n.expression);
        break;

      // Resolve other types
      case ast.ListAccessExpression:
      case ast.Identifier:
      case ast.FunctionCallExpression:
      case ast.NewExpression:
        calculate(n);
        break;
    }
  });
};
