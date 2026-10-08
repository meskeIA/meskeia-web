'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorAnatomiaNomina.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib';
import {
  ANIO_NOMINA,
  DEVENGOS_IMPORTES,
  MEI_2029,
  PAGAS_EXTRA,
  TIPOS_EMPRESA,
  TIPOS_TRABAJADOR,
  TIPO_RETENCION_EJEMPLO,
  TOPES_BASE,
  calcularNomina,
} from './motor';

// ─────────────────────────────────────────────
// Datos de la nómina ficticia
// ─────────────────────────────────────────────
// Las cifras salen de motor.ts (base × tipo, con los tipos de @/data/fiscal); aquí solo
// se escriben los textos. Ningún importe ni tipo normativo va tecleado en esta página.

interface LineaNomina {
  id: string;
  concepto: string;
  importe: number;
  tipo: 'devengo' | 'deduccion' | 'base' | 'liquido';
  explicacion: string;
  detalle: string;
}

/** Tipo en % («4.7») → «4,70 %», con espacio duro antes del «%». */
const pct = (tipo: number): string => formatPercentage(tipo / 100, 2);
/** Importe en formato es-ES sin símbolo («2777,00»), para las sumas escritas en el texto. */
const num = (valor: number): string => formatNumber(valor, 2);

const N = calcularNomina();
const T = TIPOS_TRABAJADOR;
const E = TIPOS_EMPRESA;
const D = DEVENGOS_IMPORTES;

const CABECERA = {
  empresa: 'TechSolutions España S.L.',
  cif: 'B-12345678',
  ccc: '28/1234567/89',
  trabajador: 'María García López',
  nif: '12345678-Z',
  naf: '28/12345678/01',
  categoria: 'Grupo 1 - Ingenieros y Licenciados',
  antiguedad: '15/03/2020',
  periodo: `Enero ${ANIO_NOMINA}`,
  diasTrabajados: 30,
};

const DEVENGOS: LineaNomina[] = [
  {
    id: 'salario-base',
    concepto: 'Salario base',
    importe: D.salarioBase,
    tipo: 'devengo',
    explicacion: 'Es la retribución fija mínima que corresponde a tu categoría profesional según convenio colectivo.',
    detalle: `Se calcula dividiendo el salario base anual entre 14 pagas (12 mensuales + ${PAGAS_EXTRA} extras). Si tu convenio dice "30.000 € de salario base al año", el salario base mensual (14 pagas) es ${formatCurrency(D.salarioBase)}. Las ${PAGAS_EXTRA} pagas extra (normalmente en junio y diciembre) se cobran aparte, pero cotizan repartidas en los doce meses: lo verás en la base de cotización.`,
  },
  {
    id: 'complemento-antiguedad',
    concepto: 'Plus antigüedad (trienios)',
    importe: D.antiguedad,
    tipo: 'devengo',
    explicacion: 'Complemento por los años que llevas en la empresa. Se llama "trienio" porque se genera cada 3 años.',
    detalle: `María entró el ${CABECERA.antiguedad}: en enero de ${ANIO_NOMINA} tiene 1 trienio cumplido (el segundo llega en marzo). La cuantía depende del convenio. No todas las empresas lo pagan — depende del sector.`,
  },
  {
    id: 'plus-transporte',
    concepto: 'Plus transporte',
    importe: D.transporte,
    tipo: 'devengo',
    explicacion: 'Compensación por los gastos de desplazamiento al centro de trabajo. Algunos convenios lo incluyen obligatoriamente.',
    detalle: 'Aunque compense un gasto, cotiza a la Seguridad Social por su importe íntegro: el art. 147.2 de la Ley General de la Seguridad Social solo saca de la base las asignaciones de locomoción cuando te desplazas fuera de tu centro habitual de trabajo, no el transporte para llegar a él. También tributa en el IRPF como el resto del sueldo. La compensación por kilómetro que se suele citar es la de los desplazamientos por trabajo fuera del centro, que es otra figura.',
  },
  {
    id: 'plus-convenio',
    concepto: 'Plus convenio',
    importe: D.convenio,
    tipo: 'devengo',
    explicacion: 'Complemento salarial fijado por el convenio colectivo del sector. Cada convenio define sus propios pluses.',
    detalle: 'Puede llamarse de muchas formas: plus de productividad, complemento de puesto, plus de disponibilidad... Es salario a todos los efectos y cotiza íntegro.',
  },
];

