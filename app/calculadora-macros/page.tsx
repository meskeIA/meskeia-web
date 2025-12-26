'use client';

import { useState, useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraMacros.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

type Objetivo = 'volumen' | 'definicion' | 'mantenimiento';
type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy_activo';
type Sexo = 'hombre' | 'mujer';

interface ResultadoMacros {
  calorias: number;
  proteinas: { gramos: number; porcentaje: number; calorias: number };
  carbohidratos: { gramos: number; porcentaje: number; calorias: number };
  grasas: { gramos: number; porcentaje: number; calorias: number };
  tmb: number;
  tdee: number;
}

const objetivos: { id: Objetivo; nombre: string; icono: string; descripcion: string }[] = [
  { id: 'definicion', nombre: 'Definición', icono: '🔥', descripcion: 'Pérdida de grasa manteniendo músculo' },
  { id: 'mantenimiento', nombre: 'Mantenimiento', icono: '⚖️', descripcion: 'Mantener peso y composición actual' },
  { id: 'volumen', nombre: 'Volumen', icono: '💪', descripcion: 'Ganar masa muscular con superávit calórico' },
];

const nivelesActividad: { id: NivelActividad; nombre: string; factor: number; descripcion: string }[] = [
  { id: 'sedentario', nombre: 'Sedentario', factor: 1.2, descripcion: 'Trabajo de oficina, poco ejercicio' },
  { id: 'ligero', nombre: 'Ligero', factor: 1.375, descripcion: 'Ejercicio ligero 1-3 días/semana' },
  { id: 'moderado', nombre: 'Moderado', factor: 1.55, descripcion: 'Ejercicio moderado 3-5 días/semana' },
  { id: 'activo', nombre: 'Activo', factor: 1.725, descripcion: 'Ejercicio intenso 6-7 días/semana' },
  { id: 'muy_activo', nombre: 'Muy activo', factor: 1.9, descripcion: 'Atleta o trabajo físico muy intenso' },
];

// Ratios de macros según objetivo (proteína / carbos / grasa)
const ratiosMacros: Record<Objetivo, { proteina: number; carbos: number; grasa: number; ajusteCalorias: number }> = {
  definicion: { proteina: 0.30, carbos: 0.40, grasa: 0.30, ajusteCalorias: -500 },
  mantenimiento: { proteina: 0.25, carbos: 0.50, grasa: 0.25, ajusteCalorias: 0 },
  volumen: { proteina: 0.25, carbos: 0.50, grasa: 0.25, ajusteCalorias: 400 },
};

export default function CalculadoraMacrosPage() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<Sexo>('hombre');
  const [objetivo, setObjetivo] = useState<Objetivo>('mantenimiento');
  const [actividad, setActividad] = useState<NivelActividad>('moderado');
  const [resultado, setResultado] = useState<ResultadoMacros | null>(null);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const calcular = () => {
    const pesoNum = parseSpanishNumber(peso);
    const alturaNum = parseSpanishNumber(altura);
    const edadNum = parseSpanishNumber(edad);

    if (pesoNum <= 0 || alturaNum <= 0 || edadNum <= 0) {
      return;
    }

    // Fórmula Mifflin-St Jeor para TMB
    let tmb: number;
    if (sexo === 'hombre') {
      tmb = 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum + 5;
    } else {
      tmb = 10 * pesoNum + 6.25 * alturaNum - 5 * edadNum - 161;
    }

    // TDEE = TMB × Factor de actividad
    const factorActividad = nivelesActividad.find(n => n.id === actividad)?.factor || 1.55;
    const tdee = tmb * factorActividad;

    // Calorías objetivo según objetivo
    const ratio = ratiosMacros[objetivo];
    const calorias = Math.round(tdee + ratio.ajusteCalorias);

    // Calcular macros
    const caloriasProteinas = calorias * ratio.proteina;
    const caloriasCarbos = calorias * ratio.carbos;
    const caloriasGrasas = calorias * ratio.grasa;

    // Conversión: Proteínas y carbos = 4 kcal/g, Grasas = 9 kcal/g
    const gramosProteinas = caloriasProteinas / 4;
    const gramosCarbos = caloriasCarbos / 4;
    const gramosGrasas = caloriasGrasas / 9;

    setResultado({
      calorias,
      proteinas: { gramos: gramosProteinas, porcentaje: ratio.proteina * 100, calorias: caloriasProteinas },
      carbohidratos: { gramos: gramosCarbos, porcentaje: ratio.carbos * 100, calorias: caloriasCarbos },
      grasas: { gramos: gramosGrasas, porcentaje: ratio.grasa * 100, calorias: caloriasGrasas },
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
    });
  };

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setEdad('');
    setResultado(null);
  };

  // Effect para Chart.js
  useEffect(() => {
    if (!resultado || !chartRef.current) {
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

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
        datasets: [{
          data: [
            resultado.proteinas.gramos,
            resultado.carbohidratos.gramos,
            resultado.grasas.gramos
          ],
          backgroundColor: [
            '#E74C3C', // Rojo para proteínas
            '#3498DB', // Azul para carbohidratos
            '#F39C12', // Amarillo para grasas
          ],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${formatNumber(value, 0)}g`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [resultado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🥗 Calculadora de Macros</h1>
        <p className={styles.subtitle}>
          Calcula tus macronutrientes diarios según tu objetivo: volumen, definición o mantenimiento
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus datos personales</h2>

          <div className={styles.inputGrid}>
            <NumberInput
              value={peso}
              onChange={setPeso}
              label="Peso"
              placeholder="70"
              helperText="Tu peso en kilogramos"
              min={30}
              max={300}
            />

            <NumberInput
              value={altura}
              onChange={setAltura}
              label="Altura"
              placeholder="175"
              helperText="Tu altura en centímetros"
              min={100}
              max={250}
            />

            <NumberInput
              value={edad}
              onChange={setEdad}
              label="Edad"
              placeholder="30"
              helperText="Tu edad en años"
              min={15}
              max={100}
            />

            <div className={styles.sexoSelector}>
              <label className={styles.label}>Sexo</label>
              <div className={styles.sexoBtns}>
                <button
                  type="button"
                  className={`${styles.sexoBtn} ${sexo === 'hombre' ? styles.activo : ''}`}
                  onClick={() => setSexo('hombre')}
                >
                  👨 Hombre
                </button>
                <button
                  type="button"
                  className={`${styles.sexoBtn} ${sexo === 'mujer' ? styles.activo : ''}`}
                  onClick={() => setSexo('mujer')}
                >
                  👩 Mujer
                </button>
              </div>
            </div>
          </div>

          <div className={styles.seccion}>
            <label className={styles.label}>Objetivo</label>
            <div className={styles.objetivosGrid}>
              {objetivos.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  className={`${styles.objetivoCard} ${objetivo === obj.id ? styles.seleccionado : ''}`}
                  onClick={() => setObjetivo(obj.id)}
                >
                  <span className={styles.objetivoIcono}>{obj.icono}</span>
                  <span className={styles.objetivoNombre}>{obj.nombre}</span>
                  <span className={styles.objetivoDesc}>{obj.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.seccion}>
            <label className={styles.label}>Nivel de actividad física</label>
            <div className={styles.actividadGrid}>
              {nivelesActividad.map(nivel => (
                <button
                  key={nivel.id}
                  type="button"
                  className={`${styles.actividadCard} ${actividad === nivel.id ? styles.seleccionado : ''}`}
                  onClick={() => setActividad(nivel.id)}
                >
                  <span className={styles.actividadNombre}>{nivel.nombre}</span>
                  <span className={styles.actividadDesc}>{nivel.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={calcular}
              className={styles.btnPrimary}
              disabled={!peso || !altura || !edad}
            >
              Calcular Macros
            </button>
            <button type="button" onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.objetivoHeader}>
                <span className={styles.objetivoIconoBig}>
                  {objetivos.find(o => o.id === objetivo)?.icono}
                </span>
                <div>
                  <h3>Objetivo: {objetivos.find(o => o.id === objetivo)?.nombre}</h3>
                  <p>{formatNumber(parseSpanishNumber(peso), 0)} kg • {formatNumber(parseSpanishNumber(altura), 0)} cm • {formatNumber(parseSpanishNumber(edad), 0)} años</p>
                </div>
              </div>

              <div className={styles.caloriasPrincipal}>
                <ResultCard
                  title="Calorías diarias objetivo"
                  value={formatNumber(resultado.calorias, 0)}
                  unit="kcal"
                  variant="highlight"
                  icon="🎯"
                  description={objetivo === 'definicion' ? 'Déficit calórico de 500 kcal' : objetivo === 'volumen' ? 'Superávit calórico de 400 kcal' : 'Calorías de mantenimiento'}
                />
              </div>

              <div className={styles.chartSection}>
                <h3 className={styles.seccionTitulo}>📊 Distribución de Macros</h3>
                <div className={styles.chartWrapper}>
                  <div className={styles.chartContainer}>
                    <canvas ref={chartRef}></canvas>
                    <div className={styles.chartCenter}>
                      <span className={styles.chartTotal}>{formatNumber(resultado.calorias, 0)}</span>
                      <span className={styles.chartLabel}>kcal</span>
                    </div>
                  </div>
                  <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: '#E74C3C' }}></span>
                      <span className={styles.legendText}>Proteínas ({formatNumber(resultado.proteinas.porcentaje, 0)}%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: '#3498DB' }}></span>
                      <span className={styles.legendText}>Carbohidratos ({formatNumber(resultado.carbohidratos.porcentaje, 0)}%)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: '#F39C12' }}></span>
                      <span className={styles.legendText}>Grasas ({formatNumber(resultado.grasas.porcentaje, 0)}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.macrosGrid}>
                <div className={styles.macroCard} style={{ borderColor: '#E74C3C' }}>
                  <div className={styles.macroIcono}>🥩</div>
                  <div className={styles.macroNombre}>Proteínas</div>
                  <div className={styles.macroGramos} style={{ color: '#E74C3C' }}>
                    {formatNumber(resultado.proteinas.gramos, 0)}g
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.proteinas.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.proteinas.gramos / parseSpanishNumber(peso), 1)}g/kg
                  </div>
                </div>

                <div className={styles.macroCard} style={{ borderColor: '#3498DB' }}>
                  <div className={styles.macroIcono}>🍚</div>
                  <div className={styles.macroNombre}>Carbohidratos</div>
                  <div className={styles.macroGramos} style={{ color: '#3498DB' }}>
                    {formatNumber(resultado.carbohidratos.gramos, 0)}g
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.carbohidratos.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.carbohidratos.gramos / parseSpanishNumber(peso), 1)}g/kg
                  </div>
                </div>

                <div className={styles.macroCard} style={{ borderColor: '#F39C12' }}>
                  <div className={styles.macroIcono}>🥑</div>
                  <div className={styles.macroNombre}>Grasas</div>
                  <div className={styles.macroGramos} style={{ color: '#F39C12' }}>
                    {formatNumber(resultado.grasas.gramos, 0)}g
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.grasas.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.grasas.gramos / parseSpanishNumber(peso), 1)}g/kg
                  </div>
                </div>
              </div>

              <div className={styles.detallesMetabolismo}>
                <h3 className={styles.seccionTitulo}>⚡ Tu metabolismo</h3>
                <div className={styles.detallesGrid}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>TMB (Tasa Metabólica Basal)</span>
                    <span className={styles.detalleValor}>{formatNumber(resultado.tmb, 0)} kcal</span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>TDEE (Gasto Total Diario)</span>
                    <span className={styles.detalleValor}>{formatNumber(resultado.tdee, 0)} kcal</span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Ajuste por objetivo</span>
                    <span className={styles.detalleValor}>
                      {ratiosMacros[objetivo].ajusteCalorias > 0 ? '+' : ''}
                      {formatNumber(ratiosMacros[objetivo].ajusteCalorias, 0)} kcal
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.formulaBox}>
                <h4>📐 Fórmula Mifflin-St Jeor</h4>
                <p className={styles.formulaText}>
                  {sexo === 'hombre'
                    ? 'TMB = 10 × peso + 6,25 × altura - 5 × edad + 5'
                    : 'TMB = 10 × peso + 6,25 × altura - 5 × edad - 161'
                  }
                </p>
                <p className={styles.formulaDetalle}>
                  TMB = 10 × {peso} + 6,25 × {altura} - 5 × {edad} {sexo === 'hombre' ? '+ 5' : '- 161'} = {formatNumber(resultado.tmb, 0)} kcal
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🥗</span>
              <p>Introduce tus datos y selecciona tu objetivo para calcular tus macronutrientes diarios</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona estimaciones basadas en fórmulas científicas estándar (Mifflin-St Jeor).
          Los resultados son orientativos y pueden variar según tu metabolismo individual, nivel real de actividad,
          composición corporal y otros factores. <strong>No sustituye el asesoramiento de un nutricionista
          o dietista profesional</strong>. Consulta con un especialista antes de realizar cambios significativos
          en tu alimentación.
        </p>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre macronutrientes?"
        subtitle="Descubre cómo optimizar tu alimentación según tus objetivos fitness"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🥩 Proteínas</h4>
              <p>
                Esenciales para la construcción y reparación muscular. Cada gramo aporta 4 kcal.
                Recomendación general: 1,6-2,2g/kg de peso corporal para personas activas.
                Fuentes: carne, pescado, huevos, lácteos, legumbres, tofu.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🍚 Carbohidratos</h4>
              <p>
                Principal fuente de energía para el cuerpo y el cerebro. Cada gramo aporta 4 kcal.
                Prioriza carbohidratos complejos (arroz integral, avena, patata) sobre los simples.
                Son especialmente importantes para entrenamientos de alta intensidad.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🥑 Grasas</h4>
              <p>
                Esenciales para hormonas, absorción de vitaminas y salud celular. Cada gramo aporta 9 kcal.
                Nunca bajes de 0,5g/kg de peso. Prioriza grasas insaturadas (aceite de oliva, aguacate,
                frutos secos) y omega-3 (pescado azul).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>⚖️ Balance Calórico</h4>
              <p>
                <strong>Déficit:</strong> Ingerir menos calorías de las que gastas (pérdida de peso).
                <strong> Superávit:</strong> Ingerir más calorías (ganancia de peso/músculo).
                <strong> Mantenimiento:</strong> Equilibrio entre ingesta y gasto.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Consejos por Objetivo</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔥 Definición</h4>
              <p>
                • Proteína alta (2-2,2g/kg) para preservar músculo<br/>
                • Déficit moderado (300-500 kcal/día)<br/>
                • Prioriza alimentos saciantes y bajos en calorías<br/>
                • Mantén el entrenamiento de fuerza
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💪 Volumen</h4>
              <p>
                • Superávit controlado (300-500 kcal/día)<br/>
                • Carbohidratos suficientes para rendir en el gimnasio<br/>
                • Proteína moderada-alta (1,6-2g/kg)<br/>
                • Entrena progresivamente más pesado
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqGrid}>
            <details className={styles.faqItem}>
              <summary>¿Cuánta proteína necesito realmente?</summary>
              <p>
                Para personas sedentarias: 0,8g/kg. Para personas activas o que entrenan: 1,6-2,2g/kg.
                En definición, se recomienda el rango alto (2-2,2g/kg) para minimizar pérdida muscular.
                Más de 2,2g/kg no ha demostrado beneficios adicionales en la mayoría de estudios.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Los carbohidratos engordan?</summary>
              <p>
                No directamente. Lo que causa ganancia de grasa es un exceso calórico sostenido,
                independientemente de si viene de carbohidratos, proteínas o grasas. Los carbohidratos
                son importantes para el rendimiento deportivo y la recuperación muscular.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Puedo ganar músculo y perder grasa a la vez?</summary>
              <p>
                Es posible (recomposición corporal), pero difícil y lento. Funciona mejor en principiantes,
                personas con sobrepeso o quienes retoman el entrenamiento tras un descanso. Para la mayoría,
                es más eficiente alternar fases de volumen y definición.
              </p>
            </details>
            <details className={styles.faqItem}>
              <summary>¿Cada cuánto debo recalcular mis macros?</summary>
              <p>
                Recalcula cuando tu peso cambie significativamente (±3-5 kg), cambies de objetivo,
                o modifiques tu nivel de actividad física. En una dieta activa, revisa cada 4-6 semanas
                para ajustar según tu progreso.
              </p>
            </details>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-macros')} />
      <Footer appName="calculadora-macros" />
    </div>
  );
}
