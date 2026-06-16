'use client';
// @disclaimer: exempt

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorCifradoCesar.module.css';

// ============================================================
// Constantes
// ============================================================
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Frecuencias relativas del español (%)
const FREQS_ES: Record<string, number> = {
  A: 12.5, B: 1.4, C: 4.7, D: 5.9, E: 14.7, F: 0.7, G: 1.0, H: 1.2,
  I: 6.2, J: 0.5, K: 0.1, L: 5.0, M: 3.1, N: 7.0, O: 8.7, P: 2.5,
  Q: 0.9, R: 6.9, S: 7.9, T: 4.6, U: 3.9, V: 0.9, W: 0.1, X: 0.2,
  Y: 0.9, Z: 0.5,
};

const TEXTOS_PREDEFINIDOS = [
  { id: 'cesar', label: 'Julio César', texto: 'Veni, vidi, vici' },
  {
    id: 'quijote',
    label: 'Quijote',
    texto: 'En un lugar de la Mancha de cuyo nombre no quiero acordarme',
  },
  {
    id: 'tecnico',
    label: 'Mensaje técnico',
    texto: 'MENSAJE SECRETO: Reunión hoy a las 20:00 en el punto de encuentro número 3.',
  },
  { id: 'alfabeto', label: 'Alfabeto', texto: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  {
    id: 'largo',
    label: 'Párrafo largo',
    texto:
      'La criptografía es la práctica de técnicas para asegurar la comunicación ante la presencia de terceros. Históricamente se refería a la encriptación de mensajes para que solo el destinatario pudiera leerlos. En la actualidad, la criptografía moderna incluye confidencialidad, integridad, autenticación y no repudio.',
  },
];

// ============================================================
// Lógica de cifrado
// ============================================================
function cifrarLetra(letra: string, desplazamiento: number): string {
  const esUpper = letra === letra.toUpperCase();
  const base = esUpper ? 65 : 97;
  const code = letra.charCodeAt(0) - base;
  const cifrado = ((code + desplazamiento) % 26 + 26) % 26;
  return String.fromCharCode(cifrado + base);
}

function procesarTexto(texto: string, desplazamiento: number, descifrar: boolean): string {
  const desp = descifrar ? (26 - desplazamiento) % 26 : desplazamiento;
  return texto
    .split('')
    .map((c) => {
      const upper = c.toUpperCase();
      if (upper >= 'A' && upper <= 'Z') return cifrarLetra(c, desp);
      return c;
    })
    .join('');
}

function calcularFrecuencias(texto: string): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const ch of texto.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      counts[ch] = (counts[ch] ?? 0) + 1;
      total++;
    }
  }
  const freqs: Record<string, number> = {};
  for (const letra of ALFABETO) {
    freqs[letra] = total > 0 ? ((counts[letra] ?? 0) / total) * 100 : 0;
  }
  return freqs;
}

function detectarDesplazamiento(textoCifrado: string): number {
  const freqs = calcularFrecuencias(textoCifrado);
  let maxFreq = 0;
  let letraMasFrecuente = 'E';
  for (const [letra, freq] of Object.entries(freqs)) {
    if (freq > maxFreq) {
      maxFreq = freq;
      letraMasFrecuente = letra;
    }
  }
  // Asumimos que la letra más frecuente es 'E'
  const codE = 'E'.charCodeAt(0) - 65;
  const codLetra = letraMasFrecuente.charCodeAt(0) - 65;
  return ((codLetra - codE) + 26) % 26;
}

