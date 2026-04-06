'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MapaRiesgoEmprendedor.module.css';
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

interface Pregunta { id: number; texto: string; dimension: 'exposicion' | 'preparacion'; }
interface Perfil { nombre: string; emoji: string; descripcion: string; fortalezas: string[]; riesgos: string[]; acciones: string[]; }

const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: 'He invertido una parte significativa de mis ahorros en mi proyecto sin garantía de retorno', dimension: 'exposicion' },
  { id: 6, texto: 'Tengo un colchón financiero que me permite vivir al menos 6 meses sin ingresos del proyecto', dimension: 'preparacion' },
  { id: 2, texto: 'Si mi proyecto fracasa, mi situación financiera personal se vería seriamente comprometida', dimension: 'exposicion' },
  { id: 7, texto: 'He identificado las 3 cosas que podrían salir mal y tengo un plan para cada una', dimension: 'preparacion' },
  { id: 3, texto: 'He dejado un trabajo estable para dedicarme al proyecto a tiempo completo', dimension: 'exposicion' },
  { id: 8, texto: 'Tengo habilidades profesionales que me permitirían encontrar trabajo si el proyecto no funciona', dimension: 'preparacion' },
  { id: 4, texto: 'Mis relaciones personales están afectadas por el estrés y la dedicación al proyecto', dimension: 'exposicion' },
  { id: 9, texto: 'He establecido límites claros sobre cuánto tiempo y dinero voy a invertir antes de decidir si continúo o paro', dimension: 'preparacion' },
  { id: 5, texto: 'Siento que "no tengo opción" — el proyecto tiene que funcionar porque no hay plan B', dimension: 'exposicion' },
  { id: 10, texto: 'Cuento con personas de confianza (mentor, socio, amigos) que me darían perspectiva objetiva si las cosas van mal', dimension: 'preparacion' },
];

const ESCALA = [
  { valor: 1, etiqueta: 'Nada' }, { valor: 2, etiqueta: 'Poco' }, { valor: 3, etiqueta: 'Regular' }, { valor: 4, etiqueta: 'Bastante' }, { valor: 5, etiqueta: 'Mucho' },
];

