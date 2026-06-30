'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './Inflacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Tab = 'causas' | 'espiral' | 'ipc' | 'tipos';

interface TabInfo {
  id: Tab;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const TABS: TabInfo[] = [
  { id: 'causas', titulo: 'Las 3 causas', icono: '📊', subtitulo: 'Demanda, costes, monetaria' },
  { id: 'espiral', titulo: 'Espiral S-P', icono: '🌀', subtitulo: 'Salarios y expectativas' },
  { id: 'ipc', titulo: 'IPC vs real', icono: '🧮', subtitulo: 'Sesgos y diferencias' },
  { id: 'tipos', titulo: 'Tipos y BCE', icono: '🏦', subtitulo: 'Política monetaria' },
];

// ─────────────────────────────────────────────
// Datos: causas de la inflación
// ─────────────────────────────────────────────

interface CausaInflacion {
  id: string;
  nombre: string;
  tagline: string;
  icono: string;
  mecanismo: string;
  factores: string[];
  ejemplo: string;
  bce: string;
  color: string;
}

const CAUSAS: CausaInflacion[] = [
  {
    id: 'demanda',
    nombre: 'Inflación de demanda',
    tagline: 'Demasiado dinero persiguiendo pocos bienes',
    icono: '📈',
    mecanismo:
      'Cuando la demanda total de bienes y servicios crece más rápido que la capacidad productiva de la economía, las empresas pueden subir precios sin perder clientes. Pleno empleo, expansión del crédito y estímulos fiscales son detonantes habituales.',
    factores: [
      'Expansión económica fuerte (bajo desempleo)',
      'Estímulos fiscales masivos (gasto público)',
      'Acceso fácil al crédito bancario',
      'Recuperación brusca post-crisis',
    ],
    ejemplo:
      'EE.UU. 2021-22: el gobierno inyectó ~5 billones de dólares en estímulos COVID. La demanda se disparó cuando la oferta aún estaba restringida por cuellos de botella. Resultado: inflación del 9,1% en junio 2022, la más alta en 40 años.',
    bce: 'Es la causa que el BCE puede combatir directamente: subir tipos encarece los préstamos → las familias y empresas gastan menos → la demanda baja → los precios se estabilizan.',
    color: '#2E86AB',
  },
  {
    id: 'costes',
    nombre: 'Inflación de costes (push)',
    tagline: 'Los inputs se encarecen y las empresas trasladan el coste',
    icono: '⛽',
    mecanismo:
      'Cuando los costes de producción suben (energía, materias primas, salarios mínimos), las empresas tienen que subir precios para mantener sus márgenes, aunque la demanda no haya cambiado. El resultado más peligroso es la stagflación: inflación alta + recesión simultánea.',
    factores: [
      'Energía cara (crisis del petróleo, gas natural)',
      'Materias primas escasas o encarecidas',
      'Disrupciones en cadenas de suministro global',
      'Subidas del salario mínimo cuando los márgenes son bajos',
    ],
    ejemplo:
      'Europa 2021-22: el precio del gas se multiplicó por 10 tras la invasión de Ucrania. La inflación europea fue impulsada en un ~70% por la energía — no por exceso de demanda. El IPC llegó al 10,6% en octubre 2022.',
    bce: 'El BCE tiene poder limitado aquí. Subir tipos no abarata el petróleo ni el gas. Solo puede intentar evitar que la inflación de costes se transforme en espiral de expectativas, aunque a costa de enfriar la economía.',
    color: '#48A9A6',
  },
  {
    id: 'monetaria',
    nombre: 'Inflación monetaria',
    tagline: 'Imprimir dinero dilata su valor',
    icono: '💶',
    mecanismo:
      'La teoría cuantitativa del dinero establece: M × V = P × Q. Si la oferta monetaria (M) crece más rápido que la producción real (Q), los precios (P) deben subir. Pero no es automático: también importa la velocidad de circulación (V) y si el dinero nuevo llega a la economía real o se queda en reservas bancarias.',
    factores: [
      'Expansión cuantitativa (QE) del banco central',
      'Monetización directa del déficit público (prohibida al BCE por el art. 123 TFUE, pero presente en otros países con bancos centrales menos independientes)',
      'Pérdida de confianza en la moneda',
      'Velocidad de circulación del dinero alta',
    ],
    ejemplo:
      'El QE post-2008 no causó inflación: el dinero creado quedó en reservas bancarias (V bajó). Pero el QE + transferencias directas + demanda real post-COVID sí causó inflación porque el dinero llegó a los bolsillos de los consumidores.',
    bce: 'El BCE controla directamente la base monetaria a través del QE y los tipos de refinanciación. Reducir el balance del BCE (QT) y subir tipos reduce la liquidez disponible.',
    color: '#7FB3D3',
  },
];

// ─────────────────────────────────────────────
// Datos: tipos de inflación
// ─────────────────────────────────────────────

interface TipoInflacion {
  tipo: string;
  rango: string;
  descripcion: string;
  ejemplo: string;
  color: string;
  nivel: number;
}

const TIPOS_INFLACION: TipoInflacion[] = [
  {
    tipo: 'Deflación',
    rango: '< 0%',
    descripcion: 'Los precios bajan. Suena bien pero es peligrosa: los consumidores posponen compras esperando precios más bajos → menos demanda → más desempleo → más deflación. La deuda real crece.',
    ejemplo: 'Japón 1990-2010: "décadas perdidas" de estancamiento con deflación crónica.',
    color: '#6366f1',
    nivel: 1,
  },
  {
    tipo: 'Baja',
    rango: '0% – 2%',
    descripcion: 'El objetivo del BCE. Suficiente para incentivar el consumo (posponer compras tiene coste) y dar margen para ajustar precios relativos, pero tan baja que no erosiona el poder adquisitivo.',
    ejemplo: 'Eurozona 2013-2021: inflación persistentemente inferior al objetivo 2%.',
    color: '#22c55e',
    nivel: 2,
  },
  {
    tipo: 'Moderada',
    rango: '2% – 5%',
    descripcion: 'Manejable para la mayoría de agentes. Erosiona gradualmente los ahorros en cuentas corrientes. El BCE monitoriza de cerca pero puede no actuar de inmediato.',
    ejemplo: 'Eurozona 2022 normalización: bajando del pico hacia el 2-3%.',
    color: '#f59e0b',
    nivel: 3,
  },
  {
    tipo: 'Alta',
    rango: '5% – 10%',
    descripcion: 'Daño real al poder adquisitivo, especialmente de rentas bajas. El BCE actúa con subidas de tipos contundentes. Riesgo de espiral salarios-precios.',
    ejemplo: 'España octubre 2022: IPC del 10,8%. El BCE subió tipos 10 veces consecutivas.',
    color: '#ef4444',
    nivel: 4,
  },
  {
    tipo: 'Muy alta',
    rango: '10% – 50%',
    descripcion: 'Crisis social. La gente huye del dinero hacia activos reales (inmuebles, divisas fuertes, oro). Las empresas suben precios de forma preventiva. Control de cambios frecuente.',
    ejemplo: 'Turquía 2022: inflación del 85%. Lira perdió el 80% de su valor frente al dólar.',
    color: '#dc2626',
    nivel: 5,
  },
  {
    tipo: 'Hiperinflación',
    rango: '> 50%/mes',
    descripcion: 'Colapso del sistema monetario. El dinero pierde valor tan rápido que la gente prefiere cualquier cosa material. Las transacciones pasan al trueque o a divisas extranjeras.',
    ejemplo: 'Alemania 1923: precios se duplicaban cada 4 días. Zimbabwe 2008: 89,7 sextillones % anual. Venezuela 2018: 1.000.000%.',
    color: '#7f1d1d',
    nivel: 6,
  },
];

// ─────────────────────────────────────────────
// Datos: ponderaciones IPC
// ─────────────────────────────────────────────

interface PonderacionIPC {
  categoria: string;
  peso: number;
  nota: string;
}

const PONDERACIONES_IPC: PonderacionIPC[] = [
  { categoria: 'Vivienda y alquiler', peso: 30, nota: 'Mayor partida — alquiler imputado incluido' },
  { categoria: 'Alimentación', peso: 20, nota: 'Alimentos y bebidas no alcohólicas' },
  { categoria: 'Transporte', peso: 15, nota: 'Combustible, vehículo, transporte público' },
  { categoria: 'Educación y ocio', peso: 12, nota: 'Libros, restaurantes, ocio, viajes' },
  { categoria: 'Salud', peso: 8, nota: 'Medicamentos, servicios médicos' },
  { categoria: 'Vestido y calzado', peso: 5, nota: 'Ropa, accesorios' },
  { categoria: 'Otros', peso: 10, nota: 'Comunicaciones, muebles, etc.' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorInflacion() {
  const [tabActiva, setTabActiva] = useState<Tab>('causas');
  const [causaActiva, setCausaActiva] = useState<string>('demanda');
  const [tiposSlider, setTiposSlider] = useState<number>(3);

  const causaSeleccionada = CAUSAS.find((c) => c.id === causaActiva) ?? CAUSAS[0];
  const mesesTransmision = Math.round(6 + tiposSlider * 4);
  const impactoInflacion = Math.round(tiposSlider * 0.8 * 10) / 10;
  const impactoCrecimiento = Math.round(tiposSlider * 0.4 * 10) / 10;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroEmoji} aria-hidden="true">📊</div>
        <h1 className={styles.title}>Inflación: Por Qué Suben los Precios</h1>
        <p className={styles.subtitle}>
          3 causas distintas, una espiral peligrosa y un banco central que solo puede atacar una directamente
        </p>
      </header>

      <LegalNotice />

      {/* Navegación de tabs */}
      <nav className={styles.tabs} aria-label="Secciones del explicador">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            <span className={styles.tabIcon} aria-hidden="true">{tab.icono}</span>
            <span className={styles.tabTitulo}>{tab.titulo}</span>
            <span className={styles.tabSub}>{tab.subtitulo}</span>
          </button>
        ))}
      </nav>

      {/* ─── TAB 1: Las 3 causas ─── */}
      {tabActiva === 'causas' && (
        <section className={styles.content}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Las 3 causas mecánicas de la inflación</h2>
            <p className={styles.seccionSub}>Cada causa tiene una lógica distinta — y requiere una respuesta diferente</p>
          </div>

          {/* SVG: equilibrio oferta-demanda desplazado */}
          <div className={styles.svgZona} aria-label="Diagrama: desplazamiento de la demanda">
            <svg className={styles.svgDiagrama} viewBox="0 0 500 240" role="img" aria-label="Gráfico oferta y demanda con desplazamiento de la curva de demanda">
              {/* Ejes */}
              <line x1="60" y1="20" x2="60" y2="200" stroke="currentColor" strokeWidth="2"/>
              <line x1="60" y1="200" x2="460" y2="200" stroke="currentColor" strokeWidth="2"/>
              <text x="30" y="115" fill="currentColor" fontSize="11" textAnchor="middle" transform="rotate(-90 30 115)">Precio (P)</text>
              <text x="260" y="220" fill="currentColor" fontSize="11" textAnchor="middle">Cantidad (Q)</text>
              {/* Curva Oferta (S) — rígida (vertical) */}
              <line x1="200" y1="30" x2="200" y2="190" stroke="#48A9A6" strokeWidth="2.5" strokeDasharray="6,3"/>
              <text x="195" y="24" fill="#48A9A6" fontSize="11" textAnchor="middle">Oferta (fija)</text>
              {/* Curva Demanda D1 */}
              <path d="M 80,50 Q 180,130 350,185" stroke="#2E86AB" strokeWidth="2.5" fill="none"/>
              <text x="355" y="185" fill="#2E86AB" fontSize="11">D₁</text>
              {/* Curva Demanda D2 — desplazada a la derecha/arriba */}
              <path d="M 80,25 Q 180,100 420,175" stroke="#e74c3c" strokeWidth="2.5" fill="none"/>
              <text x="425" y="175" fill="#e74c3c" fontSize="11">D₂</text>
              {/* Punto de equilibrio original */}
              <circle cx="200" cy="128" r="5" fill="#2E86AB"/>
              <line x1="60" y1="128" x2="200" y2="128" stroke="#2E86AB" strokeWidth="1" strokeDasharray="4,3"/>
              <text x="56" y="131" fill="#2E86AB" fontSize="10" textAnchor="end">P₁</text>
              {/* Nuevo equilibrio con D2 */}
              <circle cx="200" cy="96" r="5" fill="#e74c3c"/>
              <line x1="60" y1="96" x2="200" y2="96" stroke="#e74c3c" strokeWidth="1" strokeDasharray="4,3"/>
              <text x="56" y="99" fill="#e74c3c" fontSize="10" textAnchor="end">P₂</text>
              {/* Flecha ascendente de precio */}
              <line x1="240" y1="128" x2="240" y2="100" stroke="#e74c3c" strokeWidth="2"/>
              <polygon points="240,92 235,102 245,102" fill="#e74c3c"/>
              <text x="245" y="116" fill="#e74c3c" fontSize="10">↑ Precio</text>
              {/* Leyenda */}
              <text x="80" y="18" fill="currentColor" fontSize="10" opacity="0.7">La oferta es rígida a corto plazo</text>
            </svg>
          </div>

          {/* Grid de 3 causas — clickables */}
          <div className={styles.causasGrid} role="list">
            {CAUSAS.map((causa) => (
              <button
                key={causa.id}
                type="button"
                className={`${styles.causaCard} ${causaActiva === causa.id ? styles.causaCardActive : ''}`}
                onClick={() => setCausaActiva(causa.id)}
                style={{ '--causa-color': causa.color } as React.CSSProperties}
                aria-pressed={causaActiva === causa.id}
              >
                <span className={styles.causaIcono} aria-hidden="true">{causa.icono}</span>
                <span className={styles.causaNombre}>{causa.nombre}</span>
                <span className={styles.causaTagline}>{causa.tagline}</span>
              </button>
            ))}
          </div>

          {/* Panel de detalle de la causa seleccionada */}
          <div className={styles.causaDetalle} style={{ borderColor: causaSeleccionada.color }}>
            <div className={styles.causaDetalleHeader}>
              <span className={styles.causaDetalleIcono} aria-hidden="true">{causaSeleccionada.icono}</span>
              <div>
                <h3 className={styles.causaDetalleTitulo}>{causaSeleccionada.nombre}</h3>
                <p className={styles.causaDetalleTagline}>{causaSeleccionada.tagline}</p>
              </div>
            </div>

            <p className={styles.causaDetalleMecanismo}>{causaSeleccionada.mecanismo}</p>

            <div className={styles.causaDetalleGrid}>
              <div className={styles.causaDetalleBloque}>
                <h4 className={styles.causaDetalleBloqueT}>Factores desencadenantes</h4>
                <ul className={styles.causaDetalleList}>
                  {causaSeleccionada.factores.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.causaDetalleBloque}>
                <h4 className={styles.causaDetalleBloqueT}>Ejemplo histórico</h4>
                <p className={styles.causaDetalleEjemplo}>{causaSeleccionada.ejemplo}</p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <span aria-hidden="true">🏦</span>
              <div>
                <strong>¿Qué puede hacer el BCE?</strong>
                <p>{causaSeleccionada.bce}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 2: Espiral salarios-precios ─── */}
      {tabActiva === 'espiral' && (
        <section className={styles.content}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>La espiral salarios-precios</h2>
            <p className={styles.seccionSub}>El mecanismo que convierte la inflación alta en inflación crónica</p>
          </div>

          {/* Diagrama circular de la espiral */}
          <div className={styles.svgZona} aria-label="Diagrama de la espiral salarios-precios">
            <svg className={styles.svgEspiral} viewBox="0 0 500 320" role="img" aria-label="Ciclo de retroalimentación: precios suben → salarios suben → costes suben → precios suben">
              {/* Fondo */}
              <defs>
                <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#2E86AB"/>
                </marker>
                <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill="#e74c3c"/>
                </marker>
              </defs>

              {/* Cajas de la espiral */}
              {/* 1. Precios suben (arriba) */}
              <rect x="170" y="10" width="160" height="50" rx="10" fill="#2E86AB" opacity="0.9"/>
              <text x="250" y="32" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Precios suben</text>
              <text x="250" y="48" fill="white" fontSize="10" textAnchor="middle">Poder adquisitivo cae</text>

              {/* 2. Trabajadores piden más (derecha) */}
              <rect x="350" y="120" width="140" height="50" rx="10" fill="#48A9A6" opacity="0.9"/>
              <text x="420" y="142" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Trabajadores</text>
              <text x="420" y="158" fill="white" fontSize="10" textAnchor="middle">exigen ↑ salarios</text>

              {/* 3. Costes empresariales suben (abajo) */}
              <rect x="170" y="240" width="160" height="50" rx="10" fill="#e74c3c" opacity="0.9"/>
              <text x="250" y="262" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Costes laborales</text>
              <text x="250" y="278" fill="white" fontSize="10" textAnchor="middle">de empresas suben</text>

              {/* 4. Empresas suben precios (izquierda) */}
              <rect x="10" y="120" width="140" height="50" rx="10" fill="#7FB3D3" opacity="0.9"/>
              <text x="80" y="142" fill="white" fontSize="12" textAnchor="middle" fontWeight="600">Empresas suben</text>
              <text x="80" y="158" fill="white" fontSize="10" textAnchor="middle">precios para mantener margen</text>

              {/* Flechas conectoras */}
              <line x1="330" y1="35" x2="365" y2="120" stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arrowBlue)"/>
              <line x1="350" y1="170" x2="330" y2="240" stroke="#48A9A6" strokeWidth="2" markerEnd="url(#arrowBlue)"/>
              <line x1="170" y1="265" x2="150" y2="170" stroke="#e74c3c" strokeWidth="2" markerEnd="url(#arrowRed)"/>
              <line x1="150" y1="120" x2="175" y2="60" stroke="#7FB3D3" strokeWidth="2" markerEnd="url(#arrowBlue)"/>

              {/* Centro: ojo de la espiral */}
              <circle cx="250" cy="155" r="45" fill="none" stroke="#e74c3c" strokeWidth="2" strokeDasharray="6,4"/>
              <text x="250" y="149" fill="#e74c3c" fontSize="11" textAnchor="middle" fontWeight="600">ESPIRAL</text>
              <text x="250" y="163" fill="#e74c3c" fontSize="10" textAnchor="middle">auto-alimentada</text>

              {/* Flecha BCE interrumpiendo */}
              <line x1="250" y1="310" x2="250" y2="204" stroke="#27ae60" strokeWidth="2.5" markerEnd="url(#arrowBlue)" strokeDasharray="5,3"/>
              <rect x="195" y="290" width="110" height="22" rx="5" fill="#27ae60" opacity="0.9"/>
              <text x="250" y="305" fill="white" fontSize="10" textAnchor="middle" fontWeight="600">BCE: sube tipos ↑</text>
            </svg>
          </div>

          <div className={styles.espiralaGrid}>
            <div className={styles.espiralaBloque}>
              <h3 className={styles.espiralaT}>El papel clave de las expectativas</h3>
              <p className={styles.espiralaP}>
                La espiral no necesita estar en marcha para ser peligrosa. Si trabajadores y empresas
                <strong> esperan</strong> que la inflación sea del 5%, lo negocian en contratos de antemano —
                y la inflación se auto-cumple aunque no hubiera otra causa real.
              </p>
              <p className={styles.espiralaP}>
                Por eso el BCE comunica con tanta firmeza sus objetivos. La credibilidad del banco central
                es su activo más valioso: si la gente cree que el BCE mantendrá la inflación en el 2%, las
                negociaciones salariales se anclan ahí.
              </p>
              <div className={styles.cita}>
                <blockquote>
                  &ldquo;Haremos lo que sea necesario para preservar el euro. Y, créanme, será suficiente.&rdquo;
                </blockquote>
                <cite>— Mario Draghi, BCE, julio 2012 (ancló expectativas y frenó la crisis de deuda)</cite>
              </div>
            </div>

            <div className={styles.espiralaBloque}>
              <h3 className={styles.espiralaT}>Casos históricos</h3>
              <div className={styles.casoCard}>
                <div className={styles.casoHeader}>
                  <span aria-hidden="true">🇩🇪</span>
                  <strong>Alemania 1923 — espiral descontrolada</strong>
                </div>
                <p>El gobierno alemán monetizó el déficit de guerra. Los precios se duplicaban cada 4 días. Se necesitaba una carretilla de billetes para comprar pan. La confianza en el marco colapsó totalmente.</p>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoHeader}>
                  <span aria-hidden="true">🇦🇷</span>
                  <strong>Argentina 2022-23 — indexación sistémica</strong>
                </div>
                <p>Con inflación del 100%+, los contratos laborales incluían ajuste automático trimestral. La indexación generalizada convirtió la espiral en estructural. El intento de corte brusco causó recesión profunda.</p>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoHeader}>
                  <span aria-hidden="true">🇪🇸</span>
                  <strong>España 1970-80 — espiral moderada controlada</strong>
                </div>
                <p>Inflación del 15-20% alimentada por la crisis del petróleo y el franquismo tardío. Los Pactos de la Moncloa (1977) coordinaron contención salarial con reformas fiscales — ejemplo de resolución política.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 3: IPC vs inflación real ─── */}
      {tabActiva === 'ipc' && (
        <section className={styles.content}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>IPC vs. tu inflación real</h2>
            <p className={styles.seccionSub}>El IPC mide la media — tu inflación depende de lo que tú compras</p>
          </div>

          {/* Cómo se calcula el IPC */}
          <div className={styles.ipcExplicacion}>
            <h3 className={styles.ipcT}>Cómo se calcula el IPC</h3>
            <p className={styles.ipcP}>
              El Instituto Nacional de Estadística (INE) encuesta ~24.000 hogares para conocer su gasto y
              asigna ponderaciones a una cesta de ~500 artículos. Las ponderaciones se actualizan periódicamente.
              El IPC mide cuánto cuesta esa cesta respecto al año anterior.
            </p>

            <div className={styles.ponderacionesGrid}>
              {PONDERACIONES_IPC.map((p) => (
                <div key={p.categoria} className={styles.ponderacionRow}>
                  <div className={styles.ponderacionNombre}>{p.categoria}</div>
                  <div className={styles.ponderacionBarra}>
                    <div
                      className={styles.ponderacionFill}
                      style={{ width: `${(p.peso / 30) * 100}%` }}
                      aria-label={`${p.peso}%`}
                    />
                  </div>
                  <div className={styles.ponderacionPeso}>{p.peso}%</div>
                  <div className={styles.ponderacionNota}>{p.nota}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sesgos del IPC */}
          <h3 className={styles.ipcT}>Los 4 sesgos del IPC</h3>
          <div className={styles.sesgosGrid}>
            <div className={styles.sesgoCard}>
              <div className={styles.sesgoNum}>1</div>
              <div>
                <h4 className={styles.sesgoT}>Sesgo de sustitución</h4>
                <p className={styles.sesgoP}>
                  Si el pollo se encarece mucho, los hogares compran más pavo y menos pollo. Pero el IPC
                  asume que siguen comprando la misma cantidad de pollo al nuevo precio mayor —
                  sobreestimando la inflación real.
                </p>
              </div>
            </div>
            <div className={styles.sesgoCard}>
              <div className={styles.sesgoNum}>2</div>
              <div>
                <h4 className={styles.sesgoT}>Sesgo de calidad (hedónico)</h4>
                <p className={styles.sesgoP}>
                  Un coche nuevo de 2024 cuesta más que uno de 2014, pero también tiene 6 airbags más,
                  asistente de carril y ADAS. El INE intenta ajustar por calidad (hedonic pricing) — pero
                  el ajuste es subjetivo y polémico.
                </p>
              </div>
            </div>
            <div className={styles.sesgoCard}>
              <div className={styles.sesgoNum}>3</div>
              <div>
                <h4 className={styles.sesgoT}>Nuevos productos</h4>
                <p className={styles.sesgoP}>
                  Los smartphones no existían en 1995 y tardaron más de una década en entrar en la cesta.
                  Mientras tanto, su bajada de precio (ajustada por calidad) no reducía el IPC oficial.
                </p>
              </div>
            </div>
            <div className={styles.sesgoCard}>
              <div className={styles.sesgoNum}>4</div>
              <div>
                <h4 className={styles.sesgoT}>Inflación diferencial por renta</h4>
                <p className={styles.sesgoP}>
                  Un hogar de renta baja destina un 40% a alimentación y energía (bienes que más suben).
                  Un hogar de renta alta gasta proporcionalmente más en viajes y restaurantes. El IPC es
                  un promedio: la inflación real soportada por los hogares de renta baja suele ser mayor
                  que la de los hogares de renta alta cuando suben energía y alimentos básicos.
                </p>
              </div>
            </div>
          </div>

          {/* Comparativa por categoría */}
          <div className={styles.comparativaZona}>
            <h3 className={styles.ipcT}>¿Qué sube más que el IPC general?</h3>
            <p className={styles.ipcP}>Comportamiento típico en períodos inflacionistas:</p>
            <div className={styles.icpTable}>
              <div className={styles.icpHeader}>
                <span>Categoría</span>
                <span>vs. IPC general</span>
                <span>Razón</span>
              </div>
              <div className={`${styles.icpRow} ${styles.icpMas}`}>
                <span>Alimentos básicos</span>
                <span>↑ Por encima</span>
                <span>Energía y transporte encarecen producción</span>
              </div>
              <div className={`${styles.icpRow} ${styles.icpMas}`}>
                <span>Energía doméstica</span>
                <span>↑↑ Muy por encima</span>
                <span>Dependencia de mercados globales volátiles</span>
              </div>
              <div className={`${styles.icpRow} ${styles.icpMas}`}>
                <span>Vivienda en grandes ciudades</span>
                <span>↑↑ Muy por encima</span>
                <span>Oferta rígida + demanda creciente</span>
              </div>
              <div className={`${styles.icpRow} ${styles.icpMenos}`}>
                <span>Electrónica y tecnología</span>
                <span>↓ Por debajo</span>
                <span>Deflación hedónica: más calidad por precio</span>
              </div>
              <div className={`${styles.icpRow} ${styles.icpMenos}`}>
                <span>Ropa y calzado</span>
                <span>↓ Ligeramente</span>
                <span>Producción global competitiva (Bangladesh, Vietnam)</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 4: Tipos de inflación y BCE ─── */}
      {tabActiva === 'tipos' && (
        <section className={styles.content}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Tipos de inflación y política monetaria</h2>
            <p className={styles.seccionSub}>De la deflación japonesa a la hiperinflación zimbabuense</p>
          </div>

          {/* Tabla de tipos */}
          <div className={styles.inflacionTable}>
            <div className={styles.inflacionHeader}>
              <span>Tipo</span>
              <span>Tasa</span>
              <span>Descripción y ejemplo</span>
            </div>
            {TIPOS_INFLACION.map((t) => (
              <div key={t.tipo} className={styles.inflacionRow} style={{ borderLeftColor: t.color }}>
                <span className={styles.inflacionTipo} style={{ color: t.color }}>{t.tipo}</span>
                <span className={styles.inflacionRango} style={{ color: t.color }}>{t.rango}</span>
                <div className={styles.inflacionInfo}>
                  <p className={styles.inflacionDesc}>{t.descripcion}</p>
                  <p className={styles.inflacionEj}><em>{t.ejemplo}</em></p>
                </div>
              </div>
            ))}
          </div>

          {/* Mecanismo de transmisión BCE */}
          <div className={styles.transmisionZona}>
            <h3 className={styles.ipcT}>Mecanismo de transmisión BCE</h3>
            <div className={styles.transmisionChain} aria-label="Cadena de transmisión de política monetaria">
              {[
                { icono: '🏦', texto: 'BCE sube tipos' },
                { icono: '💳', texto: 'Crédito más caro' },
                { icono: '🏠', texto: 'Menos hipotecas y préstamos' },
                { icono: '🛒', texto: 'Menos gasto consumo' },
                { icono: '📉', texto: 'Menos demanda agregada' },
                { icono: '✅', texto: 'Inflación (de demanda) baja' },
              ].map((paso, i) => (
                <div key={i} className={styles.transmisionPaso}>
                  <div className={styles.transmisionIcono} aria-hidden="true">{paso.icono}</div>
                  <div className={styles.transmisionTexto}>{paso.texto}</div>
                  {i < 5 && <div className={styles.transmisionFlecha} aria-hidden="true">→</div>}
                </div>
              ))}
            </div>
            <div className={styles.transmisionLimitacion}>
              <span aria-hidden="true">⚠️</span>
              <p>
                <strong>Limitación importante:</strong> este mecanismo funciona principalmente para inflación de
                demanda. Si la inflación viene de costes energéticos, subir tipos no abarata el gas — pero sí
                enfría la economía y aumenta el desempleo.
              </p>
            </div>
          </div>

          {/* Slider interactivo */}
          <div className={styles.sliderSection}>
            <h3 className={styles.sliderT}>Tradeoff: tipos de interés vs economía real</h3>
            <p className={styles.sliderSub}>Mueve el slider para ver el tradeoff entre inflación y crecimiento al variar los tipos de interés (las tasas de interés, como se conocen en Latinoamérica)</p>

            <label htmlFor="slider-tipos" className={styles.sliderLabel}>
              Subida de tipos del BCE: <strong>{tiposSlider}%</strong>
            </label>
            <input
              id="slider-tipos"
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={tiposSlider}
              onChange={(e) => setTiposSlider(Number(e.target.value))}
              className={styles.slider}
              aria-label={`Subida de tipos: ${tiposSlider}%`}
            />
            <div className={styles.sliderTicks} aria-hidden="true">
              <span>0% (neutro)</span>
              <span>2,5%</span>
              <span>5%</span>
              <span>7,5%</span>
              <span>10% (agresivo)</span>
            </div>

            <div className={styles.transmisionDisplay} role="status" aria-live="polite">
              <div className={styles.transmisionCard}>
                <div className={styles.transmisionCardIcon} aria-hidden="true">⏱️</div>
                <div className={styles.transmisionCardVal}>{mesesTransmision} meses</div>
                <div className={styles.transmisionCardLbl}>Tiempo hasta notar efecto en precios</div>
              </div>
              <div className={styles.transmisionCard}>
                <div className={styles.transmisionCardIcon} aria-hidden="true">📉</div>
                <div className={styles.transmisionCardVal}>−{impactoInflacion.toFixed(1)} pp</div>
                <div className={styles.transmisionCardLbl}>Reducción estimada de inflación</div>
              </div>
              <div className={styles.transmisionCard}>
                <div className={styles.transmisionCardIcon} aria-hidden="true">🏭</div>
                <div className={styles.transmisionCardVal}>−{impactoCrecimiento.toFixed(1)} pp</div>
                <div className={styles.transmisionCardLbl}>Coste en crecimiento económico</div>
              </div>
            </div>

            <p className={styles.sliderNota}>
              Los efectos de la política monetaria tienen un retardo de 6 a 18 meses. El BCE actúa
              anticipando la inflación futura, no la actual. Por eso en 2022 subió tipos agresivamente
              aunque la inflación ya empezaba a moderarse por sí sola.
            </p>
          </div>
        </section>
      )}

      {/* ─── Sección educativa ─── */}
      <EducationalSection title="Macroeconomía de la inflación: más allá del IPC" subtitle="Deflación, HICP, inflación subyacente y por qué el objetivo es 2% y no 0%">
        <div className={styles.eduGrid}>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduT}>¿Por qué el objetivo es 2% y no 0%?</h3>
            <p className={styles.eduP}>
              Cero inflación parece el ideal, pero tiene problemas: (1) Los precios y salarios son rígidos
              a la baja — es más fácil congelarlos que bajarlos. Un colchón del 2% permite ajustes relativos
              sin recortes nominales. (2) Si la inflación está en 0%, cualquier shock deflacionario la lleva
              a negativo, territorio muy difícil de abandonar (problema del límite inferior del 0% de los tipos de interés, también llamados tasas de interés en Latinoamérica).
            </p>
          </div>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduT}>HICP vs IPC: la diferencia que importa</h3>
            <p className={styles.eduP}>
              El BCE usa el HICP (Harmonised Index of Consumer Prices), no el IPC nacional. La principal
              diferencia: el HICP no incluye el coste de la vivienda en propiedad (imputed rent), que sí
              incluye el IPC americano. Esto hace que el HICP europeo sea más bajo que lo que sentiría un
              propietario con hipoteca variable.
            </p>
          </div>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduT}>Inflación subyacente: el indicador que más mira el BCE</h3>
            <p className={styles.eduP}>
              La inflación subyacente excluye energía y alimentos frescos — los componentes más volátiles.
              Es mejor indicador de la tendencia estructural. En 2022-23, mientras el IPC general bajaba
              rápido gracias a la energía, la subyacente era persistente — eso era lo que preocupaba al BCE.
            </p>
          </div>
          <div className={styles.eduBloque}>
            <h3 className={styles.eduT}>Por qué la deflación asusta más que la inflación</h3>
            <p className={styles.eduP}>
              En deflación, esperar es racional: si los precios bajan, comprar mañana es más barato que
              hoy. Esta espera reduce la demanda → más deflación → más espera. Además, las deudas crecen
              en términos reales: un préstamo de 100.000€ al 0% se hace más pesado si los salarios bajan.
              El BCE tiene más herramientas contra la inflación que contra la deflación.
            </p>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-inflacion')} />
      <ShareCard appName="visualizador-inflacion" />
      <Footer appName="visualizador-inflacion" />
    </div>
  );
}
