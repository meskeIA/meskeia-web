'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import styles from './SimuladorDaltonismo.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  MATRICES_CVD,
  CVD_META,
  srgbALineal,
  linealASrgb,
  type TipoCVD,
} from '@/lib/calculadoras/daltonismo';

/** Las ocho vistas las define el motor compartido: aquí no se redefinen. */
type TipoDaltonismo = TipoCVD;

interface InfoTipo {
  id: TipoDaltonismo;
  nombre: string;
  descripcion: string;
  prevalencia: string;
  icono: string;
}

const TIPOS: InfoTipo[] = [
  {
    id: 'normal',
    nombre: 'Visión tricromática',
    descripcion: 'Visión cromática estándar con los tres conos (L, M, S) funcionando correctamente.',
    prevalencia: '~92% hombres · ~99,5% mujeres',
    icono: '👁️',
  },
  {
    id: 'deuteranomaly',
    nombre: 'Deuteranomalía',
    descripcion: 'Cono M (verde) con sensibilidad reducida. Forma de daltonismo más frecuente en el mundo.',
    prevalencia: '~5% hombres · ~0,4% mujeres',
    icono: '🟩',
  },
  {
    id: 'deuteranopia',
    nombre: 'Deuteranopia',
    descripcion: 'Ausencia funcional del cono M. Confusión rojo-verde muy marcada.',
    prevalencia: '~1% hombres · ~0,01% mujeres',
    icono: '🟢',
  },
  {
    id: 'protanomaly',
    nombre: 'Protanomalía',
    descripcion: 'Cono L (rojo) alterado. Reducción de sensibilidad al rojo y confusión rojo-verde leve.',
    prevalencia: '~1% hombres · ~0,03% mujeres',
    icono: '🟥',
  },
  {
    id: 'protanopia',
    nombre: 'Protanopia',
    descripcion: 'Ausencia funcional del cono L. El rojo se percibe muy oscuro o negro.',
    prevalencia: '~1% hombres · ~0,02% mujeres',
    icono: '🔴',
  },
  {
    id: 'tritanomaly',
    nombre: 'Tritanomalía',
    descripcion: 'Cono S (azul) alterado. Sensibilidad reducida al azul, raro.',
    prevalencia: '<0,01% (rara)',
    icono: '🟦',
  },
  {
    id: 'tritanopia',
    nombre: 'Tritanopia',
    descripcion: 'Ausencia funcional del cono S. Azul y amarillo se confunden.',
    prevalencia: '<0,01% (rara)',
    icono: '🔵',
  },
  {
    id: 'achromatopsia',
    nombre: 'Acromatopsia',
    descripcion: 'Ausencia total de visión cromática. Solo se percibe escala de grises (luminancia).',
    prevalencia: '~0,003% (muy rara)',
    icono: '⚫',
  },
];

/**
 * Las matrices viven en `@/lib/calculadoras/daltonismo`, compartidas con
 * `simulador-baja-vision`.
 *
 * Hasta el 20/09/2026 estaban aquí, duplicadas literalmente en la otra app y mal
 * atribuidas: se decía que eran las de Machado et al. (2009) y eran el juego HCIRN/Wickline
 * de los filtros SVG de accesibilidad, que es INVERTIBLE y por tanto no puede fundir dos
 * colores en uno — justo lo que esta app existe para enseñar.
 */
const MATRICES = MATRICES_CVD;

const TAMANO_MAX = 720;

// La linealización (sRGB ↔ luz) vive en el motor: `srgbALineal` / `linealASrgb`,
// que ya acotan y redondean el canal — por eso aquí sobra el `clamp255` que había.
// Machado se multiplica contra luz LINEAL, no contra los 0-255 de sRGB.

function aplicarMatriz(src: ImageData, m: readonly (readonly number[])[]): ImageData {
  const dst = new ImageData(src.width, src.height);
  const sd = src.data;
  const dd = dst.data;
  for (let i = 0; i < sd.length; i += 4) {
    const r = srgbALineal(sd[i]);
    const g = srgbALineal(sd[i + 1]);
    const b = srgbALineal(sd[i + 2]);
    dd[i]     = linealASrgb(r * m[0][0] + g * m[0][1] + b * m[0][2]);
    dd[i + 1] = linealASrgb(r * m[1][0] + g * m[1][1] + b * m[1][2]);
    dd[i + 2] = linealASrgb(r * m[2][0] + g * m[2][1] + b * m[2][2]);
    dd[i + 3] = sd[i + 3];
  }
  return dst;
}

