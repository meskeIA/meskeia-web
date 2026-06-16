'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MapaAutomatizacionPersonal.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

/* ─── Tipos ─── */

interface Pregunta {
  id: number;
  texto: string;
  dimension: 'automatizacion' | 'proteccion';
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
  // Intercaladas: automatización de lo rutinario (A) y protección de lo creativo (B) en patrón ABABABABAB
  { id: 1, texto: 'He identificado qué tareas de mi trabajo son repetitivas y podrían automatizarse', dimension: 'automatizacion' },
  { id: 2, texto: 'Tengo claro qué parte de mi trabajo requiere juicio humano y NO debería delegarse a una máquina', dimension: 'proteccion' },
  { id: 3, texto: 'Uso herramientas (IA, plantillas, scripts, macros) para reducir tiempo en tareas rutinarias', dimension: 'automatizacion' },
  { id: 4, texto: 'Dedico tiempo regularmente a las tareas creativas o estratégicas que me diferencian profesionalmente', dimension: 'proteccion' },
  { id: 5, texto: 'Cuando detecto una tarea que hago más de 3 veces, busco forma de automatizarla o simplificarla', dimension: 'automatizacion' },
  { id: 6, texto: 'Protejo activamente el tiempo para pensar, crear o decidir sin interrupciones ni atajos', dimension: 'proteccion' },
  { id: 7, texto: 'El tiempo que ahorro automatizando lo dedico a trabajo de mayor valor, no a más tareas rutinarias', dimension: 'automatizacion' },
  { id: 8, texto: 'Puedo distinguir cuándo un resultado "suficientemente bueno" de la IA es aceptable y cuándo necesita mi toque personal', dimension: 'proteccion' },
  { id: 9, texto: 'Reviso periódicamente mis flujos de trabajo para encontrar nuevas oportunidades de automatización', dimension: 'automatizacion' },
  { id: 10, texto: 'Las habilidades que más me importan profesionalmente las practico yo, no las delego aunque podría', dimension: 'proteccion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(automatizacion: number, proteccion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (automatizacion >= umbralAlto && proteccion >= umbralAlto) {
    return {
      nombre: 'Automatizador Estratégico',
      emoji: '🎯',
      descripcion: 'Automatizas lo rutinario y proteges lo creativo. Sabes qué delegar a las máquinas y qué mantener humano. El tiempo que ganas con la automatización lo inviertes en trabajo de alto valor, no en más tareas rutinarias. Es el perfil más eficiente y el más sostenible a largo plazo.',
      fortalezas: [
        'Distinción clara entre lo automatizable y lo que requiere juicio humano',
        'Tiempo liberado que se reinvierte en trabajo de mayor impacto',
        'Habilidades clave protegidas y practicadas activamente',
      ],
      riesgos: [
        'Sobreingeniería: automatizar cosas que no lo merecen (el coste de automatizar supera el ahorro)',
        'Rigidez en la clasificación: tareas que hoy son creativas mañana pueden ser rutinarias (y viceversa)',
        'Dependencia de los sistemas de automatización que has construido',
      ],
      acciones: [
        'Revisar tu mapa de automatización cada trimestre: ¿sigue vigente la clasificación? ¿hay nuevas tareas que automatizar o proteger?',
        'Para cada automatización, preguntarte: "¿Qué pasa si esto deja de funcionar?" — tener siempre un plan manual de respaldo',
        'Medir no solo el tiempo ahorrado, sino la calidad del trabajo que haces con ese tiempo — si lo llenas de más rutina, la automatización no está cumpliendo su propósito',
      ],
    };
  }

  if (automatizacion >= umbralAlto && proteccion < umbralBajo) {
    return {
      nombre: 'Automatizador Compulsivo',
      emoji: '🤖',
      descripcion: 'Automatizas mucho — quizá demasiado. Buscas eficiencia en todo, pero no distingues bien entre lo que puede delegarse y lo que debería seguir siendo humano. El riesgo es que acabes automatizando lo que te hace valioso: el criterio, la creatividad, la relación con otros.',
      fortalezas: [
        'Fuerte orientación a la eficiencia y eliminación de repetición',
        'Conocimiento avanzado de herramientas de automatización',
        'Productividad alta en volumen de tareas procesadas',
      ],
      riesgos: [
        'Erosión de habilidades creativas por falta de práctica',
        'Resultado "suficientemente bueno" que reemplaza la excelencia donde importa',
        'Pérdida de la dimensión humana del trabajo (relaciones, intuición, contexto)',
      ],
      acciones: [
        'Hacer una lista de "tareas que NUNCA debería automatizar" — las que requieren tu juicio, creatividad o relación personal — y protegerlas activamente',
        'Esta semana, elegir una tarea que normalmente automatizas y hacerla manualmente. ¿La calidad es diferente? ¿Pierdes algo al automatizarla?',
        'Para cada nueva automatización, preguntarte: "¿Estoy ahorrando tiempo o estoy perdiendo una habilidad?"',
      ],
    };
  }

