'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import styles from './SimuladorBalanceBlancos.module.css';
import { PREGUNTAS_FRECUENTES } from './metadata';

type EscenaId = 'tungsteno' | 'nublado' | 'atardecer';

interface EscenaConfig {
  id: EscenaId;
  nombre: string;
  emoji: string;
  tempLuzK: number; // temperatura real de la luz que ilumina la escena
  wbCorrectoK: number; // ajuste de WB que neutraliza esa luz
  descripcion: string;
}

const ESCENAS: EscenaConfig[] = [
  {
    id: 'tungsteno',
    nombre: 'Interior tungsteno',
    emoji: '💡',
    tempLuzK: 3200,
    wbCorrectoK: 3200,
    descripcion:
      'Habitación iluminada con bombillas incandescentes (~3200 K, luz muy cálida). El WB correcto está bajo en la escala Kelvin: si subes a 5500 K (luz día), la imagen se ve naranja fluorescente.',
  },
  {
    id: 'nublado',
    nombre: 'Día nublado',
    emoji: '☁️',
    tempLuzK: 6500,
    wbCorrectoK: 6500,
    descripcion:
      'Exterior con cielo cubierto (~6500 K, luz neutra-fría). El WB correcto está en la mitad de la escala. Si dejas el WB de tungsteno (3200 K), todo se ve muy azul.',
  },
  {
    id: 'atardecer',
    nombre: 'Atardecer',
    emoji: '🌅',
    tempLuzK: 3500,
    wbCorrectoK: 3500,
    descripcion:
      'Hora dorada al aire libre (~3500 K, luz naranja cálida natural). Aquí muchos fotógrafos suben el WB un poco por encima del valor "técnico" para preservar el tono cálido que da personalidad al atardecer.',
  },
];

const TEMP_MIN = 2500;
const TEMP_MAX = 10000;
const TEMP_STEP = 100;

const PRESETS_CAMARA = [
  { nombre: 'Tungsteno', kelvin: 3200, icono: '💡' },
  { nombre: 'Fluorescente', kelvin: 4000, icono: '🔆' },
  { nombre: 'Luz día', kelvin: 5500, icono: '☀️' },
  { nombre: 'Flash', kelvin: 5500, icono: '⚡' },
  { nombre: 'Nublado', kelvin: 6500, icono: '☁️' },
  { nombre: 'Sombra', kelvin: 7500, icono: '🌥️' },
];

interface OverlayColor {
  fill: string;
  opacity: number;
}

/**
 * Desvío del WB en MIREDS (10⁶ / K): la escala en la que un mismo salto se percibe igual, y por
 * eso los filtros de corrección CTO/CTB se gradúan en mireds. Positivo = WB por encima de la luz
 * → la cámara añade naranja; negativo → añade azul. Hasta el 07/11/2026 la app juzgaba la
 * diferencia en kelvin, y el mismo error pesaba unas 4 veces más con tungsteno que con luz
 * nublada (hallazgo 4162): 54 mired salían «Muy fuerte» en nublado y 87 «Suave» en tungsteno.
 */
function desvioMired(wbK: number, luzK: number): number {
  return 1e6 / luzK - 1e6 / wbK;
}

/**
 * UNA escala para la etiqueta, la intensidad y la recuperación (antes cortaban en sitios
 * distintos: «Demasiado cálido» junto a «Notable», hallazgo 4165). Cortes en mireds, a la medida
 * de los filtros de corrección habituales: un octavo de CTO/CTB ronda los 20, un cuarto los 40 y
 * medio los 80.
 */
const MIRED_NEUTRO = 20;
const MIRED_SUAVE = 40;
const MIRED_NOTABLE = 80;
const MIRED_JPEG = 160; // a partir de aquí, solo RAW y con esfuerzo
const MIRED_ESCALA = 160; // tope del velo y de la barra de desvío

type Nivel = 0 | 1 | 2 | 3;

function nivelDesvio(mired: number): Nivel {
  const abs = Math.abs(mired);
  if (abs <= MIRED_NEUTRO) return 0;
  if (abs <= MIRED_SUAVE) return 1;
  if (abs <= MIRED_NOTABLE) return 2;
  return 3;
}

function calcularOverlay(mired: number): OverlayColor {
  const factor = Math.max(-1, Math.min(1, mired / MIRED_ESCALA));
  if (Math.abs(mired) < 5) return { fill: 'transparent', opacity: 0 };
  if (factor > 0) {
    return { fill: '#fb923c', opacity: factor * 0.55 };
  }
  return { fill: '#3b82f6', opacity: -factor * 0.55 };
}

