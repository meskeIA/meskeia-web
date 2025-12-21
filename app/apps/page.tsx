'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import { suites, applicationsDatabase, SuiteType } from '@/data/applications';
import { isAppImplemented, TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

export default function AppsPage() {
  const [selectedSuite, setSelectedSuite] = useState<SuiteType | 'all'>('all');

  // Filtrar solo apps implementadas y ordenar alfabéticamente
  const implementedApps = useMemo(() =>
    applicationsDatabase
      .filter(app => isAppImplemented(app.url))
      .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    []
  );

  const getAppsBySuite = (suiteId: SuiteType) => {
    return implementedApps.filter(app => app.suites.includes(suiteId));
  };

  // Filtrar apps por suite seleccionada
  const filteredApps = selectedSuite === 'all'
    ? implementedApps
    : implementedApps.filter(app => app.suites.includes(selectedSuite));

  const totalApps = TOTAL_IMPLEMENTED_APPS;
  const totalSuites = suites.length;

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Catálogo Completo de Apps</h1>
          <p className={styles.pageSubtitle}>
            Aplicaciones web gratuitas organizadas por suites temáticas. Sin registro, sin anuncios.
          </p>

          {/* Estadísticas */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalApps}</span>
              <span className={styles.statLabel}>Apps</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalSuites}</span>
              <span className={styles.statLabel}>Suites</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Gratuitas</span>
            </div>
          </div>
        </header>

        {/* Filtros por suite */}
        <div className={styles.filtersContainer}>
          <button
            className={`${styles.filterButton} ${selectedSuite === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedSuite('all')}
          >
            📦 Todas ({totalApps})
          </button>
          {suites.map((suite) => {
            const count = getAppsBySuite(suite.id).length;
            return (
              <button
                key={suite.id}
                className={`${styles.filterButton} ${selectedSuite === suite.id ? styles.active : ''}`}
                onClick={() => setSelectedSuite(suite.id)}
              >
                {suite.icon} {suite.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid de herramientas */}
        <div className={styles.toolsGrid}>
          {filteredApps.map((app, index) => (
            <article key={index} className={styles.toolCard}>
              <div className={styles.toolIcon}>{app.icon}</div>
              <div className={styles.toolContent}>
                <h3 className={styles.toolTitle}>
                  <Link href={app.url}>{app.name}</Link>
                </h3>
                <p className={styles.toolDescription}>{app.description}</p>
                <div className={styles.toolMeta}>
                  <span className={styles.toolCategory}>
                    {app.suites.map(suiteId =>
                      suites.find(s => s.id === suiteId)?.icon
                    ).join(' ')}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mensaje si no hay resultados (no debería pasar) */}
        {filteredApps.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron Apps en esta suite.</p>
          </div>
        )}

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2>¿Buscas algo específico?</h2>
          <p>Usa nuestro buscador para encontrar la App perfecta</p>
          <Link href="/" className={styles.ctaButton}>
            🔍 Buscar Apps
          </Link>
        </div>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
