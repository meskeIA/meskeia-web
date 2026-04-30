'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Embriogenesis.module.css';
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

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'fecundacion' | 'segmentacion' | 'gastrulacion' | 'diferenciacion';

type CapaId = 'ectodermo' | 'mesodermo' | 'endodermo';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'fecundacion', label: 'Fecundación', emoji: '🥚' },
  { id: 'segmentacion', label: 'Segmentación', emoji: '🔬' },
  { id: 'gastrulacion', label: 'Gastrulación', emoji: '🫧' },
  { id: 'diferenciacion', label: 'Diferenciación', emoji: '🧬' },
];

interface PasoFecundacion {
  paso: number;
  titulo: string;
  descripcion: string;
}

const PASOS_FECUNDACION: PasoFecundacion[] = [
  {
    paso: 1,
    titulo: 'Aproximación del espermatozoide',
    descripcion:
      'De los 200-500 millones de espermatozoides eyaculados, miles llegan al óvulo. El espermatozoide nada ~5 mm/min durante 30-60 minutos.',
  },
  {
    paso: 2,
    titulo: 'Reacción acrosómica',
    descripcion:
      'Al contactar con la corona radiada, el acrosoma libera enzimas (acrosina, hialuronidasas) que disuelven la zona pelúcida. Solo espermatozoides capacitados pueden hacerlo.',
  },
  {
    paso: 3,
    titulo: 'Fusión de membranas',
    descripcion:
      'La membrana del espermatozoide se fusiona con la del óvulo. El núcleo espermático (23 cromosomas) entra al citoplasma ovocitario.',
  },
  {
    paso: 4,
    titulo: 'Reacción cortical',
    descripcion:
      'Los gránulos corticales del óvulo se liberan, endureciendo la zona pelúcida y bloqueando la entrada de más espermatozoides (polispermia).',
  },
  {
    paso: 5,
    titulo: 'Formación del cigoto 2n',
    descripcion:
      'Los dos pronúcleos (23+23) se fusionan formando el cigoto con 46 cromosomas. El zigoto es la primera célula del nuevo organismo.',
  },
];

interface EstadioSegmentacion {
  dia: number;
  nombre: string;
  celulas: number;
  descripcion: string;
  radio: number;
}

const ESTADIOS: EstadioSegmentacion[] = [
  { dia: 1, nombre: 'Cigoto', celulas: 1, descripcion: 'Una sola célula 2n con 46 cromosomas. Todavía no ha comenzado a dividirse.', radio: 60 },
  { dia: 2, nombre: '2 Blastómeros', celulas: 2, descripcion: 'Primera división mitótica. Las células se llaman blastómeros y son totipotentes.', radio: 45 },
  { dia: 3, nombre: '4-8 Células', celulas: 4, descripcion: 'Compactación inicial. Las células se aplanan y aumentan sus contactos intercelulares.', radio: 32 },
  { dia: 4, nombre: 'Mórula', celulas: 16, descripcion: '16-32 células. Aspecto de mora. Comienza la diferenciación interna/externa.', radio: 20 },
  { dia: 5, nombre: 'Blastocisto', celulas: 64, descripcion: 'Cavidad blastocele llena de líquido. Masa celular interna (MCI) + trofoblasto exterior.', radio: 14 },
  { dia: 7, nombre: 'Implantación', celulas: 128, descripcion: 'Pierde la zona pelúcida y se adhiere al endometrio uterino. El trofoblasto invade la mucosa.', radio: 10 },
  { dia: 14, nombre: 'Disco bilaminar', celulas: 256, descripcion: 'Epiblasto (dorsal) + hipoblasto (ventral). Listo para la gastrulación.', radio: 8 },
];

interface CapaGerminal {
  id: CapaId;
  nombre: string;
  color: string;
  organos: string[];
  y: number;
  altura: number;
}

const CAPAS: CapaGerminal[] = [
  {
    id: 'ectodermo',
    nombre: 'Ectodermo',
    color: '#2E86AB',
    organos: [
      'Epidermis y anejos (pelo, uñas)',
      'Sistema nervioso central y periférico',
      'Órganos sensoriales (retina, oído interno)',
      'Esmalte dental',
      'Adenohipófisis',
      'Glándulas sudoríparas y mamarias',
    ],
    y: 20,
    altura: 50,
  },
  {
    id: 'mesodermo',
    nombre: 'Mesodermo',
    color: '#E74C3C',
    organos: [
      'Músculos esqueléticos, cardíacos y lisos',
      'Esqueleto y cartílago',
      'Corazón y sistema vascular',
      'Riñones y uréteres',
      'Gónadas (ovarios, testículos)',
      'Sangre y médula ósea',
    ],
    y: 80,
    altura: 50,
  },
  {
    id: 'endodermo',
    nombre: 'Endodermo',
    color: '#F39C12',
    organos: [
      'Revestimiento del tubo digestivo',
      'Hígado y páncreas',
      'Pulmones y árbol bronquial',
      'Tiroides y paratiroides',
      'Vejiga urinaria',
      'Amígdalas y timo',
    ],
    y: 140,
    altura: 50,
  },
];

