'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './VisualizadorEstadisticaCotidiana.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Concepto = 'bayes' | 'regresion' | 'simpson' | 'supervivencia' | 'grandesNumeros';

interface ConceptoInfo {
  id: Concepto;
  titulo: string;
  icono: string;
  subtitulo: string;
}

interface Estudiante {
  nombre: string;
  nota1: number;
  nota2: number;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const CONCEPTOS: ConceptoInfo[] = [
  { id: 'bayes', titulo: 'Test médico', icono: '🏥', subtitulo: 'Probabilidad condicional' },
  { id: 'regresion', titulo: 'Regresión a la media', icono: '📊', subtitulo: '¿El castigo funciona?' },
  { id: 'simpson', titulo: 'Paradoja de Simpson', icono: '🔄', subtitulo: 'Los números mienten' },
  { id: 'supervivencia', titulo: 'Sesgo de supervivencia', icono: '✈️', subtitulo: 'Lo que no ves importa' },
  { id: 'grandesNumeros', titulo: 'Ley de los grandes números', icono: '🎰', subtitulo: '¿Es el casino justo?' },
];

const NOMBRES_ESTUDIANTES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena',
  'Fran', 'Gloria', 'Hugo', 'Irene', 'Javier',
];

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function generarNota(): number {
  return Math.round(Math.random() * 10);
}

function regresionarNota(nota: number): number {
  const media = 5;
  const retroceso = (nota - media) * 0.4;
  const ruido = (Math.random() - 0.5) * 2;
  return Math.max(0, Math.min(10, Math.round(nota - retroceso + ruido)));
}

