/**
 * Motor del árbol binario de búsqueda (BST) y del AVL auto-balanceado.
 *
 * Vive aparte de la vista porque el build no puede ver mal un árbol: un SVG que dibuja
 * círculos unidos por líneas pasa cualquier compilación aunque la rotación esté al revés
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras sobre nodos.
 *
 * ── POR QUÉ ESTÁ AQUÍ Y NO EN `page.tsx` ──────────────────────────────────────
 *
 * Estas funciones estuvieron dentro de `page.tsx` hasta el 15/09/2026. Se MOVIERON —no se
 * copiaron— cuando la app ganó la sección «Casos para clase»: `casos.ts` corrige las
 * respuestas del alumno ejecutando exactamente este motor, de modo que la app no puede
 * suspender una respuesta que ella misma acaba de dibujar en el panel. Si hubiera dos
 * implementaciones, la divergencia sería invisible hasta que un alumno la sufriera.
 *
 * ── LOS CONVENIOS DE ESTA APP (no se cambian) ─────────────────────────────────
 *
 *   · La ALTURA se cuenta en NODOS, no en aristas: una hoja mide 1 y el árbol vacío mide 0.
 *     Es el convenio del panel y el de los enunciados de los casos.
 *   · `factorBalance(n) = altura(n.izq) − altura(n.der)`. Positivo ⇒ pesa la izquierda.
 *   · En la INSERCIÓN el caso de rotación se decide comparando el valor insertado con el del
 *     hijo: LL (fb > 1 y v < izq.valor) · RR (fb < −1 y v > der.valor) · LR (fb > 1 y
 *     v > izq.valor) · RL (fb < −1 y v < der.valor).
 *   · Un DUPLICADO no se inserta: `return nodo` y el árbol queda igual.
 *   · En el BORRADO de un nodo con dos hijos se sube el SUCESOR inorden, es decir el mínimo
 *     del subárbol derecho.
 *   · `rebalancearAVL` (tras borrado) decide por el factor de balance del HIJO, no por un
 *     valor insertado: ahí no hay valor nuevo con el que comparar.
 *
 * ⚠️ Las funciones de inserción y borrado MUTAN el nodo que reciben y devuelven la nueva
 * subraíz. Quien las use varias veces sobre el mismo árbol tiene que partir de una raíz
 * propia (`construirArbol` hace justo eso en `casos.ts`); compartir una raíz entre dos
 * cálculos contamina el segundo con el resultado del primero.
 */

export type EstadoNodo = 'normal' | 'camino' | 'nuevo' | 'desbalanceado' | 'eliminado' | 'encontrado';

export interface NodoArbol {
  valor: number;
  izq: NodoArbol | null;
  der: NodoArbol | null;
  altura: number;
  estado?: EstadoNodo;
}

export function altura(n: NodoArbol | null): number {
  return n ? n.altura : 0;
}

export function actualizarAltura(n: NodoArbol): void {
  n.altura = 1 + Math.max(altura(n.izq), altura(n.der));
}

export function factorBalance(n: NodoArbol | null): number {
  if (!n) return 0;
  return altura(n.izq) - altura(n.der);
}

export function rotarDerecha(y: NodoArbol): NodoArbol {
  const x = y.izq;
  if (!x) return y;
  const T2 = x.der;
  x.der = y;
  y.izq = T2;
  actualizarAltura(y);
  actualizarAltura(x);
  return x;
}

export function rotarIzquierda(x: NodoArbol): NodoArbol {
  const y = x.der;
  if (!y) return x;
  const T2 = y.izq;
  y.izq = x;
  x.der = T2;
  actualizarAltura(x);
  actualizarAltura(y);
  return y;
}

export function insertarBST(nodo: NodoArbol | null, valor: number): NodoArbol {
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

export interface ResultadoAVL {
  raiz: NodoArbol;
  rotaciones: string[];
}

export function insertarAVLConLog(
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

export function minNodo(n: NodoArbol): NodoArbol {
  let actual = n;
  while (actual.izq) actual = actual.izq;
  return actual;
}

export function eliminarBST(nodo: NodoArbol | null, valor: number): NodoArbol | null {
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

export function rebalancearAVL(nodo: NodoArbol, log: string[]): NodoArbol {
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

export function eliminarAVLConLog(
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

// Recorridos
export function inorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  inorden(nodo.izq, acc);
  acc.push(nodo.valor);
  inorden(nodo.der, acc);
  return acc;
}

export function preorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  acc.push(nodo.valor);
  preorden(nodo.izq, acc);
  preorden(nodo.der, acc);
  return acc;
}

export function postorden(nodo: NodoArbol | null, acc: number[]): number[] {
  if (!nodo) return acc;
  postorden(nodo.izq, acc);
  postorden(nodo.der, acc);
  acc.push(nodo.valor);
  return acc;
}

export function bfs(nodo: NodoArbol | null): number[] {
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

export function contarNodos(nodo: NodoArbol | null): number {
  if (!nodo) return 0;
  return 1 + contarNodos(nodo.izq) + contarNodos(nodo.der);
}


/**
 * Hojas del árbol: nodos sin ningún hijo.
 *
 * No existía en la vista —el panel no la enseña— y la pide la sección «Casos para clase».
 * Vive aquí, junto al resto del recuento, para que no acabe suelta dentro de `casos.ts` y
 * se convierta en una segunda definición de lo que es una hoja.
 */
export function contarHojas(nodo: NodoArbol | null): number {
  if (!nodo) return 0;
  if (!nodo.izq && !nodo.der) return 1;
  return contarHojas(nodo.izq) + contarHojas(nodo.der);
}