const DEDUCCIONES: LineaNomina[] = [
  {
    id: 'ss-contingencias',
    concepto: `Contingencias comunes (${pct(T.contingenciasComunes)})`,
    importe: N.cuotaCC,
    tipo: 'deduccion',
    explicacion: 'Tu aportación a la Seguridad Social por las contingencias comunes: sobre todo la pensión de jubilación, y también la incapacidad permanente, las prestaciones por muerte y supervivencia (viudedad, orfandad), la incapacidad temporal por enfermedad común o accidente no laboral y el nacimiento y cuidado de menor.',
    detalle: `Se calcula sobre la base de cotización de contingencias comunes: ${num(N.baseCC)} × ${pct(T.contingenciasComunes)} = ${formatCurrency(N.cuotaCC)}. Es la mayor deducción de SS. Tu empresa aporta además un ${pct(E.contingenciasComunes)} sobre la misma base (${formatCurrency(N.empresa.cc)}), que no ves descontado en tu nómina.`,
  },
  {
    id: 'ss-desempleo',
    concepto: `Desempleo (${pct(T.desempleo)})`,
    importe: N.cuotaDesempleo,
    tipo: 'deduccion',
    explicacion: 'Financias tu derecho al paro. Si te despiden, cobrarás una prestación proporcional a lo cotizado.',
    detalle: `${num(N.baseCP)} × ${pct(T.desempleo)} = ${formatCurrency(N.cuotaDesempleo)}, sobre la base de contingencias profesionales. Es el tipo de los contratos indefinidos; en los de duración determinada es más alto. La empresa paga un ${pct(E.desempleoIndefinido)} adicional (${pct(E.desempleoTemporal)} si el contrato es temporal) que no aparece en tu nómina.`,
  },
  {
    id: 'ss-formacion',
    concepto: `Formación profesional (${pct(T.formacionProfesional)})`,
    importe: N.cuotaFP,
    tipo: 'deduccion',
    explicacion: 'Financia la formación para el empleo que gestionan el SEPE (antiguo INEM) y la FUNDAE.',
    detalle: `${num(N.baseCP)} × ${pct(T.formacionProfesional)} = ${formatCurrency(N.cuotaFP)}. Es poco, pero da derecho a formación subvencionada. La empresa paga otro ${pct(E.formacionProfesional)} sobre la misma base.`,
  },
  {
    id: 'ss-mei',
    concepto: `MEI - Mecanismo de Equidad Intergeneracional (${pct(T.mef)})`,
    importe: N.cuotaMEI,
    tipo: 'deduccion',
    explicacion: 'Aportación para reforzar el Fondo de Reserva de la Seguridad Social (la «hucha de las pensiones»). Se creó en 2023 y no aumenta tu pensión individual.',
    detalle: `${num(N.baseCC)} × ${pct(T.mef)} = ${formatCurrency(N.cuotaMEI)}. En ${ANIO_NOMINA} el MEI es del ${pct(T.mef + E.mei)}: ${pct(T.mef)} a tu cargo y ${pct(E.mei)} de la empresa. Sube cada año hasta 2029, cuando llegará al ${pct(MEI_2029.trabajador + MEI_2029.empresa)}: ${pct(MEI_2029.trabajador)} a cargo del trabajador y ${pct(MEI_2029.empresa)} de la empresa.`,
  },
  {
    id: 'irpf',
    concepto: `Retención IRPF (${pct(TIPO_RETENCION_EJEMPLO)})`,
    importe: N.retencionIRPF,
    tipo: 'deduccion',
    explicacion: 'Anticipo a cuenta del Impuesto sobre la Renta. Tu empresa retiene un porcentaje cada mes y lo ingresa a Hacienda por ti.',
    detalle: `${num(N.baseIRPF)} × ${pct(TIPO_RETENCION_EJEMPLO)} = ${formatCurrency(N.retencionIRPF)}. El tipo lo calcula la empresa según tu sueldo anual previsto y tu situación personal y familiar, y se aplica a todo lo que cobras en el mes. NO es lo que pagarás de IRPF al final del año — puede ser más o menos. Por eso existe la declaración de la renta: para ajustar.`,
  },
];

