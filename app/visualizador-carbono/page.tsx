'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './VisualizadorCarbono.module.css';
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

type Alotropo = 'grafito' | 'diamante' | 'grafeno' | 'fullereno';

interface AlotropoInfo {
  id: Alotropo;
  nombre: string;
  icono: string;
  descripcion: string;
  propiedades: string[];
  usos: string[];
  color: string;
}

const ALOTROPOS: AlotropoInfo[] = [
  {
    id: 'grafito',
    nombre: 'Grafito',
    icono: '✏️',
    descripcion:
      'Capas hexagonales superpuestas unidas débilmente entre sí. Dentro de cada capa los átomos están fuertemente unidos, pero las capas se deslizan entre ellas con facilidad.',
    propiedades: ['Blando y lubricante (capas que se deslizan)', 'Conductor eléctrico (electrones libres entre capas)', 'Resistente al calor (hasta 3.600 °C)'],
    usos: ['Lápices (las capas se depositan en el papel)', 'Lubricante industrial en alta temperatura', 'Electrodos en baterías y electrólisis'],
    color: '#555',
  },
  {
    id: 'diamante',
    nombre: 'Diamante',
    icono: '💎',
    descripcion:
      'Red covalente tridimensional donde cada átomo de carbono está unido a otros 4 en disposición tetraédrica. Esta estructura rígida lo convierte en el material natural más duro conocido.',
    propiedades: ['Dureza 10 (Escala de Mohs — máximo)', 'Aislante eléctrico (sin electrones libres)', 'Conductor de calor excepcional (5× el cobre)'],
    usos: ['Joyería (piedra preciosa)', 'Herramientas de corte industrial', 'Ventanas para láseres de alta potencia'],
    color: '#7FDBFF',
  },
  {
    id: 'grafeno',
    nombre: 'Grafeno',
    icono: '🔬',
    descripcion:
      'Una sola capa de grafito: una red hexagonal de átomos de carbono de un solo átomo de grosor. Descubierto en 2004 por Geim y Novoselov (Nobel 2010). El material más fino conocido.',
    propiedades: ['200× más fuerte que el acero por peso', 'Mejor conductor que el cobre', 'Casi completamente transparente (absorbe solo el 2,3% de luz)'],
    usos: ['Electrónica flexible de próxima generación', 'Filtros de agua ultraprecisos', 'Baterías y supercondensadores avanzados'],
    color: '#48A9A6',
  },
  {
    id: 'fullereno',
    nombre: 'Fullerenos / C₆₀',
    icono: '⚽',
    descripcion:
      'Moléculas esféricas formadas por 60 átomos de carbono en pentágonos y hexágonos, como una pelota de fútbol microscópica. Los nanotubos de carbono son una variante cilíndrica con propiedades mecánicas extraordinarias.',
    propiedades: ['Estructura hueca (puede encapsular otras moléculas)', 'Superconductor cuando se dopa con metales alcalinos', 'Altamente resistente a la presión'],
    usos: ['Liberación controlada de fármacos (como cápsula)', 'Nanotubos como refuerzo en materiales compuestos', 'Lubricantes a nanoescala'],
    color: '#F0A500',
  },
];

interface Reservorio {
  nombre: string;
  cantidad: string;
  unidad: string;
  descripcion: string;
  color: string;
}

const RESERVORIOS: Reservorio[] = [
  { nombre: 'Océanos', cantidad: '38.000', unidad: 'Gt C', descripcion: 'Mayor reservorio activo del planeta', color: '#2E86AB' },
  { nombre: 'Combustibles fósiles', cantidad: '10.000', unidad: 'Gt C', descripcion: 'Carbono "bloqueado" durante millones de años', color: '#555' },
  { nombre: 'Biota terrestre', cantidad: '600', unidad: 'Gt C', descripcion: 'Plantas, suelo, microorganismos', color: '#3a9e4a' },
  { nombre: 'Atmósfera', cantidad: '860', unidad: 'Gt C', descripcion: 'CO₂: 421 ppm en 2024 (récord histórico)', color: '#aaa' },
];

