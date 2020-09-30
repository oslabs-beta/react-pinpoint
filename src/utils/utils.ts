/* eslint-disable no-prototype-builtins */
/* eslint-disable no-empty */

let changes = [];
const processedFibers = new WeakMap();
const fiberMap = new Map();
const testWeakSet = new WeakSet();
const stateNodeWeakSet = new WeakSet();

class TreeNode {
  // will add type after ;D
  uID: any;
  elementType: any;
  selfBaseDuration: any;
  memoizedProps: any;
  memoizedState: any;
  effectTag: any;
  ref: any;
  fiberName: any;
  updateQueue: any;
  tag: any;
  updateList: any[];
  stateNode:
    | {
        state: any;
        updater: any;
      }
    | string;
  parent: any;
  child: any;
  sibling: any;
  children: any;

  constructor(fiberNode, uID) {
    this.uID = uID;
    const {elementType, selfBaseDuration, memoizedState, memoizedProps, effectTag, tag, ref, updateQueue, stateNode} = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.fiberName = getElementName(fiberNode);
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.
    this.tag = tag;
    this.updateList = [];
    this.children = [];

    // stateNode can contain circular references depends on the fiber node
    if (tag === 5) {
      this.stateNode = 'host component';
    } else if (tag === 3) {
      this.stateNode = 'host root';
    } else {
      this.stateNode = stateNode;
    }

    // check the fiber and the attach the spy
    // find a way to store the update function variable and result here
    // if ((tag === 1 || tag === 5) && this.stateNode && this.stateNode.state) {
    //   /*
    //     enqueueReplaceState (inst, payload, callback)
    //     enqueueForceUpdate (inst, callback)
    //     enqueueSetState    (inst, payload, callback)
    //   */
    //   if (this.stateNode.updater) {
    //     const cb = (update, payload) => {
    //       this.updateList.push([update, payload]);
    //     };
    //     // spying
    //     // if (!stateNodeWeakSet.has(this.stateNode)) {
    //     //   stateNodeWeakSet.add(this.stateNode);
    //     //   Spy(this.stateNode.updater, "enqueueSetState", cb);
    //     //   Spy(this.stateNode.updater, "enqueueReplaceState", cb);
    //     //   Spy(this.stateNode.updater, "enqueueForceUpdate", cb);
    //     // }
    //   }
    // }

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log('attaching a spy', memoizedState.queue);
      // getSet(memoizedState, "baseState");
      // getSet(fiber.memoizedState, "baseUpdate");
      // getSet(fiber.memoizedState, "memoizedState");
      // getSet(fiber.memoizedState, "next");

      const cb = (...args) => {
        this.updateList.push([...args]);
      };
      //type is function and thus it's unique
      // if (!testWeakSet.has(fiberNode.type)) {
      //   testWeakSet.add(fiberNode.type);
      //   SpyUseState(memoizedState.queue, "dispatch", cb);
      //   SpyUseState(memoizedState.queue, "lastRenderedReducer", cb);
      // }
    }
  }

  addChild(treeNode) {
    // remove other uneccessary properties
    this.child = treeNode;
  }

  addSibling(treeNode) {
    // if (!node) return;
    this.sibling = treeNode;
  }

  addParent(treeNode) {
    // if (!node) return;
    this.parent = treeNode;
  }

  toSerializable() {
    const newObj = {};
    const omitList = ['memoizedProps', 'memoizedState', 'updateList', 'updateQueue', 'ref', 'elementType', 'stateNode'];
    // transform each nested node to just ids where appropriate
    const keys = Object.keys(this);
    for (const key in keys) {
      if (omitList.indexOf(key) < 0) {
        switch (key) {
          case 'parent':
          case 'sibling':
          case 'child':
            newObj[`${key}ID`] = this[key].uID;
            break;
          case 'children': // sorry for this monstrosity, :D
            newObj[`childrenIDs`] = this[key].map(treeNode => treeNode.uID);
            break;
          default:
            newObj[key] = this[key];
        }
      }
    }

    return newObj;
  }
}

