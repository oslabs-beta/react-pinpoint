let changes = [];

// used for parsing a node to a usable form (with )
function parseNode(node) {
  return {
    type: node.type,
    selfBaseDuration: node.selfBaseDuration,
    state: node?.stateNode?.state?.next,
    child: node.child && parseNode(node.child),
    sibling: node.sibling && parseNode(node.sibling),
  };
}

function recordChangesToObjField(obj, field) {
  Object.defineProperty(obj, field, {
    get() {
      return this._current;
    },
    set(value) {
      changes.push(parseNode(value));
      console.log(value);
      this._current = value;
    },
  });
}

// used to take important details of a node and exluce circular references
// this allows for Puppeteer to stringify the result
function parseCompletedNode(node) {
  delete node.child;
  delete node.sibling;
  return {
    type: node?.type?.name,
    state: node.state,
    selfBaseDuration: node.selfBaseDuration,
  };
}

function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;
  const {current} = parent;

  // Add listener to react fibers tree so changes can be recorded
  recordChangesToObjField(parent, 'current');

  // Reassign react fibers tree to record initial state
  parent.current = current;
  return changes;
}

function traverseWith(fiber, callback) {
  callback(fiber);
  if (fiber.child) {
    traverseWith(fiber.child, callback);
  }
  if (fiber.sibling) {
    traverseWith(fiber.sibling, callback);
  }
}

function flattenTree(tree) {
  // Closured array for storing fibers
  const arr = [];
  // Closured callback for adding to arr
  const callback = fiber => {
    arr.push(fiber);
  };
  traverseWith(tree, callback);
  return arr;
}

function checkTime(fiber, threshold) {
  return fiber.selfBaseDuration > threshold;
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold: number) {
  const slowRenders = changes
    .map(flattenTree) // Flatten tree
    .flat() // Flatten 2d array into 1d array
    .filter(fiber => checkTime(fiber, threshold)) // filter out all that don't meet threshold
    .map(parseCompletedNode); // removes circular references
  return slowRenders;
}

module.exports = {mountToReactRoot, getAllSlowComponentRenders, traverseWith};
