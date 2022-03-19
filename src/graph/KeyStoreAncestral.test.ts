// getAncestralIds(nodeIdUuid: string): string[];
// getChildrenIds(nodeIdUuid: string): string[];
// getDescendantIds(nodeIdUuid: string): string[];
// getSiblingsIds(nodeIdUuid: string): string[];

import exp from "constants";
import { KeyStore } from "./KeyStore";
import { KeyStoreAncestral } from "./KeyStoreAncestral";

/**
 * review naming convents verbTarget (be consistent)
 * be consistent with the plurals
 *
 * consider keeping keys.  When renaming etc. the internal stored value may change but
 * external references still point to the original id.
 * so that client code can keep reference to the object
 */

describe("KeyStoreAncestral", () => {
  describe(".rootNodeId", () => {
    it("Should be set at instantiate ", () => {
      const keyStoreAncestral = new KeyStoreAncestral("theRoot");
      const rootId = keyStoreAncestral.rootNodeId;
      const x = keyStoreAncestral.insertChildOfParent(rootId);
      //       expect(keyStoreAncestral.rootNodeId).toEqual("theRoot");
    });
  });
  // describe.skip("getAncestralIds", () => {});
  describe("getChildrenIds", () => {
    it("Should return empty array if no children", () => {
      const keyStoreAncestral = new KeyStoreAncestral("theRoot");
      keyStoreAncestral.insertChildOfParent(keyStoreAncestral.rootNodeId);
      expect(keyStoreAncestral.getChildrenIds("DOES_NOT_EXISTS")).toEqual([]);
      // expect(1).toEqual(2);
    });
    it("Should return array of childrenId", () => {
      const keyStoreAncestral = new KeyStoreAncestral("theRoot");

      // grandchildren 0
      const childId0 = keyStoreAncestral.insertChildOfParent(keyStoreAncestral.rootNodeId);
      const children0_0 = keyStoreAncestral.insertChildOfParent(childId0);
      const children0_1 = keyStoreAncestral.insertChildOfParent(childId0);

      // grandchildren 1
      const childId1 = keyStoreAncestral.insertChildOfParent(keyStoreAncestral.rootNodeId);
      const children1_0 = keyStoreAncestral.insertChildOfParent(childId1);
      const children1_1 = keyStoreAncestral.insertChildOfParent(childId1);

      const actualGrandchildren0 = keyStoreAncestral.getChildrenIds(childId0);
      const actualGrandchildren1 = keyStoreAncestral.getChildrenIds(childId1);

      const actualChildren = keyStoreAncestral.getChildrenIds(keyStoreAncestral.rootNodeId);

      expect(actualGrandchildren0.sort()).toEqual([children0_1, children0_0].sort());
      expect(actualGrandchildren1.sort()).toEqual([children1_0, children1_1].sort());

      expect(actualChildren.sort()).toEqual([childId0, childId1].sort());
    });
    it("Should pull children and only children of given parent id", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const expectedRootChildren = [
        relations["childId0"],
        relations["childId1"],
        relations["childId2"],
      ];

      const actualRootChildren = keyStoreAncestral.getChildrenIds(
        keyStoreAncestral.rootNodeId
      );
      expect(actualRootChildren.sort()).toEqual(expectedRootChildren.sort());
    });
    it("Should return empty array for node without children", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const expectedChildren: string[] = [];

      const actualChildren = keyStoreAncestral.getChildrenIds(relations["children2_0_2"]);
      expect(actualChildren.sort()).toEqual(expectedChildren.sort());
    });
    it("Should return empty array parentId's that don't exists", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const expectedChildren: string[] = [];

      const actualChildren = keyStoreAncestral.getChildrenIds("DOES_NOT_EXISTS");
      expect(actualChildren.sort()).toEqual(expectedChildren.sort());
    });
  });
  describe("getDescendantIds", () => {
    it("Should get all descendant keys", () => {
      const keyStoreAncestral = new KeyStoreAncestral("theRoot");

      // grandchildren 0
      const childId0 = keyStoreAncestral.insertChildOfParent(keyStoreAncestral.rootNodeId);
      const children0_0 = keyStoreAncestral.insertChildOfParent(childId0);
      const children0_1 = keyStoreAncestral.insertChildOfParent(childId0);

      // grandchildren 1
      const childId1 = keyStoreAncestral.insertChildOfParent(keyStoreAncestral.rootNodeId);
      const children1_0 = keyStoreAncestral.insertChildOfParent(childId1);
      const children1_1 = keyStoreAncestral.insertChildOfParent(childId1);

      // exercise
      const actualRootDescendants = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      );

      // post condition
      const actualChild0Descendants = keyStoreAncestral.getDescendantIds(childId0);
      const actualChild1Descendants = keyStoreAncestral.getDescendantIds(childId1);

      const actualChild0_1Descendants = keyStoreAncestral.getDescendantIds(children1_0);
      const actualChild1_1Descendants = keyStoreAncestral.getDescendantIds(children1_0);

      expect(actualRootDescendants.sort()).toEqual(
        [childId0, children0_1, children0_0, childId1, children1_1, children1_0].sort()
      );
      expect(actualChild0Descendants.sort()).toEqual([children0_1, children0_0].sort());
      expect(actualChild1Descendants.sort()).toEqual([children1_0, children1_1].sort());
      expect(actualChild0_1Descendants).toEqual([]);
      expect(actualChild1_1Descendants).toEqual([]);
    });
    it("Should get all descendant keys (internal builder function)", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();

      const expectedAllDescendants = Object.entries(relations)
        .filter(([relation, nodeId]) => {
          return relation !== "root";
        })
        .map(([relation, nodeId]) => {
          return nodeId;
        });

      const expectedMiddleChildDescendants = [
        relations["children1_0"],
        relations["children1_1"],
        relations["children1_2"],
      ];

      const expectedLastChildDescendants = [
        relations["children2_0"],
        relations["children2_1"],
        relations["children2_0_0"],
        relations["children2_0_1"],
        relations["children2_0_2"],
      ];

      // exercise
      const actualRootDescendants = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      );

      const actualMiddleChildDescendants = keyStoreAncestral.getDescendantIds(
        relations["childId1"]
      );

      const actualLastChildDescendants = keyStoreAncestral.getDescendantIds(
        relations["childId2"]
      );

      expect(actualRootDescendants.sort()).toEqual(expectedAllDescendants.sort());
      expect(actualMiddleChildDescendants.sort()).toEqual(
        expectedMiddleChildDescendants.sort()
      );
      expect(actualLastChildDescendants.sort()).toEqual(expectedLastChildDescendants.sort());
    });
  });
  describe("getSiblingsIds", () => {
    it("Should return empty array for root siblings (root has no siblings)", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();

      const expectedRootSiblings: string[] = [];

      // exercise
      const actualRootSiblings = keyStoreAncestral.getSiblingIds(keyStoreAncestral.rootNodeId);
      expect(actualRootSiblings.sort()).toEqual(expectedRootSiblings.sort());
    });
    it("Should return sibling NodeIds for given nodeId", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();

      const expectedSiblingsOfChild0 = [
        // relations["childId0"],
        relations["childId1"],
        relations["childId2"],
      ];

      const expectedSiblingsOfChild2 = [
        relations["childId0"],
        relations["childId1"],
        // relations["childId2"],
      ];

      const expectedSiblingsOfGrandchild = [
        relations["children2_0_0"],
        relations["children2_0_1"],
        // relations["children2_0_2"],
      ];
      ("children2_0_0");

      // exercise
      const actualSiblingsOfChild0 = keyStoreAncestral.getSiblingIds(relations["childId0"]);
      const actualSiblingsOfChild2 = keyStoreAncestral.getSiblingIds(relations["childId2"]);
      const actualSiblingsOfGrandchildren = keyStoreAncestral.getSiblingIds(
        relations["children2_0_2"]
      );

      expect(actualSiblingsOfChild0.sort()).toEqual(expectedSiblingsOfChild0.sort());
      expect(actualSiblingsOfChild2.sort()).toEqual(expectedSiblingsOfChild2.sort());
      expect(actualSiblingsOfGrandchildren.sort()).toEqual(
        expectedSiblingsOfGrandchild.sort()
      );
    });
  });
  describe("deleteBranch", () => {
    it("Should throw error if trying to delete root", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const willThrow = () => {
        keyStoreAncestral.deleteBranch(keyStoreAncestral.rootNodeId);
      };
      expect(willThrow).toThrow("Cannot delete root");
    });
    it("Should throw error if trying to delete root", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const willThrow = () => {
        keyStoreAncestral.deleteBranch("DOES_NOT_EXIST");
      };
      expect(willThrow).toThrow("Key 'DOES_NOT_EXIST' does not exist in tree");
    });

    it("Should throw error if trying to delete root", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const willThrow = () => {
        keyStoreAncestral.deleteBranch("DOES_NOT_EXIST");
      };
      expect(willThrow).toThrow("Key 'DOES_NOT_EXIST' does not exist in tree");
    });

    it("Should delete one and only one key, if  node has no children", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const descendantCountBefore = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      ).length;
      const existsBefore = keyStoreAncestral.existsKey(relations["children2_0_1"]);

      // preConditions
      expect(descendantCountBefore).toBeGreaterThan(2);
      expect(existsBefore).toStrictEqual(true);

      // exercise
      keyStoreAncestral.deleteBranch(relations["children2_0_1"]);

      // postConditions
      const descendantCountAfter = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      ).length;
      const existsAfter = keyStoreAncestral.existsKey(relations["children2_0_1"]);

      expect(descendantCountAfter).toStrictEqual(descendantCountBefore - 1);
      expect(existsAfter).toStrictEqual(false);
      // expect(willThrow).toThrow("Key 'DOES_NOT_EXIST' does not exist in tree");
    });
    it("Should delete specified node and all descendants", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const keysInBranchCount = 4;

      const allKeysCountBefore = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      );

      const branchKeysCountBefore = keyStoreAncestral.getDescendantIds(relations["childId1"]);

      // preConditions
      branchKeysCountBefore.forEach((key) => {
        expect(keyStoreAncestral.existsKey(key)).toStrictEqual(true);
      });
      expect(branchKeysCountBefore.length + 1).toEqual(keysInBranchCount);

      // exercise
      keyStoreAncestral.deleteBranch(relations["childId1"]);

      const allKeysCountAfter = keyStoreAncestral.getDescendantIds(
        keyStoreAncestral.rootNodeId
      );

      const branchKeysAfter = keyStoreAncestral.getDescendantIds(relations["childId1"]);

      // postConditions
      branchKeysCountBefore.forEach((key) => {
        expect(keyStoreAncestral.existsKey(key)).toStrictEqual(false);
      });

      expect(allKeysCountAfter.length).toStrictEqual(
        allKeysCountBefore.length - keysInBranchCount
      );
      expect(branchKeysAfter).toStrictEqual([]);
    });
  });
  // describe.skip("insertKey", () => {
  //   it("Should not allow insert null parent", () => {});
  //   it("Should insert node as child of parent", () => {
  //     const keyStoreAncestral = new KeyStoreAncestral("theRoot");
  //     const childId = keyStoreAncestral.insertChildOfParent("theRoot");
  //   });
  // });
  // describe.skip("mergeBranch", () => {});
  describe.only("moveBranch", () => {
    it("Should move one brach to become child of other branch", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();
      const totalNodesBefore = keyStoreAncestral.getDescendantIds(relations["root"]);

      const descendantsOfTargetBefore = keyStoreAncestral.getDescendantIds(
        relations["childId0"]
      );

      const descendantsOfSourceBefore = keyStoreAncestral.getDescendantIds(
        relations["childId1"]
      );

      // exercise
      keyStoreAncestral.moveBranch(relations["childId1"], relations["childId0"]);

      const totalNodesAfter = keyStoreAncestral.getDescendantIds(relations["root"]);

      const descendantsOfTargetAfter = keyStoreAncestral.getDescendantIds(
        relations["childId0"]
      );

      const descendantsOfSourceAfter = keyStoreAncestral.getDescendantIds(
        relations["childId1"]
      );

      expect(totalNodesBefore.length).toEqual(totalNodesAfter.length);
      expect(descendantsOfTargetAfter.length).toEqual(
        descendantsOfTargetBefore.length + descendantsOfSourceBefore.length + 1
      );
      expect(descendantsOfSourceAfter).toEqual([]);
    });
    it("Should throw error if source and target are the same. ", () => {
      const [relations, keyStoreAncestral] = buildKeyStore();

      const willThrow = () => {
        keyStoreAncestral.moveBranch(relations["childId0"], relations["childId0"]);
      };

      expect(willThrow).toThrow(
        "Tried to move 'theRoot:1-uuid' on to itself. Cannot move branch to same parent"
      );
    });
    describe("Merge", () => {
      it("Should merge children from source into children of target", () => {
        const [relations, keyStoreAncestral] = buildKeyStore();
        const totalNodesBefore = keyStoreAncestral.getDescendantIds(relations["root"]);

        const childrenOfTargetBefore = keyStoreAncestral.getChildrenIds(relations["childId0"]);
        const childrenOfSrcBefore = keyStoreAncestral.getChildrenIds(relations["childId1"]);

        const descendantsOfTargetBefore = keyStoreAncestral.getDescendantIds(
          relations["childId0"]
        );

        const descendantsOfSourceBefore = keyStoreAncestral.getDescendantIds(
          relations["childId1"]
        );

        // exercise
        keyStoreAncestral.mergeBranches(relations["childId1"], relations["childId0"]);
        const childrenOfTargetAfter = keyStoreAncestral.getChildrenIds(relations["childId0"]);
        const childrenOfSrcAfter = keyStoreAncestral.getChildrenIds(relations["childId1"]);

        const totalNodesAfter = keyStoreAncestral.getDescendantIds(relations["root"]);

        const descendantsOfTargetAfter = keyStoreAncestral.getDescendantIds(
          relations["childId0"]
        );

        const descendantsOfSourceAfter = keyStoreAncestral.getDescendantIds(
          relations["childId1"]
        );

        expect(totalNodesBefore.length).toEqual(totalNodesAfter.length);
        expect(descendantsOfTargetAfter.length).toEqual(
          descendantsOfTargetBefore.length + descendantsOfSourceBefore.length
        );
        expect(childrenOfSrcAfter).toEqual([]);
        expect(descendantsOfSourceAfter).toEqual([]);

        expect(childrenOfTargetAfter.length).toEqual(
          childrenOfTargetBefore.length + childrenOfSrcBefore.length
        );
      });
    });
  });
});

