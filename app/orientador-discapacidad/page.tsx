'use client';

import { useState } from 'react';
import styles from './OrientadorDiscapacidad.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard, RegionBadge
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ===================================================
// PREGUNTAS FUNCIONALES
// Basadas en los ámbitos del RD 888/2022
// Formuladas en lenguaje accesible (no clínico)
// Objetivo: orientar sobre si VALE LA PENA solicitar
// ===================================================

interface PreguntaFuncional {
  id: string;
  pregunta: string;
  ambito: string;
  opciones: { etiqueta: string; puntos: number }[];
  notaAyuda?: string;
}

const PREGUNTAS: PreguntaFuncional[] = [
  {
    id: 'movilidad',
    ambito: '🚶 Movilidad y desplazamiento',
    pregunta: '¿Tienes dificultades para caminar, desplazarte o subir escaleras?',
    opciones: [
      { etiqueta: 'No, me muevo con normalidad', puntos: 0 },
      { etiqueta: 'Tengo alguna dificultad, pero me las arreglo solo/a', puntos: 1 },
      { etiqueta: 'Necesito ayudas técnicas (bastón, andador, silla de ruedas)', puntos: 2 },
      { etiqueta: 'No puedo desplazarme sin ayuda de otra persona', puntos: 3 },
    ],
  },
  {
    id: 'vision',
    ambito: '👁️ Visión',
    pregunta: '¿Tienes problemas de visión que persisten incluso con gafas o lentillas?',
    opciones: [
      { etiqueta: 'No, veo bien con corrección óptica', puntos: 0 },
      { etiqueta: 'Veo con dificultad pero puedo desenvolverme', puntos: 1 },
      { etiqueta: 'Solo veo bultos, sombras o muy poco', puntos: 2 },
      { etiqueta: 'Ceguera total o prácticamente total', puntos: 3 },
    ],
    notaAyuda: 'Incluso con las mejores gafas o lentillas disponibles.',
  },
  {
    id: 'audicion',
    ambito: '👂 Audición',
    pregunta: '¿Tienes problemas de audición que persisten incluso con audífono?',
    opciones: [
      { etiqueta: 'No, oigo bien', puntos: 0 },
      { etiqueta: 'Tengo dificultad en conversaciones o en ambientes ruidosos', puntos: 1 },
      { etiqueta: 'Solo entiendo con lectura labial o a muy corta distancia', puntos: 2 },
      { etiqueta: 'Sordera total o prácticamente total', puntos: 3 },
    ],
    notaAyuda: 'Si usas audífono, valora tu situación con el audífono puesto.',
  },
  {
    id: 'comunicacion',
    ambito: '🗣️ Comunicación y habla',
    pregunta: '¿Tienes dificultades para comunicarte verbalmente o hacerte entender?',
    opciones: [
      { etiqueta: 'No, me comunico con normalidad', puntos: 0 },
      { etiqueta: 'Tengo alguna dificultad pero me entiendo con la gente', puntos: 1 },
      { etiqueta: 'Dificultad importante: me cuesta mucho que me entiendan', puntos: 2 },
      { etiqueta: 'No puedo comunicarme verbalmente', puntos: 3 },
    ],
  },
  {
    id: 'cognicion',
    ambito: '🧠 Capacidad cognitiva y aprendizaje',
    pregunta: '¿Tienes dificultades importantes para concentrarte, recordar cosas o aprender?',
    opciones: [
      { etiqueta: 'No, funciono con normalidad', puntos: 0 },
      { etiqueta: 'Tengo algunas dificultades pero llevo una vida autónoma', puntos: 1 },
      { etiqueta: 'Afecta significativamente a mi trabajo, estudio o vida diaria', puntos: 2 },
      { etiqueta: 'Necesito supervisión o ayuda constante para tomar decisiones', puntos: 3 },
    ],
    notaAyuda: 'Incluye condiciones como daño cerebral adquirido, deterioro cognitivo, trastornos del neurodesarrollo (autismo, TDAH severo) o dificultades de aprendizaje graves.',
  },
  {
    id: 'saludmental',
    ambito: '💙 Salud mental y conducta',
    pregunta: '¿Padeces una condición de salud mental que afecta a tu vida diaria?',
    opciones: [
      { etiqueta: 'No, no tengo condición de salud mental diagnosticada', puntos: 0 },
      { etiqueta: 'Sí, pero está controlada y llevo una vida normal', puntos: 1 },
      { etiqueta: 'Sí, y limita significativamente mis relaciones o actividades', puntos: 2 },
      { etiqueta: 'Sí, y necesito apoyo continuo o tengo reconocida incapacidad laboral permanente', puntos: 3 },
    ],
    notaAyuda: 'Por ejemplo: trastorno bipolar, esquizofrenia, depresión mayor crónica, trastornos de ansiedad graves, TOC, TEPT, etc.',
  },
  {
    id: 'enfermedad',
    ambito: '🏥 Enfermedad crónica grave',
    pregunta: '¿Padeces una enfermedad crónica grave reconocida médicamente?',
    opciones: [
      { etiqueta: 'No', puntos: 0 },
      { etiqueta: 'Sí, pero está controlada con tratamiento y no limita mi día a día', puntos: 1 },
      { etiqueta: 'Sí, y limita de forma moderada mis actividades habituales', puntos: 2 },
      { etiqueta: 'Sí, y limita gravemente mi capacidad funcional o me incapacita', puntos: 3 },
    ],
    notaAyuda: 'Por ejemplo: insuficiencia renal, cardiaca o respiratoria, cáncer activo, enfermedad neurodegenerativa, VIH avanzado, diabetes con complicaciones graves, etc.',
  },
  {
    id: 'avd',
    ambito: '🛁 Actividades básicas del día a día',
    pregunta: '¿Necesitas ayuda de otra persona para actividades básicas como vestirte, asearte o comer?',
    opciones: [
      { etiqueta: 'No, soy totalmente autónomo/a', puntos: 0 },
      { etiqueta: 'Necesito ayuda puntual o supervisión', puntos: 1 },
      { etiqueta: 'Necesito ayuda con frecuencia para varias actividades', puntos: 2 },
      { etiqueta: 'Dependo de otra persona para casi todas las actividades básicas', puntos: 3 },
    ],
  },
  {
    id: 'laboral',
    ambito: '💼 Impacto laboral',
    pregunta: '¿Tu condición de salud dificulta significativamente tu acceso o permanencia en el mercado laboral?',
    opciones: [
      { etiqueta: 'No, trabajo o podría trabajar sin limitaciones especiales', puntos: 0 },
      { etiqueta: 'Tengo algunas limitaciones pero puedo trabajar en la mayoría de puestos', puntos: 1 },
      { etiqueta: 'Solo puedo trabajar en puestos adaptados o con condiciones especiales', puntos: 2 },
      { etiqueta: 'No puedo trabajar o tengo reconocida incapacidad laboral permanente', puntos: 3 },
    ],
  },
  {
    id: 'reconocimiento',
    ambito: '📄 Situación administrativa actual',
    pregunta: '¿Tienes actualmente algún reconocimiento oficial de tu situación?',
    opciones: [
      { etiqueta: 'No tengo ningún reconocimiento', puntos: 0 },
      { etiqueta: 'Tengo informes médicos que acreditan mi condición, pero no reconocimiento oficial', puntos: 1 },
      { etiqueta: 'Tengo incapacidad laboral temporal larga o baja crónica', puntos: 2 },
      { etiqueta: 'Tengo reconocida incapacidad permanente total, absoluta o gran invalidez', puntos: 3 },
    ],
    notaAyuda: 'Tener incapacidad laboral reconocida no equivale automáticamente a tener reconocido el grado de discapacidad, pero facilita el proceso.',
  },
];

