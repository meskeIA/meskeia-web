'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './EvoluccionMolecular.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SeccionId = 'mutaciones' | 'reloj' | 'arbol' | 'evidencia';

interface NavSeccion {
  id: SeccionId;
  icono: string;
  titulo: string;
  subtitulo: string;
}

interface BaseDna {
  base: string;
  mutada: boolean;
  posicion: number;
}

interface MutacionRegistro {
  posicion: number;
  baseOriginal: string;
  baseNueva: string;
  sinonima: boolean;
  codificante: boolean;
}

interface ConjuntoEspecies {
  id: string;
  nombre: string;
  descripcion: string;
  especies: EspecieFilogenetica[];
}

interface EspecieFilogenetica {
  id: string;
  nombre: string;
  secuencia: string;
}

interface EvidenciaMolecular {
  id: string;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ejemplo: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const BASES_DNA = ['A', 'T', 'G', 'C'];

const CODON_MAP: Record<string, string> = {
  'TTT': 'Phe', 'TTC': 'Phe', 'TTA': 'Leu', 'TTG': 'Leu',
  'CTT': 'Leu', 'CTC': 'Leu', 'CTA': 'Leu', 'CTG': 'Leu',
  'ATT': 'Ile', 'ATC': 'Ile', 'ATA': 'Ile', 'ATG': 'Met',
  'GTT': 'Val', 'GTC': 'Val', 'GTA': 'Val', 'GTG': 'Val',
  'TCT': 'Ser', 'TCC': 'Ser', 'TCA': 'Ser', 'TCG': 'Ser',
  'CCT': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
  'ACT': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
  'GCT': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
  'TAT': 'Tyr', 'TAC': 'Tyr', 'TAA': 'STOP', 'TAG': 'STOP',
  'CAT': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
  'AAT': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
  'GAT': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
  'TGT': 'Cys', 'TGC': 'Cys', 'TGA': 'STOP', 'TGG': 'Trp',
  'CGT': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
  'AGT': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
  'GGT': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
};

const SECUENCIA_INICIAL = 'ATGCTTGACGAATCCTGAGCT';

const SECUENCIA_ANCESTRAL_AA = ['A', 'D', 'V', 'A', 'K', 'H', 'G', 'P', 'L', 'W'];

const TASA_MUTACION = 0.003;

const CONJUNTOS_ESPECIES: ConjuntoEspecies[] = [
  {
    id: 'primates',
    nombre: 'Primates',
    descripcion: 'Humano, chimpancé, gorila, orangután, gibón',
    especies: [
      { id: 'humano',     nombre: 'Homo sapiens',      secuencia: 'ATGCTTGACGAC' },
      { id: 'chimpance',  nombre: 'Pan troglodytes',    secuencia: 'ATGCTTGACGAC' },
      { id: 'gorila',     nombre: 'Gorilla gorilla',    secuencia: 'ATGCTTGGCGAC' },
      { id: 'orangutan',  nombre: 'Pongo pygmaeus',     secuencia: 'ATGCTCGACGAC' },
      { id: 'gibon',      nombre: 'Hylobates lar',      secuencia: 'ATCCTTGACGAT' },
    ],
  },
  {
    id: 'cetaceos',
    nombre: 'Cetáceos',
    descripcion: 'Ballena, delfín, vaca, hipopótamo, cerdo',
    especies: [
      { id: 'ballena',    nombre: 'Balaena mysticetus', secuencia: 'ATGCAAGACGAC' },
      { id: 'delfin',     nombre: 'Tursiops truncatus', secuencia: 'ATGCAAGACGAA' },
      { id: 'vaca',       nombre: 'Bos taurus',         secuencia: 'ATGCAGGACGAC' },
      { id: 'hipopotamo', nombre: 'H. amphibius',       secuencia: 'ATGCAAGACGAC' },
      { id: 'cerdo',      nombre: 'Sus scrofa',         secuencia: 'ATGCAGGACGAT' },
    ],
  },
];

const EVIDENCIAS: EvidenciaMolecular[] = [
  {
    id: 'ortologos',
    icono: '🔗',
    titulo: 'Genes ortólogos y parálogos',
    subtitulo: 'Misma función, distintas especies',
    descripcion: 'Los genes ortólogos son versiones del mismo gen en distintas especies — misma función, secuencias similares porque descienden de un ancestro común. Los genes parálogos son copias duplicadas dentro de la misma especie que pueden divergir en función. La similitud de secuencia predice con precisión la distancia evolutiva.',
    ejemplo: 'El gen BRCA1 (cáncer de mama) está conservado en ratones con 60% de identidad. La hemoglobina tiene 4 genes parálogos en humanos (α, β, γ, δ) de una duplicación hace ~500 Ma.',
  },
  {
    id: 'pseudogenes',
    icono: '🔴',
    titulo: 'Pseudogenes — fósiles moleculares',
    subtitulo: 'Genes rotos que delatan el pasado',
    descripcion: 'Los pseudogenes son genes que perdieron su función por mutaciones pero persisten como "fósiles moleculares". Son la evidencia más contundente de evolución molecular: solo tienen sentido si el organismo tuvo un ancestro con ese gen funcional.',
    ejemplo: 'GULOP sintetizaba vitamina C. Está intacto en ratones y perros; roto en humanos, monos y cobayas. Todos tenemos exactamente las mismas mutaciones inactivadoras — heredadas de un ancestro común hace ~63 Ma.',
  },
  {
    id: 'alu',
    icono: '🔁',
    titulo: 'Secuencias Alu',
    subtitulo: 'Retrotransposones como prueba de parentesco',
    descripcion: 'Las secuencias Alu son elementos móviles (retrotransposones) de ~300 pb que se han insertado ~1 millón de veces en el genoma humano (~10% del genoma). Cuando dos especies comparten la misma inserción Alu en exactamente el mismo locus, la probabilidad de coincidencia independiente es virtualmente cero.',
    ejemplo: 'Humanos y chimpancés comparten ~7.000 inserciones Alu en idénticas posiciones genómicas. La probabilidad de que esto ocurra por azar es 10⁻²¹. La única explicación: ancestro común con la inserción.',
  },
  {
    id: 'ervs',
    icono: '🧬',
    titulo: 'Retrovirus endógenos (ERVs)',
    subtitulo: '~8% del genoma son restos de infecciones antiguas',
    descripcion: 'Los endogenous retroviruses son secuencias virales integradas en el ADN germinal hace millones de años. Cuando dos especies comparten el mismo ERV en el mismo locus cromosómico, es porque ambas descienden del individuo en el que ocurrió la integración original.',
    ejemplo: 'El ERV denominado HERV-K11 está integrado en el cromosoma 1 humano y en la misma posición exacta en chimpancés y gorilas. Evidencia de una infección retroviral hace ~6-7 Ma, antes de la separación de linajes.',
  },
];

const NAV_SECCIONES: NavSeccion[] = [
  { id: 'mutaciones', icono: '🔬', titulo: 'Mutaciones', subtitulo: 'Neutral vs Seleccionada' },
  { id: 'reloj',      icono: '⏱️', titulo: 'Reloj Molecular', subtitulo: 'd = 2μt' },
  { id: 'arbol',      icono: '🌳', titulo: 'Árbol Filogenético', subtitulo: 'Constructor visual' },
  { id: 'evidencia',  icono: '🧪', titulo: 'Evidencia', subtitulo: 'Pruebas moleculares' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const secuenciaInicial = (): BaseDna[] =>
  SECUENCIA_INICIAL.split('').map((b, i) => ({ base: b, mutada: false, posicion: i }));

const baseCss = (b: string) => {
  if (b === 'A') return styles.baseA;
  if (b === 'T') return styles.baseT;
  if (b === 'G') return styles.baseG;
  return styles.baseC;
};

const esSinonima = (secuencia: string, posicion: number, nuevaBase: string): boolean => {
  const codonIndex = Math.floor(posicion / 3);
  const baseEnCodon = posicion % 3;
  const startCodon = codonIndex * 3;
  if (startCodon + 3 > secuencia.length) return true;
  const codonOriginal = secuencia.slice(startCodon, startCodon + 3);
  const codonMutado = codonOriginal.slice(0, baseEnCodon) + nuevaBase + codonOriginal.slice(baseEnCodon + 1);
  const aaOriginal = CODON_MAP[codonOriginal] ?? '?';
  const aaMutado = CODON_MAP[codonMutado] ?? '?';
  return aaOriginal === aaMutado;
};

const buildAaSecuencia = (tiempoMa: number, semilla: number): string[] => {
  const result = [...SECUENCIA_ANCESTRAL_AA];
  const numDiferencias = Math.round(tiempoMa * TASA_MUTACION * SECUENCIA_ANCESTRAL_AA.length);
  const posicionesCambiadas = new Set<number>();
  let rng = semilla;
  const nextRng = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return Math.abs(rng); };
  while (posicionesCambiadas.size < Math.min(numDiferencias, SECUENCIA_ANCESTRAL_AA.length)) {
    posicionesCambiadas.add(nextRng() % SECUENCIA_ANCESTRAL_AA.length);
  }
  const aminoacidos = ['A', 'D', 'V', 'K', 'H', 'G', 'P', 'L', 'W', 'E', 'R', 'S', 'T', 'N', 'Q', 'Y', 'F', 'I', 'M', 'C'];
  posicionesCambiadas.forEach(pos => {
    const opciones = aminoacidos.filter(a => a !== result[pos]);
    result[pos] = opciones[nextRng() % opciones.length];
  });
  return result;
};

const calcularDistanciaSecuencias = (a: string[], b: string[]): number =>
  a.reduce((acc, aa, i) => acc + (aa !== b[i] ? 1 : 0), 0);

const contarDiferencias = (s1: string, s2: string): number =>
  s1.split('').reduce((acc, c, i) => acc + (c !== s2[i] ? 1 : 0), 0);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEvolucionMolecular() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('mutaciones');

  // — Sección 1: Mutaciones —
  const [secuenciaDna, setSecuenciaDna] = useState<BaseDna[]>(secuenciaInicial);
  const [historialMutaciones, setHistorialMutaciones] = useState<MutacionRegistro[]>([]);
  const [ultimaMutacion, setUltimaMutacion] = useState<MutacionRegistro | null>(null);

  // — Sección 2: Reloj molecular —
  const [tiempoMa, setTiempoMa] = useState(30);

  // — Sección 3: Árbol filogenético —
  const [conjuntoActivo, setConjuntoActivo] = useState<string>('primates');
  const [especieSelA, setEspecieSelA] = useState<string>('humano');
  const [especieSelB, setEspecieSelB] = useState<string>('chimpance');

  // — Sección 4: Evidencia —
  const [evidenciaActiva, setEvidenciaActiva] = useState<string | null>(null);

  // ── Handlers Mutaciones ──
  const handleMutar = useCallback(() => {
    const posicion = Math.floor(Math.random() * secuenciaDna.length);
    const basesOptions = BASES_DNA.filter(b => b !== secuenciaDna[posicion].base);
    const nuevaBase = basesOptions[Math.floor(Math.random() * basesOptions.length)];
    const secuenciaString = secuenciaDna.map(b => b.base).join('');
    const codificante = posicion < 18; // primeras 18 bases = 6 codones codificantes
    const sinonima = codificante ? esSinonima(secuenciaString, posicion, nuevaBase) : true;
    const mutacion: MutacionRegistro = {
      posicion,
      baseOriginal: secuenciaDna[posicion].base,
      baseNueva: nuevaBase,
      sinonima,
      codificante,
    };
    setSecuenciaDna(prev =>
      prev.map((b, i) => i === posicion ? { ...b, base: nuevaBase, mutada: true } : b)
    );
    setHistorialMutaciones(prev => [...prev, mutacion]);
    setUltimaMutacion(mutacion);
  }, [secuenciaDna]);

  const handleResetDna = useCallback(() => {
    setSecuenciaDna(secuenciaInicial());
    setHistorialMutaciones([]);
    setUltimaMutacion(null);
  }, []);

  const mutacionesTotales = historialMutaciones.length;
  const mutacionesSinonimas = historialMutaciones.filter(m => m.sinonima).length;
  const pctSinonimas = mutacionesTotales > 0 ? Math.round((mutacionesSinonimas / mutacionesTotales) * 100) : 0;
  const pctNoSinonimas = mutacionesTotales > 0 ? 100 - pctSinonimas : 0;

  // ── Datos reloj molecular ──
  const aaLineajeA = buildAaSecuencia(tiempoMa, 42);
  const aaLineajeB = buildAaSecuencia(tiempoMa, 137);
  const diferenciasReloj = calcularDistanciaSecuencias(aaLineajeA, aaLineajeB);
  const divergenciaTotal = (diferenciasReloj / SECUENCIA_ANCESTRAL_AA.length * 100).toFixed(1);
  const maCalculados = tiempoMa > 0 ? tiempoMa : 0;

  // ── Árbol filogenético ──
  const conjuntoData = CONJUNTOS_ESPECIES.find(c => c.id === conjuntoActivo) ?? CONJUNTOS_ESPECIES[0];
  const refSecuencia = conjuntoData.especies[0].secuencia;

  // Calcular matriz de distancias para el árbol SVG simplificado
  const matrizDistancias = conjuntoData.especies.map(sp =>
    conjuntoData.especies.map(sp2 => contarDiferencias(sp.secuencia, sp2.secuencia))
  );

  // Árbol SVG hardcodeado por grupo (topología conocida)
  const arbolPrimates = (
    <svg className={styles.svgArbol} viewBox="0 0 480 280" aria-label="Árbol filogenético de primates">
      {/* Ramas */}
      <line x1="240" y1="250" x2="240" y2="180" stroke="#2E86AB" strokeWidth="2" />
      <line x1="240" y1="180" x2="140" y2="180" stroke="#2E86AB" strokeWidth="2" />
      <line x1="240" y1="180" x2="340" y2="180" stroke="#2E86AB" strokeWidth="2" />
      {/* Clade humano+chimp */}
      <line x1="140" y1="180" x2="140" y2="120" stroke="#2E86AB" strokeWidth="2" />
      <line x1="140" y1="120" x2="90" y2="120" stroke="#48A9A6" strokeWidth="2" />
      <line x1="140" y1="120" x2="190" y2="120" stroke="#48A9A6" strokeWidth="2" />
      <line x1="90" y1="120" x2="90" y2="60" stroke="#48A9A6" strokeWidth="2" />
      <line x1="190" y1="120" x2="190" y2="60" stroke="#48A9A6" strokeWidth="2" />
      {/* Gorila */}
      <line x1="140" y1="180" x2="140" y2="60" stroke="#48A9A6" strokeWidth="2" strokeDasharray="4,4" />
      {/* Orangutan */}
      <line x1="340" y1="180" x2="340" y2="120" stroke="#2E86AB" strokeWidth="2" />
      <line x1="340" y1="120" x2="310" y2="60" stroke="#7FB3D3" strokeWidth="2" />
      {/* Gibon */}
      <line x1="340" y1="180" x2="390" y2="60" stroke="#7FB3D3" strokeWidth="2" />
      {/* Etiquetas */}
      <text x="90" y="50" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="600">Humano</text>
      <text x="190" y="50" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="600">Chimp.</text>
      <text x="140" y="50" textAnchor="middle" fill="#48A9A6" fontSize="11" fontWeight="600">Gorila</text>
      <text x="310" y="50" textAnchor="middle" fill="#666" fontSize="11">Orangután</text>
      <text x="390" y="50" textAnchor="middle" fill="#666" fontSize="11">Gibón</text>
      {/* Nodo MRCA humano+chimp */}
      <circle cx="140" cy="120" r="5" fill="#48A9A6" />
      {/* Nodo raíz */}
      <circle cx="240" cy="180" r="6" fill="#2E86AB" />
      <text x="240" y="272" textAnchor="middle" fill="#999" fontSize="10">Ancestro común ~25 Ma</text>
    </svg>
  );

  const arbolCetaceos = (
    <svg className={styles.svgArbol} viewBox="0 0 480 280" aria-label="Árbol filogenético de cetáceos">
      <line x1="240" y1="250" x2="240" y2="180" stroke="#2E86AB" strokeWidth="2" />
      <line x1="240" y1="180" x2="130" y2="180" stroke="#2E86AB" strokeWidth="2" />
      <line x1="240" y1="180" x2="360" y2="180" stroke="#2E86AB" strokeWidth="2" />
      {/* Clade ballena+delfin */}
      <line x1="130" y1="180" x2="130" y2="120" stroke="#48A9A6" strokeWidth="2" />
      <line x1="130" y1="120" x2="80" y2="60" stroke="#48A9A6" strokeWidth="2" />
      <line x1="130" y1="120" x2="180" y2="60" stroke="#48A9A6" strokeWidth="2" />
      {/* Clade vaca+hipo */}
      <line x1="360" y1="180" x2="360" y2="120" stroke="#2E86AB" strokeWidth="2" />
      <line x1="360" y1="120" x2="310" y2="60" stroke="#7FB3D3" strokeWidth="2" />
      <line x1="360" y1="120" x2="400" y2="60" stroke="#7FB3D3" strokeWidth="2" />
      {/* Cerdo */}
      <line x1="240" y1="180" x2="240" y2="60" stroke="#2E86AB" strokeWidth="2" strokeDasharray="4,4" />
      {/* Etiquetas */}
      <text x="80" y="50" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="600">Ballena</text>
      <text x="180" y="50" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="600">Delfín</text>
      <text x="240" y="50" textAnchor="middle" fill="#48A9A6" fontSize="11">Cerdo</text>
      <text x="310" y="50" textAnchor="middle" fill="#666" fontSize="11">Vaca</text>
      <text x="400" y="50" textAnchor="middle" fill="#666" fontSize="11">Hipop.</text>
      <circle cx="130" cy="120" r="5" fill="#48A9A6" />
      <circle cx="240" cy="180" r="6" fill="#2E86AB" />
      <text x="240" y="272" textAnchor="middle" fill="#999" fontSize="10">Divergencia artiodáctilos ~55 Ma</text>
    </svg>
  );

  // MRCA info
  const especieObjA = conjuntoData.especies.find(e => e.id === especieSelA);
  const especieObjB = conjuntoData.especies.find(e => e.id === especieSelB);
  const difMrca = especieObjA && especieObjB ? contarDiferencias(especieObjA.secuencia, especieObjB.secuencia) : 0;

  const mrcaDescripciones: Record<string, Record<string, string>> = {
    primates: {
      'humano-chimpance': 'El MRCA de humano y chimpancé vivió hace ~6-7 Ma en África. Diferencias de ~1,2% en ADN codificante.',
      'humano-gorila': 'El MRCA de los tres grandes simios africanos vivió hace ~8-9 Ma.',
      'humano-orangutan': 'La separación del linaje orangután ocurrió hace ~12-15 Ma (Mioceno).',
      'humano-gibon': 'Los gibones (Hylobatidae) divergieron hace ~20-25 Ma.',
      'chimpance-gorila': 'Chimpancé y gorila son más cercanos entre sí que cualquiera de ellos con el orangután.',
      'ballena-delfin': 'Ballenas y delfines comparten MRCA hace ~35 Ma. Ambos son cetáceos derivados de artiodáctilos.',
      default: 'Selecciona dos especies para ver su ancestro común más reciente (MRCA).',
    },
    cetaceos: {
      'ballena-delfin': 'Ballenas y delfines (Cetacea) divergieron hace ~35 Ma. Ambos descienden de artiodáctilos terrestres.',
      'ballena-vaca': 'Cetáceos y bóvidos comparten ancestro hace ~55 Ma. La vaca es más pariente de la ballena que del caballo.',
      'ballena-hipopotamo': 'Los hipopótamos (Hippopotamidae) son el pariente terrestre más cercano a los cetáceos (~53 Ma).',
      'delfin-vaca': 'Delfines y vacas comparten ancestro artiodáctilo hace ~55 Ma.',
      default: 'Selecciona dos especies para ver su ancestro común más reciente (MRCA).',
    },
  };

  const getMrcaDescripcion = (): string => {
    if (!especieSelA || !especieSelB || especieSelA === especieSelB) {
      return 'Selecciona dos especies distintas para ver su MRCA.';
    }
    const clave = `${especieSelA}-${especieSelB}`;
    const claveInv = `${especieSelB}-${especieSelA}`;
    const mapa = mrcaDescripciones[conjuntoActivo] ?? {};
    return mapa[clave] ?? mapa[claveInv] ?? mapa.default ?? 'Selecciona dos especies para ver su ancestro común más reciente.';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🧬</span> Evolución Molecular</h1>
        <p className={styles.subtitle}>
          Cómo mutan las secuencias de ADN, cómo el reloj molecular mide el tiempo evolutivo
          y cómo se reconstruye la historia de la vida desde el genoma
        </p>
      </header>

      <LegalNotice />

      {/* Navegación */}
      <nav aria-label="Secciones del visualizador">
        <div className={styles.navSecciones}>
          {NAV_SECCIONES.map(s => (
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
        </div>
      </nav>

      {/* ─── Sección 1: Mutaciones ─── */}
      {seccionActiva === 'mutaciones' && (
        <section className={styles.seccionContent} aria-labelledby="titulo-mutaciones">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-mutaciones" className={styles.seccionTitulo}>Mutaciones neutrales vs seleccionadas</h2>
            <p className={styles.seccionSubtitulo}>
              Introduce mutaciones en una secuencia de ADN y observa si cambian el aminoácido
            </p>
          </div>

          <div className={styles.simulacionZona}>
            <h3 className={styles.simulacionTitulo}>Secuencia de ADN (21 bases)</h3>
            <p className={styles.simulacionDesc}>
              Las posiciones 1-18 son codificantes (6 codones). Las posiciones 19-21 son no codificantes.
              Cada clic introduce una mutación aleatoria.
            </p>

            <div className={styles.secuenciaPosicion}>
              {secuenciaDna.map((b, i) => (
                <span key={i} className={styles.posNum}>{i + 1}</span>
              ))}
            </div>
            <div className={styles.secuenciaDna} role="img" aria-label="Secuencia de ADN con mutaciones">
              {secuenciaDna.map((b, i) => (
                <span
                  key={i}
                  className={`${styles.base} ${baseCss(b.base)} ${b.mutada ? styles.baseMutada : ''}`}
                  title={`Posición ${i + 1}: ${b.base}${b.mutada ? ' (mutada)' : ''}`}
                >
                  {b.base}
                </span>
              ))}
            </div>

            {ultimaMutacion && (
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <span className={`${styles.clasificacionBadge} ${ultimaMutacion.sinonima ? styles.badgeNeutra : styles.badgeSeleccion}`}>
                  {ultimaMutacion.sinonima ? '✓ Mutación sinónima (neutra)' : '⚠ Mutación no sinónima (cambia aminoácido)'}
                </span>
                <div className={styles.infoMutacion}>
                  Posición <strong>{ultimaMutacion.posicion + 1}</strong>:{' '}
                  <strong>{ultimaMutacion.baseOriginal}</strong> → <strong>{ultimaMutacion.baseNueva}</strong>
                  {' · '}
                  {ultimaMutacion.codificante ? 'Región codificante' : 'Región no codificante'}
                  {' · '}
                  {ultimaMutacion.sinonima
                    ? 'El aminoácido NO cambia. La selección natural no puede actuar sobre ella — probable fijación por deriva génica (teoría neutralista de Kimura).'
                    : 'El aminoácido SÍ cambia. Puede ser beneficiosa, perjudicial o neutra según el contexto funcional de la proteína.'}
                </div>
              </div>
            )}

            <div className={styles.estadMutaciones}>
              <div className={styles.estadCard}>
                <div className={styles.estadNumero}>{mutacionesTotales}</div>
                <div className={styles.estadLabel}>mutaciones totales</div>
              </div>
              <div className={styles.estadCard}>
                <div className={styles.estadNumero}>{mutacionesSinonimas}</div>
                <div className={styles.estadLabel}>sinónimas (neutras)</div>
              </div>
              <div className={styles.estadCard}>
                <div className={styles.estadNumero}>{mutacionesTotales - mutacionesSinonimas}</div>
                <div className={styles.estadLabel}>no sinónimas</div>
              </div>
            </div>

            {mutacionesTotales > 0 && (
              <div className={styles.miniGrafico}>
                <p className={styles.miniGraficoTitulo}>Proporción acumulada de mutaciones</p>
                <div className={styles.barraContenedor}>
                  <span className={styles.barraLabel}>Sinónimas</span>
                  <div className={styles.barraTrack}>
                    <div className={`${styles.barraFill} ${styles.barraSinonima}`} style={{ width: `${pctSinonimas}%` }} />
                  </div>
                  <span className={styles.barraValor}>{pctSinonimas}%</span>
                </div>
                <div className={styles.barraContenedor}>
                  <span className={styles.barraLabel}>No sinónimas</span>
                  <div className={styles.barraTrack}>
                    <div className={`${styles.barraFill} ${styles.barraNoSinonima}`} style={{ width: `${pctNoSinonimas}%` }} />
                  </div>
                  <span className={styles.barraValor}>{pctNoSinonimas}%</span>
                </div>
              </div>
            )}

            <div className={styles.botones}>
              <button type="button" className={styles.btnPrimario} onClick={handleMutar} aria-label="Introducir mutación aleatoria">
                🔬 Mutar
              </button>
              <button type="button" className={styles.btnSecundario} onClick={handleResetDna} aria-label="Resetear secuencia original">
                Reiniciar
              </button>
            </div>
          </div>

          <div className={styles.infoMutacion}>
            <strong>Teoría neutralista de Kimura (1968):</strong> La mayor parte de las mutaciones fijadas en la evolución son
            neutras — ni beneficiosas ni perjudiciales. No son eliminadas por la selección natural ni favorecidas; simplemente
            se fijan por deriva génica en poblaciones finitas. Las mutaciones sinónimas son el ejemplo más claro: cambian el
            codón pero no el aminoácido, por lo que la proteína final es idéntica.
          </div>
        </section>
      )}

      {/* ─── Sección 2: Reloj Molecular ─── */}
      {seccionActiva === 'reloj' && (
        <section className={styles.seccionContent} aria-labelledby="titulo-reloj">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-reloj" className={styles.seccionTitulo}>Reloj molecular</h2>
            <p className={styles.seccionSubtitulo}>
              Las secuencias acumulan mutaciones a ritmo constante — eso permite datar divergencias
            </p>
          </div>

          <div className={styles.simulacionZona}>
            <h3 className={styles.simulacionTitulo}>Citocromo c simplificado (10 aminoácidos)</h3>
            <p className={styles.simulacionDesc}>
              Mueve el slider para simular el paso del tiempo desde una divergencia. Ambas secuencias parten del mismo ancestro
              y acumulan cambios de aminoácidos de forma independiente.
            </p>

            <div className={styles.dosSecuencias}>
              <div className={styles.secuenciaBloque}>
                <div className={styles.secuenciaEspecie}>Linaje A</div>
                <div className={styles.secuenciaAa}>
                  {aaLineajeA.map((aa, i) => (
                    <span
                      key={i}
                      className={`${styles.aa} ${aa !== SECUENCIA_ANCESTRAL_AA[i] ? styles.aaDiferente : ''}`}
                      title={aa !== SECUENCIA_ANCESTRAL_AA[i] ? `Cambio de ${SECUENCIA_ANCESTRAL_AA[i]} a ${aa}` : `${aa} (conservado)`}
                    >
                      {aa}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.secuenciaBloque}>
                <div className={styles.secuenciaEspecie}>Linaje B</div>
                <div className={styles.secuenciaAa}>
                  {aaLineajeB.map((aa, i) => (
                    <span
                      key={i}
                      className={`${styles.aa} ${aa !== SECUENCIA_ANCESTRAL_AA[i] ? styles.aaDiferente : ''}`}
                      title={aa !== SECUENCIA_ANCESTRAL_AA[i] ? `Cambio de ${SECUENCIA_ANCESTRAL_AA[i]} a ${aa}` : `${aa} (conservado)`}
                    >
                      {aa}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.relojSlider}>
              <div className={styles.sliderLabel}>
                <span className={styles.sliderTitulo}>Tiempo desde divergencia</span>
                <span className={styles.sliderValor}>{tiempoMa} Ma</span>
              </div>
              <input
                type="range"
                className={styles.inputRange}
                min="0"
                max="100"
                value={tiempoMa}
                onChange={e => setTiempoMa(Number(e.target.value))}
                aria-label="Tiempo desde divergencia en millones de años"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>0 Ma (ancestro común)</span>
                <span>100 Ma</span>
              </div>
            </div>

            <div className={styles.formulaReloj}>
              <div className={styles.formulaTexto}>d = 2μt</div>
              <div className={styles.formulaExplicacion}>
                d = divergencia total · μ = tasa de mutación por Ma · t = tiempo desde divergencia (Ma)
              </div>
            </div>

            <div className={styles.resultadoReloj}>
              <div className={styles.resultadoCard}>
                <div className={styles.resultadoValor}>{diferenciasReloj}</div>
                <div className={styles.resultadoLabel}>diferencias entre A y B</div>
              </div>
              <div className={styles.resultadoCard}>
                <div className={styles.resultadoValor}>{divergenciaTotal}%</div>
                <div className={styles.resultadoLabel}>divergencia</div>
              </div>
              <div className={styles.resultadoCard}>
                <div className={styles.resultadoValor}>{maCalculados} Ma</div>
                <div className={styles.resultadoLabel}>estimación datación</div>
              </div>
            </div>

            <p className={styles.simulacionTitulo} style={{ marginTop: '1rem', fontSize: '1rem' }}>
              Tasas de evolución molecular reales
            </p>
            <div className={styles.ejemplosProteinas}>
              {[
                { nombre: 'Pseudogenes', tasa: '~0,5% por Ma', detalle: 'sin presión selectiva' },
                { nombre: 'Histona H4', tasa: '~0,006% por Ma', detalle: 'máxima conservación' },
                { nombre: 'Citocromo c', tasa: '~0,3% por Ma', detalle: 'proteína mitocondrial' },
                { nombre: 'Hemoglobina α', tasa: '~0,1% por Ma', detalle: 'transporte O₂' },
                { nombre: 'Fibrinopéptidos', tasa: '~0,9% por Ma', detalle: 'poca restricción' },
              ].map(p => (
                <div key={p.nombre} className={styles.proteínaFila}>
                  <span className={styles.proteínaLabel}>{p.nombre}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.detalle}</span>
                  <span className={styles.proteínaValor}>{p.tasa}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Sección 3: Árbol Filogenético ─── */}
      {seccionActiva === 'arbol' && (
        <section className={styles.seccionContent} aria-labelledby="titulo-arbol">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-arbol" className={styles.seccionTitulo}>Constructor de árbol filogenético</h2>
            <p className={styles.seccionSubtitulo}>
              Alinea secuencias de ADN y observa cómo las diferencias revelan relaciones evolutivas
            </p>
          </div>

          <div className={styles.selectorConjunto}>
            {CONJUNTOS_ESPECIES.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.conjuntoBtn} ${conjuntoActivo === c.id ? styles.conjuntoActivo : ''}`}
                onClick={() => {
                  setConjuntoActivo(c.id);
                  setEspecieSelA(c.especies[0].id);
                  setEspecieSelB(c.especies[1].id);
                }}
                aria-pressed={conjuntoActivo === c.id}
              >
                <div className={styles.conjuntoBtnNombre}>{c.nombre}</div>
                <div className={styles.conjuntoBtnDesc}>{c.descripcion}</div>
              </button>
            ))}
          </div>

          <div className={styles.simulacionZona}>
            <h3 className={styles.simulacionTitulo}>Alineamiento de secuencias (12 bases)</h3>
            <p className={styles.simulacionDesc}>
              Las bases resaltadas en rojo difieren de la primera secuencia (referencia).
            </p>
            <div className={styles.tablasAlineamiento}>
              <div className={styles.alineamientoGrid}>
                {conjuntoData.especies.map(sp => (
                  <div key={sp.id} className={styles.alineamientoFila}>
                    <span className={styles.especieLabel}>{sp.nombre.split(' ').slice(-1)[0]}</span>
                    <div className={styles.alineamientoSecuencia}>
                      {sp.secuencia.split('').map((b, i) => (
                        <span
                          key={i}
                          className={`${styles.alineamientoBase} ${b !== refSecuencia[i] ? styles.alineamientoBaseDif : ''}`}
                          title={b !== refSecuencia[i] ? `Diferencia con referencia: ${refSecuencia[i]}→${b}` : `${b} (conservada)`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {conjuntoActivo === 'primates' ? arbolPrimates : arbolCetaceos}

            <h3 className={styles.simulacionTitulo} style={{ marginTop: '1rem', fontSize: '1rem' }}>
              Selecciona dos especies para ver su MRCA
            </h3>
            <p className={styles.simulacionDesc}>
              MRCA = Most Recent Common Ancestor (Ancestro Común Más Reciente)
            </p>

            <div className={styles.especieSelGrid}>
              {conjuntoData.especies.map(sp => (
                <button
                  key={sp.id}
                  type="button"
                  className={`${styles.especieSelBtn} ${(especieSelA === sp.id || especieSelB === sp.id) ? styles.especieSelActiva : ''}`}
                  onClick={() => {
                    if (especieSelA === sp.id) {
                      setEspecieSelA('');
                    } else if (especieSelB === sp.id) {
                      setEspecieSelB('');
                    } else if (!especieSelA) {
                      setEspecieSelA(sp.id);
                    } else if (!especieSelB) {
                      setEspecieSelB(sp.id);
                    } else {
                      setEspecieSelA(sp.id);
                      setEspecieSelB('');
                    }
                  }}
                  aria-pressed={especieSelA === sp.id || especieSelB === sp.id}
                >
                  {sp.nombre.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className={styles.mrcaInfo} role="region" aria-live="polite">
              <div className={styles.mrcaTitulo}>
                MRCA: {especieObjA?.nombre.split(' ')[0] ?? '—'} + {especieObjB?.nombre.split(' ')[0] ?? '—'}
                {difMrca > 0 && <span> · {difMrca} diferencia{difMrca !== 1 ? 's' : ''} en secuencia</span>}
              </div>
              <div className={styles.mrcaDescripcion}>{getMrcaDescripcion()}</div>
            </div>

            <div className={styles.infoMutacion}>
              <strong>Distancia de Hamming entre secuencias</strong> (nº de posiciones diferentes):
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px', marginTop: '0.5rem', fontSize: '0.78rem' }}>
                {conjuntoData.especies.map(sp => {
                  const idxA = conjuntoData.especies.findIndex(e => e.id === sp.id);
                  return conjuntoData.especies.slice(idxA + 1).map(sp2 => {
                    const idxB = conjuntoData.especies.findIndex(e => e.id === sp2.id);
                    return (
                      <span key={`${sp.id}-${sp2.id}`} style={{ background: 'var(--hover)', padding: '2px 6px', borderRadius: '4px' }}>
                        {sp.nombre.split(' ')[0]} / {sp2.nombre.split(' ')[0]}: <strong>{matrizDistancias[idxA][idxB]}</strong>
                      </span>
                    );
                  });
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Sección 4: Evidencia Molecular ─── */}
      {seccionActiva === 'evidencia' && (
        <section className={styles.seccionContent} aria-labelledby="titulo-evidencia">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-evidencia" className={styles.seccionTitulo}>Evidencia molecular de la evolución</h2>
            <p className={styles.seccionSubtitulo}>
              Cuatro tipos de evidencias genómicas que solo tienen sentido bajo la evolución
            </p>
          </div>

          <div className={styles.evidenciaGrid}>
            {EVIDENCIAS.map(ev => (
              <button
                key={ev.id}
                type="button"
                className={`${styles.evidenciaCard} ${evidenciaActiva === ev.id ? styles.evidenciaActiva : ''}`}
                onClick={() => setEvidenciaActiva(prev => prev === ev.id ? null : ev.id)}
                aria-expanded={evidenciaActiva === ev.id}
              >
                <div className={styles.evidenciaIcono} aria-hidden="true">{ev.icono}</div>
                <div className={styles.evidenciaTitulo}>{ev.titulo}</div>
                <div className={styles.evidenciaSubtitulo}>{ev.subtitulo}</div>
                {evidenciaActiva === ev.id && (
                  <div className={styles.evidenciaDetalle}>
                    {ev.descripcion}
                    <div className={styles.evidenciaEjemplo}>{ev.ejemplo}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── EducationalSection v2.0 ─── */}
      <EducationalSection
        title="Evolución Molecular: del ADN a la Historia de la Vida"
        subtitle="Cómo las secuencias genéticas registran y revelan 4.000 millones de años de evolución"
      >
        <div>
          <h3>De Darwin a Kimura: la síntesis moderna y la teoría neutralista</h3>
          <p>
            Darwin explicó la evolución por selección natural, pero no sabía nada de genes. La síntesis
            moderna (1940s) unió la genética mendeliana con la teoría evolutiva. En 1968, Motoo Kimura
            propuso un giro radical: la mayoría de las mutaciones que se fijan en las poblaciones no son
            beneficiosas ni perjudiciales, sino neutras. La selección natural las ignora; se fijan por puro
            azar en poblaciones finitas (deriva génica). Esta teoría neutralista no contradice a Darwin —
            la selección sigue siendo el motor de la adaptación — pero explica la enorme variabilidad
            genética que observamos dentro de una misma especie.
          </p>

          <h3>El reloj molecular: cómo el ADN registra el tiempo evolutivo</h3>
          <p>
            Si las mutaciones neutras se acumulan a ritmo constante, las secuencias funcionan como un
            reloj molecular. Cuanto más tiempo llevan dos linajes separados, más diferencias acumulan en sus
            secuencias. Con una tasa de mutación calibrada sobre fósiles de fecha conocida, podemos
            calcular cuándo divergieron dos especies sin necesitar un solo hueso. La fórmula d = 2μt (donde
            d es la divergencia observada, μ la tasa de mutación y t el tiempo desde la divergencia) permite
            fechar separaciones evolutivas con precisión de millones de años. El citocromo c ha evolucionado
            a ~0,3% por millón de años; los pseudogenes, sin presión selectiva, a ~0,5%.
          </p>

          <h3>Bioinformática: BLAST, CLUSTAL y la revolución de la secuenciación masiva</h3>
          <p>
            BLAST (Basic Local Alignment Search Tool) compara una secuencia nueva contra bases de datos de
            millones de secuencias conocidas en segundos. CLUSTAL realiza alineamientos múltiples para
            comparar simultáneamente decenas de especies. La secuenciación de nueva generación (NGS, desde
            2005) redujo el coste de secuenciar un genoma humano de 3.000 millones de dólares (Proyecto
            Genoma Humano) a menos de 500 euros actuales. Hoy existen más de 250 millones de secuencias en
            GenBank. Esta explosión de datos ha confirmado, en cada caso, las predicciones de la teoría
            evolutiva molecular.
          </p>

          <h3>Árbol de la vida molecular: los tres dominios desde el ARNr 16S</h3>
          <p>
            En 1977, Carl Woese revolucionó la clasificación de la vida al secuenciar el ARN ribosomal 16S
            (ARNr 16S), una molécula presente en TODOS los seres vivos y muy conservada. Sus diferencias
            de secuencia revelan que la vida se divide en tres dominios: Bacteria, Archaea y Eukarya.
            Curiosamente, las arqueas son más cercanas a los eucariotas (nosotros incluidos) que a las
            bacterias. El árbol de la vida molecular, construido a partir del ARNr 16S, es hoy el mapa
            más fiable de las relaciones entre todos los organismos del planeta.
          </p>

          <h3>La paradoja de la conservación: ¿por qué algunas secuencias no cambian en 3.000 Ma?</h3>
          <p>
            La histona H4 —proteína que empaqueta el ADN en los cromosomas— es prácticamente idéntica en
            humanos y en levaduras. Sus 102 aminoácidos llevan 3.000 Ma sin cambiar significativamente.
            Esto no contradice la teoría neutralista: significa que casi cualquier mutación en H4 es letal
            o muy perjudicial. La selección purificadora elimina todas las variantes. La conservación
            extrema es evidencia de función extrema: esa secuencia no puede cambiar porque cualquier
            cambio mata al organismo. El contraste con los pseudogenes —que evolucionan libremente porque
            no importan— hace de la comparativa de tasas de evolución una herramienta diagnóstica para
            determinar qué regiones genómicas son funcionalmente críticas.
          </p>

          <h3>MRCA y LUCA: el ancestro de todos los seres vivos</h3>
          <p>
            El MRCA (Most Recent Common Ancestor) es el ancestro común más reciente de dos o más organismos.
            Extrapolando el árbol de la vida hasta su raíz, llegamos a LUCA — Last Universal Common Ancestor.
            LUCA no fue "el primer ser vivo", sino el último ancestro del que descienden TODOS los seres vivos
            actuales. Vivió hace aproximadamente 3.500-4.000 Ma y ya poseía ADN, ribosomas, membrana celular
            y el código genético universal. Lo sabemos porque todos los seres vivos comparten esos rasgos.
            La universalidad del código genético — el mismo codón ATG codifica metionina tanto en bacterias
            como en humanos — es la prueba más poderosa de que todos descendemos de un único ancestro.
          </p>

          <div className={styles.warningBox}>
            <strong>La huella literal del parentesco:</strong> El citocromo c es prácticamente idéntico en
            humanos y levaduras. Compartir el 60% del ADN con una mosca de la fruta no es metáfora — es la
            huella literal de un ancestro común hace 800 Ma. Cada gen que el humano y la mosca tienen en
            común, con sus mismas funciones y secuencias similares, es un dato molecular que solo tiene
            una explicación coherente: ambos los heredamos del mismo antepasado. La evolución molecular
            no es una interpretación: es una lectura directa de los registros escritos en cada célula
            de cada ser vivo del planeta.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-evolucion-molecular')} />
      <ShareCard appName="visualizador-evolucion-molecular" />
      <Footer appName="visualizador-evolucion-molecular" />
    </div>
  );
}
