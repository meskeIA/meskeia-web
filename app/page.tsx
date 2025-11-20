'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { categories, applicationsDatabase } from '@/data/applications';
import styles from './page.module.css';

export default function Home() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const getAppsByCategory = (categoryName: string) => {
    return applicationsDatabase.filter(app => app.category === categoryName);
  };

  return (
    <>
      <MeskeiaLogo />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              Biblioteca de Aplicaciones Web Gratuitas
            </h1>
            <p className={styles.subtitle}>
              84 herramientas online para facilitar tu día a día. Sin registro, sin anuncios.
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

        {/* Ventajas */}
        <section className={styles.advantagesSection}>
          <h2 className={styles.advantagesTitle}>¿Por qué usar meskeIA?</h2>
          <div className={styles.advantagesGrid}>
            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>🆓</div>
              <h3>100% Gratuito</h3>
              <p>Todas las aplicaciones son completamente gratuitas, sin costos ocultos ni suscripciones</p>
            </div>

            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>🔒</div>
              <h3>Privacidad Total</h3>
              <p>Sin registro requerido. Tus datos se procesan localmente en tu navegador</p>
            </div>

            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>📱</div>
              <h3>Responsive</h3>
              <p>Funciona perfectamente en móvil, tablet y escritorio con diseño adaptativo</p>
            </div>

            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>⚡</div>
              <h3>Rápido y Ligero</h3>
              <p>Aplicaciones optimizadas que cargan en menos de 2 segundos</p>
            </div>

            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>🇪🇸</div>
              <h3>En Español</h3>
              <p>Todas las aplicaciones están en español con ejemplos localizados para España</p>
            </div>

            <div className={styles.advantageCard}>
              <div className={styles.advantageIcon}>📚</div>
              <h3>Educativo</h3>
              <p>Cada herramienta incluye explicaciones y guías para aprender mientras usas</p>
            </div>
          </div>
        </section>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
