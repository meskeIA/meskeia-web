'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraIMC.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
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
        title="¿Quieres aprender más sobre el IMC?"
        subtitle="Descubre qué significa tu resultado, sus limitaciones y cómo mejorar tu salud"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 ¿Qué es el IMC?</h4>
              <p>
                El Índice de Masa Corporal es una medida que relaciona el peso con la altura.
                Fue desarrollado por Adolphe Quetelet en el siglo XIX y es utilizado por la OMS
                como indicador de referencia para clasificar el peso corporal.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>⚖️ Limitaciones del IMC</h4>
              <p>
                El IMC no distingue entre masa muscular y grasa corporal. Un deportista con
                mucha masa muscular puede tener un IMC alto sin tener exceso de grasa.
                Tampoco considera la distribución de grasa (más peligrosa en el abdomen).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>📏 Alternativas al IMC</h4>
              <p>
                Otros indicadores complementarios: perímetro de cintura (riesgo cardiovascular),
                índice cintura-cadera, porcentaje de grasa corporal (bioimpedancia o pliegues
                cutáneos), y el índice de masa grasa.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🎯 IMC según edad</h4>
              <p>
                En niños y adolescentes se usan percentiles específicos por edad y sexo.
                En adultos mayores (+65 años), un IMC ligeramente superior (25-27) puede
                ser protector. Los rangos estándar aplican principalmente a adultos 18-65 años.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Por qué mi IMC dice sobrepeso si estoy musculado?</summary>
              <p>
                El IMC no diferencia entre masa muscular y grasa. El músculo pesa más que la
                grasa por volumen, por lo que deportistas con mucha masa muscular pueden tener
                un IMC elevado sin tener exceso de grasa corporal. En estos casos, es mejor
                medir el porcentaje de grasa corporal.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Es el mismo IMC ideal para hombres y mujeres?</summary>
              <p>
                Los rangos de la OMS son iguales para ambos sexos, pero fisiológicamente las
                mujeres tienen mayor porcentaje de grasa corporal de forma natural. Algunos
                expertos sugieren que mujeres pueden estar saludables con un IMC ligeramente
                mayor, mientras que hombres con un IMC en el límite superior del rango normal
                podrían tener exceso de grasa.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cómo puedo mejorar mi IMC de forma saludable?</summary>
              <p>
                Para perder peso: déficit calórico moderado (300-500 kcal/día), aumentar
                actividad física, priorizar proteínas y vegetales. Para ganar peso: superávit
                calórico con alimentos nutritivos y ejercicio de fuerza. En ambos casos,
                cambios graduales y sostenibles son más efectivos que dietas extremas.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cada cuánto debo calcular mi IMC?</summary>
              <p>
                Para seguimiento general, una vez al mes es suficiente. Si estás en un programa
                de pérdida o ganancia de peso, puedes pesarte semanalmente (siempre a la misma
                hora, idealmente por la mañana en ayunas). Evita pesarte diariamente, ya que las
                fluctuaciones normales pueden ser desmotivantes.
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

      <Footer appName="calculadora-imc" />
    </div>
  );
}
