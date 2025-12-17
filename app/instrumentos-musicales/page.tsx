'use client';

import { useState, useMemo } from 'react';
import styles from './InstrumentosMusicales.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  INSTRUMENTS,
  FAMILIAS,
  ORIGENES,
  FAMILIA_EMOJI,
  ORIGEN_EMOJI,
  type InstrumentFamily,
  type InstrumentOrigin
} from '@/data/instruments';

export default function InstrumentosMusicalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<InstrumentFamily | 'Todas'>('Todas');
  const [selectedOrigin, setSelectedOrigin] = useState<InstrumentOrigin | 'Todos'>('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar instrumentos
  const filteredInstruments = useMemo(() => {
    return INSTRUMENTS.filter(instrument => {
      const matchesSearch =
        instrument.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.nombreIngles.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.subfamilia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.materiales.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFamily = selectedFamily === 'Todas' || instrument.familia === selectedFamily;
      const matchesOrigin = selectedOrigin === 'Todos' || instrument.origen === selectedOrigin;

      return matchesSearch && matchesFamily && matchesOrigin;
    });
  }, [searchTerm, selectedFamily, selectedOrigin]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎵</span>
        <h1 className={styles.title}>Instrumentos Musicales</h1>
        <p className={styles.subtitle}>
          Explora 45 instrumentos de todo el mundo: cuerda, viento, percusión,
          teclado y electrónicos con su historia y curiosidades
        </p>
      </header>

      {/* Buscador y Filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o material..."
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
            <label htmlFor="filter-familia" className={styles.filterLabel}>Familia:</label>
            <select
              id="filter-familia"
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value as InstrumentFamily | 'Todas')}
              className={styles.filterSelect}
            >
              <option value="Todas">Todas</option>
              {FAMILIAS.map(familia => (
                <option key={familia} value={familia}>{FAMILIA_EMOJI[familia]} {familia}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filter-origen" className={styles.filterLabel}>Origen:</label>
            <select
              id="filter-origen"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value as InstrumentOrigin | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {ORIGENES.map(origen => (
                <option key={origen} value={origen}>{ORIGEN_EMOJI[origen]} {origen}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultsCount}>
          Mostrando {filteredInstruments.length} de {INSTRUMENTS.length} instrumentos
        </div>
      </div>

      {/* Grid de Instrumentos */}
      <div className={styles.instrumentsGrid}>
        {filteredInstruments.map(instrument => (
          <article
            key={instrument.id}
            className={`${styles.instrumentCard} ${expandedId === instrument.id ? styles.expanded : ''}`}
            onClick={() => toggleExpand(instrument.id)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.familyEmoji}>{FAMILIA_EMOJI[instrument.familia]}</span>
                <div>
                  <h2 className={styles.instrumentName}>{instrument.nombre}</h2>
                  <p className={styles.englishName}>{instrument.nombreIngles}</p>
                </div>
              </div>
              <span className={styles.expandIcon}>
                {expandedId === instrument.id ? '−' : '+'}
              </span>
            </div>

            <div className={styles.cardBasicInfo}>
              <span className={styles.badge} data-family={instrument.familia.toLowerCase().replace('-', '')}>
                {instrument.familia}
              </span>
              <span className={styles.badge} data-origin={instrument.origen.toLowerCase()}>
                {ORIGEN_EMOJI[instrument.origen]} {instrument.origen}
              </span>
              <span className={styles.badge} data-register={instrument.registro.toLowerCase()}>
                {instrument.registro}
              </span>
            </div>

            <p className={styles.subfamilia}>{instrument.subfamilia}</p>

            {/* Contenido expandido */}
            {expandedId === instrument.id && (
              <div className={styles.cardDetails}>
                <div className={styles.detailSection}>
                  <h3>📅 Origen</h3>
                  <p>{instrument.epocaOrigen}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>🪵 Materiales</h3>
                  <div className={styles.materialsList}>
                    {instrument.materiales.map((material, index) => (
                      <span key={index} className={styles.materialTag}>
                        {material}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>📝 Descripción</h3>
                  <p>{instrument.descripcion}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>💡 Curiosidad</h3>
                  <p className={styles.curiosity}>{instrument.curiosidad}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredInstruments.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🎼</span>
          <p>No se encontraron instrumentos con esos criterios.</p>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearchTerm('');
              setSelectedFamily('Todas');
              setSelectedOrigin('Todos');
            }}
          >
            Mostrar todos
          </button>
        </div>
      )}

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre instrumentos musicales?"
        subtitle="Descubre la clasificación de instrumentos, la acústica musical y curiosidades de la orquesta"
        icon="🎶"
      >
        <section className={styles.guideSection}>
          <h2>Clasificación de Instrumentos</h2>
          <p className={styles.introParagraph}>
            Los instrumentos musicales se clasifican según cómo producen el sonido.
            El sistema más usado es la clasificación de Hornbostel-Sachs (1914),
            que los divide en familias según su mecanismo de producción sonora.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎻 Cordófonos (Cuerda)</h4>
              <p>
                El sonido se produce por la vibración de cuerdas tensadas. Pueden ser
                frotadas (violín), pulsadas (guitarra) o percutidas (piano).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎷 Aerófonos (Viento)</h4>
              <p>
                El sonido se produce por la vibración del aire. Se dividen en maderas
                (flauta, clarinete) y metales (trompeta, tuba) según su embocadura.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🥁 Membranófonos e Idiófonos</h4>
              <p>
                Los membranófonos vibran una membrana (tambores). Los idiófonos vibran
                todo el instrumento (xilófono, triángulo, platillos).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎸 Electrófonos</h4>
              <p>
                El sonido se genera o amplifica electrónicamente. Incluye guitarras
                eléctricas, sintetizadores y theremin.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>La Orquesta Sinfónica</h2>
          <p className={styles.introParagraph}>
            Una orquesta sinfónica típica tiene entre 70 y 100 músicos organizados
            en cuatro secciones principales.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎻 Cuerdas (60-70 músicos)</h4>
              <p>
                La sección más grande: violines primeros y segundos, violas, violonchelos
                y contrabajos. Son el "corazón" de la orquesta.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎷 Viento Madera (10-12)</h4>
              <p>
                Flautas, oboes, clarinetes y fagotes. El oboe da la nota de afinación
                al inicio del concierto.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🎺 Viento Metal (10-12)</h4>
              <p>
                Trompetas, trompas, trombones y tubas. Aportan potencia y brillantez
                en los momentos climáticos.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🥁 Percusión (4-6)</h4>
              <p>
                Timbales, bombo, platillos, triángulo, xilófono y más. Un percusionista
                puede tocar varios instrumentos en una obra.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>El Registro Musical</h2>
          <p className={styles.introParagraph}>
            El registro indica el rango de notas que puede producir un instrumento,
            desde las más graves hasta las más agudas.
          </p>
          <ul className={styles.registerList}>
            <li><strong>Grave:</strong> Contrabajo, tuba, timbales, bajo eléctrico</li>
            <li><strong>Medio:</strong> Viola, trombón, guitarra, piano (registro central)</li>
            <li><strong>Agudo:</strong> Violín, flauta, trompeta, xilófono</li>
            <li><strong>Amplio:</strong> Piano (7 octavas), arpa, órgano, sintetizador</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('instrumentos-musicales')} />
      <Footer appName="instrumentos-musicales" />
    </div>
  );
}
