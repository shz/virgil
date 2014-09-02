var TypeRef = require('./typeref')
  , util = require('./util')
  ;

var walk = function(t1, t2, accum) {
  if (!t1.hasGenericReference() && !util.equal(t1, t2))
    throw new Error('Type ' + t1.toString() + ' does not equal type ' + t2.toString());

  if (t1.isGeneric)
    accum.push([t1.name, t2]);
  else if (t1.name != t2.name)
    throw new Error('Generic mismatch; ' + t1.name + ' and ' + t2.name);
  else if (t1.generics.length != t2.generics.length)
    throw new Error('Generic length mismatch; ' + t1.toString() + ' and ' + t2.toString());
  else
    for (var i=0; i<t1.generics.length; i++)
      walk(t1.generics[i], t2.generics[i], accum);
};

//
// Resolves generic type names to real types, given a template and a
// conrete type spec.
//
// E.g. given list<list<'T>> and list<list<int>> resolve 'T to int
//
exports.resolve = function(proto, spec) {
  var accum = [];
  walk(proto, spec, accum);

  var result = {};
  for (var i=0; i<accum.length; i++) {
    var a = accum[i];
    if (result[a[0]])
      throw new Error('Duplicate definition for ' + a[0] + ': ' +
        result[a[0]].toString() + ' and ' + a[1].toString());

    result[a[0]] = a[1];
  }

  return result;
};
