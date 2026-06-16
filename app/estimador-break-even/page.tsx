'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorBreakEven.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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
                <h4><span aria-hidden="true">📊</span> Actual</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.actual.breakEven, 0)} uds</p>
                <p className={styles.escenarioSubtexto}>{formatCurrency(escenarios.actual.breakEvenEuros)}</p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">📈</span> +10% Precio</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.precioPlusTen.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${escenarios.precioPlusTen.breakEven < escenarios.actual.breakEven ? styles.mejora : ''}`}>
                  {escenarios.precioPlusTen.breakEven < escenarios.actual.breakEven
                    ? `↓ ${formatNumber(escenarios.actual.breakEven - escenarios.precioPlusTen.breakEven, 0)} uds menos`
                    : `↑ ${formatNumber(escenarios.precioPlusTen.breakEven - escenarios.actual.breakEven, 0)} uds más`
                  }
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">📉</span> -10% Costo Var.</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.costoVarMinusTen.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${styles.mejora}`}>
                  ↓ {formatNumber(escenarios.actual.breakEven - escenarios.costoVarMinusTen.breakEven, 0)} uds menos
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <h4><span aria-hidden="true">🏢</span> -20% Costos Fijos</h4>
                <p className={styles.escenarioBreakEven}>{formatNumber(escenarios.fijoMinusTwenty.breakEven, 0)} uds</p>
                <p className={`${styles.escenarioSubtexto} ${styles.mejora}`}>
                  ↓ {formatNumber(escenarios.actual.breakEven - escenarios.fijoMinusTwenty.breakEven, 0)} uds menos
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
                  <th>Plazo para break-even</th>
                  <th>Indicador clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Retail físico</strong></td>
                  <td>Alquiler, personal, suministros</td>
                  <td>Coste de mercancía (COGS)</td>
                  <td>30–50 %</td>
                  <td>12–24 meses</td>
                  <td>Ventas por m²</td>
                </tr>
                <tr>
                  <td><strong>E-commerce</strong></td>
                  <td>Plataforma, marketing, logística fija</td>
                  <td>Producto, envío, devoluciones</td>
                  <td>20–40 %</td>
                  <td>6–18 meses</td>
                  <td>Coste de adquisición de cliente (CAC)</td>
                </tr>
                <tr>
                  <td><strong>Restaurante</strong></td>
                  <td>Alquiler, personal, licencias</td>
                  <td>Alimentos y bebidas (food cost)</td>
                  <td>60–70 %</td>
                  <td>18–36 meses</td>
                  <td>Ticket medio y rotación de mesas</td>
                </tr>
                <tr>
                  <td><strong>SaaS / Software</strong></td>
                  <td>Desarrollo, infraestructura, ventas</td>
                  <td>Soporte, servidores por usuario</td>
                  <td>70–90 %</td>
                  <td>6–24 meses</td>
                  <td>MRR y churn rate</td>
                </tr>
                <tr>
                  <td><strong>Consultoría</strong></td>
                  <td>Salarios consultores, oficina, formación</td>
                  <td>Viajes, materiales por proyecto</td>
                  <td>50–70 %</td>
                  <td>3–12 meses</td>
                  <td>Tasa de utilización (horas facturadas)</td>
                </tr>
                <tr>
                  <td><strong>Fabricación</strong></td>
                  <td>Maquinaria, nave, personal fijo</td>
                  <td>Materias primas, energía, embalaje</td>
                  <td>25–45 %</td>
                  <td>24–48 meses</td>
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
              <h3>¿Qué se considera coste fijo vs. variable?</h3>
              <p>
                <strong>Costes fijos:</strong> No cambian con el volumen de ventas (alquiler, seguros, salarios fijos,
                amortizaciones, cuota de autónomos). <strong>Costes variables:</strong> Aumentan proporcionalmente
                con cada unidad vendida (materia prima, envíos, comisiones de venta, embalaje).
              </p>
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
                Depende del sector: una consultoría puede lograrlo en 3–6 meses, mientras que un restaurante
                o una tienda física puede tardar 18–36 meses. Lo importante no es solo cuándo, sino si el
                volumen de ventas necesario es alcanzable en tu mercado.
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
                Se recomienda mantener un margen de seguridad mínimo del 15–20 % para absorber variaciones estacionales.
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
                  Añade un 15 % adicional como margen de seguridad recomendado.
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
              <h3>Añade un 15 % de margen de seguridad</h3>
              <p>
                Una vez calculado el break-even, establece tu objetivo de ventas mínimo un 15 % por encima.
                Este colchón absorbe imprevistos, estacionalidad y errores en las estimaciones.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <div className={styles.warningBox} role="alert">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes al calcular el break-even</h3>
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
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-break-even')} />

      <ShareCard appName="estimador-break-even" />
      <Footer appName="estimador-break-even" />
    </div>
  );
}
