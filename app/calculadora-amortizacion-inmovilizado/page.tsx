'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraAmortizacionInmovilizado.module.css';
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
  TABLA_AMORTIZACION_2026,
  MULTIPLICADORES_DEGRESIVO_2026,
  multiplicadorDegresivo,
  FISCAL_AMORTIZACION_META,
  type TipoActivoAmortizable,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MetodoKey = 'lineal' | 'degresivo' | 'digitos';

interface InputData {
  valorAdquisicion: string;
  valorResidual: string;
  vidaUtil: string; // años
}

interface FilaCuadro {
  anio: number;
  cuota: number;
  acumulada: number;
  vnc: number;
}

interface ResultadoMetodo {
  id: MetodoKey;
  nombre: string;
  descripcion: string;
  color: string;
  filas: FilaCuadro[];
  cuotaPrimerAnio: number;
  cuotaUltimoAnio: number;
  detalle: string;
}

const COLORES: Record<MetodoKey, string> = {
  lineal: '#2E86AB',
  degresivo: '#C0392B',
  digitos: '#48A9A6',
};

// ─── Datos de ejemplo (maquinaria) ──────────────────────────────────────────────

const DATOS_EJEMPLO: InputData = {
  valorAdquisicion: '50000',
  valorResidual: '2000',
  vidaUtil: '8',
};

const TIPO_EJEMPLO = 'maquinaria';

// ─── Motores de cálculo ─────────────────────────────────────────────────────────

function cuadroLineal(adq: number, res: number, n: number): FilaCuadro[] {
  const base = adq - res;
  const cuota = base / n;
  const filas: FilaCuadro[] = [];
  let acum = 0;
  for (let i = 1; i <= n; i++) {
    const c = i < n ? cuota : base - acum; // ajuste de redondeo en el último año
    acum += c;
    filas.push({ anio: i, cuota: c, acumulada: acum, vnc: adq - acum });
  }
  return filas;
}

function cuadroDegresivo(adq: number, res: number, n: number, pct: number): FilaCuadro[] {
  const filas: FilaCuadro[] = [];
  let vnc = adq;
  let acum = 0;
  for (let i = 1; i <= n; i++) {
    let c: number;
    if (i === n) {
      c = vnc - res; // el último período amortiza todo el saldo pendiente hasta el residual
    } else {
      c = vnc * pct;
      if (vnc - c < res) c = vnc - res; // no amortizar por debajo del valor residual
    }
    if (c < 0) c = 0;
    acum += c;
    vnc -= c;
    filas.push({ anio: i, cuota: c, acumulada: acum, vnc });
  }
  return filas;
}

function cuadroDigitos(adq: number, res: number, n: number): FilaCuadro[] {
  const base = adq - res;
  const sumaDigitos = (n * (n + 1)) / 2;
  const filas: FilaCuadro[] = [];
  let acum = 0;
  for (let i = 1; i <= n; i++) {
    const digito = n - i + 1; // método decreciente: el primer año el dígito mayor
    const c = i < n ? (base * digito) / sumaDigitos : base - acum;
    acum += c;
    filas.push({ anio: i, cuota: c, acumulada: acum, vnc: adq - acum });
  }
  return filas;
}