const ETIQUETAS_CALIDO = ['Balance correcto', 'Ligeramente cálido', 'Cálido (naranja)', 'Demasiado cálido (muy naranja)'];
const ETIQUETAS_FRIO = ['Balance correcto', 'Ligeramente frío', 'Frío (azul)', 'Demasiado frío (muy azul)'];
const CLASES_NIVEL = ['expOk', 'expWarn', 'expWarn', 'expBad'] as const;
const INTENSIDADES = ['Imperceptible', 'Suave', 'Notable', 'Muy fuerte'];

function clasificarBalance(mired: number): {
  icono: string;
  label: string;
  className: (typeof CLASES_NIVEL)[number];
} {
  const nivel = nivelDesvio(mired);
  return {
    icono: nivel === 0 ? '✅ ' : '',
    label: (mired > 0 ? ETIQUETAS_CALIDO : ETIQUETAS_FRIO)[nivel],
    className: CLASES_NIVEL[nivel],
  };
}

function recuperable(mired: number): string {
  const abs = Math.abs(mired);
  if (abs <= MIRED_NOTABLE) return 'Sí, fácilmente (sobre todo en RAW)';
  if (abs <= MIRED_JPEG) return 'En RAW sí; en JPEG con pérdida';
  return 'Solo en RAW y con esfuerzo';
}

