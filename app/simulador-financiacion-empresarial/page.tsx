'use client';

import { useState, useCallback } from 'react';
import styles from './SimuladorFinanciacionEmpresarial.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  TIPOS_IS_2025,
  TRAMOS_IS_MICROPYMES_2026,
  FISCAL_SOCIEDADES_META,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InputData {
  inversion: string;
  plazoAnios: string;
  // Préstamo bancario
  tinPrestamo: string;
  comisionApertura: string;
  // Leasing
  tinLeasing: string;
  valorResidual: string;        // % sobre la inversión
  // Ampliación de capital
  dilucion: string;             // % de la empresa cedido
  costeFondosPropios: string;   // % anual exigido por el socio
}

type TipoEmpresaKey = 'nuevaCreacion' | 'micropyme' | 'general';

interface ResultadoVia {
  id: 'prestamo' | 'leasing' | 'capital';
  nombre: string;
  icono: string;
  color: string;
  costeBruto: number;        // coste financiero antes de impuestos (intereses + comisiones / coste de oportunidad)
  escudoFiscal: number;      // ahorro de IS por deducibilidad
  costeNeto: number;         // costeBruto − escudoFiscal
  salidaCajaPlazo: number;   // desembolso total durante el plazo (impacto en tesorería)
  cuotaMensual: number;      // 0 en ampliación de capital
  dilucion: number;          // % de propiedad cedida (solo capital)
  aumentaDeuda: boolean;     // efecto sobre el endeudamiento
  notaClave: string;
}

// ─── Tipos de empresa (escudo fiscal — marginal IS) ─────────────────────────────
// Importado de data/fiscal/sociedades.ts (Ley 7/2024). El escudo fiscal de un gasto
// adicional se aplica al tipo MARGINAL de la sociedad.

const TIPOS_EMPRESA: Record<TipoEmpresaKey, { label: string; tipo: number; nota: string }> = {
  nuevaCreacion: {
    label: 'Nueva creación',
    tipo: TIPOS_IS_2025.nuevaCreacion,
    nota: 'Primeros 2 años con base positiva: 15%',
  },
  micropyme: {
    label: 'Microempresa (< 1M €)',
    tipo: TRAMOS_IS_MICROPYMES_2026[TRAMOS_IS_MICROPYMES_2026.length - 1].tipo,
    nota: 'Escala 19% / 21% (Ley 7/2024). Marginal 21%',
  },
  general: {
    label: 'Empresa general',
    tipo: TIPOS_IS_2025.general,
    nota: 'Tipo general del Impuesto de Sociedades: 25%',
  },
};

const COLORES = {
  prestamo: '#2E86AB',
  leasing: '#48A9A6',
  capital: '#C0392B',
};

// ─── Datos de ejemplo ───────────────────────────────────────────────────────────

const DATOS_EJEMPLO: InputData = {
  inversion: '80000',
  plazoAnios: '5',
  tinPrestamo: '6',
  comisionApertura: '1',
  tinLeasing: '7',
  valorResidual: '5',
  dilucion: '15',
  costeFondosPropios: '12',
};

const TIPO_EJEMPLO: TipoEmpresaKey = 'general';

// ─── Lógica de cálculo ──────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return `${formatNumber(Math.round(n), 0)} €`;
}

/**
 * Cuota mensual del sistema francés con posible valor residual (balloon).
 * Si valorResidual = 0 se comporta como un préstamo francés clásico.
 */
function cuotaMensual(principal: number, tinAnual: number, meses: number, valorResidual: number): number {
  if (meses <= 0) return 0;
  const i = tinAnual / 100 / 12;
  if (i === 0) return (principal - valorResidual) / meses;
  const vrDescontado = valorResidual / Math.pow(1 + i, meses);
  return ((principal - vrDescontado) * i) / (1 - Math.pow(1 + i, -meses));
}

