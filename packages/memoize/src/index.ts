/**
 * A generic hash function that takes a string and computes a hash using the
 * specified algorithm.
 *
 * @param {string} str - The string to hash.
 * @param {Utilities.DigestAlgorithm} algorithm - The algorithm to use to
 *  compute the hash. Defaults to MD5.
 * @returns {string} The base64 encoded hash of the string.
 */
function hash(str: string, algorithm = Utilities.DigestAlgorithm.MD5) {
  const digest = Utilities.computeDigest(algorithm, str);
  return Utilities.base64Encode(digest);
}

/**
 * Memoizes a function by caching its results based on the arguments passed.
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  {
    ttl = 600,
    cache = CacheService.getScriptCache(),
    stringifier = JSON.stringify,
    cacheUndefined = true,
  }: {
    ttl?: number;
    cache?: GoogleAppsScript.Cache.Cache;
    stringifier?: (args: any[]) => string;
    cacheUndefined?: boolean;
  },
): T {
  return ((...args: any[]) => {
    // consider a more robust input to the hash function to handler complex
    // types such as functions, dates, and regex
    const key = hash(stringifier([func.toString(), ...args]));
    const cached = cache.get(key);
    if (cached != null) {
      if ((globalThis as any).DEBUG) {
        Logger.log(`Cache hit for ${stringifier(args)}`);
      }
      return JSON.parse(cached);
    } else {
      const result = func(...args);
      if ((globalThis as any).DEBUG) {
        Logger.log(`Cache miss for ${stringifier(args)}`);
      }

      if (result === undefined && cacheUndefined === false) {
        return result;
      }

      cache.put(key, JSON.stringify(result), ttl);
      return result;
    }
  }) as T;
}

export {};
