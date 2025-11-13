import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BrainIcon,
  DashboardIcon,
  LogoutIcon,
  MoonIcon,
  SettingsIcon,
  ShieldIcon,
  SidebarToggleIcon,
  SunIcon,
} from './icons';

const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

const getInitialCollapse = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('sidebar-collapsed');
  if (stored !== null) return stored === 'true';
  return getIsMobile();
};

const AppLayout = ({ children, onLogout }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapse);
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'));
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobile, isCollapsed]);

  const navItems = useMemo(() => {
    const items = [{ to: '/dashboard', label: 'Dashboard', icon: DashboardIcon }];
    if (currentUser?.role === 'admin') {
      items.push(
        { to: '/nlp-logs', label: 'NLP Logs', icon: BrainIcon },
        { to: '/admin/users', label: 'Admin', icon: ShieldIcon },
      );
    }
    items.push({ to: '/settings', label: 'Cài đặt', icon: SettingsIcon });
    return items;
  }, [currentUser]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className={`app-shell ${isCollapsed ? 'is-collapsed' : ''}`}>
      <aside className={`app-shell__sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobile ? 'is-mobile' : ''}`}>
        <div className="app-shell__brand">
          <img
            src={theme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
            alt="MoneyWave"
            className={`app-shell__logo ${isCollapsed ? 'is-condensed' : ''}`}
            loading="lazy"
          />
          {!isCollapsed && (
            <div className="app-shell__brand-text">
              <span className="app-shell__brand-title">MoneyWave</span>
              <p>Quản lý tài chính</p>
            </div>
          )}
        </div>
        <div className="app-shell__toggles">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Đổi giao diện">
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
          {!isMobile && (
            <button
              className="icon-button icon-button--ghost"
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              aria-pressed={isCollapsed}
              title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              <SidebarToggleIcon
                size={18}
                className={`sidebar-toggle-icon ${isCollapsed ? 'is-collapsed' : ''}`}
              />
            </button>
          )}
        </div>
        {!isMobile && (
          <nav className="app-shell__nav">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`app-shell__nav-link ${isActive ? 'is-active' : ''}`}
                  title={item.label}
                  aria-label={isCollapsed ? item.label : undefined}
                >
                  <span className="icon-badge" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  {!isCollapsed && <span className="app-shell__nav-text">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        )}
        <button
          className="button button--ghost app-shell__logout"
          onClick={onLogout}
          aria-label="Đăng xuất"
        >
          <span className="icon-badge" aria-hidden="true">
            <LogoutIcon size={18} />
          </span>
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </aside>
      <main className="app-shell__content">{children}</main>
      {isMobile && (
        <nav className="bottom-nav" aria-label="Điều hướng">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`bottom-nav__link ${isActive ? 'is-active' : ''}`}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
