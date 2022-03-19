import { v4 as uuidv4 } from "uuid";
import { IKeyStore } from "./IKeyStore";

export class KeyStore implements IKeyStore {
  private _keyStore: { [key: string]: string } = {};
  constructor() {}

  public get(nodeIdUuid: string): string {
    return this._keyStore[nodeIdUuid];
  }
  public put(nodeId: string): string {
    const nodeIdUuid = uuidv4();
    this._keyStore[nodeIdUuid] = nodeId;
    return nodeIdUuid;
  }

  public remove(nodeIdUuid: string): void {
    delete this._keyStore[nodeIdUuid];
  }
  public reverseGet(...nodeId: string[]): string[] {
    // copilot written - not tested
    return nodeId.map((id) => this._keyStore[id]);
  }

  public exists(nodeIdUuid: string): boolean {
    return this._keyStore[nodeIdUuid] !== undefined;
  }
}
