#!/usr/bin/env node

// Run in the right context, especially useful for pulling in module
var path = require('path');
process.chdir(path.join(__dirname, '..', '..'));

var fs = require('fs')
  , Benchmark = require('benchmark').Benchmark
  , tokenizer = require('../../lib/tokenizer')
  ;

var vgl = fs.readFileSync(path.join(__dirname, '..', '..', 'language', 'examples', 'complex1.vgl'))
            .toString();
var suite = new Benchmark.Suite();
var testAtSize = function(factor) {
  var t = '';
  for (var i=0; i<factor; i++)
    t += vgl + '\n';

  suite.add(factor + 'x', function() {
    tokenizer(t);
  });
};

testAtSize(1);
testAtSize(2);
testAtSize(4);
testAtSize(8);
testAtSize(16);
testAtSize(32);

suite.on('cycle', function(event) {
  console.log(event.target.toString());
});
suite.on('complete', function() {
  console.log('');
  // console.log(this);
  console.log('Summary:');

  var base = this[0].hz;
  for (var i=0; i<this.length; i++) {
    var r = this[i];
    console.log(r.name + ': ' + (r.hz / base) + 'x (' + r.hz + 'hz)');
  }
});

console.log('Running...');
suite.run();
