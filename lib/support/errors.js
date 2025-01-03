var clc = require('cli-color')
  , tokenizer = require('../tokenizer')
  ;

var Line = function Line(number, content, hasError) {
  this.number = number;
  this.content = content;
  this.hasError = hasError || false;
  this.errorRange = [0, 0];
};
Line.prototype.toString = function() {
  return this.content;
};
Line.prototype.highlight = function(highlighter) {
  if (!highlighter) {
    highlighter = function(t) { return t.value };
  }

  var tokens = null;
  try {
    tokens = tokenizer(this.content);
  } catch (err) {
    return highlighter({name: 'unknown', value: this.content}, true);
  }

  var s = '';
  tokens.forEach(function(t) {
    if (t.name == 'newline' || t.name == 'eof') {
      // Do nothing
    } else {
      var hasError = this.hasError &&
                     t.loc.start.col >= this.errorRange[0] &&
                     t.loc.end.col <= this.errorRange[1];
      s += highlighter(t, hasError);
    }
  }, this);

  // console.log('in', this.content, 'out', s);

  return s;
};

var Context = exports.Context = function Context(err, filename) {
  if (typeof err == 'string') {
    filename = err;
    err = undefined;
  }
  this.err = err;
  this.filename = filename || (err && err.filename);
  this.lines = [];
};
Context.prototype.addLine = function(number, content) {
  this.lines.push(new Line(number, content));
};
Context.prototype.toString = function() {
  return this.lines.join('\n');
};
Context.prototype.gutter = function(pad) {
  pad = pad || '';
  var length = 0;
  this.lines.forEach(function(line) {
    var l = line.number.toString().length;
    if (l > length) {
      length = l;
    }
  });

  return this.lines.map(function(line) {
    var s = line.number.toString();
    var padding = length - s.length;
    for (var i=0; i<padding; i++) {
      s = pad + s;
    }

    return s;
  });
};
Context.prototype.highlight = function(highlighter) {
  return this.lines.map(function(line) { return line.highlight(highlighter) });
};

exports.getContext = function(src, filename, index, padding) {
  if (typeof filename != 'string' && filename !== undefined) {
    padding = index;
    index = filename;
    filename = undefined;
  }
  padding = padding || 3;

  var lines = src.split(/\r?\n/);
  var start = Math.max(0, (typeof index == 'number' ? index : index.start) - padding - 1);
  var end = Math.min(lines.length, (typeof index == 'number' ? index : index.end) + padding);

  var context = new Context(filename);
  for (var i=start; i<end; i++) {
    context.addLine(i + 1, lines[i]);
  }

  return context;
};

exports.getErrorContext = function(err, padding) {
  var context = exports.getContext(err.src, err.filename, {
    start: err.loc.start.line,
    end: err.loc.end.line
  });
  context.err = err;

  context.lines.forEach(function(line) {
    if (line.number >= err.loc.start.line && line.number <= err.loc.end.line) {
      var range = [0, line.content.length];
      if (err.loc.start.line == line.number) {
        range[0] = err.loc.start.col;
      }
      if (err.loc.end.line == line.number) {
        range[1] = err.loc.end.col;
      }
      line.hasError = true;
      line.errorRange = range;
    }
  });

  return context;
};

exports.printErrorContext = function(err, showFilename, showMessage) {
  var context = exports.getErrorContext(err);
  var highlighted = context.highlight(exports.highlighters.console);
  var gutter = context.gutter(' ');

  if (context.filename && showFilename !== false) {
    console.error('Error in ' + context.filename + ':');
  }
  highlighted.forEach(function(line, i) {
    var g = gutter[i] + '|';
    if (context.lines[i].hasError) {
      g = clc.red.bgWhite(g);
    }
    console.error(g + ' ' + line);
  });
  if (showMessage !== false) {
    console.error('\n' + err.message);
  }
};

var mapToken = function(token, hasError) {
  if (hasError) {
    return 'error';
  }

  var keywords = [ 'true', 'false', 'if', 'else', 'function', 'method', 'struct'
                 , 'return', 'while', 'for', 'upto', 'downto', 'break', 'continue'
                 , 'try', 'catch', 'export', 'import', 'lambda', 'null', 'void'
                 , 'extern', 'new', 'default', 'let', 'let!', 'mut', 'mut!'
                 ];

  var type = 'normal';
  if (keywords.indexOf(token.name) >= 0) {
    type = 'keyword';
  } else if (token.name == 'comment') {
    type = 'comment';
  } else if (token.name == 'identifier' && token.value.match(/^[A-Z]\w+$/)) { // class
    type = 'type';
  } else if (token.name == 'gref') { // typeref
    type = 'type';
  } else if (token.name == 'string') { // string
    type = 'string';
  } else if (token.name != 'identifier') { // not identifiers
    type = 'operator';
  }

  return type;
};

exports.highlighters = {
  console: function(token, hasError) {
    var type = mapToken(token, hasError);
    return { normal: function(s) { return s }
           , keyword: clc.cyan
           , comment: clc.italic.blackBright
           , type: clc.green
           , string: clc.yellow
           , operator: clc.blue
           , error: clc.red.bgWhite
           }[type](token.value);
  },

  html: function(token, hasError) {
    var encode = function(s) {
      return s.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
    };
    var type = mapToken(token);
    var val = encode(token.value);
    val = '<span class="token ' + type + '">' + val + '</span>';
    if (hasError) {
      val = '<span class="error">' + val + '</span>';
    }

    return val;
  }
};
