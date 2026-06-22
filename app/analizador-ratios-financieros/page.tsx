'use client';

import { useState } from 'react';
import styles from './AnalizadorRatiosFinancieros.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface InputData {
  // Activo
  inmovilizado: string;
  existencias: string;
  deudoresComerciales: string;
  caja: string;
  // Pasivo y Patrimonio Neto
  capitalReservas: string;
  resultadoEjercicio: string;
  deudasLargoPlazo: string;
  proveedores: string;
  deudasCortoPlazo: string;
  acreedoresVarios: string;
  // Cuenta de Resultados
  ventas: string;
  compras: string;
  otrosGastos: string;
  amortizaciones: string;
  gastosFinancieros: string;
  resultadoNeto: string;
}

type EstadoRatio = 'critico' | 'adecuado' | 'holgado' | 'nd';

interface ResultadoRatio {
  id: string;
  nombre: string;
  valor: number | null;
  estado: EstadoRatio;
  formula: string;
  rangoTexto: string;
  interpretacion: string;
  formatoValor: 'ratio' | 'pct' | 'dias' | 'veces';
}

interface GrupoRatios {
  id: string;
  nombre: string;
  icono: string;
  colorVar: string;
  ratios: ResultadoRatio[];
}

// ─── Datos de ejemplo ────────────────────────────────────────────────────────
// Empresa manufacturera mediana (cifras en €). Balance cuadrado: AT = PN + PT = 2.400.000

const DATOS_EJEMPLO: InputData = {
  // Activo — AC = 860.000 / AT = 2.400.000
  inmovilizado: '1540000',
  existencias: '320000',
  deudoresComerciales: '420000',
  caja: '120000',
  // Pasivo — TPN = 1.250.000 / PC = 480.000 / PT = 1.150.000
  capitalReservas: '1070000',
  resultadoEjercicio: '180000',
  deudasLargoPlazo: '670000',
  proveedores: '280000',
  deudasCortoPlazo: '140000',
  acreedoresVarios: '60000',
  // Cuenta de Resultados — EBITDA = 650.000 / EBIT = 290.000
  ventas: '3200000',
  compras: '1800000',
  otrosGastos: '750000',
  amortizaciones: '360000',
  gastosFinancieros: '65000',
  resultadoNeto: '180000',
};

const ESTADO_LABEL: Record<EstadoRatio, string> = {
  critico: 'Crítico',
  adecuado: 'Adecuado',
  holgado: 'Holgado',
  nd: 'Sin datos',
};

// ─── Interpretación DuPont (motor dominante del ROE) ───────────────────────────

type MotorDuPont = 'margen' | 'rotacion' | 'apalancamiento';

const INTERPRETACION_MOTOR: Record<MotorDuPont, string> = {
  margen: 'El ROE se apoya sobre todo en el margen: la empresa obtiene un buen beneficio por cada euro vendido. Es un modelo de diferenciación o valor añadido, menos dependiente del volumen de ventas.',
  rotacion: 'El ROE se apoya sobre todo en la rotación de activos: la empresa genera muchas ventas con relativamente pocos activos. Es un modelo de eficiencia o volumen, típico de la distribución y el retail.',
  apalancamiento: 'El ROE se apoya sobre todo en el apalancamiento financiero: la deuda multiplica la rentabilidad de los socios. Amplifica el ROE en los años buenos, pero también el riesgo si caen las ventas.',
};

// ─── Cálculo de ratios ───────────────────────────────────────────────────────

function seg(valor: number | null, umbC: number, umbH: number, meMejor: boolean): EstadoRatio {
  if (valor === null) return 'nd';
  if (meMejor) {
    return valor < umbC ? 'critico' : valor >= umbH ? 'holgado' : 'adecuado';
  }
  return valor > umbC ? 'critico' : valor <= umbH ? 'holgado' : 'adecuado';
}

function estadoPMP(v: number | null): EstadoRatio {
  if (v === null) return 'nd';
  if (v > 90) return 'critico';
  if (v >= 30) return 'holgado';
  return 'adecuado';
}

function r(num: number, den: number): number | null {
  return den === 0 ? null : num / den;
}

function formatValor(valor: number | null, formato: ResultadoRatio['formatoValor']): string {
  if (valor === null) return 'N/D';
  switch (formato) {
    case 'pct': return `${formatNumber(valor, 1)} %`;
    case 'dias': return `${formatNumber(valor, 1)} días`;
    case 'veces': return `${formatNumber(valor, 2)}x`;
    default: return formatNumber(valor, 2);
  }
}

