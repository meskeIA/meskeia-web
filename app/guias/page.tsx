'use client';

import { useState } from 'react';
import Link from 'next/link';
import FixedHeader from '@/components/FixedHeader';
import Footer from '@/components/Footer';
import { categories } from '@/data/applications';
import { guidesByCategory, getTotalGuidesCount } from '@/data/guides';
import styles from './page.module.css';

// Metadata se maneja en el archivo layout.tsx de esta carpeta

export default function GuiasPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const totalGuides = getTotalGuidesCount();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  return (
    <>
      <FixedHeader />

      <main className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerIcon}>📚</div>
          <h1 className={styles.pageTitle}>Guías Educativas</h1>
          <p className={styles.pageSubtitle}>
            {totalGuides} tutoriales completos y guías paso a paso para aprovechar al máximo nuestras herramientas
          </p>
        </header>

        {/* Descripción */}
        <div className={styles.intro}>
          <p>
            Cada guía incluye <strong>tutoriales detallados</strong>, <strong>ejemplos prácticos</strong>,
            <strong> mejores prácticas</strong> y <strong>casos de uso reales</strong> para que puedas dominar
            todas las funcionalidades de nuestras aplicaciones.
          </p>
        </div>

        {/* Categorías de guías con acordeones */}
        <div className={styles.categoriesContainer}>
          {categories.map((category) => {
            const guides = guidesByCategory[category.name] || [];
            const isExpanded = expandedCategory === category.name;
            const hasGuides = guides.length > 0;

            return (
              <div key={category.id} className={styles.categorySection}>
                <button
                  type="button"
                  className={`${styles.categoryHeader} ${isExpanded ? styles.expanded : ''}`}
                  onClick={() => hasGuides && toggleCategory(category.name)}
                  disabled={!hasGuides}
                >
                  <div className={styles.categoryHeaderLeft}>
                    <span className={styles.categoryIcon}>{category.icon}</span>
                    <div>
                      <h3 className={styles.categoryTitle}>{category.name}</h3>
                      <p className={styles.categoryCount}>
                        {guides.length} {guides.length === 1 ? 'guía' : 'guías'}
                      </p>
                    </div>
                  </div>
                  {hasGuides && (
                    <span className={styles.expandIcon}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  )}
                </button>

                {isExpanded && hasGuides && (
                  <div className={styles.guideslist}>
                    {guides.map((guide) => (
                      <Link
                        key={guide.slug}
                        href={guide.url}
                        className={styles.guideLink}
                      >
                        <span className={styles.guideLinkIcon}>📄</span>
                        <span className={styles.guideLinkText}>{guide.title}</span>
                        <span className={styles.guideLinkArrow}>→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>✨</div>
            <h3>¿Qué encontrarás en las guías?</h3>
            <ul>
              <li>📝 Tutoriales paso a paso detallados</li>
              <li>💡 Casos de uso prácticos y ejemplos reales</li>
              <li>⚡ Consejos y trucos para optimizar tu trabajo</li>
              <li>❓ FAQ resolviendo dudas frecuentes</li>
              <li>🎯 Mejores prácticas recomendadas</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🎓</div>
            <h3>Para todos los niveles</h3>
            <p>
              Nuestras guías están diseñadas tanto para <strong>principiantes</strong> que están
              empezando como para <strong>usuarios avanzados</strong> que quieren dominar todas
              las funcionalidades.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2>¿Quieres explorar las herramientas primero?</h2>
          <p>Descubre todas las aplicaciones disponibles en nuestro catálogo</p>
          <Link href="/herramientas" className={styles.ctaButton}>
            📦 Ver Catálogo Completo
          </Link>
        </div>
      </main>

      <Footer appName="meskeIA" />
    </>
  );
}
