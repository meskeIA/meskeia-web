'use client';

import { useState } from 'react';
import styles from './AuditoriaPropuestaValor.module.css';
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

interface Pregunta { id: number; texto: string; dimension: 'encaje' | 'comunicacion'; }
interface Perfil { nombre: string; emoji: string; descripcion: string; fortalezas: string[]; riesgos: string[]; acciones: string[]; }

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'Lo que ofrezco resuelve un problema real y urgente para mi cliente (no solo "está bien tenerlo")', dimension: 'encaje' },
  { id: 6, texto: 'Mis clientes entienden rápidamente qué les ofrezco y por qué les conviene', dimension: 'comunicacion' },
  { id: 2, texto: 'Sé exactamente qué "dolor" tiene mi cliente y mi producto/servicio lo alivia directamente', dimension: 'encaje' },
  { id: 7, texto: 'Tengo un mensaje claro que diferencia mi oferta de las alternativas del mercado', dimension: 'comunicacion' },
  { id: 3, texto: 'Mis clientes estarían significativamente peor si mi producto/servicio dejara de existir', dimension: 'encaje' },
  { id: 8, texto: 'Puedo explicar el valor de lo que hago en 30 segundos a alguien que no me conoce', dimension: 'comunicacion' },
  { id: 4, texto: 'He ajustado mi oferta basándome en feedback real de clientes, no solo en lo que yo creo que necesitan', dimension: 'encaje' },
  { id: 9, texto: 'Mis materiales (web, presentaciones, conversaciones) transmiten claramente por qué elegirme a mí', dimension: 'comunicacion' },
  { id: 5, texto: 'Lo que ofrezco genera beneficios que el cliente puede medir o percibir de forma concreta', dimension: 'encaje' },
  { id: 10, texto: 'Recibo con frecuencia referencias de clientes satisfechos que explican bien a otros lo que hago', dimension: 'comunicacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' }, { valor: 2, etiqueta: 'Poco' }, { valor: 3, etiqueta: 'Regular' }, { valor: 4, etiqueta: 'Bastante' }, { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(encaje: number, comunicacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (encaje >= umbralAlto && comunicacion >= umbralAlto) {
    return {
      nombre: 'Propuesta Completa',
      emoji: '🎯',
      descripcion: 'Tu oferta encaja con las necesidades del cliente Y sabes comunicarlo bien. Es la posición ideal: product-market fit + narrativa clara. Los clientes entienden tu valor, lo perciben como real, y probablemente te recomiendan. El reto es mantener este encaje cuando el mercado evolucione.',
      fortalezas: ['Encaje real entre oferta y necesidad del cliente', 'Comunicación clara que facilita la venta y las referencias', 'Base sólida para crecer y escalar'],
      riesgos: ['Complacencia: el encaje de hoy puede no ser el de mañana', 'Nuevos competidores pueden copiar tu comunicación', 'El mercado cambia — lo que encaja hoy puede desencajar en 2 años'],
      acciones: ['Revisa tu propuesta cada 6 meses preguntando a clientes: "¿Qué mejorarías de lo que te ofrezco?"', 'Monitoriza qué dice la competencia — si empiezan a usar tu mismo mensaje, necesitas diferenciarte de nuevo', 'Invierte en marketing de contenido que refuerce tu propuesta — la visibilidad sostiene el encaje'],
    };
  }

  if (encaje >= umbralAlto && comunicacion < umbralBajo) {
    return {
      nombre: 'Valor Oculto',
      emoji: '💎',
      descripcion: 'Tu oferta resuelve un problema real, pero no sabes comunicarlo bien. Es como tener un producto excelente en un envase malo: el valor está ahí, pero el cliente no lo ve (o tarda demasiado en verlo). Esto limita tu crecimiento y te obliga a vender uno a uno en lugar de escalar.',
      fortalezas: ['Encaje real producto-mercado — lo más difícil ya está hecho', 'Clientes existentes probablemente satisfechos', 'El problema es de comunicación, no de producto — más fácil de resolver'],
      riesgos: ['Crecimiento lento porque cada venta requiere mucha explicación', 'Competidores con peor producto pero mejor comunicación pueden adelantarte', 'Frustración por no poder transmitir tu verdadero valor'],
      acciones: ['Pregunta a tu mejor cliente: "¿Cómo me explicarías a un amigo?" — su lenguaje es mejor que el tuyo para describir tu valor', 'Simplifica tu mensaje: elimina jerga técnica y céntrate en el resultado que el cliente obtiene, no en cómo lo consigues', 'Crea un "elevator pitch" de 30 segundos y practícalo hasta que suene natural — si necesitas más de 30 segundos, tu mensaje es demasiado complejo'],
    };
  }

  if (encaje < umbralBajo && comunicacion >= umbralAlto) {
    return {
      nombre: 'Marketing sin Sustancia',
      emoji: '📢',
      descripcion: 'Comunicas bien pero tu oferta no encaja del todo con lo que el cliente necesita. Es un perfil peligroso: puedes atraer clientes con buen marketing, pero si el producto no cumple la promesa, la decepción genera algo peor que la indiferencia: reputación negativa.',
      fortalezas: ['Capacidad de comunicación y venta', 'Visibilidad y capacidad de generar interés', 'Si ajustas el encaje, el crecimiento será rápido'],
      riesgos: ['Expectativas altas que el producto no cumple', 'Churn alto: los clientes llegan pero no se quedan', 'Reputación deteriorada si la brecha entre promesa y realidad es grande'],
      acciones: ['PARA de vender temporalmente y habla con clientes insatisfechos: ¿qué esperaban que no encontraron?', 'Ajusta tu oferta ANTES de ajustar tu comunicación — prometer menos y cumplir más es mejor estrategia a largo plazo', 'Identifica el gap específico entre lo que comunicas y lo que entregas — ese gap es tu prioridad #1'],
    };
  }

  if (encaje < umbralBajo && comunicacion < umbralBajo) {
    return {
      nombre: 'Propuesta por Definir',
      emoji: '🧭',
      descripcion: 'Ni el encaje ni la comunicación están claros. Es la fase más temprana de un negocio: sabes que quieres ofrecer algo, pero aún no has encontrado el punto donde tu oferta, tu cliente y tu mensaje convergen. No es un fracaso — es una fase. Pero necesita trabajo urgente.',
      fortalezas: ['Sin promesas incumplidas — puedes diseñar desde cero', 'Apertura total a lo que el mercado necesite', 'Momento ideal para validar antes de invertir'],
      riesgos: ['Sin encaje ni comunicación, no hay negocio — hay una intención', 'Riesgo de invertir tiempo y dinero en la dirección equivocada', 'Parálisis por no saber por dónde empezar'],
      acciones: ['Empieza por el encaje, NO por la comunicación: primero encuentra un problema real, luego aprende a hablar de él', 'Habla con 10 personas que podrían ser tu cliente y pregunta: "¿Cuál es tu mayor frustración en [tu área]?"', 'No intentes definir tu propuesta en un PowerPoint — defínela en conversaciones reales con personas reales'],
    };
  }

  if (encaje >= comunicacion) {
    return {
      nombre: 'Tendencia al Encaje',
      emoji: '🔧',
      descripcion: 'Tu oferta encaja mejor de lo que la comunicas. Hay más valor del que el cliente percibe. Es una buena base: el producto funciona, pero la narrativa necesita trabajo. El marketing no es "decorar" — es hacer visible lo que ya es valioso.',
      fortalezas: ['Base de encaje real', 'Clientes existentes probablemente contentos', 'Mejora de comunicación dará resultados rápidos'],
      riesgos: ['Crecimiento frenado por mala comunicación', 'Oportunidades perdidas porque el mercado no te conoce', 'Competidores más visibles pueden parecer mejores aunque no lo sean'],
      acciones: ['Dedica 2 horas a escribir 3 versiones de "qué hago y para quién" — pide a 3 personas que elijan la más clara', 'Crea 3 casos de éxito con clientes reales: problema → solución → resultado. Los casos venden mejor que las descripciones.', 'Invierte en tu web/LinkedIn/materiales: el primer contacto es visual, y tu valor debe ser evidente en 5 segundos'],
    };
  }

  return {
    nombre: 'Tendencia a la Comunicación',
    emoji: '📣',
    descripcion: 'Tu comunicación es ligeramente mejor que tu encaje. Sabes hablar de tu oferta, pero el producto podría estar más alineado con lo que el cliente realmente necesita. Buena comunicación con encaje medio funciona, pero no genera fidelidad.',
    fortalezas: ['Buena capacidad de comunicar valor', 'Visibilidad en el mercado', 'Base desde la que mejorar el encaje'],
    riesgos: ['El encaje insuficiente limita la retención', 'Clientes que llegan pero no repiten', 'La comunicación sin encaje tiene rendimientos decrecientes'],
    acciones: ['Dedica más tiempo a escuchar clientes que a hablar con ellos — el encaje se construye escuchando', 'Mide satisfacción: NPS, reseñas, tasa de repetición. Si la comunicación es buena pero la retención baja, el problema es el encaje.', 'Ajusta tu oferta antes de escalar tu comunicación — crecer con un encaje débil amplifica los problemas'],
  };
}

export default function AuditoriaPropuestaValorPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);
  const handleRespuesta = (preguntaId: number, valor: number) => { setRespuestas((prev) => ({ ...prev, [preguntaId]: valor })); if (mostrarResultado) setMostrarResultado(false); };
  const calcularResultado = () => { setMostrarResultado(true); setTimeout(() => { document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' }); }, 100); };
  const reiniciar = () => { setRespuestas({}); setMostrarResultado(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const puntuacionEncaje = PREGUNTAS.filter((p) => p.dimension === 'encaje').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const puntuacionComunicacion = PREGUNTAS.filter((p) => p.dimension === 'comunicacion').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const perfil = obtenerPerfil(puntuacionEncaje, puntuacionComunicacion);
  const posX = ((puntuacionEncaje - 5) / 20) * 100;
  const posY = 100 - ((puntuacionComunicacion - 5) / 20) * 100;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>💎 Auditoría de Propuesta de Valor</h1>
          <p className={styles.subtitle}>¿Lo que ofreces encaja con lo que tu cliente necesita?<br />Basado en el Value Proposition Canvas de Osterwalder</p>
          <div className={styles.badges}><span className={styles.badge}>🕐 3 minutos</span><span className={styles.badge}>📊 10 preguntas</span><span className={styles.badge}>🔒 Sin registro</span></div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>Alexander Osterwalder creó el <strong>Value Proposition Canvas</strong> para responder una pregunta fundamental: <strong>¿lo que ofreces es lo que tu cliente realmente necesita?</strong> No lo que tú crees que necesita — lo que él siente, busca y pagaría por resolver.</p>
          <p>Este test evalúa dos dimensiones: el <strong>encaje</strong> real entre tu oferta y la necesidad del cliente, y la <strong>comunicación</strong> de ese valor. Porque no basta con tener algo bueno — el cliente tiene que entenderlo.</p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>Piensa en tu oferta y en tu cliente</h2>
          <p className={styles.sectionSubtitle}>Valora cada afirmación desde la perspectiva del cliente, no la tuya</p>
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
                <span className={styles.mapLabelTop}>📣 Alta Comunicación</span><span className={styles.mapLabelBottom}>Baja Comunicación</span>
                <span className={styles.mapLabelLeft}>Bajo Encaje</span><span className={styles.mapLabelRight}>🎯 Alto Encaje</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}><span>📢 Marketing sin Sustancia</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}><span>🎯 Propuesta Completa</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}><span>🧭 Por Definir</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}><span>💎 Valor Oculto</span></div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" /><div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" /><div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div className={styles.mapDot} style={{ left: `${posX}%`, top: `${posY}%` }} aria-label={`Tu posición: Encaje ${puntuacionEncaje}/25, Comunicación ${puntuacionComunicacion}/25`}>
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>
            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>🎯 Encaje</span><span className={styles.scoreValue}>{puntuacionEncaje}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barEncaje}`} style={{ width: `${(puntuacionEncaje / 25) * 100}%` }} /></div></div>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>📣 Comunicación</span><span className={styles.scoreValue}>{puntuacionComunicacion}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barComunicacion}`} style={{ width: `${(puntuacionComunicacion / 25) * 100}%` }} /></div></div>
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

        <EducationalSection title="📚 Value Proposition Canvas: encaje oferta-cliente" subtitle="El marco que conecta lo que haces con lo que necesitan">
          <section className={styles.guideSection}>
            <h2>¿Qué es el Value Proposition Canvas?</h2>
            <p>Alexander Osterwalder publicó en 2014 <em>Value Proposition Design</em>, un complemento al Business Model Canvas centrado exclusivamente en la relación entre <strong>lo que el cliente necesita</strong> y <strong>lo que tú ofreces</strong>.</p>
            <p>El canvas tiene dos mitades: el <strong>perfil del cliente</strong> (trabajos, dolores, ganancias esperadas) y la <strong>propuesta de valor</strong> (productos/servicios, aliviadores de dolor, generadores de ganancia). El <strong>encaje</strong> ocurre cuando ambas mitades se alinean.</p>
            <h2>Los 3 niveles de encaje</h2>
            <ul>
              <li><strong>Problem-Solution Fit</strong>: Has identificado un problema real y tienes una solución creíble (aún sin construir).</li>
              <li><strong>Product-Market Fit</strong>: Tu producto resuelve el problema y los clientes pagan por él (validación real).</li>
              <li><strong>Business Model Fit</strong>: El modelo es rentable, escalable y sostenible a largo plazo.</li>
            </ul>
            <h2>El error de la &quot;solución en busca de problema&quot;</h2>
            <p>El error más frecuente es empezar por la solución (&quot;tengo esta tecnología/habilidad/idea&quot;) y buscar un problema que justifique su existencia. Los negocios más sólidos hacen lo contrario: <strong>empiezan por el problema del cliente y diseñan la solución alrededor</strong>.</p>
            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Osterwalder, A. et al. (2014). <em>Value Proposition Design</em>. John Wiley &amp; Sons.</li>
              <li>Christensen, C. et al. (2016). <em>Competing Against Luck</em>. Harper Business.</li>
              <li>Strategyzer.com — Herramientas y plantillas gratuitas del Value Proposition Canvas.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('auditoria-propuesta-valor')} />
        <ShareCard appName="auditoria-propuesta-valor" />
        <Footer appName="auditoria-propuesta-valor" />
      </div>
    </>
  );
}
