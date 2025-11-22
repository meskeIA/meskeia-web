'use client';

import { useState } from 'react';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import { categories, applicationsDatabase } from '@/data/applications';
import styles from './page.module.css';

export default function HerramientasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getAppsByCategory = (categoryName: string) => {
    return applicationsDatabase.filter(app => app.category === categoryName);
  };

  const filteredApps = selectedCategory === 'all'
    ? applicationsDatabase
    : applicationsDatabase.filter(app => app.category === selectedCategory);

  const totalApps = applicationsDatabase.length;
  const totalCategories = categories.length;

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Catálogo Completo de Herramientas</h1>
          <p className={styles.pageSubtitle}>
            Aplicaciones web gratuitas organizadas por categorías. Sin registro, sin anuncios.
          </p>

          {/* Estadísticas */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalApps}</span>
              <span className={styles.statLabel}>Herramientas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalCategories}</span>
              <span className={styles.statLabel}>Categorías</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Gratuitas</span>
            </div>
          </div>
        </header>

        {/* Filtros por categoría */}
        <div className={styles.filtersContainer}>
          <button
            className={`${styles.filterButton} ${selectedCategory === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            📦 Todas ({totalApps})
          </button>
          {categories.map((category) => {
            const count = getAppsByCategory(category.name).length;
            return (
              <button
                key={category.id}
                className={`${styles.filterButton} ${selectedCategory === category.name ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.icon} {category.name} ({count})
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
                  <span className={styles.toolCategory}>{app.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mensaje si no hay resultados (no debería pasar) */}
        {filteredApps.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron herramientas en esta categoría.</p>
          </div>
        )}

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2>¿Buscas algo específico?</h2>
          <p>Usa nuestro buscador para encontrar la herramienta perfecta</p>
          <Link href="/" className={styles.ctaButton}>
            🔍 Buscar Herramientas
          </Link>
        </div>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
