'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './PolimerosMateriales.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { generateJsonLd } from './metadata';

type Tab = 'polimerizacion' | 'propiedades' | 'clasificacion' | 'sostenibilidad';

interface PropiedadesPolimero {
  nombre: string;
  codigo: number;
  tm: number;
  tg: number;
  densidad: number;
  resistenciaQuimica: number;
  reciclabilidad: number;
  usos: string[];
  unidadRepetitiva: string;
}

const POLIMEROS: PropiedadesPolimero[] = [
  {
    nombre: 'PET',
    codigo: 1,
    tm: 265,
    tg: 80,
    densidad: 1.38,
    resistenciaQuimica: 85,
    reciclabilidad: 90,
    usos: ['Botellas de agua', 'Fibra textil', 'Envases alimentarios'],
    unidadRepetitiva: '[-O-CH₂CH₂-O-CO-C₆H₄-CO-]ₙ',
  },
  {
    nombre: 'HDPE',
    codigo: 2,
    tm: 130,
    tg: -120,
    densidad: 0.95,
    resistenciaQuimica: 90,
    reciclabilidad: 85,
    usos: ['Botellas de leche', 'Tuberías', 'Juguetes'],
    unidadRepetitiva: '[-CH₂-CH₂-]ₙ',
  },
  {
    nombre: 'PVC',
    codigo: 3,
    tm: 212,
    tg: 87,
    densidad: 1.38,
    resistenciaQuimica: 88,
    reciclabilidad: 40,
    usos: ['Tuberías', 'Perfiles ventana', 'Cables'],
    unidadRepetitiva: '[-CH₂-CHCl-]ₙ',
  },
  {
    nombre: 'PP',
    codigo: 5,
    tm: 165,
    tg: -10,
    densidad: 0.91,
    resistenciaQuimica: 80,
    reciclabilidad: 70,
    usos: ['Tapones', 'Envases yogur', 'Ropa interior técnica'],
    unidadRepetitiva: '[-CH₂-CH(CH₃)-]ₙ',
  },
  {
    nombre: 'PS',
    codigo: 6,
    tm: 240,
    tg: 100,
    densidad: 1.05,
    resistenciaQuimica: 40,
    reciclabilidad: 20,
    usos: ['Vasos desechables', 'Aislante EPS', 'Carcasas electrónica'],
    unidadRepetitiva: '[-CH₂-CH(C₆H₅)-]ₙ',
  },
  {
    nombre: 'PTFE',
    codigo: 7,
    tm: 327,
    tg: -97,
    densidad: 2.20,
    resistenciaQuimica: 100,
    reciclabilidad: 10,
    usos: ['Teflón (sartenes)', 'Juntas industriales', 'Cables coaxiales'],
    unidadRepetitiva: '[-CF₂-CF₂-]ₙ',
  },
];

const CODIGOS_RECICLAJE = [
  { num: 1, sigla: 'PET', nombre: 'Tereftalato de polietileno', ejemplos: 'Botellas de agua y refrescos', color: '#2E86AB' },
  { num: 2, sigla: 'HDPE', nombre: 'Polietileno de alta densidad', ejemplos: 'Botellas de leche, detergentes', color: '#48A9A6' },
  { num: 3, sigla: 'PVC', nombre: 'Cloruro de polivinilo', ejemplos: 'Tuberías, marcos de ventana', color: '#7FB3D3' },
  { num: 4, sigla: 'LDPE', nombre: 'Polietileno de baja densidad', ejemplos: 'Bolsas de plástico, film', color: '#2E86AB' },
  { num: 5, sigla: 'PP', nombre: 'Polipropileno', ejemplos: 'Tapones, envases de yogur', color: '#48A9A6' },
  { num: 6, sigla: 'PS', nombre: 'Poliestireno', ejemplos: 'Vasos, platos desechables, EPS', color: '#7FB3D3' },
  { num: 7, sigla: 'Otros', nombre: 'Otros plásticos', ejemplos: 'PC, mezclas, bioplásticos', color: '#2E86AB' },
];

type NodoId = 'termoplasticos' | 'cristalinos' | 'amorfos' | 'termoestables' | 'epoxi' | 'baquelita' | 'poliuretano' | 'elastomeros' | 'natural' | 'sbr' | 'silicona';

interface NodoInfo {
  label: string;
  propiedadClave: string;
  ejemplos: string[];
  descripcion: string;
}

