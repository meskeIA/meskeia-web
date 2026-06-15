'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './OjoHumanoVision.module.css';
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

type Seccion = 'anatomia' | 'conos-bastones' | 'defectos' | 'datos';

interface ParteOjo {
  id: string;
  nombre: string;
  funcion: string;
  dato: string;
  color: string;
}

const PARTES_OJO: ParteOjo[] = [
  { id: 'cornea', nombre: 'Córnea', funcion: 'Ventana transparente que refracta ~70% de la luz entrante. Protege el interior del ojo.', dato: 'Se regenera en 24-48 h si se raya superficialmente.', color: '#3498db' },
  { id: 'humor-acuoso', nombre: 'Humor acuoso', funcion: 'Líquido transparente entre córnea e iris. Nutre y mantiene la presión intraocular.', dato: 'Se renueva completamente cada 2-3 horas.', color: '#85C1E9' },
  { id: 'iris', nombre: 'Iris', funcion: 'Diafragma muscular que controla el tamaño de la pupila, regulando la cantidad de luz.', dato: 'Cada iris es único, como una huella dactilar.', color: '#27AE60' },
  { id: 'cristalino', nombre: 'Cristalino', funcion: 'Lente flexible que enfoca ajustando su curvatura (acomodación). Enfoca objetos cercanos y lejanos.', dato: 'Con la edad pierde flexibilidad, causando presbicia a partir de los 40 años.', color: '#F1C40F' },
  { id: 'humor-vitreo', nombre: 'Humor vítreo', funcion: 'Gel transparente que rellena el 80% del ojo. Mantiene la forma esférica.', dato: 'Las "moscas volantes" son sombras de fibras en el vítreo.', color: '#D5DBDB' },
  { id: 'retina', nombre: 'Retina', funcion: 'Pantalla de 130 millones de fotorreceptores que convierte la luz en señales eléctricas.', dato: 'Tiene 10 capas de células, más compleja que una cámara digital.', color: '#E74C3C' },
  { id: 'fovea', nombre: 'Fóvea', funcion: 'Zona central de la retina con máxima concentración de conos. Máxima agudeza visual.', dato: 'Solo 1,5 mm de diámetro, pero genera el 50% de la información visual.', color: '#E67E22' },
  { id: 'nervio-optico', nombre: 'Nervio óptico', funcion: 'Cable de ~1,2 millones de fibras nerviosas que transmite la imagen al cerebro.', dato: 'Transmite datos a ~8,75 Mbps, comparable a una conexión de internet.', color: '#8E44AD' },
  { id: 'punto-ciego', nombre: 'Punto ciego', funcion: 'Donde el nervio óptico sale del ojo. No hay fotorreceptores, así que no ve nada.', dato: 'El cerebro "rellena" la zona ciega con información del otro ojo.', color: '#2C3E50' },
];

const SECCIONES: { id: Seccion; icono: string; label: string }[] = [
  { id: 'anatomia', icono: '👁️', label: 'Anatomía' },
  { id: 'conos-bastones', icono: '🔬', label: 'Conos y bastones' },
  { id: 'defectos', icono: '👓', label: 'Defectos' },
  { id: 'datos', icono: '🧠', label: 'Datos' },
];

interface TipoCono {
  id: string;
  nombre: string;
  lambda: string;
  color: string;
  sensibilidad: string;
}

const TIPOS_CONOS: TipoCono[] = [
  { id: 'S', nombre: 'Cono S (azul)', lambda: '420 nm', color: '#3498db', sensibilidad: 'Azul-violeta' },
  { id: 'M', nombre: 'Cono M (verde)', lambda: '530 nm', color: '#27AE60', sensibilidad: 'Verde' },
  { id: 'L', nombre: 'Cono L (rojo)', lambda: '560 nm', color: '#E74C3C', sensibilidad: 'Rojo-amarillo' },
];

interface DefectoVisual {
  id: string;
  nombre: string;
  icono: string;
  resumen: string;
  descripcion: string;
  correccion: string;
}

