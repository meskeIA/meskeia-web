'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './GeometriaFractales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'que-es' | 'clasicos' | 'naturaleza' | 'matematicas';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'que-es', titulo: '¿Qué es?', icono: '🔍', subtitulo: 'Figuras con autosimilitud infinita' },
  { id: 'clasicos', titulo: 'Clásicos', icono: '📐', subtitulo: 'Sierpinski, Koch, alfombra y Hilbert' },
  { id: 'naturaleza', titulo: 'Naturaleza', icono: '🌿', subtitulo: 'Helechos, brócoli, costas y pulmones' },
  { id: 'matematicas', titulo: 'Matemáticas', icono: '🧮', subtitulo: 'Mandelbrot, Hausdorff y aplicaciones' },
];

// ─────────────────────────────────────────────
// Funciones generadoras de SVG fractal
// ─────────────────────────────────────────────

interface Punto {
  x: number;
  y: number;
}

// Triángulo de Sierpinski — devuelve lista de triángulos a dibujar
function generarSierpinski(iter: number, p1: Punto, p2: Punto, p3: Punto): string[] {
  if (iter === 0) {
    return [`M ${p1.x},${p1.y} L ${p2.x},${p2.y} L ${p3.x},${p3.y} Z`];
  }
  const m12: Punto = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const m23: Punto = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
  const m13: Punto = { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
  return [
    ...generarSierpinski(iter - 1, p1, m12, m13),
    ...generarSierpinski(iter - 1, m12, p2, m23),
    ...generarSierpinski(iter - 1, m13, m23, p3),
  ];
}

// Copo de Koch — devuelve path de la curva completa
function kochSegmento(iter: number, p1: Punto, p2: Punto): Punto[] {
  if (iter === 0) return [p1, p2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a: Punto = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
  const b: Punto = { x: p1.x + 2 * dx / 3, y: p1.y + 2 * dy / 3 };
  const pico: Punto = {
    x: a.x + (dx * Math.cos(Math.PI / 3) - dy * Math.sin(Math.PI / 3)) / 3,
    y: a.y + (dx * Math.sin(Math.PI / 3) + dy * Math.cos(Math.PI / 3)) / 3,
  };
  const seg1 = kochSegmento(iter - 1, p1, a);
  const seg2 = kochSegmento(iter - 1, a, pico);
  const seg3 = kochSegmento(iter - 1, pico, b);
  const seg4 = kochSegmento(iter - 1, b, p2);
  return [...seg1.slice(0, -1), ...seg2.slice(0, -1), ...seg3.slice(0, -1), ...seg4];
}

function generarKoch(iter: number, size: number): string {
  const h = size * Math.sqrt(3) / 2;
  const cx = size / 2;
  const cy = h * 0.6;
  const p1: Punto = { x: cx - size / 2, y: cy + h / 3 };
  const p2: Punto = { x: cx + size / 2, y: cy + h / 3 };
  const p3: Punto = { x: cx, y: cy - 2 * h / 3 };
  const lado1 = kochSegmento(iter, p1, p2);
  const lado2 = kochSegmento(iter, p2, p3);
  const lado3 = kochSegmento(iter, p3, p1);
  const puntos = [...lado1.slice(0, -1), ...lado2.slice(0, -1), ...lado3];
  return 'M ' + puntos.map(p => `${p.x},${p.y}`).join(' L ') + ' Z';
}

// Alfombra de Sierpinski — devuelve lista de rectángulos a dibujar (los huecos)
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function generarAlfombra(iter: number, x: number, y: number, size: number): Rect[] {
  if (iter === 0) return [];
  const s = size / 3;
  const rects: Rect[] = [{ x: x + s, y: y + s, w: s, h: s }];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;
      rects.push(...generarAlfombra(iter - 1, x + i * s, y + j * s, s));
    }
  }
  return rects;
}