  if (automatizacion < umbralBajo && proteccion >= umbralAlto) {
    return {
      nombre: 'Artesano Consciente',
      emoji: '✋',
      descripcion: 'Proteges bien lo que importa — tus habilidades clave, tu creatividad, tu criterio — pero no aprovechas la automatización para lo rutinario. Haces manualmente tareas que una máquina podría hacer igual o mejor, consumiendo tiempo que podrías dedicar a lo que realmente importa.',
      fortalezas: [
        'Habilidades profesionales intactas y practicadas',
        'Clara consciencia de lo que requiere juicio humano',
        'Calidad alta en el trabajo que consideras importante',
      ],
      riesgos: [
        'Tiempo perdido en tareas rutinarias que podrían automatizarse',
        'Menos tiempo disponible para las tareas creativas que dices proteger',
        'Resistencia a la automatización que puede convertirse en desventaja competitiva',
      ],
      acciones: [
        'Identificar las 3 tareas más repetitivas de tu semana y probar a automatizar UNA — sin comprometer nada creativo, solo lo mecánico',
        'Calcular cuántas horas a la semana dedicas a tareas rutinarias — si es más del 40%, hay margen de automatización sin riesgo',
        'Recordar que automatizar lo rutinario no es pereza: es liberar tiempo para lo que realmente merece tu atención humana',
      ],
    };
  }

  if (automatizacion < umbralBajo && proteccion < umbralBajo) {
    return {
      nombre: 'Sin Mapa',
      emoji: '🌀',
      descripcion: 'Ni automatizas lo rutinario ni proteges conscientemente lo creativo. Las tareas se hacen como siempre, sin distinguir cuáles merecen tu tiempo y cuáles podrían simplificarse. No es un problema de herramientas — es de reflexión: no te has parado a clasificar tu trabajo en estas dos categorías.',
      fortalezas: [
        'Punto de partida limpio: cualquier clasificación será una mejora',
        'Probablemente haces más trabajo creativo del que crees (solo no lo tienes identificado)',
        'La primera automatización que implementes tendrá impacto inmediato',
      ],
      riesgos: [
        'Tiempo valioso consumido por tareas que no lo merecen',
        'Habilidades creativas que se practican por casualidad, no por diseño',
        'Vulnerabilidad ante cambios: sin mapa, cualquier disrupción te pilla sin plan',
      ],
      acciones: [
        'Esta semana, dedicar 15 minutos a listar todas tus tareas habituales y clasificarlas en dos columnas: "rutinaria" y "requiere mi criterio" — solo clasificar, nada más',
        'De la columna "rutinaria", elegir la más frecuente y buscar si existe una herramienta que la simplifique — no automatizar todo, solo UNA cosa',
        'De la columna "requiere mi criterio", elegir la más importante y proteger 2 horas a la semana para dedicarle atención plena',
      ],
    };
  }

  // Perfiles intermedios
  if (automatizacion >= proteccion) {
    return {
      nombre: 'Tendencia a Automatizar',
      emoji: '⚙️',
      descripcion: 'Automatizas más de lo que proteges. Buscas eficiencia y la encuentras, pero no siempre reflexionas sobre qué debería quedar fuera de la automatización. El impulso de "si puede hacerlo una máquina, que lo haga" es válido para lo rutinario, pero peligroso si se extiende a lo creativo.',
      fortalezas: [
        'Orientación a la eficiencia y eliminación de repetición',
        'Conocimiento de herramientas que ahorran tiempo',
        'Disposición a cambiar flujos de trabajo cuando hay mejor opción',
      ],
      riesgos: [
        'Frontera difusa entre lo automatizable y lo que necesita criterio humano',
        'Habilidades creativas que reciben menos atención de la que merecen',
        'Sensación de productividad que enmascara pérdida de profundidad',
      ],
      acciones: [
        'Para cada tarea que automatices, preguntarte: "¿Qué pierdo al dejar de hacerla yo?" — si la respuesta es "nada", automatiza. Si hay duda, investiga',
        'Reservar un bloque semanal de "trabajo sin atajos": una hora donde haces trabajo creativo sin asistencia de ninguna herramienta — para mantener el músculo',
        'Pedir feedback a alguien de confianza: "¿Notas diferencia de calidad en mi trabajo automatizado vs mi trabajo manual?"',
      ],
    };
  }

