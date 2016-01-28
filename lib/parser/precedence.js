//
// The numbers here specify "binding power" as used by a Pratt parser
// (both lbp and rbp here, unless explicitly overriden in the led
// handler for this token -- which, yes, does happen).  Higher binding
// power operators will grab operands away from lower binding power
// operands.  Examples:
//
//   1 + 2 / 3 -- If / is higher, equivalent to 1 + (2 / 3)
//
module.exports = { 'newline': 0
                 , 'else': 0
                 , 'new': 0
                 , ',':  0
                 , ')':  0
                 , '{':  0
                 , '}':  0
                 , ';':  0
                 , ']':  0

                 , '=':  1
                 , '?':  5 // Ternary; lbp only, rbp is pulled from :
                 , ':':  5 // Used for ternary ? rbp too
                 , '&&': 6
                 , '||': 7

                 , '==': 18
                 , '!=': 18
                 , '>':  20
                 , '<':  20
                 , '>=': 20
                 , '<=': 20
                 , '!':  21

                 , '+':  30
                 , '-':  30
                 , '%':  31
                 , '**': 32
                 , '*':  33
                 , '/':  34


                 , '.':  50
                 , '[':  100
                 , '(':  1000
                 };

// FIXME - Full out tests for precedence!
