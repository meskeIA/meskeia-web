'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Chart from 'chart.js/auto';
import styles from './CalculadoraMacros.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import { PLUGIN_REDIMENSION_APLAZADA } from '@/lib/chartjsRedimension';
import { calcularMacros } from '@/lib/calculadoras/macros';

// Aplica el redimensionado que Chart.js aplaza y pierde al acabar la animación (cabo C0456)
Chart.register(PLUGIN_REDIMENSION_APLAZADA);

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
  bajoTmb: boolean;
  /** Ajuste por objetivo sobre el TDEE (kcal): −500, 0 o +400, del motor */
  ajuste: number;
  /** Los datos con los que se calculó: la cabecera, la fórmula escrita y los g/kg leen ESTOS. */
  peso: number;
  altura: number;
  edad: number;
}

interface ErroresCampos {
  peso?: string;
  altura?: string;
  edad?: string;
}

type Salida =
  | { tipo: 'resultado'; resultado: ResultadoMacros }
  | { tipo: 'error'; errores: ErroresCampos; general?: string };

const ESPACIO_DURO = ' ';

/**
 * Lee y valida un campo. Hasta el 18/11/2026 NumberInput reescribía al límite al salir del campo
 * (altura «1,75» → 100 cm → un objetivo un 28 % más bajo) y lo ilegible llegaba al resultado como
 * «No definido kcal» (hallazgo 5033). Ahora lo fuera de rango o ilegible se rechaza con su motivo.
 */
function leerCampo(texto: string, nombre: string, unidad: string, min: number, max: number): { valor: number } | { error: string } {
  const valor = parseSpanishNumber(texto);
  if (texto.trim() === '') return { error: `Introduce ${nombre}.` };
  if (isNaN(valor)) return { error: `No se ha podido leer «${texto}» como número.` };
  if (valor < min || valor > max) {
    return { error: `Debe estar entre ${min} y ${max} ${unidad}.` };
  }
  return { valor };
}

/**
 * El cálculo, con los datos VIVOS. Hasta el 18/11/2026 el resultado se congelaba en el último clic
 * y, al cambiar el objetivo, el sexo o el peso, la cabecera y la fórmula cambiaban pero las kcal no:
 * «Objetivo: Definición» con las 2556 kcal de mantenimiento (hallazgo 5031).
 */
function evaluar(peso: string, altura: string, edad: string, sexo: Sexo, objetivo: Objetivo, actividad: NivelActividad): Salida {
  const p = leerCampo(peso, 'el peso', 'kg', 30, 300);
  const a = leerCampo(altura, 'la altura', 'cm', 100, 250);
  const e = leerCampo(edad, 'la edad', 'años', 15, 100);
  const errores: ErroresCampos = {};
  if ('error' in p) errores.peso = p.error;
  if ('error' in a) {
    const valor = parseSpanishNumber(altura);
    errores.altura = valor > 0 && valor < 3
      ? `La altura va en centímetros: ${formatNumber(valor * 100, 0)}, no ${altura}.`
      : a.error;
  }
  if ('error' in e) errores.edad = e.error;
  if ('error' in p || 'error' in a || 'error' in e) return { tipo: 'error', errores };

  try {
    const r = calcularMacros({ peso: p.valor, altura: a.valor, edad: e.valor, sexo, nivelActividad: actividad, objetivo });
    // Los gramos, sin redondear (kcal / 4 y / 9): se redondean al pintarlos
    return {
      tipo: 'resultado',
      resultado: {
        calorias: r.caloriasObjetivo,
        proteinas: { gramos: r.macros.caloriasProteinas / 4, porcentaje: r.ratios.proteinas, calorias: r.macros.caloriasProteinas },
        carbohidratos: { gramos: r.macros.caloriasCarbohidratos / 4, porcentaje: r.ratios.carbohidratos, calorias: r.macros.caloriasCarbohidratos },
        grasas: { gramos: r.macros.caloriasGrasas / 9, porcentaje: r.ratios.grasas, calorias: r.macros.caloriasGrasas },
        tmb: Math.round(r.tmb),
        tdee: Math.round(r.tdee),
        bajoTmb: r.bajoTmb,
        ajuste: r.ajusteKcal,
        peso: p.valor,
        altura: a.valor,
        edad: e.valor,
      },
    };
  } catch (err) {
    return { tipo: 'error', errores: {}, general: err instanceof Error ? err.message : String(err) };
  }
}

