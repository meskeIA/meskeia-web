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
import styles from './SelectorHerramientaProductividad.module.css';

// ============================================================
// TIPOS
// ============================================================

type RecomendacionKey = 'gtd' | 'pomodoro' | 'kanban' | 'timeboxing' | 'inbox_zero';

interface Opcion {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Recomendacion {
  key: RecomendacionKey;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  comoEmpezar: string[];
  ideal: string;
  herramientas: string[];
}

// ============================================================
// DATOS
// ============================================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cómo es tu trabajo principalmente?',
    opciones: [
      { texto: 'Muchas tareas pequeñas e interrupciones constantes', pesos: { gtd: 3, inbox_zero: 3 } },
      { texto: 'Proyectos con fases y flujos bien definidos', pesos: { kanban: 4 } },
      { texto: 'Trabajo en bloques de concentración profunda', pesos: { pomodoro: 3, timeboxing: 3 } },
      { texto: 'Reuniones y agenda muy estructurada', pesos: { timeboxing: 4 } },
      { texto: 'Mezcla de todo lo anterior', pesos: { gtd: 3 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu mayor problema de productividad?',
    opciones: [
      { texto: 'Tengo demasiadas tareas pendientes y no sé por dónde empezar', pesos: { gtd: 4 } },
      { texto: 'Me cuesta concentrarme y me distraigo fácilmente', pesos: { pomodoro: 4 } },
      { texto: 'No sé en qué estado están mis proyectos o tareas', pesos: { kanban: 4 } },
      { texto: 'Pierdo el tiempo en cosas no importantes', pesos: { timeboxing: 3 } },
      { texto: 'El correo y los mensajes me abruman', pesos: { inbox_zero: 4 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuántas "cosas" tienes en la cabeza que debes hacer?',
    opciones: [
      { texto: 'Muchísimas, siento que se me olvida todo', pesos: { gtd: 5 } },
      { texto: 'Unas pocas, pero me cuesta priorizarlas', pesos: { timeboxing: 3 } },
      { texto: 'Un número manejable bien definido', pesos: { kanban: 3, pomodoro: 2 } },
      { texto: 'Pocos proyectos pero complejos', pesos: { kanban: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Cómo es tu relación con el correo y los mensajes?',
    opciones: [
      { texto: 'Es mi mayor fuente de estrés y desorden', pesos: { inbox_zero: 5 } },
      { texto: 'Lo gestiono bien pero podría mejorarlo', pesos: { gtd: 2, timeboxing: 2 } },
      { texto: 'No es mi problema principal', pesos: { pomodoro: 3, kanban: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Prefieres un sistema flexible o estructurado?',
    opciones: [
      { texto: 'Muy estructurado, con horarios fijos', pesos: { timeboxing: 4 } },
      { texto: 'Estructurado pero con adaptabilidad', pesos: { gtd: 3, kanban: 2 } },
      { texto: 'Flexible, me ajusto según el día', pesos: { pomodoro: 3 } },
      { texto: 'Muy flexible, odio los sistemas rígidos', pesos: { kanban: 2, pomodoro: 2 } },
    ],
  },
  {
    id: 6,
    texto: '¿Trabajas en proyectos colaborativos o principalmente solo?',
    opciones: [
      { texto: 'Principalmente solo', pesos: { pomodoro: 3, gtd: 2 } },
      { texto: 'Solo pero con mucha comunicación externa', pesos: { inbox_zero: 3, gtd: 2 } },
      { texto: 'En equipo con roles definidos', pesos: { kanban: 4 } },
      { texto: 'Gestiono equipos o proyectos', pesos: { kanban: 4, timeboxing: 3 } },
    ],
  },
  {
    id: 7,
    texto: '¿Cuánto tiempo libre tienes para implementar y aprender un sistema?',
    opciones: [
      { texto: 'Muy poco, necesito algo rápido', pesos: { pomodoro: 4, inbox_zero: 3 } },
      { texto: 'Algo, puedo dedicar unas horas', pesos: { kanban: 3 } },
      { texto: 'Bastante, me interesa hacerlo bien', pesos: { gtd: 3, timeboxing: 3 } },
      { texto: 'Tengo tiempo para un sistema completo', pesos: { gtd: 4 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cómo gestionas tu energía a lo largo del día?',
    opciones: [
      { texto: 'Tengo picos de energía claros que quiero aprovechar', pesos: { pomodoro: 3, timeboxing: 3 } },
      { texto: 'Mi energía es bastante uniforme', pesos: { kanban: 2, gtd: 2 } },
      { texto: 'Depende del día, es muy variable', pesos: { gtd: 3 } },
      { texto: 'Prefiero planificar independientemente de la energía', pesos: { timeboxing: 4 } },
    ],
  },
  {
    id: 9,
    texto: '¿Cuántos contextos o roles tienes (trabajo, casa, proyectos personales)?',
    opciones: [
      { texto: 'Uno o dos bien definidos', pesos: { pomodoro: 3, kanban: 3 } },
      { texto: 'Varios que mezclo bastante', pesos: { gtd: 4 } },
      { texto: 'Muchos y muy distintos entre sí', pesos: { gtd: 5 } },
      { texto: 'Solo trabajo, muy centrado', pesos: { pomodoro: 3, timeboxing: 3 } },
    ],
  },
  {
    id: 10,
    texto: '¿Qué resultado esperas de un sistema de productividad?',
    opciones: [
      { texto: 'Vaciar mi cabeza y tener todo capturado', pesos: { gtd: 4 } },
      { texto: 'Concentrarme mejor en lo que hago', pesos: { pomodoro: 4 } },
      { texto: 'Visualizar y gestionar el flujo de trabajo', pesos: { kanban: 4 } },
      { texto: 'Usar mi tiempo de forma más intencional', pesos: { timeboxing: 4 } },
      { texto: 'Tener el correo y mensajes bajo control', pesos: { inbox_zero: 4 } },
    ],
  },
];

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  gtd: {
    key: 'gtd',
    titulo: 'GTD (Getting Things Done)',
    subtitulo: 'Sistema completo de captura y organización',
    descripcion:
      'GTD es el sistema más completo para personas con mucha carga cognitiva y múltiples responsabilidades. Su principio fundamental es capturar todo lo que tienes en la cabeza en un sistema externo de confianza, para poder pensar con claridad. Ideal si manejas muchos proyectos, roles o contextos simultáneos.',
    comoEmpezar: [
      'Haz una "vaciada" completa: escribe todo lo que tienes pendiente sin excepción',
      'Clasifica cada elemento en: acción siguiente, proyecto, referencia, o algún día/quizás',
      'Define la "próxima acción física" de cada proyecto activo',
      'Revisa tu sistema cada semana (revisión semanal GTD)',
    ],
    ideal: 'Profesionales con múltiples proyectos, roles y muchas responsabilidades simultáneas',
    herramientas: ['Libreta + carpetas físicas', 'App de notas con etiquetas', 'Gestión de proyectos con contextos'],
  },
  pomodoro: {
    key: 'pomodoro',
    titulo: 'Técnica Pomodoro',
    subtitulo: 'Bloques de concentración con descansos regulares',
    descripcion:
      'La técnica Pomodoro divide el trabajo en intervalos de 25 minutos (pomodoros) separados por descansos cortos de 5 minutos. Cada 4 pomodoros, descansas 15-30 minutos. Es el método más simple y efectivo para mejorar la concentración y combatir las distracciones. No requiere planificación compleja.',
    comoEmpezar: [
      'Elige una tarea concreta en la que trabajar',
      'Pon un temporizador en 25 minutos y trabaja sin interrupciones',
      'Cuando suene, marca un pomodoro completado y descansa 5 minutos',
      'Después de 4 pomodoros, toma un descanso largo de 15-30 minutos',
    ],
    ideal: 'Personas con dificultad para concentrarse o que tienden a procrastinar',
    herramientas: ['Temporizador de cocina', 'App de temporizador dedicada', 'Extensión de navegador'],
  },
  kanban: {
    key: 'kanban',
    titulo: 'Método Kanban',
    subtitulo: 'Tablero visual para gestionar el flujo de trabajo',
    descripcion:
      'Kanban usa un tablero visual con columnas que representan el estado de las tareas: "Por hacer", "En progreso" y "Hecho". Permite ver de un vistazo en qué estado está todo tu trabajo. Es especialmente efectivo para proyectos con múltiples tareas en paralelo o para equipos que necesitan coordinarse.',
    comoEmpezar: [
      'Crea un tablero con tres columnas: Por hacer / En progreso / Hecho',
      'Escribe cada tarea pendiente en una tarjeta y colócala en "Por hacer"',
      'Limita el trabajo en progreso (máximo 2-3 tareas a la vez)',
      'Mueve las tarjetas según avanzas y revisa el tablero cada día',
    ],
    ideal: 'Personas con proyectos múltiples o que trabajan en equipo con flujos definidos',
    herramientas: ['Pizarra física con post-its', 'Tablero digital de tareas', 'Herramienta de gestión de proyectos'],
  },
  timeboxing: {
    key: 'timeboxing',
    titulo: 'Timeboxing (Bloques Temporales)',
    subtitulo: 'Planificación intencional del tiempo en el calendario',
    descripcion:
      'El timeboxing consiste en asignar bloques de tiempo específicos en el calendario para cada tipo de tarea o proyecto. En lugar de tener una lista de tareas, tienes un horario. Ofrece el máximo control sobre cómo usas tu tiempo y es muy efectivo para personas con agendas complejas o que gestionan equipos.',
    comoEmpezar: [
      'Revisa cada semana qué tareas y proyectos debes avanzar',
      'Asigna bloques de tiempo concretos en tu calendario para cada uno',
      'Protege esos bloques como si fueran reuniones importantes',
      'Al final del día, refleja brevemente si los bloques se cumplieron',
    ],
    ideal: 'Personas con agendas complejas, gestores de equipos o quienes quieren máximo control del tiempo',
    herramientas: ['Calendario digital', 'Agenda física de bloques', 'Herramienta de planificación semanal'],
  },
  inbox_zero: {
    key: 'inbox_zero',
    titulo: 'Inbox Zero',
    subtitulo: 'Sistema de gestión del correo y mensajes',
    descripcion:
      'Inbox Zero es un sistema de gestión del correo electrónico y mensajes cuyo objetivo es mantener la bandeja de entrada vacía (o casi vacía). No significa responder todo al instante, sino procesar cada mensaje con una decisión: eliminar, archivar, delegar, responder (si tarda menos de 2 minutos) o convertir en tarea.',
    comoEmpezar: [
      'Establece 2-3 momentos del día para revisar el correo (no constantemente)',
      'Para cada mensaje: elimina, archiva, delega, responde (menos de 2 min) o convierte en tarea',
      'Crea carpetas de archivo por tema, no por remitente',
      'Desactiva las notificaciones de correo fuera de tus horarios de revisión',
    ],
    ideal: 'Personas cuya principal fuente de estrés y desorden son el correo y los mensajes',
    herramientas: ['Cliente de correo con carpetas', 'Etiquetas y filtros automáticos', 'Gestor de tareas integrado'],
  },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function SelectorHerramientaProductividad() {
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrandoResultado, setMostrandoResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const respuestaActual = respuestas[preguntaActual];
  const progresoPct = mostrandoResultado
    ? 100
    : Math.round((preguntaActual / totalPreguntas) * 100);

  // Calcular puntuaciones al final
  const calcularPuntuaciones = (): Record<RecomendacionKey, number> => {
    const puntos: Record<RecomendacionKey, number> = {
      gtd: 0,
      pomodoro: 0,
      kanban: 0,
      timeboxing: 0,
      inbox_zero: 0,
    };

    PREGUNTAS.forEach((p, idx) => {
      const opcionIdx = respuestas[idx];
      if (opcionIdx >= 0 && opcionIdx < p.opciones.length) {
        const pesos = p.opciones[opcionIdx].pesos;
        (Object.keys(pesos) as RecomendacionKey[]).forEach((k) => {
          puntos[k] += pesos[k] ?? 0;
        });
      }
    });

    return puntos;
  };

  const obtenerRecomendacion = (): RecomendacionKey => {
    const puntos = calcularPuntuaciones();
    let mejor: RecomendacionKey = 'gtd';
    let maxPuntos = -1;
    (Object.keys(puntos) as RecomendacionKey[]).forEach((k) => {
      if (puntos[k] > maxPuntos) {
        maxPuntos = puntos[k];
        mejor = k;
      }
    });
    return mejor;
  };

  const seleccionarOpcion = (idx: number) => {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = idx;
    setRespuestas(nuevas);
  };

  const irAnterior = () => {
    if (preguntaActual > 0) setPreguntaActual(preguntaActual - 1);
  };

  const irSiguiente = () => {
    if (preguntaActual < totalPreguntas - 1) setPreguntaActual(preguntaActual + 1);
  };

  const verResultado = () => {
    setMostrandoResultado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reiniciar = () => {
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setPreguntaActual(0);
    setMostrandoResultado(false);
  };

  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const todasRespondidas = respuestas.every((r) => r >= 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué método de productividad te conviene?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir si GTD, Pomodoro, Kanban, Timeboxing o Inbox Zero
          se adapta mejor a tu forma de trabajar
        </p>
      </header>

      <LegalNotice />

      {/* ---- TEST ---- */}
      {!mostrandoResultado && (
        <main className={styles.testSection}>
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={progresoPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del test">
            <div className={styles.progresoBar}>
              <div className={styles.progresoFill} style={{ width: `${progresoPct}%` }} />
            </div>
            <p className={styles.progresoTexto}>
              Pregunta {preguntaActual + 1} de {totalPreguntas}
            </p>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1}</p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={`Opciones para pregunta ${preguntaActual + 1}`}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn}${respuestaActual === idx ? ` ${styles.selected}` : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={respuestaActual === idx ? true : false}
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
              aria-label="Ir a la pregunta anterior"
            >
              ← Anterior
            </button>

            {!esUltimaPregunta ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={respuestaActual < 0}
                aria-label="Ir a la siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={!todasRespondidas}
                aria-label="Ver mi recomendación personalizada"
              >
                Ver mi resultado →
              </button>
            )}
          </div>
        </main>
      )}

      {/* ---- RESULTADO ---- */}
      {mostrandoResultado && (() => {
        const claveRecomendada = obtenerRecomendacion();
        const recomendacion = RECOMENDACIONES[claveRecomendada];
        const puntuaciones = calcularPuntuaciones();

        return (
          <section className={styles.resultadoSection} aria-label="Resultado del test">
            <div className={`${styles.resultadoCard} ${styles[`recomendacion_${claveRecomendada}`]}`}>
              <p className={styles.resultadoLabel}>Tu método recomendado</p>
              <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
              <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
              <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

              <p className={styles.resultadoLabel} style={{ marginBottom: '0.75rem' }}>
                Ideal para
              </p>
              <p className={styles.recomendacionDesc} style={{ marginBottom: '1.5rem' }}>
                {recomendacion.ideal}
              </p>

              <p className={styles.resultadoLabel} style={{ marginBottom: '0.75rem' }}>
                Cómo empezar hoy
              </p>
              <div className={styles.pasosGrid}>
                {recomendacion.comoEmpezar.map((paso, i) => (
                  <div key={i} className={styles.pasoCard}>
                    <span className={styles.pasoNumero} aria-hidden="true">{i + 1}</span>
                    <span>{paso}</span>
                  </div>
                ))}
              </div>

              <div className={styles.herramientasSection}>
                <h3>Herramientas que puedes usar</h3>
                <div className={styles.herramientasTags}>
                  {recomendacion.herramientas.map((h, i) => (
                    <span key={i} className={styles.herramientaTag}>{h}</span>
                  ))}
                </div>
              </div>

              {/* Puntuaciones parciales */}
              <div className={styles.puntuacionesGrid} aria-label="Puntuaciones por método">
                {(Object.keys(RECOMENDACIONES) as RecomendacionKey[]).map((k) => (
                  <div key={k} className={styles.puntuacionItem}>
                    <span className={styles.puntuacionNombre}>
                      {k === 'gtd' ? 'GTD' :
                        k === 'pomodoro' ? 'Pomodoro' :
                        k === 'kanban' ? 'Kanban' :
                        k === 'timeboxing' ? 'Timeboxing' :
                        'Inbox Zero'}
                    </span>
                    <span className={styles.puntuacionValor}>{puntuaciones[k]}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Reiniciar el test"
            >
              ↺ Repetir test
            </button>
          </section>
        );
      })()}

      <DisclaimerCard variant="educational" severity="low" />

      <EducationalSection
        title="Los 5 métodos de productividad más efectivos"
        subtitle="Guía práctica para elegir e implementar tu sistema personal"
      >
        <p>
          Existen cinco métodos de productividad que han demostrado ser efectivos para distintos
          perfiles de trabajo. Conocerlos en profundidad te ayudará a entender por qué uno puede
          funcionar mejor para ti.
        </p>

        <h3>GTD (Getting Things Done)</h3>
        <p>
          Desarrollado por David Allen, GTD se basa en el principio de que nuestra mente es para
          tener ideas, no para guardarlas. El sistema se divide en cinco fases: capturar todo en
          bandejas de entrada, aclarar qué significa cada cosa, organizar el resultado en listas
          y categorías, reflexionar periódicamente sobre el sistema, y actuar con confianza.
          Su punto fuerte es que reduce la ansiedad al externalizar toda la carga cognitiva.
        </p>

        <h3>Técnica Pomodoro</h3>
        <p>
          Creada por Francesco Cirillo en los años 80, usa un temporizador para dividir el trabajo
          en intervalos de 25 minutos. La ciencia detrás de ella es sólida: alternamos entre
          estados de enfoque y descanso, lo que mantiene alta la concentración y previene la
          fatiga mental. Su gran ventaja es la simplicidad: cualquiera puede empezar hoy mismo
          sin preparación.
        </p>

        <h3>Kanban</h3>
        <p>
          Originado en el sistema de producción Toyota, el Kanban personal adapta sus principios
          al trabajo individual. El tablero visual hace explícito el flujo de trabajo y ayuda a
          detectar cuellos de botella. El principio del límite de trabajo en progreso (WIP) es
          especialmente valioso: hacer menos cosas a la vez, pero terminarlas realmente.
        </p>

        <h3>Timeboxing</h3>
        <p>
          El timeboxing lleva la planificación un paso más allá: en lugar de listas de tareas, usas
          el calendario como herramienta de gestión. Cada tarea tiene asignado un bloque de tiempo
          concreto. Esto fuerza a ser realista sobre cuánto tiempo lleva cada cosa y elimina la
          ilusión de que "mañana haré todo". Es el método favorito de muchos directivos y
          emprendedores.
        </p>

        <h3>Inbox Zero</h3>
        <p>
          Popularizado por Merlin Mann, Inbox Zero no es solo vaciar el correo sino establecer
          un sistema de procesamiento. Cada mensaje recibe una decisión inmediata: eliminar,
          archivar, delegar, responder (si tarda menos de 2 minutos) o convertir en tarea.
          Funciona mejor combinado con revisar el correo en momentos fijos del día, no
          continuamente.
        </p>

        <h3>¿Por qué no existe el "mejor" sistema?</h3>
        <p>
          Cada método resuelve un problema diferente. GTD gestiona la complejidad y la carga
          cognitiva. Pomodoro combate la distracción y la procrastinación. Kanban visualiza el
          flujo de trabajo. Timeboxing controla el uso del tiempo. Inbox Zero domina la
          comunicación. La clave está en identificar cuál es <strong>tu</strong> problema principal.
        </p>

        <div className={styles.warningBox}>
          <strong>El mejor sistema de productividad es el que realmente usas.</strong> Empieza con
          el más simple que resuelva tu problema principal y añade complejidad solo cuando sea
          necesario. Muchos intentos fracasan por sobrecomplicar desde el primer día.
        </div>

        <h3>El principio de las 2 minutos</h3>
        <p>
          Procedente de GTD pero aplicable a cualquier método: si una tarea tarda menos de
          2 minutos en hacerse, hazla ahora. No la apuntes, no la planifiques. Gestionar
          mentalmente esa tarea pequeña durante días consume más energía que simplemente
          resolverla en el momento.
        </p>

        <h3>Por qué falla la mayoría de los intentos</h3>
        <p>
          Los sistemas de productividad suelen fracasar por tres razones. Primera, la
          sobrecomplicación: intentar implementar el sistema completo desde el día uno en vez
          de empezar por lo mínimo útil. Segunda, la falta de revisión periódica: ningún sistema
          funciona sin actualización regular. Tercera, buscar el sistema "perfecto" en lugar del
          sistema "suficientemente bueno": el perfeccionismo en la elección del método es en sí
          mismo una forma de procrastinación.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-herramienta-productividad')} />
      <ShareCard appName="selector-herramienta-productividad" />
      <Footer appName="selector-herramienta-productividad" />
    </div>
  );
}
