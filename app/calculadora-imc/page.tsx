'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraIMC.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps, getRelatedAppsTitle } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

type ModoApp = 'calculadora' | 'comparador';

type Clasificacion = {
  texto: string;
  color: string;
  descripcion: string;
  icono: string;
};

const clasificaciones: Record<string, Clasificacion> = {
  bajo: {
    texto: 'Bajo peso',
    color: '#3498db',
    descripcion: 'IMC inferior a 18,5. Puede indicar desnutrición o problemas de salud.',
    icono: '⚠️',
  },
  normal: {
    texto: 'Peso normal',
    color: '#27ae60',
    descripcion: 'IMC entre 18,5 y 24,9. Peso saludable según la OMS.',
    icono: '✅',
  },
  sobrepeso: {
    texto: 'Sobrepeso',
    color: '#f39c12',
    descripcion: 'IMC entre 25 y 29,9. Riesgo aumentado de enfermedades.',
    icono: '⚡',
  },
  obesidad1: {
    texto: 'Obesidad grado I',
    color: '#e67e22',
    descripcion: 'IMC entre 30 y 34,9. Se recomienda consultar con un profesional.',
    icono: '🔶',
  },
  obesidad2: {
    texto: 'Obesidad grado II',
    color: '#e74c3c',
    descripcion: 'IMC entre 35 y 39,9. Riesgo alto de complicaciones de salud.',
    icono: '🔴',
  },
  obesidad3: {
    texto: 'Obesidad grado III',
    color: '#c0392b',
    descripcion: 'IMC igual o superior a 40. Requiere atención médica especializada.',
    icono: '🚨',
  },
};

function obtenerClasificacion(imc: number): Clasificacion {
  if (imc < 18.5) return clasificaciones.bajo;
  if (imc < 25) return clasificaciones.normal;
  if (imc < 30) return clasificaciones.sobrepeso;
  if (imc < 35) return clasificaciones.obesidad1;
  if (imc < 40) return clasificaciones.obesidad2;
  return clasificaciones.obesidad3;
}

function calcularPesoIdeal(alturaCm: number): { min: number; max: number } {
  const alturaM = alturaCm / 100;
  return {
    min: 18.5 * alturaM * alturaM,
    max: 24.9 * alturaM * alturaM,
  };
}

type DatoPerfil = {
  nombre: string;
  peso: number;
  imc: number;
  clasificacion: Clasificacion;
  pesoIdeal: { min: number; max: number };
  diferencia: number;
  esSaludable: boolean;
};