function generarEstudiantes(): Estudiante[] {
  return NOMBRES_ESTUDIANTES.map((nombre) => {
    const nota1 = generarNota();
    const nota2 = regresionarNota(nota1);
    return { nombre, nota1, nota2 };
  });
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstadisticaCotidiana() {
  const [conceptoActivo, setConceptoActivo] = useState<Concepto>('bayes');

  // Bloque 1: Bayes
  const [prevalencia, setPrevalencia] = useState(1); // en porcentaje

  // Bloque 2: Regresión a la media
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(generarEstudiantes);

  // Bloque 3: Simpson
  const [vistaGlobal, setVistaGlobal] = useState(true);

  // Bloque 5: Ley grandes números
  const [caras, setCaras] = useState(0);
  const [croces, setCroces] = useState(0);
  const [historiaMoneda, setHistoriaMoneda] = useState<number[]>([]);

  // ──── Cálculos Bayes ────
  const prevalenciaDecimal = prevalencia / 100;
  const sensibilidad = 0.99;
  const especificidad = 0.95;
  const poblacion = 10000;

  const enfermos = Math.round(poblacion * prevalenciaDecimal);
  const sanos = poblacion - enfermos;
  const verdaderosPositivos = Math.round(enfermos * sensibilidad);
  const falsosPositivos = Math.round(sanos * (1 - especificidad));
  const totalPositivos = verdaderosPositivos + falsosPositivos;
  const probabilidadRealPct = totalPositivos > 0
    ? Math.round((verdaderosPositivos / totalPositivos) * 100)
    : 0;

  // Cuadrícula de 100 puntos (escala de 10.000)
  const puntosEnfermos = Math.round((enfermos / poblacion) * 100);
  const puntosFalsosPositivos = Math.min(
    100 - puntosEnfermos,
    Math.round((falsosPositivos / poblacion) * 100),
  );

  const puntos = Array.from({ length: 100 }, (_, i) => {
    if (i < puntosEnfermos) return 'enfermo';
    if (i < puntosEnfermos + puntosFalsosPositivos) return 'falsoPositivo';
    return 'sano';
  });

  // ──── Lanzar moneda ────
  const lanzarMonedas = useCallback((cantidad: number) => {
    let nuevasCaras = caras;
    let nuevasCroces = croces;
    const nuevaHistoria = [...historiaMoneda];

    for (let i = 0; i < cantidad; i++) {
      if (Math.random() < 0.5) {
        nuevasCaras++;
      } else {
        nuevasCroces++;
      }
      const total = nuevasCaras + nuevasCroces;
      if (i % Math.max(1, Math.floor(cantidad / 50)) === 0 || i === cantidad - 1) {
        nuevaHistoria.push(Math.round((nuevasCaras / total) * 100));
      }
    }

    setCaras(nuevasCaras);
    setCroces(nuevasCroces);
    setHistoriaMoneda(nuevaHistoria.slice(-100));
  }, [caras, croces, historiaMoneda]);

  const reiniciarMoneda = useCallback(() => {
    setCaras(0);
    setCroces(0);
    setHistoriaMoneda([]);
  }, []);

  const totalLanzamientos = caras + croces;
  const pctCaras = totalLanzamientos > 0 ? Math.round((caras / totalLanzamientos) * 100) : 50;

  // ──── Chart.js datos moneda ────
  const chartData = {
    labels: historiaMoneda.map((_, i) => String(i + 1)),
    datasets: [
      {
        label: '% de caras',
        data: historiaMoneda,
        borderColor: '#2E86AB',
        backgroundColor: 'rgba(46,134,171,0.1)',
        tension: 0.3,
        pointRadius: historiaMoneda.length > 50 ? 0 : 3,
      },
      {
        label: '50% (esperado)',
        data: historiaMoneda.map(() => 50),
        borderColor: '#48A9A6',
        borderDash: [6, 3],
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      title: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (val: number | string) => `${val}%` },
      },
      x: { ticks: { display: false } },
    },
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Estadística en la Vida Cotidiana</h1>
        <p>Probabilidad, sesgos y paradojas que cambian cómo ves el mundo — sin ecuaciones</p>
      </header>

      <LegalNotice />

      {/* Navegación de conceptos */}
      <nav className={styles.conceptoNav} aria-label="Conceptos estadísticos">
        {CONCEPTOS.map((c) => (
          <button
            key={c.id}
            className={`${styles.conceptoBtn} ${conceptoActivo === c.id ? styles.conceptoBtnActivo : ''}`}
            onClick={() => setConceptoActivo(c.id)}
          >
            <span className={styles.conceptoIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.conceptoTitulo}>{c.titulo}</span>
            <span className={styles.conceptoSub}>{c.subtitulo}</span>
          </button>
        ))}
      </nav>

      {/* ────────────────────────────────────────── */}
      {/* BLOQUE 1: Probabilidad Condicional (Bayes) */}
      {/* ────────────────────────────────────────── */}
      {conceptoActivo === 'bayes' && (
        <section className={styles.conceptoPanel}>
          <div className={styles.panelHeader}>
            <h2>🏥 Probabilidad Condicional: ¿Debo preocuparme si el test es positivo?</h2>
            <p className={styles.panelIntro}>
              Un test con 99% de precisión puede dar muchos falsos positivos si la enfermedad es rara.
              Mueve el slider para ver cómo cambia la probabilidad real.
            </p>
          </div>

          <div className={styles.sliderBox}>
            <label htmlFor="prevalencia" className={styles.sliderLabel}>
              Prevalencia de la enfermedad en la población:{' '}
              <strong>{prevalencia}%</strong>
            </label>
            <input
              id="prevalencia"
              type="range"
              min={0.1}
              max={5}
              step={0.1}
              value={prevalencia}
              onChange={(e) => setPrevalencia(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderTicks}>
              <span>0,1%</span>
              <span>1%</span>
              <span>2,5%</span>
              <span>5%</span>
            </div>
          </div>

          <div className={styles.bayesResultado}>
            <div className={styles.bayesNumero}>
              <span className={styles.bayesValor}>{probabilidadRealPct}%</span>
              <span className={styles.bayesEtiqueta}>probabilidad real si el test es positivo</span>
            </div>
            <div className={styles.bayesExplicacion}>
              <p>De <strong>{poblacion.toLocaleString('es-ES')}</strong> personas:</p>
              <ul>
                <li><span className={styles.puntoEnfermo}></span> <strong>{enfermos}</strong> tienen la enfermedad</li>
                <li>El test detecta <strong>{verdaderosPositivos}</strong> verdaderos positivos</li>
                <li><span className={styles.puntoFalso}></span> Pero también da positivo en <strong>{falsosPositivos}</strong> personas sanas (falsos positivos)</li>
                <li>De los <strong>{totalPositivos}</strong> positivos totales, solo <strong>{verdaderosPositivos}</strong> están realmente enfermos</li>
              </ul>
            </div>
          </div>

          {/* Cuadrícula visual de 100 puntos */}
          <div className={styles.cuadricula} aria-label="Representación visual de 100 personas">
            {puntos.map((tipo, i) => (
              <div
                key={i}
                className={`${styles.punto} ${styles[`punto_${tipo}`]}`}
                title={tipo === 'enfermo' ? 'Enfermo (verdadero positivo)' : tipo === 'falsoPositivo' ? 'Sano (falso positivo)' : 'Sano'}
              />
            ))}
          </div>
          <div className={styles.leyenda}>
            <span><span className={`${styles.puntoMuestra} ${styles.punto_enfermo}`} aria-hidden="true" /> Enfermo</span>
            <span><span className={`${styles.puntoMuestra} ${styles.punto_falsoPositivo}`} aria-hidden="true" /> Falso positivo</span>
            <span><span className={`${styles.puntoMuestra} ${styles.punto_sano}`} aria-hidden="true" /> Sano</span>
          </div>

          <p className={styles.mensajeClave}>
            <strong>Clave:</strong> Un test con alta precisión sigue dando muchos falsos positivos si la enfermedad es rara.
            Con prevalencia del {prevalencia}%, la mayoría de positivos son falsos.
          </p>
        </section>
      )}

      {/* ────────────────────────────────────────── */}
      {/* BLOQUE 2: Regresión a la media             */}
      {/* ────────────────────────────────────────── */}
      {conceptoActivo === 'regresion' && (
        <section className={styles.conceptoPanel}>
          <div className={styles.panelHeader}>
            <h2>📊 Regresión a la Media: ¿El castigo funciona?</h2>
            <p className={styles.panelIntro}>
              Los estudiantes que sacaron un 10 en el primer examen tienden a sacar menos en el segundo,
              no porque empeoraron — es que la nota extrema tenía componente de suerte.
            </p>
          </div>

          <div className={styles.tablaRegresion}>
            <div className={styles.tablaRegresionHeader}>
              <span>Estudiante</span>
              <span>Examen 1</span>
              <span>Cambio</span>
              <span>Examen 2</span>
            </div>
            {estudiantes.map((est) => {
              const diferencia = est.nota2 - est.nota1;
              const hacia = diferencia > 0 ? 'subio' : diferencia < 0 ? 'bajo' : 'igual';
              return (
                <div key={est.nombre} className={styles.tablaRegresionFila}>
                  <span className={styles.nombreEstudiante}>{est.nombre}</span>
                  <span className={styles.nota}>{est.nota1}/10</span>
                  <span className={`${styles.flecha} ${styles[`flecha_${hacia}`]}`}>
                    {diferencia > 0 ? `▲ +${diferencia}` : diferencia < 0 ? `▼ ${diferencia}` : '● ='}
                  </span>
                  <span className={styles.nota}>{est.nota2}/10</span>
                </div>
              );
            })}
          </div>

          <button
            className={styles.btnPrimario}
            onClick={() => setEstudiantes(generarEstudiantes())}
          >
            Nuevo experimento
          </button>

          <div className={styles.ejemplosCotidianos}>
            <h3>Ejemplos cotidianos de regresión a la media</h3>
            <div className={styles.tarjetasGrid}>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>🏆</span>
                <p>El mejor jugador de un torneo suele jugar peor en el siguiente — la actuación excepcional tenía parte de suerte.</p>
              </div>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>📈</span>
                <p>Las acciones que más subieron este año tienden a bajar el siguiente año. Los mercados revierten a la media.</p>
              </div>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>🏥</span>
                <p>Pacientes que van al médico cuando están muy mal — mejoran solos aunque no cambien el tratamiento.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────── */}
      {/* BLOQUE 3: Paradoja de Simpson              */}
      {/* ────────────────────────────────────────── */}
      {conceptoActivo === 'simpson' && (
        <section className={styles.conceptoPanel}>
          <div className={styles.panelHeader}>
            <h2>🔄 Paradoja de Simpson: Los números mienten (sin mentir)</h2>
            <p className={styles.panelIntro}>
              Caso real: admisiones en UC Berkeley (1973). Los datos globales parecen mostrar discriminación,
              pero al desagregar por departamento la conclusión se invierte.
            </p>
          </div>

          <div className={styles.toggleVista}>
            <button
              className={`${styles.toggleBtn} ${vistaGlobal ? styles.toggleBtnActivo : ''}`}
              onClick={() => setVistaGlobal(true)}
            >
              Vista global
            </button>
            <button
              className={`${styles.toggleBtn} ${!vistaGlobal ? styles.toggleBtnActivo : ''}`}
              onClick={() => setVistaGlobal(false)}
            >
              Vista por departamento
            </button>
          </div>

          {vistaGlobal ? (
            <div className={styles.simpsonGlobal}>
              <h3>Tasa de admisión global — ¿Discriminación?</h3>
              <div className={styles.barrasComparacion}>
                <div className={styles.barraItem}>
                  <span className={styles.barraLabel}>Hombres</span>
                  <div className={styles.barraContenedor}>
                    <div className={styles.barraRelleno} style={{ width: '45%', backgroundColor: '#2E86AB' }} />
                  </div>
                  <span className={styles.barraPorcentaje}>45%</span>
                </div>
                <div className={styles.barraItem}>
                  <span className={styles.barraLabel}>Mujeres</span>
                  <div className={styles.barraContenedor}>
                    <div className={styles.barraRelleno} style={{ width: '30%', backgroundColor: '#E57373' }} />
                  </div>
                  <span className={styles.barraPorcentaje}>30%</span>
                </div>
              </div>
              <p className={styles.preguntaSimpson}>
                ¿Berkeley discrimina a las mujeres? Cambia a la vista por departamento para descubrir la verdad.
              </p>
            </div>
          ) : (
            <div className={styles.simpsonDetalle}>
              <h3>Tasa de admisión por departamento — La paradoja</h3>
              <div className={styles.tablaSimpson}>
                <div className={styles.tablaSimpsonHeader}>
                  <span>Departamento</span>
                  <span>Hombres aceptados</span>
                  <span>Mujeres aceptadas</span>
                </div>
                <div className={styles.tablaSimpsonFila}>
                  <span>
                    <strong>Ingeniería</strong>
                    <small> (fácil, muchos hombres)</small>
                  </span>
                  <span className={styles.celdaH}>80%</span>
                  <span className={styles.celdaM}>82% ✓</span>
                </div>
                <div className={styles.tablaSimpsonFila}>
                  <span>
                    <strong>Humanidades</strong>
                    <small> (difícil, muchas mujeres)</small>
                  </span>
                  <span className={styles.celdaH}>20%</span>
                  <span className={styles.celdaM}>22% ✓</span>
                </div>
              </div>
              <p className={styles.revelacionSimpson}>
                Las mujeres son aceptadas a <strong>mayor tasa en cada departamento</strong>.
                La paradoja surge porque las mujeres solicitaban masivamente a los departamentos más competitivos,
                lo que redujo su tasa global — no la discriminación.
              </p>
            </div>
          )}

          <p className={styles.mensajeClave}>
            <strong>Clave:</strong> Agregar datos puede invertir la conclusión.
            Siempre pregunta: <em>¿hay una variable oculta que explica el patrón?</em>
          </p>
        </section>
      )}

      {/* ────────────────────────────────────────── */}
      {/* BLOQUE 4: Sesgo de supervivencia           */}
      {/* ────────────────────────────────────────── */}
      {conceptoActivo === 'supervivencia' && (
        <section className={styles.conceptoPanel}>
          <div className={styles.panelHeader}>
            <h2>✈️ Sesgo de Supervivencia: Lo que no ves importa</h2>
            <p className={styles.panelIntro}>
              Durante la II Guerra Mundial, los ingenieros querían reforzar las zonas con más impactos
              en los aviones que regresaban. El estadístico Abraham Wald les dijo que estaban equivocados.
            </p>
          </div>

          {/* SVG del avión simplificado */}
          <div className={styles.avionContenedor}>
            <svg
              viewBox="0 0 400 220"
              className={styles.avionSvg}
              aria-label="Diagrama de avión mostrando zonas de impacto"
              role="img"
            >
              {/* Fuselaje */}
              <rect x="80" y="90" width="240" height="40" rx="20" fill="#B0BEC5" />
              {/* Nariz */}
              <ellipse cx="80" cy="110" rx="30" ry="20" fill="#90A4AE" />
              {/* Cola vertical */}
              <polygon points="300,110 320,60 340,110" fill="#78909C" />
              {/* Ala izquierda */}
              <polygon points="160,110 200,110 190,50 155,110" fill="#90A4AE" />
              {/* Ala derecha */}
              <polygon points="160,110 200,110 190,170 155,110" fill="#90A4AE" />

              {/* Zonas con muchos impactos (sobrevivieron) - naranja */}
              <circle cx="130" cy="110" r="8" fill="#FF8F00" opacity="0.85" />
              <circle cx="165" cy="105" r="7" fill="#FF8F00" opacity="0.8" />
              <circle cx="165" cy="115" r="7" fill="#FF8F00" opacity="0.8" />
              <circle cx="200" cy="100" r="7" fill="#FF8F00" opacity="0.8" />
              <circle cx="195" cy="118" r="6" fill="#FF8F00" opacity="0.75" />
              <circle cx="230" cy="108" r="7" fill="#FF8F00" opacity="0.8" />
              <circle cx="260" cy="95" r="6" fill="#FF8F00" opacity="0.75" />
              <circle cx="255" cy="122" r="6" fill="#FF8F00" opacity="0.75" />

              {/* Zonas vulnerables (los que no volvieron) - rojo */}
              <circle cx="310" cy="85" r="9" fill="#C62828" opacity="0.9" />
              <circle cx="90" cy="108" r="8" fill="#C62828" opacity="0.85" />

              {/* Etiquetas */}
              <text x="200" y="200" textAnchor="middle" fontSize="11" fill="currentColor" fontFamily="sans-serif">
                Naranja = muchos impactos (sobrevivieron) · Rojo = zonas vulnerables (no volvieron)
              </text>
            </svg>
          </div>

          <div className={styles.avionExplicacion}>
            <p>
              <strong>La trampa del razonamiento:</strong> Los ingenieros solo veían los aviones que
              <em> regresaban</em>. Las zonas sin impactos en esos aviones eran precisamente donde
              los aviones <em>derribados</em> recibían los disparos fatales — y esos nunca volvieron
              para mostrar sus heridas.
            </p>
            <p>
              <strong>La solución de Wald:</strong> Reforzar las zonas <em>sin</em> impactos,
              no las que tenían más.
            </p>
          </div>

          <div className={styles.ejemplosCotidianos}>
            <h3>Sesgo de supervivencia en la vida cotidiana</h3>
            <div className={styles.tarjetasGrid}>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>📚</span>
                <p><strong>Libros de emprendedores exitosos:</strong> No ves el 95% que fracasó con la misma estrategia descrita en el libro.</p>
              </div>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>💊</span>
                <p><strong>Medicamentos en el mercado:</strong> No ves los miles que fallaron en ensayos clínicos o fueron retirados.</p>
              </div>
              <div className={styles.tarjetaCasual}>
                <span aria-hidden="true" className={styles.tarjetaIcono}>🏋️</span>
                <p><strong>El gimnasio en enero:</strong> En marzo solo quedan los que sí les funcionó — no los que lo dejaron.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────── */}
      {/* BLOQUE 5: Ley de los grandes números       */}
      {/* ────────────────────────────────────────── */}
      {conceptoActivo === 'grandesNumeros' && (
        <section className={styles.conceptoPanel}>
          <div className={styles.panelHeader}>
            <h2>🎰 Ley de los Grandes Números: ¿Es el casino justo?</h2>
            <p className={styles.panelIntro}>
              Con pocos lanzamientos de moneda, el resultado parece muy variable.
              Con miles de lanzamientos, la proporción converge inevitablemente hacia el 50%.
            </p>
          </div>

          <div className={styles.simuladorMoneda}>
            <div className={styles.simuladorStats}>
              <div className={styles.statBox}>
                <span className={styles.statValor}>{totalLanzamientos.toLocaleString('es-ES')}</span>
                <span className={styles.statLabel}>Lanzamientos</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValor}>{caras.toLocaleString('es-ES')}</span>
                <span className={styles.statLabel}>Caras</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValor}>{croces.toLocaleString('es-ES')}</span>
                <span className={styles.statLabel}>Cruces</span>
              </div>
              <div className={`${styles.statBox} ${styles.statBoxDestacado}`}>
                <span className={styles.statValor}>{pctCaras}%</span>
                <span className={styles.statLabel}>% de caras</span>
              </div>
            </div>

            <div className={styles.botonesMoneda}>
              <button className={styles.btnPrimario} onClick={() => lanzarMonedas(10)}>
                Lanzar 10 veces
              </button>
              <button className={styles.btnSecundario} onClick={() => lanzarMonedas(100)}>
                Lanzar 100 veces
              </button>
              <button className={styles.btnSecundario} onClick={() => lanzarMonedas(1000)}>
                Lanzar 1.000 veces
              </button>
              <button className={styles.btnReset} onClick={reiniciarMoneda}>
                Reiniciar
              </button>
            </div>

            {historiaMoneda.length > 0 && (
              <div className={styles.chartContainer}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}

            {historiaMoneda.length === 0 && (
              <div className={styles.chartPlaceholder}>
                <p>Pulsa un botón para empezar a lanzar monedas y ver cómo la proporción converge al 50%</p>
              </div>
            )}
          </div>

          <p className={styles.mensajeClave}>
            <strong>El casino:</strong> Solo necesita que juegues muchas veces.
            Con ventaja del 2,7% en la ruleta, la ley de los grandes números garantiza que a largo plazo
            siempre gana el casino — no tú.
          </p>
        </section>
      )}

      {/* ────────────────────────────────────────── */}
      {/* Sección educativa                          */}
      {/* ────────────────────────────────────────── */}
      <EducationalSection title="¿Por qué nos falla la intuición estadística?" subtitle="Kahneman, sesgos cognitivos y cómo pensar mejor con datos">
        <h3>El sesgo de representatividad (Kahneman y Tversky)</h3>
        <p>
          Nuestro cerebro evalúa la probabilidad de un evento según cuánto se parece a un
          prototipo, no según su frecuencia real. Pensamos que una persona con gafas y libros
          es más probable que sea bibliotecaria que conductora de camión — ignorando que hay
          200 veces más conductores que bibliotecarios.
        </p>

        <h3>¿Cuándo confiar en un estudio estadístico?</h3>
        <p>Antes de aceptar un resultado estadístico, pregúntate:</p>
        <ul>
          <li><strong>¿El tamaño de muestra es suficiente?</strong> Un estudio con 30 personas raramente es generalizable.</li>
          <li><strong>¿Hay variables de confusión?</strong> La Paradoja de Simpson muestra que siempre puede haber factores ocultos.</li>
          <li><strong>¿Quién sobrevivió para contar la historia?</strong> El sesgo de supervivencia deforma muchos estudios de éxito.</li>
          <li><strong>¿Correlación o causalidad?</strong> El número de piratas correlaciona con el calentamiento global — no son causa y efecto.</li>
        </ul>

        <h3>El tamaño de muestra y por qué importa</h3>
        <p>
          Con 10 lanzamientos de moneda, es completamente normal obtener 7 caras (70%).
          Con 1.000 lanzamientos, obtener 700 caras (70%) sería estadísticamente imposible.
          El mismo porcentaje tiene significados completamente distintos según el tamaño de muestra.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Nota importante:</strong> La estadística describe <em>poblaciones</em>, no individuos.
          Un riesgo del 80% no significa que a ti te vaya a pasar — significa que de 100 personas
          en tu situación, a 80 les ocurrirá. Tú eres siempre un individuo, no una estadística.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-estadistica-cotidiana')} />
      <ShareCard appName="visualizador-estadistica-cotidiana" />
      <Footer appName="visualizador-estadistica-cotidiana" />
    </div>
  );
}
