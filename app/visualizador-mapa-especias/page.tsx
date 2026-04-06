'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorMapaEspecias.module.css';
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
// Secciones del explicador
// ─────────────────────────────────────────────

type Seccion = 'rutas' | 'valor' | 'origen' | 'cocina';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'rutas', titulo: 'Las rutas', icono: '🗺️', subtitulo: 'Las rutas comerciales que cambiaron el mundo' },
  { id: 'valor', titulo: 'Más que oro', icono: '💰', subtitulo: 'Por qué las especias valían más que el oro' },
  { id: 'origen', titulo: 'De dónde vienen', icono: '🌍', subtitulo: 'Origen y producción de 12 especias populares' },
  { id: 'cocina', titulo: 'En tu cocina', icono: '🍳', subtitulo: 'Las especias que definen cada cocina del mundo' },
];

// ─────────────────────────────────────────────
// Sección 1: Las rutas
// ─────────────────────────────────────────────

interface RutaComercial {
  id: string;
  nombre: string;
  icono: string;
  periodo: string;
  color: string;
  descripcion: string;
  paradas: string[];
  especias: string[];
  dato: string;
}

const RUTAS: RutaComercial[] = [
  {
    id: 'seda',
    nombre: 'Ruta de la Seda',
    icono: '🐪',
    periodo: '~200 a.C. – 1450 d.C.',
    color: '#D4A574',
    descripcion: 'Red de caminos terrestres que conectó China con el Mediterráneo durante más de 1.500 años. Caravanas de camellos transportaban seda, especias, piedras preciosas y conocimiento.',
    paradas: ['Xi\'an (China)', 'Samarcanda', 'Bujará', 'Bagdad', 'Constantinopla', 'Venecia'],
    especias: ['Canela', 'Jengibre', 'Pimienta', 'Clavo'],
    dato: '6.500 km de longitud — un viaje completo podía durar 2 años',
  },
  {
    id: 'maritima',
    nombre: 'Ruta Marítima (Portugal)',
    icono: '⛵',
    periodo: '1498 – 1600',
    color: '#2E86AB',
    descripcion: 'Vasco da Gama abrió la ruta marítima directa a la India en 1498, rompiendo el monopolio árabe-veneciano. Portugal controló el comercio de especias durante un siglo.',
    paradas: ['Lisboa', 'Cabo de Buena Esperanza', 'Mozambique', 'Goa (India)', 'Malaca', 'Molucas (Indonesia)'],
    especias: ['Pimienta', 'Clavo', 'Nuez moscada', 'Canela'],
    dato: 'El viaje de ida duraba 6-8 meses — con mortalidad del 30-50%',
  },
  {
    id: 'arabe',
    nombre: 'Comerciantes árabes',
    icono: '🌙',
    periodo: '~700 – 1500 d.C.',
    color: '#48A9A6',
    descripcion: 'Los comerciantes árabes controlaron el comercio de especias durante 800 años. Inventaban historias fantásticas sobre el origen de las especias para proteger sus rutas secretas.',
    paradas: ['Kerala (India)', 'Adén (Yemen)', 'Alejandría', 'El Cairo', 'Damasco'],
    especias: ['Canela', 'Pimienta', 'Incienso', 'Mirra'],
    dato: 'Contaban que la canela crecía en lagos custodiados por murciélagos gigantes',
  },
  {
    id: 'venecia',
    nombre: 'Monopolio de Venecia',
    icono: '🏛️',
    periodo: '~1200 – 1500 d.C.',
    color: '#8B5CF6',
    descripcion: 'Venecia se convirtió en la ciudad más rica de Europa al controlar la distribución de especias en Occidente. Compraban a los árabes y revendían con márgenes del 1.000%.',
    paradas: ['Venecia', 'Alejandría', 'Constantinopla', 'Génova', 'Brujas', 'Londres'],
    especias: ['Pimienta', 'Canela', 'Azafrán', 'Nuez moscada'],
    dato: 'El margen sobre la pimienta era del 1.000% — de 1 ducado a 10+',
  },
];

