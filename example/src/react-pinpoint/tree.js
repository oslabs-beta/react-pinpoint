const TreeNode = require("./treeNode");

let fiberMap = undefined;
let processedFibers = undefined;

class Tree {
  // uniqueId is used to identify a fiber to then help with counting re-renders
  // componentList
  constructor(rootNode, FiberMap, ProcessedFibers) {
    fiberMap = FiberMap;
    processedFibers = ProcessedFibers;
    this.uniqueId = fiberMap.size;
    this.componentList = [];
    this.effectList = [];
    this.root = null;
    this.processNode(rootNode);
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
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    // if this is a unique fiber (that both "current" and "alternate" fiber represents)
    // then add to the processedFiber to make sure we don't re-account this fiber.
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;

      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    // If it's a HostRoot with a tag of 3
    // create a new TreeNode
    if (fiberNode.tag === 3) {
      this.root = new TreeNode(fiberNode, id);
      // this.root = new TreeNode(fiberNode, this.uniqueId);
      this.componentList.push({ ...this.root }); // push a copy
      // this.uniqueId++;

      if (fiberNode.child) {
        // const newNode = new TreeNode(fiberNode.child, this.uniqueId);
        // this.root.addChild(newNode);
        // this.componentList.push(newNode);
        // this.uniqueId++;
        this.processNode(fiberNode.child, this.root);
      }
    } else {
      const newNode = new TreeNode(fiberNode, id);
      // const newNode = new TreeNode(fiberNode, this.uniqueId);
      previousTreeNode.addChild(newNode);
      this.componentList.push({ ...newNode });
      // this.uniqueId++;

      if (fiberNode.child) {
        this.processNode(fiberNode.child, newNode);
      }
      if (fiberNode.sibling) {
        this.processSiblingNode(fiberNode.sibling, newNode);
      }
    }
  }

  processSiblingNode(fiberNode, previousTreeNode) {
    let uniquePart = undefined;
    let id = undefined;
    if (fiberNode.tag === 0) {
      uniquePart = fiberNode.elementType;
    } else if (fiberNode.tag === 3) {
      uniquePart = fiberNode.memoizedState.element.type;
    } else {
      uniquePart = fiberNode.stateNode;
    }
    if (!processedFibers.has(uniquePart)) {
      // processedFibers.add(fiberNode);
      // componentMap.set(this.uniqueId, fiberNode);
      id = this.uniqueId;
      this.uniqueId++;
      fiberMap.set(id, fiberNode);
      // if (fiberNode.tag === 0) {
      //   processedFibers.set(fiberNode.elementType, id);
      // } else if (fiberNode.tag === 3) {
      //   processedFibers.set(fiberNode.memoizedState.element.type, id);
      // } else {
      //   processedFibers.set(fiberNode.stateNode, id);
      // }
      processedFibers.set(uniquePart, id);
    } else {
      id = processedFibers.get(uniquePart);
    }

    const newNode = new TreeNode(fiberNode, id);
    // const newNode = new TreeNode(fiberNode, this.uniqueId);
    previousTreeNode.addSibling(newNode);
    this.componentList.push({ ...newNode });
    // this.uniqueId++;

    if (fiberNode.child) {
      this.processNode(fiberNode.child, newNode);
    }
    if (fiberNode.sibling) {
      this.processSiblingNode(fiberNode.sibling, newNode);
    }
  }
}

module.exports = Tree;
