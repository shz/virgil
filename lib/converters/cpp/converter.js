var ast = require('../../ast')
  , types = require('../../types')
  , GlobalState = require('./global_state')
  , propertyMap = require('./property_map')
  ;

var convertType = function(t, g, notTopmost) {
  if (!t.builtin) {
    if (t.isGeneric)
      return t.name.substr(1) + (notTopmost ? '' : '*');

    var s = t.name;
    if (t.generics.length) {
      s += '<'
      s += t.generics.map(function(item) {
        return convertType(item, g, true);
      }).join(', ');
      s += '>'
    }
    s += (notTopmost ? '' : '*');
    return s
  }

  if (t == types.canned['int'])
    return 'int';
  if (t == types.canned['float'])
    return 'double';
  if (t == types.canned['bool'])
    return 'bool';
  if (t == types.canned['void'])
    return 'void';

  if (t == types.canned['str']) {
    g.libIncludes['sstream'] = true;
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
    g.libIncludes['vector'] = true;

    return 'std::vector<' + convertType(t.generics[0], g) + '>' + (notTopmost ? '' : '*');
  }

  throw new Error('Unable to convert type ' + t.toString() + ' to C++ equivalent');
};

var binaryExpression = function(thing, node, g) {
  return convert(node.left, g) + ' ' + thing + ' ' + convert(node.right, g);
};

var unaryExpression = function(thing, node, g) {
  return thing + '(' +  convert(node.expression, g) + ')';
};

var makeArgs = function(list, g) {
  return list.map(function(a) {
    return convertType(a[1], g) + ' ' + a[0];
  }).join(', ');
};

