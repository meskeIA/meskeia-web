'use client';

import { useState } from 'react';
import styles from './ResidenciaVsCuidadoCasa.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, DataReference, RegionBadge } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  SMI_2026,
  FISCAL_SMI_META,
  FISCAL_DEPENDENCIA_META,
  FISCAL_EMPLEADOS_HOGAR_META,
  PRESTACIONES_DEPENDENCIA_2025,
  COTIZACION_EMPLEADOS_HOGAR_2026,
  HORAS_JORNADA_COMPLETA_MES,
  costeMinimoEmpleadorHogar,
  personasParaCubrir,
} from '@/data/fiscal';

// ─── Tipos y datos ────────────────────────────────────────────────────────────

type GradoDependencia = 'no_valorado' | 'grado1' | 'grado2' | 'grado3';

interface FactorComparacion {
  icono: string;
  texto: string;
}

interface Opcion {
  id: string;
  icono: string;
  nombre: string;
  costeTexto: string;
  costeMin: number;
  costeMax: number;
  factores: FactorComparacion[];
  notaPublica?: string;
  /** Qué cubre el importe, para no comparar 3 h de servicio con 24 h de plaza */
  cobertura: string;
  /** De dónde sale el suelo del rango */
  origenCoste: string;
}

// ─── Referencias de MERCADO ──────────────────────────────────────────────────
//
// ⚠️ Estas cuatro cifras NO son datos normativos y no tienen sello: son horquillas de
//    mercado. Viven juntas y aquí arriba porque el 21/09/2026 el Inspector encontró
//    CUATRO rangos distintos para el coste de una residencia en la misma página —motor
//    1.600-3.200, tabla 1.500-4.500, FAQ 2.000-4.500 y JSON-LD 1.500-4.000— y la única
//    forma de que no vuelvan a divergir es que solo exista un sitio donde cambiarlas
//    (hallazgo 1126).
export const COSTES_MERCADO = {
  /** Plaza en residencia privada, €/mes, todo incluido y 24 h */
  residenciaMin: 1600,
  residenciaMax: 3200,
  /** Servicio de ayuda a domicilio privado de agencia, €/hora */
  sadHoraMin: 18,
  sadHoraMax: 22,
  /** Días de servicio al mes que se usan en LOS DOS extremos del rango del SAD */
  sadDiasMes: 26,
  /** Sobre el suelo legal, cuánto más se paga de hecho a un cuidador contratado */
  margenMercadoCuidador: 1.35,
};

// ─── Lógica ───────────────────────────────────────────────────────────────────

/** Cuantía máxima estatal de una prestación de dependencia, o 0 si no hay grado. */
function cuantiaPrestacion(grado: GradoDependencia, tipo: 'PEVS' | 'PECEF'): number {
  const n = grado === 'grado1' ? 1 : grado === 'grado2' ? 2 : grado === 'grado3' ? 3 : 0;
  if (n === 0) return 0;
  return PRESTACIONES_DEPENDENCIA_2025.find(p => p.grado === n && p.tipo === tipo)?.cuantiaMaximaMensual ?? 0;
}

