'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorPunnett.module.css';

// ============================================================
// TIPOS
// ============================================================
type Alelo = 'A' | 'a' | 'B' | 'b';
type GenotipoPar = 'AA' | 'Aa' | 'aa';
type GenotipoParB = 'BB' | 'Bb' | 'bb';
type TipoHerencia = 'monohibrido' | 'dihibrido';

interface CeldaPunnett {
  genotipo: string;
  fenotipo:
    | 'dominante'
    | 'recesivo'
    | 'dominante-dominante'
    | 'dominante-recesivo'
    | 'recesivo-dominante'
    | 'recesivo-recesivo';
  color: string;
  gametoP1: string;
  gametoP2: string;
}

interface Escenario {
  nombre: string;
  tipo: TipoHerencia;
  p1gA: GenotipoPar;
  p2gA: GenotipoPar;
  p1gB: GenotipoParB;
  p2gB: GenotipoParB;
}

// ============================================================
// CONSTANTES
// ============================================================
const ESCENARIOS: Escenario[] = [
  { nombre: 'Mendel original (Aa×Aa)', tipo: 'monohibrido', p1gA: 'Aa', p2gA: 'Aa', p1gB: 'Bb', p2gB: 'Bb' },
  { nombre: 'Dominante × Recesivo (AA×aa)', tipo: 'monohibrido', p1gA: 'AA', p2gA: 'aa', p1gB: 'BB', p2gB: 'bb' },
  { nombre: 'Portador × Recesivo (Aa×aa)', tipo: 'monohibrido', p1gA: 'Aa', p2gA: 'aa', p1gB: 'Bb', p2gB: 'bb' },
  { nombre: 'Puros (AA×AA)', tipo: 'monohibrido', p1gA: 'AA', p2gA: 'AA', p1gB: 'BB', p2gB: 'BB' },
  { nombre: 'Dihíbrido clásico (AaBb×AaBb)', tipo: 'dihibrido', p1gA: 'Aa', p2gA: 'Aa', p1gB: 'Bb', p2gB: 'Bb' },
];

const GENOTIPOS_A: GenotipoPar[] = ['AA', 'Aa', 'aa'];
const GENOTIPOS_B: GenotipoParB[] = ['BB', 'Bb', 'bb'];

// ============================================================
// LÓGICA PURA (fuera del componente)
// ============================================================
function gametosMonohibrido(genotipo: GenotipoPar): [Alelo, Alelo] {
  if (genotipo === 'AA') return ['A', 'A'];
  if (genotipo === 'Aa') return ['A', 'a'];
  return ['a', 'a'];
}

function gametosB(genotipo: GenotipoParB): [string, string] {
  if (genotipo === 'BB') return ['B', 'B'];
  if (genotipo === 'Bb') return ['B', 'b'];
  return ['b', 'b'];
}

function ordenarAlelos(a: string, b: string): string {
  // Poner mayúscula primero
  if (a === a.toUpperCase() && b === b.toLowerCase()) return `${a}${b}`;
  if (b === b.toUpperCase() && a === a.toLowerCase()) return `${b}${a}`;
  return `${a}${b}`;
}

function colorMonohibrido(fenotipo: 'dominante' | 'recesivo'): string {
  return fenotipo === 'dominante' ? '#1a5278' : '#cccccc';
}

function cruzarMonohibrido(p1: GenotipoPar, p2: GenotipoPar): CeldaPunnett[] {
  const g1 = gametosMonohibrido(p1);
  const g2 = gametosMonohibrido(p2);
  const celdas: CeldaPunnett[] = [];
  for (const a1 of g1) {
    for (const a2 of g2) {
      const genotipo = ordenarAlelos(a1, a2);
      const fenotipo: 'dominante' | 'recesivo' = genotipo.includes('A') ? 'dominante' : 'recesivo';
      // Determinar sub-tipo para color
      let colorClass: CeldaPunnett['fenotipo'];
      if (genotipo === 'AA') colorClass = 'dominante';
      else if (genotipo === 'Aa') colorClass = 'dominante'; // heterocigoto es dominante fenotípicamente
      else colorClass = 'recesivo';
      celdas.push({
        genotipo,
        fenotipo: colorClass,
        color: colorMonohibrido(fenotipo),
        gametoP1: a1,
        gametoP2: a2,
      });
    }
  }
  return celdas;
}

