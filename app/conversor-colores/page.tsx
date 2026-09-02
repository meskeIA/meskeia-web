'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useMemo } from 'react';
import styles from './ConversorColores.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  buscarColores,
  colorPorHex,
  nombreDeColor,
  FAMILIAS_COLOR,
  type FamiliaColor,
} from '@/data/colores-nombrados';

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k))
  };
}

/**
 * Nombre del color, con dos respuestas que NO significan lo mismo:
 *  - `exacto` → el HEX está en la tabla y ese es su nombre.
 *  - aproximado → es el color con nombre más parecido, y la interfaz lo dice así.
 *
 * Hasta el 02/09/2026 esto era un diccionario de 14 HEX con coincidencia exacta: bastaba
 * mover un slider un punto para que el rótulo dijera «Color personalizado» y dejara de
 * informar. Solo acertaba con el color de arranque, que es justo el caso en el que nadie
 * necesita que se lo nombren.
 */
function describirColor(hex: string): { nombre: string; exacto: boolean } {
  const enTabla = colorPorHex(hex);
  if (enTabla) return { nombre: enTabla.nombre, exacto: true };
  const rgb = hexToRgb(hex);
  if (!rgb) return { nombre: 'Color personalizado', exacto: false };
  return { nombre: nombreDeColor(rgb.r, rgb.g, rgb.b), exacto: false };
}

/**
 * Blanco o negro, el que más contraste dé sobre ese fondo. Luminancia relativa de la
 * WCAG, no un umbral inventado: hay muestras muy claras (Marfil, Crema) y muy oscuras
 * (Azul Prusia, Negro) en la misma parrilla.
 */
function textoLegibleSobre(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const canal = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminancia = 0.2126 * canal(rgb.r) + 0.7152 * canal(rgb.g) + 0.0722 * canal(rgb.b);
  const contrasteConBlanco = 1.05 / (luminancia + 0.05);
  const contrasteConNegro = (luminancia + 0.05) / 0.05;
  return contrasteConBlanco >= contrasteConNegro ? '#FFFFFF' : '#000000';
}

/** Tamaños de descarga. El lado máximo (4096) es el límite seguro de lienzo en móviles. */
const LADO_MAXIMO = 4096;
const LADO_MINIMO = 16;

const TAMANOS_DESCARGA = [
  { id: 'fullhd', etiqueta: 'Full HD', detalle: '1920 × 1080', ancho: 1920, alto: 1080 },
  { id: '4k', etiqueta: '4K', detalle: '3840 × 2160', ancho: 3840, alto: 2160 },
  { id: 'movil', etiqueta: 'Móvil', detalle: '1080 × 1920', ancho: 1080, alto: 1920 },
  { id: 'cuadrado', etiqueta: 'Cuadrado', detalle: '1080 × 1080', ancho: 1080, alto: 1080 },
  { id: 'personalizado', etiqueta: 'A medida', detalle: 'tú eliges', ancho: 0, alto: 0 },
] as const;

type IdTamano = (typeof TAMANOS_DESCARGA)[number]['id'];

