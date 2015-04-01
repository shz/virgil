var Slot = module.exports = function Slot(name, type, value, immutable) {
  this.name = name;
  this.type = type;
  this.value = value;
  this.immutable = true;
};

Slot.wrap = function(thing) {
  if (thing.constructor == Slot) {
    return Slot;
  }

  // Creates a dummy slot
  return new Slot('$anonymous', null, thing, true);
};
