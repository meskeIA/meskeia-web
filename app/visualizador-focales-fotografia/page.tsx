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
import styles from './VisualizadorFocalesFotografia.module.css';

type SensorId = 'ff' | 'apsc' | 'm43';
type EscenaId = 'retrato' | 'paisaje' | 'animal';

interface FocalConfig {
  mm: number;
  nombre: string;
  uso: string;
}

const FOCALES: FocalConfig[] = [
  { mm: 14, nombre: 'Ultra Gran Angular', uso: 'Paisaje, arquitectura, astro' },
  { mm: 24, nombre: 'Gran Angular', uso: 'Paisaje, interior, calle' },
  { mm: 50, nombre: 'Normal', uso: 'Reportaje, retrato ambiental' },
  { mm: 85, nombre: 'Tele corto', uso: 'Retrato clásico' },
  { mm: 200, nombre: 'Teleobjetivo', uso: 'Deporte, fauna' },
];

interface SensorConfig {
  id: SensorId;
  nombre: string;
  factor: number;
  diagMM: number;
  descripcion: string;
}

const SENSORES: SensorConfig[] = [
  {
    id: 'ff',
    nombre: 'Full Frame',
    factor: 1.0,
    diagMM: 43.27,
    descripcion: 'Sensor 36 × 24 mm. Referencia de las focales (un 50 mm es un 50 mm).',
  },
  {
    id: 'apsc',
    nombre: 'APS-C',
    factor: 1.5,
    diagMM: 28.4,
    descripcion: 'Sensor recortado (~24 × 16 mm). Cada focal "ve" como una 1,5× más larga.',
  },
  {
    id: 'm43',
    nombre: 'Micro 4/3',
    factor: 2.0,
    diagMM: 21.6,
    descripcion: 'Sensor 17,3 × 13 mm. Cada focal "ve" como una 2× más larga.',
  },
];

interface EscenaConfig {
  id: EscenaId;
  nombre: string;
  emoji: string;
  descripcion: string;
}

const ESCENAS: EscenaConfig[] = [
  {
    id: 'retrato',
    nombre: 'Retrato urbano',
    emoji: '👤',
    descripcion:
      'Persona como sujeto, edificios y mobiliario urbano detrás. Observa cómo el tele "comprime" la calle hasta convertirla en un mosaico, mientras el gran angular ensancha y deforma la escena.',
  },
  {
    id: 'paisaje',
    nombre: 'Paisaje',
    emoji: '🏔️',
    descripcion:
      'Árbol en primer plano, cordillera y nubes al fondo. Con 14 mm la cordillera parece lejísimos; con 200 mm las montañas dominan el encuadre como si estuvieran a tres pasos del árbol.',
  },
  {
    id: 'animal',
    nombre: 'Animales',
    emoji: '🦌',
    descripcion:
      'Ciervo a la misma distancia visual en las 5 focales. Lo que cambia es el bosque que lo rodea: con gran angular se ve todo el claro, con tele queda solo un fragmento de árboles "comprimidos" tras él.',
  },
];

function calcularAnguloDiagonalFF(focalMM: number, factor: number): number {
  // El sensor recortado equivale a una focal mayor en términos de campo de visión.
  // Para mostrar el ángulo "real" que cubre, usamos la diagonal FF y la focal equivalente.
  const eq = focalMM * factor;
  const D = 43.27;
  return (2 * Math.atan(D / (2 * eq)) * 180) / Math.PI;
}

function clasificarFocalFF(focalEqMM: number): string {
  if (focalEqMM <= 16) return 'Ultra gran angular';
  if (focalEqMM <= 35) return 'Gran angular';
  if (focalEqMM <= 60) return 'Normal';
  if (focalEqMM <= 105) return 'Tele corto';
  if (focalEqMM <= 250) return 'Teleobjetivo';
  return 'Super-tele';
}

