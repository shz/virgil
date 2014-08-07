var syntax = require('./ast')
  ;

var TypeRef = exports.TypeRef = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
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
  'null': new TypeRef('null')
};
exports.INFERRED = canned['inferred'];

var calculate = function(exp) {
  if (!exp)
    throw new Error('Null expression');
  if (!(exp instanceof syntax.Expression))
    throw new Error(exp.constructor.name + ' is not an expression; it has no type');
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
      var indexer = calculate(exp.right).toString();
      // if (indexer != canned['int'].toString())
      //   throw new Error('List indexer must be an int; instead it\'s ' + indexer);
      return calculate(exp.left);

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
        else if (type.toString() != t2.toString())
          throw new Error('Inconsistent types in a list expression; contains both ' + type.toString() + ' and ' + t2.toString());
      }

      return new TypeRef('list', [type]);

    // The TODOs
    case syntax.Identifier:
    case syntax.FunctionCallExpression:
      return canned['inferred'];
  }

  // throw new Error('Can\'t infer type from ' + exp.constructor.name);
  return canned['inferred'];
};

exports.calculate = calculate;
