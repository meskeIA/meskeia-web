'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './InstrumentosMusicales.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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

        {/* Tabla Comparativa: Familias de Instrumentos */}
        <section className={styles.guideSection}>
          <h2>⚖️ Comparativa de Familias de Instrumentos</h2>
          <p className={styles.introParagraph}>
            Cada familia tiene características propias que determinan su timbre, versatilidad y contexto de uso. Esta tabla te ayuda a elegir qué estudiar o qué instrumento incorporar a una composición.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>🎻 Cuerda</th>
                  <th>🎷 Viento</th>
                  <th>🥁 Percusión</th>
                  <th>🎹 Teclado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Producción del sonido</strong></td>
                  <td>Vibración de cuerdas (frotadas, pulsadas)</td>
                  <td>Vibración de columna de aire</td>
                  <td>Golpe sobre membrana o cuerpo</td>
                  <td>Cuerdas + martillo (piano) o tubos (órgano)</td>
                </tr>
                <tr>
                  <td><strong>Material principal</strong></td>
                  <td>Madera, metal, tripa sintética</td>
                  <td>Madera o metal según subfamilia</td>
                  <td>Madera, metal, piel animal o sintética</td>
                  <td>Madera, metal, cuerdas de acero</td>
                </tr>
                <tr>
                  <td><strong>Dificultad inicial</strong></td>
                  <td>Alta (afinación manual)</td>
                  <td>Media-Alta (embocadura)</td>
                  <td>Media (coordinación)</td>
                  <td>Media (teclas fijas, afinación automática)</td>
                </tr>
                <tr>
                  <td><strong>Precio de inicio</strong></td>
                  <td>150-600 € (guitarra) / 800 € (violín)</td>
                  <td>100-400 € (flauta, saxo de iniciación)</td>
                  <td>200-800 € (batería de práctica)</td>
                  <td>200-1.000 € (teclado semipesado)</td>
                </tr>
                <tr>
                  <td><strong>Presencia en orquesta</strong></td>
                  <td>✅ Mayoritaria (60-70 músicos)</td>
                  <td>✅ Esencial (20-25 músicos)</td>
                  <td>✅ Presente (4-6 músicos)</td>
                  <td>⚠️ Opcional (piano, arpa, órgano)</td>
                </tr>
                <tr>
                  <td><strong>Géneros típicos</strong></td>
                  <td>Clásica, flamenco, jazz, folk</td>
                  <td>Clásica, jazz, banda de marcha</td>
                  <td>Jazz, rock, clásica, pop</td>
                  <td>Clásica, jazz, pop, electrónica</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Melódica y armónicamente completo</td>
                  <td>Melodía y timbre característico</td>
                  <td>Ritmo, groove y acentuación</td>
                  <td>Armonía, acompañamiento, composición</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 ¿Cómo usar este atlas de instrumentos?</h2>
          <p className={styles.introParagraph}>
            Distintos perfiles obtienen un valor diferente según sus objetivos musicales o académicos.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Estudiante de conservatorio o solfeo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Filtrar familia "Viento Madera" → repasar oboe, corno inglés, fagot → asociar cada uno con su clave de notación antes del examen de lenguaje musical</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Las subfamilias y los materiales ayudan a entender por qué instrumentos de metal (saxofón) están en viento-madera. Conceptos que generan confusión en primero de conservatorio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎧</span>
                <h3>Melómano o aficionado a la música clásica</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Buscar "oboe" → ver descripción y curiosidades → entender por qué da la nota de afinación a la orquesta antes de cada concierto</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Las curiosidades contextualizan cada instrumento en su historia y uso real. Enriquece la experiencia de escucha y permite identificar timbres en grabaciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍🏫</span>
                <h3>Docente de música en primaria o secundaria</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Proyectar en clase → filtrar "Percusión" → mostrar los 8 instrumentos de percusión uno a uno → actividad: ¿qué tienen en común el xilófono y los timbales?</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> La interfaz visual y los filtros permiten dinámicas de clase interactivas. Los alumnos pueden explorar desde sus móviles, convirtiendo el repaso en una actividad participativa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎼</span>
                <h3>Compositor o productor musical</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Uso típico:</strong></p>
                <code>Filtrar por registro "Grave" → ver contrabajo, tuba, fagot, timbales → elegir qué instrumento acústico emular con samples en una producción orquestal</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Conocer el registro, los materiales y la época de origen de cada instrumento ayuda a elegir timbres convincentes y a entender qué esperar de cada sección orquestal.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre Instrumentos Musicales</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el saxofón está en viento-madera si es de metal?</h4>
              <p>
                La clasificación en madera o metal no depende del material, sino del mecanismo de producción del sonido. Los instrumentos de viento-madera usan lengüeta (caña) o bisel para producir la vibración del aire. El saxofón usa lengüeta simple, igual que el clarinete, por lo que es "madera" aunque esté fabricado en latón. La trompeta y el trombón son "metal" porque usan los labios directamente como embocadura.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Si tiene caña (lengüeta), es viento-madera. Si usa embocadura de copa donde los labios vibran directamente, es viento-metal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿El piano es de cuerda o de teclado?</h4>
              <p>
                En la clasificación de Hornbostel-Sachs, el piano es un cordófono (instrumento de cuerda) porque el sonido se produce por cuerdas que vibran. El mecanismo de teclado acciona unos martillos que golpean las cuerdas. En el uso cotidiano se le clasifica como "teclado" por comodidad. El clavicémbalo (clavecín) también es de cuerda-teclado, pero en lugar de golpear, pulsa las cuerdas con plumas (plectros).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Curiosidad:</strong> El piano tiene 230 cuerdas aproximadamente: las notas graves tienen 1 cuerda, las medias 2 y las agudas 3. El total de cuerdas produce la riqueza armónica característica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es la diferencia entre violín y viola?</h4>
              <p>
                El violín es más pequeño (cuerpo ~35 cm) y suena en registro agudo (Do3-La7). La viola es más grande (~42 cm) y suena en registro medio (Do3-Fa6), con un timbre más oscuro y cálido. En la orquesta, los violines llevan la melodía principal; las violas dan cuerpo armónico. La viola usa la clave de Do (en 3.ª línea), lo que da lugar al chiste de que los violistas "no saben leer en clave de sol".
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Para reconocerlos de oído:</strong> El violín suena brillante y penetrante. La viola tiene un timbre más "nasal" y ligeramente oscuro. En una partitura: violín = clave de sol, viola = clave de do.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es el instrumento más antiguo conocido?</h4>
              <p>
                Las flautas de hueso encontradas en la cueva de Hohle Fels (Alemania) tienen 40.000-43.000 años de antigüedad, siendo los instrumentos musicales más antiguos conocidos. Están fabricadas con hueso de buitre y tienen 4-5 agujeros. Anteriores a la cerámica y la escritura, demuestran que la música es una expresión fundamental de la humanidad. Las flautas de caña y los tambores de percusión también se desarrollaron de forma independiente en distintas culturas.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Dato comparativo:</strong> La lira de Ur (Mesopotamia) tiene solo 4.500 años, y el piano moderno nació en 1709 con Bartolomeo Cristofori. El violín tal como lo conocemos se perfeccionó en el siglo XVI en Cremona (Italia).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el oboe da la nota de afinación a la orquesta?</h4>
              <p>
                Antes de un concierto, el oboe toca la nota La (440 Hz) y toda la orquesta afina a partir de ella. La razón histórica es que el oboe es difícil de afinar rápidamente (su mecanismo de caña doble es sensible a la temperatura y humedad), por lo que era más práctico que todos los demás afinaran con él como referencia. Además, su timbre penetrante se escucha claramente sobre el resto de instrumentos afinando simultáneamente.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Curiosidad estándar:</strong> La frecuencia de afinación de La ha variado históricamente. Bach componía con La a ~415 Hz (barroco), la época romántica subió hasta 450 Hz, y en 1939 se fijó internacionalmente en 440 Hz.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es el instrumento más difícil de aprender?</h4>
              <p>
                Depende del criterio. Por dificultad técnica inicial: el violín (afinación completamente manual, postura compleja). Por complejidad avanzada: el órgano (manos, pies y múltiples teclados simultáneos). Por control de embocadura: la trompa (pequeña embocadura, rango amplio de notas). El oboe y el fagot también son famosos por su dificultad. El piano y la guitarra son considerados los más accesibles para comenzar.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Perspectiva real:</strong> El instrumento "más difícil" es siempre el que no has aprendido. Con práctica constante (30-60 min/día), cualquier instrumento es accesible. El tiempo hasta el nivel intermedio varía: guitarra ~1 año, violín ~3-4 años, piano ~2-3 años.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre flauta traversa y flauta de pico?</h4>
              <p>
                La flauta traversa (o travesera) se sujeta horizontalmente y produce el sonido soplando sobre un agujero lateral (bisel). Es el instrumento estándar de las orquestas modernas, con un rango de 3 octavas (Do4-Re7). La flauta de pico (recorder) se sujeta verticalmente y se sopla por la boquilla superior. Es más fácil de tocar pero tiene menor volumen y expresividad. Fue el instrumento de viento-madera predominante hasta el siglo XVIII.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>En la educación:</strong> La flauta de pico es el instrumento más enseñado en los colegios españoles por su bajo coste (5-20 €) y accesibilidad. La traversa cuesta desde 150 € en modelos de iniciación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Los instrumentos electrónicos son solo modernos?</h4>
              <p>
                No. El theremin fue inventado por León Theremin en 1920 y es uno de los primeros instrumentos electrónicos. Se toca sin contacto físico, moviendo las manos cerca de dos antenas. El órgano Hammond data de 1934 y fue el pilar del jazz y el gospel. Los primeros sintetizadores (Moog) llegaron en los años 60. La guitarra eléctrica se popularizó en los 50 con Les Paul y Leo Fender, revolucionando el rock and roll.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Dato curioso:</strong> El theremin fue el primer instrumento controlado sin contacto físico y sigue usándose en bandas sonoras de cine de terror y ciencia ficción. El tema de Star Trek original usa un theremin.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Cómo aprender a reconocer instrumentos de oído</h2>
          <p className={styles.introParagraph}>
            Desarrollar el oído para identificar instrumentos mejora la comprensión musical y el disfrute de conciertos, grabaciones y películas. Esta guía te lleva de cero al reconocimiento avanzado.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Empieza por las 4 grandes familias orquestales</h4>
                <p>
                  Antes de distinguir instrumentos individuales, aprende a diferenciar el timbre de cada familia: cuerdas (cálido, sostenido), viento-madera (nasal o brillante), viento-metal (potente, brillante), percusión (puntual, rítmico). Escucha la obertura de un concierto y trata de identificar qué familia lleva la melodía en cada momento.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Asocia cada instrumento con una obra o fragmento icónico</h4>
                <p>
                  El cerebro fija mejor los timbres con contexto emocional. Violín: "Las Cuatro Estaciones" de Vivaldi. Trompeta: fanfarria de Thus Spoke Zarathustra (2001 Odisea). Flauta: "Syrinx" de Debussy. Cello: Suite nº 1 de Bach. Oboe: Concierto de Aranjuez. Con 10 fragmentos memorizados reconocerás los 10 instrumentos más comunes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Distingue dentro de cada familia usando el registro</h4>
                <p>
                  En la familia de cuerda: el más agudo es el violín, luego la viola, el violonchelo y el más grave el contrabajo. En viento-metal: trompeta (agudo), trompa (medio), trombón (medio-grave), tuba (grave). Esta jerarquía por registro aplica a todas las familias y te permite afinar el reconocimiento una vez que distingues la familia.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Practica con grabaciones orquestales con partitura visual</h4>
                <p>
                  YouTube tiene versiones de sinfonías con partitura animada que muestra qué instrumento suena en cada momento. Busca "Beethoven Symphony 5 score" o "Mozart Symphony 40 score". Ver y escuchar simultáneamente acelera el aprendizaje. Dedica 15 minutos diarios durante 30 días y notarás una mejora significativa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Usa el atlas meskeIA como referencia de estudio</h4>
                <p>
                  Cuando escuches un instrumento que no reconoces, búscalo en el atlas: filtra por familia aproximada, lee la descripción del timbre y la subfamilia. La curiosidad de cada instrumento suele mencionar su sonido característico. Complementa con una búsqueda rápida en YouTube para escuchar cómo suena en solitario.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Completa con el contexto musical (género y época)</h4>
                <p>
                  El género musical da pistas sobre los instrumentos presentes. Jazz: trompeta, saxofón, contrabajo, piano, batería. Flamenco: guitarra flamenca, cajón, palmas. Música barroca: clavecín, viola da gamba, laúd. Música electrónica: sintetizadores, samplers, theremin. El contexto cultural de cada instrumento (origen y época) te ayuda a anticipar su timbre antes de escucharlo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas para Aprender Música e Instrumentos</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎵</span>
              <h4>Aprende por familias, no todos a la vez</h4>
              <p>Domina el timbre de la familia antes de distinguir instrumentos individuales. La cuerda antes que violín/viola/cello. Reduce la carga cognitiva inicial.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎬</span>
              <h4>Asocia cada instrumento con una obra famosa</h4>
              <p>El oboe con Aranjuez, el cello con Bach, la trompeta con Miles Davis. El contexto emocional fija el timbre mucho mejor que estudiar las características técnicas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔊</span>
              <h4>Practica el reconocimiento auditivo activo</h4>
              <p>No basta con leer sobre los instrumentos: escúchalos. 10 minutos de escucha activa diaria (intentando identificar instrumentos) equivalen a horas de estudio teórico.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📍</span>
              <h4>Relaciona cada familia con su posición en la orquesta</h4>
              <p>Las cuerdas al frente, maderas detrás, metales más atrás, percusión al fondo. Esta disposición física se refleja en la mezcla sonora: las cuerdas son la "base" siempre presente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <h4>Explora instrumentos de otras culturas</h4>
              <p>El koto japonés, el sitar indio, la kora africana, el charango andino. Ampliar más allá de la orquesta occidental enriquece la comprensión musical y cultural.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📝</span>
              <h4>Aprende los instrumentos más comunes por género</h4>
              <p>Jazz: trompeta, saxo, piano, contrabajo. Rock: guitarra, bajo, batería. Clásica: cuerdas, viento, percusión. Esto permite anticipar qué escucharás antes de oír una nota.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes al Estudiar Instrumentos Musicales</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Clasificar el saxofón como viento-metal por su material:</strong> El saxofón es viento-madera porque usa lengüeta (caña). La clasificación depende del mecanismo de producción del sonido, no del material. Error muy frecuente en exámenes de conservatorio y lenguaje musical.
              </li>
              <li>
                <strong>❌ Creer que el piano es exclusivamente de teclado:</strong> En la clasificación organológica, el piano es un cordófono (vibra por cuerdas golpeadas por martillos). Clasificarlo solo como "teclado" es incompleto. El clavecín también es de cuerda-teclado, pero pulsa en vez de golpear.
              </li>
              <li>
                <strong>❌ Confundir violín y viola por apariencia:</strong> La viola es más grande (~42 cm vs ~35 cm del violín), suena más grave y oscura, y usa clave de Do en vez de Sol. En una partitura, si ves clave de Do en 3.ª línea, es viola. Error clásico en estudiantes de orquesta de cámara.
              </li>
              <li>
                <strong>❌ Pensar que "percusión" equivale solo a batería:</strong> La familia de percusión incluye instrumentos de altura definida (marimba, xilófono, timbales, vibráfono) e indefinida (caja, bombo, platillos). Los timbales sí tienen altura definida y se afinan durante el concierto.
              </li>
              <li>
                <strong>❌ Creer que los instrumentos electrónicos son una invención reciente:</strong> El theremin (1920) y el órgano Hammond (1934) son anteriores a la Segunda Guerra Mundial. Los sintetizadores analógicos Moog datan de 1964. La guitarra eléctrica se comercializó en los años 50. La electrónica lleva un siglo en la música.
              </li>
              <li>
                <strong>❌ Confundir oboe y clarinete visualmente:</strong> El oboe es más delgado y usa caña doble (dos lengüetas enfrentadas). El clarinete usa caña simple y tiene una campana más pronunciada. El oboe tiene un sonido más nasal y penetrante; el clarinete es más cálido y redondo. Ambos son viento-madera.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('instrumentos-musicales')} />
      <ShareCard appName="instrumentos-musicales" />
      <Footer appName="instrumentos-musicales" />
    </div>
  );
}
