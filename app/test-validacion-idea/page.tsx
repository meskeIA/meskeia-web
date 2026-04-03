'use client';

import { useState } from 'react';
import styles from './TestValidacionIdea.module.css';
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

interface Pregunta { id: number; texto: string; dimension: 'asuncion' | 'validacion'; }
interface Perfil { nombre: string; emoji: string; descripcion: string; fortalezas: string[]; riesgos: string[]; acciones: string[]; }

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'Estoy convencido de que la gente necesita mi producto/servicio sin haberlo preguntado directamente', dimension: 'asuncion' },
  { id: 6, texto: 'He hablado con al menos 10 personas que podrían ser mi cliente sobre su problema (no sobre mi solución)', dimension: 'validacion' },
  { id: 2, texto: 'Estoy construyendo mi producto/servicio antes de tener clientes o compromisos de compra', dimension: 'asuncion' },
  { id: 7, texto: 'He probado una versión mínima de mi idea antes de invertir mucho tiempo o dinero', dimension: 'validacion' },
  { id: 3, texto: 'Cuando explico mi idea, me centro más en la solución que en el problema que resuelve', dimension: 'asuncion' },
  { id: 8, texto: 'Tengo datos reales (no intuiciones) sobre cuánto pagaría la gente por lo que ofrezco', dimension: 'validacion' },
  { id: 4, texto: 'Creo que mi idea es tan buena que "se venderá sola"', dimension: 'asuncion' },
  { id: 9, texto: 'He investigado qué alternativas usan actualmente las personas que quiero servir', dimension: 'validacion' },
  { id: 5, texto: 'No he investigado a fondo si alguien más está resolviendo el mismo problema', dimension: 'asuncion' },
  { id: 10, texto: 'He ajustado mi idea al menos una vez basándome en feedback real de potenciales clientes', dimension: 'validacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' }, { valor: 2, etiqueta: 'Poco' }, { valor: 3, etiqueta: 'Regular' }, { valor: 4, etiqueta: 'Bastante' }, { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(asuncion: number, validacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (asuncion >= umbralAlto && validacion >= umbralAlto) {
    return {
      nombre: 'Emprendedor en Conflicto',
      emoji: '🔀',
      descripcion: 'Asumes mucho Y validas mucho. Puede parecer contradictorio, pero indica que estás en una fase activa: tienes convicciones fuertes sobre tu idea pero también estás haciendo el trabajo de validación. El riesgo es que la validación sea selectiva: buscar confirmación de lo que ya crees.',
      fortalezas: ['Convicción + acción: combinación potente', 'Estás haciendo trabajo de campo', 'Capacidad de mantener la fe mientras cuestionas'],
      riesgos: ['Validación sesgada: buscar datos que confirmen, no que refuten', 'Interpretar feedback ambiguo como positivo', 'Invertir más de lo necesario antes de pivotar'],
      acciones: ['Separa la validación de la venta: cuando hables con potenciales clientes, NO vendas tu idea — pregunta sobre su problema', 'Busca específicamente personas que NO necesitarían tu producto — entender por qué no lo necesitan es tan valioso como entender por qué sí', 'Define una "métrica de muerte": un número concreto que, si no se cumple en X semanas, te obliga a pivotar o parar'],
    };
  }

  if (asuncion >= umbralAlto && validacion < umbralBajo) {
    return {
      nombre: 'Enamorado de la Idea',
      emoji: '💘',
      descripcion: 'Muchas asunciones sin validar. Este es el perfil más peligroso para un emprendedor: estás tan enamorado de tu idea que no la sometes a la prueba de la realidad. Eric Ries advirtió que "la mayoría de startups no fracasan por falta de producto, sino por falta de clientes".',
      fortalezas: ['Pasión y convicción — motores necesarios', 'Energía para ejecutar', 'Reconocer este patrón puede ahorrarte meses o años'],
      riesgos: ['Construir algo que nadie quiere (el error #1 de startups)', 'Gastar tiempo y dinero en asunciones incorrectas', 'Sesgo de supervivencia: solo ves los emprendedores que acertaron "siguiendo su intuición"'],
      acciones: ['PARA. Antes de seguir construyendo, habla con 5 personas que podrían ser tu cliente. Pregunta: "¿Tienes este problema? ¿Cómo lo resuelves hoy? ¿Pagarías por una solución?"', 'Lee "The Mom Test" de Rob Fitzpatrick — te enseña a hablar con clientes sin que te digan lo que quieres oír', 'Define la asunción más arriesgada de tu idea y diseña un experimento de 1 semana para probarla'],
    };
  }

  if (asuncion < umbralBajo && validacion >= umbralAlto) {
    return {
      nombre: 'Emprendedor Metódico',
      emoji: '🔬',
      descripcion: 'Pocas asunciones y mucha validación: el perfil Lean Startup por excelencia. Validas antes de construir, escuchas al mercado y ajustas tu idea según datos reales. El riesgo es que la validación excesiva se convierta en excusa para no lanzar.',
      fortalezas: ['Bajo riesgo de construir algo que nadie quiere', 'Decisiones basadas en datos, no en intuición', 'Alta probabilidad de product-market fit'],
      riesgos: ['Parálisis por validación: siempre "una entrevista más" antes de actuar', 'Competidores más rápidos pueden llegar primero al mercado', 'La validación perfecta no existe — en algún momento hay que dar el salto'],
      acciones: ['Pon una fecha límite: "El día X lanzo, con lo que tenga validado" — la fecha crea urgencia', 'Define el MVP más pequeño posible y lánzalo — aprender del mercado real supera cualquier entrevista', 'Recuerda que validar NO es lo mismo que lanzar — la validación te da dirección, pero el lanzamiento te da tracción'],
    };
  }

  if (asuncion < umbralBajo && validacion < umbralBajo) {
    return {
      nombre: 'Fase de Exploración',
      emoji: '🌱',
      descripcion: 'Ni asumes mucho ni validas activamente. Puede que estés en las fases iniciales de una idea, o que no tengas una idea clara todavía. Es un buen punto de partida si lo usas para observar el mercado con mente abierta.',
      fortalezas: ['Sin inercia de asunciones erróneas', 'Apertura a lo que el mercado necesita', 'Momento ideal para explorar sin sesgo'],
      riesgos: ['La exploración sin dirección puede ser infinita', 'Falta de compromiso con una dirección', 'Otros actúan mientras tú observas'],
      acciones: ['Elige un problema que te interese y habla con 5 personas que lo tengan — las conversaciones generan ideas mejores que la introspección', 'No busques "la idea perfecta" — busca un problema real que te motive resolver', 'Da un paso concreto esta semana: crea una lista de 3 problemas que podrías resolver y clasifícalos por urgencia para el cliente'],
    };
  }

  if (asuncion >= validacion) {
    return {
      nombre: 'Tendencia a Asumir',
      emoji: '💭',
      descripcion: 'Tus asunciones superan ligeramente a tu validación. No es extremo, pero indica que estás confiando más en tu intuición que en datos reales. Pequeños ajustes pueden hacer una gran diferencia.',
      fortalezas: ['Intuición presente — puede ser valiosa si se valida', 'Algo de validación en marcha', 'Margen para corregir'],
      riesgos: ['Las asunciones no validadas son deuda de riesgo que se acumula', 'Cada decisión basada en asunción amplifica el error si la asunción es incorrecta', 'Riesgo de descubrir tarde que el mercado no existe'],
      acciones: ['Haz una lista de todas tus asunciones sobre tu idea: cliente, problema, precio, canal, competencia. Luego marca cuáles has validado y cuáles no.', 'La asunción con mayor impacto y menor validación: esa es tu prioridad #1 esta semana', 'Cambia "creo que..." por "he comprobado que..." en tu discurso — si no puedes, esa es una asunción sin validar'],
    };
  }

  return {
    nombre: 'Tendencia a Validar',
    emoji: '📊',
    descripcion: 'Tu validación supera ligeramente a tus asunciones. Buena dirección: estás comprobando antes de asumir. Mantén este hábito y asegúrate de que la validación lleva a acción, no solo a más preguntas.',
    fortalezas: ['Buen hábito de validación', 'Asunciones contenidas', 'Base sólida para tomar decisiones'],
    riesgos: ['La validación puede convertirse en procrastinación si no lleva a acción', 'Riesgo de sobreanalizar', 'El mercado no espera — actuar con el 80% de la información suele ser suficiente'],
    acciones: ['Define cuántas entrevistas/datos necesitas antes de decidir — y cúmplelo, sin "una más"', 'Después de cada ronda de validación, toma UNA decisión concreta basada en lo aprendido', 'Pon fecha de lanzamiento y mantenla — la validación perfecta no existe'],
  };
}

export default function TestValidacionIdeaPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleRespuesta = (preguntaId: number, valor: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }));
    if (mostrarResultado) setMostrarResultado(false);
  };

  const calcularResultado = () => { setMostrarResultado(true); setTimeout(() => { document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' }); }, 100); };
  const reiniciar = () => { setRespuestas({}); setMostrarResultado(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const puntuacionAsuncion = PREGUNTAS.filter((p) => p.dimension === 'asuncion').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const puntuacionValidacion = PREGUNTAS.filter((p) => p.dimension === 'validacion').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const perfil = obtenerPerfil(puntuacionAsuncion, puntuacionValidacion);
  const posX = ((puntuacionAsuncion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionValidacion - 5) / 20) * 100;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>🧪 Test de Validación de Idea</h1>
          <p className={styles.subtitle}>¿Tu idea resuelve un problema real o solo te gusta a ti?<br />Basado en Lean Startup (Eric Ries)</p>
          <div className={styles.badges}>
            <span className={styles.badge}>🕐 3 minutos</span>
            <span className={styles.badge}>📊 10 preguntas</span>
            <span className={styles.badge}>🔒 Sin registro</span>
          </div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>Eric Ries, en <em>The Lean Startup</em> (2011), demostró que <strong>la mayoría de startups no fracasan por falta de producto, sino por falta de clientes</strong>. Construyen algo que nadie quiere porque asumieron en lugar de validar.</p>
          <p>Este test evalúa dos dimensiones: cuánto estás asumiendo sin datos (peligroso) y cuánto estás validando con el mercado real (valioso). <strong>Validar no es preguntar &quot;¿te gusta mi idea?&quot; — es descubrir si el problema existe y si pagarían por resolverlo.</strong></p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>Piensa en tu idea o proyecto actual</h2>
          <p className={styles.sectionSubtitle}>Responde con honestidad, no con optimismo</p>
          {PREGUNTAS.map((pregunta, index) => (
            <div key={pregunta.id} className={styles.questionCard}>
              <div className={styles.questionHeader}><span className={styles.questionNumber}>{index + 1}</span></div>
              <p className={styles.questionText}>{pregunta.texto}</p>
              <div className={styles.scaleContainer} role="radiogroup" aria-label={`Pregunta ${index + 1}: ${pregunta.texto}`}>
                {ESCALA.map((opcion) => (
                  <button key={opcion.valor} className={`${styles.scaleButton} ${respuestas[pregunta.id] === opcion.valor ? styles.scaleButtonActive : ''}`} onClick={() => handleRespuesta(pregunta.id, opcion.valor)} role="radio" aria-checked={respuestas[pregunta.id] === opcion.valor} aria-label={`${opcion.etiqueta} (${opcion.valor} de 5)`}>
                    <span className={styles.scaleValue}>{opcion.valor}</span><span className={styles.scaleLabel}>{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.progressInfo}>{Object.keys(respuestas).length} de {PREGUNTAS.length} respondidas</div>
          <button className={styles.btnPrimary} onClick={calcularResultado} disabled={!todasRespondidas} aria-label="Ver mi diagnóstico">
            {todasRespondidas ? 'Ver mi diagnóstico' : `Responde las ${PREGUNTAS.length - Object.keys(respuestas).length} preguntas restantes`}
          </button>
        </section>

        {mostrarResultado && (
          <section id="resultado" className={styles.resultSection} aria-live="polite">
            <h2 className={styles.sectionTitle}>Tu diagnóstico</h2>
            <div className={styles.mapContainer}>
              <div className={styles.mapLabels}>
                <span className={styles.mapLabelTop}>🔬 Alta Validación</span>
                <span className={styles.mapLabelBottom}>Baja Validación</span>
                <span className={styles.mapLabelLeft}>Baja Asunción</span>
                <span className={styles.mapLabelRight}>💘 Alta Asunción</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}><span>🔬 Emprendedor Metódico</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}><span>🔀 En Conflicto</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}><span>🌱 Fase Exploración</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}><span>💘 Enamorado de la Idea</span></div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div className={styles.mapDot} style={{ left: `${posX}%`, top: `${posY}%` }} aria-label={`Tu posición: Asunción ${puntuacionAsuncion}/25, Validación ${puntuacionValidacion}/25`}>
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>💘 Asunción</span><span className={styles.scoreValue}>{puntuacionAsuncion}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barAsuncion}`} style={{ width: `${(puntuacionAsuncion / 25) * 100}%` }} /></div></div>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>🔬 Validación</span><span className={styles.scoreValue}>{puntuacionValidacion}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barValidacion}`} style={{ width: `${(puntuacionValidacion / 25) * 100}%` }} /></div></div>
            </div>

            <div className={styles.profileCard}>
              <div className={styles.profileHeader}><span className={styles.profileEmoji}>{perfil.emoji}</span><h3 className={styles.profileName}>{perfil.nombre}</h3></div>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>
              <div className={styles.profileColumns}>
                <div className={styles.profileColumn}><h4 className={styles.columnTitle}>✅ Fortalezas</h4><ul className={styles.profileList}>{perfil.fortalezas.map((f, i) => (<li key={i}>{f}</li>))}</ul></div>
                <div className={styles.profileColumn}><h4 className={styles.columnTitle}>⚠️ Riesgos</h4><ul className={styles.profileList}>{perfil.riesgos.map((r, i) => (<li key={i}>{r}</li>))}</ul></div>
              </div>
              <div className={styles.actionsSection}><h4 className={styles.actionsTitle}>🎯 Acciones sugeridas</h4><ol className={styles.actionsList}>{perfil.acciones.map((a, i) => (<li key={i}>{a}</li>))}</ol></div>
            </div>
            <button className={styles.btnSecondary} onClick={reiniciar}>Repetir diagnóstico</button>
          </section>
        )}

        <EducationalSection title="📚 Lean Startup: validar antes de construir" subtitle="El método que cambió el emprendimiento">
          <section className={styles.guideSection}>
            <h2>El ciclo Build-Measure-Learn</h2>
            <p>Eric Ries propuso en 2011 un ciclo iterativo para emprender: <strong>Construir</strong> una versión mínima (MVP), <strong>Medir</strong> cómo responde el mercado, y <strong>Aprender</strong> para decidir si pivotar o perseverar. La clave es que el ciclo sea lo más corto posible.</p>
            <h2>El MVP: Producto Mínimo Viable</h2>
            <p>El MVP no es &quot;el producto a medias&quot; — es la versión más pequeña de tu idea que permite aprender algo real del mercado. Puede ser una landing page, una encuesta, un prototipo en papel o incluso un servicio manual que simule el producto.</p>
            <h2>Product-Market Fit</h2>
            <p>Marc Andreessen definió el product-market fit como &quot;estar en un buen mercado con un producto que satisface ese mercado&quot;. Antes de tenerlo, todo es experimentación. Después de tenerlo, todo es escalado. <strong>El error más caro es escalar antes de tener fit.</strong></p>
            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Ries, E. (2011). <em>The Lean Startup</em>. Crown Business.</li>
              <li>Fitzpatrick, R. (2013). <em>The Mom Test</em>. Robfitz Ltd.</li>
              <li>Blank, S. (2005). <em>The Four Steps to the Epiphany</em>. K&amp;S Ranch.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-validacion-idea')} />
        <ShareCard appName="test-validacion-idea" />
        <Footer appName="test-validacion-idea" />
      </div>
    </>
  );
}
