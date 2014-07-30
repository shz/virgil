# Types

## Basic Stypes

### `str`

```
str a = "Hello world"
```

### `int`

```
int a = 1
```

### `float`

```
float a = 1.0f
```

### `px`

```
px a = 10px
```

### `perc`

Same as a `float`.  Will automatically cast to a `float`, bounded
to `[0, 1]`.

```
perc a = 0.5f
```

### `time`

Same as an `int`.  Automatically casts to an `int`.

```
time a = 10ms
time b = 0.5s
```

### `color`

Automatically casts to a `string`.

```
color a = rgb(100, 255, 1)
color b = rgba(100, 243, 1, 0)
```

### `speed`

**Thought experiment**

This is its own datatype, though arithmetic operations with other
datatypes can convert this to `time` or `px`.

```
speed a = 100px/ms
speed b = 200px/s

## Vizify Datatypes

### `image`

### `audio`

### `video`
