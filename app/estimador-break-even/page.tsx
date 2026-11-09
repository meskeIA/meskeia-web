'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorBreakEven.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTA_COSTES_FIJOS_VARIABLES } from './metadata';
import {
  calcularEquilibrio,
  clasificarImporte,
  errorDeImporte,
  resultadoEnEquilibrio,
  unidadesParaObjetivo,
  type LecturaImporte,
} from './motor';

/** Espacio duro antes del «%» (CLAUDE.md global §2, regla del 25/09/2026; hallazgo 4323). */
const PCT = ' %';

type Tendencia = 'mejora' | 'empeora' | 'neutro';

/**
 * Compara el equilibrio de un escenario con el actual. `null` es «no hay equilibrio»: antes era
 * un 0 centinela, y con margen negativo un precio más bajo salía como mejora en verde (4313).
 */
function compararEquilibrio(nuevo: number | null, actual: number | null): { texto: string; tendencia: Tendencia } {
  if (nuevo === null && actual === null) return { texto: 'sigue sin punto de equilibrio', tendencia: 'neutro' };
  if (nuevo === null) return { texto: 'sin punto de equilibrio', tendencia: 'empeora' };
  if (actual === null) return { texto: 'ahora sí hay punto de equilibrio', tendencia: 'mejora' };
  const dif = nuevo - actual;
  if (dif < 0) return { texto: `↓ ${formatNumber(-dif, 0)} uds menos`, tendencia: 'mejora' };
  if (dif > 0) return { texto: `↑ ${formatNumber(dif, 0)} uds más`, tendencia: 'empeora' };
  return { texto: 'igual que el actual', tendencia: 'neutro' };
}

function unidadesOSin(n: number | null): string {
  return n === null ? 'Sin equilibrio' : `${formatNumber(n, 0)} uds`;
}

/** Lee un campo del escenario personalizado: vacío = el valor actual; un 0 es un 0 (4314). */
function leerEscenario(l: LecturaImporte, base: number): number | null {
  if (l.estado === 'vacio') return base;
  if (l.estado === 'ok') return l.valor;
  return null;
}

