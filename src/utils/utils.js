/* eslint-disable no-underscore-dangle */
let changes = [];
function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
function recordChangesToObjField(obj, field) {
  Object.defineProperty(obj, field, {
    get() {
      return this._current;
    },
    set(value) {
      changes.push(JSON.stringify(value, getCircularReplacer()));
      this._current = value;
    },
  });
}
function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];
  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;
  // Add listener to react fibers tree so changes can be recorded
  recordChangesToObjField(parent, 'current');
  // Reassign react fibers tree to record initial state
  parent.current = parent.current;
}
const getRenders = () => changes.map((change) => JSON.parse(change));

function traverseWith(fiber, callback) {
  if (fiber.child) {
    callback(fiber.child);
    traverseWith(fiber.child, callback);
  }
  if (fiber.sibling) {
    callback(fiber.sibling);
    traverseWith(fiber.sibling, callback);
  }
}

module.exports = { mountToReactRoot, getRenders, traverseWith };
