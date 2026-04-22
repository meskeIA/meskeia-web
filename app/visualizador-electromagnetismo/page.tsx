'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorElectromagnetismo.module.css';
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

type TipoCarga = 'positiva' | 'negativa';
type ZonaEspectro = 'radio' | 'microondas' | 'infrarrojo' | 'visible' | 'ultravioleta' | 'rayosX' | 'gamma';

interface InfoZonaEspectro {
  nombre: string;
  icono: string;
  frecuencia: string;
  longitud: string;
  aplicaciones: string[];
  color: string;
  colorTexto: string;
}

// ─────────────────────────────────────────────
// Datos del espectro electromagnético
// ─────────────────────────────────────────────

const ZONAS_ESPECTRO: Record<ZonaEspectro, InfoZonaEspectro> = {
  radio: {
    nombre: 'Ondas de radio',
    icono: '📻',
    frecuencia: '3 Hz – 300 MHz',
    longitud: '1 mm – 100.000 km',
    aplicaciones: ['Radio AM/FM', 'Televisión', 'Comunicaciones móviles', 'WiFi (frecuencias bajas)', 'GPS'],
    color: '#8B5CF6',
    colorTexto: '#fff',
  },
  microondas: {
    nombre: 'Microondas',
    icono: '🎙️',
    frecuencia: '300 MHz – 300 GHz',
    longitud: '1 mm – 1 m',
    aplicaciones: ['Horno microondas', 'WiFi 2,4 GHz y 5 GHz', 'Bluetooth', 'Radar meteorológico', 'Satélites'],
    color: '#3B82F6',
    colorTexto: '#fff',
  },
  infrarrojo: {
    nombre: 'Infrarrojo',
    icono: '🌡️',
    frecuencia: '300 GHz – 430 THz',
    longitud: '700 nm – 1 mm',
    aplicaciones: ['Control remoto TV', 'Cámaras térmicas', 'Calefactores infrarrojos', 'Sensores de movimiento', 'Astronomía infrarroja'],
    color: '#EF4444',
    colorTexto: '#fff',
  },
  visible: {
    nombre: 'Luz visible',
    icono: '👁️',
    frecuencia: '430 – 770 THz',
    longitud: '380 – 700 nm',
    aplicaciones: ['Visión humana', 'Fotografía', 'Pantallas LED/OLED', 'Fibra óptica (vidrio)', 'Fotosíntesis'],
    color: 'linear-gradient(90deg, #7C3AED, #2563EB, #059669, #D97706, #DC2626)',
    colorTexto: '#fff',
  },
  ultravioleta: {
    nombre: 'Ultravioleta',
    icono: '🔆',
    frecuencia: '770 THz – 30 PHz',
    longitud: '10 – 380 nm',
    aplicaciones: ['Síntesis vitamina D', 'Esterilización UV', 'Lámparas de luz negra', 'Detección de billetes falsos', 'Astronomía UV'],
    color: '#6D28D9',
    colorTexto: '#fff',
  },
  rayosX: {
    nombre: 'Rayos X',
    icono: '🏥',
    frecuencia: '30 PHz – 30 EHz',
    longitud: '0,01 – 10 nm',
    aplicaciones: ['Radiografías médicas', 'TAC (tomografía)', 'Inspección de equipaje', 'Cristalografía de rayos X', 'Astronomía de rayos X'],
    color: '#0F766E',
    colorTexto: '#fff',
  },
  gamma: {
    nombre: 'Rayos gamma',
    icono: '☢️',
    frecuencia: '> 30 EHz',
    longitud: '< 0,01 nm',
    aplicaciones: ['Radioterapia oncológica', 'Esterilización médica', 'Gammagrafía', 'Detectores de explosivos', 'Estudios de pulsares'],
    color: '#166534',
    colorTexto: '#fff',
  },
};

const ORDEN_ZONAS: ZonaEspectro[] = ['radio', 'microondas', 'infrarrojo', 'visible', 'ultravioleta', 'rayosX', 'gamma'];

// ─────────────────────────────────────────────
// Sección 1: Campo eléctrico
// ─────────────────────────────────────────────

