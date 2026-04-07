'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './EstadosMateria.module.css';
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

type Seccion = 'estados' | 'transiciones' | 'diagrama' | 'curiosidades';
type EstadoMateria = 'solido' | 'liquido' | 'gas' | 'plasma';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'estados', titulo: 'Los 4 Estados', icono: '🔬', subtitulo: 'Partículas en acción' },
  { id: 'transiciones', titulo: 'Transiciones', icono: '🔄', subtitulo: '6 cambios de estado' },
  { id: 'diagrama', titulo: 'Diagrama de Fases', icono: '📊', subtitulo: 'Presión vs temperatura' },
  { id: 'curiosidades', titulo: 'Datos Curiosos', icono: '🌟', subtitulo: 'Hechos fascinantes' },
];

interface EstadoInfo {
  id: EstadoMateria;
  nombre: string;
  icono: string;
  color: string;
  forma: string;
  volumen: string;
  compresibilidad: string;
  energiaCinetica: string;
  descripcion: string;
}

const ESTADOS: EstadoInfo[] = [
  {
    id: 'solido', nombre: 'Sólido', icono: '🧊', color: '#2196F3',
    forma: 'Definida', volumen: 'Definido', compresibilidad: 'Muy baja', energiaCinetica: 'Baja',
    descripcion: 'Las partículas vibran en posiciones fijas, manteniendo forma y volumen constantes.',
  },
  {
    id: 'liquido', nombre: 'Líquido', icono: '💧', color: '#48A9A6',
    forma: 'Variable (toma la del recipiente)', volumen: 'Definido', compresibilidad: 'Baja', energiaCinetica: 'Media',
    descripcion: 'Las partículas se deslizan unas sobre otras, manteniendo volumen pero adaptándose al recipiente.',
  },
  {
    id: 'gas', nombre: 'Gas', icono: '💨', color: '#FF9800',
    forma: 'Variable', volumen: 'Variable', compresibilidad: 'Alta', energiaCinetica: 'Alta',
    descripcion: 'Las partículas se mueven libremente a gran velocidad, ocupando todo el espacio disponible.',
  },
  {
    id: 'plasma', nombre: 'Plasma', icono: '⚡', color: '#E91E63',
    forma: 'Variable', volumen: 'Variable', compresibilidad: 'Alta', energiaCinetica: 'Muy alta',
    descripcion: 'Gas ionizado: los electrones se separan de los átomos, creando un estado cargado eléctricamente.',
  },
];

// ─────────────────────────────────────────────
// Transiciones
// ─────────────────────────────────────────────

interface Transicion {
  nombre: string;
  desde: string;
  hasta: string;
  ejemplo: string;
  detalle: string;
  icono: string;
  color: string;
}

const TRANSICIONES: Transicion[] = [
  { nombre: 'Fusión', desde: 'Sólido', hasta: 'Líquido', ejemplo: 'Hielo derritiéndose', detalle: 'El calor rompe la estructura cristalina. El agua pasa de hielo a líquida a 0°C (a presión atmosférica).', icono: '🧊→💧', color: '#2196F3' },
  { nombre: 'Solidificación', desde: 'Líquido', hasta: 'Sólido', ejemplo: 'Agua congelándose en el freezer', detalle: 'Al perder energía, las moléculas se ordenan en una estructura cristalina. Es el proceso inverso a la fusión.', icono: '💧→🧊', color: '#1565C0' },
  { nombre: 'Evaporación', desde: 'Líquido', hasta: 'Gas', ejemplo: 'Charco que desaparece al sol', detalle: 'Las moléculas más rápidas de la superficie escapan al aire. A 100°C (presión normal), todo el líquido hierve.', icono: '💧→💨', color: '#48A9A6' },
  { nombre: 'Condensación', desde: 'Gas', hasta: 'Líquido', ejemplo: 'Vaho en el espejo del baño', detalle: 'El vapor de agua pierde energía al tocar la superficie fría y se convierte en gotitas líquidas.', icono: '💨→💧', color: '#00897B' },
  { nombre: 'Sublimación', desde: 'Sólido', hasta: 'Gas', ejemplo: 'Hielo seco (CO₂), naftalina', detalle: 'El sólido pasa directamente a gas sin pasar por líquido. Ocurre cuando la presión es muy baja o el sólido es volátil.', icono: '🧊→💨', color: '#FF9800' },
  { nombre: 'Deposición', desde: 'Gas', hasta: 'Sólido', ejemplo: 'Escarcha formándose en la hierba', detalle: 'El vapor de agua se congela directamente sobre superficies frías, formando cristales de hielo sin pasar por líquido.', icono: '💨→🧊', color: '#E65100' },
];

