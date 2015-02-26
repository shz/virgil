var ast = require('../../ast')
  , types = require('../../types')
  ;

exports['struct'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    if (name[0].toLowerCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Struct names must be UpperCamelCased');
    }

    var generics = [];
    if (this.peek('<')) {
      do {
        generics.push(this.expect('gref')[1]);
      } while(this.peek(','));
      this.expect('>');
    }
    var contents = this.assignmentBlock();

    return new ast.StructStatement(name, contents, false, generics);
  }
};

exports['.'] = {
  led: function(left) {
    var tok = this.expect('identifier');

    var right = new ast.Identifier(tok[1]);
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
    return new ast.PropertyAccessExpression(left, right);
  }
};

exports['new'] = {
  nud: function(value, loc) {
    var type = this.typeRef();
    var args = new ast.AssignmentBlock();
    if (this.peek('{', true)) {
      args = this.assignmentBlock();
    }
    var end = this.prev;

    var node = new ast.NewExpression(type, args);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: end[2].line,
        col: end[2].end
      }
    };
    return node;
  }
}
