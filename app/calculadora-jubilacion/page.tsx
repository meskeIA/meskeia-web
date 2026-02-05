'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraJubilacion.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
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

  // Estados para código HTML exportable
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

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

  // Función para generar código HTML exportable de la proyección
  const generarCodigoHTML = useCallback(() => {
    if (!resultado) {
      setHtmlCode('');
      return;
    }

    const { proyeccion, capitalFinal, totalAportado, totalIntereses, pensionMensual, anosHastaJubilacion } = resultado;

    let codigo = '<!-- Proyección de Ahorro para Jubilación generada con meskeIA -->\n\n';
    codigo += '<div class="proyeccion-jubilacion">\n';
    codigo += '  <h2>Tu Proyección de Ahorro para la Jubilación</h2>\n';
    codigo += '  <div class="resumen">\n';
    codigo += `    <p><strong>Años hasta jubilación:</strong> ${anosHastaJubilacion} años</p>\n`;
    codigo += `    <p><strong>Capital final estimado:</strong> ${formatCurrency(capitalFinal)}</p>\n`;
    codigo += `    <p><strong>Total aportado:</strong> ${formatCurrency(totalAportado)}</p>\n`;
    codigo += `    <p><strong>Intereses generados:</strong> ${formatCurrency(totalIntereses)}</p>\n`;
    codigo += `    <p><strong>Pensión mensual equivalente:</strong> ${formatCurrency(pensionMensual)}</p>\n`;
    codigo += '  </div>\n\n';
    codigo += '  <h3>Evolución Año a Año</h3>\n';
    codigo += '  <table>\n';
    codigo += '    <thead>\n';
    codigo += '      <tr>\n';
    codigo += '        <th>Año</th>\n';
    codigo += '        <th>Edad</th>\n';
    codigo += '        <th>Aportación Anual</th>\n';
    codigo += '        <th>Intereses del Año</th>\n';
    codigo += '        <th>Capital Acumulado</th>\n';
    codigo += '      </tr>\n';
    codigo += '    </thead>\n';
    codigo += '    <tbody>\n';

    // Mostrar máximo 10 años (inicio, medio y final)
    const proyeccionMostrar = proyeccion.length <= 10
      ? proyeccion
      : [
          ...proyeccion.slice(0, 3),
          ...proyeccion.slice(Math.floor(proyeccion.length / 2) - 1, Math.floor(proyeccion.length / 2) + 2),
          ...proyeccion.slice(-3)
        ];

    proyeccionMostrar.forEach((p, index) => {
      codigo += '      <tr>\n';
      codigo += `        <td>${p.ano}</td>\n`;
      codigo += `        <td>${p.edad} años</td>\n`;
      codigo += `        <td>${formatCurrency(p.aportacion)}</td>\n`;
      codigo += `        <td>${formatCurrency(p.intereses)}</td>\n`;
      codigo += `        <td>${formatCurrency(p.capitalAcumulado)}</td>\n`;
      codigo += '      </tr>\n';

      // Añadir fila "..." si hay salto
      if (index === 2 && proyeccion.length > 10) {
        codigo += '      <tr class="ellipsis"><td colspan="5">...</td></tr>\n';
      }
      if (index === 5 && proyeccion.length > 10) {
        codigo += '      <tr class="ellipsis"><td colspan="5">...</td></tr>\n';
      }
    });

    codigo += '    </tbody>\n';
    codigo += '  </table>\n';
    codigo += '</div>\n\n';
    codigo += '<style>\n';
    codigo += '.proyeccion-jubilacion {\n';
    codigo += '  max-width: 900px;\n';
    codigo += '  margin: 2rem auto;\n';
    codigo += '  padding: 1.5rem;\n';
    codigo += '  background: #ffffff;\n';
    codigo += '  border: 1px solid #e5e5e5;\n';
    codigo += '  border-radius: 12px;\n';
    codigo += '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion h2 {\n';
    codigo += '  text-align: center;\n';
    codigo += '  color: #2E86AB;\n';
    codigo += '  margin-bottom: 1.5rem;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion .resumen {\n';
    codigo += '  background: #f0f8ff;\n';
    codigo += '  padding: 1rem;\n';
    codigo += '  border-radius: 8px;\n';
    codigo += '  margin-bottom: 1.5rem;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion table {\n';
    codigo += '  width: 100%;\n';
    codigo += '  border-collapse: collapse;\n';
    codigo += '  margin-top: 1rem;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion th,\n';
    codigo += '.proyeccion-jubilacion td {\n';
    codigo += '  padding: 0.75rem;\n';
    codigo += '  text-align: right;\n';
    codigo += '  border-bottom: 1px solid #e5e5e5;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion th {\n';
    codigo += '  background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);\n';
    codigo += '  color: white;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion th:first-child,\n';
    codigo += '.proyeccion-jubilacion td:first-child {\n';
    codigo += '  text-align: left;\n';
    codigo += '}\n';
    codigo += '.proyeccion-jubilacion tr.ellipsis td {\n';
    codigo += '  text-align: center;\n';
    codigo += '  color: #999;\n';
    codigo += '  font-weight: bold;\n';
    codigo += '}\n';
    codigo += '</style>';

    setHtmlCode(codigo);
  }, [resultado]);

  // Efecto para generar código HTML automáticamente
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  // Función para copiar código HTML al portapapeles
  const copiarCodigo = () => {
    navigator.clipboard.writeText(htmlCode);
  };

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

      <LegalNotice lastUpdated="2026-02-02" />

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

      <DisclaimerCard
        variant="financial"
        severity="high"
        context="calculadora-jubilacion"
        collapsible={true}
      />

      

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

      {/* ==================== SECCIONES PROFESIONALES ==================== */}

      {/* 1. HTML Code Exportable */}
      {htmlCode && (
        <section className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>📋 Exportar Proyección de Ahorro</h2>
              <p className={styles.htmlSubtitle}>
                Copia el código HTML para usar la proyección en tu web, blog o documento
              </p>
            </div>
            <div className={styles.htmlActions}>
              <button
                onClick={() => setHtmlExpanded(!htmlExpanded)}
                className={styles.btnToggleCode}
                aria-label={htmlExpanded ? 'Ocultar código HTML' : 'Mostrar código HTML'}
              >
                {htmlExpanded ? '▲ Ocultar' : '▼ Mostrar'} código
              </button>
              {htmlExpanded && (
                <button
                  onClick={copiarCodigo}
                  className={styles.btnCopyCode}
                  aria-label="Copiar código HTML al portapapeles"
                >
                  📋 Copiar
                </button>
              )}
            </div>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
            </div>
          )}
        </section>
      )}

      {/* 2. Tabla Comparativa de Escenarios */}
      <section className={styles.comparativaSection}>
        <h2>⚖️ Comparativa de Escenarios de Rentabilidad</h2>
        <p className={styles.sectionIntro}>
          Mismo esfuerzo de ahorro, distintos resultados según tu perfil de riesgo. Ejemplo con 35 años,
          jubilación a los 65, capital inicial 10.000 € y aportación mensual 300 €:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>🟢 Conservador</th>
                <th>🟡 Moderado</th>
                <th>🔴 Agresivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Rentabilidad anual</strong></td>
                <td>3%</td>
                <td>5%</td>
                <td>7%</td>
              </tr>
              <tr>
                <td><strong>Perfil de inversión</strong></td>
                <td>Mayormente renta fija</td>
                <td>Mix 60/40 (renta fija/variable)</td>
                <td>Mayormente renta variable</td>
              </tr>
              <tr>
                <td><strong>Total aportado</strong></td>
                <td>118.000 €</td>
                <td>118.000 €</td>
                <td>118.000 €</td>
              </tr>
              <tr>
                <td><strong>Capital final estimado</strong></td>
                <td>187.482 €</td>
                <td>252.414 €</td>
                <td>341.998 €</td>
              </tr>
              <tr>
                <td><strong>Intereses generados</strong></td>
                <td>69.482 € (+59%)</td>
                <td>134.414 € (+114%)</td>
                <td>223.998 € (+190%)</td>
              </tr>
              <tr>
                <td><strong>Pensión mensual equivalente</strong></td>
                <td>625 €/mes</td>
                <td>841 €/mes</td>
                <td>1.140 €/mes</td>
              </tr>
              <tr>
                <td><strong>Riesgo/Volatilidad</strong></td>
                <td>Bajo (fluctuaciones mínimas)</td>
                <td>Medio (fluctuaciones moderadas)</td>
                <td>Alto (fluctuaciones significativas)</td>
              </tr>
              <tr>
                <td><strong>¿Para quién?</strong></td>
                <td>Aversión al riesgo, cerca de jubilación</td>
                <td>Equilibrio riesgo-rentabilidad, horizonte medio</td>
                <td>Alta tolerancia al riesgo, horizonte muy largo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.comparativaNota}>
          <p>
            <strong>⚠️ Importante:</strong> Las rentabilidades mostradas son medias históricas aproximadas.
            Los rendimientos pasados no garantizan resultados futuros. La rentabilidad real dependerá de
            los productos elegidos y las condiciones de mercado.
          </p>
        </div>
      </section>

      {/* 3. Casos de Uso Reales */}
      <section className={styles.casosSection}>
        <h2>💡 Casos de Uso: Situaciones Reales de Ahorro para Jubilación</h2>
        <p className={styles.sectionIntro}>
          Cada persona tiene circunstancias distintas. Aquí tienes 5 perfiles reales con estrategias adaptadas:
        </p>

        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>💼</div>
            <h3>Freelance sin pensión empresarial</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Laura, 32 años, diseñadora freelance sin plan de pensiones</p>
              <p><strong>Estrategia:</strong> Abrir plan de pensiones individual + aportación 400 €/mes</p>
              <p><strong>Resultado a los 65:</strong> ~380.000 € (escenario moderado 5%)</p>
              <p><strong>Ventaja fiscal:</strong> Reducción IRPF de 4.800 €/año (ahorro ~1.200 €/año en impuestos)</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Como autónoma, aprovecha la deducción fiscal del plan de pensiones (máx. 1.500 €/año)
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>⏰</div>
            <h3>Asalariado que empieza tarde</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Carlos, 45 años, empieza a ahorrar para jubilación (20 años restantes)</p>
              <p><strong>Estrategia:</strong> Capital inicial 15.000 € + aportación agresiva 800 €/mes</p>
              <p><strong>Resultado a los 65:</strong> ~276.000 € (escenario moderado 5%)</p>
              <p><strong>Alternativa:</strong> Si solo aporta 400 €/mes → 153.000 € (casi la mitad)</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Al empezar tarde, necesitas aportaciones mayores para compensar el menor horizonte temporal
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>🚀</div>
            <h3>Emprendedor con salidas de capital</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Ana, 38 años, vendió su startup (150.000 € netos)</p>
              <p><strong>Estrategia:</strong> Invierte 100.000 € en cartera ETFs + aportación 500 €/mes</p>
              <p><strong>Resultado a los 65:</strong> ~575.000 € (escenario moderado 5%)</p>
              <p><strong>Diversificación:</strong> 40% renta fija + 60% renta variable (rebalanceo anual)</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> No pongas todo en un solo producto. Diversifica entre planes de pensiones, ETFs y fondos indexados
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>🏠</div>
            <h3>Pareja con herencia familiar</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Juan y María, 42 años, heredan 80.000 € de sus padres</p>
              <p><strong>Estrategia:</strong> Destinan 60.000 € a jubilación (30.000 € cada uno) + aportación 250 €/mes c/u</p>
              <p><strong>Resultado a los 65:</strong> ~170.000 € cada uno = 340.000 € total (moderado 5%)</p>
              <p><strong>Pensión complementaria:</strong> 1.133 €/mes entre ambos (además de pensión pública)</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> Las herencias son perfectas para jubilación. Invierte la mayoría en lugar de gastarla
            </div>
          </div>

          <div className={styles.casoCard}>
            <div className={styles.casoIcon}>♀️</div>
            <h3>Mujer con brecha salarial</h3>
            <div className={styles.casoDetalle}>
              <p><strong>Situación:</strong> Elena, 40 años, salario 30% menor que hombres equivalentes + pausa maternal 3 años</p>
              <p><strong>Problema:</strong> Pensión pública estimada 40% inferior al promedio masculino</p>
              <p><strong>Estrategia:</strong> Plan de pensiones 350 €/mes + ETFs 150 €/mes (compensa brecha)</p>
              <p><strong>Resultado a los 65:</strong> ~215.000 € (escenario moderado) para complementar pensión pública</p>
            </div>
            <div className={styles.casoTip}>
              <strong>💡 Consejo:</strong> La brecha de género es real. Las mujeres DEBEN ahorrar más para compensar menores cotizaciones
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className={styles.faqSection}>
        <h2>❓ Preguntas Frecuentes sobre Ahorro para la Jubilación</h2>

        <div className={styles.faqGrid}>
          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cuánto cobraré de pensión pública en España?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                En 2026, la <strong>pensión pública media</strong> en España es de <strong>1.250 €/mes</strong> (14 pagas).
                Pero depende de tus años cotizados y base reguladora:
              </p>
              <ul>
                <li><strong>Mínimo:</strong> 737 €/mes (con 15 años cotizados sin cónyuge a cargo)</li>
                <li><strong>Máximo:</strong> 3.175 €/mes (con 37+ años cotizados y base máxima)</li>
                <li><strong>Realidad:</strong> Solo el 5% de jubilados alcanza la pensión máxima</li>
              </ul>
              <p>
                <strong>Proyección futura:</strong> La Seguridad Social estima que las pensiones perderán poder
                adquisitivo (~20-30% menos en términos reales para 2050). Por eso el ahorro privado es crítico.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Plan de pensiones vs. ETFs? ¿Qué es mejor?
            </summary>
            <div className={styles.faqAnswer}>
              <p>Ambos tienen ventajas e inconvenientes. Muchos expertos recomiendan <strong>combinar ambos</strong>:</p>
              <table className={styles.faqComparativaTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Plan de Pensiones</th>
                    <th>ETFs (Fondos Indexados)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ventaja fiscal</strong></td>
                    <td>✅ Deducción IRPF (hasta 1.500 €/año)</td>
                    <td>❌ Sin deducción al aportar</td>
                  </tr>
                  <tr>
                    <td><strong>Liquidez</strong></td>
                    <td>❌ Bloqueado hasta jubilación</td>
                    <td>✅ Disponible en 24-48h</td>
                  </tr>
                  <tr>
                    <td><strong>Costes (TER)</strong></td>
                    <td>🟡 0,5-1,5% anual (altos)</td>
                    <td>✅ 0,05-0,3% anual (bajos)</td>
                  </tr>
                  <tr>
                    <td><strong>Fiscalidad al rescate</strong></td>
                    <td>🟡 Tributa como renta trabajo (18-47%)</td>
                    <td>✅ Solo plusvalías (19-26%)</td>
                  </tr>
                  <tr>
                    <td><strong>Flexibilidad</strong></td>
                    <td>❌ Formas limitadas de rescate</td>
                    <td>✅ Total libertad</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>Recomendación:</strong> Plan de pensiones hasta el máximo deducible (1.500 €/año para aprovechar
                la ventaja fiscal). El resto, en ETFs para tener flexibilidad y menores costes.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿A qué edad puedo jubilarme en España?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                La edad legal de jubilación en 2026 depende de tus años cotizados:
              </p>
              <ul>
                <li><strong>Con 38+ años cotizados:</strong> 65 años</li>
                <li><strong>Con menos de 38 años:</strong> 66 años y 6 meses (sube progresivamente hasta 67 años en 2027)</li>
              </ul>
              <p><strong>Jubilación anticipada voluntaria:</strong></p>
              <ul>
                <li>Posible desde los <strong>63 años</strong> (si tienes 35+ años cotizados)</li>
                <li>Penalización del 0,63% por mes adelantado (máx. 24 meses) = hasta 15% menos de pensión</li>
              </ul>
              <p><strong>Jubilación demorada:</strong></p>
              <ul>
                <li>Trabajar más allá de 65-67 años <strong>incrementa tu pensión</strong> un 4% por año extra</li>
                <li>Ejemplo: Retrasar 3 años → +12% de pensión vitalicia</li>
              </ul>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Puedo rescatar mi plan de pensiones antes de jubilarme?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                Los planes de pensiones están <strong>bloqueados hasta la jubilación</strong>, pero hay excepciones:
              </p>
              <ul>
                <li><strong>Jubilación:</strong> La forma estándar (a partir de edad legal)</li>
                <li><strong>Enfermedad grave:</strong> Tú o cónyuge/familiar de primer grado (cáncer, párkinson, infarto...)</li>
                <li><strong>Desempleo de larga duración:</strong> Más de 12 meses en paro</li>
                <li><strong>10 años desde la primera aportación:</strong> Planes anteriores a 2015 permiten rescate pasados 10 años</li>
                <li><strong>Ejecución hipotecaria:</strong> Si pierdes tu vivienda habitual</li>
              </ul>
              <p>
                <strong>Importante:</strong> Al rescatar, tributas como renta del trabajo (18-47% según tramos).
                Si rescatas todo de golpe, pagarás más impuestos que si lo haces gradualmente.
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Cómo tributan los planes de pensiones?
            </summary>
            <div className={styles.faqAnswer}>
              <p><strong>Al aportar (presente):</strong></p>
              <ul>
                <li>Reduces tu base imponible del IRPF (máx. 1.500 €/año)</li>
                <li>Ahorro fiscal real: 18-47% de lo aportado (según tu tramo)</li>
                <li>Ejemplo: Si aportas 1.500 € y estás en tramo 30% → ahorras 450 € en impuestos</li>
              </ul>
              <p><strong>Al rescatar (futuro):</strong></p>
              <ul>
                <li>El dinero tributa como <strong>rendimiento del trabajo</strong></li>
                <li>Tramos IRPF 2026: 19% (hasta 12.450 €) → 47% (más de 300.000 €)</li>
                <li><strong>Importante:</strong> No pagas impuestos sobre las aportaciones (ya tributaste cuando ganaste ese dinero),
                  pero sí sobre los intereses acumulados</li>
              </ul>
              <p><strong>Formas de rescate (optimización fiscal):</strong></p>
              <ul>
                <li><strong>Renta vitalicia:</strong> Pensión mensual de por vida (tributa poco a poco)</li>
                <li><strong>Renta temporal:</strong> Pensión durante X años (ej: 10 años)</li>
                <li><strong>Capital (golpe):</strong> Todo de una vez (⚠️ peor fiscalmente, puedes saltar de tramo)</li>
                <li><strong>Mixto:</strong> Parte en capital, parte en renta</li>
              </ul>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Qué pasa con mi plan de pensiones si fallezco?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                El dinero acumulado en tu plan de pensiones se transfiere a los <strong>beneficiarios designados</strong>:
              </p>
              <ul>
                <li><strong>Beneficiarios por defecto:</strong> Cónyuge → hijos → padres (en ese orden)</li>
                <li><strong>Beneficiarios personalizados:</strong> Puedes designar a quien quieras (modificable en cualquier momento)</li>
              </ul>
              <p><strong>Fiscalidad para los herederos:</strong></p>
              <ul>
                <li>Los beneficiarios <strong>NO pagan Impuesto de Sucesiones</strong> por planes de pensiones</li>
                <li>Pero sí tributan por <strong>IRPF como renta del trabajo</strong> cuando rescaten el dinero</li>
                <li>Pueden elegir entre rescate en capital (todo de golpe) o renta temporal</li>
              </ul>
              <p>
                <strong>Comparación con herencias normales:</strong> Los planes de pensiones NO cuentan para el
                cálculo del Impuesto de Sucesiones, lo que puede ser ventajoso fiscalmente frente a cuentas bancarias
                o acciones (que sí pagan Sucesiones del 7,65% al 34%).
              </p>
            </div>
          </details>

          <details className={styles.faqItem}>
            <summary className={styles.faqQuestion}>
              ¿Es mejor invertir en un piso para alquilar o en un plan de pensiones?
            </summary>
            <div className={styles.faqAnswer}>
              <p>
                Depende de tu perfil, pero ambos tienen pros y contras:
              </p>
              <table className={styles.faqComparativaTable}>
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Inmueble en Alquiler</th>
                    <th>Plan Pensiones + ETFs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Capital inicial</strong></td>
                    <td>Alto (entrada + gastos ~50.000-100.000 €)</td>
                    <td>Bajo (desde 50 €/mes)</td>
                  </tr>
                  <tr>
                    <td><strong>Liquidez</strong></td>
                    <td>Baja (vender puede tardar meses)</td>
                    <td>Alta (ETFs en 24-48h)</td>
                  </tr>
                  <tr>
                    <td><strong>Rentabilidad típica</strong></td>
                    <td>3-5% neta (tras gastos e impuestos)</td>
                    <td>4-7% histórica (según perfil riesgo)</td>
                  </tr>
                  <tr>
                    <td><strong>Gestión requerida</strong></td>
                    <td>Alta (inquilinos, averías, IBI, comunidad)</td>
                    <td>Baja (rebalanceo 1-2 veces/año)</td>
                  </tr>
                  <tr>
                    <td><strong>Diversificación</strong></td>
                    <td>Baja (todo en un activo y ubicación)</td>
                    <td>Alta (cientos de empresas/países)</td>
                  </tr>
                  <tr>
                    <td><strong>Fiscalidad</strong></td>
                    <td>Tributas por alquiler (19-47% IRPF)</td>
                    <td>Plan: deducción presente. ETFs: solo al vender</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <strong>Conclusión:</strong> El inmueble puede funcionar bien si tienes capital inicial alto, tiempo
                para gestionar y el mercado local es sólido. Pero para la mayoría, los fondos de inversión ofrecen
                mejor diversificación, liquidez y menos dolores de cabeza.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* 5. Guía Paso a Paso */}
      <section className={styles.guiaSection}>
        <h2>🗺️ Guía Paso a Paso: Planificar tu Jubilación en España</h2>
        <p className={styles.sectionIntro}>
          Sigue estos 6 pasos para construir un plan de jubilación sólido desde cero:
        </p>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>📊 Calcula cuánto necesitarás</h3>
              <p>
                Antes de ahorrar, define tu <strong>objetivo de pensión complementaria</strong>:
              </p>
              <ul>
                <li>Estima tu pensión pública: Consulta tu informe en la web de la Seguridad Social</li>
                <li>Calcula tus gastos en jubilación: 70-80% de tus gastos actuales (menos hipoteca/hijos)</li>
                <li>Brecha a cubrir: Diferencia entre pensión pública y gastos deseados</li>
              </ul>
              <div className={styles.stepExample}>
                <strong>Ejemplo:</strong> Gastos deseados 2.500 €/mes - Pensión pública 1.400 €/mes =
                Necesitas complementar <strong>1.100 €/mes</strong>
              </div>
              <div className={styles.stepTip}>
                💡 <strong>Tip:</strong> Usa la <strong>regla del 4%</strong>: Multiplica la pensión mensual deseada x 12 meses x 25 años.
                Para 1.100 €/mes → necesitas ~330.000 € de capital.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>🎯 Define tu perfil de riesgo</h3>
              <p>
                Tu capacidad para asumir riesgo depende de tu <strong>horizonte temporal</strong> y <strong>tolerancia emocional</strong>:
              </p>
              <ul>
                <li><strong>Conservador (3% anual):</strong> -10 años para jubilarte o pánico ante caídas del 10%</li>
                <li><strong>Moderado (5% anual):</strong> 10-25 años restantes, toleras fluctuaciones del 20%</li>
                <li><strong>Agresivo (7% anual):</strong> +25 años restantes, aguantas caídas del 40% sin vender</li>
              </ul>
              <div className={styles.stepWarning}>
                ⚠️ <strong>Regla de oro:</strong> A medida que te acercas a la jubilación, REDUCE tu riesgo progresivamente
                (ej: cada 5 años, mueve un 10% de renta variable a renta fija).
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>💰 Abre tus productos de ahorro</h3>
              <p>
                Combina productos para optimizar fiscalidad y flexibilidad:
              </p>
              <ul>
                <li><strong>Plan de pensiones individual:</strong> Abre uno de bajo coste (TER &lt;0,5%).
                  Recomendados: MyInvestor, Indexa Capital, Finizens</li>
                <li><strong>ETFs indexados:</strong> Abre cuenta en broker (DeGiro, Interactive Brokers, Renta 4).
                  Compra ETFs mundiales como VWCE o IWDA</li>
                <li><strong>Plan empresa (si tu empresa lo ofrece):</strong> SIEMPRE aprovéchalo si aporta matching (es dinero gratis)</li>
              </ul>
              <div className={styles.stepTip}>
                💡 <strong>Tip:</strong> Estrategia óptima: Plan de pensiones hasta el máximo deducible (1.500 €/año)
                + resto en ETFs para mantener flexibilidad.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>🔄 Automatiza las aportaciones</h3>
              <p>
                La clave del éxito es la <strong>consistencia</strong>, no el timing perfecto:
              </p>
              <ul>
                <li>Configura transferencias automáticas el día después de cobrar tu nómina</li>
                <li>Empieza con una cantidad sostenible (10-15% de tu sueldo neto)</li>
                <li>Aumenta las aportaciones un 1-2% cada año (o cuando recibas subidas)</li>
                <li><strong>Dollar Cost Averaging:</strong> Aportaciones regulares reducen el riesgo de comprar todo en máximos</li>
              </ul>
              <div className={styles.stepExample}>
                <strong>Ejemplo:</strong> Salario neto 2.500 €/mes → Aportación 300-375 €/mes (12-15%)
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>📈 Revisa y rebalancea anualmente</h3>
              <p>
                Una vez al año (ej: tu cumpleaños), dedica 1 hora a revisar:
              </p>
              <ul>
                <li><strong>Rentabilidad real:</strong> ¿Tus fondos están rindiendo según lo esperado? Compara con benchmarks</li>
                <li><strong>Rebalanceo:</strong> Si renta variable subió mucho, vende parte y compra renta fija para mantener tu ratio objetivo</li>
                <li><strong>Comisiones:</strong> ¿Puedes cambiar a productos más baratos? (Traspaso sin penalización)</li>
                <li><strong>Vida personal:</strong> ¿Cambios en ingresos/gastos requieren ajustar aportaciones?</li>
              </ul>
              <div className={styles.stepWarning}>
                ⚠️ <strong>Evita timing del mercado:</strong> NO intentes "comprar en mínimos y vender en máximos".
                Mantén el plan, invierte regularmente y deja que el interés compuesto haga su magia.
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>🎯 Planifica el rescate (últimos 5 años)</h3>
              <p>
                Cuando te falten 5 años para jubilarte, prepara la transición:
              </p>
              <ul>
                <li><strong>Desriesga progresivamente:</strong> Mueve un 20% anual de renta variable a renta fija</li>
                <li><strong>Simula tu pensión:</strong> Usa la web de la Seguridad Social para conocer tu pensión pública exacta</li>
                <li><strong>Planifica fiscalidad del rescate:</strong> ¿Renta vitalicia? ¿Temporal? ¿Mixto? Consulta con asesor fiscal</li>
                <li><strong>Considera jubilación parcial:</strong> Trabajar 50% durante 2-3 años puede suavizar la transición</li>
              </ul>
              <div className={styles.stepTip}>
                💡 <strong>Tip:</strong> Si rescatas en capital (todo de golpe), hazlo en enero para tener todo el año y gestionar
                la fiscalidad (puedes compensar con deducciones).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mejores Prácticas */}
      <section className={styles.tipsSection}>
        <h2>✨ Mejores Prácticas para Ahorrar para la Jubilación</h2>
        <p className={styles.sectionIntro}>
          Consejos esenciales para maximizar tu ahorro y evitar errores comunes:
        </p>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎯</div>
            <h3>Empieza cuanto antes</h3>
            <p>
              El <strong>interés compuesto</strong> es tu mejor aliado. Empezar 10 años antes puede <strong>duplicar</strong>
              tu capital final sin aumentar el esfuerzo de ahorro.
            </p>
            <p>
              <strong>Ejemplo:</strong> Ahorrar 300 €/mes desde los 25 años (40 años) al 5% → 457.000 €.
              Empezar a los 35 años (30 años) → 250.000 € (casi la mitad).
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🌍</div>
            <h3>Diversifica geográfica y sectorialmente</h3>
            <p>
              No concentres todo en España ni en un solo sector. Los ETFs mundiales como <strong>VWCE</strong> (Vanguard All-World)
              o <strong>IWDA</strong> (iShares World) invierten en 3.000+ empresas de 50 países.
            </p>
            <p>
              <strong>Ventaja:</strong> Si una región o sector cae, otros compensan. Histórico: mercado global 7-8% anual vs. España 3-4%.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💸</div>
            <h3>Minimiza comisiones (TER)</h3>
            <p>
              Una diferencia del <strong>1% anual en costes</strong> puede costarte decenas de miles de euros a largo plazo.
            </p>
            <p>
              <strong>Ejemplo:</strong> 300 €/mes durante 30 años al 5% - 1% TER = 200.000 €. Con 0,2% TER = 245.000 €
              (<strong>45.000 € de diferencia</strong> solo por comisiones).
            </p>
            <p>
              <strong>Busca:</strong> Planes de pensiones con TER &lt; 0,5%. ETFs con TER &lt; 0,25%.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📉</div>
            <h3>No entres en pánico en crisis</h3>
            <p>
              Las caídas del mercado son <strong>oportunidades de compra</strong>, no momentos de venta.
              Históricamente, el mercado siempre se ha recuperado.
            </p>
            <p>
              <strong>Datos reales:</strong> Crisis 2008 → -50% bolsa. Recuperación total en 4 años. Quien vendió en pánico
              perdió; quien siguió comprando se hizo rico.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>♀️</div>
            <h3>Considera la brecha de género</h3>
            <p>
              Las mujeres cobran pensiones <strong>37% inferiores</strong> de media por: salarios más bajos, jornadas parciales
              (cuidado hijos/mayores) y esperanza de vida más larga.
            </p>
            <p>
              <strong>Solución:</strong> Las mujeres deben ahorrar un <strong>20-30% más</strong> que los hombres para
              compensar esta brecha. No es justo, pero es la realidad actual.
            </p>
          </div>

          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💰</div>
            <h3>Ajusta por inflación real</h3>
            <p>
              Una rentabilidad del 5% anual <strong>NO es real</strong> si la inflación es del 3%. Tu ganancia real es solo el 2%.
            </p>
            <p>
              <strong>Proyecciones realistas:</strong> Usa rentabilidad nominal - inflación esperada (2-3% histórico).
              5% nominal → ~2,5-3% real. Siempre piensa en poder adquisitivo, no en cifras nominales.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Warning Box - Errores Comunes */}
      <section className={styles.warningSection}>
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h2>Errores Comunes en Planificación de Jubilación</h2>
          </div>
          <div className={styles.warningContent}>
            <p className={styles.warningIntro}>
              Estos son los <strong>8 errores más frecuentes</strong> que sabotean tu jubilación (y cómo evitarlos):
            </p>

            <div className={styles.warningList}>
              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>1</span>
                  <strong>Empezar demasiado tarde</strong>
                </div>
                <p>
                  El error más costoso. Muchos piensan "empezaré a ahorrar a los 40" sin entender el poder del interés compuesto.
                </p>
                <p className={styles.warningExample}>
                  <strong>Impacto real:</strong> Empezar a los 25 (300 €/mes, 40 años, 5%) = 457.000 €.
                  Empezar a los 40 (300 €/mes, 25 años, 5%) = 178.000 € (<strong>279.000 € de diferencia</strong>).
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Empieza HOY, aunque sean 50 €/mes. Aumenta cuando puedas. Cada año que esperas te cuesta decenas de miles.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>2</span>
                  <strong>Confiar solo en la pensión pública</strong>
                </div>
                <p>
                  La Seguridad Social española tiene un déficit estructural. Las proyecciones indican que las pensiones
                  perderán un 20-30% de poder adquisitivo para 2050.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> La pensión pública será un <strong>suplemento</strong>, no tu única fuente.
                  Calcula que necesitarás complementar con ~40-60% de ahorro privado.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>3</span>
                  <strong>Elegir productos con comisiones altas</strong>
                </div>
                <p>
                  Muchos planes de pensiones de bancos tradicionales tienen TERs del 1,5-2,5%. A 30 años, esto puede
                  <strong>reducir tu capital final en un 40%</strong>.
                </p>
                <p className={styles.warningExample}>
                  <strong>Ejemplo:</strong> 300 €/mes, 30 años, 5% bruto. Con TER 2% → 201.000 €. Con TER 0,3% → 240.000 €
                  (39.000 € perdidos en comisiones).
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Busca planes con TER &lt; 0,5% (MyInvestor, Indexa Capital, Finizens).
                  Puedes traspasar sin penalización.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>4</span>
                  <strong>No ajustar el riesgo con la edad</strong>
                </div>
                <p>
                  Mantener 100% renta variable a los 60 años es arriesgado (una caída del 40% justo antes de jubilarte puede ser devastadora).
                  Pero mantener 100% renta fija a los 30 es demasiado conservador (pierdes potencial de crecimiento).
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Regla del <strong>100 - edad</strong> = % en renta variable.
                  Ejemplo: A los 35 años → 65% renta variable, 35% renta fija. A los 60 → 40% variable, 60% fija.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>5</span>
                  <strong>Vender en pánico durante crisis</strong>
                </div>
                <p>
                  Las crisis son parte del ciclo. Vender cuando el mercado cae un 30-40% <strong>materializa las pérdidas</strong>
                  y te hace perder la recuperación posterior.
                </p>
                <p className={styles.warningExample}>
                  <strong>Caso real:</strong> Crisis 2008. Quien vendió en el mínimo (-50%) necesitó el doble de tiempo para
                  recuperarse. Quien siguió comprando multiplicó su capital x3 en la década siguiente.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Mantén el plan. Sigue aportando (compras más barato en crisis).
                  No mires tu cartera cada día. Piensa en décadas, no en meses.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>6</span>
                  <strong>Ignorar la inflación en las proyecciones</strong>
                </div>
                <p>
                  Proyectar "tendré 500.000 €" sin ajustar por inflación es engañoso. En 30 años con inflación del 2,5% anual,
                  500.000 € tendrán el poder adquisitivo de <strong>240.000 € actuales</strong>.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Siempre calcula en <strong>términos reales</strong> (rentabilidad - inflación).
                  5% nominal - 2,5% inflación = 2,5% real. Usa cifras reales para proyectar poder adquisitivo.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>7</span>
                  <strong>Rescatar el plan de pensiones de golpe</strong>
                </div>
                <p>
                  Rescatar todo el capital acumulado en un solo año te hace <strong>saltar de tramo de IRPF</strong>,
                  pagando hasta el 47% de impuestos sobre la parte que supere 300.000 €.
                </p>
                <p className={styles.warningExample}>
                  <strong>Ejemplo:</strong> Plan con 200.000 €. Rescate de golpe → tributas al 37-40% promedio = 74.000-80.000 € impuestos.
                  Rescate gradual en 5 años → tributas al 25-30% promedio = 50.000-60.000 € (<strong>ahorro de 20.000 €</strong>).
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Planifica rescate en <strong>renta temporal</strong> (5-10 años) o <strong>renta vitalicia</strong>
                  para distribuir la carga fiscal.
                </p>
              </div>

              <div className={styles.warningItem}>
                <div className={styles.warningItemHeader}>
                  <span className={styles.warningNumber}>8</span>
                  <strong>Subestimar los años de jubilación</strong>
                </div>
                <p>
                  Mucha gente planifica para 15 años de jubilación cuando la esperanza de vida a los 65 años es de <strong>20-25 años</strong>
                  (más para mujeres). Quedarte sin dinero a los 80 años es un riesgo real.
                </p>
                <p className={styles.warningSolution}>
                  ✅ <strong>Solución:</strong> Planifica para <strong>25-30 años de jubilación</strong> (hasta los 90-95 años).
                  Mejor sobrar que faltar. Considera renta vitalicia para cubrir el riesgo de longevidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FIN SECCIONES PROFESIONALES ==================== */}

      <RelatedApps apps={getRelatedApps('calculadora-jubilacion')} />

      <Footer appName="calculadora-jubilacion" />
    </div>
  );
}
