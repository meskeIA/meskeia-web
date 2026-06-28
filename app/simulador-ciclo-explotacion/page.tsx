'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SimuladorCicloExplotacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Modo = 'industrial' | 'comercial';

interface InputDias {
  pmMP: string;
  pmFab: string;
  pmPT: string;
  pmc: string;
  pmp: string;
  costesAnuales: string;
}

interface ResultadoCiclo {
  pmMP: number;
  pmFab: number;
  pmPT: number;
  pmc: number;
  pmp: number;
  pme: number;
  pmf: number;
  fondoManiobra: number;
  costeDiario: number;
}

// ─── Cálculos ─────────────────────────────────────────────────────────────────

function calcular(inputs: InputDias, modo: Modo): ResultadoCiclo {
  const p = (k: keyof InputDias) => parseSpanishNumber(inputs[k]) || 0;
  const pmMP  = modo === 'industrial' ? p('pmMP') : 0;
  const pmFab = modo === 'industrial' ? p('pmFab') : 0;
  const pmPT  = p('pmPT');
  const pmc   = p('pmc');
  const pmp   = p('pmp');
  const costesAnuales = p('costesAnuales');

  const pme = pmMP + pmFab + pmPT + pmc;
  const pmf = Math.max(0, pme - pmp);
  const costeDiario = costesAnuales > 0 ? costesAnuales / 365 : 0;
  const fondoManiobra = pmf * costeDiario;

  return { pmMP, pmFab, pmPT, pmc, pmp, pme, pmf, fondoManiobra, costeDiario };
}

// ─── Ejemplos predefinidos ────────────────────────────────────────────────────

const EJEMPLOS: Record<string, { label: string; emoji: string; inputs: InputDias; modo: Modo }> = {
  industrial: {
    label: 'Industrial',
    emoji: '🏭',
    inputs: { pmMP: '20', pmFab: '15', pmPT: '25', pmc: '60', pmp: '45', costesAnuales: '2000000' },
    modo: 'industrial',
  },
  comercial: {
    label: 'Comercial',
    emoji: '🏪',
    inputs: { pmMP: '0', pmFab: '0', pmPT: '30', pmc: '45', pmp: '30', costesAnuales: '1500000' },
    modo: 'comercial',
  },
  servicios: {
    label: 'Servicios',
    emoji: '💼',
    inputs: { pmMP: '0', pmFab: '0', pmPT: '0', pmc: '30', pmp: '30', costesAnuales: '800000' },
    modo: 'comercial',
  },
};

// ─── Diagrama Gantt visual ────────────────────────────────────────────────────

