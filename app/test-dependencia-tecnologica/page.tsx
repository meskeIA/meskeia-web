'use client';

import { useState } from 'react';
import styles from './TestDependenciaTecnologica.module.css';
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
  dimension: 'autonomia' | 'adaptabilidad';
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
  // Intercaladas: autonomía real (A) y adaptabilidad (B) en patrón ABABABABAB
  { id: 1, texto: 'Si mañana no tuviera acceso a IA, podría completar mi trabajo del día (quizá más lento, pero con calidad)', dimension: 'autonomia' },
  { id: 2, texto: 'Cuando una herramienta que uso habitualmente falla o cambia, encuentro alternativas sin bloquearme', dimension: 'adaptabilidad' },
  { id: 3, texto: 'Mantengo activas habilidades fundamentales de mi profesión que podría delegar a la tecnología', dimension: 'autonomia' },
  { id: 4, texto: 'He aprendido a usar herramientas nuevas en los últimos 6 meses sin que nadie me obligara', dimension: 'adaptabilidad' },
  { id: 5, texto: 'Puedo escribir un texto profesional completo (email, informe, propuesta) sin asistencia de IA', dimension: 'autonomia' },
  { id: 6, texto: 'Cuando aparece una tecnología nueva relevante para mi trabajo, la pruebo antes de que sea obligatoria', dimension: 'adaptabilidad' },
  { id: 7, texto: 'Sé hacer cálculos, análisis o razonamientos básicos de mi campo sin depender de una herramienta específica', dimension: 'autonomia' },
  { id: 8, texto: 'No me aferro a una sola herramienta: si algo mejor aparece, estoy dispuesto a cambiar', dimension: 'adaptabilidad' },
  { id: 9, texto: 'Si me pidieran explicar cómo llego a mis conclusiones sin mencionar la tecnología que uso, podría hacerlo', dimension: 'autonomia' },
  { id: 10, texto: 'Cuando cambio de herramienta, mi productividad se recupera rápido porque mis habilidades base son sólidas', dimension: 'adaptabilidad' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(autonomia: number, adaptabilidad: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (autonomia >= umbralAlto && adaptabilidad >= umbralAlto) {
    return {
      nombre: 'Profesional Antifrágil',
      emoji: '💎',
      descripcion: 'Mantienes tus habilidades base intactas y al mismo tiempo adoptas nuevas herramientas con fluidez. No dependes de ninguna tecnología específica, pero aprovechas las que tienes. Si mañana cambia todo, estarás entre los primeros en adaptarte — porque tu valor está en lo que sabes, no en lo que usas.',
      fortalezas: [
        'Independencia total: tu valor no depende de ninguna herramienta',
        'Adopción rápida: las herramientas nuevas se integran sin fricción',
        'Resiliencia ante cambios: si algo falla, tienes plan B y plan C',
      ],
      riesgos: [
        'Sobreconfianza: creer que siempre te adaptarás puede hacer que subestimes disrupciones realmente grandes',
        'Fatiga de adaptación: estar siempre probando cosas nuevas consume energía',
        'Dispersión: no profundizar en ninguna herramienta por estar siempre cambiando',
      ],
      acciones: [
        'Elegir 2-3 herramientas clave y dominarlas en profundidad — ser antifrágil no significa ser superficial en todo',
        'Compartir tu mentalidad con el equipo: la antifragilidad se multiplica cuando es colectiva, no solo individual',
        'Reservar tiempo para consolidar, no solo para explorar — la adaptabilidad sin profundidad es agitación',
      ],
    };
  }

  if (autonomia >= umbralAlto && adaptabilidad < umbralBajo) {
    return {
      nombre: 'Artesano Tradicional',
      emoji: '🔨',
      descripcion: 'Tus habilidades base son sólidas — no necesitas tecnología para hacer tu trabajo con calidad. Pero te cuesta adoptar herramientas nuevas. No es que no puedas: es que no ves la necesidad o que el coste de cambiar te parece alto. Tu independencia es una fortaleza, pero la rigidez puede costarte productividad.',
      fortalezas: [
        'Habilidades profesionales sólidas e independientes de herramientas',
        'Capacidad de trabajar en cualquier contexto, incluso sin tecnología',
        'Profundidad de conocimiento en tu campo',
      ],
      riesgos: [
        'Brecha de productividad creciente con quienes adoptan nuevas herramientas',
        'Riesgo de obsolescencia percibida (aunque tus habilidades sean valiosas)',
        'Oportunidades perdidas que las nuevas herramientas podrían abrir',
      ],
      acciones: [
        'Elegir UNA herramienta nueva y dedicar 1 hora esta semana a explorarla sin presión — no para reemplazar lo que haces, sino para ver si lo complementa',
        'Preguntar a alguien más joven o tecnológico: "¿Qué herramienta usas que yo debería conocer?" — sin compromiso, solo curiosidad',
        'Recordar que adoptar herramientas nuevas no significa abandonar las habilidades que tienes — es sumar, no sustituir',
      ],
    };
  }

  if (autonomia < umbralBajo && adaptabilidad >= umbralAlto) {
    return {
      nombre: 'Surfista Digital',
      emoji: '🏄',
      descripcion: 'Adoptas herramientas nuevas con facilidad y te mueves entre ellas con soltura. Pero tus habilidades base se han erosionado: si quitaras todas las herramientas, el trabajo se resentiría significativamente. Eres ágil pero frágil — tu productividad depende del ecosistema tecnológico que te rodea.',
      fortalezas: [
        'Adopción rápida y sin miedo de cualquier herramienta nueva',
        'Alta productividad dentro del ecosistema tecnológico actual',
        'Disposición a cambiar y experimentar continuamente',
      ],
      riesgos: [
        'Fragilidad: si el ecosistema cambia abruptamente, tu productividad se desploma',
        'Deskilling acumulado: habilidades que una vez tuviste y que has dejado de practicar',
        'Dependencia invisible: no notas cuánto dependes hasta que algo falla',
      ],
      acciones: [
        'Esta semana, hacer UNA tarea importante completamente sin herramientas digitales avanzadas — papel y bolígrafo, pizarra, conversación. Evaluar la diferencia',
        'Hacer una lista de "habilidades que tenía hace 3 años y ya no practico" — si alguna es importante, programar tiempo para reactivarla',
        'Para cada herramienta crítica que usas, preguntarte: "¿Qué haría si mañana desaparece?" — si la respuesta es "no sé", tienes un punto de fragilidad',
      ],
    };
  }

  if (autonomia < umbralBajo && adaptabilidad < umbralBajo) {
    return {
      nombre: 'Dependencia Silenciosa',
      emoji: '🔗',
      descripcion: 'Tus habilidades base se han erosionado y además te cuesta adoptar herramientas nuevas. Puede ser porque llevas años usando las mismas herramientas sin cuestionarlas, o porque el entorno no ha exigido cambiar. No es un juicio — es una señal de que conviene actuar antes de que una disrupción externa fuerce el cambio.',
      fortalezas: [
        'Reconocer la situación es el primer paso (y el más difícil)',
        'Margen de mejora enorme en ambas dimensiones con cambios pequeños',
        'Experiencia profesional acumulada que sigue siendo valiosa',
      ],
      riesgos: [
        'Vulnerabilidad alta ante cualquier cambio tecnológico significativo',
        'Pérdida progresiva de competitividad profesional',
        'Riesgo de que la dependencia se descubra en el peor momento (cuando algo falla)',
      ],
      acciones: [
        'Elegir UNA habilidad fundamental de tu profesión y practicarla esta semana sin ayuda tecnológica — redactar algo, analizar datos, resolver un problema con papel y lápiz',
        'Probar UNA herramienta nueva (puede ser la misma que usa un compañero) y dedicar 30 minutos a explorarla sin presión de resultado',
        'Hablar con alguien de confianza sobre qué habilidades has dejado de practicar — verbalizar la dependencia es el primer paso para reducirla',
      ],
    };
  }

  // Perfiles intermedios
  if (autonomia >= adaptabilidad) {
    return {
      nombre: 'Base Sólida, Ritmo Lento',
      emoji: '🏔️',
      descripcion: 'Tus habilidades fundamentales están bien, pero adoptas herramientas nuevas con cierta lentitud. No es un problema inmediato — tu base te sostiene — pero la velocidad de cambio tecnológico hace que la distancia con quienes adoptan rápido se amplíe cada mes.',
      fortalezas: [
        'Cimientos profesionales sólidos',
        'No dependerás de herramientas que desaparezcan',
        'Conocimiento profundo que la tecnología no reemplaza',
      ],
      riesgos: [
        'Eficiencia menor que la de compañeros que usan herramientas más modernas',
        'Resistencia al cambio que puede percibirse como falta de interés',
        'Oportunidades que se pierden por no conocer lo que hay disponible',
      ],
      acciones: [
        'Elegir UN área de tu trabajo donde la tecnología podría ahorrarte tiempo y probar la herramienta más recomendada para eso — una sola, una semana',
        'Pedir a un compañero tecnológicamente ágil que te enseñe su flujo de trabajo — 15 minutos observando cómo trabaja otro es más efectivo que cualquier tutorial',
        'Fijarte un objetivo modesto: "Este mes, quiero ser capaz de [una cosa nueva con tecnología]"',
      ],
    };
  }

  return {
    nombre: 'Ágil pero Expuesto',
    emoji: '🌊',
    descripcion: 'Adoptas herramientas nuevas con más facilidad de la que mantienes tus habilidades base. Eres rápido adaptándote, pero tu autonomía real ha disminuido. Si mañana todo cambiara radicalmente, la adaptabilidad te ayudaría a encontrar nuevas herramientas — pero necesitarías las habilidades base para usarlas bien.',
    fortalezas: [
      'Velocidad de adopción de nuevas herramientas',
      'Apertura al cambio y a la experimentación',
      'Productividad actual alta gracias al ecosistema tecnológico',
    ],
    riesgos: [
      'Habilidades base que se atrofian con el tiempo',
      'Productividad que depende del acceso a herramientas específicas',
      'Riesgo de no poder evaluar la calidad de lo que las herramientas producen',
    ],
    acciones: [
      'Identificar las 3 habilidades más importantes de tu profesión y preguntarte: "¿Podría demostrarlas sin tecnología?" — si no, practicarlas',
      'Una vez al mes, hacer un "día analógico" en alguna tarea: pensar, escribir o decidir sin asistencia digital — para mantener el músculo',
      'Cuando uses una herramienta nueva, preguntarte primero: "¿Qué necesito saber yo para usar esto bien?" — la herramienta potencia la habilidad, no la sustituye',
    ],
  };
}

/* ─── Componente ─── */

export default function TestDependenciaTecnologicaPage() {
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

  const puntuacionAutonomia = PREGUNTAS
    .filter((p) => p.dimension === 'autonomia')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionAdaptabilidad = PREGUNTAS
    .filter((p) => p.dimension === 'adaptabilidad')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionAutonomia, puntuacionAdaptabilidad);

  // Posición en el mapa (0-100%) — X: adaptabilidad, Y: autonomía
  const posX = ((puntuacionAdaptabilidad - 5) / 20) * 100;
  const posY = 100 - ((puntuacionAutonomia - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🔗 Test de Dependencia Tecnológica</h1>
          <p className={styles.subtitle}>
            ¿Podrías hacer tu trabajo si mañana no tuvieras IA?
            <br />
            Autonomía real y adaptabilidad: las dos caras de tu relación con la tecnología
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
            Hay una pregunta que pocos profesionales se hacen en serio: <strong>si mañana
            desaparecieran todas tus herramientas digitales, ¿podrías seguir haciendo tu
            trabajo?</strong> No igual de rápido — pero ¿con la misma calidad?
          </p>
          <p>
            La respuesta importa porque la tecnología cambia constantemente. Las herramientas
            de hoy no serán las de dentro de 2 años. Lo que no cambia es tu capacidad de
            pensar, decidir y ejecutar sin depender de una herramienta concreta.
            <strong> Este test mide dos cosas: cuánta autonomía real tienes y cómo te adaptas
            cuando todo cambia.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en tu relación real con la tecnología en tu trabajo
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
                <span className={styles.mapLabelTop}>🔨 Alta autonomía</span>
                <span className={styles.mapLabelBottom}>Baja autonomía</span>
                <span className={styles.mapLabelLeft}>Baja adaptabilidad</span>
                <span className={styles.mapLabelRight}>🏄 Alta adaptabilidad</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>🔨 Artesano Tradicional</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>💎 Profesional Antifrágil</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🔗 Dependencia Silenciosa</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🏄 Surfista Digital</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Autonomía ${puntuacionAutonomia}/25, Adaptabilidad ${puntuacionAdaptabilidad}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🔨 Autonomía real</span>
                  <span className={styles.scoreValue}>{puntuacionAutonomia}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAutonomia}`}
                    style={{ width: `${(puntuacionAutonomia / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🏄 Adaptabilidad</span>
                  <span className={styles.scoreValue}>{puntuacionAdaptabilidad}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barAdaptabilidad}`}
                    style={{ width: `${(puntuacionAdaptabilidad / 25) * 100}%` }}
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
          title="📚 Antifragilidad digital: más allá de la resiliencia"
          subtitle="Por qué la autonomía y la adaptabilidad son habilidades, no rasgos de personalidad"
        >
          <section className={styles.guideSection}>
            <h2>El concepto de deskilling</h2>
            <p>
              El término <em>deskilling</em> (pérdida de habilidades) se acuñó originalmente para
              describir cómo la automatización industrial reducía las competencias de los trabajadores
              manuales. Hoy se aplica al trabajo del conocimiento: cada habilidad que delegas
              permanentemente a una herramienta es una habilidad que se atrofia.
            </p>
            <p>
              Estudios recientes muestran que los pilotos de avión que usan piloto automático
              extensivamente pierden capacidad de vuelo manual. Los médicos que dependen de
              sistemas de diagnóstico asistido reducen su intuición clínica. <strong>No es que la
              tecnología sea mala — es que delegar sin consciencia tiene un coste invisible.</strong>
            </p>

            <h2>Autonomía vs adaptabilidad: dos cosas diferentes</h2>
            <p>
              La <strong>autonomía</strong> es tu capacidad de funcionar sin una herramienta
              específica. Son tus habilidades base: razonar, escribir, calcular, decidir, comunicar.
              Son lentas de construir y lentas de perder — pero una vez perdidas, son difíciles
              de recuperar.
            </p>
            <p>
              La <strong>adaptabilidad</strong> es tu capacidad de adoptar herramientas nuevas cuando
              aparecen y de soltar las antiguas cuando dejan de servir. Es velocidad de cambio,
              curiosidad tecnológica, disposición a aprender.
            </p>
            <p>
              Puedes ser autónomo pero rígido (el artesano que nunca cambia). Puedes ser adaptable
              pero frágil (el surfista que cambia de herramienta constantemente pero no sabe
              trabajar sin ninguna). <strong>El profesional antifrágil combina ambas: habilidades
              sólidas que le permiten evaluar y adoptar cualquier herramienta nueva.</strong>
            </p>

            <h2>La antifragilidad de Nassim Taleb aplicada a la carrera profesional</h2>
            <p>
              Nassim Nicholas Taleb distingue entre frágil (se rompe con el cambio), resiliente
              (resiste el cambio) y antifrágil (mejora con el cambio). La meta no es sobrevivir
              a los cambios tecnológicos — es <em>beneficiarse</em> de ellos.
            </p>
            <p>
              Un profesional antifrágil tiene las habilidades base que le permiten evaluar cualquier
              herramienta nueva, adoptarla rápido si es útil, y abandonarla sin drama cuando aparezca
              algo mejor. Su valor está en lo que sabe y en cómo piensa, no en qué herramientas usa.
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Taleb, N.N. (2012). <em>Antifrágil: Las cosas que se benefician del desorden</em>. Paidós.</li>
              <li>Carr, N. (2014). <em>Atrapados: Cómo las máquinas se apoderan de nuestras vidas</em>. Taurus.</li>
              <li>Crawford, M.B. (2009). <em>Shop Class as Soulcraft</em>. Penguin. (Sobre el valor de las habilidades manuales y la autonomía).</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-dependencia-tecnologica')} />
        <ShareCard appName="test-dependencia-tecnologica" />
        <Footer appName="test-dependencia-tecnologica" />
      </div>
    </>
  );
}