class Tree {
  uniqueId: number;
  componentList: any[];
  effectList: any[];
  root: any;
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  constructor(rootNode) {
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode, null);
  }

  processNode(fiberNode, previousTreeNode) {
    // id used to reference a fiber in fiberMap
    let id = undefined;
    // using a unique part of each fiber to identify it.
    // both current and alternate only 1 reference to this unique part
    // which we can use to uniquely identify a fiber node even in the case
    // of current and alternate switching per commit/
    let uniquePart = undefined;

    // unique part of a fiber node depends on its type.
    if (fiberNode.tag === 0 || fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9 || fiberNode.tag === 15) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else if (fiberNode.tag === 7) {
      uniquePart = fiberNode;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    // if this is a unique fiber (that both "current" and "alternate" fiber represents)
    // then add to the processedFiber to make sure we don't re-account this fiber.
    if (!processedFibers.has(uniquePart)) {
      id = this.uniqueId;
      this.uniqueId++;

      fiberMap.set(id, fiberNode);
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    // If it's a HostRoot with a tag of 3
    // create a new TreeNode
    if (fiberNode.tag === 3) {
      this.root = new TreeNode(fiberNode, id);
      this.componentList.push(this.root); // push a copy

      if (fiberNode.child) {
        this.processNode(fiberNode.child, this.root);
      }
    } else {
      const newNode = new TreeNode(fiberNode, id);
      newNode.addParent(previousTreeNode);
      previousTreeNode.children.push(newNode);
      previousTreeNode.addChild(newNode);
      this.componentList.push(newNode);

      if (fiberNode.child) {
        this.processNode(fiberNode.child, newNode);
      }
      if (fiberNode.sibling) {
        this.processSiblingNode(fiberNode.sibling, newNode, previousTreeNode);
      }
    }
  }

  processSiblingNode(fiberNode, previousTreeNode, parentTreeNode) {
    let uniquePart = undefined;
    let id = undefined;
    if (fiberNode.tag === 0 || fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else if (fiberNode.tag === 7) {
      uniquePart = fiberNode;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    if (!processedFibers.has(uniquePart)) {
      id = this.uniqueId;
      this.uniqueId++;
      fiberMap.set(id, fiberNode);

      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    const newNode = new TreeNode(fiberNode, id);
    newNode.addParent(parentTreeNode);
    parentTreeNode.children.push(newNode);
    previousTreeNode.addSibling(newNode);
    this.componentList.push(newNode);

    if (fiberNode.child) {
      this.processNode(fiberNode.child, newNode);
    }
    if (fiberNode.sibling) {
      this.processSiblingNode(fiberNode.sibling, newNode, parentTreeNode);
    }
  }
}

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
        console.log(`${obj} ${propName}`, this[newPropName]);
        changes.push(new Tree(this[newPropName]));

        console.log('CHANGES', changes);
        // console.log("Fiber STORE: ", processedFibers);
        // console.log("testweakset after", testWeakSet);
        // console.log("statenodeweakset", stateNodeWeakSet);
        // console.log("fiber map:", fiberMap);
        // getTotalRenderCount();
        // whatChanged();
      },
    });
  }

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;

  console.log('ROOT FIBER', parent.current);
  changes.push(new Tree(parent.current));

  // after initial
  // console.log("Initial processed fibers", processedFibers);
  console.log('initial fiberMap', fiberMap);

  // Add listener to react fibers tree so changes can be recorded
  getSet(parent, 'current');
  // Reassign react fibers tree to record initial state
  // parent.current = current;
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

/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold) {
  let slowRenders = changes.map(commit => {
    return commit.componentList.map(component => {
      delete component.memoizedProps;
      delete component.memoizedState;
      delete component.updateList;
      delete component.updateQueue;
      delete component.ref;
      delete component.elementType;
      delete component.stateNode;

      return {
        ...component,
      };
    });
  });

  slowRenders = slowRenders.map(commit => {
    return commit.filter(component => component.selfBaseDuration >= threshold);
  });

  return slowRenders;
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

function getElementName(fiber) {
  switch (fiber.tag) {
    case 1:
      return fiber.elementType.name;
    case 3:
      return 'Host Root - The element you used to render the React App';
    case 5:
      return `${fiber.elementType}${fiber.elementType.className ? `.${fiber.elementType.className}` : ''}`;
    default:
      return `${fiber.elementType}`;
  }
}

module.exports = {mountToReactRoot, getAllSlowComponentRenders};
