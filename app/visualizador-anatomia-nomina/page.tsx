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
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Datos de la nómina ficticia
// ─────────────────────────────────────────────

interface LineaNomina {
  id: string;
  concepto: string;
  importe: number;
  tipo: 'devengo' | 'deduccion' | 'base' | 'liquido';
  explicacion: string;
  detalle: string;
}

const CABECERA = {
  empresa: 'TechSolutions España S.L.',
  cif: 'B-12345678',
  ccc: '28/1234567/89',
  trabajador: 'María García López',
  nif: '12345678-Z',
  naf: '28/12345678/01',
  categoria: 'Grupo 1 - Ingenieros y Licenciados',
  antiguedad: '15/03/2020',
  periodo: 'Enero 2025',
  diasTrabajados: 30,
};

const DEVENGOS: LineaNomina[] = [
  {
    id: 'salario-base',
    concepto: 'Salario base',
    importe: 2142.86,
    tipo: 'devengo',
    explicacion: 'Es la retribución fija mínima que corresponde a tu categoría profesional según convenio colectivo.',
    detalle: 'Se calcula dividiendo el salario base anual entre 14 pagas (12 mensuales + 2 extras). Si tu convenio dice "30.000 € brutos/año", el salario base mensual (14 pagas) es 2.142,86 €.',
  },
  {
    id: 'complemento-antiguedad',
    concepto: 'Plus antigüedad (trienios)',
    importe: 85.00,
    tipo: 'devengo',
    explicacion: 'Complemento por los años que llevas en la empresa. Se llama "trienio" porque se genera cada 3 años.',
    detalle: 'María lleva desde 2020 → 1 trienio cumplido. La cuantía depende del convenio. No todas las empresas lo pagan — depende del sector.',
  },
  {
    id: 'plus-transporte',
    concepto: 'Plus transporte',
    importe: 72.00,
    tipo: 'devengo',
    explicacion: 'Compensación por los gastos de desplazamiento al centro de trabajo. Algunos convenios lo incluyen obligatoriamente.',
    detalle: 'Es un concepto NO salarial hasta ciertos límites (actualmente ~0,26 €/km). Si supera esos límites, el exceso sí cotiza a la Seguridad Social.',
  },
  {
    id: 'plus-convenio',
    concepto: 'Plus convenio',
    importe: 120.00,
    tipo: 'devengo',
    explicacion: 'Complemento salarial fijado por el convenio colectivo del sector. Cada convenio define sus propios pluses.',
    detalle: 'Puede llamarse de muchas formas: plus de productividad, complemento de puesto, plus de disponibilidad... Es salario a todos los efectos y cotiza al 100%.',
  },
];

const DEDUCCIONES: LineaNomina[] = [
  {
    id: 'ss-contingencias',
    concepto: 'Contingencias comunes (4,70%)',
    importe: 113.74,
    tipo: 'deduccion',
    explicacion: 'Tu aportación a la Seguridad Social para cubrir enfermedad común, accidente no laboral, maternidad/paternidad e incapacidad temporal.',
    detalle: 'Se calcula sobre la base de cotización (2.419,86 €) × 4,70%. Es la mayor deducción de SS. Tu empresa paga además un 23,60% sobre la misma base que tú no ves en la nómina.',
  },
  {
    id: 'ss-desempleo',
    concepto: 'Desempleo (1,55%)',
    importe: 37.51,
    tipo: 'deduccion',
    explicacion: 'Financias tu derecho al paro. Si te despiden, cobrarás una prestación proporcional a lo cotizado.',
    detalle: 'El 1,55% es para contratos indefinidos. Los temporales pagan 1,60%. La empresa paga un 5,50% adicional que no aparece en tu nómina.',
  },
  {
    id: 'ss-formacion',
    concepto: 'Formación profesional (0,10%)',
    importe: 2.42,
    tipo: 'deduccion',
    explicacion: 'Financia los cursos de formación para trabajadores del SEPE (antiguo INEM) y la FUNDAE.',
    detalle: 'Apenas 2-3 €/mes, pero da derecho a formación subvencionada. La empresa paga otro 0,60% adicional.',
  },
  {
    id: 'ss-mei',
    concepto: 'MEI - Mecanismo Equidad Intergeneracional (0,12%)',
    importe: 2.90,
    tipo: 'deduccion',
    explicacion: 'Aportación para reforzar la hucha de las pensiones. Creado en 2023 para garantizar la sostenibilidad del sistema.',
    detalle: 'Es nuevo desde 2023. Irá subiendo gradualmente: 0,12% del trabajador en 2025. Para 2029 será del 0,17%. La empresa paga un 0,58% adicional.',
  },
  {
    id: 'irpf',
    concepto: 'Retención IRPF (15,27%)',
    importe: 369.54,
    tipo: 'deduccion',
    explicacion: 'Anticipo a cuenta del Impuesto sobre la Renta. Tu empresa retiene un porcentaje cada mes y lo ingresa a Hacienda por ti.',
    detalle: 'El 15,27% es el tipo de retención calculado por la empresa según tu sueldo, situación familiar y contratos. NO es lo que pagarás de IRPF al final del año — puede ser más o menos. Por eso existe la declaración de la renta: para ajustar.',
  },
];