  return {
    nombre: 'Tendencia a Proteger',
    emoji: '🛡️',
    descripcion: 'Proteges lo creativo más de lo que automatizas lo rutinario. Valoras tus habilidades y dedicas tiempo a lo que importa, pero podrías liberar más horas si automatizaras las tareas mecánicas que sigues haciendo manualmente. Tu instinto de protección es correcto; falta complementarlo con eficiencia.',
    fortalezas: [
      'Consciencia clara de qué habilidades son valiosas',
      'Calidad alta en trabajo creativo y estratégico',
      'Práctica activa de las competencias que te diferencian',
    ],
    riesgos: [
      'Tiempo innecesariamente consumido por tareas rutinarias',
      'Menos margen del que podrías tener para el trabajo de alto valor',
      'Resistencia a automatizar que se convierte en ineficiencia crónica',
    ],
    acciones: [
      'Hacer un "inventario de tiempo": esta semana, anotar cuánto tiempo dedicas a tareas rutinarias vs creativas. Si lo rutinario supera el 50%, hay oportunidad clara',
      'Elegir la tarea rutinaria más frecuente y buscar UNA herramienta que la simplifique — prueba sin compromiso, una semana',
      'Pensar en la automatización como un aliado de la protección: cuanto menos tiempo gastes en lo mecánico, más tendrás para lo que realmente importa',
    ],
  };
}

/* ─── Componente ─── */