function calcularOpciones(horasDia: number, gradoDependencia: GradoDependencia): Opcion[] {
  // Residencia privada: coste relativamente fijo, varía por CCAA
  const residenciaMin = COSTES_MERCADO.residenciaMin;
  const residenciaMax = COSTES_MERCADO.residenciaMax;

  // ⚠️ 2026-09-21 (hallazgo 1121): los dos extremos del rango del SAD no eran el mismo
  //    escenario con distinto precio — el mínimo usaba 22 días y el máximo 26, de modo
  //    que variaban a la vez precio y días trabajados y salía una horquilla del 44 %.
  //    Ahora lo único que cambia entre extremos es el precio por hora.
  const diasSAD = COSTES_MERCADO.sadDiasMes;
  const costeSADMin = Math.round(horasDia * COSTES_MERCADO.sadHoraMin * diasSAD);
  const costeSADMax = Math.round(horasDia * COSTES_MERCADO.sadHoraMax * diasSAD);

  // ⚠️ 2026-09-21 (hallazgos 1115 y 1120): el coste del cuidador venía de tres tramos con
  //    importes planos, y el resultado no era ni monótono ni legal. Pedir MÁS cuidado
  //    salía MÁS BARATO al cruzar las 8 h/día (1.750-2.200 € → 1.300-1.700 €), el tramo
  //    rotulado «jornada completa» empezaba en 5 h, entre 9 y 24 h el importe era idéntico
  //    —la app no distinguía 9 horas de cobertura continua de 24— y ese mínimo de 1.300 €
  //    quedaba por debajo del SMI antes de cualquier cotización. Ahora el suelo sale del
  //    SMI del hogar y de la cuota del empleador, los dos de data/fiscal, y crece con las
  //    horas sin escalones.
  const horasMes = horasDia * 30;
  const personas = personasParaCubrir(horasMes);
  const cuidadorMin = Math.round(costeMinimoEmpleadorHogar(horasMes, SMI_2026.hogarHora));
  const cuidadorMax = Math.round(cuidadorMin * COSTES_MERCADO.margenMercadoCuidador);
  const cuidadorTipo = personas > 1
    ? `Cuidado en casa (${horasDia}h/día · ${personas} personas)`
    : `Cuidado en casa (${horasDia}h/día)`;

  const tienePrestacion = gradoDependencia !== 'no_valorado';
  const pevs = cuantiaPrestacion(gradoDependencia, 'PEVS');
  const pecef = cuantiaPrestacion(gradoDependencia, 'PECEF');
  const notaPublica = tienePrestacion
    ? `Con ${gradoDependencia.replace('grado', 'Grado ')} reconocido puedes solicitar la prestación vinculada a servicio (hasta ${formatCurrency(pevs)}/mes) o, si cuida un familiar, la de cuidados en el entorno familiar (hasta ${formatCurrency(pecef)}/mes). Son cuantías MÁXIMAS estatales y el copago las reduce según tu capacidad económica.`
    : 'Sin valoración de dependencia, los costes son íntegramente privados. Solicitar la valoración es lo que abre el acceso a las prestaciones y a los servicios del SAAD.';

  return [
    {
      id: 'residencia',
      icono: '🏢',
      nombre: 'Residencia privada',
      costeTexto: `${formatCurrency(residenciaMin)} – ${formatCurrency(residenciaMax)}/mes`,
      costeMin: residenciaMin,
      costeMax: residenciaMax,
      cobertura: '24 h al día, todos los días, con alojamiento, manutención, suministros y atención sanitaria incluidos',
      origenCoste: 'Horquilla de mercado, no un dato normativo. Varía mucho por comunidad autónoma y por centro.',
      factores: [
        { icono: '✅', texto: 'Atención 24 horas garantizada' },
        { icono: '✅', texto: 'Libera al cuidador familiar de la dedicación 24h' },
        { icono: '✅', texto: 'Socialización y actividades' },
        { icono: '✅', texto: 'Atención sanitaria integrada' },
        // «Abandona su hogar» valoraba moralmente una opción legítima y atribuía la acción
        // a la persona cuidada (hallazgo 1122): es un hecho, no un reproche.
        { icono: '❌', texto: 'Cambio de domicilio y de entorno habitual' },
        { icono: '❌', texto: 'Coste mensual más alto en términos absolutos' },
        { icono: '⚠️', texto: 'Variabilidad de calidad entre centros' },
      ],
      // Hallazgo 1124: la nota de ayudas se imprimía en SAD y cuidador y nunca aquí, pese
      // a que la PEVS está pensada precisamente para pagar una plaza residencial privada.
      notaPublica,
    },
    {
      id: 'sad',
      icono: '🏠',
      nombre: `SAD en domicilio (${horasDia}h/día)`,
      costeTexto: `${formatCurrency(costeSADMin)} – ${formatCurrency(costeSADMax)}/mes`,
      costeMin: costeSADMin,
      costeMax: costeSADMax,
      cobertura: `${formatNumber(horasDia, 1)} h al día, ${diasSAD} días al mes. El resto del tiempo lo cubre la familia.`,
      origenCoste: `${formatCurrency(COSTES_MERCADO.sadHoraMin)}–${formatCurrency(COSTES_MERCADO.sadHoraMax)}/hora de agencia privada × ${formatNumber(horasDia, 1)} h × ${diasSAD} días. Lo único que cambia entre los dos extremos es el precio por hora.`,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Mayor autonomía y privacidad' },
        { icono: '✅', texto: 'Coste proporcional a las horas' },
        // Hallazgo 1123: SERVICIOS_SAAD da acceso al SAD a los grados 1, 2 y 3, así que
        // con Grado I esta línea decía «posible si se valora dependencia» justo encima de
        // una nota que empezaba «Con Grado 1 reconocido…».
        { icono: tienePrestacion ? '✅' : '⚠️', texto: tienePrestacion ? 'SAD público disponible con tu grado' : 'SAD público posible si se valora dependencia' },
        { icono: '❌', texto: 'No cubre las horas fuera del servicio' },
        { icono: '⚠️', texto: 'Requiere apoyo familiar complementario' },
      ],
      notaPublica,
    },
    {
      id: 'cuidador',
      icono: '👤',
      nombre: cuidadorTipo,
      costeTexto: `${formatCurrency(cuidadorMin)} – ${formatCurrency(cuidadorMax)}/mes`,
      costeMin: cuidadorMin,
      costeMax: cuidadorMax,
      cobertura: personas > 1
        ? `${formatNumber(horasDia, 1)} h al día, todos los días. Son ${formatNumber(horasMes, 0)} h al mes: más de lo que una sola persona puede trabajar legalmente (${formatNumber(HORAS_JORNADA_COMPLETA_MES, 0)} h/mes), así que hacen falta ${personas} contratos.`
        : `${formatNumber(horasDia, 1)} h al día, todos los días (${formatNumber(horasMes, 0)} h/mes). El resto del tiempo lo cubre la familia.`,
      origenCoste: `Suelo legal: SMI del servicio del hogar (${formatCurrency(SMI_2026.hogarHora)}/hora) más el ${formatNumber(COTIZACION_EMPLEADOS_HOGAR_2026.contingenciasComunesEmpleador, 2)} % de contingencias comunes a cargo del empleador. No incluye accidentes de trabajo, desempleo ni FOGASA, así que el coste real es algo mayor.`,
      factores: [
        { icono: '✅', texto: 'Permanece en su hogar' },
        { icono: '✅', texto: 'Atención personalizada y continua' },
        personas > 1
          ? { icono: '⚠️', texto: `Una sola persona no puede cubrir ${formatNumber(horasDia, 1)} h diarias: hacen falta ${personas} contratos y coordinar turnos` }
          : { icono: horasDia >= 8 ? '✅' : '⚠️', texto: horasDia >= 8 ? 'Cobertura amplia de horas' : 'Cobertura limitada a las horas contratadas' },
        { icono: '⚠️', texto: 'Responsabilidad como empleador (SS y contrato)' },
        { icono: '⚠️', texto: 'Gestión de sustituciones en vacaciones/bajas' },
        { icono: '❌', texto: 'Sin cobertura sanitaria integrada' },
      ],
      notaPublica,
    },
  ];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ResidenciaVsCuidadoCasa() {
  const [horasDia, setHorasDia] = useState('4');
  const [gradoDependencia, setGradoDependencia] = useState<GradoDependencia>('no_valorado');
  const [opciones, setOpciones] = useState<Opcion[] | null>(null);
  const [error, setError] = useState('');

  function comparar() {
    setError('');
    // ⚠️ 2026-09-21 (hallazgo 1119): `parseFloat(x.replace(',', '.'))` leía el millar
    //    español como coma decimal, así que «1.500» (mil quinientas horas) se convertía en
    //    1,5 y pasaba el rango. Encima el blur de NumberInput sí usa el parser canónico y
    //    acota a 24: el mismo texto valía 24 h para el control y 1,5 h para el motor.
    const horas = parseSpanishNumber(horasDia);
    if (Number.isNaN(horas) || horas < 1 || horas > 24) {
      setError('Introduce las horas de cuidado al día (entre 1 y 24).');
      // ⚠️ 2026-09-21 (hallazgo 1118): antes se volvía sin tocar `opciones`, así que el
      //    aviso convivía con tres tarjetas de importes que correspondían a otra entrada.
      setOpciones(null);
      return;
    }
    setOpciones(calcularOpciones(horas, gradoDependencia));
  }

  const opcionesSorted = opciones ? [...opciones].sort((a, b) => a.costeMin - b.costeMin) : null;
  const opcionMasBajaId = opcionesSorted?.[0]?.id;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏡</span>
        <h1 className={styles.title}>Residencia vs Cuidado en Casa</h1>
        <p className={styles.subtitle}>Compara costes y factores de las opciones de cuidado para mayores · {FISCAL_SMI_META.vigencia}</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Los costes son <strong>estimaciones orientativas</strong>. El suelo del cuidado en casa sale del SMI y de la cotización del empleador; los precios de residencia y de agencia privada son horquillas de mercado que varían mucho por comunidad autónoma, calidad del servicio y situación personal.
          <br /><strong>No es</strong> asesoramiento financiero ni de servicios sociales personalizado.
          <br />Las prestaciones públicas de dependencia dependen del reconocimiento oficial del grado. Consulta con los Servicios Sociales de tu municipio.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en estas estimaciones.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={`SMI y prestaciones de dependencia ${FISCAL_SMI_META.vigencia}`}
        fuente={`${FISCAL_SMI_META.fuente} · ${FISCAL_EMPLEADOS_HOGAR_META.fuente} · ${FISCAL_DEPENDENCIA_META.fuente}`}
        verificado={FISCAL_EMPLEADOS_HOGAR_META.verificado}
        urlOficial={FISCAL_EMPLEADOS_HOGAR_META.urlOficial}
        nota="Las cuantías de dependencia son máximos estatales antes del copago. Los precios de residencia y de agencia privada son horquillas de mercado, no datos normativos."
      />

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <NumberInput
            value={horasDia}
            onChange={setHorasDia}
            label="Horas de cuidado necesarias al día"
            placeholder="4"
            helperText="Horas diarias de ayuda que requiere la persona: aseo, comidas, movilidad, etc."
            min={1}
            max={24}
          />

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="gradoDep">Grado de Dependencia reconocido</label>
            <select
              id="gradoDep"
              className={styles.select}
              value={gradoDependencia}
              onChange={e => setGradoDependencia(e.target.value as GradoDependencia)}
            >
              <option value="no_valorado">No valorado (o en trámite)</option>
              <option value="grado1">Grado I — Dependencia moderada</option>
              <option value="grado2">Grado II — Dependencia severa</option>
              <option value="grado3">Grado III — Gran dependencia</option>
            </select>
            <p className={styles.hint}>
              Si aún no está valorado, solicitar el reconocimiento desbloquea prestaciones y ayudas públicas.
            </p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={comparar} aria-label="Comparar opciones de cuidado">
            Comparar opciones
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Comparativa de opciones</h2>

          {!opciones ? (
            <p className={styles.placeholder}>
              Indica las horas de cuidado y pulsa el botón para ver la comparativa de las tres opciones.
            </p>
          ) : (
            <div className={styles.opcionesGrid}>
              {opciones.map(opcion => (
                <div
                  key={opcion.id}
                  className={`${styles.opcionCard} ${opcion.id === opcionMasBajaId ? styles.opcionMasBaja : ''}`}
                >
                  <div className={styles.opcionHeader}>
                    <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                    <span className={styles.opcionNombre}>{opcion.nombre}</span>
                    {opcion.id === opcionMasBajaId && (
                      <span className={styles.opcionBadge}>Menor coste mensual</span>
                    )}
                  </div>

                  <div className={styles.opcionCoste}>{opcion.costeTexto}</div>

                  {/* ⚠️ 2026-09-21 (hallazgo 1125): las tres columnas no cubren lo mismo
                      —3 h de servicio a domicilio frente a una plaza de 24 h con alojamiento
                      y manutención— y la insignia premiaba al importe más bajo sin decirlo. */}
                  <p className={styles.opcionCobertura}>
                    <strong>Qué cubre:</strong> {opcion.cobertura}
                  </p>
                  <p className={styles.opcionOrigen}>{opcion.origenCoste}</p>

                  <div className={styles.factoresLista}>
                    {opcion.factores.map((f, i) => (
                      <div key={i} className={styles.factorItem}>
                        <span className={styles.factorIcono} aria-hidden="true">{f.icono}</span>
                        <span>{f.texto}</span>
                      </div>
                    ))}
                  </div>

                  {opcion.notaPublica && (
                    <>
                      <div className={styles.divider} />
                      <p className={styles.notaPublica}><span aria-hidden="true">💡</span> {opcion.notaPublica}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo elegir entre residencia y cuidado en casa?" subtitle="Factores económicos, emocionales y prácticos a considerar">
        <p>No existe una opción universalmente mejor: la decisión depende de la situación médica, la red familiar, el entorno de la vivienda y los recursos económicos. Estos son los factores clave:</p>
        <h3>¿Cuándo puede ser mejor la residencia?</h3>
        <ul>
          <li>Dependencia severa o gran dependencia (Grado II o III) con necesidad de atención 24h.</li>
          <li>Aislamiento social o cuando la persona se beneficia de la vida comunitaria.</li>
          <li>Cuando la vivienda no es adaptable o la familia no puede asumir el rol cuidador.</li>
          <li>Cuando el coste de los cuidados en casa supera al de la residencia.</li>
        </ul>
        <h3>¿Cuándo puede ser mejor el cuidado en casa?</h3>
        <ul>
          <li>Dependencia moderada que no requiere atención médica especializada continua.</li>
          <li>Fuerte vínculo de la persona con su hogar y entorno habitual.</li>
          <li>Red familiar que puede complementar las horas del cuidador o SAD.</li>
          <li>Vivienda adaptable o ya adaptada.</li>
        </ul>
        <h3>El papel de la valoración de dependencia</h3>
        <p>Solicitar el reconocimiento oficial de la dependencia (IMSERSO / CCAA) es el primer paso. Desbloquea prestaciones económicas, plazas en centros de día, SAD público y prioridad en residencias concertadas, reduciendo notablemente el coste real.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Residencia vs Cuidado en Casa</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Residencia</th>
              <th>Cuidado en Casa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Coste mensual</td>
              <td>{formatCurrency(COSTES_MERCADO.residenciaMin)}–{formatCurrency(COSTES_MERCADO.residenciaMax)} (privada, todo incluido)</td>
              <td>Proporcional a las horas: solo el servicio de cuidado</td>
            </tr>
            <tr>
              <td>Atención médica 24h</td>
              <td>Sí</td>
              <td>No (salvo contratación adicional)</td>
            </tr>
            <tr>
              <td>Entorno familiar</td>
              <td>No (entorno institucional)</td>
              <td>Sí</td>
            </tr>
            <tr>
              <td>Adecuado para dependencia severa (Grado III)</td>
              <td>Sí</td>
              <td>Difícil sin apoyo intensivo</td>
            </tr>
            <tr>
              <td>Impacto en vivienda propia</td>
              <td>Puede mantenerse o venderse</td>
              <td>Se mantiene habitada</td>
            </tr>
            <tr>
              <td>Apoyo para cuidador familiar</td>
              <td>Cuidador familiar sin dedicación directa</td>
              <td>Cuidador familiar con dedicación significativa (riesgo de sobrecarga sin apoyos suficientes)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
            <strong>Dependencia Grado III con necesidad médica</strong>
          </div>
          <p>Persona con demencia avanzada, incontinencia y riesgo de caídas. Necesita atención 24h que la familia no puede proveer. La residencia especializada es la opción más segura.</p>
          <div className={styles.escenarioExample}>Indicador: Grado III + necesidad atención médica continua → residencia especializada</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> La lista de espera en residencias públicas puede ser larga; solicitar plaza con antelación.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
            <strong>Dependencia moderada con familia cercana</strong>
          </div>
          <p>Grado I-II, familia próxima, preferencia por el hogar. SAD + cuidador parcial puede ser suficiente con apoyos municipales y adaptación del hogar.</p>
          <div className={styles.escenarioExample}>Solución: SAD municipal 3h/día + cuidador interno 2 días + teleasistencia</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Combinar SAD, teleasistencia y prestación económica del SAAD puede cubrir necesidades a coste razonable.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">👩‍👦</span>
            <strong>Cuidador único con trabajo a jornada completa</strong>
          </div>
          <p>Hijo único trabajador, no puede atender a progenitor con dependencia durante el día. Sin red de apoyo, el cuidado en casa no es sostenible.</p>
          <div className={styles.escenarioExample}>Alternativa: Centro de día + teleasistencia + cuidador nocturno eventual</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Los centros de día (no internamiento) son una solución intermedia menos costosa y más flexible.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏘️</span>
            <strong>Persona mayor que rechaza la residencia</strong>
          </div>
          <p>Autonomía suficiente pero soledad y riesgos. Prefiere su casa. Teleasistencia + visitas SAD + comunidad de vecinos puede ser viable con seguimiento estrecho.</p>
          <div className={styles.escenarioExample}>Mínimo viable: teleasistencia + visita SAD diaria + red vecinal activa</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> La teleasistencia avanzada (sensores de movimiento, detección de caídas) permite mayor autonomía con seguridad.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes: residencia vs cuidado en casa</h3>
        <div className={styles.faqItem}>
          <strong>¿Cuánto cuesta una residencia pública vs privada?</strong>
          <p>Una plaza privada ronda los {formatCurrency(COSTES_MERCADO.residenciaMin)}–{formatCurrency(COSTES_MERCADO.residenciaMax)}/mes según calidad y ubicación, con alojamiento, manutención y atención 24 h incluidos: es el mismo rango que usa la comparativa de arriba. En una plaza pública o concertada se paga un copago calculado sobre la capacidad económica, no el precio del centro. Las listas de espera en plazas públicas pueden ser de 1-3 años.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es el SAD (Servicio de Atención Domiciliaria)?</strong>
          <p>Servicio municipal que proporciona cuidados básicos en el domicilio (higiene, comidas, acompañamiento). Incluido en las prestaciones del SAAD, con copago según renta.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué diferencia hay entre centro de día y residencia?</strong>
          <p>El centro de día es atención diurna (8-20h) sin internamiento. La persona duerme en casa. Es más barato y menos disruptivo, adecuado para dependencias moderadas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puede la familia cobrar por cuidar a un familiar?</strong>
          <p>Sí, a través de la prestación económica para cuidados en el entorno familiar del SAAD: hasta {formatCurrency(cuantiaPrestacion('grado1', 'PECEF'))}/mes con Grado I, {formatCurrency(cuantiaPrestacion('grado2', 'PECEF'))} con Grado II y {formatCurrency(cuantiaPrestacion('grado3', 'PECEF'))} con Grado III. Son máximos estatales antes del copago. El cuidador puede darse de alta en la Seguridad Social por convenio especial, cuya cuota abona íntegramente el Estado desde 2023.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La residencia implica perder la pensión?</strong>
          <p>No, la pensión se sigue cobrando. Se destina al pago de la residencia (copago según renta). El Estado puede reclamar parte de los bienes al fallecimiento en algunas CCAA.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Se puede volver a casa desde la residencia?</strong>
          <p>Sí, si la situación de salud mejora o la familia puede asumir los cuidados, es posible volver al domicilio. Las plazas públicas se pueden dejar con un periodo de preaviso.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la teleasistencia avanzada?</strong>
          <p>Sistemas que van más allá del botón de emergencia: sensores de movimiento, detección de caídas, alertas médicas, videollamada. Permite mayor seguridad con mayor autonomía en casa.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta esta decisión al patrimonio familiar?</strong>
          <p>Las residencias privadas tienen costes mensuales altos. Por otra parte, las prestaciones del SAAD pueden generar derechos de reintegro contra la herencia en algunas CCAA. Si el patrimonio familiar es una preocupación relevante (por ejemplo, una vivienda que es el hogar de otros familiares), conviene consultar con un trabajador social y, si procede, con un abogado, para entender las implicaciones de cada opción.</p>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo tomar la decisión: residencia vs cuidado en casa</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Evalúa el grado de dependencia</strong>
            <p>Si aún no hay valoración oficial, solicítala. El grado determina qué prestaciones están disponibles y qué nivel de cuidado es necesario objetivamente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Analiza la situación familiar realista</strong>
            <p>¿Hay cuidadores disponibles? ¿Cuántas horas pueden dedicar? ¿Tienen formación? ¿Cómo afectará a su trabajo y vida personal? Sé honesto sobre la capacidad familiar.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Consulta con el trabajador social</strong>
            <p>Los trabajadores sociales del municipio o del SAAD pueden orientar sobre servicios disponibles, listas de espera, costes y opciones más adecuadas para el caso concreto.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Calcula el coste real de cada opción</strong>
            <p>Suma SAD + adaptaciones + cuidador + teleasistencia para el cuidado en casa. Compara con el copago de residencia pública o el coste de privada.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Incluye a la persona en la decisión</strong>
            <p>Siempre que su capacidad cognitiva lo permita, la persona afectada debe participar en la decisión sobre su propio cuidado. Sus preferencias son centrales, aunque pueden verse limitadas por razones objetivas de seguridad, viabilidad económica o disponibilidad familiar.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Revisa la decisión periódicamente</strong>
            <p>La situación de dependencia evoluciona. Una solución adecuada hoy puede no serlo en 6-12 meses. Planifica revisiones periódicas con el equipo de atención.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">⏰</div>
          <strong>Solicita la valoración de dependencia pronto</strong>
          <p>Las listas de espera tanto para valoración como para plazas en residencias públicas son largas. No esperar a una crisis para iniciar los trámites.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🤝</div>
          <strong>Cuida al cuidador</strong>
          <p>El cuidador familiar tiene riesgo de síndrome de burnout. Incluir servicios de respiro, grupos de apoyo y tiempo libre en la planificación es fundamental.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📱</div>
          <strong>Invierte en teleasistencia</strong>
          <p>Es uno de los servicios con mejor relación coste-beneficio. Da tranquilidad a la familia y seguridad a la persona mayor con un coste muy bajo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🔄</div>
          <strong>Considera soluciones mixtas</strong>
          <p>El centro de día + casa es una opción intermedia valiosa. La persona duerme en casa pero recibe atención profesional durante el día.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">💼</div>
          <strong>Verifica la regularización del cuidador</strong>
          <p>Los cuidadores contratados en casa deben estar regularizados (Sistema Especial Empleados del Hogar). La economía sumergida conlleva riesgos legales y laborales.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">⚖️</div>
          <strong>Planifica el aspecto patrimonial</strong>
          <p>La decisión sobre residencia tiene implicaciones hereditarias. Consultar con un notario o abogado antes de tomar decisiones que afecten al patrimonio familiar.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <strong>Errores frecuentes en la decisión residencia vs casa</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Decidir en crisis</strong>: Tomar la decisión después de una hospitalización urgente genera malas elecciones. Planificar antes de que la situación se agrave da mejores resultados.</li>
          <li><strong>No valorar el impacto en el cuidador</strong>: La sobrecarga del cuidador puede llevar al colapso familiar. Si el cuidador no puede sostener el cuidado, la residencia puede ser mejor para todos.</li>
          <li><strong>Elegir solo por coste</strong>: La opción más barata puede no ser la más adecuada para las necesidades médicas y emocionales de la persona dependiente.</li>
          <li><strong>No explorar todas las ayudas públicas</strong>: Muchas familias pagan más de lo necesario por desconocimiento de las prestaciones del SAAD, SAD municipal o deducciones fiscales.</li>
          <li><strong>Contratar cuidadores sin regularizar</strong>: Los cuidadores en economía sumergida no tienen acceso a bajas médicas ni prestaciones. Un accidente puede generar problemas legales graves para la familia.</li>
          <li><strong>No planificar la evolución de la situación</strong>: Las necesidades de cuidado aumentan con el tiempo. Una solución adecuada hoy puede ser insuficiente en 2 años. Planificar la progresión evita decisiones urgentes.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('residencia-vs-cuidado-en-casa')} />
      <ShareCard appName="residencia-vs-cuidado-en-casa" />
      <Footer appName="residencia-vs-cuidado-en-casa" />
    </div>
  );
}
