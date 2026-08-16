'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorConvolucionKernels.module.css';

// ============== TIPOS Y CONSTANTES ==============

// Resolución de las imágenes (original y resultado). Fija para que el resultado
// sea reproducible y los filtros se aprecien píxel a píxel.
const RES = 220;

type Kernel = [number, number, number, number, number, number, number, number, number];
type Escena = 'mosaico' | 'rejilla';

interface PresetKernel {
  id: string;
  nombre: string;
  kernel: Kernel;
  // Si null, el divisor se calcula automáticamente (suma de pesos, o 1 si suma 0).
  divisor: number | null;
  // Desplazamiento que se suma al resultado (útil para emboss / Sobel y centrar en gris).
  offset: number;
  descripcion: string;
}

// ============== PRESETS DE KERNELS ==============

const PRESETS: PresetKernel[] = [
  {
    id: 'identidad',
    nombre: 'Identidad',
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    divisor: 1,
    offset: 0,
    descripcion: 'Deja la imagen igual: el píxel central pesa 1 y los vecinos 0.',
  },
  {
    id: 'blur',
    nombre: 'Desenfoque (box)',
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    divisor: 9,
    offset: 0,
    descripcion: 'Promedia el píxel con sus 8 vecinos. Suaviza y elimina detalle fino.',
  },
  {
    id: 'gaussiano',
    nombre: 'Desenfoque gaussiano',
    kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    divisor: 16,
    offset: 0,
    descripcion: 'Desenfoque que da más peso al centro: más natural que el box blur.',
  },
  {
    id: 'sharpen',
    nombre: 'Enfocar (sharpen)',
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    divisor: 1,
    offset: 0,
    descripcion: 'Resta los vecinos para realzar el contraste local y los detalles.',
  },
  {
    id: 'bordes',
    nombre: 'Bordes (Laplaciano)',
    kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
    divisor: 1,
    offset: 0,
    descripcion: 'Suma de pesos 0: deja a negro las zonas planas y resalta los bordes.',
  },
  {
    id: 'sobel-h',
    nombre: 'Sobel horizontal',
    kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
    divisor: 1,
    offset: 128,
    descripcion: 'Detecta bordes horizontales (cambios de arriba a abajo). Centrado en gris.',
  },
  {
    id: 'sobel-v',
    nombre: 'Sobel vertical',
    kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
    divisor: 1,
    offset: 128,
    descripcion: 'Detecta bordes verticales (cambios de izquierda a derecha). Centrado en gris.',
  },
  {
    id: 'emboss',
    nombre: 'Relieve (emboss)',
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    divisor: 1,
    offset: 128,
    descripcion: 'Pesos opuestos en diagonal: simula luz lateral y aspecto repujado.',
  },
];

// ============== GENERACIÓN DE LA IMAGEN DE MUESTRA ==============

