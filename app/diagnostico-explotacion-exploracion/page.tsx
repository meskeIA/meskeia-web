'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './DiagnosticoExplotacionExploracion.module.css';
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
  dimension: 'explotacion' | 'exploracion';
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
  // Intercaladas: explotación (A) y exploración (B) en patrón ABABABABAB
  { id: 1, texto: 'Priorizamos mejorar lo que ya funciona antes que probar cosas nuevas', dimension: 'explotacion' },
  { id: 6, texto: 'Dedicamos tiempo regularmente a experimentar con nuevas ideas o enfoques', dimension: 'exploracion' },
  { id: 2, texto: 'Nuestros procesos están bien definidos y los seguimos con disciplina', dimension: 'explotacion' },
  { id: 7, texto: 'Se permite (y se valora) el error como parte del aprendizaje', dimension: 'exploracion' },
  { id: 3, texto: 'La mayoría de nuestras reuniones se centran en resultados a corto plazo', dimension: 'explotacion' },
  { id: 8, texto: 'Invertimos recursos en proyectos sin retorno garantizado a corto plazo', dimension: 'exploracion' },
  { id: 4, texto: 'Medimos el éxito principalmente por la eficiencia y el cumplimiento de objetivos inmediatos', dimension: 'explotacion' },
  { id: 9, texto: 'Buscamos activamente perspectivas externas y nuevas formas de hacer las cosas', dimension: 'exploracion' },
  { id: 5, texto: 'Cuando algo funciona, preferimos no tocarlo', dimension: 'explotacion' },
  { id: 10, texto: 'Reservamos tiempo específico para pensar en el futuro, no solo en el día a día', dimension: 'exploracion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(explotacion: number, exploracion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (explotacion >= umbralAlto && exploracion >= umbralAlto) {
    return {
      nombre: 'Organización Ambidiestra',
      emoji: '⚖️',
      descripcion: 'Tu organización combina eficiencia operativa con capacidad de innovación. Este es el perfil más equilibrado y el que mejor se adapta a entornos cambiantes. March lo consideraba el ideal, aunque también el más difícil de mantener.',
      fortalezas: [
        'Capacidad de ejecutar y experimentar simultáneamente',
        'Resiliencia ante cambios del entorno',
        'Cultura que valora tanto resultados como aprendizaje',
      ],
      riesgos: [
        'Tensión interna entre equipos de ejecución e innovación',
        'Riesgo de perder el equilibrio si la presión por resultados aumenta',
        'Necesidad de liderazgo fuerte para mantener ambas líneas',
      ],
      acciones: [
        'Proteger activamente el tiempo dedicado a exploración cuando lleguen presiones de corto plazo',
        'Revisar trimestralmente si el equilibrio se mantiene — los números de explotación tienden a crecer solos',
        'Crear canales de comunicación entre equipos de ejecución e innovación para que se alimenten mutuamente',
      ],
    };
  }

  if (explotacion >= umbralAlto && exploracion < umbralBajo) {
    return {
      nombre: 'Máquina de Eficiencia',
      emoji: '⚙️',
      descripcion: 'Tu organización es muy eficiente ejecutando lo que ya sabe hacer, pero dedica poco espacio a explorar alternativas. March advertía que este perfil es competitivo a corto plazo pero vulnerable a largo plazo: cuando el entorno cambia, le cuesta adaptarse.',
      fortalezas: [
        'Procesos optimizados y predecibles',
        'Resultados consistentes a corto plazo',
        'Equipo disciplinado y orientado a objetivos',
      ],
      riesgos: [
        'En sectores muy cambiantes, vulnerabilidad ante cambios del mercado o la tecnología',
        'Dificultad para atraer personas que buscan variedad en su trabajo',
        'Riesgo de obsolescencia progresiva ("trampa del éxito") en mercados que evolucionan rápido',
      ],
      acciones: [
        'Reservar un 15-20% del tiempo de al menos una persona del equipo para explorar ideas sin presión de resultados',
        'Crear un espacio mensual tipo "laboratorio" donde se puedan probar cosas sin consecuencias',
        'Preguntar en cada reunión trimestral: "¿Qué haríamos diferente si empezáramos hoy desde cero?"',
      ],
    };
  }

  if (explotacion < umbralBajo && exploracion >= umbralAlto) {
    return {
      nombre: 'Laboratorio Permanente',
      emoji: '🔬',
      descripcion: 'Tu organización explora mucho pero le cuesta capitalizar lo que descubre. March señalaba que explorar sin explotar genera ideas pero no resultados sostenibles. El riesgo es quedarse en la innovación perpetua sin llegar a consolidar.',
      fortalezas: [
        'Alta creatividad y apertura al cambio',
        'Capacidad de detectar oportunidades antes que otros',
        'Cultura de aprendizaje y tolerancia al error',
      ],
      riesgos: [
        'Dificultad para escalar lo que funciona',
        'Falta de procesos estables que soporten el crecimiento',
        'Fatiga por cambio constante en el equipo',
      ],
      acciones: [
        'Elegir UNA idea que haya funcionado y dedicar un trimestre entero a optimizarla sin cambiarla',
        'Establecer métricas claras de "cuándo una exploración se convierte en operación"',
        'Crear rituales de documentación: que lo aprendido no se pierda cuando llega la siguiente idea',
      ],
    };
  }

  if (explotacion < umbralBajo && exploracion < umbralBajo) {
    return {
      nombre: 'En Punto Muerto',
      emoji: '⏸️',
      descripcion: 'Tu organización no está optimizando lo que tiene ni explorando alternativas. Este perfil suele aparecer en momentos de transición, incertidumbre o agotamiento organizacional. No es necesariamente negativo, pero requiere una decisión consciente sobre hacia dónde avanzar.',
      fortalezas: [
        'Potencial de reinvención: no hay inercia que frene un cambio de dirección',
        'Oportunidad de diseñar desde cero el equilibrio correcto',
        'Momento ideal para hacer una pausa estratégica y redefinir prioridades',
      ],
      riesgos: [
        'Parálisis por análisis o falta de dirección',
        'Si la pausa se alarga sin decisión consciente, puede derivar en desmotivación del equipo o pérdida de dirección',
      ],
      acciones: [
        'Decidir UNA prioridad clara para los próximos 90 días: ¿optimizar algo existente o probar algo nuevo?',
        'Hacer un ejercicio de "pre-mortem": si dentro de un año todo ha ido mal, ¿qué habrá pasado?',
        'Hablar individualmente con 3-5 personas clave del equipo y preguntar: "¿Qué deberíamos estar haciendo que no hacemos?"',
      ],
    };
  }

  // Perfiles intermedios
  if (explotacion >= exploracion) {
    return {
      nombre: 'Tendencia a Explotar',
      emoji: '📊',
      descripcion: 'Tu organización tiene una inclinación hacia la eficiencia y la ejecución, con algo de espacio para la exploración. No es un desequilibrio grave, pero conviene vigilarlo: la presión del día a día tiende a ampliar esta brecha con el tiempo.',
      fortalezas: [
        'Base operativa sólida con cierta apertura al cambio',
        'Capacidad de ejecutar con fiabilidad',
        'Algo de margen para experimentar',
      ],
      riesgos: [
        'La exploración puede ser la primera víctima cuando aprietan los plazos',
        'Innovación percibida como "extra" en lugar de como necesidad',
        'Brecha que crece silenciosamente',
      ],
      acciones: [
        'Blindar el tiempo de exploración: ponerlo en agenda como si fuera una reunión con un cliente importante',
        'Medir y hacer visible el esfuerzo de exploración (horas, experimentos, aprendizajes)',
        'En cada decisión importante, preguntar: "¿Esto nos hace más eficientes hoy o más adaptables mañana?"',
      ],
    };
  }

  return {
    nombre: 'Tendencia a Explorar',
    emoji: '🧭',
    descripcion: 'Tu organización tiene más inclinación hacia la innovación y la experimentación que hacia la optimización. Esto indica una cultura creativa, pero conviene asegurar que las buenas ideas se convierten en resultados tangibles.',
    fortalezas: [
      'Cultura abierta y creativa',
      'Capacidad de adaptación ante cambios',
      'Equipo motivado por la novedad',
    ],
    riesgos: [
      'Ideas que no llegan a implementarse completamente',
      'Procesos poco definidos que generan ineficiencia',
      'Posible "fatiga de novedad" en el equipo',
    ],
    acciones: [
      'Para cada nueva idea, definir un criterio claro de "éxito mínimo" antes de empezar',
      'Dedicar tiempo a documentar y estandarizar lo que ya funciona bien',
      'Celebrar no solo las ideas nuevas, sino también la excelencia en la ejecución de las existentes',
    ],
  };
}

