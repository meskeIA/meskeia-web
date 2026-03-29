'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorMetodoEstudio.module.css';

// ============================================================
// TIPOS
// ============================================================

type MetodoKey =
  | 'repeticion_espaciada'
  | 'mapas_mentales'
  | 'proyectos_practicos'
  | 'pomodoro_libros'
  | 'clases_particulares';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<MetodoKey, number>>;
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Metodo {
  key: MetodoKey;
  emoji: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  idealPara: string[];
  herramientas: string[];
}

// ============================================================
// DATOS: PREGUNTAS (10)
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '📖',
    texto: '¿Qué tipo de materia necesitas aprender principalmente?',
    opciones: [
      {
        texto: 'Vocabulario, fechas o fórmulas que hay que memorizar',
        pesos: { repeticion_espaciada: 5, pomodoro_libros: 2 },
      },
      {
        texto: 'Conceptos complejos que necesito entender en profundidad',
        pesos: { mapas_mentales: 4, pomodoro_libros: 3 },
      },
      {
        texto: 'Habilidades prácticas (programar, diseñar, hablar un idioma...)',
        pesos: { proyectos_practicos: 5 },
      },
      {
        texto: 'Temario de oposición o examen oficial con mucho volumen',
        pesos: { repeticion_espaciada: 4, pomodoro_libros: 3 },
      },
    ],
  },
  {
    id: 2,
    icono: '⏱️',
    texto: '¿Cuánto tiempo puedes dedicar a estudiar de forma continua cada día?',
    opciones: [
      {
        texto: 'Poco: 15-20 minutos dispersos a lo largo del día',
        pesos: { repeticion_espaciada: 4 },
      },
      {
        texto: 'Sesiones cortas: bloques de 25-30 minutos con descansos',
        pesos: { pomodoro_libros: 5 },
      },
      {
        texto: 'Sesiones largas: 1-2 horas seguidas sin problema',
        pesos: { mapas_mentales: 3, proyectos_practicos: 3, pomodoro_libros: 2 },
      },
      {
        texto: 'Horas de clase o academia con un profesor',
        pesos: { clases_particulares: 5 },
      },
    ],
  },
  {
    id: 3,
    icono: '📱',
    texto: '¿Te distraes fácilmente cuando estudias solo?',
    opciones: [
      {
        texto: 'Sí, me cuesta mucho mantener el foco más de 10 minutos',
        pesos: { pomodoro_libros: 5, clases_particulares: 3 },
      },
      {
        texto: 'A veces, pero con una rutina lo controlo',
        pesos: { pomodoro_libros: 3, repeticion_espaciada: 2 },
      },
      {
        texto: 'No mucho, me concentro bien cuando me interesa el tema',
        pesos: { proyectos_practicos: 3, mapas_mentales: 3 },
      },
      {
        texto: 'No, puedo estudiar horas sin distraerme si el entorno es bueno',
        pesos: { repeticion_espaciada: 2, mapas_mentales: 2, proyectos_practicos: 2 },
      },
    ],
  },
  {
    id: 4,
    icono: '🧑‍🤝‍🧑',
    texto: '¿Aprendes mejor solo o acompañado?',
    opciones: [
      {
        texto: 'Solo: necesito silencio y mi propio ritmo',
        pesos: { repeticion_espaciada: 3, mapas_mentales: 3, proyectos_practicos: 2 },
      },
      {
        texto: 'Necesito a alguien que me explique y resuelva mis dudas al momento',
        pesos: { clases_particulares: 5 },
      },
      {
        texto: 'Me motiva tener compañeros de estudio o grupos online',
        pesos: { clases_particulares: 3, proyectos_practicos: 2 },
      },
      {
        texto: 'Me da igual, me adapto a cualquier entorno',
        pesos: { pomodoro_libros: 2, repeticion_espaciada: 1 },
      },
    ],
  },
  {
    id: 5,
    icono: '🖼️',
    texto: '¿Cómo procesas mejor la información?',
    opciones: [
      {
        texto: 'Con imágenes, diagramas, colores y esquemas visuales',
        pesos: { mapas_mentales: 5 },
      },
      {
        texto: 'Leyendo y releyendo el texto varias veces',
        pesos: { pomodoro_libros: 4, repeticion_espaciada: 2 },
      },
      {
        texto: 'Haciendo, probando y cometiendo errores',
        pesos: { proyectos_practicos: 5 },
      },
      {
        texto: 'Escuchando explicaciones de alguien con experiencia',
        pesos: { clases_particulares: 4 },
      },
    ],
  },
  {
    id: 6,
    icono: '🎯',
    texto: '¿Tienes un objetivo concreto definido para lo que estudias?',
    opciones: [
      {
        texto: 'Sí, preparar un examen o oposición en una fecha fija',
        pesos: { repeticion_espaciada: 4, pomodoro_libros: 3 },
      },
      {
        texto: 'Sí, dominar una habilidad o tecnología para mi trabajo',
        pesos: { proyectos_practicos: 5 },
      },
      {
        texto: 'Sí, aprender un idioma hasta un nivel específico',
        pesos: { repeticion_espaciada: 4, clases_particulares: 3 },
      },
      {
        texto: 'No muy concreto, quiero aprender y entender mejor un área',
        pesos: { mapas_mentales: 4, pomodoro_libros: 2 },
      },
    ],
  },
  {
    id: 7,
    icono: '💼',
    texto: '¿Trabajas actualmente o solo te dedicas a estudiar?',
    opciones: [
      {
        texto: 'Solo estudio, tengo tiempo flexible durante el día',
        pesos: { mapas_mentales: 3, proyectos_practicos: 3, repeticion_espaciada: 2 },
      },
      {
        texto: 'Trabajo y estudio: solo tengo ratos libres cortos',
        pesos: { repeticion_espaciada: 5, pomodoro_libros: 3 },
      },
      {
        texto: 'Trabajo y estudio: tengo tardes o fines de semana libres',
        pesos: { pomodoro_libros: 4, clases_particulares: 2 },
      },
      {
        texto: 'Estudio en un entorno formal (instituto, universidad)',
        pesos: { mapas_mentales: 3, clases_particulares: 2 },
      },
    ],
  },
  {
    id: 8,
    icono: '📲',
    texto: '¿Prefieres apoyarte en apps y tecnología o en papel y libros?',
    opciones: [
      {
        texto: 'Apps y herramientas digitales: me motiva la gamificación y los datos',
        pesos: { repeticion_espaciada: 5 },
      },
      {
        texto: 'Papel y bolígrafo: hacer esquemas y escribir a mano me ayuda a recordar',
        pesos: { mapas_mentales: 4, pomodoro_libros: 3 },
      },
      {
        texto: 'Proyectos y código: aprender construyendo cosas reales',
        pesos: { proyectos_practicos: 5 },
      },
      {
        texto: 'Clases presenciales o videoconferencias con ejercicios guiados',
        pesos: { clases_particulares: 5 },
      },
    ],
  },
  {
    id: 9,
    icono: '🔁',
    texto: '¿Con qué frecuencia repasas lo aprendido?',
    opciones: [
      {
        texto: 'Casi nunca: estudio intensamente y luego paso al siguiente tema',
        pesos: { clases_particulares: 3, mapas_mentales: 2 },
      },
      {
        texto: 'Una vez a la semana o cuando se acerca el examen',
        pesos: { pomodoro_libros: 4 },
      },
      {
        texto: 'Me gustaría repasar más pero no sé cómo organizarlo bien',
        pesos: { repeticion_espaciada: 5 },
      },
      {
        texto: 'Repaso continuamente porque uso lo aprendido en proyectos reales',
        pesos: { proyectos_practicos: 4 },
      },
    ],
  },
  {
    id: 10,
    icono: '😓',
    texto: '¿Te cuesta mantener la motivación para seguir estudiando?',
    opciones: [
      {
        texto: 'Sí, mucho: necesito ver resultados rápidos para no abandonar',
        pesos: { repeticion_espaciada: 4, clases_particulares: 3 },
      },
      {
        texto: 'A veces: necesito estructura y rutina para ser constante',
        pesos: { pomodoro_libros: 5 },
      },
      {
        texto: 'Me motivo cuando el tema es útil y puedo aplicarlo enseguida',
        pesos: { proyectos_practicos: 4 },
      },
      {
        texto: 'No suelo tener problema con la motivación si el método me encaja',
        pesos: { mapas_mentales: 3, repeticion_espaciada: 2 },
      },
    ],
  },
];

