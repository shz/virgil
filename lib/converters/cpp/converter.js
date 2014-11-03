var path = require('path')
  , ast = require('../../ast')
  , types = require('../../types')
  , GlobalState = require('./global_state')
  , propertyMapping = require('../common/property_mapping')
  , convertType = require('./convert_type')
  , util = require('./util')
  , makeReference = require('./util').makeReference
  ;

var binaryExpression = function(thing, node, g) {
  return '(' + convert(node.left, g) + ' ' + thing + ' ' + convert(node.right, g) + ')';
};

var unaryExpression = function(thing, node, g) {
  return thing + '(' +  convert(node.expression, g) + ')';
};

var makeArgs = function(list, g) {
  return list.map(function(a) {
    return convertType(a[1], 'ref', g) + ' ' + a[0];
  }).join(', ');
};

var makeFunction = function(node, g, isMethod) {
  var s = '';

  // Regular functions
  if (!node.scope.parent) {
    // Break out the body, and adjust for method usage if needed.  This
    // is kind of an ugly hack to get the C++ output we want...

    var body = node.body && new ast.BlockStatement(node.body.body.slice(0));
    if (isMethod && !node.extern) {
      body.body.unshift(new ast.Identifier(
        convertType(node.args[0][1], 'ref', g) + ' ' + node.args[0][0] + ' = this'
      ));
    }

    // Hunt for generics
    var generics = node.returnType.extractGenerics(); // For return type
    for (var i=0; i<node.args.length; i++) { // For args
      var temp = node.args[i][1].extractGenerics();
      for (var k in temp) if (temp.hasOwnProperty(k))
        if (!generics.hasOwnProperty(k))
          generics[k] = temp[k];
    }

    // For natural methods, remove generics that are defined in the
    // owner class.
    if (isMethod && node.nat) {
      node.args[0][1].generics.forEach(function(g) {
        delete generics[g];
      });
    }

    // If we have a generic, add the preamble
    var gkeys = Object.keys(generics).map(function(s) { return 'typename ' + s.substr(1) });
    if (gkeys.length) {
      s += 'template <';
      s +=  gkeys.join(', ');
      s += '>\n';
    }

    // Do the rest of the function
    // if (node.name == 'interpolate') // BUG HERE
    //   console.log(node.returnType);
    s += convertType(node.returnType, 'heap', g) + ' ' + node.name + '(';
    s += makeArgs(isMethod ? node.args.slice(1) : node.args, g);
    s += ')' + (body ? '\n' + convert(body, g) : ';');

  // Nested functions, slightly different
  } else {
    // Hunt for generics
    var generics = node.returnType.extractGenerics();
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

    s += 'auto ' + node.name + ' = [=](';
    s += makeArgs(node.args, g);
    s += ') -> ';
    s += convertType(node.returnType, 'heap', g);
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

var convert = propertyMapping.use(require('./cpp_map'), function(node, g) {
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
      return '(' + binaryExpression('%', node, g) + ')';
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
    case ast.LogicalAndExpression:
      return binaryExpression('&&', node, g);
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
      if (node.def)
        return makeReference(node.def);
      return node.name;
    case ast.VariableDeclaration:
    case ast.OutVariableDeclaration:
    case ast.MutableVariableDeclaration:
      var s = '';
      if (node.extern)
        s += 'extern ';
      s += convertType(node.type, 'heap', g) + ' ' + node.name;
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
      return 'while (' + convert(node.expression, g) + ') ' + convert(node.body, g);
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
      var op = '->';
      // if (node.left.constructor == ast.Identifier && node.left.def && node.left.def.isArgument)
      //   op = '.';
      return convert(node.left, g) + op + 'at(' + convert(node.right, g) + ')';
    case ast.ListExpression:
      g.libIncludes['vector'] = true;
      var t = convertType(node.type, 'create_heap', g);
      return util.expressionize((function() {
        var s = '';
        s += 'auto t = ' + convertType(node.type, 'create_heap', g) + '(' + node.body.length + ');';
        node.body.forEach(function(l) {
          s += ' t.push_back(' + convert(l, g) + ');';
        });
        return s;
      })(), 't').replace(/\n/g, ' ');
        // '(std::initializer_list<' + convertType(node.type.generics[0], 'heap', g) + '>' + // type
        // '{' + node.body.map(function(l) { return convert(l, g) }).join(', ') + '})'; // body

    // Functions

    case ast.ReturnStatement:
      if (node.expression)
        return 'return ' + convert(node.expression, g);
      return 'return';

    case ast.LambdaExpression:
      var s = '[=]';
      s += '(';
      s += makeArgs(node.args, g)
      s += ')';
      s += ' -> ' + convertType(node.returnType, 'heap', g) + '\n';
      s += convert(node.body, g);
      return s;

    case ast.FunctionStatement:
      return makeFunction(node, g);

    case ast.FunctionCallExpression:
      var gen = function(left) {
        var s = (left || convert(node.left, g));
        if (generics && generics.length) {
          s += '<';
          s += generics.map(function(t) {
            // console.log(t);

            if (t)
              return convertType(t, 'ref', g);
            else
              return 'void';
          }).join(', ');
          s += '>';
        }
        s += '(';
        s += node.args.map(function(a) {
          var s = convert(a, g);
          // if (!util.isValueType(a.type) && !(a.constructor == ast.Identifier && a.def && a.def.isArgument))
          //   s = '*(' + s + ')';
          return s;
        }).join(', ');
        s += ')';
        return s;
      };
      var generics = null;

      // We need to include the resolved generics in the function's call
      var t = node.left.type;
      if (t.original)
        t = t.original;
      if (t.hasGenericReference()) {
        // Create an identical type signature for the call
        var concrete = new types.TypeRef(t.name, node.args.map(function(a) {
          return a.type;
        }).concat([t.generics[t.generics.length - 1]]));
        if (concrete.name == 'method')
          concrete.generics.unshift(node.left.left.type);

        // Attempt to resolve against it
        var resolution = types.generics.resolve(t, concrete);

        // Extract generics, and map if we can
        var failed = false;
        generics = Object.keys(t.extractGenerics()).map(function(k) {
          if (resolution[k]) {
            return resolution[k];
          }
          failed = true;
          return null;
        });

        // If any failed to map, kill it
        if (failed)
          generics = null;
      }

      // Ignore all generics refs for lambdas, as they're already
      // baked in.
      if (node.left.constructor == ast.PropertyAccessExpression && node.left.type.name == 'func')
        generics = null;

      // Regular function call
      if (!node.left.type || node.left.type.name == 'func') {
        return gen();
      }

      // Methods
      if (node.left.type.name == 'method') {
        var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);

        // Natural
        if (m && m.nat) {
          generics = null; // Just kill generics, it'll interfere with methods
          return gen();
        }

        // Unnatural
        var s = '';
        s += node.left.right.name;
        if (generics && generics.length) {
          s += '<';
          s += generics.map(function(t) {
            // console.log(t);

            if (t)
              return convertType(t, 'ref', g);
            else
              return 'void';
          }).join(', ');
          s += '>';
        }
        s += '(';
        s += [node.left.left].concat(node.args).map(function(a) {
          var s = convert(a, g);
          // if (!util.isValueType(a.type) && !a.isArgument)
          //   s = '*(' + s + ')';
          return s;
        }).join(', ');
        s += ')'
        return s;
      }

      throw new Error('Unknown function call type ' + node.left.type.toString());

    // Modules

    case ast.ImportStatement:
      g.localIncludes[node.module.join('/') + '.cpp'] = true;
      break;
    case ast.ExternStatement:
      break;
      // return require('./extern_converter')(node, g);

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
            s += convertType(node.body.declarations[i].type, 'heap', g) + ' ' + node.body.declarations[i].name + ';\n';

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
      var creation = convertType(node.type, 'create_heap', g) + '()';

      var s = '';
      if (node.args.declarations.length) {
        s += g.indent(function() {
          var s = '';
          s += convertType(node.type, 'heap', g) + ' temp = ' + creation + ';';
          for (var i=0; i<node.args.declarations.length; i++) {
            var d = node.args.declarations[i];
            s += 'temp->' + d.name + ' = ' + convert(d.expression, g) + ';';
          }
          return util.expressionize(s, 'temp');
        }).replace(/^\s*/, '').replace(/\s+}\(\)$/, '\n}()');
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
      // if (node.left.constructor == ast.Identifier && node.left.def && node.left.def.isArgument)
      //   op = '.';

      return convert(node.left, g) + op + node.right.name;

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
});

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
    // Figure out natural methods
    g.methodRollup(node);

    // Add a relative include to the virgil runtime
    g.localIncludes[
      node.path.replace(/[^\/\\]+[\/\\]/, '..' + path.sep)
               .replace(/[^\/\\]+\.vgl$/, 'runtime' + path.sep + 'virgil.cpp')
    ] = true;

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
module.exports.makeArgs = makeArgs;
