'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
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
import styles from './SimuladorFotografia.module.css';

type Modo = 'libre' | 'compensado';
type EscenaId = 'retrato' | 'paisaje' | 'deporte';

const ISO_VALUES = [100, 200, 400, 800, 1600, 3200, 6400] as const;
const APERTURE_VALUES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22] as const;
const SHUTTER_VALUES = [
  1, 1 / 2, 1 / 4, 1 / 8, 1 / 15, 1 / 30, 1 / 60, 1 / 125, 1 / 250, 1 / 500, 1 / 1000, 1 / 2000, 1 / 4000,
] as const;

interface EscenaConfig {
  id: EscenaId;
  nombre: string;
  emoji: string;
  isoIdx: number;
  apIdx: number;
  shIdx: number;
  descripcion: string;
}

const ESCENAS: EscenaConfig[] = [
  {
    id: 'retrato',
    nombre: 'Retrato',
    emoji: '👤',
    isoIdx: 3, // ISO 800
    apIdx: 2, // f/2,8
    shIdx: 7, // 1/125
    descripcion:
      'Interior con luz tenue. Aquí brilla la apertura abierta: el fondo se desenfoca (bokeh) y aísla al sujeto.',
  },
  {
    id: 'paisaje',
    nombre: 'Paisaje',
    emoji: '🏔️',
    isoIdx: 0, // ISO 100
    apIdx: 6, // f/11
    shIdx: 8, // 1/250
    descripcion:
      'Día soleado al aire libre. Aquí brilla la apertura cerrada: gran profundidad de campo, todo nítido del primer plano al horizonte.',
  },
  {
    id: 'deporte',
    nombre: 'Deportes',
    emoji: '🏃',
    isoIdx: 2, // ISO 400
    apIdx: 3, // f/4
    shIdx: 10, // 1/1000
    descripcion:
      'Acción rápida. La velocidad alta congela al sujeto; la velocidad lenta produce motion blur (rastro de movimiento).',
  },
];

function isoStops(idx: number) {
  return Math.log2(ISO_VALUES[idx] / ISO_VALUES[0]);
}
function apertureStops(idx: number) {
  // Cantidad de luz ∝ 1/f². Stop = -2·log2(f/f_ref). f bajo = más luz.
  return -2 * Math.log2(APERTURE_VALUES[idx] / APERTURE_VALUES[0]);
}
function shutterStops(idx: number) {
  return Math.log2(SHUTTER_VALUES[idx] / SHUTTER_VALUES[0]);
}

