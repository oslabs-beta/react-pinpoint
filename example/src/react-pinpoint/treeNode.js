class TreeNode {
  constructor(fiberNode, uID) {
    this.uID = uID;
    const {
      elementType,
      selfBaseDuration,
      memoizedState,
      memoizedProps,
      effectTag,
      tag,
      ref,
      updateQueue,
      stateNode,
    } = fiberNode;
    this.elementType = elementType;
    this.selfBaseDuration = selfBaseDuration;
    this.memoizedProps = memoizedProps;
    this.memoizedState = memoizedState;
    this.effectTag = effectTag;
    this.ref = ref;
    this.updateQueue = updateQueue; // seems to be replaced entirely and since it exists directly under a fiber node, it can't be modified.
    this.tag = tag;
    this.updateList = [];

    // stateNode can contain circular references depends on the fiber node
    if (tag === 5) {
      this.stateNode = "host component";
    } else if (tag === 3) {
      this.stateNode = "host root";
    } else {
      this.stateNode = stateNode;
    }

    // check the fiber and the attach the spy
    // find a way to store the update function variable and result here
    if ((tag === 1 || tag === 5) && this.stateNode && this.stateNode.state) {
      /*
        enqueueReplaceState (inst, payload, callback)
        enqueueForceUpdate (inst, callback)
        enqueueSetState    (inst, payload, callback)
      */
      if (this.stateNode.updater) {
        const cb = (update, payload) => {
          this.updateList.push([update, payload]);
        };
        // spying
        // if (!stateNodeWeakSet.has(this.stateNode)) {
        //   stateNodeWeakSet.add(this.stateNode);
        //   Spy(this.stateNode.updater, "enqueueSetState", cb);
        //   Spy(this.stateNode.updater, "enqueueReplaceState", cb);
        //   Spy(this.stateNode.updater, "enqueueForceUpdate", cb);
        // }
      }
    }

    if (tag === 0 && !stateNode && memoizedState) {
      // pass in "queue" obj to spy on dispatch func
      console.log("attaching a spy", memoizedState.queue);
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

  addParent(node) {
    // if (!node) return;
  }
}

module.exports = TreeNode;
