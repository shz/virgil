//
// Converts JS AST Expression-like nodes into ExpressionStatements.
// Anything that's already a Statement is passed through unchanged.
//
module.exports = function statementify(node) {
  if (node.type.match(/Literal|Expression|Identifier/)) {
    return {
      type: 'ExpressionStatement',
      expression: node
    };
  } else {
    return node;
  }
};
