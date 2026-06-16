'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './SistemasEquilibrio.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

type SistemaId = 'vestibular' | 'visual' | 'propioceptivo';

interface Sistema {
  id: SistemaId;
  nombre: string;
  icono: string;
  color: string;
  organo: string;
  funcion: string;
  mecanismo: string;
  señales: string[];
  curiosidad: string;
  porcentaje: number;
}

const SISTEMAS: Sistema[] = [
  {
    id: 'vestibular',
    nombre: 'Sistema vestibular',
    icono: '👂',
    color: '#2E86AB',
    organo: 'Oído interno (laberinto)',
    funcion: 'Detecta la aceleración y la posición de la cabeza en el espacio',
    mecanismo:
      'El oído interno contiene el laberinto membranoso: tres canales semicirculares (detectan rotación) y dos órganos otolíticos —utrículo y sáculo— que detectan gravedad y movimiento lineal. Unas diminutas piedras de calcio llamadas otolitos se mueven con cada desplazamiento y estimulan células ciliadas que envían señales al cerebro.',
    señales: [
      'Inclinación de la cabeza (arriba/abajo, izquierda/derecha)',
      'Velocidad y dirección de giro',
      'Aceleración y frenada',
      'Posición vertical respecto a la gravedad',
    ],
    curiosidad:
      'Los canales semicirculares son perpendiculares entre sí, como los tres ejes X, Y, Z. Así el cerebro puede calcular cualquier movimiento tridimensional.',
    porcentaje: 40,
  },
  {
    id: 'visual',
    nombre: 'Sistema visual',
    icono: '👁️',
    color: '#48A9A6',
    organo: 'Ojos y corteza visual',
    funcion: 'Proporciona información sobre el entorno y la posición relativa del cuerpo',
    mecanismo:
      'La retina detecta el movimiento del campo visual y la posición del horizonte. El cerebro compara lo que ve con lo que le dicen los otros dos sistemas. Si hay discordancia (por ejemplo, en un barco con ojos cerrados), se produce náusea. La visión periférica es especialmente importante para estabilizar la postura.',
    señales: [
      'Posición del horizonte visual',
      'Movimiento del entorno (flujo óptico)',
      'Distancia a objetos de referencia',
      'Velocidad de desplazamiento percibida',
    ],
    curiosidad:
      'Cerrar los ojos aumenta el balanceo corporal un 50-70%. Por eso la prueba de Romberg (ojos cerrados, pies juntos) revela déficit vestibular o propioceptivo.',
    porcentaje: 25,
  },
  {
    id: 'propioceptivo',
    nombre: 'Sistema propioceptivo',
    icono: '🦵',
    color: '#7FB3D3',
    organo: 'Músculos, articulaciones, columna y pies',
    funcion: 'Informa al cerebro de la posición de cada parte del cuerpo',
    mecanismo:
      'Millones de receptores sensoriales —husos musculares, órganos de Golgi, mecanorreceptores articulares y plantares— envían señales constantes sobre tensión, longitud muscular, ángulo articular y presión en la planta del pie. La columna vertebral y el cuello son especialmente ricos en receptores porque la posición de la cabeza es crítica para el equilibrio.',
    señales: [
      'Ángulo de cada articulación',
      'Tensión en músculos y tendones',
      'Presión distribuida en la planta del pie',
      'Posición de la columna y curvatura cervical',
    ],
    curiosidad:
      'Los mecanorreceptores del pie son tan precisos que detectan inclinaciones del suelo de tan solo 0,5°. Por eso caminar descalzo sobre superficies irregulares mejora el equilibrio.',
    porcentaje: 35,
  },
];

interface Perturbacion {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  sistemaAfectado: SistemaId[];
  ejemplo: string;
}

