'use client';

import { useState, useMemo } from 'react';
import styles from './VitaminasMinerales.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  NUTRIENTS,
  TIPOS,
  SUBTIPOS,
  TIPO_EMOJI,
  SUBTIPO_EMOJI,
  type NutrientType,
  type NutrientSubtype
} from '@/data/nutrients';

export default function VitaminasMineralesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NutrientType | 'Todos'>('Todos');
  const [selectedSubtype, setSelectedSubtype] = useState<NutrientSubtype | 'Todos'>('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar nutrientes
  const filteredNutrients = useMemo(() => {
    return NUTRIENTS.filter(nutrient => {
      const matchesSearch =
        nutrient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.nombreCientifico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.funcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutrient.fuentes.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'Todos' || nutrient.tipo === selectedType;
      const matchesSubtype = selectedSubtype === 'Todos' || nutrient.subtipo === selectedSubtype;

      return matchesSearch && matchesType && matchesSubtype;
    });
  }, [searchTerm, selectedType, selectedSubtype]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtrar subtipos según el tipo seleccionado
  const availableSubtypes = useMemo(() => {
    if (selectedType === 'Todos') return SUBTIPOS;
    if (selectedType === 'Vitamina') return ['Hidrosoluble', 'Liposoluble'] as NutrientSubtype[];
    return ['Macromineral', 'Oligoelemento'] as NutrientSubtype[];
  }, [selectedType]);

  // Reset subtipo si no es válido para el tipo seleccionado
  const handleTypeChange = (newType: NutrientType | 'Todos') => {
    setSelectedType(newType);
    if (newType !== 'Todos') {
      const validSubtypes = newType === 'Vitamina'
        ? ['Hidrosoluble', 'Liposoluble']
        : ['Macromineral', 'Oligoelemento'];
      if (selectedSubtype !== 'Todos' && !validSubtypes.includes(selectedSubtype)) {
        setSelectedSubtype('Todos');
      }
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🥗</span>
        <h1 className={styles.title}>Vitaminas y Minerales</h1>
        <p className={styles.subtitle}>
          Guía de 30 nutrientes esenciales: funciones, fuentes alimentarias,
          dosis recomendada y síntomas de deficiencia
        </p>
      </header>

      <LegalNotice />

      {/* Buscador y Filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, función o alimento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="filter-tipo" className={styles.filterLabel}>Tipo:</label>
            <select
              id="filter-tipo"
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as NutrientType | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {TIPOS.map(tipo => (
                <option key={tipo} value={tipo}>{TIPO_EMOJI[tipo]} {tipo}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filter-subtipo" className={styles.filterLabel}>Subtipo:</label>
            <select
              id="filter-subtipo"
              value={selectedSubtype}
              onChange={(e) => setSelectedSubtype(e.target.value as NutrientSubtype | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {availableSubtypes.map(subtipo => (
                <option key={subtipo} value={subtipo}>{SUBTIPO_EMOJI[subtipo]} {subtipo}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultsCount}>
          Mostrando {filteredNutrients.length} de {NUTRIENTS.length} nutrientes
        </div>
      </div>

      {/* Grid de Nutrientes */}
      <div className={styles.nutrientsGrid}>
        {filteredNutrients.map(nutrient => (
          <article
            key={nutrient.id}
            className={`${styles.nutrientCard} ${expandedId === nutrient.id ? styles.expanded : ''}`}
            onClick={() => toggleExpand(nutrient.id)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.typeEmoji}>{TIPO_EMOJI[nutrient.tipo]}</span>
                <div>
                  <h2 className={styles.nutrientName}>{nutrient.nombre}</h2>
                  <p className={styles.scientificName}>{nutrient.nombreCientifico}</p>
                </div>
              </div>
              <span className={styles.expandIcon}>
                {expandedId === nutrient.id ? '−' : '+'}
              </span>
            </div>

            <div className={styles.cardBasicInfo}>
              <span className={styles.badge} data-type={nutrient.tipo.toLowerCase()}>
                {nutrient.tipo}
              </span>
              <span className={styles.badge} data-subtype={nutrient.subtipo.toLowerCase().replace(' ', '')}>
                {SUBTIPO_EMOJI[nutrient.subtipo]} {nutrient.subtipo}
              </span>
              <span className={styles.cdrBadge}>
                CDR: {nutrient.cdrAdultos}
              </span>
            </div>

            <p className={styles.functionPreview}>
              {nutrient.funcion.length > 120
                ? nutrient.funcion.substring(0, 120) + '...'
                : nutrient.funcion}
            </p>

            {/* Contenido expandido */}
            {expandedId === nutrient.id && (
              <div className={styles.cardDetails}>
                <div className={styles.detailSection}>
                  <h3>⚡ Función</h3>
                  <p>{nutrient.funcion}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>🥦 Fuentes Alimentarias</h3>
                  <div className={styles.sourcesList}>
                    {nutrient.fuentes.map((fuente, index) => (
                      <span key={index} className={styles.sourceTag}>
                        {fuente}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>📊 Dosis Diaria Recomendada</h3>
                  <p className={styles.cdrValue}>{nutrient.cdrAdultos}</p>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailBox}>
                    <h3>⚠️ Deficiencia</h3>
                    <p>{nutrient.deficiencia}</p>
                  </div>
                  <div className={styles.detailBox}>
                    <h3>🚫 Exceso</h3>
                    <p>{nutrient.exceso}</p>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>👥 Grupos de Riesgo</h3>
                  <div className={styles.riskGroups}>
                    {nutrient.gruposRiesgo.map((grupo, index) => (
                      <span key={index} className={styles.riskTag}>
                        {grupo}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>💡 Curiosidad</h3>
                  <p className={styles.curiosity}>{nutrient.curiosidad}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredNutrients.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🔬</span>
          <p>No se encontraron nutrientes con esos criterios.</p>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearchTerm('');
              setSelectedType('Todos');
              setSelectedSubtype('Todos');
            }}
          >
            Mostrar todos
          </button>
        </div>
      )}

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres saber más sobre nutrición?"
        subtitle="Aprende sobre los tipos de nutrientes, cómo optimizar su absorción y las necesidades especiales"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Tipos de Vitaminas</h2>
          <p className={styles.introParagraph}>
            Las vitaminas se clasifican según cómo se disuelven y almacenan en el cuerpo.
            Esta distinción es importante para entender su absorción y posible toxicidad.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>💧 Hidrosolubles (B y C)</h4>
              <p>
                Se disuelven en agua y no se almacenan significativamente.
                El exceso se elimina por orina, por lo que la toxicidad es rara.
                Requieren ingesta regular ya que el cuerpo no las guarda.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🫒 Liposolubles (A, D, E, K)</h4>
              <p>
                Se disuelven en grasa y se almacenan en hígado y tejido adiposo.
                No necesitan ingesta diaria, pero el exceso puede acumularse
                y causar toxicidad. Se absorben mejor con grasas dietéticas.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Tipos de Minerales</h2>
          <p className={styles.introParagraph}>
            Los minerales se clasifican por la cantidad que necesita el cuerpo,
            no por su importancia (todos son esenciales).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🪨 Macrominerales</h4>
              <p>
                Se necesitan en cantidades de 100+ mg/día: calcio, fósforo,
                magnesio, sodio, potasio, cloro y azufre. Fundamentales
                para estructura ósea, equilibrio de fluidos y función nerviosa.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>✨ Oligoelementos (Traza)</h4>
              <p>
                Se necesitan en cantidades pequeñas (&lt;100 mg/día): hierro,
                zinc, cobre, yodo, selenio, etc. Igual de esenciales,
                actúan como cofactores enzimáticos y antioxidantes.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Optimizar la Absorción</h2>
          <p className={styles.introParagraph}>
            La forma en que combinamos alimentos afecta cuántos nutrientes aprovechamos.
          </p>

          <ul className={styles.tipsList}>
            <li><strong>Vitamina C + Hierro:</strong> La vitamina C mejora la absorción del hierro no hemo (vegetal). Añade limón a las lentejas.</li>
            <li><strong>Vitaminas liposolubles + Grasa:</strong> Come zanahorias (vit. A) con aceite de oliva para mejor absorción.</li>
            <li><strong>Calcio vs Hierro:</strong> Compiten por absorción. Separa lácteos de comidas ricas en hierro.</li>
            <li><strong>Café/Té + Hierro:</strong> Los taninos reducen la absorción de hierro. Espera 1-2 horas después de comer.</li>
            <li><strong>Vitamina D + Calcio:</strong> La D es necesaria para absorber calcio. Tomar el sol ayuda a ambos.</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>Grupos con Necesidades Especiales</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🤰 Embarazadas</h4>
              <p>
                Ácido fólico (previene defectos tubo neural), hierro,
                calcio, vitamina D y yodo. Suplementación recomendada.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🌱 Veganos</h4>
              <p>
                B12 (obligatoria), vitamina D, hierro, zinc, calcio,
                omega-3. La B12 solo está en alimentos animales.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>👴 Mayores de 65</h4>
              <p>
                B12 (menor absorción), vitamina D (menor síntesis),
                calcio, proteínas. Mayor riesgo de deficiencias.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🏃 Deportistas</h4>
              <p>
                Hierro (especialmente mujeres), magnesio, zinc,
                vitaminas del grupo B, antioxidantes (C, E).
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Necesito Suplementos?</h2>
          <p className={styles.introParagraph}>
            Una dieta variada suele cubrir las necesidades de la mayoría de personas.
            Los suplementos están indicados en casos específicos.
          </p>

          <ul className={styles.tipsList}>
            <li><strong>Vitamina D:</strong> Probablemente el suplemento más útil, especialmente en invierno y para quien no toma sol.</li>
            <li><strong>B12:</strong> Obligatoria para veganos. Recomendada para mayores de 50.</li>
            <li><strong>Ácido fólico:</strong> Todas las mujeres que planean embarazo deben tomarlo desde antes de concebir.</li>
            <li><strong>Hierro:</strong> Solo con diagnóstico de deficiencia. El exceso es perjudicial.</li>
            <li><strong>Multivitamínicos:</strong> No reemplazan una buena dieta y pueden dar falsa sensación de seguridad.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('vitaminas-minerales')} />
      <Footer appName="vitaminas-minerales" />
    </div>
  );
}