function calcularMetodos(datos: InputData): { metodos: ResultadoMetodo[]; valido: boolean; porcentajeDegresivo: number; multiplicador: number } {
  const adq = parseSpanishNumber(datos.valorAdquisicion) || 0;
  const res = parseSpanishNumber(datos.valorResidual) || 0;
  const n = Math.round(parseSpanishNumber(datos.vidaUtil) || 0);

  const valido = adq > 0 && n >= 1 && res >= 0 && res < adq;

  const mult = multiplicadorDegresivo(n);
  let pct = (1 / n) * mult;
  pct = Math.max(pct, MULTIPLICADORES_DEGRESIVO_2026.minimoPorcentaje / 100);
  pct = Math.min(pct, 1);

  if (!valido) {
    return { metodos: [], valido: false, porcentajeDegresivo: pct * 100, multiplicador: mult };
  }

  const fLineal = cuadroLineal(adq, res, n);
  const fDegresivo = cuadroDegresivo(adq, res, n, pct);
  const fDigitos = cuadroDigitos(adq, res, n);

  const metodos: ResultadoMetodo[] = [
    {
      id: 'lineal',
      nombre: 'Lineal',
      descripcion: 'Cuota constante todos los años',
      color: COLORES.lineal,
      filas: fLineal,
      cuotaPrimerAnio: fLineal[0].cuota,
      cuotaUltimoAnio: fLineal[fLineal.length - 1].cuota,
      detalle: `Base amortizable / ${n} años`,
    },
    {
      id: 'degresivo',
      nombre: 'Degresivo (% constante)',
      descripcion: 'Mayor amortización al principio',
      color: COLORES.degresivo,
      filas: fDegresivo,
      cuotaPrimerAnio: fDegresivo[0].cuota,
      cuotaUltimoAnio: fDegresivo[fDegresivo.length - 1].cuota,
      detalle: `${formatNumber(pct * 100, 1)} % sobre el saldo pendiente (×${formatNumber(mult, 1)})`,
    },
    {
      id: 'digitos',
      nombre: 'Suma de dígitos',
      descripcion: 'Decreciente, reparto por dígitos',
      color: COLORES.digitos,
      filas: fDigitos,
      cuotaPrimerAnio: fDigitos[0].cuota,
      cuotaUltimoAnio: fDigitos[fDigitos.length - 1].cuota,
      detalle: `Dígitos n…1, suma = ${(n * (n + 1)) / 2}`,
    },
  ];

  return { metodos, valido: true, porcentajeDegresivo: pct * 100, multiplicador: mult };
}

// ─── Gráfico SVG de evolución del Valor Neto Contable ───────────────────────────

interface GraficoProps {
  metodos: ResultadoMetodo[];
  adquisicion: number;
}

