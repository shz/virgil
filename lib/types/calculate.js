var TypeRef = require('./typeref')
  , canned = require('./canned')
  , util = require('./util')
  , builtin = require('./builtin')
  , generics = require('./generics')
  , ast = require('../ast')
  ;

// TODO - Factor out variable declaration so that our struct init
//        can make use of it.  Also remove the ability to define
//        numerics of the wrong type.

// TODO - Don't look up structs by name

var make = util.make
  , equal = util.equal
  ;

var calculate = exports.calculate = function(exp) {
  if (!exp)
    throw new Error('Null expression');
  if (!(exp instanceof ast.Expression))
    exp.throw(exp.constructor.name + ' is not an expression; its type cannot be calculated');
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
    case ast.NotEqualsExpression:
    case ast.GreaterThanExpression:
    case ast.LessThanExpression:
    case ast.GreaterThanEqualExpression:
    case ast.LessThanEqualExpression:
    case ast.NotExpression:
      exp.type = canned['bool'];
      return exp.type;

    // Negation expression gives the original expression's type, but
    // only works on numerics.
    case ast.NegationExpression:
      var t = calculate(exp.expression);
      if (!t.numeric)
        exp.throw('Negation is only allowed on numeric types');
      exp.type = t;
      return t;

    // List access sends back the list's type
    case ast.ListAccessExpression:
      var indexer = calculate(exp.right);
      if (indexer != canned['int'])
        exp.right.throw('List indexer must be an int; instead it\'s ' + indexer.toString());
      exp.type = calculate(exp.left).generics[0];
      if (!exp.type.builtin && !exp.type.isGeneric) {
        var defScope = exp.scope.search('struct', exp.type.name);
        if (!defScope) {
          exp.throw('Unknown struct ' + exp.type.name);
        }
        exp.type.def = defScope.structs[exp.type.name];
      }
      return exp.type;

    // Arithmetic
    case ast.AdditionExpression:
      if (calculate(exp.left) == canned['str'] && calculate(exp.right) == canned['str']) {
        exp.type = canned['str'];
        return exp.type;
      }
      // ELSE FALL THROUGH
    case ast.MultiplicationExpression:
    case ast.SubtractionExpression:
    case ast.DivisionExpression:
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
        exp.throw(message);
      }

      if (!equal(left, right))
        exp.throw('Arithmetic must be performed on numbers of the same type;' +
          ' the types used here are ' + left.toString() + ' and ' + right.toString());

      exp.type = left;
      return exp.type;

    case ast.PowerExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if (!left.numeric)
        exp.throw('Left side of power operator must be numeric, but is ' + left.toString());
      if (right != canned['int'])
        exp.throw('Right side of power operator must be an int, but is ' + right.toString());

      exp.type = left;
      return exp.type;

    case ast.ModExpression:
      if (calculate(exp.left) != canned['int'] || calculate(exp.right) != canned['int'])
        exp.hrow('Mod operator (%) may only be used on integer types');
      exp.type = canned['int'];
      return exp.type;

    // Ternary expressions require the conditions to be boolean
    case ast.TernaryExpression:
      var cond = calculate(exp.condition);
      if (cond != canned['bool'])
        exp.condition.throw('Ternary conditions must evaluate to a bool');
      // FALL THROUGH
    case ast.LogicalOrExpression:
    case ast.LogicalAndExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if (!equal(left, right)) {
        exp.throw('Both possible results from a binary expression must ' +
          'resolve to the same type (got ' + left.toString() + ' and ' + right.toString() + ')');
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
          exp.throw('Inconsistent types in a list expression; contains both ' +
            type.toString() + ' and ' + t2.toString());
      }

      exp.type = new TypeRef('list', [type]);
      return exp.type;

    // Identifiers search scope, if possible
    case ast.Identifier:
      if (!exp.scope)
        return canned['inferred'];

      var defScope = exp.scope.search(exp.name);
      if (!defScope) {
        exp.throw('Name "' + exp.name + '" is not defined in this scope');
      }

      var n;
      if ((n = defScope.variables[exp.name])) {
        if (!n.type || n.type == canned['inferred'])
          exp.throw('Type is not yet defined for variable "' + n.name + '"');
        exp.type = n.type;
        exp.def = n;
        return exp.type;

      } else if ((n = defScope.functions[exp.name])) {
        exp.type = make('func', n.args.map(function(a) { return a[1] }).concat([n.returnType]));
        exp.def = n;
        return exp.type;

      } else if ((n = defScope.structs[exp.name])) {
        exp.throw('Referring to a type in this context is illegal');

      } else {
        exp.throw('Egad, parser bug in the type calculation engine!  Guru meditation: 0xDEADBEEF');
      }

    // Functions are easy, they just return declared type.  However, we
    // also need to make sure that the argument types match up.
    case ast.FunctionCallExpression:
      if (!exp.scope)
        return canned['inferred'];

      var t = calculate(exp.left);

      // Sanity check to make sure it's callable
      if (t.name != 'func' && t.name != 'method')
        exp.left.throw('Expression is not callable');

      // Generic resolution for arguments.  We do this in two steps
      // to ensure we can pass as much type information to lambda
      // arguments as possible.  So, our first resolution does
      // a normal pass calculating types on everything but lambdas.
      var resolution = {};
      try {
        resolution = generics.resolve(
          new TypeRef(t.name, t.generics),
          new TypeRef(t.name, exp.args.map(function(a) {
            if (a instanceof ast.LambdaExpression) {
              return new TypeRef('func',
                a.args.map(function(arg) { return arg[1] }).concat([a.returnType])
              );
            } else {
              return calculate(a);
            }
          }).concat([t.generics[t.generics.length - 1]]))
        );
      } catch (err) {} // Swallow errors, as this might just work
                       // later on with more info.

      // Match up arguments
      var funcTypes = t.generics.slice(0, t.generics.length - 1);
      if (t.name == 'method')
        funcTypes.shift();
      var argTypes = exp.args.map(function(a, i) {
        // For lambda expressions passed directly into our function
        // calls, send the type information down so that it can
        // properly infer.
        if (a.constructor == ast.LambdaExpression) {
          a.inferredTypes = funcTypes[i].generics.map(function(t) {
            return t.resolveGenerics(resolution);
          });
        }
        return calculate(a);
      });


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
        exp.throw(message);
      }

      // Figure out return type.  It may be generic at this point.
      exp.type = t.generics[t.generics.length - 1];

      // Resolve generic names, and then update return type if needed
      if (t.hasGenericReference()) {
        try {
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
          exp.throw(err.message);
        }

      // Otherwise, manually check argument types to generate a better
      // error message.
      } else {
        for (var i=0; i<argTypes.length; i++) {
          if (!equal(funcTypes[i], argTypes[i])) {
            exp.throw('Invalid function call argument types, expected [' +
              funcTypes.map(function(t) { return t.toString() }).join(', ') + '], got [' +
              argTypes.map(function(t) { return t.toString() }).join(', ') + '].');
          }
        }
      }

      // Find the type's definition if it's not built in
      if (!exp.type.builtin && !exp.type.isGeneric) {
        var defScope = exp.scope.search('struct', exp.type.name);
        if (!defScope) {
          exp.throw('Unknown type ' + exp.type.name);
        }
        exp.type.def = defScope.structs[exp.type.name];
      }

      // Fin
      return exp.type;

    case ast.NewExpression:
      // This never actually happens.  The syntax tree always has a
      // .type attribute on NewExpression nodes, and the guard at
      // the top of this function won't ever even get here.
      break;

    case ast.LambdaExpression:
      var args = exp.args.map(function(a) { return a[1] });
      for (var i=0; i<args.length; i++) {
        if (args[i] == canned['inferred']) {
          if (exp.inferredTypes[i]) {
            if (exp.inferredTypes[i].isGeneric) {
              exp.throw('Unable to infer type of argument ' + exp.args[i][0]);
            }
            args[i] = exp.inferredTypes[i];
            exp.body.scope.variables[exp.args[i][0]].type = args[i];
          } else {
            // console.log('Unable to infer type for', exp.args[i][0]);
            args[i] = new TypeRef('\'L' + i);
          }
          exp.args[i][1] = args[i];
        }
      }
      if (exp.returnType == canned['void'] && exp.inferredTypes.length == args.length + 1) {
        exp.returnType = exp.inferredTypes[exp.inferredTypes.length - 1];
      }

      args.push(exp.returnType);
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

      if (left == canned['void']) {
        exp.throw('Cannot access property ' + exp.right.name + ' on void');
      }

      // Hunt for a method with the appropriate name
      var method = exp.scope.findMethod(left, exp.right.name)
      if (method) {
        type = make('method', method.args.map(function(a) { return a[1] }).concat([method.returnType]));
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
        exp.throw('Left side of ' + name + '.' + exp.right.name +
          ' is of generic type ' + left.name + '; property access' +
          ' is not allowed.');

      // Handle user types
      } else {
        var defScope = exp.scope.search('struct', left.name);
        if (!defScope) {
          // console.log(exp.constructor.name, exp.scope);
          exp.left.throw('Compiler bug: no struct named "' + left.name + '".  How do we know it\'s a struct?');
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
        exp.right.throw('Type ' + left.toString() + ' has no attribute or method named "' + exp.right.name + '"');

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
          n.throw('Cannot initialize variable to void');

        // Generics can *only* be initialized to default
        if (n.type && n.type.isGeneric && n.expression.constructor != ast.DefaultLiteral)
          n.throw('Variables with a generic type may only be initialized to default');

        // If the declared type and the calculated type don't match, we
        // need to raise an error.  However, we'll also special-case
        // numerics to be interchangable.
        if (n.type && n.type != canned['inferred'] && t != canned['null'] && t != canned['inferred']) {
          if (n.type.numeric && t.numeric) {
            // Do nothing.
          } else if (!equal(n.type, t)) {
            n.throw('Type mismatch: ' + n.type.toString() + ' != ' + (t || 'ERR').toString());
          }
        }

        // If we don't understand how to infer type, bail
        if (!n.type && t == canned['inferred'])
          n.throw('Cannot infer type for ' + n.name);

        // Infer type
        if (!n.type || n.type == canned['inferred'])
          n.type = t;

        // Null isn't valid
        if (n.type == canned['null'])
          n.throw('Null is not a valid type');

        // If the right hand is inferred, update it
        if (t == canned['inferred'])
          n.expression.type = n.type;

        // console.log('Calculated type of', n.name, n.type ? n.type.name : n.type);

        // Ensure there's a def for struct-based variable types
        if (!n.type.builtin && !n.type.isGeneric && !n.type.def) {
          var defScope = n.scope.search('struct', n.type.name);
          if (!defScope) {
            n.throw('No struct named ' + n.type.name);
          }
          n.type.def = defScope.structs[n.type.name];
        }

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
          n.throw('Attempting to assign void');
        }
        if (!equal(l, r) && !(l.numeric && r.numeric)) {
          n.throw('Type mismatch; attempting to assign type ' +
            r.toString() + ' to ' + (n.left.name || n.left.right.name) + ', which is type ' +
            l.toString());
        }
        break;

      // Functions, methods, and lambdas need their args types to be
      // in scope.
      case ast.FunctionStatement:
      case ast.MethodStatement:
      case ast.LambdaExpression:
        for (var i=0; i<n.args.length; i++) {
          var t = n.args[i][1];
          var structDefScope = null;
          if (!t.builtin && !t.isGeneric && !(structDefScope = n.scope.search('struct', t.name))) {
            n.throw('Struct ' + t.name + ' is not defined in this scope');
          }

          if (structDefScope) {
            t.def = structDefScope.structs[t.name];
          }
        }
        break;

      // Return statements need to be checked
      case ast.ReturnStatement:
        if (n.expression)
          n.type = calculate(n.expression);
        else
          n.type = canned['void'];
        break;

      // Skip the regular traversal behavior here, and instead evaluate
      // the type of each expression manually.
      case ast.AssignmentBlock:
        n.declarations.forEach(function(d) {
          var t = calculate(d.expression);
          if (d.type == canned['inferred']) {
            if (t == canned['inferred']) {
              d.expression.throw('Property ' + d.name + ' cannot be initialized to default because no type is declared');
            }
            if (t == canned['null']) {
              d.expression.throw('Property ' + d.name + ' cannot be initialized to null because no type is declared');
            }
            d.type = t;
          } else if (t != canned['inferred'] && t != canned['null'] && !equal(d.type, t)) {
            d.expression.throw('Property ' + d.name + ' is declared as type ' + d.type + ' but is defined as ' + t);
          } else if (t == canned['inferred']) {
            d.expression.type = d.type;
          }

          if (!d.type) {
            throw new Error('Compiler error, node does not have a type somehow');
          }
        });
        break;

      // Ensure that the assignment block for NewExpressions matchesup
      case ast.NewExpression:
        // Builtin types don't have any attributes
        if (n.type.builtin) {
          if (n.args.declarations.length) {
            n.throw('Type ' + n.type + ' has no attribute ' + n.args.declarations[0].name);
          }
          break;
        }

        // Find the struct we're creating
        var defScope = n.scope.search('struct', n.type.name);
        if (!defScope) {
          n.throw('Type ' + n.type.name + ' is undefined');
        }
        var structNode = defScope.structs[n.type.name];
        if (structNode.generics.length != n.type.generics.length) {
          n.throw('Type ' + n.type.name + ' expects ' + structNode.generics.length + ' type parameters, but was passed ' + n.type.generics.length);
        }

        // Fill in the definition for the struct's .type
        n.type.def = structNode;

        // Line up assignment blocks
        var genericMap = {};
        for (var i=0; i<structNode.generics.length; i++) {
          genericMap[structNode.generics[i]] = n.type.generics[i];
        }

        n.args.declarations.forEach(function(d) {
          var typeStruct = null;
          // Hunt for the property
          for (var i=0; i<structNode.body.declarations.length; i++) {
            var decl = structNode.body.declarations[i];

            if (decl.name == d.name) {
              typeStruct = decl.type;
              typeStruct = typeStruct.resolveGenerics(genericMap);
              break;
            }
          }

          if (!typeStruct) {
            n.throw('Type ' + n.type + ' has no property ' + d.name);
          }
          var typeUsed = calculate(d.expression);
          if (!equal(typeUsed, typeStruct)) {
            n.throw('Property ' + d.name + ' of ' + n.type + ' is type ' + typeStruct + ', but is being initialized with ' + typeUsed);
          }
        });
        break;

      // Resolve other types
      case ast.ListAccessExpression:
      case ast.Identifier:
      case ast.FunctionCallExpression:
        calculate(n);
        break;

      // Calculate for all other expression types
      default:
        if (n instanceof ast.Expression) {
          calculate(n);
        }
        break;
    }
  });
};