function SeccionRutas() {
  const [rutaActiva, setRutaActiva] = useState<string>('seda');
  const ruta = RUTAS.find(r => r.id === rutaActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Durante más de <strong>2.000 años</strong>, las especias movieron imperios, financiaron exploraciones y provocaron guerras. Estas son las cuatro grandes rutas que conectaron Oriente y Occidente.</p>
      </div>

      {/* Selector de rutas */}
      <div className={styles.rutasGrid}>
        {RUTAS.map(r => (
          <button
            key={r.id}
            type="button"
            className={`${styles.rutaBtn} ${rutaActiva === r.id ? styles.rutaBtnActiva : ''}`}
            onClick={() => setRutaActiva(r.id)}
            aria-pressed={rutaActiva === r.id}
            style={{ '--ruta-color': r.color } as React.CSSProperties}
          >
            <span className={styles.rutaBtnIcono} aria-hidden="true">{r.icono}</span>
            <span className={styles.rutaBtnNombre}>{r.nombre}</span>
            <span className={styles.rutaBtnPeriodo}>{r.periodo}</span>
          </button>
        ))}
      </div>

      {/* Detalle de ruta activa */}
      {ruta && (
        <div className={styles.rutaDetalle} style={{ '--ruta-color': ruta.color } as React.CSSProperties}>
          <div className={styles.rutaDetalleHeader}>
            <span className={styles.rutaDetalleIcono} aria-hidden="true">{ruta.icono}</span>
            <div>
              <strong className={styles.rutaDetalleNombre}>{ruta.nombre}</strong>
              <span className={styles.rutaDetallePeriodo}>{ruta.periodo}</span>
            </div>
          </div>
          <p className={styles.rutaDetalleDesc}>{ruta.descripcion}</p>

          {/* Paradas */}
          <div className={styles.paradasWrapper}>
            <span className={styles.paradasLabel}>Paradas clave:</span>
            <div className={styles.paradasLinea}>
              {ruta.paradas.map((p, i) => (
                <div key={p} className={styles.parada}>
                  <span className={styles.paradaPunto} />
                  <span className={styles.paradaNombre}>{p}</span>
                  {i < ruta.paradas.length - 1 && <span className={styles.paradaLinea} />}
                </div>
              ))}
            </div>
          </div>

          {/* Especias transportadas */}
          <div className={styles.especiasTag}>
            <span className={styles.especiasTagLabel}>Especias:</span>
            {ruta.especias.map(e => (
              <span key={e} className={styles.tag}>{e}</span>
            ))}
          </div>

          <div className={styles.rutaDato}>
            <span aria-hidden="true">📊</span> {ruta.dato}
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          La búsqueda de una ruta marítima directa a las especias fue lo que motivó a Colón a navegar
          hacia el oeste en 1492. No buscaba América — <strong>buscaba pimienta</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Más valiosas que el oro
// ─────────────────────────────────────────────

interface EspeciaHistorica {
  nombre: string;
  icono: string;
  precioHistorico: string;
  comparacion: string;
  anecdota: string;
  color: string;
  factorOro: number; // veces el precio del oro por peso (para barra visual)
}

const ESPECIAS_VALOR: EspeciaHistorica[] = [
  {
    nombre: 'Azafrán',
    icono: '🌸',
    precioHistorico: '~15 veces su peso en oro (s. XIV)',
    comparacion: 'Hoy sigue siendo la especia más cara: 3.000-10.000 €/kg',
    anecdota: 'Se necesitan 150.000 flores para obtener 1 kg de azafrán. Todo se recoge a mano, flor por flor, al amanecer.',
    color: '#D97706',
    factorOro: 15,
  },
  {
    nombre: 'Nuez moscada',
    icono: '🥜',
    precioHistorico: '~6 veces su peso en plata (s. XVI)',
    comparacion: 'En Ámsterdam, 1 saco compraba una casa entera',
    anecdota: 'Holanda intercambió la isla de Manhattan (Nueva York) con Inglaterra a cambio de la isla de Run — una roca diminuta donde crecía nuez moscada.',
    color: '#92400E',
    factorOro: 10,
  },
  {
    nombre: 'Pimienta',
    icono: '⚫',
    precioHistorico: 'Usada como moneda (Roma, s. I-V)',
    comparacion: 'Alarico el Visigodo exigió 1.360 kg de pimienta para no saquear Roma (408 d.C.)',
    anecdota: 'Los trabajadores del puerto de Londres no podían tener bolsillos en la ropa — para evitar que robaran pimienta.',
    color: '#374151',
    factorOro: 8,
  },
  {
    nombre: 'Clavo',
    icono: '🟤',
    precioHistorico: '~2 veces su peso en oro (s. XV)',
    comparacion: 'Solo crecía en 5 islas del planeta: las Molucas',
    anecdota: 'España y Portugal firmaron el Tratado de Zaragoza (1529) para repartirse las islas del clavo. Se libraron guerras enteras por estas 5 islas.',
    color: '#78350F',
    factorOro: 6,
  },
  {
    nombre: 'Canela',
    icono: '🟫',
    precioHistorico: '~50 veces el precio de la plata (s. XV)',
    comparacion: 'Nerón quemó un año de suministro de canela de Roma en el funeral de su esposa',
    anecdota: 'Los comerciantes árabes inventaron que la canela crecía en lagos custodiados por aves gigantes, para que nadie buscara el origen real.',
    color: '#B45309',
    factorOro: 5,
  },
  {
    nombre: 'Vainilla',
    icono: '🌿',
    precioHistorico: '~600 $/kg (s. XIX)',
    comparacion: 'Segunda especia más cara del mundo tras el azafrán',
    anecdota: 'Solo una abeja mexicana (Melipona) polinizaba la vainilla. Hasta que en 1841 un esclavo de 12 años en Reunión descubrió cómo hacerlo a mano.',
    color: '#65A30D',
    factorOro: 3,
  },
];

const maxFactorOro = Math.max(...ESPECIAS_VALOR.map(e => e.factorOro));

function SeccionValor() {
  const [especiaActiva, setEspeciaActiva] = useState<string | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las especias fueron la <strong>criptomoneda del mundo antiguo</strong>: escasas, transportables, imperecederas. Algunas valían literalmente más que el oro.</p>
      </div>

      <div className={styles.valorGrid}>
        {ESPECIAS_VALOR.map(e => (
          <div
            key={e.nombre}
            className={`${styles.valorCard} ${especiaActiva === e.nombre ? styles.valorCardActiva : ''}`}
            style={{ '--especia-color': e.color } as React.CSSProperties}
            onMouseEnter={() => setEspeciaActiva(e.nombre)}
            onMouseLeave={() => setEspeciaActiva(null)}
          >
            <div className={styles.valorHeader}>
              <span className={styles.valorIcono} aria-hidden="true">{e.icono}</span>
              <strong className={styles.valorNombre}>{e.nombre}</strong>
            </div>
            <div className={styles.valorPrecio}>{e.precioHistorico}</div>

            {/* Barra de valor relativo */}
            <div className={styles.valorBarra}>
              <div
                className={styles.valorRelleno}
                style={{
                  width: `${(e.factorOro / maxFactorOro) * 100}%`,
                  backgroundColor: e.color,
                }}
              />
            </div>
            <span className={styles.valorBarraLabel}>Valor relativo al oro</span>

            <p className={styles.valorComparacion}>{e.comparacion}</p>
            <p className={styles.valorAnecdota}>{e.anecdota}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          En el siglo XV, <strong>1 kg de nuez moscada</strong> en las Molucas costaba lo equivalente a unos céntimos.
          Cuando llegaba a Europa, su precio se había multiplicado por <strong>{formatNumber(60000, 0)}</strong>.
          La cadena de intermediarios (productores → árabes → venecianos → mercados locales) inflaba el precio en cada eslabón.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: De dónde vienen
// ─────────────────────────────────────────────

interface EspeciaOrigen {
  nombre: string;
  icono: string;
  origenHistorico: string;
  principalesProductores: string[];
  produccionAnual: string;
  dato: string;
  color: string;
}

const ESPECIAS_ORIGEN: EspeciaOrigen[] = [
  { nombre: 'Pimienta', icono: '⚫', origenHistorico: 'India (Kerala)', principalesProductores: ['Vietnam (40%)', 'Indonesia', 'India', 'Brasil'], produccionAnual: '600.000 t', dato: 'La especia más consumida del mundo: 20% del comercio global', color: '#374151' },
  { nombre: 'Canela', icono: '🟫', origenHistorico: 'Sri Lanka', principalesProductores: ['Indonesia (40%)', 'China', 'Vietnam', 'Sri Lanka'], produccionAnual: '230.000 t', dato: 'La "verdadera" canela (Ceilán) solo viene de Sri Lanka', color: '#B45309' },
  { nombre: 'Azafrán', icono: '🌸', origenHistorico: 'Irán / Grecia', principalesProductores: ['Irán (90%)', 'India', 'España', 'Afganistán'], produccionAnual: '400 t', dato: 'Irán produce el 90% del azafrán mundial', color: '#D97706' },
  { nombre: 'Vainilla', icono: '🌿', origenHistorico: 'México (Totonacas)', principalesProductores: ['Madagascar (80%)', 'Indonesia', 'Uganda', 'México'], produccionAnual: '7.500 t', dato: 'México la inventó, pero Madagascar produce el 80%', color: '#65A30D' },
  { nombre: 'Comino', icono: '🟡', origenHistorico: 'Oriente Medio', principalesProductores: ['India (70%)', 'Siria', 'Turquía', 'Irán'], produccionAnual: '500.000 t', dato: 'Presente en casi todas las cocinas del mundo', color: '#CA8A04' },
  { nombre: 'Pimentón', icono: '🔴', origenHistorico: 'América → Hungría/España', principalesProductores: ['China', 'España', 'Hungría', 'Perú'], produccionAnual: '450.000 t', dato: 'Los monjes jerónimos lo trajeron a España en el s. XVI', color: '#DC2626' },
  { nombre: 'Cúrcuma', icono: '🟠', origenHistorico: 'India', principalesProductores: ['India (80%)', 'Bangladesh', 'Pakistán', 'Myanmar'], produccionAnual: '1.100.000 t', dato: 'India produce y consume el 80% de la cúrcuma mundial', color: '#EA580C' },
  { nombre: 'Cardamomo', icono: '💚', origenHistorico: 'India (Ghats)', principalesProductores: ['Guatemala (55%)', 'India', 'Indonesia', 'Nepal'], produccionAnual: '85.000 t', dato: 'Guatemala superó a India como productor n.º 1 en los 80', color: '#16A34A' },
  { nombre: 'Clavo', icono: '🟤', origenHistorico: 'Molucas (Indonesia)', principalesProductores: ['Indonesia (75%)', 'Madagascar', 'Tanzania', 'Sri Lanka'], produccionAnual: '175.000 t', dato: 'Originario de solo 5 islas en todo el planeta', color: '#78350F' },
  { nombre: 'Nuez moscada', icono: '🥜', origenHistorico: 'Islas Banda (Indonesia)', principalesProductores: ['Indonesia (75%)', 'India', 'Guatemala', 'Granada'], produccionAnual: '45.000 t', dato: 'En las Islas Banda, los holandeses masacraron a los nativos por su control', color: '#92400E' },
  { nombre: 'Jengibre', icono: '🫚', origenHistorico: 'China / Sudeste Asiático', principalesProductores: ['India (35%)', 'Nigeria', 'China', 'Indonesia'], produccionAnual: '4.200.000 t', dato: 'Se consume fresco, en polvo, encurtido y como bebida', color: '#A16207' },
  { nombre: 'Chile / Guindilla', icono: '🌶️', origenHistorico: 'América (México/Perú)', principalesProductores: ['China (45%)', 'México', 'Indonesia', 'India'], produccionAnual: '40.000.000 t', dato: 'De América conquistó Asia en menos de 100 años — adopción récord', color: '#B91C1C' },
];

function SeccionOrigen() {
  const [filtro, setFiltro] = useState<'todas' | 'asia' | 'america' | 'oriente'>('todas');

  const filtradas = ESPECIAS_ORIGEN.filter(e => {
    if (filtro === 'todas') return true;
    if (filtro === 'asia') return ['India', 'Sri Lanka', 'China', 'Sudeste Asiático'].some(p => e.origenHistorico.includes(p)) || e.origenHistorico.includes('Indonesia');
    if (filtro === 'america') return e.origenHistorico.includes('América') || e.origenHistorico.includes('México');
    if (filtro === 'oriente') return e.origenHistorico.includes('Oriente') || e.origenHistorico.includes('Irán') || e.origenHistorico.includes('Grecia');
    return true;
  });

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La mayoría de las especias nacieron en una franja entre <strong>India, Indonesia y China</strong>. Pero hoy, los mayores productores no siempre coinciden con el origen histórico.</p>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {([
          { id: 'todas', label: '🌍 Todas' },
          { id: 'asia', label: '🏯 Asia' },
          { id: 'america', label: '🌎 América' },
          { id: 'oriente', label: '🕌 Oriente Medio' },
        ] as { id: typeof filtro; label: string }[]).map(f => (
          <button
            key={f.id}
            type="button"
            className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltro(f.id)}
            aria-pressed={filtro === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.origenGrid}>
        {filtradas.map(e => (
          <div key={e.nombre} className={styles.origenCard} style={{ '--especia-color': e.color } as React.CSSProperties}>
            <div className={styles.origenHeader}>
              <span className={styles.origenIcono} aria-hidden="true">{e.icono}</span>
              <div>
                <strong className={styles.origenNombre}>{e.nombre}</strong>
                <span className={styles.origenHistorico}>{e.origenHistorico}</span>
              </div>
            </div>

            <div className={styles.origenProductores}>
              <span className={styles.origenProductoresLabel}>Principales productores:</span>
              {e.principalesProductores.map(p => (
                <span key={p} className={styles.tag}>{p}</span>
              ))}
            </div>

            <div className={styles.origenStats}>
              <span className={styles.origenProduccion}>
                <span aria-hidden="true">📦</span> {e.produccionAnual}/año
              </span>
            </div>

            <p className={styles.origenDato}>{e.dato}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El chile es la especia con <strong>mayor producción mundial</strong> ({formatNumber(40000000, 0)} toneladas/año),
          pero es relativamente nueva fuera de América. Los portugueses la llevaron a Asia en el siglo XVI y en menos de
          100 años ya era esencial en la cocina india y tailandesa. La adopción más rápida de la historia culinaria.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: En tu cocina
// ─────────────────────────────────────────────

interface CocinaInfo {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  especias: { nombre: string; uso: string }[];
  beneficiosSalud: string;
  datoHistorico: string;
}

const COCINAS: CocinaInfo[] = [
  {
    id: 'mediterranea',
    nombre: 'Mediterránea',
    icono: '🫒',
    color: '#16A34A',
    especias: [
      { nombre: 'Orégano', uso: 'Pizzas, pastas, ensaladas' },
      { nombre: 'Albahaca', uso: 'Pesto, tomate, ensaladas' },
      { nombre: 'Romero', uso: 'Carnes asadas, patatas, pan' },
      { nombre: 'Tomillo', uso: 'Guisos, sopas, carnes' },
      { nombre: 'Azafrán', uso: 'Paella, risotto, sopas' },
    ],
    beneficiosSalud: 'El orégano tiene más antioxidantes por gramo que los arándanos. El romero mejora la concentración y la memoria.',
    datoHistorico: 'Los griegos coronaban a los atletas olímpicos con laurel y usaban orégano para purificar el agua.',
  },
  {
    id: 'india',
    nombre: 'India',
    icono: '🇮🇳',
    color: '#EA580C',
    especias: [
      { nombre: 'Comino', uso: 'Curries, dal, arroz' },
      { nombre: 'Cúrcuma', uso: 'Curries, arroz, leche dorada' },
      { nombre: 'Cardamomo', uso: 'Chai, biryani, postres' },
      { nombre: 'Garam masala', uso: 'Mezcla base para curries' },
      { nombre: 'Chile', uso: 'Prácticamente en todo' },
    ],
    beneficiosSalud: 'La cúrcuma contiene curcumina, un potente antiinflamatorio. El cardamomo ayuda a la digestión.',
    datoHistorico: 'India usa más de 60 especias diferentes en su cocina — más que cualquier otra tradición culinaria.',
  },
  {
    id: 'mexicana',
    nombre: 'Mexicana',
    icono: '🇲🇽',
    color: '#DC2626',
    especias: [
      { nombre: 'Chile (variedades)', uso: 'Salsas, moles, adobos' },
      { nombre: 'Comino', uso: 'Tacos, frijoles, chili' },
      { nombre: 'Cilantro', uso: 'Salsas, guacamole, tacos' },
      { nombre: 'Vainilla', uso: 'Postres, chocolate, bebidas' },
      { nombre: 'Canela', uso: 'Chocolate, arroz con leche' },
    ],
    beneficiosSalud: 'La capsaicina del chile acelera el metabolismo. El cilantro ayuda a eliminar metales pesados del cuerpo.',
    datoHistorico: 'México domesticó el chile, el cacao, la vainilla y el tomate — cuatro de los sabores más universales.',
  },
  {
    id: 'asiatica',
    nombre: 'Asiática Oriental',
    icono: '🥢',
    color: '#2E86AB',
    especias: [
      { nombre: 'Jengibre', uso: 'Salteados, sopas, sushi' },
      { nombre: 'Anís estrellado', uso: 'Pho, cinco especias, guisos' },
      { nombre: 'Hierba limón', uso: 'Curry tailandés, sopas, tés' },
      { nombre: 'Pimienta de Sichuan', uso: 'Mapo tofu, salteados picantes' },
      { nombre: 'Cinco especias', uso: 'Pato, cerdo, marinados' },
    ],
    beneficiosSalud: 'El jengibre es antiinflamatorio y antinauseoso. El anís estrellado contiene ácido shikímico, base del Tamiflu.',
    datoHistorico: 'La mezcla "cinco especias" china (anís, canela, clavo, pimienta Sichuan, hinojo) representa los 5 sabores: dulce, ácido, amargo, picante y salado.',
  },
];

function SeccionCocina() {
  const [cocinaActiva, setCocinaActiva] = useState<string>('mediterranea');
  const cocina = COCINAS.find(c => c.id === cocinaActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada tradición culinaria tiene su <strong>firma de especias</strong>: combinaciones que reconoces al primer aroma. Estas son las que definen cuatro grandes cocinas del mundo.</p>
      </div>

      {/* Selector de cocinas */}
      <div className={styles.cocinasGrid}>
        {COCINAS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.cocinaBtn} ${cocinaActiva === c.id ? styles.cocinaBtnActiva : ''}`}
            onClick={() => setCocinaActiva(c.id)}
            aria-pressed={cocinaActiva === c.id}
            style={{ '--cocina-color': c.color } as React.CSSProperties}
          >
            <span className={styles.cocinaBtnIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.cocinaBtnNombre}>{c.nombre}</span>
          </button>
        ))}
      </div>

      {/* Detalle de cocina */}
      {cocina && (
        <div className={styles.cocinaDetalle} style={{ '--cocina-color': cocina.color } as React.CSSProperties}>
          <div className={styles.cocinaDetalleHeader}>
            <span className={styles.cocinaDetalleIcono} aria-hidden="true">{cocina.icono}</span>
            <strong className={styles.cocinaDetalleNombre}>Cocina {cocina.nombre}</strong>
          </div>

          {/* Especias de esta cocina */}
          <div className={styles.cocinaEspecias}>
            {cocina.especias.map(e => (
              <div key={e.nombre} className={styles.cocinaEspeciaRow}>
                <strong className={styles.cocinaEspeciaNombre}>{e.nombre}</strong>
                <span className={styles.cocinaEspeciaUso}>{e.uso}</span>
              </div>
            ))}
          </div>

          {/* Beneficios salud */}
          <div className={styles.cocinaSalud}>
            <span className={styles.cocinaSaludLabel}><span aria-hidden="true">💚</span> Beneficios para la salud:</span>
            <p>{cocina.beneficiosSalud}</p>
          </div>

          {/* Dato histórico */}
          <div className={styles.cocinaHistoria}>
            <span className={styles.cocinaHistoriaLabel}><span aria-hidden="true">📖</span> Dato histórico:</span>
            <p>{cocina.datoHistorico}</p>
          </div>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          Las especias no solo dan sabor — muchas se usaron originalmente como <strong>medicina y conservante</strong>.
          En climas cálidos, la cocina tiende a ser más especiada porque las especias tienen propiedades
          antimicrobianas que ayudan a conservar los alimentos. Por eso India y México usan más especias
          que Escandinavia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMapaEspeciasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('rutas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'rutas': return <SeccionRutas />;
      case 'valor': return <SeccionValor />;
      case 'origen': return <SeccionOrigen />;
      case 'cocina': return <SeccionCocina />;
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
          <h1 className={styles.title}>El Mapa de las Especias</h1>
          <p className={styles.subtitle}>Rutas, guerras y fortunas — la historia detrás de lo que hay en tu cocina</p>
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
          title="El mundo que crearon las especias"
          subtitle="Historia, economía y curiosidades"
          defaultOpen={false}
        >
          <h3>¿Por qué las especias eran tan caras?</h3>
          <p>
            Tres factores: <strong>escasez geográfica</strong> (muchas solo crecían en islas remotas),
            <strong> cadena de intermediarios</strong> (productores → árabes → venecianos → mercados locales,
            cada uno multiplicando el precio) y <strong>secretismo deliberado</strong> (los comerciantes
            inventaban historias terroríficas sobre su origen para evitar competencia).
          </p>

          <h3>¿Cómo cambiaron las especias la historia?</h3>
          <p>
            La búsqueda de especias financió la era de los descubrimientos. Colón buscaba pimienta cuando
            encontró América. Portugal construyó un imperio global por la pimienta y el clavo. Holanda
            intercambió Manhattan por una isla de nuez moscada. Las especias fueron, literalmente, el
            motor económico que conectó el mundo.
          </p>

          <h3>¿Por qué hoy son baratas?</h3>
          <p>
            La globalización rompió los monopolios. Hoy la pimienta se cultiva en decenas de países,
            hay rutas de transporte eficientes y refrigeración moderna. Lo que antes costaba fortunas
            ahora cuesta céntimos por gramo — excepto el azafrán, que sigue requiriendo cosecha manual
            flor por flor.
          </p>

          <h3>¿Tienen realmente beneficios para la salud?</h3>
          <p>
            Muchas especias tienen propiedades antimicrobianas, antiinflamatorias y antioxidantes
            documentadas científicamente. La cúrcuma (curcumina), el jengibre y la canela son las
            más estudiadas. Sin embargo, las cantidades usadas en cocina son pequeñas comparadas
            con las dosis de los estudios clínicos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los datos históricos y de producción de este explicador son
            orientativos, basados en fuentes históricas y estadísticas de la FAO. Las cifras de
            producción pueden variar según el año y la fuente consultada. Los beneficios para la
            salud mencionados son informativos y no sustituyen consejo médico.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-mapa-especias')} />
        <ShareCard appName="visualizador-mapa-especias" />
        <Footer appName="visualizador-mapa-especias" />
      </div>
    </>
  );
}
