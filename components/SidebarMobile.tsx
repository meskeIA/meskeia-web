'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SidebarMobile.module.css';
import MeskeiaLogo from './MeskeiaLogo';
import { getRecentApps, type RecentApp } from '@/lib/recentApps';
import { withFrom } from '@/lib/trackingFrom';
import { applicationsDatabase, type Application } from '@/data/applications';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';

// Obtener app por URL
function getAppByUrl(url: string): Application | undefined {
  return applicationsDatabase.find(app => app.url === url);
}

export default function SidebarMobile() {
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
          <Link href="/" className={styles.logoWrapper} onClick={() => setIsOpen(false)}>
            {/* `disableLink`: el <Link> de fuera ya lleva a la portada */}
            <MeskeiaLogo inline showThemeToggle={false} disableLink />
          </Link>
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
                        href={withFrom(recent.url, 'sidebar-recent')}
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

          {/* Catálogo completo - acceso a /apps */}
          <div className={styles.navButtons}>
            <Link
              href="/apps"
              className={`${styles.navButton} ${pathname === '/apps' ? styles.navButtonActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className={styles.navButtonIcon}>📦</span>
              <span className={styles.navButtonText}>Catálogo completo</span>
            </Link>
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
