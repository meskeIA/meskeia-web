'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import styles from './VisualizadorIaRedesNeuronales.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

type SeccionId = 'neurona' | 'red' | 'entrenamiento' | 'tipos';
type FuncionActivacion = 'sigmoid' | 'relu' | 'tanh' | 'softmax';
type ArquitecturaId = 'mlp' | 'cnn' | 'rnn' | 'transformer' | 'gan' | 'autoencoder';

interface Arquitectura {
  id: ArquitecturaId;
  nombre: string;
  icono: string;
  casoUso: string;
  ejemplo: string;
  ventajas: string[];
  limitaciones: string[];
  descripcion: string;
}

const ARQUITECTURAS: Arquitectura[] = [
  {
    id: 'mlp',
    nombre: 'MLP',
    icono: '⬛',
    casoUso: 'Datos tabulares y clasificación general',
    ejemplo: 'Predicción de precios, detección de fraude',
    ventajas: ['Simple de implementar', 'Funciona bien con datos estructurados', 'Fácil de interpretar'],
    limitaciones: ['No captura relaciones espaciales', 'Requiere muchos parámetros', 'No maneja secuencias'],
    descripcion: 'Red densa clásica (Multilayer Perceptron). Cada neurona está conectada con todas las de la capa siguiente. Es la arquitectura base del deep learning.',
  },
  {
    id: 'cnn',
    nombre: 'CNN',
    icono: '🖼️',
    casoUso: 'Imágenes, vídeo y señales 1D/2D',
    ejemplo: 'ResNet, VGG, YOLO (detección objetos)',
    ventajas: ['Extrae características locales', 'Compartición de pesos (eficiente)', 'Invariante a traslación'],
    limitaciones: ['Requiere muchos datos etiquetados', 'Alto coste computacional', 'Sensible a rotaciones extremas'],
    descripcion: 'Red Convolucional (Convolutional Neural Network). Usa filtros que se deslizan sobre la imagen extrayendo características: bordes, texturas, formas, objetos.',
  },
  {
    id: 'rnn',
    nombre: 'RNN / LSTM',
    icono: '🔄',
    casoUso: 'Secuencias temporales y texto',
    ejemplo: 'Traducción automática, predicción bursátil',
    ventajas: ['Procesa secuencias de longitud variable', 'Memoria de estado oculto', 'LSTM resuelve el gradiente que desaparece'],
    limitaciones: ['Difícil de paralelizar', 'Memoria limitada en secuencias largas', 'Más lenta que los Transformers'],
    descripcion: 'Red Recurrente (RNN) y su variante Long Short-Term Memory (LSTM). Mantiene un estado oculto que actúa como memoria del contexto previo en una secuencia.',
  },
  {
    id: 'transformer',
    nombre: 'Transformer',
    icono: '🔤',
    casoUso: 'Texto, código, imágenes (Vision Transformer)',
    ejemplo: 'GPT-4, BERT, LLaMA, Stable Diffusion',
    ventajas: ['Paralelizable (muy rápido)', 'Captura dependencias a larga distancia', 'Escalable a miles de millones de parámetros'],
    limitaciones: ['Costoso en memoria (O(n²))', 'Necesita enormes datasets', 'Caja negra difícil de interpretar'],
    descripcion: 'Basado en mecanismo de atención (self-attention). Cada token puede "atender" a cualquier otro token del contexto simultáneamente. Base de todos los LLMs modernos.',
  },
  {
    id: 'gan',
    nombre: 'GAN',
    icono: '🎭',
    casoUso: 'Generación de imágenes, audio, datos sintéticos',
    ejemplo: 'StyleGAN, Stable Diffusion (componente), DeepFake',
    ventajas: ['Genera datos muy realistas', 'No necesita datos etiquetados', 'Aprendizaje no supervisado'],
    limitaciones: ['Entrenamiento inestable (colapso de modos)', 'Difícil de evaluar la calidad', 'Puede generar desinformación'],
    descripcion: 'Red Generativa Adversarial. Dos redes compiten: el Generador crea muestras falsas, el Discriminador intenta detectarlas. El juego empuja al generador hacia muestras más realistas.',
  },
  {
    id: 'autoencoder',
    nombre: 'Autoencoder',
    icono: '🔁',
    casoUso: 'Compresión, detección de anomalías, denoising',
    ejemplo: 'VAE (imágenes generativas), detección de fraude',
    ventajas: ['Aprende representaciones compactas', 'No supervisado', 'Útil para preprocesado de features'],
    limitaciones: ['Las representaciones pueden no ser interpretables', 'Calidad de reconstrucción limitada', 'VAE añade complejidad estadística'],
    descripcion: 'Aprende a comprimir datos (encoder) y reconstruirlos (decoder). La representación comprimida (latent space) captura las características esenciales del dato.',
  },
];

