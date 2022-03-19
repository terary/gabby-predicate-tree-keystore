import { v4 as uuidv4 } from "uuid";
import { IKeyStore } from "./IKeyStore";

export class PseudoKeyStore implements IKeyStore {
  private _keyStore: { [key: string]: string } = {};
  constructor() {}

  public get(nodeIdUuid: string): string {
    return this._keyStore[nodeIdUuid];
  }
  public put(nodeId: string): string {
    const nodeIdUuid = `${nodeId}-uuid`;
    this._keyStore[nodeIdUuid] = nodeId;
    return nodeIdUuid;
  }

  public remove(nodeIdUuid: string): void {
    delete this._keyStore[nodeIdUuid];
  }

  public reverseGet(...nodeId: string[]): string[] {
    return nodeId.map((id) => this.getKeyByValue(id));
  }

  public exists(nodeIdUuid: string): boolean {
    return this._keyStore[nodeIdUuid] !== undefined;
  }

  private getKeyByValue(value: string): string {
    const key = Object.keys(this._keyStore).find((key) => this._keyStore[key] === value);
    if (!key) {
      throw new Error(`Key not found for value: ${value}`);
    }
    return key;
  }
}
