'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import MeskeiaLogo from './MeskeiaLogo';
import { getRecentApps, type RecentApp } from '@/lib/recentApps';
import { applicationsDatabase, type Application } from '@/data/applications';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';

// Tipo para las vistas principales
type MainView = 'home' | 'momentos' | 'suites' | 'guias' | 'porquemeskeia' | 'faq';

// Obtener app por URL
function getAppByUrl(url: string): Application | undefined {
  return applicationsDatabase.find(app => app.url === url);
}

interface SidebarProps {
  onViewChange?: (view: MainView) => void;
  currentView?: MainView;
}

export default function Sidebar({ onViewChange, currentView = 'home' }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [recentAppsCollapsed, setRecentAppsCollapsed] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    setMounted(true);

    // Cargar preferencia de sidebar colapsado
    const savedCollapsed = localStorage.getItem('meskeia_sidebar_collapsed');
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === 'true');
    }

    // Cargar preferencia de apps recientes colapsadas
    const savedRecentCollapsed = localStorage.getItem('meskeia_recent_apps_collapsed');
    if (savedRecentCollapsed) {
      setRecentAppsCollapsed(savedRecentCollapsed === 'true');
    }

    // Cargar apps recientes (máximo 8)
    setRecentApps(getRecentApps().slice(0, 8));
  }, []);

  // Actualizar apps recientes cuando cambia la ruta
  useEffect(() => {
    if (mounted) {
      setRecentApps(getRecentApps().slice(0, 8));
    }
  }, [pathname, mounted]);

  // Guardar preferencia de sidebar colapsado
  const toggleCollapsed = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('meskeia_sidebar_collapsed', String(newState));
  }, [isCollapsed]);

  // Toggle para apps recientes
  const toggleRecentApps = useCallback(() => {
    const newState = !recentAppsCollapsed;
    setRecentAppsCollapsed(newState);
    localStorage.setItem('meskeia_recent_apps_collapsed', String(newState));
  }, [recentAppsCollapsed]);

  // Manejar cambio de vista
  const handleViewChange = useCallback((view: MainView) => {
    if (onViewChange) {
      onViewChange(view);
    }
  }, [onViewChange]);

  // Evitar hidratación incorrecta
  if (!mounted) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <MeskeiaLogo inline showThemeToggle={false} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Header con logo */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoWrapper} onClick={() => handleViewChange('home')}>
          {/* Logo completo cuando expandido, solo icono cuando colapsado */}
          {isCollapsed ? (
            <div className={styles.logoIconOnly}>
              <div className={styles.logoIconSmall}>
                <div className={styles.neuralDot}></div>
                <div className={styles.neuralDot}></div>
              </div>
            </div>
          ) : (
            <MeskeiaLogo inline showThemeToggle={false} />
          )}
        </div>
      </div>

      {/* Toggle button en línea separada */}
      <div className={styles.toggleRow}>
        <button
          className={styles.toggleButton}
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Contenido scrolleable */}
      <div className={styles.sidebarContent}>
        {/* Contador de apps */}
        <div className={styles.appCounter}>
          <span className={styles.appCounterNumber}>{TOTAL_IMPLEMENTED_APPS}</span>
          <span className={styles.appCounterText}>aplicaciones</span>
        </div>

        {/* Apps visitadas (recientes) */}
        {recentApps.length > 0 && (
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={toggleRecentApps}
              aria-expanded={recentAppsCollapsed ? 'false' : 'true'}
              aria-label={recentAppsCollapsed ? 'Expandir apps visitadas' : 'Colapsar apps visitadas'}
            >
              <span className={styles.sectionIcon}>🕐</span>
              <span className={styles.sectionTitle}>Apps visitadas</span>
              <span className={`${styles.sectionArrow} ${!recentAppsCollapsed ? styles.sectionArrowOpen : ''}`}>
                ▼
              </span>
            </button>
            <div className={`${styles.sectionContent} ${recentAppsCollapsed ? styles.sectionContentClosed : styles.sectionContentOpen}`}>
              <div className={styles.recentApps}>
                {recentApps.map((recent) => {
                  const app = getAppByUrl(recent.url);
                  if (!app) return null;
                  return (
                    <Link
                      key={recent.url}
                      href={recent.url}
                      className={`${styles.recentApp} ${pathname === recent.url ? styles.navItemActive : ''}`}
                    >
                      <span className={styles.recentAppIcon}>{app.icon}</span>
                      <span className={styles.recentAppName}>{app.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {recentApps.length === 0 && (
          <div className={styles.noRecentApps}>
            Aún no has visitado ninguna app
          </div>
        )}

        <div className={styles.divider} />

        {/* Botón Buscar - siempre visible, lleva a home con búsqueda */}
        <div className={styles.navButtons}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => handleViewChange('home')}
          >
            <span className={styles.navButtonIcon}>🔍</span>
            <span className={styles.navButtonText}>Buscar</span>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Navegación principal - Botones simples */}
        <div className={styles.navButtons}>
          <button
            type="button"
            className={`${styles.navButton} ${currentView === 'momentos' ? styles.navButtonActive : ''}`}
            onClick={() => handleViewChange('momentos')}
          >
            <span className={styles.navButtonIcon}>✨</span>
            <span className={styles.navButtonText}>Momentos</span>
          </button>

          <button
            type="button"
            className={`${styles.navButton} ${currentView === 'suites' ? styles.navButtonActive : ''}`}
            onClick={() => handleViewChange('suites')}
          >
            <span className={styles.navButtonIcon}>📦</span>
            <span className={styles.navButtonText}>Suites</span>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Guías - Vista con todas las guías disponibles */}
        <div className={styles.navButtons}>
          <button
            type="button"
            className={`${styles.navButton} ${currentView === 'guias' ? styles.navButtonActive : ''}`}
            onClick={() => handleViewChange('guias')}
          >
            <span className={styles.navButtonIcon}>📚</span>
            <span className={styles.navButtonText}>Guías</span>
          </button>
        </div>

        <div className={styles.divider} />

        {/* Links informativos */}
        <div className={styles.infoLinks}>
          <button
            type="button"
            className={`${styles.infoLink} ${currentView === 'porquemeskeia' ? styles.infoLinkActive : ''}`}
            onClick={() => handleViewChange('porquemeskeia')}
          >
            <span className={styles.navButtonIcon}>ℹ️</span>
            <span>Por qué meskeIA</span>
          </button>
          <button
            type="button"
            className={`${styles.infoLink} ${currentView === 'faq' ? styles.infoLinkActive : ''}`}
            onClick={() => handleViewChange('faq')}
          >
            <span className={styles.navButtonIcon}>❓</span>
            <span>Preguntas frecuentes</span>
          </button>
        </div>
      </div>

      {/* Footer con toggle de tema */}
      <div className={styles.sidebarFooter}>
        <div
          className={styles.themeToggle}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          role="button"
          tabIndex={0}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <span className={styles.themeToggleLabel}>
            <span className={styles.navButtonIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
          </span>
          <div className={`${styles.themeToggleSwitch} ${theme === 'dark' ? styles.themeToggleSwitchActive : ''}`}>
            <div className={styles.themeToggleKnob} />
          </div>
        </div>
      </div>
    </aside>
  );
}
