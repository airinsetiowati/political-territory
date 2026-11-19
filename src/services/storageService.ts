const DB_NAME = 'PoliticalTerritoryDB';
const DB_VERSION = 1;
const IMAGE_STORE = 'custom_images';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImageToDB(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    const store = tx.objectStore(IMAGE_STORE);
    store.put({ key, dataUrl, updatedAt: new Date().toISOString() });
    return new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save image in IndexedDB, falling back to memory/local', err);
  }
}

export async function getImageFromDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const req = store.get(key);
    return new Promise((res, rej) => {
      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) res(req.result.dataUrl);
        else res(null);
      };
      req.onerror = () => rej(req.error);
    });
  } catch {
    return null;
  }
}

export async function getAllImagesFromDB(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const req = store.getAll();
    return new Promise((res, rej) => {
      req.onsuccess = () => {
        const result: Record<string, string> = {};
        if (Array.isArray(req.result)) {
          req.result.forEach((item: any) => {
            if (item && item.key && item.dataUrl) {
              result[item.key] = item.dataUrl;
            }
          });
        }
        res(result);
      };
      req.onerror = () => rej(req.error);
    });
  } catch {
    return {};
  }
}

export function saveSessionState(key: string, data: any) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Failed to save to sessionStorage', e);
  }
}

export function getSessionState<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const val = window.sessionStorage.getItem(key);
      if (!val) return fallback;
      return JSON.parse(val) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function clearSessionState() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  } catch (e) {
    console.warn('Failed to clear sessionStorage', e);
  }
}

// Backward compatible aliases pointing strictly to temporary sessionStorage
export const saveLocalState = saveSessionState;
export const getLocalState = getSessionState;
