var syntax = require('../../ast')
  , types = require('../../types')
  ;

exports['identifier'] = {
  nud: function(value) {
    return new syntax.Identifier(value);
  }
};

exports['let'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    var type = types.INFERRED;

    if (this.peek(':')) {
      type = this.typeRef();
    }

    this.expect('=');

    var expression = this.expression(0);

    return new syntax.VariableDeclaration(name, type, expression);
  }
}

exports['mut'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.MutableVariableDeclaration(node.name, node.type, node.expression);
  }
};

exports['out'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.OutVariableDeclaration(node.name, node.type, node.expression);
  }
};

exports['='] = {
  lbp: 100,
  led: function(left) {
    if (!(left instanceof syntax.Identifier)) // TODO - Property access
      throw new Error('Invalid assignment; left side must be an identifier');

    return new syntax.AssignmentStatement(left, this.expression(100));
  }
};
