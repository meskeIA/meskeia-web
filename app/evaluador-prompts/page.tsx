'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EvaluadorPrompts.module.css';
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
  dimension: 'entrada' | 'salida';
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
  // Intercaladas: calidad de entrada/instrucción (A) y procesamiento de salida (B) en patrón ABABABABAB
  { id: 1, texto: 'Incluyo contexto relevante en mis instrucciones (quién soy, para qué es, qué formato necesito)', dimension: 'entrada' },
  { id: 2, texto: 'Cuando la respuesta de la IA no me convence, reformulo mi petición en lugar de aceptarla', dimension: 'salida' },
  { id: 3, texto: 'Mis instrucciones especifican qué quiero Y qué no quiero (límites y restricciones)', dimension: 'entrada' },
  { id: 4, texto: 'Comparo la respuesta de la IA con lo que yo sé del tema antes de usarla', dimension: 'salida' },
  { id: 5, texto: 'Adapto el nivel de detalle de mis instrucciones según la complejidad de la tarea', dimension: 'entrada' },
  { id: 6, texto: 'Uso la primera respuesta como borrador y pido a la IA que la mejore con instrucciones más específicas', dimension: 'salida' },
  { id: 7, texto: 'Doy ejemplos concretos de lo que espero cuando la tarea es ambigua', dimension: 'entrada' },
  { id: 8, texto: 'Detecto cuando la IA "inventa" datos o fuentes que no existen (alucinaciones)', dimension: 'salida' },
  { id: 9, texto: 'Descompongo tareas complejas en pasos más pequeños en lugar de pedir todo de una vez', dimension: 'entrada' },
  { id: 10, texto: 'Edito y personalizo el output de la IA en lugar de usarlo tal cual', dimension: 'salida' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Regular' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(entrada: number, salida: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (entrada >= umbralAlto && salida >= umbralAlto) {
    return {
      nombre: 'Conversador Experto',
      emoji: '🎯',
      descripcion: 'Das instrucciones claras y específicas, y además procesas críticamente lo que la IA devuelve. Iteras, corriges, verificas y personalizas. La IA produce buenos resultados contigo porque tú la diriges bien y filtras lo que no funciona. Es el perfil de mayor rendimiento.',
      fortalezas: [
        'Instrucciones precisas que minimizan respuestas genéricas',
        'Capacidad de iterar y mejorar el output hasta que sea útil',
        'Filtro activo contra alucinaciones y errores sutiles',
      ],
      riesgos: [
        'Sobreoptimización: invertir más tiempo en perfeccionar el prompt que en hacer la tarea directamente',
        'Expectativas altas que generan frustración cuando la IA no llega (tiene límites reales)',
        'Complejidad creciente de los prompts que los hace difíciles de mantener o compartir',
      ],
      acciones: [
        'Guardar tus mejores prompts como plantillas reutilizables — no reinventes cada vez',
        'Para tareas recurrentes, medir si la IA realmente ahorra tiempo vs hacerlo tú directamente — a veces el prompt engineering cuesta más que la tarea',
        'Compartir tus técnicas con el equipo: un buen prompt compartido multiplica el impacto',
      ],
    };
  }

  if (entrada >= umbralAlto && salida < umbralBajo) {
    return {
      nombre: 'Buen Preguntador, Mal Filtro',
      emoji: '📝',
      descripcion: 'Sabes dar instrucciones claras — contexto, restricciones, ejemplos — pero aceptas el resultado sin cuestionar suficiente. Obtienes buenas respuestas gracias a buenos prompts, pero no siempre verificas si son correctas o las adaptas a tu necesidad real. La entrada es sólida; la salida necesita más trabajo.',
      fortalezas: [
        'Instrucciones estructuradas y con contexto adecuado',
        'Capacidad de descomponer tareas complejas',
        'Buenos primeros resultados gracias a prompts claros',
      ],
      riesgos: [
        'Errores que pasan el filtro porque el texto "suena bien"',
        'Outputs genéricos que usas sin personalizar',
        'Alucinaciones no detectadas por exceso de confianza en la calidad del prompt',
      ],
      acciones: [
        'Implantar la regla del "segundo vistazo": antes de usar cualquier output de IA, leerlo una vez más preguntándote "¿esto es correcto o solo suena correcto?"',
        'Para datos específicos (cifras, fechas, nombres), verificar siempre con una fuente independiente — la IA no distingue hechos de ficción plausible',
        'Después de cada respuesta de IA, preguntarte: "¿Qué cambiaría yo de esto?" — si la respuesta es "nada", probablemente no has revisado con suficiente detalle',
      ],
    };
  }

  if (entrada < umbralBajo && salida >= umbralAlto) {
    return {
      nombre: 'Buen Filtro, Mala Pregunta',
      emoji: '🔍',
      descripcion: 'Procesas críticamente lo que la IA produce — editas, verificas, iteras — pero tus instrucciones iniciales son vagas o genéricas. Compensas con trabajo posterior lo que podrías ahorrar con mejores prompts. Es como pedir "haz algo bonito" y luego pasarte una hora arreglando el resultado.',
      fortalezas: [
        'Criterio sólido para evaluar la calidad del output',
        'Capacidad de detectar errores y alucinaciones',
        'No dependes ciegamente de lo que la IA produce',
      ],
      riesgos: [
        'Tiempo desperdiciado: malos prompts generan malas primeras respuestas que luego hay que rehacer',
        'Frustración con la IA ("nunca me da lo que quiero") cuando el problema está en la instrucción',
        'Iteraciones innecesarias que podrían evitarse con un prompt inicial mejor',
      ],
      acciones: [
        'Antes de cada prompt, invertir 30 segundos en pensar: ¿qué contexto necesita? ¿qué formato quiero? ¿qué NO quiero? — escribirlo explícitamente',
        'Probar la técnica del "prompt en 3 partes": 1) Rol ("Eres un..."), 2) Tarea ("Necesito que..."), 3) Formato ("En formato de... con máximo...")',
        'Cuando la IA no responda bien, antes de rehacer todo, preguntarte: "¿Le di suficiente información?" — el 80% de las veces, no',
      ],
    };
  }

  if (entrada < umbralBajo && salida < umbralBajo) {
    return {
      nombre: 'Uso Básico',
      emoji: '🌱',
      descripcion: 'Tus instrucciones a la IA son genéricas y aceptas el resultado sin mucho filtro. Es el punto de partida de la mayoría de usuarios — no es un problema, es una oportunidad. Con pequeños cambios en cómo preguntas y cómo evalúas, la calidad de lo que obtienes puede multiplicarse.',
      fortalezas: [
        'Punto de partida limpio: no has adquirido vicios difíciles de corregir',
        'Margen de mejora enorme con cambios pequeños',
        'Ya usas la IA, que es el primer paso más importante',
      ],
      riesgos: [
        'Resultados mediocres que crean la impresión de que "la IA no es tan útil"',
        'Errores no detectados por falta de revisión crítica',
        'Infravaloración del potencial real de la herramienta',
      ],
      acciones: [
        'En tu próximo prompt, añadir UNA cosa: el contexto ("Soy [rol], necesito esto para [propósito]") — solo eso ya mejorará la respuesta significativamente',
        'Después de cada respuesta de IA, hacerte UNA pregunta: "¿Esto lo usaría tal cual o necesita cambios?" — y hacer los cambios',
        'Guardar el prompt que mejor te ha funcionado esta semana y reutilizarlo como base para peticiones similares',
      ],
    };
  }

  // Perfiles intermedios
  if (entrada >= salida) {
    return {
      nombre: 'Mejor Preguntando que Filtrando',
      emoji: '💬',
      descripcion: 'Tus instrucciones son mejores que tu procesamiento del resultado. Pides razonablemente bien, pero no siempre revisas o personalizas lo que obtienes. La calidad de entrada supera a la de salida — necesitas cerrar la brecha para aprovechar lo que tus buenos prompts producen.',
      fortalezas: [
        'Instrucciones que generan respuestas relevantes',
        'Cierta estructura en cómo formulas las peticiones',
        'Base sólida para obtener mejores resultados con más revisión',
      ],
      riesgos: [
        'Confianza excesiva en outputs que "suenan bien" pero no se han verificado',
        'Oportunidades perdidas de mejorar respuestas iterando',
        'Errores sutiles que pasan desapercibidos por falta de revisión activa',
      ],
      acciones: [
        'Para todo output de IA que vayas a compartir con alguien, dedicar 2 minutos a editarlo: quitar lo genérico, añadir tu voz, verificar datos clave',
        'Experimentar con "pedir dos veces": usar la primera respuesta como borrador y pedir a la IA que la mejore con feedback específico',
        'Cuando algo de la IA te sorprenda ("no sabía esto"), verificarlo antes de repetirlo — las sorpresas son donde más alucinaciones se esconden',
      ],
    };
  }

  return {
    nombre: 'Mejor Filtrando que Preguntando',
    emoji: '🔎',
    descripcion: 'Procesas el resultado con más criterio del que pones en la instrucción. Revisas, editas y cuestionas — pero tus prompts iniciales podrían ser más específicos. Inviertes tiempo en corregir lo que podrías evitar con mejores instrucciones de partida.',
    fortalezas: [
      'Ojo crítico para evaluar lo que la IA produce',
      'Capacidad de detectar respuestas genéricas o incorrectas',
      'No dependes del primer resultado: iteras y mejoras',
    ],
    riesgos: [
      'Ineficiencia: mucho tiempo corrigiendo lo que un mejor prompt habría evitado',
      'Frustración acumulada por resultados iniciales pobres',
      'Percepción negativa de la IA por no ver su potencial con mejores instrucciones',
    ],
    acciones: [
      'Antes de tu próximo prompt, escribir en una línea: "Necesito [qué] para [quién] en formato [cuál] con estas restricciones [cuáles]" — usarlo como estructura base',
      'Cuando tengas que reformular un prompt más de 2 veces, guardar la versión final: es tu plantilla para la próxima vez',
      'Probar a dar un ejemplo de lo que esperas ("Como esto: [ejemplo]") — la IA entiende ejemplos mejor que descripciones abstractas',
    ],
  };
}

