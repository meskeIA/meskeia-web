'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './Microbiologia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { generateJsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'morfologia' | 'crecimiento' | 'gram' | 'dominios';

interface Morfologia {
  id: string;
  nombre: string;
  descripcion: string;
  ejemplos: string[];
  forma: 'coco' | 'bacilo' | 'espirilo';
}

interface ParteBacteriana {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
}

interface GramEjemplo {
  nombre: string;
  enfermedad: string;
  emoji: string;
}

interface AntibioticoDato {
  nombre: string;
  gramPos: boolean;
  gramNeg: boolean;
  parcial: 'pos' | 'neg' | null;
  mecanismo: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MORFOLOGIAS: Morfologia[] = [
  {
    id: 'cocos',
    nombre: 'Cocos',
    descripcion: 'Forma esférica, se agrupan en racimos, cadenas o pares según la especie',
    ejemplos: ['Staphylococcus aureus', 'Streptococcus pyogenes', 'Neisseria gonorrhoeae'],
    forma: 'coco',
  },
  {
    id: 'bacilos',
    nombre: 'Bacilos',
    descripcion: 'Forma cilíndrica o bastón, tamaño muy variable, pueden ser flagelados',
    ejemplos: ['Escherichia coli', 'Salmonella enterica', 'Mycobacterium tuberculosis'],
    forma: 'bacilo',
  },
  {
    id: 'espirilos',
    nombre: 'Espirilos / Espiroquetas',
    descripcion: 'Forma helicoidal o en sacacorchos, muy móviles',
    ejemplos: ['Treponema pallidum', 'Helicobacter pylori', 'Borrelia burgdorferi'],
    forma: 'espirilo',
  },
];

const PARTES_BACTERIANAS: ParteBacteriana[] = [
  { id: 'capsula', nombre: 'Cápsula', descripcion: 'Cubierta polisacárida externa. Protege de la fagocitosis y de la desecación. Presente en patógenos como S. pneumoniae.', color: '#E3F2FD' },
  { id: 'pared', nombre: 'Pared celular', descripcion: 'Capa rígida de peptidoglicano. Mantiene la forma y evita la lisis osmótica. Diana de las penicilinas.', color: '#FFF9C4' },
  { id: 'membrana', nombre: 'Membrana citoplasmática', descripcion: 'Bicapa lipídica que regula el paso de sustancias. Contiene las enzimas respiratorias en bacterias aerobias.', color: '#FCE4EC' },
  { id: 'nucleoide', nombre: 'Nucleoide (ADN circular)', descripcion: 'Única molécula de ADN circular doble cadena. No tiene envoltura nuclear. Puede contener 3-8 millones de pares de bases.', color: '#E8F5E9' },
  { id: 'plasmidos', nombre: 'Plásmidos', descripcion: 'Moléculas de ADN circular extracromosómico pequeñas. Portan genes de resistencia a antibióticos. Se transfieren por conjugación.', color: '#F3E5F5' },
  { id: 'ribosomas', nombre: 'Ribosomas 70S', descripcion: 'Complejos ARN-proteína para síntesis proteica. Las subunidades 50S y 30S son dianas de antibióticos (eritromicina, tetraciclina).', color: '#FBE9E7' },
  { id: 'flagelo', nombre: 'Flagelo', descripcion: 'Apéndice proteico helicoidal para locomoción. Puede ser peritrico (varios) o polar (uno). Responsable del quimiotactismo.', color: '#E1F5FE' },
  { id: 'pili', nombre: 'Pili / Fimbrias', descripcion: 'Filamentos proteicos de adhesión a superficies y células huésped. El pilus sexual (F) permite la transferencia de plásmidos en la conjugación.', color: '#E8EAF6' },
];

const GRAM_POS: GramEjemplo[] = [
  { nombre: 'Staphylococcus aureus', enfermedad: 'Impétigo, sepsis, MRSA', emoji: '🟣' },
  { nombre: 'Streptococcus pneumoniae', enfermedad: 'Neumonía, meningitis', emoji: '🟣' },
  { nombre: 'Streptococcus pyogenes', enfermedad: 'Faringitis, escarlatina', emoji: '🟣' },
  { nombre: 'Clostridium tetani', enfermedad: 'Tétanos (esporulante)', emoji: '🟣' },
];

const GRAM_NEG: GramEjemplo[] = [
  { nombre: 'Escherichia coli', enfermedad: 'Infecciones urinarias, gastroenteritis', emoji: '🔴' },
  { nombre: 'Salmonella enterica', enfermedad: 'Salmonelosis, fiebre tifoidea', emoji: '🔴' },
  { nombre: 'Helicobacter pylori', enfermedad: 'Úlcera péptica, gastritis', emoji: '🔴' },
  { nombre: 'Neisseria gonorrhoeae', enfermedad: 'Gonorrea (ITS)', emoji: '🔴' },
];

const ANTIBIOTICOS: AntibioticoDato[] = [
  { nombre: 'Penicilinas / β-lactámicos', gramPos: true, gramNeg: false, parcial: 'neg', mecanismo: 'Inhibe síntesis de pared (transpeptidasa)' },
  { nombre: 'Aminoglucósidos', gramPos: false, gramNeg: true, parcial: 'pos', mecanismo: 'Inhibe ribosoma 30S → error lectura ARNm' },
  { nombre: 'Polimixinas', gramPos: false, gramNeg: true, parcial: null, mecanismo: 'Desestabiliza membrana externa Gram−' },
  { nombre: 'Vancomicina', gramPos: true, gramNeg: false, parcial: null, mecanismo: 'Inhibe síntesis pared (D-Ala-D-Ala), solo penetra Gram+' },
  { nombre: 'Fluoroquinolonas', gramPos: true, gramNeg: true, parcial: null, mecanismo: 'Inhibe ADN girasa y topoisomerasa IV' },
  { nombre: 'Tetraciclinas', gramPos: true, gramNeg: true, parcial: null, mecanismo: 'Inhibe ribosoma 30S → bloquea carga aminoacil-ARNt' },
];

// ─────────────────────────────────────────────
// SVG helpers
// ─────────────────────────────────────────────

function SvgCocos() {
  return (
    <svg viewBox="0 0 200 100" className={styles.morfSvg} aria-label="Cocos bacterianos">
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => (
          <circle
            key={`${col}-${row}`}
            cx={40 + col * 28}
            cy={20 + row * 28}
            r={12}
            fill="#2E86AB"
            fillOpacity={0.75}
            stroke="#1A5F7A"
            strokeWidth={1.5}
          />
        ))
      )}
      {/* segunda agrupación: pares */}
      <circle cx={140} cy={34} r={12} fill="#48A9A6" fillOpacity={0.75} stroke="#2E7D7A" strokeWidth={1.5} />
      <circle cx={165} cy={34} r={12} fill="#48A9A6" fillOpacity={0.75} stroke="#2E7D7A" strokeWidth={1.5} />
      <text x={100} y={95} textAnchor="middle" fontSize={9} fill="#666" fontFamily="sans-serif">Staphylococcus (racimos) · Diplococcus (pares)</text>
    </svg>
  );
}