export default function ConvertidorColoresPage() {
  const [color, setColor] = useState<ColorValues>({
    hex: '#2E86AB',
    rgb: { r: 46, g: 134, b: 171 },
    hsl: { h: 198, s: 58, l: 43 },
    cmyk: { c: 73, m: 22, y: 0, k: 33 }
  });

  const [hexInput, setHexInput] = useState('#2E86AB');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Estados para código HTML
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  // Elegir el color por su nombre
  const [busqueda, setBusqueda] = useState('');
  const [familia, setFamilia] = useState<FamiliaColor | 'todas'>('todas');

  // Descarga del color como imagen
  const [tamano, setTamano] = useState<IdTamano>('fullhd');
  const [anchoLibre, setAnchoLibre] = useState(1920);
  const [altoLibre, setAltoLibre] = useState(1080);
  const [formato, setFormato] = useState<'png' | 'jpeg'>('png');
  const [avisoDescarga, setAvisoDescarga] = useState<string | null>(null);

  const updateFromHex = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      setColor({ hex: hex.toUpperCase(), rgb, hsl, cmyk });
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setColor({ hex, rgb: { r, g, b }, hsl, cmyk });
    setHexInput(hex);
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl: { h, s, l }, cmyk });
    setHexInput(hex);
  }, []);

  const updateFromCmyk = useCallback((c: number, m: number, y: number, k: number) => {
    const rgb = cmykToRgb(c, m, y, k);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl, cmyk: { c, m, y, k } });
    setHexInput(hex);
  }, []);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateFromHex(value);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexInput(hex);
    updateFromHex(hex);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Elegir por nombre ─────────────────────────────────────────────────────────
  const descripcion = describirColor(color.hex);
  const coloresVisibles = useMemo(() => buscarColores(busqueda, familia), [busqueda, familia]);

  const elegirPorNombre = useCallback(
    (hex: string) => {
      setHexInput(hex);
      updateFromHex(hex);
    },
    [updateFromHex],
  );

  // Descarga como imagen ──────────────────────────────────────────────────────
  const dimensiones = useMemo(() => {
    const acotar = (v: number) =>
      Number.isFinite(v) ? Math.min(LADO_MAXIMO, Math.max(LADO_MINIMO, Math.round(v))) : LADO_MINIMO;
    if (tamano === 'personalizado') {
      return { ancho: acotar(anchoLibre), alto: acotar(altoLibre) };
    }
    const preset = TAMANOS_DESCARGA.find((t) => t.id === tamano)!;
    return { ancho: preset.ancho, alto: preset.alto };
  }, [tamano, anchoLibre, altoLibre]);

  /**
   * El nombre del fichero lleva el HEX FINAL, no el nombre del color que se eligiera al
   * entrar: si alguien elige «Verde oliva» y luego mueve los sliders, un
   * `fondo-verde-oliva.png` que ya no es verde oliva engaña más que no poner nombre.
   * Además, un rectángulo de color sin el código en el nombre es irrecuperable a la semana.
   */
  const nombreFichero = `color-${color.hex.slice(1)}-${dimensiones.ancho}x${dimensiones.alto}.${formato}`;

  const descargarImagen = useCallback(() => {
    setAvisoDescarga(null);
    const { ancho, alto } = dimensiones;
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d');
    if (!ctx) {
      setAvisoDescarga('Tu navegador no ha podido generar la imagen.');
      return;
    }
    ctx.fillStyle = color.hex;
    ctx.fillRect(0, 0, ancho, alto);

    // JPEG a calidad máxima: aun así remuestrea el croma, por eso el formato por defecto
    // es PNG. Ver la nota que la interfaz muestra junto al selector de formato.
    lienzo.toBlob(
      (blob) => {
        if (!blob) {
          setAvisoDescarga('Tu navegador no ha podido generar la imagen.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreFichero;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        // Se libera con margen: revocar de inmediato aborta la descarga en algunos navegadores.
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      formato === 'png' ? 'image/png' : 'image/jpeg',
      formato === 'jpeg' ? 1 : undefined,
    );
  }, [color.hex, dimensiones, formato, nombreFichero]);

  const formatRgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const formatHsl = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
  const formatCmyk = `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;

  // Generar código HTML de implementación
  const generarCodigoHTML = useCallback(() => {
    let codigo = '<!-- Color generado con meskeIA -->\n\n';
    codigo += '<!-- Paleta de color para blog de diseño -->\n';
    codigo += '<div class="color-swatch">\n';
    codigo += '  <div class="color-preview" style="background-color: ' + color.hex + ';"></div>\n';
    codigo += '  <div class="color-info">\n';
    codigo += '    <h4>' + describirColor(color.hex).nombre + '</h4>\n';
    codigo += '    <div class="color-values">\n';
    codigo += '      <span><strong>HEX:</strong> ' + color.hex + '</span>\n';
    codigo += '      <span><strong>RGB:</strong> ' + formatRgb + '</span>\n';
    codigo += '      <span><strong>HSL:</strong> ' + formatHsl + '</span>\n';
    codigo += '      <span><strong>CMYK:</strong> ' + formatCmyk + '</span>\n';
    codigo += '    </div>\n';
    codigo += '  </div>\n';
    codigo += '</div>\n\n';
    codigo += '<!-- CSS recomendado -->\n';
    codigo += '<style>\n';
    codigo += '  .color-swatch {\n';
    codigo += '    display: flex;\n';
    codigo += '    gap: 1rem;\n';
    codigo += '    border: 1px solid #E5E5E5;\n';
    codigo += '    border-radius: 8px;\n';
    codigo += '    padding: 1rem;\n';
    codigo += '    background: white;\n';
    codigo += '  }\n';
    codigo += '  .color-preview {\n';
    codigo += '    width: 100px;\n';
    codigo += '    height: 100px;\n';
    codigo += '    border-radius: 8px;\n';
    codigo += '    box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n';
    codigo += '  }\n';
    codigo += '  .color-values {\n';
    codigo += '    display: flex;\n';
    codigo += '    flex-direction: column;\n';
    codigo += '    gap: 0.25rem;\n';
    codigo += '    font-size: 0.9rem;\n';
    codigo += '  }\n';
    codigo += '</style>';

    setHtmlCode(codigo);
  }, [color, formatRgb, formatHsl, formatCmyk]);

  // Copiar código HTML al portapapeles
  const copiarCodigoHTML = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedField('html');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generar código HTML cuando cambia el color
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎨</span> Convertidor de Colores</h1>
        <p className={styles.subtitle}>
          Convierte entre HEX, RGB, HSL y CMYK al instante
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Color Picker */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Selector de Color</h2>

          <div
            className={styles.colorDisplay}
            style={{ backgroundColor: color.hex }}
          >
            <input
              type="color"
              value={color.hex}
              onChange={handleColorPickerChange}
              className={styles.colorPicker}
              aria-label="Selector de color visual"
            />
          </div>

          <div className={styles.colorInfo}>
            {!descripcion.exacto && (
              <span className={styles.colorNameAprox}>lo más parecido a</span>
            )}
            <span className={styles.colorName}>{descripcion.nombre}</span>
          </div>

          <div className={styles.hexInputGroup}>
            <label>HEX</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className={styles.hexInput}
              placeholder="#000000"
              maxLength={7}
            />
            <button
              type="button"
              onClick={() => copyToClipboard(color.hex, 'hex')}
              className={styles.copyBtn}
            >
              {copiedField === 'hex' ? '✓' : '📋'}
            </button>
          </div>

          {/* Elegir el color por su nombre */}
          <div className={styles.nombresBloque}>
            <h3 className={styles.nombresTitulo}>Elegir por nombre</h3>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.nombresBuscador}
              placeholder="ocre, lapislázuli, verde oliva…"
              aria-label="Buscar un color por su nombre"
              aria-describedby="nombres-resultado"
            />

            <div className={styles.nombresFiltros} role="group" aria-label="Filtrar por familia de color">
              <button
                type="button"
                onClick={() => setFamilia('todas')}
                aria-pressed={familia === 'todas'}
                className={`${styles.nombresChip} ${familia === 'todas' ? styles.nombresChipActivo : ''}`}
              >
                Todas
              </button>
              {FAMILIAS_COLOR.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFamilia(f.id)}
                  aria-pressed={familia === f.id}
                  className={`${styles.nombresChip} ${familia === f.id ? styles.nombresChipActivo : ''}`}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>

            <p id="nombres-resultado" className={styles.nombresConteo} role="status" aria-live="polite">
              {coloresVisibles.length === 0
                ? 'Ningún color con ese nombre. Prueba con «verde», «azul» o borra el filtro.'
                : `${coloresVisibles.length} ${coloresVisibles.length === 1 ? 'color' : 'colores'}`}
            </p>

            <div className={styles.nombresGrid}>
              {coloresVisibles.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => elegirPorNombre(c.hex)}
                  aria-pressed={color.hex === c.hex}
                  className={`${styles.nombresMuestra} ${color.hex === c.hex ? styles.nombresMuestraActiva : ''}`}
                  style={{ backgroundColor: c.hex, color: textoLegibleSobre(c.hex) }}
                  aria-label={`${c.nombre}, ${c.hex}${c.nota ? `. ${c.nota}` : ''}`}
                  title={c.nota ? `${c.nombre} · ${c.hex} — ${c.nota}` : `${c.nombre} · ${c.hex}`}
                >
                  <span className={styles.nombresMuestraTexto}>{c.nombre}</span>
                </button>
              ))}
            </div>

            <p className={styles.nombresNota}>
              Los nombres de pigmento y de uso común (ocre, lapislázuli, terracota…) no tienen un
              código oficial único: el valor que se ofrece es el convencional, y cada muestra lo
              indica al posar el cursor. No se incluyen nombres de carta comercial de pintura
              porque cada fabricante los mezcla distinto.
            </p>
          </div>
        </div>

        {/* Panel derecho - Valores */}
        <div className={styles.panel} role="status" aria-live="polite" aria-atomic="true">
          <h2 className={styles.panelTitle}>Valores del Color</h2>

          {/* RGB */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>RGB</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(formatRgb, 'rgb')}
                className={styles.copyBtn}
              >
                {copiedField === 'rgb' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderRow}>
                <label>R</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.r}
                  onChange={(e) => updateFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
                  className={styles.slider}
                  style={{ '--slider-color': '#FF0000' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.r}
                  onChange={(e) => updateFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>G</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.g}
                  onChange={(e) => updateFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
                  className={styles.slider}
                  style={{ '--slider-color': '#00FF00' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.g}
                  onChange={(e) => updateFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>B</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.b}
                  onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
                  className={styles.slider}
                  style={{ '--slider-color': '#0000FF' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.b}
                  onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
                  className={styles.valueInput}
                />
              </div>
            </div>
            <code className={styles.codeOutput}>{formatRgb}</code>
          </div>

          {/* HSL */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>HSL</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(formatHsl, 'hsl')}
                className={styles.copyBtn}
              >
                {copiedField === 'hsl' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderRow}>
                <label>H</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={color.hsl.h}
                  onChange={(e) => updateFromHsl(Number(e.target.value), color.hsl.s, color.hsl.l)}
                  className={`${styles.slider} ${styles.hueSlider}`}
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={color.hsl.h}
                  onChange={(e) => updateFromHsl(Number(e.target.value), color.hsl.s, color.hsl.l)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>S</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.s}
                  onChange={(e) => updateFromHsl(color.hsl.h, Number(e.target.value), color.hsl.l)}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.hsl.s}
                  onChange={(e) => updateFromHsl(color.hsl.h, Number(e.target.value), color.hsl.l)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>L</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.l}
                  onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, Number(e.target.value))}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.hsl.l}
                  onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, Number(e.target.value))}
                  className={styles.valueInput}
                />
              </div>
            </div>
            <code className={styles.codeOutput}>{formatHsl}</code>
          </div>

          {/* CMYK */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>CMYK</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(formatCmyk, 'cmyk')}
                className={styles.copyBtn}
              >
                {copiedField === 'cmyk' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.cmykGrid}>
              <div className={styles.cmykItem}>
                <label>C</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.c}
                  onChange={(e) => updateFromCmyk(Number(e.target.value), color.cmyk.m, color.cmyk.y, color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>M</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.m}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, Number(e.target.value), color.cmyk.y, color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>Y</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.y}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, color.cmyk.m, Number(e.target.value), color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>K</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.k}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, color.cmyk.m, color.cmyk.y, Number(e.target.value))}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
            </div>
            <code className={styles.codeOutput}>{formatCmyk}</code>
          </div>
        </div>
      </div>

      {/* Descargar el color como imagen */}
      <section className={styles.descargaSection} aria-labelledby="descarga-titulo">
        <div className={styles.descargaHeader}>
          <div>
            <h2 id="descarga-titulo">
              <span aria-hidden="true">🖼️</span> Descargar el color como imagen
            </h2>
            <p className={styles.descargaSubtitulo}>
              Un archivo de color plano, listo para usar como fondo de pantalla, fondo de una
              diapositiva o base de un diseño. Se genera en tu navegador: el color no se envía a
              ningún servidor.
            </p>
          </div>
          <div
            className={styles.descargaMuestra}
            style={{ backgroundColor: color.hex }}
            aria-hidden="true"
          />
        </div>

        <div className={styles.descargaControles}>
          <fieldset className={styles.descargaGrupo}>
            <legend className={styles.descargaLeyenda}>Tamaño</legend>
            <div className={styles.descargaOpciones}>
              {TAMANOS_DESCARGA.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTamano(t.id)}
                  aria-pressed={tamano === t.id}
                  className={`${styles.descargaOpcion} ${tamano === t.id ? styles.descargaOpcionActiva : ''}`}
                >
                  <span className={styles.descargaOpcionEtiqueta}>{t.etiqueta}</span>
                  <span className={styles.descargaOpcionDetalle}>{t.detalle}</span>
                </button>
              ))}
            </div>

            {tamano === 'personalizado' && (
              <div className={styles.descargaMedida}>
                <label htmlFor="ancho-libre">Ancho</label>
                <input
                  id="ancho-libre"
                  type="number"
                  min={LADO_MINIMO}
                  max={LADO_MAXIMO}
                  value={anchoLibre}
                  onChange={(e) => setAnchoLibre(Number(e.target.value))}
                  className={styles.valueInput}
                />
                <span aria-hidden="true">×</span>
                <label htmlFor="alto-libre">Alto</label>
                <input
                  id="alto-libre"
                  type="number"
                  min={LADO_MINIMO}
                  max={LADO_MAXIMO}
                  value={altoLibre}
                  onChange={(e) => setAltoLibre(Number(e.target.value))}
                  className={styles.valueInput}
                />
                <span className={styles.descargaMedidaNota}>
                  píxeles, entre {LADO_MINIMO} y {LADO_MAXIMO}
                </span>
              </div>
            )}
          </fieldset>

          <fieldset className={styles.descargaGrupo}>
            <legend className={styles.descargaLeyenda}>Formato</legend>
            <div className={styles.descargaOpciones}>
              <button
                type="button"
                onClick={() => setFormato('png')}
                aria-pressed={formato === 'png'}
                className={`${styles.descargaOpcion} ${formato === 'png' ? styles.descargaOpcionActiva : ''}`}
              >
                <span className={styles.descargaOpcionEtiqueta}>PNG</span>
                <span className={styles.descargaOpcionDetalle}>color exacto</span>
              </button>
              <button
                type="button"
                onClick={() => setFormato('jpeg')}
                aria-pressed={formato === 'jpeg'}
                className={`${styles.descargaOpcion} ${formato === 'jpeg' ? styles.descargaOpcionActiva : ''}`}
              >
                <span className={styles.descargaOpcionEtiqueta}>JPEG</span>
                <span className={styles.descargaOpcionDetalle}>máxima compatibilidad</span>
              </button>
            </div>
            <p className={styles.descargaAvisoFormato}>
              {formato === 'png' ? (
                <>
                  PNG conserva el color <strong>exacto</strong> y, al ser un color plano, ocupa unos
                  pocos KB aunque pidas 4K.
                </>
              ) : (
                <>
                  <span aria-hidden="true">⚠️</span> JPEG comprime por bloques y remuestrea el color
                  aunque se genere a calidad máxima: el píxel del archivo{' '}
                  <strong>ya no será exactamente {color.hex}</strong>. Para un fondo se nota poco,
                  pero si necesitas el código fiel, usa PNG.
                </>
              )}
            </p>
          </fieldset>
        </div>

        <div className={styles.descargaAccion}>
          <button type="button" onClick={descargarImagen} className={styles.descargaBoton}>
            <span aria-hidden="true">⬇️</span> Descargar {dimensiones.ancho} × {dimensiones.alto}
          </button>
          <p className={styles.descargaNombreFichero}>
            Se guardará como <code>{nombreFichero}</code>
            <span className={styles.descargaNombreNota}>
              — el código va en el nombre para que puedas reconocer el archivo después.
            </span>
          </p>
        </div>

        {avisoDescarga && (
          <p className={styles.descargaError} role="alert">
            {avisoDescarga}
          </p>
        )}
      </section>

      {/* Código HTML de implementación - Colapsable */}
      {htmlCode && (
        <div className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2><span aria-hidden="true">💻</span> Código de implementación</h2>
              <p className={styles.htmlSubtitle}>
                Exporta este color a tu blog de diseño, guía de estilo o documentación
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
              aria-expanded={htmlExpanded}
            >
              {htmlExpanded ? '▼ Ocultar código' : '▶ Ver código HTML'}
            </button>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
              <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
                {copiedField === 'html' ? '✅ Copiado' : '📋 Copiar código'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Información Rápida */}
      <div className={styles.infoSection}>
        <h3>¿Cuándo usar cada formato?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">🌐</span>
            <h4>HEX</h4>
            <p>Estándar para desarrollo web. Compacto y fácil de usar en CSS</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">🖥️</span>
            <h4>RGB</h4>
            <p>Pantallas y monitores. Ideal para manipular canales individuales</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">🎨</span>
            <h4>HSL</h4>
            <p>Intuitivo para diseñadores. Fácil ajustar tono, saturación y brillo</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">🖨️</span>
            <h4>CMYK</h4>
            <p>Impresión profesional. Necesario para materiales impresos</p>
          </div>
        </div>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="Guía completa sobre formatos de color"
        subtitle="Aprende cuándo usar cada formato, diferencias técnicas, casos de uso y mejores prácticas"
      >
        <section className={styles.guideSection}>
          {/* Tabla comparativa */}
          <h2>⚖️ Comparativa de formatos: HEX vs RGB vs HSL vs CMYK</h2>
          <p className={styles.introParagraph}>
            Cada formato de color tiene sus ventajas y contextos ideales de uso.
            Entender sus diferencias te ayudará a elegir el más apropiado para tu proyecto.
          </p>

          <div className={styles.comparativaTable}>
            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}><strong>Aspecto</strong></div>
              <div className={styles.comparativaFormato}><strong>🌐 HEX</strong></div>
              <div className={styles.comparativaFormato}><strong>🖥️ RGB</strong></div>
              <div className={styles.comparativaFormato}><strong>🎨 HSL</strong></div>
              <div className={styles.comparativaFormato}><strong>🖨️ CMYK</strong></div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Uso principal</div>
              <div className={styles.comparativaFormato}>Web (CSS/HTML)</div>
              <div className={styles.comparativaFormato}>Pantallas digitales</div>
              <div className={styles.comparativaFormato}>Diseño UI/UX</div>
              <div className={styles.comparativaFormato}>Impresión</div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Facilidad de lectura</div>
              <div className={styles.comparativaFormato}>⭐⭐ Media</div>
              <div className={styles.comparativaFormato}>⭐⭐⭐ Alta</div>
              <div className={styles.comparativaFormato}>⭐⭐⭐⭐ Muy alta</div>
              <div className={styles.comparativaFormato}>⭐⭐ Media</div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Precisión técnica</div>
              <div className={styles.comparativaFormato}>Alta (16.7M colores)</div>
              <div className={styles.comparativaFormato}>Alta (16.7M colores)</div>
              <div className={styles.comparativaFormato}>Alta (16.7M colores)</div>
              <div className={styles.comparativaFormato}>Variable (impresora)</div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Manipulación</div>
              <div className={styles.comparativaFormato}>Difícil (valores hex)</div>
              <div className={styles.comparativaFormato}>Fácil (canales R,G,B)</div>
              <div className={styles.comparativaFormato}>Muy fácil (tono/brillo)</div>
              <div className={styles.comparativaFormato}>Media (4 canales)</div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Soporte navegadores</div>
              <div className={styles.comparativaFormato}>✅ Universal</div>
              <div className={styles.comparativaFormato}>✅ Universal</div>
              <div className={styles.comparativaFormato}>✅ Universal (CSS3)</div>
              <div className={styles.comparativaFormato}>❌ No nativo</div>
            </div>

            <div className={styles.comparativaRow}>
              <div className={styles.comparativaAspecto}>Compatibilidad impresión</div>
              <div className={styles.comparativaFormato}>⚠️ Conversión necesaria</div>
              <div className={styles.comparativaFormato}>⚠️ Conversión necesaria</div>
              <div className={styles.comparativaFormato}>⚠️ Conversión necesaria</div>
              <div className={styles.comparativaFormato}>✅ Nativo</div>
            </div>
          </div>

          <div className={styles.comparativaConsejo}>
            <strong>💡 Recomendación meskeIA:</strong> Usa HEX o RGB para web, HSL para ajustes de diseño,
            y CMYK solo si entregas archivos a imprenta profesional.
          </div>

          {/* Casos de uso prácticos */}
          <h2>🎯 Casos de uso reales</h2>
          <p className={styles.introParagraph}>
            Ejemplos concretos de cuándo elegir cada formato según tu proyecto
          </p>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon}>🌐</div>
              <h3>Desarrollo web (CSS)</h3>
              <div className={styles.escenarioContent}>
                <p><strong>Formato recomendado:</strong> HEX o RGB</p>
                <p className={styles.escenarioDetalle}>
                  <strong>Por qué:</strong> HEX es más compacto (#2E86AB vs rgb(46,134,171)).
                  RGB es mejor si necesitas manipular opacidad con rgba().
                </p>
                <code className={styles.escenarioCode}>
                  background: #2E86AB;<br />
                  color: rgb(46, 134, 171);<br />
                  border: rgba(46, 134, 171, 0.5);
                </code>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon}>🎨</div>
              <h3>Diseño UI/UX (Figma, Sketch)</h3>
              <div className={styles.escenarioContent}>
                <p><strong>Formato recomendado:</strong> HSL</p>
                <p className={styles.escenarioDetalle}>
                  <strong>Por qué:</strong> Es intuitivo para crear variaciones de un color
                  (más claro/oscuro, más saturado). Ideal para sistemas de diseño.
                </p>
                <code className={styles.escenarioCode}>
                  Color base: hsl(198, 58%, 43%)<br />
                  Hover: hsl(198, 58%, 35%) /* -8% brillo */<br />
                  Disabled: hsl(198, 20%, 43%) /* -38% saturación */
                </code>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon}>🖨️</div>
              <h3>Material impreso (imprenta)</h3>
              <div className={styles.escenarioContent}>
                <p><strong>Formato recomendado:</strong> CMYK</p>
                <p className={styles.escenarioDetalle}>
                  <strong>Por qué:</strong> Las impresoras profesionales usan tintas CMYK.
                  RGB/HEX pueden verse diferentes al imprimir.
                </p>
                <code className={styles.escenarioCode}>
                  CMYK: C73 M22 Y0 K33<br />
                  (Especificar en InDesign, Illustrator)<br />
                  Validar con prueba de color física
                </code>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcon}>📱</div>
              <h3>Apps móviles (iOS, Android)</h3>
              <div className={styles.escenarioContent}>
                <p><strong>Formato recomendado:</strong> HEX o RGB</p>
                <p className={styles.escenarioDetalle}>
                  <strong>Por qué:</strong> Ambos formatos son nativos.
                  iOS usa UIColor(red, green, blue), Android usa #HEX.
                </p>
                <code className={styles.escenarioCode}>
                  iOS: UIColor(red: 46/255, green: 134/255, blue: 171/255)<br />
                  Android: #2E86AB<br />
                  React Native: &#39;#2E86AB&#39; o &#39;rgb(46,134,171)&#39;
                </code>
              </div>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h2>Cómo elegir el formato adecuado (paso a paso)</h2>
          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Identifica el contexto de uso</h3>
                <p>
                  <strong>Web/App:</strong> HEX, RGB o HSL<br />
                  <strong>Impresión profesional:</strong> CMYK<br />
                  <strong>Diseño/prototipado:</strong> HSL (más intuitivo)<br />
                  <strong>Manipulación dinámica:</strong> RGB o HSL
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Verifica compatibilidad técnica</h3>
                <p>
                  Si usas CSS moderno: HSL es más legible y fácil de ajustar.<br />
                  Si necesitas opacidad: RGB + alpha → rgba(r, g, b, 0.5).<br />
                  Si entregas a imprenta: Convierte a CMYK y valida con prueba física.
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Mantén consistencia en el proyecto</h3>
                <p>
                  Elige UN formato principal para tu sistema de diseño.<br />
                  Documenta todos los colores en ese formato (ej: variables CSS con HSL).<br />
                  Solo convierte cuando sea técnicamente necesario (ej: CMYK para impresión).
                </p>
              </div>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Prueba en el contexto real</h3>
                <p>
                  <strong>Web:</strong> Verifica en diferentes navegadores y dispositivos.<br />
                  <strong>Impresión:</strong> Solicita prueba de color física antes de tirada masiva.<br />
                  <strong>Apps:</strong> Prueba en dispositivos reales (colores varían según pantalla).
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>❓ ¿Por qué mis colores se ven diferentes en pantalla y al imprimir?</h3>
            <p>
              Las pantallas usan <strong>RGB (luz)</strong>, mientras que las impresoras usan
              <strong>CMYK (tinta)</strong>. Son modelos de color diferentes y no pueden reproducir
              exactamente los mismos colores.
            </p>
            <p className={styles.faqExample}>
              <strong>Ejemplo práctico:</strong><br />
              • Un azul brillante RGB (0, 100, 255) se verá más apagado en CMYK<br />
              • Los colores neón/fluorescentes de RGB son imposibles de replicar en CMYK<br />
              • CMYK tiene un "gamut" (rango de colores) menor que RGB
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Solución:</strong> Si diseñas para impresión, trabaja en CMYK desde el inicio
              en Illustrator/InDesign. Siempre pide una prueba física de color antes de la tirada final.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Cuál es la diferencia práctica entre HEX y RGB?</h3>
            <p>
              Son el mismo modelo de color, solo varía la <strong>notación</strong>:
            </p>
            <p className={styles.faqExample}>
              • <strong>HEX:</strong> #2E86AB (hexadecimal, compacto)<br />
              • <strong>RGB:</strong> rgb(46, 134, 171) (decimal, más legible)<br />
              • <strong>Equivalencia:</strong> 2E₁₆ = 46₁₀, 86₁₆ = 134₁₀, AB₁₆ = 171₁₀
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Cuándo usar cada uno:</strong><br />
              • HEX: Código CSS limpio y compacto<br />
              • RGB: Si necesitas manipular canales individuales o usar rgba() para transparencia
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Por qué HSL es mejor para diseñadores?</h3>
            <p>
              HSL representa el color de forma <strong>más intuitiva para humanos</strong>:
            </p>
            <p className={styles.faqExample}>
              • <strong>H (Hue):</strong> Tono del color (0-360°) - Rojo=0°, Verde=120°, Azul=240°<br />
              • <strong>S (Saturation):</strong> Intensidad (0-100%) - 0%=gris, 100%=color puro<br />
              • <strong>L (Lightness):</strong> Brillo (0-100%) - 0%=negro, 50%=color, 100%=blanco
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Ejemplo práctico:</strong> Para crear un hover state más oscuro,
              solo reduces L: hsl(198, 58%, 43%) → hsl(198, 58%, 35%). En HEX sería #2E86AB → #256A8A
              (no tan obvio qué cambió).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Puedo usar CMYK en CSS/HTML?</h3>
            <p>
              <strong>No directamente</strong>. Los navegadores solo entienden RGB, HEX y HSL nativamente.
              CMYK requiere conversión.
            </p>
            <p className={styles.faqExample}>
              <strong>Si tienes un color CMYK que necesitas en web:</strong><br />
              1. Usa este conversor para obtener el HEX/RGB equivalente<br />
              2. Ten en cuenta que puede haber diferencias visuales (CMYK → RGB no es perfecto)<br />
              3. Si es crítico, compara visualmente el resultado en pantalla
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Qué es el "espacio de color" y por qué importa?</h3>
            <p>
              Un espacio de color define el <strong>rango de colores posibles</strong>.
              Los más comunes son:
            </p>
            <p className={styles.faqExample}>
              • <strong>sRGB:</strong> Estándar web, menor rango de colores<br />
              • <strong>Adobe RGB:</strong> Mayor rango, ideal para fotografía profesional<br />
              • <strong>Display P3:</strong> Usado en pantallas Apple modernas, más colores que sRGB
            </p>
            <p className={styles.faqTip}>
              ⚠️ <strong>Importante:</strong> Un mismo HEX puede verse diferente en diferentes
              espacios de color. Para web, trabaja siempre en sRGB para consistencia.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>❓ ¿Cómo garantizo accesibilidad en colores?</h3>
            <p>
              Verifica el <strong>contraste</strong> entre texto y fondo según WCAG:
            </p>
            <p className={styles.faqExample}>
              • <strong>Nivel AA:</strong> Ratio mínimo 4.5:1 (texto normal), 3:1 (texto grande)<br />
              • <strong>Nivel AAA:</strong> Ratio mínimo 7:1 (texto normal), 4.5:1 (texto grande)
            </p>
            <p className={styles.faqTip}>
              💡 <strong>Herramientas recomendadas:</strong><br />
              • WebAIM Contrast Checker (online)<br />
              • Chrome DevTools (Lighthouse audit)<br />
              • Figma plugins: Stark, Color Contrast Checker
            </p>
          </div>

          {/* Mejores prácticas */}
          <h2>Mejores prácticas para trabajar con colores</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa variables CSS</h4>
              <p>Define colores en variables para cambiarlos fácilmente: --primary: #2E86AB;</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Documenta tu paleta</h4>
              <p>Crea una guía de estilo con todos los colores y sus usos específicos (botones, fondos, textos).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Valida el contraste</h4>
              <p>Asegúrate de cumplir WCAG 2.1 AA (mínimo 4.5:1) para texto sobre fondo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa HSL para variaciones</h4>
              <p>Es más fácil crear hovers, disabled states y escalas de color ajustando S y L.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Prueba en dispositivos reales</h4>
              <p>Los colores varían según la pantalla. Verifica en móviles, tablets y monitores diferentes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Mantén consistencia</h4>
              <p>Elige UN formato principal para tu proyecto y úsalo en toda la documentación.</p>
            </div>
          </div>

          {/* Warning box */}
          <div className={styles.warningBox}>
            <h3>⚠️ Errores comunes que debes evitar</h3>
            <ul>
              <li><strong>Usar colores RGB para impresión sin conversión:</strong> Se verán diferentes en papel.</li>
              <li><strong>No verificar contraste de accesibilidad:</strong> Tu sitio será ilegible para algunos usuarios.</li>
              <li><strong>Hardcodear colores en múltiples lugares:</strong> Usa variables CSS para facilitar cambios globales.</li>
              <li><strong>Asumir que todos verán los mismos colores:</strong> Pantallas, calibración y daltonismo afectan la percepción.</li>
              <li><strong>Copiar HEX con el # al CSS:</strong> Verifica que el # esté incluido (#2E86AB, no 2E86AB).</li>
              <li><strong>Mezclar formatos sin motivo:</strong> Mantén consistencia (no uses HEX en unos sitios y HSL en otros sin razón).</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-colores')} />
      <ShareCard appName="conversor-colores" />
      <Footer appName="conversor-colores" />
    </div>
  );
}
