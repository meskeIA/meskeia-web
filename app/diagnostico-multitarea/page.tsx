'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DiagnosticoMultitarea.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

/* ─── Tipos ─── */

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'fragmentacion' | 'foco';
}

interface Perfil {
  nombre: string;
  emoji: string;
  descripcion: string;
  fortalezas: string[];
  riesgos: string[];
  acciones: string[];
}

/* ─── Datos ─── */

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'Suelo tener varias tareas abiertas simultáneamente (pestañas, documentos, conversaciones)', dimension: 'fragmentacion' },
  { id: 6, texto: 'Cuando trabajo en algo importante, puedo mantener la concentración durante al menos 45 minutos seguidos', dimension: 'foco' },
  { id: 2, texto: 'Interrumpo lo que estoy haciendo para responder mensajes o notificaciones en cuanto llegan', dimension: 'fragmentacion' },
  { id: 7, texto: 'Tengo bloques de tiempo protegidos en mi día para trabajo de concentración', dimension: 'foco' },
  { id: 3, texto: 'Paso de una tarea a otra varias veces en la misma hora', dimension: 'fragmentacion' },
  { id: 8, texto: 'Cuando termino una tarea, me tomo un momento antes de empezar la siguiente', dimension: 'foco' },
  { id: 4, texto: 'Al final del día, siento que he hecho muchas cosas pero ninguna realmente bien', dimension: 'fragmentacion' },
  { id: 9, texto: 'Sé distinguir entre tareas que requieren concentración profunda y las que puedo hacer en piloto automático', dimension: 'foco' },
  { id: 5, texto: 'Me cuesta recordar en qué punto dejé una tarea cuando vuelvo a ella después de una interrupción', dimension: 'fragmentacion' },
  { id: 10, texto: 'Mi entorno de trabajo (físico y digital) está organizado para minimizar distracciones', dimension: 'foco' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(fragmentacion: number, foco: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (fragmentacion >= umbralAlto && foco >= umbralAlto) {
    return {
      nombre: 'Multitarea Gestionada',
      emoji: '🎛️',
      descripcion: 'Saltas entre muchas tareas pero también eres capaz de concentrarte cuando importa. Es un perfil poco común: manejas la fragmentación sin perder del todo la capacidad de foco. Probablemente has desarrollado estrategias para alternar entre modos — pero cuidado, porque este equilibrio es frágil.',
      fortalezas: [
        'Flexibilidad para alternar entre contextos',
        'Capacidad de concentración cuando se necesita',
        'Adaptabilidad a entornos cambiantes',
      ],
      riesgos: [
        'El equilibrio depende de que las interrupciones sean manejables — un pico de carga lo rompe',
        'Puedes sobreestimar tu capacidad de multitarea (sesgo de ilusión de competencia)',
        'El coste cognitivo del switching existe aunque no lo notes conscientemente',
      ],
      acciones: [
        'Mide cuántas veces al día cambias de tarea — el número real suele ser 2-3 veces más de lo que crees',
        'Experimenta una semana con bloques de 90 minutos sin interrupciones y compara tu output con una semana normal',
        'Identifica las 2-3 tareas que más sufren con la fragmentación y protégelas con bloques dedicados',
      ],
    };
  }

  if (fragmentacion >= umbralAlto && foco < umbralBajo) {
    return {
      nombre: 'Alta Fragmentación',
      emoji: '💥',
      descripcion: 'Alta fragmentación y bajo foco: tu atención está dispersa la mayor parte del tiempo. La investigación es clara: cada cambio de contexto tiene un coste cognitivo de 15-25 minutos para recuperar la concentración plena. Si cambias 10 veces al día, estás perdiendo entre 2,5 y 4 horas en "cambio de marchas" invisible.',
      fortalezas: [
        'Probablemente respondes rápido a demandas inmediatas',
        'Conciencia del problema — es el primer paso',
        'Pequeños cambios en este perfil producen mejoras enormes',
      ],
      riesgos: [
        'Productividad real muy por debajo de lo que sientes que haces',
        'Estrés crónico por sensación de "nunca terminar nada"',
        'Cuando este patrón se vuelve crónico y no es por elección, suele asociarse a más estrés y peor sensación de avance',
      ],
      acciones: [
        'MAÑANA: silencia TODAS las notificaciones durante 2 horas y trabaja en UNA sola cosa. Observa la diferencia.',
        'Implementa la "regla de los 2 minutos": si una interrupción se puede resolver en menos de 2 min, hazlo; si no, anótala y sigue',
        'Cierra todas las pestañas del navegador excepto las que necesitas AHORA MISMO — cada pestaña abierta es una interrupción potencial',
      ],
    };
  }

  if (fragmentacion < umbralBajo && foco >= umbralAlto) {
    return {
      nombre: 'Concentración Profunda',
      emoji: '🎯',
      descripcion: 'Poca fragmentación y alto foco: dominas la concentración sostenida — algo cada vez más valioso en trabajos que requieren profundidad cognitiva (programar, escribir, investigar, diseñar).',
      fortalezas: [
        'Capacidad de producir trabajo de alta calidad',
        'Menor estrés por no estar en modo reactivo constante',
        'Aprovechamiento real del tiempo disponible',
      ],
      riesgos: [
        'Riesgo de aislamiento si te cierras demasiado a interrupciones legítimas',
        'En entornos muy colaborativos, pueden percibir tu foco como falta de disponibilidad',
        'Dependencia del entorno: si cambia tu contexto (open office, más reuniones), puedes sufrir mucho',
      ],
      acciones: [
        'Protege lo que tienes: documenta qué condiciones te permiten concentrarte y defiéndelas activamente',
        'Comunica a tu equipo cuándo estás disponible y cuándo no — la claridad reduce fricciones',
        'Busca maneras de ayudar a otros a desarrollar esta capacidad — tu ejemplo es valioso',
      ],
    };
  }

  if (fragmentacion < umbralBajo && foco < umbralBajo) {
    return {
      nombre: 'Baja Activación',
      emoji: '😶',
      descripcion: 'Ni mucha fragmentación ni mucho foco. Puede indicar que tu carga de trabajo es baja, que estás en un momento de poca demanda, o que no encuentras motivación para concentrarte en nada. No tiene por qué ser un problema. Puede coincidir con un momento de descanso, transición vital, recuperación o baja demanda — solo merece atención si esta sensación de poca activación se prolonga y te genera malestar.',
      fortalezas: [
        'No tienes el hábito tóxico de la multitarea compulsiva',
        'Espacio disponible para construir buenos hábitos de foco',
        'Sin estrés por fragmentación',
      ],
      riesgos: [
        'La falta de foco puede ser señal de desinterés o agotamiento',
        'Sin práctica de concentración, la capacidad se atrofia',
        'Riesgo de que la pasividad se cronifique',
      ],
      acciones: [
        'Busca una tarea o proyecto que te genere genuino interés — el foco surge naturalmente cuando algo te importa',
        'Prueba la técnica Pomodoro (25 min de trabajo + 5 de descanso) — es un buen entrenamiento de foco para empezar',
        'Si la falta de foco lleva semanas, pregúntate si es un problema de trabajo o de motivación — la respuesta orienta la solución',
      ],
    };
  }

  if (fragmentacion >= foco) {
    return {
      nombre: 'Tendencia a la Dispersión',
      emoji: '🌀',
      descripcion: 'Tu fragmentación supera ligeramente a tu capacidad de foco. No es extremo, pero indica que las interrupciones están ganando terreno a la concentración. La buena noticia es que corregir esto es relativamente fácil con cambios de hábitos pequeños.',
      fortalezas: [
        'Algo de capacidad de foco todavía presente',
        'Nivel de fragmentación corregible',
        'Margen para mejorar con ajustes sencillos',
      ],
      riesgos: [
        'La tendencia tiende a empeorar si no actúas (más notificaciones, más tareas, más personas pidiendo cosas)',
        'Cada día sin corregir entrena al cerebro en distracción',
        'La calidad de tu trabajo puede estar bajando sin que lo notes',
      ],
      acciones: [
        'Empieza cada día identificando TU tarea más importante y hazla PRIMERO, antes de abrir email o mensajes',
        'Desactiva las notificaciones push de apps que no son urgentes — revísalas en bloques cada 2 horas',
        'Al cambiar de tarea, escribe una nota de "dónde me quedé" — reduce el coste de volver después',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Foco',
    emoji: '🔍',
    descripcion: 'Tu capacidad de concentración supera ligeramente a tu nivel de fragmentación. Vas bien: mantienes un buen nivel de foco a pesar de las distracciones inevitables. El reto es mantener esta tendencia cuando la carga aumente.',
    fortalezas: [
      'Buena base de concentración',
      'Fragmentación contenida',
      'Dirección positiva',
    ],
    riesgos: [
      'Picos de carga pueden desplazar el equilibrio rápidamente',
      'Nuevas herramientas o canales de comunicación pueden aumentar la fragmentación',
      'La concentración necesita mantenimiento activo',
    ],
    acciones: [
      'Identifica qué hábitos concretos te ayudan a mantener el foco y protégelos conscientemente',
      'Cuando llegue un periodo de más carga, decide de antemano qué canal de comunicación vas a limitar',
      'Practica la "atención plena" en tareas mundanas (comer, caminar, ducharte sin pensar en trabajo) — entrena la capacidad general de concentración',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoMultitareaPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mostrarResultado) setMostrarResultado(false);
  };

  const calcularResultado = () => {
    setMostrarResultado(true);
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const puntuacionFragmentacion = PREGUNTAS
    .filter((p) => p.dimension === 'fragmentacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionFoco = PREGUNTAS
    .filter((p) => p.dimension === 'foco')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionFragmentacion, puntuacionFoco);

  const posX = ((puntuacionFragmentacion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionFoco - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🔀 Diagnóstico de Multitarea</h1>
          <p className={styles.subtitle}>
            ¿Tu multitarea es productiva o destructiva?
            <br />
            Reflexión sobre fragmentación y foco
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}>🕐 3 minutos</span>
            <span className={styles.badge}>📊 10 preguntas</span>
            <span className={styles.badge}>🔒 Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>
            La investigación en neurociencia es contundente: <strong>el cerebro humano no hace multitarea
            — hace cambio de contexto rápido</strong>. En trabajos que requieren concentración sostenida
            (programar, escribir, analizar), cada cambio de contexto puede costar 15-25 minutos de recuperación.
            En otras profesiones (sanidad, docencia, atención directa), la alternancia rápida es parte del
            oficio y no se aplica el mismo análisis.
          </p>
          <p>
            Esto no significa que toda multitarea sea mala. Hay tareas que pueden combinarse
            (caminar y escuchar un podcast) y otras que no (escribir un informe y responder emails).
            <strong> La clave es saber cuándo fragmentar es eficiente y cuándo es destructivo.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo trabajas habitualmente
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que haces realmente, no lo ideal
          </p>

          {PREGUNTAS.map((pregunta, index) => (
            <div key={pregunta.id} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>{index + 1}</span>
              </div>
              <p className={styles.questionText}>{pregunta.texto}</p>
              <div className={styles.scaleContainer} role="radiogroup" aria-label={`Pregunta ${index + 1}: ${pregunta.texto}`}>
                {ESCALA.map((opcion) => (
                  <button
                    key={opcion.valor}
                    className={`${styles.scaleButton} ${respuestas[pregunta.id] === opcion.valor ? styles.scaleButtonActive : ''}`}
                    onClick={() => handleRespuesta(pregunta.id, opcion.valor)}
                    role="radio"
                    aria-checked={respuestas[pregunta.id] === opcion.valor}
                    aria-label={`${opcion.etiqueta} (${opcion.valor} de 5)`}
                  >
                    <span className={styles.scaleValue}>{opcion.valor}</span>
                    <span className={styles.scaleLabel}>{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.progressInfo}>
            {Object.keys(respuestas).length} de {PREGUNTAS.length} respondidas
          </div>

          <button
            className={styles.btnPrimary}
            onClick={calcularResultado}
            disabled={!todasRespondidas}
            aria-label="Ver mi diagnóstico"
          >
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>🎯 Alto Foco</span>
                <span className={styles.mapLabelBottom}>Bajo Foco</span>
                <span className={styles.mapLabelLeft}>Baja Fragmentación</span>
                <span className={styles.mapLabelRight}>💥 Alta Fragmentación</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🎯 Concentración Profunda</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🎛️ Multitarea Gestionada</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Baja Activación</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>💥 Alta Fragmentación</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Fragmentación ${puntuacionFragmentacion}/25, Foco ${puntuacionFoco}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>💥 Fragmentación</span>
                  <span className={styles.scoreValue}>{puntuacionFragmentacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFragmentacion}`}
                    style={{ width: `${(puntuacionFragmentacion / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🎯 Foco</span>
                  <span className={styles.scoreValue}>{puntuacionFoco}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFoco}`}
                    style={{ width: `${(puntuacionFoco / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <span className={styles.profileEmoji}>{perfil.emoji}</span>
                <h3 className={styles.profileName}>{perfil.nombre}</h3>
              </div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>

              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>✅ Fortalezas</h4>
                  <ul className={styles.profileList}>
                    {perfil.fortalezas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}>⚠️ Riesgos</h4>
                  <ul className={styles.profileList}>
                    {perfil.riesgos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h4 className={styles.actionsTitle}>🎯 Acciones sugeridas</h4>
                <ol className={styles.actionsList}>
                  {perfil.acciones.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button className={styles.btnSecondary} onClick={reiniciar}>
              Repetir diagnóstico
            </button>
          </section>
        )}

        <EducationalSection
          title="📚 La ciencia del cambio de contexto"
          subtitle="Por qué la multitarea rara vez funciona como crees"
        >
          <section className={styles.guideSection}>
            <h2>El mito de la multitarea</h2>
            <p>
              Durante décadas, la multitarea se vendió como una habilidad deseable. Pero la
              neurociencia ha demostrado que lo que llamamos &quot;multitarea&quot; es en realidad
              <strong> cambio de contexto rápido</strong> (<em>context-switching</em>). El cerebro
              no procesa dos tareas cognitivas simultáneamente — alterna entre ellas,
              y cada alternancia tiene un coste.
            </p>

            <h2>El coste del switching</h2>
            <p>
              Un estudio de la Universidad de California-Irvine (Gloria Mark, 2004) encontró que:
            </p>
            <ul>
              <li>El trabajador promedio es interrumpido cada <strong>11 minutos</strong>.</li>
              <li>Recuperar la concentración plena después de una interrupción tarda <strong>25 minutos</strong>.</li>
              <li>Esto significa que la mayoría de personas <strong>nunca alcanzan concentración profunda</strong> en un día laboral típico.</li>
            </ul>

            <h2>Deep Work: la alternativa</h2>
            <p>
              Cal Newport, en <em>Deep Work</em> (2016), argumenta que la capacidad de concentrarse
              sin distracción en tareas cognitivamente exigentes es cada vez más valiosa y cada vez más rara.
              La propone como una habilidad que se puede entrenar, no como un talento innato.
            </p>
            <p>
              Su recomendación: crear <strong>rituales de concentración</strong> (mismo lugar,
              misma hora, mismo ritual de inicio) que señalen al cerebro que es momento de enfocarse.
              Con práctica, el tiempo hasta alcanzar concentración profunda se reduce significativamente.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Newport, C. (2016). <em>Deep Work: Rules for Focused Success in a Distracted World</em>. Grand Central Publishing.</li>
              <li>Mark, G. (2023). <em>Attention Span: A Groundbreaking Way to Restore Balance, Happiness and Productivity</em>. Hanover Square Press.</li>
              <li>Levitin, D. (2014). <em>The Organized Mind: Thinking Straight in the Age of Information Overload</em>. Dutton.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-multitarea')} />
        <ShareCard appName="diagnostico-multitarea" />
        <Footer appName="diagnostico-multitarea" />
      </div>
    </>
  );
}
