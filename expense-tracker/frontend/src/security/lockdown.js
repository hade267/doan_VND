/* eslint-disable no-console */
const isBrowser = typeof window !== 'undefined';

const disableReactDevTools = () => {
  if (!isBrowser || import.meta.env.DEV) return;

  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook && typeof hook === 'object') {
    Object.keys(hook).forEach((key) => {
      hook[key] = typeof hook[key] === 'function' ? () => undefined : null;
    });
  }
};

const preventDebugShortcuts = () => {
  if (!isBrowser || import.meta.env.DEV) return;

  window.addEventListener(
    'keydown',
    (event) => {
      const blockedKeys = [
        event.key === 'F12',
        (event.ctrlKey || event.metaKey) && event.shiftKey && ['I', 'J', 'C'].includes(event.key?.toUpperCase()),
      ];
      if (blockedKeys.some(Boolean)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
};

const disableContextMenu = () => {
  if (!isBrowser || import.meta.env.DEV) return;

  window.addEventListener(
    'contextmenu',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );
};

export const applyRuntimeSecurityGuards = () => {
  disableReactDevTools();
  preventDebugShortcuts();
  disableContextMenu();
};