const BASES: LineaNomina[] = [
  {
    id: 'base-cc',
    concepto: 'Base de cotización contingencias comunes',
    importe: N.baseCC,
    tipo: 'base',
    explicacion: 'La cifra sobre la que se calculan tus cotizaciones a la SS. Incluye todo lo que cobras en el mes —también el plus de transporte— más la prorrata de las pagas extra.',
    detalle: `Salario base (${num(D.salarioBase)}) + antigüedad (${num(D.antiguedad)}) + plus transporte (${num(D.transporte)}) + plus convenio (${num(D.convenio)}) + prorrata de las ${PAGAS_EXTRA} pagas extra (${num(D.salarioBase)} × ${PAGAS_EXTRA} / 12 = ${num(N.prorrataExtras)}) = ${formatCurrency(N.baseCC)}. Está entre la base mínima (${formatCurrency(TOPES_BASE.minima)}) y la máxima (${formatCurrency(TOPES_BASE.maxima)}) de ${ANIO_NOMINA}, así que no hay que ajustarla a los topes.`,
  },
  {
    id: 'base-cp',
    concepto: 'Base cotización contingencias profesionales',
    importe: N.baseCP,
    tipo: 'base',
    explicacion: 'Base para la cotización por accidentes de trabajo y enfermedades profesionales, y también para desempleo, formación profesional y FOGASA. Coincide con la de comunes salvo por las horas extra, que solo suman aquí.',
    detalle: 'Los accidentes de trabajo y las enfermedades profesionales los paga íntegramente la empresa, con una tarifa que depende de su actividad. De esta base salen, en cambio, tus cuotas de desempleo y de formación profesional.',
  },
  {
    id: 'base-irpf',
    concepto: 'Base sujeta a retención IRPF',
    importe: N.baseIRPF,
    tipo: 'base',
    explicacion: 'Total de devengos sobre los que se aplica la retención de IRPF. Normalmente coincide con el total devengado.',
    detalle: 'No lleva la prorrata de las pagas extra: esas se retienen el mes en que se cobran. Algunos conceptos están exentos de IRPF (como las dietas o indemnizaciones dentro de los límites legales), pero el salario base y la mayoría de complementos sí tributan.',
  },
];

const totalDevengos = N.totalDevengos;
const totalDeducciones = N.totalDeducciones;
const liquido = N.liquido;

// ─────────────────────────────────────────────
// Componente de línea clickable
// ─────────────────────────────────────────────

