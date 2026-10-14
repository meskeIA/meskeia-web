'use client';
/**
 * Caso de prueba de la REGLA 2 de `scripts/check-a11y-jsx.mjs` dentro de una CADENA que se
 * pinta como hijo JSX (función `cadenaPintada`, cabo C0249).
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-emoji-cadena.tsx
 * Debe romper con CINCO casos de «emoji junto a texto» —los marcados DEBE CAZAR— y callar
 * en los demás.
 *
 * Vive fuera de `app/` a propósito, como `a11y-regla5.tsx`: no crea ninguna ruta ni entra en
 * los barridos del catálogo.
 */
import { useState } from 'react';

export default function Prueba() {
  const [isPlaying] = useState(false);
  const [copiado] = useState(false);
  const [n] = useState(3);
  const etiqueta = isPlaying ? '⏹️ Detener' : '▶️ Iniciar';   // NO: no se pinta aquí

  return (
    <div>
      {/* DEBE CAZAR ×2 — el caso de origen, literal de metronomo antes de e86a2a02 */}
      <button type="button">
        {isPlaying ? '⏹️ Detener' : '▶️ Iniciar'}
      </button>

      {/* DEBE CAZAR — a la derecha de un && */}
      <p>{copiado && '✅ Copiado'}</p>

      {/* DEBE CAZAR — plantilla con sustitución, dentro de un fragmento */}
      <>{`📋 ${n} copiados`}</>

      {/* DEBE CAZAR — ternario anidado entre paréntesis (solo la rama con texto) */}
      <span>{n > 2 ? ('🔥 Muchos') : n > 1 ? '2' : ''}</span>

      {/* NO — atributos: no son hijos */}
      <button type="button" title={copiado ? '✓ Copiado' : '📋 Copiar'} aria-label={isPlaying ? '⏹️ Detener' : '▶️ Iniciar'}>x</button>

      {/* NO — el padre no admite un <span> */}
      <select><option>{copiado ? '✓ Sí' : '❌ No'}</option></select>

      {/* NO — el padre ya está oculto */}
      <span aria-hidden="true">{copiado ? '✓ Sí' : '❌ No'}</span>

      {/* NO — solo emoji: eso es «emoji en nodo propio», de criterio */}
      <span>{copiado ? '✅' : '❌'}</span>

      {/* NO — ya corregido como fragmento */}
      <button type="button">{isPlaying ? <><span aria-hidden="true">⏹️</span> Detener</> : <><span aria-hidden="true">▶️</span> Iniciar</>}</button>

      {/* NO — una flecha del bloque U+2190–21FF es contenido, no emoji */}
      <span>{n > 1 ? '°C ↔ °F' : 'm ↔ ft'}</span>

      {/* NO — la cadena es la CONDICIÓN, no se pinta */}
      <span>{'⏹️ Detener' === etiqueta ? 'Sí' : 'No'}</span>

      {/* NO — variable: no se sigue */}
      <span>{etiqueta}</span>
    </div>
  );
}
