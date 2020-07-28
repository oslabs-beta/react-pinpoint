class NodeSchema {
  constructor(node) {
    this.name = node.type;
    this.renderTime = node.actualDuration;
  }
}

export default NodeSchema;
