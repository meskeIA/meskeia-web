'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './FasesLuna.module.css';
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

type Seccion = 'fases' | 'eclipses' | 'mareas' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'fases', titulo: 'Fases lunares', icono: '🌙', subtitulo: '8 fases del ciclo lunar' },
  { id: 'eclipses', titulo: 'Eclipses', icono: '🌑', subtitulo: 'Solar y lunar explicados' },
  { id: 'mareas', titulo: 'Las mareas', icono: '🌊', subtitulo: 'La Luna mueve los océanos' },
  { id: 'datos', titulo: 'Datos fascinantes', icono: '✨', subtitulo: 'Curiosidades cósmicas' },
];

// ─────────────────────────────────────────────
// Datos de fases lunares
// ─────────────────────────────────────────────

interface FaseLunar {
  nombre: string;
  angulo: number; // grados en la órbita (0 = luna nueva, entre Sol y Tierra)
  descripcion: string;
  iluminacion: string;
  dia: number; // día aproximado del ciclo
}

const FASES: FaseLunar[] = [
  { nombre: 'Luna nueva', angulo: 0, descripcion: 'La Luna está entre el Sol y la Tierra. La cara iluminada mira al Sol, invisible desde la Tierra.', iluminacion: '0%', dia: 0 },
  { nombre: 'Creciente', angulo: 45, descripcion: 'Aparece una fina franja iluminada en el lado derecho (hemisferio norte).', iluminacion: '~25%', dia: 3.7 },
  { nombre: 'Cuarto creciente', angulo: 90, descripcion: 'La mitad derecha está iluminada. La Luna forma un ángulo recto Sol-Tierra-Luna.', iluminacion: '50%', dia: 7.4 },
  { nombre: 'Creciente gibosa', angulo: 135, descripcion: 'Más de la mitad está iluminada, creciendo hacia la luna llena.', iluminacion: '~75%', dia: 11.1 },
  { nombre: 'Luna llena', angulo: 180, descripcion: 'La Tierra está entre el Sol y la Luna. Toda la cara visible está iluminada.', iluminacion: '100%', dia: 14.8 },
  { nombre: 'Menguante gibosa', angulo: 225, descripcion: 'La iluminación comienza a decrecer por el lado derecho.', iluminacion: '~75%', dia: 18.4 },
  { nombre: 'Cuarto menguante', angulo: 270, descripcion: 'La mitad izquierda está iluminada. Ángulo recto Sol-Tierra-Luna opuesto.', iluminacion: '50%', dia: 22.1 },
  { nombre: 'Menguante', angulo: 315, descripcion: 'Solo queda una fina franja iluminada en el lado izquierdo.', iluminacion: '~25%', dia: 25.8 },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  descripcion: string;
  extra: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🌙', titulo: 'Distancia Tierra-Luna', descripcion: 'La Luna está a 384.400 km — 1,3 segundos-luz.', extra: 'Si pudieras conducir a 120 km/h sin parar, tardarías 133 días.' },
  { icono: '🌑', titulo: 'Eclipse total máximo', descripcion: 'Un eclipse solar total dura como máximo 7 minutos 32 segundos.', extra: 'La mayoría dura entre 2 y 4 minutos. En un punto dado, ocurre cada ~375 años.' },
  { icono: '🌊', titulo: 'Gravedad lunar', descripcion: 'La gravedad de la Luna es solo 1/6 de la terrestre.', extra: 'Si pesas 70 kg en la Tierra, en la Luna pesarías solo 11,7 kg.' },
  { icono: '🔴', titulo: 'Luna de sangre', descripcion: 'La luna se ve roja por la misma razón que los atardeceres.', extra: 'La atmósfera terrestre filtra la luz azul y refracta la roja hacia la Luna.' },
  { icono: '📏', titulo: 'La Luna se aleja', descripcion: 'La Luna se aleja 3,8 cm al año de la Tierra.', extra: 'Roba energía rotacional: la Tierra se frena ~2,3 ms por siglo.' },
  { icono: '🌍', titulo: 'Estabilizador cósmico', descripcion: 'Sin la Luna, el eje terrestre oscilaría caóticamente.', extra: 'No habría estaciones estables — la vida compleja sería mucho más difícil.' },
  { icono: '👀', titulo: 'Siempre la misma cara', descripcion: 'La Luna tarda lo mismo en rotar que en orbitar: 29,5 días.', extra: 'Se llama rotación sincrónica, causada por el acoplamiento gravitatorio.' },
];

