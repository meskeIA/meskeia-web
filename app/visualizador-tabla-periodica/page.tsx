'use client';

import { useState } from 'react';
import styles from './VisualizadorTablaPeriodica.module.css';
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

type Seccion = 'cuerpo' | 'bolsillo' | 'casa' | 'raros';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'cuerpo', titulo: 'En tu cuerpo', icono: '🧬', subtitulo: 'Los elementos que te mantienen vivo' },
  { id: 'bolsillo', titulo: 'En tu bolsillo', icono: '📱', subtitulo: '30+ elementos en un solo dispositivo' },
  { id: 'casa', titulo: 'En tu casa', icono: '🏠', subtitulo: 'Habitación por habitación' },
  { id: 'raros', titulo: 'Raros y preciosos', icono: '💎', subtitulo: 'Los que podrían agotarse' },
];

// ─────────────────────────────────────────────
// Categorías de elementos (colores)
// ─────────────────────────────────────────────

type CategoriaElemento = 'noMetal' | 'metal' | 'metalAlcalino' | 'transicion' | 'metaloides' | 'tierrasRaras' | 'noble' | 'halogenoGas';

const COLORES_CATEGORIA: Record<CategoriaElemento, { bg: string; bgDark: string; borde: string }> = {
  noMetal: { bg: '#E8F5E9', bgDark: '#1B3A1B', borde: '#4CAF50' },
  metal: { bg: '#E3F2FD', bgDark: '#1A2A3D', borde: '#2196F3' },
  metalAlcalino: { bg: '#FFF3E0', bgDark: '#3D2A1A', borde: '#FF9800' },
  transicion: { bg: '#F3E5F5', bgDark: '#2A1A3D', borde: '#9C27B0' },
  metaloides: { bg: '#E0F7FA', bgDark: '#1A3D3D', borde: '#00BCD4' },
  tierrasRaras: { bg: '#FCE4EC', bgDark: '#3D1A2A', borde: '#E91E63' },
  noble: { bg: '#FFF9C4', bgDark: '#3D3A1A', borde: '#FBC02D' },
  halogenoGas: { bg: '#F1F8E9', bgDark: '#2A3D1A', borde: '#8BC34A' },
};

// ─────────────────────────────────────────────
// Datos: Cuerpo humano
// ─────────────────────────────────────────────

interface ElementoCuerpo {
  simbolo: string;
  nombre: string;
  numAtomico: number;
  porcentaje: number;
  funcion: string;
  detalle: string;
  categoria: CategoriaElemento;
}

