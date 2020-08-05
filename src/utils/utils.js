/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */

class ReactPinpoint {
  constructor() {
    this.changes = [];
  }

  getCircularReplacer() {
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

  recordChangesToObjField(obj, field) {
    Object.defineProperty(obj, field, {
      get() {
        return this._current;
      },
      set(value) {
        this.changes.push(JSON.stringify(value, this.getCircularReplacer()));
        this._current = value;
      },
    });
  }

  mountToReactRoot(reactRoot) {
    // Reset changes
    this.changes = [];
    // Lift parent of react fibers tree
    const parent = reactRoot._reactRootContainer._internalRoot;
    const { current } = parent;
    // Add listener to react fibers tree so changes can be recorded
    this.recordChangesToObjField(parent, 'current');
    // Reassign react fibers tree to record initial state
    parent.current = current;
  }

  traverseWith(fiber, callback) {
    callback(fiber);
    if (fiber.child) {
      this.traverseWith(fiber.child, callback);
    }
    if (fiber.sibling) {
      this.traverseWith(fiber.sibling, callback);
    }
  }

  flattenTree(tree) {
    // Closured array for storing fibers
    const arr = [];
    // Closured callback for adding to arr
    const callback = (fiber) => {
      arr.push(fiber);
    };
    this.traverseWith(tree, callback);
    return arr;
  }

  checkTime(fiber, threshold) {
    return fiber.selfBaseDuration > threshold;
  }

  /**
   *
   * @param {number} threshold The rendering time to filter for.
   */
  getAllSlowComponentRenders(threshold, changesArray) {
    const slowRenders = changesArray
      .map(JSON.parse) // Convert objects to JSON
      .map(this.flattenTree) // Flatten tree
      .flat() // Flatten 2d array into 1d array
      .filter((fiber) => this.checkTime(fiber, threshold)); // filter out all that don't meet threshold
    // Return any times greater than 16ms
    return slowRenders;
  }
}

module.exports = { ReactPinpoint };
