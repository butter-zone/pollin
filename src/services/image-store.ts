/**
 * image-store.ts
 *
 * IndexedDB-backed, content-addressed image storage for Pollin.
 *
 * Canvas objects with `kind: 'image'` previously stored multi-MB base64 data
 * URIs directly in the object tree.  Because the undo/redo stack keeps up to
 * 50 snapshots — each a full copy of every object — memory usage ballooned
 * quickly.
 *
 * This module moves the heavy payload into IndexedDB and replaces it with a
 * lightweight reference string (`pollin-img://<sha256>`).  Duplicate images
 * are stored only once thanks to content-addressing.
 *
 * If IndexedDB is unavailable the service degrades gracefully: `storeImage`
 * returns the original data URL and `loadImage` returns whatever it receives.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'pollin-images';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;
const REF_PREFIX = 'pollin-img://';
const LRU_MAX = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a record persisted in the `blobs` object store. */
interface BlobRecord {
  /** SHA-256 hex digest — also the keyPath. */
  hash: string;
  /** The original data-URL string. */
  dataUrl: string;
}

export interface StorageStats {
  /** Number of images currently stored. */
  count: number;
  /** Rough byte estimate (sum of data-URL string lengths × 2 for UTF-16). */
  estimatedBytes: number;
}

// ---------------------------------------------------------------------------
// LRU cache
// ---------------------------------------------------------------------------

/**
 * Minimal LRU cache backed by a `Map`.  `Map` iteration order is insertion
 * order, so we delete-and-re-insert on access to keep the most-recently-used
 * entry at the tail.
 */
class LruCache<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly max: number) {}

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value !== undefined) {
      // Move to end (most-recently-used).
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      // Evict least-recently-used (first key).
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) {
        this.map.delete(oldest);
      }
    }
    this.map.set(key, value);
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** Cached database connection (lazy-opened). */
let dbPromise: Promise<IDBDatabase> | null = null;

/** `true` once we detect that IndexedDB is not usable. */
let idbUnavailable = false;

/** In-memory LRU so hot images skip the IndexedDB round-trip. */
const cache = new LruCache<string, string>(LRU_MAX);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Open (or create) the IndexedDB database.  The returned promise is cached so
 * subsequent calls reuse the same connection.
 */
function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'hash' });
        }
      };

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => {
        idbUnavailable = true;
        reject(request.error);
      };
    } catch (err) {
      idbUnavailable = true;
      reject(err);
    }
  });

  // If the promise rejects, reset so a future call can retry once.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

/**
 * Compute the SHA-256 hex digest of a string using the Web Crypto API.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Run a single-store IndexedDB transaction and return a promise that resolves
 * when the transaction completes.
 *
 * @param mode  `'readonly'` or `'readwrite'`
 * @param fn    Callback receiving the object store — perform IDB operations here.
 * @returns     Whatever `fn` resolves to.
 */