interface GrupoFuncional {
  formula: string;
  nombre: string;
  descripcion: string;
  ejemplo: string;
}

const GRUPOS_FUNCIONALES: GrupoFuncional[] = [
  { formula: '–CH₃', nombre: 'Alcanos', descripcion: 'Enlace simple C–H, base de los hidrocarburos saturados', ejemplo: 'Metano, propano (gas de cocina)' },
  { formula: '=CH₂', nombre: 'Alquenos', descripcion: 'Doble enlace C=C, más reactivos que los alcanos', ejemplo: 'Etileno (maduración frutas)' },
  { formula: '–OH', nombre: 'Alcoholes', descripcion: 'Grupo hidroxilo; hidrofílico y reactivo', ejemplo: 'Etanol, glicerol' },
  { formula: '–COOH', nombre: 'Ácidos carboxílicos', descripcion: 'Ácido orgánico; presente en aminoácidos y grasas', ejemplo: 'Ácido acético (vinagre)' },
  { formula: '–NH₂', nombre: 'Aminas', descripcion: 'Grupo amino; base de proteínas y ADN', ejemplo: 'Glicina (aminoácido)' },
];

// ─────────────────────────────────────────────
// Utilidades C-14
// ─────────────────────────────────────────────

const VIDA_MEDIA_C14 = 5730; // años

function calcularPorcentajeC14(anos: number): number {
  return Math.pow(0.5, anos / VIDA_MEDIA_C14) * 100;
}

// ─────────────────────────────────────────────
// Componente: SVG Alótropo
// ─────────────────────────────────────────────

