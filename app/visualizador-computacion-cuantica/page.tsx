'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorComputacionCuantica.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type IdPuerta = 'X' | 'H' | 'CNOT' | 'Z';

interface PuertaCuantica {
  id: IdPuerta;
  simbolo: string;
  nombre: string;
  descripcion: string;
  tabla: { entrada: string; salida: string }[];
  analogia: string;
}

interface PrediccionAno {
  qubitsLogicos: number;
  enRiesgo: string[];
  seguro: string[];
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PUERTAS: PuertaCuantica[] = [
  {
    id: 'X',
    simbolo: 'X',
    nombre: 'NOT Cuántico',
    descripcion:
      'Invierte el estado del qubit: transforma |0⟩ en |1⟩ y viceversa. Es el equivalente cuántico de la puerta NOT clásica. También funciona sobre superposiciones.',
    tabla: [
      { entrada: '|0⟩', salida: '|1⟩' },
      { entrada: '|1⟩', salida: '|0⟩' },
    ],
    analogia: 'Como girar un interruptor de luz: apagado ↔ encendido.',
  },
  {
    id: 'H',
    simbolo: 'H',
    nombre: 'Hadamard',
    descripcion:
      'Crea superposición perfecta (50/50). Transforma |0⟩ en (|0⟩+|1⟩)/√2. Es la puerta más importante de la computación cuántica: convierte un bit clásico en un qubit en superposición.',
    tabla: [
      { entrada: '|0⟩', salida: '(|0⟩+|1⟩)/√2' },
      { entrada: '|1⟩', salida: '(|0⟩−|1⟩)/√2' },
    ],
    analogia: 'Como lanzar una moneda al aire: antes de caer, está en superposición de cara y cruz.',
  },
  {
    id: 'CNOT',
    simbolo: 'CX',
    nombre: 'CNOT (Controlled-NOT)',
    descripcion:
      'Puerta de 2 qubits. Invierte el qubit objetivo SOLO si el qubit control es |1⟩. Es la puerta que permite crear entrelazamiento cuántico, el fenómeno más extraño de la mecánica cuántica.',
    tabla: [
      { entrada: '|00⟩', salida: '|00⟩' },
      { entrada: '|01⟩', salida: '|01⟩' },
      { entrada: '|10⟩', salida: '|11⟩' },
      { entrada: '|11⟩', salida: '|10⟩' },
    ],
    analogia: 'Como un interruptor que solo actúa si hay luz en otra habitación.',
  },
  {
    id: 'Z',
    simbolo: 'Z',
    nombre: 'Puerta de Fase',
    descripcion:
      'Cambia la fase del qubit pero NO las probabilidades de medición. El estado |0⟩ queda igual pero |1⟩ adquiere una fase negativa. La fase no es observable directamente pero afecta las interferencias.',
    tabla: [
      { entrada: '|0⟩', salida: '|0⟩' },
      { entrada: '|1⟩', salida: '−|1⟩' },
    ],
    analogia: 'Como girar un reloj 180°: la apariencia del reloj es la misma, pero su mecánica interna cambia.',
  },
];

function getPrediccion(ano: number): PrediccionAno {
  if (ano <= 2024) {
    return {
      qubitsLogicos: 5,
      enRiesgo: [],
      seguro: ['RSA-2048', 'AES-256', 'ECC', 'HTTPS'],
    };
  }
  if (ano <= 2026) {
    return {
      qubitsLogicos: 20,
      enRiesgo: [],
      seguro: ['RSA-2048', 'AES-256', 'ECC', 'HTTPS'],
    };
  }
  if (ano <= 2028) {
    return {
      qubitsLogicos: 100,
      enRiesgo: [],
      seguro: ['RSA-2048', 'AES-256', 'ECC', 'HTTPS'],
    };
  }
  if (ano <= 2030) {
    return {
      qubitsLogicos: 500,
      enRiesgo: ['Claves RSA-512'],
      seguro: ['RSA-2048', 'AES-256', 'CRYSTALS-Kyber'],
    };
  }
  if (ano <= 2033) {
    return {
      qubitsLogicos: 1_500,
      enRiesgo: ['Claves RSA-1024', 'ECC-256'],
      seguro: ['RSA-4096', 'CRYSTALS-Kyber', 'CRYSTALS-Dilithium'],
    };
  }
  if (ano <= 2036) {
    return {
      qubitsLogicos: 4_000,
      enRiesgo: ['RSA-2048', 'RSA-1024', 'ECC-256', 'ECC-384'],
      seguro: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'FALCON'],
    };
  }
  return {
    qubitsLogicos: 10_000,
    enRiesgo: ['RSA-2048', 'RSA-4096', 'ECC-384', 'HTTPS clásico'],
    seguro: ['CRYSTALS-Kyber', 'CRYSTALS-Dilithium', 'FALCON', 'SPHINCS+'],
  };
}

