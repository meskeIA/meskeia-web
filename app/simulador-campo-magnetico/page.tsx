'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorCampoMagnetico.module.css';

// ============================================================
// Constantes físicas
// ============================================================
const MU_0 = 4 * Math.PI * 1e-7; // T·m/A (permeabilidad magnética del vacío)
const CARGA_ELEMENTAL = 1.602176634e-19; // C

interface Particula {
  id: string;
  nombre: string;
  simbolo: string;
  masa: number; // kg
  cargas: number; // múltiplos de la carga elemental (con signo)
}

const PARTICULAS: Particula[] = [
  { id: 'proton', nombre: 'Protón', simbolo: 'p⁺', masa: 1.67262192e-27, cargas: 1 },
  { id: 'electron', nombre: 'Electrón', simbolo: 'e⁻', masa: 9.1093837e-31, cargas: -1 },
  { id: 'alfa', nombre: 'Partícula alfa', simbolo: 'α²⁺', masa: 6.6446573e-27, cargas: 2 },
];

type Pestana = 'lorentz' | 'corrientes' | 'induccion';
type ModoInduccion = 'alternador' | 'barra';

// ============================================================
// Formato de números en notación científica española
// ============================================================
const SUPERINDICES: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

function aSuperindice(exponente: number): string {
  return String(exponente)
    .split('')
    .map((c) => SUPERINDICES[c] ?? c)
    .join('');
}

/** Notación decimal para valores cotidianos y científica para los extremos. */
function formatCientifico(valor: number, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  if (valor === 0) return '0';
  const exponente = Math.floor(Math.log10(Math.abs(valor)));
  if (exponente >= -3 && exponente < 5) return formatNumber(valor, decimales);
  const mantisa = valor / Math.pow(10, exponente);
  return `${formatNumber(mantisa, decimales)} × 10${aSuperindice(exponente)}`;
}

// ============================================================
// Geometría del lienzo
// ============================================================
const SVG_W = 760;
const SVG_H = 420;

