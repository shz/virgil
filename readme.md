# vz-script

A visual programming language.

# Spec

Is the language completely immutable?  I think so.

## Types

 * Int
 * Float
 * String
 * Date
 * Image
 * Video
 * Audio
 * List<T>
 * Map

## Syntax

```
# This is a comment
let i = 25
let i2 = Int(25)
let s = String("Hello world")
let s2 = "Hello world"
let d = Date("October 25, 2011")

func f(Integer a, Float b) -> Int
  blah
  pass

let f = (Integer a, Float b) {

}

[1, 2, 3].each {

}

match a
  a: false
  _: true


scope {

}

scope (ctx.save, ctx.restore) {

}

```

## Noodling

```

```

## Ported Program

```
export storyRender (ctx, data, anim) {
  ctx.beginPath()
  ctx.rect(0, 0, ctx.width, ctx.height);
  ctx.fillStyle = 'black';
  ctx.fill();
}
```