// Curva de Hilbert — L-system
function generarHilbert(iter: number, size: number): string {
  if (iter === 0) return `M ${size / 2},${size / 2}`;
  // Generar secuencia de instrucciones con L-system
  let seq = 'A';
  for (let i = 0; i < iter; i++) {
    let next = '';
    for (const ch of seq) {
      if (ch === 'A') next += '-BF+AFA+FB-';
      else if (ch === 'B') next += '+AF-BFB-FA+';
      else next += ch;
    }
    seq = next;
  }
  // Convertir a puntos
  const n = Math.pow(2, iter);
  const step = size / n;
  let x = step / 2;
  let y = size - step / 2;
  let dir = 0; // 0=derecha, 1=arriba, 2=izquierda, 3=abajo
  const puntos: Punto[] = [{ x, y }];
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
  ];
  for (const ch of seq) {
    if (ch === '+') dir = (dir + 1) % 4;
    else if (ch === '-') dir = (dir + 3) % 4;
    else if (ch === 'F') {
      x += dirs[dir].dx * step;
      y += dirs[dir].dy * step;
      puntos.push({ x, y });
    }
  }
  return 'M ' + puntos.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
}

// ─────────────────────────────────────────────
// Sección 1: ¿Qué es un fractal?
// ─────────────────────────────────────────────

