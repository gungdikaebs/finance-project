import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

// Shared singleton state across all component instances
const currentMode = ref<ThemeMode>('system');
const isDark = ref<boolean>(false);
let isInitialized = false;

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

function updateDOM(dark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export function useTheme() {
  if (!isInitialized && typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      currentMode.value = saved;
    } else {
      currentMode.value = 'system';
    }

    isDark.value = resolveIsDark(currentMode.value);
    updateDOM(isDark.value);

    // Watch OS color scheme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (currentMode.value === 'system') {
          isDark.value = e.matches;
          updateDOM(isDark.value);
        }
      });
    }

    isInitialized = true;
  }

  const setTheme = (mode: ThemeMode) => {
    currentMode.value = mode;
    localStorage.setItem(STORAGE_KEY, mode);
    isDark.value = resolveIsDark(mode);
    updateDOM(isDark.value);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark.value ? 'light' : 'dark';
    setTheme(nextMode);
  };

  return {
    theme: currentMode,
    isDark,
    setTheme,
    toggleTheme,
  };
}
