var Slot = module.exports = function Slot(name, value, type, immutable) {
  if (typeof type == 'boolean') {
    immutable = type;
    type = undefined;
  }

  this.name = name;
  this.type = type;
  this.value = value;
  this.immutable = immutable;
};

Slot.wrap = function(thing) {
  if (thing.constructor == Slot) {
    return thing;
  }

  // Creates a dummy slot
  return new Slot('$anonymous', thing, null, true);
};
Slot.unwrap = function(thing) {
  if (thing.constructor == Slot) {
    return thing.value;
  }

  return thing;
};


Slot.prototype.assign = function(value) {
  if (this.immutable) {
    throw new Error('Attempted to assign to an immutable slot');
  }

  // TODO - Ensure types aren't out of whack

  this.value = value;
};
