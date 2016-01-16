# Tests

And how to write them.

We have a few different kind of tests, loosely defined.  The prevailing
philosophy is, more testing, less worrying about what exactly to call
the tests.

 * Complete tests - Compiles Virgil files to native code, and runs that
   native code.  Tests fail if the resulting executable doesn't exit
   cleanly.
 * Level tests - Runs the compiler through its paces in discrete steps
   (tokenizing, parsing, scope pass, type pass, and more), verifying
   that the state is as expected after each one.  This runs on all
   examples in the [examples/](examples/) folder.
 * Functional tests - Testing in broad terms; for example, compiling
   from a file and checking the outputted JS/C++.
 * Integration tests - Testing relatively simple and well defined things,
   that may involve multiple code units.
 * Unit tests - Testing single units of code

## Test Framework

We use a custom test framework (check out [scripts/test.js](../scripts/test.js)).
Usage is as follows:

```javascript
test('some', 'nested', 'namespace', 'the test name', function() {
  assert.equal(1, 1); // assert is global for you
});
```

Similar to Mocha, if you expected a `done` callback to be passed to
your function, your test will be allowed to run async.

#### Why?

We have a whole bunch of different types of tests, and we want to collate
coverage from all of them and run them *fast*.  This framework does
that for us, and is also extremely flexible in how tests are specified.
