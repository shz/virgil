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

## Basics

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
let f : list<float> = [] # Cannot be inferred, since the initial list is empty
```

All variables are immutable by default.  If you want to be able to
modify a variable, use `mut` instead of `let`.

```python
let a = 1
a = 3 # Compiler will throw an error

mut b = 1
b = 4 # Works just fine
```

All your normal control flow features are present as well; if/else,
while/for loops.

```python
let a = 25
let b : int = 0
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

For loops bear special mentions, as they're a little different than
most languages.

TODO - The rest
