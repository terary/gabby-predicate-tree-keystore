import { IKeyStoreAncestral } from "./IKeyStoreAncestral";
import { IKeyStore } from "./IKeyStore";
// import { KeyStore } from "./KeyStore";
import { v4 as uuidv4 } from "uuid";

const descendantsRegExpFn = (nodeId: string, delimiter: string) =>
  new RegExp(`^${nodeId}${delimiter}`);
const childrenRegExpFn = (nodeId: string, delimiter: string) =>
  new RegExp(`^${nodeId}${delimiter}[\\d]+\$`);

class KeyStore {
  private _map: Map<string, string>;
  private _reverseMap: Map<string, string>;
  constructor() {
    this._map = new Map<string, string>();
    this._reverseMap = new Map<string, string>();
  }

  public put(value: string) {
    // const key = uuidv4();
    const key = `${value}-uuid`;
    this._map.set(key, value);
    this._reverseMap.set(value, key);
    return key;
  }

  public get(key: string) {
    return this._map.get(key);
  }

  public reverseLookUp(value: string) {
    return this._reverseMap.get(value);
  }

  public existsKey(key: string): boolean {
    return this._map.has(key);
  }
  public existsValue(value: string): boolean {
    return this._reverseMap.has(value);
  }

  public delete(key: string) {
    const value = this._map.get(key);

    if (!value || !this._map.has(key)) {
      throw new Error(`Failed to find key: "${key}" for delete operation`);
    }
    this._map.delete(key);
    this._reverseMap.delete(value);
    console.log(`Deleted key: "${key}" counts: ${this._map.size}/ ${this._reverseMap.size}`);
  }
  public filterKeys(fn: (key: string) => boolean) {
    return Array.from(this._map.keys()).filter(fn);
  }

  public filterValues(fn: (key: string) => boolean) {
    return Array.from(this._map.values()).filter(fn);
  }

  public has(key: string): boolean {
    return this._map.has(key);
  }

  public renameKeySegment(childUuid: string, oldParentUuid: string, newParentUuid: string) {
    const childId = this.get(childUuid);
    const oldParentId = this.get(oldParentUuid);
    const newParentId = this.get(newParentUuid);

    if (!childId || !oldParentId || !newParentId) {
      throw new Error("Rename keySegment failed to find value for key");
    }
    const newChildId = childId.replace(oldParentId, newParentId);
    const newChildUuid = this.put(newChildId);
    this.delete(childUuid);
    return newChildUuid;
    // const keys = this.filterValues((k) => k.includes(fromSeg));
    // keys.forEach((k) => {
    //   const newKeySegment = k.replace(fromSeg, toSeg);
    //   const preserveValue = this._reverseMap.get(k);
    //   if (preserveValue === undefined) {
    //     throw new Error("Rename keySegment failed to find value for key: " + k);
    //   }
    //   this._map.set(newKeySegment, preserveValue);
    //   this._map.delete(k);
    // });
  }
}
class Incrementor {
  private _counter: number = 0;

  constructor(startAt: number = 0) {
    this._counter = startAt;
  }
  public getNext(): number {
    return ++this._counter;
  }
  public getCurrent(): number {
    return this._counter;
  }
}

export class KeyStoreAncestral {
  // private _keyStore: { [key: string]: string } = {};
  private _keyStore: KeyStore;
  // private _childrenKeys: string[];

  private _rootNodeId: string;
  private _childCountIncrementor: Incrementor;
  private _childDelimiter = ":";
  constructor(rootNodeId: string) {
    this._keyStore = new KeyStore();
    this._rootNodeId = this._keyStore.put(rootNodeId);
    this._childCountIncrementor = new Incrementor();
    // this._childrenKeys = [rootNodeId]; // children keys is the save as reverse map do one or the other
  }
  get rootNodeId() {
    return this._rootNodeId;
  }

