import React, { useEffect, useState } from 'react';
import api from '../services/api';

const defaultFilters = {
  type: '',
  startDate: '',
  endDate: '',
};

const TransactionsPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = async (pageToLoad = page) => {
    setLoading(true);
    try {
      const params = {
        page: pageToLoad,
        limit,
      };
      if (filters.type) params.type = filters.type;
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions || []);
      setPage(data.currentPage || pageToLoad);
      setTotalPages(data.totalPages || 1);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadTransactions(1);
  };

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="pill">Danh sách giao dịch</div>
          <h1>Tất cả giao dịch</h1>
          <p>Theo dõi toàn bộ thu nhập và chi tiêu của bạn.</p>
        </div>
      </div>

      <div className="card">
        <h2>Bộ lọc</h2>
        <form className="settings-grid" onSubmit={handleFilterSubmit}>
          <div>
            <label>Loại giao dịch</label>
            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="">Tất cả</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>
          </div>
          <div>
            <label>Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label>Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="card__actions card__actions--start">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Đang lọc...' : 'Áp dụng'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Kết quả</h2>
        {error && <p className="error-text">{error}</p>}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Loại</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Đang tải...</td>
                </tr>
              ) : transactions.length ? (
                transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.transaction_date).toLocaleDateString()}</td>
                    <td>{item.description || 'Không ghi chú'}</td>
                    <td>{item.category?.name || 'Không phân loại'}</td>
                    <td>
                      <span className={`badge badge--${item.type === 'income' ? 'income' : 'expense'}`}>
                        {item.type === 'income' ? 'Thu' : 'Chi'}
                      </span>
                    </td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Không có giao dịch phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="button button--ghost" type="button" disabled={page <= 1 || loading} onClick={() => loadTransactions(page - 1)}>
            Trang trước
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <button
            className="button button--ghost"
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => loadTransactions(page + 1)}
          >
            Trang tiếp
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
