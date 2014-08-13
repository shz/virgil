var ast = require('../ast')
  , types = require('../types')
  ;

var GlobalState = function() {
  this.libIncludes = {};
  this.localIncludes = {};
};

var binaryExpression = function(thing, node, g) {
  return convert(node.left, g) + ' ' + thing + ' ' + convert(node.right, g);
};

var convert = function(node, g) {
  if (!node)
    return null;

  switch (node.constructor.name) {

    // Literals

    case 'TrueLiteral':
      return 'true';
    case 'FalseLiteral':
      return 'false';
    case 'NullLiteral':
      return '0';
    case 'IntegerLiteral':
      return node.value.toString();
    case 'FloatLiteral':
      return node.value.toString() + 'f';
    case 'StringLiteral':
      return '"' + node.value.replace(/\r/g, '\\r')
                             .replace(/\n/g, '\\n')
                             .replace(/\t/g, '\\t')
                             .replace(/"/g, '\\"') + '"';

    // Expressions

    case 'EqualsExpression':
      return binaryExpression('==', node, g);
    case 'LogicalOrExpression':
      return binaryExpression('||', node, g);
    case 'MultiplicationExpression':
      return binaryExpression('*', node, g);
    case 'AdditionExpression':
      return binaryExpression('+', node, g);
    case 'SubtractionExpression':
      return binaryExpression('-', node, g);
    case 'DivisionExpression':
      return binaryExpression('/', node, g);
    case 'ModExpression':
      return binaryExpression('%', node, g);
    case 'GreaterThanExpression':
      return binaryExpression('>', node, g);
    case 'LessThanExpression':
      return binaryExpression('<', node, g);
    case 'PowerExpression':
      g.libIncludes['math.h'] = true;
      return 'pow(' + convert(node.left, g) + ', ' + convert(node.right, g) + ')';
    case 'TernaryExpression':
      return '(' + convert(node.condition, g) + ') ? (' + convert(node.left, g) + ') : (' + convert(node.right, g) + ')'

    // Simple statements

    case 'ExternStatement':
      break;
    case 'BreakStatement':
      return 'break;'
    case 'ContinueStatement':
      return 'continue';
    case 'ReturnStatement':
      return 'return ' + convert(node.expression, g) + ';';

    // Variables and such

    case 'Identifier':
      return node.name;
    case 'VariableDeclaration':
    case 'OutVariableDeclaration':
    case 'MutableVariableDeclaration':
      return node.type.toString() + ' ' + node.name + ' = ' + convert(node.expression, g);

    // Control flow

    case 'IfStatement':
      var s = 'if (' + convert(node.condition, g) + ') ' + convert(node.left, g);
      if (node.right) {
        s += ' else ' + convert(node.right, g);
      }
      return s;
    case 'WhileStatement':
      return 'while (' + convert(node.condition, g) + ') ' + convert(node.body, g);

    // Everything else

    case 'BlockStatement':
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
