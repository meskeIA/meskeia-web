'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ConstelacionesDelCielo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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

        <section>
          <h3>🏛️ Tradiciones Astronómicas del Mundo</h3>
          <p>Las constelaciones modernas proceden de la astronomía griega, pero otras civilizaciones desarrollaron sus propios sistemas celestes:</p>
          <div className={styles.eduTableWrapper}>
            <table className={styles.eduTable}>
              <thead>
                <tr>
                  <th>Civilización</th>
                  <th>Época</th>
                  <th>Nº Constelaciones</th>
                  <th>Uso Principal</th>
                  <th>Legado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mesopotamia</strong></td>
                  <td>~3000 a.C.</td>
                  <td>~18 (zodiaco)</td>
                  <td>Astrología y calendario</td>
                  <td>Origen del zodiaco occidental</td>
                </tr>
                <tr>
                  <td><strong>Grecia clásica</strong></td>
                  <td>~600 a.C.</td>
                  <td>48 (Ptolomeo)</td>
                  <td>Navegación y mitología</td>
                  <td>Base de las 88 actuales (IAU)</td>
                </tr>
                <tr>
                  <td><strong>China imperial</strong></td>
                  <td>~500 a.C.</td>
                  <td>283 mansiones</td>
                  <td>Calendario agrícola</td>
                  <td>Registro histórico de supernovas</td>
                </tr>
                <tr>
                  <td><strong>Mundo árabe</strong></td>
                  <td>800–1200 d.C.</td>
                  <td>Catálogos estelares</td>
                  <td>Navegación y ciencia</td>
                  <td>Nombres de estrellas (Aldebarán, Rigel...)</td>
                </tr>
                <tr>
                  <td><strong>Polinesia</strong></td>
                  <td>~1000 d.C.</td>
                  <td>Variable</td>
                  <td>Navegación oceánica</td>
                  <td>Técnicas wayfinding sin instrumentos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 ¿Para Qué Sirven las Constelaciones Hoy?</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🧭</span>
              <h4>Navegación Histórica</h4>
              <p>Durante siglos, marineros y exploradores usaron constelaciones como la Cruz del Sur y la Estrella Polar para determinar su posición en el mar con precisión de grados.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌾</span>
              <h4>Calendario Agrícola</h4>
              <p>En la antigüedad, la aparición de ciertas constelaciones marcaba las estaciones de siembra y cosecha. Las Pléyades en Orión indicaban el inicio de la primavera en Grecia.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🔭</span>
              <h4>Astronomía Moderna (IAU)</h4>
              <p>Las 88 constelaciones oficiales dividen el cielo como un sistema de coordenadas. Los astrónomos las usan para indicar la posición de objetos celestes, nebulosas y galaxias.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🎓</span>
              <h4>Educación y Divulgación</h4>
              <p>Las constelaciones son la puerta de entrada a la astronomía: son reconocibles a simple vista, tienen historias memorables y permiten aprender mitología griega al mismo tiempo.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Constelaciones</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la diferencia entre una constelación y un asterismo?</summary>
              <p className={styles.eduFaqAnswer}>Una <strong>constelación</strong> es una de las 88 regiones oficiales del cielo definidas por la IAU. Un <strong>asterismo</strong> es un patrón de estrellas reconocible pero no oficial, como el Cinturón de Orión o el Carro (parte de la Osa Mayor). Todo asterismo está dentro de una constelación, pero no toda constelación tiene un asterismo famoso.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Por qué exactamente 88 constelaciones?</summary>
              <p className={styles.eduFaqAnswer}>En 1922, la Unión Astronómica Internacional estandarizó las 48 constelaciones de Ptolomeo y añadió 40 más descritas por astrónomos europeos de los siglos XV-XVIII para cubrir el cielo austral (invisible desde el Mediterráneo). El número 88 no tiene significado especial; simplemente fue la consolidación del trabajo histórico acumulado.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Las 12 constelaciones del zodiaco son los signos astrológicos?</summary>
              <p className={styles.eduFaqAnswer}>No exactamente. Los 12 signos astrológicos se fijaron hace ~2000 años, pero debido a la <strong>precesión de los equinoccios</strong>, el Sol ahora pasa por 13 constelaciones (incluyendo Ofiuco) y lo hace en fechas distintas a las de la astrología. La astronomía y la astrología son disciplinas completamente separadas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>Si las estrellas se mueven, ¿las constelaciones cambian con el tiempo?</summary>
              <p className={styles.eduFaqAnswer}>Sí, aunque muy lentamente. Las estrellas tienen <strong>movimiento propio</strong> y dentro de ~100.000 años, la Osa Mayor tendrá una forma completamente diferente. En la escala humana (siglos), los cambios son imperceptibles, pero los astrónomos los miden con precisión de microsegundos de arco.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Qué es la precesión de los equinoccios?</summary>
              <p className={styles.eduFaqAnswer}>La Tierra no gira perfectamente recta: su eje traza un cono completo cada ~26.000 años (como un trompo). Esto hace que el polo norte celeste «cambie» de estrella: ahora apunta a Polaris, pero hace 5.000 años apuntaba a Thuban. También desplaza los puntos equinocciales a lo largo del zodiaco, causando el desfase entre los signos astrológicos y las constelaciones reales.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Las estrellas de una constelación están cerca entre sí en el espacio?</summary>
              <p className={styles.eduFaqAnswer}>No. Es una proyección visual desde la Tierra. En Orión, Betelgeuse está a ~700 años luz y Rigel a ~860 años luz — están separadas enormemente en el espacio 3D. Solo parecen «juntas» porque las vemos desde nuestra perspectiva bidimensional en el cielo nocturno.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cómo se nombran las estrellas dentro de una constelación?</summary>
              <p className={styles.eduFaqAnswer}>El sistema más usado es la <strong>Designación de Bayer</strong> (1603): letras griegas (α, β, γ...) seguidas del nombre latino de la constelación en genitivo. α Orionis = Betelgeuse (la más brillante de Orión). También existe la Designación de Flamsteed (números), catálogos modernos (HD, HIP) y nombres propios aprobados por la IAU para las más importantes.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqQuestion}>¿Cuál es la constelación más grande y la más pequeña?</summary>
              <p className={styles.eduFaqAnswer}><strong>Más grande</strong>: Hydra (La Hidra) con 1.303 grados cuadrados — ocupa el 3,16% del cielo total. <strong>Más pequeña</strong>: Crux (La Cruz del Sur) con solo 68 grados cuadrados, aunque es una de las más reconocibles del hemisferio sur y figura en 4 banderas nacionales.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Localizar Constelaciones: Guía Práctica</h3>
          <ol className={styles.eduStepsList}>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>1</span>
              <div>
                <strong>Oriéntate con la Estrella Polar</strong>
                <p>En el hemisferio norte, localiza las dos estrellas del «cucharón» de la Osa Mayor (Dubhe y Merak) y traza una línea recta 5 veces su distancia: llegas a Polaris, que siempre indica el norte.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>2</span>
              <div>
                <strong>Identifica patrones reconocibles primero</strong>
                <p>Empieza por formas simples: el cuadrado de Pegaso, el «W» de Casiopea, el trapecio de Orión con su cinturón de 3 estrellas. Una vez reconocidos, úsalos como ancla para encontrar constelaciones vecinas.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>3</span>
              <div>
                <strong>Adapta tus ojos a la oscuridad</strong>
                <p>Necesitas 20-30 minutos sin luz blanca para que tus pupilas se dilaten al máximo. Usa linterna roja si necesitas iluminación — la luz roja no arruina la adaptación a la oscuridad.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>4</span>
              <div>
                <strong>Elige la época correcta</strong>
                <p>Cada constelación tiene su «mejor mes» cuando está más alta en el cielo a medianoche. Orión es invernal (dic-feb), Escorpio estival (jun-ago). Fuera de temporada puedes verlas, pero más bajas y menos horas.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>5</span>
              <div>
                <strong>Usa una app de realidad aumentada</strong>
                <p>Stellarium Mobile, SkySafari o Star Walk permiten apuntar el teléfono al cielo y ver las constelaciones superpuestas en tiempo real. Ideal para principiantes. Activa el modo noche (pantalla roja) para preservar la visión.</p>
              </div>
            </li>
            <li className={styles.eduStep}>
              <span className={styles.eduStepNum}>6</span>
              <div>
                <strong>El telescopio no es imprescindible</strong>
                <p>Las constelaciones se observan a simple vista — el telescopio magnifica tanto que solo ves una pequeña parte del cielo. Los prismáticos 7×50 o 10×50 son la herramienta ideal: revelan cúmulos estelares y nebulosas dentro de las constelaciones sin perder el contexto visual.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Consejos para Observadores de Constelaciones</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌑</span>
              <h4>Luna nueva = mejor noche</h4>
              <p>La Luna llena ilumina el cielo tanto que oculta las estrellas débiles. Planifica tus sesiones de observación en los días cercanos a luna nueva.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🗺️</span>
              <h4>Usa mapas estelares estacionales</h4>
              <p>Descarga o imprime el mapa estelar del mes actual. Girandolo para que el sur esté arriba si observas hacia el sur del hemisferio norte.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📍</span>
              <h4>Anota tus coordenadas</h4>
              <p>La visibilidad de constelaciones depende de tu latitud. Desde España (40°N) ves bien el hemisferio norte y parte del sur; desde Argentina (35°S) ves la Cruz del Sur perfectamente.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>🌬️</span>
              <h4>Condiciones atmosféricas importan</h4>
              <p>El «seeing» (estabilidad del aire) afecta la nitidez. Las noches frías y despejadas tras un frente frío son ideales. La humedad y el calor crean turbulencias que difuminan las estrellas.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>📚</span>
              <h4>Aprende la mitología</h4>
              <p>Asociar cada constelación con su historia mitológica hace que sea imposible olvidarla. Orión el cazador, Perseus rescatando a Andrómeda, Escorpio matando a Orión — son mnemotecnias perfectas.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcon}>👥</span>
              <h4>Únete a clubes de astronomía</h4>
              <p>Las sociedades astronómicas locales organizan noches de observación con telescopios profesionales. En España: Agrupación Astronómica de Madrid (AAM), Grup d&apos;Estudis Astronòmics (GEA) en Cataluña.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.eduWarningBox}>
            <span className={styles.eduWarningIcon}>⚠️</span>
            <div>
              <strong>Errores comunes a evitar</strong>
              <ul>
                <li><strong>Confundir asterismo con constelación</strong>: El «Carro» no es una constelación oficial — es un asterismo dentro de la Osa Mayor. La Cruz del Sur (Crux) sí es una constelación oficial.</li>
                <li><strong>Creer que las estrellas de una constelación están juntas</strong>: Solo son vecinas en la proyección 2D del cielo. En el espacio 3D pueden estar a cientos de años luz de distancia entre sí.</li>
                <li><strong>Mezclar astrología con astronomía</strong>: La astronomía es una ciencia empírica; la astrología es un sistema de creencias. Las fechas de los signos astrológicos no coinciden con las constelaciones reales debido a la precesión.</li>
                <li><strong>Ignorar la contaminación lumínica</strong>: Desde una ciudad, solo verás unas pocas decenas de estrellas. En un cielo rural oscuro puedes ver 3.000–5.000 estrellas a simple vista. La diferencia es enorme.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── SECCIONES v2.0 ── */}

        {/* 1. Tabla Comparativa */}
        <section>
          <h3>🌟 Constelaciones Principales Visibles desde España</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Constelación</th>
                  <th>Mejor mes</th>
                  <th>Estrella más brillante</th>
                  <th>Hemisferio</th>
                  <th>Dificultad (1-5)</th>
                  <th>Mitología principal</th>
                  <th>Objeto Messier destacado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Orión</strong></td>
                  <td>Enero</td>
                  <td>Rigel (0,13)</td>
                  <td>Ecuatorial</td>
                  <td>1 — Muy fácil</td>
                  <td>Cazador gigante de la mitología griega</td>
                  <td>M42 — Nebulosa de Orión</td>
                </tr>
                <tr>
                  <td><strong>Osa Mayor</strong></td>
                  <td>Abril</td>
                  <td>Alioth (1,76)</td>
                  <td>Norte</td>
                  <td>1 — Muy fácil</td>
                  <td>Calisto transformada en osa por Zeus</td>
                  <td>M81/M82 — Galaxias de Bode</td>
                </tr>
                <tr>
                  <td><strong>Casiopea</strong></td>
                  <td>Noviembre</td>
                  <td>Schedar (2,24)</td>
                  <td>Norte</td>
                  <td>1 — Muy fácil</td>
                  <td>Reina etíope vanidosa castigada por Poseidón</td>
                  <td>M52 — Cúmulo abierto</td>
                </tr>
                <tr>
                  <td><strong>Escorpio</strong></td>
                  <td>Julio</td>
                  <td>Antares (1,06)</td>
                  <td>Sur</td>
                  <td>2 — Fácil</td>
                  <td>Escorpión enviado por Gea para matar a Orión</td>
                  <td>M6/M7 — Cúmulos de la Mariposa</td>
                </tr>
                <tr>
                  <td><strong>Leo</strong></td>
                  <td>Abril</td>
                  <td>Régulo (1,35)</td>
                  <td>Norte/Ecuatorial</td>
                  <td>2 — Fácil</td>
                  <td>León de Nemea vencido por Hércules</td>
                  <td>M65/M66 — Galaxias del Trío de Leo</td>
                </tr>
                <tr>
                  <td><strong>Centauro / Cruz del Sur</strong></td>
                  <td>Mayo</td>
                  <td>Alfa Centauri (-0,27)</td>
                  <td>Sur</td>
                  <td>3 — Moderado (baja en el horizonte)</td>
                  <td>Quirón, sabio centauro tutor de héroes</td>
                  <td>Omega Centauri (NGC 5139)</td>
                </tr>
                <tr>
                  <td><strong>Virgo</strong></td>
                  <td>Mayo</td>
                  <td>Spica (0,97)</td>
                  <td>Ecuatorial</td>
                  <td>3 — Moderado</td>
                  <td>Deméter, diosa de la cosecha</td>
                  <td>M87 — Galaxia con agujero negro fotografiado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso */}
        <section>
          <h3>🎯 ¿Quién Usa esta Herramienta y Para Qué?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon}>🔭</span>
              <div className={styles.escenarioHeader}>Astrónomo aficionado</div>
              <p className={styles.escenarioExample}>Aprendiendo a orientarse en el cielo nocturno por primera vez, identificando las constelaciones circumpolares visibles todo el año desde su localidad.</p>
              <p className={styles.escenarioTip}>Empieza con la Osa Mayor y Casiopea: son circum­polares desde España y visibles cualquier noche despejada.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon}>👩‍🏫</span>
              <div className={styles.escenarioHeader}>Profesor de ciencias</div>
              <p className={styles.escenarioExample}>Preparando una actividad práctica de astronomía para alumnos de secundaria, con fichas de cada constelación, su mitología y estrellas principales.</p>
              <p className={styles.escenarioTip}>Combina la tabla de magnitudes con la sección mitológica: aprenden astronomía y cultura clásica al mismo tiempo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon}>🧭</span>
              <div className={styles.escenarioHeader}>Senderista o navegante</div>
              <p className={styles.escenarioExample}>Usando las estrellas como referencia de orientación en rutas nocturnas o en travesías marítimas sin GPS disponible.</p>
              <p className={styles.escenarioTip}>La Estrella Polar (Polaris) indica el norte con precisión de menos de 1°. Localízala desde la Osa Mayor en menos de 30 segundos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon}>📷</span>
              <div className={styles.escenarioHeader}>Fotógrafo de astrofotografía</div>
              <p className={styles.escenarioExample}>Buscando composiciones para fotografiar el cielo nocturno: identificar qué constelaciones estarán visibles en su ventana de disparo y qué objetos Messier contienen.</p>
              <p className={styles.escenarioTip}>Orión en invierno y el Escorpión en verano ofrecen las nebulosas más fotogénicas desde España con equipos de entrada.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <h3>❓ Preguntas Frecuentes: Observación de Constelaciones</h3>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>¿Cuántas constelaciones hay reconocidas oficialmente?</summary>
              <p>La Unión Astronómica Internacional (UAI) reconoce exactamente <strong>88 constelaciones</strong> desde 1930. Cubren la totalidad del cielo: desde el polo norte celeste hasta el polo sur, sin dejar ninguna zona sin asignar. Sus límites son líneas rectas en coordenadas ecuatoriales de la época 1875.</p>
              <p className={styles.faqTip}>Dato curioso: de las 88, solo 48 vienen de la antigüedad grecolatina. Las otras 40 fueron añadidas en los siglos XVII y XVIII por astrónomos europeos para cartografiar el cielo austral.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Por qué las constelaciones cambian según la estación?</summary>
              <p>La Tierra orbita alrededor del Sol, por lo que la zona de cielo nocturno que «miramos» cambia mes a mes. En invierno, la Tierra queda orientada hacia Orión; en verano, hacia el Escorpión. Las <strong>constelaciones circumpolares</strong> (como la Osa Mayor desde España) son visibles todo el año porque están cerca del polo celeste.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo encuentro la Estrella Polar desde España?</summary>
              <p>Localiza las dos estrellas del borde del «cazo» de la Osa Mayor (Dubhe y Merak, las más alejadas del mango). Traza una línea recta desde Merak pasando por Dubhe y prolóngala unas <strong>5 veces esa distancia</strong>: llegarás a Polaris, la Estrella Polar, que siempre indica el norte geográfico con menos de 1° de error.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué diferencia hay entre constelación y asterismo?</summary>
              <p>Una <strong>constelación</strong> es una de las 88 regiones oficiales del cielo definidas por la UAI, con límites precisos. Un <strong>asterismo</strong> es un patrón de estrellas reconocible pero no oficial: el Cinturón de Orión (3 estrellas), el Carro (parte de la Osa Mayor) o las Pléyades son asterismos. Todo asterismo está dentro de una o varias constelaciones.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Las constelaciones se ven igual desde todo el mundo?</summary>
              <p>No exactamente. La forma de las constelaciones es la misma desde cualquier punto de la Tierra, pero <strong>la visibilidad cambia con la latitud</strong>. Desde España (40°N) ves bien todas las constelaciones boreales y parte de las australes. La Cruz del Sur, perfectamente visible en Argentina o Australia, apenas asoma por el horizonte desde el sur de España en mayo.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué es la eclíptica y las constelaciones del zodíaco?</summary>
              <p>La <strong>eclíptica</strong> es el camino aparente que el Sol traza en el cielo a lo largo del año. Las constelaciones por las que pasa esta línea son las <strong>zodiacales</strong>: actualmente son 13 (incluyendo Ofiuco, ignorado por la astrología tradicional). Cada mes el Sol aparece proyectado sobre una de ellas, lo que en la antigüedad dio origen al calendario y a los signos astrológicos.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cuál es la constelación más grande del cielo?</summary>
              <p><strong>Hydra (La Hidra)</strong> es la constelación más extensa con 1.303 grados cuadrados, ocupando el 3,16% del cielo total. Se extiende unos 100° en longitud. Sin embargo, a pesar de su gran tamaño, no contiene ninguna estrella especialmente brillante, lo que la hace difícil de reconocer. La más pequeña es Crux (Cruz del Sur) con solo 68 grados cuadrados.</p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Qué necesito para observar constelaciones?</summary>
              <p>¡Nada especial! Las constelaciones se observan <strong>a simple vista</strong>. Lo que necesitas es: alejarte de la contaminación lumínica (al menos 20-30 km de ciudad), esperar 20 minutos para adaptar la vista a la oscuridad, y una noche despejada sin luna llena. Los prismáticos 7×50 o 10×50 son un complemento excelente para ver cúmulos y nebulosas dentro de las constelaciones.</p>
            </details>
          </div>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section>
          <h3>📋 Cómo Preparar tu Primera Sesión de Observación</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Aléjate de la contaminación lumínica</strong>
                <p>Desplázate al menos 20-30 km de un núcleo urbano. Usa mapas de contaminación lumínica (lightpollutionmap.info) para encontrar zonas con cielo oscuro cerca de tu ubicación. La diferencia entre ver 200 estrellas y 3.000 está en la oscuridad del lugar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Espera 20-30 minutos para adaptar la vista a la oscuridad</strong>
                <p>La rodopsina, el pigmento que permite la visión nocturna, tarda hasta 30 minutos en alcanzar su máxima sensibilidad. Evita cualquier luz blanca durante este período. Si necesitas iluminación, usa una linterna con filtro rojo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Identifica los puntos cardinales</strong>
                <p>Usa la brújula del móvil (en modo avión para no arruinar la adaptación) o consulta previamente la orientación del lugar. Saber dónde está el norte te permite ubicar correctamente las constelaciones en el cielo según los mapas estelares.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Localiza constelaciones circumpolares (visibles todo el año)</strong>
                <p>Desde España, la Osa Mayor, Osa Menor, Casiopea, Cefeo y el Dragón son circum­polares: nunca se ponen bajo el horizonte. Son tu referencia permanente en el cielo norte y los mejores puntos de partida para orientarte.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Usa la Osa Mayor para encontrar la Estrella Polar</strong>
                <p>Las dos estrellas del borde del cazo (Dubhe y Merak) apuntan hacia Polaris. Una vez localizada, tienes el norte exacto. Desde la Polar puedes trazar líneas hacia otras constelaciones: Casiopea está al otro lado, a la misma distancia.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Identifica constelaciones estacionales</strong>
                <p>Según el mes, busca las constelaciones de temporada: Orión en invierno (enero), Leo en primavera (abril), el Triángulo de Verano (Vega, Deneb, Altair) en julio-agosto, y el Cuadrado de Pegaso en otoño (octubre).</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Usa una app o carta estelar para guiarte</strong>
                <p>Stellarium Mobile, SkySafari o Star Walk muestran las constelaciones en tiempo real apuntando con el teléfono. Activa el modo nocturno (pantalla roja) para no perder la adaptación a la oscuridad. Una carta estelar impresa es la alternativa sin pantalla.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores Prácticas */}
        <section>
          <h3>💡 Mejores Prácticas para Observar el Cielo Nocturno</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔴</span>
              <h4>Luz roja para preservar la visión nocturna</h4>
              <p>La luz roja (longitud de onda larga) no activa los conos ni destruye la rodopsina. Usa una linterna con filtro rojo o cinta roja sobre la frontal. Nunca uses luz blanca ni mires el móvil en brillo normal durante la sesión.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌑</span>
              <h4>Noches sin luna para mayor visibilidad</h4>
              <p>La Luna llena puede iluminar el cielo tanto como el crepúsculo, ocultando estrellas débiles y la Vía Láctea. Planifica tus sesiones en los 5-7 días alrededor de la luna nueva para maximizar el número de estrellas visibles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏙️</span>
              <h4>Alejarse al menos 30 km del núcleo urbano</h4>
              <p>La contaminación lumínica cae de forma exponencial con la distancia. A 30 km de una ciudad media española ya puedes ver la Vía Láctea. A 60-80 km, el cielo se vuelve verdaderamente oscuro con magnitudes límite de 6,5 a simple vista.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛌</span>
              <h4>Tumbarse en el suelo mirando al cielo</h4>
              <p>Observar de pie con el cuello hacia atrás es incómodo y cansa en minutos. Usa una esterilla, silla reclinable o tumbona para mantener la cabeza hacia arriba. La comodidad alarga la sesión y mejora la concentración en el cielo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔭</span>
              <h4>Binoculares antes que telescopio para aprender</h4>
              <p>Un telescopio magnifica tanto que solo ves una pequeña porción del cielo, perdiendo el contexto. Los prismáticos 7×50 o 10×50 revelan cúmulos estelares, las Pléyades con detalle y la Vía Láctea resuelta en estrellas, manteniendo el campo visual necesario para aprender.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>❄️</span>
              <h4>El invierno ofrece el cielo más claro y oscuro</h4>
              <p>Las noches de invierno son más largas, el aire frío y seco produce menos turbulencias atmosféricas («seeing» excelente) y la Vía Láctea no está de frente. Orión, Géminis, Tauro y el Can Mayor son espectaculares de diciembre a febrero. Abrígate bien: el frío nocturno es mayor de lo esperado.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box v2.0 */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>6 errores que arruinan la observación de constelaciones</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Mirar el móvil en modo brillante</strong>: Destruye instantáneamente la adaptación a la oscuridad que has tardado 20-30 minutos en conseguir. Activa siempre el modo nocturno (pantalla roja) o pon el brillo al mínimo.</li>
              <li><strong>Confiar en que hay poca contaminación lumínica sin verificarlo</strong>: Lo que parece «campo» a la vista puede tener un índice Bortle 5-6 por ciudades cercanas. Verifica siempre en lightpollutionmap.info antes de desplazarte.</li>
              <li><strong>Ir sin ropa de abrigo suficiente</strong>: El frío nocturno bajo cielos despejados es mucho mayor de lo esperado. El cielo despejado irradia calor hacia el espacio: aunque de día hiciera 15°C, a medianoche en campo abierto puedes tener 2-4°C.</li>
              <li><strong>No verificar el pronóstico meteorológico y la fase lunar</strong>: Nubes o luna llena arruinan completamente la sesión. Consulta la cobertura nubosa horaria (Meteoblue es excelente) y el calendario lunar con antelación.</li>
              <li><strong>Confundir planetas brillantes con estrellas</strong>: Venus, Júpiter o Marte pueden ser los objetos más brillantes del cielo nocturno. La diferencia: los planetas brillan con luz estable (no parpadean) y se mueven respecto a las estrellas de fondo a lo largo de los días.</li>
              <li><strong>Intentar ver «todos los objetos» la primera vez</strong>: La sobrecarga de información frustra a los principiantes. Empieza solo con 3-4 constelaciones sencillas (Osa Mayor, Orión, Casiopea, Cruz del Sur si va al sur) y domínalas antes de ampliar.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('constelaciones-del-cielo')} />
      <ShareCard appName="constelaciones-del-cielo" />
      <Footer appName="constelaciones-del-cielo" />
    </div>
  );
}