const PERTURBACIONES: Perturbacion[] = [
  {
    id: 'oscuridad',
    nombre: 'Oscuridad total',
    icono: '🌑',
    descripcion: 'Sin información visual, el cerebro depende el 100% del sistema vestibular y la propiocepción. El balanceo aumenta notablemente.',
    sistemaAfectado: ['visual'],
    ejemplo: 'Levantarse de noche sin luz → más riesgo de caída si vestibular o propiocepción están debilitados.',
  },
  {
    id: 'superficie-inestable',
    nombre: 'Superficie inestable',
    icono: '🚢',
    descripcion: 'La propiocepción del pie envía señales caóticas. El cerebro recibe información contradictoria y tiene que compensar con más trabajo visual y vestibular.',
    sistemaAfectado: ['propioceptivo'],
    ejemplo: 'Barco en movimiento, colchón de espuma, arena suelta → los ojos se vuelven críticos para no caer.',
  },
  {
    id: 'movimiento-cabeza',
    nombre: 'Giro brusco de cabeza',
    icono: '↩️',
    descripcion: 'Los canales semicirculares se activan intensamente. Si la señal no coincide con lo que los ojos ven (pantalla estática), puede provocar mareo.',
    sistemaAfectado: ['vestibular'],
    ejemplo: 'Mirar rápidamente de un lado a otro en el metro → vértigo momentáneo en personas sensibles.',
  },
  {
    id: 'tension-cervical',
    nombre: 'Tensión cervical crónica',
    icono: '🪨',
    descripcion: 'Los receptores del cuello envían señales distorsionadas sobre la posición de la cabeza. El cerebro recibe información errónea de propiocepción → mareo postural.',
    sistemaAfectado: ['propioceptivo', 'vestibular'],
    ejemplo: 'Contractura cervical severa o escoliosis con postura adelantada de cabeza → sensación constante de desequilibrio.',
  },
  {
    id: 'envejecimiento',
    nombre: 'Envejecimiento natural',
    icono: '👴',
    descripcion: 'Con la edad, los tres sistemas pierden precisión: el oído interno pierde células ciliadas, la vista disminuye y los receptores del pie se vuelven menos sensibles.',
    sistemaAfectado: ['vestibular', 'visual', 'propioceptivo'],
    ejemplo: 'La inestabilidad postural en mayores suele ser multifactorial: deterioro simultáneo de los tres sistemas.',
  },
];