function LineaClickable({ linea, activa, onClick }: {
  linea: LineaNomina;
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.lineaWrapper}>
      <button
        type="button"
        className={`${styles.lineaBtn} ${activa ? styles.lineaActiva : ''} ${styles[`linea_${linea.tipo}`]}`}
        onClick={onClick}
        aria-expanded={activa}
        aria-label={`${linea.concepto}: ${formatCurrency(linea.importe)}. Pulsa para ver explicación.`}
      >
        <span className={styles.lineaConcepto}>{linea.concepto}</span>
        <span className={styles.lineaImporte}>
          {linea.tipo === 'deduccion' ? '−' : ''} {formatCurrency(linea.importe)}
        </span>
        <span className={`${styles.lineaChevron} ${activa ? styles.chevronAbierto : ''}`} aria-hidden="true">▼</span>
      </button>
      {activa && (
        <div className={styles.explicacion} role="region" aria-label={`Explicación de ${linea.concepto}`}>
          <p className={styles.explicacionTexto}>{linea.explicacion}</p>
          <p className={styles.explicacionDetalle}>{linea.detalle}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAnatomiaNominaPage() {
  const [lineaActiva, setLineaActiva] = useState<string | null>(null);

  const toggleLinea = (id: string) => {
    setLineaActiva(prev => prev === id ? null : id);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Anatomía de una Nómina</h1>
          <p className={styles.subtitle}>Pulsa en cada línea para descubrir qué significa y por qué aparece ahí</p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <p className={styles.instruccion}>
          <span aria-hidden="true">👆</span> Esta es una nómina ficticia de ejemplo. Haz clic en cualquier línea para ver su explicación.
        </p>

        {/* Cabecera de la nómina */}
        <div className={styles.nomina}>
          <div className={styles.nominaCabecera}>
            <div className={styles.cabeceraBloque}>
              <p className={styles.cabeceraLabel}>Empresa</p>
              <p className={styles.cabeceraValor}>{CABECERA.empresa}</p>
              <p className={styles.cabeceraDetalle}>CIF: {CABECERA.cif} · CCC: {CABECERA.ccc}</p>
            </div>
            <div className={styles.cabeceraBloque}>
              <p className={styles.cabeceraLabel}>Trabajador/a</p>
              <p className={styles.cabeceraValor}>{CABECERA.trabajador}</p>
              <p className={styles.cabeceraDetalle}>NIF: {CABECERA.nif} · NAF: {CABECERA.naf}</p>
            </div>
          </div>
          <div className={styles.cabeceraMeta}>
            <span>{CABECERA.categoria}</span>
            <span>Antigüedad: {CABECERA.antiguedad}</span>
            <span>Periodo: {CABECERA.periodo}</span>
            <span>Días: {CABECERA.diasTrabajados}</span>
          </div>

          {/* Devengos */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>
              <span className={styles.seccionNum}>I</span> Devengos
              <span className={styles.seccionHint}>(lo que ganas)</span>
            </h2>
            {DEVENGOS.map(d => (
              <LineaClickable
                key={d.id}
                linea={d}
                activa={lineaActiva === d.id}
                onClick={() => toggleLinea(d.id)}
              />
            ))}
            <div className={styles.totalLinea}>
              <span>A. Total devengado</span>
              <span>{formatCurrency(totalDevengos)}</span>
            </div>
          </div>

          {/* Deducciones */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>
              <span className={styles.seccionNum}>II</span> Deducciones
              <span className={styles.seccionHint}>(lo que te descuentan)</span>
            </h2>
            {DEDUCCIONES.map(d => (
              <LineaClickable
                key={d.id}
                linea={d}
                activa={lineaActiva === d.id}
                onClick={() => toggleLinea(d.id)}
              />
            ))}
            <div className={styles.totalLinea}>
              <span>B. Total a deducir</span>
              <span>− {formatCurrency(totalDeducciones)}</span>
            </div>
          </div>

          {/* Bases de cotización */}
          <div className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>
              <span className={styles.seccionNum}>III</span> Bases de cotización
              <span className={styles.seccionHint}>(sobre qué se calcula)</span>
            </h2>
            {BASES.map(b => (
              <LineaClickable
                key={b.id}
                linea={b}
                activa={lineaActiva === b.id}
                onClick={() => toggleLinea(b.id)}
              />
            ))}
          </div>

          {/* Líquido */}
          <div className={styles.liquidoSeccion}>
            <div className={styles.liquidoCalculo}>
              <span>A. Total devengado</span>
              <span>{formatCurrency(totalDevengos)}</span>
            </div>
            <div className={styles.liquidoCalculo}>
              <span>B. Total deducciones</span>
              <span>− {formatCurrency(totalDeducciones)}</span>
            </div>
            <div className={styles.liquidoResultado}>
              <span>Líquido total a percibir (A − B)</span>
              <span>{formatCurrency(liquido)}</span>
            </div>
          </div>
        </div>

        {/* Resumen visual */}
        <div className={styles.resumenVisual}>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Ganas en bruto</span>
            <span className={styles.resumenValor}>{formatCurrency(totalDevengos)}</span>
          </div>
          <div className={styles.resumenFlecha} aria-hidden="true">→</div>
          <div className={styles.resumenItem}>
            <span className={styles.resumenLabel}>Te descuentan</span>
            <span className={`${styles.resumenValor} ${styles.rojo}`}>− {formatCurrency(totalDeducciones)}</span>
          </div>
          <div className={styles.resumenFlecha} aria-hidden="true">→</div>
          <div className={`${styles.resumenItem} ${styles.resumenDestacado}`}>
            <span className={styles.resumenLabel}>Cobras en banco</span>
            <span className={`${styles.resumenValor} ${styles.azul}`}>{formatCurrency(liquido)}</span>
          </div>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Calcula tu neto real → <a href="/estimador-sueldo-neto/">Calculadora Sueldo Neto</a> · <a href="/visualizador-sueldo-neto/">Tu Sueldo al Desnudo</a>
        </div>

        <EducationalSection
          title="Lo que la nómina no dice (pero deberías saber)"
          subtitle="Conceptos clave para entender tu retribución"
          defaultOpen={false}
        >
          <h3>¿Qué es la base de cotización y por qué importa?</h3>
          <p>
            La base de cotización es la cifra sobre la que se calculan tus aportaciones a la Seguridad Social.
            No es exactamente lo que cobras en el mes: le suma la prorrata de las pagas extra, y solo
            excluye los conceptos que enumera la ley (por ejemplo, las dietas y los gastos de locomoción
            de los desplazamientos fuera del centro de trabajo, dentro de sus límites). <strong>Tu futura pensión, prestación por desempleo y baja médica
            se calculan sobre esta base</strong>, por eso es importante que sea correcta.
          </p>

          <h3>La retención de IRPF no es lo que pagas de impuestos</h3>
          <p>
            Tu empresa calcula un porcentaje de retención estimado y lo ingresa a Hacienda cada mes.
            Pero el IRPF real se calcula al año siguiente en la declaración de la renta. Si te han
            retenido de más, Hacienda te devuelve. Si de menos, pagarás la diferencia. La retención
            es un <strong>anticipo</strong>, no el impuesto final.
          </p>

          <h3>Lo que tu empresa paga por ti (y no aparece en la nómina)</h3>
          <p>
            Por cada empleado, la empresa paga además en {ANIO_NOMINA}: contingencias comunes
            ({pct(E.contingenciasComunes)}), desempleo ({pct(E.desempleoIndefinido)} en un contrato
            indefinido), FOGASA ({pct(E.fogasa)}), formación profesional ({pct(E.formacionProfesional)}) y
            el MEI ({pct(E.mei)}). Suman un <strong>{pct(N.empresa.tipoTotal)} sobre tu base de
            cotización</strong>, más la tarifa de accidentes de trabajo y enfermedades profesionales, que
            depende de la actividad de la empresa. En la nómina de María, con {formatCurrency(N.baseCC)} de
            base, son {formatCurrency(N.empresa.total)} al mes más esa tarifa.
          </p>

          <h3>Conceptos que pueden aparecer en tu nómina</h3>
          <p>
            Además de los que muestra esta nómina de ejemplo, es habitual encontrar: horas extra,
            complemento de nocturnidad, plus de peligrosidad, dietas y locomoción, prorrata de
            pagas extras, complemento por IT (incapacidad temporal), o retribución flexible
            (cheque guardería, seguro médico, etc.).
          </p>

          <h3>Tu contrato debe decirte qué complementos cobras</h3>
          <p>
            Desde el 5 de octubre de 2026, el{' '}
            <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-19200" target="_blank" rel="noopener noreferrer">
              Real Decreto 723/2026
            </a>{' '}
            obliga a la empresa a informar por escrito de la cuantía del salario base y de
            <strong> cada complemento salarial por separado</strong>, con su periodicidad y forma de
            pago, de cómo se calculan los conceptos variables y del convenio colectivo aplicable,
            con su código. Ese documento es la referencia para comprobar que cada línea de
            devengos de tu nómina corresponde a algo pactado.
          </p>
          <p>
            Si tu contrato ya existía el 5 de octubre de 2026, esa información no llega sin
            pedirla: puedes solicitarla y la empresa tiene <strong>30 días hábiles</strong> para
            entregártela, salvo que ya la tengas. Solo se aplica a relaciones laborales de más
            de cuatro semanas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> esta nómina es ficticia y simplificada con fines educativos.
            Las nóminas reales varían según convenio colectivo, categoría profesional, antigüedad,
            situación familiar y comunidad autónoma. Para consultas sobre tu nómina específica,
            contacta con el departamento de RRHH de tu empresa o un asesor laboral.
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="visualizador-anatomia-nomina" />
        <Footer appName="visualizador-anatomia-nomina" />
    </div>
  );
}
