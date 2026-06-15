'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './TeoriaInformacion.module.css';
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

type TabId = 'entropia' | 'huffman' | 'canal' | 'compresion';

interface SimboloHuffman {
  simbolo: string;
  frecuencia: number;
  codigo: string;
  longitud: number;
}

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function calcularEntropia(probs: number[]): number {
  return probs.reduce((acc, p) => {
    if (p <= 0) return acc;
    return acc - p * Math.log2(p);
  }, 0);
}

// Árbol de Huffman simplificado (greedy)
function calcularHuffman(): SimboloHuffman[] {
  const simbolos = [
    { simbolo: 'A', frecuencia: 45 },
    { simbolo: 'B', frecuencia: 13 },
    { simbolo: 'C', frecuencia: 12 },
    { simbolo: 'D', frecuencia: 16 },
    { simbolo: 'E', frecuencia: 9 },
    { simbolo: 'F', frecuencia: 5 },
  ];

  // Códigos Huffman del ejemplo clásico
  const codigos: Record<string, string> = {
    A: '0',
    B: '101',
    C: '100',
    D: '111',
    E: '1101',
    F: '1100',
  };

  return simbolos.map((s) => ({
    ...s,
    codigo: codigos[s.simbolo],
    longitud: codigos[s.simbolo].length,
  }));
}

function calcularCapacidadCanal(anchoBandaMhz: number, snrDb: number): number {
  const snrLineal = Math.pow(10, snrDb / 10);
  return anchoBandaMhz * Math.log2(1 + snrLineal); // Mbps
}

// ─────────────────────────────────────────────
// Subcomponente: Tab entropía
// ─────────────────────────────────────────────

