var ast = require('../ast')
  , types = require('../types')
  ;

var GlobalState = function() {
  this.libIncludes = {};
  this.localIncludes = {};
};

var binaryExpression = function(thing, node, g) {
  return '(' + convert(node.left, g) + ' ' + thing + ' ' + convert(node.right, g) + ')';
};

var unaryExpression = function(thing, node, g) {
  return thing + '(' + convert(node.expression, g) + ')';
};

var convert = function(node, g) {
  if (!node)
    return null;

  switch (node.constructor) {

    // Literals

    case ast.TrueLiteral:
      return 'true';
    case ast.FalseLiteral:
      return 'false';
    case ast.NullLiteral:
      return '0';
    case ast.IntegerLiteral:
      return node.value.toString();
    case ast.FloatLiteral:
      return node.value.toString() + 'f';
    case ast.StringLiteral:
      return '"' + node.value.replace(/\r/g, '\\r')
                             .replace(/\n/g, '\\n')
                             .replace(/\t/g, '\\t')
                             .replace(/"/g, '\\"') + '"';

    // Arithmetic expressions

    case ast.NegationExpression:
      return unaryExpression('-', node, g);
    case ast.MultiplicationExpression:
      return binaryExpression('*', node, g);
    case ast.AdditionExpression:
      return binaryExpression('+', node, g);
    case ast.SubtractionExpression:
      return binaryExpression('-', node, g);
    case ast.DivisionExpression:
      return binaryExpression('/', node, g);
    case ast.ModExpression:
      return binaryExpression('%', node, g);
    case ast.PowerExpression:
      g.libIncludes['math.h'] = true;
      return 'pow(' + convert(node.left, g) + ', ' + convert(node.right, g) + ')';

    // Logical expressions

    case ast.NotExpression:
      return unaryExpression('!', node, g);
    case ast.EqualsExpression:
      return binaryExpression('==', node, g);
    case ast.LogicalOrExpression:
      return binaryExpression('||', node, g);
    case ast.GreaterThanExpression:
      return binaryExpression('>', node, g);
    case ast.LessThanExpression:
      return binaryExpression('<', node, g);
    case ast.GreaterThanEqualExpression:
      return binaryExpression('>=', node, g);
    case ast.LessThanEqualExpression:
      return binaryExpression('<=', node, g);
    case ast.TernaryExpression:
      return '(' + convert(node.condition, g) + ') ? (' + convert(node.left, g) + ') : (' + convert(node.right, g) + ')'

    // Simple statements

    case ast.ExternStatement:
      break;
    case ast.BreakStatement:
      return 'break;'
    case ast.ContinueStatement:
      return 'continue';
    case ast.ReturnStatement:
      return 'return ' + convert(node.expression, g) + ';';

    // Variables and such

    case ast.Identifier:
      return node.name;
    case ast.VariableDeclaration:
    case ast.OutVariableDeclaration:
    case ast.MutableVariableDeclaration:
      return node.type.toString() + ' ' + node.name + ' = ' + convert(node.expression, g);

    // Control flow

    case ast.IfStatement:
      var s = 'if (' + convert(node.condition, g) + ') ' + convert(node.left, g);
      if (node.right) {
        s += ' else ' + convert(node.right, g);
      }
      return s;
    case ast.WhileStatement:
      return 'while (' + convert(node.condition, g) + ') ' + convert(node.body, g);
    case ast.BreakStatement:
      return 'break;';
    case ast.ContinueStatement:
      return 'continue;';

    // Lists

    case ast.ListAccessExpression:
      return '(' + convert(node.left, g) + ')[' + convert(node.right, g) + ']';
    case ast.ListExpression:
      throw new Error('TODO - ListExpression');

    // Modules

    case ast.ImportStatement:
      g.localIncludes.push(node.module.join('/') + '.h');
      break;
    case ast.ExternStatement:
      break;

    // Structs

    case ast.StructStatement:
      throw new Error('TODO - StructStatement');

    case ast.NewExpression:
      return 'new ' + node.type.toString() + '(/*TODO - args*/)';

    // Everything else

    case ast.BlockStatement:
      return '{' + node.body.map(function(n) { return convert(n, g) })
                            .map(function(s) { return '\n  ' + s }) + '\n}';

    default:
      throw new Error('Don\'t know how to convert ' + node.constructor.name + ' to C++');
  }
};

module.exports = function(node, options) {
  var parts = [];
  var g = new GlobalState();

  if (node instanceof Array) {
    node.forEach(function(node) {
      var n = convert(node, g);
      if (n)
        parts.push(n);
    });
  } else if (node instanceof ast.Module) {
    parts.push('using namespace ' + n.name + ' {');

    for (var i=0; i<node.body.length; i++) {
      var n = convert(node.body[i], g);
      if (n)
        parts.push(n);
    }

    parts.push('}');
  }

  Object.keys(g.libIncludes).forEach(function(i) {
    parts.unshift('#include <' + i + '>');
  });
  Object.keys(g.localIncludes).forEach(function(i) {
    parts.unshift('#include "' + i + '"');
  });

  return parts.join('\n');
};