export default function MapaAutomatizacionPersonalPage() {
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

  const puntuacionAutomatizacion = PREGUNTAS
    .filter((p) => p.dimension === 'automatizacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionProteccion = PREGUNTAS
    .filter((p) => p.dimension === 'proteccion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAutomatizacion, puntuacionProteccion);

  // Posición en el mapa (0-100%) — X: protección, Y: automatización
  const posX = ((puntuacionProteccion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionAutomatizacion - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🗺️</span> Mapa de Automatización Personal</h1>
          <p className={styles.subtitle}>
            ¿Qué tareas deberías automatizar y cuáles proteger?
            <br />
            Automatizar lo rutinario y proteger lo creativo
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}><span aria-hidden="true">🕐</span> 3 minutos</span>
            <span className={styles.badge}><span aria-hidden="true">📊</span> 10 preguntas</span>
            <span className={styles.badge}><span aria-hidden="true">🔒</span> Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>
            No todas las tareas de tu trabajo merecen el mismo trato. Algunas son <strong>rutinarias</strong>:
            repetitivas, predecibles, con reglas claras. Esas son candidatas perfectas para automatizar.
            Otras son <strong>creativas</strong>: requieren criterio, contexto, intuición. Esas son las
            que te hacen valioso y deberían protegerse.
          </p>
          <p>
            El error más común no es automatizar poco o mucho — es <strong>automatizar lo incorrecto</strong>:
            delegar a una máquina lo que te diferencia, o seguir haciendo manualmente lo que una
            herramienta haría igual.
            <strong> Este test mide cómo gestionas ambas dimensiones.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo distribuyes tu tiempo entre tareas rutinarias y creativas
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que ocurre realmente, no lo que debería ocurrir
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
                    type="button"
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
            type="button"
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
                <span className={styles.mapLabelTop}><span aria-hidden="true">⚙️</span> Alta automatización</span>
                <span className={styles.mapLabelBottom}>Baja automatización</span>
                <span className={styles.mapLabelLeft}>Baja protección</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">🛡️</span> Alta protección</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🤖</span> Automatizador Compulsivo</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">🎯</span> Automatizador Estratégico</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">🌀</span> Sin Mapa</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">✋</span> Artesano Consciente</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Automatización ${puntuacionAutomatizacion}/25, Protección ${puntuacionProteccion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">⚙️</span> Automatización de lo rutinario</span>
                  <span className={styles.scoreValue}>{puntuacionAutomatizacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAutomatizacion}`}
                    style={{ width: `${(puntuacionAutomatizacion / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🛡️</span> Protección de lo creativo</span>
                  <span className={styles.scoreValue}>{puntuacionProteccion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barProteccion}`}
                    style={{ width: `${(puntuacionProteccion / 25) * 100}%` }}
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
                  <h4 className={styles.columnTitle}><span aria-hidden="true">✅</span> Fortalezas</h4>
                  <ul className={styles.profileList}>
                    {perfil.fortalezas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.profileColumn}>
                  <h4 className={styles.columnTitle}><span aria-hidden="true">⚠️</span> Riesgos</h4>
                  <ul className={styles.profileList}>
                    {perfil.riesgos.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h4 className={styles.actionsTitle}><span aria-hidden="true">🎯</span> Acciones sugeridas</h4>
                <ol className={styles.actionsList}>
                  {perfil.acciones.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button type="button" className={styles.btnSecondary} onClick={reiniciar}>
              Repetir diagnóstico
            </button>
          </section>
        )}

        <EducationalSection
          title="📚 La matriz rutinario vs creativo: dónde poner tu energía"
          subtitle="No todo merece el mismo tipo de atención"
        >
          <section className={styles.guideSection}>
            <h2>El mito de automatizar todo</h2>
            <p>
              La narrativa dominante sobre la IA y la automatización dice: &quot;automatiza todo lo
              que puedas&quot;. Pero hay un matiz crucial que se pierde: <strong>no todo lo que puede
              automatizarse debería automatizarse</strong>.
            </p>
            <p>
              Algunas tareas que parecen rutinarias contienen un componente de juicio que solo notas
              cuando lo pierdes. Un email de respuesta a un cliente puede parecer rutinario, pero el
              tono, la empatía y el contexto que aportas manualmente tienen un valor que un template
              automático no replica.
            </p>

            <h2>Dos tipos de tareas, dos estrategias</h2>
            <p>
              Las <strong>tareas rutinarias</strong> tienen reglas claras, son repetitivas y su
              resultado es predecible. Formatear datos, enviar recordatorios, generar informes
              estándar, clasificar emails. Para estas, la automatización es puro beneficio.
            </p>
            <p>
              Las <strong>tareas creativas</strong> requieren juicio, contexto, empatía o
              originalidad. Escribir una propuesta estratégica, tomar una decisión con información
              incompleta, dar feedback a un miembro del equipo, negociar un acuerdo. Para estas,
              la automatización puede ayudar (borradores, datos, opciones) pero el resultado final
              necesita tu intervención.
            </p>
            <p>
              La clave es la <strong>clasificación consciente</strong>: saber en qué categoría
              cae cada tarea y tratarla en consecuencia.
            </p>

            <h2>El coste oculto de automatizar lo incorrecto</h2>
            <p>
              Cuando automatizas una tarea creativa, ganas velocidad pero pierdes algo más difícil
              de medir: la práctica de una habilidad. El trabajo profundo y concentrado suele
              producir resultados de mayor valor en muchas tareas creativas o analíticas. Si delegas
              eso a una máquina, la máquina produce el output pero tú pierdes la capacidad.
            </p>
            <p>
              Cuando haces manualmente una tarea rutinaria, puede ser por una buena razón: ritual,
              placer, ejercicio de paciencia, calidad superior. O puede ser inercia. La pregunta no
              es si automatizas o no, sino si tu elección es consciente.
            </p>

            <h2>La regla de los 3 criterios</h2>
            <p>
              Antes de automatizar cualquier tarea, pásala por estos tres filtros:
            </p>
            <ol>
              <li><strong>¿Es repetitiva?</strong> Si la haces más de 3 veces al mes de forma similar, es candidata.</li>
              <li><strong>¿Tiene reglas claras?</strong> Si puedes escribir las instrucciones exactas, una máquina puede seguirlas.</li>
              <li><strong>¿La calidad importa de forma específica?</strong> Si un resultado &quot;genérico pero correcto&quot; es suficiente, automatiza. Si necesita tu voz, tu criterio o tu contexto, protégela.</li>
            </ol>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Newport, C. (2016). <em>Deep Work: Rules for Focused Success in a Distracted World</em>. Grand Central Publishing.</li>
              <li>Davenport, T.H. y Kirby, J. (2016). <em>Only Humans Need Apply</em>. Harper Business.</li>
              <li>Autor, D. (2015). <em>Why Are There Still So Many Jobs?</em> Journal of Economic Perspectives.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('mapa-automatizacion-personal')} />
        <ShareCard appName="mapa-automatizacion-personal" />
        <Footer appName="mapa-automatizacion-personal" />
    </div>
  );
}
