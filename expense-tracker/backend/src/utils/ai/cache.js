const cache = new Map();

const getDefaultTtlMs = () =>
  Math.max(30, parseInt(process.env.NLP_AI_CACHE_TTL || '300', 10)) * 1000;

const getKey = (userId, text) => `${userId}:${text.trim().toLowerCase()}`;

const getCachedResult = (userId, text) => {
  const key = getKey(userId, text);
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

const setCachedResult = (userId, text, value) => {
  const key = getKey(userId, text);
  cache.set(key, {
    value,
    expiresAt: Date.now() + getDefaultTtlMs(),
  });
};

module.exports = {
  getCachedResult,
  setCachedResult,
};
