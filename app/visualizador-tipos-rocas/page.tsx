'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TiposRocas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'tipos' | 'ciclo' | 'vida' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'tipos', titulo: 'Los 3 Tipos', icono: '🪨', subtitulo: 'Ígneas, sedimentarias y metamórficas' },
  { id: 'ciclo', titulo: 'El Ciclo', icono: '🔄', subtitulo: 'La transformación que nunca se detiene' },
  { id: 'vida', titulo: 'En tu Vida', icono: '🏠', subtitulo: 'Rocas que usas a diario sin saberlo' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '💎', subtitulo: 'Curiosidades del mundo mineral' },
];

// ─────────────────────────────────────────────
// Datos: Tipos de rocas
// ─────────────────────────────────────────────

interface RocaEjemplo {
  nombre: string;
  descripcion: string;
  dondeSeEncuentra: string;
  uso: string;
}

interface SubtipoRoca {
  nombre: string;
  descripcion: string;
  ejemplos: RocaEjemplo[];
}

interface TipoRoca {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  proceso: string;
  subtipos: SubtipoRoca[];
  textura: string;
  dureza: string;
}

const TIPOS_ROCAS: TipoRoca[] = [
  {
    id: 'igneas',
    nombre: 'Ígneas',
    icono: '🔥',
    color: '#DC2626',
    descripcion: 'Se forman al enfriar magma o lava. La velocidad de enfriamiento determina el tamaño de los cristales.',
    proceso: 'Magma/lava → enfriamiento → cristalización',
    textura: 'Cristalina (gruesa o fina)',
    dureza: 'Media-Alta',
    subtipos: [
      {
        nombre: 'Intrusivas (plutónicas)',
        descripcion: 'Enfriamiento lento bajo tierra → cristales grandes y visibles',
        ejemplos: [
          { nombre: 'Granito', descripcion: 'Cristales de cuarzo, feldespato y mica visibles a simple vista. Colores claros (blanco, rosa, gris).', dondeSeEncuentra: 'Cordilleras, escudos continentales, cantera', uso: 'Encimeras de cocina, adoquines, monumentos' },
          { nombre: 'Gabro', descripcion: 'Roca oscura y pesada con cristales de piroxeno y plagioclasa. Similar al basalto pero con cristales grandes.', dondeSeEncuentra: 'Corteza oceánica profunda, intrusiones', uso: 'Piedra ornamental, "granito negro" comercial' },
        ],
      },
      {
        nombre: 'Extrusivas (volcánicas)',
        descripcion: 'Enfriamiento rápido en superficie → cristales pequeños o sin cristales',
        ejemplos: [
          { nombre: 'Basalto', descripcion: 'Roca oscura, densa y de grano fino. Forma columnas hexagonales al enfriarse lentamente (Giant\'s Causeway).', dondeSeEncuentra: 'Fondo oceánico, islas volcánicas, mesetas', uso: 'Sub-base de carreteras, adoquines, lana de roca' },
          { nombre: 'Obsidiana', descripcion: 'Vidrio volcánico negro y brillante. Enfriamiento tan rápido que no se forman cristales. Fractura concoidea afiladísima.', dondeSeEncuentra: 'Flujos de lava de sílice, zonas volcánicas', uso: 'Herramientas prehistóricas, bisturís quirúrgicos especializados' },
        ],
      },
    ],
  },
  {
    id: 'sedimentarias',
    nombre: 'Sedimentarias',
    icono: '📐',
    color: '#D97706',
    descripcion: 'Se forman por compactación y cementación de sedimentos acumulados durante millones de años.',
    proceso: 'Erosión → transporte → depósito → compactación → cementación',
    textura: 'Capas visibles (estratos)',
    dureza: 'Baja-Media',
    subtipos: [
      {
        nombre: 'Clásticas (detríticas)',
        descripcion: 'Fragmentos de otras rocas compactados por presión',
        ejemplos: [
          { nombre: 'Arenisca', descripcion: 'Granos de arena cementados. Textura granular al tacto. Colores cálidos (amarillo, rojo, marrón).', dondeSeEncuentra: 'Desiertos, playas antiguas, cauces fluviales', uso: 'Fachadas de edificios históricos, pavimentos' },
          { nombre: 'Conglomerado', descripcion: 'Cantos rodados y gravas unidos por un cemite natural. Aspecto de "hormigón natural".', dondeSeEncuentra: 'Lechos de ríos antiguos, abanicos aluviales', uso: 'Roca ornamental, agregados de construcción' },
        ],
      },
      {
        nombre: 'Químicas',
        descripcion: 'Precipitación de minerales disueltos en agua',
        ejemplos: [
          { nombre: 'Caliza', descripcion: 'Carbonato cálcico, a menudo con fósiles. Reacciona al ácido (burbujea con vinagre). Color blanco-gris.', dondeSeEncuentra: 'Mares tropicales poco profundos, cuevas', uso: 'Cemento (Portland), cal, neutralizar acidez del suelo' },
          { nombre: 'Yeso', descripcion: 'Mineral blando y claro. Se raya con la uña. Cristales transparentes (selenita) o fibrosos (satinado).', dondeSeEncuentra: 'Evaporitas, cuencas sedimentarias secas', uso: 'Escayola, paneles de yeso (pladur), moldes' },
        ],
      },
      {
        nombre: 'Orgánicas (biogénicas)',
        descripcion: 'Restos de organismos acumulados y compactados',
        ejemplos: [
          { nombre: 'Carbón', descripcion: 'Restos de plantas compactados durante millones de años. Del turba al antracita, aumenta el carbono.', dondeSeEncuentra: 'Cuencas carboníferas, pantanos antiguos', uso: 'Energía (centrales térmicas), industria del acero' },
          { nombre: 'Roca de petróleo', descripcion: 'Materia orgánica marina atrapada en roca porosa. El petróleo migra hasta quedar atrapado en trampas geológicas.', dondeSeEncuentra: 'Cuencas sedimentarias marinas profundas', uso: 'Combustibles, plásticos, productos químicos' },
        ],
      },
    ],
  },
  {
    id: 'metamorficas',
    nombre: 'Metamórficas',
    icono: '💎',
    color: '#7C3AED',
    descripcion: 'Se forman cuando rocas existentes se transforman por presión y/o calor intenso sin llegar a fundir.',
    proceso: 'Roca original + presión + calor → recristalización → nueva roca',
    textura: 'Foliada o masiva',
    dureza: 'Media-Alta',
    subtipos: [
      {
        nombre: 'Foliadas',
        descripcion: 'Minerales alineados en bandas o láminas por presión direccional',
        ejemplos: [
          { nombre: 'Pizarra', descripcion: 'Láminas finas y planas que se separan fácilmente. Color gris oscuro a negro. Muy impermeable.', dondeSeEncuentra: 'Zonas de metamorfismo regional, montañas', uso: 'Tejados, pizarras de clase (de ahí el nombre), suelos' },
          { nombre: 'Esquisto', descripcion: 'Láminas onduladas con cristales de mica brillantes. Mayor metamorfismo que la pizarra.', dondeSeEncuentra: 'Cordilleras, zonas de subducción', uso: 'Piedra ornamental, jardinería' },
          { nombre: 'Gneis', descripcion: 'Bandas claras y oscuras alternantes. Alto grado de metamorfismo. Muy resistente.', dondeSeEncuentra: 'Núcleo de cordilleras antiguas, escudos', uso: 'Construcción, pavimentos, encimeras' },
        ],
      },
      {
        nombre: 'No foliadas',
        descripcion: 'Minerales recristalizados sin orientación preferente',
        ejemplos: [
          { nombre: 'Mármol', descripcion: 'Caliza recristalizada. Brillo vítreo, colores variados (blanco Carrara, rosa, verde). Se raya con cuchillo.', dondeSeEncuentra: 'Zonas de metamorfismo de contacto, Italia, Grecia', uso: 'Esculturas (David de Miguel Ángel), suelos de lujo, encimeras' },
          { nombre: 'Cuarcita', descripcion: 'Arenisca recristalizada. Extremadamente dura (raya el acero). Fractura a través de los granos, no alrededor.', dondeSeEncuentra: 'Cordilleras metamórficas, crestas montañosas', uso: 'Superficies resistentes al desgaste, joyería, decoración' },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: Ciclo de las rocas
// ─────────────────────────────────────────────

interface ProcesoCiclo {
  id: string;
  desde: string;
  hasta: string;
  proceso: string;
  descripcion: string;
  duracion: string;
}

const PROCESOS_CICLO: ProcesoCiclo[] = [
  { id: 'ig-sed', desde: 'Ígneas', hasta: 'Sedimentarias', proceso: 'Erosión y sedimentación', descripcion: 'El viento, agua y hielo rompen la roca en fragmentos. Estos sedimentos se transportan y depositan en capas que se compactan durante millones de años.', duracion: '10-100 millones de años' },
  { id: 'sed-met', desde: 'Sedimentarias', hasta: 'Metamórficas', proceso: 'Presión y calor', descripcion: 'Las rocas sedimentarias enterradas a gran profundidad se transforman por la presión de las capas superiores y el calor del interior terrestre, sin llegar a fundirse.', duracion: '50-200 millones de años' },
  { id: 'met-ig', desde: 'Metamórficas', hasta: 'Ígneas', proceso: 'Fusión y enfriamiento', descripcion: 'Si la temperatura sube lo suficiente, la roca metamórfica se funde completamente formando magma. Al enfriarse (bajo tierra o en superficie), nace una nueva roca ígnea.', duracion: '1-100 millones de años' },
  { id: 'ig-met', desde: 'Ígneas', hasta: 'Metamórficas', proceso: 'Presión y calor (atajo)', descripcion: 'Las rocas ígneas pueden transformarse directamente en metamórficas sin pasar por la fase sedimentaria, por ejemplo al quedar enterradas en una zona de subducción.', duracion: '10-50 millones de años' },
  { id: 'sed-sed', desde: 'Sedimentarias', hasta: 'Sedimentarias', proceso: 'Re-erosión', descripcion: 'Una roca sedimentaria expuesta puede erosionarse, transportarse y volver a depositarse formando nuevas rocas sedimentarias. El reciclaje más directo.', duracion: '5-50 millones de años' },
  { id: 'met-sed', desde: 'Metamórficas', hasta: 'Sedimentarias', proceso: 'Erosión', descripcion: 'Las rocas metamórficas expuestas en superficie se erosionan igual que cualquier otra roca, aportando sedimentos para futuras rocas sedimentarias.', duracion: '10-100 millones de años' },
];

// ─────────────────────────────────────────────
// Datos: Rocas en tu vida
// ─────────────────────────────────────────────

interface RocaCotidiana {
  icono: string;
  nombre: string;
  tipo: string;
  uso: string;
  detalle: string;
}

const ROCAS_COTIDIANAS: RocaCotidiana[] = [
  { icono: '🏠', nombre: 'Granito', tipo: 'Ígnea', uso: 'Encimeras de cocina, adoquines', detalle: 'El granito es tan popular en cocinas por su dureza: resiste rayones, calor y manchas. Cada losa es única porque los cristales se formaron hace millones de años.' },
  { icono: '🏛️', nombre: 'Mármol', tipo: 'Metamórfica', uso: 'Esculturas, suelos de lujo', detalle: 'El Partenón de Atenas y el David de Miguel Ángel están hechos de mármol. Su brillo y translucidez lo hicieron el material favorito de escultores durante milenios.' },
  { icono: '✏️', nombre: 'Pizarra', tipo: 'Metamórfica', uso: 'Tejados, pizarras de clase', detalle: '¡Las pizarras de clase se llaman así por la roca! Se usaba pizarra natural cortada en láminas finas porque es impermeable y se puede escribir en ella con tiza.' },
  { icono: '🧱', nombre: 'Arenisca', tipo: 'Sedimentaria', uso: 'Fachadas históricas', detalle: 'Muchos edificios históricos de Europa usan arenisca por su fácil tallado y colores cálidos. La Alhambra tiene elementos de arenisca roja.' },
  { icono: '🪨', nombre: 'Basalto', tipo: 'Ígnea', uso: 'Carreteras, adoquines', detalle: 'La sub-base de muchas carreteras es basalto triturado. Las columnas hexagonales de Giant\'s Causeway (Irlanda) son basalto que se enfrió lentamente.' },
  { icono: '💎', nombre: 'Cuarcita', tipo: 'Metamórfica', uso: 'Superficies resistentes, joyería', detalle: 'Más dura que el granito, la cuarcita raya el acero. Se usa en encimeras de alto tráfico y en joyería cuando tiene colores llamativos (rosa, amarillo).' },
  { icono: '🖤', nombre: 'Obsidiana', tipo: 'Ígnea', uso: 'Herramientas prehistóricas', detalle: 'La obsidiana se fractura en bordes más afilados que un bisturí quirúrgico. Culturas prehistóricas la usaban para cuchillos y puntas de flecha. Hoy se usa en cirugía experimental.' },
  { icono: '🏗️', nombre: 'Caliza', tipo: 'Sedimentaria', uso: 'Cemento Portland', detalle: 'El 80% de los edificios del mundo usan cemento Portland, fabricado a partir de caliza. Sin esta roca sedimentaria, la civilización moderna sería irreconocible.' },
];

// ─────────────────────────────────────────────
// Datos: Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🌋', titulo: 'El fondo oceánico es basalto', descripcion: 'El basalto es la roca más común del fondo oceánico. Se genera continuamente en las dorsales oceánicas y se recicla en las zonas de subducción.' },
  { icono: '🏔️', titulo: '80% de la corteza continental', descripcion: 'El granito y rocas similares forman el 80% de la corteza continental. Es menos denso que el basalto oceánico, por eso los continentes "flotan" más alto.' },
  { icono: '💎', titulo: 'Diamantes: carbono bajo presión', descripcion: 'Los diamantes son carbono puro metamorfizado a más de 150 km de profundidad y 1.300 °C. Suben a la superficie en erupciones volcánicas ultrarrápidas (kimberlitas).' },
  { icono: '🪨', titulo: 'La roca más antigua: 4.280 Ma', descripcion: 'El gneis de Nuvvuagittuq (Canadá) tiene 4.280 millones de años, casi la edad de la Tierra (4.540 Ma). Es una roca metamórfica de origen volcánico.' },
  { icono: '🌍', titulo: 'Nada dura para siempre', descripcion: 'La Tierra recicla sus rocas: ninguna roca en la superficie tiene más de 200 millones de años. El ciclo de las rocas es imparable.' },
  { icono: '📏', titulo: '1 cm de suelo = 500-1.000 años', descripcion: 'Un centímetro de suelo fértil tarda entre 500 y 1.000 años en formarse por la erosión lenta de la roca madre. Por eso la erosión del suelo es tan grave.' },
  { icono: '🧂', titulo: 'La sal es una roca', descripcion: 'La sal de mesa (halita) es un mineral evaporítico: una roca sedimentaria química formada cuando mares antiguos se evaporaron dejando los minerales disueltos.' },
];

// ─────────────────────────────────────────────
// Datos: Escala de Mohs
// ─────────────────────────────────────────────

interface MineralMohs {
  dureza: number;
  mineral: string;
  referencia: string;
  color: string;
}

const ESCALA_MOHS: MineralMohs[] = [
  { dureza: 1, mineral: 'Talco', referencia: 'Se raya con la uña', color: '#A7F3D0' },
  { dureza: 2, mineral: 'Yeso', referencia: 'Se raya con la uña', color: '#6EE7B7' },
  { dureza: 3, mineral: 'Calcita', referencia: 'Se raya con moneda', color: '#34D399' },
  { dureza: 4, mineral: 'Fluorita', referencia: 'Se raya con cuchillo', color: '#FCD34D' },
  { dureza: 5, mineral: 'Apatito', referencia: 'Se raya con cuchillo', color: '#FBBF24' },
  { dureza: 6, mineral: 'Ortosa', referencia: 'Raya el vidrio', color: '#F59E0B' },
  { dureza: 7, mineral: 'Cuarzo', referencia: 'Raya el acero', color: '#F97316' },
  { dureza: 8, mineral: 'Topacio', referencia: 'Raya el cuarzo', color: '#EF4444' },
  { dureza: 9, mineral: 'Corindón', referencia: 'Rubí / zafiro', color: '#DC2626' },
  { dureza: 10, mineral: 'Diamante', referencia: 'Nada lo raya', color: '#991B1B' },
];

// ─────────────────────────────────────────────
// Sección 1: Los 3 Tipos
// ─────────────────────────────────────────────

function SeccionTipos() {
  const [tipoActivo, setTipoActivo] = useState<number>(0);
  const [rocaActiva, setRocaActiva] = useState<string | null>(null);

  const tipo = TIPOS_ROCAS[tipoActivo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Todas las rocas de la Tierra se clasifican en <strong>3 grandes familias</strong> según cómo se formaron. Cada tipo tiene un origen, textura y propiedades únicas.</p>
      </div>

      {/* Selector de tipo */}
      <div className={styles.tipoSelector}>
        {TIPOS_ROCAS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tipoBtn} ${tipoActivo === i ? styles.tipoBtnActivo : ''}`}
            style={tipoActivo === i ? { borderColor: t.color, color: t.color } : undefined}
            onClick={() => { setTipoActivo(i); setRocaActiva(null); }}
            aria-pressed={tipoActivo === i}
          >
            <span className={styles.tipoBtnIcono} aria-hidden="true">{t.icono}</span>
            <span className={styles.tipoBtnNombre}>{t.nombre}</span>
          </button>
        ))}
      </div>

      {/* Info del tipo */}
      <div className={styles.tipoCard} style={{ borderLeftColor: tipo.color }}>
        <h3 className={styles.tipoCardTitulo} style={{ color: tipo.color }}>
          {tipo.icono} Rocas {tipo.nombre}
        </h3>
        <p className={styles.tipoCardDesc}>{tipo.descripcion}</p>
        <div className={styles.tipoCardMeta}>
          <span className={styles.tipoCardTag}><strong>Proceso:</strong> {tipo.proceso}</span>
          <span className={styles.tipoCardTag}><strong>Textura:</strong> {tipo.textura}</span>
          <span className={styles.tipoCardTag}><strong>Dureza:</strong> {tipo.dureza}</span>
        </div>
      </div>

      {/* Subtipos y ejemplos */}
      {tipo.subtipos.map((sub, si) => (
        <div key={si} className={styles.subtipoBloque}>
          <h4 className={styles.subtipoTitulo}>{sub.nombre}</h4>
          <p className={styles.subtipoDesc}>{sub.descripcion}</p>
          <div className={styles.ejemplosGrid}>
            {sub.ejemplos.map((ej) => {
              const activa = rocaActiva === ej.nombre;
              return (
                <button
                  key={ej.nombre}
                  type="button"
                  className={`${styles.ejemploCard} ${activa ? styles.ejemploCardActivo : ''}`}
                  style={activa ? { borderColor: tipo.color } : undefined}
                  onClick={() => setRocaActiva(activa ? null : ej.nombre)}
                  aria-expanded={activa}
                >
                  <span className={styles.ejemploNombre}>{ej.nombre}</span>
                  {activa && (
                    <div className={styles.ejemploDetalle}>
                      <p className={styles.ejemploDescText}>{ej.descripcion}</p>
                      <p className={styles.ejemploUbicacion}><strong>Dónde:</strong> {ej.dondeSeEncuentra}</p>
                      <p className={styles.ejemploUso}><strong>Uso:</strong> {ej.uso}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tabla comparativa */}
      <div className={styles.tablaComparativa}>
        <h4 className={styles.tablaTitulo}>Tabla comparativa</h4>
        <div className={styles.tablaHeader}>
          <span className={styles.tablaHCell}>Tipo</span>
          <span className={styles.tablaHCell}>Origen</span>
          <span className={styles.tablaHCell}>Textura</span>
          <span className={styles.tablaHCell}>Dureza</span>
        </div>
        {TIPOS_ROCAS.map((t) => (
          <div key={t.id} className={styles.tablaRow}>
            <span className={styles.tablaCell} style={{ color: t.color, fontWeight: 700 }}>{t.icono} {t.nombre}</span>
            <span className={styles.tablaCell}>{t.proceso.split('→')[0].trim()}</span>
            <span className={styles.tablaCell}>{t.textura}</span>
            <span className={styles.tablaCell}>{t.dureza}</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Observa cualquier montaña con atención: sus capas, colores y fracturas cuentan
          una historia de <strong>millones de años</strong> de formación, erosión y transformación.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El Ciclo de las Rocas
// ─────────────────────────────────────────────

function SeccionCiclo() {
  const [procesoActivo, setProcesoActivo] = useState<string | null>(null);

  const procesoSeleccionado = PROCESOS_CICLO.find(p => p.id === procesoActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las rocas no son eternas: se <strong>transforman unas en otras</strong> en un ciclo continuo impulsado por la tectónica, la erosión y el calor interno de la Tierra.</p>
      </div>

      {/* Diagrama SVG del ciclo */}
      <div className={styles.cicloContainer}>
        <svg viewBox="0 0 400 360" className={styles.cicloSvg} aria-label="Diagrama del ciclo de las rocas: ígneas, sedimentarias y metamórficas se transforman entre sí">
          {/* Definiciones de flechas */}
          <defs>
            <marker id="arrowPrimary" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2E86AB" />
            </marker>
            <marker id="arrowMuted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#999" />
            </marker>
          </defs>

          {/* Nodo central: Magma */}
          <circle cx="200" cy="180" r="28" fill="#EF4444" opacity="0.15" />
          <text x="200" y="176" textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="700">🌋</text>
          <text x="200" y="192" textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="600">Magma</text>

          {/* Nodo: Ígneas (arriba) */}
          <circle cx="200" cy="60" r="36" fill="#DC2626" opacity="0.12" stroke="#DC2626" strokeWidth="2" />
          <text x="200" y="56" textAnchor="middle" fontSize="11" fill="#DC2626" fontWeight="700">🔥 Ígneas</text>
          <text x="200" y="72" textAnchor="middle" fontSize="8" fill="#DC2626">(enfriamiento)</text>

          {/* Nodo: Sedimentarias (abajo-izq) */}
          <circle cx="90" cy="300" r="36" fill="#D97706" opacity="0.12" stroke="#D97706" strokeWidth="2" />
          <text x="90" y="296" textAnchor="middle" fontSize="10" fill="#D97706" fontWeight="700">📐 Sediment.</text>
          <text x="90" y="310" textAnchor="middle" fontSize="8" fill="#D97706">(compactación)</text>

          {/* Nodo: Metamórficas (abajo-der) */}
          <circle cx="310" cy="300" r="36" fill="#7C3AED" opacity="0.12" stroke="#7C3AED" strokeWidth="2" />
          <text x="310" y="296" textAnchor="middle" fontSize="10" fill="#7C3AED" fontWeight="700">💎 Metamórf.</text>
          <text x="310" y="310" textAnchor="middle" fontSize="8" fill="#7C3AED">(presión+calor)</text>

          {/* Flecha principal: Ígneas → Sedimentarias (erosión) */}
          <path d="M170,88 Q60,160 78,264" fill="none" stroke="#2E86AB" strokeWidth="2.5" markerEnd="url(#arrowPrimary)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'ig-sed' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'ig-sed' ? null : 'ig-sed')} style={{ cursor: 'pointer' }}>
            <rect x="52" y="158" width="80" height="20" rx="10" fill="var(--bg-card, #fff)" stroke="#2E86AB" strokeWidth="1" />
            <text x="92" y="172" textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="600">Erosión</text>
          </g>

          {/* Flecha principal: Sedimentarias → Metamórficas (presión+calor) */}
          <path d="M126,308 L274,308" fill="none" stroke="#2E86AB" strokeWidth="2.5" markerEnd="url(#arrowPrimary)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'sed-met' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'sed-met' ? null : 'sed-met')} style={{ cursor: 'pointer' }}>
            <rect x="155" y="320" width="90" height="20" rx="10" fill="var(--bg-card, #fff)" stroke="#2E86AB" strokeWidth="1" />
            <text x="200" y="334" textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="600">Presión + Calor</text>
          </g>

          {/* Flecha principal: Metamórficas → Magma → Ígneas (fusión) */}
          <path d="M332,268 Q340,160 224,88" fill="none" stroke="#2E86AB" strokeWidth="2.5" markerEnd="url(#arrowPrimary)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'met-ig' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'met-ig' ? null : 'met-ig')} style={{ cursor: 'pointer' }}>
            <rect x="292" y="158" width="80" height="20" rx="10" fill="var(--bg-card, #fff)" stroke="#2E86AB" strokeWidth="1" />
            <text x="332" y="172" textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="600">Fusión</text>
          </g>

          {/* Atajo: Ígneas → Metamórficas (directo) */}
          <path d="M228,86 Q280,180 318,264" fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowMuted)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'ig-met' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'ig-met' ? null : 'ig-met')} style={{ cursor: 'pointer' }}>
            <rect x="252" y="130" width="52" height="16" rx="8" fill="var(--bg-card, #fff)" stroke="#999" strokeWidth="1" />
            <text x="278" y="142" textAnchor="middle" fontSize="7" fill="#999" fontWeight="600">atajo</text>
          </g>

          {/* Atajo: Sedimentarias → Sedimentarias (re-erosión) */}
          <path d="M66,276 Q30,260 66,320" fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowMuted)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'sed-sed' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'sed-sed' ? null : 'sed-sed')} style={{ cursor: 'pointer' }}>
            <rect x="14" y="276" width="52" height="16" rx="8" fill="var(--bg-card, #fff)" stroke="#999" strokeWidth="1" />
            <text x="40" y="288" textAnchor="middle" fontSize="7" fill="#999" fontWeight="600">recicla</text>
          </g>

          {/* Atajo: Metamórficas → Sedimentarias (erosión) */}
          <path d="M278,310 L126,302" fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrowMuted)"
            className={`${styles.flechaCiclo} ${procesoActivo === 'met-sed' ? styles.flechaActiva : ''}`}
          />
          <g className={styles.flechaLabel} onClick={() => setProcesoActivo(procesoActivo === 'met-sed' ? null : 'met-sed')} style={{ cursor: 'pointer' }}>
            <rect x="174" y="282" width="52" height="16" rx="8" fill="var(--bg-card, #fff)" stroke="#999" strokeWidth="1" />
            <text x="200" y="294" textAnchor="middle" fontSize="7" fill="#999" fontWeight="600">erosión</text>
          </g>
        </svg>

        <p className={styles.cicloLeyenda}>Haz clic en las etiquetas de las flechas para ver la explicación de cada proceso</p>
      </div>

      {/* Detalle del proceso seleccionado */}
      {procesoSeleccionado && (
        <div className={styles.procesoDetalle}>
          <h4 className={styles.procesoDetalleTitulo}>
            {procesoSeleccionado.desde} → {procesoSeleccionado.hasta}
          </h4>
          <p className={styles.procesoDetalleNombre}><strong>{procesoSeleccionado.proceso}</strong></p>
          <p className={styles.procesoDetalleDesc}>{procesoSeleccionado.descripcion}</p>
          <span className={styles.procesoDetalleDuracion}>Duración típica: {procesoSeleccionado.duracion}</span>
        </div>
      )}

      {/* Lista de procesos */}
      <div className={styles.procesosLista}>
        <h4 className={styles.procesosListaTitulo}>Todos los procesos del ciclo</h4>
        {PROCESOS_CICLO.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.procesoItem} ${procesoActivo === p.id ? styles.procesoItemActivo : ''}`}
            onClick={() => setProcesoActivo(procesoActivo === p.id ? null : p.id)}
            aria-pressed={procesoActivo === p.id}
          >
            <span className={styles.procesoItemFlecha}>{p.desde} → {p.hasta}</span>
            <span className={styles.procesoItemNombre}>{p.proceso}</span>
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El ciclo de las rocas tarda <strong>millones de años</strong>, pero nunca se detiene.
          La Tierra ha reciclado sus rocas durante 4.500 millones de años — y seguirá haciéndolo
          mientras su interior permanezca caliente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Rocas en tu Vida
// ─────────────────────────────────────────────

function SeccionVida() {
  const [rocaActiva, setRocaActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las rocas no solo están en montañas y ríos. Están en tu <strong>cocina, tu tejado, las carreteras</strong> y hasta en la sal con la que cocinas.</p>
      </div>

      <div className={styles.vidaGrid}>
        {ROCAS_COTIDIANAS.map((r, i) => (
          <button
            key={r.nombre}
            type="button"
            className={`${styles.vidaCard} ${rocaActiva === i ? styles.vidaCardActivo : ''}`}
            onClick={() => setRocaActiva(rocaActiva === i ? null : i)}
            aria-expanded={rocaActiva === i}
          >
            <div className={styles.vidaCardHeader}>
              <span className={styles.vidaIcono} aria-hidden="true">{r.icono}</span>
              <div className={styles.vidaCardInfo}>
                <span className={styles.vidaNombre}>{r.nombre}</span>
                <span className={styles.vidaTipo}>{r.tipo}</span>
              </div>
            </div>
            <p className={styles.vidaUso}>{r.uso}</p>
            {rocaActiva === i && (
              <p className={styles.vidaDetalle}>{r.detalle}</p>
            )}
          </button>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoDestacadoValor}>75%</span>
        <span className={styles.datoDestacadoTexto}>de la superficie terrestre está cubierta de rocas sedimentarias</span>
      </div>

      <div className={styles.insight}>
        <p>
          Mira a tu alrededor: el suelo que pisas, las paredes que te rodean, la sal en tu comida...
          todo viene de rocas que llevan <strong>millones de años</strong> formándose bajo tus pies.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las rocas guardan secretos de <strong>miles de millones de años</strong>. Estos datos muestran la escala asombrosa de los procesos geológicos.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.datoTitulo}>{d.titulo}</h4>
            <p className={styles.datoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Escala de Mohs */}
      <div className={styles.mohsContainer}>
        <h3 className={styles.mohsTitulo}>Escala de dureza de Mohs</h3>
        <p className={styles.mohsSubtitulo}>De lo más blando a lo más duro: 10 minerales de referencia</p>
        <div className={styles.mohsGrid}>
          {ESCALA_MOHS.map((m) => (
            <div key={m.dureza} className={styles.mohsItem}>
              <div
                className={styles.mohsBarra}
                style={{
                  height: `${20 + m.dureza * 14}px`,
                  background: m.color,
                }}
              >
                <span className={styles.mohsDureza}>{m.dureza}</span>
              </div>
              <span className={styles.mohsMineral}>{m.mineral}</span>
              <span className={styles.mohsRef}>{m.referencia}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El diamante (dureza 10) es <strong>4 veces más duro</strong> que el corindón (dureza 9),
          pero la escala de Mohs es ordinal, no lineal. La diferencia real entre 9 y 10
          es mayor que entre 1 y 9 combinados.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTiposRocasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('tipos');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'tipos': return <SeccionTipos />;
      case 'ciclo': return <SeccionCiclo />;
      case 'vida': return <SeccionVida />;
      case 'datos': return <SeccionDatos />;
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
          <h1 className={styles.title}>Tipos de Rocas</h1>
          <p className={styles.subtitle}>El ciclo que nunca se detiene: ígneas, sedimentarias y metamórficas</p>
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
          title="Más sobre tipos de rocas"
          subtitle="Conceptos clave y preguntas frecuentes"
          defaultOpen={false}
        >
          <h3>¿Cómo saber qué tipo de roca tengo?</h3>
          <p>
            Observa tres cosas: <strong>textura</strong> (cristales visibles = ígnea intrusiva,
            capas = sedimentaria, bandas = metamórfica foliada), <strong>dureza</strong> (prueba
            a rayarla con una moneda o un cuchillo) y <strong>reacción al ácido</strong> (si burbujea
            con vinagre, contiene carbonato cálcico = caliza o mármol).
          </p>

          <h3>¿Cuál es la diferencia entre roca y mineral?</h3>
          <p>
            Un <strong>mineral</strong> es una sustancia química natural con composición definida
            (cuarzo, feldespato, mica). Una <strong>roca</strong> es un agregado de uno o más minerales.
            El granito, por ejemplo, es una roca compuesta de cuarzo + feldespato + mica.
          </p>

          <h3>¿Por qué el mármol y la caliza son tan diferentes si una viene de la otra?</h3>
          <p>
            La caliza es blanda, porosa y suele contener fósiles. Cuando se somete a presión y calor
            (metamorfismo), los cristales de calcita se reorganizan y crecen, creando el mármol: más
            denso, brillante y sin fósiles visibles. Es la misma composición química, pero una estructura
            cristalina completamente diferente.
          </p>

          <h3>¿Las rocas pueden formarse rápido?</h3>
          <p>
            La mayoría tardan millones de años, pero hay excepciones: la lava se solidifica en horas o días
            (obsidiana, basalto), y los travertinos (caliza depositada por aguas termales) pueden crecer
            centímetros al año. Los meteoritos crean rocas de impacto (impactitas) en fracciones de segundo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador tiene fines divulgativos. Los datos geológicos
            (edades, duraciones, composiciones) son aproximaciones generales que pueden variar según
            la fuente y el contexto geológico específico. Para identificación profesional de rocas,
            consulta a un geólogo.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-tipos-rocas')} />
        <ShareCard appName="visualizador-tipos-rocas" />
        <Footer appName="visualizador-tipos-rocas" />
      </div>
    </>
  );
}
