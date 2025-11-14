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

const enableNlpLogs = import.meta.env.MODE !== 'production';
const COLLAPSED_WIDTH = 96; // px
const EXPANDED_WIDTH = 288;

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
  const [theme, setTheme] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'),
  );
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
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
      if (enableNlpLogs) {
        items.push({ to: '/nlp-logs', label: 'NLP Logs', icon: BrainIcon });
      }
      items.push({ to: '/admin/users', label: 'Admin', icon: ShieldIcon });
    }
    items.push({ to: '/settings', label: 'Cài đặt', icon: SettingsIcon });
    return items;
  }, [currentUser]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const navLinkClasses = (isActive) =>
    [
      'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
      isCollapsed ? 'justify-center' : '',
      isActive
        ? 'bg-brand/15 text-brand'
        : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
    ]
      .filter(Boolean)
      .join(' ');

  const sidebarClasses = [
    'hidden lg:flex lg:flex-col lg:border-r lg:border-slate-100/80 lg:bg-white/90 lg:px-4 lg:py-6 lg:shadow-xl lg:shadow-slate-200/60 lg:backdrop-blur dark:lg:border-slate-800 dark:lg:bg-slate-900/70',
    'lg:fixed lg:inset-y-0 lg:left-0',
    'transition-all duration-200',
    isCollapsed ? 'lg:w-24' : 'lg:w-72',
  ].join(' ');

  const desktopPaddingStyle = !isMobile
    ? { paddingLeft: `${isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px` }
    : undefined;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {!isMobile && (
        <aside className={sidebarClasses}>
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="MoneyWave"
                className={`h-12 w-12 rounded-2xl transition-all ${isCollapsed ? 'h-10 w-10' : ''}`}
                loading="lazy"
              />
              {!isCollapsed && (
                <div>
                  <p className="text-lg font-semibold">MoneyWave</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài chính</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                className="icon-button icon-button--ghost lg:flex"
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                aria-pressed={isCollapsed}
              >
                <SidebarToggleIcon size={18} className={`transition ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={navLinkClasses(isActive)}
                    title={item.label}
                    aria-label={isCollapsed ? item.label : undefined}
                  >
                    <span className="icon-badge" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
      )}
      <div className="flex min-h-screen flex-1 flex-col" style={desktopPaddingStyle}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 sm:py-4 lg:px-10">
          <div className="flex items-center gap-3">
            {isMobile && <img src="/logo.png" alt="MoneyWave" className="h-10 w-10 rounded-2xl" />}
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Xin chào</p>
              <p className="text-lg font-semibold">
                {currentUser?.full_name || currentUser?.username || 'Người dùng'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-button" type="button" onClick={toggleTheme} aria-label="Đổi giao diện">
              {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            </button>
            <button className="btn btn-ghost bg-white/80 text-sm dark:bg-slate-900/40" type="button" onClick={onLogout}>
              <LogoutIcon size={18} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-12 lg:px-10 lg:pb-10">{children}</main>
      </div>
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
