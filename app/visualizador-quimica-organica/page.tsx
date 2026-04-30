'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './QuimicaOrganica.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'grupos' | 'reacciones' | 'aromaticidad' | 'isomeria';
type ReaccionId = 'adicion' | 'sn2' | 'esterificacion' | 'oxidacion';
type IsomeriaId = 'estructural' | 'geometrica' | 'optica';

// ─────────────────────────────────────────────
// Datos: grupos funcionales
// ─────────────────────────────────────────────

interface GrupoFuncional {
  id: string;
  nombre: string;
  formula: string;
  grupo: string;
  ejemplo: string;
  polar: boolean;
  aplicacion: string;
  ebullicion: string;
  color: string;
}

const GRUPOS: GrupoFuncional[] = [
  {
    id: 'alcanos',
    nombre: 'Alcanos',
    formula: 'CₙH₂ₙ₊₂',
    grupo: 'C−H',
    ejemplo: 'Metano (CH₄)',
    polar: false,
    aplicacion: 'Combustibles: GLP, gasolina, gas natural',
    ebullicion: 'Bajo (−161 °C metano)',
    color: '#6c757d',
  },
  {
    id: 'alquenos',
    nombre: 'Alquenos',
    formula: 'R−CH=CH₂',
    grupo: 'C=C',
    ejemplo: 'Etileno (CH₂=CH₂)',
    polar: false,
    aplicacion: 'Plásticos: polietileno, PVC, poliestireno',
    ebullicion: 'Bajo (−104 °C etileno)',
    color: '#198754',
  },
  {
    id: 'alcoholes',
    nombre: 'Alcoholes',
    formula: 'R−OH',
    grupo: '−OH',
    ejemplo: 'Etanol (C₂H₅OH)',
    polar: true,
    aplicacion: 'Disolventes, bebidas, antisépticos, combustible',
    ebullicion: 'Moderado (78 °C etanol)',
    color: '#0d6efd',
  },
  {
    id: 'aldehidos',
    nombre: 'Aldehídos',
    formula: 'R−CHO',
    grupo: '−CHO',
    ejemplo: 'Formaldehído (HCHO)',
    polar: true,
    aplicacion: 'Conservantes, perfumería (vainillina), resinas',
    ebullicion: 'Moderado (−19 °C formaldehído)',
    color: '#fd7e14',
  },
  {
    id: 'cetonas',
    nombre: 'Cetonas',
    formula: "R−CO−R'",
    grupo: 'C=O',
    ejemplo: 'Acetona (CH₃COCH₃)',
    polar: true,
    aplicacion: 'Disolvente (quitaesmalte), síntesis orgánica',
    ebullicion: 'Moderado (56 °C acetona)',
    color: '#6610f2',
  },
  {
    id: 'acidos',
    nombre: 'Ácidos Carboxílicos',
    formula: 'R−COOH',
    grupo: '−COOH',
    ejemplo: 'Ácido acético (CH₃COOH)',
    polar: true,
    aplicacion: 'Vinagre, aspirina (ácido acetilsalicílico), jabones',
    ebullicion: 'Alto (118 °C ácido acético)',
    color: '#dc3545',
  },
  {
    id: 'esteres',
    nombre: 'Ésteres',
    formula: "R−COO−R'",
    grupo: '−COO−',
    ejemplo: 'Acetato de etilo (CH₃COOC₂H₅)',
    polar: false,
    aplicacion: 'Aromas frutales, disolventes, grasas, poliésteres',
    ebullicion: 'Moderado (77 °C acetato etilo)',
    color: '#20c997',
  },
  {
    id: 'aminas',
    nombre: 'Aminas',
    formula: 'R−NH₂',
    grupo: '−NH₂',
    ejemplo: 'Anilina (C₆H₅NH₂)',
    polar: true,
    aplicacion: 'Fármacos, colorantes, nylon, neurotransmisores',
    ebullicion: 'Variable (−6 °C metilamina, 184 °C anilina)',
    color: '#0dcaf0',
  },
];

// ─────────────────────────────────────────────
// SVG de moléculas simplificadas
// ─────────────────────────────────────────────