const NODOS: Record<NodoId, NodoInfo> = {
  termoplasticos: {
    label: 'Termoplásticos',
    propiedadClave: 'Se pueden refundir repetidamente sin degradarse',
    ejemplos: ['Botellas PET', 'Bolsas HDPE', 'Tuberías PVC', 'Envases PP'],
    descripcion: 'Cadenas lineales o ramificadas unidas por fuerzas de Van der Waals. Al calentar, las cadenas se deslizan entre sí permitiendo moldear el material.',
  },
  cristalinos: {
    label: 'Cristalinos',
    propiedadClave: 'Zonas ordenadas (cristalitas) + zonas amorfas. Temperatura de fusión (Tm) bien definida',
    ejemplos: ['HDPE (bolsas)', 'PET (botellas)', 'Nylon (tejidos)', 'PP (envases)'],
    descripcion: 'Las cadenas se empaquetan en regiones ordenadas. Son más opacos, resistentes y tienen punto de fusión nítido.',
  },
  amorfos: {
    label: 'Amorfos',
    propiedadClave: 'Sin orden a largo alcance. Se ablandan gradualmente en torno a Tg',
    ejemplos: ['PS (vasos)', 'PMMA (metacrilato)', 'PC (gafas)', 'ABS (carcasas)'],
    descripcion: 'Las cadenas están dispuestas al azar. Son más transparentes y se vuelven gomosos por encima de la temperatura de transición vítrea (Tg).',
  },
  termoestables: {
    label: 'Termoestables',
    propiedadClave: 'Red tridimensional de enlaces covalentes cruzados. NO pueden refundirse',
    ejemplos: ['Epoxi (adhesivos)', 'Baquelita (enchufes)', 'Poliuretano rígido', 'Resina poliéster'],
    descripcion: 'Durante el curado se forman enlaces covalentes entre cadenas creando una red 3D irreversible. Al calentar se degradan en lugar de fundirse.',
  },
  epoxi: {
    label: 'Epoxi',
    propiedadClave: 'Excelente adhesión, resistencia química, baja contracción',
    ejemplos: ['Adhesivos estructurales', 'Recubrimientos anticorrosión', 'Composites de carbono', 'Encapsulado electrónico'],
    descripcion: 'Resina de dos componentes (resina + endurecedor). Al mezclar reaccionan formando una red epóxida de alta resistencia.',
  },
  baquelita: {
    label: 'Fenol-formaldehído (Baquelita)',
    propiedadClave: 'Primer plástico sintético (1907). Excelente aislante eléctrico',
    ejemplos: ['Enchufes e interruptores', 'Mangos de utensilios', 'Billetes de bakelita vintage', 'Carcasas de radio'],
    descripcion: 'Reacción de fenol con formaldehído en presencia de catalizador. Red fenólica muy rígida y resistente al calor.',
  },
  poliuretano: {
    label: 'Poliuretano rígido',
    propiedadClave: 'Excelente aislante térmico, alta relación resistencia/peso',
    ejemplos: ['Espuma de poliuretano (aislamiento)', 'Paneles sándwich', 'Colchones rígidos', 'Carcasas de neveras'],
    descripcion: 'Reacción de poliisocianato con poliol. La versión rígida tiene alta densidad de entrecruzamiento; la flexible menor.',
  },
  elastomeros: {
    label: 'Elastómeros',
    propiedadClave: 'Elongación reversible >100% (gomas). Entrecruzamiento ligero',
    ejemplos: ['Neumáticos (SBR)', 'Guantes de látex', 'Juntas de silicona', 'Bandas elásticas'],
    descripcion: 'Cadenas muy flexibles ligeramente entrecruzadas. Por encima de Tg (muy baja) se comportan como goma: estiran y recuperan su forma.',
  },
  natural: {
    label: 'Caucho natural',
    propiedadClave: 'Poliisopreno natural (Hevea brasiliensis). Vulcanización con azufre',
    ejemplos: ['Guantes quirúrgicos', 'Globos', 'Suelas de zapato', 'Amortiguadores'],
    descripcion: 'Látex del árbol Hevea. La vulcanización (Goodyear, 1844) crea enlaces de azufre entre cadenas mejorando resistencia y elasticidad.',
  },
  sbr: {
    label: 'SBR (Caucho estireno-butadieno)',
    propiedadClave: 'Copolímero sintético. Mayor resistencia a abrasión que caucho natural',
    ejemplos: ['Neumáticos de coche', 'Suelas de calzado', 'Cintas transportadoras', 'Mangueras'],
    descripcion: 'Copolímero de estireno y butadieno. El más usado en neumáticos (75% del caucho sintético mundial).',
  },
  silicona: {
    label: 'Silicona (PDMS)',
    propiedadClave: 'Esqueleto Si-O-Si. Estable de -60°C a +200°C. Biocompatible',
    ejemplos: ['Moldes de horno', 'Implantes médicos', 'Sellantes de ventana', 'Cables eléctricos'],
    descripcion: 'Polímero inorgánico-orgánico. La cadena de siloxano (Si-O) le da estabilidad térmica y química excepcional.',
  },
};

