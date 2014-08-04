var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['struct'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    if (name[0].toLowerCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Struct names must be UpperCamelCased');
    }

    var contents = this.assignmentBlock();

    return new syntax.StructStatement(name, contents);
  }
}


/* istanbul ignore next */
exports['.'] = {
  lbp: 1,
  led: function(left) {
    var right = null;
    if (this.peek('(', true)) {
      right = this.expression(0);
      this.expect(')');
    } else {
      right = new syntax.Identifier(this.expect('identifier')[1]);
    }

    return new syntax.PropertyAccessExpression(left, right);
  }
};
