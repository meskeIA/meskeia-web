'use client';
/**
 * Caso de prueba del emoji DELANTE DE UNA ETIQUETA en la regla 2 de `scripts/check-a11y-jsx.mjs`
 * (función `pegadoAEtiqueta`). En `<p>💡 <strong>Consejo:</strong> …</p>` el nodo de texto es
 * solo «💡 », así que el candado lo contaba como «emoji en nodo propio» (aviso de criterio) y no
 * como «emoji junto a texto», aunque el lector de pantalla lo lee pegado a «Consejo» igual.
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-emoji-etiqueta.tsx
 * Debe romper con SEIS casos de «emoji junto a texto» —los marcados DEBE CAZAR—, avisar de
 * CINCO «emoji en nodo propio» (el de `✅ <span>❌</span>` son dos) y callar en los demás.
 *
 * El caso de origen está copiado LITERAL de `app/conversor-colores/page.tsx` en d72c0c4ce: el
 * turno de noche del 04/10/2026 lo anotó en su acta (L1125 y L1190) como punto ciego del
 * candado, y el 14/10 se dejó «por ahora» como aviso. Se reparó a mano en be8a0e293 con la
 * misma corrección que pide la regla 2. Antes de este cambio, el fichero pasaba en verde.
 * Elegido como tema del turno de noche el 14/11/2026.
 *
 * Vive fuera de `app/` a propósito, como `a11y-banderas.tsx`: no crea ninguna ruta ni entra en
 * los barridos del catálogo.
 */
import { useState } from 'react';

export default function Prueba() {
  const [n] = useState(3);

  return (
    <div>
      {/* DEBE CAZAR — el caso de origen, literal de conversor-colores (d72c0c4ce) */}
      <p>
        💡 <strong>Solución:</strong> Si diseñas para impresión, trabaja en CMYK desde el inicio
      </p>

      {/* DEBE CAZAR — la forma más repetida del catálogo (faqTip, 131 veces) */}
      <p className="faqTip">💡 <strong>Clave:</strong> Los valores son estimaciones.</p>

      {/* DEBE CAZAR — en una lista, con el texto detrás de la etiqueta */}
      <ul><li>✈️ <strong>Transporte</strong>: vuelos, trenes, traslados.</li></ul>

      {/* DEBE CAZAR — sin espacio entre el emoji y la etiqueta */}
      <p>⚠️<strong>Atención:</strong> revisa los datos.</p>

      {/* DEBE CAZAR — con otra etiqueta de texto, <code> */}
      <p>📐 <code>a² + b² = c²</code></p>

      {/* DEBE CAZAR — emoji con ZWJ delante de un enlace */}
      <p>🧑‍🔬 <a href="/x/">Ver el experimento</a></p>

      {/* AVISA — el emoji está en su línea y la etiqueta en la siguiente: no se lee pegado
          por la forma del código, y puede ser un icono de bloque. Pide criterio */}
      <p>
        💡
        <strong>Clave</strong>
      </p>

      {/* AVISA — la etiqueta de detrás no tiene texto (otro emoji): pide criterio */}
      <p>✅ <span>❌</span></p>

      {/* AVISA — detrás va una expresión, no una etiqueta: queda fuera de esta regla */}
      <p>🔥 {n} días</p>

      {/* NO — ya corregido (be8a0e293) */}
      <p><span aria-hidden="true">💡</span> <strong>Solución:</strong> trabaja en CMYK.</p>

      {/* NO — el emoji con nombre accesible: la excepción del CLAUDE.md §5 */}
      <p><span role="img" aria-label="aprobado">✅</span> <strong>Sí</strong></p>

      {/* AVISA — detrás va un salto de línea autocerrado, no texto */}
      <p>💡 <br /></p>
    </div>
  );
}
