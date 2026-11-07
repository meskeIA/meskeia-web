/**
 * El año en curso para el «© AAAA» de los pies y del aviso legal (cabo C0666).
 *
 * Pintar `new Date().getFullYear()` en el render de un componente cliente rompe la hidratación
 * en cuanto el reloj del visitante va en otro año que el del build (Nochevieja y Año Nuevo antes
 * del primer build de enero, o un huso por delante de Madrid): el HTML prerenderizado lleva el
 * año del build, React lanza el error #418 y regenera el árbol en el cliente.
 *
 * Aquí la primera pasada, la de hidratar, deja el año del HTML tal cual (`suppressHydrationWarning`
 * vale para el texto del propio elemento) y, ya hidratado, el `key` cambia y React crea el span
 * nuevo con el año del navegador. Sin el `key` no bastaría: React ya cree que el texto es el del
 * cliente y no lo reescribe.
 */

'use client';

import { useSyncExternalStore } from 'react';

const suscribirNada = () => () => {};

export default function AnioActual() {
  const hidratado = useSyncExternalStore(suscribirNada, () => true, () => false);
  return (
    <span key={hidratado ? 'cliente' : 'servidor'} suppressHydrationWarning>
      {new Date().getFullYear()}
    </span>
  );
}