export default function CalculadoraIMCPage() {
  // Estados modo calculadora
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState<{
    imc: number;
    clasificacion: Clasificacion;
    pesoIdeal: { min: number; max: number };
    diferencia: number;
  } | null>(null);

  // Estados modo comparador
  const [modo, setModo] = useState<ModoApp>('calculadora');
  const [alturaComparador, setAlturaComparador] = useState('175');
  const [peso1, setPeso1] = useState('60');
  const [peso2, setPeso2] = useState('75');
  const [peso3, setPeso3] = useState('90');

  // Refs para Chart.js
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);
    const alturaNum = parseSpanishNumber(altura);

    if (pesoNum <= 0 || alturaNum <= 0) {
      return;
    }

    const alturaM = alturaNum / 100;
    const imc = pesoNum / (alturaM * alturaM);
    const clasificacion = obtenerClasificacion(imc);
    const pesoIdeal = calcularPesoIdeal(alturaNum);

    // Diferencia respecto al peso ideal más cercano
    let diferencia = 0;
    if (pesoNum < pesoIdeal.min) {
      diferencia = pesoNum - pesoIdeal.min;
    } else if (pesoNum > pesoIdeal.max) {
      diferencia = pesoNum - pesoIdeal.max;
    }

    setResultado({ imc, clasificacion, pesoIdeal, diferencia });
  };

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setResultado(null);
  };

  // Cálculo de datos para comparador
  const datosComparador = useMemo(() => {
    const alturaNum = parseSpanishNumber(alturaComparador);
    const pesos = [
      { nombre: 'Perfil 1', valor: parseSpanishNumber(peso1) },
      { nombre: 'Perfil 2', valor: parseSpanishNumber(peso2) },
      { nombre: 'Perfil 3', valor: parseSpanishNumber(peso3) },
    ];

    if (alturaNum <= 0) return null;

    const perfiles: DatoPerfil[] = pesos.map(({ nombre, valor }) => {
      if (valor <= 0) {
        return null;
      }
      const alturaM = alturaNum / 100;
      const imc = valor / (alturaM * alturaM);
      const clasificacion = obtenerClasificacion(imc);
      const pesoIdeal = calcularPesoIdeal(alturaNum);

      let diferencia = 0;
      if (valor < pesoIdeal.min) {
        diferencia = valor - pesoIdeal.min;
      } else if (valor > pesoIdeal.max) {
        diferencia = valor - pesoIdeal.max;
      }

      return {
        nombre,
        peso: valor,
        imc,
        clasificacion,
        pesoIdeal,
        diferencia,
        esSaludable: imc >= 18.5 && imc < 25,
      };
    }).filter((p): p is DatoPerfil => p !== null);

    if (perfiles.length === 0) return null;

    return {
      perfiles,
      pesoIdealRango: calcularPesoIdeal(alturaNum),
    };
  }, [alturaComparador, peso1, peso2, peso3]);

  // Effect para Chart.js
  useEffect(() => {
    if (modo !== 'comparador' || !datosComparador || !chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const { perfiles } = datosComparador;

    // Plugin para dibujar zonas de fondo por clasificación IMC
    const zonasPlugin = {
      id: 'zonasIMC',
      beforeDraw: (chart: Chart) => {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.x) return;

        const { left, right, top, bottom } = chartArea;
        const xScale = scales.x;

        // Zonas IMC
        const zonas = [
          { min: 0, max: 18.5, color: 'rgba(52, 152, 219, 0.15)' },    // Bajo peso
          { min: 18.5, max: 25, color: 'rgba(39, 174, 96, 0.15)' },    // Normal
          { min: 25, max: 30, color: 'rgba(243, 156, 18, 0.15)' },     // Sobrepeso
          { min: 30, max: 35, color: 'rgba(230, 126, 34, 0.15)' },     // Obesidad I
          { min: 35, max: 40, color: 'rgba(231, 76, 60, 0.15)' },      // Obesidad II
          { min: 40, max: 50, color: 'rgba(192, 57, 43, 0.15)' },      // Obesidad III
        ];

        zonas.forEach(zona => {
          const xStart = Math.max(xScale.getPixelForValue(zona.min), left);
          const xEnd = Math.min(xScale.getPixelForValue(zona.max), right);
          if (xStart < xEnd) {
            ctx.fillStyle = zona.color;
            ctx.fillRect(xStart, top, xEnd - xStart, bottom - top);
          }
        });
      }
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: perfiles.map(p => `${p.nombre} (${formatNumber(p.peso, 0)} kg)`),
        datasets: [{
          label: 'IMC',
          data: perfiles.map(p => p.imc),
          backgroundColor: perfiles.map(p => p.clasificacion.color),
          borderColor: perfiles.map(p => p.clasificacion.color),
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const perfil = perfiles[context.dataIndex];
                return [
                  `IMC: ${formatNumber(perfil.imc, 1)}`,
                  `Clasificación: ${perfil.clasificacion.texto}`,
                ];
              }
            }
          }
        },
        scales: {
          x: {
            min: 10,
            max: 45,
            title: {
              display: true,
              text: 'Índice de Masa Corporal (IMC)',
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
            }
          },
          y: {
            grid: {
              display: false,
            }
          }
        }
      },
      plugins: [zonasPlugin]
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
        <h1 className={styles.title}>⚖️ Calculadora de IMC</h1>
        <p className={styles.subtitle}>
          Calcula tu Índice de Masa Corporal y conoce tu clasificación según la OMS
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Selector de modo */}
      <div className={styles.modoSelector}>
        <button
          type="button"
          className={`${styles.modoBtn} ${modo === 'calculadora' ? styles.modoActivo : ''}`}
          onClick={() => setModo('calculadora')}
        >
          <span className={styles.modoIcon}>⚖️</span>
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

      {modo === 'calculadora' && (
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus datos</h2>

          <NumberInput
            value={peso}
            onChange={setPeso}
            label="Peso"
            placeholder="70"
            helperText="Tu peso en kilogramos"
            min={1}
            max={500}
          />

          <NumberInput
            value={altura}
            onChange={setAltura}
            label="Altura"
            placeholder="175"
            helperText="Tu altura en centímetros"
            min={50}
            max={250}
          />

          <div className={styles.buttonGroup}>
            <button type="button" onClick={calcular} className={styles.btnPrimary}>
              Calcular IMC
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          <div className={styles.formula}>
            <h3>📐 Fórmula del IMC</h3>
            <p className={styles.formulaText}>
              IMC = Peso (kg) ÷ Altura² (m)
            </p>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div
                className={styles.imcDisplay}
                style={{ borderColor: resultado.clasificacion.color }}
              >
                <span className={styles.imcLabel}>Tu IMC</span>
                <span
                  className={styles.imcValue}
                  style={{ color: resultado.clasificacion.color }}
                >
                  {formatNumber(resultado.imc, 1)}
                </span>
                <span
                  className={styles.imcClasificacion}
                  style={{ backgroundColor: resultado.clasificacion.color }}
                >
                  {resultado.clasificacion.icono} {resultado.clasificacion.texto}
                </span>
              </div>

              <p className={styles.descripcion}>
                {resultado.clasificacion.descripcion}
              </p>

              <div className={styles.resultCards}>
                <ResultCard
                  title="Peso ideal"
                  value={`${formatNumber(resultado.pesoIdeal.min, 1)} - ${formatNumber(resultado.pesoIdeal.max, 1)}`}
                  unit="kg"
                  variant="info"
                  icon="🎯"
                  description="Rango de peso saludable para tu altura"
                />

                {resultado.diferencia !== 0 && (
                  <ResultCard
                    title={resultado.diferencia > 0 ? 'Exceso de peso' : 'Peso a ganar'}
                    value={formatNumber(Math.abs(resultado.diferencia), 1)}
                    unit="kg"
                    variant={resultado.diferencia > 0 ? 'warning' : 'info'}
                    icon={resultado.diferencia > 0 ? '📉' : '📈'}
                    description={
                      resultado.diferencia > 0
                        ? 'Kilos por encima del peso ideal máximo'
                        : 'Kilos por debajo del peso ideal mínimo'
                    }
                  />
                )}
              </div>

              <div className={styles.tablaIMC}>
                <h3>📊 Clasificación OMS</h3>
                <table>
                  <thead>
                    <tr>
                      <th>IMC</th>
                      <th>Clasificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={resultado.imc < 18.5 ? styles.activo : ''}>
                      <td>&lt; 18,5</td>
                      <td>Bajo peso</td>
                    </tr>
                    <tr className={resultado.imc >= 18.5 && resultado.imc < 25 ? styles.activo : ''}>
                      <td>18,5 - 24,9</td>
                      <td>Peso normal</td>
                    </tr>
                    <tr className={resultado.imc >= 25 && resultado.imc < 30 ? styles.activo : ''}>
                      <td>25 - 29,9</td>
                      <td>Sobrepeso</td>
                    </tr>
                    <tr className={resultado.imc >= 30 && resultado.imc < 35 ? styles.activo : ''}>
                      <td>30 - 34,9</td>
                      <td>Obesidad grado I</td>
                    </tr>
                    <tr className={resultado.imc >= 35 && resultado.imc < 40 ? styles.activo : ''}>
                      <td>35 - 39,9</td>
                      <td>Obesidad grado II</td>
                    </tr>
                    <tr className={resultado.imc >= 40 ? styles.activo : ''}>
                      <td>≥ 40</td>
                      <td>Obesidad grado III</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⚖️</span>
              <p>Introduce tu peso y altura para calcular tu IMC</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Modo Comparador */}
      {modo === 'comparador' && (
        <div className={styles.comparadorContent}>
          <div className={styles.comparadorIntro}>
            <h2 className={styles.panelTitle}>📊 Comparador de Perfiles</h2>
            <p>Compara cómo variaría tu IMC con diferentes pesos para una misma altura</p>
          </div>

          <div className={styles.comparadorInputs}>
            <div className={styles.alturaInput}>
              <NumberInput
                value={alturaComparador}
                onChange={setAlturaComparador}
                label="Altura (común para los 3 perfiles)"
                placeholder="175"
                helperText="cm"
                min={50}
                max={250}
              />
            </div>

            <div className={styles.pesosInputGrid}>
              <div className={styles.pesoInput}>
                <NumberInput
                  value={peso1}
                  onChange={setPeso1}
                  label="Perfil 1"
                  placeholder="60"
                  helperText="kg"
                  min={1}
                  max={500}
                />
              </div>
              <div className={styles.pesoInput}>
                <NumberInput
                  value={peso2}
                  onChange={setPeso2}
                  label="Perfil 2"
                  placeholder="75"
                  helperText="kg"
                  min={1}
                  max={500}
                />
              </div>
              <div className={styles.pesoInput}>
                <NumberInput
                  value={peso3}
                  onChange={setPeso3}
                  label="Perfil 3"
                  placeholder="90"
                  helperText="kg"
                  min={1}
                  max={500}
                />
              </div>
            </div>
          </div>

          {datosComparador && (
            <>
              {/* Gráfico */}
              <div className={styles.chartSection}>
                <h3>📈 Comparativa Visual de IMC</h3>
                <div className={styles.chartLegend}>
                  <span className={styles.legendItem} data-color="bajo">Bajo peso</span>
                  <span className={styles.legendItem} data-color="normal">Normal</span>
                  <span className={styles.legendItem} data-color="sobrepeso">Sobrepeso</span>
                  <span className={styles.legendItem} data-color="obesidad">Obesidad</span>
                </div>
                <div className={styles.chartContainer}>
                  <canvas ref={chartRef}></canvas>
                </div>
              </div>

              {/* Cards resumen */}
              <div className={styles.resumenCards}>
                {datosComparador.perfiles.map((perfil, idx) => (
                  <div
                    key={idx}
                    className={`${styles.resumenCard} ${perfil.esSaludable ? styles.cardSaludable : ''}`}
                  >
                    {perfil.esSaludable && (
                      <span className={styles.badgeSaludable}>✅ Peso saludable</span>
                    )}
                    <h4>{perfil.nombre}</h4>
                    <div className={styles.resumenPeso}>{formatNumber(perfil.peso, 0)} kg</div>
                    <div
                      className={styles.resumenIMC}
                      style={{ color: perfil.clasificacion.color }}
                    >
                      IMC: {formatNumber(perfil.imc, 1)}
                    </div>
                    <div
                      className={styles.resumenClasificacion}
                      style={{ backgroundColor: perfil.clasificacion.color }}
                    >
                      {perfil.clasificacion.icono} {perfil.clasificacion.texto}
                    </div>
                    {perfil.diferencia !== 0 && (
                      <div className={styles.resumenDiferencia}>
                        {perfil.diferencia > 0
                          ? `+${formatNumber(perfil.diferencia, 1)} kg sobre ideal`
                          : `${formatNumber(perfil.diferencia, 1)} kg bajo ideal`
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info peso ideal */}
              <div className={styles.pesoIdealInfo}>
                <p>
                  🎯 <strong>Peso ideal para {formatNumber(parseSpanishNumber(alturaComparador), 0)} cm:</strong>{' '}
                  {formatNumber(datosComparador.pesoIdealRango.min, 1)} - {formatNumber(datosComparador.pesoIdealRango.max, 1)} kg
                </p>
              </div>

              {/* Tabla comparativa */}
              <div className={styles.tablaComparativa}>
                <h3>📋 Tabla Comparativa</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Perfil</th>
                      <th>Peso</th>
                      <th>IMC</th>
                      <th>Clasificación</th>
                      <th>Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosComparador.perfiles.map((perfil, idx) => (
                      <tr key={idx} className={perfil.esSaludable ? styles.filaSaludable : ''}>
                        <td>{perfil.nombre}</td>
                        <td>{formatNumber(perfil.peso, 0)} kg</td>
                        <td style={{ color: perfil.clasificacion.color, fontWeight: 600 }}>
                          {formatNumber(perfil.imc, 1)}
                        </td>
                        <td>
                          <span
                            className={styles.tagClasificacion}
                            style={{ backgroundColor: perfil.clasificacion.color }}
                          >
                            {perfil.clasificacion.texto}
                          </span>
                        </td>
                        <td>
                          {perfil.diferencia === 0
                            ? '✅ Ideal'
                            : perfil.diferencia > 0
                              ? `+${formatNumber(perfil.diferencia, 1)} kg`
                              : `${formatNumber(perfil.diferencia, 1)} kg`
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!datosComparador && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📊</span>
              <p>Introduce una altura y al menos un peso para ver la comparación</p>
            </div>
          )}
        </div>
      )}


      {/* Disclaimer Médico - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="critical"
        collapsible={false}
        context="calculadora-imc"
      >
        <p>
          El <strong>Índice de Masa Corporal (IMC) es un indicador orientativo</strong> que relaciona peso y altura.
          Tiene limitaciones importantes que debes conocer:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>NO distingue entre masa muscular y grasa</strong>: Deportistas con alta musculatura pueden clasificar como "sobrepeso" siendo saludables</li>
          <li><strong>NO considera la distribución de grasa</strong>: La grasa abdominal (visceral) es más peligrosa que la subcutánea</li>
          <li><strong>NO es aplicable a todos por igual</strong>: No válido para embarazadas, menores de 18 años, mayores de 65 años, ni personas con condiciones médicas específicas</li>
          <li><strong>NO reemplaza evaluación médica</strong>: Tu médico debe considerar analíticas, tensión arterial, historial clínico y otros factores</li>
        </ul>

        <p className={styles.highlight}>
          <strong>⚕️ Esta herramienta NO diagnostica ni trata enfermedades.</strong> Si tienes dudas sobre tu peso,
          composición corporal o salud metabólica, consulta con un médico, endocrinólogo o nutricionista colegiado.
        </p>

        <p className={styles.emergency}>
          🚨 <strong>Si presentas pérdida/ganancia de peso involuntaria, fatiga extrema o síntomas preocupantes,
          acude a tu médico de inmediato.</strong>
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre el IMC?"
        subtitle="Descubre cómo interpretar tu resultado, estrategias para alcanzar un peso saludable y respuestas a las preguntas más frecuentes"
        icon="📚"
      >
        {/* Indicador Visual de Rangos IMC */}
        <section className={styles.guideSection}>
          <h2>📊 Escala Visual de Rangos IMC (OMS)</h2>
          <p className={styles.introParagraph}>
            Comprende dónde te sitúas en la clasificación internacional de índice de masa corporal:
          </p>

          <div className={styles.rangoVisualContainer}>
            <div className={styles.rangoVisualBarra}>
              {/* Segmentos de la barra */}
              <div className={styles.segmentoBarra} data-tipo="bajo">
                <span className={styles.segmentoLabel}>&lt;18.5</span>
                <span className={styles.segmentoNombre}>Bajo peso</span>
              </div>
              <div className={styles.segmentoBarra} data-tipo="normal">
                <span className={styles.segmentoLabel}>18.5-24.9</span>
                <span className={styles.segmentoNombre}>Normal</span>
              </div>
              <div className={styles.segmentoBarra} data-tipo="sobrepeso">
                <span className={styles.segmentoLabel}>25-29.9</span>
                <span className={styles.segmentoNombre}>Sobrepeso</span>
              </div>
              <div className={styles.segmentoBarra} data-tipo="obesidad1">
                <span className={styles.segmentoLabel}>30-34.9</span>
                <span className={styles.segmentoNombre}>Obesidad I</span>
              </div>
              <div className={styles.segmentoBarra} data-tipo="obesidad2">
                <span className={styles.segmentoLabel}>35-39.9</span>
                <span className={styles.segmentoNombre}>Obesidad II</span>
              </div>
              <div className={styles.segmentoBarra} data-tipo="obesidad3">
                <span className={styles.segmentoLabel}>≥40</span>
                <span className={styles.segmentoNombre}>Obesidad III</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabla WHO Expandida */}
        <section className={styles.guideSection}>
          <h2>🏥 Clasificación Detallada OMS</h2>
          <p className={styles.introParagraph}>
            Tabla completa con contexto médico, riesgos asociados y recomendaciones por rango:
          </p>

          <div className={styles.tablaWHOExpandida}>
            <div className={styles.rangoRow} data-tipo="bajo">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>⚠️</span>
                  <h4>Bajo Peso (IMC &lt; 18.5)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Peso insuficiente para la altura. Puede indicar desnutrición, pérdida de masa muscular o condiciones médicas subyacentes.</p>
                  <p><strong>Riesgos asociados:</strong> Debilidad del sistema inmune, osteoporosis, anemia, fatiga crónica, problemas de fertilidad.</p>
                  <p><strong>Recomendación:</strong> Consulta con nutricionista para plan de aumento de peso saludable. Evalúa causas subyacentes con médico.</p>
                </div>
              </div>
            </div>

            <div className={styles.rangoRow} data-tipo="normal">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>✅</span>
                  <h4>Peso Normal (IMC 18.5 - 24.9)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Rango considerado saludable para la mayoría de adultos. Asociado con menor riesgo de enfermedades crónicas.</p>
                  <p><strong>Beneficios:</strong> Menor riesgo cardiovascular, diabetes tipo 2, hipertensión. Mejor calidad de vida y movilidad.</p>
                  <p><strong>Recomendación:</strong> Mantén estilo de vida activo, alimentación equilibrada y controles médicos regulares.</p>
                </div>
              </div>
            </div>

            <div className={styles.rangoRow} data-tipo="sobrepeso">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>⚡</span>
                  <h4>Sobrepeso (IMC 25 - 29.9)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Peso superior al recomendado. Incrementa riesgo de enfermedades crónicas moderadamente.</p>
                  <p><strong>Riesgos asociados:</strong> Mayor probabilidad de hipertensión, colesterol elevado, prediabetes, apnea del sueño.</p>
                  <p><strong>Recomendación:</strong> Reducción gradual de peso (5-10% inicial), actividad física regular, revisión de hábitos alimenticios.</p>
                </div>
              </div>
            </div>

            <div className={styles.rangoRow} data-tipo="obesidad1">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>🔶</span>
                  <h4>Obesidad Grado I (IMC 30 - 34.9)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Obesidad leve. Riesgo significativamente elevado de complicaciones metabólicas y cardiovasculares.</p>
                  <p><strong>Riesgos asociados:</strong> Diabetes tipo 2, enfermedades cardíacas, artritis, problemas hepáticos (hígado graso).</p>
                  <p><strong>Recomendación:</strong> Intervención médica/nutricional. Plan estructurado de pérdida de peso con seguimiento profesional.</p>
                </div>
              </div>
            </div>

            <div className={styles.rangoRow} data-tipo="obesidad2">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>🔴</span>
                  <h4>Obesidad Grado II (IMC 35 - 39.9)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Obesidad moderada a severa. Alto riesgo de enfermedades graves y reducción de esperanza de vida.</p>
                  <p><strong>Riesgos asociados:</strong> Insuficiencia cardíaca, accidente cerebrovascular, cáncer (colon, mama), problemas respiratorios severos.</p>
                  <p><strong>Recomendación:</strong> Tratamiento médico intensivo. Considerar intervenciones avanzadas (cirugía bariátrica) bajo supervisión.</p>
                </div>
              </div>
            </div>

            <div className={styles.rangoRow} data-tipo="obesidad3">
              <div className={styles.rangoInfo}>
                <div className={styles.rangoHeader}>
                  <span className={styles.rangoIcono}>🚨</span>
                  <h4>Obesidad Grado III (IMC ≥ 40)</h4>
                </div>
                <div className={styles.rangoDetalle}>
                  <p><strong>Contexto:</strong> Obesidad mórbida. Riesgo extremo de mortalidad prematura y complicaciones graves de salud.</p>
                  <p><strong>Riesgos asociados:</strong> Alto riesgo de muerte súbita, insuficiencia multiorgánica, complicaciones quirúrgicas, discapacidad física.</p>
                  <p><strong>Recomendación:</strong> Atención médica urgente y especializada. Programa integral multidisciplinar (endocrino, nutrición, psicología).</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>🎯 Guía: Cómo Mejorar tu IMC de Forma Saludable</h2>
          <p className={styles.introParagraph}>
            6 pasos fundamentales para alcanzar y mantener un peso saludable sin sacrificar tu bienestar:
          </p>

          <div className={styles.stepsGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Establece Objetivos Realistas</h4>
                <p>
                  <strong>Meta inicial:</strong> Perder 5-10% de tu peso actual en 3-6 meses (ej: 5 kg si pesas 100 kg).
                  Los cambios graduales son más sostenibles y seguros. Evita dietas extremas que prometen resultados rápidos.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Déficit Calórico Moderado</h4>
                <p>
                  <strong>Reducción recomendada:</strong> 300-500 calorías diarias por debajo de tu gasto.
                  No bajes de 1.200 kcal/día (mujeres) o 1.500 kcal/día (hombres) sin supervisión médica.
                  Usa nuestra <a href="/calculadora-calorias/" target="_blank">Calculadora de Calorías</a> para estimar tu gasto.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Alimentación Equilibrada</h4>
                <p>
                  <strong>Prioriza:</strong> Verduras (50% del plato), proteínas magras (25%), carbohidratos complejos (25%).
                  Limita azúcares añadidos, ultraprocesados y grasas saturadas. Come cada 3-4 horas para mantener metabolismo activo.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Ejercicio Regular Combinado</h4>
                <p>
                  <strong>Cardio:</strong> 150 min/semana de actividad moderada (caminar rápido, bici, natación).
                  <strong>Fuerza:</strong> 2-3 sesiones/semana de pesas o ejercicios corporales para preservar masa muscular.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Hábitos de Sueño y Estrés</h4>
                <p>
                  <strong>Duerme 7-9 horas:</strong> La privación de sueño aumenta hormonas del hambre (grelina).
                  <strong>Maneja el estrés:</strong> El cortisol elevado favorece acumulación de grasa abdominal. Practica mindfulness o yoga.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Seguimiento y Ajustes</h4>
                <p>
                  <strong>Monitorea semanalmente:</strong> Peso, medidas corporales, cómo te sientes física y emocionalmente.
                  Ajusta plan si no ves progreso en 3-4 semanas. Celebra pequeños logros para mantener motivación.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Grid de Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>💡 Mejores Prácticas para Gestión de Peso</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🥗 Nutrición Inteligente</h4>
              <p>
                Cocina en casa para controlar ingredientes. Lee etiquetas nutricionales.
                Usa plato pequeño (engaño visual). Mastica despacio (20-30 minutos por comida).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>💧 Hidratación Correcta</h4>
              <p>
                Bebe 2-3 litros de agua al día. Toma 1 vaso antes de cada comida (aumenta saciedad).
                Evita bebidas azucaradas y alcohol (calorías vacías).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📝 Diario Alimenticio</h4>
              <p>
                Registra lo que comes con apps (MyFitnessPal, Yazio). Aumenta consciencia de patrones.
                Identifica triggers emocionales de ingesta.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🚶 Actividad Diaria</h4>
              <p>
                Acumula 10.000 pasos diarios. Usa escaleras en vez de ascensor.
                Camina después de comidas (mejora digestión y glucemia).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>👥 Apoyo Social</h4>
              <p>
                Comparte objetivos con familia/amigos. Únete a grupos de apoyo.
                Considera ayuda profesional (nutricionista, psicólogo).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>⏰ Constancia &gt; Perfección</h4>
              <p>
                Permite comidas "trampa" 1 vez/semana (20% flexibilidad). No te castigues por errores.
                Enfócate en tendencia a largo plazo, no fluctuaciones diarias.
              </p>
            </div>
          </div>
        </section>

        {/* Caja de Advertencias */}
        <section className={styles.guideSection}>
          <div className={styles.advertenciaBox}>
            <h3>⚠️ Limitaciones del IMC que Debes Conocer</h3>
            <div className={styles.advertenciaContent}>
              <div className={styles.advertenciaItem}>
                <h4>🏋️ No Distingue Músculo vs Grasa</h4>
                <p>
                  Atletas y personas musculosas pueden tener IMC "alto" (25-30) siendo saludables.
                  La masa muscular pesa más que la grasa pero es metabólicamente beneficiosa.
                  <strong>Solución:</strong> Complementa con % grasa corporal (bioimpedancia, plicómetro).
                </p>
              </div>

              <div className={styles.advertenciaItem}>
                <h4>👴 Varía Según Edad</h4>
                <p>
                  En adultos mayores (+65 años), IMC ligeramente superior (25-27) puede ser protector
                  contra pérdida de masa ósea y muscular (sarcopenia).
                  <strong>Recomendación:</strong> Consulta rangos ajustados por edad con tu médico.
                </p>
              </div>

              <div className={styles.advertenciaItem}>
                <h4>🤰 Embarazo y Lactancia</h4>
                <p>
                  El IMC no es válido durante gestación ni primeros 6 meses postparto.
                  Ganancia de peso en embarazo depende de IMC previo (7-18 kg según caso).
                  <strong>Importante:</strong> Sigue indicaciones de tu obstetra/matrona.
                </p>
              </div>

              <div className={styles.advertenciaItem}>
                <h4>🧬 Diferencias Étnicas</h4>
                <p>
                  Poblaciones asiáticas tienen mayor riesgo metabólico con IMC más bajo (sobrepeso ≥23).
                  Personas de origen africano pueden tener más masa muscular y ósea.
                  <strong>Contexto:</strong> Los rangos OMS son orientativos, no absolutos.
                </p>
              </div>

              <div className={styles.advertenciaItem}>
                <h4>📏 No Mide Distribución de Grasa</h4>
                <p>
                  La grasa abdominal (visceral) es más peligrosa que la periférica (caderas/muslos).
                  Personas con IMC "normal" pero cintura ancha pueden tener riesgo cardiovascular.
                  <strong>Medida adicional:</strong> Perímetro de cintura (&lt;94 cm hombres, &lt;80 cm mujeres).
                </p>
              </div>

              <div className={styles.advertenciaItem}>
                <h4>🧒 Niños y Adolescentes</h4>
                <p>
                  En menores de 18 años se usan percentiles ajustados por edad y sexo, no valores absolutos.
                  El crecimiento introduce variabilidad que el IMC adulto no contempla.
                  <strong>Herramienta correcta:</strong> Tablas de crecimiento pediátricas (CDC, OMS).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Expandido */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes (FAQ)</h2>

          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Qué es el IMC y cómo se calcula?</summary>
              <p>
                El Índice de Masa Corporal (IMC) es una medida que relaciona tu peso con tu altura.
                Se calcula dividiendo tu peso en kilogramos entre el cuadrado de tu altura en metros (kg/m²).
              </p>
              <p><strong>Ejemplo práctico:</strong></p>
              <p>
                Si pesas 70 kg y mides 1,75 m:<br/>
                IMC = 70 / (1,75)² = 70 / 3,0625 = 22,86 → Peso Normal ✅
              </p>
              <p>
                Si pesas 85 kg y mides 1,68 m:<br/>
                IMC = 85 / (1,68)² = 85 / 2,8224 = 30,12 → Obesidad I 🔶
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿El IMC es la mejor medida de salud?</summary>
              <p>
                El IMC es una herramienta útil y fácil de calcular, pero tiene limitaciones importantes.
                <strong>No distingue entre masa muscular y grasa corporal</strong>, por lo que puede ser engañoso
                en atletas, personas mayores, embarazadas o con condiciones médicas específicas.
              </p>
              <p><strong>Ejemplo ilustrativo:</strong></p>
              <p>
                Un culturista de 90 kg y 1,80 m tendría IMC = 27,8 (Sobrepeso), pero su % de grasa
                corporal podría ser solo 10% (excelente). Por el contrario, una persona sedentaria
                con IMC 23 (Normal) podría tener 30% de grasa corporal (alto).
              </p>
              <p>
                <strong>Para evaluación completa:</strong> Combina IMC con % grasa corporal, perímetro
                de cintura, análisis de sangre (colesterol, glucosa) y consulta médica.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué rango de IMC se considera saludable?</summary>
              <p>
                Según la OMS, un IMC entre <strong>18,5 y 24,9</strong> se considera peso normal o saludable
                para la mayoría de adultos de 18 a 65 años. Sin embargo, estos valores pueden variar:
              </p>
              <p><strong>Factores de ajuste:</strong></p>
              <ul>
                <li><strong>Edad:</strong> Adultos mayores (+65) pueden beneficiarse de IMC 25-27</li>
                <li><strong>Etnia:</strong> Asiáticos tienen mayor riesgo con IMC ≥23</li>
                <li><strong>Composición corporal:</strong> Deportistas con mucha masa muscular</li>
                <li><strong>Historial familiar:</strong> Genética de obesidad o diabetes</li>
              </ul>
              <p>
                <strong>Recomendación:</strong> Usa el rango OMS como guía inicial, pero considera
                tu contexto individual con ayuda profesional.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cómo puedo mejorar mi IMC de forma saludable?</summary>
              <p>
                Para mejorar tu IMC de forma saludable y sostenible, sigue estos principios clave:
              </p>
              <p><strong>Alimentación (70% del éxito):</strong></p>
              <ul>
                <li>Déficit calórico moderado (300-500 kcal/día por debajo de tu gasto)</li>
                <li>Dieta rica en verduras, frutas, proteínas magras y granos integrales</li>
                <li>Evita ultraprocesados, azúcares añadidos y bebidas calóricas</li>
                <li>Come cada 3-4 horas en porciones controladas</li>
              </ul>
              <p><strong>Ejercicio (30% del éxito):</strong></p>
              <ul>
                <li>150 min/semana de cardio moderado (caminar, nadar, bici)</li>
                <li>2-3 sesiones/semana de entrenamiento de fuerza (preserva músculo)</li>
                <li>Mantén actividad diaria (10.000 pasos, escaleras, movimiento)</li>
              </ul>
              <p>
                <strong>Hábitos de soporte:</strong> Duerme 7-9 horas, bebe 2-3L agua al día,
                maneja estrés, registra progreso. Consulta siempre con profesionales (nutricionista, médico).
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Cuánto tiempo tarda en cambiar mi IMC?</summary>
              <p>
                El tiempo depende de tu objetivo y situación inicial. Como referencia:
              </p>
              <p><strong>Pérdida de peso saludable:</strong></p>
              <ul>
                <li><strong>Ritmo recomendado:</strong> 0,5 - 1 kg/semana (2-4 kg/mes)</li>
                <li><strong>Cambio de 1 punto de IMC:</strong> ~2,5-3,5 kg (varía según altura)</li>
                <li><strong>Ejemplo:</strong> Pasar de IMC 28 a 24 (4 puntos) puede llevar 3-6 meses</li>
              </ul>
              <p><strong>Aumento de peso saludable:</strong></p>
              <ul>
                <li><strong>Ritmo recomendado:</strong> 0,5 kg/semana (enfocado en músculo)</li>
                <li><strong>Requiere:</strong> Superávit calórico +300-500 kcal + entrenamiento de fuerza</li>
              </ul>
              <p>
                <strong>Importante:</strong> Los cambios rápidos (pérdida &gt;1 kg/semana) suelen incluir
                pérdida de masa muscular y agua, no solo grasa. Sé paciente y prioriza salud sobre velocidad.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Qué hago si mi IMC indica obesidad?</summary>
              <p>
                Si tu IMC está en rango de obesidad (≥30), sigue estos pasos:
              </p>
              <p><strong>1. Evaluación médica completa:</strong></p>
              <p>
                Consulta con tu médico de cabecera para descartar condiciones subyacentes (hipotiroidismo,
                síndrome de ovario poliquístico, medicamentos que causan ganancia de peso).
                Solicita análisis de sangre: glucosa, colesterol, función hepática, tiroides.
              </p>
              <p><strong>2. Derivación a especialistas:</strong></p>
              <ul>
                <li><strong>Endocrino:</strong> Evalúa metabolismo y posibles tratamientos farmacológicos</li>
                <li><strong>Nutricionista:</strong> Plan personalizado de alimentación</li>
                <li><strong>Psicólogo:</strong> Aborda relación emocional con comida (ansiedad, compulsión)</li>
              </ul>
              <p><strong>3. Opciones de tratamiento:</strong></p>
              <ul>
                <li><strong>IMC 30-35:</strong> Cambios de estilo de vida supervisados</li>
                <li><strong>IMC 35-40:</strong> Considerar medicación (orlistat, liraglutida)</li>
                <li><strong>IMC ≥40 (o ≥35 con comorbilidades):</strong> Evaluar cirugía bariátrica</li>
              </ul>
              <p>
                <strong>No estás solo:</strong> La obesidad es una enfermedad crónica multifactorial.
                Buscar ayuda profesional no es señal de debilidad, es el primer paso hacia mejorar tu salud.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Debo usar IMC si hago mucho ejercicio?</summary>
              <p>
                Si entrenas regularmente con pesas o practicas deportes de alta intensidad,
                el IMC puede no reflejar tu estado de salud real.
              </p>
              <p><strong>Por qué el IMC falla en atletas:</strong></p>
              <p>
                La masa muscular es más densa que la grasa (1,06 g/cm³ vs 0,9 g/cm³). Un atleta
                con 12% de grasa corporal puede tener IMC 27 (Sobrepeso) siendo muy saludable.
                El IMC clasificaría erróneamente a culturistas, crossfiters, rugbiers como "obesos".
              </p>
              <p><strong>Alternativas recomendadas:</strong></p>
              <ul>
                <li><strong>Porcentaje de grasa corporal:</strong> Bioimpedancia, DEXA, plicometría</li>
                <li><strong>Perímetro de cintura:</strong> &lt;94 cm (hombres), &lt;80 cm (mujeres)</li>
                <li><strong>Ratio cintura/altura:</strong> Debe ser &lt;0,5 (ej: 90 cm cintura / 180 cm altura = 0,5)</li>
                <li><strong>Progreso visual:</strong> Fotos mensuales y cómo te queda la ropa</li>
              </ul>
              <p>
                <strong>Conclusión:</strong> Si entrenas fuerza 3+ veces/semana, usa % grasa corporal
                como métrica principal. El IMC puede servir como dato complementario, pero no definitivo.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>¿Es seguro usar calculadoras de IMC online?</summary>
              <p>
                Sí, las calculadoras de IMC online como esta son <strong>seguras y confiables</strong>
                para obtener una estimación rápida. Funcionan con la fórmula estándar de la OMS
                que ha sido validada en millones de personas.
              </p>
              <p><strong>Ventajas:</strong></p>
              <ul>
                <li>Cálculo instantáneo y preciso basado en estándar internacional</li>
                <li>No requiere datos personales (todo se procesa en tu navegador)</li>
                <li>Acceso 24/7 sin coste ni cita médica</li>
                <li>Incluye contexto educativo y recomendaciones generales</li>
              </ul>
              <p><strong>Limitaciones a considerar:</strong></p>
              <ul>
                <li>No sustituye evaluación médica personalizada</li>
                <li>No detecta condiciones subyacentes (diabetes, hipertensión)</li>
                <li>No ajusta por factores individuales (etnia, edad avanzada, embarazo)</li>
              </ul>
              <p>
                <strong>Recomendación de uso:</strong> Utiliza esta calculadora como herramienta de
                screening inicial. Si tu resultado indica bajo peso, sobrepeso u obesidad, o si tienes
                dudas, consulta con un profesional sanitario para evaluación completa.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-imc')}
        title={getRelatedAppsTitle('calculadora-imc').title}
        icon={getRelatedAppsTitle('calculadora-imc').icon}
      />

      <ShareCard appName="calculadora-imc" />
      <Footer appName="calculadora-imc" />
    </div>
  );
}
