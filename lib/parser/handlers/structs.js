var ast = require('../../ast')
  , types = require('../../types')
  ;

exports['struct'] = {
  nud: function(t) {
    var name = this.expect('identifier').value;
    if (name[0].toLowerCase() == name[0]) {
      throw new Error('Struct names must be UpperCamelCased');
    }

    var generics = [];
    if (this.peek('<')) {
      do {
        generics.push(this.expect('gref').value);
      } while(this.peek(','));
      this.expect('>');
    }
    var contents = this.assignmentBlock();

    return new ast.StructStatement(name, contents, false, generics);
  }
};

exports['.'] = {
  led: function(left, t) {
    var right = new ast.Identifier(this.expect('identifier'));

    return new ast.PropertyAccessExpression(left, right);
  }
};

exports['new'] = {
  nud: function(t) {
    var type = this.typeRef();
    var args = new ast.AssignmentBlock();
    if (this.peek('{', true)) {
      args = this.assignmentBlock();
    }
    var end = this.prev;

    return new ast.NewExpression(type, args);
  }
}
