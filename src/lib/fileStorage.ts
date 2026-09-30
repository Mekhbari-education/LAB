import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Database name and store for local files
const IDB_NAME = 'LabOfflineFilesDB';
const IDB_STORE = 'files_store';
const IDB_VERSION = 1;

/**
 * Initializes and returns the IndexedDB database instance.
 */
function openFilesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a file to IndexedDB locally.
 */
export async function saveFileToIndexedDB(id: string, file: Blob | File, metadata: { name: string; type: string; size: number }): Promise<void> {
  const db = await openFilesDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    
    const record = {
      id,
      blob: file,
      name: metadata.name,
      type: metadata.type,
      size: metadata.size,
      updatedAt: Date.now()
    };

    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a file from IndexedDB by its unique ID.
 */
export async function getFileFromIndexedDB(id: string): Promise<{ blob: Blob; name: string; type: string } | null> {
  try {
    const db = await openFilesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result) {
          resolve({
            blob: req.result.blob,
            name: req.result.name,
            type: req.result.type
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[FileStorage] Error reading from IndexedDB:', err);
    return null;
  }
}

/**
 * Removes a file from IndexedDB by its unique ID.
 */
export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openFilesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[FileStorage] Error deleting from IndexedDB:', err);
  }
}

/**
 * Converts a File or Blob into a base64 Data URL.
 */
export function fileToDataUrl(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
}

export interface StoredFileResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageType: 'cloud' | 'inline' | 'local';
}

/**
 * Uploads a file with resilient fallback.
 * 1. Attempts Firebase Storage upload with a strict timeout (default 3000ms).
 * 2. If storage times out, is disabled, unauthorized, or CORS blocked:
 *    - If <= 700KB: converts to base64 Data URL so it is universally accessible across sessions.
 *    - Saves to IndexedDB for instant, unlimited-size local caching & offline reading.
 *    - Never throws an upload error that blocks the user from saving their document.
 */
