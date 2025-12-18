'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SidebarMobile.module.css';
import MeskeiaLogo from './MeskeiaLogo';
import { getRecentApps, type RecentApp } from '@/lib/recentApps';
import { applicationsDatabase, type Application } from '@/data/applications';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';

// Tipo para las vistas principales
type MainView = 'home' | 'momentos' | 'categorias' | 'porquemeskeia' | 'faq';

// Obtener app por URL
function getAppByUrl(url: string): Application | undefined {
  return applicationsDatabase.find(app => app.url === url);
}

interface SidebarMobileProps {
  onViewChange?: (view: MainView) => void;
  currentView?: MainView;
}

export default function SidebarMobile({ onViewChange, currentView = 'home' }: SidebarMobileProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [recentAppsCollapsed, setRecentAppsCollapsed] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    setMounted(true);
    setRecentApps(getRecentApps().slice(0, 8));

    // Cargar preferencia de apps recientes colapsadas
    const savedRecentCollapsed = localStorage.getItem('meskeia_recent_apps_collapsed');
    if (savedRecentCollapsed) {
      setRecentAppsCollapsed(savedRecentCollapsed === 'true');
    }
  }, []);

  // Actualizar apps recientes cuando cambia la ruta
  useEffect(() => {
    if (mounted) {
      setRecentApps(getRecentApps().slice(0, 8));
      // Cerrar sidebar al navegar
      setIsOpen(false);
    }
  }, [pathname, mounted]);

  // Cerrar sidebar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Bloquear scroll del body cuando sidebar está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Manejar cambio de vista
  const handleViewChange = useCallback((view: MainView) => {
    setIsOpen(false);
    if (onViewChange) {
      onViewChange(view);
    }
  }, [onViewChange]);

  // Toggle para apps recientes
  const toggleRecentApps = useCallback(() => {
    const newState = !recentAppsCollapsed;
    setRecentAppsCollapsed(newState);
    localStorage.setItem('meskeia_recent_apps_collapsed', String(newState));
  }, [recentAppsCollapsed]);

  // Evitar hidratación incorrecta
  if (!mounted) {
    return (
      <button className={styles.hamburgerButton} aria-label="Abrir menú">
        ☰
      </button>
    );
  }

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className={styles.hamburgerButton}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        ☰
      </button>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebarMobile} ${isOpen ? styles.sidebarMobileOpen : ''}`}
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper} onClick={() => handleViewChange('home')}>
            <MeskeiaLogo inline showThemeToggle={false} />
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
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
                        onClick={() => setIsOpen(false)}
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

          {/* Botón Inicio (solo cuando no estamos en home) */}
          {currentView !== 'home' && (
            <>
              <div className={styles.navButtons}>
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.navButtonHome}`}
                  onClick={() => handleViewChange('home')}
                >
                  <span className={styles.navButtonIcon}>🏠</span>
                  <span className={styles.navButtonText}>Inicio</span>
                </button>
              </div>
              <div className={styles.divider} />
            </>
          )}

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
              className={`${styles.navButton} ${currentView === 'categorias' ? styles.navButtonActive : ''}`}
              onClick={() => handleViewChange('categorias')}
            >
              <span className={styles.navButtonIcon}>📂</span>
              <span className={styles.navButtonText}>Categorías</span>
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
    </>
  );
}
