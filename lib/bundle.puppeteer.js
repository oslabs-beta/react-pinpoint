function _typeof(obj) {
  '@babel/helpers - typeof';

  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || (allowArrayLike && o && typeof o.length === 'number')) {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length)
            return {
              done: true,
            };
          return {
            done: false,
            value: o[i++],
          };
        },
        e: function (e) {
          throw e;
        },
        f: F,
      };
    }

    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }

  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

/* eslint-disable no-prototype-builtins */

/* eslint-disable no-case-declarations */
var TreeNode = /*#__PURE__*/ (function () {
  // will add type after ;D
  function TreeNode(fiberNode, uID) {
    _classCallCheck(this, TreeNode);

    this.uID = uID;
    var elementType = fiberNode.elementType,
      selfBaseDuration = fiberNode.selfBaseDuration,
      memoizedState = fiberNode.memoizedState,
      memoizedProps = fiberNode.memoizedProps,
      effectTag = fiberNode.effectTag,
      tag = fiberNode.tag,
      ref = fiberNode.ref,
      updateQueue = fiberNode.updateQueue,
      stateNode = fiberNode.stateNode,
      type = fiberNode.type;
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

  _createClass(TreeNode, [
    {
      key: 'addChild',
      value: function addChild(treeNode) {
        // remove other uneccessary properties
        this.child = treeNode;
      },
    },
    {
      key: 'addSibling',
      value: function addSibling(treeNode) {
        // if (!node) return;
        this.sibling = treeNode;
      },
    },
    {
      key: 'addParent',
      value: function addParent(treeNode) {
        // if (!node) return;
        this.parent = treeNode;
      },
    },
    {
      key: 'toSerializable',
      value: function toSerializable() {
        var newObj = {};
        var omitList = [
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

        var _iterator = _createForOfIteratorHelper(Object.getOwnPropertyNames(this)),
          _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var key = _step.value;

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
                  newObj['children_ids'] = this[key].map(function (treeNode) {
                    return treeNode.uID;
                  });
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
                  var value = null;

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
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return newObj;
      },
    },
  ]);

  return TreeNode;
})();

function getElementName(fiber) {
  var name = '';

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
        name += '.'.concat(fiber.elementType.className);
      } else if (fiber.memoizedProps) {
        if (fiber.memoizedProps.className) {
          name += '.'.concat(fiber.memoizedProps.className);
        } else if (fiber.memoizedProps.id) {
          name += '.'.concat(fiber.memoizedProps.id);
        }
      }

      if (name.length > 10) {
        // truncate long name
        name = name.slice(0, 10);
        name += '...';
      }

      return name;

    case 6:
      var textValue = fiber.stateNode.nodeValue; // just to help truncating long text value, exceeding 4 chars will get truncated.

      if (textValue.length > 10) {
        textValue = textValue.slice(0, 10);
        textValue = textValue.padEnd(3, '.');
      }

      name = 'text: '.concat(textValue);
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
      name = fiber.elementType.displayName + '-' + 'to:"'.concat(fiber.memoizedProps.to, '"');
      return name;

    case 13:
      name = 'Suspense Zone';
      return name;

    case 16:
      name = 'Lazy - ' + fiber.elementType._result.name;
      return name;

    default:
      return ''.concat(typeof fiber.elementType !== 'string' ? fiber.elementType : 'unknown');
  }
}

