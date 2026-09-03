import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('tf_theme');
      return stored ? stored === 'dark' : true; // default dark for clinical command centers
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('tf_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('tf_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return { isDark, toggleTheme };
}
