var fs = require('fs')
  , path = require('path')
  , virgil = require('../api')
  , SlotStack = require('../interpreter/slot_stack')
  , executeBlock = require('../interpreter/block')
  ;

//
// Executes a suite on the main module of a World object.  A suite is
// simply list of AST nodes to run (likely parsed using virgil.parse.snippet).
//
var executeSuite = function(suite, world, callback) {
  // By creating our own slot stack and passing it in, we're able to
  // retain it *after* we've executed the module.
  var slots = new SlotStack();
  executeBlock(world.mainModule, slots, [], true);

  // Now that the module's contents are neatly loaded into our slot
  // stack, we'll execute the test suite in a new scope inside that
  // block.
  var block = new virgil.ast.BlockStatement(null, suite);
  var result = executeBlock(block, slots);
  if (result) {
    // TODO - Handle this gracefully by failing somehow.  Shouldn't
    //        be able to return or break or w/e.
    console.log(result);
  }

  callback(undefined, 'Success');
};

exports.run = function(subjectPath, suitePath, callback) {
  // Parse the subject file
  var subject = virgil.parse(fs.readFileSync(subjectPath, {encoding: 'utf8'}), subjectPath);
  var suite = virgil.parse.snippet(fs.readFileSync(suitePath, {encoding: 'utf8'}), suitePath);

  // Analyze the subject only, since the suite itself doesn't stand
  // alone very well.  Any issues there will come out in the wash in
  // the interpreter.
  virgil.analyze(subject, function(err, world) {
    if (err) {
      return callback(err);
    }

    executeSuite(suite, world, callback);
  });
};