function serializeMemoizedProps(obj) {
  if (!obj) return null; // list of props to omit from the resulting object in return statement

  var omitList = ['props', '_owner', '_store', '_sef', '_source', '_self'];
  var newObj = null; // loop through each prop to check if they exist on omitList
  // if yes then skip, no then include in the object being returned;

  if (Array.isArray(obj)) {
    if (!newObj) newObj = [];

    for (var i = 0; i < obj.length; i++) {
      var nestedChild = {};

      var _iterator2 = _createForOfIteratorHelper(Object.getOwnPropertyNames(obj[i])),
        _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
          var key = _step2.value;

          if (omitList.indexOf(key) < 0) {
            nestedChild[key] = obj[i][key];
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      newObj.push(nestedChild);
    }
  } else {
    var _iterator3 = _createForOfIteratorHelper(Object.getOwnPropertyNames(obj)),
      _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
        var _key2 = _step3.value;

        if (omitList.indexOf(_key2) < 0) {
          if (!newObj) newObj = {};

          if (_typeof(obj[_key2]) === 'object') {
            newObj[_key2] = serializeMemoizedProps(obj[_key2]);
          } else if (_typeof(obj[_key2]) === 'symbol') {
            newObj[_key2] = obj[_key2].toString();
          } else {
            newObj[_key2] = obj[_key2];
          }
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  return newObj;
}

var fiberMap = undefined;
var processedFibers = undefined;

var Tree = /*#__PURE__*/ (function () {
  // stretch feature
  // a singleton reference
  // a singleton reference
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  function Tree(rootNode, FiberMap, ProcessedFibers) {
    _classCallCheck(this, Tree);

    fiberMap = FiberMap;
    processedFibers = ProcessedFibers;
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode, null);
  }

  _createClass(Tree, [
    {
      key: 'processNode',
      value: function processNode(fiberNode, previousTreeNode) {
        // id used to reference a fiber in fiberMap
        var id = undefined; // using a unique part of each fiber to identify it.
        // both current and alternate only 1 reference to this unique part
        // which we can use to uniquely identify a fiber node even in the case
        // of current and alternate switching per commit/

        var uniquePart = undefined; // skipping special nodes like svg, path

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
          var newNode = new TreeNode(fiberNode, id);
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
      },
    },
    {
      key: 'processSiblingNode',
      value: function processSiblingNode(fiberNode, previousTreeNode, parentTreeNode) {
        var uniquePart = undefined;
        var id = undefined;

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

        var newNode = new TreeNode(fiberNode, id);
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
      },
    },
    {
      key: 'getCommitssOfComponent',
      value: function getCommitssOfComponent(name) {
        var serialize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var componentList = [];
        componentList = this.componentList.filter(function (item) {
          return item.fiberName === name;
        });

        if (serialize) {
          componentList = componentList.map(function (item) {
            return item.toSerializable();
          });
        }

        return _objectSpread2(
          _objectSpread2({}, this),
          {},
          {
            componentList: componentList,
          },
        );
      }, // stretch feature, possible todo but needs extensive testing.
    },
    {
      key: 'setStateOfRender',
      value: function setStateOfRender() {
        this.componentList.forEach(function (component) {
          if (component.tag === 1 && component.memoizedState) {
            console.log(component.stateNode);
            component.stateNode.setState(_objectSpread2({}, component.memoizedState));
          }
        });
      },
    },
  ]);

  return Tree;
})();

var Observable = /*#__PURE__*/ (function () {
  function Observable() {
    _classCallCheck(this, Observable);

    this.observers = [];
  }

  _createClass(Observable, [
    {
      key: 'subscribe',
      value: function subscribe(f) {
        this.observers.push(f);
      },
    },
    {
      key: 'unsubsribe',
      value: function unsubsribe(f) {
        this.observers = this.observers.filter(function (sub) {
          return sub !== f;
        });
      },
    },
    {
      key: 'notify',
      value: function notify(data) {
        this.observers.forEach(function (observer) {
          return observer(data);
        });
      },
    },
  ]);

  return Observable;
})();

var changes = [];
var processedFibers$1 = new WeakMap();
var fiberMap$1 = new Map();

function mountToReactRoot(reactRoot, projectID) {
  // Reset changes
  changes = [];
  var changeObservable = new Observable();

  function getSet(obj, propName) {
    var newPropName = '_'.concat(propName);
    obj[newPropName] = obj[propName];
    Object.defineProperty(obj, propName, {
      get: function get() {
        return this[newPropName];
      },
      set: function set(newVal) {
        this[newPropName] = newVal;
        changes.push(new Tree(this[newPropName], fiberMap$1, processedFibers$1));
        changeObservable.notify(changes);
        if (projectID) sendData(changes, projectID);
      },
    });
  } // Lift parent of react fibers tree

  var parent = reactRoot._reactRootContainer._internalRoot;
  changes.push(new Tree(parent.current, fiberMap$1, processedFibers$1));
  if (projectID) sendData(changes, projectID); // Add listener to react fibers tree so changes can be recorded

  getSet(parent, 'current');
  return {
    changes: changes,
    changeObserver: changeObservable,
  };
}

function scrubCircularReferences(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there
  var scrubChanges = changes.map(function (commit) {
    return commit.componentList.map(function (component) {
      return component.toSerializable();
    });
  });
  return scrubChanges;
}

function removeCircularRefs(changes) {
  // loop through the different commits
  // for every commit check the componentList
  // scrub the circular references and leave the flat one there
  var scrubChanges = changes.map(function (commit) {
    return commit.componentList.map(function (component) {
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
  var scrubChanges = removeCircularRefs(changes); // rework this so that we can use the pre-serialized data

  var result = scrubChanges.map(function (commit) {
    return commit.filter(function (component) {
      return component.self_base_duration >= threshold;
    });
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
  var componentStore = new Map();
  var filteredChanges = [];

  if (name) {
    filteredChanges = changes.map(function (commit) {
      return commit.getCommitssOfComponent(name);
    });
  } else {
    filteredChanges = changes;
  } // looping through each commit's componentList to tally up the renderCount

  filteredChanges.forEach(function (commit, commitIndex) {
    commit.componentList.forEach(function (component, componentIndex) {
      if (!componentStore.has(component.uID)) {
        componentStore.set(component.uID, {
          component: component,
          renderCount: 1,
        });
      } else {
        if (didFiberRender(changes[commitIndex ? commitIndex - 1 : 0].componentList[componentIndex], component)) {
          componentStore.get(component.uID).renderCount += 1;
        }
      }
    });
  });
  var result = [];

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

function sendData(_x, _x2) {
  return _sendData.apply(this, arguments);
}

function _sendData() {
  _sendData = _asyncToGenerator(
    /*#__PURE__*/ regeneratorRuntime.mark(function _callee(changes, projectID) {
      var data, request, response;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch ((_context.prev = _context.next)) {
            case 0:
              if (projectID) {
                _context.next = 2;
                break;
              }

              return _context.abrupt('return');

            case 2:
              data = scrubCircularReferences(changes);
              console.log(data);
              _context.next = 6;
              return fetch('https://react-pinpoint-api.herokuapp.com/api/commit/'.concat(projectID), {
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

            case 6:
              request = _context.sent;
              _context.next = 9;
              return request.json();

            case 9:
              response = _context.sent;
              console.log('response from server', response);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee);
    }),
  );
  return _sendData.apply(this, arguments);
}

export {getAllSlowComponentRenders, getTotalCommitCount, mountToReactRoot, scrubCircularReferences};