function SeccionQueEs() {
  const [iteracion, setIteracion] = useState(0);
  const SIZE = 300;

  const svgPaths = useMemo(() => {
    const p1: Punto = { x: SIZE / 2, y: 10 };
    const p2: Punto = { x: 10, y: SIZE - 10 };
    const p3: Punto = { x: SIZE - 10, y: SIZE - 10 };
    return generarSierpinski(iteracion, p1, p2, p3);
  }, [iteracion]);

  // Datos por iteración
  const datos = useMemo(() => {
    const triangulos = Math.pow(3, iteracion);
    const ladoRelativo = Math.pow(0.5, iteracion);
    const areaRelativa = Math.pow(0.75, iteracion);
    return { triangulos, ladoRelativo, areaRelativa };
  }, [iteracion]);

  const propiedades = [
    { icono: '🔄', titulo: 'Autosimilitud', desc: 'Cada parte es una copia reducida del todo. Haz zoom y verás el mismo patrón.' },
    { icono: '📏', titulo: 'Perímetro infinito', desc: 'El copo de Koch tiene longitud infinita, pero cabe en un círculo finito.' },
    { icono: '📐', titulo: 'Área finita', desc: 'El triángulo de Sierpinski tiene perímetro infinito pero área cero.' },
    { icono: '🔢', titulo: 'Dimensión fractal', desc: 'Ni 1D ni 2D. El triángulo de Sierpinski tiene dimensión ~1,585.' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Un <strong>fractal</strong> es una figura geométrica con <strong>autosimilitud</strong>: se repite
          a sí misma a diferentes escalas. Si amplías una parte, encuentras el mismo patrón. El término
          lo acuñó <strong>Benoît Mandelbrot</strong> en 1975, del latín <em>fractus</em> (roto, irregular).
        </p>
      </div>

      {/* Sierpinski paso a paso */}
      <div className={styles.fractalDemo}>
        <h3 className={styles.demoTitulo}>Triángulo de Sierpinski — paso a paso</h3>
        <div className={styles.svgContainer}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.fractalSvg} aria-label={`Triángulo de Sierpinski iteración ${iteracion}`}>
            {svgPaths.map((d, i) => (
              <path key={i} d={d} className={styles.fractalPath} />
            ))}
          </svg>
        </div>
        <div className={styles.sliderGroup}>
          <label htmlFor="sierpinski-iter" className={styles.sliderLabel}>
            Iteración: <strong>{iteracion}</strong>
          </label>
          <input
            id="sierpinski-iter"
            type="range"
            min={0}
            max={6}
            value={iteracion}
            onChange={e => setIteracion(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderMarks}>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        </div>
        <div className={styles.datosGrid}>
          <div className={styles.datoItem}>
            <span className={styles.datoValor}>{formatNumber(datos.triangulos, 0)}</span>
            <span className={styles.datoLabel}>triángulos</span>
          </div>
          <div className={styles.datoItem}>
            <span className={styles.datoValor}>{formatNumber(datos.ladoRelativo * 100, 1)}%</span>
            <span className={styles.datoLabel}>tamaño lado</span>
          </div>
          <div className={styles.datoItem}>
            <span className={styles.datoValor}>{formatNumber(datos.areaRelativa * 100, 1)}%</span>
            <span className={styles.datoLabel}>área restante</span>
          </div>
        </div>
      </div>

      {/* Dimensión fractal */}
      <div className={styles.insight}>
        <p>
          <strong>Dimensión fractal:</strong> una línea es 1D, un plano es 2D. El triángulo de Sierpinski
          tiene dimensión <strong>~{formatNumber(Math.log(3) / Math.log(2), 3)}</strong> (log 3 / log 2).
          Esto significa que es &ldquo;más que una línea pero menos que un plano&rdquo;. Es una medida de
          lo intrincado que es el patrón al hacer zoom.
        </p>
      </div>

      {/* Propiedades */}
      <h3 className={styles.subtituloSeccion}>Propiedades de los fractales</h3>
      <div className={styles.propiedadesGrid}>
        {propiedades.map((p, i) => (
          <div key={i} className={styles.propiedadCard}>
            <span className={styles.propiedadIcono} aria-hidden="true">{p.icono}</span>
            <span className={styles.propiedadTitulo}>{p.titulo}</span>
            <span className={styles.propiedadDesc}>{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Fractales clásicos
// ─────────────────────────────────────────────

interface FractalClasico {
  id: string;
  nombre: string;
  dimension: number;
  maxIter: number;
  descripcion: string;
}

const FRACTALES: FractalClasico[] = [
  { id: 'sierpinski', nombre: 'Triángulo de Sierpinski', dimension: 1.585, maxIter: 6, descripcion: 'Remover el triángulo central en cada iteración' },
  { id: 'koch', nombre: 'Copo de Koch', dimension: 1.262, maxIter: 5, descripcion: 'Añadir un triángulo en cada segmento' },
  { id: 'alfombra', nombre: 'Alfombra de Sierpinski', dimension: 1.893, maxIter: 4, descripcion: 'Remover el cuadrado central de cada 3×3' },
  { id: 'hilbert', nombre: 'Curva de Hilbert', dimension: 2.0, maxIter: 6, descripcion: 'Curva que llena completamente el espacio' },
];

function FractalInteractivo({ fractal }: { fractal: FractalClasico }) {
  const [iter, setIter] = useState(1);
  const SIZE = 280;

  const svgContent = useMemo(() => {
    switch (fractal.id) {
      case 'sierpinski': {
        const paths = generarSierpinski(
          iter,
          { x: SIZE / 2, y: 8 },
          { x: 8, y: SIZE - 8 },
          { x: SIZE - 8, y: SIZE - 8 }
        );
        return (
          <g>
            {paths.map((d, i) => (
              <path key={i} d={d} className={styles.fractalPath} />
            ))}
          </g>
        );
      }
      case 'koch': {
        const path = generarKoch(iter, SIZE - 16);
        return <path d={path} className={styles.fractalPath} />;
      }
      case 'alfombra': {
        const huecos = generarAlfombra(iter, 0, 0, SIZE);
        return (
          <g>
            <rect x={0} y={0} width={SIZE} height={SIZE} className={styles.fractalFill} />
            {huecos.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} className={styles.fractalHueco} />
            ))}
          </g>
        );
      }
      case 'hilbert': {
        const path = generarHilbert(iter, SIZE);
        return <path d={path} fill="none" className={styles.fractalStroke} />;
      }
      default:
        return null;
    }
  }, [fractal.id, iter]);

  // Cálculos por iteración
  const metricas = useMemo(() => {
    switch (fractal.id) {
      case 'sierpinski': {
        const triangulos = Math.pow(3, iter);
        const area = Math.pow(0.75, iter) * 100;
        return { linea1: `${formatNumber(triangulos, 0)} triángulos`, linea2: `Área: ${formatNumber(area, 2)}%` };
      }
      case 'koch': {
        const segmentos = 3 * Math.pow(4, iter);
        const perimetro = Math.pow(4 / 3, iter) * 100;
        return { linea1: `${formatNumber(segmentos, 0)} segmentos`, linea2: `Perímetro: ${formatNumber(perimetro, 1)}%` };
      }
      case 'alfombra': {
        const huecos = (Math.pow(8, iter) - 1) / 7;
        const area = Math.pow(8 / 9, iter) * 100;
        return { linea1: `${formatNumber(huecos + 1, 0)} huecos`, linea2: `Área: ${formatNumber(area, 2)}%` };
      }
      case 'hilbert': {
        const puntos = Math.pow(4, iter);
        const longitud = (Math.pow(2, iter) - 1) / Math.pow(2, iter) * 100;
        return { linea1: `${formatNumber(puntos, 0)} puntos`, linea2: `Cobertura: ${formatNumber(longitud, 1)}%` };
      }
      default:
        return { linea1: '', linea2: '' };
    }
  }, [fractal.id, iter]);

  return (
    <div className={styles.fractalCard}>
      <div className={styles.fractalNombre}>
        {fractal.nombre}
        <span className={styles.fractalDim}>dim ≈ {formatNumber(fractal.dimension, 3)}</span>
      </div>
      <div className={styles.fractalDesc}>{fractal.descripcion}</div>
      <div className={styles.svgContainerSmall}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.fractalSvg} aria-label={`${fractal.nombre} iteración ${iter}`}>
          {svgContent}
        </svg>
      </div>
      <div className={styles.sliderGroup}>
        <label htmlFor={`iter-${fractal.id}`} className={styles.sliderLabel}>
          Iteración: <strong>{iter}</strong>
        </label>
        <input
          id={`iter-${fractal.id}`}
          type="range"
          min={0}
          max={fractal.maxIter}
          value={iter}
          onChange={e => setIter(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
      <div className={styles.fractalMetricas}>
        <span>{metricas.linea1}</span>
        <span>{metricas.linea2}</span>
      </div>
    </div>
  );
}

function SeccionClasicos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          Cada fractal se genera aplicando una <strong>regla simple</strong> de forma recursiva.
          Mueve los sliders para ver cómo la complejidad crece exponencialmente con cada iteración.
        </p>
      </div>

      <div className={styles.fractalesGrid}>
        {FRACTALES.map(f => (
          <FractalInteractivo key={f.id} fractal={f} />
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>Observa el patrón:</strong> con cada iteración, el número de elementos se multiplica
          (×3 en Sierpinski, ×4 en Koch) pero cada uno es más pequeño. El resultado final tiene
          infinitos detalles en un espacio finito — la esencia de un fractal.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: En la naturaleza
// ─────────────────────────────────────────────

interface EjemploNaturaleza {
  icono: string;
  nombre: string;
  explicacion: string;
  dimensionFractal: string;
}

const EJEMPLOS_NATURALEZA: EjemploNaturaleza[] = [
  { icono: '🌿', nombre: 'Helecho', explicacion: 'Cada fronda es un mini-helecho: las hojas repiten la estructura de la rama completa. El helecho de Barnsley es un fractal clásico.', dimensionFractal: '~1,8' },
  { icono: '🥦', nombre: 'Brócoli romanesco', explicacion: 'Cada brote es una versión en miniatura del brócoli entero, con espirales logarítmicas perfectas visibles a simple vista.', dimensionFractal: '~1,6' },
  { icono: '🏖️', nombre: 'Costa de Noruega', explicacion: 'La longitud depende de la regla de medición: cuanto más corta la regla, más detalles revela y más larga parece la costa.', dimensionFractal: '~1,52' },
  { icono: '🫁', nombre: 'Pulmones', explicacion: 'Los bronquios se ramifican unas 23 veces, creando 300 millones de alvéolos en un volumen de apenas 6 litros.', dimensionFractal: '~2,97' },
  { icono: '🏞️', nombre: 'Ríos y afluentes', explicacion: 'Los afluentes de un río repiten el patrón de ramificación del río principal. Las cuencas hidrográficas son fractales naturales.', dimensionFractal: '~1,2-1,5' },
  { icono: '❄️', nombre: 'Copos de nieve', explicacion: 'Cada brazo del copo tiene ramas que repiten el patrón del brazo. Las condiciones de cristalización crean simetría hexagonal fractal.', dimensionFractal: '~1,26' },
  { icono: '❤️', nombre: 'Sistema circulatorio', explicacion: 'Arterias, arteriolas, capilares: el árbol vascular se ramifica para alcanzar cada célula, maximizando superficie de intercambio.', dimensionFractal: '~2,7' },
  { icono: '⚡', nombre: 'Relámpagos', explicacion: 'La descarga eléctrica se ramifica buscando el camino de menor resistencia, creando patrones fractales llamados figuras de Lichtenberg.', dimensionFractal: '~1,5-1,7' },
];

function SeccionNaturaleza() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La naturaleza usa fractales porque son <strong>eficientes</strong>: maximizan la superficie
          en el mínimo volumen. Los pulmones, los vasos sanguíneos y las raíces de los árboles
          usan ramificación fractal para cubrir el mayor área posible.
        </p>
      </div>

      <div className={styles.naturalezaGrid}>
        {EJEMPLOS_NATURALEZA.map((e, i) => (
          <div key={i} className={styles.naturalezaCard}>
            <span className={styles.naturalezaIcono} aria-hidden="true">{e.icono}</span>
            <div className={styles.naturalezaInfo}>
              <span className={styles.naturalezaNombre}>{e.nombre}</span>
              <span className={styles.naturalezaDim}>Dim. fractal: {e.dimensionFractal}</span>
              <span className={styles.naturalezaDesc}>{e.explicacion}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Paradoja de la costa */}
      <div className={styles.paradojaCard}>
        <h3>La paradoja de la costa de Gran Bretaña</h3>
        <p>
          En 1967, Mandelbrot publicó &ldquo;How Long Is the Coast of Britain?&rdquo;: la longitud
          de una costa depende de la <strong>escala de medición</strong>. Con una regla de 100 km
          obtienes una longitud; con una de 10 km, mucho más; con 1 km, aún más. En el límite
          matemático, la longitud tiende a <strong>infinito</strong>.
        </p>
        <div className={styles.paradojaEjemplo}>
          <div className={styles.paradojaItem}>
            <span className={styles.paradojaRegla}>Regla 200 km</span>
            <span className={styles.paradojaLong}>~{formatNumber(2800, 0)} km</span>
          </div>
          <div className={styles.paradojaItem}>
            <span className={styles.paradojaRegla}>Regla 100 km</span>
            <span className={styles.paradojaLong}>~{formatNumber(3400, 0)} km</span>
          </div>
          <div className={styles.paradojaItem}>
            <span className={styles.paradojaRegla}>Regla 50 km</span>
            <span className={styles.paradojaLong}>~{formatNumber(4400, 0)} km</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          <strong>¿Por qué fractales?</strong> La evolución &ldquo;descubrió&rdquo; que las estructuras
          fractales maximizan la superficie de contacto (para absorber oxígeno, nutrientes, luz)
          en el menor volumen posible. Es optimización natural pura.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Matemáticas y datos
// ─────────────────────────────────────────────

function SeccionMatematicas() {
  const aplicaciones = [
    { icono: '📱', nombre: 'Antenas fractales', desc: 'Tu smartphone tiene antenas con geometría fractal: captan múltiples frecuencias (WiFi, 4G, 5G, Bluetooth) en un espacio mínimo.' },
    { icono: '🖼️', nombre: 'Compresión de imágenes', desc: 'La compresión fractal (IFS) aprovecha la autosimilitud de las imágenes para reducir su tamaño manteniendo calidad.' },
    { icono: '🎬', nombre: 'CGI en películas', desc: 'Paisajes de montañas, bosques y nubes en cine se generan con algoritmos fractales. Usado en Star Wars, Avatar y más.' },
    { icono: '📈', nombre: 'Mercados financieros', desc: 'Mandelbrot mostró que las fluctuaciones de precios tienen estructura fractal: los patrones se repiten a diferentes escalas temporales.' },
  ];

  const timeline = [
    { anio: '1883', quien: 'Georg Cantor', que: 'Conjunto de Cantor: primer fractal formal (remover el tercio central)' },
    { anio: '1904', quien: 'Helge von Koch', que: 'Curva de Koch: ejemplo de curva continua sin tangente en ningún punto' },
    { anio: '1915', quien: 'Wacław Sierpiński', que: 'Triángulo y alfombra de Sierpinski' },
    { anio: '1918', quien: 'Felix Hausdorff', que: 'Define la dimensión fractal (dimensión de Hausdorff)' },
    { anio: '1975', quien: 'Benoît Mandelbrot', que: 'Acuña el término "fractal" en Les objets fractals' },
    { anio: '1980', quien: 'Mandelbrot', que: 'Publica visualizaciones del conjunto de Mandelbrot: z = z² + c' },
  ];

  return (
    <div className={styles.seccionContent}>
      {/* Mandelbrot */}
      <div className={styles.contexto}>
        <p>
          <strong>Benoît Mandelbrot</strong> (1924-2010) revolucionó las matemáticas al mostrar que
          la geometría &ldquo;rugosa&rdquo; de la naturaleza no es caos: tiene estructura fractal
          medible. Su libro <em>Les objets fractals</em> (1975) abrió un campo nuevo.
        </p>
      </div>

      {/* El conjunto de Mandelbrot */}
      <div className={styles.mandelbrotCard}>
        <h3>El conjunto de Mandelbrot: z = z² + c</h3>
        <p>
          Toma un número complejo <strong>c</strong>. Empieza con z = 0 y repite: z → z² + c.
          Si la secuencia <strong>no escapa al infinito</strong>, entonces c pertenece al conjunto
          de Mandelbrot. El resultado es la forma más famosa de las matemáticas: una figura de
          complejidad infinita generada por una ecuación de 5 caracteres.
        </p>
        <div className={styles.formulaBox}>
          <span className={styles.formula}>z<sub>n+1</sub> = z<sub>n</sub>² + c</span>
          <span className={styles.formulaDesc}>Si |z| permanece acotado → c está en el conjunto</span>
        </div>
        <p>
          La frontera del conjunto tiene dimensión fractal <strong>2</strong> — es tan intrincada
          que es efectivamente bidimensional, aunque es una curva. Al hacer zoom, aparecen
          copias en miniatura del conjunto completo: autosimilitud perfecta.
        </p>
      </div>

      {/* Dimensión de Hausdorff */}
      <div className={styles.hausdorffCard}>
        <h3>Dimensión fractal de Hausdorff</h3>
        <p>
          Intuitivamente: si duplicas el tamaño de una línea, necesitas <strong>2</strong> copias.
          Si duplicas un cuadrado, necesitas <strong>4</strong> (2²). Si duplicas un cubo, <strong>8</strong> (2³).
          La dimensión es el exponente. Para fractales, ese exponente no es entero:
        </p>
        <div className={styles.dimensionesGrid}>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Línea</span>
            <span className={styles.dimValor}>1,000</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Koch</span>
            <span className={styles.dimValor}>{formatNumber(Math.log(4) / Math.log(3), 3)}</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Sierpinski △</span>
            <span className={styles.dimValor}>{formatNumber(Math.log(3) / Math.log(2), 3)}</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Alfombra</span>
            <span className={styles.dimValor}>{formatNumber(Math.log(8) / Math.log(3), 3)}</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Hilbert</span>
            <span className={styles.dimValor}>{formatNumber(2.0, 3)}</span>
          </div>
          <div className={styles.dimItem}>
            <span className={styles.dimNombre}>Plano</span>
            <span className={styles.dimValor}>2,000</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <h3 className={styles.subtituloSeccion}>Historia de los fractales</h3>
      <div className={styles.timeline}>
        {timeline.map((t, i) => (
          <div key={i} className={styles.timelineItem}>
            <span className={styles.timelineAnio}>{t.anio}</span>
            <div className={styles.timelineContent}>
              <span className={styles.timelineQuien}>{t.quien}</span>
              <span className={styles.timelineQue}>{t.que}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Aplicaciones */}
      <h3 className={styles.subtituloSeccion}>Aplicaciones en el mundo real</h3>
      <div className={styles.aplicacionesGrid}>
        {aplicaciones.map((a, i) => (
          <div key={i} className={styles.aplicacionCard}>
            <span className={styles.aplicacionIcono} aria-hidden="true">{a.icono}</span>
            <span className={styles.aplicacionNombre}>{a.nombre}</span>
            <span className={styles.aplicacionDesc}>{a.desc}</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          <strong>La idea clave:</strong> los fractales demuestran que la complejidad infinita puede
          emerger de reglas extremadamente simples. Una ecuación de 5 caracteres (z = z² + c) genera
          la forma más compleja de las matemáticas. La simplicidad subyacente de la naturaleza.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorGeometriaFractalesPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('que-es');

  const renderSeccion = useCallback(() => {
    switch (seccionActiva) {
      case 'que-es': return <SeccionQueEs />;
      case 'clasicos': return <SeccionClasicos />;
      case 'naturaleza': return <SeccionNaturaleza />;
      case 'matematicas': return <SeccionMatematicas />;
    }
  }, [seccionActiva]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Geometría de Fractales</h1>
          <p className={styles.subtitle}>Sierpinski, Koch, Mandelbrot — la complejidad infinita de las reglas simples</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}
          </p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre fractales y geometría"
          subtitle="Preguntas frecuentes y curiosidades"
          defaultOpen={false}
        >
          <h3>¿Los fractales son infinitos?</h3>
          <p>
            Matemáticamente, sí: un fractal &ldquo;verdadero&rdquo; tiene infinitas iteraciones y detalle
            a toda escala. En la práctica (y en este visualizador), las iteraciones están limitadas
            porque cada paso multiplica exponencialmente el número de elementos a calcular.
          </p>

          <h3>¿El conjunto de Mandelbrot es un fractal?</h3>
          <p>
            Sí, y posiblemente el más famoso. Su frontera tiene dimensión fractal 2 y muestra
            autosimilitud: al hacer zoom en los bordes, aparecen copias en miniatura del conjunto
            completo. Sin embargo, no es &ldquo;estrictamente autosimilar&rdquo; como Sierpinski
            — cada copia es ligeramente diferente.
          </p>

          <h3>¿Qué es un L-system?</h3>
          <p>
            Los <strong>L-systems</strong> (Lindenmayer, 1968) son gramáticas formales que generan
            fractales mediante reglas de reescritura. Por ejemplo, la curva de Hilbert se genera
            con solo dos reglas y tres símbolos. Son ampliamente usados para modelar el crecimiento
            de plantas en gráficos por computador.
          </p>

          <h3>¿Las costas son realmente fractales?</h3>
          <p>
            Las costas son &ldquo;casi fractales&rdquo;: muestran autosimilitud estadística
            en un rango amplio de escalas (desde km hasta metros), pero a escala atómica la
            autosimilitud se rompe. Los matemáticos las llaman <strong>pre-fractales</strong>.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> las iteraciones en este visualizador están limitadas por rendimiento
            del navegador (máximo 4-6 según el fractal). En la realidad matemática, los fractales
            tienen iteraciones infinitas — cada zoom revelaría más detalle sin fin. Los valores
            de dimensión fractal son aproximaciones redondeadas.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-geometria-fractales')} />
        <ShareCard appName="visualizador-geometria-fractales" />
        <Footer appName="visualizador-geometria-fractales" />
      </div>
    </>
  );
}
