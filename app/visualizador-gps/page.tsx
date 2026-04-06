'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorGps.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'satelites' | 'trilateracion' | 'einstein' | 'precision';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'satelites', titulo: 'Los satélites', icono: '🛰️', subtitulo: '31 satélites a 20.200 km de altura' },
  { id: 'trilateracion', titulo: 'Trilateración', icono: '📡', subtitulo: 'Cómo 3 señales fijan tu posición' },
  { id: 'einstein', titulo: 'Einstein y el GPS', icono: '⏱️', subtitulo: 'Sin relatividad, 10 km de error al día' },
  { id: 'precision', titulo: 'Precisión y más allá', icono: '🎯', subtitulo: 'De 5 metros a 2 centímetros' },
];

// ─────────────────────────────────────────────
// Sección 1: Los satélites
// ─────────────────────────────────────────────

function SeccionSatelites() {
  const datos = [
    { label: 'Satélites activos', valor: '31', detalle: 'Constelación GPS (EE.UU.)' },
    { label: 'Altitud orbital', valor: '20.200 km', detalle: 'Órbita media terrestre (MEO)' },
    { label: 'Período orbital', valor: '11 h 58 min', detalle: '2 órbitas completas al día' },
    { label: 'Velocidad', valor: '3,87 km/s', detalle: '~14.000 km/h' },
    { label: 'Reloj a bordo', valor: 'Atómico', detalle: 'Precisión: ±1 ns (cesio/rubidio)' },
    { label: 'Mínimo para posición', valor: '4 satélites', detalle: '3 posición + 1 tiempo' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El GPS (Global Positioning System) es una constelación de <strong>31 satélites</strong> orbitando la Tierra. Cada uno lleva un reloj atómico ultrapreciso y emite señales de radio constantemente. Tu móvil necesita captar al menos 4 para saber dónde estás.</p>
      </div>

      {/* Visualización orbital */}
      <div className={styles.orbitaContainer}>
        <div className={styles.tierra}>
          <span className={styles.tierraEmoji} aria-hidden="true">🌍</span>
          <span className={styles.tierraLabel}>Tierra</span>
        </div>
        <div className={styles.orbita}>
          <div className={`${styles.satelite} ${styles.sat1}`} title="Satélite GPS">
            <span aria-hidden="true">🛰️</span>
          </div>
          <div className={`${styles.satelite} ${styles.sat2}`} title="Satélite GPS">
            <span aria-hidden="true">🛰️</span>
          </div>
          <div className={`${styles.satelite} ${styles.sat3}`} title="Satélite GPS">
            <span aria-hidden="true">🛰️</span>
          </div>
          <div className={`${styles.satelite} ${styles.sat4}`} title="Satélite GPS">
            <span aria-hidden="true">🛰️</span>
          </div>
        </div>
        <span className={styles.orbitaLabel}>{formatNumber(20200, 0)} km</span>
      </div>

      {/* Datos clave */}
      <div className={styles.statsGrid}>
        {datos.map((d, i) => (
          <div key={i} className={styles.statCard}>
            <span className={styles.statLabel}>{d.label}</span>
            <span className={styles.statValor}>{d.valor}</span>
            <span className={styles.statDetalle}>{d.detalle}</span>
          </div>
        ))}
      </div>

      {/* Por qué 4 satélites */}
      <div className={styles.explicacionCard}>
        <h3 className={styles.explicacionTitulo}>¿Por qué 4 y no 3?</h3>
        <div className={styles.porqueGrid}>
          <div className={styles.porqueItem}>
            <span className={styles.porqueNumero}>3</span>
            <span className={styles.porqueTexto}>satélites determinan tu <strong>posición</strong> en 3D (latitud, longitud, altitud)</span>
          </div>
          <div className={styles.porqueItem}>
            <span className={styles.porqueNumero}>+1</span>
            <span className={styles.porqueTexto}>satélite extra corrige el <strong>desfase del reloj</strong> de tu móvil (no tiene reloj atómico)</span>
          </div>
        </div>
        <p className={styles.explicacionNota}>Un error de 1 microsegundo en el reloj = 300 metros de error en posición. El 4.º satélite resuelve ese problema.</p>
      </div>

      <div className={styles.insight}>
        <p>
          En cualquier momento, desde cualquier punto de la Tierra, hay al menos <strong>6-10 satélites GPS visibles</strong> sobre el horizonte. La constelación está diseñada para que nunca te quedes sin cobertura.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Trilateración
// ─────────────────────────────────────────────

function SeccionTrilateracion() {
  const [circulos, setCirculos] = useState(1);

  const pasos = [
    {
      n: 1,
      titulo: '1 satélite → un anillo',
      desc: 'Sabes que estás a una distancia concreta del satélite, pero podrías estar en cualquier punto de una esfera (un círculo en 2D).',
      color: '#2E86AB',
    },
    {
      n: 2,
      titulo: '2 satélites → 2 puntos',
      desc: 'Dos esferas se cruzan en un círculo. En 2D, dos círculos se cruzan en 2 puntos. Ya has reducido las opciones a solo 2.',
      color: '#48A9A6',
    },
    {
      n: 3,
      titulo: '3 satélites → 1 punto',
      desc: 'El tercer círculo elimina la ambigüedad. Solo hay un punto donde los tres se cruzan. Esa es tu posición exacta.',
      color: '#E67E22',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada satélite emite una señal con la <strong>hora exacta de envío</strong>. Tu móvil calcula cuánto ha tardado en llegar: <strong>distancia = velocidad de la luz × tiempo</strong>. Con 3 distancias, se calcula tu posición.</p>
      </div>

      {/* Visualización interactiva de círculos */}
      <div className={styles.trilateraContainer}>
        <div className={styles.trilateraVisual}>
          <div className={`${styles.circulo} ${styles.circulo1} ${circulos >= 1 ? styles.circuloVisible : ''}`} />
          {circulos >= 2 && (
            <div className={`${styles.circulo} ${styles.circulo2} ${styles.circuloVisible}`} />
          )}
          {circulos >= 3 && (
            <div className={`${styles.circulo} ${styles.circulo3} ${styles.circuloVisible}`} />
          )}
          {circulos >= 3 && (
            <div className={styles.puntoFix} title="Tu posición">
              <span className={styles.puntoFixLabel}>Tú</span>
            </div>
          )}
          {circulos >= 2 && circulos < 3 && (
            <>
              <div className={`${styles.puntoAmbiguo} ${styles.puntoA}`} />
              <div className={`${styles.puntoAmbiguo} ${styles.puntoB}`} />
            </>
          )}
        </div>

        <div className={styles.trilateraControles}>
          {[1, 2, 3].map(n => (
            <button
              key={n}
              type="button"
              className={`${styles.trilateraBtn} ${circulos === n ? styles.trilateraBtnActivo : ''}`}
              onClick={() => setCirculos(n)}
              aria-pressed={circulos === n}
            >
              {n} {n === 1 ? 'satélite' : 'satélites'}
            </button>
          ))}
        </div>
      </div>

      {/* Pasos explicativos */}
      <div className={styles.pasosGrid}>
        {pasos.map(p => (
          <div
            key={p.n}
            className={`${styles.pasoCard} ${circulos === p.n ? styles.pasoActivo : ''}`}
            style={{ borderLeftColor: p.color }}
          >
            <h3 className={styles.pasoTitulo}>{p.titulo}</h3>
            <p className={styles.pasoDesc}>{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Velocidad de la luz */}
      <div className={styles.formulaCard}>
        <span className={styles.formulaLabel}>La fórmula clave</span>
        <span className={styles.formula}>d = c × Δt</span>
        <div className={styles.formulaLeyenda}>
          <span><strong>d</strong> = distancia al satélite</span>
          <span><strong>c</strong> = {formatNumber(299792, 0)} km/s (velocidad de la luz)</span>
          <span><strong>Δt</strong> = tiempo que tarda la señal</span>
        </div>
        <p className={styles.formulaEjemplo}>Ejemplo: si la señal tarda 0,067 s → distancia = {formatNumber(299792 * 0.067, 0)} km ≈ {formatNumber(20200, 0)} km</p>
      </div>

      <div className={styles.insight}>
        <p>
          El GPS no mide ángulos ni direcciones — solo <strong>distancias</strong>. Tres distancias conocidas desde tres puntos fijos bastan para determinar un punto único en el espacio. Este principio geométrico se llama <strong>trilateración</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Einstein y el GPS
// ─────────────────────────────────────────────

function SeccionEinstein() {
  const efectos = [
    {
      icono: '🏎️',
      titulo: 'Relatividad especial',
      subtitulo: 'Efecto de la velocidad',
      efecto: '-7 μs/día',
      explicacion: 'Los satélites viajan a 3,87 km/s. Según Einstein, los relojes en movimiento van más lentos. Los relojes de los satélites pierden 7 microsegundos al día respecto a los de la Tierra.',
      color: '#E74C3C',
      signo: 'más lentos',
    },
    {
      icono: '🌍',
      titulo: 'Relatividad general',
      subtitulo: 'Efecto de la gravedad',
      efecto: '+45 μs/día',
      explicacion: 'A 20.200 km, la gravedad es más débil. Los relojes en gravedad débil van más rápido. Los relojes de los satélites ganan 45 microsegundos al día.',
      color: '#2E86AB',
      signo: 'más rápidos',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Sin las correcciones de la relatividad de Einstein, el GPS acumularía un <strong>error de ~10 km cada día</strong>. La teoría de la relatividad no es abstracta — la usas cada vez que abres Google Maps.</p>
      </div>

      {/* Tarjetas de efectos relativistas */}
      <div className={styles.einsteinGrid}>
        {efectos.map((e, i) => (
          <div key={i} className={styles.einsteinCard}>
            <span className={styles.einsteinIcono} aria-hidden="true">{e.icono}</span>
            <h3 className={styles.einsteinTitulo}>{e.titulo}</h3>
            <span className={styles.einsteinSub}>{e.subtitulo}</span>
            <span className={styles.einsteinEfecto} style={{ color: e.color }}>{e.efecto}</span>
            <span className={styles.einsteinSigno}>Relojes van {e.signo}</span>
            <p className={styles.einsteinDesc}>{e.explicacion}</p>
          </div>
        ))}
      </div>

      {/* Balance neto */}
      <div className={styles.balanceCard}>
        <h3 className={styles.balanceTitulo}>Balance neto</h3>
        <div className={styles.balanceCalculo}>
          <div className={styles.balanceItem}>
            <span className={styles.balanceLabel}>Relatividad especial</span>
            <span className={styles.balanceValor} style={{ color: '#E74C3C' }}>-7 μs/día</span>
          </div>
          <div className={styles.balanceOperador}>+</div>
          <div className={styles.balanceItem}>
            <span className={styles.balanceLabel}>Relatividad general</span>
            <span className={styles.balanceValor} style={{ color: '#2E86AB' }}>+45 μs/día</span>
          </div>
          <div className={styles.balanceOperador}>=</div>
          <div className={`${styles.balanceItem} ${styles.balanceTotal}`}>
            <span className={styles.balanceLabel}>Corrección necesaria</span>
            <span className={styles.balanceValor} style={{ color: '#27ae60' }}>+38 μs/día</span>
          </div>
        </div>
      </div>

      {/* Antes vs después */}
      <div className={styles.antesCard}>
        <h3 className={styles.antesTitulo}>¿Qué pasaría sin la corrección?</h3>
        <div className={styles.antesGrid}>
          <div className={styles.antesItem}>
            <span className={styles.antesIcono} aria-hidden="true">❌</span>
            <span className={styles.antesLabel}>Sin Einstein</span>
            <span className={styles.antesValor} style={{ color: '#E74C3C' }}>~10 km/día de error</span>
            <span className={styles.antesDetalle}>Acumulativo. En una semana, 70 km de desvío. GPS completamente inútil.</span>
          </div>
          <div className={styles.antesItem}>
            <span className={styles.antesIcono} aria-hidden="true">✅</span>
            <span className={styles.antesLabel}>Con corrección</span>
            <span className={styles.antesValor} style={{ color: '#27ae60' }}>3-5 m de precisión</span>
            <span className={styles.antesDetalle}>Los relojes de los satélites se ajustan antes del lanzamiento para compensar el efecto relativista.</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Los ingenieros del GPS ajustan la frecuencia de los relojes atómicos de los satélites <strong>antes del lanzamiento</strong>: los ralentizan ligeramente para compensar los +38 μs/día. Cuando llegan a órbita, la relatividad los &ldquo;corrige&rdquo; y marcan el tiempo perfecto.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Precisión y más allá
// ─────────────────────────────────────────────

function SeccionPrecision() {
  const niveles = [
    { tipo: 'GPS estándar', precision: '3 - 5 m', uso: 'Navegación en coche, mapas móvil', icono: '📱' },
    { tipo: 'GPS diferencial (DGPS)', precision: '~1 m', uso: 'Agricultura de precisión, topografía', icono: '🌾' },
    { tipo: 'RTK (Real-Time Kinematic)', precision: '1 - 2 cm', uso: 'Construcción, drones profesionales', icono: '🏗️' },
  ];

  const problemas = [
    { nombre: 'Cañones urbanos', desc: 'Los edificios altos reflejan señales GPS, creando ecos que confunden al receptor.', icono: '🏙️' },
    { nombre: 'Túneles y parking', desc: 'Sin línea de visión directa a los satélites, no hay señal GPS posible.', icono: '🚇' },
    { nombre: 'Interferencia atmosférica', desc: 'La ionosfera y la troposfera ralentizan las señales, introduciendo errores.', icono: '🌧️' },
    { nombre: 'Jamming / spoofing', desc: 'Dispositivos que bloquean o falsifican señales GPS. Uso ilegal pero real.', icono: '⚠️' },
  ];

  const sistemas = [
    { nombre: 'GPS', pais: 'EE.UU.', satelites: 31, precision: '3-5 m', operativo: '1995', icono: '🇺🇸' },
    { nombre: 'Galileo', pais: 'Unión Europea', satelites: 28, precision: '1-3 m', operativo: '2016', icono: '🇪🇺' },
    { nombre: 'GLONASS', pais: 'Rusia', satelites: 24, precision: '4-7 m', operativo: '1993', icono: '🇷🇺' },
    { nombre: 'BeiDou', pais: 'China', satelites: 44, precision: '3-5 m', operativo: '2020', icono: '🇨🇳' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El GPS estándar tiene una precisión de <strong>3-5 metros</strong>, pero con técnicas avanzadas se puede llegar a <strong>2 centímetros</strong>. Y no solo existe el GPS americano: hay 4 sistemas globales operativos.</p>
      </div>

      {/* Niveles de precisión */}
      <div className={styles.nivelesGrid}>
        {niveles.map((n, i) => (
          <div key={i} className={styles.nivelCard}>
            <span className={styles.nivelIcono} aria-hidden="true">{n.icono}</span>
            <h3 className={styles.nivelTipo}>{n.tipo}</h3>
            <span className={styles.nivelPrecision}>{n.precision}</span>
            <span className={styles.nivelUso}>{n.uso}</span>
          </div>
        ))}
      </div>

      {/* Problemas del GPS */}
      <div className={styles.problemasCard}>
        <h3 className={styles.problemasTitulo}>¿Cuándo falla el GPS?</h3>
        <div className={styles.problemasGrid}>
          {problemas.map((p, i) => (
            <div key={i} className={styles.problemaItem}>
              <span className={styles.problemaIcono} aria-hidden="true">{p.icono}</span>
              <div className={styles.problemaTexto}>
                <strong>{p.nombre}</strong>
                <span>{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla comparativa de sistemas */}
      <div className={styles.tablaContainer}>
        <h3 className={styles.tablaTitulo}>Sistemas de navegación global (GNSS)</h3>
        <div className={styles.tablaResponsive}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Sistema</th>
                <th>País</th>
                <th>Satélites</th>
                <th>Precisión</th>
                <th>Operativo</th>
              </tr>
            </thead>
            <tbody>
              {sistemas.map((s, i) => (
                <tr key={i}>
                  <td><span aria-hidden="true">{s.icono}</span> {s.nombre}</td>
                  <td>{s.pais}</td>
                  <td>{s.satelites}</td>
                  <td>{s.precision}</td>
                  <td>{s.operativo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tablaNota}>Tu móvil moderno usa varios sistemas a la vez (multi-GNSS), mejorando la precisión a 1-2 m en buenas condiciones.</p>
      </div>

      <div className={styles.insight}>
        <p>
          La suma de los 4 sistemas GNSS pone <strong>más de {formatNumber(127, 0)} satélites</strong> de navegación sobre nuestras cabezas. Tu smartphone combina señales de varios sistemas simultáneamente para darte la mejor posición posible, incluso en condiciones difíciles.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorGpsPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('satelites');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'satelites': return <SeccionSatelites />;
      case 'trilateracion': return <SeccionTrilateracion />;
      case 'einstein': return <SeccionEinstein />;
      case 'precision': return <SeccionPrecision />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cómo Funciona el GPS</h1>
          <p className={styles.subtitle}>31 satélites, la velocidad de la luz y Einstein en tu bolsillo</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el GPS y la navegación"
          subtitle="Preguntas frecuentes y curiosidades"
          defaultOpen={false}
        >
          <h3>¿Quién inventó el GPS?</h3>
          <p>
            El GPS fue desarrollado por el <strong>Departamento de Defensa de EE.UU.</strong> durante la Guerra Fría.
            El primer satélite se lanzó en 1978 y el sistema se declaró completamente operativo en 1995.
            Inicialmente era solo militar; la señal civil se abrió completamente en el año 2000 cuando el
            presidente Clinton eliminó la degradación intencional de la señal (Selective Availability).
          </p>

          <h3>¿Funciona el GPS sin internet?</h3>
          <p>
            Sí. El GPS es un sistema <strong>completamente pasivo</strong>: tu móvil solo recibe señales de los
            satélites, no envía nada. No necesita Wi-Fi, datos móviles ni cobertura telefónica. Lo que sí necesita
            internet es descargar los mapas — por eso apps como Google Maps permiten descargar mapas offline.
          </p>

          <h3>¿Por qué Galileo si ya existe el GPS?</h3>
          <p>
            La Unión Europea desarrolló <strong>Galileo</strong> para no depender de un sistema controlado por
            el ejército estadounidense, que técnicamente podría degradar o apagar la señal civil. Galileo es
            civil por diseño, ofrece mejor precisión en Europa y está bajo control europeo.
          </p>

          <h3>¿Qué precisión tiene un reloj atómico?</h3>
          <p>
            Los relojes atómicos de los satélites GPS tienen una precisión de aproximadamente <strong>1 nanosegundo</strong> (una
            milmillonésima de segundo). Un error de 1 nanosegundo equivale a ~30 cm de error en posición.
            Los relojes más avanzados (como los de hidrógeno en Galileo) son aún más precisos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de ingeniería aeroespacial y física
            relativista con fines educativos. Los valores de precisión son aproximados y dependen de
            condiciones atmosféricas, geometría satelital, tipo de receptor y entorno local.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-gps')} />
        <ShareCard appName="visualizador-gps" />
        <Footer appName="visualizador-gps" />
      </div>
    </>
  );
}