function SvgAlotropo({ id }: { id: Alotropo }): React.ReactNode {
  if (id === 'grafito') {
    return (
      <svg viewBox="0 0 200 160" className={styles.alotropoSvg} aria-label="Estructura del grafito">
        {/* Capa inferior */}
        {[0, 1, 2].map((col) => (
          <g key={`low-${col}`} transform={`translate(${20 + col * 50}, 100)`}>
            <line x1="0" y1="0" x2="20" y2="-15" stroke="#777" strokeWidth="2" />
            <line x1="20" y1="-15" x2="40" y2="0" stroke="#777" strokeWidth="2" />
            <circle cx="0" cy="0" r="5" fill="#777" />
            <circle cx="20" cy="-15" r="5" fill="#777" />
            <circle cx="40" cy="0" r="5" fill="#777" />
          </g>
        ))}
        {/* Capa superior */}
        {[0, 1, 2].map((col) => (
          <g key={`high-${col}`} transform={`translate(${20 + col * 50}, 60)`}>
            <line x1="0" y1="0" x2="20" y2="-15" stroke="#555" strokeWidth="2" />
            <line x1="20" y1="-15" x2="40" y2="0" stroke="#555" strokeWidth="2" />
            <circle cx="0" cy="0" r="5" fill="#555" />
            <circle cx="20" cy="-15" r="5" fill="#555" />
            <circle cx="40" cy="0" r="5" fill="#555" />
          </g>
        ))}
        {/* Flechas separación capas */}
        <text x="10" y="85" fontSize="10" fill="#999" fontStyle="italic">capas débilmente unidas</text>
      </svg>
    );
  }
  if (id === 'diamante') {
    return (
      <svg viewBox="0 0 200 160" className={styles.alotropoSvg} aria-label="Estructura del diamante">
        <polygon points="100,20 30,80 70,140 130,140 170,80" fill="none" stroke="#7FDBFF" strokeWidth="2" />
        <line x1="100" y1="20" x2="100" y2="140" stroke="#7FDBFF" strokeWidth="1.5" strokeDasharray="4" />
        <line x1="30" y1="80" x2="170" y2="80" stroke="#7FDBFF" strokeWidth="1.5" strokeDasharray="4" />
        <circle cx="100" cy="20" r="6" fill="#7FDBFF" />
        <circle cx="30" cy="80" r="6" fill="#7FDBFF" />
        <circle cx="170" cy="80" r="6" fill="#7FDBFF" />
        <circle cx="70" cy="140" r="6" fill="#7FDBFF" />
        <circle cx="130" cy="140" r="6" fill="#7FDBFF" />
        <circle cx="100" cy="80" r="6" fill="white" stroke="#7FDBFF" strokeWidth="2" />
        <text x="60" y="155" fontSize="9" fill="#7FDBFF">Red covalente 3D</text>
      </svg>
    );
  }
  if (id === 'grafeno') {
    // Hexagonal lattice
    const hexPoints = (cx: number, cy: number, r: number): string => {
      return Array.from({ length: 6 }, (_, i) => {
        const ang = (Math.PI / 3) * i - Math.PI / 6;
        return `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
      }).join(' ');
    };
    const centers = [
      [100, 80], [65, 60], [135, 60], [65, 100], [135, 100], [100, 120],
    ] as [number, number][];
    return (
      <svg viewBox="0 0 200 160" className={styles.alotropoSvg} aria-label="Estructura del grafeno">
        {centers.map(([cx, cy], i) => (
          <polygon key={i} points={hexPoints(cx, cy, 22)} fill="none" stroke="#48A9A6" strokeWidth="1.5" />
        ))}
        {centers.map(([cx, cy], i) => (
          <circle key={`n-${i}`} cx={cx} cy={cy} r="4" fill="#48A9A6" />
        ))}
        <text x="40" y="150" fontSize="9" fill="#48A9A6">1 átomo de grosor (0,335 nm)</text>
      </svg>
    );
  }
  // fullereno
  return (
    <svg viewBox="0 0 200 160" className={styles.alotropoSvg} aria-label="Estructura del fullereno C60">
      <circle cx="100" cy="80" r="55" fill="none" stroke="#F0A500" strokeWidth="2" />
      {/* pentagons & hexagons estilizados */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
        const cx = 100 + 30 * Math.cos(angle);
        const cy = 80 + 30 * Math.sin(angle);
        return <circle key={i} cx={cx} cy={cy} r="12" fill="none" stroke="#F0A500" strokeWidth="1.5" />;
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const cx = 100 + 50 * Math.cos(angle);
        const cy = 80 + 50 * Math.sin(angle);
        return <circle key={`h-${i}`} cx={cx} cy={cy} r="4" fill="#F0A500" />;
      })}
      <text x="68" y="150" fontSize="9" fill="#F0A500">60 átomos de carbono</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCarbono(): React.ReactNode {
  const [alotropoActivo, setAlotropoActivo] = useState<Alotropo>('grafito');
  const [anosC14, setAnosC14] = useState<number>(5730);
  const [grupoActivo, setGrupoActivo] = useState<number | null>(null);

  const alotropoInfo = ALOTROPOS.find((a) => a.id === alotropoActivo) ?? ALOTROPOS[0];
  const porcentajeC14 = calcularPorcentajeC14(anosC14);
  const mitadesTranscurridas = anosC14 / VIDA_MEDIA_C14;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">⚛️</div>
        <h1 className={styles.heroTitle}>El Carbono: La Molécula de la Vida y sus 4 Caras</h1>
        <p className={styles.heroSubtitle}>
          Un solo elemento que forma el diamante más duro, el grafeno más delgado y todas las moléculas de la vida
        </p>
        <div className={styles.heroBadges} aria-label="Datos clave del carbono">
          <span className={styles.badge}>Nº atómico: 6</span>
          <span className={styles.badge}>+10 millones de compuestos</span>
          <span className={styles.badge}>18,5% del cuerpo humano</span>
        </div>
      </header>

      <LegalNotice />

      {/* ── SECCIÓN 1: Alótropos ── */}
      <section className={styles.section} aria-labelledby="alotropos-titulo">
        <h2 id="alotropos-titulo" className={styles.sectionTitle}>
          <span aria-hidden="true">🔄</span> Los 4 alótropos del carbono
        </h2>
        <p className={styles.sectionSubtitle}>
          El mismo elemento, estructuras radicalmente distintas, propiedades opuestas
        </p>

        <div className={styles.alotroposSelector} role="tablist" aria-label="Seleccionar alótropo">
          {ALOTROPOS.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={alotropoActivo === a.id}
              className={`${styles.alotropoBtn} ${alotropoActivo === a.id ? styles.alotropoBtnActive : ''}`}
              onClick={() => setAlotropoActivo(a.id)}
              style={alotropoActivo === a.id ? { borderColor: a.color, color: a.color } : undefined}
            >
              <span aria-hidden="true">{a.icono}</span>
              {a.nombre}
            </button>
          ))}
        </div>

        <div
          className={styles.alotropoPanel}
          role="tabpanel"
          aria-label={`Información sobre ${alotropoInfo.nombre}`}
          style={{ borderColor: alotropoInfo.color + '66' }}
        >
          <div className={styles.alotropoPanelLeft}>
            <SvgAlotropo id={alotropoActivo} />
          </div>
          <div className={styles.alotropoPanelRight}>
            <h3 className={styles.alotropoNombre} style={{ color: alotropoInfo.color }}>
              {alotropoInfo.icono} {alotropoInfo.nombre}
            </h3>
            <p className={styles.alotropoDesc}>{alotropoInfo.descripcion}</p>

            <div className={styles.alotropoListas}>
              <div>
                <h4 className={styles.listaTitle}>Propiedades clave</h4>
                <ul className={styles.lista}>
                  {alotropoInfo.propiedades.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className={styles.listaTitle}>Usos principales</h4>
                <ul className={styles.lista}>
                  {alotropoInfo.usos.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: Ciclo del carbono ── */}
      <section className={styles.section} aria-labelledby="ciclo-titulo">
        <h2 id="ciclo-titulo" className={styles.sectionTitle}>
          <span aria-hidden="true">🌍</span> El Ciclo del Carbono
        </h2>
        <p className={styles.sectionSubtitle}>
          Reservorios globales y flujos anuales — el desequilibrio humano en rojo
        </p>

        <div className={styles.cicloCarbonoWrapper}>
          <div className={styles.reservoriosGrid}>
            {RESERVORIOS.map((r) => (
              <div
                key={r.nombre}
                className={styles.reservorio}
                style={{ borderColor: r.color }}
              >
                <div className={styles.reservorioCantidad} style={{ color: r.color }}>
                  {r.cantidad}
                  <span className={styles.reservorioUnidad}> {r.unidad}</span>
                </div>
                <div className={styles.reservorioNombre}>{r.nombre}</div>
                <div className={styles.reservorioDesc}>{r.descripcion}</div>
              </div>
            ))}
          </div>

          <div className={styles.flujosGrid}>
            <h3 className={styles.flujosTitle}>Flujos anuales principales</h3>
            <div className={styles.flujo}>
              <span className={styles.flujoFlecha} style={{ color: '#3a9e4a' }}>↓</span>
              <div>
                <strong>Fotosíntesis:</strong> ~123 Gt C/año absorbidos por plantas
              </div>
            </div>
            <div className={styles.flujo}>
              <span className={styles.flujoFlecha} style={{ color: '#aaa' }}>↑</span>
              <div>
                <strong>Respiración:</strong> ~119 Gt C/año devueltos a la atmósfera
              </div>
            </div>
            <div className={`${styles.flujo} ${styles.flujoHumano}`}>
              <span className={styles.flujoFlecha} style={{ color: '#e74c3c' }}>↑</span>
              <div>
                <strong>Quema de combustibles fósiles:</strong> ~10 Gt C/año extra (desequilibrio humano)
              </div>
            </div>
            <div className={styles.flujo}>
              <span className={styles.flujoFlecha} style={{ color: '#2E86AB' }}>↓</span>
              <div>
                <strong>Absorción oceánica neta:</strong> ~2,5 Gt C/año
              </div>
            </div>
            <div className={styles.warningBox} role="alert">
              <span aria-hidden="true">⚠️</span> Desequilibrio neto: +~7,5 Gt C/año permanecen en la atmósfera → CO₂ acumulado → calentamiento global
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: Las 4 valencias ── */}
      <section className={styles.section} aria-labelledby="valencias-titulo">
        <h2 id="valencias-titulo" className={styles.sectionTitle}>
          <span aria-hidden="true">🔗</span> Las 4 valencias del carbono
        </h2>
        <p className={styles.sectionSubtitle}>
          4 electrones de valencia → 4 enlaces posibles → millones de compuestos
        </p>

        <div className={styles.valenciasConcepto}>
          <div className={styles.valenciasAtomo} aria-label="Representación del átomo de carbono con 4 enlaces">
            <div className={styles.atomoNucleo}>C</div>
            {['arriba', 'abajo', 'izquierda', 'derecha'].map((pos) => (
              <div key={pos} className={`${styles.atomoEnlace} ${styles[`enlace${pos.charAt(0).toUpperCase() + pos.slice(1)}`]}`}>
                <div className={styles.atomoH}>H</div>
              </div>
            ))}
          </div>
          <div className={styles.valenciasTexto}>
            <p>El carbono tiene <strong>4 electrones de valencia</strong> y puede formar:</p>
            <ul className={styles.listaValencias}>
              <li><code>C–C</code> Enlace simple (alcanos)</li>
              <li><code>C═C</code> Enlace doble (alquenos, mayor reactividad)</li>
              <li><code>C≡C</code> Enlace triple (alquinos, muy reactivo)</li>
              <li><code>C–H, C–O, C–N, C–S…</code> Con otros elementos</li>
            </ul>
            <p className={styles.datoDestacado}>
              Se conocen <strong>+10 millones</strong> de compuestos de carbono<br />
              vs. ~100.000 del <em>resto de elementos juntos</em>
            </p>
          </div>
        </div>

        <h3 className={styles.subSectionTitle}>Grupos funcionales (pulsa para explorar)</h3>
        <div className={styles.valenciasGrid} role="list">
          {GRUPOS_FUNCIONALES.map((g, i) => (
            <button
              key={i}
              role="listitem"
              className={`${styles.grupoFuncional} ${grupoActivo === i ? styles.grupoFuncionalActivo : ''}`}
              onClick={() => setGrupoActivo(grupoActivo === i ? null : i)}
              aria-expanded={grupoActivo === i}
              aria-label={`Ver información sobre ${g.nombre}`}
            >
              <div className={styles.grupoFormula}>{g.formula}</div>
              <div className={styles.grupoNombre}>{g.nombre}</div>
              {grupoActivo === i && (
                <div className={styles.grupoDetalle}>
                  <p>{g.descripcion}</p>
                  <p><em>Ejemplo: {g.ejemplo}</em></p>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 4: C-14 ── */}
      <section className={styles.section} aria-labelledby="c14-titulo">
        <h2 id="c14-titulo" className={styles.sectionTitle}>
          <span aria-hidden="true">⏱️</span> El Carbono-14: Reloj Radiométrico
        </h2>
        <p className={styles.sectionSubtitle}>
          Cómo un isótopo inestable nos permite fechar la historia de la humanidad
        </p>

        <div className={styles.c14Wrapper}>
          <div className={styles.c14Explicacion}>
            <div className={styles.c14Paso}>
              <span className={styles.c14PasoNum}>1</span>
              <div>
                <strong>Formación:</strong> Rayos cósmicos → N-14 en la atmósfera → C-14 (isótopo radiactivo)
              </div>
            </div>
            <div className={styles.c14Paso}>
              <span className={styles.c14PasoNum}>2</span>
              <div>
                <strong>Absorción:</strong> Los seres vivos incorporan C-14 constantemente junto al C-12 estable mientras viven
              </div>
            </div>
            <div className={styles.c14Paso}>
              <span className={styles.c14PasoNum}>3</span>
              <div>
                <strong>Muerte:</strong> Al morir, cesa la absorción. El C-14 se desintegra con vida media de <strong>5.730 años</strong>
              </div>
            </div>
            <div className={styles.c14Paso}>
              <span className={styles.c14PasoNum}>4</span>
              <div>
                <strong>Datación:</strong> Medir proporción C-14/C-12 → calcular cuántas vidas medias han pasado → edad del objeto
              </div>
            </div>
          </div>

          <div className={styles.c14Slider}>
            <label htmlFor="slider-c14" className={styles.c14SliderLabel}>
              Antigüedad estimada del objeto
            </label>
            <div className={styles.c14SliderValue} aria-live="polite">
              <strong>{anosC14.toLocaleString('es-ES')} años</strong>
            </div>
            <input
              id="slider-c14"
              type="range"
              min={0}
              max={50000}
              step={100}
              value={anosC14}
              onChange={(e) => setAnosC14(Number(e.target.value))}
              className={styles.c14Range}
              aria-label={`Seleccionar antigüedad: ${anosC14.toLocaleString('es-ES')} años`}
            />
            <div className={styles.c14RangeLabels}>
              <span>0 años</span>
              <span>50.000 años</span>
            </div>

            <div className={styles.c14Resultado}>
              <div className={styles.c14BarraWrapper} aria-hidden="true">
                <div
                  className={styles.c14Barra}
                  style={{ width: `${porcentajeC14}%` }}
                />
              </div>
              <p className={styles.c14PorcentajeTexto} aria-live="polite">
                C-14 restante: <strong>{porcentajeC14.toFixed(1)}%</strong>
                {' · '}Vidas medias transcurridas: <strong>{mitadesTranscurridas.toFixed(1)}</strong>
              </p>
            </div>

            {anosC14 > 45000 && (
              <div className={styles.c14Aviso} role="alert">
                ⚠️ Por encima de ~50.000 años, el C-14 residual es tan mínimo que la medición pierde precisión
              </div>
            )}
          </div>
        </div>

        <div className={styles.c14CasosFamosos}>
          <h3 className={styles.subSectionTitle}>Casos históricos famosos</h3>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">⛪</span>
              <strong>Sábana Santa de Turín</strong>
              <p>Datada en 1260-1390 d.C. (no del siglo I como se creía)</p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">🧊</span>
              <strong>Ötzi, el hombre de hielo</strong>
              <p>~5.300 años de antigüedad (aprox. 3.300 a.C.)</p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">📜</span>
              <strong>Rollos del Mar Muerto</strong>
              <p>Entre el 408 a.C. y el 318 d.C. — confirmado por C-14</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 5: Carbono en números ── */}
      <section className={styles.section} aria-labelledby="numeros-titulo">
        <h2 id="numeros-titulo" className={styles.sectionTitle}>
          <span aria-hidden="true">📊</span> El Carbono en números
        </h2>
        <p className={styles.sectionSubtitle}>Datos impactantes sobre el elemento más versátil del universo</p>

        <div className={styles.dataCards} role="list">
          {[
            { valor: '6', etiqueta: 'Número atómico', detalle: 'Masa atómica: 12,011 u', icono: '⚛️' },
            { valor: '4.º', etiqueta: 'Elemento más abundante del universo', detalle: 'Por masa, tras H, He y O', icono: '🌌' },
            { valor: '18,5%', etiqueta: 'Del cuerpo humano es carbono', detalle: '~12 kg en un adulto de 70 kg', icono: '🧬' },
            { valor: '50 km', etiqueta: 'Traza un lápiz antes de agotarse', detalle: 'Capas de grafito depositadas en papel', icono: '✏️' },
            { valor: '2.600 m²', etiqueta: 'Cubre 1 gramo de grafeno', detalle: 'Una cancha de tenis = ~260 m²', icono: '📐' },
            { valor: '6×10²¹', etiqueta: 'Átomos en un diamante de 1 quilate', detalle: '0,2 gramos = 6 trillones de átomos', icono: '💎' },
          ].map((d, i) => (
            <div key={i} className={styles.dataCard} role="listitem">
              <span className={styles.dataCardIcono} aria-hidden="true">{d.icono}</span>
              <div className={styles.dataCardValor}>{d.valor}</div>
              <div className={styles.dataCardEtiqueta}>{d.etiqueta}</div>
              <div className={styles.dataCardDetalle}>{d.detalle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 6: Educativa ── */}
      <EducationalSection
        title="Más sobre el Carbono"
        subtitle="El elemento más versátil del universo"
      >
        <div className={styles.eduContent}>
          <h3>¿Por qué el carbono es tan especial?</h3>
          <p>
            El carbono es único porque combina cuatro propiedades que no se dan juntas en ningún otro elemento:
            <strong> geometría tetraédrica</strong> (4 enlaces en 3D), capacidad de formar <strong>cadenas largas</strong> (catenación),
            posibilidad de crear <strong>dobles y triples enlaces</strong>, y alta estabilidad de sus uniones con H, O, N y S.
            Esta combinación permite construir una diversidad molecular prácticamente infinita.
          </p>

          <h3>Química orgánica vs. química inorgánica del carbono</h3>
          <p>
            La <strong>química orgánica</strong> estudia compuestos con C–H (históricamente "de organismos vivos").
            La <strong>química inorgánica del carbono</strong> incluye CO₂, carbonatos (CaCO₃ del mármol) y los propios alótropos
            (diamante, grafito…). La distinción es histórica: hoy se sabe que no hay barrera entre lo &ldquo;vivo&rdquo; y lo &ldquo;inerte&rdquo;
            en química.
          </p>

          <h3>El grafeno y los materiales del futuro</h3>
          <p>
            Desde su aislamiento en 2004 (Nobel 2010), el grafeno ha prometido revolucionar múltiples industrias.
            Sus aplicaciones más cercanas a la realidad: <strong>electrónica flexible</strong> (pantallas enrollables),
            <strong>filtros de desalinización</strong> (solo el agua pasa, no las sales), y <strong>baterías de próxima generación</strong>
            (carga en minutos en lugar de horas). El principal reto sigue siendo producirlo a escala industrial sin defectos.
          </p>

          <h3>El carbono en la industria</h3>
          <ul>
            <li>
              <strong>Acero:</strong> Hierro + 0,2–2% de carbono. La cantidad de C determina si es suave (herramientas) o duro (estructuras).
            </li>
            <li>
              <strong>Plásticos:</strong> Cadenas de polímeros orgánicos (polietileno, PET, nylon) todas basadas en esqueletos de carbono.
            </li>
            <li>
              <strong>Fibra de carbono:</strong> Filamentos de grafito alineados. 5× más ligero que el acero con igual resistencia.
              Presente en aeronáutica, Fórmula 1 y prótesis deportivas.
            </li>
            <li>
              <strong>Carbón activo:</strong> Grafito poroso con superficie interna gigantesca (~1.000 m²/g).
              Filtra toxinas, metales pesados y contaminantes del agua y el aire.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-carbono')} />
      <ShareCard appName="visualizador-carbono" />
      <Footer appName="visualizador-carbono" />
    </div>
  );
}
