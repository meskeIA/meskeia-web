'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './Cosmologia.module.css';
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

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type ComponenteUniverso = 'barionica' | 'oscura' | 'energia';
type GeometriaUniverso = 'plana' | 'abierta' | 'cerrada';
type SeccionActiva = 'tarta' | 'timeline' | 'expansion' | 'geometria' | 'destinos';

interface ComponenteInfo {
  id: ComponenteUniverso;
  nombre: string;
  porcentaje: number;
  color: string;
  descripcion: string;
  comoLoSabemos: string;
}

interface EventoTimeline {
  id: string;
  nombre: string;
  tiempo: string;
  tiempoMs: number;
  descripcion: string;
  x: number;
}

interface DestinoUniverso {
  id: string;
  nombre: string;
  icono: string;
  probabilidad: string;
  colorProbabilidad: string;
  colorBorde: string;
  descripcion: string;
}

interface GeometriaInfo {
  id: GeometriaUniverso;
  nombre: string;
  omega: string;
  descripcion: string;
  implicacion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const COMPONENTES: ComponenteInfo[] = [
  {
    id: 'barionica',
    nombre: 'Materia bariónica',
    porcentaje: 5,
    color: '#2E86AB',
    descripcion: 'Todo lo que conocemos: estrellas, planetas, gas, polvo, y nosotros mismos. Protones, neutrones y electrones. A pesar de ser lo único que podemos ver y tocar directamente, representa solo el 5% del contenido energético total del universo.',
    comoLoSabemos: 'Lo medimos a través de la emisión y absorción de luz (espectroscopía), el fondo cósmico de microondas (CMB), la nucleosíntesis primordial y el censo de galaxias y gas intergaláctico.',
  },
  {
    id: 'oscura',
    nombre: 'Materia oscura',
    porcentaje: 27,
    color: '#5B2D8E',
    descripcion: 'Materia que no emite, absorbe ni refleja luz, pero sí tiene masa y por tanto ejerce gravedad. Su existencia se infiere de las curvas de rotación de galaxias (rotan demasiado rápido para la masa visible), el lente gravitacional y la estructura a gran escala del universo.',
    comoLoSabemos: 'Curvas de rotación de galaxias (Vera Rubin, años 70), lentes gravitacionales (el Anillo de Einstein), estructura de la red cósmica, el CMB y simulaciones cosmológicas como el Millennium.',
  },
  {
    id: 'energia',
    nombre: 'Energía oscura',
    porcentaje: 68,
    color: '#E8A020',
    descripcion: 'Una forma de energía distribuida uniformemente en el espacio que causa la expansión acelerada del universo. Corresponde a la constante cosmológica Λ que Einstein introdujo (y luego llamó su «mayor error»). Su naturaleza fundamental es desconocida.',
    comoLoSabemos: 'Descubierta en 1998 por los equipos de Perlmutter, Schmidt y Riess (Premio Nobel 2011) al observar que las supernovas de tipo Ia lejanas son más tenues de lo esperado — el universo se expande cada vez más rápido, no más lento.',
  },
];

const EVENTOS_TIMELINE: EventoTimeline[] = [
  { id: 'bigbang', nombre: 'Big Bang', tiempo: 't = 0', tiempoMs: 0, descripcion: 'Singularidad inicial: densidad y temperatura infinitas. El espacio-tiempo comienza a expandirse. No existe "antes" del Big Bang en el sentido convencional.', x: 24 },
  { id: 'inflacion', nombre: 'Inflación cósmica', tiempo: '10⁻³⁶ s', tiempoMs: 1e-36, descripcion: 'Expansión exponencial súbita: el universo creció un factor ~10²⁶ en 10⁻³² segundos. Explica la homogeneidad del CMB y la geometría plana. Mecanismo exacto aún desconocido.', x: 80 },
  { id: 'quarks', nombre: 'Quark-gluon plasma', tiempo: '10⁻⁶ s', tiempoMs: 1e-6, descripcion: 'El universo era una sopa de quarks y gluones libres, demasiado caliente para confinarse en hadrones. Se reproduce en el LHC (ALICE).', x: 140 },
  { id: 'protones', nombre: 'Formación de protones', tiempo: '~1 μs', tiempoMs: 1e-6, descripcion: 'Al enfriarse, los quarks se confinan en hadrones: protones y neutrones. La asimetría bariónica (ligerísimo exceso de materia sobre antimateria) es la razón de que exista materia.', x: 200 },
  { id: 'nucleosintesis', nombre: 'Nucleosíntesis', tiempo: '3 min', tiempoMs: 180, descripcion: 'Los protones y neutrones se fusionan formando núcleos de deuterio, helio-3, helio-4 y litio-7. El universo era demasiado caliente para que los electrones se unieran. Predice exactamente las abundancias observadas de H y He.', x: 270 },
  { id: 'recombinacion', nombre: 'Recombinación (CMB)', tiempo: '380.000 años', tiempoMs: 380000, descripcion: 'El universo se enfría lo suficiente para que los electrones se unan a los núcleos formando átomos neutros. Los fotones se liberan: es el fondo cósmico de microondas (CMB), la imagen más antigua del universo, a 2,725 K.', x: 370 },
  { id: 'dark_ages', nombre: 'Edades Oscuras', tiempo: '380.000 – 150 Ma', tiempoMs: 380000, descripcion: 'Sin estrellas ni galaxias. El universo era un gas neutro opaco de hidrógeno y helio. La gravedad empezaba a agrupar la materia oscura en filamentos que actuarían como semillas para las galaxias.', x: 460 },
  { id: 'primeras_estrellas', nombre: 'Primeras estrellas', tiempo: '~180 Ma', tiempoMs: 180e6, descripcion: 'Las llamadas estrellas de Población III: masivas, calientes y muy cortas. Solo hidrógeno y helio. Al explotar como supernovas, dispersaron los primeros metales pesados, haciendo posibles las generaciones posteriores de estrellas.', x: 540 },
  { id: 'primeras_galaxias', nombre: 'Primeras galaxias', tiempo: '~400 Ma', tiempoMs: 400e6, descripcion: 'Las galaxias primitivas se forman a lo largo de los filamentos de materia oscura. El telescopio James Webb (JWST) las observa directamente y ha revelado galaxias más masivas de lo esperado a estas épocas.', x: 610 },
  { id: 'sol', nombre: 'Nace el Sol', tiempo: '4.600 Ma', tiempoMs: 4600e6, descripcion: 'El Sol se forma por colapso gravitacional de una nube de gas y polvo en uno de los brazos espirales de la Vía Láctea. Es una estrella de tercera generación: sus átomos pesados vienen de supernovas previas.', x: 700 },
  { id: 'hoy', nombre: 'Hoy', tiempo: '13.800 Ma', tiempoMs: 13800e6, descripcion: 'La edad actual del universo. La expansión se acelera dominada por la energía oscura. Las galaxias se alejan unas de otras; en el futuro lejano, las galaxias distantes se harán invisibles.', x: 780 },
];

const GEOMETRIAS: GeometriaInfo[] = [
  {
    id: 'plana',
    nombre: 'Plana (Ω = 1)',
    omega: 'Ω = 1',
    descripcion: 'La geometría euclídea: las líneas paralelas nunca se tocan, la suma de ángulos de un triángulo es 180°. El universo se expande para siempre pero cada vez más lentamente (sin energía oscura).',
    implicacion: '✅ Las observaciones del CMB indican que el universo es plano con un margen de ±0,4%.',
  },
  {
    id: 'abierta',
    nombre: 'Hiperbólica (Ω < 1)',
    omega: 'Ω < 1',
    descripcion: 'Geometría hiperbólica (silla de montar): las líneas paralelas divergen, la suma de ángulos de un triángulo es menor de 180°. Un universo con insuficiente densidad para cerrarse.',
    implicacion: '↔ Implicaría expansión eterna acelerada. Descartado por las mediciones actuales del CMB.',
  },
  {
    id: 'cerrada',
    nombre: 'Esférica (Ω > 1)',
    omega: 'Ω > 1',
    descripcion: 'Geometría esférica: las líneas paralelas convergen, la suma de ángulos supera 180° (como en la superficie de una esfera). El universo tendría densidad suficiente para recontraerse.',
    implicacion: '↔ Llevaría a un Big Crunch. Descartado por las observaciones actuales de alta precisión.',
  },
];

const DESTINOS: DestinoUniverso[] = [
  {
    id: 'freeze',
    nombre: 'Big Freeze (Muerte Térmica)',
    icono: '❄️',
    probabilidad: 'Muy probable',
    colorProbabilidad: '#27ae60',
    colorBorde: '#2E86AB',
    descripcion: 'Destino más probable si la energía oscura es una constante cosmológica. Las estrellas agotan su combustible, las galaxias se disipan, los agujeros negros se evaporan por radiación Hawking en ~10¹⁰⁰ años. El universo alcanza la entropía máxima: equilibrio termodinámico perfecto, silencio absoluto.',
  },
  {
    id: 'rip',
    nombre: 'Big Rip',
    icono: '💥',
    probabilidad: 'Posible',
    colorProbabilidad: '#E8A020',
    colorBorde: '#E8A020',
    descripcion: 'Si la energía oscura es una "energía fantasma" (w < −1) que se intensifica con el tiempo, la expansión se acelera hasta desgarrar toda la estructura del universo. En ~22.000 Ma: galaxias, después sistemas solares, planetas, y finalmente los propios átomos se separan.',
  },
  {
    id: 'crunch',
    nombre: 'Big Crunch',
    icono: '🌑',
    probabilidad: 'Descartado',
    colorProbabilidad: '#e74c3c',
    colorBorde: '#e74c3c',
    descripcion: 'Si Ω > 1 (universo cerrado), la gravedad frenaba y revertía la expansión. El universo colapsaría en una nueva singularidad. Los datos actuales de CMB (Ω ≈ 1) y la expansión acelerada lo descartan prácticamente.',
  },
  {
    id: 'bounce',
    nombre: 'Big Bounce',
    icono: '🔄',
    probabilidad: 'Especulativo',
    colorProbabilidad: '#7FB3D3',
    colorBorde: '#48A9A6',
    descripcion: 'Hipótesis cosmológica cíclica: tras un Big Crunch, el universo "rebota" en un nuevo Big Bang. Hay versiones en cosmología cuántica de bucles (LQC) y en teoría de cuerdas (universo ekpirótico). Sin evidencia observacional directa por ahora.',
  },
];

// ─────────────────────────────────────────────
// Subcomponente: Tarta del Universo
// ─────────────────────────────────────────────

function TartaUniverso() {
  const [seleccionado, setSeleccionado] = useState<ComponenteUniverso | null>(null);

  // Donut SVG: radio exterior 90, interior 52
  const cx = 110, cy = 110, ro = 90, ri = 52;
  const total = 100;
  let acumulado = 0;

  const getArc = (pct: number, inicio: number) => {
    const startAngle = (inicio / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((inicio + pct) / total) * 2 * Math.PI - Math.PI / 2;
    const x1o = cx + ro * Math.cos(startAngle);
    const y1o = cy + ro * Math.sin(startAngle);
    const x2o = cx + ro * Math.cos(endAngle);
    const y2o = cy + ro * Math.sin(endAngle);
    const x1i = cx + ri * Math.cos(endAngle);
    const y1i = cy + ri * Math.sin(endAngle);
    const x2i = cx + ri * Math.cos(startAngle);
    const y2i = cy + ri * Math.sin(startAngle);
    const large = pct > 50 ? 1 : 0;
    return `M ${x1o} ${y1o} A ${ro} ${ro} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ri} ${ri} 0 ${large} 0 ${x2i} ${y2i} Z`;
  };

  const componenteActual = COMPONENTES.find(c => c.id === seleccionado);

  return (
    <div>
      <div className={styles.tartaLayout}>
        <div className={styles.svgZona}>
          <svg viewBox="0 0 220 220" className={styles.diagramaSvg} role="img" aria-label="Donut chart de la composición del universo: 5% materia bariónica, 27% materia oscura, 68% energía oscura">
            {COMPONENTES.map(comp => {
              const inicio = acumulado;
              acumulado += comp.porcentaje;
              const isActivo = seleccionado === comp.id;
              const midAngle = ((inicio + comp.porcentaje / 2) / total) * 2 * Math.PI - Math.PI / 2;
              const offsetX = isActivo ? Math.cos(midAngle) * 7 : 0;
              const offsetY = isActivo ? Math.sin(midAngle) * 7 : 0;
              return (
                <path
                  key={comp.id}
                  d={getArc(comp.porcentaje, inicio)}
                  fill={comp.color}
                  opacity={seleccionado && !isActivo ? 0.45 : 1}
                  transform={`translate(${offsetX}, ${offsetY})`}
                  style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                  onClick={() => setSeleccionado(seleccionado === comp.id ? null : comp.id)}
                  role="button"
                  aria-label={`${comp.nombre}: ${comp.porcentaje}%`}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSeleccionado(seleccionado === comp.id ? null : comp.id); }}
                />
              );
            })}
            {/* Centro del donut */}
            <text x="110" y="104" textAnchor="middle" fontSize="13" fontWeight="700" fill={seleccionado ? COMPONENTES.find(c => c.id === seleccionado)?.color ?? '#2E86AB' : '#2E86AB'}>
              {seleccionado ? `${COMPONENTES.find(c => c.id === seleccionado)?.porcentaje}%` : 'Universo'}
            </text>
            <text x="110" y="120" textAnchor="middle" fontSize="9" fill="#888">
              {seleccionado ? COMPONENTES.find(c => c.id === seleccionado)?.nombre : 'haz click'}
            </text>
          </svg>
        </div>

        <div className={styles.tartaLeyendas}>
          {COMPONENTES.map(comp => (
            <button
              key={comp.id}
              type="button"
              className={`${styles.tartaLeyendaItem} ${seleccionado === comp.id ? styles.tartaLeyendaItemActivo : ''}`}
              onClick={() => setSeleccionado(seleccionado === comp.id ? null : comp.id)}
              aria-pressed={seleccionado === comp.id}
            >
              <span className={styles.tartaLeyendaColor} style={{ backgroundColor: comp.color }} aria-hidden="true" />
              <span className={styles.tartaLeyendaLabel}>{comp.nombre}</span>
              <span className={styles.tartaLeyendaPct} style={{ color: comp.color }}>{comp.porcentaje}%</span>
            </button>
          ))}

          <div className={styles.highlightBox} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            <p className={styles.highlightTitle}>Modelo ΛCDM</p>
            <p>El modelo cosmológico estándar: Λ (constante cosmológica = energía oscura) + CDM (Cold Dark Matter = materia oscura fría).</p>
          </div>
        </div>
      </div>

      {componenteActual && (
        <div className={styles.componentePanel} style={{ borderLeftColor: componenteActual.color }}>
          <h3 className={styles.componentePanelTitulo} style={{ color: componenteActual.color }}>
            {componenteActual.nombre} — {componenteActual.porcentaje}% del universo
          </h3>
          <p className={styles.componentePanelTexto}>{componenteActual.descripcion}</p>
          <p className={styles.componentePanelTexto} style={{ marginTop: '0.7rem', color: '#666', fontStyle: 'italic' }}>
            <strong>¿Cómo lo sabemos?</strong> {componenteActual.comoLoSabemos}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Línea de Tiempo Cósmica
// ─────────────────────────────────────────────

function TimelineCosmica() {
  const [eventoActivo, setEventoActivo] = useState<string | null>(null);
  const eventoSeleccionado = EVENTOS_TIMELINE.find(e => e.id === eventoActivo);

  return (
    <div>
      <div className={styles.timelineWrap}>
        <svg viewBox="0 0 820 100" className={styles.diagramaSvg} role="img" aria-label="Línea de tiempo cósmica desde el Big Bang hasta hoy con 11 eventos clave">
          {/* Línea base */}
          <line x1="20" y1="56" x2="800" y2="56" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round" />

          {/* Puntos de eventos */}
          {EVENTOS_TIMELINE.map(ev => (
            <g key={ev.id}>
              <circle
                cx={ev.x}
                cy={56}
                r={eventoActivo === ev.id ? 9 : 7}
                fill={eventoActivo === ev.id ? '#2E86AB' : '#48A9A6'}
                stroke="#fff"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setEventoActivo(eventoActivo === ev.id ? null : ev.id)}
                role="button"
                aria-label={`${ev.nombre}: ${ev.tiempo}`}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setEventoActivo(eventoActivo === ev.id ? null : ev.id); }}
              />
              <text
                x={ev.x}
                y={ev.x % 2 === 0 ? 42 : 80}
                textAnchor="middle"
                fontSize="8"
                fontWeight={eventoActivo === ev.id ? '700' : '500'}
                fill={eventoActivo === ev.id ? '#2E86AB' : '#666'}
                style={{ pointerEvents: 'none' }}
              >
                {ev.nombre.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Etiqueta inicio / fin */}
          <text x="20" y="90" textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="700">t=0</text>
          <text x="800" y="90" textAnchor="middle" fontSize="8" fill="#2E86AB" fontWeight="700">13.800 Ma</text>
        </svg>
      </div>

      <p style={{ fontSize: '0.82rem', color: '#999', textAlign: 'center', marginBottom: '0.5rem' }}>
        Haz click en un punto para ver el evento. Los eventos no están a escala logarítmica completa — se priorizan los más recientes para visibilidad.
      </p>

      {eventoSeleccionado && (
        <div className={styles.timelineEvento}>
          <h3 className={styles.timelineEventoTitulo}>{eventoSeleccionado.nombre}</h3>
          <p className={styles.timelineEventoTiempo}>{eventoSeleccionado.tiempo}</p>
          <p className={styles.timelineEventoTexto}>{eventoSeleccionado.descripcion}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Expansión acelerada
// ─────────────────────────────────────────────

function ExpansionAcelerada() {
  const [tPresente, setTPresente] = useState(13.8);

  // Factor de escala simplificado: a(t) ~ t^(2/3) para materia, luego exponencial para energía oscura
  const calcA = useCallback((t: number): number => {
    const tDE = 9.8; // transición materia→energía oscura ~5.000 Ma atrás
    if (t < tDE) {
      return Math.pow(t / tDE, 2 / 3);
    }
    return Math.exp(0.065 * (t - tDE));
  }, []);

  const puntos: string[] = [];
  const W = 700, H = 200;
  const tMax = 30;
  for (let i = 0; i <= 100; i++) {
    const t = (i / 100) * tMax;
    const a = calcA(t);
    const px = 30 + (t / tMax) * (W - 60);
    const py = H - 20 - Math.min(a * 60, H - 30);
    puntos.push(`${px},${py}`);
  }
  const polyline = puntos.join(' ');

  const presenteX = 30 + (tPresente / tMax) * (W - 60);
  const presenteA = calcA(tPresente);
  const presenteY = H - 20 - Math.min(presenteA * 60, H - 30);

  return (
    <div>
      <div className={styles.sliderWrap}>
        <p className={styles.sliderLabel}>
          Mover el presente: <strong style={{ color: '#2E86AB' }}>t = {tPresente.toFixed(1)} Ga</strong>
          {tPresente <= 9.8 ? ' — Expansión desacelerada (domina la materia)' : ' — Expansión acelerada (domina la energía oscura)'}
        </p>
        <input
          type="range"
          className={styles.sliderInput}
          min={1}
          max={30}
          step={0.1}
          value={tPresente}
          onChange={e => setTPresente(Number(e.target.value))}
          aria-label="Mover el punto del presente en la historia cósmica"
        />
        <div className={styles.sliderValores}>
          <span>1 Ga</span>
          <span>~9,8 Ga (transición)</span>
          <span>30 Ga</span>
        </div>
      </div>

      <div className={styles.svgZona}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.diagramaSvg} role="img" aria-label="Curva del factor de escala del universo a(t) — desaceleración inicial seguida de expansión acelerada">
          {/* Ejes */}
          <line x1="30" y1="10" x2="30" y2={H - 10} stroke="#ccc" strokeWidth="1" />
          <line x1="25" y1={H - 20} x2={W - 10} y2={H - 20} stroke="#ccc" strokeWidth="1" />
          <text x="16" y="14" fontSize="9" fill="#888" textAnchor="middle">a(t)</text>
          <text x={W - 10} y={H - 8} fontSize="9" fill="#888" textAnchor="end">t (Ga)</text>

          {/* Zona energía oscura */}
          <rect x={30 + (9.8 / tMax) * (W - 60)} y="10" width={(W - 60) * (1 - 9.8 / tMax)} height={H - 30} fill="rgba(232,160,32,0.07)" />
          <text x={30 + (9.8 / tMax) * (W - 60) + 10} y="22" fontSize="8" fill="#E8A020" opacity="0.8">Energía oscura domina</text>

          {/* Curva */}
          <polyline points={polyline} fill="none" stroke="#2E86AB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Punto del presente */}
          <circle cx={presenteX} cy={presenteY} r="6" fill="#48A9A6" stroke="#fff" strokeWidth="2" />
          <line x1={presenteX} y1={presenteY} x2={presenteX} y2={H - 20} stroke="#48A9A6" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={presenteX} y={presenteY - 10} textAnchor="middle" fontSize="9" fill="#48A9A6" fontWeight="700">hoy</text>
          <text x={presenteX} y={H - 8} textAnchor="middle" fontSize="8" fill="#48A9A6">{tPresente.toFixed(1)} Ga</text>
        </svg>
      </div>

      <div className={styles.hubbleBox}>
        <div className={styles.hubbleCard} style={{ borderLeftColor: '#2E86AB' }}>
          <div className={styles.hubbleCardValor}>67,4 km/s/Mpc</div>
          <div className={styles.hubbleCardLabel}>
            <strong>H₀ (CMB — Planck 2018)</strong><br />
            Medido a través del fondo cósmico de microondas. Predicción del modelo ΛCDM estándar.
          </div>
        </div>
        <div className={styles.hubbleCard} style={{ borderLeftColor: '#E8A020' }}>
          <div className={styles.hubbleCardValor} style={{ color: '#E8A020' }}>73,0 km/s/Mpc</div>
          <div className={styles.hubbleCardLabel}>
            <strong>H₀ (escalera de distancias cósmicas — Riess)</strong><br />
            Medido con Cefeidas y supernovas Ia. Significativamente mayor que Planck. La diferencia (&gt;5σ) es la «tensión de Hubble».
          </div>
        </div>
      </div>

      <div className={styles.highlightBox} style={{ marginTop: '1rem' }}>
        <p className={styles.highlightTitle}>¿Qué es la tensión de Hubble?</p>
        <p>Los dos métodos más precisos de medir la velocidad de expansión del universo dan valores sistemáticamente distintos. O hay un error sistemático desconocido en las medidas, o el modelo ΛCDM estándar es incompleto y el universo primitivo era más "dinámico" de lo que pensábamos. Es una de las crisis abiertas más importantes de la cosmología actual.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Geometría del universo
// ─────────────────────────────────────────────

function GeometriaUniversoComp() {
  const [geometria, setGeometria] = useState<GeometriaUniverso>('plana');
  const geo = GEOMETRIAS.find(g => g.id === geometria)!;

  return (
    <div>
      <div className={styles.geometriaBotones}>
        {GEOMETRIAS.map(g => (
          <button
            key={g.id}
            type="button"
            className={`${styles.geometriaBtn} ${geometria === g.id ? styles.geometriaBtnActivo : ''}`}
            onClick={() => setGeometria(g.id)}
            aria-pressed={geometria === g.id}
          >
            {g.nombre}
          </button>
        ))}
      </div>

      <div className={styles.svgZona}>
        <svg viewBox="0 0 600 200" className={styles.diagramaSvg} role="img" aria-label={`Geometría ${geo.nombre} del universo: visualización de líneas paralelas y triángulo`}>
          {geometria === 'plana' && (
            <g>
              <text x="300" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2E86AB">Geometría Plana (Euclidiana) — Ω = 1</text>
              {/* Líneas paralelas horizontales */}
              <line x1="60" y1="70" x2="540" y2="70" stroke="#2E86AB" strokeWidth="2.5" />
              <line x1="60" y1="110" x2="540" y2="110" stroke="#2E86AB" strokeWidth="2.5" />
              <line x1="60" y1="150" x2="540" y2="150" stroke="#2E86AB" strokeWidth="2.5" />
              <text x="300" y="185" textAnchor="middle" fontSize="11" fill="#48A9A6">Las líneas paralelas nunca se encuentran • Triángulo = 180°</text>
            </g>
          )}
          {geometria === 'abierta' && (
            <g>
              <text x="300" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5B2D8E">Geometría Hiperbólica (Silla) — Ω &lt; 1</text>
              {/* Líneas que divergen */}
              <line x1="200" y1="90" x2="80" y2="60" stroke="#5B2D8E" strokeWidth="2.5" />
              <line x1="200" y1="90" x2="80" y2="150" stroke="#5B2D8E" strokeWidth="2.5" />
              <line x1="200" y1="90" x2="520" y2="40" stroke="#5B2D8E" strokeWidth="2" strokeDasharray="5,3" />
              <line x1="200" y1="90" x2="520" y2="170" stroke="#5B2D8E" strokeWidth="2" strokeDasharray="5,3" />
              {/* Silla de montar simplificada */}
              <path d="M 380 80 Q 420 110 460 80 Q 440 130 460 160 Q 420 140 380 160 Q 400 130 380 80" fill="none" stroke="#5B2D8E" strokeWidth="1.5" opacity="0.5" />
              <text x="300" y="185" textAnchor="middle" fontSize="11" fill="#5B2D8E">Las paralelas divergen • Triángulo &lt; 180°</text>
            </g>
          )}
          {geometria === 'cerrada' && (
            <g>
              <text x="300" y="24" textAnchor="middle" fontSize="14" fontWeight="700" fill="#E8A020">Geometría Esférica — Ω &gt; 1</text>
              {/* Esfera */}
              <ellipse cx="200" cy="110" rx="70" ry="70" fill="none" stroke="#E8A020" strokeWidth="2.5" />
              <ellipse cx="200" cy="110" rx="70" ry="25" fill="none" stroke="#E8A020" strokeWidth="1.5" strokeDasharray="5,3" />
              {/* Triángulo esférico */}
              <path d="M 200 44 Q 255 80 255 130 Q 200 145 145 130 Q 145 80 200 44" fill="rgba(232,160,32,0.1)" stroke="#E8A020" strokeWidth="2" />
              {/* Líneas meridiano convergentes */}
              <line x1="380" y1="55" x2="480" y2="110" stroke="#E8A020" strokeWidth="2" />
              <line x1="420" y1="55" x2="480" y2="110" stroke="#E8A020" strokeWidth="2" />
              <text x="430" y="50" fontSize="9" fill="#E8A020">paralelas se unen en los polos</text>
              <text x="300" y="185" textAnchor="middle" fontSize="11" fill="#E8A020">Las paralelas convergen • Triángulo &gt; 180°</text>
            </g>
          )}
        </svg>
      </div>

      <div className={styles.geometriaPanel}>
        <h3 className={styles.geometriaPanelTitulo}>{geo.nombre} — {geo.omega}</h3>
        <p className={styles.geometriaPanelTexto}>{geo.descripcion}</p>
        <p className={styles.geometriaPanelImplicacion}>{geo.implicacion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Destinos del universo
// ─────────────────────────────────────────────

function DestinosUniverso() {
  return (
    <div className={styles.destinosGrid}>
      {DESTINOS.map(dest => (
        <div
          key={dest.id}
          className={styles.destinoCard}
          style={{ borderTopColor: dest.colorBorde }}
        >
          <div className={styles.destinoIcono} aria-hidden="true">{dest.icono}</div>
          <h3 className={styles.destinoNombre}>{dest.nombre}</h3>
          <span
            className={styles.destinoProbabilidad}
            style={{ backgroundColor: `${dest.colorProbabilidad}22`, color: dest.colorProbabilidad }}
          >
            {dest.probabilidad}
          </span>
          <p className={styles.destinoDescripcion}>{dest.descripcion}</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

const SECCIONES: { id: SeccionActiva; label: string; icono: string }[] = [
  { id: 'tarta', label: 'Composición', icono: '🥧' },
  { id: 'timeline', label: 'Historia cósmica', icono: '⏳' },
  { id: 'expansion', label: 'Expansión', icono: '📈' },
  { id: 'geometria', label: 'Geometría', icono: '🔷' },
  { id: 'destinos', label: 'Destinos', icono: '🔭' },
];

export default function CosmologiaPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('tarta');

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Cosmología: Composición y Destino del Universo</h1>
        <p className={styles.heroSubtitle}>
          El universo es 95% invisible — materia oscura y energía oscura. Explora su composición, historia, geometría y posibles destinos.
        </p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navTabs} aria-label="Secciones del visualizador">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            type="button"
            className={`${styles.navTab} ${seccionActiva === s.id ? styles.navTabActivo : ''}`}
            onClick={() => setSeccionActiva(s.id)}
            aria-pressed={seccionActiva === s.id}
          >
            <span aria-hidden="true">{s.icono}</span> {s.label}
          </button>
        ))}
      </nav>

      {/* Sección: Composición */}
      {seccionActiva === 'tarta' && (
        <section className={styles.seccion} aria-label="Composición del universo">
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">🥧</span> La receta del universo</h2>
          <p className={styles.seccionIntro}>
            El universo está compuesto principalmente por dos cosas que nunca hemos detectado directamente: materia oscura y energía oscura. Solo el 5% es materia bariónica — átomos, estrellas, planetas y todo lo que podemos ver. Haz click en cada sector para explorar qué es y cómo lo sabemos.
          </p>
          <TartaUniverso />
        </section>
      )}

      {/* Sección: Historia cósmica */}
      {seccionActiva === 'timeline' && (
        <section className={styles.seccion} aria-label="Línea de tiempo cósmica">
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">⏳</span> 13.800 millones de años en un vistazo</h2>
          <p className={styles.seccionIntro}>
            Desde la singularidad inicial hasta hoy — los hitos principales de la historia del cosmos. Haz click en cada punto para ver qué ocurrió y cómo lo sabemos.
          </p>
          <TimelineCosmica />
        </section>
      )}

      {/* Sección: Expansión */}
      {seccionActiva === 'expansion' && (
        <section className={styles.seccion} aria-label="Expansión acelerada del universo">
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">📈</span> La expansión que se acelera</h2>
          <p className={styles.seccionIntro}>
            Durante los primeros ~9.800 millones de años, la gravedad de la materia frenaba la expansión. Luego la energía oscura tomó el control y la expansión comenzó a acelerarse. Mueve el slider para ver el factor de escala del universo en distintos momentos.
          </p>
          <ExpansionAcelerada />
        </section>
      )}

      {/* Sección: Geometría */}
      {seccionActiva === 'geometria' && (
        <section className={styles.seccion} aria-label="Geometría del universo">
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">🔷</span> La forma del universo</h2>
          <p className={styles.seccionIntro}>
            La geometría global del universo depende de su densidad total (Ω). Las mediciones del CMB (satélite Planck) indican que el universo es plano con precisión del 0,4%. Explora qué implicaría cada geometría.
          </p>
          <GeometriaUniversoComp />
        </section>
      )}

      {/* Sección: Destinos */}
      {seccionActiva === 'destinos' && (
        <section className={styles.seccion} aria-label="Posibles destinos del universo">
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">🔭</span> Los posibles finales del universo</h2>
          <p className={styles.seccionIntro}>
            El destino del cosmos depende de la naturaleza de la energía oscura, que aún no comprendemos plenamente. El Big Freeze es el escenario más probable según el modelo estándar ΛCDM.
          </p>
          <DestinosUniverso />
        </section>
      )}

      {/* Sección educativa */}
      <EducationalSection
        title="Cosmología: lo que sabemos (y lo que no) del universo"
        subtitle="El 95% del universo está hecho de cosas que no entendemos. Así es la cosmología moderna."
        icon="🌌"
      >
        <div className={styles.warningBox}>
          <p>
            <strong>El universo visible es solo el 5% del total.</strong> El 95% restante está compuesto de materia oscura (27%) y energía oscura (68%) — cosas que nunca hemos detectado directamente. Solo sabemos que existen por sus efectos gravitacionales y en la expansión del espacio-tiempo.
          </p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>¿Qué estudia la cosmología?</p>
          <p>La cosmología es la rama de la física y la astronomía que estudia el origen, la estructura, la evolución y el destino del universo como un todo. A diferencia de la astronomía observacional (que estudia objetos individuales), la cosmología busca leyes globales que describan el cosmos entero.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>El modelo cosmológico estándar: ΛCDM</p>
          <p>Lambda-Cold Dark Matter (ΛCDM) es el modelo más exitoso de la historia de la ciencia en términos de precisión predictiva. Con solo 6 parámetros libres describe la geometría del universo, el CMB, la formación de galaxias y la expansión. Λ es la constante cosmológica (energía oscura), CDM es materia oscura fría.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>Materia oscura: candidatos y búsquedas</p>
          <p>No sabemos qué es la materia oscura, pero hay candidatos teóricos: <strong>WIMPs</strong> (Weakly Interacting Massive Particles) — buscados en el LHC y detectores subterráneos como XENON1T; <strong>axiones</strong> — partículas muy ligeras propuestas para resolver el problema CP fuerte; <strong>neutrinos masivos</strong> — descartados como candidato principal (demasiado ligeros). Ninguno confirmado aún.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>Energía oscura: la constante cosmológica resucitada</p>
          <p>En 1917, Einstein añadió Λ a sus ecuaciones para obtener un universo estático. Al descubrirse que el universo se expande (Hubble, 1929), la retiró llamándola su «mayor error». En 1998, Perlmutter, Schmidt y Riess descubrieron la expansión acelerada: Λ tenía razón después de todo. El problema teórico: la física cuántica predice un valor de Λ 10¹²⁰ veces mayor del observado.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>La tensión de Hubble: una crisis abierta</p>
          <p>El valor de la constante de Hubble H₀ medido desde el universo primitivo (CMB, Planck: 67,4) y desde el universo local (Cefeidas + supernovas, Riess: 73,0) difieren más de 5 desviaciones estándar. Una probabilidad de coincidencia aleatoria de 1 en 3,5 millones. No es un error de medida conocido. Puede requerir nueva física.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>El fondo cósmico de microondas (CMB)</p>
          <p>Emitido cuando el universo tenía 380.000 años y se enfrió lo suficiente para que los electrones se unieran a los protones (recombinación). Los fotones quedaron libres y viajaron hasta hoy — los detectamos como radiación de microondas a 2,725 K, casi perfectamente uniforme con variaciones de 1 en 100.000. Es la fotografía más antigua del universo y la herramienta más poderosa de la cosmología de precisión.</p>
        </div>

        <div className={styles.highlightBox}>
          <p className={styles.highlightTitle}>La gran pregunta: ¿por qué existe el universo en vez de nada?</p>
          <p>La física explica cómo evolucionó el universo desde el Big Bang, pero no por qué hay algo en lugar de nada. Las leyes de la física, las constantes fundamentales y las condiciones iniciales del universo parecen ajustadas con precisión asombrosa para permitir estructuras complejas. El multiverso, el principio antrópico y la teoría de cuerdas son intentos de respuesta, ninguno verificable todavía.</p>
        </div>

        <ul className={styles.infoLista}>
          <li>El universo observable tiene ~93.000 millones de años-luz de diámetro (más que su edad porque el espacio se expandió)</li>
          <li>Hay más estrellas en el universo observable que granos de arena en todas las playas y desiertos de la Tierra</li>
          <li>La primera fracción de segundo del universo es la menos conocida y la más importante</li>
          <li>La barrera del CMB impide ver el universo antes de los 380.000 años con telescopios ópticos</li>
          <li>Las ondas gravitacionales (LIGO) podrían en el futuro «ver» el universo primordial antes de la recombinación</li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-cosmologia')} />
      <ShareCard appName="visualizador-cosmologia" />
      <Footer appName="visualizador-cosmologia" />
    </div>
  );
}
