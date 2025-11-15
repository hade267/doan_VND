import React, { useEffect, useState } from 'react';
import { fetchAdminUsers, updateAdminUser, fetchAdminStats } from '../services/adminService';
import { fetchNlpConfig, updateNlpConfig } from '../services/nlpService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nlpForm, setNlpForm] = useState({
    income: '',
    expense: '',
    amount: '',
    categories: '[]',
  });
  const [nlpStatus, setNlpStatus] = useState('');
  const [nlpPreview, setNlpPreview] = useState(null);
  const [nlpPendingPayload, setNlpPendingPayload] = useState(null);
  const [nlpLoading, setNlpLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [userRes, statsRes] = await Promise.all([
        fetchAdminUsers(filters),
        fetchAdminStats(),
      ]);
      setUsers(userRes.items || []);
      setStats(statsRes);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể tải dữ liệu người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const loadConfig = async () => {
      setNlpLoading(true);
      try {
        const data = await fetchNlpConfig();
        const stringifyAmountKeywords = () => {
          const items = data?.amountKeywords || [];
          return items
            .map((entry) =>
              typeof entry === 'string'
                ? entry
                : `${entry.keyword || ''}:${entry.multiplier ?? ''}`.trim().replace(/:+$/, ''),
            )
            .filter(Boolean)
            .join(', ');
        };

        setNlpForm({
          income: (data?.incomeKeywords || []).join(', '),
          expense: (data?.expenseKeywords || []).join(', '),
          amount: stringifyAmountKeywords(),
          categories: JSON.stringify(data?.categories || [], null, 2),
        });
        setNlpStatus('');
      } catch (error) {
        setNlpStatus(error.response?.data?.message || 'Không thể tải cấu hình NLP.');
      } finally {
        setNlpLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleUpdateUser = async (id, payload) => {
    try {
      await updateAdminUser(id, payload);
      setMessage('Đã cập nhật người dùng.');
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể cập nhật người dùng.');
    }
  };

  const parseKeywordInput = (value = '') =>
    value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const buildNlpPayload = () => {
    let categoriesPayload = [];
    if (nlpForm.categories.trim()) {
      try {
        categoriesPayload = JSON.parse(nlpForm.categories);
        if (!Array.isArray(categoriesPayload)) {
          throw new Error('Danh sách danh mục phải là mảng.');
        }
      } catch (error) {
        setNlpStatus('JSON danh mục không hợp lệ.');
        return null;
      }
    }
    const parseAmountKeywords = () => {
      const tokens = parseKeywordInput(nlpForm.amount);
      return tokens.map((token) => {
        const [keywordRaw, multiplierRaw] = token.split(':').map((part) => part.trim());
        if (!keywordRaw) {
          return null;
        }
        const multiplier = Number(multiplierRaw);
        if (Number.isFinite(multiplier) && multiplier > 0) {
          return { keyword: keywordRaw, multiplier };
        }
        return keywordRaw;
      }).filter(Boolean);
    };

    return {
      incomeKeywords: parseKeywordInput(nlpForm.income),
      expenseKeywords: parseKeywordInput(nlpForm.expense),
      amountKeywords: parseAmountKeywords(),
      categories: categoriesPayload,
    };
  };

  const handleSaveNlp = async (confirm = false) => {
    const payload = confirm ? nlpPendingPayload : buildNlpPayload();
    if (!payload) return;

    setNlpLoading(true);
    setNlpStatus('');
    try {
      const body = confirm ? { ...payload, confirm: true } : payload;
      const data = await updateNlpConfig(body);
      if (data?.requiresConfirmation) {
        setNlpPreview(data.preview || null);
        setNlpPendingPayload(payload);
        setNlpStatus(data.message || 'Xác nhận cấu hình trước khi áp dụng.');
        return;
      }
      setNlpPreview(null);
      setNlpPendingPayload(null);
      setNlpStatus('Đã lưu cấu hình NLP.');
    } catch (error) {
      setNlpStatus(error.response?.data?.message || 'Không thể lưu cấu hình.');
    } finally {
      setNlpLoading(false);
    }
  };

  const cancelNlpPreview = () => {
    setNlpPreview(null);
    setNlpPendingPayload(null);
    setNlpStatus('Đã huỷ xem trước.');
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="pill">Admin</div>
          <h1>Quản lý người dùng</h1>
          <p>Xem trạng thái tài khoản, vai trò và tổng quan hoạt động.</p>
        </div>
      </div>

      {stats && (
        <div className="quick-cards">
          <div className="quick-card">
            <small>Tổng người dùng</small>
            <p className="quick-card__hint">Toàn bộ tài khoản đã tạo</p>
            <strong>{stats.totalUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Đang hoạt động</small>
            <p className="quick-card__hint">Đã kích hoạt và đăng nhập được</p>
            <strong>{stats.activeUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Ngưng hoạt động</small>
            <p className="quick-card__hint">Đã bị khóa hoặc chưa xác thực</p>
            <strong>{stats.inactiveUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Admin</small>
            <p className="quick-card__hint">Tài khoản quản trị hệ thống</p>
            <strong>{stats.adminCount}</strong>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Tìm kiếm</h2>
        <div className="settings-grid">
          <div>
            <label>Từ khóa</label>
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Tên, email..."
            />
          </div>
          <div>
            <label>Vai trò</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="">Tất cả</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Danh sách người dùng</h2>
        {message && <p className="settings-message">{message}</p>}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Giao dịch</th>
                  <th>Thu nhập</th>
                  <th>Chi tiêu</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge--success' : 'badge--danger'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.transactionCount}</td>
                    <td>
                      {Number(user.totalIncome || 0).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </td>
                    <td>
                      {Number(user.totalExpense || 0).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </td>
                    <td>
                      <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}
                      >
                        {user.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <p>Không có người dùng nào.</p>}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Cấu hình NLP</h2>
        <p>Tùy chỉnh từ khóa và danh mục mà NLP sử dụng để hiểu câu lệnh chi tiêu.</p>
        <div className="settings-grid">
          <div>
            <label>Từ khóa thu nhập</label>
            <textarea
              rows={3}
              value={nlpForm.income}
              onChange={(e) => setNlpForm((prev) => ({ ...prev, income: e.target.value }))}
              placeholder="luong, thu nhap, thuong..."
            />
          </div>
          <div>
            <label>Từ khóa chi tiêu</label>
            <textarea
              rows={3}
              value={nlpForm.expense}
              onChange={(e) => setNlpForm((prev) => ({ ...prev, expense: e.target.value }))}
              placeholder="chi, mua, an uong..."
            />
          </div>
          <div>
            <label>Từ khóa số tiền</label>
            <textarea
              rows={3}
              value={nlpForm.amount}
              onChange={(e) => setNlpForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="vnd, dong, usd, ty..."
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Các từ này giúp NLP nhận diện đơn vị tiền tệ kèm theo con số.
            </p>
          </div>
        </div>
        <div className="settings-form">
          <label>Danh sách danh mục (JSON)</label>
          <textarea
            rows={8}
            value={nlpForm.categories}
            onChange={(e) => setNlpForm((prev) => ({ ...prev, categories: e.target.value }))}
            placeholder='[{"name":"An uong","type":"expense","keywords":["an","uong"]}]'
          />
        </div>
        <div className="card__actions">
          <button className="button" type="button" onClick={() => handleSaveNlp(false)} disabled={nlpLoading}>
            {nlpLoading ? 'Đang xử lý...' : 'Xem trước'}
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => handleSaveNlp(true)}
            disabled={!nlpPreview || nlpLoading}
          >
            Áp dụng cấu hình
          </button>
        </div>
        {nlpStatus && <p className="settings-message">{nlpStatus}</p>}
        {nlpPreview && (
          <div className="nlp-config-preview">
            <pre>{JSON.stringify(nlpPreview, null, 2)}</pre>
            <div className="card__actions">
              <button className="button button--ghost" type="button" onClick={cancelNlpPreview} disabled={nlpLoading}>
                Huỷ xem trước
              </button>
              <button className="button" type="button" onClick={() => handleSaveNlp(true)} disabled={nlpLoading}>
                {nlpLoading ? 'Đang lưu...' : 'Xác nhận & lưu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
