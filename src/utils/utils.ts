/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */
import Tree from './Tree';
let changes = [];
const processedFibers = new WeakMap();
const fiberMap = new Map();

function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  function getSet(obj, propName) {
    const newPropName = `_${propName}`;
    obj[newPropName] = obj[propName];
    Object.defineProperty(obj, propName, {
      get() {
        return this[newPropName];
      },
      set(newVal) {
        this[newPropName] = newVal;
        changes.push(new Tree(this[newPropName], fiberMap, processedFibers));
      },
    });
  }

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;
  changes.push(new Tree(parent.current, fiberMap, processedFibers));
  // Add listener to react fibers tree so changes can be recorded
  getSet(parent, 'current');
  return changes;
}

function scrubCircularReferences(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there

  const scrubChanges = changes.map(commit => {
    return commit.componentList.map(component => {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}

function removeCircularRefs(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there

  const scrubChanges = changes.map(commit => {
    return commit.componentList.map(component => {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(changes, threshold) {
  // referencing "changes" in the global scope
  const scrubChanges = removeCircularRefs(changes);

  // rework this so that we can use the pre-serialized data
  const result = scrubChanges.map(commit => {
    return commit.filter(component => component.self_base_duration >= threshold);
  });

  return result;
}

// function checkTime(fiber, threshold) {
//   return fiber.selfBaseDuration > threshold;
// }

// function getComponentRenderTime(componentName) {
//   console.log("changes", changes);
//   console.log("component name", componentName);

//   return "what";
// }

function getTotalRenderCount() {
  const componentMap = new Map();

  // loop through each commit
  // for each commit, loop through the array of trees
  // for each tree
  // check if the current component exist in the map before adding on or creating a new key
  changes.forEach((commit, commitIndex) => {
    commit.componentList.forEach((component, componentIndex) => {
      if (!componentMap.has(component.uID)) {
        componentMap.set(component.uID, {renderCount: 1});
      } else {
        if (didFiberRender(changes[commitIndex ? commitIndex - 1 : 0].componentList[componentIndex], component)) {
          componentMap.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  return componentMap;
}

function didFiberRender(prevFiber, nextFiber) {
  switch (nextFiber.tag) {
    case 0:
    case 1:
    case 3:
      // case 5:
      return (nextFiber.effectTag & 1) === 1;
    default:
      return (
        prevFiber.memoizedProps !== nextFiber.memoizedProps ||
        prevFiber.memoizedState !== nextFiber.memoizedState ||
        prevFiber.ref !== nextFiber.ref
      );
  }
}

function didHooksChange(previous, next) {
  if (previous == null || next == null) {
    return false;
  }
  if (
    next.hasOwnProperty('baseState') &&
    next.hasOwnProperty('memoizedState') &&
    next.hasOwnProperty('next') &&
    next.hasOwnProperty('queue')
  ) {
    if (next.memoizedState !== previous.memoizedState) {
      return true;
    } else {
    }
  }
  return false;
}

function getChangedKeys(previous, next) {
  if (previous == null || next == null) {
    return null;
  }
  // We can't report anything meaningful for hooks changes.
  if (
    next.hasOwnProperty('baseState') &&
    next.hasOwnProperty('memoizedState') &&
    next.hasOwnProperty('next') &&
    next.hasOwnProperty('queue')
  ) {
    return null;
  }

  const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  const changedKeys = [];
  // for (const key of keys) {
  //   if (previous[key] !== next[key]) {
  //     changedKeys.push(key);
  //   }
  // }
  keys.forEach(key => {
    if (previous[key] !== next[key]) {
      changedKeys.push(key);
    }
  });

  return changedKeys;
}

export {mountToReactRoot, getAllSlowComponentRenders};
