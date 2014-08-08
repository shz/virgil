var syntax = require('./ast')
  ;

var TypeRef = exports.TypeRef = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
  this.builtin = type[0].toUpperCase() != type[0];
  this.numeric = type == 'int' ||
                 type == 'float';
};
TypeRef.prototype.toString = function() {
  var output = this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};

var canned = exports.canned = {
  'inferred': new TypeRef('inferred'),
  'bool': new TypeRef('bool'),
  'int': new TypeRef('int'),
  'str': new TypeRef('str'),
  'float': new TypeRef('float'),
  'null': new TypeRef('null'),
  'void': new TypeRef('void')
};

var make = exports.make = function(base, generics) {
  generics = generics || [];

  if (generics.length == 0 && canned.hasOwnProperty(base))
    return canned[base];

  return new TypeRef(base, generics);
};

var equal = exports.equal = function(t1, t2) {
  if (t1 == t2)
    return true;
  if (t1.name != t2.name)
    return false;
  if (t1.generics.length != t2.generics.length)
    return false;

  for (var i=0; i<t1.generics.length; i++)
    if (!equal(t1.generics[i], t2.generics[i]))
      return false;

  return true;
};

var calculate = exports.calculate = function(exp) {
  if (!exp)
    throw new Error('Null expression');
  if (!(exp instanceof syntax.Expression))
    throw new Error(exp.constructor.name + ' is not an expression; its type cannot be calculated');
  var c = exp.constructor;

  switch (c) {

    // Literals
    case syntax.TrueLiteral:
    case syntax.FalseLiteral:
      return canned['bool'];
    case syntax.StringLiteral:
      return canned['str'];
    case syntax.IntegerLiteral:
      return canned['int'];
    case syntax.FloatLiteral:
      return canned['float'];
    case syntax.NullLiteral:
      return canned['null'];

    // Logic always gives bools
    case syntax.EqualsExpression:
    case syntax.GreaterThanExpression:
    case syntax.LessThanExpression:
      return canned['bool'];

    // List access sends back the list's type
    case syntax.ListAccessExpression:
      var indexer = calculate(exp.right);
      if (indexer != canned['int'])
        throw new Error('List indexer must be an int; instead it\'s ' + indexer.toString());
      return calculate(exp.left).generics[0];

    // Arithmetic
    case syntax.AdditionExpression:
      if (calculate(exp.left) == canned['str'] && calculate(exp.right) == canned['str'])
        return canned['str'];
      // FALL THROUGH
    case syntax.MultiplicationExpression:
    case syntax.SubtractionExpression:
    case syntax.DivisionExpression:
    case syntax.PowerExpression:
    case syntax.ModExpression:
      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if ((left != canned['float'] && left != canned['int']) ||
      (right != canned['float'] && right != canned['int']))
        throw new Error('Arithmetic may only be performed on numeric types');

      if (left == canned['float'] || right == canned['float'])
        return canned['float'];
      if (left == right)
        return left;

      break;

    // Ternary expression just delegates
    case syntax.TernaryExpression:
      var cond = calculate(exp.condition);
      if (cond != canned['bool'])
        throw new Error('Ternary conditions must evaluate to a bool');

      var left = calculate(exp.left);
      var right = calculate(exp.right);

      if (left != right) {
        throw new Error('Both possible results from a terminal expression must ' +
          'resolve to the same type');
      }
      return left;

    // List expression
    case syntax.ListExpression:
      var type = null;
      for (var i=0; i<exp.body.length; i++) {
        var t2 = calculate(exp.body[i]);
        if (!type)
          type = t2;
        else if (!equal(type, t2))
          throw new Error('Inconsistent types in a list expression; contains both ' + type.toString() + ' and ' + t2.toString());
      }

      return new TypeRef('list', [type]);

    // Identifiers search scope, if possible
    case syntax.Identifier:
      if (!exp.scope)
        return canned['inferred'];

      var defScope = exp.scope.search(exp.name);
      if (!defScope)
        throw new Error('Reference to unknown "' + exp.name + '"');

      var n;
      if ((n = defScope.variables[exp.name])) {
        if (!n.type || n.type == canned['inferred'])
          throw new Error('Type is not yet defined for variable "' + n.name + '"');
        return n.type;

      } else if ((n = defScope.functions[exp.name])) {
        return make('func', n.args.map(function(a) { return a[1] }).concat([n.type]));

      } else if ((n = defScope.methods[exp.name])) {
        return make('method', n.args.map(function(a) { return a[1] }).concat([n.type]));

      } else if ((n = defScope.structs[exp.name])) {
        return make(exp.name);

      } else {
        throw new Error('Egad, parser bug in the type calculation engine!  Guru meditation: 0xDEADBEEF');
      }

    // Functions are easy, they just return declared type
    case syntax.FunctionCallExpression:
      if (!exp.scope)
        return canned['inferred'];

      var t = calculate(exp.left);
      if (t.name == 'func' || t.name == 'method')
        return t.generics[t.generics.length - 1];
      else if (!t.builtin)
        return t;

      throw new Error('Parser bug: unable to determine type for callable expression ' + exp.left.constructor.name);

    // Property access is a bitch
    case syntax.PropertyAccessExpression:
      // Find out what we are on the left
      var left = calculate(exp.left);

      // Figure out if we're accessing an attribute or a method
      return canned['inferred']; // TODO

  }

  // throw new Error('Can\'t infer type from ' + exp.constructor.name);
  return canned['inferred'];
};

var realize = exports.realize = function(root) {
  syntax.traverse(root, function(n) {
    switch (n.constructor) {
      // Resolve variable types
      case syntax.VariableDeclaration:
      case syntax.MutableVariableDeclaration:
      case syntax.OutVariableDeclaration:
        var t = calculate(n.expression);

        // Cannot assign void to a variable
        if (t == canned['void'])
          throw new Error('Cannot initialize variable to void');

        // If the declared type and the calculated type don't match, we
        // need to raise an error.  However, we'll also special-case
        // numerics to be interchangable.
        if (n.type && n.type != canned['inferred'] && t != canned['null']) {
          if (n.type.numeric && t.numeric) {
            // Do nothing.
          } else {
            throw new Error('Type mismatch: ' + n.type.toString() + ' != ' + (t || 'ERR').toString());
          }
        }
        if (!n.type && t == canned['inferred'])
          throw new Error('Cannot infer type for ' + n.name);

        if (!n.type || n.type == canned['inferred'])
          n.type = t;

        if (n.type == canned['null'])
          throw new Error('Null is not a valid type');

        return false;
    }
  });
};