function calcularVias(datos: InputData, tipoEmpresa: TipoEmpresaKey): ResultadoVia[] {
  const p = (k: keyof InputData) => parseSpanishNumber(datos[k]) || 0;
  const inversion = p('inversion');
  const anios = p('plazoAnios') || 1;
  const meses = Math.round(anios * 12);
  const tipoIS = TIPOS_EMPRESA[tipoEmpresa].tipo / 100;

  // ── Préstamo bancario ──
  const comision = inversion * (p('comisionApertura') / 100);
  const cuotaPrest = cuotaMensual(inversion, p('tinPrestamo'), meses, 0);
  const totalCuotasPrest = cuotaPrest * meses;
  const interesesPrest = totalCuotasPrest - inversion;
  const costeBrutoPrest = interesesPrest + comision;
  const escudoPrest = costeBrutoPrest * tipoIS;

  // ── Leasing ──
  const vr = inversion * (p('valorResidual') / 100);
  const cuotaLeasing = cuotaMensual(inversion, p('tinLeasing'), meses, vr);
  const totalCuotasLeasing = cuotaLeasing * meses;
  const interesesLeasing = totalCuotasLeasing + vr - inversion;
  const escudoLeasing = interesesLeasing * tipoIS;

  // ── Ampliación de capital ──
  // No genera deuda ni escudo fiscal (los dividendos no son deducibles).
  // Su coste económico es la rentabilidad que el socio espera obtener sobre su aportación.
  const dilucion = p('dilucion');
  const costeOportunidadCapital = inversion * (p('costeFondosPropios') / 100) * anios;

  return [
    {
      id: 'prestamo',
      nombre: 'Préstamo bancario',
      icono: '🏦',
      color: COLORES.prestamo,
      costeBruto: costeBrutoPrest,
      escudoFiscal: escudoPrest,
      costeNeto: costeBrutoPrest - escudoPrest,
      salidaCajaPlazo: totalCuotasPrest + comision,
      cuotaMensual: cuotaPrest,
      dilucion: 0,
      aumentaDeuda: true,
      notaClave: 'Intereses y comisiones deducibles. Mantienes el 100% de la propiedad.',
    },
    {
      id: 'leasing',
      nombre: 'Leasing (arrendamiento financiero)',
      icono: '📄',
      color: COLORES.leasing,
      costeBruto: interesesLeasing,
      escudoFiscal: escudoLeasing,
      costeNeto: interesesLeasing - escudoLeasing,
      salidaCajaPlazo: totalCuotasLeasing + vr,
      cuotaMensual: cuotaLeasing,
      dilucion: 0,
      aumentaDeuda: true,
      notaClave: 'Cuota deducible y posible amortización acelerada. Opción de compra al final.',
    },
    {
      id: 'capital',
      nombre: 'Ampliación de capital',
      icono: '🤝',
      color: COLORES.capital,
      costeBruto: costeOportunidadCapital,
      escudoFiscal: 0,
      costeNeto: costeOportunidadCapital,
      salidaCajaPlazo: 0,
      cuotaMensual: 0,
      dilucion,
      aumentaDeuda: false,
      notaClave: 'Sin devolución obligatoria ni intereses, pero cedes propiedad y control.',
    },
  ];
}

// ─── Barra de coste neto comparado ──────────────────────────────────────────────

interface BarraProps {
  label: string;
  valor: number;
  globalMax: number;
  color: string;
}

