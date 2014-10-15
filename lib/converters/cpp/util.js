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