// ============================================================
// DATOS: RECOMENDACIONES
// ============================================================

const RECOMENDACIONES: Record<MetodoKey, Metodo> = {
  repeticion_espaciada: {
    key: 'repeticion_espaciada',
    emoji: '🧠',
    titulo: 'Repetición Espaciada (Anki / Fichas)',
    subtitulo: 'Máxima retención con el mínimo tiempo diario',
    descripcion:
      'Tu perfil encaja a la perfección con la repetición espaciada. Este método, basado en el "efecto del espaciado" demostrado por la neurociencia, consiste en repasar la información justo antes de que la vayas a olvidar. Con tan solo 15-20 minutos al día, puedes retener miles de datos a largo plazo: vocabulario de idiomas, leyes, fórmulas, fechas o cualquier contenido que necesites memorizar.',
    idealPara: [
      'Preparar oposiciones con gran volumen de temario',
      'Aprender idiomas hasta nivel conversacional o certificación',
      'Estudiar medicina, derecho o cualquier carrera con mucha memorización',
      'Personas con poco tiempo libre pero constancia diaria',
    ],
    herramientas: ['Anki', 'Anki Mobile', 'Magoosh Flashcards', 'Brainscape', 'Duolingo'],
  },
  mapas_mentales: {
    key: 'mapas_mentales',
    emoji: '🗺️',
    titulo: 'Mapas Mentales y Esquemas Visuales',
    subtitulo: 'Ver la estructura global para entender y recordar mejor',
    descripcion:
      'Eres un aprendiz visual. Los mapas mentales y esquemas te permiten representar la jerarquía y relaciones entre conceptos de una forma que tu cerebro puede procesar de un solo vistazo. En lugar de leer páginas de texto lineal, condensas toda la información en una imagen mental que activa múltiples áreas cerebrales a la vez, mejorando tanto la comprensión como el recuerdo.',
    idealPara: [
      'Asignaturas con mucha teoría interconectada (historia, biología, derecho)',
      'Personas que se bloquean ante textos largos y densos',
      'Preparar exámenes de desarrollo, no solo tipo test',
      'Estudiar mientras se crea el material de repaso',
    ],
    herramientas: ['MindMeister', 'XMind', 'FreeMind', 'Papel y rotuladores de colores', 'Notion'],
  },
  proyectos_practicos: {
    key: 'proyectos_practicos',
    emoji: '🛠️',
    titulo: 'Aprendizaje Basado en Proyectos',
    subtitulo: 'Aprender haciendo, no memorizando',
    descripcion:
      'Tu perfil es el del aprendiz práctico: absorbes conocimiento cuando lo aplicas a problemas reales. El aprendizaje basado en proyectos consiste en definir un mini-proyecto concreto —una aplicación, un análisis, un diseño— y construirlo mientras aprendes los conceptos necesarios. Es el método más eficaz para habilidades técnicas, idiomas en contexto real y cualquier disciplina donde la práctica supera a la teoría.',
    idealPara: [
      'Programación, diseño, marketing digital o cualquier habilidad técnica',
      'Personas que aprenden mejor con motivación intrínseca y autonomía',
      'Quienes quieren cambiar de carrera o mejorar en su trabajo actual',
      'Aprendizaje de idiomas mediante conversación e inmersión',
    ],
    herramientas: [
      'GitHub (proyectos de código)',
      'Kaggle (ciencia de datos)',
      'Canva (diseño)',
      'Codecademy / freeCodeCamp',
      'YouTube + proyectos propios',
    ],
  },
  pomodoro_libros: {
    key: 'pomodoro_libros',
    emoji: '🍅',
    titulo: 'Técnica Pomodoro con Estudio Tradicional',
    subtitulo: 'Estructura temporal para mantener el foco y la constancia',
    descripcion:
      'Tu perfil necesita estructura temporal para rendir al máximo. La Técnica Pomodoro —25 minutos de trabajo concentrado + 5 de descanso— combina perfectamente con el estudio tradicional (lectura activa, subrayado, esquemas y apuntes). Este método elimina la parálisis ante tareas grandes al dividirlas en bloques manejables, convierte el estudio en un hábito medible y reduce la fatiga mental acumulada.',
    idealPara: [
      'Personas que se distraen fácilmente y necesitan un temporizador externo',
      'Preparar materias con mucha lectura y comprensión lectora',
      'Quienes ya trabajan y estudian en los ratos libres de la tarde',
      'Estudiantes universitarios con muchas asignaturas simultáneas',
    ],
    herramientas: [
      'Forest App (foco con árbol)',
      'Focus Keeper',
      'Be Focused',
      'Temporizador físico o de cocina',
      'Notion / papel para listas de tareas',
    ],
  },
  clases_particulares: {
    key: 'clases_particulares',
    emoji: '👨‍🏫',
    titulo: 'Clases Particulares o Academia',
    subtitulo: 'Guía experta, feedback inmediato y motivación constante',
    descripcion:
      'Tu perfil se beneficia enormemente de la guía de otra persona. Las clases particulares o la academia aportan lo que el autoaprendizaje no puede ofrecer: explicaciones personalizadas adaptadas a tus lagunas, corrección de errores en tiempo real, alguien que te exige y te mantiene constante, y un entorno que reduce la sensación de soledad frente a un tema difícil. No es rendirse; es elegir el método más eficiente para tu forma de aprender.',
    idealPara: [
      'Materias con alta dificultad conceptual (matemáticas, física, idiomas desde cero)',
      'Personas que necesitan responsabilidad externa para ser constantes',
      'Quienes tienen poco tiempo y quieren el camino más directo al resultado',
      'Niños, adolescentes o adultos que retomaron los estudios tras años de pausa',
    ],
    herramientas: [
      'Preply (idiomas online)',
      'Classgap (cualquier materia)',
      'Tusclases.net',
      'Academia local presencial',
      'Grupos de estudio o mentores en LinkedIn',
    ],
  },
};

