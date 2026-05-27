'use client';

import { useState, useEffect } from 'react';
import { Sidebar, SidebarMobile, DailyApps, MeskeiaLogo } from '@/components';
import SearchBar from '@/components/SearchBar';
import HomeFooter from '@/components/home/HomeFooter';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sincronizar estado del sidebar colapsado con localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('meskeia_sidebar_collapsed');
    if (savedCollapsed) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }

    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('meskeia_sidebar_collapsed');
      setSidebarCollapsed(collapsed === 'true');
    };

    window.addEventListener('storage', checkSidebarState);
    const interval = setInterval(checkSidebarState, 100);
    setTimeout(() => clearInterval(interval), 2000);

    return () => {
      window.removeEventListener('storage', checkSidebarState);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Sidebar />
      <SidebarMobile />

      <main className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentExpanded : ''}`}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <MeskeiaLogo disableLink inline showThemeToggle={false} />
            <h1 className={styles.subtitle}>
              {TOTAL_IMPLEMENTED_APPS} aplicaciones web gratuitas para tu día a día
            </h1>
          </div>
        </header>

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <SearchBar large />
          </div>
        </div>

        <section className={styles.dailySection}>
          <DailyApps count={4} />
        </section>

        <HomeFooter />
      </main>
    </div>
  );
}
