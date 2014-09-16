var builtins = [ 'int'
              , 'str'
              , 'bool'
              , 'float'
              , 'list'
              , 'method'
              , 'func'
              , 'void'
              ];

var TypeRef = module.exports = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
  this.builtin = builtins.indexOf(type) > -1;
  this.numeric = type == 'int' ||
                 type == 'float';
  this.def = null;
  this.isGeneric = type[0] == '\'';
};

TypeRef.prototype.toString = function() {
  var output = this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};

TypeRef.prototype.hasGenericReference = function() {
  if (this.isGeneric)
    return true;

  for (var i=0; i<this.generics.length; i++)
    if (this.generics[i].hasGenericReference())
      return true;

  return false;
};

TypeRef.prototype.extractGenerics = function() {
  var ret = {};

  if (this.isGeneric)
    ret[this.name] = this;

  for (var i=0; i<this.generics.length; i++) {
    var temp = this.generics[i].extractGenerics();
    for (var i in temp) if (temp.hasOwnProperty(i))
      if (!ret.hasOwnProperty(i))
        ret[i] = temp[i];
  }

  return ret;
};
