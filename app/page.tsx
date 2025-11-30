'use client';

import { useState } from 'react';
import FixedHeader from '@/components/FixedHeader';
import WhyMeskeIA from '@/components/home/WhyMeskeIA';
import FAQ from '@/components/home/FAQ';
import HomeFooter from '@/components/home/HomeFooter';
import { categories, applicationsDatabase, moments, MomentType } from '@/data/applications';
import { isAppImplemented, TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

export default function Home() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<MomentType | null>(null);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const toggleMoment = (momentId: MomentType) => {
    setSelectedMoment(selectedMoment === momentId ? null : momentId);
  };

  // Filtrar solo apps implementadas
  const getAppsByCategory = (categoryName: string) => {
    return applicationsDatabase
      .filter(app => app.category === categoryName)
      .filter(app => isAppImplemented(app.url));
  };

  // Obtener apps por momento (solo implementadas)
  const getAppsByMoment = (momentId: MomentType) => {
    return applicationsDatabase
      .filter(app => app.contexts?.includes(momentId))
      .filter(app => isAppImplemented(app.url));
  };

  // Contar apps por momento (solo implementadas)
  const getMomentCount = (momentId: MomentType) => {
    return getAppsByMoment(momentId).length;
  };

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              Biblioteca de Aplicaciones Web Gratuitas
            </h1>
            <p className={styles.subtitle}>
              {TOTAL_IMPLEMENTED_APPS} herramientas online para facilitar tu día a día. Sin registro, sin anuncios.
            </p>
          </div>
        </header>

        {/* Sección Momentos */}
        <section className={styles.momentsSection}>
          <h2 className={styles.momentsSectionTitle}>¿Qué estás haciendo?</h2>

          <div className={styles.momentsGrid}>
            {moments.map((moment) => {
              const count = getMomentCount(moment.id);
              const isActive = selectedMoment === moment.id;

              return (
                <button
                  type="button"
                  key={moment.id}
                  className={`${styles.momentButton} ${isActive ? styles.active : ''}`}
                  onClick={() => toggleMoment(moment.id)}
                  title={moment.description}
                >
                  <span className={styles.momentIcon}>{moment.icon}</span>
                  <span className={styles.momentName}>{moment.name}</span>
                  <span className={styles.momentCount}>{count} apps</span>
                </button>
              );
            })}
          </div>

          {/* Panel expandido con apps del momento seleccionado */}
          {selectedMoment && (
            <div className={styles.momentAppsPanel}>
              <div className={styles.momentAppsHeader}>
                <h3 className={styles.momentAppsTitle}>
                  <span>{moments.find(m => m.id === selectedMoment)?.icon}</span>
                  <span>{moments.find(m => m.id === selectedMoment)?.name}</span>
                </h3>
                <button
                  type="button"
                  className={styles.momentCloseBtn}
                  onClick={() => setSelectedMoment(null)}
                  aria-label="Cerrar panel"
                >
                  ×
                </button>
              </div>
              <ul className={styles.momentAppsList}>
                {getAppsByMoment(selectedMoment).map((app, index) => (
                  <li key={index} className={styles.momentAppItem}>
                    <span className={styles.momentAppIcon}>{app.icon}</span>
                    <a href={app.url} title={app.description}>
                      {app.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Separador */}
        <div className={styles.sectionDivider}>
          o explora por categoría
        </div>

        {/* Categorías */}
        <section className={styles.categoriesGrid}>
          {categories.map((category) => {
            const apps = getAppsByCategory(category.name);
            const isOpen = openCategory === category.id;

            return (
              <div key={category.id} className={styles.categoryCard}>
                <div
                  className={styles.categoryHeader}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <div>
                    <h2 className={styles.categoryTitle}>{category.name}</h2>
                    <p className={styles.categoryDescription}>
                      {category.description}
                    </p>
                    <span className={styles.categoryCount}>
                      {apps.length} {apps.length === 1 ? 'herramienta' : 'herramientas'}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <ul className={styles.categoryTools}>
                    {apps.map((app, index) => (
                      <li key={index}>
                        <a
                          href={app.url}
                          onClick={(e) => e.stopPropagation()}
                          title={app.description}
                        >
                          {app.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>

      </main>

      <WhyMeskeIA />
      <FAQ />
      <HomeFooter />
    </>
  );
}
