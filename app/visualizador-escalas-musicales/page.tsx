'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './VisualizadorEscalasMusicales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface TipoEscala {
  nombre: string;
  intervalos: number[];
  caracter: string;
  grupo: 'basicas' | 'menores' | 'pentatonicas' | 'modos';
}

interface NotaEscala {
  nombre: string;
  grado: string;
  indicecromatico: number;
}

interface AcordeDiatonico {
  grado: string;
  nombreAcorde: string;
  tipo: string;
  notas: string[];
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const NOTAS_CROMATICAS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOMBRES_NOTAS_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

const TIPOS_ESCALA: TipoEscala[] = [
  { nombre: 'Mayor', intervalos: [0, 2, 4, 5, 7, 9, 11], caracter: 'Brillante, alegre, estable. La escala más usada en música occidental.', grupo: 'basicas' },
  { nombre: 'Menor natural', intervalos: [0, 2, 3, 5, 7, 8, 10], caracter: 'Oscura, melancólica, expresiva. Muy usada en baladas y rock.', grupo: 'menores' },
  { nombre: 'Menor armónica', intervalos: [0, 2, 3, 5, 7, 8, 11], caracter: 'Dramática, exótica, tensa. El intervalo aumentado le da un color oriental.', grupo: 'menores' },
  { nombre: 'Menor melódica', intervalos: [0, 2, 3, 5, 7, 9, 11], caracter: 'Fluida y sofisticada. Muy usada en jazz y música clásica contemporánea.', grupo: 'menores' },
  { nombre: 'Pentatónica mayor', intervalos: [0, 2, 4, 7, 9], caracter: 'Simple, universal, sin tensión. Base del folk, country y blues mayor.', grupo: 'pentatonicas' },
  { nombre: 'Pentatónica menor', intervalos: [0, 3, 5, 7, 10], caracter: 'Poderosa y versátil. La más usada en rock, blues y solos de guitarra.', grupo: 'pentatonicas' },
  { nombre: 'Blues', intervalos: [0, 3, 5, 6, 7, 10], caracter: 'Intensa, expresiva, con blue note. Fundamental en blues, jazz y rock.', grupo: 'pentatonicas' },
  { nombre: 'Dórico', intervalos: [0, 2, 3, 5, 7, 9, 10], caracter: 'Menor con 6ª mayor. Mística y moderna. Usada en jazz (So What, Miles Davis).', grupo: 'modos' },
  { nombre: 'Frigio', intervalos: [0, 1, 3, 5, 7, 8, 10], caracter: 'Oscura, flamenca, con color español. La 2ª bemol es su sello distintivo.', grupo: 'modos' },
  { nombre: 'Lidio', intervalos: [0, 2, 4, 6, 7, 9, 11], caracter: 'Etérea, onírica, fantástica. La 4ª aumentada crea un efecto flotante.', grupo: 'modos' },
  { nombre: 'Mixolidio', intervalos: [0, 2, 4, 5, 7, 9, 10], caracter: 'Mayor con 7ª menor. Rockera y blues. Base del rock clásico.', grupo: 'modos' },
  { nombre: 'Locrio', intervalos: [0, 1, 3, 5, 6, 8, 10], caracter: 'Muy disonante, inestable. Rara vez usada sola; aparece en metal progresivo.', grupo: 'modos' },
];

const GRUPOS_ESCALA = [
  { id: 'basicas', label: 'Básicas' },
  { id: 'menores', label: 'Menores' },
  { id: 'pentatonicas', label: 'Pentatónicas y Blues' },
  { id: 'modos', label: 'Modos griegos' },
] as const;

const GRADOS_NOMBRES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// Tipos de acorde para tríadas
function calcularTipoTriada(intervalos: number[], posicion: number): string {
  const longitud = intervalos.length;
  if (posicion >= longitud) return '';
  const raizIdx = intervalos[posicion];
  const tercera = intervalos[(posicion + 2) % longitud] + (posicion + 2 >= longitud ? 12 : 0);
  const quinta = intervalos[(posicion + 4) % longitud] + (posicion + 4 >= longitud ? 12 : 0);
  const intervalTercera = tercera - raizIdx;
  const intervalQuinta = quinta - raizIdx;

  if (intervalTercera === 4 && intervalQuinta === 7) return 'Mayor';
  if (intervalTercera === 3 && intervalQuinta === 7) return 'menor';
  if (intervalTercera === 3 && intervalQuinta === 6) return 'disminuido';
  if (intervalTercera === 4 && intervalQuinta === 8) return 'aumentado';
  return 'sus';
}

// Índices de teclas negras en una octava (0=C)
const TECLAS_NEGRAS_INDICES = new Set([1, 3, 6, 8, 10]);

// ─────────────────────────────────────────────
// Componente Piano SVG
// ─────────────────────────────────────────────

interface PianoProps {
  notasActivas: Set<number>;
}

function PianoVisual({ notasActivas }: PianoProps) {
  // 2 octavas = 24 semitonos, empezamos en C (Do)
  const octavas = 2;
  const blancas: { idx: number; cromatico: number }[] = [];
  const negras: { idx: number; cromatico: number }[] = [];

  for (let oct = 0; oct < octavas; oct++) {
    for (let n = 0; n < 12; n++) {
      const cromatico = n % 12;
      const abs = oct * 12 + n;
      if (!TECLAS_NEGRAS_INDICES.has(cromatico)) {
        blancas.push({ idx: abs, cromatico });
      } else {
        negras.push({ idx: abs, cromatico });
      }
    }
  }

  const anchoBlanca = 36;
  const altoBlanca = 140;
  const anchoNegra = 22;
  const altoNegra = 88;
  const totalAncho = blancas.length * anchoBlanca;

  // Mapa de posición blanca por cromático en octava (índice de tecla blanca)
  // C=0, D=1, E=2, F=3, G=4, A=5, B=6; negras tienen -1
  const posBlancaEnOctava = [0, -1, 1, -1, 2, 3, -1, 4, -1, 5, -1, 6];

  return (
    <div className={styles.pianoWrapper}>
      <svg
        viewBox={`0 0 ${totalAncho} ${altoBlanca + 4}`}
        className={styles.pianoSvg}
        role="img"
        aria-label="Teclado de piano mostrando las notas de la escala seleccionada"
      >
        {/* Teclas blancas */}
        {blancas.map((tecla, i) => {
          const activa = notasActivas.has(tecla.cromatico);
          return (
            <rect
              key={`b-${tecla.idx}`}
              x={i * anchoBlanca + 1}
              y={1}
              width={anchoBlanca - 2}
              height={altoBlanca - 2}
              rx={3}
              ry={3}
              className={activa ? styles.teclaBlancaActiva : styles.teclaBlanca}
            />
          );
        })}
        {/* Etiquetas teclas blancas activas */}
        {blancas.map((tecla, i) => {
          const activa = notasActivas.has(tecla.cromatico);
          if (!activa) return null;
          return (
            <text
              key={`lbl-b-${tecla.idx}`}
              x={i * anchoBlanca + anchoBlanca / 2}
              y={altoBlanca - 12}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#fff"
              className={styles.teclaLabel}
            >
              {NOTAS_CROMATICAS[tecla.cromatico]}
            </text>
          );
        })}
        {/* Teclas negras */}
        {negras.map((tecla) => {
          const activa = notasActivas.has(tecla.cromatico);
          const oct = Math.floor(tecla.idx / 12);
          // La tecla negra se posiciona entre la blanca anterior y la siguiente
          const blancaAnteriorPosEnOctava = posBlancaEnOctava[tecla.cromatico - 1];
          const xBlanca = (oct * 7 + blancaAnteriorPosEnOctava) * anchoBlanca;
          const xNegra = xBlanca + anchoBlanca - anchoNegra / 2;
          return (
            <g key={`n-${tecla.idx}`}>
              <rect
                x={xNegra}
                y={1}
                width={anchoNegra}
                height={altoNegra}
                rx={2}
                ry={2}
                className={activa ? styles.teclaNegrActiva : styles.teclaNegra}
              />
              {activa && (
                <text
                  x={xNegra + anchoNegra / 2}
                  y={altoNegra - 8}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  fill="#fff"
                  className={styles.teclaLabel}
                >
                  {NOTAS_CROMATICAS[tecla.cromatico]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEscalasMusicales() {
  const [notaRaiz, setNotaRaiz] = useState(0); // índice en NOTAS_CROMATICAS
  const [escalaSeleccionada, setEscalaSeleccionada] = useState(0); // índice en TIPOS_ESCALA

  const escala = TIPOS_ESCALA[escalaSeleccionada];

  // Notas de la escala calculadas
  const notasEscala: NotaEscala[] = useMemo(() => {
    return escala.intervalos.map((intervalo, i) => {
      const idxCromatico = (notaRaiz + intervalo) % 12;
      return {
        nombre: NOTAS_CROMATICAS[idxCromatico],
        grado: GRADOS_NOMBRES[i],
        indicecromatico: idxCromatico,
      };
    });
  }, [notaRaiz, escala]);

  // Set de índices cromáticos activos para el piano
  const notasActivasSet: Set<number> = useMemo(() => {
    return new Set(notasEscala.map((n) => n.indicecromatico));
  }, [notasEscala]);

  // Acordes diatónicos (solo para escalas de 7 notas)
  const acordesDiatonicos: AcordeDiatonico[] = useMemo(() => {
    if (escala.intervalos.length !== 7) return [];
    return escala.intervalos.map((_, posicion) => {
      const notaRaizAcorde = notasEscala[posicion];
      const tercera = notasEscala[(posicion + 2) % 7];
      const quinta = notasEscala[(posicion + 4) % 7];
      const tipo = calcularTipoTriada(escala.intervalos, posicion);
      const sufijo = tipo === 'Mayor' ? '' : tipo === 'menor' ? 'm' : tipo === 'disminuido' ? '°' : '+';
      return {
        grado: GRADOS_NOMBRES[posicion],
        nombreAcorde: `${notaRaizAcorde.nombre}${sufijo}`,
        tipo,
        notas: [notaRaizAcorde.nombre, tercera.nombre, quinta.nombre],
      };
    });
  }, [notasEscala, escala]);

  // Contenido educativo v2.0
  const contenidoEducativo = {
    intro: 'Una escala musical es una secuencia de notas ordenadas por altura, separadas por intervalos específicos. Cada tipo de escala tiene un carácter sonoro propio que lo hace ideal para diferentes géneros y emociones musicales.',
    tablaComparativa: [
      { escala: 'Mayor', intervalos: '1-2-2-1-2-2-2', caracter: 'Brillante, alegre', ejemplo: 'Do-Re-Mi-Fa-Sol-La-Si' },
      { escala: 'Menor natural', intervalos: '1-2-1-2-2-1-2', caracter: 'Melancólica, oscura', ejemplo: 'La-Si-Do-Re-Mi-Fa-Sol' },
      { escala: 'Menor armónica', intervalos: '1-2-1-2-2-3-1', caracter: 'Dramática, exótica', ejemplo: 'La-Si-Do-Re-Mi-Fa-Sol#' },
      { escala: 'Pentatónica mayor', intervalos: '1-2-2-3-2', caracter: 'Simple, universal', ejemplo: 'Do-Re-Mi-Sol-La' },
      { escala: 'Blues', intervalos: '1-3-2-1-1-3', caracter: 'Intensa, expresiva', ejemplo: 'La-Do-Re-Mib-Mi-Sol' },
      { escala: 'Dórico', intervalos: '1-2-1-2-2-2-1', caracter: 'Mística, jazzística', ejemplo: 'Re-Mi-Fa-Sol-La-Si-Do' },
    ],
    escenarios: [
      {
        titulo: 'El compositor busca un color sonoro',
        descripcion: 'Un compositor quiere crear una pieza épica y fantástica. Prueba el modo Lidio (con su 4ª aumentada característica) y encuentra ese sonido flotante y onírico que buscaba.',
      },
      {
        titulo: 'El guitarrista improvisa sobre un acorde',
        descripcion: 'Un guitarrista improvisa sobre un Am. Con la pentatónica menor de La tiene 5 notas siempre seguras. Si quiere más color jazzístico, prueba el modo Dórico de La.',
      },
      {
        titulo: 'El estudiante aprende solfeo',
        descripcion: 'Un estudiante de conservatorio usa el visualizador para entender cómo cambian las notas al cambiar la raíz. Ve que la escala Mayor siempre sigue el mismo patrón de intervalos, independientemente de la nota de inicio.',
      },
      {
        titulo: 'El productor elige modo para su canción',
        descripcion: 'Un productor de música electrónica quiere un sonido oscuro pero con tensión. Prueba el modo Frigio (con su característica 2ª bemol) y logra ese ambiente flamenco-electrónico que buscaba.',
      },
    ],
    faq: [
      {
        pregunta: '¿Cuál es la diferencia entre una escala y un modo?',
        respuesta: 'Los modos griegos son escalas de 7 notas que se construyen empezando desde diferentes grados de la escala mayor. Por ejemplo, el modo Dórico son las mismas notas que la escala Mayor de Do, pero empezando desde Re. Técnicamente todos los modos son escalas, pero no todas las escalas son modos griegos.',
      },
      {
        pregunta: '¿Por qué la escala mayor tiene 7 notas y no 12?',
        respuesta: 'La escala mayor selecciona 7 de los 12 semitonos del sistema cromático occidental siguiendo un patrón específico de intervalos (tono-tono-semitono-tono-tono-tono-semitono). Este patrón crea una jerarquía de notas que suena natural al oído humano. Las otras 5 notas se usan como "notas de paso" o cromatismo.',
      },
      {
        pregunta: '¿Qué es un intervalo musical?',
        respuesta: 'Un intervalo es la distancia sonora entre dos notas, medida en semitonos. Un semitono es la distancia mínima entre dos notas en el sistema occidental (por ejemplo, Do a Do#). Un tono son dos semitonos. Los intervalos definen el carácter de cada escala.',
      },
      {
        pregunta: '¿Cuál es la diferencia entre escala y acorde?',
        respuesta: 'Una escala es una secuencia de notas tocadas una tras otra (melodía). Un acorde son varias notas tocadas simultáneamente (armonía). Los acordes diatónicos de una tonalidad se construyen apilando notas de la misma escala en intervalos de tercera.',
      },
      {
        pregunta: '¿Cómo practicar las escalas de forma eficiente?',
        respuesta: 'La clave es la constancia y la musicalidad. Practica cada escala a tempo lento primero, tanto ascendente como descendente. Usa un metrónomo. Aprende primero la escala mayor y la pentatónica menor, que son las más versátiles. Luego explora los modos a partir de ahí. Conectar las escalas con canciones o solos reales acelera mucho el aprendizaje.',
      },
    ],
    pasos: [
      { numero: 1, titulo: 'Identifica la tonalidad de tu canción', descripcion: 'Encuentra la nota y el acorde que suena como "hogar" o punto de reposo. Esa es tu tónica.' },
      { numero: 2, titulo: 'Elige si es mayor o menor', descripcion: 'Las canciones en mayor suenan más brillantes o alegres; las menores, más oscuras o emotivas. Esto te da la escala base.' },
      { numero: 3, titulo: 'Prueba variantes de tu modo', descripcion: 'Si está en menor, prueba menor natural, armónica o melódica. Escucha cuál encaja mejor con el mood de tu pieza.' },
      { numero: 4, titulo: 'Experimenta con modos para colorear', descripcion: 'Los modos griegos son grandes herramientas para añadir matices. Dórico para jazz, Frigio para flamenco, Lidio para fantasía.' },
      { numero: 5, titulo: 'Verifica con los acordes diatónicos', descripcion: 'Los acordes de tu canción deben encajar con la escala elegida. Si alguno choca, quizás necesitas ajustar la escala o el acorde.' },
    ],
    tips: [
      'La pentatónica menor es la escala más segura para improvisar: con solo 5 notas evitas la mayoría de disonancias.',
      'El modo Dórico es la versión "más brillante" de la menor: tiene los mismos acordes base pero el VI grado mayor le da luminosidad.',
      'Aprende las escalas en todas las tonalidades. Una escala Mayor en Re tiene las mismas relaciones que en Do, solo transpuesta.',
      'Relaciona cada escala con canciones conocidas: "Happy Birthday" es Mayor, "Smoke on the Water" usa pentatónica menor.',
    ],
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Escalas Musicales</h1>
        <p className={styles.heroSubtitle}>
          Explora las notas, intervalos y grados de cualquier escala musical.
          Visualiza su posición en el teclado de piano.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selectores */}
        <section className={styles.selectores}>
          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel} htmlFor="nota-raiz">
              Nota raíz
            </label>
            <div className={styles.notasGrid} role="group" aria-label="Selecciona la nota raíz">
              {NOTAS_CROMATICAS.map((nota, idx) => (
                <button
                  key={nota}
                  type="button"
                  className={`${styles.notaBtn} ${notaRaiz === idx ? styles.notaBtnActiva : ''}`}
                  onClick={() => setNotaRaiz(idx)}
                  aria-pressed={notaRaiz === idx}
                  title={`${nota} (${NOMBRES_NOTAS_ES[idx]})`}
                >
                  <span className={styles.notaBtnNombre}>{nota}</span>
                  <span className={styles.notaBtnEs}>{NOMBRES_NOTAS_ES[idx]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel}>Tipo de escala</label>
            {GRUPOS_ESCALA.map((grupo) => (
              <div key={grupo.id} className={styles.grupoEscala}>
                <span className={styles.grupoLabel}>{grupo.label}</span>
                <div className={styles.escalasBtns}>
                  {TIPOS_ESCALA.filter((e) => e.grupo === grupo.id).map((escalaItem) => {
                    const idx = TIPOS_ESCALA.indexOf(escalaItem);
                    return (
                      <button
                        key={escalaItem.nombre}
                        type="button"
                        className={`${styles.escalaBtn} ${escalaSeleccionada === idx ? styles.escalaBtnActiva : ''}`}
                        onClick={() => setEscalaSeleccionada(idx)}
                        aria-pressed={escalaSeleccionada === idx}
                      >
                        {escalaItem.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resultados */}
        <section className={styles.resultados}>
          {/* Carácter de la escala */}
          <div className={styles.caracterCard}>
            <h2 className={styles.caracterTitulo}>
              {NOTAS_CROMATICAS[notaRaiz]} {escala.nombre}
            </h2>
            <p className={styles.caracterDesc}>{escala.caracter}</p>
          </div>

          {/* Chips de notas con grados */}
          <div className={styles.notasEscalaSection}>
            <h3 className={styles.seccionTitulo}>Notas de la escala</h3>
            <div className={styles.notasChips} role="list" aria-label="Notas de la escala">
              {notasEscala.map((nota) => (
                <div key={`${nota.grado}-${nota.nombre}`} className={styles.notaChip} role="listitem">
                  <span className={styles.chipGrado}>{nota.grado}</span>
                  <span className={styles.chipNombre}>{nota.nombre}</span>
                  <span className={styles.chipNombreEs}>{NOMBRES_NOTAS_ES[nota.indicecromatico]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Piano */}
          <div className={styles.pianoSection}>
            <h3 className={styles.seccionTitulo}>Teclado de piano</h3>
            <PianoVisual notasActivas={notasActivasSet} />
            <p className={styles.pianoLeyenda}>
              Las teclas resaltadas en azul corresponden a las notas de la escala seleccionada (2 octavas).
            </p>
          </div>

          {/* Acordes diatónicos */}
          {acordesDiatonicos.length > 0 && (
            <div className={styles.acordesSection}>
              <h3 className={styles.seccionTitulo}>Acordes diatónicos</h3>
              <p className={styles.acordesDesc}>Tríadas construidas sobre cada grado de la escala:</p>
              <div className={styles.acordesGrid} role="list" aria-label="Acordes diatónicos">
                {acordesDiatonicos.map((acorde) => (
                  <div key={acorde.grado} className={styles.acordeCard} role="listitem">
                    <span className={styles.acordeGrado}>{acorde.grado}</span>
                    <span className={styles.acordeNombre}>{acorde.nombreAcorde}</span>
                    <span className={styles.acordeTipo}>{acorde.tipo}</span>
                    <span className={styles.acordeNotas}>{acorde.notas.join(' - ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intervalos */}
          <div className={styles.intervalosSection}>
            <h3 className={styles.seccionTitulo}>Intervalos en semitonos</h3>
            <div className={styles.intervalosRow}>
              {escala.intervalos.map((intervalo, i) => (
                <div key={i} className={styles.intervaloItem}>
                  <span className={styles.intervaloNum}>{intervalo}</span>
                  <span className={styles.intervaloGrado}>{GRADOS_NOMBRES[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection title="Teoría de escalas musicales" subtitle="Aprende los fundamentos de las escalas, modos y acordes diatónicos">
          {/* Introducción */}
          <div className={styles.eduIntro}>
            <p>{contenidoEducativo.intro}</p>
          </div>

          {/* Tabla comparativa */}
          <div className={styles.tablaSection}>
            <h3 className={styles.eduTitulo}>Comparativa de escalas principales</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Escala</th>
                    <th>Patrón (T=tono, S=semitono)</th>
                    <th>Carácter sonoro</th>
                    <th>Ejemplo en Do</th>
                  </tr>
                </thead>
                <tbody>
                  {contenidoEducativo.tablaComparativa.map((fila) => (
                    <tr key={fila.escala}>
                      <td><strong>{fila.escala}</strong></td>
                      <td className={styles.monoCell}>{fila.intervalos}</td>
                      <td>{fila.caracter}</td>
                      <td className={styles.monoCell}>{fila.ejemplo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNote}>Nota: Los intervalos se expresan en semitonos (1=semitono, 2=tono). Las 12 escalas completas están disponibles en el visualizador.</p>
          </div>

          {/* Casos de uso */}
          <div className={styles.escenariosSection}>
            <h3 className={styles.eduTitulo}>Casos de uso prácticos</h3>
            <div className={styles.escenariosGrid}>
              {contenidoEducativo.escenarios.map((escenario) => (
                <div key={escenario.titulo} className={styles.escenarioCard}>
                  <h4 className={styles.escenarioTitulo}>{escenario.titulo}</h4>
                  <p>{escenario.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className={styles.faqSection}>
            <h3 className={styles.eduTitulo}>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              {contenidoEducativo.faq.map((item) => (
                <details key={item.pregunta} className={styles.faqItem}>
                  <summary className={styles.faqPregunta}>{item.pregunta}</summary>
                  <p className={styles.faqRespuesta}>{item.respuesta}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Guía paso a paso */}
          <div className={styles.pasosSection}>
            <h3 className={styles.eduTitulo}>Cómo elegir la escala para tu canción</h3>
            <ol className={styles.pasosList}>
              {contenidoEducativo.pasos.map((paso) => (
                <li key={paso.numero} className={styles.pasoItem}>
                  <span className={styles.pasoNum}>{paso.numero}</span>
                  <div>
                    <strong className={styles.pasoTitulo}>{paso.titulo}</strong>
                    <p className={styles.pasoDesc}>{paso.descripcion}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div className={styles.tipsSection}>
            <h3 className={styles.eduTitulo}>Consejos prácticos</h3>
            <ul className={styles.tipsList}>
              {contenidoEducativo.tips.map((tip, i) => (
                <li key={i} className={styles.tipItem}>{tip}</li>
              ))}
            </ul>
          </div>

          {/* Errores frecuentes — warningBox */}
          <div className={styles.warningBox} role="alert">
            <h3 className={styles.warningTitulo}>Errores frecuentes al estudiar escalas</h3>
            <ul className={styles.warningList}>
              <li>Memorizar las notas sin entender los intervalos: si cambias la raíz no sabrás reconstruirla.</li>
              <li>Confundir escala y tonalidad: una canción en "Do Mayor" usa la escala de Do Mayor, pero puede tocar notas de otras escalas transitoriamente.</li>
              <li>Creer que hay escalas "correctas" e "incorrectas": todas son válidas según el contexto musical y el efecto buscado.</li>
              <li>Practicar solo de forma mecánica (subir y bajar): conecta las escalas con melodías reales para interiorizarlas musicalmente.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('visualizador-escalas-musicales')} />
      <ShareCard appName="visualizador-escalas-musicales" />
      <Footer appName="visualizador-escalas-musicales" />
    </div>
  );
}
