# Support Components

The Virgil API includes several support components.  While these aren't
required by any code that uses the API, they're probably going to be
useful if you're working with it.

All support components are accessible under `.support`, e.g.:

```javavscript
require('virgil').support
```

## Watching

Functionality for watching files for changes.  The watcher watches
all files in a `World` object returned from a compilation, and will
fire a callback the first time one of those files changes.

Because the callback will only be fired once, if you want to watch
indefinitely you'll have to repeatedly call the `.watch()` function.

### Example

```javascript
//
// Continuously builds a Virgil program
//
var virgil = require('virgil');

var compile = function() {
  var options = {
    filename: 'foo.vgl'
  };
  virgil.compile(src, 'javascript', options, function(err, output, world) {
    // Wait for a change
    virgil.support.watch(world, function(filename) {
      console.log('The file', filename, 'changed, recompiling');
      compile();
    });
  });
};
```

## Error Display

If you're compiling code, and that code was written by a human, it'll
have errors.  Fortunately, there's a whole toolkit for consistently
displaying information about those errors, all within the context of
`virgil.support.errors`.

### High Level Utilities

`printErrorContext(err)` - Prints syntax-highlighted code around an error
to the stderr.  The error itself is highlighted, other tokens are
colorized, and the standard gutter is displayed.

### Contexts

A `Context` is an object representing one or more lines of code, with
some utility methods.

**Properties:**

`Context.err` - If the context came from an error, this will be that error

`Context.filename` - The filename associated with this chunk of code

`Context.lines` - An array of `Line` object that contain the code in
                  this context.

**Methods**:

`Context.addLine(num, content)` - Adds a line to the context

`Context.toString()` - Converts the context into a plain old string
                       representation of its lines

`Context.gutter(pad)` - Creates a gutter, containing line numbers.  The
  `pad` argument is the character to use for left padding on the line
  numbers, and is optional.

`Context.highlight(f)` - Returns an array of highlighted lines using the
  specified highlight function.

### Getting a Context

`getContext(src, filename, index, padding)` - Creates a context from the
  provided source code.  The context is anchored around `index`, and
  includes `padding` lines above and below that line.

`getErrorContext(err, padding)` - Creates a context from a compilation
  error, with `padding` lines above and below the error's location.

### Built-in Highlighers

Why reinvent the wheel?  The `highlighters` object provides a few built
in highlighter functions for use in `Context.highlight()`.

`highlighters.console` - For use when logging to a console

### Example

```javascript
var virgil = require('virgil');
var err; // Pretend this is filled in by some prior code

// Prints the context around the error, syntax highlighted but with
// no gutter.
var ctx = virgil.support.errors.getErrorContext(err, 5);
console.error(ctx.highlight(virgil.support.errors.highlighters.console).join('\n'));

// Prints lines 5-15 of the errored file's source code, with no highlighting
ctx = virgil.support.errors.getContext(err.src, err.filename, 10, 5);
console.error(ctx.toString());

// Prints the previous context, but with a gutter
var gutter = ctx.gutter(' ');
for (var i=0; i<ctx.lines.length, i++) {
  console.error(gutter[i] + ': ' + ctx.lines[i]);
}

// Prints the error context, syntax highlighted, with a gutter
ctx = virgil.support.errors.getErrorContext(err, 5);
gutter = ctx.gutter(' ');
var lines = ctx.highlight(virgil.support.errors.highlighters.console);
for (var i=0; i<lines.length; i++) {
  console.error(gutter[i] + ': ' + lines[i]);
}

// A slightly fancier version of the above that highlights the gutter
// number where the error occured, and also prints the error message
// itself in addition to the context.
virgil.support.errors.printErrorContext(err);
```
