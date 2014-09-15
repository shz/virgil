var GlobalState = module.exports = function() {
  this.libIncludes = {};
  this.localIncludes = {};
};

GlobalState.prototype = {
  indent: function(f) {
    return (f() || '').split('\n')
                      .map(function(l) { return '  ' + l })
                      .join('\n');
  }
};
