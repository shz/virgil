# The Virgil Language

Virgil is a small, yet functional programming language designed for
embedding.  In this respect it's similar to Lua, but only in purpose
and not implementation.

First, the basics: Virgil is statically typed, but makes use of type
inferrence to keep that from being annoying.  It has a class system
of sorts, though no inheritance.  Generics are supported.  Virgil does
not output machine code directly, but instead generates reasonably
idiomatic C++11 and Javascript.

Ok.  With that out of the way, let's dive into the language.

**Quick reference**:

 * [Variables](#variables)
 * [If/else](#ifelse)
 * [Loops](#loops)
 * [Boolean logic](#logic)
 * [Functions](#functions)
 * [Creating structs](#struct-def)
 * [Instantiating structs](#struct-create)
 * [Methods](#methods)
 * [Externs](#externs)

## Basics

<a name="variables"></a>
Virgil has a few built in types that are pretty much exactly what you'd
expect: `int`, `float`, `bool`, `str`, `list<'T>`.  Usage is pretty
self explanatory, but check [here](types.md) for the full reference.

Variables are declared using the `let` keyword.  You do not need to
specify the type when declaring variables; it only needs to be present
if the compiler is unable to infer it.

```python
let a = 1 # Inferred as int
let b = "Hello world" # Inferred as str
let c = 3.14 # Inferred as float
let d = true # Inferred as bool
let e = [1, 2, 3] # Inferred as list<int>
let f: list<float> = [] # Cannot be inferred, since the initial list is empty
```

All variables are immutable by default.  If you want to be able to
modify a variable, use `mut` instead of `let`.

```python
let a = 1
a = 3 # Compiler will throw an error

mut b = 1
b = 4 # Works just fine
```

Note that immutability doesn't reach into the value itself; you can
still mutate the properties on an immutable variable.

<a name="ifelse"></a>
All your normal control flow features are present as well; if/else,
while/for loops.

```python
let a = 25
mut b: int = 0
if a > 100 {
  b = 100
} else if a > 10 {
  b = 10
} else {
  b = 1
}

mut count = 0
while count < 10 {
  count += 1
}
```

<a name="loops"></a>
For loops bear special mentions, as they're a little different than
most languages, and by different, I mean limited.  Take a look:

```python
mut count = 0
for i = 0 upto 3 {
  count = count + 1
}
# count == 1 + 2 == 3
for i = 10 downto 9 {
  count += i
}
# count = 3 + 10 = 13
```

The main thing to beware of is that for loops only work on `int`s, and
`upto`/`downto` *exclude* the final value.  So `for i = 0 upto 2` will
see values `i = 0` and `i = 1`.

<a name="logic"></a>
Boolean operators are largely the same as in any other language.

```swift
let a = false || true && (1 > 20) || (4 <= 4)
```

## Functions

<a name="functions"></a>
Best described through example:

```python
# No return, no arguments
function f {
  return void # Not actually needed in this case, but demos
              # how to manually return from a function without
              # a return type.
}

# Return type, no arguments
function foo: int {
  return 1
}

# Return type, arguments
function foobar(a: int): bool {
  return a == 2
}
```

It's important to note that if a function takes no arguments, it
**must not** include round brackets.  Something like this: `function a() {}`
is illegal.

## Structs

<a name="struct-def"></a>
User defined types may be declared using the `struct` keyword.  These
behave similarly to plain-old C structs, in that they're flat maps of
name to value.  Unlike C structs, they must declare default values for
all their properties.

```perl
struct MyData {
  a = 1 # Type is inferred
  b: int = 2 # Type is still inferred, but explicitly declared
  recursive: MyData = null # Type must be specified, as null has no type
}
```

<a name="struct-create"></a>
To instantiate a struct, use the `new` keyword:

```perl
let a = new MyData # Initialized with full defaults
let b = new MyData {
  a = 10 # Override specified properties
}
```

## Methods

<a name="methods"></a>
Methods are just special syntactic sugar for functions, and can be
defined on any type.  Scope rules are exactly the same as for functions.

Declaring a method is exactly the same as declaring a function, except
the `method` keyword is used instead of `function` (shocking!).  The
type of the first argument is used as the object the method
is defined on (kind of like `self` in Python).  Best described through
example:

```perl
# Using a function...
function double(i: int): int {
  return i * 2
}
let a = double(2)

# Using a method...
method double(i: int): int {
  return i * 2
}
let b = 2.double()
```

## Module System

<a name="module"></a>
Virgil code can import other Virgil code by using the (*brace yourself!*) `import`
statement.  It looks like this:

```perl
import some.lib
```

This will look for `some/lib.vgl`, relative to the file that's doing the
importing.  You can also pass the `--lib foo=some/location/` flag to
the compiler to specify the external location of some library, but the
local version will always be looked for first.  (Sorry, this is poorly
explained).

When you import a file, all its exports will be brought into the current
scope.  That's right; no namespacing.  This behavior is similar to C or
Ruby.  Virgil files must export things explicitly, and may only export
functions, methods, or structs.  Here's an example:

```python
export function add(a: int, b: int) : int {
  return a + b
}
export method half(f: float) : float {
  return f / 2
}
export struct Shazam {
  magic = 42
}
```


## Externs

<a name="externs"></a>
Virgil on its own provides basically no way to interact with the host
system.  To rememdy this, the language provides the `extern` concept as
a way to expose external functionality to Virgil code.  These `extern`d
constructs can be `struct`s, `method`s, or `function`s, and are declared
slighty differently than the regular variety: they have no bodies.

When using an extern block, an optional namespace can be defined.

```perl
# Expose Javascript-style console functionality
extern console {
  function log(s: str)
  function error(s: str)
}

# Expose browser-based JS globals
extern {
  function alert(s: str)

  class Range {
    endOffset: int
    startOffset: int
  }
}
```

## Generics

TODO

