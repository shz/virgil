# Developing

Help is greatly appreciated!

Please do the standard fork + pull request for any changes.

## Before Submitting a PR

Make sure that `npm run lint` and `npm test` are clean.

## TODO List

In no particular order, some things on the horizon:

 * Use Ragel -> C -> emscripten for lexing
 * Consistent representation of source locations
 * Formal operator precedence
 * Multiple error messages at once
 * Nice documentation
 * Emacs syntax highlighting

## Misc. Notes

Things you should know.

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

There are numerous ways to run the various types of tests.

```bash
npm test
# Or
./script/test.js
# Or
./script/test.js --no-coverage
```

The general philosophy towards testing: the more tests, the better.
It's incredibly important for Virgil, as a compiler, to not suffer from
regressions whenever possible.  See [tests.md](tests.md) for more
details.
