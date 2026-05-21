const axios = require('axios');

let contestCache = null;
let contestCacheTime = 0;
const TTL = 15 * 60 * 1000;

exports.fetchUpcomingContests = async () => {
  const now = Date.now();
  if (contestCache && now - contestCacheTime < TTL) {
    return contestCache;
  }
  const { data } = await axios.get('https://codeforces.com/api/contest.list', {
    params: { gym: false },
    timeout: 15000
  });
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error');

  const upcoming = data.result
    .filter((c) => c.phase === 'BEFORE')
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      startTimeSeconds: c.startTimeSeconds,
      startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
      durationSeconds: c.durationSeconds,
      websiteUrl: `https://codeforces.com/contests/${c.id}`
    }))
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

  contestCache = upcoming;
  contestCacheTime = now;
  return upcoming;
};
