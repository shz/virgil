# The Virgil AST

```javascript
require('virgil').ast
```

## Traversal

Use the `.traverse(node, [parent], enter, [exit])` function to visit all
members of a Virgil AST node.  The `enter` and `exit` functions will be
called before and after walking a node's children, and should have the
following signature:

```javascript
function visitor(node, parent)
```

If the `enter` function returns `false`, its children will be skipped.

## AST Definition

This is one of those cases where the code itself does a far better job
of describing what's going on than documentation.  Here's a complete
list of all syntax node types, linking to their defining file.  There's
a JS inheritance hierarchy set up, so feel free to use `instanceof`.

 * [`Module`](../../lib/ast/modules.js)
 * [`Expression`](../../lib/ast/core.js)
   * [`Identifier`](../../lib/ast/misc.js)
   * [`Literal`](../../lib/ast/literals.js)
     * [`TrueLiteral`](../../lib/ast/literals.js)
     * [`FalseLiteral`](../../lib/ast/literals.js)
     * [`NullLiteral`](../../lib/ast/literals.js)
     * [`DefaultLiteral`](../../lib/ast/literals.js)
     * [`StringLiteral`](../../lib/ast/literals.js)
     * [`NumericLiteral`](../../lib/ast/literals.js)
       * [`IntegerLiteral`](../../lib/ast/literals.js)
       * [`FloatLiteral`](../../lib/ast/literals.js)
   * [`ArithmeticExpression`](../../lib/ast/arithmetic.js)
     * [`NegationExpression`](../../lib/ast/arithmetic.js)
     * [`MultiplicationExpression`](../../lib/ast/arithmetic.js)
     * [`AdditionExpression`](../../lib/ast/arithmetic.js)
     * [`SubtractionExpression`](../../lib/ast/arithmetic.js)
     * [`DivisionExpression`](../../lib/ast/arithmetic.js)
     * [`PowerExpression`](../../lib/ast/arithmetic.js)
     * [`ModExpression`](../../lib/ast/arithmetic.js)
   * [`LogicExpression`](../../lib/ast/logic.js)
     * [`NotExpression`](../../lib/ast/logic.js)
     * [`TernaryExpression`](../../lib/ast/logic.js)
     * [`EqualsExpression`](../../lib/ast/logic.js)
     * [`NotEqualsExpression`](../../lib/ast/logic.js)
     * [`GreaterThanExpression`](../../lib/ast/logic.js)
     * [`LessThanExpression`](../../lib/ast/logic.js)
     * [`GreaterThanEqualExpression`](../../lib/ast/logic.js)
     * [`LessThanEqualExpression`](../../lib/ast/logic.js)
     * [`LogicalOrExpression`](../../lib/ast/logic.js)
     * [`LogicalAndExpression`](../../lib/ast/logic.js)
   * [`LambdaExpression`](../../lib/ast/functions.js)
   * [`FunctionCallExpression`](../../lib/ast/functions.js)
   * [`ListExpression`](../../lib/ast/lists.js)
   * [`ListAccessExpression`](../../lib/ast/lists.js)
   * [`NewExpression`](../../lib/ast/structs.js)
   * [`PropertyAccessExpression`](../../lib/ast/structs.js)
 * [`Statement`](../../lib/ast/core.js)
   * [`IfStatement`](../../lib/ast/logic.js)
   * [`FunctionStatement`](../../lib/ast/functions.js)
   * [`MethodStatement`](../../lib/ast/functions.js)
   * [`ReturnStatement`](../../lib/ast/functions.js)
   * [`VariableDeclaration`](../../lib/ast/variables.js)
   * [`MutableVariableDeclaration`](../../lib/ast/variables.js)
   * [`WhileStatement`](../../lib/ast/loops.js)
   * [`ForStatement`](../../lib/ast/loops.js)
   * [`BreakStatement`](../../lib/ast/loops.js)
   * [`ContinueStatement`](../../lib/ast/loops.js)
   * [`ImportStatement`](../../lib/ast/modules.js)
   * [`ExternStatement`](../../lib/ast/modules.js)
   * [`StructStatement`](../../lib/ast/structs.js)
   * [`AssignmentStatement`](../.../lib/ast/misc.js)
   * [`BlockStatement`](../../lib/ast/misc.js)
   * [`AssignmentBlock`](../../lib/ast/misc.js)
   * [`TryCatchStatement`](../../lib/ast/misc.js)

### Location Information

All AST nodes have a `.loc` property in the following format:

```javascript
node.loc = {
  start: { line: 0, col: 0 },
  end: { line: 0, col: 0 }
};
```

**Important:** `.line` is 1 based, `.col` is 0 based

### Raising Errors

Every AST node has two utility methods for creating and throwing errors
with location information embedded:

```javascript
node.throw('Something bad');
var err = node.error('Something bad'); throw err;
```
