'use client';

import { useState } from 'react';
import styles from './VisualizadorSistemaNervioso.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'neurona' | 'central-periferico' | 'sinapsis' | 'neurotransmisores';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'neurona', titulo: 'La neurona', icono: '🧬', subtitulo: 'La unidad básica del sistema nervioso' },
  { id: 'central-periferico', titulo: 'Central vs periférico', icono: '🧠', subtitulo: 'SNC y SNP: dos sistemas, un cuerpo' },
  { id: 'sinapsis', titulo: 'Sinapsis y señal', icono: '⚡', subtitulo: 'Cómo viaja el impulso nervioso' },
  { id: 'neurotransmisores', titulo: 'Neurotransmisores', icono: '🔬', subtitulo: 'Los mensajeros químicos del cerebro' },
];

// ─────────────────────────────────────────────
// Datos: partes de la neurona
// ─────────────────────────────────────────────

interface ParteNeurona {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  dato: string;
  color: string;
}

const PARTES_NEURONA: ParteNeurona[] = [
  {
    id: 'soma',
    nombre: 'Soma (cuerpo celular)',
    icono: '🟣',
    descripcion: 'Centro de control de la neurona. Contiene el núcleo con el ADN y los orgánulos que mantienen la célula viva. Procesa las señales que llegan de las dendritas.',
    dato: 'Mide entre 4 y 100 micras según el tipo de neurona.',
    color: '#8e44ad',
  },
  {
    id: 'dendritas',
    nombre: 'Dendritas',
    icono: '🌿',
    descripcion: 'Ramificaciones cortas que salen del soma. Son las "antenas" de la neurona: reciben señales de otras neuronas a través de las sinapsis.',
    dato: 'Una sola neurona puede tener hasta 10.000 dendritas.',
    color: '#27ae60',
  },
  {
    id: 'axon',
    nombre: 'Axón',
    icono: '📡',
    descripcion: 'Fibra larga que transmite el impulso eléctrico desde el soma hasta los terminales sinápticos. Es el "cable" de la neurona.',
    dato: 'El axón más largo del cuerpo mide ~1 metro (nervio ciático, desde la médula espinal hasta el pie).',
    color: '#2E86AB',
  },
  {
    id: 'mielina',
    nombre: 'Vaina de mielina',
    icono: '🛡️',
    descripcion: 'Capa aislante de grasa que envuelve el axón en segmentos. Acelera la conducción del impulso nervioso al forzar que la señal "salte" entre nodos.',
    dato: 'La esclerosis múltiple es una enfermedad donde el sistema inmune destruye la mielina propia.',
    color: '#f39c12',
  },
  {
    id: 'ranvier',
    nombre: 'Nodos de Ranvier',
    icono: '⚡',
    descripcion: 'Pequeños huecos entre los segmentos de mielina. El impulso eléctrico "salta" de nodo en nodo (conducción saltatoria), lo que multiplica la velocidad.',
    dato: 'La conducción saltatoria es hasta 100 veces más rápida que la continua.',
    color: '#e74c3c',
  },
  {
    id: 'terminal',
    nombre: 'Terminal sináptico',
    icono: '🔗',
    descripcion: 'El extremo del axón, donde se almacenan los neurotransmisores en pequeñas vesículas. Cuando llega el impulso, las vesículas liberan su contenido hacia la siguiente neurona.',
    dato: 'Cada terminal puede contener miles de vesículas, cada una con miles de moléculas de neurotransmisor.',
    color: '#48A9A6',
  },
];

// ─────────────────────────────────────────────
// Datos: sistema nervioso central vs periférico
// ─────────────────────────────────────────────

interface NodoArbol {
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
  color: string;
  hijos?: NodoArbol[];
}

