'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={styles.themeToggle} aria-label="Cambiar tema">
        <span className={styles.icon}>🌙</span>
      </button>
    );
  }

  return (
    <button
      className={styles.themeToggle}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className={styles.icon}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
