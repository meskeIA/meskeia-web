'use client';
/**
 * Caso de prueba de las MARCAS ✓ ✕ ✗ en la regla 2 de `scripts/check-a11y-jsx.mjs` (constante
 * `MARCA`). No son `Extended_Pictographic` (✔ y ✖ sí), y el candado no las veía.
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-marcas.tsx
 * Debe romper con CINCO casos de «emoji junto a texto» —los marcados DEBE CAZAR—, avisar de
 * UN «emoji en nodo propio» y callar en los demás.
 *
 * El caso de origen está copiado LITERAL de `app/espejo/page.tsx` antes de su reparación
 * (hallazgo 4755, cabo C0762, 15/11/2026): «✕ Salir» pasaba el candado en verde.
 *
 * Vive fuera de `app/` a propósito, como `a11y-banderas.tsx`: no crea ninguna ruta ni entra
 * en los barridos del catálogo.
 */
import { useState } from 'react';

export default function Prueba() {
  const [copiado] = useState(false);

  return (
    <div>
      {/* DEBE CAZAR — el caso de origen, literal de espejo */}
      <button type="button">
        ✕ Salir
      </button>

      {/* DEBE CAZAR — la marca de verificación y el aspa de «no» junto a texto */}
      <li>✓ Incluido en el plan</li>
      <li>✗ No incluido</li>

      {/* DEBE CAZAR ×2 — dentro de una cadena que se pinta, una por rama */}
      <p>{copiado ? '✓ Copiado' : '✕ Error al copiar'}</p>

      {/* AVISA — sola: decorativa o informativa, pide criterio */}
      <td>✓</td>

      {/* NO — ya corregido */}
      <button type="button"><span aria-hidden="true">✕</span> Salir</button>

      {/* NO — sola con nombre accesible: la excepción del CLAUDE.md §5 */}
      <button type="button" aria-label="Cerrar">✕</button>

      {/* NO — el signo de multiplicar es contenido, no una marca */}
      <p>3 × 4 = 12</p>
    </div>
  );
}
