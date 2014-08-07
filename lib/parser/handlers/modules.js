var ast = require('../../ast')
  ;

exports['export'] = {
  nud: function() {
    var myToken = this.cur;
    var node = this.statement();
    if (!(node instanceof ast.FunctionStatement) &&
        !(node instanceof ast.StructStatement) &&
        !(node instanceof ast.MethodStatement)) {
      this._updateLines(myToken);
      throw new Error('Only structs, functions, or methods may be exported');
    }

    node.ex = true;
    return node;
  }
};

exports['import'] = {

};
