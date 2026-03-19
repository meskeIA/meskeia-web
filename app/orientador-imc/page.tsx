'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './OrientadorIMC.module.css';
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
        <h1 className={styles.title}>⚖️ Orientador IMC</h1>
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
        severity="high"
        collapsible={false}
        context="orientador-imc"
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
        {/* Tabla Comparativa */}
        <section className={styles.eduComparativa}>
          <h2>Tabla de categorías del IMC según la OMS</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>IMC (kg/m²)</th>
                  <th>Descripción</th>
                  <th>Riesgos principales</th>
                  <th>Acción recomendada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Bajo peso severo</strong></td>
                  <td>&lt; 16,0</td>
                  <td>Desnutrición grave</td>
                  <td>Anemia, infertilidad, fragilidad ósea</td>
                  <td>Atención médica urgente</td>
                </tr>
                <tr>
                  <td><strong>Bajo peso moderado</strong></td>
                  <td>16,0 – 16,9</td>
                  <td>Desnutrición moderada</td>
                  <td>Sistema inmune débil, fatiga crónica</td>
                  <td>Consulta médica y dietética</td>
                </tr>
                <tr>
                  <td><strong>Bajo peso leve</strong></td>
                  <td>17,0 – 18,4</td>
                  <td>Algo por debajo del rango</td>
                  <td>Riesgo leve de deficiencias nutricionales</td>
                  <td>Aumentar ingesta calórica sana</td>
                </tr>
                <tr>
                  <td><strong>Peso normal</strong></td>
                  <td>18,5 – 24,9</td>
                  <td>Rango saludable</td>
                  <td>Mínimos</td>
                  <td>Mantener hábitos actuales</td>
                </tr>
                <tr>
                  <td><strong>Sobrepeso</strong></td>
                  <td>25,0 – 29,9</td>
                  <td>Por encima del rango ideal</td>
                  <td>Hipertensión, diabetes tipo 2 incipiente</td>
                  <td>Ajustar dieta y aumentar actividad</td>
                </tr>
                <tr>
                  <td><strong>Obesidad grado I</strong></td>
                  <td>30,0 – 34,9</td>
                  <td>Obesidad moderada</td>
                  <td>Riesgo cardiovascular elevado</td>
                  <td>Plan nutricional y ejercicio supervisado</td>
                </tr>
                <tr>
                  <td><strong>Obesidad grado II</strong></td>
                  <td>35,0 – 39,9</td>
                  <td>Obesidad severa</td>
                  <td>Alto riesgo de comorbilidades</td>
                  <td>Seguimiento médico especializado</td>
                </tr>
                <tr>
                  <td><strong>Obesidad grado III</strong></td>
                  <td>≥ 40,0</td>
                  <td>Obesidad mórbida</td>
                  <td>Riesgo vital, múltiples patologías</td>
                  <td>Intervención médica inmediata</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduEscenarios}>
          <h2>El IMC y sus limitaciones por perfil de persona</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏋️</span>
                <strong>Deportista con mucha masa muscular</strong>
              </div>
              <p className={styles.escenarioExample}>Un culturista puede tener IMC 28 (sobrepeso) pero con 8% de grasa corporal. El músculo pesa más que la grasa. El IMC le clasifica mal.</p>
              <span className={styles.escenarioTip}>IMC no es válido: mide % grasa</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👵</span>
                <strong>Persona mayor de 65 años</strong>
              </div>
              <p className={styles.escenarioExample}>Con la edad se pierde masa muscular (sarcopenia). Un IMC de 24 puede ocultar poca musculatura y exceso de grasa visceral. Los criterios OMS son menos precisos.</p>
              <span className={styles.escenarioTip}>Rango óptimo: 23-27 en mayores</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🤰</span>
                <strong>Mujer embarazada</strong>
              </div>
              <p className={styles.escenarioExample}>Durante el embarazo, el IMC no es aplicable para evaluar peso saludable. El aumento de peso depende del IMC previo al embarazo.</p>
              <span className={styles.escenarioTip}>No aplicable en embarazo</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧒</span>
                <strong>Niños y adolescentes</strong>
              </div>
              <p className={styles.escenarioExample}>Para menores de 18 años se usan percentiles de IMC por edad y sexo, no los rangos estándar. Un IMC de 22 puede ser sobrepeso en un niño de 10 años.</p>
              <span className={styles.escenarioTip}>Usar IMC-por-edad pediátrico</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌍</span>
                <strong>Personas de origen asiático</strong>
              </div>
              <p className={styles.escenarioExample}>La OMS recomienda umbrales más bajos para población asiática: sobrepeso desde IMC 23, obesidad desde IMC 27,5. El riesgo metabólico aparece antes.</p>
              <span className={styles.escenarioTip}>Sobrepeso asiático: IMC 23+</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧬</span>
                <strong>Persona con IMC normal pero grasa visceral alta</strong>
              </div>
              <p className={styles.escenarioExample}>El "obeso delgado": IMC 22 pero alto porcentaje de grasa abdominal. El perímetro de cintura (hombres &gt;102 cm, mujeres &gt;88 cm) es un indicador complementario clave.</p>
              <span className={styles.escenarioTip}>Medir cintura + IMC juntos</span>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre el IMC</h2>
          <div className={styles.faqList}>
            <div className={styles.eduFaqItem}>
              <h4>¿Es el IMC el mejor indicador de salud?</h4>
              <p>No es el único ni el mejor en todos los casos. El IMC es útil como cribado poblacional rápido, pero no mide composición corporal (músculo vs grasa), distribución de grasa ni condición física. Debe interpretarse junto a otros parámetros.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuál es la diferencia entre IMC y porcentaje de grasa corporal?</h4>
              <p>El IMC usa peso y altura, sin distinguir entre músculo, grasa, hueso y agua. El porcentaje de grasa corporal mide exactamente qué proporción es tejido adiposo. Es más preciso pero requiere herramientas específicas (DEXA, bioimpedancia).</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Por qué el IMC de sobrepeso empieza en 25 y no en 30?</h4>
              <p>Los estudios epidemiológicos muestran que los riesgos de enfermedades crónicas (diabetes, hipertensión, enfermedades cardiovasculares) empiezan a aumentar estadísticamente por encima de IMC 25, aunque de forma moderada. A partir de 30 el incremento de riesgo es significativo.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Un IMC de 26 es peligroso?</h4>
              <p>Estar en "sobrepeso" por IMC no significa necesariamente estar en riesgo. Hay que considerar el historial clínico, nivel de actividad física, analíticas, perímetro abdominal y otros factores. Muchas personas con IMC 25-27 tienen excelente salud metabólica.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cómo puedo bajar mi IMC de forma saludable?</h4>
              <p>Combinando déficit calórico moderado (300-500 kcal/día menos de lo que gastas) con ejercicio de fuerza (para preservar músculo) y ejercicio cardiovascular. Evita dietas extremas: bajan el IMC pero también la masa muscular, perjudicando la composición corporal.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿El IMC es diferente para hombres y mujeres?</h4>
              <p>Las categorías estándar de la OMS son iguales para ambos sexos. Sin embargo, las mujeres tienen de forma natural mayor porcentaje de grasa corporal que los hombres con el mismo IMC. Por eso el IMC puede subestimar el riesgo en mujeres y sobreestimarlo en hombres musculados.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Cuándo debería preocuparme por mi IMC?</h4>
              <p>Si tu IMC está por debajo de 18,5 o por encima de 30, es recomendable consultar con un médico o dietista. Si está entre 25 y 30, presta atención a otros indicadores de salud: perímetro de cintura, presión arterial, glucemia y colesterol.</p>
            </div>
            <div className={styles.eduFaqItem}>
              <h4>¿Puedo tener IMC normal y aun así necesitar mejorar mi salud?</h4>
              <p className={styles.faqTip}>Sí. El fenómeno del "obeso metabólicamente normal" y del "delgado metabólicamente obeso" muestra que el IMC no lo dice todo. Una persona con IMC 22 pero sedentaria, con mala alimentación y mucha grasa visceral puede tener peor perfil de salud que alguien con IMC 27 activo y con buenas analíticas.</p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.eduGuia}>
          <h2>Cómo usar tu IMC como punto de partida para mejorar tu salud</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>1</span>
              <div className={styles.eduStepContent}>
                <strong>Calcula tu IMC con datos precisos</strong>
                <p>Usa tu altura en metros y tu peso en kilogramos en ayunas, a la misma hora del día. Las variaciones de 1-2 kg durante el día son normales (hidratación, comida). Repite la medición mensualmente para ver tendencias.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>2</span>
              <div className={styles.eduStepContent}>
                <strong>Mide también el perímetro de cintura</strong>
                <p>A la altura del ombligo, sin meter tripa. Riesgo elevado: hombres &gt;94 cm (muy elevado &gt;102 cm), mujeres &gt;80 cm (muy elevado &gt;88 cm). La grasa abdominal es el predictor cardiovascular más importante.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>3</span>
              <div className={styles.eduStepContent}>
                <strong>Consulta tus analíticas básicas</strong>
                <p>Glucemia en ayunas, colesterol total, HDL, LDL, triglicéridos y presión arterial. Estos datos junto al IMC dan una imagen completa de tu salud metabólica. Pide a tu médico de cabecera una analítica anual.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>4</span>
              <div className={styles.eduStepContent}>
                <strong>Define un objetivo realista de peso</strong>
                <p>Si tu IMC es 28 y quieres llegar a 24, calcula cuántos kg necesitas perder (peso_actual - altura² × 24). Para alguien de 1,75 m con 86 kg: objetivo = 1,75² × 24 = 73,5 kg. Perder 12,5 kg a un ritmo de 0,5 kg/semana = 25 semanas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>5</span>
              <div className={styles.eduStepContent}>
                <strong>Adopta un déficit calórico moderado y sostenible</strong>
                <p>300-500 kcal/día menos que tu gasto total. Calcula tu TDEE (gasto energético total) con una calculadora de calorías. Dietas muy restrictivas aceleran la pérdida de músculo y son difíciles de mantener.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>6</span>
              <div className={styles.eduStepContent}>
                <strong>Incluye entrenamiento de fuerza</strong>
                <p>El ejercicio de fuerza 2-3 veces por semana preserva la masa muscular durante la pérdida de peso y mejora la composición corporal (puedes bajar % grasa sin que el peso cambie mucho). Complementa con 150 min/semana de cardio moderado.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.eduStepNumber}>7</span>
              <div className={styles.eduStepContent}>
                <strong>Monitoriza más allá del IMC</strong>
                <p>Fotografías mensuales, perímetro de cintura, rendimiento en ejercicios, niveles de energía y analíticas anuales te darán una imagen más completa de tu progreso que solo el número en la báscula.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className={styles.eduTips}>
          <h2>Tips para interpretar y mejorar tu IMC correctamente</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <strong>Mide la cintura, no solo el peso</strong>
              <p>El perímetro abdominal es mejor predictor cardiovascular que el IMC solo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>💪</span>
              <strong>El músculo pesa más que la grasa</strong>
              <p>Si entrenas con pesas, tu IMC puede subir aunque tu composición corporal mejore.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Sigue tendencias, no números fijos</strong>
              <p>Una reducción de 1-2 puntos de IMC en 6 meses es un logro significativo y sostenible.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🥗</span>
              <strong>Prioriza calidad nutricional</strong>
              <p>Puedes tener IMC normal comiendo mal. La densidad nutricional importa tanto como las calorías.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>😴</span>
              <strong>El sueño afecta al peso</strong>
              <p>Dormir menos de 7 horas aumenta el apetito y favorece la acumulación de grasa abdominal.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏥</span>
              <strong>Consulta siempre a un profesional</strong>
              <p>Antes de iniciar cualquier plan de pérdida de peso significativa, habla con tu médico o dietista-nutricionista.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes al interpretar el IMC</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Usar el IMC como único indicador de salud sin considerar composición corporal ni analíticas</li>
            <li>Aplicar los rangos estándar OMS a deportistas con alta masa muscular (sobreestima el riesgo)</li>
            <li>Ignorar la distribución de grasa: IMC "normal" con mucha grasa abdominal es igual de peligroso</li>
            <li>Obsesionarse con un número de IMC concreto en lugar de mejorar hábitos y bienestar general</li>
            <li>Hacer dietas muy restrictivas para bajar el IMC rápido (pierdes músculo, efecto rebote garantizado)</li>
            <li>No considerar que los niños, embarazadas y mayores de 65 tienen criterios propios de evaluación</li>
            <li>Comparar tu IMC con el de personas de distinta etnia (los umbrales de riesgo varían)</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('orientador-imc')}
        title={getRelatedAppsTitle('orientador-imc').title}
        icon={getRelatedAppsTitle('orientador-imc').icon}
      />

      <ShareCard appName="orientador-imc" />
      <Footer appName="orientador-imc" />
    </div>
  );
}
