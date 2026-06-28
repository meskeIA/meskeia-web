'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './AdnCodigoGenetico.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'helice' | 'transcripcion' | 'traduccion' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'helice', titulo: 'La Doble Hélice', icono: '🧬', subtitulo: 'Estructura del ADN' },
  { id: 'transcripcion', titulo: 'Transcripción', icono: '📋', subtitulo: 'ADN → ARN mensajero' },
  { id: 'traduccion', titulo: 'Traducción', icono: '🔤', subtitulo: 'Codones → Proteína' },
  { id: 'datos', titulo: 'Datos y Mutaciones', icono: '⚡', subtitulo: 'Dogma central y CRISPR' },
];

// ─────────────────────────────────────────────
// Bases nitrogenadas
// ─────────────────────────────────────────────

interface Base {
  letra: string;
  nombre: string;
  tipo: string;
  complementaria: string;
  color: string;
  colorClaro: string;
  enARN: string;
}

const BASES: Base[] = [
  { letra: 'A', nombre: 'Adenina', tipo: 'Purina', complementaria: 'T', color: '#27AE60', colorClaro: 'rgba(39,174,96,0.12)', enARN: 'U' },
  { letra: 'T', nombre: 'Timina', tipo: 'Pirimidina', complementaria: 'A', color: '#E74C3C', colorClaro: 'rgba(231,76,60,0.12)', enARN: 'A' },
  { letra: 'G', nombre: 'Guanina', tipo: 'Purina', complementaria: 'C', color: '#F1C40F', colorClaro: 'rgba(241,196,15,0.12)', enARN: 'C' },
  { letra: 'C', nombre: 'Citosina', tipo: 'Pirimidina', complementaria: 'G', color: '#2E86AB', colorClaro: 'rgba(46,134,171,0.12)', enARN: 'G' },
];

// ─────────────────────────────────────────────
// Tabla de codones
// ─────────────────────────────────────────────

interface Codon {
  triplete: string;
  aminoacido: string;
  abrev: string;
  color: string;
}

