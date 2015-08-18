exports.convertUnnaturals = function(map) {
  if (!map) {
    return '';
  }
  var extensions = [];

  Object.keys(map).forEach(function(k) {
    var methods = map[k];
    var type = methods[0].args[0][1];

    var result = '';

    if (type.builtin) {
      if (type.name == 'list') {
        result = 'extension SequenceType where Generator.Element == ' + this.type(type);
      } else {
        result = 'extension ' + this.type(type);
      }
    } else if (!type.isGeneric) {
      result = 'extension ' + this.type(type);
    } else {
      methods[0].throw('Unable to turn into an extension method');
    }

    result += ' {\n';
    result += this.indent(methods.map(function(m) {
      return this.func(m);
    }, this).join('\n'));
    result += '\n}\n';

    extensions.push(result);
  }, this);

  return extensions.join('\n');
};
