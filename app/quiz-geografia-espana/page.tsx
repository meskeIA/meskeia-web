'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizGeografiaEspana.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  PREGUNTAS_GEO_FACIL,
  PREGUNTAS_GEO_MEDIO,
  PREGUNTAS_GEO_DIFICIL,
  CONFIG_DIFICULTAD_GEO,
  type DificultadGeografia,
  type PreguntaGeografia,
} from '@/data/preguntas-geografia-espana';

type Fase = 'inicio' | 'jugando' | 'respondida' | 'fin';

const DISPLAY_DIFICULTAD: Record<DificultadGeografia, { emoji: string; nombre: string; descripcion: string }> = {
  facil:   { emoji: '🌱', nombre: 'Fácil', descripcion: 'Capitales, CCAA y ríos principales' },
  medio:   { emoji: '📚', nombre: 'Medio', descripcion: 'Provincias, montañas y costas' },
  dificil: { emoji: '🏆', nombre: 'Difícil', descripcion: 'Geografía detallada y datos avanzados' },
};

const ETIQUETA_CATEGORIA: Record<string, string> = {
  'provincias-capitales': 'Provincias y Capitales',
  'comunidades-autonomas': 'Comunidades Autónomas',
  'rios': 'Ríos',
  'montanas-picos': 'Montañas y Picos',
  'costas-mares': 'Costas y Mares',
  'geografia-general': 'Geografía General',
};

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function seleccionarPreguntas(dificultad: DificultadGeografia): PreguntaGeografia[] {
  const cfg = CONFIG_DIFICULTAD_GEO[dificultad];
  let pool: PreguntaGeografia[];
  if (dificultad === 'facil') pool = PREGUNTAS_GEO_FACIL;
  else if (dificultad === 'medio') pool = PREGUNTAS_GEO_MEDIO;
  else pool = [...PREGUNTAS_GEO_FACIL, ...PREGUNTAS_GEO_MEDIO, ...PREGUNTAS_GEO_DIFICIL];
  return mezclar(pool).slice(0, cfg.preguntas);
}

function calcularMedalla(porcentaje: number): string {
  if (porcentaje >= 90) return '🥇';
  if (porcentaje >= 70) return '🥈';
  if (porcentaje >= 50) return '🥉';
  return '🗺️';
}

function calcularTextoMedalla(porcentaje: number): string {
  if (porcentaje >= 90) return '¡Experto en Geografía de España!';
  if (porcentaje >= 70) return 'Gran conocedor del territorio español';
  if (porcentaje >= 50) return 'Nivel intermedio';
  return 'Sigue explorando España';
}

const LETRAS = ['A', 'B', 'C', 'D'];

