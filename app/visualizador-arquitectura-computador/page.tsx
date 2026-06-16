'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorArquitecturaComputador.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'von-neumann' | 'cpu' | 'fde' | 'memoria';

interface BloqueVN {
  id: string;
  nombre: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  descripcion: string;
  detalles: string[];
}

interface ComponenteCPU {
  id: string;
  nombre: string;
  sigla: string;
  icono: string;
  color: string;
  funcion: string;
  detalle: string;
}

interface PasoFDE {
  fase: 'Fetch' | 'Decode' | 'Execute';
  titulo: string;
  descripcion: string;
  registros: { nombre: string; valor: string }[];
  colorFase: string;
}

interface NivelMemoria {
  nombre: string;
  latencia: string;
  tamano: string;
  coste: string;
  icono: string;
  color: string;
  barraAncho: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos: diagrama Von Neumann
// ─────────────────────────────────────────────────────────────────────────────

const BLOQUES_VN: BloqueVN[] = [
  {
    id: 'cpu',
    nombre: 'CPU',
    x: 30, y: 80, w: 180, h: 140,
    color: '#2E86AB',
    descripcion: 'Unidad Central de Procesamiento — el "cerebro" del computador.',
    detalles: [
      'Ejecuta las instrucciones del programa',
      'Contiene la ALU y la Unidad de Control',
      'Opera a frecuencias de GHz (miles de millones de ciclos/s)',
      'Los procesadores modernos integran múltiples núcleos',
    ],
  },
  {
    id: 'alu',
    nombre: 'ALU',
    x: 45, y: 105, w: 70, h: 45,
    color: '#1a6080',
    descripcion: 'Unidad Aritmético-Lógica: realiza operaciones de cálculo.',
    detalles: [
      'Suma, resta, multiplicación y división',
      'Operaciones lógicas: AND, OR, NOT, XOR',
      'Comparaciones: igual, mayor, menor',
      'Trabaja sobre los registros del procesador',
    ],
  },
  {
    id: 'uc',
    nombre: 'UC',
    x: 130, y: 105, w: 70, h: 45,
    color: '#1a6080',
    descripcion: 'Unidad de Control: dirige el funcionamiento de la CPU.',
    detalles: [
      'Interpreta cada instrucción del IR',
      'Genera señales de control para ALU y buses',
      'Gestiona el ciclo fetch-decode-execute',
      'Coordina la comunicación entre componentes',
    ],
  },
  {
    id: 'registros',
    nombre: 'Registros',
    x: 45, y: 165, w: 155, h: 40,
    color: '#48A9A6',
    descripcion: 'Memoria ultrarrápida interna de la CPU (~300 ps de acceso).',
    detalles: [
      'PC: Program Counter — dirección de la siguiente instrucción',
      'IR: Instruction Register — instrucción actual en ejecución',
      'MAR: Memory Address Register — dirección de memoria a acceder',
      'MDR: Memory Data Register — dato leído o a escribir',
      'ACC: Acumulador — resultado de las operaciones ALU',
    ],
  },
  {
    id: 'ram',
    nombre: 'Memoria RAM',
    x: 280, y: 80, w: 120, h: 80,
    color: '#E07B39',
    descripcion: 'Random Access Memory — memoria principal de trabajo.',
    detalles: [
      'Almacena programas en ejecución y sus datos',
      'Volátil: pierde contenido al apagar el equipo',
      'Acceso en ~100 ns (más lenta que caché)',
      'Capacidad típica: 8–64 GB en equipos actuales',
    ],
  },
  {
    id: 'rom',
    nombre: 'ROM / Flash',
    x: 280, y: 175, w: 120, h: 45,
    color: '#8E8E93',
    descripcion: 'Read Only Memory — almacena la BIOS/UEFI del sistema.',
    detalles: [
      'No volátil: conserva datos sin alimentación',
      'Contiene el firmware de arranque (BIOS/UEFI)',
      'Las Flash ROM permiten actualización (firmware update)',
      'Velocidad similar a la RAM pero con menor capacidad',
    ],
  },
  {
    id: 'bus',
    nombre: 'Bus del sistema',
    x: 215, y: 130, w: 60, h: 20,
    color: '#666',
    descripcion: 'Canal de comunicación entre todos los componentes.',
    detalles: [
      'Bus de datos: transfiere datos entre componentes',
      'Bus de direcciones: indica la dirección de memoria',
      'Bus de control: señales de lectura/escritura/interrupciones',
      'Ancho de bus (32/64 bits) determina velocidad de transferencia',
    ],
  },
  {
    id: 'es',
    nombre: 'E/S',
    x: 280, y: 235, w: 120, h: 45,
    color: '#5C8F4A',
    descripcion: 'Dispositivos de Entrada/Salida: teclado, pantalla, disco...',
    detalles: [
      'Entrada: teclado, ratón, micrófono, cámara',
      'Salida: pantalla, altavoces, impresora',
      'E/S mixta: disco duro, SSD, USB, red',
      'Comunican al computador con el mundo exterior',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Datos: componentes CPU
// ─────────────────────────────────────────────────────────────────────────────

const COMPONENTES_CPU: ComponenteCPU[] = [
  {
    id: 'pc',
    nombre: 'Program Counter',
    sigla: 'PC',
    icono: '📍',
    color: '#2E86AB',
    funcion: 'Dirección de la siguiente instrucción a ejecutar',
    detalle:
      'El PC se incrementa automáticamente tras cada fetch. En un salto (branch/jump), la UC carga en el PC la dirección de destino en lugar de incrementarla. Es el "marcador de página" del procesador.',
  },
  {
    id: 'ir',
    nombre: 'Instruction Register',
    sigla: 'IR',
    icono: '📋',
    color: '#48A9A6',
    funcion: 'Almacena la instrucción que se está ejecutando ahora',
    detalle:
      'Después del fetch, la instrucción traída de memoria se copia en el IR. La Unidad de Control lee el IR para saber qué operación debe realizar y a qué operandos afecta.',
  },
  {
    id: 'mar',
    nombre: 'Memory Address Register',
    sigla: 'MAR',
    icono: '🗺️',
    color: '#E07B39',
    funcion: 'Dirección de memoria que se va a leer o escribir',
    detalle:
      'Cuando la CPU quiere acceder a memoria (lectura o escritura), primero carga la dirección en el MAR. Esta dirección viaja por el bus de direcciones hasta la RAM.',
  },
  {
    id: 'mdr',
    nombre: 'Memory Data Register',
    sigla: 'MDR',
    icono: '📦',
    color: '#9B59B6',
    funcion: 'Dato que se lee de o se escribe en memoria',
    detalle:
      'Actúa como "puerta de entrada" entre la CPU y la memoria. En una lectura, el dato de RAM llega al MDR y de ahí pasa a otros registros. En una escritura, el dato va del MDR al bus de datos hacia RAM.',
  },
  {
    id: 'acc',
    nombre: 'Acumulador',
    sigla: 'ACC',
    icono: '🧮',
    color: '#27AE60',
    funcion: 'Almacena el resultado de operaciones de la ALU',
    detalle:
      'El ACC recibe el resultado de cada operación aritmética o lógica. En muchas arquitecturas CISC, las operaciones implican implícitamente al acumulador. En RISC hay múltiples registros de propósito general.',
  },
  {
    id: 'alu',
    nombre: 'Unidad Aritmético-Lógica',
    sigla: 'ALU',
    icono: '⚙️',
    color: '#E74C3C',
    funcion: 'Realiza cálculos: suma, resta, AND, OR, comparaciones',
    detalle:
      'La ALU recibe dos operandos (de registros o memoria) y una señal de operación de la UC. Devuelve el resultado y actualiza flags de estado (zero, carry, overflow, sign). Es el componente que "hace el trabajo matemático".',
  },
  {
    id: 'uc',
    nombre: 'Unidad de Control',
    sigla: 'UC',
    icono: '🎛️',
    color: '#1a6080',
    funcion: 'Interpreta instrucciones y coordina todos los componentes',
    detalle:
      'Lee el opcode del IR y genera las señales de control necesarias: qué debe hacer la ALU, qué registros leer/escribir, si acceder a memoria... Es el "director de orquesta" de la CPU.',
  },
  {
    id: 'reloj',
    nombre: 'Reloj del Sistema',
    sigla: 'CLK',
    icono: '⏱️',
    color: '#F39C12',
    funcion: 'Sincroniza todas las operaciones de la CPU',
    detalle:
      'El reloj genera pulsos a frecuencia constante (ej: 3,5 GHz = 3.500 millones de pulsos/s). Cada operación necesita un número fijo de ciclos de reloj. A mayor frecuencia, más instrucciones por segundo.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Datos: ciclo Fetch-Decode-Execute
// ─────────────────────────────────────────────────────────────────────────────

// Mini-programa: LOAD A,5 | LOAD B,3 | ADD A,B | STORE C,A
const PASOS_FDE: PasoFDE[] = [
  {
    fase: 'Fetch',
    titulo: 'Fetch — Instrucción 1: LOAD A, 5',
    descripcion: 'PC contiene la dirección 100. Se copia en MAR y se incrementa PC a 101. La CPU lee de la posición 100 de RAM y almacena la instrucción en MDR y luego en IR.',
    registros: [
      { nombre: 'PC', valor: '100 → 101' },
      { nombre: 'MAR', valor: '100' },
      { nombre: 'MDR', valor: 'LOAD A,5' },
      { nombre: 'IR', valor: 'LOAD A,5' },
    ],
    colorFase: '#2E86AB',
  },
  {
    fase: 'Decode',
    titulo: 'Decode — Interpretar LOAD A, 5',
    descripcion: 'La Unidad de Control lee el IR. Identifica el opcode LOAD, el operando destino A y el valor inmediato 5. Genera señales de control para la siguiente fase.',
    registros: [
      { nombre: 'IR', valor: 'LOAD A,5' },
      { nombre: 'UC', valor: 'op=LOAD, dest=A, val=5' },
    ],
    colorFase: '#48A9A6',
  },
  {
    fase: 'Execute',
    titulo: 'Execute — Cargar 5 en registro A',
    descripcion: 'La UC ordena escribir el valor 5 en el registro A (ACC). No hay acceso a RAM en este caso (valor inmediato). Registro A queda con valor 5.',
    registros: [
      { nombre: 'ACC (A)', valor: '5' },
    ],
    colorFase: '#E07B39',
  },
  {
    fase: 'Fetch',
    titulo: 'Fetch — Instrucción 2: LOAD B, 3',
    descripcion: 'PC = 101. Se copia en MAR y PC pasa a 102. La CPU lee la instrucción en posición 101 de RAM: "LOAD B,3". Se almacena en IR.',
    registros: [
      { nombre: 'PC', valor: '101 → 102' },
      { nombre: 'MAR', valor: '101' },
      { nombre: 'MDR', valor: 'LOAD B,3' },
      { nombre: 'IR', valor: 'LOAD B,3' },
    ],
    colorFase: '#2E86AB',
  },
  {
    fase: 'Decode',
    titulo: 'Decode — Interpretar LOAD B, 3',
    descripcion: 'La UC identifica opcode LOAD, destino B, valor inmediato 3. Genera señales para cargar 3 en el registro B.',
    registros: [
      { nombre: 'IR', valor: 'LOAD B,3' },
      { nombre: 'UC', valor: 'op=LOAD, dest=B, val=3' },
    ],
    colorFase: '#48A9A6',
  },
  {
    fase: 'Execute',
    titulo: 'Execute — Cargar 3 en registro B',
    descripcion: 'Se escribe el valor 3 en el registro B. Ahora A=5 y B=3, listos para la siguiente instrucción.',
    registros: [
      { nombre: 'ACC (A)', valor: '5' },
      { nombre: 'Reg B', valor: '3' },
    ],
    colorFase: '#E07B39',
  },
  {
    fase: 'Fetch',
    titulo: 'Fetch — Instrucción 3: ADD A, B',
    descripcion: 'PC = 102. Se carga en MAR y PC avanza a 103. Se lee la instrucción ADD A,B de RAM y se coloca en IR.',
    registros: [
      { nombre: 'PC', valor: '102 → 103' },
      { nombre: 'MAR', valor: '102' },
      { nombre: 'MDR', valor: 'ADD A,B' },
      { nombre: 'IR', valor: 'ADD A,B' },
    ],
    colorFase: '#2E86AB',
  },
  {
    fase: 'Decode',
    titulo: 'Decode — Interpretar ADD A, B',
    descripcion: 'La UC identifica opcode ADD, primer operando A, segundo operando B. Activa la ALU en modo suma y selecciona los registros fuente y destino.',
    registros: [
      { nombre: 'IR', valor: 'ADD A,B' },
      { nombre: 'UC', valor: 'op=ADD, src1=A, src2=B, dest=A' },
    ],
    colorFase: '#48A9A6',
  },
  {
    fase: 'Execute',
    titulo: 'Execute — ALU suma A + B',
    descripcion: 'La ALU recibe A=5 y B=3, realiza la suma y devuelve 8. El resultado se escribe en el ACC (registro A). Flag Zero=0 (resultado distinto de cero).',
    registros: [
      { nombre: 'ALU', valor: '5 + 3 = 8' },
      { nombre: 'ACC (A)', valor: '8' },
      { nombre: 'Flag Zero', valor: '0' },
    ],
    colorFase: '#E07B39',
  },
  {
    fase: 'Fetch',
    titulo: 'Fetch — Instrucción 4: STORE C, A',
    descripcion: 'PC = 103. Se lee la última instrucción STORE C,A de la posición 103 de RAM y se almacena en IR.',
    registros: [
      { nombre: 'PC', valor: '103 → 104' },
      { nombre: 'MAR', valor: '103' },
      { nombre: 'MDR', valor: 'STORE C,A' },
      { nombre: 'IR', valor: 'STORE C,A' },
    ],
    colorFase: '#2E86AB',
  },
  {
    fase: 'Decode',
    titulo: 'Decode — Interpretar STORE C, A',
    descripcion: 'La UC identifica opcode STORE, destino C (posición de memoria), fuente A (ACC). Activa el bus de datos en modo escritura.',
    registros: [
      { nombre: 'IR', valor: 'STORE C,A' },
      { nombre: 'UC', valor: 'op=STORE, src=A, dest=mem[C]' },
    ],
    colorFase: '#48A9A6',
  },
  {
    fase: 'Execute',
    titulo: 'Execute — Escribir resultado en memoria',
    descripcion: 'La dirección de C se carga en MAR. El valor del ACC (8) se copia en MDR. El MDR vuelca el dato por el bus de datos hacia la posición C de la RAM. ¡Programa completado!',
    registros: [
      { nombre: 'MAR', valor: 'dir(C)' },
      { nombre: 'MDR', valor: '8' },
      { nombre: 'RAM[C]', valor: '8 ✅' },
    ],
    colorFase: '#27AE60',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Datos: jerarquía de memoria
// ─────────────────────────────────────────────────────────────────────────────

const NIVELES_MEMORIA: NivelMemoria[] = [
  { nombre: 'Registros CPU', latencia: '~300 ps', tamano: '< 1 KB', coste: 'Muy alto', icono: '⚡', color: '#E74C3C', barraAncho: 5 },
  { nombre: 'Caché L1', latencia: '~1 ns', tamano: '32–64 KB', coste: 'Alto', icono: '🔴', color: '#E07B39', barraAncho: 12 },
  { nombre: 'Caché L2', latencia: '~4 ns', tamano: '256–512 KB', coste: 'Alto', icono: '🟠', color: '#F39C12', barraAncho: 22 },
  { nombre: 'Caché L3', latencia: '~10 ns', tamano: '4–32 MB', coste: 'Medio-alto', icono: '🟡', color: '#F1C40F', barraAncho: 35 },
  { nombre: 'RAM (DRAM)', latencia: '~100 ns', tamano: '8–128 GB', coste: 'Medio', icono: '🟢', color: '#27AE60', barraAncho: 55 },
  { nombre: 'SSD (NVMe)', latencia: '~100 μs', tamano: '500 GB – 4 TB', coste: 'Bajo-medio', icono: '🔵', color: '#2E86AB', barraAncho: 72 },
  { nombre: 'HDD', latencia: '~10 ms', tamano: '1 – 16 TB', coste: 'Muy bajo', icono: '🟣', color: '#8E44AD', barraAncho: 88 },
  { nombre: 'Cinta magnética', latencia: 'segundos – min', tamano: 'Ilimitado', coste: 'Mínimo', icono: '⬛', color: '#555', barraAncho: 100 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualizadorArquitecturaComputadorPage() {
  const [tabActiva, setTabActiva] = useState<Tab>('von-neumann');
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueVN | null>(null);
  const [componenteSeleccionado, setComponenteSeleccionado] = useState<ComponenteCPU | null>(null);
  const [pasoFDE, setPasoFDE] = useState(0);

  const fasesColores: Record<string, string> = { Fetch: '#2E86AB', Decode: '#48A9A6', Execute: '#E07B39' };
  const pasoActual = PASOS_FDE[pasoFDE];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🖥️</span> Arquitectura del Computador</h1>
        <p className={styles.subtitle}>
          Von Neumann, CPU, ciclo fetch-decode-execute y jerarquía de memoria — explicados de forma visual
        </p>
      </header>

      <LegalNotice />

      {/* Tabs */}
      <nav className={styles.tabNav} aria-label="Secciones del visualizador">
        {(
          [
            { id: 'von-neumann', label: '🏗️ Von Neumann' },
            { id: 'cpu', label: '⚙️ Dentro de la CPU' },
            { id: 'fde', label: '🔄 Ciclo FDE' },
            { id: 'memoria', label: '🗄️ Jerarquía Memoria' },
          ] as { id: Tab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTabActiva(tab.id)}
            className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActive : ''}`}
            aria-pressed={tabActiva === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Tab 1: Von Neumann ── */}
      {tabActiva === 'von-neumann' && (
        <section className={styles.tabContent}>
          <p className={styles.tabIntro}>
            Haz clic en cualquier bloque para ver su descripción detallada.
          </p>
          <div className={styles.diagramaWrapper}>
            <svg
              viewBox="0 0 450 310"
              className={styles.diagramaSvg}
              aria-label="Diagrama de arquitectura Von Neumann"
            >
              {/* Buses */}
              <line x1="210" y1="150" x2="280" y2="150" stroke="#999" strokeWidth="3" strokeDasharray="5,3" />
              <line x1="210" y1="155" x2="280" y2="200" stroke="#999" strokeWidth="2" strokeDasharray="4,3" />
              <line x1="210" y1="160" x2="280" y2="255" stroke="#999" strokeWidth="2" strokeDasharray="4,3" />
              <text x="230" y="140" fontSize="9" fill="#888">Buses</text>

              {/* Bloques */}
              {BLOQUES_VN.map((b) => (
                <g
                  key={b.id}
                  onClick={() => setBloqueSeleccionado(bloqueSeleccionado?.id === b.id ? null : b)}
                  className={styles.svgBloque}
                  role="button"
                  aria-label={b.nombre}
                >
                  <rect
                    x={b.x} y={b.y} width={b.w} height={b.h}
                    rx="6" ry="6"
                    fill={bloqueSeleccionado?.id === b.id ? b.color : b.color + 'CC'}
                    stroke={bloqueSeleccionado?.id === b.id ? '#fff' : b.color}
                    strokeWidth={bloqueSeleccionado?.id === b.id ? 2.5 : 1}
                  />
                  <text
                    x={b.x + b.w / 2} y={b.y + b.h / 2 + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={b.id === 'cpu' ? 16 : 11}
                    fontWeight="700"
                  >
                    {b.nombre}
                  </text>
                </g>
              ))}

              {/* Etiqueta arquitectura */}
              <text x="225" y="295" textAnchor="middle" fontSize="9" fill="#aaa">
                Arquitectura Von Neumann (1945)
              </text>
            </svg>

            {/* Panel de detalle */}
            <div className={styles.detallePanel}>
              {bloqueSeleccionado ? (
                <>
                  <h2 className={styles.detalleTitulo} style={{ color: bloqueSeleccionado.color }}>
                    {bloqueSeleccionado.nombre}
                  </h2>
                  <p className={styles.detalleDesc}>{bloqueSeleccionado.descripcion}</p>
                  <ul className={styles.detalleList}>
                    {bloqueSeleccionado.detalles.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className={styles.detallePlaceholder}>
                  <span>👆</span>
                  <p>Selecciona un bloque del diagrama para ver su descripción</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.vnBox}>
            <h3>Principios de la arquitectura Von Neumann (1945)</h3>
            <ul>
              <li><strong>Programa almacenado:</strong> instrucciones y datos residen en la misma memoria.</li>
              <li><strong>Procesamiento secuencial:</strong> las instrucciones se ejecutan una a una (salvo saltos).</li>
              <li><strong>Bus compartido:</strong> datos e instrucciones usan el mismo canal — el "cuello de botella de Von Neumann".</li>
            </ul>
          </div>
        </section>
      )}

      {/* ── Tab 2: Dentro de la CPU ── */}
      {tabActiva === 'cpu' && (
        <section className={styles.tabContent}>
          <p className={styles.tabIntro}>
            Haz clic en cada componente para conocer su función en detalle.
          </p>
          <div className={styles.cpuGrid}>
            {COMPONENTES_CPU.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setComponenteSeleccionado(componenteSeleccionado?.id === c.id ? null : c)}
                className={`${styles.cpuCard} ${componenteSeleccionado?.id === c.id ? styles.cpuCardActive : ''}`}
                style={{ borderColor: componenteSeleccionado?.id === c.id ? c.color : undefined }}
                aria-pressed={componenteSeleccionado?.id === c.id}
              >
                <span className={styles.cpuIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.cpuSigla} style={{ color: c.color }}>{c.sigla}</span>
                <span className={styles.cpuNombre}>{c.nombre}</span>
                <span className={styles.cpuFuncion}>{c.funcion}</span>
              </button>
            ))}
          </div>

          {componenteSeleccionado && (
            <div className={styles.cpuDetalle} style={{ borderLeftColor: componenteSeleccionado.color }}>
              <h3 style={{ color: componenteSeleccionado.color }}>
                <span aria-hidden="true">{componenteSeleccionado.icono}</span> {componenteSeleccionado.sigla} — {componenteSeleccionado.nombre}
              </h3>
              <p>{componenteSeleccionado.detalle}</p>
            </div>
          )}
        </section>
      )}

      {/* ── Tab 3: Ciclo FDE ── */}
      {tabActiva === 'fde' && (
        <section className={styles.tabContent}>
          <p className={styles.tabIntro}>
            Mini-programa de ejemplo: <code>LOAD A,5 → LOAD B,3 → ADD A,B → STORE C,A</code>.
            Avanza paso a paso para ver cómo la CPU ejecuta cada instrucción.
          </p>

          {/* Barra de progreso */}
          <div className={styles.fdeProgreso}>
            {PASOS_FDE.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPasoFDE(i)}
                className={`${styles.fdeProgresoPunto} ${i === pasoFDE ? styles.fdeProgresoPuntoActivo : ''} ${i < pasoFDE ? styles.fdeProgresoPuntoVisto : ''}`}
                style={{ backgroundColor: i <= pasoFDE ? fasesColores[p.fase] : undefined }}
                aria-label={`Paso ${i + 1}: ${p.fase}`}
                aria-pressed={i === pasoFDE}
                title={`Paso ${i + 1}: ${p.fase}`}
              />
            ))}
          </div>

          {/* Paso actual */}
          <div className={styles.fdePaso} style={{ borderTopColor: pasoActual.colorFase }}>
            <div className={styles.fdeFaseBadge} style={{ backgroundColor: pasoActual.colorFase }}>
              {pasoActual.fase}
            </div>
            <h3 className={styles.fdePasoTitulo}>{pasoActual.titulo}</h3>
            <p className={styles.fdePasoDesc}>{pasoActual.descripcion}</p>

            <div className={styles.fdeRegistros}>
              <h4>Estado de los registros:</h4>
              <div className={styles.fdeRegistrosGrid}>
                {pasoActual.registros.map((r, i) => (
                  <div key={i} className={styles.fdeRegistro}>
                    <span className={styles.fdeRegistroNombre}>{r.nombre}</span>
                    <span className={styles.fdeRegistroValor}>{r.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className={styles.fdeControles}>
            <button
              type="button"
              onClick={() => setPasoFDE(Math.max(0, pasoFDE - 1))}
              disabled={pasoFDE === 0}
              className={styles.fdeBtn}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.fdePasoContador}>
              Paso {pasoFDE + 1} / {PASOS_FDE.length}
            </span>
            <button
              type="button"
              onClick={() => setPasoFDE(Math.min(PASOS_FDE.length - 1, pasoFDE + 1))}
              disabled={pasoFDE === PASOS_FDE.length - 1}
              className={styles.fdeBtn}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
          <div className={styles.fdeReinicio}>
            <button type="button" onClick={() => setPasoFDE(0)} className={styles.fdeBtnReinicio}>
              ↺ Reiniciar
            </button>
          </div>

          {/* Leyenda fases */}
          <div className={styles.fdeLeyenda}>
            {(['Fetch', 'Decode', 'Execute'] as const).map((f) => (
              <div key={f} className={styles.fdeLeyendaItem}>
                <span className={styles.fdeLeyendaColor} style={{ backgroundColor: fasesColores[f] }} />
                <strong>{f}</strong>
                <span>
                  {f === 'Fetch' && 'Traer instrucción de memoria al IR'}
                  {f === 'Decode' && 'Unidad de Control interpreta la instrucción'}
                  {f === 'Execute' && 'ALU opera o la CPU accede a memoria/E/S'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tab 4: Jerarquía de Memoria ── */}
      {tabActiva === 'memoria' && (
        <section className={styles.tabContent}>
          <p className={styles.tabIntro}>
            Cuanto más rápida la memoria, menor es su capacidad y mayor su coste.
            La CPU accede primero a los niveles superiores (más rápidos) antes de bajar a RAM o disco.
          </p>

          <div className={styles.memoriaPiramide}>
            {NIVELES_MEMORIA.map((n) => (
              <div key={n.nombre} className={styles.memoriaFila}>
                <div
                  className={styles.memoriaBarraWrapper}
                  style={{ width: `${n.barraAncho}%` }}
                >
                  <div
                    className={styles.memoriaBarra}
                    style={{ backgroundColor: n.color }}
                  >
                    <span className={styles.memoriaBarraIcono} aria-hidden="true">{n.icono}</span>
                    <span className={styles.memoriaBarraNombre}>{n.nombre}</span>
                  </div>
                </div>
                <div className={styles.memoriaInfo}>
                  <span className={styles.memoriaLatencia} style={{ color: n.color }}>
                    {n.latencia}
                  </span>
                  <span className={styles.memoriaTamano}>{n.tamano}</span>
                  <span className={styles.memoriaCoste}>{n.coste}</span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.memoriaEtiquetas}>
            <span>← Más rápido / Más caro</span>
            <span>Más lento / Más barato →</span>
          </div>

          <div className={styles.memoriaBox}>
            <h3>¿Por qué existe la jerarquía de memoria?</h3>
            <p>
              La CPU puede ejecutar miles de millones de operaciones por segundo, pero acceder a la RAM
              tarda ~100 ns — miles de ciclos de espera. La caché almacena copias de los datos más usados
              cerca de la CPU para reducir esas esperas. El principio de <strong>localidad temporal</strong>
              (si accediste a X, probablemente volverás a acceder a X) y <strong>localidad espacial</strong>
              (si accediste a X, probablemente accederás a X+1) hacen que la caché sea muy eficiente.
            </p>
          </div>
        </section>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="Guía de Arquitectura del Computador"
        subtitle="Conceptos clave, preguntas frecuentes y errores comunes"
        icon="🖥️"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: CISC vs RISC</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>CISC (ej: x86)</th>
                  <th>RISC (ej: ARM)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Nº de instrucciones</strong></td><td>Centenares (complejas)</td><td>Decenas (simples)</td></tr>
                <tr><td><strong>Ciclos por instrucción</strong></td><td>Variable (1–100+)</td><td>Generalmente 1</td></tr>
                <tr><td><strong>Longitud instrucción</strong></td><td>Variable</td><td>Fija (32 bits)</td></tr>
                <tr><td><strong>Registros</strong></td><td>Pocos registros generales</td><td>Muchos registros (16–32+)</td></tr>
                <tr><td><strong>Consumo energético</strong></td><td>Mayor</td><td>Menor — ideal para móviles</td></tr>
                <tr><td><strong>Ejemplos actuales</strong></td><td>Intel/AMD (PC, servidor)</td><td>ARM Cortex, Apple M-series</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guideSection}>
          <h2>¿Dónde aparece en la vida real?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h3>Tu ordenador ejecutando Chrome</h3>
              </div>
              <p className={styles.escenarioTip}>
                El SO carga el ejecutable en RAM, el PC apunta a la primera instrucción y comienza
                el ciclo FDE. La caché L1/L2 guarda las instrucciones más recientes del motor V8
                de JavaScript para no ir a RAM en cada ciclo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
                <h3>Procesador ARM en tu móvil</h3>
              </div>
              <p className={styles.escenarioTip}>
                El Apple M4 o Snapdragon usa arquitectura RISC (ARM). Múltiples núcleos ejecutan
                ciclos FDE en paralelo. La jerarquía de caché tiene 3 niveles para equilibrar
                rendimiento y consumo de batería.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
                <h3>GPU y procesamiento paralelo</h3>
              </div>
              <p className={styles.escenarioTip}>
                Una GPU tiene miles de núcleos simples (shaders) que ejecutan el mismo ciclo FDE
                sobre datos diferentes a la vez. Es la arquitectura SIMD: misma instrucción,
                múltiples datos — perfecta para píxeles o IA.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">☁️</span>
                <h3>Servidores en la nube</h3>
              </div>
              <p className={styles.escenarioTip}>
                Un servidor AWS tiene decenas de núcleos, cientos de GB de RAM y jerarquías de
                caché profundas. La arquitectura Von Neumann es la misma — el cuello de botella
                de Von Neumann persiste incluso en los supercomputadores.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es el "cuello de botella de Von Neumann"?</h4>
              <p>
                En la arquitectura Von Neumann, datos e instrucciones comparten el mismo bus.
                Esto crea un cuello de botella: la CPU no puede buscar la siguiente instrucción
                mientras transfiere datos. La arquitectura Harvard (usada en microcontroladores
                y cachés modernas) separa ambos buses para eliminar este límite.
              </p>
              <p className={styles.faqTip}>💡 <strong>Dato:</strong> Los procesadores modernos usan una arquitectura Harvard modificada internamente, aunque externamente se comporten como Von Neumann.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántos ciclos dura cada fase del ciclo FDE?</h4>
              <p>
                Depende de la instrucción y la arquitectura. En RISC idealmente 1 ciclo por fase
                (3 ciclos totales con pipeline). En CISC puede variar de 1 a cientos de ciclos
                para instrucciones complejas (división, operaciones de cadena).
              </p>
              <p className={styles.faqTip}>💡 <strong>Pipeline:</strong> Los procesadores modernos superponen las fases — mientras ejecutan la instrucción 1, ya están decodificando la 2 y buscando la 3.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa cuando hay un "cache miss"?</h4>
              <p>
                Si el dato no está en L1, el procesador busca en L2, L3 y finalmente RAM.
                Cada nivel añade latencia: un miss en L1 que va a RAM puede costar 200+ ciclos
                de espera. El compilador y el programador pueden optimizar el código para mejorar
                la "localidad de caché".
              </p>
              <p className={styles.faqTip}>💡 Recorrer un array en orden (fila a fila) es mucho más eficiente que en orden aleatorio por el principio de localidad espacial.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué no se hace la caché más grande?</h4>
              <p>
                La caché SRAM (usada en L1/L2) es muy cara de fabricar (ocupa más silicio que
                la DRAM de la RAM). Además, una caché más grande tiene mayor latencia de acceso
                — se pierde parte de la ventaja. El diseño busca el equilibrio óptimo para cada nivel.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay entre un core y un procesador?</h4>
              <p>
                Un core es una unidad completa de ejecución: tiene su propia ALU, UC, registros
                y caché L1/L2. Un procesador moderno integra varios cores en el mismo chip
                (die). Un i9 de Intel puede tener 24 cores — 24 ciclos FDE simultáneos.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo Estudiar Arquitectura de Computadores</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Domina el modelo Von Neumann</h4>
                <p>Entiende los 4 bloques (CPU, memoria, E/S, buses) y sus relaciones. Es la base de todo lo demás.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Aprende el ciclo FDE a mano</h4>
                <p>Ejecuta un programa simple paso a paso en papel, actualizando PC, IR, MAR y MDR en cada fase. Es la mejor forma de interiorizar cómo trabaja la CPU.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Comprende la jerarquía de memoria</h4>
                <p>Relaciona latencia con nivel. Memoriza los órdenes de magnitud: ps (registros), ns (caché/RAM), μs (SSD), ms (HDD). Muchos problemas de rendimiento son problemas de caché.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Estudia CISC vs RISC con ejemplos reales</h4>
                <p>x86 (Intel/AMD) es CISC. ARM (móviles, Apple Silicon) es RISC. RISC-V es la alternativa open-source emergente. Entender sus diferencias explica por qué tu móvil aguanta más batería que tu portátil.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Conecta con sistemas operativos y compiladores</h4>
                <p>El SO gestiona qué programa usa la CPU (scheduler). El compilador convierte tu código en instrucciones de máquina que ejecuta el ciclo FDE. Las tres capas juntas forman el sistema completo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Tips */}
        <section className={styles.guideSection}>
          <h2>Claves para Entender la Arquitectura</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>La caché L1 es la reina</h4>
              <p>El 90% de los accesos se resuelven en L1 (~1 ns). Optimizar para caché tiene más impacto que cambiar el algoritmo en muchos casos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>El pipeline multiplica la velocidad</h4>
              <p>Un pipeline de 5 etapas puede ejecutar 5 instrucciones en paralelo (en diferentes fases). Los procesadores modernos tienen pipelines de 15–20 etapas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📍</span>
              <h4>El PC es el hilo conductor</h4>
              <p>Seguir el valor del PC a través del ciclo FDE es la forma más clara de entender la ejecución de cualquier programa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏗️</span>
              <h4>Von Neumann sigue vigente</h4>
              <p>Todos los computadores actuales — desde microcontroladores de 8 bits hasta supercomputadores — siguen el modelo de Von Neumann de 1945.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box v2.0 */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes al Estudiar Arquitectura</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Confundir RAM con disco duro:</strong> La RAM es volátil y rápida (~100 ns); el disco es persistente y lento (~ms). Son niveles distintos de la jerarquía.</li>
            <li><strong>❌ "Más GHz = siempre más rápido":</strong> La frecuencia importa, pero el IPC (instrucciones por ciclo), el número de núcleos y la eficiencia de caché pueden superar a una mayor frecuencia con peor arquitectura.</li>
            <li><strong>❌ Creer que el ciclo FDE es el único modelo:</strong> Los procesadores superscalares, VLIW y los cores de GPU ejecutan varias instrucciones por ciclo o miles en paralelo — el FDE es el modelo base, no el único.</li>
            <li><strong>❌ Olvidar que el PC se incrementa en el Fetch:</strong> El PC apunta a la siguiente instrucción antes de ejecutar la actual. Es el error más frecuente al simular el ciclo FDE a mano.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-arquitectura-computador')} />
      <ShareCard appName="visualizador-arquitectura-computador" />
      <Footer appName="visualizador-arquitectura-computador" />
    </div>
  );
}
