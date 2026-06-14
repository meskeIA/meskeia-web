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
import { formatNumber } from '@/lib';
import styles from './SimuladorArbolesBstAvl.module.css';

type TipoArbol = 'bst' | 'avl';
type EstadoNodo = 'normal' | 'camino' | 'nuevo' | 'desbalanceado' | 'eliminado' | 'encontrado';

interface NodoArbol {
  valor: number;
  izq: NodoArbol | null;
  der: NodoArbol | null;
  altura: number;
  estado?: EstadoNodo;
}

interface NodoPosicionado {
  valor: number;
  x: number;
  y: number;
  estado: EstadoNodo;
  factor: number;
  altura: number;
  padreX?: number;
  padreY?: number;
}

interface PresetArbol {
  id: string;
  titulo: string;
  descripcion: string;
  valores: number[];
}

const PRESETS: PresetArbol[] = [
  {
    id: 'ordenado',
    titulo: 'Inserción ordenada',
    descripcion: '1, 2, 3, 4, 5, 6, 7 — BST se degenera, AVL se equilibra',
    valores: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'rotacion-simple',
    titulo: 'Rotación simple (LL)',
    descripcion: '3, 2, 1 — provoca rotación derecha en AVL',
    valores: [3, 2, 1],
  },
  {
    id: 'rotacion-doble',
    titulo: 'Rotación doble (LR)',
    descripcion: '3, 1, 2 — provoca rotación izquierda-derecha en AVL',
    valores: [3, 1, 2],
  },
  {
    id: 'balanceado',
    titulo: 'Árbol balanceado',
    descripcion: '50, 30, 70, 20, 40, 60, 80 — base equilibrada',
    valores: [50, 30, 70, 20, 40, 60, 80],
  },
];

// ============================================================
//  LÓGICA DEL ÁRBOL (BST + AVL)
// ============================================================

function altura(n: NodoArbol | null): number {
  return n ? n.altura : 0;
}

function actualizarAltura(n: NodoArbol): void {
  n.altura = 1 + Math.max(altura(n.izq), altura(n.der));
}

function factorBalance(n: NodoArbol | null): number {
  if (!n) return 0;
  return altura(n.izq) - altura(n.der);
}

function rotarDerecha(y: NodoArbol): NodoArbol {
  const x = y.izq;
  if (!x) return y;
  const T2 = x.der;
  x.der = y;
  y.izq = T2;
  actualizarAltura(y);
  actualizarAltura(x);
  return x;
}

function rotarIzquierda(x: NodoArbol): NodoArbol {
  const y = x.der;
  if (!y) return x;
  const T2 = y.izq;
  y.izq = x;
  x.der = T2;
  actualizarAltura(x);
  actualizarAltura(y);
  return y;
}

function insertarBST(nodo: NodoArbol | null, valor: number): NodoArbol {
  if (!nodo) {
    return { valor, izq: null, der: null, altura: 1 };
  }
  if (valor < nodo.valor) {
    nodo.izq = insertarBST(nodo.izq, valor);
  } else if (valor > nodo.valor) {
    nodo.der = insertarBST(nodo.der, valor);
  }
  actualizarAltura(nodo);
  return nodo;
}

interface ResultadoAVL {
  raiz: NodoArbol;
  rotaciones: string[];
}

function insertarAVLConLog(
  nodo: NodoArbol | null,
  valor: number,
  log: string[]
): NodoArbol {
  if (!nodo) {
    return { valor, izq: null, der: null, altura: 1 };
  }
  if (valor < nodo.valor) {
    nodo.izq = insertarAVLConLog(nodo.izq, valor, log);
  } else if (valor > nodo.valor) {
    nodo.der = insertarAVLConLog(nodo.der, valor, log);
  } else {
    return nodo; // duplicado: ignorar
  }

  actualizarAltura(nodo);
  const fb = factorBalance(nodo);

  // LL: izquierda-izquierda
  if (fb > 1 && nodo.izq && valor < nodo.izq.valor) {
    log.push(`Rotación LL en nodo ${nodo.valor} (insertando ${valor})`);
    return rotarDerecha(nodo);
  }
  // RR: derecha-derecha
  if (fb < -1 && nodo.der && valor > nodo.der.valor) {
    log.push(`Rotación RR en nodo ${nodo.valor} (insertando ${valor})`);
    return rotarIzquierda(nodo);
  }
  // LR: izquierda-derecha
  if (fb > 1 && nodo.izq && valor > nodo.izq.valor) {
    log.push(`Rotación LR en nodo ${nodo.valor} (insertando ${valor})`);
    nodo.izq = rotarIzquierda(nodo.izq);
    return rotarDerecha(nodo);
  }
  // RL: derecha-izquierda
  if (fb < -1 && nodo.der && valor < nodo.der.valor) {
    log.push(`Rotación RL en nodo ${nodo.valor} (insertando ${valor})`);
    nodo.der = rotarDerecha(nodo.der);
    return rotarIzquierda(nodo);
  }
  return nodo;
}

