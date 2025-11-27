'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorCashFlow.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';

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
        <h1 className={styles.title}>💰 Planificador Cash Flow</h1>
        <p className={styles.subtitle}>
          Proyecta tu flujo de caja mes a mes. Identifica riesgos de liquidez y planifica tu tesorería.
        </p>
      </header>

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
            className={`${styles.tab} ${tabActivo === 'datos' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('datos')}
          >
            📝 Datos
          </button>
          <button
            className={`${styles.tab} ${tabActivo === 'proyeccion' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('proyeccion')}
          >
            📊 Proyección
          </button>
          <button
            className={`${styles.tab} ${tabActivo === 'escenarios' ? styles.tabActivo : ''}`}
            onClick={() => setTabActivo('escenarios')}
          >
            🔮 Escenarios
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
                <h3>📈 Ingresos Previstos</h3>
                <button className={styles.btnAgregar} onClick={agregarIngreso}>
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
                <h3>📉 Gastos Previstos</h3>
                <div className={styles.botonesGasto}>
                  <button className={styles.btnAgregar} onClick={() => agregarGasto(true)}>
                    + Gasto Fijo
                  </button>
                  <button className={styles.btnAgregarVar} onClick={() => agregarGasto(false)}>
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

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta herramienta proporciona <strong>proyecciones estimadas</strong> basadas en los datos introducidos.
          El flujo de caja real puede variar por retrasos en cobros, pagos inesperados u otros factores.
          <strong> Revisa y actualiza los datos regularmente</strong> para mantener la proyección actualizada.
        </p>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres mejorar tu gestión de tesorería?"
        subtitle="Conceptos clave sobre cash flow y cómo evitar problemas de liquidez"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué es vital controlar el Cash Flow?</h2>
          <p className={styles.introParagraph}>
            <strong>El 82% de las empresas que fracasan lo hacen por problemas de liquidez</strong>, no por falta de beneficios.
            Puedes ser rentable sobre el papel y quedarte sin dinero para pagar nóminas o proveedores.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📌 Cash Flow vs Beneficio</h4>
              <p>
                <strong>Beneficio:</strong> Ingresos - Gastos (contabilidad).<br />
                <strong>Cash Flow:</strong> Dinero que entra - Dinero que sale (tesorería).<br /><br />
                Puedes facturar mucho pero si los clientes pagan a 90 días, no tienes liquidez.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Regla del Colchón de Seguridad</h4>
              <p>
                Mantén siempre un <strong>saldo mínimo de seguridad</strong> equivalente a 2-3 meses de gastos fijos.
                Esto te protege de retrasos en cobros o gastos imprevistos.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Cómo mejorar el Cash Flow</h4>
              <p>
                1. <strong>Cobra antes:</strong> Anticipa pagos, reduce plazos de cobro.<br />
                2. <strong>Paga después:</strong> Negocia plazos con proveedores.<br />
                3. <strong>Controla el stock:</strong> No inmovilices dinero en inventario excesivo.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📌 Señales de alerta</h4>
              <p>
                • Saldo en cuenta corriente bajando cada mes<br />
                • Retrasos frecuentes en pagos a proveedores<br />
                • Necesidad constante de financiación puente<br />
                • Morosidad de clientes en aumento
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="planificador-cashflow" />
    </div>
  );
}