function calcularRatios(datos: InputData): GrupoRatios[] {
  const p = (k: keyof InputData) => parseSpanishNumber(datos[k]) || 0;

  // Magnitudes del balance (calculadas)
  const inm = p('inmovilizado');
  const ex  = p('existencias');
  const dc  = p('deudoresComerciales');
  const ca  = p('caja');
  const ac  = ex + dc + ca;
  const at  = inm + ac;

  const cr  = p('capitalReservas');
  const re  = p('resultadoEjercicio');
  const pn  = cr + re;
  const dlp = p('deudasLargoPlazo');
  const pr  = p('proveedores');
  const dcp = p('deudasCortoPlazo');
  const av  = p('acreedoresVarios');
  const pc  = pr + dcp + av;
  const pt  = dlp + pc;

  // Magnitudes de la CdR (calculadas)
  const ve  = p('ventas');
  const co  = p('compras');
  const og  = p('otrosGastos');
  const am  = p('amortizaciones');
  const eb  = ve - co - og - am; // EBIT
  const gf  = p('gastosFinancieros');
  const rn  = p('resultadoNeto');

  const vLC = r(ac, pc);
  const vPA = r(ac - ex, pc);
  const vTE = r(ca, pc);
  const vRD = r(pt, pt + pn);
  const vAF = r(pn, pt);
  const vCI = r(eb, gf);
  const vROE = r(rn, pn) !== null ? r(rn, pn)! * 100 : null;
  const vROA = r(rn, at) !== null ? r(rn, at)! * 100 : null;
  const vMN  = r(rn, ve) !== null ? r(rn, ve)! * 100 : null;
  const vRA  = r(ve, at);
  const vPMC = r(dc, ve) !== null ? r(dc, ve)! * 365 : null;
  const vPMP = r(pr, co) !== null ? r(pr, co)! * 365 : null;

  return [
    {
      id: 'liquidez',
      nombre: 'Liquidez',
      icono: '💧',
      colorVar: 'var(--primary)',
      ratios: [
        {
          id: 'lc', nombre: 'Liquidez Corriente',
          valor: vLC, estado: seg(vLC, 1, 2, true),
          formula: 'Activo Corriente / Pasivo Corriente',
          rangoTexto: '< 1 crítico · 1–2 adecuado · > 2 holgado',
          interpretacion: vLC === null ? 'Sin datos suficientes.' :
            vLC < 1 ? 'El activo corriente no cubre el pasivo a corto plazo. Posible tensión de liquidez.' :
            vLC <= 2 ? 'La empresa cubre sus deudas a corto plazo con margen equilibrado.' :
            'Amplia cobertura de deudas a corto plazo. Valores muy altos pueden indicar activos poco productivos.',
          formatoValor: 'ratio',
        },
        {
          id: 'pa', nombre: 'Prueba Ácida',
          valor: vPA, estado: seg(vPA, 0.8, 1.2, true),
          formula: '(Activo Corriente − Existencias) / Pasivo Corriente',
          rangoTexto: '< 0,8 crítico · 0,8–1,2 adecuado · > 1,2 holgado',
          interpretacion: vPA === null ? 'Sin datos suficientes.' :
            vPA < 0.8 ? 'Sin contar el stock, la liquidez es baja. Dependencia elevada de existencias para afrontar pagos.' :
            vPA <= 1.2 ? 'Buena liquidez inmediata sin necesidad de liquidar existencias.' :
            'La empresa puede cubrir sus deudas a corto plazo incluso sin vender ningún stock.',
          formatoValor: 'ratio',
        },
        {
          id: 'te', nombre: 'Ratio de Tesorería',
          valor: vTE, estado: seg(vTE, 0.1, 0.3, true),
          formula: 'Caja / Pasivo Corriente',
          rangoTexto: '< 0,1 crítico · 0,1–0,3 adecuado · > 0,3 holgado',
          interpretacion: vTE === null ? 'Sin datos suficientes.' :
            vTE < 0.1 ? 'Efectivo muy escaso en relación a las deudas inmediatas. Riesgo de tensiones de caja.' :
            vTE <= 0.3 ? 'El efectivo cubre una fracción razonable de las obligaciones a corto plazo.' :
            'La empresa dispone de efectivo suficiente para cubrir buena parte de sus deudas inmediatas.',
          formatoValor: 'ratio',
        },
      ],
    },
    {
      id: 'endeudamiento',
      nombre: 'Endeudamiento',
      icono: '⚖️',
      colorVar: 'var(--color-endeud)',
      ratios: [
        {
          id: 'rd', nombre: 'Ratio de Endeudamiento',
          valor: vRD, estado: seg(vRD, 0.7, 0.4, false),
          formula: 'Pasivo Total / (Pasivo Total + Patrimonio Neto)',
          rangoTexto: '> 0,7 crítico · 0,4–0,7 adecuado · < 0,4 holgado',
          interpretacion: vRD === null ? 'Sin datos suficientes.' :
            vRD > 0.7 ? 'Empresa muy endeudada: la financiación ajena supera el 70 % del total. Mayor riesgo financiero.' :
            vRD >= 0.4 ? 'Equilibrio razonable entre recursos propios y deuda externa.' :
            'Empresa financiada principalmente con recursos propios. Baja dependencia de deuda.',
          formatoValor: 'ratio',
        },
        {
          id: 'af', nombre: 'Autonomía Financiera',
          valor: vAF, estado: seg(vAF, 0.5, 1.5, true),
          formula: 'Patrimonio Neto / Pasivo Total',
          rangoTexto: '< 0,5 crítico · 0,5–1,5 adecuado · > 1,5 holgado',
          interpretacion: vAF === null ? 'Sin datos suficientes.' :
            vAF < 0.5 ? 'Los recursos propios son menos de la mitad de la deuda total. Alta dependencia financiera externa.' :
            vAF <= 1.5 ? 'Relación equilibrada entre fondos propios y deuda.' :
            'Los recursos propios superan ampliamente la deuda. Alta independencia financiera.',
          formatoValor: 'ratio',
        },
        {
          id: 'ci', nombre: 'Cobertura de Intereses',
          valor: vCI, estado: seg(vCI, 2, 5, true),
          formula: 'EBIT / Gastos Financieros',
          rangoTexto: '< 2x crítico · 2–5x adecuado · > 5x holgado',
          interpretacion: vCI === null ? 'Sin datos o sin deuda financiera.' :
            vCI < 2 ? 'El beneficio operativo apenas cubre los gastos financieros. Alta vulnerabilidad ante caídas de ventas.' :
            vCI <= 5 ? 'El resultado operativo cubre los intereses con holgura razonable.' :
            'Excelente cobertura de intereses. La deuda financiera no supone presión sobre el negocio.',
          formatoValor: 'veces',
        },
      ],
    },
    {
      id: 'rentabilidad',
      nombre: 'Rentabilidad',
      icono: '📈',
      colorVar: 'var(--secondary)',
      ratios: [
        {
          id: 'roe', nombre: 'ROE',
          valor: vROE, estado: seg(vROE, 5, 15, true),
          formula: 'Resultado Neto / Patrimonio Neto × 100',
          rangoTexto: '< 5 % crítico · 5–15 % adecuado · > 15 % holgado',
          interpretacion: vROE === null ? 'Sin datos suficientes.' :
            vROE < 5 ? 'La rentabilidad del capital propio es baja. Puede ser inferior a la inflación o al coste de oportunidad.' :
            vROE <= 15 ? 'Rentabilidad del capital propio saludable para la mayoría de sectores.' :
            'Alta rentabilidad sobre recursos propios. La empresa crea valor significativo para sus socios.',
          formatoValor: 'pct',
        },
        {
          id: 'roa', nombre: 'ROA',
          valor: vROA, estado: seg(vROA, 2, 8, true),
          formula: 'Resultado Neto / Activo Total × 100',
          rangoTexto: '< 2 % crítico · 2–8 % adecuado · > 8 % holgado',
          interpretacion: vROA === null ? 'Sin datos suficientes.' :
            vROA < 2 ? 'Los activos de la empresa generan una rentabilidad muy escasa.' :
            vROA <= 8 ? 'La empresa obtiene un retorno razonable de sus activos totales.' :
            'Excelente aprovechamiento de los activos para generar beneficio.',
          formatoValor: 'pct',
        },
        {
          id: 'mn', nombre: 'Margen Neto',
          valor: vMN, estado: seg(vMN, 3, 10, true),
          formula: 'Resultado Neto / Ventas × 100',
          rangoTexto: '< 3 % crítico · 3–10 % adecuado · > 10 % holgado',
          interpretacion: vMN === null ? 'Sin datos suficientes.' :
            vMN < 3 ? 'Margen muy ajustado. Cualquier aumento de costes o caída de ventas puede generar pérdidas.' :
            vMN <= 10 ? 'Margen neto saludable para empresas industriales y de distribución.' :
            'Margen neto elevado, propio de sectores con alta diferenciación de producto o servicios.',
          formatoValor: 'pct',
        },
      ],
    },
    {
      id: 'gestion',
      nombre: 'Gestión',
      icono: '⚙️',
      colorVar: 'var(--color-gestion)',
      ratios: [
        {
          id: 'ra', nombre: 'Rotación de Activos',
          valor: vRA, estado: seg(vRA, 0.5, 1.5, true),
          formula: 'Ventas / Activo Total',
          rangoTexto: '< 0,5x crítico · 0,5–1,5x adecuado · > 1,5x holgado',
          interpretacion: vRA === null ? 'Sin datos suficientes.' :
            vRA < 0.5 ? 'Los activos generan pocas ventas. Posible sobredimensionamiento o baja utilización del inmovilizado.' :
            vRA <= 1.5 ? 'Rotación propia de empresas industriales o de servicios profesionales.' :
            'Alta eficiencia en el uso de activos. Típico de distribución, retail o modelos de negocio ligeros.',
          formatoValor: 'veces',
        },
        {
          id: 'pmc', nombre: 'PMC — Período Medio de Cobro',
          valor: vPMC, estado: seg(vPMC, 90, 45, false),
          formula: '(Deudores Comerciales / Ventas) × 365',
          rangoTexto: '> 90 días crítico · 45–90 días adecuado · < 45 días holgado',
          interpretacion: vPMC === null ? 'Sin datos suficientes.' :
            vPMC > 90 ? 'Los clientes tardan más de 3 meses en pagar. Posible necesidad de financiación adicional del ciclo de explotación.' :
            vPMC >= 45 ? 'Período de cobro habitual en ventas B2B. Adecuado si está en línea con el sector.' :
            'Los clientes pagan rápido. Muy positivo para la liquidez de la empresa.',
          formatoValor: 'dias',
        },
        {
          id: 'pmp', nombre: 'PMP — Período Medio de Pago',
          valor: vPMP, estado: estadoPMP(vPMP),
          formula: '(Proveedores / Compras) × 365',
          rangoTexto: '< 30 días adecuado · 30–60 días holgado · > 90 días crítico',
          interpretacion: vPMP === null ? 'Sin datos suficientes.' :
            vPMP > 90 ? 'Período de pago muy elevado. Posible señal de dificultades de liquidez o incumplimiento de plazos legales (Ley 15/2010 en España: máx. 60 días).' :
            vPMP >= 30 ? 'La empresa aprovecha bien el crédito de proveedores como fuente de financiación espontánea.' :
            'La empresa paga muy rápido. Reduce la liquidez disponible aunque mantiene buenas relaciones con proveedores.',
          formatoValor: 'dias',
        },
      ],
    },
  ];
}

