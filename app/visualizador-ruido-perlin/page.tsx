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
import styles from './VisualizadorRuidoPerlin.module.css';

// ============== CONSTANTES ==============

const RES = 256; // resolución interna del canvas (256×256)
const LACUNARITY = 2.0; // la frecuencia se duplica en cada octava

type ModoColor = 'grises' | 'terreno';

// ============== PRNG SEMBRADO (mulberry32) ==============

// Generador pseudoaleatorio determinista a partir de una semilla entera.
// La misma semilla produce siempre la misma secuencia → mundo reproducible.
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return function generar(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============== RUIDO DE PERLIN 2D ==============

// Tabla de permutación de 512 posiciones: se baraja 0..255 con el PRNG sembrado
// y se duplica para evitar comprobar el desbordamiento de índice.
function construirPermutacion(semilla: number): Uint8Array {
  const p = new Uint8Array(512);
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i++) base[i] = i;

  const rng = mulberry32(semilla);
  // Barajado de Fisher-Yates con el PRNG sembrado
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = base[i];
    base[i] = base[j];
    base[j] = tmp;
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  return p;
}

// Curva de suavizado de Perlin: 6t⁵ - 15t⁴ + 10t³ (derivadas 1ª y 2ª nulas en 0 y 1).
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

// Producto escalar entre un gradiente pseudoaleatorio (según el hash) y el vector distancia.
function grad(hash: number, x: number, y: number): number {
  const h = hash & 7; // 8 direcciones de gradiente
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// Ruido de Perlin 2D clásico en el rango aproximado [-1, 1].
function perlin2D(p: Uint8Array, x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = p[p[xi] + yi];
  const ab = p[p[xi] + yi + 1];
  const ba = p[p[xi + 1] + yi];
  const bb = p[p[xi + 1] + yi + 1];

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v);
}

// Ruido fractal (fBm): suma de octavas. Devuelve el valor normalizado a [0, 1].
function fbm(
  p: Uint8Array,
  x: number,
  y: number,
  octavas: number,
  persistencia: number,
): number {
  let total = 0;
  let frecuencia = 1;
  let amplitud = 1;
  let maximo = 0; // suma de amplitudes para normalizar
  for (let i = 0; i < octavas; i++) {
    total += perlin2D(p, x * frecuencia, y * frecuencia) * amplitud;
    maximo += amplitud;
    amplitud *= persistencia;
    frecuencia *= LACUNARITY;
  }
  // perlin2D ≈ [-1, 1] → la suma normalizada queda en [-1, 1] → la llevamos a [0, 1]
  const normalizado = total / maximo;
  return (normalizado + 1) / 2;
}

// ============== MAPA DE COLOR "TERRENO" (estilo biomas) ==============