const ELEMENTOS_CUERPO: ElementoCuerpo[] = [
  { simbolo: 'O', nombre: 'Oxígeno', numAtomico: 8, porcentaje: 65, funcion: 'Agua y respiración celular', detalle: 'Forma parte del agua (H₂O), que es el 60% de tu peso. Cada célula lo necesita para producir energía.', categoria: 'noMetal' },
  { simbolo: 'C', nombre: 'Carbono', numAtomico: 6, porcentaje: 18, funcion: 'Esqueleto de toda molécula orgánica', detalle: 'Base del ADN, proteínas, grasas y azúcares. Sin carbono no existe la vida tal como la conocemos.', categoria: 'noMetal' },
  { simbolo: 'H', nombre: 'Hidrógeno', numAtomico: 1, porcentaje: 10, funcion: 'Agua y enlaces químicos', detalle: 'El elemento más ligero y abundante del universo. En tu cuerpo, sobre todo formando agua.', categoria: 'noMetal' },
  { simbolo: 'N', nombre: 'Nitrógeno', numAtomico: 7, porcentaje: 3, funcion: 'Aminoácidos y ADN', detalle: 'Componente esencial de las proteínas (aminoácidos) y de las bases del ADN. Sin nitrógeno, no hay genes.', categoria: 'noMetal' },
  { simbolo: 'Ca', nombre: 'Calcio', numAtomico: 20, porcentaje: 1.5, funcion: 'Huesos, dientes, señales nerviosas', detalle: 'El 99% del calcio de tu cuerpo está en huesos y dientes. El 1% restante es vital para que los músculos se contraigan.', categoria: 'metalAlcalino' },
  { simbolo: 'P', nombre: 'Fósforo', numAtomico: 15, porcentaje: 1, funcion: 'ADN, huesos, energía (ATP)', detalle: 'Forma la columna vertebral del ADN y del ATP, la molécula que transporta energía dentro de las células.', categoria: 'noMetal' },
  { simbolo: 'Fe', nombre: 'Hierro', numAtomico: 26, porcentaje: 0.006, funcion: 'Hemoglobina (transporta O₂)', detalle: 'Cada glóbulo rojo contiene 270 millones de moléculas de hemoglobina, y cada una tiene 4 átomos de hierro.', categoria: 'transicion' },
  { simbolo: 'Na', nombre: 'Sodio', numAtomico: 11, porcentaje: 0.15, funcion: 'Impulsos nerviosos', detalle: 'Junto al potasio, crea las señales eléctricas que viajan por tus nervios a 100 m/s.', categoria: 'metalAlcalino' },
  { simbolo: 'K', nombre: 'Potasio', numAtomico: 19, porcentaje: 0.25, funcion: 'Latido cardíaco y nervios', detalle: 'Regula el ritmo del corazón. Un desequilibrio de potasio puede causar arritmias graves.', categoria: 'metalAlcalino' },
];

// ─────────────────────────────────────────────
// Datos: Smartphone
// ─────────────────────────────────────────────

interface ElementoSmartphone {
  simbolo: string;
  nombre: string;
  numAtomico: number;
  componente: string;
  uso: string;
  detalle: string;
  categoria: CategoriaElemento;
}

const ELEMENTOS_SMARTPHONE: ElementoSmartphone[] = [
  { simbolo: 'Li', nombre: 'Litio', numAtomico: 3, componente: 'Batería', uso: 'Almacena energía', detalle: 'Las baterías de ión-litio alimentan el 99% de los smartphones. Chile, Australia y China controlan las reservas.', categoria: 'metalAlcalino' },
  { simbolo: 'Si', nombre: 'Silicio', numAtomico: 14, componente: 'Procesador', uso: 'Chips y transistores', detalle: 'Un chip moderno tiene miles de millones de transistores de silicio de apenas 3 nanómetros de ancho.', categoria: 'metaloides' },
  { simbolo: 'In', nombre: 'Indio', numAtomico: 49, componente: 'Pantalla', uso: 'Pantalla táctil transparente (ITO)', detalle: 'El óxido de indio-estaño (ITO) conduce electricidad y es transparente. Sin él, las pantallas táctiles no funcionarían.', categoria: 'metal' },
  { simbolo: 'Au', nombre: 'Oro', numAtomico: 79, componente: 'Conectores', uso: 'Contactos eléctricos', detalle: 'Cada smartphone contiene ~0,03 g de oro. Se necesitan 41 móviles para obtener 1 g. No se corroe, conducción perfecta.', categoria: 'transicion' },
  { simbolo: 'Cu', nombre: 'Cobre', numAtomico: 29, componente: 'Cableado', uso: 'Cables y circuitos', detalle: 'El mejor conductor eléctrico asequible. Cada smartphone tiene unos 15 g de cobre en su circuitería.', categoria: 'transicion' },
  { simbolo: 'Ta', nombre: 'Tántalo', numAtomico: 73, componente: 'Condensadores', uso: 'Almacena carga eléctrica', detalle: 'Condensadores diminutos que regulan el voltaje. La mayor parte del tántalo mundial viene del Congo.', categoria: 'transicion' },
  { simbolo: 'Co', nombre: 'Cobalto', numAtomico: 27, componente: 'Batería', uso: 'Cátodo de la batería', detalle: 'Estabiliza el cátodo de la batería. El 70% del cobalto mundial se extrae en la República Democrática del Congo.', categoria: 'transicion' },
  { simbolo: 'Nd', nombre: 'Neodimio', numAtomico: 60, componente: 'Altavoz y vibración', uso: 'Imanes permanentes', detalle: 'Los imanes de neodimio son los más potentes del mundo. Hacen posible altavoces y motores diminutos.', categoria: 'tierrasRaras' },
  { simbolo: 'Sn', nombre: 'Estaño', numAtomico: 50, componente: 'Soldaduras', uso: 'Uniones entre componentes', detalle: 'La soldadura que une cada chip a la placa base contiene estaño. Miles de puntos de soldadura por dispositivo.', categoria: 'metal' },
];

