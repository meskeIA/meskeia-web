'use client';
/**
 * Caso de prueba de la REGLA 5 de `scripts/check-a11y-jsx.mjs` — `aria-pressed` en un botón
 * que no se puede despulsar.
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-regla5.tsx
 * Debe avisar de DOS casos —el del quiz y el de automatas— y callar en los otros dos.
 *
 * Vive fuera de `app/` a propósito: aquí no crea ninguna ruta ni entra en los barridos del
 * catálogo, y el candado lo analiza igual cuando se le pasa como fichero suelto.
 *
 * Los cuatro botones son literales de código real:
 *   · el del hallazgo 285 (quiz-simbolos-quimicos), que motivó la regla
 *   · el de simulador-automatas-celulares, que la regla encontró al estrenarse
 *   · el de simulador-tcp-handshake y el de comparador-tamanos-papel, conmutadores legítimos
 *     que la primera versión de la regla marcaba como falsos positivos
 */
import { useState } from 'react';

export default function Prueba() {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [animando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const opciones = ['a', 'b', 'c', 'd'];

  return (
    <div>
      {/* DEBE AVISAR — el caso de origen (hallazgo 285, quiz-simbolos-quimicos) */}
      {opciones.map((opcion) => (
        <button
          type="button"
          key={opcion}
          onClick={() => setSeleccionada(opcion)}
          disabled={seleccionada !== null}
          aria-pressed={seleccionada === opcion}
        >
          {opcion}
        </button>
      ))}

      {/* DEBE AVISAR — botón de acción con aria-pressed (simulador-automatas-celulares) */}
      <button
        type="button"
        onClick={() => setReproduciendo(true)}
        disabled={reproduciendo || opciones.length === 0}
        aria-pressed={reproduciendo}
      >
        Reproducir
      </button>

      {/* NO debe avisar — conmutador de verdad: pulsado, no está deshabilitado */}
      <button
        type="button"
        onClick={() => setAutoplay(!autoplay)}
        disabled={animando && !autoplay}
        aria-pressed={autoplay}
      >
        Autoplay
      </button>

      {/* NO debe avisar — se puede deseleccionar; el tope solo frena a los NO elegidos */}
      <button
        type="button"
        onClick={() => setSeleccionados([...seleccionados, 'x'])}
        disabled={!seleccionados.includes('x') && seleccionados.length >= 3}
        aria-pressed={seleccionados.includes('x')}
      >
        Comparar
      </button>
    </div>
  );
}
