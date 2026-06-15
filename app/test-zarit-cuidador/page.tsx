'use client';

import { useState } from 'react';
import styles from './TestZaritCuidador.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard, RegionBadge
} from '@/components';
import DataReference from '@/components/DataReference';
import { getRelatedApps } from '@/data/app-relations';
import {
  PREGUNTAS_ZARIT,
  ESCALA_ZARIT_NIVELES,
  RECURSOS_CUIDADORES,
  FISCAL_DEPENDENCIA_META,
} from '@/data/fiscal';

// Opciones de respuesta Zarit: 1-5
const OPCIONES_ZARIT = [
  { valor: 1, etiqueta: 'Nunca' },
  { valor: 2, etiqueta: 'Casi nunca' },
  { valor: 3, etiqueta: 'A veces' },
  { valor: 4, etiqueta: 'Bastantes veces' },
  { valor: 5, etiqueta: 'Casi siempre' },
];

function getNivelZarit(puntuacionTotal: number) {
  for (const nivel of ESCALA_ZARIT_NIVELES) {
    if (puntuacionTotal >= nivel.puntuacionDesde && puntuacionTotal <= nivel.puntuacionHasta) {
      return nivel;
    }
  }
  // Fallback al último nivel
  return ESCALA_ZARIT_NIVELES[ESCALA_ZARIT_NIVELES.length - 1];
}

function getNivelClase(nombre: string): string {
  if (nombre === 'Sin sobrecarga') return styles.nivelBajo;
  if (nombre === 'Sobrecarga leve') return styles.nivelModerado;
  return styles.nivelAlto;
}

function getNivelColor(nombre: string): string {
  if (nombre === 'Sin sobrecarga') return 'var(--color-bajo)';
  if (nombre === 'Sobrecarga leve') return 'var(--color-moderado)';
  return 'var(--color-alto)';
}

function getNivelIcono(nombre: string): string {
  if (nombre === 'Sin sobrecarga') return '✅';
  if (nombre === 'Sobrecarga leve') return '⚠️';
  return '🚨';
}

