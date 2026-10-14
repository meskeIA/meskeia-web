'use client';
/**
 * Caso de prueba de las BANDERAS en la regla 2 de `scripts/check-a11y-jsx.mjs` (constante
 * `BANDERA`). Una bandera no es `Extended_Pictographic`: es un par de indicadores regionales
 * (🇪🇸 = U+1F1EA U+1F1F8), y el candado no la veía.
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-banderas.tsx
 * Debe romper con SIETE casos de «emoji junto a texto» —los marcados DEBE CAZAR—, avisar de
 * UN «emoji en nodo propio» y callar en los demás.
 *
 * El caso de origen está copiado LITERAL de `app/calculadora-propinas/page.tsx` (14/10/2026):
 * el turno de noche del 03/10 lo dejó escrito en su acta («las banderas… el candado no las
 * marca»), y antes del cambio este fichero pasaba en verde.
 *
 * Vive fuera de `app/` a propósito, como `a11y-regla5.tsx`: no crea ninguna ruta ni entra en
 * los barridos del catálogo.
 */
import { useState } from 'react';

export default function Prueba() {
  const [pais] = useState('es');

  return (
    <div>
      {/* DEBE CAZAR ×3 — el caso de origen, literal de calculadora-propinas */}
      <h4>🇪🇸 España: 5-10%</h4>
      <h4>🇺🇸 Estados Unidos: 15-20%</h4>
      <h4>🇯🇵 Japón: 0%</h4>

      {/* DEBE CAZAR — también del caso de origen: un <option> no admite <span>, así que la
          salida es quitar la bandera del texto o dejar el escape con su razón */}
      <select><option value="es-10">🇪🇸 España (10%)</option></select>

      {/* DEBE CAZAR — bandera de subdivisión: 🏴 más etiquetas (U+E0067…U+E007F) */}
      <p>🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia</p>

      {/* DEBE CAZAR ×2 — dentro de una cadena que se pinta (cadenaPintada), una por rama */}
      <p>{pais === 'es' ? '🇪🇸 España' : '🇲🇽 México'}</p>

      {/* AVISA — solo bandera: decorativa o informativa, pide criterio */}
      <span>🇫🇷</span>

      {/* NO — ya corregido */}
      <h4><span aria-hidden="true">🇪🇸</span> España: 5-10%</h4>

      {/* NO — solo bandera con nombre accesible: la excepción del CLAUDE.md §5 */}
      <span role="img" aria-label="Francia">🇫🇷</span>

      {/* NO — letras mayúsculas normales: no son indicadores regionales */}
      <p>ES España · MX México</p>
    </div>
  );
}
