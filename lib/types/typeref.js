var TypeRef = module.exports = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
  this.builtin = ['list', 'int', 'float', 'str', 'bool'].indexOf(type) > -1;
  this.numeric = type == 'int' ||
                 type == 'float';
};
TypeRef.prototype.toString = function() {
  var output = this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};
