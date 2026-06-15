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
import styles from './CalculadoraProfundidadCampo.module.css';

interface SensorConfig {
  id: string;
  nombre: string;
  coc: number; // círculo de confusión en mm
  factor: number;
}

const SENSORES: SensorConfig[] = [
  { id: 'ff', nombre: 'Full Frame', coc: 0.03, factor: 1.0 },
  { id: 'apsc15', nombre: 'APS-C Nikon/Sony (×1,5)', coc: 0.02, factor: 1.5 },
  { id: 'apsc16', nombre: 'APS-C Canon (×1,6)', coc: 0.019, factor: 1.6 },
  { id: 'm43', nombre: 'Micro 4/3 (×2,0)', coc: 0.015, factor: 2.0 },
];

const APERTURAS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22] as const;

const FOCALES_RAPIDAS = [14, 24, 35, 50, 85, 135, 200, 300] as const;

interface Preset {
  id: string;
  nombre: string;
  emoji: string;
  focal: number;
  apertura: number;
  distancia: number;
  descripcion: string;
}

const PRESETS: Preset[] = [
  {
    id: 'retrato',
    nombre: 'Retrato con bokeh',
    emoji: '👤',
    focal: 85,
    apertura: 2.8,
    distancia: 2.5,
    descripcion: 'Tele corto + apertura amplia = fondo cremoso',
  },
  {
    id: 'paisaje',
    nombre: 'Paisaje todo nítido',
    emoji: '🏔️',
    focal: 24,
    apertura: 11,
    distancia: 5,
    descripcion: 'Gran angular + apertura cerrada = máxima nitidez',
  },
  {
    id: 'macro',
    nombre: 'Macro / Primer plano',
    emoji: '🌸',
    focal: 100,
    apertura: 8,
    distancia: 0.4,
    descripcion: 'Distancia mínima de enfoque, DoF muy reducida',
  },
  {
    id: 'hiperfocal',
    nombre: 'Hiperfocal paisaje',
    emoji: '🎯',
    focal: 24,
    apertura: 8,
    distancia: 3,
    descripcion: 'Truco para que todo desde 1,5m hasta el infinito quede nítido',
  },
  {
    id: 'astrofoto',
    nombre: 'Astrofotografía',
    emoji: '🌌',
    focal: 14,
    apertura: 2.8,
    distancia: 30,
    descripcion: 'Ultra gran angular + apertura máxima para Vía Láctea',
  },
];

interface ResultadoDoF {
  hiperfocalM: number;
  dnM: number;
  dfM: number;
  dofM: number;
  dfEsInfinito: boolean;
}

function calcularDoF(
  focalMM: number,
  apertura: number,
  distanciaM: number,
  cocMM: number,
): ResultadoDoF {
  const f = focalMM;
  const N = apertura;
  const c = cocMM;
  const sMM = distanciaM * 1000; // distancia en mm

  // Hiperfocal en mm
  const H = (f * f) / (N * c) + f;
  const hiperfocalM = H / 1000;

  const dfEsInfinito = sMM >= H;

  let dnMM: number;
  let dfMM: number;

  if (dfEsInfinito) {
    // Si el sujeto está en o más allá de la hiperfocal, Df = ∞
    dnMM = (H * sMM) / (H + (sMM - f));
    dfMM = Infinity;
  } else {
    dnMM = (H * sMM) / (H + (sMM - f));
    dfMM = (H * sMM) / (H - (sMM - f));
  }

  return {
    hiperfocalM,
    dnM: dnMM / 1000,
    dfM: dfMM / 1000,
    dofM: dfEsInfinito ? Infinity : (dfMM - dnMM) / 1000,
    dfEsInfinito,
  };
}

function formatDistancia(m: number): string {
  if (!isFinite(m)) return '∞';
  if (m < 1) return `${formatNumber(m * 100, 0)} cm`;
  if (m < 10) return `${formatNumber(m, 2)} m`;
  if (m < 100) return `${formatNumber(m, 1)} m`;
  return `${formatNumber(m, 0)} m`;
}

