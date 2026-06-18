'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraZScoreAltman.module.css';
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

type ModeloKey = 'original' | 'privada' | 'servicios';

interface ModeloDef {
  label: string;
  nota: string;
  usaMercado: boolean;       // X4 con valor de mercado en vez de contable
  usaVentas: boolean;        // incluye X5 (rotación de activos)
  coef: { x1: number; x2: number; x3: number; x4: number; x5: number };
  zonaSegura: number;        // Z por encima → segura
  zonaInsolvencia: number;   // Z por debajo → insolvencia
}

interface InputData {
  activoCorriente: string;
  pasivoCorriente: string;
  activoTotal: string;
  beneficiosRetenidos: string;  // reservas acumuladas
  ebit: string;                 // resultado de explotación (BAII)
  patrimonioNeto: string;       // valor contable de los fondos propios
  valorMercado: string;         // capitalización bursátil (solo modelo cotizada)
  pasivoTotal: string;
  ventas: string;               // ingresos / cifra de negocio
}

type ZonaKey = 'segura' | 'gris' | 'insolvencia';

// ─── Modelos de Altman ──────────────────────────────────────────────────────────
// Coeficientes y umbrales de las tres variantes publicadas por Edward Altman.

const MODELOS: Record<ModeloKey, ModeloDef> = {
  original: {
    label: 'Cotizada (Z, 1968)',
    nota: 'Empresas industriales que cotizan en bolsa. X4 usa el valor de mercado de los fondos propios (capitalización bursátil).',
    usaMercado: true,
    usaVentas: true,
    coef: { x1: 1.2, x2: 1.4, x3: 3.3, x4: 0.6, x5: 1.0 },
    zonaSegura: 2.99,
    zonaInsolvencia: 1.81,
  },
  privada: {
    label: "No cotizada / industrial (Z', 1983)",
    nota: 'Pymes industriales que no cotizan. X4 usa el valor contable del patrimonio neto. Es el modelo habitual para una pyme manufacturera.',
    usaMercado: false,
    usaVentas: true,
    coef: { x1: 0.717, x2: 0.847, x3: 3.107, x4: 0.420, x5: 0.998 },
    zonaSegura: 2.90,
    zonaInsolvencia: 1.23,
  },
  servicios: {
    label: "Servicios / no industrial (Z'', 1995)",
    nota: 'Empresas de servicios, comercio y mercados emergentes. No incluye la rotación de activos (X5), que varía mucho entre sectores.',
    usaMercado: false,
    usaVentas: false,
    coef: { x1: 6.56, x2: 3.26, x3: 6.72, x4: 1.05, x5: 0 },
    zonaSegura: 2.60,
    zonaInsolvencia: 1.10,
  },
};

const ZONAS: Record<ZonaKey, { label: string; color: string; mensaje: string }> = {
  segura: {
    label: 'Zona segura',
    color: '#1f9d55',
    mensaje: 'La empresa muestra solidez financiera. La probabilidad de insolvencia a 2 años es baja según el modelo.',
  },
  gris: {
    label: 'Zona gris (precaución)',
    color: '#f59e0b',
    mensaje: 'Zona de incertidumbre. El modelo no permite descartar problemas: conviene vigilar de cerca la liquidez y la rentabilidad.',
  },
  insolvencia: {
    label: 'Zona de insolvencia',
    color: '#c0392b',
    mensaje: 'Señal de alerta. El modelo asocia esta puntuación a una probabilidad elevada de dificultades financieras graves a 2 años.',
  },
};

// ─── Datos de ejemplo (pyme industrial no cotizada → modelo Z') ──────────────────

const DATOS_EJEMPLO: InputData = {
  activoCorriente: '450000',
  pasivoCorriente: '280000',
  activoTotal: '1200000',
  beneficiosRetenidos: '180000',
  ebit: '145000',
  patrimonioNeto: '520000',
  valorMercado: '0',
  pasivoTotal: '680000',
  ventas: '1650000',
};

const MODELO_EJEMPLO: ModeloKey = 'privada';

// ─── Lógica de cálculo ──────────────────────────────────────────────────────────

interface ComponenteZ {
  id: string;
  etiqueta: string;
  formula: string;
  ratio: number;
  coef: number;
  aporte: number;
}

interface ResultadoZ {
  z: number;
  zona: ZonaKey;
  componentes: ComponenteZ[];
  valido: boolean;
}

