import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckIcon } from '../components/icons';

const loginFeatures = [
  'Đồng bộ giao dịch tức thì',
  'Báo cáo trực quan, dễ hiểu',
  'Nhập bằng ngôn ngữ tự nhiên',
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [awaitingTwoFactor, setAwaitingTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Email không đúng định dạng.';
    }
    if (!password.trim()) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu cần ít nhất 6 ký tự.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTwoFactorError('');
    if (!validateForm()) {
      return;
    }
    try {
      const response = await login(email.trim(), password);
      if (response?.requiresTwoFactor) {
        setAwaitingTwoFactor(true);
        setTwoFactorCode('');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    try {
      await verifyTwoFactor(twoFactorCode.trim());
      setAwaitingTwoFactor(false);
      setTwoFactorCode('');
      navigate('/dashboard');
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || 'Mã xác thực không hợp lệ.');
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-6rem)] items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/80 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <div className="pill flex items-center gap-2">
          <img src="/logo.png" alt="MoneyWave" className="h-5 w-5 rounded-xl object-contain" />
          MoneyWave Studio
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Quản lý tài chính thông minh</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Ghi lại chi tiêu, lập ngân sách và nhận gợi ý từ trợ lý NLP mọi lúc mọi nơi.
        </p>
        <ul className="mt-6 space-y-3">
          {loginFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-200">
              <span className="icon-badge bg-brand/10 text-brand">
                <CheckIcon size={16} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center">
        <div className="card w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <img src="/logo.png" alt="MoneyWave" className="h-12" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Chào mừng trở lại</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Đăng nhập để tiếp tục quản lý chi tiêu</p>
            </div>
          </div>
          {error && <p className="error-text text-center">{error}</p>}
          {awaitingTwoFactor ? (
            <form className="space-y-4" onSubmit={handleTwoFactorSubmit}>
              <div className="rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-200">
                Vui lòng nhập mã xác thực 6 chữ số từ ứng dụng 2FA để hoàn tất đăng nhập.
              </div>
              <div>
                <label htmlFor="twoFactorCode">Mã xác thực</label>
                <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  required
                />
              </div>
              {twoFactorError && <p className="error-text text-center">{twoFactorError}</p>}
              <button className="button w-full" type="submit">
                Xác thực & tiếp tục
              </button>
              <button
                className="button--ghost w-full"
                type="button"
                onClick={() => {
                  setAwaitingTwoFactor(false);
                  setTwoFactorCode('');
                }}
              >
                Trở về đăng nhập
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="name@email.com"
                  required
                />
                {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="••••••••"
                  required
                />
                {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}
              </div>
              <button className="button w-full" type="submit">
                Đăng nhập
              </button>
            </form>
          )}
          <p className="text-center text-sm text-slate-500 dark:text-slate-300">
            Chưa có tài khoản?{' '}
            <Link className="font-semibold text-brand hover:text-brand-dark" to="/register">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