var makeFunction = function(node, g, isMethod) {
  var s = '';

  // Regular functions
  if (!node.scope.parent) {
    // Break out the body, and adjust for method usage if
    // needed.
    var body = node.body && new ast.BlockStatement(node.body.body.slice(0));
    if (isMethod && !node.extern) {
      body.body.unshift(new ast.VariableDeclaration(
        node.args[0][0],
        node.args[0][1],
        new ast.Identifier('this'),
        false
      ));
    }

    // Hunt for generics
    var generics = node.type.extractGenerics();
    for (var i=0; i<node.args.length; i++) {
      var temp = node.args[i][1].extractGenerics();
      for (var k in temp) if (temp.hasOwnProperty(k))
        if (!generics.hasOwnProperty(k))
          generics[k] = temp[k];
    }

    // If we have a generic, add the preamble
    var gkeys = Object.keys(generics).map(function(s) { return 'typename ' + s.substr(1) });
    if (gkeys.length) {
      s += 'template <';
      s +=  gkeys.join(', ');
      s += '>\n';
    }

    // Do the rest of the function
    s += convertType(node.type, g) + ' ' + node.name + '(';
    s += makeArgs(isMethod ? node.args.slice(1) : node.args, g);
    s += ')' + (body ? '\n' + convert(body, g) : ';');

  // Nested functions, slightly different
  } else {
    // Hunt for generics
    var generics = node.type.extractGenerics();
    for (var i=0; i<node.args.length; i++) {
      var temp = node.args[i][1].hasGenericReference();
      for (var k in temp) if (temp.hasOwnProperty(k))
        if (!generics.hasOwnProperty(k))
          generics[k] = temp[k];
    }

    // We don't support this yet.  We need to roll our own
    // lambda support, which is a bridge too far right now.
    if (Object.keys(generics).length) {
      throw new Error('Generics are not yet supported in C++ output for nested functions');
    }

    s += 'auto ' + node.name + ' = [&](';
    s += makeArgs(node.args, g);
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
      return ((node.value.toString().indexOf('.') >= 0) ?
        node.value.toString() : node.value + '.0') + 'f';
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
    case ast.NotEqualsExpression:
      return binaryExpression('!=', node, g);
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
      return '((' + convert(node.condition, g) + ') ? (' + convert(node.left, g) + ') : (' + convert(node.right, g) + '))'

    // Simple statements

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
      var s = '';
      if (node.extern)
        s += 'extern ';
      s += convertType(node.type, g) + ' ' + node.name;
      if (!node.extern)
        s += ' = ' + convert(node.expression, g);
      return s;

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
      return convert(node.left, g) + '->at(' + convert(node.right, g) + ')';
    case ast.ListExpression:
      g.libIncludes['vector'] = true;
      return 'new std::vector<' + convertType(node.type.generics[0], g) + '>({' + node.body.map(function(l) { return convert(l, g) }).join(', ') + '})';

    // Functions

    case ast.ReturnStatement:
      return 'return ' + convert(node.expression, g);

    case ast.LambdaExpression:
      var s = '[&]';
      s += '(';
      s += makeArgs(node.args, g)
      s += ')';
      s += ' -> ' + convertType(node.rtype, g) + '\n';
      s += convert(node.body, g);
      return s;

    case ast.FunctionStatement:
      return makeFunction(node, g);

    case ast.FunctionCallExpression:
      var gen = function(left) {
        var s = (left || convert(node.left, g)) + '(';
        s += node.args.map(function(a) { return convert(a, g) }).join(', ');
        s += ')';
        return s;
      };

      // Regular function call
      if (!node.left.type || node.left.type.name == 'func')
        return gen();

      // Methods
      if (node.left.type.name == 'method') {
        var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);

        // Natural
        if (m && m.nat) {
          // Check the property map for specific overrides
          var right = node.left.right.name;
          if (propertyMap[node.left.left.type.name]) { // for type
            if (propertyMap[node.left.left.type.name].methodCall[right]) { // for method
              var p = propertyMap[node.left.left.type.name].methodCall[right];
              if (typeof p == 'string') {
                var left = new ast.PropertyAccessExpression(node.left.left, new ast.Identifier(p));
                return gen(convert(left, g));
               } else if (typeof p == 'function') {
                return p(convert(node.left.left, g), node.args);
              } else {
                throw new Error('Unknown property access mapper type ' + typeof(p));
              }
            }
          }

          return gen();
        }

        // Unnatural
        var s = '';
        s += node.left.right.name + '(';
        s += [node.left.left].concat(node.args).map(function(a) { return convert(a, g)}).join(', ');
        s += ')'
        return s;
      }

      throw new Error('Unknown function call type ' + node.left.type.toString());

    // Modules

    case ast.ImportStatement:
      g.localIncludes[node.module.join('/') + '.cpp'] = true;
      break;
    case ast.ExternStatement:
      return require('./extern_converter')(node, g);

    // Structs

    case ast.StructStatement:
      var s = '';
      if (node.generics.length) {
        s += 'template <' +
             node.generics.map(function(s) { return 'typename ' + s.substr(1) })
             .join(', ') +
             '>\n';
      }
      s += 'class ' + node.name + '\n{\n' + g.indent(function() {
        return 'public:\n' + g.indent(function() {
          var s = '';

          // Attributes
          for (var i=0; i<node.body.declarations.length; i++)
            s += convertType(node.body.declarations[i].type, g) + ' ' + node.body.declarations[i].name + ';\n';

          // Constructor
          s += '\n' + node.name + '()';
          if (!node.extern && node.body.declarations.length) {
            s += ' : ';
            s += node.body.declarations.map(function(d) {
              return d.name + '(' + convert(d.expression, g) + ')';
            }).join(', ');
          }
          if (!node.extern)
            s += '\n{}';
          else
            s += ';';

          // Methods
          if (g.classes[node.name] && Object.keys(g.classes[node.name]).length)
            s += '\n';
          for (var i in g.classes[node.name]) if (g.classes[node.name].hasOwnProperty(i)) {
            if (!node.extern)
              s += '\n';
            s += '\n' + makeFunction(g.classes[node.name][i], g, true);
          }

          return s;
        });
      }) + '\n}';
      return s;

    case ast.NewExpression:
      var creation = 'new ' + node.type.name;
      if (node.type.generics.length) {
        creation += '<' + node.type.generics.join(', ') + '>';
      }
      creation += '()';

      var s = '';
      if (node.args.declarations.length) {
        s += '\n({\n';
        s += g.indent(function() {
          var s = '';
          s += convertType(node.type) + ' temp = ' + creation + ';';
          for (var i=0; i<node.args.declarations.length; i++) {
            var d = node.args.declarations[i];
            s += '\ntemp->' + d.name + ' = ' + convert(d.expression, g) + ';';
          }
          s += '\ntemp;'
          return s;
        });
        s += '\n})';
      } else {
        s = creation;
      }
      return s;

    case ast.PropertyAccessExpression:
      // Most types use pointer access, but some don't
      var op = '->';
      if (node.left.type) // Safety check against bugs...
      if (['func', 'str'].indexOf(node.left.type.name) >= 0)
        op = '.';

      // Go ahead and convert the left side
      var left = convert(node.left, g);

      // Check the property map for specific overrides
      var right = node.right.name;
      if (propertyMap[node.left.type.name]) { // for type
        if (propertyMap[node.left.type.name].propertyAccess[right]) { // for property
          var p = propertyMap[node.left.type.name].propertyAccess[right];
          if (typeof p == 'string')
            return left + op + p;
          else if (typeof p == 'function')
            return p(left);
          else
            throw new Error('Unknown property access mapper type ' + typeof(p));
        }
      }

      return left + op + right;

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

  if (Object.keys(g.localIncludes).length)
    parts.unshift('');
  Object.keys(g.localIncludes).forEach(function(i) {
    parts.unshift('#include "' + i + '"');
  });

  if (Object.keys(g.libIncludes).length)
    parts.unshift('');
  Object.keys(g.libIncludes).forEach(function(i) {
    parts.unshift('#include <' + i + '>');
  });

  var cpp = parts.map(function(p) {
    if (p.match(/^\s*#/)) {
      return p;
    } else if (p.match(/^\s*$/)) {
      return '';
    } else {
      var lines = p.split(/\r?\n/g);
      var ret = p + (lines[lines.length - 1].match(/^\s*$/) ? '' : ';');
      if (lines[lines.length - 1].match(/^\s*}/))
        ret += '\n';
      return ret;
    }
  }).join('\n') + '\n';

  if (node instanceof ast.Module) {
    // Include guard
    var guard = '_VGL_GEN_' + node.path.toUpperCase().replace(/\W+/g, '_');
    cpp = '#ifndef ' + guard + '\n#define ' + guard + '\n\n' + cpp + '\n\n#endif';

    var ret = {};
    ret[node.path.replace(/\.vgl$/, '.cpp')] = cpp;
    return ret;
  } else {
    return cpp;
  }
};

module.exports.convert = convert;
module.exports.convertType = convertType;
module.exports.makeArgs = makeArgs;
