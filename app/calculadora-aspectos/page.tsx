'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './CalculadoraAspectos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface AspectPreset {
  name: string;
  ratio: string;
  width: number;
  height: number;
  icon: string;
  category: string;
}

const PRESETS: AspectPreset[] = [
  // Redes Sociales
  { name: 'Instagram Post', ratio: '1:1', width: 1080, height: 1080, icon: '📸', category: 'Redes Sociales' },
  { name: 'Instagram Story', ratio: '9:16', width: 1080, height: 1920, icon: '📱', category: 'Redes Sociales' },
  { name: 'Instagram Landscape', ratio: '1.91:1', width: 1080, height: 566, icon: '🌅', category: 'Redes Sociales' },
  { name: 'Facebook Post', ratio: '1.91:1', width: 1200, height: 630, icon: '👍', category: 'Redes Sociales' },
  { name: 'Facebook Cover', ratio: '2.7:1', width: 820, height: 312, icon: '🖼️', category: 'Redes Sociales' },
  { name: 'Twitter Post', ratio: '16:9', width: 1200, height: 675, icon: '🐦', category: 'Redes Sociales' },
  { name: 'LinkedIn Post', ratio: '1.91:1', width: 1200, height: 627, icon: '💼', category: 'Redes Sociales' },
  { name: 'Pinterest Pin', ratio: '2:3', width: 1000, height: 1500, icon: '📌', category: 'Redes Sociales' },
  // Video
  { name: 'YouTube Thumbnail', ratio: '16:9', width: 1280, height: 720, icon: '▶️', category: 'Video' },
  { name: 'YouTube Banner', ratio: '16:9', width: 2560, height: 1440, icon: '📺', category: 'Video' },
  { name: 'TikTok Video', ratio: '9:16', width: 1080, height: 1920, icon: '🎵', category: 'Video' },
  { name: '4K Ultra HD', ratio: '16:9', width: 3840, height: 2160, icon: '🎬', category: 'Video' },
  { name: 'Full HD', ratio: '16:9', width: 1920, height: 1080, icon: '📹', category: 'Video' },
  // Fotografía
  { name: 'Foto 4:3', ratio: '4:3', width: 1600, height: 1200, icon: '📷', category: 'Fotografía' },
  { name: 'Foto 3:2', ratio: '3:2', width: 1800, height: 1200, icon: '🖼️', category: 'Fotografía' },
  { name: 'Golden Ratio', ratio: '1.618:1', width: 1618, height: 1000, icon: '✨', category: 'Fotografía' },
  { name: 'Cuadrado', ratio: '1:1', width: 1000, height: 1000, icon: '⬜', category: 'Fotografía' },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;

  if (w > 100 || h > 100) {
    const ratio = width / height;
    return `${ratio.toFixed(2)}:1`;
  }

  return `${w}:${h}`;
}