// ─────────────────────────────────────────────
// Curiosidades
// ─────────────────────────────────────────────

interface Curiosidad {
  icono: string;
  titulo: string;
  texto: string;
}

const CURIOSIDADES: Curiosidad[] = [
  { icono: '🌡️', titulo: 'Helio rebelde', texto: 'El helio es el único elemento que no solidifica a presión normal. Necesita al menos 25 atmósferas de presión para convertirse en sólido.' },
  { icono: '☀️', titulo: 'Plasma solar', texto: `En el núcleo del Sol, el plasma alcanza ${formatNumber(15000000, 0)} °C. Las reacciones de fusión nuclear convierten hidrógeno en helio liberando una energía colosal.` },
  { icono: '🧊', titulo: 'Anomalía del agua', texto: 'El hielo flota porque es menos denso que el agua líquida. Esto es una rareza: la mayoría de sólidos son más densos que su forma líquida. Sin esta anomalía, los lagos se congelarían de abajo arriba y la vida acuática desaparecería.' },
  { icono: '⚡', titulo: 'Rayos de plasma', texto: `Los rayos son plasma natural que alcanza unos ${formatNumber(30000, 0)} °C, unas 5 veces la temperatura de la superficie del Sol.` },
  { icono: '🔬', titulo: 'Condensado Bose-Einstein', texto: 'El "5.º estado de la materia" aparece a temperaturas cercanas al cero absoluto (−273,15 °C). Los átomos se comportan como una sola partícula cuántica gigante.' },
  { icono: '💧', titulo: 'Agua en tres estados', texto: 'El agua es la única sustancia común que existe de forma natural en los 3 estados clásicos en la Tierra: hielo, agua líquida y vapor.' },
  { icono: '🌍', titulo: 'Récord de frío', texto: 'La temperatura más baja lograda en laboratorio fue de 38 picokelvin (38 billonésimas de grado por encima del cero absoluto), conseguida por investigadores de la Universidad de Bremen en 2021.' },
  { icono: '🌌', titulo: '99% plasma', texto: 'El 99% de la materia visible del universo está en estado de plasma: estrellas, nebulosas y el medio intergaláctico. El sólido, líquido y gas que conocemos son la excepción cósmica.' },
];

// ─────────────────────────────────────────────
// Escala de temperaturas
// ─────────────────────────────────────────────

interface PuntoEscala {
  temp: string;
  label: string;
  color: string;
}

const ESCALA_TEMPERATURAS: PuntoEscala[] = [
  { temp: '−273,15 °C', label: 'Cero absoluto', color: '#1A237E' },
  { temp: '−196 °C', label: 'Nitrógeno líquido', color: '#1565C0' },
  { temp: '−78 °C', label: 'Hielo seco (CO₂)', color: '#2196F3' },
  { temp: '0 °C', label: 'Agua se congela', color: '#4FC3F7' },
  { temp: '100 °C', label: 'Agua hierve', color: '#FF9800' },
  { temp: '1.538 °C', label: 'Hierro funde', color: '#E65100' },
  { temp: '5.500 °C', label: 'Superficie del Sol', color: '#F44336' },
  { temp: '15.000.000 °C', label: 'Núcleo del Sol', color: '#E91E63' },
];

// ─────────────────────────────────────────────
// Constantes de partículas
// ─────────────────────────────────────────────

const NUM_PARTICULAS = 25;
const TAMANO_PARTICULA = 14;
const CONTENEDOR_SIZE = 300;

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function generarParticulasIniciales(): Particula[] {
  return Array.from({ length: NUM_PARTICULAS }, () => ({
    x: Math.random() * (CONTENEDOR_SIZE - TAMANO_PARTICULA),
    y: Math.random() * (CONTENEDOR_SIZE - TAMANO_PARTICULA),
    vx: 0,
    vy: 0,
  }));
}