function DiagramaCiclo({ res, modo }: { res: ResultadoCiclo; modo: Modo }) {
  const escala = res.pme > 0 ? res.pme : 1;
  const pct = (d: number) => `${Math.max((d / escala) * 100, 0)}%`;

  if (res.pme === 0) {
    return (
      <div className={styles.diagrama}>
        <p className={styles.diagramaVacio}>Introduce datos para ver el diagrama del ciclo</p>
      </div>
    );
  }

  return (
    <div className={styles.diagrama}>
      {/* Fila: Ciclo económico */}
      <div className={styles.diagramaFila}>
        <span className={styles.diagramaRowLabel}>
          <span aria-hidden="true">🔄</span> Ciclo económico
        </span>
        <div className={styles.diagramaTrack}>
          {modo === 'industrial' && res.pmMP > 0 && (
            <div className={styles.diagramaFase} style={{ width: pct(res.pmMP), backgroundColor: '#8B5CF6' }}>
              <span>MP · {res.pmMP}d</span>
            </div>
          )}
          {modo === 'industrial' && res.pmFab > 0 && (
            <div className={styles.diagramaFase} style={{ width: pct(res.pmFab), backgroundColor: '#06B6D4' }}>
              <span>Fab · {res.pmFab}d</span>
            </div>
          )}
          {res.pmPT > 0 && (
            <div className={styles.diagramaFase} style={{ width: pct(res.pmPT), backgroundColor: '#48A9A6' }}>
              <span>{modo === 'industrial' ? 'PT' : 'Stock'} · {res.pmPT}d</span>
            </div>
          )}
          {res.pmc > 0 && (
            <div className={styles.diagramaFase} style={{ width: pct(res.pmc), backgroundColor: '#2E86AB' }}>
              <span>PMC · {res.pmc}d</span>
            </div>
          )}
        </div>
        <span className={styles.diagramaTotalLabel}>{res.pme} días</span>
      </div>

      {/* Fila: PMP */}
      {res.pmp > 0 && (
        <div className={styles.diagramaFila}>
          <span className={styles.diagramaRowLabel}>
            <span aria-hidden="true">🤝</span> Pago a proveedor
          </span>
          <div className={styles.diagramaTrack}>
            <div className={styles.diagramaFase} style={{ width: pct(res.pmp), backgroundColor: '#F59E0B' }}>
              <span>PMP · {res.pmp}d</span>
            </div>
          </div>
          <span className={styles.diagramaTotalLabel}>{res.pmp} días</span>
        </div>
      )}

      {/* Fila: PMF */}
      <div className={styles.diagramaFila}>
        <span className={styles.diagramaRowLabel}>
          <span aria-hidden="true">💰</span> Necesidad neta
        </span>
        <div className={styles.diagramaTrack}>
          {res.pmp > 0 && (
            <div className={styles.diagramaOffset} style={{ width: pct(res.pmp) }} />
          )}
          {res.pmf > 0 && (
            <div className={`${styles.diagramaFase} ${styles.diagramaFasePMF}`} style={{ width: pct(res.pmf) }}>
              <span>PMF · {res.pmf}d</span>
            </div>
          )}
          {res.pmf === 0 && (
            <div className={styles.diagramaPMFCero}>
              <span>PMF = 0 · Proveedor cubre todo el ciclo</span>
            </div>
          )}
        </div>
        <span className={styles.diagramaTotalLabel}>{res.pmf} días</span>
      </div>

      {/* Leyenda */}
      <div className={styles.diagramaLeyenda}>
        {modo === 'industrial' && (
          <>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ backgroundColor: '#8B5CF6' }} />
              Materias primas
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ backgroundColor: '#06B6D4' }} />
              Fabricación
            </span>
          </>
        )}
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#48A9A6' }} />
          {modo === 'industrial' ? 'Producto terminado' : 'Stock'}
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#2E86AB' }} />
          Cobro clientes
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#F59E0B' }} />
          Plazo pago proveedor
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.leyendaDot} style={{ backgroundColor: '#1a5278' }} />
          Necesidad neta (PMF)
        </span>
      </div>
    </div>
  );
}

// ─── Componente input de días ──────────────────────────────────────────────────

interface CampoInputDiasProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  disabled?: boolean;
}