const gramos = (g: number) => `${formatNumber(g, 0)}${ESPACIO_DURO}g`;
const porcentaje = (p: number) => formatPercentage(p / 100, 0);

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

export default function CalculadoraMacrosPage() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<Sexo>('hombre');
  const [objetivo, setObjetivo] = useState<Objetivo>('mantenimiento');
  const [actividad, setActividad] = useState<NivelActividad>('moderado');
  // Tras el primer «Calcular», el resultado sigue a los datos vivos (hallazgo 5031)
  const [calculado, setCalculado] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const salida = useMemo(
    () => (calculado ? evaluar(peso, altura, edad, sexo, objetivo, actividad) : null),
    [calculado, peso, altura, edad, sexo, objetivo, actividad]
  );
  const resultado = salida?.tipo === 'resultado' ? salida.resultado : null;
  const errores: ErroresCampos = salida?.tipo === 'error' ? salida.errores : {};
  const errorGeneral = salida?.tipo === 'error' ? salida.general : undefined;

  const calcular = () => {
    setCalculado(true);
  };

  const limpiar = () => {
    setPeso('');
    setAltura('');
    setEdad('');
    setCalculado(false);
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
                return `${label}: ${gramos(value)}`;
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
        <h1 className={styles.title}><span aria-hidden="true">🥗</span> Calculadora de Macros</h1>
        <p className={styles.subtitle}>
          Calcula tus macronutrientes diarios según tu objetivo: volumen, definición o mantenimiento
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tus datos personales</h2>

          <div className={styles.inputGrid}>
            <NumberInput
              value={peso}
              onChange={setPeso}
              label="Peso"
              placeholder="70"
              helperText="Tu peso en kilogramos (30-300)"
              min={30}
              max={300}
              acotarAlSalir={false}
              error={errores.peso}
            />

            <NumberInput
              value={altura}
              onChange={setAltura}
              label="Altura"
              placeholder="175"
              helperText="Tu altura en centímetros (100-250)"
              min={100}
              max={250}
              acotarAlSalir={false}
              error={errores.altura}
            />

            <NumberInput
              value={edad}
              onChange={setEdad}
              label="Edad"
              placeholder="30"
              helperText="Tu edad en años (15-100)"
              min={15}
              max={100}
              acotarAlSalir={false}
              error={errores.edad}
            />

            <div className={styles.sexoSelector}>
              <label id="sexo-label" className={styles.label}>Sexo</label>
              <div role="group" aria-labelledby="sexo-label" className={styles.sexoBtns}>
                <button
                  type="button"
                  aria-pressed={sexo === 'hombre'}
                  className={`${styles.sexoBtn} ${sexo === 'hombre' ? styles.activo : ''}`}
                  onClick={() => setSexo('hombre')}
                >
                  <span aria-hidden="true">👨</span> Hombre
                </button>
                <button
                  type="button"
                  aria-pressed={sexo === 'mujer'}
                  className={`${styles.sexoBtn} ${sexo === 'mujer' ? styles.activo : ''}`}
                  onClick={() => setSexo('mujer')}
                >
                  <span aria-hidden="true">👩</span> Mujer
                </button>
              </div>
            </div>
          </div>

          <div className={styles.seccion}>
            <label id="objetivo-label" className={styles.label}>Objetivo</label>
            <div role="group" aria-labelledby="objetivo-label" className={styles.objetivosGrid}>
              {objetivos.map(obj => (
                <button
                  key={obj.id}
                  type="button"
                  aria-pressed={objetivo === obj.id}
                  className={`${styles.objetivoCard} ${objetivo === obj.id ? styles.seleccionado : ''}`}
                  onClick={() => setObjetivo(obj.id)}
                >
                  <span className={styles.objetivoIcono} aria-hidden="true">{obj.icono}</span>
                  <span className={styles.objetivoNombre}>{obj.nombre}</span>
                  <span className={styles.objetivoDesc}>{obj.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.seccion}>
            <label id="actividad-label" className={styles.label}>Nivel de actividad física</label>
            <div role="group" aria-labelledby="actividad-label" className={styles.actividadGrid}>
              {nivelesActividad.map(nivel => (
                <button
                  key={nivel.id}
                  type="button"
                  aria-pressed={actividad === nivel.id}
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
                <span className={styles.objetivoIconoBig} aria-hidden="true">
                  {objetivos.find(o => o.id === objetivo)?.icono}
                </span>
                <div>
                  <h3>Objetivo: {objetivos.find(o => o.id === objetivo)?.nombre}</h3>
                  <p>{formatNumber(resultado.peso, Number.isInteger(resultado.peso) ? 0 : 1)} kg • {formatNumber(resultado.altura, 0)} cm • {formatNumber(resultado.edad, 0)} años</p>
                </div>
              </div>

              <div className={styles.caloriasPrincipal}>
                <ResultCard
                  title="Calorías diarias objetivo"
                  value={formatNumber(resultado.calorias, 0)}
                  unit="kcal"
                  variant="highlight"
                  icon="🎯"
                  description={resultado.ajuste < 0 ? `Déficit calórico de ${formatNumber(-resultado.ajuste, 0)} kcal` : resultado.ajuste > 0 ? `Superávit calórico de ${formatNumber(resultado.ajuste, 0)} kcal` : 'Calorías de mantenimiento'}
                />
              </div>

              {resultado.bajoTmb && (
                <p className={styles.avisoBajoTmb}>
                  <span aria-hidden="true">⚠️</span> Este objetivo queda por debajo de tu metabolismo basal
                  estimado ({formatNumber(resultado.tmb, 0)} kcal), lo que tu cuerpo gasta en reposo: el
                  déficit fijo de {formatNumber(-resultado.ajuste, 0)} kcal es grande para tu gasto diario.
                  Un déficit así debe pautarlo y vigilarlo un profesional sanitario.
                </p>
              )}

              <div className={styles.chartSection}>
                <h3 className={styles.seccionTitulo}><span aria-hidden="true">📊</span> Distribución de Macros</h3>
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
                      <span className={styles.legendText}>Proteínas ({porcentaje(resultado.proteinas.porcentaje)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: '#3498DB' }}></span>
                      <span className={styles.legendText}>Carbohidratos ({porcentaje(resultado.carbohidratos.porcentaje)})</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: '#F39C12' }}></span>
                      <span className={styles.legendText}>Grasas ({porcentaje(resultado.grasas.porcentaje)})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* El color de la cifra va por clase de la tarjeta, con su variante oscura: en línea,
                  #3498DB y #F39C12 sobre --hover daban 2,89:1 y 2,01:1 en claro (hallazgo 5041) */}
              <div className={styles.macrosGrid}>
                <div className={`${styles.macroCard} ${styles.macroProteinas}`} style={{ borderColor: '#E74C3C' }}>
                  <div className={styles.macroIcono} aria-hidden="true">🥩</div>
                  <div className={styles.macroNombre}>Proteínas</div>
                  <div className={styles.macroGramos}>
                    {gramos(resultado.proteinas.gramos)}
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.proteinas.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.proteinas.gramos / resultado.peso, 1)}{ESPACIO_DURO}g/kg
                  </div>
                </div>

                <div className={`${styles.macroCard} ${styles.macroCarbohidratos}`} style={{ borderColor: '#3498DB' }}>
                  <div className={styles.macroIcono} aria-hidden="true">🍚</div>
                  <div className={styles.macroNombre}>Carbohidratos</div>
                  <div className={styles.macroGramos}>
                    {gramos(resultado.carbohidratos.gramos)}
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.carbohidratos.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.carbohidratos.gramos / resultado.peso, 1)}{ESPACIO_DURO}g/kg
                  </div>
                </div>

                <div className={`${styles.macroCard} ${styles.macroGrasas}`} style={{ borderColor: '#F39C12' }}>
                  <div className={styles.macroIcono} aria-hidden="true">🥑</div>
                  <div className={styles.macroNombre}>Grasas</div>
                  <div className={styles.macroGramos}>
                    {gramos(resultado.grasas.gramos)}
                  </div>
                  <div className={styles.macroCalorias}>{formatNumber(resultado.grasas.calorias, 0)} kcal</div>
                  <div className={styles.macroPorKg}>
                    {formatNumber(resultado.grasas.gramos / resultado.peso, 1)}{ESPACIO_DURO}g/kg
                  </div>
                </div>
              </div>

              <div className={styles.detallesMetabolismo}>
                <h3 className={styles.seccionTitulo}><span aria-hidden="true">⚡</span> Tu metabolismo</h3>
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
                      <span>{resultado.ajuste > 0 ? '+' : ''}</span>
                      {formatNumber(resultado.ajuste, 0)} kcal
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.formulaBox}>
                <h4><span aria-hidden="true">📐</span> Fórmula Mifflin-St Jeor</h4>
                <p className={styles.formulaText}>
                  {sexo === 'hombre'
                    ? 'TMB = 10 × peso + 6,25 × altura - 5 × edad + 5'
                    : 'TMB = 10 × peso + 6,25 × altura - 5 × edad - 161'
                  }
                </p>
                <p className={styles.formulaDetalle}>
                  TMB = 10 × {formatNumber(resultado.peso, Number.isInteger(resultado.peso) ? 0 : 1)} + 6,25 × {formatNumber(resultado.altura, Number.isInteger(resultado.altura) ? 0 : 1)} - 5 × {formatNumber(resultado.edad, Number.isInteger(resultado.edad) ? 0 : 1)} {sexo === 'hombre' ? '+ 5' : '- 161'} = {formatNumber(resultado.tmb, 0)} kcal
                </p>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🥗</span>
              {/* Región viva: el motivo por el que no hay resultado se anuncia al cambiar (5031, 5033) */}
              <p role="status" aria-live="polite">
                <span>
                  {errorGeneral
                    ?? (salida?.tipo === 'error'
                      ? 'Revisa los datos marcados: con ellos no se puede calcular.'
                      : 'Introduce tus datos y selecciona tu objetivo para calcular tus macronutrientes diarios')}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Última Actualización */}
      

      {/* Disclaimer Médico - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        context="calculadora-macros"
      >
        <p>
          Esta calculadora utiliza <strong>fórmulas generales (Mifflin-St Jeor + factores de actividad)</strong>{' '}
          que NO tienen en cuenta tu situación individual. Limitaciones importantes:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>NO reemplaza un plan nutricional personalizado</strong>: Un nutricionista colegiado debe evaluar tu composición corporal (bioimpedancia, pliegues cutáneos), analíticas, patologías previas y objetivos reales</li>
          <li><strong>Los valores son estimaciones promedio</strong>: Tu metabolismo basal puede variar ±15{ESPACIO_DURO}% según genética, masa muscular, tiroides y otros factores hormonales</li>
          <li><strong>No considera contraindicaciones médicas</strong>: Dietas altas en proteínas pueden ser peligrosas con enfermedad renal. Déficits calóricos extremos pueden causar trastornos hormonales</li>
          <li><strong>El "objetivo" no es garantía de resultado</strong>: Perder/ganar peso depende de adherencia, calidad de alimentos, descanso, estrés y genética individual</li>
        </ul>

        <p className={styles.highlight}>
          <strong><span aria-hidden="true">⚕️</span> Esta herramienta NO sustituye la valoración de un dietista-nutricionista colegiado.</strong>{' '}
          Especialmente si tienes diabetes, enfermedad renal, trastornos alimentarios, embarazo o lactancia,
          es OBLIGATORIO consultar con un profesional sanitario antes de modificar tu dieta.
        </p>

        <p className={styles.emergency}>
          <span aria-hidden="true">🚨</span> <strong>Si presentas pérdida de peso involuntaria, fatiga extrema, mareos frecuentes o amenorrea
          (pérdida de menstruación), consulta con tu médico inmediatamente.</strong> Las dietas restrictivas
          sin supervisión pueden causar deficiencias nutricionales graves.
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="¿Quieres aprender más sobre macronutrientes?"
        subtitle="Descubre cómo optimizar tu alimentación según tus objetivos fitness"
      >
        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa de macros por objetivo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Objetivo</th>
                  <th>Calorías</th>
                  <th>Proteína</th>
                  <th>Carbohidratos</th>
                  <th>Grasas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">🔥</span> Definición (déficit)</td>
                  <td>TDEE − 300/500 kcal</td>
                  <td>2,0 – 2,2 g/kg</td>
                  <td>Moderados</td>
                  <td>Mínimo 0,6 g/kg</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">💪</span> Volumen (superávit)</td>
                  <td>TDEE + 300/500 kcal</td>
                  <td>1,6 – 2,0 g/kg</td>
                  <td>Altos</td>
                  <td>0,8 – 1,0 g/kg</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">⚖️</span> Mantenimiento</td>
                  <td>= TDEE</td>
                  <td>1,6 – 1,8 g/kg</td>
                  <td>Equilibrados</td>
                  <td>0,8 – 1,0 g/kg</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🏃</span> Rendimiento deportivo</td>
                  <td>TDEE + 200/300 kcal</td>
                  <td>1,6 – 2,0 g/kg</td>
                  <td>Muy altos (5-8 g/kg)</td>
                  <td>20-25{ESPACIO_DURO}% de las kcal</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🧘</span> Sedentario/salud general</td>
                  <td>= TDEE o − 200 kcal</td>
                  <td>0,8 – 1,2 g/kg</td>
                  <td>Moderados</td>
                  <td>25-35{ESPACIO_DURO}% de las kcal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🏋️</span>
                <span className={styles.casoTag}>Definición muscular</span>
              </div>
              <p>Carlos, 80 kg, entrena 4 días/semana. TDEE estimado: 2.800 kcal. En fase de definición aplica
              déficit de 400 kcal (2.400 kcal/día). Proteína: 2,0 g/kg = 160 g/día. Los carbohidratos se
              calculan con las calorías restantes priorizando la proteína.</p>
              <div className={styles.casoResultado}>Objetivo: preservar músculo y reducir grasa en 8-12 semanas</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🌱</span>
                <span className={styles.casoTag}>Dieta vegana y fitness</span>
              </div>
              <p>María, 60 kg, vegana activa. Le preocupa cubrir proteínas sin carne ni lácteos. Con legumbres,
              tofu, tempeh, seitán y proteína de guisante puede alcanzar los 1,8-2,0 g/kg sin problema.
              La clave es combinar fuentes para obtener todos los aminoácidos esenciales.</p>
              <div className={styles.casoResultado}>Proteína vegana completa combinando legumbres + cereales</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">🏃‍♀️</span>
                <span className={styles.casoTag}>Corredora de fondo</span>
              </div>
              <p>Laura, 55 kg, corre 60 km/semana preparando un maratón. Sus necesidades de carbohidratos
              son muy altas (6-8 g/kg = 330-440 g/día). La grasa no debe bajar del 20{ESPACIO_DURO}% de las calorías
              totales para mantener el correcto funcionamiento hormonal.</p>
              <div className={styles.casoResultado}>Prioridad: carbohidratos suficientes para el rendimiento en carrera</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji} aria-hidden="true">👨‍💼</span>
                <span className={styles.casoTag}>Persona sedentaria con sobrepeso</span>
              </div>
              <p>Tomás, 90 kg, trabajo de oficina, sin deporte. TDEE: ~2.200 kcal. Con un déficit moderado de
              300 kcal (1.900 kcal/día) y aumentando proteína a 1,2 g/kg (108 g/día) puede perder grasa
              sin perder masa muscular y sin hambre excesiva.</p>
              <div className={styles.casoResultado}>Déficit moderado y proteína suficiente: una pérdida más gradual</div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Conceptos Clave</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🥩</span> Proteínas</h4>
              <p>
                Esenciales para la construcción y reparación muscular. Cada gramo aporta 4 kcal.
                Recomendación general: 1,6-2,2 g/kg de peso corporal para personas activas.
                Fuentes: carne, pescado, huevos, lácteos, legumbres, tofu.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🍚</span> Carbohidratos</h4>
              <p>
                Principal fuente de energía para el cuerpo y el cerebro. Cada gramo aporta 4 kcal.
                Prioriza carbohidratos complejos (arroz integral, avena, patata) sobre los simples.
                Son especialmente importantes para entrenamientos de alta intensidad.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">🥑</span> Grasas</h4>
              <p>
                Esenciales para hormonas, absorción de vitaminas y salud celular. Cada gramo aporta 9 kcal.
                Nunca bajes de 0,5 g/kg de peso. Prioriza grasas insaturadas (aceite de oliva, aguacate,
                frutos secos) y omega-3 (pescado azul).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">⚖️</span> Balance Calórico</h4>
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
              <h4><span aria-hidden="true">🔥</span> Definición</h4>
              <p>
                • Proteína alta (2-2,2 g/kg) para preservar músculo<br/>
                • Déficit moderado (300-500 kcal/día)<br/>
                • Prioriza alimentos saciantes y bajos en calorías<br/>
                • Mantén el entrenamiento de fuerza
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">💪</span> Volumen</h4>
              <p>
                • Superávit controlado (300-500 kcal/día)<br/>
                • Carbohidratos suficientes para rendir en el gimnasio<br/>
                • Proteína moderada-alta (1,6-2 g/kg)<br/>
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
                Para personas sedentarias: 0,8 g/kg. Para personas activas o que entrenan: 1,6-2,2 g/kg.
                En definición, se recomienda el rango alto (2-2,2 g/kg) para minimizar pérdida muscular.
                Más de 2,2 g/kg no ha demostrado beneficios adicionales en la mayoría de estudios.
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

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo calcular y ajustar tus macros: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula tu metabolismo basal (TMB)</strong>
                <p>Usa la fórmula de Mifflin-St Jeor: para hombres (10 × peso) + (6,25 × altura) − (5 × edad) + 5;
                para mujeres, el mismo cálculo menos 161. Este es el mínimo calórico si estuvieras en reposo total.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Multiplica por tu factor de actividad (TDEE)</strong>
                <p>Sedentario: TMB × 1,2. Ligero (1-3 días/semana): × 1,375. Moderado (3-5 días): × 1,55.
                Activo (6-7 días intensos): × 1,725. Muy activo (atleta o trabajo físico muy intenso): × 1,9.
                Este es tu gasto total diario de energía.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Define tu objetivo y ajusta las calorías</strong>
                <p>Definición: TDEE − 300/500 kcal. Volumen: TDEE + 300/500 kcal. Mantenimiento: = TDEE.
                Deficits mayores de 500 kcal/día aceleran la pérdida de músculo. Superávits mayores de 500 kcal
                aumentan más la grasa que el músculo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Establece la proteína primero</strong>
                <p>La proteína es el macro más importante. Fija entre 1,6 y 2,2 g/kg según tu objetivo e intensidad
                de entrenamiento. Cada gramo de proteína aporta 4 kcal. Calcula las calorías de proteína y descuéntalas del total.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Fija la grasa mínima (no bajar del 20{ESPACIO_DURO}% del total calórico)</strong>
                <p>Las grasas son esenciales para las hormonas y la absorción de vitaminas. Nunca bajes de 0,5-0,6 g/kg.
                Cada gramo de grasa aporta 9 kcal. En definición suelen representar el 20-25{ESPACIO_DURO}% de las calorías totales.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Asigna el resto a carbohidratos y revisa cada 4-6 semanas</strong>
                <p>Los carbohidratos cubren las calorías restantes. Cada gramo aporta 4 kcal. Recalcula los macros
                cada 4-6 semanas o cuando tu peso cambie más de 3-5 kg, ya que el TDEE evoluciona con el cuerpo.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Consejos para seguir tus macros con éxito</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <strong>Usa una app de seguimiento</strong>
              <p>Una app de registro de alimentos o una simple libreta te permiten anotar lo que comes con
              detalle. Registrar con constancia, aunque sea de forma parcial, suele servir más que hacerlo
              perfecto de vez en cuando.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥣</span>
              <strong>Prepara comidas con antelación (meal prep)</strong>
              <p>Cocinar en lotes el domingo reduce la improvisación y facilita controlar los macros.
              Las comidas preparadas eliminan las decisiones difíciles cuando tienes hambre.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Usa báscula de cocina al principio</strong>
              <p>Pesar los alimentos durante las primeras semanas educa tu percepción de las porciones.
              Después podrás estimar visualmente con mucha más precisión.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <strong>Hidratación como cuarto macro</strong>
              <p>El agua no tiene calorías pero afecta al rendimiento y al apetito. Lo que necesitas beber
              cambia con el calor, la actividad física y tu tamaño corporal: ten agua a mano a lo largo del
              día y bebe más cuando entrenas o hace calor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Revisa y ajusta regularmente</strong>
              <p>Si no ves progreso en 2-3 semanas sin haber cambiado el entrenamiento, ajusta las calorías
              en ±100-200 kcal. Los ajustes pequeños son más sostenibles que los cambios drásticos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
              <strong>Flexibilidad antes que rigidez</strong>
              <p>No hace falta clavar los macros todos los días: lo que cuenta es la media de semanas y
              meses. Una pauta demasiado rígida es más difícil de mantener, y algunas comidas más libres
              no deshacen el progreso.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al calcular y seguir los macros</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar el peso como única métrica:</strong> El peso fluctúa diariamente por el agua, el glucógeno y la digestión. Mide también perímetros (cintura, cadera) y fotos mensuales para evaluar el progreso real.</li>
            <li><strong>Subestimar las calorías de las grasas:</strong> La grasa tiene 9 kcal/g, más del doble que proteínas y carbohidratos (4 kcal/g). Pequeñas cantidades de aceite, mantequilla o frutos secos suman muchas calorías.</li>
            <li><strong>Priorizar los carbohidratos sobre la proteína:</strong> En definición, reducir proteína para comer más carbohidratos es un error frecuente. La proteína debe establecerse primero, especialmente cuando se pierde peso.</li>
            <li><strong>Bajar demasiado las grasas:</strong> Bajar las grasas por debajo del 20{ESPACIO_DURO}% del total calórico puede afectar a las hormonas, la absorción de vitaminas liposolubles (A, D, E, K) y el sistema inmune.</li>
            <li><strong>No recalcular tras perder o ganar peso:</strong> El TDEE disminuye al perder peso. Si no ajustas las calorías, el déficit se vuelve insuficiente y el progreso se estanca. Recalcula cada 4-6 semanas.</li>
            <li><strong>Seguir macros de otra persona:</strong> Los macros son individuales. No uses los de un influencer o amigo como punto de partida sin calcular los tuyos propios según tu peso, altura, edad y nivel de actividad.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="calculadora-macros" />
      <Footer appName="calculadora-macros" />
    </div>
  );
}