function GraficoVNC({ metodos, adquisicion }: GraficoProps) {
  const W = 620;
  const H = 260;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const n = metodos[0].filas.length;

  const x = (anio: number) => padL + (anio / n) * (W - padL - padR);
  const y = (valor: number) => padT + (1 - valor / adquisicion) * (H - padT - padB);

  const serie = (m: ResultadoMetodo) => {
    const puntos = [`${x(0)},${y(adquisicion)}`];
    m.filas.forEach(f => puntos.push(`${x(f.anio)},${y(f.vnc)}`));
    return puntos.join(' ');
  };

  const ticksY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      className={styles.grafico}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Evolución del valor neto contable según el método de amortización"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Líneas de referencia horizontales */}
      {ticksY.map(t => (
        <g key={t}>
          <line x1={padL} y1={y(adquisicion * t)} x2={W - padR} y2={y(adquisicion * t)} className={styles.gridLine} />
          <text x={padL - 8} y={y(adquisicion * t) + 4} className={styles.gridLabel} textAnchor="end">
            {formatNumber(Math.round((adquisicion * t) / 1000), 0)}k
          </text>
        </g>
      ))}
      {/* Eje X: años */}
      {metodos[0].filas.map(f => (
        <text key={f.anio} x={x(f.anio)} y={H - padB + 20} className={styles.gridLabel} textAnchor="middle">
          {f.anio}
        </text>
      ))}
      {/* Series */}
      {metodos.map(m => (
        <polyline key={m.id} points={serie(m)} fill="none" stroke={m.color} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraAmortizacionInmovilizado() {
  const [datos, setDatos] = useState<InputData>(DATOS_EJEMPLO);
  const [tipoActivo, setTipoActivo] = useState<string>(TIPO_EJEMPLO);
  const [metodoVista, setMetodoVista] = useState<MetodoKey>('lineal');
  const [rawValues, setRawValues] = useState<Partial<InputData>>({});

  const { metodos, valido, porcentajeDegresivo, multiplicador } = calcularMetodos(datos);
  const adquisicion = parseSpanishNumber(datos.valorAdquisicion) || 0;

  const tipoSeleccionado: TipoActivoAmortizable | undefined =
    TABLA_AMORTIZACION_2026.find(t => t.id === tipoActivo);

  const esPorcentaje = (campo: keyof InputData) => campo === 'vidaUtil';

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
    const num = parseSpanishNumber(datos[campo]) ?? 0;
    if (esPorcentaje(campo)) return String(num);
    return formatNumber(num, 0);
  };

  const seleccionarTipo = (t: TipoActivoAmortizable) => {
    setTipoActivo(t.id);
    // Sugerir la vida útil más rápida admitida (100 / coef. lineal máximo)
    const vidaSugerida = Math.max(1, Math.round(100 / t.coefLinealMax));
    setDatos(prev => ({ ...prev, vidaUtil: String(vidaSugerida) }));
    setRawValues(prev => {
      const next = { ...prev };
      delete next.vidaUtil;
      return next;
    });
  };

  const resetEjemplo = () => {
    setDatos(DATOS_EJEMPLO);
    setTipoActivo(TIPO_EJEMPLO);
    setMetodoVista('lineal');
    setRawValues({});
  };

  const relatedApps = getRelatedApps('calculadora-amortizacion-inmovilizado');

  const campos: { campo: keyof InputData; label: string; sufijo: string; placeholder: string }[] = [
    { campo: 'valorAdquisicion', label: 'Valor de adquisición', sufijo: '€', placeholder: '50.000' },
    { campo: 'valorResidual', label: 'Valor residual', sufijo: '€', placeholder: '2.000' },
    { campo: 'vidaUtil', label: 'Vida útil', sufijo: 'años', placeholder: '8' },
  ];

  const metodoActivo = metodos.find(m => m.id === metodoVista);

  // Concentración: % amortizado en la primera mitad de la vida útil
  const concentracion = (m: ResultadoMetodo): number => {
    const mitad = Math.ceil(m.filas.length / 2);
    const acumMitad = m.filas[mitad - 1]?.acumulada ?? 0;
    const base = adquisicion - (parseSpanishNumber(datos.valorResidual) || 0);
    return base > 0 ? (acumMitad / base) * 100 : 0;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🏭</span> Calculadora de Amortización de Inmovilizado
        </h1>
        <p className={styles.subtitle}>
          Compara los tres sistemas de amortización —lineal, degresivo y suma de dígitos— y obtén el
          cuadro año a año con la cuota, la amortización acumulada y el valor neto contable.
        </p>
      </header>

      <RegionBadge variant="es-data" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="high" collapsible={false} />
      <DataReference
        normativa="Amortización del inmovilizado (LIS art. 12.1)"
        fuente={FISCAL_AMORTIZACION_META.fuente}
        verificado={FISCAL_AMORTIZACION_META.verificado}
        urlOficial={FISCAL_AMORTIZACION_META.urlOficial}
        nota="Los coeficientes son orientativos (tabla oficial española) y puedes editarlos. Los tres métodos de cálculo son universales."
      />

      {/* ── Configuración ── */}
      <section className={styles.configSection}>
        <div className={styles.configHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Datos del activo</h2>
          <button type="button" onClick={resetEjemplo} className={styles.btnReset}>
            <span aria-hidden="true">🔄</span> Restablecer ejemplo
          </button>
        </div>

        <h3 className={styles.subLabel}>Tipo de activo (coeficientes orientativos)</h3>
        <div className={styles.tipoGrid} role="group" aria-label="Seleccionar tipo de activo">
          {TABLA_AMORTIZACION_2026.map(t => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tipoActivo === t.id}
              onClick={() => seleccionarTipo(t)}
              className={`${styles.btnTipo} ${tipoActivo === t.id ? styles.btnTipoActivo : ''}`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
        {tipoSeleccionado && (
          <p className={styles.tipoNota}>
            <strong>{tipoSeleccionado.nombre}:</strong> coeficiente lineal máximo {tipoSeleccionado.coefLinealMax} % ·
            período máximo {tipoSeleccionado.periodoMax} años (vida útil elegible entre {Math.round(100 / tipoSeleccionado.coefLinealMax)} y {tipoSeleccionado.periodoMax} años).
            {tipoSeleccionado.degresivoExcluido && ' El método degresivo por porcentaje constante no es aplicable a este tipo de activo según la LIS.'}
          </p>
        )}

        <div className={styles.inputsGrid}>
          {campos.map(c => (
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
          ))}
        </div>
      </section>

      {valido && metodoActivo ? (
        <>
          {/* ── Tarjetas resumen por método ── */}
          <section className={styles.resumenGrid}>
            {metodos.map(m => (
              <div key={m.id} className={styles.metodoCarta} style={{ borderTopColor: m.color }}>
                <div className={styles.metodoHeader}>
                  <span className={styles.metodoNombre}>{m.nombre}</span>
                  <span className={styles.metodoDesc}>{m.descripcion}</span>
                </div>
                <dl className={styles.metodoDetalle}>
                  <div className={styles.metodoFila}>
                    <dt>Cuota 1.er año</dt>
                    <dd>{formatNumber(Math.round(m.cuotaPrimerAnio), 0)} €</dd>
                  </div>
                  <div className={styles.metodoFila}>
                    <dt>Cuota último año</dt>
                    <dd>{formatNumber(Math.round(m.cuotaUltimoAnio), 0)} €</dd>
                  </div>
                  <div className={styles.metodoFila}>
                    <dt>Amortizado a mitad de vida</dt>
                    <dd>{formatNumber(concentracion(m), 0)} %</dd>
                  </div>
                </dl>
                <p className={styles.metodoFormulaNota}>{m.detalle}</p>
              </div>
            ))}
          </section>

          {/* ── Gráfico comparativo ── */}
          <section className={styles.graficaSection}>
            <h2 className={styles.graficaTitulo}>Evolución del valor neto contable</h2>
            <GraficoVNC metodos={metodos} adquisicion={adquisicion} />
            <div className={styles.leyenda}>
              {metodos.map(m => (
                <span key={m.id} className={styles.leyendaItem}>
                  <span className={styles.leyendaColor} style={{ background: m.color }} aria-hidden="true" />
                  {m.nombre}
                </span>
              ))}
            </div>
            <p className={styles.graficaNota}>
              El eje vertical es el valor que queda en libros; el horizontal, los años. La línea recta es el método lineal;
              las curvas que caen rápido al principio son el degresivo y la suma de dígitos.
            </p>
          </section>

          {/* ── Cuadro detallado ── */}
          <section className={styles.cuadroSection}>
            <div className={styles.cuadroHeader}>
              <h2 className={styles.graficaTitulo} style={{ margin: 0 }}>Cuadro de amortización</h2>
              <div className={styles.metodoSelector} role="group" aria-label="Elegir método del cuadro">
                {metodos.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={metodoVista === m.id}
                    onClick={() => setMetodoVista(m.id)}
                    className={`${styles.btnMetodo} ${metodoVista === m.id ? styles.btnMetodoActivo : ''}`}
                    style={metodoVista === m.id ? { background: m.color, borderColor: m.color } : undefined}
                  >
                    {m.nombre}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.cuadroTable}>
                <thead>
                  <tr>
                    <th>Año</th>
                    <th>Cuota de amortización</th>
                    <th>Amortización acumulada</th>
                    <th>Valor neto contable</th>
                  </tr>
                </thead>
                <tbody>
                  {metodoActivo.filas.map(f => (
                    <tr key={f.anio}>
                      <td>{f.anio}</td>
                      <td>{formatNumber(Math.round(f.cuota), 0)} €</td>
                      <td>{formatNumber(Math.round(f.acumulada), 0)} €</td>
                      <td>{formatNumber(Math.round(f.vnc), 0)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className={styles.avisoVacio}>
          Introduce un valor de adquisición mayor que cero, una vida útil de al menos 1 año y un valor residual
          inferior al de adquisición para generar los cuadros de amortización.
        </section>
      )}

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía de la amortización del inmovilizado"
        subtitle="Qué método elegir y cómo afecta a tus cuentas y a tus impuestos"
        icon="🎓"
      >
        <div className={styles.guideSection}>
          <h2>Los tres métodos de amortización</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Cómo reparte la cuota</th>
                  <th>Mejor para</th>
                  <th>A tener en cuenta</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lineal</strong></td>
                  <td>Misma cuota todos los años</td>
                  <td>Activos de uso uniforme; sencillez contable</td>
                  <td>No adelanta el gasto deducible</td>
                </tr>
                <tr>
                  <td><strong>Degresivo (% constante)</strong></td>
                  <td>Porcentaje fijo sobre el saldo pendiente</td>
                  <td>Activos que pierden valor rápido (tecnología)</td>
                  <td>No aplicable a edificios, mobiliario y enseres</td>
                </tr>
                <tr>
                  <td><strong>Suma de dígitos</strong></td>
                  <td>Cuotas decrecientes por reparto de dígitos</td>
                  <td>Adelantar el gasto de forma más suave que el degresivo</td>
                  <td>Requiere calcular la suma de dígitos cada año</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Casos de uso</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
              <h3>Equipos que se quedan obsoletos</h3>
              <p>Para ordenadores, software o maquinaria tecnológica, los métodos degresivos adelantan el gasto y reflejan mejor la pérdida real de valor en los primeros años.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
              <h3>Edificios e inmuebles</h3>
              <p>Para construcciones, mobiliario y enseres, la ley solo admite el método lineal. La cuota constante es además la más fácil de planificar a largo plazo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
              <h3>Optimizar la base imponible</h3>
              <p>Adelantar amortización reduce el beneficio de los primeros años y, con él, el impuesto. Es útil si esperas beneficios altos al inicio y prefieres diferir la tributación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h3>Aprender contabilidad</h3>
              <p>Comparar los tres cuadros lado a lado es la forma más clara de entender por qué el total amortizado es el mismo, pero el momento en que se reconoce el gasto cambia.</p>
            </div>
          </div>
        </div>

        <div className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué es la amortización del inmovilizado?</dt>
              <dd>Es el reparto del coste de un activo duradero (maquinaria, vehículos, equipos, edificios) a lo largo de los años en que se usa, en lugar de imputarlo todo de golpe en el año de compra. Refleja contablemente que el activo pierde valor con el tiempo y permite deducir ese gasto de forma escalonada. La base que se amortiza es el valor de adquisición menos el valor residual estimado.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué método de amortización me conviene?</dt>
              <dd>Depende del activo y de tu estrategia. El lineal es el más simple y el más usado. Los métodos degresivos (porcentaje constante y suma de dígitos) concentran el gasto en los primeros años, lo que conviene para activos que se deprecian rápido o cuando quieres reducir el beneficio fiscal de los primeros ejercicios. El total amortizado es idéntico en los tres: lo que cambia es el ritmo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo funciona el método degresivo de porcentaje constante?</dt>
              <dd>Se aplica un porcentaje fijo sobre el valor pendiente de amortizar cada año, por lo que la cuota va disminuyendo. En España, ese porcentaje se obtiene multiplicando el coeficiente lineal por 1,5 (vida útil menor de 5 años), 2 (de 5 a 8 años) o 2,5 (más de 8 años), con un mínimo del 11 %. El último año se amortiza todo el saldo pendiente. No es aplicable a edificios, mobiliario y enseres.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es la suma de dígitos?</dt>
              <dd>Es un método degresivo que reparte la base amortizable según una serie de dígitos. Si la vida útil es de 5 años, se suman 1+2+3+4+5 = 15, y el primer año se amortizan 5/15 de la base, el segundo 4/15, y así sucesivamente. Produce cuotas decrecientes, más suaves que el porcentaje constante, y al final la amortización acumulada coincide exactamente con la base amortizable.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cambia el total amortizado según el método?</dt>
              <dd>No. Los tres métodos amortizan exactamente la misma cantidad total (el valor de adquisición menos el residual) a lo largo de la vida útil. Lo único que cambia es la distribución temporal: cuánto se reconoce cada año. Por eso la decisión entre métodos es una cuestión de momento del gasto y de tesorería fiscal, no de cuantía total.</dd>
            </div>
          </dl>
        </div>

        <div className={styles.guideSection}>
          <h2>Cómo usar la calculadora paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Elige el tipo de activo</strong>
                <p>Selecciona la categoría más parecida a tu activo. La calculadora sugiere una vida útil dentro del rango admitido y muestra el coeficiente de referencia.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Introduce el valor de adquisición</strong>
                <p>Es el coste total de poner el activo en funcionamiento: precio de compra más transporte, instalación y otros gastos necesarios, sin el IVA deducible.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Estima el valor residual</strong>
                <p>Es lo que esperas obtener al final de la vida útil (venta o desguace). Si es despreciable, déjalo en cero. La base amortizable es la adquisición menos el residual.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Ajusta la vida útil</strong>
                <p>Puedes cambiar los años sugeridos dentro del rango fiscal admitido. La vida útil determina el coeficiente degresivo aplicable.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Compara y elige</strong>
                <p>Observa el gráfico y los cuadros de los tres métodos. Decide en función de si te interesa una cuota estable o adelantar el gasto deducible.</p>
              </div>
            </li>
          </ol>
        </div>

        <div className={styles.guideSection}>
          <h2>Buenas prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <p><strong>Respeta los límites fiscales:</strong> la vida útil debe estar entre 100/coeficiente máximo y el período máximo de las tablas para que la amortización sea deducible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <p><strong>Mantén el método elegido:</strong> cambiar de sistema de amortización de un activo de un año a otro requiere justificación y puede generar problemas en una inspección.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <p><strong>Piensa en la tesorería fiscal:</strong> adelantar amortización ahorra impuestos antes, pero los difiere: en los últimos años amortizarás menos y pagarás más.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <p><strong>Incluye todos los costes:</strong> el valor de adquisición incluye transporte, instalación y puesta en marcha, no solo el precio de factura.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h2>Errores frecuentes al amortizar el inmovilizado</h2>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Amortizar sobre el valor con IVA:</strong> si el IVA es deducible, no forma parte del valor amortizable. Solo se amortiza el coste neto del activo.</li>
            <li><strong>Olvidar el valor residual:</strong> amortizar el 100 % del valor de adquisición cuando el activo tendrá un valor de venta al final sobreestima el gasto.</li>
            <li><strong>Aplicar el degresivo a activos excluidos:</strong> edificios, mobiliario y enseres no admiten el método de porcentaje constante en la normativa española.</li>
            <li><strong>Confundir ritmo con cuantía:</strong> ningún método amortiza «más» en total. Elegir un método degresivo adelanta el gasto, no lo aumenta.</li>
            <li><strong>Salirse del rango de vida útil:</strong> amortizar más rápido que el coeficiente máximo o más lento que el período máximo puede hacer que la AEAT no admita parte del gasto.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="calculadora-amortizacion-inmovilizado" />
      <Footer appName="calculadora-amortizacion-inmovilizado" />
    </div>
  );
}