const CODONES: Codon[] = [
  // Fenilalanina
  { triplete: 'UUU', aminoacido: 'Fenilalanina', abrev: 'Phe', color: '#E74C3C' },
  { triplete: 'UUC', aminoacido: 'Fenilalanina', abrev: 'Phe', color: '#E74C3C' },
  // Leucina
  { triplete: 'UUA', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  { triplete: 'UUG', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  { triplete: 'CUU', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  { triplete: 'CUC', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  { triplete: 'CUA', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  { triplete: 'CUG', aminoacido: 'Leucina', abrev: 'Leu', color: '#E67E22' },
  // Isoleucina
  { triplete: 'AUU', aminoacido: 'Isoleucina', abrev: 'Ile', color: '#F39C12' },
  { triplete: 'AUC', aminoacido: 'Isoleucina', abrev: 'Ile', color: '#F39C12' },
  { triplete: 'AUA', aminoacido: 'Isoleucina', abrev: 'Ile', color: '#F39C12' },
  // Metionina (INICIO)
  { triplete: 'AUG', aminoacido: 'Met (INICIO)', abrev: 'Met', color: '#2ECC71' },
  // Valina
  { triplete: 'GUU', aminoacido: 'Valina', abrev: 'Val', color: '#1ABC9C' },
  { triplete: 'GUC', aminoacido: 'Valina', abrev: 'Val', color: '#1ABC9C' },
  { triplete: 'GUA', aminoacido: 'Valina', abrev: 'Val', color: '#1ABC9C' },
  { triplete: 'GUG', aminoacido: 'Valina', abrev: 'Val', color: '#1ABC9C' },
  // Serina
  { triplete: 'UCU', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  { triplete: 'UCC', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  { triplete: 'UCA', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  { triplete: 'UCG', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  { triplete: 'AGU', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  { triplete: 'AGC', aminoacido: 'Serina', abrev: 'Ser', color: '#3498DB' },
  // Prolina
  { triplete: 'CCU', aminoacido: 'Prolina', abrev: 'Pro', color: '#9B59B6' },
  { triplete: 'CCC', aminoacido: 'Prolina', abrev: 'Pro', color: '#9B59B6' },
  { triplete: 'CCA', aminoacido: 'Prolina', abrev: 'Pro', color: '#9B59B6' },
  { triplete: 'CCG', aminoacido: 'Prolina', abrev: 'Pro', color: '#9B59B6' },
  // Treonina
  { triplete: 'ACU', aminoacido: 'Treonina', abrev: 'Thr', color: '#2E86AB' },
  { triplete: 'ACC', aminoacido: 'Treonina', abrev: 'Thr', color: '#2E86AB' },
  { triplete: 'ACA', aminoacido: 'Treonina', abrev: 'Thr', color: '#2E86AB' },
  { triplete: 'ACG', aminoacido: 'Treonina', abrev: 'Thr', color: '#2E86AB' },
  // Alanina
  { triplete: 'GCU', aminoacido: 'Alanina', abrev: 'Ala', color: '#48A9A6' },
  { triplete: 'GCC', aminoacido: 'Alanina', abrev: 'Ala', color: '#48A9A6' },
  { triplete: 'GCA', aminoacido: 'Alanina', abrev: 'Ala', color: '#48A9A6' },
  { triplete: 'GCG', aminoacido: 'Alanina', abrev: 'Ala', color: '#48A9A6' },
  // Tirosina
  { triplete: 'UAU', aminoacido: 'Tirosina', abrev: 'Tyr', color: '#D35400' },
  { triplete: 'UAC', aminoacido: 'Tirosina', abrev: 'Tyr', color: '#D35400' },
  // STOP
  { triplete: 'UAA', aminoacido: 'STOP', abrev: '---', color: '#7F8C8D' },
  { triplete: 'UAG', aminoacido: 'STOP', abrev: '---', color: '#7F8C8D' },
  { triplete: 'UGA', aminoacido: 'STOP', abrev: '---', color: '#7F8C8D' },
  // Histidina
  { triplete: 'CAU', aminoacido: 'Histidina', abrev: 'His', color: '#C0392B' },
  { triplete: 'CAC', aminoacido: 'Histidina', abrev: 'His', color: '#C0392B' },
  // Glutamina
  { triplete: 'CAA', aminoacido: 'Glutamina', abrev: 'Gln', color: '#8E44AD' },
  { triplete: 'CAG', aminoacido: 'Glutamina', abrev: 'Gln', color: '#8E44AD' },
  // Asparagina
  { triplete: 'AAU', aminoacido: 'Asparagina', abrev: 'Asn', color: '#16A085' },
  { triplete: 'AAC', aminoacido: 'Asparagina', abrev: 'Asn', color: '#16A085' },
  // Lisina
  { triplete: 'AAA', aminoacido: 'Lisina', abrev: 'Lys', color: '#2980B9' },
  { triplete: 'AAG', aminoacido: 'Lisina', abrev: 'Lys', color: '#2980B9' },
  // Ácido aspártico
  { triplete: 'GAU', aminoacido: 'Ác. aspártico', abrev: 'Asp', color: '#27AE60' },
  { triplete: 'GAC', aminoacido: 'Ác. aspártico', abrev: 'Asp', color: '#27AE60' },
  // Ácido glutámico
  { triplete: 'GAA', aminoacido: 'Ác. glutámico', abrev: 'Glu', color: '#F1C40F' },
  { triplete: 'GAG', aminoacido: 'Ác. glutámico', abrev: 'Glu', color: '#F1C40F' },
  // Cisteína
  { triplete: 'UGU', aminoacido: 'Cisteína', abrev: 'Cys', color: '#BDC3C7' },
  { triplete: 'UGC', aminoacido: 'Cisteína', abrev: 'Cys', color: '#BDC3C7' },
  // Triptófano
  { triplete: 'UGG', aminoacido: 'Triptófano', abrev: 'Trp', color: '#34495E' },
  // Arginina
  { triplete: 'CGU', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  { triplete: 'CGC', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  { triplete: 'CGA', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  { triplete: 'CGG', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  { triplete: 'AGA', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  { triplete: 'AGG', aminoacido: 'Arginina', abrev: 'Arg', color: '#E91E63' },
  // Glicina
  { triplete: 'GGU', aminoacido: 'Glicina', abrev: 'Gly', color: '#95A5A6' },
  { triplete: 'GGC', aminoacido: 'Glicina', abrev: 'Gly', color: '#95A5A6' },
  { triplete: 'GGA', aminoacido: 'Glicina', abrev: 'Gly', color: '#95A5A6' },
  { triplete: 'GGG', aminoacido: 'Glicina', abrev: 'Gly', color: '#95A5A6' },
];

// ─────────────────────────────────────────────
// Diferencias ADN vs ARN
// ─────────────────────────────────────────────

interface Diferencia {
  aspecto: string;
  adn: string;
  arn: string;
}

const DIFERENCIAS: Diferencia[] = [
  { aspecto: 'Cadenas', adn: '2 (doble hélice)', arn: '1 (cadena simple)' },
  { aspecto: 'Azúcar', adn: 'Desoxirribosa', arn: 'Ribosa' },
  { aspecto: 'Bases', adn: 'A, T, G, C', arn: 'A, U, G, C' },
  { aspecto: 'Ubicación', adn: 'Núcleo', arn: 'Núcleo → Citoplasma' },
  { aspecto: 'Función', adn: 'Almacena información', arn: 'Transmite y ejecuta' },
  { aspecto: 'Estabilidad', adn: 'Muy estable', arn: 'Menos estable' },
];

// ─────────────────────────────────────────────
// Pasos de transcripción
// ─────────────────────────────────────────────

interface PasoTranscripcion {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

const PASOS_TRANSCRIPCION: PasoTranscripcion[] = [
  { numero: 1, titulo: 'Inicio', descripcion: 'La ARN polimerasa se une al promotor del gen en el ADN', icono: '🔓' },
  { numero: 2, titulo: 'Apertura', descripcion: 'Se separan las dos cadenas de ADN (se abre la doble hélice)', icono: '📖' },
  { numero: 3, titulo: 'Síntesis', descripcion: 'Lee la cadena molde 3\'→5\' y sintetiza mRNA 5\'→3\' (A→U, T→A, G→C, C→G)', icono: '✏️' },
  { numero: 4, titulo: 'Terminación', descripcion: 'La polimerasa llega a una señal de terminación y se libera el mRNA', icono: '🏁' },
  { numero: 5, titulo: 'Splicing', descripcion: 'Se eliminan intrones (no codificantes) y se unen exones (codificantes) → mRNA maduro', icono: '✂️' },
];

// ─────────────────────────────────────────────
// Tipos de mutaciones
// ─────────────────────────────────────────────

interface Mutacion {
  tipo: string;
  descripcion: string;
  ejemplo: string;
  icono: string;
  efecto: string;
}

const MUTACIONES: Mutacion[] = [
  { tipo: 'Sustitución', descripcion: 'Se cambia una base por otra', ejemplo: 'ATG → ACG', icono: '🔄', efecto: 'Puede cambiar un aminoácido o ser silenciosa' },
  { tipo: 'Inserción', descripcion: 'Se añade una base extra', ejemplo: 'ATG → ATCG', icono: '➕', efecto: 'Desplaza el marco de lectura (frameshift)' },
  { tipo: 'Deleción', descripcion: 'Se elimina una base', ejemplo: 'ATGC → ATC', icono: '➖', efecto: 'Desplaza el marco de lectura (frameshift)' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AdnCodigoGeneticoPage() {
  const [seccion, setSeccion] = useState<Seccion>('helice');
  const [baseActiva, setBaseActiva] = useState<string | null>(null);
  const [codonFiltro, setCodonFiltro] = useState<string | null>(null);

  // Aminoácidos únicos para filtro
  const aminoacidosUnicos = Array.from(new Set(CODONES.map(c => c.aminoacido))).sort();

  const codonesFiltrados = codonFiltro
    ? CODONES.filter(c => c.aminoacido === codonFiltro)
    : CODONES;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🧬</span> ADN y Código Genético</h1>
          <p className={styles.subtitle}>Del gen a la proteína: el lenguaje de la vida</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Encabezado de sección */}
        {SECCIONES.filter(s => s.id === seccion).map(s => (
          <div key={s.id} className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>{s.titulo}</h2>
            <p className={styles.seccionSubtitulo}>{s.subtitulo}</p>
          </div>
        ))}

        {/* ═══════ SECCIÓN 1: LA DOBLE HÉLICE ═══════ */}
        {seccion === 'helice' && (
          <div className={styles.seccionContent}>
            {/* SVG de la doble hélice */}
            <div className={styles.heliceContainer}>
              <svg viewBox="0 0 300 320" className={styles.heliceSvg} role="img" aria-label="Representación simplificada de la doble hélice de ADN con pares de bases A-T y G-C">
                {/* Esqueleto izquierdo (azúcar-fosfato) */}
                <path d="M 60,20 C 120,80 60,140 120,200 C 60,260 120,320 120,320" fill="none" stroke="#2E86AB" strokeWidth="4" opacity="0.6" />
                {/* Esqueleto derecho */}
                <path d="M 240,20 C 180,80 240,140 180,200 C 240,260 180,320 180,320" fill="none" stroke="#48A9A6" strokeWidth="4" opacity="0.6" />
                {/* Pares de bases (barras horizontales) */}
                {[
                  { y: 40, b1: 'A', b2: 'T', c1: '#27AE60', c2: '#E74C3C' },
                  { y: 90, b1: 'G', b2: 'C', c1: '#F1C40F', c2: '#2E86AB' },
                  { y: 140, b1: 'T', b2: 'A', c1: '#E74C3C', c2: '#27AE60' },
                  { y: 190, b1: 'C', b2: 'G', c1: '#2E86AB', c2: '#F1C40F' },
                  { y: 240, b1: 'A', b2: 'T', c1: '#27AE60', c2: '#E74C3C' },
                  { y: 290, b1: 'G', b2: 'C', c1: '#F1C40F', c2: '#2E86AB' },
                ].map((par, i) => {
                  const xL = 60 + Math.sin((par.y / 320) * Math.PI * 2) * 60;
                  const xR = 240 - Math.sin((par.y / 320) * Math.PI * 2) * 60;
                  return (
                    <g key={i}>
                      <line x1={xL + 10} y1={par.y} x2={(xL + xR) / 2} y2={par.y} stroke={par.c1} strokeWidth="3" />
                      <line x1={(xL + xR) / 2} y1={par.y} x2={xR - 10} y2={par.y} stroke={par.c2} strokeWidth="3" />
                      <circle cx={xL + 10} cy={par.y} r="14" fill={par.c1} />
                      <text x={xL + 10} y={par.y + 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{par.b1}</text>
                      <circle cx={xR - 10} cy={par.y} r="14" fill={par.c2} />
                      <text x={xR - 10} y={par.y + 5} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{par.b2}</text>
                      {/* Puentes de hidrógeno */}
                      <line x1={(xL + xR) / 2 - 8} y1={par.y} x2={(xL + xR) / 2 + 8} y2={par.y} stroke="#999" strokeWidth="1" strokeDasharray="3,3" />
                    </g>
                  );
                })}
                {/* Etiquetas */}
                <text x="30" y="15" fontSize="9" fill="#2E86AB" fontWeight="600">5&apos;</text>
                <text x="250" y="15" fontSize="9" fill="#48A9A6" fontWeight="600">3&apos;</text>
                <text x="30" y="315" fontSize="9" fill="#2E86AB" fontWeight="600">3&apos;</text>
                <text x="250" y="315" fontSize="9" fill="#48A9A6" fontWeight="600">5&apos;</text>
              </svg>
            </div>

            {/* Componentes del ADN */}
            <h3 className={styles.subSeccionTitulo}>Componentes del ADN</h3>
            <div className={styles.componentesGrid}>
              {[
                { icono: '🔷', nombre: 'Fosfato', desc: 'Grupo fosfato que forma el esqueleto exterior' },
                { icono: '🍬', nombre: 'Desoxirribosa', desc: 'Azúcar de 5 carbonos que conecta base y fosfato' },
                { icono: '🔤', nombre: 'Bases nitrogenadas', desc: 'A, T, G, C — las letras del código genético' },
              ].map(comp => (
                <div key={comp.nombre} className={styles.componenteCard}>
                  <span className={styles.componenteIcono} aria-hidden="true">{comp.icono}</span>
                  <span className={styles.componenteNombre}>{comp.nombre}</span>
                  <span className={styles.componenteDesc}>{comp.desc}</span>
                </div>
              ))}
            </div>

            {/* Cards de bases */}
            <h3 className={styles.subSeccionTitulo}>Las 4 bases nitrogenadas</h3>
            <div className={styles.basesGrid}>
              {BASES.map(base => (
                <button
                  key={base.letra}
                  type="button"
                  className={`${styles.baseCard} ${baseActiva === base.letra ? styles.baseActiva : ''}`}
                  style={{ borderColor: base.color, background: baseActiva === base.letra ? base.colorClaro : undefined }}
                  onClick={() => setBaseActiva(baseActiva === base.letra ? null : base.letra)}
                  aria-pressed={baseActiva === base.letra}
                >
                  <span className={styles.baseLetra} style={{ color: base.color }}>{base.letra}</span>
                  <span className={styles.baseNombre}>{base.nombre}</span>
                  <span className={styles.baseTipo}>{base.tipo}</span>
                  <span className={styles.baseComplementaria}>
                    Par: <strong style={{ color: BASES.find(b => b.letra === base.complementaria)?.color }}>{base.complementaria}</strong>
                  </span>
                </button>
              ))}
            </div>

            {baseActiva && (() => {
              const base = BASES.find(b => b.letra === baseActiva);
              const comp = BASES.find(b => b.letra === base?.complementaria);
              if (!base || !comp) return null;
              return (
                <div className={styles.baseInfo}>
                  <p>
                    <strong style={{ color: base.color }}>{base.nombre} ({base.letra})</strong> siempre
                    se empareja con <strong style={{ color: comp.color }}>{comp.nombre} ({comp.letra})</strong>.
                    {base.tipo === 'Purina' ? ' Las purinas (doble anillo) se unen con pirimidinas (anillo simple).' : ' Las pirimidinas (anillo simple) se unen con purinas (doble anillo).'}
                    {base.letra === 'A' ? ' Se unen con 2 puentes de hidrógeno.' : base.letra === 'T' ? ' Se unen con 2 puentes de hidrógeno.' : ' Se unen con 3 puentes de hidrógeno (enlace más fuerte).'}
                  </p>
                </div>
              );
            })()}

            {/* Tabla ADN vs ARN */}
            <h3 className={styles.subSeccionTitulo}>ADN vs ARN</h3>
            <div className={styles.tablaContainer}>
              <div className={styles.tablaHeader3}>
                <span className={styles.tablaHeaderCell}>Aspecto</span>
                <span className={styles.tablaHeaderCell}>ADN</span>
                <span className={styles.tablaHeaderCell}>ARN</span>
              </div>
              {DIFERENCIAS.map(d => (
                <div key={d.aspecto} className={styles.tablaRow3}>
                  <span className={styles.tablaCellNombre}>{d.aspecto}</span>
                  <span className={styles.tablaCell}>{d.adn}</span>
                  <span className={styles.tablaCell}>{d.arn}</span>
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>Nucleótido = fosfato + azúcar + base.</strong> El ADN humano tiene {formatNumber(3200000000, 0)} pares de bases enrollados en 46 cromosomas. Si se estirara, mediría unos 2 metros.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 2: TRANSCRIPCIÓN ═══════ */}
        {seccion === 'transcripcion' && (
          <div className={styles.seccionContent}>
            <div className={styles.contexto}>
              <strong>Transcripción</strong> = copiar un fragmento de ADN (gen) a una molécula de ARN mensajero (mRNA). Ocurre en el <strong>núcleo</strong> de la célula.
            </div>

            {/* SVG del proceso */}
            <div className={styles.procesoSvg}>
              <svg viewBox="0 0 400 200" className={styles.transcripcionSvg} role="img" aria-label="Proceso de transcripción: la ARN polimerasa lee ADN y sintetiza ARN mensajero">
                {/* ADN doble cadena */}
                <rect x="20" y="30" width="360" height="16" rx="8" fill="#2E86AB" opacity="0.3" />
                <rect x="20" y="54" width="360" height="16" rx="8" fill="#48A9A6" opacity="0.3" />
                <text x="200" y="24" textAnchor="middle" fontSize="11" fill="#2E86AB" fontWeight="700">Cadena codificante 5&apos; → 3&apos;</text>
                <text x="200" y="84" textAnchor="middle" fontSize="11" fill="#48A9A6" fontWeight="700">Cadena molde 3&apos; → 5&apos;</text>

                {/* Bases del ADN molde */}
                {['T', 'A', 'C', 'G', 'A', 'T', 'C', 'G', 'T', 'A'].map((b, i) => (
                  <text key={`mol-${i}`} x={55 + i * 34} y={67} textAnchor="middle" fontSize="10" fill="#48A9A6" fontWeight="600">{b}</text>
                ))}
                {/* Bases del ADN codificante */}
                {['A', 'T', 'G', 'C', 'T', 'A', 'G', 'C', 'A', 'T'].map((b, i) => (
                  <text key={`cod-${i}`} x={55 + i * 34} y={43} textAnchor="middle" fontSize="10" fill="#2E86AB" fontWeight="600">{b}</text>
                ))}

                {/* ARN polimerasa */}
                <ellipse cx="200" cy="110" rx="40" ry="18" fill="#E67E22" opacity="0.8" />
                <text x="200" y="114" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">ARN pol.</text>
                <line x1="200" y1="92" x2="200" y2="70" stroke="#E67E22" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* mRNA saliendo */}
                <rect x="80" y="140" width="240" height="16" rx="8" fill="#E74C3C" opacity="0.3" />
                <text x="200" y="170" textAnchor="middle" fontSize="11" fill="#E74C3C" fontWeight="700">mRNA 5&apos; → 3&apos;</text>
                {['A', 'U', 'G', 'C', 'U', 'A', 'G', 'C'].map((b, i) => (
                  <text key={`mrna-${i}`} x={105 + i * 30} y={153} textAnchor="middle" fontSize="10" fill="#E74C3C" fontWeight="600">{b}</text>
                ))}
                <line x1="200" y1="128" x2="200" y2="140" stroke="#E74C3C" strokeWidth="2" />

                {/* Flecha */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#E67E22" />
                  </marker>
                </defs>
              </svg>
            </div>

            {/* Pasos */}
            <h3 className={styles.subSeccionTitulo}>Pasos de la transcripción</h3>
            <div className={styles.pasosContainer}>
              {PASOS_TRANSCRIPCION.map(paso => (
                <div key={paso.numero} className={styles.pasoCard}>
                  <div className={styles.pasoNumero}>{paso.numero}</div>
                  <div className={styles.pasoContenido}>
                    <span className={styles.pasoTitulo}>
                      <span aria-hidden="true">{paso.icono}</span> {paso.titulo}
                    </span>
                    <span className={styles.pasoDesc}>{paso.descripcion}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reglas de complementariedad */}
            <h3 className={styles.subSeccionTitulo}>Reglas de transcripción</h3>
            <div className={styles.reglasGrid}>
              {[
                { adn: 'A', arn: 'U', colorAdn: '#27AE60', colorArn: '#E74C3C' },
                { adn: 'T', arn: 'A', colorAdn: '#E74C3C', colorArn: '#27AE60' },
                { adn: 'G', arn: 'C', colorAdn: '#F1C40F', colorArn: '#2E86AB' },
                { adn: 'C', arn: 'G', colorAdn: '#2E86AB', colorArn: '#F1C40F' },
              ].map(r => (
                <div key={r.adn} className={styles.reglaCard}>
                  <span className={styles.reglaBase} style={{ background: r.colorAdn }}>{r.adn}</span>
                  <span className={styles.reglaFlecha} aria-hidden="true">→</span>
                  <span className={styles.reglaBase} style={{ background: r.colorArn }}>{r.arn}</span>
                </div>
              ))}
            </div>

            {/* Splicing */}
            <div className={styles.splicingContainer}>
              <h3 className={styles.subSeccionTitulo}>Splicing: intrones y exones</h3>
              <div className={styles.splicingVisual}>
                <div className={styles.splicingPre}>
                  <span className={styles.exonBloque}>Exón 1</span>
                  <span className={styles.intronBloque}>Intrón</span>
                  <span className={styles.exonBloque}>Exón 2</span>
                  <span className={styles.intronBloque}>Intrón</span>
                  <span className={styles.exonBloque}>Exón 3</span>
                </div>
                <span className={styles.splicingFlecha} aria-hidden="true">✂️ → Se eliminan intrones</span>
                <div className={styles.splicingPost}>
                  <span className={styles.exonBloque}>Exón 1</span>
                  <span className={styles.exonBloque}>Exón 2</span>
                  <span className={styles.exonBloque}>Exón 3</span>
                </div>
              </div>
              <p className={styles.splicingNota}>El mRNA maduro sale del núcleo al citoplasma para ser traducido en los ribosomas.</p>
            </div>

            <div className={styles.insight}>
              <p>Solo el ~1,5 % del ADN humano codifica proteínas. El resto, antes llamado &quot;ADN basura&quot;, tiene funciones reguladoras importantes.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 3: TRADUCCIÓN Y CODONES ═══════ */}
        {seccion === 'traduccion' && (
          <div className={styles.seccionContent}>
            <div className={styles.contexto}>
              <strong>Traducción</strong> = leer el mRNA en tripletes (codones) y ensamblar una cadena de aminoácidos = proteína. Ocurre en los <strong>ribosomas</strong> del citoplasma.
            </div>

            {/* SVG del ribosoma */}
            <div className={styles.procesoSvg}>
              <svg viewBox="0 0 400 220" className={styles.traduccionSvg} role="img" aria-label="Proceso de traducción: el ribosoma lee mRNA en codones y ensambla aminoácidos en una proteína">
                {/* mRNA */}
                <rect x="30" y="100" width="340" height="14" rx="7" fill="#E74C3C" opacity="0.25" />
                <text x="200" y="130" textAnchor="middle" fontSize="10" fill="#E74C3C" fontWeight="700">mRNA 5&apos; → 3&apos;</text>

                {/* Codones sobre el mRNA */}
                {['AUG', 'GCU', 'UAC', 'AAG', 'UGA'].map((cod, i) => (
                  <g key={i}>
                    <rect x={45 + i * 68} y="86" width="58" height="28" rx="4" fill={i === 4 ? '#7F8C8D' : i === 0 ? '#2ECC71' : '#2E86AB'} opacity="0.15" stroke={i === 4 ? '#7F8C8D' : i === 0 ? '#2ECC71' : '#2E86AB'} strokeWidth="1" />
                    <text x={74 + i * 68} y="104" textAnchor="middle" fontSize="11" fill={i === 4 ? '#7F8C8D' : i === 0 ? '#2ECC71' : '#2E86AB'} fontWeight="700">{cod}</text>
                  </g>
                ))}

                {/* Ribosoma */}
                <ellipse cx="200" cy="70" rx="55" ry="28" fill="#48A9A6" opacity="0.3" stroke="#48A9A6" strokeWidth="2" />
                <text x="200" y="65" textAnchor="middle" fontSize="9" fill="#48A9A6" fontWeight="700">Ribosoma</text>
                <text x="200" y="76" textAnchor="middle" fontSize="8" fill="#48A9A6">(lee codones)</text>

                {/* tRNA con aminoácido */}
                <line x1="150" y1="42" x2="150" y2="20" stroke="#9B59B6" strokeWidth="2" />
                <rect x="130" y="6" width="40" height="16" rx="4" fill="#9B59B6" opacity="0.8" />
                <text x="150" y="17" textAnchor="middle" fontSize="8" fill="white" fontWeight="700">tRNA</text>

                {/* Proteína saliendo */}
                <text x="340" y="50" textAnchor="middle" fontSize="9" fill="#E67E22" fontWeight="700">Proteína</text>
                {['Met', 'Ala', 'Tyr', 'Lys'].map((aa, i) => (
                  <g key={i}>
                    <circle cx={290 + i * 25} cy={38} r="10" fill="#E67E22" opacity={0.5 + i * 0.15} />
                    <text x={290 + i * 25} y={41} textAnchor="middle" fontSize="6" fill="white" fontWeight="700">{aa}</text>
                  </g>
                ))}

                {/* Etiquetas */}
                <text x="74" y="150" textAnchor="middle" fontSize="8" fill="#2ECC71" fontWeight="600">INICIO</text>
                <text x="384" y="104" textAnchor="middle" fontSize="8" fill="#7F8C8D" fontWeight="600">STOP</text>

                {/* Leyenda */}
                <text x="200" y="180" textAnchor="middle" fontSize="9" fill="#999">Cada codón (3 letras) = 1 aminoácido</text>
                <text x="200" y="195" textAnchor="middle" fontSize="9" fill="#999">AUG = señal de inicio | UGA/UAA/UAG = señal de parada</text>
              </svg>
            </div>

            {/* Proceso paso a paso */}
            <h3 className={styles.subSeccionTitulo}>Proceso de traducción</h3>
            <div className={styles.pasosContainer}>
              {[
                { n: 1, t: 'Inicio', d: 'El ribosoma se une al mRNA y encuentra el codón de inicio AUG (metionina)', i: '🟢' },
                { n: 2, t: 'Elongación', d: 'El tRNA trae el aminoácido correspondiente a cada codón. Se forma un enlace peptídico entre aminoácidos', i: '🔗' },
                { n: 3, t: 'Avance', d: 'El ribosoma avanza 3 bases (un codón) y se repite el proceso', i: '➡️' },
                { n: 4, t: 'Terminación', d: 'Al llegar a un codón STOP (UAA, UAG o UGA), se libera la cadena de aminoácidos', i: '🔴' },
              ].map(paso => (
                <div key={paso.n} className={styles.pasoCard}>
                  <div className={styles.pasoNumero}>{paso.n}</div>
                  <div className={styles.pasoContenido}>
                    <span className={styles.pasoTitulo}><span aria-hidden="true">{paso.i}</span> {paso.t}</span>
                    <span className={styles.pasoDesc}>{paso.d}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla de codones */}
            <h3 className={styles.subSeccionTitulo}>Tabla de codones ({formatNumber(CODONES.length, 0)} tripletes → {formatNumber(aminoacidosUnicos.length, 0)} aminoácidos + STOP)</h3>

            {/* Filtro */}
            <div className={styles.filtroContainer}>
              <button
                type="button"
                className={`${styles.filtroBtn} ${codonFiltro === null ? styles.filtroBtnActivo : ''}`}
                onClick={() => setCodonFiltro(null)}
                aria-pressed={codonFiltro === null}
              >
                Todos ({formatNumber(CODONES.length, 0)})
              </button>
              {aminoacidosUnicos.map(aa => {
                const count = CODONES.filter(c => c.aminoacido === aa).length;
                return (
                  <button
                    key={aa}
                    type="button"
                    className={`${styles.filtroBtn} ${codonFiltro === aa ? styles.filtroBtnActivo : ''}`}
                    onClick={() => setCodonFiltro(codonFiltro === aa ? null : aa)}
                    aria-pressed={codonFiltro === aa}
                    style={codonFiltro === aa ? { background: CODONES.find(c => c.aminoacido === aa)?.color, borderColor: CODONES.find(c => c.aminoacido === aa)?.color, color: 'white' } : undefined}
                  >
                    {aa} ({count})
                  </button>
                );
              })}
            </div>

            {/* Grid de codones */}
            <div className={styles.codonesGrid}>
              {codonesFiltrados.map(c => (
                <div
                  key={c.triplete}
                  className={`${styles.codonCard} ${c.aminoacido === 'STOP' ? styles.codonStop : ''} ${c.triplete === 'AUG' ? styles.codonInicio : ''}`}
                  style={{ borderColor: c.color }}
                >
                  <span className={styles.codonTriplete} style={{ color: c.color }}>{c.triplete}</span>
                  <span className={styles.codonAa}>{c.aminoacido}</span>
                  <span className={styles.codonAbrev}>{c.abrev}</span>
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>Código degenerado:</strong> varios codones pueden codificar el mismo aminoácido (ej: Leucina tiene 6 codones). Esto protege contra mutaciones puntuales: un cambio en la 3.ª letra del codón a menudo produce el mismo aminoácido.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 4: DATOS Y MUTACIONES ═══════ */}
        {seccion === 'datos' && (
          <div className={styles.seccionContent}>
            {/* Dogma central */}
            <h3 className={styles.subSeccionTitulo}>El dogma central de la biología molecular</h3>
            <div className={styles.dogmaContainer}>
              <div className={styles.dogmaFlujo}>
                <div className={styles.dogmaBloque} style={{ background: 'rgba(46,134,171,0.12)', borderColor: '#2E86AB' }}>
                  <span className={styles.dogmaIcono} aria-hidden="true">🧬</span>
                  <span className={styles.dogmaNombre}>ADN</span>
                </div>
                <div className={styles.dogmaFlecha}>
                  <span aria-hidden="true">→</span>
                  <span className={styles.dogmaFlechaLabel}>Transcripción</span>
                </div>
                <div className={styles.dogmaBloque} style={{ background: 'rgba(231,76,60,0.12)', borderColor: '#E74C3C' }}>
                  <span className={styles.dogmaIcono} aria-hidden="true">📋</span>
                  <span className={styles.dogmaNombre}>ARN</span>
                </div>
                <div className={styles.dogmaFlecha}>
                  <span aria-hidden="true">→</span>
                  <span className={styles.dogmaFlechaLabel}>Traducción</span>
                </div>
                <div className={styles.dogmaBloque} style={{ background: 'rgba(230,126,34,0.12)', borderColor: '#E67E22' }}>
                  <span className={styles.dogmaIcono} aria-hidden="true">🔗</span>
                  <span className={styles.dogmaNombre}>Proteína</span>
                </div>
              </div>
              <div className={styles.dogmaExcepcion}>
                <span className={styles.dogmaExcepcionLabel}>Excepción: Retrovirus (VIH)</span>
                <div className={styles.dogmaRetro}>
                  <span style={{ color: '#E74C3C', fontWeight: 700 }}>ARN</span>
                  <span aria-hidden="true"> → </span>
                  <span style={{ color: '#9B59B6', fontSize: '0.82rem' }}>Transcriptasa inversa</span>
                  <span aria-hidden="true"> → </span>
                  <span style={{ color: '#2E86AB', fontWeight: 700 }}>ADN</span>
                </div>
              </div>
            </div>

            {/* Mutaciones */}
            <h3 className={styles.subSeccionTitulo}>Tipos de mutaciones</h3>
            <div className={styles.mutacionesGrid}>
              {MUTACIONES.map(m => (
                <div key={m.tipo} className={styles.mutacionCard}>
                  <span className={styles.mutacionIcono} aria-hidden="true">{m.icono}</span>
                  <span className={styles.mutacionTipo}>{m.tipo}</span>
                  <span className={styles.mutacionDesc}>{m.descripcion}</span>
                  <code className={styles.mutacionEjemplo}>{m.ejemplo}</code>
                  <span className={styles.mutacionEfecto}>{m.efecto}</span>
                </div>
              ))}
            </div>

            {/* Datos fascinantes */}
            <h3 className={styles.subSeccionTitulo}>Datos fascinantes</h3>
            <div className={styles.datosGrid}>
              {[
                { icono: '📏', titulo: `${formatNumber(3200000000, 0)} pares de bases`, detalle: 'El genoma humano tiene 3.200 millones de pares de bases distribuidos en 46 cromosomas (23 pares).' },
                { icono: '📐', titulo: '2 metros de ADN', detalle: 'Si se estirara el ADN de una sola célula, mediría unos 2 metros. Todo tu cuerpo: ~200 veces la distancia al Sol.' },
                { icono: '🧪', titulo: 'Solo 1,5 % codifica', detalle: 'Solo ~20.000 genes codifican proteínas. El resto tiene funciones reguladoras, estructurales o aún desconocidas.' },
                { icono: '🤝', titulo: '99,9 % idénticos', detalle: 'Todos los humanos compartimos el 99,9 % de nuestro ADN. La diversidad viene del 0,1 % restante.' },
                { icono: '🌿', titulo: 'Epigenética', detalle: 'El ambiente (dieta, estrés, tóxicos) puede modificar la expresión de los genes sin cambiar la secuencia de ADN.' },
                { icono: '✂️', titulo: 'CRISPR-Cas9', detalle: 'Tijeras genéticas que permiten cortar y editar el ADN con precisión. Revolución en medicina y agricultura desde 2012.' },
              ].map(d => (
                <div key={d.titulo} className={styles.datoCard}>
                  <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                  <h4 className={styles.datoTitulo}>{d.titulo}</h4>
                  <p className={styles.datoDetalle}>{d.detalle}</p>
                </div>
              ))}
            </div>

            {/* Código degenerado */}
            <div className={styles.warningBox}>
              <strong>Código genético degenerado:</strong> 64 codones codifican solo 20 aminoácidos + 3 señales de parada. Esto significa que la mayoría de las mutaciones de sustitución en la 3.ª posición del codón son <strong>silenciosas</strong> (no cambian el aminoácido). Es un mecanismo natural de protección contra errores.
            </div>

            <div className={styles.insight}>
              <p><strong>Curiosidad:</strong> el código genético es prácticamente universal — desde bacterias hasta humanos usan los mismos codones para los mismos aminoácidos. Esto sugiere un origen común de toda la vida en la Tierra.</p>
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres profundizar más?"
          subtitle="Conceptos clave de biología molecular"
        >
          <section className={styles.guideSection}>
            <h2>El flujo de información genética</h2>
            <p>
              El dogma central de la biología molecular, formulado por Francis Crick en 1958, describe
              el flujo de información genética: ADN → ARN → Proteína. Aunque se han descubierto excepciones
              (como los retrovirus), este principio sigue siendo la base de la biología molecular moderna.
            </p>

            <h3>¿Por qué es importante?</h3>
            <p>
              Entender cómo se lee el ADN es fundamental para comprender enfermedades genéticas,
              el desarrollo de fármacos, la biotecnología y la medicina personalizada. Técnicas como
              CRISPR permiten editar genes específicos para tratar enfermedades hereditarias.
            </p>

            <h3>Del ADN a la vida</h3>
            <p>
              Las proteínas son las moléculas ejecutoras de la célula: enzimas que catalizan reacciones,
              anticuerpos que defienden el cuerpo, hemoglobina que transporta oxígeno, colágeno que da
              estructura... Todas codificadas en tu ADN y producidas mediante transcripción y traducción.
            </p>

            <h3>Epigenética: más allá de la secuencia</h3>
            <p>
              La epigenética estudia cambios heredables en la expresión génica que no alteran la secuencia
              de ADN. Factores como la dieta, el estrés o la exposición a tóxicos pueden activar o
              silenciar genes mediante metilación del ADN o modificación de histonas.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-adn-codigo-genetico')} />
        <ShareCard appName="visualizador-adn-codigo-genetico" />
        <Footer appName="visualizador-adn-codigo-genetico" />
    </div>
  );
}
