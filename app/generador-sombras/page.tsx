'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GeneradorSombras.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type ShadowType = 'box' | 'text';

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface ShadowPreset {
  name: string;
  layers: Omit<ShadowLayer, 'id'>[];
  type: ShadowType;
}

const PRESETS: ShadowPreset[] = [
  {
    name: 'Suave',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.1, inset: false }]
  },
  {
    name: 'Elevado',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 8, blur: 24, spread: -4, color: '#000000', opacity: 0.15, inset: false }]
  },
  {
    name: 'Flotante',
    type: 'box',
    layers: [
      { offsetX: 0, offsetY: 20, blur: 40, spread: -12, color: '#000000', opacity: 0.2, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: -2, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Neomorfismo',
    type: 'box',
    layers: [
      { offsetX: 10, offsetY: 10, blur: 30, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { offsetX: -10, offsetY: -10, blur: 30, spread: 0, color: '#ffffff', opacity: 0.7, inset: false }
    ]
  },
  {
    name: 'Interior',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.2, inset: true }]
  },
  {
    name: 'Dramático',
    type: 'box',
    layers: [{ offsetX: 12, offsetY: 12, blur: 0, spread: 0, color: '#1A1A1A', opacity: 1, inset: false }]
  },
  {
    name: 'Glow',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 0, blur: 20, spread: 5, color: '#2E86AB', opacity: 0.6, inset: false }]
  },
  {
    name: 'Multicapa',
    type: 'box',
    layers: [
      { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.06, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.08, inset: false },
      { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Texto Sutil',
    type: 'text',
    layers: [{ offsetX: 1, offsetY: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.3, inset: false }]
  },
  {
    name: 'Texto Glow',
    type: 'text',
    layers: [{ offsetX: 0, offsetY: 0, blur: 10, spread: 0, color: '#2E86AB', opacity: 0.8, inset: false }]
  },
];

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function GeneradorSombrasPage() {
  const [shadowType, setShadowType] = useState<ShadowType>('box');
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: '1', offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.1, inset: false }
  ]);
  const [activeLayer, setActiveLayer] = useState('1');
  const [boxColor, setBoxColor] = useState('#FFFFFF');
  const [boxRadius, setBoxRadius] = useState(12);
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLayer = () => {
    if (layers.length >= 5) return;
    const newLayer: ShadowLayer = {
      id: generateId(),
      offsetX: 0,
      offsetY: 8,
      blur: 16,
      spread: 0,
      color: '#000000',
      opacity: 0.15,
      inset: false
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeLayer === id) {
      setActiveLayer(newLayers[0].id);
    }
  };

  const updateLayer = (id: string, field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const currentLayer = layers.find(l => l.id === activeLayer) || layers[0];

  const shadowCSS = useMemo(() => {
    const shadowsStr = layers.map(l => {
      const color = hexToRgba(l.color, l.opacity);
      if (shadowType === 'box') {
        return `${l.inset ? 'inset ' : ''}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${color}`;
      } else {
        return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${color}`;
      }
    }).join(',\n    ');

    return shadowType === 'box'
      ? `box-shadow: ${shadowsStr};`
      : `text-shadow: ${shadowsStr};`;
  }, [layers, shadowType]);

  const previewStyle = useMemo(() => {
    const shadowValue = layers.map(l => {
      const color = hexToRgba(l.color, l.opacity);
      if (shadowType === 'box') {
        return `${l.inset ? 'inset ' : ''}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${color}`;
      } else {
        return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${color}`;
      }
    }).join(', ');

    if (shadowType === 'box') {
      return { boxShadow: shadowValue, background: boxColor, borderRadius: `${boxRadius}px` };
    } else {
      return { textShadow: shadowValue };
    }
  }, [layers, shadowType, boxColor, boxRadius]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shadowCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const applyPreset = (preset: ShadowPreset) => {
    setShadowType(preset.type);
    const newLayers = preset.layers.map(l => ({ ...l, id: generateId() }));
    setLayers(newLayers);
    setActiveLayer(newLayers[0].id);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🌓 Generador de Sombras CSS</h1>
        <p className={styles.subtitle}>
          Crea box-shadow y text-shadow con editor visual
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Preview */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div className={styles.previewArea}>
            {shadowType === 'box' ? (
              <div className={styles.previewBox} style={previewStyle}>
                <span>Preview</span>
              </div>
            ) : (
              <div className={styles.previewText} style={previewStyle}>
                Texto de Ejemplo
              </div>
            )}
          </div>

          {shadowType === 'box' && (
            <div className={styles.boxOptions}>
              <div className={styles.optionRow}>
                <label>Color de fondo</label>
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className={styles.colorPicker}
                />
              </div>
              <div className={styles.optionRow}>
                <label>Border radius: {boxRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={boxRadius}
                  onChange={(e) => setBoxRadius(parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>
          )}

          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>CSS</span>
              <button
                onClick={copyToClipboard}
                className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{shadowCSS}</code>
            </pre>
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3 className={styles.sectionTitle}>Presets</h3>
            <div className={styles.presetsGrid}>
              {PRESETS.filter(p => p.type === shadowType).map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Tipo de sombra */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Tipo de Sombra</label>
            <div className={styles.typeTabs}>
              <button
                className={`${styles.typeBtn} ${shadowType === 'box' ? styles.typeActive : ''}`}
                onClick={() => setShadowType('box')}
              >
                📦 Box Shadow
              </button>
              <button
                className={`${styles.typeBtn} ${shadowType === 'text' ? styles.typeActive : ''}`}
                onClick={() => setShadowType('text')}
              >
                ✏️ Text Shadow
              </button>
            </div>
          </div>

          {/* Capas */}
          <div className={styles.controlGroup}>
            <div className={styles.layersHeader}>
              <label className={styles.label}>Capas ({layers.length}/5)</label>
              <button
                onClick={addLayer}
                className={styles.addBtn}
                disabled={layers.length >= 5}
              >
                + Añadir
              </button>
            </div>

            <div className={styles.layerTabs}>
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`${styles.layerTab} ${activeLayer === layer.id ? styles.layerActive : ''}`}
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <span>Capa {index + 1}</span>
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      className={styles.removeLayerBtn}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controles de la capa activa */}
          {currentLayer && (
            <div className={styles.layerControls}>
              {/* Offset X */}
              <div className={styles.sliderGroup}>
                <label>Offset X: {currentLayer.offsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentLayer.offsetX}
                  onChange={(e) => updateLayer(currentLayer.id, 'offsetX', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Offset Y */}
              <div className={styles.sliderGroup}>
                <label>Offset Y: {currentLayer.offsetY}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentLayer.offsetY}
                  onChange={(e) => updateLayer(currentLayer.id, 'offsetY', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Blur */}
              <div className={styles.sliderGroup}>
                <label>Blur: {currentLayer.blur}px</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentLayer.blur}
                  onChange={(e) => updateLayer(currentLayer.id, 'blur', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Spread (solo box-shadow) */}
              {shadowType === 'box' && (
                <div className={styles.sliderGroup}>
                  <label>Spread: {currentLayer.spread}px</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={currentLayer.spread}
                    onChange={(e) => updateLayer(currentLayer.id, 'spread', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              )}

              {/* Color y Opacidad */}
              <div className={styles.colorRow}>
                <div className={styles.colorGroup}>
                  <label>Color</label>
                  <input
                    type="color"
                    value={currentLayer.color}
                    onChange={(e) => updateLayer(currentLayer.id, 'color', e.target.value)}
                    className={styles.colorPicker}
                  />
                </div>
                <div className={styles.opacityGroup}>
                  <label>Opacidad: {Math.round(currentLayer.opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentLayer.opacity}
                    onChange={(e) => updateLayer(currentLayer.id, 'opacity', parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              </div>

              {/* Inset (solo box-shadow) */}
              {shadowType === 'box' && (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={currentLayer.inset}
                    onChange={(e) => updateLayer(currentLayer.id, 'inset', e.target.checked)}
                  />
                  Inset (sombra interior)
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>Propiedades de Sombras CSS</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>↔️</span>
            <h4>Offset X/Y</h4>
            <p>Desplazamiento horizontal y vertical de la sombra respecto al elemento</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌫️</span>
            <h4>Blur</h4>
            <p>Desenfoque de la sombra. Mayor valor = más suave y difusa</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>⭕</span>
            <h4>Spread</h4>
            <p>Expansión de la sombra. Valores positivos la agrandan, negativos la reducen</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía de Sombras CSS"
        subtitle="Domina box-shadow y text-shadow para crear interfaces con profundidad y jerarquía visual"
        icon="🌑"
      >
        {/* 1. TABLA COMPARATIVA — propiedades de sombra */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Sintaxis</th>
                <th>Aplica a</th>
                <th>Efecto visual</th>
                <th>Compatibilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>box-shadow</td><td><code>x y blur spread color</code></td><td>Cualquier elemento de bloque</td><td>Sombra exterior o interior (inset)</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>text-shadow</td><td><code>x y blur color</code></td><td>Solo texto</td><td>Sombra bajo los caracteres</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>filter: drop-shadow()</td><td><code>x y blur color</code></td><td>Cualquier elemento, respeta forma</td><td>Sombra que sigue el contorno real (PNG, SVG)</td><td>✅ Chrome 18+, Firefox 35+</td></tr>
              <tr><td>box-shadow inset</td><td><code>inset x y blur color</code></td><td>Elementos de bloque</td><td>Sombra interior (efecto hundido)</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>Múltiple (coma)</td><td><code>sombra1, sombra2</code></td><td>box-shadow y text-shadow</td><td>Capas de sombra apiladas</td><td>✅ Todos los navegadores</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🖥️</span>
              <strong>Diseñador UI/UX</strong>
            </div>
            <p>Crea sistemas de elevación (z-depth) consistentes para cards, modales y botones. Una sombra progresiva comunica la jerarquía visual sin necesidad de bordes ni colores adicionales.</p>
            <div className={styles.escenarioTip}>Tip: Define 4-5 niveles de sombra como variables CSS (--shadow-sm, --shadow-md...) para mantener coherencia en todo el sistema de diseño.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍💻</span>
              <strong>Desarrollador Frontend</strong>
            </div>
            <p>Genera el código CSS listo para copiar en proyectos React, Vue o Angular. Crea sombras para hover states, focus rings accesibles y efectos de profundidad en componentes.</p>
            <div className={styles.escenarioTip}>Tip: Anima box-shadow con transition para hover effects, pero úsalo con moderación: es una propiedad costosa en GPU.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎨</span>
              <strong>Diseñador Gráfico / Brand</strong>
            </div>
            <p>Crea efectos de texto con sombra para títulos impactantes en landing pages, banners y presentaciones. Las sombras de texto son clave en el estilo neón, retro y flat design.</p>
            <div className={styles.escenarioTip}>Tip: Para el efecto neón usa text-shadow múltiple con el mismo color en distintos radios de desenfoque: 0 0 7px, 0 0 21px, 0 0 42px.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📱</span>
              <strong>Desarrollador Mobile / PWA</strong>
            </div>
            <p>Diseña sombras optimizadas para dispositivos con pantallas OLED donde las sombras oscuras son más económicas en batería. Adapta la intensidad según el modo claro/oscuro.</p>
            <div className={styles.escenarioTip}>Tip: En dark mode, las sombras negras desaparecen sobre fondos oscuros. Usa sombras con ligera opacidad coloreada o reduce el offset.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Sombras CSS</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre box-shadow y filter: drop-shadow()?</div>
              <div className={styles.faqRespuesta}>box-shadow sigue el rectángulo del elemento, ignorando la transparencia. filter: drop-shadow() sigue el contorno real del contenido, lo que lo hace ideal para PNG con transparencia o SVGs. Sin embargo, drop-shadow no admite sombras inset ni múltiples capas.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué significa el parámetro "spread" en box-shadow?</div>
              <div className={styles.faqRespuesta}>El spread (cuarto valor) expande o contrae la sombra antes de aplicar el desenfoque. Un spread positivo la hace más grande que el elemento; uno negativo la hace más pequeña. Con spread negativo y blur 0 puedes crear una sombra pegada y compacta.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Las sombras CSS afectan al rendimiento?</div>
              <div className={styles.faqRespuesta}>box-shadow en elementos estáticos tiene impacto mínimo. El problema surge al animarlos: cada frame obliga al navegador a recalcular y repintar. Para animaciones suaves, la técnica profesional es animar opacity de un pseudo-elemento ::after con la sombra ya calculada.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo crear el efecto neumorfismo (neumorphism)?</div>
              <div className={styles.faqRespuesta}>El neumorfismo usa dos sombras simultáneas: una clara (arriba-izquierda) y una oscura (abajo-derecha), con el fondo del mismo color que el elemento. Ejemplo: <code>box-shadow: -5px -5px 10px #fff, 5px 5px 10px rgba(0,0,0,0.2)</code>. Solo funciona bien en modo claro con fondos grises.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Se pueden apilar múltiples sombras en box-shadow?</div>
              <div className={styles.faqRespuesta}>Sí, separando con coma: <code>box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)</code>. Las sombras se renderizan de la primera (superior) a la última (inferior). Esta técnica permite crear sombras suaves y realistas como las de Material Design o Tailwind.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo hacer que una sombra funcione en dark mode?</div>
              <div className={styles.faqRespuesta}>En dark mode las sombras negras son invisibles sobre fondos oscuros. Las soluciones son: usar sombras coloreadas sutiles que contrasten con el fondo oscuro, usar color-scheme y Canvas API para detectar el modo, o añadir una regla CSS con @media (prefers-color-scheme: dark) que cambia la sombra.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es box-shadow inset y cuándo usarlo?</div>
              <div className={styles.faqRespuesta}>La palabra clave inset convierte la sombra exterior en interior, creando un efecto de elemento hundido o presionado. Se usa en: campos de formulario activos/focus, botones presionados (estado :active), efectos de relieve invertido y contenedores con apariencia de cavidad.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la fórmula para sombras realistas como las de Material Design?</div>
              <div className={styles.faqRespuesta}>Material Design usa tres capas de sombra por nivel de elevación: umbra (sombra directa oscura), penumbra (sombra difusa) y luz ambiental (sombra global suave). Para elevación 2: <code>0 2px 2px rgba(0,0,0,0.14), 0 3px 1px rgba(0,0,0,0.12), 0 1px 5px rgba(0,0,0,0.20)</code>.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Define el propósito de la sombra</strong> — ¿Es para elevar un elemento (card), indicar interacción (hover), crear profundidad (modal) o decorar texto? Cada propósito tiene un patrón de valores diferente.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Elige el tipo correcto</strong> — box-shadow para elementos de bloque, text-shadow para texto, filter: drop-shadow para imágenes PNG/SVG con transparencia, inset para efectos hundidos.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Ajusta offset y blur</strong> — El offset (x, y) define la dirección de la luz. Un blur alto (20-30px) da sombras suaves y difusas; un blur bajo (0-5px) da sombras nítidas y duras.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Calibra el color y opacidad</strong> — Casi nunca uses negro puro (#000). Usa rgba con 10-30% de opacidad para sombras naturales, o colores con matiz ligeramente azulado/morado para más realismo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Considera el dark mode</strong> — Añade una variante de sombra para fondo oscuro. En dark mode reduce la opacidad o usa sombras coloreadas sutiles en lugar de negro.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Copia el código y aplícalo</strong> — Pega el CSS generado en tu hoja de estilos. Si usas Tailwind, conviértelo a una clase personalizada en tailwind.config.js con el valor exacto generado.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>💡</span>
            <strong>Luz consistente</strong>
            <p>Elige una única dirección de luz para toda la interfaz. Si la luz viene de arriba-izquierda, todos los box-shadow deben tener offset positivo en x e y.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎚️</span>
            <strong>Sistema de elevación</strong>
            <p>Define 4-5 niveles de sombra como variables CSS. Úsalos consistentemente: nivel 1 para cards, nivel 2 para dropdowns, nivel 3 para modales.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>⚡</span>
            <strong>Animación eficiente</strong>
            <p>Para hover con sombra animada, usa un pseudo-elemento ::after con la sombra final ya calculada y anima solo su opacity. 60fps garantizados.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌓</span>
            <strong>Sombras coloreadas</strong>
            <p>Las sombras con el color de la marca (ej: sombra azul bajo botón azul) crean un efecto de brillo muy llamativo en CTAs y elementos hero.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📐</span>
            <strong>Menos es más</strong>
            <p>Una sola sombra bien calibrada es más efectiva que cinco sombras mediocres. La mayoría de los diseños profesionales usan solo 2-3 niveles de sombra.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔍</span>
            <strong>Accesibilidad</strong>
            <p>No uses box-shadow como único indicador de focus. Combínalo con outline para usuarios que navegan por teclado. Chrome añade focus rings automáticamente en algunos elementos.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores comunes con sombras CSS</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar negro puro como color de sombra</strong> — rgba(0,0,0,1) produce sombras artificiales y duras. Usa rgba(0,0,0,0.15) o colores con ligero matiz azulado para sombras naturales.</li>
            <li><strong>Animar box-shadow directamente</strong> — Provoca repintado del navegador en cada frame. Para animaciones fluidas, anima opacity de un pseudo-elemento ::after con la sombra precalculada.</li>
            <li><strong>Ignorar el dark mode</strong> — Las sombras negras son invisibles sobre fondos oscuros. Añade siempre una variante de sombra para @media (prefers-color-scheme: dark).</li>
            <li><strong>Aplicar sombras a todos los elementos</strong> — El exceso de sombras aplana la jerarquía visual. Reserva las sombras para elementos que necesiten destacar o comunicar elevación.</li>
            <li><strong>Usar filter: drop-shadow en lugar de box-shadow para elementos sin transparencia</strong> — drop-shadow es más costoso computacionalmente. Úsalo solo cuando necesites seguir el contorno real (PNG/SVG).</li>
            <li><strong>No definir un sistema coherente</strong> — Sombras "inventadas" elemento a elemento crean inconsistencia visual. Define variables CSS --shadow-sm/md/lg desde el principio.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-sombras')} />

      <ShareCard appName="generador-sombras" />
      <Footer appName="generador-sombras" />
    </div>
  );
}
