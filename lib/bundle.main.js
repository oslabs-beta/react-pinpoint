'use strict';

var path = require('path');

/* eslint-disable no-prototype-builtins */

/* eslint-disable no-case-declarations */
class TreeNode {
  // will add type after ;D
  constructor(fiberNode, uID) {
    this.uID = uID;
    const {elementType, selfBaseDuration, memoizedState, memoizedProps, effectTag, tag, ref, updateQueue, stateNode, type} = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.type = type;
    this.fiberName = getElementName(fiberNode);
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.

    this.tag = tag;
    this.updateList = [];
    this.children = [];
    this.parent = null;
    this.stateNode = stateNode;

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log('attaching a spy', memoizedState.queue);
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
    const omitList = [
      'memoizedProps', // currently working on serialization for this
      'memoizedState', // and this as well
      'updateList',
      'updateQueue',
      'ref',
      'elementType',
      'stateNode', // serialization needed for this?
      'sibling', // maybe not needed
      'type', // some circular references in here that we haven't accounted for
    ]; // transform each nested node to just ids where appropriate

    for (const key of Object.getOwnPropertyNames(this)) {
      if (omitList.indexOf(key) < 0) {
        switch (key) {
          case 'parent':
            newObj['parent_component_id'] = this[key] ? this[key].uID : this[key];
            break;

          case 'fiberName':
            newObj['component_name'] = this[key];
            break;

          case 'sibling':
            newObj['sibling_component_id'] = this[key].uID;
            break;

          case 'selfBaseDuration':
            newObj['self_base_duration'] = this[key];
            break;

          case 'child':
            // probably not needed anymore, this prop seems to be redundant
            // newObj[`${key}ID`] = this[key].uID;
            break;

          case 'children':
            newObj[`children_ids`] = this[key].map(treeNode => treeNode.uID);
            break;

          case 'memoizedState':
            newObj['component_state'] = this[key];
            break;

          case 'memoizedProps':
            if (this[key]) {
              newObj['component_props'] = this[key].hasOwnProperty('children') ? serializeMemoizedProps(this[key]) : this[key];
            } else {
              newObj['component_props'] = this[key];
            } // newObj["component_props"] = this[key];

            break;

          case 'uID':
            newObj['component_id'] = this[key];
            break;

          case 'stateNode':
            let value = null;

            if (this[key]) {
              if (this[key].tag === 5) {
                value = 'host component';
              } else if (this[key].tag === 3) {
                value = 'host root';
              } else {
                value = 'other type';
              }
            }

            newObj['state_node'] = value;
            break;

          default:
            newObj[key] = this[key];
        }
      }
    }

    return newObj;
  }
}

function getElementName(fiber) {
  let name = '';

  switch (fiber.tag) {
    case 0:
    case 1:
      name = fiber.elementType.name || fiber.type.name; // somehow react lazy has a tag of 1, it seems to be grouped with the

      return name;

    case 3:
      name = 'Host Root';
      return name;

    case 5:
      name = fiber.elementType;

      if (fiber.elementType.className) {
        name += `.${fiber.elementType.className}`;
      } else if (fiber.memoizedProps) {
        if (fiber.memoizedProps.className) {
          name += `.${fiber.memoizedProps.className}`;
        } else if (fiber.memoizedProps.id) {
          name += `.${fiber.memoizedProps.id}`;
        }
      }

      if (name.length > 10) {
        // truncate long name
        name = name.slice(0, 10);
        name += '...';
      }

      return name;

    case 6:
      let textValue = fiber.stateNode.nodeValue; // just to help truncating long text value, exceeding 4 chars will get truncated.

      if (textValue.length > 10) {
        textValue = textValue.slice(0, 10);
        textValue = textValue.padEnd(3, '.');
      }

      name = `text: ${textValue}`;
      return name;

    case 8:
      name = 'Strict Mode Zone';
      return name;

    case 9:
      name = fiber.elementType._context.displayName;
      return name;

    case 10:
      name = 'Context'; //

      return name;

    case 11:
      name = fiber.elementType.displayName + '-' + `to:"${fiber.memoizedProps.to}"`;
      return name;

    case 13:
      name = 'Suspense Zone';
      return name;

    case 16:
      name = 'Lazy - ' + fiber.elementType._result.name;
      return name;

    default:
      return `${typeof fiber.elementType !== 'string' ? fiber.elementType : 'unknown'}`;
  }
}