/* ─── Componente ─── */

export default function EvaluadorPromptsPage() {
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

  const puntuacionEntrada = PREGUNTAS
    .filter((p) => p.dimension === 'entrada')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const puntuacionSalida = PREGUNTAS
    .filter((p) => p.dimension === 'salida')
    .reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);

  const perfil = obtenerPerfil(puntuacionEntrada, puntuacionSalida);

  // Posición en el mapa (0-100%) — X: salida, Y: entrada
  const posX = ((puntuacionSalida - 5) / 20) * 100;
  const posY = 100 - ((puntuacionEntrada - 5) / 20) * 100;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>💬 Evaluador de Prompts</h1>
          <p className={styles.subtitle}>
            ¿Tus instrucciones a la IA son específicas o vagas?
            <br />
            Cómo preguntas y cómo procesas: las dos claves del prompt engineering
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
            La diferencia entre un resultado mediocre y uno excelente de la IA casi nunca está en
            el modelo — <strong>está en la instrucción</strong>. Un prompt vago produce una respuesta
            genérica. Un prompt con contexto, restricciones y ejemplos produce algo útil.
          </p>
          <p>
            Pero dar buenas instrucciones es solo la mitad. La otra mitad es <strong>qué haces con
            la respuesta</strong>: ¿la aceptas tal cual o la evalúas, iteras y personalizas?
            <strong> Este test mide ambas dimensiones de tu interacción con la IA.</strong>
          </p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>
            Piensa en cómo interactúas habitualmente con herramientas de IA
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
                <span className={styles.mapLabelTop}>📝 Instrucciones claras</span>
                <span className={styles.mapLabelBottom}>Instrucciones vagas</span>
                <span className={styles.mapLabelLeft}>Aceptar sin filtro</span>
                <span className={styles.mapLabelRight}>🔍 Procesamiento crítico</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}>
                  <span>📝 Buen Preguntador, Mal Filtro</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}>
                  <span>🎯 Conversador Experto</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}>
                  <span>🌱 Uso Básico</span>
                </div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}>
                  <span>🔍 Buen Filtro, Mala Pregunta</span>
                </div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div
                  className={styles.mapDot}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  aria-label={`Tu posición: Calidad de instrucciones ${puntuacionEntrada}/25, Procesamiento de salida ${puntuacionSalida}/25`}
                >
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>📝 Calidad de instrucciones</span>
                  <span className={styles.scoreValue}>{puntuacionEntrada}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barEntrada}`}
                    style={{ width: `${(puntuacionEntrada / 25) * 100}%` }}
                  />
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div className={styles.scoreHeader}>
                  <span>🔍 Procesamiento de salida</span>
                  <span className={styles.scoreValue}>{puntuacionSalida}/25</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barSalida}`}
                    style={{ width: `${(puntuacionSalida / 25) * 100}%` }}
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
          title="📚 Prompt engineering: el arte de preguntar bien a las máquinas"
          subtitle="Por qué lo que escribes importa tanto como la IA que usas"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el prompt engineering?</h2>
            <p>
              El prompt engineering es la habilidad de formular instrucciones a una IA de forma
              que maximice la calidad y relevancia de la respuesta. No es programación — es
              comunicación precisa. Y como toda forma de comunicación, se puede hacer bien o mal.
            </p>
            <p>
              La analogía más útil: imagina que le pides algo a un asistente muy competente pero
              que no te conoce. Si dices &quot;haz algo sobre marketing&quot;, obtendrás algo genérico.
              Si dices &quot;escribe un email de 200 palabras para clientes B2B del sector salud
              anunciando nuestra nueva función de reporting, con tono profesional pero cercano&quot;,
              obtendrás algo útil.
            </p>

            <h2>Las dos dimensiones: entrada y salida</h2>
            <p>
              La <strong>calidad de entrada</strong> (instrucción) depende de cuánto contexto das,
              qué restricciones defines, si incluyes ejemplos y si descompones tareas complejas.
              Es lo que controlas antes de que la IA responda.
            </p>
            <p>
              La <strong>calidad de salida</strong> (procesamiento) depende de lo que haces después:
              ¿evalúas críticamente? ¿iteras? ¿detectas errores? ¿personalizas? Es lo que controlas
              después de que la IA responda.
            </p>
            <p>
              Ambas dimensiones son necesarias. Un prompt perfecto con un filtro nulo sigue produciendo
              resultados con errores no detectados. Un filtro excelente con prompts vagos genera
              mucho trabajo de corrección innecesario.
            </p>

            <h2>Los 5 elementos de un buen prompt</h2>
            <p>
              No hay una fórmula mágica, pero los prompts más efectivos suelen incluir combinaciones
              de estos elementos:
            </p>
            <ol>
              <li><strong>Rol</strong>: &quot;Eres un experto en...&quot; (orienta el tono y nivel)</li>
              <li><strong>Contexto</strong>: para quién, para qué, en qué situación</li>
              <li><strong>Tarea</strong>: qué quieres que haga, con qué nivel de detalle</li>
              <li><strong>Formato</strong>: lista, párrafo, tabla, máximo X palabras</li>
              <li><strong>Restricciones</strong>: qué NO incluir, qué evitar, qué priorizar</li>
            </ol>
            <p>
              No siempre necesitas los cinco — pero cuantos más incluyas, más predecible y útil
              será el resultado.
            </p>

            <h2>El error más común: culpar a la IA</h2>
            <p>
              Cuando la IA da una respuesta pobre, la reacción instintiva es &quot;esta IA no es
              buena&quot;. Pero en la mayoría de casos, el problema está en la instrucción, no en
              el modelo. <strong>Antes de cambiar de herramienta, prueba a cambiar tu prompt.</strong>
            </p>

            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Mollick, E. (2024). <em>Co-Intelligence: Living and Working with AI</em>. Portfolio/Penguin.</li>
              <li>Brockman, G. et al. (2023). <em>GPT Best Practices</em>. OpenAI Documentation.</li>
              <li>Anthropic (2024). <em>Prompt Engineering Guide</em>. Documentación oficial.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('evaluador-prompts')} />
        <ShareCard appName="evaluador-prompts" />
        <Footer appName="evaluador-prompts" />
      </div>
    </>
  );
}
