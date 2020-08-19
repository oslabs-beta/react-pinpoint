interface Node {
  type: string;
  actualDuration: number;
}

class NodeSchema {
  name: string;
  renderTime: number;

  constructor(node: Node) {
    this.name = node.type;
    this.renderTime = node.actualDuration;
  }
}

export default NodeSchema;
