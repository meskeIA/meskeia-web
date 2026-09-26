'use client';

import { useState } from 'react';
import styles from './OrientadorGradoDependencia.module.css';
import { MeskeiaLogo, LegalNotice, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, DataReference, RegionBadge } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';
import {
  BVD_ACTIVIDADES_18_MAS,
  BVD_META,
  FISCAL_DEPENDENCIA_META,
  GRADOS_DEPENDENCIA,
  GRADO_III_PLUS,
  PRESTACIONES_DEPENDENCIA_2025,
} from '@/data/fiscal';
import { estimarBVD, type EstimacionBVD, type GradoBVD, type TipoApoyo } from './motor';

// ─── Datos ────────────────────────────────────────────────────────────────────

// Las actividades, tareas y pesos son los del Baremo de Valoración de la Dependencia
// (RD 174/2011, anexo I, escala de 18 y más años) y viven en data/fiscal/dependencia.ts.
// La aritmética del baremo está en ./motor.ts. ATENCIÓN: este orientador NO sustituye la
// valoración oficial: el valorador decide qué tareas cuentan y con qué tipo de apoyo.

const ACTIVIDADES_COMUNES = BVD_ACTIVIDADES_18_MAS.filter(a => a.pesoGeneral !== null);
const ACTIVIDAD_DECISIONES = BVD_ACTIVIDADES_18_MAS.find(a => a.pesoGeneral === null);
const IDS_DECISIONES = new Set(ACTIVIDAD_DECISIONES?.tareas.map(t => t.id) ?? []);

const OPCIONES_APOYO: { valor: TipoApoyo; texto: string }[] = [
  { valor: 'desconocido', texto: 'No lo sé o cambia según la tarea (se muestra un intervalo)' },
  { valor: 'supervision', texto: 'Sobre todo supervisión, indicaciones o ayuda física parcial (coeficiente 0,90)' },
  { valor: 'sustitucion', texto: 'Otra persona tiene que hacer las tareas por ella (sustitución máxima, 0,95)' },
  { valor: 'especial', texto: 'Apoyo especial: la ayuda se ve obstaculizada por condiciones excepcionales de salud, como sordoceguera u obesidad mórbida que exige a dos personas a la vez (1,00)' },
];

interface Paso {
  icono: string;
  texto: string;
}

interface ContenidoGrado {
  prestaciones: string[];
  pasos: Paso[];
}

