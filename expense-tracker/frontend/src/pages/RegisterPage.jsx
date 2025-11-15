import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckIcon } from '../components/icons';

const registerFeatures = [
  'Theo dõi nhiều ví cùng lúc',
  'Mục tiêu tiết kiệm rõ ràng',
  'Nhắc nhở khi vượt ngân sách',
];

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Vui lòng nhập tên đăng nhập.';
    } else if (username.trim().length < 3) {
      errors.username = 'Tên đăng nhập tối thiểu 3 ký tự.';
    }
    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    }
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

  const applyServerErrors = (error) => {
    const serverFieldErrors = error?.response?.data?.errors;
    const normalizeField = (field) => {
      if (field === 'full_name') return 'fullName';
      return field;
    };
    if (Array.isArray(serverFieldErrors)) {
      const updates = {};
      serverFieldErrors.forEach((item) => {
        if (item?.param) {
          updates[normalizeField(item.param)] = item.msg;
        }
      });
      setFieldErrors((prev) => ({ ...prev, ...updates }));
    }
    const field = error?.response?.data?.field;
    if (field && error?.response?.data?.message) {
      setFieldErrors((prev) => ({ ...prev, [normalizeField(field)]: error.response.data.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validateForm()) {
      return;
    }
    try {
      await register(username.trim(), email.trim(), password, fullName.trim());
      navigate('/dashboard');
    } catch (err) {
      applyServerErrors(err);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-6rem)] items-center gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-slate-100/80 bg-white/80 p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <div className="pill flex items-center gap-2">
          <img src="/logo.png" alt="MoneyWave" className="h-5 w-5 rounded-xl object-contain" />
          MoneyWave Studio
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Tạo tài khoản miễn phí</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Lập kế hoạch, chia sẻ ví với đội nhóm và nhận cảnh báo thông minh khi sắp vượt hạn mức.
        </p>
        <ul className="mt-6 space-y-3">
          {registerFeatures.map((feature) => (
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
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Bắt đầu hành trình mới</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Chỉ mất 1 phút để hoàn tất</p>
            </div>
          </div>
          {error && <p className="error-text text-center">{error}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({ ...prev, username: '' }));
                  }
                }}
                placeholder="moneywave_hero"
                required
              />
              {fieldErrors.username && <p className="error-text">{fieldErrors.username}</p>}
            </div>
            <div>
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                  }
                }}
                placeholder="Nguyễn Văn A"
              />
              {fieldErrors.fullName && <p className="error-text">{fieldErrors.fullName}</p>}
            </div>
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
              Đăng ký
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 dark:text-slate-300">
            Đã có tài khoản?{' '}
            <Link className="font-semibold text-brand hover:text-brand-dark" to="/login">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