interface EventoOrganogenesis {
  semana: number;
  eventos: string[];
}

const ORGANOGENESIS: EventoOrganogenesis[] = [
  { semana: 4, eventos: ['Corazón late por primera vez', 'Tubo neural se cierra', 'Somitas visibles (brotes de vértebras)', 'Intestino primitivo se forma'] },
  { semana: 5, eventos: ['Brotes de extremidades superiores', 'Vesículas ópticas (futuros ojos)', 'Placoda auditiva (futuros oídos)', 'Prosencéfalo, mesencéfalo, rombencéfalo diferenciados'] },
  { semana: 6, eventos: ['Brotes de extremidades inferiores', 'Pliegues faciales visibles', 'Hígado produce células sanguíneas', 'Diferencian dedos (membranosos)'] },
  { semana: 7, eventos: ['Cerebro crece rápidamente', 'Párpados comienzan a formarse', 'Intestino herniado al cordón (normal)', 'Riñón definitivo (metanefros) se forma'] },
  { semana: 8, eventos: ['Cara reconocible como humana', 'Todos los órganos principales presentes', 'Comienzo del período fetal', 'Longitud: ~3 cm, peso: ~1 g'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG: Fecundación
// ─────────────────────────────────────────────────────────────────────────────

function SvgFecundacion({ paso }: { paso: number }) {
  // Posición del espermatozoide según el paso
  const espermaX = paso === 1 ? 60 : paso === 2 ? 95 : paso >= 3 ? 130 : 60;
  const mostrarFusion = paso >= 3;
  const mostrarReaccionCortical = paso >= 4;
  const mostrarCigoto = paso >= 5;

  return (
    <svg viewBox="0 0 300 200" className={styles.svgFecundacion} aria-label="Animación de fecundación">
      {/* Zona pelúcida */}
      <circle
        cx="180"
        cy="100"
        r="75"
        fill="none"
        stroke={mostrarReaccionCortical ? '#48A9A6' : '#aaa'}
        strokeWidth={mostrarReaccionCortical ? 5 : 2}
        strokeDasharray={mostrarReaccionCortical ? 'none' : '6 3'}
        opacity="0.7"
      />
      {/* Óvulo */}
      {!mostrarCigoto && (
        <circle cx="180" cy="100" r="55" fill="#FFF3CD" stroke="#F39C12" strokeWidth="2" />
      )}
      {/* Núcleo del óvulo */}
      {!mostrarCigoto && (
        <circle cx="180" cy="100" r="18" fill="#F39C12" opacity="0.5" />
      )}
      {/* Cigoto resultante */}
      {mostrarCigoto && (
        <>
          <circle cx="180" cy="100" r="55" fill="#D4EDE1" stroke="#2E86AB" strokeWidth="3" />
          <circle cx="180" cy="100" r="22" fill="#2E86AB" opacity="0.4" />
          <text x="180" y="104" textAnchor="middle" fontSize="9" fill="#1A1A1A" fontWeight="bold">2n = 46</text>
        </>
      )}
      {/* Gránulos corticales liberados */}
      {mostrarReaccionCortical && !mostrarCigoto &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((angulo) => {
          const rad = (angulo * Math.PI) / 180;
          return (
            <circle
              key={angulo}
              cx={180 + Math.cos(rad) * 67}
              cy={100 + Math.sin(rad) * 67}
              r="4"
              fill="#48A9A6"
              opacity="0.8"
            />
          );
        })
      }
      {/* Espermatozoide */}
      {!mostrarCigoto && (
        <g transform={`translate(${espermaX}, 100)`}>
          {/* Cola */}
          <path
            d={`M -40 0 Q -25 ${paso <= 2 ? -10 : -8} -12 0`}
            stroke="#2E86AB"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Cabeza */}
          <ellipse
            cx="0"
            cy="0"
            rx="10"
            ry="7"
            fill={mostrarFusion ? 'transparent' : '#2E86AB'}
            stroke="#2E86AB"
            strokeWidth="1.5"
            opacity={mostrarFusion ? 0.3 : 1}
          />
          {/* Núcleo espermático */}
          {mostrarFusion && (
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#2E86AB" opacity="0.6" />
          )}
        </g>
      )}
      {/* Enzimas del acrosoma */}
      {paso === 2 && (
        <>
          {[-15, 0, 15].map((dy) => (
            <line
              key={dy}
              x1={espermaX + 10}
              y1={100 + dy}
              x2={espermaX + 22}
              y2={100 + dy * 0.5}
              stroke="#E74C3C"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          ))}
        </>
      )}
      {/* Etiquetas */}
      <text x="180" y="182" textAnchor="middle" fontSize="9" fill="#666">Óvulo / Cigoto</text>
      {!mostrarCigoto && (
        <text x={espermaX - 10} y="82" textAnchor="middle" fontSize="8" fill="#2E86AB">Espermato-</text>
      )}
      {!mostrarCigoto && (
        <text x={espermaX - 10} y="91" textAnchor="middle" fontSize="8" fill="#2E86AB">zoide</text>
      )}
      <text x="180" y="15" textAnchor="middle" fontSize="8" fill="#999">Zona pelúcida</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG: Segmentación
// ─────────────────────────────────────────────────────────────────────────────

function SvgSegmentacion({ estadioIdx }: { estadioIdx: number }) {
  const estadio = ESTADIOS[estadioIdx];
  const cx = 150;
  const cy = 100;
  const contenedorR = 72;

  // Posiciones predefinidas para las células según el estadio
  const posiciones: { x: number; y: number }[][] = [
    // Cigoto: 1 célula
    [{ x: 0, y: 0 }],
    // 2 blastómeros
    [{ x: -22, y: 0 }, { x: 22, y: 0 }],
    // 4 células
    [{ x: -22, y: -22 }, { x: 22, y: -22 }, { x: -22, y: 22 }, { x: 22, y: 22 }],
    // Mórula (16 células, mostramos puntos pequeños en patrón)
    ...[[]],
    // Blastocisto
    ...[[]],
    // Implantación (con endometrio)
    ...[[]],
    // Disco bilaminar
    ...[[]],
  ];

  const esMorula = estadioIdx === 3;
  const esBlastocisto = estadioIdx === 4;
  const esImplantacion = estadioIdx === 5;
  const esBilaminar = estadioIdx === 6;

  return (
    <svg viewBox="0 0 300 200" className={styles.svgSegmentacion} aria-label={`Estadio: ${estadio.nombre}`}>
      {/* Endometrio para implantación */}
      {esImplantacion && (
        <rect x="0" y="155" width="300" height="45" fill="#FFD6D6" rx="4" />
      )}
      {esImplantacion && (
        <text x="150" y="173" textAnchor="middle" fontSize="9" fill="#E74C3C">Endometrio</text>
      )}

      {/* Zona pelúcida (solo si no es implantación o disco bilaminar) */}
      {!esImplantacion && !esBilaminar && (
        <circle cx={cx} cy={cy} r={contenedorR} fill="none" stroke="#ccc" strokeWidth="3" strokeDasharray="5 3" />
      )}

      {/* Disco bilaminar */}
      {esBilaminar && (
        <>
          <ellipse cx={cx} cy={cy - 10} rx="65" ry="22" fill="#AED6F1" stroke="#2E86AB" strokeWidth="2" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="#1A1A1A">Epiblasto</text>
          <ellipse cx={cx} cy={cy + 20} rx="65" ry="22" fill="#FAD7A0" stroke="#F39C12" strokeWidth="2" />
          <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#1A1A1A">Hipoblasto</text>
        </>
      )}

      {/* Blastocisto */}
      {esBlastocisto && (
        <>
          <circle cx={cx} cy={cy} r="62" fill="#EBF5FB" stroke="#2E86AB" strokeWidth="2" />
          {/* Blastocele */}
          <circle cx={cx + 8} cy={cy} r="40" fill="#D6EAF8" stroke="#7FB3D3" strokeWidth="1" strokeDasharray="4 2" />
          <text x={cx + 8} y={cy + 3} textAnchor="middle" fontSize="8" fill="#2E86AB">Blastocele</text>
          {/* MCI */}
          <circle cx={cx - 32} cy={cy - 22} r="16" fill="#2E86AB" opacity="0.7" />
          <text x={cx - 32} y={cy - 18} textAnchor="middle" fontSize="7" fill="#fff">MCI</text>
          {/* Trofoblasto */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <circle
                key={a}
                cx={cx + Math.cos(rad) * 56}
                cy={cy + Math.sin(rad) * 56}
                r="5"
                fill="#48A9A6"
                opacity="0.8"
              />
            );
          })}
          <text x={cx} y={cy + 75} textAnchor="middle" fontSize="8" fill="#48A9A6">Trofoblasto</text>
        </>
      )}

      {/* Mórula */}
      {esMorula && (
        <>
          {[
            { x: 0, y: -38 }, { x: 28, y: -24 }, { x: 38, y: 5 }, { x: 24, y: 34 }, { x: -5, y: 40 },
            { x: -32, y: 24 }, { x: -40, y: -5 }, { x: -24, y: -32 },
            { x: 10, y: -15 }, { x: 20, y: 10 }, { x: 0, y: 20 }, { x: -18, y: 8 }, { x: -15, y: -15 },
          ].map((pos, i) => (
            <circle
              key={i}
              cx={cx + pos.x}
              cy={cy + pos.y}
              r={estadio.radio}
              fill="#FEF9E7"
              stroke="#F39C12"
              strokeWidth="1"
              opacity="0.9"
            />
          ))}
        </>
      )}

      {/* Implantación */}
      {esImplantacion && (
        <>
          <circle cx={cx} cy={cy - 15} r="55" fill="#EBF5FB" stroke="#2E86AB" strokeWidth="2" />
          <circle cx={cx - 22} cy={cy - 28} r="14" fill="#2E86AB" opacity="0.6" />
          <text x={cx - 22} y={cy - 24} textAnchor="middle" fontSize="7" fill="#fff">MCI</text>
          {[30, 90, 150, 210, 270, 330].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <rect
                key={a}
                x={cx + Math.cos(rad) * 50 - 5}
                y={cy - 15 + Math.sin(rad) * 50 - 4}
                width="10"
                height="8"
                fill="#E74C3C"
                opacity="0.6"
                rx="2"
              />
            );
          })}
          <text x={cx} y={cy + 46} textAnchor="middle" fontSize="8" fill="#E74C3C">Invasión trofoblasto</text>
        </>
      )}

      {/* Células normales (cigoto, 2 y 4 células) */}
      {estadioIdx <= 2 && posiciones[estadioIdx].map((pos, i) => (
        <circle
          key={i}
          cx={cx + pos.x}
          cy={cy + pos.y}
          r={estadio.radio}
          fill="#FEF9E7"
          stroke="#F39C12"
          strokeWidth="1.5"
        />
      ))}

      {/* Núcleo en cigoto */}
      {estadioIdx === 0 && (
        <circle cx={cx} cy={cy} r="20" fill="#F39C12" opacity="0.4" />
      )}

      {/* Etiqueta del estadio */}
      <text x={cx} y="188" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontWeight="bold">
        {estadio.nombre}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG: Gastrulación (sección transversal embrión trilaminar)