export default function QuizGeografiaEspanaPage() {
  const [fase, setFase] = useState<Fase>('inicio');
  const [dificultad, setDificultad] = useState<DificultadGeografia>('medio');
  const [preguntas, setPreguntas] = useState<PreguntaGeografia[]>([]);
  const [indice, setIndice] = useState(0);
  const [opcionesOrdenadas, setOpcionesOrdenadas] = useState<string[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState<Array<{ pregunta: string; correcta: string }>>([]);

  const preguntaActual = preguntas[indice];

  const iniciarQuiz = useCallback(() => {
    const seleccionadas = seleccionarPreguntas(dificultad);
    setPreguntas(seleccionadas);
    setIndice(0);
    setOpcionesOrdenadas(mezclar(seleccionadas[0]?.opciones ?? []));
    setSeleccionada(null);
    setAciertos(0);
    setErrores([]);
    setFase('jugando');
  }, [dificultad]);

  const responder = useCallback((opcion: string) => {
    if (fase !== 'jugando' || !preguntaActual) return;
    setSeleccionada(opcion);
    const esCorrecta = opcion === preguntaActual.correcta;
    if (esCorrecta) {
      setAciertos(prev => prev + 1);
    } else {
      setErrores(prev => [...prev, { pregunta: preguntaActual.pregunta, correcta: preguntaActual.correcta }]);
    }
    setFase('respondida');
  }, [fase, preguntaActual]);

  const siguiente = useCallback(() => {
    const siguienteIndice = indice + 1;
    if (siguienteIndice >= preguntas.length) {
      setFase('fin');
    } else {
      setIndice(siguienteIndice);
      setOpcionesOrdenadas(mezclar(preguntas[siguienteIndice].opciones));
      setSeleccionada(null);
      setFase('jugando');
    }
  }, [indice, preguntas]);

  const reiniciar = useCallback(() => {
    setFase('inicio');
    setPreguntas([]);
    setIndice(0);
    setSeleccionada(null);
    setAciertos(0);
    setErrores([]);
  }, []);

  const porcentaje = useMemo(() => {
    if (preguntas.length === 0) return 0;
    return Math.round((aciertos / preguntas.length) * 100);
  }, [aciertos, preguntas.length]);

  const claseOpcion = (opcion: string) => {
    if (fase !== 'respondida') return '';
    if (opcion === preguntaActual?.correcta) return styles['opcion-correcta'];
    if (opcion === seleccionada && opcion !== preguntaActual?.correcta) return styles['opcion-seleccionada-mal'];
    return styles['opcion-neutral'];
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🌍</div>
        <h1 className={styles.title}>Quiz Geografía de España</h1>
        <p className={styles.subtitle}>Provincias, ríos, montañas y comunidades autónomas</p>
        <div className={styles.heroBadges}>
          <span>75 preguntas</span>
          <span>3 niveles de dificultad</span>
          <span>6 categorías</span>
        </div>
      </header>

      <LegalNotice />

      {/* FASE INICIO */}
      {fase === 'inicio' && (
        <div className={styles.inicioPanel}>
          <section>
            <div className={styles.configSection}>
              <p className={styles.configTitulo}>Selecciona la dificultad</p>
              <div className={styles.difGrid}>
                {(['facil', 'medio', 'dificil'] as DificultadGeografia[]).map(d => {
                  const cfg = CONFIG_DIFICULTAD_GEO[d];
                  const display = DISPLAY_DIFICULTAD[d];
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={dificultad === d}
                      className={`${styles.difCard} ${dificultad === d ? styles.difActivo : ''}`}
                      onClick={() => setDificultad(d)}
                    >
                      <span className={styles.difEmoji} aria-hidden="true">{display.emoji}</span>
                      <strong>{display.nombre}</strong>
                      <span>{cfg.preguntas} preguntas</span>
                      <span>{display.descripcion}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.configSection}>
              <p className={styles.configTitulo}>Modo de juego</p>
              <div className={styles.modoGrid}>
                <div className={`${styles.modoCard} ${styles.modoActivo}`}>
                  <span className={styles.modoIcono} aria-hidden="true">📖</span>
                  <strong>Modo Aprendizaje</strong>
                  <span>Ves la explicación tras cada respuesta</span>
                </div>
              </div>
            </div>

            <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
              Comenzar quiz ▶
            </button>
          </section>
        </div>
      )}

      {/* FASE JUGANDO / RESPONDIDA */}
      {(fase === 'jugando' || fase === 'respondida') && preguntaActual && (
        <div className={styles.quizPanel}>
          {/* Progreso */}
          <div className={styles.progresoBarra}>
            <div className={styles.progresoInfo}>
              <span>Pregunta {indice + 1} de {preguntas.length}</span>
              <span>{aciertos} correctas</span>
            </div>
            <div
              className={styles.progresoTrack}
              role="progressbar"
              aria-label={`Progreso: pregunta ${indice + 1} de ${preguntas.length}`}
              aria-valuenow={(indice + 1)}
              aria-valuemin={1}
              aria-valuemax={preguntas.length}
            >
              <div
                className={styles.progresoFill}
                style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.preguntaCard}>
            <span className={styles.categoriaBadge}>
              {ETIQUETA_CATEGORIA[preguntaActual.categoria] ?? preguntaActual.categoria}
            </span>
            <p className={styles.preguntaTexto}>{preguntaActual.pregunta}</p>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesGrid} role="group" aria-label="Opciones de respuesta">
            {opcionesOrdenadas.map((opcion, i) => (
              <button
                key={opcion}
                type="button"
                className={`${styles.opcionBtn} ${claseOpcion(opcion)}`}
                onClick={() => responder(opcion)}
                disabled={fase === 'respondida'}
              >
                <span className={styles.opcionLetra} aria-hidden="true">{LETRAS[i]}</span>
                <span className={styles.opcionTexto}>{opcion}</span>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {fase === 'respondida' && (
            <div className={styles.feedbackPanel} role="alert" aria-live="polite">
              <div className={`${styles.feedbackMensaje} ${seleccionada === preguntaActual.correcta ? styles.feedbackOk : styles.feedbackFail}`}>
                {seleccionada === preguntaActual.correcta
                  ? <><span aria-hidden="true">✅</span>{' ¡Correcto!'}</>
                  : <><span aria-hidden="true">❌</span>{` Incorrecto. La respuesta correcta es: "${preguntaActual.correcta}"`}</>}
              </div>
              {preguntaActual.explicacion && (
                <p className={styles.explicacionTexto}>{preguntaActual.explicacion}</p>
              )}
              <button type="button" className={styles.btnSiguiente} onClick={siguiente}>
                {indice + 1 < preguntas.length ? 'Siguiente pregunta →' : 'Ver resultado'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FASE FIN */}
      {fase === 'fin' && (
        <div className={styles.finPanel}>
          <div className={styles.medallaIcon} aria-hidden="true">{calcularMedalla(porcentaje)}</div>
          <h2 className={styles.finTitulo}>{calcularTextoMedalla(porcentaje)}</h2>
          <p className={styles.finSubtitulo}>{aciertos} de {preguntas.length} preguntas correctas ({porcentaje}%)</p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{aciertos}</span>
              <span className={styles.statLabel}>Correctas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{preguntas.length - aciertos}</span>
              <span className={styles.statLabel}>Errores</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{porcentaje}%</span>
              <span className={styles.statLabel}>Puntuación</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{preguntas.length}</span>
              <span className={styles.statLabel}>Jugadas</span>
            </div>
          </div>

          {errores.length > 0 && (
            <div className={styles.erroresSection}>
              <h3 className={styles.erroresTitulo}>Preguntas que has fallado</h3>
              <div className={styles.erroresGrid}>
                {errores.map((e, i) => (
                  <div key={i} className={styles.errorItem}>
                    <span className={styles.errorPregunta}>{e.pregunta}</span>
                    <span className={styles.errorCorrecta}><span aria-hidden="true">✓</span> {e.correcta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.finBotones}>
            <button type="button" className={styles.btnIniciar} onClick={iniciarQuiz}>
              Jugar de nuevo
            </button>
            <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
              Cambiar dificultad
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="🗺️ Geografía de España: guía de estudio"
        subtitle="Repasa las claves del territorio español"
      >
        {/* Tabla CCAA */}
        <section className={styles.guideSection}>
          <h2>Comunidades Autónomas de España</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Comunidad Autónoma</th>
                  <th>Capital</th>
                  <th>Provincias</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Andalucía', 'Sevilla', '8 (Almería, Cádiz, Córdoba, Granada, Huelva, Jaén, Málaga, Sevilla)'],
                  ['Aragón', 'Zaragoza', '3 (Huesca, Teruel, Zaragoza)'],
                  ['Asturias', 'Oviedo', '1 (Asturias)'],
                  ['Baleares', 'Palma', '1 (Illes Balears)'],
                  ['Canarias', 'Las Palmas / S.C. Tenerife', '2 (Las Palmas, S.C. de Tenerife)'],
                  ['Cantabria', 'Santander', '1 (Cantabria)'],
                  ['Castilla-La Mancha', 'Toledo', '5 (Albacete, Ciudad Real, Cuenca, Guadalajara, Toledo)'],
                  ['Castilla y León', 'Valladolid', '9 (Ávila, Burgos, León, Palencia, Salamanca, Segovia, Soria, Valladolid, Zamora)'],
                  ['Cataluña', 'Barcelona', '4 (Barcelona, Girona, Lleida, Tarragona)'],
                  ['Extremadura', 'Mérida', '2 (Badajoz, Cáceres)'],
                  ['Galicia', 'Santiago de Compostela', '4 (A Coruña, Lugo, Ourense, Pontevedra)'],
                  ['La Rioja', 'Logroño', '1 (La Rioja)'],
                  ['Madrid', 'Madrid', '1 (Madrid)'],
                  ['Murcia', 'Murcia', '1 (Murcia)'],
                  ['Navarra', 'Pamplona', '1 (Navarra)'],
                  ['País Vasco', 'Vitoria-Gasteiz', '3 (Álava, Gipuzkoa, Bizkaia)'],
                  ['Valencia', 'Valencia', '3 (Alicante, Castellón, Valencia)'],
                ].map(([ca, cap, prov]) => (
                  <tr key={ca}>
                    <td>{ca}</td>
                    <td>{cap}</td>
                    <td>{prov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ríos principales */}
        <section className={styles.guideSection}>
          <h2>Principales ríos de España</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Río</th>
                  <th>Longitud</th>
                  <th>Desembocadura</th>
                  <th>Dato clave</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Tajo', '1.007 km', 'Atlántico (Lisboa)', 'Río más largo de la Península Ibérica'],
                  ['Ebro', '930 km', 'Mediterráneo (Delta del Ebro)', 'Único gran río que desemboca en el Mediterráneo'],
                  ['Duero', '895 km', 'Atlántico (Oporto)', 'Atraviesa Castilla y León y Portugal'],
                  ['Guadiana', '818 km', 'Atlántico (Ayamonte)', 'Forma parte de la frontera con Portugal'],
                  ['Guadalquivir', '657 km', 'Atlántico (Sanlúcar de Barrameda)', 'Único río navegable de España; cruza Andalucía'],
                  ['Segura', '325 km', 'Mediterráneo (Guardamar)', 'Río del sureste peninsular, frecuentes sequías'],
                  ['Miño', '340 km', 'Atlántico (La Guardia)', 'Frontera natural entre Galicia y Portugal'],
                ].map(([rio, long, desemb, dato]) => (
                  <tr key={rio}>
                    <td><strong>{rio}</strong></td>
                    <td>{long}</td>
                    <td>{desemb}</td>
                    <td>{dato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Usos del quiz */}
        <section className={styles.guideSection}>
          <h2>¿Para qué sirve dominar la Geografía de España?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📝</span>
              <h3>Oposiciones</h3>
              <p>Policía, Guardia Civil, Correos, Administración… casi todas las oposiciones incluyen un bloque de geografía española. Este quiz cubre los temas más frecuentes.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎓</span>
              <h3>Bachillerato y ESO</h3>
              <p>La geografía de España es materia obligatoria en 3.º ESO y en 2.º de Bachillerato. Repasa capitales, ríos y relieve de forma interactiva.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎮</span>
              <h3>Trivial y concursos</h3>
              <p>La geografía española aparece constantemente en Trivial, Saber y Ganar y concursos de cultura general. Entrena con estas 75 preguntas verificadas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">✈️</span>
              <h3>Viajeros curiosos</h3>
              <p>Conocer la geografía hace que los viajes sean más ricos. Saber en qué provincia estás, qué río cruza la ciudad o cuál es el pico más cercano enriquece la experiencia.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre Geografía de España</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>¿Cuál es el pico más alto de España?</h3>
              <p>El Teide (Tenerife, Canarias) con 3.718 m es el punto más alto de España. En la Península, el más alto es el Mulhacén (Sierra Nevada, Granada) con 3.479 m.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuántas provincias tiene España?</h3>
              <p>España tiene 50 provincias, organizadas en 17 comunidades autónomas. Además hay 2 ciudades autónomas: Ceuta y Melilla.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué ríos atraviesan más comunidades autónomas?</h3>
              <p>El Ebro atraviesa 7 CCAA (Cantabria, País Vasco, La Rioja, Navarra, Aragón, Cataluña y brevemente Castilla y León). El Duero atraviesa Castilla y León, Zamora y parte de Aragón antes de entrar en Portugal.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuál es la comunidad autónoma más grande?</h3>
              <p>Castilla y León, con 94.225 km², es la región más extensa de España y la segunda de la Unión Europea. Le siguen Castilla-La Mancha (79.463 km²) y Andalucía (87.268 km²).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué mares y océanos bañan España?</h3>
              <p>España está bañada por el Océano Atlántico (norte y noroeste), el Mar Cantábrico (parte del Atlántico), el Mar Mediterráneo (este y sur) y el Océano Atlántico sur (Canarias, Andalucía occidental).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuántas islas tiene España?</h3>
              <p>Los archipiélagos principales son las Islas Canarias (7 islas habitadas principales) y las Islas Baleares (5 islas habitadas principales: Mallorca, Menorca, Ibiza, Formentera y Cabrera). Hay además numerosos islotes.</p>
            </div>
          </div>
        </section>

        {/* Pasos para estudiar */}
        <section className={styles.guideSection}>
          <h2>Cómo aprender Geografía de España en 6 pasos</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'Aprende las 17 CCAA y sus capitales', desc: 'Es la base. Con un mapa vacío, practica escribir las comunidades y sus capitales. Repite hasta que salgan sin ayuda.' },
              { n: '2', titulo: 'Asocia provincias a sus CCAA', desc: 'Aprende cuántas provincias tiene cada comunidad. Las uniprovinciales (Madrid, Murcia, Asturias…) son las más fáciles.' },
              { n: '3', titulo: 'Domina los ríos principales', desc: 'Tajo, Ebro, Duero, Guadalquivir y Guadiana son los esenciales. Recuerda hacia dónde desembocan: Atlántico o Mediterráneo.' },
              { n: '4', titulo: 'Aprende las cadenas montañosas', desc: 'Pirineos (norte), Sistema Ibérico (centro-este), Sierra Nevada (sur), Cordillera Cantábrica (norte), Sistema Central (centro).' },
              { n: '5', titulo: 'Sitúa las costas y los mares', desc: 'Costa Cantábrica (norte), Costa Verde (Asturias), Costa Atlántica (oeste), Costa del Sol (sur), Costa Blanca y Costa Brava (este).' },
              { n: '6', titulo: 'Practica con mapas mudos', desc: 'Imprime mapas mudos de España y dibuja provincias, ríos y montañas. La escritura activa retiene mejor la información geográfica.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Curiosidades */}
        <section className={styles.guideSection}>
          <h2>6 curiosidades geográficas de España</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '🏔️', titulo: 'El punto más meridional de Europa', desc: 'Punta de Tarifa (Cádiz) es el punto más al sur de Europa continental, a solo 14 km de África. En días claros se ve la costa marroquí.' },
              { icon: '🌊', titulo: 'El río más caudaloso', desc: 'El Ebro es el río más caudaloso de España con 426 m³/s de media, aunque el Tajo es más largo. El Ebro es el único gran río que desemboca en el Mediterráneo.' },
              { icon: '🏝️', titulo: 'Canarias, a la misma latitud que el Sáhara', desc: 'El archipiélago canario está a 100 km de la costa africana y en la misma latitud que el norte de Marruecos. Tiene clima subtropical, no mediterráneo.' },
              { icon: '📐', titulo: 'España, el segundo país más montañoso de Europa', desc: 'Con una altitud media de 660 m, España es el segundo país más montañoso de Europa tras Suiza. Solo un 11% de su territorio está por debajo de los 200 m.' },
              { icon: '🌐', titulo: 'Tres zonas horarias', desc: 'España tiene técnicamente dos husos horarios: la Península y Baleares (UTC+1) y Canarias (UTC). Ceuta y Melilla siguen el horario peninsular aunque estén en África.' },
              { icon: '💧', titulo: 'La laguna más grande de España', desc: 'La Albufera de Valencia es la laguna más grande de España con 2.800 ha de agua dulce. El Mar Menor (Murcia) es la laguna salada más grande de Europa occidental.' },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2><span aria-hidden="true">⚠️</span> Sobre el contenido de este quiz</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'Las preguntas están basadas en datos oficiales', desc: 'Todas las preguntas están verificadas con datos del INE, IGN y fuentes oficiales. Capitales, longitudes de ríos y altitudes se corresponden con registros actualizados.' },
              { titulo: 'Algunos datos pueden variar según la fuente', desc: 'Las longitudes de ríos y altitudes de picos varían ligeramente según la fuente consultada (diferentes metodologías de medición). Hemos usado las cifras más citadas en libros de texto.' },
              { titulo: 'Cambios administrativos recientes', desc: 'La organización territorial española es estable, pero puede haber pequeños cambios en denominaciones oficiales de municipios. Hemos usado las denominaciones vigentes en 2026.' },
              { titulo: 'Para oposiciones, consulta los temarios oficiales', desc: 'Este quiz es un complemento de estudio, no un sustituto. Para oposiciones o exámenes oficiales, consulta siempre los temarios y manuales aprobados por las administraciones convocantes.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-geografia-espana')} />
      <ShareCard appName="quiz-geografia-espana" />
      <Footer appName="quiz-geografia-espana" />
    </div>
  );
}
