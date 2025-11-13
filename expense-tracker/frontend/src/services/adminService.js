import api from './api';

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

export const fetchAdminUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', {
    params: sanitizeParams(params),
  });
  return data;
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data;
};

export const fetchAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};
