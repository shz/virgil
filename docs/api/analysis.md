# Analyzing Virgil Code

So, you've [parsed](parsing.md) some Virgil code, and you have an AST.
It's just sitting there, raw, untapped; brimming with potential,
probably riddled with more bugs than Klandathu.

Analysis takes your relationship with that AST to the next level by
doing a couple of things for you:

 * Resolving/parsing imports
 * Checking types and annotating AST nodes with type information
 * Validating proper code behavior (e.g. are you trying to modify an immutable variable?)

If a program passes analysis without errors, it'll compile just fine.

For a full list of check  the `analyze()` function performs, check out
`[lib/passes](../lib/passes)`.

## Worlds

Once you've analyzed code, you get a `World` object back (whether or not
there were errors!), which encapsulates the whole view of a program.
It's kind of a big deal, so it [has its own docs](world.md).

## The API

I've stalled for long enough.  Here it is:

```javascript
require('virgil').analyze(module, options, callback);
```

And here's what it all means:

 * `module` - An `ast.Module`, the main program module
 * `options` - Optional!  We'll cover it in a minute
 * `callback` - In the form `function(err, world)`

## Options

 * `baseDir` - The program's base directory.  Non-library imports are
               relative to this.  If this options is missing, it will
               be inferred from the module's filename.  If the module
               has no filename, it'll be bogus and imports probably
               won't work.
 * `libs` - The library map (more info TODO)

## The Callback

If there was a problem, the `err` argument will be passed.  If everything
was fine, `err` will be `undefined`.  Regardless of whether there was
an error, the `world` argument will be set to a (you guessed it!) `World`
object.

If there wasn't an error, the `world` will be all set to be converted
down.  Otherwise, it will represent the state of things right before
that error occurred; that includes any successful imports and the like.