function CampoInputDias({ label, value, onChange, id, disabled = false }: CampoInputDiasProps) {
  return (
    <div className={`${styles.campoInput} ${disabled ? styles.campoInputDisabled : ''}`}>
      <label className={styles.campoLabel} htmlFor={id}>{label}</label>
      <div className={styles.inputDiasWrapper}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={styles.inputField}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          disabled={disabled}
          aria-label={`${label} en días`}
        />
        <span className={styles.inputSufijo}>días</span>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function SimuladorCicloExplotacionPage() {
  const [modo, setModo] = useState<Modo>('industrial');
  const [inputs, setInputs] = useState<InputDias>(EJEMPLOS.industrial.inputs);
  const [calculado, setCalculado] = useState(true);
  const [resultado, setResultado] = useState<ResultadoCiclo>(
    calcular(EJEMPLOS.industrial.inputs, 'industrial')
  );

  const setField = (k: keyof InputDias) => (v: string) => {
    setInputs(prev => ({ ...prev, [k]: v }));
    setCalculado(false);
  };

  const handleCalcular = () => {
    setResultado(calcular(inputs, modo));
    setCalculado(true);
  };

  const handleEjemplo = (key: string) => {
    const ej = EJEMPLOS[key];
    setModo(ej.modo);
    setInputs(ej.inputs);
    setResultado(calcular(ej.inputs, ej.modo));
    setCalculado(true);
  };

  const handleModo = (m: Modo) => {
    setModo(m);
    if (m === 'comercial') {
      setInputs(prev => ({ ...prev, pmMP: '0', pmFab: '0' }));
    }
    setCalculado(false);
  };

  const pmfColor = resultado.pmf === 0 ? 'holgado' : resultado.pmf <= 30 ? 'holgado' : resultado.pmf <= 60 ? 'medio' : 'critico';
  const pctFinanciado = resultado.pme > 0 ? Math.min((resultado.pmp / resultado.pme) * 100, 100) : 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🔄</span> Simulador del Ciclo de Explotación
        </h1>
        <p className={styles.subtitle}>
          Visualiza el ciclo operativo de tu empresa: desde que pagas a proveedores hasta que cobras a clientes
        </p>
      </header>

      <LegalNotice />

      {/* Panel de configuración */}
      <section className={styles.configPanel}>
        {/* Toggle de modo */}
        <div className={styles.modoToggleWrapper}>
          <p className={styles.modoToggleLabel}>Tipo de empresa</p>
          <div className={styles.modoToggle} role="group" aria-label="Selecciona el tipo de empresa">
            <button
              type="button"
              className={`${styles.btnModo} ${modo === 'industrial' ? styles.btnModoActivo : ''}`}
              aria-pressed={modo === 'industrial'}
              onClick={() => handleModo('industrial')}
            >
              <span aria-hidden="true">🏭</span> Industrial
            </button>
            <button
              type="button"
              className={`${styles.btnModo} ${modo === 'comercial' ? styles.btnModoActivo : ''}`}
              aria-pressed={modo === 'comercial'}
              onClick={() => handleModo('comercial')}
            >
              <span aria-hidden="true">🏪</span> Comercial / Servicios
            </button>
          </div>
        </div>

        {/* Botones de ejemplo */}
        <div className={styles.ejemplosWrapper}>
          <p className={styles.ejemplosLabel}>Cargar ejemplo</p>
          <div className={styles.ejemplosBtns}>
            {Object.entries(EJEMPLOS).map(([key, ej]) => (
              <button
                key={key}
                type="button"
                className={styles.btnEjemplo}
                onClick={() => handleEjemplo(key)}
              >
                <span aria-hidden="true">{ej.emoji}</span> {ej.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de inputs */}
        <div className={styles.inputGrid}>
          {modo === 'industrial' && (
            <>
              <CampoInputDias
                id="pmMP"
                label="Stock materias primas (PM MP)"
                value={inputs.pmMP}
                onChange={setField('pmMP')}
              />
              <CampoInputDias
                id="pmFab"
                label="Fabricación (PM Fabricación)"
                value={inputs.pmFab}
                onChange={setField('pmFab')}
              />
            </>
          )}
          <CampoInputDias
            id="pmPT"
            label={modo === 'industrial' ? 'Stock producto terminado (PM PT)' : 'Stock mercancías (PM Stock)'}
            value={inputs.pmPT}
            onChange={setField('pmPT')}
          />
          <CampoInputDias
            id="pmc"
            label="Cobro a clientes (PMC)"
            value={inputs.pmc}
            onChange={setField('pmc')}
          />
          <CampoInputDias
            id="pmp"
            label="Pago a proveedores (PMP)"
            value={inputs.pmp}
            onChange={setField('pmp')}
          />

          {/* Campo costes anuales */}
          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="costesAnuales">
              Costes operativos anuales (para calcular FM)
            </label>
            <div className={styles.inputEurWrapper}>
              <input
                id="costesAnuales"
                type="text"
                inputMode="numeric"
                className={styles.inputEurField}
                value={inputs.costesAnuales}
                onChange={(e) => setField('costesAnuales')(e.target.value)}
                placeholder="0"
                aria-label="Costes operativos anuales en euros"
              />
              <span className={styles.inputEurSufijo}>€/año</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.btnCalcular}
          onClick={handleCalcular}
        >
          <span aria-hidden="true">📊</span>{' '}
          {calculado ? 'Recalcular' : 'Calcular ciclo'}
        </button>
      </section>

      {/* Diagrama Gantt */}
      {calculado && (
        <section className={styles.diagramaSection}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📈</span> Diagrama del ciclo operativo
          </h2>
          <p className={styles.sectionSubtitle}>
            Duración proporcional al PME ({resultado.pme} días). El PMP muestra qué parte financia el proveedor.
          </p>
          <DiagramaCiclo res={resultado} modo={modo} />
        </section>
      )}

      {/* Métricas resumen */}
      {calculado && (
        <section className={styles.metricasSection}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">🔢</span> Resumen del ciclo
          </h2>
          <div className={styles.metricasGrid}>
            {/* PME */}
            <div className={styles.metricaCard}>
              <span className={styles.metricaIcono} aria-hidden="true">🔄</span>
              <span className={styles.metricaValor}>{formatNumber(resultado.pme, 0)}</span>
              <span className={styles.metricaUnidad}>días</span>
              <span className={styles.metricaLabel}>Período de Maduración Económico (PME)</span>
              <span className={styles.metricaDesc}>Duración total del ciclo operativo</span>
            </div>

            {/* PMF */}
            <div className={`${styles.metricaCard} ${pmfColor === 'critico' ? styles.metricaCritica : pmfColor === 'holgado' ? styles.metricaHolgada : styles.metricaMedia}`}>
              <span className={styles.metricaIcono} aria-hidden="true">
                {pmfColor === 'critico' ? '🔴' : pmfColor === 'holgado' ? '🟢' : '🟡'}
              </span>
              <span className={styles.metricaValor}>{formatNumber(resultado.pmf, 0)}</span>
              <span className={styles.metricaUnidad}>días</span>
              <span className={styles.metricaLabel}>Período de Maduración Financiero (PMF)</span>
              <span className={styles.metricaDesc}>
                {pmfColor === 'critico' ? 'Ciclo largo: necesita financiación externa' : pmfColor === 'holgado' ? 'Ciclo corto: buena posición' : 'Ciclo moderado'}
              </span>
            </div>

            {/* Fondo de Maniobra */}
            {parseSpanishNumber(inputs.costesAnuales) > 0 && (
              <div className={styles.metricaCard}>
                <span className={styles.metricaIcono} aria-hidden="true">💰</span>
                <span className={styles.metricaValor}>{formatCurrency(resultado.fondoManiobra)}</span>
                <span className={styles.metricaLabel}>Fondo de Maniobra necesario</span>
                <span className={styles.metricaDesc}>
                  {formatCurrency(resultado.costeDiario)}/día × {resultado.pmf} días PMF
                </span>
              </div>
            )}

            {/* % financiado por proveedores */}
            <div className={styles.metricaCard}>
              <span className={styles.metricaIcono} aria-hidden="true">🤝</span>
              <span className={styles.metricaValor}>{formatNumber(pctFinanciado, 1)}</span>
              <span className={styles.metricaUnidad}>%</span>
              <span className={styles.metricaLabel}>Financiado por proveedores</span>
              <span className={styles.metricaDesc}>
                PMP {resultado.pmp}d de {resultado.pme}d PME total
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Aprende sobre el ciclo de explotación"
        subtitle="Conceptos clave de gestión del circulante"
      >
        <div className={styles.eduContent}>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Ciclo de explotación según el tipo de empresa</h2>
            <p>El ciclo operativo varía mucho según el sector. Esta tabla resume las diferencias clave:</p>
            <div className={styles.tablaWrapper}>
              <table className={styles.tablaComparativa}>
                <thead>
                  <tr>
                    <th>Tipo de empresa</th>
                    <th>PME típico</th>
                    <th>Principales causas de ciclo largo</th>
                    <th>Palancas de mejora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Industrial pesada</strong><br />(aeronáutica, naval)</td>
                    <td>180–720 días</td>
                    <td>Fabricación larga, productos a medida, proyectos largos</td>
                    <td>Anticipos de clientes, hitos de cobro intermedios</td>
                  </tr>
                  <tr>
                    <td><strong>Industrial ligera</strong><br />(alimentación, textil)</td>
                    <td>60–120 días</td>
                    <td>Stock estacional, ciclos de cobro a 60–90 días</td>
                    <td>Factoring, reducción de stock con JIT</td>
                  </tr>
                  <tr>
                    <td><strong>Comercial mayorista</strong></td>
                    <td>45–90 días</td>
                    <td>Stock elevado, clientes a 60 días</td>
                    <td>Negociar PMP más largo, acortar PMC</td>
                  </tr>
                  <tr>
                    <td><strong>Comercial minorista</strong></td>
                    <td>15–40 días</td>
                    <td>Cobro al contado pero pago a proveedor a 30–90 días</td>
                    <td>PMF puede ser negativo (ventaja financiera estructural)</td>
                  </tr>
                  <tr>
                    <td><strong>Servicios profesionales</strong></td>
                    <td>30–60 días</td>
                    <td>Sin stock físico; solo PMC eleva el ciclo</td>
                    <td>Anticipos, pagos a plazos, retención mínima</td>
                  </tr>
                  <tr>
                    <td><strong>Hostelería / retail</strong></td>
                    <td>5–20 días</td>
                    <td>Perecederos con rotación rápida</td>
                    <td>Gestión activa de mermas y caducidades</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Escenarios */}
          <section className={styles.guideSection}>
            <h2>Escenarios prácticos</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🏭</span> Empresa industrial con ciclo largo
                </h3>
                <p>
                  Una empresa de componentes metálicos tiene: PM MP = 30d, Fab = 20d, PT = 40d,
                  PMC = 90d y PMP = 60d. Su PME es 180 días y el PMF es 120 días.
                  Con costes de 3 M€ anuales, necesita un Fondo de Maniobra de ~986.000 €.
                  Si logra reducir el PMC a 60 días aceptando descuentos por pronto pago del 1,5%,
                  el PMF baja a 90 días y ahorra ~246.000 € en circulante.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🏪</span> Supermercado (PMF negativo)
                </h3>
                <p>
                  Una cadena de supermercados cobra al contado (PMC = 0) con stock de 10 días
                  y paga a proveedores a 60 días. Su PME = 10 días y PMP = 60 días, por lo
                  que el PMF es negativo (−50 días). Esto significa que los proveedores financian
                  todo el ciclo y además la empresa dispone de 50 días de tesorería adicional:
                  una ventaja competitiva enorme que le permite invertir ese capital.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">💼</span> Consultoría de servicios
                </h3>
                <p>
                  Una consultora sin stock tiene PMC = 45 días y PMP = 30 días.
                  PME = 45 días, PMF = 15 días. Con costes de 800.000 €/año,
                  el Fondo de Maniobra necesario es ~32.877 €.
                  Si negocia un anticipo del 30% al inicio de cada proyecto,
                  el PMC efectivo baja a ~31 días y el PMF prácticamente desaparece.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🌾</span> Empresa estacional (agroindustria)
                </h3>
                <p>
                  Una empresa de conservas vegetales tiene stock estacional de MP = 90 días
                  (toda la cosecha), fabricación de 30 días y PT = 60 días con PMC = 60 días.
                  PME = 240 días, PMF = 210 días si el PMP es solo 30 días.
                  Este ciclo extremadamente largo requiere financiar casi un año de operaciones.
                  La clave es negociar líneas de crédito de campaña con el banco antes de cada temporada.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Qué es el ciclo de explotación y por qué importa?</summary>
                <p>
                  El ciclo de explotación es el proceso que va desde que la empresa paga a sus proveedores
                  hasta que cobra a sus clientes. Su duración determina cuánto capital circulante necesita
                  la empresa para funcionar sin recurrir a financiación externa. Un ciclo corto significa
                  menos dinero inmovilizado; uno largo puede generar tensiones de tesorería incluso con
                  beneficios contables.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cuál es la diferencia entre el PME y el PMF?</summary>
                <p>
                  El Período de Maduración Económico (PME) mide la duración total del ciclo operativo.
                  El Período de Maduración Financiero (PMF) es el PME menos el PMP (plazo que dan los
                  proveedores). El PMF mide los días que la empresa debe financiar con recursos propios
                  o crédito bancario, porque esa parte del ciclo no está cubierta por los proveedores.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cómo se calcula el Fondo de Maniobra necesario?</summary>
                <p>
                  Se multiplica el PMF por el coste diario de la empresa (costes anuales / 365).
                  Por ejemplo, si el PMF es 60 días y los costes anuales son 2.000.000 €,
                  el Fondo de Maniobra necesario es 60 × (2.000.000 / 365) ≈ 328.767 €.
                  Este importe debe estar cubierto por el Fondo de Maniobra real (activo corriente
                  menos pasivo corriente) o por líneas de crédito disponibles.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Cómo puede una empresa reducir su ciclo de explotación?</summary>
                <p>
                  Las principales palancas son: reducir stock con gestión JIT o previsión de demanda;
                  acortar la fabricación con mejoras de proceso; anticipar el cobro con factoring o
                  descuentos por pronto pago; y alargar el pago a proveedores mediante confirming u
                  otras fórmulas de financiación de la cadena de suministro. Cada día que se reduce
                  el PMF libera capital equivalente al coste diario de la empresa.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si el PMF es negativo o igual a cero?</summary>
                <p>
                  Si el PMF es cero o negativo, los proveedores financian todo el ciclo operativo
                  y la empresa no necesita capital circulante propio para operar. Es el caso de
                  grandes distribuidores minoristas que cobran al contado y pagan a 60–90 días.
                  Esta situación es financieramente muy favorable: la empresa puede usar ese
                  "crédito de proveedores" para invertir o crear un colchón de tesorería.
                </p>
              </details>
            </div>
          </section>

          {/* Pasos para optimizar */}
          <section className={styles.guideSection}>
            <h2>Cómo optimizar el ciclo de explotación: 5 pasos</h2>
            <ol className={styles.pasosList}>
              <li className={styles.pasoItem}>
                <strong>Mide el ciclo actual con datos reales.</strong> Calcula PME y PMF con los datos
                de los últimos 12 meses. Muchas empresas no conocen su ciclo real y operan a ciegas.
                El primer paso es siempre medir.
              </li>
              <li className={styles.pasoItem}>
                <strong>Identifica el eslabón más largo.</strong> ¿Es el stock? ¿La fabricación? ¿El cobro?
                Concentra los esfuerzos en reducir el componente con mayor peso relativo en el PME.
                Pequeñas mejoras en el eslabón crítico tienen gran impacto en el PMF total.
              </li>
              <li className={styles.pasoItem}>
                <strong>Negocia las condiciones con proveedores.</strong> Ampliar el PMP 15 días reduce
                el PMF directamente sin cambiar nada en el proceso operativo. El confirming bancario
                puede facilitar esta negociación ofreciendo liquidez inmediata al proveedor a costa
                de una pequeña comisión.
              </li>
              <li className={styles.pasoItem}>
                <strong>Acorta el período de cobro a clientes.</strong> Ofrece descuentos por pronto pago
                (por ejemplo, 2% si pagan en 10 días en lugar de 60). Usa el factoring para traspasar
                el riesgo de cobro y anticipar la liquidez sin esperar al vencimiento de la factura.
              </li>
              <li className={styles.pasoItem}>
                <strong>Revisa el ciclo periódicamente.</strong> El ciclo cambia con el volumen, la
                estacionalidad y las condiciones del mercado. Recalcularlo trimestralmente y ajustar
                la póliza de crédito en consecuencia evita sorpresas de tesorería.
              </li>
            </ol>
          </section>

          {/* Tips */}
          <section className={styles.guideSection}>
            <h2>Cuatro herramientas para acortar el ciclo</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">📦</span>
                <h3>Just-In-Time (JIT)</h3>
                <p>
                  Reducir el stock de materias primas al mínimo recibiendo entregas frecuentes y
                  ajustadas a la producción. Reduce el PM MP drásticamente pero requiere proveedores
                  fiables y logística ágil.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">💳</span>
                <h3>Factoring</h3>
                <p>
                  Ceder las facturas de clientes a una entidad financiera a cambio de liquidez
                  inmediata. El banco adelanta el cobro (normalmente el 80–90%) y asume el riesgo
                  de impago si es factoring sin recurso. Acorta el PMC efectivo al instante.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🏦</span>
                <h3>Confirming</h3>
                <p>
                  El banco gestiona el pago a proveedores y les ofrece cobrar antes del vencimiento
                  a cambio de una pequeña comisión. La empresa compradora mantiene o amplía el PMP
                  sin perjudicar la relación con el proveedor.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcono} aria-hidden="true">🤝</span>
                <h3>Negociación de PMP</h3>
                <p>
                  Ampliar el plazo de pago a proveedores es la palanca más directa para reducir el PMF.
                  Cada día adicional de PMP equivale a liberar capital equivalente al coste diario
                  de la empresa. La Ley 15/2010 fija un máximo de 60 días para empresas en España.
                </p>
              </div>
            </div>
          </section>

          {/* Warning Box — errores frecuentes */}
          <div className={styles.warningBox} role="alert">
            <h3>
              <span aria-hidden="true">⚠️</span> Errores frecuentes en la gestión del ciclo
            </h3>
            <ul>
              <li>
                <strong>No calcular el ciclo nunca.</strong> Muchas pymes gestionan la tesorería
                "por sensación" sin conocer su PMF real. Cuando llegan las tensiones de liquidez
                ya es tarde para actuar con calma.
              </li>
              <li>
                <strong>Financiar activo fijo con póliza de circulante.</strong> La póliza de crédito
                sirve para cubrir necesidades de capital circulante (ciclo corto). Usarla para
                comprar maquinaria o reformas crea un descalce de plazos que lastra la empresa.
              </li>
              <li>
                <strong>Ignorar la estacionalidad.</strong> El PMF varía a lo largo del año en sectores
                estacionales. Calcular solo el promedio anual puede subestimar las necesidades en los
                meses pico y generar tensiones graves en temporada alta.
              </li>
              <li>
                <strong>Confundir Fondo de Maniobra real con el necesario.</strong> El FM real es
                activo corriente menos pasivo corriente (dato del balance). El FM necesario es el
                que calcula esta herramienta. Si el FM real es menor que el necesario, la empresa
                tiene un déficit de circulante aunque tenga beneficios.
              </li>
            </ul>
          </div>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-ciclo-explotacion')} />

      <ShareCard appName="simulador-ciclo-explotacion" />

      <Footer appName="simulador-ciclo-explotacion" />
    </div>
  );
}