export default function VisualizadorSistemasEquilibrio() {
  const [sistemaActivo, setSistemaActivo] = useState<SistemaId>('vestibular');
  const [perturbacionActiva, setPerturbacionActiva] = useState<string | null>(null);

  const sistema = SISTEMAS.find((s) => s.id === sistemaActivo)!;
  const perturbacion = PERTURBACIONES.find((p) => p.id === perturbacionActiva) ?? null;

  const getSistemaAfectado = (id: SistemaId) =>
    perturbacion ? perturbacion.sistemaAfectado.includes(id) : false;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Cómo el Cuerpo Mantiene el Equilibrio</h1>
        <p>Los tres sistemas que trabajan juntos para que no caigamos</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Diagrama de los 3 sistemas */}
        <section className={styles.diagramaSeccion}>
          <h2 className={styles.sectionTitle}>Los tres sistemas del equilibrio</h2>
          <p className={styles.subtitulo}>
            El cerebro integra señales de tres fuentes distintas. Pulsa cada sistema para explorar cómo funciona.
          </p>

          <div className={styles.trianguloWrapper}>
            <div className={styles.trianguloCentro}>
              <div className={styles.cerebroIcono} aria-hidden="true">🧠</div>
              <span className={styles.cerebroLabel}>Cerebro</span>
              <span className={styles.cerebroSublabel}>integra las señales</span>
            </div>

            {SISTEMAS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.sistemaBtn} ${styles[`sistemaBtn_${s.id}`]} ${sistemaActivo === s.id ? styles.sistemaActivo : ''} ${getSistemaAfectado(s.id) ? styles.sistemaAfectado : ''}`}
                onClick={() => setSistemaActivo(s.id)}
                style={{ '--sistema-color': s.color } as React.CSSProperties}
                aria-pressed={sistemaActivo === s.id}
              >
                <span className={styles.sistemaIcono} aria-hidden="true">{s.icono}</span>
                <span className={styles.sistemaNombre}>{s.nombre}</span>
                <span className={styles.sistemaPct}>{s.porcentaje}%</span>
              </button>
            ))}

            {/* Líneas de conexión (decorativas) */}
            <div className={styles.linea} aria-hidden="true" />
            <div className={`${styles.linea} ${styles.linea2}`} aria-hidden="true" />
            <div className={`${styles.linea} ${styles.linea3}`} aria-hidden="true" />
          </div>

          {/* Barra de contribución */}
          <div className={styles.barraWrapper}>
            <p className={styles.barraLabel}>Contribución estimada al equilibrio en condiciones normales:</p>
            <div className={styles.barra}>
              {SISTEMAS.map((s) => (
                <div
                  key={s.id}
                  className={styles.barraSegmento}
                  style={{ width: `${s.porcentaje}%`, background: s.color }}
                  title={`${s.nombre}: ~${s.porcentaje}%`}
                />
              ))}
            </div>
            <div className={styles.barraLeyenda}>
              {SISTEMAS.map((s) => (
                <span key={s.id} className={styles.leyendaItem}>
                  <span className={styles.leyendaDot} style={{ background: s.color }} />
                  {s.nombre.replace('Sistema ', '')} {s.porcentaje}%
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Detalle del sistema seleccionado */}
        <section className={styles.detalleSeccion} style={{ borderColor: sistema.color }}>
          <div className={styles.detalleHeader}>
            <span className={styles.detalleIcono} aria-hidden="true">{sistema.icono}</span>
            <div>
              <h3 className={styles.detalleNombre}>{sistema.nombre}</h3>
              <p className={styles.detalleOrgano}><span aria-hidden="true">📍</span> {sistema.organo}</p>
            </div>
          </div>

          <p className={styles.detalleFuncion}>{sistema.funcion}</p>

          <div className={styles.detalleMecanismo}>
            <h4>¿Cómo funciona?</h4>
            <p>{sistema.mecanismo}</p>
          </div>

          <div className={styles.detalleSenales}>
            <h4>Señales que envía al cerebro:</h4>
            <ul>
              {sistema.señales.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className={styles.detalleCuriosidad}>
            <span aria-hidden="true">💡</span>
            <p>{sistema.curiosidad}</p>
          </div>
        </section>

        {/* Perturbaciones */}
        <section className={styles.perturbacionSeccion}>
          <h2 className={styles.sectionTitle}>¿Qué ocurre cuando un sistema falla?</h2>
          <p className={styles.subtitulo}>
            El cerebro puede compensar si uno de los sistemas da información errónea, pero si coinciden varios fallos, el equilibrio se compromete.
          </p>

          <div className={styles.perturbacionesGrid}>
            {PERTURBACIONES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.perturbacionBtn} ${perturbacionActiva === p.id ? styles.perturbacionActiva : ''}`}
                onClick={() => setPerturbacionActiva(perturbacionActiva === p.id ? null : p.id)}
                aria-pressed={perturbacionActiva === p.id}
              >
                <span className={styles.perturbacionIcono} aria-hidden="true">{p.icono}</span>
                <span className={styles.perturbacionNombre}>{p.nombre}</span>
              </button>
            ))}
          </div>

          {perturbacion && (
            <div className={styles.perturbacionDetalle}>
              <div className={styles.perturbacionHeader}>
                <span aria-hidden="true">{perturbacion.icono}</span>
                <h3>{perturbacion.nombre}</h3>
              </div>
              <p>{perturbacion.descripcion}</p>

              <div className={styles.sistemasBadges}>
                <span className={styles.badgeLabel}>Sistema(s) afectado(s):</span>
                {perturbacion.sistemaAfectado.map((sid) => {
                  const s = SISTEMAS.find((x) => x.id === sid)!;
                  return (
                    <span key={sid} className={styles.sistemaBadge} style={{ background: s.color }}>
                      <span aria-hidden="true">{s.icono}</span> {s.nombre.replace('Sistema ', '')}
                    </span>
                  );
                })}
              </div>

              <div className={styles.perturbacionEjemplo}>
                <span aria-hidden="true">📋</span>
                <p>{perturbacion.ejemplo}</p>
              </div>
            </div>
          )}
        </section>

        {/* Clave pedagógica */}
        <section className={styles.warningBox}>
          <h3><span aria-hidden="true">🔑</span> La redundancia como seguridad</h3>
          <p>
            El cerebro nunca confía en un solo sistema. Compara permanentemente las tres fuentes de información y detecta incongruencias. Si el vestibular dice &ldquo;estoy girando&rdquo; pero los ojos ven estático, el resultado es mareo. Si la propiocepción del cuello envía señales distorsionadas por tensión muscular, el cerebro puede interpretar movimiento donde no lo hay.
          </p>
          <p>
            Esta redundancia es una ventaja: la pérdida parcial de un sistema puede compensarse con los otros dos mediante entrenamiento y rehabilitación.
          </p>
        </section>

        <EducationalSection
          title="Guía completa del equilibrio corporal"
          subtitle="Fisiología, curiosidades y contexto científico"
        >
          <div className={styles.educativo}>
            <h3>Comparativa de los tres sistemas</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Sistema</th>
                    <th>Órgano principal</th>
                    <th>Qué detecta</th>
                    <th>Punto débil</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Vestibular</td>
                    <td>Oído interno</td>
                    <td>Aceleración y gravedad</td>
                    <td>Vértigo, laberintitis</td>
                  </tr>
                  <tr>
                    <td>Visual</td>
                    <td>Retina + corteza</td>
                    <td>Posición relativa y horizonte</td>
                    <td>Oscuridad, ilusiones ópticas</td>
                  </tr>
                  <tr>
                    <td>Propioceptivo</td>
                    <td>Músculos, articulaciones, pie</td>
                    <td>Posición y tensión corporal</td>
                    <td>Contracturas, deformidad, edad</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Casos de uso de este visualizador</h3>
            <ul>
              <li><strong>Estudiantes de ciencias de la salud:</strong> comprender la fisiología del equilibrio</li>
              <li><strong>Educadores:</strong> explicar de forma visual cómo interactúan los tres sistemas</li>
              <li><strong>Curiosidad general:</strong> entender por qué nos mareamos en el barco, en la oscuridad o al girar rápido</li>
              <li><strong>Cuidadores:</strong> contexto educativo sobre por qué el equilibrio se vuelve más frágil con la edad</li>
            </ul>

            <h3>Preguntas frecuentes</h3>
            <div className={styles.faq}>
              <details>
                <summary>¿Por qué me mareo en el barco pero no en el coche?</summary>
                <p>En un barco, los ojos ven el interior estático, pero el vestibular y la propiocepción sienten el movimiento del oleaje. En un coche la incongruencia es menor porque ves el paisaje moviéndose. El mareo por movimiento es el resultado de esta &ldquo;discordancia sensorial&rdquo;.</p>
              </details>
              <details>
                <summary>¿Se puede entrenar el equilibrio?</summary>
                <p>Sí. La rehabilitación vestibular, los ejercicios de equilibrio sobre superficies inestables y el entrenamiento propioceptivo mejoran significativamente la estabilidad. El cerebro tiene alta plasticidad y puede reaprender a integrar mejor las señales.</p>
              </details>
              <details>
                <summary>¿Por qué los mayores tienen más riesgo de caída?</summary>
                <p>Con la edad, los tres sistemas pierden precisión simultáneamente: el oído interno pierde células ciliadas, la agudeza visual disminuye y los receptores musculares y plantares se vuelven menos sensibles. Además, el cerebro tarda más en procesar e integrar las señales. Esto hace que la compensación sea más lenta ante un desequilibrio brusco.</p>
              </details>
              <details>
                <summary>¿Qué es el mareo cervicogénico?</summary>
                <p>Es el mareo causado por señales erróneas que provienen de los receptores del cuello (propiocepción cervical). Cuando los músculos cervicales están muy contracturados o la postura de la cabeza está desalineada crónicamente, los receptores envían información distorsionada al cerebro sobre la posición de la cabeza. El resultado es una sensación de inestabilidad o mareo postural, especialmente al mover la cabeza o mantener una postura prolongada.</p>
              </details>
              <details>
                <summary>¿Los tres sistemas tienen siempre el mismo peso?</summary>
                <p>No. El peso relativo de cada sistema varía según el contexto. En total oscuridad, el vestibular y la propiocepción asumen más protagonismo. En una superficie muy inestable, el sistema visual se vuelve dominante. El cerebro redistribuye la confianza en cada fuente en tiempo real según la fiabilidad percibida de sus señales.</p>
              </details>
            </div>

            <h3>Pasos para comprender el equilibrio de un vistazo</h3>
            <ol>
              <li>El cerebro recibe señales continuas de los tres sistemas en paralelo</li>
              <li>Compara si son coherentes entre sí (integración sensorial)</li>
              <li>Si coinciden → estabilidad; si discrepan → mareo o corrección postural</li>
              <li>El cerebellum (cerebelo) es el árbitro: coordina la respuesta motora</li>
              <li>El sistema puede deteriorarse (edad, lesión) o mejorarse (rehabilitación)</li>
            </ol>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistemas-equilibrio')} />
        <ShareCard appName="visualizador-sistemas-equilibrio" />
      </main>

      <Footer appName="visualizador-sistemas-equilibrio" />
    </div>
  );
}
