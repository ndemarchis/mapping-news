import { revalidateTag, unstable_cache } from "next/cache";

type CacheConfig = {
  key: string;
  revalidate: number;
};

type CachedData<T> = {
  lastUpdated: Date;
  refreshWait: number;
  payload: T;
};

export function createSWRCache<T>(fetchFn: () => Promise<T>, config: CacheConfig) {
  const { key, revalidate } = config;
  return unstable_cache(
    async () => {
      const data = await fetchFn();
      return {
        lastUpdated: new Date(),
        refreshWait: revalidate,
        payload: data,
      } as CachedData<T>;
    },
    [key],
    { tags: [key] },
  );
}

export function createNoSWRCache<T>(
  fetchFn: () => Promise<T>,
  config: CacheConfig,
) {
  const { key, revalidate } = config;

  const cachedFn = unstable_cache(
    async () => {
      const data = await fetchFn();
      return {
        lastUpdated: new Date(),
        refreshWait: revalidate,
        payload: data,
      } as CachedData<T>;
    },
    [key],
    { tags: [key] },
  );

  return async (): Promise<CachedData<T>> => {
    const cachedData = await cachedFn();
    const lastUpdated = new Date(cachedData.lastUpdated);

    if (lastUpdated.getTime() < Date.now() - revalidate * 1000) {
      console.log(`Cache for ${key} is stale, revalidating...`);
      revalidateTag(key);
      return cachedFn();
    }

    return cachedData;
  };
}