export default function CalculadoraAspectosPage() {
  const [originalWidth, setOriginalWidth] = useState('1920');
  const [originalHeight, setOriginalHeight] = useState('1080');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [lockRatio, setLockRatio] = useState(true);
  const [activeField, setActiveField] = useState<'width' | 'height'>('width');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = useMemo(() => {
    const cats = [...new Set(PRESETS.map(p => p.category))];
    return ['Todos', ...cats];
  }, []);

  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'Todos') return PRESETS;
    return PRESETS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const currentRatio = useMemo(() => {
    const w = parseFloat(originalWidth) || 0;
    const h = parseFloat(originalHeight) || 0;
    if (w <= 0 || h <= 0) return { ratio: '0:0', decimal: 0 };
    return {
      ratio: simplifyRatio(w, h),
      decimal: w / h
    };
  }, [originalWidth, originalHeight]);

  const calculateNewDimension = useCallback((value: string, field: 'width' | 'height') => {
    if (!lockRatio) {
      if (field === 'width') {
        setNewWidth(value);
      } else {
        setNewHeight(value);
      }
      return;
    }

    const num = parseFloat(value) || 0;
    const ratio = currentRatio.decimal;

    if (ratio <= 0) return;

    if (field === 'width') {
      setNewWidth(value);
      if (num > 0) {
        setNewHeight(Math.round(num / ratio).toString());
      } else {
        setNewHeight('');
      }
    } else {
      setNewHeight(value);
      if (num > 0) {
        setNewWidth(Math.round(num * ratio).toString());
      } else {
        setNewWidth('');
      }
    }
  }, [lockRatio, currentRatio.decimal]);

  const applyPreset = (preset: AspectPreset) => {
    setOriginalWidth(preset.width.toString());
    setOriginalHeight(preset.height.toString());
    setNewWidth('');
    setNewHeight('');
  };

  const swapDimensions = () => {
    setOriginalWidth(originalHeight);
    setOriginalHeight(originalWidth);
    setNewWidth('');
    setNewHeight('');
  };

  const pixelCount = useMemo(() => {
    const w = parseFloat(newWidth) || 0;
    const h = parseFloat(newHeight) || 0;
    const pixels = w * h;
    if (pixels >= 1000000) {
      return `${(pixels / 1000000).toFixed(2)} MP`;
    }
    return `${pixels.toLocaleString('es-ES')} px`;
  }, [newWidth, newHeight]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📐 Calculadora de Aspectos</h1>
        <p className={styles.subtitle}>
          Redimensiona imágenes manteniendo proporciones perfectas
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Calculadora */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Dimensiones Originales</h2>

          <div className={styles.dimensionInputs}>
            <div className={styles.inputGroup}>
              <label>Ancho (px)</label>
              <input
                type="number"
                value={originalWidth}
                onChange={(e) => {
                  setOriginalWidth(e.target.value);
                  setNewWidth('');
                  setNewHeight('');
                }}
                className={styles.input}
                placeholder="1920"
              />
            </div>
            <button onClick={swapDimensions} className={styles.swapBtn} title="Intercambiar">
              ⇄
            </button>
            <div className={styles.inputGroup}>
              <label>Alto (px)</label>
              <input
                type="number"
                value={originalHeight}
                onChange={(e) => {
                  setOriginalHeight(e.target.value);
                  setNewWidth('');
                  setNewHeight('');
                }}
                className={styles.input}
                placeholder="1080"
              />
            </div>
          </div>

          <div className={styles.ratioDisplay}>
            <span className={styles.ratioLabel}>Ratio actual:</span>
            <span className={styles.ratioValue}>{currentRatio.ratio}</span>
            <span className={styles.ratioDecimal}>({currentRatio.decimal.toFixed(3)})</span>
          </div>

          <div className={styles.section}>
            <h3>Nuevas Dimensiones</h3>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={lockRatio}
                onChange={(e) => setLockRatio(e.target.checked)}
              />
              🔒 Mantener proporción
            </label>

            <div className={styles.dimensionInputs}>
              <div className={styles.inputGroup}>
                <label>Nuevo Ancho</label>
                <input
                  type="number"
                  value={newWidth}
                  onChange={(e) => calculateNewDimension(e.target.value, 'width')}
                  onFocus={() => setActiveField('width')}
                  className={`${styles.input} ${activeField === 'width' ? styles.inputActive : ''}`}
                  placeholder="Introduce ancho"
                />
              </div>
              <span className={styles.dimensionX}>×</span>
              <div className={styles.inputGroup}>
                <label>Nuevo Alto</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => calculateNewDimension(e.target.value, 'height')}
                  onFocus={() => setActiveField('height')}
                  className={`${styles.input} ${activeField === 'height' ? styles.inputActive : ''}`}
                  placeholder="Introduce alto"
                />
              </div>
            </div>

            {(newWidth || newHeight) && (
              <div className={styles.resultInfo}>
                <span>Resolución: <strong>{pixelCount}</strong></span>
              </div>
            )}
          </div>

          {/* Preview visual */}
          <div className={styles.previewSection}>
            <h3>Vista Previa</h3>
            <div className={styles.previewContainer}>
              <div
                className={styles.previewBox}
                style={{
                  aspectRatio: currentRatio.decimal > 0 ? `${currentRatio.decimal}` : '1',
                }}
              >
                <span className={styles.previewText}>{currentRatio.ratio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Presets Populares</h2>

          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.presetGrid}>
            {filteredPresets.map((preset) => (
              <button
                key={preset.name}
                className={styles.presetBtn}
                onClick={() => applyPreset(preset)}
              >
                <span className={styles.presetIcon}>{preset.icon}</span>
                <span className={styles.presetName}>{preset.name}</span>
                <span className={styles.presetSize}>{preset.width}×{preset.height}</span>
                <span className={styles.presetRatio}>{preset.ratio}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>¿Por qué mantener la proporción?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🖼️</span>
            <h4>Sin Distorsión</h4>
            <p>Las imágenes mantienen su aspecto original sin estirarse ni comprimirse</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📱</span>
            <h4>Optimizado para Redes</h4>
            <p>Cada red social tiene dimensiones ideales para mejor visualización</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>✨</span>
            <h4>Calidad Profesional</h4>
            <p>Mantén la calidad visual en cualquier tamaño de redimensionado</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía Completa de Relaciones de Aspecto"
        subtitle="Todo lo que necesitas saber para trabajar con proporciones de imagen sin distorsión"
        icon="📐"
      >
        {/* 1. Tabla Comparativa */}
        <div>
          <h3>Relaciones de Aspecto Más Usadas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Ratio</th>
                  <th>Uso Principal</th>
                  <th>Resoluciones Típicas</th>
                  <th>Dispositivos / Plataformas</th>
                  <th>Cuándo Usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>16:9</strong></td>
                  <td>Vídeo estándar HD</td>
                  <td>1920×1080, 2560×1440, 3840×2160</td>
                  <td>YouTube, televisores, monitores</td>
                  <td>Vídeos horizontales, presentaciones, streaming</td>
                </tr>
                <tr>
                  <td><strong>4:3</strong></td>
                  <td>Fotografía y pantallas antiguas</td>
                  <td>1600×1200, 2048×1536</td>
                  <td>Cámaras compactas, tablets, iPads</td>
                  <td>Fotografía clásica, documentos, presentaciones</td>
                </tr>
                <tr>
                  <td><strong>16:10</strong></td>
                  <td>Monitores de trabajo</td>
                  <td>1920×1200, 2560×1600</td>
                  <td>MacBook, monitores profesionales</td>
                  <td>Diseño gráfico, desarrollo, edición</td>
                </tr>
                <tr>
                  <td><strong>21:9</strong></td>
                  <td>Ultrawide cinematográfico</td>
                  <td>2560×1080, 3440×1440</td>
                  <td>Monitores ultrawide, cine</td>
                  <td>Gaming inmersivo, edición de vídeo</td>
                </tr>
                <tr>
                  <td><strong>1:1</strong></td>
                  <td>Cuadrado para redes sociales</td>
                  <td>1080×1080, 2000×2000</td>
                  <td>Instagram Feed, Spotify covers</td>
                  <td>Posts cuadrados, portadas de álbumes</td>
                </tr>
                <tr>
                  <td><strong>9:16</strong></td>
                  <td>Vídeo vertical móvil</td>
                  <td>1080×1920</td>
                  <td>TikTok, Instagram Reels, YouTube Shorts</td>
                  <td>Contenido para pantallas de móvil</td>
                </tr>
                <tr>
                  <td><strong>4:5</strong></td>
                  <td>Portrait para redes sociales</td>
                  <td>1080×1350</td>
                  <td>Instagram Feed vertical</td>
                  <td>Retratos, producto en catálogo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Casos de Uso */}
        <div>
          <h3>Casos de Uso por Perfil</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
                <h4>Diseñador Web</h4>
              </div>
              <p>Adapta imágenes para diferentes breakpoints sin que se vean distorsionadas en móvil, tablet y escritorio.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Hero image 1920×600 (16:2,7) → recortar a 768×480 (16:10) para tablet manteniendo el punto focal.
              </div>
              <div className={styles.escenarioTip}>
                Usa <code>object-fit: cover</code> y <code>object-position</code> en CSS para controlar el recorte automático.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
                <h4>Editor de Vídeo</h4>
              </div>
              <p>Exporta el mismo proyecto en múltiples formatos para YouTube (16:9), TikTok (9:16) e Instagram Reels (9:16).</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Proyecto 1920×1080 → exportar versión TikTok 1080×1920 encuadrando el sujeto en el centro.
              </div>
              <div className={styles.escenarioTip}>
                Define safe zones del 20% en los bordes para garantizar que el contenido clave no se recorte en ninguna plataforma.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📸</span>
                <h4>Fotógrafo</h4>
              </div>
              <p>Decide el recorte de una foto para diferentes redes sin perder la composición original (regla de los tercios).</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> RAW 6000×4000 (3:2) → Instagram 1:1 (1080×1080), Instagram Story 9:16 (1080×1920).
              </div>
              <div className={styles.escenarioTip}>
                Dispara siempre con el mayor sensor posible para tener margen de recorte en postproducción.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Desarrollador</h4>
              </div>
              <p>Calcula dimensiones exactas de thumbnails, avatares y banners en código para evitar CLS (Cumulative Layout Shift).</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Card de producto 400px de ancho con ratio 4:3 → alto exacto = 400 × (3/4) = 300px.
              </div>
              <div className={styles.escenarioTip}>
                Añade siempre <code>width</code> y <code>height</code> explícitos en <code>&lt;img&gt;</code> para que el navegador reserve espacio antes de cargar.
              </div>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div>
          <h3>Preguntas Frecuentes</h3>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué es la relación de aspecto?</dt>
              <dd>Es la proporción entre el ancho y el alto de una imagen o vídeo, expresada como dos números separados por dos puntos (ej: 16:9). No indica el tamaño real en píxeles, sino la forma del rectángulo.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué 16:9 es el estándar en vídeo?</dt>
              <dd>Fue adoptado como estándar HDTV en los años 90 porque aprovecha mejor la visión periférica humana y llena más la pantalla que el 4:3 sin desperdiciar espacio como el 21:9. Hoy es universal en YouTube, televisores y monitores.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo evitar que una imagen se deforme al redimensionar?</dt>
              <dd>Siempre calcula la nueva dimensión aplicando el mismo ratio. Si tienes 1920×1080 (16:9) y quieres 1280 de ancho: 1280 ÷ 16 × 9 = 720 píxeles de alto. Nunca cambies solo un lado sin recalcular el otro.</dd>
              <div className={styles.faqTip}>Esta calculadora lo hace automáticamente con la opción «Mantener proporción» activada.</div>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué relación de aspecto usar para Instagram?</dt>
              <dd>Depende del formato: Feed cuadrado → 1:1 (1080×1080 px), Feed portrait → 4:5 (1080×1350 px), Feed landscape → 1,91:1 (1080×566 px), Stories y Reels → 9:16 (1080×1920 px).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuál es la diferencia entre 4K y relación de aspecto?</dt>
              <dd>4K es una resolución (3840×2160 píxeles) que describe la calidad y nitidez. La relación de aspecto (16:9 en ese caso) describe la forma. Un vídeo puede ser 4K y tener ratio 4:3 si mide 4096×3072 píxeles.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es letterboxing y pillarboxing?</dt>
              <dd><strong>Letterboxing</strong>: barras negras horizontales arriba y abajo cuando el contenido es más ancho que la pantalla (ej: cine 21:9 en TV 16:9). <strong>Pillarboxing</strong>: barras negras verticales a los lados cuando el contenido es más alto (ej: vídeo vertical 9:16 en TV 16:9).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo mantener la proporción en CSS?</dt>
              <dd>Usa la propiedad <code>aspect-ratio</code> de CSS moderno: <code>aspect-ratio: 16 / 9;</code>. También puedes usar el truco del padding-top: <code>padding-top: 56.25%</code> (= 9/16 × 100) para ratio 16:9 en contenedores relativos.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué relación de aspecto usan los smartphones modernos?</dt>
              <dd>La mayoría de smartphones actuales (iPhone 14/15, Samsung S23/S24) usan ratios entre 19,5:9 y 20:9, más alargados que el 16:9 estándar. Esto explica por qué el contenido 9:16 sigue siendo el más adecuado para vídeos móviles.</dd>
            </div>
          </dl>
        </div>

        {/* 4. Guía Paso a Paso */}
        <div>
          <h3>Guía Paso a Paso: Adaptar Dimensiones para Múltiples Plataformas</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el contenido de origen</strong>
                <p>Anota las dimensiones originales de tu imagen o vídeo (ancho × alto en píxeles). Introduce estos valores en «Dimensiones Originales» de la calculadora.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Consulta los presets de plataforma</strong>
                <p>Usa el panel de Presets Populares para ver las dimensiones recomendadas por cada red social o formato de vídeo. Haz clic en el preset para cargarlo automáticamente.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Activa «Mantener proporción»</strong>
                <p>Con la opción activada (candado), introduce solo el ancho deseado y la calculadora calcula el alto correcto para evitar deformación.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Evalúa si necesitas recortar o añadir márgenes</strong>
                <p>Si el ratio de destino es diferente al original, deberás elegir: recortar la imagen (perdes contenido en los bordes) o añadir letterboxing/pillarboxing (añades fondos en los bordes).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Exporta con las dimensiones calculadas</strong>
                <p>En tu editor de imagen/vídeo (Photoshop, Figma, Premiere, DaVinci Resolve), usa las dimensiones exactas obtenidas. Para web, exporta en WebP para imágenes estáticas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Verifica en el dispositivo objetivo</strong>
                <p>Previsualiza en móvil real o con DevTools de Chrome (Ctrl+Shift+M) para comprobar que no hay recortes inesperados en el contenido clave.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Crea variantes para cada canal</strong>
                <p>Guarda una versión para cada plataforma: 1920×1080 para YouTube, 1080×1080 para Instagram Feed, 1080×1920 para Stories/TikTok. Evita comprimir el mismo archivo para todo.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* 5. Mejores Prácticas */}
        <div>
          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Usa aspect-ratio en CSS</h4>
              <p>La propiedad CSS <code>aspect-ratio: 16 / 9</code> evita tener que calcular alturas manualmente y previene el Cumulative Layout Shift (CLS) en métricas Core Web Vitals.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Exporta en la relación nativa</h4>
              <p>Nunca fuerces un contenido a una relación diferente a la que fue capturado. Exporta siempre en el ratio nativo y aplica el recorte necesario en postproducción.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <h4>Diseña con safe zones para móvil</h4>
              <p>En contenido 9:16 (Stories, TikTok), reserva un 15-20% de margen superior e inferior para elementos de UI de la plataforma (botones, texto, iconos de acciones).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>No escales menos del 50%</h4>
              <p>Al reducir una imagen más del 50% de sus dimensiones originales, la pérdida de detalle es notable. Usa imágenes nativas al tamaño de uso o ligeramente superiores.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💾</span>
              <h4>Guarda el archivo maestro sin comprimir</h4>
              <p>Trabaja siempre desde el original en máxima calidad (PSD, TIFF, RAW) y exporta versiones optimizadas para cada uso. Cada recompresión degrada la calidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <h4>Fórmula rápida mental</h4>
              <p>Para 16:9: multiplica el ancho por 0,5625 para obtener el alto. Para 4:3: multiplica el ancho por 0,75. Para 1:1: ancho = alto. Estas constantes aceleran el trabajo diario.</p>
            </div>
          </div>
        </div>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h4>Errores Frecuentes que Distorsionan el Contenido</h4>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Forzar una imagen a un ratio incorrecto sin recortar:</strong> estirar una foto 4:3 a 16:9 genera deformación visible. Siempre recorta o añade fondos.</li>
            <li><strong>Confundir resolución con relación de aspecto:</strong> 4K no es un ratio; es una resolución. Un vídeo puede ser 4K y aun así tener ratio 4:3 o 21:9.</li>
            <li><strong>Exportar vídeo vertical en contenedor horizontal:</strong> un vídeo 9:16 publicado en un reproductor 16:9 mostrará pillarboxing severo si no se ajusta el contenedor.</li>
            <li><strong>Olvidar las safe zones en redes sociales:</strong> Instagram, TikTok y YouTube superponen UI sobre el contenido. El texto o sujeto en los bordes quedará tapado.</li>
            <li><strong>Subir la misma imagen a todas las plataformas:</strong> cada red tiene dimensiones óptimas. Una imagen de 1200×630 px (Facebook) se verá recortada en Instagram Stories.</li>
            <li><strong>No especificar width/height en HTML:</strong> omitir las dimensiones en la etiqueta <code>&lt;img&gt;</code> provoca CLS, penaliza el SEO y empeora la experiencia de usuario.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-aspectos')} />

      <ShareCard appName="calculadora-aspectos" />
      <Footer appName="calculadora-aspectos" />
    </div>
  );
}
