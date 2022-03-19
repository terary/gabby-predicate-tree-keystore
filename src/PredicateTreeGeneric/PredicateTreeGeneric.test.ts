import { PredicateTreeGeneric } from "./PredicateTreeGeneric";

type TPredicate = {
  value: string;
  dataType: string;
  subjectId: string;
};
// type TPayload = TPredicate | PredicateTreeGeneric<TPredicate>;
type TPayload = TPredicate | PredicateTreeGeneric<TPredicate>; // I dont love this.
// This is a recursive definition. Where a node could be a leaf node or another tree node. (address field with several nodes and its own truth value)

describe("PredicateTreeGeneric", () => {
  describe("Insert Node", () => {
    it("Should insert a payload into a root as parent (single node root)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("the root"));
      const childrenIdsBefore = tree.getChildrenIds(tree.rootNodeId);

      // preConditions
      expect(childrenIdsBefore.length).toBe(0);

      // exercise
      const child = tree.insertNode(tree.rootNodeId, makePayload("the child"));

      // postConditions;
      const childrenIdsAfter = tree.getChildrenIds(tree.rootNodeId);
      expect(childrenIdsAfter.length).toBe(2);

      const payloads = tree.getChildrenPayloads(tree.rootNodeId);
      expect(payloads.length).toBe(2);
      expect(payloads.sort()).toStrictEqual(
        [makePayload("the root"), makePayload("the child")].sort()
      );

      expect(tree.getPayload(tree.rootNodeId)).toBe("$and");
      expect(tree.getChildrenIds(child)).toStrictEqual([]);
    });
    it("Should insert a payload into a root as parent (single node root)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("root"));

      expect(tree.getChildrenIds(tree.rootNodeId)).toStrictEqual([]);
      expect(tree.getPayload(tree.rootNodeId)).toStrictEqual(makePayload("root"));
    });
    it("Should insert a payload into a root as parent (single node root)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("root"));

      const child0 = tree.insertNode(tree.rootNodeId, makePayload("child0"));
      expect(tree.getChildrenIds(tree.rootNodeId).length).toBe(2);

      const childrenPayload = tree.getChildrenPayloads(tree.rootNodeId);
      const rootPayload = tree.getPayload(tree.rootNodeId);
      expect(rootPayload).toStrictEqual({ operator: "$and" });
      expect(childrenPayload.sort()).toStrictEqual(
        [makePayload("root"), makePayload("child0")].sort()
      );
    });

    it.only("Should insert a payload into a root as parent (single node root)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("root"));

      const child0 = tree.insertNode(tree.rootNodeId, makePayload("child0"));
      const child1 = tree.insertNode(tree.rootNodeId, makePayload("child1"));
      expect(tree.getChildrenIds(tree.rootNodeId).length).toBe(3);

      const childrenPayload = tree.getChildrenPayloads(tree.rootNodeId);
      const rootPayload = tree.getPayload(tree.rootNodeId);
      expect(rootPayload).toStrictEqual({ operator: "$and" });
      expect(childrenPayload.sort()).toStrictEqual(
        [makePayload("root"), makePayload("child0"), makePayload("child1")].sort()
      );
    });
    // I think its best:
    //  - getChildrenIds
    //  - getBranches
    //  - getLeafs
    //  - getTrees (or that doesn't matter?)
    //  - getPayload(id) -> tree, branch, leaf better to use get[branch, leaf, tree] which guarantees (or throws)

    it.only("Should insert a payload into a root as parent (grandchildren)", () => {
      //                   A
      //                  / \
      //                 B   C
      //                /  \
      //               D    E
      //

      // exercise
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("root"));
      const nodeUuid_C = tree.insertNode(tree.rootNodeId, makePayload("child0"));
      const grandchild0 = tree.insertNode(nodeUuid_C, makePayload("grandchild0"));

      const nodeUuid_A = tree.rootNodeId;
      const nodeUuid_B = tree.getSiblingsIds(nodeUuid_C).pop() || "_NOT_FOUND_";

      // postConditions
      // A
      expect(tree.getChildrenIds(nodeUuid_A).length).toBe(2);
      expect(tree.getNodeType(nodeUuid_A)).toStrictEqual("BRANCH");
      expect(tree.getPayload(nodeUuid_A)).toStrictEqual({
        operator: "$and",
      });

      // C
      expect(tree.getChildrenIds(nodeUuid_C).length).toBe(2);
      expect(tree.getNodeType(nodeUuid_C)).toStrictEqual("BRANCH");
      expect(tree.getPayload(nodeUuid_C)).toStrictEqual({
        operator: "$and",
      });

      // B
      expect(tree.getNodeType(nodeUuid_B)).toBe("LEAF");
      expect(tree.getPayload(nodeUuid_B)).toStrictEqual(makePayload("root"));

      // leaf0, payload0

      // D_E
      const nodeUuid_D_E = tree.getChildrenIds(nodeUuid_C);
      expect(nodeUuid_D_E.length).toBe(2);
      expect(nodeUuid_D_E.map((id) => tree.getNodeType(id))).toStrictEqual(["LEAF", "LEAF"]);

      const grandchildrenPayloads = tree.getChildrenPayloads(nodeUuid_C) as TPredicate[];
      // leaf1 & leaf2, payload1 & payload2
      expect(grandchildrenPayloads.sort(sortPayload)).toStrictEqual(
        [makePayload("grandchild0"), makePayload("child0")].sort(sortPayload)
      );
    });

    it("Should insert a payload into a root as parent  (single node root) (with optional junction operator)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("the root"));
      const childrenIdsBefore = tree.getChildrenIds(tree.rootNodeId);

      // preConditions
      expect(childrenIdsBefore.length).toBe(0);

      // exercise
      const child = tree.insertNode(tree.rootNodeId, makePayload("the child"), "$nor");

      // postConditions;
      const childrenIdsAfter = tree.getChildrenIds(tree.rootNodeId);
      expect(childrenIdsAfter.length).toBe(2);

      const payloads = tree.getChildrenPayloads(tree.rootNodeId);
      expect(payloads.length).toBe(2);
      expect(payloads.sort()).toStrictEqual(
        [makePayload("the root"), makePayload("the child")].sort()
      );

      expect(tree.getPayload(tree.rootNodeId)).toBe("$nor");
      expect(tree.getChildrenIds(child)).toStrictEqual([]);
    });

    it("Should insert a payload into a root as parent  (multiple node root)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("the root"));
      const child0 = tree.insertNode(tree.rootNodeId, makePayload("child0"));
      const childrenIdsBefore = tree.getChildrenIds(tree.rootNodeId);

      // preConditions
      expect(childrenIdsBefore.length).toBe(2);

      // exercise
      const child1 = tree.insertNode(tree.rootNodeId, makePayload("child1"));

      // postConditions;
      const childrenIdsAfter = tree.getChildrenIds(tree.rootNodeId);
      expect(childrenIdsAfter.length).toBe(3);

      const payloads = tree.getChildrenPayloads(tree.rootNodeId);
      expect(payloads.length).toBe(3);
      expect(payloads.sort()).toStrictEqual(
        [makePayload("the root"), makePayload("child0"), makePayload("child1")].sort()
      );

      expect(tree.getPayload(tree.rootNodeId)).toBe("$and");
    });

    it("Should insert a payload into child of root as parent (grandchild)", () => {
      // setup
      const tree = new PredicateTreeGeneric<TPayload>("root", makePayload("root"));

      const childrenIdsBefore = tree.getChildrenIds(tree.rootNodeId);

      // preConditions
      expect(childrenIdsBefore.length).toBe(0);

      // exercise
      const child0 = tree.insertNode(tree.rootNodeId, makePayload("child0"));
      const grandchild_0_0 = tree.insertNode(child0, makePayload("grandchild:0:0"));
      const grandchild_0_1 = tree.insertNode(child0, makePayload("grandchild:0:1"));

      // postConditions;
      const childrenIdsAfter = tree.getChildrenIds(tree.rootNodeId);
      const rootChildrenPayloads = tree.getChildrenPayloads(tree.rootNodeId);
      const grandchildrenPayloads = tree.getChildrenPayloads(child0);

      expect(rootChildrenPayloads.sort()).toStrictEqual([
        { operator: "$and" },
        makePayload("root"),
        // { operator: "$and" },
      ]);

      expect(grandchildrenPayloads.sort()).toStrictEqual(
        [
          // makePayload("the root"),
          // makePayload("child0"),
          makePayload("grandchild:0:0"),
          makePayload("grandchild:0:1"),
          // { operator: "$and" },
          // { operator: "$and" },
        ].sort()
      );

      expect(tree.getPayload(tree.rootNodeId)).toBe("$and");
      expect(tree.getPayload(child0)).toBe("$and");
    });
  });
  describe("getChildren", () => {
    it("should get children of a node", () => {
      const tree = new PredicateTreeGeneric("root", {});
      const child = tree.insertNode("root", {});
      const child2 = tree.insertNode(child, {});
      expect(tree.getChildrenIds("root")).toEqual([child, child2]);
    });
  });
});

const makePayload = (value: string = "the value") => {
  return {
    value,
    dataType: "string",
    subjectId: "the-subject-id",
  };
};
const sortPayload = (a: TPredicate, b: TPredicate) => {
  if (a.value === b.value) {
    return 0;
  } else if (a.value > b.value) {
    return 1;
  }
  return -1;
};
