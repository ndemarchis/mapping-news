import { revalidateTag, unstable_cache } from "next/cache";

type CacheConfig = {
  /**
   * An array of tags that can be used to control cache invalidation. Next.js will not use this to uniquely identify the function.
   */
  tag: string;
  /**
   * This is an extra array of keys that further adds identification to the cache. By default, unstable_cache already uses the arguments and the stringified version of your function as the cache key. It is optional in most cases; the only time you need to use it is when you use external variables without passing them as parameters. However, it is important to add closures used within the function if you do not pass them as parameters.
   */
  key: string;
  revalidate: number;
};

type CachedData<T> = {
  lastUpdated: Date;
  refreshWait: number;
  payload: T;
};

export function createCache<T>(fetchFn: () => Promise<T>, config: CacheConfig) {
  const { key, tag, revalidate } = config;
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
    { tags: [tag] },
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