const buildKeyStore = (): [{ [relationship: string]: string }, KeyStoreAncestral] => {
  const relations: { [relationship: string]: string } = { root: "theRoot" };

  relations["root"] = "theRoot";
  const keyStore = new KeyStoreAncestral(relations["root"]);

  // grandchildren
  relations["childId0"] = keyStore.insertChildOfParent(keyStore.rootNodeId);
  relations["children0_0"] = keyStore.insertChildOfParent(relations["childId0"]);
  relations["children0_1"] = keyStore.insertChildOfParent(relations["childId0"]);

  // grandchildren 1
  relations["childId1"] = keyStore.insertChildOfParent(keyStore.rootNodeId);
  relations["children1_0"] = keyStore.insertChildOfParent(relations["childId1"]);
  relations["children1_1"] = keyStore.insertChildOfParent(relations["childId1"]);
  relations["children1_2"] = keyStore.insertChildOfParent(relations["childId1"]);

  // grandchildren 2
  relations["childId2"] = keyStore.insertChildOfParent(keyStore.rootNodeId);
  relations["children2_0"] = keyStore.insertChildOfParent(relations["childId2"]);
  relations["children2_1"] = keyStore.insertChildOfParent(relations["childId2"]);

  // great grandchildren 0
  relations["children2_0_0"] = keyStore.insertChildOfParent(relations["children2_1"]);
  relations["children2_0_1"] = keyStore.insertChildOfParent(relations["children2_1"]);
  relations["children2_0_2"] = keyStore.insertChildOfParent(relations["children2_1"]);

  return [relations, keyStore];
};
