import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

export interface StoredModel {
  id: string;
  name: string;
  byteLength: number;
  blob: Blob;
  addedAt: string;
}

export interface StoredSession {
  key: "working";
  project: string;
}

interface ModelLibrarySchema extends DBSchema {
  models: {
    key: string;
    value: StoredModel;
  };
  sessions: {
    key: string;
    value: StoredSession;
  };
}

const DB_NAME = "spotcheck";
const DB_VERSION = 2;
const STORE = "models";
const SESSION_STORE = "sessions";

let connection: Promise<IDBPDatabase<ModelLibrarySchema>> | undefined;

function db(): Promise<IDBPDatabase<ModelLibrarySchema>> {
  connection ??= openDB<ModelLibrarySchema>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "id" });
      }

      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        database.createObjectStore(SESSION_STORE, { keyPath: "key" });
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

export async function getSession(): Promise<StoredSession | undefined> {
  return (await db()).get(SESSION_STORE, "working");
}

export async function putSession(project: string): Promise<void> {
  await (await db()).put(SESSION_STORE, { key: "working", project });
}

export function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}
