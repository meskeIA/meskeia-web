'use client';

import { useState, useMemo } from 'react';
import styles from './HuesosCuerpoHumano.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('huesos-cuerpo-humano')} />
      <Footer appName="huesos-cuerpo-humano" />
    </div>
  );
}
