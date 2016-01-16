# Testing Virgil Code

Testing is a great idea, and it's baked into Virgil.

## Basic Operation

```bash
virgil-test language/examples/testing/subject.vgl language/examples/testing/suite.vgl
```

The test suite is a little non-standard: you'll notice there's no main
function, and it doesn't even import the code its testing.  How does it
work?

The test suite is run *within the context of the Virgil file it's testing*.
Imagine it being bundled up into a `function main {}`, being
plopped right into the source of the file you're testing, and then
being executed.

This gives you access to the internals of that file, to test to your
heart's content.
