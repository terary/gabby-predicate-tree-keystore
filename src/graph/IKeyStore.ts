export interface IKeyStore {
  get(nodeIdUuid: string): string;
  put(nodeId: string): string;
  remove(nodeIdUuid: string): void;
  exists(nodeIdUuid: string): boolean;
  reverseGet(...nodeId: string[]): string[];
}
