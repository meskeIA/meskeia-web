'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './VisualizadorIluminacionPhong.module.css';

// ============== CONSTANTES ==============

const SIZE = 320; // lado del lienzo en píxeles
const RADIO = SIZE * 0.42; // radio de la esfera en píxeles

// ¿Qué componente mostramos? combinado = la suma completa de Phong.
type Componente = 'combinado' | 'ambiente' | 'difuso' | 'especular';

// ============== UTILIDADES VECTORIALES ==============

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function normalizar(v: Vec3): Vec3 {
  const longitud = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  return { x: v.x / longitud, y: v.y / longitud, z: v.z / longitud };
}

function producto(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Convierte un color hexadecimal (#rrggbb) a sus tres canales [0, 1].
function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '');
  const r = parseInt(limpio.slice(0, 2), 16) / 255;
  const g = parseInt(limpio.slice(2, 4), 16) / 255;
  const b = parseInt(limpio.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// Posición de la luz a partir de los ángulos acimut y elevación (en grados).
// La luz vive en una esfera de radio 1,8 alrededor del centro, mirando hacia +Z.
function posicionLuz(acimutGrados: number, elevacionGrados: number): Vec3 {
  const az = (acimutGrados * Math.PI) / 180;
  const el = (elevacionGrados * Math.PI) / 180;
  const distancia = 1.8;
  return {
    x: Math.cos(el) * Math.sin(az) * distancia,
    y: Math.sin(el) * distancia,
    z: Math.cos(el) * Math.cos(az) * distancia,
  };
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorIluminacionPhongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Coeficientes del modelo de Phong
  const [ka, setKa] = useState<number>(0.15); // ambiente
  const [kd, setKd] = useState<number>(0.7); // difuso
  const [ks, setKs] = useState<number>(0.6); // especular
  const [brillo, setBrillo] = useState<number>(32); // exponente shininess (alfa)
  const [intensidad, setIntensidad] = useState<number>(1); // intensidad de la luz

  // Posición de la luz (en ángulos), color del material y de la luz
  const [acimut, setAcimut] = useState<number>(-35);
  const [elevacion, setElevacion] = useState<number>(35);
  const [colorMaterial, setColorMaterial] = useState<string>('#2e86ab');
  const [colorLuz, setColorLuz] = useState<string>('#ffffff');

  const [componente, setComponente] = useState<Componente>('combinado');
  const arrastrando = useRef<boolean>(false);

  // Dibuja la esfera sombreada píxel a píxel aplicando el modelo de Phong.
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imagen = ctx.createImageData(SIZE, SIZE);
    const datos = imagen.data;

    const centro = SIZE / 2;
    const luz = posicionLuz(acimut, elevacion);
    const V: Vec3 = { x: 0, y: 0, z: 1 }; // cámara mirando hacia +Z
    const [mr, mg, mb] = hexARgb(colorMaterial); // color del material
    const [lr, lg, lb] = hexARgb(colorLuz); // color de la luz

    // Coeficientes efectivos según la componente que se quiere mostrar
    const usaAmbiente = componente === 'combinado' || componente === 'ambiente';
    const usaDifuso = componente === 'combinado' || componente === 'difuso';
    const usaEspecular = componente === 'combinado' || componente === 'especular';

    for (let py = 0; py < SIZE; py++) {
      for (let px = 0; px < SIZE; px++) {
        const i = (py * SIZE + px) * 4;
        // Coordenadas relativas al centro (eje Y hacia arriba en el espacio 3D)
        const x = px - centro;
        const y = centro - py;
        const dist2 = x * x + y * y;

        if (dist2 > RADIO * RADIO) {
          // Fuera de la esfera: fondo
          datos[i] = 17;
          datos[i + 1] = 24;
          datos[i + 2] = 39;
          datos[i + 3] = 255;
          continue;
        }

        // Reconstruimos la normal de la esfera: nz = sqrt(R² − x² − y²)
        const nz = Math.sqrt(RADIO * RADIO - dist2);
        const N = normalizar({ x, y, z: nz });

        // L = dirección hacia la luz (normalizada)
        const L = normalizar(luz);

        // Componente difusa (ley del coseno de Lambert): max(N·L, 0)
        const nl = Math.max(producto(N, L), 0);

        // Vector de reflexión R = 2·(N·L)·N − L
        const R = normalizar({
          x: 2 * nl * N.x - L.x,
          y: 2 * nl * N.y - L.y,
          z: 2 * nl * N.z - L.z,
        });
        // Especular Phong: max(R·V, 0)^brillo
        const rv = Math.max(producto(R, V), 0);
        const espec = nl > 0 ? Math.pow(rv, brillo) : 0;

        const fAmb = usaAmbiente ? ka : 0;
        const fDif = usaDifuso ? kd * nl * intensidad : 0;
        const fEsp = usaEspecular ? ks * espec * intensidad : 0;

        // Por canal: ambiente·material + difuso·material·luz + especular·luz
        const rr = fAmb * mr + fDif * mr * lr + fEsp * lr;
        const gg = fAmb * mg + fDif * mg * lg + fEsp * lg;
        const bb = fAmb * mb + fDif * mb * lb + fEsp * lb;

        // Recorte a [0, 255]
        datos[i] = Math.min(255, Math.round(rr * 255));
        datos[i + 1] = Math.min(255, Math.round(gg * 255));
        datos[i + 2] = Math.min(255, Math.round(bb * 255));
        datos[i + 3] = 255;
      }
    }
    ctx.putImageData(imagen, 0, 0);
  }, [ka, kd, ks, brillo, intensidad, acimut, elevacion, colorMaterial, colorLuz, componente]);

  // Redibuja al cambiar cualquier parámetro
  useEffect(() => {
    dibujar();
  }, [dibujar]);

  // Mueve la luz colocándola según el punto del lienzo que se toca.
  // Se proyecta el punto sobre la esfera para obtener acimut y elevación.
  const moverLuzDesdePunto = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const escala = SIZE / rect.width;
    const px = (clientX - rect.left) * escala;
    const py = (clientY - rect.top) * escala;
    const centro = SIZE / 2;
    // Normalizamos a [-1, 1] respecto al radio
    let nx = (px - centro) / RADIO;
    let ny = (centro - py) / RADIO;
    const r = Math.sqrt(nx * nx + ny * ny);
    if (r > 1) {
      // Si se sale de la esfera, lo proyectamos al borde
      nx /= r;
      ny /= r;
    }
    // Acimut y elevación a partir de la posición sobre la esfera
    const nuevoAcimut = (Math.asin(Math.max(-1, Math.min(1, nx))) * 180) / Math.PI;
    const nuevaElevacion = (Math.asin(Math.max(-1, Math.min(1, ny))) * 180) / Math.PI;
    setAcimut(Math.round(nuevoAcimut));
    setElevacion(Math.round(nuevaElevacion));
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      arrastrando.current = true;
      moverLuzDesdePunto(e.clientX, e.clientY);
    },
    [moverLuzDesdePunto],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!arrastrando.current) return;
      moverLuzDesdePunto(e.clientX, e.clientY);
    },
    [moverLuzDesdePunto],
  );

  useEffect(() => {
    const soltar = () => {
      arrastrando.current = false;
    };
    window.addEventListener('pointerup', soltar);
    return () => window.removeEventListener('pointerup', soltar);
  }, []);

  const restablecer = useCallback(() => {
    setKa(0.15);
    setKd(0.7);
    setKs(0.6);
    setBrillo(32);
    setIntensidad(1);
    setAcimut(-35);
    setElevacion(35);
    setColorMaterial('#2e86ab');
    setColorLuz('#ffffff');
    setComponente('combinado');
  }, []);

  const etiquetaComponente: Record<Componente, string> = {
    combinado: 'Phong completo (ambiente + difuso + especular)',
    ambiente: 'solo la componente ambiente',
    difuso: 'solo la componente difusa',
    especular: 'solo la componente especular',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Modelo de Phong: Iluminación y Sombreado 3D</h1>
        <p className={styles.subtitle}>
          Sombrea una esfera 3D píxel a píxel: ajusta las componentes ambiente, difusa y especular,
          cambia el brillo y mueve la luz para entender cómo piensan los shaders
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.workspace}>
          {/* Panel de controles */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros del material y la luz</h2>

            {/* Toggle de componentes */}
            <div className={styles.componenteSelector} role="group" aria-label="Componente a visualizar">
              <button
                type="button"
                className={`${styles.componenteBtn} ${componente === 'combinado' ? styles.componenteActive : ''}`}
                onClick={() => setComponente('combinado')}
                aria-pressed={componente === 'combinado'}
              >
                <span aria-hidden="true">🔆</span> Combinado
              </button>
              <button
                type="button"
                className={`${styles.componenteBtn} ${componente === 'ambiente' ? styles.componenteActive : ''}`}
                onClick={() => setComponente('ambiente')}
                aria-pressed={componente === 'ambiente'}
              >
                <span aria-hidden="true">🌑</span> Ambiente
              </button>
              <button
                type="button"
                className={`${styles.componenteBtn} ${componente === 'difuso' ? styles.componenteActive : ''}`}
                onClick={() => setComponente('difuso')}
                aria-pressed={componente === 'difuso'}
              >
                <span aria-hidden="true">🌗</span> Difuso
              </button>
              <button
                type="button"
                className={`${styles.componenteBtn} ${componente === 'especular' ? styles.componenteActive : ''}`}
                onClick={() => setComponente('especular')}
                aria-pressed={componente === 'especular'}
              >
                <span aria-hidden="true">✨</span> Especular
              </button>
            </div>

            {/* Ambiente */}
            <div className={styles.sliderControl}>
              <label htmlFor="ka-slider">
                Ambiente (ka)
                <span className={styles.sliderValue}>{formatNumber(ka, 2)}</span>
              </label>
              <input
                id="ka-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={ka}
                onChange={(e) => setKa(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>Luz de relleno constante en toda la superficie</span>
            </div>

            {/* Difuso */}
            <div className={styles.sliderControl}>
              <label htmlFor="kd-slider">
                Difuso (kd)
                <span className={styles.sliderValue}>{formatNumber(kd, 2)}</span>
              </label>
              <input
                id="kd-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={kd}
                onChange={(e) => setKd(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>Brillo mate según el ángulo luz-normal (Lambert)</span>
            </div>

            {/* Especular */}
            <div className={styles.sliderControl}>
              <label htmlFor="ks-slider">
                Especular (ks)
                <span className={styles.sliderValue}>{formatNumber(ks, 2)}</span>
              </label>
              <input
                id="ks-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={ks}
                onChange={(e) => setKs(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>Intensidad del destello brillante</span>
            </div>

            {/* Brillo / shininess */}
            <div className={styles.sliderControl}>
              <label htmlFor="brillo-slider">
                Brillo (shininess α)
                <span className={styles.sliderValue}>{brillo}</span>
              </label>
              <input
                id="brillo-slider"
                type="range"
                min={1}
                max={128}
                step={1}
                value={brillo}
                onChange={(e) => setBrillo(parseInt(e.target.value, 10))}
              />
              <span className={styles.sliderHint}>
                Bajo = destello grande (plástico) · alto = punto pequeño (metal pulido)
              </span>
            </div>

            {/* Intensidad de la luz */}
            <div className={styles.sliderControl}>
              <label htmlFor="intensidad-slider">
                Intensidad de la luz
                <span className={styles.sliderValue}>{formatNumber(intensidad, 2)}</span>
              </label>
              <input
                id="intensidad-slider"
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={intensidad}
                onChange={(e) => setIntensidad(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>Multiplica las componentes difusa y especular</span>
            </div>

            {/* Posición de la luz por ángulos */}
            <div className={styles.sliderControl}>
              <label htmlFor="acimut-slider">
                Acimut de la luz
                <span className={styles.sliderValue}>{acimut}°</span>
              </label>
              <input
                id="acimut-slider"
                type="range"
                min={-90}
                max={90}
                step={1}
                value={acimut}
                onChange={(e) => setAcimut(parseInt(e.target.value, 10))}
              />
              <span className={styles.sliderHint}>Mueve la luz a izquierda o derecha</span>
            </div>

            <div className={styles.sliderControl}>
              <label htmlFor="elevacion-slider">
                Elevación de la luz
                <span className={styles.sliderValue}>{elevacion}°</span>
              </label>
              <input
                id="elevacion-slider"
                type="range"
                min={-90}
                max={90}
                step={1}
                value={elevacion}
                onChange={(e) => setElevacion(parseInt(e.target.value, 10))}
              />
              <span className={styles.sliderHint}>Mueve la luz hacia arriba o abajo</span>
            </div>

            {/* Selectores de color */}
            <div className={styles.colorRow}>
              <label className={styles.colorControl} htmlFor="color-material">
                Color del material
                <input
                  id="color-material"
                  type="color"
                  value={colorMaterial}
                  onChange={(e) => setColorMaterial(e.target.value)}
                />
              </label>
              <label className={styles.colorControl} htmlFor="color-luz">
                Color de la luz
                <input
                  id="color-luz"
                  type="color"
                  value={colorLuz}
                  onChange={(e) => setColorLuz(e.target.value)}
                />
              </label>
            </div>

            <button type="button" className={styles.resetBtn} onClick={restablecer}>
              <span aria-hidden="true">↺</span> Restablecer valores
            </button>
          </div>

          {/* Panel del lienzo */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>
            <div className={styles.canvasWrapper}>
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                className={styles.canvas}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                aria-label={`Esfera 3D sombreada con el modelo de Phong, mostrando ${etiquetaComponente[componente]}. Arrastra sobre la esfera para mover la fuente de luz.`}
                role="img"
              />
            </div>

            <div className={styles.hint}>
              <strong>Arrastra sobre la esfera</strong> para mover la luz, o usa los controles de acimut
              y elevación. Estás viendo {etiquetaComponente[componente]}.
            </div>

            <div className={styles.formulaBox} aria-hidden="true">
              <span className={styles.formulaLabel}>Fórmula de Phong por canal:</span>
              <code>
                I = k<sub>a</sub>·amb + k<sub>d</sub>·max(N·L,0)·dif + k<sub>s</sub>·max(R·V,0)<sup>α</sup>·esp
              </code>
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía del Modelo de Iluminación de Phong"
        subtitle="Ambiente, difuso y especular — cómo los shaders calculan el color de cada píxel"
      >
        <h3>Las tres componentes del modelo de Phong</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Componente</th>
                <th>¿Qué simula?</th>
                <th>¿De qué depende?</th>
                <th>¿Cambia con la cámara?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ambiente</strong></td>
                <td>Luz indirecta de relleno que llega rebotada desde todo el entorno</td>
                <td>De un coeficiente constante (ka); no depende de ningún ángulo</td>
                <td>No: ilumina todo por igual</td>
              </tr>
              <tr>
                <td><strong>Difusa</strong></td>
                <td>El brillo mate de la superficie (papel, tela, pared)</td>
                <td>Del ángulo entre la normal y la luz: N·L (ley del coseno de Lambert)</td>
                <td>No: solo depende de la luz y la superficie</td>
              </tr>
              <tr>
                <td><strong>Especular</strong></td>
                <td>El destello brillante de superficies pulidas</td>
                <td>Del ángulo entre el rayo reflejado y la vista: (R·V) elevado al brillo</td>
                <td>Sí: el destello se mueve si mueves la cámara o la luz</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa la iluminación de Phong</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Iluminación en videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Durante años, los juegos 3D sombrearon cada superficie con Phong o Blinn-Phong en el
              fragment shader: barato, en tiempo real y suficientemente realista para personajes y
              escenarios.
            </p>
            <p className={styles.escenarioTip}>
              💡 Hoy se combina con mapas de normales para fingir detalle sin más geometría.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
              <strong>Render 3D y CGI</strong>
            </div>
            <p className={styles.escenarioExample}>
              En modelado y animación, Phong fue el material por defecto durante décadas para previsualizar
              objetos antes de pasar a render fotorrealista. Sigue siendo útil para bocetos rápidos.
            </p>
            <p className={styles.escenarioTip}>
              💡 El render final suele usar modelos físicos (PBR), pero Phong es perfecto para iterar.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧱</span>
              <strong>Materiales mate vs brillantes</strong>
            </div>
            <p className={styles.escenarioExample}>
              Subiendo o bajando el coeficiente especular y el exponente de brillo se pasa de una pared de
              yeso (sin destello) a una bola de billar o a un metal pulido (destello pequeño e intenso).
            </p>
            <p className={styles.escenarioTip}>
              💡 Pon ks alto y brillo alto para metal; ks bajo y brillo bajo para superficies mates.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🖥️</span>
              <strong>Shaders y aprendizaje gráfico</strong>
            </div>
            <p className={styles.escenarioExample}>
              Phong es el primer modelo que casi todo el mundo programa al aprender shaders en GLSL, HLSL,
              Unity o Three.js: enseña las normales y los vectores de luz, vista y reflejo.
            </p>
            <p className={styles.escenarioTip}>
              💡 Entender Phong hace mucho más fácil el salto a modelos físicos como el PBR.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Quién inventó el modelo de Phong y cuándo?</h4>
            <p>
              Lo propuso Bui Tuong Phong, un investigador vietnamita, en su tesis doctoral en la Universidad
              de Utah, publicada en 1975. Aportó dos ideas: el modelo de reflexión (las tres componentes que
              usas aquí) y el sombreado de Phong, que interpola las normales por toda la cara de un polígono
              en lugar de calcular la luz una sola vez por cara. Falleció muy joven, pero su trabajo marcó
              los gráficos por computador durante décadas.
            </p>
            <p className={styles.faqTip}>
              💡 «Modelo de Phong» y «sombreado de Phong» son cosas distintas aunque relacionadas: uno es la
              fórmula de la luz, el otro es cómo se interpolan las normales.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la componente difusa usa el coseno del ángulo?</h4>
            <p>
              Por la ley del coseno de Lambert: una superficie mate recibe más energía por unidad de área
              cuando la luz le llega de frente y menos cuando llega de lado. Ese factor es exactamente el
              coseno del ángulo entre la normal y la dirección de la luz, que se calcula como el producto
              escalar N·L (con ambos vectores normalizados). Por eso el polo iluminado de la esfera es el
              más brillante y se va oscureciendo hacia los bordes.
            </p>
            <p className={styles.faqTip}>
              💡 Si N·L sale negativo, la cara está de espaldas a la luz: se recorta a 0 para no «iluminar
              en negativo».
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el vector de reflexión R y para qué sirve?</h4>
            <p>
              R es la dirección en la que rebotaría el rayo de luz al chocar con la superficie, como una bola
              que rebota en una pared. Se calcula como R = 2·(N·L)·N − L. La componente especular es máxima
              cuando ese rayo reflejado apunta justo hacia tu ojo (vector de vista V), es decir cuando R·V es
              cercano a 1. Ahí ves el destello brillante.
            </p>
            <p className={styles.faqTip}>
              💡 Como el destello depende de V, se mueve cuando giras la cámara: es la pista de que algo es
              brillante y no mate.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué cambia tanto el material al mover el exponente de brillo?</h4>
            <p>
              Porque elevar un coseno (un número entre 0 y 1) a una potencia alta lo «aprieta» hacia cero
              salvo cuando está muy cerca de 1. Con brillo bajo, valores moderados de R·V todavía aportan
              algo de destello, así que el reflejo es ancho y suave (plástico). Con brillo alto, solo el
              punto donde R·V ≈ 1 brilla, dando un destello pequeño e intenso (metal pulido o vidrio).
            </p>
            <p className={styles.faqTip}>
              💡 El exponente de brillo es el control que más cambia la «sensación de material» en Phong.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿En qué se diferencia Phong de Blinn-Phong?</h4>
            <p>
              El Phong original calcula el vector de reflexión R y mide R·V. Blinn-Phong (Jim Blinn, 1977)
              usa en su lugar el vector intermedio H entre la luz y la vista, y mide N·H. Es algo más rápido,
              evita un artefacto del Phong clásico cuando el ángulo supera los 90° y da destellos más
              realistas en ángulos rasantes. Por eso fue el modelo por defecto del pipeline fijo de OpenGL.
            </p>
            <p className={styles.faqTip}>
              💡 Este visualizador usa el Phong clásico (R·V) por ser el más directo de explicar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>Si hoy se usa PBR, ¿sigue valiendo la pena aprender Phong?</h4>
            <p>
              Sí. El renderizado basado en física (PBR) es más realista porque respeta leyes físicas como la
              conservación de la energía, pero parte de los mismos conceptos: normales, dirección de la luz,
              de la vista y reflejos. Phong los explica de la forma más intuitiva posible, así que es el mejor
              punto de partida antes de pasar a modelos más avanzados.
            </p>
            <p className={styles.faqTip}>
              💡 Casi todos los cursos de gráficos empiezan por Phong precisamente por eso.
            </p>
          </div>
        </div>

        <h3>Cómo se calcula el color de un píxel paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Reconstruye la normal de la superficie</strong>
              <p>
                Para cada píxel dentro de la esfera, con sus coordenadas (x, y) relativas al centro, se
                calcula z = √(R² − x² − y²) y se normaliza el vector (x, y, z): esa es la normal N de la
                superficie en ese punto.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Calcula los vectores de luz, vista y reflejo</strong>
              <p>
                L es la dirección normalizada hacia la luz, V la dirección hacia la cámara (aquí (0, 0, 1)) y
                R = 2·(N·L)·N − L es el rayo reflejado. Todos los vectores se normalizan a longitud 1.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Suma las tres componentes</strong>
              <p>
                I = ka·ambiente + kd·max(N·L, 0)·difuso + ks·max(R·V, 0)<sup>α</sup>·especular. El término
                difuso depende de N·L (Lambert) y el especular de R·V elevado al exponente de brillo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Aplica el color y recorta a [0, 255]</strong>
              <p>
                Se multiplica cada componente por el color del material o de la luz, canal a canal (R, G, B),
                y se recorta a [0, 255] para que el valor sea un color válido. Sin ese recorte aparecen
                artefactos de desbordamiento.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Escríbelo en el lienzo</strong>
              <p>
                El color final se guarda en el ImageData del canvas y, al terminar todos los píxeles, se
                vuelca con putImageData. En una GPU este mismo cálculo lo hace el fragment shader en paralelo.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos al implementarlo tú mismo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Normaliza siempre los vectores</strong>
            <p>
              N, L, V y R deben tener longitud 1 antes de hacer productos escalares, o los ángulos saldrán
              mal y la iluminación quedará distorsionada.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Recorta N·L y R·V a cero</strong>
            <p>
              Usa max(N·L, 0) y max(R·V, 0): los valores negativos significan «de espaldas a la luz» y no
              deben restar luz a la superficie.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Recorta el color a [0, 255]</strong>
            <p>
              Al sumar tres componentes el resultado puede pasar de 1 (o de 255). Sin recorte, los canales
              desbordan y aparecen colores erróneos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Separa material y luz por canal</strong>
            <p>
              Multiplica el difuso por el color del material y el especular por el color de la luz; así un
              metal puede reflejar un destello blanco aunque sea de color.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Aísla las componentes para depurar</strong>
            <p>
              Mira solo ambiente, solo difuso o solo especular por separado: es la forma más rápida de
              encontrar por qué una superficie no se ve como esperabas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Escribe en ImageData, no con fillRect</strong>
            <p>
              Para sombrear píxel a píxel, rellenar el array de ImageData y volcarlo con putImageData es mucho
              más rápido que dibujar miles de rectángulos.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al programar iluminación de Phong</strong>
          </div>
          <ul className={styles.warningList}>
            <li>No normalizar las normales ni los vectores de luz, vista y reflejo → ángulos incorrectos y sombreado roto.</li>
            <li>Olvidar recortar el color final a [0, 255] → desbordamiento de canales y artefactos de color.</li>
            <li>No usar max(N·L, 0) → la cara de espaldas a la luz «resta» iluminación.</li>
            <li>Confundir el modelo de Phong (R·V) con Blinn-Phong (N·H): no son la misma fórmula especular.</li>
            <li>Sumar el especular incluso cuando N·L ≤ 0 → destellos fantasma en la zona en sombra.</li>
            <li>Mezclar el color del material en la componente especular cuando debería llevar el de la luz.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-iluminacion-phong')} />
      <ShareCard appName="visualizador-iluminacion-phong" />
      <Footer appName="visualizador-iluminacion-phong" />
    </div>
  );
}