function generarPosicionesSolido(): Particula[] {
  const cols = 5;
  const espacio = CONTENEDOR_SIZE / (cols + 1);
  return Array.from({ length: NUM_PARTICULAS }, (_, i) => ({
    x: espacio * ((i % cols) + 1) - TAMANO_PARTICULA / 2,
    y: espacio * (Math.floor(i / cols) + 1) - TAMANO_PARTICULA / 2,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
  }));
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstadosMateria() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('estados');
  const [estadoActivo, setEstadoActivo] = useState<EstadoMateria>('solido');
  const [transicionActiva, setTransicionActiva] = useState<number | null>(null);
  const [temperatura, setTemperatura] = useState(25);
  const [diagramaZona, setDiagramaZona] = useState<string | null>(null);
  const [particulas, setParticulas] = useState<Particula[]>(generarPosicionesSolido);
  const animRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  // Detectar preferencia de movimiento reducido
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Animar partículas según estado
  const animar = useCallback(() => {
    if (prefersReducedMotion.current) return;

    setParticulas(prev => prev.map((p, i) => {
      let { x, y, vx, vy } = p;
      const max = CONTENEDOR_SIZE - TAMANO_PARTICULA;

      switch (estadoActivo) {
        case 'solido': {
          // Vibración en posición fija (grid)
          const cols = 5;
          const espacio = CONTENEDOR_SIZE / (cols + 1);
          const baseX = espacio * ((i % cols) + 1) - TAMANO_PARTICULA / 2;
          const baseY = espacio * (Math.floor(i / cols) + 1) - TAMANO_PARTICULA / 2;
          x = baseX + (Math.random() - 0.5) * 3;
          y = baseY + (Math.random() - 0.5) * 3;
          vx = 0;
          vy = 0;
          break;
        }
        case 'liquido': {
          // Movimiento lento, mantienen volumen (zona inferior)
          vx += (Math.random() - 0.5) * 0.3;
          vy += (Math.random() - 0.5) * 0.3 + 0.05; // ligera gravedad
          vx *= 0.95;
          vy *= 0.95;
          x += vx;
          y += vy;
          if (x < 0) { x = 0; vx = Math.abs(vx) * 0.5; }
          if (x > max) { x = max; vx = -Math.abs(vx) * 0.5; }
          if (y < CONTENEDOR_SIZE * 0.4) { y = CONTENEDOR_SIZE * 0.4; vy = Math.abs(vy) * 0.3; }
          if (y > max) { y = max; vy = -Math.abs(vy) * 0.5; }
          break;
        }
        case 'gas': {
          // Movimiento rápido por todo el contenedor
          vx += (Math.random() - 0.5) * 1.2;
          vy += (Math.random() - 0.5) * 1.2;
          vx *= 0.98;
          vy *= 0.98;
          x += vx;
          y += vy;
          if (x < 0) { x = 0; vx = Math.abs(vx); }
          if (x > max) { x = max; vx = -Math.abs(vx); }
          if (y < 0) { y = 0; vy = Math.abs(vy); }
          if (y > max) { y = max; vy = -Math.abs(vy); }
          break;
        }
        case 'plasma': {
          // Muy rápido + caótico
          vx += (Math.random() - 0.5) * 2.5;
          vy += (Math.random() - 0.5) * 2.5;
          vx *= 0.96;
          vy *= 0.96;
          x += vx;
          y += vy;
          if (x < 0) { x = 0; vx = Math.abs(vx); }
          if (x > max) { x = max; vx = -Math.abs(vx); }
          if (y < 0) { y = 0; vy = Math.abs(vy); }
          if (y > max) { y = max; vy = -Math.abs(vy); }
          break;
        }
      }
      return { x, y, vx, vy };
    }));

    animRef.current = requestAnimationFrame(animar);
  }, [estadoActivo]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(animRef.current);
  }, [animar]);

  // Al cambiar de estado, reiniciar partículas
  useEffect(() => {
    if (estadoActivo === 'solido') {
      setParticulas(generarPosicionesSolido());
    } else {
      setParticulas(generarParticulasIniciales());
    }
  }, [estadoActivo]);

  // Estado del agua según temperatura (slider de transiciones)
  const estadoAgua = temperatura <= 0 ? 'Sólido (hielo)' : temperatura < 100 ? 'Líquido (agua)' : 'Gas (vapor)';
  const estadoAguaColor = temperatura <= 0 ? '#2196F3' : temperatura < 100 ? '#48A9A6' : '#FF9800';

  // ─────────────────────────────────────────────
  // Diagrama de fases: zonas SVG
  // ─────────────────────────────────────────────

  const handleDiagramaClick = (zona: string) => {
    setDiagramaZona(diagramaZona === zona ? null : zona);
  };

  const ZONAS_DIAGRAMA: Record<string, { titulo: string; texto: string }> = {
    solido: {
      titulo: 'Zona sólida',
      texto: 'A baja temperatura y/o alta presión, las moléculas están fijas en una estructura cristalina. El hielo común existe aquí.',
    },
    liquido: {
      titulo: 'Zona líquida',
      texto: 'Temperatura y presión intermedias. Las moléculas fluyen pero mantienen contacto. El agua que bebes está aquí.',
    },
    gas: {
      titulo: 'Zona gaseosa',
      texto: 'Alta temperatura y/o baja presión. Las moléculas se mueven libremente. El vapor de agua y la atmósfera están aquí.',
    },
    triple: {
      titulo: 'Punto triple (0,01 °C, 611 Pa)',
      texto: 'El único punto donde coexisten los tres estados simultáneamente. El agua es sólido, líquido y gas a la vez.',
    },
    critico: {
      titulo: 'Punto crítico (374 °C, 22,1 MPa)',
      texto: 'Por encima de este punto no hay distinción entre líquido y gas: se forma un "fluido supercrítico" con propiedades de ambos.',
    },
  };

  // ─────────────────────────────────────────────
  // Render: Sección 1 - Los 4 Estados
  // ─────────────────────────────────────────────

  const renderEstados = () => {
    const estadoInfo = ESTADOS.find(e => e.id === estadoActivo)!;
    return (
      <div className={styles.seccionContent}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>Los 4 estados de la materia</h2>
          <p className={styles.seccionSubtitulo}>Selecciona un estado y observa cómo se comportan las partículas</p>
        </div>

        {/* Selector de estados */}
        <div className={styles.estadoSelector}>
          {ESTADOS.map(e => (
            <button
              key={e.id}
              className={`${styles.estadoBtn} ${estadoActivo === e.id ? styles.estadoBtnActivo : ''}`}
              onClick={() => setEstadoActivo(e.id)}
              aria-pressed={estadoActivo === e.id}
              style={estadoActivo === e.id ? { borderColor: e.color, background: e.color } : undefined}
            >
              <span aria-hidden="true">{e.icono}</span>
              <span className={styles.estadoBtnNombre}>{e.nombre}</span>
            </button>
          ))}
        </div>

        {/* Contenedor de partículas */}
        <div className={styles.contenedorParticulas} role="img" aria-label={`Simulación de partículas en estado ${estadoInfo.nombre}`}>
          {particulas.map((p, i) => (
            <div
              key={i}
              className={`${styles.particula} ${styles[estadoActivo]}`}
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                backgroundColor: estadoInfo.color,
              }}
            />
          ))}
          <div className={styles.estadoLabel}>
            <span aria-hidden="true">{estadoInfo.icono}</span> {estadoInfo.nombre}
          </div>
        </div>

        <p className={styles.estadoDescripcion}>{estadoInfo.descripcion}</p>

        {/* Tabla comparativa */}
        <h3 className={styles.subtituloSeccion}>Comparación de estados</h3>
        <div className={styles.tablaContainer}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Propiedad</th>
                {ESTADOS.map(e => (
                  <th key={e.id} style={{ color: e.color }}>
                    <span aria-hidden="true">{e.icono}</span> {e.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Forma</td>
                {ESTADOS.map(e => <td key={e.id}>{e.forma}</td>)}
              </tr>
              <tr>
                <td>Volumen</td>
                {ESTADOS.map(e => <td key={e.id}>{e.volumen}</td>)}
              </tr>
              <tr>
                <td>Compresibilidad</td>
                {ESTADOS.map(e => <td key={e.id}>{e.compresibilidad}</td>)}
              </tr>
              <tr>
                <td>Energía cinética</td>
                {ESTADOS.map(e => <td key={e.id}>{e.energiaCinetica}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.insightBox}>
          <span aria-hidden="true">🌌</span>
          <p>El 99% de la materia visible del universo está en estado de plasma: estrellas, nebulosas y el medio intergaláctico. El sólido, líquido y gas que conocemos son la excepción cósmica.</p>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Render: Sección 2 - Transiciones
  // ─────────────────────────────────────────────

  const renderTransiciones = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Las 6 transiciones de estado</h2>
        <p className={styles.seccionSubtitulo}>Cada cambio de estado tiene nombre propio</p>
      </div>

      {/* Diagrama visual de transiciones */}
      <div className={styles.transicionesGrid}>
        {TRANSICIONES.map((t, i) => (
          <button
            key={t.nombre}
            className={`${styles.transicionCard} ${transicionActiva === i ? styles.transicionActiva : ''}`}
            onClick={() => setTransicionActiva(transicionActiva === i ? null : i)}
            aria-expanded={transicionActiva === i}
            style={transicionActiva === i ? { borderColor: t.color } : undefined}
          >
            <span className={styles.transicionIcono} aria-hidden="true">{t.icono}</span>
            <span className={styles.transicionNombre} style={{ color: t.color }}>{t.nombre}</span>
            <span className={styles.transicionDir}>{t.desde} → {t.hasta}</span>
            {transicionActiva === i && (
              <div className={styles.transicionDetalle}>
                <p className={styles.transicionEjemplo}>
                  <strong>Ejemplo:</strong> {t.ejemplo}
                </p>
                <p>{t.detalle}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Slider de temperatura del agua */}
      <h3 className={styles.subtituloSeccion}>Estado del agua según la temperatura</h3>
      <div className={styles.sliderContainer}>
        <label htmlFor="temp-slider" className={styles.sliderLabel}>
          Temperatura: <strong style={{ color: estadoAguaColor }}>{formatNumber(temperatura, 0)} °C</strong>
        </label>
        <input
          id="temp-slider"
          type="range"
          min={-50}
          max={200}
          value={temperatura}
          onChange={e => setTemperatura(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderMarks}>
          <span>−50 °C</span>
          <span>0 °C</span>
          <span>100 °C</span>
          <span>200 °C</span>
        </div>
        <div className={styles.sliderResultado} role="alert" aria-live="polite" style={{ borderLeftColor: estadoAguaColor }}>
          <span className={styles.sliderEstado} style={{ color: estadoAguaColor }}>{estadoAgua}</span>
          <span className={styles.sliderDetalle}>
            {temperatura <= 0 && 'Las moléculas están fijas en una estructura cristalina hexagonal.'}
            {temperatura > 0 && temperatura < 100 && 'Las moléculas fluyen libremente pero mantienen contacto entre sí.'}
            {temperatura >= 100 && 'Las moléculas escapan al aire con alta energía cinética.'}
          </span>
        </div>
      </div>

      <div className={styles.insightBox}>
        <span aria-hidden="true">🧊</span>
        <p>La sublimación es como se seca la ropa tendida en invierno: el hielo en la tela pasa directamente a vapor sin derretirse primero.</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Sección 3 - Diagrama de Fases
  // ─────────────────────────────────────────────

  const renderDiagrama = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Diagrama de fases del agua</h2>
        <p className={styles.seccionSubtitulo}>Presión y temperatura determinan el estado</p>
      </div>

      <div className={styles.diagramaContainer}>
        <svg viewBox="0 0 400 300" className={styles.diagramaSvg} role="img" aria-label="Diagrama de fases del agua: presión (eje Y) vs temperatura (eje X)">
          {/* Ejes */}
          <line x1="50" y1="260" x2="380" y2="260" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="260" x2="50" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <text x="220" y="290" textAnchor="middle" fill="currentColor" fontSize="12">Temperatura →</text>
          <text x="15" y="140" textAnchor="middle" fill="currentColor" fontSize="12" transform="rotate(-90, 15, 140)">Presión →</text>

          {/* Zonas coloreadas (clickables) */}
          {/* Sólido */}
          <path
            d="M50,20 L50,260 L130,260 L130,180 L90,80 L50,20"
            fill="rgba(33,150,243,0.2)" stroke="none"
            className={styles.diagramaZona}
            onClick={() => handleDiagramaClick('solido')}
            role="button"
            tabIndex={0}
            aria-label="Zona sólida"
            onKeyDown={e => e.key === 'Enter' && handleDiagramaClick('solido')}
          />
          <text x="80" y="180" fill="#2196F3" fontSize="13" fontWeight="600" pointerEvents="none">Sólido</text>

          {/* Líquido */}
          <path
            d="M130,180 L130,260 L280,260 L280,50 L90,80 L130,180"
            fill="rgba(72,169,166,0.2)" stroke="none"
            className={styles.diagramaZona}
            onClick={() => handleDiagramaClick('liquido')}
            role="button"
            tabIndex={0}
            aria-label="Zona líquida"
            onKeyDown={e => e.key === 'Enter' && handleDiagramaClick('liquido')}
          />
          <text x="190" y="170" fill="#48A9A6" fontSize="13" fontWeight="600" pointerEvents="none">Líquido</text>

          {/* Gas */}
          <path
            d="M130,180 L130,260 L380,260 L380,200 L280,50 L90,80 L130,180"
            fill="rgba(255,152,0,0.12)" stroke="none"
            className={styles.diagramaZona}
            onClick={() => handleDiagramaClick('gas')}
            role="button"
            tabIndex={0}
            aria-label="Zona gaseosa"
            onKeyDown={e => e.key === 'Enter' && handleDiagramaClick('gas')}
          />
          <text x="300" y="240" fill="#FF9800" fontSize="13" fontWeight="600" pointerEvents="none">Gas</text>

          {/* Líneas de frontera */}
          <line x1="90" y1="80" x2="130" y2="180" stroke="#666" strokeWidth="1.5" strokeDasharray="4,2" />
          <line x1="130" y1="180" x2="380" y2="230" stroke="#666" strokeWidth="1.5" strokeDasharray="4,2" />
          <line x1="90" y1="80" x2="280" y2="50" stroke="#666" strokeWidth="1.5" strokeDasharray="4,2" />

          {/* Punto triple */}
          <circle
            cx="130" cy="180" r="7" fill="#E91E63"
            className={styles.diagramaPunto}
            onClick={() => handleDiagramaClick('triple')}
            role="button"
            tabIndex={0}
            aria-label="Punto triple: 0,01°C, 611 Pa"
            onKeyDown={e => e.key === 'Enter' && handleDiagramaClick('triple')}
          />
          <text x="138" y="195" fill="#E91E63" fontSize="10" fontWeight="600" pointerEvents="none">Punto triple</text>

          {/* Punto crítico */}
          <circle
            cx="280" cy="50" r="7" fill="#9C27B0"
            className={styles.diagramaPunto}
            onClick={() => handleDiagramaClick('critico')}
            role="button"
            tabIndex={0}
            aria-label="Punto crítico: 374°C, 22,1 MPa"
            onKeyDown={e => e.key === 'Enter' && handleDiagramaClick('critico')}
          />
          <text x="288" y="45" fill="#9C27B0" fontSize="10" fontWeight="600" pointerEvents="none">Punto crítico</text>

          {/* Marcas de eje */}
          <text x="130" y="275" textAnchor="middle" fill="currentColor" fontSize="9">0°C</text>
          <text x="280" y="275" textAnchor="middle" fill="currentColor" fontSize="9">374°C</text>
          <text x="46" y="183" textAnchor="end" fill="currentColor" fontSize="9">611 Pa</text>
          <text x="46" y="53" textAnchor="end" fill="currentColor" fontSize="9">22,1 MPa</text>
        </svg>
      </div>

      {/* Explicación de zona seleccionada */}
      {diagramaZona && ZONAS_DIAGRAMA[diagramaZona] && (
        <div className={styles.diagramaExplicacion} role="alert" aria-live="polite">
          <h3>{ZONAS_DIAGRAMA[diagramaZona].titulo}</h3>
          <p>{ZONAS_DIAGRAMA[diagramaZona].texto}</p>
        </div>
      )}

      {!diagramaZona && (
        <p className={styles.diagramaHint}>Haz clic en cualquier zona o punto del diagrama para más información.</p>
      )}

      <div className={styles.insightBox}>
        <span aria-hidden="true">🔬</span>
        <p>En el punto triple, el agua es sólido, líquido y gas al mismo tiempo. Solo ocurre a exactamente 0,01 °C y 611 Pa de presión.</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render: Sección 4 - Datos Curiosos
  // ─────────────────────────────────────────────

  const renderCuriosidades = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Datos curiosos sobre la materia</h2>
        <p className={styles.seccionSubtitulo}>Hechos fascinantes del mundo físico</p>
      </div>

      <div className={styles.curiosidadesGrid}>
        {CURIOSIDADES.map(c => (
          <div key={c.titulo} className={styles.curiosidadCard}>
            <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
            <h3 className={styles.curiosidadTitulo}>{c.titulo}</h3>
            <p className={styles.curiosidadTexto}>{c.texto}</p>
          </div>
        ))}
      </div>

      {/* Escala de temperaturas extremas */}
      <h3 className={styles.subtituloSeccion}>Escala de temperaturas extremas</h3>
      <div className={styles.escalaContainer}>
        {ESCALA_TEMPERATURAS.map(p => (
          <div key={p.label} className={styles.escalaPunto}>
            <span className={styles.escalaTemp} style={{ color: p.color }}>{p.temp}</span>
            <span className={styles.escalaBarra} style={{ backgroundColor: p.color }} aria-hidden="true" />
            <span className={styles.escalaLabel}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render principal
  // ─────────────────────────────────────────────

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'estados': return renderEstados();
      case 'transiciones': return renderTransiciones();
      case 'diagrama': return renderDiagrama();
      case 'curiosidades': return renderCuriosidades();
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🔬 Estados de la Materia</h1>
          <p className={styles.subtitle}>Sólido, líquido, gas y plasma: la materia en movimiento</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido activo */}
        {renderSeccion()}

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 Entendiendo la materia"
          subtitle="Conceptos clave sobre los estados de la materia"
        >
          <section className={styles.guideSection}>
            <h2>La teoría cinético-molecular</h2>
            <p>
              Toda la materia está formada por partículas (átomos o moléculas) en constante movimiento.
              La temperatura es una medida de la energía cinética media de esas partículas: cuanto más
              caliente, más rápido se mueven. Los cambios de estado ocurren cuando la energía cinética
              supera (o cae por debajo de) las fuerzas de atracción entre partículas.
            </p>

            <div className={styles.warningBox}>
              <strong>Concepto clave</strong>: Durante un cambio de estado, la temperatura se mantiene
              constante aunque se siga añadiendo calor. Toda la energía se invierte en romper o formar
              enlaces entre moléculas (calor latente), no en aumentar la temperatura.
            </div>

            <h2>¿Por qué el plasma es diferente?</h2>
            <p>
              A diferencia de los tres estados clásicos, en el plasma la energía es tan alta que los
              electrones se separan de sus átomos. El resultado es una mezcla de iones positivos y
              electrones libres que conduce electricidad y responde a campos magnéticos. Las estrellas,
              los rayos y las pantallas de plasma son ejemplos cotidianos.
            </p>

            <h2>El diagrama de fases</h2>
            <p>
              Un diagrama de fases muestra qué estado adopta una sustancia según la presión y la
              temperatura. El punto triple es la única combinación exacta donde los tres estados
              coexisten. El punto crítico marca el límite a partir del cual líquido y gas son
              indistinguibles (fluido supercrítico). El CO₂ supercrítico se usa para descafeinar café.
            </p>

            <h2>¿Existen más de 4 estados?</h2>
            <p>
              Sí. Además de sólido, líquido, gas y plasma, los físicos han identificado otros estados
              exóticos: el condensado de Bose-Einstein (cerca del cero absoluto), el condensado fermiónico,
              la materia de quarks-gluones y los cristales de tiempo, entre otros. La física de la materia
              sigue siendo un campo de descubrimiento activo.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-estados-materia')} />
        <ShareCard appName="visualizador-estados-materia" />
        <Footer appName="visualizador-estados-materia" />
      </div>
    </>
  );
}
