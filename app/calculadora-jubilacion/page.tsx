'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraJubilacion.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type Escenario = 'conservador' | 'moderado' | 'agresivo';
type ModoApp = 'calculadora' | 'comparador';

const ESCENARIOS = {
  conservador: { nombre: 'Conservador', rentabilidad: 3 },
  moderado: { nombre: 'Moderado', rentabilidad: 5 },
  agresivo: { nombre: 'Agresivo', rentabilidad: 7 },
};

interface ProyeccionAnual {
  ano: number;
  edad: number;
  aportacion: number;
  intereses: number;
  capitalAcumulado: number;
}

export default function CalculadoraJubilacionPage() {
  // Modo de la app
  const [modo, setModo] = useState<ModoApp>('calculadora');

  // Datos personales
  const [edadActual, setEdadActual] = useState(35);
  const [edadJubilacion, setEdadJubilacion] = useState(65);

  // Capital y aportaciones
  const [capitalInicial, setCapitalInicial] = useState('10000');
  const [aportacionMensual, setAportacionMensual] = useState('300');

  // Escenario de rentabilidad
  const [escenario, setEscenario] = useState<Escenario>('moderado');
  const [rentabilidadPersonalizada, setRentabilidadPersonalizada] = useState(5);

  // Estados para modo comparador (3 aportaciones diferentes)
  const [aportacion1, setAportacion1] = useState('200');
  const [aportacion2, setAportacion2] = useState('400');
  const [aportacion3, setAportacion3] = useState('600');

  // Refs para Chart.js
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // Años de jubilación estimados (para calcular pensión)
  const ANOS_JUBILACION = 25; // Esperanza de vida media tras jubilación

  // Calcular proyección
  const resultado = useMemo(() => {
    const capital = parseSpanishNumber(capitalInicial) || 0;
    const aportacion = parseSpanishNumber(aportacionMensual) || 0;
    const aportacionAnual = aportacion * 12;
    const anosHastaJubilacion = edadJubilacion - edadActual;

    if (anosHastaJubilacion <= 0) return null;

    const rentabilidad = escenario === 'moderado' && rentabilidadPersonalizada !== 5
      ? rentabilidadPersonalizada / 100
      : ESCENARIOS[escenario].rentabilidad / 100;

    // Proyección año a año
    const proyeccion: ProyeccionAnual[] = [];
    let capitalAcumulado = capital;

    for (let i = 1; i <= anosHastaJubilacion; i++) {
      const intereses = capitalAcumulado * rentabilidad;
      capitalAcumulado = capitalAcumulado + intereses + aportacionAnual;

      proyeccion.push({
        ano: i,
        edad: edadActual + i,
        aportacion: aportacionAnual,
        intereses,
        capitalAcumulado,
      });
    }

    // Totales
    const totalAportado = capital + (aportacionAnual * anosHastaJubilacion);
    const totalIntereses = capitalAcumulado - totalAportado;

    // Pensión mensual equivalente (asumiendo 25 años de jubilación)
    const pensionMensual = capitalAcumulado / (ANOS_JUBILACION * 12);

    // Calcular para todos los escenarios (comparador)
    const calcularEscenario = (rent: number) => {
      let cap = capital;
      for (let i = 0; i < anosHastaJubilacion; i++) {
        cap = cap * (1 + rent) + aportacionAnual;
      }
      return cap;
    };

    const capitalConservador = calcularEscenario(0.03);
    const capitalModerado = calcularEscenario(0.05);
    const capitalAgresivo = calcularEscenario(0.07);

    return {
      capitalFinal: capitalAcumulado,
      totalAportado,
      totalIntereses,
      pensionMensual,
      proyeccion,
      anosHastaJubilacion,
      rentabilidadUsada: rentabilidad * 100,
      comparador: {
        conservador: capitalConservador,
        moderado: capitalModerado,
        agresivo: capitalAgresivo,
      },
    };
  }, [capitalInicial, aportacionMensual, edadActual, edadJubilacion, escenario, rentabilidadPersonalizada]);

  // Calcular proyección para el modo comparador
  const datosComparador = useMemo(() => {
    const capital = parseSpanishNumber(capitalInicial) || 0;
    const aport1 = parseSpanishNumber(aportacion1) || 0;
    const aport2 = parseSpanishNumber(aportacion2) || 0;
    const aport3 = parseSpanishNumber(aportacion3) || 0;
    const anosHastaJubilacion = edadJubilacion - edadActual;

    if (anosHastaJubilacion <= 0) return null;

    // Usar la rentabilidad del escenario seleccionado
    const rentabilidad = escenario === 'moderado' && rentabilidadPersonalizada !== 5
      ? rentabilidadPersonalizada / 100
      : ESCENARIOS[escenario].rentabilidad / 100;

    // Función para calcular evolución año a año
    const calcularEvolucion = (aportacionMes: number) => {
      const aportacionAnual = aportacionMes * 12;
      const evolucion: number[] = [];
      let capitalAcumulado = capital;

      for (let i = 0; i <= anosHastaJubilacion; i++) {
        evolucion.push(capitalAcumulado);
        if (i < anosHastaJubilacion) {
          const intereses = capitalAcumulado * rentabilidad;
          capitalAcumulado = capitalAcumulado + intereses + aportacionAnual;
        }
      }
      return evolucion;
    };

    const evolucion1 = calcularEvolucion(aport1);
    const evolucion2 = calcularEvolucion(aport2);
    const evolucion3 = calcularEvolucion(aport3);

    const capitalFinal1 = evolucion1[evolucion1.length - 1];
    const capitalFinal2 = evolucion2[evolucion2.length - 1];
    const capitalFinal3 = evolucion3[evolucion3.length - 1];

    // Calcular totales aportados
    const totalAportado1 = capital + (aport1 * 12 * anosHastaJubilacion);
    const totalAportado2 = capital + (aport2 * 12 * anosHastaJubilacion);
    const totalAportado3 = capital + (aport3 * 12 * anosHastaJubilacion);

    // Pensiones equivalentes
    const pension1 = capitalFinal1 / (ANOS_JUBILACION * 12);
    const pension2 = capitalFinal2 / (ANOS_JUBILACION * 12);
    const pension3 = capitalFinal3 / (ANOS_JUBILACION * 12);

    // Labels para el eje X (años/edades)
    const labels = Array.from({ length: anosHastaJubilacion + 1 }, (_, i) =>
      i === 0 ? `${edadActual}` : `${edadActual + i}`
    );

    // Determinar cuál es la mejor opción
    const capitales = [capitalFinal1, capitalFinal2, capitalFinal3];
    const maxCapital = Math.max(...capitales);
    const mejorIndice = capitales.indexOf(maxCapital);

    return {
      labels,
      evolucion1,
      evolucion2,
      evolucion3,
      capitalFinal1,
      capitalFinal2,
      capitalFinal3,
      totalAportado1,
      totalAportado2,
      totalAportado3,
      intereses1: capitalFinal1 - totalAportado1,
      intereses2: capitalFinal2 - totalAportado2,
      intereses3: capitalFinal3 - totalAportado3,
      pension1,
      pension2,
      pension3,
      anosHastaJubilacion,
      rentabilidadUsada: rentabilidad * 100,
      mejorIndice,
      aportaciones: [aport1, aport2, aport3],
    };
  }, [capitalInicial, aportacion1, aportacion2, aportacion3, edadActual, edadJubilacion, escenario, rentabilidadPersonalizada]);

  // Efecto para el gráfico Chart.js
  useEffect(() => {
    if (modo !== 'comparador' || !chartRef.current || !datosComparador) return;

    // Destruir gráfico existente
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datosComparador.labels,
        datasets: [
          {
            label: `${formatCurrency(datosComparador.aportaciones[0])}/mes`,
            data: datosComparador.evolucion1,
            borderColor: '#2E86AB',
            backgroundColor: 'rgba(46, 134, 171, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
          {
            label: `${formatCurrency(datosComparador.aportaciones[1])}/mes`,
            data: datosComparador.evolucion2,
            borderColor: '#48A9A6',
            backgroundColor: 'rgba(72, 169, 166, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
          {
            label: `${formatCurrency(datosComparador.aportaciones[2])}/mes`,
            data: datosComparador.evolucion3,
            borderColor: '#7FB3D3',
            backgroundColor: 'rgba(127, 179, 211, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Edad',
            },
            grid: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Capital acumulado (€)',
            },
            ticks: {
              callback: (value) => formatCurrency(Number(value)),
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [modo, datosComparador]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Calculadora de Jubilación</h1>
        <p className={styles.subtitle}>
          Planifica tu retiro y calcula cuánto necesitas ahorrar
        </p>
      </header>

      {/* Selector de Modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'calculadora' ? styles.modoActivo : ''}`}
          onClick={() => setModo('calculadora')}
        >
          <span className={styles.modoIcon}>🧮</span>
          <span className={styles.modoNombre}>Calculadora</span>
        </button>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'comparador' ? styles.modoActivo : ''}`}
          onClick={() => setModo('comparador')}
        >
          <span className={styles.modoIcon}>📊</span>
          <span className={styles.modoNombre}>Comparador</span>
        </button>
      </div>

      {modo === 'calculadora' ? (
      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>👤 Datos Personales</h2>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Tu edad actual</label>
              <span className={styles.sliderValue}>{edadActual} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="18"
              max="60"
              value={edadActual}
              onChange={(e) => setEdadActual(parseInt(e.target.value))}
              aria-label="Edad actual"
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Edad de jubilación</label>
              <span className={styles.sliderValue}>{edadJubilacion} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min={edadActual + 1}
              max="70"
              value={edadJubilacion}
              onChange={(e) => setEdadJubilacion(parseInt(e.target.value))}
              aria-label="Edad de jubilación"
            />
            <span className={styles.helpText}>
              Te quedan {edadJubilacion - edadActual} años para ahorrar
            </span>
          </div>

          <h2 className={styles.sectionTitle}>💰 Capital y Aportaciones</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Capital actual ahorrado</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={capitalInicial}
                onChange={(e) => setCapitalInicial(e.target.value)}
                placeholder="10000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Aportación mensual</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={aportacionMensual}
                onChange={(e) => setAportacionMensual(e.target.value)}
                placeholder="300"
              />
              <span className={styles.unit}>€</span>
            </div>
            <span className={styles.helpText}>
              {formatCurrency((parseSpanishNumber(aportacionMensual) || 0) * 12)}/año
            </span>
          </div>

          <h2 className={styles.sectionTitle}>📈 Escenario de Rentabilidad</h2>

          <div className={styles.escenariosGrid}>
            {(Object.keys(ESCENARIOS) as Escenario[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.escenarioBtn} ${escenario === key ? styles.activo : ''}`}
                onClick={() => setEscenario(key)}
              >
                <span className={styles.escenarioNombre}>{ESCENARIOS[key].nombre}</span>
                <span className={styles.escenarioValor}>{ESCENARIOS[key].rentabilidad}%</span>
              </button>
            ))}
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Rentabilidad personalizada</label>
              <span className={styles.sliderValue}>{rentabilidadPersonalizada}%</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="12"
              step="0.5"
              value={rentabilidadPersonalizada}
              onChange={(e) => {
                setRentabilidadPersonalizada(parseFloat(e.target.value));
                setEscenario('moderado');
              }}
              aria-label="Rentabilidad personalizada"
            />
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Proyección de tu Jubilación</h2>

          {resultado ? (
            <>
              {/* Resultado Principal */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoLabel}>
                  Capital acumulado a los {edadJubilacion} años
                </span>
                <span className={styles.resultadoValor}>
                  {formatCurrency(resultado.capitalFinal)}
                </span>
                <span className={styles.resultadoSubtexto}>
                  Rentabilidad aplicada: {formatNumber(resultado.rentabilidadUsada, 1)}% anual
                </span>
              </div>

              {/* Pensión Equivalente */}
              <div className={styles.pensionBox}>
                <div className={styles.pensionLabel}>
                  💵 Pensión mensual equivalente
                </div>
                <div className={styles.pensionValor}>
                  {formatCurrency(resultado.pensionMensual)}
                </div>
                <div className={styles.pensionSubtexto}>
                  Asumiendo {ANOS_JUBILACION} años de jubilación
                </div>
              </div>

              {/* Desglose */}
              <div className={styles.resumenGrid}>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>💵</div>
                  <span className={styles.resumenLabel}>Total aportado</span>
                  <span className={styles.resumenValor}>
                    {formatCurrency(resultado.totalAportado)}
                  </span>
                </div>
                <div className={`${styles.resumenCard} ${styles.positivo}`}>
                  <div className={styles.resumenIcon}>📈</div>
                  <span className={styles.resumenLabel}>Intereses generados</span>
                  <span className={styles.resumenValor}>
                    +{formatCurrency(resultado.totalIntereses)}
                  </span>
                </div>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>📅</div>
                  <span className={styles.resumenLabel}>Años ahorrando</span>
                  <span className={styles.resumenValor}>
                    {resultado.anosHastaJubilacion}
                  </span>
                </div>
                <div className={styles.resumenCard}>
                  <div className={styles.resumenIcon}>🔢</div>
                  <span className={styles.resumenLabel}>Multiplicador</span>
                  <span className={styles.resumenValor}>
                    x{formatNumber(resultado.capitalFinal / resultado.totalAportado, 2)}
                  </span>
                </div>
              </div>

              {/* Comparador de Escenarios */}
              <div className={styles.comparadorSection}>
                <h3 className={styles.sectionTitle}>🔄 Comparador de Escenarios</h3>
                <div className={styles.comparadorGrid}>
                  <div className={`${styles.escenarioCard} ${styles.conservador}`}>
                    <div className={styles.escenarioCardTitulo}>Conservador</div>
                    <div className={styles.escenarioCardRentabilidad}>3% anual</div>
                    <div className={styles.escenarioCardValor}>
                      {formatCurrency(resultado.comparador.conservador)}
                    </div>
                  </div>
                  <div className={`${styles.escenarioCard} ${styles.moderado}`}>
                    <div className={styles.escenarioCardTitulo}>Moderado</div>
                    <div className={styles.escenarioCardRentabilidad}>5% anual</div>
                    <div className={styles.escenarioCardValor}>
                      {formatCurrency(resultado.comparador.moderado)}
                    </div>
                  </div>
                  <div className={`${styles.escenarioCard} ${styles.agresivo}`}>
                    <div className={styles.escenarioCardTitulo}>Agresivo</div>
                    <div className={styles.escenarioCardRentabilidad}>7% anual</div>
                    <div className={styles.escenarioCardValor}>
                      {formatCurrency(resultado.comparador.agresivo)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla Evolución */}
              <div className={styles.tablaSection}>
                <h3 className={styles.sectionTitle}>📅 Evolución Anual</h3>
                <div className={styles.tablaContainer}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Año</th>
                        <th>Edad</th>
                        <th>Aportación</th>
                        <th>Intereses</th>
                        <th>Capital</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.proyeccion.map((row) => (
                        <tr key={row.ano}>
                          <td>{row.ano}</td>
                          <td>{row.edad}</td>
                          <td>{formatCurrency(row.aportacion)}</td>
                          <td className={styles.positivo}>+{formatCurrency(row.intereses)}</td>
                          <td><strong>{formatCurrency(row.capitalAcumulado)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🎯</div>
              <p>La edad de jubilación debe ser mayor</p>
              <p>que tu edad actual</p>
            </div>
          )}
        </div>
      </div>
      ) : (
      /* Modo Comparador de Aportaciones */
      <div className={styles.comparadorContent}>
        {/* Panel de Configuración Comparador */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>👤 Datos Personales</h2>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Tu edad actual</label>
              <span className={styles.sliderValue}>{edadActual} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="18"
              max="60"
              value={edadActual}
              onChange={(e) => setEdadActual(parseInt(e.target.value))}
              aria-label="Edad actual"
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Edad de jubilación</label>
              <span className={styles.sliderValue}>{edadJubilacion} años</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min={edadActual + 1}
              max="70"
              value={edadJubilacion}
              onChange={(e) => setEdadJubilacion(parseInt(e.target.value))}
              aria-label="Edad de jubilación"
            />
            <span className={styles.helpText}>
              Te quedan {edadJubilacion - edadActual} años para ahorrar
            </span>
          </div>

          <h2 className={styles.sectionTitle}>💰 Capital Inicial</h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Capital actual ahorrado</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                value={capitalInicial}
                onChange={(e) => setCapitalInicial(e.target.value)}
                placeholder="10000"
              />
              <span className={styles.unit}>€</span>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>📊 Aportaciones a Comparar</h2>

          <div className={styles.aportacionesInputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Aportación 1</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={aportacion1}
                  onChange={(e) => setAportacion1(e.target.value)}
                  placeholder="200"
                />
                <span className={styles.unit}>€/mes</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Aportación 2</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={aportacion2}
                  onChange={(e) => setAportacion2(e.target.value)}
                  placeholder="400"
                />
                <span className={styles.unit}>€/mes</span>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Aportación 3</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={styles.input}
                  value={aportacion3}
                  onChange={(e) => setAportacion3(e.target.value)}
                  placeholder="600"
                />
                <span className={styles.unit}>€/mes</span>
              </div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>📈 Rentabilidad</h2>

          <div className={styles.escenariosGrid}>
            {(Object.keys(ESCENARIOS) as Escenario[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.escenarioBtn} ${escenario === key ? styles.activo : ''}`}
                onClick={() => setEscenario(key)}
              >
                <span className={styles.escenarioNombre}>{ESCENARIOS[key].nombre}</span>
                <span className={styles.escenarioValor}>{ESCENARIOS[key].rentabilidad}%</span>
              </button>
            ))}
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <label className={styles.label}>Rentabilidad personalizada</label>
              <span className={styles.sliderValue}>{rentabilidadPersonalizada}%</span>
            </div>
            <input
              type="range"
              className={styles.slider}
              min="1"
              max="12"
              step="0.5"
              value={rentabilidadPersonalizada}
              onChange={(e) => {
                setRentabilidadPersonalizada(parseFloat(e.target.value));
                setEscenario('moderado');
              }}
              aria-label="Rentabilidad personalizada"
            />
          </div>
        </div>

        {/* Panel de Resultados Comparador */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>📊 Comparación de Aportaciones</h2>

          {datosComparador ? (
            <>
              {/* Gráfico de Evolución */}
              <div className={styles.chartSection}>
                <h3 className={styles.sectionTitle}>📈 Evolución del Capital</h3>
                <div className={styles.chartContainer}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* Cards de Resumen */}
              <div className={styles.resumenCardsComparador}>
                {[
                  { aportacion: datosComparador.aportaciones[0], capital: datosComparador.capitalFinal1, pension: datosComparador.pension1, intereses: datosComparador.intereses1, color: '#2E86AB' },
                  { aportacion: datosComparador.aportaciones[1], capital: datosComparador.capitalFinal2, pension: datosComparador.pension2, intereses: datosComparador.intereses2, color: '#48A9A6' },
                  { aportacion: datosComparador.aportaciones[2], capital: datosComparador.capitalFinal3, pension: datosComparador.pension3, intereses: datosComparador.intereses3, color: '#7FB3D3' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.resumenCardComp} ${datosComparador.mejorIndice === index ? styles.mejorOpcion : ''}`}
                    style={{ borderTopColor: item.color }}
                  >
                    {datosComparador.mejorIndice === index && (
                      <span className={styles.mejorBadge}>🏆 Mayor pensión</span>
                    )}
                    <div className={styles.resumenCardHeader}>
                      <span className={styles.resumenCardAportacion}>
                        {formatCurrency(item.aportacion)}/mes
                      </span>
                    </div>
                    <div className={styles.resumenCardCapital}>
                      {formatCurrency(item.capital)}
                    </div>
                    <div className={styles.resumenCardPension}>
                      Pensión: <strong>{formatCurrency(item.pension)}/mes</strong>
                    </div>
                    <div className={styles.resumenCardIntereses}>
                      +{formatCurrency(item.intereses)} en intereses
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div className={styles.infoAdicional}>
                <p>
                  <strong>Rentabilidad aplicada:</strong> {formatNumber(datosComparador.rentabilidadUsada, 1)}% anual
                </p>
                <p>
                  <strong>Horizonte temporal:</strong> {datosComparador.anosHastaJubilacion} años
                </p>
              </div>

              {/* Tabla Comparativa */}
              <div className={styles.tablaSection}>
                <h3 className={styles.sectionTitle}>📋 Detalle Comparativo</h3>
                <div className={styles.tablaContainer}>
                  <table className={styles.tablaComparativa}>
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th style={{ color: '#2E86AB' }}>{formatCurrency(datosComparador.aportaciones[0])}/mes</th>
                        <th style={{ color: '#48A9A6' }}>{formatCurrency(datosComparador.aportaciones[1])}/mes</th>
                        <th style={{ color: '#7FB3D3' }}>{formatCurrency(datosComparador.aportaciones[2])}/mes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Aportación anual</td>
                        <td>{formatCurrency(datosComparador.aportaciones[0] * 12)}</td>
                        <td>{formatCurrency(datosComparador.aportaciones[1] * 12)}</td>
                        <td>{formatCurrency(datosComparador.aportaciones[2] * 12)}</td>
                      </tr>
                      <tr>
                        <td>Total aportado</td>
                        <td>{formatCurrency(datosComparador.totalAportado1)}</td>
                        <td>{formatCurrency(datosComparador.totalAportado2)}</td>
                        <td>{formatCurrency(datosComparador.totalAportado3)}</td>
                      </tr>
                      <tr>
                        <td>Intereses generados</td>
                        <td className={styles.positivo}>+{formatCurrency(datosComparador.intereses1)}</td>
                        <td className={styles.positivo}>+{formatCurrency(datosComparador.intereses2)}</td>
                        <td className={styles.positivo}>+{formatCurrency(datosComparador.intereses3)}</td>
                      </tr>
                      <tr className={styles.filaDestacada}>
                        <td><strong>Capital final</strong></td>
                        <td><strong>{formatCurrency(datosComparador.capitalFinal1)}</strong></td>
                        <td><strong>{formatCurrency(datosComparador.capitalFinal2)}</strong></td>
                        <td><strong>{formatCurrency(datosComparador.capitalFinal3)}</strong></td>
                      </tr>
                      <tr className={styles.filaPension}>
                        <td>Pensión mensual</td>
                        <td>{formatCurrency(datosComparador.pension1)}/mes</td>
                        <td>{formatCurrency(datosComparador.pension2)}/mes</td>
                        <td>{formatCurrency(datosComparador.pension3)}/mes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🎯</div>
              <p>La edad de jubilación debe ser mayor</p>
              <p>que tu edad actual</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>simulación teórica</strong> basada en una rentabilidad
          constante. En la realidad, los mercados fluctúan y las rentabilidades pasadas no garantizan
          resultados futuros. No tiene en cuenta inflación, impuestos ni comisiones de gestión.
          <strong> No constituye asesoramiento financiero</strong>. Consulta con un profesional para
          planificar tu jubilación de forma personalizada.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="📚 ¿Quieres planificar mejor tu jubilación?"
        subtitle="Aprende estrategias de ahorro a largo plazo y cómo alcanzar tu independencia financiera"
      >
        <section className={styles.guideSection}>
          <h2>Claves para una Jubilación Tranquila</h2>
          <p className={styles.introParagraph}>
            La jubilación es probablemente el objetivo financiero más importante de tu vida.
            Cuanto antes empieces a ahorrar, más fácil será alcanzar la cantidad que necesitas
            gracias al poder del interés compuesto.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>⏰ Empieza Cuanto Antes</h4>
              <p>
                El tiempo es tu mayor aliado. Empezar a los 25 años con 200€/mes supera
                con creces empezar a los 40 con 400€/mes. Cada año que retrases el inicio
                te costará mucho más esfuerzo compensarlo después.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📊 La Regla del 4%</h4>
              <p>
                Una estrategia popular sugiere que puedes retirar el 4% de tu cartera
                anualmente sin agotar el capital en 30 años. Para 2.000€/mes necesitarías
                aproximadamente 600.000€ ahorrados.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💼 Diversifica tu Ahorro</h4>
              <p>
                No dependas solo de la pensión pública. Combina diferentes vehículos:
                planes de pensiones (con ventajas fiscales), fondos indexados,
                inmuebles, y un fondo de emergencia líquido.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔥 Movimiento FIRE</h4>
              <p>
                Financial Independence, Retire Early. Se basa en ahorrar agresivamente
                (50-70% de ingresos), invertir en índices y jubilarse antes de los 50.
                No es para todos, pero sus principios son valiosos.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Escenarios de Rentabilidad</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🟢 Conservador (3%)</h4>
              <p>
                Cartera con alto porcentaje de renta fija (bonos, depósitos).
                Menor volatilidad pero menor crecimiento. Adecuado si te faltan
                pocos años para jubilarte.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🟡 Moderado (5%)</h4>
              <p>
                Cartera equilibrada entre renta fija y variable. Balance entre
                seguridad y crecimiento. Opción más común para horizontes
                de 15-25 años.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🔴 Agresivo (7%)</h4>
              <p>
                Cartera mayoritariamente en renta variable (acciones, ETFs).
                Mayor potencial pero más volatilidad. Adecuado para horizontes
                muy largos (+25 años) y alta tolerancia al riesgo.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-jubilacion')} />

      <Footer appName="calculadora-jubilacion" />
    </div>
  );
}