export default function VisualizadorFocalesFotografiaPage() {
  const [sensorId, setSensorId] = useState<SensorId>('ff');
  const [escenaId, setEscenaId] = useState<EscenaId>('retrato');

  const sensor = SENSORES.find((s) => s.id === sensorId)!;
  const escena = ESCENAS.find((e) => e.id === escenaId)!;

  const focalesData = useMemo(
    () =>
      FOCALES.map((f) => ({
        ...f,
        eqMM: f.mm * sensor.factor,
        angulo: calcularAnguloDiagonalFF(f.mm, sensor.factor),
      })),
    [sensor.factor],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🔭</span> Visualizador de Focales Fotográficas</h1>
        <p>
          Compara lado a lado cómo cambia la perspectiva con 14, 24, 50, 85 y 200 mm. El sujeto
          permanece igual; el fondo &quot;respira&quot; según la focal.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.tabBar} role="tablist" aria-label="Selección de escena">
          {ESCENAS.map((esc) => (
            <button
              key={esc.id}
              type="button"
              role="tab"
              aria-selected={escenaId === esc.id}
              className={`${styles.tabBtn} ${escenaId === esc.id ? styles.tabActive : ''}`}
              onClick={() => setEscenaId(esc.id)}
            >
              <span aria-hidden="true">{esc.emoji}</span> {esc.nombre}
            </button>
          ))}
        </div>

        <div className={styles.sensorBar} role="group" aria-label="Tamaño de sensor">
          <span className={styles.sensorLabel}>Sensor:</span>
          {SENSORES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.sensorBtn} ${sensorId === s.id ? styles.sensorActive : ''}`}
              onClick={() => setSensorId(s.id)}
              aria-pressed={sensorId === s.id}
            >
              {s.nombre}
              {s.factor !== 1 && (
                <span className={styles.factorBadge}>×{formatNumber(s.factor, 1)}</span>
              )}
            </button>
          ))}
        </div>

        <p className={styles.sensorDesc}>{sensor.descripcion}</p>

        <div className={styles.escenaInfo}>
          <strong>
            <span aria-hidden="true">{escena.emoji}</span> {escena.nombre}:
          </strong>{' '}
          {escena.descripcion}
        </div>

        <div className={styles.focalGrid}>
          {focalesData.map((f) => (
            <article key={f.mm} className={styles.focalCard}>
              <header className={styles.focalHeader}>
                <span className={styles.focalBig}>
                  {f.mm}
                  <small>mm</small>
                </span>
                <span className={styles.focalTipo}>{f.nombre}</span>
              </header>

              <EscenaSVG mm={f.mm} escena={escena.id} />

              <footer className={styles.focalFooter}>
                <div className={styles.focalDato}>
                  <span className={styles.focalDatoLabel}>Ángulo</span>
                  <span className={styles.focalDatoValue}>
                    {formatNumber(f.angulo, 0)}°
                  </span>
                </div>
                {sensor.factor !== 1 ? (
                  <div className={styles.focalDato}>
                    <span className={styles.focalDatoLabel}>Equiv. FF</span>
                    <span className={styles.focalDatoValue}>
                      {formatNumber(f.eqMM, 0)} mm
                    </span>
                  </div>
                ) : (
                  <div className={styles.focalDato}>
                    <span className={styles.focalDatoLabel}>Uso</span>
                    <span className={styles.focalDatoValueSmall}>{f.uso}</span>
                  </div>
                )}
              </footer>
            </article>
          ))}
        </div>

        <div className={styles.notaPerspectiva}>
          <strong><span aria-hidden="true">👀</span> Lo que estás viendo:</strong> el sujeto principal está al mismo tamaño en las 5
          imágenes — lo conseguirías acercándote más con el gran angular y alejándote con el tele.
          Lo que cambia es la <strong>perspectiva</strong>: el fondo se &quot;comprime&quot; o se
          &quot;expande&quot;. No es zoom, es geometría.
        </div>

        <EducationalSection
          title="Guía visual de las distancias focales"
          subtitle="Qué objetivo elegir y por qué"
          icon="🔭"
        >
          <h3 className={styles.eduSubtitle}>Tabla completa de focales clásicas (Full Frame)</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Focal</th>
                  <th>Ángulo diag.</th>
                  <th>Categoría</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>10–14 mm</td>
                  <td>~114–130°</td>
                  <td>Ultra gran angular</td>
                  <td>Astrofotografía, arquitectura interior, paisaje extremo</td>
                </tr>
                <tr>
                  <td>16–24 mm</td>
                  <td>~84–107°</td>
                  <td>Gran angular</td>
                  <td>Paisaje, interiores, calle, vlog</td>
                </tr>
                <tr>
                  <td>28–35 mm</td>
                  <td>~63–75°</td>
                  <td>Gran angular moderado</td>
                  <td>Reportaje, documental, retrato ambiental</td>
                </tr>
                <tr>
                  <td>50 mm</td>
                  <td>~47°</td>
                  <td>Normal</td>
                  <td>El &quot;ojo humano&quot; en cámara. Calle, retrato semi-cuerpo</td>
                </tr>
                <tr>
                  <td>85–105 mm</td>
                  <td>~24–29°</td>
                  <td>Tele corto</td>
                  <td>Retrato clásico, bodas, primer plano</td>
                </tr>
                <tr>
                  <td>135–200 mm</td>
                  <td>~12–18°</td>
                  <td>Teleobjetivo</td>
                  <td>Deporte, fauna a media distancia, retrato comprimido</td>
                </tr>
                <tr>
                  <td>300–600 mm</td>
                  <td>~4–8°</td>
                  <td>Super-tele</td>
                  <td>Aves, fauna lejana, deportes profesionales</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>El factor de recorte explicado en 30 segundos</h3>
          <p className={styles.guideParagraph}>
            Una lente de 50 mm proyecta el mismo círculo de imagen en cualquier cámara. Lo que
            cambia es el <strong>tamaño del sensor</strong> que recorta ese círculo. Un sensor más
            pequeño (APS-C, Micro 4/3) recorta más, así que el encuadre final equivale al de una
            focal más larga en Full Frame.
          </p>
          <p className={styles.guideParagraph}>
            <strong>Importante:</strong> el factor de recorte cambia el campo de visión, no la
            geometría. Un 50 mm sigue teniendo la perspectiva de un 50 mm — solo que ves un trozo
            más pequeño de la escena. Por eso para retrato en APS-C basta con una lente de 56–60 mm
            (equivalente a 85 mm FF).
          </p>

          <div className={styles.equivBox}>
            <h4 className={styles.equivTitle}>Equivalencias rápidas</h4>
            <ul className={styles.equivList}>
              <li>
                <strong>50 mm en FF</strong> ≈ 35 mm en APS-C ≈ 25 mm en M4/3
              </li>
              <li>
                <strong>85 mm en FF</strong> (retrato) ≈ 56 mm en APS-C ≈ 42 mm en M4/3
              </li>
              <li>
                <strong>200 mm en FF</strong> (tele) ≈ 135 mm en APS-C ≈ 100 mm en M4/3
              </li>
              <li>
                <strong>24 mm en FF</strong> (paisaje) ≈ 16 mm en APS-C ≈ 12 mm en M4/3
              </li>
            </ul>
          </div>

          <h3 className={styles.eduSubtitle}>Conceptos clave que confunden a casi todos</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Zoom ≠ perspectiva</h4>
              <p>
                Hacer zoom con la cámara recorta la escena (te acerca ópticamente), pero la
                perspectiva sigue siendo la del punto desde el que disparas. Cambiar la perspectiva
                exige mover los pies, no la lente.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Compresión del teleobjetivo</h4>
              <p>
                Con un 200 mm te alejas mucho del sujeto. Esa distancia hace que las cosas del
                fondo (que están aún más lejos) parezcan estar pegadas al sujeto. Es el efecto
                &quot;cordillera al lado del corredor&quot;.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Distorsión del gran angular</h4>
              <p>
                A 14 mm te acercas mucho al sujeto y los elementos cercanos se ven enormes
                respecto a los lejanos. Por eso un selfie con gran angular alarga las narices: la
                cara está pegada a la cámara.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>El &quot;ojo humano&quot; es ~50 mm</h4>
              <p>
                Aproximadamente. El ojo tiene un campo visual mucho más amplio, pero la zona de
                enfoque nítido equivale al ángulo de un 50 mm en FF. Por eso 50 mm se percibe como
                &quot;natural&quot;.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué los retratos &quot;de revista&quot; suelen ser con 85 mm?</strong>
              <p>
                Porque a la distancia necesaria para encuadrar un rostro con 85 mm, los rasgos no
                se deforman (gran angular) ni se aplastan tanto (tele largo). 85, 105 y 135 mm dan
                proporciones faciales agradables.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> En APS-C, el equivalente es ~56 mm. Hay lentes muy luminosas a ese precio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Es mejor un zoom o un fijo?</strong>
              <p>
                Fijo (focal única): más luminoso, más nítido, más barato a igual calidad, te obliga
                a moverte (aprendes composición). Zoom: versátil, una sola lente cubre rangos. Para
                empezar y aprender, un fijo de 35 o 50 mm es ideal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué a 200 mm necesito más luz o ISO más alto?</strong>
              <p>
                Por la <strong>regla 1/focal</strong>: la velocidad mínima para evitar trepidación
                es 1/focal. A 200 mm necesitas 1/250 s o más rápido, a 50 mm con 1/60 s te apañas.
                Una velocidad más rápida exige más luz o más ISO. Por eso los teles &quot;piden&quot;
                f/2,8 (caros) o estabilización.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Para qué sirve un 14 mm fuera del paisaje?</strong>
              <p>
                Para fotografía de interiores estrechos (inmobiliaria), arquitectura, astrofoto
                (Vía Láctea: cuanto más ángulo, más cielo y menos estrelas movidas) y para crear
                imágenes con mucha &quot;sensación de presencia&quot; — la audiencia siente que
                está allí.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué focal del kit es la más versátil para empezar?</strong>
              <p>
                Un <strong>24–70 mm</strong> en Full Frame o un <strong>18–55 mm</strong> en
                APS-C (que equivale aproximadamente a un 27–82 mm FF) cubre desde gran angular
                hasta tele corto y resuelve el 80 % de las situaciones cotidianas.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Influye la focal en la profundidad de campo?</strong>
              <p>
                Sí: a igual apertura y distancia, una focal más larga reduce la profundidad de
                campo. Por eso los retratos con 85 mm a f/2,8 tienen un fondo muy desenfocado:
                combina apertura amplia con focal larga.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si quieres bokeh sin gastar en una lente de f/1,4, usa una focal más larga.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo elegir focal — paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el sujeto y su distancia natural</strong>
                <p>
                  ¿Puedes acercarte físicamente al sujeto? ¿O hay distancia obligada (deportes,
                  fauna, escenario)? Esto descarta las focales que no llegan.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide qué quieres con el fondo</strong>
                <p>
                  ¿Quieres que el fondo sea protagonista (paisaje detrás del sujeto, contexto)? Usa
                  gran angular. ¿Quieres aislar al sujeto del fondo? Usa tele.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Comprueba el sensor de tu cámara</strong>
                <p>
                  Si tienes APS-C, multiplica por 1,5 para saber el ángulo real (lo que ves). Un
                  50 mm en APS-C es un tele corto, no un objetivo &quot;normal&quot;.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Comprueba la velocidad mínima (regla 1/focal)</strong>
                <p>
                  Con un 200 mm a pulso necesitas 1/250 s. ¿Tienes esa luz o estabilización? Si
                  no, baja a una focal más corta o usa trípode.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Camina antes de hacer zoom</strong>
                <p>
                  La regla de oro: muévete con los pies primero. Solo cuando ya estés en la
                  posición ideal, decide el encuadre con la focal. Así controlas la perspectiva,
                  no solo el tamaño aparente.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🦶</span>
              <div>
                <strong>Camina, no hagas zoom</strong>
                <p>El zoom cambia el encuadre; tus pies cambian la perspectiva, que es lo que define la foto.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Para retrato, 85 mm en FF (o equivalente)</strong>
                <p>56 mm en APS-C, 42 mm en M4/3. Es el sweet spot universal.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌅</span>
              <div>
                <strong>Para paisaje, no te quedes en 14 mm</strong>
                <p>El gran angular extremo dispersa la atención. 24-35 mm da paisajes con composición clara.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏃</span>
              <div>
                <strong>Para deportes, prioriza luminosidad</strong>
                <p>Un 70-200 f/2,8 te da velocidad sin subir el ISO. Es la lente más usada en estadios.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Empieza por un fijo de 35 o 50 mm</strong>
                <p>Te obliga a entender la composición. Aprenderás más con un fijo en 6 meses que con un zoom en 2 años.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌌</span>
              <div>
                <strong>Combínalo con el triángulo de exposición</strong>
                <p>
                  La focal no opera sola. Prueba el{' '}
                  <a href="/simulador-fotografia/">simulador del triángulo de exposición</a> para
                  ver cómo ISO, apertura y velocidad acompañan cada elección de focal.
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
                Hacer selfies con gran angular pegado a la cara: deforma rasgos y se ven narices
                enormes. Para selfies, separa el brazo o usa palo, mejor con focal moderada.
              </li>
              <li>
                Comprar un 50 mm para retrato sin saber que tienes APS-C: te queda como un 75 mm
                FF, que aprieta el encuadre y exige más distancia. Para retrato en APS-C, mira 35
                mm o 56 mm.
              </li>
              <li>
                Disparar con teleobjetivo a pulso y velocidad lenta. Cualquier 300 mm a 1/60 s sin
                trípode = foto borrosa. Aplica la regla 1/focal con margen.
              </li>
              <li>
                Confundir &quot;más mm&quot; con &quot;mejor zoom&quot;. Más mm = más aumento, sí,
                pero también menos campo, menos luz, más peso y más caro.
              </li>
              <li>
                Olvidar que un objetivo gran angular destaca los primeros planos: si compones para
                el horizonte y el primer plano queda vacío, la foto se siente desangelada.
              </li>
              <li>
                Pensar que para paisaje &quot;cuanto más ángulo, mejor&quot;. Muchos paisajes
                icónicos están hechos con teleobjetivo: aíslan una capa de la escena.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-focales-fotografia')} />
        <ShareCard appName="visualizador-focales-fotografia" />
      </main>

      <Footer appName="visualizador-focales-fotografia" />
    </div>
  );
}

interface EscenaSVGProps {
  mm: number;
  escena: EscenaId;
}

function EscenaSVG({ mm, escena }: EscenaSVGProps) {
  const W = 280;
  const H = 200;
  // Escala relativa al 50 mm de referencia: 14→0.28, 24→0.48, 50→1, 85→1.7, 200→4
  const escalaFondo = mm / 50;

  return (
    <svg
      className={styles.escenaSvg}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Escena de ${escena} a ${mm} mm`}
    >
      <defs>
        <linearGradient id="cieloFocales" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="cieloUrbano" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <clipPath id={`recorte-${mm}`}>
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
      </defs>

      <g clipPath={`url(#recorte-${mm})`}>
        {escena === 'retrato' && <EscenaRetrato W={W} H={H} escalaFondo={escalaFondo} />}
        {escena === 'paisaje' && <EscenaPaisaje W={W} H={H} escalaFondo={escalaFondo} />}
        {escena === 'animal' && <EscenaAnimal W={W} H={H} escalaFondo={escalaFondo} />}
      </g>
    </svg>
  );
}

