'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import styles from './ConversorBraille.module.css';

/**
 * Teclado braille de seis puntos para el sentido Braille → Texto (S0219, 21/10/2026).
 *
 * Hasta hoy ese sentido solo admitía PEGAR caracteres Unicode (⠁⠃⠉…), y quien tiene delante
 * un cartel, una etiqueta o una tarjeta en braille no tiene de dónde copiarlos. Dos formas de
 * escribir una celda:
 *   · Teclado físico, como una máquina Perkins: F D S son los puntos 1 2 3 y J K L los 4 5 6.
 *     Se pulsan A LA VEZ y la celda se escribe al soltar la última tecla. Se lee `e.code`, que
 *     es la POSICIÓN de la tecla y no la letra: en un teclado francés o alemán la mano va al
 *     mismo sitio, que es lo que importa en una Perkins.
 *   · Pantalla táctil o ratón: se marcan los puntos uno a uno y se pulsa «Escribir celda».
 *     Pulsar seis dedos a la vez en un móvil no es fiable, así que aquí no se intenta.
 */

const PUNTO_DE_TECLA: Record<string, number> = {
  KeyF: 1, KeyD: 2, KeyS: 3, KeyJ: 4, KeyK: 5, KeyL: 6,
};

/** Celda Unicode de un conjunto de puntos: U+2800 + bit (n − 1) de cada punto n. */
export function celdaDePuntos(puntos: Iterable<number>): string {
  let bits = 0;
  for (const p of puntos) bits |= 1 << (p - 1);
  return String.fromCodePoint(0x2800 + bits);
}

/** Puntos de una celda Unicode, en orden (⠇ → [1, 2, 3]). */
export function puntosDeCelda(celda: string): number[] {
  const bits = (celda.codePointAt(0) ?? 0x2800) - 0x2800;
  return [1, 2, 3, 4, 5, 6].filter((p) => bits & (1 << (p - 1)));
}

/** Orden de pintado de la celda: fila a fila, columna izquierda (1 2 3) y derecha (4 5 6). */
const ORDEN_VISUAL = [1, 4, 2, 5, 3, 6];

interface Props {
  /** Añade una celda (también la del espacio, U+2800) al final de la entrada. */
  onCelda: (celda: string) => void;
  /** Borra la última celda de la entrada. */
  onBorrar: () => void;
}

export default function TecladoBraille({ onCelda, onBorrar }: Props) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [acorde, setAcorde] = useState<Set<number>>(new Set());
  const [anuncio, setAnuncio] = useState('');
  const pulsadas = useRef<Set<string>>(new Set());
  const acordeRef = useRef<Set<number>>(new Set());

  const escribir = (celda: string) => {
    onCelda(celda);
    const puntos = puntosDeCelda(celda);
    setAnuncio(
      puntos.length === 0
        ? 'Espacio añadido'
        : `Celda ${celda} añadida, ${puntos.length === 1 ? 'punto' : 'puntos'} ${puntos.join('-')}`,
    );
  };

  const borrar = () => {
    onBorrar();
    setAnuncio('Última celda borrada');
  };

  const alternar = (punto: number) => {
    setMarcados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(punto)) nuevo.delete(punto);
      else nuevo.add(punto);
      return nuevo;
    });
  };

  const escribirMarcados = () => {
    if (marcados.size === 0) return;
    escribir(celdaDePuntos(marcados));
    setMarcados(new Set());
  };

  // Solo cuando el foco está en la propia zona: dentro de un botón, Espacio ya lo pulsa
  const alPulsar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.ctrlKey || e.metaKey || e.altKey) return;
    const punto = PUNTO_DE_TECLA[e.code];
    if (punto) {
      e.preventDefault();
      if (e.repeat) return;
      pulsadas.current.add(e.code);
      acordeRef.current.add(punto);
      setAcorde(new Set(acordeRef.current));
    } else if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat && acordeRef.current.size === 0) escribir('⠀');
    } else if (e.code === 'Backspace') {
      e.preventDefault();
      borrar();
    }
  };

  const alSoltar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!PUNTO_DE_TECLA[e.code]) return;
    pulsadas.current.delete(e.code);
    // La celda sale cuando se suelta la ÚLTIMA tecla del acorde, no la primera
    if (pulsadas.current.size === 0 && acordeRef.current.size > 0) {
      escribir(celdaDePuntos(acordeRef.current));
      acordeRef.current = new Set();
      setAcorde(new Set());
    }
  };

  // Si se pierde el foco con teclas pulsadas, el acorde se descarta en vez de quedar a medias
  const alSalir = () => {
    pulsadas.current.clear();
    acordeRef.current = new Set();
    setAcorde(new Set());
  };

  return (
    <div className={styles.teclado}>
      <p className={styles.tecladoTitulo}>Escribir braille con seis puntos</p>

      <div
        className={styles.tecladoZona}
        role="application"
        tabIndex={0}
        aria-label="Teclado braille. Pulsa a la vez F, D y S para los puntos 1, 2 y 3, y J, K y L para los puntos 4, 5 y 6. La celda se escribe al soltar. Espacio separa palabras y Retroceso borra la última celda."
        onKeyDown={alPulsar}
        onKeyUp={alSoltar}
        onBlur={alSalir}
        data-testid="zona-perkins"
      >
        <span className={styles.tecladoTeclas} aria-hidden="true">
          <kbd>F</kbd><kbd>D</kbd><kbd>S</kbd>
          <span className={styles.tecladoSeparador} />
          <kbd>J</kbd><kbd>K</kbd><kbd>L</kbd>
        </span>
        <span className={styles.tecladoAyuda}>
          Haz clic aquí y pulsa las teclas a la vez, como en una máquina Perkins
        </span>
        <div className={styles.brailleGrid} aria-hidden="true">
          {ORDEN_VISUAL.map((p) => (
            <div key={p} className={`${styles.brailleDot} ${acorde.has(p) ? styles.filled : ''}`} />
          ))}
        </div>
      </div>

      <div className={styles.tecladoTactil}>
        <div className={styles.tecladoPuntos} role="group" aria-label="Puntos de la celda">
          {ORDEN_VISUAL.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.tecladoPunto} ${marcados.has(p) ? styles.tecladoPuntoActivo : ''}`}
              aria-pressed={marcados.has(p)}
              aria-label={`Punto ${p}`}
              onClick={() => alternar(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className={styles.tecladoAcciones}>
          <button
            type="button"
            className={styles.exampleBtn}
            onClick={escribirMarcados}
            disabled={marcados.size === 0}
          >
            Escribir celda{marcados.size > 0 ? ` ${celdaDePuntos(marcados)}` : ''}
          </button>
          <button type="button" className={styles.exampleBtn} onClick={() => escribir('⠀')}>
            Espacio
          </button>
          <button type="button" className={styles.exampleBtn} onClick={borrar}>
            Borrar última
          </button>
        </div>
      </div>

      <p className={styles.tecladoAnuncio} aria-live="polite">{anuncio}</p>
    </div>
  );
}
