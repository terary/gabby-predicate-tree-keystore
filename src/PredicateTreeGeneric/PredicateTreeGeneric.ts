import { KeyStoreAncestral } from "../graph/KeyStoreAncestral";

type TJunctionOperator = "$and" | "$or" | "$nor" | "$nand" | "$xor";
type TLeafNode<T> = { payload: T };
type TBranchNode = { operator: TJunctionOperator };
type TNode<T> = TLeafNode<T> | TBranchNode;

enum NodeTypeEnum {
  // I dont know how much I love this.
  // branch can be determined by the operator field.
  // this is one more bit to data to keep track of.
  LEAF = "LEAF",
  BRANCH = "BRANCH",
  ROOT = "ROOT",
}

export class PredicateTreeGeneric<T> {
  private _keyStore: KeyStoreAncestral;
  private _keyNodeDictionary: { [key: string]: TNode<T> } = {};
  // private _keyNodeDictionary: { [key: string]: T } = {};
  constructor(rootNodeId: string, node: T) {
    this._keyStore = new KeyStoreAncestral(rootNodeId);
    this._keyNodeDictionary[this._keyStore.rootNodeId] = {
      // { nodeType: NodeTypeEnum } &
      // nodeType: NodeTypeEnum.LEAF,
      payload: node,
    };
  }

  /**
   * Will try to insert/associate payload to given parentUuid.
   * If parentUuid is a leaf node, it will create a new branch node and insert payload to it.
   * @param parentUuid
   * @param payload
   * @param junctionOperator
   * @returns
   */
  insertNode(
    parentUuid: string,
    payload: T,

    // this is only applicable if we have to create node
    // we allow to override default '$and'
    junctionOperator: TJunctionOperator = "$and"
  ): string {
    const childrenIds = this._keyStore.getChildrenIds(parentUuid);
    if (childrenIds.length === 0) {
      const invisibleChildUuid = this._keyStore.insertChildOfParent(parentUuid);

      const invisibleChildPayload = this.getPayload(parentUuid) as T;
      this._keyNodeDictionary[invisibleChildUuid] = {
        // nodeType: NodeTypeEnum.LEAF,
        payload: invisibleChildPayload,
      };

      this._keyNodeDictionary[parentUuid] = {
        // nodeType: NodeTypeEnum.BRANCH,
        operator: junctionOperator,
      };
    }

    const newChildUuid = this._keyStore.insertChildOfParent(parentUuid);
    this._keyNodeDictionary[newChildUuid] = {
      // nodeType: NodeTypeEnum.LEAF,
      payload,
    };
    return newChildUuid;
  }

  getNodeType(uuid: string): NodeTypeEnum {
    if (this.getChildrenIds(uuid).length === 0) {
      return NodeTypeEnum.LEAF;
    }
    return NodeTypeEnum.BRANCH;
    // return this._keyNodeDictionary[uuid].nodeType;
  }

  getChildrenPayloads(uuid: string): (T | TNode<T>)[] {
    const childrenIds = this.getChildrenIds(uuid);
    return childrenIds.map((childId) => this.getPayload(childId));
  }

  getDescendantIds(uuid: string): string[] {
    return this._keyStore.getDescendantIds(uuid);
  }

  getPayload(uuid: string): T | TNode<T> {
    const node = this._keyNodeDictionary[uuid];
    if (node && "payload" in node) {
      return node.payload;
    }
    return node;
  }

  getSiblingsIds(uuid: string): string[] {
    return this._keyStore.getSiblingIds(uuid);
  }

  getChildrenIds(uuid: string): string[] {
    return this._keyStore.getChildrenIds(uuid);
  }

  get rootNodeId(): string {
    return this._keyStore.rootNodeId;
  }
}
