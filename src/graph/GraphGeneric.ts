export class NodeNotFoundError extends Error {}
import { cloneDeep } from "lodash";

interface IGraph<T> {
  rootNodeId: string;
  acceptVisitor(visitor: IVisitor<T>): void;
  clone(parentNodeId: string): IGraph<T>; // copy of graph at node, root if nulwhole graph)
  duplicateBranchAtTo(srcParentNode: string, tarParentNode: string): void; // srcParent becomes child of target

  getPayload(nodeId: string): T;
  insertPayload(parentNodeId: string, node: T): string; // returns new node id
  insertTree(parentNodeId: string, tree: IGraph<T>): void; // returns parentId (sameone passedit)
  removeNode(nodeId: string): void; // removes node and all its descendants
  transplant(nodeId: string, newParentNodeId: string): void; // move node to new parent
}

// *tmc* don't love export but maybe its necessary for testing
export type Vertices<T> = {
  children: { [key: string]: Vertices<T> } | null;
  nodeId: string;
  parentId: string;
  payload: T;
};

export class GraphGeneric<T> implements IGraph<T> {
  private _rootNode: Vertices<T>;
  private _rootNodeId: string;
  private readonly _nodeIdDelimiter = ":";
  private _indexIncrementor = 0;
  constructor(rootNodeId: string, payload: T) {
    this._rootNodeId = rootNodeId;
    this._rootNode = {
      parentId: this._rootNodeId,
      nodeId: this._rootNodeId,
      children: null,
      payload: payload,
    };
  }

  acceptVisitor(visitor: IVisitor<T>): void {}

  getChildrenNodeIds(parentNodeId: string): string[] {
    return [];
  }

  getPayload(nodeId: string): T {
    return this._rootNode.payload;
  }

  insertPayload(parentNodeId: string, payload: T): string {
    const targetNode = this._findNode(parentNodeId);
    if (targetNode.children === null) {
      targetNode.children = {};
    }
    const childId = this._nextIndex().toString();
    const childNodeId = parentNodeId + this._nodeIdDelimiter + childId;
    targetNode.children[childId] = {
      parentId: parentNodeId,
      nodeId: childNodeId,
      payload: payload,
      children: null,
    };

    return childNodeId;
  }

  insertTree(parentNodeId: string, tree: IGraph<T>): void {}

  removeNode(nodeId: string): void {}

  get rootNodeId() {
    return this._rootNodeId;
  }

  transplant(nodeId: string, newParentNodeId: string): void {}

  // private is preferred but for testing purposes set to protected
  protected _findNode(nodeId: string): Vertices<T> {
    const node = this._traverseTree(nodeId, this._rootNode, nodeId);
    if (node === null) {
      throw new NodeNotFoundError(`Node '${nodeId}' not found`);
    }
    return node;
  }

  // maybe this should throw instead of return null
  private _traverseTree(
    nodeId: string,
    branch = this._rootNode,
    originalNodeId: string
  ): Vertices<T> | null {
    const path = nodeId.split(this._nodeIdDelimiter);

    if (path.length === 1 && branch.nodeId === originalNodeId) {
      return branch;
    }

    if (path.length > 1) {
      const childId = nodeId.split(this._nodeIdDelimiter).slice(1, 2).pop() || "_NOT_FOUND_";
      const nextRootId = nodeId
        .split(this._nodeIdDelimiter)
        .slice(1)
        .join(this._nodeIdDelimiter);

      if (branch.children === null || !(childId in branch.children)) {
        // don't expect this to ever happen. Here to be guard to
        // prevent ts-node from giving compile error
        // throw new NodeNotFoundError(`Node ${nodeId} not found`);
        return null;
      }

      return this._traverseTree(nextRootId, branch.children[childId], originalNodeId);
    }

    return null;
    // throw new NodeNotFoundError(`Node ${nodeId} not found`);
  }

  private _nextIndex(): number {
    return this._indexIncrementor++;
  }
  duplicateBranchAtTo(srcParentNode: string, tarParentNode: string): void {} // srcParent becomes child of target
  public clone(parentNodeId: string): GraphGeneric<T> {
    // const clone = new GraphGeneric<T>(this._rootNodeId, {} as T);
    // clone._rootNode = this._findNode(parentNodeId);
    // const c = cloneDeep(this);

    return cloneDeep(this);
  }
  // protected clone(nodeId = this.rootNodeId): GraphGeneric<T> {
  //   const clone = new GraphGeneric<T>(nodeId, {} as T);
  //   return clone;
  //   // deep copy
  //   // dont forget to initalize the index incrementor
  //   // return new GraphGeneric<T>(this._rootNodeId, {} as T);
  // }
}
