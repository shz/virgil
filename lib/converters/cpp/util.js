exports.makeReference = function(node) {
  var namespace = node.extern && node.extern.namespace;
  var ret = node.name;
  if (namespace)
    ret =  namespace + '::' + ret;
  return ret;
};

exports.isValueType = function(t) {
  return [ 'int'
         , 'float'
         , 'bool'
         , 'void'
         , 'str'
         , 'func'
         ].indexOf(t.name) >= 0;
};

exports.expressionize = function(s, name) {
  s = s.split(';').map(function(s) {
    return s.replace(/\s*$/, ''); // right trim
  }).join(';\n');
  var ret = '[=](){\n' + s;
  if (name)
    ret += 'return ' + name + ';\n';
  ret += '}()';
  return ret;
};