// ===================================================
// LÓGICA DE RESULTADOS
// ===================================================

interface Resultado {
  titulo: string;
  subtitulo: string;
  descripcion: string;
  recomendacion: string;
  colorClase: string;
  icono: string;
  umbrales: string[];
  movilidadReducida: boolean;
}

function calcularResultado(respuestas: Record<string, number>, movilidadReducida: boolean): Resultado {
  const total = Object.values(respuestas).reduce((sum, v) => sum + v, 0);
  const maxPuntos = PREGUNTAS.length * 3; // 30 puntos

  if (total <= 4) {
    return {
      titulo: 'Sin indicadores claros en este momento',
      subtitulo: 'No parece prioritario solicitar la valoración ahora',
      descripcion:
        'Según tus respuestas, las limitaciones funcionales que describes no alcanzan los umbrales orientativos que normalmente llevan al reconocimiento de un grado de discapacidad.',
      recomendacion:
        'Si tu situación cambia o empeora, puedes volver a hacer este test. Guarda los informes médicos que ya tengas: son importantes si en el futuro decides solicitarlo.',
      colorClase: styles.resultadoNeutro,
      icono: '⚪',
      umbrales: [],
      movilidadReducida,
    };
  } else if (total <= 10) {
    return {
      titulo: 'Podría justificar la solicitud',
      subtitulo: 'Vale la pena informarse y consultar con un profesional',
      descripcion:
        'Tu perfil funcional presenta algunas limitaciones que podrían justificar iniciar el proceso de valoración oficial. El resultado real depende de un examen presencial por parte del equipo técnico de tu Comunidad Autónoma.',
      recomendacion:
        'Reúne tus informes médicos actualizados y consulta con tu médico de cabecera o un trabajador/a social de tu municipio. Ellos pueden orientarte sobre si merece la pena presentar la solicitud.',
      colorClase: styles.resultadoModerado,
      icono: '🟡',
      umbrales: ['Posible reconocimiento del 33%'],
      movilidadReducida,
    };
  } else if (total <= 20) {
    return {
      titulo: 'Perfil compatible con reconocimiento — Solicita la valoración',
      subtitulo: 'Tu situación funcional justifica claramente solicitarlo',
      descripcion:
        'Las limitaciones que describes sugieren que es probable que superes el umbral del 33% de discapacidad y posiblemente el 65%. Solicitar la valoración oficial tiene mucho sentido en tu caso.',
      recomendacion:
        'Presenta la solicitud en el organismo competente de tu Comunidad Autónoma (normalmente el IMSERSO autonómico o la Consejería de Servicios Sociales). Lleva todos tus informes médicos actualizados. Si tienes dificultades para gestionar el trámite, un trabajador/a social puede ayudarte.',
      colorClase: styles.resultadoImportante,
      icono: '🟠',
      umbrales: ['Probable 33%', 'Posible 65%'],
      movilidadReducida,
    };
  } else {
    return {
      titulo: 'Solicita la valoración sin demora',
      subtitulo: 'Tu perfil indica limitaciones funcionales muy significativas',
      descripcion:
        'Según tus respuestas, tienes limitaciones funcionales muy importantes en múltiples áreas. Es muy probable que superes el 33% y el 65%, y dependiendo de tu situación, podrías tener derecho al complemento de asistencia de tercera persona (75%+).',
      recomendacion:
        'Solicita la valoración con urgencia. Acude a Servicios Sociales de tu municipio o al IMSERSO autonómico. Si tienes dificultades para gestionar el trámite tú mismo/a, pide ayuda a un trabajador/a social o a una asociación especializada en tu tipo de discapacidad.',
      colorClase: styles.resultadoAlto,
      icono: '🔴',
      umbrales: ['Muy probable 33%', 'Muy probable 65%', 'Posible 75%+ con asistencia de terceros'],
      movilidadReducida,
    };
  }

  // Esta línea no se alcanza, pero TypeScript la necesita
  return {
    titulo: '', subtitulo: '', descripcion: '', recomendacion: '',
    colorClase: '', icono: '', umbrales: [], movilidadReducida: false,
  };
}

