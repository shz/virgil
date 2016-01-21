# Parsing Virgil Code

## Tokenizing

Virgil's tokenizer is available for use, and has a rather nice property:
tokens cannot span lines.  You easily tokenizer some chunk of source,
even if it's pulled from the middle of a file, so long as you give
the tokenizer whole lines.

```javascript
var tokens = require('virgil').tokenizer(source, filename);
```

You'll either get an array of token objects as a result, or an error
will be thrown.  If thrown, the error will have a few bonus properties:

 * `.loc` - Location in the source string, see the [AST docs](ast.md)
            for the format
 * `.filename` - Whatever filename was specified in the function call
 * `.src` - Source that was being tokenized

If this function call actually succeeded, the tokens will be objects
with the following properties:

 * `.name` - Token name
 * `.value` - If the token can have a value, it'll be here.  For example,
              the token named `"int"` might have a value of `"100"`.  This
              field is *always* a string.
 * `.loc` - Token location information, see the [AST docs](ast.md)
            for the format.

## Parsing

There are a few ways to use the parser:

```javascript
var virgil = require('virgil');
var module = virgil.parse(src, filename); // Option 1
var nodes = virgil.parse.snippet(src); // Option 2
var node = virgil.parse.statement(src); // Option 3
```

 * Option 1 - Parses a whole file, and returns an [ast.Module](ast.md)
 * Option 2 - Parses a chunk of source and returns an array of
              [AST](ast.md) nodes
 * Option 3 - Parses a chunk of source and returns the node for the
              first expression or statement it finds

As with the tokenizer, if a parsing error is encountered, an `Error` will
be thrown with a set of bonus properties.

## Appendix

You probably don't care about this stuff.

### Token list

Ok, here we go.  The ones that are self explanatory are going to remain
unexplained.

#### Keywords

These must exist on word boundaries; either at the start of a line
or preceded by whitespace, and must either be at the end of the line
or followed by whitespace.

 * `true`
 * `false`
 * `if`
 * `else`
 * `function`
 * `method`
 * `struct`
 * `return`
 * `while`
 * `for`
 * `upto`
 * `downto`
 * `break`
 * `continue`
 * `try`
 * `catch`
 * `export`
 * `import`
 * `lambda`
 * `null`
 * `void`
 * `extern`
 * `new`
 * `default`
 * `let` - Value is either `let` or `let!`
 * `mut` - Value is either `mut` or `mut!`

#### Symbols

These don't need whitespace to separate them, though the semantics may
different if they're put together (e.g. `**` vs `* *`; the former is a
power operator, the latter is a parse error).

 * `**`
 * `*`
 * `/`
 * `+`
 * `-`
 * `%`
 * `!=`
 * `!`
 * `>=`
 * `<=`
 * `&&`
 * `||`
 * `<`
 * `>`
 * `==`
 * `=`
 * `(`
 * `)`
 * `?`
 * `,`
 * `:`
 * `{`
 * `}`
 * `[`
 * `]`
 * `.`
 * `;`

#### Everything Else

This is where it gets fun

 * `float` - Floating numbers, e.g. `1.0`, `1f`, `1.0f`.  The value is
             *just* the numeric portion, no `f`'s present.
 * `int` - Integer numbers, e.g. `10`
 * `string` - Strings, including the wrapping `"`s
 * `identifier` - Same delimiting rules as keywords
 * `gref` - Generic reference, e.g. `'A`
 * `comment` - Value includes leading `#`
 * `whitespace`

