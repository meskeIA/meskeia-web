'use client';

import { useState } from 'react';
import FixedHeader from '@/components/FixedHeader';
import WhyMeskeIA from '@/components/home/WhyMeskeIA';
import FAQ from '@/components/home/FAQ';
import HomeFooter from '@/components/home/HomeFooter';
import { categories, applicationsDatabase } from '@/data/applications';
import { isAppImplemented, TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';
import styles from './page.module.css';

export default function Home() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  // Filtrar solo apps implementadas
  const getAppsByCategory = (categoryName: string) => {
    return applicationsDatabase
      .filter(app => app.category === categoryName)
      .filter(app => isAppImplemented(app.url));
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