  public getChildrenIds(parentUuid: string): string[] {
    const parentId = this._keyStore.get(parentUuid);
    if (!parentId) {
      return [];
    }

    const childRegExp = childrenRegExpFn(parentId, this._childDelimiter);
    // const childrenIds = this._childrenKeys.filter((id) => childRegExp.test(id));

    const childrenIds = this._keyStore.filterValues((id) => childRegExp.test(id));

    const childrenUuids = childrenIds.map((id) => {
      return this._keyStore.reverseLookUp(id);
    });
    return (childrenUuids || []) as string[];
  }

  public getDescendantIds(parentUuid: string): string[] {
    const parentId = this._keyStore.get(parentUuid);
    if (!parentId) {
      return [];
    }
    const descendantRegExp = descendantsRegExpFn(parentId, this._childDelimiter);
    // const descendantIds = this._childrenKeys.filter((id) => descendantRegExp.test(id));
    const descendantIds = this._keyStore.filterValues((id) => descendantRegExp.test(id));
    const descendantUuids = descendantIds.map((id) => {
      return this._keyStore.reverseLookUp(id);
    });
    return (descendantUuids || []) as string[];
  }

  public getSiblingIds(nodeUuid: string) {
    if (nodeUuid === this._rootNodeId) {
      return [];
    }

    const nodeId = this._keyStore.get(nodeUuid);
    if (nodeId === undefined) {
      return [];
    }
    const parentId = nodeId
      .split(this._childDelimiter)
      .slice(0, -1)
      .join(this._childDelimiter);
    const parentUuid = this._keyStore.reverseLookUp(parentId) || ""; // this is probably an issue. Maybe better throw error?
    const childrenUuids = this.getChildrenIds(parentUuid);
    const siblingUuids = childrenUuids.filter((id) => id !== nodeUuid);
    return siblingUuids;
  }

  public insertChildOfParent(parentUuid: string): string {
    const parentId = this._keyStore.get(parentUuid);

    if (!parentId) {
      throw new Error(`Parent node ${parentId} does not exist`);
    }
    const childId = this.nextNodeId(parentId);
    const childUuid = this._keyStore.put(childId);
    // this._childrenKeys.push(childId);

    return childUuid;
  }

  public deleteBranch(nodeUuid: string): void {
    if (nodeUuid === this._rootNodeId) {
      throw new Error("Cannot delete root node");
    }
    if (!this._keyStore.existsKey(nodeUuid)) {
      throw new Error(`Key '${nodeUuid}' does not exist in tree`);
    }
    const descendants = this.getDescendantIds(nodeUuid);
    descendants.push(nodeUuid);
    descendants.forEach((id) => {
      this._keyStore.delete(id);
    });
  }

  public existsKey(key: string): boolean {
    return this._keyStore.existsKey(key);
  }

  // srcNodeId becomes child of tarParenId
  moveBranch(srcParentUuid: string, tarParentNodeUuid: string): void {
    if (srcParentUuid === tarParentNodeUuid) {
      throw new Error(
        `Tried to move '${srcParentUuid}' on to itself. Cannot move branch to same parent`
      );
    }
    const newParentUuid = this.insertChildOfParent(tarParentNodeUuid);
    const descendantsUuidsOfSource = this.getDescendantIds(srcParentUuid);
    descendantsUuidsOfSource.forEach((childUuid) => {
      this._keyStore.renameKeySegment(childUuid, srcParentUuid, newParentUuid);
    });
    this._keyStore.delete(srcParentUuid);
  }

  // srcParent children becomes children of tarParenId, srcParent deallocate
  mergeBranches(srcParentUuid: string, tarParentNodeUuid: string): void {
    if (srcParentUuid === tarParentNodeUuid) {
      throw new Error(
        `Tried to move '${srcParentUuid}' on to itself. Cannot move branch to same parent`
      );
    }
    const descendantsUuidsOfSource = this.getDescendantIds(srcParentUuid);
    descendantsUuidsOfSource.forEach((childUuid) => {
      this._keyStore.renameKeySegment(childUuid, srcParentUuid, tarParentNodeUuid);
    });
    this._keyStore.delete(srcParentUuid);
  }

  private nextNodeId(parentId: string): string {
    return `${parentId}${this._childDelimiter}${this._childCountIncrementor.getNext()}`;
  }
}
