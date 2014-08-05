var ast = require('../../ast')
  ;

exports['export'] = {
  nud: function() {
    var myToken = this.cur;
    var node = this.statement();
    if (!(node instanceof ast.FunctionStatement) && !(node instanceof ast.StructStatement)) {
      this._updateLines(myToken);
      throw new Error('Only structs or functions may be exported');
    }

    node.ex = true;
    return node;
  }
};

exports['import'] = {

};