async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);

    tx.oncomplete = () => resolve(req ? (req.result as T) : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check whether a string is a Pollin image reference (`pollin-img://…`).
 */
export function isImageRef(value: string): boolean {
  return value.startsWith(REF_PREFIX);
}

/**
 * Store a data-URL in IndexedDB and return a lightweight reference string.
 *
 * If the exact same image (by content hash) is already stored the existing
 * reference is returned immediately without writing again.
 *
 * **Fallback:** if IndexedDB is unavailable the original `dataUrl` is returned
 * unchanged so the rest of the application keeps working.
 *
 * @param dataUrl  A base64-encoded data URI (e.g. `data:image/png;base64,…`).
 * @returns        A reference string of the form `pollin-img://<sha256>`.
 */
export async function storeImage(dataUrl: string): Promise<string> {
  // If it's already a reference, return as-is.
  if (isImageRef(dataUrl)) return dataUrl;

  // Fast path: if IDB is known-bad, skip everything.
  if (idbUnavailable) return dataUrl;

  try {
    const hash = await sha256(dataUrl);
    const ref = `${REF_PREFIX}${hash}`;

    // Populate the LRU cache immediately so a subsequent `loadImage` is free.
    cache.set(hash, dataUrl);

    // Check if the record already exists to avoid a pointless write.
    const existing = await withStore<BlobRecord>('readonly', (store) =>
      store.get(hash),
    );

    if (!existing) {
      const record: BlobRecord = { hash, dataUrl };
      await withStore<IDBValidKey>('readwrite', (store) => store.put(record));
    }

    return ref;
  } catch {
    // IndexedDB failed — degrade to keeping the data URL.
    idbUnavailable = true;
    return dataUrl;
  }
}

/**
 * Load the original data URL for a `pollin-img://…` reference.
 *
 * Results are served from an in-memory LRU cache when possible so that hot
 * images (e.g. during rapid undo/redo) avoid the IndexedDB round-trip.
 *
 * @param ref  A reference string previously returned by `storeImage`.
 * @returns    The original data URL.
 * @throws     If the reference is not found in IndexedDB.
 */
export async function loadImage(ref: string): Promise<string> {
  // If it's not a reference (fallback mode or plain URL), return as-is.
  if (!isImageRef(ref)) return ref;

  const hash = ref.slice(REF_PREFIX.length);

  // 1. Try the LRU cache first.
  const cached = cache.get(hash);
  if (cached !== undefined) return cached;

  // 2. Fall back to IndexedDB.
  if (idbUnavailable) {
    throw new Error(`Image store unavailable and no cache entry for ${ref}`);
  }

  try {
    const record = await withStore<BlobRecord>('readonly', (store) =>
      store.get(hash),
    );

    if (!record) {
      throw new Error(`Image not found in store: ${ref}`);
    }

    // Populate the cache for next time.
    cache.set(hash, record.dataUrl);
    return record.dataUrl;
  } catch (err) {
    // Re-throw application errors (not-found) as-is.
    if (err instanceof Error && err.message.startsWith('Image')) throw err;
    // For unexpected IDB errors, mark unavailable.
    idbUnavailable = true;
    throw new Error(`Failed to load image ${ref}: ${err}`);
  }
}

/**
 * Delete a single image by its reference.
 *
 * @param ref  A `pollin-img://…` reference string.
 */
export async function deleteImage(ref: string): Promise<void> {
  if (!isImageRef(ref)) return;

  const hash = ref.slice(REF_PREFIX.length);
  cache.delete(hash);

  if (idbUnavailable) return;

  try {
    await withStore('readwrite', (store) => store.delete(hash));
  } catch {
    // Silently ignore — the entry may already be gone.
  }
}

/**
 * Remove every stored image whose reference is **not** in `activeRefs`.
 *
 * This is intended to be called periodically (e.g. after an undo stack trim)
 * to reclaim IndexedDB space used by images that are no longer reachable from
 * any snapshot.
 *
 * @param activeRefs  The set of `pollin-img://…` references still in use.
 * @returns           The number of images that were deleted.
 */
export async function collectGarbage(activeRefs: Set<string>): Promise<number> {
  if (idbUnavailable) return 0;

  // Build a set of hashes that should be kept.
  const keepHashes = new Set<string>();
  for (const ref of activeRefs) {
    if (isImageRef(ref)) {
      keepHashes.add(ref.slice(REF_PREFIX.length));
    }
  }

  try {
    const db = await openDb();

    return new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const cursorReq = store.openCursor();
      let deleted = 0;

      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return; // iteration complete — tx.oncomplete fires next.

        const hash = cursor.key as string;
        if (!keepHashes.has(hash)) {
          cursor.delete();
          cache.delete(hash);
          deleted++;
        }
        cursor.continue();
      };

      tx.oncomplete = () => resolve(deleted);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Return approximate storage statistics for the image store.
 */
export async function getStorageStats(): Promise<StorageStats> {
  if (idbUnavailable) return { count: 0, estimatedBytes: 0 };

  try {
    const db = await openDb();

    return new Promise<StorageStats>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const cursorReq = store.openCursor();
      let count = 0;
      let estimatedBytes = 0;

      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return;

        const record = cursor.value as BlobRecord;
        count++;
        // Each JS char is stored as 2 bytes (UTF-16). The hash field adds a
        // negligible fixed overhead so we only count the data URL.
        estimatedBytes += record.dataUrl.length * 2;
        cursor.continue();
      };

      tx.oncomplete = () => resolve({ count, estimatedBytes });
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    return { count: 0, estimatedBytes: 0 };
  }
}
