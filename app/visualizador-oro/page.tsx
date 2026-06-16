'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorOro.module.css';

/* ─── Datos ─────────────────────────────────────────── */

interface MetalNobleza {
  simbolo: string;
  nombre: string;
  potencial: number;
  color: string;
  descripcion: string;
}

const METALES_NOBLEZA: MetalNobleza[] = [
  { simbolo: 'Zn', nombre: 'Zinc', potencial: -0.76, color: '#7f8c8d', descripcion: 'Muy reactivo — se oxida rápido' },
  { simbolo: 'Fe', nombre: 'Hierro', potencial: -0.44, color: '#c0392b', descripcion: 'Herrumbre (Fe₂O₃)' },
  { simbolo: 'Ni', nombre: 'Níquel', potencial: -0.25, color: '#8e44ad', descripcion: 'Leve oxidación superficial' },
  { simbolo: 'Cu', nombre: 'Cobre', potencial: +0.34, color: '#e67e22', descripcion: 'Pátina verde (CuCO₃) con H₂S' },
  { simbolo: 'Ag', nombre: 'Plata', potencial: +0.80, color: '#95a5a6', descripcion: 'Se oscurece con H₂S, ozono' },
  { simbolo: 'Pt', nombre: 'Platino', potencial: +1.19, color: '#bdc3c7', descripcion: 'Casi inerte, algunas reacciones' },
  { simbolo: 'Au', nombre: 'Oro', potencial: +1.50, color: '#D4A017', descripcion: 'Metal más noble — no reacciona' },
];

interface UsoElectronica {
  icono: string;
  sector: string;
  dato: string;
  detalle: string;
}

const USOS_ELECTRONICA: UsoElectronica[] = [
  {
    icono: '📱',
    sector: 'Smartphones',
    dato: '~0,03 g por dispositivo',
    detalle: 'Conectores, placa base y chips SIM. En 2023 se fabricaron ~1.200 millones de smartphones, usando ~36 toneladas de Au.',
  },
  {
    icono: '💻',
    sector: 'Circuitos impresos',
    dato: '~30 g por kg de PCB',
    detalle: 'La chatarra electrónica (e-waste) contiene más oro por tonelada que la mayoría de minas en operación.',
  },
  {
    icono: '✈️',
    sector: 'Aeroespacial',
    dato: 'Visor de casco espacial',
    detalle: 'Los trajes de la NASA tienen una capa ultrafina de Au en el visor: refleja radiación UV e infrarroja sin oscurecer la visión.',
  },
  {
    icono: '🏢',
    sector: 'Ventanas de avión',
    dato: 'Capa de 15 nm',
    detalle: 'Boeing 787 y Airbus A380: ventanas con Au para disipar electricidad estática y reflejar calor solar.',
  },
  {
    icono: '🔌',
    sector: 'Conectores premium',
    dato: 'Chapado en oro',
    detalle: 'Cables HDMI, RCA, USB profesional: el Au evita la oxidación de los contactos, manteniendo resistencia eléctrica constante.',
  },
];

interface UsoMedicina {
  titulo: string;
  icono: string;
  contenido: string;
  detalle: string;
}

const USOS_MEDICINA: UsoMedicina[] = [
  {
    titulo: 'Artritis reumatoide',
    icono: '🦴',
    contenido: 'Sales de oro (auranofin, aurotioglucosa) usadas desde los años 20 como "DMARDs" (fármacos modificadores de enfermedad). Reducen la inflamación en articulaciones.',
    detalle: 'Mecanismo parcialmente desconocido. El Au⁺ interfiere con la función de los macrófagos y la producción de citocinas proinflamatorias. Actualmente en investigación para VIH y cáncer.',
  },
  {
    titulo: 'Test de embarazo (nanotecnología)',
    icono: '🤰',
    contenido: 'La línea roja de un test de embarazo son nanopartículas de oro (AuNP, 20-40 nm) conjugadas con anticuerpos anti-hCG. Es el ejemplo más cotidiano de nanotecnología del oro.',
    detalle: 'Cuando la hCG (hormona del embarazo) está presente, se une a los anticuerpos → las AuNP se agregan en la zona de prueba → color rojo visible. El mismo principio fue usado en tests COVID-19 laterales.',
  },
  {
    titulo: 'Fototermia contra el cáncer',
    icono: '🔬',
    contenido: 'Nanopartículas de oro (1-100 nm) se acumulan preferencialmente en tumores sólidos. Iluminadas con láser infrarrojo cercano (NIR), se calientan y destruyen las células cancerosas.',
    detalle: 'Las AuNP absorben selectivamente luz NIR y la convierten en calor local (~45°C en el tumor). Al ser inertes, el cuerpo las tolera. En ensayos clínicos para próstata, cabeza y cuello.',
  },
  {
    titulo: 'Coronas dentales',
    icono: '🦷',
    contenido: 'Aleación Au-Pt (60-70% Au) usada en coronas y puentes dentales. Biocompatible, no corrosiva en el ambiente bucal ácido y maleable para un ajuste preciso.',
    detalle: 'El oro es el material más biocompatible para restauraciones dentales. Su conductividad térmica alta puede causar sensibilidad inicial, pero no reacciona con saliva, alimentos ni bacterias.',
  },
];

