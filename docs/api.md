# Javascript API

Being implemented in Javascript, Virgil has a handy API that allows
analysis and compilation of Virgil code from Node.js or the browser.

Your gateway to all this goodness:

```javascript
var virgil = require('virgil');
```

## Compilation

Compile Virgil source code!  Amaze your friends!  [Surf's up](api/compile.md).

## Lexing/parsing

Take dead, boring Virgil text and turn it into an oh-so-handy AST.
Alternatively, find out what's wrong with your shit code.
[Parse like a pro](api/parsing.md).

## AST Manipulation

What's in an AST?  Everything, actually.  [Nitty gritty details](api.ast.md).

## Analysis

Scope, types, and all that cool stuff.  The heart and soul of the language,
and the root of all neat things you can do with it.  Unfortunately, it's
not exposed via the API yet...

## Support Components

This is stuff that's tangentially related to Virgil code itself: printing
errors, watching files for changes, that kind of stuff.  [Check it out](api/support.md).