export default function CalculadoraProfundidadCampoPage() {
  const [focal, setFocal] = useState(50);
  const [aperturaIdx, setAperturaIdx] = useState(4); // f/5,6
  const [distancia, setDistancia] = useState(3);
  const [sensorId, setSensorId] = useState('ff');

  const sensor = SENSORES.find((s) => s.id === sensorId)!;
  const apertura = APERTURAS[aperturaIdx];

  const resultado = useMemo(
    () => calcularDoF(focal, apertura, distancia, sensor.coc),
    [focal, apertura, distancia, sensor.coc],
  );

  const aplicarPreset = (p: Preset) => {
    setFocal(p.focal);
    setDistancia(p.distancia);
    const idx = APERTURAS.findIndex((a) => a === p.apertura);
    if (idx >= 0) setAperturaIdx(idx);
  };

  // Clasificación cualitativa de la DoF
  const dofTipo = useMemo(() => {
    if (resultado.dfEsInfinito) return { label: 'Profundidad infinita', cls: 'expOk' };
    if (resultado.dofM < 0.05) return { label: 'Muy reducida (macro)', cls: 'expBad' };
    if (resultado.dofM < 0.3) return { label: 'Reducida (bokeh notable)', cls: 'expWarn' };
    if (resultado.dofM < 1.5) return { label: 'Media', cls: 'expOk' };
    if (resultado.dofM < 5) return { label: 'Amplia', cls: 'expOk' };
    return { label: 'Muy amplia', cls: 'expOk' };
  }, [resultado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🎯</span> Calculadora de Profundidad de Campo</h1>
        <p>
          Calcula DoF, hiperfocal y zona de nitidez aceptable a partir de focal, apertura,
          distancia y sensor. Visualización en regla para ver dónde empieza y acaba lo nítido.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.presetsBar}>
          <span className={styles.presetsLabel}>Empieza con un preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.presetChip}
              onClick={() => aplicarPreset(p)}
              title={p.descripcion}
            >
              <span aria-hidden="true">{p.emoji}</span> {p.nombre}
            </button>
          ))}
        </div>

        <div className={styles.controlsPanel}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="sensor-select">Sensor</label>
              <select
                id="sensor-select"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                className={styles.selectInput}
              >
                {SENSORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} (CoC {formatNumber(s.coc, 3)} mm)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="focal-input">
                Focal (mm)
                <span className={styles.valueBadge}>
                  {focal} mm
                  {sensor.factor !== 1 && (
                    <small> · eq. {formatNumber(focal * sensor.factor, 0)} mm FF</small>
                  )}
                </span>
              </label>
              <input
                id="focal-input"
                type="range"
                min={10}
                max={400}
                step={1}
                value={focal}
                onChange={(e) => setFocal(parseInt(e.target.value))}
                aria-valuetext={`${focal} milímetros`}
              />
              <div className={styles.chipsRow}>
                {FOCALES_RAPIDAS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`${styles.focalChip} ${focal === f ? styles.chipActive : ''}`}
                    onClick={() => setFocal(f)}
                    aria-pressed={focal === f}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>
                Apertura (f-stop)
                <span className={styles.valueBadge}>f/{formatNumber(apertura, apertura < 10 && apertura % 1 !== 0 ? 1 : 0)}</span>
              </label>
              <div className={styles.aperturaGrid}>
                {APERTURAS.map((a, idx) => (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.aperturaBtn} ${aperturaIdx === idx ? styles.aperturaActive : ''}`}
                    onClick={() => setAperturaIdx(idx)}
                    aria-pressed={aperturaIdx === idx}
                  >
                    f/{formatNumber(a, a < 10 && a % 1 !== 0 ? 1 : 0)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="distancia-input">
                Distancia al sujeto (m)
                <span className={styles.valueBadge}>{formatDistancia(distancia)}</span>
              </label>
              <input
                id="distancia-input"
                type="range"
                min={0.3}
                max={50}
                step={0.1}
                value={distancia}
                onChange={(e) => setDistancia(parseFloat(e.target.value))}
                aria-valuetext={`${distancia} metros`}
              />
              <span className={styles.unitLabel}>
                Cuanto más cerca enfoques, menos profundidad de campo tendrás (a igual focal y
                apertura). Por eso el macro es tan exigente.
              </span>
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>

            <ReglaSVG
              dnM={resultado.dnM}
              dfM={resultado.dfM}
              distanciaM={distancia}
              hiperfocalM={resultado.hiperfocalM}
              dfEsInfinito={resultado.dfEsInfinito}
            />

            <div className={styles.resultBlock} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.resultRowBig}>
                <span className={styles.resultLabelBig}>Profundidad de campo total</span>
                <span className={styles.resultValueBig}>
                  {resultado.dfEsInfinito ? '∞ (a partir de Dn)' : formatDistancia(resultado.dofM)}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Cerca enfocada (Dn)</span>
                <span className={styles.resultValue}>{formatDistancia(resultado.dnM)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Lejos enfocada (Df)</span>
                <span className={styles.resultValue}>{formatDistancia(resultado.dfM)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Distancia hiperfocal</span>
                <span className={styles.resultValue}>{formatDistancia(resultado.hiperfocalM)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Tipo de DoF</span>
                <span className={`${styles.resultValue} ${styles[dofTipo.cls]}`}>{dofTipo.label}</span>
              </div>
            </div>

            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>
                H = f² / (N · c) + f &nbsp;·&nbsp; DoF = Df − Dn
              </p>
              <p className={styles.formulaCaption}>
                f = focal, N = apertura, c = círculo de confusión del sensor
              </p>
            </div>
          </div>
        </div>

        <EducationalSection
          title="Guía de Profundidad de Campo"
          subtitle="Qué controla qué hay nítido y qué no"
          icon="🎯"
        >
          <h3 className={styles.eduSubtitle}>Los 4 factores que controlan la DoF</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Aumenta DoF cuando…</th>
                  <th>Reduce DoF cuando…</th>
                  <th>Magnitud del efecto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Apertura (f-stop)</td>
                  <td>Cierras (f/11, f/16)</td>
                  <td>Abres (f/1,4, f/2,8)</td>
                  <td>Muy alto (lineal en f-number²)</td>
                </tr>
                <tr>
                  <td>Distancia al sujeto</td>
                  <td>Te alejas</td>
                  <td>Te acercas</td>
                  <td>Muy alto (cuadrática)</td>
                </tr>
                <tr>
                  <td>Focal</td>
                  <td>Usas gran angular (24 mm)</td>
                  <td>Usas tele (200 mm)</td>
                  <td>Alto, pero matizado por encuadre</td>
                </tr>
                <tr>
                  <td>Tamaño de sensor</td>
                  <td>Es más pequeño (M4/3, APS-C)</td>
                  <td>Es más grande (FF, formato medio)</td>
                  <td>Medio (vía CoC)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>¿Qué es el círculo de confusión (CoC)?</h3>
          <p className={styles.guideParagraph}>
            El <strong>círculo de confusión</strong> es el tamaño máximo que puede tener un punto
            ligeramente desenfocado en el sensor para que el ojo humano aún lo perciba como nítido
            al ver la foto al tamaño de impresión típico. Para FF se asume ~0,030 mm; para sensores
            más pequeños, valores menores porque cualquier desenfoque se amplía más al recortar.
          </p>
          <p className={styles.guideParagraph}>
            Por eso un sensor pequeño da más DoF aparente para la misma escena: el CoC tolerable es
            menor, pero como necesitas focales más cortas para encuadrar igual, el balance neto es
            más profundidad de campo en igualdad de encuadre.
          </p>

          <h3 className={styles.eduSubtitle}>La distancia hiperfocal explicada</h3>
          <p className={styles.guideParagraph}>
            La <strong>distancia hiperfocal (H)</strong> es la distancia a la que enfocas para que
            todo desde <strong>H/2</strong> hasta el infinito quede nítido. Es el truco clásico del
            paisajismo: maximiza el rango de nitidez posible con cualquier combinación de focal y
            apertura.
          </p>
          <p className={styles.guideParagraph}>
            <strong>Ejemplo:</strong> con 24 mm a f/11 en FF, la hiperfocal es ~1,7 m. Si enfocas a
            esa distancia, todo desde ~0,85 m hasta el infinito sale nítido. Es la base del paisaje
            tradicional.
          </p>
          <p className={styles.guideParagraph}>
            <strong>Atajo de campo:</strong> si no quieres hacer la cuenta, enfoca a 1/3 del
            encuadre desde la base de la foto. Funciona razonablemente bien con gran angulares y
            aperturas cerradas.
          </p>

          <h3 className={styles.eduSubtitle}>Casos típicos resueltos</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">👤</span> Retrato con bokeh — 85 mm f/2,8 a 2,5 m</h4>
              <p>
                Hiperfocal ~85 m; DoF ~25 cm. Solo la cara queda nítida y el fondo se funde. Si
                bajas a f/1,4, la DoF puede ser de solo 6-8 cm: un ojo nítido y el otro no.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🏔️</span> Paisaje todo nítido — 24 mm f/11 a 5 m</h4>
              <p>
                Hiperfocal ~1,8 m; el sujeto (5 m) está más allá → Df infinito y Dn ~1,3 m. Todo
                desde 1,3 m hasta el horizonte queda nítido. Trípode imprescindible si la luz es
                baja.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🌸</span> Macro — 100 mm f/8 a 40 cm</h4>
              <p>
                DoF de apenas 4-5 mm. Para una flor entera o un insecto entero, tendrás que cerrar
                a f/16 o f/22 (con difracción) o usar focus stacking (varias tomas combinadas en
                edición).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🌌</span> Astrofoto — 14 mm f/2,8 a infinito</h4>
              <p>
                Enfoque manual al infinito. La DoF abarca desde muy cerca hasta ∞. El reto no es la
                DoF, sino la regla 500 (tiempo máximo sin estela) y la luz baja: ISO 3200-6400
                típicos.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué el bokeh es más fuerte con tele que con gran angular?</strong>
              <p>
                A igual encuadre (mismo tamaño del sujeto en el cuadro), el tele te obliga a estar
                más lejos del sujeto y los elementos del fondo están más cerca relativamente.
                Combina eso con menor DoF intrínseca del tele y obtienes el clásico fondo cremoso.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Por eso un 85 mm f/2,8 da más bokeh que un 35 mm f/1,4 para el mismo retrato.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la difracción y por qué importa?</strong>
              <p>
                A aperturas muy cerradas (f/16, f/22 en FF; f/11 en M4/3), la luz se difracta en el
                diafragma y la imagen pierde nitidez globalmente, aunque la DoF aumente. El
                &quot;sweet spot&quot; de la mayoría de objetivos está entre f/5,6 y f/11.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Es cierto que los sensores pequeños siempre dan más DoF?</strong>
              <p>
                Sí <em>en igualdad de encuadre</em>. Un 25 mm a f/2,8 en M4/3 (equivale a 50 mm FF)
                da más DoF que un 50 mm a f/2,8 en FF. Por eso conseguir bokeh extremo es más
                difícil en sensores pequeños — y por eso muchos retratistas prefieren FF.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué a veces &quot;Df&quot; sale infinito?</strong>
              <p>
                Cuando enfocas a la distancia hiperfocal o más allá, todo desde el punto Dn hasta el
                infinito queda nítido. La fórmula da una división por un número que se acerca a 0:
                matemáticamente, el límite es ∞.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Para qué sirve la regla &quot;1/3 - 2/3&quot;?</strong>
              <p>
                A distancias normales, aproximadamente 1/3 de la DoF está delante del sujeto y 2/3
                detrás. Es la razón por la que al enfocar un grupo de personas conviene enfocar al
                de la primera fila o una cara delantera: el resto del grupo cae dentro del 2/3
                trasero.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo afecta el sensor a la equivalencia de DoF?</strong>
              <p>
                Para reproducir el mismo encuadre y la misma DoF que da un 50 mm f/2,8 en FF, en
                APS-C necesitarías ~33 mm a f/1,8, y en M4/3 ~25 mm a f/1,4. Por eso las lentes
                rápidas para sensores pequeños son tan apreciadas.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Más detalles sobre equivalencias en el{' '}
                <a href="/visualizador-focales-fotografia/">visualizador de focales</a>.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo decidir la DoF paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Define qué debe estar nítido</strong>
                <p>
                  ¿Solo los ojos? ¿Toda la cara? ¿Todo el grupo? ¿Del primer plano al infinito? La
                  respuesta determina cuánta DoF necesitas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Empieza por la apertura</strong>
                <p>
                  Para bokeh: f/1,4–f/2,8. Para retrato neutro: f/4–f/5,6. Para grupos: f/5,6–f/8.
                  Para paisaje: f/8–f/11. Más allá de f/11, ojo con la difracción.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Considera el sensor en tu cuenta mental</strong>
                <p>
                  Si tienes APS-C o M4/3, los números nominales engañan. Usa esta calculadora con
                  el sensor correcto para no llevarte sorpresas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Para paisaje, calcula la hiperfocal</strong>
                <p>
                  Enfoca a la hiperfocal y todo desde su mitad al infinito queda nítido. Es la
                  técnica más rentable del paisajismo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba con un zoom 1:1 en el LCD</strong>
                <p>
                  El LCD a tamaño completo engaña. Amplía al 100 % para confirmar que la zona que
                  esperas nítida lo está. Es lo único fiable en el momento.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👁️</span>
              <div>
                <strong>Enfoca al ojo más cercano</strong>
                <p>En retrato con poca DoF, el ojo más cercano nítido salva la imagen aunque el resto caiga fuera.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Hiperfocal para paisaje</strong>
                <p>Memoriza la hiperfocal de tu lente más usada a la apertura típica. Te ahorra cuentas en el momento.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <div>
                <strong>Focus stacking para macro</strong>
                <p>Varias fotos enfocando a distintas distancias se combinan en Lightroom/Photoshop para nitidez total sin difracción.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>1/3 delante, 2/3 detrás</strong>
                <p>La DoF no es simétrica. Útil para grupos: enfoca a la primera o segunda fila.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Sweet spot entre f/5,6 y f/11</strong>
                <p>La mayoría de objetivos da máxima nitidez global aquí. Más allá empieza la difracción.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎓</span>
              <div>
                <strong>Combínalo con los otros simuladores</strong>
                <p>
                  Prueba el <a href="/simulador-fotografia/">triángulo de exposición</a>, el{' '}
                  <a href="/visualizador-focales-fotografia/">visualizador de focales</a> y el{' '}
                  <a href="/simulador-balance-blancos/">balance de blancos</a>.
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
                Disparar retrato grupal a f/2,8 y descubrir que solo la primera fila está nítida.
                Para 5+ personas en filas, mínimo f/5,6.
              </li>
              <li>
                Confundir &quot;más mm&quot; con &quot;más bokeh&quot; sin considerar la distancia.
                A misma distancia y apertura, sí; a mismo encuadre, también — pero no lo asumas
                automáticamente.
              </li>
              <li>
                Cerrar a f/22 pensando que ganarás nitidez en macro: la difracción te quita más de
                lo que la DoF te da. Mejor focus stacking.
              </li>
              <li>
                Olvidar el sensor: una DoF calculada para FF no aplica a M4/3 directamente. Usa la
                calculadora con el sensor real.
              </li>
              <li>
                Enfocar al infinito para paisaje sin saber si has pasado la hiperfocal. Pierdes el
                primer plano nítido sin necesidad.
              </li>
              <li>
                Disparar macro con autofoco continuo: el más mínimo movimiento te saca de DoF.
                Manual focus + trípode + control remoto.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-profundidad-campo')} />
        <ShareCard appName="calculadora-profundidad-campo" />
      </main>

      <Footer appName="calculadora-profundidad-campo" />
    </div>
  );
}

interface ReglaSVGProps {
  dnM: number;
  dfM: number;
  distanciaM: number;
  hiperfocalM: number;
  dfEsInfinito: boolean;
}

function ReglaSVG({ dnM, dfM, distanciaM, hiperfocalM, dfEsInfinito }: ReglaSVGProps) {
  const W = 480;
  const H = 180;
  const LEFT_PAD = 40;
  const RIGHT_PAD = 30;
  const BASE_Y = 110;
  const escalaAncho = W - LEFT_PAD - RIGHT_PAD;

  // Escala logarítmica de 0.3 m a 100 m
  const D_MIN = 0.3;
  const D_MAX = 100;
  const logMin = Math.log10(D_MIN);
  const logMax = Math.log10(D_MAX);

  const dToX = (d: number): number => {
    const clamped = Math.max(D_MIN, Math.min(D_MAX, d));
    const logD = Math.log10(clamped);
    return LEFT_PAD + ((logD - logMin) / (logMax - logMin)) * escalaAncho;
  };

  const ticks = [0.3, 0.5, 1, 2, 5, 10, 25, 100] as const;
  const xDn = dToX(dnM);
  const xDf = dfEsInfinito ? W - RIGHT_PAD : dToX(dfM);
  const xSujeto = dToX(distanciaM);
  const xHiperfocal = isFinite(hiperfocalM) && hiperfocalM <= D_MAX ? dToX(hiperfocalM) : null;

  return (
    <svg
      className={styles.reglaSvg}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Regla de profundidad de campo en escala logarítmica"
    >
      <defs>
        <linearGradient id="dofVerde" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Eje principal */}
      <line x1={LEFT_PAD} y1={BASE_Y} x2={W - RIGHT_PAD} y2={BASE_Y} stroke="#9ca3af" strokeWidth={1.5} />

      {/* Zona de nitidez (verde) */}
      <rect
        x={xDn}
        y={BASE_Y - 20}
        width={Math.max(2, xDf - xDn)}
        height={40}
        fill="url(#dofVerde)"
        stroke="#16a34a"
        strokeWidth={1.5}
      />

      {/* Ticks de distancia */}
      {ticks.map((t) => {
        const x = dToX(t);
        return (
          <g key={t}>
            <line x1={x} y1={BASE_Y - 4} x2={x} y2={BASE_Y + 4} stroke="#6b7280" strokeWidth={1} />
            <text
              x={x}
              y={BASE_Y + 18}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              {t < 1 ? `${t * 100}cm` : `${t}m`}
            </text>
          </g>
        );
      })}

      {/* Marcador hiperfocal */}
      {xHiperfocal !== null && (
        <g>
          <line
            x1={xHiperfocal}
            y1={BASE_Y - 35}
            x2={xHiperfocal}
            y2={BASE_Y - 22}
            stroke="#ea580c"
            strokeWidth={2}
            strokeDasharray="3 2"
          />
          <text
            x={xHiperfocal}
            y={BASE_Y - 40}
            fontSize="10"
            fill="#ea580c"
            textAnchor="middle"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            H
          </text>
        </g>
      )}

      {/* Marcador del sujeto */}
      <g>
        <circle cx={xSujeto} cy={BASE_Y} r={6} fill="#1d4ed8" stroke="white" strokeWidth={2} />
        <text
          x={xSujeto}
          y={BASE_Y - 12}
          fontSize="10"
          fill="#1d4ed8"
          textAnchor="middle"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          📍 sujeto
        </text>
      </g>

      {/* Etiquetas Dn / Df */}
      <text
        x={xDn}
        y={BASE_Y + 38}
        fontSize="10"
        fill="#15803d"
        textAnchor="middle"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        Dn
      </text>
      <text
        x={xDf}
        y={BASE_Y + 38}
        fontSize="10"
        fill="#15803d"
        textAnchor="middle"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {dfEsInfinito ? '∞' : 'Df'}
      </text>

      {/* Icono cámara izquierda */}
      <g transform={`translate(8, ${BASE_Y - 12})`}>
        <rect x={0} y={4} width={24} height={16} fill="#374151" rx={2} />
        <rect x={6} y={0} width={12} height={6} fill="#374151" />
        <circle cx={12} cy={12} r={5} fill="#1f2937" />
        <circle cx={12} cy={12} r={3} fill="#60a5fa" />
      </g>

      {/* Título inferior */}
      <text
        x={W / 2}
        y={H - 8}
        fontSize="11"
        fill="#6b7280"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        Zona verde = nitidez aceptable. Escala logarítmica.
      </text>
    </svg>
  );
}
