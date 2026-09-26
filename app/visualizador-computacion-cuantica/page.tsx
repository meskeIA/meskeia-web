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
import { formatPercentage } from '@/lib';
import {
  probabilidades,
  numeroEstados,
  formatearEstados,
  leerEnEscalaLarga,
  fraccionBarra,
  etiquetaQubits,
  etiquetaBits,
  estadoCalendario,
  NIST_IR_8547,
  PQC_PUBLICADOS,
  PQC_EN_PROCESO,
  QUBITS_REFERENCIA,
} from './motor';

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
    analogia:
      'Se suele comparar con una moneda en el aire, pero con una diferencia clave: aplicar H dos veces devuelve el estado de partida (H·H = I), algo que ninguna moneda lanzada dos veces hace. La superposición no es no saber cómo caerá la moneda.',
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
    analogia:
      'Como retrasar media vuelta una de dos ondas: cada una por separado suena igual, pero al sumarlas pasan de reforzarse a anularse. Por eso la fase importa en la interferencia.',
  },
];

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
      {/* Esfera (los colores van en el CSS para tener variante oscura) */}
      <circle cx={cx} cy={cy} r={r} className={styles.esferaContorno} strokeWidth="1.5" />
      {/* Ecuador (línea horizontal) */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.25} className={styles.esferaGuia} strokeWidth="0.8" strokeDasharray="3 2" />
      {/* Eje vertical */}
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} className={styles.esferaGuia} strokeWidth="0.8" strokeDasharray="3 2" />
      {/* |0⟩ arriba, |1⟩ abajo */}
      <text x={cx} y={cy - r - 6} textAnchor="middle" fontSize="10" className={styles.esferaTexto} fontWeight="700">|0⟩</text>
      <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="10" className={styles.esferaTexto} fontWeight="700">|1⟩</text>
      {/* Aguja del estado */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        className={colapsado !== null ? styles.esferaAgujaColapsada : styles.esferaAguja}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Punto del estado */}
      <circle
        cx={nx}
        cy={ny}
        r={5}
        className={colapsado !== null ? styles.esferaPuntoColapsado : styles.esferaPunto}
      />
      {/* Punto central */}
      <circle cx={cx} cy={cy} r={3} className={styles.esferaCentro} />
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
  const [resultadoMedicion, setResultadoMedicion] = useState<0 | 1 | null>(null);

  // Sección 2: Paralelismo
  const [numQubits, setNumQubits] = useState(10);

  // Sección 3: Puertas
  const [puertaSeleccionada, setPuertaSeleccionada] = useState<IdPuerta | null>('H');
  const [numeroAleatorio, setNumeroAleatorio] = useState<string>('—');

  // Sección 4: RSA
  const [anoSlider, setAnoSlider] = useState(2026);

  // Callbacks
  const medir = useCallback(() => {
    // Se mide sobre el estado previo a la medición (regla de Born).
    const { p0 } = probabilidades(anguloQubit, null);
    setResultadoMedicion(Math.random() < p0 ? 0 : 1);
  }, [anguloQubit]);

  const resetQubit = useCallback(() => {
    setResultadoMedicion(null);
  }, []);

  const generarBit = useCallback(() => {
    const bits = Array.from({ length: 8 }, () => Math.round(Math.random())).join('');
    setNumeroAleatorio(`0b${bits} = ${parseInt(bits, 2)}`);
  }, []);

  // Tras medir, el estado ES |k⟩: P(|k⟩) = 100 % (motor.ts).
  const prob = probabilidades(anguloQubit, resultadoMedicion);
  const p0 = formatPercentage(prob.p0, 1);
  const p1 = formatPercentage(prob.p1, 1);

  const estadosN = formatearEstados(numQubits);
  const estadosReferencia = leerEnEscalaLarga(numeroEstados(QUBITS_REFERENCIA));
  // Barras en escala logarítmica (longitud ∝ número de qubits): en lineal, todas salvo la de
  // 50 qubits medirían menos de una milmillonésima de ella.
  const filas = [
    { label: etiquetaBits(numQubits), fraccion: fraccionBarra(1), valor: `1 estado (de ${estadosN} posibles)` },
    { label: etiquetaQubits(numQubits), fraccion: fraccionBarra(numeroEstados(numQubits)), valor: `${estadosN} estados` },
    { label: etiquetaQubits(20), fraccion: fraccionBarra(numeroEstados(20)), valor: `${formatearEstados(20)} estados` },
    { label: etiquetaQubits(QUBITS_REFERENCIA), fraccion: fraccionBarra(numeroEstados(QUBITS_REFERENCIA)), valor: `${estadosReferencia} de estados` },
  ];

  const puertaActual = PUERTAS.find((p) => p.id === puertaSeleccionada) ?? null;
  const calendario = estadoCalendario(anoSlider);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}><span aria-hidden="true">⚛️</span> Visualizador Interactivo</span>
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
              {/* Un <button> de verdad: responde a Enter y a Espacio sin código extra */}
              <button
                type="button"
                className={`${styles.bombilla} ${bitClasico === 0 ? styles.bombillaApagada : styles.bombillaEncendida}`}
                onClick={() => setBitClasico(bitClasico === 0 ? 1 : 0)}
                aria-label={`Bit clásico: ${bitClasico}. Haz clic para cambiar`}
                aria-pressed={bitClasico === 1}
              >
                {bitClasico === 0 ? '🔌' : '💡'}
              </button>
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
                  <span className={styles.textoRojo}>No</span>
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
                  <span className={styles.probValor}>{p0}</span>
                </div>
                <div className={styles.probFila}>
                  <span className={styles.probKet}>P(|1⟩)</span>
                  <span className={styles.probValor}>{p1}</span>
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
              La medición destruye la superposición: tras medir, el qubit queda en |0⟩ o en |1⟩ con
              probabilidad 100&nbsp;%. Cuando es el entorno el que «mide» al qubit sin que nadie lo pida, se habla
              de <strong>decoherencia</strong>: el mayor obstáculo en la construcción de ordenadores cuánticos útiles.
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
                Describir n qubits exige 2ⁿ amplitudes a la vez: el crecimiento es exponencial. Pero al medirlos
                se obtiene un solo resultado de n bits.
              </p>
            </div>
          </div>

          <div className={styles.sliderLabel}>
            <span>Número de qubits</span>
            <strong>{etiquetaQubits(numQubits)} → {estadosN} estados en superposición</strong>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={numQubits}
            onChange={(e) => setNumQubits(Number(e.target.value))}
            className={styles.slider}
            aria-label="Número de qubits para calcular los estados de la superposición"
          />
          <div className={styles.sliderValores}>
            <span>1 qubit</span>
            <span>10 qubits</span>
            <span>20 qubits</span>
          </div>

          <div className={styles.qubitsDisplay}>
            <span className={styles.estadosNumero} aria-live="polite">{estadosN}</span>
            <span className={styles.estadosLabel}>estados de base en la superposición de {etiquetaQubits(numQubits)}</span>
          </div>

          <div className={styles.comparativaQubits}>
            {filas.map((fila, i) => (
              <div key={i} className={styles.filaQubits}>
                <span className={styles.filaQubitsEtiqueta}>{fila.label}</span>
                {/* La pista ocupa el hueco libre; la barra, una fracción de ella (escala logarítmica) */}
                <div className={styles.pistaBarra} aria-hidden="true">
                  <div className={styles.barraQubits} style={{ width: `${fila.fraccion * 100}%` }} />
                </div>
                <span className={styles.filaQubitsValor}>{fila.valor}</span>
              </div>
            ))}
          </div>
          <p className={styles.notaEscala}>
            Barras en escala logarítmica: su longitud es proporcional al número de qubits. En escala lineal, la
            barra de 20 qubits no llegaría a una milmillonésima de la de {QUBITS_REFERENCIA}.
          </p>

          <div className={styles.analogia}>
            <strong>Analogía (y su límite):</strong> se suele decir que un ordenador cuántico recorre a la vez
            todos los caminos de un laberinto. No es así. {QUBITS_REFERENCIA} qubits se describen con{' '}
            {estadosReferencia} de amplitudes, pero al medir se obtiene <strong>un solo</strong> camino, al azar
            según esas amplitudes. La ventaja aparece cuando un algoritmo consigue que las amplitudes de las
            respuestas erróneas se cancelen entre sí (interferencia). En una búsqueda sin ninguna estructura, como
            un laberinto a ciegas, lo mejor posible es el algoritmo de Grover: del orden de √N consultas en vez de N
            (Bennett, Bernstein, Brassard y Vazirani, 1997). Con N = 2⁵⁰ son unos 33,5 millones de consultas
            (2²⁵) frente a hasta {estadosReferencia}: una ganancia cuadrática, no exponencial.
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
            <p className={styles.circuitoTitle}>Circuito mínimo — Generador de números aleatorios</p>
            <div className={styles.circuitoLinea}>
              <span className={styles.circuitoQubit}>|0⟩ ——</span>
              <span className={styles.circuitoPuerta}>H</span>
              <span className={styles.circuitoConector} />
              <span className={styles.circuitoMedicion}>M</span>
            </div>
            <div className={styles.circuitoResultado}>
              Resultado: Hadamard crea una superposición 50/50 → cada medición da 0 o 1 con probabilidad ½.
              En un ordenador cuántico real es una fuente física de azar, como lo son también la desintegración
              radiactiva o el ruido de los fotones. <strong>Aquí se simula</strong>: el byte sale del generador
              pseudoaleatorio del navegador, no de un qubit.
              <br />
              <button
                type="button"
                className={styles.btnPrimario}
                style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}
                onClick={generarBit}
                aria-label="Simular un byte cuántico aleatorio"
              >
                <span aria-hidden="true">▶</span> Simular byte cuántico
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
                RSA se basa en que factorizar números muy grandes es inviable en la práctica con ordenadores clásicos.
                Un ordenador cuántico lo bastante grande y fiable lo cambiaría: aún no existe.
              </p>
            </div>
          </div>

          <div className={styles.timelineRSA}>
            <div className={styles.timelineFila}>
              <span className={styles.timelineIcono} aria-hidden="true">🖥️</span>
              <div className={styles.timelineInfo}>
                <p className={styles.timelineEtiqueta}>Récord clásico de factorización (28/02/2020)</p>
                <p className={`${styles.timelineTiempo} ${styles.timelineTiempoRojo}`}>
                  RSA-250 (829 bits): unos 2.700 años-núcleo de cálculo. RSA-2048 sigue fuera de alcance.
                </p>
                <p className={styles.timelineFuente}>Boudot, Gaudry, Guillevic, Heninger, Thomé y Zimmermann (2020)</p>
              </div>
            </div>
            <div className={styles.timelineFila}>
              <span className={styles.timelineIcono} aria-hidden="true">⚛️</span>
              <div className={styles.timelineInfo}>
                <p className={styles.timelineEtiqueta}>Estimación cuántica de 2019 para RSA-2048</p>
                <p className={`${styles.timelineTiempo} ${styles.timelineTiempoVerde}`}>
                  20 millones de qubits físicos ruidosos → unas 8 horas
                </p>
                <p className={styles.timelineFuente}>Gidney y Ekerå (2019), arXiv:1905.09749</p>
              </div>
            </div>
            <div className={styles.timelineFila}>
              <span className={styles.timelineIcono} aria-hidden="true">⚛️</span>
              <div className={styles.timelineInfo}>
                <p className={styles.timelineEtiqueta}>Estimación cuántica de 2025 para RSA-2048</p>
                <p className={`${styles.timelineTiempo} ${styles.timelineTiempoVerde}`}>
                  Menos de 1 millón de qubits físicos ruidosos → menos de una semana
                </p>
                <p className={styles.timelineFuente}>
                  Gidney (21/05/2025), arXiv:2505.15917: unos 1.400 qubits lógicos y 6.500 millones de puertas Toffoli
                </p>
              </div>
            </div>
          </div>
          <p className={styles.notaEscala}>
            Las dos estimaciones cuánticas suponen una tasa de error física del 0,1&nbsp;% por operación. Para
            situarlas: IBM anunció el 10/06/2025 su plan de tener en 2029 «Starling», con 200 qubits lógicos y
            100 millones de puertas. Una hoja de ruta es un anuncio de empresa, no un hecho. Las demostraciones
            del algoritmo de Shor en hardware real se han limitado a números muy pequeños, como 15 o 21.
          </p>

          <div className={styles.sliderAno}>
            <div className={styles.sliderLabel}>
              <span>Año</span>
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
              aria-label="Selecciona el año para ver el calendario de retirada de RSA y ECC"
            />
            <div className={styles.sliderValores}>
              <span>2024</span>
              <span>2032</span>
              <span>2040</span>
            </div>
          </div>

          <div className={styles.prediccionCard} role="region" aria-label={`Calendario para el año ${anoSlider}`}>
            <p className={styles.prediccionAno}>{anoSlider}</p>
            <p className={styles.prediccionQubits}>
              Calendario propuesto por el NIST de EE. UU. para sus sistemas federales ({NIST_IR_8547.documento}).
              Nadie sabe cuándo habrá un ordenador cuántico capaz de romper RSA-2048: las fechas responden a que
              migrar lleva años y a que lo que se cifra hoy puede guardarse y descifrarse más adelante.
            </p>
            {calendario.noAdmitidos.length > 0 && (
              <>
                <p className={styles.etiquetaRiesgo}>No admitidos desde {NIST_IR_8547.noAdmitidoDesde}:</p>
                <div className={styles.riesgosList}>
                  {calendario.noAdmitidos.map((r) => (
                    <span key={r} className={styles.riesgoChip}>{r}</span>
                  ))}
                </div>
              </>
            )}
            {calendario.desaconsejados.length > 0 && (
              <>
                <p className={styles.etiquetaRiesgo}>Desaconsejados desde {NIST_IR_8547.desaconsejadoDesde}:</p>
                <div className={styles.riesgosList}>
                  {calendario.desaconsejados.map((r) => (
                    <span key={r} className={styles.riesgoChip}>{r}</span>
                  ))}
                </div>
              </>
            )}
            {calendario.admitidos.length > 0 && (
              <>
                <p className={styles.etiquetaNeutra}>Aún admitidos (vulnerables al algoritmo de Shor):</p>
                <div className={styles.riesgosList}>
                  {calendario.admitidos.map((r) => (
                    <span key={r} className={styles.riesgoChipNeutro}>{r}</span>
                  ))}
                </div>
              </>
            )}
            <p className={styles.etiquetaSeguro}>Estándares post-cuánticos ya publicados:</p>
            <div className={styles.riesgosList}>
              {PQC_PUBLICADOS.map((a) => (
                <span key={a.nombre} className={styles.riesgoChipOk}>{a.nombre}</span>
              ))}
            </div>
            <p className={styles.notaEscala}>
              La Unión Europea, en su hoja de ruta coordinada del 23/06/2025, pide empezar la transición antes de
              que acabe 2026 y haberla completado en las infraestructuras críticas antes de que acabe 2030.
            </p>
          </div>

          <div className={styles.postQuantum}>
            <p className={styles.postQuantumTitle}>Criptografía post-cuántica (estándares del NIST del 13/08/2024)</p>
            <ul className={styles.postQuantumList}>
              {PQC_PUBLICADOS.map((a) => (
                <li key={a.nombre}>{a.nombre} · {a.norma}</li>
              ))}
            </ul>
            <p className={styles.postQuantumNota}>En proceso de estandarización: {PQC_EN_PROCESO.join(' y ')}.</p>
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
            entrelazamiento e interferencia— para resolver ciertos problemas mucho más deprisa que los ordenadores
            clásicos; en algunos, como la factorización, con una ventaja enorme según los algoritmos conocidos. No sustituye al ordenador clásico: es complementario. Sus candidatos más
            claros son la factorización y la simulación de moléculas; en optimización, la ventaja sigue en estudio.
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
            superposición. Los qubits superconductores mantienen la coherencia del orden de decenas a cientos de
            microsegundos; los de iones atrapados, bastante más. Como ningún qubit físico es perfecto, la corrección
            de errores cuánticos (QEC) crea qubits lógicos más estables repartiendo cada uno entre decenas o cientos
            de qubits físicos.
          </p>

          <h3>Empresas líderes en computación cuántica</h3>
          <ul>
            <li><strong>IBM Quantum</strong>: Eagle (127Q), Osprey (433Q), Condor (1.121Q). Acceso cloud gratuito para investigadores.</li>
            <li><strong>Google</strong>: Sycamore (53Q). En 2019 anunció la «supremacía cuántica» en un problema de muestreo que, según Google, a un superordenador le llevaría 10.000 años. Es un resultado discutido: IBM estimó ese mismo mes unos 2,5 días, y Pan, Chen y Zhang lo simularon en unas 15 horas con 512 GPU (Physical Review Letters, 2022).</li>
            <li><strong>IonQ</strong>: Usa trampas de iones (más estables que superconductores).</li>
            <li><strong>Quantinuum</strong>: H-Series, de iones atrapados, con fidelidades de puerta entre las más altas publicadas.</li>
            <li><strong>D-Wave</strong>: Annealing cuántico, especializado en optimización.</li>
          </ul>

          <h3>Casos de uso reales (no ciencia ficción)</h3>
          <ul>
            <li><strong>Simulación molecular</strong>: Diseño de fármacos y materiales. Se investiga si un ordenador cuántico podrá simular con precisión moléculas que hoy solo se aproximan.</li>
            <li><strong>Optimización logística</strong>: Rutas de entrega, distribución energética, diseño de chips.</li>
            <li><strong>Aprendizaje automático</strong>: se investiga si puede acelerar ciertos modelos; por ahora, sin ventaja demostrada en problemas prácticos.</li>
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
