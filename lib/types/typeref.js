var TypeRef = module.exports = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
  this.builtin = type[0].toUpperCase() != type[0];
  this.numeric = type == 'int' ||
                 type == 'float';
};
TypeRef.prototype.toString = function() {
  var output = this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};
