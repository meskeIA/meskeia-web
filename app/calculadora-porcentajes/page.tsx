'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import MeskeiaLogo from '@/components/MeskeiaLogo'
import Footer from '@/components/Footer'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import { jsonLd } from './metadata'
import styles from './page.module.css'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

// Tipo para historial
interface CalculationHistory {
  calculation: string
  result: string
  timestamp: string
}

export default function CalculadoraPorcentajes() {
  // Estados
  const [activeTab, setActiveTab] = useState('basic')
  const [showResult, setShowResult] = useState(false)
  const [resultMain, setResultMain] = useState('')
  const [resultExplanation, setResultExplanation] = useState('')
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [chartData, setChartData] = useState<any>(null)
  const [chartType, setChartType] = useState<'bar' | 'doughnut'>('doughnut')

  // Estados para inputs de cada calculadora
  const [basicPercent, setBasicPercent] = useState('')
  const [basicTotal, setBasicTotal] = useState('')
  const [partValue, setPartValue] = useState('')
  const [totalValue, setTotalValue] = useState('')
  const [oldValue, setOldValue] = useState('')
  const [newValue, setNewValue] = useState('')
  const [baseAmount, setBaseAmount] = useState('')
  const [changePercent, setChangePercent] = useState('')
  const [ivaBase, setIvaBase] = useState('')
  const [ivaType, setIvaType] = useState('21')
  const [ivaTotal, setIvaTotal] = useState('')
  const [ivaTypeReverse, setIvaTypeReverse] = useState('21')
  const [billAmount, setBillAmount] = useState('')
  const [tipType, setTipType] = useState('10')
  const [customTip, setCustomTip] = useState('')

  const chartRef = useRef<any>(null)

  // Cargar historial desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia_percentage_history')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  // Guardar historial en localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('meskeia_percentage_history', JSON.stringify(history))
    }
  }, [history])

  // Funciones de formateo español
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(num)
  }

  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num / 100)
  }

  // Añadir al historial
  const addToHistory = (calculation: string, result: string) => {
    const newEntry: CalculationHistory = {
      calculation,
      result,
      timestamp: new Date().toLocaleString('es-ES'),
    }
    setHistory([newEntry, ...history.slice(0, 9)]) // Mantener solo los últimos 10
  }

  // Actualizar gráfico
  const updateChart = (
    type: 'bar' | 'doughnut',
    data: number[],
    labels: string[],
    title: string
  ) => {
    setChartType(type)
    setChartData({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#2E86AB',
            '#48A9A6',
            '#A3C4A2',
            '#F7C59F',
            '#FF9800',
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      ],
    })
  }

  // Mostrar resultado
  const displayResult = (main: string, explanation: string) => {
    setResultMain(main)
    setResultExplanation(explanation)
    setShowResult(true)
  }

  // Calculadora básica
  const calculateBasic = () => {
    const percent = parseFloat(basicPercent)
    const total = parseFloat(basicTotal)

    if (isNaN(percent) || isNaN(total)) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const result = (percent / 100) * total
    const explanation = `Cálculo: ${formatPercent(percent)} de ${formatCurrency(total)} = ${formatCurrency(result)}`

    displayResult(formatCurrency(result), explanation)
    updateChart(
      'doughnut',
      [result, total - result],
      ['Porcentaje calculado', 'Resto'],
      `${formatPercent(percent)} de ${formatCurrency(total)}`
    )
    addToHistory(
      `${formatPercent(percent)} de ${formatCurrency(total)}`,
      formatCurrency(result)
    )
  }

  const calculatePart = () => {
    const part = parseFloat(partValue)
    const total = parseFloat(totalValue)

    if (isNaN(part) || isNaN(total) || total === 0) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const percent = (part / total) * 100
    const explanation = `${formatCurrency(part)} representa el ${formatPercent(percent)} de ${formatCurrency(total)}`

    displayResult(formatPercent(percent), explanation)
    updateChart(
      'doughnut',
      [part, total - part],
      ['Parte calculada', 'Resto'],
      `${formatCurrency(part)} de ${formatCurrency(total)}`
    )
    addToHistory(
      `${formatCurrency(part)} de ${formatCurrency(total)}`,
      formatPercent(percent)
    )
  }

  // Calculadora de cambios
  const calculateChange = () => {
    const oldVal = parseFloat(oldValue)
    const newVal = parseFloat(newValue)

    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const change = newVal - oldVal
    const percentChange = (change / oldVal) * 100
    const changeType = change > 0 ? 'aumento' : 'reducción'
    const explanation = `Cambio de ${formatCurrency(oldVal)} a ${formatCurrency(newVal)}: ${changeType} del ${formatPercent(Math.abs(percentChange))}`

    displayResult(
      `${change > 0 ? '+' : ''}${formatPercent(percentChange)}`,
      explanation
    )
    updateChart(
      'bar',
      [oldVal, newVal],
      ['Valor inicial', 'Valor final'],
      'Comparación de valores'
    )
    addToHistory(
      `${formatCurrency(oldVal)} → ${formatCurrency(newVal)}`,
      `${change > 0 ? '+' : ''}${formatPercent(percentChange)}`
    )
  }

  const applyChange = () => {
    const base = parseFloat(baseAmount)
    const change = parseFloat(changePercent)

    if (isNaN(base) || isNaN(change)) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const changeAmount = (change / 100) * base
    const finalAmount = base + changeAmount
    const changeType = change > 0 ? 'incremento' : 'descuento'
    const explanation = `${formatCurrency(base)} con ${changeType} del ${formatPercent(Math.abs(change))} = ${formatCurrency(finalAmount)}`

    displayResult(formatCurrency(finalAmount), explanation)
    updateChart(
      'bar',
      [base, Math.abs(changeAmount), finalAmount],
      ['Base', 'Cambio', 'Final'],
      `${changeType} del ${formatPercent(Math.abs(change))}`
    )
    addToHistory(
      `${formatCurrency(base)} ${change > 0 ? '+' : ''}${formatPercent(change)}`,
      formatCurrency(finalAmount)
    )
  }

  // Calculadora IVA
  const calculateIVA = () => {
    const base = parseFloat(ivaBase)
    const rate = parseFloat(ivaType)

    if (isNaN(base)) {
      alert('Por favor, introduce un valor válido')
      return
    }

    const ivaAmount = (rate / 100) * base
    const total = base + ivaAmount
    const explanation = `Base: ${formatCurrency(base)} + IVA (${rate}%): ${formatCurrency(ivaAmount)} = Total: ${formatCurrency(total)}`

    displayResult(formatCurrency(total), explanation)
    updateChart(
      'doughnut',
      [base, ivaAmount],
      ['Base sin IVA', `IVA (${rate}%)`],
      'Desglose del precio'
    )
    addToHistory(`${formatCurrency(base)} + IVA ${rate}%`, formatCurrency(total))
  }

  const reverseIVA = () => {
    const total = parseFloat(ivaTotal)
    const rate = parseFloat(ivaTypeReverse)

    if (isNaN(total)) {
      alert('Por favor, introduce un valor válido')
      return
    }

    const base = total / (1 + rate / 100)
    const ivaAmount = total - base
    const explanation = `Total con IVA: ${formatCurrency(total)} = Base: ${formatCurrency(base)} + IVA (${rate}%): ${formatCurrency(ivaAmount)}`

    displayResult(formatCurrency(base), explanation)
    updateChart(
      'doughnut',
      [base, ivaAmount],
      ['Base sin IVA', `IVA (${rate}%)`],
      'Desglose del precio'
    )
    addToHistory(
      `${formatCurrency(total)} sin IVA ${rate}%`,
      formatCurrency(base)
    )
  }

  // Calculadora de propinas
  const calculateTip = () => {
    const bill = parseFloat(billAmount)
    let tipPercent: number

    if (tipType === 'custom') {
      tipPercent = parseFloat(customTip)
    } else {
      tipPercent = parseFloat(tipType)
    }

    if (isNaN(bill) || isNaN(tipPercent)) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const tipAmount = (tipPercent / 100) * bill
    const total = bill + tipAmount
    const explanation = `Cuenta: ${formatCurrency(bill)} + Propina (${formatPercent(tipPercent)}): ${formatCurrency(tipAmount)} = Total: ${formatCurrency(total)}`

    displayResult(formatCurrency(total), explanation)
    updateChart(
      'doughnut',
      [bill, tipAmount],
      ['Cuenta', `Propina (${formatPercent(tipPercent)})`],
      'Desglose del total'
    )
    addToHistory(
      `${formatCurrency(bill)} + propina ${formatPercent(tipPercent)}`,
      formatCurrency(total)
    )
  }

  // Ejemplos predefinidos
  const loadExample = (exampleType: string) => {
    switch (exampleType) {
      case 'discount20':
        setActiveTab('change')
        setBaseAmount('100')
        setChangePercent('-20')
        setTimeout(() => applyChange(), 100)
        break
      case 'iva21':
        setActiveTab('iva')
        setIvaBase('50')
        setIvaType('21')
        setTimeout(() => calculateIVA(), 100)
        break
      case 'tip10':
        setActiveTab('tips')
        setBillAmount('35')
        setTipType('10')
        setTimeout(() => calculateTip(), 100)
        break
      case 'increase15':
        setActiveTab('change')
        setBaseAmount('1500')
        setChangePercent('15')
        setTimeout(() => applyChange(), 100)
        break
    }
  }

  // Limpiar historial
  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
      setHistory([])
      localStorage.removeItem('meskeia_percentage_history')
    }
  }

  // Opciones del gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
  }

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="calculadora-porcentajes" />

      <MeskeiaLogo />

      <div className={styles.container}>
        {/* Título */}
        <div className={styles.pageTitle}>
          <h1>Calculadora de Porcentajes Avanzada</h1>
          <p className={styles.pageSubtitle}>
            Herramienta completa para cálculos de porcentajes con visualizaciones
            interactivas y ejemplos españoles
          </p>
        </div>

        {/* Grid principal */}
        <div className={styles.mainGrid}>
          {/* Panel de calculadoras */}
          <div className={styles.calculatorPanel}>
            {/* Pestañas */}
            <div className={styles.calculatorTabs}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'basic' ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab('basic')
                  setShowResult(false)
                }}
              >
                Básico
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'change' ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab('change')
                  setShowResult(false)
                }}
              >
                Cambios
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'iva' ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab('iva')
                  setShowResult(false)
                }}
              >
                IVA
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'tips' ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab('tips')
                  setShowResult(false)
                }}
              >
                Propinas
              </button>
            </div>

            {/* Tab Básico */}
            {activeTab === 'basic' && (
              <div className={styles.tabContent}>
                <div className={styles.calcForm}>
                  <div className={styles.inputGroup}>
                    <label>¿Cuánto es el X% de Y?</label>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Porcentaje"
                        step="0.01"
                        value={basicPercent}
                        onChange={(e) => setBasicPercent(e.target.value)}
                      />
                      <span className={styles.unitLabel}>%</span>
                    </div>
                    <div style={{ textAlign: 'center', margin: '8px 0', color: 'var(--text-secondary)' }}>
                      de
                    </div>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Cantidad total"
                        step="0.01"
                        value={basicTotal}
                        onChange={(e) => setBasicTotal(e.target.value)}
                      />
                      <span className={styles.unitLabel}>€</span>
                    </div>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={calculateBasic}>
                    Calcular
                  </button>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label>¿Qué porcentaje representa X de Y?</label>
                  <div className={styles.inputRow}>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Parte"
                      step="0.01"
                      value={partValue}
                      onChange={(e) => setPartValue(e.target.value)}
                    />
                    <span className={styles.unitLabel}>€</span>
                  </div>
                  <div style={{ textAlign: 'center', margin: '8px 0', color: 'var(--text-secondary)' }}>
                    de
                  </div>
                  <div className={styles.inputRow}>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Total"
                      step="0.01"
                      value={totalValue}
                      onChange={(e) => setTotalValue(e.target.value)}
                    />
                    <span className={styles.unitLabel}>€</span>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={calculatePart}>
                    Calcular Porcentaje
                  </button>
                </div>
              </div>
            )}

            {/* Tab Cambios */}
            {activeTab === 'change' && (
              <div className={styles.tabContent}>
                <div className={styles.calcForm}>
                  <div className={styles.inputGroup}>
                    <label>Calculadora de cambio porcentual</label>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Valor inicial"
                        step="0.01"
                        value={oldValue}
                        onChange={(e) => setOldValue(e.target.value)}
                      />
                      <span className={styles.unitLabel}>€</span>
                    </div>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Valor final"
                        step="0.01"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                      <span className={styles.unitLabel}>€</span>
                    </div>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={calculateChange}>
                    Calcular Cambio
                  </button>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label>Aplicar descuento/incremento</label>
                  <div className={styles.inputRow}>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Cantidad base"
                      step="0.01"
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                    />
                    <span className={styles.unitLabel}>€</span>
                  </div>
                  <div className={styles.inputRow}>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Porcentaje (+ o -)"
                      step="0.01"
                      value={changePercent}
                      onChange={(e) => setChangePercent(e.target.value)}
                    />
                    <span className={styles.unitLabel}>%</span>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={applyChange}>
                    Aplicar Cambio
                  </button>
                </div>
              </div>
            )}

            {/* Tab IVA */}
            {activeTab === 'iva' && (
              <div className={styles.tabContent}>
                <div className={styles.calcForm}>
                  <div className={styles.inputGroup}>
                    <label>Calcular IVA español</label>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Precio sin IVA"
                        step="0.01"
                        value={ivaBase}
                        onChange={(e) => setIvaBase(e.target.value)}
                      />
                      <span className={styles.unitLabel}>€</span>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Tipo de IVA</label>
                      <select
                        className={styles.inputField}
                        value={ivaType}
                        onChange={(e) => setIvaType(e.target.value)}
                        aria-label="Tipo de IVA"
                      >
                        <option value="21">General (21%)</option>
                        <option value="10">Reducido (10%)</option>
                        <option value="4">Superreducido (4%)</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={calculateIVA}>
                    Calcular IVA
                  </button>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label>Calcular precio sin IVA</label>
                  <div className={styles.inputRow}>
                    <input
                      type="number"
                      className={styles.inputField}
                      placeholder="Precio con IVA"
                      step="0.01"
                      value={ivaTotal}
                      onChange={(e) => setIvaTotal(e.target.value)}
                    />
                    <span className={styles.unitLabel}>€</span>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Tipo de IVA incluido</label>
                    <select
                      className={styles.inputField}
                      value={ivaTypeReverse}
                      onChange={(e) => setIvaTypeReverse(e.target.value)}
                      aria-label="Tipo de IVA incluido"
                    >
                      <option value="21">General (21%)</option>
                      <option value="10">Reducido (10%)</option>
                      <option value="4">Superreducido (4%)</option>
                    </select>
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={reverseIVA}>
                    Calcular Sin IVA
                  </button>
                </div>
              </div>
            )}

            {/* Tab Propinas */}
            {activeTab === 'tips' && (
              <div className={styles.tabContent}>
                <div className={styles.calcForm}>
                  <div className={styles.inputGroup}>
                    <label>Calculadora de propinas</label>
                    <div className={styles.inputRow}>
                      <input
                        type="number"
                        className={styles.inputField}
                        placeholder="Total de la cuenta"
                        step="0.01"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                      />
                      <span className={styles.unitLabel}>€</span>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Nivel de servicio</label>
                      <select
                        className={styles.inputField}
                        value={tipType}
                        onChange={(e) => setTipType(e.target.value)}
                        aria-label="Nivel de servicio"
                      >
                        <option value="5">Básico (5%)</option>
                        <option value="10">Bueno (10%)</option>
                        <option value="15">Excelente (15%)</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    {tipType === 'custom' && (
                      <div className={styles.inputRow}>
                        <input
                          type="number"
                          className={styles.inputField}
                          placeholder="Porcentaje personalizado"
                          step="0.01"
                          value={customTip}
                          onChange={(e) => setCustomTip(e.target.value)}
                        />
                        <span className={styles.unitLabel}>%</span>
                      </div>
                    )}
                  </div>
                  <button type="button" className={styles.calcBtn} onClick={calculateTip}>
                    Calcular Propina
                  </button>
                </div>
              </div>
            )}

            {/* Resultado */}
            {showResult && (
              <div className={styles.resultSection}>
                <div className={styles.resultMain}>{resultMain}</div>
                <div className={styles.resultExplanation}>{resultExplanation}</div>
              </div>
            )}

            {/* Ejemplos predefinidos */}
            <div className={styles.examplesSection}>
              <h4>Ejemplos rápidos:</h4>
              <div className={styles.examplesGrid}>
                <button className={styles.exampleBtn} onClick={() => loadExample('discount20')}>
                  <div className={styles.exampleTitle}>Descuento 20%</div>
                  <div className={styles.exampleDesc}>Precio: 100€</div>
                </button>
                <button className={styles.exampleBtn} onClick={() => loadExample('iva21')}>
                  <div className={styles.exampleTitle}>IVA 21%</div>
                  <div className={styles.exampleDesc}>Base: 50€</div>
                </button>
                <button className={styles.exampleBtn} onClick={() => loadExample('tip10')}>
                  <div className={styles.exampleTitle}>Propina 10%</div>
                  <div className={styles.exampleDesc}>Cuenta: 35€</div>
                </button>
                <button className={styles.exampleBtn} onClick={() => loadExample('increase15')}>
                  <div className={styles.exampleTitle}>Aumento 15%</div>
                  <div className={styles.exampleDesc}>Sueldo: 1.500€</div>
                </button>
              </div>
            </div>
          </div>

          {/* Panel de visualización */}
          <div className={styles.visualizationPanel}>
            <h3>Visualización</h3>
            <div className={styles.chartContainer}>
              {chartData && (
                <Chart
                  ref={chartRef}
                  type={chartType}
                  data={chartData}
                  options={chartOptions}
                />
              )}
            </div>

            {/* Historial */}
            <div className={styles.historySection}>
              <h4>Historial de cálculos</h4>
              <div className={styles.historyList}>
                {history.length === 0 ? (
                  <div
                    style={{
                      padding: 'var(--spacing-md)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                    }}
                  >
                    No hay cálculos aún
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div key={index} className={styles.historyItem}>
                      <div className={styles.historyCalculation}>{item.calculation}</div>
                      <div className={styles.historyResult}>{item.result}</div>
                      <small>{item.timestamp}</small>
                    </div>
                  ))
                )}
              </div>
              <button className={styles.clearHistory} onClick={clearHistory}>
                Limpiar historial
              </button>
            </div>
          </div>
        </div>

        {/* Secciones educativas */}
        <div className={styles.meskeiaeduSection}>
          <h2>¿Cómo usar la calculadora de porcentajes?</h2>
          <p>
            Esta herramienta te permite realizar todo tipo de cálculos con porcentajes de forma
            rápida y precisa. Aquí te explicamos las funcionalidades principales:
          </p>
          <ul>
            <li>
              <strong>Cálculo básico:</strong> Calcula el X% de cualquier cantidad o determina qué
              porcentaje representa una parte del total
            </li>
            <li>
              <strong>Cambios porcentuales:</strong> Calcula aumentos o reducciones porcentuales
              entre dos valores
            </li>
            <li>
              <strong>IVA español:</strong> Calcula el IVA (21%, 10% o 4%) o extrae el precio base
              sin IVA
            </li>
            <li>
              <strong>Propinas:</strong> Calcula propinas según el nivel de servicio recibido
            </li>
          </ul>
        </div>

        <div className={styles.meskeiauSection}>
          <h2>Ejemplos prácticos de uso</h2>
          <p>Algunos casos donde esta calculadora resulta muy útil:</p>
          <ul>
            <li>
              <strong>Compras:</strong> Calcular descuentos en rebajas (p.ej., 30% de descuento en
              150€)
            </li>
            <li>
              <strong>Finanzas personales:</strong> Determinar aumentos salariales o reducciones de
              gastos
            </li>
            <li>
              <strong>Negocios:</strong> Calcular márgenes de beneficio, comisiones o impuestos
            </li>
            <li>
              <strong>Restaurantes:</strong> Calcular propinas apropiadas según la calidad del
              servicio
            </li>
          </ul>
        </div>
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="Calculadora de Porcentajes" />
    </>
  )
}
