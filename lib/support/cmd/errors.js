var clc = require('cli-color');

var highlight = function(line) {
  // Split line into comment and not comment
  var split = line.split('#');
  if (split.length > 1)
    split = [split[0], '#' + split.slice(1).join('#')];

  // Highlight keywords
  split[0] = split[0].replace(/\b(return)\b/g, function(s) {
    return clc.green(s);
  });

  // Highlight keywords 2
  split[0] = split[0].replace(/\b(true|false|let|mut|out|struct|function|method|if|else|for|upto|downto|while|export)\b/g, function(s) {
    return clc.cyan(s);
  });

  // Highlight type names
  split[0] = split[0].replace(/\b([A-Z][a-z0-9]*|int|float|str|list|func|void)\b/g, function(s) {
    return clc.magenta(s);
  });

  // Highlight operators
  split[0] = split[0].replace(/(\*|\*\*|\|\||\+|\-|\/|\=\=|\=|\%|\&\&|<|>)/g, function(s) {
    return clc.blue(s);
  });

  // Highlight strings
  split[0] = split[0].replace(/"[^\\"\r\n]*(?:\\.[^"\\]*)*"/g, function(s) {
    return clc.yellow(s);
  });

  // Fade back comments in a line a bit
  split[1] = clc.italic.blackBright(split[1]);

  return split.join('');
};

exports.printContext = function(src, err) {
  var lines = src.split(/\r?\n/g);
  var start = Math.max(0, err.start.line - 3);
  var end = Math.min(lines.length, err.end.line + 2);
  var color = clc.red.bgWhite;

  var splitWhitespace = function(line) {
    var i = (line.match(/\S/) || {index: 0}).index;
    return [line.substr(0, i), line.substr(i)];
  };
  var lineHeader = function() {
    var base = null;
    if (lineNum >= err.start.line && lineNum <= err.end.line)
      base = color(lineNum + ':');
    else
      base = clc.blackBright(lineNum + ':');
    return base + ' ';
  };

  for (var i=start; i<end; i++) {
    var line = lines[i];
    var lineNum = i + 1;

    // Intermediate lines fully highlighted
    if (i+1 > err.start.line && i+1 < err.end.line) {
      var l = splitWhitespace(line);
      console.error(lineHeader() + l[0] + color(l[1]));

    // If the error is only on one line, special case
    } else if (i+1 == err.start.line && i+1 == err.end.line) {
      var t = lineHeader();
      t += highlight(line.substr(0, err.start.col));
      t += color(line.substring(err.start.col, err.end.col));
      t += highlight(line.substr(err.end.col));
      console.error(t);

    // Highlight leading portion
    } else if (i+1 == err.start.line) {
      var t = lineHeader();
      t += highlight(line.substr(0, err.start.col));
      t += color(line.substr(err.start.col));
      console.error(t);

    // Highlight trailing portion
    } else if (i+1 == err.end.line) {
      var t = lineHeader();
      var l = splitWhitespace(line.substr(0, err.end.col));
      t += l[0] + color(l[1]);
      t += highlight(line.substr(err.end.col));
      console.error(t);

    // Don't highlight anything else
    } else {
      console.error(lineHeader() + highlight(line));
    }
  }
};