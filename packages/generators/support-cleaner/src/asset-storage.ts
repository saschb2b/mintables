"use client";

const DATABASE_NAME = "mintables-imported-models";
const STORE_NAME = "stl-assets";
const DATABASE_VERSION = 1;

interface StoredAsset {
  id: string;
  name: string;
  file: Blob;
  createdAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Storage failed."));
  });
}

export async function saveImportedAsset(
  id: string,
  name: string,
  file: Blob,
): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({
      id,
      name,
      file,
      createdAt: Date.now(),
    } satisfies StoredAsset);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Storage failed."));
  });
  database.close();
}

export async function loadImportedAsset(
  id: string,
): Promise<StoredAsset | null> {
  const database = await openDatabase();
  const result = await new Promise<StoredAsset | null>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(id);
    request.onsuccess = () =>
      resolve((request.result as StoredAsset | undefined) ?? null);
    request.onerror = () =>
      reject(request.error ?? new Error("Storage failed."));
  });
  database.close();
  return result;
}
