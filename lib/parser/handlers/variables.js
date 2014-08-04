var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['identifier'] = {
  nud: function(value) {
    return new syntax.Identifier(value);
  }
};

/* istanbul ignore next */
exports['let'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    if (name[0].toUpperCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Variable names must be lowerCamelCased');
    }

    var type = types.INFERRED;

    if (this.peek(':')) {
      type = this.typeRef();
    }

    this.expect('=');

    var expression = this.expression(0);

    return new syntax.VariableDeclaration(name, type, expression);
  }
}

/* istanbul ignore next */
exports['mut'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.MutableVariableDeclaration(node.name, node.type, node.expression);
  }
};

/* istanbul ignore next */
exports['out'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.OutVariableDeclaration(node.name, node.type, node.expression);
  }
};

/* istanbul ignore next */
exports['='] = {
  lbp: 100,
  led: function(left) {
    if (!(left instanceof syntax.Identifier) && !(left instanceof syntax.PropertyAccessExpression))
      throw new Error('Invalid left side of assigment (' + left.constructor.name + ')');

    return new syntax.AssignmentStatement(left, this.expression(100));
  }
};