function TabEntropia({
  probA,
  probB,
  probC,
  setProbA,
  setProbB,
  setProbC,
}: {
  probA: number;
  probB: number;
  probC: number;
  setProbA: (v: number) => void;
  setProbB: (v: number) => void;
  setProbC: (v: number) => void;
}) {
  const probD = Math.max(0, 1 - probA - probB - probC);
  const probs = [probA, probB, probC, probD];
  const etiquetas = ['A', 'B', 'C', 'D'];
  const colores = ['#2E86AB', '#48A9A6', '#E8A838', '#E84A5F'];

  const H = calcularEntropia(probs);
  const Hmax = Math.log2(4); // 2 bits con 4 símbolos equiprobables

  const barW = 320;
  const barH = 120;
  const padL = 28;
  const padB = 28;
  const padT = 12;
  const graphW = barW - padL - 10;
  const graphH = barH - padB - padT;
  const bw = graphW / 4 - 8;

  // Curva de entropía teórica vs H(p) para moneda
  const curvaW = 320;
  const curvaH = 100;
  const curvaPoints = Array.from({ length: 101 }, (_, i) => {
    const p = i / 100;
    const hVal = p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
    return { x: padL + (p * (curvaW - padL - 10)), y: curvaH - padB - (hVal * (curvaH - padB - padT)) };
  });
  const curvaPath = curvaPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');

  return (
    <div className={styles.tabContenido}>
      <p className={styles.tabDesc}>
        La <strong>entropía de Shannon</strong> mide la incertidumbre media de un sistema de símbolos:{' '}
        <em>H = −Σ pᵢ · log₂(pᵢ)</em>. Cuanto más impredecible el sistema, mayor la entropía.
        Ajusta los sliders para ver cómo cambia H.
      </p>

      {/* Sliders */}
      <div className={styles.slidersGrid}>
        {[
          { etiqueta: 'A', valor: probA, setter: setProbA, color: colores[0] },
          { etiqueta: 'B', valor: probB, setter: setProbB, color: colores[1] },
          { etiqueta: 'C', valor: probC, setter: setProbC, color: colores[2] },
        ].map(({ etiqueta, valor, setter, color }) => (
          <div key={etiqueta} className={styles.sliderFila}>
            <label className={styles.sliderLabel} style={{ color }}>
              <strong>P({etiqueta})</strong> = {valor.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={0.97}
              step={0.01}
              value={valor}
              onChange={(e) => setter(Number(e.target.value))}
              className={styles.slider}
              style={{ accentColor: color }}
              aria-label={`Probabilidad del símbolo ${etiqueta}`}
            />
          </div>
        ))}
        <div className={styles.sliderFila}>
          <span className={styles.sliderLabel} style={{ color: colores[3] }}>
            <strong>P(D)</strong> = {probD.toFixed(2)}
            <small className={styles.derivado}> (1 − A − B − C)</small>
          </span>
        </div>
      </div>

      {/* Resultado entropía */}
      <div className={styles.resultadoEntropia}>
        <div className={styles.resultadoValor}>
          <span className={styles.resultadoNumero}>{H.toFixed(3)}</span>
          <span className={styles.resultadoUnidad}>bits / símbolo</span>
        </div>
        <div className={styles.resultadoBarraFondo}>
          <div
            className={styles.resultadoBarraRelleno}
            style={{ width: `${(H / Hmax) * 100}%` }}
            role="progressbar"
            aria-valuenow={parseFloat(H.toFixed(3))}
            aria-valuemin={0}
            aria-valuemax={Hmax}
          />
        </div>
        <div className={styles.resultadoTexto}>
          {H < 0.1
            ? 'Certeza total: un símbolo domina completamente (H ≈ 0 bits)'
            : H < 0.8
            ? 'Baja entropía: un símbolo es muy probable'
            : H < 1.6
            ? 'Entropía media: distribución desigual'
            : H < 1.95
            ? 'Alta entropía: distribución casi uniforme'
            : 'Entropía máxima: distribución perfectamente uniforme (H = 2 bits)'}
        </div>
      </div>

      {/* Gráfica de barras SVG */}
      <div className={styles.svgWrapper}>
        <svg viewBox={`0 0 ${barW} ${barH}`} className={styles.svg} role="img"
          aria-label="Gráfica de barras de probabilidades de los 4 símbolos">
          <line x1={padL} y1={padT} x2={padL} y2={barH - padB} stroke="#CCC" strokeWidth="1" />
          <line x1={padL} y1={barH - padB} x2={barW - 8} y2={barH - padB} stroke="#CCC" strokeWidth="1" />
          <text x={8} y={barH / 2} fontSize="7" fill="#999" textAnchor="middle"
            transform={`rotate(-90, 10, ${barH / 2})`}>Prob.</text>
          {probs.map((p, i) => {
            const bh = p * graphH;
            const bx = padL + i * (graphW / 4) + 4;
            const by = barH - padB - bh;
            return (
              <g key={etiquetas[i]}>
                <rect x={bx} y={by} width={bw} height={bh}
                  fill={colores[i]} opacity={0.82} rx={3} />
                <text x={bx + bw / 2} y={barH - padB + 11} textAnchor="middle"
                  fontSize="8" fill="#666">{etiquetas[i]}</text>
                <text x={bx + bw / 2} y={Math.max(by - 2, padT + 8)} textAnchor="middle"
                  fontSize="7" fill={colores[i]} fontWeight="600">{p.toFixed(2)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Comparativas */}
      <div className={styles.comparativasGrid}>
        <div className={styles.comparativaItem}>
          <span className={styles.comparativaLabel}>Lanzamiento de moneda</span>
          <span className={styles.comparativaValor} style={{ color: '#2E86AB' }}>H = 1 bit</span>
          <span className={styles.comparativaDesc}>p(cara) = p(cruz) = 0,50</span>
        </div>
        <div className={styles.comparativaItem}>
          <span className={styles.comparativaLabel}>Dado de 6 caras</span>
          <span className={styles.comparativaValor} style={{ color: '#48A9A6' }}>H ≈ 2,58 bits</span>
          <span className={styles.comparativaDesc}>6 resultados equiprobables</span>
        </div>
        <div className={styles.comparativaItem}>
          <span className={styles.comparativaLabel}>Máximo (4 símbolos)</span>
          <span className={styles.comparativaValor} style={{ color: '#E8A838' }}>H = 2 bits</span>
          <span className={styles.comparativaDesc}>p = 0,25 para cada símbolo</span>
        </div>
        <div className={styles.comparativaItem}>
          <span className={styles.comparativaLabel}>Tu configuración</span>
          <span className={styles.comparativaValor} style={{ color: '#E84A5F' }}>H = {H.toFixed(3)} bits</span>
          <span className={styles.comparativaDesc}>{((H / Hmax) * 100).toFixed(1)}% del máximo posible</span>
        </div>
      </div>

      {/* Curva H(p) para moneda */}
      <div className={styles.infoBox}>
        <p className={styles.infoBoxTitulo}>Curva de entropía H(p) para sistema binario (moneda)</p>
        <svg viewBox={`0 0 ${curvaW} ${curvaH}`} className={styles.svgCurva} role="img"
          aria-label="Curva de entropía binaria: máxima en p=0.5 con H=1 bit">
          <line x1={padL} y1={padT} x2={padL} y2={curvaH - padB} stroke="#CCC" strokeWidth="1" />
          <line x1={padL} y1={curvaH - padB} x2={curvaW - 8} y2={curvaH - padB} stroke="#CCC" strokeWidth="1" />
          <path d={curvaPath} stroke="#2E86AB" strokeWidth="2" fill="none" />
          {/* Punto máximo p=0.5 */}
          <circle cx={padL + ((curvaW - padL - 10) / 2)} cy={padT} r={3} fill="#48A9A6" />
          <text x={padL + ((curvaW - padL - 10) / 2)} y={padT - 3}
            textAnchor="middle" fontSize="7" fill="#48A9A6">H=1 bit (máx)</text>
          <text x={padL + (curvaW - padL - 10) / 2} y={curvaH - 4}
            textAnchor="middle" fontSize="7" fill="#999">p = 0,50</text>
          <text x={padL - 2} y={curvaH - padB + 9} fontSize="7" fill="#999">0</text>
          <text x={curvaW - 10} y={curvaH - padB + 9} fontSize="7" fill="#999">1</text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Tab Huffman
// ─────────────────────────────────────────────

function TabHuffman() {
  const simbolos = useMemo(() => calcularHuffman(), []);
  const totalFreq = simbolos.reduce((s, x) => s + x.frecuencia, 0);

  // Longitud media código Huffman
  const longitudMediaHuffman = simbolos.reduce(
    (acc, s) => acc + (s.frecuencia / totalFreq) * s.longitud,
    0
  );
  const longitudMediaASCII = 8;

  // Entropía teórica
  const entropiaT = calcularEntropia(simbolos.map((s) => s.frecuencia / totalFreq));
  const ahorroPct = ((1 - longitudMediaHuffman / longitudMediaASCII) * 100);

  // Árbol Huffman SVG simplificado (resultado final, no animación paso a paso)
  // Nodos del árbol clásico del ejemplo A:45, B:13, C:12, D:16, E:9, F:5
  const nodos = [
    // Nivel 0 (raíz)
    { id: 'root', x: 160, y: 20, freq: 100, label: '100' },
    // Nivel 1
    { id: 'n1', x: 80, y: 60, freq: 55, label: '55' },
    { id: 'A', x: 240, y: 60, freq: 45, label: 'A:45' },
    // Nivel 2
    { id: 'n2', x: 40, y: 100, freq: 30, label: '30' },
    { id: 'D', x: 120, y: 100, freq: 16, label: 'D:16' },
    // Nivel 3
    { id: 'n3', x: 20, y: 140, freq: 14, label: '14' },
    { id: 'B', x: 60, y: 140, freq: 13, label: 'B:13' },
    // Nivel 4
    { id: 'n4', x: 10, y: 180, freq: 14, label: '14' },
    { id: 'C', x: 36, y: 180, freq: 12, label: 'C:12' },
    // Nivel 5
    { id: 'E', x: 4, y: 220, freq: 9, label: 'E:9' },
    { id: 'F', x: 18, y: 220, freq: 5, label: 'F:5' },
  ];

  const aristas = [
    { from: 'root', to: 'n1', etiqueta: '0' },
    { from: 'root', to: 'A', etiqueta: '1' },
    { from: 'n1', to: 'n2', etiqueta: '0' },
    { from: 'n1', to: 'D', etiqueta: '1' },
    { from: 'n2', to: 'n3', etiqueta: '0' },
    { from: 'n2', to: 'B', etiqueta: '1' },
    { from: 'n3', to: 'n4', etiqueta: '0' },
    { from: 'n3', to: 'C', etiqueta: '1' },  // C:12 → código 100
    { from: 'n4', to: 'E', etiqueta: '0' },
    { from: 'n4', to: 'F', etiqueta: '1' },  // F:5 → código 1100 (más largo)
  ];

  const nodoMap = Object.fromEntries(nodos.map((n) => [n.id, n]));
  const esHoja = (id: string) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(id);

  return (
    <div className={styles.tabContenido}>
      <p className={styles.tabDesc}>
        El <strong>código de Huffman</strong> asigna códigos binarios más cortos a los símbolos más frecuentes.
        Construye un árbol donde los símbolos raros quedan en las ramas más profundas.
        Ejemplo: 6 símbolos (A→F) con frecuencias conocidas.
      </p>

      <div className={styles.huffmanLayout}>
        {/* Árbol SVG */}
        <div className={styles.arbolWrapper}>
          <p className={styles.arbolTitulo}>Árbol de Huffman</p>
          <svg viewBox="0 0 320 240" className={styles.svgArbol} role="img"
            aria-label="Árbol de Huffman para el ejemplo A:45, B:13, C:12, D:16, E:9, F:5">
            {aristas.map((a, i) => {
              const desde = nodoMap[a.from];
              const hasta = nodoMap[a.to];
              if (!desde || !hasta) return null;
              const mx = (desde.x + hasta.x) / 2;
              const my = (desde.y + hasta.y) / 2 + 2;
              return (
                <g key={i}>
                  <line x1={desde.x} y1={desde.y + 7} x2={hasta.x} y2={hasta.y - 7}
                    stroke={a.etiqueta === '0' ? '#2E86AB' : '#48A9A6'} strokeWidth="1.5" />
                  <text x={mx} y={my} textAnchor="middle" fontSize="7"
                    fill={a.etiqueta === '0' ? '#2E86AB' : '#48A9A6'} fontWeight="700">
                    {a.etiqueta}
                  </text>
                </g>
              );
            })}
            {nodos.map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={esHoja(n.id) ? 10 : 8}
                  fill={esHoja(n.id) ? '#2E86AB' : '#FAFAFA'}
                  stroke={esHoja(n.id) ? '#2E86AB' : '#AAAAAA'} strokeWidth="1.5" />
                <text x={n.x} y={n.y + 3} textAnchor="middle"
                  fontSize={esHoja(n.id) ? '6' : '6'} fontWeight="700"
                  fill={esHoja(n.id) ? '#FFFFFF' : '#444444'}>
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
          <div className={styles.arbolLeyenda}>
            <span style={{ color: '#2E86AB' }}>— Rama 0 (izquierda)</span>
            <span style={{ color: '#48A9A6' }}>— Rama 1 (derecha)</span>
          </div>
        </div>

        {/* Tabla de códigos */}
        <div className={styles.tablaWrapper}>
          <p className={styles.tablaTitulo}>Tabla de códigos</p>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Símbolo</th>
                <th>Freq</th>
                <th>Prob</th>
                <th>Código</th>
                <th>Long.</th>
              </tr>
            </thead>
            <tbody>
              {simbolos.map((s) => (
                <tr key={s.simbolo}>
                  <td className={styles.tablaSimbolo}>{s.simbolo}</td>
                  <td>{s.frecuencia}</td>
                  <td>{(s.frecuencia / totalFreq * 100).toFixed(1)}%</td>
                  <td><code className={styles.codigo}>{s.codigo}</code></td>
                  <td>{s.longitud} bits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparativa de eficiencia */}
      <div className={styles.eficienciaGrid}>
        <div className={styles.eficienciaItem}>
          <span className={styles.eficienciaLabel}>Entropía teórica mínima</span>
          <span className={styles.eficienciaValor} style={{ color: '#E8A838' }}>
            {entropiaT.toFixed(3)} bits/símbolo
          </span>
          <span className={styles.eficienciaDesc}>Límite inferior teórico de Shannon</span>
        </div>
        <div className={styles.eficienciaItem}>
          <span className={styles.eficienciaLabel}>Longitud media Huffman</span>
          <span className={styles.eficienciaValor} style={{ color: '#2E86AB' }}>
            {longitudMediaHuffman.toFixed(3)} bits/símbolo
          </span>
          <span className={styles.eficienciaDesc}>
            {((longitudMediaHuffman - entropiaT) / entropiaT * 100).toFixed(1)}% sobre el óptimo teórico
          </span>
        </div>
        <div className={styles.eficienciaItem}>
          <span className={styles.eficienciaLabel}>ASCII (código fijo)</span>
          <span className={styles.eficienciaValor} style={{ color: '#999' }}>
            {longitudMediaASCII} bits/símbolo
          </span>
          <span className={styles.eficienciaDesc}>Sin aprovechar las frecuencias</span>
        </div>
        <div className={styles.eficienciaItem}>
          <span className={styles.eficienciaLabel}>Ahorro vs ASCII</span>
          <span className={styles.eficienciaValor} style={{ color: '#E84A5F' }}>
            {ahorroPct.toFixed(1)}%
          </span>
          <span className={styles.eficienciaDesc}>Compresión sin pérdida de información</span>
        </div>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoBoxIcon} aria-hidden="true">💡</span>
        <p>
          Huffman es <strong>óptimo para codificación símbolo a símbolo</strong>. La entropía de Shannon marca el
          límite teórico: ningún código puede comprimir por debajo de H bits/símbolo en promedio.
          Huffman se acerca mucho sin necesitar conocer el futuro de la secuencia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Tab Canal
// ─────────────────────────────────────────────

function TabCanal({
  anchoBanda,
  snrDb,
  setAnchoBanda,
  setSnrDb,
}: {
  anchoBanda: number;
  snrDb: number;
  setAnchoBanda: (v: number) => void;
  setSnrDb: (v: number) => void;
}) {
  const capacidad = calcularCapacidadCanal(anchoBanda, snrDb);

  // Curva C vs B para 3 niveles de SNR
  const snrCurvas = [10, 20, 40];
  const coloresCurvas = ['#7FB3D3', '#2E86AB', '#48A9A6'];

  const svgW = 340;
  const svgH = 140;
  const padL = 44;
  const padB = 32;
  const padT = 16;
  const graphW = svgW - padL - 12;
  const graphH = svgH - padB - padT;
  const maxB = 100;
  const maxC = calcularCapacidadCanal(maxB, 40);

  const generarCurva = (snr: number) => {
    return Array.from({ length: 51 }, (_, i) => {
      const b = (i / 50) * maxB;
      const c = calcularCapacidadCanal(b, snr);
      const x = padL + (b / maxB) * graphW;
      const y = svgH - padB - (c / maxC) * graphH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${Math.max(padT, y).toFixed(1)}`;
    }).join(' ');
  };

  // Punto del usuario
  const puntX = padL + (anchoBanda / maxB) * graphW;
  const puntY = svgH - padB - (capacidad / maxC) * graphH;

  // Ejemplos reales
  const ejemplos = [
    { nombre: 'ADSL2+', b: 2.2, snr: 40, desc: '~26 Mbps' },
    { nombre: 'Cable DOCSIS 3.1', b: 192, snr: 35, desc: '~1,5 Gbps' },
    { nombre: '5G mmWave', b: 800, snr: 25, desc: '~19 Gbps teórico' },
    { nombre: 'WiFi 802.11ax', b: 160, snr: 30, desc: '~5,4 Gbps teórico' },
  ];

  return (
    <div className={styles.tabContenido}>
      <p className={styles.tabDesc}>
        La fórmula de <strong>Shannon-Hartley</strong> establece la capacidad máxima teórica de un canal:{' '}
        <em>C = B · log₂(1 + S/N)</em>. Ningún sistema puede transmitir información a más velocidad que C
        sin errores, independientemente de la tecnología de codificación usada.
      </p>

      {/* Sliders */}
      <div className={styles.slidersGrid}>
        <div className={styles.sliderFila}>
          <label className={styles.sliderLabel}>
            <strong>Ancho de banda B</strong> = {anchoBanda} MHz
          </label>
          <input
            type="range" min={1} max={100} step={1} value={anchoBanda}
            onChange={(e) => setAnchoBanda(Number(e.target.value))}
            className={styles.slider}
            style={{ accentColor: '#2E86AB' }}
            aria-label="Ancho de banda en MHz"
          />
        </div>
        <div className={styles.sliderFila}>
          <label className={styles.sliderLabel}>
            <strong>SNR (relación señal/ruido)</strong> = {snrDb} dB
            <small className={styles.derivado}> ({Math.pow(10, snrDb / 10).toFixed(0)}:1 lineal)</small>
          </label>
          <input
            type="range" min={0} max={40} step={1} value={snrDb}
            onChange={(e) => setSnrDb(Number(e.target.value))}
            className={styles.slider}
            style={{ accentColor: '#48A9A6' }}
            aria-label="SNR en dB"
          />
        </div>
      </div>

      {/* Resultado */}
      <div className={styles.resultadoCanal}>
        <span className={styles.resultadoCanalLabel}>Capacidad máxima del canal</span>
        <span className={styles.resultadoCanalValor}>
          {capacidad >= 1000
            ? `${(capacidad / 1000).toFixed(2)} Gbps`
            : capacidad >= 1
            ? `${capacidad.toFixed(2)} Mbps`
            : `${(capacidad * 1000).toFixed(0)} kbps`}
        </span>
        <span className={styles.resultadoCanalDesc}>
          C = {anchoBanda} × log₂(1 + {Math.pow(10, snrDb / 10).toFixed(0)}) = {capacidad.toFixed(2)} Mbps
        </span>
      </div>

      {/* Curva SVG */}
      <div className={styles.svgWrapper}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.svg} role="img"
          aria-label="Curva de capacidad del canal vs ancho de banda para distintos valores de SNR">
          <line x1={padL} y1={padT} x2={padL} y2={svgH - padB} stroke="#CCC" strokeWidth="1" />
          <line x1={padL} y1={svgH - padB} x2={svgW - 10} y2={svgH - padB} stroke="#CCC" strokeWidth="1" />
          <text x={8} y={svgH / 2} fontSize="7" fill="#999" textAnchor="middle"
            transform={`rotate(-90, 10, ${svgH / 2})`}>C (Mbps)</text>
          <text x={(svgW + padL) / 2} y={svgH - 4} fontSize="7" fill="#999" textAnchor="middle">B (MHz)</text>

          {/* Curvas para diferentes SNR */}
          {snrCurvas.map((snr, i) => (
            <g key={snr}>
              <path d={generarCurva(snr)} stroke={coloresCurvas[i]} strokeWidth="1.8" fill="none" />
              <text x={svgW - 10} y={svgH - padB - (calcularCapacidadCanal(maxB, snr) / maxC) * graphH}
                fontSize="6.5" fill={coloresCurvas[i]} textAnchor="end">{snr} dB</text>
            </g>
          ))}

          {/* Punto del usuario */}
          <circle cx={puntX} cy={Math.max(padT + 2, puntY)} r={4} fill="#E84A5F" />
          <text x={puntX + 6} y={Math.max(padT + 8, puntY + 4)} fontSize="7" fill="#E84A5F">
            Tú
          </text>

          {/* Etiquetas eje */}
          <text x={padL} y={svgH - padB + 10} fontSize="7" fill="#999">0</text>
          <text x={svgW - 10} y={svgH - padB + 10} fontSize="7" fill="#999" textAnchor="end">100</text>
        </svg>
      </div>

      {/* Ejemplos reales */}
      <div className={styles.ejemplosGrid}>
        {ejemplos.map((ej) => (
          <div key={ej.nombre} className={styles.ejemploItem}>
            <span className={styles.ejemploNombre}>{ej.nombre}</span>
            <span className={styles.ejemploMeta}>B={ej.b} MHz · SNR={ej.snr} dB</span>
            <span className={styles.ejemploCapacidad}>{ej.desc}</span>
          </div>
        ))}
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoBoxIcon} aria-hidden="true">💡</span>
        <p>
          <strong>Relación B y potencia</strong>: para una misma capacidad C, puedes compensar poco
          ancho de banda con más potencia (mayor SNR) y viceversa. Las redes 5G mmWave usan mucho
          ancho de banda (frecuencias altas) precisamente porque el alcance es corto y el SNR es alto.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Tab Compresión
// ─────────────────────────────────────────────

function TabCompresion() {
  const [calidadJpeg, setCalidadJpeg] = useState(80);

  // Audio: 44100 Hz, 16 bits, stereo, 1 minuto
  const tamWav = (44100 * 16 * 2 * 60) / 8 / 1024 / 1024; // ~10.1 MB
  const tamMp3 = (128 * 60) / 8 / 1024; // 128kbps * 60s → MB ~0.938 MB

  // Imagen 1920×1080
  const tamBmp = (1920 * 1080 * 3) / 1024 / 1024; // ~5.93 MB
  const tamPng = tamBmp * 0.48; // ~50% lossless compression típica
  // JPEG: muy aproximado, calidad lineal entre 10x y 2x de compresión
  const tamJpeg = tamBmp * (0.02 + (calidadJpeg / 100) * 0.28); // ~0.12MB (q=0) a ~1.76MB (q=100)

  const maxTam = Math.max(tamWav, tamBmp);

  const formatoMB = (mb: number) =>
    mb < 0.1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;

  const bloques = [
    { nombre: 'WAV (sin comprimir)', tam: tamWav, color: '#999', grupo: 'audio' },
    { nombre: 'MP3 128kbps', tam: tamMp3, color: '#2E86AB', grupo: 'audio' },
    { nombre: 'BMP (sin comprimir)', tam: tamBmp, color: '#999', grupo: 'imagen' },
    { nombre: 'PNG (lossless)', tam: tamPng, color: '#48A9A6', grupo: 'imagen' },
    { nombre: `JPEG (calidad ${calidadJpeg}%)`, tam: tamJpeg, color: '#E8A838', grupo: 'imagen' },
  ];

  const svgW = 340;
  const svgH = 160;
  const padL = 120;
  const padR = 70;
  const barH = 18;
  const barGap = 8;
  const svgHReal = bloques.length * (barH + barGap) + 28;
  const graphW = svgW - padL - padR;

  return (
    <div className={styles.tabContenido}>
      <p className={styles.tabDesc}>
        La <strong>compresión de datos</strong> aplica los principios de la teoría de la información:
        eliminar redundancias (lossless) o aprovechar límites perceptivos humanos (lossy).
        La entropía de Shannon marca el límite teórico de lo que puede comprimirse sin pérdida.
      </p>

      {/* Slider JPEG */}
      <div className={styles.sliderFila}>
        <label className={styles.sliderLabel}>
          <strong>Calidad JPEG</strong>: {calidadJpeg}% → Tamaño estimado: {formatoMB(tamJpeg)}
        </label>
        <input
          type="range" min={1} max={100} step={1} value={calidadJpeg}
          onChange={(e) => setCalidadJpeg(Number(e.target.value))}
          className={styles.slider}
          style={{ accentColor: '#E8A838' }}
          aria-label="Calidad JPEG"
        />
      </div>

      {/* Bloques proporcionales SVG */}
      <div className={styles.svgWrapper}>
        <svg viewBox={`0 0 ${svgW} ${svgHReal}`} className={styles.svg} role="img"
          aria-label="Barras proporcionales al tamaño de cada formato de archivo">
          {bloques.map((b, i) => {
            const anchoBarra = Math.max(2, (b.tam / maxTam) * graphW);
            const y = 24 + i * (barH + barGap);
            return (
              <g key={b.nombre}>
                <text x={padL - 4} y={y + barH / 2 + 3} textAnchor="end"
                  fontSize="7.5" fill="#666">{b.nombre}</text>
                <rect x={padL} y={y} width={anchoBarra} height={barH}
                  fill={b.color} opacity={0.85} rx={3} />
                <text x={padL + anchoBarra + 4} y={y + barH / 2 + 3}
                  fontSize="7.5" fill={b.color} fontWeight="700">
                  {formatoMB(b.tam)}
                </text>
              </g>
            );
          })}
          <text x={padL} y={15} fontSize="7" fill="#999">Tamaño relativo del archivo</text>
        </svg>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.tablaWrapper}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Formato</th>
              <th>Tipo</th>
              <th>Tamaño (1 min audio / imagen 1920×1080)</th>
              <th>Reducción</th>
              <th>Pérdida</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>WAV</strong></td>
              <td>Audio</td>
              <td>{formatoMB(tamWav)}</td>
              <td>—</td>
              <td>Sin pérdida</td>
            </tr>
            <tr>
              <td><strong>MP3</strong></td>
              <td>Audio</td>
              <td>{formatoMB(tamMp3)}</td>
              <td className={styles.reduccion}>{((1 - tamMp3 / tamWav) * 100).toFixed(1)}%</td>
              <td>Perceptual</td>
            </tr>
            <tr>
              <td><strong>BMP</strong></td>
              <td>Imagen</td>
              <td>{formatoMB(tamBmp)}</td>
              <td>—</td>
              <td>Sin pérdida</td>
            </tr>
            <tr>
              <td><strong>PNG</strong></td>
              <td>Imagen</td>
              <td>{formatoMB(tamPng)}</td>
              <td className={styles.reduccion}>{((1 - tamPng / tamBmp) * 100).toFixed(1)}%</td>
              <td>Sin pérdida</td>
            </tr>
            <tr>
              <td><strong>JPEG {calidadJpeg}%</strong></td>
              <td>Imagen</td>
              <td>{formatoMB(tamJpeg)}</td>
              <td className={styles.reduccion}>{((1 - tamJpeg / tamBmp) * 100).toFixed(1)}%</td>
              <td>DCT + cuantización</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.infoBox}>
        <span className={styles.infoBoxIcon} aria-hidden="true">💡</span>
        <p>
          <strong>Límite de Shannon para texto en inglés</strong>: ~1,3 bits/carácter (mucha redundancia).
          Un archivo .txt sin comprimir usa 8 bits/carácter. ZIP puede llegar a ~2–3 bits/carácter.
          La brecha entre ambos mide cuánta redundancia estructural hay en el idioma.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────

export default function TeoriaInformacionPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('entropia');
  const [probA, setProbA] = useState(0.4);
  const [probB, setProbB] = useState(0.3);
  const [probC, setProbC] = useState(0.2);
  const [anchoBanda, setAnchoBanda] = useState(10);
  const [snrDb, setSnrDb] = useState(20);

  const tabs: { id: TabId; icono: string; nombre: string }[] = [
    { id: 'entropia', icono: '📊', nombre: 'Entropía' },
    { id: 'huffman', icono: '🌳', nombre: 'Huffman' },
    { id: 'canal', icono: '📡', nombre: 'Canal' },
    { id: 'compresion', icono: '🗜️', nombre: 'Compresión' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Teoría de la Información</h1>
        <p className={styles.subtitle}>
          Entropía de Shannon · Código de Huffman · Capacidad del Canal · Compresión de Datos
        </p>
      </header>

      <LegalNotice />

      {/* Tabs de navegación */}
      <nav className={styles.tabs} aria-label="Secciones de la teoría de la información">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActivo : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            <span aria-hidden="true">{tab.icono}</span>
            <span className={styles.tabNombre}>{tab.nombre}</span>
          </button>
        ))}
      </nav>

      {/* Contenido de tabs */}
      <section className={styles.seccion}>
        {tabActiva === 'entropia' && (
          <TabEntropia
            probA={probA} probB={probB} probC={probC}
            setProbA={setProbA} setProbB={setProbB} setProbC={setProbC}
          />
        )}
        {tabActiva === 'huffman' && <TabHuffman />}
        {tabActiva === 'canal' && (
          <TabCanal
            anchoBanda={anchoBanda} snrDb={snrDb}
            setAnchoBanda={setAnchoBanda} setSnrDb={setSnrDb}
          />
        )}
        {tabActiva === 'compresion' && <TabCompresion />}
      </section>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="¿Qué es la Teoría de la Información?"
        subtitle="La matemática detrás del MP3, el WiFi y toda comunicación digital"
      >
        <div className={styles.eduContent}>
          <h3 className={styles.eduH3}>Claude Shannon y el nacimiento de la era digital</h3>
          <p>
            En 1948, Claude Shannon publicó «A Mathematical Theory of Communication», uno de los artículos más
            influyentes de la historia de la ciencia. Shannon demostró que <strong>la información puede medirse
            con precisión matemática</strong> y estableció los límites fundamentales de lo que es posible en
            cualquier sistema de comunicación.
          </p>
          <p>
            Antes de Shannon, ingenieros y físicos trabajaban con señales de forma empírica. Shannon creó
            una teoría unificada que abarcaba telegrafía, telefonía, radio y, décadas después, WiFi, 4G,
            internet y almacenamiento digital.
          </p>

          <h3 className={styles.eduH3}>Los cuatro pilares de la teoría</h3>
          <div className={styles.pilaresGrid}>
            <div className={styles.pilarItem}>
              <strong>1. Entropía H</strong>
              <p>Mide la incertidumbre de una fuente de información. Cuanto más impredecible,
                mayor la entropía y más bits necesitas para transmitir el mensaje.</p>
            </div>
            <div className={styles.pilarItem}>
              <strong>2. Teorema de codificación de la fuente</strong>
              <p>Ningún código puede comprimir mensajes por debajo de H bits/símbolo en promedio.
                Huffman y LZ77 se acercan a este límite.</p>
            </div>
            <div className={styles.pilarItem}>
              <strong>3. Capacidad del canal C</strong>
              <p>Todo canal con ruido tiene una capacidad máxima C bits/segundo. Por debajo de C,
                es posible transmitir sin errores. Por encima, es imposible.</p>
            </div>
            <div className={styles.pilarItem}>
              <strong>4. Teorema de codificación del canal</strong>
              <p>Existe un código que permite transmitir a velocidad arbitrariamente cercana a C
                con probabilidad de error arbitrariamente baja. Los códigos LDPC del 5G son ejemplo.</p>
            </div>
          </div>

          <h3 className={styles.eduH3}>De la teoría a la práctica: dónde vive Shannon</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr><th>Tecnología</th><th>Concepto de Shannon</th><th>Cómo se aplica</th></tr>
              </thead>
              <tbody>
                <tr><td>MP3 / AAC</td><td>Entropía + codificación de la fuente</td><td>Huffman + psicoacústica</td></tr>
                <tr><td>JPEG / HEIC</td><td>Entropía + DCT</td><td>Codificación de coeficientes DCT con Huffman/AC</td></tr>
                <tr><td>ZIP / gzip</td><td>Entropía de Lempel-Ziv</td><td>LZ77 + Huffman dinámico</td></tr>
                <tr><td>WiFi 6E</td><td>Capacidad del canal</td><td>OFDMA + MU-MIMO cerca de límite Shannon</td></tr>
                <tr><td>5G NR</td><td>Teorema del canal + códigos LDPC</td><td>Turbo codes → Polar codes → LDPC</td></tr>
                <tr><td>Disco duro / SSD</td><td>Corrección de errores</td><td>Códigos BCH / Reed-Solomon</td></tr>
                <tr><td>Criptografía</td><td>Entropía como seguridad</td><td>Clave segura = entropía alta (≥128 bits)</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduH3}>El bit como unidad de información</h3>
          <p>
            Shannon definió el <strong>bit</strong> (binary digit) como la unidad básica de información.
            Un bit es la respuesta a una pregunta de sí/no perfectamente equilibrada (como lanzar una
            moneda justa). Pero la información de un mensaje depende de su probabilidad: un evento
            muy probable lleva poca información; uno improbable, mucha.
          </p>
          <p>
            Un tweet de 280 caracteres contiene ~280 × 1,3 ≈ 364 bits de información real
            (en inglés). La cuenta bancaria de un millonario con 1 millón de euros tiene ~20 bits
            de información numérica. La información es independiente del soporte físico.
          </p>

          <div className={styles.warningBox}>
            <span className={styles.warningIcon} aria-hidden="true">🔐</span>
            <div>
              <strong>Entropía y seguridad: la misma matemática</strong>
              <p>
                Una contraseña segura es exactamente una contraseña con alta entropía: impredecible para
                un atacante. «Contraseña123» tiene baja entropía (patrón predecible).
                «Xk#9!mPqR$2vL» tiene alta entropía (~72 bits). Los gestores de contraseñas generan
                claves con entropía máxima según su longitud. Shannon no lo diseñó para la ciberseguridad,
                pero la matemática es idéntica.
              </p>
            </div>
          </div>

          {/* ── 1. TABLA COMPARATIVA ── */}
          <h3 className={styles.eduH3}>Comparativa de formatos de compresión</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Formato</th>
                  <th>Tipo</th>
                  <th>Ratio compresión</th>
                  <th>Calidad</th>
                  <th>Uso típico</th>
                  <th>Algoritmo base</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>MP3</strong></td>
                  <td>Audio</td>
                  <td>~10:1</td>
                  <td>Buena (lossy)</td>
                  <td>Música, podcasts</td>
                  <td>MDCT + Huffman</td>
                </tr>
                <tr>
                  <td><strong>AAC</strong></td>
                  <td>Audio</td>
                  <td>~12:1</td>
                  <td>Mejor que MP3</td>
                  <td>Streaming, Apple Music</td>
                  <td>MDCT + codif. aritmética</td>
                </tr>
                <tr>
                  <td><strong>FLAC</strong></td>
                  <td>Audio</td>
                  <td>~2:1</td>
                  <td>Sin pérdida</td>
                  <td>Archivos máster, audiófilos</td>
                  <td>LPC + Rice coding</td>
                </tr>
                <tr>
                  <td><strong>JPEG</strong></td>
                  <td>Imagen</td>
                  <td>10–20:1</td>
                  <td>Variable (lossy)</td>
                  <td>Fotos, web</td>
                  <td>DCT + cuantización + Huffman</td>
                </tr>
                <tr>
                  <td><strong>PNG</strong></td>
                  <td>Imagen</td>
                  <td>~2:1</td>
                  <td>Sin pérdida</td>
                  <td>Logos, capturas, transparencias</td>
                  <td>DEFLATE (LZ77 + Huffman)</td>
                </tr>
                <tr>
                  <td><strong>WebP</strong></td>
                  <td>Imagen</td>
                  <td>~25–30%</td>
                  <td>Mejor que JPEG/PNG</td>
                  <td>Web moderna</td>
                  <td>VP8 + codif. predictiva</td>
                </tr>
                <tr>
                  <td><strong>H.265 / HEVC</strong></td>
                  <td>Vídeo</td>
                  <td>~2× vs H.264</td>
                  <td>Alta (lossy)</td>
                  <td>4K, streaming</td>
                  <td>DCT + codif. aritmética CABAC</td>
                </tr>
                <tr>
                  <td><strong>AV1</strong></td>
                  <td>Vídeo</td>
                  <td>~30% vs HEVC</td>
                  <td>Muy alta (lossy)</td>
                  <td>YouTube, Netflix 4K</td>
                  <td>Transformadas + codif. simbólica</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 2. CASOS DE USO ── */}
          <h3 className={styles.eduH3}>¿Quién usa esto y para qué?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <div>
                <strong>Estudiante de telecomunicaciones o informática</strong>
                <p>
                  La entropía de Shannon aparece en todas las asignaturas de redes y señales. Comprender
                  la relación <em>H → código de Huffman → límite de Shannon</em> es imprescindible para
                  exámenes de teoría de codificación y para entender por qué la compresión tiene un techo.
                </p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📡</span>
              <div>
                <strong>Ingeniero de redes dimensionando ancho de banda</strong>
                <p>
                  Usa la fórmula Shannon-Hartley (<em>C = B · log₂(1 + S/N)</em>) para calcular la
                  capacidad máxima teórica de un enlace antes de elegir el hardware. Si la capacidad
                  requerida supera el límite Shannon, no hay codec que lo resuelva: hay que mejorar
                  el medio físico.
                </p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
              <div>
                <strong>Desarrollador eligiendo formato para su app</strong>
                <p>
                  Decidir entre JPEG / WebP / AVIF para imágenes o MP3 / AAC / Opus para audio depende
                  del balance ratio-calidad-compatibilidad. Conocer el algoritmo base (Huffman, DCT,
                  aritmética) ayuda a entender qué ocurre con imágenes de texto o audio con mucho silencio.
                </p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
              <div>
                <strong>Investigador en machine learning</strong>
                <p>
                  La entropía de Shannon es la base de la <em>entropía cruzada</em> (función de pérdida
                  más usada en clasificación) y de la <em>ganancia de información</em> en árboles de
                  decisión. Los modelos de lenguaje se miden en <em>perplejidad</em>, que es directamente
                  una exponencial de la entropía media por token.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. FAQ ── */}
          <h3 className={styles.eduH3}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué significa exactamente «un bit de información»?</strong>
              <p>
                Un bit de información es la cantidad aprendida al observar el resultado de un evento con
                dos posibilidades igualmente probables (como lanzar una moneda justa). Si el evento es
                predecible (probabilidad 1), observarlo no aporta ningún bit. Cuanto más sorpresivo el
                resultado, más bits de información contiene. Shannon formalizó esto como{' '}
                <em>I(x) = −log₂ p(x)</em> bits.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el código Huffman es óptimo?</strong>
              <p>
                Huffman demostró que su construcción greedy —combinar siempre los dos nodos menos
                frecuentes— minimiza la longitud media del código entre todos los posibles códigos de
                longitud variable. Es óptimo <em>símbolo a símbolo</em>. Cuando los símbolos se codifican
                en grupos (como en codificación aritmética), se pueden alcanzar longitudes medias incluso
                más cercanas a la entropía H.
              </p>
              <div className={styles.faqTip}>
                La longitud media de Huffman siempre está entre H y H+1 bits/símbolo.
              </div>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es el límite máximo de compresión de cualquier archivo?</strong>
              <p>
                El <strong>teorema de la fuente de Shannon</strong> establece que no es posible comprimir
                un archivo por debajo de su entropía H bits/símbolo (en promedio). Intentar comprimir
                más allá introduce pérdida de información (lossy) o simplemente el archivo comprimido
                será igual o mayor. Por eso un archivo ZIP de una imagen JPEG ya comprimida no reduce su
                tamaño: la entropía del JPEG es alta (ya aprovecha la redundancia).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre compresión lossless y lossy?</strong>
              <p>
                La compresión <strong>lossless</strong> (sin pérdida) elimina solo redundancias matemáticas:
                el archivo original puede reconstruirse exactamente. Ejemplos: FLAC, PNG, ZIP.
                La compresión <strong>lossy</strong> (con pérdida) va más allá del límite Shannon
                descartando información que el sistema perceptivo humano tolera (frecuencias de audio
                inaudibles, detalles de imagen de alta frecuencia). Ejemplos: MP3, JPEG, H.265.
                El resultado no puede reconstruirse exactamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Tiene algo que ver la entropía de Shannon con la entropía termodinámica?</strong>
              <p>
                Sí, y no fue casualidad. Shannon consultó a John von Neumann el nombre y este le
                sugirió «entropía» porque la fórmula matemática es formalmente equivalente a la entropía
                de Boltzmann en termodinámica estadística: <em>S = −k · Σ pᵢ · ln(pᵢ)</em>. La diferencia
                es el factor k (constante de Boltzmann) y la base del logaritmo. Ambas miden el grado
                de desorden o incertidumbre de un sistema.
              </p>
              <div className={styles.faqTip}>
                Von Neumann bromeó: «nadie sabe realmente qué es la entropía, así que siempre llevarás
                ventaja en cualquier discusión».
              </div>
            </div>
          </div>

          {/* ── 4. GUÍA PASO A PASO ── */}
          <h3 className={styles.eduH3}>Cómo construir un código de Huffman paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Calcular frecuencias de cada símbolo</strong>
                <p>
                  Cuenta cuántas veces aparece cada símbolo en el mensaje original. Si tienes el texto
                  «ABRACADABRA», obtendrías: A=5, B=2, R=2, C=1, D=1. Estas frecuencias determinan
                  la longitud de cada código: mayor frecuencia → código más corto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Ordenar los símbolos por frecuencia (ascendente)</strong>
                <p>
                  Crea una cola de prioridad con todos los símbolos. Los menos frecuentes van primero.
                  En nuestro ejemplo: C(1), D(1), B(2), R(2), A(5). Esta estructura permite siempre
                  acceder al elemento con menor frecuencia de manera eficiente.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Combinar los dos nodos menos frecuentes</strong>
                <p>
                  Extrae los dos símbolos con menor frecuencia (C y D) y crea un nodo padre con
                  frecuencia suma (2). El hijo izquierdo recibe el bit «0» y el derecho «1». Inserta
                  el nuevo nodo en la cola. Repite el proceso hasta que solo quede un nodo: la raíz
                  del árbol, con frecuencia total del mensaje.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Extraer los códigos recorriendo el árbol</strong>
                <p>
                  Para cada símbolo hoja, su código Huffman es la concatenación de bits del camino
                  desde la raíz. En el ejemplo de la pestaña Huffman: A recibe «0» (camino corto,
                  muy frecuente), mientras que F recibe «1100» (camino largo, muy poco frecuente).
                  El árbol garantiza que ningún código es prefijo de otro (propiedad libre de prefijos).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Calcular la longitud media y verificar la eficiencia</strong>
                <p>
                  Multiplica la longitud de cada código por su probabilidad y suma. Este valor debe
                  estar entre H bits/símbolo y H+1 bits/símbolo. Si tu código usa exactamente H bits
                  en promedio, la compresión es perfecta (esto ocurre cuando las probabilidades son
                  potencias exactas de 1/2, como 1/2, 1/4, 1/8…).
                </p>
              </div>
            </div>
          </div>

          {/* ── 5. MEJORES PRÁCTICAS ── */}
          <h3 className={styles.eduH3}>Cómo elegir el formato de compresión adecuado</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🖼️</span>
              <strong>Imágenes para web</strong>
              <p>
                Usa <strong>WebP</strong> como primera opción (mejor calidad/tamaño que JPEG y PNG).
                Reserva <strong>PNG</strong> para transparencias, logos o capturas con texto.
                Usa <strong>AVIF</strong> si el soporte del navegador lo permite (~95% en 2025).
                Evita BMP o TIFF en la web: sin compresión ni ventaja visual.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎵</span>
              <strong>Audio en aplicaciones</strong>
              <p>
                Para streaming o apps móviles usa <strong>Opus</strong> (máxima eficiencia a bajo bitrate,
                libre de royalties). Para archivos de música descargables, <strong>AAC</strong> o
                <strong>MP3</strong> según el ecosistema. Para archivos máster o edición de audio,
                siempre <strong>FLAC</strong> o WAV sin compresión.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗜️</span>
              <strong>No comprimas lo ya comprimido</strong>
              <p>
                Poner un JPEG dentro de un ZIP o un MP3 dentro de un RAR no reduce el tamaño: el archivo
                ya tiene entropía alta y el compresor no puede mejorarlo. Solo añade overhead del
                contenedor. Comprime siempre desde el original sin comprimir.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Ratio vs. velocidad de decodificación</strong>
              <p>
                Algoritmos con mejor ratio (como LZMA / 7z) necesitan más memoria y tiempo para
                descomprimir. Para datos que se leen frecuentemente en tiempo real (bases de datos,
                logs en streaming), <strong>LZ4</strong> o <strong>Snappy</strong> priorizan velocidad
                sobre ratio. Para backups o distribución, usa ZSTD (buen equilibrio).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <strong>Piensa en el dispositivo receptor</strong>
              <p>
                La decodificación de vídeo H.265 o AV1 requiere soporte hardware para ser eficiente
                en batería. En dispositivos antiguos, H.264 decode es más rápido aunque ocupe más
                espacio. Para texto comprimido en APIs, <strong>Brotli</strong> supera a gzip en
                ratio y velocidad en navegadores modernos.
              </p>
            </div>
          </div>

          {/* ── 6. WARNING BOX ── */}
          <div className={styles.warningBoxEdu} role="alert">
            <span className={styles.warningEduIcon} aria-hidden="true">⚠️</span>
            <div>
              <strong>Malentendidos frecuentes sobre compresión y teoría de la información</strong>
              <ul className={styles.warningEduList}>
                <li>
                  <strong>«Un archivo ZIP siempre ocupa menos»</strong>: falso. Si el archivo original ya
                  tiene entropía alta (es aleatorio o ya está comprimido), ZIP puede incluso aumentar el tamaño
                  por el overhead del contenedor.
                </li>
                <li>
                  <strong>«Más bits = mejor calidad en audio»</strong>: solo hasta cierto punto. Por encima de
                  320 kbps en MP3 o 256 kbps en AAC, el oído humano no percibe diferencia en condiciones normales.
                  La calidad depende también del algoritmo psicoacústico.
                </li>
                <li>
                  <strong>«La entropía de Shannon mide la calidad de la compresión»</strong>: no exactamente.
                  Mide el límite teórico mínimo. Un archivo con H = 7,9 bits/byte no puede comprimirse más de un
                  ~1,25% sin pérdida, independientemente del algoritmo.
                </li>
                <li>
                  <strong>«La compresión lossy siempre es peor»</strong>: depende del uso. Para streaming de
                  música o vídeo, lossy bien implementado es imperceptible y permite ahorros de espacio de 10× o
                  más. La pérdida solo importa si el archivo va a editarse o procesarse después.
                </li>
                <li>
                  <strong>«El límite de Shannon solo aplica a texto»</strong>: aplica a cualquier fuente de
                  información (audio, imagen, vídeo, datos binarios). La entropía depende de la distribución de
                  probabilidad de los símbolos, sin importar su naturaleza.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-teoria-informacion')} />
      <ShareCard appName="visualizador-teoria-informacion" />
      <Footer appName="visualizador-teoria-informacion" />
    </div>
  );
}
