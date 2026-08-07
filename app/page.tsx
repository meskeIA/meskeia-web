'use client';

import { useState, useEffect } from 'react';
import { Sidebar, SidebarMobile, DailyApps, MeskeiaLogo } from '@/components';
import SearchBar from '@/components/SearchBar';
import HomeFooter from '@/components/home/HomeFooter';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import VerticalesPortales from '@/components/home/VerticalesPortales';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

// JSON-LD WebSite + SearchAction de meskeIA (sitelinks searchbox).
// Se inyecta solo aquí, en la home, no en el layout raíz, para no contaminar
// subsitios con marca propia (/delegum) ni el resto de páginas internas.
const WEBSITE_JSONLD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'meskeIA',
  url: 'https://meskeia.com',
  description: 'Plataforma educativa gratuita en español: estudio, finanzas personales y herramientas prácticas. Sin registro ni publicidad.',
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://meskeia.com/icon-512x512.png',
      width: 512,
      height: 512,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://meskeia.com/herramientas?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: WEBSITE_JSONLD }} />
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

        <VerticalesPortales />

        {/*
          La home era un PUNTO CIEGO de medición: HomeFooter no monta el tracker
          (a diferencia de Footer, que sí), así que la portada no registraba ni una
          visita desde diciembre de 2025. Solo se veían sus clics de SALIDA
          (from=home-daily, sidebar-recent, search), sin denominador con el que
          calcular ninguna tasa. Detectado el 07/08/2026 al intentar decidir con
          datos si las "Apps del día" merecían seguir en la portada.

          `home` es el nombre que el dashboard ya esperaba (server/routers/analytics.ts
          cuenta sesionesConHome con appsUnicas.has('home')): ese contador llevaba
          desde su origen valiendo cero por falta de emisor, no por falta de visitas.
        */}
        <AnalyticsTracker appName="home" />

        <HomeFooter />
      </main>
    </div>
  );
}