function serializeMemoizedProps(obj) {
  if (!obj) return null; // list of props to omit from the resulting object in return statement

  const omitList = ['props', '_owner', '_store', '_sef', '_source', '_self'];
  let newObj = null; // loop through each prop to check if they exist on omitList
  // if yes then skip, no then include in the object being returned;

  if (Array.isArray(obj)) {
    if (!newObj) newObj = [];

    for (let i = 0; i < obj.length; i++) {
      const nestedChild = {};

      for (const key of Object.getOwnPropertyNames(obj[i])) {
        if (omitList.indexOf(key) < 0) {
          nestedChild[key] = obj[i][key];
        }
      }

      newObj.push(nestedChild);
    }
  } else {
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (omitList.indexOf(key) < 0) {
        if (!newObj) newObj = {};

        if (typeof obj[key] === 'object') {
          newObj[key] = serializeMemoizedProps(obj[key]);
        } else if (typeof obj[key] === 'symbol') {
          newObj[key] = obj[key].toString();
        } else {
          newObj[key] = obj[key];
        }
      }
    }
  }

  return newObj;
}

let fiberMap = undefined;
let processedFibers = undefined;

class Tree {
  // stretch feature
  // a singleton reference
  // a singleton reference
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  constructor(rootNode, FiberMap, ProcessedFibers) {
    fiberMap = FiberMap;
    processedFibers = ProcessedFibers;
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode, null);
  }

  processNode(fiberNode, previousTreeNode) {
    // id used to reference a fiber in fiberMap
    let id = undefined; // using a unique part of each fiber to identify it.
    // both current and alternate only 1 reference to this unique part
    // which we can use to uniquely identify a fiber node even in the case
    // of current and alternate switching per commit/

    let uniquePart = undefined; // skipping special nodes like svg, path

    if (fiberNode.tag === 5) {
      if (fiberNode.elementType === 'svg' || fiberNode.elementType === 'path') return;
    } // unique part of a fiber node depends on its type.

    if (fiberNode.tag === 0 || fiberNode.tag === 9) {
      uniquePart = fiberNode.memoizedProps;
    } else if (fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9 || fiberNode.tag === 15 || fiberNode.tag === 16) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.stateNode;
    } else if (fiberNode.tag === 7) {
      uniquePart = fiberNode;
    } else if (fiberNode.tag === 8) {
      uniquePart = fiberNode.memoizedProps;
    } else {
      uniquePart = fiberNode.stateNode;
    } // if this is a unique fiber (that both "current" and "alternate" fiber represents)
    // then add to the processedFiber to make sure we don't re-account this fiber.

    if (!processedFibers.has(uniquePart)) {
      id = this.uniqueId;
      this.uniqueId++;
      fiberMap.set(id, fiberNode);
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    } // If it's a HostRoot with a tag of 3
    // create a new TreeNode

    if (fiberNode.tag === 3 && !this.root) {
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

    if (fiberNode.tag === 0 || fiberNode.tag === 9) {
      uniquePart = fiberNode.memoizedProps;
    } else if (fiberNode.tag === 10 || fiberNode.tag === 11 || fiberNode.tag === 9 || fiberNode.tag === 15 || fiberNode.tag === 16) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.stateNode;
    } else if (fiberNode.tag === 7) {
      uniquePart = fiberNode;
    } else if (fiberNode.tag === 8) {
      uniquePart = fiberNode.memoizedProps;
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

  getCommitssOfComponent(name, serialize = false) {
    let componentList = [];
    componentList = this.componentList.filter(item => item.fiberName === name);

    if (serialize) {
      componentList = componentList.map(item => item.toSerializable());
    }

    return {...this, componentList};
  } // stretch feature, possible todo but needs extensive testing.

  setStateOfRender() {
    this.componentList.forEach(component => {
      if (component.tag === 1 && component.memoizedState) {
        console.log(component.stateNode);
        component.stateNode.setState({...component.memoizedState});
      }
    });
  }
}

class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(f) {
    this.observers.push(f);
  }

  unsubsribe(f) {
    this.observers = this.observers.filter(sub => sub !== f);
  }

  notify(data) {
    this.observers.forEach(observer => observer(data));
  }
}

/* eslint-disable no-prototype-builtins */
let changes$1 = [];
const processedFibers$1 = new WeakMap();
const fiberMap$1 = new Map();