function calcularZScore(datos: InputData, modeloKey: ModeloKey): ResultadoZ {
  const m = MODELOS[modeloKey];
  const p = (k: keyof InputData) => parseSpanishNumber(datos[k]) || 0;
  const activoTotal = p('activoTotal');
  const pasivoTotal = p('pasivoTotal');

  const valido = activoTotal > 0 && pasivoTotal > 0;

  const capitalCirculante = p('activoCorriente') - p('pasivoCorriente');
  const equityX4 = m.usaMercado ? p('valorMercado') : p('patrimonioNeto');

  const x1 = valido ? capitalCirculante / activoTotal : 0;
  const x2 = valido ? p('beneficiosRetenidos') / activoTotal : 0;
  const x3 = valido ? p('ebit') / activoTotal : 0;
  const x4 = valido ? equityX4 / pasivoTotal : 0;
  const x5 = valido ? p('ventas') / activoTotal : 0;

  const componentes: ComponenteZ[] = [
    { id: 'x1', etiqueta: 'Capital circulante / Activo total', formula: '(Act. corriente − Pas. corriente) / Activo total', ratio: x1, coef: m.coef.x1, aporte: x1 * m.coef.x1 },
    { id: 'x2', etiqueta: 'Beneficios retenidos / Activo total', formula: 'Reservas acumuladas / Activo total', ratio: x2, coef: m.coef.x2, aporte: x2 * m.coef.x2 },
    { id: 'x3', etiqueta: 'EBIT / Activo total', formula: 'Resultado de explotación / Activo total', ratio: x3, coef: m.coef.x3, aporte: x3 * m.coef.x3 },
    { id: 'x4', etiqueta: m.usaMercado ? 'Valor de mercado / Pasivo total' : 'Patrimonio neto / Pasivo total', formula: m.usaMercado ? 'Capitalización bursátil / Pasivo total' : 'Patrimonio neto contable / Pasivo total', ratio: x4, coef: m.coef.x4, aporte: x4 * m.coef.x4 },
  ];
  if (m.usaVentas) {
    componentes.push({ id: 'x5', etiqueta: 'Ventas / Activo total', formula: 'Cifra de negocio / Activo total', ratio: x5, coef: m.coef.x5, aporte: x5 * m.coef.x5 });
  }

  const z = componentes.reduce((acc, c) => acc + c.aporte, 0);

  let zona: ZonaKey = 'gris';
  if (z >= m.zonaSegura) zona = 'segura';
  else if (z <= m.zonaInsolvencia) zona = 'insolvencia';

  return { z, zona, componentes, valido };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraZScoreAltman() {
  const [datos, setDatos] = useState<InputData>(DATOS_EJEMPLO);
  const [modelo, setModelo] = useState<ModeloKey>(MODELO_EJEMPLO);
  const [rawValues, setRawValues] = useState<Partial<InputData>>({});

  const m = MODELOS[modelo];
  const resultado = calcularZScore(datos, modelo);
  const zonaInfo = ZONAS[resultado.zona];

  // Posición del marcador en la barra (escala 0 → zonaSegura+1)
  const escalaMax = m.zonaSegura + 1.2;
  const posMarcador = Math.max(0, Math.min(100, (resultado.z / escalaMax) * 100));
  const posInsolvencia = (m.zonaInsolvencia / escalaMax) * 100;
  const posSegura = (m.zonaSegura / escalaMax) * 100;

  const handleFocus = useCallback((campo: keyof InputData) => {
    setRawValues(prev => ({ ...prev, [campo]: datos[campo] }));
  }, [datos]);

  const handleChange = useCallback((campo: keyof InputData, valor: string) => {
    setRawValues(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const handleBlur = useCallback((campo: keyof InputData) => {
    const raw = rawValues[campo] ?? datos[campo];
    const parsed = parseSpanishNumber(raw);
    const normalizado = parsed != null && !isNaN(parsed) ? String(Math.round(parsed)) : '0';
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
    return formatNumber(n, 0);
  };

  const resetEjemplo = () => {
    setDatos(DATOS_EJEMPLO);
    setModelo(MODELO_EJEMPLO);
    setRawValues({});
  };

  const relatedApps = getRelatedApps('calculadora-z-score-altman');

  // Campos visibles según modelo
  const campos: { campo: keyof InputData; label: string; placeholder: string; oculto?: boolean }[] = [
    { campo: 'activoCorriente', label: 'Activo corriente', placeholder: '450.000' },
    { campo: 'pasivoCorriente', label: 'Pasivo corriente', placeholder: '280.000' },
    { campo: 'activoTotal', label: 'Activo total', placeholder: '1.200.000' },
    { campo: 'beneficiosRetenidos', label: 'Reservas (beneficios retenidos)', placeholder: '180.000' },
    { campo: 'ebit', label: 'EBIT (resultado de explotación)', placeholder: '145.000' },
    { campo: 'pasivoTotal', label: 'Pasivo total', placeholder: '680.000' },
    { campo: 'patrimonioNeto', label: 'Patrimonio neto (contable)', placeholder: '520.000', oculto: m.usaMercado },
    { campo: 'valorMercado', label: 'Valor de mercado (capitalización)', placeholder: '900.000', oculto: !m.usaMercado },
    { campo: 'ventas', label: 'Ventas (cifra de negocio)', placeholder: '1.650.000', oculto: !m.usaVentas },
  ];

  const maxAporteAbs = Math.max(...resultado.componentes.map(c => Math.abs(c.aporte)), 0.01);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📉</span> Calculadora del Z-Score de Altman
        </h1>
        <p className={styles.subtitle}>
          Mide el riesgo de insolvencia de una empresa a partir de su balance. Obtén la puntuación Z
          y sitúa el negocio en zona segura, gris o de insolvencia con los tres modelos de Altman.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="high" collapsible={false} />

      {/* ── Selector de modelo ── */}
      <section className={styles.configSection}>
        <div className={styles.configHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Tipo de empresa</h2>
          <button type="button" onClick={resetEjemplo} className={styles.btnReset}>
            <span aria-hidden="true">🔄</span> Restablecer ejemplo
          </button>
        </div>

        <div className={styles.modeloGrid} role="group" aria-label="Seleccionar modelo de Altman">
          {(Object.keys(MODELOS) as ModeloKey[]).map(key => (
            <button
              key={key}
              type="button"
              aria-pressed={modelo === key}
              onClick={() => setModelo(key)}
              className={`${styles.btnModelo} ${modelo === key ? styles.btnModeloActivo : ''}`}
            >
              {MODELOS[key].label}
            </button>
          ))}
        </div>
        <p className={styles.modeloNota}>{m.nota}</p>

        <div className={styles.inputsGrid}>
          {campos.filter(c => !c.oculto).map(c => (
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
                <span className={styles.campoSufijo}>€</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resultado ── */}
      {resultado.valido ? (
        <section className={styles.resultadoCard} style={{ borderColor: zonaInfo.color }}>
          <div className={styles.resultadoTop}>
            <div className={styles.resultadoScore}>
              <span className={styles.scoreLabel}>Z-Score</span>
              <span className={styles.scoreValor} style={{ color: zonaInfo.color }}>
                {formatNumber(resultado.z, 2)}
              </span>
            </div>
            <div className={styles.resultadoZona} style={{ background: zonaInfo.color }}>
              {zonaInfo.label}
            </div>
          </div>

          {/* Barra de zonas */}
          <div className={styles.barraZonas} role="img" aria-label={`Z-Score ${formatNumber(resultado.z, 2)}: ${zonaInfo.label}`}>
            <div className={styles.barraSegmentos}>
              <div className={styles.segInsolvencia} style={{ width: `${posInsolvencia}%` }} />
              <div className={styles.segGris} style={{ width: `${posSegura - posInsolvencia}%` }} />
              <div className={styles.segSegura} style={{ width: `${100 - posSegura}%` }} />
            </div>
            <div className={styles.marcador} style={{ left: `${posMarcador}%` }}>
              <span className={styles.marcadorPin} style={{ borderTopColor: zonaInfo.color }} />
            </div>
            <div className={styles.barraEtiquetas}>
              <span style={{ left: `${posInsolvencia}%` }}>{formatNumber(m.zonaInsolvencia, 2)}</span>
              <span style={{ left: `${posSegura}%` }}>{formatNumber(m.zonaSegura, 2)}</span>
            </div>
          </div>

          <p className={styles.resultadoMensaje}>{zonaInfo.mensaje}</p>

          {/* Desglose de componentes */}
          <h3 className={styles.desgloseTitulo}>Desglose de la puntuación</h3>
          <div className={styles.desgloseLista}>
            {resultado.componentes.map(c => (
              <div className={styles.desgloseFila} key={c.id}>
                <span className={styles.desgloseEtiqueta}>{c.etiqueta}</span>
                <div className={styles.desgloseBarraTrack}>
                  <div
                    className={styles.desgloseBarra}
                    style={{ width: `${(Math.abs(c.aporte) / maxAporteAbs) * 100}%`, background: c.aporte < 0 ? '#c0392b' : 'var(--primary)' }}
                  />
                </div>
                <span className={styles.desgloseAporte}>{c.aporte >= 0 ? '+' : ''}{formatNumber(c.aporte, 2)}</span>
              </div>
            ))}
          </div>
          <p className={styles.desgloseNota}>
            Cada barra es la contribución del ratio a la puntuación final (ratio × coeficiente del modelo). La suma es el Z-Score.
          </p>
        </section>
      ) : (
        <section className={styles.avisoVacio}>
          Introduce al menos el activo total y el pasivo total (mayores que cero) para calcular el Z-Score.
        </section>
      )}

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía del Z-Score de Altman"
        subtitle="Qué mide, cómo interpretarlo y qué errores evitar al predecir la insolvencia"
        icon="🎓"
      >
        <div className={styles.guideSection}>
          <h2>Los tres modelos de Altman</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Para qué empresa</th>
                  <th>Zona segura</th>
                  <th>Zona insolvencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Z (1968)</strong></td>
                  <td>Industriales cotizadas en bolsa</td>
                  <td>Z &gt; 2,99</td>
                  <td>Z &lt; 1,81</td>
                </tr>
                <tr>
                  <td><strong>Z&#39; (1983)</strong></td>
                  <td>Industriales no cotizadas (pymes)</td>
                  <td>Z&#39; &gt; 2,90</td>
                  <td>Z&#39; &lt; 1,23</td>
                </tr>
                <tr>
                  <td><strong>Z&#39;&#39; (1995)</strong></td>
                  <td>Servicios y mercados emergentes</td>
                  <td>Z&#39;&#39; &gt; 2,60</td>
                  <td>Z&#39;&#39; &lt; 1,10</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
            El modelo original solo es aplicable a empresas que cotizan, porque uno de sus ratios necesita el
            valor de mercado de las acciones. Para la inmensa mayoría de empresas —pymes que no cotizan— se usan
            las versiones Z&#39; y Z&#39;&#39;, que sustituyen ese dato por el valor contable del patrimonio neto.
          </p>
        </div>

        <div className={styles.guideSection}>
          <h2>Casos de uso</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏦</span>
              <h3>Análisis de riesgo de crédito</h3>
              <p>Los bancos y proveedores usan modelos tipo Z-Score para decidir si conceden financiación o aplazan pagos. Conocer tu propia puntuación te ayuda a anticipar cómo te ven.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
              <h3>Due diligence de un proveedor</h3>
              <p>Antes de depender de un proveedor clave o cerrar un contrato largo, revisar su Z-Score con sus cuentas depositadas detecta señales tempranas de fragilidad.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
              <h3>Autodiagnóstico de tu empresa</h3>
              <p>Calcular el Z-Score cada cierre de ejercicio y seguir su evolución es un termómetro de salud financiera más completo que un único ratio aislado.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h3>Aprender análisis financiero</h3>
              <p>El Z-Score se enseña en toda escuela de negocios porque combina liquidez, rentabilidad, solvencia y eficiencia en una sola fórmula. Es ideal para entender cómo se conectan los ratios.</p>
            </div>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué es el Z-Score de Altman y para qué sirve?</dt>
              <dd>Es un modelo estadístico creado por el profesor Edward Altman en 1968 que combina cinco ratios financieros del balance en una única puntuación para estimar la probabilidad de que una empresa entre en insolvencia en los dos años siguientes. Cuanto más alta es la puntuación, más sólida es la empresa. Se usa en banca, análisis de crédito y due diligence en todo el mundo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué modelo debo usar para mi empresa?</dt>
              <dd>Si tu empresa cotiza en bolsa y es industrial, el modelo original (Z). Si es una pyme industrial que no cotiza, el modelo Z&#39; (1983), que es el más habitual. Si es una empresa de servicios, comercio o de un mercado emergente, el modelo Z&#39;&#39; (1995), que elimina la rotación de activos porque varía demasiado entre sectores. Esta calculadora ajusta automáticamente los coeficientes y los datos pedidos según el modelo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué significa estar en la «zona gris»?</dt>
              <dd>La zona gris es el rango intermedio entre la zona segura y la de insolvencia. El modelo no puede clasificar con fiabilidad a la empresa: ni descarta problemas ni los confirma. En la práctica indica que conviene vigilar de cerca la liquidez y la rentabilidad, y analizar la tendencia respecto a ejercicios anteriores antes de sacar conclusiones.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es fiable el Z-Score para una empresa española?</dt>
              <dd>El modelo fue calibrado con empresas estadounidenses de finales del siglo XX, así que sus umbrales no son una ley universal: pueden no ajustarse perfectamente a sectores muy intensivos en capital, empresas tecnológicas o realidades fiscales y contables distintas. Es una herramienta de cribado útil para detectar señales de alerta, no un veredicto. Debe complementarse con el análisis del flujo de caja, el sector y la calidad de la gestión.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿De dónde saco los datos para calcularlo?</dt>
              <dd>Del balance y la cuenta de pérdidas y ganancias de la empresa: activo y pasivo (corriente y total), reservas, resultado de explotación (EBIT) y cifra de negocio. Para empresas españolas, las cuentas anuales depositadas en el Registro Mercantil contienen todos estos datos. El patrimonio neto contable se usa en los modelos Z&#39; y Z&#39;&#39; en lugar del valor de mercado.</dd>
            </div>
          </dl>
        </div>

        <div className={styles.guideSection}>
          <h2>Cómo calcular tu Z-Score paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Reúne las cuentas anuales</strong>
                <p>Necesitas el balance y la cuenta de resultados del último ejercicio cerrado. Para mayor fiabilidad, usa cuentas auditadas o las depositadas oficialmente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de empresa</strong>
                <p>Decide qué modelo aplica: cotizada industrial, pyme industrial no cotizada o empresa de servicios. El modelo determina los coeficientes y los umbrales de cada zona.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Introduce las magnitudes del balance</strong>
                <p>Activo corriente y total, pasivo corriente y total, reservas, EBIT y, según el modelo, ventas o patrimonio neto. La calculadora obtiene los cinco ratios automáticamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Interpreta la zona, no solo el número</strong>
                <p>Fíjate en si estás en zona segura, gris o de insolvencia, y en qué componente pesa más. Un EBIT bajo o un capital circulante negativo suelen ser los que arrastran la puntuación.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Compara con ejercicios anteriores</strong>
                <p>La tendencia importa más que el valor puntual. Un Z-Score que mejora año a año es buena señal aunque esté en zona gris; uno que cae rápido es una alerta aunque siga en zona segura.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <p><strong>Analiza la tendencia:</strong> Calcula el Z-Score de los últimos 3 ejercicios. La dirección del cambio dice más que la cifra de un solo año.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <p><strong>Combínalo con el cash flow:</strong> El Z-Score mira el balance; complétalo siempre con el análisis del flujo de caja, porque muchas empresas quiebran con beneficios pero sin liquidez.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏭</span>
              <p><strong>Elige bien el modelo:</strong> Aplicar el modelo de cotizadas a una pyme de servicios da resultados engañosos. El tipo de empresa cambia coeficientes y umbrales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <p><strong>Úsalo como cribado, no como veredicto:</strong> Es una señal de alerta temprana. Una puntuación baja invita a investigar, no a sentenciar.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h2>Errores frecuentes al usar el Z-Score</h2>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Aplicar el modelo equivocado:</strong> Usar el Z original (de cotizadas) en una pyme no cotizada distorsiona el resultado, porque exige el valor de mercado de las acciones que no existe.</li>
            <li><strong>Tomar el número como sentencia:</strong> El Z-Score es un modelo estadístico calibrado en otro contexto. Una puntuación baja es una alerta para investigar, no una certeza de quiebra.</li>
            <li><strong>Ignorar el sector:</strong> Empresas muy intensivas en capital o con modelos de negocio atípicos (tecnológicas, holdings) pueden dar puntuaciones bajas siendo solventes.</li>
            <li><strong>Olvidar el flujo de caja:</strong> El Z-Score analiza el balance, pero la insolvencia real llega por falta de liquidez. Un buen Z-Score no garantiza que haya caja para pagar mañana.</li>
            <li><strong>Usar datos no homogéneos:</strong> Mezclar reservas, EBIT y activos de criterios contables distintos o de fechas que no cuadran produce ratios sin sentido.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="calculadora-z-score-altman" />
      <Footer appName="calculadora-z-score-altman" />
    </div>
  );
}
