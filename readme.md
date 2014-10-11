# virgil

A universal language for animations and visualization.

Compiles into C++ and Javascript, with special integrations for use
with the [Vizify](https://git.corp.yahoo.com/lpstein/vizify) platform.

```c#
function main : int {
  let message = "Hello World"
  alert(message)
  return 0
}
```

## Usage

#### Installation

```bash
ynpm install virgil
```

#### Using from node

```javascript
require('virgil');
require('./path/to/virgil/file');
```

#### Compiling with Virgil

```bash
virgil-js [options] [files...]
virgil-cpp [options] [files...]
```

**Options**

 * `-d`/`--debug` - Use to debug the compiler
 * `-w`/`--watch` - Runs continuously, recompiling when input files change
 * `-s`/`--snippet` - Compiles using snippet mode
 * `-o LOCATION`/`--output LOCATION` - Specifies output directory, or
                                       output file in snippet mode

#### Testing

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

## The Language

Documentation is being actively developed, but needs lots of work still.
Feel free to reach out to lpstein@yahoo-inc.com if you have any questions
or need help!

[Language guide](language/guide.md) - A short, gentle, and mostly complete
                                      introduction to Virgil.

 * [Types](language/types.md)
 * [Operators](language/operators.md)
 * [Control](language/control.md)
 * [Functions](language/functions.md)
 * [Structs/Methods](language/structs.md)
 * [Modules](language/modules.md)
 * [Externs](language/externs.md)
 * [Generics](language/generics.md)

## TODO

In addition to finishing up the language...

 * Use Ragel -> C -> emscripten for lexing
 * Consistent representation of source locations
 * Formal operator precedence
 * Multiple error messages at once
 * Nice documentation
 * Emacs syntax highlighting
