# Types

Virgil has a few simple built-in types, and allows for user-defined
types via [structs](structs.md).

**Value types:**

 * `int` - Signed integer type
 * `float` - Double-precision floating point
 * `bool` - Standard boolean type, either `true` or `false`
 * `str` - String type
 * `list<'T>` - [Generic](generics.md) list type
 * `datetime` - Represents a point in time, with precision of one second

<hr />
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

<hr />
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

**`tan()`** - Returns tan of the float

**`acos()`** - Returns acos of the float

**`asin()`** - Returns asin of the float

**`atan()`** - Returns atan of the float

<hr />
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

<hr />
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

<hr />
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

<hr />
### `datetime`

Stores a one-second-precision point in time, independent of any
particular time zone.

To initialize to the current time, simply instantiate with overriding
any properties.

To initialize to a particular point in time, set the ts property to a UNIX-style
timestamp (at resolution of one second).  You may also optionally
provide a timezone offset (also in terms of number of seconds)
that affects how the time is converted to a string by the format() method.

```c#
let now = new datetime
let birthtime = new datetime { ts = 1107615820 }
```

#### Properties:

**`ts`** - representation of a point in time, in the form of a
UNIX timestamp (the number of seconds since Jan 01 1970, UTC).

**`offset`** - timezone offset, in number of
  seconds.
  E.g. Pacific Daylight Time would be represented by (-7) * 60 * 60.
  The sole effect of this is to
  adjust the "point of view" used when producing a
  rendering of this point in time via the format() method.


#### Methods:

**`toLocal()`** - Returns a new datetime object that is identical
except in that the offset has been automatically set to represent
the timezone in which the virgil engine is running.

**`toGMT()`** - Returns a new datetime object that is identical
except in that the offset has been set to 0.

**`toOffset(offset)`** - Returns a new datetime object that is identical
except in that the offset has been set to the number of seconds
specified via the parameter.  E.g. to set the offset to Pacific
Daylight (Summertime), use -7 * 60 * 60 as the offset.

**`format(fmtDate: str, fmtTime: str)`** - Produces a string
  representation of either/both the date portion and/or time
  portion. Send null to one of the "fmt" parameters to suppress a particular
  portion.

  The values supported for the fmtDate parameters are listed below,
  along with typical samples of English-US results when executed
  in modern JS environments:

- `full` produces "Jun 5, 2007"

- `fullnumeric` produces "6/5/2007"

- `year` produces "2007"

- `month` produces "Jun"

- `fullmonth` produces "June"

- `monthyear` produces "Jun 2007"

- `fullmonthyear` produces "June 2007"

- `daymonth` produces "Jun 05"

- `weekday` produces "Tue"

- `fullweekday` produces "Tuesday"

  The values supported for the fmtTime parameters are listed below,
  along with typical samples of English-US results when executed
  in modern JS environments:

- `full` produces "3:08pm"

- `abbrev` produces "3pm"
