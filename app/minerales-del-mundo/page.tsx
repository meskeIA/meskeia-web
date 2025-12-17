'use client';

import { useState, useMemo } from 'react';
import styles from './MineralesDelMundo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  MINERALS,
  CATEGORIAS,
  CATEGORIA_EMOJI,
  searchMinerals,
  type Mineral,
  type MineralCategoria,
} from '@/data/minerals';

export default function MineralesDelMundoPage() {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<MineralCategoria | 'todas'>('todas');
  const [mineralSeleccionado, setMineralSeleccionado] = useState<Mineral | null>(null);

  // Filtrar minerales
  const mineralesFiltrados = useMemo(() => {
    let resultado = MINERALS;

    // Filtrar por categoría
    if (categoriaFiltro !== 'todas') {
      resultado = resultado.filter(m => m.categoria === categoriaFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      resultado = searchMinerals(busqueda).filter(m =>
        categoriaFiltro === 'todas' || m.categoria === categoriaFiltro
      );
    }

    return resultado;
  }, [busqueda, categoriaFiltro]);

  // Contar minerales por categoría
  const conteosPorCategoria = useMemo(() => {
    const conteos: Record<string, number> = { todas: MINERALS.length };
    CATEGORIAS.forEach(cat => {
      conteos[cat] = MINERALS.filter(m => m.categoria === cat).length;
    });
    return conteos;
  }, []);

  const handleMineralClick = (mineral: Mineral) => {
    setMineralSeleccionado(mineralSeleccionado?.id === mineral.id ? null : mineral);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>💎</span>
        <h1 className={styles.title}>Minerales del Mundo</h1>
        <p className={styles.subtitle}>
          Explora 50 minerales esenciales: composición, dureza, usos y curiosidades
        </p>
      </header>

      {/* Buscador y filtros */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, fórmula, uso o color..."
            className={styles.searchInput}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className={styles.clearButton}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.categoriesWrapper}>
          <button
            className={`${styles.categoryButton} ${categoriaFiltro === 'todas' ? styles.active : ''}`}
            onClick={() => setCategoriaFiltro('todas')}
          >
            <span>📊</span>
            <span>Todas</span>
            <span className={styles.categoryCount}>{conteosPorCategoria.todas}</span>
          </button>
          {CATEGORIAS.map(categoria => (
            <button
              key={categoria}
              className={`${styles.categoryButton} ${categoriaFiltro === categoria ? styles.active : ''}`}
              onClick={() => setCategoriaFiltro(categoria)}
            >
              <span>{CATEGORIA_EMOJI[categoria]}</span>
              <span>{categoria}</span>
              <span className={styles.categoryCount}>{conteosPorCategoria[categoria]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className={styles.resultsCount}>
        {mineralesFiltrados.length === MINERALS.length
          ? `Mostrando los ${MINERALS.length} minerales`
          : `${mineralesFiltrados.length} mineral${mineralesFiltrados.length !== 1 ? 'es' : ''} encontrado${mineralesFiltrados.length !== 1 ? 's' : ''}`
        }
      </div>

      {/* Grid de minerales */}
      <div className={styles.mineralsGrid}>
        {mineralesFiltrados.map(mineral => (
          <article
            key={mineral.id}
            className={`${styles.mineralCard} ${mineralSeleccionado?.id === mineral.id ? styles.expanded : ''}`}
            onClick={() => handleMineralClick(mineral)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.categoryEmoji}>{CATEGORIA_EMOJI[mineral.categoria]}</span>
                <div>
                  <h3 className={styles.mineralName}>{mineral.nombre}</h3>
                  <span className={styles.formula}>{mineral.formulaQuimica}</span>
                </div>
              </div>
              <div className={styles.hardnessBadge}>
                <span className={styles.hardnessValue}>{mineral.durezaMohs}</span>
                <span className={styles.hardnessLabel}>Mohs</span>
              </div>
            </div>

            <div className={styles.cardPreview}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Sistema:</span>
                <span className={styles.previewValue}>{mineral.sistemaCristalino}</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>Brillo:</span>
                <span className={styles.previewValue}>{mineral.brillo}</span>
              </div>
            </div>

            <div className={styles.colorsRow}>
              {mineral.colores.slice(0, 3).map((color, idx) => (
                <span key={idx} className={styles.colorTag}>{color}</span>
              ))}
              {mineral.colores.length > 3 && (
                <span className={styles.colorTag}>+{mineral.colores.length - 3}</span>
              )}
            </div>

            {/* Contenido expandido */}
            {mineralSeleccionado?.id === mineral.id && (
              <div className={styles.expandedContent}>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>📋 Propiedades</h4>
                  <div className={styles.propertiesGrid}>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Categoría</span>
                      <span className={styles.propertyValue}>{mineral.categoria}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Sistema cristalino</span>
                      <span className={styles.propertyValue}>{mineral.sistemaCristalino}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Dureza Mohs</span>
                      <span className={styles.propertyValue}>{mineral.durezaMohs}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Brillo</span>
                      <span className={styles.propertyValue}>{mineral.brillo}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Densidad</span>
                      <span className={styles.propertyValue}>{mineral.densidad} g/cm³</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Fórmula</span>
                      <span className={styles.propertyValue}>{mineral.formulaQuimica}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🎨 Colores</h4>
                  <div className={styles.allColors}>
                    {mineral.colores.map((color, idx) => (
                      <span key={idx} className={styles.colorTagLarge}>{color}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🏭 Usos principales</h4>
                  <ul className={styles.usesList}>
                    {mineral.usos.map((uso, idx) => (
                      <li key={idx}>{uso}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.curiositySection}>
                  <h4 className={styles.detailTitle}>💡 Curiosidad</h4>
                  <p className={styles.curiosityText}>{mineral.curiosidad}</p>
                </div>
              </div>
            )}

            <div className={styles.expandHint}>
              {mineralSeleccionado?.id === mineral.id ? 'Clic para cerrar' : 'Clic para ver más'}
            </div>
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {mineralesFiltrados.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🔍</span>
          <p>No se encontraron minerales con esos criterios</p>
          <button
            onClick={() => { setBusqueda(''); setCategoriaFiltro('todas'); }}
            className={styles.resetButton}
          >
            Mostrar todos los minerales
          </button>
        </div>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre mineralogía?"
        subtitle="Descubre conceptos clave sobre minerales, cristales y geología"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>🔬 Escala de Dureza de Mohs</h2>
          <p className={styles.introParagraph}>
            La escala de Mohs mide la resistencia de un mineral a ser rayado. Fue creada en 1812 por el geólogo alemán Friedrich Mohs. Es una escala relativa: cada mineral raya al anterior y es rayado por el siguiente.
          </p>
          <div className={styles.mohsScale}>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>1</span><span>Talco</span><span className={styles.mohsRef}>Se raya con la uña</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>2</span><span>Yeso</span><span className={styles.mohsRef}>Se raya con la uña</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>3</span><span>Calcita</span><span className={styles.mohsRef}>Se raya con moneda de cobre</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>4</span><span>Fluorita</span><span className={styles.mohsRef}>Se raya con cuchillo (difícil)</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>5</span><span>Apatito</span><span className={styles.mohsRef}>Se raya con cuchillo</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>6</span><span>Ortosa</span><span className={styles.mohsRef}>Raya el vidrio</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>7</span><span>Cuarzo</span><span className={styles.mohsRef}>Raya el acero</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>8</span><span>Topacio</span><span className={styles.mohsRef}>Muy duro</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>9</span><span>Corindón</span><span className={styles.mohsRef}>Muy duro (rubí, zafiro)</span></div>
            <div className={styles.mohsItem}><span className={styles.mohsNumber}>10</span><span>Diamante</span><span className={styles.mohsRef}>El más duro</span></div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🔷 Sistemas Cristalinos</h2>
          <p className={styles.introParagraph}>
            Los minerales se clasifican en 7 sistemas cristalinos según la geometría de su estructura atómica. Cada sistema tiene características distintivas.
          </p>
          <div className={styles.crystalSystems}>
            <div className={styles.crystalCard}>
              <h4>Cúbico</h4>
              <p>Tres ejes iguales perpendiculares. Ejemplos: diamante, pirita, halita, fluorita, granate.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Hexagonal</h4>
              <p>Cuatro ejes, tres iguales a 120°. Ejemplos: berilo (esmeralda), grafito, apatito.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Trigonal</h4>
              <p>Similar al hexagonal pero con simetría ternaria. Ejemplos: cuarzo, calcita, corindón.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Tetragonal</h4>
              <p>Tres ejes perpendiculares, dos iguales. Ejemplos: circón, rutilo, casiterita.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Ortorrómbico</h4>
              <p>Tres ejes perpendiculares desiguales. Ejemplos: olivino, topacio, azufre, barita.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Monoclínico</h4>
              <p>Tres ejes desiguales, uno inclinado. Ejemplos: yeso, moscovita, ortosa, augita.</p>
            </div>
            <div className={styles.crystalCard}>
              <h4>Triclínico</h4>
              <p>Tres ejes desiguales, todos inclinados. Ejemplos: plagioclasa, turquesa, caolinita.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>📊 Categorías de Minerales</h2>
          <p className={styles.introParagraph}>
            Los minerales se clasifican por su composición química en grupos principales:
          </p>
          <div className={styles.categoryExplanations}>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>✨</span>
              <div>
                <h4>Elementos nativos</h4>
                <p>Minerales de un solo elemento químico: oro, plata, cobre, diamante, azufre.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>⚫</span>
              <div>
                <h4>Sulfuros</h4>
                <p>Combinaciones con azufre. Menas metálicas importantes: pirita, galena, calcopirita.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>🔴</span>
              <div>
                <h4>Óxidos</h4>
                <p>Combinaciones con oxígeno. Incluyen menas de hierro y gemas: hematites, corindón.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>🧂</span>
              <div>
                <h4>Haluros</h4>
                <p>Sales con halógenos (Cl, F). Importantes industrialmente: halita, fluorita.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>⚪</span>
              <div>
                <h4>Carbonatos</h4>
                <p>Contienen grupo CO₃. Forman rocas sedimentarias: calcita, dolomita, malaquita.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>💎</span>
              <div>
                <h4>Sulfatos</h4>
                <p>Contienen grupo SO₄. Útiles en construcción e industria: yeso, barita.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>💚</span>
              <div>
                <h4>Fosfatos</h4>
                <p>Contienen grupo PO₄. Importantes para fertilizantes y gemas: apatito, turquesa.</p>
              </div>
            </div>
            <div className={styles.categoryExplain}>
              <span className={styles.catEmoji}>🔷</span>
              <div>
                <h4>Silicatos</h4>
                <p>El grupo más abundante (90% de la corteza). Base de rocas: cuarzo, feldespatos, micas.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>💡 Datos curiosos</h2>
          <div className={styles.funFacts}>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🌍</span>
              <p>Los feldespatos son el grupo de minerales más abundante de la Tierra, formando aproximadamente el 60% de la corteza terrestre.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>💰</span>
              <p>El rubí y el zafiro son exactamente el mismo mineral (corindón). Solo se diferencian por las impurezas que les dan color.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🔬</span>
              <p>El diamante y el grafito tienen la misma composición (carbono puro), pero el diamante es el material más duro y el grafito uno de los más blandos.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🚀</span>
              <p>El color rojo de Marte se debe a la hematites (óxido de hierro) en su superficie. Por eso se le llama "el planeta rojo".</p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('minerales-del-mundo')} />
      <Footer appName="minerales-del-mundo" />
    </div>
  );
}
