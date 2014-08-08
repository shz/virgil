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
  lbp: 50,
  led: function(left) {
    var tok = this.expect('identifier');

    var right = new syntax.Identifier(tok[1]);
    right.loc = {
      start: {
        line: tok[2].line,
        col: tok[2].start
      },
      end: {
        line: tok[2].line,
        col: tok[2].end
      }
    };
    return new syntax.PropertyAccessExpression(left, right);
  }
};
