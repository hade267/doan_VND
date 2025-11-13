import api from './api';

export const fetchBudgets = async () => {
  const { data } = await api.get('/budgets');
  return data;
};

export const createBudget = async (payload) => {
  const { data } = await api.post('/budgets', payload);
  return data;
};

export const updateBudget = async (id, payload) => {
  const { data } = await api.put(`/budgets/${id}`, payload);
  return data;
};

export const deleteBudget = async (id) => {
  await api.delete(`/budgets/${id}`);
};