// Devolvemos también el sub-tipo de celda para los colores diferenciados
function celdaMonohibridoTipo(genotipo: string): 'homoDom' | 'hetero' | 'homoRec' {
  if (genotipo === 'AA') return 'homoDom';
  if (genotipo === 'Aa' || genotipo === 'aA') return 'hetero';
  return 'homoRec';
}

function gametosDihibridoP(gA: GenotipoPar, gB: GenotipoParB): string[] {
  const aA = gametosMonohibrido(gA);
  const aB = gametosB(gB);
  const result: string[] = [];
  for (const a of aA) for (const b of aB) result.push(`${a}${b}`);
  return result;
}

function cruzarDihibrido(
  p1gA: GenotipoPar,
  p1gB: GenotipoParB,
  p2gA: GenotipoPar,
  p2gB: GenotipoParB
): CeldaPunnett[] {
  const g1 = gametosDihibridoP(p1gA, p1gB);
  const g2 = gametosDihibridoP(p2gA, p2gB);
  const celdas: CeldaPunnett[] = [];
  for (const gam1 of g1) {
    for (const gam2 of g2) {
      // Combinar gametos: ordenar loci A y B
      const a1 = gam1[0];
      const b1 = gam1[1];
      const a2 = gam2[0];
      const b2 = gam2[1];
      const genoA = ordenarAlelos(a1, a2);
      const genoB = ordenarAlelos(b1, b2);
      const genotipo = `${genoA}${genoB}`;
      const tieneA = genoA.includes('A');
      const tieneB = genoB.includes('B');
      let fenotipo: CeldaPunnett['fenotipo'];
      if (tieneA && tieneB) fenotipo = 'dominante-dominante';
      else if (tieneA && !tieneB) fenotipo = 'dominante-recesivo';
      else if (!tieneA && tieneB) fenotipo = 'recesivo-dominante';
      else fenotipo = 'recesivo-recesivo';
      const colorMap: Record<CeldaPunnett['fenotipo'], string> = {
        'dominante': '#1a5278',
        'recesivo': '#cccccc',
        'dominante-dominante': '#1a5278',
        'dominante-recesivo': '#48A9A6',
        'recesivo-dominante': '#7FB3D3',
        'recesivo-recesivo': '#cccccc',
      };
      celdas.push({
        genotipo,
        fenotipo,
        color: colorMap[fenotipo],
        gametoP1: gam1,
        gametoP2: gam2,
      });
    }
  }
  return celdas;
}

function calcularProporciones(celdas: CeldaPunnett[]): {
  genotipicas: Record<string, number>;
  fenotipicas: Record<string, number>;
} {
  const genotipicas: Record<string, number> = {};
  const fenotipicas: Record<string, number> = {};
  for (const c of celdas) {
    genotipicas[c.genotipo] = (genotipicas[c.genotipo] ?? 0) + 1;
    fenotipicas[c.fenotipo] = (fenotipicas[c.fenotipo] ?? 0) + 1;
  }
  return { genotipicas, fenotipicas };
}

function formatRatio(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const mcd = (a: number, b: number): number => (b === 0 ? a : mcd(b, a % b));
  const divisor = Object.values(counts).reduce(mcd);
  return Object.entries(counts)
    .map(([k, v]) => `${v / divisor} ${k}`)
    .join(' : ');
}

function interpretarMonohibrido(celdas: CeldaPunnett[]): string {
  const total = celdas.length;
  const dom = celdas.filter(c => c.fenotipo === 'dominante').length;
  const rec = celdas.filter(c => c.fenotipo === 'recesivo').length;
  const pctDom = Math.round((dom / total) * 100);
  const pctRec = Math.round((rec / total) * 100);
  if (dom === 0) return 'El 100% de la descendencia mostrará el fenotipo recesivo.';
  if (rec === 0) return 'El 100% de la descendencia mostrará el fenotipo dominante (ningún individuo recesivo).';
  return `El ${pctDom}% de la descendencia mostrará el fenotipo dominante y el ${pctRec}% el fenotipo recesivo (proporción ${dom}:${rec}).`;
}