const DEFECTOS: DefectoVisual[] = [
  { id: 'miopia', nombre: 'Miopía', icono: '🔴', resumen: 'No ve bien de lejos', descripcion: 'El globo ocular es más largo de lo normal. La imagen se forma antes de la retina, por lo que los objetos lejanos se ven borrosos.', correccion: 'Lente divergente (cóncava, dioptrías negativas)' },
  { id: 'hipermetropia', nombre: 'Hipermetropía', icono: '🔵', resumen: 'No ve bien de cerca', descripcion: 'El globo ocular es más corto. La imagen se formaría detrás de la retina, y los objetos cercanos se ven borrosos.', correccion: 'Lente convergente (convexa, dioptrías positivas)' },
  { id: 'astigmatismo', nombre: 'Astigmatismo', icono: '🟡', resumen: 'Imagen distorsionada', descripcion: 'La córnea tiene forma irregular (más ovalada que esférica). La luz se enfoca en varios puntos, creando una imagen borrosa o distorsionada a cualquier distancia.', correccion: 'Lente cilíndrica o tórica' },
  { id: 'presbicia', nombre: 'Presbicia', icono: '🟢', resumen: 'Vista cansada (>40 años)', descripcion: 'El cristalino pierde flexibilidad con la edad y no puede enfocar objetos cercanos. Afecta a casi el 100% de las personas mayores de 50 años.', correccion: 'Gafas de lectura o lentes progresivas' },
  { id: 'daltonismo', nombre: 'Daltonismo', icono: '🟣', resumen: 'Confunde colores', descripcion: 'Falta o mal funcionamiento de 1 tipo de cono. Afecta al 8% de los hombres y al 0,5% de las mujeres (gen ligado al cromosoma X). El tipo más común confunde rojo y verde.', correccion: 'No tiene corrección óptica. Existen gafas con filtros que mejoran la discriminación.' },
  { id: 'cataratas', nombre: 'Cataratas', icono: '⚪', resumen: 'Cristalino opaco', descripcion: 'El cristalino se vuelve opaco progresivamente, reduciendo la visión como mirar a través de un cristal empañado. Es la principal causa de ceguera reversible en el mundo.', correccion: 'Cirugía: se sustituye el cristalino por una lente artificial. Es la operación más frecuente del mundo.' },
];

interface Curiosidad {
  icono: string;
  texto: string;
}

const CURIOSIDADES: Curiosidad[] = [
  { icono: '⚡', texto: 'El ojo procesa ~36.000 bits de información por hora.' },
  { icono: '❤️', texto: 'La pupila se dilata hasta un 45% al ver algo que nos gusta o emociona.' },
  { icono: '👀', texto: 'Parpadeamos unas 15.000 veces al día (~10-15 veces por minuto).' },
  { icono: '🌈', texto: 'El ojo humano distingue aproximadamente 10 millones de colores diferentes.' },
  { icono: '🌙', texto: 'La visión nocturna completa tarda ~30 minutos en adaptarse (adaptación a la oscuridad).' },
  { icono: '👶', texto: 'Los bebés nacen con visión muy borrosa (~20/400). Ven bien a partir de los 6-8 meses.' },
  { icono: '🦅', texto: 'El águila tiene 5 veces más conos que el ojo humano: ve a 3 km lo que nosotros a 600 m.' },
  { icono: '🧠', texto: 'Las ilusiones ópticas demuestran que "ve" el cerebro, no el ojo. El ojo solo captura luz.' },
];

// ─────────────────────────────────────────────
// SVG Corte transversal del ojo
// ─────────────────────────────────────────────

