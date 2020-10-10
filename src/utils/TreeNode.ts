/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */

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
  stateNode: {
    state: any;
    updater: any;
    tag: number;
    setState: any;
  };
  parent: any;
  child: any;
  sibling: any;
  children: any;
  type: any;

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

      const cb = (...args) => {
        this.updateList.push([...args]);
      };
    }
  }

  addChild(treeNode): void {
    // remove other uneccessary properties
    this.child = treeNode;
  }

  addSibling(treeNode): void {
    // if (!node) return;
    this.sibling = treeNode;
  }

  addParent(treeNode): void {
    // if (!node) return;
    this.parent = treeNode;
  }

  toSerializable(): any {
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
    ];
    // transform each nested node to just ids where appropriate
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
          case 'child': // probably not needed anymore, this prop seems to be redundant
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
            }
            // newObj["component_props"] = this[key];
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
      let textValue = fiber.stateNode.nodeValue;
      // just to help truncating long text value, exceeding 4 chars will get truncated.
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

function serializeMemoizedProps(obj): any {
  if (!obj) return null;

  // list of props to omit from the resulting object in return statement
  const omitList = ['props', '_owner', '_store', '_sef', '_source', '_self'];

  let newObj = null;
  // loop through each prop to check if they exist on omitList
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

export default TreeNode;
