# Compiling Virgil Code

What we're all here for.  The compiler API is the highest-level way to
interact with Virgil code, and zips together parsing, analysis, and
code generation for you.

Here's the basic signature:

```javascript
require('virgil').compile(src, language, options, callback);
```

Let's break it down.

 * `src` - The source you're compiling, nothing fancy
 * `language` - Language to compile down to, currently either
                `'javascript'` or `'cpp'`
 * `options` - Important, and *not optional*.  We'll cover shortly.
 * `callback` - In the form `function(err, filemap, world)`

## Options

Here's the format for that options object, with their defaults shown

```javascript

var options = {
  filename: 'main',
  convert: {}, // Language-specific conversion options
  prune: false, // Control output pruning
  libs: {}, // Lib locations
};
```

It's a *really* good idea to set `filename` to the actual filename
of the thing that's being compiled.

Prune deserves special mention; when enabled, any unused function or
method in the source, imported source, or imported libraries will be
*excluded from the output completely.*  This can be a powerful way of
slimming down Javascript output.

The lib spec is a map of lib name to absolute or relative lib folders,
for example:

```javascript
var libs = {
  lib1: '/usr/local/lib/virgil/awesome',
  local: 'tmp/lib-local'
}
```

Conversion options are defined later on.

## The Callback

The `err` argument is enhanced with a few extra properties, see the
[AST docs](ast.md) for details.  In addition to the standard AST error
additions, there's a special `.world` property describing the state of
the world at the time the compile error was encountered.  It's
documented further down in this doc.

The `filemap` argument is an object mapping output filename to source.
The filenames here are all relative to whatever the output directory
should be, and included in this map is the output from any lib file
that's needed.

The `world` argument is a special object representing the state of the
world, and it looks like...

## World Objects

Hah!  Bait and switch, `World`s are so cool and important that they
have their own set of docs.  [Check 'em](world.md).

## Conversion Options

These differ by language

### Javascript

 * `browserify` -- When enabled, all output files will be combined
                   together into a single output file (`main.js`), ala
                   Browserify

### C++

None!
