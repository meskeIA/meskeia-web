'use client';
// @disclaimer: exempt

import { LegalNotice, ShareCard } from '@/components';
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import { suites, applicationsDatabase, SuiteType } from '@/data/applications';
import { isAppImplemented, TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import { guidesJourney } from '@/data/guides-journey';
import { withFrom } from '@/lib/trackingFrom';
import styles from './page.module.css';

type Tab = 'apps' | 'guias';

// Normaliza una cadena para búsqueda: minúsculas + sin acentos
const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function AppsPage() {
  const [tab, setTab] = useState<Tab>('apps');
  const [selectedSuite, setSelectedSuite] = useState<SuiteType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  // Filtrar solo apps implementadas y ordenar alfabéticamente
  const implementedApps = useMemo(
    () =>
      applicationsDatabase
        .filter((app) => isAppImplemented(app.url))
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    []
  );

  // Conteo por suite (apps implementadas)
  const suiteCounts = useMemo(() => {
    const counts = new Map<SuiteType, number>();
    implementedApps.forEach((app) => {
      app.suites.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1));
    });
    return counts;
  }, [implementedApps]);

  // Apps filtradas por suite + búsqueda
  const filteredApps = useMemo(() => {
    let list = implementedApps;
    if (selectedSuite !== 'all') {
      list = list.filter((app) => app.suites.includes(selectedSuite));
    }
    const q = normalize(searchTerm.trim());
    if (q.length >= 2) {
      list = list.filter((app) => {
        const haystack = normalize(
          `${app.name} ${app.description} ${app.keywords.join(' ')}`
        );
        return haystack.includes(q);
      });
    }
    return list;
  }, [implementedApps, selectedSuite, searchTerm]);

  const toggleExpanded = useCallback((url: string) => {
    setExpandedUrl((current) => (current === url ? null : url));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedSuite('all');
    setSearchTerm('');
  }, []);

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        {/* Header simplificado */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Catálogo completo</h1>
          <p className={styles.pageSubtitle}>
            {TOTAL_IMPLEMENTED_APPS} aplicaciones web gratuitas en español. Sin registro y sin publicidad.
          </p>
        </header>

        {/* Pestañas */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'apps'}
            className={`${styles.tab} ${tab === 'apps' ? styles.tabActive : ''}`}
            onClick={() => setTab('apps')}
          >
            📦 Apps <span className={styles.tabCount}>{TOTAL_IMPLEMENTED_APPS}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'guias'}
            className={`${styles.tab} ${tab === 'guias' ? styles.tabActive : ''}`}
            onClick={() => setTab('guias')}
          >
            🧭 Caminos guiados <span className={styles.tabCount}>{guidesJourney.length}</span>
          </button>
        </div>

        {tab === 'apps' && (
          <>
            {/* Búsqueda local */}
            <div className={styles.searchRow}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Buscar en el catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar dentro del catálogo"
              />
              {(selectedSuite !== 'all' || searchTerm) && (
                <button type="button" className={styles.clearButton} onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Filtros por suite */}
            <div className={styles.filtersContainer}>
              <button
                type="button"
                className={`${styles.filterChip} ${selectedSuite === 'all' ? styles.filterChipActive : ''}`}
                onClick={() => setSelectedSuite('all')}
              >
                📦 Todas <span className={styles.filterCount}>{TOTAL_IMPLEMENTED_APPS}</span>
              </button>
              {suites.map((suite) => {
                const count = suiteCounts.get(suite.id) || 0;
                if (count === 0) return null;
                return (
                  <button
                    type="button"
                    key={suite.id}
                    className={`${styles.filterChip} ${selectedSuite === suite.id ? styles.filterChipActive : ''}`}
                    onClick={() => setSelectedSuite(suite.id)}
                  >
                    <span aria-hidden="true">{suite.icon}</span> {suite.name} <span className={styles.filterCount}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Resumen de resultados */}
            <p className={styles.resultsCount}>
              {filteredApps.length === implementedApps.length
                ? `${filteredApps.length} aplicaciones`
                : `${filteredApps.length} de ${implementedApps.length} aplicaciones`}
            </p>

            {/* Grid compacto con expansión inline */}
            {filteredApps.length === 0 ? (
              <div className={styles.noResults}>
                <p>No se encontraron apps con estos filtros.</p>
                <button type="button" className={styles.clearButton} onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ul className={styles.appsGrid}>
                {filteredApps.map((app) => {
                  const isExpanded = expandedUrl === app.url;
                  return (
                    <li
                      key={app.url}
                      className={`${styles.appCard} ${isExpanded ? styles.appCardExpanded : ''}`}
                    >
                      <button
                        type="button"
                        className={styles.appCardHeader}
                        onClick={() => toggleExpanded(app.url)}
                        aria-expanded={isExpanded}
                      >
                        <span className={styles.appCardIcon}>{app.icon}</span>
                        <span className={styles.appCardName}>{app.name}</span>
                        <span className={styles.appCardChevron} aria-hidden="true">
                          {isExpanded ? '▾' : '▸'}
                        </span>
                      </button>

                      {/* El cuerpo se renderiza SIEMPRE y se oculta con [hidden] en vez de
                          montarse solo al expandir. Motivo (2026-07-28): con el montaje
                          condicional este catálogo servía 1.149 tarjetas y CERO <a href>,
                          así que para Googlebot era una página sin salidas y las apps solo
                          existían vía sitemap. Ahora el enlace viaja siempre en el HTML.
                          La descripción y las etiquetas siguen montándose solo al abrir,
                          para no inflar el peso de la página. La UX no cambia: colapsado
                          no se ve ni recibe foco (lo garantiza .appCardBody[hidden]). */}
                      <div className={styles.appCardBody} hidden={!isExpanded}>
                        {isExpanded && (
                          <>
                            <p className={styles.appCardDescription}>{app.description}</p>
                            <div className={styles.appCardSuiteTags}>
                              {app.suites.map((suiteId) => {
                                const suite = suites.find((s) => s.id === suiteId);
                                if (!suite) return null;
                                return (
                                  <span key={suiteId} className={styles.appCardSuiteTag}>
                                    {suite.icon} {suite.name}
                                  </span>
                                );
                              })}
                            </div>
                          </>
                        )}
                        <Link href={withFrom(app.url, 'catalog')} className={styles.appCardCta}>
                          Abrir aplicación →
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {tab === 'guias' && (
          <>
            <p className={styles.guidesIntro}>
              Procesos completos curados: cada guía agrupa varias herramientas con texto explicativo
              para resolver una situación concreta.
            </p>
            <ul className={styles.guidesGrid}>
              {guidesJourney.map((guide) => (
                <li key={guide.id} className={styles.guideCard}>
                  <Link href={withFrom(guide.url, 'catalog-guides')} className={styles.guideCardLink}>
                    <div className={styles.guideIcon} aria-hidden="true">{guide.icon}</div>
                    <div className={styles.guideContent}>
                      <h3 className={styles.guideTitle}>{guide.name}</h3>
                      <p className={styles.guideDescription}>{guide.description}</p>
                      <span className={styles.guideMeta}>{guide.toolsCount} herramientas</span>
                    </div>
                    <span className={styles.guideArrow} aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <LegalNotice />
      </main>

      <ShareCard appName="catalogo-apps" />
      {/*
        Nombre propio en analytics (07/08/2026). Antes el catálogo se registraba
        como "meskeIA", el mismo cubo que /acerca, /contacto, /privacidad,
        /terminos y /mcp: sus 407 visitas de 90 días no se podían atribuir a
        ninguna página concreta. El catálogo es la superficie de descubrimiento
        con más enlaces del sitio (~1.100), así que necesita su propia serie para
        poder decidir sobre él. Las páginas legales siguen agregadas en "meskeIA".
      */}
      <Footer appName="catalogo-apps" />
    </>
  );
}
