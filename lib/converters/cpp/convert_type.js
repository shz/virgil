var types = require('../../types')
  , util = require('./util')
  ;

var HEAP = 'heap';
var STACK = 'stack';
var REF = 'ref';
var CREATE_HEAP = 'create_heap';

var pointer = function(s) {
  return s + '*';
};

var createPointer = function(s) {
  return 'new (virgil::curPool) ' + s;
};

var reference = function(s) {
  return s + '*';
};

var base = function(t, g) {
  if (t == types.canned['int'])
    return 'int';
  if (t == types.canned['float'])
    return 'double';
  if (t == types.canned['bool'])
    return 'bool';
  if (t == types.canned['void'])
    return 'void';
  if (t == types.canned['str']) {
    g.libIncludes['string'] = true;
    g.libIncludes['sstream'] = true;
    return 'std::string';
  }
  if (t.name == 'list') {
    g.libIncludes['vector'] = true;
    return 'std::vector<' + convert(t.generics[0], HEAP, g) + '>';
  }
  if (t.name == 'func') {
    g.libIncludes['functional'] = true;

    var s = 'std::function<' + convert(t.generics[t.generics.length - 1], HEAP, g) + '(';
    s += t.generics.slice(0, t.generics.length - 1).map(function(t) {
      return convert(t, REF, g);
    }).join(', ');
    s += ')>';
    return s;
  }

  if (t.isGeneric)
    return t.name.substr(1);

  var s = t.def ? util.makeReference(t.def) : t.name;
  if (t.generics.length) {
    s += '<';
    s += t.generics.map(function(t) {
      return convert(t, HEAP, g);
    }).join(', ');
    s += '>';
  }
  return s;
};

var convert = module.exports = function(t, context, g) {
  var b = base(t, g);


  // Special case for reference strings
  if (t == types.canned['str'] && context == REF)
    return 'const ' + b + '&';// reference(b);

  // Force stack allocations where appropriate
  if (t.isGeneric || context == STACK || util.isValueType(t))
    return b;

  if (context == HEAP)
    return pointer(b);
  if (context == REF)
    return reference(b);
  if (context == CREATE_HEAP)
    return createPointer(b);

  throw new Error('Unknown context ' + context);
};