// ─────────────────────────────────────────────
// Próximos eclipses visibles desde España
// ─────────────────────────────────────────────

interface EclipseProximo {
  fecha: string;
  tipo: string;
  visibilidad: string;
}

const PROXIMOS_ECLIPSES: EclipseProximo[] = [
  { fecha: '7 septiembre 2025', tipo: 'Eclipse lunar total', visibilidad: 'Visible parcialmente desde España' },
  { fecha: '29 marzo 2025', tipo: 'Eclipse solar parcial', visibilidad: 'Visible desde el norte de España (~30% ocultación)' },
  { fecha: '12 agosto 2026', tipo: 'Eclipse solar total', visibilidad: 'Visible como total desde el norte de España' },
  { fecha: '31 diciembre 2028', tipo: 'Eclipse lunar total', visibilidad: 'Visible completamente desde España' },
];

// ─────────────────────────────────────────────
// Componente SVG: Diagrama orbital
// ─────────────────────────────────────────────

function DiagramaOrbital({ faseIndex, onFaseClick }: { faseIndex: number; onFaseClick: (i: number) => void }) {
  const cx = 250;
  const cy = 200;
  const radioOrbita = 140;

  return (
    <svg viewBox="0 0 500 400" className={styles.svgOrbital} role="img" aria-label="Diagrama cenital del sistema Sol-Tierra-Luna con las 8 fases lunares">
      {/* Rayos de luz solar (izquierda) */}
      {[80, 140, 200, 260, 320].map((y) => (
        <line key={y} x1={0} y1={y} x2={80} y2={y} stroke="#FFB300" strokeWidth={1} opacity={0.3} />
      ))}

      {/* Sol a la izquierda */}
      <circle cx={40} cy={200} r={30} fill="url(#solGradient)" />
      <text x={40} y={250} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Sol</text>

      {/* Órbita lunar */}
      <circle cx={cx} cy={cy} r={radioOrbita} fill="none" stroke="var(--border, #E5E5E5)" strokeWidth={1} strokeDasharray="4 4" />

      {/* Tierra en el centro */}
      <circle cx={cx} cy={cy} r={18} fill="url(#tierraGradient)" />
      <text x={cx} y={cy + 34} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Tierra</text>

      {/* 8 posiciones lunares */}
      {FASES.map((fase, i) => {
        const rad = (fase.angulo - 90) * (Math.PI / 180);
        const lx = cx + radioOrbita * Math.cos(rad);
        const ly = cy + radioOrbita * Math.sin(rad);
        const esActiva = i === faseIndex;
        const lunaR = 12;

        // Calcular iluminación: el lado que "mira" al Sol
        // Ángulo del Sol respecto a la Luna
        const anguloSol = Math.atan2(200 - ly, 40 - lx);
        const clipId = `clip-luna-${i}`;

        return (
          <g key={i}>
            <defs>
              <clipPath id={clipId}>
                <circle cx={lx} cy={ly} r={lunaR} />
              </clipPath>
            </defs>
            {/* Fondo oscuro de la Luna */}
            <circle cx={lx} cy={ly} r={lunaR} fill="#444" />
            {/* Parte iluminada */}
            <ellipse
              cx={lx + lunaR * Math.cos(anguloSol) * 0.3}
              cy={ly + lunaR * Math.sin(anguloSol) * 0.3}
              rx={lunaR * Math.abs(Math.cos(fase.angulo * Math.PI / 180))}
              ry={lunaR}
              fill="#F5F5DC"
              clipPath={`url(#${clipId})`}
              transform={`rotate(${anguloSol * 180 / Math.PI}, ${lx}, ${ly})`}
            />
            {/* Borde clickable */}
            <circle
              cx={lx}
              cy={ly}
              r={lunaR + 4}
              fill="none"
              stroke={esActiva ? '#2E86AB' : 'transparent'}
              strokeWidth={2}
              cursor="pointer"
              onClick={() => onFaseClick(i)}
              role="button"
              aria-label={`Fase: ${fase.nombre}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onFaseClick(i); }}
            />
            {/* Número */}
            <text x={lx} y={ly - lunaR - 8} textAnchor="middle" fill={esActiva ? '#2E86AB' : 'var(--text-muted, #999)'} fontSize={9} fontWeight={esActiva ? 700 : 400}>{i + 1}</text>
          </g>
        );
      })}

      {/* Gradientes */}
      <defs>
        <radialGradient id="solGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <radialGradient id="tierraGradient" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#2E86AB" />
          <stop offset="100%" stopColor="#1565C0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG: Vista de la Luna desde la Tierra
// ─────────────────────────────────────────────

function VistaLunaDesdetierra({ faseIndex }: { faseIndex: number }) {
  const fase = FASES[faseIndex];
  const r = 50;
  const cx = 60;
  const cy = 60;
  // Calculamos cuánto se ilumina según la posición orbital
  // angulo 0 = luna nueva (0%), 180 = luna llena (100%)
  const anguloRad = fase.angulo * Math.PI / 180;
  // terminator: posición x del elipse que divide luz/sombra
  const terminatorRx = Math.abs(Math.cos(anguloRad)) * r;
  const esIzquierda = fase.angulo > 180; // La parte iluminada está a la izquierda
  const esDerecha = fase.angulo > 0 && fase.angulo <= 180;

  return (
    <svg viewBox="0 0 120 120" className={styles.svgVistaLuna} role="img" aria-label={`Aspecto de la Luna en fase: ${fase.nombre}`}>
      {/* Fondo oscuro */}
      <circle cx={cx} cy={cy} r={r} fill="#333" />

      {/* Mitad iluminada (clippath) */}
      {fase.angulo === 0 ? null : fase.angulo === 180 ? (
        <circle cx={cx} cy={cy} r={r} fill="#F5F5DC" />
      ) : (
        <>
          <defs>
            <clipPath id="lunaVisClip">
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          </defs>
          {/* Mitad iluminada */}
          {esDerecha && (
            <g clipPath="url(#lunaVisClip)">
              <rect x={cx} y={cy - r} width={r} height={r * 2} fill="#F5F5DC" />
              <ellipse cx={cx} cy={cy} rx={terminatorRx} ry={r}
                fill={fase.angulo <= 90 ? '#F5F5DC' : '#333'} />
            </g>
          )}
          {esIzquierda && (
            <g clipPath="url(#lunaVisClip)">
              <rect x={cx - r} y={cy - r} width={r} height={r * 2} fill="#F5F5DC" />
              <ellipse cx={cx} cy={cy} rx={terminatorRx} ry={r}
                fill={fase.angulo >= 270 ? '#F5F5DC' : '#333'} />
            </g>
          )}
        </>
      )}

      {/* Borde sutil */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#666" strokeWidth={1} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG: Eclipse Solar
// ─────────────────────────────────────────────

function DiagramaEclipseSolar() {
  return (
    <svg viewBox="0 0 500 280" className={styles.svgEclipse} role="img" aria-label="Diagrama de eclipse solar: la Luna entre el Sol y la Tierra">
      {/* Sol */}
      <circle cx={60} cy={140} r={45} fill="url(#solGradEcl)" />
      <text x={60} y={200} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Sol</text>

      {/* Conos de sombra */}
      <polygon points="240,125 240,155 460,80 460,200" fill="rgba(0,0,0,0.08)" stroke="none" />
      <polygon points="240,130 240,150 400,110 400,170" fill="rgba(0,0,0,0.15)" stroke="none" />

      {/* Etiquetas sombra */}
      <text x={350} y={108} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={9}>Penumbra</text>
      <text x={330} y={145} textAnchor="middle" fill="var(--text-secondary, #666)" fontSize={9} fontWeight={600}>Umbra</text>

      {/* Luna */}
      <circle cx={240} cy={140} r={15} fill="#555" />
      <text x={240} y={170} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Luna</text>

      {/* Tierra */}
      <circle cx={420} cy={140} r={22} fill="url(#tierraGradEcl)" />
      <text x={420} y={178} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Tierra</text>

      {/* Franja de totalidad */}
      <line x1={410} y1={132} x2={430} y2={132} stroke="#FF5722" strokeWidth={3} />
      <text x={420} y={126} textAnchor="middle" fill="#FF5722" fontSize={8} fontWeight={600}>~270 km</text>

      <defs>
        <radialGradient id="solGradEcl" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <radialGradient id="tierraGradEcl" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#2E86AB" />
          <stop offset="100%" stopColor="#1565C0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG: Eclipse Lunar
// ─────────────────────────────────────────────

function DiagramaEclipseLunar() {
  return (
    <svg viewBox="0 0 500 280" className={styles.svgEclipse} role="img" aria-label="Diagrama de eclipse lunar: la Tierra entre el Sol y la Luna">
      {/* Sol */}
      <circle cx={60} cy={140} r={45} fill="url(#solGradEclL)" />
      <text x={60} y={200} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Sol</text>

      {/* Conos de sombra de la Tierra */}
      <polygon points="280,108 280,172 480,60 480,220" fill="rgba(0,0,0,0.08)" stroke="none" />
      <polygon points="280,118 280,162 440,100 440,180" fill="rgba(0,0,0,0.15)" stroke="none" />

      <text x={400} y={96} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={9}>Penumbra</text>
      <text x={370} y={143} textAnchor="middle" fill="var(--text-secondary, #666)" fontSize={9} fontWeight={600}>Umbra</text>

      {/* Tierra */}
      <circle cx={270} cy={140} r={22} fill="url(#tierraGradEclL)" />
      <text x={270} y={178} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={11}>Tierra</text>

      {/* Luna (roja en eclipse total) */}
      <circle cx={430} cy={140} r={13} fill="#B71C1C" opacity={0.7} />
      <circle cx={430} cy={140} r={13} fill="none" stroke="#FF5722" strokeWidth={1.5} />
      <text x={430} y={168} textAnchor="middle" fill="#FF5722" fontSize={10} fontWeight={600}>Luna roja</text>
      <text x={430} y={180} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={8}>&quot;Luna de sangre&quot;</text>

      {/* Arco de refracción atmosférica */}
      <path d="M 258,118 Q 240,140 258,162" fill="none" stroke="#FF7043" strokeWidth={1} strokeDasharray="3 2" />
      <text x={230} y={145} textAnchor="middle" fill="#FF7043" fontSize={7}>Luz refractada</text>

      <defs>
        <radialGradient id="solGradEclL" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#E65100" />
        </radialGradient>
        <radialGradient id="tierraGradEclL" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#2E86AB" />
          <stop offset="100%" stopColor="#1565C0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente SVG: Mareas
// ─────────────────────────────────────────────

function DiagramaMareas({ tipo }: { tipo: 'vivas' | 'muertas' }) {
  const cx = 200;
  const cy = 160;

  return (
    <svg viewBox="0 0 400 320" className={styles.svgMareas} role="img" aria-label={`Diagrama de mareas ${tipo}: ${tipo === 'vivas' ? 'Sol y Luna alineados' : 'Sol y Luna en ángulo recto'}`}>
      {/* Tierra */}
      <circle cx={cx} cy={cy} r={40} fill="url(#tierraGradM)" />

      {/* Abultamientos de agua */}
      <ellipse cx={cx} cy={cy} rx={65} ry={48} fill="rgba(46,134,171,0.2)" stroke="#2E86AB" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* Etiquetas marea alta */}
      <text x={cx + 70} y={cy + 4} fontSize={8} fill="#2E86AB" fontWeight={600}>Marea alta</text>
      <text x={cx - 70} y={cy + 4} fontSize={8} fill="#2E86AB" fontWeight={600} textAnchor="end">Marea alta</text>

      {/* Luna */}
      {tipo === 'vivas' ? (
        <>
          <circle cx={cx + 120} cy={cy} r={14} fill="#888" />
          <text x={cx + 120} y={cy + 28} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={10}>Luna</text>
          {/* Sol alineado */}
          <circle cx={cx - 160} cy={cy} r={20} fill="#FFB300" />
          <text x={cx - 160} y={cy + 34} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={10}>Sol</text>
          {/* Flecha de alineación */}
          <line x1={cx - 130} y1={cy} x2={cx + 100} y2={cy} stroke="#FFB300" strokeWidth={1} strokeDasharray="6 3" opacity={0.5} />
        </>
      ) : (
        <>
          <circle cx={cx + 120} cy={cy} r={14} fill="#888" />
          <text x={cx + 120} y={cy + 28} textAnchor="middle" fill="var(--text-muted, #999)" fontSize={10}>Luna</text>
          {/* Sol en ángulo recto */}
          <circle cx={cx} cy={cy - 130} r={20} fill="#FFB300" />
          <text x={cx + 28} y={cy - 126} fill="var(--text-muted, #999)" fontSize={10}>Sol</text>
          {/* Indicador ángulo recto */}
          <path d="M 210,100 L 210,120 L 230,120" fill="none" stroke="var(--text-muted, #999)" strokeWidth={1} />
          <text x={cx + 40} y={cy - 90} fill="var(--text-muted, #999)" fontSize={8}>90°</text>
        </>
      )}

      {/* Texto inferior */}
      <text x={cx} y={cy + 80} textAnchor="middle" fontSize={11} fill="var(--text-primary, #1A1A1A)" fontWeight={600}>
        {tipo === 'vivas' ? 'Mareas vivas (Luna nueva / llena)' : 'Mareas muertas (Cuartos)'}
      </text>
      <text x={cx} y={cy + 96} textAnchor="middle" fontSize={9} fill="var(--text-secondary, #666)">
        {tipo === 'vivas' ? 'Sol y Luna alineados → fuerzas se suman' : 'Sol y Luna a 90° → fuerzas se contrarrestan'}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFasesLunaEclipsesPage() {
  const [seccion, setSeccion] = useState<Seccion>('fases');
  const [faseIndex, setFaseIndex] = useState(0);
  const [tipoEclipse, setTipoEclipse] = useState<'solar' | 'lunar'>('solar');
  const [tipoMarea, setTipoMarea] = useState<'vivas' | 'muertas'>('vivas');
  const [datoExpandido, setDatoExpandido] = useState<number | null>(null);

  const faseActual = FASES[faseIndex];

  const relatedApps = useMemo(() => getRelatedApps('visualizador-fases-luna-eclipses'), []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌙 Fases de la Luna y Eclipses</h1>
          <p className={styles.subtitle}>La danza Sol-Tierra-Luna: fases, eclipses, mareas y curiosidades</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find((s) => s.id === seccion)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find((s) => s.id === seccion)?.subtitulo}
          </p>
        </div>

        <div className={styles.seccionContent}>
          {/* ═══════ SECCIÓN 1: FASES LUNARES ═══════ */}
          {seccion === 'fases' && (
            <>
              <div className={styles.contexto}>
                El ciclo lunar completo dura <strong>29,5 días</strong> (mes sinódico).
                Las fases NO son la sombra de la Tierra — es el <strong>ángulo de luz solar</strong>.
              </div>

              <DiagramaOrbital faseIndex={faseIndex} onFaseClick={setFaseIndex} />

              {/* Slider */}
              <div className={styles.sliderZona}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>Posición orbital</span>
                  <span className={styles.sliderValor}>{faseActual.nombre}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={faseIndex}
                  onChange={(e) => setFaseIndex(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Seleccionar fase lunar"
                />
                <div className={styles.sliderExtremos}>
                  <span>Luna nueva</span>
                  <span>Luna llena</span>
                  <span>Menguante</span>
                </div>
              </div>

              {/* Detalle de la fase seleccionada */}
              <div className={styles.faseDetalle}>
                <div className={styles.faseDetalleHeader}>
                  <VistaLunaDesdetierra faseIndex={faseIndex} />
                  <div className={styles.faseDetalleInfo}>
                    <h3 className={styles.faseDetalleNombre}>{faseActual.nombre}</h3>
                    <p className={styles.faseDetalleDia}>Día ~{formatNumber(faseActual.dia, 1)} del ciclo</p>
                    <p className={styles.faseDetalleIlum}>Iluminación: {faseActual.iluminacion}</p>
                  </div>
                </div>
                <p className={styles.faseDetalleDesc}>{faseActual.descripcion}</p>
              </div>

              {/* 8 fases como botones */}
              <div className={styles.fasesGrid}>
                {FASES.map((f, i) => (
                  <button
                    key={i}
                    className={`${styles.faseBtn} ${i === faseIndex ? styles.faseBtnActivo : ''}`}
                    onClick={() => setFaseIndex(i)}
                    aria-pressed={i === faseIndex}
                  >
                    <span className={styles.faseBtnNum}>{i + 1}</span>
                    <span className={styles.faseBtnNombre}>{f.nombre}</span>
                  </button>
                ))}
              </div>

              <div className={styles.insight}>
                <p><strong>💡 Rotación sincrónica:</strong> Siempre vemos la misma cara de la Luna porque tarda exactamente lo mismo en rotar sobre sí misma que en orbitar la Tierra (29,5 días). No es coincidencia: la gravedad terrestre &quot;frenó&quot; su rotación hasta acoplarla.</p>
              </div>
            </>
          )}

          {/* ═══════ SECCIÓN 2: ECLIPSES ═══════ */}
          {seccion === 'eclipses' && (
            <>
              <div className={styles.contexto}>
                La órbita lunar está inclinada <strong>5°</strong> respecto a la eclíptica.
                Por eso NO hay eclipse cada luna nueva ni cada luna llena.
              </div>

              {/* Toggle solar/lunar */}
              <div className={styles.toggleEclipse}>
                <button
                  className={`${styles.toggleBtn} ${tipoEclipse === 'solar' ? styles.toggleActivo : ''}`}
                  onClick={() => setTipoEclipse('solar')}
                  aria-pressed={tipoEclipse === 'solar'}
                >
                  🌑 Eclipse solar
                </button>
                <button
                  className={`${styles.toggleBtn} ${tipoEclipse === 'lunar' ? styles.toggleActivo : ''}`}
                  onClick={() => setTipoEclipse('lunar')}
                  aria-pressed={tipoEclipse === 'lunar'}
                >
                  🔴 Eclipse lunar
                </button>
              </div>

              {tipoEclipse === 'solar' ? <DiagramaEclipseSolar /> : <DiagramaEclipseLunar />}

              {/* Info cards */}
              {tipoEclipse === 'solar' ? (
                <div className={styles.eclipseInfo}>
                  <div className={styles.eclipseCard}>
                    <h3>Eclipse solar total</h3>
                    <p>La Luna cubre completamente el Sol. La corona solar se hace visible. La franja de totalidad mide solo ~270 km de ancho.</p>
                  </div>
                  <div className={styles.eclipseCard}>
                    <h3>Eclipse parcial</h3>
                    <p>La Luna cubre solo una parte del Sol. Visible desde una zona mucho mayor que la totalidad.</p>
                  </div>
                  <div className={styles.eclipseCard}>
                    <h3>Eclipse anular</h3>
                    <p>Cuando la Luna está más lejos en su órbita elíptica y no cubre todo el Sol. Se ve un &quot;anillo de fuego&quot;.</p>
                  </div>
                </div>
              ) : (
                <div className={styles.eclipseInfo}>
                  <div className={styles.eclipseCard}>
                    <h3>Eclipse lunar total</h3>
                    <p>La Luna entra completamente en la umbra terrestre. Se ve roja (&quot;luna de sangre&quot;) por la luz refractada por la atmósfera.</p>
                  </div>
                  <div className={styles.eclipseCard}>
                    <h3>¿Por qué roja?</h3>
                    <p>La atmósfera terrestre filtra la luz azul y deja pasar la roja, igual que en los atardeceres. Esa luz roja llega a la Luna.</p>
                  </div>
                  <div className={styles.eclipseCard}>
                    <h3>Duración</h3>
                    <p>Un eclipse lunar total puede durar hasta 1 hora 40 minutos. Visible desde todo el hemisferio nocturno.</p>
                  </div>
                </div>
              )}

              <div className={styles.insight}>
                <p><strong>💡 Coincidencia cósmica:</strong> La Luna tiene exactamente el tamaño justo para cubrir el Sol visto desde la Tierra. El Sol es 400 veces más grande, pero está 400 veces más lejos. Esta coincidencia no ocurre en ningún otro planeta conocido.</p>
              </div>
            </>
          )}

          {/* ═══════ SECCIÓN 3: MAREAS ═══════ */}
          {seccion === 'mareas' && (
            <>
              <div className={styles.contexto}>
                La Luna atrae el agua del océano más cercano <strong>y</strong> el lado opuesto también sube (inercia).
                Resultado: <strong>2 mareas altas al día</strong>.
              </div>

              {/* Toggle vivas/muertas */}
              <div className={styles.toggleEclipse}>
                <button
                  className={`${styles.toggleBtn} ${tipoMarea === 'vivas' ? styles.toggleActivo : ''}`}
                  onClick={() => setTipoMarea('vivas')}
                  aria-pressed={tipoMarea === 'vivas'}
                >
                  🌊 Mareas vivas
                </button>
                <button
                  className={`${styles.toggleBtn} ${tipoMarea === 'muertas' ? styles.toggleActivo : ''}`}
                  onClick={() => setTipoMarea('muertas')}
                  aria-pressed={tipoMarea === 'muertas'}
                >
                  🌙 Mareas muertas
                </button>
              </div>

              <DiagramaMareas tipo={tipoMarea} />

              {/* Datos de mareas */}
              <div className={styles.mareasGrid}>
                <div className={styles.mareaCard}>
                  <span className={styles.mareaIcono} aria-hidden="true">🌊</span>
                  <div className={styles.mareaInfo}>
                    <strong>Bahía de Fundy (Canadá)</strong>
                    <p>Diferencia de marea: hasta <strong>16 metros</strong> — la mayor del mundo.</p>
                  </div>
                </div>
                <div className={styles.mareaCard}>
                  <span className={styles.mareaIcono} aria-hidden="true">⏱️</span>
                  <div className={styles.mareaInfo}>
                    <strong>Ciclo de mareas</strong>
                    <p>Cada <strong>12 horas 25 minutos</strong> se repite una marea alta (la Luna avanza en su órbita).</p>
                  </div>
                </div>
                <div className={styles.mareaCard}>
                  <span className={styles.mareaIcono} aria-hidden="true">🌍</span>
                  <div className={styles.mareaInfo}>
                    <strong>Frenando la Tierra</strong>
                    <p>Las mareas frenan la rotación terrestre ~<strong>{formatNumber(2.3, 1)} ms/siglo</strong>. Hace 400 millones de años el día duraba 22 horas.</p>
                  </div>
                </div>
              </div>

              <div className={styles.insight}>
                <p><strong>💡 Dato asombroso:</strong> La Luna se aleja 3,8 cm al año — robando energía rotacional a la Tierra. En ~600 millones de años, los eclipses totales serán imposibles porque la Luna será demasiado pequeña vista desde aquí.</p>
              </div>
            </>
          )}

          {/* ═══════ SECCIÓN 4: DATOS FASCINANTES ═══════ */}
          {seccion === 'datos' && (
            <>
              <div className={styles.datosGrid}>
                {DATOS_FASCINANTES.map((dato, i) => (
                  <button
                    key={i}
                    className={`${styles.datoCard} ${datoExpandido === i ? styles.datoActivo : ''}`}
                    onClick={() => setDatoExpandido(datoExpandido === i ? null : i)}
                    aria-expanded={datoExpandido === i}
                  >
                    <div className={styles.datoHeader}>
                      <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                      <h3 className={styles.datoTitulo}>{dato.titulo}</h3>
                    </div>
                    <p className={styles.datoDesc}>{dato.descripcion}</p>
                    {datoExpandido === i && (
                      <p className={styles.datoExtra}>{dato.extra}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Próximos eclipses desde España */}
              <h3 className={styles.eclipsesProxTitulo}>Próximos eclipses visibles desde España</h3>
              <div className={styles.eclipsesProxGrid}>
                {PROXIMOS_ECLIPSES.map((ecl, i) => (
                  <div key={i} className={styles.eclipseProxCard}>
                    <span className={styles.eclipseProxFecha}>{ecl.fecha}</span>
                    <span className={styles.eclipseProxTipo}>{ecl.tipo}</span>
                    <span className={styles.eclipseProxVis}>{ecl.visibilidad}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 ¿Quieres aprender más?"
          subtitle="La Luna y su influencia en la Tierra"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué la Luna tiene fases?</h2>
            <p>
              Un error común es pensar que las fases lunares se deben a la sombra de la Tierra sobre la Luna.
              En realidad, las fases son simplemente el resultado del ángulo con el que la luz solar ilumina
              la Luna vista desde nuestra posición. Cuando la Luna está entre el Sol y la Tierra (luna nueva),
              vemos su cara oscura. Cuando la Tierra está entre el Sol y la Luna (luna llena), vemos toda
              su cara iluminada.
            </p>

            <h2>La coincidencia cósmica de los eclipses</h2>
            <p>
              El Sol es unas 400 veces más grande que la Luna, pero también está unas 400 veces más lejos.
              Esta coincidencia hace que ambos tengan prácticamente el mismo tamaño aparente en el cielo (~0,5°),
              permitiendo los eclipses totales. Ningún otro planeta del sistema solar tiene esta peculiaridad.
              Además, esta coincidencia es temporal: la Luna se aleja lentamente, y en unos 600 millones de
              años los eclipses totales ya no serán posibles.
            </p>

            <h2>Las mareas: más que subir y bajar</h2>
            <p>
              Las mareas transfieren energía angular de la rotación terrestre a la órbita lunar.
              La Tierra gira más lento y la Luna se aleja. Este proceso ha estado ocurriendo durante
              miles de millones de años: cuando la Luna se formó, estaba unas 15 veces más cerca y
              el día terrestre duraba solo 5 horas.
            </p>

            <div className={styles.warningBox}>
              <strong>⚠️ Datos de referencia:</strong> Los datos astronómicos y las fechas de eclipses
              son aproximados y tienen fines educativos. Para predicciones precisas de eclipses, consulta
              fuentes oficiales como el Instituto Geográfico Nacional o la NASA.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={relatedApps} />
        <ShareCard appName="visualizador-fases-luna-eclipses" />
        <Footer appName="visualizador-fases-luna-eclipses" />
      </div>
    </>
  );
}
