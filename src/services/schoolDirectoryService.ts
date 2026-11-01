// Client-side lightweight school directory service with Wilaya caching

export interface WilayaSummary {
  id: string;
  name: string;
  wilayaNum: number;
}

export interface CommuneData {
  name: string;
  cycles: Record<string, Array<{ code: string; name: string }>>;
}

export interface WilayaDetail {
  id: string;
  name: string;
  communes: Record<string, CommuneData>;
}

// Memory caches
let cachedWilayasList: WilayaSummary[] | null = null;
const cachedWilayasDetail = new Map<string, WilayaDetail>();

/**
 * Fetches the lightweight directorates (Wilayas) list (only ~58 items, ~5KB).
 */
export async function getWilayasList(): Promise<WilayaSummary[]> {
  if (cachedWilayasList && cachedWilayasList.length > 0) {
    return cachedWilayasList;
  }

  // 1. Check localStorage cache
  try {
    const local = localStorage.getItem('school_directory_wilayas');
    if (local) {
      cachedWilayasList = JSON.parse(local);
      return cachedWilayasList!;
    }
  } catch (e) {
    // Ignore localStorage parse error
  }

  // 2. Try server endpoint
  try {
    const res = await fetch('/api/schools/wilayas');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedWilayasList = data;
        try {
          localStorage.setItem('school_directory_wilayas', JSON.stringify(data));
        } catch (e) {
          // Ignore quota error
        }
        return data;
      }
    }
  } catch (err) {
    // Network or server error, fallback below
  }

  // 3. Fallback: dynamic import of schools.ts only if endpoint fails
  try {
    const { SCHOOL_DB } = await import('../data/schools');
    const list = Object.entries(SCHOOL_DB).map(([id, data]) => {
      const wilayaNum = parseInt(id.slice(0, 2), 10) || 99;
      return {
        id,
        name: data.name,
        wilayaNum
      };
    }).sort((a, b) => a.wilayaNum - b.wilayaNum || a.name.localeCompare(b.name, 'ar'));
    cachedWilayasList = list;
    return list;
  } catch (err) {
    console.error('Failed to load fallback wilayas:', err);
    return [];
  }
}

/**
 * Fetches data for a single Wilaya on demand and caches it.
 */
export async function getWilayaDetail(wilayaId: string): Promise<WilayaDetail | null> {
  if (!wilayaId) return null;

  if (cachedWilayasDetail.has(wilayaId)) {
    return cachedWilayasDetail.get(wilayaId)!;
  }

  // 1. Check localStorage cache
  const cacheKey = `school_wilaya_${wilayaId}`;
  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed = JSON.parse(local);
      cachedWilayasDetail.set(wilayaId, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore localStorage parse error
  }

  // 2. Try server endpoint
  try {
    const res = await fetch(`/api/schools/wilaya/${encodeURIComponent(wilayaId)}`);
    if (res.ok) {
      const detail: WilayaDetail = await res.json();
      cachedWilayasDetail.set(wilayaId, detail);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(detail));
      } catch (e) {
        // Ignore quota error
      }
      return detail;
    }
  } catch (err) {
    // Endpoint failed, fallback below
  }

  // 3. Fallback: dynamic import of schools.ts
  try {
    const { SCHOOL_DB } = await import('../data/schools');
    const wilayaData = (SCHOOL_DB as any)[wilayaId];
    if (wilayaData) {
      const detail: WilayaDetail = {
        id: wilayaId,
        name: wilayaData.name,
        communes: wilayaData.communes
      };
      cachedWilayasDetail.set(wilayaId, detail);
      return detail;
    }
  } catch (err) {
    console.error(`Failed to load fallback wilaya for ${wilayaId}:`, err);
  }

  return null;
}