function calcularActivacion(x: number, fn: FuncionActivacion): number {
  switch (fn) {
    case 'sigmoid':
      return 1 / (1 + Math.exp(-x));
    case 'relu':
      return Math.max(0, x);
    case 'tanh':
      return Math.tanh(x);
    case 'softmax':
      // softmax de un solo valor (con contexto de 2 clases): e^x / (e^x + e^0)
      return Math.exp(x) / (Math.exp(x) + 1);
    default:
      return x;
  }
}

function obtenerColorActivacion(valor: number): string {
  const v = Math.min(1, Math.max(0, Math.abs(valor)));
  const r = Math.round(46 + (169 - 46) * v);
  const g = Math.round(134 + (72 - 134) * v);
  const b = Math.round(171 + (102 - 171) * v);
  return `rgb(${r}, ${g}, ${b})`;
}

// Nodos de la red neuronal para el diagrama
const CAPAS_RED = [
  { nombre: 'Entrada', neuronas: 3, color: '#2E86AB' },
  { nombre: 'Oculta 1', neuronas: 4, color: '#48A9A6' },
  { nombre: 'Oculta 2', neuronas: 4, color: '#48A9A6' },
  { nombre: 'Salida', neuronas: 2, color: '#7FB3D3' },
];

export default function VisualizadorIaRedesNeuronales() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('neurona');
  const [peso1, setPeso1] = useState<number>(0.5);
  const [peso2, setPeso2] = useState<number>(0.8);
  const [bias, setBias] = useState<number>(0.1);
  const [entrada1, setEntrada1] = useState<number>(1.0);
  const [entrada2, setEntrada2] = useState<number>(0.5);
  const [fnActivacion, setFnActivacion] = useState<FuncionActivacion>('sigmoid');
  const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [epoch, setEpoch] = useState<number>(0);
  const [loss, setLoss] = useState<number>(1.0);
  const [arquitecturaAbierta, setArquitecturaAbierta] = useState<ArquitecturaId | null>(null);

  const sumasPonderada = peso1 * entrada1 + peso2 * entrada2 + bias;
  const salidaNeurona = calcularActivacion(sumasPonderada, fnActivacion);

  const simularEpoch = useCallback(() => {
    setEpoch(prev => prev + 1);
    setLoss(prev => {
      const reduccion = learningRate * prev * (0.3 + Math.random() * 0.4);
      return Math.max(0.01, prev - reduccion);
    });
  }, [learningRate]);

  const resetearEntrenamiento = () => {
    setEpoch(0);
    setLoss(1.0);
  };

  const secciones: { id: SeccionId; label: string; icono: string }[] = [
    { id: 'neurona', label: 'Neurona', icono: '⚡' },
    { id: 'red', label: 'Arquitectura', icono: '🕸️' },
    { id: 'entrenamiento', label: 'Entrenamiento', icono: '📉' },
    { id: 'tipos', label: 'Tipos de IA', icono: '🗂️' },
  ];

  const funcionesActivacion: { id: FuncionActivacion; label: string; rango: string; uso: string }[] = [
    { id: 'sigmoid', label: 'Sigmoide', rango: '(0, 1)', uso: 'Clasificación binaria' },
    { id: 'relu', label: 'ReLU', rango: '[0, ∞)', uso: 'Capas ocultas (más común)' },
    { id: 'tanh', label: 'Tanh', rango: '(-1, 1)', uso: 'RNN, redes recurrentes' },
    { id: 'softmax', label: 'Softmax*', rango: '(0, 1)', uso: 'Clasificación multiclase' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🧠</div>
        <h1>Visualizador de Redes Neuronales e IA</h1>
        <p>Cómo aprende una IA: neuronas artificiales, capas, entrenamiento y backpropagation</p>
      </header>

      <LegalNotice />

      {/* Navegación por secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {secciones.map(s => (
          <button
            key={s.id}
            type="button"
            className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navBtnActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span aria-hidden="true">{s.icono}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <main className={styles.main}>

        {/* SECCIÓN 1: NEURONA */}
        {seccionActiva === 'neurona' && (
          <section className={styles.seccion} aria-label="La neurona artificial">
            <h2 className={styles.seccionTitulo}>La neurona artificial (perceptrón)</h2>
            <p className={styles.seccionDesc}>
              Ajusta los pesos, el bias y las entradas para ver cómo cambia la salida de la neurona según la función de activación.
            </p>

            <div className={styles.neuronaLayout}>
              {/* Panel de controles */}
              <div className={styles.controlesNeurona}>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Entrada x₁ = <strong>{entrada1.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range" min="-2" max="2" step="0.1"
                    value={entrada1}
                    onChange={e => setEntrada1(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor de entrada x1"
                  />
                </div>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Entrada x₂ = <strong>{entrada2.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range" min="-2" max="2" step="0.1"
                    value={entrada2}
                    onChange={e => setEntrada2(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor de entrada x2"
                  />
                </div>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Peso w₁ = <strong>{peso1.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range" min="-2" max="2" step="0.1"
                    value={peso1}
                    onChange={e => setPeso1(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Peso w1"
                  />
                </div>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Peso w₂ = <strong>{peso2.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range" min="-2" max="2" step="0.1"
                    value={peso2}
                    onChange={e => setPeso2(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Peso w2"
                  />
                </div>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Bias b = <strong>{bias.toFixed(2)}</strong>
                  </label>
                  <input
                    type="range" min="-2" max="2" step="0.1"
                    value={bias}
                    onChange={e => setBias(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Valor del bias"
                  />
                </div>

                <div className={styles.fnSelector}>
                  <p className={styles.controlLabel}>Función de activación:</p>
                  <div className={styles.fnGrid}>
                    {funcionesActivacion.map(fn => (
                      <button
                        key={fn.id}
                        type="button"
                        className={`${styles.fnBtn} ${fnActivacion === fn.id ? styles.fnBtnActivo : ''}`}
                        onClick={() => setFnActivacion(fn.id)}
                        aria-pressed={fnActivacion === fn.id}
                      >
                        <span className={styles.fnNombre}>{fn.label}</span>
                        <span className={styles.fnRango}>{fn.rango}</span>
                      </button>
                    ))}
                  </div>
                  <p className={styles.fnUso}>
                    Uso típico: <em>{funcionesActivacion.find(f => f.id === fnActivacion)?.uso}</em>
                  </p>
                </div>
              </div>

              {/* Diagrama SVG de la neurona */}
              <div className={styles.diagramaNeurona}>
                <svg viewBox="0 0 340 200" className={styles.svgNeurona} role="img" aria-label="Diagrama de neurona artificial">
                  {/* Entradas */}
                  <line x1="20" y1="60" x2="120" y2="100" stroke="#2E86AB" strokeWidth="2" />
                  <line x1="20" y1="140" x2="120" y2="100" stroke="#48A9A6" strokeWidth="2" />
                  {/* Labels entradas */}
                  <text x="22" y="55" fontSize="11" fill="currentColor">x₁={entrada1.toFixed(1)}</text>
                  <text x="22" y="155" fontSize="11" fill="currentColor">x₂={entrada2.toFixed(1)}</text>
                  {/* Labels pesos */}
                  <text x="52" y="74" fontSize="10" fill="#2E86AB">w₁={peso1.toFixed(1)}</text>
                  <text x="52" y="135" fontSize="10" fill="#48A9A6">w₂={peso2.toFixed(1)}</text>
                  {/* Soma (cuerpo neurona) */}
                  <circle
                    cx="140" cy="100" r="30"
                    fill={obtenerColorActivacion(salidaNeurona)}
                    stroke="#2E86AB" strokeWidth="2"
                  />
                  <text x="140" y="95" textAnchor="middle" fontSize="9" fill="white">Σ+b</text>
                  <text x="140" y="108" textAnchor="middle" fontSize="8" fill="white">{sumasPonderada.toFixed(2)}</text>
                  {/* Bias */}
                  <text x="140" y="145" textAnchor="middle" fontSize="10" fill="currentColor">b={bias.toFixed(1)}</text>
                  {/* Función activación */}
                  <rect x="185" y="80" width="60" height="40" rx="6" fill="var(--bg-card)" stroke="#48A9A6" strokeWidth="1.5" />
                  <text x="215" y="96" textAnchor="middle" fontSize="9" fill="#48A9A6">f(x)</text>
                  <text x="215" y="110" textAnchor="middle" fontSize="8" fill="currentColor">{fnActivacion}</text>
                  <line x1="170" y1="100" x2="185" y2="100" stroke="#48A9A6" strokeWidth="2" />
                  {/* Salida */}
                  <line x1="245" y1="100" x2="310" y2="100" stroke="#7FB3D3" strokeWidth="2" />
                  <circle cx="316" cy="100" r="16" fill={obtenerColorActivacion(salidaNeurona)} stroke="#7FB3D3" strokeWidth="2" />
                  <text x="316" y="104" textAnchor="middle" fontSize="9" fill="white">{salidaNeurona.toFixed(2)}</text>
                  <text x="270" y="90" fontSize="10" fill="#7FB3D3">salida</text>
                </svg>

                <div className={styles.formulaBox} role="math" aria-label="Fórmula de la neurona">
                  <div className={styles.formulaLinea}>
                    <span className={styles.formulaLabel}>Suma ponderada:</span>
                    <span className={styles.formulaValor}>
                      {peso1.toFixed(1)}×{entrada1.toFixed(1)} + {peso2.toFixed(1)}×{entrada2.toFixed(1)} + {bias.toFixed(1)} = <strong>{sumasPonderada.toFixed(3)}</strong>
                    </span>
                  </div>
                  <div className={styles.formulaLinea}>
                    <span className={styles.formulaLabel}>Activación {fnActivacion}:</span>
                    <span className={styles.formulaValor}>
                      f({sumasPonderada.toFixed(3)}) = <strong style={{ color: obtenerColorActivacion(salidaNeurona) }}>{salidaNeurona.toFixed(4)}</strong>
                    </span>
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <strong>¿Por qué se necesita la no-linealidad?</strong>
                  <p>Sin función de activación, toda la red sería equivalente a una única transformación lineal, incapaz de aprender patrones complejos.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 2: ARQUITECTURA DE RED */}
        {seccionActiva === 'red' && (
          <section className={styles.seccion} aria-label="Arquitectura de la red neuronal">
            <h2 className={styles.seccionTitulo}>Arquitectura: capas de una red neuronal</h2>
            <p className={styles.seccionDesc}>
              Haz clic en cualquier nodo para ver su función dentro de la red. Los colores indican el tipo de capa.
            </p>

            <div className={styles.redLayout}>
              <svg
                viewBox="0 0 480 260"
                className={styles.svgRed}
                role="img"
                aria-label="Diagrama de red neuronal multicapa"
              >
                {/* Conexiones entre capas */}
                {CAPAS_RED.map((capa, ci) => {
                  if (ci === CAPAS_RED.length - 1) return null;
                  const siguienteCapa = CAPAS_RED[ci + 1];
                  const x1 = 40 + ci * 130;
                  const x2 = 40 + (ci + 1) * 130;
                  return capa.neuronas > 0 ? Array.from({ length: capa.neuronas }).flatMap((_, ni) => {
                    const y1 = 40 + ni * (180 / (capa.neuronas - 1 || 1));
                    return Array.from({ length: siguienteCapa.neuronas }).map((_, nj) => {
                      const y2 = 40 + nj * (180 / (siguienteCapa.neuronas - 1 || 1));
                      const estaResaltado = nodoSeleccionado === `${ci}-${ni}` || nodoSeleccionado === `${ci + 1}-${nj}`;
                      return (
                        <line
                          key={`${ci}-${ni}-${ci + 1}-${nj}`}
                          x1={x1} y1={y1}
                          x2={x2} y2={y2}
                          stroke={estaResaltado ? '#2E86AB' : '#ccc'}
                          strokeWidth={estaResaltado ? 1.5 : 0.7}
                          strokeOpacity={estaResaltado ? 0.9 : 0.5}
                        />
                      );
                    });
                  }) : null;
                })}

                {/* Nodos */}
                {CAPAS_RED.map((capa, ci) =>
                  Array.from({ length: capa.neuronas }).map((_, ni) => {
                    const cx = 40 + ci * 130;
                    const cy = 40 + ni * (180 / (capa.neuronas - 1 || 1));
                    const id = `${ci}-${ni}`;
                    const seleccionado = nodoSeleccionado === id;
                    return (
                      <g key={id}>
                        <circle
                          cx={cx} cy={cy} r={seleccionado ? 14 : 11}
                          fill={seleccionado ? capa.color : 'var(--bg-card)'}
                          stroke={capa.color}
                          strokeWidth={seleccionado ? 3 : 2}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setNodoSeleccionado(seleccionado ? null : id)}
                          role="button"
                          aria-label={`Neurona ${ni + 1} de capa ${capa.nombre}`}
                        />
                        {seleccionado && (
                          <text cx={cx} cy={cy} textAnchor="middle" fontSize="9" fill="white" dy={3}>
                            n{ni + 1}
                          </text>
                        )}
                      </g>
                    );
                  })
                )}

                {/* Labels de capas */}
                {CAPAS_RED.map((capa, ci) => (
                  <text key={ci} x={40 + ci * 130} y={245} textAnchor="middle" fontSize="11" fill={capa.color} fontWeight="600">
                    {capa.nombre}
                  </text>
                ))}
                {CAPAS_RED.map((capa, ci) => (
                  <text key={`n-${ci}`} x={40 + ci * 130} y={258} textAnchor="middle" fontSize="9" fill="currentColor">
                    {capa.neuronas} neuronas
                  </text>
                ))}
              </svg>

              <div className={styles.infoRed}>
                {nodoSeleccionado ? (() => {
                  const [ci, ni] = nodoSeleccionado.split('-').map(Number);
                  const capa = CAPAS_RED[ci];
                  const descripcionesCapa: Record<string, string> = {
                    'Entrada': 'Recibe los datos brutos: píxeles, tokens, valores numéricos. Cada neurona corresponde a una característica del dato de entrada.',
                    'Oculta 1': 'Primera capa oculta. Aprende características de bajo nivel: bordes, patrones simples, correlaciones básicas entre entradas.',
                    'Oculta 2': 'Segunda capa oculta. Combina las características aprendidas por la capa anterior para detectar patrones más abstractos y complejos.',
                    'Salida': 'Genera la predicción final. En clasificación binaria, 1 neurona con sigmoide. En multiclase, N neuronas con softmax.',
                  };
                  return (
                    <div className={styles.nodoInfo}>
                      <div className={styles.nodoInfoHeader} style={{ borderColor: capa.color }}>
                        <span className={styles.nodoInfoTipo} style={{ color: capa.color }}>Capa {capa.nombre}</span>
                        <span className={styles.nodoInfoId}>Neurona {ni + 1} de {capa.neuronas}</span>
                      </div>
                      <p>{descripcionesCapa[capa.nombre]}</p>
                      <div className={styles.statsCapa}>
                        <span>Neuronas en esta capa: <strong>{capa.neuronas}</strong></span>
                        {ci > 0 && <span>Conexiones entrantes: <strong>{CAPAS_RED[ci - 1].neuronas}</strong></span>}
                        {ci < CAPAS_RED.length - 1 && <span>Conexiones salientes: <strong>{CAPAS_RED[ci + 1].neuronas}</strong></span>}
                      </div>
                    </div>
                  );
                })() : (
                  <div className={styles.nodoInfoPlaceholder}>
                    <span aria-hidden="true">👆</span>
                    <p>Haz clic en un nodo para ver su información</p>
                  </div>
                )}

                <div className={styles.leyendaRed}>
                  {CAPAS_RED.map((capa, i) => (
                    <div key={i} className={styles.leyendaItem}>
                      <span className={styles.leyendaDot} style={{ background: capa.color }} aria-hidden="true" />
                      <span>{capa.nombre}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.infoBox}>
                  <strong>Deep Learning = capas profundas</strong>
                  <p>GPT-4 tiene ~96 capas transformer y ~1,8 billones de parámetros (pesos + biases). Las capas superiores aprenden conceptos abstractos como gramática, lógica o hechos del mundo.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 3: ENTRENAMIENTO */}
        {seccionActiva === 'entrenamiento' && (
          <section className={styles.seccion} aria-label="Proceso de entrenamiento">
            <h2 className={styles.seccionTitulo}>Cómo aprende: forward pass + backpropagation</h2>
            <p className={styles.seccionDesc}>
              Ajusta el learning rate y simula épocas de entrenamiento para ver cómo evoluciona la función de pérdida.
            </p>

            <div className={styles.entrenamientoLayout}>
              <div className={styles.cicloEntrenamiento}>
                {[
                  { paso: '1', titulo: 'Forward Pass', desc: 'Los datos fluyen de entrada a salida. La red genera una predicción.', icono: '→', color: '#2E86AB' },
                  { paso: '2', titulo: 'Calcular Loss', desc: `Error actual: ${loss.toFixed(4)}. Mide la distancia entre predicción y valor real.`, icono: '📏', color: '#E07B39' },
                  { paso: '3', titulo: 'Backpropagation', desc: 'Se calcula el gradiente de la pérdida para cada peso usando la regla de la cadena.', icono: '←', color: '#48A9A6' },
                  { paso: '4', titulo: 'Gradient Descent', desc: `w = w − ${learningRate} × ∂L/∂w. Los pesos se ajustan en la dirección que reduce el error.`, icono: '⬇️', color: '#7FB3D3' },
                ].map(item => (
                  <div key={item.paso} className={styles.cicloItem} style={{ borderLeftColor: item.color }}>
                    <div className={styles.cicloNumero} style={{ background: item.color }} aria-hidden="true">
                      {item.icono}
                    </div>
                    <div>
                      <strong className={styles.cicloTitulo} style={{ color: item.color }}>{item.titulo}</strong>
                      <p className={styles.cicloDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.simuladorEntrenamiento}>
                <div className={styles.controlGrupo}>
                  <label className={styles.controlLabel}>
                    Learning rate (α) = <strong>{learningRate.toFixed(3)}</strong>
                  </label>
                  <input
                    type="range" min="0.001" max="1.0" step="0.001"
                    value={learningRate}
                    onChange={e => setLearningRate(parseFloat(e.target.value))}
                    className={styles.slider}
                    aria-label="Tasa de aprendizaje"
                  />
                  <p className={styles.lrInfo}>
                    {learningRate < 0.01
                      ? '⚠️ Muy bajo — convergencia lenta'
                      : learningRate > 0.5
                      ? '⚠️ Muy alto — puede oscilar o divergir'
                      : '✅ Rango adecuado para este ejemplo'}
                  </p>
                </div>

                <div className={styles.statsEntrenamiento}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Épocas</span>
                    <span className={styles.statValor}>{epoch}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Loss</span>
                    <span className={styles.statValor} style={{ color: loss < 0.1 ? '#48A9A6' : loss > 0.5 ? '#E07B39' : '#2E86AB' }}>
                      {loss.toFixed(4)}
                    </span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Precisión*</span>
                    <span className={styles.statValor}>{Math.min(99, Math.round((1 - loss) * 100))}%</span>
                  </div>
                </div>

                {/* Barra de progreso loss */}
                <div className={styles.lossBar} role="progressbar" aria-valuenow={Math.round((1 - loss) * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={styles.lossBarFill}
                    style={{ width: `${(1 - loss) * 100}%`, background: loss < 0.1 ? '#48A9A6' : '#2E86AB' }}
                  />
                </div>
                <p className={styles.lossBarLabel}>Progreso del entrenamiento: {Math.round((1 - loss) * 100)}%</p>

                <div className={styles.botonesSim}>
                  <button
                    type="button"
                    className={styles.btnSimular}
                    onClick={simularEpoch}
                    disabled={loss <= 0.01}
                    aria-label="Ejecutar una época de entrenamiento"
                  >
                    ▶ Ejecutar época {epoch + 1}
                  </button>
                  <button
                    type="button"
                    className={styles.btnReset}
                    onClick={resetearEntrenamiento}
                    aria-label="Reiniciar entrenamiento"
                  >
                    ↺ Reiniciar
                  </button>
                </div>

                <div className={styles.conceptosClave}>
                  <h3 className={styles.conceptosTitulo}>Conceptos clave</h3>
                  {[
                    { term: 'Batch size', def: 'Muestras procesadas antes de actualizar pesos. Más grande = más estable, más lento.' },
                    { term: 'Overfitting', def: 'Memoriza los datos de entrenamiento pero falla en datos nuevos. Solución: dropout, regularización.' },
                    { term: 'Epoch', def: 'Una pasada completa por todos los datos de entrenamiento.' },
                    { term: 'Transfer Learning', def: 'Usar un modelo preentrenado (ResNet, BERT) y ajustarlo a una tarea nueva con pocos datos.' },
                  ].map(c => (
                    <div key={c.term} className={styles.conceptoItem}>
                      <span className={styles.conceptoTerm}>{c.term}:</span>
                      <span className={styles.conceptoDef}>{c.def}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECCIÓN 4: TIPOS DE REDES */}
        {seccionActiva === 'tipos' && (
          <section className={styles.seccion} aria-label="Tipos de redes neuronales">
            <h2 className={styles.seccionTitulo}>Tipos de redes neuronales</h2>
            <p className={styles.seccionDesc}>
              Haz clic en cada arquitectura para ver sus ventajas, limitaciones y ejemplos reales.
            </p>

            <div className={styles.tiposGrid}>
              {ARQUITECTURAS.map(arq => (
                <div
                  key={arq.id}
                  className={`${styles.tipoCard} ${arquitecturaAbierta === arq.id ? styles.tipoCardAbierta : ''}`}
                >
                  <button
                    type="button"
                    className={styles.tipoCardHeader}
                    onClick={() => setArquitecturaAbierta(arquitecturaAbierta === arq.id ? null : arq.id)}
                    aria-expanded={arquitecturaAbierta === arq.id}
                    aria-controls={`arq-${arq.id}`}
                  >
                    <span className={styles.tipoIcono} aria-hidden="true">{arq.icono}</span>
                    <div className={styles.tipoHeaderTexto}>
                      <strong className={styles.tipoNombre}>{arq.nombre}</strong>
                      <span className={styles.tipoCasoUso}>{arq.casoUso}</span>
                    </div>
                    <span className={styles.tipoChevron} aria-hidden="true">
                      {arquitecturaAbierta === arq.id ? '▲' : '▼'}
                    </span>
                  </button>

                  {arquitecturaAbierta === arq.id && (
                    <div id={`arq-${arq.id}`} className={styles.tipoCardBody}>
                      <p className={styles.tipoDescripcion}>{arq.descripcion}</p>
                      <div className={styles.tipoEjemplo}>
                        <span aria-hidden="true">🔬</span> <strong>Ejemplo real:</strong> {arq.ejemplo}
                      </div>
                      <div className={styles.tipoListas}>
                        <div className={styles.tipoVentajas}>
                          <strong><span aria-hidden="true">✅</span> Ventajas</strong>
                          <ul>
                            {arq.ventajas.map((v, i) => <li key={i}>{v}</li>)}
                          </ul>
                        </div>
                        <div className={styles.tipoLimitaciones}>
                          <strong><span aria-hidden="true">⚠️</span> Limitaciones</strong>
                          <ul>
                            {arq.limitaciones.map((l, i) => <li key={i}>{l}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.warningBox}>
              <strong>Contexto actual — LLMs y IA Generativa</strong>
              <p>
                Los modelos de lenguaje como GPT-4 combinan Transformers con RLHF (Reinforcement Learning from Human Feedback) para alinear su comportamiento con las preferencias humanas. La temperatura controla la aleatoriedad de las respuestas: 0 = determinista, 1 = creativo, {'>'} 1 = caótico.
              </p>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="¿Cómo aprende una inteligencia artificial?"
        subtitle="De la neurona biológica al transformer: los fundamentos del deep learning"
      >

        {/* 1. Tabla comparativa de arquitecturas */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Arquitectura</th>
                <th>Datos ideales</th>
                <th>Fortaleza</th>
                <th>Ejemplo real</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>MLP (densa)</strong></td>
                <td>Tabular, estructurado</td>
                <td>Sencillo, versátil</td>
                <td>Predicción de precios</td>
              </tr>
              <tr>
                <td><strong>CNN</strong></td>
                <td>Imágenes, audio, señales</td>
                <td>Detección de patrones locales</td>
                <td>ResNet, VGG, YOLO</td>
              </tr>
              <tr>
                <td><strong>RNN / LSTM</strong></td>
                <td>Secuencias, series temporales</td>
                <td>Memoria de contexto previo</td>
                <td>Traducción automática (pre-2017)</td>
              </tr>
              <tr>
                <td><strong>Transformer</strong></td>
                <td>Texto, imagen, audio</td>
                <td>Atención global, paralelizable</td>
                <td>GPT-4, BERT, LLaMA, DALL-E</td>
              </tr>
              <tr>
                <td><strong>GAN</strong></td>
                <td>Generación sintética</td>
                <td>Crea datos realistas</td>
                <td>Stable Diffusion, StyleGAN</td>
              </tr>
              <tr>
                <td><strong>Autoencoder</strong></td>
                <td>Compresión, anomalías</td>
                <td>Aprende representaciones</td>
                <td>Detección de fraude</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '🎓',
              titulo: 'Estudiante de informática o ciencias de datos',
              desc: 'Aprende backpropagation y gradient descent para el examen — entiende cada paso matemático del entrenamiento.',
            },
            {
              icono: '💼',
              titulo: 'Profesional no técnico',
              desc: 'Entiende por qué GPT "alucina" o por qué el modelo necesita datos de entrenamiento para funcionar bien.',
            },
            {
              icono: '🧑‍💻',
              titulo: 'Desarrollador junior',
              desc: 'Comprende qué arquitectura elegir según el tipo de datos: imagen vs texto vs tabla estructurada.',
            },
            {
              icono: '🔍',
              titulo: 'Curioso sobre IA',
              desc: 'Quiere entender cómo funciona ChatGPT sin necesitar conocimientos de matemáticas complejas.',
            },
          ].map((perfil, i) => (
            <div key={i} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{perfil.icono}</span>
              <div>
                <strong className={styles.escenarioTitulo}>{perfil.titulo}</strong>
                <p className={styles.escenarioDesc}>{perfil.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <div className={styles.faqList}>
          {[
            {
              pregunta: '¿Por qué los modelos de IA "alucinan" información falsa?',
              respuesta: 'La red aprende patrones estadísticos, no hechos verificables. Genera lo más "probable" según el entrenamiento, lo que puede producir respuestas plausibles pero incorrectas.',
              tip: 'Siempre verifica datos críticos (fechas, cifras, citas) en fuentes primarias.',
            },
            {
              pregunta: '¿Cuántos datos necesita una red neuronal para aprender?',
              respuesta: 'Depende de la complejidad: una CNN simple necesita miles de imágenes etiquetadas; GPT-4 se entrenó con aproximadamente 13 billones de tokens de texto.',
              tip: null,
            },
            {
              pregunta: '¿Qué diferencia hay entre machine learning e inteligencia artificial?',
              respuesta: 'IA es el campo general que busca máquinas con comportamiento inteligente; ML es el subconjunto que aprende de datos; deep learning es ML con redes neuronales profundas.',
              tip: null,
            },
            {
              pregunta: '¿Por qué entrenar una IA consume tanta energía?',
              respuesta: 'Implica millones de operaciones de multiplicación de matrices en GPU especializadas. Solo el entrenamiento de GPT-3 consumió aproximadamente 1.287 MWh de electricidad.',
              tip: 'Usar transfer learning reduce el coste energético un 90% respecto a entrenar desde cero.',
            },
            {
              pregunta: '¿Puede una red neuronal explicar por qué tomó una decisión?',
              respuesta: 'Es difícil: las redes neuronales son "cajas negras". El campo de XAI (Explainable AI) trabaja en técnicas como SHAP o LIME para hacer interpretables las decisiones.',
              tip: null,
            },
            {
              pregunta: '¿Qué es el overfitting y cómo se evita?',
              respuesta: 'El modelo memoriza los datos de entrenamiento y falla en datos nuevos. Se evita con más datos, técnica de dropout, regularización L1/L2 y early stopping.',
              tip: 'Divide siempre los datos en train / validation / test antes de entrenar.',
            },
          ].map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <strong className={styles.faqPregunta}>{item.pregunta}</strong>
              <p className={styles.faqRespuesta}>{item.respuesta}</p>
              {item.tip && <p className={styles.faqTip}><span aria-hidden="true">💡</span> {item.tip}</p>}
            </div>
          ))}
        </div>

        {/* 4. Guía paso a paso */}
        <div className={styles.stepGuide}>
          <h3 className={styles.stepGuideTitle}>Cómo aprende una red neuronal a clasificar imágenes de gatos y perros</h3>
          {[
            {
              num: '1',
              titulo: 'Recogida de datos',
              desc: 'Miles de imágenes etiquetadas (gato=0, perro=1) divididas en conjuntos de train, validation y test.',
            },
            {
              num: '2',
              titulo: 'Arquitectura',
              desc: 'Se elige una CNN con capas convolucionales diseñadas para detectar bordes, texturas y formas jerárquicamente.',
            },
            {
              num: '3',
              titulo: 'Forward pass',
              desc: 'La imagen (valores de píxeles) fluye por las capas y la red predice: "70% gato, 30% perro".',
            },
            {
              num: '4',
              titulo: 'Cálculo del error',
              desc: 'La función de pérdida (cross-entropy) mide cuánto se equivocó la predicción respecto a la etiqueta real.',
            },
            {
              num: '5',
              titulo: 'Backpropagation',
              desc: 'El error se propaga hacia atrás usando la regla de la cadena y se calcula el gradiente de cada peso.',
            },
            {
              num: '6',
              titulo: 'Actualización de pesos',
              desc: 'Gradient descent ajusta cada peso: w = w − α × ∂L/∂w, donde α es el learning rate.',
            },
            {
              num: '7',
              titulo: 'Repetir épocas',
              desc: 'El ciclo se repite miles de veces hasta que el error de validación converge (early stopping si empeora).',
            },
          ].map(paso => (
            <div key={paso.num} className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">{paso.num}</div>
              <div className={styles.stepContent}>
                <strong className={styles.stepTitulo}>{paso.titulo}</strong>
                <p className={styles.stepDesc}>{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 5. Mejores prácticas / conceptos clave */}
        <div className={styles.tipsGrid}>
          {[
            {
              icono: '📊',
              titulo: 'Los datos importan más que el modelo',
              desc: 'Un modelo sencillo con buenos datos supera a uno complejo con datos malos o sesgados.',
            },
            {
              icono: '⚖️',
              titulo: 'Sesgo en datos = sesgo en el modelo',
              desc: 'Si los datos de entrenamiento no son representativos, la IA discriminará sistemáticamente.',
            },
            {
              icono: '🔄',
              titulo: 'Transfer learning primero',
              desc: 'Antes de entrenar desde cero, usa un modelo preentrenado (BERT, ResNet) — ahorra el 90% del tiempo y recursos.',
            },
            {
              icono: '📏',
              titulo: 'Valida siempre en datos no vistos',
              desc: 'El rendimiento real se mide en el conjunto test, nunca en el conjunto de entrenamiento.',
            },
            {
              icono: '🌡️',
              titulo: 'La temperatura controla la creatividad',
              desc: 'En LLMs, temperatura=0 da respuestas predecibles; temperatura>1 da respuestas variadas pero menos precisas.',
            },
          ].map((tip, i) => (
            <div key={i} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <strong className={styles.tipTitulo}>{tip.titulo}</strong>
              <p className={styles.tipDesc}>{tip.desc}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning box — malentendidos comunes */}
        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Malentendidos comunes sobre la IA</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ &quot;La IA entiende lo que dice&quot;</strong> — Los LLMs predicen el siguiente token más probable; no comprenden ni tienen conciencia.
            </li>
            <li>
              <strong>❌ &quot;Más parámetros = mejor modelo&quot;</strong> — Un modelo enorme mal entrenado o con datos malos puede superar en coste pero no en calidad a uno optimizado.
            </li>
            <li>
              <strong>❌ &quot;La IA es objetiva porque es una máquina&quot;</strong> — Aprende los sesgos de sus datos; algoritmos de contratación y crédito han discriminado por raza y género.
            </li>
            <li>
              <strong>❌ &quot;Los modelos aprenden en tiempo real&quot;</strong> — La mayoría tienen un corte de conocimiento (knowledge cutoff); no aprenden de las conversaciones del usuario salvo fine-tuning explícito.
            </li>
            <li>
              <strong>❌ &quot;El deep learning siempre supera a los métodos clásicos&quot;</strong> — En datos tabulares pequeños, gradient boosting (XGBoost) suele superar a las redes neuronales.
            </li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ia-redes-neuronales')} />
      <ShareCard appName="visualizador-ia-redes-neuronales" />
      <Footer appName="visualizador-ia-redes-neuronales" />
    </div>
  );
}