function SeccionCampoElectrico(): React.ReactNode {
  const [tipoCarga, setTipoCarga] = useState<TipoCarga>('positiva');
  const [magnitud, setMagnitud] = useState<number>(5);

  const esPositiva = tipoCarga === 'positiva';
  const colorCarga = esPositiva ? '#E74C3C' : '#2E86AB';
  const simbolo = esPositiva ? '+' : '−';

  // Generar líneas de campo radiales
  const numLineas = Math.max(6, Math.round(magnitud * 1.2));
  const lineas = Array.from({ length: numLineas }, (_, i) => {
    const angulo = (i / numLineas) * 360;
    return angulo;
  });

  // Radio de anillos concéntricos — la densidad varía con la magnitud
  const anillos = [40, 65, 90, 115].slice(0, Math.max(2, Math.round(magnitud / 3)));

  // Fuerza de Coulomb simplificada (q1=q2=magnitud, r=1)
  const k = 8.99e9;
  const carga = magnitud * 1e-9; // nanocoulombios
  const r = 0.5; // metros de referencia
  const fuerza = (k * carga * carga) / (r * r);

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">⚡</span>
        <div>
          <h2 className={styles.seccionTitulo}>Campo eléctrico de una carga puntual</h2>
          <p className={styles.seccionSubtitulo}>Las cargas crean campos que ejercen fuerzas sobre otras cargas</p>
        </div>
      </div>

      {/* Controles */}
      <div className={styles.controlesRow}>
        <div className={styles.toggleGroup} role="group" aria-label="Tipo de carga">
          <button
            className={`${styles.toggleBtn} ${tipoCarga === 'positiva' ? styles.toggleBtnActivo : ''}`}
            onClick={() => setTipoCarga('positiva')}
            aria-pressed={tipoCarga === 'positiva'}
          >
            + Carga positiva
          </button>
          <button
            className={`${styles.toggleBtn} ${tipoCarga === 'negativa' ? styles.toggleBtnActivo : ''}`}
            onClick={() => setTipoCarga('negativa')}
            aria-pressed={tipoCarga === 'negativa'}
          >
            − Carga negativa
          </button>
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <label htmlFor="slider-magnitud-carga" className={styles.sliderLabel}>
          Magnitud de la carga: <strong>{magnitud} nC</strong>
        </label>
        <input
          id="slider-magnitud-carga"
          type="range"
          min={1}
          max={10}
          step={1}
          value={magnitud}
          onChange={(e) => setMagnitud(parseInt(e.target.value))}
          className={styles.slider}
          aria-label={`Magnitud de la carga: ${magnitud} nanocoulombios`}
        />
        <div className={styles.sliderMarks}>
          <span>1 nC</span>
          <span>5 nC</span>
          <span>10 nC</span>
        </div>
      </div>

      {/* SVG del campo eléctrico */}
      <div className={styles.svgWrapper} aria-label={`Campo eléctrico de una carga ${tipoCarga}`}>
        <svg
          viewBox="-140 -140 280 280"
          width="100%"
          height="100%"
          aria-hidden="true"
        >
          {/* Anillos concéntricos (equipotenciales) */}
          {anillos.map((r, i) => (
            <circle
              key={`anillo-${i}`}
              cx={0}
              cy={0}
              r={r}
              fill="none"
              stroke={colorCarga}
              strokeWidth={0.6}
              strokeDasharray="3 4"
              opacity={0.3 - i * 0.04}
            />
          ))}

          {/* Líneas de campo radiales */}
          {lineas.map((angulo, i) => {
            const rad = (angulo * Math.PI) / 180;
            const r1 = 18;
            const r2 = 118;
            const x1 = r1 * Math.cos(rad);
            const y1 = r1 * Math.sin(rad);
            const x2 = r2 * Math.cos(rad);
            const y2 = r2 * Math.sin(rad);
            // Punta de flecha: sale de la carga si positiva, llega si negativa
            const xFl = esPositiva ? x2 : x1 + (x2 - x1) * 0.15;
            const yFl = esPositiva ? y2 : y1 + (y2 - y1) * 0.15;
            const dx = esPositiva ? x2 - x1 : x1 - x2;
            const dy = esPositiva ? y2 - y1 : y1 - y2;
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = (dx / len) * 7;
            const ny = (dy / len) * 7;
            const px = (-dy / len) * 4;
            const py = (dx / len) * 4;

            return (
              <g key={`linea-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colorCarga}
                  strokeWidth={1.2}
                  opacity={0.7}
                />
                {/* Punta de flecha */}
                <polygon
                  points={`${xFl + nx},${yFl + ny} ${xFl - nx + px},${yFl - ny + py} ${xFl - nx - px},${yFl - ny - py}`}
                  fill={colorCarga}
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* Carga central */}
          <circle cx={0} cy={0} r={16} fill={colorCarga} opacity={0.15} />
          <circle cx={0} cy={0} r={12} fill={colorCarga} />
          <text
            x={0}
            y={5}
            textAnchor="middle"
            fill="white"
            fontSize={14}
            fontWeight="bold"
          >
            {simbolo}
          </text>

          {/* Etiqueta de magnitud */}
          <text x={0} y={130} textAnchor="middle" fill={colorCarga} fontSize={9} opacity={0.8}>
            q = {magnitud} nC
          </text>
        </svg>
      </div>

      {/* Info panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoPanelItem}>
          <span className={styles.infoPanelIcono} aria-hidden="true">{esPositiva ? '🔴' : '🔵'}</span>
          <div>
            <strong>Carga {tipoCarga}</strong>
            <p>Las líneas de campo {esPositiva ? 'salen radialmente hacia afuera' : 'entran radialmente hacia el centro'}</p>
          </div>
        </div>
        <div className={styles.infoPanelItem}>
          <span className={styles.infoPanelIcono} aria-hidden="true">🔢</span>
          <div>
            <strong>Fuerza de Coulomb (r = 0,5 m)</strong>
            <p>F = k·q²/r² ≈ <strong>{fuerza.toExponential(2)} N</strong></p>
          </div>
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Qué es el campo eléctrico?</strong> Es una región del espacio donde una carga experimenta
        una fuerza. La densidad de las líneas indica la intensidad: más juntas = campo más fuerte.
        Las cargas opuestas se atraen, las iguales se repelen (ley de Coulomb: F = k·q₁·q₂/r²).
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Campo magnético de un imán
// ─────────────────────────────────────────────

function SeccionCampoMagnetico(): React.ReactNode {
  const [rotacion, setRotacion] = useState<number>(0);
  const [brujulaAngulo, setBrujulaAngulo] = useState<number>(0);

  const girarIman = useCallback(() => {
    const nuevo = (rotacion + 90) % 360;
    setRotacion(nuevo);
    setBrujulaAngulo(nuevo);
  }, [rotacion]);

  // Curvas de campo de dipolo magnético en forma de semielipses
  // Generamos curvas de campo típicas de un dipolo: van de N a S por fuera
  const curvasCampo = [
    // Externas (de N a S por fuera)
    { rx: 50, ry: 35, offset: 0, parte: 'exterior' },
    { rx: 75, ry: 55, offset: 0, parte: 'exterior' },
    { rx: 100, ry: 75, offset: 0, parte: 'exterior' },
    { rx: 52, ry: 35, offset: 0, parte: 'exterior-bajo' },
    { rx: 78, ry: 55, offset: 0, parte: 'exterior-bajo' },
    { rx: 103, ry: 75, offset: 0, parte: 'exterior-bajo' },
  ];

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">🧲</span>
        <div>
          <h2 className={styles.seccionTitulo}>Campo magnético de un imán</h2>
          <p className={styles.seccionSubtitulo}>Las líneas de campo son cerradas — no hay monopolos magnéticos</p>
        </div>
      </div>

      <div className={styles.controlesRow}>
        <button
          className={styles.btnPrimario}
          onClick={girarIman}
          aria-label="Girar imán 90 grados"
        >
          🔄 Girar imán 90°
        </button>
        <div className={styles.brujulaWrapper} aria-label={`Brújula apuntando a ${brujulaAngulo}°`}>
          <div
            className={styles.brujula}
            style={{ transform: `rotate(${brujulaAngulo}deg)` }}
            aria-hidden="true"
          >
            <div className={styles.brujulaNorte}>N</div>
            <div className={styles.brujulaSur}>S</div>
          </div>
          <span className={styles.brujulaLabel}>Brújula</span>
        </div>
      </div>

      {/* SVG del dipolo magnético */}
      <div className={styles.svgWrapper} aria-label="Dipolo magnético con líneas de campo">
        <svg
          viewBox="-160 -120 320 240"
          width="100%"
          height="100%"
          aria-hidden="true"
          style={{ transform: `rotate(${rotacion}deg)`, transition: 'transform 0.5s ease' }}
        >
          {/* Líneas de campo externas — arcos de N a S */}
          {curvasCampo.map((c, i) => {
            const ySign = c.parte === 'exterior-bajo' ? 1 : -1;
            const startX = 30;
            const endX = -30;
            const y = 0;
            const cy2 = ySign * c.ry;
            return (
              <path
                key={`curva-${i}`}
                d={`M ${startX},${y} C ${startX + c.rx * 0.6},${cy2 * 1.4} ${endX - c.rx * 0.6},${cy2 * 1.4} ${endX},${y}`}
                fill="none"
                stroke="#2E86AB"
                strokeWidth={1.5}
                opacity={0.55 - i * 0.03}
              />
            );
          })}

          {/* Líneas de campo internas (dentro del imán, de S a N) */}
          <path
            d="M -30,0 C -30,-12 30,-12 30,0"
            fill="none"
            stroke="#48A9A6"
            strokeWidth={1.5}
            opacity={0.5}
            strokeDasharray="4 3"
          />
          <path
            d="M -30,0 C -30,12 30,12 30,0"
            fill="none"
            stroke="#48A9A6"
            strokeWidth={1.5}
            opacity={0.5}
            strokeDasharray="4 3"
          />

          {/* Imán */}
          <rect x={-35} y={-22} width={35} height={44} rx={4} fill="#E74C3C" />
          <rect x={0} y={-22} width={35} height={44} rx={4} fill="#2E86AB" />
          <text x={-17} y={6} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">N</text>
          <text x={17} y={6} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">S</text>

          {/* Flechas indicadoras de dirección */}
          <polygon points="-110,0 -118,-5 -118,5" fill="#2E86AB" opacity={0.6} />
          <polygon points="113,0 105,-5 105,5" fill="#2E86AB" opacity={0.6} />
        </svg>
      </div>

      <div className={styles.infoPanel}>
        <div className={styles.infoPanelItem}>
          <span className={styles.infoPanelIcono} aria-hidden="true">🔄</span>
          <div>
            <strong>Líneas cerradas</strong>
            <p>Las líneas de campo magnético siempre forman lazos cerrados: salen por el polo N, rodean el imán y entran por el polo S</p>
          </div>
        </div>
        <div className={styles.infoPanelItem}>
          <span className={styles.infoPanelIcono} aria-hidden="true">🚫</span>
          <div>
            <strong>Sin monopolos magnéticos</strong>
            <p>A diferencia de las cargas eléctricas, no existe el &quot;polo magnético solo&quot; — siempre hay N y S juntos</p>
          </div>
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Por qué son cerradas?</strong> La ley de Gauss para el magnetismo (∇·B = 0) establece que
        no existen monopolos magnéticos. Si cortas un imán por la mitad, obtienes dos imanes más pequeños,
        cada uno con su polo N y su polo S.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Ley de Faraday
// ─────────────────────────────────────────────

type EstadoIman = 'lejos' | 'acercando' | 'cerca' | 'alejando';

interface ConfigEstadoIman {
  xIman: number;
  corriente: number;
  label: string;
  galvangulo: number;
}

const ESTADOS_IMAN: Record<EstadoIman, ConfigEstadoIman> = {
  lejos: { xIman: -250, corriente: 0, label: 'Imán lejos — sin corriente', galvangulo: 0 },
  acercando: { xIman: -160, corriente: 0.7, label: 'Acercándose — corriente inducida fuerte', galvangulo: 45 },
  cerca: { xIman: -85, corriente: 0.2, label: 'Imán estático cerca — corriente mínima', galvangulo: 10 },
  alejando: { xIman: -160, corriente: -0.6, label: 'Alejándose — corriente invertida (Ley de Lenz)', galvangulo: -40 },
};

function SeccionFaraday(): React.ReactNode {
  const [estado, setEstado] = useState<EstadoIman>('lejos');

  const config = ESTADOS_IMAN[estado];
  const hayCorrente = Math.abs(config.corriente) > 0.1;
  const colorBobina = hayCorrente
    ? config.corriente > 0 ? '#F59E0B' : '#10B981'
    : '#6B7280';

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">🔌</span>
        <div>
          <h2 className={styles.seccionTitulo}>Ley de Faraday — Inducción electromagnética</h2>
          <p className={styles.seccionSubtitulo}>Un imán en movimiento genera corriente eléctrica en una bobina</p>
        </div>
      </div>

      {/* Botones de estado */}
      <div className={styles.faradayBotones} role="group" aria-label="Estado del imán">
        {(Object.keys(ESTADOS_IMAN) as EstadoIman[]).map((est) => (
          <button
            key={est}
            className={`${styles.faradayBtn} ${estado === est ? styles.faradayBtnActivo : ''}`}
            onClick={() => setEstado(est)}
            aria-pressed={estado === est}
          >
            {est === 'lejos' && '⬅ Lejos'}
            {est === 'acercando' && '➡ Acercar'}
            {est === 'cerca' && '⏸ Cerca'}
            {est === 'alejando' && '⬅ Alejar'}
          </button>
        ))}
      </div>

      {/* SVG de la inducción */}
      <div className={styles.svgWrapper} aria-label={config.label}>
        <svg viewBox="-280 -90 560 180" width="100%" height="100%" aria-hidden="true">
          {/* Imán */}
          <g transform={`translate(${config.xIman}, 0)`} style={{ transition: 'transform 0.6s ease' }}>
            <rect x={0} y={-20} width={40} height={40} rx={3} fill="#E74C3C" />
            <rect x={40} y={-20} width={40} height={40} rx={3} fill="#2E86AB" />
            <text x={20} y={6} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">N</text>
            <text x={60} y={6} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">S</text>

            {/* Líneas de campo del imán (simplificadas) */}
            {hayCorrente && (
              <>
                <path d="M 80,0 C 100,-30 160,-30 180,0" fill="none" stroke="#2E86AB" strokeWidth={1.2} opacity={0.4} strokeDasharray="3 3" />
                <path d="M 80,0 C 100,30 160,30 180,0" fill="none" stroke="#2E86AB" strokeWidth={1.2} opacity={0.4} strokeDasharray="3 3" />
                <path d="M 80,0 C 110,-55 210,-55 230,0" fill="none" stroke="#2E86AB" strokeWidth={1} opacity={0.25} strokeDasharray="3 3" />
                <path d="M 80,0 C 110,55 210,55 230,0" fill="none" stroke="#2E86AB" strokeWidth={1} opacity={0.25} strokeDasharray="3 3" />
              </>
            )}
          </g>

          {/* Bobina circular (elipse) */}
          <g transform="translate(120, 0)">
            {/* Vueltas de bobina */}
            {[-18, -9, 0, 9, 18].map((offsetX, i) => (
              <ellipse
                key={`vuelta-${i}`}
                cx={offsetX}
                cy={0}
                rx={10}
                ry={55}
                fill="none"
                stroke={colorBobina}
                strokeWidth={2.5}
                opacity={0.85}
                style={{ transition: 'stroke 0.4s ease' }}
              />
            ))}

            {/* Corriente animada (flechas en la bobina) */}
            {hayCorrente && (
              <>
                <polygon
                  points={`0,${config.corriente > 0 ? -55 : 55} -5,${config.corriente > 0 ? -45 : 45} 5,${config.corriente > 0 ? -45 : 45}`}
                  fill={colorBobina}
                  className={styles.flechaCorriente}
                />
                <polygon
                  points={`0,${config.corriente > 0 ? 55 : -55} -5,${config.corriente > 0 ? 45 : -45} 5,${config.corriente > 0 ? 45 : -45}`}
                  fill={colorBobina}
                  className={styles.flechaCorriente}
                />
              </>
            )}

            {/* Etiqueta de corriente */}
            <text
              x={0}
              y={75}
              textAnchor="middle"
              fill={colorBobina}
              fontSize={9}
              style={{ transition: 'fill 0.4s ease' }}
            >
              {hayCorrente ? `I ${config.corriente > 0 ? '→' : '←'} inducida` : 'Sin corriente'}
            </text>
          </g>

          {/* Galvanómetro */}
          <g transform="translate(200, 0)">
            <circle cx={0} cy={0} r={35} fill="var(--bg-card)" stroke="#999" strokeWidth={1.5} />
            <text x={0} y={-22} textAnchor="middle" fontSize={7} fill="var(--text-secondary)">G</text>
            {/* Aguja */}
            <line
              x1={0}
              y1={0}
              x2={Math.sin((config.galvangulo * Math.PI) / 180) * 28}
              y2={-Math.cos((config.galvangulo * Math.PI) / 180) * 28}
              stroke={colorBobina}
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ transition: 'all 0.6s ease' }}
            />
            <circle cx={0} cy={0} r={3} fill={colorBobina} />
            {/* Escala */}
            <text x={-25} y={8} fontSize={7} fill="var(--text-secondary)">−</text>
            <text x={19} y={8} fontSize={7} fill="var(--text-secondary)">+</text>
            <text x={0} y={42} textAnchor="middle" fontSize={7} fill="var(--text-secondary)">Galvanómetro</text>
          </g>
        </svg>
      </div>

      {/* Panel de estado */}
      <div className={`${styles.estadoPanel} ${hayCorrente ? styles.estadoPanelActivo : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className={styles.estadoPanelIcono} aria-hidden="true">{hayCorrente ? (config.corriente > 0 ? '⚡' : '🔋') : '💤'}</span>
        <div>
          <strong>{config.label}</strong>
          {hayCorrente && (
            <p>
              {config.corriente > 0
                ? 'La bobina se opone al flujo creciente (Ley de Lenz: la corriente inducida crea un campo contrario al imán)'
                : 'Al alejar el imán, la corriente se invierte para mantener el flujo (Ley de Lenz en acción)'}
            </p>
          )}
        </div>
      </div>

      <div className={styles.formulaBox}>
        <div className={styles.formulaTexto}>ε = −dΦ/dt</div>
        <div className={styles.formulaDesc}>
          La fuerza electromotriz inducida (ε) es proporcional a la velocidad de cambio del flujo magnético (Φ).
          El signo negativo es la Ley de Lenz: la corriente inducida se opone al cambio.
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Espectro electromagnético
// ─────────────────────────────────────────────

function SeccionEspectro(): React.ReactNode {
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaEspectro>('visible');
  const [mostrarAplicaciones, setMostrarAplicaciones] = useState<boolean>(true);
  const [posicionSlider, setPosicionSlider] = useState<number>(50);

  // Determinar zona según posición del slider (0-100)
  const getZonaPorPosicion = (pos: number): ZonaEspectro => {
    if (pos < 14) return 'radio';
    if (pos < 28) return 'microondas';
    if (pos < 42) return 'infrarrojo';
    if (pos < 58) return 'visible';
    if (pos < 72) return 'ultravioleta';
    if (pos < 86) return 'rayosX';
    return 'gamma';
  };

  const zonaSlider = getZonaPorPosicion(posicionSlider);
  const infoSeleccionada = ZONAS_ESPECTRO[zonaSeleccionada];

  const COLORES_BARRA: Record<ZonaEspectro, string> = {
    radio: '#8B5CF6',
    microondas: '#3B82F6',
    infrarrojo: '#EF4444',
    visible: '#F59E0B',
    ultravioleta: '#6D28D9',
    rayosX: '#0F766E',
    gamma: '#166534',
  };

  return (
    <section className={styles.seccion}>
      <div className={styles.seccionHeader}>
        <span className={styles.seccionIcono} aria-hidden="true">🌈</span>
        <div>
          <h2 className={styles.seccionTitulo}>Espectro electromagnético</h2>
          <p className={styles.seccionSubtitulo}>Toda la luz — visible o no — son ondas electromagnéticas de diferente frecuencia</p>
        </div>
      </div>

      {/* Toggle aplicaciones */}
      <div className={styles.controlesRow}>
        <button
          className={`${styles.toggleBtn} ${mostrarAplicaciones ? styles.toggleBtnActivo : ''}`}
          onClick={() => setMostrarAplicaciones((v) => !v)}
          aria-pressed={mostrarAplicaciones}
        >
          📱 Mostrar aplicaciones cotidianas
        </button>
      </div>

      {/* Barra del espectro */}
      <div className={styles.espectroBarra} role="list" aria-label="Zonas del espectro electromagnético">
        {ORDEN_ZONAS.map((zona) => {
          const info = ZONAS_ESPECTRO[zona];
          const isActive = zona === zonaSeleccionada;
          const bgColor = zona === 'visible'
            ? 'linear-gradient(90deg, #7C3AED, #2563EB, #059669, #D97706, #DC2626)'
            : info.color;
          return (
            <button
              key={zona}
              className={`${styles.espectroZona} ${isActive ? styles.espectroZonaActiva : ''}`}
              style={{ background: bgColor, color: info.colorTexto }}
              onClick={() => setZonaSeleccionada(zona)}
              role="listitem"
              aria-pressed={isActive}
              aria-label={`${info.nombre}: ${info.frecuencia}`}
            >
              <span className={styles.espectroIcono} aria-hidden="true">{info.icono}</span>
              <span className={styles.espectroNombre}>{info.nombre.split(' ')[0]}</span>
              {mostrarAplicaciones && (
                <span className={styles.espectroAplicacion} aria-hidden="true">
                  {info.aplicaciones[0].split(' ').slice(0, 2).join(' ')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slider de longitud de onda */}
      <div className={styles.sliderContainer}>
        <label htmlFor="slider-espectro" className={styles.sliderLabel}>
          Explorar longitud de onda →{' '}
          <strong style={{ color: COLORES_BARRA[zonaSlider] }}>{ZONAS_ESPECTRO[zonaSlider].nombre}</strong>
        </label>
        <input
          id="slider-espectro"
          type="range"
          min={0}
          max={100}
          step={1}
          value={posicionSlider}
          onChange={(e) => {
            const pos = parseInt(e.target.value);
            setPosicionSlider(pos);
            setZonaSeleccionada(getZonaPorPosicion(pos));
          }}
          className={styles.sliderEspectro}
          aria-label="Explorar el espectro electromagnético"
        />
        <div className={styles.sliderMarks}>
          <span>Radio</span>
          <span>Micro</span>
          <span>IR</span>
          <span>Visible</span>
          <span>UV</span>
          <span>Rayos X</span>
          <span>Gamma</span>
        </div>
      </div>

      {/* Info de la zona seleccionada */}
      <div className={styles.espectroInfo}>
        <div className={styles.espectroInfoHeader} style={{ borderLeftColor: COLORES_BARRA[zonaSeleccionada] }}>
          <span className={styles.espectroInfoIcono} aria-hidden="true">{infoSeleccionada.icono}</span>
          <div>
            <h3 className={styles.espectroInfoNombre}>{infoSeleccionada.nombre}</h3>
            <p className={styles.espectroInfoFrecuencia}>Frecuencia: {infoSeleccionada.frecuencia}</p>
            <p className={styles.espectroInfoLongitud}>Longitud de onda: {infoSeleccionada.longitud}</p>
          </div>
        </div>
        <div className={styles.espectroAplicaciones}>
          <strong>Aplicaciones:</strong>
          <ul className={styles.espectroListaAplicaciones}>
            {infoSeleccionada.aplicaciones.map((ap) => (
              <li key={ap}>{ap}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorElectromagnetismo(): React.ReactNode {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Física · Ciencias</span>
          <h1 className={styles.heroTitle}>Electromagnetismo</h1>
          <p className={styles.heroSubtitle}>
            Campo eléctrico · Campo magnético · Inducción de Faraday · Espectro EM
          </p>
          <p className={styles.heroDesc}>
            Una de las fuerzas fundamentales del universo — responsable de la luz, la electricidad,
            los imanes y las ondas de radio. Explora cómo funciona con visualizaciones interactivas.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <SeccionCampoElectrico />
        <SeccionCampoMagnetico />
        <SeccionFaraday />
        <SeccionEspectro />
      </main>

      <EducationalSection
        title="Los Fundamentos del Electromagnetismo"
        subtitle="Las ecuaciones de Maxwell y por qué la luz es una onda electromagnética"
      >
        <div className={styles.educacional}>
          <h3>¿Qué es el electromagnetismo?</h3>
          <p>
            El electromagnetismo es una de las cuatro fuerzas fundamentales de la naturaleza. Describe
            la interacción entre cargas eléctricas y corrientes, y cómo estas crean campos eléctricos
            y magnéticos que se propagan por el espacio. Sin él, no existiría la luz, la electricidad,
            los imanes, la química ni la materia sólida tal como la conocemos.
          </p>

          <h3>Las 4 ecuaciones de Maxwell (en palabras)</h3>
          <p>
            James Clerk Maxwell unificó el electromagnetismo en 1865 con cuatro ecuaciones elegantes.
            En palabras sencillas:
          </p>
          <ul>
            <li>
              <strong>Ley de Gauss eléctrica:</strong> Las cargas eléctricas crean campos eléctricos
              que &quot;salen&quot; de las cargas positivas y &quot;entran&quot; en las negativas.
            </li>
            <li>
              <strong>Ley de Gauss magnética:</strong> No existen monopolos magnéticos. Las líneas del
              campo magnético siempre forman lazos cerrados.
            </li>
            <li>
              <strong>Ley de Faraday:</strong> Un campo magnético cambiante crea un campo eléctrico
              (esto permite los generadores y transformadores).
            </li>
            <li>
              <strong>Ley de Ampère-Maxwell:</strong> Una corriente eléctrica (o un campo eléctrico
              cambiante) crea un campo magnético circular alrededor.
            </li>
          </ul>

          <h3>¿Por qué la luz es una onda electromagnética?</h3>
          <p>
            Maxwell descubrió que un campo eléctrico oscilante crea un campo magnético, y viceversa.
            Esto genera una onda que se propaga sola por el espacio a 299.792.458 m/s — exactamente
            la velocidad de la luz. Concluyó que la luz <em>es</em> una onda electromagnética. Esto
            unificó la óptica, la electricidad y el magnetismo en una sola teoría.
          </p>

          <h3>Aplicaciones cotidianas</h3>
          <ul>
            <li>
              <strong>Motor eléctrico:</strong> Una corriente en un campo magnético genera fuerza
              mecánica (fuerza de Lorentz). Todos los motores eléctricos funcionan así.
            </li>
            <li>
              <strong>Generador:</strong> Lo inverso — mover un conductor en un campo magnético genera
              corriente (inducción de Faraday). Así funciona toda la generación de electricidad.
            </li>
            <li>
              <strong>Transformador:</strong> Usa la inducción mutua entre bobinas para cambiar el
              voltaje sin partes móviles.
            </li>
            <li>
              <strong>Microondas:</strong> Ondas de radio de alta frecuencia que hacen vibrar las
              moléculas de agua, generando calor.
            </li>
            <li>
              <strong>MRI (resonancia magnética):</strong> Usa campos magnéticos intensos y ondas
              de radio para obtener imágenes del interior del cuerpo sin radiación ionizante.
            </li>
          </ul>

          <h3>Conexión con la relatividad</h3>
          <p>
            Einstein desarrolló la relatividad especial en parte para resolver una inconsistencia en
            el electromagnetismo: las ecuaciones de Maxwell no eran las mismas para todos los
            observadores en movimiento relativo. La relatividad especial demostró que los campos
            eléctrico y magnético son en realidad dos aspectos del mismo campo electromagnético,
            visto desde distintos sistemas de referencia.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-electromagnetismo')} />
      <ShareCard appName="visualizador-electromagnetismo" />
      <Footer appName="visualizador-electromagnetismo" />
    </div>
  );
}
