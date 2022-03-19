


interface IVisitor<T> { (parentNodeId: string, nodeId: string | null, payload: T): void; }


interface IGraph<T> {
    rootNodeId: string;
    acceptVisitor(visitor: IVisitor<T>): void;
    clone(parentNodeId: string): IGraph<T>; // copy of graph at node, root if nulwhole graph)
    getPayload(nodeId: string): T;
    getChildrenNodeIds(parentNodeId: string): string[];
    insertPayload(parentNodeId: string, payload: T): string; // returns new node id
    insertTree(parentNodeId: string, tree: IGraph<T>): void; // returns parentId (sameone passedit)
    removeNode(nodeId: string): void; // removes node and all its descendants
    transplant(nodeId: string, newParentNodeId: string): void; // move node to new parent
} 