import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BrainIcon,
  DashboardIcon,
  LogoutIcon,
  MoonIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldIcon,
  SidebarToggleIcon,
  SunIcon,
  TrendUpIcon,
} from './icons';

const enableNlpLogs = import.meta.env.MODE !== 'production';
const COLLAPSED_WIDTH = 96;
const EXPANDED_WIDTH = 288;

const getIsMobile = () => (typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

const getInitialCollapse = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('sidebar-collapsed');
  if (stored !== null) return stored === 'true';
  return getIsMobile();
};

const buildInitials = (user) => {
  if (!user) return 'MW';
  const name = user.full_name || user.username || user.email || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const AppLayout = ({ children, onLogout }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapse);
  const [theme, setTheme] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'),
  );
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const userInitials = useMemo(() => buildInitials(currentUser), [currentUser]);

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
    const items = [
      { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
      { to: '/transactions', label: 'Giao dịch', icon: ReceiptIcon },
    ];
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
        ? 'bg-gradient-to-r from-brand/25 to-brand/10 text-brand shadow-lg shadow-brand/20'
        : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
    ]
      .filter(Boolean)
      .join(' ');

  const sidebarClasses = [
    'hidden lg:flex lg:flex-col lg:px-4 lg:py-6 lg:backdrop-blur',
    'lg:fixed lg:inset-y-0 lg:left-0',
    'transition-all duration-200',
    isCollapsed ? 'lg:w-24' : 'lg:w-72',
  ].join(' ');

  const desktopPaddingStyle = !isMobile
    ? { paddingLeft: `${isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px` }
    : undefined;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 dark:text-slate-100">
      {!isMobile && (
        <aside className={sidebarClasses}>
          <div className="glass-panel flex h-full flex-col overflow-hidden p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center rounded-2xl bg-brand/15 text-brand transition-all dark:bg-brand/30 dark:text-white ${isCollapsed ? 'h-10 w-10 text-base' : 'h-12 w-12 text-lg'}`}
              >
                {userInitials}
              </div>
              {!isCollapsed && (
                <div>
                  <p className="text-lg font-semibold">{currentUser?.full_name || 'MoneyWave'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng ưu tiên'}
                  </p>
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
              {!isCollapsed && (
                <span className="chip chip--brand">
                  <TrendUpIcon size={16} /> Tài chính 24/7
                </span>
              )}
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
            {!isCollapsed && (
              <div className="mt-auto glass-panel bg-white/70 p-4 text-sm dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">Chế độ nhanh</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="icon-button w-full" type="button" onClick={toggleTheme} aria-label="Đổi giao diện">
                    {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
                    <span className="hidden sm:inline">{theme === 'light' ? 'Tối' : 'Sáng'}</span>
                  </button>
                  <button className="icon-button w-full" type="button" onClick={onLogout}>
                    <LogoutIcon size={18} />
                    <span className="hidden sm:inline">Thoát</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
      <div className="flex min-h-screen flex-1 flex-col" style={desktopPaddingStyle}>
        <header className={`floating-toolbar ${isMobile ? 'mt-3' : 'mt-6'}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-base font-semibold text-brand dark:bg-brand/30 dark:text-white">
              {userInitials}
              <span className="absolute -bottom-1 -right-1 inline-flex rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">
                Live
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Xin chào</p>
              <p className="text-xl font-semibold">{currentUser?.full_name || currentUser?.username || 'Người dùng'}</p>
              <p className="text-xs text-slate-400">
                {currentUser?.role === 'admin' ? 'Toàn quyền quản trị' : 'Ghi chép & phân tích cá nhân'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/transactions" className="chip chip--brand">
              <ReceiptIcon size={16} /> Xem giao dịch
            </Link>
            <Link to="/dashboard" className="chip">
              <TrendUpIcon size={16} /> Báo cáo nhanh
            </Link>
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
          <button className="bottom-nav__link" type="button" onClick={toggleTheme} aria-label="Đổi giao diện">
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
            <span>Theme</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