const COLOR_BARRAS: Record<MetodoKey, string> = {
  repeticion_espaciada: '#2E86AB',
  mapas_mentales: '#48A9A6',
  proyectos_practicos: '#e8a020',
  pomodoro_libros: '#e74c3c',
  clases_particulares: '#6b7fa8',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SelectorMetodoEstudioPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const opcionSeleccionada = respuestas[preguntaActual];
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPercent = Math.round(
    (respuestas.filter((r) => r !== null).length / totalPreguntas) * 100
  );

  // Calcular puntuaciones
  const calcularPuntuaciones = (): Record<MetodoKey, number> => {
    const puntos: Record<MetodoKey, number> = {
      repeticion_espaciada: 0,
      mapas_mentales: 0,
      proyectos_practicos: 0,
      pomodoro_libros: 0,
      clases_particulares: 0,
    };
    respuestas.forEach((idxOpcion, idxPregunta) => {
      if (idxOpcion === null) return;
      const opcion = PREGUNTAS[idxPregunta].opciones[idxOpcion];
      (Object.keys(opcion.pesos) as MetodoKey[]).forEach((key) => {
        puntos[key] += opcion.pesos[key] ?? 0;
      });
    });
    return puntos;
  };

  const obtenerGanador = (puntos: Record<MetodoKey, number>): MetodoKey => {
    return (Object.keys(puntos) as MetodoKey[]).reduce((a, b) =>
      puntos[a] >= puntos[b] ? a : b
    );
  };

  // Handlers
  const seleccionarOpcion = (idx: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = idx;
    setRespuestas(nuevasRespuestas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const irSiguiente = () => {
    if (opcionSeleccionada === null) return;
    if (esUltimaPregunta) {
      setMostrarResultado(true);
    } else {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const reiniciar = () => {
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setPreguntaActual(0);
    setMostrarResultado(false);
  };

  // ---- Render resultado ----
  const renderResultado = () => {
    const puntos = calcularPuntuaciones();
    const ganadorKey = obtenerGanador(puntos);
    const recomendacion = RECOMENDACIONES[ganadorKey];
    const maxPuntos = Math.max(...(Object.values(puntos) as number[]));

    return (
      <section className={styles.resultado} aria-label="Resultado del test">
        <div className={styles.resultadoCard}>
          <div className={styles.resultadoHeader}>
            <span className={styles.resultadoEmoji} aria-hidden="true">
              {recomendacion.emoji}
            </span>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
          </div>

          <div className={styles.resultadoBody}>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            {/* Barras de afinidad */}
            <p className={styles.puntuacionTitulo}>Tu afinidad por método</p>
            <div className={styles.puntuacionDetalle}>
              {(Object.keys(RECOMENDACIONES) as MetodoKey[]).map((key) => (
                <div key={key} className={styles.puntuacionFila}>
                  <span className={styles.puntuacionEtiqueta}>
                    {RECOMENDACIONES[key].emoji} {RECOMENDACIONES[key].titulo.split(' (')[0]}
                  </span>
                  <div className={styles.puntuacionBarraWrap}>
                    <div
                      className={styles.puntuacionBarra}
                      style={{
                        width: maxPuntos > 0 ? `${(puntos[key] / maxPuntos) * 100}%` : '0%',
                        backgroundColor: COLOR_BARRAS[key],
                      }}
                    />
                  </div>
                  <span className={styles.puntuacionValor}>{puntos[key]}</span>
                </div>
              ))}
            </div>

            {/* Ideal para */}
            <p className={styles.idealTitulo}>Ideal para ti porque...</p>
            <ul className={styles.idealLista} aria-label="Situaciones ideales para este método">
              {recomendacion.idealPara.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {/* Herramientas */}
            <p className={styles.herramientasTitulo}>Herramientas y recursos recomendados</p>
            <ul className={styles.herramientasLista} aria-label="Herramientas recomendadas">
              {recomendacion.herramientas.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <button type="button" onClick={reiniciar} className={styles.btnReiniciar}>
              Repetir el test
            </button>
          </div>
        </div>
      </section>
    );
  };

  // ---- Render test ----
  const renderTest = () => (
    <section className={styles.quiz} aria-label="Test para elegir método de estudio">
      {/* Progreso */}
      <div className={styles.progreso}>
        <span className={styles.progresoLabel}>
          Pregunta {preguntaActual + 1} de {totalPreguntas} — {progresoPercent}% completado
        </span>
        <div
          className={styles.progresoBar}
          role="progressbar"
          aria-valuenow={progresoPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progresoFill} style={{ width: `${progresoPercent}%` }} />
        </div>
      </div>

      {/* Tarjeta de pregunta */}
      <div className={styles.pregunta}>
        <p className={styles.preguntaNumero}>
          {pregunta.icono} Pregunta {preguntaActual + 1}
        </p>
        <p className={styles.preguntaTexto} id={`pregunta-${pregunta.id}`}>
          {pregunta.texto}
        </p>

        <div
          className={styles.opciones}
          role="group"
          aria-labelledby={`pregunta-${pregunta.id}`}
        >
          {pregunta.opciones.map((opcion, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.opcion}${opcionSeleccionada === idx ? ` ${styles.seleccionada}` : ''}`}
              onClick={() => seleccionarOpcion(idx)}
              aria-pressed={opcionSeleccionada === idx}
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación */}
      <div className={styles.navegacion}>
        <button
          type="button"
          className={styles.btnAnterior}
          onClick={irAnterior}
          disabled={preguntaActual === 0}
        >
          ← Anterior
        </button>

        {esUltimaPregunta ? (
          <button
            type="button"
            className={styles.btnResultado}
            onClick={irSiguiente}
            disabled={opcionSeleccionada === null}
            aria-describedby="instruccion-resultado"
          >
            Ver mi resultado →
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnSiguiente}
            onClick={irSiguiente}
            disabled={opcionSeleccionada === null}
          >
            Siguiente →
          </button>
        )}
      </div>

      {esUltimaPregunta && opcionSeleccionada === null && (
        <p
          id="instruccion-resultado"
          style={{
            textAlign: 'right',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
          }}
        >
          Selecciona una opción para ver el resultado
        </p>
      )}
    </section>
  );

  // ---- Render principal ----
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🎓 ¿Qué método de estudio te funciona mejor?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir si debes usar repetición espaciada, mapas mentales,
          aprendizaje por proyectos, Pomodoro con libros o clases particulares.
        </p>
      </header>

      <LegalNotice />

      {mostrarResultado ? renderResultado() : renderTest()}

      <DisclaimerCard variant="educational" severity="low" />

      <EducationalSection
        title="Métodos de estudio: guía práctica para aprender mejor"
        subtitle="Qué son, cómo funcionan y cuándo usar cada técnica"
      >
        <h3>Los 5 métodos de estudio más efectivos según la ciencia</h3>
        <p>
          La psicología educativa y la neurociencia llevan décadas investigando qué técnicas de
          estudio funcionan de verdad. No todos aprendemos igual, pero sí hay métodos respaldados
          por evidencia que funcionan mejor que la clásica relectura pasiva.
        </p>

        <h3>1. Repetición Espaciada — la técnica más eficiente para memorizar</h3>
        <p>
          Basada en la <strong>curva del olvido de Ebbinghaus</strong> (1885), la repetición
          espaciada consiste en repasar la información en intervalos crecientes: el día siguiente,
          a los 3 días, a los 7, a los 21... El resultado es una retención a largo plazo con un
          tiempo de estudio diario mínimo. Herramientas como{' '}
          <strong>Anki</strong> implementan este algoritmo automáticamente.
        </p>
        <p>
          Es la técnica ideal para vocabulario de idiomas, temarios de oposición, leyes, fórmulas
          y cualquier información factual que deba quedar grabada a largo plazo.
        </p>

        <h3>2. Mapas Mentales — pensar visualmente para entender mejor</h3>
        <p>
          Los mapas mentales, popularizados por Tony Buzan, aprovechan la tendencia del cerebro a
          organizar el conocimiento en redes, no en listas lineales. Al crear un mapa mental,
          activas simultáneamente el hemisferio lógico (estructura, jerarquía) y el creativo
          (color, imagen, asociación), lo que mejora tanto la comprensión como el recuerdo.
        </p>
        <p>
          Son especialmente útiles en asignaturas con mucha teoría interconectada (biología,
          historia, derecho) y para preparar exámenes de desarrollo donde necesitas ver el
          conjunto.
        </p>

        <h3>3. Aprendizaje Basado en Proyectos — aprender haciendo</h3>
        <p>
          El aprendizaje experiencial o <em>project-based learning</em> parte de una premisa
          simple: la mejor forma de aprender una habilidad es usarla en un contexto real. En lugar
          de estudiar programación leyendo libros, creas una aplicación. En lugar de estudiar
          inglés con gramática, te comunicas con nativos online.
        </p>
        <p>
          Este método es el más eficaz para <strong>habilidades técnicas</strong> (programación,
          diseño, análisis de datos) y para adultos con experiencia laboral que aprenden mejor
          cuando el conocimiento tiene aplicación inmediata.
        </p>

        <h3>4. Técnica Pomodoro — estructura temporal contra la distracción</h3>
        <p>
          Desarrollada por Francesco Cirillo en los años 80, la técnica Pomodoro divide el estudio
          en bloques de <strong>25 minutos de trabajo concentrado</strong> (un "pomodoro")
          seguidos de 5 minutos de descanso. Cada 4 pomodoros, se hace una pausa larga de 15-30
          minutos.
        </p>
        <p>
          Su poder radica en que convierte la procrastinación en algo casi imposible ("solo tengo
          que aguantar 25 minutos") y proporciona un feedback continuo sobre el tiempo empleado.
          Combina perfectamente con el estudio tradicional: lectura activa, subrayado, apuntes y
          esquemas.
        </p>

        <h3>5. Clases Particulares o Academia — cuando necesitas un guía experto</h3>
        <p>
          Las clases particulares y academias ofrecen algo que ninguna app puede replicar
          completamente: un ser humano que te conoce, identifica tus lagunas específicas,
          personaliza las explicaciones y te exige. El feedback inmediato reduce el tiempo perdido
          estudiando cosas incorrectas y la responsabilidad externa ayuda a mantener la
          constancia.
        </p>
        <p>
          Son especialmente valiosas para materias con alta dificultad abstracta (matemáticas,
          física, idiomas complejos), para niños y adolescentes, y para adultos que retoman los
          estudios después de años.
        </p>

        <h3>¿Puedo combinar métodos?</h3>
        <p>
          Sí, y es lo más recomendable. El método que este test identifica como tu punto de
          partida no tiene que ser el único. Por ejemplo:
        </p>
        <ul>
          <li>
            <strong>Pomodoro + Repetición espaciada:</strong> usa Pomodoro para crear fichas Anki
            durante tus sesiones de estudio y luego repásalas en los ratos libres.
          </li>
          <li>
            <strong>Clases particulares + Proyectos:</strong> las clases te dan la base teórica y
            los proyectos te ayudan a consolidar las habilidades prácticas.
          </li>
          <li>
            <strong>Mapas mentales + Repetición espaciada:</strong> crea el mapa mental para
            entender la estructura y luego convierte los nodos clave en fichas para memorizar los
            detalles.
          </li>
        </ul>

        <div className={styles.warningBox}>
          <strong>Importante:</strong> Este test es orientativo y se basa en generalidades sobre
          estilos de aprendizaje. El método que funcione mejor para ti depende también de la
          materia concreta, tu experiencia previa y el objetivo que persigues. Experimenta con
          diferentes técnicas durante al menos 2-3 semanas antes de descartar una.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-metodo-estudio')} />
      <ShareCard appName="selector-metodo-estudio" />
      <Footer appName="selector-metodo-estudio" />
    </div>
  );
}
