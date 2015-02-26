var core = require('./core')
  , Token = require('../tokenizer/token')
  ;

function Literal() {}
function NumericLiteral() {}

function TrueLiteral() {}
function FalseLiteral() {}
function NullLiteral() {}
function DefaultLiteral() {}

function StringLiteral(value, noEscape) {
  if (value instanceof Token) {
    this.value = value.value;
    this.loc = value.loc;
  } else {
    this.value = value;
  }

  this.value = this.value + '';

  // Strip leading " sequences and unescape
  if (!noEscape) {
    this.value = this.value.replace(/^"+/, '').replace(/"$/, '');
    this.value = this.value.replace(/\\(.)/g, function(all, t) {
      switch (t) {
        case 't':
          return '\t';
        case 'r':
          return '\r';
        case 'n':
          return '\n';
        case '\\':
          return '\\';
        case '"':
          return '"';
        default:
          throw new Error('Unrecognized escape sequence \\' + t);
      }
    });
  }
}

function IntegerLiteral(value) {
  if (value instanceof Token) {
    this.value = value.value;
    this.loc = value.loc;
  } else {
    this.value = value;
  }

  this.value = parseInt(this.value, 10);
}

function FloatLiteral(value) {
  if (value instanceof Token) {
    this.value = value.value;
    this.loc = value.loc;
  } else {
    this.value = value;
  }

  this.value = parseFloat(this.value);
}

core.inherits(Literal, core.Expression);
core.inherits(TrueLiteral, Literal);
core.inherits(FalseLiteral, Literal);
core.inherits(NullLiteral, Literal);
core.inherits(DefaultLiteral, Literal);
core.inherits(StringLiteral, Literal);
core.inherits(NumericLiteral, Literal);
core.inherits(IntegerLiteral, NumericLiteral);
core.inherits(FloatLiteral, NumericLiteral);
