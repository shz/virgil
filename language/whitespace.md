# Whitespace

Virgil uses semicolons to separate expressions, but you'll almost
never need to use them.  The end of each line has an implied semicolon,
so the only time you'll need to insert them yourself is if you want to
put multiple independent expressions on one line.

For example, here's some bog standard Virgil code:

```rust
let a = 1
doSomething(a + 1)
doSomethingElse(12)
```

You could collapse that like so:

```rust
let a = 1
doSomething(a + 1); doSomethingElse(12)
```

Note that this system prevents some behavior you may be used to, such
as method chaining.  The following is *invalid* Virgil code, and will
not compile:

```rust
foo.bar()
   .baz()
   .bam()
```

```rust
let a = 1
      + 2
      / 3
```

This is because of those implied semicolons at the end of each line.
Instead, you need to start the next portion on the same line, like this:

```rust
foo.bar().
    baz().
    bam()
```

```rust
let a = 1 +
        2 /
        3
```

## Line Continuations

Obviously, the above approach is kind of ugly.  Fortunately, you have
an escape hatch via line continuations.  To do so, just make sure the
last non-whitespace character at the end of a line is `\`.  Here's what
it looks like:

```rust
foo.bar() \
   .baz() \
   .bam()

let a = 1 \
      + 2 \
      / 3
```

You can also intersperse comments in there as well:

```python
foo.bar() \
   # This is a comment
   .baz() \
   # This is a comment too \
   .bam()
```

Note that if a line contains only a comment, the line continuation is
implied and not needed (it doesn't hurt to have it there, though).
