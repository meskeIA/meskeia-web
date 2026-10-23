'use client';
/**
 * Caso de prueba de la REGLA 6 de `scripts/check-a11y-jsx.mjs` — `<label>` que no nombra nada.
 *
 * Comprobar con:  node scripts/check-a11y-jsx.mjs scripts/pruebas/a11y-label.tsx
 * Debe avisar de DOS casos —el del grupo de botones y el del input sin htmlFor— y callar en
 * los otros cuatro.
 *
 * Vive fuera de `app/` a propósito, como `a11y-regla5.tsx`.
 *
 * Los casos son literales de código real:
 *   · el del hallazgo 3235 (generador-loteria, antes de fddceea6), que motivó la regla
 *   · el de generador-qr, la forma más repetida del censo del cabo C0382
 *   · y cuatro formas correctas que la regla tiene que dejar pasar
 */
import { useState } from 'react';

function NumberInput({ id }: { id: string }) {
  return <input id={id} type="number" />;
}

export default function Prueba() {
  const [cantidad, setCantidad] = useState(1);
  const [url, setUrl] = useState('');

  return (
    <div>
      {/* DEBE AVISAR — rotula un grupo de botones (hallazgo 3235): role=group + aria-labelledby */}
      <label>Combinaciones a generar:</label>
      <div>
        {[1, 3, 5, 10].map((n) => (
          <button type="button" key={n} aria-pressed={cantidad === n} onClick={() => setCantidad(n)}>
            {n}
          </button>
        ))}
      </div>

      {/* DEBE AVISAR — delante de su input, sin htmlFor (generador-qr): htmlFor + id */}
      <label>URL del sitio web</label>
      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} />

      {/* NO debe avisar — con htmlFor */}
      <label htmlFor="cantidad">Cantidad</label>
      <input id="cantidad" type="number" />

      {/* NO debe avisar — el control va dentro */}
      <label>
        <input type="checkbox" /> Recordar
      </label>

      {/* NO debe avisar — un componente dentro puede ser el control: no se puede saber */}
      <label>
        Importe <NumberInput id="importe" />
      </label>

      {/* NO debe avisar — con id: es el rótulo de un aria-labelledby */}
      <label id="rotulo-modo">Modo</label>
      <div role="group" aria-labelledby="rotulo-modo" />
    </div>
  );
}