function minNodo(n: NodoArbol): NodoArbol {
  let actual = n;
  while (actual.izq) actual = actual.izq;
  return actual;
}

function eliminarBST(nodo: NodoArbol | null, valor: number): NodoArbol | null {
  if (!nodo) return null;
  if (valor < nodo.valor) {
    nodo.izq = eliminarBST(nodo.izq, valor);
  } else if (valor > nodo.valor) {
    nodo.der = eliminarBST(nodo.der, valor);
  } else {
    if (!nodo.izq) return nodo.der;
    if (!nodo.der) return nodo.izq;
    const sucesor = minNodo(nodo.der);
    nodo.valor = sucesor.valor;
    nodo.der = eliminarBST(nodo.der, sucesor.valor);
  }
  actualizarAltura(nodo);
  return nodo;
}

function rebalancearAVL(nodo: NodoArbol, log: string[]): NodoArbol {
  actualizarAltura(nodo);
  const fb = factorBalance(nodo);

  if (fb > 1 && factorBalance(nodo.izq) >= 0) {
    log.push(`Rotación LL en nodo ${nodo.valor} (tras borrado)`);
    return rotarDerecha(nodo);
  }
  if (fb > 1 && factorBalance(nodo.izq) < 0 && nodo.izq) {
    log.push(`Rotación LR en nodo ${nodo.valor} (tras borrado)`);
    nodo.izq = rotarIzquierda(nodo.izq);
    return rotarDerecha(nodo);
  }
  if (fb < -1 && factorBalance(nodo.der) <= 0) {
    log.push(`Rotación RR en nodo ${nodo.valor} (tras borrado)`);
    return rotarIzquierda(nodo);
  }
  if (fb < -1 && factorBalance(nodo.der) > 0 && nodo.der) {
    log.push(`Rotación RL en nodo ${nodo.valor} (tras borrado)`);
    nodo.der = rotarDerecha(nodo.der);
    return rotarIzquierda(nodo);
  }
  return nodo;
}

function eliminarAVLConLog(
  nodo: NodoArbol | null,
  valor: number,
  log: string[]
): NodoArbol | null {
  if (!nodo) return null;
  if (valor < nodo.valor) {
    nodo.izq = eliminarAVLConLog(nodo.izq, valor, log);
  } else if (valor > nodo.valor) {
    nodo.der = eliminarAVLConLog(nodo.der, valor, log);
  } else {
    if (!nodo.izq || !nodo.der) {
      return nodo.izq ?? nodo.der;
    }
    const sucesor = minNodo(nodo.der);
    nodo.valor = sucesor.valor;
    nodo.der = eliminarAVLConLog(nodo.der, sucesor.valor, log);
  }
  return rebalancearAVL(nodo, log);
}

function buscarCamino(nodo: NodoArbol | null, valor: number): number[] {
  const camino: number[] = [];
  let actual = nodo;
  while (actual) {
    camino.push(actual.valor);
    if (valor === actual.valor) break;
    actual = valor < actual.valor ? actual.izq : actual.der;
  }
  return camino;
}

function existe(nodo: NodoArbol | null, valor: number): boolean {
  let actual = nodo;
  while (actual) {
    if (actual.valor === valor) return true;
    actual = valor < actual.valor ? actual.izq : actual.der;
  }
  return false;
}

// Recorridos
function inorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  inorden(nodo.izq, acc);
  acc.push(nodo.valor);
  inorden(nodo.der, acc);
  return acc;
}

function preorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  acc.push(nodo.valor);
  preorden(nodo.izq, acc);
  preorden(nodo.der, acc);
  return acc;
}

function postorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  postorden(nodo.izq, acc);
  postorden(nodo.der, acc);
  acc.push(nodo.valor);
  return acc;
}

function bfs(nodo: NodoArbol | null): number[] {
  if (!nodo) return [];
  const cola: NodoArbol[] = [nodo];
  const res: number[] = [];
  while (cola.length > 0) {
    const actual = cola.shift();
    if (!actual) break;
    res.push(actual.valor);
    if (actual.izq) cola.push(actual.izq);
    if (actual.der) cola.push(actual.der);
  }
  return res;
}

function contarNodos(nodo: NodoArbol | null): number {
  if (!nodo) return 0;
  return 1 + contarNodos(nodo.izq) + contarNodos(nodo.der);
}