interface EscenaProps {
  W: number;
  H: number;
  escalaFondo: number;
}

function EscenaRetrato({ W, H, escalaFondo }: EscenaProps) {
  // El punto donde se escala es el centro horizontal a la altura del horizonte (~75% de H).
  const cx = W / 2;
  const cy = H * 0.75;

  return (
    <>
      {/* Cielo urbano (no escala) */}
      <rect x={0} y={0} width={W} height={H * 0.6} fill="url(#cieloUrbano)" />
      {/* Suelo (no escala) */}
      <rect x={0} y={H * 0.6} width={W} height={H * 0.4} fill="#52525b" />
      {/* Acera */}
      <rect x={0} y={H * 0.6} width={W} height={4} fill="#71717a" />
      <rect x={0} y={H * 0.78} width={W} height={2} fill="#a1a1aa" opacity={0.4} />

      {/* Grupo de fondo escalado: edificios y mobiliario */}
      <g transform={`translate(${cx}, ${cy}) scale(${escalaFondo}) translate(${-cx}, ${-cy})`}>
        {/* Edificio izquierdo */}
        <rect x={W * 0.05} y={H * 0.2} width={W * 0.18} height={H * 0.4} fill="#475569" />
        <rect x={W * 0.08} y={H * 0.25} width={6} height={8} fill="#fbbf24" />
        <rect x={W * 0.13} y={H * 0.25} width={6} height={8} fill="#fbbf24" />
        <rect x={W * 0.18} y={H * 0.25} width={6} height={8} fill="#fbbf24" />
        <rect x={W * 0.08} y={H * 0.35} width={6} height={8} fill="#fde68a" />
        <rect x={W * 0.13} y={H * 0.35} width={6} height={8} fill="#fbbf24" />
        <rect x={W * 0.18} y={H * 0.35} width={6} height={8} fill="#fde68a" />
        <rect x={W * 0.08} y={H * 0.45} width={6} height={8} fill="#fbbf24" />
        <rect x={W * 0.13} y={H * 0.45} width={6} height={8} fill="#fde68a" />
        <rect x={W * 0.18} y={H * 0.45} width={6} height={8} fill="#fbbf24" />

        {/* Edificio central tras el sujeto */}
        <rect x={W * 0.42} y={H * 0.12} width={W * 0.16} height={H * 0.48} fill="#334155" />
        <rect x={W * 0.45} y={H * 0.18} width={5} height={8} fill="#fde68a" />
        <rect x={W * 0.5} y={H * 0.18} width={5} height={8} fill="#fbbf24" />
        <rect x={W * 0.45} y={H * 0.28} width={5} height={8} fill="#fbbf24" />
        <rect x={W * 0.5} y={H * 0.28} width={5} height={8} fill="#fde68a" />
        <rect x={W * 0.45} y={H * 0.38} width={5} height={8} fill="#fbbf24" />
        <rect x={W * 0.5} y={H * 0.38} width={5} height={8} fill="#fbbf24" />

        {/* Edificio derecho */}
        <rect x={W * 0.72} y={H * 0.25} width={W * 0.22} height={H * 0.35} fill="#64748b" />
        <rect x={W * 0.76} y={H * 0.3} width={6} height={6} fill="#fde68a" />
        <rect x={W * 0.82} y={H * 0.3} width={6} height={6} fill="#fbbf24" />
        <rect x={W * 0.88} y={H * 0.3} width={6} height={6} fill="#fde68a" />
        <rect x={W * 0.76} y={H * 0.4} width={6} height={6} fill="#fbbf24" />
        <rect x={W * 0.82} y={H * 0.4} width={6} height={6} fill="#fde68a" />
        <rect x={W * 0.88} y={H * 0.4} width={6} height={6} fill="#fbbf24" />

        {/* Farola izquierda */}
        <rect x={W * 0.3} y={H * 0.42} width={2} height={H * 0.18} fill="#1f2937" />
        <circle cx={W * 0.31} cy={H * 0.42} r={4} fill="#fde047" />

        {/* Farola derecha */}
        <rect x={W * 0.66} y={H * 0.42} width={2} height={H * 0.18} fill="#1f2937" />
        <circle cx={W * 0.67} cy={H * 0.42} r={4} fill="#fde047" />

        {/* Coche aparcado al fondo */}
        <rect x={W * 0.62} y={H * 0.55} width={W * 0.1} height={H * 0.06} fill="#dc2626" rx={2} />
        <circle cx={W * 0.64} cy={H * 0.61} r={2} fill="#1f2937" />
        <circle cx={W * 0.7} cy={H * 0.61} r={2} fill="#1f2937" />
      </g>

      {/* Sujeto: persona en primer plano (NO escala — tamaño constante) */}
      <g>
        {/* Cuerpo */}
        <path
          d={`M ${cx - 22} ${H} L ${cx - 16} ${H * 0.78} L ${cx + 16} ${H * 0.78} L ${cx + 22} ${H} Z`}
          fill="#1e3a8a"
        />
        {/* Cuello */}
        <rect x={cx - 5} y={H * 0.74} width={10} height={H * 0.05} fill="#fde68a" />
        {/* Cabeza */}
        <ellipse cx={cx} cy={H * 0.66} rx={14} ry={16} fill="#fde68a" />
        {/* Pelo */}
        <path
          d={`M ${cx - 14} ${H * 0.6} Q ${cx - 14} ${H * 0.55} ${cx} ${H * 0.54} Q ${cx + 14} ${H * 0.55} ${cx + 14} ${H * 0.6} Q ${cx + 14} ${H * 0.58} ${cx + 8} ${H * 0.57} Q ${cx} ${H * 0.55} ${cx - 8} ${H * 0.57} Q ${cx - 14} ${H * 0.58} ${cx - 14} ${H * 0.6} Z`}
          fill="#78350f"
        />
        {/* Ojos */}
        <circle cx={cx - 5} cy={H * 0.66} r={1.5} fill="#1f2937" />
        <circle cx={cx + 5} cy={H * 0.66} r={1.5} fill="#1f2937" />
        {/* Boca */}
        <path
          d={`M ${cx - 4} ${H * 0.71} Q ${cx} ${H * 0.73} ${cx + 4} ${H * 0.71}`}
          stroke="#9f1239"
          strokeWidth={1.2}
          fill="none"
        />
      </g>
    </>
  );
}

