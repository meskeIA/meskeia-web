'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './GeneradorSudokus.module.css';
import impresion from '@/styles/impresion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────────────────────

type Rejilla = number[]; // 81 casillas; 0 = vacía
type NivelId = 'facil' | 'medio' | 'dificil' | 'experto';

interface Sudoku {
  pistas: Rejilla;
  solucion: Rejilla;
  nivelReal: NivelId;
  tecnicas: string[];
  numPistas: number;
  semilla: number;
}

interface Nivel {
  id: NivelId;
  nombre: string;
  detalle: string;
  /** Pistas que se intentan dejar; 17 significa «quitar todo lo que se pueda» */
  objetivoPistas: number;
}

const NIVELES: Nivel[] = [
  { id: 'facil', nombre: 'Fácil', detalle: 'Se resuelve de un vistazo, casilla a casilla', objetivoPistas: 44 },
  { id: 'medio', nombre: 'Medio', detalle: 'Hay que escanear por valor, sin anotar nada', objetivoPistas: 34 },
  { id: 'dificil', nombre: 'Difícil', detalle: 'Obliga a anotar candidatos: pares y apuntadores', objetivoPistas: 28 },
  { id: 'experto', nombre: 'Experto', detalle: 'No basta con las técnicas anteriores', objetivoPistas: 17 },
];

const NOMBRES_TECNICA: Record<string, string> = {
  singleDesnudo: 'Single desnudo',
  singleOculto: 'Single oculto',
  parDesnudo: 'Par desnudo',
  apuntador: 'Candidatos apuntadores',
  parOculto: 'Par oculto',
  cajaLinea: 'Reducción caja-línea',
};

/** Orden de las técnicas de menor a mayor dificultad */
const ORDEN_TECNICAS = ['singleDesnudo', 'singleOculto', 'parDesnudo', 'apuntador', 'parOculto', 'cajaLinea'];

// ─────────────────────────────────────────────────────────────
// Estructura de la rejilla: unidades y casillas compañeras
// ─────────────────────────────────────────────────────────────

const UNIDADES: number[][] = (() => {
  const unidades: number[][] = [];
  for (let f = 0; f < 9; f++) unidades.push(Array.from({ length: 9 }, (_, c) => f * 9 + c));
  for (let c = 0; c < 9; c++) unidades.push(Array.from({ length: 9 }, (_, f) => f * 9 + c));
  for (let bf = 0; bf < 3; bf++) {
    for (let bc = 0; bc < 3; bc++) {
      const caja: number[] = [];
      for (let f = 0; f < 3; f++) {
        for (let c = 0; c < 3; c++) caja.push((bf * 3 + f) * 9 + bc * 3 + c);
      }
      unidades.push(caja);
    }
  }
  return unidades;
})();

const FILAS = UNIDADES.slice(0, 9);
const COLUMNAS = UNIDADES.slice(9, 18);
const CAJAS = UNIDADES.slice(18, 27);

/** Las 20 casillas que comparten fila, columna o región con cada casilla */
const COMPANERAS: number[][] = Array.from({ length: 81 }, (_, celda) => {
  const conjunto = new Set<number>();
  UNIDADES.filter((u) => u.includes(celda)).forEach((u) => u.forEach((c) => conjunto.add(c)));
  conjunto.delete(celda);
  return [...conjunto];
});

// ─────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────

/** Generador con semilla: el mismo número de sudoku produce la misma rejilla */
function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function candidatosDe(rejilla: Rejilla, celda: number): number[] {
  const usados = new Set<number>();
  COMPANERAS[celda].forEach((c) => {
    if (rejilla[c] !== 0) usados.add(rejilla[c]);
  });
  const posibles: number[] = [];
  for (let v = 1; v <= 9; v++) if (!usados.has(v)) posibles.push(v);
  return posibles;
}