function OjoSVG({ parteActiva, onClickParte }: { parteActiva: string | null; onClickParte: (id: string) => void }) {
  const w = 600;
  const h = 375;
  const cx = 280;
  const cy = h / 2;
  const rx = 170;
  const ry = 150;

  function estaActiva(id: string): boolean {
    return parteActiva === id;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-label="Corte transversal del ojo humano">
      {/* Fondo */}
      <rect width={w} height={h} fill="var(--bg-card, #fff)" />

      {/* Humor vítreo (interior del ojo) */}
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill={estaActiva('humor-vitreo') ? 'rgba(213,219,219,0.4)' : 'rgba(213,219,219,0.15)'}
        stroke={estaActiva('humor-vitreo') ? '#D5DBDB' : '#bbb'}
        strokeWidth={estaActiva('humor-vitreo') ? 2.5 : 1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('humor-vitreo')}
        role="button"
        tabIndex={0}
        aria-label="Humor vítreo"
      />

      {/* Retina (capa interna) */}
      <path
        d={`M ${cx + 20} ${cy - ry + 8} A ${rx - 10} ${ry - 8} 0 0 1 ${cx + 20} ${cy + ry - 8}`}
        fill="none"
        stroke={estaActiva('retina') ? '#E74C3C' : '#c0392b'}
        strokeWidth={estaActiva('retina') ? 6 : 3.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('retina')}
        role="button"
        tabIndex={0}
        aria-label="Retina"
      />

      {/* Fóvea (punto en retina posterior) */}
      <circle
        cx={cx + rx - 12} cy={cy} r={estaActiva('fovea') ? 10 : 7}
        fill={estaActiva('fovea') ? '#E67E22' : '#F39C12'}
        stroke="#E67E22"
        strokeWidth={estaActiva('fovea') ? 2.5 : 1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('fovea')}
        role="button"
        tabIndex={0}
        aria-label="Fóvea"
      />
      <text x={cx + rx + 5} y={cy - 10} fontSize="9" fill="#E67E22" fontWeight="600">Fóvea</text>

      {/* Punto ciego (un poco abajo de la fóvea, donde sale el nervio) */}
      <circle
        cx={cx + rx - 25} cy={cy + 40} r={estaActiva('punto-ciego') ? 9 : 6}
        fill={estaActiva('punto-ciego') ? '#2C3E50' : '#34495E'}
        stroke="#2C3E50"
        strokeWidth={1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('punto-ciego')}
        role="button"
        tabIndex={0}
        aria-label="Punto ciego"
      />

      {/* Nervio óptico */}
      <path
        d={`M ${cx + rx - 25} ${cy + 46} Q ${cx + rx + 40} ${cy + 80} ${cx + rx + 80} ${cy + 70}`}
        fill="none"
        stroke={estaActiva('nervio-optico') ? '#8E44AD' : '#9B59B6'}
        strokeWidth={estaActiva('nervio-optico') ? 7 : 5}
        strokeLinecap="round"
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('nervio-optico')}
        role="button"
        tabIndex={0}
        aria-label="Nervio óptico"
      />
      <text x={cx + rx + 50} y={cy + 60} fontSize="9" fill="#8E44AD" fontWeight="600">Nervio</text>
      <text x={cx + rx + 50} y={cy + 72} fontSize="9" fill="#8E44AD" fontWeight="600">óptico</text>

      {/* Córnea (parte frontal, curva más pronunciada) */}
      <path
        d={`M ${cx - rx - 10} ${cy - 55} Q ${cx - rx - 40} ${cy} ${cx - rx - 10} ${cy + 55}`}
        fill={estaActiva('cornea') ? 'rgba(52,152,219,0.25)' : 'rgba(52,152,219,0.1)'}
        stroke={estaActiva('cornea') ? '#2E86AB' : '#3498db'}
        strokeWidth={estaActiva('cornea') ? 4 : 2.5}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('cornea')}
        role="button"
        tabIndex={0}
        aria-label="Córnea"
      />
      <text x={cx - rx - 58} y={cy - 60} fontSize="9" fill="#3498db" fontWeight="600">Córnea</text>

      {/* Humor acuoso (entre córnea e iris) */}
      <ellipse
        cx={cx - rx + 15} cy={cy} rx={18} ry={40}
        fill={estaActiva('humor-acuoso') ? 'rgba(133,193,233,0.4)' : 'rgba(133,193,233,0.15)'}
        stroke={estaActiva('humor-acuoso') ? '#85C1E9' : '#AED6F1'}
        strokeWidth={estaActiva('humor-acuoso') ? 2 : 1}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('humor-acuoso')}
        role="button"
        tabIndex={0}
        aria-label="Humor acuoso"
      />

      {/* Iris (anillo muscular) */}
      <line
        x1={cx - rx + 30} y1={cy - 52} x2={cx - rx + 30} y2={cy - 15}
        stroke={estaActiva('iris') ? '#27AE60' : '#2ECC71'}
        strokeWidth={estaActiva('iris') ? 5 : 3}
        strokeLinecap="round"
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('iris')}
        role="button"
        tabIndex={0}
        aria-label="Iris superior"
      />
      <line
        x1={cx - rx + 30} y1={cy + 15} x2={cx - rx + 30} y2={cy + 52}
        stroke={estaActiva('iris') ? '#27AE60' : '#2ECC71'}
        strokeWidth={estaActiva('iris') ? 5 : 3}
        strokeLinecap="round"
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('iris')}
        role="button"
        tabIndex={0}
        aria-label="Iris inferior"
      />
      <text x={cx - rx + 38} y={cy - 45} fontSize="9" fill="#27AE60" fontWeight="600">Iris</text>

      {/* Pupila (abertura) */}
      <ellipse cx={cx - rx + 30} cy={cy} rx={4} ry={14} fill="#1A1A1A" />

      {/* Cristalino (lente biconvexa) */}
      <ellipse
        cx={cx - rx + 55} cy={cy} rx={14} ry={35}
        fill={estaActiva('cristalino') ? 'rgba(241,196,15,0.35)' : 'rgba(241,196,15,0.15)'}
        stroke={estaActiva('cristalino') ? '#F1C40F' : '#F4D03F'}
        strokeWidth={estaActiva('cristalino') ? 3 : 2}
        style={{ cursor: 'pointer' }}
        onClick={() => onClickParte('cristalino')}
        role="button"
        tabIndex={0}
        aria-label="Cristalino"
      />
      <text x={cx - rx + 40} y={cy + 48} fontSize="9" fill="#F1C40F" fontWeight="600">Cristalino</text>

      {/* Rayos de luz entrante */}
      <line x1={20} y1={cy - 30} x2={cx - rx - 15} y2={cy - 5} stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.7" />
      <line x1={20} y1={cy} x2={cx - rx - 15} y2={cy} stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.7" />
      <line x1={20} y1={cy + 30} x2={cx - rx - 15} y2={cy + 5} stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.7" />
      <text x={15} y={cy - 40} fontSize="9" fill="#FFD700" fontWeight="600">Luz</text>

      {/* Etiquetas adicionales */}
      <text x={cx} y={cy + 5} fontSize="8" fill="var(--text-muted, #999)" textAnchor="middle">Humor vítreo</text>
      <text x={cx - rx + 8} y={cy + 55} fontSize="8" fill="#85C1E9" textAnchor="middle">H. acuoso</text>

      {/* Retina label */}
      <text x={cx + rx - 50} y={cy - ry + 25} fontSize="9" fill="#E74C3C" fontWeight="600">Retina</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG Defectos visuales
