# virgil

A universal language for animations and visualization.

Compiles into C++ and Javascript, with special integrations for use
with the [Vizify](https://git.corp.yahoo.com/lpstein/vizify) platform.

```
function main returns int {
  let message = "Hello World"
  console.log(message)
  return 0
}
```

## Usage

**Installation**

```bash
ynpm install virgil
```

**Compiling**

```bash
virgil-js [options] [files...]
```

**Options**

 * `-d`/`--debug` - Use to debug the compiler
 * `-w`/`--watch` - Runs continuously, recompiling when input files change
 * `-m`/`--module` - Compiles into modules
 * `-o FILE`/`--output FILE` - Compiles to a file rather than stdout

**Testing**

```bash
npm test
# Or
./script/test.sh
# Or, for verbose integration tests...
./script/test-integration.sh --debug
```

## The Language

Real documentation forthcoming.

 * [Types](language/types.md)
 * [Operators](language/operators.md)
