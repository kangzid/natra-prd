export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'donezo-natra-theme-preference';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'system';
}

export function isDarkModeActive(): boolean {
  const mode = getStoredTheme();
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyTheme(mode: ThemeMode): boolean {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore
  }

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }

  return isDark;
}

export function initTheme(): boolean {
  return applyTheme(getStoredTheme());
}

export function setTheme(mode: ThemeMode): boolean {
  return applyTheme(mode);
}

export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  let nextMode: ThemeMode;
  if (current === 'dark') {
    nextMode = 'light';
  } else if (current === 'light') {
    nextMode = 'dark';
  } else {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    nextMode = isDark ? 'light' : 'dark';
  }
  applyTheme(nextMode);
  return nextMode;
}

export function initThemeListener(onChange?: (isDark: boolean) => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    const current = getStoredTheme();
    if (current === 'system') {
      const isDark = applyTheme('system');
      onChange?.(isDark);
    }
  };

  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
