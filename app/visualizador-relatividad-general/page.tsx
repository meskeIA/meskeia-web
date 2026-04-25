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
import styles from './RelatividadGeneral.module.css';

// ─────────────────────────────────────────────
// Constantes de la malla SVG
// ─────────────────────────────────────────────

const GRID_N = 13;
const SVG_S = 400;
const CENTER = SVG_S / 2;
const SPACING = SVG_S / (GRID_N - 1);

// ─────────────────────────────────────────────
// Datos de conceptos clave
// ─────────────────────────────────────────────

interface Concepto {
  titulo: string;
  icono: string;
  resumen: string;
  detalle: string;
}

const CONCEPTOS: Concepto[] = [
  {
    titulo: 'Curvatura del espacio-tiempo',
    icono: '🌌',
    resumen: 'La gravedad no es una fuerza — es geometría',
    detalle:
      'Einstein reemplazó la fuerza gravitacional de Newton por la curvatura del espacio-tiempo. Una masa deforma el tejido del espacio y el tiempo a su alrededor. Otros objetos (incluyendo la luz) siguen las trayectorias más rectas posibles en ese espacio curvo — las geodésicas. La famosa analogía: una bola pesada sobre una tela tensa.',
  },
  {
    titulo: 'Geodésicas',
    icono: '🛤️',
    resumen: 'Las órbitas son "líneas rectas" en espacio curvo',
    detalle:
      'Una geodésica es el camino más corto entre dos puntos en una superficie curva. En la Tierra, son los arcos de gran círculo. En el espacio-tiempo curvo, la Tierra sigue la geodésica del campo gravitacional del Sol — lo que llamamos "órbita". No hay fuerza que la empuje: simplemente sigue la ruta más recta en un espacio curvo. La precesión del perihelio de Mercurio (43"/siglo), inexplicable por Newton, es confirmación directa.',
  },
  {
    titulo: 'Lentes gravitacionales',
    icono: '🔭',
    resumen: 'La luz se dobla alrededor de las masas',
    detalle:
      'La luz sigue geodésicas, y si el espacio está curvado, la luz también se curva. Eddington lo confirmó en el eclipse de 1919 (el momento en que Einstein se hizo famoso). Hoy usamos las lentes gravitacionales para detectar materia oscura, amplificar galaxias lejanas y buscar exoplanetas. Los anillos de Einstein son formaciones circulares de luz producidas cuando la fuente, la lente y el observador se alinean perfectamente.',
  },
  {
    titulo: 'Agujeros negros y horizonte de sucesos',
    icono: '⚫',
    resumen: 'Cuando la curvatura es tan extrema que nada puede escapar',
    detalle:
      'Si una masa se comprime por debajo de su radio de Schwarzschild (r_s = 2GM/c²), forma un agujero negro. El horizonte de sucesos es la "membrana" más allá de la cual nada — ni la luz — puede escapar. Para el Sol, r_s ≈ 3 km. Para la Tierra, ≈ 9 mm. En 2019, el Telescopio de Horizonte de Eventos capturó la primera imagen real de un agujero negro (M87*, 6.500 millones M☉). En 2022, Sagitario A* en el centro de nuestra galaxia.',
  },
  {
    titulo: 'Ondas gravitacionales',
    icono: '〰️',
    resumen: 'Ondulaciones en el tejido del espacio-tiempo',
    detalle:
      'Cuando masas enormes se aceleran (dos agujeros negros fusionándose, dos estrellas de neutrones colisionando), producen ondas que se propagan por el espacio-tiempo a velocidad de la luz. LIGO las detectó por primera vez el 14 de septiembre de 2015. La señal duró 0,2 segundos y provenía de dos agujeros negros fusionándose hace 1.300 millones de años, liberando más energía que todas las estrellas del universo observable juntas.',
  },
];

