'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraBreakEven.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';

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

  // Cálculos principales
  const calculos = useMemo(() => {
    const precio = parseSpanishNumber(precioVenta) || 0;
    const costoVar = parseSpanishNumber(costoVariable) || 0;
    const fijos = parseSpanishNumber(costosFijos) || 0;
    const ventas = parseSpanishNumber(ventasActuales) || 0;
    const objetivo = parseSpanishNumber(objetivoGanancia) || 0;

    // Margen de contribución (por unidad)
    const margenContribucion = precio - costoVar;
    const margenContribucionPorcentaje = precio > 0 ? (margenContribucion / precio) * 100 : 0;

    // Punto de equilibrio en unidades
    const breakEvenUnidades = margenContribucion > 0 ? Math.ceil(fijos / margenContribucion) : 0;

    // Punto de equilibrio en euros
    const breakEvenEuros = breakEvenUnidades * precio;

    // Unidades para alcanzar objetivo de ganancia
    const unidadesObjetivo = margenContribucion > 0 ? Math.ceil((fijos + objetivo) / margenContribucion) : 0;

    // Situación actual
    const ingresosTotales = ventas * precio;
    const costosTotales = fijos + (ventas * costoVar);
    const gananciaActual = ingresosTotales - costosTotales;
    const porcentajeBreakEven = breakEvenUnidades > 0 ? (ventas / breakEvenUnidades) * 100 : 0;

    // Margen de seguridad
    const margenSeguridad = ventas - breakEvenUnidades;
    const margenSeguridadPorcentaje = ventas > 0 ? (margenSeguridad / ventas) * 100 : 0;

    return {
      precio,
      costoVar,
      fijos,
      margenContribucion,
      margenContribucionPorcentaje,
      breakEvenUnidades,
      breakEvenEuros,
      unidadesObjetivo,
      ingresosTotales,
      costosTotales,
      gananciaActual,
      porcentajeBreakEven,
      margenSeguridad,
      margenSeguridadPorcentaje,
      esRentable: gananciaActual > 0,
      ventasActuales: ventas
    };
  }, [precioVenta, costoVariable, costosFijos, ventasActuales, objetivoGanancia]);

  // Cálculos de escenarios
  const escenarios = useMemo(() => {
    const precioBase = calculos.precio;
    const costoVarBase = calculos.costoVar;
    const fijosBase = calculos.fijos;

    const calcularEscenario = (precio: number, costoVar: number, fijos: number) => {
      const margen = precio - costoVar;
      const breakEven = margen > 0 ? Math.ceil(fijos / margen) : 0;
      return { margen, breakEven, breakEvenEuros: breakEven * precio };
    };

    // Escenario: +10% precio
    const esc1 = calcularEscenario(precioBase * 1.1, costoVarBase, fijosBase);

    // Escenario: -10% costos variables
    const esc2 = calcularEscenario(precioBase, costoVarBase * 0.9, fijosBase);

    // Escenario: -20% costos fijos
    const esc3 = calcularEscenario(precioBase, costoVarBase, fijosBase * 0.8);

    // Escenario personalizado
    const precioCustom = parseSpanishNumber(escenarioPrecio) || precioBase;
    const costoVarCustom = parseSpanishNumber(escenarioCostoVar) || costoVarBase;
    const fijosCustom = parseSpanishNumber(escenarioCostosFijos) || fijosBase;
    const escCustom = calcularEscenario(precioCustom, costoVarCustom, fijosCustom);

    return {
      actual: { breakEven: calculos.breakEvenUnidades, breakEvenEuros: calculos.breakEvenEuros },
      precioPlusTen: esc1,
      costoVarMinusTen: esc2,
      fijoMinusTwenty: esc3,
      custom: escCustom
    };
  }, [calculos, escenarioPrecio, escenarioCostoVar, escenarioCostosFijos]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📊 Calculadora Break-Even</h1>
        <p className={styles.subtitle}>
          Calcula el punto de equilibrio de tus productos y descubre cuántas unidades necesitas vender para empezar a ganar dinero
        </p>
      </header>

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
                helperText="Lo que cobras por cada unidad"
              />
              <NumberInput
                value={costoVariable}
                onChange={setCostoVariable}
                label="Costo variable (por unidad)"
                placeholder="20"
                suffix="€"
                min={0}
                helperText="Materia prima, producción, envío..."
              />
              <NumberInput
                value={costosFijos}
                onChange={setCostosFijos}
                label="Costos fijos mensuales"
                placeholder="5000"
                suffix="€"
                min={0}
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
                helperText="Para comparar con el punto de equilibrio"
              />
              <NumberInput
                value={objetivoGanancia}
                onChange={setObjetivoGanancia}
                label="Objetivo de ganancia mensual"
                placeholder="2000"
                suffix="€"
                min={0}
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
              <span className={styles.breakEvenNumero}>{formatNumber(calculos.breakEvenUnidades, 0)}</span>
              <span className={styles.breakEvenLabel}>unidades/mes</span>
            </div>
            <p className={styles.breakEvenEuros}>
              Equivalente a <strong>{formatCurrency(calculos.breakEvenEuros)}</strong> en ventas
            </p>
          </div>

          {/* Cards de métricas */}
          <div className={styles.metricsGrid}>
            <ResultCard
              title="Margen de Contribución"
              value={formatNumber(calculos.margenContribucion, 2)}
              unit="€/ud"
              variant="info"
              icon="📈"
              description={`${formatNumber(calculos.margenContribucionPorcentaje, 1)}% del precio`}
            />
            <ResultCard
              title="Para tu objetivo"
              value={formatNumber(calculos.unidadesObjetivo, 0)}
              unit="uds"
              variant="default"
              icon="🎯"
              description={`Necesitas vender para ganar ${formatCurrency(parseSpanishNumber(objetivoGanancia))}`}
            />
          </div>

          {/* Estado actual */}
          {calculos.ventasActuales > 0 && (
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
                    {calculos.esRentable ? '+' : ''}{formatCurrency(calculos.gananciaActual)}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progresoWrapper}>
                <div className={styles.progresoInfo}>
                  <span>{formatNumber(calculos.porcentajeBreakEven, 0)}% del punto de equilibrio</span>
                  <span>
                    {calculos.margenSeguridad >= 0
                      ? `Margen de seguridad: ${formatNumber(calculos.margenSeguridad, 0)} uds`
                      : `Faltan: ${formatNumber(Math.abs(calculos.margenSeguridad), 0)} uds`
                    }
                  </span>
                </div>
                <div className={styles.progresoBarra}>
                  <div
                    className={`${styles.progresoRelleno} ${calculos.porcentajeBreakEven >= 100 ? styles.progresoCompleto : ''}`}
                    style={{ width: `${Math.min(calculos.porcentajeBreakEven, 100)}%` }}
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
            className={`${styles.tab} ${tabActivo === 'basico' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('basico')}
          >
            Análisis Básico
          </button>
          <button
            className={`${styles.tab} ${tabActivo === 'escenarios' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('escenarios')}
          >
            Escenarios What-If
          </button>
        </div>

        {tabActivo === 'basico' && (
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
                <div className={styles.desgloseItems}>
                  <div className={styles.desgloseItem}>
                    <span>Ingresos totales</span>
                    <span>{formatCurrency(calculos.breakEvenEuros)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Costos fijos</span>
                    <span>-{formatCurrency(calculos.fijos)}</span>
                  </div>
                  <div className={styles.desgloseItem}>
                    <span>Costos variables ({calculos.breakEvenUnidades} uds)</span>
                    <span>-{formatCurrency(calculos.breakEvenUnidades * calculos.costoVar)}</span>
                  </div>
                  <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                    <span>Resultado</span>
                    <span>0 € (equilibrio)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabActivo === 'escenarios' && (
          <div className={styles.tabContent}>
            <h3>¿Qué pasa si...?</h3>
            <p className={styles.escenarioDesc}>
              Compara diferentes escenarios para ver cómo afectan al punto de equilibrio
            </p>

            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h4>📊 Actual</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.actual.breakEven, 0)} uds</p>
                <p className={styles.escenarioSubtexto}>{formatCurrency(escenarios.actual.breakEvenEuros)}</p>
              </div>
              <div className={styles.escenarioCard}>
                <h4>📈 +10% Precio</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.precioPlusTen.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${escenarios.precioPlusTen.breakEven < escenarios.actual.breakEven ? styles.mejora : ''}`}>
                  {escenarios.precioPlusTen.breakEven < escenarios.actual.breakEven
                    ? `↓ ${formatNumber(escenarios.actual.breakEven - escenarios.precioPlusTen.breakEven, 0)} uds menos`
                    : `↑ ${formatNumber(escenarios.precioPlusTen.breakEven - escenarios.actual.breakEven, 0)} uds más`
                  }
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4>📉 -10% Costo Var.</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.costoVarMinusTen.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${styles.mejora}`}>
                  ↓ {formatNumber(escenarios.actual.breakEven - escenarios.costoVarMinusTen.breakEven, 0)} uds menos
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4>🏢 -20% Costos Fijos</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.fijoMinusTwenty.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${styles.mejora}`}>
                  ↓ {formatNumber(escenarios.actual.breakEven - escenarios.fijoMinusTwenty.breakEven, 0)} uds menos
                </p>
              </div>
            </div>

            {/* Escenario personalizado */}
            <div className={styles.escenarioCustom}>
              <h4>🔧 Escenario Personalizado</h4>
              <div className={styles.customInputs}>
                <NumberInput
                  value={escenarioPrecio}
                  onChange={setEscenarioPrecio}
                  label="Nuevo precio"
                  placeholder={String(calculos.precio)}
                  suffix="€"
                />
                <NumberInput
                  value={escenarioCostoVar}
                  onChange={setEscenarioCostoVar}
                  label="Nuevo costo variable"
                  placeholder={String(calculos.costoVar)}
                  suffix="€"
                />
                <NumberInput
                  value={escenarioCostosFijos}
                  onChange={setEscenarioCostosFijos}
                  label="Nuevos costos fijos"
                  placeholder={String(calculos.fijos)}
                  suffix="€"
                />
              </div>
              <div className={styles.customResultado}>
                <span>Nuevo punto de equilibrio:</span>
                <strong>{formatNumber(escenarios.custom.breakEven, 0)} unidades</strong>
                <span className={escenarios.custom.breakEven < escenarios.actual.breakEven ? styles.mejora : styles.empeora}>
                  ({escenarios.custom.breakEven < escenarios.actual.breakEven ? '↓' : '↑'}
                  {formatNumber(Math.abs(escenarios.custom.breakEven - escenarios.actual.breakEven), 0)} vs actual)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona <strong>estimaciones simplificadas</strong> del punto de equilibrio.
          En la realidad, los costos pueden variar, hay estacionalidad y otros factores.
          Usa estos datos como guía, no como decisión final de negocio.
        </p>
      </div>

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
              <h4>📌 Fórmula básica</h4>
              <p>
                <strong>Punto de Equilibrio = Costos Fijos ÷ Margen de Contribución</strong><br /><br />
                Donde Margen de Contribución = Precio de Venta - Costo Variable por unidad
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Costos Fijos vs Variables</h4>
              <p>
                <strong>Fijos:</strong> No cambian con las ventas (alquiler, salarios, seguros).<br />
                <strong>Variables:</strong> Aumentan con cada venta (materia prima, envío, comisiones).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Qué es el Margen de Seguridad?</h4>
              <p>
                Es la diferencia entre tus ventas actuales y el punto de equilibrio.
                Cuanto mayor sea, más colchón tienes ante caídas de ventas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 ¿Cómo reducir el break-even?</h4>
              <p>
                1. Subir el precio (si el mercado lo permite).<br />
                2. Reducir costos variables (negociar con proveedores).<br />
                3. Reducir costos fijos (optimizar gastos).
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-break-even" />
    </div>
  );
}
