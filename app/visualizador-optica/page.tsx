'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './Optica.module.css';
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
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'reflexion' | 'refraccion' | 'lentes' | 'colores';

interface Medio {
  id: string;
  nombre: string;
  n: number;
  color: string;
}

const MEDIOS: Medio[] = [
  { id: 'agua', nombre: 'Agua', n: 1.33, color: '#3498db' },
  { id: 'vidrio', nombre: 'Vidrio', n: 1.52, color: '#95a5a6' },
  { id: 'diamante', nombre: 'Diamante', n: 2.42, color: '#e74c3c' },
];

interface EjemploReflexion {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
}

const EJEMPLOS_REFLEXION: EjemploReflexion[] = [
  { id: 'plano', icono: '🪞', nombre: 'Espejo plano', descripcion: 'Imagen del mismo tamaño' },
  { id: 'concavo', icono: '🔦', nombre: 'Espejo cóncavo', descripcion: 'Faros, telescopios' },
  { id: 'convexo', icono: '🚗', nombre: 'Espejo convexo', descripcion: 'Retrovisores, tiendas' },
];

const SECCIONES: { id: Seccion; icono: string; label: string }[] = [
  { id: 'refraccion', icono: '🌊', label: 'Refracción' },
  { id: 'reflexion', icono: '🪞', label: 'Reflexión' },
  { id: 'lentes', icono: '🔍', label: 'Lentes' },
  { id: 'colores', icono: '🌈', label: 'Colores' },
];

const ESPECTRO_EM = [
  { nombre: 'Radio', lambda: '> 1 m', color: '#666' },
  { nombre: 'Micro', lambda: '1 mm–1 m', color: '#888' },
  { nombre: 'IR', lambda: '700 nm–1 mm', color: '#c0392b' },
  { nombre: 'Visible', lambda: '380–700 nm', color: 'linear-gradient(to right, #8B00FF, #FF0000)' },
  { nombre: 'UV', lambda: '10–380 nm', color: '#8e44ad' },
  { nombre: 'Rayos X', lambda: '0,01–10 nm', color: '#2980b9' },
  { nombre: 'Gamma', lambda: '< 0,01 nm', color: '#2c3e50' },
];

// ─────────────────────────────────────────────
// Utilidades trigonométricas
// ─────────────────────────────────────────────

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ─────────────────────────────────────────────
// Componentes SVG de cada sección
// ─────────────────────────────────────────────