function mountToReactRoot$1(reactRoot, projectID) {
  // Reset changes
  changes$1 = [];
  const changeObservable = new Observable();

  function getSet(obj, propName) {
    const newPropName = `_${propName}`;
    obj[newPropName] = obj[propName];
    Object.defineProperty(obj, propName, {
      get() {
        return this[newPropName];
      },

      set(newVal) {
        this[newPropName] = newVal;
        changes$1.push(new Tree(this[newPropName], fiberMap$1, processedFibers$1));
        changeObservable.notify(changes$1);
        if (projectID) sendData(changes$1, projectID);
      },
    });
  } // Lift parent of react fibers tree

  const parent = reactRoot._reactRootContainer._internalRoot;
  changes$1.push(new Tree(parent.current, fiberMap$1, processedFibers$1));
  if (projectID) sendData(changes$1, projectID); // Add listener to react fibers tree so changes can be recorded

  getSet(parent, 'current');
  return {
    changes: changes$1,
    changeObserver: changeObservable,
  };
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

function getAllSlowComponentRenders$1(changes, threshold) {
  // referencing "changes" in the global scope
  const scrubChanges = removeCircularRefs(changes); // rework this so that we can use the pre-serialized data

  const result = scrubChanges.map(commit => {
    return commit.filter(component => component.self_base_duration >= threshold);
  });
  return result;
} // function checkTime(fiber, threshold) {
//   return fiber.selfBaseDuration > threshold;
// }
// function getComponentRenderTime(componentName) {
//   console.log("changes", changes);
//   console.log("component name", componentName);
//   return "what";
// }

function getTotalCommitCount(changes, name, storageType) {
  const componentStore = new Map();
  let filteredChanges = [];

  if (name) {
    filteredChanges = changes.map(commit => {
      return commit.getCommitssOfComponent(name);
    });
  } else {
    filteredChanges = changes;
  } // looping through each commit's componentList to tally up the renderCount

  filteredChanges.forEach((commit, commitIndex) => {
    commit.componentList.forEach((component, componentIndex) => {
      if (!componentStore.has(component.uID)) {
        componentStore.set(component.uID, {
          component,
          renderCount: 1,
        });
      } else {
        if (didFiberRender(changes[commitIndex ? commitIndex - 1 : 0].componentList[componentIndex], component)) {
          componentStore.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  let result = [];

  if (storageType && storageType === 'array') {
    result = Array.from(componentStore.values());
  } else {
    result = componentStore;
  }

  return result;
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

async function sendData(changes, projectID) {
  if (!projectID) return;
  const data = scrubCircularReferences(changes);
  console.log(data);
  const request = await fetch(`https://react-pinpoint-api.herokuapp.com/api/commit/${projectID}`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      changes: data[data.length - 1],
    }),
  });
  const response = await request.json();
  console.log('response from server', response);
}

var ReactPP = {
  mountToReactRoot: mountToReactRoot$1,
  getAllSlowComponentRenders: getAllSlowComponentRenders$1,
  getTotalCommitCount,
  scrubCircularReferences,
};

// const {mountToReactRoot, getAllSlowComponentRenders, getTotalCommitCount, scrubCircularReferences} = require('./bundle.puppeteer.js'); // since generated file is in lib folder

async function record(page, url, rootIdString, projectID) {
  // Mock devtools hook so react will record fibers
  // Must exist before react runs
  await page.evaluateOnNewDocument(() => {
    window['__REACT_DEVTOOLS_GLOBAL_HOOK__'] = {};
  }); // Load url and inject code to page

  await page.goto(url);
  await page.addScriptTag({
    path: path.join(__dirname, './bundle.puppeteer.js'),
  }); // Start recording changes

  await page.evaluate(
    (rootIdString, projectID) => {
      const root = document.querySelector(rootIdString); // @ts-ignore

      mountToReactRoot(root, projectID);
    },
    rootIdString,
    projectID ? projectID : null,
  );
  return page;
}

// workaround since we're eval-ing this in browser context
async function report(page, threshold = 0) {
  // Return results of local state that exceeds threshold
  const slowRenders = await page.evaluate(async threshold => {
    // @ts-ignore
    const result = getAllSlowComponentRenders(changes, threshold);
    return JSON.stringify(result);
  }, threshold);
  return JSON.parse(slowRenders);
}

var index = {
  record,
  report,
  mountToReactRoot: ReactPP.mountToReactRoot,
  getAllSlowComponentRenders: ReactPP.getAllSlowComponentRenders,
  getTotalCommitCount: ReactPP.getTotalCommitCount,
  scrubCircularReferences: ReactPP.scrubCircularReferences,
};

module.exports = index;
