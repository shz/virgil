exports.params = function(args) {
  return args.map(function(arg) {
    return arg[0] + ': ' + this.type(arg[1]);
  }, this).join(', ');
};