const CONTENIDO_GRADO: Record<GradoBVD, ContenidoGrado> = {
  0: {
    prestaciones: [],
    pasos: [
      { icono: '🔁', texto: 'Si la situación cambia o empeora, vuelve a completar este orientador y valora solicitar la valoración oficial.' },
      { icono: '🏥', texto: 'Consulta con el médico de cabecera si hay un deterioro reciente: puede orientar sobre recursos de apoyo previos a la dependencia.' },
      { icono: '👥', texto: 'Los Servicios Sociales municipales ofrecen ayudas y recursos aunque no haya grado de dependencia reconocido.' },
    ],
  },
  1: {
    prestaciones: [
      'Servicio de Ayuda a Domicilio (SAD) público: horas de ayuda en el hogar',
      'Teleasistencia básica: dispositivo de alarma 24h',
      'Prestación económica vinculada a servicio (PEVS): para contratar servicios privados',
      'Acceso preferente a centros de día con plaza concertada',
    ],
    pasos: [
      { icono: '📋', texto: 'Solicita la valoración oficial en los Servicios Sociales de tu ayuntamiento o comunidad autónoma. Lleva el informe médico actualizado.' },
      { icono: '⏳', texto: 'El plazo legal de resolución es de 6 meses. En la práctica varía por CCAA (3-18 meses). Solicítalo cuanto antes.' },
      { icono: '📁', texto: 'Documentos necesarios: DNI, informe médico, informe social (si hay), certificado de empadronamiento.' },
      { icono: '💡', texto: 'El SAD público tiene copago según renta. Consulta con Servicios Sociales el coste estimado en tu caso.' },
    ],
  },
  2: {
    prestaciones: [
      'Servicio de Ayuda a Domicilio (SAD) ampliado: más horas diarias',
      'Centro de día: atención diurna especializada',
      'Prestación económica para cuidados en el entorno familiar (PECEF): pago al familiar cuidador',
      'Prestación económica vinculada a servicio (PEVS): para contratar ayuda profesional',
      'Plazas residenciales concertadas con prioridad',
    ],
    pasos: [
      { icono: '📋', texto: 'Solicita la valoración oficial cuanto antes: con Grado II el acceso a prestaciones es significativo.' },
      { icono: '💰', texto: 'La PECEF (pago al cuidador familiar) puede ser una opción si un familiar deja de trabajar para cuidar. Infórmate sobre el alta en la Seguridad Social del cuidador.' },
      { icono: '🏠', texto: 'Si el cuidado en casa no es viable, los centros de día o residencias concertadas pueden cubrir las necesidades con menor coste familiar.' },
      { icono: '🩺', texto: 'Solicita también una valoración del médico de cabecera para el informe de salud que acompaña a la solicitud BVD.' },
    ],
  },
  3: {
    prestaciones: [
      'Prestación económica para cuidados en el entorno familiar (PECEF): la cuantía más alta de los Grados I a III',
      'Servicio de Atención Residencial: plaza residencial concertada con máxima prioridad',
      'Servicio de Ayuda a Domicilio intensivo o asistente personal',
      'Centro de día especializado (demencias, daño cerebral adquirido, etc.)',
      'Prestación económica de asistencia personal (personas activas)',
    ],
    pasos: [
      { icono: '🚨', texto: 'Solicita la valoración cuanto antes y pregunta en Servicios Sociales si tu comunidad autónoma tramita por vía de urgencia los casos de gran dependencia.' },
      { icono: '💊', texto: 'Coordina con el médico y, si hay demencia u otras patologías, con el especialista (neurólogo, geriatra) para el informe clínico.' },
      { icono: '👨‍👩‍👧', texto: 'La exigencia del cuidado en Grado III es muy alta para el cuidador familiar. Infórmate sobre servicios de respiro, grupos de apoyo y gestión de la prestación.' },
      { icono: '⚖️', texto: 'Si la persona tiene deterioro cognitivo, considera iniciar los trámites de curatela o poder notarial preventivo para gestionar sus asuntos.' },
    ],
  },
};

const ICONO_GRADO: Record<GradoBVD, string> = { 0: '🟢', 1: '🟡', 2: '🟠', 3: '🔴' };
const CLASE_GRADO: Record<GradoBVD, string> = { 0: 'gradoVerde', 1: 'gradoAmarillo', 2: 'gradoNaranja', 3: 'gradoRojo' };
const SERVICIOS_POR_GRADO: Record<number, string> = {
  1: 'SAD, teleasistencia, centro de día',
  2: 'SAD ampliado, centro de día, plaza residencial',
  3: 'Residencia, atención domiciliaria intensiva',
};
const NOMBRE_CORTO: Record<GradoBVD, string> = { 0: 'sin grado reconocido', 1: 'Grado I', 2: 'Grado II', 3: 'Grado III' };

function datosGrado(grado: GradoBVD) {
  return GRADOS_DEPENDENCIA.find(g => g.grado === grado);
}

function pevsDeGrado(grado: number): number | undefined {
  return PRESTACIONES_DEPENDENCIA_2025.find(p => p.grado === grado && p.tipo === 'PEVS')?.cuantiaMaximaMensual;
}

function pecefDeGrado(grado: number): number | undefined {
  return PRESTACIONES_DEPENDENCIA_2025.find(p => p.grado === grado && p.tipo === 'PECEF')?.cuantiaMaximaMensual;
}

