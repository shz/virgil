var TypeRef = require('./typeref')
  , canned = require('./canned')
  ;

exports.equal = function(t1, t2) {
  if (t1 == t2)
    return true;
  if (t1.name != t2.name)
    return false;
  if (t1.isGeneric && exports.equal(t2, canned['null']))
    return true;
  if (t2.isGeneric && exports.equal(t1, canned['null']))
    return true;
  if (t1.generics.length != t2.generics.length)
    return false;

  for (var i=0; i<t1.generics.length; i++)
    if (!exports.equal(t1.generics[i], t2.generics[i]))
      return false;

  return true;
};

exports.make = function(base, generics) {
  generics = generics || [];

  if (generics.length == 0 && canned.hasOwnProperty(base))
    return canned[base];

  return new TypeRef(base, generics);
};
