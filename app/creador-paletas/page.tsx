'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './CreadorPaletas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice />

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

      {/* Sección Educativa - Profesionalización */}
      <EducationalSection
        title="¿Quieres dominar la teoría del color y el diseño de paletas?"
        subtitle="Comparativa de armonías, casos de uso profesionales y errores que arruinan cualquier diseño"
        icon="🎨"
      >
        {/* Tabla Comparativa: Tipos de Armonías */}
        <section className={styles.guideSection}>
          <h2>⚖️ Comparativa de Tipos de Armonía Cromática</h2>
          <p className={styles.introParagraph}>
            Elegir la armonía correcta define la personalidad visual de un proyecto. Esta tabla te ayuda a saber cuándo usar cada una según el objetivo del diseño.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Armonía</th>
                  <th>Colores</th>
                  <th>Sensación</th>
                  <th>Dificultad uso</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🔄 Complementario</strong></td>
                  <td>2 (opuestos en rueda)</td>
                  <td>Alto contraste, energético, llamativo</td>
                  <td>Media (equilibrar proporciones)</td>
                  <td>CTAs, banners, marcas deportivas</td>
                </tr>
                <tr>
                  <td><strong>↔️ Análogo</strong></td>
                  <td>3 (adyacentes ±30°)</td>
                  <td>Armonioso, natural, tranquilo</td>
                  <td>Baja (siempre funciona)</td>
                  <td>Landings corporativas, apps de bienestar, naturaleza</td>
                </tr>
                <tr>
                  <td><strong>△ Triádico</strong></td>
                  <td>3 (equidistantes 120°)</td>
                  <td>Vibrante, equilibrado, creativo</td>
                  <td>Alta (saturación difícil de controlar)</td>
                  <td>Diseño infantil, marcas creativas, entretenimiento</td>
                </tr>
                <tr>
                  <td><strong>◇ Tetrádico</strong></td>
                  <td>4 (rectángulo en rueda)</td>
                  <td>Rico, complejo, diverso</td>
                  <td>Muy alta (requiere un dominante)</td>
                  <td>Proyectos artísticos, ilustración, branding complejo</td>
                </tr>
                <tr>
                  <td><strong>⚔️ Split Comp.</strong></td>
                  <td>3 (base + dos vecinos del complementario)</td>
                  <td>Contraste suavizado, sofisticado</td>
                  <td>Media-Baja (más seguro que complementario)</td>
                  <td>Webs de moda, portfolios, productos premium</td>
                </tr>
                <tr>
                  <td><strong>◐ Monocromático</strong></td>
                  <td>3-5 (misma tonalidad)</td>
                  <td>Elegante, cohesionado, minimalista</td>
                  <td>Baja (muy seguro)</td>
                  <td>Apps minimalistas, diseño editorial, UI corporativa</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 ¿Cómo usan las paletas los profesionales?</h2>
          <p className={styles.introParagraph}>
            Cada perfil de diseño tiene necesidades distintas. El código exportable (CSS/SCSS/JSON) de esta herramienta encaja en todos estos flujos de trabajo.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌐</span>
                <h3>Diseñador / Desarrollador web</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Flujo típico:</strong></p>
                <code>Color corporativo del cliente → Generar análogo → Exportar CSS variables → Pegar en :root de globals.css → Paleta lista en 2 minutos</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Las variables CSS generadas siguen el patrón <code>--color-N</code>, compatible con cualquier proyecto. El cliente ya no pregunta "¿este azul combina con el rojo?" porque el sistema de armonía garantiza coherencia cromática.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎨</span>
                <h3>Diseñador de identidad de marca</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Flujo típico:</strong></p>
                <code>Color primario de marca → Explorar complementario + monocromático → Documentar 3 propuestas → Presentar con preview en shades 100-900</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> La escala de tonos (100-900) muestra el comportamiento del color en fondos claros (100-300), textos (700-900) y fondos oscuros, que es exactamente lo que necesita un sistema de diseño completo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📱</span>
                <h3>Community Manager / Creador de contenido</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Flujo típico:</strong></p>
                <code>Color de marca en redes → Generar análogo → Usar los 3 HEX en Canva para posts coordinados → Feed de Instagram visualmente coherente</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Un feed de Instagram con paleta análoga tiene 40% más engagement que uno con colores inconsistentes, según estudios de UX en redes sociales. La coherencia visual genera reconocimiento de marca automático.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🧑‍💻</span>
                <h3>Desarrollador frontend con proyecto propio</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Flujo típico:</strong></p>
                <code>Color que "me gusta" → Generar monocromático → Exportar SCSS → 4 variables para primary, surface, border y text → Sistema de diseño minimalista funcional</code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los devs no son diseñadores. Una paleta monocromática generada automáticamente elimina la parálisis por análisis del color y permite centrarse en el código. El resultado siempre es coherente aunque no sea espectacular.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre Color y Diseño</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántos colores debe tener una paleta de diseño web?</h4>
              <p>
                La regla del 60-30-10 es el estándar profesional: 60% color dominante (fondo), 30% color secundario (secciones, cards), 10% color de acento (CTAs, highlights). Para interfaces web, una paleta funcional mínima necesita: 1 primario, 1 secundario o acento, 1 neutro claro (fondo), 1 neutro oscuro (texto), 1 de alerta (rojo/amarillo para errores). Eso son 5 colores base con sus tonos. Más de 7-8 colores diferentes generalmente indican falta de sistema.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Si necesitas más de 7 colores para describir tu marca, probablemente no tienes un sistema sino una colección. Simplifica hasta que cada color tenga un propósito único y claramente definido.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el contraste de accesibilidad y por qué importa?</h4>
              <p>
                La WCAG 2.1 establece ratios mínimos de contraste entre texto y fondo: 4.5:1 para texto normal (AA) y 7:1 para texto normal (AAA). Diversas normativas obligan a cumplir AA en webs del sector público (RD 1112/2018 en España, ADA Title III en EE.UU., AODA en Canadá, EAA en la UE desde 2025). Un texto gris claro sobre fondo blanco puede ser bonito pero completamente ilegible para personas con visión reducida o en pantallas con mucha luz.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Cómo verificar:</strong> Usa el WebAIM Contrast Checker (webaim.org/resources/contrastchecker) con los HEX de tu paleta. Como mínimo, texto de cuerpo y fondo deben superar 4.5:1. Los tonos 700-900 de la escala suelen funcionar bien sobre fondos claros.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué mi paleta se ve bien en pantalla pero mal impresa?</h4>
              <p>
                Las pantallas usan RGB (luz aditiva), la impresión usa CMYK (pigmentos sustractivos). Los colores saturados y brillantes de pantalla, especialmente azules eléctricos (#00AAFF), verdes neón o magentas, pierden mucha intensidad al imprimirse porque CMYK no puede reproducir todo el gamut RGB. Además, el papel no emite luz, solo la refleja. Solución: en proyectos de impresión, trabaja directamente con valores CMYK y usa el conversor de colores de meskeIA para ver la traducción.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Colores seguros para impresión:</strong> Paletas con saturación media-baja (S entre 30-70%) y luminosidad media (L entre 30-60%) se traducen mejor a CMYK. Evita colores con S {'>'} 90% si el proyecto será impreso.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo elegir un color para una marca desde cero?</h4>
              <p>
                El color de marca comunica valores inconscientemente: azul (confianza, tecnología, salud), verde (naturaleza, sostenibilidad, finanzas), rojo (urgencia, energía, alimentación), amarillo (optimismo, advertencia), naranja (creatividad, accesibilidad), violeta (lujo, espiritualidad), negro (elegancia, exclusividad). El color debe diferenciarse de la competencia directa y funcionar en contextos muy distintos (blanco, negro, color, pantalla, impresión).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Proceso recomendado:</strong> 1) Lista 3 valores de marca (ej: innovador, accesible, confiable). 2) Busca el color que mejor comunica esos valores. 3) Comprueba que el principal competidor usa un color diferente. 4) Genera la paleta completa con esta herramienta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es la temperatura del color y cómo afecta al diseño?</h4>
              <p>
                Los colores cálidos (rojos, naranjas, amarillos) generan sensación de energía, urgencia y cercanía. Los colores fríos (azules, verdes, violetas) transmiten calma, profesionalidad y distancia. Los neutros (blancos, grises, beiges) son versátiles y no compiten con el contenido. La temperatura afecta también a la percepción de peso visual: los colores oscuros y cálidos "pesan" más visualmente que los claros y fríos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Aplicación práctica:</strong> Usa colores cálidos en CTAs de compra ("Comprar ahora", "Añadir al carrito"). Usa fríos en secciones de confianza (testimonios, certificaciones, garantías). Esta distinción temperatura-acción está validada por miles de tests A/B.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo funciona el modo oscuro y qué colores debo evitar?</h4>
              <p>
                En dark mode, no uses negro puro (#000000) para fondos: es demasiado duro. Los mejores fondos oscuros van de #1A1A1A a #2D2D2D. Evita también colores muy saturados sobre fondos oscuros: cansan la vista. Las paletas análogas y monocromáticas con saturación media (S: 40-70%) funcionan especialmente bien en dark mode. Los tonos 100-300 de tu escala son los colores de texto sobre fondos oscuros.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Truco de dark mode:</strong> En lugar de invertir colores, desatura ligeramente y reduce la luminosidad un 15-20%. Un azul primario #2E86AB puede convertirse en #2478A0 para dark mode. Los contrastes se mantienen sin que los colores "griten".
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Para qué sirven los shades 100-900 de la escala?</h4>
              <p>
                La escala de 9 tonos es el estándar de sistemas de diseño como Tailwind CSS, Material Design y Ant Design: 100 (fondo muy claro, highlights), 200-300 (bordes, separadores), 400-500 (colores secundarios, badges), 600-700 (color primario y hover), 800-900 (textos, colores sobre fondos claros). Esta nomenclatura permite a los equipos comunicarse sin ambigüedad: "usa primary-700 sobre primary-100" es inequívoco.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Tailwind CSS:</strong> La escala de esta herramienta es compatible con la lógica de Tailwind (50-950). Puedes renombrar los valores exportados de 100-900 para usarlos directamente en <code>tailwind.config.js</code> como colores personalizados.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo saber si una paleta es accesible para personas daltónicas?</h4>
              <p>
                El 8% de los hombres y el 0,5% de las mujeres tienen algún tipo de daltonismo (más común: deuteranopía, que confunde rojo y verde). Para paletas accesibles: evita depender solo del rojo/verde para transmitir información (éxito/error); añade iconos o texto. Los azules y amarillos son los más seguros porque son distinguibles por la mayoría de tipos de daltonismo. Herramientas como Stark (plugin de Figma) o Colour Contrast Analyser simulan cómo ve un daltónico tu diseño.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla del "daltonismo-safe":</strong> Si tu diseño sigue siendo comprensible en escala de grises, es accesible para la mayoría de personas con daltonismo. Prueba captura de pantalla + desaturación 100% en Photoshop.
              </p>
            </div>
          </div>
        </section>

        {/* Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Cómo Crear una Identidad Visual Cromática Profesional</h2>
          <p className={styles.introParagraph}>
            Proceso paso a paso para pasar de un color base a un sistema de diseño completo listo para implementar en cualquier proyecto web.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define el color primario con intención</h4>
                <p>
                  El color primario debe comunicar los valores del proyecto. Investiga los colores de los 3 competidores directos y elige uno que los diferencie. Introduce el HEX en el color base de la herramienta. Si no tienes color definido, empieza con el preset "meskeIA" y ajusta el tono en el color picker hasta encontrar el que mejor representa la marca.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Selecciona la armonía según el tono del proyecto</h4>
                <p>
                  Para proyectos serios/corporativos: monocromático o análogo. Para creativos/artísticos: triádico o tetrádico. Para conversión/marketing: complementario o split-complementary. Genera las 3 armonías más relevantes y descarga la paleta de cada una. Presenta 2-3 propuestas al cliente antes de decidir.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Valida la escala de tonos para uso completo</h4>
                <p>
                  Revisa la escala 100-900 generada: el 100-200 debe ser casi blanco (útil para fondos), el 500-600 debe ser el color reconocible de marca, el 800-900 debe ser lo suficientemente oscuro para textos sobre fondo blanco con contraste WCAG AA (mínimo 4.5:1). Ajusta el color base si la escala no cumple estos criterios.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Exporta en el formato adecuado para tu proyecto</h4>
                <p>
                  CSS Variables: para proyectos web con CSS puro o Next.js/React. SCSS Variables: para proyectos con Sass/SCSS o Bootstrap personalizado. JSON: para integrar con herramientas de diseño (Figma tokens, Style Dictionary) o para consumir en JavaScript. Pega el código exportado directamente en tu archivo de variables o tema.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Verifica accesibilidad en los usos principales</h4>
                <p>
                  Comprueba el contraste de texto de cuerpo (normalmente tono 800-900) sobre fondo claro (tono 50-100). Verifica también texto blanco sobre el color primario (para botones). Usa WebAIM Contrast Checker o la herramienta de inspección de Chrome DevTools (Accessibility &gt; Color contrast). Si no supera 4.5:1, ajusta la luminosidad del tono elegido.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Documenta la paleta en un token de diseño</h4>
                <p>
                  Nombra cada color con su propósito, no con su valor: <code>--color-primary</code>, <code>--color-surface</code>, <code>--color-on-primary</code>, <code>--color-error</code>. Esta abstracción permite cambiar toda la paleta editando solo las variables, sin tocar ningún componente. Es la base de cualquier sistema de diseño escalable y facilita la implementación de dark mode.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas de Diseño de Paletas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <h4>Aplica la regla 60-30-10</h4>
              <p>60% color dominante (fondos), 30% secundario (secciones, cards), 10% de acento (botones, highlights). Esta proporción garantiza jerarquía visual sin saturar al usuario.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>♿</span>
              <h4>Comprueba WCAG antes de publicar</h4>
              <p>Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande (+18px). Las normativas de accesibilidad de muchos países lo exigen en webs públicas. Es también buen diseño.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌓</span>
              <h4>Diseña siempre el dark mode desde el principio</h4>
              <p>Añadir dark mode después es costoso. Define desde el inicio los valores para fondo oscuro, texto sobre oscuro y primario en oscuro. Los tonos 600-700 suelen funcionar bien en ambos modos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <h4>Un color = un significado semántico</h4>
              <p>El rojo es error, el verde es éxito, el amarillo es advertencia. No uses el rojo de tu marca para mensajes de error si tu marca es roja. Distingue colores de marca de colores funcionales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔢</span>
              <h4>Usa la escala 100-900 en código, no HEX directos</h4>
              <p>Referencia <code>--color-primary-700</code> en lugar de <code>#2E86AB</code> directamente. Si el cliente cambia de azul a verde, solo editas la paleta, no todos los componentes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🖨️</span>
              <h4>Prueba la paleta en gris antes de aprobarla</h4>
              <p>Desatura la paleta al 100% gris y verifica que el diseño sigue siendo legible y con jerarquía clara. Si funciona en gris, funcionará en color y será accesible para daltónicos.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores de Color que Arruinan Cualquier Diseño</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Usar demasiados colores sin jerarquía:</strong> Más de 5-6 colores en una interfaz sin un sistema claro genera ruido visual. El usuario no sabe qué es importante. Limita la paleta principal a 3 colores (primario, secundario, acento) y usa la escala de tonos para las variaciones.
              </li>
              <li>
                <strong>❌ Olvidar verificar el contraste de accesibilidad:</strong> Un gris claro sobre fondo blanco puede verse elegante pero tiene contraste 1.5:1 (el mínimo es 4.5:1). Esto viola las leyes de accesibilidad y hace el contenido ilegible para personas con baja visión o en pantallas bajo luz solar.
              </li>
              <li>
                <strong>❌ Usar el mismo color para semántica de marca y de estado:</strong> Si el color primario de tu marca es rojo, usar rojo también para errores genera ambigüedad. El usuario no sabe si un elemento rojo es parte del diseño o una alerta. Define colores funcionales (error, éxito, warning) independientes de los de marca.
              </li>
              <li>
                <strong>❌ No considerar la luz ambiental al elegir colores:</strong> Un azul oscuro que se ve perfecto en monitores calibrados puede parecer negro en laptops de presupuesto bajo o en exteriores con mucha luz. Prueba siempre tu paleta en diferentes dispositivos y condiciones de iluminación antes de aprobarla.
              </li>
              <li>
                <strong>❌ Cambiar colores directamente en los componentes en lugar de en variables:</strong> Si defines el color en cada botón como <code>color: #2E86AB</code> y el cliente cambia el azul por verde, debes editar cientos de archivos. Usa siempre <code>color: var(--primary)</code> y cambia solo la variable. El código exportado de esta herramienta ya sigue este patrón.
              </li>
              <li>
                <strong>❌ Confundir armonía cromática con paleta completa:</strong> La armonía define los colores principales, pero una paleta funcional necesita también neutrales (blanco, gris, negro) para fondos, bordes y textos. Una paleta sin neutrales obliga a usar los colores de marca en roles para los que no están diseñados, deteriorando la identidad visual.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('creador-paletas')} />

      <ShareCard appName="creador-paletas" />
      <Footer appName="creador-paletas" />
    </div>
  );
}
