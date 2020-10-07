import TreeNode from './TreeNode';

let fiberMap = undefined;
let processedFibers = undefined;

class Tree {
  uniqueId: number;
  componentList: TreeNode[];
  effectList: any[]; // stretch feature
  root: TreeNode;
  fiberMap: Map<number, TreeNode>; // a singleton reference
  processedFibers: WeakMap<TreeNode, number>; // a singleton reference
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

  getRendersOfComponent(name, serialize = false) {
    let componentList = [];

    componentList = this.componentList.filter(item => item.fiberName === name);

    if (serialize) {
      componentList = componentList.map(item => item.toSerializable());
    }
    return {
      ...this,
      componentList,
    };
  }

  // stretch feature, possible todo but needs extensive testing.
  setStateOfRender() {
    this.componentList.forEach(component => {
      if (component.tag === 1 && component.memoizedState) {
        console.log(component.stateNode);
        component.stateNode.setState({...component.memoizedState});
      }
    });
  }
}

export default Tree;