function dibujarImagenDemo(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  // 1. Paleta arcoíris (8 bandas)
  const colores = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#319795', '#3182CE', '#5A67D8', '#D53F8C'];
  const nombres = ['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Teal', 'Azul', 'Violeta', 'Rosa'];
  const bandaW = w / colores.length;
  colores.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * bandaW, 0, bandaW, 110);
  });
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  nombres.forEach((t, i) => {
    ctx.fillText(t, i * bandaW + bandaW / 2, 60);
  });

  // 2. Botones UI éxito vs error
  ctx.fillStyle = '#38A169';
  ctx.fillRect(40, 140, 180, 56);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Éxito', 130, 175);

  ctx.fillStyle = '#E53E3E';
  ctx.fillRect(w - 220, 140, 180, 56);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Error', w - 130, 175);

  // 3. Mapa de calor (10 niveles)
  const heat = ['#2C5282', '#3182CE', '#63B3ED', '#90CDF4', '#FBD38D', '#F6AD55', '#ED8936', '#DD6B20', '#E53E3E', '#9B2C2C'];
  const cellW = (w - 80) / heat.length;
  heat.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(40 + i * cellW, 220, cellW, 50);
  });
  ctx.fillStyle = '#1A1A1A';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Frío', 40, 290);
  ctx.textAlign = 'right';
  ctx.fillText('Caliente', w - 40, 290);

  // 4. Semáforo
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1A1A1A';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Estado:', 40, 330);

  const cy = 360;
  const r = 24;
  const colSem = ['#E53E3E', '#D69E2E', '#38A169'];
  colSem.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(140 + i * 70, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  // 5. Texto final
  ctx.fillStyle = '#1A1A1A';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Imagen de prueba con elementos UI típicos · sube la tuya para verificar la accesibilidad de tu diseño', w / 2, h - 16);
}

