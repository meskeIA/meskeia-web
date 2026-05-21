'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCirculoQuintas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface TonalidadInfo {
  nombre: string;
  nombreMenor: string;
  alteraciones: number; // positivo = sostenidos, negativo = bemoles
  notas: string[];      // notas de la escala mayor
  acuerdosDiatonicos: AcordeDiatonico[];
}

interface AcordeDiatonico {
  grado: string;         // I, ii, iii, IV, V, vi, vii°
  nombre: string;        // Ej: Do mayor, Re menor...
  tipo: string;          // mayor, menor, disminuido
  funcion: string;       // Tónica, Subdominante, Dominante...
}

interface ProgresionPopular {
  nombre: string;
  grados: string;
  acordes: string;
}

// ─────────────────────────────────────────────
// Datos del círculo de quintas
// ─────────────────────────────────────────────

// 12 tonalidades en orden de quintas (sentido horario)
const TONALIDADES_MAYORES: TonalidadInfo[] = [
  {
    nombre: 'Do (C)',
    nombreMenor: 'La m (Am)',
    alteraciones: 0,
    notas: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Do mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Re menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Mi menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Fa mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Sol mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'La menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Si disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Sol (G)',
    nombreMenor: 'Mi m (Em)',
    alteraciones: 1,
    notas: ['Sol', 'La', 'Si', 'Do', 'Re', 'Mi', 'Fa#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Sol mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'La menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Si menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Do mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Re mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Mi menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Fa# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Re (D)',
    nombreMenor: 'Si m (Bm)',
    alteraciones: 2,
    notas: ['Re', 'Mi', 'Fa#', 'Sol', 'La', 'Si', 'Do#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Re mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Mi menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Fa# menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Sol mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'La mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Si menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Do# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'La (A)',
    nombreMenor: 'Fa# m (F#m)',
    alteraciones: 3,
    notas: ['La', 'Si', 'Do#', 'Re', 'Mi', 'Fa#', 'Sol#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'La mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Si menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Do# menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Re mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Mi mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Fa# menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Sol# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Mi (E)',
    nombreMenor: 'Do# m (C#m)',
    alteraciones: 4,
    notas: ['Mi', 'Fa#', 'Sol#', 'La', 'Si', 'Do#', 'Re#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Mi mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Fa# menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Sol# menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'La mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Si mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Do# menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Re# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Si/Do♭ (B/Cb)',
    nombreMenor: 'Sol# m (G#m)',
    alteraciones: 5,
    notas: ['Si', 'Do#', 'Re#', 'Mi', 'Fa#', 'Sol#', 'La#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Si mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Do# menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Re# menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Mi mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Fa# mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Sol# menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'La# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Fa#/Sol♭ (F#/Gb)',
    nombreMenor: 'Re# m/Mi♭m (D#m)',
    alteraciones: 6,
    notas: ['Fa#', 'Sol#', 'La#', 'Si', 'Do#', 'Re#', 'Mi#'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Fa# mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Sol# menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'La# menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Si mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Do# mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Re# menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Mi# disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Re♭/Do# (Db/C#)',
    nombreMenor: 'Si♭m (Bbm)',
    alteraciones: -5,
    notas: ['Re♭', 'Mi♭', 'Fa', 'Sol♭', 'La♭', 'Si♭', 'Do'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Re♭ mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Mi♭ menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Fa menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Sol♭ mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'La♭ mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Si♭ menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Do disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'La♭ (Ab)',
    nombreMenor: 'Fa m (Fm)',
    alteraciones: -4,
    notas: ['La♭', 'Si♭', 'Do', 'Re♭', 'Mi♭', 'Fa', 'Sol'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'La♭ mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Si♭ menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Do menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Re♭ mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Mi♭ mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Fa menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Sol disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Mi♭ (Eb)',
    nombreMenor: 'Do m (Cm)',
    alteraciones: -3,
    notas: ['Mi♭', 'Fa', 'Sol', 'La♭', 'Si♭', 'Do', 'Re'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Mi♭ mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Fa menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Sol menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'La♭ mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Si♭ mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Do menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Re disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Si♭ (Bb)',
    nombreMenor: 'Sol m (Gm)',
    alteraciones: -2,
    notas: ['Si♭', 'Do', 'Re', 'Mi♭', 'Fa', 'Sol', 'La'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Si♭ mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Do menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'Re menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Mi♭ mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Fa mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Sol menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'La disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
  {
    nombre: 'Fa (F)',
    nombreMenor: 'Re m (Dm)',
    alteraciones: -1,
    notas: ['Fa', 'Sol', 'La', 'Si♭', 'Do', 'Re', 'Mi'],
    acuerdosDiatonicos: [
      { grado: 'I', nombre: 'Fa mayor', tipo: 'mayor', funcion: 'Tónica' },
      { grado: 'ii', nombre: 'Sol menor', tipo: 'menor', funcion: 'Subdominante' },
      { grado: 'iii', nombre: 'La menor', tipo: 'menor', funcion: 'Mediante' },
      { grado: 'IV', nombre: 'Si♭ mayor', tipo: 'mayor', funcion: 'Subdominante' },
      { grado: 'V', nombre: 'Do mayor', tipo: 'mayor', funcion: 'Dominante' },
      { grado: 'vi', nombre: 'Re menor', tipo: 'menor', funcion: 'Tónica' },
      { grado: 'vii°', nombre: 'Mi disminuido', tipo: 'disminuido', funcion: 'Dominante' },
    ],
  },
];

// Etiquetas cortas para el SVG
const ETIQUETAS_SVG = ['C', 'G', 'D', 'A', 'E', 'B/C♭', 'F#/G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
const ETIQUETAS_MENOR_SVG = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];

// Nombres de los sostenidos y bemoles en orden
const NOMBRES_SOSTENIDOS = ['Fa#', 'Do#', 'Sol#', 'Re#', 'La#', 'Mi#', 'Si#'];
const NOMBRES_BEMOLES = ['Si♭', 'Mi♭', 'La♭', 'Re♭', 'Sol♭', 'Do♭', 'Fa♭'];

// Progresiones populares (genéricas, se aplican a la tonalidad seleccionada)
function getProgresiones(ton: TonalidadInfo): ProgresionPopular[] {
  const ac = ton.acuerdosDiatonicos;
  const I = ac[0].nombre;
  const ii = ac[1].nombre;
  const IV = ac[3].nombre;
  const V = ac[4].nombre;
  const vi = ac[5].nombre;
  return [
    {
      nombre: 'I - IV - V (Blues/Rock)',
      grados: 'I — IV — V',
      acordes: `${I} — ${IV} — ${V}`,
    },
    {
      nombre: 'I - V - vi - IV (Pop universal)',
      grados: 'I — V — vi — IV',
      acordes: `${I} — ${V} — ${vi} — ${IV}`,
    },
    {
      nombre: 'ii - V - I (Jazz)',
      grados: 'ii — V — I',
      acordes: `${ii} — ${V} — ${I}`,
    },
  ];
}

// ─────────────────────────────────────────────
// Helpers SVG
// ─────────────────────────────────────────────

const CX = 250;
const CY = 250;
const R_INNER_MENOR = 85;
const R_OUTER_MENOR = 135;
const R_INNER_MAYOR = 140;
const R_OUTER_MAYOR = 210;
const R_LABEL_MAYOR = 178;
const R_LABEL_MENOR = 110;
const R_LABEL_CENTRO = 42;

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const s1 = polarToXY(cx, cy, rOuter, startAngle);
  const e1 = polarToXY(cx, cy, rOuter, endAngle);
  const s2 = polarToXY(cx, cy, rInner, endAngle);
  const e2 = polarToXY(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ');
}

const SLICE_DEG = 360 / 12; // 30°

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCirculoQuintasPage() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [mostrarProgresiones, setMostrarProgresiones] = useState(false);

  const tonActual = seleccionado !== null ? TONALIDADES_MAYORES[seleccionado] : null;
  const progresiones = tonActual ? getProgresiones(tonActual) : [];

  const getArmadura = (alt: number) => {
    if (alt === 0) return 'Sin alteraciones (Do mayor / La menor)';
    if (alt > 0) {
      const nombres = NOMBRES_SOSTENIDOS.slice(0, alt).join(', ');
      return `${alt} sostenido${alt > 1 ? 's' : ''}: ${nombres}`;
    }
    const n = Math.abs(alt);
    const nombres = NOMBRES_BEMOLES.slice(0, n).join(', ');
    return `${n} bemol${n > 1 ? 'es' : ''}: ${nombres}`;
  };

  // Índices de tonalidades vecinas
  const idxDominante = seleccionado !== null ? (seleccionado + 1) % 12 : -1;
  const idxSubdominante = seleccionado !== null ? (seleccionado + 11) % 12 : -1;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎵 Círculo de Quintas</h1>
        <p className={styles.subtitle}>
          Haz clic en cualquier tonalidad para explorar sus acordes, armadura de clave y relativa menor
        </p>
      </header>

      <LegalNotice />

      {/* Herramienta principal */}
      <section className={styles.mainContent}>
        {/* Círculo SVG */}
        <div className={styles.circuloWrapper}>
          <svg
            viewBox="0 0 500 500"
            className={styles.svgCirculo}
            aria-label="Círculo de quintas interactivo"
            role="img"
          >
            {/* Anillo exterior: tonalidades mayores */}
            {TONALIDADES_MAYORES.map((ton, i) => {
              const startAngle = i * SLICE_DEG - SLICE_DEG / 2;
              const endAngle = startAngle + SLICE_DEG;
              const isActive = seleccionado === i;
              const isVecino = i === idxDominante || i === idxSubdominante;
              const midAngle = i * SLICE_DEG;
              const lp = polarToXY(CX, CY, R_LABEL_MAYOR, midAngle);

              return (
                <g key={`mayor-${i}`}>
                  <path
                    d={arcPath(CX, CY, R_INNER_MAYOR, R_OUTER_MAYOR, startAngle, endAngle)}
                    className={[
                      styles.segmento,
                      isActive ? styles.segmentoActivo : '',
                      isVecino && !isActive ? styles.segmentoVecino : '',
                    ].join(' ')}
                    onClick={() => {
                      setSeleccionado(seleccionado === i ? null : i);
                      setMostrarProgresiones(false);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Tonalidad ${ton.nombre}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSeleccionado(seleccionado === i ? null : i);
                        setMostrarProgresiones(false);
                      }
                    }}
                  />
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={styles.textoNota}
                    style={{ pointerEvents: 'none', fontSize: '11px', fontWeight: isActive ? 700 : 500 }}
                  >
                    {ETIQUETAS_SVG[i]}
                  </text>
                </g>
              );
            })}

            {/* Anillo interior: relativas menores */}
            {TONALIDADES_MAYORES.map((ton, i) => {
              const startAngle = i * SLICE_DEG - SLICE_DEG / 2;
              const endAngle = startAngle + SLICE_DEG;
              const isActive = seleccionado === i;
              const midAngle = i * SLICE_DEG;
              const lp = polarToXY(CX, CY, R_LABEL_MENOR, midAngle);

              return (
                <g key={`menor-${i}`}>
                  <path
                    d={arcPath(CX, CY, R_INNER_MENOR, R_OUTER_MENOR, startAngle, endAngle)}
                    className={[
                      styles.segmentoMenor,
                      isActive ? styles.segmentoMenorActivo : '',
                    ].join(' ')}
                    onClick={() => {
                      setSeleccionado(seleccionado === i ? null : i);
                      setMostrarProgresiones(false);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Relativa menor: ${ton.nombreMenor}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSeleccionado(seleccionado === i ? null : i);
                        setMostrarProgresiones(false);
                      }
                    }}
                  />
                  <text
                    x={lp.x}
                    y={lp.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={styles.textoNotaMenor}
                    style={{ pointerEvents: 'none', fontSize: '9px' }}
                  >
                    {ETIQUETAS_MENOR_SVG[i]}
                  </text>
                </g>
              );
            })}

            {/* Centro informativo */}
            <circle cx={CX} cy={CY} r={R_INNER_MENOR - 2} className={styles.circuloCentro} />
            <text x={CX} y={CY - 10} textAnchor="middle" dominantBaseline="central" className={styles.textoCentro} style={{ fontSize: '10px' }}>
              {seleccionado !== null ? ETIQUETAS_SVG[seleccionado] : '♩'}
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="central" className={styles.textoCentroSub} style={{ fontSize: '8px' }}>
              {seleccionado !== null ? 'mayor' : 'Clic para'}
            </text>
            <text x={CX} y={CY + 20} textAnchor="middle" dominantBaseline="central" className={styles.textoCentroSub} style={{ fontSize: '8px' }}>
              {seleccionado !== null ? '' : 'explorar'}
            </text>

            {/* Leyenda de anillos */}
            <text x={CX} y={30} textAnchor="middle" className={styles.leyendaTexto} style={{ fontSize: '9px' }}>
              Mayor (exterior)
            </text>
            <text x={CX} y={470} textAnchor="middle" className={styles.leyendaTexto} style={{ fontSize: '9px' }}>
              Menor relativa (interior)
            </text>
          </svg>
        </div>

        {/* Panel de información */}
        <div className={styles.infoPanel}>
          {tonActual ? (
            <>
              <div className={styles.infoCabecera}>
                <h2 className={styles.infoTitulo}>{tonActual.nombre}</h2>
                <p className={styles.infoSubtitulo}>Relativa menor: <strong>{tonActual.nombreMenor}</strong></p>
                <p className={styles.armadura}>
                  🎼 Armadura: <span className={styles.armaduraValor}>{getArmadura(tonActual.alteraciones)}</span>
                </p>
              </div>

              {/* Escala */}
              <div className={styles.escalaRow}>
                {tonActual.notas.map((nota, i) => (
                  <span key={i} className={styles.notaBadge}>{nota}</span>
                ))}
              </div>

              {/* Acordes diatónicos */}
              <h3 className={styles.seccionTitulo}>Acordes diatónicos</h3>
              <div className={styles.acordesGrid}>
                {tonActual.acuerdosDiatonicos.map((acorde, i) => (
                  <div
                    key={i}
                    className={[
                      styles.acordeCard,
                      acorde.tipo === 'mayor' ? styles.acordeMayor : '',
                      acorde.tipo === 'menor' ? styles.acordeMenor : '',
                      acorde.tipo === 'disminuido' ? styles.acordeDisminuido : '',
                    ].join(' ')}
                  >
                    <span className={styles.acordeGrado}>{acorde.grado}</span>
                    <span className={styles.acordeNombre}>{acorde.nombre}</span>
                    <span className={styles.acordeFuncion}>{acorde.funcion}</span>
                  </div>
                ))}
              </div>

              {/* Vecinas */}
              <div className={styles.vecinasRow}>
                <div className={styles.vecinaItem}>
                  <span className={styles.vecinaLabel}>← Subdominante</span>
                  <span className={styles.vecinaValor}>{TONALIDADES_MAYORES[idxSubdominante].nombre}</span>
                </div>
                <div className={styles.vecinaItem}>
                  <span className={styles.vecinaLabel}>Dominante →</span>
                  <span className={styles.vecinaValor}>{TONALIDADES_MAYORES[idxDominante].nombre}</span>
                </div>
              </div>

              {/* Progresiones */}
              <button
                className={styles.btnProgresiones}
                onClick={() => setMostrarProgresiones(!mostrarProgresiones)}
                aria-expanded={mostrarProgresiones}
              >
                {mostrarProgresiones ? '▲ Ocultar progresiones' : '▼ Ver progresiones populares'}
              </button>

              {mostrarProgresiones && (
                <div className={styles.progresionesPanel}>
                  {progresiones.map((prog, i) => (
                    <div key={i} className={styles.progresionCard}>
                      <p className={styles.progNombre}>{prog.nombre}</p>
                      <p className={styles.progGrados}>{prog.grados}</p>
                      <p className={styles.progAcordes}>{prog.acordes}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.infoVacio}>
              <p className={styles.infoVacioIcono} aria-hidden="true">🎵</p>
              <p className={styles.infoVacioTexto}>Selecciona una tonalidad en el círculo para ver su información</p>
              <ul className={styles.infoVacioLista}>
                <li>Anillo exterior → tonalidades mayores</li>
                <li>Anillo interior → relativas menores</li>
                <li>Tonalidades resaltadas → vecinas (dominante y subdominante)</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="📚 Guía del Círculo de Quintas"
        subtitle="Teoría musical para compositores e intérpretes"
      >
        <section className={styles.guideSection}>
          {/* Tabla comparativa */}
          <h2>Las 12 tonalidades de un vistazo</h2>
          <p>Cada tonalidad mayor y sus datos esenciales de armonía tonal.</p>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tonalidad</th>
                  <th>Armadura</th>
                  <th>Relativa menor</th>
                  <th>Acorde I</th>
                  <th>Acorde IV</th>
                  <th>Acorde V</th>
                </tr>
              </thead>
              <tbody>
                {TONALIDADES_MAYORES.map((ton, i) => (
                  <tr key={i}>
                    <td><strong>{ETIQUETAS_SVG[i]}</strong></td>
                    <td>
                      {ton.alteraciones === 0
                        ? 'Ninguna'
                        : ton.alteraciones > 0
                          ? `${ton.alteraciones}#`
                          : `${Math.abs(ton.alteraciones)}♭`}
                    </td>
                    <td>{ETIQUETAS_MENOR_SVG[i]}</td>
                    <td>{ton.acuerdosDiatonicos[0].nombre}</td>
                    <td>{ton.acuerdosDiatonicos[3].nombre}</td>
                    <td>{ton.acuerdosDiatonicos[4].nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Casos de uso */}
          <h2>¿Para quién es útil el círculo de quintas?</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">🎸</span>
              <h3>Guitarrista que estudia cejillas</h3>
              <p>El círculo muestra por qué Si♭ y La# suenan igual. Cambiar de cejilla en la guitarra equivale a moverse entre tonalidades adyacentes.</p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">🎹</span>
              <h3>Compositor eligiendo tonalidad</h3>
              <p>Las tonalidades con pocos sostenidos o bemoles (C, G, F, D) son más fáciles de leer. Las de 5-6 alteraciones aportan un color más oscuro o brillante.</p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">🎺</span>
              <h3>Músico improvisando</h3>
              <p>Conocer las tonalidades vecinas permite modular suavemente. De Do mayor a Sol (dominante) o a Fa (subdominante) hay cambios mínimos en los acordes.</p>
            </div>
            <div className={styles.casoCard}>
              <span className={styles.casoIcono} aria-hidden="true">📖</span>
              <h3>Estudiante de teoría musical</h3>
              <p>El círculo resume de forma visual las relaciones entre escalas: por qué la relativa menor comparte la armadura con la mayor, y qué significa la quinta justa.</p>
            </div>
          </div>

          {/* Guía paso a paso */}
          <h2>Cómo usar el círculo para escribir una canción (5 pasos)</h2>
          <ol className={styles.pasosList}>
            <li className={styles.pasoItem}>
              <span className={styles.pasoNum}>1</span>
              <div>
                <strong>Elige la tonalidad principal</strong>
                <p>Haz clic en cualquier segmento exterior. Considera tu instrumento y la voz si hay cantante: C, G, D y A son cómodas en guitarra; C, F, G en piano.</p>
              </div>
            </li>
            <li className={styles.pasoItem}>
              <span className={styles.pasoNum}>2</span>
              <div>
                <strong>Aprende los 7 acordes diatónicos</strong>
                <p>Solo con estos acordes puedes escribir miles de canciones. Los más usados son I (tónica), IV (subdominante) y V (dominante).</p>
              </div>
            </li>
            <li className={styles.pasoItem}>
              <span className={styles.pasoNum}>3</span>
              <div>
                <strong>Prueba progresiones populares</strong>
                <p>Activa "Ver progresiones" en el panel. La progresión I-V-vi-IV es la base de cientos de canciones pop. La ii-V-I es el núcleo del jazz.</p>
              </div>
            </li>
            <li className={styles.pasoItem}>
              <span className={styles.pasoNum}>4</span>
              <div>
                <strong>Modula a una tonalidad vecina</strong>
                <p>Cuando quieras cambiar el ambiente sin perder coherencia, pasa a la dominante (una posición a la derecha) o a la subdominante (izquierda).</p>
              </div>
            </li>
            <li className={styles.pasoItem}>
              <span className={styles.pasoNum}>5</span>
              <div>
                <strong>Experimenta con la relativa menor</strong>
                <p>Cada mayor tiene una relativa menor que comparte sus acordes. Si tu canción está en Do mayor, La menor te da el mismo conjunto de notas con un color más oscuro.</p>
              </div>
            </li>
          </ol>

          {/* FAQ */}
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqPregunta}>¿Qué es el círculo de quintas?</summary>
              <p className={styles.faqRespuesta}>Es una representación visual que organiza las 12 tonalidades musicales en un círculo, de modo que cada tonalidad adyacente difiere en exactamente una alteración (sostenido o bemol). Fue formalizado por Johann David Heinichen en 1711 y sigue siendo una de las herramientas más útiles de la teoría musical occidental.</p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqPregunta}>¿Por qué se llama "de quintas"?</summary>
              <p className={styles.faqRespuesta}>Porque cada tonalidad está separada de la siguiente por el intervalo de quinta justa (7 semitonos). De Do a Sol hay una quinta justa; de Sol a Re, otra. Esta relación acústica crea la estructura circular perfecta de 12 posiciones.</p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqPregunta}>¿Qué son los acordes diatónicos?</summary>
              <p className={styles.faqRespuesta}>Son los 7 acordes que se construyen usando exclusivamente las notas de una escala mayor, sin añadir alteraciones adicionales. En Do mayor: Do M, Re m, Mi m, Fa M, Sol M, La m y Si dim. Cualquier canción que solo use estos acordes suena "dentro" de la tonalidad.</p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqPregunta}>¿Qué es una enharmonía? ¿Por qué F# y Gb suenan igual?</summary>
              <p className={styles.faqRespuesta}>Enharmonía es el hecho de que dos notas con nombre diferente producen el mismo sonido en instrumentos de afinación temperada (piano, guitarra). Fa# y Sol♭ son el mismo sonido pero tienen nombres distintos según la tonalidad en la que están. En el círculo, F#/Gb, B/C♭ y C#/D♭ son los puntos de enharmonía donde los sostenidos y bemoles se "encuentran".</p>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqPregunta}>¿Cómo sé qué tonalidad tiene una canción?</summary>
              <p className={styles.faqRespuesta}>La señal más clara es el acorde en que la canción "descansa" o termina — ese suele ser el I (tónica). También puedes contar las alteraciones en la armadura de clave de la partitura y consultar el círculo: 2 sostenidos = Re mayor o Si menor; 3 bemoles = Mi♭ mayor o Do menor.</p>
            </details>
          </div>

          {/* Tips */}
          <h2>Consejos prácticos</h2>
          <div className={styles.tipsList}>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">💡</span>
              <p>Para memorizar el orden de los sostenidos, usa la frase: <em>"Fa-Do-Sol-Re-La-Mi-Si"</em> (o en inglés: <em>"Fat Cats Go Down Alleys Eating Birds"</em>).</p>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">💡</span>
              <p>Las tonalidades con menos alteraciones (0-2) son más sencillas para empezar. A medida que avanzas en habilidad puedes explorar tonalidades con 4-6 alteraciones.</p>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">💡</span>
              <p>La progresión I-V-vi-IV se llama a veces "la progresión del pop" porque aparece en cientos de canciones de estilos muy distintos, desde rock hasta pop electrónico.</p>
            </div>
            <div className={styles.tipItem}>
              <span className={styles.tipIcono} aria-hidden="true">💡</span>
              <p>Si una canción suena "mayor" pero "oscura", probablemente estés en la relativa menor. Prueba a buscar tanto la mayor como su relativa si al principio no encuentras la tónica.</p>
            </div>
          </div>

          {/* Warning box - errores frecuentes */}
          <div className={styles.warningBox}>
            <h3 className={styles.warningTitulo}>⚠️ Errores frecuentes al interpretar el círculo</h3>
            <ul className={styles.warningLista}>
              <li><strong>Confundir "adyacente en el círculo" con "sonido parecido"</strong>: Las tonalidades adyacentes comparten 6 de 7 notas, pero no necesariamente "suenan" parecidas. La proximidad en el círculo indica relación armónica, no timbre.</li>
              <li><strong>Creer que mayor = alegre y menor = triste</strong>: El modo mayor o menor influye en el carácter, pero el tempo, la dinámica y el contexto importan igual o más. Un Adagio en Do mayor puede sonar más melancólico que un Allegro en La menor.</li>
              <li><strong>Aplicar el círculo a música no tonal</strong>: El círculo describe la tonalidad funcional occidental. Música modal (gregoriano, flamenco), atonal (siglo XX) o microtonalidad no encajan en este sistema.</li>
              <li><strong>Pensar que los acordes diatónicos son los únicos posibles</strong>: Son los acordes "naturales" de la tonalidad, pero la armonía cromática, los préstamos modales y las sustituciones son técnicas comunes en jazz, rock y música clásica.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-circulo-quintas')} />

      <ShareCard appName="visualizador-circulo-quintas" />

      <Footer appName="visualizador-circulo-quintas" />
    </div>
  );
}
