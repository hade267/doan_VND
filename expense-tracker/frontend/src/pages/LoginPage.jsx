import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { CheckIcon } from '../components/icons';

const loginFeatures = [
  'Đồng bộ giao dịch tức thì',
  'Báo cáo trực quan, dễ hiểu',
  'Nhập giao dịch bằng ngôn ngữ tự nhiên',
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth">
      <div className="auth__hero">
        <div className="pill">MoneyLover Inspired</div>
        <h1>Quản lý tài chính thông minh</h1>
        <p>Ghi lại chi tiêu, lập ngân sách và xem báo cáo trực quan mọi lúc mọi nơi.</p>
        <ul className="auth__hero-list">
          {loginFeatures.map((feature) => (
            <li key={feature}>
              <span className="icon-badge icon-badge--ghost" aria-hidden="true">
                <CheckIcon size={16} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="auth__card">
        <div className="auth__panel">
          <h2>Xin chào</h2>
          <p>Đăng nhập để tiếp tục quản lý chi tiêu</p>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="auth__form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
              />
            </div>
            <div className="auth__form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="button" type="submit">
              Đăng nhập
            </button>
          </form>
          <div className="auth__footer">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