/* ─── Componente ─────────────────────────────────────── */

export default function VisualizadorOro() {
  const [mostrarSinRelatividad, setMostrarSinRelatividad] = useState<boolean>(false);
  const [medicinAbierta, setMedicinaAbierta] = useState<number | null>(null);

  const toggleMedicina = (index: number) => {
    setMedicinaAbierta((prev) => (prev === index ? null : index));
  };

  /* Escala de la barra de potenciales */
  const minPot = -1.0;
  const maxPot = +1.8;
  const rangePot = maxPot - minPot;
  const getPosicion = (pot: number) => ((pot - minPot) / rangePot) * 100;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">🥇</div>
        <h1>El Oro: Por Qué la Relatividad Explica su Color y su Nobleza</h1>
        <p>La física especial de Einstein explica por qué el oro no se oxida, por qué es amarillo y por qué está en cada circuito electrónico</p>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Átomo de oro ──────────────────────── */}
      <section className={styles.section} aria-labelledby="titulo-atomo">
        <h2 id="titulo-atomo" className={styles.tituloSeccion}>El Átomo de Oro y su Configuración Electrónica</h2>
        <p className={styles.subtituloSeccion}>Número atómico 79, símbolo Au (del latín <em>aurum</em>), masa atómica 196,97 u</p>

        <div className={styles.configElectronica}>
          <div className={styles.orbitalDiagram} aria-label="Diagrama de configuración electrónica del oro">
            {/* Núcleo */}
            <div className={styles.nucleo} aria-label="Núcleo: 79 protones">
              <span className={styles.nucleoTexto}>Au</span>
              <span className={styles.nucleoSub}>79p⁺</span>
            </div>

            {/* Capas internas resumidas */}
            <div className={styles.capaXe} aria-label="Core [Xe]: capas internas 1s a 5p">
              <span className={styles.capaXeLabel}>[Xe]</span>
              <span className={styles.capaXeSub}>54 electrones internos</span>
            </div>

            {/* Subcapa 4f */}
            <div className={styles.subcapa4f} aria-label="Subcapa 4f: 14 electrones">
              <span className={styles.subcapaLabel}>4f¹⁴</span>
              <div className={styles.electronRow}>
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className={styles.electron} aria-hidden="true">e⁻</span>
                ))}
              </div>
            </div>

            {/* Subcapa 5d completa — resaltada */}
            <div className={`${styles.subcapa5d} ${styles.subcapaDestacada}`} aria-label="Subcapa 5d: 10 electrones (completa)">
              <span className={styles.subcapaLabel}>5d¹⁰ ✓</span>
              <div className={styles.electronRow}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={styles.electronDestacado} aria-hidden="true">e⁻</span>
                ))}
              </div>
              <span className={styles.subcapaNota}>Subcapa completa</span>
            </div>

            {/* Subcapa 6s — la clave */}
            <div className={`${styles.subcapa6s} ${styles.subcapaOro}`} aria-label="Subcapa 6s: 1 electrón (clave relativista)">
              <span className={styles.subcapaLabel}>6s¹ ⚡</span>
              <div className={styles.electronRow}>
                <span className={styles.electronOro} aria-hidden="true">e⁻</span>
              </div>
              <span className={styles.subcapaNota}>El electrón de valencia — clave relativista</span>
            </div>
          </div>

          {/* Comparativa grupo 11 */}
          <div className={styles.comparativaGrupo11} aria-label="Comparativa del grupo 11: Cu, Ag y Au">
            <h3 className={styles.comparativaTitulo}>Los tres metales del Grupo 11</h3>
            <p className={styles.comparativaSubtitulo}>Misma estructura de valencia (nd¹⁰ (n+1)s¹) — resultados muy diferentes</p>
            <div className={styles.comparativaGrid}>
              {[
                { simbolo: 'Cu', nombre: 'Cobre', config: '[Ar] 3d¹⁰ 4s¹', color: '#e67e22', nota: 'Sin efecto relativista apreciable → rojizo' },
                { simbolo: 'Ag', nombre: 'Plata', config: '[Kr] 4d¹⁰ 5s¹', color: '#95a5a6', nota: 'Efecto relativista moderado → plateado' },
                { simbolo: 'Au', nombre: 'Oro', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', color: '#D4A017', nota: 'Máximo efecto relativista → amarillo y noble' },
              ].map((metal) => (
                <div key={metal.simbolo} className={styles.metalCard} style={{ borderTopColor: metal.color }}>
                  <span className={styles.metalSimbol} style={{ color: metal.color }}>{metal.simbolo}</span>
                  <span className={styles.metalNombre}>{metal.nombre}</span>
                  <code className={styles.metalConfig}>{metal.config}</code>
                  <span className={styles.metalNota}>{metal.nota}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 2: Efecto Relativista ───────────────── */}
      <section className={styles.section} aria-labelledby="titulo-relativista">
        <h2 id="titulo-relativista" className={styles.tituloSeccion}>El Efecto Relativista: Einstein en el Oro</h2>
        <p className={styles.subtituloSeccion}>La sección más sorprendente — la física especial de 1905 explica la química del oro</p>

        <div className={styles.relativistaWrapper}>
          <div className={styles.velocidadIndicator} aria-label="El electrón 6s del oro viaja al 58% de la velocidad de la luz">
            <div className={styles.velocidadLabel}>Velocidad del electrón 6s del oro</div>
            <div className={styles.velocidadBarra}>
              <div className={styles.velocidadRelleno} style={{ width: '58%' }} />
              <span className={styles.velocidadValor}>0,58 c</span>
            </div>
            <div className={styles.velocidadSub}>58% de la velocidad de la luz (174.000 km/s)</div>
          </div>

          <div className={styles.causalChain} aria-label="Cadena causal del efecto relativista">
            {[
              { numero: '1', titulo: 'Núcleo masivo', descripcion: '79 protones atraen fuertemente al electrón 6s, que orbita muy cerca del núcleo.' },
              { numero: '2', titulo: 'Alta velocidad', descripcion: 'La órbita compacta implica velocidades cercanas a 0,58c. A esa velocidad, la relatividad especial es ineludible.' },
              { numero: '3', titulo: 'Masa relativista aumenta', descripcion: 'E = mc²: a ~0,58c, la masa relativista del electrón es ~1,22 veces la masa en reposo.' },
              { numero: '4', titulo: 'Orbital 6s se contrae', descripcion: 'Mayor masa → radio de Bohr menor → el orbital 6s es ~10% más pequeño y de menor energía que si no hubiera relatividad.' },
            ].map((paso) => (
              <div key={paso.numero} className={styles.causalPaso}>
                <div className={styles.causalNumero} aria-hidden="true">{paso.numero}</div>
                <div className={styles.causalTexto}>
                  <strong>{paso.titulo}</strong>
                  <p>{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.contraccionVisual} aria-label="Consecuencias de la contracción del orbital 6s">
            <h3 className={styles.contraccionTitulo}>Consecuencias de la contracción del orbital 6s</h3>
            <div className={styles.consecuenciasGrid}>
              <div className={styles.consecuenciaCard}>
                <span className={styles.consecuenciaIcono} aria-hidden="true">🛡️</span>
                <h4>Nobleza química</h4>
                <p>El 6s queda tan estable y contraído que el oro no cede su electrón fácilmente. No reacciona con O₂, H₂O ni ácidos comunes. El metal más noble.</p>
              </div>
              <div className={styles.consecuenciaCard}>
                <span className={styles.consecuenciaIcono} aria-hidden="true">🟡</span>
                <h4>Color amarillo</h4>
                <p>La contracción del 6s reduce la diferencia energética con el 5d. La transición 5d→6s absorbe fotones de luz azul-violeta y refleja amarillo-naranja.</p>
              </div>
              <div className={styles.consecuenciaCard}>
                <span className={styles.consecuenciaIcono} aria-hidden="true">🌡️</span>
                <h4>Punto de fusión bajo</h4>
                <p>1064°C — bajo para un metal tan pesado (Pt: 1768°C, W: 3422°C). El 6s contraído forma un enlace metálico menos fuerte.</p>
              </div>
            </div>
          </div>

          {/* Toggle sin relatividad */}
          <div className={styles.relatividadToggleSection}>
            <button
              type="button"
              className={styles.btnRelatividad}
              onClick={() => setMostrarSinRelatividad((v) => !v)}
              aria-expanded={mostrarSinRelatividad}
              aria-pressed={mostrarSinRelatividad}
              aria-controls="panel-sin-relatividad"
            >
              {mostrarSinRelatividad ? '▲ Ocultar comparativa' : '▼ ¿Qué pasaría SIN la relatividad?'}
            </button>

            {mostrarSinRelatividad && (
              <div id="panel-sin-relatividad" className={styles.sinRelatividadPanel} role="region" aria-label="Comparativa sin relatividad">
                <h4 className={styles.sinRelatividadTitulo}>El universo alternativo sin relatividad</h4>
                <div className={styles.sinRelatividadGrid}>
                  <div className={styles.sinRelatividadCard}>
                    <div className={styles.sinRelatividadHeader} style={{ backgroundColor: '#D4A017' }}>
                      <span>Oro real (con relatividad)</span>
                    </div>
                    <ul className={styles.sinRelatividadLista}>
                      <li>Color amarillo brillante</li>
                      <li>No se oxida ni reacciona</li>
                      <li>Punto de fusión: 1064°C</li>
                      <li>Conductor excelente y estable</li>
                    </ul>
                  </div>
                  <div className={styles.sinRelatividadCard}>
                    <div className={styles.sinRelatividadHeader} style={{ backgroundColor: '#95a5a6' }}>
                      <span>Oro hipotético (sin relatividad)</span>
                    </div>
                    <ul className={styles.sinRelatividadLista}>
                      <li>Color plateado (como la plata)</li>
                      <li>Más reactivo, podría oxidarse</li>
                      <li>Punto de fusión más alto</li>
                      <li>Propiedades similares a la plata</li>
                    </ul>
                  </div>
                </div>
                <p className={styles.sinRelatividadNota}>
                  Si la plata tuviera el mismo efecto relativista que el oro → sería amarilla. Si el oro no tuviera relatividad → sería plateado. La relatividad literalmente colorea el universo.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Sección 3: Nobleza química ───────────────────── */}
      <section className={styles.section} aria-labelledby="titulo-nobleza">
        <h2 id="titulo-nobleza" className={styles.tituloSeccion}>Por Qué el Oro No se Oxida: Escala de Nobleza</h2>
        <p className={styles.subtituloSeccion}>Potenciales de reducción estándar (E°) — cuanto mayor, más noble</p>

        <div className={styles.noblezaScale} aria-label="Escala de nobleza de metales según potencial de reducción">
          <div className={styles.noblezaEje}>
            <span className={styles.noblezaEjeMin}>← Reactivo (E° bajo)</span>
            <span className={styles.noblezaEjeTitulo}>Potencial estándar de reducción (V)</span>
            <span className={styles.noblezaEjeMax}>Noble (E° alto) →</span>
          </div>

          <div className={styles.noblezaBarraContenedor} role="list">
            {METALES_NOBLEZA.map((metal) => (
              <div key={metal.simbolo} className={styles.metalBar} role="listitem">
                <div className={styles.metalBarLabel}>
                  <span className={styles.metalBarSimbol}>{metal.simbolo}</span>
                  <span className={styles.metalBarNombre}>{metal.nombre}</span>
                </div>
                <div className={styles.metalBarTrack} aria-label={`${metal.nombre}: ${metal.potencial > 0 ? '+' : ''}${metal.potencial} V`}>
                  <div
                    className={styles.metalBarFill}
                    style={{
                      width: `${getPosicion(metal.potencial)}%`,
                      backgroundColor: metal.color,
                    }}
                  />
                  <span className={styles.metalBarValor}>{metal.potencial > 0 ? '+' : ''}{metal.potencial} V</span>
                </div>
                <span className={styles.metalBarDesc}>{metal.descripcion}</span>
              </div>
            ))}
          </div>

          <div className={styles.aguaRegiaNote} role="note">
            <span aria-hidden="true">⚗️</span>
            <div>
              <strong>Solo el agua regia disuelve el oro:</strong> mezcla de HNO₃ + HCl (ratio 1:3 volumen). El ácido nítrico oxida el Au y el HCl forma ión cloroaúrico AuCl₄⁻ estable, tirando del equilibrio. Es tan inusual que su nombre significa &quot;agua real&quot; en latín medieval.
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 4: Electrónica ───────────────────────── */}
      <section className={styles.section} aria-labelledby="titulo-electronica">
        <h2 id="titulo-electronica" className={styles.tituloSeccion}>El Oro en Electrónica: Por Qué Vale su Precio</h2>
        <p className={styles.subtituloSeccion}>La inercia química del oro lo hace insustituible en componentes de precisión</p>

        <div className={styles.electronicsGrid} role="list">
          {USOS_ELECTRONICA.map((uso) => (
            <div key={uso.sector} className={styles.useCard} role="listitem">
              <span className={styles.useCardIcono} aria-hidden="true">{uso.icono}</span>
              <h3 className={styles.useCardSector}>{uso.sector}</h3>
              <p className={styles.useCardDato}>{uso.dato}</p>
              <p className={styles.useCardDetalle}>{uso.detalle}</p>
            </div>
          ))}
        </div>

        <div className={styles.ewasteNote} role="note">
          <span aria-hidden="true">♻️</span>
          <div>
            <strong>Minería urbana (e-waste):</strong> Una tonelada de smartphones contiene ~300 g de Au — una mina moderna extrae 1-5 g/tonelada de roca. El reciclaje electrónico es la &quot;mina&quot; más rica del mundo.
          </div>
        </div>
      </section>

      {/* ── Sección 5: Medicina ──────────────────────────── */}
      <section className={styles.section} aria-labelledby="titulo-medicina">
        <h2 id="titulo-medicina" className={styles.tituloSeccion}>Medicina con Oro</h2>
        <p className={styles.subtituloSeccion}>De las sales de oro del siglo XX a las nanopartículas del siglo XXI</p>

        <div className={styles.medicinaSection} role="list">
          {USOS_MEDICINA.map((uso, index) => {
            const abierta = medicinAbierta === index;
            return (
              <div key={uso.titulo} className={styles.medicinaCard} role="listitem">
                <button
                  type="button"
                  className={styles.medicnaToggle}
                  onClick={() => toggleMedicina(index)}
                  aria-expanded={abierta}
                  aria-controls={`medicina-panel-${index}`}
                >
                  <span aria-hidden="true">{uso.icono}</span>
                  <span className={styles.medicnaToggleTitulo}>{uso.titulo}</span>
                  <span className={styles.medicnaToggleFlecha} aria-hidden="true">{abierta ? '▲' : '▼'}</span>
                </button>
                <p className={styles.medicinaResumen}>{uso.contenido}</p>
                {abierta && (
                  <div id={`medicina-panel-${index}`} className={styles.nanoparticula} role="region" aria-label={`Detalles: ${uso.titulo}`}>
                    <p>{uso.detalle}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.testEmbarazoVisual} aria-label="Cómo funciona un test de embarazo con nanopartículas de oro">
          <h3 className={styles.testTitulo}>¿Cómo funciona el test de embarazo? (Nanotecnología cotidiana)</h3>
          <div className={styles.testSteps}>
            {[
              { paso: '1', texto: 'La orina fluye por la tira de nitrocelulosa', color: '#3498db' },
              { paso: '2', texto: 'Las AuNP (20 nm) conjugadas con anticuerpos anti-hCG se activan', color: '#D4A017' },
              { paso: '3', texto: 'Si hay hCG (embarazo) → los complejos AuNP-anticuerpo-hCG se capturan en la línea T', color: '#27ae60' },
              { paso: '4', texto: 'Las AuNP acumuladas forman una banda ROJA visible — es el oro que ves', color: '#c0392b' },
            ].map((paso) => (
              <div key={paso.paso} className={styles.testStep}>
                <div className={styles.testStepNum} style={{ backgroundColor: paso.color }} aria-hidden="true">{paso.paso}</div>
                <p className={styles.testStepTexto}>{paso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EducationalSection ───────────────────────────── */}
      <EducationalSection
        title="Más sobre el Oro"
        subtitle="El metal más estudiado de la historia y sus secretos cuánticos"
      >
        <div className={styles.educationalContent}>
          <div className={styles.educationalItem}>
            <h4>La extracción del oro: cianuración y coste ambiental</h4>
            <p>
              En una mina moderna, se extraen entre 1 y 5 gramos de oro por cada tonelada de roca. El proceso de cianuración usa cianuro de sodio (NaCN) para disolver el oro del mineral: Au + 2 CN⁻ + ½ O₂ + H₂O → Au(CN)₂⁻ + OH⁻. El cianuro es altamente tóxico para la fauna acuática — sus derrames (como el de Baia Mare, Rumanía, 2000) son desastres ecológicos. La minería aurífera es la segunda fuente industrial de contaminación por mercurio, al usarse para amalgamar el oro.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>Las reservas mundiales de oro: un cubo de 21 metros</h4>
            <p>
              Se estima que la humanidad ha extraído ~212.000 toneladas de oro a lo largo de la historia (World Gold Council, 2023). Fundido, formaría un cubo de apenas 21,7 metros de lado. Quedan ~50.000 toneladas estimadas aún en el subsuelo a rentabilidad actual. Las mayores reservas están en Sudáfrica (Witwatersrand), Australia, Rusia y China. Los bancos centrales guardan ~35.000 toneladas (~17% del total extraído).
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>El patrón oro y el Nixon Shock (1971)</h4>
            <p>
              El sistema de Bretton Woods (1944) ligó el dólar al oro: 35 USD = 1 onza troy. Todas las divisas se fijaban al dólar. En agosto de 1971, Nixon suspendió la convertibilidad dólar-oro (el &quot;Nixon Shock&quot;) ante el déficit de la guerra de Vietnam y la salida de reservas de Fort Knox. Comenzó la era del dinero fiat. Hoy los bancos centrales siguen acumulando oro como reserva de valor fuera del sistema monetario internacional — China y Rusia han duplicado sus reservas desde 2010.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>El oro en el universo: polvo de estrellas de neutrones</h4>
            <p>
              El oro (Z=79) no puede formarse en la fusión nuclear de estrellas normales (que producen hasta hierro, Z=26). El oro se sintetiza en las <em>kilonovas</em>: colisiones de estrellas de neutrones. En 2017, el observatorio LIGO detectó la onda gravitacional GW170817 — la kilonova resultante produjo una cantidad de oro equivalente a varios cientos de masas de la Tierra. El oro de tus joyas nació hace miles de millones de años en una colisión de estas estrellas hiperdensas.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>El oro en los mercados financieros: ¿por qué sube en las crisis?</h4>
            <p>
              El oro es el activo refugio por excelencia: no tiene riesgo de contraparte (es un metal físico, no una promesa), no se deprecia por inflación y tiene liquidez global. Históricamente sube cuando: aumenta la inflación, caen las tasas reales de interés, aumenta la inestabilidad geopolítica o hay crisis bancarias. En 2024 alcanzó máximos históricos superando los 2.400 USD/oz, impulsado por compras de bancos centrales de países BRICS y la expectativa de bajadas de tipos de la Fed.
            </p>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Nota educativa:</strong> Este visualizador explica la química y física del oro con fines divulgativos. Los datos de mercado son históricos y no constituyen asesoramiento financiero.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-oro')} />
      <ShareCard appName="visualizador-oro" />
      <Footer appName="visualizador-oro" />
    </div>
  );
}
