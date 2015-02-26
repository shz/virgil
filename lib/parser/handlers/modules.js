var ast = require('../../ast')
  ;

exports['export'] = {
  nud: function() {
    var myToken = this.cur;
    var node = this.statement();
    if (!(node instanceof ast.FunctionStatement) &&
        !(node instanceof ast.StructStatement) &&
        !(node instanceof ast.ExternStatement) &&
        !(node instanceof ast.VariableDeclaration) &&
        !(node instanceof ast.ExternStatement) &&
        !(node instanceof ast.MethodStatement)) {
      this._updateLines(myToken);
      throw new Error('Only structs, functions, or methods may be exported');
    }

    node.ex = true;
    return node;
  }
};

exports['import'] = {
  nud: function(value, loc) {
    var modules = [];
    var id = null;

    do {
      id = this.expect('identifier');
      modules.push(id[1]);
    } while (this.peek('.'));

    return new ast.ImportStatement(modules);
  }
};