export default function SimuladorDaltonismoPage() {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [simulaciones, setSimulaciones] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [nombreArchivo, setNombreArchivo] = useState<string>('demo.png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const procesarImagen = useCallback(async (url: string) => {
    setProcesando(true);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();

      let w = img.width;
      let h = img.height;
      if (w > TAMANO_MAX) {
        h = Math.round((h * TAMANO_MAX) / w);
        w = TAMANO_MAX;
      }

      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = w;
      sourceCanvas.height = h;
      const sourceCtx = sourceCanvas.getContext('2d');
      if (!sourceCtx) return;
      sourceCtx.drawImage(img, 0, 0, w, h);
      const sourceData = sourceCtx.getImageData(0, 0, w, h);

      const nuevas: Record<string, string> = {};
      for (const tipo of TIPOS) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const cx = c.getContext('2d');
        if (!cx) continue;
        if (tipo.id === 'normal') {
          cx.putImageData(sourceData, 0, 0);
        } else {
          cx.putImageData(aplicarMatriz(sourceData, MATRICES[tipo.id]), 0, 0);
        }
        nuevas[tipo.id] = c.toDataURL('image/png');
        await new Promise((r) => setTimeout(r, 0));
      }

      setSimulaciones(nuevas);
    } finally {
      setProcesando(false);
    }
  }, []);

  const cargarImagenDemo = useCallback(() => {
    const c = document.createElement('canvas');
    c.width = 720;
    c.height = 410;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    dibujarImagenDemo(ctx, c.width, c.height);
    setNombreArchivo('demo.png');
    setOriginalUrl(c.toDataURL('image/png'));
  }, []);

  useEffect(() => {
    cargarImagenDemo();
  }, [cargarImagenDemo]);

  useEffect(() => {
    if (originalUrl) {
      procesarImagen(originalUrl);
    }
  }, [originalUrl, procesarImagen]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido (JPG, PNG, WEBP...).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen supera 10 MB. Usa una de menor tamaño.');
      return;
    }
    setNombreArchivo(file.name);
    setOriginalUrl(URL.createObjectURL(file));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const descargar = (tipo: TipoDaltonismo) => {
    const url = simulaciones[tipo];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    const baseName = nombreArchivo.replace(/\.[^.]+$/, '');
    a.download = `${baseName}_${tipo}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🌈</span> Simulador de Daltonismo
        </h1>
        <p className={styles.subtitle}>
          Visualiza cómo perciben tus diseños las personas con daltonismo. Sube una imagen o usa la paleta de prueba y verás
          al instante 8 simulaciones generadas con matrices oficiales. Todo el procesamiento ocurre en tu navegador.
        </p>
      </header>

      <LegalNotice />

      {/* Qué NO es esta herramienta, sin tener que abrir nada. Hasta el 20/09/2026 esto solo
          existía dentro de <EducationalSection>, que nace colapsada: la app lleva
          `@disclaimer: exempt` en la línea 2, así que era el único texto que acotaba su
          alcance y no se leía sin desplegar. */}
      <p className={styles.avisoAlcance}>
        <span aria-hidden="true">👁️</span> Esto es una <strong>herramienta de diseño</strong>, no una prueba
        diagnóstica. El daltonismo se diagnostica con tests específicos (Ishihara, Farnsworth-Munsell)
        realizados por un profesional de la salud visual. La simulación modela la percepción en la retina, no
        la adaptación aprendida por el cerebro.
      </p>

      <div
        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        role="button"
        tabIndex={0}
        aria-label="Subir imagen para simulación de daltonismo"
      >
        <div className={styles.dropZoneIcon} aria-hidden="true">🖼️</div>
        <p className={styles.dropZoneTitle}>Arrastra una imagen o haz clic para seleccionar</p>
        <p className={styles.dropZoneHint}>JPG, PNG o WEBP · hasta 10 MB · se redimensiona a 720 px de ancho</p>
        <div className={styles.dropZoneButtons}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <span aria-hidden="true">📁</span> Subir imagen
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={(e) => {
              e.stopPropagation();
              cargarImagenDemo();
            }}
          >
            <span aria-hidden="true">🔄</span> Usar imagen demo
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleInputChange}
        />
      </div>

      {procesando && (
        <div className={styles.processing} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true"></span>
          Procesando las 8 simulaciones...
        </div>
      )}

      {!procesando && Object.keys(simulaciones).length > 0 && (
        <div className={styles.grid}>
          {TIPOS.map((tipo) => (
            <article
              key={tipo.id}
              className={`${styles.card} ${tipo.id === 'normal' ? styles.cardNormal : ''}`}
            >
              {simulaciones[tipo.id] && (
                <img
                  src={simulaciones[tipo.id]}
                  alt={`Imagen vista con ${tipo.nombre}`}
                  className={styles.cardImage}
                  loading="lazy"
                />
              )}
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon} aria-hidden="true">{tipo.icono}</span>
                <h3 className={styles.cardName}>{tipo.nombre}</h3>
              </div>
              <p className={styles.cardDescription}>{tipo.descripcion}</p>
              <p className={styles.cardPrevalence}>{tipo.prevalencia}</p>
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.btnDownload}
                  onClick={() => descargar(tipo.id)}
                  aria-label={`Descargar simulación ${tipo.nombre}`}
                >
                  <span aria-hidden="true">⬇</span> Descargar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <EducationalSection
        title="Todo sobre daltonismo y diseño accesible"
        subtitle="Cómo funciona la visión cromática, qué tipos existen y cómo diseñar para que tu interfaz funcione para todos"
      >
        <section className={styles.guideSection}>
          <p>
            El daltonismo (más correctamente, <strong>deficiencia de visión cromática</strong>) rojo-verde afecta a
            cerca del 8% de los hombres y al 0,4% de las mujeres de ascendencia europea, según la revisión de encuestas
            poblacionales de Birch (2012). La prevalencia <strong>no es la misma en todo el mundo</strong>: en hombres
            de ascendencia china y japonesa esa misma revisión la sitúa entre el 4% y el 6,5%. No es ceguera al color:
            es una percepción distinta debido a que uno de los tres tipos de conos retinianos (L para rojo, M para
            verde, S para azul) funciona de forma diferente o está ausente. Como diseñador o desarrollador, conviene
            comprobar que tu interfaz comunica la información también sin depender exclusivamente del color.
          </p>
          <p className={styles.fuenteDato}>
            Fuente de las cifras de prevalencia: Birch, J. (2012), «Worldwide prevalence of red-green color
            deficiency», <em>Journal of the Optical Society of America A</em> 29(3), 313-320. Los porcentajes por tipo
            de las tarjetas de arriba son desgloses aproximados y pueden no sumar exactamente el total.
          </p>

          <h3>Tipos de daltonismo en una tabla</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Cono afectado</th>
                  <th>Efecto principal</th>
                  <th>Prevalencia (hombres)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Deuteranomalía</strong></td><td>M (verde) alterado</td><td>Confusión leve rojo-verde</td><td>~5%</td></tr>
                <tr><td><strong>Deuteranopia</strong></td><td>M (verde) ausente</td><td>Confusión marcada rojo-verde</td><td>~1%</td></tr>
                <tr><td><strong>Protanomalía</strong></td><td>L (rojo) alterado</td><td>Rojos apagados, confusión rojo-verde</td><td>~1%</td></tr>
                <tr><td><strong>Protanopia</strong></td><td>L (rojo) ausente</td><td>Rojos muy oscuros o negros</td><td>~1%</td></tr>
                <tr><td><strong>Tritanomalía / Tritanopia</strong></td><td>S (azul) alterado/ausente</td><td>Confusión azul-amarillo</td><td>&lt;0,01%</td></tr>
                <tr><td><strong>Acromatopsia</strong></td><td>Ningún cono funcional</td><td>Visión en escala de grises</td><td>~0,003%</td></tr>
              </tbody>
            </table>
          </div>

          <h3>¿A quién le sirve este simulador?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
              <h4>Diseñador UI/UX</h4>
              <p>Comprueba si tu paleta de marca, estados de botón (éxito/error) o categorías de un dashboard se siguen distinguiendo bajo deuteranopia o protanopia.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
              <h4>Analista de datos</h4>
              <p>Tu mapa de calor o tu gráfico de barras puede ser ininteligible para el 5% de tu audiencia. Verifica que el patrón se entiende sin color.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧑‍🏫</span>
              <h4>Docente</h4>
              <p>Muestra a tus alumnos cómo cambia la percepción del color y por qué el diseño accesible importa. Útil en clases de biología, arte o tecnología.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
              <h4>Desarrollador frontend</h4>
              <p>Antes de pushear, prueba tus capturas de pantalla aquí y comprueba que los iconos rojo/verde tienen también forma, texto o posición distintivos.</p>
            </div>
          </div>

          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqItem}>
            <h4>¿La imagen que subo viaja a algún servidor?</h4>
            <p>No. Todo el procesamiento ocurre en tu navegador con la API Canvas. La imagen nunca abandona tu equipo. Puedes verificarlo en las DevTools del navegador (pestaña Network).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué los rojos no se ven exactamente negros en protanopia?</h4>
            <p>Las matrices Machado et al. (2009) modelan la percepción retiniana, pero el cerebro de una persona con protanopia ha aprendido toda la vida a interpretar los rojos a partir de la luminancia y de los conos M restantes. La simulación es una aproximación, no una réplica exacta.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Las matrices que usas son las correctas?</h4>
            <p>Sí. Son las matrices publicadas en Machado, Oliveira &amp; Fernandes (2009), &ldquo;A Physiologically-based Model for Simulation of Color Vision Deficiency&rdquo;, IEEE TVCG. Es el estándar de facto en herramientas de accesibilidad como Sim Daltonism o Color Oracle. Dos precisiones que conviene conocer: las tres formas <strong>anómalas</strong> se simulan con severidad 0,6 —una alteración moderada—, porque a severidad 1 serían indistinguibles de la dicromacia correspondiente; y el ajuste del modelo para la <strong>tritanopia</strong> es el menos fiable de los tres, al ser la deficiencia más rara y con menos datos experimentales.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Esta herramienta sirve para diagnóstico?</h4>
            <p>No. El daltonismo se diagnostica con tests específicos (Ishihara, Farnsworth-Munsell) realizados por un profesional. Esta herramienta solo simula la percepción para diseñadores.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la imagen se redimensiona a 720 px?</h4>
            <p>Para que el procesamiento sea instantáneo incluso en móviles. La simulación se aplica píxel a píxel y a 4K serían millones de operaciones. 720 px es suficiente para comparar paletas y elementos UI.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Puedo simular daltonismo desde el navegador con DevTools?</h4>
            <p>Chrome y Firefox tienen simulaciones cromáticas en su panel &ldquo;Rendering&rdquo; (DevTools) que aplican a toda la página. Útil para auditar webs en vivo. Esta app es complementaria: procesa una imagen concreta y permite descargarla.</p>
          </div>

          <h3>Cómo usar el simulador paso a paso</h3>
          <ol className={styles.pasosList}>
            <li>Al cargar la página verás una imagen demo con paleta, botones UI, mapa de calor y un semáforo. Sirve como referencia rápida.</li>
            <li>Para tu propio diseño: arrastra la imagen al recuadro o haz clic en &ldquo;Subir imagen&rdquo;.</li>
            <li>Espera unos segundos a que aparezcan las 8 simulaciones. La primera tarjeta (con borde azul) es la visión normal.</li>
            <li>Compara las versiones: identifica qué elementos pierden contraste o significado en deuteranopia y protanopia (los tipos más frecuentes).</li>
            <li>Si algo se vuelve ilegible, vuelve a tu diseño y refuérzalo con texto, iconos o patrones diferenciables sin color.</li>
            <li>Pulsa &ldquo;Descargar&rdquo; en cualquier tarjeta para guardar la imagen procesada (útil para pegarla en una revisión o documentar el problema al equipo).</li>
          </ol>

          <h3>Buenas prácticas de diseño accesible al color</h3>
          <ul className={styles.tipsList}>
            <li><strong>Nunca uses solo el color</strong> para distinguir estados o categorías. Añade iconos, texto, posición o patrones.</li>
            <li><strong>Contraste mínimo WCAG 4,5:1</strong> entre texto y fondo (3:1 para texto grande). Comprueba con la <a href="/contraste-colores/">Calculadora de Contraste</a>.</li>
            <li><strong>Rojo + verde es la combinación más problemática</strong>. Si necesitas indicar éxito/error, usa azul/naranja o combinaciones con luminancia muy distinta.</li>
            <li><strong>Mapas de calor con escala monocromática</strong> (claro→oscuro) o paletas viridis/plasma se entienden mejor que rojo→verde.</li>
            <li><strong>Patrones de relleno</strong> (rayado, puntos, líneas) en gráficos de barras añaden una dimensión accesible además del color.</li>
            <li><strong>Texto sobre fondo de color</strong>: comprueba que sigue siendo legible bajo deuteranomalía (5% de tu audiencia).</li>
          </ul>

          <div className={styles.warningBox}>
            <h4>Errores frecuentes que evitar</h4>
            <ul>
              <li>Indicar campos obligatorios solo con asterisco rojo: el rojo sobre blanco pierde contraste en protanopia.</li>
              <li>Usar verde para validación correcta y rojo para error sin icono ni texto: en deuteranopia se ven casi idénticos.</li>
              <li>Mapas/gráficos con leyenda donde la diferencia entre categorías es solo el matiz: añade líneas, patrones o etiquetas.</li>
              <li>Confiar en la simulación como diagnóstico: solo modela la percepción retiniana, no la adaptación cerebral.</li>
            </ul>
          </div>

          <h3>Sobre las matrices y los algoritmos</h3>
          <p>
            La simulación se basa en transformaciones lineales mediante matrices 3×3. Cada matriz reproduce cómo
            cambiaría la señal en la retina al carecer (dicromacia) o tener alterado (anomalía) uno de los conos. Se
            multiplican contra <strong>RGB lineal</strong>, no contra los valores de 0 a 255 que guarda la imagen: hay
            que deshacer antes la curva gamma del sRGB y volver a aplicarla después, porque el modelo está definido
            sobre luz y no sobre la señal codificada. Esto da una imagen perceptualmente cercana, aunque no idéntica, a
            lo que vería una persona con esa deficiencia. Las matrices están publicadas en Machado, Oliveira &amp;
            Fernandes (2009) y son las más citadas en herramientas de accesibilidad; en esta app se leen del mismo
            módulo que usa el simulador de baja visión, para que las dos no puedan divergir.{' '}
            <a href={CVD_META.urlOficial} target="_blank" rel="noopener noreferrer">
              Tabla original de los autores
            </a>{' '}
            ({CVD_META.publicacion}). Datos verificados el {CVD_META.verificado.split('-').reverse().join('/')}.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-daltonismo')} />

      <ShareCard appName="simulador-daltonismo" />

      <Footer appName="simulador-daltonismo" />
    </div>
  );
}