// ===================================================
// COMPONENTE PRINCIPAL
// ===================================================

export default function OrientadorDiscapacidadPage() {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [movilidadReducida, setMovilidadReducida] = useState<boolean | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const respondidas = Object.keys(respuestas).length;
  const totalPreguntas = PREGUNTAS.length;
  const movilidadRespondida = movilidadReducida !== null;
  const todoRespondido = respondidas === totalPreguntas && movilidadRespondida;
  const progreso = Math.round(((respondidas + (movilidadRespondida ? 1 : 0)) / (totalPreguntas + 1)) * 100);

  const handleRespuesta = (id: string, puntos: number) => {
    setRespuestas(prev => ({ ...prev, [id]: puntos }));
  };

  const calcular = () => {
    if (!todoRespondido) return;
    const res = calcularResultado(respuestas, movilidadReducida ?? false);
    setResultado(res);
    setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMovilidadReducida(null);
    setResultado(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">♿</span> Orientador Grado de Discapacidad</h1>
        <p className={styles.heroSubtitle}>
          ¿Vale la pena solicitar el reconocimiento? · Test orientativo · RD 888/2022
        </p>
      </header>

      <RegionBadge variant="es-only" />


      {/* DISCLAIMER MÉDICO — SIEMPRE VISIBLE */}
      <DisclaimerCard variant="medical" severity="critical" />

      <LegalNotice />

      {/* INTRODUCCIÓN */}
      <div className={styles.introBox}>
        <h2>¿Para qué sirve este orientador?</h2>
        <p>
          En España, el <strong>reconocimiento del grado de discapacidad</strong> da acceso a beneficios
          laborales, fiscales, sociales y sanitarios. Sin embargo, muchas personas no saben si su situación
          justifica solicitarlo.
        </p>
        <p>
          Este test te ayuda a evaluar <strong>si vale la pena iniciar el trámite oficial</strong>, basándose
          en el impacto funcional de tu condición en tu vida diaria. No te dirá el porcentaje exacto que
          obtendrías: eso solo puede determinarlo el equipo técnico de tu Comunidad Autónoma en una
          valoración presencial.
        </p>
        <div className={styles.umbralInfo}>
          <strong>Umbrales clave</strong>
          <span className={styles.umbralChip}>33% — Acceso a la mayoría de beneficios</span>
          <span className={styles.umbralChip}>65% — Beneficios adicionales</span>
          <span className={styles.umbralChip}>75% + 3ª persona — Complemento asistencia</span>
        </div>
      </div>

      {/* FORMULARIO */}
      {!resultado && (
        <section className={styles.formulario}>
          <div className={styles.progresoWrapper}>
            <div className={styles.progresoInfo}>
              <span>{respondidas + (movilidadRespondida ? 1 : 0)} de {totalPreguntas + 1} respondidas</span>
              <span>{progreso}%</span>
            </div>
            <div
              className={styles.barraProgreso}
              role="progressbar"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.barraRelleno} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          {PREGUNTAS.map((p, idx) => (
            <div key={p.id} className={styles.tarjetaPregunta}>
              <div className={styles.ambitoLabel}>{p.ambito}</div>
              <p className={styles.textoPregunta}>
                <span className={styles.numPregunta}>{idx + 1}.</span> {p.pregunta}
              </p>
              {p.notaAyuda && (
                <p className={styles.notaAyuda}><span aria-hidden="true">💡</span> {p.notaAyuda}</p>
              )}
              <div className={styles.opcionesLista}>
                {p.opciones.map(op => (
                  <button
                    key={op.puntos}
                    type="button"
                    className={[
                      styles.opcionBtn,
                      respuestas[p.id] === op.puntos ? styles.opcionSeleccionada : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleRespuesta(p.id, op.puntos)}
                    aria-pressed={respuestas[p.id] === op.puntos}
                  >
                    <span className={styles.opcionRadio} aria-hidden="true">
                      {respuestas[p.id] === op.puntos ? '●' : '○'}
                    </span>
                    {op.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* PREGUNTA ADICIONAL: MOVILIDAD REDUCIDA */}
          <div className={styles.tarjetaPregunta}>
            <div className={styles.ambitoLabel}><span aria-hidden="true">🅿️</span> Tarjeta de estacionamiento para personas con discapacidad</div>
            <p className={styles.textoPregunta}>
              <span className={styles.numPregunta}>{PREGUNTAS.length + 1}.</span>{' '}
              ¿Tienes dificultades graves para caminar o desplazarte a pie que podrían justificar
              una tarjeta de estacionamiento para personas con movilidad reducida?
            </p>
            <p className={styles.notaAyuda}>
              <span aria-hidden="true">💡</span> Este beneficio tiene criterios propios: requiere que la limitación de movilidad sea
              permanente y significativa, independientemente del grado de discapacidad reconocido.
            </p>
            <div className={styles.opcionesLista}>
              {[
                { etiqueta: 'No, me desplazo a pie sin grandes dificultades', valor: false },
                { etiqueta: 'Sí, tengo dificultades graves para caminar o desplazarme', valor: true },
              ].map(op => (
                <button
                  key={String(op.valor)}
                  type="button"
                  className={[
                    styles.opcionBtn,
                    movilidadReducida === op.valor ? styles.opcionSeleccionada : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setMovilidadReducida(op.valor)}
                  aria-pressed={movilidadReducida === op.valor}
                >
                  <span className={styles.opcionRadio} aria-hidden="true">
                    {movilidadReducida === op.valor ? '●' : '○'}
                  </span>
                  {op.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.accionWrapper}>
            <button
              type="button"
              className={styles.btnCalcular}
              onClick={calcular}
              disabled={!todoRespondido}
            >
              {!todoRespondido
                ? `Responde ${totalPreguntas + 1 - respondidas - (movilidadRespondida ? 1 : 0)} pregunta${totalPreguntas + 1 - respondidas - (movilidadRespondida ? 1 : 0) !== 1 ? 's' : ''} más`
                : 'Ver orientación →'}
            </button>
          </div>
        </section>
      )}

      {/* RESULTADO */}
      {resultado && (
        <section id="resultado" className={[styles.resultadoSection, resultado.colorClase].join(' ')}>
          <div className={styles.resultadoHeader}>
            <span className={styles.resultadoIcono} aria-hidden="true">{resultado.icono}</span>
            <div>
              <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
              <p className={styles.resultadoSubtitulo}>{resultado.subtitulo}</p>
            </div>
          </div>

          {resultado.umbrales.length > 0 && (
            <div className={styles.umbralesWrapper}>
              {resultado.umbrales.map(u => (
                <span key={u} className={styles.umbralTag}>{u}</span>
              ))}
            </div>
          )}

          <p className={styles.resultadoDescripcion}>{resultado.descripcion}</p>

          <div className={styles.recomendacionBox}>
            <strong>¿Qué hacer ahora?</strong>
            <p>{resultado.recomendacion}</p>
          </div>

          {resultado.movilidadReducida && (
            <div className={styles.movilidadBox}>
              <strong><span aria-hidden="true">🅿️</span> Tarjeta de estacionamiento</strong>
              <p>
                Has indicado que tienes dificultades graves para desplazarte. Puedes solicitar la{' '}
                <strong>tarjeta de estacionamiento para personas con movilidad reducida</strong> en el
                Ayuntamiento de tu municipio. Los criterios son independientes del grado de discapacidad
                reconocido.
              </p>
            </div>
          )}

          <div className={styles.resultadoAviso}>
            <strong><span aria-hidden="true">⚠️</span> Recuerda:</strong> Este resultado es <strong>exclusivamente orientativo</strong>.
            El porcentaje real solo puede determinarlo el equipo técnico de tu Comunidad Autónoma en una
            valoración presencial. Las prestaciones y beneficios concretos varían según cada CCAA.
          </div>

          <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
            <span aria-hidden="true">🔄</span> Repetir el test
          </button>
        </section>
      )}

      {/* SECCIÓN EDUCATIVA V2.0 */}
      <EducationalSection
        title="📚 ¿Qué es el grado de discapacidad?"
        subtitle="Entiende el sistema de reconocimiento en España"
      >
        {/* EXPLICACIÓN GENERAL */}
        <section className={styles.guiaSection}>
          <h2>El sistema de reconocimiento de discapacidad en España</h2>
          <p>
            El <strong>reconocimiento oficial del grado de discapacidad</strong> en España es un acto
            administrativo mediante el que el Estado certifica que una persona tiene una discapacidad que
            le genera limitaciones funcionales relevantes. Está regulado por el{' '}
            <strong>Real Decreto 888/2022</strong>, que actualizó los criterios técnicos y los baremos de
            valoración anteriores.
          </p>
          <p>
            El reconocimiento no es automático: requiere presentar una solicitud, aportar informes
            médicos y pasar una <strong>valoración presencial</strong> realizada por equipos multiprofesionales
            de cada Comunidad Autónoma. El resultado es un certificado oficial que acredita el porcentaje
            de discapacidad reconocido.
          </p>
          <p>
            <strong>Importante:</strong> el sistema de discapacidad y el de dependencia (LAPAD/BVD) son
            independientes. Una persona puede tener reconocidos ambos, uno solo, o ninguno.
          </p>
        </section>

        {/* TABLA COMPARATIVA */}
        <section className={styles.comparativaSection}>
          <h2>Umbrales del grado de discapacidad y qué dan acceso</h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Umbral</th>
                  <th>Denominación</th>
                  <th>Principales beneficios (orientativos)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>≥ 33%</strong></td>
                  <td>Reconocimiento administrativo de discapacidad</td>
                  <td>Cuota de reserva laboral, adaptación de puesto, deducciones IRPF, acceso a centros especiales de empleo, pensión no contributiva (si se cumplen ingresos), descuentos transporte, etc.</td>
                </tr>
                <tr>
                  <td><strong>≥ 65%</strong></td>
                  <td>Discapacidad grave</td>
                  <td>Mayores deducciones fiscales, acceso a pensiones no contributivas con cuantías superiores, prestaciones adicionales según CCAA</td>
                </tr>
                <tr>
                  <td><strong>≥ 75% + 3ª persona</strong></td>
                  <td>Gran discapacidad</td>
                  <td>Complemento de asistencia de tercera persona en la pensión no contributiva, ayudas adicionales de dependencia, cuidados especializados</td>
                </tr>
                <tr>
                  <td><strong>Movilidad reducida</strong></td>
                  <td>Complemento de movilidad</td>
                  <td>Tarjeta de estacionamiento, beneficios de movilidad. No requiere un % mínimo específico; se valora la limitación de desplazamiento</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.tablaNota}>
            * Los beneficios concretos varían significativamente entre Comunidades Autónomas.
            Consulta siempre con los Servicios Sociales de tu CCAA.
          </p>
        </section>

        {/* 4 ESCENARIOS */}
        <section className={styles.escenariosSection}>
          <h2>¿Quién suele solicitarlo?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🦽</span>
              <h3>Discapacidad física o motora</h3>
              <p>
                Personas con limitaciones de movilidad, amputaciones, parálisis, enfermedades
                neuromusculares o traumatismos que afectan a la capacidad funcional.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">🧠</span>
              <h3>Discapacidad intelectual o cognitiva</h3>
              <p>
                Personas con síndrome de Down, daño cerebral adquirido, discapacidad intelectual de
                cualquier grado, o deterioro cognitivo moderado/severo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">👁️</span>
              <h3>Discapacidad sensorial</h3>
              <p>
                Personas con pérdida de visión o audición significativa, incluso con las mejores
                ayudas técnicas disponibles (gafas, audífonos, implantes cocleares).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <span aria-hidden="true">💙</span>
              <h3>Enfermedad mental o crónica grave</h3>
              <p>
                Personas con enfermedades crónicas severas (cardíacas, respiratorias, renales,
                oncológicas) o trastornos de salud mental graves que limitan su funcionamiento.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Dónde se solicita el reconocimiento?</h3>
              <p>
                En el organismo competente de tu Comunidad Autónoma: generalmente la Consejería de
                Servicios Sociales, el IMSERSO autonómico, o el Centro de Atención a Personas con
                Discapacidad (CAPD). En Ceuta y Melilla lo gestiona el IMSERSO central. Muchas CCAA
                permiten iniciar el trámite online o a través de los Servicios Sociales municipales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué documentación necesito?</h3>
              <p>
                Generalmente: DNI o NIE, informe médico actualizado (de hace menos de 1 año) del
                médico especialista correspondiente, y en algunos casos informe del médico de cabecera.
                Cada CCAA puede requerir documentación adicional. Cuanto más detallados sean los
                informes sobre el impacto funcional de tu condición, mejor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿En qué consiste la valoración presencial?</h3>
              <p>
                Un equipo multiprofesional (médico/a, psicólogo/a y trabajador/a social) te citará
                para una valoración. Evalúan el impacto funcional de tu condición en diferentes áreas
                de vida según las tablas del RD 888/2022. No es un examen médico sino una evaluación
                del impacto en tu funcionamiento diario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tarda el proceso?</h3>
              <p>
                Varía mucho según la CCAA y la demanda. Puede oscilar entre 3 y 12 meses, aunque hay
                casos que se prolongan más. El plazo máximo legal es de 3 meses desde la solicitud,
                pero en la práctica se supera frecuentemente. Solicítalo cuanto antes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Se puede recurrir si no estoy de acuerdo con el resultado?</h3>
              <p>
                Sí. Primero puedes solicitar una revisión ante el mismo organismo que dictó la resolución.
                Si no estás de acuerdo, puedes interponer un recurso de alzada o acudir a la vía
                judicial contencioso-administrativa. Es recomendable contar con asesoría jurídica
                o apoyo de una asociación especializada.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El reconocimiento tiene caducidad?</h3>
              <p>
                Puede ser temporal o definitivo. Si es temporal, hay que renovarlo en el plazo indicado.
                Si la condición es permanente e irreversible, suele concederse con carácter definitivo.
                En cualquier caso, puedes solicitar revisión si tu situación empeora.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Los beneficios son iguales en todas las Comunidades Autónomas?</h3>
              <p>
                No. El <strong>reconocimiento del grado</strong> es nacional y uniforme (mismos baremos en
                todas las CCAA). Pero los <strong>beneficios y prestaciones</strong> que ofrece cada CCAA
                pueden variar considerablemente. Consulta siempre con los Servicios Sociales de tu comunidad
                qué recursos específicos están disponibles en tu caso.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Discapacidad y dependencia son lo mismo?</h3>
              <p>
                No. Son sistemas independientes con trámites, organismos y criterios distintos. Una persona
                puede tener reconocido el grado de discapacidad sin tener grado de dependencia, y viceversa.
                Muchas personas con necesidades importantes de apoyo se benefician de solicitar ambos.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guiaSection}>
          <h2>Cómo iniciar el proceso: paso a paso</h2>
          <ol className={styles.pasosList}>
            <li>
              <strong>Reúne la documentación médica actualizada.</strong> Solicita a tus especialistas
              informes que describan tu diagnóstico, tratamiento y, sobre todo, el{' '}
              <strong>impacto funcional</strong> en tu vida diaria. Cuanto más detallados, mejor.
            </li>
            <li>
              <strong>Localiza el organismo competente de tu CCAA.</strong> Busca "reconocimiento
              discapacidad + nombre de tu comunidad autónoma". Muchas CCAA tienen cita previa online.
            </li>
            <li>
              <strong>Presenta la solicitud.</strong> Lleva el formulario oficial cumplimentado,
              tu documentación médica, DNI/NIE y las tasas si las hubiera (muchas CCAA son gratuitas).
            </li>
            <li>
              <strong>Acude a la valoración presencial.</strong> El equipo multiprofesional te citará.
              Describe con detalle cómo te afecta tu condición en el día a día, sin minimizar.
            </li>
            <li>
              <strong>Recibe la resolución.</strong> Recibirás la resolución con el porcentaje reconocido
              y, en su caso, los complementos (tercera persona, movilidad reducida).
            </li>
            <li>
              <strong>Infórmate de los beneficios disponibles.</strong> Contacta con los Servicios Sociales
              de tu CCAA o municipio para conocer qué prestaciones, ayudas y beneficios concretos tienes
              disponibles con tu grado reconocido.
            </li>
          </ol>
        </section>

        {/* CONSEJOS */}
        <section className={styles.consejosSection}>
          <h2><span aria-hidden="true">💡</span> Consejos para el proceso</h2>
          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">📋</span>
              <h3>No minimices tu situación</h3>
              <p>En la valoración, describe tu peor día habitual, no el mejor. El equipo evalúa el impacto real en tu funcionamiento.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🩺</span>
              <h3>Informes detallados y recientes</h3>
              <p>Los informes médicos son clave. Pide a tu especialista que incluya cómo afecta tu condición a las actividades de la vida diaria.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🤝</span>
              <h3>Apóyate en un trabajador/a social</h3>
              <p>Los Servicios Sociales municipales pueden orientarte gratuitamente y ayudarte con los trámites si tienes dificultades.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">⏰</span>
              <h3>Solicítalo cuanto antes</h3>
              <p>Los efectos económicos del reconocimiento no son retroactivos: se calculan desde la fecha de solicitud, no desde el inicio de la condición.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">⚖️</span>
              <h3>Recurre si no estás de acuerdo</h3>
              <p>Si el resultado te parece incorrecto, tienes derecho a recurrir. Las asociaciones de afectados suelen tener asesoría jurídica.</p>
            </div>
            <div className={styles.consejoCard}>
              <span aria-hidden="true">🔄</span>
              <h3>Revísalo si empeoras</h3>
              <p>Si tu situación funcional se deteriora significativamente, puedes solicitar una revisión del grado en cualquier momento.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX — indicador v2.0 */}
        <div className={styles.warningBox}>
          <strong><span aria-hidden="true">⚠️</span> Importante:</strong> Este orientador es una herramienta de autoevaluación
          funcional. <strong>No es un instrumento diagnóstico ni una valoración oficial.</strong>{' '}
          El grado de discapacidad solo puede reconocerlo el equipo técnico de tu Comunidad Autónoma
          en una valoración presencial. Las prestaciones y beneficios varían según cada CCAA.{' '}
          <strong>meskeIA no asume responsabilidad por decisiones tomadas en base a este test.</strong>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-discapacidad')} />
      <ShareCard appName="orientador-discapacidad" />
      <Footer appName="orientador-discapacidad" />
    </div>
  );
}
