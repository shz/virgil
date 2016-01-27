var ast = require('../../lib/ast')
  , parser = require('../../lib/parser')
  ;

var indent = function(s) {
  return s.split(/\r?\n/).map(function(x) { if (x) return '  ' + x; else return x; }).join('\n');
};

var pretty = function(node) {
  if (node instanceof ast.Node) {
    var s = node.constructor.name + ' {\n';
    Object.keys(node).forEach(function(key) {
      if (key === 'loc') {
        return;
      }

      s += indent(key + ': ' + pretty(node[key]) + '\n');
    });
    s += '}';
    return s;
  } else {
    return '' + node;
  }
};

var check = function(a, b) {
  var sa = parser.snippet(a)[0];
  var sb = parser.snippet(b)[0];
  if (!sa.deepEqual(sb)) {
    var message = 'ASTs don\'t match\n\n';
    message += pretty(sa);
    message += '\n\n!==\n\n';
    message += pretty(sb);
    throw new Error(message);
  }
};

test('integration', 'precedence', function() {
  check('1 + 2 * 3', '1 + (2 * 3)');
  check('1 + 2 - 3', '(1 + 2) - 3');
  check('1 - 2 + 3', '(1 - 2) + 3');
  check('true || false && true', '(true || false) && true');
  check('true && false || true', 'true && (false || true)');
  check('1 + 1 <= 3', '(1 + 1) <= 3');
  check('1 + 1 <= 3 || 1 + 1 >= 3', '((1 + 1) <= 3) || ((1 + 1) >= 3)');
  check('true ? 1 + 1 : 2 + 2', '(true) ? (1 + 1) : (2 + 2)');
  check('42 + true ? 1 : 3', '42 + (true ? 1 : 3)');
  check('return 20f + (1f < 2f) ? 1f : 2f', 'return (20f + ((1f < 2f) ? 1f : 2f))');
});
