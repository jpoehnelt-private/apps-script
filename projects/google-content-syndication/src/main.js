// Edits made here will be overwritten by the build process

const YOUTUBE_CHANNEL_ID = 'UCUcg6az6etU_gRtZVAhBXaw'; // @googleworkspacedevs
const DEVTO_API_KEY = PropertiesService.getScriptProperties().getProperty('DEVTO_API_KEY');
const ACCESS_TOKEN = ScriptApp.getOAuthToken();

function syndicateYoutube({ maxResults = 10, maxAgeDays = 7 } = {}) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10 * 1000);

    const { items } = memoize(YouTube.Search.list, 600)('snippet', {
      channelId: YOUTUBE_CHANNEL_ID,
      type: "video",
      order: 'date',
      maxResults,
      videoEmbeddable: true,
      videoSyndicated: true,
    });

    for (const { id: { videoId }, snippet: { publishedAt } } of items) {
      // filter old videos
      if (new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString() < publishedAt) {
        continue;
      }

      const video = memoize(YouTube.Videos.list, 10)("snippet,contentDetails,statistics", {
        id: videoId
      }).items[0];

      video.snippet.tags = filteredTags(video.snippet.tags ?? []);
      devTo(video);
    };
  } finally {
    lock.releaseLock();
  }
}

function main() {
  syndicateYoutube();
}
