'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SimuladorProgramacionDinamica.module.css';

// ============================================================
//  TIPOS
// ============================================================

type Problema = 'mochila' | 'lcs' | 'fibonacci';

interface Fuente {
  f: number;
  c: number;
}
interface Paso {
  f: number;
  c: number;
  texto: string;
  fuentes: Fuente[];
}
interface TablaDP {
  filas: number;
  cols: number;
  valores: number[][];
  prefilled: boolean[][];
  etiqFila: string[];
  etiqCol: string[];
  encabFila: string;
  encabCol: string;
  pasos: Paso[];
  solucionTexto: string;
}

interface Objeto {
  peso: number;
  valor: number;
}

// ============================================================
//  CONSTRUCTORES DE TABLA
// ============================================================

function matrizCero(filas: number, cols: number): number[][] {
  return Array.from({ length: filas }, () => Array.from({ length: cols }, () => 0));
}
function matrizFalse(filas: number, cols: number): boolean[][] {
  return Array.from({ length: filas }, () => Array.from({ length: cols }, () => false));
}

function construirMochila(items: Objeto[], cap: number): TablaDP {
  const n = items.length;
  const filas = n + 1;
  const cols = cap + 1;
  const valores = matrizCero(filas, cols);
  const prefilled = matrizFalse(filas, cols);
  for (let w = 0; w < cols; w += 1) prefilled[0][w] = true; // fila 0 = sin objetos

  const pasos: Paso[] = [];
  for (let i = 1; i <= n; i += 1) {
    const { peso, valor } = items[i - 1];
    for (let w = 0; w < cols; w += 1) {
      const noCoger = valores[i - 1][w];
      const fuentes: Fuente[] = [{ f: i - 1, c: w }];
      let texto: string;
      if (w >= peso) {
        const coger = valor + valores[i - 1][w - peso];
        valores[i][w] = Math.max(noCoger, coger);
        fuentes.push({ f: i - 1, c: w - peso });
        texto =
          coger > noCoger
            ? `Objeto ${i} (peso ${peso}, valor ${valor}): conviene cogerlo → ${valor} + ${valores[i - 1][w - peso]} = ${coger} > ${noCoger}.`
            : `Objeto ${i}: mejor no cogerlo → se mantiene ${noCoger} (coger daría ${coger}).`;
      } else {
        valores[i][w] = noCoger;
        texto = `Objeto ${i} (peso ${peso}): no cabe en capacidad ${w} → se hereda ${noCoger} de arriba.`;
      }
      pasos.push({ f: i, c: w, texto, fuentes });
    }
  }

  // Reconstrucción de la solución
  const elegidos: number[] = [];
  let w = cap;
  for (let i = n; i >= 1; i -= 1) {
    if (valores[i][w] !== valores[i - 1][w]) {
      elegidos.unshift(i);
      w -= items[i - 1].peso;
    }
  }
  const etiqFila = ['∅', ...items.map((o, i) => `#${i + 1} (p${o.peso}/v${o.valor})`)];
  const etiqCol = Array.from({ length: cols }, (_, w2) => `${w2}`);
  const solucionTexto =
    n > 0
      ? `Valor máximo: ${valores[n][cap]}. Objetos elegidos: ${elegidos.length ? elegidos.map((i) => `#${i}`).join(', ') : 'ninguno'}.`
      : 'Añade objetos para empezar.';

  return {
    filas,
    cols,
    valores,
    prefilled,
    etiqFila,
    etiqCol,
    encabFila: 'Objetos',
    encabCol: 'Capacidad',
    pasos,
    solucionTexto,
  };
}

