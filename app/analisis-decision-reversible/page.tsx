'use client';

import { useState } from 'react';
import styles from './AnalisisDecisionReversible.module.css';
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
  dimension: 'paralisis' | 'prudencia';
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
  { id: 1, texto: 'Doy muchas vueltas a decisiones que en el fondo podría probar y cambiar si no funcionan', dimension: 'paralisis' },
  { id: 6, texto: 'Antes de tomar una decisión difícil de revertir, me tomo el tiempo necesario para analizar', dimension: 'prudencia' },
  { id: 2, texto: 'Me cuesta elegir entre opciones incluso cuando ninguna tiene consecuencias graves', dimension: 'paralisis' },
  { id: 7, texto: 'Sé distinguir entre decisiones que puedo cambiar después y las que no tienen vuelta atrás', dimension: 'prudencia' },
  { id: 3, texto: 'Pospongo decisiones esperando tener "toda la información", aunque sé que nunca la tendré', dimension: 'paralisis' },
  { id: 8, texto: 'Pido consejo o busco perspectivas diferentes cuando la decisión es realmente importante', dimension: 'prudencia' },
  { id: 4, texto: 'El miedo a equivocarme me frena más de lo que debería', dimension: 'paralisis' },
  { id: 9, texto: 'Evalúo el peor escenario realista antes de decidir algo con consecuencias significativas', dimension: 'prudencia' },
  { id: 5, texto: 'Cuando tomo una decisión, sigo pensando si era la correcta mucho después de haberla tomado', dimension: 'paralisis' },
  { id: 10, texto: 'He aprendido de decisiones pasadas y he incorporado esas lecciones a mi forma de decidir', dimension: 'prudencia' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(paralisis: number, prudencia: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (paralisis >= umbralAlto && prudencia >= umbralAlto) {
    return {
      nombre: 'Analista Ansioso',
      emoji: '🔄',
      descripcion: 'Analizas mucho Y te bloqueas mucho. Tienes las herramientas para decidir bien (prudencia), pero el miedo a equivocarte las convierte en una trampa. El análisis que debería darte claridad te genera más dudas. Bezos diría que estás tratando todas las puertas como tipo 1 cuando muchas son tipo 2.',
      fortalezas: [
        'Capacidad de análisis profundo',
        'Baja probabilidad de decisiones impulsivas graves',
        'Conciencia de la importancia de decidir bien',
      ],
      riesgos: [
        'Parálisis por análisis: pensar más no siempre produce mejores decisiones',
        'Coste de oportunidad: mientras analizas, las opciones pueden desaparecer',
        'Estrés crónico por rumiación post-decisión',
      ],
      acciones: [
        'Clasifica cada decisión pendiente como "reversible" o "irreversible". Las reversibles: decide en 24h máximo. Las irreversibles: tómate el tiempo que necesites.',
        'Para decisiones reversibles, prueba la "regla del 70%": si tienes el 70% de la información, decide ya. El 30% restante raramente cambia el resultado.',
        'Cuando te descubras dando vueltas a una decisión ya tomada, pregúntate: "¿Puedo cambiarla?" Si sí, para de rumiar. Si no, para de rumiar también.',
      ],
    };
  }

  if (paralisis >= umbralAlto && prudencia < umbralBajo) {
    return {
      nombre: 'Bloqueo Decisional',
      emoji: '🧊',
      descripcion: 'Alta parálisis sin prudencia compensatoria: no es que analices demasiado, es que el miedo a decidir te paraliza. La diferencia importa: la parálisis por análisis viene de pensar mucho; la tuya viene de sentir mucho (miedo, ansiedad, perfeccionismo). Son problemas diferentes con soluciones diferentes.',
      fortalezas: [
        'Reconocer el bloqueo es el primer paso',
        'No tomas decisiones impulsivas (por el motivo equivocado, pero el resultado es el mismo)',
        'Hay mucho margen de mejora con pequeños cambios de hábito',
      ],
      riesgos: [
        'La inacción es una decisión en sí misma — y suele ser la peor',
        'Los demás pueden perder confianza si te perciben como indeciso',
        'El bloqueo tiende a empeorar si no se aborda (se refuerza con cada decisión evitada)',
      ],
      acciones: [
        'Empieza con "microdecisiones": cada día, toma UNA decisión pequeña en menos de 10 segundos sin darle más vueltas. Entrena el músculo.',
        'Cuando te bloquees, pregúntate: "¿Qué es lo peor que puede pasar?" y luego: "¿Podría vivir con eso?" — si la respuesta es sí, decide.',
        'Si el bloqueo es persistente, considera si hay ansiedad detrás — un profesional puede ayudar con herramientas específicas.',
      ],
    };
  }

  if (paralisis < umbralBajo && prudencia >= umbralAlto) {
    return {
      nombre: 'Decisor Estratégico',
      emoji: '♟️',
      descripcion: 'Baja parálisis y alta prudencia: decides con agilidad las cosas pequeñas y con profundidad las grandes. Este es el perfil que Bezos describe como ideal: tratar las puertas tipo 2 (reversibles) con rapidez y las tipo 1 (irreversibles) con cuidado. No desperdicias energía donde no hace falta.',
      fortalezas: [
        'Excelente calibración entre velocidad y profundidad',
        'Energía decisional bien distribuida',
        'Alta probabilidad de buenas decisiones tanto rápidas como lentas',
      ],
      riesgos: [
        'Riesgo de sobreconfianza: incluso los buenos decisores cometen errores',
        'En entornos nuevos, tu calibración puede fallar temporalmente',
        'Los demás pueden malinterpretar tu rapidez en decisiones pequeñas como falta de reflexión',
      ],
      acciones: [
        'Mantén tu sistema pero cuestiónalo periódicamente: ¿sigo clasificando bien qué es tipo 1 y qué es tipo 2?',
        'Busca feedback sobre tus decisiones pasadas — tanto las rápidas como las analizadas — para refinar tu calibración',
        'Comparte tu framework con otros: "¿Esto es reversible o irreversible?" es una pregunta poderosa para equipos',
      ],
    };
  }

  if (paralisis < umbralBajo && prudencia < umbralBajo) {
    return {
      nombre: 'Impulso sin Filtro',
      emoji: '🎲',
      descripcion: 'Baja parálisis y baja prudencia: decides rápido todo, incluyendo lo que debería llevar más análisis. No te bloqueas (bien), pero tampoco distingues cuándo deberías ir más despacio (riesgo). La velocidad es una virtud solo cuando se aplica a las decisiones correctas.',
      fortalezas: [
        'Velocidad de ejecución — no pierdes tiempo en indecisión',
        'Capacidad de actuar bajo incertidumbre',
        'Sesgo hacia la acción (mejor que el sesgo hacia la inacción)',
      ],
      riesgos: [
        'Decisiones irreversibles tomadas con la misma ligereza que las reversibles',
        'Acumulación de errores en decisiones importantes',
        'Los demás pueden percibir imprudencia donde tú ves decisión',
      ],
      acciones: [
        'Antes de decidir algo importante, hazte UNA pregunta: "Si esto sale mal, ¿puedo deshacerlo?" Si la respuesta es no, para y analiza.',
        'Crea una "lista de decisiones tipo 1" (las que NO se pueden revertir: firmar un contrato, mudarse, aceptar un puesto) y para esas, oblígate a esperar 48h.',
        'Lleva un registro de decisiones importantes durante 3 meses — los patrones te dirán si tu velocidad está funcionando o no.',
      ],
    };
  }

  if (paralisis >= prudencia) {
    return {
      nombre: 'Tendencia a la Parálisis',
      emoji: '🐢',
      descripcion: 'Tu parálisis supera ligeramente a tu prudencia. No es extremo, pero indica que el miedo a equivocarte pesa más que tu sistema de análisis. Probablemente pierdes más oportunidades por no decidir que por decidir mal.',
      fortalezas: [
        'Cautela que evita errores graves',
        'Algo de prudencia funcional',
        'Conciencia de que decides despacio',
      ],
      riesgos: [
        'El coste de no decidir suele ser invisible pero real',
        'La parálisis se refuerza sola: cada vez que evitas decidir, la siguiente vez es más difícil',
        'Otros deciden por ti cuando tú no decides',
      ],
      acciones: [
        'La próxima vez que pospongas una decisión, pon un timer de 5 minutos y decide antes de que suene — para decisiones reversibles esto funciona sorprendentemente bien',
        'Haz un experimento: durante una semana, decide todo lo reversible en el momento, sin posponerlo. Observa qué pasa.',
        'Cuando sientas el impulso de posponer, pregúntate: "¿Tendré mejor información mañana?" Si la respuesta es no, decide hoy.',
      ],
    };
  }

  return {
    nombre: 'Tendencia a la Acción',
    emoji: '🏃',
    descripcion: 'Tu prudencia supera ligeramente a tu parálisis, pero la combinación indica un buen sesgo hacia la acción. Decides con razonable rapidez las cosas pequeñas y con algo más de cuidado las grandes. Mantén este equilibrio.',
    fortalezas: [
      'Buen equilibrio entre acción y reflexión',
      'Sesgo productivo hacia la decisión',
      'Capacidad de aprender de los resultados',
    ],
    riesgos: [
      'Picos de estrés pueden inclinar la balanza hacia la impulsividad',
      'Necesidad de mantener activamente la distinción entre tipos de decisión',
      'La confianza en tu sistema puede hacerte descuidar el análisis en decisiones clave',
    ],
    acciones: [
      'Revisa periódicamente tus decisiones pasadas: ¿las rápidas fueron buenas? ¿las analizadas fueron mejores?',
      'Cuando te enfrentes a una decisión nueva, clasifícala explícitamente: "esto es tipo 1" o "esto es tipo 2"',
      'Comparte tu proceso de decisión con alguien — verbalizar ayuda a detectar puntos ciegos',
    ],
  };
}

/* ─── Componente ─── */

export default function AnalisisDecisionReversiblePage() {
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

  const puntuacionParalisis = PREGUNTAS
    .filter((p) => p.dimension === 'paralisis')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionPrudencia = PREGUNTAS
    .filter((p) => p.dimension === 'prudencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionParalisis, puntuacionPrudencia);

  const posX = ((puntuacionParalisis - 5) / 20) * 100;
  const posY = 100 - ((puntuacionPrudencia - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🚪 Decisiones Reversibles vs Irreversibles</h1>
          <p className={styles.subtitle}>
            ¿Das vueltas a cosas que podrías simplemente probar?
            <br />
            Basado en el marco de Jeff Bezos: puertas tipo 1 y tipo 2
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
            Jeff Bezos clasifica las decisiones en dos tipos: <strong>Tipo 1 (puertas de un solo sentido)</strong>
            — irreversibles, con consecuencias permanentes — y <strong>Tipo 2 (puertas de dos sentidos)</strong>
            — reversibles, donde puedes volver atrás si no funciona.
          </p>
          <p>
            El error más común: <strong>tratar todas las decisiones como si fueran tipo 1</strong>.
            Esto paraliza organizaciones y personas. La mayoría de decisiones son tipo 2 —
            puedes probar, aprender y ajustar. Reservar el análisis profundo para las tipo 1
            es la clave de la velocidad con calidad.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo enfrentas las decisiones
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según tu comportamiento habitual
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
                <span className={styles.mapLabelTop}>♟️ Alta Prudencia</span>
                <span className={styles.mapLabelBottom}>Baja Prudencia</span>
                <span className={styles.mapLabelLeft}>Baja Parálisis</span>
                <span className={styles.mapLabelRight}>🧊 Alta Parálisis</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>♟️ Decisor Estratégico</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🔄 Analista Ansioso</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🎲 Impulso sin Filtro</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🧊 Bloqueo Decisional</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Parálisis ${puntuacionParalisis}/25, Prudencia ${puntuacionPrudencia}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🧊 Parálisis</span>
                  <span className={styles.scoreValue}>{puntuacionParalisis}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barParalisis}`}
                    style={{ width: `${(puntuacionParalisis / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>♟️ Prudencia</span>
                  <span className={styles.scoreValue}>{puntuacionPrudencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barPrudencia}`}
                    style={{ width: `${(puntuacionPrudencia / 25) * 100}%` }}
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
          title="📚 Puertas tipo 1 y tipo 2: el framework de Bezos"
          subtitle="Decidir bien no es decidir lento — es decidir con el nivel correcto de análisis"
        >
          <section className={styles.guideSection}>
            <h2>El origen del marco</h2>
            <p>
              En su carta a accionistas de Amazon de 1997, Jeff Bezos introdujo una distinción
              que se ha convertido en referencia para la toma de decisiones empresariales:
            </p>
            <ul>
              <li><strong>Decisiones tipo 1 (puertas de un sentido)</strong>: Irreversibles o muy difíciles de revertir. Merecen análisis profundo, múltiples perspectivas y deliberación. Ejemplo: firmar una hipoteca, aceptar un trabajo en otra ciudad.</li>
              <li><strong>Decisiones tipo 2 (puertas de dos sentidos)</strong>: Reversibles. Puedes cruzar la puerta, ver qué hay al otro lado, y volver si no te gusta. Ejemplo: probar un nuevo restaurante, cambiar de herramienta de trabajo, publicar un artículo.</li>
            </ul>

            <h2>El error organizacional</h2>
            <p>
              Bezos observó que a medida que las organizaciones crecen, <strong>empiezan a tratar
              todas las decisiones como tipo 1</strong>: reuniones, aprobaciones, análisis, comités...
              para decisiones que podrían simplemente probarse. Esto ralentiza todo sin mejorar
              la calidad de las decisiones.
            </p>
            <p>
              El mismo patrón ocurre a nivel personal: tratamos la elección de un curso online
              (tipo 2) con la misma agonía que la compra de una casa (tipo 1).
            </p>

            <h2>La regla del 70% de información</h2>
            <p>
              Bezos también propuso que para decisiones tipo 2, si tienes el 70% de la información
              que necesitas, deberías decidir. Esperar al 90% suele ser demasiado lento — y el
              20% adicional de información raramente cambia la decisión.
            </p>
            <p>
              Para decisiones tipo 1, en cambio, merece la pena buscar más información, más
              perspectivas y más tiempo. El coste de decidir mal es alto y la reversibilidad baja.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Bezos, J. (1997-2020). <em>Cartas anuales a accionistas de Amazon</em>.</li>
              <li>Duke, A. (2018). <em>Thinking in Bets: Making Smarter Decisions When You Don&apos;t Have All the Facts</em>. Portfolio.</li>
              <li>Johnson, S. (2018). <em>Farsighted: How We Make the Decisions That Matter the Most</em>. Riverhead Books.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('analisis-decision-reversible')} />
        <ShareCard appName="analisis-decision-reversible" />
        <Footer appName="analisis-decision-reversible" />
      </div>
    </>
  );
}