export default function SimuladorBalanceBlancosPage() {
  const [escenaId, setEscenaId] = useState<EscenaId>('tungsteno');
  const escena = ESCENAS.find((e) => e.id === escenaId)!;

  const [tempWB, setTempWBRaw] = useState(escena.wbCorrectoK);

  const cambiarEscena = (id: EscenaId) => {
    const esc = ESCENAS.find((e) => e.id === id)!;
    setEscenaId(id);
    setTempWBRaw(esc.wbCorrectoK);
  };

  const deltaK = tempWB - escena.wbCorrectoK;
  const mired = desvioMired(tempWB, escena.tempLuzK);
  const nivel = nivelDesvio(mired);
  const overlay = useMemo(() => calcularOverlay(mired), [mired]);
  const balance = clasificarBalance(mired);

  // Posición del marcador "correcto" sobre el deslizador de kelvin
  const posCorrecto = ((escena.wbCorrectoK - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
  // Barra de desvío: el centro es el WB correcto, la izquierda el azul y la derecha el naranja.
  // Antes repetía el degradado de la LUZ con el marcador en el WB absoluto, y bajo el marcador
  // salía el color contrario al tinte de la foto (hallazgo 4166)
  const posDesvio = 50 + Math.max(-1, Math.min(1, mired / MIRED_ESCALA)) * 50;
  const miredTexto = `${mired > 0 ? '+' : mired < 0 ? '−' : ''}${formatNumber(Math.abs(mired), 0)} mired`;
  const sentidoDesvio = nivel === 0 ? 'sin dominante' : mired > 0 ? 'hacia el naranja' : 'hacia el azul';

  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const teclaPestana = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const ultimo = ESCENAS.length - 1;
    const destino =
      e.key === 'ArrowRight' ? (idx === ultimo ? 0 : idx + 1)
        : e.key === 'ArrowLeft' ? (idx === 0 ? ultimo : idx - 1)
          : e.key === 'Home' ? 0
            : e.key === 'End' ? ultimo
              : null;
    if (destino === null) return;
    e.preventDefault();
    cambiarEscena(ESCENAS[destino].id);
    pestanas.current[destino]?.focus();
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🌡️</span> Simulador de Balance de Blancos</h1>
        <p>
          Mueve la temperatura Kelvin sobre 3 escenas con luz distinta. Aprende cuándo aciertas el
          balance y cuándo la foto se va a naranja o azul.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.tabBar} role="tablist" aria-label="Selección de escena">
          {ESCENAS.map((esc, idx) => (
            <button
              type="button"
              key={esc.id}
              id={`pestana-${esc.id}`}
              ref={(el) => {
                pestanas.current[idx] = el;
              }}
              role="tab"
              aria-selected={escenaId === esc.id}
              aria-controls="panel-escena"
              tabIndex={escenaId === esc.id ? 0 : -1}
              className={`${styles.tabBtn} ${escenaId === esc.id ? styles.tabActive : ''}`}
              onClick={() => cambiarEscena(esc.id)}
              onKeyDown={(e) => teclaPestana(e, idx)}
            >
              <span aria-hidden="true">{esc.emoji}</span> {esc.nombre}
            </button>
          ))}
        </div>

        <div role="tabpanel" id="panel-escena" aria-labelledby={`pestana-${escena.id}`}>
        <div className={styles.escenaInfo}>
          <strong>
            <span aria-hidden="true">{escena.emoji}</span> {escena.nombre}:
          </strong>{' '}
          {escena.descripcion}
        </div>

        <div className={styles.controlsPanel}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Ajuste de balance de blancos</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="wb-slider">
                Temperatura de color (Kelvin)
                <span className={styles.valueBadge}>
                  {formatNumber(tempWB, 0)} K
                </span>
              </label>
              <div className={styles.sliderWrapper}>
                <div
                  className={styles.sliderTarget}
                  style={{ left: `${posCorrecto}%` }}
                  aria-hidden="true"
                  title="WB correcto"
                />
                <input
                  id="wb-slider"
                  type="range"
                  min={TEMP_MIN}
                  max={TEMP_MAX}
                  step={TEMP_STEP}
                  value={tempWB}
                  onChange={(e) => setTempWBRaw(parseInt(e.target.value))}
                  aria-valuemin={TEMP_MIN}
                  aria-valuemax={TEMP_MAX}
                  aria-valuenow={tempWB}
                  aria-valuetext={`${tempWB} Kelvin`}
                  className={styles.sliderKelvin}
                />
              </div>
              <div className={styles.scaleRow} aria-hidden="true">
                <span>2500</span>
                <span>4000</span>
                <span>5500</span>
                <span>7000</span>
                <span>8500</span>
                <span>10.000 K</span>
              </div>
              <span className={styles.unitLabel}>
                Bajo (2500 K) = cámara espera luz muy cálida (tungsteno). Alto (10.000 K) = cámara
                espera luz muy fría (sombra azul). Si te equivocas en la dirección contraria a la
                luz real, la imagen se tiñe.
              </span>
            </div>

            <div className={styles.presetsGroup}>
              <h3 className={styles.presetsTitle}>Presets de cámara</h3>
              <div className={styles.presetsGrid}>
                {PRESETS_CAMARA.map((p) => (
                  <button
                    type="button"
                    key={p.nombre}
                    className={`${styles.presetBtn} ${tempWB === p.kelvin ? styles.presetActive : ''}`}
                    onClick={() => setTempWBRaw(p.kelvin)}
                    title={`${p.kelvin} K`}
                    aria-pressed={tempWB === p.kelvin}
                  >
                    <span className={styles.presetIcon} aria-hidden="true">{p.icono}</span>
                    <span className={styles.presetNombre}>{p.nombre}</span>
                    <span className={styles.presetKelvin}>{formatNumber(p.kelvin, 0)} K</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className={styles.calcBtnGhost} onClick={() => setTempWBRaw(escena.wbCorrectoK)}>
              ↺ Volver al WB correcto ({formatNumber(escena.wbCorrectoK, 0)} K)
            </button>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado visual</h2>

            <EscenaSVG escena={escena.id} overlay={overlay} />

            <div className={styles.balanceMeter}>
              <p className={styles.balanceTitle}>
                Diferencia con el WB correcto: <span>{deltaK > 0 ? '+' : ''}</span>
                {formatNumber(deltaK, 0)} K
              </p>
              <p className={styles.balanceMired}>
                Desvío percibido: <span>{miredTexto}</span>
              </p>
              <div
                className={styles.balanceBar}
                role="img"
                aria-label={`Desvío del WB: ${miredTexto}, ${sentidoDesvio}`}
              >
                <div
                  className={styles.balanceMarker}
                  style={{ left: `${posDesvio}%` }}
                  aria-hidden="true"
                />
                <div className={styles.balanceTarget} style={{ left: '50%' }} aria-hidden="true" />
              </div>
              <div className={styles.balanceEscala} aria-hidden="true">
                <span>Más azul</span>
                <span>Correcto</span>
                <span>Más naranja</span>
              </div>
              <p className={`${styles.balanceLabel} ${styles[balance.className]}`} aria-live="polite">
                <span aria-hidden="true">{balance.icono}</span>
                <span>{balance.label}</span>
              </p>
            </div>

            <div className={styles.resultBlock} role="status" aria-live="polite">
              <h3 className={styles.resultTitle}>Lectura de la imagen</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Tinte dominante</span>
                <span className={styles.resultValue}>
                  {nivel === 0
                    ? 'Neutro (sin dominante)'
                    : mired > 0
                      ? 'Naranja / cálido'
                      : 'Azul / frío'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Intensidad del tinte</span>
                <span className={styles.resultValue}>{INTENSIDADES[nivel]}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Aspecto del blanco</span>
                <span className={styles.resultValue}>
                  {nivel === 0
                    ? 'Blanco neutro'
                    : mired > 0
                      ? 'Blanco amarillento'
                      : 'Blanco azulado'}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>¿Recuperable en edición?</span>
                <span className={styles.resultValue}>{recuperable(mired)}</span>
              </div>
            </div>

            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>mired = 1.000.000 / K</p>
              <p className={styles.formulaCaption}>
                El tinte se juzga en mireds y no en kelvin: el mismo salto de kelvin tiñe mucho más
                con luz cálida (de 3200 a 3900 K son 56 mired) que con luz fría (de 6500 a 10.000 K,
                54 mired). Por eso los filtros de corrección se gradúan en mireds.
              </p>
            </div>
          </div>
        </div>
        </div>

        <EducationalSection
          title="Guía completa del Balance de Blancos"
          subtitle="Por qué tus fotos salen naranjas o azules"
          icon="🌡️"
        >
          <h3 className={styles.eduSubtitle}>La idea en una frase</h3>
          <p className={styles.guideParagraph}>
            Toda fuente de luz tiene una <strong>temperatura de color</strong> medida en Kelvin (K).
            El ojo se adapta sin que te enteres; la cámara no. El <strong>balance de blancos</strong>{' '}
            es decirle a la cámara cuál es la temperatura de la luz para que reste el tinte y los
            blancos salgan blancos.
          </p>
          <p className={styles.guideParagraph}>
            Si te equivocas, los blancos salen amarillos (WB demasiado alto) o azules (WB demasiado
            bajo). Por eso las fotos de interior con bombillas suelen salir tan naranjas: la cámara
            estaba en modo &quot;luz día&quot; y tú estabas con tungsteno.
          </p>

          <h3 className={styles.eduSubtitle}>Tabla de presets de cámara y su luz</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Preset</th>
                  <th>Kelvin</th>
                  <th>Fuente típica</th>
                  <th>Cuándo usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Vela</td>
                  <td>~1900 K</td>
                  <td>Llama, fuego</td>
                  <td>Foto íntima al fuego — a veces dejar el tinte cálido es lo bonito</td>
                </tr>
                <tr>
                  <td>Tungsteno</td>
                  <td>~3200 K</td>
                  <td>Bombillas incandescentes, halógenas</td>
                  <td>Interiores antiguos, escenarios teatrales, hoteles cálidos</td>
                </tr>
                <tr>
                  <td>Fluorescente</td>
                  <td>~4000 K</td>
                  <td>Tubos fluorescentes (oficinas, comercios)</td>
                  <td>Oficinas, aulas, tiendas con luz fría blanca</td>
                </tr>
                <tr>
                  <td>Luz día</td>
                  <td>~5500 K</td>
                  <td>Sol directo al mediodía, flash electrónico</td>
                  <td>Exterior soleado, foto con flash</td>
                </tr>
                <tr>
                  <td>Nublado</td>
                  <td>~6500 K</td>
                  <td>Cielo cubierto, sombra suave</td>
                  <td>Días grises, exteriores con cielo plomizo</td>
                </tr>
                <tr>
                  <td>Sombra</td>
                  <td>~7500 K</td>
                  <td>Sombras profundas al aire libre</td>
                  <td>Sujeto a la sombra de un edificio en día soleado</td>
                </tr>
                <tr>
                  <td>Cielo azul</td>
                  <td>~10.000 K</td>
                  <td>Cielo despejado de alta montaña</td>
                  <td>Paisaje invernal a 3000 m, fotografía polar</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>RAW vs JPEG: por qué importa</h3>
          <p className={styles.guideParagraph}>
            En <strong>JPEG</strong> el balance se aplica al disparar y queda fijado en la imagen.
            Recuperar un mal WB en JPEG genera pérdida de calidad y artefactos.
          </p>
          <p className={styles.guideParagraph}>
            En <strong>RAW</strong> la información del sensor se guarda sin procesar: el balance es
            solo una etiqueta. Puedes cambiarlo a 6500 K o 3200 K en posproducción sin penalización,
            como si lo hubieras configurado bien al disparar.
          </p>
          <p className={styles.guideParagraph}>
            <strong>Conclusión:</strong> si dudas del WB, dispara en RAW y arréglalo después. Es la
            ventaja más infravalorada del formato.
          </p>

          <h3 className={styles.eduSubtitle}>Conceptos clave que confunden</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>El número Kelvin va al revés del color</h4>
              <p>
                Kelvin bajo (2500-3500) = luz roja/naranja cálida (una vela, una bombilla). Kelvin
                alto (6500-10.000) = luz azul fría (cielo, sombra). Es la escala física, pero
                visualmente parece &quot;el revés&quot;.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>El WB no compensa, predice</h4>
              <p>
                Ajustar el WB a 3200 K significa &quot;voy a fotografiar luz de 3200 K&quot;. La
                cámara entonces resta esa cantidad de naranja para que el blanco salga blanco. Si
                te equivocas, suma o resta tinte.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Auto WB falla en luces puras</h4>
              <p>
                El AWB busca un &quot;punto gris&quot; en la escena. Si toda la escena es de un
                solo color (atardecer rojo, luz neón verde), la cámara intenta neutralizarlo y
                mata el ambiente. Para escenas dominantes, manual o preset.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Tinte verde-magenta (eje M/G)</h4>
              <p>
                Algunas luces (fluorescente, LED) tienen un tinte verde residual que ningún Kelvin
                corrige. Las cámaras avanzadas tienen un segundo eje M/G (magenta-green) para
                compensarlo. Aquí simplificamos.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <strong>{f.question}</strong>
                <p>{f.answer}</p>
                {f.consejo && (
                  <p className={styles.faqTip}>
                    <span aria-hidden="true">💡</span>{' '}
                    {f.enlace ? (
                      <span>
                        {f.consejo.split(f.enlace.texto)[0]}
                        <a href={f.enlace.href}>{f.enlace.texto}</a>
                        {f.consejo.split(f.enlace.texto)[1]}
                      </span>
                    ) : (
                      <span>{f.consejo}</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          <h3 className={styles.eduSubtitle}>Cómo elegir el balance en cada situación</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la fuente principal de luz</strong>
                <p>
                  ¿Es luz natural (sol, nubes, hora dorada)? ¿Artificial (bombillas, fluorescente,
                  LED)? ¿Mixta? Si es mixta, decide cuál es la dominante.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Elige el preset de tu cámara</strong>
                <p>
                  Tungsteno para bombillas, Fluorescente para tubos blancos, Luz día para sol,
                  Nublado para cielos grises. Es más fiable que el AWB en condiciones puras.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Si dudas, dispara en RAW</strong>
                <p>
                  RAW permite cambiar el WB en posproducción sin pérdida. Un mal WB en JPEG es
                  difícil de corregir; en RAW, un slider lo arregla.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Comprueba los tonos de piel y los blancos</strong>
                <p>
                  Mira en el LCD: ¿la camisa blanca se ve blanca? ¿La piel tiene tono natural? Si
                  hay tinte, ajusta antes de seguir disparando.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Decide si quieres el ambiente o la neutralidad</strong>
                <p>
                  Atardecer: ¿quieres el naranja icónico o lo neutralizas? Cena romántica con
                  vela: ¿foto cálida o foto técnica? El WB es una herramienta creativa, no solo
                  técnica.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Dispara en RAW siempre que puedas</strong>
                <p>Es la ventaja más importante en color. Cambia el WB en edición sin penalización.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Usa presets en luces puras</strong>
                <p>Tungsteno, fluorescente, sol: presets ganan al AWB en condiciones de un único color dominante.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⬜</span>
              <div>
                <strong>Tarjeta gris para sesiones largas</strong>
                <p>Un disparo con tarjeta al inicio te da una referencia para corregir toda la serie en edición.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌅</span>
              <div>
                <strong>El atardecer no se neutraliza</strong>
                <p>El tinte cálido es parte del encanto. Si se va de las manos, baja el WB hacia la temperatura de la luz (unos 3500 K): subirlo añade todavía más naranja.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Observa el histograma de color</strong>
                <p>Si el canal rojo va al extremo, hay dominante cálido. Si es el azul, frío. Ayuda a diagnosticar el WB.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Combínalo con el triángulo de exposición</strong>
                <p>
                  El WB no opera solo. Prueba el{' '}
                  <a href="/simulador-fotografia/">simulador de exposición</a> y el{' '}
                  <a href="/visualizador-focales-fotografia/">visualizador de focales</a> para ver
                  los tres pilares de la fotografía juntos.
                </p>
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
                Dejar el AWB en escenas con un color dominante: la cámara intenta neutralizarlo y
                arruina la atmósfera (atardecer apagado, fuego sin calidez).
              </li>
              <li>
                Pasar de tungsteno a exterior sin cambiar el WB: salir a la calle con preset
                Tungsteno (3200 K) tiñe todo de azul intenso.
              </li>
              <li>
                Disparar en JPEG con WB equivocado y descubrirlo en casa: la corrección masiva en
                JPEG genera tonos antinaturales y bandeo.
              </li>
              <li>
                Confiar en el LCD de la cámara para juzgar el WB: el brillo del entorno y el ángulo
                de visión engañan. Usa el histograma o revisa en un monitor calibrado.
              </li>
              <li>
                Olvidar el tinte verde-magenta cuando hay fluorescente o LED. Un Kelvin perfecto
                puede seguir dando un tinte residual; ajusta el segundo eje M/G si tu cámara lo
                permite.
              </li>
              <li>
                Pensar que &quot;balance correcto&quot; es siempre mejor. La fotografía es arte:
                muchas imágenes icónicas están en frío azulado o cálido naranja a propósito.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-balance-blancos" />
      </main>

      <Footer appName="simulador-balance-blancos" />
    </div>
  );
}

interface EscenaSVGProps {
  escena: EscenaId;
  overlay: OverlayColor;
}

function EscenaSVG({ escena, overlay }: EscenaSVGProps) {
  const W = 480;
  const H = 320;

  return (
    <svg
      className={styles.escenaSvg}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Escena de ${escena} con ajuste de balance de blancos`}
    >
      <defs>
        <linearGradient id="cieloNublado" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
        <linearGradient id="cieloAtardecer" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="70%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <radialGradient id="halBombilla" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="60%" stopColor="#fde047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
      </defs>

      {escena === 'tungsteno' && <EscenaTungsteno W={W} H={H} />}
      {escena === 'nublado' && <EscenaNublado W={W} H={H} />}
      {escena === 'atardecer' && <EscenaAtardecer W={W} H={H} />}

      {/* Overlay de balance: tinte cálido o frío según el delta */}
      {overlay.opacity > 0 && (
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill={overlay.fill}
          opacity={overlay.opacity}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}

function EscenaTungsteno({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Pared de fondo */}
      <rect x={0} y={0} width={W} height={H * 0.75} fill="#e7d5b9" />
      {/* Suelo de madera */}
      <rect x={0} y={H * 0.75} width={W} height={H * 0.25} fill="#92400e" />
      <line x1={0} y1={H * 0.85} x2={W} y2={H * 0.85} stroke="#78350f" strokeWidth={1} opacity={0.4} />
      <line x1={0} y1={H * 0.92} x2={W} y2={H * 0.92} stroke="#78350f" strokeWidth={1} opacity={0.4} />

      {/* Halo de la bombilla (queda iluminado más fuerte) */}
      <circle cx={W * 0.5} cy={H * 0.18} r={90} fill="url(#halBombilla)" />

      {/* Lámpara de techo */}
      <rect x={W * 0.485} y={0} width={6} height={H * 0.12} fill="#1f2937" />
      <path
        d={`M ${W * 0.42} ${H * 0.12} L ${W * 0.58} ${H * 0.12} L ${W * 0.55} ${H * 0.22} L ${W * 0.45} ${H * 0.22} Z`}
        fill="#475569"
      />
      <circle cx={W * 0.5} cy={H * 0.22} r={8} fill="#fef3c7" />

      {/* Estantería derecha */}
      <rect x={W * 0.7} y={H * 0.25} width={W * 0.25} height={H * 0.5} fill="#a16207" />
      <rect x={W * 0.7} y={H * 0.4} width={W * 0.25} height={3} fill="#78350f" />
      <rect x={W * 0.7} y={H * 0.55} width={W * 0.25} height={3} fill="#78350f" />
      {/* Libros */}
      <rect x={W * 0.72} y={H * 0.27} width={8} height={H * 0.12} fill="#dc2626" />
      <rect x={W * 0.74} y={H * 0.27} width={8} height={H * 0.12} fill="#1e40af" />
      <rect x={W * 0.76} y={H * 0.29} width={8} height={H * 0.1} fill="#15803d" />
      <rect x={W * 0.78} y={H * 0.27} width={8} height={H * 0.12} fill="#7c2d12" />
      <rect x={W * 0.8} y={H * 0.28} width={8} height={H * 0.11} fill="#a16207" />
      <rect x={W * 0.82} y={H * 0.27} width={8} height={H * 0.12} fill="#1f2937" />

      <rect x={W * 0.72} y={H * 0.42} width={8} height={H * 0.12} fill="#7c2d12" />
      <rect x={W * 0.74} y={H * 0.42} width={8} height={H * 0.12} fill="#1e40af" />
      <rect x={W * 0.76} y={H * 0.43} width={8} height={H * 0.11} fill="#dc2626" />
      <rect x={W * 0.78} y={H * 0.42} width={8} height={H * 0.12} fill="#15803d" />

      {/* Mesa */}
      <rect x={W * 0.1} y={H * 0.65} width={W * 0.4} height={6} fill="#78350f" />
      <rect x={W * 0.12} y={H * 0.65} width={4} height={H * 0.1} fill="#451a03" />
      <rect x={W * 0.46} y={H * 0.65} width={4} height={H * 0.1} fill="#451a03" />

      {/* Taza humeante sobre la mesa */}
      <rect x={W * 0.18} y={H * 0.58} width={28} height={20} fill="#f8fafc" rx={2} />
      <ellipse cx={W * 0.18 + 14} cy={H * 0.58} rx={14} ry={3} fill="#92400e" />
      <path
        d={`M ${W * 0.21} ${H * 0.55} Q ${W * 0.22} ${H * 0.5} ${W * 0.215} ${H * 0.48}`}
        stroke="#e5e7eb"
        strokeWidth={2}
        fill="none"
        opacity={0.7}
      />

      {/* Libro abierto */}
      <rect x={W * 0.3} y={H * 0.62} width={36} height={4} fill="#1e3a8a" />
      <rect x={W * 0.32} y={H * 0.58} width={32} height={6} fill="#f8fafc" />

      {/* Tarjeta blanca de referencia (para que sea fácil ver el tinte) */}
      <rect x={W * 0.55} y={H * 0.6} width={40} height={24} fill="#ffffff" stroke="#9ca3af" strokeWidth={1} />
    </>
  );
}

function EscenaNublado({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Cielo nublado */}
      <rect x={0} y={0} width={W} height={H * 0.55} fill="url(#cieloNublado)" />
      {/* Nubes */}
      <ellipse cx={W * 0.2} cy={H * 0.2} rx={50} ry={15} fill="#f1f5f9" opacity={0.8} />
      <ellipse cx={W * 0.55} cy={H * 0.15} rx={60} ry={18} fill="#f1f5f9" opacity={0.7} />
      <ellipse cx={W * 0.85} cy={H * 0.22} rx={45} ry={14} fill="#f1f5f9" opacity={0.75} />

      {/* Suelo: hierba */}
      <rect x={0} y={H * 0.55} width={W} height={H * 0.45} fill="#65a30d" />
      {/* Sendero */}
      <path
        d={`M ${W * 0.4} ${H * 0.6} L ${W * 0.45} ${H} L ${W * 0.65} ${H} L ${W * 0.55} ${H * 0.6} Z`}
        fill="#a16207"
      />

      {/* Árboles de fondo */}
      <g opacity={0.7}>
        <rect x={W * 0.1} y={H * 0.4} width={6} height={H * 0.2} fill="#451a03" />
        <ellipse cx={W * 0.115} cy={H * 0.36} rx={25} ry={28} fill="#166534" />

        <rect x={W * 0.78} y={H * 0.42} width={6} height={H * 0.18} fill="#451a03" />
        <ellipse cx={W * 0.795} cy={H * 0.38} rx={22} ry={25} fill="#15803d" />
      </g>

      {/* Banco de parque */}
      <rect x={W * 0.65} y={H * 0.65} width={W * 0.25} height={8} fill="#78350f" />
      <rect x={W * 0.67} y={H * 0.65} width={4} height={H * 0.15} fill="#451a03" />
      <rect x={W * 0.85} y={H * 0.65} width={4} height={H * 0.15} fill="#451a03" />
      <rect x={W * 0.66} y={H * 0.58} width={W * 0.23} height={4} fill="#78350f" />
      <rect x={W * 0.66} y={H * 0.61} width={W * 0.23} height={3} fill="#78350f" />

      {/* Persona caminando por el sendero */}
      <g>
        {/* Cuerpo */}
        <rect x={W * 0.45} y={H * 0.55} width={16} height={26} fill="#475569" />
        {/* Cabeza */}
        <circle cx={W * 0.458} cy={H * 0.52} r={9} fill="#fde68a" />
        {/* Pelo */}
        <ellipse cx={W * 0.458} cy={H * 0.5} rx={9} ry={5} fill="#1f2937" />
        {/* Piernas */}
        <rect x={W * 0.45} y={H * 0.63} width={6} height={H * 0.1} fill="#1f2937" />
        <rect x={W * 0.456} y={H * 0.63} width={6} height={H * 0.1} fill="#1f2937" />
      </g>

      {/* Tarjeta blanca de referencia */}
      <rect x={W * 0.1} y={H * 0.78} width={50} height={28} fill="#ffffff" stroke="#9ca3af" strokeWidth={1} />
    </>
  );
}

function EscenaAtardecer({ W, H }: { W: number; H: number }) {
  return (
    <>
      {/* Cielo atardecer */}
      <rect x={0} y={0} width={W} height={H * 0.6} fill="url(#cieloAtardecer)" />
      {/* Sol bajo */}
      <circle cx={W * 0.5} cy={H * 0.5} r={32} fill="#fef3c7" opacity={0.95} />
      <circle cx={W * 0.5} cy={H * 0.5} r={20} fill="#fef9c3" />

      {/* Reflejo del sol en el lago */}
      <rect x={0} y={H * 0.6} width={W} height={H * 0.4} fill="#1e3a8a" />
      <ellipse cx={W * 0.5} cy={H * 0.65} rx={45} ry={8} fill="#fde68a" opacity={0.7} />
      <ellipse cx={W * 0.5} cy={H * 0.75} rx={30} ry={5} fill="#fbbf24" opacity={0.4} />
      {/* Ondas en el agua */}
      <line x1={W * 0.1} y1={H * 0.72} x2={W * 0.35} y2={H * 0.72} stroke="#1e40af" strokeWidth={1.5} opacity={0.5} />
      <line x1={W * 0.65} y1={H * 0.74} x2={W * 0.9} y2={H * 0.74} stroke="#1e40af" strokeWidth={1.5} opacity={0.5} />
      <line x1={W * 0.2} y1={H * 0.82} x2={W * 0.45} y2={H * 0.82} stroke="#1e40af" strokeWidth={1.5} opacity={0.5} />
      <line x1={W * 0.6} y1={H * 0.85} x2={W * 0.85} y2={H * 0.85} stroke="#1e40af" strokeWidth={1.5} opacity={0.5} />

      {/* Cordillera lejana en silueta */}
      <polygon
        points={`0,${H * 0.55} ${W * 0.15},${H * 0.4} ${W * 0.3},${H * 0.5} ${W * 0.45},${H * 0.35} ${W * 0.6},${H * 0.48} ${W * 0.75},${H * 0.38} ${W * 0.9},${H * 0.46} ${W},${H * 0.5} ${W},${H * 0.6} 0,${H * 0.6}`}
        fill="#1e293b"
        opacity={0.85}
      />

      {/* Silueta de árbol primer plano izquierdo */}
      <rect x={W * 0.08} y={H * 0.55} width={4} height={H * 0.08} fill="#0f172a" />
      <ellipse cx={W * 0.094} cy={H * 0.53} rx={18} ry={22} fill="#0f172a" />

      {/* Silueta de barca */}
      <ellipse cx={W * 0.75} cy={H * 0.78} rx={20} ry={4} fill="#0f172a" />
      <line x1={W * 0.75} y1={H * 0.78} x2={W * 0.75} y2={H * 0.7} stroke="#0f172a" strokeWidth={2} />

      {/* Tarjeta blanca de referencia */}
      <rect x={W * 0.05} y={H * 0.85} width={50} height={28} fill="#ffffff" stroke="#9ca3af" strokeWidth={1} />
    </>
  );
}
