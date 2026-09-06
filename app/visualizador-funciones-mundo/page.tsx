'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './VisualizadorFuncionesMundo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import Chart from 'chart.js/auto';
import {
  CASOS,
  TOTAL_CASOS,
  comprobarRespuesta,
  generarEjercicioAleatorio,
  nombreFamilia,
  type Comprobacion,
  type EjercicioFuncion,
  type SugerenciaGrafica,
} from './casos';

// ─────────────────────────────────────────────
// Funciones
// ─────────────────────────────────────────────

type FuncionId = 'lineal' | 'exponencial' | 'logaritmica' | 'cuadratica';

interface FuncionInfo {
  id: FuncionId;
  nombre: string;
  icono: string;
  color: string;
  formula: string;
  ejemploReal: string;
  explicacion: string;
  datoSorprendente: string;
}

const FUNCIONES: FuncionInfo[] = [
  {
    id: 'lineal',
    nombre: 'Lineal',
    icono: '📏',
    color: '#2E86AB',
    formula: 'y = mx + b',
    ejemploReal: 'Tu sueldo crece 1.500 €/año → lineal. Si ganas 25.000 € hoy, en 10 años ganarás 40.000 €. Crecimiento constante, predecible.',
    explicacion: 'Crece siempre al mismo ritmo. Cada unidad de x añade la misma cantidad de y. Es la función más intuitiva: "tanto más trabajo, tanto más gano".',
    datoSorprendente: 'El crecimiento lineal es lo que esperamos intuitivamente. Pero en la naturaleza y la economía, los crecimientos realmente importantes son exponenciales — por eso nos pillan desprevenidos.',
  },
  {
    id: 'exponencial',
    nombre: 'Exponencial',
    icono: '🚀',
    color: '#e74c3c',
    formula: 'y = a · bˣ',
    ejemploReal: 'Un virus con R=2: 1 persona infecta a 2, que infectan a 4, que infectan a 8... En 30 ciclos: más de 1.000 millones. Así empezó el COVID.',
    explicacion: 'Crece cada vez más rápido. Al principio parece lento (1, 2, 4, 8) pero de repente explota (512, 1.024, 2.048). El interés compuesto y las pandemias siguen este patrón.',
    datoSorprendente: 'Si doblas un papel 42 veces (imposible físicamente, pero como ejercicio), su grosor llegaría de la Tierra a la Luna. Eso es crecimiento exponencial.',
  },
  {
    id: 'logaritmica',
    nombre: 'Logarítmica',
    icono: '🔊',
    color: '#27ae60',
    formula: 'y = log(x)',
    ejemploReal: 'La escala Richter de terremotos: un sismo de magnitud 6 es 10× más potente que uno de 5, y 100× más que uno de 4. Lo mismo con los decibelios del sonido.',
    explicacion: 'Lo contrario de la exponencial: crece mucho al principio y luego se estanca. Es la función de "rendimientos decrecientes" — cada mejora cuesta más esfuerzo.',
    datoSorprendente: 'Si el oído humano no fuera logarítmico, el sonido de un concierto de rock te parecería solo 2-3 veces más fuerte que una conversación normal, cuando en realidad es un millón de veces más intenso.',
  },
  {
    id: 'cuadratica',
    nombre: 'Cuadrática',
    icono: '🏀',
    color: '#9b59b6',
    formula: 'y = ax² + bx + c',
    ejemploReal: 'La trayectoria de un balón: sube, alcanza el punto máximo y baja. La distancia de frenado de un coche: a doble velocidad, 4 veces más distancia.',
    explicacion: 'Forma de parábola (U o U invertida). Aparece en física (caída libre, trayectorias), en el frenado de vehículos, y en la relación entre esfuerzo y resultado cuando hay un punto óptimo.',
    datoSorprendente: 'A 120 km/h necesitas 4 veces más distancia para frenar que a 60 km/h (no el doble). Por eso los límites de velocidad importan tanto — la relación es cuadrática.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFuncionesMundoPage() {
  const [funcionActiva, setFuncionActiva] = useState<FuncionId>('lineal');
  const [parametro, setParametro] = useState(5);

  // Casos numerados para clase
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Comprobacion>>({});
  const [solucionesAbiertas, setSolucionesAbiertas] = useState<Record<number, boolean>>({});

  // Práctica aleatoria
  const [ejercicio, setEjercicio] = useState<EjercicioFuncion | null>(null);
  const [respuestaAleatoria, setRespuestaAleatoria] = useState('');
  const [veredictoAleatorio, setVeredictoAleatorio] = useState<Comprobacion | null>(null);
  const [solucionAleatoriaAbierta, setSolucionAleatoriaAbierta] = useState(false);

  const funcion = FUNCIONES.find(f => f.id === funcionActiva)!;

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const zonaGraficaRef = useRef<HTMLDivElement>(null);

  const datosGrafico = useMemo(() => {
    const xs = Array.from({ length: 51 }, (_, i) => i * 0.4); // 0 a 20
    const calcular = (x: number): number => {
      switch (funcionActiva) {
        case 'lineal': return parametro * x;
        case 'exponencial': return Math.pow(1 + parametro / 10, x);
        case 'logaritmica': return parametro * Math.log(x + 1);
        case 'cuadratica': return parametro * 0.1 * x * x;
      }
    };
    return { xs, ys: xs.map(calcular) };
  }, [funcionActiva, parametro]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datosGrafico.xs.map(x => formatNumber(x, 1)),
        datasets: [{
          label: funcion.nombre,
          data: datosGrafico.ys,
          borderColor: funcion.color,
          backgroundColor: `${funcion.color}15`,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: { parsed: { x: number | null; y: number | null } }) =>
                `x=${formatNumber(ctx.parsed.x ?? 0, 1)} → y=${formatNumber(ctx.parsed.y ?? 0, 1)}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'x' }, ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: 'y' }, beginAtZero: true },
        },
      },
    } as never);

    return () => { chartInstanceRef.current?.destroy(); chartInstanceRef.current = null; };
  }, [datosGrafico, funcion]);

  // Parámetro labels según función
  const paramLabel = funcionActiva === 'lineal' ? 'Pendiente (m)' :
    funcionActiva === 'exponencial' ? 'Tasa de crecimiento' :
    funcionActiva === 'logaritmica' ? 'Factor de escala' : 'Coeficiente (a)';

  // ─────────────────────────────────────────────
  // Casos numerados: corrección, solución y práctica
  // ─────────────────────────────────────────────

  const resueltos = useMemo(
    () => Object.values(veredictos).filter(v => v.correcto).length,
    [veredictos],
  );

  const comprobarCaso = (id: number, esperado: number) => {
    // parseSpanishNumber admite coma o punto y devuelve NaN si no es un número:
    // por eso no hace falta validar antes, solo mirar el motivo del veredicto.
    const valor = parseSpanishNumber(respuestas[id] ?? '');
    setVeredictos(previos => ({ ...previos, [id]: comprobarRespuesta(valor, esperado) }));
  };

  const alternarSolucion = (id: number) => {
    setSolucionesAbiertas(previas => ({ ...previas, [id]: !previas[id] }));
  };

  const reiniciarCasos = () => {
    setRespuestas({});
    setVeredictos({});
    setSolucionesAbiertas({});
  };

  // Coloca la gráfica de arriba en la familia del caso. Es la segunda mitad de la tarea:
  // resolver el número y luego reconocer la forma que ese número describe.
  const verEnGrafica = (sugerencia: SugerenciaGrafica) => {
    setFuncionActiva(sugerencia.funcion);
    setParametro(sugerencia.parametro);
    const sinMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    zonaGraficaRef.current?.scrollIntoView({
      behavior: sinMovimiento ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  // Nunca durante el render: sin semilla, servidor y navegador darían ejercicios distintos.
  const nuevoEjercicio = () => {
    setEjercicio(generarEjercicioAleatorio());
    setRespuestaAleatoria('');
    setVeredictoAleatorio(null);
    setSolucionAleatoriaAbierta(false);
  };

  const comprobarAleatorio = () => {
    if (!ejercicio) return;
    setVeredictoAleatorio(
      comprobarRespuesta(parseSpanishNumber(respuestaAleatoria), ejercicio.respuesta),
    );
  };

  const textoVeredicto = (veredicto: Comprobacion, respuestaTexto: string, etiqueta: string) => {
    if (veredicto.motivo === 'no-numerico') {
      return 'Eso no es un número. Escribe solo la cifra, con coma o punto decimal (por ejemplo 12,5).';
    }
    if (veredicto.correcto) {
      return `Correcto: ${respuestaTexto} ${etiqueta}.`;
    }
    return `Todavía no. La respuesta correcta es ${respuestaTexto} ${etiqueta}. Abre la solución para ver dónde se tuerce la cuenta.`;
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>Funciones que Gobiernan el Mundo</h1>
          <p className={styles.subtitle}>4 funciones matemáticas que explican casi todo lo que te rodea</p>
        </header>
        <LegalNotice />

        {/* Selector de función */}
        <div className={styles.funcionesNav}>
          {FUNCIONES.map(f => (
            <button key={f.id} type="button"
              className={`${styles.funcionBtn} ${funcionActiva === f.id ? styles.funcionActiva : ''}`}
              onClick={() => setFuncionActiva(f.id)}
              style={{ borderColor: funcionActiva === f.id ? f.color : undefined }}
              aria-pressed={funcionActiva === f.id}>
              <span className={styles.funcionIcono} aria-hidden="true">{f.icono}</span>
              <span className={styles.funcionNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>

        {/* Info de la función */}
        <div className={styles.funcionInfo} style={{ borderLeftColor: funcion.color }}>
          <div className={styles.formulaCard}>
            <span className={styles.formulaTexto}>{funcion.formula}</span>
          </div>
          <p className={styles.funcionExplicacion}>{funcion.explicacion}</p>
        </div>

        {/* Slider de parámetro */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>{paramLabel}</label>
            <span className={styles.sliderValor}>{parametro}</span>
          </div>
          <input type="range" className={styles.slider}
            min={1} max={10} value={parametro}
            onChange={(e) => setParametro(parseInt(e.target.value))}
            aria-label={`${paramLabel}: ${parametro}`} />
        </div>

        {/* Gráfico */}
        <div className={styles.chartContainer} ref={zonaGraficaRef}>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} aria-label={`Gráfico de función ${funcion.nombre}`} />
          </div>
        </div>

        {/* Ejemplo real */}
        <div className={styles.ejemploReal}>
          <h3 className={styles.ejemploTitulo}>En el mundo real</h3>
          <p className={styles.ejemploTexto}>{funcion.ejemploReal}</p>
        </div>

        <div className={styles.datoSorprendente}>
          <span className={styles.datoLabel}>Dato sorprendente</span>
          <p>{funcion.datoSorprendente}</p>
        </div>

        {/* Comparativa */}
        <div className={styles.comparativaCard}>
          <h3 className={styles.comparativaTitulo}>¿Cuál crece más rápido?</h3>
          <p className={styles.comparativaTexto}>
            Al principio, lineal y exponencial se parecen. Pero a largo plazo, <strong>la exponencial siempre gana</strong>.
            Si x=10: lineal(10)=50, cuadrática(10)=100, exponencial(10)=~1.594. A x=20 la exponencial vale ~190.000.
            La logarítmica es la más &quot;tranquila&quot;: log(20)≈15.
          </p>
          <div className={styles.comparativaGrid}>
            {FUNCIONES.map(f => (
              <div key={f.id} className={styles.comparativaItem} style={{ borderTopColor: f.color }}>
                <span className={styles.comparativaIcono} aria-hidden="true">{f.icono}</span>
                <span className={styles.comparativaNombre}>{f.nombre}</span>
                <span className={styles.comparativaCrece}>{
                  f.id === 'lineal' ? 'Constante' :
                  f.id === 'exponencial' ? 'Cada vez más rápido' :
                  f.id === 'logaritmica' ? 'Cada vez más lento' :
                  'Acelerado (parábola)'
                }</span>
              </div>
            ))}
          </div>
        </div>

        {/* Casos numerados asignables */}
        <section className={styles.casosSeccion} aria-labelledby="casos-titulo">
          <h2 className={styles.casosTitulo} id="casos-titulo">
            <span aria-hidden="true">📝</span> Casos para clase
          </h2>

          <p className={styles.casosIntro}>
            {TOTAL_CASOS} casos fijos y numerados: el caso 3 es el mismo para cualquiera que abra
            esta página, hoy y dentro de un año. Así un encargo del tipo «entra y resuelve el 3, el
            7 y el 11» significa lo mismo para toda la clase. Cada caso pide <strong>un solo
            número</strong>, con su unidad indicada bajo el campo.
          </p>
          <p className={styles.casosNota}>
            El botón «Ver esta función en la gráfica» coloca arriba la familia del caso con el
            parámetro más parecido. La gráfica dibuja siempre la versión más simple y creciente de
            cada familia, así que sirve para comparar la <strong>forma</strong> del crecimiento, no
            para leer el resultado del caso.
          </p>

          <div className={styles.casosContador}>
            <p className={styles.casosContadorTexto} aria-live="polite">
              Has resuelto <strong>{resueltos}</strong> de {TOTAL_CASOS}
            </p>
            <div
              className={styles.casosBarra}
              role="progressbar"
              aria-valuenow={resueltos}
              aria-valuemin={0}
              aria-valuemax={TOTAL_CASOS}
              aria-label="Casos resueltos"
            >
              <div
                className={styles.casosRelleno}
                style={{ width: `${(resueltos / TOTAL_CASOS) * 100}%` }}
              />
            </div>
            <button type="button" className={styles.casoBtnSecundario} onClick={reiniciarCasos}>
              Empezar de nuevo
            </button>
          </div>

          <div className={styles.casosGrid}>
            {CASOS.map(caso => {
              const veredicto = veredictos[caso.id];
              const abierta = solucionesAbiertas[caso.id] === true;
              // En una const, TypeScript conserva el estrechamiento y no hace falta un `!`.
              const sugerencia = caso.grafica;
              return (
                <article key={caso.id} className={styles.casoCard}>
                  <div className={styles.casoCabecera}>
                    <span className={styles.casoNumero}>{caso.id}</span>
                    <h3 className={styles.casoTituloCard}>{caso.titulo}</h3>
                    <span className={styles.casoEtiqueta}>
                      {caso.categoria === 'abstracto' ? 'Cálculo directo' : 'Situación real'}
                    </span>
                  </div>

                  <p className={styles.casoFamilia}>
                    Función {nombreFamilia(caso.tipoFuncion)}
                    <code className={styles.casoExpresion}>{caso.expresion}</code>
                  </p>

                  <p className={styles.casoEnunciado}>{caso.enunciado}</p>

                  {caso.tabla !== null && (
                    <div className={styles.casoTablaWrap}>
                      <table className={styles.casoTabla}>
                        <caption className={styles.casoTablaCaption}>
                          Pares (x, y) del caso {caso.id}
                        </caption>
                        <tbody>
                          <tr>
                            <th scope="row">x</th>
                            {caso.tabla.map(punto => (
                              <td key={`x-${punto.x}`}>{formatNumber(punto.x, 0)}</td>
                            ))}
                          </tr>
                          <tr>
                            <th scope="row">y</th>
                            {caso.tabla.map(punto => (
                              <td key={`y-${punto.x}`}>{formatNumber(punto.y, 0)}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className={styles.casoCampo}>
                    <label className={styles.casoEtiquetaCampo} htmlFor={`respuesta-caso-${caso.id}`}>
                      Tu respuesta en {caso.etiquetaRespuesta}
                      {caso.requiereRedondeo ? ' (redondea a 2 decimales)' : ''}
                    </label>
                    <input
                      id={`respuesta-caso-${caso.id}`}
                      className={styles.casoInput}
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="Escribe solo el número"
                      value={respuestas[caso.id] ?? ''}
                      onChange={e =>
                        setRespuestas(previas => ({ ...previas, [caso.id]: e.target.value }))
                      }
                    />
                  </div>

                  <div className={styles.casoAcciones}>
                    <button
                      type="button"
                      className={styles.casoBtnPrimario}
                      onClick={() => comprobarCaso(caso.id, caso.respuesta)}
                    >
                      Comprobar
                    </button>
                    <button
                      type="button"
                      className={styles.casoBtnSecundario}
                      aria-expanded={abierta}
                      aria-controls={`solucion-caso-${caso.id}`}
                      onClick={() => alternarSolucion(caso.id)}
                    >
                      {abierta ? 'Ocultar solución' : 'Ver solución'}
                    </button>
                    {sugerencia !== null && (
                      <button
                        type="button"
                        className={styles.casoBtnGrafica}
                        onClick={() => verEnGrafica(sugerencia)}
                      >
                        <span aria-hidden="true">📈</span> Ver esta función en la gráfica
                      </button>
                    )}
                  </div>

                  {veredicto !== undefined && (
                    <p
                      className={`${styles.casoFeedback} ${veredicto.correcto ? styles.casoFeedbackOk : styles.casoFeedbackKo}`}
                      role="alert"
                      aria-live="polite"
                    >
                      <span aria-hidden="true">{veredicto.correcto ? '✅' : '❌'}</span>{' '}
                      {textoVeredicto(veredicto, caso.respuestaTexto, caso.etiquetaRespuesta)}
                    </p>
                  )}

                  <div id={`solucion-caso-${caso.id}`} hidden={!abierta}>
                    <div className={styles.casoSolucion}>
                      <p className={styles.casoPista}>
                        <span aria-hidden="true">💡</span> {caso.pista}
                      </p>
                      <ol className={styles.casoPasos}>
                        {caso.pasos.map((paso, indice) => (
                          <li key={indice} className={styles.casoPaso}>
                            {paso}
                          </li>
                        ))}
                      </ol>
                      <p className={styles.casoResultado}>
                        Resultado: <strong>{caso.respuestaTexto}</strong> {caso.etiquetaRespuesta}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Práctica sin final */}
          <div className={styles.casoAleatorio}>
            <h3 className={styles.casoAleatorioTitulo}>Práctica sin final</h3>
            <p className={styles.casosNota}>
              Cuando los {TOTAL_CASOS} casos se queden cortos, este botón inventa uno nuevo cada
              vez, de cualquiera de las cuatro familias y con la solución explicada igual que los
              demás.
            </p>
            <button type="button" className={styles.casoBtnPrimario} onClick={nuevoEjercicio}>
              <span aria-hidden="true">🎲</span> Ejercicio aleatorio
            </button>

            {ejercicio !== null && (
              <div className={styles.casoAleatorioCaja}>
                <p className={styles.casoFamilia}>
                  Función {nombreFamilia(ejercicio.tipoFuncion)}
                  <code className={styles.casoExpresion}>{ejercicio.expresion}</code>
                </p>
                <p className={styles.casoEnunciado}>{ejercicio.enunciado}</p>

                <div className={styles.casoCampo}>
                  <label className={styles.casoEtiquetaCampo} htmlFor="respuesta-aleatoria">
                    Tu respuesta en {ejercicio.etiquetaRespuesta}
                    {ejercicio.requiereRedondeo ? ' (redondea a 2 decimales)' : ''}
                  </label>
                  <input
                    id="respuesta-aleatoria"
                    className={styles.casoInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Escribe solo el número"
                    value={respuestaAleatoria}
                    onChange={e => setRespuestaAleatoria(e.target.value)}
                  />
                </div>

                <div className={styles.casoAcciones}>
                  <button
                    type="button"
                    className={styles.casoBtnPrimario}
                    onClick={comprobarAleatorio}
                  >
                    Comprobar
                  </button>
                  <button
                    type="button"
                    className={styles.casoBtnSecundario}
                    aria-expanded={solucionAleatoriaAbierta}
                    aria-controls="solucion-aleatoria"
                    onClick={() => setSolucionAleatoriaAbierta(!solucionAleatoriaAbierta)}
                  >
                    {solucionAleatoriaAbierta ? 'Ocultar solución' : 'Ver solución'}
                  </button>
                  <button
                    type="button"
                    className={styles.casoBtnGrafica}
                    onClick={() => verEnGrafica(ejercicio.grafica)}
                  >
                    <span aria-hidden="true">📈</span> Ver esta función en la gráfica
                  </button>
                </div>

                {veredictoAleatorio !== null && (
                  <p
                    className={`${styles.casoFeedback} ${veredictoAleatorio.correcto ? styles.casoFeedbackOk : styles.casoFeedbackKo}`}
                    role="alert"
                    aria-live="polite"
                  >
                    <span aria-hidden="true">{veredictoAleatorio.correcto ? '✅' : '❌'}</span>{' '}
                    {textoVeredicto(
                      veredictoAleatorio,
                      ejercicio.respuestaTexto,
                      ejercicio.etiquetaRespuesta,
                    )}
                  </p>
                )}

                <div id="solucion-aleatoria" hidden={!solucionAleatoriaAbierta}>
                  <div className={styles.casoSolucion}>
                    <ol className={styles.casoPasos}>
                      {ejercicio.pasos.map((paso, indice) => (
                        <li key={indice} className={styles.casoPaso}>
                          {paso}
                        </li>
                      ))}
                    </ol>
                    <p className={styles.casoResultado}>
                      Resultado: <strong>{ejercicio.respuestaTexto}</strong>{' '}
                      {ejercicio.etiquetaRespuesta}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más matemáticas → <a href="/visualizador-probabilidad/">Probabilidad</a> · <a href="/visualizador-dinero-y-tiempo/">El Dinero y el Tiempo</a> · <a href="/algebra-ecuaciones/">Álgebra y Ecuaciones</a>
        </div>

        <EducationalSection title="Funciones en tu día a día" subtitle="Dónde aparecen sin que lo sepas" defaultOpen={false}>
          <h3>La exponencial que no vimos: COVID-19</h3>
          <p>En enero de 2020, había 500 casos de COVID en el mundo. En marzo, 500.000. En mayo, 5 millones. El crecimiento exponencial es contraintuitivo: cuando los números son pequeños, parece &quot;controlable&quot;. Cuando se nota, ya es tarde.</p>
          <h3>Rendimientos decrecientes (logarítmica)</h3>
          <p>La primera hora de estudio rinde mucho. La cuarta hora, mucho menos. La octava, casi nada. Esto es una función logarítmica aplicada al aprendizaje. Por eso es mejor estudiar 1h durante 4 días que 4h de golpe.</p>
          <h3>La parábola del precio perfecto</h3>
          <p>Si un producto es demasiado barato, no se vende (la gente desconfía). Si es demasiado caro, tampoco. Hay un precio óptimo que maximiza ingresos — una parábola invertida. Encontrarlo es uno de los grandes retos del marketing.</p>
          <div className={styles.warningBox}><strong>Nota:</strong> las funciones aquí presentadas están simplificadas con fines educativos. En la realidad, los fenómenos suelen seguir combinaciones de funciones o tener condiciones de contorno que modifican su comportamiento.</div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-funciones-mundo')} />
        <ShareCard appName="visualizador-funciones-mundo" />
        <Footer appName="visualizador-funciones-mundo" />
    </div>
  );
}