interface Resultado {
  estimacion: EstimacionBVD;
  /** Grado cuyo contenido (prestaciones y pasos) se muestra: el más alto del intervalo */
  gradoContenido: GradoBVD;
  enLimite: boolean;
  titulo: string;
  puntuacionTexto: string;
  descripcion: string;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function construirResultado(estimacion: EstimacionBVD): Resultado {
  const { minimo, maximo, gradoMinimo, gradoMaximo, escala } = estimacion;
  const enLimite = gradoMinimo !== gradoMaximo;

  const escalaTexto = escala === 'especifica'
    ? 'escala específica para funciones mentales, que aquí da más puntos que la general'
    : 'escala general';
  const puntuacionTexto = minimo === maximo
    ? `Puntuación BVD estimada: ${minimo} de 100 (${escalaTexto})`
    : `Puntuación BVD estimada: entre ${minimo} y ${maximo} de 100 (${escalaTexto})`;

  let titulo: string;
  let descripcion: string;

  if (enLimite) {
    titulo = `En el límite entre ${NOMBRE_CORTO[gradoMinimo]} y ${NOMBRE_CORTO[gradoMaximo]}`;
    const corte = datosGrado(gradoMaximo)?.puntuacionBVDDesde ?? 25;
    descripcion = `El intervalo cruza el corte de ${corte} puntos. De qué lado cae depende del tipo de apoyo que necesite en cada tarea (el baremo multiplica por 0,90, 0,95 o 1,00) y de qué tareas dé por buenas el valorador. Indicar el tipo de apoyo afina la estimación, pero no la convierte en un grado.`;
  } else if (gradoMinimo === 0) {
    titulo = 'Por debajo del Grado I: sin grado reconocido';
    descripcion = 'Con menos de 25 puntos el BVD no reconoce grado de dependencia. Esto no impide solicitar la valoración si la situación empeora, ni acudir a los recursos de Servicios Sociales.';
  } else {
    const datos = datosGrado(gradoMinimo);
    titulo = `Compatible con el ${datos?.nombre ?? NOMBRE_CORTO[gradoMinimo]}`;
    const definicion = datos?.descripcion ?? '';
    descripcion = `El ${NOMBRE_CORTO[gradoMinimo]} va de ${datos?.puntuacionBVDDesde} a ${datos?.puntuacionBVDHasta} puntos. Qué significa: ${definicion.charAt(0).toLowerCase()}${definicion.slice(1)}.`;
  }

  if (gradoMaximo === 3) {
    // DA 17.ª de la Ley 39/2006, añadida por el RDL 11/2025 (BOE-A-2025-21205), en vigor desde
    // el 23/10/2025. El III+ no sale del baremo: se reconoce a quien YA tiene el Grado III y un
    // diagnóstico de ELA avanzada u otra enfermedad de alta complejidad y curso irreversible.
    descripcion += ` El Grado III no es ya el último escalón: existe el ${GRADO_III_PLUS.nombre}, que no se obtiene con la puntuación del baremo sino que se reconoce a personas con Grado III diagnosticadas de ELA en fase avanzada u otras enfermedades de alta complejidad y curso irreversible (disposición adicional 17.ª de la Ley 39/2006). Este orientador no puede estimarlo.`;
  }

  return { estimacion, gradoContenido: gradoMaximo, enLimite, titulo, puntuacionTexto, descripcion };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorGradoDependencia() {
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [funcionesMentales, setFuncionesMentales] = useState(false);
  const [tipoApoyo, setTipoApoyo] = useState<TipoApoyo>('desconocido');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function toggleTarea(id: string) {
    setMarcadas(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResultado(null);
  }

  function cambiarFuncionesMentales(valor: boolean) {
    setFuncionesMentales(valor);
    setResultado(null);
  }

  function cambiarTipoApoyo(valor: TipoApoyo) {
    setTipoApoyo(valor);
    setResultado(null);
  }

  function evaluar() {
    setResultado(construirResultado(estimarBVD(marcadas, funcionesMentales, tipoApoyo)));
  }

  // Las tareas de «Tomar decisiones» solo cuentan (y solo se ven) con la escala específica
  const totalMarcadas = [...marcadas].filter(id => funcionesMentales || !IDS_DECISIONES.has(id)).length;
  const actividadesVisibles = funcionesMentales && ACTIVIDAD_DECISIONES
    ? [...ACTIVIDADES_COMUNES, ACTIVIDAD_DECISIONES]
    : ACTIVIDADES_COMUNES;

  const contenido = resultado ? CONTENIDO_GRADO[resultado.gradoContenido] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📋</span>
        <h1 className={styles.title}>Orientador Grado de Dependencia</h1>
        <p className={styles.subtitle}>Baremo BVD orientativo · Ley 39/2006 LAPAD · Prestaciones del SAAD</p>
      </header>

      {/* El baremo, los grados y las prestaciones son los del sistema español (SAAD) */}
      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard variant="general"
        severity="critical">
        <span>
          Este orientador es <strong>SOLO indicativo</strong> basado en las actividades evaluadas por el Baremo de Valoración de la Dependencia (BVD, RD 174/2011).
          <br /><strong>El grado oficial</strong> solo puede determinarlo un técnico del IMSERSO o la Comunidad Autónoma mediante una valoración presencial.
          <br /><strong>No sustituye</strong> la solicitud formal de valoración, que debes presentar en los Servicios Sociales de tu municipio.
          <br />Usa los pesos oficiales del baremo, pero <strong>qué tareas cuentan y con qué tipo de apoyo lo decide el valorador</strong>: por eso da un intervalo de puntos y no un grado reconocido.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa="Baremo de Valoración de la Dependencia (18 años o más)"
        fuente={BVD_META.fuente}
        verificado={BVD_META.verificado}
        urlOficial={BVD_META.urlOficial}
      />
      <DataReference
        normativa="Cuantías máximas de las prestaciones económicas del SAAD (2025)"
        fuente={FISCAL_DEPENDENCIA_META.fuente}
        verificado={FISCAL_DEPENDENCIA_META.verificado}
        urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
        nota={FISCAL_DEPENDENCIA_META.nota}
      />

      <div className={styles.mainContent}>
        {/* Cuestionario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>¿Qué tareas no puede hacer sin otra persona?</h2>
          <p className={styles.instruccion}>
            Estas son las actividades y tareas del BVD para personas de <strong>18 años o más</strong>. Marca una tarea solo si la persona necesita, <strong>siempre o la mayoría de las veces</strong>, que otra persona la supervise, la ayude o la haga por ella, o si no puede hacerla de ningún modo. No la marques si la hace sola con sus ayudas técnicas (bastón, andador…), si la ayuda es puntual o si se debe a una situación de salud con expectativa razonable de mejora.
          </p>

          <label className={styles.condicionMental}>
            <input
              type="checkbox"
              className={styles.checkDep}
              checked={funcionesMentales}
              onChange={e => cambiarFuncionesMentales(e.target.checked)}
            />
            <span>
              La persona tiene una condición de salud que afecta a sus funciones mentales (discapacidad intelectual, enfermedad mental, demencia u otro trastorno mental orgánico, daño cerebral, alteraciones perceptivo-cognitivas). Añade la actividad «Tomar decisiones» y la escala específica del baremo.
            </span>
          </label>

          {actividadesVisibles.map(actividad => {
            let pesoTexto: string;
            if (actividad.pesoGeneral === null) {
              pesoTexto = ` · pesa ${formatNumber(actividad.pesoEspecifico, 1)} de 100 (solo escala específica)`;
            } else if (funcionesMentales) {
              pesoTexto = ` · pesa ${formatNumber(actividad.pesoGeneral, 1)} (general) o ${formatNumber(actividad.pesoEspecifico, 1)} (específica) de 100`;
            } else {
              pesoTexto = ` · pesa ${formatNumber(actividad.pesoGeneral, 1)} de 100`;
            }
            return (
              <fieldset key={actividad.id} className={styles.areaSection}>
                <legend className={styles.areaTitle}>
                  {actividad.nombre}
                  <span className={styles.pesoActividad}>{pesoTexto}</span>
                </legend>
                {actividad.tareas.map(tarea => (
                  <label
                    key={tarea.id}
                    className={`${styles.preguntaItem} ${marcadas.has(tarea.id) ? styles.preguntaActiva : ''}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkDep}
                      checked={marcadas.has(tarea.id)}
                      onChange={() => toggleTarea(tarea.id)}
                    />
                    <span className={styles.preguntaTexto}>{tarea.nombre}</span>
                  </label>
                ))}
              </fieldset>
            );
          })}

          <fieldset className={styles.apoyoGroup}>
            <legend className={styles.areaTitle}>¿Qué tipo de apoyo necesita, en general?</legend>
            {OPCIONES_APOYO.map(opcion => (
              <label key={opcion.valor} className={styles.preguntaItem}>
                <input
                  type="radio"
                  name="tipoApoyo"
                  className={styles.checkDep}
                  checked={tipoApoyo === opcion.valor}
                  onChange={() => cambiarTipoApoyo(opcion.valor)}
                />
                <span className={styles.preguntaTexto}>{opcion.texto}</span>
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            className={styles.btn}
            onClick={evaluar}
          >
            Estimar grado orientativo
          </button>

          <p className={styles.contador}>
            {totalMarcadas === 0
              ? 'Ninguna tarea marcada'
              : `${totalMarcadas} ${totalMarcadas === 1 ? 'tarea marcada' : 'tareas marcadas'}`}
          </p>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación de grado</h2>

          {!resultado || !contenido ? (
            <p className={styles.placeholder}>
              Marca las tareas que se aplican y pulsa el botón para obtener la orientación de grado BVD.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div
                className={`${styles.gradoBox} ${styles[CLASE_GRADO[resultado.gradoContenido]]}`}
                role="status"
              >
                <span className={styles.gradoIcono} aria-hidden="true">{ICONO_GRADO[resultado.gradoContenido]}</span>
                <div className={styles.gradoTitulo}>{resultado.titulo}</div>
                <div className={styles.gradoPuntuacion}>{resultado.puntuacionTexto}</div>
                <div className={styles.gradoDescripcion}>{resultado.descripcion}</div>
              </div>

              {contenido.prestaciones.length > 0 && (
                <div className={styles.prestacionesCard}>
                  <div className={styles.cardSubtitle}>
                    <span aria-hidden="true">💶</span>{' '}
                    {resultado.enLimite
                      ? `Prestaciones y servicios del ${NOMBRE_CORTO[resultado.gradoContenido]}, si se reconoce`
                      : `Prestaciones y servicios del ${NOMBRE_CORTO[resultado.gradoContenido]}`}
                  </div>
                  <ul className={styles.prestacionesList}>
                    {contenido.prestaciones.map((p, i) => (
                      <li key={i} className={styles.prestacionItem}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div className={styles.cardSubtitle}>Próximos pasos recomendados</div>
                <div className={styles.pasosList}>
                  {contenido.pasos.map((paso, i) => (
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
        <h3>Los grados de dependencia</h3>
        <ul>
          <li><strong>Grado I — Dependencia moderada</strong> (25 a 49 puntos BVD): la persona necesita ayuda para realizar varias actividades básicas al menos una vez al día, o tiene necesidades de apoyo intermitente o limitado.</li>
          <li><strong>Grado II — Dependencia severa</strong> (50 a 74 puntos): la persona necesita ayuda 2-3 veces al día para varias actividades básicas, aunque no requiere presencia permanente de un cuidador.</li>
          <li><strong>Grado III — Gran dependencia</strong> (75 a 100 puntos): la persona necesita ayuda varias veces al día para las actividades básicas y requiere presencia y supervisión continua de otra persona.</li>
          <li><strong>{GRADO_III_PLUS.nombre}</strong>: {GRADO_III_PLUS.descripcion} Lo creó el RDL 11/2025, que añadió la disposición adicional 17.ª a la Ley 39/2006, en vigor desde el 23/10/2025; el RDL 17/2026 le fijó después su nivel mínimo de protección.</li>
        </ul>
        <h3>Cómo se calcula la puntuación del baremo</h3>
        <p>El BVD (RD 174/2011) reparte 100 puntos entre diez actividades: comer y beber pesa 16,8; la higiene relacionada con la micción y la defecación, 14,8; desplazarse dentro del hogar, 12,3, y así hasta las tareas domésticas (8,0) o los otros cuidados corporales (2,9). Cada actividad se divide en tareas con su propio peso. Por cada tarea que la persona no puede hacer sin el apoyo indispensable de otra persona se suma <em>peso de la tarea × peso de la actividad × coeficiente de apoyo</em> (0,90 supervisión o ayuda física parcial, 0,95 sustitución máxima, 1,00 apoyo especial), y el total se redondea al entero.</p>
        <p>Si la persona tiene una condición de salud que afecta a sus funciones mentales, se calcula también la <strong>escala específica</strong>, que añade la actividad «Tomar decisiones» (15,4 puntos) y da más peso al mantenimiento de la salud, y vale la puntuación más alta de las dos. Los pesos de este orientador son los de la escala para 18 años o más: con menos edad cambian, y por debajo de 3 años se usa otra escala (EVE).</p>
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
        {/* Ley 39/2006, disposición final primera, apdos. 2 y 3 (redacción del RDL 20/2012, vigente
            en el texto consolidado del BOE, BOE-A-2006-21990, consultado el 26/09/2026). Hallazgo 2145:
            la app decía lo contrario, que se cobraba desde la solicitud. */}
        <p>El plazo máximo entre la solicitud y la resolución que reconoce la prestación es de 6 meses (Ley 39/2006, disposición final primera, apartado 2), pero en la práctica varía mucho por comunidad autónoma.</p>
        <p>Según la norma estatal (apartado 3 de esa disposición), el derecho a las prestaciones se genera <strong>desde la fecha de la resolución</strong> que las reconoce o, si pasan seis meses desde la solicitud sin resolución dictada y notificada, desde ese momento. Las prestaciones económicas para cuidados en el entorno familiar (art. 18) quedan además sujetas a un <strong>plazo suspensivo de hasta dos años</strong> desde esas fechas, que se interrumpe cuando se empieza a cobrar. Las comunidades autónomas pueden tener normas propias más favorables: pregunta en Servicios Sociales cómo se aplica en la tuya. Solicitarlo cuanto antes importa porque el plazo de seis meses empieza a contar con la solicitud.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Grados de dependencia y prestaciones (LAPAD)</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Grado</th>
              <th>Puntos BVD</th>
              <th>Nivel de dependencia</th>
              <th>Vinculada al servicio, máx. (2025)</th>
              <th>Cuidados en el entorno familiar, máx. (2025)</th>
              <th>Servicios principales</th>
            </tr>
          </thead>
          <tbody>
            {GRADOS_DEPENDENCIA.map(g => {
              const pevs = pevsDeGrado(g.grado);
              const pecef = pecefDeGrado(g.grado);
              return (
                <tr key={g.grado}>
                  <td>{g.nombre}</td>
                  <td>{g.puntuacionBVDDesde}-{g.puntuacionBVDHasta}</td>
                  <td>{g.descripcion}</td>
                  <td>{pevs !== undefined ? `${formatCurrency(pevs)}/mes` : '—'}</td>
                  <td>{pecef !== undefined ? `${formatCurrency(pecef)}/mes` : '—'}</td>
                  <td>{SERVICIOS_POR_GRADO[g.grado] ?? ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className={styles.notaTabla}>
          Cuantías máximas estatales: cada comunidad autónoma puede complementarlas y el copago las reduce según la capacidad económica. El {GRADO_III_PLUS.nombre} no tiene baremo propio: se reconoce a personas con Grado III y un diagnóstico de ELA avanzada u otra enfermedad de alta complejidad y curso irreversible, y da acceso a la prestación vinculada al servicio de ayuda a domicilio o a la de asistencia personal, con cuantías máximas propias que esta tabla no recoge (disposición adicional 17.ª de la Ley 39/2006, añadida por el RDL 11/2025).
        </p>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
            <strong>Persona mayor con movilidad limitada</strong>
          </div>
          {/* Hallazgo 2146: decía «Probable Grado I o II» y «SAD 3h/día». Con los pesos del BVD que
              usa la propia app, lavarse (8,8) + vestirse (11,9) = 20,7 → entre 19 y 21: sin grado. */}
          <p>75 años, necesita ayuda para ducharse y vestirse pero puede comer sola y moverse por casa. Con el baremo, lavarse (8,8) y vestirse (11,9) suman como mucho unos 21 puntos: por debajo del Grado I, que empieza en 25. Si necesita también ayuda para salir a la calle o para las tareas domésticas, puede llegar al Grado I.</p>
          <div className={styles.escenarioExample}>Sin grado → recursos de Servicios Sociales municipales (ayuda a domicilio, teleasistencia) según cada ayuntamiento</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Si la situación empeora, solicitar la valoración cuanto antes: el plazo de resolución empieza a contar con la solicitud.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
            <strong>Persona con demencia moderada</strong>
          </div>
          <p>Alzheimer en fase moderada, desorientada, riesgo de fugas. Probable Grado II o III. Las prestaciones pueden financiar residencia o cuidadora interna permanente.</p>
          <div className={styles.escenarioExample}>Grado III → plaza residencial cofinanciada o prestación cuidados familiares</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Para Grado III, la prestación para cuidados en el entorno familiar es una alternativa a la residencia.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">♿</span>
            <strong>Persona joven con discapacidad severa</strong>
          </div>
          <p>30 años con parálisis cerebral que requiere apoyos para las actividades básicas diarias. Si la valoración resulta en Grado III, el SAAD ofrece asistencia personal (orientada a mantener vida activa, estudios o trabajo), servicios de apoyo a la autonomía y centros especializados.</p>
          <div className={styles.escenarioExample}>Grado III → asistencia personal (horas) + centro ocupacional + apoyo familiar</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> El SAAD no es solo para mayores: aplica a cualquier persona con dependencia, independientemente de la edad.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🩺</span>
            <strong>Persona tras accidente o enfermedad grave</strong>
          </div>
          <p>Ictus con hemiplejia. Dependencia sobrevenida. Puede solicitarse durante la rehabilitación. El proceso puede ser más rápido en situaciones de urgencia o riesgo vital.</p>
          <div className={styles.escenarioExample}>Post-ictus: solicitud en el hospital, valoración urgente posible si hay riesgo</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> La valoración puede realizarse en el hospital durante el ingreso. Consultarlo al trabajador social hospitalario.</div>
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
          <p>El plazo legal es 6 meses, pero en la práctica puede ser más largo según la comunidad autónoma. Por la norma estatal, el derecho a las prestaciones se genera desde la resolución que las reconoce, o desde que pasan seis meses de la solicitud sin resolución; la prestación para cuidados en el entorno familiar puede tener además un plazo suspensivo de hasta dos años (Ley 39/2006, disposición final primera, apartado 3).</p>
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
          <div className={styles.faqTip}><span aria-hidden="true">💡</span> No esperar a que la situación sea crítica para solicitar la revisión; el proceso tarda meses.</div>
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
            <p>El plazo máximo de seis meses para resolver empieza a contar con la solicitud, y si se agota sin resolución el derecho a las prestaciones se genera igualmente desde ese momento (Ley 39/2006, disposición final primera, apartado 3). Presentarla antes adelanta ese reloj.</p>
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
            <p>Una vez aprobado el PIA, comienza la prestación. Si se reconocen importes con efectos anteriores al primer pago, pregunta en Servicios Sociales cómo y cuándo los abona tu comunidad autónoma. Guarda toda la documentación.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📅</div>
          <strong>Solicita antes de que sea urgente</strong>
          <p>El proceso tarda meses. Solicitar en cuanto aparecen limitaciones funcionales significativas da tiempo a recibir la prestación cuando más se necesita.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📋</div>
          <strong>Prepara informes médicos detallados</strong>
          <p>Un informe médico que describa específicamente las limitaciones funcionales (no solo el diagnóstico) influye significativamente en la valoración del baremo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🔍</div>
          <strong>Infórmate sobre la CCAA específica</strong>
          <p>Cada CCAA gestiona el SAAD de forma diferente en tiempos y procedimientos. Los Servicios Sociales municipales pueden orientar sobre el proceso local.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">⚖️</div>
          <strong>No dudes en recurrir el grado</strong>
          <p>Los recursos son efectivos. Si el grado reconocido no corresponde a la realidad, documentar bien el recurso con informes especializados puede cambiar el resultado.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">👨‍👩‍👧</div>
          <strong>Involucra al trabajador social</strong>
          <p>El trabajador social de Servicios Sociales puede asesorar sobre todas las prestaciones disponibles y ayudar en la tramitación. No tramitar solo si hay dificultades.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🔄</div>
          <strong>Solicita revisión cuando cambia la situación</strong>
          <p>Si el estado empeora, solicitar revisión permite acceder a prestaciones de grado superior. No esperar a la revisión de oficio, que puede tardar años.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <strong>Errores frecuentes en la tramitación de la dependencia</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Esperar a que la situación sea crítica para solicitar</strong>: Los plazos son largos. Solicitar tarde puede suponer meses sin prestación cuando más se necesita.</li>
          <li><strong>No presentar recursos ante grados bajos</strong>: El sistema tiene una tasa de recurso con éxito considerable. Aceptar sin más un grado que no refleja la realidad supone perder prestaciones.</li>
          <li><strong>No acudir a la valoración en condiciones habituales</strong>: Si el día de la visita la persona está especialmente bien (por medicación, acompañamiento...), el valorador puede asignar un grado inferior al real.</li>
          <li><strong>Contar con atrasos desde el día de la solicitud</strong>: Por la norma estatal, el derecho a las prestaciones se genera desde la resolución que las reconoce (o a los seis meses de la solicitud si no hay resolución), y la prestación para cuidados en el entorno familiar puede tener un plazo suspensivo de hasta dos años (Ley 39/2006, disposición final primera, apartado 3). Consulta qué aplica tu comunidad autónoma antes de hacer cuentas.</li>
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
