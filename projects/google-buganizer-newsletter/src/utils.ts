export function serializeBug(bug: BuganizerApp.Bug) {
    const title = bug.getSummary();
    const description = bug.getFirstNote();
    return `Id: ${bug.getId()}\nVote Count: ${bug.getMeTooCount()}\nTitle: ${title}\nCurrent Component: ${bug.getComponentPath().join("/")}\nDescription:\n\n${description}`
}

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
 *
 * @param {Function} func - The function to be memoized.
 * @param {number} [ttl=600] - The time to live in seconds for the cached
 *  result. The maximum value is 600.
 * @param {Cache} [cache=CacheService.getScriptCache()] - The cache to store the
 *  memoized results.
 * @returns {Function} - The memoized function.
 *
 * @example
 *
 * const cached = memoize(myFunction);
 * cached(1, 2, 3); // The result will be cached
 * cached(1, 2, 3); // The cached result will be returned
 * cached(4, 5, 6); // A new result will be calculated and cached
 */
export function memoize(func: (...args: any[]) => any, ttl = 600, cache = CacheService.getScriptCache()) {
    return (...args: any[]) => {

        // consider a more robust input to the hash function to handler complex
        // types such as functions, dates, and regex
        const key = hash(JSON.stringify([func.toString(), ...args]));
        const cached = cache.get(key);
        if (cached != null) {
            return JSON.parse(cached);
        } else {
            const result = func(...args);
            cache.put(key, JSON.stringify(result), ttl);
            return result;
        }
    };
}

export function gemini(request: any, model_id = "gemini-2.0-flash", project_id = "workspace-devrel-issues") {
    const URL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${project_id}/locations/us-central1/publishers/google/models/${model_id}:generateContent`;

    Logger.log({ message: "vertex:generateContent", request, url: URL });

    const options = {
        method: 'post' as const,
        headers: { 'Authorization': `Bearer ${ScriptApp.getOAuthToken()}`, },
        muteHttpExceptions: true,
        contentType: 'application/json',
        payload: JSON.stringify(request)
    };

    const response = UrlFetchApp.fetch(URL, options);

    if (response.getResponseCode() == 200) {
        return JSON.parse(response.getContentText());
    } else {
        throw new Error(response.getContentText());
    }
}