// ─────────────────────────────────────────────
// Datos: Casa (por habitación)
// ─────────────────────────────────────────────

interface ElementoCasa {
  simbolo: string;
  nombre: string;
  numAtomico: number;
  objeto: string;
  uso: string;
  categoria: CategoriaElemento;
}

interface Habitacion {
  id: string;
  nombre: string;
  icono: string;
  elementos: ElementoCasa[];
}

const HABITACIONES: Habitacion[] = [
  {
    id: 'cocina',
    nombre: 'Cocina',
    icono: '🍳',
    elementos: [
      { simbolo: 'Al', nombre: 'Aluminio', numAtomico: 13, objeto: 'Papel de aluminio', uso: 'Ligero, maleable, no tóxico. El tercer elemento más abundante en la corteza terrestre.', categoria: 'metal' },
      { simbolo: 'Fe', nombre: 'Hierro', numAtomico: 26, objeto: 'Sartenes y cuchillos', uso: 'Acero = hierro + carbono. La aleación que construyó la civilización moderna.', categoria: 'transicion' },
      { simbolo: 'N', nombre: 'Nitrógeno', numAtomico: 7, objeto: 'Conservación de alimentos', uso: 'El nitrógeno líquido congela al instante. En envases, desplaza al oxígeno para evitar oxidación.', categoria: 'noMetal' },
      { simbolo: 'Cu', nombre: 'Cobre', numAtomico: 29, objeto: 'Ollas de cobre y tuberías', uso: 'Excelente conductor de calor. Las ollas de cobre distribuyen la temperatura uniformemente.', categoria: 'transicion' },
      { simbolo: 'Na', nombre: 'Sodio', numAtomico: 11, objeto: 'Sal de mesa (NaCl)', uso: 'Cloruro de sodio. Esencial para conservar alimentos desde hace 5.000 años.', categoria: 'metalAlcalino' },
    ],
  },
  {
    id: 'bano',
    nombre: 'Baño',
    icono: '🚿',
    elementos: [
      { simbolo: 'Cl', nombre: 'Cloro', numAtomico: 17, objeto: 'Agua potable', uso: 'Desinfecta el agua eliminando bacterias. La cloración salvó más vidas que cualquier medicamento.', categoria: 'halogenoGas' },
      { simbolo: 'F', nombre: 'Flúor', numAtomico: 9, objeto: 'Pasta de dientes', uso: 'El fluoruro refuerza el esmalte dental. Reduce las caries hasta un 25%.', categoria: 'halogenoGas' },
      { simbolo: 'Ti', nombre: 'Titanio', numAtomico: 22, objeto: 'Protector solar', uso: 'El dióxido de titanio (TiO₂) refleja los rayos UV. Blanco, seguro y no irritante.', categoria: 'transicion' },
      { simbolo: 'Zn', nombre: 'Zinc', numAtomico: 30, objeto: 'Cremas y champú anticaspa', uso: 'El piritiona de zinc combate los hongos del cuero cabelludo. También en cremas para bebé.', categoria: 'transicion' },
    ],
  },
  {
    id: 'salon',
    nombre: 'Salón',
    icono: '🛋️',
    elementos: [
      { simbolo: 'W', nombre: 'Wolframio', numAtomico: 74, objeto: 'Bombillas incandescentes', uso: 'Punto de fusión más alto de todos los metales (3.422 °C). Perfecto para filamentos al rojo vivo.', categoria: 'transicion' },
      { simbolo: 'Ga', nombre: 'Galio', numAtomico: 31, objeto: 'LEDs', uso: 'El nitruro de galio (GaN) emite luz azul y blanca. Revolución en iluminación eficiente.', categoria: 'metal' },
      { simbolo: 'He', nombre: 'Helio', numAtomico: 2, objeto: 'Globos de cumpleaños', uso: 'Más ligero que el aire, inerte y seguro. Pero es un recurso no renovable que se está agotando.', categoria: 'noble' },
      { simbolo: 'Si', nombre: 'Silicio', numAtomico: 14, objeto: 'Cristal de ventanas', uso: 'El vidrio es dióxido de silicio (SiO₂) fundido. Transparente, duro y abundante.', categoria: 'metaloides' },
      { simbolo: 'Cu', nombre: 'Cobre', numAtomico: 29, objeto: 'Cables eléctricos', uso: 'Cada casa tiene ~100 kg de cobre en su instalación eléctrica. Sin cobre, no hay electricidad.', categoria: 'transicion' },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: Elementos raros y escasos
// ─────────────────────────────────────────────

interface ElementoRaro {
  simbolo: string;
  nombre: string;
  numAtomico: number;
  abundancia: number; // partes por millón en corteza terrestre
  uso: string;
  amenaza: string;
  agotamiento: string;
  categoria: CategoriaElemento;
}

const ELEMENTOS_ABUNDANTES: ElementoRaro[] = [
  { simbolo: 'Si', nombre: 'Silicio', numAtomico: 14, abundancia: 282000, uso: 'Chips, vidrio, hormigón', amenaza: 'Sin riesgo', agotamiento: 'Abundante', categoria: 'metaloides' },
  { simbolo: 'Al', nombre: 'Aluminio', numAtomico: 13, abundancia: 82300, uso: 'Envases, aviones, cables', amenaza: 'Sin riesgo', agotamiento: 'Abundante', categoria: 'metal' },
  { simbolo: 'Fe', nombre: 'Hierro', numAtomico: 26, abundancia: 56300, uso: 'Acero, construcción, coches', amenaza: 'Sin riesgo', agotamiento: 'Abundante', categoria: 'transicion' },
];

const ELEMENTOS_ESCASOS: ElementoRaro[] = [
  { simbolo: 'He', nombre: 'Helio', numAtomico: 2, abundancia: 0.008, uso: 'Resonancias magnéticas, superconductores', amenaza: 'Crítica: no se puede fabricar', agotamiento: '25-30 años al ritmo actual', categoria: 'noble' },
  { simbolo: 'P', nombre: 'Fósforo', numAtomico: 15, abundancia: 1050, uso: 'Fertilizantes (alimenta al mundo)', amenaza: 'Alta: Marruecos controla el 70% de las reservas', agotamiento: '80-100 años', categoria: 'noMetal' },
  { simbolo: 'In', nombre: 'Indio', numAtomico: 49, abundancia: 0.25, uso: 'Pantallas táctiles (ITO)', amenaza: 'Alta: producción concentrada en China', agotamiento: '15-20 años', categoria: 'metal' },
  { simbolo: 'Ga', nombre: 'Galio', numAtomico: 31, abundancia: 19, uso: 'LEDs, chips 5G, paneles solares', amenaza: 'Alta: subproducto del aluminio, difícil de extraer solo', agotamiento: '~20 años', categoria: 'metal' },
  { simbolo: 'Rh', nombre: 'Rodio', numAtomico: 45, abundancia: 0.001, uso: 'Catalizadores de coches', amenaza: 'Extrema: más caro que el oro', agotamiento: 'Reservas muy limitadas', categoria: 'transicion' },
  { simbolo: 'Os', nombre: 'Osmio', numAtomico: 76, abundancia: 0.0015, uso: 'Aleaciones ultra-duras, puntas de pluma', amenaza: 'Muy escaso pero baja demanda', agotamiento: 'Limitado', categoria: 'transicion' },
  { simbolo: 'Pt', nombre: 'Platino', numAtomico: 78, abundancia: 0.005, uso: 'Catalizadores, joyería, medicina', amenaza: 'Alta: el 70% viene de Sudáfrica', agotamiento: '40-50 años', categoria: 'transicion' },
  { simbolo: 'Nd', nombre: 'Neodimio', numAtomico: 60, abundancia: 41.5, uso: 'Imanes (aerogeneradores, coches eléctricos)', amenaza: 'Alta: China controla el 90% de tierras raras', agotamiento: 'Décadas, pero geopolíticamente frágil', categoria: 'tierrasRaras' },
];

// ─────────────────────────────────────────────
// Componentes auxiliares
// ─────────────────────────────────────────────

function ElementCard({
  simbolo,
  nombre,
  numAtomico,
  categoria,
  children,
}: {
  simbolo: string;
  nombre: string;
  numAtomico: number;
  categoria: CategoriaElemento;
  children: React.ReactNode;
}) {
  const colores = COLORES_CATEGORIA[categoria];
  return (
    <div
      className={styles.elementCard}
      style={{ borderLeftColor: colores.borde }}
    >
      <div className={styles.elementHeader}>
        <div className={styles.elementBadge} style={{ borderColor: colores.borde }}>
          <span className={styles.elementNumero}>{numAtomico}</span>
          <span className={styles.elementSimbolo} style={{ color: colores.borde }}>{simbolo}</span>
        </div>
        <span className={styles.elementNombre}>{nombre}</span>
      </div>
      <div className={styles.elementBody}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 1: En tu cuerpo
// ─────────────────────────────────────────────

function SeccionCuerpo() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cuerpo es una <strong>fábrica química</strong> hecha de apenas 6 elementos principales. Juntos representan el <strong>98,5%</strong> de tu peso.</p>
      </div>

      {/* Bloques proporcionales */}
      <div className={styles.bloquesProporcionales}>
        {ELEMENTOS_CUERPO.map((el, i) => {
          const ancho = Math.max(el.porcentaje * 1.2, 8);
          return (
            <button
              key={el.simbolo}
              type="button"
              className={`${styles.bloqueCuerpo} ${seleccionado === i ? styles.bloqueActivo : ''}`}
              style={{
                flex: `0 0 ${ancho}%`,
                borderColor: COLORES_CATEGORIA[el.categoria].borde,
              }}
              onClick={() => setSeleccionado(seleccionado === i ? null : i)}
              aria-pressed={seleccionado === i}
              aria-label={`${el.nombre}: ${formatNumber(el.porcentaje, 1)}% del cuerpo`}
            >
              <span className={styles.bloqueSimbolo}>{el.simbolo}</span>
              <span className={styles.bloquePct}>{formatNumber(el.porcentaje, el.porcentaje < 1 ? 3 : 1)}%</span>
            </button>
          );
        })}
      </div>

      {/* Detalle del elemento seleccionado */}
      {seleccionado !== null && (
        <ElementCard
          simbolo={ELEMENTOS_CUERPO[seleccionado].simbolo}
          nombre={ELEMENTOS_CUERPO[seleccionado].nombre}
          numAtomico={ELEMENTOS_CUERPO[seleccionado].numAtomico}
          categoria={ELEMENTOS_CUERPO[seleccionado].categoria}
        >
          <p className={styles.elementFuncion}>
            <strong>{ELEMENTOS_CUERPO[seleccionado].funcion}</strong>
          </p>
          <p className={styles.elementDetalle}>{ELEMENTOS_CUERPO[seleccionado].detalle}</p>
        </ElementCard>
      )}

      {/* Funciones especiales */}
      <div className={styles.funcionesGrid}>
        <div className={styles.funcionCard}>
          <span className={styles.funcionIcono} aria-hidden="true">🩸</span>
          <h4 className={styles.funcionTitulo}>Hierro en sangre</h4>
          <p className={styles.funcionDesc}>Cada glóbulo rojo lleva hierro en su hemoglobina para transportar oxígeno. Tienes unos 4 g de hierro en total.</p>
        </div>
        <div className={styles.funcionCard}>
          <span className={styles.funcionIcono} aria-hidden="true">🦴</span>
          <h4 className={styles.funcionTitulo}>Calcio en huesos</h4>
          <p className={styles.funcionDesc}>El 99% del calcio de tu cuerpo forma la estructura rígida de huesos y dientes. ~1 kg en un adulto.</p>
        </div>
        <div className={styles.funcionCard}>
          <span className={styles.funcionIcono} aria-hidden="true">⚡</span>
          <h4 className={styles.funcionTitulo}>Sodio/Potasio en nervios</h4>
          <p className={styles.funcionDesc}>El intercambio sodio-potasio genera los impulsos eléctricos que viajan por tus nervios a 100 m/s.</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          De los 118 elementos de la tabla periódica, tu cuerpo usa unos <strong>25 de forma esencial</strong>.
          Pero el 96% de tu peso son solo 4: oxígeno, carbono, hidrógeno y nitrógeno.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: En tu bolsillo
// ─────────────────────────────────────────────

function SeccionBolsillo() {
  const [componenteActivo, setComponenteActivo] = useState<string | null>(null);

  const componentes = [
    { id: 'Batería', icono: '🔋' },
    { id: 'Procesador', icono: '🧠' },
    { id: 'Pantalla', icono: '📺' },
    { id: 'Conectores', icono: '🔌' },
    { id: 'Cableado', icono: '🔗' },
    { id: 'Condensadores', icono: '⚡' },
    { id: 'Altavoz y vibración', icono: '🔊' },
    { id: 'Soldaduras', icono: '🔧' },
  ];

  const elementosFiltrados = componenteActivo
    ? ELEMENTOS_SMARTPHONE.filter(el => el.componente === componenteActivo)
    : ELEMENTOS_SMARTPHONE;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un smartphone contiene más de <strong>30 elementos químicos</strong> diferentes. Algunos vienen de minas en el Congo, otros de salares en Chile. El mundo entero en tu bolsillo.</p>
      </div>

      {/* Mapa de componentes */}
      <div className={styles.componenteNav}>
        <button
          type="button"
          className={`${styles.componenteBtn} ${componenteActivo === null ? styles.componenteBtnActivo : ''}`}
          onClick={() => setComponenteActivo(null)}
        >
          <span aria-hidden="true">📱</span> Todos
        </button>
        {componentes.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.componenteBtn} ${componenteActivo === c.id ? styles.componenteBtnActivo : ''}`}
            onClick={() => setComponenteActivo(componenteActivo === c.id ? null : c.id)}
            aria-pressed={componenteActivo === c.id}
          >
            <span aria-hidden="true">{c.icono}</span> {c.id}
          </button>
        ))}
      </div>

      {/* Elementos del smartphone */}
      <div className={styles.smartphoneGrid}>
        {elementosFiltrados.map(el => (
          <ElementCard
            key={el.simbolo}
            simbolo={el.simbolo}
            nombre={el.nombre}
            numAtomico={el.numAtomico}
            categoria={el.categoria}
          >
            <span className={styles.componenteTag}>{el.componente}</span>
            <p className={styles.elementFuncion}><strong>{el.uso}</strong></p>
            <p className={styles.elementDetalle}>{el.detalle}</p>
          </ElementCard>
        ))}
      </div>

      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>30+</span>
        <span className={styles.datoTexto}>elementos químicos diferentes en un solo smartphone</span>
      </div>

      <div className={styles.insight}>
        <p>
          Un smartphone es un <strong>compendio de la tabla periódica</strong>. Fabricar uno requiere minería en
          decenas de países, procesamiento químico complejo y cadenas de suministro que cruzan continentes.
          Solo se recicla el <strong>17%</strong> de los dispositivos electrónicos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: En tu casa
// ─────────────────────────────────────────────

function SeccionCasa() {
  const [habitacionActiva, setHabitacionActiva] = useState(HABITACIONES[0].id);

  const habitacion = HABITACIONES.find(h => h.id === habitacionActiva) ?? HABITACIONES[0];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu hogar es un <strong>laboratorio químico</strong> sin que lo sepas. Cada habitación está llena de elementos que hacen tu vida más segura, cómoda y brillante.</p>
      </div>

      {/* Selector de habitación */}
      <div className={styles.habitacionNav}>
        {HABITACIONES.map(h => (
          <button
            key={h.id}
            type="button"
            className={`${styles.habitacionBtn} ${habitacionActiva === h.id ? styles.habitacionBtnActivo : ''}`}
            onClick={() => setHabitacionActiva(h.id)}
            aria-pressed={habitacionActiva === h.id}
          >
            <span className={styles.habitacionIcono} aria-hidden="true">{h.icono}</span>
            <span className={styles.habitacionNombre}>{h.nombre}</span>
          </button>
        ))}
      </div>

      {/* Elementos de la habitación */}
      <div className={styles.habitacionContenido}>
        <h3 className={styles.habitacionTitulo}>
          <span aria-hidden="true">{habitacion.icono}</span> {habitacion.nombre}
        </h3>
        <div className={styles.habitacionGrid}>
          {habitacion.elementos.map(el => (
            <ElementCard
              key={`${habitacion.id}-${el.simbolo}`}
              simbolo={el.simbolo}
              nombre={el.nombre}
              numAtomico={el.numAtomico}
              categoria={el.categoria}
            >
              <span className={styles.componenteTag}>{el.objeto}</span>
              <p className={styles.elementDetalle}>{el.uso}</p>
            </ElementCard>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Solo en tu cocina hay al menos <strong>10 elementos diferentes</strong> en contacto directo con tu comida.
          El cloro del grifo ha salvado más vidas que todos los hospitales del mundo juntos: erradicó el cólera y la fiebre tifoidea en las ciudades.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Raros y preciosos
// ─────────────────────────────────────────────

function SeccionRaros() {
  const maxAbundancia = Math.log10(ELEMENTOS_ABUNDANTES[0].abundancia + 1);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>No todos los elementos son iguales. Algunos son tan <strong>abundantes que los pisas</strong> cada día. Otros son tan raros que <strong>podrían agotarse en una generación</strong>.</p>
      </div>

      {/* Comparativa abundantes vs escasos */}
      <div className={styles.abundanciaSeccion}>
        <h3 className={styles.abundanciaTitulo}>Los más comunes de la corteza terrestre</h3>
        <div className={styles.abundanciaBarras}>
          {ELEMENTOS_ABUNDANTES.map(el => {
            const ancho = (Math.log10(el.abundancia + 1) / maxAbundancia) * 100;
            return (
              <div key={el.simbolo} className={styles.abundanciaBarra}>
                <div className={styles.abundanciaLabel}>
                  <span className={styles.abundanciaSimbolo}>{el.simbolo}</span>
                  <span className={styles.abundanciaNombre}>{el.nombre}</span>
                </div>
                <div className={styles.barraContainer}>
                  <div
                    className={styles.barraFill}
                    style={{ width: `${ancho}%`, background: '#27ae60' }}
                  />
                </div>
                <span className={styles.abundanciaValor}>{formatNumber(el.abundancia, 0)} ppm</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.abundanciaSeccion}>
        <h3 className={styles.abundanciaTitulo}>Los que podrían agotarse</h3>
        <div className={styles.escasosGrid}>
          {ELEMENTOS_ESCASOS.map(el => (
            <ElementCard
              key={el.simbolo}
              simbolo={el.simbolo}
              nombre={el.nombre}
              numAtomico={el.numAtomico}
              categoria={el.categoria}
            >
              <p className={styles.elementFuncion}><strong>{el.uso}</strong></p>
              <div className={styles.amenazaTag}>
                <span className={styles.amenazaIcono} aria-hidden="true">
                  {el.abundancia < 0.01 ? '🔴' : el.abundancia < 1 ? '🟠' : '🟡'}
                </span>
                <span className={styles.amenazaTexto}>{el.amenaza}</span>
              </div>
              <p className={styles.agotamientoTexto}>
                <strong>Horizonte:</strong> {el.agotamiento}
              </p>
              <p className={styles.abundanciaSmall}>Abundancia: {el.abundancia < 1 ? formatNumber(el.abundancia, 3) : formatNumber(el.abundancia, 1)} ppm</p>
            </ElementCard>
          ))}
        </div>
      </div>

      {/* Dato de tierras raras */}
      <div className={styles.datoDestacado}>
        <span className={styles.datoNumero}>90%</span>
        <span className={styles.datoTexto}>de las tierras raras se procesan en China. Sin ellas, no hay coches eléctricos, aerogeneradores ni smartphones.</span>
      </div>

      <div className={styles.insight}>
        <p>
          La <strong>crisis del fósforo</strong> es silenciosa pero existencial: sin fósforo no hay fertilizantes,
          sin fertilizantes no hay comida para 8.000 millones de personas. Y el <strong>helio</strong>, una vez
          liberado a la atmósfera, escapa al espacio para siempre. No se puede fabricar.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTablaPeriodica() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('cuerpo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'cuerpo': return <SeccionCuerpo />;
      case 'bolsillo': return <SeccionBolsillo />;
      case 'casa': return <SeccionCasa />;
      case 'raros': return <SeccionRaros />;
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
          <h1 className={styles.title}>La Tabla Periódica en tu Vida</h1>
          <p className={styles.subtitle}>Los elementos químicos que tocas, respiras y llevas en el bolsillo cada día</p>
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
          title="Más sobre la tabla periódica"
          subtitle="Curiosidades y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Cuántos elementos existen?</h3>
          <p>
            La tabla periódica tiene <strong>118 elementos confirmados</strong>. Los primeros 94 existen de forma natural
            en la Tierra. Los demás son sintéticos, creados en laboratorio por fracciones de segundo.
            El más reciente, el oganesón (Og, 118), se sintetizó en 2006.
          </p>

          <h3>¿Qué son las tierras raras?</h3>
          <p>
            Son 17 elementos (los lantánidos + escandio e itrio) que, pese a su nombre, no son tan raros en la corteza
            terrestre. El problema es que están <strong>muy dispersos</strong>, lo que hace su extracción cara y contaminante.
            Son esenciales para imanes, catalizadores, láser y electrónica.
          </p>

          <h3>¿Por qué el helio se agota?</h3>
          <p>
            El helio es tan ligero que, una vez liberado, <strong>escapa de la atmósfera al espacio</strong>. No se puede
            fabricar (solo se genera en reacciones nucleares subterráneas). Se usa en resonancias magnéticas, soldadura y
            semiconductores. Los globos de cumpleaños compiten con la medicina por las reservas.
          </p>

          <h3>¿Cuántos elementos hay en tu cuerpo?</h3>
          <p>
            Tu cuerpo contiene al menos <strong>60 elementos</strong>, pero solo 25 son esenciales. Cuatro de ellos
            (O, C, H, N) suponen el 96% de tu peso. El resto son oligoelementos en cantidades ínfimas pero vitales:
            sin yodo no funciona tu tiroides, sin zinc tu sistema inmune falla.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de química con fines educativos.
            Los porcentajes de composición corporal y estimaciones de agotamiento de recursos son aproximados
            y pueden variar según la fuente consultada.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-tabla-periodica')} />
        <ShareCard appName="visualizador-tabla-periodica" />
        <Footer appName="visualizador-tabla-periodica" />
      </div>
    </>
  );
}
