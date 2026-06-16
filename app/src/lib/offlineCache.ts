// On-demand offline cache for flagged songs: lyrics (already cached via the
// songs API runtime-caching rule in vite.config.ts) plus the audio files a
// member explicitly downloads for offline practice.

const CACHE_NAME = 'choral-audio';

export async function cacheAudioForOffline(urls: string[]): Promise<void> {
  if (!('caches' in window)) return;
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    urls.filter(Boolean).map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {
        // offline or blocked -- skip, caller can retry later
      }
    })
  );
}

export async function isAudioCached(url: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(url)) !== undefined;
}