export default function VisualizadorPolimerosMateriales() {
  const [tabActiva, setTabActiva] = useState<Tab>('polimerizacion');
  const [gradoPolimerizacion, setGradoPolimerizacion] = useState(5);
  const [polimeroSeleccionado, setPolimeroSeleccionado] = useState<PropiedadesPolimero>(POLIMEROS[0]);
  const [nodoActivo, setNodoActivo] = useState<NodoId | null>(null);
  const jsonLd = generateJsonLd();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'polimerizacion', label: 'Polimerización' },
    { id: 'propiedades', label: 'Propiedades' },
    { id: 'clasificacion', label: 'Clasificación' },
    { id: 'sostenibilidad', label: 'Sostenibilidad' },
  ];

  const nodoInfo = nodoActivo ? NODOS[nodoActivo] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Polímeros y Materiales</h1>
          <p className={styles.heroSubtitle}>
            Polimerización, propiedades, clasificación y sostenibilidad de los plásticos
          </p>
        </header>

        <LegalNotice />

        <nav className={styles.tabBar} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tabActiva === t.id}
              className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
              onClick={() => setTabActiva(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* TAB 1: POLIMERIZACIÓN */}
        {tabActiva === 'polimerizacion' && (
          <section className={styles.seccion} aria-label="Mecanismos de polimerización">
            <h2 className={styles.seccionTitulo}>Mecanismos de Polimerización</h2>
            <div className={styles.polimerizacionGrid}>
              {/* Adición */}
              <div className={styles.mecanismoBox}>
                <h3 className={styles.mecanismoTitulo}>Adición</h3>
                <p className={styles.mecanismoDesc}>
                  Los monómeros con doble enlace C=C se encadenan directamente sin pérdida de átomos. El doble enlace se abre y forma la cadena.
                </p>
                <div className={styles.sliderRow}>
                  <label htmlFor="grado-polimerizacion" className={styles.sliderLabel}>
                    Grado de polimerización: <strong>{gradoPolimerizacion}</strong>
                  </label>
                  <input
                    id="grado-polimerizacion"
                    type="range"
                    min={1}
                    max={10}
                    value={gradoPolimerizacion}
                    onChange={(e) => setGradoPolimerizacion(Number(e.target.value))}
                    className={styles.slider}
                    aria-label="Ajustar grado de polimerización"
                  />
                </div>
                <div className={styles.cadenaAnimada} aria-label={`Cadena de ${gradoPolimerizacion} monómeros`}>
                  {Array.from({ length: gradoPolimerizacion }).map((_, i) => (
                    <span key={i} className={styles.monomeroBadge}>
                      {i === 0 ? 'CH₂=CH₂' : '-CH₂-CH₂'}
                    </span>
                  ))}
                </div>
                <div className={styles.ejemplosLista}>
                  <strong>Ejemplos:</strong>
                  <ul>
                    <li>PE (polietileno) — bolsas, tuberías</li>
                    <li>PVC (cloruro de polivinilo) — ventanas, cables</li>
                    <li>PP (polipropileno) — envases, fibras</li>
                    <li>PS (poliestireno) — vasos, EPS</li>
                    <li>PTFE (teflón) — sartenes, juntas</li>
                  </ul>
                </div>
              </div>

              {/* Condensación */}
              <div className={styles.mecanismoBox}>
                <h3 className={styles.mecanismoTitulo}>Condensación</h3>
                <p className={styles.mecanismoDesc}>
                  Dos grupos funcionales diferentes reaccionan liberando una molécula pequeña (H₂O, HCl). Cada paso produce un dímero, trímero... y finalmente la cadena.
                </p>
                <div className={styles.condensacionDiagrama}>
                  <div className={styles.grupoFuncional}>
                    <span className={styles.grupoBadge} style={{ background: 'var(--primary)' }}>-COOH</span>
                    <span className={styles.grupoNombre}>Ácido</span>
                  </div>
                  <span className={styles.masSigno}>+</span>
                  <div className={styles.grupoFuncional}>
                    <span className={styles.grupoBadge} style={{ background: 'var(--secondary)' }}>-NH₂</span>
                    <span className={styles.grupoNombre}>Amina</span>
                  </div>
                  <span className={styles.flechaReaccion}>→</span>
                  <div className={styles.grupoFuncional}>
                    <span className={styles.grupoBadge} style={{ background: '#666' }}>-CO-NH-</span>
                    <span className={styles.grupoNombre}>Amida (Nylon)</span>
                  </div>
                  <span className={styles.masSigno}>+</span>
                  <div className={styles.grupoFuncional}>
                    <span className={styles.grupoBadge} style={{ background: '#48A9A6', color: '#fff' }}>H₂O</span>
                    <span className={styles.grupoNombre}>Subproducto</span>
                  </div>
                </div>
                <div className={styles.ejemplosLista}>
                  <strong>Ejemplos:</strong>
                  <ul>
                    <li>Nylon-6,6 (amida) — textil, engranajes</li>
                    <li>PET (éster) — botellas, fibra textil</li>
                    <li>Policarbonato (carbonato) — gafas, DVD</li>
                    <li>Seda/proteínas (péptido) — biopolímero natural</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tabla comparativa */}
            <div className={styles.tablaComparativa}>
              <h3 className={styles.tablaTitle}>Comparativa: Adición vs Condensación</h3>
              <div className={styles.tablaScroll}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Aspecto</th>
                      <th>Adición</th>
                      <th>Condensación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Tipo de monómero</td>
                      <td>Un solo tipo (insaturado C=C)</td>
                      <td>Dos grupos funcionales (-COOH, -OH, -NH₂...)</td>
                    </tr>
                    <tr>
                      <td>Subproductos</td>
                      <td>Ninguno</td>
                      <td>H₂O, HCl u otras moléculas pequeñas</td>
                    </tr>
                    <tr>
                      <td>Mecanismo</td>
                      <td>Radicales libres, catiónico, aniónico</td>
                      <td>Paso a paso (condensación bifuncional)</td>
                    </tr>
                    <tr>
                      <td>Masa molar</td>
                      <td>Crece muy rápido al inicio</td>
                      <td>Crece lentamente, alta conversión necesaria</td>
                    </tr>
                    <tr>
                      <td>Ejemplos</td>
                      <td>PE, PVC, PP, PS, PTFE</td>
                      <td>Nylon, PET, PC, poliuretano</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: PROPIEDADES */}
        {tabActiva === 'propiedades' && (
          <section className={styles.seccion} aria-label="Propiedades de polímeros comunes">
            <h2 className={styles.seccionTitulo}>Propiedades de Polímeros</h2>
            <div className={styles.propiedadesGrid}>
              {POLIMEROS.map((p) => (
                <button
                  key={p.nombre}
                  type="button"
                  className={`${styles.polimeroBtn} ${polimeroSeleccionado.nombre === p.nombre ? styles.polimeroBtnActive : ''}`}
                  onClick={() => setPolimeroSeleccionado(p)}
                  aria-pressed={polimeroSeleccionado.nombre === p.nombre}
                >
                  {p.nombre}
                  <span className={styles.codigoBadge}>{p.codigo}</span>
                </button>
              ))}
            </div>

            <div className={styles.propiedadesPanel}>
              <div className={styles.propiedadesHeader}>
                <h3 className={styles.polimeroNombre}>{polimeroSeleccionado.nombre}</h3>
                <span className={styles.codigoReciclaje} aria-label={`Código de reciclaje ${polimeroSeleccionado.codigo}`}>
                  ♻ {polimeroSeleccionado.codigo}
                </span>
              </div>

              <p className={styles.unidadRepetitiva}>
                Unidad repetitiva: <code>{polimeroSeleccionado.unidadRepetitiva}</code>
              </p>

              <div className={styles.propiedadesBarras}>
                <div className={styles.barraPropiedad}>
                  <span className={styles.barraNombre}>Temperatura de fusión (Tm)</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraFill}
                      style={{ width: `${(polimeroSeleccionado.tm / 400) * 100}%` }}
                      aria-label={`${polimeroSeleccionado.tm} °C`}
                    />
                  </div>
                  <span className={styles.barraValor}>{polimeroSeleccionado.tm} °C</span>
                </div>

                <div className={styles.barraPropiedad}>
                  <span className={styles.barraNombre}>Temperatura de transición vítrea (Tg)</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraFill}
                      style={{ width: `${Math.max(5, ((polimeroSeleccionado.tg + 130) / 250) * 100)}%` }}
                      aria-label={`${polimeroSeleccionado.tg} °C`}
                    />
                  </div>
                  <span className={styles.barraValor}>{polimeroSeleccionado.tg} °C</span>
                </div>

                <div className={styles.barraPropiedad}>
                  <span className={styles.barraNombre}>Densidad</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraFill}
                      style={{ width: `${((polimeroSeleccionado.densidad - 0.8) / 1.6) * 100}%` }}
                      aria-label={`${polimeroSeleccionado.densidad} g/cm³`}
                    />
                  </div>
                  <span className={styles.barraValor}>{polimeroSeleccionado.densidad} g/cm³</span>
                </div>

                <div className={styles.barraPropiedad}>
                  <span className={styles.barraNombre}>Resistencia química</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={styles.barraFill}
                      style={{ width: `${polimeroSeleccionado.resistenciaQuimica}%` }}
                      aria-label={`${polimeroSeleccionado.resistenciaQuimica}%`}
                    />
                  </div>
                  <span className={styles.barraValor}>{polimeroSeleccionado.resistenciaQuimica}%</span>
                </div>

                <div className={styles.barraPropiedad}>
                  <span className={styles.barraNombre}>Reciclabilidad</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={`${styles.barraFill} ${polimeroSeleccionado.reciclabilidad < 50 ? styles.barraFillBajo : ''}`}
                      style={{ width: `${polimeroSeleccionado.reciclabilidad}%` }}
                      aria-label={`${polimeroSeleccionado.reciclabilidad}%`}
                    />
                  </div>
                  <span className={styles.barraValor}>{polimeroSeleccionado.reciclabilidad}%</span>
                </div>
              </div>

              <div className={styles.usosList}>
                <strong>Usos principales:</strong>
                <ul>
                  {polimeroSeleccionado.usos.map((uso) => (
                    <li key={uso}>{uso}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.warningBox}>
              <h4>Tm vs Tg: ¿cuál es la diferencia?</h4>
              <p>
                <strong>Tm (temperatura de fusión)</strong> aplica a polímeros cristalinos: es la temperatura a la que las regiones ordenadas (cristalitas) se funden. Es un cambio de fase abrupto.
              </p>
              <p>
                <strong>Tg (temperatura de transición vítrea)</strong> aplica a polímeros amorfos: por debajo de Tg el material es rígido y frágil (vítreo); por encima es gomoso y flexible. No es una fusión sino un cambio gradual en la movilidad de segmentos de cadena.
              </p>
              <p>
                Los polímeros semicristalinos tienen <strong>ambas</strong>: Tg (zona amorfa) y Tm (zona cristalina).
              </p>
            </div>
          </section>
        )}

        {/* TAB 3: CLASIFICACIÓN */}
        {tabActiva === 'clasificacion' && (
          <section className={styles.seccion} aria-label="Clasificación de polímeros">
            <h2 className={styles.seccionTitulo}>Clasificación de Polímeros</h2>
            <p className={styles.instruccion}>Haz clic en cada categoría para ver sus detalles.</p>

            <div className={styles.clasificacionTree}>
              {/* Raíz */}
              <div className={styles.raiz}>
                <span className={styles.nodoRaiz}>Polímeros</span>
              </div>

              {/* Nivel 1 */}
              <div className={styles.nivel1}>
                {(['termoplasticos', 'termoestables', 'elastomeros'] as NodoId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.nodo} ${nodoActivo === id ? styles.nodoActivo : ''}`}
                    onClick={() => setNodoActivo(nodoActivo === id ? null : id)}
                    aria-pressed={nodoActivo === id}
                    aria-expanded={nodoActivo === id}
                  >
                    {NODOS[id].label}
                  </button>
                ))}
              </div>

              {/* Sub-nodos */}
              <div className={styles.nivel2}>
                {/* Termoplásticos */}
                <div className={styles.subnodos}>
                  {(['cristalinos', 'amorfos'] as NodoId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.nodo} ${styles.nodoSecundario} ${nodoActivo === id ? styles.nodoActivo : ''}`}
                      onClick={() => setNodoActivo(nodoActivo === id ? null : id)}
                      aria-pressed={nodoActivo === id}
                      aria-expanded={nodoActivo === id}
                    >
                      {NODOS[id].label}
                    </button>
                  ))}
                </div>

                {/* Termoestables */}
                <div className={styles.subnodos}>
                  {(['epoxi', 'baquelita', 'poliuretano'] as NodoId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.nodo} ${styles.nodoSecundario} ${nodoActivo === id ? styles.nodoActivo : ''}`}
                      onClick={() => setNodoActivo(nodoActivo === id ? null : id)}
                      aria-pressed={nodoActivo === id}
                      aria-expanded={nodoActivo === id}
                    >
                      {NODOS[id].label}
                    </button>
                  ))}
                </div>

                {/* Elastómeros */}
                <div className={styles.subnodos}>
                  {(['natural', 'sbr', 'silicona'] as NodoId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={`${styles.nodo} ${styles.nodoSecundario} ${nodoActivo === id ? styles.nodoActivo : ''}`}
                      onClick={() => setNodoActivo(nodoActivo === id ? null : id)}
                      aria-pressed={nodoActivo === id}
                      aria-expanded={nodoActivo === id}
                    >
                      {NODOS[id].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel de detalle */}
              {nodoInfo && (
                <div className={styles.nodoDetalle} role="region" aria-live="polite">
                  <h3 className={styles.nodoDetalleTitle}>{nodoInfo.label}</h3>
                  <p className={styles.propiedadClave}>
                    <strong>Propiedad clave:</strong> {nodoInfo.propiedadClave}
                  </p>
                  <p className={styles.nodoDescripcion}>{nodoInfo.descripcion}</p>
                  <div className={styles.ejemplosGrid}>
                    {nodoInfo.ejemplos.map((ej) => (
                      <span key={ej} className={styles.ejemploBadge}>{ej}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Códigos de reciclaje */}
            <div className={styles.codigosSeccion}>
              <h3 className={styles.codigosTitle}>7 Códigos de Reciclaje de Plásticos</h3>
              <div className={styles.codigoGrid}>
                {CODIGOS_RECICLAJE.map((c) => (
                  <div key={c.num} className={styles.codigoCard}>
                    <div className={styles.codigoNum} style={{ borderColor: c.color, color: c.color }}>
                      {c.num}
                    </div>
                    <div className={styles.codigoSigla}>{c.sigla}</div>
                    <div className={styles.codigoNombre}>{c.nombre}</div>
                    <div className={styles.codigoEjemplos}>{c.ejemplos}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: SOSTENIBILIDAD */}
        {tabActiva === 'sostenibilidad' && (
          <section className={styles.seccion} aria-label="Sostenibilidad de los plásticos">
            <h2 className={styles.seccionTitulo}>Sostenibilidad y Ciclo de Vida</h2>

            {/* Ciclo de vida */}
            <div className={styles.cicloVidaSeccion}>
              <h3 className={styles.subseccionTitle}>Ciclo de Vida del Plástico</h3>
              <div className={styles.cicloVida}>
                {[
                  { icono: '🛢️', label: 'Extracción', desc: 'Petróleo/gas natural' },
                  { icono: '🏭', label: 'Refinería', desc: 'Cracking, destilación' },
                  { icono: '⚗️', label: 'Monómeros', desc: 'Etileno, propileno...' },
                  { icono: '🔗', label: 'Polimerización', desc: 'Formación de polímeros' },
                  { icono: '📦', label: 'Producto', desc: 'Moldeo, extrusión' },
                  { icono: '🛒', label: 'Uso', desc: 'Consumidor final' },
                  { icono: '♻️', label: 'Fin de vida', desc: 'Reciclaje · Vertedero · Incineración' },
                ].map((paso, i) => (
                  <div key={i} className={styles.cicloEtapa}>
                    <span className={styles.cicloIcono} aria-hidden="true">{paso.icono}</span>
                    <span className={styles.cicloLabel}>{paso.label}</span>
                    <span className={styles.cicloDesc}>{paso.desc}</span>
                    {i < 6 && <span className={styles.cicloFlecha} aria-hidden="true">→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Biodegradabilidad */}
            <div className={styles.biodegSeccion}>
              <h3 className={styles.subseccionTitle}>Tiempo de Degradación (escala logarítmica)</h3>
              <div className={styles.biodegGrid}>
                {[
                  { material: 'Papel', tiempo: '2-5 semanas', años: 0.07, color: '#48A9A6' },
                  { material: 'Algodón', tiempo: '1-5 meses', años: 0.2, color: '#7FB3D3' },
                  { material: 'LDPE (bolsa)', tiempo: '20-1000 años', años: 200, color: '#2E86AB' },
                  { material: 'PET', tiempo: '450 años', años: 450, color: '#1a5c78' },
                  { material: 'HDPE', tiempo: '>1000 años', años: 1000, color: '#0d3347' },
                ].map((item) => {
                  const maxLog = Math.log10(1001);
                  const itemLog = Math.log10(item.años + 0.01);
                  const pct = Math.min(95, Math.max(5, (itemLog / maxLog) * 100));
                  return (
                    <div key={item.material} className={styles.biodegFila}>
                      <span className={styles.biodegMaterial}>{item.material}</span>
                      <div className={styles.biodegBarraTrack}>
                        <div
                          className={styles.biodegBarraFill}
                          style={{ width: `${pct}%`, background: item.color }}
                          aria-label={item.tiempo}
                        />
                      </div>
                      <span className={styles.biodegTiempo}>{item.tiempo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Biopolímeros */}
            <div className={styles.biopolimerosSeccion}>
              <h3 className={styles.subseccionTitle}>Biopolímeros Alternativos</h3>
              <div className={styles.tablaScroll}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Biopolímero</th>
                      <th>Fuente</th>
                      <th>Compostable</th>
                      <th>Aplicaciones</th>
                      <th>Limitaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>PLA</strong> (ácido poliláctico)</td>
                      <td>Almidón de maíz/patata</td>
                      <td className={styles.si}>Sí (industrial)</td>
                      <td>Envases, impresión 3D, suturas</td>
                      <td>Frágil, Tg baja (~60°C)</td>
                    </tr>
                    <tr>
                      <td><strong>PHA</strong> (polihidroxialcanoatos)</td>
                      <td>Bacterias (fermentación)</td>
                      <td className={styles.si}>Sí (suelo y mar)</td>
                      <td>Envases flexibles, agricultura</td>
                      <td>Coste elevado de producción</td>
                    </tr>
                    <tr>
                      <td><strong>BioPE</strong></td>
                      <td>Etanol de caña de azúcar</td>
                      <td className={styles.no}>No (idéntico al PE fósil)</td>
                      <td>Envases, bolsas</td>
                      <td>Propiedades iguales al PE fósil, solo CO₂ neutro</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Economía circular */}
            <div className={styles.economiaCircular}>
              <h3 className={styles.subseccionTitle}>Economía Circular: Jerarquía de Gestión de Residuos Plásticos</h3>
              <p className={styles.economiaDesc}>En orden de preferencia medioambiental (de más a menos deseable):</p>
              <div className={styles.nivelGrid}>
                {[
                  {
                    nivel: 1,
                    nombre: 'Reducción',
                    icono: '⬇️',
                    desc: 'Producir y consumir menos plástico. Diseño ligero y duradero.',
                    europa: '—',
                    color: '#2E86AB',
                  },
                  {
                    nivel: 2,
                    nombre: 'Reutilización',
                    icono: '🔄',
                    desc: 'Envases retornables, refill. Extender la vida útil del producto.',
                    europa: '—',
                    color: '#48A9A6',
                  },
                  {
                    nivel: 3,
                    nombre: 'Reciclaje',
                    icono: '♻️',
                    desc: 'Mecánico (refundido) o químico (depolimerización). En Europa: ~32% del plástico se recicla.',
                    europa: '32%',
                    color: '#7FB3D3',
                  },
                  {
                    nivel: 4,
                    nombre: 'Valorización energética',
                    icono: '🔥',
                    desc: 'Incineración con recuperación de energía. En Europa: ~42% del plástico se incinera con recuperación energética.',
                    europa: '42%',
                    color: '#f0a500',
                  },
                ].map((n) => (
                  <div key={n.nivel} className={styles.nivelCard} style={{ borderLeftColor: n.color }}>
                    <div className={styles.nivelHeader}>
                      <span className={styles.nivelNum} style={{ background: n.color }}>{n.nivel}</span>
                      <span className={styles.nivelIcono} aria-hidden="true">{n.icono}</span>
                      <span className={styles.nivelNombre}>{n.nombre}</span>
                      {n.europa !== '—' && (
                        <span className={styles.nivelPorcentaje}>Europa: {n.europa}</span>
                      )}
                    </div>
                    <p className={styles.nivelDesc}>{n.desc}</p>
                  </div>
                ))}
              </div>
              <p className={styles.fuenteNota}>Datos: Plastics Europe, Plastics – The Facts 2023.</p>
            </div>
          </section>
        )}

        <EducationalSection
          title="Polímeros: cadenas de moléculas que forman el mundo moderno"
          subtitle="Del nylon de 1935 a los bioplásticos del siglo XXI"
        >
          <h3>Comparativa de Tipos de Polimerización</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Mecanismo</th>
                  <th>Tipo de monómero</th>
                  <th>Subproductos</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Adición (cadena)</td>
                  <td>Monómero con C=C (vinílico)</td>
                  <td>Ninguno</td>
                  <td>PE, PP, PVC, PS, PTFE</td>
                </tr>
                <tr>
                  <td>Condensación (escalonada)</td>
                  <td>Dos grupos funcionales diferentes</td>
                  <td>H₂O, HCl, metanol</td>
                  <td>Nylon, PET, policarbonato, seda</td>
                </tr>
                <tr>
                  <td>Apertura de anillo</td>
                  <td>Monómero cíclico (lactama, lactona)</td>
                  <td>Ninguno</td>
                  <td>Nylon-6, PLA, policaprolactona</td>
                </tr>
                <tr>
                  <td>Emulsión</td>
                  <td>Monómero hidrófobo en agua</td>
                  <td>—</td>
                  <td>Látex, SBR, ABS</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📦</span> Industria del Envase</h4>
              <p>El PET (código 1) es el plástico más reciclado del mundo: botellas de agua, bandejas alimentarias. Su alta transparencia, barrera a gases y bajo peso lo hacen ideal. El HDPE (código 2) domina en botellas de leche y detergentes por su resistencia química.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🏗️</span> Ingeniería y Construcción</h4>
              <p>El PVC (código 3) es el segundo plástico más producido del mundo: tuberías, perfiles de ventana, suelos. Los elastómeros de silicona sellan juntas a -50°C/+200°C. Las resinas epoxi (termoestable) son la matriz de los composites de fibra de carbono en aeronáutica.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🏥</span> Medicina y Biotecnología</h4>
              <p>El PLA (poliláctico, biodegradable) se usa en suturas absorbibles e implantes temporales que el cuerpo degrada naturalmente. El PTFE (teflón) recubre catéteres y válvulas cardíacas por su biocompatibilidad y no adhesión.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🌱</span> Economía Circular</h4>
              <p>Los biopolímeros bio-basados (PHA, PLA de maíz) cierran el ciclo de carbono: las bacterias producen PHA almacenándolo como reserva energética. Al biodegradarse, devuelven CO₂ al ciclo atmosférico sin acumularse en el océano.</p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué no se puede fundir un termoestable para reciclarlo?</strong>
              <p>Durante el curado (polimerización), los termoestables forman una red tridimensional de enlaces covalentes entre cadenas (entrecruzamiento). Al calentar, estos enlaces covalentes se rompen antes de que el material fluya: se degrada sin fundirse. Solo pueden trituarse mecánicamente como relleno.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre Tg y Tm?</strong>
              <p>Tm (temperatura de fusión) aplica a polímeros cristalinos: a esa temperatura, las regiones cristalinas se desordenan y el material fluye. Tg (temperatura de transición vítrea) aplica a polímeros amorfos: por debajo, el polímero es rígido y frágil («vítreo»); por encima, es flexible y gomoroso («caucho»).</p>
              <div className={styles.faqTip}><span aria-hidden="true">💡</span> Muchos polímeros son semicristalinos: tienen tanto Tg (parte amorfa) como Tm (parte cristalina). El PET es un ejemplo clásico.</div>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el código de reciclaje 7 es «otros»?</strong>
              <p>Los códigos 1-6 identifican polímeros puros suficientemente abundantes para rentabilizar su reciclaje separado. El código 7 agrupa polímeros menos comunes (PC, SAN, ABS, mezclas, bioplásticos como PLA). Muchos vertederos no los aceptan por la dificultad de separarlos.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Los bioplásticos son la solución al problema del plástico?</strong>
              <p>Parcialmente. Bio-basado (de fuentes renovables) ≠ biodegradable. El bioPE está hecho de caña de azúcar, pero tarda igual que el PE convencional en degradarse ({'>'}1000 años). Los compostables como PLA solo se degradan en condiciones industriales de compostaje (60°C, humedad controlada), no en compostadores domésticos ni en el océano.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto plástico se recicla realmente?</strong>
              <p>Globalmente, solo ~9% del plástico producido se ha reciclado alguna vez (datos Ellen MacArthur Foundation). En Europa, la tasa de reciclaje ronda el 30-40% para envases, pero mucho se exporta o se infraclasifica. El reciclaje químico (pirólisis) podría cambiar esto, pero aún está en escala piloto.</p>
            </div>
          </div>

          <h3>Guía de Uso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Compara los mecanismos de polimerización</h4>
                <p>En «Polimerización», observa la animación de adición (el slider de grado de polimerización muestra el crecimiento de la cadena) y el diagrama de condensación (la liberación de H₂O en la formación del enlace).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Explora las propiedades de cada polímero</h4>
                <p>En «Propiedades», selecciona cada plástico y compara sus barras de Tm, Tg, densidad, resistencia química y reciclabilidad. Verifica si su Tg es mayor o menor que la temperatura ambiente (20°C) para saber si es rígido o flexible en uso normal.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Navega el árbol de clasificación</h4>
                <p>En «Clasificación», haz clic en cada categoría del árbol (termoplástico/termoestable/elastómero) para ver sus propiedades clave, ejemplos y por qué cada uno tiene un comportamiento tan diferente ante el calor.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Analiza el impacto ambiental</h4>
                <p>En «Sostenibilidad», sigue el ciclo de vida del plástico y compara los tiempos de degradación en escala logarítmica. Evalúa qué biopolímeros son realmente compostables y bajo qué condiciones.</p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">♻️</span>
              <div>
                <strong>Lee el código de reciclaje</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Antes de tirar un plástico, busca el símbolo ♻️ con número en el fondo. Los códigos 1 (PET) y 2 (HDPE) son los más aceptados globalmente. El 6 (PS) y el 7 rara vez se reciclan.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Tg para elegir el polímero adecuado</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Si necesitas rigidez a temperatura ambiente, elige un polímero con Tg &gt; 20°C (PS: 100°C, PC: 147°C). Si necesitas flexibilidad (manguera, guantes), Tg &lt; 20°C (PVC plastificado, silicona: -97°C).</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Verificar resistencia química antes de diseñar</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>El PTFE resiste casi todos los solventes y ácidos concentrados. El PS se disuelve en acetona. La resistencia química es un parámetro de diseño crítico en envases, tuberías y equipos industriales.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <div>
                <strong>Bio-basado ≠ biodegradable</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Verificar siempre ambas características. El PLA es bio-basado Y biodegradable (en condiciones industriales). El bioPE es bio-basado pero NO biodegradable. Confundirlos lleva a falsas promesas de sostenibilidad.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBoxEdu}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores Conceptuales Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li><strong>«Biodegradable» no significa que desaparezca rápido en cualquier entorno</strong> — El PLA compostable requiere 60°C y humedad controlada durante meses. En el océano o en un vertedero convencional, se degrada igual de lento que el PVC. El entorno de degradación es tan importante como el material.</li>
              <li><strong>Los termoestables no pueden reciclarse fundiendo</strong> — El «reciclaje mecánico» de termoestables (epoxi, fenólicos) produce solo relleno de baja calidad. No se puede recuperar el polímero original. Por eso los composites de fibra de carbono son tan difíciles de reciclar.</li>
              <li><strong>El número de reciclaje no indica reciclabilidad real</strong> — Un envase de PET (código 1) puede no reciclarse si está sucio, si es de colores o si tiene tapón de un polímero diferente. El sistema de reciclaje depende de la infraestructura local, no solo del material.</li>
              <li><strong>Mayor grado de polimerización no siempre es mejor</strong> — Las propiedades mecánicas mejoran con el peso molecular hasta cierto punto. Pero la viscosidad aumenta exponencialmente, dificultando el procesado. Cada aplicación tiene un rango óptimo de grado de polimerización.</li>
              <li><strong>Los elastómeros no son termoplásticos ni termoestables simples</strong> — Los cauchos vulcanizados (entrecruzados con azufre) son termoestables. Los elastómeros termoplásticos (TPE, TPU) son termoplásticos con dominios soft/hard. La distinción importa para el reciclaje y el procesado.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-polimeros-materiales')} />
        <ShareCard appName="visualizador-polimeros-materiales" />
        <Footer appName="visualizador-polimeros-materiales" />
      </div>
    </>
  );
}
