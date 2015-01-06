var types = require('./util/require')('types')
  , scope = require('./util/require')('scope')
  , parser = require('./util/require')('parser')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

exports.testBlockNewlines = function(test, assert) {
  // Just make sure these work
  parse('function foo { let a = 1; let b = 2 }');
  parse('new Foo { a = 1 }');
  parse('function foo { new Foo }');
  parse('struct Foo { }; function foo { new Foo { a = 1 } }');
  parse('function foo (a : int) {}');
  parse('function foo(a : int) { new Foo { a = a }; }');

  test.finish();
};
