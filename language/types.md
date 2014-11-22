# Types

Virgil has a few simple built-in types, and allows for user-defined
types via [structs](structs.md).

**Value types:**

 * `int` - Signed integer type
 * `float` - Double-precision floating point
 * `bool` - Standard boolean type, either `true` or `false`
 * `str` - String type
 * `list<'T>` - [Generic](generics.md) list type

### `int`

May be used in arithmetic expressions.  Unlike many languages, casting
between `int` and `float` is not automatic.  If you want to turn your
`int` into a `float`, use the `.asFloat()` method.

```c#
let a : int = 1
let b = 10
let c = b * a - 20
let d = c.asFloat()
let e = 20f / a.asFloat()
```

#### Properties:

None

#### Methods:

**`asFloat()`** - Converts to a `float`
**`asStr()`** - Converts to a `str`

### `float`

May be used in arithmetic expressions.  Unlike many languages, casting
between `int` and `float` is not automatic.  If you want to turn your
`float` into an `int`, use the `.round()`, `.ceil()`, or `.floor()`
methods.

```c#
let a : float = 1f
let b = 1f
let c = 10.2
let d = 12.4f
let e = 10 * c.ceil()
```

#### Properties:

None

#### Methods:

**`format(n : int)`** - Converts to an `str`, showing `n` digits after
                        the decimal
**`floor()`** - Returns the floor
**`ceil()`** - Returns the ceiling
**`round()`** - Returns the nearest integer
**`abs()`** - Returns the absolute valuee
**`cos()`** - Returns cosin of the float
**`sin()`** - Returns sin of the float

### `bool`

Either `true` or `false`.  May be used in logical expressions.

```c#
let a = true
let b = false
let c : bool = false
let d = true || false
let e = d && (a || false)
```

#### Properties:

None

#### Methods:

None

### `str`

Created using double-quotes.  May be concatenated using addition.

```c#
let a : str = "Hello world"
let b = "Hello " + "world"
let c = a + " " + b
```

#### Properties:

**`length`** - Number of characters in the str

#### Methods:

**`upper()`** - Converts to uppercase
**`lower()`** - Converts to lowercase
**`at(n : int)`** - Returns the character at position `n`
**`asInt()`** - Parses to an `int`
**`asFloat()`** - Parses to a `float`

### `list<'T>`

Standard array type.  Elements must all be of the same type.

```c#
let a : list<int> = []
let b : list<int> = [ 1, 2, 5 ]
let c = [ 6, 7, 9, ]
```

#### Properties:

**`length`** - Number of elements in the list

#### Methods:

**`empty()`** - Removes all elements from the list
**`remove(i : int)`** - Removes the element at the specified index, returns removed element
**`removeRange(start : int, end : int)`** - Removes elements in the specified range, returns elements removed
**`push(el : T)`** - Adds element to the end of the list
**`pop()`** - Removes element from the end of the list and returns it
