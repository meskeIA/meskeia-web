'use client';

import { useState, useMemo } from 'react';
import styles from './PlazosLegales.module.css';
import { MeskeiaLogo, Footer, RelatedApps, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  PLAZOS_LEGALES,
  CATEGORIES,
  searchPlazos,
  getImportantPlazos,
  type PlazoCategory,
  type PlazoLegal,
} from './plazos-data';

export default function PlazosLegalesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlazoCategory | null>(null);
  const [expandedPlazo, setExpandedPlazo] = useState<string | null>(null);

  const filteredPlazos = useMemo(() => {
    return searchPlazos(searchQuery, selectedCategory || undefined);
  }, [searchQuery, selectedCategory]);

  const importantPlazos = useMemo(() => getImportantPlazos(), []);

  const handleCategoryClick = (categoryId: PlazoCategory) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const toggleExpand = (plazoId: string) => {
    setExpandedPlazo(expandedPlazo === plazoId ? null : plazoId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>⏱️</span>
        <h1 className={styles.title}>Plazos Legales España</h1>
        <p className={styles.subtitle}>
          Consulta los plazos de prescripción, caducidad y reclamación más importantes
        </p>
      </header>

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar plazo... (ej: garantía, despido, multa, herencia)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchQuery || selectedCategory) && (
            <button className={styles.clearButton} onClick={clearFilters}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className={styles.categoriesSection}>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryButton} ${selectedCategory === cat.id ? styles.categoryActive : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plazos destacados (solo si no hay búsqueda ni filtro) */}
      {!searchQuery && !selectedCategory && (
        <section className={styles.importantSection}>
          <h2 className={styles.sectionTitle}>
            <span>⭐</span> Plazos más consultados
          </h2>
          <div className={styles.importantGrid}>
            {importantPlazos.map((plazo) => (
              <div key={plazo.id} className={styles.importantCard}>
                <div className={styles.importantPlazo}>{plazo.plazo}</div>
                <div className={styles.importantTitle}>{plazo.title}</div>
                <button
                  className={styles.importantLink}
                  onClick={() => {
                    setExpandedPlazo(plazo.id);
                    document.getElementById(plazo.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Ver detalles →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resultados */}
      <section className={styles.resultsSection}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.sectionTitle}>
            {selectedCategory
              ? `📋 ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`
              : searchQuery
                ? `🔍 Resultados para "${searchQuery}"`
                : '📚 Todos los plazos'}
          </h2>
          <span className={styles.resultsCount}>
            {filteredPlazos.length} {filteredPlazos.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {filteredPlazos.length === 0 ? (
          <div className={styles.noResults}>
            <span className={styles.noResultsIcon}>🔍</span>
            <p>No se encontraron plazos con esos criterios</p>
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={styles.plazosList}>
            {filteredPlazos.map((plazo) => (
              <PlazoCard
                key={plazo.id}
                plazo={plazo}
                isExpanded={expandedPlazo === plazo.id}
                onToggle={() => toggleExpand(plazo.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta información tiene carácter <strong>orientativo y educativo</strong>.
          Los plazos legales pueden verse afectados por circunstancias específicas, modificaciones
          legislativas o interpretaciones judiciales. <strong>No constituye asesoramiento jurídico</strong>.
        </p>
        <p>
          Para casos concretos, consulta siempre con un profesional del derecho o las fuentes
          oficiales (BOE, organismos competentes). Los plazos pueden variar según la comunidad
          autónoma o la situación particular.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor los plazos legales?"
        subtitle="Conceptos clave: prescripción, caducidad y cómputo de plazos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Diferencia entre prescripción y caducidad</h2>

          <div className={styles.conceptsGrid}>
            <div className={styles.conceptCard}>
              <h4>⏳ Prescripción</h4>
              <p>
                Es la pérdida de un derecho por no ejercerlo durante el tiempo establecido por ley.
                Se puede <strong>interrumpir</strong> (el plazo vuelve a empezar) mediante reclamación
                judicial, extrajudicial o reconocimiento de la deuda.
              </p>
              <p className={styles.conceptExample}>
                Ejemplo: Una deuda prescribe a los 5 años, pero si el acreedor te envía un burofax,
                el plazo se interrumpe y vuelven a contar 5 años desde ese momento.
              </p>
            </div>

            <div className={styles.conceptCard}>
              <h4>📅 Caducidad</h4>
              <p>
                Es un plazo fijo e improrrogable para ejercer un derecho o interponer una acción.
                <strong>No se puede interrumpir</strong>: una vez pasado el plazo, el derecho se extingue definitivamente.
              </p>
              <p className={styles.conceptExample}>
                Ejemplo: El plazo de 20 días hábiles para impugnar un despido es de caducidad.
                Si no demandas en ese plazo, pierdes el derecho a reclamar.
              </p>
            </div>
          </div>

          <h2>Cómo se cuentan los plazos</h2>

          <div className={styles.countingRules}>
            <div className={styles.ruleCard}>
              <h4>📆 Días naturales vs hábiles</h4>
              <ul>
                <li><strong>Naturales</strong>: todos los días del calendario (incluye festivos)</li>
                <li><strong>Hábiles</strong>: excluyen sábados, domingos y festivos</li>
                <li>En caso de duda, los plazos civiles suelen ser naturales y los procesales, hábiles</li>
              </ul>
            </div>

            <div className={styles.ruleCard}>
              <h4>🗓️ Reglas de cómputo</h4>
              <ul>
                <li>El día inicial (dies a quo) generalmente <strong>no se cuenta</strong></li>
                <li>Si el último día es inhábil, se prorroga al siguiente hábil</li>
                <li>El mes de agosto es hábil en la mayoría de procedimientos</li>
                <li>Los plazos por meses se cuentan de fecha a fecha</li>
              </ul>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Qué pasa si dejo prescribir una deuda?</summary>
              <p>
                Si la deuda prescribe, el acreedor pierde el derecho a reclamarla judicialmente.
                Sin embargo, debes <strong>alegar la prescripción</strong> si te demandan; el juez no la
                aplica de oficio. Además, la deuda puede seguir apareciendo en ficheros de morosos
                hasta que pases del plazo de conservación (5 años desde vencimiento).
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuándo empieza a contar un plazo?</summary>
              <p>
                Depende del tipo de plazo. Generalmente, desde el día siguiente al hecho que lo origina:
                notificación, entrega del producto, fin del contrato, fecha del fallecimiento, etc.
                En responsabilidad civil, desde que se conoce el daño (no necesariamente cuando se produce).
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Una reclamación por email interrumpe la prescripción?</summary>
              <p>
                La jurisprudencia es variable. Un email simple puede no ser suficiente.
                Para mayor seguridad, usa <strong>burofax con certificación de contenido</strong> o
                <strong>reclamación judicial</strong>. Un requerimiento notarial también interrumpe.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Los plazos se suspenden en vacaciones?</summary>
              <p>
                En procedimientos judiciales, el mes de <strong>agosto es inhábil</strong> para actuaciones
                procesales (salvo urgentes). En plazos administrativos, agosto sí cuenta.
                Los plazos de prescripción de acciones civiles no se suspenden por vacaciones.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('plazos-legales')} />
      <Footer appName="plazos-legales" />
    </div>
  );
}

// Componente para cada plazo
function PlazoCard({
  plazo,
  isExpanded,
  onToggle,
}: {
  plazo: PlazoLegal;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const category = CATEGORIES.find(c => c.id === plazo.category);

  return (
    <div id={plazo.id} className={`${styles.plazoCard} ${isExpanded ? styles.plazoExpanded : ''}`}>
      <button className={styles.plazoHeader} onClick={onToggle}>
        <div className={styles.plazoMain}>
          <span className={styles.plazoCategoryIcon}>{category?.icon}</span>
          <div className={styles.plazoInfo}>
            <h3 className={styles.plazoTitle}>
              {plazo.title}
              {plazo.important && <span className={styles.importantBadge}>Importante</span>}
            </h3>
            <p className={styles.plazoDescription}>{plazo.description}</p>
          </div>
        </div>
        <div className={styles.plazoPlazoContainer}>
          <span className={styles.plazoPlazo}>{plazo.plazo}</span>
          <span className={styles.plazoExpandIcon}>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.plazoDetails}>
          <div className={styles.detailsContent}>
            <p className={styles.detailsText}>{plazo.details}</p>
            <div className={styles.detailsMeta}>
              <span className={styles.detailsCategory}>
                {category?.icon} {category?.name}
              </span>
              <span className={styles.detailsLaw}>
                📜 {plazo.legalReference}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