function BarraCoste({ label, valor, globalMax, color }: BarraProps) {
  const width = globalMax > 0 ? `${Math.max((valor / globalMax) * 100, 1)}%` : '1%';
  return (
    <div className={styles.barraFila}>
      <span className={styles.barraLabel}>{label}</span>
      <div className={styles.barraTrack}>
        <div className={styles.barraValorBarra} style={{ width, backgroundColor: color }} />
      </div>
      <span className={styles.barraValor}>{fmtEur(valor)}</span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SimuladorFinanciacionEmpresarial() {
  const [datos, setDatos] = useState<InputData>(DATOS_EJEMPLO);
  const [tipoEmpresa, setTipoEmpresa] = useState<TipoEmpresaKey>(TIPO_EJEMPLO);
  const [rawValues, setRawValues] = useState<Partial<InputData>>({});

  const resultados = calcularVias(datos, tipoEmpresa);

  // Veredictos por prioridad
  const menorCoste = resultados.reduce((a, b) => (b.costeNeto < a.costeNeto ? b : a));
  const mejorTesoreria = resultados.reduce((a, b) => (b.salidaCajaPlazo < a.salidaCajaPlazo ? b : a));
  const conControl = resultados.filter(r => r.dilucion === 0);
  const mejorControl = conControl.reduce((a, b) => (b.costeNeto < a.costeNeto ? b : a), conControl[0]);

  const globalMaxCoste = Math.max(...resultados.map(r => r.costeNeto), 1);

  const handleFocus = useCallback((campo: keyof InputData) => {
    setRawValues(prev => ({ ...prev, [campo]: datos[campo] }));
  }, [datos]);

  const handleChange = useCallback((campo: keyof InputData, valor: string) => {
    setRawValues(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const esPorcentaje = (campo: keyof InputData): boolean =>
    campo === 'tinPrestamo' || campo === 'comisionApertura' || campo === 'tinLeasing' ||
    campo === 'valorResidual' || campo === 'dilucion' || campo === 'costeFondosPropios' ||
    campo === 'plazoAnios';

  const handleBlur = useCallback((campo: keyof InputData) => {
    const raw = rawValues[campo] ?? datos[campo];
    const parsed = parseSpanishNumber(raw);
    const normalizado = parsed != null && !isNaN(parsed)
      ? (esPorcentaje(campo) ? String(parsed) : String(Math.round(parsed)))
      : '0';
    setDatos(prev => ({ ...prev, [campo]: normalizado }));
    setRawValues(prev => {
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  }, [rawValues, datos]);

  const getDisplayValue = (campo: keyof InputData): string => {
    if (campo in rawValues) return rawValues[campo] ?? '';
    const n = parseSpanishNumber(datos[campo]) ?? 0;
    if (esPorcentaje(campo)) return String(n);
    return formatNumber(n, 0);
  };

  const resetEjemplo = () => {
    setDatos(DATOS_EJEMPLO);
    setTipoEmpresa(TIPO_EJEMPLO);
    setRawValues({});
  };

  const relatedApps = getRelatedApps('simulador-financiacion-empresarial');

  // Campos agrupados por vía para el render
  const camposComunes: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }[] = [
    { campo: 'inversion', label: 'Importe de la inversión', sufijo: '€', placeholder: '80.000' },
    { campo: 'plazoAnios', label: 'Plazo', sufijo: 'años', placeholder: '5' },
  ];
  const camposPrestamo: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }[] = [
    { campo: 'tinPrestamo', label: 'TIN del préstamo', sufijo: '%', placeholder: '6' },
    { campo: 'comisionApertura', label: 'Comisión de apertura', sufijo: '%', placeholder: '1' },
  ];
  const camposLeasing: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }[] = [
    { campo: 'tinLeasing', label: 'Tipo de interés del leasing', sufijo: '%', placeholder: '7' },
    { campo: 'valorResidual', label: 'Valor residual (opción de compra)', sufijo: '%', placeholder: '5' },
  ];
  const camposCapital: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }[] = [
    { campo: 'dilucion', label: 'Participación cedida al socio', sufijo: '%', placeholder: '15' },
    { campo: 'costeFondosPropios', label: 'Rentabilidad anual exigida por el socio', sufijo: '%', placeholder: '12' },
  ];

  const renderCampo = (c: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }) => (
    <div className={styles.campoInput} key={c.campo}>
      <label className={styles.campoLabel} htmlFor={`campo-${c.campo}`}>{c.label}</label>
      <div className={styles.campoInputWrapper}>
        <input
          id={`campo-${c.campo}`}
          type="text"
          inputMode="decimal"
          className={styles.campoInputField}
          value={getDisplayValue(c.campo)}
          onFocus={() => handleFocus(c.campo)}
          onChange={e => handleChange(c.campo, e.target.value)}
          onBlur={() => handleBlur(c.campo)}
          placeholder={c.placeholder}
        />
        <span className={styles.campoSufijo}>{c.sufijo}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚖️</span> Simulador de Financiación Empresarial
        </h1>
        <p className={styles.subtitle}>
          Compara préstamo bancario, leasing y ampliación de capital para una misma inversión.
          Analiza coste, tesorería, escudo fiscal y dilución de propiedad en una sola pantalla.
        </p>
      </header>

      <RegionBadge variant="es-data" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" collapsible={false} />
      <DataReference
        normativa="Impuesto de Sociedades 2026"
        fuente={FISCAL_SOCIEDADES_META.fuente}
        verificado={FISCAL_SOCIEDADES_META.verificado}
        urlOficial={FISCAL_SOCIEDADES_META.urlOficial}
        nota="El escudo fiscal se calcula al tipo marginal del Impuesto de Sociedades. El cálculo del leasing no incluye el IVA, que la empresa recupera vía declaración trimestral."
      />

      {/* ── Datos comunes y tipo de empresa ── */}
      <section className={styles.configSection}>
        <div className={styles.configHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Datos de la operación</h2>
          <button type="button" onClick={resetEjemplo} className={styles.btnReset}>
            <span aria-hidden="true">🔄</span> Restablecer ejemplo
          </button>
        </div>

        <div className={styles.inputsGrid}>
          {camposComunes.map(renderCampo)}
        </div>

        <h3 className={styles.subLabel}>Régimen del Impuesto de Sociedades</h3>
        <div className={styles.tipoGrid} role="group" aria-label="Seleccionar régimen fiscal">
          {(Object.keys(TIPOS_EMPRESA) as TipoEmpresaKey[]).map(key => (
            <button
              key={key}
              type="button"
              aria-pressed={tipoEmpresa === key}
              onClick={() => setTipoEmpresa(key)}
              className={`${styles.btnTipo} ${tipoEmpresa === key ? styles.btnTipoActivo : ''}`}
            >
              <span className={styles.btnTipoLabel}>{TIPOS_EMPRESA[key].label}</span>
              <span className={styles.btnTipoTipo}>{TIPOS_EMPRESA[key].tipo}%</span>
            </button>
          ))}
        </div>
        <p className={styles.tipoNota}>{TIPOS_EMPRESA[tipoEmpresa].nota}</p>
      </section>

      {/* ── Parámetros por vía ── */}
      <section className={styles.parametrosSection}>
        <div className={styles.parametroBloque} style={{ borderTopColor: COLORES.prestamo }}>
          <h3 className={styles.parametroTitulo}><span aria-hidden="true">🏦</span> Préstamo bancario</h3>
          <div className={styles.inputsGrid}>{camposPrestamo.map(renderCampo)}</div>
        </div>
        <div className={styles.parametroBloque} style={{ borderTopColor: COLORES.leasing }}>
          <h3 className={styles.parametroTitulo}><span aria-hidden="true">📄</span> Leasing</h3>
          <div className={styles.inputsGrid}>{camposLeasing.map(renderCampo)}</div>
        </div>
        <div className={styles.parametroBloque} style={{ borderTopColor: COLORES.capital }}>
          <h3 className={styles.parametroTitulo}><span aria-hidden="true">🤝</span> Ampliación de capital</h3>
          <div className={styles.inputsGrid}>{camposCapital.map(renderCampo)}</div>
        </div>
      </section>

      {/* ── Tarjetas de resultado por vía ── */}
      <section>
        <div className={styles.resultadosGrid}>
          {resultados.map(r => (
            <div key={r.id} className={styles.viaCarta} style={{ borderTopColor: r.color }}>
              <div className={styles.viaHeader}>
                <span className={styles.viaIcono} aria-hidden="true">{r.icono}</span>
                <span className={styles.viaNombre}>{r.nombre}</span>
              </div>

              <div className={styles.viaCosteNeto}>
                <span className={styles.viaCosteLabel}>Coste neto total</span>
                <span className={styles.viaCosteValor}>{fmtEur(r.costeNeto)}</span>
              </div>

              <dl className={styles.viaDetalle}>
                <div className={styles.viaFila}>
                  <dt>Coste bruto</dt>
                  <dd>{fmtEur(r.costeBruto)}</dd>
                </div>
                <div className={styles.viaFila}>
                  <dt>Escudo fiscal (IS)</dt>
                  <dd className={r.escudoFiscal > 0 ? styles.positivo : ''}>
                    {r.escudoFiscal > 0 ? `−${fmtEur(r.escudoFiscal)}` : '—'}
                  </dd>
                </div>
                <div className={styles.viaFila}>
                  <dt>Cuota mensual</dt>
                  <dd>{r.cuotaMensual > 0 ? `${fmtEur(r.cuotaMensual)}/mes` : '—'}</dd>
                </div>
                <div className={styles.viaFila}>
                  <dt>Salida de caja (plazo)</dt>
                  <dd>{r.salidaCajaPlazo > 0 ? fmtEur(r.salidaCajaPlazo) : 'Sin desembolso'}</dd>
                </div>
                <div className={styles.viaFila}>
                  <dt>Dilución de propiedad</dt>
                  <dd className={r.dilucion > 0 ? styles.negativo : ''}>
                    {r.dilucion > 0 ? `−${formatNumber(r.dilucion, 0)} %` : 'Ninguna'}
                  </dd>
                </div>
                <div className={styles.viaFila}>
                  <dt>Endeudamiento</dt>
                  <dd>{r.aumentaDeuda ? 'Aumenta el pasivo' : 'No genera deuda'}</dd>
                </div>
              </dl>

              <p className={styles.viaNota}>{r.notaClave}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Veredicto por prioridad ── */}
      <section className={styles.veredictoCard} aria-label="Recomendación según prioridad">
        <h2 className={styles.veredictoTitulo}>No hay una opción mejor en absoluto: depende de tu prioridad</h2>
        <div className={styles.veredictoGrid}>
          <div className={styles.veredictoItem}>
            <span className={styles.veredictoIcon} aria-hidden="true">💰</span>
            <span className={styles.veredictoPrio}>Menor coste total</span>
            <span className={styles.veredictoVia} style={{ color: menorCoste.color }}>{menorCoste.nombre}</span>
            <span className={styles.veredictoDato}>{fmtEur(menorCoste.costeNeto)} de coste neto</span>
          </div>
          <div className={styles.veredictoItem}>
            <span className={styles.veredictoIcon} aria-hidden="true">💧</span>
            <span className={styles.veredictoPrio}>Proteger la tesorería</span>
            <span className={styles.veredictoVia} style={{ color: mejorTesoreria.color }}>{mejorTesoreria.nombre}</span>
            <span className={styles.veredictoDato}>
              {mejorTesoreria.salidaCajaPlazo > 0 ? `${fmtEur(mejorTesoreria.salidaCajaPlazo)} de desembolso` : 'Sin salida de caja'}
            </span>
          </div>
          <div className={styles.veredictoItem}>
            <span className={styles.veredictoIcon} aria-hidden="true">🛡️</span>
            <span className={styles.veredictoPrio}>No perder control</span>
            <span className={styles.veredictoVia} style={{ color: mejorControl.color }}>{mejorControl.nombre}</span>
            <span className={styles.veredictoDato}>0% de dilución</span>
          </div>
        </div>
      </section>

      {/* ── Gráfico de coste neto comparado ── */}
      <section className={styles.graficaSection}>
        <h2 className={styles.graficaTitulo}>Coste neto comparado (después de impuestos)</h2>
        <div className={styles.barrasWrapper}>
          {resultados.map(r => (
            <BarraCoste
              key={r.id}
              label={r.nombre}
              valor={r.costeNeto}
              globalMax={globalMaxCoste}
              color={r.color}
            />
          ))}
        </div>
        <p className={styles.graficaNota}>
          En la ampliación de capital el coste neto refleja el coste de oportunidad del socio
          (la rentabilidad que espera obtener), no un desembolso de tesorería.
        </p>
      </section>

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía de Financiación Empresarial"
        subtitle="Préstamo, leasing y capital: cuándo conviene cada vía y qué errores evitar"
        icon="🎓"
      >
        <div className={styles.guideSection}>
          <h2>Préstamo vs leasing vs ampliación de capital</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Préstamo bancario</th>
                  <th>Leasing</th>
                  <th>Ampliación de capital</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Naturaleza</strong></td>
                  <td>Deuda (pasivo)</td>
                  <td>Arrendamiento con opción de compra</td>
                  <td>Fondos propios</td>
                </tr>
                <tr>
                  <td><strong>¿Hay que devolverlo?</strong></td>
                  <td>Sí, con intereses</td>
                  <td>Sí, vía cuotas + opción de compra</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td><strong>Escudo fiscal</strong></td>
                  <td>Intereses y comisiones deducibles</td>
                  <td>Cuota deducible + amortización acelerada</td>
                  <td>Ninguno (dividendos no deducibles)</td>
                </tr>
                <tr>
                  <td><strong>Impacto en tesorería</strong></td>
                  <td>Cuota fija mensual</td>
                  <td>Cuota fija mensual</td>
                  <td>Sin desembolso obligatorio</td>
                </tr>
                <tr>
                  <td><strong>Propiedad y control</strong></td>
                  <td>Se mantiene al 100%</td>
                  <td>Se mantiene al 100%</td>
                  <td>Se diluye (entra un socio)</td>
                </tr>
                <tr>
                  <td><strong>Efecto en el balance</strong></td>
                  <td>Aumenta el endeudamiento</td>
                  <td>Aumenta el endeudamiento</td>
                  <td>Refuerza la solvencia</td>
                </tr>
                <tr>
                  <td><strong>Propiedad del activo</strong></td>
                  <td>Inmediata</td>
                  <td>Al ejercer la opción de compra</td>
                  <td>Inmediata</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Casos de uso típicos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏭</span>
              <h3>Comprar maquinaria o vehículos</h3>
              <p>El leasing suele ser la opción natural: el bien queda como garantía, las cuotas son deducibles y la amortización acelerada adelanta el ahorro fiscal. Ideal para activos que se renuevan cada pocos años.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
              <h3>Obra, reformas o capital circulante</h3>
              <p>El préstamo bancario es más flexible para inversiones que no generan un activo financiable por leasing. Mantienes el 100% del control y deduces los intereses.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
              <h3>Crecer rápido sin asfixiar la caja</h3>
              <p>La ampliación de capital evita drenar la tesorería con cuotas mensuales. A cambio cedes propiedad. Tiene sentido cuando el proyecto necesita músculo financiero y el socio aporta también experiencia o red de contactos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">⚠️</span>
              <h3>Empresa ya muy endeudada</h3>
              <p>Si los ratios de endeudamiento están al límite, añadir más deuda puede ser inviable o muy caro. La ampliación de capital reequilibra el balance y mejora la solvencia ante futuros bancos.</p>
            </div>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué la ampliación de capital parece la más cara si no hay que devolverla?</dt>
              <dd>Porque ceder una parte de un negocio rentable suele salir más caro a largo plazo que pagar intereses. El socio que entra espera una rentabilidad (a menudo 12-20% anual) y participará en todos los beneficios futuros mientras sea accionista, no solo durante el plazo de la inversión. La deuda, en cambio, se extingue cuando terminas de pagarla. Por eso el coste de los fondos propios casi siempre es superior al de la deuda.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el escudo fiscal y cómo se calcula?</dt>
              <dd>Es el ahorro en el Impuesto de Sociedades que generan los gastos deducibles. Si pagas 10.000 € de intereses y tu tipo marginal es del 25%, Hacienda te «devuelve» 2.500 € al reducir tu base imponible. Préstamo y leasing generan escudo fiscal; la ampliación de capital no, porque los dividendos no son gasto deducible. Este simulador aplica el tipo marginal del régimen que elijas (15%, 21% o 25%).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué ventaja fiscal real tiene el leasing frente al préstamo?</dt>
              <dd>La amortización acelerada. En el leasing financiero puedes deducir la recuperación del coste del bien hasta el doble (o el triple en pymes de reducida dimensión) del coeficiente de amortización lineal. Eso no significa deducir más en total, sino antes, lo que mejora la tesorería de los primeros años por el valor temporal del dinero. Además, el IVA de las cuotas se recupera en cada declaración trimestral.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Aumentar la deuda perjudica a mi empresa?</dt>
              <dd>Depende de tu nivel de endeudamiento actual. Un ratio de endeudamiento equilibrado (deuda/patrimonio neto en torno a 1-1,5) es saludable y el escudo fiscal hace la deuda atractiva. Pero si ya estás muy apalancado, más deuda encarece la financiación, dispara el riesgo financiero y puede cerrarte el acceso a futuros préstamos. En ese punto la ampliación de capital reequilibra el balance.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo combinar varias vías de financiación?</dt>
              <dd>Sí, y es lo habitual en inversiones grandes. Por ejemplo: aportar una parte con capital propio para no depender solo del banco, financiar la maquinaria con leasing y cubrir el circulante con una línea de crédito. La combinación óptima busca minimizar el coste total manteniendo unos ratios de endeudamiento sanos y un control accionarial cómodo.</dd>
            </div>
          </dl>
        </div>

        <div className={styles.guideSection}>
          <h2>5 pasos para elegir tu financiación</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Define la inversión y su horizonte</strong>
                <p>Determina el importe exacto, qué activo o necesidad financia y durante cuántos años lo amortizarás. El plazo de la financiación debe ajustarse a la vida útil del activo: no financies a 10 años algo que durará 3.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Revisa tu nivel de endeudamiento actual</strong>
                <p>Antes de pedir más deuda, calcula tus ratios de endeudamiento y solvencia. Si ya están tensionados, la ampliación de capital puede ser la única vía sensata. Un analizador de ratios te da el diagnóstico en minutos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Compara el coste neto, no solo la cuota</strong>
                <p>La cuota mensual no lo es todo. Compara el coste total después del escudo fiscal y el impacto en tesorería durante todo el plazo. Una cuota baja con muchos años puede salir más cara que una alta a corto plazo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Valora qué estás dispuesto a ceder</strong>
                <p>Si valoras mucho el control total, descarta la ampliación de capital aunque sea atractiva financieramente. Si la prioridad es no ahogar la caja en una fase de crecimiento, el capital tiene sentido pese a su mayor coste económico.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Negocia y consulta con un profesional</strong>
                <p>Los tipos, comisiones y valores residuales son negociables. Antes de firmar, contrasta las condiciones con tu asesor fiscal o financiero: una operación de financiación tiene implicaciones contables y fiscales que conviene optimizar legalmente.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <p><strong>Ajusta el plazo a la vida del activo:</strong> Financiar a largo plazo un activo que se queda obsoleto pronto multiplica el coste financiero innecesariamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <p><strong>Mira siempre el TAE, no solo el TIN:</strong> Las comisiones de apertura, estudio y seguros vinculados encarecen la operación. El TAE recoge el coste real.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <p><strong>Diluye con un pacto de socios claro:</strong> Si entras capital, define por escrito derechos de voto, reparto de dividendos y cláusulas de salida antes de firmar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <p><strong>Protege un colchón de tesorería:</strong> No comprometas toda tu caja en cuotas. Mantén liquidez para imprevistos: una buena inversión mal financiada hunde empresas solventes.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h2>Errores frecuentes al financiar una inversión</h2>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Fijarse solo en la cuota mensual:</strong> Una cuota baja puede esconder un plazo largo y un coste total mucho mayor. Compara siempre el coste neto total después de impuestos.</li>
            <li><strong>Olvidar el escudo fiscal:</strong> Comparar el coste bruto de deuda y capital sin descontar el ahorro fiscal de los intereses distorsiona la decisión a favor del capital.</li>
            <li><strong>Subestimar el coste de ceder equity:</strong> «No hay que devolverlo» no significa que sea gratis. El socio participa de todos los beneficios futuros, no solo del plazo de la inversión.</li>
            <li><strong>Ignorar los ratios de endeudamiento:</strong> Añadir deuda sobre una empresa ya apalancada puede disparar el coste financiero y cerrar el acceso a financiación futura.</li>
            <li><strong>Confundir IVA con coste:</strong> El IVA del leasing y de las inversiones es recuperable para la empresa; incluirlo como coste real lleva a comparaciones erróneas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="simulador-financiacion-empresarial" />
      <Footer appName="simulador-financiacion-empresarial" />
    </div>
  );
}
