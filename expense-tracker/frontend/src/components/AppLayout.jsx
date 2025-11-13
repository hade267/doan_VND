import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/nlp-logs', label: 'NLP Logs', icon: '🧠' },
];

const AppLayout = ({ children, onLogout }) => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <div className="pill">MoneyWave</div>
          <p>Quản lý tài chính</p>
        </div>
        <nav className="app-shell__nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-shell__nav-link ${location.pathname === item.to ? 'is-active' : ''}`}
            >
              <span className="icon-badge">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="button button--ghost app-shell__logout" onClick={onLogout}>
          Đăng xuất
        </button>
      </aside>
      <main className="app-shell__content">{children}</main>
    </div>
  );
};

export default AppLayout;