/** Cuenta soluciones hasta el límite indicado; con límite 2 basta para verificar unicidad */
function contarSoluciones(rejilla: Rejilla, limite = 2): number {
  const copia = [...rejilla];
  let total = 0;

  const explorar = (): boolean => {
    let elegida = -1;
    let candidatos: number[] = [];

    for (let i = 0; i < 81; i++) {
      if (copia[i] !== 0) continue;
      const posibles = candidatosDe(copia, i);
      if (posibles.length === 0) return false; // callejón sin salida
      if (elegida === -1 || posibles.length < candidatos.length) {
        elegida = i;
        candidatos = posibles;
      }
      if (posibles.length === 1) break;
    }

    if (elegida === -1) {
      total += 1;
      return total >= limite;
    }

    for (const valor of candidatos) {
      copia[elegida] = valor;
      const parar = explorar();
      copia[elegida] = 0;
      if (parar) return true;
    }
    return false;
  };

  explorar();
  return total;
}

/** Rejilla completa y válida, punto de partida de todo sudoku */
function generarSolucion(aleatorio: () => number): Rejilla {
  const rejilla: Rejilla = Array(81).fill(0);

  const rellenar = (): boolean => {
    let elegida = -1;
    let candidatos: number[] = [];

    for (let i = 0; i < 81; i++) {
      if (rejilla[i] !== 0) continue;
      const posibles = candidatosDe(rejilla, i);
      if (posibles.length === 0) return false;
      if (elegida === -1 || posibles.length < candidatos.length) {
        elegida = i;
        candidatos = posibles;
      }
    }

    if (elegida === -1) return true;

    for (const valor of barajar(candidatos, aleatorio)) {
      rejilla[elegida] = valor;
      if (rellenar()) return true;
      rejilla[elegida] = 0;
    }
    return false;
  };

  rellenar();
  return rejilla;
}

// ─────────────────────────────────────────────────────────────
// Resolución lógica: qué técnicas hacen falta de verdad
// ─────────────────────────────────────────────────────────────

interface Analisis {
  resuelto: boolean;
  tecnicas: string[];
}

/**
 * Intenta resolver aplicando técnicas humanas de menor a mayor dificultad.
 * La técnica más avanzada que necesita determina el nivel del sudoku.
 */