function formatearEstados(n: number): string {
  const val = Math.pow(2, n);
  if (val >= 1e15) {
    return val.toLocaleString('es-ES', { notation: 'scientific', maximumFractionDigits: 2 });
  }
  return val.toLocaleString('es-ES');
}

// ─────────────────────────────────────────────
// Esfera de Bloch simplificada (SVG)
// ─────────────────────────────────────────────

function EsferaBloch({ angulo, colapsado }: { angulo: number; colapsado: number | null }) {
  const rad = (angulo * Math.PI) / 180;
  // La aguja apunta desde el centro hasta el borde de la esfera
  const cx = 60;
  const cy = 60;
  const r = 45;
  // Proyección en 2D: eje vertical = cos(rad), eje horizontal = sin(rad)
  const nx = cx + r * Math.sin(rad);
  const ny = cy - r * Math.cos(rad);

  return (
    <svg
      className={styles.esfera}
      viewBox="0 0 120 120"
      aria-label={`Esfera de Bloch con ángulo θ = ${angulo}°`}
      role="img"
    >
      {/* Esfera */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(46,134,171,0.08)" stroke="#2E86AB" strokeWidth="1.5" />
      {/* Ecuador (línea horizontal) */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.25} fill="none" stroke="#2E86AB" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4" />
      {/* Eje vertical */}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#2E86AB" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.4" />
      {/* |0⟩ arriba, |1⟩ abajo */}
      <text x={cx} y={cy - r - 6} textAnchor="middle" fontSize="10" fill="#2E86AB" fontWeight="700">|0⟩</text>
      <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="10" fill="#2E86AB" fontWeight="700">|1⟩</text>
      {/* Aguja del estado */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={colapsado !== null ? '#16a34a' : '#2E86AB'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Punto del estado */}
      <circle
        cx={nx}
        cy={ny}
        r={5}
        fill={colapsado !== null ? '#16a34a' : '#2E86AB'}
      />
      {/* Punto central */}
      <circle cx={cx} cy={cy} r={3} fill="#48A9A6" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorComputacionCuantica() {
  // Sección 1: Bit vs Qubit
  const [bitClasico, setBitClasico] = useState(0);
  const [anguloQubit, setAnguloQubit] = useState(90);
  const [resultadoMedicion, setResultadoMedicion] = useState<number | null>(null);

  // Sección 2: Paralelismo
  const [numQubits, setNumQubits] = useState(10);

  // Sección 3: Puertas
  const [puertaSeleccionada, setPuertaSeleccionada] = useState<IdPuerta | null>('H');
  const [numeroAleatorio, setNumeroAleatorio] = useState<string>('—');

  // Sección 4: RSA
  const [anoSlider, setAnoSlider] = useState(2026);

  // Callbacks
  const medir = useCallback(() => {
    const rad = (anguloQubit * Math.PI) / 180;
    const p0 = Math.cos(rad / 2) ** 2;
    const r = Math.random() < p0 ? 0 : 1;
    setResultadoMedicion(r);
  }, [anguloQubit]);

  const resetQubit = useCallback(() => {
    setResultadoMedicion(null);
  }, []);

  const generarBit = useCallback(() => {
    const bits = Array.from({ length: 8 }, () => Math.round(Math.random())).join('');
    setNumeroAleatorio(`0b${bits} = ${parseInt(bits, 2)}`);
  }, []);

  const rad = (anguloQubit * Math.PI) / 180;
  const p0 = (Math.cos(rad / 2) ** 2 * 100).toFixed(1);
  const p1 = (Math.sin(rad / 2) ** 2 * 100).toFixed(1);

  const estadosSimultaneos = formatearEstados(numQubits);
  const filas = [
    { label: `${numQubits} bits clásicos`, qubits: numQubits, porcentaje: 0.5, valor: '1 estado (de ' + formatearEstados(numQubits) + ')' },
    { label: `${numQubits} qubits`, qubits: numQubits, porcentaje: numQubits / 20, valor: formatearEstados(numQubits) + ' estados' },
    { label: '20 qubits', qubits: 20, porcentaje: 1, valor: '1.048.576 estados' },
  ];

  const puertaActual = PUERTAS.find((p) => p.id === puertaSeleccionada) ?? null;
  const prediccion = getPrediccion(anoSlider);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>⚛️ Visualizador Interactivo</span>
          <h1 className={styles.heroTitle}>Computación Cuántica</h1>
          <p className={styles.heroSubtitle}>Qubits, superposición y la amenaza al cifrado RSA</p>
          <p className={styles.heroDesc}>
            Explora la diferencia entre bits y qubits, cómo funcionan las puertas cuánticas
            y por qué los ordenadores cuánticos podrían romper el cifrado que protege internet.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Sección 1: Bit vs Qubit ───────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">💡</span>
            <div>
              <h2 className={styles.sectionTitle}>Bit clásico vs Qubit</h2>
              <p className={styles.sectionSubtitle}>
                Un bit solo puede ser 0 o 1. Un qubit puede estar en superposición de ambos simultáneamente.
              </p>
            </div>
          </div>

          <div className={styles.comparativa}>
            {/* Bit clásico */}
            <div className={styles.columnaComparativa}>
              <p className={styles.columnaComparativaTitulo}>Bit Clásico</p>
              <span
                className={`${styles.bombilla} ${bitClasico === 0 ? styles.bombillaApagada : styles.bombillaEncendida}`}
                onClick={() => setBitClasico(bitClasico === 0 ? 1 : 0)}
                role="button"
                tabIndex={0}
                aria-label={`Bit clásico: ${bitClasico}. Haz clic para cambiar`}
                onKeyDown={(e) => e.key === 'Enter' && setBitClasico(bitClasico === 0 ? 1 : 0)}
              >
                {bitClasico === 0 ? '🔌' : '💡'}
              </span>
              <span className={styles.valorBit}>{bitClasico}</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Haz clic para alternar
              </p>
              <div className={styles.probabilidades} style={{ marginTop: '0.75rem' }}>
                <div className={styles.probFila}>
                  <span>Estado posible</span>
                  <span style={{ fontWeight: 700 }}>Solo 0 o 1</span>
                </div>
                <div className={styles.probFila}>
                  <span>Simultaneidad</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>No</span>
                </div>
              </div>
            </div>

            {/* Qubit */}
            <div className={styles.columnaComparativa}>
              <p className={styles.columnaComparativaTitulo}>Qubit (Esfera de Bloch)</p>
              <EsferaBloch angulo={resultadoMedicion !== null ? (resultadoMedicion === 0 ? 0 : 180) : anguloQubit} colapsado={resultadoMedicion} />
              <div className={styles.probabilidades}>
                <div className={styles.probFila}>
                  <span className={styles.probKet}>P(|0⟩)</span>
                  <span className={styles.probValor}>{p0}%</span>
                </div>
                <div className={styles.probFila}>
                  <span className={styles.probKet}>P(|1⟩)</span>
                  <span className={styles.probValor}>{p1}%</span>
                </div>
              </div>
              <p className={styles.colapsado} role="status" aria-live="polite">
                {resultadoMedicion !== null
                  ? `Colapsado a |${resultadoMedicion}⟩ tras la medición`
                  : 'En superposición — aún no medido'}
              </p>
            </div>
          </div>

          {/* Slider ángulo */}
          {resultadoMedicion === null && (
            <div style={{ marginBottom: '1rem' }}>
              <div className={styles.sliderLabel}>
                <span>Ángulo de superposición θ</span>
                <strong>{anguloQubit}°</strong>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                step={1}
                value={anguloQubit}
                onChange={(e) => setAnguloQubit(Number(e.target.value))}
                className={styles.slider}
                aria-label="Ángulo de superposición del qubit en grados"
              />
              <div className={styles.sliderValores}>
                <span>0° (puro |0⟩)</span>
                <span>90° (superposición 50/50)</span>
                <span>180° (puro |1⟩)</span>
              </div>
            </div>
          )}

          <div className={styles.botonesMedir}>
            <button type="button" className={styles.btnPrimario} onClick={medir} aria-label="Medir el qubit y colapsar su estado">
              <span aria-hidden="true">⚡</span> Medir qubit
            </button>
            <button type="button" className={styles.btnSecundario} onClick={resetQubit} aria-label="Restaurar el qubit a superposición">
              <span aria-hidden="true">🔄</span> Restaurar superposición
            </button>
          </div>

          <div className={styles.warningBox} style={{ marginTop: '1rem' }}>
            <span className={styles.warningBoxIcono} aria-hidden="true">⚛️</span>
            <span>
              La medición destruye la superposición. Esto es la <strong>decoherencia</strong>: el mayor obstáculo
              en la construcción de ordenadores cuánticos útiles.
            </span>
          </div>
        </section>

        {/* ── Sección 2: Paralelismo cuántico ──────────────────── */}
        <section className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">⚡</span>
            <div>
              <h2 className={styles.sectionTitle}>Paralelismo cuántico</h2>
              <p className={styles.sectionSubtitle}>
                Con n qubits puedes procesar 2ⁿ estados simultáneamente. El crecimiento es exponencial.
              </p>
            </div>
          </div>

          <div className={styles.sliderLabel}>
            <span>Número de qubits</span>
            <strong>{numQubits} qubits → {estadosSimultaneos} estados simultáneos</strong>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={numQubits}
            onChange={(e) => setNumQubits(Number(e.target.value))}
            className={styles.slider}
            aria-label="Número de qubits para calcular estados simultáneos"
          />
          <div className={styles.sliderValores}>
            <span>1 qubit</span>
            <span>10 qubits</span>
            <span>20 qubits</span>
          </div>

          <div className={styles.qubitsDisplay}>
            <span className={styles.estadosNumero} aria-live="polite">{estadosSimultaneos}</span>
            <span className={styles.estadosLabel}>estados simultáneos con {numQubits} qubit{numQubits !== 1 ? 's' : ''}</span>
          </div>

          <div className={styles.comparativaQubits}>
            {filas.map((fila) => (
              <div key={fila.label} className={styles.filaQubits}>
                <span className={styles.filaQubitsEtiqueta}>{fila.label}</span>
                <div
                  className={styles.barraQubits}
                  style={{ width: `${Math.max(fila.porcentaje * 100, 2)}%` }}
                  role="img"
                  aria-label={`Barra de comparativa para ${fila.label}`}
                />
                <span className={styles.filaQubitsValor}>{fila.valor}</span>
              </div>
            ))}
            <div className={styles.filaQubits}>
              <span className={styles.filaQubitsEtiqueta}>50 qubits</span>
              <div className={styles.barraQubits} style={{ width: '100%' }} />
              <span className={styles.filaQubitsValor}>~1.125 billones de billones</span>
            </div>
          </div>

          <div className={styles.analogia}>
            <strong>Analogía:</strong> Es como buscar en un laberinto probando TODOS los caminos a la vez,
            en lugar de intentarlos uno por uno. Un ordenador clásico con 50 bits prueba 1 ruta cada vez.
            50 qubits exploran 1.125 billones de billones de rutas simultáneamente.
          </div>
        </section>

        {/* ── Sección 3: Puertas cuánticas ─────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔧</span>
            <div>
              <h2 className={styles.sectionTitle}>Puertas cuánticas</h2>
              <p className={styles.sectionSubtitle}>
                Las puertas cuánticas son operaciones que transforman qubits, análogas a las puertas lógicas clásicas.
              </p>
            </div>
          </div>

          <div className={styles.puertasGrid}>
            {PUERTAS.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`${styles.puertaCard} ${puertaSeleccionada === p.id ? styles.puertaCardActiva : ''}`}
                onClick={() => setPuertaSeleccionada(puertaSeleccionada === p.id ? null : p.id)}
                aria-pressed={puertaSeleccionada === p.id}
                aria-label={`Puerta cuántica ${p.nombre}. ${puertaSeleccionada === p.id ? 'Activa' : 'Haz clic para ver detalles'}`}
              >
                <span className={styles.puertaNombre}>{p.simbolo}</span>
                <span className={styles.puertaTipo}>{p.nombre}</span>
              </button>
            ))}
          </div>

          {puertaActual && (
            <div className={styles.puertaDetalle} role="region" aria-label={`Detalle de la puerta ${puertaActual.nombre}`}>
              <h3 className={styles.puertaDetalleTitle}>Puerta {puertaActual.nombre} ({puertaActual.simbolo})</h3>
              <p className={styles.puertaDetalleDesc}>{puertaActual.descripcion}</p>
              <table className={styles.tablaPuerta}>
                <thead>
                  <tr>
                    <th>Entrada</th>
                    <th>Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {puertaActual.tabla.map((fila) => (
                    <tr key={fila.entrada}>
                      <td>{fila.entrada}</td>
                      <td>{fila.salida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.puertaAnalogia}><span aria-hidden="true">💡</span> {puertaActual.analogia}</p>
            </div>
          )}

          {/* Circuito mínimo */}
          <div className={styles.circuito}>
            <p className={styles.circuitoTitle}>Circuito mínimo — Generador de números aleatorios perfecto</p>
            <div className={styles.circuitoLinea}>
              <span className={styles.circuitoQubit}>|0⟩ ——</span>
              <span className={styles.circuitoPuerta}>H</span>
              <span className={styles.circuitoConector} />
              <span className={styles.circuitoMedicion}>M</span>
            </div>
            <div className={styles.circuitoResultado}>
              Resultado: Hadamard crea superposición 50/50 → la medición colapsa aleatoriamente.
              Es el único generador de aleatoriedad perfecta del universo.
              <br />
              <button
                type="button"
                className={styles.btnPrimario}
                style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}
                onClick={generarBit}
                aria-label="Generar un byte cuántico aleatorio"
              >
                <span aria-hidden="true">▶</span> Generar byte cuántico
              </button>
              {numeroAleatorio !== '—' && (
                <span
                  className={styles.circuitoNumeroAleatorio}
                  role="status"
                  aria-live="polite"
                  aria-label={`Número aleatorio generado: ${numeroAleatorio}`}
                >
                  {numeroAleatorio}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Sección 4: RSA / Shor ─────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔐</span>
            <div>
              <h2 className={styles.sectionTitle}>La amenaza al cifrado RSA — Algoritmo de Shor</h2>
              <p className={styles.sectionSubtitle}>
                RSA se basa en que factorizar números muy grandes es computacionalmente imposible. Los ordenadores cuánticos cambian esto.
              </p>
            </div>
          </div>

          <div className={styles.timelineRSA}>
            <div className={styles.timelineFila}>
              <span className={styles.timelineIcono} aria-hidden="true">🖥️</span>
              <div className={styles.timelineInfo}>
                <p className={styles.timelineEtiqueta}>Mejor superordenador clásico (2024)</p>
                <p className={`${styles.timelineTiempo} ${styles.timelineTiempoRojo}`}>~300 billones de años para romper RSA-2048</p>
              </div>
            </div>
            <div className={styles.timelineFila}>
              <span className={styles.timelineIcono} aria-hidden="true">⚛️</span>
              <div className={styles.timelineInfo}>
                <p className={styles.timelineEtiqueta}>Ordenador cuántico con 4.000 qubits lógicos (futuro)</p>
                <p className={`${styles.timelineTiempo} ${styles.timelineTiempoVerde}`}>~8 horas para romper RSA-2048</p>
              </div>
            </div>
          </div>

          <div className={styles.sliderAno}>
            <div className={styles.sliderLabel}>
              <span>Año de predicción</span>
              <strong>{anoSlider}</strong>
            </div>
            <input
              type="range"
              min={2024}
              max={2040}
              step={1}
              value={anoSlider}
              onChange={(e) => setAnoSlider(Number(e.target.value))}
              className={styles.slider}
              aria-label="Selecciona el año para ver predicciones de riesgo cuántico"
            />
            <div className={styles.sliderValores}>
              <span>2024</span>
              <span>2032</span>
              <span>2040</span>
            </div>
          </div>

          <div className={styles.prediccionCard} role="region" aria-label={`Predicción para el año ${anoSlider}`}>
            <p className={styles.prediccionAno}>{anoSlider}</p>
            <p className={styles.prediccionQubits}>
              Qubits lógicos estimados: <strong>{prediccion.qubitsLogicos.toLocaleString('es-ES')}</strong>
              {' '}(se necesitan ~4.000 para romper RSA-2048)
            </p>
            {prediccion.enRiesgo.length > 0 && (
              <>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.4rem' }}>
                  En riesgo:
                </p>
                <div className={styles.riesgosList}>
                  {prediccion.enRiesgo.map((r) => (
                    <span key={r} className={styles.riesgoChip}>{r}</span>
                  ))}
                </div>
              </>
            )}
            {prediccion.seguro.length > 0 && (
              <>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.4rem', marginTop: '0.75rem' }}>
                  Seguros / post-cuánticos:
                </p>
                <div className={styles.riesgosList}>
                  {prediccion.seguro.map((r) => (
                    <span key={r} className={styles.riesgoChipOk}>{r}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={styles.postQuantum}>
            <p className={styles.postQuantumTitle}>Criptografía post-cuántica (estandarizada por NIST 2024)</p>
            <ul className={styles.postQuantumList}>
              <li>CRYSTALS-Kyber</li>
              <li>CRYSTALS-Dilithium</li>
              <li>FALCON</li>
              <li>SPHINCS+</li>
            </ul>
          </div>
        </section>

        {/* ── Sección Educativa ─────────────────────────────────── */}
        <EducationalSection
          title="Computación cuántica — Guía completa"
          subtitle="Todo lo que necesitas saber sobre qubits, empresas líderes y usos reales"
          icon="⚛️"
          defaultOpen={false}
        >
          <h3>¿Qué es un ordenador cuántico?</h3>
          <p>
            Un ordenador cuántico es una máquina que aprovecha las leyes de la mecánica cuántica —superposición,
            entrelazamiento e interferencia— para resolver ciertos problemas de forma exponencialmente más rápida que
            los ordenadores clásicos. No sustituye al ordenador clásico: es complementario. Es mejor en problemas
            específicos como factorización, simulación molecular y optimización combinatoria.
          </p>

          <h3>¿Por qué los qubits necesitan temperaturas cercanas al cero absoluto?</h3>
          <p>
            Los qubits son extremadamente sensibles a las perturbaciones del entorno (calor, vibraciones, campos
            electromagnéticos). Para mantener la superposición, los chips cuánticos de superconductores deben
            enfriarse a ~15 milikelvin (−273,135 °C), más frío que el espacio exterior. Esta es la principal razón
            por la que los ordenadores cuánticos no pueden usarse en casa: requieren criostatos del tamaño de un frigorífico.
          </p>

          <h3>Decoherencia — El mayor obstáculo técnico</h3>
          <p>
            La decoherencia ocurre cuando un qubit pierde su estado cuántico por interacción con el entorno externo.
            Es como si alguien encendiera la luz mientras lanzas una moneda al aire: la observación destruye la
            superposición. Los qubits actuales mantienen coherencia durante microsegundos. Los investigadores
            necesitan alcanzar segundos o más. El error de corrección cuántica (QEC) permite crear qubits lógicos
            más estables usando decenas de qubits físicos por cada qubit lógico.
          </p>

          <h3>Empresas líderes en computación cuántica</h3>
          <ul>
            <li><strong>IBM Quantum</strong>: Eagle (127Q), Osprey (433Q), Condor (1.121Q). Acceso cloud gratuito para investigadores.</li>
            <li><strong>Google</strong>: Sycamore (53Q), demostró supremacía cuántica en 2019 para un problema específico.</li>
            <li><strong>IonQ</strong>: Usa trampas de iones (más estables que superconductores).</li>
            <li><strong>Quantinuum</strong>: H-Series con record en fidelidad de puertas.</li>
            <li><strong>D-Wave</strong>: Annealing cuántico, especializado en optimización.</li>
          </ul>

          <h3>Casos de uso reales (no ciencia ficción)</h3>
          <ul>
            <li><strong>Simulación molecular</strong>: Diseño de fármacos y materiales. Un ordenador cuántico podría simular moléculas complejas como la penicilina con precisión atómica.</li>
            <li><strong>Optimización logística</strong>: Rutas de entrega, distribución energética, diseño de chips.</li>
            <li><strong>Machine Learning</strong>: Acelerar el entrenamiento de ciertos modelos.</li>
            <li><strong>Criptografía</strong>: Romper (o crear) cifrados. La carrera entre ataque y defensa ya está en marcha.</li>
          </ul>

          <h3>¿Por qué NO reemplazará al ordenador clásico?</h3>
          <p>
            Los ordenadores cuánticos son peores que los clásicos para la mayoría de las tareas cotidianas: navegar
            por internet, editar documentos, reproducir vídeo, jugar a videojuegos. Son útiles SOLO para una clase
            específica de problemas matemáticos con estructura que se puede explotar mediante algoritmos cuánticos
            (Shor, Grover, QAOA). La analogía: un submarino es mejor que un coche bajo el agua, pero no sustituye
            al coche para ir al trabajo.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-computacion-cuantica')} />
        <ShareCard appName="visualizador-computacion-cuantica" />
      </main>

      <Footer appName="visualizador-computacion-cuantica" />
    </div>
  );
}
