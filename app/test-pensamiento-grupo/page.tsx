'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TestPensamientoGrupo.module.css';
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
  dimension: 'conformidad' | 'disidencia';
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
  { id: 1, texto: 'En mi equipo, las decisiones suelen tomarse por consenso rápido sin mucho debate', dimension: 'conformidad' },
  { id: 6, texto: 'Se valora y se escucha cuando alguien expresa una opinión diferente a la mayoría', dimension: 'disidencia' },
  { id: 2, texto: 'Hay una presión implícita para estar de acuerdo con el líder o la mayoría', dimension: 'conformidad' },
  { id: 7, texto: 'Antes de tomar decisiones importantes, se asigna a alguien el rol de cuestionar la propuesta', dimension: 'disidencia' },
  { id: 3, texto: 'Cuando alguien discrepa, se le percibe como "difícil" o "negativo"', dimension: 'conformidad' },
  { id: 8, texto: 'Los errores del pasado se analizan abiertamente sin buscar culpables', dimension: 'disidencia' },
  { id: 4, texto: 'Mi equipo tiende a sobrevalorar su capacidad y a minimizar los riesgos', dimension: 'conformidad' },
  { id: 9, texto: 'Se consulta a personas externas al grupo antes de tomar decisiones críticas', dimension: 'disidencia' },
  { id: 5, texto: 'He guardado silencio en reuniones cuando tenía dudas sobre una decisión del grupo', dimension: 'conformidad' },
  { id: 10, texto: 'Mi equipo revisa activamente sus propias suposiciones antes de comprometerse con un plan', dimension: 'disidencia' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(conformidad: number, disidencia: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (conformidad >= umbralAlto && disidencia >= umbralAlto) {
    return {
      nombre: 'Tensión Productiva',
      emoji: '⚡',
      descripcion: 'Tu equipo tiene presión hacia el consenso PERO también espacios para el desacuerdo. Es una combinación rara y potencialmente poderosa si se gestiona bien: hay cohesión (necesaria para actuar) con debate (necesario para decidir bien). El riesgo es que un lado domine al otro.',
      fortalezas: [
        'Cohesión de grupo con espacio para la disidencia',
        'Capacidad de debatir sin romper la armonía',
        'Decisiones que combinan rapidez y profundidad',
      ],
      riesgos: [
        'La tensión puede desequilibrarse hacia un lado en momentos de presión',
        'Fatiga del equipo si la tensión es constante sin resolución',
        'Riesgo de que la disidencia sea solo formal (se escucha pero no se aplica)',
      ],
      acciones: [
        'Revisa si la disidencia realmente influye en las decisiones o es solo un ritual — si nunca cambia nada, es teatro',
        'En cada decisión importante, pregunta explícitamente: "¿Alguien tiene una perspectiva diferente?" y espera en silencio 10 segundos',
        'Documenta cuántas veces el debate cambió la decisión final — si es 0, la disidencia es solo decorativa',
      ],
    };
  }

  if (conformidad >= umbralAlto && disidencia < umbralBajo) {
    return {
      nombre: 'Groupthink Activo',
      emoji: '🫧',
      descripcion: 'Tu equipo muestra signos claros de pensamiento de grupo (groupthink). Las decisiones se toman por consenso rápido, la disidencia se desalienta y hay una ilusión colectiva de invulnerabilidad. Janis identificó este patrón en decisiones que terminaron mal, como la invasión de Bahía de Cochinos. Investigaciones posteriores han matizado algunos de sus casos —en varios había más disidencia interna de la que Janis describió— pero el concepto general sigue siendo útil como herramienta de diagnóstico.',
      fortalezas: [
        'Alta cohesión del grupo (aunque mal dirigida)',
        'Velocidad en la toma de decisiones',
        'Reconocer el patrón es el primer paso para corregirlo',
      ],
      riesgos: [
        'Decisiones de baja calidad que nadie cuestiona',
        'Autocensura: los que ven problemas callan por presión social',
        'Ilusión de unanimidad: el silencio se interpreta como acuerdo',
      ],
      acciones: [
        'Introduce la figura del "abogado del diablo" rotativo: en cada reunión importante, alguien tiene la obligación de argumentar en contra',
        'Antes de votar o decidir, pide que cada persona escriba su opinión en papel sin verla los demás — elimina la presión del grupo',
        'Invita a una persona EXTERNA al grupo a la siguiente decisión importante — la perspectiva de fuera rompe la burbuja',
      ],
    };
  }

  if (conformidad < umbralBajo && disidencia >= umbralAlto) {
    return {
      nombre: 'Debate Saludable',
      emoji: '💚',
      descripcion: 'Baja conformidad y alta disidencia constructiva: tu equipo debate de verdad, cuestiona suposiciones y escucha perspectivas diferentes. Este perfil reduce significativamente el riesgo de groupthink. Janis lo consideraba la dirección correcta, aunque el debate constante también tiene costes (fatiga, retrasos) que conviene gestionar.',
      fortalezas: [
        'Decisiones de alta calidad por diversidad de perspectivas',
        'Cultura de confianza que permite el desacuerdo sin represalias',
        'Capacidad de detectar problemas antes de que sea tarde',
      ],
      riesgos: [
        'Riesgo de parálisis si el debate se convierte en discusión sin fin',
        'Fatiga del equipo si cada decisión requiere debate exhaustivo',
        'En situaciones de crisis que requieren acción rápida, el hábito de debatir puede ralentizar',
      ],
      acciones: [
        'Establece límites de tiempo para el debate: por ejemplo, 30 minutos de discusión y luego se decide, aunque no haya consenso total',
        'Diferencia entre decisiones que merecen debate (estratégicas) y las que no (operativas) — no todo necesita debate',
        'Celebra cuando un debate cambia una decisión — refuerza que disentir es valioso y tiene consecuencias reales',
      ],
    };
  }

  if (conformidad < umbralBajo && disidencia < umbralBajo) {
    return {
      nombre: 'Grupo Indiferente',
      emoji: '😶',
      descripcion: 'Ni conformidad fuerte ni disidencia activa. Puede indicar que el equipo no está cohesionado, que no le importan las decisiones, o que cada persona va por su cuenta. No es groupthink, pero tampoco es debate saludable — es ausencia de dinámica grupal.',
      fortalezas: [
        'Sin presión de conformidad',
        'Libertad individual de opinión',
        'Espacio para diseñar la dinámica que se quiera',
      ],
      riesgos: [
        'Las decisiones se toman sin verdadera deliberación grupal',
        'Falta de compromiso con las decisiones (si no participé, no me comprometo)',
        'El grupo puede operar más como conjunto de individuos que como equipo deliberante, lo cual no siempre es un problema dependiendo del contexto',
      ],
      acciones: [
        'Pregúntate si tu equipo realmente necesita decidir en grupo o si cada uno puede decidir por su cuenta — a veces la indiferencia es señal de que la estructura no encaja',
        'Si el equipo SÍ necesita decidir juntos, crea un espacio formal de debate con reglas claras (todos opinan, nadie interrumpe, se decide después de escuchar)',
        'Investiga si la indiferencia viene de falta de confianza, falta de interés, o falta de consecuencias — cada causa tiene una solución diferente',
      ],
    };
  }

  if (conformidad >= disidencia) {
    return {
      nombre: 'Tendencia al Groupthink',
      emoji: '⚠️',
      descripcion: 'La conformidad supera ligeramente a la disidencia. No es groupthink pleno, pero la tendencia está ahí: el equipo se inclina más hacia el consenso que hacia el debate. Si no se corrige, esta tendencia tiende a amplificarse con el tiempo.',
      fortalezas: [
        'Algo de disidencia presente — la base existe',
        'Cohesión de grupo razonable',
        'Margen para corregir con ajustes pequeños',
      ],
      riesgos: [
        'La conformidad tiende a crecer sola — cada decisión sin debate refuerza el patrón',
        'Las voces críticas se autocensuran progresivamente si no se fomenta el debate',
        'El equipo puede estar ignorando señales de alerta por comodidad',
      ],
      acciones: [
        'En la próxima reunión de decisión, empieza preguntando: "¿Qué podría salir mal con esta propuesta?" ANTES de pedir opiniones a favor',
        'Rota quién presenta las propuestas — cuando siempre presenta la misma persona, el grupo tiende a conformarse',
        'Premia públicamente cuando alguien exprese una opinión contraria — el comportamiento que se refuerza se repite',
      ],
    };
  }

  return {
    nombre: 'Tendencia al Debate',
    emoji: '💬',
    descripcion: 'La disidencia supera ligeramente a la conformidad. Tu equipo tiene más inclinación hacia el debate que hacia el consenso automático. Es una dirección saludable — el reto es que el debate siga siendo constructivo y no se convierta en conflicto.',
    fortalezas: [
      'Buena base de debate constructivo',
      'Menor riesgo de groupthink',
      'Cultura que valora perspectivas diferentes',
    ],
    riesgos: [
      'El debate constante puede agotar al equipo',
      'Riesgo de que la disidencia se personalice (debatir ideas vs atacar personas)',
      'Necesidad de mantener el equilibrio entre debate y acción',
    ],
    acciones: [
      'Asegúrate de que el debate lleva a decisiones — debatir sin decidir es tan malo como decidir sin debatir',
      'Establece normas claras: se debaten ideas, no se atacan personas. Si alguien cruza la línea, se para y se corrige.',
      'Después de cada debate, confirma el compromiso de todos con la decisión final — "disagree and commit" (discrepa pero ejecuta)',
    ],
  };
}

/* ─── Componente ─── */

export default function TestPensamientoGrupoPage() {
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

  const puntuacionConformidad = PREGUNTAS
    .filter((p) => p.dimension === 'conformidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionDisidencia = PREGUNTAS
    .filter((p) => p.dimension === 'disidencia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionConformidad, puntuacionDisidencia);

  const posX = ((puntuacionConformidad - 5) / 20) * 100;
  const posY = 100 - ((puntuacionDisidencia - 5) / 20) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🫧 Test de Pensamiento de Grupo</h1>
          <p className={styles.subtitle}>
            ¿Tu equipo realmente debate o solo confirma?
            <br />
            Basado en Irving Janis (groupthink)
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
            En 1972, el psicólogo <strong>Irving Janis</strong> acuñó el término <em>groupthink</em>
            para describir un fenómeno peligroso: cuando un grupo cohesionado prioriza la armonía
            y el consenso sobre el análisis crítico, <strong>toma peores decisiones que
            cualquiera de sus miembros individualmente</strong>.
          </p>
          <p>
            El groupthink no es estupidez colectiva — es el resultado de dinámicas sociales
            que silencian las voces críticas. Ocurre en equipos inteligentes, con buenas intenciones,
            y ha causado algunos de los mayores errores de la historia moderna.
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo decide tu equipo
          </h2>
          <p className={styles.sectionSubtitle}>
            Valora cada afirmación según lo que ocurre realmente en tu grupo
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
                <span className={styles.mapLabelTop}>💬 Alta Disidencia</span>
                <span className={styles.mapLabelBottom}>Baja Disidencia</span>
                <span className={styles.mapLabelLeft}>Baja Conformidad</span>
                <span className={styles.mapLabelRight}>🫧 Alta Conformidad</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>💚 Debate Saludable</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>⚡ Tensión Productiva</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>😶 Grupo Indiferente</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🫧 Groupthink Activo</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Conformidad ${puntuacionConformidad}/25, Disidencia ${puntuacionDisidencia}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🫧 Conformidad</span>
                  <span className={styles.scoreValue}>{puntuacionConformidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barConformidad}`}
                    style={{ width: `${(puntuacionConformidad / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>💬 Disidencia</span>
                  <span className={styles.scoreValue}>{puntuacionDisidencia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barDisidencia}`}
                    style={{ width: `${(puntuacionDisidencia / 25) * 100}%` }}
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
          title="📚 Groupthink: cuando el grupo piensa peor que el individuo"
          subtitle="El trabajo de Irving Janis y cómo prevenirlo"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el groupthink?</h2>
            <p>
              Irving Janis (1918-1990) publicó en 1972 <em>Victims of Groupthink</em>, donde
              analizó cómo grupos de personas inteligentes y bien intencionadas pueden tomar
              decisiones catastróficas cuando la dinámica grupal suprime el pensamiento crítico.
            </p>
            <p>
              Janis estudió fallos como la invasión de Bahía de Cochinos (1961), la escalada
              en Vietnam y el caso Watergate. En todos encontró el mismo patrón: un grupo
              cohesionado, con un líder directivo, aislado de opiniones externas, que llegó
              a decisiones que ningún miembro habría tomado individualmente.
            </p>

            <h2>Los 8 síntomas de Janis</h2>
            <ul>
              <li><strong>Ilusión de invulnerabilidad</strong>: &quot;No nos puede pasar a nosotros&quot;.</li>
              <li><strong>Racionalización colectiva</strong>: Descartar señales de advertencia.</li>
              <li><strong>Creencia en la moralidad del grupo</strong>: &quot;Nosotros somos los buenos&quot;.</li>
              <li><strong>Estereotipos del enemigo</strong>: Deshumanizar o simplificar al oponente.</li>
              <li><strong>Presión sobre disidentes</strong>: Quien cuestiona es &quot;desleal&quot;.</li>
              <li><strong>Autocensura</strong>: Callar dudas para no romper la armonía.</li>
              <li><strong>Ilusión de unanimidad</strong>: El silencio se interpreta como acuerdo.</li>
              <li><strong>Guardianes del pensamiento</strong>: Miembros que filtran información contraria.</li>
            </ul>

            <h2>Cómo prevenirlo</h2>
            <p>
              El propio Janis propuso medidas concretas que siguen siendo relevantes:
            </p>
            <ul>
              <li>Asignar un <strong>abogado del diablo</strong> rotativo en cada decisión.</li>
              <li>El líder debe <strong>hablar último</strong>, no primero.</li>
              <li>Consultar <strong>expertos externos</strong> antes de decidir.</li>
              <li>Dividir el grupo en subgrupos que <strong>deliberen por separado</strong> y luego comparen conclusiones.</li>
              <li>Celebrar una <strong>reunión de segunda oportunidad</strong> donde se puedan expresar dudas residuales.</li>
            </ul>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Janis, I. (1972). <em>Victims of Groupthink</em>. Houghton Mifflin.</li>
              <li>Sunstein, C. y Hastie, R. (2014). <em>Wiser: Getting Beyond Groupthink to Make Groups Smarter</em>. Harvard Business Review Press.</li>
              <li>Surowiecki, J. (2004). <em>The Wisdom of Crowds</em>. Doubleday.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-pensamiento-grupo')} />
        <ShareCard appName="test-pensamiento-grupo" />
        <Footer appName="test-pensamiento-grupo" />
    </div>
  );
}
