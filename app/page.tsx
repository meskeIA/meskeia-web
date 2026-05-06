'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar, SidebarMobile, DailyApps, MeskeiaLogo } from '@/components';
import SearchBar from '@/components/SearchBar';
import HomeFooter from '@/components/home/HomeFooter';
import WhyMeskeIA from '@/components/home/WhyMeskeIA';
import FAQ from '@/components/home/FAQ';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

// Tipos de vista para el área principal
type MainView = 'home' | 'porquemeskeia' | 'faq';

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<MainView>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Leer parámetros de URL para filtros
  useEffect(() => {
    const vistaParam = searchParams.get('vista') as MainView | null;
    if (vistaParam) {
      setCurrentView(vistaParam);
    }
  }, [searchParams]);

  // Escuchar cambio de sidebar colapsado
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('meskeia_sidebar_collapsed');
    if (savedCollapsed) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }

    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('meskeia_sidebar_collapsed');
      setSidebarCollapsed(collapsed === 'true');
    };

    window.addEventListener('storage', handleStorageChange);

    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('meskeia_sidebar_collapsed');
      setSidebarCollapsed(collapsed === 'true');
    };

    const interval = setInterval(checkSidebarState, 100);
    setTimeout(() => clearInterval(interval), 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Escuchar eventos del sidebar para cambiar vista
  useEffect(() => {
    const handleViewChange = (e: CustomEvent<{ view: MainView }>) => {
      setCurrentView(e.detail.view);
    };

    window.addEventListener('changeMainView' as any, handleViewChange);
    return () => window.removeEventListener('changeMainView' as any, handleViewChange);
  }, []);

  // Volver a home
  const goHome = () => {
    setCurrentView('home');
  };

  // Renderizar contenido según la vista
  const renderMainContent = () => {
    switch (currentView) {
      case 'porquemeskeia':
        return (
          <section className={styles.viewSection}>
            <div className={styles.viewHeader}>
              <button onClick={goHome} className={styles.backButton}>← Volver</button>
            </div>
            <WhyMeskeIA />
          </section>
        );

      case 'faq':
        return (
          <section className={styles.viewSection}>
            <div className={styles.viewHeader}>
              <button onClick={goHome} className={styles.backButton}>← Volver</button>
            </div>
            <FAQ />
          </section>
        );

      default: // home
        return (
          <>
            {/* Header con logo */}
            <header className={styles.header}>
              <div className={styles.headerContent}>
                <MeskeiaLogo disableLink inline showThemeToggle={false} />
                <p className={styles.subtitle}>
                  {TOTAL_IMPLEMENTED_APPS} aplicaciones web gratuitas para tu día a día
                </p>
              </div>
            </header>

            {/* Búsqueda central grande */}
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <SearchBar large />
              </div>
            </div>

            {/* Apps del día */}
            <section className={styles.dailySection}>
              <DailyApps count={4} />
            </section>
          </>
        );
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Sidebar Desktop */}
      <Sidebar onViewChange={setCurrentView} currentView={currentView} />

      {/* Sidebar Mobile (hamburger) */}
      <SidebarMobile onViewChange={setCurrentView} currentView={currentView} />

      {/* Contenido principal */}
      <main className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentExpanded : ''}`}>
        {renderMainContent()}
        <HomeFooter />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className={styles.loading}>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
