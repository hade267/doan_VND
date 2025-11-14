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
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-100/80 bg-gradient-to-r from-brand to-emerald-500 p-8 text-white shadow-glass dark:border-emerald-400/30">
        <div className="pill bg-white/20 text-white">Danh sách giao dịch</div>
        <h1 className="mt-4 text-3xl font-semibold">Theo dõi toàn bộ thu chi</h1>
        <p className="mt-2 text-white/80">Lọc theo loại, thời gian và xem tiến độ ngân sách ngay lập tức.</p>
      </header>

      <section className="card space-y-4">
        <div>
          <p className="eyebrow">Bộ lọc</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Thu hẹp giao dịch</h2>
        </div>
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleFilterSubmit}>
          <div className="md:col-span-1">
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
          <div className="flex items-end">
            <button className="button w-full" type="submit" disabled={loading}>
              {loading ? 'Đang lọc...' : 'Áp dụng'}
            </button>
          </div>
        </form>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Kết quả</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Giao dịch gần nhất</h2>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-300">Trang {page} / {totalPages}</span>
        </div>
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
                      <span className={item.type === 'income' ? 'badge--income' : 'badge--expense'}>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            className="button--ghost"
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => loadTransactions(page - 1)}
          >
            Trang trước
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-300">
            Hiển thị {(transactions || []).length} dòng
          </span>
          <button
            className="button--ghost"
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => loadTransactions(page + 1)}
          >
            Trang tiếp
          </button>
        </div>
      </section>
    </div>
  );
};

export default TransactionsPage;