function EscenaPaisaje({ W, H, escalaFondo }: EscenaProps) {
  const cx = W / 2;
  const cy = H * 0.7;

  return (
    <>
      {/* Cielo (no escala) */}
      <rect x={0} y={0} width={W} height={H * 0.7} fill="url(#cieloFocales)" />
      {/* Suelo (no escala) */}
      <rect x={0} y={H * 0.7} width={W} height={H * 0.3} fill="#65a30d" />

      {/* Sol */}
      <circle cx={W * 0.82} cy={H * 0.18} r={10} fill="#fef9c3" opacity={0.9} />

      {/* Fondo escalado: cordillera + nubes */}
      <g transform={`translate(${cx}, ${cy}) scale(${escalaFondo}) translate(${-cx}, ${-cy})`}>
        {/* Cordillera lejana */}
        <polygon
          points={`0,${H * 0.55} ${W * 0.15},${H * 0.32} ${W * 0.3},${H * 0.45} ${W * 0.45},${H * 0.28} ${W * 0.6},${H * 0.4} ${W * 0.75},${H * 0.25} ${W * 0.9},${H * 0.38} ${W},${H * 0.5} ${W},${H * 0.7} 0,${H * 0.7}`}
          fill="#94a3b8"
        />
        {/* Cordillera media */}
        <polygon
          points={`0,${H * 0.62} ${W * 0.18},${H * 0.45} ${W * 0.32},${H * 0.55} ${W * 0.48},${H * 0.4} ${W * 0.62},${H * 0.52} ${W * 0.78},${H * 0.38} ${W * 0.92},${H * 0.5} ${W},${H * 0.58} ${W},${H * 0.7} 0,${H * 0.7}`}
          fill="#64748b"
        />
        {/* Nieve en picos */}
        <polygon
          points={`${W * 0.4},${H * 0.42} ${W * 0.48},${H * 0.4} ${W * 0.52},${H * 0.44}`}
          fill="#f8fafc"
          opacity={0.9}
        />
        <polygon
          points={`${W * 0.7},${H * 0.4} ${W * 0.78},${H * 0.38} ${W * 0.82},${H * 0.42}`}
          fill="#f8fafc"
          opacity={0.9}
        />
        {/* Nubes */}
        <ellipse cx={W * 0.2} cy={H * 0.15} rx={18} ry={5} fill="#fff" opacity={0.85} />
        <ellipse cx={W * 0.55} cy={H * 0.1} rx={22} ry={6} fill="#fff" opacity={0.8} />
      </g>

      {/* Sujeto: árbol en primer plano (NO escala) */}
      <g>
        <rect x={cx - 3} y={H * 0.7} width={6} height={H * 0.18} fill="#78350f" />
        <ellipse cx={cx} cy={H * 0.65} rx={20} ry={22} fill="#166534" />
        <ellipse cx={cx - 10} cy={H * 0.6} rx={12} ry={14} fill="#15803d" />
        <ellipse cx={cx + 10} cy={H * 0.6} rx={12} ry={14} fill="#15803d" />
        <ellipse cx={cx} cy={H * 0.55} rx={14} ry={14} fill="#16a34a" />
      </g>
    </>
  );
}

