var ast = require('../../ast')
  , types = require('../../types')
  , GlobalState = require('./global_state')
  ;



var convertType = function(t, g) {
  if (!t.builtin)
    return t.toString() + '*';

  if (t == types.canned['int'])
    return 'int';
  if (t == types.canned['float'])
    return 'double';
  if (t == types.canned['bool'])
    return 'bool';
  if (t == types.canned['void'])
    return 'void';

  if (t == types.canned['str']) {
    g.libIncludes['string'] = true;

    return 'std::string';
  }

  if (t.name == 'func') {
    g.libIncludes['functional'] = true;

    var s = 'std::function<' + convertType(t.generics[t.generics.length - 1], g) + '(';
    s += t.generics.slice(0, t.generics.length - 1).map(function(t) {
      return convertType(t, g);
    }).join(', ');
    s += ')>';
    return s;
  }

  if (t.name == 'list') {
    g.libIncludes['list'] = true;

    return 'std::list<' + convertType(t.generics[0]) + '>';
  }

  throw new Error('Unable to convert type ' + t.toString() + ' to C++ equivalent');
};

var binaryExpression = function(thing, node, g) {
  return '(' + convert(node.left, g) + ' ' + thing + ' ' + convert(node.right, g) + ')';
};

var unaryExpression = function(thing, node, g) {
  return thing + '(' + convert(node.expression, g) + ')';
};

var makeFunction = function(node, g) {
  var s = '';

  // Regular functions
  if (!node.scope.parent) {
    s = convertType(node.type, g) + ' ' + node.name + '(';
    s += node.args.map(function(a) {
      return convertType(a[1], g) + ' ' + a[0];
    }).join(', ');
    s += ')\n' + convert(node.body, g);

  // Nested functions, slightly different
  } else {
    s = 'auto ' + node.name + ' = [&](';
    s += node.args.map(function(a) {
      return convertType(a[1], g) + ' ' + a[0];
    }).join(', ');
    s += ') -> ';
    s += convertType(node.type, g);
    s += '\n';
    s += convert(node.body, g);
  }

  return s;
};

var findIndexOf = function(arr, f) {
  for (var i=0; i<arr.length; i++)
    if (f(arr))
      return i;

  return -1;
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
      return 'nullptr';
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

    // Variables and such

    case ast.Identifier:
      return node.name;
    case ast.VariableDeclaration:
    case ast.OutVariableDeclaration:
    case ast.MutableVariableDeclaration:
      return convertType(node.type, g) + ' ' + node.name + ' = ' + convert(node.expression, g);

    case ast.AssignmentStatement:
      return convert(node.left, g) + ' = ' + convert(node.right, g);

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
      return 'break';
    case ast.ContinueStatement:
      return 'continue';

    case ast.ForStatement:
      var s = '';
      s += 'for (';
      s += 'int ' + node.declaration.name + ' = ' + convert(node.declaration.expression, g);
      s += '; ' + node.declaration.name + (node.up ? ' < ' : ' > ') + convert(node.end, g);
      s += '; ' + node.declaration.name + (node.up ? '++' : '--');
      s += ') ';
      s += convert(node.body, g);
      return s;

    // Lists

    case ast.ListAccessExpression:
      return convert(node.left, g) + '[' + convert(node.right, g) + ']';
    case ast.ListExpression:
      return '{' + node.body.map(function(l) { return convert(l, g) }).join(', ') + '}';

    // Functions

    case ast.ReturnStatement:
      return 'return ' + convert(node.expression, g);

    case ast.LambdaExpression:
      var s = '[&]() -> ' + convertType(node.rtype, g) + '\n';
      s += convert(node.body, g);
      return s;

    case ast.FunctionStatement:
      return makeFunction(node, g);

    case ast.FunctionCallExpression:
      var s = convert(node.left, g) + '(';
      s += node.args.map(function(a) { return convert(a, g) }).join(', ');
      s += ')';
      return s;

    // Modules

    case ast.ImportStatement:
      g.localIncludes[node.module.join('/') + '.h'] = true;
      break;
    case ast.ExternStatement:
      break;

    // Structs

    case ast.StructStatement:
      var s = 'class ' + node.name + '\n{\n' + g.indent(function() {
        return 'public:\n' + g.indent(function() {
          var s = '';

          // Attributes
          for (var i=0; i<node.body.declarations.length; i++)
            s += convertType(node.body.declarations[i].type, g) + ' ' + node.body.declarations[i].name + ';\n';

          // Constructor
          s += '\n' + node.name + '()';
          if (node.body.declarations.length) {
            s += ' : ';
            s += node.body.declarations.map(function(d) {
              return d.name + '(' + convert(d.expression, g) + ')';
            }).join(', ');
          }
          s += '\n{}';

          // Methods
          for (var i in g.classes[node.name]) if (g.classes[node.name].hasOwnProperty(i)) {
            s += '\n\n' + makeFunction(g.classes[node.name][i], g);
          }

          return s;
        });
      }) + '\n}';
      return s;

    case ast.NewExpression:
      var s = '';
      if (node.args.declarations.length) {
        s += '\n({\n';
        s += g.indent(function() {
          var s = '';
          s += node.type.name + ' *temp = new ' + node.type.name + '();';
          for (var i=0; i<node.args.declarations.length; i++) {
            var d = node.args.declarations[i];
            s += '\ntemp->' + d.name + ' = ' + convert(d.expression, g) + ';';
          }
          s += '\ntemp;'
          return s;
        });
        s += '\n})';
      } else {
        s = 'new ' + node.type.name + '()';
      }
      return s;

    case ast.PropertyAccessExpression:
      return convert(node.left, g) + '->' + convert(node.right, g);

    case ast.MethodStatement:
      // Natural methods are collected up and dropped into
      // the class definition, which is handled at struct
      // declaration time.
      if (node.nat)
        return;

      // Unnatural methods simply become functions
      return makeFunction(node, g);

    // Everything else

    case ast.BlockStatement:
      return '{\n' + g.indent(function() {
        return node.body.map(function(n) { return convert(n, g) + ';' }).join('\n');
      }) + '\n}';

    case ast.DefaultLiteral:
      return convert((types.builtin[node.type.name] || {}).default || new ast.NullLiteral());

    default:
      throw new Error('Don\'t know how to convert ' + node.constructor.name + ' to C++');
  }
};

module.exports = function(node, options) {
  var parts = [];
  var g = new GlobalState();

  if (node instanceof Array) {
    node.forEach(function(node) {
      g.methodRollup(node);
    });

    node.forEach(function(node) {
      var n = convert(node, g);
      if (n)
        parts.push(n);
    });
  } else if (node instanceof ast.Module) {
    g.methodRollup(node);
    // parts.push('using namespace ' + n.name + ' {');

    for (var i=0; i<node.body.length; i++) {
      var n = convert(node.body[i], g);
      if (n)
        parts.push(n);
    }

    // parts.push('}');
  }

  Object.keys(g.libIncludes).forEach(function(i) {
    parts.unshift('#include <' + i + '>');
  });
  Object.keys(g.localIncludes).forEach(function(i) {
    parts.unshift('#include "' + i + '"');
  });

  var cpp = parts.map(function(p) {
    if (p.match(/^\s*#/)) {
      return p;
    } else if (p.match(/^\s*$/)) {
      return '';
    } else {
      return p + ';';
    }
  }).join('\n') + '\n';

  if (node instanceof ast.Module) {
    var ret = {};
    ret[node.path.replace(/\.vgl$/, '.cpp')] = cpp;
    return ret;
  } else {
    return cpp;
  }
};
