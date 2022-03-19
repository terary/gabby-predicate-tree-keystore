export class NodeNotFoundError extends Error {}
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { KeyStore } from "./KeyStore";
import { PseudoKeyStore } from "./PseudoKeyStore";
import { IKeyStore } from "./IKeyStore";

interface IGraph<T> {
  rootNodeId: string;
  acceptVisitor(visitor: IVisitor<T>): void;
  //  clone(parentNodeId: string): IGraph<T>; // copy of graph at node, root if nulwhole graph)
  duplicateBranchAtTo(srcParentNode: string, tarParentNode: string): void; // srcParent becomes child of target

  getPayload(nodeId: string): T;
  insertPayload(parentNodeId: string, node: T): string; // returns new node id
  insertTree(parentNodeId: string, tree: IGraph<T>): void; // returns parentId (sameone passedit)
  removeNode(nodeId: string): void; // removes node and all its descendants
  transplant(nodeId: string, newParentNodeId: string): void; // move node to new parent
}

// *tmc* don't love export but maybe its necessary for testing
export type Vertices<T> = {
  // children: { [key: string]: Vertices<T> } | null;
  nodeId: string;
  parentId: string;
  payload: T;
};

const debug = true;

export class GraphObscuredKeys<T> implements IGraph<T> {
  // @ts-ignore
  private _rootNode: Vertices<T> = {};
  // private _rootNodeId: string;
  private _rootNodeUuid: string;

  private _nodeLookUpTable: { [nodeId: string]: Vertices<T> } = {};
  private readonly _nodeIdDelimiter = ":";
  private _indexIncrementor = 0;
  private _keyStore: IKeyStore = debug === true ? new PseudoKeyStore() : new KeyStore();

  constructor(rootNodeId: string, payload: T) {
    // this._rootNodeId = rootNodeId;
    this._rootNodeUuid = this._keyStore.put(rootNodeId);
    // this._rootNode = {
    //   // *tmc* to be removed
    //   parentId: this._rootNodeId,
    //   nodeId: this._rootNodeId,
    //   children: null,
    //   payload: payload,
    // };
    // this._putNode(this._rootNodeId, payload);
    this._nodeLookUpTable[this._keyStore.get(this._rootNodeUuid)] = {
      // root node to be set in constructor. everything else will have a parent
      parentId: this._rootNodeUuid,
      nodeId: this._rootNodeUuid,
      // children: null,
      payload: payload,
    };
  }

  acceptVisitor(visitor: IVisitor<T>): void {}

  private _getDescendantIds = (nodeId: string): string[] => {
    return Object.keys(this._nodeLookUpTable).filter((key) => key.startsWith(nodeId));
  };

  getChildrenIds(parentNodeId: string): string[] {
    const keys = Object.keys(this._nodeLookUpTable);

    return [];
  }

  getPayload(nodeIdUuid: string): T {
    return this._findNode(nodeIdUuid).payload;
  }

  insertPayload(parentNodeIdUuid: string, payload: T): string {
    if (this._keyStore.exists(parentNodeIdUuid)) {
      return this._putChildNode(parentNodeIdUuid, payload);
    }
    throw new NodeNotFoundError(`Parent NodeId '${parentNodeIdUuid}' not found`);
  }

  insertTree(parentNodeId: string, tree: IGraph<T>): void {}

  removeNode(nodeId: string): void {}

  get rootNodeId() {
    return this._rootNodeUuid;
  }

  transplant(nodeId: string, newParentNodeId: string): void {}

  protected _putChildNode(parentUuid: string, payload: T): string {
    const parentNodeId = this._keyStore.get(parentUuid);
    const nodeId = [parentNodeId, this._nextIndex().toString()].join(this._nodeIdDelimiter);
    const nodeIdUuid = this._keyStore.put(nodeId);
    const node = {
      parentId: parentNodeId,
      nodeId: nodeId,
      payload: payload,
      children: null,
    };
    this._nodeLookUpTable[nodeId] = node;
    return nodeIdUuid;
  }

  // private is preferred but for testing purposes set to protected
  protected _findNode(nodeIdUuid: string): Vertices<T> {
    return this._nodeLookUpTable[this._keyStore.get(nodeIdUuid)];
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

      // if (branch.children === null || !(childId in branch.children)) {
      //   // don't expect this to ever happen. Here to be guard to
      //   // prevent ts-node from giving compile error
      //   // throw new NodeNotFoundError(`Node ${nodeId} not found`);
      //   return null;
      // }

      // return this._traverseTree(nextRootId, branch.children[childId], originalNodeId);
    }

    return null;
    // throw new NodeNotFoundError(`Node ${nodeId} not found`);
  }

  private _nextIndex(): number {
    return this._indexIncrementor++;
  }
  duplicateBranchAtTo(srcParentNode: string, tarParentNode: string): void {} // srcParent becomes child of target
  public clone(parentNodeId: string) {
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
