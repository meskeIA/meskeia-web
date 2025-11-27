'use client';

import { useState, useMemo, useCallback } from 'react';
import styles from './CreadorPaletas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'split-complementary' | 'monochromatic';

interface PaletteColor {
  hex: string;
  name: string;
}

// Conversiones de color
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Generadores de armonías
function generateHarmony(baseColor: string, type: HarmonyType): PaletteColor[] {
  const hsl = hexToHsl(baseColor);
  const colors: PaletteColor[] = [{ hex: baseColor, name: 'Base' }];

  switch (type) {
    case 'complementary':
      colors.push({ hex: hslToHex(hsl.h + 180, hsl.s, hsl.l), name: 'Complementario' });
      break;

    case 'analogous':
      colors.push({ hex: hslToHex(hsl.h - 30, hsl.s, hsl.l), name: 'Análogo -30°' });
      colors.push({ hex: hslToHex(hsl.h + 30, hsl.s, hsl.l), name: 'Análogo +30°' });
      break;

    case 'triadic':
      colors.push({ hex: hslToHex(hsl.h + 120, hsl.s, hsl.l), name: 'Triádico +120°' });
      colors.push({ hex: hslToHex(hsl.h + 240, hsl.s, hsl.l), name: 'Triádico +240°' });
      break;

    case 'tetradic':
      colors.push({ hex: hslToHex(hsl.h + 90, hsl.s, hsl.l), name: 'Tetrádico +90°' });
      colors.push({ hex: hslToHex(hsl.h + 180, hsl.s, hsl.l), name: 'Tetrádico +180°' });
      colors.push({ hex: hslToHex(hsl.h + 270, hsl.s, hsl.l), name: 'Tetrádico +270°' });
      break;

    case 'split-complementary':
      colors.push({ hex: hslToHex(hsl.h + 150, hsl.s, hsl.l), name: 'Split +150°' });
      colors.push({ hex: hslToHex(hsl.h + 210, hsl.s, hsl.l), name: 'Split +210°' });
      break;

    case 'monochromatic':
      colors.push({ hex: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 30, 10)), name: 'Oscuro' });
      colors.push({ hex: hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 90)), name: 'Claro' });
      colors.push({ hex: hslToHex(hsl.h, hsl.s * 0.6, hsl.l), name: 'Desaturado' });
      break;
  }

  return colors;
}

// Generar shades y tints
function generateShades(baseColor: string): PaletteColor[] {
  const hsl = hexToHsl(baseColor);
  const shades: PaletteColor[] = [];

  for (let i = 9; i >= 1; i--) {
    const lightness = 95 - (i - 1) * 10;
    const saturation = i === 1 ? hsl.s * 0.3 : hsl.s;
    shades.push({
      hex: hslToHex(hsl.h, saturation, lightness),
      name: `${i}00`
    });
  }

  return shades;
}

const HARMONY_INFO: Record<HarmonyType, { name: string; icon: string; description: string }> = {
  'complementary': { name: 'Complementario', icon: '🔄', description: 'Colores opuestos en la rueda de color' },
  'analogous': { name: 'Análogo', icon: '↔️', description: 'Colores adyacentes para armonía suave' },
  'triadic': { name: 'Triádico', icon: '△', description: 'Tres colores equidistantes' },
  'tetradic': { name: 'Tetrádico', icon: '◇', description: 'Cuatro colores formando un rectángulo' },
  'split-complementary': { name: 'Split Comp.', icon: '⚔️', description: 'Base + dos adyacentes al complementario' },
  'monochromatic': { name: 'Monocromático', icon: '◐', description: 'Variaciones de un solo color' },
};

const PRESET_PALETTES: { name: string; colors: string[] }[] = [
  { name: 'meskeIA', colors: ['#2E86AB', '#48A9A6', '#7FB3D3', '#E8F4F8', '#1A5A7A'] },
  { name: 'Atardecer', colors: ['#FF6B6B', '#FFA07A', '#FFEAA7', '#DFE6E9', '#2D3436'] },
  { name: 'Bosque', colors: ['#2D5A27', '#68A357', '#8FCB81', '#C7E3BE', '#1A3518'] },
  { name: 'Océano', colors: ['#006994', '#40A4C8', '#87CEEB', '#E0F4F8', '#004466'] },
  { name: 'Lavanda', colors: ['#8E7CC3', '#B4A7D6', '#D9D2E9', '#F3F0FF', '#5B4690'] },
  { name: 'Coral', colors: ['#FF7F50', '#FFA07A', '#FFDAB9', '#FFF5EE', '#CD5C5C'] },
];

