const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'nlpKeywords.json');

let cachedConfig = null;
let lastLoadedMs = 0;
const RELOAD_INTERVAL = 1000 * 60; // 1 minute

const loadFromDisk = () => {
  const data = fs.readFileSync(configPath, 'utf-8');
  cachedConfig = JSON.parse(data);
  lastLoadedMs = Date.now();
  return cachedConfig;
};

const getNlpConfig = () => {
  if (!cachedConfig || Date.now() - lastLoadedMs > RELOAD_INTERVAL) {
    return loadFromDisk();
  }
  return cachedConfig;
};

const saveNlpConfig = (newConfig) => {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf-8');
  cachedConfig = newConfig;
  lastLoadedMs = Date.now();
  return cachedConfig;
};

module.exports = {
  getNlpConfig,
  saveNlpConfig,
  configPath,
};
