import { KeyStore } from "./KeyStore";
describe("KeyStore", () => {
  describe(".put", () => {
    it("should return a uuid", () => {
      const keyStore = new KeyStore();
      const nodeId = keyStore.put("nodeId");
      expect(nodeId).toBeDefined();
      expect(nodeId.length).toBe(36);
    });
  }); // describe ".put"
  describe(".getKey", () => {
    it("should return the nodeId", () => {
      const keyStore = new KeyStore();
      const nodeId = keyStore.put("nodeId");
      expect(keyStore.get(nodeId)).toBe("nodeId");
    });
  });
  describe(".removeKey", () => {
    it("should remove the key", () => {
      const keyStore = new KeyStore();
      const nodeId = keyStore.put("nodeId");
      keyStore.remove(nodeId);
      expect(keyStore.get(nodeId)).toBeUndefined();
    });
  });
  describe(".exists", () => {
    it("should return true if the key exists", () => {
      const keyStore = new KeyStore();
      const nodeId = keyStore.put("nodeId");
      expect(keyStore.exists(nodeId)).toBe(true);
    });
    it("should return false if the key does not exist", () => {
      const keyStore = new KeyStore();
      const nodeId = keyStore.put("nodeId");
      keyStore.remove(nodeId);
      expect(keyStore.exists(nodeId)).toBe(false);
    });
  });
});
