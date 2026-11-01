'use client';

import { useEffect } from 'react';

/**
 * Guardián de los deslizadores (`<input type="range">`) frente al dedo que solo quería bajar la
 * página.
 *
 * En un móvil, un gesto vertical que empieza sobre la pista de un deslizador hace dos cosas a la
 * vez: Blink lleva el pulgar al punto de contacto (y la app recalcula con ese valor) y la página
 * se desplaza. Quien va del control al resultado con el dedo cambia así un parámetro sin
 * enterarse, y en las apps sin «Restablecer» la única vuelta es recargar (hallazgo 3864,
 * simulador-potencial-accion: el umbral saltaba de −55 a −43 mV y ni la intensidad máxima
 * disparaba). Es comportamiento de la plataforma, así que vale para las ~260 apps con
 * deslizador, y por eso va aquí, montado una vez en `app/layout.tsx`, y no en cada app (cabo
 * C0559, opción A decidida por el usuario el 01/11/2026).
 *
 * Qué hace: anota el valor del deslizador al apoyar el dedo y, si el gesto termina siendo
 * vertical (más de `UMBRAL_VERTICAL` px y más vertical que horizontal), se lo devuelve al soltar,
 * con un evento `input` para que React se entere. El arrastre horizontal y el toque suelto (que
 * lleva el pulgar adonde se toca, como siempre) no cambian. El ratón y el teclado, tampoco: solo
 * escucha eventos táctiles.
 *
 * El valor se escribe con el setter del prototipo, no con `el.value = …`: React vigila la
 * propiedad del elemento, y si se escribe por ella da el cambio por suyo y no llama a `onChange`.
 *
 * Testigo: «desplazar la página con el dedo sobre el deslizador del umbral no cambia el umbral»
 * en tests/apps/simulador-potencial-accion.spec.ts (toques CDP a 360×640).
 */
const UMBRAL_VERTICAL = 10;

interface Gesto {
  deslizador: HTMLInputElement;
  valorInicial: string;
  x0: number;
  y0: number;
  vertical: boolean;
}

function deslizadorDe(objetivo: EventTarget | null): HTMLInputElement | null {
  if (!(objetivo instanceof Element)) return null;
  const el = objetivo.closest('input');
  if (!el || el.type !== 'range' || el.disabled) return null;
  // Un deslizador vertical (writing-mode, rotate) se maneja justo con el gesto vertical: fuera.
  const caja = el.getBoundingClientRect();
  return caja.height > caja.width ? null : el;
}

function devolverValor(deslizador: HTMLInputElement, valor: string): void {
  if (deslizador.value === valor) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (!setter) return;
  setter.call(deslizador, valor);
  deslizador.dispatchEvent(new Event('input', { bubbles: true }));
  deslizador.dispatchEvent(new Event('change', { bubbles: true }));
}

export default function GuardianDeslizadores(): null {
  useEffect(() => {
    let gesto: Gesto | null = null;

    // pointerdown llega antes que touchstart y antes de que Blink mueva el pulgar: es el último
    // momento en que el deslizador conserva el valor de antes del dedo.
    const alApoyar = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !e.isPrimary) return;
      const deslizador = deslizadorDe(e.target);
      gesto = deslizador
        ? { deslizador, valorInicial: deslizador.value, x0: e.clientX, y0: e.clientY, vertical: false }
        : null;
    };

    const alMover = (e: TouchEvent) => {
      if (!gesto || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - gesto.x0;
      const dy = e.touches[0].clientY - gesto.y0;
      if (Math.abs(dy) > UMBRAL_VERTICAL && Math.abs(dy) > Math.abs(dx)) gesto.vertical = true;
    };

    const alSoltar = () => {
      if (gesto?.vertical) devolverValor(gesto.deslizador, gesto.valorInicial);
      gesto = null;
    };

    const opciones = { capture: true, passive: true } as const;
    document.addEventListener('pointerdown', alApoyar, opciones);
    document.addEventListener('touchmove', alMover, opciones);
    document.addEventListener('touchend', alSoltar, opciones);
    document.addEventListener('touchcancel', alSoltar, opciones);
    return () => {
      document.removeEventListener('pointerdown', alApoyar, opciones);
      document.removeEventListener('touchmove', alMover, opciones);
      document.removeEventListener('touchend', alSoltar, opciones);
      document.removeEventListener('touchcancel', alSoltar, opciones);
    };
  }, []);

  return null;
}
