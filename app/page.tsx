'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar, SidebarMobile, DailyApps, MeskeiaLogo } from '@/components';
import SearchBar from '@/components/SearchBar';
import HomeFooter from '@/components/home/HomeFooter';
import WhyMeskeIA from '@/components/home/WhyMeskeIA';
import FAQ from '@/components/home/FAQ';
import { suites, SuiteType, getAppsBySuite } from '@/data/applications';
import { isAppImplemented, TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import { addRecentApp } from '@/lib/recentApps';
import styles from './page.module.css';

// Tipos de vista para el área principal
type MainView = 'home' | 'suites' | 'guias' | 'porquemeskeia' | 'faq';

// Datos de las guías disponibles
const guidesData = [
  {
    id: 'comprar-casa',
    name: 'Guía para Comprar Casa',
    icon: '🏠',
    description: 'Desde buscar hipoteca hasta calcular todos los gastos de compra',
    url: '/guia/comprar-casa/',
    toolsCount: 5,
    available: true,
  },
  {
    id: 'freelance',
    name: 'Guía Freelance',
    icon: '💼',
    description: 'Facturación, impuestos y gestión para trabajadores independientes',
    url: '/guia/freelance/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'invertir',
    name: 'Guía para Invertir',
    icon: '📈',
    description: 'Primeros pasos en inversión: ahorro, fondos y planificación',
    url: '/guia/invertir/',
    toolsCount: 5,
    available: true,
  },
  {
    id: 'ahorrar-dinero',
    name: 'Guía para Ahorrar Dinero',
    icon: '💰',
    description: 'Control de gastos, fondo de emergencia y estrategias para eliminar deudas',
    url: '/guia/ahorrar-dinero/',
    toolsCount: 6,
    available: true,
  },
  {
    id: 'vivir-sano',
    name: 'Guía para Vivir Más Sano',
    icon: '🌿',
    description: 'Nutrición, sueño, hidratación y hábitos saludables duraderos',
    url: '/guia/vivir-sano/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'comprar-coche',
    name: 'Guía para Comprar un Coche',
    icon: '🚗',
    description: 'Compara contado, financiación y renting. Calcula el coste real de uso',
    url: '/guia/comprar-coche/',
    toolsCount: 4,
    available: true,
  },
  {
    id: 'montar-negocio',
    name: 'Guía para Montar un Negocio',
    icon: '🚀',
    description: 'Valida tu idea, calcula el break-even y gestiona desde el primer día',
    url: '/guia/montar-negocio/',
    toolsCount: 7,
    available: true,
  },
  {
    id: 'accesibilidad',
    name: 'Guía de Accesibilidad Digital',
    icon: '♿',
    description: 'Kit de apoyos visuales para autismo, TDAH y dislexia. Sin registro ni instalación',
    url: '/guia/accesibilidad/',
    toolsCount: 9,
    available: true,
  },
  {
    id: 'herencias',
    name: 'Guía para Gestionar una Herencia',
    icon: '📜',
    description: 'Documentos, impuestos y plazos para tramitar una herencia en España',
    url: '/guia/herencias/',
    toolsCount: 4,
    available: true,
  },
  {
    id: 'jubilacion',
    name: 'Guía para Planificar la Jubilación',
    icon: '🏤',
    description: 'Pensión pública, brecha de ingresos, ahorro complementario, plan de pensiones e IRPF como pensionista',
    url: '/guia/jubilacion/',
    toolsCount: 6,
    available: true,
  },
  {
    id: 'pensar-mejor',
    name: 'Guía Pensar Mejor',
    icon: '🧠',
    description: 'Herramientas de reflexión profesional: conócete, decide mejor y emprende con criterio',
    url: '/guia/pensar-mejor/',
    toolsCount: 14,
    available: true,
  },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<MainView>('home');
  const [selectedSuite, setSelectedSuite] = useState<SuiteType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Leer parámetros de URL para filtros
  useEffect(() => {
    const suiteParam = searchParams.get('suite') as SuiteType | null;
    const vistaParam = searchParams.get('vista') as MainView | null;

    if (vistaParam) {
      setCurrentView(vistaParam);
    } else if (suiteParam && suites.some(s => s.id === suiteParam)) {
      setCurrentView('suites');
      setSelectedSuite(suiteParam);
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
      setSelectedSuite(null);
    };

    window.addEventListener('changeMainView' as any, handleViewChange);
    return () => window.removeEventListener('changeMainView' as any, handleViewChange);
  }, []);

  // Obtener apps por suite (solo implementadas) y ordenar alfabéticamente
  const getImplementedAppsBySuite = (suiteId: SuiteType) => {
    return getAppsBySuite(suiteId)
      .filter(app => isAppImplemented(app.url))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  };

  // Manejar click en app (añadir a recientes)
  const handleAppClick = useCallback((url: string) => {
    addRecentApp(url);
  }, []);

  // Volver a home
  const goHome = () => {
    setCurrentView('home');
    setSelectedSuite(null);
  };

  // Renderizar contenido según la vista
  const renderMainContent = () => {
    switch (currentView) {
      case 'suites':
        return (
          <section className={styles.viewSection}>
            <div className={styles.viewHeader}>
              <button onClick={goHome} className={styles.backButton}>← Volver</button>
              <h2 className={styles.viewTitle}>📦 Suites Temáticas</h2>
            </div>
            <div className={styles.suitesGrid}>
              {suites.map((suite) => {
                const apps = getImplementedAppsBySuite(suite.id);
                const isOpen = selectedSuite === suite.id;

                return (
                  <div key={suite.id} className={`${styles.suiteCard} ${isOpen ? styles.suiteCardOpen : ''}`}>
                    <div
                      className={styles.suiteHeader}
                      onClick={() => setSelectedSuite(isOpen ? null : suite.id)}
                    >
                      <div className={styles.suiteIcon}>{suite.icon}</div>
                      <div className={styles.suiteInfo}>
                        <h3 className={styles.suiteTitle}>{suite.name}</h3>
                        <span className={styles.suiteCount}>{apps.length} Apps</span>
                      </div>
                    </div>

                    {isOpen && (
                      <ul className={styles.suiteApps}>
                        {apps.map((app, index) => (
                          <li key={index}>
                            <a href={app.url} onClick={() => handleAppClick(app.url)} title={app.description}>
                              <span>{app.icon}</span>
                              {app.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'guias':
        return (
          <section className={styles.viewSection}>
            <div className={styles.viewHeader}>
              <button onClick={goHome} className={styles.backButton}>← Volver</button>
              <h2 className={styles.viewTitle}>📚 Guías Prácticas</h2>
            </div>
            <p className={styles.viewDescription}>
              Guías paso a paso que conectan las herramientas que necesitas para resolver situaciones concretas.
            </p>
            <div className={styles.guidesGrid}>
              {guidesData.map((guide) => (
                <div key={guide.id} className={`${styles.guideCard} ${!guide.available ? styles.guideCardDisabled : ''}`}>
                  {guide.available ? (
                    <a href={guide.url} className={styles.guideCardLink}>
                      <div className={styles.guideIcon}>{guide.icon}</div>
                      <div className={styles.guideInfo}>
                        <h3 className={styles.guideTitle}>{guide.name}</h3>
                        <p className={styles.guideDescription}>{guide.description}</p>
                        <span className={styles.guideCount}>{guide.toolsCount} herramientas</span>
                      </div>
                      <span className={styles.guideArrow}>→</span>
                    </a>
                  ) : (
                    <div className={styles.guideCardContent}>
                      <div className={styles.guideIcon}>{guide.icon}</div>
                      <div className={styles.guideInfo}>
                        <h3 className={styles.guideTitle}>{guide.name}</h3>
                        <p className={styles.guideDescription}>{guide.description}</p>
                        <span className={styles.guideBadge}>Próximamente</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

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
