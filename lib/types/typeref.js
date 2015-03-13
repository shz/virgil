var builtins = [ 'int'
              , 'str'
              , 'bool'
              , 'float'
              , 'list'
              , 'method'
              , 'func'
              , 'void'
              , 'null'
              , 'datetime'
              ];

var TypeRef = module.exports = function(type, generics) {
  this.name = type;
  this.generics = generics || [];
  this.builtin = builtins.indexOf(type) > -1;
  this.numeric = type == 'int' ||
                 type == 'float';
  this.def = null; // The ast node that defines the referee type (e.g. StructStatement)
  this.original = null; // Original, generic, TypeRef that created this via resolveGenerics()
  this.isGeneric = type[0] == '\'';
};

//
// Converts back to the source code level definition of the type
//
TypeRef.prototype.toString = function() {
  var output = this.name;
  if (this.generics.length)
    output += '<' + this.generics.join(', ') + '>';
  return output;
};

//
// Recursively walks the type to determine if it has generic references
//
TypeRef.prototype.hasGenericReference = function() {
  if (this.isGeneric)
    return true;

  for (var i=0; i<this.generics.length; i++)
    if (this.generics[i].hasGenericReference())
      return true;

  return false;
};

//
// Recursively walks the type to generare a map of generic identifier
// to TypeRef.
//
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

//
// Creates a new TypeRef, with generic types resolved using the
// specified generic resolution map.
//
TypeRef.prototype.resolveGenerics = function(map) {
  if (this.isGeneric) {
    if (map.hasOwnProperty(this.name))
      return map[this.name];
    else
      return this;
  }

  if (!this.hasGenericReference())
    return this;

  var t = new TypeRef(this.name, this.generics.map(function(g) {
    return g.resolveGenerics(map);
  }));
  t.original = this;
  return t;
};

//
// Finds the type definition in the supplied node's scope, if this is a
// user defined type.
//
TypeRef.prototype.findDef = function(scope) {
  if (this.builtin || this.isGeneric) {
    return;
  }
  throw new Error('TODO');
};