// Layout: posicionar nodos en SVG
function calcularPosiciones(
  raiz: NodoArbol | null,
  caminoSet: Set<number>,
  resaltar: number | null,
  resaltarTipo: EstadoNodo
): { nodos: NodoPosicionado[]; ancho: number; alto: number } {
  if (!raiz) {
    return { nodos: [], ancho: 200, alto: 100 };
  }

  const nodos: NodoPosicionado[] = [];
  const espacioH = 50;
  const altoNivel = 70;
  let inordenIdx = 0;

  // Primer recorrido: asignar X según orden inorden, Y según profundidad.
  // Después calculamos relaciones padre-hijo en una segunda pasada.
  const posMap = new Map<number, { x: number; y: number }>();

  function asignarXY(nodo: NodoArbol | null, profundidad: number): void {
    if (!nodo) return;
    asignarXY(nodo.izq, profundidad + 1);
    const x = inordenIdx * espacioH + 30;
    const y = profundidad * altoNivel + 30;
    inordenIdx += 1;
    posMap.set(nodo.valor, { x, y });
    asignarXY(nodo.der, profundidad + 1);
  }
  asignarXY(raiz, 0);

  function recolectar(nodo: NodoArbol | null, padreVal: number | null): void {
    if (!nodo) return;
    const pos = posMap.get(nodo.valor);
    if (!pos) return;
    const padrePos = padreVal !== null ? posMap.get(padreVal) : undefined;
    let estado: EstadoNodo = 'normal';
    const fb = factorBalance(nodo);
    if (resaltar !== null && nodo.valor === resaltar) {
      estado = resaltarTipo;
    } else if (caminoSet.has(nodo.valor)) {
      estado = 'camino';
    } else if (Math.abs(fb) > 1) {
      estado = 'desbalanceado';
    }
    nodos.push({
      valor: nodo.valor,
      x: pos.x,
      y: pos.y,
      altura: nodo.altura,
      factor: fb,
      estado,
      padreX: padrePos?.x,
      padreY: padrePos?.y,
    });
    recolectar(nodo.izq, nodo.valor);
    recolectar(nodo.der, nodo.valor);
  }
  recolectar(raiz, null);

  const ancho = Math.max(200, inordenIdx * espacioH + 60);
  const alto = altura(raiz) * altoNivel + 60;

  return { nodos, ancho, alto };
}

// Deep clone simple
function clonar(n: NodoArbol | null): NodoArbol | null {
  if (!n) return null;
  return {
    valor: n.valor,
    altura: n.altura,
    izq: clonar(n.izq),
    der: clonar(n.der),
  };
}

// ============================================================
//  COMPONENTE
// ============================================================

