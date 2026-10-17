'use client';

/**
 * components/ZonaHerramienta.tsx — marca la zona de la HERRAMIENTA de una app y registra, una
 * vez por carga, el primer uso real de sus controles (`evt:primer-uso`).
 *
 * Existe porque el analytics mide cuánto dura una visita, pero no si el usuario llegó a usar la
 * herramienta, y sin eso no se distingue un rebote satisfecho (calcula y se va en 20 s) de uno
 * frustrado (mira y se va sin tocar nada). Medido el 08/10/2026 sobre el dump: el 44,6 % de las
 * visitas dura 2-30 s, y la mitad de ellas menos de 10 s. Piloto en 7 apps: las cinco con más
 * rebote relativo entre simuladores y dos de control (`generador-tonos`, `tabla-valencias`).
 *
 * QUÉ CUENTA COMO USO, igual en todas las apps para que se puedan comparar:
 *   · escribir o cambiar un valor (`input`/`change`), con ratón, dedo o teclado;
 *   · pulsar un control (botón, input, select, label, pestaña, slider…) o el lienzo de un
 *     simulador (`canvas`/`svg`, donde se arrastra), salvo lo marcado `data-zona-estatica`;
 *     con el dedo cuenta al SOLTAR, no al posarlo (ver `esDedo`);
 *   · una tecla dentro de un control, salvo Tab/Mayús, que solo navegan.
 * NO cuenta: desplazarse, seleccionar texto, ni seguir un enlace (eso es irse, no usar).
 *
 * `display: contents` hace que el envoltorio no exista para la maquetación: los hijos siguen
 * siendo hijos del contenedor de la página a efectos de flex/grid. Los eventos de React suben
 * igual por él.
 *
 * Para leerlo (el `t` son los segundos desde la carga hasta el primer uso):
 *   SELECT json_extract(datos_adicionales,'$.app') app, COUNT(*) FROM uso_aplicaciones
 *   WHERE aplicacion = 'evt:primer-uso' GROUP BY app;
 * y se cruza por `sesion_id` con la visita de la app para saber cuánto duró.
 */

import type { ReactNode, SyntheticEvent, KeyboardEvent, PointerEvent } from 'react';
import { registrarEventoInteraccion } from '@/lib/trackingEvento';

interface Props {
  /** Slug de la app (el mismo que `appName` del Footer). */
  app: string;
  children: ReactNode;
}

const CONTROLES =
  'button, input, select, textarea, label, summary, canvas, svg, ' +
  '[role="button"], [role="slider"], [role="tab"], [role="checkbox"], [role="radio"], ' +
  '[role="switch"], [role="option"], [draggable="true"]';

/**
 * Lo que una app marca como NO usable aunque case con CONTROLES. Hallazgo 3353 (16/10/2026):
 * `svg` está en la lista porque en los simuladores es el lienzo donde se arrastra, pero en
 * simulador-puertas-logicas el «Símbolo» de la puerta es un dibujo estático y pulsarlo contaba
 * como uso. Se marca el elemento con `data-zona-estatica` en vez de sacar `svg` de la lista,
 * que dejaría sin medir los lienzos de las demás apps.
 */
const ESTATICO = '[data-zona-estatica]';

const TECLAS_DE_NAVEGACION = new Set(['Tab', 'Shift']);

/**
 * En táctil (y lápiz) el `pointerdown` salta al POSAR el dedo, antes de saber si el gesto es un
 * toque o un desplazamiento (hallazgo 3353): deslizar para bajar la página empezando sobre un
 * botón contaba como uso. Ahí se espera al `pointerup`, que no llega si el navegador se queda el
 * gesto para desplazar (manda `pointercancel`). Un arrastre en un lienzo con `touch-action: none`
 * sí termina en `pointerup`, así que sigue contando.
 */
const esDedo = (e: PointerEvent): boolean => e.pointerType === 'touch' || e.pointerType === 'pen';

export default function ZonaHerramienta({ app, children }: Props) {
  const registrar = () => {
    registrarEventoInteraccion('primer-uso', app, { t: Math.round(performance.now() / 1000) });
  };

  const alPulsar = (e: SyntheticEvent) => {
    const objetivo = e.target as Element | null;
    if (!objetivo?.closest) return;
    if (objetivo.closest('a[href]')) return;
    if (objetivo.closest(ESTATICO)) return;
    if (objetivo.closest(CONTROLES)) registrar();
  };

  const alBajarPuntero = (e: PointerEvent) => {
    if (esDedo(e)) return;
    alPulsar(e);
  };

  const alSoltarPuntero = (e: PointerEvent) => {
    if (!esDedo(e)) return;
    alPulsar(e);
  };

  const alTeclear = (e: KeyboardEvent) => {
    if (TECLAS_DE_NAVEGACION.has(e.key)) return;
    alPulsar(e);
  };

  return (
    <div
      data-zona-herramienta={app}
      style={{ display: 'contents' }}
      onInputCapture={registrar}
      onChangeCapture={registrar}
      onPointerDownCapture={alBajarPuntero}
      onPointerUpCapture={alSoltarPuntero}
      onKeyDownCapture={alTeclear}
    >
      {children}
    </div>
  );
}
