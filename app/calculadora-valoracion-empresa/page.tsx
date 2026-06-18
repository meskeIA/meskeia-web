'use client';
// @disclaimer: exempt — resultado orientativo, DisclaimerCard variant="financial" severity="medium"

import { useState, useCallback } from 'react';
import styles from './CalculadoraValoracionEmpresa.module.css';
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

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InputData {
  ebitda: string;
  ventas: string;
  resultadoNeto: string;
  patrimonioNeto: string;
  tasaCapitalizacion: string;
}

type SectorKey = 'tecnologia' | 'servicios' | 'industrial' | 'retail' | 'hosteleria' | 'construccion' | 'salud' | 'otro';

interface ResultadoMetodo {
  id: string;
  nombre: string;
  icono: string;
  min: number;
  max: number;
  formula: string;
  nota: string;
  valido: boolean;
  color: string;
}

// ─── Datos de sectores ────────────────────────────────────────────────────────

const SECTORES: Record<SectorKey, { nombre: string; multiploEbitda: [number, number]; multiploVentas: [number, number] }> = {
  tecnologia:   { nombre: 'Tecnología / Software',      multiploEbitda: [8, 15],  multiploVentas: [3, 8]     },
  servicios:    { nombre: 'Servicios profesionales',     multiploEbitda: [5, 10],  multiploVentas: [1, 3]     },
  industrial:   { nombre: 'Industrial / Manufactura',    multiploEbitda: [4, 7],   multiploVentas: [0.4, 1]   },
  retail:       { nombre: 'Comercio / Retail',           multiploEbitda: [4, 7],   multiploVentas: [0.3, 0.7] },
  hosteleria:   { nombre: 'Hostelería / Restauración',   multiploEbitda: [3, 6],   multiploVentas: [0.4, 1]   },
  construccion: { nombre: 'Construcción / Inmobiliaria', multiploEbitda: [3, 6],   multiploVentas: [0.2, 0.5] },
  salud:        { nombre: 'Salud / Farmacéutica',        multiploEbitda: [7, 12],  multiploVentas: [1.5, 4]   },
  otro:         { nombre: 'Otro sector',                 multiploEbitda: [4, 8],   multiploVentas: [0.4, 1.2] },
};

const COLORES_METODOS = {
  ebitda:       '#2E86AB',
  ventas:       '#48A9A6',
  capitalizacion: '#7C3AED',
  contable:     '#6B7280',
};

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

const DATOS_EJEMPLO: InputData = {
  ebitda: '290000',
  ventas: '3200000',
  resultadoNeto: '180000',
  patrimonioNeto: '1250000',
  tasaCapitalizacion: '15',
};

const SECTOR_EJEMPLO: SectorKey = 'industrial';

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return `${formatNumber(n, 0)} €`;
}

function calcularValoraciones(datos: InputData, sector: SectorKey): ResultadoMetodo[] {
  const p = (k: keyof InputData) => parseSpanishNumber(datos[k]) || 0;
  const ebitda = p('ebitda');
  const ventas = p('ventas');
  const rn = p('resultadoNeto');
  const pn = p('patrimonioNeto');
  const tasa = p('tasaCapitalizacion') || 15;
  const s = SECTORES[sector];

  return [
    {
      id: 'ebitda',
      nombre: 'Múltiplo de EBITDA',
      icono: '⚙️',
      min: ebitda * s.multiploEbitda[0],
      max: ebitda * s.multiploEbitda[1],
      formula: `EBITDA (${formatNumber(ebitda, 0)} €) × ${s.multiploEbitda[0]}x – ${s.multiploEbitda[1]}x`,
      nota: 'Método más usado en M&A para pymes',
      valido: ebitda > 0,
      color: COLORES_METODOS.ebitda,
    },
    {
      id: 'ventas',
      nombre: 'Múltiplo de Ventas',
      icono: '📦',
      min: ventas * s.multiploVentas[0],
      max: ventas * s.multiploVentas[1],
      formula: `Ventas (${formatNumber(ventas, 0)} €) × ${s.multiploVentas[0]}x – ${s.multiploVentas[1]}x`,
      nota: 'Útil cuando el EBITDA es bajo o negativo',
      valido: ventas > 0,
      color: COLORES_METODOS.ventas,
    },
    {
      id: 'capitalizacion',
      nombre: 'Capitalización de Beneficios',
      icono: '💰',
      min: (rn / (tasa / 100)) * 0.8,
      max: (rn / (tasa / 100)) * 1.2,
      formula: `Resultado Neto (${formatNumber(rn, 0)} €) / ${tasa} %`,
      nota: 'Asume continuidad del beneficio actual',
      valido: rn > 0,
      color: COLORES_METODOS.capitalizacion,
    },
    {
      id: 'contable',
      nombre: 'Valor Contable (suelo)',
      icono: '📋',
      min: pn,
      max: pn,
      formula: `Patrimonio Neto = ${formatNumber(pn, 0)} €`,
      nota: 'Valor mínimo de referencia (valor en libros)',
      valido: pn > 0,
      color: COLORES_METODOS.contable,
    },
  ];
}

