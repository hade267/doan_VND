import React from 'react';

const SvgIcon = ({ size = 20, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

export const DashboardIcon = (props) => (
  <SvgIcon {...props}>
    <rect x="3.5" y="3.5" width="8" height="8" rx="2" />
    <rect x="12.5" y="3.5" width="8" height="5.5" rx="2" />
    <rect x="12.5" y="10.5" width="8" height="10" rx="2" />
    <rect x="3.5" y="13.5" width="8" height="7" rx="2" />
  </SvgIcon>
);

export const BrainIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M9 4.2c-2 0-3.5 1.6-3.5 3.6v6.5c0 1.8 1.4 3.2 3.2 3.2h1.3" />
    <path d="M9 6.5v11" />
    <path d="M15 4.2c2 0 3.5 1.6 3.5 3.6v6.5c0 1.8-1.4 3.2-3.2 3.2H14" />
    <path d="M15 6.5v11" />
    <path d="M9 10h-2" />
    <path d="M17 14h-2" />
  </SvgIcon>
);

export const WalletIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M3.5 8.5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-12c-1.1 0-2-.9-2-2z" />
    <path d="M15 8.5h4v4.5h-4a2.25 2.25 0 1 1 0-4.5z" />
    <circle cx="15.75" cy="10.75" r="0.75" fill="currentColor" stroke="none" />
  </SvgIcon>
);

export const TrendUpIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M4 14.5 9.5 9l3 3L20 4.5" />
    <path d="M16 4.5h4v4" />
  </SvgIcon>
);

export const TrendDownIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M4 9.5 9.5 15l3-3L20 19.5" />
    <path d="M16 19.5h4v-4" />
  </SvgIcon>
);

export const ExpenseIcon = TrendDownIcon;
export const IncomeIcon = TrendUpIcon;

export const SunIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2" />
    <path d="M12 19.5v2" />
    <path d="M4.5 4.5 6 6" />
    <path d="M18 18l1.5 1.5" />
    <path d="M2.5 12h2" />
    <path d="M19.5 12h2" />
    <path d="M4.5 19.5 6 18" />
    <path d="M18 6l1.5-1.5" />
  </SvgIcon>
);

export const MoonIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4a7.48 7.48 0 0 0 0 15A7.5 7.5 0 0 0 20 14.5Z" />
  </SvgIcon>
);

export const LogoutIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M15 7v-2.5a2.5 2.5 0 0 0-2.5-2.5H6.5A2.5 2.5 0 0 0 4 4.5v15a2.5 2.5 0 0 0 2.5 2.5h6a2.5 2.5 0 0 0 2.5-2.5V17" />
    <path d="M10 12h10" />
    <path d="M17 9l3 3-3 3" />
  </SvgIcon>
);

export const SettingsIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1-1.1 1.6l-.2-.1a1 1 0 0 0-1.1.2 1 1 0 0 0-.3 1.1l.1.2a1 1 0 0 1-1 1.4h-0.2a1 1 0 0 1-1-.7l-.1-.2a1 1 0 0 0-1.1-.6 1 1 0 0 0-.9.6l-.1.2a1 1 0 0 1-1.9 0l-.1-.2a1 1 0 0 0-1.1-.6 1 1 0 0 0-1 .7l-.1.1a1 1 0 0 1-1.9-.4l.1-.2a1 1 0 0 0-.3-1.1 1 1 0 0 0-1.1-.2l-.2.1a1 1 0 0 1-1.3-1.3l.1-.2a1 1 0 0 0-.2-1.1 1 1 0 0 0-1.1-.3l-.2.1a1 1 0 0 1-1.4-1v-0.2a1 1 0 0 1 .7-1l.2-.1a1 1 0 0 0 .6-1.1 1 1 0 0 0-.6-.9l-.2-.1a1 1 0 0 1 0-1.9l.2-.1a1 1 0 0 0 .6-1.1 1 1 0 0 0-.7-1l-.1-.1a1 1 0 0 1 .4-1.9h.2a1 1 0 0 1 1 .7l.1.2a1 1 0 0 0 1.1.3 1 1 0 0 0 .9-.7l.1-.2a1 1 0 0 1 1.9 0l.1.2a1 1 0 0 0 1.1.6 1 1 0 0 0 .9-.6l.1-.2a1 1 0 0 1 1.9 0l.1.2a1 1 0 0 0 1.1.6 1 1 0 0 0 .9-.6l.1-.2a1 1 0 0 1 1.9.4l-.1.2a1 1 0 0 0 .3 1.1 1 1 0 0 0 1.1.3l.2-.1A1 1 0 0 1 21 9.2l-.1.2a1 1 0 0 0 .2 1.1 1 1 0 0 0 1.1.3l.2-.1a1 1 0 0 1 1.3 1.3l-.1.2a1 1 0 0 0 .2 1.1 1 1 0 0 0 1.1.3l.2-.1" />
  </SvgIcon>
);

export const SidebarToggleIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M14.5 7 10 12l4.5 5" />
    <path d="M19 7l-4.5 5L19 17" />
  </SvgIcon>
);

export const ShieldIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M12 21.5s8-3 8-10.5V6.6a1 1 0 0 0-.67-.94l-7-2.6a1 1 0 0 0-.66 0l-7 2.6A1 1 0 0 0 4 6.6V11c0 7.5 8 10.5 8 10.5Z" />
    <path d="M9.5 11.5l1.5 1.5 3.5-3.5" />
  </SvgIcon>
);

export const ReceiptIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M7 3.5 9 5l2-1.5 2 1.5 2-1.5 2 1.5v15l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z" />
    <path d="M9 9.5h6" />
    <path d="M9 13h4" />
  </SvgIcon>
);

export const CheckIcon = (props) => (
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.2 2.2L16 9" />
  </SvgIcon>
);