export default function CalculadoraBreakEvenPage() {
  // Inputs principales
  const [precioVenta, setPrecioVenta] = useState('50');
  const [costoVariable, setCostoVariable] = useState('20');
  const [costosFijos, setCostosFijos] = useState('5000');

  // Inputs opcionales para escenarios
  const [ventasActuales, setVentasActuales] = useState('200');
  const [objetivoGanancia, setObjetivoGanancia] = useState('2000');

  // Tab activo para escenarios
  const [tabActivo, setTabActivo] = useState<'basico' | 'escenarios'>('basico');

  // Escenarios what-if
  const [escenarioPrecio, setEscenarioPrecio] = useState('');
  const [escenarioCostoVar, setEscenarioCostoVar] = useState('');
  const [escenarioCostosFijos, setEscenarioCostosFijos] = useState('');

  // Lectura de los campos: un importe ilegible o negativo se NOMBRA y no se calcula con él.
  // Hasta el 09/11/2026 «|| 0» lo convertía en 0 y la app publicaba un resultado verosímil (4316).
  const lecturas = useMemo(() => ({
    precio: clasificarImporte(precioVenta, parseSpanishNumber),
    costoVar: clasificarImporte(costoVariable, parseSpanishNumber),
    fijos: clasificarImporte(costosFijos, parseSpanishNumber),
    ventas: clasificarImporte(ventasActuales, parseSpanishNumber),
    objetivo: clasificarImporte(objetivoGanancia, parseSpanishNumber),
  }), [precioVenta, costoVariable, costosFijos, ventasActuales, objetivoGanancia]);

  const errores = {
    precio: errorDeImporte(lecturas.precio, 'el precio de venta', 'El precio de venta no puede ser negativo.'),
    costoVar: errorDeImporte(lecturas.costoVar, 'el coste variable', 'El coste variable no puede ser negativo.'),
    fijos: errorDeImporte(lecturas.fijos, 'los costes fijos', 'Los costes fijos no pueden ser negativos.'),
    ventas: errorDeImporte(lecturas.ventas, 'las ventas actuales', 'Las ventas no pueden ser negativas.'),
    objetivo: errorDeImporte(lecturas.objetivo, 'el objetivo de ganancia', 'El objetivo de ganancia no puede ser negativo.'),
  };

  // Cálculos principales: null mientras falte un dato obligatorio o alguno no se pueda leer.
  const calculos = useMemo(() => {
    const { precio: lP, costoVar: lCV, fijos: lCF, ventas: lV, objetivo: lO } = lecturas;
    if (lP.estado !== 'ok' || lCV.estado !== 'ok' || lCF.estado !== 'ok') return null;
    if (lV.estado !== 'ok' && lV.estado !== 'vacio') return null;
    if (lO.estado !== 'ok' && lO.estado !== 'vacio') return null;

    const precio = lP.valor;
    const costoVar = lCV.valor;
    const fijos = lCF.valor;
    const ventas = lV.estado === 'ok' ? lV.valor : 0;
    const objetivo = lO.estado === 'ok' ? lO.valor : null;

    const eq = calcularEquilibrio(precio, costoVar, fijos);
    const margenContribucionPorcentaje = precio > 0 ? (eq.margen / precio) * 100 : null;
    const unidadesObjetivo = objetivo === null ? null : unidadesParaObjetivo(precio, costoVar, fijos, objetivo);

    // Situación actual
    const ingresosTotales = ventas * precio;
    const costosTotales = fijos + ventas * costoVar;
    const gananciaActual = ingresosTotales - costosTotales;

    return {
      precio,
      costoVar,
      fijos,
      objetivo,
      margenContribucion: eq.margen,
      margenContribucionPorcentaje,
      breakEvenUnidades: eq.unidades,
      breakEvenEuros: eq.euros,
      unidadesObjetivo,
      ingresosTotales,
      costosTotales,
      gananciaActual,
      // Sin equilibrio, ni porcentaje ni margen de seguridad: no hay contra qué medirlos.
      margenSeguridad: eq.unidades === null ? null : ventas - eq.unidades,
      resultadoEquilibrio: eq.unidades === null ? null : resultadoEnEquilibrio(precio, costoVar, fijos, eq.unidades),
      esRentable: gananciaActual > 0,
      ventasActuales: ventas,
    };
  }, [lecturas]);

  // Escenario personalizado: vacío = el valor actual; un 0 tecleado es un 0 (4314).
  const lecturasEscenario = useMemo(() => ({
    precio: clasificarImporte(escenarioPrecio, parseSpanishNumber),
    costoVar: clasificarImporte(escenarioCostoVar, parseSpanishNumber),
    fijos: clasificarImporte(escenarioCostosFijos, parseSpanishNumber),
  }), [escenarioPrecio, escenarioCostoVar, escenarioCostosFijos]);

  const erroresEscenario = {
    precio: errorDeImporte(lecturasEscenario.precio, 'el nuevo precio', 'El nuevo precio no puede ser negativo.'),
    costoVar: errorDeImporte(lecturasEscenario.costoVar, 'el nuevo coste variable', 'El nuevo coste variable no puede ser negativo.'),
    fijos: errorDeImporte(lecturasEscenario.fijos, 'los nuevos costes fijos', 'Los nuevos costes fijos no pueden ser negativos.'),
  };

  const escenarios = useMemo(() => {
    if (calculos === null) return null;
    const { precio, costoVar, fijos } = calculos;

    const pC = leerEscenario(lecturasEscenario.precio, precio);
    const cvC = leerEscenario(lecturasEscenario.costoVar, costoVar);
    const fC = leerEscenario(lecturasEscenario.fijos, fijos);

    return {
      actual: { breakEven: calculos.breakEvenUnidades, breakEvenEuros: calculos.breakEvenEuros },
      precioPlusTen: calcularEquilibrio(precio * 1.1, costoVar, fijos).unidades,
      costoVarMinusTen: calcularEquilibrio(precio, costoVar * 0.9, fijos).unidades,
      fijoMinusTwenty: calcularEquilibrio(precio, costoVar, fijos * 0.8).unidades,
      custom: pC === null || cvC === null || fC === null ? undefined : calcularEquilibrio(pC, cvC, fC).unidades,
    };
  }, [calculos, lecturasEscenario]);

  // Textos del resultado principal (estables en sus <span>, sin nodos que aparezcan y desaparezcan).
  const sinEquilibrio = calculos !== null && calculos.breakEvenUnidades === null;
  const cifraPrincipal = calculos === null || calculos.breakEvenUnidades === null ? '—' : formatNumber(calculos.breakEvenUnidades, 0);
  const rotuloPrincipal = calculos === null
    ? 'faltan datos o alguno no se puede leer'
    : sinEquilibrio ? 'no hay punto de equilibrio' : 'unidades/mes';
  let explicacionSinEquilibrio = '';
  if (calculos !== null && sinEquilibrio) {
    if (calculos.margenContribucion === 0) {
      explicacionSinEquilibrio = calculos.fijos > 0
        ? `El precio iguala al coste variable: cada unidad aporta 0 € a los costes fijos, así que ninguna cantidad de ventas cubre los ${formatCurrency(calculos.fijos)}. Con este precio el negocio no es viable.`
        : 'El precio iguala al coste variable: sin costes fijos no pierdes, pero ninguna venta deja beneficio.';
    } else {
      explicacionSinEquilibrio = `El precio no cubre el coste variable: cada unidad vendida pierde ${formatCurrency(-calculos.margenContribucion)}, y cuantas más vendes, más pierdes. Con este precio el negocio no es viable.`;
    }
  }

  // Barra de la situación actual
  let progresoIzquierda = '';
  let progresoDerecha = '';
  let progresoAncho = 0;
  if (calculos !== null) {
    const u = calculos.breakEvenUnidades;
    if (u === null) {
      progresoIzquierda = 'Sin punto de equilibrio';
      progresoDerecha = calculos.margenContribucion === 0
        ? 'Cada venta aporta 0 € a los costes fijos'
        : `Cada venta pierde ${formatCurrency(-calculos.margenContribucion)}`;
    } else if (u === 0) {
      // Sin costes fijos el equilibrio es 0 y cualquier venta ya da beneficio (4318).
      progresoIzquierda = 'Equilibrio superado: sin costes fijos, cada venta da beneficio';
      progresoDerecha = `Margen de seguridad: ${formatNumber(calculos.ventasActuales, 0)} uds`;
      progresoAncho = 100;
    } else {
      const pct = (calculos.ventasActuales / u) * 100;
      progresoIzquierda = `${formatNumber(pct, 0)}${PCT} del punto de equilibrio`;
      const ms = calculos.margenSeguridad ?? 0;
      progresoDerecha = ms >= 0
        ? `Margen de seguridad: ${formatNumber(ms, 0)} uds`
        : `Faltan: ${formatNumber(Math.abs(ms), 0)} uds`;
      progresoAncho = Math.min(pct, 100);
    }
  }

  // Tarjeta del objetivo
  let objetivoValor = '—';
  let objetivoDescripcion = 'Sin objetivo de ganancia: escríbelo arriba';
  if (calculos !== null && calculos.objetivo !== null) {
    if (calculos.unidadesObjetivo === null) {
      objetivoDescripcion = `Inalcanzable con este margen: ninguna venta permite ganar ${formatCurrency(calculos.objetivo)}`;
    } else {
      objetivoValor = formatNumber(calculos.unidadesObjetivo, 0);
      objetivoDescripcion = `Necesitas vender para ganar ${formatCurrency(calculos.objetivo)}`;
    }
  }

  const comparacionPrecio = escenarios ? compararEquilibrio(escenarios.precioPlusTen, escenarios.actual.breakEven) : null;
  const comparacionCosteVar = escenarios ? compararEquilibrio(escenarios.costoVarMinusTen, escenarios.actual.breakEven) : null;
  const comparacionFijos = escenarios ? compararEquilibrio(escenarios.fijoMinusTwenty, escenarios.actual.breakEven) : null;
  const comparacionCustom = escenarios && escenarios.custom !== undefined
    ? compararEquilibrio(escenarios.custom, escenarios.actual.breakEven)
    : null;
  const claseTendencia = (t: Tendencia): string => (t === 'mejora' ? styles.mejora : t === 'empeora' ? styles.empeora : '');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📊</span> Estimador Break-Even</h1>
        <p className={styles.subtitle}>
          Calcula el punto de equilibrio de tus productos y descubre cuántas unidades necesitas vender para empezar a ganar dinero
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de inputs */}
        <div className={styles.inputPanel}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos del Producto</h2>

            <div className={styles.inputGrid}>
              <NumberInput
                value={precioVenta}
                onChange={setPrecioVenta}
                label="Precio de venta (por unidad)"
                placeholder="50"
                suffix="€"
                min={0}
                acotarAlSalir={false}
                error={errores.precio}
                helperText="Lo que cobras por cada unidad"
              />
              <NumberInput
                value={costoVariable}
                onChange={setCostoVariable}
                label="Costo variable (por unidad)"
                placeholder="20"
                suffix="€"
                min={0}
                acotarAlSalir={false}
                error={errores.costoVar}
                helperText="Materia prima, producción, envío..."
              />
              <NumberInput
                value={costosFijos}
                onChange={setCostosFijos}
                label="Costos fijos mensuales"
                placeholder="5000"
                suffix="€"
                min={0}
                acotarAlSalir={false}
                error={errores.fijos}
                helperText="Alquiler, salarios, seguros..."
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Situación Actual (Opcional)</h2>
            <div className={styles.inputGrid}>
              <NumberInput
                value={ventasActuales}
                onChange={setVentasActuales}
                label="Ventas actuales (unidades/mes)"
                placeholder="200"
                min={0}
                acotarAlSalir={false}
                error={errores.ventas}
                helperText="Para comparar con el punto de equilibrio"
              />
              <NumberInput
                value={objetivoGanancia}
                onChange={setObjetivoGanancia}
                label="Objetivo de ganancia mensual"
                placeholder="2000"
                suffix="€"
                min={0}
                acotarAlSalir={false}
                error={errores.objetivo}
                helperText="Cuánto quieres ganar"
              />
            </div>
          </section>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {/* Resultado principal */}
          <div className={styles.resultadoPrincipal}>
            <h2 className={styles.resultadoTitulo}>Punto de Equilibrio</h2>
            <div className={styles.breakEvenBig}>
              <span className={styles.breakEvenNumero}>{cifraPrincipal}</span>
              <span className={styles.breakEvenLabel}>{rotuloPrincipal}</span>
            </div>
            {calculos !== null && calculos.breakEvenEuros !== null ? (
              <p key="equivalente" className={styles.breakEvenEuros}>
                Equivalente a <strong>{formatCurrency(calculos.breakEvenEuros)}</strong> en ventas
              </p>
            ) : (
              <p key="sin-equivalente" className={styles.breakEvenEuros}>
                {calculos === null
                  ? 'Completa el precio, el coste variable y los costes fijos con cifras válidas.'
                  : explicacionSinEquilibrio}
              </p>
            )}
          </div>

          {/* Cards de métricas */}
          {calculos !== null && (
          <div className={styles.metricsGrid}>
            <ResultCard
              title="Margen de Contribución"
              value={formatNumber(calculos.margenContribucion, 2)}
              unit="€/ud"
              variant="info"
              icon="📈"
              description={calculos.margenContribucionPorcentaje === null
                ? 'Sin precio no hay porcentaje'
                : `${formatNumber(calculos.margenContribucionPorcentaje, 1)}${PCT} del precio`}
            />
            <ResultCard
              title="Para tu objetivo"
              value={objetivoValor}
              unit="uds"
              variant="default"
              icon="🎯"
              description={objetivoDescripcion}
            />
          </div>
          )}

          {/* Estado actual */}
          {calculos !== null && calculos.ventasActuales > 0 && (
            <div className={`${styles.estadoActual} ${calculos.esRentable ? styles.estadoPositivo : styles.estadoNegativo}`}>
              <h3>Tu situación actual</h3>
              <div className={styles.estadoGrid}>
                <div className={styles.estadoItem}>
                  <span className={styles.estadoLabel}>Ventas</span>
                  <span className={styles.estadoValor}>{formatNumber(calculos.ventasActuales, 0)} uds</span>
                </div>
                <div className={styles.estadoItem}>
                  <span className={styles.estadoLabel}>Ingresos</span>
                  <span className={styles.estadoValor}>{formatCurrency(calculos.ingresosTotales)}</span>
                </div>
                <div className={styles.estadoItem}>
                  <span className={styles.estadoLabel}>Costos totales</span>
                  <span className={styles.estadoValor}>{formatCurrency(calculos.costosTotales)}</span>
                </div>
                <div className={styles.estadoItem}>
                  <span className={styles.estadoLabel}>{calculos.esRentable ? 'Ganancia' : 'Pérdida'}</span>
                  <span className={`${styles.estadoValor} ${calculos.esRentable ? styles.valorPositivo : styles.valorNegativo}`}>
                    <span>{calculos.esRentable ? '+' : ''}</span>{formatCurrency(calculos.gananciaActual)}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progresoWrapper}>
                <div className={styles.progresoInfo}>
                  <span>{progresoIzquierda}</span>
                  <span>{progresoDerecha}</span>
                </div>
                <div className={styles.progresoBarra}>
                  <div
                    className={`${styles.progresoRelleno} ${progresoAncho >= 100 ? styles.progresoCompleto : ''}`}
                    style={{ width: `${progresoAncho}%` }}
                  />
                  <div className={styles.progresoMeta} style={{ left: '100%' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs para escenarios */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tabActivo === 'basico' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('basico')}
            aria-pressed={tabActivo === 'basico'}
          >
            Análisis Básico
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tabActivo === 'escenarios' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('escenarios')}
            aria-pressed={tabActivo === 'escenarios'}
          >
            Escenarios What-If
          </button>
        </div>

        {calculos === null && (
          <div className={styles.tabContent}>
            <p className={styles.escenarioDesc}>
              Completa el precio, el coste variable y los costes fijos con cifras válidas para ver el desglose y los escenarios.
            </p>
          </div>
        )}

        {calculos !== null && tabActivo === 'basico' && (
          <div className={styles.tabContent}>
            <h3>Desglose de Costos</h3>
            <div className={styles.desgloseGrid}>
              <div className={styles.desgloseCard}>
                <h4>Por cada unidad vendida</h4>
                <div className={styles.desgloseItems}>
                  <div className={styles.desgloseItem}>
                    <span>Precio de venta</span>
                    <span className={styles.valorPositivo}>{formatCurrency(calculos.precio)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Costo variable</span>
                    <span className={styles.valorNegativo}>-{formatCurrency(calculos.costoVar)}</span>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                    <span>Margen de contribución</span>
                    <span>{formatCurrency(calculos.margenContribucion)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.desgloseCard}>
                <h4>En el punto de equilibrio</h4>
                {calculos.breakEvenUnidades === null || calculos.resultadoEquilibrio === null ? (
                  <p key="sin-desglose" className={styles.escenarioDesc}>
                    No hay punto de equilibrio: el precio no supera el coste variable.
                  </p>
                ) : (
                <div key="desglose" className={styles.desgloseItems}>
                  <div className={styles.desgloseItem}>
                    <span>Ingresos totales</span>
                    <span>{formatCurrency(calculos.breakEvenEuros ?? 0)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Costos fijos</span>
                    <span>-{formatCurrency(calculos.fijos)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>{`Costos variables (${calculos.breakEvenUnidades} uds)`}</span>
                    <span>-{formatCurrency(calculos.breakEvenUnidades * calculos.costoVar)}</span>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                    <span>Resultado</span>
                    {/* La suma real de las tres líneas: al redondear a unidades enteras casi
                        nunca es 0 (hallazgo 4317). */}
                    <span>
                      {calculos.resultadoEquilibrio === 0
                        ? `${formatCurrency(0)} (equilibrio)`
                        : `+${formatCurrency(calculos.resultadoEquilibrio)} (por redondear a unidades enteras)`}
                    </span>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {calculos !== null && escenarios !== null && tabActivo === 'escenarios' && (
          <div className={styles.tabContent}>
            <h3>¿Qué pasa si...?</h3>
            <p className={styles.escenarioDesc}>
              Compara diferentes escenarios para ver cómo afectan al punto de equilibrio
            </p>

            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">📊</span> Actual</h4>
                <p className={styles.escenarioBreakEven}>{unidadesOSin(escenarios.actual.breakEven)}</p>
                <p className={styles.escenarioSubtexto}>
                  {escenarios.actual.breakEvenEuros === null ? 'el precio no supera el coste variable' : formatCurrency(escenarios.actual.breakEvenEuros)}
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">📈</span> {'+10 % Precio'}</h4>
                <p className={styles.escenarioBreakEven}>{unidadesOSin(escenarios.precioPlusTen)}</p>
                <p className={`${styles.escenarioSubtexto} ${comparacionPrecio ? claseTendencia(comparacionPrecio.tendencia) : ''}`}>
                  {comparacionPrecio?.texto}
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">📉</span> {'−10 % Costo Var.'}</h4>
                <p className={styles.escenarioBreakEven}>{unidadesOSin(escenarios.costoVarMinusTen)}</p>
                <p className={`${styles.escenarioSubtexto} ${comparacionCosteVar ? claseTendencia(comparacionCosteVar.tendencia) : ''}`}>
                  {comparacionCosteVar?.texto}
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">🏢</span> {'−20 % Costos Fijos'}</h4>
                <p className={styles.escenarioBreakEven}>{unidadesOSin(escenarios.fijoMinusTwenty)}</p>
                <p className={`${styles.escenarioSubtexto} ${comparacionFijos ? claseTendencia(comparacionFijos.tendencia) : ''}`}>
                  {comparacionFijos?.texto}
                </p>
              </div>
            </div>

            {/* Escenario personalizado */}
            <div className={styles.escenarioCustom}>
              <h4><span aria-hidden="true">🔧</span> Escenario Personalizado</h4>
              <div className={styles.customInputs}>
                <NumberInput
                  value={escenarioPrecio}
                  onChange={setEscenarioPrecio}
                  label="Nuevo precio"
                  placeholder={formatNumber(calculos.precio, 2)}
                  suffix="€"
                  min={0}
                  acotarAlSalir={false}
                  error={erroresEscenario.precio}
                />
                <NumberInput
                  value={escenarioCostoVar}
                  onChange={setEscenarioCostoVar}
                  label="Nuevo costo variable"
                  placeholder={formatNumber(calculos.costoVar, 2)}
                  suffix="€"
                  min={0}
                  acotarAlSalir={false}
                  error={erroresEscenario.costoVar}
                />
                <NumberInput
                  value={escenarioCostosFijos}
                  onChange={setEscenarioCostosFijos}
                  label="Nuevos costos fijos"
                  placeholder={formatNumber(calculos.fijos, 2)}
                  suffix="€"
                  min={0}
                  acotarAlSalir={false}
                  error={erroresEscenario.fijos}
                />
              </div>
              <div className={styles.customResultado}>
                <span>Nuevo punto de equilibrio:</span>
                <strong>
                  {escenarios.custom === undefined
                    ? 'revisa los datos del escenario'
                    : escenarios.custom === null
                      ? 'sin equilibrio'
                      : `${formatNumber(escenarios.custom, 0)} unidades`}
                </strong>
                <span className={comparacionCustom ? claseTendencia(comparacionCustom.tendencia) : ''}>
                  {comparacionCustom
                    ? /^[↓↑]/.test(comparacionCustom.texto)
                      ? `(${comparacionCustom.texto} que el actual)`
                      : `(${comparacionCustom.texto})`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="estimador-break-even"
        collapsible={false}
      />


      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres entender mejor el punto de equilibrio?"
        subtitle="Conceptos clave, fórmulas y estrategias para mejorar tu rentabilidad"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el Punto de Equilibrio?</h2>
          <p className={styles.introParagraph}>
            El punto de equilibrio (break-even) es el número de unidades que necesitas vender para que
            <strong> tus ingresos igualen tus costos totales</strong>. Por debajo tienes pérdidas, por encima tienes ganancias.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📌</span> Fórmula básica</h4>
              <p>
                <strong>Punto de Equilibrio = Costos Fijos ÷ Margen de Contribución</strong><br /><br />
                Donde Margen de Contribución = Precio de Venta - Costo Variable por unidad
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📌</span> Costos Fijos vs Variables</h4>
              <p>
                <strong>Fijos:</strong> No cambian con las ventas (alquiler, salarios, seguros).<br />
                <strong>Variables:</strong> Aumentan con cada venta (materia prima, envío, comisiones).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📌</span> ¿Qué es el Margen de Seguridad?</h4>
              <p>
                Es la diferencia entre tus ventas actuales y el punto de equilibrio.
                Cuanto mayor sea, más colchón tienes ante caídas de ventas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📌</span> ¿Cómo reducir el break-even?</h4>
              <p>
                1. Subir el precio (si el mercado lo permite).<br />
                2. Reducir costos variables (negociar con proveedores).<br />
                3. Reducir costos fijos (optimizar gastos).
              </p>
            </div>
          </div>
        </section>

        {/* 1. Tabla Comparativa por tipo de negocio */}
        <section className={styles.guideSection}>
          <h2>Break-Even según tipo de negocio</h2>
          <p className={styles.introParagraph}>
            El punto de equilibrio varía enormemente según el modelo de negocio. Esta tabla te ayuda a contextualizar
            tus cifras y saber qué indicadores vigilar en cada sector.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de negocio</th>
                  <th>Costes fijos típicos</th>
                  <th>Costes variables principales</th>
                  <th>Margen bruto habitual</th>
                  <th>Indicador clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Retail físico</strong></td>
                  <td>Alquiler, personal, suministros</td>
                  <td>Coste de mercancía (COGS)</td>
                  <td>30–50 %</td>
                  <td>Ventas por m²</td>
                </tr>
                <tr>
                  <td><strong>E-commerce</strong></td>
                  <td>Plataforma, marketing, logística fija</td>
                  <td>Producto, envío, devoluciones</td>
                  <td>20–40 %</td>
                  <td>Coste de adquisición de cliente (CAC)</td>
                </tr>
                <tr>
                  <td><strong>Restaurante</strong></td>
                  <td>Alquiler, personal, licencias</td>
                  <td>Alimentos y bebidas (food cost)</td>
                  <td>60–70 %</td>
                  <td>Ticket medio y rotación de mesas</td>
                </tr>
                <tr>
                  <td><strong>SaaS / Software</strong></td>
                  <td>Desarrollo, infraestructura, ventas</td>
                  <td>Soporte, servidores por usuario</td>
                  <td>70–90 %</td>
                  <td>MRR y churn rate</td>
                </tr>
                <tr>
                  <td><strong>Consultoría</strong></td>
                  <td>Salarios consultores, oficina, formación</td>
                  <td>Viajes, materiales por proyecto</td>
                  <td>50–70 %</td>
                  <td>Tasa de utilización (horas facturadas)</td>
                </tr>
                <tr>
                  <td><strong>Fabricación</strong></td>
                  <td>Maquinaria, nave, personal fijo</td>
                  <td>Materias primas, energía, embalaje</td>
                  <td>25–45 %</td>
                  <td>Coste por unidad producida</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa el análisis break-even?</h2>
          <p className={styles.introParagraph}>
            El cálculo del punto de equilibrio es útil en múltiples situaciones cotidianas. Estos son los escenarios
            más frecuentes en los que esta herramienta marca la diferencia.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h3>Emprendedor evaluando un negocio</h3>
              </div>
              <p className={styles.escenarioExample}>
                Antes de abrir una tienda o lanzar un producto, calcula cuántas ventas mensuales necesitas
                para no perder dinero y si ese volumen es realista en tu mercado.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> ¿Cuándo sería rentable? Compara el break-even con la demanda estimada del mercado.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <h3>Autónomo calculando tarifa mínima</h3>
              </div>
              <p className={styles.escenarioExample}>
                Suma todos tus costes fijos mensuales (cuota de autónomos, software, formación, gestoría)
                y divídelos entre las horas facturables para obtener tu tarifa mínima viable.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Incluye tu sueldo deseado como coste fijo, no como beneficio residual.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <h3>E-commerce analizando viabilidad</h3>
              </div>
              <p className={styles.escenarioExample}>
                Con los costes de plataforma, marketing y logística fija definidos, calcula cuántos pedidos
                mensuales necesitas para cubrir gastos antes de invertir más en publicidad.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Considera el coste de devoluciones como coste variable adicional.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍽️</span>
                <h3>Restaurador ampliando con catering</h3>
              </div>
              <p className={styles.escenarioExample}>
                Antes de ofrecer un servicio de catering adicional, calcula si los ingresos extra cubren
                los costes variables asociados (personal extra, transporte, materiales) sin afectar al negocio principal.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Clave:</strong> Usa el break-even incremental: solo los costes que añade la nueva línea.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el break-even</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre break-even y rentabilidad?</h3>
              <p>
                El break-even es el punto donde no ganas ni pierdes: ingresos = costes totales. La rentabilidad va más allá:
                mide el beneficio obtenido una vez superado ese umbral. Un negocio puede alcanzar el break-even y seguir
                siendo poco rentable si el margen por encima es muy estrecho.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo calculo el margen de contribución?</h3>
              <p>
                Margen de contribución unitario = Precio de venta (sin IVA) − Coste variable por unidad.
                En porcentaje: (Margen de contribución / Precio de venta) × 100. Este porcentaje indica qué parte
                de cada euro vendido contribuye a cubrir los costes fijos.
              </p>
            </div>
            <div className={styles.faqItem}>
              {/* Misma fuente que el FAQPage del JSON-LD (metadata.ts, hallazgo 4321). */}
              <h3>{PREGUNTA_COSTES_FIJOS_VARIABLES.question}</h3>
              <p>{PREGUNTA_COSTES_FIJOS_VARIABLES.answer}</p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿El salario del autónomo es coste fijo?</h3>
              <p>
                Sí, debe tratarse como coste fijo. Es uno de los errores más comunes: no incluir la retribución
                propia en los costes. Si no lo haces, el break-even calculado no refleja la realidad y estarás
                trabajando gratis sin saberlo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cómo afecta el IVA al break-even?</h3>
              <p>
                El IVA no es un ingreso ni un coste real: es un impuesto que recaudas para Hacienda. Siempre
                calcula el break-even con precios y costes <strong>sin IVA</strong> (base imponible). Mezclar
                precios con y sin IVA es uno de los errores más frecuentes que distorsiona el análisis.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuánto tiempo es normal tardar en alcanzar el break-even?</h3>
              <p>
                No hay un plazo que valga para todos: depende del sector, de la inversión inicial y del volumen
                de ventas que puedas alcanzar, y varía mucho de un negocio a otro aun dentro del mismo sector.
                Lo importante no es solo cuándo, sino si el volumen de ventas necesario es alcanzable en tu mercado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué es el margen de seguridad?</h3>
              <p>
                Es la diferencia entre tus ventas actuales y el punto de equilibrio. Si vendes 200 unidades
                y el break-even está en 150, tu margen de seguridad es 50 unidades (25 %). Cuanto mayor sea,
                más resistente es tu negocio ante caídas de ventas o imprevistos.
              </p>
              <p className={styles.faqTip}>
                No hay un porcentaje que valga para todos: es un colchón que cada negocio fija según lo que
                varíen sus ventas (por ejemplo, con la temporada) y el riesgo que pueda asumir.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo calcular break-even por producto?</h3>
              <p>
                Sí, y es muy recomendable en negocios con múltiples líneas de producto. Asigna los costes fijos
                de forma proporcional a cada línea (por ventas, por margen o por uso real) y calcula un break-even
                específico. Esto te ayuda a identificar qué productos son prescindibles o cuáles merecen más inversión.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo calcular el break-even paso a paso</h2>
          <p className={styles.introParagraph}>
            Sigue estos 7 pasos para obtener el punto de equilibrio de cualquier negocio o producto de forma precisa.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Lista todos los costes fijos mensuales</h3>
                <p>
                  Incluye alquiler, seguros, salarios fijos, amortizaciones, cuota de autónomos, gestoría,
                  suscripciones de software y <strong>tu propio sueldo</strong>. Suma todos los gastos que
                  tienes aunque no vendas ni una unidad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Identifica los costes variables por unidad</h3>
                <p>
                  Calcula cuánto te cuesta producir o adquirir cada unidad: materia prima, coste de producto,
                  envío, embalaje, comisiones de pago y cualquier gasto que escale con las ventas.
                  Usa el coste medio si varía por volumen.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Determina el precio de venta sin IVA</h3>
                <p>
                  Usa siempre la <strong>base imponible</strong> (precio sin IVA). Si vendes a 121 € con IVA
                  incluido al 21 %, el precio a usar es 100 €. El IVA no es un ingreso tuyo: lo pagas íntegro
                  a Hacienda.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Calcula el margen de contribución unitario</h3>
                <p>
                  Margen de contribución = Precio de venta (sin IVA) − Coste variable por unidad.
                  Este valor indica cuánto contribuye cada unidad vendida a cubrir los costes fijos.
                  Si el resultado es negativo, el negocio no es viable.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Divide costes fijos entre margen de contribución</h3>
                <p>
                  Punto de equilibrio (unidades) = Costes fijos totales ÷ Margen de contribución unitario.
                  El resultado, redondeado hacia arriba, es el número mínimo de unidades que debes vender
                  cada mes para no perder dinero.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>El resultado son las unidades necesarias</h3>
                <p>
                  Compara este número con tu capacidad de producción y con la demanda del mercado.
                  Si el break-even requiere más unidades de las que puedes vender razonablemente,
                  debes revisar tus costes o tu modelo de precios antes de continuar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Multiplica por el precio para obtener la facturación mínima</h3>
                <p>
                  Facturación mínima = Unidades break-even × Precio de venta (sin IVA).
                  Esta es la cifra de negocio mensual que necesitas alcanzar para cubrir todos tus costes.
                  Si quieres un margen de seguridad, fija tu objetivo por encima de esa cifra, tanto como pida
                  el riesgo de tu negocio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas para el análisis break-even</h2>
          <p className={styles.introParagraph}>
            Calcular el punto de equilibrio una sola vez no es suficiente. Estas prácticas te ayudan a mantener
            el análisis actualizado y a tomar decisiones más sólidas.
          </p>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h3>Revisa el break-even trimestralmente</h3>
              <p>
                Los costes y precios cambian. Actualiza el análisis cada trimestre o cada vez que modifiques
                precios, añadas personal o cambies de proveedor.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <h3>Incluye tu propio sueldo como coste fijo</h3>
              <p>
                Define cuánto quieres cobrar mensualmente e inclúyelo en los costes fijos desde el primer día.
                Es el error más frecuente que distorsiona la viabilidad real del negocio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h3>Haz análisis de sensibilidad (escenarios ±20 %)</h3>
              <p>
                Calcula qué pasa si tus ventas caen un 20 % o si tus costes suben un 20 %. El break-even
                bajo esos escenarios te muestra la resistencia real de tu modelo de negocio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📦</span>
              <h3>Separa el break-even por línea de producto</h3>
              <p>
                Si tienes varios productos o servicios, calcula el break-even de cada uno por separado.
                Esto revela qué líneas son rentables y cuáles están subsidiando pérdidas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h3>Considera la estacionalidad</h3>
              <p>
                Si tu negocio tiene meses de alta y baja demanda, calcula el break-even mensual y anual
                por separado. El break-even anual te indica si el negocio es viable globalmente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
              <h3>Añade un margen de seguridad</h3>
              <p>
                Una vez calculado el break-even, establece tu objetivo de ventas mínimo por encima. Cuánto,
                lo decide el riesgo de tu negocio: cuanto más varíen tus ventas, mayor colchón. Este colchón
                absorbe imprevistos, estacionalidad y errores en las estimaciones.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        {/* Contenido estático: un <aside> con su encabezado. Hasta el 09/11/2026 llevaba
            role="alert", y al desplegar la guía el lector anunciaba de golpe sus 1.124
            caracteres (hallazgo 4324, mismo caso que el cabo C0053). */}
        <aside className={styles.warningBox} aria-labelledby="errores-frecuentes-break-even">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3 id="errores-frecuentes-break-even">Errores frecuentes al calcular el break-even</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Olvidar el propio salario como coste fijo.</strong> Si no te incluyes como gasto,
              el break-even calculado es inferior al real y estarás trabajando sin retribución sin saberlo.
            </li>
            <li>
              <strong>Trabajar con precios con IVA incluido.</strong> El IVA no es un ingreso: se paga íntegro
              a Hacienda. Usa siempre la base imponible (precio sin IVA) en todos los cálculos.
            </li>
            <li>
              <strong>No actualizar el análisis al cambiar precios o costes.</strong> Un break-even calculado
              hace seis meses puede estar completamente desactualizado si has cambiado tarifas o proveedores.
            </li>
            <li>
              <strong>Confundir beneficio cero con viabilidad.</strong> Alcanzar el break-even no cubre
              la inversión inicial ni el coste de oportunidad. La viabilidad real requiere un margen positivo
              sostenido durante meses o años.
            </li>
            <li>
              <strong>Ignorar los plazos de cobro (liquidez vs. rentabilidad).</strong> Puedes superar
              el break-even en papel y tener problemas de caja si cobras a 60 días pero pagas a 30.
              La liquidez y la rentabilidad son cosas distintas.
            </li>
            <li>
              <strong>No considerar la estacionalidad del negocio.</strong> Un break-even calculado con datos
              de meses pico puede ser inalcanzable en temporada baja, comprometiendo la tesorería anual.
            </li>
          </ul>
        </aside>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="estimador-break-even" />
      <Footer appName="estimador-break-even" />
    </div>
  );
}