/* ─── Componente ─── */

export default function DiagnosticoExplotacionExploracionPage() {
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

  // Cálculos
  const puntuacionExplotacion = PREGUNTAS
    .filter((p) => p.dimension === 'explotacion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionExploracion = PREGUNTAS
    .filter((p) => p.dimension === 'exploracion')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionExplotacion, puntuacionExploracion);

  // Posición en el mapa (0-100%)
  const posX = ((puntuacionExplotacion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionExploracion - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">⚖️</span> Diagnóstico: Explotación vs Exploración</h1>
          <p className={styles.subtitle}>
            ¿Tu organización equilibra eficiencia e innovación?
            <br />
            Basado en el modelo de James G. March (1991)
          </p>
          <div className={styles.badges}>
            <span className={styles.badge}><span aria-hidden="true">🕐</span> 3 minutos</span>
            <span className={styles.badge}><span aria-hidden="true">📊</span> 10 preguntas</span>
            <span className={styles.badge}><span aria-hidden="true">🔒</span> Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        {/* Contexto breve */}
        <section className={styles.contextCard}>
          <p>
            En 1991, el académico <strong>James G. March</strong> describió una tensión fundamental en todas las organizaciones:
            dedicar recursos a <strong>explotar</strong> lo que ya funciona (eficiencia, procesos, resultados inmediatos)
            o a <strong>explorar</strong> nuevas posibilidades (innovación, aprendizaje, adaptación futura).
          </p>
          <p>
            Las organizaciones que solo explotan se vuelven eficientes pero pueden quedarse rígidas.
            Las que solo exploran generan ideas pero a veces no resultados.
            <strong> El equilibrio entre ambas suele ser determinante en entornos competitivos y cambiantes.</strong>
            {' '}En contextos más estables o de servicio público, lo razonable puede inclinarse claramente hacia uno de los dos lados.
          </p>
        </section>

        {/* Preguntas */}
        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu organización, equipo o proyecto actual
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
                    key={opcion.valor}
                    type="button"
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

        {/* Resultado */}
        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>

            {/* Mapa 2D */}
            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}><span aria-hidden="true">🔬</span> Alta Exploración</span>
                <span className={styles.mapLabelBottom}>Baja Exploración</span>
                <span className={styles.mapLabelLeft}>Baja Explotación</span>
                <span className={styles.mapLabelRight}><span aria-hidden="true">⚙️</span> Alta Explotación</span>
              </div>
              <div className={styles.map}>
                {/* Cuadrantes */}
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span><span aria-hidden="true">🔬</span> Laboratorio Permanente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span><span aria-hidden="true">⚖️</span> Ambidiestra</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span><span aria-hidden="true">⏸️</span> Punto Muerto</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span><span aria-hidden="true">⚙️</span> Máquina de Eficiencia</span>
                </div>
                {/* Líneas de umbral */}
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                {/* Punto de posición */}
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Explotación ${puntuacionExplotacion}/25, Exploración ${puntuacionExploracion}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            {/* Barras de puntuación */}
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">⚙️</span> Explotación</span>
                  <span className={styles.scoreValue}>{puntuacionExplotacion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barExplotacion}`}
                    style={{ width: `${(puntuacionExplotacion / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span><span aria-hidden="true">🔬</span> Exploración</span>
                  <span className={styles.scoreValue}>{puntuacionExploracion}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barExploracion}`}
                    style={{ width: `${(puntuacionExploracion / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Perfil */}
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

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 El modelo de March: explotación vs exploración"
          subtitle="El marco teórico detrás de este diagnóstico"
        >
          <section className={styles.guideSection}>
            <h2>¿Quién fue James G. March?</h2>
            <p>
              James G. March (1928-2018) fue uno de los pensadores más influyentes en teoría organizacional.
              Profesor en Stanford durante décadas, su trabajo ha influido en campos tan diversos como
              la economía, la ciencia política, la sociología y el management.
            </p>
            <p>
              En 1991 publicó <em>&quot;Exploration and Exploitation in Organizational Learning&quot;</em>,
              un artículo que se ha convertido en uno de los más citados en la historia del management
              (más de 30.000 citas académicas).
            </p>

            <h2>La trampa del éxito</h2>
            <p>
              March identificó un patrón recurrente: las organizaciones exitosas tienden a reforzar
              lo que les ha funcionado (explotación) y a reducir la inversión en lo desconocido (exploración).
              A corto plazo esto es racional — ¿para qué cambiar algo que funciona?
            </p>
            <p>
              El problema es que el entorno cambia. Y cuando lo hace, la organización que solo sabe
              explotar lo conocido se encuentra sin herramientas para adaptarse. March lo llamó
              la <strong>&quot;trampa de la competencia&quot;</strong> (<em>competency trap</em>): ser tan bueno
              en lo actual que no puedes ver lo que viene.
            </p>

            <h2>¿Qué es la ambidestreza organizacional?</h2>
            <p>
              El concepto fue desarrollado posteriormente por investigadores como Charles O&apos;Reilly y
              Michael Tushman. Una organización ambidiestra es aquella capaz de explotar sus negocios
              actuales con eficiencia mientras explora oportunidades futuras simultáneamente.
            </p>
            <p>
              No es un equilibrio 50/50 — la proporción depende del sector, la madurez de la empresa
              y la velocidad de cambio del entorno. Lo importante es que ambas dimensiones
              estén <strong>presentes de forma deliberada</strong>, no dejadas al azar.
            </p>

            <h2>Aplicación práctica</h2>
            <p>
              Este diagnóstico te ayuda a hacerte la pregunta correcta: no &quot;¿somos innovadores?&quot;
              sino &quot;¿tenemos el equilibrio adecuado para nuestro contexto?&quot;. Una startup en fase
              temprana necesita más exploración. Una empresa madura en un mercado estable puede
              permitirse más explotación. Pero ninguna puede prescindir totalmente de la otra.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>March, J.G. (1991). <em>Exploration and Exploitation in Organizational Learning</em>. Organization Science.</li>
              <li>O&apos;Reilly, C. y Tushman, M. (2004). <em>The Ambidextrous Organization</em>. Harvard Business Review.</li>
              <li>Artículo &quot;La dictadura de lo urgente&quot; — La Vanguardia, 02/04/2026.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('diagnostico-explotacion-exploracion')} />
        <ShareCard appName="diagnostico-explotacion-exploracion" />
        <Footer appName="diagnostico-explotacion-exploracion" />
    </div>
  );
}
