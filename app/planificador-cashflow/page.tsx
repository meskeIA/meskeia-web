'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorCashFlow.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface LineaIngreso {
  id: string;
  concepto: string;
  valores: string[];
}

interface LineaGasto {
  id: string;
  concepto: string;
  valores: string[];
  esFijo: boolean;
}

export default function PlanificadorCashFlowPage() {
  // Saldo inicial
  const [saldoInicial, setSaldoInicial] = useState('5000');

  // Líneas de ingresos
  const [ingresos, setIngresos] = useState<LineaIngreso[]>([
    { id: '1', concepto: 'Ventas/Facturación', valores: Array(12).fill('3000') },
    { id: '2', concepto: 'Otros ingresos', valores: Array(12).fill('0') },
  ]);

  // Líneas de gastos
  const [gastos, setGastos] = useState<LineaGasto[]>([
    { id: '1', concepto: 'Alquiler', valores: Array(12).fill('500'), esFijo: true },
    { id: '2', concepto: 'Nóminas/Seguridad Social', valores: Array(12).fill('1500'), esFijo: true },
    { id: '3', concepto: 'Suministros', valores: Array(12).fill('150'), esFijo: true },
    { id: '4', concepto: 'Proveedores/Compras', valores: Array(12).fill('800'), esFijo: false },
    { id: '5', concepto: 'Marketing', valores: Array(12).fill('200'), esFijo: false },
  ]);

  // Tab activo
  const [tabActivo, setTabActivo] = useState<'datos' | 'proyeccion' | 'escenarios'>('datos');

  // Escenario What-If
  const [escenarioIngresos, setEscenarioIngresos] = useState('0');
  const [escenarioGastos, setEscenarioGastos] = useState('0');

  // Funciones CRUD
  const actualizarIngreso = (id: string, mes: number, valor: string) => {
    setIngresos(prev => prev.map(ing =>
      ing.id === id
        ? { ...ing, valores: ing.valores.map((v, i) => i === mes ? valor : v) }
        : ing
    ));
  };

  const actualizarConceptoIngreso = (id: string, concepto: string) => {
    setIngresos(prev => prev.map(ing =>
      ing.id === id ? { ...ing, concepto } : ing
    ));
  };

  const agregarIngreso = () => {
    setIngresos(prev => [...prev, {
      id: String(Date.now()),
      concepto: 'Nuevo ingreso',
      valores: Array(12).fill('0')
    }]);
  };

  const eliminarIngreso = (id: string) => {
    setIngresos(prev => prev.filter(ing => ing.id !== id));
  };

  const copiarValorATodos = (linea: 'ingreso' | 'gasto', id: string, valor: string) => {
    if (linea === 'ingreso') {
      setIngresos(prev => prev.map(ing =>
        ing.id === id ? { ...ing, valores: Array(12).fill(valor) } : ing
      ));
    } else {
      setGastos(prev => prev.map(g =>
        g.id === id ? { ...g, valores: Array(12).fill(valor) } : g
      ));
    }
  };

  const actualizarGasto = (id: string, mes: number, valor: string) => {
    setGastos(prev => prev.map(g =>
      g.id === id
        ? { ...g, valores: g.valores.map((v, i) => i === mes ? valor : v) }
        : g
    ));
  };

  const actualizarConceptoGasto = (id: string, concepto: string) => {
    setGastos(prev => prev.map(g =>
      g.id === id ? { ...g, concepto } : g
    ));
  };

  const agregarGasto = (esFijo: boolean) => {
    setGastos(prev => [...prev, {
      id: String(Date.now()),
      concepto: esFijo ? 'Nuevo gasto fijo' : 'Nuevo gasto variable',
      valores: Array(12).fill('0'),
      esFijo
    }]);
  };

  const eliminarGasto = (id: string) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  // Cálculos
  const calculos = useMemo(() => {
    const saldoIni = parseSpanishNumber(saldoInicial) || 0;
    const ajusteIngresos = (parseSpanishNumber(escenarioIngresos) || 0) / 100;
    const ajusteGastos = (parseSpanishNumber(escenarioGastos) || 0) / 100;

    // Totales por mes
    const ingresosPorMes = Array(12).fill(0).map((_, mes) =>
      ingresos.reduce((sum, ing) => {
        const val = parseSpanishNumber(ing.valores[mes]) || 0;
        return sum + val * (1 + ajusteIngresos);
      }, 0)
    );

    const gastosPorMes = Array(12).fill(0).map((_, mes) =>
      gastos.reduce((sum, g) => {
        const val = parseSpanishNumber(g.valores[mes]) || 0;
        return sum + val * (1 + ajusteGastos);
      }, 0)
    );

    const flujoNetoPorMes = ingresosPorMes.map((ing, i) => ing - gastosPorMes[i]);

    // Saldo acumulado
    const saldoAcumulado: number[] = [];
    flujoNetoPorMes.forEach((flujo, i) => {
      const saldoAnterior = i === 0 ? saldoIni : saldoAcumulado[i - 1];
      saldoAcumulado.push(saldoAnterior + flujo);
    });

    // Métricas
    const totalIngresos = ingresosPorMes.reduce((a, b) => a + b, 0);
    const totalGastos = gastosPorMes.reduce((a, b) => a + b, 0);
    const flujoNetoTotal = totalIngresos - totalGastos;
    const saldoFinal = saldoAcumulado[11];

    // Meses en riesgo (saldo negativo o bajo)
    const umbralRiesgo = 1000;
    const mesesEnRiesgo = saldoAcumulado.filter(s => s < umbralRiesgo).length;
    const mesesNegativos = saldoAcumulado.filter(s => s < 0).length;

    // Mes más crítico
    const saldoMinimo = Math.min(...saldoAcumulado);
    const mesCritico = saldoAcumulado.indexOf(saldoMinimo);

    // Promedio mensual
    const promedioIngresos = totalIngresos / 12;
    const promedioGastos = totalGastos / 12;

    // Cobertura de gastos (meses que puedes sobrevivir con saldo actual)
    const coberturaGastos = promedioGastos > 0 ? saldoIni / promedioGastos : 0;

    return {
      saldoInicial: saldoIni,
      ingresosPorMes,
      gastosPorMes,
      flujoNetoPorMes,
      saldoAcumulado,
      totalIngresos,
      totalGastos,
      flujoNetoTotal,
      saldoFinal,
      mesesEnRiesgo,
      mesesNegativos,
      saldoMinimo,
      mesCritico,
      promedioIngresos,
      promedioGastos,
      coberturaGastos
    };
  }, [saldoInicial, ingresos, gastos, escenarioIngresos, escenarioGastos]);

  // Altura de barras para visualización
  const maxValor = Math.max(
    ...calculos.ingresosPorMes,
    ...calculos.gastosPorMes,
    Math.abs(calculos.saldoMinimo),
    calculos.saldoAcumulado[11]
  );

  const getAlturaBarra = (valor: number) => {
    return maxValor > 0 ? Math.abs(valor) / maxValor * 100 : 0;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💰</span> Planificador Cash Flow</h1>
        <p className={styles.subtitle}>
          Proyecta tu flujo de caja mes a mes. Identifica riesgos de liquidez y planifica tu tesorería.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Resumen rápido */}
      <section className={styles.resumenRapido}>
        <div className={styles.resumenGrid}>
          <ResultCard
            title="Saldo Final (12 meses)"
            value={formatNumber(calculos.saldoFinal, 0)}
            unit="€"
            variant={calculos.saldoFinal > 0 ? 'success' : 'warning'}
            icon={calculos.saldoFinal > 0 ? '✅' : '⚠️'}
          />
          <ResultCard
            title="Flujo Neto Anual"
            value={formatNumber(calculos.flujoNetoTotal, 0)}
            unit="€"
            variant={calculos.flujoNetoTotal > 0 ? 'success' : 'warning'}
            icon={calculos.flujoNetoTotal > 0 ? '📈' : '📉'}
          />
          <ResultCard
            title="Meses en Riesgo"
            value={formatNumber(calculos.mesesNegativos, 0)}
            unit=""
            variant={calculos.mesesNegativos === 0 ? 'success' : 'warning'}
            icon={calculos.mesesNegativos === 0 ? '🛡️' : '⚠️'}
            description="Con saldo negativo"
          />
          <ResultCard
            title="Cobertura de Gastos"
            value={formatNumber(calculos.coberturaGastos, 1)}
            unit="meses"
            variant={calculos.coberturaGastos > 3 ? 'success' : 'warning'}
            icon="📊"
            description="Con saldo inicial actual"
          />
        </div>
      </section>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tabActivo === 'datos' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('datos')}
            aria-pressed={tabActivo === 'datos'}
          >
            <span aria-hidden="true">📝</span> Datos
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tabActivo === 'proyeccion' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('proyeccion')}
            aria-pressed={tabActivo === 'proyeccion'}
          >
            <span aria-hidden="true">📊</span> Proyección
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tabActivo === 'escenarios' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('escenarios')}
            aria-pressed={tabActivo === 'escenarios'}
          >
            <span aria-hidden="true">🔮</span> Escenarios
          </button>
        </div>

        {/* Tab Datos */}
        {tabActivo === 'datos' && (
          <div className={styles.tabContent}>
            {/* Saldo inicial */}
            <div className={styles.saldoInicialCard}>
              <h3>Saldo Inicial en Caja</h3>
              <NumberInput
                value={saldoInicial}
                onChange={setSaldoInicial}
                label=""
                placeholder="5000"
                suffix="€"
                helperText="Dinero disponible al inicio del periodo"
              />
            </div>

            {/* Ingresos */}
            <div className={styles.seccionDatos}>
              <div className={styles.seccionHeader}>
                <h3><span aria-hidden="true">📈</span> Ingresos Previstos</h3>
                <button type="button" className={styles.btnAgregar} onClick={agregarIngreso}>
                  + Añadir Línea
                </button>
              </div>

              <div className={styles.tablaWrapper}>
                <table className={styles.tablaDatos}>
                  <thead>
                    <tr>
                      <th className={styles.thConcepto}>Concepto</th>
                      {MESES.map(mes => <th key={mes}>{mes}</th>)}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingresos.map(ing => (
                      <tr key={ing.id}>
                        <td>
                          <input
                            type="text"
                            className={styles.inputConcepto}
                            value={ing.concepto}
                            onChange={(e) => actualizarConceptoIngreso(ing.id, e.target.value)}
                          />
                        </td>
                        {ing.valores.map((val, mes) => (
                          <td key={mes}>
                            <input
                              type="text"
                              className={styles.inputValor}
                              value={val}
                              onChange={(e) => actualizarIngreso(ing.id, mes, e.target.value)}
                              onDoubleClick={() => copiarValorATodos('ingreso', ing.id, val)}
                              title="Doble clic para copiar a todos los meses"
                            />
                          </td>
                        ))}
                        <td>
                          <button
                            type="button"
                            className={styles.btnEliminar}
                            onClick={() => eliminarIngreso(ing.id)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gastos */}
            <div className={styles.seccionDatos}>
              <div className={styles.seccionHeader}>
                <h3><span aria-hidden="true">📉</span> Gastos Previstos</h3>
                <div className={styles.botonesGasto}>
                  <button type="button" className={styles.btnAgregar} onClick={() => agregarGasto(true)}>
                    + Gasto Fijo
                  </button>
                  <button type="button" className={styles.btnAgregarVar} onClick={() => agregarGasto(false)}>
                    + Gasto Variable
                  </button>
                </div>
              </div>

              <div className={styles.tablaWrapper}>
                <table className={styles.tablaDatos}>
                  <thead>
                    <tr>
                      <th className={styles.thConcepto}>Concepto</th>
                      {MESES.map(mes => <th key={mes}>{mes}</th>)}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map(g => (
                      <tr key={g.id} className={g.esFijo ? styles.gastoFijo : styles.gastoVariable}>
                        <td>
                          <input
                            type="text"
                            className={styles.inputConcepto}
                            value={g.concepto}
                            onChange={(e) => actualizarConceptoGasto(g.id, e.target.value)}
                          />
                          <span className={styles.tipoGasto}>
                            {g.esFijo ? '(Fijo)' : '(Var)'}
                          </span>
                        </td>
                        {g.valores.map((val, mes) => (
                          <td key={mes}>
                            <input
                              type="text"
                              className={styles.inputValor}
                              value={val}
                              onChange={(e) => actualizarGasto(g.id, mes, e.target.value)}
                              onDoubleClick={() => copiarValorATodos('gasto', g.id, val)}
                              title="Doble clic para copiar a todos los meses"
                            />
                          </td>
                        ))}
                        <td>
                          <button
                            type="button"
                            className={styles.btnEliminar}
                            onClick={() => eliminarGasto(g.id)}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Proyección */}
        {tabActivo === 'proyeccion' && (
          <div className={styles.tabContent}>
            {/* Gráfico de barras */}
            <div className={styles.graficoContainer}>
              <h3>Flujo de Caja Mensual</h3>
              <div className={styles.grafico}>
                {MESES.map((mes, i) => (
                  <div key={mes} className={styles.graficoColumna}>
                    <div className={styles.barrasWrapper}>
                      <div
                        className={styles.barraIngresos}
                        style={{ height: `${getAlturaBarra(calculos.ingresosPorMes[i])}%` }}
                        title={`Ingresos: ${formatCurrency(calculos.ingresosPorMes[i])}`}
                      />
                      <div
                        className={styles.barraGastos}
                        style={{ height: `${getAlturaBarra(calculos.gastosPorMes[i])}%` }}
                        title={`Gastos: ${formatCurrency(calculos.gastosPorMes[i])}`}
                      />
                    </div>
                    <span className={styles.graficoMes}>{mes}</span>
                    <span className={`${styles.graficoFlujo} ${calculos.flujoNetoPorMes[i] < 0 ? styles.flujoNegativo : ''}`}>
                      {formatNumber(calculos.flujoNetoPorMes[i], 0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.leyenda}>
                <span className={styles.leyendaItem}><span className={styles.dotIngresos} /> Ingresos</span>
                <span className={styles.leyendaItem}><span className={styles.dotGastos} /> Gastos</span>
              </div>
            </div>

            {/* Línea de saldo acumulado */}
            <div className={styles.saldoAcumuladoContainer}>
              <h3>Saldo Acumulado</h3>
              <div className={styles.saldoLinea}>
                {MESES.map((mes, i) => (
                  <div key={mes} className={styles.saldoPunto}>
                    <div
                      className={`${styles.saldoValor} ${calculos.saldoAcumulado[i] < 0 ? styles.saldoNegativo : ''}`}
                    >
                      {formatNumber(calculos.saldoAcumulado[i], 0)}€
                    </div>
                    <span className={styles.saldoMes}>{mes}</span>
                    {calculos.saldoAcumulado[i] < 0 && (
                      <span className={styles.alertaIcono}>⚠️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabla resumen */}
            <div className={styles.tablaResumenWrapper}>
              <h3>Resumen Mensual</h3>
              <table className={styles.tablaResumen}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    {MESES.map(mes => <th key={mes}>{mes}</th>)}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.filaIngresos}>
                    <td>Ingresos</td>
                    {calculos.ingresosPorMes.map((v, i) => <td key={i}>{formatNumber(v, 0)}</td>)}
                    <td><strong>{formatNumber(calculos.totalIngresos, 0)}</strong></td>
                  </tr>
                  <tr className={styles.filaGastos}>
                    <td>Gastos</td>
                    {calculos.gastosPorMes.map((v, i) => <td key={i}>{formatNumber(v, 0)}</td>)}
                    <td><strong>{formatNumber(calculos.totalGastos, 0)}</strong></td>
                  </tr>
                  <tr className={styles.filaFlujo}>
                    <td>Flujo Neto</td>
                    {calculos.flujoNetoPorMes.map((v, i) => (
                      <td key={i} className={v < 0 ? styles.valorNegativo : styles.valorPositivo}>
                        {formatNumber(v, 0)}
                      </td>
                    ))}
                    <td className={calculos.flujoNetoTotal < 0 ? styles.valorNegativo : styles.valorPositivo}>
                      <strong>{formatNumber(calculos.flujoNetoTotal, 0)}</strong>
                    </td>
                  </tr>
                  <tr className={styles.filaSaldo}>
                    <td>Saldo Acumulado</td>
                    {calculos.saldoAcumulado.map((v, i) => (
                      <td key={i} className={v < 0 ? styles.valorNegativo : ''}>
                        {formatNumber(v, 0)}
                      </td>
                    ))}
                    <td className={calculos.saldoFinal < 0 ? styles.valorNegativo : ''}>
                      <strong>{formatNumber(calculos.saldoFinal, 0)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Escenarios */}
        {tabActivo === 'escenarios' && (
          <div className={styles.tabContent}>
            <h3>Simulador What-If</h3>
            <p className={styles.escenarioDesc}>
              ¿Qué pasaría si tus ingresos o gastos cambian? Ajusta los porcentajes para simular escenarios.
            </p>

            <div className={styles.escenariosInputs}>
              <NumberInput
                value={escenarioIngresos}
                onChange={setEscenarioIngresos}
                label="Variación de Ingresos"
                placeholder="0"
                suffix="%"
                helperText="Positivo = aumentan, Negativo = disminuyen"
              />
              <NumberInput
                value={escenarioGastos}
                onChange={setEscenarioGastos}
                label="Variación de Gastos"
                placeholder="0"
                suffix="%"
                helperText="Positivo = aumentan, Negativo = disminuyen"
              />
            </div>

            <div className={styles.escenarioResultados}>
              <ResultCard
                title="Saldo Final Ajustado"
                value={formatNumber(calculos.saldoFinal, 0)}
                unit="€"
                variant={calculos.saldoFinal > 0 ? 'success' : 'warning'}
                icon="💰"
              />
              <ResultCard
                title="Meses en Negativo"
                value={formatNumber(calculos.mesesNegativos, 0)}
                unit=""
                variant={calculos.mesesNegativos === 0 ? 'success' : 'warning'}
                icon="⚠️"
              />
              <ResultCard
                title="Mes más crítico"
                value={MESES[calculos.mesCritico]}
                unit=""
                variant="info"
                icon="📅"
                description={`Saldo: ${formatCurrency(calculos.saldoMinimo)}`}
              />
            </div>

            {calculos.mesesNegativos > 0 && (
              <div className={styles.alertaLiquidez}>
                <h4>⚠️ Alerta de Liquidez</h4>
                <p>
                  Con este escenario, tendrás <strong>{calculos.mesesNegativos} mes(es)</strong> con saldo negativo.
                  El mes más crítico es <strong>{MESES[calculos.mesCritico]}</strong> con un saldo de{' '}
                  <strong>{formatCurrency(calculos.saldoMinimo)}</strong>.
                </p>
                <p>
                  <strong>Recomendación:</strong> Considera adelantar cobros, retrasar pagos no críticos,
                  o buscar financiación puente antes de ese mes.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="planificador-cashflow"
        collapsible={false}
      />

      

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía completa de gestión de tesorería y cash flow"
        subtitle="Aprende a planificar la liquidez de tu negocio, evitar la temida quiebra técnica y optimizar tus cobros y pagos"
      >
        {/* TABLA COMPARATIVA */}
        <section className={styles.eduComparativa}>
          <h2><span aria-hidden="true">⚖️</span> Cash Flow vs Beneficio: diferencias clave</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Beneficio Contable</th>
                  <th>Cash Flow / Tesorería</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>¿Qué mide?</strong></td>
                  <td>Ingresos - Gastos devengados</td>
                  <td>Dinero real que entra y sale</td>
                </tr>
                <tr>
                  <td><strong>Amortizaciones</strong></td>
                  <td>Gasto (reduce beneficio)</td>
                  <td>No es salida de caja</td>
                </tr>
                <tr>
                  <td><strong>Factura emitida</strong></td>
                  <td>Ingreso inmediato</td>
                  <td>Solo cuando cobra</td>
                </tr>
                <tr>
                  <td><strong>Puedes tener...</strong></td>
                  <td>Beneficio sin caja</td>
                  <td>Caja sin beneficio contable</td>
                </tr>
                <tr>
                  <td><strong>Crisis posible</strong></td>
                  <td>Quiebra con beneficios (falta liquidez)</td>
                  <td>Flujo negativo temporal sin crisis</td>
                </tr>
                <tr>
                  <td><strong>Frecuencia de análisis</strong></td>
                  <td>Mensual / trimestral (contabilidad)</td>
                  <td>Semanal / diaria (tesorería viva)</td>
                </tr>
                <tr>
                  <td><strong>Indicador de...</strong></td>
                  <td>Rentabilidad del negocio</td>
                  <td>Salud de liquidez del negocio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section className={styles.eduEscenarios}>
          <h2><span aria-hidden="true">🎯</span> Situaciones reales de cash flow en negocios españoles</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛍️</span>
                <h3>Comercio minorista con estacionalidad</h3>
              </div>
              <p className={styles.escenarioExample}>
                Tienda de surf: ingresa 80% de los ingresos en verano (junio-agosto) pero paga alquiler, nóminas y stock todo el año. En enero, las cuentas pueden estar en negativo aunque el año sea rentable.
                <br /><strong>Solución: colchón de 3 meses de gastos fijos. Crédito ICO campaña estacional.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 Planifica el cash flow mensual con 6 meses de antelación en negocios estacionales.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏗️</span>
                <h3>Constructora o instaladora con proyectos largos</h3>
              </div>
              <p className={styles.escenarioExample}>
                Contrato de 200.000 € a cobrar en 3 hitos (40%, 40%, 20%). Los materiales y subcontratas hay que pagarlos antes. El cash flow puede ser negativo en las primeras semanas incluso con proyecto rentable.
                <br /><strong>Solución: confirming a proveedores. Anticipo del 30% al firmar contrato.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 Negocia siempre un anticipo mínimo del 20-30% en contratos de obra.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h3>Agencia digital / consultora B2B</h3>
              </div>
              <p className={styles.escenarioExample}>
                Factura 15.000 €/mes a clientes corporativos que pagan a 60-90 días. Las nóminas del equipo son el día 30. Durante los primeros 3 meses de crecimiento, el cash flow es negativo pese a ser rentable.
                <br /><strong>Solución: factoring (cede las facturas al banco a cambio de cobro inmediato - 1-2% coste).</strong>
              </p>
              <p className={styles.escenarioTip}>💡 El factoring es la solución más habitual para pymes B2B con clientes que pagan tarde.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <h3>E-commerce con stock propio</h3>
              </div>
              <p className={styles.escenarioExample}>
                Tienda online compra stock en octubre (15.000 €) para el Black Friday y Navidad. Cobros en noviembre-enero. Tiene 2 meses de cash flow negativo por el ciclo stock-venta-cobro.
                <br /><strong>Solución: línea de crédito revolving. Dropshipping parcial para reducir stock propio.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 El capital circulante (stock + clientes - proveedores) es el mayor consumidor de caja.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🚨</span>
                <h3>Startup en fase de crecimiento acelerado</h3>
              </div>
              <p className={styles.escenarioExample}>
                SaaS que crece un 20% mensual pero quema 30.000 €/mes de inversión en marketing y equipo. Sin financiación externa, el runway es de 4 meses. El cash flow negativo es esperado y planificado.
                <br /><strong>Solución: ronda seed / Serie A. Hito: alcanzar cash flow positivo antes de 18 meses.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 En startups, el runway (meses de caja disponible) es la métrica de supervivencia clave.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>✅</span>
                <h3>Freelance con ingresos irregulares</h3>
              </div>
              <p className={styles.escenarioExample}>
                Diseñador freelance: meses de 4.000 € alternados con meses de 800 €. Los gastos fijos (cuota autónomos, alquiler, suscripciones) son ~1.500 €/mes siempre.
                <br /><strong>Solución: colchón de 3 meses. &quot;Pagarse un sueldo fijo&quot; de los buenos meses para los malos.</strong>
              </p>
              <p className={styles.escenarioTip}>💡 Crea una cuenta separada "empresa" y págate un sueldo fijo mensual.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes sobre cash flow y tesorería</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo puede quebrar una empresa que tiene beneficios?</h4>
              <p>
                La quiebra técnica ocurre cuando una empresa no puede pagar sus obligaciones inmediatas aunque sea rentable a largo plazo. Ejemplo: una empresa factura 100.000 € en enero pero cobra en abril. Las nóminas de febrero y marzo (30.000 €) vencen antes del cobro. Si no tiene caja o crédito, no puede pagar aunque el negocio sea sólido. El 82% de las quiebras de pymes en España son por problemas de liquidez, no de rentabilidad.
              </p>
              <p className={styles.faqTip}>💡 <strong>Prevención:</strong> Mantén siempre un colchón de tesorería equivalente a 2-3 meses de gastos fijos en una cuenta separada. Es intocable.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el período medio de maduración y cómo mejorarlo?</h4>
              <p>
                El período medio de maduración (PMM) es el tiempo que tarda el ciclo completo: compra de materias primas → producción → venta → cobro. Cuanto más largo es el PMM, más capital circulante necesitas financiar. Para reducirlo: cobrar antes (anticipo, descuento por pronto pago), pagar más tarde (negociar 60-90 días con proveedores), reducir stock (producción just-in-time, dropshipping).
              </p>
              <p className={styles.faqTip}>💡 <strong>Fórmula:</strong> PMM = Días de stock + Días de cobro a clientes - Días de pago a proveedores. Objetivo: PMM lo más corto posible.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué herramientas de financiación de circulante existen?</h4>
              <p>
                Las principales: (1) Factoring: vendes tus facturas al banco, cobras al 98-99% inmediatamente. (2) Confirming: el banco paga a tus proveedores antes y te financia a ti. (3) Línea de crédito: dispones hasta un límite cuando la necesitas. (4) Descuento de pagarés: anticipas el cobro de pagarés de tus clientes. (5) ICO: créditos a tipos bajos para circulante. Cada opción tiene un coste (0.5-3%) y condiciones distintas.
              </p>
              <p className={styles.faqTip}>💡 <strong>Regla:</strong> El factoring es ideal si tus clientes pagan tarde. La línea de crédito es mejor para necesidades puntuales. No uses deuda a largo plazo para financiar circulante.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Con qué frecuencia debo hacer el plan de tesorería?</h4>
              <p>
                Depende del tamaño y situación del negocio. Negocios pequeños estables: previsión mensual con horizonte de 3-6 meses. Negocios en crecimiento o con estacionalidad: previsión semanal con horizonte de 90 días. En situación de tensión de liquidez: previsión diaria con horizonte de 30 días. Lo más importante es la constancia: actualizar la previsión cada semana con los datos reales e incorporar los desvíos.
              </p>
              <p className={styles.faqTip}>💡 <strong>Señal de alarma:</strong> Si tu saldo previsto para dentro de 4 semanas está por debajo del colchón mínimo, actúa hoy. No esperes a tener la crisis encima.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo negociar mejores plazos con clientes y proveedores?</h4>
              <p>
                Con clientes: ofrece descuento por pronto pago (1-2% a 30 días vs. 0% a 90 días), exige anticipo en proyectos nuevos, usa domiciliación bancaria para cobros automáticos, y actúa rápido ante impagos (reclamación formal a los 10 días de vencimiento). Con proveedores: negocia en el momento de más poder (primera compra grande, final de año), paga siempre a tiempo para ganar reputación y luego pedir mejoras, busca proveedores alternativos para tener leverage.
              </p>
              <p className={styles.faqTip}>💡 <strong>Objetivo:</strong> Cobrar en 30 días o menos, pagar en 60-90 días. Esta diferencia financia parte de tu circulante sin coste.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el cash flow libre (Free Cash Flow) y para qué sirve?</h4>
              <p>
                El Free Cash Flow (FCF) = Flujo de Caja Operativo - CAPEX (inversiones en activos fijos). Es el dinero que queda disponible después de mantener y hacer crecer el negocio. Un FCF positivo y creciente indica un negocio sano que genera valor sin necesidad de financiación externa. Las empresas cotizadas se valoran por múltiplos de FCF. Para pymes, un FCF &gt; 0 durante 12 meses consecutivos es el signo de madurez del negocio.
              </p>
              <p className={styles.faqTip}>💡 <strong>Distinción:</strong> Puedes tener FCF positivo aunque el beneficio neto sea negativo (amortizaciones altas). El FCF es la medida más honesta del valor generado.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo es mejor reinvertir vs. distribuir dividendos?</h4>
              <p>
                Reinvierte cuando: la rentabilidad sobre el capital invertido (ROIC) de tu negocio supera lo que podrías obtener en alternativas (&gt;8-10%), hay proyectos de crecimiento claros con VAN positivo, o el negocio todavía no ha alcanzado su escala óptima. Distribuye dividendos cuando: el negocio genera más caja de la que puede reinvertir con buena rentabilidad, o los socios tienen necesidades de liquidez personal. La decisión debe basarse en la rentabilidad marginal del capital, no en preferencias personales.
              </p>
              <p className={styles.faqTip}>💡 <strong>Test:</strong> Si no puedes identificar proyectos concretos donde invertir el exceso de caja con &gt;10% de rentabilidad esperada, distribúyelo.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo sé si mi negocio tiene un problema de cash flow o de rentabilidad?</h4>
              <p>
                Son problemas distintos con soluciones distintas. Problema de cash flow: el negocio es rentable pero no tiene liquidez → solución: financiación de circulante, mejora de cobros/pagos, reducción de stock. Problema de rentabilidad: el negocio genera caja pero pierde dinero → solución: revisar precios, reducir costes, cambiar mix de productos. Lo más peligroso es confundirlos: inyectar caja a un negocio no rentable es posponer el problema. Usa el plan de tesorería meskeIA junto con la cuenta de resultados para diagnosticar correctamente.
              </p>
              <p className={styles.faqTip}>💡 <strong>Diagnóstico rápido:</strong> Si tienes clientes, ventas y márgenes positivos pero no llegas a fin de mes → problema de cash flow. Si tienes caja pero el negocio pierde dinero mes a mes → problema de rentabilidad.</p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2><span aria-hidden="true">📋</span> Cómo elaborar tu plan de tesorería paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Lista todos tus ingresos esperados mes a mes</h4>
                <p>Incluye: facturas emitidas pendientes de cobro (con fecha real de cobro, no de factura), nuevos contratos previstos (con probabilidad: firme, probable o especulativo), ingresos recurrentes (suscripciones, retainers) y cobros atrasados de meses anteriores. Sé conservador: usa el 70-80% de los ingresos "probables" y 0% de los "especulativos".</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Mapea todos los pagos fijos y variables</h4>
                <p>Pagos fijos (conoces la fecha y el importe exacto): alquiler, nóminas + SS, seguros, cuotas de préstamos, suscripciones SaaS. Pagos variables (estimados): proveedores, comisiones, desplazamientos. Pagos no recurrentes: IVA trimestral, IRPF, Impuesto de Sociedades, renovación de licencias. El error más común es olvidar los pagos trimestrales y anuales.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Introduce los datos en el planificador meskeIA</h4>
                <p>Usa el planificador con un horizonte mínimo de 90 días. Ve mes a mes: saldo inicial + cobros - pagos = saldo final. El saldo final de un mes es el saldo inicial del siguiente. Identifica los meses con saldo negativo o por debajo del colchón mínimo: esos son tus puntos de tensión que hay que resolver.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Identifica los "huecos" de tesorería y actúa con antelación</h4>
                <p>Si ves que en 2 meses tendrás tensión de liquidez, actúa HOY: negocia el retraso de algún pago no crítico, adelanta el cobro de alguna factura ofreciendo descuento, activa la línea de crédito si la tienes. La antelación es tu mayor ventaja: gestionar una crisis con 2 meses de margen es infinitamente más fácil que hacerlo con 2 días.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Establece tu colchón mínimo de tesorería</h4>
                <p>Calcula tus gastos fijos mensuales (todo lo que pagas aunque no vendas nada: alquiler, nóminas, seguros, préstamos). Multiplica por 2-3 meses. Ese es tu colchón mínimo. No lo toques salvo emergencia real. Tenerlo en una cuenta separada de la operativa evita gastarlo por error. Un colchón de 3 meses te da tiempo para reaccionar ante cualquier imprevisto.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Actualiza el plan cada semana con datos reales</h4>
                <p>Un plan de tesorería que no se actualiza pierde valor rápidamente. Cada semana: registra los cobros reales vs. previstos, actualiza las fechas de cobros pendientes, incorpora nuevas facturas emitidas y nuevos compromisos de pago. El desvío entre previsión y realidad te enseña a hacer mejores previsiones en el futuro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section className={styles.eduTips}>
          <h2><span aria-hidden="true">✅</span> Mejores prácticas de gestión de tesorería</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏦</span>
              <h4>Separa cuenta empresa y personal</h4>
              <p>Nunca mezcles fondos personales y empresariales. Dos cuentas separadas (operativa + colchón) te dan visibilidad real de la situación financiera.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <h4>Concentra pagos en 1-2 días fijos</h4>
              <p>Paga proveedores en días fijos (por ejemplo, 15 y último de mes). Simplifica la gestión, facilita la previsión y mejora tu reputación de pagador puntual.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏰</span>
              <h4>Cobra en 30 días, paga en 60</h4>
              <p>Esta diferencia de 30 días financia parte de tu circulante sin coste. Negocia siempre esta ventana con nuevos clientes y proveedores desde el inicio de la relación.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔔</span>
              <h4>Automatiza recordatorios de cobro</h4>
              <p>Envía recordatorio 5 días antes del vencimiento, el día del vencimiento y 5 días después. El 70% de los retrasos se resuelven con un simple recordatorio amable.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <h4>Revisa el ratio de liquidez mensualmente</h4>
              <p>Liquidez = Activo corriente / Pasivo corriente. Si es menor a 1, tienes más obligaciones a corto plazo que recursos disponibles. Señal de alerta urgente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🤝</span>
              <h4>Habla con tu banco antes de necesitarlo</h4>
              <p>Negocia la línea de crédito cuando no la necesites. Los bancos prestan cuando no lo necesitas y niegan cuando sí. Mantén la línea activa aunque no la uses.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores frecuentes de tesorería que llevan a la quiebra técnica</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Confundir facturado con cobrado:</strong> Una factura emitida no es dinero en caja hasta que el cliente paga. Muchos autónomos y pymes calculan su situación con el total facturado, ignorando que tienen 30-90 días de espera real. El plan de tesorería trabaja siempre con fechas reales de cobro.</li>
            <li><strong>❌ No provisionar los impuestos trimestrales:</strong> El IVA del Q1 (enero-marzo) se paga en abril. El IRPF trimestral en julio. El Impuesto de Sociedades en julio. Muchas empresas gastan el dinero del IVA sin saber que no es suyo. Separa el IVA en una cuenta aparte desde el momento de la factura.</li>
            <li><strong>❌ Usar la línea de crédito como financiación permanente:</strong> La línea de crédito (póliza) es para tensiones de tesorería temporales. Usarla continuamente al límite máximo es señal de que el negocio tiene un problema estructural de rentabilidad, no solo de liquidez. El coste (5-8% TAE) erosiona el margen lentamente.</li>
            <li><strong>❌ No hacer seguimiento de impagados:</strong> Un cliente que paga a 90 días en lugar de los 30 pactados te &quot;roba&quot; 60 días de cash flow. Un impagado definitivo puede ser catastrófico. Establece un proceso claro: recordatorio a +5 días, llamada a +15, carta burofax a +30, gestor de reclamaciones a +60.</li>
            <li><strong>❌ Invertir en activos fijos con el fondo de maniobra:</strong> Comprar maquinaria, vehículos o reformar con la caja operativa puede dejarte sin liquidez para el día a día. Los activos fijos deben financiarse con recursos a largo plazo (préstamo, leasing), no con la tesorería operativa.</li>
            <li><strong>❌ Planificar sin escenarios de riesgo:</strong> Un plan de tesorería con un solo escenario (el optimista) no es un plan, es un deseo. Siempre calcula qué pasa si los cobros se retrasan 30 días, si pierde tu cliente principal, o si surge un gasto imprevisto del 15% de tu facturación anual.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('planificador-cashflow')} />

      <ShareCard appName="planificador-cashflow" />
      <Footer appName="planificador-cashflow" />
    </div>
  );
}
