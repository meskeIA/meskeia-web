'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './MineralesDelMundo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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
              type="button"
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
            type="button"
            aria-pressed={categoriaFiltro === 'todas'}
            className={`${styles.categoryButton} ${categoriaFiltro === 'todas' ? styles.active : ''}`}
            onClick={() => setCategoriaFiltro('todas')}
          >
            <span aria-hidden="true">📊</span>
            <span>Todas</span>
            <span className={styles.categoryCount}>{conteosPorCategoria.todas}</span>
          </button>
          {CATEGORIAS.map(categoria => (
            <button
              type="button"
              key={categoria}
              aria-pressed={categoriaFiltro === categoria}
              className={`${styles.categoryButton} ${categoriaFiltro === categoria ? styles.active : ''}`}
              onClick={() => setCategoriaFiltro(categoria)}
            >
              <span aria-hidden="true">{CATEGORIA_EMOJI[categoria]}</span>
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
            type="button"
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

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>📊 Tabla Comparativa por Grupo Mineralógico</h2>
          <p className={styles.introParagraph}>
            Los minerales se organizan en grupos según su composición química. Esta tabla resume las características principales de cada grupo con ejemplos representativos.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Minerales representativos</th>
                  <th>Dureza Mohs típica</th>
                  <th>Brillo</th>
                  <th>Usos principales</th>
                  <th>Abundancia en corteza</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Silicatos</strong></td>
                  <td>Cuarzo, feldespatos, micas, olivino, piroxenos</td>
                  <td>5 – 7,5</td>
                  <td>Vítreo, nacarado, sedoso</td>
                  <td>Cerámica, vidrio, electrónica, construcción</td>
                  <td>~90 % (el más abundante)</td>
                </tr>
                <tr>
                  <td><strong>Carbonatos</strong></td>
                  <td>Calcita, dolomita, aragonito, malaquita, azurita</td>
                  <td>3 – 4</td>
                  <td>Vítreo, adamantino</td>
                  <td>Cal, cemento, mármol, pigmentos</td>
                  <td>~4 %</td>
                </tr>
                <tr>
                  <td><strong>Óxidos</strong></td>
                  <td>Cuarzo (SiO₂), hematites, magnetita, corindón, rutilo</td>
                  <td>5,5 – 9</td>
                  <td>Metálico, adamantino, vítreo</td>
                  <td>Menas de hierro, abrasivos, gemas (rubí, zafiro)</td>
                  <td>~4 %</td>
                </tr>
                <tr>
                  <td><strong>Sulfuros</strong></td>
                  <td>Pirita, galena, calcopirita, esfalerita, cinabrio</td>
                  <td>1,5 – 6,5</td>
                  <td>Metálico, resinoso</td>
                  <td>Menas de Cu, Pb, Zn, Fe; ácido sulfúrico</td>
                  <td>~0,5 %</td>
                </tr>
                <tr>
                  <td><strong>Sulfatos</strong></td>
                  <td>Yeso, anhidrita, barita, celestina</td>
                  <td>1,5 – 3,5</td>
                  <td>Nacarado, vítreo, sedoso</td>
                  <td>Escayola, cemento, industria química</td>
                  <td>~0,3 %</td>
                </tr>
                <tr>
                  <td><strong>Haluros</strong></td>
                  <td>Halita (sal), fluorita, silvina, carnalita</td>
                  <td>2 – 4</td>
                  <td>Vítreo</td>
                  <td>Alimentación, fundentes, óptica, fertilizantes</td>
                  <td>~0,4 %</td>
                </tr>
                <tr>
                  <td><strong>Fosfatos</strong></td>
                  <td>Apatito, turquesa, vivianita, monacita</td>
                  <td>3,5 – 5</td>
                  <td>Resinoso, ceroso, vítreo</td>
                  <td>Fertilizantes, gemas, materiales nucleares</td>
                  <td>~0,2 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>🎯 ¿A quién le resulta útil esta herramienta?</h2>
          <p className={styles.introParagraph}>
            El catálogo de minerales de meskeIA sirve a perfiles muy distintos. Aquí te mostramos cómo sacarle el máximo partido según tus necesidades.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Estudiante de ESO / Bachillerato</h4>
              </div>
              <p className={styles.escenarioExample}>
                Preparas el examen de Ciencias Naturales y necesitas repasar la clasificación de minerales, la escala de Mohs y los sistemas cristalinos.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Tip:</strong> usa el filtro por categoría para estudiar grupo a grupo. La tabla comparativa te da un resumen perfecto para repasar la noche antes del examen.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🪨</span>
                <h4>Geólogo amateur</h4>
              </div>
              <p className={styles.escenarioExample}>
                Encuentras una muestra en el campo y quieres identificarla. Conoces el color aproximado y puedes probar la dureza con objetos cotidianos.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Tip:</strong> filtra por dureza y brillo. Consulta la guía paso a paso para seguir un protocolo de identificación sistemático antes de descartar opciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💍</span>
                <h4>Joyero con piedras preciosas</h4>
              </div>
              <p className={styles.escenarioExample}>
                Trabajas con rubíes, esmeraldas, topacios y cuarzos. Necesitas conocer su dureza para saber cómo montar, pulir y combinar piezas sin dañarlas.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Tip:</strong> el campo "dureza Mohs" en cada ficha es clave. Recuerda que un mineral más duro raya a uno más blando, lo que afecta el montaje y limpieza de joyas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚙️</span>
                <h4>Ingeniero de materiales</h4>
              </div>
              <p className={styles.escenarioExample}>
                Te interesa la densidad, el sistema cristalino y las propiedades físicas para seleccionar materiales en aplicaciones industriales o investigación.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Tip:</strong> la sección expandida de cada mineral incluye densidad (g/cm³), sistema cristalino y fórmula química. Usa la búsqueda por fórmula para localizar rápidamente el compuesto que necesitas.
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas frecuentes sobre mineralogía</h2>
          <ol className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre un mineral y una roca?</strong>
              <p>Un mineral es una sustancia inorgánica natural con composición química definida y estructura cristalina ordenada (p. ej., cuarzo, calcita). Una roca es un agregado sólido de uno o más minerales (p. ej., el granito contiene cuarzo, feldespato y mica). Dicho de otro modo: los minerales son los "ladrillos" y las rocas son la "pared".</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo funciona la escala de dureza de Mohs?</strong>
              <p>Es una escala relativa del 1 al 10 creada en 1812 por Friedrich Mohs. Cada mineral raya a todos los que tienen un número menor. Se mide intentando rayar la muestra con objetos de referencia: uña (~2,5), moneda de cobre (~3,5), cuchillo de acero (~5,5), lima de acero (~6,5), vidrio (~5,5). No es lineal: el salto entre diamante (10) y corindón (9) es enorme en dureza absoluta.</p>
              <p className={styles.faqTip}>Ejemplo práctico: si la uña raya el mineral pero la moneda no, la dureza está entre 2,5 y 3,5 → probablemente calcita o yeso.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es el mineral más duro y el más blando?</strong>
              <p>El más duro es el <strong>diamante</strong> (10 en la escala de Mohs), formado por carbono puro en estructura cúbica. El más blando es el <strong>talco</strong> (1), tan blando que se raya con la uña con la mínima presión. Curiosamente, ambos son minería industrial: el diamante para corte y abrasión; el talco para cosméticos, papel y cerámica.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué minerales son considerados piedras preciosas?</strong>
              <p>Tradicionalmente se distinguen las cuatro gemas clásicas: <strong>diamante</strong> (corindón negro o incoloro), <strong>rubí</strong> (corindón rojo por cromo), <strong>esmeralda</strong> (berilo verde por cromo/vanadio) y <strong>zafiro</strong> (corindón azul por titanio/hierro). Las semipreciosas incluyen amatista, topacio, turmalina, aguamarina, granate, turquesa, ópalo y lapislázuli, entre otras.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo identificar un mineral en casa?</strong>
              <p>Puedes usar cuatro pruebas básicas sin equipamiento especializado: (1) <strong>Raya</strong>: frota el mineral contra porcelana sin vidriar y observa el color del polvo. (2) <strong>Dureza</strong>: prueba con uña, moneda y cuchillo. (3) <strong>Brillo</strong>: ¿refleja como metal (metálico) o como vidrio (vítreo)? (4) <strong>Exfoliación</strong>: al romperse, ¿muestra caras planas regulares (exfoliación) o superficies irregulares (fractura concoidal)?</p>
              <p className={styles.faqTip}>Con solo estos cuatro datos puedes descartar la mayoría de minerales y acotar la identificación a 2-3 candidatos.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuáles son los minerales más abundantes en la corteza terrestre?</strong>
              <p>Los silicatos dominan con ~90 % de la corteza. Dentro de ellos, los <strong>feldespatos</strong> (ortosa, plagioclasa) son los más comunes (~60 % de la corteza), seguidos del <strong>cuarzo</strong> (~12 %), las <strong>micas</strong> y los <strong>piroxenos/anfíboles</strong>. Fuera de los silicatos, la <strong>calcita</strong> y la <strong>dolomita</strong> forman la mayor parte de las rocas sedimentarias carbonatadas.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre mineral y cristal?</strong>
              <p>Todo mineral tiene estructura cristalina interna (sus átomos se ordenan en una red tridimensional periódica), pero no todos muestran formas cristalinas visibles. Un <strong>cristal</strong> es un mineral que ha crecido en condiciones de espacio libre y exhibe caras planas y aristas con la geometría de su sistema cristalino. Es decir: todos los cristales son minerales, pero un mineral puede no haber formado cristales macroscópicos visibles (p. ej., el vidrio volcánico, obsidiana, no es mineral porque carece de orden interno).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué minerales se usan en la electrónica moderna?</strong>
              <p>La electrónica depende de una lista de minerales críticos: <strong>cuarzo</strong> (SiO₂) como base de semiconductores de silicio; <strong>coltan</strong> (colombita-tantalita) para condensadores de smartphones; <strong>litio</strong> (espodumena, petalita) para baterías de ion-litio; <strong>cobalto</strong> (cobaltita) para baterías recargables; <strong>indio</strong> (esfalerita) para pantallas ITO; <strong>neodimio</strong> (monacita) para imanes permanentes de motores eléctricos; y <strong>cobre</strong> (calcosina, calcopirita) para todo cableado.</p>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>🔎 Cómo identificar un mineral desconocido: guía paso a paso</h2>
          <p className={styles.introParagraph}>
            Sigue este protocolo sistemático cuando tengas una muestra sin identificar. Cada propiedad descarta grupos enteros de minerales y te acerca a la respuesta.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Observa el color en superficie fresca</strong>
                <p>Rompe o raspa ligeramente la muestra para ver el color real, sin oxidación ni suciedad. Anota todos los colores presentes. Recuerda que el color solo es diagnóstico en pocos minerales (malaquita siempre verde, azurita siempre azul); en la mayoría puede variar por impurezas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Determina el brillo</strong>
                <p>¿Brilla como un metal (metálico)? → Sulfuros, óxidos metálicos. ¿Como vidrio (vítreo)? → Silicatos, carbonatos, sulfatos. ¿Suave y ceroso? → Talco, serpentina. ¿Nacarado? → Micas, yeso. ¿Resinoso o adamantino? → Diamante, sulfuro de zinc.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Mide la dureza con objetos de referencia</strong>
                <p>Prueba de menor a mayor: uña (2,5) → moneda de cobre (3,5) → vidrio (5,5) → hoja de cuchillo (5,5–6) → lima de acero (6,5). El primer objeto que <em>no</em> raya el mineral te da el límite inferior de dureza. Trabaja siempre en superficie fresca y limpia la raya con el dedo para confirmar que sí hay marca.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Haz la prueba de la raya</strong>
                <p>Frota el mineral contra una baldosa de porcelana sin vidriar (plato de cerámica sin esmaltar en su reverso). El color del polvo (raya) suele ser más constante que el color aparente del mineral: la pirita da raya negra-verdosa (no dorada), la hematites da raya rojo-parda aunque parezca metálica.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Examina la exfoliación y la fractura</strong>
                <p>Rompe un fragmento pequeño. Si se parten en caras planas y paralelas → tiene exfoliación (calcita en tres direcciones perfectas; feldespatos en dos; mica en una hoja). Si la superficie de rotura es irregular y curva → fractura concoidal (cuarzo, obsidiana). Si es irregular y áspera → fractura irregular.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Estima la densidad relativa</strong>
                <p>Sujeta la muestra en la mano: ¿es sorprendentemente pesada para su tamaño? Minerales densos (galena ~7,6 g/cm³, barita ~4,5, pirita ~5) se notan mucho más pesados que el cuarzo (~2,65) o la calcita (~2,7). Sin balanza, puedes comparar con una piedra de cuarzo de tamaño similar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Aplica pruebas especiales si las anteriores no bastan</strong>
                <p>Algunas propiedades son diagnósticas únicas: <strong>Magnetismo</strong> (magnetita y pirrotita son magnéticas). <strong>Efervescencia con HCl</strong> (calcita burbujea con ácido clorhídrico diluido; dolomita solo en polvo). <strong>Fluorescencia UV</strong> (fluorita, scheelita y aragonito pueden fluorescen). <strong>Olor</strong> (azufre nativo huele a huevos podridos al rayarlo). <strong>Sabor</strong> (halita es salada; solo prueba minerales que sepas que no son tóxicos).</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores prácticas para identificar y coleccionar minerales</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧱</span>
              <div>
                <strong>Usa siempre porcelana sin vidriar para la raya</strong>
                <p>El reverso de un azulejo de cerámica o de un plato de porcelana sin esmalte es el soporte estándar. Si la baldosa tiene esmalte, el resultado no es fiable porque el esmalte puede ser más duro que el mineral y dejar una raya del esmalte, no del mineral.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <div>
                <strong>Prueba la dureza con minerales de referencia, no solo con objetos</strong>
                <p>Los objetos cotidianos tienen rangos de dureza variables según el material y el fabricante. Para mayor precisión, compra un juego básico de minerales de referencia (talco, yeso, calcita, fluorita, ortosa, cuarzo) que te permitirá acotar la dureza con precisión de ±0,5 unidades.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✨</span>
              <div>
                <strong>Observa el brillo siempre en superficie fresca</strong>
                <p>La meteorización y la oxidación cambian el brillo superficial de forma drástica. Un sulfuro brillante y metálico puede parecer opaco y terroso tras años de exposición. Rompe un ángulo del espécimen para ver el brillo real en la superficie de rotura.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎨</span>
              <div>
                <strong>No te fíes del color como prueba principal</strong>
                <p>El color es la propiedad más variable de los minerales. El cuarzo puede ser incoloro, rosa, morado (amatista), amarillo (citrino), negro (cuarzo ahumado) o verde. Úsalo como primer filtro orientativo, pero confirma siempre con dureza, raya y brillo antes de llegar a una conclusión.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <div>
                <strong>Trabaja con fragmentos pequeños y superficies limpias</strong>
                <p>Limpia la muestra con agua y un cepillo suave antes de hacer pruebas. La suciedad, el polvo o los recubrimientos de óxido alteran el color de la raya, el brillo y hasta la dureza aparente. Si la muestra es valiosa, trabaja en una zona discreta o con un fragmento desprendido.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📓</span>
              <div>
                <strong>Registra tus observaciones en orden y de forma sistemática</strong>
                <p>Anota: color, brillo, dureza (límites inferior y superior), color de raya, tipo de fractura/exfoliación, densidad relativa y cualquier propiedad especial. Con esta ficha de campo podrás consultar catálogos y esta herramienta de forma mucho más eficiente que intentando recordarlo todo al llegar a casa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores frecuentes */}
        <section className={styles.guideSection}>
          <h2>⚠️ Errores frecuentes al identificar minerales</h2>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Confusiones típicas que debes evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Cuarzo ≠ Calcita.</strong> Ambos pueden ser incoloros, vítreos y muy comunes. La prueba definitiva: la calcita (dureza 3) se raya fácilmente con una moneda de cobre y burbujea con ácido clorhídrico diluido; el cuarzo (dureza 7) no se raya con moneda y no reacciona con HCl.
              </li>
              <li>
                <strong>Pirita ≠ Oro ("el oro de los tontos").</strong> La pirita (FeS₂) tiene color amarillo dorado brillante que engañó a muchos buscadores. Diferencias clave: la pirita tiene brillo metálico fuerte, raya negra-verdosa y dureza 6–6,5 (raya el vidrio); el oro nativo tiene brillo suave y amarillo pálido, raya amarilla y dureza 2,5–3 (se deforma al presionarlo, no se rompe).
              </li>
              <li>
                <strong>Mineral ≠ Roca.</strong> Es muy común llamar "mineral" a una roca. Recuerda: el granito es una roca (mezcla de cuarzo + feldespato + mica), no un mineral. El cuarzo dentro del granito sí es un mineral. Si no puedes separar los componentes individuales visualmente, probablemente sea una roca.
              </li>
              <li>
                <strong>No usar referencia adecuada al medir dureza.</strong> Decir "se raya con metal" no es suficiente: un clavo de acero blando (~4,5), una lima de acero (~6,5) y una broca de widia (~9) son todos "metal" pero cubren casi toda la escala. Especifica siempre el objeto de referencia y verifica que el objeto rayante sea más duro que el rayado, no al revés.
              </li>
              <li>
                <strong>Confundir el color de la raya con el color del mineral.</strong> La hematites puede ser gris metálica, negro brillante o pardo rojiza según la muestra, pero su raya es siempre rojo-parda característica. La pirita parece dorada pero su raya es negro-verdosa. El color de la raya es mucho más fiable que el color de la muestra.
              </li>
              <li>
                <strong>Pensar que un mineral "cristalizado" es diferente al mismo mineral sin cristales visibles.</strong> El cuarzo en cristales hexagonales transparentes (cristal de roca), el cuarzo en masa compacta gris (pedernal) y la amatista morada son el mismo mineral con diferente hábito cristalino e impurezas. Las propiedades físicas diagnósticas (dureza, raya, sistema cristalino) son idénticas.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('minerales-del-mundo')} />
      <ShareCard appName="minerales-del-mundo" />
      <Footer appName="minerales-del-mundo" />
    </div>
  );
}
