'use client';

import { useState } from 'react';
import styles from './OrientadorGradoDependencia.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos ────────────────────────────────────────────────────────────────────

// Cuestionario orientativo basado en las actividades del BVD (Baremo de Valoración de la Dependencia)
// Real Decreto 174/2011, Ley 39/2006 LAPAD
// ATENCIÓN: Este orientador NO sustituye la valoración oficial del IMSERSO/CCAA

interface PreguntaBVD {
  id: string;
  area: string;
  texto: string;
  puntos: number; // Peso orientativo en la estimación
}

const PREGUNTAS_BVD: PreguntaBVD[] = [
  // Comer y beber
  { id: 'comer1', area: 'Alimentación', texto: 'Necesita que otra persona le prepare o le corte los alimentos antes de comer', puntos: 2 },
  { id: 'comer2', area: 'Alimentación', texto: 'Necesita ayuda física directa para llevarse la comida a la boca o beber', puntos: 4 },
  // Higiene personal
  { id: 'aseo1', area: 'Higiene personal', texto: 'Necesita supervisión o indicaciones para ducharse o bañarse de forma segura', puntos: 2 },
  { id: 'aseo2', area: 'Higiene personal', texto: 'Necesita ayuda física parcial o total para el aseo (ducha, lavarse, afeitarse)', puntos: 4 },
  // Vestirse
  { id: 'vestir1', area: 'Vestido', texto: 'Necesita supervisión o ayuda parcial para elegir y ponerse la ropa', puntos: 2 },
  { id: 'vestir2', area: 'Vestido', texto: 'Necesita ayuda física total o casi total para vestirse y desvestirse', puntos: 4 },
  // Movilidad
  { id: 'movil1', area: 'Movilidad', texto: 'Puede caminar pero necesita supervisión o ayuda técnica (bastón, andador) para hacerlo con seguridad', puntos: 2 },
  { id: 'movil2', area: 'Movilidad', texto: 'No puede caminar de forma funcional; usa silla de ruedas o necesita ayuda física para desplazarse', puntos: 5 },
  // Transferencias
  { id: 'transfer1', area: 'Transferencias', texto: 'Necesita ayuda o supervisión para levantarse de la cama, la silla o el váter', puntos: 3 },
  // Continencia
  { id: 'contin1', area: 'Continencia', texto: 'Presenta incontinencia urinaria o fecal ocasional que requiere supervisión o adaptación', puntos: 2 },
  { id: 'contin2', area: 'Continencia', texto: 'Presenta incontinencia habitual que requiere ayuda para el cambio de absorbentes o cuidado', puntos: 4 },
  // Cognición y orientación
  { id: 'cogn1', area: 'Cognición', texto: 'Tiene dificultades ocasionales de orientación (tiempo, lugar) o necesita recordatorios frecuentes', puntos: 2 },
  { id: 'cogn2', area: 'Cognición', texto: 'Presenta desorientación habitual o no reconoce personas del entorno cercano', puntos: 5 },
  // Supervisión nocturna
  { id: 'noche1', area: 'Supervisión', texto: 'Requiere supervisión o atención durante la noche (al menos una vez por noche de media)', puntos: 4 },
  // Toma de medicación
  { id: 'medic1', area: 'Medicación', texto: 'Necesita que otra persona le prepare y/o administre la medicación', puntos: 2 },
  // Tareas del hogar
  { id: 'hogar1', area: 'Hogar', texto: 'No puede realizar tareas básicas del hogar (cocinar, limpiar, comprar) y necesita que otro las haga', puntos: 2 },
];

type GradoEstimado = 'autonomo' | 'grado1' | 'grado2' | 'grado3';