// ─────────────────────────────────────────────

function DefectoSVG({ defectoId }: { defectoId: string }) {
  const w = 480;
  const h = 210;
  const eyeCx = 240;
  const eyeCy = 105;
  const eyeRx = 100;
  const eyeRy = 70;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-label={`Diagrama de ${defectoId}`}>
      <rect width={w} height={h} fill="var(--bg-primary, #fafafa)" />

      {/* Ojo base */}
      <ellipse cx={eyeCx} cy={eyeCy} rx={eyeRx} ry={eyeRy}
        fill="rgba(213,219,219,0.15)" stroke="#bbb" strokeWidth="1.5" />

      {/* Retina */}
      <path
        d={`M ${eyeCx + 20} ${eyeCy - eyeRy + 8} A ${eyeRx - 10} ${eyeRy - 8} 0 0 1 ${eyeCx + 20} ${eyeCy + eyeRy - 8}`}
        fill="none" stroke="#c0392b" strokeWidth="3"
      />

      {/* Cristalino */}
      <ellipse cx={eyeCx - eyeRx + 40} cy={eyeCy} rx={10} ry={28}
        fill="rgba(241,196,15,0.2)" stroke="#F4D03F" strokeWidth="1.5" />

      {defectoId === 'miopia' && (
        <>
          {/* Ojo alargado */}
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Miopía: ojo demasiado largo
          </text>
          {/* Rayos que convergen antes de la retina */}
          <line x1={60} y1={eyeCy - 20} x2={eyeCx + 30} y2={eyeCy} stroke="#E74C3C" strokeWidth="2" />
          <line x1={60} y1={eyeCy + 20} x2={eyeCx + 30} y2={eyeCy} stroke="#E74C3C" strokeWidth="2" />
          {/* Punto de enfoque (antes de retina) */}
          <circle cx={eyeCx + 30} cy={eyeCy} r={5} fill="#E74C3C" opacity="0.7" />
          <text x={eyeCx + 30} y={eyeCy + 22} fontSize="9" fill="#E74C3C" textAnchor="middle" fontWeight="600">
            Foco antes de retina
          </text>
          {/* Lente correctora */}
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Corrección: lente divergente (-)
          </text>
        </>
      )}

      {defectoId === 'hipermetropia' && (
        <>
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Hipermetropía: ojo demasiado corto
          </text>
          {/* Rayos que convergen después de la retina */}
          <line x1={60} y1={eyeCy - 20} x2={eyeCx + eyeRx + 30} y2={eyeCy} stroke="#3498db" strokeWidth="2" />
          <line x1={60} y1={eyeCy + 20} x2={eyeCx + eyeRx + 30} y2={eyeCy} stroke="#3498db" strokeWidth="2" />
          <circle cx={eyeCx + eyeRx + 30} cy={eyeCy} r={5} fill="#3498db" opacity="0.7" />
          <text x={eyeCx + eyeRx + 30} y={eyeCy + 22} fontSize="9" fill="#3498db" textAnchor="middle" fontWeight="600">
            Foco detrás
          </text>
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Corrección: lente convergente (+)
          </text>
        </>
      )}

      {defectoId === 'astigmatismo' && (
        <>
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Astigmatismo: córnea irregular
          </text>
          {/* Múltiples puntos de enfoque */}
          <line x1={60} y1={eyeCy - 25} x2={eyeCx + 20} y2={eyeCy - 10} stroke="#F39C12" strokeWidth="2" />
          <line x1={60} y1={eyeCy} x2={eyeCx + 50} y2={eyeCy} stroke="#F39C12" strokeWidth="2" />
          <line x1={60} y1={eyeCy + 25} x2={eyeCx + 35} y2={eyeCy + 8} stroke="#F39C12" strokeWidth="2" />
          <circle cx={eyeCx + 20} cy={eyeCy - 10} r={4} fill="#F39C12" opacity="0.7" />
          <circle cx={eyeCx + 50} cy={eyeCy} r={4} fill="#F39C12" opacity="0.7" />
          <circle cx={eyeCx + 35} cy={eyeCy + 8} r={4} fill="#F39C12" opacity="0.7" />
          <text x={eyeCx + 35} y={eyeCy + 30} fontSize="9" fill="#F39C12" textAnchor="middle" fontWeight="600">
            Varios focos
          </text>
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Corrección: lente cilíndrica o tórica
          </text>
        </>
      )}

      {defectoId === 'presbicia' && (
        <>
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Presbicia: cristalino rígido (&gt;40 años)
          </text>
          <line x1={60} y1={eyeCy - 15} x2={eyeCx + eyeRx + 10} y2={eyeCy} stroke="#27AE60" strokeWidth="2" />
          <line x1={60} y1={eyeCy + 15} x2={eyeCx + eyeRx + 10} y2={eyeCy} stroke="#27AE60" strokeWidth="2" />
          <circle cx={eyeCx + eyeRx + 10} cy={eyeCy} r={4} fill="#27AE60" opacity="0.7" />
          <text x={eyeCx + eyeRx + 10} y={eyeCy + 20} fontSize="9" fill="#27AE60" textAnchor="middle" fontWeight="600">
            No enfoca de cerca
          </text>
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Corrección: gafas de lectura o progresivas
          </text>
        </>
      )}

      {defectoId === 'daltonismo' && (
        <>
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Daltonismo: falta 1 tipo de cono
          </text>
          {/* 3 conos, uno tachado */}
          <circle cx={eyeCx - 40} cy={eyeCy} r={15} fill="#3498db" opacity="0.8" />
          <text x={eyeCx - 40} y={eyeCy + 4} fontSize="9" fill="white" textAnchor="middle" fontWeight="700">S</text>
          <circle cx={eyeCx} cy={eyeCy} r={15} fill="#27AE60" opacity="0.8" />
          <text x={eyeCx} y={eyeCy + 4} fontSize="9" fill="white" textAnchor="middle" fontWeight="700">M</text>
          <circle cx={eyeCx + 40} cy={eyeCy} r={15} fill="#ccc" opacity="0.6" />
          <text x={eyeCx + 40} y={eyeCy + 4} fontSize="9" fill="#999" textAnchor="middle" fontWeight="700">L</text>
          <line x1={eyeCx + 28} y1={eyeCy - 12} x2={eyeCx + 52} y2={eyeCy + 12} stroke="#E74C3C" strokeWidth="3" />
          <text x={eyeCx} y={eyeCy + 40} fontSize="9" fill="var(--text-secondary, #666)" textAnchor="middle">
            8% hombres / 0,5% mujeres (cromosoma X)
          </text>
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Sin corrección óptica. Gafas con filtros especiales.
          </text>
        </>
      )}

      {defectoId === 'cataratas' && (
        <>
          <text x={eyeCx} y={20} fontSize="11" fill="var(--text-primary, #1a1a1a)" textAnchor="middle" fontWeight="600">
            Cataratas: cristalino opaco
          </text>
          {/* Cristalino opaco */}
          <ellipse cx={eyeCx - eyeRx + 40} cy={eyeCy} rx={12} ry={30}
            fill="rgba(150,150,150,0.6)" stroke="#999" strokeWidth="2" />
          <line x1={60} y1={eyeCy - 15} x2={eyeCx - eyeRx + 28} y2={eyeCy - 5} stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <line x1={60} y1={eyeCy + 15} x2={eyeCx - eyeRx + 28} y2={eyeCy + 5} stroke="#FFD700" strokeWidth="2" opacity="0.5" />
          <text x={eyeCx} y={eyeCy + 50} fontSize="9" fill="var(--text-secondary, #666)" textAnchor="middle">
            La luz no pasa bien → visión borrosa
          </text>
          <text x={eyeCx} y={h - 10} fontSize="10" fill="var(--primary, #2E86AB)" textAnchor="middle" fontWeight="600">
            Corrección: cirugía (la más frecuente del mundo)
          </text>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOjoHumanoVisionPage() {
  const [seccion, setSeccion] = useState<Seccion>('anatomia');
  const [parteActiva, setParteActiva] = useState<string | null>(null);
  const [defectoAbierto, setDefectoAbierto] = useState<string | null>(null);

  function toggleDefecto(id: string) {
    setDefectoAbierto(prev => (prev === id ? null : id));
  }

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <p className={styles.heroTag} aria-hidden="true">Biología visual interactiva</p>
          <h1 className={styles.title}>El Ojo Humano y la Visión</h1>
          <p className={styles.subtitle}>
            Anatomía interactiva del ojo, fotorreceptores, defectos visuales y curiosidades.
            Descubre cómo convertimos la luz en imágenes.
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <div className={styles.navGrid} role="tablist" aria-label="Secciones del ojo humano">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={seccion === s.id}
              aria-controls={`panel-${s.id}`}
              className={`${styles.navBtn} ${seccion === s.id ? styles.navBtnActivo : ''}`}
              onClick={() => setSeccion(s.id)}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navLabel}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── SECCIÓN 1: ANATOMÍA ── */}
        {seccion === 'anatomia' && (
          <div id="panel-anatomia" role="tabpanel">
            <div className={styles.svgContainer}>
              <OjoSVG parteActiva={parteActiva} onClickParte={setParteActiva} />
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">👆</span>
                Haz clic en cualquier parte del diagrama o en las tarjetas para ver su función y un dato curioso.
              </p>
            </div>

            <div className={styles.partesGrid}>
              {PARTES_OJO.map(parte => (
                <button
                  key={parte.id}
                  type="button"
                  className={`${styles.parteCard} ${parteActiva === parte.id ? styles.parteCardActivo : ''}`}
                  onClick={() => setParteActiva(parteActiva === parte.id ? null : parte.id)}
                  aria-expanded={parteActiva === parte.id}
                >
                  <div className={styles.parteHeader}>
                    <span className={styles.parteNombre}>{parte.nombre}</span>
                    <span className={styles.parteTag} style={{ background: parte.color }}>{parte.id === 'punto-ciego' ? 'Sin receptores' : 'Activo'}</span>
                  </div>
                  {parteActiva === parte.id && (
                    <>
                      <p className={styles.parteDesc}>{parte.funcion}</p>
                      <span className={styles.parteDato}>
                        <span aria-hidden="true">💡 </span>{parte.dato}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECCIÓN 2: CONOS Y BASTONES ── */}
        {seccion === 'conos-bastones' && (
          <div id="panel-conos-bastones" role="tabpanel">
            <div className={styles.comparativaGrid}>
              <div className={styles.comparativaCard}>
                <span className={styles.comparativaIcono} aria-hidden="true">🌙</span>
                <h3 className={styles.comparativaTitulo}>Bastones</h3>
                <span className={styles.comparativaNumero}>{formatNumber(120000000, 0)}</span>
                <span className={styles.comparativaUnidad}>120 millones por ojo</span>
                <p className={styles.comparativaDetalle}>
                  Visión nocturna y periférica. No distinguen colores (blanco y negro).
                  Son 100 veces más sensibles a la luz que los conos.
                  Abundan en la periferia de la retina.
                </p>
              </div>
              <div className={styles.comparativaCard}>
                <span className={styles.comparativaIcono} aria-hidden="true">☀️</span>
                <h3 className={styles.comparativaTitulo}>Conos</h3>
                <span className={styles.comparativaNumero}>{formatNumber(6000000, 0)}</span>
                <span className={styles.comparativaUnidad}>6 millones por ojo</span>
                <p className={styles.comparativaDetalle}>
                  Visión diurna, color y detalle fino.
                  Se concentran en la fóvea (centro de la retina).
                  3 tipos que, combinados, perciben millones de colores.
                </p>
              </div>
            </div>

            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontSize: '1.05rem' }}>
              Los 3 tipos de conos (síntesis aditiva)
            </h3>
            <div className={styles.conosGrid}>
              {TIPOS_CONOS.map(cono => (
                <div key={cono.id} className={styles.conoCard} style={{ borderColor: cono.color }}>
                  <span className={styles.conoNombre} style={{ color: cono.color }}>{cono.nombre}</span>
                  <span className={styles.conoLambda}>Pico: {cono.lambda}</span>
                  <span className={styles.conoLambda}>Sensible a: {cono.sensibilidad}</span>
                  <div className={styles.conoBarra} style={{ background: cono.color }} />
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">🎨</span>
                Con solo 3 tipos de conos (rojo, verde, azul) el cerebro mezcla las señales para percibir ~10 millones de colores.
                Es el mismo principio que usan las pantallas (RGB): síntesis aditiva de color.
              </p>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>100×</span>
                <span className={styles.statLabel}>Bastones más sensibles a la luz que conos</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>20:1</span>
                <span className={styles.statLabel}>Ratio bastones/conos en el ojo</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>1,5 mm</span>
                <span className={styles.statLabel}>Diámetro de la fóvea (solo conos)</span>
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">🌙</span>
                <strong>Visión nocturna:</strong> en la oscuridad, solo funcionan los bastones.
                Por eso de noche no distinguimos colores (todo parece gris).
                Los bastones predominan en la periferia, así que vemos mejor por el &quot;rabillo del ojo&quot; en condiciones de poca luz.
              </p>
            </div>
          </div>
        )}

        {/* ── SECCIÓN 3: DEFECTOS VISUALES ── */}
        {seccion === 'defectos' && (
          <div id="panel-defectos" role="tabpanel">
            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">👓</span>
                Más del 60% de la población mundial necesita corrección visual.
                Haz clic en cada defecto para ver el diagrama y la corrección.
              </p>
            </div>

            <div className={styles.defectosGrid}>
              {DEFECTOS.map(defecto => (
                <button
                  key={defecto.id}
                  type="button"
                  className={`${styles.defectoCard} ${defectoAbierto === defecto.id ? styles.defectoCardActivo : ''}`}
                  onClick={() => toggleDefecto(defecto.id)}
                  aria-expanded={defectoAbierto === defecto.id}
                >
                  <div className={styles.defectoHeader}>
                    <span className={styles.defectoIcono} aria-hidden="true">{defecto.icono}</span>
                    <div className={styles.defectoInfo}>
                      <span className={styles.defectoNombre}>{defecto.nombre}</span>
                      <span className={styles.defectoResumen}>{defecto.resumen}</span>
                    </div>
                    <span
                      className={`${styles.defectoChevron} ${defectoAbierto === defecto.id ? styles.defectoChevronOpen : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </div>
                  {defectoAbierto === defecto.id && (
                    <div className={styles.defectoDetalle}>
                      <div className={styles.defectoSvgContainer}>
                        <DefectoSVG defectoId={defecto.id} />
                      </div>
                      <p className={styles.defectoTexto}>{defecto.descripcion}</p>
                      <span className={styles.defectoCorreccion}>
                        <span aria-hidden="true">✅ </span>{defecto.correccion}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECCIÓN 4: DATOS Y CURIOSIDADES ── */}
        {seccion === 'datos' && (
          <div id="panel-datos" role="tabpanel">
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>{formatNumber(36000, 0)}</span>
                <span className={styles.statLabel}>Bits/hora procesados por el ojo</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>~10 M</span>
                <span className={styles.statLabel}>Colores distinguibles</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumero}>{formatNumber(15000, 0)}</span>
                <span className={styles.statLabel}>Parpadeos al día</span>
              </div>
            </div>

            <div className={styles.curiosidadesGrid}>
              {CURIOSIDADES.map((c, i) => (
                <div key={i} className={styles.curiosidadCard}>
                  <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
                  <p className={styles.curiosidadTexto}>{c.texto}</p>
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">🔬</span>
                <strong>Dato clave:</strong> La retina del ojo humano tiene una resolución equivalente a ~576 megapíxeles.
                Sin embargo, solo la fóvea (centro) ofrece alta resolución. El resto de la retina detecta movimiento
                y formas con menor detalle, y el cerebro &quot;rellena&quot; la imagen para que parezca nítida en todas partes.
              </p>
            </div>
          </div>
        )}

        {/* Sección educativa */}
        <EducationalSection
          title="Profundiza en la visión humana"
          subtitle="Conceptos clave de biología y óptica visual"
          defaultOpen={false}
        >
          <h3>El camino de la luz hasta el cerebro</h3>
          <p>
            La luz entra por la córnea (que refracta ~70% del total), pasa por el humor acuoso, atraviesa la pupila
            (regulada por el iris), es enfocada por el cristalino, cruza el humor vítreo y llega a la retina.
            Allí, los fotorreceptores (conos y bastones) convierten la energía luminosa en impulsos eléctricos
            que viajan por el nervio óptico hasta la corteza visual occipital del cerebro.
            Todo este proceso tarda apenas 13 milisegundos.
          </p>

          <h3>Adaptación a la luz y la oscuridad</h3>
          <p>
            Cuando pasas de un lugar iluminado a uno oscuro, los bastones necesitan ~30 minutos para alcanzar
            su máxima sensibilidad (produciendo rodopsina, el pigmento visual). En cambio, la adaptación a la luz
            es mucho más rápida: solo 5 minutos, porque los conos se saturan y la pupila se contrae rápidamente.
            Los piratas usaban un parche en un ojo para mantener un ojo siempre adaptado a la oscuridad bajo cubierta.
          </p>

          <h3>El cerebro completa la imagen</h3>
          <p>
            El ojo no funciona como una cámara pasiva. El cerebro realiza un procesamiento masivo: corrige la imagen
            invertida que llega a la retina, rellena el punto ciego, estabiliza la imagen a pesar de los movimientos
            oculares (3 sacadas por segundo), y fusiona las imágenes de ambos ojos para crear percepción de profundidad
            (visión estereoscópica). Las ilusiones ópticas son &quot;errores&quot; en este procesamiento cerebral.
          </p>

          <h3>Daltonismo y genética</h3>
          <p>
            Los genes de los conos M (verde) y L (rojo) están en el cromosoma X. Como los hombres solo tienen un
            cromosoma X (XY), basta con una mutación para causar daltonismo. Las mujeres (XX) necesitan la mutación
            en ambos cromosomas, lo que explica la diferencia: 8% de hombres vs 0,5% de mujeres.
            Curiosamente, algunas mujeres son &quot;tetracromáticas&quot; (4 tipos de conos) y pueden distinguir
            ~100 millones de colores.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Los diagramas SVG son representaciones simplificadas con fines educativos.
            Las proporciones anatómicas están adaptadas para facilitar la comprensión visual.
            Este visualizador no sustituye en ningún caso la consulta con un profesional de la salud visual.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ojo-humano-vision')} />
        <ShareCard appName="visualizador-ojo-humano-vision" />
        <Footer appName="visualizador-ojo-humano-vision" />
    </div>
  );
}