// ─── Utilidades de presentación ──────────────────────────────────────────────

function fmt(n: number) {
  return n > 0 ? `${formatNumber(n, 0)} €` : '—';
}

// ─── Componente de campo de entrada ──────────────────────────────────────────

interface CampoInputProps {
  label: string;
  campo: keyof InputData;
  valor: string;
  onChange: (campo: keyof InputData, valor: string) => void;
  signo?: string;
}

function CampoInput({ label, campo, valor, onChange, signo }: CampoInputProps) {
  const [enfocado, setEnfocado] = useState(false);
  const numerico = parseSpanishNumber(valor) || 0;
  const displayValor = enfocado ? valor : (numerico > 0 ? formatNumber(numerico, 0) : '');

  return (
    <div className={styles.campoInput}>
      <label htmlFor={`input-${campo}`} className={styles.campoLabel}>
        {signo && <span className={styles.campoSigno}>{signo}</span>}
        {label}
      </label>
      <div className={styles.campoInputWrapper}>
        <span className={styles.campoSufijo}>€</span>
        <input
          id={`input-${campo}`}
          type="text"
          inputMode="numeric"
          className={styles.campoInputField}
          value={displayValor}
          placeholder="0"
          onFocus={() => setEnfocado(true)}
          onBlur={(e) => {
            setEnfocado(false);
            const n = parseSpanishNumber(e.target.value) || 0;
            onChange(campo, n.toString());
          }}
          onChange={e => onChange(campo, e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Fila de total calculado ──────────────────────────────────────────────────

interface FilaCalculadaProps {
  label: string;
  valor: number;
  variante?: 'normal' | 'subtotal' | 'total' | 'ebitda' | 'ebit' | 'rai';
}

function FilaCalculada({ label, valor, variante = 'normal' }: FilaCalculadaProps) {
  const claseVariante = variante !== 'normal' ? (styles[`filaCalc_${variante}`] || '') : '';
  return (
    <div className={`${styles.filaCalculada} ${claseVariante}`}>
      <span className={styles.filaCalcLabel}>{label}</span>
      <span className={styles.filaCalcValor}>{fmt(valor)}</span>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AnalizadorRatiosFinancierosPage() {
  const [datos, setDatos] = useState<InputData>(DATOS_EJEMPLO);

  const grupos = calcularRatios(datos);

  const actualizarCampo = (campo: keyof InputData, valor: string) =>
    setDatos(prev => ({ ...prev, [campo]: valor }));

  const resetearEjemplo = () => setDatos(DATOS_EJEMPLO);

  const totalRatios = grupos.flatMap(g => g.ratios);
  const criticos = totalRatios.filter(r => r.estado === 'critico').length;
  const holgados = totalRatios.filter(r => r.estado === 'holgado').length;

  // Magnitudes calculadas para mostrar en el panel de datos
  const p = (k: keyof InputData) => parseSpanishNumber(datos[k]) || 0;
  const activoCorriente = p('existencias') + p('deudoresComerciales') + p('caja');
  const activoTotal     = p('inmovilizado') + activoCorriente;
  const patrimonioNeto  = p('capitalReservas') + p('resultadoEjercicio');
  const pasivoCorriente = p('proveedores') + p('deudasCortoPlazo') + p('acreedoresVarios');
  const pasivoTotal     = p('deudasLargoPlazo') + pasivoCorriente;
  const pnYPasivo       = patrimonioNeto + pasivoTotal;
  const ebitda          = p('ventas') - p('compras') - p('otrosGastos');
  const ebit            = ebitda - p('amortizaciones');
  const rai             = ebit - p('gastosFinancieros');
  const cuadra          = activoTotal > 0 && Math.abs(activoTotal - pnYPasivo) <= activoTotal * 0.005;

  // ── Descomposición DuPont del ROE ──
  // ROE = (Rdo. Neto / Ventas) × (Ventas / Activo) × (Activo / Patrimonio Neto) = Rdo. Neto / Patrimonio Neto
  const ventas          = p('ventas');
  const resultadoNeto   = p('resultadoNeto');
  const dupontValido    = ventas > 0 && activoTotal > 0 && patrimonioNeto > 0;
  const dpMargen        = dupontValido ? resultadoNeto / ventas : 0;        // decimal
  const dpRotacion      = dupontValido ? ventas / activoTotal : 0;          // veces
  const dpApalancamiento = dupontValido ? activoTotal / patrimonioNeto : 0; // veces
  const dpRoe           = dpMargen * dpRotacion * dpApalancamiento;         // decimal
  // Motor dominante: factor más por encima de su valor de referencia neutro
  const motoresDuPont: { id: MotorDuPont; fuerza: number }[] = [
    { id: 'margen', fuerza: dpMargen / 0.05 },
    { id: 'rotacion', fuerza: dpRotacion / 1.0 },
    { id: 'apalancamiento', fuerza: dpApalancamiento / 2.0 },
  ];
  const motorDominante = motoresDuPont.reduce((a, b) => (b.fuerza > a.fuerza ? b : a)).id;
  const apalancamientoAlto = dpApalancamiento > 3;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📊</span> Analizador de Ratios Financieros</h1>
        <p className={styles.subtitle}>
          12 ratios clave con semáforo de interpretación: liquidez, endeudamiento, rentabilidad y gestión
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="analizador-ratios-financieros"
        collapsible={false}
      />

      {/* ── Panel de datos ── */}
      <section className={styles.inputsSection} aria-label="Datos financieros de la empresa">
        <div className={styles.inputsHeader}>
          <h2 className={styles.inputsTitulo}>Datos financieros de la empresa</h2>
          <button type="button" className={styles.btnReset} onClick={resetearEjemplo}>
            <span aria-hidden="true">↩</span> Restablecer ejemplo
          </button>
        </div>
        <p className={styles.inputsNota}>
          Los datos precargados corresponden a una empresa industrial mediana de ejemplo. Sustitúyelos por los de tu empresa para obtener el análisis real.
        </p>

        {/* Balance de Situación en 2 columnas */}
        <div className={styles.balanceGrid}>
          {/* ── Activo ── */}
          <div className={styles.balanceColumna}>
            <span className={styles.inputsBloqueLabel}>ACTIVO</span>
            <CampoInput label="Inmovilizado" campo="inmovilizado" valor={datos.inmovilizado} onChange={actualizarCampo} />
            <CampoInput label="Existencias" campo="existencias" valor={datos.existencias} onChange={actualizarCampo} />
            <CampoInput label="Deudores comerciales" campo="deudoresComerciales" valor={datos.deudoresComerciales} onChange={actualizarCampo} />
            <CampoInput label="Caja" campo="caja" valor={datos.caja} onChange={actualizarCampo} />
            <FilaCalculada label="Total activo corriente" valor={activoCorriente} variante="subtotal" />
            <FilaCalculada label="Total activo" valor={activoTotal} variante="total" />
          </div>

          {/* ── Pasivo y Patrimonio Neto ── */}
          <div className={styles.balanceColumna}>
            <span className={styles.inputsBloqueLabel}>PATRIMONIO NETO Y PASIVO</span>
            <CampoInput label="Capital y Reservas" campo="capitalReservas" valor={datos.capitalReservas} onChange={actualizarCampo} />
            <CampoInput label="Resultado del ejercicio" campo="resultadoEjercicio" valor={datos.resultadoEjercicio} onChange={actualizarCampo} />
            <FilaCalculada label="Total Patrimonio Neto" valor={patrimonioNeto} variante="subtotal" />
            <CampoInput label="Deudas a largo plazo" campo="deudasLargoPlazo" valor={datos.deudasLargoPlazo} onChange={actualizarCampo} />
            <CampoInput label="Proveedores" campo="proveedores" valor={datos.proveedores} onChange={actualizarCampo} />
            <CampoInput label="Deudas a corto plazo" campo="deudasCortoPlazo" valor={datos.deudasCortoPlazo} onChange={actualizarCampo} />
            <CampoInput label="Acreedores varios" campo="acreedoresVarios" valor={datos.acreedoresVarios} onChange={actualizarCampo} />
            <FilaCalculada label="Total pasivo corriente" valor={pasivoCorriente} variante="subtotal" />
            <FilaCalculada label="Total Patrimonio Neto y Pasivo" valor={pnYPasivo} variante="total" />
          </div>
        </div>

        {/* Verificación de cuadre */}
        {activoTotal > 0 && (
          <div className={`${styles.cuadreBadge} ${cuadra ? styles.cuadreOk : styles.cuadreKo}`}>
            <span aria-hidden="true">{cuadra ? '✓' : '⚠'}</span>
            {cuadra
              ? `Balance cuadrado — Activo = PN + Pasivo = ${formatNumber(activoTotal, 0)} €`
              : `Desajuste: Activo ${formatNumber(activoTotal, 0)} € ≠ PN + Pasivo ${formatNumber(pnYPasivo, 0)} €`}
          </div>
        )}

        {/* Cuenta de Resultados — cascada completa */}
        <div className={styles.plSection}>
          <span className={styles.inputsBloqueLabel}>CUENTA DE RESULTADOS</span>

          <div className={styles.plCascada}>
            <CampoInput label="Ventas / Cifra de Negocio" campo="ventas" valor={datos.ventas} onChange={actualizarCampo} />
            <CampoInput label="Compras / Coste de ventas" campo="compras" valor={datos.compras} onChange={actualizarCampo} signo="−" />
            <CampoInput label="Otros Gastos de Explotación" campo="otrosGastos" valor={datos.otrosGastos} onChange={actualizarCampo} signo="−" />
            <FilaCalculada label="= EBITDA" valor={ebitda} variante="ebitda" />
            <CampoInput label="Amortizaciones" campo="amortizaciones" valor={datos.amortizaciones} onChange={actualizarCampo} signo="−" />
            <FilaCalculada label="= EBIT — Resultado Operativo" valor={ebit} variante="ebit" />
            <CampoInput label="Gastos Financieros" campo="gastosFinancieros" valor={datos.gastosFinancieros} onChange={actualizarCampo} signo="−" />
            <FilaCalculada label="= Resultado antes de impuestos" valor={rai} variante="rai" />
            <CampoInput label="Resultado Neto" campo="resultadoNeto" valor={datos.resultadoNeto} onChange={actualizarCampo} />
          </div>
        </div>
      </section>

      {/* ── Resumen global ── */}
      <div className={styles.resumenGlobal}>
        <div className={styles.resumenItem}>
          <span className={styles.resumenNum}>{totalRatios.length}</span>
          <span className={styles.resumenLabel}>ratios calculados</span>
        </div>
        <div className={`${styles.resumenItem} ${criticos > 0 ? styles.resumenCritico : ''}`}>
          <span className={styles.resumenNum}>{criticos}</span>
          <span className={styles.resumenLabel}>{criticos === 1 ? 'crítico' : 'críticos'}</span>
        </div>
        <div className={`${styles.resumenItem} ${holgados >= 8 ? styles.resumenHolgado : ''}`}>
          <span className={styles.resumenNum}>{holgados}</span>
          <span className={styles.resumenLabel}>{holgados === 1 ? 'holgado' : 'holgados'}</span>
        </div>
      </div>

      {/* ── Resultados por grupo ── */}
      {grupos.map(grupo => (
        <section key={grupo.id} className={styles.grupoSeccion} aria-label={`Ratios de ${grupo.nombre}`}>
          <div className={styles.grupoHeader} style={{ borderLeftColor: grupo.colorVar }}>
            <span aria-hidden="true" className={styles.grupoIcono}>{grupo.icono}</span>
            <h2 className={styles.grupoTitulo}>{grupo.nombre}</h2>
          </div>
          <div className={styles.ratiosGrid}>
            {grupo.ratios.map(ratio => (
              <article key={ratio.id} className={`${styles.ratioCard} ${styles[`estado${ratio.estado.charAt(0).toUpperCase()}${ratio.estado.slice(1)}`]}`}>
                <div className={styles.ratioNombre}>{ratio.nombre}</div>
                <div className={styles.ratioValor}>{formatValor(ratio.valor, ratio.formatoValor)}</div>
                <div className={`${styles.semaforoBadge} ${styles[`badge${ratio.estado.charAt(0).toUpperCase()}${ratio.estado.slice(1)}`]}`}>
                  {ESTADO_LABEL[ratio.estado]}
                </div>
                <div className={styles.ratioFormula}><strong>Fórmula:</strong> {ratio.formula}</div>
                <div className={styles.ratioRango}><strong>Rangos:</strong> {ratio.rangoTexto}</div>
                <p className={styles.ratioInterpretacion}>{ratio.interpretacion}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* ── Descomposición DuPont del ROE ── */}
      <section className={styles.dupontSeccion} aria-label="Descomposición DuPont del ROE">
        <div className={styles.grupoHeader} style={{ borderLeftColor: 'var(--secondary)' }}>
          <span aria-hidden="true" className={styles.grupoIcono}>🧬</span>
          <h2 className={styles.grupoTitulo}>Descomposición DuPont del ROE</h2>
        </div>
        <p className={styles.dupontIntro}>
          El método DuPont desglosa la rentabilidad financiera (ROE) en tres palancas: cuánto ganas por cada venta
          (<strong>margen</strong>), cuántas ventas generas con tus activos (<strong>rotación</strong>) y cuánto multiplica
          la deuda tu rentabilidad (<strong>apalancamiento</strong>). Revela <em>de dónde</em> nace realmente el ROE.
        </p>

        {dupontValido ? (
          <>
            <div className={styles.dupontFlujo}>
              <div className={styles.dupontFactor}>
                <span className={styles.dupontFactorValor}>{formatNumber(dpMargen * 100, 1)} %</span>
                <span className={styles.dupontFactorNombre}>Margen Neto</span>
                <span className={styles.dupontFactorFormula}>Rdo. Neto / Ventas</span>
                <span className={styles.dupontFactorDesc}>Beneficio por euro vendido</span>
              </div>
              <span className={styles.dupontOp} aria-hidden="true">×</span>
              <div className={styles.dupontFactor}>
                <span className={styles.dupontFactorValor}>{formatNumber(dpRotacion, 2)}x</span>
                <span className={styles.dupontFactorNombre}>Rotación de Activos</span>
                <span className={styles.dupontFactorFormula}>Ventas / Activo Total</span>
                <span className={styles.dupontFactorDesc}>Eficiencia en el uso de activos</span>
              </div>
              <span className={styles.dupontOp} aria-hidden="true">×</span>
              <div className={styles.dupontFactor}>
                <span className={styles.dupontFactorValor}>{formatNumber(dpApalancamiento, 2)}x</span>
                <span className={styles.dupontFactorNombre}>Apalancamiento</span>
                <span className={styles.dupontFactorFormula}>Activo Total / Patrimonio Neto</span>
                <span className={styles.dupontFactorDesc}>Multiplicador de la deuda</span>
              </div>
              <span className={styles.dupontOp} aria-hidden="true">=</span>
              <div className={`${styles.dupontFactor} ${styles.dupontResultado}`}>
                <span className={styles.dupontFactorValor}>{formatNumber(dpRoe * 100, 1)} %</span>
                <span className={styles.dupontFactorNombre}>ROE</span>
                <span className={styles.dupontFactorFormula}>Rdo. Neto / Patrimonio Neto</span>
                <span className={styles.dupontFactorDesc}>Rentabilidad para los socios</span>
              </div>
            </div>

            <div className={styles.dupontInterpretacion}>
              <strong>¿De dónde viene este ROE?</strong>
              <p>{INTERPRETACION_MOTOR[motorDominante]}</p>
              {apalancamientoAlto && (
                <p className={styles.dupontAviso}>
                  <span aria-hidden="true">⚠️</span> El apalancamiento es elevado ({formatNumber(dpApalancamiento, 2)}x):
                  un ROE alto sostenido por mucha deuda es más frágil. Contrástalo con el ratio de endeudamiento y la
                  cobertura de intereses de arriba.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className={styles.dupontVacio}>
            Introduce ventas, activo total y patrimonio neto (todos mayores que cero) para ver la descomposición DuPont.
          </p>
        )}
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="📚 Guía de ratios financieros"
        subtitle="Aprende a interpretar los indicadores clave de un balance"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Resumen de los 12 ratios</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Ratio</th>
                  <th>Fórmula simplificada</th>
                  <th>Crítico</th>
                  <th>Adecuado</th>
                  <th>Holgado</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} className={styles.tablaGrupo}>LIQUIDEZ</td></tr>
                <tr><td>Liquidez Corriente</td><td>AC / PC</td><td>&lt; 1</td><td>1 – 2</td><td>&gt; 2</td></tr>
                <tr><td>Prueba Ácida</td><td>(AC − Existencias) / PC</td><td>&lt; 0,8</td><td>0,8 – 1,2</td><td>&gt; 1,2</td></tr>
                <tr><td>Ratio de Tesorería</td><td>Caja / PC</td><td>&lt; 0,1</td><td>0,1 – 0,3</td><td>&gt; 0,3</td></tr>
                <tr><td colSpan={5} className={styles.tablaGrupo}>ENDEUDAMIENTO</td></tr>
                <tr><td>Ratio de Endeudamiento</td><td>PT / (PT + PN)</td><td>&gt; 0,7</td><td>0,4 – 0,7</td><td>&lt; 0,4</td></tr>
                <tr><td>Autonomía Financiera</td><td>PN / PT</td><td>&lt; 0,5</td><td>0,5 – 1,5</td><td>&gt; 1,5</td></tr>
                <tr><td>Cobertura de Intereses</td><td>EBIT / G. Financieros</td><td>&lt; 2x</td><td>2 – 5x</td><td>&gt; 5x</td></tr>
                <tr><td colSpan={5} className={styles.tablaGrupo}>RENTABILIDAD</td></tr>
                <tr><td>ROE</td><td>Resultado Neto / PN × 100</td><td>&lt; 5 %</td><td>5 – 15 %</td><td>&gt; 15 %</td></tr>
                <tr><td>ROA</td><td>Resultado Neto / AT × 100</td><td>&lt; 2 %</td><td>2 – 8 %</td><td>&gt; 8 %</td></tr>
                <tr><td>Margen Neto</td><td>Resultado Neto / Ventas × 100</td><td>&lt; 3 %</td><td>3 – 10 %</td><td>&gt; 10 %</td></tr>
                <tr><td colSpan={5} className={styles.tablaGrupo}>GESTIÓN</td></tr>
                <tr><td>Rotación de Activos</td><td>Ventas / AT</td><td>&lt; 0,5x</td><td>0,5 – 1,5x</td><td>&gt; 1,5x</td></tr>
                <tr><td>PMC</td><td>(Deudores / Ventas) × 365</td><td>&gt; 90 días</td><td>45 – 90 días</td><td>&lt; 45 días</td></tr>
                <tr><td>PMP</td><td>(Proveedores / Compras) × 365</td><td>&gt; 90 días</td><td>30 – 60 días</td><td>30 – 60 días</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa el análisis de ratios?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏦</span>
              <h3>Entidad financiera</h3>
              <p>Los bancos analizan liquidez y endeudamiento antes de conceder un préstamo. Un ratio de deuda alto o una cobertura de intereses baja pueden bloquear la financiación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📉</span>
              <h3>Inversor particular</h3>
              <p>Compara ROE, ROA y margen neto entre empresas del mismo sector para identificar las más eficientes antes de invertir en bolsa o en capital privado.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍💼</span>
              <h3>Director financiero</h3>
              <p>Monitoriza trimestralmente los ratios de gestión (PMC, PMP) para detectar deterioros en el cobro a clientes o cambios en las condiciones de proveedores.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h3>Estudiante de empresa</h3>
              <p>Practica el análisis de cuentas anuales de empresas reales: descarga el balance de la CNMV o del Registro Mercantil e introdúcelo aquí para calcular los ratios.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Dónde encuentro los datos para calcular los ratios?</dt>
              <dd>
                En las cuentas anuales de la empresa, que en España son de acceso público a través del Registro Mercantil (registradores.es) o, para empresas cotizadas, en la CNMV. Los balances de pymes también están disponibles en el SABI o en servicios como Infoempresa.
                <span className={styles.faqTip}>Si usas un software contable, todos estos datos están en el balance de situación y en la cuenta de pérdidas y ganancias.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Un ratio "crítico" significa que la empresa va a quebrar?</dt>
              <dd>
                No necesariamente. Un ratio aislado en zona crítica es una señal de alerta, no un diagnóstico. Hay que analizar la tendencia (¿mejora o empeora?), comparar con el sector (algunos tienen ratios estructuralmente distintos) y evaluar el conjunto. Una empresa puede tener liquidez baja pero alta rentabilidad y acceso sencillo a crédito.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué el EBIT y no el beneficio neto para la cobertura de intereses?</dt>
              <dd>
                El EBIT (beneficio antes de intereses e impuestos) refleja el resultado del negocio operativo antes de que entren los gastos financieros. Usarlo en el numerador mide cuánto genera el negocio "por sí solo" para pagar los intereses, sin que el resultado esté ya descontado por ellos. Es el indicador más limpio de capacidad de pago de deuda financiera.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre ROE y ROA?</dt>
              <dd>
                El <strong>ROA</strong> mide la rentabilidad de todos los activos (propios y financiados con deuda), indicando qué tan bien usa la empresa sus recursos totales. El <strong>ROE</strong> mide solo la rentabilidad del capital de los accionistas. Si ROE {'>'} ROA, la deuda está "amplificando" la rentabilidad (apalancamiento positivo). Si ROA cae por debajo del coste de la deuda, el endeudamiento destruye valor.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el análisis DuPont y para qué sirve?</dt>
              <dd>
                Es una técnica creada en los años 20 por la empresa DuPont que descompone el ROE en tres factores multiplicativos: <strong>margen neto</strong> (Rdo. Neto / Ventas), <strong>rotación de activos</strong> (Ventas / Activo) y <strong>apalancamiento financiero</strong> (Activo / Patrimonio Neto). Al multiplicarlos se recupera el ROE, pero ahora sabes <em>de dónde</em> nace: dos empresas con el mismo ROE del 15 % pueden lograrlo de formas opuestas, una con mucho margen y poca deuda y otra con margen ajustado pero mucho apalancamiento. Lo segundo rinde igual, pero con más riesgo.
                <span className={styles.faqTip}>El bloque «Descomposición DuPont del ROE» de esta herramienta hace este desglose automáticamente con tus datos.</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo el PMP alto es bueno y cuándo es malo?</dt>
              <dd>
                Un PMP de 30-60 días es óptimo: la empresa aprovecha el crédito comercial como financiación gratuita. Por encima de 60 días en España se incumple la Ley 15/2010 de morosidad, lo que puede generar reclamaciones. Por encima de 90 días es señal de problemas de liquidez. Un PMP muy bajo ({"<"} 30 días) no es necesariamente malo, pero implica que la empresa paga antes de aprovechar el plazo disponible.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer un análisis financiero básico</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Obtén las cuentas anuales</strong>
                <p>Descarga el balance de situación y la cuenta de pérdidas y ganancias del año que quieres analizar. Busca mínimo dos ejercicios para ver tendencias.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Introduce los datos en la herramienta</strong>
                <p>Rellena los campos del Activo, el Pasivo y la Cuenta de Resultados. Los totales (Activo Total, Patrimonio Neto, EBITDA, EBIT…) se calculan automáticamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Verifica que el balance cuadra</strong>
                <p>El indicador de cuadre confirma que Activo Total = Patrimonio Neto + Pasivo. Si no cuadra, revisa si has omitido alguna partida o introducido alguna cifra incorrecta.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Analiza los ratios por grupos</strong>
                <p>Empieza por liquidez (¿puede pagar a corto plazo?), sigue por endeudamiento (¿cuánta deuda tiene?) y cierra con rentabilidad y gestión.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Compara con el sector y con años anteriores</strong>
                <p>Los rangos orientativos son generales. El verdadero análisis surge al comparar con empresas similares y con la evolución histórica propia.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas en el análisis de balances</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <p><strong>Analiza en serie histórica:</strong> un ratio aislado dice poco. La tendencia de tres años revela si la empresa mejora o se deteriora.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏭</span>
              <p><strong>Compara dentro del mismo sector:</strong> distribución, industria pesada, tecnología y retail tienen estructuras financieras muy distintas. No uses los mismos rangos para todos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <p><strong>Lee los ratios de forma conjunta:</strong> ROE alto con endeudamiento elevado puede ser apalancamiento positivo o riesgo encubierto. Nunca interpretes un ratio de forma aislada.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <p><strong>Lee el informe de auditoría:</strong> los ratios se basan en los números del balance, pero si hay salvedades de auditoría, esos números pueden no reflejar la realidad.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al interpretar ratios financieros</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Usar ratios sin contexto sectorial:</strong> un endeudamiento del 80 % es normal en banca pero preocupante en una empresa de servicios. Los rangos de esta herramienta son orientativos para empresas no financieras.</li>
              <li><strong>Confundir beneficio con liquidez:</strong> una empresa puede ser muy rentable y tener problemas de caja si cobra tarde y paga pronto. Beneficio y liquidez son dimensiones distintas.</li>
              <li><strong>Ignorar la estacionalidad:</strong> empresas turísticas, agrícolas o con picos de demanda tienen balances muy distintos según el momento del año. Un balance de diciembre puede no ser representativo.</li>
              <li><strong>Tomar el PMC/PMP de ventas totales con IVA:</strong> los deudores y proveedores del balance incluyen IVA; las ventas y compras de la cuenta de resultados no. Usa cifras homogéneas (ambas con IVA o ambas sin IVA) para no distorsionar los períodos medios.</li>
              <li><strong>Olvidar los pasivos contingentes:</strong> avales, litigios pendientes o deuda fuera de balance no aparecen en los ratios pero sí afectan al riesgo real de la empresa.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-ratios-financieros')} />
      <ShareCard appName="analizador-ratios-financieros" />
      <Footer appName="analizador-ratios-financieros" />
    </div>
  );
}
