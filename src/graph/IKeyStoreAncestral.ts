import { IKeyStore } from "./IKeyStore";

export interface IKeyStoreAncestral {
  getAncestralIds(nodeIdUuid: string): string[];
  getChildrenIds(nodeIdUuid: string): string[];
  getDescendantIds(nodeIdUuid: string): string[];
  getSiblingsIds(nodeIdUuid: string): string[];

  insertChildOfParent(parentId: string): string;

  // srcParent children becomes children of tarParenId, srcParent deallocate
  mergeBranch(parentId: string, tarParentNodeId: string): void;

  // srcParent becomes child of tarParenId
  moveBranch(srcNodeId: string, tarParentNodeId: string): void;

  rootNodeId: string;
}
