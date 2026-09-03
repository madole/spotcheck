import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

export interface StoredModel {
  id: string;
  name: string;
  byteLength: number;
  blob: Blob;
  addedAt: string;
}

interface ModelLibrarySchema extends DBSchema {
  models: {
    key: string;
    value: StoredModel;
  };
}

const DB_NAME = "r3f-inspection";
const DB_VERSION = 1;
const STORE = "models";

let connection: Promise<IDBPDatabase<ModelLibrarySchema>> | undefined;

function db(): Promise<IDBPDatabase<ModelLibrarySchema>> {
  connection ??= openDB<ModelLibrarySchema>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });

  return connection;
}

export async function getModel(id: string): Promise<StoredModel | undefined> {
  return (await db()).get(STORE, id);
}

export async function putModel(model: StoredModel): Promise<void> {
  await (await db()).put(STORE, model);
}

export async function listModels(): Promise<StoredModel[]> {
  return (await db()).getAll(STORE);
}

export function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}
