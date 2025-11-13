import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth">
      <div className="auth__hero">
        <div className="pill">Quản lý tài chính cá nhân</div>
        <h1>Bắt đầu hành trình tiết kiệm</h1>
        <p>Thiết lập ví, mục tiêu và để MoneyWave nhắc bạn mỗi khi chi tiêu gần chạm ngưỡng.</p>
        <ul className="auth__hero-list">
          <li>🧾 Theo dõi nhiều ví cùng lúc</li>
          <li>📈 Kế hoạch tiết kiệm rõ ràng</li>
          <li>🔔 Nhắc nhở khi vượt ngân sách</li>
        </ul>
      </div>
      <div className="auth__card">
        <div className="auth__panel">
          <h2>Tạo tài khoản miễn phí</h2>
          <p>Chỉ mất 1 phút để hoàn tất</p>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="auth__form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="moneylover_hero"
                required
              />
            </div>
            <div className="auth__form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="auth__form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
              />
            </div>
            <div className="auth__form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="button" type="submit">
              Đăng ký
            </button>
          </form>
          <div className="auth__footer">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
