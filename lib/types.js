var TypeRef = exports.TypeRef = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
};
TypeRef.prototype.toString = function() {
  var output = 'type ' + this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};

exports.INFERRED = new TypeRef('inferred');