function ReflexionSVG({ angulo }: { angulo: number }) {
  const cx = 300, cy = 200;
  const espejoPad = 120;
  const rayLen = 160;

  const anguloRad = degToRad(angulo);
  // Rayo incidente (viene desde la izquierda-arriba)
  const incX = cx - rayLen * Math.sin(anguloRad);
  const incY = cy - rayLen * Math.cos(anguloRad);
  // Rayo reflejado (sale hacia la derecha-arriba)
  const refX = cx + rayLen * Math.sin(anguloRad);
  const refY = cy - rayLen * Math.cos(anguloRad);

  // Arcos para indicar ángulos
  const arcRadius = 40;
  const incArcEndX = cx - arcRadius * Math.sin(anguloRad);
  const incArcEndY = cy - arcRadius * Math.cos(anguloRad);
  const refArcEndX = cx + arcRadius * Math.sin(anguloRad);
  const refArcEndY = cy - arcRadius * Math.cos(anguloRad);

  return (
    <svg viewBox="0 0 600 400" aria-label={`Reflexión con ángulo de ${angulo} grados`}>
      {/* Espejo */}
      <line x1={cx - espejoPad} y1={cy} x2={cx + espejoPad} y2={cy} stroke="#2E86AB" strokeWidth="4" />
      <line x1={cx - espejoPad} y1={cy + 3} x2={cx + espejoPad} y2={cy + 3} stroke="#2E86AB" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />

      {/* Normal (línea punteada vertical) */}
      <line x1={cx} y1={cy - 170} x2={cx} y2={cy} stroke="#999" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={cx + 8} y={cy - 155} fontSize="11" fill="#999">Normal</text>

      {/* Rayo incidente */}
      <line x1={incX} y1={incY} x2={cx} y2={cy} stroke="#F39C12" strokeWidth="2.5" />
      <polygon
        points={`${cx},${cy} ${cx - 8 * Math.sin(anguloRad) - 5 * Math.cos(anguloRad)},${cy - 8 * Math.cos(anguloRad) + 5 * Math.sin(anguloRad)} ${cx - 8 * Math.sin(anguloRad) + 5 * Math.cos(anguloRad)},${cy - 8 * Math.cos(anguloRad) - 5 * Math.sin(anguloRad)}`}
        fill="#F39C12"
      />
      <text x={incX - 10} y={incY - 8} fontSize="11" fill="#F39C12" fontWeight="600">Incidente</text>

      {/* Rayo reflejado */}
      <line x1={cx} y1={cy} x2={refX} y2={refY} stroke="#E74C3C" strokeWidth="2.5" />
      <polygon
        points={`${refX},${refY} ${refX - 8 * Math.sin(anguloRad) - 5 * Math.cos(anguloRad)},${refY + 8 * Math.cos(anguloRad) + 5 * Math.sin(anguloRad)} ${refX - 8 * Math.sin(anguloRad) + 5 * Math.cos(anguloRad)},${refY + 8 * Math.cos(anguloRad) - 5 * Math.sin(anguloRad)}`}
        fill="#E74C3C"
      />
      <text x={refX + 5} y={refY - 8} fontSize="11" fill="#E74C3C" fontWeight="600">Reflejado</text>

      {/* Arco ángulo incidencia */}
      {angulo > 2 && (
        <>
          <path
            d={`M ${cx},${cy - arcRadius} A ${arcRadius},${arcRadius} 0 0,0 ${incArcEndX},${incArcEndY}`}
            fill="none" stroke="#F39C12" strokeWidth="1.5"
          />
          <text x={cx - 35} y={cy - arcRadius + 15} fontSize="10" fill="#F39C12" fontWeight="600">
            {angulo}°
          </text>
        </>
      )}

      {/* Arco ángulo reflexión */}
      {angulo > 2 && (
        <>
          <path
            d={`M ${cx},${cy - arcRadius} A ${arcRadius},${arcRadius} 0 0,1 ${refArcEndX},${refArcEndY}`}
            fill="none" stroke="#E74C3C" strokeWidth="1.5"
          />
          <text x={cx + 12} y={cy - arcRadius + 15} fontSize="10" fill="#E74C3C" fontWeight="600">
            {angulo}°
          </text>
        </>
      )}

      {/* Etiqueta espejo */}
      <text x={cx - espejoPad} y={cy + 22} fontSize="11" fill="#2E86AB" fontWeight="600">Espejo</text>
    </svg>
  );
}