function obtenerPerfil(exposicion: number, preparacion: number): Perfil {
  const umbralAlto = 18;
  const umbralBajo = 14;

  if (exposicion >= umbralAlto && preparacion >= umbralAlto) {
    return {
      nombre: 'Riesgo Calculado',
      emoji: '♟️',
      descripcion: 'Alta exposición con alta preparación: has apostado fuerte pero con red de seguridad. Es el perfil del emprendedor veterano: sabe que está arriesgando, pero ha pensado en qué pasa si falla. Nassim Taleb lo llamaría "barbell strategy" — asumir riesgo pero con protección contra lo peor.',
      fortalezas: ['Riesgo asumido conscientemente, no por ignorancia', 'Plan B pensado y preparado', 'Capacidad de actuar con intensidad sin temeridad'],
      riesgos: ['El plan B puede dar falsa sensación de seguridad', 'El estrés de la alta exposición puede erosionar la preparación con el tiempo', 'Si el colchón se gasta antes de lo previsto, la preparación se convierte en urgencia'],
      acciones: ['Revisa tu colchón financiero cada mes — no solo el saldo, sino la velocidad a la que se consume', 'Actualiza tu "deadline de decisión": la fecha en la que decides si el proyecto es viable. No la pospongas sin razones nuevas.', 'Mantén activas 2-3 relaciones profesionales fuera de tu proyecto — si necesitas pivotar, esas conexiones valen oro'],
    };
  }

  if (exposicion >= umbralAlto && preparacion < umbralBajo) {
    return {
      nombre: 'Todo o Nada',
      emoji: '🎰',
      descripcion: 'Alta exposición sin preparación: estás jugando a todo o nada. No es que seas valiente — es que no has pensado en el escenario de fracaso. Y el escenario de fracaso existe: según datos del INE, el 50% de los negocios en España no sobreviven los primeros 5 años. Prepararse no es pesimismo — es responsabilidad.',
      fortalezas: ['Compromiso total con el proyecto', 'La presión puede ser un motor si la gestionas', 'Reconocer la situación es el primer paso para protegerte'],
      riesgos: ['Ruina financiera si el proyecto no funciona', 'Decisiones desesperadas por falta de alternativas', 'Impacto en salud mental y relaciones por presión sin válvula de escape'],
      acciones: ['URGENTE: calcula cuántos meses puedes sostenerte al ritmo actual sin ingresos del proyecto. Si el número te asusta, necesitas actuar ya.', 'Busca una fuente de ingresos mínima que no comprometa el proyecto pero que te dé oxígeno (freelance parcial, consultoría, clases)', 'Define tu "línea roja": el punto en el que paras, pivotas o buscas empleo. Tenerla definida ANTES de necesitarla es lo que separa el riesgo del kamikaze.'],
    };
  }

  if (exposicion < umbralBajo && preparacion >= umbralAlto) {
    return {
      nombre: 'Emprendedor Cauteloso',
      emoji: '🛡️',
      descripcion: 'Baja exposición y alta preparación: estás protegido. Es la posición más segura para emprender: mantienes tu red de seguridad mientras pruebas tu idea. El riesgo no es el fracaso — es que la cautela excesiva te impida comprometerte lo suficiente para que el proyecto tenga tracción.',
      fortalezas: ['Riesgo controlado — si falla, no te arruina', 'Plan B sólido que te da libertad para experimentar', 'Decisiones desde la fortaleza, no desde la desesperación'],
      riesgos: ['La falta de exposición puede significar falta de compromiso real', 'El proyecto puede no recibir la energía que necesita si siempre "hay otra opción"', 'Otros emprendedores más arriesgados pueden avanzar más rápido'],
      acciones: ['Pregúntate: ¿mi cautela está protegiendo mi proyecto o está frenándolo? — hay un punto donde la seguridad se convierte en lastre', 'Define qué evidencia necesitarías ver para aumentar tu apuesta (dedicar más tiempo, invertir más, dejar el empleo)', 'Pon un plazo: "Si en X meses el proyecto muestra tracción, doy el siguiente paso" — la ambigüedad eterna mata más proyectos que el fracaso'],
    };
  }

  if (exposicion < umbralBajo && preparacion < umbralBajo) {
    return {
      nombre: 'Explorador sin Compromiso',
      emoji: '🔭',
      descripcion: 'Baja exposición y baja preparación: ni arriesgas ni te preparas. Puede que estés en fase de idea, que no te hayas comprometido todavía, o que estés tanteando el terreno. Es una posición segura pero también estéril: sin exposición no hay aprendizaje real, y sin preparación no hay estructura.',
      fortalezas: ['Sin riesgo inmediato', 'Libertad total para explorar opciones', 'Momento ideal para diseñar tu enfoque antes de comprometerte'],
      riesgos: ['La exploración perpetua no produce resultados', 'Sin piel en el juego, el aprendizaje es superficial', 'Otros actúan mientras tú exploras'],
      acciones: ['Decide si quieres emprender de verdad o si es solo una idea agradable — ambas respuestas son válidas, pero requieren acciones diferentes', 'Si sí: da UN paso concreto esta semana (registrar un dominio, hacer una llamada, crear un prototipo) — la acción genera compromiso', 'Si no estás seguro: pon un plazo de 30 días para decidir. Investiga, habla con gente, haz números. Pero al final de los 30 días, decide.'],
    };
  }

  if (exposicion >= preparacion) {
    return {
      nombre: 'Tendencia al Riesgo',
      emoji: '⚠️',
      descripcion: 'Tu exposición supera ligeramente a tu preparación. No es crítico, pero indica que estás más expuesto de lo que tu plan B cubre. Corregir ahora es mucho más fácil que corregir cuando estés en apuros.',
      fortalezas: ['Compromiso real con el proyecto', 'Algo de preparación presente', 'Margen para reforzar la preparación sin reducir la exposición'],
      riesgos: ['La brecha entre exposición y preparación puede ampliarse', 'Un imprevisto puede convertir el riesgo en crisis', 'Decisiones bajo presión son peores que decisiones planificadas'],
      acciones: ['Refuerza tu preparación SIN reducir tu compromiso: ahorra más, actualiza tu CV, mantén relaciones profesionales activas', 'Haz un ejercicio de pre-mortem: "Si dentro de 6 meses todo ha salido mal, ¿qué habrá pasado?" — y prepárate para esos escenarios', 'Habla con alguien que haya fracasado y se haya recuperado — su experiencia es más valiosa que la de los que solo han tenido éxito'],
    };
  }

  return {
    nombre: 'Tendencia a la Prudencia',
    emoji: '🌱',
    descripcion: 'Tu preparación supera ligeramente a tu exposición. Buena dirección: tienes más red de seguridad que riesgo asumido. El reto es no quedarte indefinidamente en esta posición — en algún momento, emprender requiere dar un paso adelante.',
    fortalezas: ['Buena base de seguridad', 'Preparación superior al riesgo', 'Posición desde la que puedes escalar el compromiso'],
    riesgos: ['La prudencia puede convertirse en inacción', 'El proyecto puede necesitar más energía de la que estás dispuesto a dar', 'Otros con más exposición pueden avanzar más rápido'],
    acciones: ['Define las condiciones que te harían dar el siguiente paso — y sé honesto sobre si esas condiciones son alcanzables o son excusas', 'Habla con emprendedores que estén un paso por delante tuyo — ver que se puede hacer ayuda a reducir el miedo', 'Recuerda: el riesgo de no hacer nada también tiene un coste — oportunidad perdida, experiencia no adquirida, años pasados'],
  };
}

export default function MapaRiesgoEmprendedorPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const todasRespondidas = PREGUNTAS.every((p) => respuestas[p.id] !== undefined);

  const handleRespuesta = (preguntaId: number, valor: number) => { setRespuestas((prev) => ({ ...prev, [preguntaId]: valor })); if (mostrarResultado) setMostrarResultado(false); };
  const calcularResultado = () => { setMostrarResultado(true); setTimeout(() => { document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' }); }, 100); };
  const reiniciar = () => { setRespuestas({}); setMostrarResultado(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const puntuacionExposicion = PREGUNTAS.filter((p) => p.dimension === 'exposicion').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const puntuacionPreparacion = PREGUNTAS.filter((p) => p.dimension === 'preparacion').reduce((sum, p) => sum + (respuestas[p.id] || 0), 0);
  const perfil = obtenerPerfil(puntuacionExposicion, puntuacionPreparacion);
  const posX = ((puntuacionExposicion - 5) / 20) * 100;
  const posY = 100 - ((puntuacionPreparacion - 5) / 20) * 100;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>🎲 Mapa de Riesgo del Emprendedor</h1>
          <p className={styles.subtitle}>¿Qué pasa si esto no funciona? ¿Lo has pensado?<br />Análisis de riesgos personales del emprendedor</p>
          <div className={styles.badges}><span className={styles.badge}>🕐 3 minutos</span><span className={styles.badge}>📊 10 preguntas</span><span className={styles.badge}>🔒 Sin registro</span></div>
        </header>

        <LegalNotice />

        <section className={styles.contextCard}>
          <p>La cultura del emprendimiento glorifica el riesgo: <strong>&quot;El que no arriesga no gana&quot;</strong>. Pero la realidad es más matizada. Los emprendedores más exitosos no son los que más arriesgan — son los que mejor gestionan su riesgo.</p>
          <p>Nassim Taleb distingue entre <strong>riesgo calculado</strong> (exposición controlada con plan de contingencia) y <strong>riesgo ingenuo</strong> (exposición sin preparación). Este test evalúa en cuál de los dos estás.</p>
        </section>

        <section className={styles.questionsSection}>
          <h2 className={styles.sectionTitle}>Piensa en tu situación como emprendedor</h2>
          <p className={styles.sectionSubtitle}>Valora cada afirmación con honestidad</p>
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
                <span className={styles.mapLabelTop}>🛡️ Alta Preparación</span><span className={styles.mapLabelBottom}>Baja Preparación</span>
                <span className={styles.mapLabelLeft}>Baja Exposición</span><span className={styles.mapLabelRight}>🎰 Alta Exposición</span>
              </div>
              <div className={styles.map}>
                <div className={`${styles.quadrant} ${styles.quadrantTL}`}><span>🛡️ Cauteloso</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantTR}`}><span>♟️ Riesgo Calculado</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBL}`}><span>🔭 Sin Compromiso</span></div>
                <div className={`${styles.quadrant} ${styles.quadrantBR}`}><span>🎰 Todo o Nada</span></div>
                <div className={styles.thresholdLineV} style={{ left: '45%' }} aria-hidden="true" />
                <div className={styles.thresholdLineV} style={{ left: '65%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '35%' }} aria-hidden="true" />
                <div className={styles.thresholdLineH} style={{ top: '55%' }} aria-hidden="true" />
                <div className={styles.mapDot} style={{ left: `${posX}%`, top: `${posY}%` }} aria-label={`Tu posición: Exposición ${puntuacionExposicion}/25, Preparación ${puntuacionPreparacion}/25`}>
                  <span className={styles.mapDotLabel}>Tú</span>
                </div>
              </div>
            </div>

            <div className={styles.scoresContainer}>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>🎰 Exposición</span><span className={styles.scoreValue}>{puntuacionExposicion}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barExposicion}`} style={{ width: `${(puntuacionExposicion / 25) * 100}%` }} /></div></div>
              <div className={styles.scoreBar}><div className={styles.scoreHeader}><span>🛡️ Preparación</span><span className={styles.scoreValue}>{puntuacionPreparacion}/25</span></div><div className={styles.barTrack}><div className={`${styles.barFill} ${styles.barPreparacion}`} style={{ width: `${(puntuacionPreparacion / 25) * 100}%` }} /></div></div>
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

        <EducationalSection title="📚 Gestión de riesgo para emprendedores" subtitle="Arriesgar bien no es arriesgar mucho">
          <section className={styles.guideSection}>
            <h2>El mito del emprendedor temerario</h2>
            <p>La narrativa popular presenta a los emprendedores exitosos como visionarios que &quot;lo apostaron todo&quot;. Pero la investigación cuenta una historia diferente: según un estudio de la Universidad de Wisconsin, <strong>los emprendedores que mantienen su empleo mientras lanzan su negocio tienen un 33% más de probabilidades de éxito</strong> que los que lo dejan todo.</p>
            <h2>La estrategia barbell de Taleb</h2>
            <p>Nassim Taleb propone la <strong>estrategia barbell</strong>: combinar una posición muy segura (ahorros, empleo, habilidades transferibles) con una posición de alto riesgo (tu proyecto emprendedor). La clave es que la posición segura te protege de la ruina mientras la arriesgada te da la oportunidad de ganar grande.</p>
            <h2>Las señales de alarma</h2>
            <ul>
              <li><strong>No tienes colchón financiero</strong>: Si un mes sin ingresos te pone en apuros, tu exposición es demasiado alta.</li>
              <li><strong>No has pensado en el fracaso</strong>: Si no puedes describir qué harías si el proyecto fracasa, no tienes plan B.</li>
              <li><strong>Tus relaciones sufren</strong>: Si tu pareja, familia o amigos expresan preocupación repetidamente, escucha.</li>
              <li><strong>No tienes deadline</strong>: Si no hay una fecha en la que decidas si el proyecto es viable, puedes quedar atrapado indefinidamente.</li>
            </ul>
            <h3>Lecturas recomendadas</h3>
            <ul>
              <li>Taleb, N.N. (2012). <em>Antifragile: Things That Gain from Disorder</em>. Random House.</li>
              <li>Ries, E. (2011). <em>The Lean Startup</em>. Crown Business.</li>
              <li>Horowitz, B. (2014). <em>The Hard Thing About Hard Things</em>. Harper Business.</li>
            </ul>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('mapa-riesgo-emprendedor')} />
        <ShareCard appName="mapa-riesgo-emprendedor" />
        <Footer appName="mapa-riesgo-emprendedor" />
      </div>
    </>
  );
}