function SvgBacilos() {
  return (
    <svg viewBox="0 0 200 100" className={styles.morfSvg} aria-label="Bacilos bacterianos">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={20} y={15 + i * 28} width={60} height={20} rx={10} fill="#2E86AB" fillOpacity={0.75} stroke="#1A5F7A" strokeWidth={1.5} />
          {/* flagelo */}
          <path d={`M80,${25 + i * 28} Q100,${10 + i * 28} 110,${25 + i * 28}`} fill="none" stroke="#48A9A6" strokeWidth={1.5} />
        </g>
      ))}
      <text x={100} y={95} textAnchor="middle" fontSize={9} fill="#666" fontFamily="sans-serif">E. coli · Salmonella · Mycobacterium</text>
    </svg>
  );
}

function SvgEspirilos() {
  return (
    <svg viewBox="0 0 200 100" className={styles.morfSvg} aria-label="Espirilos bacterianos">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M 15,${20 + i * 28} Q 35,${5 + i * 28} 55,${20 + i * 28} Q 75,${35 + i * 28} 95,${20 + i * 28} Q 115,${5 + i * 28} 135,${20 + i * 28} Q 155,${35 + i * 28} 175,${20 + i * 28}`}
          fill="none"
          stroke="#2E86AB"
          strokeWidth={4}
          strokeLinecap="round"
        />
      ))}
      <text x={100} y={95} textAnchor="middle" fontSize={9} fill="#666" fontFamily="sans-serif">Treponema · Helicobacter · Borrelia</text>
    </svg>
  );
}

function SvgBacteria({ parteActiva }: { parteActiva: string | null }) {
  const getOpacity = (id: string) => (parteActiva === null || parteActiva === id ? 1 : 0.25);
  return (
    <svg viewBox="0 0 320 280" className={styles.bacteriaSvg} aria-label="Estructura de una bacteria">
      {/* Cápsula */}
      <ellipse cx={160} cy={140} rx={140} ry={110} fill="none" stroke="#64B5F6" strokeWidth={parteActiva === 'capsula' ? 6 : 3} strokeDasharray="8,4" opacity={getOpacity('capsula')} />
      {/* Pared celular */}
      <ellipse cx={160} cy={140} rx={120} ry={92} fill="#FFF176" stroke="#F9A825" strokeWidth={parteActiva === 'pared' ? 6 : 3} opacity={getOpacity('pared')} />
      {/* Membrana */}
      <ellipse cx={160} cy={140} rx={108} ry={80} fill="#F8BBD9" stroke="#E91E63" strokeWidth={parteActiva === 'membrana' ? 5 : 2} opacity={getOpacity('membrana')} />
      {/* Citoplasma */}
      <ellipse cx={160} cy={140} rx={105} ry={77} fill="#FAFAFA" stroke="none" opacity={0.95} />
      {/* Nucleoide */}
      <ellipse cx={160} cy={135} rx={55} ry={38} fill="#C8E6C9" stroke="#388E3C" strokeWidth={parteActiva === 'nucleoide' ? 4 : 2} opacity={getOpacity('nucleoide')} />
      <text x={160} y={139} textAnchor="middle" fontSize={9} fill="#2E7D32" fontWeight="600">ADN circular</text>
      {/* Plásmidos */}
      <ellipse cx={230} cy={105} rx={14} ry={10} fill="none" stroke="#8E24AA" strokeWidth={parteActiva === 'plasmidos' ? 4 : 2} opacity={getOpacity('plasmidos')} />
      <ellipse cx={215} cy={125} rx={11} ry={8} fill="none" stroke="#8E24AA" strokeWidth={1.5} opacity={getOpacity('plasmidos')} />
      {/* Ribosomas */}
      {[[95, 170], [115, 180], [135, 172], [95, 155], [115, 160]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={5} fill="#FF7043" opacity={getOpacity('ribosomas')} />
      ))}
      {/* Flagelo */}
      <path d="M280,140 Q310,110 300,80 Q290,50 310,30" fill="none" stroke="#29B6F6" strokeWidth={parteActiva === 'flagelo' ? 5 : 3} strokeLinecap="round" opacity={getOpacity('flagelo')} />
      <path d="M280,145 Q315,155 305,185" fill="none" stroke="#29B6F6" strokeWidth={2} strokeLinecap="round" opacity={getOpacity('flagelo')} />
      {/* Pili */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={40 + i * 18} y1={65} x2={50 + i * 16} y2={38} stroke="#9FA8DA" strokeWidth={parteActiva === 'pili' ? 4 : 2} opacity={getOpacity('pili')} />
      ))}
      {/* Etiquetas */}
      <text x={160} y={22} textAnchor="middle" fontSize={8} fill="#1565C0" opacity={getOpacity('capsula')}>Cápsula</text>
      <text x={285} y={60} textAnchor="middle" fontSize={8} fill="#1E88E5" opacity={getOpacity('flagelo')}>Flagelo</text>
      <text x={56} y={30} textAnchor="middle" fontSize={8} fill="#7986CB" opacity={getOpacity('pili')}>Pili</text>
      <text x={248} y={100} textAnchor="start" fontSize={8} fill="#8E24AA" opacity={getOpacity('plasmidos')}>Plásmidos</text>
    </svg>
  );
}

function SvgGramComparativa() {
  return (
    <svg viewBox="0 0 380 180" className={styles.gramSvg} aria-label="Comparativa pared celular Gram+ y Gram-">
      {/* Gram+ */}
      <rect x={10} y={20} width={160} height={140} rx={8} fill="#EDE7F6" stroke="#7B1FA2" strokeWidth={1.5} />
      <text x={90} y={14} textAnchor="middle" fontSize={11} fontWeight="700" fill="#4A148C">Gram +</text>
      {/* Membrana citoplasmática */}
      <rect x={20} y={90} width={140} height={14} rx={2} fill="#CE93D8" opacity={0.9} />
      <text x={90} y={101} textAnchor="middle" fontSize={7.5} fill="#4A148C">Membrana citoplasmática</text>
      {/* Peptidoglicano grueso */}
      <rect x={20} y={50} width={140} height={38} rx={2} fill="#7B1FA2" opacity={0.75} />
      <text x={90} y={66} textAnchor="middle" fontSize={7.5} fill="white">Peptidoglicano</text>
      <text x={90} y={77} textAnchor="middle" fontSize={7} fill="white">(20-80 nm — GRUESO)</text>
      {/* cristal violeta label */}
      <text x={90} y={144} textAnchor="middle" fontSize={8} fill="#4A148C" fontWeight="600">Retiene cristal violeta</text>
      <text x={90} y={156} textAnchor="middle" fontSize={9} fill="#6A1B9A">→ Color azul/violeta</text>

      {/* Gram- */}
      <rect x={210} y={20} width={160} height={140} rx={8} fill="#FFEBEE" stroke="#C62828" strokeWidth={1.5} />
      <text x={290} y={14} textAnchor="middle" fontSize={11} fontWeight="700" fill="#B71C1C">Gram −</text>
      {/* Membrana externa */}
      <rect x={220} y={38} width={140} height={12} rx={2} fill="#EF9A9A" opacity={0.9} />
      <text x={290} y={48} textAnchor="middle" fontSize={7} fill="#B71C1C">Mb. externa + LPS</text>
      {/* Peptidoglicano fino */}
      <rect x={220} y={52} width={140} height={12} rx={2} fill="#E53935" opacity={0.65} />
      <text x={290} y={62} textAnchor="middle" fontSize={7} fill="white">Peptidoglicano (2-7 nm)</text>
      {/* Membrana citoplasmática */}
      <rect x={220} y={66} width={140} height={12} rx={2} fill="#FFCDD2" opacity={0.95} stroke="#E53935" strokeWidth={1} />
      <text x={290} y={76} textAnchor="middle" fontSize={7} fill="#B71C1C">Membrana citoplasmática</text>
      {/* no retiene */}
      <text x={290} y={144} textAnchor="middle" fontSize={8} fill="#C62828" fontWeight="600">No retiene cristal violeta</text>
      <text x={290} y={156} textAnchor="middle" fontSize={9} fill="#B71C1C">→ Color rosa/rojo (safranina)</text>
    </svg>
  );
}

function SvgDominios() {
  return (
    <svg viewBox="0 0 400 280" className={styles.dominioTree} aria-label="Árbol de los 3 dominios de la vida">
      {/* Tronco común */}
      <line x1={200} y1={250} x2={200} y2={175} stroke="#795548" strokeWidth={4} />
      <text x={200} y={270} textAnchor="middle" fontSize={9} fill="#666">Ancestro Común Universal (LUCA)</text>
      {/* Rama izquierda: Bacteria */}
      <path d="M200,175 Q150,155 80,120" fill="none" stroke="#2E86AB" strokeWidth={3} />
      {/* Rama central: Archaea */}
      <path d="M200,175 Q200,145 200,110" fill="none" stroke="#8E24AA" strokeWidth={3} />
      {/* Rama derecha: Eukarya */}
      <path d="M200,175 Q250,155 320,120" fill="none" stroke="#388E3C" strokeWidth={3} />

      {/* Nodo Bacteria */}
      <circle cx={80} cy={115} r={8} fill="#2E86AB" />
      <text x={80} y={102} textAnchor="middle" fontSize={12} fontWeight="700" fill="#1A5F7A">Bacteria</text>
      <text x={80} y={140} textAnchor="middle" fontSize={7.5} fill="#2E86AB">Procariontes</text>
      <text x={80} y={150} textAnchor="middle" fontSize={7.5} fill="#555">Peptidoglicano</text>
      <text x={80} y={160} textAnchor="middle" fontSize={7.5} fill="#555">Ribosomas 70S</text>
      <text x={80} y={170} textAnchor="middle" fontSize={7.5} fill="#555">E. coli · Cianobacterias</text>

      {/* Nodo Archaea */}
      <circle cx={200} cy={108} r={8} fill="#8E24AA" />
      <text x={200} y={95} textAnchor="middle" fontSize={12} fontWeight="700" fill="#4A148C">Archaea</text>
      <text x={200} y={128} textAnchor="middle" fontSize={7.5} fill="#8E24AA">Procariontes</text>
      <text x={200} y={138} textAnchor="middle" fontSize={7.5} fill="#555">Sin peptidoglicano</text>
      <text x={200} y={148} textAnchor="middle" fontSize={7.5} fill="#555">Lípidos éter</text>
      <text x={200} y={158} textAnchor="middle" fontSize={7.5} fill="#555">Metanógenos · Termófilos</text>

      {/* Nodo Eukarya */}
      <circle cx={320} cy={115} r={8} fill="#388E3C" />
      <text x={320} y={102} textAnchor="middle" fontSize={12} fontWeight="700" fill="#1B5E20">Eukarya</text>
      <text x={320} y={140} textAnchor="middle" fontSize={7.5} fill="#388E3C">Eucariontes</text>
      <text x={320} y={150} textAnchor="middle" fontSize={7.5} fill="#555">Núcleo membranoso</text>
      <text x={320} y={160} textAnchor="middle" fontSize={7.5} fill="#555">Ribosomas 80S</text>
      <text x={320} y={170} textAnchor="middle" fontSize={7.5} fill="#555">Hongos · Plantas · Animales</text>

      {/* Teoría endosimbiótica: flechas */}
      <path d="M80,110 Q150,60 310,148" fill="none" stroke="#2E86AB" strokeWidth={1.5} strokeDasharray="4,3" markerEnd="url(#arr)" />
      <text x={190} y={50} textAnchor="middle" fontSize={7} fill="#2E86AB">Endosimbiosis (mitocondria)</text>

      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#2E86AB" />
        </marker>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Curva de crecimiento logístico SVG
// ─────────────────────────────────────────────

function calcularCrecimiento(td: number, k: number, horas: number): { t: number; n: number }[] {
  const puntos: { t: number; n: number }[] = [];
  const n0 = 10;
  const r = Math.LN2 / (td / 60); // tasa por hora
  for (let t = 0; t <= horas; t += 0.5) {
    const n = (k * n0) / (n0 + (k - n0) * Math.exp(-r * t));
    puntos.push({ t, n });
  }
  return puntos;
}

function SvgCrecimiento({ td, k }: { td: number; k: number }) {
  const horas = 24;
  const puntos = calcularCrecimiento(td, k, horas);
  const maxN = k * 1.05;
  const W = 360;
  const H = 200;
  const pad = { top: 15, right: 15, bottom: 35, left: 55 };
  const iW = W - pad.left - pad.right;
  const iH = H - pad.top - pad.bottom;

  const toX = (t: number) => pad.left + (t / horas) * iW;
  const toY = (n: number) => pad.top + (1 - n / maxN) * iH;

  const pathD = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.t).toFixed(1)},${toY(p.n).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graficaCrecimiento} aria-label="Curva de crecimiento logístico bacteriano">
      {/* Ejes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + iH} stroke="#999" strokeWidth={1.5} />
      <line x1={pad.left} y1={pad.top + iH} x2={pad.left + iW} y2={pad.top + iH} stroke="#999" strokeWidth={1.5} />
      {/* Línea capacidad de carga */}
      <line x1={pad.left} y1={toY(k)} x2={pad.left + iW} y2={toY(k)} stroke="#E53935" strokeWidth={1} strokeDasharray="5,3" />
      <text x={pad.left + iW + 2} y={toY(k) + 4} fontSize={8} fill="#E53935">K</text>
      {/* Curva */}
      <path d={pathD} fill="none" stroke="#2E86AB" strokeWidth={2.5} strokeLinecap="round" />
      {/* Etiquetas fases */}
      <text x={pad.left + 10} y={pad.top + iH - 20} fontSize={7.5} fill="#666">Latencia</text>
      <text x={pad.left + 50} y={pad.top + 30} fontSize={7.5} fill="#2E86AB">Exponencial</text>
      <text x={pad.left + 160} y={toY(k) - 8} fontSize={7.5} fill="#388E3C">Estacionaria</text>
      {/* Eje X ticks */}
      {[0, 6, 12, 18, 24].map((t) => (
        <g key={t}>
          <line x1={toX(t)} y1={pad.top + iH} x2={toX(t)} y2={pad.top + iH + 4} stroke="#999" strokeWidth={1} />
          <text x={toX(t)} y={pad.top + iH + 12} textAnchor="middle" fontSize={7.5} fill="#666">{t}h</text>
        </g>
      ))}
      {/* Eje Y label */}
      <text x={12} y={pad.top + iH / 2} textAnchor="middle" fontSize={7.5} fill="#666" transform={`rotate(-90, 12, ${pad.top + iH / 2})`}>Nº bacterias</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMicrobiologia() {
  const [tab, setTab] = useState<Tab>('morfologia');
  const [morfologiaActiva, setMorfologiaActiva] = useState<string>('cocos');
  const [parteActiva, setParteActiva] = useState<string | null>(null);
  const [td, setTd] = useState(30); // tiempo de generación en min
  const [kCarga, setKCarga] = useState(10000);
  const [procesoActivo, setProcesoActivo] = useState<string | null>(null);
  const [gramTab, setGramTab] = useState<'pos' | 'neg'>('pos');

  const morfActual = useMemo(() => MORFOLOGIAS.find((m) => m.id === morfologiaActiva) ?? MORFOLOGIAS[0], [morfologiaActiva]);

  const jsonLdData = generateJsonLd();

  const numBacterias = useMemo(() => {
    const n0 = 10;
    const horas = 8;
    const r = Math.LN2 / (td / 60);
    const nExp = n0 * Math.pow(2, (horas * 60) / td);
    return Math.min(nExp, kCarga).toFixed(0);
  }, [td, kCarga]);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'morfologia', label: 'Morfologías', emoji: '🔬' },
    { id: 'crecimiento', label: 'Crecimiento', emoji: '📈' },
    { id: 'gram', label: 'Gram+ vs Gram−', emoji: '🎨' },
    { id: 'dominios', label: '3 Dominios', emoji: '🌳' },
  ];

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Microbiología</h1>
        <p className={styles.subtitle}>Bacterias, Gram+ vs Gram−, crecimiento logístico y los 3 dominios de la vida</p>
      </header>

      <LegalNotice />

      {/* Pestañas de navegación */}
      <nav className={styles.tabBar} aria-label="Secciones de microbiología">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ── Tab 1: Morfologías ── */}
      {tab === 'morfologia' && (
        <section aria-label="Morfologías bacterianas">
          <h2 className={styles.seccionTitulo}>Morfologías y Estructura Bacteriana</h2>
          <p className={styles.seccionSubtitulo}>Las bacterias adoptan tres formas básicas que determinan su clasificación morfológica</p>

          <div className={styles.morfologiasGrid}>
            {MORFOLOGIAS.map((m) => (
              <button
                key={m.id}
                className={`${styles.morfologiaCard} ${morfologiaActiva === m.id ? styles.morfologiaCardActive : ''}`}
                onClick={() => setMorfologiaActiva(m.id)}
                aria-pressed={morfologiaActiva === m.id}
              >
                <strong>{m.nombre}</strong>
                <span className={styles.morfDesc}>{m.descripcion}</span>
              </button>
            ))}
          </div>

          <div className={styles.morfVisualizacion}>
            <div className={styles.morfSvgContainer}>
              {morfActual.forma === 'coco' && <SvgCocos />}
              {morfActual.forma === 'bacilo' && <SvgBacilos />}
              {morfActual.forma === 'espirilo' && <SvgEspirilos />}
            </div>
            <div className={styles.morfInfo}>
              <h3 className={styles.morfNombre}>{morfActual.nombre}</h3>
              <p className={styles.morfDescLarga}>{morfActual.descripcion}</p>
              <ul className={styles.ejemplosList}>
                {morfActual.ejemplos.map((e) => (
                  <li key={e}><em>{e}</em></li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.estructuraCard}>
            <h3 className={styles.estructuraTitulo}>Estructura bacteriana — selecciona una parte</h3>
            <div className={styles.estructuraLayout}>
              <SvgBacteria parteActiva={parteActiva} />
              <div className={styles.partesBtns}>
                {PARTES_BACTERIANAS.map((p) => (
                  <button
                    key={p.id}
                    className={`${styles.parteBtn} ${parteActiva === p.id ? styles.parteBtnActive : ''}`}
                    style={{ '--parte-color': p.color } as React.CSSProperties}
                    onClick={() => setParteActiva(parteActiva === p.id ? null : p.id)}
                    aria-pressed={parteActiva === p.id}
                  >
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
            {parteActiva && (
              <div className={styles.parteInfo} role="alert" aria-live="polite">
                <strong>{PARTES_BACTERIANAS.find((p) => p.id === parteActiva)?.nombre}</strong>
                <p>{PARTES_BACTERIANAS.find((p) => p.id === parteActiva)?.descripcion}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Tab 2: Crecimiento ── */}
      {tab === 'crecimiento' && (
        <section aria-label="Crecimiento bacteriano">
          <h2 className={styles.seccionTitulo}>Crecimiento y Reproducción</h2>
          <p className={styles.seccionSubtitulo}>Curva logística con fase lag, exponencial, estacionaria y de muerte</p>

          <div className={styles.sliderZona}>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="slider-td">
                Tiempo de generación (t<sub>d</sub>)
                <span className={styles.sliderValue}>{td} min</span>
              </label>
              <input
                id="slider-td"
                type="range"
                min={20}
                max={120}
                step={5}
                value={td}
                onChange={(e) => setTd(Number(e.target.value))}
                className={styles.slider}
                aria-valuenow={td}
                aria-valuemin={20}
                aria-valuemax={120}
              />
            </div>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="slider-k">
                Capacidad de carga (K)
                <span className={styles.sliderValue}>{kCarga.toLocaleString('es-ES')}</span>
              </label>
              <input
                id="slider-k"
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={kCarga}
                onChange={(e) => setKCarga(Number(e.target.value))}
                className={styles.slider}
                aria-valuenow={kCarga}
                aria-valuemin={1000}
                aria-valuemax={100000}
              />
            </div>
          </div>

          <SvgCrecimiento td={td} k={kCarga} />

          <div className={styles.calculadoraCard}>
            <h3 className={styles.calcTitulo}>Calculadora de división binaria</h3>
            <p className={styles.calcDesc}>
              Partiendo de 10 bacterias con t<sub>d</sub> = {td} min, tras <strong>8 horas</strong>:
            </p>
            <div className={styles.calcResultado} role="status" aria-live="polite">
              <span className={styles.calcNumero}>{Number(numBacterias).toLocaleString('es-ES')}</span>
              <span className={styles.calcUnidad}>bacterias</span>
            </div>
            <p className={styles.calcFormula}>N = N₀ × 2^(t / t<sub>d</sub>), limitado por K = {kCarga.toLocaleString('es-ES')}</p>
          </div>

          <h3 className={styles.procesosTitulo}>Procesos especiales de reproducción</h3>
          <div className={styles.procesosBtns}>
            {[
              { id: 'conjugacion', label: 'Conjugación', emoji: '🔗' },
              { id: 'esporulacion', label: 'Esporulación', emoji: '🛡️' },
              { id: 'transformacion', label: 'Transformación', emoji: '🧬' },
            ].map((proc) => (
              <button
                key={proc.id}
                className={`${styles.procesoBtn} ${procesoActivo === proc.id ? styles.procesoBtnActive : ''}`}
                onClick={() => setProcesoActivo(procesoActivo === proc.id ? null : proc.id)}
                aria-pressed={procesoActivo === proc.id}
              >
                <span aria-hidden="true">{proc.emoji}</span> {proc.label}
              </button>
            ))}
          </div>

          {procesoActivo === 'conjugacion' && (
            <div className={styles.procesoInfo} role="alert" aria-live="polite">
              <h4>Conjugación bacteriana</h4>
              <p>Una bacteria donante (F+) forma un <strong>pilus sexual</strong> que conecta físicamente con una receptora (F−). A través del tubo de conjugación se transfiere una copia del <strong>plásmido F</strong> o fragmentos de ADN cromosómico. Es el principal mecanismo de diseminación de genes de resistencia a antibióticos entre bacterias (incluso de especies distintas).</p>
              <svg viewBox="0 0 300 120" className={styles.procesoSvg} aria-label="Conjugación bacteriana">
                <rect x={20} y={40} width={80} height={30} rx={15} fill="#2E86AB" fillOpacity={0.8} />
                <text x={60} y={59} textAnchor="middle" fontSize={9} fill="white">Bacteria F+</text>
                <rect x={200} y={40} width={80} height={30} rx={15} fill="#48A9A6" fillOpacity={0.8} />
                <text x={240} y={59} textAnchor="middle" fontSize={9} fill="white">Bacteria F−</text>
                <line x1={100} y1={55} x2={200} y2={55} stroke="#8E24AA" strokeWidth={3} />
                <text x={150} y={50} textAnchor="middle" fontSize={8} fill="#8E24AA">Pilus sexual</text>
                <circle cx={130} cy={55} r={6} fill="#F9A825" />
                <text x={130} y={82} textAnchor="middle" fontSize={7.5} fill="#E65100">Plásmido</text>
                <text x={150} y={105} textAnchor="middle" fontSize={8} fill="#555">→ Transferencia de resistencia antibiótica</text>
              </svg>
            </div>
          )}

          {procesoActivo === 'esporulacion' && (
            <div className={styles.procesoInfo} role="alert" aria-live="polite">
              <h4>Esporulación</h4>
              <p>Cuando las condiciones son desfavorables (falta de nutrientes, desecación, calor), bacterias de los géneros <strong>Bacillus</strong> y <strong>Clostridium</strong> forman <strong>endosporas</strong>. Son estructuras metabólicamente inactivas con varias capas protectoras que resisten temperaturas de 100°C, radiación UV y desinfectantes. Una espora puede germinar y dar lugar a una bacteria activa siglos después.</p>
              <svg viewBox="0 0 300 100" className={styles.procesoSvg} aria-label="Esporulación bacteriana">
                <rect x={20} y={30} width={80} height={30} rx={15} fill="#2E86AB" fillOpacity={0.7} />
                <text x={60} y={50} textAnchor="middle" fontSize={8} fill="white">Bacillus activo</text>
                <text x={115} y={48} textAnchor="middle" fontSize={16} fill="#E65100">→</text>
                <rect x={135} y={30} width={80} height={30} rx={15} fill="#78909C" fillOpacity={0.6} />
                <ellipse cx={175} cy={45} rx={20} ry={14} fill="#455A64" opacity={0.9} />
                <text x={175} y={50} textAnchor="middle" fontSize={7} fill="white">Endospora</text>
                <text x={240} y={48} textAnchor="middle" fontSize={16} fill="#E65100">→</text>
                <rect x={255} y={30} width={40} height={28} rx={14} fill="#2E86AB" fillOpacity={0.85} />
                <text x={275} y={48} textAnchor="middle" fontSize={7} fill="white">Germina</text>
                <text x={150} y={85} textAnchor="middle" fontSize={7.5} fill="#555">Resiste 100°C · Viable durante siglos</text>
              </svg>
            </div>
          )}

          {procesoActivo === 'transformacion' && (
            <div className={styles.procesoInfo} role="alert" aria-live="polite">
              <h4>Transformación bacteriana</h4>
              <p>Algunas bacterias son capaces de captar <strong>ADN desnudo</strong> del entorno (liberado por bacterias muertas) e incorporarlo a su genoma. Este proceso, descubierto por Frederick Griffith en 1928 con <em>Streptococcus pneumoniae</em>, demostró por primera vez que el material hereditario era una molécula química. Hoy es la base de la <strong>ingeniería genética</strong>: se introduce ADN plasmídico en bacterias para producir proteínas como insulina o vacunas recombinantes.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Tab 3: Gram+ vs Gram− ── */}
      {tab === 'gram' && (
        <section aria-label="Comparativa Gram positiva y Gram negativa">
          <h2 className={styles.seccionTitulo}>Tinción de Gram: Gram+ vs Gram−</h2>
          <p className={styles.seccionSubtitulo}>La diferencia en la pared celular determina el diagnóstico y el tratamiento antibiótico</p>

          <SvgGramComparativa />

          <div className={styles.gramTabs}>
            <button
              className={`${styles.gramTabBtn} ${gramTab === 'pos' ? styles.gramTabPos : ''}`}
              onClick={() => setGramTab('pos')}
              aria-pressed={gramTab === 'pos'}
            >
              🟣 Gram Positivas
            </button>
            <button
              className={`${styles.gramTabBtn} ${gramTab === 'neg' ? styles.gramTabNeg : ''}`}
              onClick={() => setGramTab('neg')}
              aria-pressed={gramTab === 'neg'}
            >
              🔴 Gram Negativas
            </button>
          </div>

          <div className={styles.gramComparativa}>
            {(gramTab === 'pos' ? GRAM_POS : GRAM_NEG).map((ej) => (
              <div key={ej.nombre} className={`${styles.gramCard} ${gramTab === 'pos' ? styles.gramPos : styles.gramNeg}`}>
                <span aria-hidden="true" className={styles.gramEmoji}>{ej.emoji}</span>
                <div>
                  <strong><em>{ej.nombre}</em></strong>
                  <p className={styles.gramEnfermedad}>{ej.enfermedad}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className={styles.antibTitulo}>Sensibilidad a antibióticos</h3>
          <div className={styles.antibTableWrapper}>
            <table className={styles.antibTable} role="table">
              <caption className={styles.srOnly}>Sensibilidad a antibióticos según tinción de Gram</caption>
              <thead>
                <tr>
                  <th scope="col">Antibiótico</th>
                  <th scope="col">Gram+</th>
                  <th scope="col">Gram−</th>
                  <th scope="col">Mecanismo de acción</th>
                </tr>
              </thead>
              <tbody>
                {ANTIBIOTICOS.map((ab) => (
                  <tr key={ab.nombre}>
                    <td className={styles.antibNombre}>{ab.nombre}</td>
                    <td className={styles.antibCell}>
                      {ab.gramPos ? <span className={styles.sensibleSi} aria-label="Sensible">✓</span> : (ab.parcial === 'pos' ? <span className={styles.sensibleParcial} aria-label="Parcialmente sensible">±</span> : <span className={styles.sensibleNo} aria-label="No sensible">✗</span>)}
                    </td>
                    <td className={styles.antibCell}>
                      {ab.gramNeg ? <span className={styles.sensibleSi} aria-label="Sensible">✓</span> : (ab.parcial === 'neg' ? <span className={styles.sensibleParcial} aria-label="Parcialmente sensible">±</span> : <span className={styles.sensibleNo} aria-label="No sensible">✗</span>)}
                    </td>
                    <td className={styles.antibMec}>{ab.mecanismo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Tab 4: 3 Dominios ── */}
      {tab === 'dominios' && (
        <section aria-label="Los 3 dominios de la vida">
          <h2 className={styles.seccionTitulo}>Los 3 Dominios de la Vida</h2>
          <p className={styles.seccionSubtitulo}>Clasificación propuesta por Carl Woese (1977) a partir de la comparación del ARN ribosomal 16S</p>

          <SvgDominios />

          <div className={styles.dominiosGrid}>
            <div className={styles.dominioCard} style={{ borderColor: '#2E86AB' }}>
              <h3 className={styles.dominioNombre} style={{ color: '#1A5F7A' }}>🔵 Bacteria</h3>
              <ul className={styles.dominioLista}>
                <li>Procariontes: sin núcleo membranoso</li>
                <li>Pared con <strong>peptidoglicano</strong></li>
                <li>Ribosomas 70S (30S + 50S)</li>
                <li>ADN circular, sin histonas</li>
                <li>Proteobacterias, Firmicutes, Cianobacterias</li>
              </ul>
            </div>
            <div className={styles.dominioCard} style={{ borderColor: '#8E24AA' }}>
              <h3 className={styles.dominioNombre} style={{ color: '#4A148C' }}>🟣 Archaea</h3>
              <ul className={styles.dominioLista}>
                <li>Procariontes: sin núcleo membranoso</li>
                <li><strong>Sin peptidoglicano</strong> en la pared</li>
                <li>Lípidos de membrana con enlace <strong>éter</strong></li>
                <li>Extremófilos: metanógenos, halófilos, termófilos</li>
                <li>ARN polimerasa similar a eucariotas</li>
              </ul>
            </div>
            <div className={styles.dominioCard} style={{ borderColor: '#388E3C' }}>
              <h3 className={styles.dominioNombre} style={{ color: '#1B5E20' }}>🟢 Eukarya</h3>
              <ul className={styles.dominioLista}>
                <li>Eucariontes: <strong>núcleo con membrana</strong></li>
                <li>Ribosomas 80S (40S + 60S)</li>
                <li>Orgánulos membranosos (mitocondria, RE...)</li>
                <li>Protistas, Hongos, Plantas, Animales</li>
              </ul>
            </div>
          </div>

          <div className={styles.endosimbiosisCard}>
            <h3 className={styles.endoTitulo}>Teoría endosimbiótica (Lynn Margulis, 1967)</h3>
            <p>Las <strong>mitocondrias</strong> de todas las células eucariontes y los <strong>cloroplastos</strong> de las plantas son descendientes de bacterias que fueron engullidas hace ~2.000 millones de años y no digeridas, estableciendo una simbiosis. Las evidencias son contundentes:</p>
            <ul className={styles.endoLista}>
              <li>Tienen <strong>ADN circular propio</strong> (como las bacterias)</li>
              <li>Sus ribosomas son <strong>70S</strong> (no 80S como el citoplasma eucariota)</li>
              <li>Se reproducen de forma <strong>independiente</strong> por fisión binaria</li>
              <li>Tienen <strong>doble membrana</strong> (la externa es la vesícula de endocitosis)</li>
            </ul>
          </div>
        </section>
      )}

      <EducationalSection
        title="Microbiología: los organismos invisibles que gobiernan el planeta"
        subtitle="Bacterias, Archaea y la teoría endosimbiótica que explica el origen de la célula eucariota"
      >
        <p>Las bacterias son los organismos más abundantes de la Tierra: en 1 ml de agua de mar hay hasta 1 millón, y en el cuerpo humano hay tantas bacterias como células propias. Son procariontes —sin núcleo membranoso ni orgánulos— pero han colonizado todos los ambientes del planeta gracias a su increíble velocidad de adaptación.</p>
        <p>La tinción de Gram, desarrollada por Hans Christian Gram en 1884, sigue siendo una de las pruebas diagnósticas más importantes de la microbiología clínica: en 30 minutos distingue dos grandes grupos bacterianos con diferente pared celular, lo que orienta el tratamiento antibiótico antes de tener los resultados del cultivo.</p>
        <p>El descubrimiento de los Archaea como dominio independiente (Carl Woese, 1977) mediante comparación de ARN ribosomal 16S revolucionó la clasificación de la vida. Los extremófilos —bacterias que viven en géiseres, salinas o fuentes hidrotermales— sugieren que la vida puede surgir en condiciones muy distintas a las terrestres normales.</p>

        {/* ── 1. Tabla Comparativa ── */}
        <h3 className={styles.eduSectionTitle}>Comparativa: Gram+ vs Gram− vs Archaea</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.srOnly}>Comparativa de los tres grandes grupos de procariontes</caption>
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Pared celular</th>
                <th scope="col">Tinción Gram</th>
                <th scope="col">Antibióticos efectivos</th>
                <th scope="col">Ejemplos</th>
                <th scope="col">Hábitat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.comparativaTipo} style={{ color: '#7B1FA2' }}><strong>Gram+</strong></td>
                <td>Peptidoglicano grueso (20-80 nm)</td>
                <td>Azul/violeta (retiene cristal violeta)</td>
                <td>Penicilinas, Vancomicina, Cefalosporinas</td>
                <td><em>S. aureus, S. pneumoniae, Clostridium</em></td>
                <td>Piel, mucosas, suelo, agua</td>
              </tr>
              <tr>
                <td className={styles.comparativaTipo} style={{ color: '#C62828' }}><strong>Gram−</strong></td>
                <td>Peptidoglicano fino + membrana externa con LPS</td>
                <td>Rosa/rojo (safranina tras decoloración)</td>
                <td>Aminoglucósidos, Polimixinas, Fluoroquinolonas</td>
                <td><em>E. coli, Salmonella, H. pylori, N. gonorrhoeae</em></td>
                <td>Intestino, agua, suelo, hospedadores</td>
              </tr>
              <tr>
                <td className={styles.comparativaTipo} style={{ color: '#6A1B9A' }}><strong>Archaea</strong></td>
                <td>Sin peptidoglicano (pseudomureína u otras)</td>
                <td>Variable (técnica Gram poco útil)</td>
                <td>Resistentes a la mayoría de antibióticos convencionales</td>
                <td><em>Methanobacterium, Halobacterium, Sulfolobus</em></td>
                <td>Extremófilos: géiseres, salinas, fuentes hidrotermales</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── 2. Casos de Uso ── */}
        <h3 className={styles.eduSectionTitle}>¿Quién usa este visualizador y para qué?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🩺</span>
            <h4 className={styles.escenarioTitulo}>Estudiante de medicina</h4>
            <p className={styles.escenarioDesc}>Practica la clasificación bacteriana antes de un examen de microbiología clínica. Entiende qué antibiótico prescribir según la tinción Gram del cultivo del paciente.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">👥</span>
            <h4 className={styles.escenarioTitulo}>Ciudadano curioso</h4>
            <p className={styles.escenarioDesc}>Quiere entender por qué el médico pide un antibiograma, qué es la resistencia antibiótica y por qué no debe tomar antibióticos para un catarro viral.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">💊</span>
            <h4 className={styles.escenarioTitulo}>Farmacéutico</h4>
            <p className={styles.escenarioDesc}>Explica a pacientes por qué ciertos antibióticos no funcionan contra determinadas infecciones, usando la comparativa Gram+ / Gram− como referencia visual.</p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🔬</span>
            <h4 className={styles.escenarioTitulo}>Microbiólogo en formación</h4>
            <p className={styles.escenarioDesc}>Repasa las diferencias entre los 3 dominios, la teoría endosimbiótica y los mecanismos de transferencia génica (conjugación, transformación, esporulación).</p>
          </div>
        </div>

        {/* ── 3. FAQ ── */}
        <h3 className={styles.eduSectionTitle}>Preguntas frecuentes sobre microbiología</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuántas bacterias tiene el cuerpo humano?</strong>
            <p>Aproximadamente 38 billones de bacterias, una cifra similar al número de células humanas (37 billones). La microbiota intestinal pesa unos 200 gramos y contiene más de 1.000 especies distintas. Lejos de ser perjudiciales, el 99% son beneficiosas o neutras.</p>
            <span className={styles.faqTip}>Dato: el intestino grueso alberga el 95% de todas las bacterias del cuerpo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué los antibióticos no funcionan contra los virus?</strong>
            <p>Los antibióticos atacan estructuras exclusivas de las bacterias: la pared de peptidoglicano, el ribosoma 70S o la ADN girasa. Los virus no tienen ninguna de estas estructuras porque no son células; son fragmentos de ARN o ADN recubiertos por proteínas. Para los virus existen los antivirales (ej. oseltamivir para la gripe, aciclovir para el herpes).</p>
            <span className={styles.faqTip}>Regla práctica: gripe, resfriado, COVID-19 → antibióticos inútiles. Solo valen en sobreinfección bacteriana diagnosticada.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la resistencia antibiótica y por qué es tan peligrosa?</strong>
            <p>Ocurre cuando las bacterias adquieren mutaciones o plásmidos que les permiten sobrevivir a los antibióticos. Se disemina por conjugación (transferencia de plásmidos de resistencia entre bacterias). La OMS la considera una de las 10 mayores amenazas globales: se estiman 1,27 millones de muertes anuales directas por resistencias (datos 2019).</p>
            <span className={styles.faqTip}>Las bacterias MRSA (Staphylococcus aureus resistente a meticilina) solo responden a Vancomicina como último recurso.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre una bacteria y un virus?</strong>
            <p>Las bacterias son células procariontes vivas con metabolismo propio, capaces de reproducirse de forma autónoma. Los virus son parásitos intracelulares obligados: solo se replican dentro de una célula huésped, usando su maquinaria. Las bacterias son 10-100 veces mayores que los virus (1-10 µm vs 20-300 nm).</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son los probióticos y para qué sirven?</strong>
            <p>Son microorganismos vivos (principalmente lactobacilos y bifidobacterias) que, consumidos en cantidades suficientes, confieren beneficios al huésped. La evidencia científica respaldada incluye: reducción de diarrea asociada a antibióticos, mejora del síndrome de intestino irritable y acortamiento de diarreas infecciosas. No están indicados de forma rutinaria en personas sanas.</p>
            <span className={styles.faqTip}>El yogur natural con cultivos activos es una fuente real de probióticos. Los suplementos varían enormemente en calidad y cepas.</span>
          </li>
        </ul>

        {/* ── 4. Guía Paso a Paso ── */}
        <h3 className={styles.eduSectionTitle}>Cómo identificar y clasificar bacterias correctamente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <div className={styles.stepContent}>
              <strong>Observación macroscópica del cultivo</strong>
              <p>Se siembra la muestra clínica en medios de cultivo sólidos (agar sangre, agar MacConkey) y se incuba 24-48 h a 37°C. Se observa el aspecto de las colonias: tamaño, color, hemólisis y textura.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <div className={styles.stepContent}>
              <strong>Tinción de Gram</strong>
              <p>Se fija la muestra al portaobjetos y se aplican sucesivamente: cristal violeta → lugol (fijador) → alcohol-acetona (decolorador) → safranina (colorante de contraste). Gram+ = azul/violeta; Gram− = rosa/rojo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <div className={styles.stepContent}>
              <strong>Morfología microscópica</strong>
              <p>Con microscopio óptico (100x, inmersión) se determina la forma: cocos (esféricos), bacilos (bastón) o espirilos (helicoidal), y la agrupación: racimos, cadenas, pares, tétradas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <div className={styles.stepContent}>
              <strong>Pruebas bioquímicas y antibiograma</strong>
              <p>Se realizan pruebas específicas (catalasa, oxidasa, fermentación de azúcares) para confirmar especie. Simultáneamente, el antibiograma (difusión en disco o CMI) determina la sensibilidad a antibióticos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">5</span>
            <div className={styles.stepContent}>
              <strong>Identificación molecular (si es necesario)</strong>
              <p>Para casos complejos o resistencias inesperadas, la secuenciación del gen ARNr 16S o la espectrometría de masas MALDI-TOF permiten identificar la especie con máxima precisión en minutos.</p>
            </div>
          </li>
        </ol>

        {/* ── 5. Mejores Prácticas ── */}
        <h3 className={styles.eduSectionTitle}>Uso responsable de antibióticos: 5 reglas clave</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📋</span>
            <h4>Completa el tratamiento</h4>
            <p>Nunca interrumpas un antibiótico al sentirte mejor. Las bacterias que sobreviven son las más resistentes y proliferan, generando cepas resistentes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚫</span>
            <h4>No los tomes para virus</h4>
            <p>Gripe, resfriado, COVID-19 y faringitis virales no responden a antibióticos. Su uso innecesario destruye la microbiota y fomenta las resistencias.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💊</span>
            <h4>No guardes ni compartas</h4>
            <p>Cada antibiótico es específico para una infección y persona. Guardar sobras para otro episodio o cedérselas a alguien puede ser peligroso e ineficaz.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <h4>Pide antibiograma cuando corresponda</h4>
            <p>Para infecciones recurrentes (ITU de repetición, infecciones por MRSA), insiste en que se haga cultivo + antibiograma antes de prescribir el antibiótico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧫</span>
            <h4>Cuida tu microbiota</h4>
            <p>Durante y después de un tratamiento antibiótico, consume fibra, fermentados (yogur, kéfir) y probióticos indicados por tu médico o farmacéutico para restaurar la flora intestinal.</p>
          </div>
        </div>

        {/* ── 6. Warning Box ── */}
        <div className={styles.warningBoxEdu} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes sobre bacterias y antibióticos</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>"Las bacterias son siempre malas"</strong> — Falso. La microbiota intestinal (billones de bacterias) es imprescindible para la digestión, la inmunidad y la síntesis de vitaminas como B12 y K2.</li>
            <li><strong>"Con tomar antibióticos unos días ya es suficiente"</strong> — Peligroso. Interrumpir el tratamiento antes de tiempo selecciona las bacterias más resistentes y provoca recaídas más difíciles de tratar.</li>
            <li><strong>"Los probióticos curan cualquier infección"</strong> — Incorrecto. Los probióticos ayudan a restaurar la microbiota, pero no tratan infecciones bacterianas activas. No sustituyen a los antibióticos indicados.</li>
            <li><strong>"Gram+ siempre es más peligrosa que Gram−"</strong> — Incorrecto. Ambos grupos incluyen patógenos letales. Las Gram− tienen lipopolisacárido (LPS) en su membrana externa, responsable del choque séptico, lo que las hace especialmente peligrosas en bacteriemias.</li>
            <li><strong>"Los antibióticos en animales no nos afectan"</strong> — Falso. El uso masivo en ganadería es una de las principales fuentes de resistencias antibióticas que luego se transfieren a humanos a través de la cadena alimentaria y el medio ambiente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-microbiologia')} />
      <ShareCard appName="visualizador-microbiologia" />
      <Footer appName="visualizador-microbiologia" />
    </div>
  );
}