// ─────────────────────────────────────────────────────────────────────────────

function SvgGastrulacion({ capaActiva }: { capaActiva: CapaId | null }) {
  const opacity = (id: CapaId) => (capaActiva === null || capaActiva === id ? 1 : 0.25);

  return (
    <svg viewBox="0 0 300 180" className={styles.svgGastrulacion} aria-label="Sección transversal del embrión trilaminar">
      {/* Ectodermo */}
      <ellipse cx="150" cy="42" rx="100" ry="28" fill="#AED6F1" stroke="#2E86AB" strokeWidth="2.5" opacity={opacity('ectodermo')} />
      <text x="150" y="46" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontWeight="bold" opacity={opacity('ectodermo')}>Ectodermo</text>

      {/* Mesodermo */}
      <ellipse cx="150" cy="90" rx="100" ry="28" fill="#FADBD8" stroke="#E74C3C" strokeWidth="2.5" opacity={opacity('mesodermo')} />
      <text x="150" y="94" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontWeight="bold" opacity={opacity('mesodermo')}>Mesodermo</text>

      {/* Endodermo */}
      <ellipse cx="150" cy="138" rx="100" ry="28" fill="#FDEBD0" stroke="#F39C12" strokeWidth="2.5" opacity={opacity('endodermo')} />
      <text x="150" y="142" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontWeight="bold" opacity={opacity('endodermo')}>Endodermo</text>

      {/* Línea primitiva (flecha hacia abajo) */}
      <path d="M 258 42 L 258 138" stroke="#999" strokeWidth="1" strokeDasharray="4 2" />
      <text x="270" y="90" fontSize="8" fill="#999" textAnchor="middle" transform="rotate(90, 270, 90)">Gastrulación →</text>

      {/* Notocordio */}
      <ellipse cx="150" cy="90" rx="18" ry="8" fill="#48A9A6" opacity="0.8" />
      <text x="150" y="93" textAnchor="middle" fontSize="7" fill="#fff">Notocordio</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG: Morfogénesis (gradiente de SHH)
// ─────────────────────────────────────────────────────────────────────────────

function SvgMorfogeno() {
  return (
    <svg viewBox="0 0 300 160" className={styles.svgMorfogeno} aria-label="Gradiente del morfógeno Sonic Hedgehog">
      {/* Gradiente de concentración */}
      <defs>
        <linearGradient id="shhGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#48A9A6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#48A9A6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="20" y="40" width="260" height="60" fill="url(#shhGrad)" rx="8" />

      {/* Notocordio (fuente de SHH) */}
      <circle cx="30" cy="70" r="14" fill="#48A9A6" />
      <text x="30" y="73" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">SHH</text>
      <text x="30" y="102" textAnchor="middle" fontSize="7" fill="#48A9A6">Notocordio</text>

      {/* Tubo neural con células respondiendo */}
      {[80, 120, 160, 200, 240, 280].map((x, i) => {
        const conc = 1 - i / 6;
        return (
          <circle
            key={x}
            cx={x}
            cy="70"
            r="10"
            fill={conc > 0.5 ? '#2E86AB' : conc > 0.25 ? '#7FB3D3' : '#ddd'}
          />
        );
      })}
      <text x="180" y="125" textAnchor="middle" fontSize="9" fill="#1A1A1A">Tubo neural — respuesta al gradiente de SHH</text>
      <text x="30" y="145" textAnchor="start" fontSize="8" fill="#666">Alta [SHH] → ventral</text>
      <text x="280" y="145" textAnchor="end" fontSize="8" fill="#666">Baja [SHH] → dorsal</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualizadorEmbriogenesis() {
  const [tabActiva, setTabActiva] = useState<Tab>('fecundacion');
  const [pasoFecundacion, setPasoFecundacion] = useState(1);
  const [estadioIdx, setEstadioIdx] = useState(0);
  const [capaActiva, setCapaActiva] = useState<CapaId | null>(null);
  const [semanaOrganogenesis, setSemanaOrganogenesis] = useState(4);

  const estadioActual = ESTADIOS[estadioIdx];
  const pasoActual = PASOS_FECUNDACION[pasoFecundacion - 1];
  const eventosSemana = ORGANOGENESIS.find((o) => o.semana === semanaOrganogenesis);
  const capaInfo = CAPAS.find((c) => c.id === capaActiva);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Embriogénesis</h1>
        <p>Del cigoto al embrión trilaminar — visualiza el desarrollo embrionario humano</p>
      </header>

      <LegalNotice />

      {/* Pestañas */}
      <nav className={styles.tabBar} aria-label="Secciones del visualizador">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(t.id)}
            aria-pressed={tabActiva === t.id}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* ── Tab: Fecundación ── */}
      {tabActiva === 'fecundacion' && (
        <section className={styles.tabContent}>
          <div className={styles.svgBox}>
            <SvgFecundacion paso={pasoFecundacion} />
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="pasoSlider">
              Paso {pasoFecundacion} de {PASOS_FECUNDACION.length}:{' '}
              <span className={styles.sliderValue}>{pasoActual.titulo}</span>
            </label>
            <input
              id="pasoSlider"
              type="range"
              min={1}
              max={PASOS_FECUNDACION.length}
              value={pasoFecundacion}
              onChange={(e) => setPasoFecundacion(Number(e.target.value))}
              className={styles.slider}
              aria-label="Paso de la fecundación"
            />
          </div>

          <div className={styles.estadioInfo}>
            <h2>{pasoActual.titulo}</h2>
            <p>{pasoActual.descripcion}</p>
          </div>

          <div className={styles.datosGrid}>
            {[
              { label: 'Espermatozoides eyaculados', valor: '200–500 millones' },
              { label: 'Espermatozoides que llegan', valor: '~200' },
              { label: 'Fecundan el óvulo', valor: '1 solo' },
              { label: 'Velocidad del espermatozoide', valor: '~5 mm/min' },
              { label: 'Duración del recorrido', valor: '30–60 minutos' },
              { label: 'Vida útil del espermatozoide', valor: '3–5 días' },
            ].map((d) => (
              <div key={d.label} className={styles.datoCard}>
                <span className={styles.datoValor}>{d.valor}</span>
                <span className={styles.datoLabel}>{d.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tab: Segmentación ── */}
      {tabActiva === 'segmentacion' && (
        <section className={styles.tabContent}>
          <div className={styles.svgBox}>
            <SvgSegmentacion estadioIdx={estadioIdx} />
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="estadioSlider">
              Día {estadioActual.dia} — Estadio:{' '}
              <span className={styles.sliderValue}>{estadioActual.nombre}</span>
            </label>
            <input
              id="estadioSlider"
              type="range"
              min={0}
              max={ESTADIOS.length - 1}
              value={estadioIdx}
              onChange={(e) => setEstadioIdx(Number(e.target.value))}
              className={styles.slider}
              aria-label="Estadio de desarrollo"
            />
            <div className={styles.sliderTicks}>
              {ESTADIOS.map((e, i) => (
                <button
                  key={e.dia}
                  className={`${styles.tickBtn} ${i === estadioIdx ? styles.tickBtnActive : ''}`}
                  onClick={() => setEstadioIdx(i)}
                  aria-label={`Ir a día ${e.dia}: ${e.nombre}`}
                >
                  {e.dia}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.estadioInfo}>
            <h2>{estadioActual.nombre}</h2>
            <div className={styles.estadioMeta}>
              <span>Día <strong>{estadioActual.dia}</strong></span>
              <span>~<strong>{estadioActual.celulas}</strong> células</span>
            </div>
            <p>{estadioActual.descripcion}</p>
          </div>
        </section>
      )}

      {/* ── Tab: Gastrulación ── */}
      {tabActiva === 'gastrulacion' && (
        <section className={styles.tabContent}>
          <p className={styles.introText}>
            La gastrulación ocurre en la <strong>semana 3</strong>. Las células del epiblasto migran
            por la <em>línea primitiva</em> y se intercalan para formar las 3 capas germinales.
            Selecciona una capa para ver sus derivados:
          </p>

          <div className={styles.svgBox}>
            <SvgGastrulacion capaActiva={capaActiva} />
          </div>

          <div className={styles.capasGrid}>
            {CAPAS.map((capa) => (
              <button
                key={capa.id}
                className={`${styles.capaBtn} ${styles[`capaBtn${capa.nombre}`]} ${capaActiva === capa.id ? styles.capaBtnActive : ''}`}
                onClick={() => setCapaActiva(capaActiva === capa.id ? null : capa.id)}
                aria-pressed={capaActiva === capa.id}
                style={{
                  borderColor: capa.color,
                  backgroundColor: capaActiva === capa.id ? capa.color : undefined,
                  color: capaActiva === capa.id ? '#fff' : capa.color,
                }}
              >
                {capa.nombre}
              </button>
            ))}
          </div>

          {capaInfo && (
            <div className={styles.organosList} style={{ borderColor: capaInfo.color }}>
              <h3 style={{ color: capaInfo.color }}>Órganos derivados del {capaInfo.nombre}</h3>
              <ul>
                {capaInfo.organos.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {!capaActiva && (
            <p className={styles.seleccionaHint} aria-live="polite">
              Pulsa una capa germinal para ver sus derivados
            </p>
          )}
        </section>
      )}

      {/* ── Tab: Diferenciación ── */}
      {tabActiva === 'diferenciacion' && (
        <section className={styles.tabContent}>
          <div className={styles.morfogenBox}>
            <h2>Señalización por morfógenos</h2>
            <p>
              Las células «saben» qué ser según la concentración de proteínas señalizadoras
              (<em>morfógenos</em>) que detectan. El morfógeno <strong>Sonic Hedgehog (SHH)</strong>,
              secretado por el notocordio, forma un gradiente que especifica el eje dorso-ventral
              del tubo neural.
            </p>
            <SvgMorfogeno />
          </div>

          <div className={styles.induccionBox}>
            <h2>Inducción neural (semana 3–4)</h2>
            <div className={styles.induccionSteps}>
              {[
                { paso: '1', texto: 'El notocordio se forma en el eje central del mesodermo' },
                { paso: '2', texto: 'Notocordio señaliza al ectodermo suprayacente → placa neural' },
                { paso: '3', texto: 'Los bordes de la placa se elevan → pliegues neurales' },
                { paso: '4', texto: 'Los pliegues se fusionan → tubo neural cerrado' },
                { paso: '5', texto: 'Tubo neural → cerebro (anterior) + médula espinal (posterior)' },
              ].map((s) => (
                <div key={s.paso} className={styles.induccionStep}>
                  <span className={styles.stepNum}>{s.paso}</span>
                  <span>{s.texto}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.timelineOrganogenesis}>
            <h2>Organogénesis (semanas 4–8)</h2>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="semanaSlider">
                Semana <span className={styles.sliderValue}>{semanaOrganogenesis}</span> de embarazo
              </label>
              <input
                id="semanaSlider"
                type="range"
                min={4}
                max={8}
                value={semanaOrganogenesis}
                onChange={(e) => setSemanaOrganogenesis(Number(e.target.value))}
                className={styles.slider}
                aria-label="Semana de organogénesis"
              />
              <div className={styles.sliderTicks}>
                {[4, 5, 6, 7, 8].map((s) => (
                  <button
                    key={s}
                    className={`${styles.tickBtn} ${s === semanaOrganogenesis ? styles.tickBtnActive : ''}`}
                    onClick={() => setSemanaOrganogenesis(s)}
                    aria-label={`Semana ${s}`}
                  >
                    S{s}
                  </button>
                ))}
              </div>
            </div>

            {eventosSemana && (
              <div className={styles.eventosBox} role="region" aria-live="polite" aria-label={`Eventos semana ${semanaOrganogenesis}`}>
                <h3>Semana {semanaOrganogenesis}</h3>
                <ul>
                  {eventosSemana.eventos.map((ev) => (
                    <li key={ev}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.somitasBox}>
            <h3>Somitas: el reloj segmentario</h3>
            <p>
              Los somitas son bloques de mesodermo paraxial que se forman bilateralmente a los lados
              del tubo neural, uno por hora durante la cuarta semana. Cada somita dará lugar a
              vértebras, músculo esquelético y dermis de un segmento corporal. La cantidad de
              somitas sirve como «reloj biológico» para estimar la edad del embrión.
            </p>
          </div>
        </section>
      )}

      {/* Contenido educativo */}
      <EducationalSection
        title="Embriogénesis: 9 meses de instrucciones en el ADN"
        subtitle="De una célula a 37 billones: el programa de desarrollo más complejo conocido"
      >
        {/* 1. Tabla comparativa de capas germinales */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Capa germinal</th>
                <th>Color en el visualizador</th>
                <th>Órganos derivados</th>
                <th>Tejidos principales</th>
                <th>Patología si falla la formación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ectodermo</strong></td>
                <td><span style={{ color: '#2E86AB' }}>■</span> Azul</td>
                <td>Cerebro, médula espinal, piel, esmalte dental, retina</td>
                <td>Tejido nervioso, epidermis</td>
                <td>Anencefalia, espina bífida, defectos del tubo neural</td>
              </tr>
              <tr>
                <td><strong>Mesodermo</strong></td>
                <td><span style={{ color: '#E74C3C' }}>■</span> Rojo</td>
                <td>Corazón, músculos, esqueleto, riñones, gónadas, sangre</td>
                <td>Músculo, cartílago, hueso, tejido conectivo</td>
                <td>Cardiopatías congénitas, agenesia renal, displasias esqueléticas</td>
              </tr>
              <tr>
                <td><strong>Endodermo</strong></td>
                <td><span style={{ color: '#F39C12' }}>■</span> Naranja</td>
                <td>Intestino, hígado, páncreas, pulmones, tiroides, vejiga</td>
                <td>Epitelio glandular y de revestimiento</td>
                <td>Atresia esofágica, hipoplasia pulmonar, malformaciones digestivas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Casos de uso */}
        <div className={styles.escenariosGrid}>
          {[
            {
              icono: '🩺',
              perfil: 'Estudiante de medicina',
              uso: 'Preparar el examen de embriología: visualiza la gastrulación, las capas germinales y la organogénesis de forma interactiva antes de memorizar los derivados de cada capa.',
            },
            {
              icono: '🤰',
              perfil: 'Pareja esperando un bebé',
              uso: 'Entender qué está ocurriendo semana a semana en el primer trimestre: cuándo late el corazón por primera vez, cuándo se forman los ojos y cuándo el embrión pasa a llamarse feto.',
            },
            {
              icono: '📚',
              perfil: 'Estudiante de biología (Bachillerato)',
              uso: 'Comprender la diferencia entre cigoto, mórula, blástula y gástrula. Practicar el orden de los estadios del desarrollo embrionario temprano para el examen de Selectividad.',
            },
            {
              icono: '🔬',
              perfil: 'Curioso sobre el origen de los órganos',
              uso: 'Descubrir que el cerebro y la piel tienen el mismo origen embrionario (ectodermo), o que el corazón y los riñones comparten linaje mesodermal — conexiones asombrosas que revela la embriología.',
            },
          ].map((escenario) => (
            <div key={escenario.perfil} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{escenario.icono}</span>
              <h4>{escenario.perfil}</h4>
              <p>{escenario.uso}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <ul className={styles.faqList}>
          {[
            {
              pregunta: '¿Cuándo empieza a latir el corazón del embrión?',
              respuesta: 'El corazón comienza a latir en la semana 4 (días 22-23). En ese momento ya hay un tubo cardíaco primitivo que late a unas 65 pulsaciones por minuto. No es un corazón completo aún — las cámaras no se habrán formado hasta la semana 6.',
              tip: 'El latido cardíaco fetal es detectable por ecografía transvaginal a partir de la semana 5-6 de embarazo.',
            },
            {
              pregunta: '¿Qué es la gastrulación y por qué es tan importante?',
              respuesta: 'La gastrulación es el proceso que ocurre en la semana 3 por el que el disco embrionario bilaminar (epiblasto + hipoblasto) se convierte en trilaminar: ectodermo, mesodermo y endodermo. Es el momento fundacional porque define qué tipo de tejido será cada célula. Un embrión sin gastrulación no puede desarrollar órganos.',
              tip: 'El biólogo Lewis Wolpert dijo: "No es el nacimiento, el matrimonio o la muerte, sino la gastrulación el evento más importante de tu vida."',
            },
            {
              pregunta: '¿Cuándo se forman los órganos principales?',
              respuesta: 'El período de organogénesis ocurre entre las semanas 4 y 8. En solo un mes se forman todos los órganos principales: corazón latiendo (s.4), extremidades (s.5-6), cara reconocible (s.8). Por eso el primer trimestre es el período más vulnerable a teratógenos (alcohol, fármacos, infecciones).',
              tip: 'Al final de la semana 8, el embrión ya mide ~3 cm pero tiene todos los órganos principales esbozados.',
            },
            {
              pregunta: '¿Qué son los genes Hox y para qué sirven?',
              respuesta: 'Los genes Hox son un grupo de genes reguladores que actúan como "código postal" del cuerpo: indican a las células qué posición ocupan a lo largo del eje cabeza-cola. Se expresan en el mismo orden en el ADN que el orden en que especifican el cuerpo, de anterior a posterior. Son tan conservados que los insectos, peces y humanos comparten versiones casi idénticas.',
              tip: 'Una mutación en un gen Hox puede transformar una estructura en otra: por ejemplo, convertir antenas de mosca en patas (mutante antennapedia).',
            },
            {
              pregunta: '¿Qué diferencia hay entre embrión y feto?',
              respuesta: 'Embrión es el término para el desarrollo desde la fecundación hasta el final de la semana 8 (cuando todos los órganos principales están presentes). A partir de la semana 9 se habla de feto, un período de crecimiento y maduración de órganos ya formados que dura hasta el parto.',
              tip: 'El paso de embrión a feto coincide aproximadamente con el inicio del segundo trimestre de embarazo en el habla cotidiana, aunque técnicamente ocurre en la semana 9.',
            },
          ].map((item) => (
            <li key={item.pregunta} className={styles.faqItem}>
              <strong>{item.pregunta}</strong>
              <p>{item.respuesta}</p>
              <span className={styles.faqTip}>💡 {item.tip}</span>
            </li>
          ))}
        </ul>

        {/* 4. Guía paso a paso */}
        <ol className={styles.stepGuide}>
          {[
            {
              titulo: 'Empieza por la Fecundación',
              descripcion: 'Usa el slider de Fecundación para ver los 5 pasos: desde la aproximación del espermatozoide hasta la formación del cigoto 2n. Fíjate en la reacción cortical que bloquea la polispermia.',
            },
            {
              titulo: 'Sigue con la Segmentación',
              descripcion: 'Avanza día a día desde el cigoto (1 célula) al disco bilaminar (día 14). Observa cómo el blastocisto diferencia el trofoblasto (futuro tejido placentario) de la masa celular interna (futuro embrión).',
            },
            {
              titulo: 'Explora la Gastrulación',
              descripcion: 'Pulsa cada capa germinal y lee qué órganos deriva. Memoriza la regla: Ecto=nervioso+piel, Meso=músculo+hueso+corazón, Endo=vísceras. Este es el paso más importante para los exámenes.',
            },
            {
              titulo: 'Estudia la Diferenciación',
              descripcion: 'Observa el gradiente de SHH (Sonic Hedgehog) y cómo los morfógenos crean patrones. Repasa la inducción neural (tubo neural) y la organogénesis semana a semana (s.4 a s.8).',
            },
            {
              titulo: 'Relaciona con patología',
              descripcion: 'Para cada capa germinal, piensa qué defectos congénitos aparecen cuando algo falla: espina bífida (ectodermo), cardiopatías (mesodermo), atresia intestinal (endodermo). Esto conecta embriología con medicina clínica.',
            },
          ].map((paso, i) => (
            <li key={paso.titulo} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
              <div className={styles.stepContent}>
                <strong>{paso.titulo}</strong>
                <p>{paso.descripcion}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* 5. Mejores prácticas para estudiar embriología */}
        <div className={styles.tipsGrid}>
          {[
            { icono: '🗺️', tip: 'Dibuja el embrión', descripcion: 'Hacer esquemas a mano de las capas germinales y sus derivados fija mucho mejor que solo leer. El trazo manual activa la memoria espacial.' },
            { icono: '🔗', tip: 'Conecta con anatomía', descripcion: 'Cuando estudies un órgano en anatomía, pregúntate de qué capa viene. Esto crea redes de memoria más robustas y facilita el razonamiento clínico.' },
            { icono: '📅', tip: 'Estudia por semanas', descripcion: 'Organiza el repaso por semanas de desarrollo (1-2, 3, 4-8, 9-38). Cada semana tiene un "hito" principal que actúa como gancho mnemotécnico.' },
            { icono: '🧪', tip: 'Usa casos clínicos', descripcion: 'Los defectos congénitos son la aplicación clínica de la embriología. Estudiar atresia esofágica o cardiopatías congénitas da sentido a lo que de otro modo serían datos abstractos.' },
            { icono: '🔁', tip: 'Repaso espaciado', descripcion: 'La embriología tiene mucha terminología y secuencias. Un repaso a los 3 días, 7 días y 21 días después de estudiar maximiza la retención a largo plazo.' },
          ].map((item) => (
            <div key={item.tip} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{item.icono}</span>
              <strong>{item.tip}</strong>
              <p>{item.descripcion}</p>
            </div>
          ))}
        </div>

        {/* 6. Errores comunes (warningBoxEdu) */}
        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores conceptuales frecuentes en embriología</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>«El corazón late en la semana 4, por eso el embrión ya es viable»</strong> — Incorrecto. El latido primitivo no equivale a viabilidad fetal, que no se alcanza hasta la semana 22-24 aproximadamente.
            </li>
            <li>
              <strong>«La gastrulación forma 2 capas»</strong> — La gastrulación produce 3 capas (trilaminar). La fase previa con 2 capas (epiblasto + hipoblasto) se llama disco bilaminar y ocurre antes, en la semana 2.
            </li>
            <li>
              <strong>«El trofoblasto formará parte del bebé»</strong> — El trofoblasto origina la placenta y el corion, no tejidos del propio embrión. El embrión se desarrolla exclusivamente a partir de la masa celular interna (MCI).
            </li>
            <li>
              <strong>«Los genes Hox son solo de insectos»</strong> — Los genes Hox son ultra-conservados en la evolución. Los vertebrados tienen 4 grupos (HoxA, B, C, D) que controlan el patrón eje cabeza-cola del embrión humano.
            </li>
            <li>
              <strong>«Feto y embrión son sinónimos»</strong> — Embrión: semanas 1-8 (formación de órganos). Feto: semana 9-nacimiento (crecimiento y maduración). Son etapas del desarrollo con características biológicas distintas.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-embriogenesis')} />
      <ShareCard appName="visualizador-embriogenesis" />
      <Footer appName="visualizador-embriogenesis" />
    </div>
  );
}