function analizar(pistas: Rejilla): Analisis {
  const valores = [...pistas];
  const candidatos: Set<number>[] = Array.from({ length: 81 }, (_, i) =>
    valores[i] === 0 ? new Set(candidatosDe(valores, i)) : new Set<number>(),
  );
  const usadas = new Set<string>();

  const asignar = (celda: number, valor: number) => {
    valores[celda] = valor;
    candidatos[celda].clear();
    COMPANERAS[celda].forEach((c) => candidatos[c].delete(valor));
  };

  const singleDesnudo = (): boolean => {
    for (let i = 0; i < 81; i++) {
      if (valores[i] === 0 && candidatos[i].size === 1) {
        asignar(i, [...candidatos[i]][0]);
        return true;
      }
    }
    return false;
  };

  const singleOculto = (): boolean => {
    for (const unidad of UNIDADES) {
      for (let valor = 1; valor <= 9; valor++) {
        const posibles = unidad.filter((c) => valores[c] === 0 && candidatos[c].has(valor));
        if (posibles.length === 1 && !unidad.some((c) => valores[c] === valor)) {
          asignar(posibles[0], valor);
          return true;
        }
      }
    }
    return false;
  };

  const parDesnudo = (): boolean => {
    for (const unidad of UNIDADES) {
      const dobles = unidad.filter((c) => valores[c] === 0 && candidatos[c].size === 2);
      for (let i = 0; i < dobles.length; i++) {
        for (let j = i + 1; j < dobles.length; j++) {
          const a = [...candidatos[dobles[i]]].sort().join('');
          const b = [...candidatos[dobles[j]]].sort().join('');
          if (a !== b) continue;

          let eliminado = false;
          const pareja = [...candidatos[dobles[i]]];
          unidad.forEach((c) => {
            if (c === dobles[i] || c === dobles[j] || valores[c] !== 0) return;
            pareja.forEach((v) => {
              if (candidatos[c].delete(v)) eliminado = true;
            });
          });
          if (eliminado) return true;
        }
      }
    }
    return false;
  };

  const apuntador = (): boolean => {
    for (const caja of CAJAS) {
      for (let valor = 1; valor <= 9; valor++) {
        const posibles = caja.filter((c) => valores[c] === 0 && candidatos[c].has(valor));
        if (posibles.length < 2) continue;

        const filas = new Set(posibles.map((c) => Math.floor(c / 9)));
        const columnas = new Set(posibles.map((c) => c % 9));
        let eliminado = false;

        if (filas.size === 1) {
          const fila = FILAS[[...filas][0]];
          fila.forEach((c) => {
            if (!caja.includes(c) && valores[c] === 0 && candidatos[c].delete(valor)) eliminado = true;
          });
        }
        if (columnas.size === 1) {
          const columna = COLUMNAS[[...columnas][0]];
          columna.forEach((c) => {
            if (!caja.includes(c) && valores[c] === 0 && candidatos[c].delete(valor)) eliminado = true;
          });
        }
        if (eliminado) return true;
      }
    }
    return false;
  };

  const cajaLinea = (): boolean => {
    for (const linea of [...FILAS, ...COLUMNAS]) {
      for (let valor = 1; valor <= 9; valor++) {
        const posibles = linea.filter((c) => valores[c] === 0 && candidatos[c].has(valor));
        if (posibles.length < 2) continue;

        const caja = CAJAS.find((cj) => posibles.every((c) => cj.includes(c)));
        if (!caja) continue;

        let eliminado = false;
        caja.forEach((c) => {
          if (!linea.includes(c) && valores[c] === 0 && candidatos[c].delete(valor)) eliminado = true;
        });
        if (eliminado) return true;
      }
    }
    return false;
  };

  const parOculto = (): boolean => {
    for (const unidad of UNIDADES) {
      for (let v1 = 1; v1 <= 9; v1++) {
        for (let v2 = v1 + 1; v2 <= 9; v2++) {
          const celdas1 = unidad.filter((c) => valores[c] === 0 && candidatos[c].has(v1));
          const celdas2 = unidad.filter((c) => valores[c] === 0 && candidatos[c].has(v2));
          if (celdas1.length !== 2 || celdas2.length !== 2) continue;
          if (celdas1[0] !== celdas2[0] || celdas1[1] !== celdas2[1]) continue;

          let eliminado = false;
          celdas1.forEach((c) => {
            [...candidatos[c]].forEach((v) => {
              if (v !== v1 && v !== v2 && candidatos[c].delete(v)) eliminado = true;
            });
          });
          if (eliminado) return true;
        }
      }
    }
    return false;
  };

  const tecnicas: { nombre: string; aplicar: () => boolean }[] = [
    { nombre: 'singleDesnudo', aplicar: singleDesnudo },
    { nombre: 'singleOculto', aplicar: singleOculto },
    { nombre: 'parDesnudo', aplicar: parDesnudo },
    { nombre: 'apuntador', aplicar: apuntador },
    { nombre: 'parOculto', aplicar: parOculto },
    { nombre: 'cajaLinea', aplicar: cajaLinea },
  ];

  let progreso = true;
  while (progreso) {
    progreso = false;
    for (const tecnica of tecnicas) {
      if (tecnica.aplicar()) {
        usadas.add(tecnica.nombre);
        progreso = true;
        break; // se vuelve siempre a la técnica más sencilla
      }
    }
  }

  return {
    resuelto: valores.every((v) => v !== 0),
    tecnicas: ORDEN_TECNICAS.filter((t) => usadas.has(t)),
  };
}

/**
 * El corte entre niveles es el que nota quien resuelve: si basta con mirar,
 * si hay que escanear por valor o si obliga a anotar candidatos en la rejilla.
 */
function nivelDesdeTecnicas(analisis: Analisis): NivelId {
  if (!analisis.resuelto) return 'experto';
  if (analisis.tecnicas.some((t) => t !== 'singleDesnudo' && t !== 'singleOculto')) return 'dificil';
  if (analisis.tecnicas.includes('singleOculto')) return 'medio';
  return 'facil';
}

// ─────────────────────────────────────────────────────────────
// Generación
// ─────────────────────────────────────────────────────────────

const RANGO_NIVEL: Record<NivelId, number> = { facil: 0, medio: 1, dificil: 2, experto: 3 };