function RefraccionSVG({ angulo, medio }: { angulo: number; medio: Medio }) {
  const cx = 300, interfaceY = 200;
  const n1 = 1.0; // aire
  const n2 = medio.n;
  const rayLen = 150;

  const theta1Rad = degToRad(angulo);
  const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;
  const totalReflection = sinTheta2 >= 1;
  const theta2Rad = totalReflection ? 0 : Math.asin(sinTheta2);
  const criticalAngle = n2 < n1 ? radToDeg(Math.asin(n2 / n1)) : radToDeg(Math.asin(n1 / n2));

  // Rayo incidente (viene desde la izquierda-arriba)
  const incX = cx - rayLen * Math.sin(theta1Rad);
  const incY = interfaceY - rayLen * Math.cos(theta1Rad);

  // Rayo refractado (continúa hacia abajo desviado)
  const refractX = totalReflection ? cx : cx + rayLen * Math.sin(theta2Rad);
  const refractY = totalReflection ? interfaceY : interfaceY + rayLen * Math.cos(theta2Rad);

  // Rayo reflejado (reflexión total interna)
  const reflX = cx + rayLen * Math.sin(theta1Rad);
  const reflY = interfaceY - rayLen * Math.cos(theta1Rad);

  return (
    <svg viewBox="0 0 600 400" aria-label={`Refracción en ${medio.nombre} con ángulo ${angulo} grados`}>
      {/* Medio 1 (aire) */}
      <rect x="0" y="0" width="600" height={interfaceY} fill="rgba(135,206,235,0.08)" />
      <text x="20" y="30" fontSize="12" fill="#999" fontWeight="600">Aire (n = 1,00)</text>

      {/* Medio 2 */}
      <rect x="0" y={interfaceY} width="600" height={200} fill={`${medio.color}15`} />
      <text x="20" y={interfaceY + 25} fontSize="12" fill={medio.color} fontWeight="600">
        {medio.nombre} (n = {medio.n.toFixed(2).replace('.', ',')})
      </text>

      {/* Interfaz */}
      <line x1="50" y1={interfaceY} x2="550" y2={interfaceY} stroke={medio.color} strokeWidth="2" />

      {/* Normal */}
      <line x1={cx} y1={interfaceY - 170} x2={cx} y2={interfaceY + 170} stroke="#999" strokeWidth="1.5" strokeDasharray="6,4" />
      <text x={cx + 8} y={interfaceY - 155} fontSize="11" fill="#999">Normal</text>

      {/* Rayo incidente */}
      <line x1={incX} y1={incY} x2={cx} y2={interfaceY} stroke="#F39C12" strokeWidth="2.5" />
      <text x={incX - 10} y={incY - 8} fontSize="11" fill="#F39C12" fontWeight="600">
        {angulo}°
      </text>

      {totalReflection ? (
        <>
          {/* Reflexión total interna */}
          <line x1={cx} y1={interfaceY} x2={reflX} y2={reflY} stroke="#E74C3C" strokeWidth="2.5" />
          <text x={reflX + 5} y={reflY - 8} fontSize="11" fill="#E74C3C" fontWeight="600">
            Reflexión total
          </text>
        </>
      ) : (
        <>
          {/* Rayo refractado */}
          <line x1={cx} y1={interfaceY} x2={refractX} y2={refractY} stroke="#2ECC71" strokeWidth="2.5" />
          <text x={refractX + 5} y={refractY + 5} fontSize="11" fill="#2ECC71" fontWeight="600">
            {Math.round(radToDeg(theta2Rad))}°
          </text>
        </>
      )}

      {/* Fórmula Snell */}
      <text x="300" y="385" fontSize="12" fill="#666" textAnchor="middle" fontWeight="600">
        n₁ sin(θ₁) = n₂ sin(θ₂) | Ángulo crítico: {criticalAngle.toFixed(1).replace('.', ',')}°
      </text>
    </svg>
  );
}

