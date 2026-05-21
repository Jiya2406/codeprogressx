const axios = require('axios');

const CF_BASE = 'https://codeforces.com/api';

exports.fetchUserInfo = async (handle) => {
  const { data } = await axios.get(`${CF_BASE}/user.info`, {
    params: { handles: handle },
    timeout: 10000
  });
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error');
  return data.result[0];
};

exports.fetchUserSubmissions = async (handle, count = 2000) => {
  const { data } = await axios.get(`${CF_BASE}/user.status`, {
    params: { handle, from: 1, count },
    timeout: 30000
  });
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error');
  return data.result;
};

let problemsetCache = null;
let problemsetCacheTime = 0;
const PROBLEMSET_TTL = 24 * 60 * 60 * 1000;

exports.fetchProblemset = async () => {
  const now = Date.now();
  if (problemsetCache && now - problemsetCacheTime < PROBLEMSET_TTL) {
    return problemsetCache;
  }
  const { data } = await axios.get(`${CF_BASE}/problemset.problems`, { timeout: 30000 });
  if (data.status !== 'OK') throw new Error(data.comment || 'Codeforces API error');
  problemsetCache = data.result.problems;
  problemsetCacheTime = now;
  return problemsetCache;
};