export async function saveFileWithResilientFallback(
  file: File,
  storagePath: string,
  timeoutMs = 3000
): Promise<StoredFileResult> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
  const uniqueId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Try Firebase Storage with strict timeout
  try {
    const fileRef = ref(storage, `${storagePath}/${uniqueId}_${cleanName}`);
    const uploadPromise = uploadBytes(fileRef, file).then(async () => {
      return await getDownloadURL(fileRef);
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    });

    const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
    if (cloudUrl) {
      return {
        fileUrl: cloudUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        storageType: 'cloud'
      };
    }
    console.warn('[FileStorage] Storage upload timed out after ' + timeoutMs + 'ms. Falling back seamlessly to local/inline storage.');
  } catch (storageErr) {
    console.warn('[FileStorage] Storage upload skipped or unavailable:', storageErr);
  }

  // 2. Fallback: Always cache in IndexedDB
  try {
    await saveFileToIndexedDB(uniqueId, file, {
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size
    });
  } catch (idbErr) {
    console.warn('[FileStorage] Failed to cache file in IndexedDB:', idbErr);
  }

  // 3. If file is reasonably small (<= 750KB), encode as Data URL so Firestore retains it everywhere!
  const INLINE_THRESHOLD = 750 * 1024;
  if (file.size <= INLINE_THRESHOLD) {
    try {
      const dataUrl = await fileToDataUrl(file);
      return {
        fileUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        storageType: 'inline'
      };
    } catch (dataErr) {
      console.warn('[FileStorage] Failed to convert to data URL:', dataErr);
    }
  }

  // 4. For larger files that couldn't be uploaded to Cloud Storage, return the IndexedDB reference
  return {
    fileUrl: `idb:${uniqueId}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    storageType: 'local'
  };
}

/**
 * Opens or downloads a file regardless of its storage origin (Cloud, Data URL, or IndexedDB).
 */
export async function openOrDownloadFile(fileUrl: string, fileName = 'document', fileType?: string): Promise<void> {
  if (!fileUrl) return;

  // 1. HTTP / Cloud URL
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // 2. Data URL
  if (fileUrl.startsWith('data:')) {
    try {
      // Create a Blob from the Data URL for cleaner opening/downloading
      const [header, base64Data] = fileUrl.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || fileType || 'application/octet-stream';
      const binary = atob(base64Data);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    } catch (e) {
      console.warn('[FileStorage] Error opening data URL as blob, trying direct window:', e);
      window.open(fileUrl, '_blank');
      return;
    }
  }

  // 3. Local IndexedDB URL (`idb:key`)
  if (fileUrl.startsWith('idb:')) {
    const key = fileUrl.replace(/^idb:/, '');
    const localRecord = await getFileFromIndexedDB(key);
    if (localRecord && localRecord.blob) {
      const blobUrl = URL.createObjectURL(localRecord.blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = localRecord.name || fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      return;
    } else {
      alert('لم يتم العثور على النسخة المحلية من الملف على هذا الجهاز. قد يكون تم حفظها من متصفح آخر.');
      return;
    }
  }

  // 4. Blob URL
  if (fileUrl.startsWith('blob:')) {
    window.open(fileUrl, '_blank');
    return;
  }

  // Fallback
  window.open(fileUrl, '_blank');
}

/**
 * Resolves any file source (idb reference, data URL, blob, File, or HTTP URL)
 * into a directly displayable Blob URL for in-app PDF preview and review.
 */
export async function resolveFileToBlobUrl(
  source: string | File | Blob,
  defaultType = 'application/pdf',
  defaultName = 'document'
): Promise<{
  url: string;
  cleanup: () => void;
  name: string;
  type: string;
  size?: number;
  isExternal?: boolean;
}> {
  // If source is already a File or Blob
  if (typeof source !== 'string' && source) {
    const objUrl = URL.createObjectURL(source);
    return {
      url: objUrl,
      cleanup: () => URL.revokeObjectURL(objUrl),
      name: (source as File).name || defaultName,
      type: source.type || defaultType,
      size: source.size,
      isExternal: false
    };
  }

  const strSource = String(source).trim();

  // 1. Data URL
  if (strSource.startsWith('data:')) {
    try {
      const [header, base64Data] = strSource.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || defaultType;
      const binary = atob(base64Data);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([array], { type: mime });
      const objUrl = URL.createObjectURL(blob);
      return {
        url: objUrl,
        cleanup: () => URL.revokeObjectURL(objUrl),
        name: defaultName,
        type: mime,
        size: blob.size,
        isExternal: false
      };
    } catch (e) {
      console.warn('[FileStorage] Error converting data URL to blob:', e);
      return {
        url: strSource,
        cleanup: () => {},
        name: defaultName,
        type: defaultType,
        isExternal: false
      };
    }
  }

  // 2. IndexedDB local pointer (`idb:key`)
  if (strSource.startsWith('idb:')) {
    const key = strSource.replace(/^idb:/, '');
    const localRecord = await getFileFromIndexedDB(key);
    if (localRecord && localRecord.blob) {
      const objUrl = URL.createObjectURL(localRecord.blob);
      return {
        url: objUrl,
        cleanup: () => URL.revokeObjectURL(objUrl),
        name: localRecord.name || defaultName,
        type: localRecord.type || defaultType,
        size: localRecord.blob.size,
        isExternal: false
      };
    }
    throw new Error('لم يتم العثور على الملف المحلي في المتصفح.');
  }

  // 3. Blob URL already
  if (strSource.startsWith('blob:')) {
    return {
      url: strSource,
      cleanup: () => {},
      name: defaultName,
      type: defaultType,
      isExternal: false
    };
  }

  // 4. Remote HTTP/HTTPS URL
  return {
    url: strSource,
    cleanup: () => {},
    name: defaultName,
    type: defaultType,
    isExternal: true
  };
}

/**
 * Deletes a file from either Firebase Storage or IndexedDB.
 */
export async function deleteStoredFile(fileUrl?: string): Promise<void> {
  if (!fileUrl) return;

  if (fileUrl.startsWith('http')) {
    try {
      const fileRef = ref(storage, fileUrl);
      const deletePromise = deleteObject(fileRef);
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      await Promise.race([deletePromise, timeoutPromise]);
    } catch (e) {
      console.warn('[FileStorage] Error deleting cloud file (non-blocking):', e);
    }
  } else if (fileUrl.startsWith('idb:')) {
    const key = fileUrl.replace(/^idb:/, '');
    await deleteFileFromIndexedDB(key);
  }
}