// ============================================================
// Componente principal
// ============================================================
export default function SimuladorCifradoCesar() {
  const [desplazamiento, setDesplazamiento] = useState<number>(3);
  const [modoDescifrar, setModoDescifrar] = useState<boolean>(false);
  const [textoOriginal, setTextoOriginal] = useState<string>(TEXTOS_PREDEFINIDOS[0].texto);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [presetActivo, setPresetActivo] = useState<string>('cesar');
  const [attackMsg, setAttackMsg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const anguloActualRef = useRef<number>(0);

  // Texto resultado
  const textoProcesado = procesarTexto(textoOriginal, desplazamiento, modoDescifrar);

  // Frecuencias del texto cifrado (siempre del texto procesado con modo cifrar para el histograma)
  const textoCifrado = modoDescifrar
    ? textoOriginal
    : procesarTexto(textoOriginal, desplazamiento, false);
  const frecuencias = calcularFrecuencias(textoCifrado);
  const maxFreq = Math.max(...Object.values(frecuencias));
  const letraMasFrecuenteCifrado = ALFABETO.split('').reduce(
    (best, l) => (frecuencias[l] > frecuencias[best] ? l : best),
    'A'
  );

  // ============================================================
  // Canvas — rueda del alfabeto
  // ============================================================
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const cx = W / 2;
    const cy = H / 2;

    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W * dpr, H * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Fondo
    ctx.fillStyle = isDark ? '#1e2533' : '#f8fafc';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(W, H) / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    const radioExt = Math.min(W, H) / 2 - 16;
    const radioInt = radioExt * 0.62;

    // Ángulo animado actual
    const anguloBase = anguloActualRef.current;

    // ---- Círculo exterior (cifrado) ----
    ctx.strokeStyle = '#48A9A6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radioExt, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 26; i++) {
      const ang = (2 * Math.PI * i) / 26 + anguloBase - Math.PI / 2;
      const x = cx + radioExt * Math.cos(ang);
      const y = cy + radioExt * Math.sin(ang);

      // Letra en el círculo exterior
      const indexCifrado = (i + desplazamiento) % 26;
      const letraCifrada = ALFABETO[indexCifrado];

      // Resaltar la letra que mapea con A (posición 0)
      const esActiva = i === 0;
      ctx.font = `${esActiva ? 700 : 500} ${esActiva ? 13 : 11}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = esActiva ? '#F4D03F' : (isDark ? '#48A9A6' : '#1a6b68');
      ctx.fillText(letraCifrada, x, y);
    }

    // ---- Círculo interior (original, fijo) ----
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radioInt, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 26; i++) {
      const ang = (2 * Math.PI * i) / 26 - Math.PI / 2;
      const x = cx + radioInt * Math.cos(ang);
      const y = cy + radioInt * Math.sin(ang);

      const esActiva = i === 0;
      ctx.font = `${esActiva ? 700 : 500} ${esActiva ? 13 : 11}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = esActiva ? '#F4D03F' : (isDark ? '#7FB3D3' : '#1a5278');
      ctx.fillText(ALFABETO[i], x, y);
    }

    // Línea de referencia (arriba, posición 0)
    ctx.save();
    ctx.strokeStyle = '#F4D03F';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - radioInt - 4);
    ctx.lineTo(cx, cy - radioExt + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Etiquetas
    ctx.font = '600 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isDark ? '#94a3b8' : '#6b7280';
    ctx.fillText('Original (interior)', cx, cy - radioInt + radioInt * 0.35);
    ctx.fillText('Cifrado (exterior)', cx, cy - radioExt + radioExt * 0.1);

    ctx.restore();
  }, [desplazamiento]);

  // Animar rotación al cambiar desplazamiento
  useEffect(() => {
    const anguloObjetivo = (desplazamiento / 26) * (2 * Math.PI);

    let diff = anguloObjetivo - anguloActualRef.current;
    // Normalizar diff al camino más corto
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    if (Math.abs(diff) < 0.001) {
      anguloActualRef.current = anguloObjetivo;
      dibujar();
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    const velocidad = 0.08; // fracción del diff por frame

    function animar() {
      const d = anguloObjetivo - anguloActualRef.current;
      let dNorm = d;
      while (dNorm > Math.PI) dNorm -= 2 * Math.PI;
      while (dNorm < -Math.PI) dNorm += 2 * Math.PI;

      if (Math.abs(dNorm) < 0.01) {
        anguloActualRef.current = anguloObjetivo;
        dibujar();
        rafRef.current = null;
        return;
      }

      anguloActualRef.current += dNorm * velocidad;
      dibujar();
      rafRef.current = requestAnimationFrame(animar);
    }

    rafRef.current = requestAnimationFrame(animar);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [desplazamiento, dibujar]);

  // Redimensionar canvas con DPR correcto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function redimensionar() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(canvas.parentElement?.offsetWidth ?? 320, 320);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      dibujar();
    }

    redimensionar();
    window.addEventListener('resize', redimensionar);
    return () => window.removeEventListener('resize', redimensionar);
  }, [dibujar]);

  // Redibujar si cambia el tema
  useEffect(() => {
    const observer = new MutationObserver(() => dibujar());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [dibujar]);

  // ============================================================
  // Handlers
  // ============================================================
  function handleCopiar() {
    navigator.clipboard.writeText(textoProcesado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    });
  }

  function handlePreset(id: string, texto: string) {
    setPresetActivo(id);
    setTextoOriginal(texto);
    setAttackMsg('');
  }

  function handleAtaque() {
    const letrasEnTexto = textoCifrado.replace(/[^A-Za-z]/g, '');
    if (letrasEnTexto.length < 20) {
      setAttackMsg('Necesitas al menos 20 letras para un análisis de frecuencias fiable.');
      return;
    }
    const desp = detectarDesplazamiento(textoCifrado);
    setDesplazamiento(desp);
    setModoDescifrar(false);
    setAttackMsg(
      `Ataque completado. Letra más frecuente: "${letraMasFrecuenteCifrado}" → asumiendo E. Desplazamiento detectado: ${desp}.`
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Cifrado César</h1>
        <p>
          Cifra y descifra texto con la técnica usada por Julio César. Aprende análisis de
          frecuencias.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Panel: Rueda del alfabeto + controles */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Rueda del Alfabeto</h2>

          <div className={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              className={styles.canvasEl}
              aria-label="Rueda del alfabeto — círculo interior original, círculo exterior cifrado"
            />

            <div className={styles.controlsRow}>
              <div className={styles.sliderGroup}>
                <label htmlFor="slider-desp">
                  Desplazamiento (k)&nbsp;
                  <span className={styles.sliderValue}>{desplazamiento}</span>
                  {desplazamiento === 13 && (
                    <span className={styles.rot13Badge}>ROT-13</span>
                  )}
                </label>
                <input
                  id="slider-desp"
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={desplazamiento}
                  onChange={(e) => {
                    setDesplazamiento(Number(e.target.value));
                    setAttackMsg('');
                  }}
                />
              </div>

              <div>
                <div className={styles.toggleRow} role="group" aria-label="Modo cifrado">
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!modoDescifrar ? styles.active : ''}`}
                    onClick={() => setModoDescifrar(false)}
                    aria-pressed={!modoDescifrar}
                  >
                    Cifrar
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${modoDescifrar ? styles.active : ''}`}
                    onClick={() => setModoDescifrar(true)}
                    aria-pressed={modoDescifrar}
                  >
                    Descifrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel: Textos predefinidos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Textos predefinidos</h2>
          <div className={styles.presetGrid}>
            {TEXTOS_PREDEFINIDOS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.presetBtn} ${presetActivo === p.id ? styles.active : ''}`}
                onClick={() => handlePreset(p.id, p.texto)}
                aria-pressed={presetActivo === p.id}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Panel: Texto original y resultado */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            {modoDescifrar ? 'Texto cifrado → descifrado' : 'Texto original → cifrado'}
          </h2>
          <div className={styles.textGrid}>
            <div className={styles.textGroup}>
              <label htmlFor="texto-original">
                {modoDescifrar ? 'Texto cifrado (entrada)' : 'Texto original'}
              </label>
              <textarea
                id="texto-original"
                value={textoOriginal}
                onChange={(e) => {
                  setTextoOriginal(e.target.value);
                  setPresetActivo('');
                  setAttackMsg('');
                }}
                placeholder="Escribe aquí el texto..."
                spellCheck={false}
              />
            </div>

            <div className={styles.textGroup}>
              <label htmlFor="texto-resultado">
                {modoDescifrar ? 'Texto descifrado (resultado)' : 'Texto cifrado (resultado)'}
              </label>
              <textarea
                id="texto-resultado"
                value={textoProcesado}
                readOnly
                className={styles.textReadOnly}
                aria-label={modoDescifrar ? 'Texto descifrado' : 'Texto cifrado'}
              />
              <button
                type="button"
                className={`${styles.copyBtn} ${copiado ? styles.copyBtnSuccess : ''}`}
                onClick={handleCopiar}
                aria-label="Copiar texto al portapapeles"
              >
                {copiado ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </section>

        {/* Panel: Histograma de frecuencias */}
        <section className={styles.panel}>
          <div className={styles.histoHeader}>
            <h2 className={styles.panelTitle} style={{ margin: 0 }}>
              Histograma de Frecuencias
            </h2>
            <button
              type="button"
              className={styles.attackBtn}
              onClick={handleAtaque}
              title="Detecta automáticamente el desplazamiento por análisis de frecuencias"
            >
              Ataque automático
            </button>
          </div>

          {attackMsg && (
            <p className={styles.attackResult} role="alert" aria-live="polite">
              {attackMsg}
            </p>
          )}

          <div className={styles.histoWrap}>
            <div className={styles.histoBars} role="img" aria-label="Histograma de frecuencias de letras en el texto cifrado">
              {ALFABETO.split('').map((letra) => {
                const pct = frecuencias[letra] ?? 0;
                const altoPx = maxFreq > 0 ? Math.round((pct / maxFreq) * 96) : 0;
                const esMayorFreq = letra === letraMasFrecuenteCifrado && maxFreq > 0;
                return (
                  <div key={letra} className={styles.histoBar}>
                    <div
                      className={`${styles.histoBarInner} ${esMayorFreq ? styles.histoBarMax : ''}`}
                      style={{ height: `${altoPx}px` }}
                      title={`${letra}: ${pct.toFixed(1)}%`}
                    />
                    <span className={styles.histoBarLetter}>{letra}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className={styles.histoHint}>
            Barra azul = letra más frecuente en el texto{modoDescifrar ? ' cifrado' : ' procesado'}.
            En español, la E tiene ~14,7% de frecuencia.
          </p>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía del Cifrado César"
          subtitle="Criptografía clásica, análisis de frecuencias y su evolución histórica"
        >
          <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            El cifrado César, usado por Julio César para comunicaciones militares, sustituye cada
            letra por otra desplazada k posiciones en el alfabeto. Con solo 25 claves posibles es
            trivialmente rompible por fuerza bruta o análisis de frecuencias: en cualquier idioma,
            la distribución de letras es característica (E domina en español con ~14,7%).
            Comprender el César es el primer paso hacia criptografía moderna.
          </p>

          <h3 className={styles.eduSubtitle}>Comparativa de cifrados</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Cifrado</th>
                  <th>Tipo</th>
                  <th>Claves posibles</th>
                  <th>Resistencia</th>
                  <th>Uso histórico</th>
                  <th>Equivalente moderno</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>César</td>
                  <td>Sustitución monoalfabética</td>
                  <td>25</td>
                  <td>Nula (frecuencias)</td>
                  <td>Roma antigua</td>
                  <td>ROT-13 (bromas online)</td>
                </tr>
                <tr>
                  <td>Vigenère</td>
                  <td>Sustitución polialfabética</td>
                  <td>26^n</td>
                  <td>Baja (Kasiski)</td>
                  <td>Siglo XVI-XIX</td>
                  <td>OTP limitado</td>
                </tr>
                <tr>
                  <td>Enigma</td>
                  <td>Sustitución electromecánica</td>
                  <td>10^114</td>
                  <td>Alta para su época</td>
                  <td>WWII</td>
                  <td>Rotor cipher</td>
                </tr>
                <tr>
                  <td>DES</td>
                  <td>Bloque simétrico</td>
                  <td>2^56</td>
                  <td>Rota (1999)</td>
                  <td>Banca 1970-2000</td>
                  <td>3DES (deprecated)</td>
                </tr>
                <tr>
                  <td>AES-128</td>
                  <td>Bloque simétrico</td>
                  <td>2^128</td>
                  <td>Muy alta</td>
                  <td>Internet actual</td>
                  <td>AES-256</td>
                </tr>
                <tr>
                  <td>RSA-2048</td>
                  <td>Asimétrico</td>
                  <td>2^2048</td>
                  <td>Muy alta</td>
                  <td>HTTPS, TLS</td>
                  <td>ECC (más eficiente)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de uso del simulador</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Desplazamiento 13 (ROT-13)</h4>
              <p>
                Cifrar con k=13 dos veces devuelve el original: ROT-13 es una involución.
                Históricamente se usó para ocultar spoilers en foros.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Ataque por fuerza bruta</h4>
              <p>
                Solo hay 25 claves posibles. Cualquier computadora las prueba todas en
                microsegundos. Pulsa el slider varias veces para emular el proceso.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Análisis de frecuencias en español</h4>
              <p>
                Con un texto largo, la letra más frecuente en el cifrado probablemente sea E
                desplazada. El botón &quot;Ataque automático&quot; usa esta heurística.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>César vs Vigenère</h4>
              <p>
                El mismo desplazamiento en todo el texto es la debilidad fatal del César.
                Vigenère usa una clave que varía, dificultando el análisis directo.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Es seguro el cifrado César hoy?</strong>
              <p>
                No. Con 25 claves posibles, cualquier computadora lo rompe en microsegundos, ya
                sea por fuerza bruta o por análisis de frecuencias.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es ROT-13?</strong>
              <p>
                César con k=13: especial porque cifrar dos veces devuelve el original (26/2=13).
                Se usaba en Usenet para ocultar spoilers y respuestas a acertijos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo funciona el análisis de frecuencias?</strong>
              <p>
                La distribución de letras de un idioma es constante: en español, la E aparece
                ~14,7% de las veces. La letra más frecuente en el texto cifrado probablemente
                sea E desplazada, revelando k.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el cifrado César se llama así?</strong>
              <p>
                Suetonio describe que Julio César lo usaba desplazando 3 posiciones en latín
                para comunicaciones militares. Es el registro histórico más antiguo de un cifrado
                de sustitución documentado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué cifrado usa HTTPS?</strong>
              <p>
                TLS 1.3 usa AES-256-GCM (simétrico) para los datos, combinado con ECDHE
                (curvas elípticas) para el intercambio de claves sin transmitirla por la red.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo usar el simulador — paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Escribe o selecciona un texto predefinido</strong>
                <p>
                  Usa los botones de textos predefinidos o escribe directamente en el área de texto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Mueve el slider y observa la rueda girar</strong>
                <p>
                  El círculo exterior rota con animación suave. La línea amarilla muestra el par
                  A↔X activo. El texto cifrado se actualiza en tiempo real.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Activa el toggle &quot;Descifrar&quot;</strong>
                <p>
                  Introduce el texto cifrado y el mismo desplazamiento para recuperar el original.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Con un texto largo, pulsa &quot;Ataque automático&quot;</strong>
                <p>
                  El histograma de frecuencias detecta la clave más probable comparando con
                  la distribución del español y la aplica automáticamente.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Prueba ROT-13 (k=13)</strong>
                <p>
                  Cifra cualquier texto con k=13 y luego vuélvelo a cifrar con k=13: recuperas
                  el original. Es una operación idempotente de orden 2.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Consejos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>La E domina en español</strong>
                <p>
                  ~14,7% de frecuencia: es la guía del análisis de frecuencias. En inglés, también
                  es la letra más común (~12,7%).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <div>
                <strong>ROT-13 es su propio inverso</strong>
                <p>
                  Cifrar y descifrar son la misma operación. Muy útil para verificar que tu
                  implementación es correcta.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <div>
                <strong>Sustitución monoalfabética</strong>
                <p>
                  Cada letra siempre se cifra igual. Eso es exactamente lo que hace vulnerable
                  al César frente al análisis de frecuencias.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Los espacios no se cifran</strong>
                <p>
                  En criptografía real, el padding oculta la longitud del mensaje. Sin padding,
                  la estructura del texto da información al atacante.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes al estudiar criptografía clásica
            </div>
            <ul className={styles.warningList}>
              <li>
                Asumir que más desplazamiento = más seguro: solo hay 25 claves posibles, todas
                igualmente inseguras.
              </li>
              <li>
                Cifrar sin anotar el desplazamiento y no poder descifrar: k debe ser idéntico en
                emisor y receptor.
              </li>
              <li>
                Olvidar el módulo 26: la Z+1 debe volver a la A. Sin módulo, el código produce
                caracteres fuera del alfabeto.
              </li>
              <li>
                Comparar longitud del texto cifrado con el original y asumir que es seguro: en
                sustitución, la longitud no cambia, lo que revela información sobre el mensaje.
              </li>
              <li>
                Confundir cifrado con codificación (Base64, URL encoding): codificar transforma la
                representación pero no oculta el contenido — cualquiera puede decodificarlo.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-cifrado-cesar')} />
        <ShareCard appName="simulador-cifrado-cesar" />
      </main>

      <Footer appName="simulador-cifrado-cesar" />
    </div>
  );
}