export default function SimuladorArbolesBstAvl() {
  const [tipo, setTipo] = useState<TipoArbol>('avl');
  const [raiz, setRaiz] = useState<NodoArbol | null>(null);
  const [valorInsertar, setValorInsertar] = useState<string>('');
  const [valorEliminar, setValorEliminar] = useState<string>('');
  const [valorBuscar, setValorBuscar] = useState<string>('');
  const [valoresMultiples, setValoresMultiples] = useState<string>('');
  const [rotaciones, setRotaciones] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState<string>('');
  const [caminoActual, setCaminoActual] = useState<number[]>([]);
  const [resaltado, setResaltado] = useState<{ valor: number; tipo: EstadoNodo } | null>(null);
  const [velocidad, setVelocidad] = useState<number>(600);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const limpiarTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const handleInsertar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor) || valor < -999 || valor > 9999) {
        setMensaje('Valor fuera de rango. Introduce un número entero válido.');
        return;
      }
      const valorEntero = Math.trunc(valor);
      const arbolPrev = clonar(raiz);
      if (existe(arbolPrev, valorEntero)) {
        setMensaje(`El valor ${valorEntero} ya está en el árbol (no se permiten duplicados).`);
        return;
      }
      const log: string[] = [];
      let nuevaRaiz: NodoArbol;
      if (tipo === 'bst') {
        nuevaRaiz = insertarBST(arbolPrev, valorEntero);
      } else {
        nuevaRaiz = insertarAVLConLog(arbolPrev, valorEntero, log);
      }
      setRaiz(nuevaRaiz);
      setRotaciones((prev) => [...prev, ...log]);
      setResaltado({ valor: valorEntero, tipo: 'nuevo' });
      setMensaje(
        log.length > 0
          ? `Insertado ${valorEntero}. Se aplicaron ${log.length} rotación(es).`
          : `Insertado ${valorEntero}.`
      );
      // limpiar resaltado tras un tiempo
      const t = setTimeout(() => setResaltado(null), velocidad * 2);
      timeoutsRef.current.push(t);
    },
    [raiz, tipo, velocidad]
  );

  const handleEliminar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor)) {
        setMensaje('Valor inválido.');
        return;
      }
      const valorEntero = Math.trunc(valor);
      const arbolPrev = clonar(raiz);
      if (!existe(arbolPrev, valorEntero)) {
        setMensaje(`El valor ${valorEntero} no está en el árbol.`);
        return;
      }
      const log: string[] = [];
      let nuevaRaiz: NodoArbol | null;
      if (tipo === 'bst') {
        nuevaRaiz = eliminarBST(arbolPrev, valorEntero);
      } else {
        nuevaRaiz = eliminarAVLConLog(arbolPrev, valorEntero, log);
      }
      setRaiz(nuevaRaiz);
      setRotaciones((prev) => [...prev, ...log]);
      setMensaje(
        log.length > 0
          ? `Eliminado ${valorEntero}. Se aplicaron ${log.length} rotación(es).`
          : `Eliminado ${valorEntero}.`
      );
    },
    [raiz, tipo]
  );

  const handleBuscar = useCallback(
    (valor: number) => {
      if (!Number.isFinite(valor)) {
        setMensaje('Valor inválido.');
        return;
      }
      const valorEntero = Math.trunc(valor);
      const camino = buscarCamino(raiz, valorEntero);
      if (camino.length === 0) {
        setMensaje('Árbol vacío.');
        return;
      }
      limpiarTimeouts();
      // animar el camino paso a paso
      camino.forEach((v, idx) => {
        const t = setTimeout(() => {
          setCaminoActual(camino.slice(0, idx + 1));
        }, idx * velocidad);
        timeoutsRef.current.push(t);
      });
      // resaltado final
      const tFinal = setTimeout(() => {
        const ultimo = camino[camino.length - 1];
        if (ultimo === valorEntero) {
          setResaltado({ valor: valorEntero, tipo: 'encontrado' });
          setMensaje(
            `Encontrado ${valorEntero} tras ${camino.length} comparación(es). Profundidad: ${camino.length - 1}.`
          );
        } else {
          setMensaje(
            `${valorEntero} no está en el árbol. Búsqueda terminó tras ${camino.length} comparación(es).`
          );
        }
      }, camino.length * velocidad);
      timeoutsRef.current.push(tFinal);
      // limpiar tras 3s
      const tLimpiar = setTimeout(
        () => {
          setCaminoActual([]);
          setResaltado(null);
        },
        camino.length * velocidad + 2500
      );
      timeoutsRef.current.push(tLimpiar);
    },
    [raiz, velocidad, limpiarTimeouts]
  );

  const handleInsertarVarios = useCallback(() => {
    const numeros = valoresMultiples
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
    if (numeros.length === 0) {
      setMensaje('No se encontraron números válidos en el texto.');
      return;
    }
    let arbol = clonar(raiz);
    const logTotal: string[] = [];
    let insertados = 0;
    for (const n of numeros) {
      const valorEntero = Math.trunc(n);
      if (existe(arbol, valorEntero)) continue;
      if (tipo === 'bst') {
        arbol = insertarBST(arbol, valorEntero);
      } else {
        arbol = insertarAVLConLog(arbol, valorEntero, logTotal);
      }
      insertados += 1;
    }
    setRaiz(arbol);
    setRotaciones((prev) => [...prev, ...logTotal]);
    setMensaje(
      `Insertados ${insertados} de ${numeros.length} valores. Rotaciones aplicadas: ${logTotal.length}.`
    );
    setValoresMultiples('');
  }, [valoresMultiples, raiz, tipo]);

  const handleAleatorios = useCallback(() => {
    let arbol = clonar(raiz);
    const logTotal: string[] = [];
    const generados = new Set<number>();
    let intentos = 0;
    while (generados.size < 10 && intentos < 200) {
      const v = Math.floor(Math.random() * 99) + 1;
      if (!existe(arbol, v) && !generados.has(v)) {
        generados.add(v);
      }
      intentos += 1;
    }
    for (const v of generados) {
      if (tipo === 'bst') {
        arbol = insertarBST(arbol, v);
      } else {
        arbol = insertarAVLConLog(arbol, v, logTotal);
      }
    }
    setRaiz(arbol);
    setRotaciones((prev) => [...prev, ...logTotal]);
    setMensaje(`Se insertaron ${generados.size} valores aleatorios. Rotaciones: ${logTotal.length}.`);
  }, [raiz, tipo]);

  const handlePreset = useCallback(
    (preset: PresetArbol) => {
      let arbol: NodoArbol | null = null;
      const logTotal: string[] = [];
      for (const v of preset.valores) {
        if (tipo === 'bst') {
          arbol = insertarBST(arbol, v);
        } else {
          arbol = insertarAVLConLog(arbol, v, logTotal);
        }
      }
      setRaiz(arbol);
      setRotaciones(logTotal);
      setCaminoActual([]);
      setResaltado(null);
      setMensaje(
        `Cargado ejemplo "${preset.titulo}". Valores: ${preset.valores.join(', ')}. Rotaciones: ${logTotal.length}.`
      );
    },
    [tipo]
  );

  const handleLimpiar = useCallback(() => {
    limpiarTimeouts();
    setRaiz(null);
    setRotaciones([]);
    setCaminoActual([]);
    setResaltado(null);
    setMensaje('Árbol vaciado.');
  }, [limpiarTimeouts]);

  const handleCambiarTipo = useCallback(
    (nuevoTipo: TipoArbol) => {
      if (nuevoTipo === tipo) return;
      setTipo(nuevoTipo);
      // Si pasamos a AVL, rebalancear todos los nodos existentes
      if (nuevoTipo === 'avl' && raiz) {
        const valores = inorden(raiz, []);
        let arbol: NodoArbol | null = null;
        const logTotal: string[] = [];
        for (const v of valores) {
          arbol = insertarAVLConLog(arbol, v, logTotal);
        }
        setRaiz(arbol);
        setRotaciones(logTotal);
        setMensaje(
          `Cambiado a AVL. Árbol reconstruido y equilibrado con ${logTotal.length} rotación(es).`
        );
      } else {
        setMensaje(`Cambiado a ${nuevoTipo === 'bst' ? 'BST simple (sin balanceo)' : 'AVL auto-balanceado'}.`);
      }
    },
    [tipo, raiz]
  );

  // Recorridos calculados
  const recorridos = useMemo(() => {
    return {
      inorden: inorden(raiz, []),
      preorden: preorden(raiz, []),
      postorden: postorden(raiz, []),
      bfs: bfs(raiz),
    };
  }, [raiz]);

  // Posiciones
  const layout = useMemo(() => {
    const caminoSet = new Set(caminoActual);
    return calcularPosiciones(
      raiz,
      caminoSet,
      resaltado?.valor ?? null,
      resaltado?.tipo ?? 'normal'
    );
  }, [raiz, caminoActual, resaltado]);

  const numNodos = useMemo(() => contarNodos(raiz), [raiz]);
  const alturaArbol = useMemo(() => altura(raiz), [raiz]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Árboles BST y AVL</h1>
        <p className={styles.subtitle}>
          Inserta, elimina y busca nodos. Compara un árbol binario de búsqueda simple con un AVL
          auto-balanceado y observa las rotaciones LL, RR, LR y RL paso a paso.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector tipo de árbol */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Tipo de árbol</h2>
          <div className={styles.tipoSelector}>
            <button
              type="button"
              onClick={() => handleCambiarTipo('bst')}
              className={`${styles.tipoBtn} ${tipo === 'bst' ? styles.tipoActive : ''}`}
              aria-pressed={tipo === 'bst'}
            >
              <span className={styles.tipoNombre}>BST</span>
              <span className={styles.tipoDesc}>Árbol binario de búsqueda simple, sin balanceo automático</span>
            </button>
            <button
              type="button"
              onClick={() => handleCambiarTipo('avl')}
              className={`${styles.tipoBtn} ${tipo === 'avl' ? styles.tipoActive : ''}`}
              aria-pressed={tipo === 'avl'}
            >
              <span className={styles.tipoNombre}>AVL</span>
              <span className={styles.tipoDesc}>Auto-balanceado mediante rotaciones LL, RR, LR, RL</span>
            </button>
          </div>
        </section>

        {/* Operaciones */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Operaciones</h2>
          <div className={styles.opControls}>
            <div className={styles.opGroup}>
              <label htmlFor="ins-input">Insertar nodo</label>
              <div className={styles.opRow}>
                <input
                  id="ins-input"
                  type="number"
                  value={valorInsertar}
                  onChange={(e) => setValorInsertar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={styles.opBtn}
                  onClick={() => {
                    const v = Number(valorInsertar);
                    if (!Number.isNaN(v)) {
                      handleInsertar(v);
                      setValorInsertar('');
                    }
                  }}
                >
                  Insertar
                </button>
              </div>
            </div>

            <div className={styles.opGroup}>
              <label htmlFor="del-input">Eliminar nodo</label>
              <div className={styles.opRow}>
                <input
                  id="del-input"
                  type="number"
                  value={valorEliminar}
                  onChange={(e) => setValorEliminar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnDanger}`}
                  onClick={() => {
                    const v = Number(valorEliminar);
                    if (!Number.isNaN(v)) {
                      handleEliminar(v);
                      setValorEliminar('');
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className={styles.opGroup}>
              <label htmlFor="search-input">Buscar nodo</label>
              <div className={styles.opRow}>
                <input
                  id="search-input"
                  type="number"
                  value={valorBuscar}
                  onChange={(e) => setValorBuscar(e.target.value)}
                  placeholder="Ej: 42"
                  className={styles.opInput}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                  onClick={() => {
                    const v = Number(valorBuscar);
                    if (!Number.isNaN(v)) handleBuscar(v);
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className={styles.opGroup} style={{ marginBottom: '1rem' }}>
            <label htmlFor="multi-input">Insertar varios (separados por comas o espacios)</label>
            <textarea
              id="multi-input"
              value={valoresMultiples}
              onChange={(e) => setValoresMultiples(e.target.value)}
              placeholder="Ej: 50, 30, 70, 20, 40, 60, 80"
              className={styles.opTextarea}
            />
            <div className={styles.opRow} style={{ marginTop: '0.5rem' }}>
              <button type="button" className={styles.opBtn} onClick={handleInsertarVarios}>
                Insertar varios
              </button>
              <button
                type="button"
                className={`${styles.opBtn} ${styles.opBtnSecondary}`}
                onClick={handleAleatorios}
              >
                Aleatorios (10)
              </button>
              <button
                type="button"
                className={`${styles.opBtn} ${styles.opBtnDanger}`}
                onClick={handleLimpiar}
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </section>

        {/* Presets */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Ejemplos preconfigurados</h2>
          <div className={styles.presetGrid}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.presetBtn}
                onClick={() => handlePreset(p)}
              >
                <span className={styles.presetTitle}>{p.titulo}</span>
                <span className={styles.presetDesc}>{p.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Velocidad */}
        <div className={styles.speedControl}>
          <label htmlFor="vel-input">Velocidad animación:</label>
          <input
            id="vel-input"
            type="range"
            min="100"
            max="2000"
            step="100"
            value={velocidad}
            onChange={(e) => setVelocidad(Number(e.target.value))}
          />
          <span className={styles.speedValue}>
            {formatNumber(velocidad, 0)} ms
          </span>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={styles.statusMessage} role="status" aria-live="polite">
            <strong>Última operación:</strong> {mensaje}
          </div>
        )}

        {/* Visualización del árbol */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Visualización del árbol</h2>
          <div className={styles.arbolContainer}>
            {raiz === null ? (
              <span className={styles.arbolEmpty}>
                El árbol está vacío. Inserta valores para comenzar.
              </span>
            ) : (
              <svg
                className={styles.arbolSvg}
                viewBox={`0 0 ${layout.ancho} ${layout.alto}`}
                width={layout.ancho}
                height={layout.alto}
                role="img"
                aria-label="Visualización gráfica del árbol binario"
              >
                {/* Aristas primero (debajo de los nodos) */}
                {layout.nodos.map((n) => {
                  if (n.padreX === undefined || n.padreY === undefined) return null;
                  return (
                    <line
                      key={`arista-${n.valor}`}
                      x1={n.padreX}
                      y1={n.padreY}
                      x2={n.x}
                      y2={n.y}
                      className={styles.aristaLinea}
                    />
                  );
                })}
                {/* Nodos */}
                {layout.nodos.map((n) => {
                  let claseEstado = styles.nodoNormal;
                  if (n.estado === 'camino') claseEstado = styles.nodoCamino;
                  else if (n.estado === 'nuevo') claseEstado = styles.nodoNuevo;
                  else if (n.estado === 'desbalanceado') claseEstado = styles.nodoDesbalanceado;
                  else if (n.estado === 'eliminado') claseEstado = styles.nodoEliminado;
                  else if (n.estado === 'encontrado') claseEstado = styles.nodoEncontrado;
                  return (
                    <g key={`nodo-${n.valor}`}>
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={18}
                        className={`${styles.nodoCircle} ${claseEstado}`}
                      />
                      <text x={n.x} y={n.y} className={styles.nodoLabel}>
                        {n.valor}
                      </text>
                      {tipo === 'avl' && (
                        <text x={n.x + 22} y={n.y - 14} className={styles.factorBalance}>
                          {n.factor > 0 ? `+${n.factor}` : n.factor}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Info cards */}
          <div className={styles.infoLayout}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Número de nodos</span>
              <span className={styles.infoValue}>{formatNumber(numNodos, 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Altura del árbol</span>
              <span className={styles.infoValue}>{formatNumber(alturaArbol, 0)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Tipo</span>
              <span className={styles.infoValue}>
                {tipo === 'bst' ? 'BST' : 'AVL'}
              </span>
            </div>
          </div>
        </section>

        {/* Recorridos */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Recorridos del árbol</h2>
          <div className={styles.recorridosPanel}>
            <div className={styles.recorridoCard}>
              <div className={styles.recorridoNombre}>INORDEN (LNR)</div>
              <div className={styles.recorridoDescr}>Devuelve los valores en orden creciente</div>
              <div className={styles.recorridoLista}>
                {recorridos.inorden.length === 0 ? '—' : recorridos.inorden.join(', ')}
              </div>
            </div>
            <div className={styles.recorridoCard}>
              <div className={styles.recorridoNombre}>PREORDEN (NLR)</div>
              <div className={styles.recorridoDescr}>Útil para reconstruir el árbol o copiarlo</div>
              <div className={styles.recorridoLista}>
                {recorridos.preorden.length === 0 ? '—' : recorridos.preorden.join(', ')}
              </div>
            </div>
            <div className={styles.recorridoCard}>
              <div className={styles.recorridoNombre}>POSTORDEN (LRN)</div>
              <div className={styles.recorridoDescr}>Útil para liberar memoria y eliminar el árbol</div>
              <div className={styles.recorridoLista}>
                {recorridos.postorden.length === 0 ? '—' : recorridos.postorden.join(', ')}
              </div>
            </div>
            <div className={styles.recorridoCard}>
              <div className={styles.recorridoNombre}>POR NIVELES (BFS)</div>
              <div className={styles.recorridoDescr}>Recorrido en anchura, nivel por nivel</div>
              <div className={styles.recorridoLista}>
                {recorridos.bfs.length === 0 ? '—' : recorridos.bfs.join(', ')}
              </div>
            </div>
          </div>
        </section>

        {/* Log rotaciones */}
        {tipo === 'avl' && (
          <div className={styles.rotationLog}>
            <div className={styles.rotationLogTitle}>
              Historial de rotaciones AVL ({rotaciones.length})
            </div>
            {rotaciones.length === 0 ? (
              <div className={styles.rotationEmpty}>
                Aún no se ha realizado ninguna rotación. Prueba el ejemplo &ldquo;Inserción ordenada&rdquo;.
              </div>
            ) : (
              <ul className={styles.rotationList}>
                {rotaciones.slice(-15).map((r, idx) => (
                  <li key={`rot-${idx}-${r}`}>
                    <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>#{rotaciones.length - rotaciones.slice(-15).length + idx + 1}</span>{' '}
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      <EducationalSection
        title="Guía de Árboles BST y AVL"
        subtitle="Inserción, borrado y rotaciones de auto-balanceado"
      >
        <h3>BST vs AVL — Comparativa</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>BST simple</th>
                <th>AVL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Balanceo</td>
                <td>No (peor caso: lista)</td>
                <td>Auto-balanceado tras cada operación</td>
              </tr>
              <tr>
                <td>Altura en el peor caso</td>
                <td>O(n)</td>
                <td>O(log n) — siempre</td>
              </tr>
              <tr>
                <td>Búsqueda</td>
                <td>O(log n) promedio, O(n) peor caso</td>
                <td>O(log n) garantizado</td>
              </tr>
              <tr>
                <td>Inserción</td>
                <td>O(log n) promedio</td>
                <td>O(log n) + 1 o 2 rotaciones</td>
              </tr>
              <tr>
                <td>Borrado</td>
                <td>O(log n) promedio</td>
                <td>O(log n) + posibles rotaciones en cascada</td>
              </tr>
              <tr>
                <td>Memoria por nodo</td>
                <td>Valor + 2 punteros</td>
                <td>Valor + 2 punteros + altura (o factor balance)</td>
              </tr>
              <tr>
                <td>Cuándo usarlo</td>
                <td>Datos aleatorios, simplicidad</td>
                <td>Lecturas frecuentes, datos ordenados</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
              <strong>Índices de bases de datos</strong>
            </div>
            <div className={styles.escenarioExample}>
              Las bases de datos relacionales (PostgreSQL, MySQL, SQLite) usan árboles equilibrados
              (B-Tree, derivado de AVL) para indexar columnas y mantener búsquedas en O(log n) sobre
              millones de filas.
            </div>
            <div className={styles.escenarioTip}>
              Tip: un BST simple sobre IDs autoincrementales se degenera a lista — por eso siempre
              se usan árboles equilibrados.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
              <strong>Sistemas de archivos</strong>
            </div>
            <div className={styles.escenarioExample}>
              ext4, NTFS y Btrfs guardan los nombres de archivo de un directorio en árboles
              auto-balanceados para que listar y buscar archivos sea rápido aunque haya millones.
            </div>
            <div className={styles.escenarioTip}>
              Tip: por eso un directorio con 10.000 archivos no es 1.000 veces más lento que uno con 10.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
              <strong>Diccionarios y mapas ordenados</strong>
            </div>
            <div className={styles.escenarioExample}>
              std::map en C++, TreeMap en Java o std::collections::BTreeMap en Rust usan árboles
              equilibrados internamente. Permiten búsqueda, inserción e iteración ordenada en O(log n).
            </div>
            <div className={styles.escenarioTip}>
              Tip: si solo necesitas búsqueda y no orden, una tabla hash (HashMap) es más rápida en O(1) promedio.
            </div>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎮</span>
              <strong>Tablas de routing y autocompletado</strong>
            </div>
            <div className={styles.escenarioExample}>
              Routers de red, motores de autocompletado y editores de texto usan variantes de
              árboles balanceados para ofrecer respuestas en milisegundos sobre millones de entradas.
            </div>
            <div className={styles.escenarioTip}>
              Tip: en autocompletado moderno se prefieren tries (árboles de prefijos), pero la idea de balanceo es la misma.
            </div>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué un BST simple puede degenerarse?</h4>
            <p>
              Si insertas valores ya ordenados (1, 2, 3, 4, 5...), cada nuevo nodo se va siempre a
              la derecha. El árbol acaba siendo una lista enlazada con altura n y búsqueda O(n).
              Pruébalo con el ejemplo &ldquo;Inserción ordenada&rdquo; en modo BST y compara con AVL.
            </p>
            <p className={styles.faqTip}>
              Conclusión: los datos reales rara vez son aleatorios, así que en producción casi nunca se usa BST simple.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué es el factor de balance?</h4>
            <p>
              Para cada nodo: factor = altura(subárbol izquierdo) − altura(subárbol derecho).
              En un AVL siempre debe estar entre −1 y +1. Si llega a ±2, hay desbalanceo y se aplica una rotación.
            </p>
            <p className={styles.faqTip}>
              En el simulador verás el número junto a cada nodo (en modo AVL). +1 = ligeramente cargado a la izquierda.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo se hace una rotación doble (LR o RL)?</h4>
            <p>
              Cuando el desbalanceo está &ldquo;en zig-zag&rdquo;. Por ejemplo: insertas 3, después 1, después 2.
              El subárbol izquierdo de 3 está cargado a la derecha, así que primero se rota
              izquierda en el hijo y después derecha en el nodo desbalanceado. Es lo que llamamos LR.
            </p>
            <p className={styles.faqTip}>
              Regla mnemotécnica: las rotaciones dobles tienen dos letras (LR, RL) y siempre rotan
              primero en el hijo y después en el padre.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Diferencia entre AVL y árboles Red-Black?</h4>
            <p>
              Ambos están auto-balanceados. AVL es más estricto (factor balance entre −1 y +1):
              búsquedas más rápidas pero más rotaciones en inserciones/borrados. Red-Black permite
              algo más de desbalanceo: menos rotaciones, ideal cuando hay muchas escrituras.
            </p>
            <p className={styles.faqTip}>
              Java TreeMap, C++ std::map y el kernel de Linux usan Red-Black, no AVL.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué el borrado en AVL es más complejo?</h4>
            <p>
              Tras eliminar un nodo, el desbalanceo puede propagarse hacia arriba. Hay que recalcular
              factores de balance subiendo por el camino y aplicar rotaciones en cada nodo
              desbalanceado, no solo en el primero. Esto puede generar varias rotaciones en cadena.
            </p>
            <p className={styles.faqTip}>
              Pruébalo: carga el preset balanceado y elimina valores; observa rotaciones en cascada.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué recorrido devuelve los valores en orden creciente?</h4>
            <p>
              El recorrido inorden (izquierda → nodo → derecha). Es la propiedad clave de un BST:
              al recorrerlo en inorden, los valores salen ordenados de menor a mayor.
            </p>
            <p className={styles.faqTip}>
              Si inviertes hijos izquierdo y derecho en el recorrido, obtienes orden decreciente.
            </p>
          </div>
        </div>

        <h3>Cómo Insertar a Mano en AVL — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <strong>Inserta como en un BST normal</strong>
              <p>
                Compara el valor nuevo con el nodo actual. Si es menor, baja a la izquierda; si es
                mayor, baja a la derecha. Cuando llegues a una posición vacía, crea ahí el nuevo nodo.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <strong>Sube actualizando la altura de cada antecesor</strong>
              <p>
                Mientras vuelves recursivamente hacia la raíz, recalcula
                altura(nodo) = 1 + máx(altura(izq), altura(der)) en cada nodo del camino.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <strong>Comprueba el factor de balance</strong>
              <p>
                Calcula FB = altura(izq) − altura(der). Si está entre −1 y +1, todo bien: continúa subiendo.
                Si es +2 o −2, ese nodo está desbalanceado y hay que rotar.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <strong>Identifica el caso (LL, RR, LR o RL) y rota</strong>
              <p>
                FB = +2 y el valor entró en el subárbol izquierdo del hijo izquierdo → LL (rotación derecha).
                FB = −2 y entró en el derecho del derecho → RR (rotación izquierda). Si entró en
                zig-zag, aplica rotación doble (LR o RL).
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <strong>Devuelve la nueva raíz del subárbol</strong>
              <p>
                Tras una rotación, el nodo que estaba arriba ya no es la raíz del subárbol; lo es el
                que ocupa su sitio. Asegúrate de que el padre apunte al nuevo nodo, no al antiguo.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Compara siempre BST vs AVL con el mismo input</strong>
            <p>
              Carga un mismo preset primero en BST y después en AVL. Verás de un vistazo cómo las
              rotaciones aplanan el árbol y reducen su altura.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <strong>Almacena la altura, no el factor de balance</strong>
            <p>
              Es más fácil de actualizar y permite calcular el factor en O(1). El factor se deriva
              restando la altura de los hijos.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Implementa rotaciones como funciones puras</strong>
            <p>
              rotarDerecha(y) y rotarIzquierda(x) deben recibir un nodo y devolver la nueva raíz.
              No modifiques el padre dentro de la función: que el llamador asigne el resultado.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <strong>Prueba con secuencias adversariales</strong>
            <p>
              1, 2, 3, 4, 5... y 10, 9, 8, 7... son los casos peor para BST. Si tu AVL los maneja
              bien, las rotaciones están correctas.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚦</span>
            <strong>Usa recursión con cuidado en árboles grandes</strong>
            <p>
              Para árboles de millones de nodos, la recursión puede agotar la pila. Considera
              versiones iterativas con tu propia pila explícita.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>Si necesitas O(1) sin orden, usa hash</strong>
            <p>
              Los AVL son ideales cuando necesitas iteración ordenada o búsqueda por rangos.
              Si solo importa &ldquo;está o no está&rdquo;, una tabla hash es más rápida.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al implementar AVL</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Olvidar actualizar la altura del nodo antes de calcular el factor de balance.</li>
            <li>Asignar el resultado de la rotación a la variable equivocada (no devolver la nueva raíz).</li>
            <li>Confundir LR con RL: la rotación doble se nombra por la dirección de la inserción, no de las rotaciones.</li>
            <li>No rebalancear durante el borrado: solo se rebalancea durante la inserción (esto es incorrecto).</li>
            <li>Permitir duplicados sin decidir si van a izquierda o derecha (causa árboles inconsistentes).</li>
            <li>Comparar valores con == en lenguajes con tipos mixtos (siempre normalizar a número).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-arboles-bst-avl')} />
      <ShareCard appName="simulador-arboles-bst-avl" />
      <Footer appName="simulador-arboles-bst-avl" />
    </div>
  );
}
