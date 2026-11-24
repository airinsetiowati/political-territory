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
    // Also mirror to localStorage for cross-tab multi-window synchronization
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('Failed to save state', e);
  }
}

export function getSessionState<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined') {
      const sVal = window.sessionStorage ? window.sessionStorage.getItem(key) : null;
      if (sVal) return JSON.parse(sVal) as T;
      const lVal = window.localStorage ? window.localStorage.getItem(key) : null;
      if (lVal) return JSON.parse(lVal) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function clearSessionState() {
  try {
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) window.sessionStorage.clear();
      if (window.localStorage) {
        // Clear game-specific keys
        const keys = ['pt_players', 'pt_territories', 'pt_policy_cards', 'pt_crisis_cards', 'pt_mission_cards', 'pt_opp_cards', 'pt_logs', 'pt_settings', 'pt_economy', 'pt_dice'];
        keys.forEach(k => window.localStorage.removeItem(k));
      }
    }
  } catch (e) {
    console.warn('Failed to clear state', e);
  }
}

// Multi-tab synchronization BroadcastChannel
export const gameSyncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('political_territory_sync')
  : null;

export function broadcastGameEvent(event: { type: string; payload: any }) {
  try {
    if (gameSyncChannel) {
      gameSyncChannel.postMessage(event);
    }
  } catch (err) {
    console.warn('Failed to broadcast game event:', err);
  }
}

// Backward compatible aliases pointing to persistent storage
export const saveLocalState = saveSessionState;
export const getLocalState = getSessionState;