function MoleculaSVG({ grupoId, color }: { grupoId: string; color: string }) {
  const base = '#444';

  if (grupoId === 'alcanos') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de alcano (cadena C-C-C-H)">
        {/* C - C - C - H */}
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="116" y1="42" x2="140" y2="42" stroke={base} strokeWidth="2"/>
        <text x="142" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">H</text>
        {/* hidrógenos arriba y abajo (esquemáticos) */}
        <text x="10" y="20" fill={base} fontFamily="monospace" fontSize="12">H</text>
        <line x1="19" y1="22" x2="19" y2="30" stroke={base} strokeWidth="1.5"/>
        <text x="10" y="72" fill={base} fontFamily="monospace" fontSize="12">H</text>
        <line x1="19" y1="48" x2="19" y2="57" stroke={base} strokeWidth="1.5"/>
      </svg>
    );
  }

  if (grupoId === 'alquenos') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de alqueno con doble enlace C=C">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="40" x2="52" y2="40" stroke={color} strokeWidth="2.5"/>
        <line x1="28" y1="46" x2="52" y2="46" stroke={color} strokeWidth="2.5"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <text x="36" y="28" fill={color} fontFamily="monospace" fontSize="11" fontWeight="bold">= (doble)</text>
      </svg>
    );
  }

  if (grupoId === 'alcoholes') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de alcohol con grupo OH destacado">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={color} fontFamily="monospace" fontSize="16" fontWeight="bold">OH</text>
        <rect x="95" y="28" width="36" height="22" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="97" y="18" fill={color} fontFamily="monospace" fontSize="10">grupo funcional</text>
      </svg>
    );
  }

  if (grupoId === 'aldehidos') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de aldehído con grupo CHO">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={color} fontFamily="monospace" fontSize="16" fontWeight="bold">CHO</text>
        <rect x="95" y="28" width="46" height="22" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"/>
        {/* doble enlace C=O esquemático */}
        <text x="97" y="18" fill={color} fontFamily="monospace" fontSize="10">−CHO (C=O)</text>
      </svg>
    );
  }

  if (grupoId === 'cetonas') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de cetona con carbonilo central">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        {/* doble enlace hacia arriba = O */}
        <line x1="63" y1="28" x2="63" y2="42" stroke={color} strokeWidth="2.5"/>
        <text x="58" y="24" fill={color} fontFamily="monospace" fontSize="14" fontWeight="bold">O</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <text x="50" y="72" fill={color} fontFamily="monospace" fontSize="10">C=O central (cetona)</text>
      </svg>
    );
  }

  if (grupoId === 'acidos') {
    return (
      <svg viewBox="0 0 230 80" className={styles.moleculaSvg} aria-label="Representación de ácido carboxílico con grupo COOH">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={color} fontFamily="monospace" fontSize="16" fontWeight="bold">COOH</text>
        <rect x="95" y="28" width="60" height="22" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="97" y="18" fill={color} fontFamily="monospace" fontSize="10">grupo ácido</text>
      </svg>
    );
  }

  if (grupoId === 'esteres') {
    return (
      <svg viewBox="0 0 250 80" className={styles.moleculaSvg} aria-label="Representación de éster con enlace COO">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={color} fontFamily="monospace" fontSize="15" fontWeight="bold">COO</text>
        <line x1="138" y1="42" x2="158" y2="42" stroke={base} strokeWidth="2"/>
        <text x="160" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <rect x="95" y="28" width="50" height="22" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="97" y="18" fill={color} fontFamily="monospace" fontSize="10">enlace éster</text>
      </svg>
    );
  }

  if (grupoId === 'aminas') {
    return (
      <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Representación de amina con grupo NH2">
        <text x="10" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="28" y1="42" x2="52" y2="42" stroke={base} strokeWidth="2"/>
        <text x="54" y="45" fill={base} fontFamily="monospace" fontSize="16" fontWeight="bold">C</text>
        <line x1="72" y1="42" x2="96" y2="42" stroke={base} strokeWidth="2"/>
        <text x="98" y="45" fill={color} fontFamily="monospace" fontSize="16" fontWeight="bold">NH₂</text>
        <rect x="95" y="28" width="42" height="22" rx="4" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x="97" y="18" fill={color} fontFamily="monospace" fontSize="10">grupo amino</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 80" className={styles.moleculaSvg} aria-label="Molécula genérica">
      <text x="60" y="45" fill={base} fontFamily="monospace" fontSize="16">R − {grupoId.toUpperCase()}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Datos: reacciones
// ─────────────────────────────────────────────

interface Reaccion {
  id: ReaccionId;
  nombre: string;
  ecuacion: string;
  tipo: string;
  condiciones: string;
  catalizador: string;
  ejemplo: string;
  descripcion: string;
}

const REACCIONES: Reaccion[] = [
  {
    id: 'adicion',
    nombre: 'Adición electrófila (alquenos)',
    ecuacion: 'CH₂=CH₂ + HBr → CH₃−CH₂Br',
    tipo: 'Adición',
    condiciones: 'Temperatura ambiente, sin luz',
    catalizador: 'Ninguno (reacción directa)',
    ejemplo: 'Producción de bromoetano; base de síntesis de plásticos PVC',
    descripcion: 'El doble enlace C=C actúa como donador de electrones (nucleófilo). El H⁺ del HBr se une al carbono más rico en H (regla de Markovnikov), y el Br⁻ ataca al carbono vecino.',
  },
  {
    id: 'sn2',
    nombre: 'Sustitución nucleófila (SN2)',
    ecuacion: 'R−Br + OH⁻ → R−OH + Br⁻',
    tipo: 'Sustitución',
    condiciones: 'Medio básico acuoso, temperatura moderada',
    catalizador: 'NaOH (fuente de OH⁻)',
    ejemplo: 'Hidrólisis alcalina de halógenos de alquilo; síntesis de alcoholes',
    descripcion: 'El nucleófilo (OH⁻) ataca por la cara opuesta al grupo saliente (Br⁻) con inversión de configuración (inversión de Walden). Mecanismo concertado: enlace nuevo se forma mientras el viejo se rompe.',
  },
  {
    id: 'esterificacion',
    nombre: 'Esterificación de Fischer',
    ecuacion: 'R−COOH + R\'−OH ⇌ R−COO−R\' + H₂O',
    tipo: 'Condensación (reversible)',
    condiciones: '60-120 °C, eliminar agua para desplazar equilibrio',
    catalizador: 'H₂SO₄ concentrado o HCl (gas)',
    ejemplo: 'Aspirina (ácido salicílico + ac. acético); aromas frutales; jabones por saponificación inversa',
    descripcion: 'Reacción reversible entre un ácido carboxílico y un alcohol. El catalizador ácido protoniza el grupo carbonilo facilitando el ataque del alcohol. Se elimina agua como subproducto.',
  },
  {
    id: 'oxidacion',
    nombre: 'Oxidación de alcoholes',
    ecuacion: 'R−CH₂OH → R−CHO → R−COOH (1°) | R−CHOH−R\' → R−CO−R\' (2°)',
    tipo: 'Oxidación',
    condiciones: 'Alcohol primario: K₂Cr₂O₇/H₂SO₄ o KMnO₄; alcohol 2°: mismo reactivo',
    catalizador: 'Oxidante: K₂Cr₂O₇, KMnO₄ o Cu (250 °C)',
    ejemplo: 'Vinagre: etanol → ácido acético (oxidación bacteriana); perfumería: geraniol → geranial',
    descripcion: 'Alcoholes primarios se oxidan a aldehídos (oxidación suave) o ácidos carboxílicos (oxidación fuerte). Alcoholes secundarios dan cetonas. Los terciarios son resistentes a oxidación porque no tienen H en el carbono del OH.',
  },
];

// ─────────────────────────────────────────────
// Datos: aromaticidad
// ─────────────────────────────────────────────

const COMPUESTOS_AROMATICOS = [
  { nombre: 'Benceno', formula: 'C₆H₆', n: 1, electrones: 6, aromatico: true, uso: 'Disolvente, síntesis orgánica' },
  { nombre: 'Tolueno', formula: 'C₆H₅CH₃', n: 1, electrones: 6, aromatico: true, uso: 'Disolvente, pintura, TNT' },
  { nombre: 'Naftaleno', formula: 'C₁₀H₈', n: 2, electrones: 10, aromatico: true, uso: 'Bolas de naftalina (antipolillas)' },
  { nombre: 'Fenol', formula: 'C₆H₅OH', n: 1, electrones: 6, aromatico: true, uso: 'Antiséptico, resinas fenólicas' },
  { nombre: 'Anilina', formula: 'C₆H₅NH₂', n: 1, electrones: 6, aromatico: true, uso: 'Colorantes, fármacos, nylon' },
  { nombre: 'Ciclobutadieno', formula: 'C₄H₄', n: 1, electrones: 4, aromatico: false, uso: 'Antiaromático (inestable)' },
];

const REACCIONES_SEA = [
  {
    nombre: 'Nitración',
    reactivo: 'HNO₃ + H₂SO₄ (mezcla nitrante)',
    producto: 'Nitrobenceno (C₆H₅NO₂)',
    uso: 'Síntesis de anilina, colorantes azoicos, TNT',
  },
  {
    nombre: 'Sulfonación',
    reactivo: 'SO₃ / H₂SO₄ fumante',
    producto: 'Ácido bencenosulfónico (C₆H₅SO₃H)',
    uso: 'Detergentes (alquilbencenosulfonato), fármacos (sulfamidas)',
  },
  {
    nombre: 'Halogenación',
    reactivo: 'Cl₂ o Br₂ + catalizador Lewis (FeCl₃)',
    producto: 'Clorobenceno / Bromobenceno',
    uso: 'Plaguicidas, fármacos, polímeros',
  },
];

// SVG benceno: Kekulé vs resonancia
function BencenoSVG({ tipo }: { tipo: 'kekule' | 'resonancia' }) {
  const cx = 90;
  const cy = 70;
  const r = 48;
  const angulos = [0, 60, 120, 180, 240, 300];

  // Vértices del hexágono
  const vertices = angulos.map((a) => {
    const rad = (a - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  return (
    <svg viewBox="0 0 180 140" className={styles.bencenoSvg} aria-label={`Benceno: estructura ${tipo === 'kekule' ? 'de Kekulé' : 'de resonancia'}`}>
      {/* Hexágono */}
      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % 6];
        return <line key={i} x1={v.x} y1={v.y} x2={next.x} y2={next.y} stroke="#333" strokeWidth="2.5"/>;
      })}

      {tipo === 'kekule' ? (
        /* Dobles enlaces alternos (Kekulé) */
        [0, 2, 4].map((i) => {
          const v1 = vertices[i];
          const v2 = vertices[(i + 1) % 6];
          const inset = 0.15;
          const ix1 = v1.x + (cx - v1.x) * inset;
          const iy1 = v1.y + (cy - v1.y) * inset;
          const ix2 = v2.x + (cx - v2.x) * inset;
          const iy2 = v2.y + (cy - v2.y) * inset;
          return <line key={i} x1={ix1} y1={iy1} x2={ix2} y2={iy2} stroke="#2E86AB" strokeWidth="2.5"/>;
        })
      ) : (
        /* Círculo interior (resonancia) */
        <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#2E86AB" strokeWidth="2.5"/>
      )}

      {/* Átomos C en vértices */}
      {vertices.map((v, i) => (
        <text key={i} x={v.x - 6} y={v.y + 5} fill="#333" fontFamily="monospace" fontSize="12" fontWeight="bold">C</text>
      ))}

      {/* Label */}
      <text x={cx - 32} y={cy + r + 22} fill="#666" fontFamily="sans-serif" fontSize="11">
        {tipo === 'kekule' ? 'Kekulé' : 'Resonancia'}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Datos: isomería
// ─────────────────────────────────────────────

interface TipoIsomeria {
  id: IsomeriaId;
  nombre: string;
  descripcion: string;
  ejemplo: string;
}

const TIPOS_ISOMERIA: TipoIsomeria[] = [
  {
    id: 'estructural',
    nombre: 'Isomería Estructural',
    descripcion: 'Misma fórmula molecular, diferente conectividad entre átomos. Pueden diferir en cadena, posición del grupo funcional o función química.',
    ejemplo: 'Butano (C₄H₁₀): cadena lineal vs isobutano (ramificado).\n1-propanol vs 2-propanol (misma fórmula, diferente posición del −OH).',
  },
  {
    id: 'geometrica',
    nombre: 'Isomería Geométrica (cis/trans)',
    descripcion: 'Existe en compuestos con doble enlace C=C que impide la libre rotación. Los sustituyentes pueden quedar en el mismo lado (cis) o en lados opuestos (trans).',
    ejemplo: '2-buteno cis: dos CH₃ en el mismo lado → más polar, menor punto de ebullición.\n2-buteno trans: CH₃ en lados opuestos → menos polar, más simétrico.',
  },
  {
    id: 'optica',
    nombre: 'Isomería Óptica',
    descripcion: 'Un carbono unido a 4 grupos distintos (carbono asimétrico o quiral) genera dos enantiómeros, imagen especular no superponible. Rotan la luz polarizada en sentidos opuestos.',
    ejemplo: 'Aminoácidos: la glicina no tiene carbono quiral, pero alanina sí. La L-alanina forma las proteínas; la D-alanina está en paredes bacterianas.',
  },
];

// SVG isomería estructural
function IsoEstructuralSVG() {
  return (
    <svg viewBox="0 0 260 110" className={styles.isomeriaSvg} aria-label="Isomería estructural: butano vs isobutano">
      {/* Butano lineal */}
      <text x="5" y="18" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">n-Butano</text>
      <text x="5" y="40" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <line x1="20" y1="37" x2="38" y2="37" stroke="#444" strokeWidth="2"/>
      <text x="40" y="40" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <line x1="55" y1="37" x2="73" y2="37" stroke="#444" strokeWidth="2"/>
      <text x="75" y="40" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <line x1="90" y1="37" x2="108" y2="37" stroke="#444" strokeWidth="2"/>
      <text x="110" y="40" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <text x="5" y="58" fill="#888" fontFamily="sans-serif" fontSize="9">cadena lineal (C₄H₁₀)</text>

      {/* Separador */}
      <line x1="140" y1="10" x2="140" y2="100" stroke="#ddd" strokeWidth="1" strokeDasharray="4,2"/>
      <text x="144" y="55" fill="#aaa" fontFamily="sans-serif" fontSize="10">vs</text>

      {/* Isobutano */}
      <text x="160" y="18" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">Isobutano</text>
      {/* cadena principal C-C-C */}
      <text x="162" y="52" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <line x1="177" y1="49" x2="195" y2="49" stroke="#444" strokeWidth="2"/>
      <text x="197" y="52" fill="#2E86AB" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <line x1="212" y1="49" x2="230" y2="49" stroke="#444" strokeWidth="2"/>
      <text x="232" y="52" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      {/* rama */}
      <line x1="205" y1="37" x2="205" y2="21" stroke="#444" strokeWidth="2"/>
      <text x="199" y="18" fill="#444" fontFamily="monospace" fontSize="13" fontWeight="bold">C</text>
      <text x="160" y="72" fill="#2E86AB" fontFamily="sans-serif" fontSize="9">carbono central ramificado</text>
    </svg>
  );
}

// SVG isomería geométrica (cis/trans)
function IsoCisTransSVG() {
  return (
    <svg viewBox="0 0 280 120" className={styles.isomeriaSvg} aria-label="Isomería cis/trans del 2-buteno">
      {/* CIS */}
      <text x="5" y="16" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">cis-2-buteno</text>
      {/* doble enlace central */}
      <line x1="80" y1="55" x2="115" y2="55" stroke="#dc3545" strokeWidth="2.5"/>
      <line x1="80" y1="61" x2="115" y2="61" stroke="#dc3545" strokeWidth="2.5"/>
      {/* CH₃ ambos arriba */}
      <text x="30" y="48" fill="#444" fontFamily="monospace" fontSize="12">CH₃</text>
      <line x1="63" y1="46" x2="80" y2="55" stroke="#444" strokeWidth="2"/>
      <text x="118" y="48" fill="#444" fontFamily="monospace" fontSize="12">CH₃</text>
      <line x1="115" y1="55" x2="118" y2="46" stroke="#444" strokeWidth="2"/>
      {/* H ambos abajo */}
      <text x="50" y="80" fill="#888" fontFamily="monospace" fontSize="11">H</text>
      <line x1="57" y1="76" x2="80" y2="61" stroke="#888" strokeWidth="1.5"/>
      <text x="105" y="80" fill="#888" fontFamily="monospace" fontSize="11">H</text>
      <line x1="115" y1="61" x2="110" y2="76" stroke="#888" strokeWidth="1.5"/>
      <text x="25" y="100" fill="#dc3545" fontFamily="sans-serif" fontSize="9">mismos grupos = mismo lado</text>

      {/* Separador */}
      <line x1="155" y1="10" x2="155" y2="110" stroke="#ddd" strokeWidth="1" strokeDasharray="4,2"/>

      {/* TRANS */}
      <text x="162" y="16" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">trans-2-buteno</text>
      <line x1="198" y1="55" x2="233" y2="55" stroke="#198754" strokeWidth="2.5"/>
      <line x1="198" y1="61" x2="233" y2="61" stroke="#198754" strokeWidth="2.5"/>
      {/* CH₃ en lados opuestos */}
      <text x="155" y="48" fill="#444" fontFamily="monospace" fontSize="12">CH₃</text>
      <line x1="186" y1="46" x2="198" y2="55" stroke="#444" strokeWidth="2"/>
      <text x="236" y="80" fill="#444" fontFamily="monospace" fontSize="12">CH₃</text>
      <line x1="233" y1="61" x2="238" y2="76" stroke="#444" strokeWidth="2"/>
      {/* H en lados opuestos */}
      <text x="165" y="80" fill="#888" fontFamily="monospace" fontSize="11">H</text>
      <line x1="172" y1="76" x2="198" y2="61" stroke="#888" strokeWidth="1.5"/>
      <text x="222" y="48" fill="#888" fontFamily="monospace" fontSize="11">H</text>
      <line x1="233" y1="55" x2="228" y2="46" stroke="#888" strokeWidth="1.5"/>
      <text x="160" y="100" fill="#198754" fontFamily="sans-serif" fontSize="9">grupos opuestos = lados distintos</text>
    </svg>
  );
}

// SVG isomería óptica
function IsoOpticaSVG() {
  return (
    <svg viewBox="0 0 280 130" className={styles.isomeriaSvg} aria-label="Isomería óptica: dos enantiómeros imagen especular">
      {/* Enantiómero L */}
      <text x="10" y="16" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">L-Alanina</text>
      <text x="55" y="52" fill="#2E86AB" fontFamily="monospace" fontSize="13" fontWeight="bold">C*</text>
      {/* 4 grupos */}
      <text x="10" y="44" fill="#444" fontFamily="monospace" fontSize="11">NH₂</text>
      <line x1="48" y1="43" x2="55" y2="50" stroke="#444" strokeWidth="1.8"/>
      <text x="10" y="70" fill="#444" fontFamily="monospace" fontSize="11">COOH</text>
      <line x1="50" y1="66" x2="57" y2="60" stroke="#444" strokeWidth="1.8"/>
      <text x="78" y="52" fill="#444" fontFamily="monospace" fontSize="11">H</text>
      <line x1="72" y1="50" x2="80" y2="50" stroke="#444" strokeWidth="1.8"/>
      <text x="45" y="82" fill="#444" fontFamily="monospace" fontSize="11">CH₃</text>
      <line x1="60" y1="63" x2="60" y2="72" stroke="#444" strokeWidth="1.8"/>
      <text x="15" y="105" fill="#2E86AB" fontFamily="sans-serif" fontSize="9">forma L (proteínas)</text>

      {/* Espejo */}
      <line x1="140" y1="10" x2="140" y2="120" stroke="#ccc" strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="124" y="8" fill="#aaa" fontFamily="sans-serif" fontSize="9">espejo</text>

      {/* Enantiómero D */}
      <text x="155" y="16" fill="#666" fontFamily="sans-serif" fontSize="10" fontWeight="bold">D-Alanina</text>
      <text x="193" y="52" fill="#dc3545" fontFamily="monospace" fontSize="13" fontWeight="bold">C*</text>
      {/* 4 grupos espejados */}
      <text x="160" y="52" fill="#444" fontFamily="monospace" fontSize="11">H</text>
      <line x1="172" y1="50" x2="193" y2="50" stroke="#444" strokeWidth="1.8"/>
      <text x="218" y="44" fill="#444" fontFamily="monospace" fontSize="11">NH₂</text>
      <line x1="208" y1="43" x2="200" y2="50" stroke="#444" strokeWidth="1.8"/>
      <text x="218" y="70" fill="#444" fontFamily="monospace" fontSize="11">COOH</text>
      <line x1="218" y1="66" x2="207" y2="60" stroke="#444" strokeWidth="1.8"/>
      <text x="190" y="82" fill="#444" fontFamily="monospace" fontSize="11">CH₃</text>
      <line x1="200" y1="63" x2="200" y2="72" stroke="#444" strokeWidth="1.8"/>
      <text x="155" y="105" fill="#dc3545" fontFamily="sans-serif" fontSize="9">forma D (bacterias)</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorQuimicaOrganica() {
  const [tabActiva, setTabActiva] = useState<Tab>('grupos');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('alcoholes');
  const [reaccionSeleccionada, setReaccionSeleccionada] = useState<ReaccionId>('esterificacion');
  const [isomeriaSeleccionada, setIsomeriaSeleccionada] = useState<IsomeriaId>('estructural');
  const [bencenoVista, setBencenoVista] = useState<'kekule' | 'resonancia'>('kekule');

  const grupo = GRUPOS.find((g) => g.id === grupoSeleccionado) ?? GRUPOS[0];
  const reaccion = REACCIONES.find((r) => r.id === reaccionSeleccionada) ?? REACCIONES[0];
  const isomeria = TIPOS_ISOMERIA.find((t) => t.id === isomeriaSeleccionada) ?? TIPOS_ISOMERIA[0];

  const tabs: { id: Tab; label: string; icono: string }[] = [
    { id: 'grupos', label: 'Grupos Funcionales', icono: '⚗️' },
    { id: 'reacciones', label: 'Reacciones', icono: '🔁' },
    { id: 'aromaticidad', label: 'Aromaticidad', icono: '⬡' },
    { id: 'isomeria', label: 'Isomería', icono: '🔀' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Química Orgánica</h1>
        <p className={styles.heroSubtitle}>
          Grupos funcionales, reacciones, aromaticidad e isomería con visualizaciones interactivas
        </p>
      </header>

      <LegalNotice />

      {/* ── Pestañas ── */}
      <div className={styles.tabBar} role="tablist" aria-label="Secciones de química orgánica">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tabActiva === t.id}
            onClick={() => setTabActiva(t.id)}
            className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
          >
            <span aria-hidden="true">{t.icono}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          TAB 1: Grupos Funcionales
      ════════════════════════════════════════ */}
      {tabActiva === 'grupos' && (
        <section className={styles.content} aria-label="Grupos funcionales">
          <div className={styles.gruposLayout}>
            <div className={styles.gruposGrid}>
              {GRUPOS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGrupoSeleccionado(g.id)}
                  className={`${styles.grupoCard} ${grupoSeleccionado === g.id ? styles.grupoCardActive : ''}`}
                  style={grupoSeleccionado === g.id ? { borderColor: g.color, color: g.color } as React.CSSProperties : undefined}
                  aria-pressed={grupoSeleccionado === g.id}
                >
                  <span className={styles.etiquetaGrupo} style={{ background: g.color } as React.CSSProperties}>
                    {g.grupo}
                  </span>
                  <span className={styles.grupoNombre}>{g.nombre}</span>
                </button>
              ))}
            </div>

            <div className={styles.grupoDetalle}>
              <h2 style={{ color: grupo.color }}>{grupo.nombre}</h2>
              <p className={styles.formulaGeneral}>{grupo.formula}</p>

              <MoleculaSVG grupoId={grupo.id} color={grupo.color} />

              <div className={styles.detalleGrid}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Grupo funcional</span>
                  <span className={styles.detalleValor}>{grupo.grupo}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Ejemplo</span>
                  <span className={styles.detalleValor}>{grupo.ejemplo}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Polaridad</span>
                  <span className={grupo.polar ? styles.polar : styles.apolar}>
                    {grupo.polar ? 'Polar' : 'Apolar'}
                  </span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Punto de ebullición</span>
                  <span className={styles.detalleValor}>{grupo.ebullicion}</span>
                </div>
                <div className={`${styles.detalleItem} ${styles.detalleItemFull}`}>
                  <span className={styles.detalleLabel}>Aplicaciones reales</span>
                  <span className={styles.detalleValor}>{grupo.aplicacion}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          TAB 2: Reacciones
      ════════════════════════════════════════ */}
      {tabActiva === 'reacciones' && (
        <section className={styles.content} aria-label="Reacciones orgánicas básicas">
          <div className={styles.reaccionSelector}>
            {REACCIONES.map((r) => (
              <button
                key={r.id}
                onClick={() => setReaccionSeleccionada(r.id)}
                className={`${styles.reaccionBtn} ${reaccionSeleccionada === r.id ? styles.reaccionBtnActive : ''}`}
                aria-pressed={reaccionSeleccionada === r.id}
              >
                {r.nombre}
              </button>
            ))}
          </div>

          <div className={styles.reaccionBox}>
            <h2 className={styles.reaccionTitulo}>{reaccion.nombre}</h2>

            <div className={styles.reaccionEcuacion} role="region" aria-label="Ecuación química">
              {reaccion.ecuacion}
            </div>

            <div className={styles.reaccionMetaGrid}>
              <div className={styles.reaccionMetaItem}>
                <span className={styles.reaccionMetaLabel}>Tipo</span>
                <span className={styles.reaccionMetaValor}>{reaccion.tipo}</span>
              </div>
              <div className={styles.reaccionMetaItem}>
                <span className={styles.reaccionMetaLabel}>Condiciones</span>
                <span className={styles.reaccionMetaValor}>{reaccion.condiciones}</span>
              </div>
              <div className={styles.reaccionMetaItem}>
                <span className={styles.reaccionMetaLabel}>Catalizador</span>
                <span className={styles.reaccionMetaValor}>{reaccion.catalizador}</span>
              </div>
            </div>

            <div className={styles.reaccionDescripcion}>
              <h3>Mecanismo</h3>
              <p>{reaccion.descripcion}</p>
            </div>

            <div className={styles.reaccionEjemplo}>
              <span className={styles.reaccionMetaLabel}>Ejemplo real:</span>
              <span>{reaccion.ejemplo}</span>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          TAB 3: Aromaticidad
      ════════════════════════════════════════ */}
      {tabActiva === 'aromaticidad' && (
        <section className={styles.content} aria-label="Aromaticidad y regla de Hückel">
          <h2 className={styles.seccionTitulo}>Aromaticidad y Regla de Hückel</h2>
          <p className={styles.seccionDesc}>
            Un compuesto es aromático si es cíclico, plano, completamente conjugado y cumple la regla de Hückel:
            el número de electrones π = <strong>4n + 2</strong> (con n = 0, 1, 2, …).
          </p>

          <div className={styles.bencenoBox}>
            <div className={styles.bencenoToggle}>
              <button
                onClick={() => setBencenoVista('kekule')}
                className={`${styles.toggleBtn} ${bencenoVista === 'kekule' ? styles.toggleBtnActive : ''}`}
              >
                Estructura de Kekulé
              </button>
              <button
                onClick={() => setBencenoVista('resonancia')}
                className={`${styles.toggleBtn} ${bencenoVista === 'resonancia' ? styles.toggleBtnActive : ''}`}
              >
                Resonancia (Thiele)
              </button>
            </div>
            <div className={styles.bencenoSvgContainer}>
              <BencenoSVG tipo={bencenoVista} />
              <div className={styles.bencenoInfo}>
                {bencenoVista === 'kekule' ? (
                  <>
                    <p><strong>Estructura de Kekulé</strong> (1865): dobles enlaces alternos entre los 6 C del anillo. Históricamente la primera propuesta de Kekulé. En realidad los electrones π están deslocalizados.</p>
                    <p>C₆H₆ · n=1 · <strong>6 electrones π</strong> ✅ aromático</p>
                  </>
                ) : (
                  <>
                    <p><strong>Representación de resonancia</strong> (Thiele): el círculo interior simboliza los 6 electrones π deslocalizados sobre todos los átomos del anillo. Todos los enlaces C-C son equivalentes (longitud ~1,40 Å).</p>
                    <p>La deslocalización π aporta una <em>energía de resonancia</em> de ~150 kJ/mol que estabiliza la molécula.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <h3 className={styles.subseccionTitulo}>Compuestos aromáticos comunes</h3>
          <div className={styles.aromaticosGrid}>
            {COMPUESTOS_AROMATICOS.map((c) => (
              <div key={c.nombre} className={`${styles.aromaticCard} ${c.aromatico ? styles.aromaticCardSi : styles.aromaticCardNo}`}>
                <div className={styles.aromaticNombre}>{c.nombre}</div>
                <div className={styles.aromaticFormula}>{c.formula}</div>
                <div className={styles.aromaticHuckel}>
                  {c.electrones}e⁻π · {c.aromatico ? `n=${c.n} ✅` : '4n=4 ❌'}
                </div>
                <div className={styles.aromaticUso}>{c.uso}</div>
              </div>
            ))}
          </div>

          <h3 className={styles.subseccionTitulo}>Sustitución Aromática Electrófila (SEA)</h3>
          <p className={styles.seccionDesc}>
            El benceno no hace adición (perdería aromaticidad) sino <strong>sustitución</strong>: un electrófilo E⁺ sustituye un H sin romper el sistema π.
          </p>
          <div className={styles.seaGrid}>
            {REACCIONES_SEA.map((sea) => (
              <div key={sea.nombre} className={styles.seaCard}>
                <h4 className={styles.seaNombre}>{sea.nombre}</h4>
                <div className={styles.seaFila}><span className={styles.seaLabel}>Reactivo:</span> {sea.reactivo}</div>
                <div className={styles.seaFila}><span className={styles.seaLabel}>Producto:</span> {sea.producto}</div>
                <div className={styles.seaFila}><span className={styles.seaLabel}>Usos:</span> {sea.uso}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          TAB 4: Isomería
      ════════════════════════════════════════ */}
      {tabActiva === 'isomeria' && (
        <section className={styles.content} aria-label="Tipos de isomería">
          <h2 className={styles.seccionTitulo}>Isomería en Química Orgánica</h2>
          <p className={styles.seccionDesc}>
            Los isómeros tienen la misma fórmula molecular pero difieren en cómo están unidos los átomos o en su disposición espacial.
            Esta diferencia puede cambiar radicalmente sus propiedades físicas y biológicas.
          </p>

          <div className={styles.isomeriaTabs}>
            {TIPOS_ISOMERIA.map((t) => (
              <button
                key={t.id}
                onClick={() => setIsomeriaSeleccionada(t.id)}
                className={`${styles.isomeriaBtn} ${isomeriaSeleccionada === t.id ? styles.isomeriaBtnActive : ''}`}
                aria-pressed={isomeriaSeleccionada === t.id}
              >
                {t.nombre}
              </button>
            ))}
          </div>

          <div className={styles.isomeriaDetalle}>
            <h3>{isomeria.nombre}</h3>
            <p>{isomeria.descripcion}</p>

            <div className={styles.isomeriaSvgBox}>
              {isomeriaSeleccionada === 'estructural' && <IsoEstructuralSVG />}
              {isomeriaSeleccionada === 'geometrica' && <IsoCisTransSVG />}
              {isomeriaSeleccionada === 'optica' && <IsoOpticaSVG />}
            </div>

            <div className={styles.isomeriaEjemplo}>
              <strong>Ejemplos:</strong>
              {isomeria.ejemplo.split('\n').map((linea, i) => (
                <p key={i}>{linea}</p>
              ))}
            </div>

            {isomeriaSeleccionada === 'optica' && (
              <div className={styles.warningBox} role="note">
                <strong>Importancia biológica:</strong> Las enzimas y receptores del cuerpo humano son quirales. Un enantiómero puede ser un fármaco activo y el otro puede ser inactivo o incluso tóxico (caso talidomida). Por eso la industria farmacéutica produce fármacos enantioméricamente puros.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Química Orgánica: la base de la vida y los materiales"
        subtitle="Del metano al DNA: millones de compuestos construidos con C, H, O y N"
      >
        <h3>Comparativa de Grupos Funcionales</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Grupo Funcional</th>
                <th>Fórmula general</th>
                <th>Polaridad</th>
                <th>Aplicación cotidiana</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alcohol (-OH)</td>
                <td>R-OH</td>
                <td>Polar (puente H)</td>
                <td>Etanol (bebidas, antiséptico)</td>
              </tr>
              <tr>
                <td>Ácido carboxílico (-COOH)</td>
                <td>R-COOH</td>
                <td>Muy polar (ácido)</td>
                <td>Ácido acético (vinagre), aspirina</td>
              </tr>
              <tr>
                <td>Éster (-COO-)</td>
                <td>R-COO-R&apos;</td>
                <td>Polar (sin puente H)</td>
                <td>Aromas de frutas, grasas, nylon</td>
              </tr>
              <tr>
                <td>Amina (-NH₂)</td>
                <td>R-NH₂</td>
                <td>Polar (base débil)</td>
                <td>Aminoácidos, medicamentos, colorantes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>🏥 Industria Farmacéutica</h4>
            <p>La aspirina es un éster del ácido salicílico. La morfina es un alcohol y amina. El ibuprofeno es un ácido carboxílico. Conocer los grupos funcionales predice la solubilidad, metabolismo y actividad biológica de los fármacos.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🧴 Cosmética y Perfumería</h4>
            <p>Los ésteres naturales dan el aroma de las frutas: acetato de isoamilo (plátano), acetato de etilo (disolvente de esmalte). Los perfumes artificiales replican estas estructuras con reacciones de esterificación controladas.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🧪 Síntesis de Materiales</h4>
            <p>El nylon se forma por reacción de aminas con ácidos carboxílicos (amidación). El PET (botellas) por esterificación del ácido tereftálico. Comprender la química orgánica es diseñar materiales a medida.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🌱 Bioquímica y Metabolismo</h4>
            <p>Los carbohidratos son alcoholes y aldehídos/cetonas. Las grasas son ésteres de glicerol y ácidos grasos. Las proteínas son polímeros de aminoácidos (amino + ácido). Toda la bioquímica es química orgánica.</p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Por qué el carbono forma tantos compuestos?</strong>
            <p>El carbono tiene 4 electrones de valencia y puede formar 4 enlaces covalentes. Puede unirse a sí mismo en cadenas lineales, ramificadas y cíclicas (catenación), y combinarse con H, O, N, S, P, halogens... Esta flexibilidad da millones de estructuras posibles.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo sé si una molécula orgánica es polar?</strong>
            <p>Busca grupos funcionales con electronegatividad alta: -OH, -COOH, -NH₂, C=O son polares y miscibles en agua. Los alcanos y alquenos son apolares y no se mezclan con agua («el aceite no se mezcla con el agua» es este principio).</p>
            <div className={styles.faqTip}>💡 Regla: «semejante disuelve a semejante» — polar disuelve polar, apolar disuelve apolar.</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre aldehído y cetona?</strong>
            <p>Ambos tienen el grupo carbonilo (C=O). En el aldehído, el carbonilo está en el extremo de la cadena (R-CHO). En la cetona, está en el interior (R-CO-R&apos;). El formaldehído (conservante) y la acetona (quitaesmalte) son ejemplos respectivos.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué importa la quiralidad en farmacología?</strong>
            <p>Los enantiómeros (imágenes especulares no superponibles) son químicamente idénticos pero biológicamente diferentes. La talidomida: el enantiómero R era sedante, el S causaba malformaciones fetales. Por eso la FDA exige ahora especificar el enantiómero activo en los fármacos.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué hace especial al benceno respecto a otros compuestos insaturados?</strong>
            <p>El benceno tiene 6 electrones π deslocalizados en el anillo (cumple la regla de Hückel: 4n+2 con n=1). Esta deslocalización lo estabiliza enormemente. No reacciona por adición (como los alquenos) sino por sustitución aromática electrófila, preservando el anillo.</p>
          </div>
        </div>

        <h3>Guía de Uso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Explora los grupos funcionales</h4>
              <p>Haz clic en cada grupo en la pestaña «Grupos Funcionales». Observa el SVG de la molécula, el badge de polaridad y los usos cotidianos. Relaciona cada grupo con su reactividad característica.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Analiza las reacciones paso a paso</h4>
              <p>En «Reacciones», selecciona cada tipo y lee la ecuación con flechas, los reactivos/productos destacados y las condiciones (catalizador, temperatura). Conecta la reacción con el grupo funcional que transforma.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Comprende la aromaticidad</h4>
              <p>Alterna entre la estructura de Kekulé y la de resonancia del benceno. Aplica la regla de Hückel (4n+2) a los compuestos de la tabla y verifica cuáles son aromáticos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Identifica tipos de isomería</h4>
              <p>En «Isomería», observa los SVG de cada tipo. Para isomería óptica, busca el carbono asimétrico (unido a 4 grupos diferentes). Practica identificando isómeros en moléculas cotidianas.</p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <div>
              <strong>Identifica primero el grupo funcional</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>En química orgánica, el grupo funcional determina el 90% de la reactividad. Ignora momentáneamente la cadena carbonada y localiza el grupo R-X que dicta el comportamiento.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>⚡</span>
            <div>
              <strong>Aprende patrones de reacción, no memorices</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Hay ~5 patrones fundamentales (adición, sustitución, eliminación, oxidación, condensación). Dominarlos te permite predecir miles de reacciones específicas.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧪</span>
            <div>
              <strong>Polar vs apolar: regla de miscibilidad</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>El agua es polar: los compuestos con -OH, -COOH, -NH₂ se disuelven en ella. Los alcanos y ésteres no. Esto determina la formulación de medicamentos, cosméticos y alimentos.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔄</span>
            <div>
              <strong>Los equilibrios orgánicos importan</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>La esterificación de Fischer es reversible (⇌). Para desplazar el equilibrio hacia el éster: eliminar agua (destilación azeotrópica) o usar exceso de un reactivo. Le Chatelier en acción.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            Errores Conceptuales Frecuentes
          </div>
          <ul className={styles.warningList}>
            <li><strong>Alcohol ≠ etanol</strong> — «Alcohol» es el grupo funcional (-OH unido a carbono sp³). El etanol (C₂H₅OH) es uno de los miles de alcoholes posibles. El metanol (CH₃OH) es tóxico; el glicerol tiene 3 grupos -OH.</li>
            <li><strong>Los aldehídos se oxidan fácilmente, las cetonas no</strong> — El H del grupo -CHO hace a los aldehídos reductores. Las cetonas no tienen ese H y son más estables frente a la oxidación. Esta diferencia se usa en la prueba de Tollens (espejo de plata).</li>
            <li><strong>El benceno no tiene dobles enlaces alternos «reales»</strong> — La estructura de Kekulé es un modelo didáctico. Los 6 electrones π están completamente deslocalizados: todas las distancias C-C del benceno son iguales (140 pm, intermedia entre enlace simple y doble).</li>
            <li><strong>Isomería geométrica ≠ isomería óptica</strong> — La geométrica (cis/trans) requiere doble enlace o anillo sin libre rotación. La óptica requiere carbono asimétrico (estereogénico). Pueden coexistir en la misma molécula.</li>
            <li><strong>La esterificación es reversible; la amidación, no espontáneamente</strong> — Ácido + alcohol ⇌ éster + H₂O (requiere eliminar H₂O para ir hacia delante). Ácido + amina → amida + H₂O (más favorable termodinámicamente, base de nylon y proteínas).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-quimica-organica')} />
      <ShareCard appName="visualizador-quimica-organica" />
      <Footer appName="visualizador-quimica-organica" />
    </div>
  );
}