function interpretarDihibrido(celdas: CeldaPunnett[]): string {
  const total = celdas.length;
  const dd = celdas.filter(c => c.fenotipo === 'dominante-dominante').length;
  const dr = celdas.filter(c => c.fenotipo === 'dominante-recesivo').length;
  const rd = celdas.filter(c => c.fenotipo === 'recesivo-dominante').length;
  const rr = celdas.filter(c => c.fenotipo === 'recesivo-recesivo').length;
  return (
    `De las ${total} combinaciones: ` +
    `${dd} (${Math.round((dd / total) * 100)}%) dominante-dominante, ` +
    `${dr} (${Math.round((dr / total) * 100)}%) dominante-recesivo, ` +
    `${rd} (${Math.round((rd / total) * 100)}%) recesivo-dominante, ` +
    `${rr} (${Math.round((rr / total) * 100)}%) recesivo-recesivo.`
  );
}

function nombreFenotipo(key: string): string {
  const map: Record<string, string> = {
    'dominante': 'Dominante (A_)',
    'recesivo': 'Recesivo (aa)',
    'dominante-dominante': 'Doble dominante (A_B_)',
    'dominante-recesivo': 'Dom. A / Rec. B (A_bb)',
    'recesivo-dominante': 'Rec. A / Dom. B (aaB_)',
    'recesivo-recesivo': 'Doble recesivo (aabb)',
  };
  return map[key] ?? key;
}

function celdaEstiloMono(genotipo: string): string {
  const tipo = celdaMonohibridoTipo(genotipo);
  if (tipo === 'homoDom') return styles.cellHomoDom;
  if (tipo === 'hetero') return styles.cellHetero;
  return styles.cellHomoRec;
}

function celdaEstiloDihi(fenotipo: CeldaPunnett['fenotipo']): string {
  if (fenotipo === 'dominante-dominante') return styles.cellDomiDomi;
  if (fenotipo === 'dominante-recesivo') return styles.cellDomiRec;
  if (fenotipo === 'recesivo-dominante') return styles.cellRecDomi;
  if (fenotipo === 'recesivo-recesivo') return styles.cellRecRec;
  return '';
}

