'use client';

import { useState, useMemo } from 'react';
import styles from './HuesosCuerpoHumano.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  BONES,
  REGIONES,
  TIPOS,
  REGION_EMOJI,
  TIPO_EMOJI,
  searchBones,
  getTotalBones,
  type Bone,
  type BoneRegion,
  type BoneType,
} from '@/data/bones';

export default function HuesosCuerpoHumanoPage() {
  const [busqueda, setBusqueda] = useState('');
  const [regionFiltro, setRegionFiltro] = useState<BoneRegion | 'todas'>('todas');
  const [tipoFiltro, setTipoFiltro] = useState<BoneType | 'todos'>('todos');
  const [huesoSeleccionado, setHuesoSeleccionado] = useState<Bone | null>(null);

  const totalHuesos = useMemo(() => getTotalBones(), []);

  // Filtrar huesos
  const huesosFiltrados = useMemo(() => {
    let resultado = BONES;

    // Filtrar por región
    if (regionFiltro !== 'todas') {
      resultado = resultado.filter(h => h.region === regionFiltro);
    }

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
      resultado = resultado.filter(h => h.tipo === tipoFiltro);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaResultados = searchBones(busqueda);
      resultado = resultado.filter(h => busquedaResultados.includes(h));
    }

    return resultado;
  }, [busqueda, regionFiltro, tipoFiltro]);

  // Contar huesos por región
  const conteosPorRegion = useMemo(() => {
    const conteos: Record<string, number> = { todas: BONES.length };
    REGIONES.forEach(region => {
      conteos[region] = BONES.filter(h => h.region === region).length;
    });
    return conteos;
  }, []);

  // Contar huesos reales (con cantidad) filtrados
  const totalHuesosFiltrados = useMemo(() => {
    return huesosFiltrados.reduce((total, bone) => total + bone.cantidad, 0);
  }, [huesosFiltrados]);

  const handleHuesoClick = (hueso: Bone) => {
    setHuesoSeleccionado(huesoSeleccionado?.id === hueso.id ? null : hueso);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🦴</span>
        <h1 className={styles.title}>Huesos del Cuerpo Humano</h1>
        <p className={styles.subtitle}>
          Explora los {totalHuesos} huesos del esqueleto humano adulto
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
            placeholder="Buscar por nombre, función o articulación..."
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

        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Región:</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${regionFiltro === 'todas' ? styles.active : ''}`}
                onClick={() => setRegionFiltro('todas')}
              >
                Todas ({conteosPorRegion.todas})
              </button>
              {REGIONES.map(region => (
                <button
                  key={region}
                  className={`${styles.filterButton} ${regionFiltro === region ? styles.active : ''}`}
                  onClick={() => setRegionFiltro(region)}
                >
                  {REGION_EMOJI[region]} {region} ({conteosPorRegion[region]})
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Tipo de hueso:</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${tipoFiltro === 'todos' ? styles.active : ''}`}
                onClick={() => setTipoFiltro('todos')}
              >
                Todos
              </button>
              {TIPOS.map(tipo => (
                <button
                  key={tipo}
                  className={`${styles.filterButton} ${tipoFiltro === tipo ? styles.active : ''}`}
                  onClick={() => setTipoFiltro(tipo)}
                >
                  {TIPO_EMOJI[tipo]} {tipo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className={styles.resultsCount}>
        {huesosFiltrados.length === BONES.length
          ? `Mostrando ${BONES.length} entradas (${totalHuesos} huesos en total)`
          : `${huesosFiltrados.length} entrada${huesosFiltrados.length !== 1 ? 's' : ''} (${totalHuesosFiltrados} huesos)`
        }
      </div>

      {/* Grid de huesos */}
      <div className={styles.bonesGrid}>
        {huesosFiltrados.map(hueso => (
          <article
            key={hueso.id}
            className={`${styles.boneCard} ${huesoSeleccionado?.id === hueso.id ? styles.expanded : ''}`}
            onClick={() => handleHuesoClick(hueso)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.regionEmoji}>{REGION_EMOJI[hueso.region]}</span>
                <div>
                  <h3 className={styles.boneName}>{hueso.nombre}</h3>
                  <span className={styles.latinName}>{hueso.nombreLatin}</span>
                </div>
              </div>
              <div className={styles.badges}>
                <span className={styles.typeBadge} title="Tipo de hueso">
                  {TIPO_EMOJI[hueso.tipo]} {hueso.tipo}
                </span>
                {hueso.cantidad > 1 && (
                  <span className={styles.countBadge} title="Cantidad en el cuerpo">
                    ×{hueso.cantidad}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.cardPreview}>
              <p className={styles.functionPreview}>{hueso.funcion}</p>
            </div>

            <div className={styles.articulationsPreview}>
              <span className={styles.artLabel}>Articulaciones:</span>
              <span className={styles.artValue}>
                {hueso.articulaciones.slice(0, 3).join(', ')}
                {hueso.articulaciones.length > 3 && ` +${hueso.articulaciones.length - 3}`}
              </span>
            </div>

            {/* Contenido expandido */}
            {huesoSeleccionado?.id === hueso.id && (
              <div className={styles.expandedContent}>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>📋 Información completa</h4>
                  <div className={styles.propertiesGrid}>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Nombre latino</span>
                      <span className={styles.propertyValue}>{hueso.nombreLatin}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Región</span>
                      <span className={styles.propertyValue}>{hueso.region}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Tipo</span>
                      <span className={styles.propertyValue}>{hueso.tipo}</span>
                    </div>
                    <div className={styles.propertyItem}>
                      <span className={styles.propertyLabel}>Cantidad</span>
                      <span className={styles.propertyValue}>
                        {hueso.cantidad === 1 ? 'Impar (1)' : `Par (${hueso.cantidad})`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🔗 Articulaciones</h4>
                  <div className={styles.articulationsList}>
                    {hueso.articulaciones.map((art, idx) => (
                      <span key={idx} className={styles.articulationTag}>{art}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>⚙️ Función</h4>
                  <p className={styles.functionText}>{hueso.funcion}</p>
                </div>

                <div className={styles.curiositySection}>
                  <h4 className={styles.detailTitle}>💡 Curiosidad</h4>
                  <p className={styles.curiosityText}>{hueso.curiosidad}</p>
                </div>
              </div>
            )}

            <div className={styles.expandHint}>
              {huesoSeleccionado?.id === hueso.id ? 'Clic para cerrar' : 'Clic para ver más'}
            </div>
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {huesosFiltrados.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🔍</span>
          <p>No se encontraron huesos con esos criterios</p>
          <button
            onClick={() => { setBusqueda(''); setRegionFiltro('todas'); setTipoFiltro('todos'); }}
            className={styles.resetButton}
          >
            Mostrar todos los huesos
          </button>
        </div>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre el esqueleto humano?"
        subtitle="Descubre los tipos de huesos, las regiones del esqueleto y datos curiosos"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>🦴 Tipos de huesos</h2>
          <p className={styles.introParagraph}>
            Los huesos se clasifican en 5 tipos según su forma. Cada tipo tiene características y funciones específicas.
          </p>
          <div className={styles.typesGrid}>
            <div className={styles.typeCard}>
              <span className={styles.typeIcon}>📏</span>
              <h4>Largos</h4>
              <p>Más largos que anchos. Tienen diáfisis (cuerpo) y epífisis (extremos). Actúan como palancas.</p>
              <span className={styles.examples}>Ejemplos: Fémur, húmero, tibia, radio</span>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeIcon}>🔲</span>
              <h4>Cortos</h4>
              <p>Forma aproximadamente cúbica. Permiten movimientos finos y absorben impactos.</p>
              <span className={styles.examples}>Ejemplos: Carpos (muñeca), tarsos (tobillo)</span>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeIcon}>📄</span>
              <h4>Planos</h4>
              <p>Delgados y curvados. Protegen órganos internos y proporcionan superficie para músculos.</p>
              <span className={styles.examples}>Ejemplos: Cráneo, escápula, esternón, costillas</span>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeIcon}>🔶</span>
              <h4>Irregulares</h4>
              <p>Formas complejas que no encajan en otras categorías. Funciones especializadas.</p>
              <span className={styles.examples}>Ejemplos: Vértebras, coxal, esfenoides</span>
            </div>
            <div className={styles.typeCard}>
              <span className={styles.typeIcon}>⚫</span>
              <h4>Sesamoideos</h4>
              <p>Pequeños, redondeados, incrustados en tendones. Protegen y mejoran la mecánica.</p>
              <span className={styles.examples}>Ejemplos: Rótula (el más grande)</span>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>🗺️ Regiones del esqueleto</h2>
          <p className={styles.introParagraph}>
            El esqueleto humano adulto tiene {totalHuesos} huesos, organizados en dos divisiones principales:
          </p>
          <div className={styles.skeletonDivisions}>
            <div className={styles.divisionCard}>
              <h4>Esqueleto Axial (80 huesos)</h4>
              <p>Forma el eje central del cuerpo. Incluye:</p>
              <ul>
                <li><strong>Cráneo:</strong> 22 huesos (8 del cráneo + 14 de la cara)</li>
                <li><strong>Huesos del oído:</strong> 6 huesos (3 pares)</li>
                <li><strong>Hioides:</strong> 1 hueso</li>
                <li><strong>Columna vertebral:</strong> 26 huesos</li>
                <li><strong>Tórax:</strong> 25 huesos (esternón + 24 costillas)</li>
              </ul>
            </div>
            <div className={styles.divisionCard}>
              <h4>Esqueleto Apendicular (126 huesos)</h4>
              <p>Extremidades y cinturas. Incluye:</p>
              <ul>
                <li><strong>Cintura escapular:</strong> 4 huesos (clavículas + escápulas)</li>
                <li><strong>Extremidades superiores:</strong> 60 huesos (30 por lado)</li>
                <li><strong>Cintura pélvica:</strong> 2 huesos (coxales)</li>
                <li><strong>Extremidades inferiores:</strong> 60 huesos (30 por lado)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>💡 Datos curiosos sobre los huesos</h2>
          <div className={styles.funFacts}>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>👶</span>
              <p>Los bebés nacen con aproximadamente <strong>270 huesos</strong>, que se van fusionando hasta llegar a 206 en la edad adulta.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>💪</span>
              <p>El <strong>fémur</strong> es el hueso más largo y fuerte del cuerpo, mientras que el <strong>estribo</strong> del oído es el más pequeño (2,5 mm).</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🔄</span>
              <p>Los huesos están en constante renovación. El esqueleto completo se reemplaza aproximadamente cada <strong>10 años</strong>.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🩸</span>
              <p>La médula ósea roja produce alrededor de <strong>200 mil millones</strong> de glóbulos rojos cada día.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🤚</span>
              <p>Más de <strong>la mitad de los huesos</strong> del cuerpo (106) están en las manos y los pies.</p>
            </div>
            <div className={styles.funFact}>
              <span className={styles.factIcon}>🦴</span>
              <p>El <strong>hioides</strong> es el único hueso del cuerpo que no se articula con ningún otro hueso.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>📊 Resumen del esqueleto</h2>
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total de huesos (adulto)</span>
              <span className={styles.summaryValue}>206</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Esqueleto axial</span>
              <span className={styles.summaryValue}>80</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Esqueleto apendicular</span>
              <span className={styles.summaryValue}>126</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Huesos en manos y pies</span>
              <span className={styles.summaryValue}>106</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Hueso más largo</span>
              <span className={styles.summaryValue}>Fémur (~45 cm)</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Hueso más pequeño</span>
              <span className={styles.summaryValue}>Estribo (~2,5 mm)</span>
            </div>
          </div>
        </section>

        {/* Tabla Comparativa: Esqueleto Axial vs Apendicular */}
        <section className={styles.guideSection}>
          <h2>⚖️ Esqueleto Axial vs Apendicular</h2>
          <p className={styles.introParagraph}>
            Las dos grandes divisiones del esqueleto tienen funciones complementarias. Conocer sus diferencias es fundamental para cualquier examen de biología o anatomía.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Esqueleto Axial</th>
                  <th>Esqueleto Apendicular</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Número de huesos</strong></td>
                  <td>80 huesos</td>
                  <td>126 huesos</td>
                </tr>
                <tr>
                  <td><strong>Función principal</strong></td>
                  <td>Soporte y protección de órganos vitales</td>
                  <td>Movimiento y locomoción</td>
                </tr>
                <tr>
                  <td><strong>Componentes</strong></td>
                  <td>Cráneo, columna vertebral, tórax</td>
                  <td>Extremidades superiores e inferiores, cinturas</td>
                </tr>
                <tr>
                  <td><strong>Movilidad</strong></td>
                  <td>Limitada (estabilidad prioritaria)</td>
                  <td>Alta (rango de movimiento amplio)</td>
                </tr>
                <tr>
                  <td><strong>Médula ósea roja</strong></td>
                  <td>✅ Abundante (vértebras, esternón)</td>
                  <td>⚠️ Presente solo en epífisis</td>
                </tr>
                <tr>
                  <td><strong>Fracturas frecuentes</strong></td>
                  <td>Vértebras (osteoporosis), costillas</td>
                  <td>Cúbito-radio, clavícula, fémur proximal</td>
                </tr>
                <tr>
                  <td><strong>Ideal para estudiar</strong></td>
                  <td>Biología ESO/Bachillerato, anatomía básica</td>
                  <td>Fisioterapia, traumatología, deporte</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 ¿Para quién es útil esta herramienta?</h2>
          <p className={styles.introParagraph}>
            El atlas de huesos meskeIA se adapta a distintos perfiles. Cada uno obtiene un valor diferente según sus objetivos.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Estudiante de ESO/Bachillerato</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Filtrar por región → "Extremidades inferiores" → repasar fémur, tibia, peroné antes del examen de biología de 2.º ESO</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los filtros permiten repasar hueso por hueso en 15 minutos. El nombre en latín y la curiosidad ayudan a fijar conceptos con menos esfuerzo que memorizando listas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🩺</span>
                <h3>Estudiante de Medicina o Fisioterapia</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Filtrar por tipo "Largo" → revisar articulaciones de húmero → preparar prácticas de osteología del primer año</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Las articulaciones de cada hueso y su nombre latino son exactamente los datos que se evalúan en primero de medicina. Consulta rápida sin abrir el Atlas de Gray.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💪</span>
                <h3>Entrenador personal o deportista</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Buscar "clavícula" → ver articulaciones → entender por qué una caída lateral la fractura con tanta frecuencia</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Conocer las articulaciones de cada hueso permite explicar lesiones deportivas a los clientes y diseñar programas de rehabilitación más informados.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍🏫</span>
                <h3>Docente de Biología</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Proyectar en clase el atlas filtrado por "Cráneo" → mostrar los 22 huesos con función y curiosidades → debate sobre el hioides</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> La interfaz visual y los datos curiosos hacen que la clase sea más dinámica que un libro de texto. Los estudiantes pueden explorar en sus móviles durante la clase.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre el Esqueleto</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué los bebés tienen más huesos que los adultos?</h4>
              <p>
                Los recién nacidos tienen aproximadamente 270-300 huesos, muchos de ellos en forma de cartílago o separados. Con el crecimiento, huesos adyacentes se fusionan progresivamente. El proceso se completa alrededor de los 25 años. El cráneo, por ejemplo, nace en varias piezas separadas (fontanelas) para facilitar el parto y el desarrollo cerebral.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Para el examen:</strong> Los 270 huesos al nacer se fusionan hasta los 206 del adulto. Las fontanelas del cráneo se cierran entre los 18 meses y los 2 años.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuánto tarda en soldarse un hueso roto?</h4>
              <p>
                Depende del hueso y la edad del paciente. Huesos pequeños (falanges, costillas): 3-6 semanas. Huesos medianos (radio, cúbito): 6-12 semanas. Huesos grandes (fémur, tibia): 3-6 meses. Los niños curan más rápido que los adultos gracias a mayor actividad osteoblástica. Los fumadores y diabéticos tienen consolidación más lenta.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Dato clínico:</strong> El fémur proximal en ancianos con osteoporosis puede tardar 4-6 meses y tiene mortalidad asociada del 15-20% en el primer año.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué se dice 206 huesos si hay variaciones entre personas?</h4>
              <p>
                206 es el número estándar del adulto, pero existe variabilidad anatómica normal. Algunas personas tienen costillas cervicales (costilla extra en C7, 0,5-1% de la población), huesos suturales adicionales en el cráneo, o el hueso trígono en el tobillo. También la fusión de vértebras sacras puede variar. La cifra de 206 es la media estadística, no una constante biológica.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Curiosidad:</strong> La costilla cervical es famosa porque puede comprimir el plexo braquial, causando el síndrome del opérculo torácico.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es la osteoporosis y cómo afecta a los huesos?</h4>
              <p>
                La osteoporosis es la pérdida de densidad mineral ósea por debajo de 2,5 desviaciones estándar de la media (T-score ≤ -2,5 en densitometría DEXA). Afecta al 30% de mujeres postmenopáusicas. Las zonas más vulnerables son la columna lumbar, el cuello del fémur y el radio distal. El riesgo de fractura se multiplica por 2-4 en pacientes con osteoporosis.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Prevención:</strong> 1.000-1.200 mg de calcio/día, 800 UI de vitamina D, ejercicio de impacto y evitar tabaco y alcohol desde los 30 años.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuáles son los huesos que se fracturan con más frecuencia?</h4>
              <p>
                Las fracturas más comunes en adultos son: 1) Radio distal (fractura de Colles, caída con la mano extendida), 2) Vértebras lumbares (osteoporosis), 3) Cuello del fémur (caídas en mayores), 4) Tobillo (maleolo), 5) Clavícula (caídas laterales en deportes). En niños, las fracturas de clavícula y antebrazo son las más frecuentes. Las costillas se fracturan frecuentemente en accidentes de tráfico.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla mnemotécnica:</strong> Las 5 "C" más fracturadas: Colles (radio), Cuello femoral, Clavícula, Costillas, Columna.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Para qué sirve la médula ósea y dónde se produce?</h4>
              <p>
                Hay dos tipos: médula roja (hematopoyética) y médula amarilla (grasa). La médula roja produce 200.000 millones de glóbulos rojos diarios. En adultos, está activa principalmente en vértebras, esternón, costillas, cráneo, crestas ilíacas y epífisis de huesos largos. La médula amarilla ocupa la diáfisis de huesos largos y puede convertirse en roja si hay necesidad aumentada (hemorragia severa, anemia).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Clínica:</strong> El trasplante de médula ósea se realiza aspirando células del ilion (cresta ilíaca) o del esternón. La cresta ilíaca es la fuente principal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué crujen los huesos y las articulaciones?</h4>
              <p>
                El chasquido articular tiene varias causas: 1) Cavitación del líquido sinovial (burbujas de CO₂ que estallan, el chasquido de nudillos), 2) Tendones que se deslizan sobre prominencias óseas, 3) Degeneración cartilaginosa (artrosis, crepitación). El chasquido de nudillos no causa artritis, pero puede inflamar ligeramente la cápsula articular con el tiempo.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Mito derribado:</strong> Un estudio de 60 años de seguimiento (Donald Unger, Premio IgNobel 2009) demostró que chasquear los nudillos de una mano durante décadas no produce artritis.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántos huesos tiene la columna vertebral exactamente?</h4>
              <p>
                La columna vertebral tiene 33-34 vértebras en el nacimiento, que se reducen a 26 huesos en el adulto: 7 cervicales (C1-C7), 12 torácicas (T1-T12), 5 lumbares (L1-L5), 1 sacro (5 vértebras fusionadas) y 1 cóccix (3-5 vértebras fusionadas). La regla mnemotécnica clásica: 7-12-5 son las horas de las comidas (desayuno a las 7, comida a las 12, cena a las 5).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Para el examen:</strong> 7+12+5+1+1 = 26 huesos. Las cervicales son las únicas con agujero transverso para la arteria vertebral.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Cómo estudiar el esqueleto para un examen</h2>
          <p className={styles.introParagraph}>
            Estrategia probada para memorizar los 206 huesos con sus nombres, regiones y funciones en el menor tiempo posible.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Aprende primero los 5 tipos de huesos</h4>
                <p>
                  Antes de memorizar huesos individuales, interioriza la clasificación: Largo (palancas), Corto (absorción), Plano (protección), Irregular (función especializada), Sesamoideo (mejora mecánica). Cuando sepas el tipo, la función se deduce automáticamente. Esto reduce a la mitad el esfuerzo de memorización.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Divide el esqueleto en axial (80) y apendicular (126)</h4>
                <p>
                  Estudia primero el esqueleto axial: cráneo (22), vértebras (26), tórax (25), hioides (1), huesecillos del oído (6). Después el apendicular: cintura escapular (4), extremidades superiores (60), cintura pélvica (2), extremidades inferiores (60). Esta división aparece en casi todos los exámenes de bachillerato y selectividad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Aprende los huesos grandes primero, luego los pequeños</h4>
                <p>
                  Orden recomendado: Fémur → Tibia/Peroné → Húmero → Radio/Cúbito → Vértebras → Cráneo → Costillas → Manos/Pies. Los 8 huesos del carpo (muñeca) y los 7 del tarso (tobillo) son los más difíciles: déjalos para el final y usa reglas mnemotécnicas (El Escafoides Pide Grandes, Trapecios, Trapezoides y Capitanes).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Añade los nombres en latín progresivamente</h4>
                <p>
                  No intentes aprender castellano y latín a la vez. Primero domina los nombres en castellano y las funciones. Después añade el nombre latino de los huesos más importantes: Femur, Humerus, Tibia, Fibula (peroné), Cranium, Sternum, Clavicula. El latín tiene lógica: "os" = hueso, "costa" = costilla, "vertebra" = articulación girante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Estudia las articulaciones como relaciones entre huesos</h4>
                <p>
                  Cada hueso se articula con otros específicos. Esta información es clave en fisioterapia y medicina. Usa la herramienta: haz clic en cada hueso y revisa sus articulaciones. Practica la pregunta inversa: "¿Con qué huesos se articula el fémur?" Respuesta: coxal (cadera), tibia y rótula (rodilla).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Repasa usando los filtros de región y tipo</h4>
                <p>
                  Usa los filtros de esta app como tests de repaso: filtra "Cráneo" e intenta nombrar cada hueso antes de leerlo. Después filtra "Planos" y comprueba si recuerdas que el cráneo, la escápula, el esternón y las costillas son planos. Este repaso activo retiene 3 veces más que releer apuntes pasivamente.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Completa con patologías y aplicaciones clínicas</h4>
                <p>
                  Para exámenes de nivel universitario (medicina, fisioterapia, enfermería), relaciona cada hueso con sus patologías típicas. Fémur → fractura de cadera (osteoporosis). Radio distal → fractura de Colles. Clavícula → fractura más frecuente en deporte. Esta contextualización convierte datos aislados en conocimiento clínico aplicable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas para Estudiar Anatomía Ósea</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Aprende huesos en contexto, no en listas</h4>
              <p>Estudia el húmero junto con el hombro y el codo, no de forma aislada. El contexto anatómico facilita la comprensión y la retención.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>↔️</span>
              <h4>Usa el par/impar para recordar cantidades</h4>
              <p>Huesos pares (×2): costillas, clavículas, radios, cúbitos, fémures. Impares: esternón, hioides, sacro, cóccix. Reduce los errores de conteo en exámenes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Asocia la función al tipo antes de memorizar</h4>
              <p>Si sabes que los huesos planos protegen órganos, recordarás que el cráneo, el esternón y las costillas son planos sin memorizarlo. La lógica supera la memoria.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🩹</span>
              <h4>Relaciona cada hueso con su fractura típica</h4>
              <p>Caída con mano extendida → radio distal. Caída lateral en deporte → clavícula. Osteoporosis → cuello femoral y vértebras. Esto fija el hueso en la memoria a largo plazo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧠</span>
              <h4>Usa la regla 7-12-5 para la columna</h4>
              <p>7 cervicales (hora del desayuno), 12 torácicas (hora de la comida), 5 lumbares (hora de la cena). Mnemotécnica clásica que ningún estudiante de medicina olvida.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📱</span>
              <h4>Repaso activo con los filtros de la app</h4>
              <p>Filtra por región, tapa los nombres con el dedo y recítalos de memoria. El repaso activo retiene 3 veces más que la relectura pasiva según estudios de aprendizaje.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes que Cuestan Puntos en los Exámenes</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Confundir cráneo (8) con esqueleto craneal (22 huesos):</strong> El cráneo stricto sensu son 8 huesos (frontal, 2 parietales, 2 temporales, occipital, esfenoides, etmoides). La cara tiene 14 huesos adicionales. El examen suele preguntar los 22 del esqueleto craneal completo.
              </li>
              <li>
                <strong>❌ Decir que el tórax tiene 24 huesos en vez de 25:</strong> Son 24 costillas (12 pares) + 1 esternón = 25 huesos torácicos. El error de olvidar el esternón es muy frecuente.
              </li>
              <li>
                <strong>❌ Confundir radio y cúbito (cuál está en qué lado):</strong> El radio está en el lado del pulgar (lateral), el cúbito en el lado del meñique (medial). Truco: "Radio tiene R de pulgar derecho" o "el cubito forma el codo con su olécranon".
              </li>
              <li>
                <strong>❌ Confundir tibia y peroné (cuál es el hueso principal):</strong> La tibia es el hueso grande y medial (soporta el 85% del peso). El peroné es delgado y lateral (estabilidad del tobillo). Truco: "Tibia = Tronco, Peroné = Pequeño y Periférico".
              </li>
              <li>
                <strong>❌ Olvidar los 6 huesecillos del oído:</strong> Son 3 pares: martillo, yunque y estribo (×2 = 6). Forman parte del esqueleto axial y se incluyen en el cómputo de los 206. Son los huesos más pequeños del cuerpo.
              </li>
              <li>
                <strong>❌ Creer que el cóccix y el sacro son un solo hueso:</strong> Son dos huesos distintos. El sacro = 5 vértebras sacras fusionadas. El cóccix = 3-5 vértebras coccígeas fusionadas. En el adulto, la columna tiene 26 huesos (no 33-34 del neonato).
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('huesos-cuerpo-humano')} />
      <Footer appName="huesos-cuerpo-humano" />
    </div>
  );
}
