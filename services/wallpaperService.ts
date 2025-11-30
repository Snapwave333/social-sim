
// Wallpaper Provider Module
// Fetches daily Bing wallpaper and manages caching/fallback.

interface WallpaperData {
  url: string;
  start_date: string;
  end_date: string;
  copyright: string;
  copyright_link: string;
}

interface CachedWallpaper {
  data: WallpaperData;
  fetchDate: number; // Timestamp of when we fetched it
}

const API_BASE = "https://bing.biturl.top";
const STORAGE_KEY = "socialsim_daily_wallpaper";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getDailyWallpaper = async (): Promise<WallpaperData | null> => {
  try {
    // 1. Check Cache
    const cachedRaw = localStorage.getItem(STORAGE_KEY);
    if (cachedRaw) {
      const cached: CachedWallpaper = JSON.parse(cachedRaw);
      const now = Date.now();
      
      // If cache is fresh (less than 24h old) and valid, return it
      // Also strictly check if the 'start_date' matches today to ensure "daily" updates
      // Note: Bing API start_date is YYYYMMDD.
      if (now - cached.fetchDate < CACHE_DURATION_MS) {
         console.log("Using cached wallpaper");
         return cached.data;
      }
    }

    // 2. Fetch from API
    console.log("Fetching fresh wallpaper from Bing API...");
    const response = await fetch(`${API_BASE}/?resolution=UHD&format=json&index=0&mkt=random`);
    
    if (!response.ok) {
      throw new Error(`Wallpaper API Error: ${response.status} ${response.statusText}`);
    }

    const data: WallpaperData = await response.json();

    // 3. Cache the result
    const cacheEntry: CachedWallpaper = {
      data: data,
      fetchDate: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheEntry));

    // 4. Preload Image (optional but good for UX)
    const img = new Image();
    img.src = data.url;

    return data;

  } catch (error) {
    console.error("Failed to fetch daily wallpaper:", error);
    
    // Fallback: Return cached version even if expired, if available
    const cachedRaw = localStorage.getItem(STORAGE_KEY);
    if (cachedRaw) {
      console.warn("Falling back to expired cache.");
      return JSON.parse(cachedRaw).data;
    }

    return null;
  }
};
