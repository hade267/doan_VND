import api from './api';

export const fetchLogs = (params = {}) =>
  api.get('/nlp/logs', { params }).then((res) => res.data);

export const updateLog = (id, payload) =>
  api.patch(`/nlp/logs/${id}`, payload).then((res) => res.data);

export const reapplyLog = (id, overrides = {}) =>
  api.post(`/nlp/logs/${id}/reapply`, { overrides }).then((res) => res.data);

export const quickParse = (text) =>
  api.post('/nlp/parse', { text }).then((res) => res.data);
