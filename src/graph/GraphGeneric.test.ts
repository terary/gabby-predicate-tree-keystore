import { GraphGeneric, NodeNotFoundError } from "./GraphGeneric";
import type { Vertices } from "./GraphGeneric";
import { clone } from "lodash";

type TestPayloadType = {
  name: string;
  age: number;
  tag: string;
};

class WrapperExposeProtected<T> extends GraphGeneric<T> {
  findNode(nodeId: string): Vertices<T> {
    return this._findNode(nodeId);
  }
}

describe("GraphGeneric", () => {
  it("should create an instance", () => {
    const payload = {
      name: "root payload",
      age: 3,
      tag: "root tag",
    };
    const x = new GraphGeneric<TestPayloadType>("root", payload);
    expect(x).toBeTruthy();
  });
  describe(".clone", () => {
    it.skip("should produce copy from given nodeId", () => {
      const [valuesMap, graph] = loadGraphWrapper();
      const targetId = valuesMap["child1grandchild1"].nodeId;
      const clonedGraph = graph.clone(targetId);

      // need to test -
      //     change in  payload  a does not effect payload b
      //     change in  node A (delete/add change) does not happen on B

      // Want to use 'duplateAt', which will return branch (not tree) cloned nodes (new ids)

      // const cloneGreatGrandChild = clonedGraph.findNode(
      //   valuesMap["child1grandchild1GreatGrandchild1"].nodeId
      // );

      // expect(clonedGraph.getNodeIds()).toEqual(["root", "child1", "child1grandchild1"]);
    });
  });

  describe(".insertPayload", () => {
    it("should insert payload and return node key", () => {
      const payload = {
        name: "root payload",
        age: 3,
        tag: "root tag",
      };
      const child0 = {
        name: "child0 payload",
        age: 3,
        tag: "root child 0",
      };
      const child1 = {
        name: "child1 payload",
        age: 3,
        tag: "root child 1",
      };
      const child1grandchild0 = {
        name: "child1 grand child 0",
        age: 3,
        tag: "first child of second child of root",
      };
      const graph = new GraphGeneric<TestPayloadType>("root", payload);
      const child0Id = graph.insertPayload("root", child0);
      const child1Id = graph.insertPayload("root", child1);
      const child1grandchild0Id = graph.insertPayload(child1Id, child1);
      expect(child0Id).toBeTruthy();
      expect(child1Id).toBeTruthy();
      expect(child1grandchild0Id).toBeTruthy();
    });
  }); // describe(".insertPayload"
  describe("._findNode / insertPayload", () => {
    it("Should throw error if not found (root)", () => {
      const [valuesMap, graph] = loadGraphWrapper();
      const willThrow = () => {
        graph.findNode("DOES_NOT_EXIST");
      };

      expect(willThrow).toThrow("Node 'DOES_NOT_EXIST' not found");
      expect(willThrow).toThrow(NodeNotFoundError);
    });
    it("Should throw error if not found (child)", () => {
      const [valuesMap, graph] = loadGraphWrapper();
      const willThrow = () => {
        graph.findNode("root:DOES_NOT_EXIST");
      };

      expect(willThrow).toThrow("Node 'root:DOES_NOT_EXIST' not found");
      expect(willThrow).toThrow(NodeNotFoundError);
    });
    it("Should throw error if not found (grandchild)", () => {
      const [valuesMap, graph] = loadGraphWrapper();
      const willThrow = () => {
        graph.findNode("root:0:DOES_NOT_EXIST");
      };

      expect(willThrow).toThrow("Node 'root:0:DOES_NOT_EXIST' not found");
      expect(willThrow).toThrow(NodeNotFoundError);
    });
    it("Should insert payload several descendants and retrieve them with nodeId", () => {
      const [valueMap, graph] = loadGraphWrapper();

      // make sure we are are doing something
      expect(Object.keys(valueMap).length).toBe(9);

      Object.entries(valueMap).forEach(([nodeId, node]) => {
        let foundNode = { payload: undefined };
        // *tmc* - I think this was used for dev only
        try {
          // @ts-ignore
          foundNode = graph.findNode(node.nodeId);
        } catch (e) {
          console.log(e);
        }

        if (foundNode.payload !== node.node) {
          console.log(`nodeId: ${nodeId}`);
          console.log(`foundNode: ${JSON.stringify(foundNode)}`);
          console.log(`node: ${JSON.stringify(node)}`);
        }
        expect(foundNode.payload).toStrictEqual(node.node);
      });
    }); // it('should be awesome')
  }); // describe("._findNode",
});

type loadGraphWrapperValueMapperType = { [key: string]: { node: any; nodeId: string } };
const loadGraphWrapper = (): [
  loadGraphWrapperValueMapperType,
  WrapperExposeProtected<TestPayloadType>
] => {
  const valuesMap: { [id: string]: any } = {};

  valuesMap["rootPayload"] = {
    node: {
      name: "root payload",
      testId: 0,
      tag: "root tag",
    },
  };
  const graph = new WrapperExposeProtected<TestPayloadType>(
    "root",
    valuesMap["rootPayload"].node
  );
  valuesMap["rootPayload"].nodeId = "root";

  valuesMap["child0"] = {
    node: {
      name: "child0 payload",
      testId: 1,
      tag: "root child 0",
    },
  };
  valuesMap["child0"].nodeId = graph.insertPayload("root", valuesMap["child0"].node);

  valuesMap["child1"] = {
    node: {
      name: "child1 payload",
      testId: 2,
      tag: "root child 1",
    },
  };
  valuesMap["child1"].nodeId = graph.insertPayload("root", valuesMap["child1"].node);

  valuesMap["child1grandchild0"] = {
    node: {
      name: "child1 grand child 0",
      testId: 3,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild0"].nodeId = graph.insertPayload(
    valuesMap["child1"].nodeId,
    valuesMap["child1grandchild0"].node
  );

  valuesMap["child1grandchild1"] = {
    node: {
      name: "child1 grand child 1",
      testId: 4,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild1"].nodeId = graph.insertPayload(
    valuesMap["child1"].nodeId,
    valuesMap["child1grandchild1"].node
  );

  valuesMap["child1grandchild2"] = {
    node: {
      name: "child1 grand child 2",
      testId: 5,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild2"].nodeId = graph.insertPayload(
    valuesMap["child1"].nodeId,
    valuesMap["child1grandchild2"].node
  );

  valuesMap["child1grandchild1GreatGrandchild0"] = {
    node: {
      name: "child1 grandchild 1 great grandchild 0",
      testId: 6,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild1GreatGrandchild0"].nodeId = graph.insertPayload(
    valuesMap["child1grandchild1"].nodeId,
    valuesMap["child1grandchild1GreatGrandchild0"].node
  );

  valuesMap["child1grandchild1GreatGrandchild1"] = {
    node: {
      name: "child1 grandchild 1 great grandchild 1",
      testId: 7,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild1GreatGrandchild1"].nodeId = graph.insertPayload(
    valuesMap["child1grandchild1"].nodeId,
    valuesMap["child1grandchild1GreatGrandchild1"].node
  );

  valuesMap["child1grandchild1GreatGrandchild2"] = {
    node: {
      name: "child1 grandchild 1 great grandchild 2",
      testId: 8,
      tag: "first child of second child of root",
    },
  };
  valuesMap["child1grandchild1GreatGrandchild2"].nodeId = graph.insertPayload(
    valuesMap["child1grandchild1"].nodeId,
    valuesMap["child1grandchild1GreatGrandchild2"].node
  );

  return [valuesMap as loadGraphWrapperValueMapperType, graph];
};