const NOMBRES_MASA = [
  'Tierra',
  'Júpiter',
  'Sol',
  'Estrella masiva',
  'Gigante roja',
  'Estrella de neutrones',
  'Pre-agujero negro',
  'Agujero negro',
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function RelatividadGeneralPage(): React.ReactNode {
  const [masa, setMasa] = useState<number>(3);
  const [conceptoActivo, setConceptoActivo] = useState<number | null>(null);

  // Cálculo de la malla deformada
  const gridPoints = useMemo((): [number, number][][] => {
    const pts: [number, number][][] = [];
    for (let row = 0; row < GRID_N; row++) {
      pts[row] = [];
      for (let col = 0; col < GRID_N; col++) {
        const rawX = col * SPACING;
        const rawY = row * SPACING;
        const dx = rawX - CENTER;
        const dy = rawY - CENTER;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r < 20) {
          // singularidad central
          pts[row].push([CENTER, CENTER]);
        } else {
          const deform = (masa * 35) / (r + masa * 6);
          const factor = 1 - deform / r;
          pts[row].push([CENTER + dx * factor, CENTER + dy * factor]);
        }
      }
    }
    return pts;
  }, [masa]);

  const midRow = Math.floor(GRID_N / 2);

  const handleConceptoClick = (idx: number): void => {
    setConceptoActivo(conceptoActivo === idx ? null : idx);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Física · Ciencias</span>
          <h1 className={styles.heroTitle}>Relatividad General</h1>
          <p className={styles.heroSubtitle}>
            La gravedad como curvatura del espacio-tiempo — Einstein, 1915
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Nota diferenciadora */}
        <div className={styles.notaDiferencia}>
          <strong>¿Ya conoces la Relatividad Especial (1905)?</strong> Esta app cubre la
          Relatividad General (1915), que añade la gravedad como curvatura del espacio-tiempo.{' '}
          <a href="/visualizador-relatividad-especial/" className={styles.link}>
            Ver Relatividad Especial →
          </a>
        </div>

        {/* Malla SVG del Espacio-Tiempo */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">
              🌐
            </span>
            <div>
              <h2 className={styles.seccionTitulo}>Malla del espacio-tiempo</h2>
              <p className={styles.seccionSubtitulo}>
                Observa cómo una masa deforma el tejido del universo
              </p>
            </div>
          </div>

          <div className={styles.meshWrapper}>
            <svg
              viewBox="0 0 400 400"
              className={styles.meshSvg}
              aria-label="Malla espacio-tiempo curvada por una masa"
            >
              <defs>
                <radialGradient id="rg-masaGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#2E86AB" />
                </radialGradient>
              </defs>

              {/* Líneas horizontales de la malla */}
              {gridPoints.map((row, ri) => (
                <polyline
                  key={`h-${ri}`}
                  points={row.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                  fill="none"
                  stroke={ri === midRow ? 'var(--secondary)' : 'rgba(46,134,171,0.35)'}
                  strokeWidth={ri === midRow ? 1.8 : 0.8}
                />
              ))}

              {/* Líneas verticales de la malla */}
              {Array.from({ length: GRID_N }).map((_, ci) => (
                <polyline
                  key={`v-${ci}`}
                  points={gridPoints
                    .map((row) => `${row[ci][0].toFixed(1)},${row[ci][1].toFixed(1)}`)
                    .join(' ')}
                  fill="none"
                  stroke={ci === midRow ? 'var(--secondary)' : 'rgba(46,134,171,0.35)'}
                  strokeWidth={ci === midRow ? 1.8 : 0.8}
                />
              ))}

              {/* Masa central */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={10 + masa * 3}
                fill="url(#rg-masaGrad)"
              />
              <circle
                cx={CENTER}
                cy={CENTER}
                r={10 + masa * 3}
                fill="none"
                stroke="rgba(46,134,171,0.4)"
                strokeWidth={1}
              />
            </svg>
          </div>

          {/* Control de masa */}
          <div className={styles.masaControl}>
            <label className={styles.masaLabel}>
              Masa del objeto:{' '}
              <strong>{NOMBRES_MASA[masa - 1]}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={masa}
              onChange={(e) => setMasa(Number(e.target.value))}
              className={styles.slider}
              aria-label={`Masa del objeto: ${NOMBRES_MASA[masa - 1]}`}
            />
            <p className={styles.masaDesc} role="status" aria-live="polite">
              {masa <= 2 &&
                'La curvatura es pequeña. La gravedad Newtoniana es suficientemente exacta.'}
              {masa === 3 &&
                'Curvatura moderada. La luz se desvía levemente. Las correcciones relativistas son medibles.'}
              {masa >= 4 &&
                masa <= 5 &&
                'Curvatura significativa. Las geodésicas se curvan notablemente. La luz dobla su trayectoria.'}
              {masa >= 6 &&
                masa <= 7 &&
                '¡Curvatura extrema! El tiempo se ralentiza mucho cerca de la masa. Zona de peligro.'}
              {masa === 8 &&
                'Agujero negro: el horizonte de sucesos atrapa todo lo que entra. Ni la luz escapa.'}
            </p>
          </div>
        </section>

        {/* 5 conceptos clave */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionIcono} aria-hidden="true">
              📖
            </span>
            <div>
              <h2 className={styles.seccionTitulo}>5 conceptos clave</h2>
              <p className={styles.seccionSubtitulo}>
                Haz clic en cada tarjeta para explorar en profundidad
              </p>
            </div>
          </div>

          <div className={styles.conceptosGrid}>
            {CONCEPTOS.map((concepto, idx) => (
              <button
                key={idx}
                className={`${styles.conceptoCard} ${conceptoActivo === idx ? styles.conceptoActivo : ''}`}
                onClick={() => handleConceptoClick(idx)}
                aria-expanded={conceptoActivo === idx}
                aria-label={`${concepto.titulo}: ${concepto.resumen}`}
              >
                <span className={styles.conceptoIcono} aria-hidden="true">
                  {concepto.icono}
                </span>
                <strong className={styles.conceptoTitulo}>{concepto.titulo}</strong>
                <p className={styles.conceptoResumen}>{concepto.resumen}</p>
              </button>
            ))}
          </div>

          {conceptoActivo !== null && (
            <div className={styles.conceptoDetalle} role="region" aria-label="Detalle del concepto">
              <h3 className={styles.conceptoDetalleTitulo}>
                <span aria-hidden="true">{CONCEPTOS[conceptoActivo].icono}</span>{' '}
                {CONCEPTOS[conceptoActivo].titulo}
              </h3>
              <p className={styles.conceptoDetalleTexto}>
                {CONCEPTOS[conceptoActivo].detalle}
              </p>
            </div>
          )}
        </section>

        {/* Corrección del GPS */}
        <section className={styles.seccion}>
          <div className={styles.gpsCard}>
            <h2 className={styles.gpsTitulo}>
              <span aria-hidden="true">🛰️</span> La corrección del GPS
            </h2>
            <p className={styles.gpsIntro}>
              Los satélites GPS orbitan a 20.200 km de altitud. Dos efectos relativistas actúan
              simultáneamente:
            </p>
            <ul className={styles.gpsLista}>
              <li>
                <strong>Relatividad especial</strong> (velocidad 14.000 km/h) →{' '}
                <code>−7 μs/día</code> (relojes más lentos)
              </li>
              <li>
                <strong>Relatividad general</strong> (menor gravedad en órbita) →{' '}
                <code>+45 μs/día</code> (relojes más rápidos)
              </li>
              <li>
                <strong>Neto: +38 μs/día</strong>
              </li>
            </ul>
            <p className={styles.gpsConclusion}>
              Sin corrección, el GPS acumularía <strong>11 km de error diario</strong>. La
              relatividad general no es física teórica — es ingeniería cotidiana.
            </p>
          </div>
        </section>

        {/* Insight box */}
        <div className={styles.insightBox}>
          <p>
            En 1915, Einstein tardó 8 años en pasar de la Relatividad Especial a la General. El
            mayor obstáculo fue la matemática: tuvo que aprender de su amigo Marcel Grossmann la
            geometría diferencial de Riemann. Las ecuaciones de campo de Einstein (
            <em>G</em>
            <sub>μν</sub> + Λ<em>g</em>
            <sub>μν</sub> = 8πG/c⁴ <em>T</em>
            <sub>μν</sub>) describen cómo la materia curva el espacio-tiempo y cómo el
            espacio-tiempo curvo dicta el movimiento de la materia.
          </p>
        </div>
      </main>

      <EducationalSection
        title="Einstein y la geometría de la gravedad"
        subtitle="De Newton a Einstein: cómo la gravedad dejó de ser una fuerza"
        defaultOpen={false}
      >
        <div className={styles.educacional}>
          <h3>De Newton a Einstein</h3>
          <p>
            En 1687, Newton publicó su ley de gravitación universal: toda masa atrae a toda otra
            masa con una fuerza proporcional al producto de sus masas e inversamente proporcional
            al cuadrado de la distancia. Funcionó perfectamente durante dos siglos. Pero tenía un
            problema: era una fuerza que actuaba &quot;a distancia&quot; de forma instantánea, sin
            explicar cómo se transmitía.
          </p>
          <p>
            En 1905, Einstein publicó la Relatividad Especial, que eliminaba la acción instantánea
            a distancia (nada viaja más rápido que la luz). Pero la relatividad especial no incluía
            la gravedad. Einstein pasó los siguientes 10 años trabajando en ello, con la ayuda de
            su amigo matemático Marcel Grossmann, quien le introdujo a la geometría diferencial de
            Riemann.
          </p>

          <h3>La idea central: el principio de equivalencia</h3>
          <p>
            Einstein se preguntó: ¿puede alguien dentro de una caja cerrada distinguir entre estar
            en reposo en un campo gravitacional y estar acelerado en el espacio vacío? La respuesta
            es no — y esa equivalencia es la clave de toda la teoría. La gravedad y la aceleración
            son la misma cosa vista desde distintos marcos de referencia.
          </p>

          <h3>Las ecuaciones de campo de Einstein (1915)</h3>
          <p>
            El 25 de noviembre de 1915, Einstein presentó sus ecuaciones de campo a la Academia
            Prusiana de Ciencias. En notación tensorial compacta:
          </p>
          <p className={styles.formula}>
            G<sub>μν</sub> + Λg<sub>μν</sub> = (8πG / c⁴) T<sub>μν</sub>
          </p>
          <p>
            Donde G<sub>μν</sub> es el tensor de Einstein (curvatura del espacio-tiempo), Λ es la
            constante cosmológica (energía oscura), g<sub>μν</sub> es el tensor métrico, G es la
            constante gravitacional de Newton, c la velocidad de la luz, y T<sub>μν</sub> es el
            tensor energía-momento (distribución de materia y energía). En realidad son 10
            ecuaciones acopladas no lineales en derivadas parciales.
          </p>

          <h3>Las predicciones y su verificación</h3>
          <ul>
            <li>
              <strong>Precesión de Mercurio (1915):</strong> La órbita de Mercurio precesa 43
              segundos de arco por siglo más de lo que predice Newton. Einstein lo calculó en su
              primera noche con las ecuaciones finales. Dijo que su corazón &quot;se había
              desbocado&quot; de alegría.
            </li>
            <li>
              <strong>Deflexión de la luz (1919):</strong> Arthur Eddington midió la deflexión de
              la luz de estrellas durante el eclipse solar del 29 de mayo de 1919. Resultado:
              1,75 segundos de arco — exactamente lo predicho por Einstein. Newton habría predicho
              la mitad.
            </li>
            <li>
              <strong>Corrimiento al rojo gravitacional (1959):</strong> Los fotones pierden
              energía al escapar de un campo gravitacional. Pound y Rebka lo midieron en un
              edificio de Harvard de 22 metros de altura.
            </li>
            <li>
              <strong>Agujeros negros predichos (1916):</strong> Karl Schwarzschild resolvió las
              ecuaciones de Einstein en el campo de trincheras de la Primera Guerra Mundial y
              descubrió que existiría una singularidad si la masa se comprimía suficientemente.
            </li>
            <li>
              <strong>Ondas gravitacionales (2015):</strong> LIGO detectó las primeras ondas
              gravitacionales, predichas por Einstein en 1916 pero que él dudó que fueran
              detectables.
            </li>
          </ul>

          <h3>La constante cosmológica: el mayor error de Einstein</h3>
          <p>
            En 1917, Einstein añadió Λ (lambda) a sus ecuaciones para obtener un universo
            estático, como se creía entonces. Cuando Hubble descubrió que el universo se expandía
            (1929), Einstein llamó a Λ &quot;el mayor error de su vida&quot; y lo eliminó. Pero en
            1998, se descubrió que la expansión del universo se está acelerando — y Λ ha
            resucitado como &quot;energía oscura&quot;. Einstein tenía razón al incluirla, solo
            que por las razones equivocadas.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota sobre la analogía de la lona:</strong> La malla SVG es una analogía 2D
            de la curvatura 4D del espacio-tiempo. La analogía de la &quot;lona tensa&quot; tiene
            limitaciones — usa la gravedad para explicar la gravedad (la bola hunde la lona por su
            peso). En realidad, la curvatura ocurre en las 4 dimensiones del espacio-tiempo, no
            solo en el espacio. Pero es la visualización más intuitiva disponible.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-relatividad-general')} />
      <ShareCard appName="visualizador-relatividad-general" />
      <Footer appName="visualizador-relatividad-general" />
    </div>
  );
}