function calcDeltaEV(isoIdx: number, apIdx: number, shIdx: number, ref: EscenaConfig) {
  return (
    (isoStops(isoIdx) - isoStops(ref.isoIdx)) +
    (apertureStops(apIdx) - apertureStops(ref.apIdx)) +
    (shutterStops(shIdx) - shutterStops(ref.shIdx))
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatShutter(idx: number) {
  const s = SHUTTER_VALUES[idx];
  if (s >= 1) return `${s} s`;
  return `1/${Math.round(1 / s)} s`;
}

function formatAperture(idx: number) {
  const f = APERTURE_VALUES[idx];
  const decimales = f < 10 && f % 1 !== 0 ? 1 : 0;
  return `f/${formatNumber(f, decimales)}`;
}

export default function SimuladorFotografiaPage() {
  const [escenaId, setEscenaId] = useState<EscenaId>('retrato');
  const [modo, setModo] = useState<Modo>('libre');
  const escena = ESCENAS.find((e) => e.id === escenaId)!;

  const [isoIdx, setIsoIdxRaw] = useState(escena.isoIdx);
  const [apIdx, setApIdxRaw] = useState(escena.apIdx);
  const [shIdx, setShIdxRaw] = useState(escena.shIdx);

  const cambiarEscena = (id: EscenaId) => {
    const esc = ESCENAS.find((e) => e.id === id)!;
    setEscenaId(id);
    setIsoIdxRaw(esc.isoIdx);
    setApIdxRaw(esc.apIdx);
    setShIdxRaw(esc.shIdx);
  };

  // Setters con compensación automática en modo compensado.
  // Estrategia: mover ISO o apertura → compensa con velocidad. Mover velocidad → compensa con ISO.
  const setIso = (newIdx: number) => {
    setIsoIdxRaw(newIdx);
    if (modo === 'compensado') {
      const objStops = -(
        (isoStops(newIdx) - isoStops(escena.isoIdx)) +
        (apertureStops(apIdx) - apertureStops(escena.apIdx))
      );
      const newShIdx = clamp(Math.round(escena.shIdx + objStops), 0, SHUTTER_VALUES.length - 1);
      setShIdxRaw(newShIdx);
    }
  };

  const setAp = (newIdx: number) => {
    setApIdxRaw(newIdx);
    if (modo === 'compensado') {
      const objStops = -(
        (isoStops(isoIdx) - isoStops(escena.isoIdx)) +
        (apertureStops(newIdx) - apertureStops(escena.apIdx))
      );
      const newShIdx = clamp(Math.round(escena.shIdx + objStops), 0, SHUTTER_VALUES.length - 1);
      setShIdxRaw(newShIdx);
    }
  };

  const setSh = (newIdx: number) => {
    setShIdxRaw(newIdx);
    if (modo === 'compensado') {
      const objStops = -(
        (apertureStops(apIdx) - apertureStops(escena.apIdx)) +
        (shutterStops(newIdx) - shutterStops(escena.shIdx))
      );
      const newIsoIdx = clamp(Math.round(escena.isoIdx + objStops), 0, ISO_VALUES.length - 1);
      setIsoIdxRaw(newIsoIdx);
    }
  };

  const deltaEV = useMemo(
    () => calcDeltaEV(isoIdx, apIdx, shIdx, escena),
    [isoIdx, apIdx, shIdx, escena],
  );

  // Efectos visuales derivados de los parámetros
  const bokehBlur = useMemo(
    () => Math.max(0, 14 * (1 - apIdx / (APERTURE_VALUES.length - 1))),
    [apIdx],
  );

  const noiseOpacity = useMemo(() => (isoIdx / (ISO_VALUES.length - 1)) * 0.45, [isoIdx]);

  const motionBlur = useMemo(() => {
    if (escena.id !== 'deporte') return 0;
    const stopsLento = shutterStops(shIdx) - shutterStops(10); // positivo cuando más lento que 1/1000
    if (stopsLento <= 0) return 0;
    return Math.min(stopsLento * 4, 30);
  }, [shIdx, escena.id]);

  const overlayDark = deltaEV >= 0 ? 0 : Math.min(0.85, Math.abs(deltaEV) / 4);
  const overlayLight = deltaEV <= 0 ? 0 : Math.min(0.85, deltaEV / 4);

  const evAbs = Math.abs(deltaEV);
  let exposureLabel: string;
  let exposureClass: string;
  if (evAbs <= 0.3) {
    exposureLabel = 'Exposición correcta';
    exposureClass = styles.expOk;
  } else if (deltaEV > 0 && deltaEV <= 1.5) {
    exposureLabel = 'Ligeramente sobreexpuesto';
    exposureClass = styles.expWarn;
  } else if (deltaEV > 1.5) {
    exposureLabel = 'Sobreexpuesto (zonas quemadas)';
    exposureClass = styles.expBad;
  } else if (deltaEV < 0 && deltaEV >= -1.5) {
    exposureLabel = 'Ligeramente subexpuesto';
    exposureClass = styles.expWarn;
  } else {
    exposureLabel = 'Subexpuesto (foto oscura)';
    exposureClass = styles.expBad;
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>📷 Simulador de Fotografía</h1>
        <p>
          Aprende el triángulo de exposición moviendo ISO, apertura y velocidad. Ve el resultado en
          tiempo real con bokeh, ruido y motion blur.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.tabBar} role="tablist" aria-label="Selección de escena">
          {ESCENAS.map((esc) => (
            <button
              key={esc.id}
              role="tab"
              aria-selected={escenaId === esc.id}
              className={`${styles.tabBtn} ${escenaId === esc.id ? styles.tabActive : ''}`}
              onClick={() => cambiarEscena(esc.id)}
            >
              <span aria-hidden="true">{esc.emoji}</span> {esc.nombre}
            </button>
          ))}
        </div>

        <div className={styles.modoToggle} role="group" aria-label="Modo de simulación">
          <button
            className={`${styles.modoBtn} ${modo === 'libre' ? styles.modoActive : ''}`}
            onClick={() => setModo('libre')}
            aria-pressed={modo === 'libre'}
          >
            Modo libre
          </button>
          <button
            className={`${styles.modoBtn} ${modo === 'compensado' ? styles.modoActive : ''}`}
            onClick={() => setModo('compensado')}
            aria-pressed={modo === 'compensado'}
          >
            Modo compensado
          </button>
        </div>

        <p className={styles.modoDescripcion}>
          {modo === 'libre'
            ? 'Mueve cada parámetro de forma independiente. La exposición cambia con cada ajuste, así descubres qué hace cada uno por separado.'
            : 'Al mover un parámetro, los otros se reajustan automáticamente para mantener la exposición correcta. Así entiendes cómo se "intercambian" stops entre ISO, apertura y velocidad.'}
        </p>

        <div className={styles.escenaInfo}>
          <strong>{escena.emoji} {escena.nombre}:</strong> {escena.descripcion}
        </div>

        <div className={styles.controlsPanel}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros de la cámara</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="iso-slider">
                ISO (sensibilidad del sensor)
                <span className={styles.valueBadge}>ISO {ISO_VALUES[isoIdx]}</span>
              </label>
              <input
                id="iso-slider"
                type="range"
                min={0}
                max={ISO_VALUES.length - 1}
                step={1}
                value={isoIdx}
                onChange={(e) => setIso(parseInt(e.target.value))}
                aria-valuetext={`ISO ${ISO_VALUES[isoIdx]}`}
              />
              <span className={styles.unitLabel}>
                ISO bajo (100) = sensor poco sensible, foto limpia. ISO alto (6400) = más brillo en
                escenas oscuras pero ruido digital visible.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="ap-slider">
                Apertura del diafragma
                <span className={styles.valueBadge}>{formatAperture(apIdx)}</span>
              </label>
              <input
                id="ap-slider"
                type="range"
                min={0}
                max={APERTURE_VALUES.length - 1}
                step={1}
                value={apIdx}
                onChange={(e) => setAp(parseInt(e.target.value))}
                aria-valuetext={formatAperture(apIdx)}
              />
              <span className={styles.unitLabel}>
                f/1,4 = apertura abierta, mucha luz, fondo desenfocado (bokeh). f/22 = apertura
                cerrada, poca luz, todo nítido (mucha profundidad de campo).
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="sh-slider">
                Velocidad de obturación
                <span className={styles.valueBadge}>{formatShutter(shIdx)}</span>
              </label>
              <input
                id="sh-slider"
                type="range"
                min={0}
                max={SHUTTER_VALUES.length - 1}
                step={1}
                value={shIdx}
                onChange={(e) => setSh(parseInt(e.target.value))}
                aria-valuetext={formatShutter(shIdx)}
              />
              <span className={styles.unitLabel}>
                Velocidad rápida (1/4000s) = congela el movimiento. Lenta (1s) = motion blur y
                riesgo de trepidación si no usas trípode.
              </span>
            </div>

            <button className={styles.calcBtnGhost} onClick={() => cambiarEscena(escena.id)}>
              ↺ Volver a la combinación correcta
            </button>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado fotográfico</h2>
            <EscenaSVG
              escena={escena.id}
              bokehBlur={bokehBlur}
              noiseOpacity={noiseOpacity}
              motionBlur={motionBlur}
              overlayDark={overlayDark}
              overlayLight={overlayLight}
            />

            <div className={styles.exposureMeter}>
              <p className={styles.exposureTitle}>Indicador de exposición</p>
              <div className={styles.exposureScale} aria-hidden="true">
                <span>−3</span>
                <span>−2</span>
                <span>−1</span>
                <span>0</span>
                <span>+1</span>
                <span>+2</span>
                <span>+3</span>
              </div>
              <div className={styles.exposureBar}>
                <div className={styles.exposureCenter} />
                <div
                  className={styles.exposureMarker}
                  style={{ left: `${50 + (clamp(deltaEV, -3, 3) / 3) * 50}%` }}
                />
              </div>
              <div role="status" aria-live="polite">
                <p className={`${styles.exposureLabel} ${exposureClass}`}>
                  {exposureLabel} ({deltaEV >= 0 ? '+' : ''}
                  {formatNumber(deltaEV, 1)} EV)
                </p>
              </div>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Efectos en esta foto</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Profundidad de campo</span>
                <span className={styles.resultValue}>
                  {apIdx <= 1
                    ? 'Muy reducida (fondo muy borroso)'
                    : apIdx <= 3
                      ? 'Reducida (bokeh notable)'
                      : apIdx >= 7
                        ? 'Muy amplia (todo nítido)'
                        : apIdx >= 5
                          ? 'Amplia'
                          : 'Media'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Ruido digital</span>
                <span className={styles.resultValue}>
                  {isoIdx <= 1
                    ? 'Muy bajo'
                    : isoIdx <= 3
                      ? 'Bajo'
                      : isoIdx <= 4
                        ? 'Notable'
                        : 'Alto (visible al ampliar)'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Movimiento</span>
                <span className={styles.resultValue}>
                  {shIdx >= 10
                    ? 'Congelado por completo'
                    : shIdx >= 7
                      ? 'Nítido en sujetos lentos'
                      : shIdx >= 4
                        ? 'Trepidación posible'
                        : 'Motion blur fuerte'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Trípode</span>
                <span className={styles.resultValue}>
                  {shIdx >= 7
                    ? 'No es necesario'
                    : shIdx >= 4
                      ? 'Recomendado'
                      : 'Imprescindible'}
                </span>
              </div>
            </div>

            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>EV = log₂(N² / t) + log₂(ISO / 100)</p>
              <p className={styles.formulaCaption}>
                Cada paso (stop) duplica o divide a la mitad la luz que llega al sensor
              </p>
            </div>
          </div>
        </div>

        <EducationalSection
          title="Guía del Triángulo de Exposición"
          subtitle="Aprende cómo interactúan ISO, apertura y velocidad"
          icon="📷"
        >
          <h3 className={styles.eduSubtitle}>Los 3 parámetros del triángulo</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Qué hace</th>
                  <th>Efecto creativo</th>
                  <th>Efecto secundario</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ISO</td>
                  <td>Sensibilidad del sensor a la luz</td>
                  <td>Permite disparar en escenas oscuras sin trípode</td>
                  <td>ISO alto = ruido digital (granulado)</td>
                </tr>
                <tr>
                  <td>Apertura (f-stop)</td>
                  <td>Tamaño del diafragma que deja pasar la luz</td>
                  <td>Controla la profundidad de campo (bokeh)</td>
                  <td>Aperturas extremas pueden afectar la nitidez</td>
                </tr>
                <tr>
                  <td>Velocidad de obturación</td>
                  <td>Tiempo que el sensor recibe luz</td>
                  <td>Congela el movimiento o lo difumina (motion blur)</td>
                  <td>Velocidades lentas requieren trípode</td>
                </tr>
                <tr>
                  <td>Exposición (EV)</td>
                  <td>Cantidad total de luz capturada</td>
                  <td>Suma de los 3 parámetros (en stops)</td>
                  <td>Depende también de la luz disponible</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>¿Qué es un &quot;stop&quot;?</h3>
          <p className={styles.guideParagraph}>
            Un <strong>stop</strong> (o paso) es la unidad de medida de la luz en fotografía.
            Subir 1 stop = duplicar la luz; bajar 1 stop = mitad de luz. Por eso los 3 parámetros
            son intercambiables: si abres la apertura 1 stop pero aceleras la velocidad 1 stop, la
            exposición no cambia. Es la base del modo compensado de este simulador.
          </p>

          <h3 className={styles.eduSubtitle}>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Retrato en interior</h4>
              <p>
                ISO 800 + f/2,8 + 1/125s. Apertura abierta para aislar al sujeto con bokeh, ISO
                medio para compensar la luz tenue, velocidad suficiente para evitar trepidación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Paisaje al amanecer</h4>
              <p>
                ISO 100 + f/11 + 1/60s con trípode. Apertura cerrada para que todo esté nítido,
                ISO mínimo para máxima calidad, velocidad lenta porque hay poca luz.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Deporte de día</h4>
              <p>
                ISO 400 + f/4 + 1/1000s. Velocidad muy alta para congelar la acción, apertura
                amplia para dejar entrar luz suficiente, ISO algo elevado por seguridad.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Vía Láctea</h4>
              <p>
                ISO 3200 + f/2,8 + 25s con trípode. ISO alto (las estrellas dan poca luz),
                apertura máxima, velocidad muy lenta (más de 25s y las estrellas se mueven).
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué un f-number bajo significa apertura abierta?</strong>
              <p>
                El f-number es una razón: f/2 significa que el diámetro de apertura es 1/2 de la
                longitud focal. f/22 = 1/22, mucho más pequeño. Por eso números pequeños =
                aperturas grandes (más luz).
              </p>
              <p className={styles.faqTip}>
                💡 Cada paso de apertura es un factor √2 (≈ 1,41) en el f-number, porque la luz
                depende del área (diámetro al cuadrado).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuándo subir el ISO en lugar de abrir más la apertura?</strong>
              <p>
                Si ya tienes la apertura tan abierta como quieres (por estética o por el límite
                del objetivo), o si abrir más perjudicaría la imagen (poca profundidad de campo,
                bordes blandos), entonces sube el ISO o usa un trípode para bajar la velocidad.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué velocidad mínima evita la trepidación?</strong>
              <p>
                Regla práctica: <strong>1/longitud focal</strong>. Con un objetivo de 50 mm, no
                bajes de 1/60s a pulso. Con 200 mm, no bajes de 1/250s. Los estabilizadores
                modernos permiten 2-3 stops más lento (con un 50 mm, hasta 1/15s o 1/8s).
              </p>
              <p className={styles.faqTip}>
                💡 Esta regla aplica a fotografía estática, no a sujetos en movimiento.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué mi foto de noche sale con ruido?</strong>
              <p>
                Porque la cámara necesita amplificar la señal del sensor para que se vea algo. A
                ISO alto el ruido se hace visible. Soluciones: trípode + velocidad lenta + ISO
                bajo, o un objetivo luminoso (f/1,4 o f/1,8).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la regla &quot;Sunny 16&quot;?</strong>
              <p>
                Para días soleados sin nubes, una exposición correcta es f/16 + velocidad =
                1/ISO. Con ISO 100, sería f/16 + 1/100s. Es un punto de partida sin medidor de
                luz.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Modo manual o automático?</strong>
              <p>
                Para aprender, ve directamente al manual. Para situaciones cambiantes, los modos
                semiautomáticos son ideales: prioridad de apertura (Av/A) cuando te importa el
                bokeh, prioridad de velocidad (Tv/S) cuando te importa congelar movimiento.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo decidir los 3 parámetros — paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Decide el efecto creativo principal</strong>
                <p>
                  ¿Quieres bokeh (fondo desenfocado) o todo nítido? ¿Congelar movimiento o
                  difuminarlo? Esto fija el primer parámetro: apertura para bokeh, velocidad para
                  movimiento.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Elige el ISO más bajo posible</strong>
                <p>
                  Empieza por ISO 100. Solo súbelo si la luz no es suficiente con el primer
                  parámetro ya fijado. Cada cámara tiene un &quot;ISO útil&quot; (límite donde el
                  ruido es aceptable).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Ajusta el tercer parámetro para exposición correcta</strong>
                <p>
                  Mira el medidor de exposición de la cámara. Si la aguja indica 0 EV, exposición
                  correcta. Si está a la derecha (sobreexpuesto), reduce luz; a la izquierda,
                  añádela.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Comprueba la velocidad mínima</strong>
                <p>
                  ¿Es ≥ 1/focal? Si no, sube ISO o abre apertura. ¿Tienes trípode? Entonces
                  puedes bajar todo lo que quieras, salvo si el sujeto se mueve.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Dispara y revisa el histograma</strong>
                <p>
                  Si el histograma toca el extremo derecho, hay zonas quemadas (información
                  perdida). Si toca el izquierdo, sombras tapadas. Lo ideal: una campana
                  centrada o ligeramente desplazada según la escena.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Decide primero la intención</strong>
                <p>El triángulo es matemática; la foto es arte. Decide qué quieres antes de tocar diales.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Mira el histograma, no la pantalla</strong>
                <p>La pantalla de la cámara engaña con el brillo del entorno. El histograma no.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔒</span>
              <div>
                <strong>Aprende el modo manual</strong>
                <p>Te da control total. Los modos automáticos no entienden tu intención creativa.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Apertura abierta no siempre es lo mejor</strong>
                <p>A f/1,4 los bordes pueden ser blandos y la profundidad de campo es tan estrecha que un ojo está nítido y el otro no.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Dispara en RAW</strong>
                <p>Tienes margen para recuperar 1-2 stops en posproducción. En JPEG, lo que ves es lo que hay.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌅</span>
              <div>
                <strong>La hora dorada es tu aliada</strong>
                <p>Luz suave y cálida que perdona casi todo. Usa nuestro <a href="/golden-hour/">calculador de hora dorada</a>.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Usar ISO automático y luego quejarse del ruido. El ISO automático prioriza la
                exposición sin importar la calidad: contrólalo manualmente.
              </li>
              <li>
                Disparar con apertura máxima (f/1,4) en retratos de grupo: la profundidad de
                campo es tan reducida que solo una persona estará nítida.
              </li>
              <li>
                Olvidar la regla 1/focal: con un teleobjetivo a pulso, una velocidad de 1/30s
                garantiza foto borrosa.
              </li>
              <li>
                Confundir motion blur con desenfoque por error: si quieres que un coche dé
                sensación de velocidad, motion blur es bueno; si quieres congelarlo, es un fallo.
              </li>
              <li>
                Ignorar el medidor de la cámara y disparar &quot;a ojo&quot;. El sensor ve la luz
                muy distinto a tu vista.
              </li>
              <li>
                Pensar que un ISO alto es siempre malo: una foto con ruido pero nítida es mejor
                que una foto limpia pero movida o subexpuesta.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-fotografia')} />
        <ShareCard appName="simulador-fotografia" />
      </main>

      <Footer appName="simulador-fotografia" />
    </div>
  );
}

interface EscenaSVGProps {
  escena: EscenaId;
  bokehBlur: number;
  noiseOpacity: number;
  motionBlur: number;
  overlayDark: number;
  overlayLight: number;
}

function EscenaSVG({
  escena,
  bokehBlur,
  noiseOpacity,
  motionBlur,
  overlayDark,
  overlayLight,
}: EscenaSVGProps) {
  const W = 480;
  const H = 320;

  return (
    <svg
      className={styles.escenaSvg}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Escena de ${escena} con efectos aplicados`}
    >
      <defs>
        <filter id="bokeh-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={bokehBlur} />
        </filter>
        <filter id="motion-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${motionBlur} 0`} />
        </filter>
        <filter id="noise-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0 0.5
                    0 0 0 0.6 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="bokeh-light-warm" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="bokeh-light-cool" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="60%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </radialGradient>
        <linearGradient id="cielo" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>

      {escena === 'retrato' && <EscenaRetrato W={W} H={H} />}
      {escena === 'paisaje' && <EscenaPaisaje W={W} H={H} />}
      {escena === 'deporte' && <EscenaDeporte W={W} H={H} />}

      {/* Overlay de exposición: oscuro o claro */}
      {overlayDark > 0 && (
        <rect x={0} y={0} width={W} height={H} fill="#000" opacity={overlayDark} pointerEvents="none" />
      )}
      {overlayLight > 0 && (
        <rect x={0} y={0} width={W} height={H} fill="#fff" opacity={overlayLight} pointerEvents="none" />
      )}

      {/* Overlay de ruido digital */}
      {noiseOpacity > 0 && (
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          filter="url(#noise-grain)"
          opacity={noiseOpacity}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}

function EscenaRetrato({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Fondo desenfocado: pared oscura + luces bokeh */}
      <g filter="url(#bokeh-blur)">
        <rect x={0} y={0} width={W} height={H} fill="#1f2937" />
        <circle cx={60} cy={70} r={28} fill="url(#bokeh-light-warm)" />
        <circle cx={140} cy={50} r={22} fill="url(#bokeh-light-warm)" />
        <circle cx={220} cy={90} r={32} fill="url(#bokeh-light-warm)" />
        <circle cx={350} cy={60} r={26} fill="url(#bokeh-light-warm)" />
        <circle cx={420} cy={120} r={30} fill="url(#bokeh-light-cool)" />
        <circle cx={80} cy={180} r={24} fill="url(#bokeh-light-warm)" />
        <circle cx={400} cy={220} r={28} fill="url(#bokeh-light-cool)" />
        <circle cx={300} cy={260} r={20} fill="url(#bokeh-light-warm)" />
      </g>

      {/* Sujeto: rostro en primer plano (siempre nítido) */}
      <g>
        {/* Hombros / cuello */}
        <path d={`M 140 ${H} L 180 230 L 300 230 L 340 ${H} Z`} fill="#475569" />
        {/* Cuello */}
        <rect x={215} y={210} width={50} height={30} fill="#fbbf24" />
        {/* Cabeza */}
        <ellipse cx={240} cy={170} rx={70} ry={80} fill="#fde68a" />
        {/* Pelo */}
        <path
          d="M 175 150 Q 175 90 240 88 Q 305 90 305 150 Q 305 130 290 125 Q 270 110 240 110 Q 210 110 195 130 Q 178 135 175 150 Z"
          fill="#78350f"
        />
        {/* Ojos */}
        <ellipse cx={215} cy={170} rx={6} ry={4} fill="#1f2937" />
        <ellipse cx={265} cy={170} rx={6} ry={4} fill="#1f2937" />
        {/* Cejas */}
        <path d="M 205 158 Q 215 154 225 158" stroke="#78350f" strokeWidth={2.5} fill="none" />
        <path d="M 255 158 Q 265 154 275 158" stroke="#78350f" strokeWidth={2.5} fill="none" />
        {/* Nariz */}
        <path d="M 240 178 L 236 198 L 244 198 Z" fill="#facc15" opacity={0.5} />
        {/* Boca */}
        <path d="M 225 215 Q 240 222 255 215" stroke="#9f1239" strokeWidth={2.5} fill="none" />
      </g>
    </>
  );
}

function EscenaPaisaje({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Cielo (no se desenfoca casi nada en paisaje, aplicamos blur muy sutil) */}
      <rect x={0} y={0} width={W} height={H} fill="url(#cielo)" />
      {/* Sol */}
      <circle cx={380} cy={70} r={28} fill="#fef9c3" />
      <circle cx={380} cy={70} r={20} fill="#fde047" />

      {/* Montañas lejanas (se desenfocan ligeramente con apertura abierta) */}
      <g filter="url(#bokeh-blur)" opacity={0.6}>
        <polygon points={`0,200 90,130 180,180 270,140 360,170 ${W},150 ${W},${H} 0,${H}`} fill="#94a3b8" />
      </g>

      {/* Montañas medias */}
      <polygon
        points={`0,230 70,170 150,210 220,160 290,200 360,170 ${W},220 ${W},${H} 0,${H}`}
        fill="#64748b"
      />

      {/* Montañas cercanas */}
      <polygon
        points={`0,260 60,210 130,250 200,200 280,240 350,210 ${W},250 ${W},${H} 0,${H}`}
        fill="#475569"
      />

      {/* Pradera primer plano */}
      <rect x={0} y={285} width={W} height={H - 285} fill="#65a30d" />

      {/* Árboles primer plano (siempre nítidos) */}
      <g>
        <rect x={75} y={265} width={8} height={30} fill="#78350f" />
        <ellipse cx={79} cy={258} rx={20} ry={22} fill="#15803d" />

        <rect x={310} y={270} width={8} height={28} fill="#78350f" />
        <ellipse cx={314} cy={262} rx={18} ry={20} fill="#16a34a" />
      </g>
    </>
  );
}

function EscenaDeporte({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Cielo */}
      <rect x={0} y={0} width={W} height={180} fill="#bae6fd" />
      {/* Pista */}
      <rect x={0} y={180} width={W} height={H - 180} fill="#a3a3a3" />
      {/* Líneas de pista */}
      <g opacity={0.4}>
        <line x1={0} y1={210} x2={W} y2={210} stroke="#fff" strokeWidth={2} />
        <line x1={0} y1={250} x2={W} y2={250} stroke="#fff" strokeWidth={2} />
        <line x1={0} y1={290} x2={W} y2={290} stroke="#fff" strokeWidth={2} />
      </g>

      {/* Fondo desenfocado: gradas con espectadores */}
      <g filter="url(#bokeh-blur)" opacity={0.7}>
        <rect x={0} y={50} width={W} height={130} fill="#475569" />
        <circle cx={50} cy={110} r={10} fill="#dc2626" />
        <circle cx={120} cy={100} r={10} fill="#2563eb" />
        <circle cx={200} cy={115} r={10} fill="#fbbf24" />
        <circle cx={280} cy={105} r={10} fill="#16a34a" />
        <circle cx={360} cy={120} r={10} fill="#dc2626" />
        <circle cx={430} cy={108} r={10} fill="#7c3aed" />
      </g>

      {/* Sujeto: corredor (motion blur aplicado al grupo) */}
      <g filter="url(#motion-blur)">
        {/* Cuerpo */}
        <ellipse cx={240} cy={245} rx={14} ry={28} fill="#1e3a8a" />
        {/* Cabeza */}
        <circle cx={240} cy={210} r={14} fill="#fde68a" />
        {/* Brazo delantero */}
        <line x1={240} y1={235} x2={270} y2={245} stroke="#fde68a" strokeWidth={8} strokeLinecap="round" />
        {/* Brazo trasero */}
        <line x1={240} y1={235} x2={210} y2={255} stroke="#fde68a" strokeWidth={8} strokeLinecap="round" />
        {/* Pierna delantera (en aire) */}
        <line x1={245} y1={272} x2={275} y2={290} stroke="#fde68a" strokeWidth={9} strokeLinecap="round" />
        {/* Pierna trasera (apoyo) */}
        <line x1={235} y1={272} x2={220} y2={300} stroke="#fde68a" strokeWidth={9} strokeLinecap="round" />
        {/* Calzado */}
        <ellipse cx={278} cy={293} rx={10} ry={5} fill="#dc2626" />
        <ellipse cx={218} cy={302} rx={10} ry={5} fill="#dc2626" />
      </g>
    </>
  );
}
