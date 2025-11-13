import api from './api';

export const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};