function construirLCS(a: string, b: string): TablaDP {
  const m = a.length;
  const n = b.length;
  const filas = m + 1;
  const cols = n + 1;
  const valores = matrizCero(filas, cols);
  const prefilled = matrizFalse(filas, cols);
  for (let j = 0; j < cols; j += 1) prefilled[0][j] = true;
  for (let i = 0; i < filas; i += 1) prefilled[i][0] = true;

  const pasos: Paso[] = [];
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        valores[i][j] = valores[i - 1][j - 1] + 1;
        pasos.push({
          f: i,
          c: j,
          texto: `"${a[i - 1]}" = "${b[j - 1]}" coinciden → diagonal + 1 = ${valores[i][j]}.`,
          fuentes: [{ f: i - 1, c: j - 1 }],
        });
      } else {
        const arriba = valores[i - 1][j];
        const izq = valores[i][j - 1];
        valores[i][j] = Math.max(arriba, izq);
        pasos.push({
          f: i,
          c: j,
          texto: `"${a[i - 1]}" ≠ "${b[j - 1]}" → máximo(arriba ${arriba}, izquierda ${izq}) = ${valores[i][j]}.`,
          fuentes: [
            { f: i - 1, c: j },
            { f: i, c: j - 1 },
          ],
        });
      }
    }
  }

  // Reconstrucción de la LCS
  let i = m;
  let j = n;
  let lcs = '';
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs = a[i - 1] + lcs;
      i -= 1;
      j -= 1;
    } else if (valores[i - 1][j] >= valores[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  const etiqFila = ['∅', ...a.split('')];
  const etiqCol = ['∅', ...b.split('')];
  const solucionTexto =
    m > 0 && n > 0
      ? `Longitud de la LCS: ${valores[m][n]}. Subsecuencia: "${lcs}".`
      : 'Escribe ambas cadenas para empezar.';

  return {
    filas,
    cols,
    valores,
    prefilled,
    etiqFila,
    etiqCol,
    encabFila: 'Cadena A',
    encabCol: 'Cadena B',
    pasos,
    solucionTexto,
  };
}

function construirFibonacci(nFib: number): TablaDP {
  const cols = nFib + 1;
  const valores = matrizCero(1, cols);
  const prefilled = matrizFalse(1, cols);
  if (cols > 0) {
    valores[0][0] = 0;
    prefilled[0][0] = true;
  }
  if (cols > 1) {
    valores[0][1] = 1;
    prefilled[0][1] = true;
  }
  const pasos: Paso[] = [];
  for (let k = 2; k <= nFib; k += 1) {
    valores[0][k] = valores[0][k - 1] + valores[0][k - 2];
    pasos.push({
      f: 0,
      c: k,
      texto: `F(${k}) = F(${k - 1}) + F(${k - 2}) = ${valores[0][k - 1]} + ${valores[0][k - 2]} = ${valores[0][k]}.`,
      fuentes: [
        { f: 0, c: k - 1 },
        { f: 0, c: k - 2 },
      ],
    });
  }
  const etiqCol = Array.from({ length: cols }, (_, k) => `F(${k})`);
  return {
    filas: 1,
    cols,
    valores,
    prefilled,
    etiqFila: ['valor'],
    etiqCol,
    encabFila: '',
    encabCol: 'Índice',
    pasos,
    solucionTexto: `F(${nFib}) = ${valores[0][nFib]}.`,
  };
}

// ============================================================
//  COMPONENTE
// ============================================================

const PROBLEMAS: { id: Problema; nombre: string; desc: string }[] = [
  { id: 'mochila', nombre: 'Mochila 0/1', desc: 'Maximiza el valor sin pasarte del peso. Edita objetos y capacidad.' },
  { id: 'lcs', nombre: 'Subsecuencia común (LCS)', desc: 'La subsecuencia más larga común a dos cadenas. Edítalas.' },
  { id: 'fibonacci', nombre: 'Fibonacci', desc: 'La sucesión clásica con memoización en una fila.' },
];

const ITEMS_INICIALES: Objeto[] = [
  { peso: 2, valor: 3 },
  { peso: 3, valor: 4 },
  { peso: 4, valor: 5 },
  { peso: 5, valor: 6 },
];

export default function SimuladorProgramacionDinamica() {
  const [problema, setProblema] = useState<Problema>('mochila');
  const [items, setItems] = useState<Objeto[]>(ITEMS_INICIALES);
  const [capacidad, setCapacidad] = useState<number>(8);
  const [cadenaA, setCadenaA] = useState<string>('ABCBDAB');
  const [cadenaB, setCadenaB] = useState<string>('BDCAB');
  const [nFib, setNFib] = useState<number>(9);
  const [pasoActual, setPasoActual] = useState<number>(0);
  const [auto, setAuto] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(450);

  const tabla = useMemo<TablaDP>(() => {
    if (problema === 'mochila') return construirMochila(items, capacidad);
    if (problema === 'lcs') return construirLCS(cadenaA, cadenaB);
    return construirFibonacci(nFib);
  }, [problema, items, capacidad, cadenaA, cadenaB, nFib]);

  // Reiniciar el contador de pasos cuando cambia la tabla
  useEffect(() => {
    setPasoActual(0);
    setAuto(false);
  }, [problema, items, capacidad, cadenaA, cadenaB, nFib]);

  const totalPasos = tabla.pasos.length;
  const completado = pasoActual >= totalPasos;
  const pasoSiguiente = !completado ? tabla.pasos[pasoActual] : null;

  // Mapa de orden de cálculo (clave "f-c" → índice de paso)
  const ordenMap = useMemo(() => {
    const m = new Map<string, number>();
    tabla.pasos.forEach((p, idx) => m.set(`${p.f}-${p.c}`, idx));
    return m;
  }, [tabla]);

  const fuentesSet = useMemo(() => {
    const s = new Set<string>();
    if (pasoSiguiente) pasoSiguiente.fuentes.forEach((fu) => s.add(`${fu.f}-${fu.c}`));
    return s;
  }, [pasoSiguiente]);

  useEffect(() => {
    if (!auto) return undefined;
    if (pasoActual >= totalPasos) {
      setAuto(false);
      return undefined;
    }
    const t = setTimeout(() => setPasoActual((p) => Math.min(p + 1, totalPasos)), velocidad);
    return () => clearTimeout(t);
  }, [auto, pasoActual, totalPasos, velocidad]);

  const handleAddItem = useCallback(() => {
    setItems((prev) => (prev.length >= 6 ? prev : [...prev, { peso: 1, valor: 1 }]));
  }, []);
  const handleRemoveItem = useCallback((idx: number) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }, []);
  const handleItemChange = useCallback((idx: number, campo: keyof Objeto, valor: number) => {
    setItems((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [campo]: Math.max(1, Math.min(12, valor)) } : o))
    );
  }, []);

  const sanearCadena = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);

  const celdaVisible = (f: number, c: number): boolean => {
    if (tabla.prefilled[f][c]) return true;
    const idx = ordenMap.get(`${f}-${c}`);
    return idx !== undefined && idx < pasoActual;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Programación Dinámica</h1>
        <p className={styles.subtitle}>
          Rellena la tabla de subproblemas paso a paso y observa de qué celdas depende cada valor.
          Tres clásicos editables: la mochila 0/1, la subsecuencia común más larga y Fibonacci.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de problema */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Problema</h2>
          <div className={styles.probSelector}>
            {PROBLEMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProblema(p.id)}
                className={`${styles.probBtn} ${problema === p.id ? styles.probActive : ''}`}
                aria-pressed={problema === p.id}
              >
                <span className={styles.probNombre}>{p.nombre}</span>
                <span className={styles.probDesc}>{p.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Controles del problema */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Datos de entrada</h2>

          {problema === 'mochila' && (
            <div>
              <div className={styles.itemsLista}>
                {items.map((o, idx) => (
                  <div key={`item-${idx}`} className={styles.itemFila}>
                    <span className={styles.itemEtiq}>#{idx + 1}</span>
                    <label className={styles.itemCampo}>
                      Peso
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={o.peso}
                        onChange={(e) => handleItemChange(idx, 'peso', Number(e.target.value))}
                        className={styles.itemInput}
                        inputMode="numeric"
                      />
                    </label>
                    <label className={styles.itemCampo}>
                      Valor
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={o.valor}
                        onChange={(e) => handleItemChange(idx, 'valor', Number(e.target.value))}
                        className={styles.itemInput}
                        inputMode="numeric"
                      />
                    </label>
                    <button
                      type="button"
                      className={styles.itemRemove}
                      onClick={() => handleRemoveItem(idx)}
                      aria-label={`Eliminar objeto ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.controlesEntrada}>
                <button type="button" className={styles.miniBtn} onClick={handleAddItem} disabled={items.length >= 6}>
                  + Añadir objeto
                </button>
                <label className={styles.sliderCampo}>
                  Capacidad: <strong>{capacidad}</strong>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={capacidad}
                    onChange={(e) => setCapacidad(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          )}

          {problema === 'lcs' && (
            <div className={styles.controlesEntrada}>
              <label className={styles.textoCampo}>
                Cadena A
                <input
                  type="text"
                  value={cadenaA}
                  onChange={(e) => setCadenaA(sanearCadena(e.target.value))}
                  className={styles.textoInput}
                  maxLength={9}
                />
              </label>
              <label className={styles.textoCampo}>
                Cadena B
                <input
                  type="text"
                  value={cadenaB}
                  onChange={(e) => setCadenaB(sanearCadena(e.target.value))}
                  className={styles.textoInput}
                  maxLength={9}
                />
              </label>
              <span className={styles.ayudaTexto}>Solo letras y dígitos, máximo 9 caracteres.</span>
            </div>
          )}

          {problema === 'fibonacci' && (
            <div className={styles.controlesEntrada}>
              <label className={styles.sliderCampo}>
                Calcular hasta F({nFib})
                <input
                  type="range"
                  min={2}
                  max={14}
                  value={nFib}
                  onChange={(e) => setNFib(Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </section>

        {/* Tabla DP */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tabla de programación dinámica</h2>
          <div className={styles.tablaScroll}>
            <table className={styles.dpTable}>
              <thead>
                <tr>
                  <th className={styles.esquina}>
                    {tabla.encabFila}
                    {tabla.encabFila && tabla.encabCol ? ' \\ ' : ''}
                    {tabla.encabCol}
                  </th>
                  {tabla.etiqCol.map((et, c) => (
                    <th key={`col-${c}`} className={styles.colHead}>
                      {et}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabla.valores.map((fila, f) => (
                  <tr key={`fila-${f}`}>
                    <th className={styles.filaHead}>{tabla.etiqFila[f]}</th>
                    {fila.map((val, c) => {
                      const visible = celdaVisible(f, c);
                      const esActual = pasoSiguiente && pasoSiguiente.f === f && pasoSiguiente.c === c;
                      const esFuente = fuentesSet.has(`${f}-${c}`);
                      let clase = styles.celda;
                      if (esActual) clase = `${styles.celda} ${styles.celdaActual}`;
                      else if (esFuente) clase = `${styles.celda} ${styles.celdaFuente}`;
                      else if (visible) clase = `${styles.celda} ${styles.celdaLlena}`;
                      return (
                        <td key={`celda-${f}-${c}`} className={clase}>
                          {visible ? val : esActual ? '?' : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Explicación */}
          <div className={styles.explicacion} role="status" aria-live="polite">
            {completado ? (
              <span>
                <strong><span aria-hidden="true">✅</span> Tabla completa.</strong> {tabla.solucionTexto}
              </span>
            ) : pasoSiguiente ? (
              <span>
                <strong>
                  Celda [{tabla.etiqFila[pasoSiguiente.f]}, {tabla.etiqCol[pasoSiguiente.c]}]:
                </strong>{' '}
                {pasoSiguiente.texto}
              </span>
            ) : (
              <span>Pulsa &ldquo;Siguiente&rdquo; para empezar a rellenar la tabla.</span>
            )}
          </div>
        </section>

        {/* Controles de pasos */}
        <section className={styles.panel}>
          <div className={styles.controles}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => {
                setAuto(false);
                setPasoActual((p) => Math.max(0, p - 1));
              }}
              disabled={pasoActual === 0}
            >
              <span aria-hidden="true">◀</span> Anterior
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => setPasoActual((p) => Math.min(totalPasos, p + 1))}
              disabled={completado}
            >
              Siguiente <span aria-hidden="true">▶</span>
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${auto ? styles.ctrlBtnDanger : styles.ctrlBtnSecondary}`}
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              disabled={completado}
            >
              {auto ? 'Pausar' : 'Auto ▶▶'}
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${styles.ctrlBtnSecondary}`}
              onClick={() => {
                setAuto(false);
                setPasoActual(totalPasos);
              }}
              disabled={completado}
            >
              Completar
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`}
              onClick={() => {
                setAuto(false);
                setPasoActual(0);
              }}
            >
              Reiniciar
            </button>
          </div>
          <div className={styles.progreso}>
            Celda {Math.min(pasoActual, totalPasos)} de {totalPasos}
            <div className={styles.progresoBarra}>
              <div
                className={styles.progresoRelleno}
                style={{ width: totalPasos ? `${(pasoActual / totalPasos) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <div className={styles.speedControl}>
            <label htmlFor="vel-input">Velocidad automática:</label>
            <input
              id="vel-input"
              type="range"
              min="150"
              max="1200"
              step="50"
              value={velocidad}
              onChange={(e) => setVelocidad(Number(e.target.value))}
            />
            <span className={styles.speedValue}>{velocidad} ms</span>
          </div>
        </section>
      </main>

      <EducationalSection
        title="Guía de Programación Dinámica"
        subtitle="Memoización, tabulación y los problemas clásicos"
      >
        <h3>Recursión ingenua vs Programación dinámica</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Recursión ingenua</th>
                <th>Programación dinámica</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Subproblemas repetidos</td><td>Se recalculan una y otra vez</td><td>Se calculan una sola vez y se guardan</td></tr>
              <tr><td>Coste (Fibonacci)</td><td>O(2ⁿ) exponencial</td><td>O(n) lineal</td></tr>
              <tr><td>Memoria</td><td>Solo la pila de llamadas</td><td>Tabla de subproblemas</td></tr>
              <tr><td>Enfoque</td><td>Arriba abajo natural</td><td>Memoización (top-down) o tabulación (bottom-up)</td></tr>
              <tr><td>Riesgo</td><td>Tiempo inviable</td><td>Hay que identificar el estado correcto</td></tr>
              <tr><td>Cuándo usarla</td><td>Sin solapamiento de subproblemas</td><td>Subestructura óptima + subproblemas solapados</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🔀</span>
              <strong>Control de versiones (diff)</strong>
            </div>
            <div className={styles.escenarioExample}>
              git diff y las herramientas de comparación de archivos usan la subsecuencia común más
              larga (o la distancia de edición) para mostrar qué líneas se han añadido o borrado.
            </div>
            <div className={styles.escenarioTip}>Tip: la LCS es la base del algoritmo de diff de Myers.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧬</span>
              <strong>Bioinformática</strong>
            </div>
            <div className={styles.escenarioExample}>
              El alineamiento de secuencias de ADN o proteínas (Needleman-Wunsch, Smith-Waterman) es
              programación dinámica sobre una tabla, muy parecida a la de la LCS.
            </div>
            <div className={styles.escenarioTip}>Tip: comparar genomas sería inviable sin DP.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎒</span>
              <strong>Optimización de recursos</strong>
            </div>
            <div className={styles.escenarioExample}>
              La mochila modela decisiones de presupuesto, selección de inversiones o asignación de
              recursos limitados maximizando el beneficio sin pasarse de un tope.
            </div>
            <div className={styles.escenarioTip}>Tip: el cambio de monedas es otro pariente cercano de la mochila.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">⌨️</span>
              <strong>Autocorrección y búsqueda</strong>
            </div>
            <div className={styles.escenarioExample}>
              La distancia de edición (Levenshtein) mide cuántos cambios separan dos palabras y
              alimenta el corrector ortográfico y las sugerencias de búsqueda.
            </div>
            <div className={styles.escenarioTip}>Tip: "¿quizás quisiste decir…?" se apoya en DP.</div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Qué son la subestructura óptima y los subproblemas solapados?</h4>
            <p>
              Son las dos condiciones para aplicar DP. Subestructura óptima: la solución óptima del
              problema se construye con soluciones óptimas de sus subproblemas. Subproblemas
              solapados: los mismos subproblemas aparecen muchas veces. Si solo se cumple la primera
              pero no la segunda, suele bastar con divide y vencerás.
            </p>
            <p className={styles.faqTip}>Fibonacci es el ejemplo perfecto de subproblemas solapados.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la mochila se llama 0/1?</h4>
            <p>
              Porque de cada objeto solo puedes tomar 0 unidades (no lo coges) o 1 (lo coges entero):
              no se pueden partir. Existe también la "mochila fraccionaria", que sí permite partir
              objetos y se resuelve con un algoritmo voraz, no con DP.
            </p>
            <p className={styles.faqTip}>En el simulador, cada celda decide justo eso: coger o no coger.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo se reconstruye la solución, no solo su valor?</h4>
            <p>
              La tabla da el valor óptimo, pero para saber qué objetos se eligen (o qué LCS resulta)
              hay que "deshacer" el camino desde la última celda hasta el inicio, mirando de qué celda
              vino cada valor. El simulador hace ese backtracking y te muestra el resultado al completar.
            </p>
            <p className={styles.faqTip}>Por eso conviene guardar también de dónde viene cada celda.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿La programación dinámica siempre usa una tabla 2D?</h4>
            <p>
              No. La dimensión de la tabla depende del número de variables del estado. Fibonacci usa
              una tabla 1D; la mochila y la LCS, una 2D; otros problemas necesitan 3D o más. Muchas
              veces se puede optimizar la memoria guardando solo las últimas filas.
            </p>
            <p className={styles.faqTip}>La mochila se puede resolver con un solo array 1D recorrido al revés.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Memoización o tabulación, cuál elijo?</h4>
            <p>
              La memoización es más fácil de escribir: partes de la recursión y añades una caché.
              La tabulación evita la recursión, no desborda la pila y suele permitir optimizar memoria,
              pero exige pensar el orden de llenado. Para empezar, memoización; para producción con
              entradas grandes, tabulación.
            </p>
            <p className={styles.faqTip}>Este simulador muestra la tabulación: llenamos la tabla en orden.</p>
          </div>
        </div>

        <h3>Cómo Plantear un Problema de DP — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Define el estado</strong>
              <p>¿Qué variables describen un subproblema? En la mochila, "primeros i objetos con capacidad w".</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Escribe la recurrencia</strong>
              <p>Expresa la solución de un estado en función de estados más pequeños. Es el corazón de la DP.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Fija los casos base</strong>
              <p>Sin objetos o capacidad 0 → valor 0; cadena vacía → LCS 0. Son las celdas ya rellenas al inicio.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Elige el orden de llenado</strong>
              <p>Cada celda debe calcularse después de aquellas de las que depende. Aquí, de arriba abajo y de izquierda a derecha.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Reconstruye la solución</strong>
              <p>Recorre la tabla hacia atrás para recuperar las decisiones, no solo el valor óptimo.</p>
            </div>
          </div>
        </div>

        <h3>Claves Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧩</span>
            <strong>Identifica el estado mínimo</strong>
            <p>Un estado más pequeño = tabla más pequeña y solución más rápida. No añadas variables de más.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔁</span>
            <strong>De recursión a DP</strong>
            <p>Escribe primero la recursión; si ves subproblemas repetidos, añade memoización casi sin cambiarla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💾</span>
            <strong>Optimiza la memoria</strong>
            <p>Si una celda solo depende de la fila anterior, guarda dos filas en vez de toda la tabla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧭</span>
            <strong>Guarda el origen</strong>
            <p>Si necesitas la solución y no solo su coste, anota de dónde viene cada celda.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📏</span>
            <strong>Comprueba los límites</strong>
            <p>Los casos base y los índices fuera de rango son la fuente número uno de errores en DP.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Verifica con casos pequeños</strong>
            <p>Rellena a mano una tabla 3×3 y compárala con tu código antes de escalar.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes en programación dinámica</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Definir un estado incompleto que no captura toda la información del subproblema.</li>
            <li>Equivocarse en los casos base (la fila o columna inicial).</li>
            <li>Rellenar la tabla en un orden en el que una celda usa otra aún sin calcular.</li>
            <li>Confundir la mochila 0/1 (DP) con la fraccionaria (voraz).</li>
            <li>Quedarse solo con el valor óptimo y no saber reconstruir la solución.</li>
            <li>Aplicar DP donde no hay subproblemas solapados (sería gastar memoria sin ganancia).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-programacion-dinamica')} />
      <ShareCard appName="simulador-programacion-dinamica" />
      <Footer appName="simulador-programacion-dinamica" />
    </div>
  );
}