export default function TestZaritCuidadorPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);

  const totalPreguntas = PREGUNTAS_ZARIT.length;
  const respondidas = Object.keys(respuestas).length;
  const progreso = Math.round((respondidas / totalPreguntas) * 100);

  const handleRespuesta = (preguntaIdx: number, valor: number) => {
    setRespuestas(prev => ({ ...prev, [preguntaIdx]: valor }));
    // Avanzar automáticamente a la siguiente pregunta
    if (preguntaActual < totalPreguntas - 1) {
      setTimeout(() => setPreguntaActual(prev => prev + 1), 400);
    }
  };

  const calcularResultados = () => {
    if (respondidas < totalPreguntas) return;
    setMostrarResultados(true);
    setTimeout(() => {
      const el = document.getElementById('resultados');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultados(false);
    setPreguntaActual(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Puntuación total (22-110)
  const puntuacionTotal = Object.values(respuestas).reduce((sum, v) => sum + v, 0);
  const nivel = getNivelZarit(puntuacionTotal);
  const nivelClase = getNivelClase(nivel.nombre);
  const barraAncho = ((puntuacionTotal - 22) / (110 - 22)) * 100;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>
            <span aria-hidden="true">🤝</span> Test de Zarit — Sobrecarga del Cuidador
          </h1>
          <p className={styles.heroSubtitle}>
            Escala Zarit validada en español (22 ítems) · Evaluación orientativa del nivel de sobrecarga
          </p>
        </header>

      <RegionBadge variant="es-data" />


        {/* Disclaimer CRÍTICO — salud mental */}
        <DisclaimerCard variant="medical" severity="high">
          <p>
            Este test es una herramienta de <strong>ORIENTACIÓN</strong> basada en la Escala de Zarit
            (Caregiver Burden Interview), validada en español por Martín et al. (1996).{' '}
            <strong>NO constituye diagnóstico clínico</strong> ni sustituye la evaluación de un
            profesional de salud mental.
          </p>
          <p>
            Si experimentas malestar significativo, consulta con tu médico de cabecera o profesional
            de referencia.
          </p>
          <p className={styles.emergencyInline}>
            <strong>En caso de crisis:</strong> llama al <strong>024</strong> (línea de atención a la
            conducta suicida) o al <strong>112</strong> (emergencias).
          </p>
        </DisclaimerCard>

        <DataReference
          normativa="Escala Zarit — Dependencia y cuidadores"
          fuente={FISCAL_DEPENDENCIA_META.fuente}
          verificado={FISCAL_DEPENDENCIA_META.verificado}
          urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
        />

        <LegalNotice />

        {/* Test */}
        {!mostrarResultados && (
          <section className={styles.testSection}>
            {/* Barra de progreso */}
            <div className={styles.progresoWrapper}>
              <div className={styles.progresoInfo}>
                <span>Pregunta {preguntaActual + 1} de {totalPreguntas}</span>
                <span>{respondidas} de {totalPreguntas} respondidas</span>
              </div>
              <div
                className={styles.barraProgreso}
                role="progressbar"
                aria-valuenow={progreso}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.barraProgresoRelleno} style={{ width: `${progreso}%` }} />
              </div>
            </div>

            {/* Mapa de preguntas */}
            <div className={styles.mapaPreguntas} aria-label="Mapa de preguntas">
              {PREGUNTAS_ZARIT.map((_, idx) => (
                <button
                  key={idx}
                  className={[
                    styles.mapaBurbuja,
                    respuestas[idx] !== undefined ? styles.mapaBurbujaRespondida : '',
                    idx === preguntaActual ? styles.mapaBurbujaActual : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setPreguntaActual(idx)}
                  aria-label={`Ir a pregunta ${idx + 1}`}
                  aria-current={idx === preguntaActual ? 'true' : undefined}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Pregunta actual */}
            <div className={styles.tarjetaPregunta}>
              <div className={styles.numeroPregunta}>
                Pregunta {preguntaActual + 1}
              </div>
              <p className={styles.textoPregunta}>
                {PREGUNTAS_ZARIT[preguntaActual]}
              </p>

              <div className={styles.opcionesGrid}>
                {OPCIONES_ZARIT.map(opcion => (
                  <button
                    key={opcion.valor}
                    className={[
                      styles.opcionBtn,
                      respuestas[preguntaActual] === opcion.valor ? styles.opcionSeleccionada : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleRespuesta(preguntaActual, opcion.valor)}
                    aria-pressed={respuestas[preguntaActual] === opcion.valor}
                  >
                    <span className={styles.opcionValor}>{opcion.valor}</span>
                    <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className={styles.navegacionBtns}>
              <button
                className={styles.btnSecundario}
                onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
                disabled={preguntaActual === 0}
              >
                ← Anterior
              </button>
              {preguntaActual < totalPreguntas - 1 ? (
                <button
                  className={styles.btnPrimario}
                  onClick={() => setPreguntaActual(prev => prev + 1)}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  className={styles.btnCalcular}
                  onClick={calcularResultados}
                  disabled={respondidas < totalPreguntas}
                >
                  {respondidas < totalPreguntas
                    ? `Responde ${totalPreguntas - respondidas} pregunta${totalPreguntas - respondidas > 1 ? 's' : ''} más`
                    : 'Ver resultado'}
                </button>
              )}
            </div>

            {respondidas > 0 && respondidas < totalPreguntas && (
              <p className={styles.faltanInfo}>
                Te faltan {totalPreguntas - respondidas} pregunta{totalPreguntas - respondidas > 1 ? 's' : ''} por responder.
                Puedes navegar libremente usando los botones numerados.
              </p>
            )}
          </section>
        )}

        {/* Resultados */}
        {mostrarResultados && (
          <section id="resultados" className={styles.resultadosSection}>
            <h2 className={styles.resultadosTitulo}>
              <span aria-hidden="true">📊</span> Tu resultado
            </h2>
            <p className={styles.resultadosSubtitulo}>
              Recuerda: esta evaluación es <strong>orientativa</strong>. Solo un profesional de salud
              mental puede realizar un diagnóstico.
            </p>

            {/* Puntuación total */}
            <div className={[styles.tarjetaResultado, nivelClase].join(' ')}>
              <div className={styles.resultadoHeader}>
                <span className={styles.resultadoIcono} aria-hidden="true">
                  {getNivelIcono(nivel.nombre)}
                </span>
                <div>
                  <h3 className={styles.resultadoNivel}>{nivel.nombre}</h3>
                  <p className={styles.resultadoPuntuacion}>
                    Puntuación total: <strong>{puntuacionTotal}</strong> / 110
                  </p>
                </div>
              </div>

              {/* Barra visual de puntuación */}
              <div className={styles.scoreBarWrapper}>
                <div className={styles.scoreBar}>
                  <div
                    className={styles.scoreBarFill}
                    style={{
                      width: `${barraAncho}%`,
                      background: getNivelColor(nivel.nombre),
                    }}
                  />
                  <div
                    className={styles.scoreBarMarker}
                    style={{ left: `${barraAncho}%` }}
                  />
                </div>
                <div className={styles.scoreBarLabels}>
                  <span>22</span>
                  <span>46</span>
                  <span>55</span>
                  <span>110</span>
                </div>
                <div className={styles.scoreBarZones}>
                  <span className={styles.zonaBajo}>Sin sobrecarga</span>
                  <span className={styles.zonaMedia}>Leve</span>
                  <span className={styles.zonaAlta}>Intensa</span>
                </div>
              </div>

              <p className={styles.resultadoDescripcion}>{nivel.descripcion}</p>

              {/* Recomendaciones */}
              <div className={styles.recomendacionesWrapper}>
                <h4>Recomendaciones orientativas:</h4>
                <ul className={styles.recomendacionesList}>
                  {nivel.recomendaciones.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recursos de ayuda */}
            <div className={styles.recursosSection}>
              <h3 className={styles.recursosTitulo}>
                <span aria-hidden="true">📞</span> Recursos de ayuda
              </h3>
              <div className={styles.recursosGrid}>
                <div className={styles.recursoCard}>
                  <span className={styles.recursoIcono} aria-hidden="true">🏛️</span>
                  <div>
                    <strong>IMSERSO</strong>
                    <p>{RECURSOS_CUIDADORES.telefonoIMSERSO}</p>
                    <a href={RECURSOS_CUIDADORES.webIMSERSO} target="_blank" rel="noopener noreferrer">
                      Web oficial →
                    </a>
                  </div>
                </div>
                <div className={styles.recursoCard}>
                  <span className={styles.recursoIcono} aria-hidden="true">📱</span>
                  <div>
                    <strong>Atención a la Dependencia</strong>
                    <p>{RECURSOS_CUIDADORES.telefonoDependencia}</p>
                    <a href={RECURSOS_CUIDADORES.webSAAD} target="_blank" rel="noopener noreferrer">
                      Portal SAAD →
                    </a>
                  </div>
                </div>
                <div className={styles.recursoCard}>
                  <span className={styles.recursoIcono} aria-hidden="true">🛡️</span>
                  <div>
                    <strong>Seguridad Social</strong>
                    <p>Convenio especial cuidadores</p>
                    <a href={RECURSOS_CUIDADORES.webSegSocial} target="_blank" rel="noopener noreferrer">
                      Seg. Social →
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.emergencyBox} role="alert">
                <strong>Si necesitas ayuda urgente:</strong>{' '}
                <span className={styles.emergencyNumber}>024</span> (conducta suicida) ·{' '}
                <span className={styles.emergencyNumber}>112</span> (emergencias)
              </div>

              <p className={styles.recursosNota}>
                {RECURSOS_CUIDADORES.nota}
              </p>
            </div>

            <button className={styles.btnReiniciar} onClick={reiniciar}>
              <span aria-hidden="true">🔄</span> Repetir el test
            </button>
          </section>
        )}

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="📚 Guía sobre la sobrecarga del cuidador"
          subtitle="Información, señales de alerta y estrategias de autocuidado"
        >
          {/* Qué es la Escala Zarit */}
          <section className={styles.guiaSection}>
            <h2>¿Qué es la Escala de Zarit?</h2>
            <p>
              La <strong>Escala de Zarit</strong> (Zarit Burden Interview) es el instrumento más
              utilizado internacionalmente para medir la sobrecarga del cuidador de personas
              dependientes. Fue desarrollada por Steven Zarit en 1980 y validada en español por
              Martín et al. en 1996.
            </p>
            <p>
              Consta de 22 ítems que evalúan las sensaciones subjetivas de sobrecarga del cuidador,
              abarcando aspectos emocionales, físicos, sociales y económicos del cuidado. Cada ítem
              se puntúa de 1 (nunca) a 5 (casi siempre), con una puntuación total entre 22 y 110.
            </p>

            <h2>¿Qué es el burnout del cuidador?</h2>
            <p>
              El <strong>síndrome del cuidador quemado</strong> (o burnout del cuidador) es un
              estado de agotamiento físico, emocional y mental que afecta a personas que asumen el
              cuidado prolongado de un familiar dependiente. Se diferencia del estrés puntual en
              que es crónico y acumulativo.
            </p>
            <p>
              En España, se estima que hay más de 1,5 millones de cuidadores no profesionales,
              mayoritariamente mujeres (83%), con una dedicación media superior a 10 horas diarias.
              La sobrecarga del cuidador es un problema de salud pública reconocido.
            </p>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.comparativaSection}>
            <h2>Niveles de sobrecarga: comparativa</h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaComparativa}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Sin sobrecarga (22-46)</th>
                    <th>Sobrecarga leve (47-55)</th>
                    <th>Sobrecarga intensa (56-110)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Estado emocional</td>
                    <td>Equilibrado</td>
                    <td>Irritabilidad, frustración</td>
                    <td>Agotamiento, desesperanza</td>
                  </tr>
                  <tr>
                    <td>Vida social</td>
                    <td>Mantenida</td>
                    <td>Reducida</td>
                    <td>Aislamiento significativo</td>
                  </tr>
                  <tr>
                    <td>Salud física</td>
                    <td>Sin impacto relevante</td>
                    <td>Cansancio, dolores</td>
                    <td>Enfermedades, insomnio</td>
                  </tr>
                  <tr>
                    <td>Capacidad de cuidado</td>
                    <td>Sostenible</td>
                    <td>En riesgo</td>
                    <td>Comprometida</td>
                  </tr>
                  <tr>
                    <td>Necesidad de ayuda</td>
                    <td>Preventiva</td>
                    <td>Recomendada</td>
                    <td>Urgente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios de cuidadores */}
          <section className={styles.escenariosSection}>
            <h2>Situaciones habituales de cuidadores</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true">👵</span>
                <h3>Cuidador de persona con Alzheimer</h3>
                <p>
                  La pérdida cognitiva progresiva genera una carga emocional intensa. El cuidador
                  debe adaptarse continuamente a nuevas necesidades y gestionar la comunicación
                  con el familiar.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true">🦽</span>
                <h3>Cuidador de persona con discapacidad física</h3>
                <p>
                  La carga física es predominante: transferencias, higiene, movilizaciones.
                  El riesgo de lesiones del cuidador es alto sin formación y ayudas técnicas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true">👨‍👧</span>
                <h3>Hijo/a que cuida a sus padres</h3>
                <p>
                  Compaginar el cuidado con el trabajo y la propia familia genera un triple rol
                  agotador. El sentimiento de culpa es frecuente cuando no se puede llegar a todo.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <span aria-hidden="true">💑</span>
                <h3>Cónyuge cuidador</h3>
                <p>
                  El cambio de roles en la pareja, la pérdida de la relación previa y el aislamiento
                  social hacen de estos cuidadores uno de los perfiles con mayor riesgo de sobrecarga.
                </p>
              </div>
            </div>
          </section>

          {/* Señales de alerta */}
          <section className={styles.guiaSection}>
            <h2>Señales de alerta: cuándo buscar ayuda profesional</h2>
            <ol className={styles.pasosList}>
              <li>
                <strong>Agotamiento persistente</strong> — Cansancio extremo que no mejora con el
                descanso, sensación de estar al límite.
              </li>
              <li>
                <strong>Problemas de sueño</strong> — Insomnio por preocupación, despertares
                nocturnos para atender al familiar.
              </li>
              <li>
                <strong>Aislamiento social</strong> — Dejar de ver a amigos, evitar salir de casa,
                sentirse solo/a.
              </li>
              <li>
                <strong>Irritabilidad o resentimiento</strong> — Enfadarse con el familiar dependiente
                o sentir culpa por ello.
              </li>
              <li>
                <strong>Descuido de la propia salud</strong> — Saltarse citas médicas, mala
                alimentación, no tomar medicación propia.
              </li>
              <li>
                <strong>Pensamientos de desesperanza</strong> — Sentir que la situación no tiene
                salida o que nadie puede ayudar.
              </li>
            </ol>
          </section>

          {/* Guía para obtener ayuda */}
          <section className={styles.guiaSection}>
            <h2>Guía paso a paso: cómo obtener ayuda</h2>
            <ol className={styles.pasosList}>
              <li>
                <strong>Habla con tu médico de cabecera</strong> — Es el primer paso. Puede
                derivarte a salud mental y detectar problemas físicos asociados al cuidado.
              </li>
              <li>
                <strong>Acude a Servicios Sociales municipales</strong> — Son el punto de entrada
                para solicitar la valoración de dependencia (Ley 39/2006).
              </li>
              <li>
                <strong>Solicita la valoración de dependencia</strong> — Si no se ha tramitado,
                permite acceder a prestaciones económicas y servicios del SAAD.
              </li>
              <li>
                <strong>Explora los servicios de respiro</strong> — Centro de día, estancias
                temporales en residencia, ayuda a domicilio (SAD).
              </li>
              <li>
                <strong>Busca grupos de apoyo</strong> — Asociaciones de cuidadores, tanto
                presenciales como online, que comparten experiencias y recursos.
              </li>
              <li>
                <strong>Considera ayuda profesional psicológica</strong> — Un psicólogo puede
                enseñarte estrategias de afrontamiento y gestión emocional.
              </li>
            </ol>
          </section>

          {/* Estrategias de autocuidado */}
          <section className={styles.consejosSection}>
            <h2>Estrategias de autocuidado para cuidadores</h2>
            <div className={styles.consejosGrid}>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">⏰</span>
                <h3>Reserva tiempo propio</h3>
                <p>
                  Dedica al menos 30 minutos al día a una actividad que te guste. No es egoísmo,
                  es necesidad.
                </p>
              </div>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">🤝</span>
                <h3>Pide ayuda a tu entorno</h3>
                <p>
                  Reparte tareas con familiares, vecinos o amigos. No tienes que hacerlo todo solo/a.
                </p>
              </div>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">🏃</span>
                <h3>Cuida tu salud física</h3>
                <p>
                  No descuides tus citas médicas, alimentación y ejercicio. Tu salud es
                  imprescindible para cuidar.
                </p>
              </div>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">🗣️</span>
                <h3>Habla de cómo te sientes</h3>
                <p>
                  Verbalizar el cansancio y la frustración reduce la carga emocional. Busca a
                  alguien de confianza.
                </p>
              </div>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">📋</span>
                <h3>Infórmate de tus derechos</h3>
                <p>
                  Prestaciones del SAAD, reducción de jornada, excedencia por cuidado de familiar.
                  Conocer tus opciones da control.
                </p>
              </div>
              <div className={styles.consejoCard}>
                <span aria-hidden="true">🌿</span>
                <h3>Acepta lo que no puedes cambiar</h3>
                <p>
                  La enfermedad tiene su curso. Aceptar las limitaciones propias y del familiar
                  reduce la culpa y el sufrimiento.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className={styles.faqSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h3>¿La Escala de Zarit es un diagnóstico?</h3>
                <p>
                  No. Es una herramienta de cribado que detecta niveles de sobrecarga. El diagnóstico
                  clínico de un trastorno asociado (ansiedad, depresión) requiere evaluación por un
                  profesional de salud mental.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Puedo solicitar baja laboral por cuidado de familiar?</h3>
                <p>
                  En España existe la excedencia por cuidado de familiar (art. 46.3 ET) de hasta
                  2 años, con reserva de puesto el primer año. También existe la reducción de
                  jornada por cuidado (art. 37.6 ET).
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Qué prestaciones económicas puedo solicitar?</h3>
                <p>
                  A través del SAAD (Sistema de Autonomía y Atención a la Dependencia): prestación
                  económica por cuidados en el entorno familiar, vinculada a servicio o de asistencia
                  personal, según el grado de dependencia reconocido.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿El cuidador no profesional cotiza a la Seguridad Social?</h3>
                <p>
                  Sí. Desde 2023, el Estado cubre el 100% de la cotización mediante convenio especial.
                  El cuidador queda protegido por jubilación, incapacidad temporal y muerte/supervivencia.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Con qué frecuencia debería repetir este test?</h3>
                <p>
                  Se recomienda repetirlo cada 3-6 meses, o cuando se produzcan cambios significativos
                  en la situación de cuidado (empeoramiento del familiar, cambios familiares, etc.).
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3>¿Dónde puedo encontrar grupos de apoyo para cuidadores?</h3>
                <p>
                  A través de los Servicios Sociales municipales, asociaciones de familiares de Alzheimer
                  (CEAFA), asociaciones de cuidadores de la CCAA, y plataformas online como
                  cuidadores.org o la Fundación Cuidar al Cuidador.
                </p>
              </div>
            </div>
          </section>

          {/* warningBox — indicador v2.0 */}
          <div className={styles.warningBox}>
            <strong>⚠️ Mitos sobre el cuidado:</strong> &quot;Un buen cuidador no necesita ayuda&quot;,
            &quot;Pedir ayuda es egoísmo&quot;, &quot;Nadie puede cuidar mejor que yo&quot;. Estos pensamientos
            son frecuentes pero <strong>falsos</strong>. Cuidar de ti mismo/a es la mejor forma de cuidar
            a tu familiar. <strong>Pedir ayuda no es debilidad, es responsabilidad.</strong>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-zarit-cuidador')} />
        <ShareCard appName="test-zarit-cuidador" />
        <Footer appName="test-zarit-cuidador" />
    </div>
  );
}
