//
// Experimental small interpreter for Virgil code.  Speed is probably
// very slow.
//
// Core concepts:
//  * Values are represented by their AST equivalents.  This may seem
//    a bit weird, but it allows some cool reusability.
//
//  * Slot - Information about a slot in a stack frame (name, value, type, immutability)
//  * SlotList - List of slots (duh) for a single scope
//  * SlotStack - Stack of SlotLists, utility for setting/getting slots by name
//


exports.run = require('./run');
exports.evaluateExpression = require('./expression');