export default function SimuladorCampoMagnetico() {
  const [pestana, setPestana] = useState<Pestana>('lorentz');
  const [reproduciendo, setReproduciendo] = useState(true);
  const [tiempo, setTiempo] = useState(0); // segundos de animación (no de física real)
  const rafRef = useRef<number | null>(null);
  const ultimoRef = useRef<number>(0);

  // ---------- Bloque 1: carga en movimiento ----------
  const [particulaId, setParticulaId] = useState('proton');
  const [velocidad, setVelocidad] = useState(5); // ×10⁶ m/s
  const [campo, setCampo] = useState(0.5); // T
  const [anguloVB, setAnguloVB] = useState(90); // grados entre v y B
  const [campoSaliente, setCampoSaliente] = useState(true);

  // ---------- Bloque 2: corrientes ----------
  const [corriente, setCorriente] = useState(10); // A
  const [longitudConductor, setLongitudConductor] = useState(0.5); // m
  const [campoExterno, setCampoExterno] = useState(0.4); // T
  const [anguloIB, setAnguloIB] = useState(90); // grados entre I y B
  const [distancia, setDistancia] = useState(0.05); // m (distancia al hilo / radio de la espira)
  const [vueltas, setVueltas] = useState(500);
  const [longitudSolenoide, setLongitudSolenoide] = useState(0.3); // m
  const [corriente2, setCorriente2] = useState(10); // A (segundo hilo)
  const [separacion, setSeparacion] = useState(0.02); // m entre hilos

  // ---------- Bloque 3: inducción ----------
  const [modoInduccion, setModoInduccion] = useState<ModoInduccion>('alternador');
  const [espiras, setEspiras] = useState(200);
  const [area, setArea] = useState(0.02); // m²
  const [campoInduccion, setCampoInduccion] = useState(0.6); // T
  const [frecuencia, setFrecuencia] = useState(50); // Hz
  const [longitudBarra, setLongitudBarra] = useState(0.4); // m
  const [velocidadBarra, setVelocidadBarra] = useState(3); // m/s
  const [resistencia, setResistencia] = useState(2); // Ω

  // ----------------------------------------------------------
  // Reloj de animación compartido por todas las pestañas
  // ----------------------------------------------------------
  useEffect(() => {
    if (!reproduciendo) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    ultimoRef.current = 0;
    const paso = (ahora: number) => {
      if (ultimoRef.current === 0) ultimoRef.current = ahora;
      const dt = Math.min((ahora - ultimoRef.current) / 1000, 0.05);
      ultimoRef.current = ahora;
      setTiempo((t) => t + dt);
      rafRef.current = requestAnimationFrame(paso);
    };
    rafRef.current = requestAnimationFrame(paso);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [reproduciendo]);

  // ----------------------------------------------------------
  // Física del bloque 1
  // ----------------------------------------------------------
  const particula = PARTICULAS.find((p) => p.id === particulaId) ?? PARTICULAS[0];

  const lorentz = useMemo(() => {
    const q = Math.abs(particula.cargas) * CARGA_ELEMENTAL;
    const v = velocidad * 1e6;
    const rad = (anguloVB * Math.PI) / 180;
    const fuerza = q * v * campo * Math.sin(rad);
    const vPerpendicular = v * Math.sin(rad);
    const vParalela = v * Math.cos(rad);
    const radio = campo > 0 ? (particula.masa * vPerpendicular) / (q * campo) : Infinity;
    const periodo = campo > 0 ? (2 * Math.PI * particula.masa) / (q * campo) : Infinity;
    const frecuenciaCiclotron = periodo > 0 ? 1 / periodo : 0;
    const pasoHelice = Number.isFinite(periodo) ? vParalela * periodo : 0;
    const energia = 0.5 * particula.masa * v * v; // J
    const energiaEv = energia / CARGA_ELEMENTAL; // eV
    // El sentido de giro sale del producto vectorial q·v×B
    const horario = particula.cargas > 0 ? campoSaliente : !campoSaliente;
    return {
      q,
      v,
      fuerza,
      radio,
      periodo,
      frecuenciaCiclotron,
      pasoHelice,
      vPerpendicular,
      vParalela,
      energia,
      energiaEv,
      horario,
    };
  }, [particula, velocidad, campo, anguloVB, campoSaliente]);

  // Radio en píxeles: proporcional al radio real, acotado para que siempre quepa
  const radioDibujo = useMemo(() => {
    if (!Number.isFinite(lorentz.radio) || lorentz.radio <= 0) return 0;
    const referencia = 0.104; // radio de un protón a 5·10⁶ m/s en 0,5 T
    return Math.min(Math.max((lorentz.radio / referencia) * 95, 22), 168);
  }, [lorentz.radio]);

  // Velocidad angular del dibujo (la real sería de millones de vueltas por segundo)
  const faseLorentz = useMemo(() => {
    const referencia = 1.3e-7; // periodo de referencia en segundos
    const factor = Number.isFinite(lorentz.periodo) && lorentz.periodo > 0
      ? Math.min(Math.max(referencia / lorentz.periodo, 0.2), 4)
      : 1;
    const signo = lorentz.horario ? 1 : -1;
    return signo * tiempo * 1.6 * factor;
  }, [tiempo, lorentz.periodo, lorentz.horario]);

  // ----------------------------------------------------------
  // Física del bloque 2
  // ----------------------------------------------------------
  const corrientes = useMemo(() => {
    const rad = (anguloIB * Math.PI) / 180;
    const fuerzaConductor = campoExterno * corriente * longitudConductor * Math.sin(rad);
    const campoHilo = distancia > 0 ? (MU_0 * corriente) / (2 * Math.PI * distancia) : 0;
    const campoEspira = distancia > 0 ? (MU_0 * corriente) / (2 * distancia) : 0;
    const espirasPorMetro = longitudSolenoide > 0 ? vueltas / longitudSolenoide : 0;
    const campoSolenoide = MU_0 * espirasPorMetro * corriente;
    const fuerzaEntreHilos =
      separacion > 0 ? (MU_0 * corriente * Math.abs(corriente2)) / (2 * Math.PI * separacion) : 0;
    const seAtraen = corriente2 >= 0; // mismo sentido de corriente = atracción
    return {
      fuerzaConductor,
      campoHilo,
      campoEspira,
      espirasPorMetro,
      campoSolenoide,
      fuerzaEntreHilos,
      seAtraen,
    };
  }, [
    anguloIB,
    campoExterno,
    corriente,
    longitudConductor,
    distancia,
    vueltas,
    longitudSolenoide,
    corriente2,
    separacion,
  ]);

  // ----------------------------------------------------------
  // Física del bloque 3
  // ----------------------------------------------------------
  const induccion = useMemo(() => {
    const omega = 2 * Math.PI * frecuencia;
    const flujoMaximo = campoInduccion * area; // por espira
    const femMaxima = espiras * flujoMaximo * omega;
    const femEficaz = femMaxima / Math.SQRT2;
    const periodo = frecuencia > 0 ? 1 / frecuencia : Infinity;

    const femBarra = campoInduccion * longitudBarra * velocidadBarra;
    const corrienteBarra = resistencia > 0 ? femBarra / resistencia : 0;
    const fuerzaFrenado = campoInduccion * corrienteBarra * longitudBarra;
    const potenciaBarra = femBarra * corrienteBarra;

    return {
      omega,
      flujoMaximo,
      femMaxima,
      femEficaz,
      periodo,
      femBarra,
      corrienteBarra,
      fuerzaFrenado,
      potenciaBarra,
    };
  }, [
    frecuencia,
    campoInduccion,
    area,
    espiras,
    longitudBarra,
    velocidadBarra,
    resistencia,
  ]);

  // Fase del alternador (ralentizada: 50 Hz reales serían imposibles de seguir)
  const faseAlternador = tiempo * 1.5;

  // Curvas de flujo y fem para la gráfica (dos periodos completos)
  const curvas = useMemo(() => {
    const puntos = 160;
    const x0 = 60;
    const x1 = SVG_W - 40;
    const yCentro = 190;
    const amplitud = 110;
    const flujo: string[] = [];
    const fem: string[] = [];
    for (let i = 0; i <= puntos; i++) {
      const frac = i / puntos;
      const angulo = frac * 4 * Math.PI; // dos vueltas completas
      const x = x0 + (x1 - x0) * frac;
      flujo.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(yCentro - amplitud * Math.cos(angulo)).toFixed(1)}`);
      fem.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(yCentro - amplitud * Math.sin(angulo)).toFixed(1)}`);
    }
    // Marcador del instante actual dentro de los dos periodos dibujados
    const fraccionActual = ((faseAlternador % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI) / (4 * Math.PI);
    const xActual = x0 + (x1 - x0) * fraccionActual;
    return {
      flujo: flujo.join(' '),
      fem: fem.join(' '),
      x0,
      x1,
      yCentro,
      amplitud,
      xActual,
    };
  }, [faseAlternador]);

  const valorInstantaneo = useMemo(() => {
    const anguloActual = faseAlternador;
    return {
      flujo: induccion.flujoMaximo * espiras * Math.cos(anguloActual),
      fem: induccion.femMaxima * Math.sin(anguloActual),
      angulo: ((anguloActual % (2 * Math.PI)) * 180) / Math.PI,
    };
  }, [faseAlternador, induccion.flujoMaximo, induccion.femMaxima, espiras]);

  // Posición de la barra deslizante en el dibujo
  const posicionBarra = useMemo(() => {
    const recorrido = 340;
    const ciclo = (tiempo * velocidadBarra * 40) % recorrido;
    return 190 + ciclo;
  }, [tiempo, velocidadBarra]);

  // ----------------------------------------------------------
  // Símbolos del campo (⊗ entrante, ⊙ saliente) en rejilla
  // ----------------------------------------------------------
  const rejillaCampo = useMemo(() => {
    const puntos: { x: number; y: number }[] = [];
    for (let x = 60; x <= SVG_W - 40; x += 70) {
      for (let y = 50; y <= SVG_H - 40; y += 70) {
        puntos.push({ x, y });
      }
    }
    return puntos;
  }, []);

  const centroLienzo = { x: SVG_W / 2, y: SVG_H / 2 };
  const posParticula = {
    x: centroLienzo.x + radioDibujo * Math.cos(faseLorentz),
    y: centroLienzo.y + radioDibujo * Math.sin(faseLorentz),
  };
  // Tangente (velocidad) y radio hacia dentro (fuerza centrípeta)
  const signoGiro = lorentz.horario ? 1 : -1;
  const dirVelocidad = {
    x: -Math.sin(faseLorentz) * signoGiro,
    y: Math.cos(faseLorentz) * signoGiro,
  };
  const dirFuerza = { x: -Math.cos(faseLorentz), y: -Math.sin(faseLorentz) };

  const flechaVector = (
    desdeX: number,
    desdeY: number,
    dirX: number,
    dirY: number,
    largo: number
  ) => {
    const finX = desdeX + dirX * largo;
    const finY = desdeY + dirY * largo;
    const ang = Math.atan2(dirY, dirX);
    const punta = 8;
    const p1x = finX - punta * Math.cos(ang - Math.PI / 7);
    const p1y = finY - punta * Math.sin(ang - Math.PI / 7);
    const p2x = finX - punta * Math.cos(ang + Math.PI / 7);
    const p2y = finY - punta * Math.sin(ang + Math.PI / 7);
    return { finX, finY, puntos: `${finX},${finY} ${p1x},${p1y} ${p2x},${p2y}` };
  };

  const vectorV = flechaVector(posParticula.x, posParticula.y, dirVelocidad.x, dirVelocidad.y, 62);
  const vectorF = flechaVector(posParticula.x, posParticula.y, dirFuerza.x, dirFuerza.y, 48);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Campo Magnético</h1>
        <p>Fuerza de Lorentz, campo de las corrientes e inducción de Faraday-Lenz</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Pestañas */}
        <nav className={styles.tabs} aria-label="Bloques del simulador">
          <button
            type="button"
            className={`${styles.tab} ${pestana === 'lorentz' ? styles.tabActiva : ''}`}
            aria-pressed={pestana === 'lorentz'}
            onClick={() => setPestana('lorentz')}
          >
            <span aria-hidden="true">🌀</span> Carga en movimiento
          </button>
          <button
            type="button"
            className={`${styles.tab} ${pestana === 'corrientes' ? styles.tabActiva : ''}`}
            aria-pressed={pestana === 'corrientes'}
            onClick={() => setPestana('corrientes')}
          >
            <span aria-hidden="true">🔌</span> Corrientes y conductores
          </button>
          <button
            type="button"
            className={`${styles.tab} ${pestana === 'induccion' ? styles.tabActiva : ''}`}
            aria-pressed={pestana === 'induccion'}
            onClick={() => setPestana('induccion')}
          >
            <span aria-hidden="true">⚡</span> Inducción
          </button>
        </nav>

        {/* ============ BLOQUE 1: FUERZA DE LORENTZ ============ */}
        {pestana === 'lorentz' && (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Partícula y campo</h2>

              <div className={styles.chipRow} role="group" aria-label="Partícula">
                {PARTICULAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.chip} ${particulaId === p.id ? styles.chipActivo : ''}`}
                    aria-pressed={particulaId === p.id}
                    onClick={() => setParticulaId(p.id)}
                  >
                    {p.nombre} <span className={styles.chipSimbolo}>{p.simbolo}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.chip} ${campoSaliente ? styles.chipActivo : ''}`}
                  aria-pressed={campoSaliente}
                  onClick={() => setCampoSaliente((valor) => !valor)}
                >
                  {campoSaliente ? 'B sale de la pantalla ⊙' : 'B entra en la pantalla ⊗'}
                </button>
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="velocidad">
                    Velocidad de la partícula
                    <span className={styles.valueBadge}>
                      {formatNumber(velocidad, 1)} × 10⁶ m/s
                    </span>
                  </label>
                  <input
                    id="velocidad"
                    type="range"
                    min="0.1"
                    max="20"
                    step="0.1"
                    value={velocidad}
                    onChange={(e) => setVelocidad(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="campo">
                    Campo magnético B
                    <span className={styles.valueBadge}>{formatNumber(campo, 2)} T</span>
                  </label>
                  <input
                    id="campo"
                    type="range"
                    min="0.01"
                    max="3"
                    step="0.01"
                    value={campo}
                    onChange={(e) => setCampo(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="anguloVB">
                    Ángulo entre v y B
                    <span className={styles.valueBadge}>{formatNumber(anguloVB, 0)}°</span>
                  </label>
                  <input
                    id="anguloVB"
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={anguloVB}
                    onChange={(e) => setAnguloVB(parseFloat(e.target.value))}
                  />
                  <span className={styles.inputHint}>
                    Con 90° la trayectoria es circular; por debajo se convierte en una hélice.
                  </span>
                </div>
                <div className={styles.inputGroup}>
                  <label>Animación</label>
                  <button
                    type="button"
                    className={styles.calcBtnGhost}
                    aria-pressed={reproduciendo}
                    onClick={() => setReproduciendo((valor) => !valor)}
                  >
                    <span aria-hidden="true">{reproduciendo ? '⏸' : '▶'}</span>{' '}
                    {reproduciendo ? 'Pausar' : 'Reanudar'}
                  </button>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Trayectoria de la partícula</h2>
              <div className={styles.canvasContainer}>
                <div>
                  <svg
                    className={styles.canvasSvg}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    aria-label={`Trayectoria circular de ${particula.nombre} en un campo de ${formatNumber(campo, 2)} teslas`}
                  >
                    {/* Símbolos del campo uniforme */}
                    <g className={styles.simboloCampo}>
                      {rejillaCampo.map((punto, i) => (
                        <g key={`b${i}`}>
                          <circle cx={punto.x} cy={punto.y} r={7} />
                          {campoSaliente ? (
                            <circle cx={punto.x} cy={punto.y} r={2} className={styles.puntoCampo} />
                          ) : (
                            <>
                              <line
                                x1={punto.x - 5}
                                y1={punto.y - 5}
                                x2={punto.x + 5}
                                y2={punto.y + 5}
                              />
                              <line
                                x1={punto.x + 5}
                                y1={punto.y - 5}
                                x2={punto.x - 5}
                                y2={punto.y + 5}
                              />
                            </>
                          )}
                        </g>
                      ))}
                    </g>

                    {/* Circunferencia descrita */}
                    {radioDibujo > 0 && (
                      <circle
                        cx={centroLienzo.x}
                        cy={centroLienzo.y}
                        r={radioDibujo}
                        className={styles.trayectoria}
                      />
                    )}

                    {/* Vector velocidad */}
                    <g className={styles.vVelocidad}>
                      <line
                        x1={posParticula.x}
                        y1={posParticula.y}
                        x2={vectorV.finX}
                        y2={vectorV.finY}
                        className={styles.vectorLinea}
                      />
                      <polygon points={vectorV.puntos} className={styles.vectorPunta} />
                      <text
                        x={vectorV.finX + dirVelocidad.x * 14}
                        y={vectorV.finY + dirVelocidad.y * 14}
                        className={styles.vectorTexto}
                      >
                        v
                      </text>
                    </g>

                    {/* Vector fuerza (centrípeta) */}
                    <g className={styles.vFuerza}>
                      <line
                        x1={posParticula.x}
                        y1={posParticula.y}
                        x2={vectorF.finX}
                        y2={vectorF.finY}
                        className={styles.vectorLinea}
                      />
                      <polygon points={vectorF.puntos} className={styles.vectorPunta} />
                      <text
                        x={vectorF.finX + dirFuerza.x * 14}
                        y={vectorF.finY + dirFuerza.y * 14}
                        className={styles.vectorTexto}
                      >
                        F
                      </text>
                    </g>

                    {/* Partícula */}
                    <circle
                      cx={posParticula.x}
                      cy={posParticula.y}
                      r={13}
                      className={particula.cargas > 0 ? styles.particulaPos : styles.particulaNeg}
                    />
                    <text x={posParticula.x} y={posParticula.y} className={styles.textoParticula}>
                      {particula.cargas > 0 ? '+' : '−'}
                    </text>
                  </svg>
                  <p className={styles.canvasHint}>
                    Giro {lorentz.horario ? 'horario' : 'antihorario'} · el tamaño del círculo sigue
                    al radio real, pero la animación va muy ralentizada: el periodo real es de
                    {' '}
                    {formatCientifico(lorentz.periodo, 2)} s.
                  </p>
                </div>

                <div className={styles.resultBlock}>
                  <h3 className={styles.resultTitle}>Resultados</h3>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Fuerza F = q·v·B·sen θ</span>
                    <span className={styles.resultValueAccent}>
                      {formatCientifico(lorentz.fuerza, 2)} N
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Radio r = m·v⊥/(q·B)</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.radio, 3)} m
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Periodo T = 2πm/(q·B)</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.periodo, 2)} s
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Frecuencia de ciclotrón</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.frecuenciaCiclotron, 2)} Hz
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Componente v perpendicular</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.vPerpendicular, 2)} m/s
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Paso de la hélice</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.pasoHelice, 3)} m
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Energía cinética</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(lorentz.energiaEv / 1000, 2)} keV
                    </span>
                  </div>
                  <p className={styles.resultNota}>
                    La fuerza magnética no realiza trabajo: es siempre perpendicular a la velocidad,
                    así que la energía cinética permanece constante.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ============ BLOQUE 2: CORRIENTES ============ */}
        {pestana === 'corrientes' && (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Corriente, conductor y campo</h2>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="corriente">
                    Intensidad I
                    <span className={styles.valueBadge}>{formatNumber(corriente, 1)} A</span>
                  </label>
                  <input
                    id="corriente"
                    type="range"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={corriente}
                    onChange={(e) => setCorriente(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="longitudConductor">
                    Longitud del conductor L
                    <span className={styles.valueBadge}>
                      {formatNumber(longitudConductor, 2)} m
                    </span>
                  </label>
                  <input
                    id="longitudConductor"
                    type="range"
                    min="0.05"
                    max="2"
                    step="0.05"
                    value={longitudConductor}
                    onChange={(e) => setLongitudConductor(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="campoExterno">
                    Campo externo B
                    <span className={styles.valueBadge}>{formatNumber(campoExterno, 2)} T</span>
                  </label>
                  <input
                    id="campoExterno"
                    type="range"
                    min="0.01"
                    max="2"
                    step="0.01"
                    value={campoExterno}
                    onChange={(e) => setCampoExterno(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="anguloIB">
                    Ángulo entre el conductor y B
                    <span className={styles.valueBadge}>{formatNumber(anguloIB, 0)}°</span>
                  </label>
                  <input
                    id="anguloIB"
                    type="range"
                    min="0"
                    max="90"
                    step="1"
                    value={anguloIB}
                    onChange={(e) => setAnguloIB(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="distancia">
                    Distancia al hilo / radio de la espira
                    <span className={styles.valueBadge}>
                      {formatNumber(distancia * 100, 1)} cm
                    </span>
                  </label>
                  <input
                    id="distancia"
                    type="range"
                    min="0.005"
                    max="0.5"
                    step="0.005"
                    value={distancia}
                    onChange={(e) => setDistancia(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="vueltas">
                    Vueltas del solenoide N
                    <span className={styles.valueBadge}>{formatNumber(vueltas, 0)}</span>
                  </label>
                  <input
                    id="vueltas"
                    type="range"
                    min="10"
                    max="3000"
                    step="10"
                    value={vueltas}
                    onChange={(e) => setVueltas(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="longitudSolenoide">
                    Longitud del solenoide
                    <span className={styles.valueBadge}>
                      {formatNumber(longitudSolenoide, 2)} m
                    </span>
                  </label>
                  <input
                    id="longitudSolenoide"
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.01"
                    value={longitudSolenoide}
                    onChange={(e) => setLongitudSolenoide(parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="corriente2">
                    Corriente del segundo hilo I₂
                    <span className={styles.valueBadge}>{formatNumber(corriente2, 1)} A</span>
                  </label>
                  <input
                    id="corriente2"
                    type="range"
                    min="-100"
                    max="100"
                    step="0.5"
                    value={corriente2}
                    onChange={(e) => setCorriente2(parseFloat(e.target.value))}
                  />
                  <span className={styles.inputHint}>
                    Signo negativo = corriente en sentido contrario a la primera.
                  </span>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="separacion">
                    Separación entre los hilos
                    <span className={styles.valueBadge}>
                      {formatNumber(separacion * 100, 1)} cm
                    </span>
                  </label>
                  <input
                    id="separacion"
                    type="range"
                    min="0.002"
                    max="0.3"
                    step="0.002"
                    value={separacion}
                    onChange={(e) => setSeparacion(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Campo creado por la corriente</h2>
              <div className={styles.canvasContainer}>
                <div>
                  <svg
                    className={styles.canvasSvg}
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    aria-label="Hilo conductor rectilíneo con sus líneas circulares de campo magnético"
                  >
                    {/* Hilo vertical con la corriente */}
                    <line
                      x1={SVG_W / 2}
                      y1={30}
                      x2={SVG_W / 2}
                      y2={SVG_H - 30}
                      className={styles.hilo}
                    />
                    <polygon
                      points={`${SVG_W / 2},${24} ${SVG_W / 2 - 7},${42} ${SVG_W / 2 + 7},${42}`}
                      className={styles.hiloPunta}
                    />
                    <text x={SVG_W / 2 + 16} y={40} className={styles.etiquetaCampo}>
                      I = {formatNumber(corriente, 1)} A
                    </text>

                    {/* Líneas de campo circulares vistas de canto */}
                    {[60, 110, 165, 225].map((rx, i) => (
                      <ellipse
                        key={`e${i}`}
                        cx={SVG_W / 2}
                        cy={SVG_H / 2}
                        rx={rx}
                        ry={rx * 0.32}
                        className={styles.lineaCampo}
                      />
                    ))}

                    {/* Punto de medida a la distancia elegida */}
                    <circle cx={SVG_W / 2 + 110} cy={SVG_H / 2} r={6} className={styles.puntoMedida} />
                    <text x={SVG_W / 2 + 122} y={SVG_H / 2 - 14} className={styles.etiquetaCampo}>
                      B = {formatCientifico(corrientes.campoHilo, 2)} T
                    </text>
                    <text x={SVG_W / 2 + 122} y={SVG_H / 2 + 4} className={styles.etiquetaSecundaria}>
                      a {formatNumber(distancia * 100, 1)} cm del hilo
                    </text>

                    {/* Recordatorio de la regla de la mano derecha */}
                    <text x={30} y={SVG_H - 22} className={styles.etiquetaSecundaria}>
                      Regla de la mano derecha: pulgar en el sentido de I, los dedos rodean el hilo
                      indicando B
                    </text>
                  </svg>
                </div>

                <div className={styles.resultBlock}>
                  <h3 className={styles.resultTitle}>Campos y fuerzas</h3>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Fuerza sobre el conductor B·I·L·sen θ</span>
                    <span className={styles.resultValueAccent}>
                      {formatCientifico(corrientes.fuerzaConductor, 3)} N
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Campo de un hilo recto μ₀I/(2πr)</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(corrientes.campoHilo, 3)} T
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Campo en el centro de una espira</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(corrientes.campoEspira, 3)} T
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Espiras por metro n</span>
                    <span className={styles.resultValue}>
                      {formatNumber(corrientes.espirasPorMetro, 0)} /m
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Campo del solenoide μ₀·n·I</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(corrientes.campoSolenoide, 3)} T
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Fuerza entre hilos por metro</span>
                    <span className={styles.resultValue}>
                      {formatCientifico(corrientes.fuerzaEntreHilos, 3)} N/m
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Los hilos</span>
                    <span className={styles.resultValue}>
                      {corrientes.seAtraen ? 'se atraen' : 'se repelen'}
                    </span>
                  </div>
                  <p className={styles.resultNota}>
                    Corrientes paralelas del mismo sentido se atraen; en sentidos opuestos se
                    repelen. Esta fuerza fue durante décadas la definición del amperio.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ============ BLOQUE 3: INDUCCIÓN ============ */}
        {pestana === 'induccion' && (
          <>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Cómo se genera la fem</h2>

              <div className={styles.chipRow} role="group" aria-label="Mecanismo de inducción">
                <button
                  type="button"
                  className={`${styles.chip} ${modoInduccion === 'alternador' ? styles.chipActivo : ''}`}
                  aria-pressed={modoInduccion === 'alternador'}
                  onClick={() => setModoInduccion('alternador')}
                >
                  Espira giratoria (alternador)
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${modoInduccion === 'barra' ? styles.chipActivo : ''}`}
                  aria-pressed={modoInduccion === 'barra'}
                  onClick={() => setModoInduccion('barra')}
                >
                  Barra sobre raíles
                </button>
                <button
                  type="button"
                  className={styles.chip}
                  aria-pressed={reproduciendo}
                  onClick={() => setReproduciendo((valor) => !valor)}
                >
                  <span aria-hidden="true">{reproduciendo ? '⏸' : '▶'}</span>{' '}
                    {reproduciendo ? 'Pausar' : 'Reanudar'}
                </button>
              </div>

              {modoInduccion === 'alternador' ? (
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="espiras">
                      Número de espiras N
                      <span className={styles.valueBadge}>{formatNumber(espiras, 0)}</span>
                    </label>
                    <input
                      id="espiras"
                      type="range"
                      min="1"
                      max="2000"
                      step="1"
                      value={espiras}
                      onChange={(e) => setEspiras(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="area">
                      Área de cada espira
                      <span className={styles.valueBadge}>{formatNumber(area, 3)} m²</span>
                    </label>
                    <input
                      id="area"
                      type="range"
                      min="0.001"
                      max="0.5"
                      step="0.001"
                      value={area}
                      onChange={(e) => setArea(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="campoInduccion">
                      Campo magnético B
                      <span className={styles.valueBadge}>
                        {formatNumber(campoInduccion, 2)} T
                      </span>
                    </label>
                    <input
                      id="campoInduccion"
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={campoInduccion}
                      onChange={(e) => setCampoInduccion(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="frecuencia">
                      Frecuencia de giro
                      <span className={styles.valueBadge}>{formatNumber(frecuencia, 0)} Hz</span>
                    </label>
                    <input
                      id="frecuencia"
                      type="range"
                      min="1"
                      max="120"
                      step="1"
                      value={frecuencia}
                      onChange={(e) => setFrecuencia(parseFloat(e.target.value))}
                    />
                    <span className={styles.inputHint}>
                      La red eléctrica europea funciona a 50 Hz; la americana, a 60 Hz.
                    </span>
                  </div>
                </div>
              ) : (
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="campoBarra">
                      Campo magnético B
                      <span className={styles.valueBadge}>
                        {formatNumber(campoInduccion, 2)} T
                      </span>
                    </label>
                    <input
                      id="campoBarra"
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={campoInduccion}
                      onChange={(e) => setCampoInduccion(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="longitudBarra">
                      Longitud de la barra
                      <span className={styles.valueBadge}>
                        {formatNumber(longitudBarra, 2)} m
                      </span>
                    </label>
                    <input
                      id="longitudBarra"
                      type="range"
                      min="0.05"
                      max="1.5"
                      step="0.05"
                      value={longitudBarra}
                      onChange={(e) => setLongitudBarra(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="velocidadBarra">
                      Velocidad de la barra
                      <span className={styles.valueBadge}>
                        {formatNumber(velocidadBarra, 1)} m/s
                      </span>
                    </label>
                    <input
                      id="velocidadBarra"
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={velocidadBarra}
                      onChange={(e) => setVelocidadBarra(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="resistencia">
                      Resistencia del circuito
                      <span className={styles.valueBadge}>
                        {formatNumber(resistencia, 1)} Ω
                      </span>
                    </label>
                    <input
                      id="resistencia"
                      type="range"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={resistencia}
                      onChange={(e) => setResistencia(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>
                {modoInduccion === 'alternador'
                  ? 'Flujo y fuerza electromotriz'
                  : 'Barra deslizante sobre raíles'}
              </h2>

              <div className={styles.canvasContainer}>
                <div>
                  {modoInduccion === 'alternador' ? (
                    <svg
                      className={styles.canvasSvg}
                      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                      aria-label="Gráfica del flujo magnético y de la fuerza electromotriz inducida frente al tiempo"
                    >
                      {/* Ejes */}
                      <line
                        x1={curvas.x0}
                        y1={curvas.yCentro}
                        x2={curvas.x1}
                        y2={curvas.yCentro}
                        className={styles.eje}
                      />
                      <line
                        x1={curvas.x0}
                        y1={curvas.yCentro - curvas.amplitud - 20}
                        x2={curvas.x0}
                        y2={curvas.yCentro + curvas.amplitud + 20}
                        className={styles.eje}
                      />
                      <text x={curvas.x1 - 26} y={curvas.yCentro + 22} className={styles.etiquetaEje}>
                        tiempo
                      </text>

                      {/* Curvas */}
                      <path d={curvas.flujo} className={styles.curvaFlujo} />
                      <path d={curvas.fem} className={styles.curvaFem} />

                      {/* Instante actual */}
                      <line
                        x1={curvas.xActual}
                        y1={curvas.yCentro - curvas.amplitud - 12}
                        x2={curvas.xActual}
                        y2={curvas.yCentro + curvas.amplitud + 12}
                        className={styles.marcador}
                      />

                      {/* Espira girando (vista de canto) */}
                      <g transform={`translate(${curvas.x0 + 40} ${SVG_H - 55})`}>
                        <ellipse
                          rx={34}
                          ry={Math.max(Math.abs(34 * Math.cos(faseAlternador)), 2)}
                          className={styles.espira}
                          transform="rotate(90)"
                        />
                        <text x={0} y={44} className={styles.etiquetaSecundaria}>
                          espira
                        </text>
                      </g>

                      {/* Leyenda */}
                      <g transform={`translate(${curvas.x0 + 130} ${SVG_H - 62})`}>
                        <line x1={0} y1={0} x2={26} y2={0} className={styles.curvaFlujo} />
                        <text x={34} y={4} className={styles.etiquetaSecundaria}>
                          Flujo Φ = N·B·A·cos(ωt)
                        </text>
                        <line x1={0} y1={22} x2={26} y2={22} className={styles.curvaFem} />
                        <text x={34} y={26} className={styles.etiquetaSecundaria}>
                          fem ε = N·B·A·ω·sen(ωt)
                        </text>
                      </g>
                    </svg>
                  ) : (
                    <svg
                      className={styles.canvasSvg}
                      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                      aria-label="Barra conductora deslizando sobre dos raíles dentro de un campo magnético"
                    >
                      {/* Campo entrante */}
                      <g className={styles.simboloCampo}>
                        {rejillaCampo.map((punto, i) => (
                          <g key={`bb${i}`}>
                            <circle cx={punto.x} cy={punto.y} r={7} />
                            <line
                              x1={punto.x - 5}
                              y1={punto.y - 5}
                              x2={punto.x + 5}
                              y2={punto.y + 5}
                            />
                            <line
                              x1={punto.x + 5}
                              y1={punto.y - 5}
                              x2={punto.x - 5}
                              y2={punto.y + 5}
                            />
                          </g>
                        ))}
                      </g>

                      {/* Raíles y resistencia */}
                      <line x1={90} y1={120} x2={SVG_W - 50} y2={120} className={styles.rail} />
                      <line x1={90} y1={300} x2={SVG_W - 50} y2={300} className={styles.rail} />
                      <rect x={72} y={185} width={36} height={50} rx={4} className={styles.resistor} />
                      <text x={90} y={168} className={styles.etiquetaSecundaria}>
                        R = {formatNumber(resistencia, 1)} Ω
                      </text>

                      {/* Barra móvil */}
                      <line
                        x1={posicionBarra}
                        y1={112}
                        x2={posicionBarra}
                        y2={308}
                        className={styles.barra}
                      />
                      <line
                        x1={posicionBarra}
                        y1={90}
                        x2={posicionBarra + 62}
                        y2={90}
                        className={styles.flechaVelocidad}
                      />
                      <polygon
                        points={`${posicionBarra + 68},90 ${posicionBarra + 54},85 ${posicionBarra + 54},95`}
                        className={styles.flechaVelocidadPunta}
                      />
                      <text x={posicionBarra + 18} y={80} className={styles.etiquetaCampo}>
                        v = {formatNumber(velocidadBarra, 1)} m/s
                      </text>
                      <text x={posicionBarra + 10} y={330} className={styles.etiquetaSecundaria}>
                        L = {formatNumber(longitudBarra, 2)} m
                      </text>
                      <text x={30} y={SVG_H - 18} className={styles.etiquetaSecundaria}>
                        El campo entra en la pantalla (⊗). La corriente inducida se opone al
                        movimiento de la barra.
                      </text>
                    </svg>
                  )}
                </div>

                <div className={styles.resultBlock}>
                  <h3 className={styles.resultTitle}>Resultados</h3>
                  {modoInduccion === 'alternador' ? (
                    <>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Flujo máximo N·B·A</span>
                        <span className={styles.resultValue}>
                          {formatCientifico(induccion.flujoMaximo * espiras, 3)} Wb
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Velocidad angular ω = 2πf</span>
                        <span className={styles.resultValue}>
                          {formatNumber(induccion.omega, 1)} rad/s
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>fem máxima N·B·A·ω</span>
                        <span className={styles.resultValueAccent}>
                          {formatNumber(induccion.femMaxima, 1)} V
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>fem eficaz (rms)</span>
                        <span className={styles.resultValue}>
                          {formatNumber(induccion.femEficaz, 1)} V
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Periodo</span>
                        <span className={styles.resultValue}>
                          {formatCientifico(induccion.periodo, 4)} s
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Flujo en este instante</span>
                        <span className={styles.resultValue}>
                          {formatCientifico(valorInstantaneo.flujo, 3)} Wb
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>fem en este instante</span>
                        <span className={styles.resultValue}>
                          {formatNumber(valorInstantaneo.fem, 1)} V
                        </span>
                      </div>
                      <p className={styles.resultNota}>
                        Fíjate en el desfase: la fem es máxima justo cuando el flujo pasa por cero,
                        porque lo que importa no es el flujo sino su ritmo de cambio.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>fem inducida ε = B·L·v</span>
                        <span className={styles.resultValueAccent}>
                          {formatNumber(induccion.femBarra, 3)} V
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Corriente inducida I = ε/R</span>
                        <span className={styles.resultValue}>
                          {formatNumber(induccion.corrienteBarra, 3)} A
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Fuerza de frenado B·I·L</span>
                        <span className={styles.resultValue}>
                          {formatNumber(induccion.fuerzaFrenado, 4)} N
                        </span>
                      </div>
                      <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Potencia disipada</span>
                        <span className={styles.resultValue}>
                          {formatNumber(induccion.potenciaBarra, 3)} W
                        </span>
                      </div>
                      <p className={styles.resultNota}>
                        La fuerza de frenado es la ley de Lenz en acción: para mantener la barra a
                        velocidad constante hay que aplicar esa misma fuerza, y el trabajo que
                        cuesta es exactamente la potencia disipada en la resistencia.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía del campo magnético"
          subtitle="Lorentz, Ampère, Faraday y Lenz en una sola página"
        >
          <h3 className={styles.eduSubtitle}>Fórmulas clave</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Fórmula</th>
                  <th>Unidad SI</th>
                  <th>Cuándo se usa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fuerza sobre una carga</td>
                  <td>F = q·v·B·sen θ</td>
                  <td>N</td>
                  <td>Partícula cargada moviéndose dentro de un campo</td>
                </tr>
                <tr>
                  <td>Radio de giro</td>
                  <td>r = m·v/(q·B)</td>
                  <td>m</td>
                  <td>Cuando la velocidad es perpendicular al campo</td>
                </tr>
                <tr>
                  <td>Periodo de ciclotrón</td>
                  <td>T = 2π·m/(q·B)</td>
                  <td>s</td>
                  <td>No depende de la velocidad: base del ciclotrón</td>
                </tr>
                <tr>
                  <td>Fuerza sobre un conductor</td>
                  <td>F = B·I·L·sen θ</td>
                  <td>N</td>
                  <td>Motores eléctricos y balanzas de corriente</td>
                </tr>
                <tr>
                  <td>Campo de un hilo recto</td>
                  <td>B = μ₀·I/(2π·r)</td>
                  <td>T</td>
                  <td>Conductor largo y rectilíneo</td>
                </tr>
                <tr>
                  <td>Campo de un solenoide</td>
                  <td>B = μ₀·n·I</td>
                  <td>T</td>
                  <td>Interior de una bobina larga; n = vueltas por metro</td>
                </tr>
                <tr>
                  <td>Ley de Faraday-Lenz</td>
                  <td>ε = −N·ΔΦ/Δt</td>
                  <td>V</td>
                  <td>Siempre que varíe el flujo que atraviesa un circuito</td>
                </tr>
                <tr>
                  <td>fem de una barra</td>
                  <td>ε = B·L·v</td>
                  <td>V</td>
                  <td>Conductor que se desplaza cortando líneas de campo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de física</h4>
              <p>
                Comprueba de un vistazo por qué el periodo de giro no cambia al variar la velocidad,
                pero el radio sí. Es el resultado más contraintuitivo del tema.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Preparación de examen de acceso</h4>
              <p>
                Resuelve el ejercicio en papel y contrasta aquí la fuerza, el radio y la fem
                inducida. Los problemas de inducción suelen fallar en el desfase entre Φ y ε.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesorado</h4>
              <p>
                Muestra en clase el alternador: la misma espira girando genera la corriente alterna
                que llega al enchufe, y la gráfica lo hace evidente.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Formación técnica</h4>
              <p>
                Estima el campo dentro de un electroimán a partir de las vueltas y la corriente, o
                la fuerza entre dos conductores próximos en una instalación.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué la fuerza magnética no realiza trabajo?</strong>
              <p>
                Porque es perpendicular a la velocidad en todo momento, y el trabajo depende de la
                componente de la fuerza en la dirección del movimiento, que aquí es siempre cero. La
                partícula cambia de dirección pero no gana ni pierde energía cinética.
              </p>
              <p className={styles.faqTip}>
                Corolario práctico: un campo magnético puede desviar partículas, pero para
                acelerarlas hace falta un campo eléctrico.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo se aplica la regla de la mano derecha?</strong>
              <p>
                Para el producto v×B: dedos extendidos en el sentido de v, se giran hacia B y el
                pulgar marca el sentido del producto. Si la carga es positiva, esa es la dirección de
                la fuerza; si es negativa, la contraria. Para el campo creado por un hilo, el pulgar
                señala la corriente y los dedos rodean el conductor.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre tesla y gauss?</strong>
              <p>
                Son unidades de la misma magnitud: 1 T = 10.000 G. El tesla pertenece al Sistema
                Internacional y el gauss al sistema cegesimal. Como referencia, el campo terrestre
                ronda los 50 microteslas y un imán de nevera, unas décimas de tesla.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la fem es máxima cuando el flujo es cero?</strong>
              <p>
                Porque la ley de Faraday depende de la derivada del flujo, no de su valor. Cuando la
                espira está en el plano del campo el flujo vale cero, pero es justo el instante en
                que más deprisa cambia, y ahí la fem alcanza su máximo. Están desfasadas 90°.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Un imán quieto junto a una bobina genera corriente?</strong>
              <p>
                No. Hace falta que el flujo varíe: acercar o alejar el imán, girar la bobina o
                cambiar la corriente que crea el campo. Un campo constante que atraviesa un circuito
                inmóvil no induce nada, por intenso que sea.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué dos hilos con corriente paralela se atraen?</strong>
              <p>
                Cada hilo crea un campo que envuelve al otro, y sobre ese otro actúa la fuerza
                B·I·L. Al hacer el producto vectorial, con corrientes del mismo sentido la fuerza
                apunta hacia el hilo vecino, y con sentidos opuestos, en dirección contraria. Es lo
                contrario de lo que ocurre con las cargas eléctricas del mismo signo.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>
            Cómo resolver un problema de magnetismo — paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica quién crea el campo y quién lo sufre</strong>
                <p>
                  No es lo mismo calcular el campo que produce una corriente que la fuerza que un
                  campo ejerce sobre ella. Muchos enunciados encadenan las dos cosas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Dibuja el campo y la velocidad o la corriente</strong>
                <p>
                  Usa ⊗ para lo que entra en el papel y ⊙ para lo que sale. Sin ese esquema, acertar
                  la dirección del producto vectorial es cuestión de suerte.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula el módulo y aparte la dirección</strong>
                <p>
                  Primero el número con la fórmula correspondiente; después la dirección con la
                  regla de la mano derecha y el signo de la carga.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Si hay movimiento circular, iguala a la fuerza centrípeta</strong>
                <p>
                  De q·v·B = m·v²/r salen el radio, el periodo y la frecuencia sin memorizar nada
                  más.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>En inducción, localiza qué está cambiando</strong>
                <p>
                  ¿El campo, el área o el ángulo? Esa es la variable que hay que derivar. El signo lo
                  pone después la ley de Lenz.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧭</span>
              <div>
                <strong>Ordena el producto vectorial</strong>
                <p>
                  v×B no es lo mismo que B×v: cambia el sentido. Escribe siempre las magnitudes en
                  el orden que marca la fórmula.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">➖</span>
              <div>
                <strong>La carga negativa invierte la fuerza</strong>
                <p>
                  Un electrón gira en sentido contrario a un protón con el mismo campo. Es la fuente
                  de error más común del tema.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Vigila las unidades pequeñas</strong>
                <p>
                  μ₀ vale 4π × 10⁻⁷, así que los campos de corrientes cotidianas salen en
                  microteslas. Un resultado en teslas suele indicar un error de escala.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <div>
                <strong>Recuerda que el periodo es independiente de v</strong>
                <p>
                  Si duplicas la velocidad, el radio se duplica pero el tiempo de vuelta no cambia.
                  Compruébalo moviendo el deslizador.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌊</span>
              <div>
                <strong>Piensa en la derivada, no en el valor</strong>
                <p>
                  En inducción lo que genera fem es la pendiente de la curva de flujo. Un flujo
                  enorme pero constante no induce nada.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔋</span>
              <div>
                <strong>Lenz es conservación de la energía</strong>
                <p>
                  Si dudas del sentido de la corriente inducida, pregúntate cuál se opone al cambio.
                  Esa es siempre la respuesta.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Usar F = q·v·B cuando la velocidad no es perpendicular al campo. Falta el factor
                sen θ, y con θ = 0 la fuerza es nula.
              </li>
              <li>
                Olvidar que en el electrón la fuerza apunta en sentido contrario al que da la regla
                de la mano derecha.
              </li>
              <li>
                Pensar que la fuerza magnética acelera la partícula. Cambia la dirección, pero la
                rapidez y la energía cinética se mantienen.
              </li>
              <li>
                Confundir el campo que crea una corriente con el campo externo que actúa sobre ella.
                Son dos cosas distintas aunque aparezcan en el mismo problema.
              </li>
              <li>
                Aplicar B = μ₀·n·I cerca de los extremos del solenoide, donde el campo ya no es
                uniforme y la fórmula deja de valer.
              </li>
              <li>
                Ignorar el signo menos de la ley de Faraday y dar una corriente inducida que
                refuerza el cambio que la ha creado.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-campo-magnetico')} />
        <ShareCard appName="simulador-campo-magnetico" />
      </main>

      <Footer appName="simulador-campo-magnetico" />
    </div>
  );
}