const BASES: LineaNomina[] = [
  {
    id: 'base-cc',
    concepto: 'Base de cotización contingencias comunes',
    importe: 2419.86,
    tipo: 'base',
    explicacion: 'La cifra sobre la que se calculan tus cotizaciones a la SS. Incluye tu salario base + complementos salariales + prorrata de pagas extras.',
    detalle: 'Salario base (2.142,86) + antigüedad (85) + plus convenio (120) + prorrata extras (2.142,86 × 2 / 12 = 357,14) − plus transporte (no cotiza) = 2.705 € aprox. Se ajusta a topes min/max de SS.',
  },
  {
    id: 'base-cp',
    concepto: 'Base cotización contingencias profesionales',
    importe: 2419.86,
    tipo: 'base',
    explicacion: 'Base para calcular la cotización por accidentes de trabajo y enfermedades profesionales. Suele coincidir con la base de CC.',
    detalle: 'Se usa para calcular lo que la empresa paga por riesgos laborales. A ti no te descuentan nada por contingencias profesionales — lo paga íntegramente la empresa.',
  },
  {
    id: 'base-irpf',
    concepto: 'Base sujeta a retención IRPF',
    importe: 2419.86,
    tipo: 'base',
    explicacion: 'Total de devengos sobre los que se aplica la retención de IRPF. Normalmente coincide con el total devengado.',
    detalle: 'Algunos conceptos están exentos de IRPF (como las dietas o indemnizaciones dentro de los límites legales), pero el salario base y la mayoría de complementos sí tributan.',
  },
];

const totalDevengos = DEVENGOS.reduce((s, d) => s + d.importe, 0);
const totalDeducciones = DEDUCCIONES.reduce((s, d) => s + d.importe, 0);
const liquido = totalDevengos - totalDeducciones;

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            No es exactamente tu sueldo bruto: incluye la prorrata de pagas extras y puede excluir algunos
            complementos no salariales. <strong>Tu futura pensión, prestación por desempleo y baja médica
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
            Por cada empleado, la empresa paga además: contingencias comunes (23,60%), accidentes de
            trabajo (variable), desempleo (5,50%), FOGASA (0,20%) y formación (0,60%). En total,
            aproximadamente un <strong>30-33% adicional</strong> sobre tu base de cotización. Si cobras
            2.400 € de base, tu empresa paga ~720 € más a la Seguridad Social.
          </p>

          <h3>Conceptos que pueden aparecer en tu nómina</h3>
          <p>
            Además de los que muestra esta nómina de ejemplo, es habitual encontrar: horas extra,
            complemento de nocturnidad, plus de peligrosidad, dietas y locomoción, prorrata de
            pagas extras, complemento por IT (incapacidad temporal), o retribución flexible
            (cheque guardería, seguro médico, etc.).
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> esta nómina es ficticia y simplificada con fines educativos.
            Las nóminas reales varían según convenio colectivo, categoría profesional, antigüedad,
            situación familiar y comunidad autónoma. Para consultas sobre tu nómina específica,
            contacta con el departamento de RRHH de tu empresa o un asesor laboral.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-anatomia-nomina')} />
        <ShareCard appName="visualizador-anatomia-nomina" />
        <Footer appName="visualizador-anatomia-nomina" />
      </div>
    </>
  );
}
