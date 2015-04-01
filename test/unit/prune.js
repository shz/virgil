var prune = require('../../lib/passes/prune')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  , ast = require('../../lib/ast')
  , World = require('../../lib/world')
  ;

var buildModules = function(snippets) {
  var modules = {};
  Object.keys(snippets).forEach(function(name) {
    var src = snippets[name];
    modules[name] = new ast.Module(parser.snippet(src), name + ".vgl");
  });
  Object.keys(modules).forEach(function(name) {
    var module = modules[name];
    module.body.forEach(function (node) {
      if(node instanceof ast.ImportStatement) {
        node.ast = modules[node.module[0]];
      }
    });
  });
  var world = new World({
    baseDir: 'doom',
    mainModule: 'gloom'
  });
  world.modules = modules;
  passes.runAll(world, {});

  return world;
};

test('unit', 'pruning', 'input checking', function() {
  var modules = buildModules({
    "main": "function foo { let a = 1 }"
  }).modules;

  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});

  assert.throws(function() {
    prune(null, {rootModule: modules.main, entryPoints: ['foo']});
  });
  assert.throws(function() {
    prune(modules, {entryPoints: ['foo']});
  });
  assert.throws(function() {
    prune(modules, {rootModule: modules.main});
  });
});

test('unit', 'pruning', 'mark entry point functions', function() {
  var modules = buildModules({
    "main": "function foo { let a = 1 } function bar { let b = 2 }"
  }).modules;
  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});
  assert.equal(modules.main.body[0].referenced, true);

  var modules2 = buildModules({
    "main": "function foo { let a = 1 } function bar { let b = 2 }"
  }).modules;
  prune(modules2, {rootModule: modules2.main, entryPoints: ['foo', 'bar']});
  assert.equal(modules2.main.body[0].referenced, true);
  assert.equal(modules2.main.body[1].referenced, true);
});

test('unit', 'pruning', 'prune unused functions', function() {
  var modules = buildModules({
    "main": "function foo { let a = 1 } " +
            "function bar { let b = 2 } " + "function baz { let c = 3 }"
  }).modules;

  prune(modules, {rootModule: modules.main, entryPoints: ['baz']});
  assert.equal(modules.main.body.length, 1);
  assert.equal(modules.main.body[0].name, 'baz');
});

test('unit', 'pruning', 'prune unused methods', function() {
  var modules = buildModules({
    "main": "function baz { let c = new FooStruct; c.bar() }; struct FooStruct {}; method foo(test:FooStruct) { let a = 1 }; method bar(test:FooStruct) { let b = 2 }"
  }).modules;

  // FooStruct.foo should be pruned.
  prune(modules, {rootModule: modules.main, entryPoints: ['baz']});
  assert.equal(modules.main.body.length, 3);
  assert.equal(modules.main.body[0].name, 'baz');
  assert.equal(modules.main.body[1] instanceof ast.StructStatement, true);
  assert.equal(modules.main.body[2].name, 'bar');
  assert.equal(modules.main.body[2] instanceof ast.MethodStatement, true);
});

test('unit', 'pruning', "recursive traversal", function() {
  var modules = buildModules({
    "main": "function foo { bar() }; function bar { baz() }; function baz { let c = 3 }; function garply { bar() }"
  }).modules;

  // garply should be pruned.
  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});
  assert.equal(modules.main.body.length, 3);
  assert.equal(modules.main.body[0].name, 'foo');
  assert.equal(modules.main.body[1].name, 'bar');
  assert.equal(modules.main.body[2].name, 'baz');
});

test('unit', 'pruning', "prune references unreachable from entry point", function () {
  var modules = buildModules({
    "main": "function foo { garply() }; function bar { baz() }; function baz { let c = 3 }; function garply { let c = 4 }"
  }).modules;

  // bar and baz should be pruned.
  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});
  assert.equal(modules.main.body.length, 2);
  assert.equal(modules.main.body[0].name, 'foo');
  assert.equal(modules.main.body[1].name, 'garply');
});

test('unit', 'pruning', "track references across modules", function () {
  var modules = buildModules({
    "main": "import yo; function foo { yo() }",
    "yo": "export function yo { mama() }; function mama {}; function papa {}"
  }).modules;

  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});
  assert.equal(modules.yo.body.length, 2);
  assert.equal(modules.yo.body[0].name, 'yo');
  assert.equal(modules.yo.body[1].name, 'mama');
});

test('unit', 'pruning', "prune unreferenced methods across modules", function () {
  var modules = buildModules({
    "main": "import yo; function foo { let y = new Yo; y.yo() }",
    "yo": "export struct Yo {}; export method yo(y:Yo) { mama() }; method papa(y:Yo) { y.yo() }; function mama {}"
  }).modules;

  prune(modules, {rootModule: modules.main, entryPoints: ['foo']});
  assert.equal(modules.yo.body.length, 3);
  assert.equal(modules.yo.body[0] instanceof ast.StructStatement, true);
  assert.equal(modules.yo.body[1].name, "yo");
  assert.equal(modules.yo.body[2].name, "mama");
});

test('unit', 'pruning', "fun with lambdas and modules", function () {
  var modules = buildModules({
    main: "import blah; function doSomething(f: func<void>) { f() }; function main { let a = foobar; doSomething(lambda { a(); }); doSomething(a); }",
    blah: "export function foobar {}"
  }).modules;

  prune(modules, {rootModule: modules.main, entryPoints: ['main']});
  assert.equal(modules.blah.body[0].name, "foobar");
  assert.equal(modules.blah.body[0].referenced, true);
});
