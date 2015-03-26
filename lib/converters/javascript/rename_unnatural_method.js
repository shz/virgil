//
// Renamed an unnatural method to include information about the
// struct the method is defined on.  This is useful for avoiding
// namespace collisions when a method with the same name is defined
// on different types.
//
module.exports = function(node) {
  return node.name + '$' + node.args[0][1].toString().replace(/\s+/, '').replace(/['<>,]/g, '_');
};
