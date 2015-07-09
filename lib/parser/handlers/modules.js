var ast = require('../../ast')
  ;

exports['export'] = {
  nud: function(t) {
    var myToken = this.cur;
    var node = this.part();
    if (!(node instanceof ast.FunctionStatement) &&
        !(node instanceof ast.StructStatement) &&
        !(node instanceof ast.ExternStatement) &&
        !(node instanceof ast.VariableDeclaration) &&
        !(node instanceof ast.ExternStatement) &&
        !(node instanceof ast.MethodStatement)) {
      throw new Error('Only structs, functions, or methods may be exported');
    }

    node.ex = true;
    return node;
  }
};

exports['import'] = {
  nud: function(t) {
    var modules = [];
    var id = null;

    do {
      id = this.expect('identifier');
      modules.push(id.value);
    } while (this.peek('.'))

    return new ast.ImportStatement(modules);
  }
};