// Generador pseudoaleatorio determinista (LCG) para que el ruido sea reproducible.
function crearRng(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

// Píxeles "tipográficos" 5×7 para dibujar un texto grande con detalle.
const GLIFOS: Record<string, string[]> = {
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
};

function dibujarTexto(
  datos: Uint8ClampedArray,
  texto: string,
  x0: number,
  y0: number,
  escala: number,
): void {
  let cursorX = x0;
  for (const ch of texto) {
    const glifo = GLIFOS[ch];
    if (glifo) {
      for (let fy = 0; fy < 7; fy++) {
        for (let fx = 0; fx < 5; fx++) {
          if (glifo[fy][fx] !== '1') continue;
          for (let sy = 0; sy < escala; sy++) {
            for (let sx = 0; sx < escala; sx++) {
              const px = cursorX + fx * escala + sx;
              const py = y0 + fy * escala + sy;
              if (px < 0 || px >= RES || py < 0 || py >= RES) continue;
              const i = (py * RES + px) * 4;
              datos[i] = 245;
              datos[i + 1] = 245;
              datos[i + 2] = 250;
            }
          }
        }
      }
    }
    cursorX += (5 + 1) * escala;
  }
}

function setPixel(datos: Uint8ClampedArray, x: number, y: number, r: number, g: number, b: number): void {
  if (x < 0 || x >= RES || y < 0 || y >= RES) return;
  const i = (Math.floor(y) * RES + Math.floor(x)) * 4;
  datos[i] = r;
  datos[i + 1] = g;
  datos[i + 2] = b;
}

// Genera la imagen de muestra como un array RGBA. Mucho detalle para que cada
// filtro se aprecie: gradiente, círculos, rectángulos, líneas finas, texto y ruido.
function generarImagen(escena: Escena): Uint8ClampedArray {
  const datos = new Uint8ClampedArray(RES * RES * 4);
  const rng = crearRng(escena === 'mosaico' ? 7 : 99);

  // Fondo con gradiente diagonal
  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      const i = (y * RES + x) * 4;
      const t = (x + y) / (2 * RES);
      datos[i] = Math.round(40 + t * 120);
      datos[i + 1] = Math.round(60 + (1 - t) * 90);
      datos[i + 2] = Math.round(90 + t * 130);
      datos[i + 3] = 255; // alfa opaco
    }
  }

  if (escena === 'mosaico') {
    // Círculos de colores
    const circulos: Array<[number, number, number, [number, number, number]]> = [
      [55, 60, 32, [231, 76, 60]],
      [150, 55, 26, [241, 196, 15]],
      [110, 150, 38, [46, 204, 113]],
    ];
    for (const [cx, cy, rad, color] of circulos) {
      for (let y = cy - rad; y <= cy + rad; y++) {
        for (let x = cx - rad; x <= cx + rad; x++) {
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy <= rad * rad) {
            setPixel(datos, x, y, color[0], color[1], color[2]);
          }
        }
      }
    }
    // Rectángulo
    for (let y = 150; y < 195; y++) {
      for (let x = 150; x < 200; x++) {
        setPixel(datos, x, y, 52, 152, 219);
      }
    }
    // Líneas diagonales finas (1 px): detalle ideal para enfoque y bordes
    for (let k = 0; k < RES; k += 12) {
      for (let t = 0; t < RES; t++) {
        setPixel(datos, t, (t + k) % RES, 250, 250, 250);
      }
    }
    // Texto grande "STEM"
    dibujarTexto(datos, 'STEM', 18, 95, 5);
  } else {
    // Escena 'rejilla': tablero + ondas, mucho borde recto
    const celda = 22;
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const claro = (Math.floor(x / celda) + Math.floor(y / celda)) % 2 === 0;
        if (claro) {
          const i = (y * RES + x) * 4;
          datos[i] = 235;
          datos[i + 1] = 235;
          datos[i + 2] = 240;
        }
      }
    }
    // Onda sinusoidal (líneas curvas finas)
    for (let x = 0; x < RES; x++) {
      const y = Math.round(RES / 2 + Math.sin((x / RES) * Math.PI * 6) * 40);
      setPixel(datos, x, y, 231, 76, 60);
      setPixel(datos, x, y + 1, 231, 76, 60);
    }
    // Círculo concéntrico (anillos)
    const cx = 110;
    const cy = 110;
    for (let y = 0; y < RES; y++) {
      for (let x = 0; x < RES; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (Math.round(d) % 16 === 0 && d < 95) {
          setPixel(datos, x, y, 46, 134, 171);
        }
      }
    }
  }

  // Ruido sutil en toda la imagen
  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      const i = (y * RES + x) * 4;
      const n = (rng() - 0.5) * 24;
      datos[i] = Math.max(0, Math.min(255, datos[i] + n));
      datos[i + 1] = Math.max(0, Math.min(255, datos[i + 1] + n));
      datos[i + 2] = Math.max(0, Math.min(255, datos[i + 2] + n));
    }
  }

  return datos;
}

