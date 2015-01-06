# virgil

A universal language for animations and visualization.

Compiles into C++ and Javascript, with special integrations for use
with the [Vizify](https://git.corp.yahoo.com/lpstein/vizify) platform.

```rust
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
 * `-n`/`--namespace` - Specifies namespace to use for generated output
 * `-o LOCATION`/`--output LOCATION` - Specifies output directory, or
                                       output file in snippet mode

## The Language

Documentation is being actively developed, but needs lots of work still.
Feel free to reach out to lpstein@yahoo-inc.com if you have any questions
or need help!

[Language guide](language/guide.md) - A short, gentle, and mostly complete
                                      introduction to Virgil.

Details documentation/specs (some of these TODO):

 * [Types](language/types.md)
 * [Operators](language/operators.md)
 * [Control](language/control.md)
 * [Functions](language/functions.md)
 * [Structs/Methods](language/structs.md)
 * [Modules](language/modules.md)
 * [Externs](language/externs.md)
 * [Generics](language/generics.md)

## Contributing

Check out [developing.md](language/developing.md) for information.  If
you're interested in hacking on the language, adding compiler features,
or whatever, don't hesitate to ask lpstein@yahoo-inc.com for help.  I'm
more than happy to help ease people into the codebase!
