'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Chart, ChartConfiguration } from 'chart.js/auto'
import styles from './page.module.css'

export default function CalculadoraPorcentajes() {
  // Estados para las calculadoras
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

  const [activeTab, setActiveTab] = useState('basic')
  const [resultMain, setResultMain] = useState('')
  const [resultExplanation, setResultExplanation] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [calculationHistory, setCalculationHistory] = useState<any[]>([])

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('meskeia_percentage_history')
    if (saved) {
      setCalculationHistory(JSON.parse(saved))
    }

    // Inicializar gráfico vacío
    updateChart('doughnut', [100], ['Esperando cálculo...'], 'Realiza un cálculo para ver la visualización')
  }, [])

  // Formateo de números español
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  }

  const formatPercent = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num / 100)
  }

  // Función para actualizar el gráfico
  const updateChart = (type: string, data: number[], labels: string[], title: string) => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const config: ChartConfiguration = {
      type: type as any,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#2E86AB',
            '#48A9A6',
            '#A3C4A2',
            '#F7C59F',
            '#FF9800'
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#1A1A1A'
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                if (type === 'doughnut') {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                  const percentage = ((context.raw / total) * 100).toFixed(2)
                  return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`
                }
                return `${context.label}: ${formatCurrency(context.raw)}`
              }
            }
          }
        },
        scales: type === 'bar' ? {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return formatCurrency(value)
              }
            }
          }
        } : {}
      }
    }

    chartInstance.current = new Chart(ctx, config)
  }

  // Función para añadir al historial
  const addToHistory = (calculation: string, result: string) => {
    const historyItem = {
      calculation,
      result,
      timestamp: new Date().toLocaleString('es-ES')
    }

    const newHistory = [historyItem, ...calculationHistory].slice(0, 20)
    setCalculationHistory(newHistory)
    localStorage.setItem('meskeia_percentage_history', JSON.stringify(newHistory))
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

    setResultMain(formatCurrency(result))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('doughnut', [result, total - result], ['Porcentaje calculado', 'Resto'], `${formatPercent(percent)} de ${formatCurrency(total)}`)
    addToHistory(`${formatPercent(percent)} de ${formatCurrency(total)}`, formatCurrency(result))
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

    setResultMain(formatPercent(percent))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('doughnut', [part, total - part], ['Parte calculada', 'Resto'], `${formatCurrency(part)} de ${formatCurrency(total)}`)
    addToHistory(`${formatCurrency(part)} de ${formatCurrency(total)}`, formatPercent(percent))
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

    setResultMain(`${change > 0 ? '+' : ''}${formatPercent(percentChange)}`)
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('bar', [oldVal, newVal], ['Valor inicial', 'Valor final'], 'Comparación de valores')
    addToHistory(`${formatCurrency(oldVal)} → ${formatCurrency(newVal)}`, `${change > 0 ? '+' : ''}${formatPercent(percentChange)}`)
  }

  const applyChange = () => {
    const base = parseFloat(baseAmount)
    const changePer = parseFloat(changePercent)

    if (isNaN(base) || isNaN(changePer)) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const change = (changePer / 100) * base
    const finalAmount = base + change
    const changeType = changePer > 0 ? 'incremento' : 'descuento'
    const explanation = `${formatCurrency(base)} con ${changeType} del ${formatPercent(Math.abs(changePer))} = ${formatCurrency(finalAmount)}`

    setResultMain(formatCurrency(finalAmount))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('bar', [base, Math.abs(change), finalAmount], ['Base', 'Cambio', 'Final'], `${changeType} del ${formatPercent(Math.abs(changePer))}`)
    addToHistory(`${formatCurrency(base)} ${changePer > 0 ? '+' : ''}${formatPercent(changePer)}`, formatCurrency(finalAmount))
  }

  // Calculadora IVA
  const calculateIVA = () => {
    const base = parseFloat(ivaBase)
    const ivaRate = parseFloat(ivaType)

    if (isNaN(base)) {
      alert('Por favor, introduce un valor válido')
      return
    }

    const ivaAmount = (ivaRate / 100) * base
    const total = base + ivaAmount
    const explanation = `Base: ${formatCurrency(base)} + IVA (${ivaRate}%): ${formatCurrency(ivaAmount)} = Total: ${formatCurrency(total)}`

    setResultMain(formatCurrency(total))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('doughnut', [base, ivaAmount], ['Base sin IVA', `IVA (${ivaRate}%)`], 'Desglose del precio')
    addToHistory(`${formatCurrency(base)} + IVA ${ivaRate}%`, formatCurrency(total))
  }

  const reverseIVA = () => {
    const total = parseFloat(ivaTotal)
    const ivaRate = parseFloat(ivaTypeReverse)

    if (isNaN(total)) {
      alert('Por favor, introduce un valor válido')
      return
    }

    const base = total / (1 + ivaRate / 100)
    const ivaAmount = total - base
    const explanation = `Total con IVA: ${formatCurrency(total)} = Base: ${formatCurrency(base)} + IVA (${ivaRate}%): ${formatCurrency(ivaAmount)}`

    setResultMain(formatCurrency(base))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('doughnut', [base, ivaAmount], ['Base sin IVA', `IVA (${ivaRate}%)`], 'Desglose del precio')
    addToHistory(`${formatCurrency(total)} sin IVA ${ivaRate}%`, formatCurrency(base))
  }

  // Calculadora de propinas
  const calculateTip = () => {
    const bill = parseFloat(billAmount)
    const tipPer = tipType === 'custom' ? parseFloat(customTip) : parseFloat(tipType)

    if (isNaN(bill) || isNaN(tipPer)) {
      alert('Por favor, introduce valores válidos')
      return
    }

    const tipAmount = (tipPer / 100) * bill
    const total = bill + tipAmount
    const explanation = `Cuenta: ${formatCurrency(bill)} + Propina (${formatPercent(tipPer)}): ${formatCurrency(tipAmount)} = Total: ${formatCurrency(total)}`

    setResultMain(formatCurrency(total))
    setResultExplanation(explanation)
    setShowResult(true)
    updateChart('doughnut', [bill, tipAmount], ['Cuenta', `Propina (${formatPercent(tipPer)})`], 'Desglose del total')
    addToHistory(`${formatCurrency(bill)} + propina ${formatPercent(tipPer)}`, formatCurrency(total))
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

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
      setCalculationHistory([])
      localStorage.removeItem('meskeia_percentage_history')
    }
  }

  return (
    <div className={styles.container}>
      {/* Logo meskeIA */}
      <div className={styles.meskeiaLogoContainer} onClick={() => window.location.href = '/'}>
        <div className={styles.meskeiaLogoIcon}></div>
        <div className={styles.meskeiaLogoText}>
          <span className={styles.meske}>meske</span><span className={styles.ia}>IA</span>
        </div>
      </div>

      {/* Título */}
      <div className={styles.pageTitle}>
        <h1>Calculadora de Porcentajes Avanzada</h1>
        <p className={styles.pageSubtitle}>
          Herramienta completa para cálculos de porcentajes con visualizaciones interactivas y ejemplos españoles
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
              onClick={() => setActiveTab('basic')}
            >
              Básico
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'change' ? styles.active : ''}`}
              onClick={() => setActiveTab('change')}
            >
              Cambios
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'iva' ? styles.active : ''}`}
              onClick={() => setActiveTab('iva')}
            >
              IVA
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'tips' ? styles.active : ''}`}
              onClick={() => setActiveTab('tips')}
            >
              Propinas
            </button>
          </div>

          {/* Calculadora básica */}
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
                  <div style={{ textAlign: 'center', margin: '8px 0', color: '#666' }}>de</div>
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
                <button type="button" className={styles.calcBtn} onClick={calculateBasic}>Calcular</button>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
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
                <div style={{ textAlign: 'center', margin: '8px 0', color: '#666' }}>de</div>
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
                <button type="button" className={styles.calcBtn} onClick={calculatePart}>Calcular Porcentaje</button>
              </div>
            </div>
          )}

          {/* Calculadora de cambios */}
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
                <button type="button" className={styles.calcBtn} onClick={calculateChange}>Calcular Cambio</button>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
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
                <button type="button" className={styles.calcBtn} onClick={applyChange}>Aplicar Cambio</button>
              </div>
            </div>
          )}

          {/* Calculadora IVA */}
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
                    >
                      <option value="21">General (21%)</option>
                      <option value="10">Reducido (10%)</option>
                      <option value="4">Superreducido (4%)</option>
                    </select>
                  </div>
                </div>
                <button type="button" className={styles.calcBtn} onClick={calculateIVA}>Calcular IVA</button>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '2rem' }}>
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
                  >
                    <option value="21">General (21%)</option>
                    <option value="10">Reducido (10%)</option>
                    <option value="4">Superreducido (4%)</option>
                  </select>
                </div>
                <button type="button" className={styles.calcBtn} onClick={reverseIVA}>Calcular Sin IVA</button>
              </div>
            </div>
          )}

          {/* Calculadora de propinas */}
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
                <button type="button" className={styles.calcBtn} onClick={calculateTip}>Calcular Propina</button>
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
            <canvas ref={chartRef}></canvas>
          </div>

          {/* Historial */}
          <div className={styles.historySection}>
            <h4>Historial de cálculos</h4>
            <div className={styles.historyList}>
              {calculationHistory.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#999' }}>
                  No hay cálculos aún
                </div>
              ) : (
                calculationHistory.map((item, index) => (
                  <div key={index} className={styles.historyItem}>
                    <div>
                      <strong>{item.result}</strong><br />
                      <small>{item.calculation}</small>
                    </div>
                    <small>{item.timestamp}</small>
                  </div>
                ))
              )}
            </div>
            <button className={styles.clearHistory} onClick={clearHistory}>Limpiar historial</button>
          </div>
        </div>
      </div>

      {/* Footer meskeIA Unificado */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <span>💡 ¿Te resultó útil?</span>
          <button type="button" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Calculadora de Porcentajes - meskeIA',
                text: '¡Mira esta herramienta útil de meskeIA!',
                url: window.location.href
              })
            } else {
              navigator.clipboard.writeText(window.location.href)
              alert('✅ Enlace copiado al portapapeles')
            }
          }}>
            🔗 Compártela
          </button>
        </div>
        <div className={styles.footerBottom}>
          © 2025 meskeIA
        </div>
      </footer>
    </div>
  )
}