// ============== CONVOLUCIÓN ==============

// Limita una coordenada al rango válido (extensión / clamp de bordes).
function clamp(v: number, max: number): number {
  if (v < 0) return 0;
  if (v > max) return max;
  return v;
}

// Aplica la convolución por canal RGB. El alfa se deja intacto.
function aplicarConvolucion(
  origen: Uint8ClampedArray,
  kernel: Kernel,
  divisor: number,
  offset: number,
): Uint8ClampedArray {
  const salida = new Uint8ClampedArray(origen.length);
  const div = divisor === 0 ? 1 : divisor;

  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      let sumaR = 0;
      let sumaG = 0;
      let sumaB = 0;
      let k = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = clamp(x + kx, RES - 1);
          const py = clamp(y + ky, RES - 1);
          const idx = (py * RES + px) * 4;
          const peso = kernel[k];
          sumaR += origen[idx] * peso;
          sumaG += origen[idx + 1] * peso;
          sumaB += origen[idx + 2] * peso;
          k++;
        }
      }
      const o = (y * RES + x) * 4;
      // El recorte a [0,255] lo hace Uint8ClampedArray automáticamente.
      salida[o] = sumaR / div + offset;
      salida[o + 1] = sumaG / div + offset;
      salida[o + 2] = sumaB / div + offset;
      salida[o + 3] = origen[o + 3];
    }
  }
  return salida;
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorConvolucionKernelsPage() {
  const canvasOriginal = useRef<HTMLCanvasElement>(null);
  const canvasResultado = useRef<HTMLCanvasElement>(null);

  const [escena, setEscena] = useState<Escena>('mosaico');
  const [kernel, setKernel] = useState<Kernel>(() => PRESETS[3].kernel);
  const [divisorManual, setDivisorManual] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [autoDivisor, setAutoDivisor] = useState<boolean>(false);
  const [presetActivo, setPresetActivo] = useState<string>('sharpen');

  // Imagen origen (RGBA), se regenera solo al cambiar de escena.
  const imagenOrigen = useMemo<Uint8ClampedArray>(() => generarImagen(escena), [escena]);

  // Suma de los pesos del kernel (divisor "natural" del filtro).
  const sumaPesos = useMemo<number>(() => kernel.reduce((a, b) => a + b, 0), [kernel]);

  // Divisor efectivo: automático (suma de pesos, o 1 si es 0) o el valor manual.
  const divisorEfectivo = useMemo<number>(() => {
    if (autoDivisor) return sumaPesos === 0 ? 1 : sumaPesos;
    return divisorManual === 0 ? 1 : divisorManual;
  }, [autoDivisor, sumaPesos, divisorManual]);

  // Dibuja la imagen original
  useEffect(() => {
    const canvas = canvasOriginal.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imagen = ctx.createImageData(RES, RES);
    imagen.data.set(imagenOrigen);
    ctx.putImageData(imagen, 0, 0);
  }, [imagenOrigen]);

  // Calcula y dibuja el resultado al cambiar el kernel, divisor, offset o imagen
  useEffect(() => {
    const canvas = canvasResultado.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const procesada = aplicarConvolucion(imagenOrigen, kernel, divisorEfectivo, offset);
    const imagen = ctx.createImageData(RES, RES);
    imagen.data.set(procesada);
    ctx.putImageData(imagen, 0, 0);
  }, [imagenOrigen, kernel, divisorEfectivo, offset]);

  // Carga un preset completo (kernel + divisor + offset)
  const cargarPreset = useCallback((p: PresetKernel) => {
    setKernel([...p.kernel] as Kernel);
    setPresetActivo(p.id);
    setOffset(p.offset);
    if (p.divisor === null) {
      setAutoDivisor(true);
    } else {
      setAutoDivisor(false);
      setDivisorManual(p.divisor);
    }
  }, []);

  // Edita un peso individual del kernel
  const editarPeso = useCallback((indice: number, valor: number) => {
    setKernel((prev) => {
      const copia = [...prev] as Kernel;
      copia[indice] = Number.isFinite(valor) ? valor : 0;
      return copia;
    });
    setPresetActivo('personalizado');
  }, []);

  const presetMostrado = PRESETS.find((p) => p.id === presetActivo);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Visualizador de Convolución y Kernels</h1>
        <p className={styles.subtitle}>
          Edita un kernel 3×3 y mira cómo transforma la imagen al instante: la misma operación que
          usan los filtros de Photoshop, el postprocesado de videojuegos y las redes neuronales (CNN)
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* 1. Imagen de muestra */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Elige la imagen de muestra</h2>
          <div className={styles.escenaSelector}>
            <button
              type="button"
              className={`${styles.escenaBtn} ${escena === 'mosaico' ? styles.escenaActive : ''}`}
              onClick={() => setEscena('mosaico')}
              aria-pressed={escena === 'mosaico'}
            >
              <span className={styles.escenaNombre}>Mosaico de color</span>
              <span className={styles.escenaDesc}>Formas, líneas finas y texto</span>
            </button>
            <button
              type="button"
              className={`${styles.escenaBtn} ${escena === 'rejilla' ? styles.escenaActive : ''}`}
              onClick={() => setEscena('rejilla')}
              aria-pressed={escena === 'rejilla'}
            >
              <span className={styles.escenaNombre}>Tablero y ondas</span>
              <span className={styles.escenaDesc}>Muchos bordes rectos y curvas</span>
            </button>
          </div>
          <p className={styles.nota}>
            La imagen se genera por código en el navegador (no se carga ningún archivo), por eso el
            resultado es siempre el mismo y se puede procesar píxel a píxel.
          </p>
        </div>

        {/* 2. Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. Aplica un filtro (preset)</h2>
          <div className={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.presetBtn} ${presetActivo === p.id ? styles.presetActive : ''}`}
                onClick={() => cargarPreset(p)}
                aria-pressed={presetActivo === p.id}
              >
                <span className={styles.presetTitle}>{p.nombre}</span>
                <span className={styles.presetDesc}>{p.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Editor del kernel */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3. Edita el kernel 3×3</h2>
          <div className={styles.kernelLayout}>
            <div className={styles.kernelGrid} role="group" aria-label="Pesos del kernel 3 por 3">
              {kernel.map((peso, idx) => {
                const filaK = Math.floor(idx / 3) + 1;
                const colK = (idx % 3) + 1;
                return (
                  <input
                    key={idx}
                    type="number"
                    step="any"
                    className={styles.kernelInput}
                    value={peso}
                    onChange={(e) => editarPeso(idx, parseFloat(e.target.value))}
                    aria-label={`Peso fila ${filaK} columna ${colK}`}
                  />
                );
              })}
            </div>

            <div className={styles.kernelControles}>
              <div className={styles.controlFila}>
                <label className={styles.toggleControl}>
                  <input
                    type="checkbox"
                    checked={autoDivisor}
                    onChange={(e) => setAutoDivisor(e.target.checked)}
                  />
                  Divisor automático (suma de pesos)
                </label>
              </div>

              <div className={styles.controlFila}>
                <label htmlFor="divisor-input" className={styles.controlLabel}>
                  Divisor (normalización):
                </label>
                <input
                  id="divisor-input"
                  type="number"
                  step="any"
                  className={styles.numInput}
                  value={autoDivisor ? (sumaPesos === 0 ? 1 : sumaPesos) : divisorManual}
                  onChange={(e) => {
                    setAutoDivisor(false);
                    setDivisorManual(parseFloat(e.target.value) || 1);
                  }}
                  disabled={autoDivisor}
                />
              </div>

              <div className={styles.controlFila}>
                <label htmlFor="offset-input" className={styles.controlLabel}>
                  Desplazamiento (offset):
                </label>
                <input
                  id="offset-input"
                  type="number"
                  step="any"
                  className={styles.numInput}
                  value={offset}
                  onChange={(e) => setOffset(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className={styles.kernelInfo} role="status" aria-live="polite">
                <span>
                  Suma de pesos: <strong>{sumaPesos}</strong>
                </span>
                <span>
                  Divisor aplicado: <strong>{divisorEfectivo}</strong>
                </span>
                {presetMostrado && presetActivo !== 'personalizado' && (
                  <span className={styles.kernelDescripcion}>{presetMostrado.descripcion}</span>
                )}
                {presetActivo === 'personalizado' && (
                  <span className={styles.kernelDescripcion}>Kernel personalizado.</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.nota}>
            Si la suma de pesos es 0 (filtros de bordes), el divisor automático usa 1. Para el relieve
            y los Sobel, un desplazamiento de 128 centra el resultado en gris para ver bordes en ambos
            sentidos.
          </div>
        </div>

        {/* 4. Comparación original vs resultado */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>4. Compara el antes y el después</h2>
          <div className={styles.comparativaCanvas}>
            <figure className={styles.canvasFig}>
              <canvas
                ref={canvasOriginal}
                width={RES}
                height={RES}
                className={styles.canvas}
                aria-label="Imagen original de muestra antes de aplicar el kernel"
              />
              <figcaption className={styles.canvasCaption}>Original</figcaption>
            </figure>
            <figure className={styles.canvasFig}>
              <canvas
                ref={canvasResultado}
                width={RES}
                height={RES}
                className={styles.canvas}
                aria-label="Imagen resultado después de aplicar el kernel de convolución"
              />
              <figcaption className={styles.canvasCaption}>Resultado</figcaption>
            </figure>
          </div>
          <p className={styles.nota}>
            El resultado se recalcula automáticamente cada vez que cambias un peso, el divisor o el
            preset. Los bordes de la imagen se tratan por extensión (se repite el píxel del borde).
          </p>
        </div>
      </main>

      <EducationalSection
        title="Guía de Convolución y Kernels de Imagen"
        subtitle="De los filtros de Photoshop a las redes neuronales convolucionales (CNN)"
      >
        <h3>Qué hace cada kernel</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Kernel</th>
                <th>Idea</th>
                <th>Qué hace</th>
                <th>Divisor típico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Identidad</strong></td>
                <td>Centro 1, vecinos 0</td>
                <td>No cambia nada: útil como punto de partida</td>
                <td>1</td>
              </tr>
              <tr>
                <td><strong>Desenfoque (box)</strong></td>
                <td>Promedio de los 9 píxeles</td>
                <td>Suaviza, quita ruido y detalle fino</td>
                <td>9 (suma de pesos)</td>
              </tr>
              <tr>
                <td><strong>Gaussiano</strong></td>
                <td>Más peso al centro</td>
                <td>Desenfoque más natural, sin halos</td>
                <td>16</td>
              </tr>
              <tr>
                <td><strong>Enfocar (sharpen)</strong></td>
                <td>Centro alto, vecinos negativos</td>
                <td>Realza el detalle y el contraste local</td>
                <td>1</td>
              </tr>
              <tr>
                <td><strong>Bordes (Laplaciano)</strong></td>
                <td>Suma de pesos = 0</td>
                <td>Zonas planas a negro, bordes brillantes</td>
                <td>1</td>
              </tr>
              <tr>
                <td><strong>Sobel H / V</strong></td>
                <td>Gradiente en una dirección</td>
                <td>Detecta bordes horizontales o verticales</td>
                <td>1 (+ offset 128)</td>
              </tr>
              <tr>
                <td><strong>Relieve (emboss)</strong></td>
                <td>Pesos opuestos en diagonal</td>
                <td>Aspecto repujado con luz lateral</td>
                <td>1 (+ offset 128)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa la convolución</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
              <strong>Filtros de foto y Photoshop</strong>
            </div>
            <p className={styles.escenarioExample}>
              Desenfocar, enfocar, perfilar o crear relieve son convoluciones. El menú &laquo;Filtro &gt;
              Otros &gt; A medida&raquo; de Photoshop es literalmente un editor de kernel como este.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> El &laquo;desenfoque gaussiano&raquo; que ves en todas partes es esta operación con un kernel
              en forma de campana.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Postprocesado en videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Efectos como el bloom, el desenfoque de movimiento o el contorno de objetos (outline) se
              implementan en shaders aplicando kernels al fotograma renderizado.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> En shaders, la convolución se hace muestreando texeles vecinos: la misma ventana 3×3 de
              aquí, pero en la GPU.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">👁️</span>
              <strong>Visión por computador</strong>
            </div>
            <p className={styles.escenarioExample}>
              Detectar bordes y esquinas es el primer paso de muchos algoritmos: Sobel y el Laplaciano
              preparan la imagen para detectar contornos, líneas o seguir objetos.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Suavizar con un gaussiano antes de buscar bordes reduce el ruido y mejora la detección
              (base del detector de Canny).
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
              <strong>Redes neuronales (CNN)</strong>
            </div>
            <p className={styles.escenarioExample}>
              Cada capa convolucional de una CNN aplica muchos kernels a la imagen. La diferencia es que
              sus pesos no se escriben a mano: se aprenden durante el entrenamiento.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Las primeras capas de una CNN suelen aprender detectores de bordes muy parecidos a
              Sobel; las profundas reconocen objetos.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué diferencia hay entre convolución y correlación cruzada?</h4>
            <p>
              En la convolución matemática estricta el kernel se voltea (se gira 180°) antes de
              aplicarlo; en la correlación cruzada no. En procesamiento de imágenes y en las CNN casi
              siempre se usa la correlación cruzada y se la llama &laquo;convolución&raquo; por costumbre. Para
              kernels simétricos, como el desenfoque, el resultado es idéntico.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Este visualizador usa la correlación cruzada, la convención habitual en visión por
              computador y aprendizaje profundo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué algunos filtros oscurecen o aclaran toda la imagen?</h4>
            <p>
              El brillo medio cambia según la suma de los pesos. Si suman más de 1 (sin normalizar), la
              imagen se aclara; si suman menos, se oscurece. Por eso se divide por la suma de pesos: para
              conservar el brillo. En los filtros de bordes la suma es 0, así que las zonas planas quedan
              negras y solo brillan los cambios.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Activa el &laquo;divisor automático&raquo; y compara: sin normalizar, un box blur de pesos 1
              dispara el brillo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Para qué sirve el desplazamiento (offset)?</h4>
            <p>
              Los filtros de bordes y de relieve producen valores positivos y negativos. Como un píxel no
              puede ser negativo, los valores por debajo de 0 se recortarían a negro y se perdería
              información. Sumar 128 desplaza el cero a gris medio, de modo que se ven los cambios en
              ambos sentidos.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Por eso un Sobel con offset se ve gris con bordes claros y oscuros, en lugar de casi todo
              negro.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa en los bordes de la imagen?</h4>
            <p>
              En el primer y último píxel el kernel 3×3 se sale de la imagen. Hay que decidir qué valor
              tienen esos vecinos inexistentes: rellenar con ceros, repetir el píxel del borde
              (extensión) o reflejar. Esta herramienta repite el píxel del borde, lo que evita marcos
              negros artificiales.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> En las CNN, rellenar con ceros (zero padding) es lo más común porque permite controlar el
              tamaño de salida.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la convolución es la base de las CNN?</h4>
            <p>
              Una capa convolucional no es más que aplicar kernels a la imagen, igual que aquí. La clave es
              que un mismo kernel se reutiliza en toda la imagen (comparte pesos), así que detecta el
              mismo patrón aparezca donde aparezca. Esa eficiencia es lo que hizo posible la visión por
              computador moderna.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Entender un kernel 3×3 a mano es entender qué hace cada filtro de una red neuronal por
              dentro.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo afecta el tamaño del kernel?</h4>
            <p>
              Aquí trabajamos con 3×3, el tamaño más común. Kernels mayores (5×5, 7×7) abarcan más
              vecindario: desenfocan más o detectan estructuras más grandes, pero cuestan más cálculo.
              Muchos efectos potentes se logran encadenando varios kernels pequeños en lugar de uno
              grande.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Dos desenfoques 3×3 seguidos equivalen aproximadamente a uno 5×5, y son más baratos de
              calcular.
            </p>
          </div>
        </div>

        <h3>Cómo se calcula un píxel de salida</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Centra la ventana 3×3 en el píxel</strong>
              <p>
                Para calcular el píxel de salida (x, y), mira ese píxel y sus 8 vecinos: una ventana de
                3×3 centrada en él.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Multiplica cada vecino por su peso</strong>
              <p>
                Empareja cada uno de los 9 píxeles de la ventana con el peso del kernel en esa posición y
                multiplícalos. Se hace por separado en cada canal de color (R, G y B).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Suma los 9 productos</strong>
              <p>
                Suma esos nueve resultados. Esa suma es el valor &laquo;crudo&raquo; del nuevo píxel antes de
                ajustar el brillo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Divide y suma el offset</strong>
              <p>
                Divide entre el divisor (normalmente la suma de pesos) para conservar el brillo y suma el
                desplazamiento si lo hay.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Recorta a [0, 255] y repite</strong>
              <p>
                Limita el valor final entre 0 y 255 y guárdalo. Repite el proceso para todos los píxeles
                de la imagen.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos para experimentar</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Empieza por la identidad</strong>
            <p>
              Con un 1 en el centro y ceros alrededor la imagen no cambia. Mueve un peso y observa el
              efecto para entender cada posición.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Normaliza para conservar el brillo</strong>
            <p>
              Si los pesos suman más de 1, divide entre su suma. Activa el divisor automático y verás cómo
              se mantiene la luminosidad.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa offset para los bordes</strong>
            <p>
              En filtros con valores negativos (Sobel, relieve) suma 128 para no perder los valores por
              debajo de cero al recortar.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Compara las dos escenas</strong>
            <p>
              El tablero y las ondas tienen muchos bordes rectos y curvos: ideal para ver qué hacen Sobel
              y el Laplaciano.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Exagera el sharpen con cuidado</strong>
            <p>
              Subir el centro y bajar los vecinos enfoca más, pero en exceso aparecen halos y se amplifica
              el ruido.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Piensa en CNN</strong>
            <p>
              Cada kernel que diseñas a mano es un &laquo;filtro&raquo; como los que una red neuronal aprende
              sola al entrenarse.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al aplicar kernels</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No normalizar: olvidar dividir entre la suma de pesos aclara u oscurece toda la imagen.</li>
            <li>Ignorar los bordes: dejar los píxeles del contorno sin tratar produce marcos negros o ruido.</li>
            <li>No recortar a [0, 255]: los valores fuera de rango dan colores erróneos o desbordes.</li>
            <li>Olvidar el offset en filtros con pesos negativos: los valores negativos se pierden a negro.</li>
            <li>Aplicar el kernel sobre la imagen ya modificada en vez de sobre una copia: corrompe el cálculo.</li>
            <li>Procesar el canal alfa como si fuera color: hay que dejar la transparencia intacta.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-convolucion-kernels')} />
      <ShareCard appName="visualizador-convolucion-kernels" />
      <Footer appName="visualizador-convolucion-kernels" />
    </div>
  );
}
