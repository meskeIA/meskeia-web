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
import styles from './VisualizadorEspaciosColor.module.css';

// ============== TIPOS ==============

interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

// ============== CONVERSIONES (implementación propia, estándar) ==============

// RGB (0-255) → HSV (h:0-360, s:0-100, v:0-100)
function rgbAHsv({ r, g, b }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h, s: s * 100, v: v * 100 };
}

// HSV (h:0-360, s:0-100, v:0-100) → RGB (0-255)
function hsvARgb({ h, s, v }: HSV): RGB {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  const m = vn - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

// RGB (0-255) → HSL (h:0-360, s:0-100, l:0-100)
function rgbAHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

// RGB (0-255) → HEX (#RRGGBB)
function rgbAHex({ r, g, b }: RGB): string {
  const aDos = (n: number): string => n.toString(16).padStart(2, '0');
  return `#${aDos(r)}${aDos(g)}${aDos(b)}`.toUpperCase();
}

// Redondea cada canal a entero válido
function normalizarRgb({ r, g, b }: RGB): RGB {
  const clamp = (n: number): number => Math.max(0, Math.min(255, Math.round(n)));
  return { r: clamp(r), g: clamp(g), b: clamp(b) };
}

// ============== CONSTANTES DE CANVAS ==============

const CANVAS_LADO = 280; // px lógicos del cuadrado saturación/valor

// ============== COMPONENTE PRINCIPAL ==============

export default function VisualizadorEspaciosColorPage() {
  // RGB es la fuente de verdad
  const [rgb, setRgb] = useState<RGB>({ r: 46, g: 134, b: 171 });
  // El tono se mantiene aparte para que el cuadrado SV no "salte" cuando el color
  // es gris (saturación 0) y el tono queda indefinido al derivarlo de RGB.
  const [hue, setHue] = useState<number>(() => rgbAHsv({ r: 46, g: 134, b: 171 }).h);
  const [copiado, setCopiado] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arrastrandoSV = useRef<boolean>(false);
  const copiadoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Valores derivados
  const hsv = rgbAHsv(rgb);
  const hsl = rgbAHsl(rgb);
  const hex = rgbAHex(rgb);

  // Saturación y valor actuales (0-100), tomados del propio RGB
  const satActual = hsv.s;
  const valActual = hsv.v;

  // ===== Aplicar cambios =====

  const aplicarRgb = useCallback((nuevo: RGB) => {
    const limpio = normalizarRgb(nuevo);
    setRgb(limpio);
    const nh = rgbAHsv(limpio);
    // Solo actualizamos el tono si el color tiene saturación (si no, conservamos el anterior)
    if (nh.s > 0.5 && nh.v > 0.5) {
      setHue(nh.h);
    }
  }, []);

  // Cambia S y V manteniendo el tono actual (desde el cuadrado)
  const aplicarSV = useCallback(
    (s: number, v: number) => {
      const nuevo = hsvARgb({ h: hue, s, v });
      setRgb(normalizarRgb(nuevo));
    },
    [hue],
  );

  // Cambia el tono manteniendo S y V actuales (desde el slider de tono)
  const aplicarHue = useCallback(
    (h: number) => {
      setHue(h);
      const nuevo = hsvARgb({ h, s: satActual, v: valActual });
      setRgb(normalizarRgb(nuevo));
    },
    [satActual, valActual],
  );

  // ===== Dibujo del cuadrado saturación/valor =====
  // Solo se redibuja cuando cambia el tono (no en cada render).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Base: color puro del tono
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, w, h);

    // Gradiente horizontal blanco → transparente (saturación)
    const gradWhite = ctx.createLinearGradient(0, 0, w, 0);
    gradWhite.addColorStop(0, 'rgba(255,255,255,1)');
    gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, w, h);

    // Gradiente vertical transparente → negro (valor)
    const gradBlack = ctx.createLinearGradient(0, 0, 0, h);
    gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
    gradBlack.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, w, h);
  }, [hue]);

  // ===== Interacción con el cuadrado SV =====

  const procesarPunteroSV = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let x = (clientX - rect.left) / rect.width;
      let y = (clientY - rect.top) / rect.height;
      x = Math.max(0, Math.min(1, x));
      y = Math.max(0, Math.min(1, y));
      const s = x * 100;
      const v = (1 - y) * 100;
      aplicarSV(s, v);
    },
    [aplicarSV],
  );

  const handleSVDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      arrastrandoSV.current = true;
      procesarPunteroSV(e.clientX, e.clientY);
    },
    [procesarPunteroSV],
  );

  const handleSVMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!arrastrandoSV.current) return;
      procesarPunteroSV(e.clientX, e.clientY);
    },
    [procesarPunteroSV],
  );

  useEffect(() => {
    const soltar = () => {
      arrastrandoSV.current = false;
    };
    window.addEventListener('pointerup', soltar);
    return () => window.removeEventListener('pointerup', soltar);
  }, []);

  // Teclado sobre el cuadrado SV (accesibilidad)
  const handleSVKey = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      const paso = e.shiftKey ? 10 : 2;
      let s = satActual;
      let v = valActual;
      let usado = true;
      switch (e.key) {
        case 'ArrowRight':
          s = Math.min(100, s + paso);
          break;
        case 'ArrowLeft':
          s = Math.max(0, s - paso);
          break;
        case 'ArrowUp':
          v = Math.min(100, v + paso);
          break;
        case 'ArrowDown':
          v = Math.max(0, v - paso);
          break;
        default:
          usado = false;
      }
      if (usado) {
        e.preventDefault();
        aplicarSV(s, v);
      }
    },
    [satActual, valActual, aplicarSV],
  );

  // ===== Color aleatorio =====
  const colorAleatorio = useCallback(() => {
    const nuevo: RGB = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    setRgb(nuevo);
    const nh = rgbAHsv(nuevo);
    setHue(nh.h);
  }, []);

  // ===== Copiar al portapapeles =====
  const copiar = useCallback(async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(`${etiqueta} copiado: ${texto}`);
    } catch {
      setCopiado('No se pudo copiar al portapapeles');
    }
    if (copiadoTimer.current) clearTimeout(copiadoTimer.current);
    copiadoTimer.current = setTimeout(() => setCopiado(''), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (copiadoTimer.current) clearTimeout(copiadoTimer.current);
    };
  }, []);

  // ===== Cadenas de notación =====
  const strRgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const strHsl = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
  const strHsv = `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;

  // Posición del marcador en el cuadrado (en %)
  const marcadorX = satActual;
  const marcadorY = 100 - valActual;
  // Borde del marcador según luminosidad para que se vea sobre claro u oscuro
  const marcadorBorde = valActual > 55 ? '#1a1a1a' : '#ffffff';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Espacios de Color</h1>
        <p className={styles.subtitle}>
          Elige un color y velo a la vez en RGB, HSV, HSL y HEX. Pensado para programación de
          videojuegos, generación de imágenes, CSS y diseño.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Picker */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>1. Selecciona el color</h2>
          <div className={styles.pickerLayout}>
            {/* Cuadrado saturación/valor */}
            <div className={styles.svWrapper}>
              <canvas
                ref={canvasRef}
                width={CANVAS_LADO}
                height={CANVAS_LADO}
                className={styles.svCanvas}
                onPointerDown={handleSVDown}
                onPointerMove={handleSVMove}
                onKeyDown={handleSVKey}
                tabIndex={0}
                role="slider"
                aria-label={`Cuadrado de saturación y valor. Saturación ${Math.round(
                  satActual,
                )}%, valor ${Math.round(valActual)}%. Usa las flechas para ajustar.`}
                aria-valuetext={`Saturación ${Math.round(satActual)}%, valor ${Math.round(
                  valActual,
                )}%`}
              />
              <span
                className={styles.svMarcador}
                style={{
                  left: `${marcadorX}%`,
                  top: `${marcadorY}%`,
                  borderColor: marcadorBorde,
                }}
                aria-hidden="true"
              />
            </div>

            {/* Controles a la derecha */}
            <div className={styles.pickerControles}>
              {/* Slider de tono */}
              <div className={styles.sliderRow}>
                <label htmlFor="hue-slider" className={styles.sliderLabel}>
                  Tono (H)
                </label>
                <input
                  id="hue-slider"
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={Math.round(hue)}
                  onChange={(e) => aplicarHue(parseInt(e.target.value, 10))}
                  className={styles.hueSlider}
                />
                <span className={styles.sliderValue}>{Math.round(hue)}°</span>
              </div>

              {/* Sliders RGB */}
              <div className={styles.sliderRow}>
                <label htmlFor="r-slider" className={styles.sliderLabel}>
                  Rojo (R)
                </label>
                <input
                  id="r-slider"
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={rgb.r}
                  onChange={(e) => aplicarRgb({ ...rgb, r: parseInt(e.target.value, 10) })}
                  className={`${styles.rgbSlider} ${styles.rSlider}`}
                />
                <span className={styles.sliderValue}>{rgb.r}</span>
              </div>
              <div className={styles.sliderRow}>
                <label htmlFor="g-slider" className={styles.sliderLabel}>
                  Verde (G)
                </label>
                <input
                  id="g-slider"
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={rgb.g}
                  onChange={(e) => aplicarRgb({ ...rgb, g: parseInt(e.target.value, 10) })}
                  className={`${styles.rgbSlider} ${styles.gSlider}`}
                />
                <span className={styles.sliderValue}>{rgb.g}</span>
              </div>
              <div className={styles.sliderRow}>
                <label htmlFor="b-slider" className={styles.sliderLabel}>
                  Azul (B)
                </label>
                <input
                  id="b-slider"
                  type="range"
                  min={0}
                  max={255}
                  step={1}
                  value={rgb.b}
                  onChange={(e) => aplicarRgb({ ...rgb, b: parseInt(e.target.value, 10) })}
                  className={`${styles.rgbSlider} ${styles.bSlider}`}
                />
                <span className={styles.sliderValue}>{rgb.b}</span>
              </div>

              <button type="button" className={styles.randomBtn} onClick={colorAleatorio}>
                <span aria-hidden="true">🎲</span> Color aleatorio
              </button>
            </div>
          </div>
        </div>

        {/* Swatch + valores */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>2. El mismo color en cada espacio</h2>
          <div className={styles.resultLayout}>
            <div
              className={styles.swatch}
              style={{ background: strRgb }}
              aria-label={`Muestra del color actual: ${hex}`}
              role="img"
            />

            <div className={styles.valoresGrid}>
              <ValorFila
                etiqueta="HEX"
                valor={hex}
                onCopiar={() => copiar(hex, 'HEX')}
                copiarStyle={styles}
              />
              <ValorFila
                etiqueta="RGB"
                valor={strRgb}
                onCopiar={() => copiar(strRgb, 'RGB')}
                copiarStyle={styles}
              />
              <ValorFila
                etiqueta="HSL"
                valor={strHsl}
                onCopiar={() => copiar(strHsl, 'HSL')}
                copiarStyle={styles}
              />
              <ValorFila
                etiqueta="HSV"
                valor={strHsv}
                onCopiar={() => copiar(strHsv, 'HSV')}
                copiarStyle={styles}
              />
            </div>
          </div>

          <div className={styles.copiadoAviso} role="status" aria-live="polite" aria-atomic="true">
            {copiado}
          </div>

          <div className={styles.hint}>
            RGB es la <strong>fuente de verdad</strong>: HSV, HSL y HEX se recalculan a partir de
            él. HEX es simplemente RGB escrito en hexadecimal; HSV y HSL reorganizan el color en
            torno al tono.
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía de Espacios de Color"
        subtitle="RGB, HSV, HSL y HEX — qué son y cuándo usar cada uno"
      >
        <h3>Comparativa de los cuatro espacios</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Espacio</th>
                <th>Componentes</th>
                <th>Rango</th>
                <th>Para qué sirve</th>
                <th>Cuándo usarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>RGB</strong>
                </td>
                <td>Rojo, verde, azul</td>
                <td>0–255 por canal</td>
                <td>Cómo la pantalla genera el color (luz)</td>
                <td>Shaders, formatos de imagen, almacenamiento</td>
              </tr>
              <tr>
                <td>
                  <strong>HEX</strong>
                </td>
                <td>#RRGGBB (es RGB en hexadecimal)</td>
                <td>00–FF por canal</td>
                <td>Notación compacta de un color RGB</td>
                <td>CSS, HTML, editores de diseño</td>
              </tr>
              <tr>
                <td>
                  <strong>HSV</strong>
                </td>
                <td>Tono, saturación, valor</td>
                <td>H 0–360, S/V 0–100%</td>
                <td>Elegir y ajustar color de forma intuitiva</td>
                <td>Pickers, paletas, arte de videojuegos</td>
              </tr>
              <tr>
                <td>
                  <strong>HSL</strong>
                </td>
                <td>Tono, saturación, luminosidad</td>
                <td>H 0–360, S/L 0–100%</td>
                <td>Aclarar/oscurecer manteniendo el matiz</td>
                <td>Sistemas de diseño, temas, CSS moderno</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Dónde se usa en la práctica</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🌐
              </span>
              <strong>CSS y diseño web</strong>
            </div>
            <p className={styles.escenarioExample}>
              En CSS conviven HEX, <code>rgb()</code> y <code>hsl()</code>. HSL es muy práctico para
              generar variantes de un color de marca: mismo tono y saturación, distinta luminosidad
              para estados hover, bordes o fondos.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Define el color base en HSL y deriva la paleta cambiando solo la L; mantienes la
              coherencia del tono.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🎮
              </span>
              <strong>Paletas en arte de videojuegos</strong>
            </div>
            <p className={styles.escenarioExample}>
              Para una paleta coherente de un personaje o escenario se parte de un tono y se varían
              saturación y valor en HSV. Así se obtienen luces y sombras del mismo color sin que
              «cambie» de matiz.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Sombras más saturadas y con tono ligeramente desplazado suelen verse más vivas que
              limitarse a bajar el valor.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                🖼️
              </span>
              <strong>Corrección y generación de imágenes</strong>
            </div>
            <p className={styles.escenarioExample}>
              Ajustar saturación o tono global de una imagen es natural en HSV/HSL. En generación
              por código (shaders, IA, procedural) se trabaja en RGB para la salida, pero a menudo
              se razona en HSV para controlar el resultado.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> Subir la saturación uniforme en HSV evita el «lavado» que produce tocar canales RGB
              por separado.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">
                ♿
              </span>
              <strong>Accesibilidad y contraste</strong>
            </div>
            <p className={styles.escenarioExample}>
              El contraste entre texto y fondo depende sobre todo de la luminosidad. Ver el color en
              HSL ayuda a entender por qué dos tonos distintos con la misma L contrastan poco entre
              sí.
            </p>
            <p className={styles.escenarioTip}>
              <span aria-hidden="true">💡</span> El contraste WCAG se mide entre dos colores con su luminancia relativa; este
              visualizador es un punto de partida, no un medidor de conformidad.
            </p>
          </div>
        </div>

        <h3>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿HSV y HSL son lo mismo?</h4>
            <p>
              No. Comparten el tono (H) y una saturación, pero su tercera componente es distinta. En
              HSV es el <em>valor</em> (V): a V=100% el color es lo más brillante posible para ese
              tono. En HSL es la <em>luminosidad</em> (L): a L=100% siempre es blanco y a L=50% es el
              color puro. Por eso un mismo color tiene cifras de S y de la tercera componente
              diferentes en cada modelo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Regla rápida: en HSV el blanco se consigue bajando la saturación; en HSL, subiendo
              la luminosidad.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué mi gris no tiene un tono definido?</h4>
            <p>
              Cuando el rojo, el verde y el azul son iguales (un gris, el blanco o el negro) la
              saturación es 0 y el tono queda indefinido matemáticamente. Esta herramienta conserva
              el último tono que tenías para que el cuadrado y el slider no «salten» al pasar por un
              gris.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Es el motivo de que el tono se guarde aparte del RGB en muchos selectores de color.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿RGB y HEX son el mismo color?</h4>
            <p>
              Sí, son exactamente la misma información. <code>#2E86AB</code> es
              <code> rgb(46, 134, 171)</code>: cada par hexadecimal es un canal de 0 a 255 escrito en
              base 16. HEX es solo una forma más corta de escribir el color, muy cómoda en CSS y al
              compartirlo.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> 2E en hexadecimal es 46 en decimal; 86 es 134; AB es 171.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Y CMYK? ¿Por qué no aparece?</h4>
            <p>
              CMYK es un modelo <strong>sustractivo</strong> pensado para impresión con tintas, no
              para pantalla. RGB, HSV, HSL y HEX describen luz emitida (modelo aditivo) y es lo que
              usan pantallas, videojuegos y la web. Convertir a CMYK depende del perfil de color de
              la impresora y del papel, por eso no se incluye aquí.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Un color RGB muy vivo puede quedar «apagado» al imprimirlo: parte de la gama RGB no
              es reproducible en CMYK.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué espacio uso para programar?</h4>
            <p>
              Para la salida real (un shader, un buffer de imagen, una textura) se usa RGB porque es
              lo que entiende la pantalla. Para la lógica de elección de color —generar paletas,
              variar tonos, oscurecer— suele ser más cómodo trabajar en HSV o HSL y convertir a RGB
              al final.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Implementar las conversiones rgb↔hsv una vez te ahorra depender de librerías en
              proyectos pequeños.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué a veces el HEX cambia un poco al ir y volver?</h4>
            <p>
              Las conversiones implican redondeos: RGB usa enteros de 0 a 255 y HSV/HSL usan
              porcentajes. Al pasar de un espacio a otro y volver, el redondeo puede mover algún
              canal en una unidad. Es normal y, a simple vista, imperceptible.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Si necesitas exactitud bit a bit, guarda y compara siempre en RGB o HEX, no en
              HSV/HSL.
            </p>
          </div>
        </div>

        <h3>Cómo convertir RGB a HSV paso a paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Normaliza los canales</strong>
              <p>
                Divide R, G y B entre 255 para llevarlos al rango 0–1. Trabajar en 0–1 simplifica el
                resto de la fórmula.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Halla el máximo y el mínimo</strong>
              <p>
                Calcula <code>máx</code> y <code>mín</code> de los tres canales normalizados y su
                diferencia <code>delta = máx − mín</code>.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Valor y saturación</strong>
              <p>
                El valor V es el máximo. La saturación S es 0 si el máximo es 0; en otro caso, S =
                delta / máx. Multiplica por 100 para tenerlos en porcentaje.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Calcula el tono</strong>
              <p>
                Según cuál de los tres sea el máximo se usa una fórmula distinta comparando los otros
                dos canales; el resultado se multiplica por 60 para obtener grados.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Ajusta el rango del tono</strong>
              <p>
                Si el tono sale negativo, súmale 360 para dejarlo en 0–360. Listo: ya tienes H, S y
                V equivalentes al color RGB de partida.
              </p>
            </div>
          </div>
        </div>

        <h3>Consejos para trabajar con color</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Elige en HSV/HSL, guarda en RGB/HEX</strong>
            <p>
              Razona el color por tono y brillo, pero almacénalo y transmítelo en RGB o HEX, que es
              lo que entienden pantalla y formatos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Paletas variando una sola dimensión</strong>
            <p>
              Fija el tono y mueve solo saturación o luminosidad para obtener una familia de colores
              coherente.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Piensa en luminosidad para el contraste</strong>
            <p>
              Dos colores contrastan bien sobre todo si su luminosidad difiere lo suficiente, no solo
              si son tonos distintos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Guarda el tono aparte</strong>
            <p>
              Al programar un picker, conserva H por separado para que grises y blancos no borren el
              tono elegido.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Distingue aditivo de sustractivo</strong>
            <p>
              RGB es luz (pantalla); CMYK es tinta (impresión). No esperes que un RGB vibrante se
              imprima idéntico.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <strong>Cuida los redondeos</strong>
            <p>
              Al ir y volver entre espacios puede variar algún canal en una unidad; compara siempre
              en RGB o HEX.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠
            </span>
            <strong>Errores frecuentes con los espacios de color</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Confundir HSV con HSL: la tercera componente (valor vs. luminosidad) no es la misma.</li>
            <li>Creer que RGB y CMYK son intercambiables: uno es luz aditiva, el otro tinta sustractiva.</li>
            <li>Esperar que un color RGB vivo se imprima idéntico en CMYK; parte de la gama se pierde.</li>
            <li>Olvidar normalizar los canales a 0–1 antes de convertir a HSV/HSL.</li>
            <li>Derivar el tono de un gris y obtener saltos: en gris el tono está indefinido.</li>
            <li>Medir el contraste de accesibilidad con un solo color en vez de la ratio entre dos.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-espacios-color')} />
      <ShareCard appName="visualizador-espacios-color" />
      <Footer appName="visualizador-espacios-color" />
    </div>
  );
}

// ============== FILA DE VALOR (con botón copiar) ==============

interface ValorFilaProps {
  etiqueta: string;
  valor: string;
  onCopiar: () => void;
  copiarStyle: Record<string, string>;
}

function ValorFila({ etiqueta, valor, onCopiar, copiarStyle }: ValorFilaProps) {
  return (
    <div className={copiarStyle.valorFila}>
      <span className={copiarStyle.valorEtiqueta}>{etiqueta}</span>
      <code className={copiarStyle.valorTexto}>{valor}</code>
      <button
        type="button"
        className={copiarStyle.copiarBtn}
        onClick={onCopiar}
        aria-label={`Copiar valor ${etiqueta}: ${valor}`}
      >
        <span aria-hidden="true">📋</span> Copiar
      </button>
    </div>
  );
}
