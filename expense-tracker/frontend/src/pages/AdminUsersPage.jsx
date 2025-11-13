import React, { useEffect, useState } from 'react';
import { fetchAdminUsers, updateAdminUser, fetchAdminStats } from '../services/adminService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleUpdateUser = async (id, payload) => {
    try {
      await updateAdminUser(id, payload);
      setMessage('Đã cập nhật người dùng.');
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể cập nhật người dùng.');
    }
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
            <strong>{stats.totalUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Đang hoạt động</small>
            <strong>{stats.activeUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Ngưng hoạt động</small>
            <strong>{stats.inactiveUsers}</strong>
          </div>
          <div className="quick-card">
            <small>Admin</small>
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
    </div>
  );
};

export default AdminUsersPage;