function LentesSVG({ convergente, distObj }: { convergente: boolean; distObj: number }) {
  const cx = 300, cy = 200;
  const focalLen = 100; // distancia focal en px
  const focoX = convergente ? cx + focalLen : cx - focalLen;

  // Posición del objeto (a la izquierda de la lente)
  const objX = cx - distObj;
  const objH = 60; // altura del objeto

  // Cálculo de imagen (ecuación lentes delgadas: 1/f = 1/do + 1/di)
  const f = convergente ? focalLen : -focalLen;
  const doVal = distObj;
  const diVal = doVal !== f ? (f * doVal) / (doVal - f) : 0;
  const magnification = diVal !== 0 ? -diVal / doVal : 0;
  const imgH = objH * magnification;
  const imgX = cx + diVal;

  // Rayos paralelos para visualización
  const rayY1 = cy - 50;
  const rayY2 = cy - 25;
  const rayY3 = cy;

  return (
    <svg viewBox="0 0 600 400" aria-label={`Lente ${convergente ? 'convergente' : 'divergente'}`}>
      {/* Eje óptico */}
      <line x1="30" y1={cy} x2="570" y2={cy} stroke="#ccc" strokeWidth="1" strokeDasharray="4,4" />

      {/* Lente */}
      {convergente ? (
        <ellipse cx={cx} cy={cy} rx="8" ry="90" fill="rgba(46,134,171,0.15)" stroke="#2E86AB" strokeWidth="2" />
      ) : (
        <>
          <line x1={cx} y1={cy - 90} x2={cx} y2={cy + 90} stroke="#E74C3C" strokeWidth="2" />
          <line x1={cx - 12} y1={cy - 90} x2={cx} y2={cy - 90} stroke="#E74C3C" strokeWidth="2" />
          <line x1={cx + 12} y1={cy - 90} x2={cx} y2={cy - 90} stroke="#E74C3C" strokeWidth="2" />
          <line x1={cx - 12} y1={cy + 90} x2={cx} y2={cy + 90} stroke="#E74C3C" strokeWidth="2" />
          <line x1={cx + 12} y1={cy + 90} x2={cx} y2={cy + 90} stroke="#E74C3C" strokeWidth="2" />
        </>
      )}
      <text x={cx} y={cy + 110} fontSize="11" fill={convergente ? '#2E86AB' : '#E74C3C'} textAnchor="middle" fontWeight="600">
        {convergente ? 'Convergente' : 'Divergente'}
      </text>

      {/* Foco */}
      <circle cx={focoX} cy={cy} r="4" fill={convergente ? '#2E86AB' : '#E74C3C'} />
      <text x={focoX} y={cy + 18} fontSize="10" fill="#999" textAnchor="middle">F</text>
      {/* Foco opuesto */}
      <circle cx={cx - (focoX - cx)} cy={cy} r="4" fill={convergente ? '#2E86AB' : '#E74C3C'} opacity="0.5" />
      <text x={cx - (focoX - cx)} y={cy + 18} fontSize="10" fill="#999" textAnchor="middle">F&apos;</text>

      {/* Rayos paralelos (demostración) */}
      {convergente ? (
        <>
          <line x1="30" y1={rayY1} x2={cx} y2={rayY1} stroke="#F39C12" strokeWidth="1.5" />
          <line x1={cx} y1={rayY1} x2={focoX} y2={cy} stroke="#F39C12" strokeWidth="1.5" />
          <line x1="30" y1={rayY2} x2={cx} y2={rayY2} stroke="#F39C12" strokeWidth="1.5" opacity="0.7" />
          <line x1={cx} y1={rayY2} x2={focoX} y2={cy} stroke="#F39C12" strokeWidth="1.5" opacity="0.7" />
          <line x1="30" y1={rayY3} x2="570" y2={rayY3} stroke="#F39C12" strokeWidth="1.5" opacity="0.5" />
        </>
      ) : (
        <>
          <line x1="30" y1={rayY1} x2={cx} y2={rayY1} stroke="#F39C12" strokeWidth="1.5" />
          <line x1={cx} y1={rayY1} x2="570" y2={rayY1 + 50} stroke="#F39C12" strokeWidth="1.5" />
          {/* Extensión virtual hacia foco */}
          <line x1={cx} y1={rayY1} x2={cx - focalLen} y2={cy} stroke="#F39C12" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
          <line x1="30" y1={rayY2} x2={cx} y2={rayY2} stroke="#F39C12" strokeWidth="1.5" opacity="0.7" />
          <line x1={cx} y1={rayY2} x2="570" y2={rayY2 + 30} stroke="#F39C12" strokeWidth="1.5" opacity="0.7" />
          <line x1={cx} y1={rayY2} x2={cx - focalLen} y2={cy} stroke="#F39C12" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" />
        </>
      )}

      {/* Objeto */}
      <line x1={objX} y1={cy} x2={objX} y2={cy - objH} stroke="#2ECC71" strokeWidth="2.5" />
      <polygon points={`${objX},${cy - objH} ${objX - 5},${cy - objH + 10} ${objX + 5},${cy - objH + 10}`} fill="#2ECC71" />
      <text x={objX} y={cy + 18} fontSize="10" fill="#2ECC71" textAnchor="middle" fontWeight="600">Objeto</text>

      {/* Imagen (si está en rango visible) */}
      {Math.abs(diVal) > 0 && Math.abs(diVal) < 350 && (
        <>
          <line x1={imgX} y1={cy} x2={imgX} y2={cy - imgH} stroke="#9B59B6" strokeWidth="2" strokeDasharray={diVal < 0 ? '4,3' : 'none'} />
          <polygon points={`${imgX},${cy - imgH} ${imgX - 4},${cy - imgH + (imgH > 0 ? 8 : -8)} ${imgX + 4},${cy - imgH + (imgH > 0 ? 8 : -8)}`} fill="#9B59B6" opacity={diVal < 0 ? 0.6 : 1} />
          <text x={imgX} y={cy + 18} fontSize="10" fill="#9B59B6" textAnchor="middle" fontWeight="600">
            Imagen {diVal < 0 ? '(virtual)' : '(real)'}
          </text>
        </>
      )}

      {/* Info */}
      <text x="300" y="385" fontSize="11" fill="#666" textAnchor="middle">
        1/f = 1/d₀ + 1/dᵢ | f = {convergente ? '+' : '-'}{focalLen}px | Aumento: {Math.abs(magnification).toFixed(1).replace('.', ',')}x {imgH < 0 ? '(invertida)' : '(derecha)'}
      </text>
    </svg>
  );
}