const ARBOL_SN: NodoArbol = {
  nombre: 'Sistema Nervioso',
  icono: '🧠',
  descripcion: 'Red de comunicación del cuerpo. Recibe, procesa y envía señales.',
  ejemplo: '',
  color: '#2E86AB',
  hijos: [
    {
      nombre: 'SNC (Central)',
      icono: '🏛️',
      descripcion: 'Centro de mando: cerebro + médula espinal. Procesa la información y toma decisiones.',
      ejemplo: 'Pensar, recordar, sentir emociones',
      color: '#8e44ad',
      hijos: [
        {
          nombre: 'Cerebro',
          icono: '🧠',
          descripcion: 'El órgano más complejo conocido. Controla pensamiento, memoria, emociones, movimiento voluntario y sentidos.',
          ejemplo: 'Resolver un problema de matemáticas',
          color: '#9b59b6',
        },
        {
          nombre: 'Médula espinal',
          icono: '🦴',
          descripcion: 'Cordón nervioso protegido por la columna vertebral. Conecta el cerebro con el SNP y gestiona reflejos.',
          ejemplo: 'Retirar la mano de algo caliente (arco reflejo)',
          color: '#8e44ad',
        },
      ],
    },
    {
      nombre: 'SNP (Periférico)',
      icono: '🌐',
      descripcion: 'Red de nervios que conecta el SNC con el resto del cuerpo. Craneales (12 pares) + espinales (31 pares).',
      ejemplo: 'Llevar señales desde la piel, músculos y órganos',
      color: '#27ae60',
      hijos: [
        {
          nombre: 'Somático (voluntario)',
          icono: '🤚',
          descripcion: 'Controla los músculos esqueléticos. Tú decides cuándo y cómo moverlos conscientemente.',
          ejemplo: 'Mover la mano, caminar, escribir',
          color: '#2ecc71',
        },
        {
          nombre: 'Autónomo (involuntario)',
          icono: '⚙️',
          descripcion: 'Controla funciones automáticas sin que pienses en ellas. Dividido en simpático y parasimpático.',
          ejemplo: 'Latidos del corazón, digestión, respiración',
          color: '#16a085',
          hijos: [
            {
              nombre: 'Simpático',
              icono: '🔥',
              descripcion: 'Sistema de "lucha o huida". Prepara el cuerpo para la acción: acelera el corazón, dilata pupilas, libera adrenalina.',
              ejemplo: 'Dilatar la pupila ante un susto, sudar las manos',
              color: '#e74c3c',
            },
            {
              nombre: 'Parasimpático',
              icono: '😌',
              descripcion: 'Sistema de "descanso y digestión". Ralentiza el corazón, activa la digestión, relaja el cuerpo.',
              ejemplo: 'Digestión después de comer, relajarse al dormir',
              color: '#3498db',
            },
          ],
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Datos: potencial de acción y sinapsis
// ─────────────────────────────────────────────

interface FaseSenal {
  nombre: string;
  icono: string;
  voltaje: string;
  descripcion: string;
  color: string;
}

const FASES_SENAL: FaseSenal[] = [
  {
    nombre: 'Reposo',
    icono: '😴',
    voltaje: '-70 mV',
    descripcion: 'La neurona está en espera. Interior negativo respecto al exterior. Canales de sodio cerrados. Lista para recibir un estímulo.',
    color: '#3498db',
  },
  {
    nombre: 'Estímulo',
    icono: '👆',
    voltaje: '-55 mV (umbral)',
    descripcion: 'Una señal llega y despolariza la membrana. Si alcanza el umbral de -55 mV, se abre la compuerta. Es "todo o nada": o se dispara al 100% o no pasa nada.',
    color: '#f39c12',
  },
  {
    nombre: 'Despolarización',
    icono: '⚡',
    voltaje: '+40 mV',
    descripcion: 'Los canales de sodio (Na⁺) se abren de golpe. El sodio entra masivamente → el interior se vuelve positivo. La señal viaja a lo largo del axón.',
    color: '#e74c3c',
  },
  {
    nombre: 'Repolarización',
    icono: '🔄',
    voltaje: '-70 mV',
    descripcion: 'Los canales de Na⁺ se cierran y los de potasio (K⁺) se abren. El potasio sale → el interior vuelve a ser negativo. Se restaura el estado de reposo.',
    color: '#27ae60',
  },
  {
    nombre: 'Período refractario',
    icono: '🚫',
    voltaje: '~ -80 mV',
    descripcion: 'Brevemente, la neurona queda hiperpolarizada y no puede disparar otro impulso. Dura 1-2 ms. Garantiza que la señal viaje en una sola dirección.',
    color: '#95a5a6',
  },
];

interface DatoSinapsis {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_SINAPSIS: DatoSinapsis[] = [
  { icono: '🏎️', titulo: 'Con mielina: hasta 120 m/s', descripcion: 'Equivalente a 432 km/h. Los axones mielinizados transmiten señales motoras y sensoriales rápidas.' },
  { icono: '🐢', titulo: 'Sin mielina: ~2 m/s', descripcion: 'Las fibras no mielinizadas (dolor lento, temperatura) transmiten 60 veces más despacio.' },
  { icono: '🔀', titulo: 'Excitatorias vs inhibitorias', descripcion: 'Unas sinapsis activan la neurona siguiente (glutamato) y otras la frenan (GABA). El cerebro es un equilibrio constante.' },
  { icono: '🎯', titulo: 'Todo o nada', descripcion: 'Si el estímulo supera el umbral, la neurona dispara al 100%. No hay señales a "medio gas". La intensidad se codifica por frecuencia de disparos.' },
];

// ─────────────────────────────────────────────
// Datos: neurotransmisores
// ─────────────────────────────────────────────

interface Neurotransmisor {
  nombre: string;
  icono: string;
  funcion: string;
  descripcion: string;
  color: string;
  dato: string;
}

const NEUROTRANSMISORES: Neurotransmisor[] = [
  {
    nombre: 'Dopamina',
    icono: '🎯',
    funcion: 'Recompensa y motivación',
    descripcion: 'El neurotransmisor del placer y la motivación. Se libera cuando logras algo, comes algo rico o anticipas una recompensa. Clave en el aprendizaje y la adicción.',
    color: '#e74c3c',
    dato: 'Se libera antes de obtener la recompensa, no después — es la anticipación lo que motiva.',
  },
  {
    nombre: 'Serotonina',
    icono: '😊',
    funcion: 'Ánimo y sueño',
    descripcion: 'Regula el estado de ánimo, el sueño, el apetito y la temperatura corporal. Niveles bajos se asocian con depresión y ansiedad.',
    color: '#f39c12',
    dato: 'El 90% de la serotonina del cuerpo se produce en el intestino, no en el cerebro.',
  },
  {
    nombre: 'Acetilcolina',
    icono: '💪',
    funcion: 'Movimiento y memoria',
    descripcion: 'Esencial para la contracción muscular voluntaria y la formación de memorias. Fue el primer neurotransmisor descubierto (1914).',
    color: '#27ae60',
    dato: 'El veneno curare bloquea la acetilcolina → parálisis muscular. Lo usaban indígenas en flechas.',
  },
  {
    nombre: 'GABA',
    icono: '😌',
    funcion: 'Inhibición y calma',
    descripcion: 'El principal neurotransmisor inhibitorio. Frena la actividad neuronal excesiva. Sin GABA suficiente, el cerebro se sobreexcita (convulsiones, ansiedad).',
    color: '#3498db',
    dato: 'Los ansiolíticos (benzodiacepinas) y el alcohol potencian el efecto del GABA.',
  },
  {
    nombre: 'Noradrenalina',
    icono: '🚨',
    funcion: 'Alerta y atención',
    descripcion: 'Activa el estado de alerta, la concentración y la respuesta al estrés. Aumenta el ritmo cardíaco y la presión arterial. Relacionada con la respuesta de "lucha o huida".',
    color: '#8e44ad',
    dato: 'Es similar a la adrenalina pero actúa principalmente en el cerebro, no en el cuerpo.',
  },
  {
    nombre: 'Glutamato',
    icono: '📚',
    funcion: 'Excitación y aprendizaje',
    descripcion: 'El principal neurotransmisor excitatorio. Fundamental para el aprendizaje, la memoria y la plasticidad neuronal. El más abundante del sistema nervioso.',
    color: '#48A9A6',
    dato: 'En exceso es neurotóxico (excitotoxicidad) — puede dañar y matar neuronas.',
  },
];

// ─────────────────────────────────────────────
// Datos curiosos finales
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  valor: string;
  descripcion: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🧠', titulo: 'Neuronas en el cerebro', valor: formatNumber(86000000000, 0), descripcion: '86.000 millones de neuronas, tantas como estrellas en la Vía Láctea.' },
  { icono: '🔗', titulo: 'Sinapsis totales', valor: '~150 billones', descripcion: 'Cada neurona puede conectarse con hasta 10.000 más. La red más compleja conocida.' },
  { icono: '⚡', titulo: 'Energía del cerebro', valor: '20%', descripcion: 'El cerebro pesa el 2% del cuerpo pero consume el 20% de la energía total.' },
  { icono: '📏', titulo: 'Axón más largo', valor: '~1 metro', descripcion: 'El nervio ciático va desde la base de la médula espinal hasta el pie.' },
  { icono: '🏎️', titulo: 'Velocidad máxima', valor: '120 m/s', descripcion: 'Equivalente a 432 km/h. Las señales motoras viajan increíblemente rápido.' },
  { icono: '👶', titulo: 'Neuronas al nacer', valor: '~100.000 M', descripcion: 'Nacemos con casi todas las neuronas. Lo que crece son las conexiones entre ellas.' },
];

// ─────────────────────────────────────────────
// Sección 1: La Neurona
// ─────────────────────────────────────────────

function SeccionNeurona() {
  const [parteActiva, setParteActiva] = useState<string | null>(null);
  const parte = PARTES_NEURONA.find(p => p.id === parteActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La neurona es la <strong>célula especializada</strong> del sistema nervioso. Recibe, procesa y transmite señales eléctricas y químicas. Tu cerebro tiene {formatNumber(86000000000, 0)} de ellas.</p>
      </div>

      {/* Diagrama SVG de neurona */}
      <div className={styles.svgZona}>
        <svg viewBox="0 0 700 300" className={styles.neuronaSvg} role="img" aria-label="Diagrama de una neurona con sus partes principales: dendritas, soma, axón, vaina de mielina, nodos de Ranvier y terminal sináptico">
          {/* Dendritas */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'dendritas' ? null : 'dendritas')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'dendritas'}
            aria-label="Dendritas: reciben señales"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'dendritas' ? null : 'dendritas'); } }}
          >
            <line x1="30" y1="100" x2="90" y2="140" stroke="#27ae60" strokeWidth="4" strokeLinecap="round" />
            <line x1="20" y1="130" x2="90" y2="150" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="170" x2="90" y2="155" stroke="#27ae60" strokeWidth="4" strokeLinecap="round" />
            <line x1="40" y1="200" x2="90" y2="165" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="80" x2="85" y2="130" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="210" x2="95" y2="170" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" />
            {/* Pequeñas ramas */}
            <line x1="10" y1="90" x2="30" y2="100" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="115" x2="30" y2="120" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="175" x2="30" y2="170" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="210" x2="40" y2="200" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
            <text x="15" y="70" fill="#27ae60" fontSize="12" fontWeight="600">Dendritas</text>
          </g>

          {/* Soma */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'soma' ? null : 'soma')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'soma'}
            aria-label="Soma: cuerpo celular"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'soma' ? null : 'soma'); } }}
          >
            <ellipse cx="130" cy="150" rx="45" ry="40" fill="#8e44ad" opacity="0.85" />
            <ellipse cx="130" cy="150" rx="20" ry="18" fill="#6c3483" opacity="0.7" />
            <text x="130" y="145" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600">Soma</text>
            <text x="130" y="158" textAnchor="middle" fill="#fff" fontSize="8">(núcleo)</text>
          </g>

          {/* Cono axónico → Axón */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'axon' ? null : 'axon')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'axon'}
            aria-label="Axón: transmite la señal"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'axon' ? null : 'axon'); } }}
          >
            <line x1="175" y1="150" x2="220" y2="150" stroke="#2E86AB" strokeWidth="6" strokeLinecap="round" />
            <text x="197" y="140" textAnchor="middle" fill="#2E86AB" fontSize="10" fontWeight="600">Axón</text>
          </g>

          {/* Vaina de mielina (segmentos) */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'mielina' ? null : 'mielina')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'mielina'}
            aria-label="Vaina de mielina: aislante que acelera la señal"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'mielina' ? null : 'mielina'); } }}
          >
            <rect x="220" y="135" width="70" height="30" rx="15" fill="#f39c12" opacity="0.8" />
            <rect x="310" y="135" width="70" height="30" rx="15" fill="#f39c12" opacity="0.8" />
            <rect x="400" y="135" width="70" height="30" rx="15" fill="#f39c12" opacity="0.8" />
            <rect x="490" y="135" width="70" height="30" rx="15" fill="#f39c12" opacity="0.8" />
            {/* Línea del axón a través de mielina */}
            <line x1="220" y1="150" x2="560" y2="150" stroke="#2E86AB" strokeWidth="4" />
            <text x="390" y="125" textAnchor="middle" fill="#f39c12" fontSize="11" fontWeight="600">Vaina de mielina</text>
          </g>

          {/* Nodos de Ranvier */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'ranvier' ? null : 'ranvier')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'ranvier'}
            aria-label="Nodos de Ranvier: huecos entre mielina"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'ranvier' ? null : 'ranvier'); } }}
          >
            <circle cx="295" cy="150" r="6" fill="#e74c3c" />
            <circle cx="385" cy="150" r="6" fill="#e74c3c" />
            <circle cx="475" cy="150" r="6" fill="#e74c3c" />
            <text x="385" y="185" textAnchor="middle" fill="#e74c3c" fontSize="10" fontWeight="600">Nodos de Ranvier</text>
          </g>

          {/* Terminal sináptico */}
          <g
            className={styles.svgClickable}
            onClick={() => setParteActiva(parteActiva === 'terminal' ? null : 'terminal')}
            tabIndex={0}
            role="button"
            aria-pressed={parteActiva === 'terminal'}
            aria-label="Terminal sináptico: libera neurotransmisores"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setParteActiva(parteActiva === 'terminal' ? null : 'terminal'); } }}
          >
            <line x1="560" y1="150" x2="600" y2="120" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
            <line x1="560" y1="150" x2="610" y2="150" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
            <line x1="560" y1="150" x2="600" y2="180" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
            <circle cx="615" cy="112" r="12" fill="#48A9A6" opacity="0.85" />
            <circle cx="625" cy="150" r="12" fill="#48A9A6" opacity="0.85" />
            <circle cx="615" cy="188" r="12" fill="#48A9A6" opacity="0.85" />
            {/* Vesículas pequeñas */}
            <circle cx="612" cy="108" r="3" fill="#fff" opacity="0.6" />
            <circle cx="618" cy="116" r="3" fill="#fff" opacity="0.6" />
            <circle cx="622" cy="146" r="3" fill="#fff" opacity="0.6" />
            <circle cx="628" cy="154" r="3" fill="#fff" opacity="0.6" />
            <circle cx="612" cy="184" r="3" fill="#fff" opacity="0.6" />
            <circle cx="618" cy="192" r="3" fill="#fff" opacity="0.6" />
            <text x="620" y="220" textAnchor="middle" fill="#48A9A6" fontSize="10" fontWeight="600">Terminal</text>
            <text x="620" y="232" textAnchor="middle" fill="#48A9A6" fontSize="10" fontWeight="600">sináptico</text>
          </g>

          {/* Flecha de dirección */}
          <line x1="130" y1="250" x2="600" y2="250" stroke="#999" strokeWidth="1.5" strokeDasharray="6,4" />
          <polygon points="600,245 615,250 600,255" fill="#999" />
          <text x="365" y="270" textAnchor="middle" fill="#999" fontSize="10">Dirección del impulso nervioso →</text>
        </svg>
      </div>

      <p className={styles.svgHint}>Haz clic en cada parte de la neurona para ver su descripción</p>

      {/* Detalle de la parte seleccionada */}
      {parte && (
        <div className={styles.parteDetalle} style={{ borderLeftColor: parte.color }}>
          <div className={styles.parteHeader}>
            <span aria-hidden="true">{parte.icono}</span>
            <h3 className={styles.parteTitulo} style={{ color: parte.color }}>{parte.nombre}</h3>
          </div>
          <p className={styles.parteDesc}>{parte.descripcion}</p>
          <p className={styles.parteDato}><strong>Dato:</strong> {parte.dato}</p>
        </div>
      )}

      {/* Grid resumen de partes */}
      <h3 className={styles.subSeccionTitulo}>Todas las partes de un vistazo</h3>
      <div className={styles.partesGrid}>
        {PARTES_NEURONA.map(p => (
          <button
            key={p.id}
            type="button"
            className={`${styles.parteCard} ${parteActiva === p.id ? styles.parteCardActiva : ''}`}
            style={{ borderLeftColor: p.color }}
            onClick={() => setParteActiva(parteActiva === p.id ? null : p.id)}
            aria-pressed={parteActiva === p.id}
          >
            <span aria-hidden="true">{p.icono}</span>
            <strong>{p.nombre}</strong>
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La neurona es una célula <strong>especializada en comunicar</strong>. Las dendritas reciben, el soma procesa,
          el axón transmite y el terminal sináptico envía el mensaje a la siguiente neurona. Una cadena de relevos
          que se repite miles de millones de veces cada segundo en tu cerebro.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Central vs Periférico
// ─────────────────────────────────────────────

function NodoArbolVisual({ nodo, nivel = 0 }: { nodo: NodoArbol; nivel?: number }) {
  const [abierto, setAbierto] = useState(nivel < 2);

  return (
    <div className={styles.arbolNodo} style={{ marginLeft: nivel > 0 ? '1rem' : 0 }}>
      <button
        type="button"
        className={`${styles.arbolBtn} ${abierto && nodo.hijos ? styles.arbolBtnAbierto : ''}`}
        style={{ borderLeftColor: nodo.color }}
        onClick={() => setAbierto(!abierto)}
        aria-expanded={nodo.hijos ? abierto : undefined}
      >
        <div className={styles.arbolBtnHeader}>
          <span aria-hidden="true">{nodo.icono}</span>
          <strong>{nodo.nombre}</strong>
          {nodo.hijos && <span className={styles.arbolChevron} aria-hidden="true">{abierto ? '▼' : '▶'}</span>}
        </div>
        <p className={styles.arbolDesc}>{nodo.descripcion}</p>
        {nodo.ejemplo && <p className={styles.arbolEjemplo}><em>Ej: {nodo.ejemplo}</em></p>}
      </button>
      {abierto && nodo.hijos && (
        <div className={styles.arbolHijos}>
          {nodo.hijos.map((h, i) => (
            <NodoArbolVisual key={i} nodo={h} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SeccionCentralPeriferico() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema nervioso se divide en <strong>central</strong> (cerebro + médula) y <strong>periférico</strong> (nervios que van al resto del cuerpo). Explora el árbol:</p>
      </div>

      <NodoArbolVisual nodo={ARBOL_SN} />

      {/* Comparación simpático vs parasimpático */}
      <h3 className={styles.subSeccionTitulo}>Simpático vs Parasimpático — El equilibrio</h3>
      <div className={styles.comparacionGrid}>
        <div className={styles.comparacionCard} style={{ borderTopColor: '#e74c3c' }}>
          <h4 className={styles.comparacionTitulo}>
            <span aria-hidden="true">🔥</span> Simpático
          </h4>
          <p className={styles.comparacionSubtitulo}>Lucha o huida</p>
          <ul className={styles.comparacionLista}>
            <li>Dilata las pupilas</li>
            <li>Acelera el corazón</li>
            <li>Dilata los bronquios</li>
            <li>Libera glucosa (energía)</li>
            <li>Inhibe la digestión</li>
            <li>Estimula sudoración</li>
          </ul>
        </div>
        <div className={styles.comparacionCard} style={{ borderTopColor: '#3498db' }}>
          <h4 className={styles.comparacionTitulo}>
            <span aria-hidden="true">😌</span> Parasimpático
          </h4>
          <p className={styles.comparacionSubtitulo}>Descanso y digestión</p>
          <ul className={styles.comparacionLista}>
            <li>Contrae las pupilas</li>
            <li>Ralentiza el corazón</li>
            <li>Contrae los bronquios</li>
            <li>Almacena glucosa</li>
            <li>Activa la digestión</li>
            <li>Estimula salivación</li>
          </ul>
        </div>
      </div>

      {/* Arco reflejo */}
      <h3 className={styles.subSeccionTitulo}>El arco reflejo — Reacción sin pensar</h3>
      <div className={styles.arcoReflejo}>
        <p className={styles.arcoReflejoDesc}>
          Cuando tocas algo caliente, la señal <strong>no llega al cerebro</strong>: va directa a la médula espinal,
          que ordena retirar la mano. Solo después tu cerebro registra el dolor. Esto tarda ~50 ms.
        </p>
        <div className={styles.arcoReflejoPasos}>
          {[
            { icono: '🔥', texto: 'Estímulo (calor)' },
            { icono: '📡', texto: 'Neurona sensorial' },
            { icono: '🦴', texto: 'Médula espinal' },
            { icono: '💪', texto: 'Neurona motora' },
            { icono: '🤚', texto: 'Retirar la mano' },
          ].map((p, i) => (
            <div key={i} className={styles.arcoPaso}>
              <span className={styles.arcoPasoIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.arcoPasoTexto}>{p.texto}</span>
              {i < 4 && <span className={styles.arcoFlecha} aria-hidden="true">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Tu sistema nervioso funciona como un <strong>gobierno</strong>: el SNC es el "parlamento" que toma decisiones complejas,
          y el SNP son los "funcionarios" que ejecutan las órdenes y recogen información. El sistema autónomo
          gestiona lo que no necesita tu atención consciente.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Sinapsis y Señal
// ─────────────────────────────────────────────

function SeccionSinapsis() {
  const [faseActiva, setFaseActiva] = useState<number>(0);
  const fase = FASES_SENAL[faseActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La señal eléctrica (potencial de acción) viaja por el axón. Al llegar al final, se convierte en señal <strong>química</strong> en la sinapsis para pasar a la siguiente neurona.</p>
      </div>

      {/* Potencial de acción */}
      <h3 className={styles.subSeccionTitulo}>Potencial de acción — paso a paso</h3>
      <div className={styles.fasesNav}>
        {FASES_SENAL.map((f, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.faseBtn} ${faseActiva === i ? styles.faseBtnActiva : ''}`}
            style={{
              borderColor: faseActiva === i ? f.color : undefined,
              background: faseActiva === i ? f.color : undefined,
              color: faseActiva === i ? '#fff' : undefined,
            }}
            onClick={() => setFaseActiva(i)}
            aria-pressed={faseActiva === i}
            aria-label={`Fase ${i + 1}: ${f.nombre}`}
          >
            <span aria-hidden="true">{f.icono}</span>
            <span className={styles.faseBtnTexto}>{f.nombre}</span>
          </button>
        ))}
      </div>

      <div className={styles.faseDetalle} style={{ borderLeftColor: fase.color }}>
        <div className={styles.faseHeader}>
          <h4 className={styles.faseTitulo} style={{ color: fase.color }}>
            <span aria-hidden="true">{fase.icono}</span> {fase.nombre}
          </h4>
          <span className={styles.faseVoltaje} style={{ background: fase.color }}>{fase.voltaje}</span>
        </div>
        <p className={styles.faseDesc}>{fase.descripcion}</p>
      </div>

      {/* Gráfico simplificado del potencial */}
      <div className={styles.graficoPA}>
        <svg viewBox="0 0 400 200" className={styles.graficoPASvg} role="img" aria-label="Gráfico del potencial de acción: reposo a -70mV, despolarización hasta +40mV, repolarización de vuelta a -70mV">
          {/* Ejes */}
          <line x1="50" y1="10" x2="50" y2="180" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="1.5" />
          {/* Labels eje Y */}
          <text x="45" y="30" textAnchor="end" fill="currentColor" fontSize="9">+40 mV</text>
          <text x="45" y="100" textAnchor="end" fill="currentColor" fontSize="9">-55 mV</text>
          <text x="45" y="150" textAnchor="end" fill="currentColor" fontSize="9">-70 mV</text>
          {/* Línea umbral */}
          <line x1="50" y1="100" x2="380" y2="100" stroke="#f39c12" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          <text x="385" y="103" fill="#f39c12" fontSize="8">umbral</text>
          {/* Línea reposo */}
          <line x1="50" y1="150" x2="380" y2="150" stroke="#3498db" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
          {/* Curva del potencial */}
          <polyline
            points="50,150 120,150 150,100 170,25 210,150 240,165 300,150 380,150"
            fill="none"
            stroke="#2E86AB"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Etiquetas */}
          <text x="85" y="170" textAnchor="middle" fill="currentColor" fontSize="8">Reposo</text>
          <text x="160" y="15" textAnchor="middle" fill="#e74c3c" fontSize="8" fontWeight="600">Despol.</text>
          <text x="220" y="170" textAnchor="middle" fill="#27ae60" fontSize="8">Repol.</text>
          <text x="270" y="175" textAnchor="middle" fill="#95a5a6" fontSize="7">Refract.</text>
        </svg>
      </div>

      {/* Sinapsis */}
      <h3 className={styles.subSeccionTitulo}>La sinapsis — de eléctrica a química</h3>
      <div className={styles.sinapsisExplicacion}>
        <div className={styles.sinapsisPasos}>
          {[
            { num: '1', texto: 'El impulso llega al terminal sináptico', icono: '⚡' },
            { num: '2', texto: 'Las vesículas liberan neurotransmisores', icono: '💊' },
            { num: '3', texto: 'Cruzan la hendidura sináptica (~20 nm)', icono: '🌊' },
            { num: '4', texto: 'Se unen a receptores en la dendrita siguiente', icono: '🔑' },
            { num: '5', texto: 'Se genera un nuevo impulso (o se inhibe)', icono: '⚡' },
          ].map((p, i) => (
            <div key={i} className={styles.sinapsisPaso}>
              <span className={styles.sinapsisPasoNum} aria-hidden="true">{p.num}</span>
              <span className={styles.sinapsisPasoIcono} aria-hidden="true">{p.icono}</span>
              <span className={styles.sinapsisPasoTexto}>{p.texto}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Datos de velocidad y sinapsis */}
      <h3 className={styles.subSeccionTitulo}>Velocidad y tipos de sinapsis</h3>
      <div className={styles.datosGrid}>
        {DATOS_SINAPSIS.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.datoTitulo}>{d.titulo}</h4>
            <p className={styles.datoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El potencial de acción es <strong>todo o nada</strong>: si el estímulo supera el umbral, la neurona dispara al 100%.
          La intensidad del estímulo no cambia la fuerza del disparo, sino la <strong>frecuencia</strong>: más intenso = más
          disparos por segundo. Es como un código binario biológico.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Neurotransmisores y Datos
// ─────────────────────────────────────────────

function SeccionNeurotransmisores() {
  const [ntActivo, setNtActivo] = useState<string | null>(null);
  const ntSeleccionado = NEUROTRANSMISORES.find(n => n.nombre === ntActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los neurotransmisores son <strong>mensajeros químicos</strong> que cruzan la sinapsis. Cada uno tiene una función específica. Aquí están los 6 principales:</p>
      </div>

      {/* Grid de neurotransmisores */}
      <div className={styles.ntGrid}>
        {NEUROTRANSMISORES.map(nt => (
          <div
            key={nt.nombre}
            className={`${styles.ntCard} ${ntActivo === nt.nombre ? styles.ntCardActiva : ''}`}
            style={{ borderLeftColor: nt.color }}
            onClick={() => setNtActivo(ntActivo === nt.nombre ? null : nt.nombre)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNtActivo(ntActivo === nt.nombre ? null : nt.nombre); } }}
            tabIndex={0}
            role="button"
            aria-expanded={ntActivo === nt.nombre}
            aria-label={`Ver detalles de ${nt.nombre}`}
          >
            <div className={styles.ntHeader}>
              <span className={styles.ntIcono} aria-hidden="true">{nt.icono}</span>
              <div>
                <h4 className={styles.ntNombre}>{nt.nombre}</h4>
                <span className={styles.ntFuncion}>{nt.funcion}</span>
              </div>
            </div>
            {ntActivo === nt.nombre && (
              <div className={styles.ntDetalle}>
                <p className={styles.ntDesc}>{nt.descripcion}</p>
                <p className={styles.ntDato}><strong>Dato:</strong> {nt.dato}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Excitatorio vs inhibitorio */}
      <h3 className={styles.subSeccionTitulo}>Excitatorios vs Inhibitorios</h3>
      <div className={styles.comparacionGrid}>
        <div className={styles.comparacionCard} style={{ borderTopColor: '#e74c3c' }}>
          <h4 className={styles.comparacionTitulo}>
            <span aria-hidden="true">🔴</span> Excitatorios
          </h4>
          <p className={styles.comparacionSubtitulo}>Activan la neurona siguiente</p>
          <ul className={styles.comparacionLista}>
            <li><strong>Glutamato</strong> — el más abundante</li>
            <li>Noradrenalina</li>
            <li>Acetilcolina (en músculo)</li>
            <li>Dopamina (según receptor)</li>
          </ul>
        </div>
        <div className={styles.comparacionCard} style={{ borderTopColor: '#3498db' }}>
          <h4 className={styles.comparacionTitulo}>
            <span aria-hidden="true">🔵</span> Inhibitorios
          </h4>
          <p className={styles.comparacionSubtitulo}>Frenan la neurona siguiente</p>
          <ul className={styles.comparacionLista}>
            <li><strong>GABA</strong> — el más abundante</li>
            <li>Serotonina (en algunos circuitos)</li>
            <li>Glicina (médula espinal)</li>
            <li>Dopamina (según receptor)</li>
          </ul>
        </div>
      </div>

      {/* Datos curiosos */}
      <h3 className={styles.subSeccionTitulo}>El cerebro en números</h3>
      <div className={styles.datosGrid}>
        {DATOS_CURIOSOS.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.datoTitulo}>{d.titulo}</h4>
            <p className={styles.datoValor}>{d.valor}</p>
            <p className={styles.datoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Error común */}
      <h3 className={styles.subSeccionTitulo}>Error común</h3>
      <div className={styles.errorComun}>
        <div className={styles.errorIncorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">❌</span> Mito</span>
          <p>&ldquo;Solo usamos el 10% del cerebro&rdquo;</p>
        </div>
        <div className={styles.errorCorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">✅</span> Realidad</span>
          <p>Usamos <strong>todo el cerebro</strong>, pero no todo a la vez. Diferentes regiones se activan según la tarea. Las neuroimágenes muestran actividad en todo el cerebro incluso durante el sueño.</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Tu cerebro es el objeto más complejo conocido en el universo: <strong>{formatNumber(86000000000, 0)} neuronas</strong> conectadas
          por ~150 billones de sinapsis, comunicándose con docenas de neurotransmisores diferentes. Y todo ello
          consume solo <strong>20 vatios</strong> — menos que una bombilla.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaNerviosoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('neurona');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'neurona': return <SeccionNeurona />;
      case 'central-periferico': return <SeccionCentralPeriferico />;
      case 'sinapsis': return <SeccionSinapsis />;
      case 'neurotransmisores': return <SeccionNeurotransmisores />;
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>El Sistema Nervioso</h1>
        <p className={styles.subtitle}>Neuronas, sinapsis y neurotransmisores — tu red de comunicación interna</p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="high" collapsible={false} />

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
          <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
          {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
        </h2>
        <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
      </div>

      {renderSeccion()}

      <EducationalSection
        title="Más sobre el sistema nervioso"
        subtitle="Preguntas frecuentes y conceptos clave"
        defaultOpen={false}
      >
        {/* 1. Tabla Comparativa — SNC vs SNP */}
        <section className={styles.guideSection}>
          <h2>SNC vs SNP — Comparativa</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Sistema Nervioso Central</th>
                  <th>Sistema Nervioso Periférico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Componentes</strong></td>
                  <td>Encéfalo + Médula espinal</td>
                  <td>Nervios, ganglios, receptores</td>
                </tr>
                <tr>
                  <td><strong>Protección</strong></td>
                  <td>Cráneo, vértebras, meninges, LCR</td>
                  <td>Solo envolturas de tejido conjuntivo</td>
                </tr>
                <tr>
                  <td><strong>Función</strong></td>
                  <td>Integra y procesa información</td>
                  <td>Transmite señales hacia/desde el SNC</td>
                </tr>
                <tr>
                  <td><strong>Regeneración</strong></td>
                  <td>Muy limitada</td>
                  <td>Mayor capacidad de regeneración</td>
                </tr>
                <tr>
                  <td><strong>Control</strong></td>
                  <td>Voluntario e inconsciente</td>
                  <td>Somático (voluntario) + Autónomo (involuntario)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso — Neurociencia en el día a día */}
        <section className={styles.guideSection}>
          <h2>Neurociencia en el día a día</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
                <h3>Aprendizaje y Memoria</h3>
              </div>
              <p className={styles.escenarioTip}>
                Cuando memorizas algo, las sinapsis se refuerzan (LTP). La repetición espaciada
                aprovecha este principio biológico para consolidar el conocimiento de forma más eficaz.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">😴</span>
                <h3>Sueño y Rendimiento</h3>
              </div>
              <p className={styles.escenarioTip}>
                Durante el sueño profundo, el cerebro consolida memorias y elimina desechos metabólicos
                (sistema glinfático). Dormir mal debilita las sinapsis y reduce la capacidad de aprendizaje.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏃</span>
                <h3>Ejercicio y Neuroplasticidad</h3>
              </div>
              <p className={styles.escenarioTip}>
                El ejercicio aeróbico aumenta el BDNF (factor de crecimiento nervioso), favorece la
                neurogénesis en el hipocampo y mejora la concentración y la memoria a largo plazo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">😰</span>
                <h3>Estrés y Sistema Autónomo</h3>
              </div>
              <p className={styles.escenarioTip}>
                El estrés activa el simpático (&quot;lucha o huida&quot;): taquicardia, cortisol, inhibición
                digestiva. La respiración profunda activa el nervio vago (parasimpático) y frena la respuesta.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ — 5 preguntas frecuentes */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Cuántas neuronas tiene el cerebro humano?</h4>
              <p>
                Aproximadamente 86.000 millones (Azevedo et al., 2009). Hay un número similar de
                neuronas y células gliales — la idea de que hay 10 veces más gliales es un mito
                que fue corregido por estudios de recuento celular más rigurosos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿A qué velocidad viaja un impulso nervioso?</h4>
              <p>
                Depende de la mielina: las fibras mielinizadas A-alfa alcanzan 70-120 m/s, mientras
                que las fibras C sin mielina (responsables del dolor lento) solo llegan a 0,5-2 m/s.
                La mielina actúa como aislante y permite la conducción saltatoria, mucho más rápida.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Por qué la cocaína produce euforia?</h4>
              <p>
                Bloquea el transportador de recaptación de dopamina (DAT), provocando acumulación
                de dopamina en la hendidura sináptica. La euforia es la consecuencia del exceso de
                dopamina en el circuito de recompensa del núcleo accumbens.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Qué ocurre en la esclerosis múltiple?</h4>
              <p>
                El sistema inmune ataca la mielina (desmielinización). Sin aislamiento, los impulsos
                se ralentizan o se pierden, causando debilidad, problemas de coordinación y fatiga.
                Es una enfermedad autoinmune crónica con fases de brote y remisión.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4><span aria-hidden="true">❓</span> ¿Se pueden crear nuevas neuronas siendo adulto?</h4>
              <p>
                Sí. Hay neurogénesis adulta especialmente en el hipocampo (memoria) y el bulbo
                olfatorio. El ejercicio aeróbico y el aprendizaje la favorecen, mientras que el
                estrés crónico y el alcohol en exceso la inhiben.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía Paso a Paso — Cómo mejorar tu salud neurológica */}
        <section className={styles.guideSection}>
          <h2>Cómo mejorar tu salud neurológica</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Duerme 7-9 horas</h4>
                <p>El sueño consolida sinapsis y elimina beta-amiloide mediante el sistema glinfático. La privación crónica acelera el deterioro cognitivo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Practica ejercicio aeróbico 150 min/semana</h4>
                <p>Aumenta el BDNF y favorece la neurogénesis hipocampal. Con 20-30 min de ejercicio moderado ya se producen efectos mensurables en la concentración.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Aprende algo nuevo cada semana</h4>
                <p>Cada habilidad nueva crea sinapsis y densifica la reserva cognitiva. La variedad (idiomas, música, ajedrez) activa circuitos distintos y potencia la plasticidad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Gestiona el estrés crónico</h4>
                <p>El cortisol en exceso daña neuronas hipocampales y reduce la neurogénesis. Técnicas como meditación, respiración diafragmática y tiempo en naturaleza lo reducen.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Nutre tu cerebro</h4>
                <p>Omega-3 (DHA), vitamina B12 y colina son esenciales para la mielina y los neurotransmisores. El cerebro es el órgano con mayor consumo de glucosa: los picos y caídas de azúcar afectan la concentración.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Tips */}
        <section className={styles.guideSection}>
          <h2>Mejores prácticas</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <h4>Aprende antes de dormir</h4>
              <p>La consolidación de memoria ocurre principalmente durante el sueño REM. Repasar antes de acostarte potencia la retención.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏃</span>
              <h4>Ejercítate antes de estudiar</h4>
              <p>20 min de ejercicio aeróbico previo aumenta el BDNF y mejora la concentración durante las siguientes 1-2 horas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">😮‍💨</span>
              <h4>Respira profundo ante el estrés</h4>
              <p>La respiración diafragmática lenta activa el nervio vago y el sistema parasimpático, frenando la respuesta de alerta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Practica con intervalos espaciados</h4>
              <p>La repetición distribuida refuerza las sinapsis más que la sesión intensiva. El olvido controlado es parte del proceso de consolidación.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes sobre el Sistema Nervioso</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong><span aria-hidden="true">❌</span> &quot;Solo usamos el 10% del cerebro&quot;:</strong> Mito sin base científica. Todas las regiones cerebrales tienen funciones conocidas y las neuroimágenes muestran actividad distribuida en todo el cerebro.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Las neuronas no se regeneran nunca&quot;:</strong> Hay neurogénesis adulta en el hipocampo y el bulbo olfatorio. No es tan extensa como en otros tejidos, pero existe y puede estimularse.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;El alcohol mata neuronas permanentemente&quot;:</strong> El alcohol interfiere con la sinapsis y puede causar déficits de tiamina (síndrome de Wernicke), pero no destruye neuronas directamente en consumo moderado ocasional.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Más dopamina = más felicidad&quot;:</strong> Un exceso de dopamina puede causar psicosis o comportamientos compulsivos. El equilibrio, no el exceso, es la clave del bienestar neurológico.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-sistema-nervioso')} />
      <ShareCard appName="visualizador-sistema-nervioso" />
      <Footer appName="visualizador-sistema-nervioso" />
    </div>
  );
}