// Devuelve [r, g, b] según la altura del bioma:
// <0,30 agua · 0,30–0,40 arena · 0,40–0,65 hierba · 0,65–0,82 montaña · >0,82 nieve
function colorTerreno(altura: number): [number, number, number] {
  if (altura < 0.3) {
    // Agua: de azul profundo a azul costero
    const t = altura / 0.3;
    return [Math.round(20 + t * 40), Math.round(60 + t * 70), Math.round(120 + t * 80)];
  }
  if (altura < 0.4) {
    // Arena de playa
    return [214, 197, 140];
  }
  if (altura < 0.65) {
    // Hierba: de verde claro a verde oscuro al subir
    const t = (altura - 0.4) / 0.25;
    return [Math.round(110 - t * 40), Math.round(170 - t * 50), Math.round(80 - t * 30)];
  }
  if (altura < 0.82) {
    // Montaña: marrones
    const t = (altura - 0.65) / 0.17;
    return [Math.round(120 - t * 30), Math.round(95 - t * 25), Math.round(75 - t * 20)];
  }
  // Nieve: gris muy claro a blanco
  const t = Math.min(1, (altura - 0.82) / 0.18);
  const base = 225 + Math.round(t * 30);
  return [base, base, base];
}

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorRuidoPerlinPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [escala, setEscala] = useState<number>(0.02); // frecuencia base
  const [octavas, setOctavas] = useState<number>(4);
  const [persistencia, setPersistencia] = useState<number>(0.5);
  const [semilla, setSemilla] = useState<number>(42);
  const [modo, setModo] = useState<ModoColor>('terreno');

  // Redibuja el canvas cada vez que cambia un parámetro
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const perm = construirPermutacion(semilla);
    const imagen = ctx.createImageData(RES, RES);
    const datos = imagen.data;

    for (let py = 0; py < RES; py++) {
      for (let px = 0; px < RES; px++) {
        const valor = fbm(perm, px * escala, py * escala, octavas, persistencia);
        const i = (py * RES + px) * 4;
        if (modo === 'grises') {
          const g = Math.round(valor * 255);
          datos[i] = g;
          datos[i + 1] = g;
          datos[i + 2] = g;
        } else {
          const [r, g, b] = colorTerreno(valor);
          datos[i] = r;
          datos[i + 1] = g;
          datos[i + 2] = b;
        }
        datos[i + 3] = 255; // alfa opaco
      }
    }
    ctx.putImageData(imagen, 0, 0);
  }, [escala, octavas, persistencia, semilla, modo]);

  const semillaAleatoria = useCallback(() => {
    setSemilla(Math.floor(Math.random() * 1000) + 1);
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Ruido Perlin</h1>
        <p className={styles.subtitle}>
          Genera terreno procedural en tiempo real: ajusta escala, octavas y persistencia, prueba
          semillas y mira cómo nace un mapa de biomas estilo Minecraft
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.workspace}>
          {/* Panel de controles */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros del ruido</h2>

            {/* Modo de color */}
            <div className={styles.modoSelector} role="group" aria-label="Modo de color">
              <button
                type="button"
                className={`${styles.modoBtn} ${modo === 'terreno' ? styles.modoActive : ''}`}
                onClick={() => setModo('terreno')}
                aria-pressed={modo === 'terreno'}
              >
                <span aria-hidden="true">🗺️</span> Terreno
              </button>
              <button
                type="button"
                className={`${styles.modoBtn} ${modo === 'grises' ? styles.modoActive : ''}`}
                onClick={() => setModo('grises')}
                aria-pressed={modo === 'grises'}
              >
                <span aria-hidden="true">⬜</span> Escala de grises
              </button>
            </div>

            {/* Escala / zoom */}
            <div className={styles.sliderControl}>
              <label htmlFor="escala-slider">
                Escala (frecuencia base)
                <span className={styles.sliderValue}>{formatNumber(escala, 3)}</span>
              </label>
              <input
                id="escala-slider"
                type="range"
                min={0.005}
                max={0.08}
                step={0.001}
                value={escala}
                onChange={(e) => setEscala(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>
                Valores bajos = continentes grandes · valores altos = detalle pequeño
              </span>
            </div>

            {/* Octavas */}
            <div className={styles.sliderControl}>
              <label htmlFor="octavas-slider">
                Octavas
                <span className={styles.sliderValue}>{octavas}</span>
              </label>
              <input
                id="octavas-slider"
                type="range"
                min={1}
                max={8}
                step={1}
                value={octavas}
                onChange={(e) => setOctavas(parseInt(e.target.value, 10))}
              />
              <span className={styles.sliderHint}>
                Más octavas = más detalle fino (rocas, rugosidad) sobre las formas grandes
              </span>
            </div>

            {/* Persistencia */}
            <div className={styles.sliderControl}>
              <label htmlFor="persistencia-slider">
                Persistencia
                <span className={styles.sliderValue}>{formatNumber(persistencia, 2)}</span>
              </label>
              <input
                id="persistencia-slider"
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={persistencia}
                onChange={(e) => setPersistencia(parseFloat(e.target.value))}
              />
              <span className={styles.sliderHint}>
                Cuánto pesa cada octava: alta = terreno rugoso · baja = terreno suave
              </span>
            </div>

            {/* Semilla */}
            <div className={styles.sliderControl}>
              <label htmlFor="semilla-slider">
                Semilla
                <span className={styles.sliderValue}>{semilla}</span>
              </label>
              <input
                id="semilla-slider"
                type="range"
                min={1}
                max={1000}
                step={1}
                value={semilla}
                onChange={(e) => setSemilla(parseInt(e.target.value, 10))}
              />
              <span className={styles.sliderHint}>
                La misma semilla y parámetros generan siempre el mismo mapa
              </span>
            </div>

            <button type="button" className={styles.randomBtn} onClick={semillaAleatoria}>
              <span aria-hidden="true">🎲</span> Semilla aleatoria
            </button>
          </div>

          {/* Panel del canvas */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>
            <div className={styles.canvasWrapper}>
              <canvas
                ref={canvasRef}
                width={RES}
                height={RES}
                className={styles.canvas}
                aria-label={
                  modo === 'terreno'
                    ? 'Mapa de terreno generado con ruido de Perlin: zonas de agua, arena, hierba, montaña y nieve según la altura'
                    : 'Ruido de Perlin en escala de grises: las zonas claras representan valores altos y las oscuras valores bajos'
                }
                role="img"
              />
            </div>

            {modo === 'terreno' && (
              <div className={styles.leyenda}>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lAgua}`} aria-hidden="true" /> Agua
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lArena}`} aria-hidden="true" /> Arena
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lHierba}`} aria-hidden="true" /> Hierba
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lMontana}`} aria-hidden="true" /> Montaña
                </span>
                <span className={styles.leyendaItem}>
                  <span className={`${styles.leyendaColor} ${styles.lNieve}`} aria-hidden="true" /> Nieve
                </span>
              </div>
            )}

            <div className={styles.hint}>
              El lienzo se calcula a {RES}×{RES} píxeles y se escala a tu pantalla con bordes nítidos.
              Cada píxel es un valor de ruido entre 0 y 1.
            </div>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía del Ruido de Perlin y la Generación Procedimental"
        subtitle="Qué es el ruido coherente, cómo funciona el fBm y para qué se usa en videojuegos"
      >
        <h3>Tres formas de generar valores: del ruido puro al fractal</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>¿Cómo se calcula?</th>
                <th>Aspecto</th>
                <th>¿Útil para terreno?</th>
                <th>Coste</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ruido aleatorio puro</strong></td>
                <td>Cada píxel, un número independiente</td>
                <td>Granulado tipo «nieve» de TV</td>
                <td>No: no hay formas ni continuidad</td>
                <td>Muy bajo</td>
              </tr>
              <tr>
                <td><strong>Ruido de Perlin (1 octava)</strong></td>
                <td>Interpola gradientes en una rejilla</td>
                <td>Manchas suaves y onduladas</td>
                <td>Sí, pero demasiado liso</td>
                <td>Bajo</td>
              </tr>
              <tr>
                <td><strong>Ruido fractal (fBm)</strong></td>
                <td>Suma varias octavas de Perlin</td>
                <td>Colinas grandes + detalle fino</td>
                <td>Sí, es el estándar para paisajes</td>
                <td>Medio (× nº de octavas)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa la generación procedimental</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⛰️</span>
              <strong>Terreno de videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Mundos abiertos como Minecraft o No Man&apos;s Sky generan la altura del terreno con
              ruido y la dividen en biomas por rangos de altura. Una semilla = un mundo entero.
            </p>
            <p className={styles.escenarioTip}>
              💡 Cambiar la escala hace los continentes más grandes o más fragmentados.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">☁️</span>
              <strong>Texturas y nubes</strong>
            </div>
            <p className={styles.escenarioExample}>
              El ruido fractal sirve para nubes, humo, mármol, madera o vetas: se mapea el valor de
              ruido a un degradado de color en lugar de a una altura.
            </p>
            <p className={styles.escenarioTip}>
              💡 Animar el ruido en el tiempo (3D, con z = tiempo) da nubes que se mueven.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌎</span>
              <strong>Mapas de biomas</strong>
            </div>
            <p className={styles.escenarioExample}>
              Combinando un mapa de altura y otro de humedad (dos ruidos con semillas distintas) se
              deciden desiertos, bosques o tundra, no solo por la altura.
            </p>
            <p className={styles.escenarioTip}>
              💡 Aquí solo usamos la altura; añadir un segundo ruido de humedad es el paso natural.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">✨</span>
              <strong>Efectos y movimiento orgánico</strong>
            </div>
            <p className={styles.escenarioExample}>
              El ruido coherente da movimiento natural: parpadeo de fuego, ondas de agua, temblor de
              cámara o desplazamiento de partículas sin que parezca aleatorio brusco.
            </p>
            <p className={styles.escenarioTip}>
              💡 Por su suavidad, el ruido de Perlin es ideal para animar sin saltos bruscos.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Quién inventó el ruido de Perlin?</h4>
            <p>
              Lo creó Ken Perlin en 1983 mientras trabajaba en los efectos de la película Tron, porque
              las texturas generadas por ordenador de la época parecían demasiado artificiales. La
              técnica se hizo tan influyente que en 1997 recibió un Oscar técnico de la Academia. En
              2001 publicó una versión mejorada, el Simplex noise, más rápida en dimensiones altas.
            </p>
            <p className={styles.faqTip}>
              💡 El ruido que ves aquí es el Perlin clásico de 1985, el más didáctico para empezar.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué el ruido de Perlin se ve «suave» y el ruido normal no?</h4>
            <p>
              Porque no asigna un valor aleatorio a cada punto, sino que coloca gradientes
              pseudoaleatorios en las esquinas de una rejilla e interpola entre ellos con una curva
              suave (la función <em>fade</em>). Así, dos puntos cercanos siempre tienen valores
              parecidos, lo que produce transiciones graduales en lugar de saltos.
            </p>
            <p className={styles.faqTip}>
              💡 Esa continuidad es la razón por la que sirve para terreno: el mundo real también es
              continuo.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué pasa si subo o bajo las octavas?</h4>
            <p>
              Con 1 octava obtienes formas grandes y lisas. Cada octava añadida superpone una capa de
              ruido con el doble de frecuencia y menos amplitud, lo que aporta detalle cada vez más
              fino: rugosidades, riscos, pequeñas islas. A partir de 6-8 octavas el detalle extra ya
              casi no se aprecia y solo cuesta más cálculo.
            </p>
            <p className={styles.faqTip}>
              💡 Prueba con 1 octava y sube de una en una para ver cómo aparece el detalle.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Y la persistencia, qué cambia?</h4>
            <p>
              La persistencia decide cuánta amplitud conserva cada octava respecto a la anterior. Con
              persistencia alta (0,7-0,9) las octavas de detalle pesan mucho y el terreno sale rugoso y
              caótico. Con persistencia baja (0,1-0,3) el detalle apenas influye y el resultado es
              suave, dominado por las formas grandes.
            </p>
            <p className={styles.faqTip}>
              💡 0,5 es un valor de partida equilibrado: cada octava pesa la mitad que la anterior.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se generan los biomas a partir del ruido?</h4>
            <p>
              El ruido devuelve un número entre 0 y 1 que aquí se interpreta como altura. Después se
              reparten franjas: por debajo de 0,30 es agua, hasta 0,40 arena, hasta 0,65 hierba, hasta
              0,82 montaña y por encima nieve. Cambiar esos umbrales modifica cuánta superficie ocupa
              cada bioma sin tocar el ruido en sí.
            </p>
            <p className={styles.faqTip}>
              💡 Subir el umbral del agua «inunda» el mapa; bajarlo deja más tierra firme.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué con la misma semilla sale siempre el mismo mapa?</h4>
            <p>
              Porque la semilla inicializa un generador pseudoaleatorio determinista (aquí
              mulberry32), que baraja siempre igual la tabla de permutación del ruido. No hay azar
              real: con la misma semilla y los mismos parámetros, cada píxel se calcula idéntico. Por
              eso los juegos permiten compartir una semilla para recrear exactamente un mundo.
            </p>
            <p className={styles.faqTip}>
              💡 Anota una semilla que te guste: podrás reproducir ese mapa cuando quieras.
            </p>
          </div>
        </div>

        <h3>Cómo funciona el ruido fractal paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Siembra el generador</strong>
              <p>
                A partir de la semilla se baraja la tabla de permutación (0..255 duplicada a 512). Esto
                fija las direcciones de los gradientes y hace el resultado reproducible.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Calcula una octava de Perlin</strong>
              <p>
                Para cada píxel, busca la celda de la rejilla, mezcla los gradientes de sus cuatro
                esquinas con la curva <em>fade</em> e interpola (<em>lerp</em>) para obtener un valor
                suave entre -1 y 1.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Suma las octavas (fBm)</strong>
              <p>
                Repite con el doble de frecuencia y menos amplitud en cada octava, y suma. Las primeras
                octavas dan las formas grandes; las últimas, el detalle fino.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Normaliza a [0, 1]</strong>
              <p>
                Divide la suma entre la suma de amplitudes y reescala de [-1, 1] a [0, 1]. Así el valor
                es comparable entre configuraciones y se puede usar como altura.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Mapea a color</strong>
              <p>
                Convierte el valor en gris (×255) o en un bioma por rangos de altura, y escríbelo en el
                <em> ImageData</em> del canvas píxel a píxel.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos al implementarlo tú mismo</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Usa una tabla de permutación</strong>
            <p>
              Barajar 0..255 una vez y duplicarla a 512 evita comprobar desbordamientos de índice y
              hace el ruido rápido y determinista.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Normaliza siempre el fBm</strong>
            <p>
              Divide entre la suma de amplitudes. Si no, al cambiar octavas o persistencia el rango se
              descontrola y el mapa sale lavado o saturado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Escribe en ImageData, no con fillRect</strong>
            <p>
              Pintar píxel a píxel con <em>putImageData</em> es mucho más rápido que dibujar miles de
              rectángulos pequeños en el canvas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Ajusta la escala con cuidado</strong>
            <p>
              La frecuencia base define el «zoom». Multiplica las coordenadas del píxel por ella;
              valores muy altos rompen la continuidad y vuelve a parecer ruido puro.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Separa altura y biomas</strong>
            <p>
              Genera primero el valor de ruido y decide el color después por rangos. Así puedes
              reajustar los biomas sin recalcular el ruido.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <strong>Píxeles nítidos al escalar</strong>
            <p>
              Calcula a baja resolución (aquí 256×256) y escala por CSS con <em>image-rendering:
              pixelated</em> para no difuminar el mapa.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠</span>
            <strong>Errores frecuentes al generar ruido</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Confundir ruido de Perlin con ruido aleatorio puro: el primero es continuo, el segundo no.</li>
            <li>No normalizar el fBm → el mapa sale demasiado claro u oscuro al cambiar octavas o persistencia.</li>
            <li>Usar las coordenadas del píxel sin multiplicar por la escala → todo queda dentro de una sola celda y se ve plano.</li>
            <li>Olvidar sembrar el PRNG → cada recarga da un mapa distinto y no se puede reproducir.</li>
            <li>Repintar con miles de fillRect en vez de ImageData → render lento y a tirones.</li>
            <li>Suavizar con interpolación lineal en vez de la curva fade → aparecen artefactos en forma de cuadrícula.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ruido-perlin')} />
      <ShareCard appName="visualizador-ruido-perlin" />
      <Footer appName="visualizador-ruido-perlin" />
    </div>
  );
}