export default function CreadorPaletasPage() {
  const [baseColor, setBaseColor] = useState('#2E86AB');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'scss' | 'json'>('css');

  const palette = useMemo(() => generateHarmony(baseColor, harmonyType), [baseColor, harmonyType]);
  const shades = useMemo(() => generateShades(baseColor), [baseColor]);

  const copyColor = useCallback(async (color: string) => {
    await navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  }, []);

  const randomColor = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(hex.toUpperCase());
  };

  const applyPreset = (colors: string[]) => {
    setBaseColor(colors[0]);
  };

  const exportCode = useMemo(() => {
    const allColors = [...palette, ...shades.slice(0, 5)];

    switch (exportFormat) {
      case 'css':
        return `:root {\n${allColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
      case 'scss':
        return allColors.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n');
      case 'json':
        return JSON.stringify(allColors.map(c => c.hex), null, 2);
      default:
        return '';
    }
  }, [palette, shades, exportFormat]);

  const copyExport = async () => {
    await navigator.clipboard.writeText(exportCode);
    setCopiedColor('export');
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎨 Creador de Paletas</h1>
        <p className={styles.subtitle}>
          Genera paletas de colores armónicas automáticamente
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Configuración */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Color Base</h2>

          <div className={styles.colorPickerSection}>
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
              className={styles.colorPicker}
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                if (/^#[0-9A-F]{6}$/.test(val)) {
                  setBaseColor(val);
                }
              }}
              className={styles.hexInput}
              maxLength={7}
            />
            <button onClick={randomColor} className={styles.randomBtn}>
              🎲 Aleatorio
            </button>
          </div>

          <div className={styles.harmonySection}>
            <h3 className={styles.sectionTitle}>Tipo de Armonía</h3>
            <div className={styles.harmonyGrid}>
              {(Object.keys(HARMONY_INFO) as HarmonyType[]).map((type) => (
                <button
                  key={type}
                  className={`${styles.harmonyBtn} ${harmonyType === type ? styles.harmonyActive : ''}`}
                  onClick={() => setHarmonyType(type)}
                >
                  <span className={styles.harmonyIcon}>{HARMONY_INFO[type].icon}</span>
                  <span className={styles.harmonyName}>{HARMONY_INFO[type].name}</span>
                </button>
              ))}
            </div>
            <p className={styles.harmonyDescription}>
              {HARMONY_INFO[harmonyType].description}
            </p>
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3 className={styles.sectionTitle}>Paletas Populares</h3>
            <div className={styles.presetsGrid}>
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(preset.colors)}
                >
                  <div className={styles.presetColors}>
                    {preset.colors.slice(0, 5).map((color, i) => (
                      <span
                        key={i}
                        className={styles.presetSwatch}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className={styles.presetName}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Resultados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Paleta Generada</h2>

          {/* Colores de armonía */}
          <div className={styles.paletteSection}>
            <h3 className={styles.sectionTitle}>Armonía {HARMONY_INFO[harmonyType].name}</h3>
            <div className={styles.paletteGrid}>
              {palette.map((color, i) => (
                <button
                  key={i}
                  className={styles.colorCard}
                  onClick={() => copyColor(color.hex)}
                  style={{ backgroundColor: color.hex }}
                >
                  <span className={styles.colorName}>{color.name}</span>
                  <span className={styles.colorHex}>
                    {copiedColor === color.hex ? '✓ Copiado' : color.hex}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shades */}
          <div className={styles.shadesSection}>
            <h3 className={styles.sectionTitle}>Escala de Tonos</h3>
            <div className={styles.shadesGrid}>
              {shades.map((shade) => (
                <button
                  key={shade.name}
                  className={styles.shadeCard}
                  onClick={() => copyColor(shade.hex)}
                  style={{ backgroundColor: shade.hex }}
                >
                  <span className={styles.shadeName}>{shade.name}</span>
                  <span className={styles.shadeHex}>
                    {copiedColor === shade.hex ? '✓' : shade.hex}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className={styles.exportSection}>
            <div className={styles.exportHeader}>
              <h3 className={styles.sectionTitle}>Exportar</h3>
              <div className={styles.exportTabs}>
                <button
                  className={`${styles.exportTab} ${exportFormat === 'css' ? styles.exportActive : ''}`}
                  onClick={() => setExportFormat('css')}
                >
                  CSS
                </button>
                <button
                  className={`${styles.exportTab} ${exportFormat === 'scss' ? styles.exportActive : ''}`}
                  onClick={() => setExportFormat('scss')}
                >
                  SCSS
                </button>
                <button
                  className={`${styles.exportTab} ${exportFormat === 'json' ? styles.exportActive : ''}`}
                  onClick={() => setExportFormat('json')}
                >
                  JSON
                </button>
              </div>
            </div>
            <pre className={styles.codeBlock}>
              <code>{exportCode}</code>
            </pre>
            <button onClick={copyExport} className={styles.copyBtn}>
              {copiedColor === 'export' ? '✓ Código Copiado' : '📋 Copiar Código'}
            </button>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>Teoría del Color</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔄</span>
            <h4>Complementarios</h4>
            <p>Colores opuestos que crean alto contraste y vibrancia</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>↔️</span>
            <h4>Análogos</h4>
            <p>Colores vecinos para una apariencia armoniosa y natural</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>△</span>
            <h4>Triádicos</h4>
            <p>Tres colores equidistantes para diseños vibrantes y equilibrados</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>◐</span>
            <h4>Monocromáticos</h4>
            <p>Variaciones de un color para elegancia y cohesión visual</p>
          </div>
        </div>
      </div>

      <Footer appName="creador-paletas" />
    </div>
  );
}