const GENOTIPOS_A_RANDOM: GenotipoPar[] = ['AA', 'Aa', 'aa'];
const GENOTIPOS_B_RANDOM: GenotipoParB[] = ['BB', 'Bb', 'bb'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function SimuladorPunnettPage() {
  const [tipo, setTipo] = useState<TipoHerencia>('monohibrido');
  const [p1gA, setP1gA] = useState<GenotipoPar>('Aa');
  const [p2gA, setP2gA] = useState<GenotipoPar>('Aa');
  const [p1gB, setP1gB] = useState<GenotipoParB>('Bb');
  const [p2gB, setP2gB] = useState<GenotipoParB>('Bb');

  const celdas = useMemo<CeldaPunnett[]>(() => {
    if (tipo === 'monohibrido') {
      return cruzarMonohibrido(p1gA, p2gA);
    }
    return cruzarDihibrido(p1gA, p1gB, p2gA, p2gB);
  }, [tipo, p1gA, p2gA, p1gB, p2gB]);

  const proporciones = useMemo(() => calcularProporciones(celdas), [celdas]);

  const interpretacion = useMemo(() => {
    if (tipo === 'monohibrido') return interpretarMonohibrido(celdas);
    return interpretarDihibrido(celdas);
  }, [tipo, celdas]);

  // Gametos cabecera
  const gametosCabP1 = useMemo<string[]>(() => {
    if (tipo === 'monohibrido') return [...gametosMonohibrido(p1gA)];
    return gametosDihibridoP(p1gA, p1gB);
  }, [tipo, p1gA, p1gB]);

  const gametosCabP2 = useMemo<string[]>(() => {
    if (tipo === 'monohibrido') return [...gametosMonohibrido(p2gA)];
    return gametosDihibridoP(p2gA, p2gB);
  }, [tipo, p2gA, p2gB]);

  const nFilas = gametosCabP1.length;
  const nCols = gametosCabP2.length;

  function aplicarEscenario(esc: Escenario) {
    setTipo(esc.tipo);
    setP1gA(esc.p1gA);
    setP2gA(esc.p2gA);
    setP1gB(esc.p1gB);
    setP2gB(esc.p2gB);
  }

  function casoAleatorio() {
    setP1gA(randomFrom(GENOTIPOS_A_RANDOM));
    setP2gA(randomFrom(GENOTIPOS_A_RANDOM));
    setP1gB(randomFrom(GENOTIPOS_B_RANDOM));
    setP2gB(randomFrom(GENOTIPOS_B_RANDOM));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🧬</span> Cuadro de Punnett online</h1>
        <p className={styles.subtitle}>
          Tabla de Punnett para cruces monohíbrido, dihíbrido y trihíbrido (3 genes):
          pasa de genotipo a fenotipo y obtén las proporciones fenotípicas (3:1, 9:3:3:1)
          aplicando las leyes de Mendel
        </p>
      </header>

      <LegalNotice />

      {/* === Selector tipo de herencia === */}
      <div className={styles.tipoSelector} role="group" aria-label="Tipo de herencia">
        <button
          type="button"
          className={`${styles.tipoBtn} ${tipo === 'monohibrido' ? styles.tipoBtnActive : ''}`}
          onClick={() => setTipo('monohibrido')}
          aria-pressed={tipo === 'monohibrido'}
        >
          <span aria-hidden="true">🔵</span> Monohíbrido (1 gen)
        </button>
        <button
          type="button"
          className={`${styles.tipoBtn} ${tipo === 'dihibrido' ? styles.tipoBtnActive : ''}`}
          onClick={() => setTipo('dihibrido')}
          aria-pressed={tipo === 'dihibrido'}
        >
          <span aria-hidden="true">🟢</span> Dihíbrido (2 genes)
        </button>
      </div>

      {/* === Selectores de genotipo === */}
      <div className={styles.progenitoresGrid}>
        <div className={styles.progenitorCard}>
          <span className={styles.progenitorLabel}>Progenitor 1 (P1)</span>
          <label htmlFor="p1gA" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Gen A:
          </label>
          <select
            id="p1gA"
            className={styles.genoSelect}
            value={p1gA}
            onChange={e => setP1gA(e.target.value as GenotipoPar)}
            aria-label="Genotipo gen A del progenitor 1"
          >
            {GENOTIPOS_A.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {tipo === 'dihibrido' && (
            <>
              <label htmlFor="p1gB" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gen B:
              </label>
              <select
                id="p1gB"
                className={styles.genoSelect}
                value={p1gB}
                onChange={e => setP1gB(e.target.value as GenotipoParB)}
                aria-label="Genotipo gen B del progenitor 1"
              >
                {GENOTIPOS_B.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className={styles.progenitorCard}>
          <span className={styles.progenitorLabel}>Progenitor 2 (P2)</span>
          <label htmlFor="p2gA" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Gen A:
          </label>
          <select
            id="p2gA"
            className={styles.genoSelect}
            value={p2gA}
            onChange={e => setP2gA(e.target.value as GenotipoPar)}
            aria-label="Genotipo gen A del progenitor 2"
          >
            {GENOTIPOS_A.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          {tipo === 'dihibrido' && (
            <>
              <label htmlFor="p2gB" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gen B:
              </label>
              <select
                id="p2gB"
                className={styles.genoSelect}
                value={p2gB}
                onChange={e => setP2gB(e.target.value as GenotipoParB)}
                aria-label="Genotipo gen B del progenitor 2"
              >
                {GENOTIPOS_B.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.btnAleatorio}
        onClick={casoAleatorio}
        aria-label="Generar caso aleatorio"
      >
        <span aria-hidden="true">🎲</span> Caso aleatorio
      </button>

      {/* === Cuadro de Punnett (tabla HTML) === */}
      <div className={styles.punnettWrapper}>
        <table className={styles.punnettTable} aria-label="Cuadro de Punnett">
          <thead>
            <tr>
              {/* celda vacía esquina */}
              <th className={styles.punnettHeader} scope="col" aria-label="Gametos P1/P2">P1 \ P2</th>
              {gametosCabP2.map((g, i) => (
                <th key={i} className={styles.punnettHeader} scope="col">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gametosCabP1.map((gamP1, fila) => (
              <tr key={fila}>
                <th className={styles.punnettHeader} scope="row">{gamP1}</th>
                {gametosCabP2.map((_, col) => {
                  const celda = celdas[fila * nCols + col];
                  const claseColor =
                    tipo === 'monohibrido'
                      ? celdaEstiloMono(celda.genotipo)
                      : celdaEstiloDihi(celda.fenotipo);
                  return (
                    <td
                      key={col}
                      className={`${styles.punnettCell} ${claseColor}`}
                      title={`Fenotipo: ${nombreFenotipo(celda.fenotipo)}`}
                    >
                      {celda.genotipo}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda colores */}
      <div className={styles.legendRow} aria-label="Leyenda de colores">
        {tipo === 'monohibrido' ? (
          <>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#1a5278' }} />
              Homocigoto dominante (AA)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#7FB3D3' }} />
              Heterocigoto (Aa)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#cccccc' }} />
              Homocigoto recesivo (aa)
            </span>
          </>
        ) : (
          <>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#1a5278' }} />
              Doble dominante (A_B_)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
              Dom. A / Rec. B (A_bb)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#7FB3D3' }} />
              Rec. A / Dom. B (aaB_)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#cccccc' }} />
              Doble recesivo (aabb)
            </span>
          </>
        )}
      </div>

      {/* === Panel de proporciones === */}
      <div className={styles.propGrid}>
        <div className={styles.propCard}>
          <p className={styles.propLabel}>Proporciones genotípicas</p>
          <p className={styles.propRatio}>{formatRatio(proporciones.genotipicas)}</p>
        </div>
        <div className={styles.propCard}>
          <p className={styles.propLabel}>Proporciones fenotípicas</p>
          <p className={styles.propRatio}>{formatRatio(proporciones.fenotipicas)}</p>
        </div>
      </div>

      {/* Tabla de recuento */}
      <div className={styles.tablaWrapper}>
        <table className={styles.tabla} aria-label="Recuento por genotipo">
          <thead>
            <tr>
              <th>Genotipo</th>
              <th>Fenotipo</th>
              <th>Nº de celdas</th>
              <th>Proporción (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(proporciones.genotipicas).map(([gt, n]) => {
              const celda = celdas.find(c => c.genotipo === gt);
              return (
                <tr key={gt}>
                  <td><strong>{gt}</strong></td>
                  <td>{celda ? nombreFenotipo(celda.fenotipo) : '-'}</td>
                  <td>{n}</td>
                  <td>{Math.round((n / celdas.length) * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* === Interpretación textual === */}
      <p className={styles.interpretacionText} role="status" aria-live="polite">
        <strong>Resultado:</strong> {interpretacion}
      </p>

      {/* === Escenarios predefinidos === */}
      <div className={styles.scenariosRow} role="group" aria-label="Escenarios predefinidos">
        {ESCENARIOS.map(esc => (
          <button
            type="button"
            key={esc.nombre}
            className={styles.scenarioBtn}
            onClick={() => aplicarEscenario(esc)}
            title={`Cargar escenario: ${esc.nombre}`}
          >
            {esc.nombre}
          </button>
        ))}
      </div>

      {/* ============================================================
          BLOQUE EDUCATIVO v2.0
          ============================================================ */}
      <EducationalSection
        title="Aprende Genética Mendeliana"
        subtitle="Leyes de Mendel, cuadro de Punnett y herencia genética explicados paso a paso"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el cuadro de Punnett?</h3>
          <p>
            El <strong>cuadro de Punnett</strong> es una herramienta gráfica inventada por el
            genetista Reginald Crundall Punnett en 1905 para predecir los genotipos posibles
            de la descendencia de dos progenitores. Se basa en las <strong>leyes de Mendel</strong>:
          </p>
          <ul>
            <li>
              <strong>1.ª ley — Uniformidad</strong>: al cruzar dos individuos puros de raza
              diferente, toda la F1 es uniforme (idéntica en genotipo y fenotipo).
            </li>
            <li>
              <strong>2.ª ley — Segregación</strong>: cada individuo lleva dos alelos por gen; al
              formar gametos, estos se separan y cada gameto lleva solo uno.
            </li>
            <li>
              <strong>3.ª ley — Distribución independiente</strong>: los alelos de genes distintos
              se combinan en los gametos de forma independiente (base del dihíbrido).
            </li>
          </ul>
          <p>
            Cada celda del cuadro representa una combinación igualmente probable de gametos. En un
            monohíbrido obtienes <strong>4 celdas</strong>; en un dihíbrido, <strong>16 celdas</strong>.
            Es uno de los contenidos clásicos de biología en la educación media —secundaria,
            preparatoria y Bachillerato— y aparece con frecuencia en los exámenes de admisión
            universitaria de todo el mundo hispanohablante.
          </p>
          <div className={styles.formulaBox}>
            Nº de combinaciones = (nº gametos P1) × (nº gametos P2)
          </div>
        </section>

        {/* TABLA COMPARATIVA */}
        <section>
          <h3>Tabla de cruces monohíbridos y sus proporciones</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla} aria-label="Cruces y proporciones">
              <thead>
                <tr>
                  <th>Cruce</th>
                  <th>Proporciones genotípicas</th>
                  <th>Proporción fenotípica</th>
                  <th>¿Portadores?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AA × AA</td>
                  <td>100 % AA</td>
                  <td>100 % dominante</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>AA × Aa</td>
                  <td>1 AA : 1 Aa</td>
                  <td>100 % dominante</td>
                  <td>50% portadores</td>
                </tr>
                <tr>
                  <td>Aa × Aa</td>
                  <td>1 AA : 2 Aa : 1 aa</td>
                  <td>3 dom : 1 rec (3:1)</td>
                  <td>50% portadores</td>
                </tr>
                <tr>
                  <td>AA × aa</td>
                  <td>100 % Aa</td>
                  <td>100 % dominante</td>
                  <td>100% portadores</td>
                </tr>
                <tr>
                  <td>Aa × aa</td>
                  <td>1 Aa : 1 aa</td>
                  <td>1 dom : 1 rec (1:1)</td>
                  <td>50% portadores</td>
                </tr>
                <tr>
                  <td>aa × aa</td>
                  <td>100 % aa</td>
                  <td>100 % recesivo</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS REALES */}
        <section>
          <h3>Ejemplos reales de herencia mendeliana</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🐭</span>
              <strong>Color del pelo en ratones</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                El pelo oscuro (B) es dominante sobre el albino (b). Un cruce Bb × Bb produce
                3/4 ratones oscuros y 1/4 albinos — proporción clásica 3:1.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🩸</span>
              <strong>Grupo sanguíneo ABO (codominancia)</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                Los alelos I<sup>A</sup> e I<sup>B</sup> son codominantes sobre i. Un cruce I<sup>A</sup>i × I<sup>B</sup>i produce
                grupos A, B, AB y O en proporción 1:1:1:1. No aplica dominancia estricta.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">👁️</span>
              <strong>Daltonismo ligado al X</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                El gen está en el cromosoma X. Las mujeres necesitan dos alelos recesivos
                (X<sup>d</sup>X<sup>d</sup>) para ser daltónicas; los hombres solo uno (X<sup>d</sup>Y).
                El cuadro de Punnett estándar debe adaptarse con cromosomas sexuales.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧬</span>
              <strong>Enfermedades autosómicas recesivas (fibrosis quística)</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                Si ambos progenitores son portadores (Aa × Aa), el riesgo de descendencia
                afectada es 25% (aa). El 50% serán portadores asintomáticos. Cruce Mendel clásico.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes</h3>
          <ul className={styles.faqList} aria-label="Preguntas frecuentes sobre genética">
            <li className={styles.faqItem}>
              <strong>¿Cómo se hace un cuadro de Punnett paso a paso?</strong>
              <p className={styles.faqTip}>
                Escribe el genotipo de cada progenitor (ej: Aa × Aa) y sus gametos posibles.
                Coloca los de un progenitor en las <strong>filas</strong> y los del otro en las
                <strong> columnas</strong>, rellena cada celda combinando ambos gametos (ordenando
                la mayúscula primero) y cuenta los genotipos para agruparlos por fenotipo. Esta
                <strong> tabla de Punnett online</strong> dibuja el cuadro y hace el recuento
                automáticamente al elegir los genotipos.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué proporciones da un cruce monohíbrido (3:1) y uno dihíbrido (9:3:3:1)?</strong>
              <p className={styles.faqTip}>
                Un <strong>cruce monohíbrido</strong> Aa × Aa da una proporción fenotípica
                <strong> 3:1</strong> (y genotípica 1:2:1). Un <strong>cruce dihíbrido</strong>
                {' '}AaBb × AaBb da la proporción fenotípica clásica <strong>9:3:3:1</strong> en sus
                16 celdas. Un <strong>trihíbrido</strong> (3 genes) AaBbCc × AaBbCc implica 8 × 8 = 64
                combinaciones y produce la razón 27:9:9:9:3:3:3:1.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo se pasa de genotipo a fenotipo?</strong>
              <p className={styles.faqTip}>
                En dominancia completa basta un alelo dominante para expresar el fenotipo dominante:
                AA y Aa muestran el mismo carácter y solo aa muestra el recesivo. Por eso la
                proporción genotípica 1:2:1 se convierte en la fenotípica 3:1. En dominancia
                incompleta o codominancia, el heterocigoto Aa presenta su propio fenotipo intermedio o mixto.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre genotipo y fenotipo?</strong>
              <p className={styles.faqTip}>
                El <strong>genotipo</strong> es la combinación de alelos (ej: Aa), lo que está en el ADN.
                El <strong>fenotipo</strong> es la característica observable (ej: ojos azules), resultado de
                la expresión del genotipo más el ambiente. Dos individuos con genotipo AA y Aa pueden
                tener el mismo fenotipo si A es completamente dominante.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué significa ser portador?</strong>
              <p className={styles.faqTip}>
                Un <strong>portador</strong> tiene el alelo recesivo (ej: Aa) pero no lo expresa porque
                el dominante lo enmascara. Sin embargo, puede transmitirlo a su descendencia. En
                enfermedades recesivas, los portadores son el mecanismo por el que la enfermedad
                "desaparece" durante generaciones y luego reaparece.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la dominancia incompleta?</strong>
              <p className={styles.faqTip}>
                En la dominancia incompleta el heterocigoto (Aa) muestra un fenotipo intermedio
                entre ambos homocigotos. Ejemplo: flores rojas (AA) × blancas (aa) → flores rosas
                (Aa). El cuadro de Punnett sigue siendo válido; solo cambia la interpretación fenotípica.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo se heredan los rasgos ligados al sexo?</strong>
              <p className={styles.faqTip}>
                Los genes en los cromosomas X o Y siguen un patrón diferente. Los hombres (XY)
                solo tienen una copia del gen del cromosoma X, por lo que expresan cualquier alelo
                recesivo que tengan (hemicigosidad). El cuadro de Punnett se adapta usando X<sup>A</sup>,
                X<sup>a</sup> e Y como gametos.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué los hermanos no son idénticos aunque tengan los mismos padres?</strong>
              <p className={styles.faqTip}>
                Cada gameto es el resultado de la <strong>meiosis</strong>, un proceso con recombinación
                aleatoria. Aunque las proporciones del cuadro de Punnett son probabilísticas,
                cada hijo es un evento independiente. Dos padres Aa × Aa pueden tener hijos
                AA, Aa o aa en cualquier orden; las probabilidades no garantizan distribuciones exactas.
              </p>
            </li>
          </ul>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo resolver un problema de genética mendeliana paso a paso</h3>
          <ol className={styles.stepGuide} aria-label="Pasos para resolver problemas de genética">
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepContent}>
                <strong>Identifica el tipo de herencia</strong> (dominante/recesivo, autosómica/ligada
                al sexo, incompleta, codominancia). Esto determina cómo interpretar los alelos.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepContent}>
                <strong>Determina los genotipos de los progenitores</strong>. Si el enunciado
                dice "homocigoto dominante" → AA; "portador" o "heterocigoto" → Aa; "afectado
                recesivo" → aa.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepContent}>
                <strong>Escribe los gametos de cada progenitor</strong> en los ejes del cuadro.
                Recuerda: AA → gametos A,A; Aa → gametos A,a; aa → gametos a,a.
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <span className={styles.stepContent}>
                <strong>Rellena las celdas</strong> combinando el gameto de la fila con el de la
                columna. Ordena siempre la mayúscula primero (Aa, no aA).
              </span>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <span className={styles.stepContent}>
                <strong>Calcula las proporciones</strong> contando los genotipos y fenotipos.
                Expresa como razón simplificada (ej: 3:1 fenotípica, 1:2:1 genotípica).
                Verifica que la suma de numeradores = nº total de celdas.
              </span>
            </li>
          </ol>
        </section>

        {/* TIPS */}
        <section>
          <h3>Consejos prácticos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✍️</span>
              <strong>Ordenar los alelos</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                Siempre escribe el alelo dominante (mayúscula) antes del recesivo. Así "Aa" es
                siempre correcto, nunca "aA". Esto evita confusiones al contar genotipos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <strong>Proporciones fenotípicas rápidas</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                En Aa × Aa el fenotipo dominante incluye AA + Aa = 3 celdas. Cuenta celdas con
                al menos una mayúscula para el fenotipo dominante; solo las aa son recesivas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Dihíbrido: las 16 celdas</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                El dihíbrido AaBb × AaBb siempre da 9:3:3:1 fenotípicamente (doble dominante :
                dom-rec : rec-dom : doble recesivo). Memoriza este resultado como referencia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">♻️</span>
              <strong>Verifica siempre el recuento</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                La suma de todas las proporciones genotípicas debe ser igual al número de celdas
                (4 en monohíbrido, 16 en dihíbrido). Si no coincide, has cometido un error.
              </p>
            </div>
          </div>
        </section>

        {/* ERRORES FRECUENTES (warningBox) */}
        <div className={styles.warningBox} role="alert">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes que debes evitar
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir dominante con &quot;más frecuente&quot;</strong>: un alelo dominante
              no tiene por qué ser el más común en la población. La dominancia describe la
              relación entre alelos, no su frecuencia.
            </li>
            <li>
              <strong>Creer que los alelos recesivos desaparecen</strong>: los portadores (Aa) mantienen
              el alelo recesivo en silencio. Puede reaparecer en generaciones futuras si dos portadores
              se cruzan (Aa × Aa → 25% aa).
            </li>
            <li>
              <strong>Olvidar que el dihíbrido tiene 16 combinaciones</strong>: cada progenitor
              AaBb produce 4 tipos de gametos (AB, Ab, aB, ab). 4 × 4 = 16 celdas. Un error común
              es hacer solo 4 celdas como si fuera monohíbrido.
            </li>
            <li>
              <strong>Confundir la proporción 1:2:1 genotípica con la 3:1 fenotípica</strong>: en
              Aa × Aa hay 3 genotipos diferentes (AA, Aa, aa en proporción 1:2:1) pero solo 2
              fenotipos (dominante y recesivo en proporción 3:1) porque AA y Aa se expresan igual.
            </li>
            <li>
              <strong>Mezclar herencia autosómica con ligada al sexo</strong>: si el gen está en el
              cromosoma X, el cuadro de Punnett clásico no es directamente aplicable. Hay que incluir
              el cromosoma Y y distinguir entre hembras (XX) y machos (XY).
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-punnett')} />
      <ShareCard appName="simulador-punnett" />
      <Footer appName="simulador-punnett" />
    </div>
  );
}