interface Resultado {
  puntuacion: number;
  grado: GradoEstimado;
  titulo: string;
  icono: string;
  color: string;
  descripcion: string;
  prestaciones: string[];
  pasosAdicionales: { icono: string; texto: string }[];
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function estimarGrado(marcados: Set<string>): Resultado {
  const puntuacion = PREGUNTAS_BVD
    .filter(p => marcados.has(p.id))
    .reduce((s, p) => s + p.puntos, 0);

  let grado: GradoEstimado;
  let titulo: string;
  let icono: string;
  let color: string;
  let descripcion: string;
  let prestaciones: string[];
  let pasosAdicionales: { icono: string; texto: string }[];

  if (puntuacion <= 4) {
    grado = 'autonomo';
    icono = '🟢';
    color = 'verde';
    titulo = 'Probable situación de autonomía';
    descripcion = 'Las necesidades de ayuda descritas son limitadas. Según el baremo BVD, no alcanzarían el umbral para un grado de dependencia reconocido. Esto no impide solicitar la valoración si la situación empeora.';
    prestaciones = [];
    pasosAdicionales = [
      { icono: '🔁', texto: 'Si la situación cambia o empeora, vuelve a completar este orientador y valora solicitar la valoración oficial.' },
      { icono: '🏥', texto: 'Consulta con el médico de cabecera si hay un deterioro reciente: puede orientar sobre recursos de apoyo previos a la dependencia.' },
      { icono: '👥', texto: 'Los Servicios Sociales municipales ofrecen ayudas y recursos aunque no haya grado de dependencia reconocido.' },
    ];
  } else if (puntuacion <= 12) {
    grado = 'grado1';
    icono = '🟡';
    color = 'amarillo';
    titulo = 'Posible Grado I — Dependencia Moderada';
    descripcion = 'La persona necesita ayuda para realizar varias actividades básicas de la vida diaria al menos una vez al día, o tiene necesidades de apoyo intermitente. Corresponde orientativamente al Grado I del BVD.';
    prestaciones = [
      'Servicio de Ayuda a Domicilio (SAD) público: horas de ayuda en el hogar',
      'Teleasistencia básica: dispositivo de alarma 24h',
      'Prestación económica vinculada a servicio (PEVS): para contratar servicios privados',
      'Acceso preferente a centros de día con plaza concertada',
    ];
    pasosAdicionales = [
      { icono: '📋', texto: 'Solicita la valoración oficial en los Servicios Sociales de tu ayuntamiento o comunidad autónoma. Lleva el informe médico actualizado.' },
      { icono: '⏳', texto: 'El plazo legal de resolución es de 6 meses. En la práctica varía por CCAA (3-18 meses). Solicítalo cuanto antes.' },
      { icono: '📁', texto: 'Documentos necesarios: DNI, informe médico, informe social (si hay), certificado de empadronamiento.' },
      { icono: '💡', texto: 'El SAD público tiene copago según renta. Consulta con Servicios Sociales el coste estimado en tu caso.' },
    ];
  } else if (puntuacion <= 22) {
    grado = 'grado2';
    icono = '🟠';
    color = 'naranja';
    titulo = 'Posible Grado II — Dependencia Severa';
    descripcion = 'La persona necesita ayuda para realizar varias actividades básicas dos o tres veces al día y no requiere presencia permanente del cuidador. Corresponde orientativamente al Grado II del BVD.';
    prestaciones = [
      'Servicio de Ayuda a Domicilio (SAD) ampliado: más horas diarias',
      'Centro de día: atención diurna especializada',
      'Prestación económica para cuidados en el entorno familiar (PECEF): pago al familiar cuidador',
      'Prestación económica vinculada a servicio (PEVS): para contratar ayuda profesional',
      'Plazas residenciales concertadas con prioridad',
    ];
    pasosAdicionales = [
      { icono: '📋', texto: 'Solicita la valoración oficial de urgencia: con Grado II el acceso a prestaciones es significativo.' },
      { icono: '💰', texto: 'La PECEF (pago al cuidador familiar) puede ser una opción si un familiar deja de trabajar para cuidar. Infórmate sobre el alta en la Seguridad Social del cuidador.' },
      { icono: '🏠', texto: 'Si el cuidado en casa no es viable, los centros de día o residencias concertadas pueden cubrir las necesidades con menor coste familiar.' },
      { icono: '🩺', texto: 'Solicita también una valoración del médico de cabecera para el informe de salud que acompaña a la solicitud BVD.' },
    ];
  } else {
    grado = 'grado3';
    icono = '🔴';
    color = 'rojo';
    titulo = 'Posible Grado III — Gran Dependencia';
    descripcion = 'La persona necesita ayuda para realizar varias actividades básicas varias veces al día y requiere presencia y/o supervisión continua de otra persona. Es el grado máximo del BVD.';
    prestaciones = [
      'Prestación económica para cuidados en el entorno familiar (PECEF): importe máximo del sistema',
      'Servicio de Atención Residencial: plaza residencial concertada con máxima prioridad',
      'Servicio de Ayuda a Domicilio intensivo o asistente personal',
      'Centro de día especializado (demencias, daño cerebral adquirido, etc.)',
      'Prestación económica de asistencia personal (personas activas)',
    ];
    pasosAdicionales = [
      { icono: '🚨', texto: 'Solicita la valoración con carácter de urgencia. Con Grado III el sistema tiene la obligación de ofrecer una prestación o servicio en plazo reducido.' },
      { icono: '💊', texto: 'Coordina con el médico y, si hay demencia u otras patologías, con el especialista (neurólogo, geriatra) para el informe clínico.' },
      { icono: '👨‍👩‍👧', texto: 'La carga del cuidador familiar es muy alta en Grado III. Infórmate sobre respiro familiar, grupos de apoyo y gestión de la prestación.' },
      { icono: '⚖️', texto: 'Si la persona tiene deterioro cognitivo, considera iniciar los trámites de curatela o poder notarial preventivo para gestionar sus asuntos.' },
    ];
  }

  return { puntuacion, grado, titulo, icono, color, descripcion, prestaciones, pasosAdicionales };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorGradoDependencia() {
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function toggleItem(id: string) {
    setMarcados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResultado(null);
  }

  function evaluar() {
    setResultado(estimarGrado(marcados));
  }

  // Agrupar preguntas por área para mostrarlas organizadas
  const areas = [...new Set(PREGUNTAS_BVD.map(p => p.area))];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📋</span>
        <h1 className={styles.title}>Orientador Grado de Dependencia</h1>
        <p className={styles.subtitle}>Baremo BVD orientativo · Ley 39/2006 LAPAD · Prestaciones del SAAD</p>
      </header>

      <DisclaimerCard variant="general"
        severity="critical">
        <span>
          Este orientador es <strong>SOLO indicativo</strong> basado en las actividades evaluadas por el Baremo de Valoración de la Dependencia (BVD, RD 174/2011).
          <br /><strong>El grado oficial</strong> solo puede determinarlo un técnico del IMSERSO o la Comunidad Autónoma mediante una valoración presencial.
          <br /><strong>No sustituye</strong> la solicitud formal de valoración, que debes presentar en los Servicios Sociales de tu municipio.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Cuestionario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>¿Qué ayuda necesita la persona?</h2>
          <p className={styles.instruccion}>
            Marca las situaciones que describen las necesidades <strong>habituales</strong> de la persona. Si una situación ocurre de forma excepcional o puntual, no la marques.
          </p>

          {areas.map(area => (
            <div key={area} className={styles.areaSection}>
              <div className={styles.areaTitle}>{area}</div>
              {PREGUNTAS_BVD.filter(p => p.area === area).map(pregunta => (
                <div
                  key={pregunta.id}
                  className={`${styles.preguntaItem} ${marcados.has(pregunta.id) ? styles.preguntaActiva : ''}`}
                  onClick={() => toggleItem(pregunta.id)}
                >
                  <input
                    type="checkbox"
                    className={styles.checkDep}
                    checked={marcados.has(pregunta.id)}
                    onChange={() => toggleItem(pregunta.id)}
                    aria-label={pregunta.texto}
                    onClick={e => e.stopPropagation()}
                  />
                  <label className={styles.preguntaTexto}>{pregunta.texto}</label>
                </div>
              ))}
            </div>
          ))}

          <button
            type="button"
            className={styles.btn}
            onClick={evaluar}
            aria-label="Estimar grado de dependencia"
          >
            Estimar grado orientativo
          </button>

          <p className={styles.contador}>
            {marcados.size === 0
              ? 'Ninguna situación marcada'
              : `${marcados.size} situación${marcados.size > 1 ? 'es' : ''} marcada${marcados.size > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación de grado</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Marca las situaciones que se aplican y pulsa el botón para obtener la orientación de grado BVD.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div
                className={`${styles.gradoBox} ${styles[`grado${resultado.color.charAt(0).toUpperCase() + resultado.color.slice(1)}`]}`}
                role="status"
              >
                <span className={styles.gradoIcono} aria-hidden="true">{resultado.icono}</span>
                <div className={styles.gradoTitulo}>{resultado.titulo}</div>
                <div className={styles.gradoDescripcion}>{resultado.descripcion}</div>
              </div>

              {resultado.prestaciones.length > 0 && (
                <div className={styles.prestacionesCard}>
                  <div className={styles.cardSubtitle}>💶 Prestaciones/servicios a los que puede acceder</div>
                  <ul className={styles.prestacionesList}>
                    {resultado.prestaciones.map((p, i) => (
                      <li key={i} className={styles.prestacionItem}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className={styles.cardSubtitle}>Próximos pasos recomendados</div>
                <div className={styles.pasosList}>
                  {resultado.pasosAdicionales.map((paso, i) => (
                    <div key={i} className={styles.pasoItem}>
                      <span className={styles.pasoIcono} aria-hidden="true">{paso.icono}</span>
                      <span>{paso.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo funciona el sistema de dependencia en España?" subtitle="LAPAD, baremo BVD, prestaciones del SAAD y cómo solicitarlo">
        <p>La Ley 39/2006 (LAPAD) creó el Sistema para la Autonomía y Atención a la Dependencia (SAAD), que reconoce el derecho a recibir prestaciones y servicios públicos a quienes no pueden valerse por sí mismos para las actividades básicas de la vida diaria.</p>
        <h3>Los tres grados de dependencia</h3>
        <ul>
          <li><strong>Grado I — Dependencia moderada</strong>: la persona necesita ayuda para realizar varias actividades básicas al menos una vez al día, o tiene necesidades de apoyo intermitente o limitado.</li>
          <li><strong>Grado II — Dependencia severa</strong>: la persona necesita ayuda 2-3 veces al día para varias actividades básicas, aunque no requiere presencia permanente de un cuidador.</li>
          <li><strong>Grado III — Gran dependencia</strong>: la persona necesita ayuda varias veces al día para las actividades básicas y requiere presencia y supervisión continua de otra persona.</li>
        </ul>
        <h3>¿Cómo solicitar la valoración oficial?</h3>
        <ol>
          <li>Acude a los <strong>Servicios Sociales de tu ayuntamiento</strong> o a la oficina de la Consejería competente de tu CCAA.</li>
          <li>Presenta la solicitud con: DNI, informe médico actualizado y, si existe, informe social.</li>
          <li>Un técnico acreditado realizará una valoración presencial en el domicilio (o centro residencial).</li>
          <li>Recibirás la resolución con el grado reconocido y el Programa Individual de Atención (PIA) con las prestaciones asignadas.</li>
        </ol>
        <h3>¿Qué diferencia hay entre prestaciones y servicios?</h3>
        <p>Los <strong>servicios</strong> (SAD, centros de día, plazas residenciales) se prestan directamente. Las <strong>prestaciones económicas</strong> son pagos mensuales: la PECEF (para cuidadores familiares), la PEVS (para contratar servicios privados) y la de asistencia personal (para personas activas). La cuantía depende del grado y de la renta.</p>
        <h3>¿Cuánto tarda el proceso?</h3>
        <p>El plazo legal máximo es de 6 meses, pero en la práctica varía mucho por comunidad autónoma (de 3 a más de 18 meses). Por eso es importante solicitarlo cuanto antes: las prestaciones se cobran desde la fecha de solicitud, no desde la resolución.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Grados de dependencia y prestaciones (LAPAD)</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Grado</th>
              <th>Nivel de dependencia</th>
              <th>Prestación económica máx. (2025)</th>
              <th>Servicios principales</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grado I (Moderada)</td>
              <td>Necesita ayuda 1 vez al día en varias ABVD</td>
              <td>291 €/mes (vinculada servicio)</td>
              <td>SAD, teleasistencia, centro de día</td>
            </tr>
            <tr>
              <td>Grado II (Severa)</td>
              <td>Necesita ayuda 2-3 veces al día, no permanente</td>
              <td>426 €/mes (vinculada servicio)</td>
              <td>SAD ampliado, centro de día, plaza residencial</td>
            </tr>
            <tr>
              <td>Grado III (Gran dependencia)</td>
              <td>Necesita ayuda continua las 24h</td>
              <td>833 €/mes (vinculada servicio)</td>
              <td>Residencia, atención domiciliaria intensiva</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🧓</span>
            <strong>Persona mayor con movilidad limitada</strong>
          </div>
          <p>75 años, necesita ayuda para ducharse y vestirse pero puede comer sola y moverse por casa. Probable Grado I o II. La solicitud permite acceder a SAD y teleasistencia.</p>
          <div className={styles.escenarioExample}>Grado I → SAD 3h/día + teleasistencia gratuita o de bajo coste</div>
          <div className={styles.escenarioTip}>💡 Solicitar la valoración cuanto antes: los plazos son largos (3-12 meses) y los derechos son desde la solicitud.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🧠</span>
            <strong>Persona con demencia moderada</strong>
          </div>
          <p>Alzheimer en fase moderada, desorientada, riesgo de fugas. Probable Grado II o III. Las prestaciones pueden financiar residencia o cuidadora interna permanente.</p>
          <div className={styles.escenarioExample}>Grado III → plaza residencial cofinanciada o prestación cuidados familiares</div>
          <div className={styles.escenarioTip}>💡 Para Grado III, la prestación para cuidados en el entorno familiar es una alternativa a la residencia.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>♿</span>
            <strong>Persona joven con discapacidad severa</strong>
          </div>
          <p>30 años con parálisis cerebral. Puede tener Grado III y acceder a servicios de apoyo a la autonomía, asistencia personal y centros especializados de atención.</p>
          <div className={styles.escenarioExample}>Grado III → asistencia personal (horas) + centro ocupacional + apoyo familiar</div>
          <div className={styles.escenarioTip}>💡 El SAAD no es solo para mayores: aplica a cualquier persona con dependencia, independientemente de la edad.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>💔</span>
            <strong>Persona tras accidente o enfermedad grave</strong>
          </div>
          <p>Ictus con hemiplejia. Dependencia sobrevenida. Puede solicitarse durante la rehabilitación. El proceso puede ser más rápido en situaciones de urgencia o riesgo vital.</p>
          <div className={styles.escenarioExample}>Post-ictus: solicitud en el hospital, valoración urgente posible si hay riesgo</div>
          <div className={styles.escenarioTip}>💡 La valoración puede realizarse en el hospital durante el ingreso. Consultarlo al trabajador social hospitalario.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre la dependencia</h3>
        <div className={styles.faqItem}>
          <strong>¿Cómo se solicita la valoración de dependencia?</strong>
          <p>Se solicita en los Servicios Sociales de la CCAA (presencialmente, por correo o online). Un trabajador social o enfermero de la administración realiza la valoración en el domicilio.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuánto tiempo tarda el reconocimiento?</strong>
          <p>El plazo legal es 6 meses, pero en la práctica puede ser de 6 a 18 meses según la CCAA. Los derechos económicos se cuentan desde la fecha de solicitud, no de resolución.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué baremo se usa para valorar la dependencia?</strong>
          <p>El Baremo de Valoración de la Dependencia (BVD). Evalúa la capacidad para realizar actividades básicas de la vida diaria (comer, bañarse, vestirse, moverse, control de esfínteres, etc.).</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede recurrir si se está en desacuerdo con el grado?</strong>
          <p>Sí. Existe recurso de alzada ante la administración y, si no se resuelve favorablemente, vía judicial. Es recomendable asesorarse con un abogado especializado o asociación de afectados.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Las prestaciones son compatibles entre sí?</strong>
          <p>Las prestaciones económicas y los servicios generalmente no son compatibles entre sí. Se elige una modalidad en el Plan Individualizado de Atención (PIA), aunque hay excepciones.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El cuidador familiar recibe cotización a la SS?</strong>
          <p>Sí, quien recibe la prestación para cuidados en el entorno familiar tiene obligación de dar de alta al cuidador no profesional. El Estado cubre parte de la cotización mínima.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Hay que declarar las prestaciones de dependencia en IRPF?</strong>
          <p>Las prestaciones del SAAD (SAD, residencia, centro de día) están exentas de IRPF. La prestación económica para cuidados en el entorno familiar también está exenta.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué pasa si la situación empeora tras el reconocimiento?</strong>
          <p>Se puede solicitar una revisión del grado cuando hay cambio sustancial en el estado de salud. También hay revisiones de oficio periódicas por la administración.</p>
          <div className={styles.faqTip}>💡 No esperar a que la situación sea crítica para solicitar la revisión; el proceso tarda meses.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo solicitar y tramitar el grado de dependencia</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Reúne la documentación básica</strong>
            <p>DNI, informe médico actualizado del médico de cabecera o especialista que describa las limitaciones funcionales, certificado de empadronamiento y formulario de solicitud de la CCAA.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Presenta la solicitud cuanto antes</strong>
            <p>Los efectos económicos son desde la fecha de solicitud, no de la resolución. Presentarla antes, incluso si el expediente tarda, te protege económicamente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Prepara la visita del valorador</strong>
            <p>El valorador visitará el domicilio. Asegúrate de que la persona esté en sus condiciones habituales (no en un día especialmente bueno). Prepara medicación y documentación médica disponible.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Espera la resolución y revísala</strong>
            <p>Compara el grado reconocido con las necesidades reales. Si no refleja la situación, tienes 1 mes para presentar recurso de alzada con documentación médica adicional.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Elabora el Plan Individualizado de Atención (PIA)</strong>
            <p>El trabajador social de la CCAA propone las prestaciones o servicios más adecuados. Puedes negociar la modalidad que mejor se adapte a la situación familiar.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Inicia el cobro o el servicio</strong>
            <p>Una vez aprobado el PIA, comienza la prestación. Las retroactivas (desde la solicitud) se abonan habitualmente en un único pago. Guarda toda la documentación.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📅</div>
          <strong>Solicita antes de que sea urgente</strong>
          <p>El proceso tarda meses. Solicitar en cuanto aparecen limitaciones funcionales significativas da tiempo a recibir la prestación cuando más se necesita.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📋</div>
          <strong>Prepara informes médicos detallados</strong>
          <p>Un informe médico que describa específicamente las limitaciones funcionales (no solo el diagnóstico) influye significativamente en la valoración del baremo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔍</div>
          <strong>Infórmate sobre la CCAA específica</strong>
          <p>Cada CCAA gestiona el SAAD de forma diferente en tiempos y procedimientos. Los Servicios Sociales municipales pueden orientar sobre el proceso local.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>⚖️</div>
          <strong>No dudes en recurrir el grado</strong>
          <p>Los recursos son efectivos. Si el grado reconocido no corresponde a la realidad, documentar bien el recurso con informes especializados puede cambiar el resultado.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👨‍👩‍👧</div>
          <strong>Involucra al trabajador social</strong>
          <p>El trabajador social de Servicios Sociales puede asesorar sobre todas las prestaciones disponibles y ayudar en la tramitación. No tramitar solo si hay dificultades.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔄</div>
          <strong>Solicita revisión cuando cambia la situación</strong>
          <p>Si el estado empeora, solicitar revisión permite acceder a prestaciones de grado superior. No esperar a la revisión de oficio, que puede tardar años.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en la tramitación de la dependencia</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Esperar a que la situación sea crítica para solicitar</strong>: Los plazos son largos. Solicitar tarde puede suponer meses sin prestación cuando más se necesita.</li>
          <li><strong>No presentar recursos ante grados bajos</strong>: El sistema tiene una tasa de recurso con éxito considerable. Aceptar sin más un grado que no refleja la realidad supone perder prestaciones.</li>
          <li><strong>No acudir a la valoración en condiciones habituales</strong>: Si el día de la visita la persona está especialmente bien (por medicación, acompañamiento...), el valorador puede asignar un grado inferior al real.</li>
          <li><strong>Desconocer que los derechos son desde la solicitud</strong>: Muchas familias creen que los derechos empiezan con la resolución. Las retroactivas pueden ser de meses o años de prestación acumulada.</li>
          <li><strong>No comunicar cambios de situación</strong>: Si la persona se muda de CCAA, mejora significativamente o su situación empeora, hay obligación de comunicarlo. No hacerlo puede generar reclamaciones.</li>
          <li><strong>Confundir prestaciones con servicios</strong>: Las prestaciones económicas son dinero. Los servicios (SAD, residencia) son atención directa. No son incompatibles en todos los casos: consultar en cada situación.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-grado-dependencia')} />
      <ShareCard appName="orientador-grado-dependencia" />
      <Footer appName="orientador-grado-dependencia" />
    </div>
  );
}