function EscenaAnimal({ W, H, escalaFondo }: EscenaProps) {
  const cx = W / 2;
  const cy = H * 0.72;

  return (
    <>
      {/* Cielo (no escala) */}
      <rect x={0} y={0} width={W} height={H * 0.55} fill="url(#cieloFocales)" />
      {/* Suelo verde-tierra (no escala) */}
      <rect x={0} y={H * 0.55} width={W} height={H * 0.45} fill="#4d7c0f" />

      {/* Fondo escalado: bosque */}
      <g transform={`translate(${cx}, ${cy}) scale(${escalaFondo}) translate(${-cx}, ${-cy})`}>
        {/* Línea de árboles del bosque */}
        <ellipse cx={W * 0.08} cy={H * 0.5} rx={20} ry={26} fill="#14532d" />
        <ellipse cx={W * 0.18} cy={H * 0.48} rx={18} ry={28} fill="#166534" />
        <ellipse cx={W * 0.28} cy={H * 0.5} rx={22} ry={24} fill="#15803d" />
        <ellipse cx={W * 0.4} cy={H * 0.46} rx={20} ry={30} fill="#14532d" />
        <ellipse cx={W * 0.55} cy={H * 0.48} rx={24} ry={28} fill="#166534" />
        <ellipse cx={W * 0.68} cy={H * 0.5} rx={20} ry={26} fill="#15803d" />
        <ellipse cx={W * 0.8} cy={H * 0.47} rx={22} ry={30} fill="#14532d" />
        <ellipse cx={W * 0.92} cy={H * 0.5} rx={20} ry={28} fill="#166534" />

        {/* Troncos visibles */}
        <rect x={W * 0.27} y={H * 0.5} width={4} height={H * 0.12} fill="#451a03" />
        <rect x={W * 0.54} y={H * 0.5} width={4} height={H * 0.12} fill="#451a03" />
        <rect x={W * 0.79} y={H * 0.5} width={4} height={H * 0.12} fill="#451a03" />

        {/* Flores/hierba en el suelo (lejos) */}
        <circle cx={W * 0.15} cy={H * 0.65} r={2} fill="#fbbf24" />
        <circle cx={W * 0.35} cy={H * 0.67} r={2} fill="#fff" />
        <circle cx={W * 0.65} cy={H * 0.66} r={2} fill="#fbbf24" />
        <circle cx={W * 0.85} cy={H * 0.65} r={2} fill="#fff" />
      </g>

      {/* Sujeto: ciervo en primer plano (NO escala) */}
      <g>
        {/* Cuerpo */}
        <ellipse cx={cx} cy={H * 0.82} rx={28} ry={14} fill="#92400e" />
        {/* Cuello */}
        <path
          d={`M ${cx + 14} ${H * 0.78} L ${cx + 26} ${H * 0.62} L ${cx + 32} ${H * 0.62} L ${cx + 22} ${H * 0.8} Z`}
          fill="#92400e"
        />
        {/* Cabeza */}
        <ellipse cx={cx + 32} cy={H * 0.6} rx={9} ry={6} fill="#a16207" />
        {/* Hocico */}
        <ellipse cx={cx + 40} cy={H * 0.62} rx={3} ry={2.5} fill="#451a03" />
        {/* Ojo */}
        <circle cx={cx + 34} cy={H * 0.59} r={1.2} fill="#1f2937" />
        {/* Oreja */}
        <ellipse cx={cx + 28} cy={H * 0.56} rx={2.5} ry={4} fill="#78350f" />
        {/* Astas */}
        <path
          d={`M ${cx + 30} ${H * 0.56} L ${cx + 28} ${H * 0.49} L ${cx + 25} ${H * 0.5} M ${cx + 30} ${H * 0.56} L ${cx + 32} ${H * 0.48} L ${cx + 35} ${H * 0.49}`}
          stroke="#451a03"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx + 33} ${H * 0.56} L ${cx + 35} ${H * 0.49} L ${cx + 38} ${H * 0.5} M ${cx + 33} ${H * 0.56} L ${cx + 37} ${H * 0.48} L ${cx + 40} ${H * 0.49}`}
          stroke="#451a03"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
        {/* Patas delanteras */}
        <rect x={cx + 12} y={H * 0.88} width={4} height={H * 0.1} fill="#78350f" />
        <rect x={cx + 20} y={H * 0.88} width={4} height={H * 0.1} fill="#78350f" />
        {/* Patas traseras */}
        <rect x={cx - 22} y={H * 0.88} width={4} height={H * 0.1} fill="#78350f" />
        <rect x={cx - 14} y={H * 0.88} width={4} height={H * 0.1} fill="#78350f" />
        {/* Cola */}
        <ellipse cx={cx - 26} cy={H * 0.78} rx={3} ry={4} fill="#fef3c7" />
      </g>
    </>
  );
}
