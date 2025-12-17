'use client';

import { useState, useMemo } from 'react';
import styles from './ConstelacionesDelCielo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  CONSTELLATIONS,
  TIPOS,
  HEMISFERIOS,
  type ConstellationType,
  type Hemisphere
} from '@/data/constellations';

export default function ConstelacionesDelCieloPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ConstellationType | 'Todas'>('Todas');
  const [selectedHemisphere, setSelectedHemisphere] = useState<Hemisphere | 'Todos'>('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtrar constelaciones
  const filteredConstellations = useMemo(() => {
    return CONSTELLATIONS.filter(constellation => {
      const matchesSearch =
        constellation.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constellation.nombreLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constellation.abreviatura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        constellation.estrellasPrincipales.some(star =>
          star.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = selectedType === 'Todas' || constellation.tipo === selectedType;
      const matchesHemisphere = selectedHemisphere === 'Todos' || constellation.hemisferio === selectedHemisphere;

      return matchesSearch && matchesType && matchesHemisphere;
    });
  }, [searchTerm, selectedType, selectedHemisphere]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Emojis para tipos de constelación
  const getTypeEmoji = (type: ConstellationType) => {
    switch (type) {
      case 'Zodiacal': return '♈';
      case 'Boreal': return '🌟';
      case 'Austral': return '✨';
      default: return '⭐';
    }
  };

  // Emoji para hemisferio
  const getHemisphereEmoji = (hemisphere: Hemisphere) => {
    switch (hemisphere) {
      case 'Norte': return '🧭';
      case 'Sur': return '🌍';
      case 'Ambos': return '🌐';
      default: return '🌐';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌌</span>
        <h1 className={styles.title}>Constelaciones del Cielo</h1>
        <p className={styles.subtitle}>
          Explora las 32 constelaciones más famosas del cielo nocturno:
          estrellas principales, mitología griega y curiosidades
        </p>
      </header>

      {/* Buscador y Filtros */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, estrella o abreviatura..."
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
              onChange={(e) => setSelectedType(e.target.value as ConstellationType | 'Todas')}
              className={styles.filterSelect}
            >
              <option value="Todas">Todas</option>
              {TIPOS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filter-hemisferio" className={styles.filterLabel}>Hemisferio:</label>
            <select
              id="filter-hemisferio"
              value={selectedHemisphere}
              onChange={(e) => setSelectedHemisphere(e.target.value as Hemisphere | 'Todos')}
              className={styles.filterSelect}
            >
              <option value="Todos">Todos</option>
              {HEMISFERIOS.map(hemisphere => (
                <option key={hemisphere} value={hemisphere}>{hemisphere}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.resultsCount}>
          Mostrando {filteredConstellations.length} de {CONSTELLATIONS.length} constelaciones
        </div>
      </div>

      {/* Grid de Constelaciones */}
      <div className={styles.constellationsGrid}>
        {filteredConstellations.map(constellation => (
          <article
            key={constellation.id}
            className={`${styles.constellationCard} ${expandedId === constellation.id ? styles.expanded : ''}`}
            onClick={() => toggleExpand(constellation.id)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.typeEmoji}>{getTypeEmoji(constellation.tipo)}</span>
                <div>
                  <h2 className={styles.constellationName}>{constellation.nombre}</h2>
                  <p className={styles.latinName}>{constellation.nombreLatin} ({constellation.abreviatura})</p>
                </div>
              </div>
              <span className={styles.expandIcon}>
                {expandedId === constellation.id ? '−' : '+'}
              </span>
            </div>

            <div className={styles.cardBasicInfo}>
              <span className={styles.badge} data-type={constellation.tipo.toLowerCase()}>
                {constellation.tipo}
              </span>
              <span className={styles.badge} data-hemisphere={constellation.hemisferio.toLowerCase()}>
                {getHemisphereEmoji(constellation.hemisferio)} {constellation.hemisferio}
              </span>
              <span className={styles.badge} data-info="area">
                {constellation.areaGrados.toLocaleString('es-ES')} grados²
              </span>
            </div>

            {/* Contenido expandido */}
            {expandedId === constellation.id && (
              <div className={styles.cardDetails}>
                <div className={styles.detailSection}>
                  <h3>⭐ Estrellas Principales</h3>
                  <div className={styles.starsList}>
                    {constellation.estrellasPrincipales.map((star, index) => (
                      <div key={index} className={styles.starItem}>
                        <span className={styles.starName}>{star.nombre}</span>
                        <span className={styles.starMagnitude}>
                          Magnitud: {star.magnitud.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>📅 Mejor Época</h3>
                  <p>{constellation.mejorMes}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>📜 Mitología</h3>
                  <p>{constellation.mitologia}</p>
                </div>

                <div className={styles.detailSection}>
                  <h3>💡 Curiosidad</h3>
                  <p className={styles.curiosity}>{constellation.curiosidad}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredConstellations.length === 0 && (
        <div className={styles.noResults}>
          <span className={styles.noResultsIcon}>🔭</span>
          <p>No se encontraron constelaciones con esos criterios.</p>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => {
              setSearchTerm('');
              setSelectedType('Todas');
              setSelectedHemisphere('Todos');
            }}
          >
            Mostrar todas
          </button>
        </div>
      )}

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre las constelaciones?"
        subtitle="Descubre la historia de la astronomía, cómo localizar constelaciones y curiosidades celestes"
        icon="🔭"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es una Constelación?</h2>
          <p className={styles.introParagraph}>
            Una constelación es un grupo de estrellas que, vistas desde la Tierra, parecen formar
            un patrón o figura en el cielo. Aunque las estrellas de una constelación pueden estar
            a distancias muy diferentes de nosotros, su alineación visual ha permitido a las
            civilizaciones antiguas crear mapas del cielo y desarrollar mitos y leyendas.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>♈ Constelaciones Zodiacales</h4>
              <p>
                Son las 12 constelaciones por donde pasa la eclíptica, el camino aparente del Sol
                en el cielo. Cada mes, el Sol parece atravesar una de estas constelaciones, lo que
                dio origen a los signos del zodíaco.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🌟 Constelaciones Boreales</h4>
              <p>
                Visibles principalmente desde el hemisferio norte. Incluyen algunas de las más
                famosas como la Osa Mayor, Casiopea y Orión. Muchas fueron catalogadas por
                los antiguos griegos.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>✨ Constelaciones Australes</h4>
              <p>
                Visibles principalmente desde el hemisferio sur. Muchas fueron catalogadas por
                exploradores europeos en los siglos XV-XVIII, como la Cruz del Sur, que guiaba
                a los navegantes hacia el polo sur.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📐 Las 88 Constelaciones Oficiales</h4>
              <p>
                En 1922, la Unión Astronómica Internacional (UAI) estableció oficialmente
                88 constelaciones que cubren todo el cielo. Cada punto del cielo pertenece
                a una y solo una constelación.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Cómo Observar el Cielo Nocturno</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🌑 Busca Cielos Oscuros</h4>
              <p>
                Aléjate de la contaminación lumínica de las ciudades. Una noche sin luna es
                ideal para ver las estrellas más débiles y apreciar la Vía Láctea.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>👁️ Adapta tus Ojos</h4>
              <p>
                Tus ojos necesitan 20-30 minutos para adaptarse a la oscuridad. Evita mirar
                pantallas brillantes o luces blancas; usa luz roja si necesitas iluminación.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🧭 Oriéntate con la Polar</h4>
              <p>
                En el hemisferio norte, localiza la Estrella Polar siguiendo las dos estrellas
                del extremo de la Osa Mayor. Esta estrella indica siempre el norte.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📱 Usa Apps de Astronomía</h4>
              <p>
                Aplicaciones como Stellarium o Star Walk te permiten apuntar al cielo y
                ver en tiempo real qué constelaciones estás observando.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Magnitud Estelar</h2>
          <p className={styles.introParagraph}>
            La magnitud es la medida del brillo aparente de una estrella vista desde la Tierra.
            Cuanto menor es el número, más brillante es la estrella. El sistema fue creado por
            el astrónomo griego Hiparco en el siglo II a.C.
          </p>
          <ul className={styles.magnitudeList}>
            <li><strong>Magnitud -1 a 0:</strong> Estrellas muy brillantes (Sirio: -1.46)</li>
            <li><strong>Magnitud 1:</strong> Estrellas de primera magnitud (las más brillantes visibles)</li>
            <li><strong>Magnitud 2-3:</strong> Fácilmente visibles a simple vista</li>
            <li><strong>Magnitud 4-5:</strong> Visibles en cielos oscuros</li>
            <li><strong>Magnitud 6:</strong> Límite de visión a simple vista</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('constelaciones-del-cielo')} />
      <Footer appName="constelaciones-del-cielo" />
    </div>
  );
}