function PrismaSVG() {
  // Prisma: triángulo con rayo blanco que entra y arcoíris que sale
  const px = 250, py = 120;
  const pBase = 140, pHeight = 160;

  const colores = [
    { color: '#8B00FF', nombre: 'Violeta', lambda: '380 nm' },
    { color: '#4B0082', nombre: 'Índigo', lambda: '445 nm' },
    { color: '#0000FF', nombre: 'Azul', lambda: '470 nm' },
    { color: '#00FF00', nombre: 'Verde', lambda: '510 nm' },
    { color: '#FFFF00', nombre: 'Amarillo', lambda: '570 nm' },
    { color: '#FF7F00', nombre: 'Naranja', lambda: '590 nm' },
    { color: '#FF0000', nombre: 'Rojo', lambda: '700 nm' },
  ];

  return (
    <svg viewBox="0 0 600 400" aria-label="Prisma descomponiendo luz blanca en arcoíris">
      {/* Rayo blanco de entrada */}
      <line x1="30" y1={py + pHeight / 2} x2={px + 20} y2={py + pHeight / 2} stroke="white" strokeWidth="4" filter="url(#glow)" />
      <text x="40" y={py + pHeight / 2 - 12} fontSize="11" fill="#999" fontWeight="600">Luz blanca</text>

      {/* Filtro glow para rayo blanco */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Prisma (triángulo) */}
      <polygon
        points={`${px + pBase / 2},${py} ${px},${py + pHeight} ${px + pBase},${py + pHeight}`}
        fill="rgba(46,134,171,0.15)"
        stroke="#2E86AB"
        strokeWidth="2.5"
      />
      <text x={px + pBase / 2} y={py + pHeight + 20} fontSize="11" fill="#2E86AB" textAnchor="middle" fontWeight="600">
        Prisma
      </text>

      {/* Rayos de salida (arcoíris) */}
      {colores.map((c, i) => {
        const startX = px + pBase - 10;
        const startY = py + pHeight / 2;
        const angle = -25 + i * 8; // grados de dispersión
        const endX = startX + 200 * Math.cos(degToRad(angle));
        const endY = startY + 200 * Math.sin(degToRad(angle));
        return (
          <g key={c.nombre}>
            <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={c.color} strokeWidth="2.5" opacity="0.9" />
            <text x={endX + 5} y={endY + 4} fontSize="9" fill={c.color} fontWeight="600">
              {c.nombre} ({c.lambda})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOpticaPage() {
  const [seccion, setSeccion] = useState<Seccion>('refraccion');
  const [anguloReflexion, setAnguloReflexion] = useState(45);
  const [anguloRefraccion, setAnguloRefraccion] = useState(30);
  const [medioId, setMedioId] = useState('agua');
  const [convergente, setConvergente] = useState(true);
  const [distObj, setDistObj] = useState(200);
  const [ejemploActivo, setEjemploActivo] = useState('plano');

  const medioActual = useMemo(() => MEDIOS.find(m => m.id === medioId)!, [medioId]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <p className={styles.heroTag} aria-hidden="true">Física visual interactiva</p>
          <h1 className={styles.title}>Ley de Snell y Refracción de la Luz</h1>
          <p className={styles.subtitle}>
            Reflexión, refracción, lentes y colores. Descubre cómo se comporta la luz con diagramas SVG interactivos.
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <div className={styles.navGrid} role="tablist" aria-label="Secciones de óptica">
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

        {/* ── SECCIÓN 1: REFLEXIÓN ── */}
        {seccion === 'reflexion' && (
          <div id="panel-reflexion" role="tabpanel">
            <div className={styles.svgContainer}>
              <ReflexionSVG angulo={anguloReflexion} />
            </div>

            <div className={styles.controles}>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-reflexion">
                  Ángulo de incidencia: <span className={styles.sliderValue}>{anguloReflexion}°</span>
                </label>
                <input
                  id="slider-reflexion"
                  type="range"
                  min="0"
                  max="80"
                  value={anguloReflexion}
                  onChange={e => setAnguloReflexion(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>

            <div className={styles.formulaBox}>
              <span className={styles.formulaLabel}>Ley de reflexión</span>
              <code className={styles.formulaValor}>
                θ incidencia = θ reflexión = {anguloReflexion}°
              </code>
            </div>

            <div className={styles.ejemplosGrid}>
              {EJEMPLOS_REFLEXION.map(ej => (
                <button
                  key={ej.id}
                  type="button"
                  className={`${styles.ejemploCard} ${ejemploActivo === ej.id ? styles.ejemploCardActivo : ''}`}
                  onClick={() => setEjemploActivo(ej.id)}
                  aria-pressed={ejemploActivo === ej.id}
                >
                  <span className={styles.ejemploIcono} aria-hidden="true">{ej.icono}</span>
                  <span className={styles.ejemploNombre}>{ej.nombre}</span>
                  <span className={styles.ejemploDesc}>{ej.descripcion}</span>
                </button>
              ))}
            </div>

            {ejemploActivo === 'plano' && (
              <div className={styles.insight}>
                <p>
                  <span className={styles.insightEmoji} aria-hidden="true">💡</span>
                  Un espejo plano refleja ~95% de la luz. El 5% restante se absorbe por el recubrimiento metálico (generalmente aluminio o plata).
                  La imagen es virtual, del mismo tamaño y aparece a la misma distancia detrás del espejo que el objeto delante.
                </p>
              </div>
            )}
            {ejemploActivo === 'concavo' && (
              <div className={styles.insight}>
                <p>
                  <span className={styles.insightEmoji} aria-hidden="true">🔦</span>
                  Los espejos cóncavos concentran la luz en un punto focal. Se usan en faros de coches (foco en el reflector),
                  telescopios reflectores (Newton) y hornos solares. El telescopio Hubble usa un espejo cóncavo de 2,4 m de diámetro.
                </p>
              </div>
            )}
            {ejemploActivo === 'convexo' && (
              <div className={styles.insight}>
                <p>
                  <span className={styles.insightEmoji} aria-hidden="true">🚗</span>
                  Los espejos convexos amplían el campo de visión al divergir los rayos reflejados. Por eso se usan como retrovisores
                  laterales (&quot;los objetos están más cerca de lo que parecen&quot;) y en esquinas de tiendas y garajes para vigilancia.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── SECCIÓN 2: REFRACCIÓN ── */}
        {seccion === 'refraccion' && (
          <div id="panel-refraccion" role="tabpanel">
            <div className={styles.svgContainer}>
              <RefraccionSVG angulo={anguloRefraccion} medio={medioActual} />
            </div>

            <div className={styles.controles}>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-refraccion">
                  Ángulo de incidencia: <span className={styles.sliderValue}>{anguloRefraccion}°</span>
                </label>
                <input
                  id="slider-refraccion"
                  type="range"
                  min="0"
                  max="89"
                  value={anguloRefraccion}
                  onChange={e => setAnguloRefraccion(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>

              <div>
                <span className={styles.sliderLabel}>Medio:</span>
                <div className={styles.toggleGroup}>
                  {MEDIOS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`${styles.toggleBtn} ${medioId === m.id ? styles.toggleBtnActivo : ''}`}
                      onClick={() => setMedioId(m.id)}
                      aria-pressed={medioId === m.id}
                    >
                      {m.nombre} (n={m.n.toFixed(2).replace('.', ',')})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formulaBox}>
              <span className={styles.formulaLabel}>Ley de Snell</span>
              <code className={styles.formulaValor}>
                n₁ · sin(θ₁) = n₂ · sin(θ₂)
              </code>
            </div>

            {(() => {
              const critAngle = radToDeg(Math.asin(1 / medioActual.n));
              const sinT2 = Math.sin(degToRad(anguloRefraccion)) / medioActual.n;
              if (sinT2 >= 1) {
                return (
                  <p className={styles.criticalAngle}>
                    Reflexión total interna — el ángulo supera el crítico ({critAngle.toFixed(1).replace('.', ',')}°).
                    Este fenómeno es la base de la fibra óptica.
                  </p>
                );
              }
              return null;
            })()}

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">✏️</span>
                El lápiz partido en un vaso de agua es un ejemplo cotidiano de refracción: la luz cambia de dirección al pasar del agua al aire, y tu cerebro interpreta los rayos como si vinieran en línea recta.
                Los espejismos en carretera ocurren cuando el aire caliente cerca del asfalto tiene menor índice de refracción que el aire frío de arriba.
              </p>
            </div>
          </div>
        )}

        {/* ── SECCIÓN 3: LENTES ── */}
        {seccion === 'lentes' && (
          <div id="panel-lentes" role="tabpanel">
            <div className={styles.svgContainer}>
              <LentesSVG convergente={convergente} distObj={distObj} />
            </div>

            <div className={styles.controles}>
              <div>
                <span className={styles.sliderLabel}>Tipo de lente:</span>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${convergente ? styles.toggleBtnActivo : ''}`}
                    onClick={() => setConvergente(true)}
                    aria-pressed={convergente}
                  >
                    Convergente (+)
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${!convergente ? styles.toggleBtnActivo : ''}`}
                    onClick={() => setConvergente(false)}
                    aria-pressed={!convergente}
                  >
                    Divergente (-)
                  </button>
                </div>
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-dist">
                  Distancia del objeto: <span className={styles.sliderValue}>{distObj} px</span>
                </label>
                <input
                  id="slider-dist"
                  type="range"
                  min="50"
                  max="250"
                  value={distObj}
                  onChange={e => setDistObj(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>

            <div className={styles.formulaBox}>
              <span className={styles.formulaLabel}>Ecuación de lentes delgadas</span>
              <code className={styles.formulaValor}>1/f = 1/d₀ + 1/dᵢ</code>
            </div>

            <div className={styles.ejemplosGrid}>
              <div className={styles.ejemploCard} role="article">
                <span className={styles.ejemploIcono} aria-hidden="true">👁️</span>
                <span className={styles.ejemploNombre}>Ojo humano</span>
                <span className={styles.ejemploDesc}>Lente convergente que enfoca en la retina</span>
              </div>
              <div className={styles.ejemploCard} role="article">
                <span className={styles.ejemploIcono} aria-hidden="true">👓</span>
                <span className={styles.ejemploNombre}>Gafas miopía</span>
                <span className={styles.ejemploDesc}>Lente divergente que aleja el foco</span>
              </div>
              <div className={styles.ejemploCard} role="article">
                <span className={styles.ejemploIcono} aria-hidden="true">🔎</span>
                <span className={styles.ejemploNombre}>Lupa</span>
                <span className={styles.ejemploDesc}>Convergente: imagen virtual aumentada</span>
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">💡</span>
                Las lentes convergentes concentran los rayos paralelos en el foco (imagen real e invertida cuando el objeto está más allá del foco).
                Las divergentes hacen que los rayos diverjan como si vinieran de un foco virtual: la imagen es siempre virtual, derecha y más pequeña.
                El ojo humano ajusta la curvatura de su cristalino (acomodación) para enfocar objetos a diferentes distancias.
              </p>
            </div>
          </div>
        )}

        {/* ── SECCIÓN 4: LA LUZ EN COLORES ── */}
        {seccion === 'colores' && (
          <div id="panel-colores" role="tabpanel">
            <div className={styles.svgContainer}>
              <PrismaSVG />
            </div>

            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Espectro visible (380 - 700 nm)</h3>
            <div className={styles.espectro} aria-label="Espectro visible del violeta al rojo" />
            <div className={styles.espectroLabels}>
              <span>380 nm (Violeta)</span>
              <span>500 nm</span>
              <span>600 nm</span>
              <span>700 nm (Rojo)</span>
            </div>

            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Espectro electromagnético completo</h3>
            <div className={styles.espectroEM} aria-label="Espectro electromagnético completo">
              {ESPECTRO_EM.map(banda => (
                <div
                  key={banda.nombre}
                  className={styles.espectroEMBanda}
                  style={{ background: banda.color }}
                >
                  <span className={styles.espectroEMNombre}>{banda.nombre}</span>
                  <span className={styles.espectroEMLambda}>{banda.lambda}</span>
                </div>
              ))}
            </div>

            <div className={styles.curiosidadesGrid}>
              <div className={styles.curiosidadCard}>
                <span className={styles.curiosidadIcono} aria-hidden="true">🌈</span>
                <p className={styles.curiosidadTexto}>Newton descubrió la descomposición de la luz con un prisma en 1666 en su habitación de Cambridge.</p>
              </div>
              <div className={styles.curiosidadCard}>
                <span className={styles.curiosidadIcono} aria-hidden="true">👁️</span>
                <p className={styles.curiosidadTexto}>El ojo humano distingue aproximadamente 10 millones de colores diferentes con solo 3 tipos de conos.</p>
              </div>
              <div className={styles.curiosidadCard}>
                <span className={styles.curiosidadIcono} aria-hidden="true">🦐</span>
                <p className={styles.curiosidadTexto}>El camarón mantis tiene 16 tipos de receptores de color. Nosotros solo 3 (rojo, verde, azul).</p>
              </div>
              <div className={styles.curiosidadCard}>
                <span className={styles.curiosidadIcono} aria-hidden="true">💡</span>
                <p className={styles.curiosidadTexto}>La luz viaja a 299.792 km/s en el vacío. En agua viaja un 25% más lento; en diamante, un 59% más lento.</p>
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <span className={styles.insightEmoji} aria-hidden="true">🔬</span>
                La luz blanca es la suma de todos los colores del espectro visible. Cada color tiene una longitud de onda diferente,
                y al atravesar un prisma, el vidrio desvía más los colores de menor longitud de onda (violeta) que los de mayor (rojo).
                Este fenómeno se llama dispersión cromática y es también la causa de los arcoíris naturales.
              </p>
            </div>
          </div>
        )}

        {/* Sección educativa */}
        <EducationalSection
          title="Profundiza en la óptica"
          subtitle="Conceptos clave para Bachillerato y más allá"
          defaultOpen={false}
        >
          <h3>Naturaleza dual de la luz</h3>
          <p>
            La luz se comporta como onda (refracción, difracción, interferencia) y como partícula (efecto fotoeléctrico, emisión).
            Esta dualidad onda-partícula fue uno de los grandes descubrimientos del siglo XX. Los fotones no tienen masa en reposo,
            pero transportan energía proporcional a su frecuencia: E = h·f, donde h es la constante de Planck (6,626 × 10⁻³⁴ J·s).
          </p>

          <h3>Reflexión total y fibra óptica</h3>
          <p>
            Cuando la luz pasa de un medio más denso a uno menos denso (vidrio → aire), existe un ángulo crítico por encima del cual
            toda la luz se refleja sin salir del medio. La fibra óptica explota este fenómeno: un hilo de vidrio ultrapuro guía la luz
            a miles de kilómetros sin que escape, permitiendo comunicaciones a la velocidad de la luz.
            Las fibras modernas transmiten hasta 100 Tbps por un solo cable.
          </p>

          <h3>Óptica geométrica vs. óptica ondulatoria</h3>
          <p>
            La óptica geométrica (rayos, lentes, espejos) es una simplificación que funciona cuando los objetos son mucho mayores
            que la longitud de onda de la luz (~500 nm). Cuando las dimensiones se acercan a esa escala, aparecen fenómenos ondulatorios
            como la difracción (la luz se curva al pasar por una rendija) y la interferencia (dos ondas se refuerzan o se anulan).
            La iridiscencia de las alas de mariposa o las burbujas de jabón son ejemplos de interferencia en láminas delgadas.
          </p>

          <h3>El espectro electromagnético</h3>
          <p>
            La luz visible es solo una franja minúscula del espectro electromagnético. Las ondas de radio (metros a kilómetros) llevan
            señales de TV y Wi-Fi. Los microondas calientan comida excitando moléculas de agua. El infrarrojo es calor radiante
            (mandos a distancia, cámaras térmicas). El ultravioleta causa quemaduras solares y es germicida. Los rayos X atraviesan
            tejidos blandos pero no huesos (radiografías). Los rayos gamma se generan en reacciones nucleares y son extremadamente
            energéticos. Todos viajan a la misma velocidad (c), pero difieren en frecuencia y longitud de onda.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Los diagramas SVG son representaciones simplificadas (óptica geométrica de rayos).
            Los índices de refracción corresponden a luz amarilla de sodio (589 nm) a 20 °C.
            En la realidad, el índice varía ligeramente con la longitud de onda (dispersión cromática).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-optica')} />
        <ShareCard appName="visualizador-optica" />
        <Footer appName="visualizador-optica" />
    </div>
  );
}