function generarSudoku(nivel: Nivel, semilla: number, simetrico: boolean): Sudoku {
  const aleatorio = crearAleatorio(semilla);
  let mejor: Sudoku | null = null;

  for (let intento = 0; intento < 14; intento++) {
    // El objetivo varía entre intentos para explorar rejillas de densidad distinta
    const objetivo = nivel.objetivoPistas === 17 ? 17 : nivel.objetivoPistas - (intento % 4);
    const solucion = generarSolucion(aleatorio);
    const pistas = [...solucion];
    let restantes = 81;

    for (const celda of barajar(Array.from({ length: 81 }, (_, i) => i), aleatorio)) {
      if (restantes <= objetivo) break;
      if (pistas[celda] === 0) continue;

      const simetrica = 80 - celda;
      const quitadas: number[] = [celda];
      if (simetrico && simetrica !== celda && pistas[simetrica] !== 0) quitadas.push(simetrica);
      if (restantes - quitadas.length < 17) continue; // por debajo de 17 no existe solución única

      const respaldo = quitadas.map((c) => pistas[c]);
      quitadas.forEach((c) => (pistas[c] = 0));

      if (contarSoluciones(pistas, 2) === 1) {
        restantes -= quitadas.length;
      } else {
        quitadas.forEach((c, i) => (pistas[c] = respaldo[i]));
      }
    }

    const analisis = analizar(pistas);
    const candidato: Sudoku = {
      pistas,
      solucion,
      nivelReal: nivelDesdeTecnicas(analisis),
      tecnicas: analisis.tecnicas,
      numPistas: restantes,
      semilla,
    };

    if (candidato.nivelReal === nivel.id) return candidato;

    // Se conserva el más próximo al nivel pedido por si ningún intento acierta
    const distancia = Math.abs(RANGO_NIVEL[candidato.nivelReal] - RANGO_NIVEL[nivel.id]);
    const distanciaMejor = mejor ? Math.abs(RANGO_NIVEL[mejor.nivelReal] - RANGO_NIVEL[nivel.id]) : 99;
    if (distancia < distanciaMejor) mejor = candidato;
  }

  return mejor as Sudoku;
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export default function GeneradorSudokusPage() {
  const [titulo, setTitulo] = useState('Sudoku');
  const [nivelId, setNivelId] = useState<NivelId>('medio');
  const [cantidad, setCantidad] = useState(2);
  const [simetrico, setSimetrico] = useState(true);
  const [semillaManual, setSemillaManual] = useState('');
  const [sudokus, setSudokus] = useState<Sudoku[]>([]);
  const [mostrarSoluciones, setMostrarSoluciones] = useState(false);
  const [generando, setGenerando] = useState(false);

  const nivel = NIVELES.find((n) => n.id === nivelId) ?? NIVELES[1];

  const generar = useCallback(() => {
    setGenerando(true);
    setMostrarSoluciones(false);

    // Se cede el hilo para que el aviso de «generando» llegue a pintarse
    window.setTimeout(() => {
      const base = Number(semillaManual.replace(/\D/g, ''));
      const raiz = base > 0 ? base : Math.floor(Math.random() * 900000) + 100000;
      const generados: Sudoku[] = [];

      for (let i = 0; i < cantidad; i++) {
        generados.push(generarSudoku(nivel, raiz + i * 7919, simetrico));
      }

      setSudokus(generados);
      setGenerando(false);
    }, 30);
  }, [nivel, cantidad, simetrico, semillaManual]);

  const claseCantidad =
    cantidad === 1 ? styles.rejillaUno : cantidad === 2 ? styles.rejillaDos : styles.rejillaCuatro;

  return (
    <div className={`${styles.container} ${impresion.lienzo}`}>
      <div className={impresion.noImprimir}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🔢</span> Generador de Sudokus por Dificultad
          </h1>
          <p className={styles.subtitle}>
            Solución única garantizada y niveles medidos por las técnicas que exige cada rejilla, no por
            el número de pistas.
          </p>
        </header>

        <LegalNotice />

        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">⚙️</span> Configura los sudokus
            </h2>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Título de la hoja</span>
              <input
                type="text"
                className={styles.input}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={50}
                placeholder="Sudoku"
              />
            </label>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Nivel</span>
              <div className={styles.grupoBotones} role="group" aria-label="Nivel de dificultad">
                {NIVELES.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`${styles.btnOpcion} ${nivelId === n.id ? styles.btnOpcionActivo : ''}`}
                    aria-pressed={nivelId === n.id}
                    onClick={() => setNivelId(n.id)}
                  >
                    <strong>{n.nombre}</strong>
                    <small>{n.detalle}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Sudokus por hoja</span>
              <div className={styles.chips} role="group" aria-label="Cantidad de sudokus">
                {[1, 2, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`${styles.chip} ${cantidad === n ? styles.chipActivo : ''}`}
                    aria-pressed={cantidad === n}
                    onClick={() => setCantidad(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.chip} ${simetrico ? styles.chipActivo : ''}`}
                  aria-pressed={simetrico}
                  onClick={() => setSimetrico(!simetrico)}
                >
                  Simetría rotacional
                </button>
              </div>
            </div>

            <label className={styles.campo}>
              <span className={styles.etiqueta}>Nº de sudoku (opcional)</span>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                value={semillaManual}
                onChange={(e) => setSemillaManual(e.target.value)}
                placeholder="Al azar"
                maxLength={7}
              />
            </label>

            <button type="button" className={styles.btnPrimary} onClick={generar} disabled={generando}>
              <span aria-hidden="true">{generando ? '⏳' : '✨'}</span>{' '}
              {generando ? 'Generando y comprobando unicidad…' : 'Generar sudokus'}
            </button>

            <p className={styles.pista}>
              Cada retirada de pista se verifica: si la rejilla admitiera dos soluciones, la pista vuelve
              a su sitio. Por eso la generación tarda un instante.
            </p>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">🧠</span> Qué exige cada rejilla
            </h2>

            {sudokus.length === 0 ? (
              <p className={styles.vacio}>
                Elige el nivel y pulsa <strong>Generar</strong>. Aquí aparecerá el desglose de técnicas
                necesarias para resolver cada sudoku.
              </p>
            ) : (
              <>
                <ul className={styles.listaAnalisis}>
                  {sudokus.map((sudoku, i) => (
                    <li key={i} className={styles.analisisItem}>
                      <div className={styles.analisisCabecera}>
                        <strong>Sudoku {i + 1}</strong>
                        <span className={styles.badgeNivel}>
                          {NIVELES.find((n) => n.id === sudoku.nivelReal)?.nombre}
                        </span>
                      </div>
                      <p className={styles.analisisDato}>
                        {sudoku.numPistas} pistas · n.º {sudoku.semilla}
                      </p>
                      <p className={styles.analisisTecnicas}>
                        {sudoku.nivelReal === 'experto'
                          ? 'No se resuelve con singles, pares ni reducciones: exige técnicas más avanzadas.'
                          : `Técnicas necesarias: ${sudoku.tecnicas
                              .map((t) => NOMBRES_TECNICA[t])
                              .join(', ')}.`}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className={styles.acciones}>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    aria-pressed={mostrarSoluciones}
                    onClick={() => setMostrarSoluciones(!mostrarSoluciones)}
                  >
                    <span aria-hidden="true">{mostrarSoluciones ? '🙈' : '💡'}</span>{' '}
                    {mostrarSoluciones ? 'Ocultar soluciones' : 'Ver soluciones'}
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={() => window.print()}>
                    <span aria-hidden="true">🖨️</span> Imprimir esta vista
                  </button>

                  <button type="button" className={styles.btnSecundario} onClick={generar}>
                    <span aria-hidden="true">🔄</span> Otros distintos
                  </button>
                </div>

                <p className={styles.pista}>
                  Si el nivel obtenido no coincide exactamente con el pedido es porque la rejilla resultó
                  ser de otra categoría al analizarla: se muestra el nivel real, no el solicitado.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Área imprimible */}
      {sudokus.length > 0 && (
        <div className={`${styles.printArea} ${impresion.hoja}`}>
          <h2 className={styles.tituloHoja}>{titulo || 'Sudoku'}</h2>

          <div className={`${styles.rejillaSudokus} ${claseCantidad}`}>
            {sudokus.map((sudoku, indice) => (
              <div key={indice} className={`${styles.bloqueSudoku} ${impresion.bloque}`}>
                <p className={styles.cabeceraSudoku}>
                  Sudoku {indice + 1} · {NIVELES.find((n) => n.id === sudoku.nivelReal)?.nombre} ·{' '}
                  {sudoku.numPistas} pistas
                </p>

                <table className={`${styles.tablaSudoku} ${impresion.rejilla}`}>
                  <caption className={styles.srOnly}>
                    Sudoku número {sudoku.semilla}, nivel{' '}
                    {NIVELES.find((n) => n.id === sudoku.nivelReal)?.nombre}, con {sudoku.numPistas}{' '}
                    pistas
                  </caption>
                  <tbody>
                    {Array.from({ length: 9 }, (_, fila) => (
                      <tr key={fila}>
                        {Array.from({ length: 9 }, (_, columna) => {
                          const celda = fila * 9 + columna;
                          const esPista = sudoku.pistas[celda] !== 0;
                          const valor = esPista
                            ? sudoku.pistas[celda]
                            : mostrarSoluciones
                              ? sudoku.solucion[celda]
                              : '';
                          const clases = [
                            esPista ? styles.celdaPista : styles.celdaVacia,
                            columna % 3 === 2 && columna !== 8 ? styles.bordeDerecho : '',
                            fila % 3 === 2 && fila !== 8 ? styles.bordeInferior : '',
                          ]
                            .filter(Boolean)
                            .join(' ');

                          return (
                            <td key={columna} className={clases}>
                              {valor}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <p className={styles.pieHoja}>
            {sudokus.map((s) => `n.º ${s.semilla}`).join(' · ')} ·{' '}
            {mostrarSoluciones ? 'CON SOLUCIONES' : 'para resolver'} · meskeia.com
          </p>
        </div>
      )}

      <div className={impresion.noImprimir}>
        <EducationalSection
          icon="📚"
          title="Qué hace difícil a un sudoku"
          subtitle="Por qué el número de pistas engaña, qué son las técnicas y cómo se garantiza la solución única"
        >
          <section className={styles.guideSection}>
            <h2>El mito del número de pistas</h2>
            <p>
              Casi todos los generadores clasifican los sudokus por cuántas casillas vienen rellenas, y es
              una medida engañosa. Una rejilla de 30 pistas puede resolverse entera aplicando la técnica
              más elemental, mientras que otra de 32 puede atascarse hasta que uno descubre un par oculto.
              Lo que determina la dificultad no es <em>cuántas</em> pistas hay, sino{' '}
              <strong>qué razonamiento hace falta</strong> para deducir la siguiente casilla.
            </p>
            <p>
              Por eso aquí cada rejilla generada se resuelve lógicamente antes de etiquetarla: se aplican
              las técnicas de menor a mayor complejidad y la más avanzada que resulte necesaria fija el
              nivel. Si el análisis no consigue terminar el sudoku con ninguna de ellas, la rejilla se
              clasifica como experto, porque exige métodos que ya no son de deducción directa.
            </p>

            <h2>Las técnicas, de la más simple a la más exigente</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Técnica</th>
                    <th>En qué consiste</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Single desnudo</strong>
                    </td>
                    <td>Una casilla solo admite un valor porque el resto ya están en su fila, columna o región</td>
                    <td>Fácil</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Single oculto</strong>
                    </td>
                    <td>Un valor solo cabe en una casilla de su fila, columna o región, aunque esa casilla admita más valores</td>
                    <td>Medio</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Par desnudo</strong>
                    </td>
                    <td>Dos casillas de una misma unidad admiten exactamente los mismos dos valores: esos valores quedan vetados en el resto</td>
                    <td>Difícil</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Candidatos apuntadores</strong>
                    </td>
                    <td>Dentro de una región, un valor solo puede ir en una fila o columna concreta: se elimina del resto de esa línea</td>
                    <td>Difícil</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Par oculto</strong>
                    </td>
                    <td>Dos valores solo caben en las mismas dos casillas: esas casillas se quedan solo con esos dos valores</td>
                    <td>Difícil</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Reducción caja-línea</strong>
                    </td>
                    <td>En una fila o columna, un valor solo cabe dentro de una región: se elimina del resto de esa región</td>
                    <td>Difícil</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>La regla que convierte una rejilla en sudoku</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    ☝️
                  </span>
                  <h3>Solución única, siempre</h3>
                </div>
                <p>
                  Un sudoku con dos soluciones no es un sudoku difícil, es un sudoku roto: obliga a
                  adivinar y no se puede corregir. Aquí, cada vez que se retira una pista se cuentan las
                  soluciones de la rejilla resultante, y si aparece más de una, la pista se devuelve.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    1️⃣7️⃣
                  </span>
                  <h3>El mínimo son 17</h3>
                </div>
                <p>
                  En 2012 se demostró por exploración exhaustiva que no existe ninguna rejilla de solución
                  única con 16 pistas o menos. Las de 17 son rarísimas y no especialmente difíciles: los
                  sudokus expertos habituales rondan las 22 a 26 pistas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">
                    🔄
                  </span>
                  <h3>Simetría rotacional</h3>
                </div>
                <p>
                  Es la convención estética de los sudokus de periódico: las pistas se retiran por parejas
                  opuestas respecto del centro. No afecta a la dificultad, solo al aspecto de la rejilla,
                  y puede desactivarse.
                </p>
              </div>
            </div>

            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué a veces sale un nivel distinto del que pedí?
                </h4>
                <p>
                  Porque el nivel no se decide de antemano: se comprueba después. El generador retira
                  pistas hasta la cantidad prevista y a continuación analiza la rejilla; si el resultado
                  cae en otra categoría, lo intenta de nuevo varias veces y, si ninguna acierta, muestra la
                  más próxima indicando su nivel real. Es preferible a mentir sobre la etiqueta.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Se puede resolver un sudoku experto sin adivinar?
                </h4>
                <p>
                  Sí, pero requiere técnicas que van más allá de las seis analizadas aquí: X-Wing,
                  espadas, cadenas de colores o el patrón XY. Todas son deducciones legítimas, no tanteo.
                  El ensayo y error solo es necesario en un puñado de rejillas extremas construidas
                  expresamente para resistir todo método conocido.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Por qué tarda un momento en generar?
                </h4>
                <p>
                  Porque cada retirada de pista exige resolver la rejilla completa buscando una segunda
                  solución, y eso se repite entre cuarenta y sesenta veces por sudoku. Después hay que
                  analizarlo con las seis técnicas para clasificarlo. Un generador que responde
                  instantáneamente casi siempre se está saltando la comprobación de unicidad.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>
                  <span aria-hidden="true">❓</span> ¿Cómo se corrige una hoja repartida a varias personas?
                </h4>
                <p>
                  Anotando el número de sudoku. Con ese número, el mismo nivel y los mismos ajustes se
                  regenera la rejilla idéntica y se activa la vista de soluciones, que sirve de plantilla
                  de corrección. Es la forma práctica de repartir el mismo pasatiempo a un grupo y
                  comprobar después quién lo terminó bien.
                </p>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">
                  ⚠️
                </span>
                <h3>Errores al resolver y al preparar sudokus</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Adivinar en cuanto uno se atasca:</strong> si hay solución única, siempre existe
                  una deducción disponible; el tanteo obliga a rehacer media rejilla cuando falla.
                </li>
                <li>
                  <strong>No anotar los candidatos:</strong> a partir del nivel medio, resolver de memoria
                  es inviable; escribir los posibles en pequeño es lo que permite ver los pares.
                </li>
                <li>
                  <strong>Fiarse del número de pistas para elegir dificultad:</strong> es la medida que peor
                  predice el esfuerzo real, y la que usa casi todo cuadernillo impreso.
                </li>
                <li>
                  <strong>Rellenar con bolígrafo:</strong> un error en una casilla se propaga en silencio y se
                  detecta veinte movimientos después, cuando ya no se puede deshacer.
                </li>
                <li>
                  <strong>Imprimir con las soluciones activadas:</strong> se imprime lo que hay en pantalla, así
                  que conviene revisar el botón antes de enviar la hoja.
                </li>
                <li>
                  <strong>Descartar un sudoku por difícil sin repasar las regiones:</strong> la mayoría de los
                  atascos de nivel medio se desbloquean mirando las regiones en lugar de las filas.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('generador-sudokus')} />

        <ShareCard appName="generador-sudokus" />

        <Footer appName="generador-sudokus" />
      </div>
    </div>
  );
}
