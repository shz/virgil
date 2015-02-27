var precedence = require('../precedence')
  , ast = require('../../ast')
  , types = require('../../types')
  ;

exports['identifier'] = {
  nud: function(t) {
    return new ast.Identifier(t);
  }
};

exports['let'] = {
  nud: function(t) {
    var name = this.expect('identifier').value;
    if (name[0].toUpperCase() == name[0]) {
      throw new Error('Variable names must be lowerCamelCased');
    }

    var type = types.canned['inferred'];
    if (this.peek(':')) {
      type = this.typeRef();
    }
    if (type == types.canned['void'])
      throw new Error('Type void is not a valid variable type');

    this.expect('=');

    var expression = this.expression();
    if (expression.constructor == ast.DefaultLiteral) {
      if (type == types.canned['inferred'])
        throw new Error('Must specify variable\'s type when using default');
      expression.type = type;
    }

    return new ast.VariableDeclaration(name, type, expression,
      t.value && !!t.value.match(/\!$/));
  }
}

exports['mut'] = {
  nud: function(t) {
    var node = exports['let'].nud.call(this, t);
    return new ast.MutableVariableDeclaration(node.name, node.type,
      node.expression, t.value && !!t.value.match(/\!$/));
  }
};

exports['out'] = {
  nud: function(t) {
    var node = exports['let'].nud.call(this, t);
    return new ast.OutVariableDeclaration(node.name, node.type,
      node.expression, t.value && !!t.value.match(/\!$/));
  }
};

exports['='] = {
  led: function(left, t) {
    if (!(left instanceof ast.Identifier) && !(left instanceof ast.PropertyAccessExpression))
      throw new Error('Invalid left side of assigment (' + left.constructor.name + ')');

    return new ast.AssignmentStatement(left, this.expression(precedence['=']));
  }
};
