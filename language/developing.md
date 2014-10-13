# Developing

Help is greatly appreciated!

Please do the standard fork + pull request for any changes.

## Before Submitting a PR

Make sure that `npm run lint` and `npm test` are clean.

## Misc. Notes

Things you should know.

### Testing

There are numerous ways to run the various types of tests.

```bash
npm test
# Or
./script/test.sh
# Or, for verbose integration tests...
./script/test-integration.sh --debug
# Or, to debug the module system
./script/test-module.sh --debug
# Or, for coverage-free unit tests
./script/test-unit.sh --no-coverage
# Or, for a single unit test
whiskey test/unit/[testfile].js
```

The above is a sampling of available combinations.

### Error Messages

Include location information on error objects wherever possible.  The
compiler will pick up on these and use them to display friendly error
messages.

Error messages themselves should be of the form

> [Rule that was broken] [how it was broken specifically]

For example

> Arithmetic must be performed on numbers of the same type; the types
> used here are int and float

This is a loose rule.  The goal is to have clear, specific, and
concise error messages, and they should be written in whatever style
accomplishes that goal best.

### Testing

The more tests, the better.  It's incredibly important for Virgil, as
a compiler, to not suffer from regressions whenever possible.
