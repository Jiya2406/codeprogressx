const axios = require('axios');

let contestCache = null;
let contestCacheTime = 0;
const TTL = 15 * 60 * 1000;

function maybeInjectTestContest(list) {
  if (process.env.INCLUDE_TEST_CONTEST !== 'true') return list;
  // Fixed time: 2026-05-27 12:15 PM IST = 06:45 UTC
  const testContestStartTime = new Date('2026-05-27T06:45:00.000Z').getTime();
  const startSec = Math.floor(testContestStartTime / 1000);
  const testContest = {
    id: 99999,
    name: 'TEST Contest — Local Cron Verification',
    type: 'CF',
    startTimeSeconds: startSec,
    startTime: new Date(testContestStartTime).toISOString(),
    durationSeconds: 7200,
    websiteUrl: 'https://codeforces.com/contests/99999'
  };
  return [testContest, ...list];
}

exports.fetchUpcomingContests = async () => {
  const now = Date.now();
  if (contestCache && now - contestCacheTime < TTL) {
    return maybeInjectTestContest(contestCache);
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
  return maybeInjectTestContest(upcoming);
};