// ─── Componente BarraRango ────────────────────────────────────────────────────

interface BarraRangoProps {
  min: number;
  max: number;
  globalMax: number;
  color: string;
  label: string;
  valido: boolean;
}

function BarraRango({ min, max, globalMax, color, label, valido }: BarraRangoProps) {
  if (!valido || globalMax <= 0) {
    return (
      <div className={styles.barraFila}>
        <span className={styles.barraLabel}>{label}</span>
        <div className={styles.barraTrack} />
        <span className={styles.barraValor}>Sin datos</span>
      </div>
    );
  }
  const left = `${(min / globalMax) * 100}%`;
  const width = `${Math.max(((max - min) / globalMax) * 100, 0.5)}%`;
  const esPunto = max === min;

  return (
    <div className={styles.barraFila}>
      <span className={styles.barraLabel}>{label}</span>
      <div className={styles.barraTrack}>
        {esPunto
          ? <div className={styles.barraPunto} style={{ left, backgroundColor: color }} />
          : <div className={styles.barraRango} style={{ left, width, backgroundColor: color }} />
        }
      </div>
      <span className={styles.barraValor}>
        {esPunto ? fmtEur(min) : `${fmtEur(min)} – ${fmtEur(max)}`}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraValoracionEmpresa() {
  const [datos, setDatos] = useState<InputData>(DATOS_EJEMPLO);
  const [sector, setSector] = useState<SectorKey>(SECTOR_EJEMPLO);
  const [rawValues, setRawValues] = useState<Partial<InputData>>({});

  const resultados = calcularValoraciones(datos, sector);

  const metodosIngresos = resultados.filter(r => r.valido && r.id !== 'contable');
  const consensoMin = metodosIngresos.length > 0 ? Math.min(...metodosIngresos.map(r => r.min)) : 0;
  const consensoMax = metodosIngresos.length > 0 ? Math.max(...metodosIngresos.map(r => r.max)) : 0;
  const hayConsensoPosible = metodosIngresos.length > 0;

  const globalMax = resultados.filter(r => r.valido).reduce((acc, r) => Math.max(acc, r.max), 0);

  const escalaTicks = globalMax > 0
    ? [0, 0.25, 0.5, 0.75, 1].map(f => fmtEur(Math.round(globalMax * f)))
    : ['0 €', '', '', '', ''];

  const handleFocus = useCallback((campo: keyof InputData) => {
    setRawValues(prev => ({ ...prev, [campo]: datos[campo] }));
  }, [datos]);

  const handleChange = useCallback((campo: keyof InputData, valor: string) => {
    setRawValues(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleBlur = useCallback((campo: keyof InputData) => {
    const raw = rawValues[campo] ?? datos[campo];
    const parsed = parseSpanishNumber(raw);
    const normalizado = parsed != null && !isNaN(parsed)
      ? (campo === 'tasaCapitalizacion' ? String(parsed) : String(Math.round(parsed)))
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
    if (campo === 'tasaCapitalizacion') return String(n);
    return formatNumber(n, 0);
  };

  const resetEjemplo = () => {
    setDatos(DATOS_EJEMPLO);
    setSector(SECTOR_EJEMPLO);
    setRawValues({});
  };

  const relatedApps = getRelatedApps('calculadora-valoracion-empresa');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🏢</span> Valoración de Empresa
        </h1>
        <p className={styles.subtitle}>
          Calcula el valor orientativo de tu negocio con 4 métodos de valoración y múltiplos sectoriales. Obtén el rango de consenso entre métodos.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="medium" collapsible={true} />

      {/* ── Configuración ── */}
      <section className={styles.configSection}>
        <h2 className={styles.sectionTitle}>Sector de la empresa</h2>
        <div className={styles.sectorGrid} role="group" aria-label="Seleccionar sector">
          {(Object.keys(SECTORES) as SectorKey[]).map(key => (
            <button
              key={key}
              type="button"
              aria-pressed={sector === key}
              onClick={() => setSector(key)}
              className={`${styles.btnSector} ${sector === key ? styles.btnSectorActivo : ''}`}
            >
              {SECTORES[key].nombre}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Datos financieros</h2>
          <button type="button" onClick={resetEjemplo} className={styles.btnReset}>
            <span aria-hidden="true">🔄</span> Restablecer ejemplo
          </button>
        </div>

        <div className={styles.inputsGrid}>
          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="campo-ebitda">EBITDA</label>
            <div className={styles.campoInputWrapper}>
              <span className={styles.campoSufijo}>€</span>
              <input
                id="campo-ebitda"
                type="text"
                inputMode="decimal"
                className={styles.campoInputField}
                value={getDisplayValue('ebitda')}
                onFocus={() => handleFocus('ebitda')}
                onChange={e => handleChange('ebitda', e.target.value)}
                onBlur={() => handleBlur('ebitda')}
                placeholder="290.000"
              />
            </div>
          </div>

          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="campo-ventas">Ventas anuales</label>
            <div className={styles.campoInputWrapper}>
              <span className={styles.campoSufijo}>€</span>
              <input
                id="campo-ventas"
                type="text"
                inputMode="decimal"
                className={styles.campoInputField}
                value={getDisplayValue('ventas')}
                onFocus={() => handleFocus('ventas')}
                onChange={e => handleChange('ventas', e.target.value)}
                onBlur={() => handleBlur('ventas')}
                placeholder="3.200.000"
              />
            </div>
          </div>

          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="campo-resultado-neto">Resultado Neto</label>
            <div className={styles.campoInputWrapper}>
              <span className={styles.campoSufijo}>€</span>
              <input
                id="campo-resultado-neto"
                type="text"
                inputMode="decimal"
                className={styles.campoInputField}
                value={getDisplayValue('resultadoNeto')}
                onFocus={() => handleFocus('resultadoNeto')}
                onChange={e => handleChange('resultadoNeto', e.target.value)}
                onBlur={() => handleBlur('resultadoNeto')}
                placeholder="180.000"
              />
            </div>
          </div>

          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="campo-patrimonio-neto">Patrimonio Neto</label>
            <div className={styles.campoInputWrapper}>
              <span className={styles.campoSufijo}>€</span>
              <input
                id="campo-patrimonio-neto"
                type="text"
                inputMode="decimal"
                className={styles.campoInputField}
                value={getDisplayValue('patrimonioNeto')}
                onFocus={() => handleFocus('patrimonioNeto')}
                onChange={e => handleChange('patrimonioNeto', e.target.value)}
                onBlur={() => handleBlur('patrimonioNeto')}
                placeholder="1.250.000"
              />
            </div>
          </div>

          <div className={styles.campoInput}>
            <label className={styles.campoLabel} htmlFor="campo-tasa">Tasa de capitalización</label>
            <div className={styles.campoInputWrapper}>
              <span className={styles.campoSufijo}>%</span>
              <input
                id="campo-tasa"
                type="text"
                inputMode="decimal"
                className={styles.campoInputField}
                value={getDisplayValue('tasaCapitalizacion')}
                onFocus={() => handleFocus('tasaCapitalizacion')}
                onChange={e => handleChange('tasaCapitalizacion', e.target.value)}
                onBlur={() => handleBlur('tasaCapitalizacion')}
                placeholder="15"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tarjetas de métodos ── */}
      <section>
        <div className={styles.resultadosGrid}>
          {resultados.map(r => (
            <div
              key={r.id}
              className={`${styles.metodoCarta} ${!r.valido ? styles.invalido : ''}`}
              style={{ borderTopColor: r.color }}
            >
              <div className={styles.metodoHeader}>
                <span className={styles.metodoIcono} aria-hidden="true">{r.icono}</span>
                <span className={styles.metodoNombre}>{r.nombre}</span>
              </div>
              {r.valido ? (
                <div className={styles.metodoRango}>
                  {r.max === r.min
                    ? fmtEur(r.min)
                    : `${fmtEur(r.min)} – ${fmtEur(r.max)}`
                  }
                </div>
              ) : (
                <div className={styles.metodoRangoNd}>Introduce datos para calcular</div>
              )}
              <div className={styles.metodoFormula}>{r.formula}</div>
              <p className={styles.metodoNota}>{r.nota}</p>
            </div>
          ))}
        </div>

        {/* Zona de consenso */}
        {hayConsensoPosible && (
          <div className={styles.consensoCard} role="region" aria-label="Rango de valoración consenso">
            <div className={styles.consensoLeft}>
              <span className={styles.consensoLabel}>Rango de valoración consenso</span>
              <div className={styles.consensoRango}>
                {fmtEur(consensoMin)} – {fmtEur(consensoMax)}
              </div>
              <p className={styles.consensoNota}>
                Basado en {metodosIngresos.length} método{metodosIngresos.length !== 1 ? 's' : ''} con datos disponibles (excluyendo valor contable)
              </p>
            </div>
            <div className={styles.consensoBadge}>
              <span className={styles.consensoBadgeNum}>{metodosIngresos.length}</span>
              <span className={styles.consensoBadgeLabel}>métodos usados</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Gráfico de barras ── */}
      {globalMax > 0 && (
        <section className={styles.graficaSection}>
          <h2 className={styles.graficaTitulo}>Comparación visual de métodos</h2>
          <div className={styles.escalaBarras} aria-hidden="true">
            {escalaTicks.map((tick, i) => (
              <span key={i} className={styles.escalaTick}>{tick}</span>
            ))}
          </div>
          <div className={styles.barrasWrapper}>
            {resultados.map(r => (
              <BarraRango
                key={r.id}
                min={r.min}
                max={r.max}
                globalMax={globalMax}
                color={r.color}
                label={r.nombre}
                valido={r.valido}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía de Valoración Empresarial"
        subtitle="Métodos, criterios y errores frecuentes en la valoración de empresas"
        icon="🎓"
      >
        <div className={styles.guideSection}>
          <h2>¿Cuándo usar cada método de valoración?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Mejor para</th>
                  <th>Limitaciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Múltiplo de EBITDA</strong></td>
                  <td>Empresas con beneficios estables, operaciones de M&A, comparables de sector</td>
                  <td>No sirve si el EBITDA es negativo o muy volátil</td>
                </tr>
                <tr>
                  <td><strong>Múltiplo de Ventas</strong></td>
                  <td>Startups en crecimiento, empresas con EBITDA bajo, comparación rápida</td>
                  <td>Ignora la rentabilidad; puede sobrevalorar negocios deficitarios</td>
                </tr>
                <tr>
                  <td><strong>Capitalización de Beneficios</strong></td>
                  <td>Empresas maduras con beneficios recurrentes y predecibles</td>
                  <td>Muy sensible a la tasa elegida; no capta potencial de crecimiento</td>
                </tr>
                <tr>
                  <td><strong>Valor Contable</strong></td>
                  <td>Empresas con activos tangibles importantes (industrial, inmobiliaria)</td>
                  <td>Infravalora intangibles (marca, equipo, cartera de clientes)</td>
                </tr>
                <tr>
                  <td><strong>DCF (flujos descontados)</strong></td>
                  <td>Empresas con proyecciones fiables a 5+ años, grandes operaciones</td>
                  <td>Muy sensible a hipótesis; requiere preparación de modelo financiero detallado</td>
                </tr>
                <tr>
                  <td><strong>Comparables cotizadas</strong></td>
                  <td>Empresas medianas con sector bursátil similar</td>
                  <td>Requiere descuento por iliquidez (15-30%); pocas cotizadas son comparables a pymes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Escenarios de valoración</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🤝</span>
              <h3>Venta total de la empresa</h3>
              <p>El comprador suele anclar la oferta en el múltiplo de EBITDA ajustado. El vendedor debe documentar los ajustes al EBITDA normalizado (gastos no recurrentes, salario de mercado del CEO).</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
              <h3>Entrada de socio inversor</h3>
              <p>El inversor negocia la valoración premoney. La zona de consenso entre métodos es el punto de partida habitual. El potencial de crecimiento futuro puede justificar una prima.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
              <h3>Sucesión familiar</h3>
              <p>En herencias y donaciones de empresa familiar, la valoración tiene implicaciones fiscales (IP, ISD). El valor contable y el de capitalización son los más usados en tasaciones oficiales.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏦</span>
              <h3>Valoración para financiación</h3>
              <p>Los bancos suelen usar el valor contable y los ratios de cobertura de deuda. Una valoración sólida puede mejorar las condiciones del préstamo y el acceso a líneas de financiación.</p>
            </div>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué los múltiplos de EBITDA varían tanto entre sectores?</dt>
              <dd>Reflejan las expectativas de crecimiento y el riesgo del sector. Una empresa de software puede crecer sin añadir personal (alta escalabilidad, múltiplos altos: 8-15x). Un restaurante tiene costes fijos altos, dependencia de ubicación y gestión intensiva (múltiplos bajos: 3-6x). Los múltiplos también reflejan las barreras de entrada: cuanto más difícil es replicar el negocio, mayor el múltiplo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el EBITDA ajustado o normalizado?</dt>
              <dd>Es el EBITDA tras eliminar gastos o ingresos no recurrentes que distorsionan la imagen real del negocio: costes de reestructuración, plusvalías por venta de activos, salario del dueño por encima o por debajo del mercado, alquiler de local a precio no de mercado. El EBITDA normalizado es el que los compradores usarán como base de valoración, no el EBITDA contable.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuál es una tasa de capitalización razonable para una pyme española?</dt>
              <dd>Para la mayoría de pymes españolas se usa entre el 12% y el 20%. Una tasa del 15% implica un PER (precio/beneficio) de 6,7 veces. Negocios más estables y predecibles justifican tasas menores (mayor valoración); negocios con alta dependencia del fundador o clientes concentrados requieren tasas más altas (menor valoración). La tasa debe reflejar el riesgo real percibido por el comprador.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Debo restar la deuda neta del valor calculado?</dt>
              <dd>Sí, es fundamental. Los métodos de múltiplo (EBITDA y ventas) calculan el Enterprise Value (EV), que incluye deuda y caja. El precio de las acciones (Equity Value) se obtiene restando la deuda financiera neta: EV - Deuda Financiera + Caja = Equity Value. Olvidar esta resta es uno de los errores más frecuentes y puede sobrevalorar significativamente el precio a pagar.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo influye la concentración de clientes en la valoración?</dt>
              <dd>Un cliente que representa más del 20-25% de la facturación es un factor de riesgo que los compradores descuentan de la valoración (habitualmente 10-20% del precio). La lógica es simple: si ese cliente se marcha, el negocio pierde una parte desproporcionada de sus ingresos. Diversificar la cartera antes de una venta es una de las formas más eficaces de aumentar el múltiplo obtenible.</dd>
            </div>
          </dl>
        </div>

        <div className={styles.guideSection}>
          <h2>5 pasos para preparar la venta de tu empresa</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Prepara la documentación financiera</strong>
                <p>Recopila los estados financieros auditados o revisados de los últimos 3 años, el presupuesto del año en curso y un plan de negocio a 3 años. Los compradores necesitan al menos 3 años de datos para calcular el EBITDA normalizado y valorar la tendencia del negocio.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Calcula el EBITDA ajustado</strong>
                <p>Identifica y documenta todos los ajustes al EBITDA: gastos no recurrentes, salarios fuera de mercado, alquileres vinculados al propietario, beneficios personales a cargo de la empresa. Un EBITDA bien documentado da más credibilidad y justifica un múltiplo más alto.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Resuelve contingencias previas</strong>
                <p>Inspecciones fiscales pendientes, litigios laborales, contratos sin documentar, derechos de propiedad intelectual no registrados. Cada contingencia conocida que el comprador descubra en el due diligence puede convertirse en una reducción de precio o en una garantía en el contrato.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Reduce la dependencia del fundador</strong>
                <p>Documenta procesos, forma al equipo directivo y distribuye relaciones clave con clientes y proveedores. Un negocio que funciona sin el fundador vale significativamente más que uno donde todo depende de una sola persona.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Negocia con criterio y asesoramiento</strong>
                <p>La valoración es un punto de partida, no el precio final. El precio depende de la estructura (100% al contado vs. earnout), las garantías exigidas, la permanencia del vendedor y el perfil del comprador. Un asesor M&A especializado en el sector suele recuperar su coste con creces.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className={styles.guideSection}>
          <h2>Claves de valoración</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <p><strong>Recurrencia de ingresos:</strong> Los negocios con ingresos recurrentes (suscripciones, contratos plurianuales) obtienen múltiplos más altos. La previsibilidad reduce el riesgo percibido por el comprador.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <p><strong>Usa varios métodos:</strong> La zona de consenso entre métodos es más robusta que un único método. Si EBITDA y capitalización de beneficios coinciden, el precio tiene más fundamento para ambas partes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <p><strong>El momento importa:</strong> Vender cuando el EBITDA está en máximos históricos y el sector está en auge maximiza el precio. Vender en un año malo o en un sector en recesión comprime el múltiplo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <p><strong>Datos de mercado reales:</strong> Los múltiplos de este simulador son orientativos. Para operaciones reales, consulta bases de datos de transacciones del sector (SABI, CapIQ, informes de banca de inversión).</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h2>Errores frecuentes en valoración de empresas</h2>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir facturación con beneficio:</strong> Una empresa con 5 millones de ventas y pérdidas no vale 5x ventas. El múltiplo de ventas solo tiene sentido si el negocio es rentable o con margen claro de mejora.</li>
            <li><strong>No ajustar el EBITDA:</strong> Usar el EBITDA contable sin normalizar (eliminando gastos personales, no recurrentes o de reestructuración) lleva a valoraciones distorsionadas que el comprador revisará en el due diligence.</li>
            <li><strong>Ignorar la deuda neta:</strong> Los métodos de múltiplo calculan el Enterprise Value (empresa completa con deuda). El precio de las acciones es Enterprise Value menos la deuda financiera neta. Olvidarlo puede suponer pagar millones de más.</li>
            <li><strong>Valorar activos a precio de libros sin ajuste:</strong> El valor contable refleja el coste histórico amortizado. Inmuebles, maquinaria y activos intangibles (marca, software propio) pueden valer muy por encima o por debajo de su valor en libros. Una tasación independiente es necesaria cuando los activos son relevantes en la operación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="calculadora-valoracion-empresa" />
      <Footer appName="calculadora-valoracion-empresa" />
    </div>
  );
}
